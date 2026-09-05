import { NextRequest, NextResponse } from 'next/server'
import { runResearchAgent } from '@/lib/ai/research-agent'
import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { verifyFundingTx, isFundingEligible } from '@/lib/celo'
import { payCreatorUsdc } from '@/lib/payments/celo-treasury'
import type { Address } from 'viem'

const researchRequestSchema = z.object({
  query: z.string().min(5),
  maxBudget: z.number().min(0.01).max(100),
  txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
})

// Refunds the full verified payment back to the payer. Used when a session
// can't be created/run after the money already landed, so a failed attempt
// never strands funds.
async function refundFull(txHash: string, from: string, amount: number) {
  try {
    const tx = await payCreatorUsdc(from as Address, amount)
    const admin = createAdminClient()
    await admin.from('audit_events').insert({
      event_type: 'refund_issued',
      details: { txHash, refundTx: tx, amount, payer: from, reason: 'failed-before-session' },
    })
    console.error(`Auto-refunded ${amount} USDC (${txHash}) to ${from}: ${tx}`)
  } catch (e) {
    // Refund failure is logged loudly; a reconciliation sweep can re-issue it.
    console.error(`CRITICAL: auto-refund failed for ${txHash} -> ${from}:`, e)
    const admin = createAdminClient()
    await admin.from('audit_events').insert({
      event_type: 'refund_failed',
      details: { txHash, payer: from, amount, reason: String((e as any)?.message) },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Identify the caller from their Supabase session (set by wallet-login)
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please connect your wallet first.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = researchRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { query, maxBudget, txHash } = parsed.data

    // Verify the user actually paid the treasury: the txHash must be a
    // successful USDC transfer to the treasury for at least maxBudget.
    const funding = await verifyFundingTx(txHash as `0x${string}`)
    if (!funding) {
      return NextResponse.json(
        { error: 'Could not verify payment. Make sure the USDC transfer to the treasury has settled.' },
        { status: 402 }
      )
    }

    if (!isFundingEligible(funding, maxBudget)) {
      // The transfer exists but doesn't cover the requested budget. Refund the
      // full amount rather than leaving the payer's money stranded.
      await refundFull(txHash, funding.from, Number(funding.amountAtomic) / 1e6)
      return NextResponse.json(
        { error: `Payment does not cover the $${maxBudget.toFixed(2)} budget requested. Full amount refunded.` },
        { status: 402 }
      )
    }

    // Bind the payment to the authenticated user: only a wallet they have
    // proven ownership of (their profile wallet) can fund their own session.
    // Otherwise anyone could replay someone else's treasury transfer to get
    // free research at the real payer's expense.
    const { data: profile } = await userClient
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single()

    if (!profile?.wallet_address || profile.wallet_address.toLowerCase() !== funding.from.toLowerCase()) {
      await refundFull(txHash, funding.from, Number(funding.amountAtomic) / 1e6)
      return NextResponse.json(
        { error: 'Payment must come from the wallet connected to your account. Full amount refunded.' },
        { status: 403 }
      )
    }

    // Refund destination is the verified payer (their own wallet)
    const refundAddress = funding.from.toLowerCase()

    const supabase = createAdminClient()

    // Replay guard: each funding transaction can only fund one research session
    const { data: priorUse } = await supabase
      .from('audit_events')
      .select('id, details')
      .eq('event_type', 'funding_tx_used')
      .eq('details->>txHash', txHash)
      .limit(1)

    if (priorUse && priorUse.length > 0) {
      // Already funded a session: point the client at it instead of a bare 409.
      const sessionId = (priorUse[0].details as any)?.sessionId
      return NextResponse.json(
        sessionId
          ? { error: 'This payment already funded a research session', sessionId, status: 'resume' }
          : { error: 'This payment has already been used to fund a research session' },
        { status: 409 }
      )
    }

    // 1. Create a Research Session owned by the authenticated user
    const { data: session, error: sessionError } = await supabase
      .from('research_sessions')
      .insert({
        user_id: user.id,
        query,
        budget_usdc: maxBudget,
        status: 'active'
      })
      .select('id')
      .single()

    if (sessionError || !session) {
      console.error("Session creation error:", sessionError)
      await refundFull(txHash, funding.from, maxBudget)
      return NextResponse.json(
        { error: 'Failed to create research session. Full amount refunded.', details: sessionError?.message || "Unknown DB Error" },
        { status: 500 }
      )
    }

    await supabase.from('audit_events').insert({
      event_type: 'funding_tx_used',
      details: {
        txHash,
        sessionId: session.id,
        userId: user.id,
        amount: maxBudget,
        payer: refundAddress
      }
    })

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        const pushUpdate = (type: string, payload: any) => {
          controller.enqueue(encoder.encode(JSON.stringify({ type, payload }) + '\n'))
        }

        try {
          const result = await runResearchAgent(
            session.id,
            query,
            maxBudget,
            refundAddress,
            (msg) => pushUpdate('progress', msg)
          )

          // Mark session complete and save the result payload. Surface a
          // failure here instead of swallowing it — a silent error leaves the
          // session 'active' forever and the ledger stats read zero.
          const { error: completeError } = await supabase
            .from('research_sessions')
            .update({ status: 'completed', result: result })
            .eq('id', session.id)

          if (completeError) {
            console.error('Failed to mark research session completed:', completeError)
          }

          pushUpdate('done', { result, sessionId: session.id })
          controller.close()
        } catch (error: any) {
          pushUpdate('error', error.message)
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Research API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
