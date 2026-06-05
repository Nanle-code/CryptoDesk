import { exportOrderAuditJson } from '../lib/sodexExecution';
import { timeAgo } from '../lib/format';

const STATUS_LABEL = {
  prepared: 'Prepared',
  submitted: 'Submitted',
  failed: 'Failed',
};

export default function OrderAuditPanel({ audit, onClear, onOpenSoDEX }) {
  const handleExport = () => {
    const blob = new Blob([exportOrderAuditJson(audit || [])], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptodesk-order-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!audit?.length) {
    return (
      <>
        <p className="report-p dim">
          Every <strong>Prepare signed order</strong> on the SoDEX tab is logged here with client order ID,
          side, notional, and recommendation context (session only).
        </p>
        <p className="api-proof">sessionStorage · cd_order_audit · max 50 entries</p>
      </>
    );
  }

  return (
    <>
      <div className="archive-toolbar">
        <p className="report-p dim">{audit.length} order(s) · newest first</p>
        <div className="archive-actions">
          <button type="button" className="btn-ghost small" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="btn-ghost small" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <div className="archive-list">
        {audit.map((entry) => (
          <div
            key={`${entry.clOrdID}-${entry.at}`}
            className={`archive-row ${entry.side === 'SELL' ? 'bearish' : 'bullish'}`}
          >
            <div className="archive-row-head">
              <span className="archive-type">📋</span>
              <span className="archive-asset">{entry.symbol}</span>
              <span className="archive-meta">
                {entry.side} · {entry.type}
                {entry.notionalUsdc != null ? ` · $${entry.notionalUsdc}` : ''}
                {entry.action ? ` · ${entry.action}` : ''}
              </span>
              <span className={`audit-status status-${entry.status || 'prepared'}`}>
                {STATUS_LABEL[entry.status] || entry.status}
              </span>
              <span className="archive-time">{timeAgo(new Date(entry.at).getTime())}</span>
            </div>
            <p className="archive-title">
              <code>{entry.clOrdID}</code>
            </p>
            {entry.symbol && onOpenSoDEX && (
              <button
                type="button"
                className="btn-ghost small"
                onClick={() => onOpenSoDEX(entry.symbol)}
              >
                Open on SoDEX tab
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="api-proof">
        cd_order_audit · scaffold entries only · live POST requires SoDEX SDK signing
      </p>
    </>
  );
}
