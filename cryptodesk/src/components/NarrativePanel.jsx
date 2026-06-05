export default function NarrativePanel({ data, loading, hasGrok, onScan }) {
  if (loading) return <p className="report-p dim">Scanning narrative rotation…</p>;

  if (!data) {
    return (
      <>
        <p className="report-p dim">Detect capital flow shifts between sectors and themes using news + SoSoValue sector data.</p>
        <button type="button" className="briefing-trigger full" disabled={!hasGrok} onClick={onScan}>
          {hasGrok ? '↻ Scan narrative rotation' : 'Add Grok API key to scan'}
        </button>
      </>
    );
  }

  return (
    <div className="narrative-panel">
      <div className="narrative-card">
        <span className="narrative-tag">Current</span>
        <strong>{data.current_narrative}</strong>
        <span className={`momentum-pill ${String(data.current_momentum).toLowerCase()}`}>
          {data.current_momentum}
        </span>
      </div>
      <div className="narrative-arrow">↓</div>
      <div className="narrative-card emerging">
        <span className="narrative-tag">Emerging</span>
        <strong>{data.emerging_narrative}</strong>
        <span className={`momentum-pill ${String(data.emerging_momentum).toLowerCase()}`}>
          {data.emerging_momentum}
        </span>
      </div>
      <p className="report-p agent-insight"><strong>Agent insight:</strong> {data.insight}</p>
      <button type="button" className="btn-ghost small" onClick={onScan}>Rescan</button>
    </div>
  );
}
