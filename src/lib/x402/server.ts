import { x402ResourceServer, x402HTTPResourceServer, type RoutesConfig, type FacilitatorClient } from '@x402/core/server'
import { BatchFacilitatorClient, GatewayEvmScheme } from '@circle-fin/x402-batching/server'

// ThothPay runs on Celo mainnet. Circle's Gateway facilitator settles USDC on
// Celo mainnet, and the buy-side uses the same Gateway batching SDK.
const facilitator = new BatchFacilitatorClient({
  url: 'https://gateway-api.circle.com',
}) as unknown as FacilitatorClient

const coreServer = new x402ResourceServer([facilitator])

// GatewayEvmScheme knows Celo mainnet's native USDC address internally, so a
// plain "$1.00" Money string works without a manual token lookup.
coreServer.register('eip155:42220', new GatewayEvmScheme())

const AGENT_TREASURY_ADDRESS = process.env.AGENT_TREASURY_ADDRESS || '0xcc4BCDD595Ee20cFB8A214Dc570eCB3Fb1C1d3A1'

const routes: RoutesConfig = {
  'GET /api/treasury/fund': {
    accepts: {
      scheme: 'exact',
      network: 'eip155:42220', // Celo mainnet
      payTo: AGENT_TREASURY_ADDRESS,
      price: '$0.50',
      maxTimeoutSeconds: 604800,
    },
    resource: '/api/treasury/fund',
    description: 'ThothPay treasury funding',
    mimeType: 'application/json',
  },
  'GET /api/agent/research': {
    accepts: {
      scheme: 'exact',
      network: 'eip155:42220', // Celo mainnet
      payTo: AGENT_TREASURY_ADDRESS,
      price: '$1.00',
      // Gateway-batching x402 clients hardcode a 30-day (2,592,000s) floor on
      // maxTimeoutSeconds for every batched payment they sign. Match it so
      // server and client stay in agreement.
      maxTimeoutSeconds: 2592000,
    },
    resource: '/api/agent/research',
    description: 'ThothPay grounded research answer, agent-payable via x402 on Celo',
    mimeType: 'application/json',
  },
}

const httpServer = new x402HTTPResourceServer(coreServer, routes)

let initialized: Promise<void> | null = null

export async function getX402Server() {
  if (!initialized) {
    initialized = httpServer.initialize()
  }
  await initialized
  return httpServer
}
