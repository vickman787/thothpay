import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import { TREASURY_ADDRESS, CELO_USDC } from '@/lib/celo'

const preflightSchema = z.object({
  query: z.string().min(5),
  maxBudget: z.number().min(0.01).max(100),
})

// Called BEFORE the user signs any USDC transfer. Proves the caller is
// authenticated and the request is valid, so a user never pays into a run
// that is going to be rejected for an auth/input error. The on-chain funding
// itself is verified after payment via the main /api/research route.
export async function POST(request: NextRequest) {
  try {
    const userClient = await createClient()
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please connect your wallet first.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = preflightSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
    }

    const { data: profile } = await userClient
      .from('profiles')
      .select('wallet_address')
      .eq('id', user.id)
      .single()

    if (!profile?.wallet_address) {
      return NextResponse.json({ error: 'No wallet on your account. Reconnect your wallet.' }, { status: 403 })
    }

    // Everything the client needs to pay: send USDC to the treasury, then
    // submit the txHash to /api/research.
    return NextResponse.json({
      ok: true,
      treasury: TREASURY_ADDRESS,
      usdc: CELO_USDC,
      wallet: profile.wallet_address,
    })
  } catch (error: any) {
    console.error('Preflight Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
