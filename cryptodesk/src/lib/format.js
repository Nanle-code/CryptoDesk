export const CAT = { 1: 'Breaking', 2: 'Research', 3: 'Institutional', 4: 'KOL', 7: 'Official', 13: 'Stocks' };
export const CAT_CLS = { 1: 'cat-breaking', 2: 'cat-research', 3: 'cat-inst', 4: 'cat-kol', 7: 'cat-official', 13: 'cat-stocks' };

export function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function ensureString(v, def = '') {
  if (v == null) return def;
  if (typeof v === 'string') return v;
  if (typeof v === 'object') return v.en || v.localized_name || v.name || JSON.stringify(v);
  return String(v);
}

export function stripHtml(h) {
  const s = ensureString(h);
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function fmtPrice(n) {
  const v = parseFloat(n);
  if (Number.isNaN(v)) return '—';
  if (v >= 1000) return '$' + v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return '$' + v.toFixed(2);
}

export function fmtPct(raw) {
  const v = parseFloat(raw);
  if (Number.isNaN(v)) return '—';
  const pct = Math.abs(v) <= 1 && v !== 0 ? v * 100 : v;
  return (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
}

export function fmtUsd(n) {
  const v = parseFloat(n);
  if (Number.isNaN(v)) return '—';
  const abs = Math.abs(v);
  if (abs >= 1e9) return (v < 0 ? '-' : '') + '$' + (abs / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (v < 0 ? '-' : '') + '$' + (abs / 1e6).toFixed(1) + 'M';
  return (v < 0 ? '-' : '') + '$' + abs.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

export function sectorLabel(name) {
  return (name || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
