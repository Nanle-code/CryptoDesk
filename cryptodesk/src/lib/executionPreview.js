/** Merge opportunity + committee + risk insight into one execution preview (nextstep M12). */
export function buildExecutionContext(opportunity, sodexSymbol, committeeReviews = {}, opportunityInsights = {}) {
  if (!opportunity) return null;

  const idx = opportunity.sourceIndex;
  const committee = idx != null ? committeeReviews[idx] : null;
  const insight = idx != null ? opportunityInsights[idx] : null;

  const why = [];
  if (opportunity.why?.length) {
    why.push(...opportunity.why);
  } else if (committee?.why?.length) {
    why.push(...committee.why);
  } else if (opportunity.reason) {
    why.push(opportunity.reason);
  }
  if (insight?.explanation && !why.includes(insight.explanation)) {
    why.unshift(insight.explanation);
  }

  const risks = [];
  if (opportunity.risks?.length) risks.push(...opportunity.risks);
  if (insight?.risk_drivers?.length) {
    insight.risk_drivers.forEach((r) => {
      if (!risks.includes(r)) risks.push(r);
    });
  }

  return {
    symbol: sodexSymbol,
    asset: opportunity.asset,
    action: committee?.final_recommendation || opportunity.recommendation || 'Hold',
    confidence: committee?.confidence ?? opportunity.confidence ?? null,
    risk: committee?.risk || insight?.risk || opportunity.risk || 'Medium',
    allocation_pct: committee?.allocation_pct ?? defaultAllocation(opportunity),
    slippage_estimate: committee?.slippage_estimate || '0.12%',
    route: 'SoDEX Spot (testnet)',
    time_horizon: formatHorizonDays(opportunity.time_horizon),
    why: why.slice(0, 5),
    risks: risks.slice(0, 4),
    title: opportunity.title,
    sourceIndex: idx,
  };
}

function defaultAllocation(opportunity) {
  const conf = opportunity.confidence ?? 70;
  if (conf >= 90) return 20;
  if (conf >= 80) return 15;
  if (conf >= 70) return 12;
  return 10;
}

function formatHorizonDays(horizon) {
  const h = String(horizon || '').toLowerCase();
  if (h === 'short') return '3–7 days';
  if (h === 'medium') return '7–14 days';
  if (h === 'long') return '14–30 days';
  if (h.includes('day')) return horizon;
  return '7 days';
}

/** Rough slippage from orderbook best bid/ask spread (fallback when committee absent). */
export function estimateSlippageFromBook(book) {
  const bids = book?.bids || book?.b || [];
  const asks = book?.asks || book?.a || [];
  const bestBid = parseFloat(bids[0]?.[0] ?? bids[0]?.price);
  const bestAsk = parseFloat(asks[0]?.[0] ?? asks[0]?.price);
  if (!bestBid || !bestAsk || bestAsk <= bestBid) return null;
  const mid = (bestBid + bestAsk) / 2;
  const spreadPct = ((bestAsk - bestBid) / mid) * 100;
  return `${spreadPct.toFixed(2)}%`;
}
