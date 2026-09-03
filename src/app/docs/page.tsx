import Link from 'next/link';
import { Droplet, FileText, Search, Wallet, Cpu, CheckCircle } from 'lucide-react';

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
                ThothPay works with any standard EVM wallet â€” MetaMask, the Celo extension, Rabby, WalletConnect, and more. Your wallet address is your identity; there are no custodial accounts or seed phrases held by us.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Click <strong>Connect Wallet</strong> in the top navigation bar.</li>
                <li>Pick your wallet and approve the connection.</li>
                <li>Sign a free message to prove ownership â€” no transaction is sent.</li>
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
                <li>Your wallet sends the budget as USDC to the ThothPay treasury â€” a plain transfer you sign once.</li>
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
                Before you can register an article, you must prove you actually control where it lives. This exists so nobody else can register your work and collect the citation payments meant for you â€” ThothPay will not create a source from a domain or platform handle you haven&apos;t verified, full stop.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-[var(--color-ink)]">
                <li>Open the <strong>Verify Ownership</strong> panel on your Dashboard â€” it shows a unique verification code tied to your account.</li>
                <li>Prove control of a <strong>domain</strong> (add a meta tag or a <code className="px-1.5 py-0.5 bg-[var(--color-panel-deep)] rounded text-sm">/.well-known/thothpay.txt</code> file with the code), an <strong>X</strong> account (post the code in a tweet), a <strong>Medium</strong> profile, or a <strong>Substack</strong> â€” then paste the link back into the panel.</li>
                <li>Once verified, that identity is <strong>permanently and exclusively yours</strong> â€” enforced at the database level, not just in the UI. You can then register any article on that domain or handle without repeating this step.</li>
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


        {/* Architecture */}
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
              <li><strong>Celo Mainnet:</strong> All transactions are executed securely on the Celo Mainnet using USDC.</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
