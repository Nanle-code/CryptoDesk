export default function ExecutionPreviewCard({ context, liveSlippage }) {
  if (!context) return null;

  const slippage = liveSlippage || context.slippage_estimate;

  return (
    <div className="execution-preview-card">
      <div className="execution-preview-head">
        <span className="execution-preview-tag">Execution preview</span>
        <span className="execution-preview-pair">{context.symbol}</span>
      </div>
      <div className="execution-preview-grid">
        <div>
          <span>Action</span>
          <strong className={`exec-action ${context.action?.toLowerCase()}`}>
            {context.action} {context.asset}
          </strong>
        </div>
        <div>
          <span>Confidence</span>
          <strong>{context.confidence != null ? `${context.confidence}%` : '—'}</strong>
        </div>
        <div>
          <span>Suggested allocation</span>
          <strong>{context.allocation_pct}%</strong>
        </div>
        <div>
          <span>Est. slippage</span>
          <strong>{slippage}</strong>
        </div>
        <div>
          <span>Risk</span>
          <strong>{context.risk}</strong>
        </div>
        <div>
          <span>Horizon</span>
          <strong>{context.time_horizon}</strong>
        </div>
      </div>
      <p className="execution-route">
        <strong>Execution route:</strong> {context.route}
        {liveSlippage && context.slippage_estimate !== liveSlippage && (
          <span className="dim"> · live spread {liveSlippage}</span>
        )}
      </p>
      {context.why?.length > 0 && (
        <>
          <div className="intel-block-label">Why</div>
          <ul className="opportunity-bullets">
            {context.why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </>
      )}
      {context.risks?.length > 0 && (
        <>
          <div className="intel-block-label">Risks</div>
          <ul className="opportunity-bullets risks">
            {context.risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      )}
      <p className="report-p dim execution-disclaimer">
        Preview only — use <strong>Prepare signed order</strong> below for EIP-712 scaffold (no live POST).
      </p>
    </div>
  );
}
