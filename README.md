# ThothPay

> **The research agent that pays its sources.**
> Ask a question. Get a grounded, cited answer. The creators behind it get paid — in stablecoins on Celo, automatically, the moment the citation happens.

**Live at [thothpay.xyz](https://www.thothpay.xyz)**

ThothPay is a Web3-native AI research agent built to solve a problem every AI product shares: **content creators are rarely compensated when an agent scrapes and synthesizes their work.** A researcher locks a budget, the agent grounds its answer only in registered, verified sources, and every source it actually cites gets paid on the spot — no subscriptions, no ad revenue splits, no invoices.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat&logo=supabase)
![Celo](https://img.shields.io/badge/Celo-Mainnet-35D07F?style=flat)
![ERC-8004](https://img.shields.io/badge/ERC--8004-Agent_ID-purple?style=flat)

## Celo Agents at Work hackathon

- **Primary track:** Value Moved
- **Attribution tag:** `celo_38d9e4de3b9f` (every payout carries it as an ERC-8021 data suffix)
- **ERC-8004 Agent ID:** [9803 on Celo](https://8004scan.io/agents/celo/9803)
- **Agent wallet (treasury):** `0xcc4BCDD595Ee20cFB8A214Dc570eCB3Fb1C1d3A1`

## How the money moves

1. **Budget escrow:** The researcher connects their own EVM wallet and sends an upfront budget (e.g. `$1.00 USDC`) to the treasury — one plain USDC transfer.
2. **Metered citation payments:** The agent evaluates registered, ownership-verified sources against the query. Every source it actually cites gets paid — the rest cost nothing.
3. **Platform fee:** A small percentage of each citation payment covers LLM inference and infrastructure.
4. **Refund of unspent budget:** Whatever wasn't paid out settles back to the researcher's wallet automatically.

Every on-chain transfer from the treasury is tagged with the hackathon attribution tag, so the Value Moved leaderboard credits it.

## ✨ Core Features

- **Creator ownership verification (hard gate):** Before anyone can register a source, they must prove control of it — domain, X, Medium, or Substack. Enforced by a database constraint, not application logic.
- **RAG via embeddings:** Registered sources are embedded and retrieved by relevance (`src/lib/ai/embeddings.ts`), not keyword match, so citation and payment are tied to what actually grounded the answer.
- **Multi-model LLM fallback:** Uses OpenAI first when `OPENAI_API_KEY` is configured, then falls back to Gemini and OpenRouter.
- **Live ledger:** A terminal-themed dashboard showing real-time budgets, citations, and payouts as they settle on-chain.

## 🛠️ Primitives for builders (open source)

- `src/lib/ai/research-agent.ts` — the LLM orchestration loop: evaluates source relevance, decides what to cite, and drives the payment ledger.
- `src/lib/payments/celo-treasury.ts` — Celo mainnet USDC transfers with ERC-8021 attribution tagging.
- `src/lib/verification/` — domain/social ownership verification used to gate source registration.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- A Supabase project (see `supabase/migrations/`)

### Environment Variables
Copy `.env.example` to `.env.local` and fill in your keys.

### Installation
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 📄 License
MIT License
