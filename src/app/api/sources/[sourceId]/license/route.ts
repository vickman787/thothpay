import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sourceId: string }> }
) {
  try {
    const { sourceId } = await params
    const supabase = await createClient()

    // Find the source and its creator's wallet
    const { data, error } = await supabase
      .from('sources')
      .select('price_usdc, creator_id, creator_profiles(user_id, profiles(wallet_address))')
      .eq('id', sourceId)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 })
    }

    const source = data as any;
    const walletAddress = source.creator_profiles?.profiles?.wallet_address

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Creator has not configured a wallet address' },
        { status: 400 }
      )
    }

    // Return an HTTP 402 Payment Required-style response describing the licence
    return NextResponse.json(
      {
        message: 'Payment Required',
        amount: source.price_usdc,
        currency: 'USDC',
        recipient: walletAddress,
        network: 'celo-mainnet',
        paymentEndpoint: `/api/sources/${sourceId}/license`
      },
      { status: 402 }
    )
  } catch (error: any) {
    console.error('License GET Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST() {
  // Payouts are settled server-side by the research agent after on-chain
  // funding is verified (see src/lib/payments/settle-citation.ts). This route
  // is intentionally not a public payout endpoint — accepting arbitrary
  // source IDs here would let anyone drain the treasury.
  return NextResponse.json(
    { error: 'Citation payouts are executed server-side only' },
    { status: 403 }
  )
}
