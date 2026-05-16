import { useCallback, useEffect, useState } from 'react';
import { sosoFetch, unwrapData } from '../lib/api';
import { mockNews } from '../lib/mockNews';
import { buildSignals, sentimentPct } from '../lib/signals';

export function useNews(sosoKey) {
  const [news, setNews] = useState([]);
  const [tab, setTab] = useState('latest');
  const [category, setCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signals, setSignals] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!sosoKey) {
        const demo = mockNews();
        setNews(demo);
        setSignals(buildSignals(demo));
        return;
      }
      let path = '/news';
      const params = { page_size: 30 };
      if (tab === 'hot') path = '/news/hot';
      if (tab === 'featured') path = '/news/featured';
      if (category > 0 && tab === 'latest') params.category = category;

      const data = await sosoFetch(sosoKey, path, params);
      const items = unwrapData(data)?.list || unwrapData(data) || [];
      const list = Array.isArray(items) ? items : [];
      setNews(list);
      setSignals(buildSignals(list));
    } catch (e) {
      setError(e.message);
      setNews([]);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [sosoKey, tab, category]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!sosoKey) return undefined;
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [sosoKey, load]);

  const stats = {
    articles: news.length,
    signals: signals.length,
    sentiment: sentimentPct(news),
  };

  const counts = {
    0: news.length,
    1: news.filter((n) => n.category === 1).length,
    2: news.filter((n) => n.category === 2).length,
    3: news.filter((n) => n.category === 3).length,
    4: news.filter((n) => n.category === 4).length,
  };

  return { news, tab, setTab, category, setCategory, loading, error, signals, stats, counts, reload: load };
}
