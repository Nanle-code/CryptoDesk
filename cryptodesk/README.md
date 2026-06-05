# CryptoDesk Terminal

**CryptoDesk Terminal** is a browser-based crypto intelligence workstation that turns live **SoSoValue** market data into ranked trading signals, **Grok** briefings, and **SoDEX** execution previews — on one screen.

Instead of acting like a generic news aggregator, CryptoDesk works as an **agentic intelligence layer**: ingest headlines and flows → analyze with lexicon + AI → surface signals → preview depth on SoDEX before any trade is placed.

> CryptoDesk helps solo researchers and retail traders run a one-person crypto desk without a Bloomberg terminal budget.

**Live demo:** [https://nanle-code.github.io/CryptoDesk/index.html](https://nanle-code.github.io/CryptoDesk/index.html)  
**Stack:** React 19 · Vite 6 · client-side SPA (no backend)  
**Buildathon:** [SoSoValue Buildathon on AKINDO](https://app.akindo.io/wave-hacks/JBEQXgN4Zi2jA3wA) · **Wave 3**

---

## Wave 3 — Opportunity Discovery Platform

CryptoDesk is an **AI-powered Opportunity Discovery and Execution Intelligence Platform** (see `nextstep.md`). Shipped in Wave 3:

- **Auto AI classification** — Grok classifies top 5 signals on every feed load
- **Opportunity engine** — confidence · risk · horizon · auto Why? / Risks
- **Investment committee** — Analyst · Risk · Macro · Execution agents
- **Execution preview** — recommendation + allocation + slippage bound to SoDEX depth
- **Research copilot · Narratives · Watchlist · Portfolio · SSI index · Strategy**
- **🏁 Judge demo wizard** — guided 7-step flow in left nav
- **📜 Signal archive** — session history of signals + opportunities (export JSON)
- **📈 Kline charts** — SoDEX candles + SoSoValue area charts on SoDEX tab
- **🔐 Order scaffold** — EIP-712 signed POST preview (`/trade/orders/batch`)
- **📋 Order audit** — session log of prepared orders (export JSON)

```text
Settings → News → AI signals → Opportunities → Committee → Portfolio → SoDEX execution → Explainability
```

## Table of Contents

- [Example Workflow (Current App)](#example-workflow-current-app)
- [Overview](#overview)
- [Problem](#problem)
- [Solution](#solution)
- [Core Features](#core-features)
- [How CryptoDesk Works](#how-cryptodesk-works)
- [System Architecture](#system-architecture)
- [User Flow](#user-flow)
- [Data Flow](#data-flow)
- [Signal Engine](#signal-engine)
- [Grok AI Layer](#grok-ai-layer)
- [SoSoValue Integration](#sosovalue-integration)
- [SoDEX Integration](#sodex-integration)
- [UI Surfaces](#ui-surfaces)
- [Client API Layer](#client-api-layer)
- [Storage](#storage)
- [Button Behavior](#button-behavior)
- [API Keys and Configuration](#api-keys-and-configuration)
- [Installation](#installation)
- [Running Locally](#running-locally)
- [Build and Deploy](#build-and-deploy)
- [Project Structure](#project-structure)
- [Safety Rules](#safety-rules)
- [Error Handling](#error-handling)
- [Roadmap](#roadmap)
- [Demo Flow for Judges](#demo-flow-for-judges)
- [Quality Checklist](#quality-checklist)
- [Disclaimer](#disclaimer)

---

## Overview

CryptoDesk is designed for:

- Solo crypto researchers
- Retail traders
- Signal-group operators
- On-chain analysts
- Hackathon judges verifying real API usage
- Anyone who wants **news + flows + signals + execution preview** in one tab

The product ingests a live SoSoValue feed, scores every headline, and routes high-conviction ideas toward SoDEX market depth.

See **[Example Workflow (Current App)](#example-workflow-current-app)** for the full click-by-click path. Quick version:

```text
Settings → Connect → News → 🔥 Opportunities → Committee → SoDEX execution preview → 🏁 Judge demo (optional tour)
```

---

## Example Workflow (Current App)

This is the **exact journey** the shipped React terminal supports today (**Wave 3**).

### What you see on load

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ CryptoDesk · BTC/ETH/SOL/BNB tickers · [Generate Briefing] · ⚙ Settings    │
├─────────────────────────────────────────────────────────────────────────────┤
│ Trust bar: articles · signals · sentiment % · SoSoValue · SoDEX · Grok     │
├──────────┬──────────────────────────────────────────────┬───────────────────┤
│ LEFT NAV │ CENTER (3 tabs)                              │ RIGHT INTEL       │
│          │ [News feed] [SoSoValue Hub] [SoDEX Terminal] │ panel             │
│ News     │                                              │                   │
│ SoSoValue│  Active tab content                          │ Article / signals │
│ SoDEX    │                                              │ / ETF / macro…    │
│ AI tools │                                              │                   │
└──────────┴──────────────────────────────────────────────┴───────────────────┘
```

Without a SoSoValue key: toast *“Demo mode — connect SoSoValue API in settings”* and **demo headlines** in the news tab only. Hub and intel panels ask you to connect; SoDEX still works (public API).

---

### Step-by-step (live mode)

| Step | Where to click | What happens | API / proof |
|------|----------------|--------------|-------------|
| **1** | Masthead → **⚙ Settings** | Modal: *Connect your APIs* | Keys → `sessionStorage` only |
| **2** | Paste **SoSoValue** + **Grok** keys → **Connect →** | Toast: *Connected — loading live data…* | `cd_soso`, `cd_grok` |
| **3** | Center tab **News feed** (default) · **Latest** | Headlines load; trust bar shows article + signal counts | `GET /news` |
| **4** | (Optional) **🔥 Hot** or **★ Featured** | Switches endpoint | `/news/hot` · `/news/featured` |
| **5** | Left nav → category (e.g. **Breaking**) | Filters latest feed | `GET /news?category=1` |
| **6** | Click any **headline card** | Right panel → article + source link | Panel: *Article* |
| **7** | (Optional) **✦ Analyze with Grok** | AI write-up in right panel | xAI `grok-2` |
| **8** | Left nav → **📜 Signal archive** | Session history grows on feed refresh; export JSON | `cd_signal_archive` |
| **9** | (Auto) Grok classifies top 5 on load | Trust bar: *Grok classifying…* → *Lexicon + Grok* | `classifySignal` |
| **10** | Left nav → **🔥 Opportunities** | Cards with Why? / Risks · Committee · SoDEX preview | `buildOpportunities` |
| **11** | **Committee** on top opportunity | 4-agent review + allocation % | `runInvestmentCommittee` |
| **12** | **🏁 Judge demo** (optional) | 7-step wizard: news → execution | `DemoWizard` |
| **13** | Left nav → **⚡ Signal feed** | Ranked signals (strength ≥ 2) | Lexicon + Grok |
| **14** | **◎ Execution preview on SoDEX** | Center → SoDEX tab + bound preview card | `buildExecutionContext` |
| **15** | Center tab **SoSoValue Hub** | 8 cards in parallel (ETF, sectors, macro…) | 8× SoSoValue |
| **16** | Left nav → **₿ ETF flows** (or Macro, Sectors…) | Right panel with live table + `apiProof` footer | Per-panel endpoint |
| **17** | Center tab **SoDEX Terminal** | Symbols, ticker strip, orderbook, trades; refreshes every **15s** | `testnet-gw.sodex.dev` |
| **18** | Masthead → **Generate Briefing** | Right panel → Grok daily report | Same `/news` feed |
| **19** | Left nav → **⟳ Agent workflow** | Full Wave 3 loop + judge demo CTA | UI |

---

### Example outputs (illustrative)

After step 3–8 with a live key, you might see:

```text
Trust bar
  Articles: 30    Signals: 12    Sentiment: 58%    Data source: SoSoValue API

Signal feed (right panel)
  ⚡ bullish · ETH · strength 4
     "BlackRock ETH ETF sees record inflow…" — 3 bullish cues

  ⚡ bearish · BTC · strength 3
     "Exchange outflows spike amid…" — 2 bearish cues
```

After step 11 (SoSoValue Hub):

```text
₿ BTC ETF flows (US)     GET /etfs/summary-history
  Latest: +$247.5M · 2026-05-15

◈ Sector spotlight       GET /currencies/sector-spotlight
  AI: +4.2%   DeFi: +1.8%   Meme: -2.1%
```

After step 13 (SoDEX Terminal):

```text
Pair: vBTC_vUSDC
GET /markets/symbols · /markets/tickers
GET /markets/vBTC_vUSDC/orderbook · …/trades

Bids / asks depth + last 15 prints
Footer: Execution preview (Wave 3) — no order placed in Wave 2
```

---

### 60-second demo script (judges)

```text
1. Open live URL → Settings → SoSoValue + Grok → Connect →
2. DevTools → Network → confirm openapi.sosovalue.com GET /news (code: 0)
3. Click headline → article panel → click ⚡ Signal feed
4. Click ◎ Preview top signal on SoDEX → confirm testnet-gw.sodex.dev
5. Center tab SoSoValue Hub → scroll 8 cards (parallel requests)
6. Generate Briefing → read Grok output in right panel
7. ⟳ Agent workflow → point at SoSoValue → SoDEX loop
```

---

### Agentic loop (what the product is proving)

```mermaid
flowchart LR
    A[SoSoValue INGEST] --> B[ANALYZE]
    B --> C[SIGNAL]
    C --> D[SoDEX PREVIEW]
    D --> E[EXECUTE W3]

    A --- A1["/news · macro · sectors\nETF · indices · treasuries"]
    B --- B1["Lexicon + Grok"]
    C --- C1["⚡ Signal feed"]
    D --- D1["SoDEX Terminal\norderbook + trades"]
    E --- E1["Signed orders\nnot shipped yet"]
```

---

## Problem

Crypto operators drown in fragmented tools:

- News lives in one app; ETF flows and sector data in another.
- Social signals lack structure (no strength, asset, or sentiment score).
- AI chatbots are disconnected from live market APIs.
- Execution venues are opened **before** reading orderbook depth.
- Many hackathon demos use **mock panels** that break under judge scrutiny.

Most products optimize for *finding* hype. CryptoDesk optimizes for **structured intelligence → signal → preview**.

---

## Solution

CryptoDesk creates a single terminal between **market intelligence** and **execution planning**.

It helps users answer:

- What is moving in crypto news right now?
- Which headlines carry tradeable conviction?
- What do ETF flows, sectors, and macro say today?
- What is corporate BTC treasury activity?
- Can this idea be sized against real SoDEX liquidity?
- What does Grok synthesize from the same SoSoValue feed?

---

## Core Features

### 1. Live News Feed (SoSoValue)

Three feed modes from the OpenAPI:

- `GET /news` — latest, filterable by category
- `GET /news/hot` — trending
- `GET /news/featured` — editorial picks

Categories: All · Breaking · Research · Institutional · KOL.

### 2. Lexicon Signal Engine

Every headline is scored locally (no extra API call):


| Output      | Description                               |
| ----------- | ----------------------------------------- |
| `sentiment` | `bullish` · `bearish` · `neutral`         |
| `strength`  | 1–5 (only ≥2 shown in Signal Feed)        |
| `asset`     | Ticker from `$SYMBOL` or matched currency |
| `reason`    | Human-readable cue count                  |


Optional **Grok enhancement** re-scores the top 3 signals.

### 3. SoSoValue Intelligence Hub

Center-tab dashboard — **8 parallel API calls** on load:

- Sector spotlight
- BTC + ETH ETF summary history (US)
- Macro events calendar
- SSI indices
- BTC corporate treasuries
- Fundraising projects
- ETF list

### 4. SoDEX Spot Terminal

Public testnet REST — **no API key required**:

- Symbol list · tickers · orderbook · recent trades
- Auto-refresh every 15 seconds
- Execution preview copy for Wave 3 (EIP-712 signed orders)

Default pair: `vBTC_vUSDC`.

### 5. Grok AI Briefings

With a Grok (xAI) key:

- **Daily briefing** from the top 20 headlines
- **Per-article analysis** on click
- **Signal enhancement** for top 3 opportunities

### 6. Agent Workflow Panel

Documents the full loop in the UI:

```text
SoSoValue INGEST → ANALYZE (Grok + lexicon) → SIGNAL → SoDEX PREVIEW → EXECUTE (Wave 3)
```

### 7. Intelligence Side Panel

Context panels with **API proof footers** (endpoint + UTC timestamp):

- Macro calendar · Sector spotlight · Dual ETF flows
- SSI indices (+ constituents when available)
- BTC treasuries · Fundraising radar
- SoDEX orderbook snapshot · Agent workflow

---

## How CryptoDesk Works

```mermaid
flowchart TD
    A[Open CryptoDesk Terminal] --> B{SoSoValue key?}
    B -- No --> C[Demo news only + connect toast]
    B -- Yes --> D[Live /news · /hot · /featured]
    D --> E[Lexicon scores all headlines]
    E --> F[Trust bar + ⚡ Signal feed]
    D --> G[Center: SoSoValue Hub - 8 APIs]
    F --> H[◎ Preview on SoDEX]
    H --> I[Center: SoDEX Terminal - 4 APIs]
    I --> J[Orderbook + trades - no orders]
    D --> K[✦ Generate Briefing]
    K --> L[Grok in right panel]
    G --> M[Left nav drill-down panels]
    M --> N[ETF · Macro · Sectors · Treasuries…]
```



---

## System Architecture

CryptoDesk is a **client-side SPA** (React 19 + Vite 6). All API calls run in the browser; there is no custom backend server.

```mermaid
flowchart LR
    subgraph Frontend[Frontend - React + Vite]
        A[Masthead + Tickers]
        B[Nav: SoSoValue × SoDEX Tools]
        C[MainWorkspace]
        D[IntelligencePanel]
        E[SettingsModal]
    end

    subgraph MainTabs[MainWorkspace Tabs]
        C1[News Feed]
        C2[SoSoValue Hub]
        C3[SoDEX Terminal]
    end

    subgraph External[External APIs]
        F[SoSoValue OpenAPI v1]
        G[SoDEX Spot REST]
        H[Grok xAI API]
    end

    subgraph Core[Core Logic]
        I[useNews / useTickers]
        J[signals.js Lexicon]
        K[createSoSoClient]
        L[sodexSpot client]
        M[GrokAPI]
    end

    C --> C1 & C2 & C3
    C1 --> I
    I --> F
    I --> J
    C2 --> K --> F
    C3 --> L --> G
    D --> K & L
    D --> M --> H
    A --> I
```



---

## User Flow

```mermaid
sequenceDiagram
    participant User
    participant UI as CryptoDesk UI
    participant SoSo as SoSoValue API
    participant SoDEX as SoDEX Spot API
    participant Sig as Signal Engine
    participant Grok as Grok API

    User->>UI: Enter API keys → Connect
    UI->>SoSo: GET /news (or /hot, /featured)
    SoSo-->>UI: Headlines
    UI->>Sig: buildSignals(headlines)
    Sig-->>UI: Ranked signals (strength ≥2)
    UI-->>User: News cards + stats strip

    opt SoSoValue Hub tab
        User->>UI: Open SoSoValue Hub
        par 8 parallel calls
            UI->>SoSo: sectors, ETF, macro, indices…
        end
        SoSo-->>UI: Dashboard cards
    end

    opt SoDEX tab
        User->>UI: Open SoDEX Terminal
        par 4 parallel calls
            UI->>SoDEX: symbols, tickers, orderbook, trades
        end
        SoDEX-->>UI: Market depth
    end

    opt AI briefing
        User->>UI: Generate Briefing
        UI->>Grok: chat/completions (top headlines)
        Grok-->>UI: Structured report
    end
```



---

## Data Flow

```mermaid
flowchart TD
    A[SoSoValue API Key] --> B[useNews Hook]
    B --> C[/news · /news/hot · /news/featured]
    C --> D[News Cards]
    C --> E[buildSignals]
    E --> F[Signal Feed]
    E --> G[Sentiment % in Stats Strip]

    A --> H[createSoSoClient]
    H --> I[Hub + Intel Panels]
    I --> J[macro · sectors · ETF · indices · treasuries · fundraising]

    K[No key required] --> L[sodexSpot]
    L --> M[symbols · tickers · orderbook · trades]
    M --> N[SoDEX Terminal + Orderbook Panel]

    O[Grok API Key] --> P[GrokAPI]
    P --> Q[Briefing · Article Analysis · Signal Enhance]
    D --> P
```



---

## Signal Engine

The signal engine is **deterministic and local** — it runs on every headline without an LLM.

### Inputs

- Article `title` and `content` (HTML stripped)
- Optional `matched_currencies` from SoSoValue

### Lexicon


| Direction | Example cues                                                                         |
| --------- | ------------------------------------------------------------------------------------ |
| Bullish   | surge, rally, inflow, record, approval, adoption, launch, accumulation, etf, bullish |
| Bearish   | crash, dump, hack, exploit, ban, lawsuit, outflow, bearish, liquidation, sec         |


### Scoring rules

```mermaid
flowchart TD
    A[Headline Text] --> B[Count Bull / Bear Cues]
    B --> C{net = bull - bear}
    C -->|net ≥ 2| D[Bullish · strength = min5 net]
    C -->|net ≤ -2| E[Bearish · strength = min5 abs net]
    C -->|else| F[Neutral · strength 1]
    D --> G{strength ≥ 2?}
    E --> G
    F --> G
    G -- Yes --> H[Show in Signal Feed]
    G -- No --> I[Hidden from feed]
```



### Signal object

```js
{
  sentiment: 'bullish' | 'bearish' | 'neutral',
  strength: 1..5,
  asset: 'BTC' | 'ETH' | 'MARKET' | ...,
  title: string,
  reason: string,
  index: number  // news array index
}
```

---

## Grok AI Layer

Grok is **optional** and separate from SoSoValue / SoDEX.


| Feature          | Trigger              | Model                             |
| ---------------- | -------------------- | --------------------------------- |
| Daily briefing   | Masthead or nav      | `grok-2` via xAI chat completions |
| Article analysis | Article panel button | Same                              |
| Signal enhance   | Signal feed button   | Top 3 signals re-scored           |


Without a Grok key, lexicon signals and all SoSoValue / SoDEX data still work.

---

## SoSoValue Integration

**Base URL:** `https://openapi.sosovalue.com/openapi/v1`  
**Auth header:** `x-soso-api-key: <your-key>`

SoSoValue is the **primary intelligence layer** — news, macro, sectors, ETF flows, indices, treasuries, and fundraising.

### Endpoints used in the app


| Endpoint                               | UI location                     |
| -------------------------------------- | ------------------------------- |
| `GET /news`                            | News feed · Latest tab          |
| `GET /news/hot`                        | News feed · Hot tab             |
| `GET /news/featured`                   | News feed · Featured tab        |
| `GET /currencies`                      | Masthead ticker resolution      |
| `GET /currencies/{id}/market-snapshot` | BTC · ETH · SOL · BNB price bar |
| `GET /currencies/sector-spotlight`     | Hub card · Sector panel         |
| `GET /macro/events`                    | Hub card · Macro panel          |
| `GET /etfs/summary-history`            | Hub + ETF panel (BTC & ETH, US) |
| `GET /etfs`                            | Hub · ETF list card             |
| `GET /indices`                         | Hub · Indices panel             |
| `GET /indices/{ticker}/constituents`   | Indices panel (first index)     |
| `GET /btc-treasuries`                  | Hub · Treasuries panel          |
| `GET /fundraising/projects`            | Hub · Fundraising panel         |


### Additional client methods (ready in `sosovalue.js`)

Available in the client — wired to **SoDEX Terminal** kline panel:

- `GET /currencies/{id}/klines` — SoSoValue spot history (with API key)
- `GET /indices/{ticker}/klines` — index history (client ready)
- `GET /etfs/{ticker}/market-snapshot`
- `GET /indices/{ticker}/market-snapshot`
- `GET /indices/{ticker}/klines`
- `GET /btc-treasuries/{ticker}/purchase-history`
- `GET /analyses` · `GET /analyses/{name}`

### SoSoValue data flow

```mermaid
flowchart TD
    A[User API Key] --> B[createSoSoClient]
    B --> C[News Hooks]
    B --> D[SoSoValue Hub - 8 calls]
    B --> E[Intelligence Panels]
    C --> F[Headlines + Signals]
    D --> G[ETF · Sectors · Macro · Indices · Treasuries · Fundraising]
    E --> H[Side panel drill-down]
    F --> I[Grok Briefing Input]
```



### Demo mode (no key)

If no SoSoValue key is set, the feed loads `**mockNews()**` — clearly labeled via toast: *“Demo mode — connect SoSoValue API in settings.”*  
Intel panels show `Connect SoSoValue API key in Settings` instead of faking live macro/ETF data.

---

## SoDEX Integration

**Testnet base:** `https://testnet-gw.sodex.dev/api/v1/spot`  
**Mainnet base:** `https://mainnet-gw.sodex.dev/api/v1/spot` (client supports; UI defaults to testnet)

SoDEX is the **execution and microstructure layer** — public reads need **no API key**.

### Endpoints used in Wave 2


| Endpoint                          | Purpose       |
| --------------------------------- | ------------- |
| `GET /markets/symbols`            | Symbol picker |
| `GET /markets/tickers`            | Ticker strip  |
| `GET /markets/{symbol}/orderbook` | Bid/ask depth |
| `GET /markets/{symbol}/trades`    | Recent prints |


### Client also exposes

`coins`, `miniTickers`, `bookTickers`, `klines` — **klines** rendered in SoDEX Terminal (`GET /markets/{sym}/klines`).

### SoDEX data flow

```mermaid
flowchart TD
    A[Select Symbol e.g. vBTC_vUSDC] --> B[sodexSpot Parallel Fetch]
    B --> C[symbols]
    B --> D[tickers]
    B --> E[orderbook]
    B --> F[trades]
    C --> G[SoDEX Terminal UI]
    D --> G
    E --> G
    F --> G
    G --> H[Execution Preview Copy - Wave 3]
```



### SoDEX usage levels

```mermaid
flowchart TD
    A[SoDEX in CryptoDesk] --> B[Wave 2 - Live]
    A --> C[Wave 3 - Planned]

    B --> D[Public market data]
    B --> E[Orderbook + trades preview]
    B --> F[Signal → open terminal CTA]
    B --> G[15s auto-refresh]

    C --> H[Testnet order placement]
    C --> I[EIP-712 signing]
    C --> J[Wallet connect]
```



**Note:** `cd_sodex` in session storage is reserved for future authenticated actions. Public market data works without it.

---

## UI Surfaces

CryptoDesk uses a **three-column layout**: Nav · Main workspace · Intelligence panel.

```mermaid
flowchart TD
    A[CryptoDesk Terminal] --> B[Left Nav]
    A --> C[Center MainWorkspace]
    A --> D[Right IntelligencePanel]

    B --> B1[News categories]
    B --> B2[SoSoValue tools]
    B --> B3[SoDEX tools]
    B --> B4[AI tools]

    C --> C1[Tab: News Feed]
    C --> C2[Tab: SoSoValue Hub]
    C --> C3[Tab: SoDEX Terminal]

    D --> D1[Article / Briefing / Signals]
    D --> D2[Macro / ETF / Sectors / Indices]
    D --> D3[Treasuries / Fundraising / SoDEX snapshot]
```



### Center tabs


| Tab            | Route (in-app)   | Data source               |
| -------------- | ---------------- | ------------------------- |
| News feed      | `mainTab: news`  | SoSoValue `/news*`        |
| SoSoValue Hub  | `mainTab: soso`  | 8× SoSoValue endpoints    |
| SoDEX Terminal | `mainTab: sodex` | 4× SoDEX public endpoints |


### Masthead

- Live tickers (BTC, ETH, SOL, BNB) via currencies + market-snapshot
- **Generate Briefing** → Grok

### Trust bar

Articles count · Signals count · Bullish sentiment % · SoSoValue / SoDEX / Grok badges

---

## Client API Layer

There is **no Next.js `/api` backend**. All integration is in the browser:


| Module           | File                      | Role                                  |
| ---------------- | ------------------------- | ------------------------------------- |
| SoSoValue fetch  | `src/lib/api.js`          | `sosoFetch`, `unwrapData`, `apiProof` |
| SoSoValue client | `src/api/sosovalue.js`    | `createSoSoClient()`                  |
| SoDEX client     | `src/api/sodex.js`        | `sodexSpot.`*                         |
| Grok client      | `src/api/grok.js`         | `GrokAPI` class                       |
| News hook        | `src/hooks/useNews.js`    | Feed + signals + auto-refresh 60s     |
| Tickers hook     | `src/hooks/useTickers.js` | Masthead prices                       |


---

## Storage

CryptoDesk stores **only configuration** in the browser — no server database.

### Session storage keys

```text
cd_soso   → SoSoValue API key
cd_grok   → Grok (xAI) API key
cd_sodex  → Reserved for future SoDEX signing
cd_topic  → Optional briefing focus topic
cd_dark   → Theme preference
```

Keys are kept in `**sessionStorage**` (cleared when the tab closes). They are **never** written to the repository or committed to git.

### What is not stored

- No fake saved reports
- No seeded watchlist
- No hardcoded dashboard history
- No live order POST from browser (scaffold + mock sign only)

---

## Button Behavior

Every primary control maps to a real action:

```mermaid
flowchart TD
    A[Button Click] --> B{Has required key?}
    B -- SoSoValue panel, no key --> C[Show connect prompt / demo toast]
    B -- SoDEX public --> D[Fetch testnet REST]
    B -- Grok action, no key --> E[Show add Grok key message]
    B -- OK --> F[Run fetch or AI call]
    F --> G{Success?}
    G -- Yes --> H[Render data + apiProof footer]
    G -- No --> I[Toast error]
```




| Button                     | Behavior                                  |
| -------------------------- | ----------------------------------------- |
| ⚙ Settings                 | Open modal for API keys                   |
| Connect →                  | Save keys to sessionStorage · reload feed |
| Latest / Hot / Featured    | Switch SoSoValue news endpoint            |
| News category (nav)        | Filter `GET /news?category=`              |
| SoSo hub (nav)             | `mainTab → soso`                          |
| SoDEX terminal (nav)       | `mainTab → sodex`                         |
| ETF / Macro / Sectors / …  | Load panel in Intelligence column         |
| ✦ Generate Briefing        | Grok briefing from current feed           |
| ✦ Analyze with Grok        | Per-article Grok analysis                 |
| ✦ AI-enhance top 3 signals | Grok `scoreSignal` on top 3               |
| ◎ Preview top signal on SoDEX | Jump to **SoDEX Terminal** tab · `vBTC_vUSDC` |
| Open SoDEX terminal →      | From orderbook panel                      |
| Signal card click          | Open linked article in intel panel        |


---

## API Keys and Configuration


| Key            | Required for                          | Where to get                                        |
| -------------- | ------------------------------------- | --------------------------------------------------- |
| **SoSoValue**  | Live news, hub, intel panels          | [SoSoValue](https://sosovalue.com) developer portal |
| **Grok (xAI)** | Briefings, analysis, signal enhance   | [x.ai](https://x.ai)                                |
| **SoDEX**      | *Not required* for Wave 2 market data | Public REST on testnet                              |


### Settings flow

1. Open **Settings** (masthead).
2. Paste SoSoValue key (required for live data panels).
3. Paste Grok key (optional).
4. Click **Connect →** → toast *“Connected — loading live data…”*

---

## Installation

```bash
git clone https://github.com/Nanle-code/CryptoDesk.git
cd CryptoDesk   # or cryptodesk-project/cryptodesk
npm install
```

---

## Running Locally

```bash
npm run dev
```

Open:

```text
http://localhost:5173/CryptoDesk/
```

(Vite `base` is `/CryptoDesk/` for GitHub Pages.)

---

## Build and Deploy

```bash
npm run build    # output → dist/
npm run preview  # local preview of production build
```

### GitHub Pages

The repo uses `.github/workflows/deploy.yml` to build `cryptodesk/` and publish `dist/` to GitHub Pages.

**Live URL:** [https://nanle-code.github.io/CryptoDesk/index.html](https://nanle-code.github.io/CryptoDesk/index.html)

### Other hosts

Deploy the contents of `dist/` to any static host (Netlify, Vercel, S3, etc.). Set the site base path to `/CryptoDesk/` or adjust `vite.config.js` `base`.

---

## Project Structure

```text
cryptodesk/
├── index.html                 # Vite entry
├── package.json
├── vite.config.js             # base: /CryptoDesk/
├── README.md
├── docs/
│   ├── WAVE2_SUBMISSION.md    # AKINDO copy-paste text
│   └── ROADMAP.md
├── legacy/                    # Wave 1 vanilla HTML (archived)
├── src/
│   ├── App.jsx                # Shell: Nav + MainWorkspace + Intel
│   ├── main.jsx
│   ├── api/
│   │   ├── sosovalue.js       # createSoSoClient — full OpenAPI surface
│   │   ├── sodex.js           # sodexSpot public REST
│   │   └── grok.js            # GrokAPI briefings + analysis
│   ├── components/
│   │   ├── MainWorkspace.jsx  # Tabs: News | SoSo Hub | SoDEX
│   │   ├── SoSoDashboard.jsx  # 8 parallel SoSoValue calls
│   │   ├── SoDEXTerminal.jsx  # Orderbook + trades terminal
│   │   ├── NewsFeed.jsx
│   │   ├── Nav.jsx            # SoSoValue × SoDEX navigation
│   │   ├── IntelligencePanel.jsx
│   │   ├── Masthead.jsx
│   │   ├── TrustBar.jsx
│   │   ├── SignalList.jsx
│   │   ├── SettingsModal.jsx
│   │   └── …
│   ├── context/
│   │   └── ConfigContext.jsx  # sessionStorage keys
│   ├── hooks/
│   │   ├── useNews.js
│   │   └── useTickers.js
│   ├── lib/
│   │   ├── api.js             # sosoFetch, apiProof
│   │   ├── signals.js         # Lexicon engine
│   │   ├── format.js
│   │   └── mockNews.js        # Demo mode only
│   └── styles/
│       └── app.css            # Dark cyber-fintech design system
└── dist/                      # Production build (generated)
```

---

## Safety Rules

CryptoDesk follows these rules for hackathon integrity:

1. **No mock data when live panels claim to be live** — macro, ETF, sectors, treasuries require a SoSoValue key.
2. **Demo mode is explicit** — toast + `mockNews()` only for the news feed without a key.
3. **API proof on panels** — endpoint string + UTC time on data blocks.
4. **No silent fallback** — failed API calls show errors, not fake numbers.
5. **No wallet required** for Wave 2.
6. **No order execution** on SoDEX in Wave 2 — preview only.
7. **No auto-trading.**
8. **Keys stay in sessionStorage** — never committed to the repo.
9. **Grok is labeled** — AI briefings are clearly Grok-generated, not SoSoValue.
10. **Honest submission copy** — see `docs/WAVE3_SUBMISSION.md`.

---

## Error Handling

```mermaid
flowchart TD
    A[API Request] --> B{Success?}
    B -- Yes --> C[unwrapData + render]
    B -- No --> D{Error type}

    D --> E[No SoSoValue key]
    D --> F[SoSoValue HTTP / code ≠ 0]
    D --> G[SoDEX network error]
    D --> H[Grok 401 / rate limit]

    E --> I[Demo news OR connect prompt]
    F --> J[feed-status error / panel error]
    G --> K[hub-error / sodex error banner]
    H --> L[Toast: Grok error]
```



---

## Roadmap

```mermaid
timeline
    title CryptoDesk Roadmap

    section Wave 1 — Done
        Live news feed : SoSoValue /news
        Grok briefings : xAI integration
        Vanilla SPA : legacy/index.html

    section Wave 2 — Done
        React terminal : Vite + React 19
        SoSoValue Hub : 8+ endpoints
        SoDEX terminal : Public testnet REST

    section Wave 3 — Current
        Opportunity engine : Discovery + explainability
        AI agents : Committee · Copilot · Portfolio · SSI · Strategy
        Auto Grok classify : Top 5 on feed load
        Execution preview : SoDEX bound card
        Judge demo wizard : 7-step guided flow
        Watchlist : Sentiment + narrative alerts
        Signal archive : Session history + JSON export
        Kline charts : SoDEX + SoSo dual panel

    section Wave 4 — Current
        Order scaffold : EIP-712 POST preview
        Order audit : Session log + JSON export
        Live POST : Requires SoDEX SDK + key
```



---

## Demo Flow for Judges

**Fastest path:** Left nav → **🏁 Judge demo** → click **Run this step** through all 7 steps (connect → explainability).

Use **DevTools → Network** open to verify `openapi.sosovalue.com`, `api.x.ai`, and `testnet-gw.sodex.dev`.

```mermaid
flowchart TD
    A[🏁 Judge demo wizard] --> B[0 Connect · Settings]
    B --> C[1 News feed · GET /news]
    C --> D[2 AI signals · Grok auto-classify]
    D --> E[3 Opportunities · Why/Risks]
    E --> F[4 Investment committee]
    F --> G[5 Portfolio agent]
    G --> H[6 SoDEX execution preview card]
    H --> I[7 Explainability bullets]
```

### Legacy 60-second script (Wave 2 panels still work)

```mermaid
flowchart TD
    A[Live demo URL] --> B[⚙ Settings · Connect →]
    B --> C[News feed tab · Latest]
    C --> D[Verify GET /news code 0]
    D --> E[🔥 Opportunities panel]
    E --> F[Committee + Execution preview]
    F --> G[SoDEX tab · vETH_vUSDC depth]
    G --> H[SoSoValue Hub · 8 parallel GETs]
    H --> I[Generate Briefing · Grok]
```

### What to verify

| Check | Pass criteria |
|-------|----------------|
| SoSoValue auth | `openapi.sosovalue.com` · `code: 0` on `/news` |
| Hub load | 8 requests when opening **SoSoValue Hub** tab |
| Intel panels | ETF / macro / sector JSON matches UI (not static HTML) |
| SoDEX (no key) | `testnet-gw.sodex.dev/api/v1/spot/...` succeeds without SoDEX key |
| Signals | Trust bar **Signals** count > 0 when news has strong headlines |
| Agent CTA | **🏁 Judge demo** runs full data-to-decision path |
| Wave 3 | Opportunities · Committee · Execution preview card · Explainability |
| Honesty | `nextstep.md` + `docs/WAVE3_SUBMISSION.md` match UI |

---

## Quality Checklist

### Wave 3 (shipped)

- [x] Auto Grok signal classification (top 5 on load)
- [x] Opportunity discovery engine + auto Why? / Risks
- [x] Investment committee (4 agents)
- [x] Unified SoDEX execution preview card
- [x] Research copilot · Narratives · Watchlist (sentiment + narrative)
- [x] Portfolio agent · SSI index builder (live constituents)
- [x] Strategy generator (any opportunity)
- [x] Judge demo wizard (7 steps)
- [x] Persistent signal archive (sessionStorage + export)
- [x] Kline charts — SoDEX candles + SoSoValue area (1H / 4H / 1D)
- [x] EIP-712 order execution scaffold (Prepare signed order on SoDEX tab)
- [x] Order audit log panel (left nav · SoDEX section)

### Wave 2 (shipped)

- [x] React 19 + Vite terminal · three-column layout
- [x] Center tabs: News feed · SoSoValue Hub · SoDEX Terminal
- [x] SoSoValue news (`/news`, `/hot`, `/featured`) + category filters
- [x] SoSoValue Hub (8 parallel endpoints on tab open)
- [x] Live masthead tickers (currencies + market-snapshot)
- [x] Intel panels: macro, sectors, dual ETF, indices, treasuries, fundraising, SoDEX snapshot
- [x] Lexicon signal engine + **⚡ Signal feed** + **◎ Preview on SoDEX** CTA
- [x] Grok: briefing, article analysis, top-3 signal enhance
- [x] SoDEX terminal: symbols, tickers, orderbook, trades (15s refresh, no key)
- [x] **⟳ Agent workflow** panel + API proof footers
- [x] `npm run build` passes
- [ ] Final demo video (Network tab visible)

### Engineering checklist

- All nav tools load correct panel or tab
- No mock data in SoSoValue panels when key is connected
- Demo mode only affects news feed without key
- SoDEX works without SoDEX key
- Signal → SoDEX CTA opens terminal tab
- Mobile layout acceptable
- README matches live behavior

---

## Disclaimer

CryptoDesk Terminal is a **market intelligence and decision-support tool** for research and education.

It does **not** provide financial advice. Signals, briefings, and AI outputs are informational. Users are responsible for their own trading decisions. SoDEX execution preview does not place orders in Wave 2.

---

## One-Line Summary

**CryptoDesk Terminal is a SoSoValue-powered intelligence workstation that scores live news into signals, explains markets with Grok AI, and previews SoDEX orderbook depth before execution — built for the SoSoValue Buildathon Wave 2.**

---

*Powered by [SoSoValue](https://sosovalue.com) · [SoDEX](https://sodex.com) · [Grok / xAI*](https://x.ai)