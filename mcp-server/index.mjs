#!/usr/bin/env node
// ThothPay MCP server — exposes the x402-payable research endpoint
// (/api/agent/research) as a native tool for any MCP-compatible agent
// (Claude, Cursor, OpenCode, etc). Handles Gateway deposit, signing, and
// payment internally — the calling agent never sees any of the payment
// mechanics.
//
// Config (environment variables):
//   THOTHPAY_PRIVATE_KEY        required — your agent's own EVM wallet key.
//                                 Never ThothPay's; this wallet pays for calls.
//   THOTHPAY_RESEARCH_URL       optional — defaults to the production endpoint.
//   THOTHPAY_CHAIN              optional — defaults to 'celoMainnet'.
//   THOTHPAY_AUTO_DEPOSIT_USDC  optional — top-up amount when Gateway balance
//                                 runs low, defaults to '5.00'.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { GatewayClient } from '@circle-fin/x402-batching/client'
import { z } from 'zod'

const PRIVATE_KEY = process.env.THOTHPAY_PRIVATE_KEY || process.env.CITEFLOW_PRIVATE_KEY
const RESEARCH_URL = process.env.THOTHPAY_RESEARCH_URL || process.env.CITEFLOW_RESEARCH_URL || 'https://thothpay.xyz/api/agent/research'
const CHAIN = process.env.THOTHPAY_CHAIN || process.env.CITEFLOW_CHAIN || 'celoMainnet'
const AUTO_DEPOSIT_USDC = process.env.THOTHPAY_AUTO_DEPOSIT_USDC || '5.00'
// Celo mainnet's public RPC.
const RPC_URL = process.env.THOTHPAY_RPC_URL || process.env.CITEFLOW_RPC_URL || 'https://forno.celo.org'
const PRICE_PER_CALL_ATOMIC = 1_000_000n // $1.00 in USDC's 6-decimal base units — must match the server's declared price

if (!PRIVATE_KEY) {
  console.error('[thothpay-mcp] Missing THOTHPay_PRIVATE_KEY environment variable. Set it to your own EVM private key (never ThothPay\'s).')
  process.exit(1)
}

const client = new GatewayClient({ chain: CHAIN, privateKey: PRIVATE_KEY, rpcUrl: RPC_URL })

// Tops up the Gateway balance automatically so a first-time caller doesn't
// hit a confusing "insufficient balance" error before they've deposited.
async function ensureFunded() {
  const balances = await client.getBalances()
  if (balances.gateway.available < PRICE_PER_CALL_ATOMIC) {
    await client.deposit(AUTO_DEPOSIT_USDC)
  }
}

const server = new McpServer({ name: 'thothpay-research', version: '1.0.0' })

server.registerTool(
  'thothpay_research',
  {
    title: 'ThothPay Research',
    description:
      "Ask ThothPay's research agent a question and get a grounded, cited answer sourced from its registered article corpus. " +
      'Costs $1.00 USDC per call, paid automatically via x402/Circle Gateway from this tool\'s configured wallet — no human approval needed.',
    inputSchema: {
      query: z.string().min(5).describe('The research question to ask'),
    },
  },
  async ({ query }) => {
    try {
      await ensureFunded()
      const { data } = await client.pay(`${RESEARCH_URL}?q=${encodeURIComponent(query)}`)

      const sources = data.purchasedSources || []
      const citationSummary = sources.map((s) => `- ${s.title} (${s.url})`).join('\n')
      const text = citationSummary
        ? `${data.answer}\n\nSources cited (paid automatically):\n${citationSummary}`
        : data.answer

      return { content: [{ type: 'text', text }] }
    } catch (err) {
      return {
        content: [{ type: 'text', text: `ThothPay research failed: ${err.message}` }],
        isError: true,
      }
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
console.error('[thothpay-mcp] ThothPay MCP server running on stdio.')
