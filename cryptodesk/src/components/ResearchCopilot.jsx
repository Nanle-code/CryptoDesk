const PRESETS = [
  'Why is ETH bullish today?',
  'What are today\'s biggest risks?',
  'Summarize the market in 5 bullets.',
  'What opportunities exist in this feed?',
  'What is the strongest narrative right now?',
  'Suggest a $1,000 medium-risk growth portfolio from current headlines.',
];

export default function ResearchCopilot({
  hasGrok,
  query,
  onQueryChange,
  answer,
  loading,
  onAsk,
}) {
  const submit = (q) => {
    const text = (q || query || '').trim();
    if (!text) return;
    onAsk(text);
  };

  return (
    <div className="copilot-panel">
      <p className="report-p dim">Ask research-grade questions against the live SoSoValue feed.</p>
      <div className="copilot-presets">
        {PRESETS.map((p) => (
          <button key={p} type="button" className="btn-ghost small copilot-preset" onClick={() => submit(p)}>
            {p}
          </button>
        ))}
      </div>
      <textarea
        className="copilot-input"
        rows={3}
        placeholder={hasGrok ? 'Ask CryptoDesk Research Copilot…' : 'Add Grok API key in Settings to enable'}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        disabled={!hasGrok || loading}
      />
      <button
        type="button"
        className="briefing-trigger full"
        disabled={!hasGrok || loading || !query.trim()}
        onClick={() => submit()}
      >
        {loading ? 'Researching…' : '🧠 Run research query'}
      </button>
      {answer && (
        <div className="copilot-answer">
          <p className="report-p" style={{ whiteSpace: 'pre-wrap' }}>{answer}</p>
        </div>
      )}
    </div>
  );
}
