import Link from 'next/link';
import { Droplet, FileText, Search, Wallet, Cpu, CheckCircle, Bot } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="flex-1 flex flex-col pt-12 pb-24 content-container max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-[var(--color-ink)]">
          Documentation
        </h1>
        <p className="text-lg text-[var(--color-soft-ink)] mb-8">
          Everything you need to know about using ThothPay, whether you are researching topics or registering your own intellectual property.
        </p>
      </div>

      <div className="space-y-16">
        
        {/* Section 1: Introduction */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-2">
            <Cpu className="text-[var(--color-olive)]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">What is ThothPay?</h2>
          </div>
          <div className="prose prose-lg text-[var(--color-ink)] font-sans leading-relaxed">
            <p>
              ThothPay is a decentralized AI research terminal designed to fix the creator compensation problem in generative AI. 
              Currently, AI models are trained on millions of articles, but the original authors receive no compensation when their work is used to generate answers.
            </p>
            <p>
              ThothPay changes this by introducing <strong>Pay-Per-Prompt Citations</strong>. When our AI agent synthesizes an answer using a registered knowledge base, it explicitly cites its sources and the ThothPay treasury instantly executes USDC nanopayments to the original creators on Celo Mainnet.
            </p>
          </div>
        </section>

        {/* Section 2: For Researchers */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-2">
            <Search className="text-[var(--color-olive)]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">For Researchers (Users)</h2>
          </div>
          <div className="space-y-8">
            
            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Wallet className="text-[var(--color-signal-green)]" size={20} />
                1. Connect any EVM Wallet
              </h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                ThothPay works with any standard EVM wallet — MetaMask, the Celo extension, Rabby, WalletConnect, and more. Your wallet address is your identity; there are no custodial accounts or seed phrases held by us.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Click <strong>Connect Wallet</strong> in the top navigation bar.</li>
                <li>Pick your wallet and approve the connection.</li>
                <li>Sign a free message to prove ownership — no transaction is sent.</li>
                <li>You are now authenticated! Your wallet address is your identity.</li>
              </ul>
            </div>

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Droplet className="text-blue-500" size={20} />
                2. Get USDC
              </h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                Research runs on Celo Mainnet, so you need USDC on Celo to pay for AI prompts.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Bridge or buy USDC on Celo Mainnet (network id 42220).</li>
                <li>Your wallet balance shows in the top navigation bar once connected.</li>
              </ul>
            </div>

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Search className="text-[var(--color-ink)]" size={20} />
                3. Ask the AI
              </h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                Once your wallet is funded, you can query the AI. You set a "Max Budget" for the prompt (e.g., $0.50). 
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Your wallet sends the budget as USDC to the ThothPay treasury — a plain transfer you sign once.</li>
                <li>The AI retrieves relevant articles from our vector database and writes an answer.</li>
                <li>Based on which articles were actually cited, the treasury settles the payment, distributing the exact citation fees to the respective authors.</li>
                <li>Anything unused is refunded straight back to your wallet.</li>
              </ul>
            </div>

          </div>
        </section>

        {/* Section 3: For Creators */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-2">
            <FileText className="text-[var(--color-olive)]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">For Creators (Authors)</h2>
          </div>
          
          <div className="space-y-8">
            <div className="bg-[var(--color-paper)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">1. Universal Identity (EVM Wallet)</h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                There are no separate "user" or "creator" accounts, and absolutely no passwords. Your EVM wallet is your entire identity. The moment you connect your wallet via the navbar, our backend automatically maps your address to your creator profile. You never have to manually configure payment settings!
              </p>
            </div>

            <div className="bg-[var(--color-paper)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">2. Verify Ownership (Required Before Registering)</h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                Before you can register an article, you must prove you actually control where it lives. This exists so nobody else can register your work and collect the citation payments meant for you — ThothPay will not create a source from a domain or platform handle you haven&apos;t verified, full stop.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Open the <strong>Verify Ownership</strong> panel on your Dashboard — it shows a unique verification code tied to your account.</li>
                <li>Prove control of a <strong>domain</strong> (add a meta tag or a <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">/.well-known/thothpay.txt</code> file with the code), an <strong>X</strong> account (post the code in a tweet), a <strong>Medium</strong> profile, or a <strong>Substack</strong> — then paste the link back into the panel.</li>
                <li>Once verified, that identity is <strong>permanently and exclusively yours</strong> — enforced at the database level, not just in the UI. You can then register any article on that domain or handle without repeating this step.</li>
                <li>You can verify as many domains and platforms as you actually own; there&apos;s no limit.</li>
              </ul>
            </div>

            <div className="bg-[var(--color-paper)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">3. Registering Articles</h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                Navigate to the <strong>Register Work</strong> page. Here, you can upload the contents of your research, blog posts, or intellectual property.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Provide the Title, URL, and the full content of your article.</li>
                <li>Set your own <strong>Citation Price</strong> in USDC (e.g., $0.10 per citation).</li>
                <li>Your content is chunked, embedded into our Vector Database, and made available to the AI agent.</li>
              </ul>
            </div>

            <div className="bg-[var(--color-paper)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">4. Tracking Earnings</h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                The <strong>Dashboard</strong> provides a live view of your intellectual property. 
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>View all your registered articles.</li>
                <li>See exactly how many times each article has been cited by the AI.</li>
                <li>Watch your USDC balance grow in real-time as users interact with the network.</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 4: For Agents & Developers (x402) */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-2">
            <Bot className="text-[var(--color-signal-green)]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">For Agents &amp; Developers (x402 API)</h2>
          </div>
          <div className="space-y-8">

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <p className="text-[var(--color-soft-ink)] mb-4">
                ThothPay can also be called directly by other autonomous agents — no ThothPay account, API key, or PIN prompt. The
                <code className="mx-1 px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">/api/agent/research</code>
                endpoint speaks the <a href="https://x402.org" target="_blank" rel="noopener noreferrer" className="text-[var(--color-signal-green)] underline">x402</a> protocol: send a request with no payment and it returns an HTTP <strong>402</strong> challenge; retry with a signed, gasless payment authorization and it settles the payment and returns a grounded, cited answer in one round trip.
              </p>
            </div>

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">Direct SDK requirements</h3>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Any standard EVM keypair — this isn&apos;t tied to Circle&apos;s wallet product; a plain private key works.</li>
                <li>USDC and a small amount of native CELO gas on <strong>Celo Mainnet</strong>.</li>
                <li>For direct SDK integrations, a <strong>one-time on-chain deposit</strong> into Circle&apos;s Gateway Wallet contract is required. Holding USDC alone isn&apos;t enough — it must be deposited into Gateway before any signed authorization can spend it. This step costs gas; every payment after it is gasless. The MCP integration performs this deposit automatically when needed.</li>
                <li>The <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">@circle-fin/x402-batching</code> client library (or any client that implements Circle Gateway&apos;s batched signing scheme).</li>
              </ul>
            </div>

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-border-subtle)] rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3">Try it from scratch</h3>
              <p className="text-[var(--color-soft-ink)] mb-4 text-sm">
                A complete, standalone example — no ThothPay code required. Run these in an empty folder:
              </p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`mkdir ThothPay-test && cd ThothPay-test
npm init -y
npm install @circle-fin/x402-batching`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm">
                Save this as <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">test-x402.mjs</code> in that folder — the <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">.mjs</code> extension runs it as ESM without needing to edit <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">package.json</code>:
              </p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`import { GatewayClient } from '@circle-fin/x402-batching/client'

const client = new GatewayClient({
  chain: 'celoMainnet',
  privateKey: '0xYOUR_PRIVATE_KEY',
  rpcUrl: 'https://forno.celo.org',
})

await client.deposit('1.00') // one-time, funds your Gateway balance

const { data } = await client.pay(
  'https://thothpay.xyz/api/agent/research?q=' +
    encodeURIComponent('your research question here')
)

console.log(data.answer)            // grounded, cited answer
console.log(data.purchasedSources)  // which creators just got paid`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm">
                Replace <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">0xYOUR_PRIVATE_KEY</code> and <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">&apos;your research question here&apos;</code> with your own values first — the script will still run and settle payment even if you forget, it just comes back with a response explaining no real question was asked, instead of an error.
              </p>
              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm">Then run it:</p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`node test-x402.mjs`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-4 text-sm">
                Each call is a fixed <strong>$1.00 USDC</strong> budget. Whatever isn&apos;t spent on citations is refunded back to the paying wallet — the same refund mechanism used for human researchers. Citation payments to creators are executed exactly as they are for human researchers too, regardless of which side paid.
              </p>
            </div>

            <div className="bg-[var(--color-panel)] p-6 border border-[var(--color-signal-green)]/40 rounded shadow-sm">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                <Bot className="text-[var(--color-signal-green)]" size={20} />
                Even easier: MCP integration
              </h3>
              <p className="text-[var(--color-soft-ink)] mb-4">
                If your agent runs on <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer" className="text-[var(--color-signal-green)] underline">MCP</a> (Claude, Codex, Antigravity, OpenCode, Cursor, or your own agent framework), you don&apos;t need to write any x402 signing code at all. We publish a small, self-contained MCP server — <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">mcp-server/</code> in the ThothPay repo — that exposes the endpoint as a single tool: <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">thothpay_research</code>. It handles the Gateway deposit, signing, and payment internally; your agent just calls the tool with a question.
              </p>
              <p className="text-[var(--color-soft-ink)] mt-2 mb-4 text-sm bg-[var(--color-rust)]/10 border border-[var(--color-rust)]/30 rounded p-3">
                <strong>Set a longer tool-call timeout.</strong> A real call settles an on-chain payment and typically takes 60–100+ seconds. Most MCP clients default to a 60-second tool-call timeout, right at the edge of that, so calls will intermittently fail with a timeout error even though nothing is wrong. Set your client&apos;s per-server timeout to at least 3 minutes; the exact field is shown for each client below.
              </p>
              <p className="text-[var(--color-soft-ink)] mb-4 text-sm">Setup:</p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`git clone https://github.com/vickman787/thothpay
cd thothpay/mcp-server
npm install
export THOTHPAY_PRIVATE_KEY=0xYOUR_PRIVATE_KEY`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm">Then point your MCP client at it, e.g. in Claude Desktop&apos;s config:</p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`{
  "mcpServers": {
    "thothpay": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.mjs"],
      "timeout": 180000,
      "env": {
        "THOTHPAY_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY",
        "THOTHPAY_RESEARCH_URL": "https://thothpay.xyz/api/agent/research"
      }
    }
  }
}`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-2 text-xs">
                <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded">THOTHPAY_RESEARCH_URL</code> is actually optional — it already defaults to this production endpoint — but it&apos;s shown explicitly here so the example is copy-pasteable as-is.
              </p>
              <p className="text-[var(--color-soft-ink)] mt-4 text-sm">
                Restart your client and ask it to research something — it calls <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">thothpay_research</code> on its own when relevant. The MCP server auto-deposits into Gateway the first time it needs to, so there&apos;s no manual Gateway deposit step. You only need USDC and a little CELO for gas on Celo Mainnet for that automatic deposit. Full details in <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">mcp-server/README.md</code>.
              </p>

              <h4 className="text-base font-bold mt-8 mb-3">Works the same with Codex, Antigravity, and OpenCode</h4>
              <p className="text-[var(--color-soft-ink)] mb-4 text-sm">
                Same server, same tool — CLI, IDE extension, or desktop app all work. Only the config format and location differ, since each client is a separate, independently-built product.
              </p>

              <p className="text-[var(--color-soft-ink)] mb-2 text-sm"><strong>Claude Code</strong> (CLI or VS Code extension) uses the identical <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">.mcp.json</code> format shown above — same file, same shape, whether it&apos;s the desktop app, CLI, or extension.</p>

              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm"><strong>Codex</strong> (CLI or IDE extension — they share one config) uses TOML, not JSON, at <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">~/.codex/config.toml</code>:</p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`[mcp_servers.thothpay]
