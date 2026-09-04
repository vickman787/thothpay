import { createWalletClient, createPublicClient, http, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { celo } from "viem/chains"

const REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
const abi = parseAbi([
  "function setAgentURI(uint256 agentId, string agentURI) external",
])

// Bump the version query string to force 8004scan to re-fetch the agent card.
const VERSION = process.env.CARD_VERSION || "3"

const pk = process.env.PK
const account = privateKeyToAccount(pk)
const wallet = createWalletClient({ account, chain: celo, transport: http("https://forno.celo.org") })
const publicClient = createPublicClient({ chain: celo, transport: http("https://forno.celo.org") })

const uri = `https://raw.githubusercontent.com/vickman787/thothpay/main/agent-card.json?v=${VERSION}`

const hash = await wallet.writeContract({
  address: REGISTRY,
  abi,
  functionName: "setAgentURI",
  args: [9803n, uri],
})
console.log("tx:", hash)
const receipt = await publicClient.waitForTransactionReceipt({ hash })
console.log("status:", receipt.status)
console.log("uri:", uri)
