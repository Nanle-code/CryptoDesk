export default function TrustBar({ stats, connected, aiClassifying, hasGrok }) {
  const items = [
    { label: 'Live articles', value: stats.articles || '—' },
    {
      label: 'AI signals',
      value: aiClassifying ? '…' : stats.signals || '—',
    },
    { label: 'Bullish scan', value: stats.articles ? `${stats.sentiment}%` : '—' },
    {
      label: 'Signal engine',
      value: hasGrok
        ? aiClassifying
          ? 'Grok classifying'
          : 'Lexicon + Grok'
        : 'Lexicon only',
    },
  ];

  return (
    <section className="trust-bar">
      <div className="trust-bar-inner">
        <div className="trust-pill">
          <span className={`trust-dot ${aiClassifying ? 'pulse' : ''}`} />
          {aiClassifying
            ? 'Grok AI classifying top signals…'
            : connected
              ? 'Connected to live market data'
              : 'Connect API keys to unlock live data'}
        </div>
        <div className="trust-metrics">
          {items.map((item) => (
            <div key={item.label} className="trust-metric">
              <span className="trust-metric-val">{item.value}</span>
              <span className="trust-metric-label">{item.label}</span>
            </div>
          ))}
        </div>
        <div className="trust-badges">
          <span className="trust-badge">SoSoValue</span>
          <span className="trust-badge">SoDEX Spot</span>
          <span className="trust-badge">Grok AI</span>
          <span className="trust-badge">Buildathon W3</span>
        </div>
      </div>
    </section>
  );
}
