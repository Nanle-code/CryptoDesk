import { createSoSoClient } from '../api/sosovalue';

export const THEME_PRESETS = ['AI Index', 'DeFi Index', 'RWA Index', 'L1 Index', 'Meme Index'];

export const THEME_KEYWORDS = {
  'AI Index': ['ai', 'artificial', 'compute', 'agent', 'intelligence'],
  'DeFi Index': ['defi', 'dex', 'finance', 'yield'],
  'RWA Index': ['rwa', 'real', 'world', 'treasury', 'tokenized'],
  'L1 Index': ['l1', 'layer', 'large', 'cap'],
  'Meme Index': ['meme', 'dog', 'pepe', 'culture'],
};

function normalizeIndicesList(raw) {
  return Array.isArray(raw) ? raw : raw?.list || [];
}

export function normalizeConstituents(raw) {
  const list = Array.isArray(raw) ? raw : raw?.list || raw?.constituents || [];
  return list
    .map((c) => ({
      symbol: String(c.symbol || c.ticker || c.currency_symbol || c.name || '').toUpperCase(),
      weight_pct: parseFloat(c.weight_pct ?? c.weight ?? c.allocation_pct ?? c.allocation ?? 0) || null,
      name: c.name || c.full_name || c.currency_name || '',
    }))
    .filter((c) => c.symbol);
}

export function findBestMatchingIndex(theme, indices = []) {
  if (!indices.length) return null;

  const presetKeys = THEME_KEYWORDS[theme] || [];
  const themeWords = theme.toLowerCase().split(/\s+/).filter(Boolean);
  const keywords = [...new Set([...presetKeys, ...themeWords])];

  let best = null;
  let bestScore = 0;

  indices.forEach((idx) => {
    const blob = `${idx.ticker || ''} ${idx.name || ''} ${idx.full_name || ''}`.toLowerCase();
    const score = keywords.reduce((n, k) => (blob.includes(k) ? n + 1 : n), 0);
    if (score > bestScore) {
      bestScore = score;
      best = idx;
    }
  });

  return best || indices[0];
}

/** Fetch live SoSo SSI index list + best-match constituents for a theme. */
export async function fetchSSIReference(apiKey, theme, selectedTicker = null) {
  if (!apiKey) {
    return { matchedIndex: null, constituents: [], indices: [], endpoints: [] };
  }

  const soso = createSoSoClient(apiKey);
  const indicesRaw = await soso.getIndices();
  const indices = normalizeIndicesList(indicesRaw).slice(0, 20);

  const matchedIndex = selectedTicker
    ? indices.find((i) => (i.ticker || i.symbol) === selectedTicker) || indices[0]
    : findBestMatchingIndex(theme, indices);

  const ticker = matchedIndex?.ticker || matchedIndex?.symbol;
  let constituents = [];
  const endpoints = ['GET /indices'];

  if (ticker) {
    endpoints.push(`GET /indices/${ticker}/constituents`);
    try {
      constituents = normalizeConstituents(await soso.getIndexConstituents(ticker));
    } catch {
      constituents = [];
    }

    try {
      await soso.getIndexSnapshot(ticker);
      endpoints.push(`GET /indices/${ticker}/market-snapshot`);
    } catch { /* optional */ }
  }

  return {
    matchedIndex: matchedIndex
      ? {
          ticker,
          name: matchedIndex.name || matchedIndex.full_name || ticker,
        }
      : null,
    constituents,
    indices,
    endpoints,
  };
}

export function formatReferenceForGrok(reference) {
  if (!reference?.matchedIndex) return 'No live SSI index matched';
  const parts = [`Index: ${reference.matchedIndex.ticker} (${reference.matchedIndex.name})`];
  if (reference.constituents?.length) {
    parts.push(
      'Constituents: ' +
        reference.constituents
          .map((c) => `${c.symbol}${c.weight_pct != null ? ` ${c.weight_pct}%` : ''}`)
          .join(', ')
    );
  }
  return parts.join('\n');
}

/** Tag Grok-designed constituents that appear in live SSI index. */
export function mergeDesignedWithLive(grokResult, reference) {
  if (!grokResult) return grokResult;

  const liveSymbols = new Set((reference?.constituents || []).map((c) => c.symbol));
  const liveMap = Object.fromEntries(
    (reference?.constituents || []).map((c) => [c.symbol, c])
  );

  const constituents = (grokResult.constituents || []).map((c) => {
    const sym = String(c.symbol || '').toUpperCase();
    const live = liveMap[sym];
    return {
      ...c,
      liveMatch: liveSymbols.has(sym),
      liveWeight: live?.weight_pct ?? null,
    };
  });

  return {
    ...grokResult,
    constituents,
    liveReference: reference?.matchedIndex
      ? {
          ticker: reference.matchedIndex.ticker,
          name: reference.matchedIndex.name,
          constituents: reference.constituents || [],
          endpoints: reference.endpoints || [],
        }
      : null,
  };
}

export function constituentsSummary(reference) {
  const n = reference?.constituents?.length || 0;
  if (!n) return 'No constituents returned';
  return `${n} live constituent${n === 1 ? '' : 's'} from SoSoValue SSI`;
}
