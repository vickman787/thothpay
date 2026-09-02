import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

// ThothPay: budget-escrow bookkeeping. The actual on-chain transfers are
// executed by executeGatewayTransfer (now Celo USDC with the attribution tag);
// this module only records and enforces the budget limits in the database.

export async function authorizePayment(sessionId: string, sourceId: string, amountUsdc: number, recipientAddress: string) {
  const supabase = await createClient()

  // 1. Enforce Budget Limits
  const today = new Date().toISOString().split('T')[0]
  
  // Upsert today's treasury limit if it doesn't exist
  await supabase.from('treasury_limits').upsert({ date: today, daily_limit_usdc: 100.00 }, { onConflict: 'date' })
  
  const { data: limits, error: limitError } = await supabase
    .from('treasury_limits')
    .select('daily_limit_usdc, spent_today_usdc')
    .eq('date', today)
    .single()

  if (limitError || !limits) {
    throw new Error('Could not verify treasury limits')
  }

  if (parseFloat(limits.spent_today_usdc) + amountUsdc > parseFloat(limits.daily_limit_usdc)) {
    throw new Error('Agent Treasury daily spending limit reached')
  }

  const { data: session, error: sessionError } = await supabase
    .from('research_sessions')
    .select('budget_usdc')
    .eq('id', sessionId)
    .single()

  if (sessionError || !session) {
    throw new Error('Research session not found')
  }

  // Calculate spent in session so far
  const { data: auths } = await supabase
    .from('payment_authorizations')
    .select('amount_usdc')
    .eq('session_id', sessionId)
    
  const sessionSpent = auths?.reduce((acc, val) => acc + parseFloat(val.amount_usdc), 0) || 0

  if (sessionSpent + amountUsdc > parseFloat(session.budget_usdc)) {
    throw new Error('Research session budget exceeded')
  }

  // 2. Generate Internal Authorization
  // Since we are using Circle Developer-Controlled Wallets, the actual signing
  // and execution happens on Circle's servers during the Gateway phase.
  // We just generate an internal Cryptographic Authorization ID to hand to the agent.
  
  const authorizationId = `auth_${crypto.randomBytes(12).toString('hex')}`
  const nonce = `0x${crypto.randomBytes(32).toString('hex')}`
  const validAfter = Math.floor(Date.now() / 1000)
  const validBefore = validAfter + 3600 // Valid for 1 hour

  // 3. Record Authorization
  const { error: insertError } = await supabase
    .from('payment_authorizations')
    .insert({
      session_id: sessionId,
      source_id: sourceId,
      authorization_id: authorizationId,
      amount_usdc: amountUsdc,
      status: 'pending'
    })

  if (insertError) {
    throw new Error('Failed to record payment authorization')
  }

  // 4. Update daily spent
  await supabase
    .from('treasury_limits')
    .update({ spent_today_usdc: parseFloat(limits.spent_today_usdc) + amountUsdc })
    .eq('date', today)

  return {
    authorizationId,
    payload: {
      authorizationId,
      amount: amountUsdc.toString(),
      nonce,
      validAfter,
      validBefore
    }
  }
}
