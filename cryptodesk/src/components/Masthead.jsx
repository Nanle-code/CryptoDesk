import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';

export default function Masthead({ tickers, onBriefing, briefingLoading }) {
  const { setSettingsOpen, hasSoso } = useConfig();
  const [clock, setClock] = useState('--:-- UTC');

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      const p = (x) => String(x).padStart(2, '0');
      setClock(`${p(n.getUTCHours())}:${p(n.getUTCMinutes())}:${p(n.getUTCSeconds())} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const chips = [
    { sym: 'BTC', id: 'btc' },
    { sym: 'ETH', id: 'eth' },
    { sym: 'SOL', id: 'sol' },
    { sym: 'BNB', id: 'bnb' },
  ];

  return (
    <header className="masthead">
      <div className="masthead-left">
        <div className="logo-wordmark">Crypto<span>Desk</span></div>
        <span className="logo-tagline">On-chain intelligence</span>
      </div>
      <div className="masthead-center">
        {chips.map(({ sym, id }) => (
          <div key={id} className="ticker-chip">
            <span className="sym">{sym}</span>
            <span className="price">{tickers[id]?.price ?? '—'}</span>
            <span className={`chg ${tickers[id]?.up ? 'up' : 'down'}`}>{tickers[id]?.chg ?? '—'}</span>
          </div>
        ))}
      </div>
      <div className="masthead-right">
        <div className="live-tag"><span className="live-dot" /> Live</div>
        <span className="clock">{clock}</span>
        <button type="button" className="btn-ghost" onClick={() => setSettingsOpen(true)}>
          {hasSoso ? 'API connected' : 'Connect API'}
        </button>
        <button type="button" className="btn-primary" disabled={briefingLoading} onClick={onBriefing}>
          {briefingLoading ? 'Generating…' : ' AI Briefing'}
        </button>
      </div>
    </header>
  );
}
