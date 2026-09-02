import { payCreatorUsdc, CELO_USDC } from './celo-treasury'

// ThothPay runs on Celo mainnet. Creator payouts and budget refunds are
// USDC transfers executed by the agent treasury wallet, each carrying the
// hackathon attribution tag (ERC-8021 data suffix) so the Value Moved
// leaderboard credits the volume.
//
// This module keeps the original function name/signature (executeGatewayTransfer)
// so the research agent and license route are unchanged, but the underlying
// rail is now a direct on-chain Celo USDC transfer instead of Circle's
// Developer-Controlled Wallets API.

export async function executeGatewayTransfer(destinationAddress: string, amountUsdc: string): Promise<string> {
  const amount = parseFloat(amountUsdc)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid transfer amount')
  }

  const txHash = await payCreatorUsdc(destinationAddress as `0x${string}`, amount)
  return txHash
}

export { CELO_USDC }
