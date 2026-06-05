const STORAGE_KEY = 'cd_watchlist';
const DEFAULT_TOKENS = ['BTC', 'ETH', 'SOL'];

const TOKEN_ALIASES = {
  BTC: ['btc', 'bitcoin'],
  ETH: ['eth', 'ethereum'],
  SOL: ['sol', 'solana'],
  BNB: ['bnb', 'binance'],
  AVAX: ['avax', 'avalanche'],
  TAO: ['tao', 'bittensor'],
  FET: ['fet', 'fetch'],
  RENDER: ['render', 'rndr'],
  AKT: ['akt', 'akash'],
};

const BULL_WORDS = ['surge', 'rally', 'inflow', 'record', 'bullish', 'adoption', 'approval'];
const BEAR_WORDS = ['crash', 'dump', 'hack', 'ban', 'bearish', 'outflow', 'lawsuit'];

const NARRATIVE_THEMES = {
  AI: ['ai', 'artificial intelligence', 'agent', 'compute', 'tao', 'fet', 'render'],
  RWA: ['rwa', 'real world', 'tokenized', 'treasury'],
  ETF: ['etf', 'inflow', 'institutional', 'blackrock'],
  DEFI: ['defi', 'dex', 'yield', 'tvl'],
  L1: ['layer 1', 'l1', 'blockchain'],
};

export function loadWatchlist() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed) && parsed.length) {
      return parsed.map((t) => String(t).toUpperCase().replace(/^\$/, ''));
    }
  } catch { /* ignore */ }
  return [...DEFAULT_TOKENS];
}

export function saveWatchlist(tokens) {
  const clean = [...new Set(tokens.map((t) => String(t).toUpperCase().replace(/^\$/, '').trim()).filter(Boolean))];
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  return clean;
}

function tokenInWatchlist(token, watchSet) {
  const key = String(token).toUpperCase().replace(/^\$/, '');
  return watchSet.has(key);
}

function assetsFromLabel(label) {
  return String(label || '')
    .split(/[,/\s]+/)
    .map((s) => s.replace(/^\$/, '').toUpperCase())
    .filter((s) => s.length >= 2 && s.length <= 6);
}

function tokenAliases(token) {
  const key = token.toUpperCase();
  return [key, ...(TOKEN_ALIASES[key] || [])];
}

function textMentionsToken(text, token) {
  const lower = String(text || '').toLowerCase();
  return tokenAliases(token).some((alias) => {
    if (alias.length <= 3) {
      return new RegExp(`\\$${alias}\\b|\\b${alias}\\b`).test(lower);
    }
    return lower.includes(alias);
  });
}

function themesForToken(token) {
  const key = token.toUpperCase();
  const themes = [];
  if (['TAO', 'FET', 'RENDER', 'AKT'].includes(key)) themes.push('AI');
  if (['ETH', 'BTC'].includes(key)) themes.push('ETF');
  if (key === 'ETH') themes.push('RWA');
  if (['SOL', 'AVAX', 'BNB'].includes(key)) themes.push('L1');
  return themes;
}

function themesMatchText(text, token) {
  const lower = String(text || '').toLowerCase();
  return themesForToken(token).some((theme) =>
    (NARRATIVE_THEMES[theme] || []).some((k) => lower.includes(k))
  );
}

function inferNarrativeFromNews(token, news = []) {
  const themes = themesForToken(token);
  let best = null;
  let hits = 0;

  for (const item of news) {
    const text = `${item.title || ''} ${item.content || ''}`;
    if (!textMentionsToken(text, token)) continue;
    for (const theme of themes) {
      const keys = NARRATIVE_THEMES[theme] || [];
      const n = keys.filter((k) => text.toLowerCase().includes(k)).length;
      if (n > hits) {
        hits = n;
        best = {
          label: `${theme} narrative (headline flow)`,
          momentum: n >= 2 ? 'Strengthening' : 'Stable',
          role: 'inferred',
          theme,
        };
      }
    }
  }
  return best;
}

function narrativeMatchesToken(narrativeData, token) {
  if (!narrativeData) return null;

  const emerging = narrativeData.emerging_narrative || '';
  const current = narrativeData.current_narrative || '';
  const insight = narrativeData.insight || '';

  if (textMentionsToken(emerging, token) || themesMatchText(emerging, token)) {
    return {
      label: emerging,
      momentum: narrativeData.emerging_momentum || 'Stable',
      role: 'emerging',
    };
  }

  if (textMentionsToken(current, token) || textMentionsToken(insight, token) || themesMatchText(current, token)) {
    return {
      label: current,
      momentum: narrativeData.current_momentum || 'Stable',
      role: 'current',
    };
  }

  for (const theme of themesForToken(token)) {
    const blob = `${emerging} ${current} ${insight}`.toLowerCase();
    const keys = NARRATIVE_THEMES[theme] || [];
    if (keys.some((k) => blob.includes(k))) {
      return {
        label: emerging || current,
        momentum: narrativeData.emerging_momentum || narrativeData.current_momentum || 'Stable',
        role: 'theme',
        theme,
      };
    }
  }

  return null;
}

