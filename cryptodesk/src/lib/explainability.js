import { GrokAPI } from '../api/grok';
import { parseGrokJson } from './parseGrokJson';

const BULL_CUES = {
  etf: 'ETF inflows increasing',
  inflow: 'Strong capital inflows reported',
  surge: 'Surge momentum in market coverage',
  rally: 'Rally narrative in headlines',
  record: 'Record-level activity cited',
  approval: 'Regulatory or product approval catalyst',
  adoption: 'Adoption narrative strengthening',
  accumulation: 'Accumulation signals in coverage',
  bullish: 'Explicit bullish sentiment',
  launch: 'New launch / product catalyst',
};

const BEAR_CUES = {
  crash: 'Crash / sharp drawdown language',
  dump: 'Heavy selling / dump narrative',
  hack: 'Security or exploit headline risk',
  exploit: 'Protocol exploit concerns',
  ban: 'Regulatory ban / restriction risk',
  lawsuit: 'Legal / lawsuit overhang',
  outflow: 'Capital outflows reported',
  bearish: 'Explicit bearish sentiment',
  liquidation: 'Liquidation cascade risk',
  sec: 'SEC / enforcement headline risk',
};

/** Lexicon-based "Why?" bullets from headline text (M5 — no API required). */
export function buildLexiconWhy(newsItem, signal) {
  if (!newsItem) return signal?.reason ? [signal.reason] : [];

  const text = `${newsItem.title || ''} ${(newsItem.content || '').replace(/<[^>]+>/g, ' ')}`.toLowerCase();
  const cues = signal?.sentiment === 'bearish' ? BEAR_CUES : BULL_CUES;
  const why = [];

  Object.entries(cues).forEach(([word, label]) => {
    if (text.includes(word)) why.push(label);
  });

  if (signal?.aiClassified && signal.reason) {
    why.unshift(signal.reason);
  } else if (signal?.reason && !why.some((w) => w.includes(signal.reason))) {
    why.push(signal.reason);
  }

  if (signal?.impact === 'high') {
    why.push('High-impact headline in current feed');
  }

  if (signal?.confidence >= 80) {
    why.push(`Strong conviction score (${signal.confidence}%)`);
  }

  return [...new Set(why)].slice(0, 5);
}

/** Default risk bullets aligned with nextstep explainability examples. */
export function buildLexiconRisks(signal) {
  const risks = [];

  if (signal?.sentiment === 'bullish') {
    risks.push('Macro uncertainty may override headline catalyst');
    risks.push('Potential profit-taking after a sharp move');
  } else if (signal?.sentiment === 'bearish') {
    risks.push('Oversold bounce / short-squeeze risk');
    risks.push('Headline may already be priced in');
  } else {
    risks.push('Low conviction — signal may fade quickly');
  }

  if (signal?.impact === 'high' || signal?.risk === 'High') {
    risks.push('Elevated volatility around this headline');
  }

  if (signal?.time_horizon === 'short') {
    risks.push('Short horizon — timing risk is elevated');
  }

  return [...new Set(risks)].slice(0, 4);
}

export function attachExplainability(opportunity, newsItem, signal) {
  return {
    ...opportunity,
    why: buildLexiconWhy(newsItem, signal),
    risks: buildLexiconRisks(signal),
    explainSource: 'lexicon',
  };
}

const EXPLAIN_TOP = 3;

/** Optional Grok enrichment for top opportunities (why + risks JSON). */
export async function enrichOpportunitiesWithGrok(grokKey, news, opportunities) {
  if (!grokKey || !opportunities?.length) return {};

  const grok = new GrokAPI(grokKey);
  const patches = {};

  await Promise.all(
    opportunities.slice(0, EXPLAIN_TOP).map(async (opp) => {
      const item = news[opp.sourceIndex];
      if (!item || opp.sourceIndex == null) return;
      try {
        const content = (item.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const raw = await grok.complete(
          'CryptoDesk explainability agent. Return only JSON.',
          `Return ONLY JSON: {"why":["...","...","..."],"risks":["...","..."]}\n` +
            `Opportunity: ${opp.recommendation} ${opp.asset} · ${opp.confidence}% · ${opp.risk} risk\n` +
            `Title: ${item.title}\nContent: ${content.slice(0, 400)}`,
          280
        );
        const parsed = parseGrokJson(raw, {});
        if (parsed.why?.length || parsed.risks?.length) {
          patches[opp.sourceIndex] = {
            why: parsed.why?.length ? parsed.why : opp.why,
            risks: parsed.risks?.length ? parsed.risks : opp.risks,
            explainSource: 'grok',
          };
        }
      } catch {
        /* keep lexicon */
      }
    })
  );

  return patches;
}

export { EXPLAIN_TOP };
