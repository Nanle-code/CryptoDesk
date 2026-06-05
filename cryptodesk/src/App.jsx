import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GrokAPI } from './api/grok';
import { createSoSoClient } from './api/sosovalue';
import { DEFAULT_SODEX_SYMBOL } from './api/sodex';
import { buildWatchlistIntel, loadWatchlist, saveWatchlist } from './lib/watchlist';
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
import { classifyTopSignals } from './lib/aiSignals';
import { enrichOpportunitiesWithGrok } from './lib/explainability';
import { buildExecutionContext } from './lib/executionPreview';
import { buildOpportunities, mergeOpportunityExplanations } from './lib/signals';
import { fetchSSIReference, mergeDesignedWithLive } from './lib/ssiIndex';
import { assetToSodexSymbol } from './lib/sodexSymbol';
import { appendToArchive, clearArchive, loadArchive } from './lib/signalArchive';
import { clearOrderAudit, loadOrderAudit } from './lib/sodexExecution';
import DemoWizard from './components/DemoWizard';

function Terminal() {
  const { config, hasGrok, hasSoso, showToast, setSettingsOpen } = useConfig();
  const {
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
    reload,
  } = useNews(config.sosoKey, config.grokKey);
  const tickers = useTickers(config.sosoKey);

  const [mainTab, setMainTab] = useState('news');
  const [sodexSymbol, setSodexSymbol] = useState(DEFAULT_SODEX_SYMBOL);
  const [executionContext, setExecutionContext] = useState(null);
  const [panel, setPanel] = useState('default');
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [briefingText, setBriefingText] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [articleAnalysis, setArticleAnalysis] = useState('');
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [opportunityInsights, setOpportunityInsights] = useState({});
  const [committeeReviews, setCommitteeReviews] = useState({});
  const [insightLoadingIndex, setInsightLoadingIndex] = useState(null);
  const [committeeLoadingIndex, setCommitteeLoadingIndex] = useState(null);
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotAnswer, setCopilotAnswer] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [watchlist, setWatchlist] = useState(loadWatchlist);
  const [narrativeData, setNarrativeData] = useState(null);
  const [narrativeLoading, setNarrativeLoading] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ capital: 1000, risk: 'Medium', goal: 'Growth' });
  const [portfolioResult, setPortfolioResult] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [ssiTheme, setSsiTheme] = useState('AI Index');
  const [ssiResult, setSsiResult] = useState(null);
  const [ssiSelectedTicker, setSsiSelectedTicker] = useState('');
  const [ssiLoading, setSsiLoading] = useState(false);
  const [strategyResults, setStrategyResults] = useState({});
  const [strategyLoadingIndex, setStrategyLoadingIndex] = useState(null);
  const [strategyActiveIndex, setStrategyActiveIndex] = useState(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [demoStepIndex, setDemoStepIndex] = useState(0);
  const [demoRunning, setDemoRunning] = useState(false);
  const [explainPatches, setExplainPatches] = useState({});
  const [explainingOpps, setExplainingOpps] = useState(false);
  const [signalArchive, setSignalArchive] = useState(loadArchive);
  const [orderAuditVersion, setOrderAuditVersion] = useState(0);
  const orderAudit = useMemo(() => loadOrderAudit(), [orderAuditVersion]);
  const explainGen = useRef(0);

  const baseOpportunities = useMemo(
    () => buildOpportunities(signals, news),
    [signals, news]
  );
  const opportunities = useMemo(
    () => mergeOpportunityExplanations(baseOpportunities, explainPatches),
    [baseOpportunities, explainPatches]
  );

  const watchlistIntel = useMemo(
    () => buildWatchlistIntel(watchlist, signals, opportunities, news, narrativeData),
    [watchlist, signals, opportunities, news, narrativeData]
  );
  const watchlistAlerts = watchlistIntel.alerts;
  const prevAlertCount = useRef(0);

  const selectedArticle = selectedIndex != null ? news[selectedIndex] : null;

  const openSoDEX = useCallback((sym, opportunity = null) => {
    const pair = sym || DEFAULT_SODEX_SYMBOL;
    setSodexSymbol(pair);
    if (opportunity) {
      setExecutionContext(
        buildExecutionContext(opportunity, pair, committeeReviews, opportunityInsights)
      );
      showToast(`Execution preview: ${opportunity.recommendation || 'Review'} ${opportunity.asset} on SoDEX`);
    } else {
      setExecutionContext(null);
    }
    setMainTab('sodex');
    setPanel('sodex-hub');
  }, [committeeReviews, opportunityInsights, showToast]);

  useEffect(() => {
    if (!hasGrok || !baseOpportunities.length || aiClassifying) return undefined;

    const gen = ++explainGen.current;
    setExplainingOpps(true);
    enrichOpportunitiesWithGrok(config.grokKey, news, baseOpportunities)
      .then((patches) => {
        if (explainGen.current === gen) setExplainPatches(patches);
      })
      .catch(() => {
        if (explainGen.current === gen) setExplainPatches({});
      })
      .finally(() => {
        if (explainGen.current === gen) setExplainingOpps(false);
      });

    return () => {
      explainGen.current += 1;
    };
  }, [baseOpportunities, news, config.grokKey, hasGrok, aiClassifying]);

  useEffect(() => {
    if (aiClassifying || !signals.length) return;
    setSignalArchive((prev) => {
      const next = appendToArchive(prev, signals, opportunities);
      return next.length === prev.length && next[0]?.id === prev[0]?.id ? prev : next;
    });
  }, [signals, opportunities, aiClassifying]);

  const handleClearArchive = useCallback(() => {
    setSignalArchive(clearArchive());
    showToast('Signal archive cleared');
  }, [showToast]);

  const refreshOrderAudit = useCallback(() => {
    setOrderAuditVersion((v) => v + 1);
  }, []);

  const handleClearOrderAudit = useCallback(() => {
    clearOrderAudit();
    setOrderAuditVersion((v) => v + 1);
    showToast('Order audit cleared');
  }, [showToast]);

  useEffect(() => {
    if (!hasSoso) {
      const t = setTimeout(() => showToast('Demo mode — connect SoSoValue API in settings', 5000), 1500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [hasSoso, showToast]);

  useEffect(() => {
    const high = watchlistAlerts.filter((a) => a.severity === 'high').length;
    if (high > prevAlertCount.current && panel !== 'watchlist') {
      const top = watchlistAlerts.find((a) => a.severity === 'high');
      if (top) showToast(`Watchlist: ${top.message}`, 4500);
    }
    prevAlertCount.current = high;
  }, [watchlistAlerts, panel, showToast]);

  const updateWatchlist = useCallback((tokens) => {
    setWatchlist(saveWatchlist(tokens));
  }, []);

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
    showToast('Re-classifying top signals with Grok…');
    setPanel('signals');
    try {
      const merged = await classifyTopSignals(config.grokKey, news, signals);
      setSignals(merged);
      showToast('AI signals updated');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    }
  }, [signals, news, config.grokKey, hasGrok, setSignals, showToast]);

  const explainOpportunity = useCallback(async (opportunity) => {
    if (!hasGrok || opportunity?.sourceIndex == null) return;
    const item = news[opportunity.sourceIndex];
    if (!item) return;
    const grok = new GrokAPI(config.grokKey);
    setInsightLoadingIndex(opportunity.sourceIndex);
    try {
      const insight = await grok.assessOpportunity(item, opportunity.recommendation, opportunity.reason);
      const nextInsights = { ...opportunityInsights, [opportunity.sourceIndex]: insight };
      setOpportunityInsights(nextInsights);
      if (executionContext?.sourceIndex === opportunity.sourceIndex) {
        setExecutionContext(
          buildExecutionContext(
            opportunity,
            executionContext.symbol,
            committeeReviews,
            nextInsights
          )
        );
      }
      showToast('Risk assessment complete');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setInsightLoadingIndex(null);
    }
  }, [news, config.grokKey, hasGrok, showToast, executionContext, committeeReviews, opportunityInsights]);

  const runCommitteeReview = useCallback(async (opportunity) => {
    if (!hasGrok || opportunity?.sourceIndex == null) return;
    const item = news[opportunity.sourceIndex];
    if (!item) return;
    const grok = new GrokAPI(config.grokKey);
    setCommitteeLoadingIndex(opportunity.sourceIndex);
    try {
      const review = await grok.runInvestmentCommittee(item, opportunity);
      const nextReviews = { ...committeeReviews, [opportunity.sourceIndex]: review };
      setCommitteeReviews(nextReviews);
      if (executionContext?.sourceIndex === opportunity.sourceIndex) {
        setExecutionContext(
          buildExecutionContext(
            opportunity,
            executionContext.symbol,
            nextReviews,
            opportunityInsights
          )
        );
      }
      showToast('Investment committee review ready');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setCommitteeLoadingIndex(null);
    }
  }, [news, config.grokKey, hasGrok, showToast, executionContext, committeeReviews, opportunityInsights]);

  const askCopilot = useCallback(async (query) => {
    const q = (query || '').trim();
    if (!q) return;
    if (!hasGrok) {
      showToast('Add Grok API key in Settings');
      return;
    }
    setPanel('copilot');
    setCopilotQuery(q);
    setCopilotLoading(true);
    setCopilotAnswer('');
    try {
      const grok = new GrokAPI(config.grokKey);
      setCopilotAnswer(await grok.researchCopilot(news, q));
      showToast('Research answer ready');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
      setCopilotAnswer('Research query failed. Check your Grok API key.');
    } finally {
      setCopilotLoading(false);
    }
  }, [news, config.grokKey, hasGrok, showToast]);

  const runNarrativeScan = useCallback(async () => {
    if (!hasGrok) {
      showToast('Add Grok API key in Settings');
      return;
    }
    setPanel('narratives');
    setNarrativeLoading(true);
    try {
      let sectorContext = '';
      let indicesContext = '';
      if (hasSoso) {
        const soso = createSoSoClient(config.sosoKey);
        try {
          const raw = await soso.getSectorSpotlight();
          const sectors = [...(raw?.sector || []), ...(raw?.spotlight || [])];
          sectorContext = sectors.map((s) => `${s.name}: ${s['24h_change_pct']}%`).join(', ');
        } catch { /* optional */ }
        try {
          const list = await soso.getIndices();
          const arr = Array.isArray(list) ? list : list?.list || [];
          indicesContext = arr.slice(0, 8).map((i) => i.ticker || i.name).join(', ');
        } catch { /* optional */ }
      }
      const grok = new GrokAPI(config.grokKey);
      setNarrativeData(await grok.detectNarrativeRotation(news, sectorContext, indicesContext));
      showToast('Narrative rotation scan complete');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setNarrativeLoading(false);
    }
  }, [news, config.sosoKey, hasGrok, hasSoso, showToast]);

  const generatePortfolio = useCallback(async () => {
    if (!hasGrok) {
      showToast('Add Grok API key in Settings');
      return;
    }
    setPanel('portfolio');
    setPortfolioLoading(true);
    try {
      const grok = new GrokAPI(config.grokKey);
      setPortfolioResult(await grok.buildPortfolio(news, portfolioForm));
      showToast('Portfolio generated');
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setPortfolioLoading(false);
    }
  }, [news, config.grokKey, hasGrok, portfolioForm, showToast]);

  const buildSSIIndex = useCallback(async (selectedTicker = null) => {
    if (!hasGrok) {
      showToast('Add Grok API key in Settings');
      return;
    }
    setPanel('ssi-index');
    setSsiLoading(true);
    try {
      let reference = { matchedIndex: null, constituents: [], indices: [], endpoints: [] };
      if (hasSoso) {
        reference = await fetchSSIReference(
          config.sosoKey,
          ssiTheme,
          selectedTicker || ssiSelectedTicker || null
        );
        if (reference.matchedIndex?.ticker) {
          setSsiSelectedTicker(reference.matchedIndex.ticker);
        }
      }
      const grok = new GrokAPI(config.grokKey);
      const designed = await grok.buildSSIIndex(news, ssiTheme, reference);
      setSsiResult(mergeDesignedWithLive(designed, reference));
      showToast(
        reference.matchedIndex
          ? `${ssiTheme} built · aligned with ${reference.matchedIndex.ticker}`
          : `${ssiTheme} index built`
      );
    } catch (e) {
      showToast(`SSI index error: ${e.message}`);
    } finally {
      setSsiLoading(false);
    }
  }, [news, config.sosoKey, ssiTheme, ssiSelectedTicker, hasGrok, hasSoso, showToast]);

  const generateStrategy = useCallback(async (opportunity) => {
    const opp = opportunity || opportunities[0];
    if (!opp || opp.sourceIndex == null) {
      showToast('No opportunity available for strategy');
      return;
    }
    if (!hasGrok) {
      showToast('Add Grok API key in Settings');
      return;
    }
    const item = news[opp.sourceIndex];
    if (!item) return;
    setPanel('strategy');
    setStrategyActiveIndex(opp.sourceIndex);
    setStrategyLoadingIndex(opp.sourceIndex);
    try {
      const grok = new GrokAPI(config.grokKey);
      const playbook = await grok.generateStrategy(item, opp);
      setStrategyResults((prev) => ({
        ...prev,
        [opp.sourceIndex]: {
          ...playbook,
          source: { asset: opp.asset, recommendation: opp.recommendation, confidence: opp.confidence },
        },
      }));
      showToast(`Strategy: ${playbook.name || opp.asset}`);
    } catch (e) {
      showToast(`Grok error: ${e.message}`);
    } finally {
      setStrategyLoadingIndex(null);
    }
  }, [opportunities, news, config.grokKey, hasGrok, showToast]);

  const runDemoStep = useCallback(async (index) => {
    const step = DEMO_STEPS[index];
    if (!step) return;
    setDemoRunning(true);
    try {
      switch (step.action) {
        case 'openSettings':
          setSettingsOpen(true);
          break;
        case 'newsFeed':
          setMainTab('news');
          setCategory(0);
          setPanel('default');
          break;
        case 'signals':
          setPanel('signals');
          break;
        case 'opportunities':
          setPanel('opportunities');
          break;
        case 'committee': {
          setPanel('opportunities');
          const top = opportunities[0];
          if (top && hasGrok) await runCommitteeReview(top);
          else if (!hasGrok) showToast('Add Grok key for committee step');
          break;
        }
        case 'portfolio':
          setPanel('portfolio');
          if (hasGrok) await generatePortfolio();
          else showToast('Add Grok key for portfolio step');
          break;
        case 'execution': {
          const top = opportunities[0];
          if (top) openSoDEX(assetToSodexSymbol(top.asset), top);
          else showToast('No opportunity for execution preview');
          break;
        }
        case 'explainability':
          setPanel('opportunities');
          break;
        default:
          break;
      }
      showToast(`Demo step ${step.step}: ${step.title}`);
      if (index < DEMO_STEPS.length - 1) setDemoStepIndex(index + 1);
    } finally {
      setDemoRunning(false);
    }
  }, [
    opportunities,
    hasGrok,
    setSettingsOpen,
    runCommitteeReview,
    generatePortfolio,
    openSoDEX,
    showToast,
  ]);

  const startDemo = useCallback(() => {
    setDemoStepIndex(0);
    setDemoOpen(true);
    setPanel('workflow');
    showToast('Judge demo started — follow the wizard');
  }, [showToast]);

  return (
    <div className="app-shell">
      <Background />
      <Masthead tickers={tickers} onBriefing={generateBriefing} briefingLoading={briefingLoading} />
      <TrustBar stats={stats} connected={hasSoso} aiClassifying={aiClassifying} hasGrok={hasGrok} />
      <div className="body-grid">
        <Nav
          category={category}
          counts={counts}
          onCategory={(c) => { setCategory(c); setPanel('default'); setMainTab('news'); }}
          panel={panel}
          onPanel={setPanel}
          onBriefing={generateBriefing}
          onStartDemo={startDemo}
          demoOpen={demoOpen}
          mainTab={mainTab}
          onMainTab={setMainTab}
        />
        <MainWorkspace
          mainTab={mainTab}
          onMainTab={setMainTab}
          sosoKey={config.sosoKey}
          sodexKey={config.sodexKey}
          sodexSymbol={sodexSymbol}
          onSodexSymbol={setSodexSymbol}
          onOrderAuditUpdate={refreshOrderAudit}
          executionContext={executionContext}
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
          opportunities={opportunities}
          opportunityInsights={opportunityInsights}
          committeeReviews={committeeReviews}
          insightLoadingIndex={insightLoadingIndex}
          committeeLoadingIndex={committeeLoadingIndex}
          copilotQuery={copilotQuery}
          copilotAnswer={copilotAnswer}
          copilotLoading={copilotLoading}
          onCopilotQueryChange={setCopilotQuery}
          onAskCopilot={askCopilot}
          explainingOpps={explainingOpps}
          stats={stats}
          selectedArticle={selectedArticle}
          briefingText={briefingText}
          briefingLoading={briefingLoading}
          articleAnalysis={articleAnalysis}
          analysisLoading={analysisLoading}
          onAnalyzeArticle={analyzeArticle}
          onEnhanceSignals={enhanceSignals}
          onExplainOpportunity={explainOpportunity}
          onCommitteeReview={runCommitteeReview}
          watchlist={watchlist}
          watchlistAlerts={watchlistAlerts}
          watchlistTokenRows={watchlistIntel.tokens}
          onWatchlistChange={updateWatchlist}
          narrativeData={narrativeData}
          narrativeLoading={narrativeLoading}
          onNarrativeScan={runNarrativeScan}
          portfolioForm={portfolioForm}
          portfolioResult={portfolioResult}
          portfolioLoading={portfolioLoading}
          onPortfolioFormChange={setPortfolioForm}
          onGeneratePortfolio={generatePortfolio}
          ssiTheme={ssiTheme}
          ssiResult={ssiResult}
          ssiLoading={ssiLoading}
          ssiSelectedTicker={ssiSelectedTicker}
          onSsiSelectedTickerChange={setSsiSelectedTicker}
          onSsiThemeChange={setSsiTheme}
          onBuildSSIIndex={buildSSIIndex}
          sosoKey={config.sosoKey}
          strategyResults={strategyResults}
          strategyLoadingIndex={strategyLoadingIndex}
          strategyActiveIndex={strategyActiveIndex}
          onStrategyActiveIndexChange={setStrategyActiveIndex}
          onGenerateStrategy={generateStrategy}
          onSelectArticle={handleSelect}
          onOpenSoDEX={openSoDEX}
          signalArchive={signalArchive}
          onClearArchive={handleClearArchive}
          orderAudit={orderAudit}
          onClearOrderAudit={handleClearOrderAudit}
        />
      </div>
      <SettingsModal />
      <DemoWizard
        open={demoOpen}
        stepIndex={demoStepIndex}
        onClose={() => setDemoOpen(false)}
        onStepChange={setDemoStepIndex}
        onRunStep={runDemoStep}
        running={demoRunning}
      />
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
