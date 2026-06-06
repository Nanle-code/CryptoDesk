import { attachExplainability } from './explainability';
import { ensureString } from './format';

export function scoreArticle(item, index = -1) {
  const title = ensureString(item.title);
  const content = ensureString(item.content);
  const text = `${title} ${content.replace(/<[^>]+>/g, ' ')}`.toLowerCase();
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
  const rawAsset = item.matched_currencies?.[0]?.name || 'MARKET';
  const asset = tickers[0] || (typeof rawAsset === 'object' ? (rawAsset.en || rawAsset.name || 'MARKET') : rawAsset);
  const confidence = Math.min(95, 35 + Math.abs(net) * 15);
  const impact = strength >= 4 ? 'high' : strength === 3 ? 'medium' : 'low';
  const time_horizon = strength >= 4 ? 'medium' : 'short';
  const recommendation = sentiment === 'bullish' ? 'Buy' : sentiment === 'bearish' ? 'Sell' : 'Hold';
  return {
    sentiment,
    strength,
    confidence,
    asset,
    affected_assets: tickers.length ? tickers : [asset],
    impact,
    time_horizon,
    recommendation,
    title: item.title,
    reason: net > 0 ? `${b} bullish cues` : net < 0 ? `${d} bearish cues` : 'Low conviction',
    index,
  };
}

export function buildSignals(news) {
  return news
    .map((item, i) => scoreArticle(item, i))
    .filter((s) => s.strength >= 2)
    .sort((a, b) => b.strength - a.strength);
}

function inferRisk(signal) {
  if (signal.risk) return signal.risk;
  if (signal.impact === 'high') {
    return signal.sentiment === 'bullish' ? 'Medium' : 'High';
  }
  if (signal.impact === 'low') return 'Low';
  return 'Medium';
}

function formatHorizon(h) {
  if (!h) return 'short';
  const s = String(h).toLowerCase();
  if (s === 'short' || s === 'medium' || s === 'long') return s;
  return s.includes('day') ? 'medium' : 'short';
}

function signalForOpportunity(signals, sourceIndex) {
  return signals.find((s) => s.index === sourceIndex);
}

export function buildOpportunities(signals, news = []) {
  return (signals || []).slice(0, 5).map((signal) => {
    const base = {
      asset: signal.affected_assets?.length ? signal.affected_assets.join(', ') : signal.asset,
      recommendation: signal.recommendation || (signal.sentiment === 'bullish' ? 'Buy' : signal.sentiment === 'bearish' ? 'Sell' : 'Hold'),
      confidence: signal.confidence ?? Math.min(95, 20 + signal.strength * 15),
      risk: inferRisk(signal),
      time_horizon: formatHorizon(signal.time_horizon) || (signal.strength >= 4 ? 'medium' : 'short'),
      impact: signal.impact || (signal.strength >= 4 ? 'high' : signal.strength === 3 ? 'medium' : 'low'),
      reason: signal.reason,
      title: signal.title,
      sourceIndex: signal.index,
    };
    const newsItem = news[signal.index];
    return attachExplainability(base, newsItem, signal);
  });
}

export function mergeOpportunityExplanations(opportunities, patches = {}) {
  if (!patches || !Object.keys(patches).length) return opportunities;
  return opportunities.map((opp) => {
    const patch = patches[opp.sourceIndex];
    if (!patch) return opp;
    return {
      ...opp,
      why: patch.why?.length ? patch.why : opp.why,
      risks: patch.risks?.length ? patch.risks : opp.risks,
      explainSource: patch.explainSource || opp.explainSource,
    };
  });
}

export function sentimentPct(news) {
  const bw = ['surge', 'rally', 'inflow', 'record', 'bullish', 'adoption', 'approval'];
  const dw = ['crash', 'dump', 'hack', 'ban', 'bearish', 'outflow', 'lawsuit'];
  let bull = 0;
  news.forEach((item) => {
    const t = `${ensureString(item.title)} ${ensureString(item.content)}`.toLowerCase();
    const bs = bw.filter((w) => t.includes(w)).length;
    const ds = dw.filter((w) => t.includes(w)).length;
    if (bs > ds) bull++;
  });
  return news.length ? Math.round((bull / news.length) * 100) : 0;
}
