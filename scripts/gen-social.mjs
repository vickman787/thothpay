import sharp from "sharp"
import fs from "node:fs"

const OUT = "assets/social"
fs.mkdirSync(OUT, { recursive: true })

// Temple Gold palette
const INK = "#0e0a05"
const PANEL = "#181209"
const GOLD = "#e8b84b"
const PAPER = "#f3e7cf"
const MUTED = "#9c8b6b"
const EMBER = "#d97742"

const QUILL = (x, y, s) => `
  <g transform="translate(${x},${y}) scale(${s})">
    <path d="M 30,20 C 52,34 74,58 88,84 L 74,92 C 62,70 42,48 26,38 Z" fill="${GOLD}"/>
    <path d="M 30,20 L 88,84" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
    <path d="M 34,28 L 24,34 M 44,38 L 34,44 M 56,52 L 46,58 M 66,66 L 58,72" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="70" cy="90" r="19" fill="${GOLD}"/>
    <circle cx="70" cy="90" r="11" fill="${INK}"/>
  </g>`

const FONT = 'font-family="Segoe UI, Arial, Helvetica, sans-serif"'
const MONO = 'font-family="Consolas, Courier New, monospace"'

// ── 1. HERO BANNER ──────────────────────────────────────────────
const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <defs>
    <radialGradient id="glow" cx="50%" cy="38%" r="60%">
      <stop offset="0%" stop-color="#241a0c"/>
      <stop offset="100%" stop-color="${INK}"/>
    </radialGradient>
  </defs>
  <rect width="1600" height="900" fill="url(#glow)"/>
  ${Array.from({ length: 30 }, (_, i) => `<rect y="${i * 30}" width="1600" height="1" fill="${PAPER}" opacity="0.02"/>`).join("")}
  ${QUILL(690, 110, 1.9)}
  <text x="800" y="450" ${FONT} font-size="86" font-weight="700" fill="${PAPER}" text-anchor="middle">ThothPay</text>
  <text x="800" y="530" ${FONT} font-size="42" font-weight="600" fill="${GOLD}" text-anchor="middle">Every citation pays its author.</text>
  <text x="800" y="600" ${FONT} font-size="27" fill="${MUTED}" text-anchor="middle">An AI research agent that pays creators in USDC</text>
  <text x="800" y="640" ${FONT} font-size="27" fill="${MUTED}" text-anchor="middle">the instant their work is cited.</text>
  <rect x="600" y="716" width="400" height="58" rx="6" fill="none" stroke="${GOLD}" stroke-opacity="0.45"/>
  <circle cx="644" cy="745" r="7" fill="${GOLD}"/>
  <text x="668" y="753" ${MONO} font-size="23" fill="${GOLD}">CELO MAINNET · LIVE</text>
</svg>`

// ── 2. HOW IT WORKS ─────────────────────────────────────────────
const steps = [
  ["01", "Creators register", "Prove you own your domain, X,\nMedium or Substack, then register\nyour article and set a citation price."],
  ["02", "A reader asks", "They connect any EVM wallet and\nsend a budget in USDC straight to\nthe ThothPay treasury."],
  ["03", "The agent cites", "It reads only registered sources and\ngrounds every claim. Sources it\nactually uses get paid, others cost $0."],
  ["04", "Authors get paid", "The treasury fires a USDC payout to\neach cited author on Celo mainnet.\nUnspent budget is refunded."],
]

const card = (i, [n, title, body]) => {
  const x = 90 + (i % 2) * 720
  const y = 250 + Math.floor(i / 2) * 300
  const lines = body.split("\n")
  return `
  <g>
    <rect x="${x}" y="${y}" width="660" height="250" rx="10" fill="${PANEL}" stroke="${PAPER}" stroke-opacity="0.12"/>
    <text x="${x + 36}" y="${y + 66}" ${MONO} font-size="40" font-weight="700" fill="${GOLD}" opacity="0.55">${n}</text>
    <text x="${x + 108}" y="${y + 66}" ${FONT} font-size="34" font-weight="700" fill="${PAPER}">${title}</text>
    ${lines.map((l, li) => `<text x="${x + 36}" y="${y + 122 + li * 36}" ${FONT} font-size="24" fill="${MUTED}">${l}</text>`).join("")}
  </g>`
}

const flow = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${INK}"/>
  ${QUILL(78, 62, 0.72)}
  <text x="168" y="126" ${FONT} font-size="40" font-weight="700" fill="${PAPER}">How ThothPay works</text>
  <text x="90" y="192" ${FONT} font-size="26" fill="${MUTED}">Four steps, one honest loop. Every payout is tagged and verifiable on Celo mainnet.</text>
  ${steps.map((s, i) => card(i, s)).join("")}
  <text x="90" y="866" ${MONO} font-size="22" fill="${GOLD}" opacity="0.8">github.com/vickman787/thothpay</text>
</svg>`

// ── 3. PROOF CARD ───────────────────────────────────────────────
const rows = [
  ["Attribution tag", "celo_38d9e4de3b9f"],
  ["ERC-8004 Agent ID", "9803 on Celo"],
  ["Agent treasury", "0xcc4BCDD5...B1C1d3A1"],
  ["Settlement asset", "Native USDC on Celo"],
  ["Verified on-chain", "verifyTx -> codes match"],
]

const proof = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
  <rect width="1600" height="900" fill="${INK}"/>
  ${QUILL(78, 62, 0.72)}
  <text x="168" y="126" ${FONT} font-size="40" font-weight="700" fill="${PAPER}">Real money, provable on-chain</text>
  <text x="90" y="192" ${FONT} font-size="26" fill="${MUTED}">No testnet theatre. Every citation payout carries an ERC-8021 attribution tag.</text>
  <rect x="90" y="250" width="1420" height="450" rx="10" fill="${PANEL}" stroke="${PAPER}" stroke-opacity="0.12"/>
  ${rows.map(([k, v], i) => `
    <text x="140" y="${330 + i * 82}" ${FONT} font-size="27" fill="${MUTED}">${k}</text>
    <text x="700" y="${330 + i * 82}" ${MONO} font-size="27" fill="${GOLD}">${v}</text>
    ${i < rows.length - 1 ? `<rect x="140" y="${356 + i * 82}" width="1320" height="1" fill="${PAPER}" opacity="0.09"/>` : ""}
  `).join("")}
  <text x="90" y="790" ${FONT} font-size="27" fill="${PAPER}">Creators keep 80% of every citation fee, paid instantly.</text>
  <text x="90" y="866" ${MONO} font-size="22" fill="${EMBER}" opacity="0.9">8004scan.io/agents/celo/9803</text>
</svg>`

for (const [name, svg] of [["1-hero", hero], ["2-how-it-works", flow], ["3-proof", proof]]) {
  await sharp(Buffer.from(svg)).png().toFile(`${OUT}/${name}.png`)
  console.log("wrote", `${OUT}/${name}.png`)
}
