# CryptoDesk — Full Buildathon Roadmap

## Overview

CryptoDesk evolves from a **crypto news agency** (Wave 1) into a **one-person on-chain fund management business** (Wave 3), with each wave building directly on the last.

---

## Wave 1 — News Agency  
**May 1–12 · $3,000 USDC**  
**Status: ✅ Submission Ready**

### What it does
A one-person crypto intelligence desk powered by SoSoValue's live news feeds and Claude AI. Delivers structured daily briefings, sector performance, and macro events — the full research layer of a professional trading desk.

### Features Shipped
- [x] Live SoSoValue news feed (`/news`, `/news/hot`, `/news/featured`)
- [x] Category filters: Breaking, Research, Institutional, KOL, Official
- [x] AI Daily Intelligence Briefing (Claude Sonnet)
- [x] Macro economic events calendar (`/macro/events`)
- [x] Sector spotlight performance (`/currencies/sector-spotlight`)
- [x] Market ticker bar: BTC, ETH, SOL, BNB
- [x] Article-level AI analysis via Claude
- [x] Single-file deployable app (no build step)
- [x] Roadmap panel visible in app

### APIs Used
| Endpoint | Purpose |
|----------|---------|
| `GET /news` | Main news feed |
| `GET /news/hot` | Trending articles |
| `GET /news/featured` | Editorial picks |
| `GET /macro/events` | Economic calendar |
| `GET /currencies/sector-spotlight` | Sector performance |

### Judging Alignment (Wave 1)
- **User Value (30%)**: Clear — daily briefings replace hours of news scanning
- **Demo (25%)**: Single URL, works instantly, live Claude output visible
- **Logic (20%)**: News → Claude → structured briefing = clear pipeline
- **API Use (15%)**: 5 SoSoValue endpoints integrated
- **UX (10%)**: Editorial design, intuitive navigation

---

## Wave 2 — Intelligence Platform  
**May 18–29 · $3,000 USDC**

### Strategic Shift
Expand from news only → **multi-signal intelligence platform**. Add on-chain data (ETF flows, BTC treasuries, fundraising, indices) and build the Signal Detection Engine that scores every piece of news for market impact.

### Features to Build

#### Data Modules
- [ ] **ETF Flow Monitor** — daily inflow/outflow, cumulative chart (`/etfs/summary-history`, `/etfs/{ticker}/history`)
- [ ] **BTC Treasury Tracker** — all corporate holders, purchase history (`/btc-treasuries`, `/btc-treasuries/{ticker}/purchase-history`)
- [ ] **SoSoValue Index Dashboard** — index list, constituents, weights, performance (`/indices`, `/indices/{ticker}/constituents`, `/klines`)
- [ ] **Fundraising Radar** — new projects, round sizes, lead investors (`/fundraising/projects`)
- [ ] **Analysis Charts** — SoSoValue proprietary chart data (`/analyses`, `/analyses/{chart_name}`)

#### Intelligence Layer
- [ ] **AI Signal Engine** — Claude scores each news article: sentiment (bull/bear/neutral), strength (1-5), affected asset, trade implication
- [ ] **Signal Feed** — dedicated view of scored signals, sortable by strength
- [ ] **Cross-signal Correlation** — detect when news + ETF flows + price move align
- [ ] **Watchlist** — user can pin assets, gets signals specific to watched assets

#### Execution Preview
- [ ] **SoDEX Integration (read-only)** — connect to SoDEX API, show live orderbook and market prices
- [ ] **Order Preview** — given a signal, show what a trade would look like (not yet executed)

#### UI Upgrades
- [ ] Interactive kline charts (price history with SoSoValue data)
- [ ] ETF inflow chart (area chart, daily/weekly/monthly)
- [ ] Index constituent treemap
- [ ] Persistent user state (watchlist saved across sessions)

### APIs Added in Wave 2
| Endpoint | Purpose |
|----------|---------|
| `GET /etfs/summary-history` | Bitcoin ETF aggregate daily flows |
| `GET /etfs/{ticker}/market-snapshot` | Individual ETF real-time data |
| `GET /etfs/{ticker}/history` | Historical ETF performance |
| `GET /indices` | All SoSoValue proprietary indices |
| `GET /indices/{ticker}/constituents` | Index composition & weights |
| `GET /indices/{ticker}/klines` | Index historical chart data |
| `GET /btc-treasuries` | All corporate BTC holders |
| `GET /btc-treasuries/{ticker}/purchase-history` | Corporate buy history |
| `GET /fundraising/projects` | New project funding rounds |
| `GET /analyses/{chart_name}` | SoSoValue proprietary analysis |
| SoDEX orderbook | Live market depth (read-only) |

