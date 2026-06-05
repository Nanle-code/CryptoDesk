import { useCallback, useEffect, useRef, useState } from 'react';
import { classifyTopSignals } from '../lib/aiSignals';
import { sosoFetch, unwrapData } from '../lib/api';
import { mockNews } from '../lib/mockNews';
import { buildSignals, sentimentPct } from '../lib/signals';

export function useNews(sosoKey, grokKey = '') {
  const [news, setNews] = useState([]);
  const [tab, setTab] = useState('latest');
  const [category, setCategory] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiClassifying, setAiClassifying] = useState(false);
  const [error, setError] = useState(null);
  const [signals, setSignals] = useState([]);
  const classifyGen = useRef(0);

  const runAiClassification = useCallback(async (list, lexiconSignals) => {
    if (!grokKey || !lexiconSignals.length) return;
    const gen = ++classifyGen.current;
    setAiClassifying(true);
    try {
      const merged = await classifyTopSignals(grokKey, list, lexiconSignals);
      if (classifyGen.current === gen) setSignals(merged);
    } catch (e) {
      console.warn('[useNews] AI classify:', e);
    } finally {
      if (classifyGen.current === gen) setAiClassifying(false);
    }
  }, [grokKey]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    classifyGen.current += 1;
    setAiClassifying(false);
    try {
      if (!sosoKey) {
        const demo = mockNews();
        setNews(demo);
        const lexicon = buildSignals(demo);
        setSignals(lexicon);
        runAiClassification(demo, lexicon);
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
      const lexicon = buildSignals(list);
      setNews(list);
      setSignals(lexicon);
      runAiClassification(list, lexicon);
    } catch (e) {
      setError(e.message);
      setNews([]);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  }, [sosoKey, tab, category, runAiClassification]);

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

  return {
    news,
    tab,
    setTab,
    category,
    setCategory,
    loading,
    aiClassifying,
    error,
    signals,
    setSignals,
    stats,
    counts,
    reload: load,
    reclassifySignals: () => runAiClassification(news, signals),
  };
}
