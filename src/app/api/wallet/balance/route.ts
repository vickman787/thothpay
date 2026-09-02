import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http, parseAbi } from 'viem'
import { celo } from 'viem/chains'

const USDC = '0xcebA9300f2b948710d2653dD7B07f33A8B32118C' as const
const ERC20_ABI = parseAbi([
  'function balanceOf(address account) returns (uint256)',
  'function decimals() returns (uint8)',
])

// Reads a wallet's native USDC balance on Celo mainnet. Pure onchain read —
// no Circle, no custodial wallet.
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return NextResponse.json({ error: 'Missing or invalid address' }, { status: 400 })
  }

  try {
    const publicClient = createPublicClient({
      chain: celo,
      transport: http(process.env.CELO_RPC_URL || 'https://forno.celo.org'),
    })
    const balance = await publicClient.readContract({
      address: USDC,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    })
    return NextResponse.json({ address, balance: (Number(balance) / 1e6).toFixed(2) })
  } catch (error: any) {
    console.error('Balance read failed:', error)
    return NextResponse.json({ error: 'Failed to read balance' }, { status: 500 })
  }
}
