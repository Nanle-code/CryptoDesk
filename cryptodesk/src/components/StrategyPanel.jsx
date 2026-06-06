export default function StrategyPanel({
  opportunities = [],
  activeSourceIndex,
  onSelectOpportunity,
  results = {},
  loadingIndex,
  hasGrok,
  onGenerate,
}) {
  const active = opportunities.find((o) => o.sourceIndex === activeSourceIndex) || opportunities[0];
  const result = active?.sourceIndex != null ? results[active.sourceIndex] : null;
  const loading = loadingIndex === active?.sourceIndex;

  return (
    <div className="strategy-panel">
      <p className="report-p dim">
        Strategy Generator — build a named playbook (entry, horizon, risk, exit criteria) for any opportunity.
      </p>

      {opportunities.length > 0 ? (
        <div className="strategy-picker">
          <div className="intel-block-label">Select opportunity</div>
          {opportunities.map((op) => {
            const selected = op.sourceIndex === (active?.sourceIndex ?? activeSourceIndex);
            const hasStrategy = op.sourceIndex != null && results[op.sourceIndex];
            const isLoading = loadingIndex === op.sourceIndex;
            return (
              <button
                key={op.sourceIndex ?? op.asset}
                type="button"
                className={`strategy-pick-row ${selected ? 'active' : ''}`}
                onClick={() => onSelectOpportunity?.(op.sourceIndex)}
              >
                <span className="strategy-pick-asset">{op.asset}</span>
                <span className="strategy-pick-meta">
                  {op.recommendation} · {op.confidence}%
                </span>
                {hasStrategy && <span className="strategy-pick-done"></span>}
                {isLoading && <span className="strategy-pick-done">…</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="report-p dim">No opportunities in feed — connect SoSoValue or use demo mode.</p>
      )}

      {active && (
        <p className="report-p dim">
          Source: <strong>{active.asset}</strong> · {active.recommendation} · {active.confidence}% · {active.risk} risk
        </p>
      )}

      <button
        type="button"
        className="briefing-trigger full"
        disabled={!hasGrok || loading || !active}
        onClick={() => active && onGenerate?.(active)}
      >
        {loading
          ? 'Generating strategy…'
          : !active
            ? 'No opportunity selected'
            : result
              ? ' Regenerate strategy'
              : ' Generate strategy'}
      </button>

      {result && (
        <div className="strategy-result">
          {result.source && (
            <p className="report-p dim">
              Playbook for <strong>{result.source.asset}</strong>
            </p>
          )}
          <h3 className="report-title">{result.name}</h3>
          <div className="strategy-grid">
            <div><span>Action</span><strong>{result.action}</strong></div>
            <div><span>Entry</span><strong>{result.entry}</strong></div>
            <div><span>Risk</span><strong>{result.risk}</strong></div>
            <div><span>Horizon</span><strong>{result.time_horizon}</strong></div>
          </div>
          {result.thesis && (
            <p className="report-p"><strong>Thesis:</strong> {result.thesis}</p>
          )}
          <div className="intel-block-label">Exit criteria</div>
          <ul className="opportunity-bullets">
            {result.exit_criteria?.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
