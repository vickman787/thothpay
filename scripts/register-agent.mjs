import { createWalletClient, http, parseAbi } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { celo } from "viem/chains"

const IDENTITY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"
const abi = parseAbi(["function register(string agentURI) returns (uint256)"])

const pk = process.env.PK
if (!pk) throw new Error("PK not set")
const account = privateKeyToAccount(pk)
const client = createWalletClient({ account, chain: celo, transport: http("https://forno.celo.org") })

const agentURI = process.env.AGENT_URI
if (!agentURI) throw new Error("AGENT_URI not set")

const hash = await client.writeContract({
  address: IDENTITY,
  abi,
  functionName: "register",
  args: [agentURI],
})
console.log("registration tx:", hash)
