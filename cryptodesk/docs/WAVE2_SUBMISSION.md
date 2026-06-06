# CryptoDesk — Wave 2 Submission (copy-paste for AKINDO)

Use this text in the buildathon form. Keep it factual — no marketing superlatives.

---

## Project name

**CryptoDesk Terminal** (by Nanle — distinct from other CryptoDesk submissions)

## One-sentence description

Browser intelligence terminal that ingests live SoSoValue market data, scores news into trading signals, and generates Grok AI briefings — with SoDEX testnet preview for execution planning.

## Target users

Solo crypto researchers and retail traders who need one screen for news, flows, sectors, and signals without a Bloomberg terminal budget.

## Core user workflow (60-second demo)

1. Open live demo → **Settings** → enter SoSoValue + Grok API keys → **Connect**
2. **Latest** news loads from `GET /news` (verify in DevTools → Network)
3. Click ** Signal Feed** → headlines scored (sentiment, strength 1–5, asset)
4. Click **₿ ETF Flow Monitor** → live `GET /etfs/summary-history?symbol=BTC&country_code=US`
5. Click **⊡ Macro Calendar** → `GET /macro/events`
6. Click **◈ Sector Spotlight** → `GET /currencies/sector-spotlight`
7. Click ** Generate Briefing** → Grok structured report from the same feed
8. Click **⟳ Agent Workflow** → shows ingest → analyze → signal → preview → execute (W3)
9. Optional: **◎ SoDEX Preview** with testnet API key (read-only markets)

## SoSoValue APIs integrated (Wave 2)

| Endpoint | UI location |
|----------|-------------|
| `GET /news`, `/news/hot`, `/news/featured` | Main feed |
| `GET /currencies` + `/currencies/{id}/market-snapshot` | BTC/ETH/SOL/BNB ticker bar |
| `GET /macro/events` | Macro Calendar panel |
| `GET /currencies/sector-spotlight` | Sector Spotlight panel |
| `GET /etfs/summary-history` | ETF Flow Monitor |
| `GET /indices` | SoSo Indices panel |

Each panel footer shows the exact endpoint + UTC timestamp.

## AI / agentic layer

- **Grok**: daily briefing + per-article analysis
- **Signal engine**: lexicon scoring on every headline (strength ≥2 surfaced); optional Grok enhancement for top 3 signals
- **Agent loop** (documented in UI): Ingest → Analyze → Signal → Preview (SoDEX) → Execute (Wave 3)

## SoDEX

- **Wave 2**: optional testnet read-only `GET /v1/markets` (no orders placed)
- **Wave 3**: order placement + rebalance with confirmation

## Links

- **Live demo:** https://nanle-code.github.io/CryptoDesk/index.html
- **GitHub:** https://github.com/Nanle-code/CryptoDesk
- **Video:** _(add 90s screen recording with Network tab visible)_

## Wave 2 changelog

- Wired live macro, sector, ETF, index, and ticker APIs (replaced mock panels)
- Added Signal Feed + agent workflow panel
- Added ETF flow monitor with daily net inflow table
- SoDEX testnet preview (read-only)
- API endpoint proof on every data panel

## What judges should verify

1. Network requests to `openapi.sosovalue.com` return `code: 0`
2. Macro/sector/ETF panels match API responses (not static HTML)
3. Signal count in stats strip updates when news loads
4. Submission text matches what the demo actually does

---

*SoSoValue Buildathon 2026 · Wave 2*
