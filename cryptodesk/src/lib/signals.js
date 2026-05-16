export function scoreArticle(item, index = -1) {
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
  const asset = tickers[0] || item.matched_currencies?.[0]?.name || 'MARKET';
  return {
    sentiment,
    strength,
    asset,
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

export function sentimentPct(news) {
  const bw = ['surge', 'rally', 'inflow', 'record', 'bullish', 'adoption', 'approval'];
  const dw = ['crash', 'dump', 'hack', 'ban', 'bearish', 'outflow', 'lawsuit'];
  let bull = 0;
  news.forEach((item) => {
    const t = `${item.title} ${item.content}`.toLowerCase();
    const bs = bw.filter((w) => t.includes(w)).length;
    const ds = dw.filter((w) => t.includes(w)).length;
    if (bs > ds) bull++;
  });
  return news.length ? Math.round((bull / news.length) * 100) : 0;
}