### Wave 2 Deliverable
A full intelligence terminal: news + on-chain flows + indices + signals + SoDEX preview. The user can see: what's happening (news) + what the data says (flows) + what to potentially do (signal + order preview).

---

## Wave 3 — One-Person Fund Manager  
**June 4–15 · $4,000 USDC**

### Strategic Shift
This is the **full product vision**: CryptoDesk becomes an end-to-end one-person fund management business. A single user can design an index, publish it on-chain, and execute rebalancing trades via SoDEX — all from one interface.

### Features to Build

#### Index Designer
- [ ] **Custom Index Builder** — drag-and-drop token basket creation using SoSoValue index data as reference
- [ ] **AI Index Recommender** — Claude suggests index composition based on user goal (e.g. "DeFi blue chips", "L2 growth basket")
- [ ] **Backtest Viewer** — show historical performance of custom index using `/klines` data
- [ ] **Publish Index** — generate a shareable URL for your custom index (your "fund" page)

#### Portfolio Management
- [ ] **Live Portfolio Snapshot** — connect SoDEX portfolio API, show current holdings vs target weights
- [ ] **Rebalancing Calculator** — show exactly which trades are needed to match target index
- [ ] **Risk Dashboard** — position concentration, correlation heat map, volatility score
- [ ] **P&L Tracker** — daily/weekly/monthly performance vs BTC and a SoSoValue benchmark index

#### SoDEX Execution (Live)
- [ ] **Live Order Placement** — place market and limit orders via SoDEX API
- [ ] **Rebalance Execution** — one-click rebalance: CryptoDesk calculates orders, confirms with user, executes on SoDEX
- [ ] **Automated Scheduler** — set weekly/monthly auto-rebalance, app executes on schedule
- [ ] **Order Audit Log** — every AI signal and executed trade logged with timestamp, rationale, price
- [ ] **Stop-loss Guard** — user sets drawdown limit; system auto-cancels and alerts if breached

#### Public Fund Page
- [ ] **Shareable Fund URL** — `/fund/{your-name}` shows index composition, performance, and recent trades
- [ ] **On-Chain Proof** — link to SoDEX/ValueChain transaction explorer for every executed order
- [ ] **Follow Feature** — other users can follow your index (see composition, get notified on rebalance)

### APIs Added in Wave 3
| Endpoint | Purpose |
|----------|---------|
| `GET /currencies/{id}/klines` | Historical prices for backtest |
| `GET /currencies/{id}/market-snapshot` | Real-time prices for execution |
| SoDEX `POST /order` | Place live trades |
| SoDEX `GET /portfolio` | Current holdings |
| SoDEX `GET /orders/history` | Trade audit log |
| SoDEX `DELETE /order/{id}` | Cancel orders |

### Wave 3 Deliverable
A working one-person fund management business: you can design an index, execute trades on SoDEX, and share a public fund page with verifiable on-chain proof. This is the "one-person business empire" the buildathon is explicitly designed for.

---

## Demo Day — Grand Prize

### Narrative
"CryptoDesk is a one-person finance business. I read the market, build my index, and execute — all from one screen."

### Live Demo Flow
1. Open CryptoDesk → live news loads from SoSoValue in real-time
2. Click **Generate Briefing** → Claude produces a live intelligence report
3. Signal Engine flags a bullish BTC ETF signal
4. Open **Index Designer** → AI recommends BTC-heavy basket
5. Open **Portfolio** → rebalancing calculator shows required trades
6. Click **Execute Rebalance** → orders placed on SoDEX live
7. Show **Public Fund Page** → on-chain proof of trade execution

### Judge Alignment
- **SoSoValue Terminal judges**: deep news + analysis integration ✓
- **SSI Protocol judges**: custom index design and publishing ✓
- **SoDEX judges**: live order execution, rebalancing, audit log ✓

---

## Technology Stack

| Layer | Wave 1 | Wave 2 | Wave 3 |
|-------|--------|--------|--------|
| Frontend | Vanilla HTML/CSS/JS | + Charts (lightweight) | React migration |
| Data | SoSoValue API (5 endpoints) | + 10 endpoints | All modules |
| AI | Claude Sonnet (briefings) | + Signal scoring | + Index design AI |
| Execution | None | SoDEX read-only | SoDEX live trading |
| Hosting | GitHub Pages | GitHub Pages | GitHub Pages |

---

*CryptoDesk · SoSoValue Buildathon 2026*
