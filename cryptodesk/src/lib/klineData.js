import { createSoSoClient } from '../api/sosovalue';
import { sodexSpot } from '../api/sodex';
import { resolveCurrencyId } from './currencyLookup';
import { normalizeKlines } from './klineChart';
import { sodexSymbolToAsset } from './sodexSymbol';

export const KLINE_INTERVALS = [
  { id: '1h', label: '1H' },
  { id: '4h', label: '4H' },
  { id: '1d', label: '1D' },
];

export async function fetchSodexKlines(symbol, interval = '1h', limit = 48) {
  const raw = await sodexSpot.klines(symbol, interval, limit, true);
  return normalizeKlines(raw);
}

export async function fetchSosoKlines(apiKey, asset, interval = '1h', limit = 48) {
  const id = await resolveCurrencyId(apiKey, asset);
  if (!id) return [];
  const client = createSoSoClient(apiKey);
  const raw = await client.getKlines(id, { interval, limit, period: interval });
  return normalizeKlines(raw);
}

export async function fetchDualKlines({ sosoKey, sodexSymbol, interval = '1h', limit = 48 }) {
  const asset = sodexSymbolToAsset(sodexSymbol);
  const [sodex, soso] = await Promise.all([
    fetchSodexKlines(sodexSymbol, interval, limit),
    sosoKey ? fetchSosoKlines(sosoKey, asset, interval, limit).catch(() => []) : Promise.resolve([]),
  ]);
  return { sodex, soso, asset };
}
