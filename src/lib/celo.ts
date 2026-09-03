import { createPublicClient, http, parseAbi, encodeFunctionData, type Address, type Hex } from "viem"
import { celo } from "viem/chains"

// Shared Celo mainnet constants. These are public by design — the treasury
// address is the agent's payout wallet and appears in every settlement.
export const CELO_USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as Address
export const TREASURY_ADDRESS =
  (process.env.AGENT_TREASURY_ADDRESS ||
    process.env.NEXT_PUBLIC_TREASURY_ADDRESS ||
    "0xcc4BCDD595Ee20cFB8A214Dc570eCB3Fb1C1d3A1") as Address
export const USDC_DECIMALS = 6n

// EIP-3085 chain parameters used to add/switch a wallet to Celo mainnet via
// wallet_addEthereumChain / wallet_switchEthereumChain.
export const CELO_CHAIN_PARAMS = {
  chainId: `0x${celo.id.toString(16)}`, // 0xa4ec = 42220
  chainName: "Celo Mainnet",
  nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
  rpcUrls: [process.env.NEXT_PUBLIC_CELO_RPC_URL || "https://forno.celo.org"],
  blockExplorerUrls: ["https://celoscan.io"],
}

export async function ensureCeloNetwork(ethereum: any) {
  if (!ethereum?.request) return
  try {
    // First try to switch; if the network isn't installed the wallet throws 4902.
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: CELO_CHAIN_PARAMS.chainId }],
    })
  } catch (switchError: any) {
    if (switchError?.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [CELO_CHAIN_PARAMS],
      })
    } else if (switchError?.code !== 4001) {
      // 4001 = user rejected; anything else that isn't "network missing" we surface.
      throw switchError
    }
  }
}

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) returns (uint256)",
])

export function usdcToAtomic(amountUsdc: number): bigint {
  return BigInt(Math.round(amountUsdc * Number(10n ** USDC_DECIMALS)))
}

// Calldata for a wallet to pay the treasury `amountUsdc` in native Celo USDC.
// Used client-side: the user signs this transfer from their own wallet, then
// the tx hash is verified on-chain before research runs.
export function buildUsdcTransferData(to: Address, amountUsdc: number): Hex {
  return encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, usdcToAtomic(amountUsdc)],
  })
}

export interface FundingTx {
  from: Address
  to: Address
  amountAtomic: bigint
  success: boolean
}

export async function getUsdcBalance(address: Address): Promise<number> {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(process.env.NEXT_PUBLIC_CELO_RPC_URL || "https://forno.celo.org"),
  })
  const balance = await publicClient.readContract({
    address: CELO_USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  })
  return Number(balance) / Number(10n ** USDC_DECIMALS)
}

// Reads a USDC Transfer event from a tx receipt. Returns null if the tx isn't
// a successful USDC transfer to the treasury.
export async function verifyFundingTx(txHash: Hex): Promise<FundingTx | null> {
  const publicClient = createPublicClient({
    chain: celo,
    transport: http(process.env.CELO_RPC_URL || "https://forno.celo.org"),
  })

  const receipt = await publicClient.getTransactionReceipt({ hash: txHash }).catch(() => null)
  if (!receipt || receipt.status !== "success") return null

  const transferLog = receipt.logs.find(
    (l) => l.address.toLowerCase() === CELO_USDC.toLowerCase()
  )
  if (!transferLog) return null

  // Transfer(address indexed from, address indexed to, uint256 value)
  const fromTopic = transferLog.topics[1]
  const toTopic = transferLog.topics[2]
  if (!fromTopic || !toTopic) return null
  const from = `0x${fromTopic.slice(26)}` as Address
  const to = `0x${toTopic.slice(26)}` as Address
  const amountAtomic = BigInt(transferLog.data)

  return { from, to, amountAtomic, success: true }
}

export function isFundingEligible(tx: FundingTx, budgetUsdc: number): boolean {
  if (!tx.success) return false
  if (tx.to.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) return false
  return tx.amountAtomic >= usdcToAtomic(budgetUsdc)
}
