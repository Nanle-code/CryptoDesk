import { useState } from 'react';
import NewsFeed from './NewsFeed';
import SoDEXTerminal from './SoDEXTerminal';
import SoSoDashboard from './SoSoDashboard';

const TABS = [
  { id: 'news', label: 'News feed', sub: 'SoSoValue /news' },
  { id: 'soso', label: 'SoSoValue Hub', sub: '8+ endpoints' },
  { id: 'sodex', label: 'SoDEX Terminal', sub: 'Spot testnet' },
];

export default function MainWorkspace(props) {
  const { sosoKey, sodexSymbol, onSodexSymbol, mainTab, onMainTab } = props;
  const [localTab, setLocalTab] = useState('news');
  const tab = mainTab ?? localTab;
  const setTab = onMainTab ?? setLocalTab;

  return (
    <main className="col-feed main-workspace">
      <div className="main-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`main-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="main-tab-label">{t.label}</span>
            <span className="main-tab-sub">{t.sub}</span>
          </button>
        ))}
      </div>

      {tab === 'news' && (
        <>
          <div className="feed-toolbar">
            <div>
              <h2>Market intelligence</h2>
              <p>SoSoValue news · /news, /news/hot, /news/featured</p>
            </div>
            <div className="feed-tabs">
              {['latest', 'hot', 'featured'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`feed-tab ${props.tab === t ? 'active' : ''}`}
                  onClick={() => props.onTab(t)}
                >
                  {t === 'hot' ? ' Hot' : t === 'featured' ? ' Featured' : 'Latest'}
                </button>
              ))}
            </div>
          </div>
          <NewsFeed {...props} hideToolbar />
        </>
      )}
      {tab === 'soso' && <SoSoDashboard apiKey={sosoKey} />}
      {tab === 'sodex' && (
        <SoDEXTerminal
          previewSymbol={props.sodexSymbol}
          executionContext={props.executionContext}
          onSymbolChange={props.onSodexSymbol}
          sosoKey={sosoKey}
          sodexKey={props.sodexKey}
          onOrderAuditUpdate={props.onOrderAuditUpdate}
        />
      )}
    </main>
  );
}
