import { useEffect, useState } from 'react';
import { DEFAULT_SODEX_SYMBOL, sodexSpot } from '../api/sodex';
import { apiProof } from '../lib/api';
import { fmtPrice } from '../lib/format';

export default function SoDEXTerminal({ previewSymbol, onSymbolChange }) {
  const [symbol, setSymbol] = useState(previewSymbol || DEFAULT_SODEX_SYMBOL);
  const [symbols, setSymbols] = useState([]);
  const [tickers, setTickers] = useState([]);
  const [book, setBook] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    if (previewSymbol) setSymbol(previewSymbol);
  }, [previewSymbol]);

  const load = async (sym) => {
    setLoading(true);
    setError(null);
    try {
      const [symList, tickerList, ob, recentTrades] = await Promise.all([
        sodexSpot.symbols(true),
        sodexSpot.tickers(true),
        sodexSpot.orderbook(sym, 15, true),
        sodexSpot.trades(sym, 20, true),
      ]);
      setSymbols(Array.isArray(symList) ? symList : []);
      setTickers(Array.isArray(tickerList) ? tickerList : []);
      setBook(ob);
      setTrades(Array.isArray(recentTrades) ? recentTrades : []);
      setLastFetch(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(symbol);
    const id = setInterval(() => load(symbol), 15000);
    return () => clearInterval(id);
  }, [symbol]);

  const selectSymbol = (sym) => {
    setSymbol(sym);
    onSymbolChange?.(sym);
  };

  const currentTicker = tickers.find(
    (t) => (t.symbol || t.s) === symbol
  );

  return (
    <div className="sodex-terminal">
      <div className="sodex-hero">
        <div>
          <h2>SoDEX Spot Terminal</h2>
          <p>Live testnet market data — symbols, tickers, orderbook, trades. Public REST API (no key required).</p>
        </div>
        <span className="sodex-badge">testnet-gw.sodex.dev</span>
      </div>

      {error && <div className="hub-error">{error}</div>}

      <div className="sodex-ticker-strip">
        {tickers.slice(0, 8).map((t) => {
          const sym = t.symbol || t.s;
          const chg = parseFloat(t.priceChangePercent ?? t.change_pct ?? 0);
          return (
            <button
              key={sym}
              type="button"
              className={`sodex-ticker-pill ${sym === symbol ? 'active' : ''}`}
              onClick={() => selectSymbol(sym)}
            >
              <span className="sym">{sym?.replace('v', '').replace('_', '/')}</span>
              <span className="px">{t.lastPrice ?? t.price ?? '—'}</span>
              <span className={chg >= 0 ? 'up' : 'down'}>
                {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>

      <div className="sodex-layout">
        <div className="sodex-panel">
          <h3>Markets <code>GET /markets/symbols</code></h3>
          <div className="sodex-symbol-list">
            {(symbols.length ? symbols : [{ symbol }]).slice(0, 12).map((s) => {
              const sym = s.symbol || s.name || symbol;
              return (
                <button
                  key={sym}
                  type="button"
                  className={sym === symbol ? 'active' : ''}
                  onClick={() => selectSymbol(sym)}
                >
                  {sym}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sodex-panel sodex-panel-wide">
          <h3>
            Order book · {symbol}
            <code>GET /markets/{symbol}/orderbook</code>
          </h3>
          {loading && !book ? (
            <p className="dim">Loading depth…</p>
          ) : book ? (
            <div className="orderbook">
              <div className="ob-side ob-asks">
                <div className="ob-head">Asks</div>
                {(book.asks || book.a || []).slice(0, 10).reverse().map((row, i) => {
                  const price = row[0] ?? row.price;
                  const qty = row[1] ?? row.quantity;
                  return (
                    <div key={`a${i}`} className="ob-row ask">
                      <span>{price}</span>
                      <span>{qty}</span>
                    </div>
                  );
                })}
              </div>
              <div className="ob-mid">
                {currentTicker?.lastPrice ?? currentTicker?.price ?? '—'}
                <span className="ob-mid-label">last</span>
              </div>
              <div className="ob-side ob-bids">
                <div className="ob-head">Bids</div>
                {(book.bids || book.b || []).slice(0, 10).map((row, i) => {
                  const price = row[0] ?? row.price;
                  const qty = row[1] ?? row.quantity;
                  return (
                    <div key={`b${i}`} className="ob-row bid">
                      <span>{price}</span>
                      <span>{qty}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="dim">No orderbook data</p>
          )}
        </div>

        <div className="sodex-panel">
          <h3>Recent trades <code>GET /markets/…/trades</code></h3>
          <div className="sodex-trades">
            {trades.slice(0, 15).map((tr, i) => (
              <div key={i} className="trade-row">
                <span className={tr.isBuyerMaker === false || tr.side === 'buy' ? 'up' : 'down'}>
                  {tr.price ?? tr[0]}
                </span>
                <span>{tr.qty ?? tr.quantity ?? tr[1]}</span>
                <span className="dim">{tr.time ? new Date(tr.time).toLocaleTimeString() : ''}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="sodex-execution-preview">
        <h3>Execution preview (Wave 3)</h3>
        <p>
          Signal → review orderbook depth on SoDEX → confirm size → EIP-712 signed order via SoDEX Spot API.
          CryptoDesk uses <strong>4 public SoDEX endpoints</strong> today; live placement ships Wave 3.
        </p>
        <div className="wf-step done">✓ Ingest (SoSoValue news + flows)</div>
        <div className="wf-step done">✓ Analyze (Grok + signals)</div>
        <div className="wf-step done">✓ Preview (SoDEX orderbook + trades)</div>
        <div className="wf-step dim">○ Execute (signed POST /trade/orders)</div>
      </div>

      {lastFetch && (
        <p className="api-proof">{apiProof(`SoDEX testnet · ${symbol} · 4 endpoints`)}</p>
      )}
    </div>
  );
}