/** Per-token sentiment from signals + headline scan (M9). */
export function computeTokenSentiment(token, news = [], signals = []) {
  const key = token.toUpperCase();
  const matchingSignals = signals.filter((sig) => {
    const assets = sig.affected_assets?.length ? sig.affected_assets : [sig.asset];
    return assets.some((a) => String(a).replace(/^\$/, '').toUpperCase() === key);
  });

  let bull = 0;
  let bear = 0;
  let confSum = 0;
  let confN = 0;

  matchingSignals.forEach((sig) => {
    const conf = sig.confidence ?? sig.strength * 18;
    confSum += conf;
    confN += 1;
    if (sig.sentiment === 'bullish') bull += conf;
    else if (sig.sentiment === 'bearish') bear += conf;
  });

  (news || []).forEach((item) => {
    const text = `${item.title || ''} ${item.content || ''}`;
    if (!textMentionsToken(text, key)) return;
    const lower = text.toLowerCase();
    const b = BULL_WORDS.filter((w) => lower.includes(w)).length;
    const d = BEAR_WORDS.filter((w) => lower.includes(w)).length;
    if (b > d) bull += 12;
    else if (d > b) bear += 12;
  });

  const total = bull + bear;
  const score = total ? Math.round((bull / total) * 100) : 50;
  const avgConf = confN ? Math.round(confSum / confN) : null;

  let label = 'neutral';
  if (score >= 58) label = 'bullish';
  else if (score <= 42) label = 'bearish';

  return {
    asset: key,
    score,
    label,
    avgConfidence: avgConf,
    signalCount: matchingSignals.length,
    mentionCount: (news || []).filter((n) => textMentionsToken(`${n.title} ${n.content}`, key)).length,
  };
}

function buildTokenRows(tokens, news, signals, narrativeData) {
  return tokens.map((token) => {
    const sentiment = computeTokenSentiment(token, news, signals);
    const narrative = narrativeMatchesToken(narrativeData, token)
      || inferNarrativeFromNews(token, news);
    return { ...sentiment, narrative };
  });
}

/** Full watchlist intel: alerts + per-token sentiment + narrative (M9). */
export function buildWatchlistIntel(tokens, signals = [], opportunities = [], news = [], narrativeData = null) {
  const watchSet = new Set(tokens.map((t) => t.toUpperCase()));
  const alerts = [];
  const seen = new Set();

  const push = (alert) => {
    const id = `${alert.type}:${alert.asset}:${alert.message}`;
    if (seen.has(id)) return;
    seen.add(id);
    alerts.push(alert);
  };

  const tokenRows = buildTokenRows(tokens, news, signals, narrativeData);

  for (const row of tokenRows) {
    if (row.avgConfidence != null && row.avgConfidence >= 90) {
      push({
        type: 'sentiment',
        asset: row.asset,
        message: `${row.asset} confidence exceeded ${row.avgConfidence}%`,
        severity: 'high',
      });
    } else if (row.score >= 65 && row.signalCount > 0) {
      push({
        type: 'sentiment',
        asset: row.asset,
        message: `${row.asset} sentiment ${row.label} · ${row.score}% scan · ${row.signalCount} signal(s)`,
        severity: row.score >= 75 ? 'medium' : 'low',
      });
    }

    if (row.narrative) {
      const { label, momentum, role, theme } = row.narrative;
      push({
        type: 'narrative',
        asset: row.asset,
        message: `${row.asset} · ${role === 'emerging' ? 'Emerging' : 'Active'} narrative: ${label} (${momentum})${theme ? ` · ${theme}` : ''}`,
        severity: String(momentum).toLowerCase() === 'strengthening' ? 'high' : 'medium',
      });
    }
  }

  for (const opp of opportunities) {
    for (const asset of assetsFromLabel(opp.asset)) {
      if (!tokenInWatchlist(asset, watchSet)) continue;
      const conf = opp.confidence ?? 0;
      if (conf >= 65) {
        push({
          type: 'opportunity',
          asset,
          message: `${asset}: ${opp.recommendation} · ${conf}% confidence — new opportunity detected`,
          severity: conf >= 90 ? 'high' : 'medium',
        });
      }
    }
  }

  for (const sig of signals) {
    const list = sig.affected_assets?.length ? sig.affected_assets : [sig.asset];
    for (const raw of list) {
      const asset = String(raw).replace(/^\$/, '').toUpperCase();
      if (!tokenInWatchlist(asset, watchSet)) continue;
      const conf = sig.confidence ?? sig.strength * 18;
      if (conf >= 55) {
        push({
          type: 'signal',
          asset,
          message: `${asset} ${sig.sentiment} signal · ${Math.round(conf)}% confidence`,
          severity: conf >= 90 ? 'high' : 'medium',
        });
      }
    }
  }

  const severityRank = { high: 3, medium: 2, low: 1 };
  const sortedAlerts = alerts.sort(
    (a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0)
  ).slice(0, 20);

  return { alerts: sortedAlerts, tokens: tokenRows };
}

/** @deprecated use buildWatchlistIntel */
export function evaluateWatchlist(tokens, signals = [], opportunities = [], news = [], narrativeData = null) {
  return buildWatchlistIntel(tokens, signals, opportunities, news, narrativeData).alerts;
}
