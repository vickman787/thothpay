import { createPublicClient, http } from "viem"

const c = createPublicClient({ transport: http("https://forno.celo.org") })
const usdc = "0xceba9300f2b948710d2653dd7b07f33a8b32118c"
const treasury = "0xcc4bcdd595ee20cfb8a214dc570ecb3fb1c1d3a1"

const latest = await c.getBlockNumber()
const CHUNK = 4500n
let all = []
for (let end = latest; end > latest - 18000n; end -= CHUNK) {
  const start = end - CHUNK + 1n
  const logs = await c.getLogs({ address: usdc, fromBlock: start, toBlock: end })
  all.push(...logs)
}

const rel = all.filter((l) => {
  const from = "0x" + (l.topics[1] || "").slice(26)
  const to = "0x" + (l.topics[2] || "").slice(26)
  return from === treasury || to === treasury
})

rel.sort((a, b) => Number(a.blockNumber - b.blockNumber))
console.log("treasury USDC transfers in last ~18k blocks:", rel.length)
for (const l of rel) {
  const from = "0x" + l.topics[1].slice(26)
  const to = "0x" + l.topics[2].slice(26)
  const amt = Number(BigInt(l.data)) / 1e6
  const dir = from === treasury ? "OUT" : "IN "
  const other = from === treasury ? to : from
  console.log(dir, amt.toFixed(6).padStart(10), other, "blk", l.blockNumber.toString(), l.transactionHash.slice(0, 12))
}
