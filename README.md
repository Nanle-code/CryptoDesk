# CryptoDesk — AI-Powered On-Chain Finance Intelligence

> A one-person crypto intelligence business powered by SoSoValue API × Claude AI
> Built for the SoSoValue Buildathon 2026

---

## What is CryptoDesk?

CryptoDesk is an agentic finance application that functions as a **one-person crypto news agency and intelligence desk**. It ingests real-time data from SoSoValue's API, processes it with Claude AI, and delivers structured daily briefings, sector analysis, signal detection, and — in later waves — index publishing and on-chain execution via SoDEX.

---

## Project Structure

```
cryptodesk/
├── index.html              # Wave 1: Main app entry point (single-file, deployable)
├── README.md               # This file
│
├── src/
│   ├── api/
│   │   ├── sosovalue.js    # SoSoValue API client (all modules)
│   │   ├── claude.js       # Claude AI client
│   │   └── sodex.js        # SoDEX trading API client (Wave 2+)
│   │
│   ├── components/
│   │   ├── newsfeed.js     # News feed + filtering
│   │   ├── briefing.js     # AI briefing generator
│   │   ├── macropanel.js   # Macro events calendar
│   │   ├── sectorchart.js  # Sector spotlight (Wave 2)
│   │   ├── indexbuilder.js # Index designer (Wave 2)
│   │   └── trading.js      # SoDEX execution panel (Wave 3)
│   │
│   └── utils/
│       ├── format.js       # Number/date formatters
│       ├── sentiment.js    # Sentiment scoring engine
│       └── signals.js      # Signal detection logic
│
├── docs/
│   ├── ROADMAP.md          # Full wave-by-wave roadmap
│   ├── API_USAGE.md        # API integration reference
│   └── ARCHITECTURE.md     # System architecture diagram
│
└── public/
    └── favicon.svg         # CryptoDesk logo
```

---

## Buildathon Roadmap

### Wave 1 — News Agency (Complete ✓)
**May 1–12 | $3,000 USDC**
- Live news feed from SoSoValue `/news`, `/news/hot`, `/news/featured`
- AI-generated daily briefings via Claude
- Macro events calendar
- Sector spotlight
- Market ticker sidebar
- Deployable as single HTML file

### Wave 2 — Intelligence Platform
**May 18–29 | $3,000 USDC**
- Index tracker dashboard (`/indices`, `/indices/{ticker}/constituents`)
- ETF flow monitor (`/etfs/summary-history`, `/etfs/{ticker}/history`)
- BTC Treasury tracker (`/btc-treasuries`, purchase history)
- Fundraising radar (`/fundraising/projects`)
- Signal detection engine (AI scores news → bullish/bearish/neutral)
- Interactive charts (klines, historical data)
- SoDEX API integration (read-only: orderbook, market data)
- User watchlist with persistent state

### Wave 3 — One-Person Fund Manager
**Jun 4–15 | $4,000 USDC**
- Index designer: compose custom token baskets using SoSoValue index data
- Portfolio rebalancing calculator
- SoDEX execution: live order placement via `/order` API
- Risk control dashboard (position sizing, stop-loss logic)
- Automated strategy scheduler (daily/weekly rebalance)
- Full audit trail of all AI-generated signals and trades
- Shareable public fund page (your "one-person hedge fund" URL)

### Demo Day — Final Presentation
**TBD | Grand Prize**
- Full end-to-end demo: news → signal → index → trade execution
- Live on-chain proof of executed orders on SoDEX/ValueChain
- Published index available for others to follow
- Video walkthrough + judge Q&A

---

## APIs Used

| Module | Endpoints | Wave |
|--------|-----------|------|
| Feeds | `/news`, `/news/hot`, `/news/featured` | W1 |
| Macro | `/macro/events`, `/macro/events/{event}/history` | W1 |
| Currency | `/currencies/sector-spotlight`, `/currencies/{id}/market-snapshot` | W1 |
| ETF | `/etfs/summary-history`, `/etfs/{ticker}/market-snapshot` | W2 |
| SoSoValue Index | `/indices`, `/indices/{ticker}/constituents`, `/klines` | W2 |
| BTC Treasuries | `/btc-treasuries`, `/btc-treasuries/{ticker}/purchase-history` | W2 |
| Fundraising | `/fundraising/projects`, `/fundraising/projects/{id}` | W2 |
| Analysis | `/analyses`, `/analyses/{chart_name}` | W2 |
| SoDEX | Order placement, orderbook, portfolio | W3 |
| Claude AI | Briefings, signals, index recommendations | W1–W3 |

---

## Quick Start

1. Open `index.html` in any browser (no build step needed for Wave 1)
2. Click **⚙ Settings** in the top-right
3. Enter your SoSoValue API key and Claude API key
4. Click **Connect** — live data loads instantly

For deployment: upload `index.html` to GitHub Pages, Netlify, or any static host.

---

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (Wave 1–2), planned React migration (Wave 3)
- **Data**: SoSoValue OpenAPI v1
- **AI**: Claude Sonnet 4 via Anthropic API
- **Execution**: SoDEX REST API (Wave 3)
- **Hosting**: GitHub Pages (static, zero cost)

---

## Team

Built solo for the SoSoValue Buildathon 2026.
Contact: [your contact info]

---

*Powered by [SoSoValue](https://sosovalue.com) × [Anthropic Claude](https://anthropic.com)*
