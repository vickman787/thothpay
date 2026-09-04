import crypto from 'crypto'
import { createAdminClient } from '@/utils/supabase/admin'
import { executeGatewayTransfer } from './celo-payouts'

// Server-side citation settlement. Called from the research agent AFTER the
// session's funding was verified on-chain (see /api/research). This runs with
// the service-role client, so it is never reachable as a public HTTP payout
// endpoint.
//
// Security notes:
//  - The recipient is ALWAYS resolved server-side from the source's verified
//    creator wallet. Callers can't name an arbitrary payout address.
//  - Daily treasury cap is enforced before any transfer.
export async function settleCitation(sessionId: string, sourceId: string, priceUsdc: number) {
  const admin = createAdminClient()

  // Resolve the creator's wallet from the source row itself.
  const { data: source, error: sourceError } = await admin
    .from('sources')
    .select('creator_profiles(profiles(wallet_address))')
    .eq('id', sourceId)
    .single()

  if (sourceError || !source) throw new Error('Source not found')

  const recipientWallet = (source as any).creator_profiles?.profiles?.wallet_address
  if (!recipientWallet) throw new Error('Creator has not configured a wallet address')

  // Daily treasury cap.
  const today = new Date().toISOString().split('T')[0]
  const { data: limits } = await admin
    .from('treasury_limits')
    .select('spent_today_usdc, daily_limit_usdc')
    .eq('date', today)
    .single()
  const spent = limits ? parseFloat(limits.spent_today_usdc ?? 0) : 0
  const cap = limits ? parseFloat(limits.daily_limit_usdc ?? 100) : 100
  if (spent + priceUsdc > cap) {
    throw new Error('Agent Treasury daily spending limit reached')
  }

  // Creator keeps 80%; 20% is the platform take-rate.
  const creatorPayout = (priceUsdc * 0.8).toFixed(6)

  const txHash = await executeGatewayTransfer(recipientWallet, creatorPayout)

  const authorizationId = `auth_${crypto.randomBytes(12).toString('hex')}`

  const { error: authError } = await admin.from('payment_authorizations').insert({
    session_id: sessionId,
    source_id: sourceId,
    authorization_id: authorizationId,
    amount_usdc: priceUsdc,
    status: 'settled',
  })
  if (authError) throw new Error(`Failed to record payment authorization: ${authError.message}`)

  const { error: settleError } = await admin.from('payment_settlements').insert({
    authorization_id: authorizationId,
    gateway_settlement_id: txHash,
    status: 'settled',
  })
  if (settleError) throw new Error(`Failed to record settlement: ${settleError.message}`)

  await admin
    .from('treasury_limits')
    .upsert(
      { date: today, spent_today_usdc: spent + priceUsdc, daily_limit_usdc: cap },
      { onConflict: 'date' }
    )

  const receiptPayload = `${sourceId}:${authorizationId}:${Date.now()}`
  const receiptSignature = crypto
    .createHmac('sha256', process.env.AUTH_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'thothpay-secret')
    .update(receiptPayload)
    .digest('hex')

  return {
    receipt: {
      payload: receiptPayload,
      signature: receiptSignature,
      gatewaySettlementId: txHash,
    },
  }
}
