/**
 * CryptoDesk Wave 2 — Live data panels, signal engine, SoDEX preview
 */
(function () {
  'use strict';

  let currencyIdCache = null;
  let signalCache = [];

  function unwrapData(res) {
    if (res == null) return null;
    if (res.code === 0 && res.data !== undefined) return res.data;
    if (Array.isArray(res)) return res;
    return res.data ?? res;
  }

  function fmtPct(raw) {
    const v = parseFloat(raw);
    if (Number.isNaN(v)) return '—';
    const pct = Math.abs(v) <= 1 && v !== 0 ? v * 100 : v;
    return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
  }

  function fmtUsd(n) {
    const v = parseFloat(n);
    if (Number.isNaN(v)) return '—';
    const abs = Math.abs(v);
    if (abs >= 1e9) return (v < 0 ? '-' : '') + '$' + (abs / 1e9).toFixed(2) + 'B';
    if (abs >= 1e6) return (v < 0 ? '-' : '') + '$' + (abs / 1e6).toFixed(1) + 'M';
    return (v < 0 ? '-' : '') + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 });
  }

  function apiProof(endpoint) {
    return `<p class="api-proof">Live · <code>${endpoint}</code> · ${new Date().toISOString().slice(11, 19)} UTC</p>`;
  }

  function panelLoading(label) {
    document.getElementById('intelBody').innerHTML = `
      <div class="intel-block"><div class="intel-block-label">${label}</div>
      <div class="intel-block-body">${[1, 2, 3, 4].map(() => `<div class="skel" style="height:11px;margin-bottom:8px;width:${55 + Math.random() * 40}%;"></div>`).join('')}</div></div>`;
  }

  async function soso(path, params) {
    if (!window.CFG?.sosoKey) throw new Error('SoSoValue API key required');
    return window.sosoGet(path, params);
  }

  async function resolveCurrencyIds(symbols) {
    if (!currencyIdCache) {
      const raw = await soso('/currencies');
      const list = unwrapData(raw);
      currencyIdCache = {};
      (Array.isArray(list) ? list : []).forEach((c) => {
        if (c.symbol) currencyIdCache[c.symbol.toUpperCase()] = c.currency_id;
      });
    }
    const out = {};
    symbols.forEach((sym) => { out[sym] = currencyIdCache[sym]; });
    return out;
  }

  /** Lexicon signal scoring — no AI required */
  function scoreArticle(item) {
    const text = `${item.title || ''} ${(item.content || '').replace(/<[^>]+>/g, ' ')}`.toLowerCase();
    const bull = ['surge', 'rally', 'inflow', 'record', 'approval', 'adoption', 'launch', 'accumulation', 'etf', 'bullish'];
    const bear = ['crash', 'dump', 'hack', 'exploit', 'ban', 'lawsuit', 'outflow', 'bearish', 'liquidation', 'sec'];
    let b = 0;
    let d = 0;
    bull.forEach((w) => { if (text.includes(w)) b++; });
    bear.forEach((w) => { if (text.includes(w)) d++; });
    const net = b - d;
    let sentiment = 'neutral';
    let strength = 1;
    if (net >= 2) { sentiment = 'bullish'; strength = Math.min(5, net); }
    else if (net <= -2) { sentiment = 'bearish'; strength = Math.min(5, Math.abs(net)); }
    const tickers = [...text.matchAll(/\$([A-Z]{2,5})\b/g)].map((m) => m[1]);
    const asset = tickers[0] || (item.matched_currencies?.[0]?.name) || 'MARKET';
    return {
      sentiment,
      strength,
      asset,
      title: item.title,
      reason: net > 0 ? `${b} bullish cues in headline` : net < 0 ? `${d} bearish cues in headline` : 'Mixed or low-conviction language',
      release_time: item.release_time,
      index: window.allNews?.indexOf(item) ?? -1,
    };
  }

  function buildSignalsFromNews() {
    if (!window.allNews?.length) {
      signalCache = [];
      return [];
    }
    signalCache = window.allNews
      .map(scoreArticle)
      .filter((s) => s.strength >= 2)
      .sort((a, b) => b.strength - a.strength);
    const el = document.getElementById('sSig');
    if (el) el.textContent = String(signalCache.length);
    return signalCache;
  }

  function renderSignalList(signals, limit) {
    const list = (signals || signalCache).slice(0, limit || 8);
    if (!list.length) {
      return `<p class="report-p" style="color:var(--ink-dim);">No strong signals (strength ≥2) in current feed. Load news or broaden categories.</p>`;
    }
    return `<div class="signal-list">${list.map((s) => `
      <div class="signal-item ${s.sentiment}" ${s.index >= 0 ? `onclick="selectCard(${s.index})" style="cursor:pointer;"` : ''}>
        <span class="signal-badge">${s.sentiment === 'bullish' ? 'Bull' : s.sentiment === 'bearish' ? 'Bear' : 'Hold'} · ${s.strength}/5</span>
        <div class="signal-content">
          <div class="signal-title">${window.escH(s.asset)} — ${window.escH((s.title || '').slice(0, 55))}${(s.title || '').length > 55 ? '…' : ''}</div>
          <div class="signal-desc">${window.escH(s.reason)}</div>
        </div>
      </div>`).join('')}</div>`;
  }

  async function loadTickersLive() {
    const pairs = [
      { sym: 'BTC', id: 'btc' },
      { sym: 'ETH', id: 'eth' },
      { sym: 'SOL', id: 'sol' },
      { sym: 'BNB', id: 'bnb' },
    ];
    if (!window.CFG?.sosoKey) return;
    try {
      const ids = await resolveCurrencyIds(pairs.map((p) => p.sym));
      await Promise.all(
        pairs.map(async ({ sym, id }) => {
          const cid = ids[sym];
          if (!cid) return;
          const snap = unwrapData(await soso(`/currencies/${cid}/market-snapshot`));
          if (!snap) return;
          const pe = document.getElementById(`t-${id}-p`);
          const ce = document.getElementById(`t-${id}-c`);
          const chg = parseFloat(snap.change_pct_24h);
          if (pe) pe.textContent = window.fmtPrice(snap.price);
          if (ce) {
            const pct = Math.abs(chg) <= 1 && chg !== 0 ? chg * 100 : chg;
            ce.textContent = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
            ce.className = 'chg ' + (pct >= 0 ? 'up' : 'down');
          }
        })
      );
    } catch (e) {
      console.warn('[tickers]', e);
    }
  }

  async function showMacroLive() {
    document.getElementById('intelTitle').textContent = 'Macro Calendar';
    document.getElementById('intelSub').textContent = 'GET /macro/events';
    panelLoading('Loading macro events…');

    if (!window.CFG?.sosoKey) {
      document.getElementById('intelBody').innerHTML = `<div class="intel-empty"><p>Connect SoSoValue API in Settings.</p></div>`;
      return;
    }

    try {
      const raw = unwrapData(await soso('/macro/events'));
      const rows = Array.isArray(raw) ? raw : [];
      const today = new Date().toISOString().slice(0, 10);
      const upcoming = rows
        .filter((d) => d.date >= today)
        .slice(0, 14);

      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">⊡ Upcoming macro events</div>
          <div class="intel-block-body">
            ${upcoming.length ? upcoming.map((day) => `
              <div class="macro-day">
                <div class="macro-day-date">${window.escH(day.date)}</div>
                ${(day.events || []).map((ev) => `
                  <div class="macro-item">
                    <div class="macro-impact-bar impact-high"></div>
                    <div class="macro-name">${window.escH(ev)}</div>
                  </div>`).join('')}
              </div>`).join('') : '<p class="report-p">No upcoming events returned.</p>'}
            ${apiProof('GET /macro/events')}
          </div>
        </div>`;
      window.toast('Macro calendar loaded from SoSoValue');
    } catch (e) {
      document.getElementById('intelBody').innerHTML = `<p class="report-p">API error: ${window.escH(e.message)}</p>`;
    }
  }

  async function showSectorsLive() {
    document.getElementById('intelTitle').textContent = 'Sector Spotlight';
    document.getElementById('intelSub').textContent = 'GET /currencies/sector-spotlight';
    panelLoading('Loading sectors…');

    if (!window.CFG?.sosoKey) {
      document.getElementById('intelBody').innerHTML = `<div class="intel-empty"><p>Connect SoSoValue API in Settings.</p></div>`;
      return;
    }

    try {
      const raw = unwrapData(await soso('/currencies/sector-spotlight'));
      const sectors = [...(raw?.sector || []), ...(raw?.spotlight || []).map((s) => ({ ...s, _spot: true }))];
      const maxAbs = Math.max(...sectors.map((s) => Math.abs(parseFloat(s['24h_change_pct']) || 0)), 0.0001);

      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">◈ Sector & spotlight · 24h</div>
          <div class="intel-block-body">
            ${sectors.map((s) => {
              const chg = parseFloat(s['24h_change_pct']) || 0;
              const pct = Math.abs(chg) <= 1 ? chg * 100 : chg;
              const up = pct >= 0;
              const barW = Math.round((Math.abs(chg) / maxAbs) * 100);
              const label = (s.name || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
              return `
                <div class="sector-item">
                  <div class="sector-name">${window.escH(label)}${s._spot ? ' ★' : ''}</div>
                  <div class="sector-bar-wrap"><div class="sector-bar" style="width:${barW}%;background:${up ? 'var(--bull)' : 'var(--bear)'}"></div></div>
                  <div class="sector-chg" style="color:${up ? 'var(--bull)' : 'var(--bear)'}">${fmtPct(chg)}</div>
                </div>`;
            }).join('')}
            ${apiProof('GET /currencies/sector-spotlight')}
          </div>
        </div>`;
      window.toast('Sector data loaded from SoSoValue');
    } catch (e) {
      document.getElementById('intelBody').innerHTML = `<p class="report-p">API error: ${window.escH(e.message)}</p>`;
    }
  }

  async function showETFFlows() {
    document.getElementById('intelTitle').textContent = 'ETF Flow Monitor';
    document.getElementById('intelSub').textContent = 'GET /etfs/summary-history';
    panelLoading('Loading BTC ETF flows…');

    if (!window.CFG?.sosoKey) {
      document.getElementById('intelBody').innerHTML = `<div class="intel-empty"><p>Connect SoSoValue API in Settings.</p></div>`;
      return;
    }

    try {
      const raw = unwrapData(await soso('/etfs/summary-history', { symbol: 'BTC', country_code: 'US', limit: 14 }));
      const rows = Array.isArray(raw) ? raw : [];
      const latest = rows[0];
      const totalIn = rows.reduce((a, r) => a + (parseFloat(r.total_net_inflow) || 0), 0);

      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">₿ US Bitcoin ETF flows</div>
          <div class="intel-block-body">
            ${latest ? `
              <div class="etf-hero">
                <div class="etf-hero-label">Latest session · ${window.escH(latest.date)}</div>
                <div class="etf-hero-val" style="color:${parseFloat(latest.total_net_inflow) >= 0 ? 'var(--bull)' : 'var(--bear)'}">${fmtUsd(latest.total_net_inflow)}</div>
                <div class="etf-hero-sub">Net inflow · Vol ${fmtUsd(latest.total_value_traded)}</div>
              </div>` : ''}
            <div class="etf-table">
              ${rows.slice(0, 10).map((r) => {
                const inf = parseFloat(r.total_net_inflow);
                return `<div class="etf-row">
                  <span>${window.escH(r.date)}</span>
                  <span style="color:${inf >= 0 ? 'var(--bull)' : 'var(--bear)'};font-family:var(--f-mono);font-size:10px;">${fmtUsd(inf)}</span>
                </div>`;
              }).join('')}
            </div>
            <p class="report-p" style="margin-top:8px;font-size:11px;">14-day net sum: <strong style="color:${totalIn >= 0 ? 'var(--bull)' : 'var(--bear)'}">${fmtUsd(totalIn)}</strong></p>
            ${apiProof('GET /etfs/summary-history?symbol=BTC&country_code=US')}
          </div>
        </div>`;
      window.toast('ETF flow data loaded');
    } catch (e) {
      document.getElementById('intelBody').innerHTML = `<p class="report-p">API error: ${window.escH(e.message)}</p>`;
    }
  }

  async function showIndices() {
    document.getElementById('intelTitle').textContent = 'SoSoValue Indices';
    document.getElementById('intelSub').textContent = 'GET /indices';
    panelLoading('Loading indices…');

    if (!window.CFG?.sosoKey) {
      document.getElementById('intelBody').innerHTML = `<div class="intel-empty"><p>Connect SoSoValue API in Settings.</p></div>`;
      return;
    }

    try {
      const raw = unwrapData(await soso('/indices'));
      const list = Array.isArray(raw) ? raw : (raw?.list || []);
      const top = list.slice(0, 12);

      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">SSI · On-chain indices</div>
          <div class="intel-block-body">
            ${top.length ? top.map((idx) => `
              <div class="index-row">
                <span class="index-ticker">${window.escH(idx.ticker || idx.symbol || idx.name || '—')}</span>
                <span class="index-name">${window.escH(idx.name || idx.full_name || '')}</span>
              </div>`).join('') : '<p class="report-p">No indices returned.</p>'}
            ${apiProof('GET /indices')}
          </div>
        </div>`;
      window.toast('Index list loaded');
    } catch (e) {
      document.getElementById('intelBody').innerHTML = `<p class="report-p">API error: ${window.escH(e.message)}</p>`;
    }
  }

  async function showSignalFeed() {
    document.getElementById('intelTitle').textContent = 'Signal Feed';
    document.getElementById('intelSub').textContent = 'News → lexicon engine → ranked signals';
    buildSignalsFromNews();

    document.getElementById('intelBody').innerHTML = `
      <div class="intel-block">
        <div class="intel-block-label">⚡ Agentic signals · strength ≥2</div>
        <div class="intel-block-body">
          ${renderSignalList(signalCache, 12)}
          <p class="report-p" style="font-size:11px;margin-top:10px;color:var(--ink-dim);">Scored from live SoSoValue headlines. Add Grok for article-level AI analysis.</p>
        </div>
      </div>
      ${window.CFG?.claudeKey ? `<button class="briefing-trigger" style="width:100%;justify-content:center;margin-top:8px;color:var(--paper);background:var(--ink);" onclick="enhanceTopSignalsWithGrok()">✦ AI-enhance top 3 signals</button>` : ''}
    `;
  }

  async function showSoDEXPreview() {
    document.getElementById('intelTitle').textContent = 'SoDEX Preview';
    document.getElementById('intelSub').textContent = 'Read-only · testnet';
    panelLoading('Connecting to SoDEX testnet…');

    const key = window.CFG?.sodexKey;
    const base = 'https://testnet-api.sodex.com';

    if (!key) {
      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">Execution preview (Wave 2)</div>
          <div class="intel-block-body">
            <p class="report-p">Add optional <strong>SoDEX API key</strong> in Settings for live testnet market data. Wave 3 adds order placement with confirmation.</p>
            <div class="workflow-steps">
              <div class="wf-step done">1 · Signal from news</div>
              <div class="wf-step done">2 · ETF + sector context</div>
              <div class="wf-step">3 · Order preview (SoDEX)</div>
              <div class="wf-step dim">4 · Execute (Wave 3)</div>
            </div>
          </div>
        </div>`;
      return;
    }

    try {
      const res = await fetch(`${base}/v1/markets`, {
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const markets = data.data || data.markets || (Array.isArray(data) ? data : []);
      const sample = markets.slice(0, 8);

      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-label">SoDEX testnet markets</div>
          <div class="intel-block-body">
            ${sample.map((m) => `
              <div class="index-row">
                <span class="index-ticker">${window.escH(m.symbol || m.pair || m.id || '—')}</span>
                <span class="index-name">${window.escH(m.status || 'open')}</span>
              </div>`).join('')}
            ${apiProof('GET testnet-api.sodex.com/v1/markets')}
            <p class="report-p" style="margin-top:8px;font-size:11px;color:var(--ink-dim);">Read-only. No orders placed in Wave 2.</p>
          </div>
        </div>`;
      window.toast('SoDEX testnet connected');
    } catch (e) {
      document.getElementById('intelBody').innerHTML = `
        <div class="intel-block">
          <div class="intel-block-body">
            <p class="report-p">SoDEX testnet unreachable from browser (${window.escH(e.message)}). CORS or key may apply — execution preview documented for Wave 3.</p>
            <div class="workflow-steps">
              <div class="wf-step done">Signal</div><div class="wf-step done">Context</div>
              <div class="wf-step">Preview</div><div class="wf-step dim">Execute W3</div>
            </div>
          </div>
        </div>`;
    }
  }

  function showAgentWorkflow() {
    document.getElementById('intelTitle').textContent = 'Agent Workflow';
    document.getElementById('intelSub').textContent = 'Data → insight → preview';

    document.getElementById('intelBody').innerHTML = `
      <div class="intel-block">
        <div class="intel-block-label">CryptoDesk agent loop (Wave 2)</div>
        <div class="intel-block-body">
          <div class="workflow-steps vertical">
            <div class="wf-step done"><strong>INGEST</strong> — SoSoValue <code>/news</code>, <code>/macro/events</code>, <code>/sector-spotlight</code>, <code>/etfs/summary-history</code></div>
            <div class="wf-step done"><strong>ANALYZE</strong> — Grok daily briefing + lexicon signal engine on each headline</div>
            <div class="wf-step done"><strong>SIGNAL</strong> — Ranked feed (sentiment, strength 1–5, asset)</div>
            <div class="wf-step"><strong>PREVIEW</strong> — SoDEX testnet market read (optional key)</div>
            <div class="wf-step dim"><strong>EXECUTE</strong> — Wave 3: confirm → place order on SoDEX</div>
          </div>
          <p class="report-p" style="margin-top:12px;">Every panel shows the exact API endpoint used. Open DevTools → Network to verify live calls.</p>
        </div>
      </div>`;
  }

  function renderLiveSignalBlock() {
    buildSignalsFromNews();
    return `
      <div class="intel-block">
        <div class="intel-block-label">◈ Live signals (from feed)</div>
        <div class="intel-block-body">${renderSignalList(signalCache, 3)}</div>
      </div>`;
  }

  function mockNews() {
    const now = Date.now();
    return [
      { title: 'Bitcoin ETF sees $120M net inflow as institutional demand persists', content: 'BlackRock IBIT leads weekly $BTC inflows amid bullish macro setup.', category: 3, category_name: 'Institutional', release_time: now - 3600000, nick_name: 'Demo', tags: ['ETF', 'BTC'] },
      { title: 'Ethereum L2 volumes hit record as DeFi adoption accelerates', content: '$ETH ecosystem growth continues with Arbitrum and Base surge.', category: 2, release_time: now - 7200000, nick_name: 'Demo', matched_currencies: [{ name: 'ETH' }] },
      { title: 'SEC delays decision on spot crypto ETF applications', content: 'Regulatory uncertainty weighs on altcoins; bearish sentiment in mid-caps.', category: 1, release_time: now - 10800000, nick_name: 'Demo' },
      { title: 'Solana DeFi TVL rebounds 15% after network upgrade', content: '$SOL rallies as developers launch new perp dex protocols.', category: 2, release_time: now - 14400000, nick_name: 'Demo', matched_currencies: [{ name: 'SOL' }] },
      { title: 'Macro: Fed officials signal cautious rate path ahead of CPI', content: 'Risk assets watch FOMC minutes; Bitcoin consolidates near highs.', category: 3, release_time: now - 18000000, nick_name: 'Demo' },
    ];
  }

  async function enhanceTopSignalsWithGrok() {
    if (!window.CFG?.claudeKey || !window.GrokAPI) {
      window.toast('Grok API key required');
      return;
    }
    const top = signalCache.slice(0, 3);
    if (!top.length) return;
    window.toast('Enhancing top signals with Grok…');
    const grok = new window.GrokAPI(window.CFG.claudeKey);
    for (const sig of top) {
      const item = window.allNews[sig.index];
      if (!item) continue;
      try {
        const ai = await grok.scoreSignal(item);
        sig.sentiment = ai.sentiment || sig.sentiment;
        sig.strength = ai.strength || sig.strength;
        sig.asset = ai.asset || sig.asset;
        sig.reason = ai.reason || sig.reason;
      } catch (_) { /* keep lexicon */ }
    }
    showSignalFeed();
    window.toast('✓ Signals enhanced');
  }

  function install() {
    window.showMacro = showMacroLive;
    window.showSectors = showSectorsLive;
    window.loadTickers = loadTickersLive;
    window.showETFFlows = showETFFlows;
    window.showIndices = showIndices;
    window.showSignalFeed = showSignalFeed;
    window.showSoDEXPreview = showSoDEXPreview;
    window.showAgentWorkflow = showAgentWorkflow;
    window.renderSignalBlock = renderLiveSignalBlock;
    window.mockNews = mockNews;
    window.buildSignalsFromNews = buildSignalsFromNews;
    window.enhanceTopSignalsWithGrok = enhanceTopSignalsWithGrok;
    window.getSignalCache = () => signalCache;
  }

  window.CryptoDeskW2 = { install, buildSignalsFromNews, renderLiveSignalBlock, mockNews };
})();
