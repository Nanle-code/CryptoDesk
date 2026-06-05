import { DEFAULT_SODEX_SYMBOL } from '../api/sodex';

const PAIR_MAP = {
  BTC: 'vBTC_vUSDC',
  ETH: 'vETH_vUSDC',
  SOL: 'vSOL_vUSDC',
  BNB: 'vBNB_vUSDC',
};

/** Map opportunity asset label to a SoDEX testnet spot pair. */
export function assetToSodexSymbol(asset) {
  const token = String(asset || '')
    .split(/[,/]/)
    .map((s) => s.trim().replace(/^\$/, ''))
    .find(Boolean);
  if (!token) return DEFAULT_SODEX_SYMBOL;
  const key = token.toUpperCase();
  return PAIR_MAP[key] || DEFAULT_SODEX_SYMBOL;
}

/** Extract base asset from SoDEX pair (vETH_vUSDC → ETH). */
export function sodexSymbolToAsset(sym) {
  const m = String(sym || '').match(/^v([A-Z0-9]+)_/i);
  return m ? m[1].toUpperCase() : 'BTC';
}
