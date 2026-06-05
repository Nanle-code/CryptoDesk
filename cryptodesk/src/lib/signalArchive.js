const STORAGE_KEY = 'cd_signal_archive';
const MAX_ENTRIES = 120;

export function loadArchive() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(entries) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

function entryKey(entry) {
  return `${entry.type}:${entry.sourceIndex}:${entry.asset}:${(entry.title || '').slice(0, 96)}`;
}

/** Append new signals + opportunities; dedupe by headline + source index for the session. */
export function appendToArchive(current, signals, opportunities) {
  const seen = new Set((current || []).map(entryKey));
  const fresh = [];
  const now = new Date().toISOString();

  for (const s of signals || []) {
    if ((s.strength ?? 0) < 2) continue;
    const entry = {
      id: `sig-${s.index}-${now}`,
      type: 'signal',
      archivedAt: now,
      asset: s.affected_assets?.length ? s.affected_assets.join(', ') : s.asset,
      sentiment: s.sentiment,
      confidence: s.confidence ?? null,
      strength: s.strength,
      recommendation: s.recommendation,
      title: s.title,
      reason: s.reason,
      sourceIndex: s.index,
      aiClassified: Boolean(s.aiClassified),
    };
    const key = entryKey(entry);
    if (!seen.has(key)) {
      seen.add(key);
      fresh.push(entry);
    }
  }

  for (const o of opportunities || []) {
    const entry = {
      id: `opp-${o.sourceIndex}-${now}`,
      type: 'opportunity',
      archivedAt: now,
      asset: o.asset,
      sentiment:
        o.recommendation === 'Buy' ? 'bullish' : o.recommendation === 'Sell' ? 'bearish' : 'neutral',
      confidence: o.confidence,
      risk: o.risk,
      recommendation: o.recommendation,
      title: o.title,
      reason: o.reason,
      sourceIndex: o.sourceIndex,
      why: Array.isArray(o.why) ? o.why.slice(0, 3) : [],
    };
    const key = entryKey(entry);
    if (!seen.has(key)) {
      seen.add(key);
      fresh.push(entry);
    }
  }

  if (!fresh.length) return current || [];

  const merged = [...fresh, ...(current || [])].slice(0, MAX_ENTRIES);
  persist(merged);
  return merged;
}

export function clearArchive() {
  sessionStorage.removeItem(STORAGE_KEY);
  return [];
}

export function exportArchiveJson(entries) {
  return JSON.stringify(entries, null, 2);
}
