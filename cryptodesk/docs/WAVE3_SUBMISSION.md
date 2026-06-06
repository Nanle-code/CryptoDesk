# CryptoDesk — Wave 3 Submission (copy-paste for AKINDO)

Use this text in the buildathon form. Keep it factual — no marketing superlatives.

---

## Project name

**CryptoDesk Terminal** (by Nanle)

## One-sentence description

AI-powered opportunity discovery terminal: SoSoValue market data → Grok classification → ranked opportunities with explainability → multi-agent committee → SoDEX execution preview — one browser tab, no backend.

## Target users

Solo crypto researchers and retail traders who need a full data-to-decision loop (news, signals, portfolio ideas, execution preview) without a Bloomberg terminal budget.

## Core user workflow (Wave 3 judge demo)

**Fastest path:** Left nav → ** Judge demo** → **Run this step** through all 7 steps.

Manual equivalent:

1. **Settings** → SoSoValue + Grok keys → **Connect**
2. **News feed** loads → `GET /news` (Network tab: `code: 0`)
3. Grok auto-classifies **top 5** signals (trust bar: *Grok classifying…*)
4. ** Opportunities** → cards with **Why?** / **Risks** bullets
5. **Committee** on top opportunity → Analyst · Risk · Macro · Execution
6. **Portfolio agent** → allocation sleeves from live feed
7. **Execution preview** → SoDEX tab + bound preview card (allocation, slippage, route)
8. **Price charts** → dual klines (SoDEX testnet + SoSoValue) with 1H / 4H / 1D intervals
9. **Prepare signed order** on SoDEX tab → EIP-712 JSON + curl (no live POST)
10. ** Order audit** → left nav after preparing an order
11. ** Signal archive** → session history (export JSON)

## SoSoValue APIs integrated

| Endpoint | UI location |
|----------|-------------|
| `GET /news`, `/news/hot`, `/news/featured` | News feed |
| `GET /currencies` + market snapshots | Masthead tickers |
| `GET /macro/events` | Macro panel |
| `GET /currencies/sector-spotlight` | Sectors + Narratives |
| `GET /etfs/summary-history` | ETF Flow Monitor |
| `GET /indices` + `/indices/{ticker}/constituents` | SSI indices + Index Builder |
| `GET /btc-treasuries`, `/fundraising/projects` | Treasuries · Fundraising |
| SoSoValue Hub tab | 8 parallel GETs on tab open |

## Grok AI / agentic layer

| Agent | Purpose |
|-------|---------|
| Auto classify | Top 5 signals on every feed load |
| Opportunity explainability | Why? / Risks on every card (lexicon + Grok top 3) |
| Investment committee | 4-agent review + allocation % |
| Research copilot | Free-form research Q&A |
| Narrative rotation | Current vs emerging themes |
| Portfolio agent | Capital / risk / goal → allocations |
| SSI index builder | Grok weights aligned to live SoSo constituents |
| Strategy generator | Playbook from any opportunity |
| Daily briefing | Structured market report |

## SoDEX

- **Shipped:** Public testnet REST — symbols, tickers, orderbook, trades (15s refresh)
- **Shipped:** Unified **execution preview card** bound to opportunity + committee data
- **Scaffold:** EIP-712 order builder — JSON body, typed data, curl preview (`POST /trade/orders/batch`)
- **Not shipped:** Live signed POST from browser (requires SoDEX SDK + private key)

## Wave 3 differentiators vs Wave 2

- Opportunity discovery engine (not just signal list)
- Auto AI classification on load (not manual button only)
- Investment committee + portfolio + strategy agents
- Explainability bullets on every opportunity
- Judge demo wizard (guided 7-step flow)
- Persistent signal archive (sessionStorage, export JSON)
- Dual kline charts on SoDEX tab (SoDEX + SoSoValue)
- Order audit log with export JSON

## Links

- **Live demo:** https://nanle-code.github.io/CryptoDesk/index.html
- **GitHub:** https://github.com/Nanle-code/CryptoDesk
- **Strategy doc:** `nextstep.md` in repo root
- **Video:** _(add 90s screen recording with Network tab visible)_

## What judges should verify

1. `openapi.sosovalue.com` returns `code: 0` on `/news`
2. Trust bar shows **Lexicon + Grok** after classify completes
3. Opportunity cards show **Why?** and **Risks** without clicking Risk assess first
4. SoDEX tab shows **execution preview card** when opened from an opportunity
5. ** Judge demo** walks panels 1→7 with toast + panel navigation
6. ** Signal archive** grows as feed refreshes; Export JSON works
7. **SoDEX tab** → dual kline charts load from `…/klines` (Network tab)

---

*SoSoValue Buildathon 2026 · Wave 3*
