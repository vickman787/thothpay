import { NextRequest, NextResponse } from 'next/server'
import { payCreatorUsdc, CELO_USDC } from './celo-treasury'

// ThothPay runs on Celo mainnet. Creator payouts and budget refunds are
// USDC transfers executed by the agent treasury wallet, each carrying the
// hackathon attribution tag (ERC-8021 data suffix) so the Value Moved
// leaderboard credits the volume.
//
// Keeps the original executeGatewayTransfer name/signature so the research
// agent and license route are unchanged, but the rail is now a direct Celo
// USDC transfer from the treasury wallet instead of a custodial API.

export async function executeGatewayTransfer(destinationAddress: string, amountUsdc: string): Promise<string> {
  const amount = parseFloat(amountUsdc)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid transfer amount')
  }

  const txHash = await payCreatorUsdc(destinationAddress as `0x${string}`, amount)
  return txHash
}

export { CELO_USDC }
