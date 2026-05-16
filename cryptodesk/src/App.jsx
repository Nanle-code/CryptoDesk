import { useCallback, useEffect, useState } from 'react';
import { GrokAPI } from './api/grok';
import { DEFAULT_SODEX_SYMBOL } from './api/sodex';
import Background from './components/Background';
import IntelligencePanel from './components/IntelligencePanel';
import MainWorkspace from './components/MainWorkspace';
import Masthead from './components/Masthead';
import Nav from './components/Nav';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import TrustBar from './components/TrustBar';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { useNews } from './hooks/useNews';
import { useTickers } from './hooks/useTickers';

function Terminal() {
  const { config, hasGrok, hasSoso, showToast } = useConfig();
  const { news, tab, setTab, category, setCategory, loading, error, signals, stats, counts, reload } = useNews(config.sosoKey);
  const tickers = useTickers(config.sosoKey);

  const [mainTab, setMainTab] = useState('news');
  const [sodexSymbol, setSodexSymbol] = useState(DEFAULT_SODEX_SYMBOL);
  const [panel, setPanel] = useState('default');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [briefingText, setBriefingText] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [articleAnalysis, setArticleAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const selectedArticle = selectedIndex != null ? news[selectedIndex] : null;

  const openSoDEX = useCallback((sym) => {
    setSodexSymbol(sym || DEFAULT_SODEX_SYMBOL);
    setMainTab('sodex');
    setPanel('sodex-hub');
  }, []);

  useEffect(() => {
    if (!hasSoso) {
      const t = setTimeout(() => showToast('Demo mode — connect SoSoValue API in settings', 5000), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [hasSoso, showToast]);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setPanel('article');
    setArticleAnalysis('');
  };

  const generateBriefing = useCallback(async () => {
    if (!news.length) await reload();
    setPanel('briefing');
    setBriefingLoading(true);
    setBriefingText('');
    try {
      if (!hasGrok) {
        setBriefingText('Add your Grok API key in settings to generate live AI market briefings from SoSoValue news.');
        return;
      }
      const grok = new GrokAPI(config.grokKey);
      const text = await grok.generateBriefing(news, config.topic);
      setBriefingText(text);
      showToast('Briefing generated');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
      setBriefingText('Briefing failed. Check your Grok API key.');
    } finally {
      setBriefingLoading(false);
    }
  }, [news, config, hasGrok, reload, showToast]);

  const analyzeArticle = useCallback(async () => {
    if (!selectedArticle || !hasGrok) return;
    setAnalysisLoading(true);
    try {
      const grok = new GrokAPI(config.grokKey);
      setArticleAnalysis(await grok.analyzeArticle(selectedArticle));
      showToast('Analysis complete');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setAnalysisLoading(false);
    }
  }, [selectedArticle, config.grokKey, hasGrok, showToast]);

  const enhanceSignals = useCallback(async () => {
    if (!hasGrok) return;
    const grok = new GrokAPI(config.grokKey);
    showToast('Enhancing top signals with Grok…');
    for (const sig of signals.slice(0, 3)) {
      const item = news[sig.index];
      if (!item) continue;
      try {
        const ai = await grok.scoreSignal(item);
        Object.assign(sig, ai);
      } catch { /* keep lexicon */ }
    }
    setPanel('signals');
    showToast('Signals enhanced');
  }, [signals, news, config.grokKey, hasGrok, showToast]);

  return (
    <div className="app-shell">
      <Background />
      <Masthead tickers={tickers} onBriefing={generateBriefing} briefingLoading={briefingLoading} />
      <TrustBar stats={stats} connected={hasSoso} />
      <div className="body-grid">
        <Nav
          category={category}
          counts={counts}
          onCategory={(c) => { setCategory(c); setPanel('default'); setMainTab('news'); }}
          panel={panel}
          onPanel={setPanel}
          onBriefing={generateBriefing}
          mainTab={mainTab}
          onMainTab={setMainTab}
        />
        <MainWorkspace
          mainTab={mainTab}
          onMainTab={setMainTab}
          sosoKey={config.sosoKey}
          sodexSymbol={sodexSymbol}
          onSodexSymbol={setSodexSymbol}
          news={news}
          tab={tab}
          category={category}
          loading={loading}
          error={error}
          onTab={(t) => { setTab(t); setPanel('default'); }}
          onBriefing={generateBriefing}
          briefingLoading={briefingLoading}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
        />
        <IntelligencePanel
          panel={panel}
          news={news}
          signals={signals}
          stats={stats}
          selectedArticle={selectedArticle}
          briefingText={briefingText}
          briefingLoading={briefingLoading}
          articleAnalysis={articleAnalysis}
          analysisLoading={analysisLoading}
          onAnalyzeArticle={analyzeArticle}
          onEnhanceSignals={enhanceSignals}
          onSelectArticle={handleSelect}
          onOpenSoDEX={openSoDEX}
        />
      </div>
      <SettingsModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <ConfigProvider>
      <Terminal />
    </ConfigProvider>
  );
}