command = "node"
args = ["/absolute/path/to/mcp-server/index.mjs"]
tool_timeout_sec = 180

[mcp_servers.ThothPay.env]
THOTHPAY_PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"
THOTHPAY_RESEARCH_URL = "https://thothpay.xyz/api/agent/research"`}
              </pre>

              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm"><strong>Antigravity</strong> (desktop app or CLI) uses the same JSON shape as Claude, but a different file — global config at <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">~/.gemini/config/mcp_config.json</code>, or workspace-local at <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">.agents/mcp_config.json</code>. In the desktop app you can also add it via <strong>MCP Servers → Manage MCP Servers → View raw config</strong> instead of editing the file directly. If Antigravity exposes a per-server timeout setting, set it to at least 3 minutes for the same reason as above.</p>
              <p className="text-[var(--color-soft-ink)] mt-2 text-sm bg-[var(--color-rust)]/10 border border-[var(--color-rust)]/30 rounded p-3">
                <strong>One gotcha specific to Antigravity:</strong> adding the server isn&apos;t enough on its own — it also has a separate permissions screen (<strong>MCP Tools</strong>) where tools must be explicitly allowed before the agent can call them. If the tool connects but calls silently do nothing, add an <strong>Allow</strong> rule for <code className="px-1 py-0.5 bg-[var(--color-panel-deep)] rounded">thothpay_research</code> there.
              </p>

              <p className="text-[var(--color-soft-ink)] mt-4 mb-2 text-sm"><strong>OpenCode</strong> (CLI) uses <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">opencode.json</code> or <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">opencode.jsonc</code>, either globally at <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">~/.config/opencode/opencode.jsonc</code> or project-local in your working directory (project-local is the one OpenCode reliably picks up):</p>
              <pre className="bg-[var(--color-panel-deep)] border border-[var(--color-border-subtle)] rounded p-4 overflow-x-auto text-sm font-mono text-[var(--color-ink)]">
{`{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "thothpay-research": {
      "type": "local",
      "command": ["node", "/absolute/path/to/mcp-server/index.mjs"],
      "enabled": true,
      "timeout": 180000,
      "environment": {
        "THOTHPAY_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY"
      }
    }
  }
}`}
              </pre>
              <p className="text-[var(--color-soft-ink)] mt-2 text-sm bg-[var(--color-rust)]/10 border border-[var(--color-rust)]/30 rounded p-3">
                <strong>One gotcha specific to OpenCode:</strong> after editing the config, fully quit and relaunch OpenCode, not just start a new chat — MCP servers are loaded once at process startup.
              </p>
            </div>

          </div>
        </section>

        {/* Section 5: Architecture */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--color-border-subtle)] pb-2">
            <CheckCircle className="text-[var(--color-signal-green)]" size={24} />
            <h2 className="text-2xl font-serif font-bold text-[var(--color-ink)]">Architecture</h2>
          </div>
          <div className="prose prose-lg text-[var(--color-ink)] font-sans leading-relaxed">
            <p>
              ThothPay runs on Celo Mainnet with a self-custodial design: every wallet keeps its own keys, and a server-side treasury wallet executes citation payouts. Each payout carries the hackathon ERC-8021 attribution tag.
            </p>
            <ul className="list-disc pl-5 space-y-2 mt-4">
              <li><strong>Any EVM wallet:</strong> Researchers connect their own MetaMask / Celo / WalletConnect wallet. A signed message proves ownership; no custodial keys, OTPs, or PINs.</li>
              <li>
                <strong>Master Treasury Escrow:</strong> To prevent forcing researchers to manually sign 5 separate transactions to pay 5 different authors, ThothPay uses a Master Treasury Wallet. A researcher sends one USDC transfer for their "Max Budget" which lands in the Treasury.
              </li>
              <li>
                <strong>Programmatic Payout Routing:</strong> Once the AI agent finishes a task and determines which sources were cited, the backend executes nanopayments from the Treasury directly to the cited authors, each tagged with the ERC-8021 attribution suffix.
              </li>
              <li><strong>Celo Mainnet:</strong> All transactions are executed securely on the Celo Mainnet using USDC, with x402 for agent-to-agent payments.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
