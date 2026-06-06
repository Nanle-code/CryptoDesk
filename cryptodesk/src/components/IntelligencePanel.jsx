import { useEffect, useState } from 'react';
import { createSoSoClient } from '../api/sosovalue';
import { DEFAULT_SODEX_SYMBOL, sodexSpot } from '../api/sodex';
import { useConfig } from '../context/ConfigContext';
import { apiProof } from '../lib/api';
import { fmtPct, fmtUsd, sectorLabel, stripHtml, timeAgo } from '../lib/format';
import SignalList from './SignalList';
import OpportunityList from './OpportunityList';
import ResearchCopilot from './ResearchCopilot';
import NarrativePanel from './NarrativePanel';
import WatchlistPanel from './WatchlistPanel';
import PortfolioPanel from './PortfolioPanel';
import SSIIndexPanel from './SSIIndexPanel';
import StrategyPanel from './StrategyPanel';
import SignalArchivePanel from './SignalArchivePanel';
import OrderAuditPanel from './OrderAuditPanel';
import { assetToSodexSymbol } from '../lib/sodexSymbol';

function Block({ label, children, proof }) {
  return (
    <div className="intel-block">
      <div className="intel-block-label">{label}</div>
      <div className="intel-block-body">
        {children}
        {proof && <p className="api-proof">{proof}</p>}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="intel-block">
      <div className="intel-block-body">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skel" style={{ height: 11, marginBottom: 8, width: `${55 + i * 10}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function IntelligencePanel({
  panel,
  news,
  signals,
  opportunities,
  opportunityInsights,
  committeeReviews,
  insightLoadingIndex,
  committeeLoadingIndex,
  explainingOpps,
  copilotQuery,
  copilotAnswer,
  copilotLoading,
  onCopilotQueryChange,
  onAskCopilot,
  stats,
  selectedArticle,
  briefingText,
  briefingLoading,
  articleAnalysis,
  analysisLoading,
  onAnalyzeArticle,
  onEnhanceSignals,
  onExplainOpportunity,
  onCommitteeReview,
  watchlist,
  watchlistAlerts,
  watchlistTokenRows,
  onWatchlistChange,
  narrativeData,
  narrativeLoading,
  onNarrativeScan,
  portfolioForm,
  portfolioResult,
  portfolioLoading,
  onPortfolioFormChange,
  onGeneratePortfolio,
  ssiTheme,
  ssiResult,
  ssiLoading,
  ssiSelectedTicker,
  onSsiSelectedTickerChange,
  onSsiThemeChange,
  onBuildSSIIndex,
  sosoKey,
  strategyResults,
  strategyLoadingIndex,
  strategyActiveIndex,
  onStrategyActiveIndexChange,
  onGenerateStrategy,
  onSelectArticle,
  onOpenSoDEX,
  signalArchive,
  onClearArchive,
  orderAudit,
  onClearOrderAudit,
}) {
  const { config, hasSoso, hasGrok } = useConfig();
  const [asyncData, setAsyncData] = useState(null);
  const [asyncLoading, setAsyncLoading] = useState(false);
  const [asyncError, setAsyncError] = useState(null);

  useEffect(() => {
    if ([
      'default', 'article', 'briefing', 'signals', 'archive', 'opportunities', 'copilot',
      'narratives', 'watchlist', 'portfolio', 'ssi-index', 'strategy', 'workflow', 'roadmap', 'order-audit',
    ].includes(panel)) {
      setAsyncData(null);
      return;
    }

    const load = async () => {
      setAsyncLoading(true);
      setAsyncError(null);
      try {
        if (panel === 'sodex' || panel === 'sodex-hub') {
          const sym = DEFAULT_SODEX_SYMBOL;
          const [symbols, tickers, ob, trades] = await Promise.all([
            sodexSpot.symbols(true),
            sodexSpot.tickers(true),
            sodexSpot.orderbook(sym, 12, true),
            sodexSpot.trades(sym, 10, true),
          ]);
          setAsyncData({ type: 'sodex-full', sym, symbols, tickers, ob, trades });
          return;
        }

        if (!hasSoso) {
          setAsyncData({ type: 'need-soso' });
          return;
        }

        const soso = createSoSoClient(config.sosoKey);

        if (panel === 'macro') {
          const raw = await soso.getMacroEvents();
          const today = new Date().toISOString().slice(0, 10);
          setAsyncData({ type: 'macro', days: (Array.isArray(raw) ? raw : []).filter((d) => d.date >= today).slice(0, 14) });
        } else if (panel === 'sectors') {
          const raw = await soso.getSectorSpotlight();
          const sectors = [...(raw?.sector || []), ...(raw?.spotlight || []).map((s) => ({ ...s, spotlight: true }))];
          setAsyncData({ type: 'sectors', sectors });
        } else if (panel === 'etf') {
          const [btc, eth] = await Promise.all([
            soso.getETFSummaryHistory({ symbol: 'BTC', country_code: 'US', limit: 14 }),
            soso.getETFSummaryHistory({ symbol: 'ETH', country_code: 'US', limit: 7 }),
          ]);
          setAsyncData({ type: 'etf', btc: btc || [], eth: eth || [] });
        } else if (panel === 'indices') {
          const list = await soso.getIndices();
          const arr = Array.isArray(list) ? list : list?.list || [];
          let constituents = null;
          const first = arr[0];
          if (first?.ticker) {
            try {
              constituents = await soso.getIndexConstituents(first.ticker);
            } catch { /* optional */ }
          }
          setAsyncData({ type: 'indices', list: arr.slice(0, 10), constituents, indexTicker: first?.ticker });
        } else if (panel === 'treasuries') {
          const list = await soso.getBTCTreasuries({ limit: 15 });
          setAsyncData({ type: 'treasuries', list: Array.isArray(list) ? list : list?.list || [] });
        } else if (panel === 'fundraising') {
          const list = await soso.getFundraising({ limit: 12 });
          setAsyncData({ type: 'fundraising', list: Array.isArray(list) ? list : list?.list || [] });
        }
      } catch (e) {
        setAsyncError(e.message);
      } finally {
        setAsyncLoading(false);
      }
    };
    load();
  }, [panel, config.sosoKey, hasSoso]);

  const titles = {
    default: 'Intelligence',
    article: 'Article',
    briefing: 'Intelligence Briefing',
    signals: 'Signal Feed',
    archive: 'Signal Archive',
    opportunities: 'Opportunity Engine',
    copilot: 'Research Copilot',
    narratives: 'Narrative Rotation',
    watchlist: 'Watchlist Agent',
    portfolio: 'Portfolio Agent',
    'ssi-index': 'SSI Index Builder',
    strategy: 'Strategy Generator',
    macro: 'Macro Calendar',
    sectors: 'Sector Spotlight',
    etf: 'ETF Flow Monitor',
    indices: 'SoSo Indices',
    treasuries: 'BTC Treasuries',
    fundraising: 'Fundraising',
    sodex: 'SoDEX Orderbook',
    'sodex-hub': 'SoDEX Markets',
    'order-audit': 'Order Audit Log',
    workflow: 'Agent Workflow',
    roadmap: 'Product Roadmap',
  };

  const subs = {
    default: 'SoSoValue × Grok',
    macro: 'GET /macro/events',
    sectors: 'GET /currencies/sector-spotlight',
    etf: 'GET /etfs/summary-history',
    indices: 'GET /indices',
    sodex: 'SoDEX Spot testnet',
    treasuries: 'GET /btc-treasuries',
    fundraising: 'GET /fundraising/projects',
    signals: hasGrok ? 'Lexicon → Grok (auto top 5)' : 'Lexicon · add Grok for AI',
    archive: 'sessionStorage · cd_signal_archive',
    opportunities: 'Signals → Why/Risks → Committee → SoDEX',
    copilot: 'Grok · feed-aware research',
    narratives: 'Sector + headline rotation',
    watchlist: 'Sentiment · narratives · alerts',
    portfolio: 'Capital · risk · goal → allocation',
    'ssi-index': 'SoSo SSI · live constituents + Grok',
    strategy: 'Any opportunity → playbook',
    'order-audit': 'sessionStorage · cd_order_audit',
    workflow: 'SoSoValue → Grok → SoDEX',
  };

  let body;

  if (panel === 'article' && selectedArticle) {
    const plain = stripHtml(selectedArticle.content).slice(0, 800);
    const url = selectedArticle.source_link || selectedArticle.url || selectedArticle.link;
    body = (
      <>
        <Block label=" Article">
          <h3 className="report-title">{selectedArticle.title}</h3>
          <p className="report-byline">{selectedArticle.nick_name} · {timeAgo(selectedArticle.release_time)}</p>
          <p className="report-p">{plain}</p>
          {url?.startsWith('http') && (
            <a href={url} target="_blank" rel="noreferrer" className="source-link">Read source →</a>
          )}
        </Block>
        {hasGrok && (
          <button type="button" className="briefing-trigger full" disabled={analysisLoading} onClick={onAnalyzeArticle}>
            {analysisLoading ? 'Analyzing…' : ' Analyze with Grok'}
          </button>
        )}
        {articleAnalysis && (
          <Block label=" Grok analysis">
            <p className="report-p" style={{ whiteSpace: 'pre-wrap' }}>{articleAnalysis}</p>
          </Block>
        )}
      </>
    );
  } else if (panel === 'briefing') {
    body = briefingLoading ? (
      <Loading />
    ) : briefingText ? (
      <Block label=" Daily Intelligence">
        <p className="report-p" style={{ whiteSpace: 'pre-wrap' }}>{briefingText}</p>
        <SignalList signals={signals.slice(0, 3)} onSelect={onSelectArticle} />
      </Block>
    ) : (
      <p className="report-p">Add API keys and click Generate Briefing.</p>
    );
  } else if (panel === 'signals') {
    const topSignal = signals[0];
    body = (
      <>
        <Block label=" Agentic signals">
          <p className="report-p dim">
            {hasGrok
              ? 'Feed loads lexicon signals, then Grok auto-classifies the top 5 (sentiment, confidence, assets, horizon).'
              : 'Keyword signals only — add Grok in Settings for AI classification on load.'}
          </p>
          <SignalList signals={signals} onSelect={onSelectArticle} />
        </Block>
        {topSignal && (
          <Block label=" Top opportunity">
            <div className="opportunity-grid">
              <div>
                <span>Asset</span>
                <strong>{topSignal.affected_assets?.length ? topSignal.affected_assets.join(', ') : topSignal.asset}</strong>
              </div>
              <div>
                <span>Action</span>
                <strong>{topSignal.recommendation || (topSignal.sentiment === 'bullish' ? 'Buy' : topSignal.sentiment === 'bearish' ? 'Sell' : 'Hold')}</strong>
              </div>
              <div>
                <span>Confidence</span>
                <strong>{topSignal.confidence ? `${topSignal.confidence}%` : `${topSignal.strength * 20}%`}</strong>
              </div>
              <div>
                <span>Horizon</span>
                <strong>{topSignal.time_horizon ? `${topSignal.time_horizon.charAt(0).toUpperCase() + topSignal.time_horizon.slice(1)}` : 'Medium'}</strong>
              </div>
            </div>
            <p className="report-p">{topSignal.reason}</p>
          </Block>
        )}
        {hasGrok && (
          <button type="button" className="briefing-trigger full" onClick={onEnhanceSignals}>
             Re-classify top 5 signals
          </button>
        )}
        {onOpenSoDEX && (opportunities?.[0] || signals[0]) && (
          <button
            type="button"
            className="btn-ghost full"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => {
              const opp = opportunities?.[0];
              const sym = assetToSodexSymbol(opp?.asset || signals[0]?.asset);
              onOpenSoDEX(sym, opp || null);
            }}
          >
            ◎ Execution preview on SoDEX
          </button>
        )}
      </>
    );
  } else if (panel === 'archive') {
    body = (
      <Block label=" Session signal archive">
        <SignalArchivePanel
          archive={signalArchive}
          onClear={onClearArchive}
          onSelectEntry={onSelectArticle}
        />
      </Block>
    );
  } else if (panel === 'order-audit') {
    body = (
      <Block label=" Order audit log">
        <OrderAuditPanel
          audit={orderAudit}
          onClear={onClearOrderAudit}
          onOpenSoDEX={(sym) => onOpenSoDEX?.(sym, null)}
        />
      </Block>
    );
  } else if (panel === 'opportunities') {
    body = (
      <>
        <Block label=" Opportunity discovery">
          <p className="report-p dim">
            Every opportunity includes auto Why? and Risks bullets. With Grok, the top 3 are AI-enriched after classification.
          </p>
          {opportunities?.length ? (
            <OpportunityList
              opportunities={opportunities}
              insights={opportunityInsights}
              committeeReviews={committeeReviews}
              insightLoadingIndex={insightLoadingIndex}
              committeeLoadingIndex={committeeLoadingIndex}
              explainingOpps={explainingOpps}
              hasGrok={hasGrok}
              onSelect={onSelectArticle}
              onExplain={onExplainOpportunity}
              onCommittee={onCommitteeReview}
              onOpenSoDEX={onOpenSoDEX}
              strategyResults={strategyResults}
              strategyLoadingIndex={strategyLoadingIndex}
              onGenerateStrategy={onGenerateStrategy}
            />
          ) : (
            <p className="report-p dim">No strong opportunities detected yet. Refresh the news feed or connect SoSoValue.</p>
          )}
        </Block>
        {hasGrok && opportunities?.[0] && (
          <button type="button" className="briefing-trigger full" onClick={() => onCommitteeReview?.(opportunities[0])}>
             Run investment committee on top opportunity
          </button>
        )}
      </>
    );
  } else if (panel === 'copilot') {
    body = (
      <Block label=" Research copilot">
        <ResearchCopilot
          hasGrok={hasGrok}
          query={copilotQuery}
          onQueryChange={onCopilotQueryChange}
          answer={copilotAnswer}
          loading={copilotLoading}
          onAsk={onAskCopilot}
        />
      </Block>
    );
  } else if (panel === 'narratives') {
    body = (
      <Block label="↻ Narrative rotation">
        <NarrativePanel
          data={narrativeData}
          loading={narrativeLoading}
          hasGrok={hasGrok}
          onScan={onNarrativeScan}
        />
      </Block>
    );
  } else if (panel === 'watchlist') {
    body = (
      <Block label=" Watchlist agent">
        <WatchlistPanel
          tokens={watchlist}
          tokenRows={watchlistTokenRows}
          alerts={watchlistAlerts}
          narrativeData={narrativeData}
          onChange={onWatchlistChange}
          onScanNarratives={onNarrativeScan}
          narrativeLoading={narrativeLoading}
          hasGrok={hasGrok}
        />
      </Block>
    );
  } else if (panel === 'portfolio') {
    body = (
      <Block label=" Portfolio intelligence">
        <PortfolioPanel
          form={portfolioForm}
          onFormChange={onPortfolioFormChange}
          result={portfolioResult}
          loading={portfolioLoading}
          hasGrok={hasGrok}
          onGenerate={onGeneratePortfolio}
        />
      </Block>
    );
  } else if (panel === 'ssi-index') {
    body = (
      <Block label="◆ SSI index builder">
        <SSIIndexPanel
          theme={ssiTheme}
          onThemeChange={onSsiThemeChange}
          result={ssiResult}
          loading={ssiLoading}
          hasGrok={hasGrok}
          hasSoso={hasSoso}
          sosoKey={sosoKey}
          selectedTicker={ssiSelectedTicker}
          onSelectedTickerChange={onSsiSelectedTickerChange}
          onBuild={onBuildSSIIndex}
        />
      </Block>
    );
  } else if (panel === 'strategy') {
    body = (
      <Block label=" Strategy generator">
        <StrategyPanel
          opportunities={opportunities}
          activeSourceIndex={strategyActiveIndex}
          onSelectOpportunity={onStrategyActiveIndexChange}
          results={strategyResults}
          loadingIndex={strategyLoadingIndex}
          hasGrok={hasGrok}
          onGenerate={onGenerateStrategy}
        />
      </Block>
    );
  } else if (panel === 'workflow') {
    body = (
      <Block label="SoSoValue → SoDEX agent loop">
        <div className="workflow-steps vertical">
          <div className="wf-step done"><strong>SoSoValue</strong> — news, macro, sectors, ETF, indices, treasuries, fundraising</div>
          <div className="wf-step done"><strong>ANALYZE</strong> — Grok classify + research copilot</div>
          <div className="wf-step done"><strong>SIGNAL</strong> — lexicon + AI confidence scoring ·  archive</div>
          <div className="wf-step done"><strong>OPPORTUNITY</strong> — discovery, risk assess, investment committee</div>
          <div className="wf-step done"><strong>AGENTS</strong> — narratives, watchlist, portfolio, SSI index, strategy</div>
          <div className="wf-step done"><strong>SoDEX</strong> — klines + execution preview from opportunity card</div>
          <div className="wf-step done"><strong>EXECUTE</strong> — EIP-712 scaffold ·  order audit log</div>
        </div>
        <p className="report-p dim">12+ SoSoValue + 4 SoDEX endpoints ·  <strong>Judge demo</strong> wizard in left nav</p>
      </Block>
    );
  } else if (panel === 'roadmap') {
    body = (
      <Block label="Buildathon roadmap">
        <p className="report-p"><strong>Wave 1</strong> — News + Grok briefings</p>
        <p className="report-p"><strong>Wave 2</strong> — Signals, ETF, macro, sectors, indices, SoDEX preview</p>
        <p className="report-p"><strong>Wave 3</strong> — Full agent stack: opportunities, committee, copilot, narratives, watchlist, portfolio, SSI index, strategy</p>
      </Block>
    );
  } else if (!hasSoso) {
    body = (
      <div className="intel-empty">
        <div className="intel-empty-glyph"></div>
        <p>Configure SoSoValue API in Settings.</p>
        <p className="dim">Demo mode uses sample news.</p>
      </div>
    );
  } else if (asyncLoading) {
    body = <Loading />;
  } else if (asyncError) {
    body = <p className="report-p error">{asyncError}</p>;
  } else if (asyncData?.type === 'macro') {
    body = (
      <Block label="⊡ Upcoming events" proof={apiProof('GET /macro/events')}>
        {asyncData.days.map((day) => (
          <div key={day.date} className="macro-day">
            <div className="macro-day-date">{day.date}</div>
            {(day.events || []).map((ev) => (
              <div key={ev} className="macro-item">
                <div className="macro-impact-bar impact-high" />
                <div className="macro-name">{ev}</div>
              </div>
            ))}
          </div>
        ))}
      </Block>
    );
  } else if (asyncData?.type === 'sectors') {
    const max = Math.max(...asyncData.sectors.map((s) => Math.abs(parseFloat(s['24h_change_pct']) || 0)), 0.0001);
    body = (
      <Block label="◈ Sectors & spotlight" proof={apiProof('GET /currencies/sector-spotlight')}>
        {asyncData.sectors.map((s) => {
          const chg = parseFloat(s['24h_change_pct']) || 0;
          const up = chg >= 0;
          return (
            <div key={s.name + (s.spotlight ? 's' : '')} className="sector-item">
              <span className="sector-name">{sectorLabel(s.name)}{s.spotlight ? ' ' : ''}</span>
              <span className="sector-bar-wrap">
                <span className="sector-bar" style={{ width: `${Math.round((Math.abs(chg) / max) * 100)}%`, background: up ? 'var(--bull)' : 'var(--bear)' }} />
              </span>
              <span className="sector-chg" style={{ color: up ? 'var(--bull)' : 'var(--bear)' }}>{fmtPct(chg)}</span>
            </div>
          );
        })}
      </Block>
    );
  } else if (asyncData?.type === 'etf') {
    const latest = asyncData.btc?.[0];
    body = (
      <>
        <Block label="₿ BTC ETF" proof={apiProof('GET /etfs/summary-history?symbol=BTC')}>
          {latest && (
            <div className="etf-hero">
              <div className="etf-hero-val" style={{ color: parseFloat(latest.total_net_inflow) >= 0 ? 'var(--bull)' : 'var(--bear)' }}>
                {fmtUsd(latest.total_net_inflow)} · {latest.date}
              </div>
            </div>
          )}
          {asyncData.btc?.slice(0, 8).map((r) => (
            <div key={r.date} className="etf-row">
              <span>{r.date}</span>
              <span>{fmtUsd(r.total_net_inflow)}</span>
            </div>
          ))}
        </Block>
        <Block label="Ξ ETH ETF" proof={apiProof('symbol=ETH')}>
          {asyncData.eth?.slice(0, 6).map((r) => (
            <div key={r.date} className="etf-row">
              <span>{r.date}</span>
              <span>{fmtUsd(r.total_net_inflow)}</span>
            </div>
          ))}
        </Block>
      </>
    );
  } else if (asyncData?.type === 'indices') {
    body = (
      <Block label="SSI indices" proof={apiProof('GET /indices')}>
        {asyncData.list.map((idx, i) => (
          <div key={i} className="index-row">
            <span className="index-ticker">{idx.ticker || idx.symbol || '—'}</span>
            <span className="index-name">{idx.name || idx.full_name || ''}</span>
          </div>
        ))}
      </Block>
    );
  } else if (asyncData?.type === 'treasuries') {
    body = (
      <Block label="BTC treasuries" proof={apiProof('GET /btc-treasuries')}>
        {asyncData.list.slice(0, 12).map((t, i) => (
          <div key={i} className="index-row">
            <span className="index-ticker">{t.ticker || t.name}</span>
            <span>{t.btc_holdings ?? t.holdings ?? '—'}</span>
          </div>
        ))}
      </Block>
    );
  } else if (asyncData?.type === 'fundraising') {
    body = (
      <Block label="Fundraising" proof={apiProof('GET /fundraising/projects')}>
        {asyncData.list.slice(0, 10).map((p, i) => (
          <div key={i} className="index-row">
            <span>{(p.name || p.project_name || '').slice(0, 22)}</span>
            <span>{p.amount ? fmtUsd(p.amount) : p.round ?? '—'}</span>
          </div>
        ))}
      </Block>
    );
  } else if (asyncData?.type === 'need-soso') {
    body = <p className="report-p">Connect SoSoValue API key in Settings.</p>;
  } else if (asyncData?.type === 'sodex-full') {
    const ob = asyncData.ob;
    body = (
      <>
        <Block label={`SoDEX ${asyncData.sym}`} proof={apiProof('testnet-gw.sodex.dev spot')}>
          <p className="report-p dim">{asyncData.symbols?.length || 0} symbols</p>
          {(ob?.bids || ob?.b || []).slice(0, 4).map((row, i) => (
            <div key={`b${i}`} className="etf-row"><span className="up">bid</span><span>{row[0] ?? row.price}</span></div>
          ))}
          {(ob?.asks || ob?.a || []).slice(0, 4).map((row, i) => (
            <div key={`a${i}`} className="etf-row"><span className="down">ask</span><span>{row[0] ?? row.price}</span></div>
          ))}
        </Block>
        {onOpenSoDEX && (
          <button type="button" className="btn-primary full" onClick={() => onOpenSoDEX(asyncData.sym)}>
            Open SoDEX terminal →
          </button>
        )}
      </>
    );
  } else {
    body = (
      <div className="intel-empty">
        <div className="intel-empty-glyph"></div>
        <p>Select a tool from the left, or click a headline.</p>
        {!hasSoso && <p className="dim">Demo mode active.</p>}
      </div>
    );
  }

  return (
    <aside className="col-intel">
      <div className="intel-header">
        <span className="intel-title">{titles[panel] || 'Intelligence'}</span>
        <span className="intel-sub">{subs[panel] || 'SoSoValue × Grok'}</span>
      </div>
      <div className="stats-strip">
        <div className="stat-cell"><div className="stat-val">{stats.articles || '—'}</div><div className="stat-label">Articles</div></div>
        <div className="stat-cell"><div className="stat-val">{stats.signals || '—'}</div><div className="stat-label">Signals</div></div>
        <div className="stat-cell">
          <div className="stat-val" style={{ color: stats.sentiment > 55 ? 'var(--bull)' : stats.sentiment < 40 ? 'var(--bear)' : 'var(--amber)' }}>
            {stats.articles ? `${stats.sentiment}%` : '—'}
          </div>
          <div className="stat-label">Sentiment</div>
        </div>
      </div>
      <div className="intel-body">{body}</div>
      <div className="intel-footer">
        <a href="https://sosovalue.com" target="_blank" rel="noreferrer">SoSoValue</a>
        <span>×</span>
        <a href="https://x.ai" target="_blank" rel="noreferrer">Grok</a>
        <span className="wave-tag">Wave 3 · React</span>
      </div>
    </aside>
  );
}
