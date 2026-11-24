# n8n-nodes-kovered

n8n community node for [Kovered](https://www.kovered.ai): stock ticker mentions, hype, and history.

## Installation

Settings → Community Nodes → Install → `n8n-nodes-kovered`

## Credentials

API key from https://www.kovered.ai/account (`mm_live_…`). Sent as `Authorization: Bearer`. Credential test hits `GET /api/v1/me`.

## Operations

- **Get Credits** — balance (`/me`)
- **List Stocks** — `/stocks`
- **Get Stock** — `/stocks/{symbol}`
- **Get Stock Hype** — `/stocks/{symbol}/hype`
- **Get Stock History** — `/stocks/{symbol}/history`

## Resources

- [Kovered](https://www.kovered.ai)
- [MCP / API notes](https://www.kovered.ai/pricing#mcp)
