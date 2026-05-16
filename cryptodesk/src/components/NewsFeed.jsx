import { CAT, CAT_CLS, stripHtml, timeAgo } from '../lib/format';

export default function NewsFeed({
  news,
  tab,
  category,
  loading,
  error,
  onTab,
  selectedIndex,
  onSelect,
  hideToolbar = false,
}) {
  const labelMap = { 0: 'All markets', 1: 'Breaking', 2: 'Research', 3: 'Institutional', 4: 'KOL' };
  const sectionLabel = tab === 'featured' ? 'Featured' : labelMap[category] || 'News';

  const list = (
    <div className="feed-list">
      {loading && <p className="feed-status">Loading live intelligence…</p>}
      {error && <p className="feed-status error">{error}</p>}
      {!loading && !news.length && <p className="feed-status">No articles found. Check your API key.</p>}
      {news.length > 0 && (
        <>
          <div className="section-headline">
            <div className="section-headline-label">{sectionLabel}</div>
            <div className="section-headline-text">{news.length} stories · SoSoValue · {tab}</div>
          </div>
          {news.map((item, i) => {
            const plain = stripHtml(item.content).slice(0, 160);
            const cat = item.category || 1;
            return (
              <button
                key={item.id || i}
                type="button"
                className={`news-card ${i === 0 ? 'lead' : ''} ${selectedIndex === i ? 'selected' : ''}`}
                onClick={() => onSelect(i)}
              >
                <div className="news-meta">
                  <span className="news-source">{item.nick_name || item.author || 'Source'}</span>
                  <span className={`news-cat ${CAT_CLS[cat] || 'cat-breaking'}`}>{CAT[cat] || 'News'}</span>
                  {item.is_blue_verified && <span className="news-cat cat-official">✓</span>}
                  <span className="news-time">{timeAgo(item.release_time)}</span>
                </div>
                <div className="news-title">{item.title || 'Untitled'}</div>
                {plain && <div className="news-snippet">{plain}</div>}
              </button>
            );
          })}
        </>
      )}
    </div>
  );

  if (hideToolbar) return list;

  return (
    <main className="col-feed">
      <div className="feed-toolbar">
        <div>
          <h2>Market intelligence</h2>
          <p>Real-time crypto news · SoSoValue API</p>
        </div>
        <div className="feed-tabs">
          {['latest', 'hot', 'featured'].map((t) => (
            <button key={t} type="button" className={`feed-tab ${tab === t ? 'active' : ''}`} onClick={() => onTab(t)}>
              {t === 'hot' ? '🔥 Hot' : t === 'featured' ? '★ Featured' : 'Latest'}
            </button>
          ))}
        </div>
      </div>
      {list}
    </main>
  );
}
