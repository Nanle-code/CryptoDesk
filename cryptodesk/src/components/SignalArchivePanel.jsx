import { useMemo, useState } from 'react';
import { exportArchiveJson } from '../lib/signalArchive';
import { timeAgo } from '../lib/format';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'signal', label: 'Signals' },
  { id: 'opportunity', label: 'Opportunities' },
];

export default function SignalArchivePanel({ archive, onClear, onSelectEntry }) {
  const [filter, setFilter] = useState('all');

  const rows = useMemo(() => {
    const list = archive || [];
    if (filter === 'all') return list;
    return list.filter((e) => e.type === filter);
  }, [archive, filter]);

  const handleExport = () => {
    const blob = new Blob([exportArchiveJson(archive || [])], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptodesk-signal-archive-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!archive?.length) {
    return (
      <>
        <p className="report-p dim">
          High-conviction signals and opportunities are saved here as the feed refreshes (session only).
        </p>
        <p className="api-proof">sessionStorage · cd_signal_archive · max 120 entries</p>
      </>
    );
  }

  return (
    <>
      <div className="archive-toolbar">
        <div className="archive-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`btn-ghost small ${filter === f.id ? 'active-preset' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="archive-actions">
          <button type="button" className="btn-ghost small" onClick={handleExport}>
            Export JSON
          </button>
          <button type="button" className="btn-ghost small" onClick={onClear}>
            Clear
          </button>
        </div>
      </div>

      <p className="report-p dim">{rows.length} archived · newest first · persists for this browser session</p>

      <div className="archive-list">
        {rows.map((entry) => (
          <button
            key={entry.id}
            type="button"
            className={`archive-row ${entry.sentiment || 'neutral'}`}
            onClick={() => entry.sourceIndex >= 0 && onSelectEntry?.(entry.sourceIndex)}
          >
            <div className="archive-row-head">
              <span className="archive-type">{entry.type === 'opportunity' ? '🔥' : '⚡'}</span>
              <span className="archive-asset">{entry.asset}</span>
              <span className="archive-meta">
                {entry.recommendation || entry.sentiment}
                {entry.confidence != null ? ` · ${entry.confidence}%` : entry.strength ? ` · ${entry.strength}/5` : ''}
                {entry.risk ? ` · ${entry.risk} risk` : ''}
              </span>
              <span className="archive-time">{timeAgo(new Date(entry.archivedAt).getTime())}</span>
            </div>
            <p className="archive-title">{(entry.title || '').slice(0, 120)}</p>
            {entry.why?.length > 0 && (
              <ul className="archive-why">
                {entry.why.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
            {entry.aiClassified && <span className="signal-ai-tag">AI</span>}
          </button>
        ))}
      </div>

      <p className="api-proof">sessionStorage · cd_signal_archive · deduped by headline + source index</p>
    </>
  );
}
