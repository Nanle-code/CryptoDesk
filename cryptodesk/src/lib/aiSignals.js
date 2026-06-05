import { GrokAPI } from '../api/grok';

/** How many top lexicon signals to upgrade with Grok on each feed load. */
export const AI_CLASSIFY_TOP = 5;

/** Map Grok classification onto a lexicon signal row. */
export function mergeAiClassification(signal, ai) {
  const conf = typeof ai.confidence === 'number' ? ai.confidence : signal.confidence;
  const strengthFromAi = conf >= 90 ? 5 : conf >= 75 ? 4 : conf >= 60 ? 3 : 2;
  return {
    ...signal,
    sentiment: ai.sentiment || signal.sentiment,
    strength: Math.max(signal.strength, strengthFromAi),
    confidence: conf ?? signal.confidence,
    affected_assets: ai.affected_assets?.length ? ai.affected_assets : signal.affected_assets,
    asset: ai.affected_assets?.[0] || signal.asset,
    impact: ai.impact || signal.impact,
    time_horizon: ai.time_horizon || signal.time_horizon,
    recommendation: ai.recommendation || signal.recommendation,
    risk: ai.risk || signal.risk,
    reason: ai.reason || signal.reason,
    title: signal.title,
    index: signal.index,
    aiClassified: true,
  };
}

function sortSignals(list) {
  return [...list].sort((a, b) => {
    const ca = a.confidence ?? a.strength * 18;
    const cb = b.confidence ?? b.strength * 18;
    return cb - ca;
  });
}

/** Classify top N signals with Grok and merge into the feed. */
export async function classifyTopSignals(grokKey, news, signals, topN = AI_CLASSIFY_TOP) {
  if (!grokKey || !news?.length || !signals?.length) return signals;

  const grok = new GrokAPI(grokKey);
  const targets = signals.slice(0, topN);
  const patches = {};

  await Promise.all(
    targets.map(async (sig) => {
      const item = news[sig.index];
      if (!item) return;
      try {
        const ai = await grok.classifySignal(item);
        patches[sig.index] = mergeAiClassification(sig, ai);
      } catch {
        /* keep lexicon row */
      }
    })
  );

  return sortSignals(signals.map((sig) => patches[sig.index] || sig));
}
