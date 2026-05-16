import { useEffect, useState } from 'react';
import { sosoFetch, unwrapData } from '../lib/api';
import { fmtPrice } from '../lib/format';

const PAIRS = [
  { sym: 'BTC', id: 'btc' },
  { sym: 'ETH', id: 'eth' },
  { sym: 'SOL', id: 'sol' },
  { sym: 'BNB', id: 'bnb' },
];

function fmtChg(raw) {
  const v = parseFloat(raw);
  if (Number.isNaN(v)) return { text: '—', up: true };
  const pct = Math.abs(v) <= 1 && v !== 0 ? v * 100 : v;
  return { text: (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%', up: pct >= 0 };
}

export function useTickers(sosoKey) {
  const [tickers, setTickers] = useState(
    Object.fromEntries(PAIRS.map((p) => [p.id, { price: '—', chg: '—', up: true }]))
  );

  useEffect(() => {
    if (!sosoKey) return;

    let cache = null;
    (async () => {
      try {
        const list = unwrapData(await sosoFetch(sosoKey, '/currencies'));
        cache = {};
        (Array.isArray(list) ? list : []).forEach((c) => {
          if (c.symbol) cache[c.symbol.toUpperCase()] = c.currency_id;
        });

        const next = { ...tickers };
        await Promise.all(
          PAIRS.map(async ({ sym, id }) => {
            const cid = cache[sym];
            if (!cid) return;
            const snap = unwrapData(await sosoFetch(sosoKey, `/currencies/${cid}/market-snapshot`));
            if (!snap) return;
            const chg = fmtChg(snap.change_pct_24h);
            next[id] = { price: fmtPrice(snap.price), chg: chg.text, up: chg.up };
          })
        );
        setTickers(next);
      } catch (e) {
        console.warn('[tickers]', e);
      }
    })();
  }, [sosoKey]);

  return tickers;
}
