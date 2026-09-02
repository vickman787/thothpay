// Manual smoke test that spawns the real MCP stdio server and calls its
// tool through the actual MCP protocol. Usage:
//   THOTHPAY_PRIVATE_KEY=0x... node mcp-smoke-test.mjs
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const PRIVATE_KEY = process.env.THOTHPAY_PRIVATE_KEY || process.env.CITEFLOW_PRIVATE_KEY

if (!PRIVATE_KEY) {
  console.error('Missing THOTHPAY_PRIVATE_KEY environment variable (a funded Celo Mainnet wallet key).')
  process.exit(1)
}

console.log('$ thothpay-mcp-smoke-test')
console.log('spawning: node index.mjs (real MCP stdio server, not a mock)')
console.log('')

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ['index.mjs'],
  env: {
    ...process.env,
    THOTHPAY_PRIVATE_KEY: PRIVATE_KEY,
  },
})

const client = new Client({ name: 'thothpay-smoke-test-client', version: '1.0.0' })
await client.connect(transport)

console.log('[1/2] listing tools exposed by the MCP server...')
const { tools } = await client.listTools()
for (const t of tools) console.log(`      - ${t.name}: ${t.description.slice(0, 70)}...`)

console.log('')
console.log('[2/2] calling thothpay_research over MCP protocol...')
const t0 = Date.now()
const result = await client.callTool(
  {
    name: 'thothpay_research',
    arguments: { query: 'What does ThothPay pay creators for?' },
  },
  undefined,
  { timeout: 180_000 } // settlement can take 60-100s+; the SDK's 60s default is too tight
)
const ms = Date.now() - t0

console.log(`      ✓ tool call completed in ${ms}ms, isError=${!!result.isError}`)
console.log('')
console.log('--- tool response ---')
for (const c of result.content) {
  if (c.type === 'text') console.log(c.text)
}
console.log('')
console.log(result.isError ? 'thothpay-mcp-smoke-test: FAIL' : 'thothpay-mcp-smoke-test: PASS')

await client.close()
process.exit(result.isError ? 1 : 0)
