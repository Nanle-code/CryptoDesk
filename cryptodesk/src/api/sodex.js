/**
 * SoDEX Spot REST API v1 — public market data (no auth required)
 * https://sodex.com/documentation/api/rest-v1
 */
const SPOT_TESTNET = 'https://testnet-gw.sodex.dev/api/v1/spot';
const SPOT_MAINNET = 'https://mainnet-gw.sodex.dev/api/v1/spot';

export const DEFAULT_SODEX_SYMBOL = 'vBTC_vUSDC';

function getBase(testnet = true) {
  return testnet ? SPOT_TESTNET : SPOT_MAINNET;
}

async function sodexGet(path, testnet = true) {
  const res = await fetch(`${getBase(testnet)}${path}`, {
    headers: { Accept: 'application/json' },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message || json?.message || `SoDEX ${res.status}`);
  if (json.code !== undefined && json.code !== 0) {
    throw new Error(json.error?.message || json.message || `SoDEX code ${json.code}`);
  }
  return json.data ?? json;
}

export const sodexSpot = {
  symbols: (testnet) => sodexGet('/markets/symbols', testnet),
  symbol: (sym, testnet) => sodexGet(`/markets/symbols?symbol=${encodeURIComponent(sym)}`, testnet),
  coins: (testnet) => sodexGet('/markets/coins', testnet),
  tickers: (testnet) => sodexGet('/markets/tickers', testnet),
  ticker: (sym, testnet) => sodexGet(`/markets/tickers?symbol=${encodeURIComponent(sym)}`, testnet),
  miniTickers: (testnet) => sodexGet('/markets/miniTickers', testnet),
  bookTickers: (testnet) => sodexGet('/markets/bookTickers', testnet),
  bookTicker: (sym, testnet) => sodexGet(`/markets/bookTickers?symbol=${encodeURIComponent(sym)}`, testnet),
  orderbook: (sym, limit = 20, testnet) =>
    sodexGet(`/markets/${encodeURIComponent(sym)}/orderbook?limit=${limit}`, testnet),
  klines: (sym, interval = '1h', limit = 48, testnet) =>
    sodexGet(`/markets/${encodeURIComponent(sym)}/klines?interval=${interval}&limit=${limit}`, testnet),
  trades: (sym, limit = 30, testnet) =>
    sodexGet(`/markets/${encodeURIComponent(sym)}/trades?limit=${limit}`, testnet),
};

/** @deprecated use sodexSpot */
export async function fetchSoDEXMarkets() {
  const data = await sodexSpot.symbols(true);
  return Array.isArray(data) ? data : [data].filter(Boolean);
}
