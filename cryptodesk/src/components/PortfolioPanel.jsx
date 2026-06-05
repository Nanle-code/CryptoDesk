const RISKS = ['Low', 'Medium', 'High'];
const GOALS = ['Growth', 'Income', 'Balanced', 'Speculative'];

export default function PortfolioPanel({
  form,
  onFormChange,
  result,
  loading,
  hasGrok,
  onGenerate,
}) {
  return (
    <div className="portfolio-panel">
      <p className="report-p dim">Portfolio Intelligence Agent — allocations with reasoning for every sleeve.</p>
      <div className="agent-form-grid">
        <label>
          Capital ($)
          <input
            type="number"
            min={100}
            step={100}
            value={form.capital}
            onChange={(e) => onFormChange({ ...form, capital: Number(e.target.value) || 1000 })}
          />
        </label>
        <label>
          Risk
          <select value={form.risk} onChange={(e) => onFormChange({ ...form, risk: e.target.value })}>
            {RISKS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label>
          Goal
          <select value={form.goal} onChange={(e) => onFormChange({ ...form, goal: e.target.value })}>
            {GOALS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </label>
      </div>
      <button type="button" className="briefing-trigger full" disabled={!hasGrok || loading} onClick={onGenerate}>
        {loading ? 'Building portfolio…' : '📊 Generate portfolio'}
      </button>
      {result && (
        <>
          <p className="report-p">{result.summary}</p>
          <div className="allocation-bars">
            {result.allocations?.map((a) => (
              <div key={a.asset} className="allocation-row">
                <div className="allocation-header">
                  <strong>{a.asset}</strong>
                  <span>{a.pct}%</span>
                </div>
                <div className="allocation-bar-track">
                  <div className="allocation-bar-fill" style={{ width: `${a.pct}%` }} />
                </div>
                <p className="report-p dim">{a.reason}</p>
              </div>
            ))}
          </div>
          {result.risk_note && <p className="report-p dim"><strong>Risk control:</strong> {result.risk_note}</p>}
        </>
      )}
    </div>
  );
}
