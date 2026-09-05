import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { createPublicClient, http, parseAbi } from 'viem'
import { celo } from 'viem/chains'
import { CELO_USDC, TREASURY_ADDRESS } from '@/lib/celo'
import { payCreatorUsdc } from '@/lib/payments/celo-treasury'
import type { Address } from 'viem'

const ERC20_ABI = parseAbi([
  'function balanceOf(address) returns (uint256)',
])

// Recovery for stranded payments: a user paid the treasury (on-chain) but the
// research session was never created (e.g. mobile browser lost the request
// after the wallet transfer). We can't enumerate arbitrary history cheaply, so
// this endpoint refunds transfers that the app *records* as unmatched. The
// frontend stores the txHash of any payment it made that didn't reach a
// session, and reports it here to reclaim the funds.
export async function POST(request: NextRequest) {
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await userClient
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single()
    if (!profile?.wallet_address) {
      return NextResponse.json({ error: 'No wallet on account' }, { status: 403 })
    }
    const myWallet = profile.wallet_address.toLowerCase()

    const body = await request.json()
    const txHashes: string[] = Array.isArray(body?.txHashes) ? body.txHashes : []

    const admin = createAdminClient()

    // Which of these already funded a session?
    const used = new Set<string>()
    if (txHashes.length > 0) {
      const { data: fundingRows } = await admin
        .from('audit_events')
        .select('details')
        .eq('event_type', 'funding_tx_used')
        .in('details->>txHash', txHashes)
      for (const r of fundingRows || []) used.add((r.details as any)?.txHash)
    }

    // Which were already refunded?
    const refunded = new Set<string>()
    if (txHashes.length > 0) {
      const { data: refundRows } = await admin
        .from('audit_events')
        .select('details')
        .eq('event_type', 'refund_issued')
        .in('details->>txHash', txHashes)
      for (const r of refundRows || []) refunded.add((r.details as any)?.txHash)
    }

    const results: any[] = []
    const publicClient = createPublicClient({ chain: celo, transport: http(process.env.CELO_RPC_URL || 'https://forno.celo.org') })

    for (const txHash of txHashes) {
      if (used.has(txHash)) { results.push({ txHash, status: 'used-by-session' }); continue }
      if (refunded.has(txHash)) { results.push({ txHash, status: 'already-refunded' }); continue }

      // Verify on-chain: was this a USDC transfer to the treasury from my wallet?
      const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` }).catch(() => null)
      if (!receipt || receipt.status !== 'success') {
        results.push({ txHash, status: 'not-confirmed' }); continue
      }
      const transferLog = receipt.logs.find((l) => l.address.toLowerCase() === CELO_USDC.toLowerCase())
      if (!transferLog) { results.push({ txHash, status: 'not-usdc-transfer' }); continue }
      const fromTopic = transferLog.topics[1]
      const toTopic = transferLog.topics[2]
      if (!fromTopic || !toTopic) { results.push({ txHash, status: 'malformed-transfer' }); continue }
      const from = `0x${fromTopic.slice(26)}`.toLowerCase()
      const to = `0x${toTopic.slice(26)}`.toLowerCase()
      if (from !== myWallet || to !== TREASURY_ADDRESS.toLowerCase()) {
        results.push({ txHash, status: 'not-my-payment' }); continue
      }
      const amount = Number(BigInt(transferLog.data)) / 1e6

      // Refund the full amount back to the payer.
      try {
        const refundTx = await payCreatorUsdc(from as Address, amount)
        await admin.from('audit_events').insert({
          event_type: 'refund_issued',
          details: { txHash, refundTx, amount, payer: from, reason: 'stranded-payment-recovery' },
        })
        results.push({ txHash, status: 'refunded', amount, refundTx })
      } catch (e: any) {
        results.push({ txHash, status: 'refund-failed', error: e.message })
      }
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Recover Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
