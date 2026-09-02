# ThothPay MCP Server

Exposes ThothPay's [x402](https://x402.org)-payable research endpoint as a native tool for any [MCP](https://modelcontextprotocol.io)-compatible agent — Claude, Codex, Antigravity, Cursor, OpenCode, or your own agent framework. Your agent just calls `thothpay_research("your question")`; this server handles the Gateway deposit, signing, and payment internally.

This folder is self-contained — copy it out of the ThothPay repo into your own project if you like. It doesn't depend on anything else here.

## Setup

```bash
cd mcp-server
npm install
```

Set your own wallet's private key as an environment variable — **never ThothPay's**, this is the wallet that pays for your agent's calls:

```bash
export THOTHPAY_PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

Get USDC on Celo Mainnet (network id 42220) and a little CELO for gas on that address. The server auto-deposits into Gateway the first time it needs to, so no manual deposit step is required.

## Configuration

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `THOTHPAY_PRIVATE_KEY` | Yes | — | Your agent's EVM private key |
| `THOTHPAY_RESEARCH_URL` | No | production endpoint | Override for local testing, e.g. `http://localhost:3000/api/agent/research` |
| `THOTHPAY_CHAIN` | No | `celoMainnet` | Chain name, per `@circle-fin/x402-batching`'s supported chains |
| `THOTHPAY_AUTO_DEPOSIT_USDC` | No | `5.00` | Top-up amount when the Gateway balance runs low |
| `THOTHPAY_RPC_URL` | No | `https://forno.celo.org` | Celo mainnet RPC |

Legacy `CITEFLOW_*` env vars are also read as fallbacks.

## Adding it to an MCP client

For Claude Desktop or Claude Code, add to your MCP config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "thothpay": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/index.mjs"],
      "env": {
        "THOTHPAY_PRIVATE_KEY": "0xYOUR_PRIVATE_KEY",
        "THOTHPAY_RESEARCH_URL": "https://thothpay.xyz/api/agent/research"
      }
    }
  }
}
```

`THOTHPAY_RESEARCH_URL` is optional — it already defaults to the production endpoint above — but it's included explicitly so this example is copy-pasteable as-is. Drop it (or point it at `http://localhost:3000/api/agent/research`) if you're testing against a local dev server instead.

Restart your client, then just ask it to research something — it'll call `thothpay_research` on its own when relevant.

### Other clients

Same server, same tool, same underlying stdio transport — just a different config file and syntax per client:

- **Claude Code** (CLI or VS Code extension) — identical `.mcp.json` format shown above.
- **Codex** (CLI or IDE extension, they share one config) — TOML, not JSON, at `~/.codex/config.toml`:
  ```toml
  [mcp_servers.thothpay]
  command = "node"
  args = ["/absolute/path/to/mcp-server/index.mjs"]

  [mcp_servers.thothpay.env]
  THOTHPAY_PRIVATE_KEY = "0xYOUR_PRIVATE_KEY"
  THOTHPAY_RESEARCH_URL = "https://thothpay.xyz/api/agent/research"
  ```
- **Antigravity** (desktop app or CLI) — same JSON shape as Claude's, but at `~/.gemini/config/mcp_config.json` (global) or `.agents/mcp_config.json` (workspace-local). In the desktop app you can also paste it via **MCP Servers → Manage MCP Servers → View raw config**.

  **Gotcha:** adding the server in Antigravity isn't enough on its own — there's a separate **MCP Tools** permissions screen where tools must be explicitly allowed before the agent will actually call them. If it connects (shows up, tool discovered) but calls silently do nothing, go add an **Allow** rule for `thothpay_research` there.
- **OpenCode** (CLI) — project-local `opencode.jsonc`, using the `mcp` block shown on the docs page.

**Not supported yet:** Replit Agent, and any other client that only accepts a remote HTTPS MCP server rather than spawning a local process. This server currently speaks stdio only.

## Running it directly

```bash
npm start
```

It speaks MCP over stdio — you won't see anything but a "running on stdio" line until an MCP client connects to it.
