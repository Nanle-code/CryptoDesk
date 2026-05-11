/**
 * CryptoDesk Utilities
 * Shared formatting, sentiment scoring, and signal detection
 */

// ── Number formatting ──────────────────────────────────────
const fmt = {
  price(n) {
    if (!n && n !== 0) return '—';
    const num = parseFloat(n);
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
    if (num >= 1000) return '$' + num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    if (num >= 1) return '$' + num.toFixed(2);
    return '$' + num.toFixed(6);
  },

  pct(n, decimals = 2) {
    if (!n && n !== 0) return '—';
    const num = parseFloat(n);
    return (num >= 0 ? '+' : '') + num.toFixed(decimals) + '%';
  },

  large(n) {
    if (!n && n !== 0) return '—';
    const num = parseFloat(n);
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return String(num);
  },

  timeAgo(timestamp) {
    const secs = Math.floor((Date.now() - timestamp) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
    if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
    return Math.floor(secs / 86400) + 'd ago';
  },

  date(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  },

  utcClock() {
    const now = new Date();
    return [now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds()]
      .map(n => String(n).padStart(2, '0')).join(':') + ' UTC';
  }
};

// ── HTML safety ────────────────────────────────────────────
function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ── Sentiment scoring (rule-based fallback) ─────────────────
const BULLISH_WORDS = ['surge', 'rally', 'inflow', 'record', 'high', 'buy', 'accumulate', 'bullish', 'adoption', 'approval', 'launch', 'milestone', 'partnership', 'upgrade', 'growth'];
const BEARISH_WORDS  = ['crash', 'dump', 'hack', 'exploit', 'ban', 'bearish', 'outflow', 'decline', 'fall', 'drop', 'sell', 'fraud', 'scam', 'lawsuit', 'regulatory', 'concern'];

function quickSentiment(text) {
  const lower = (text || '').toLowerCase();
  let score = 0;
  BULLISH_WORDS.forEach(w => { if (lower.includes(w)) score++; });
  BEARISH_WORDS.forEach(w => { if (lower.includes(w)) score--; });
  if (score > 0) return 'bullish';
  if (score < 0) return 'bearish';
  return 'neutral';
}

// ── Category mapping ───────────────────────────────────────
const CAT_NAMES = {
  1: 'Breaking', 2: 'Research', 3: 'Institutional',
  4: 'KOL', 7: 'Official', 13: 'Crypto Stocks'
};

const CAT_COLORS = {
  1: 'cat-breaking', 2: 'cat-research', 3: 'cat-inst',
  4: 'cat-kol', 7: 'cat-official', 13: 'cat-stocks'
};

function catName(n)  { return CAT_NAMES[n]  || 'News'; }
function catColor(n) { return CAT_COLORS[n] || 'cat-breaking'; }

// Export to window
Object.assign(window, { fmt, escHtml, stripHtml, quickSentiment, catName, catColor });
