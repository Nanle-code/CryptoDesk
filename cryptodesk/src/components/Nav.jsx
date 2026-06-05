const FEEDS = [
  { cat: 0, label: 'All news', icon: '◈' },
  { cat: 1, label: 'Breaking', icon: '▸' },
  { cat: 2, label: 'Research', icon: '◆' },
  { cat: 3, label: 'Institutional', icon: '⬛' },
  { cat: 4, label: 'KOL', icon: '◇' },
];

const SOSO_TOOLS = [
  { id: 'soso-hub', label: 'SoSo hub (all)', icon: '◉', action: 'tab:soso' },
  { id: 'etf', label: 'ETF flows', icon: '₿' },
  { id: 'macro', label: 'Macro', icon: '⊡' },
  { id: 'sectors', label: 'Sectors', icon: '◈' },
  { id: 'indices', label: 'SSI indices', icon: '◆' },
  { id: 'treasuries', label: 'BTC treasuries', icon: '🏦' },
  { id: 'fundraising', label: 'Fundraising', icon: '🚀' },
];

const SODEX_TOOLS = [
  { id: 'sodex-hub', label: 'SoDEX terminal', icon: '◎', action: 'tab:sodex' },
  { id: 'order-audit', label: 'Order audit', icon: '📋' },
  { id: 'sodex', label: 'Orderbook panel', icon: '📊' },
];

const AI_TOOLS = [
  { id: 'demo', label: 'Judge demo', icon: '🏁', action: 'demo' },
  { id: 'workflow', label: 'Agent workflow', icon: '⟳' },
  { id: 'signals', label: 'Signal feed', icon: '⚡' },
  { id: 'archive', label: 'Signal archive', icon: '📜' },
  { id: 'opportunities', label: 'Opportunities', icon: '🔥' },
  { id: 'copilot', label: 'Research copilot', icon: '🧠' },
  { id: 'narratives', label: 'Narratives', icon: '↻' },
  { id: 'watchlist', label: 'Watchlist', icon: '👁' },
  { id: 'portfolio', label: 'Portfolio', icon: '📊' },
  { id: 'ssi-index', label: 'SSI index', icon: '◆' },
  { id: 'strategy', label: 'Strategy', icon: '📋' },
  { id: 'briefing', label: 'AI briefing', icon: '✦', action: 'briefing' },
];

const PANEL_IDS = [
  'workflow', 'signals', 'archive', 'opportunities', 'copilot', 'narratives', 'watchlist', 'portfolio', 'ssi-index', 'strategy',
  'briefing', 'etf', 'macro', 'sectors', 'indices',
  'treasuries', 'fundraising', 'sodex', 'sodex-hub', 'order-audit', 'soso-hub', 'article',
];

export default function Nav({
  category,
  counts,
  onCategory,
  panel,
  onPanel,
  onBriefing,
  onStartDemo,
  demoOpen,
  onMainTab,
  mainTab,
}) {
  const handleTool = (t) => {
    if (t.action === 'briefing') onBriefing();
    else if (t.action === 'demo') onStartDemo?.();
    else if (t.action === 'tab:soso') onMainTab?.('soso');
    else if (t.action === 'tab:sodex') onMainTab?.('sodex');
    else onPanel(t.id);
  };

  return (
    <nav className="col-nav">
      <div className="nav-brand">
        <span className="nav-brand-soso">SoSoValue</span>
        <span className="nav-brand-x">×</span>
        <span className="nav-brand-sodex">SoDEX</span>
      </div>

      <div className="nav-section-head">News · SoSoValue feeds</div>
      {FEEDS.map(({ cat, label, icon }) => (
        <button
          key={cat}
          type="button"
          className={`nav-item ${category === cat && mainTab === 'news' && !PANEL_IDS.includes(panel) ? 'active' : ''}`}
          onClick={() => { onMainTab?.('news'); onCategory(cat); }}
        >
          <span className="nav-item-label">{icon} {label}</span>
          <span className="nav-item-count">{counts[cat] ?? '—'}</span>
        </button>
      ))}

      <div className="nav-divider" />
      <div className="nav-section-head nav-section-soso">SoSoValue data</div>
      {SOSO_TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-tool nav-tool-soso ${panel === t.id || (t.action === 'tab:soso' && mainTab === 'soso') ? 'active' : ''}`}
          onClick={() => handleTool(t)}
        >
          <span>{t.icon} {t.label}</span>
          <span className="wave-badge w2">SV</span>
        </button>
      ))}

      <div className="nav-divider" />
      <div className="nav-section-head nav-section-sodex">SoDEX execution</div>
      {SODEX_TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-tool nav-tool-sodex ${panel === t.id || (t.action === 'tab:sodex' && mainTab === 'sodex') ? 'active' : ''}`}
          onClick={() => handleTool(t)}
        >
          <span>{t.icon} {t.label}</span>
          <span className="wave-badge sodex">SDX</span>
        </button>
      ))}

      <div className="nav-divider" />
      <div className="nav-section-head">AI intelligence</div>
      {AI_TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`nav-tool ${(t.id === 'demo' && demoOpen) || panel === t.id ? 'active' : ''}`}
          onClick={() => handleTool(t)}
        >
          <span>{t.icon} {t.label}</span>
        </button>
      ))}
    </nav>
  );
}
