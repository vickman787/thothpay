import { createWalletClient, createPublicClient, http, parseAbi, encodeFunctionData, type Address } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { celo } from "viem/chains"
import { toDataSuffix } from "@celo/attribution-tags"

// Celo mainnet (chain 42220). USDC is native on Celo.
export const CELO_CHAIN_ID = 42220
export const CELO_USDC = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as Address
export const ATTRIBUTION_TAG = process.env.ATTRIBUTION_TAG || "celo_38d9e4de3b9f"

const ERC20_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) returns (uint256)",
  "function decimals() returns (uint8)",
])

export function getTreasury() {
  const pk = process.env.TREASURY_PRIVATE_KEY || process.env.PK
  if (!pk) throw new Error("TREASURY_PRIVATE_KEY (or PK) is not set")
  const account = privateKeyToAccount(pk as `0x${string}`)
  const wallet = createWalletClient({ account, chain: celo, transport: http(process.env.CELO_RPC_URL || "https://forno.celo.org") })
  const publicClient = createPublicClient({ chain: celo, transport: http(process.env.CELO_RPC_URL || "https://forno.celo.org") })
  return { account, wallet, publicClient }
}

// Builds the calldata for a USDC transfer() carrying the ERC-8021 attribution
// tag as a data suffix, so the hackathon leaderboard credits the volume.
export function taggedTransferData(to: Address, amountUsdc: number): `0x${string}` {
  const decimals = 6n
  const amount = BigInt(Math.round(amountUsdc * Number(10n ** decimals)))
  const base = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
  })
  const suffix = toDataSuffix(ATTRIBUTION_TAG)
  return (base + suffix.slice(2)) as `0x${string}`
}

// The treasury signs many transfers in one request (payouts followed by a
// refund). viem auto-fetches the nonce per send, which can collide when two
// sends happen back-to-back, silently dropping the second transaction. A
// promise chain serializes every send and reserves the nonce explicitly so
// consecutive transfers can't race.
let sendQueue: Promise<unknown> = Promise.resolve()

export async function payCreatorUsdc(to: Address, amountUsdc: number): Promise<`0x${string}`> {
  const run = async (): Promise<`0x${string}`> => {
    const { account, wallet, publicClient } = getTreasury()
    const data = taggedTransferData(to, amountUsdc)

    let lastErr: unknown
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        // Read the account's current nonce directly instead of trusting the
        // client's cached value, then send with it explicitly. Retry with a
        // fresh nonce if the network rejects.
        const nonce = await publicClient.getTransactionCount({ address: account.address, blockTag: "pending" })
        const hash = await wallet.sendTransaction({ to: CELO_USDC, data, nonce })
        await publicClient.waitForTransactionReceipt({ hash })
        return hash
      } catch (err: any) {
        lastErr = err
        // Nonce too low / already known → the previous attempt likely landed;
        // re-read the nonce and try again rather than erroring out.
        if (err?.message && /nonce too low|already known|replacement/i.test(err.message)) {
          continue
        }
        // Any other error: pause briefly (RPC hiccup / rate limit) and retry.
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)))
      }
    }
    throw new Error(`USDC transfer failed after retries: ${(lastErr as any)?.message ?? "unknown"}`)
  }

  // Serialize: chain this send onto the previous one, then return its result.
  const result = sendQueue.then(run, run)
  sendQueue = result.catch(() => {})
  return result
}

export async function getUsdcBalance(address: Address): Promise<number> {
  const { publicClient } = getTreasury()
  const balance = await publicClient.readContract({
    address: CELO_USDC,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: [address],
  })
  return Number(balance) / 1e6
}
