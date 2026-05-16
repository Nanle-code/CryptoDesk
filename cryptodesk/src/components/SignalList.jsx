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
            {s.sentiment === 'bullish' ? 'Bull' : s.sentiment === 'bearish' ? 'Bear' : 'Hold'} · {s.strength}/5
          </span>
          <span className="signal-content">
            <span className="signal-title">{s.asset} — {(s.title || '').slice(0, 50)}</span>
            <span className="signal-desc">{s.reason}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
