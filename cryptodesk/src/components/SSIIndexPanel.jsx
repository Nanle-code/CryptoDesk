import { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { apiProof } from '../lib/api';
import {
  THEME_PRESETS,
  constituentsSummary,
  fetchSSIReference,
} from '../lib/ssiIndex';

export default function SSIIndexPanel({
  theme,
  onThemeChange,
  result,
  loading,
  hasGrok,
  hasSoso,
  sosoKey,
  selectedTicker,
  onSelectedTickerChange,
  onBuild,
}) {
  const { showToast } = useConfig();
  const [liveRef, setLiveRef] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState(null);

  const loadLiveReference = async (ticker = selectedTicker) => {
    if (!hasSoso || !sosoKey) return;
    setLiveLoading(true);
    setLiveError(null);
    try {
      const ref = await fetchSSIReference(sosoKey, theme, ticker || null);
      setLiveRef(ref);
      if (ref.matchedIndex?.ticker && ref.matchedIndex.ticker !== selectedTicker) {
        onSelectedTickerChange?.(ref.matchedIndex.ticker);
      }
    } catch (e) {
      setLiveError(e.message);
      showToast?.(`SoSoValue indices error: ${e.message}`);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    if (hasSoso && sosoKey) loadLiveReference();
    else setLiveRef(null);
  }, [hasSoso, sosoKey, theme]);

  const indices = liveRef?.indices || [];
  const liveConstituents = result?.liveReference?.constituents?.length
    ? result.liveReference.constituents
    : liveRef?.constituents || [];

  return (
    <div className="ssi-panel">
      <p className="report-p dim">
        SSI Index Builder — live SoSoValue SSI indices + constituents, then Grok-designed weights (SSI Protocol).
      </p>

      <div className="ssi-themes">
        {THEME_PRESETS.map((t) => (
          <button
            key={t}
            type="button"
            className={`btn-ghost small ${theme === t ? 'active-preset' : ''}`}
            onClick={() => onThemeChange(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <input
        className="copilot-input"
        value={theme}
        onChange={(e) => onThemeChange(e.target.value)}
        placeholder="Index theme name"
      />

      {hasSoso && (
        <div className="ssi-live-block">
          <div className="intel-block-label">Live SoSoValue SSI reference</div>
          {liveLoading && <p className="report-p dim">Loading GET /indices…</p>}
          {liveError && <p className="report-p error">{liveError}</p>}
          {!liveLoading && indices.length > 0 && (
            <>
              <label className="ssi-select-label">
                SSI index
                <select
                  value={selectedTicker || liveRef?.matchedIndex?.ticker || ''}
                  onChange={(e) => {
                    onSelectedTickerChange?.(e.target.value);
                    loadLiveReference(e.target.value);
                  }}
                >
                  {indices.map((idx) => {
                    const t = idx.ticker || idx.symbol;
                    return (
                      <option key={t} value={t}>
                        {t} — {idx.name || idx.full_name || ''}
                      </option>
                    );
                  })}
                </select>
              </label>
              {liveRef?.matchedIndex && (
                <p className="report-p dim">
                  Matched: <strong>{liveRef.matchedIndex.ticker}</strong> · {constituentsSummary(liveRef)}
                </p>
              )}
              {liveConstituents.length > 0 && (
                <div className="ssi-live-constituents">
                  {liveConstituents.slice(0, 12).map((c) => (
                    <div key={c.symbol} className="ssi-live-row">
                      <span className="ssi-live-sym">{c.symbol}</span>
                      <span>{c.name?.slice(0, 28) || '—'}</span>
                      <span className="ssi-live-w">{c.weight_pct != null ? `${c.weight_pct}%` : '—'}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="api-proof">
                {apiProof(liveRef?.endpoints?.join(' · ') || 'GET /indices')}
              </p>
              <button type="button" className="btn-ghost small" onClick={() => loadLiveReference()}>
                ↻ Refresh live constituents
              </button>
            </>
          )}
        </div>
      )}

      {!hasSoso && (
        <p className="report-p dim">Connect SoSoValue for live SSI index + constituent data.</p>
      )}

      <button
        type="button"
        className="briefing-trigger full"
        disabled={!hasGrok || loading}
        onClick={() => onBuild?.(selectedTicker || liveRef?.matchedIndex?.ticker)}
      >
        {loading ? 'Building index…' : `◆ Build ${theme || 'index'} with SSI alignment`}
      </button>

      {result && (
        <>
          <h3 className="report-title">{result.index_name}</h3>
          {result.ssi_alignment && (
            <p className="report-p"><strong>SSI alignment:</strong> {result.ssi_alignment}</p>
          )}
          <ul className="methodology-list">
            {result.methodology?.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>

          {result.liveReference?.ticker && (
            <div className="intel-block-label">
              Grok-designed weights · vs live {result.liveReference.ticker}
            </div>
          )}

          <div className="allocation-bars">
            {result.constituents?.map((c) => (
              <div key={c.symbol} className={`allocation-row ${c.liveMatch ? 'ssi-live-match' : ''}`}>
                <div className="allocation-header">
                  <strong>
                    {c.symbol}
                    {c.liveMatch && <span className="ssi-match-tag">SSI ✓</span>}
                  </strong>
                  <span>
                    {c.pct}%
                    {c.liveWeight != null && (
                      <span className="dim"> · live {c.liveWeight}%</span>
                    )}
                  </span>
                </div>
                <div className="allocation-bar-track">
                  <div className="allocation-bar-fill ssi" style={{ width: `${c.pct}%` }} />
                </div>
                <p className="report-p dim">{c.reason}</p>
              </div>
            ))}
          </div>
          {result.rebalance_rule && (
            <p className="report-p dim"><strong>Rebalance:</strong> {result.rebalance_rule}</p>
          )}
        </>
      )}
    </div>
  );
}
