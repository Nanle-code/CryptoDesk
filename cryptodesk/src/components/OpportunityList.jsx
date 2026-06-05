import { assetToSodexSymbol } from '../lib/sodexSymbol';

function ExplainabilityBlock({ op, insight }) {
  const why = op?.why?.length ? op.why : [];
  const risks = [...(op?.risks || [])];
  if (insight?.risk_drivers?.length) {
    insight.risk_drivers.forEach((r) => {
      if (!risks.includes(r)) risks.push(r);
    });
  }

  if (!why.length && !risks.length) return null;

  return (
    <div className="opportunity-explain">
      {op.explainSource && (
        <span className="explain-source-tag">
          {op.explainSource === 'grok' ? 'Grok explainability' : 'Auto explainability'}
        </span>
      )}
      {why.length > 0 && (
        <>
          <div className="intel-block-label">Why?</div>
          <ul className="opportunity-bullets why">
            {why.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </>
      )}
      {risks.length > 0 && (
        <>
          <div className="intel-block-label">Risks</div>
          <ul className="opportunity-bullets risks">
            {risks.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </>
      )}
      {insight?.mitigation && (
        <p className="report-p dim"><strong>Mitigation:</strong> {insight.mitigation}</p>
      )}
    </div>
  );
}

function InsightBlock({ insight }) {
  if (!insight?.explanation && insight?.conviction == null) return null;
  return (
    <div className="opportunity-insight">
      {insight.explanation && (
        <p className="report-p dim"><strong>Deep risk assess:</strong> {insight.explanation}</p>
      )}
      {insight.conviction != null && (
        <p className="report-p dim">Risk conviction: {insight.conviction}% · {insight.risk} risk</p>
      )}
    </div>
  );
}

function CommitteeBlock({ review }) {
  if (!review) return null;
  return (
    <div className="committee-block">
      <div className="committee-row"><span>Analyst</span><p>{review.analyst}</p></div>
      <div className="committee-row"><span>Risk</span><p>{review.risk_agent}</p></div>
      <div className="committee-row"><span>Macro</span><p>{review.macro_agent}</p></div>
      <div className="committee-row"><span>Execution</span><p>{review.execution_agent}</p></div>
      <div className="committee-final">
        <strong>{review.final_recommendation}</strong>
        <span>{review.confidence}% confidence · {review.risk} risk</span>
      </div>
      {review.allocation_pct != null && (
        <p className="report-p dim">
          Suggested allocation: {review.allocation_pct}% · Est. slippage: {review.slippage_estimate || '—'}
        </p>
      )}
    </div>
  );
}

export default function OpportunityList({
  opportunities,
  insights = {},
  committeeReviews = {},
  insightLoadingIndex,
  committeeLoadingIndex,
  explainingOpps,
  hasGrok,
  onSelect,
  onExplain,
  onCommittee,
  onOpenSoDEX,
  strategyResults = {},
  strategyLoadingIndex,
  onGenerateStrategy,
}) {
  if (!opportunities?.length) {
    return <p className="report-p dim">No opportunities found yet.</p>;
  }

  return (
    <div className="opportunity-list">
      {explainingOpps && hasGrok && (
        <p className="report-p dim explain-loading">Enriching explainability with Grok…</p>
      )}
      {opportunities.map((op, index) => {
        const key = op.sourceIndex ?? index;
        const insight = insights[op.sourceIndex];
        const committee = committeeReviews[op.sourceIndex];
        const explaining = insightLoadingIndex === op.sourceIndex;
        const committeeLoading = committeeLoadingIndex === op.sourceIndex;
        const sodexPair = assetToSodexSymbol(op.asset);
        const hasStrategy = op.sourceIndex != null && strategyResults[op.sourceIndex];
        const strategyLoading = strategyLoadingIndex === op.sourceIndex;

        return (
          <div key={key} className="opportunity-card">
            <div className="opportunity-card-header">
              <div>
                <div className="opportunity-label">{op.asset}</div>
                <div className="opportunity-title">{op.title?.slice(0, 56) || op.recommendation}</div>
              </div>
              <div className={`opportunity-pill ${op.recommendation?.toLowerCase()}`}>
                {op.confidence}%
              </div>
            </div>
            <div className="opportunity-meta">
              <span>{op.recommendation}</span>
              <span>{op.risk} risk</span>
              <span>{op.time_horizon} horizon</span>
              <span>{op.impact} impact</span>
            </div>
            {op.reason && !op.why?.includes(op.reason) && (
              <p className="report-p opportunity-reason dim">{op.reason}</p>
            )}

            <ExplainabilityBlock op={op} insight={insight} />
            <InsightBlock insight={insight} />
            <CommitteeBlock review={committee} />
            {hasStrategy && (
              <p className="report-p dim strategy-inline">
                <strong>Strategy:</strong> {strategyResults[op.sourceIndex].name}
              </p>
            )}

            <div className="opportunity-actions">
              {typeof onSelect === 'function' && op.sourceIndex != null && (
                <button type="button" className="btn-ghost small" onClick={() => onSelect(op.sourceIndex)}>
                  Article
                </button>
              )}
              {hasGrok && typeof onExplain === 'function' && (
                <button
                  type="button"
                  className="btn-ghost small"
                  disabled={explaining}
                  onClick={() => onExplain(op)}
                >
                  {explaining ? 'Assessing…' : 'Deep risk assess'}
                </button>
              )}
              {hasGrok && typeof onCommittee === 'function' && (
                <button
                  type="button"
                  className="btn-ghost small"
                  disabled={committeeLoading}
                  onClick={() => onCommittee(op)}
                >
                  {committeeLoading ? 'Committee…' : 'Committee'}
                </button>
              )}
              {hasGrok && typeof onGenerateStrategy === 'function' && (
                <button
                  type="button"
                  className="btn-ghost small"
                  disabled={strategyLoading}
                  onClick={() => onGenerateStrategy(op)}
                >
                  {strategyLoading ? 'Strategy…' : hasStrategy ? '📋 Strategy ✓' : '📋 Strategy'}
                </button>
              )}
              {typeof onOpenSoDEX === 'function' && (
                <button type="button" className="btn-ghost small" onClick={() => onOpenSoDEX(sodexPair, op)}>
                  Execution preview · {sodexPair}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
