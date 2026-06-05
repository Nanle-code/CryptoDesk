import { useState } from 'react';

function SentimentBar({ score, label }) {
  const color = score >= 58 ? 'var(--signal-bull)' : score <= 42 ? 'var(--signal-bear)' : 'var(--amber)';
  return (
    <div className="watch-sentiment">
      <div className="watch-sentiment-head">
        <span>{label}</span>
        <strong style={{ color }}>{score}%</strong>
      </div>
      <div className="watch-sentiment-track">
        <div className="watch-sentiment-fill" style={{ width: `${score}%`, background: color }} />
      </div>
    </div>
  );
}

export default function WatchlistPanel({
  tokens,
  tokenRows = [],
  alerts,
  narrativeData,
  onChange,
  onScanNarratives,
  narrativeLoading,
  hasGrok,
}) {
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim().toUpperCase().replace(/^\$/, '');
    if (!t || tokens.includes(t)) return;
    onChange([...tokens, t]);
    setInput('');
  };

  const remove = (t) => onChange(tokens.filter((x) => x !== t));

  const rowMap = Object.fromEntries(tokenRows.map((r) => [r.asset, r]));

  return (
    <div className="watchlist-panel">
      <p className="report-p dim">
        Monitors signals, opportunities, per-token sentiment, and narrative rotation for your tokens.
      </p>
      <div className="watchlist-chips">
        {tokens.map((t) => (
          <span key={t} className="watch-chip">
            {t}
            <button type="button" aria-label={`Remove ${t}`} onClick={() => remove(t)}>×</button>
          </span>
        ))}
      </div>
      <div className="watchlist-add">
        <input
          type="text"
          placeholder="Add token (e.g. AVAX)"
          value={input}
          maxLength={6}
          onChange={(e) => setInput(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button type="button" className="btn-ghost small" onClick={add}>Add</button>
      </div>

      <div className="watchlist-token-grid">
        <div className="intel-block-label">Token monitor · sentiment</div>
        {tokens.map((t) => {
          const row = rowMap[t] || { asset: t, score: 50, label: 'neutral', signalCount: 0, mentionCount: 0 };
          return (
            <div key={t} className="watch-token-card">
              <div className="watch-token-head">
                <strong>{t}</strong>
                {row.avgConfidence != null && (
                  <span className="watch-conf-pill">{row.avgConfidence}% conf</span>
                )}
              </div>
              <SentimentBar score={row.score} label={row.label} />
              <p className="report-p dim watch-token-meta">
                {row.signalCount} signal(s) · {row.mentionCount} headline mention(s)
              </p>
              {row.narrative ? (
                <p className="report-p watch-narrative-line">
                  <strong>Narrative:</strong> {row.narrative.label}
                  <span className={`momentum-pill small ${String(row.narrative.momentum).toLowerCase()}`}>
                    {row.narrative.momentum}
                  </span>
                </p>
              ) : (
                <p className="report-p dim">No narrative match yet</p>
              )}
            </div>
          );
        })}
      </div>

      {!narrativeData && typeof onScanNarratives === 'function' && (
        <button
          type="button"
          className="btn-ghost small full"
          disabled={!hasGrok || narrativeLoading}
          onClick={onScanNarratives}
        >
          {narrativeLoading ? 'Scanning narratives…' : '↻ Scan narratives for watchlist'}
        </button>
      )}

      <div className="watchlist-alerts">
        <div className="intel-block-label">Alerts · live</div>
        {alerts.length ? (
          alerts.map((a, i) => (
            <div key={i} className={`watch-alert ${a.severity}`}>
              <span className="watch-alert-type">{a.type}</span>
              <p>{a.message}</p>
            </div>
          ))
        ) : (
          <p className="report-p dim">No alerts for watchlist tokens in the current feed.</p>
        )}
      </div>
    </div>
  );
}
