export default function SignalList({ signals, onSelect }) {
  if (!signals?.length) {
    return <p className="report-p dim">No strong signals (strength ≥2) in current feed.</p>;
  }
  return (
    <div className="signal-list">
      {signals.map((s, i) => (
        <button
          key={i}
          type="button"
          className={`signal-item ${s.sentiment}`}
          onClick={() => s.index >= 0 && onSelect?.(s.index)}
        >
          <span className="signal-badge">
            {s.aiClassified && <span className="signal-ai-tag">AI</span>}
            {s.recommendation || (s.sentiment === 'bullish' ? 'Bull' : s.sentiment === 'bearish' ? 'Bear' : 'Hold')}
            {s.confidence ? ` · ${s.confidence}%` : ` · ${s.strength}/5`}
          </span>
          <span className="signal-content">
            <span className="signal-title">
              {(s.affected_assets?.length ? s.affected_assets.join(', ') : s.asset)} — {(s.title || '').slice(0, 50)}
            </span>
            {(s.time_horizon || s.impact) && (
              <span className="signal-meta">
                {s.time_horizon ? `${s.time_horizon.charAt(0).toUpperCase() + s.time_horizon.slice(1)} horizon` : ''}
                {s.time_horizon && s.impact ? ' · ' : ''}
                {s.impact ? `${s.impact} impact` : ''}
              </span>
            )}
            <span className="signal-desc">{s.reason}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
