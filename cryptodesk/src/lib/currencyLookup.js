import { sosoFetch, unwrapData } from './api';

const FALLBACK_IDS = {
  BTC: 'btc',
  ETH: 'eth',
  SOL: 'sol',
  BNB: 'bnb',
};

let symbolCache = null;
let cacheKey = null;

async function loadSymbolMap(apiKey) {
  if (symbolCache && cacheKey === apiKey) return symbolCache;
  const list = unwrapData(await sosoFetch(apiKey, '/currencies'));
  const map = { ...FALLBACK_IDS };
  (Array.isArray(list) ? list : []).forEach((c) => {
    const sym = c.symbol?.toUpperCase();
    if (sym && c.currency_id) map[sym] = c.currency_id;
  });
  symbolCache = map;
  cacheKey = apiKey;
  return map;
}

/** Resolve ticker (BTC, ETH…) to SoSoValue currency_id. */
export async function resolveCurrencyId(apiKey, asset) {
  const sym = String(asset || '')
    .split(/[,/]/)[0]
    .trim()
    .replace(/^\$/, '')
    .toUpperCase();
  if (!sym) return null;
  if (!apiKey) return FALLBACK_IDS[sym] || sym.toLowerCase();
  const map = await loadSymbolMap(apiKey);
  return map[sym] || sym.toLowerCase();
}
