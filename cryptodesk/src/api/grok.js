import { parseGrokJson } from '../lib/parseGrokJson';
import { formatReferenceForGrok } from '../lib/ssiIndex';
import { ensureString } from '../lib/format';

const GROK_BASE = 'https://api.x.ai/v1/chat/completions';

function feedHeadlines(newsItems, limit = 18, contentLen = 120) {
  return (newsItems || []).slice(0, limit).map((n) => {
    const title = ensureString(n.title);
    const plain = ensureString(n.content).replace(/<[^>]+>/g, ' ').slice(0, contentLen);
    return `• ${title}${plain ? ' — ' + plain : ''}`;
  }).join('\n');
}

export class GrokAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.modelId = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('cd_grok_model') || 'grok-4.3' : 'grok-4.3';
  }

  async complete(systemPrompt, userPrompt, maxTokens = 1000) {
    if (!this.apiKey) throw new Error('Grok API key missing');
    if (!systemPrompt || !userPrompt) throw new Error('Grok prompt cannot be empty');

    const res = await fetch(GROK_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelId,
        max_tokens: maxTokens,
        temperature: 0,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      let msg = `Grok API ${res.status}`;
      try {
        const rawBody = await res.text();
        msg += `: ${rawBody.slice(0, 200)}`; // add raw text up to 200 chars
        try {
          const err = JSON.parse(rawBody);
          if (err?.error?.message) msg = `Grok: ${err.error.message}`;
          else if (err?.message) msg = `Grok: ${err.message}`;
        } catch {
          // keep the raw text appended
        }
      } catch {
        // fallback
      }
      throw new Error(msg);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateBriefing(newsItems, focusTopic = '') {
    const system = `You are CryptoDesk, an on-chain finance analyst powered by SoSoValue data. Write institutional-grade briefings. No filler.`;
    const headlines = newsItems.slice(0, 20).map((n) => {
      const title = ensureString(n.title);
      const plain = ensureString(n.content).replace(/<[^>]+>/g, ' ').slice(0, 150);
      return `• ${title}${plain ? ' — ' + plain : ''}`;
    }).join('\n');
    const user = `Feed (${newsItems.length} articles):\n${headlines}\n${focusTopic ? `Focus: ${focusTopic}` : ''}\n\nSections: EXECUTIVE SUMMARY, MARKET SIGNALS, SECTOR SPOTLIGHT, RISK WATCH, 24H CALL. Max 300 words.`;
    return this.complete(system, user, 1000);
  }

  async classifySignal(newsItem) {
    const title = ensureString(newsItem.title);
    const content = ensureString(newsItem.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const system = `You are CryptoDesk, an institutional-grade crypto signal classifier. Return only a JSON object with no extra text.`;
    const user = `Analyze this news item and return ONLY a JSON object with these keys:\n{\n  "sentiment": "bullish|bearish|neutral",\n  "confidence": 0-100,\n  "affected_assets": ["ETH","BTC"],\n  "impact": "high|medium|low",\n  "time_horizon": "short|medium|long",\n  "recommendation": "Buy|Sell|Hold",\n  "risk": "Low|Medium|High",\n  "reason": "One concise sentence explaining the signal."\n}\nTitle: ${newsItem.title}\nContent: ${content}`;
    const raw = await this.complete(system, user, 250);
    return parseGrokJson(raw, {
        sentiment: 'neutral',
        confidence: 55,
        affected_assets: [newsItem.matched_currencies?.[0]?.name || 'MARKET'],
        impact: 'medium',
        time_horizon: 'medium',
        recommendation: 'Hold',
        risk: 'Medium',
        reason: raw.slice(0, 120),
      });
  }

  async assessOpportunity(newsItem, recommendation = 'Hold', reason = '') {
    const title = ensureString(newsItem.title);
    const content = ensureString(newsItem.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const system = `You are CryptoDesk, a risk assessment agent. Return only a JSON object with no extra text.`;
    const user = `Assess the risk of this crypto opportunity and return ONLY a JSON object with these keys:\n{\n  "risk": "Low|Medium|High",\n  "risk_drivers": ["...", "..."],\n  "conviction": 0-100,\n  "explanation": "One concise sentence.",\n  "mitigation": "One sentence risk control advice.\n"}\nTitle: ${newsItem.title}\nContent: ${content}\nRecommendation: ${recommendation}\nReason: ${reason}`;
    const raw = await this.complete(system, user, 250);
    return parseGrokJson(raw, {
        risk: 'Medium',
        risk_drivers: ['Market volatility', 'Macro uncertainty'],
        conviction: 60,
        explanation: raw.slice(0, 120),
        mitigation: 'Use position sizing and watch macro catalysts.',
      });
  }

  async scoreSignal(newsItem) {
    const user = `Return ONLY JSON for: Title: ${newsItem.title}\nContent: ${(newsItem.content || '').replace(/<[^>]+>/g, ' ').slice(0, 300)}\n{\"sentiment\":\"bullish|bearish|neutral\",\"strength\":1-5,\"asset\":\"ticker\",\"reason\":\"one sentence\"}`;
    const raw = await this.complete('JSON only.', user, 150);
    return parseGrokJson(raw, { sentiment: 'neutral', strength: 1, asset: 'MARKET', reason: raw.slice(0, 80) });
  }

  async analyzeArticle(item) {
    const plain = (item.content || '').replace(/<[^>]+>/g, ' ').slice(0, 500);
    return this.complete(
      'Crypto analyst. Be direct.',
      `Title: ${item.title}\n${plain}\n\nSENTIMENT (1-5), KEY INSIGHT, AFFECTED ASSETS, TRADE IMPLICATION. Max 120 words.`,
      300
    );
  }

  async runInvestmentCommittee(newsItem, opportunity = {}) {
    const content = (newsItem.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const system = `You are CryptoDesk's AI investment committee. Return only a JSON object with no extra text.`;
    const user = `Review this opportunity and return ONLY a JSON object:\n{\n  "analyst": "One sentence analyst view",\n  "risk_agent": "One sentence risk view",\n  "macro_agent": "One sentence macro view",\n  "execution_agent": "One sentence execution view (SoDEX readiness)",\n  "final_recommendation": "Buy|Sell|Hold",\n  "confidence": 0-100,\n  "risk": "Low|Medium|High",\n  "allocation_pct": 5-25,\n  "slippage_estimate": "e.g. 0.12%",\n  "why": ["reason 1", "reason 2", "reason 3"]\n}\nTitle: ${newsItem.title}\nContent: ${content}\nAsset: ${opportunity.asset}\nRecommendation: ${opportunity.recommendation}\nConfidence: ${opportunity.confidence}%\nReason: ${opportunity.reason}`;
    const raw = await this.complete(system, user, 400);
    return parseGrokJson(raw, {
        analyst: 'Bullish bias from headline flow',
        risk_agent: 'Medium — verify macro calendar',
        macro_agent: 'Risk-on if BTC holds support',
        execution_agent: 'Preview route on SoDEX testnet',
        final_recommendation: opportunity.recommendation || 'Hold',
        confidence: opportunity.confidence || 65,
        risk: opportunity.risk || 'Medium',
        allocation_pct: 15,
        slippage_estimate: '0.15%',
        why: [opportunity.reason || 'Signal strength from news lexicon'],
      });
  }

  async researchCopilot(newsItems, query) {
    const system = `You are CryptoDesk Research Copilot — institutional crypto research assistant. Be direct, structured, and actionable. No filler.`;
    const user = `Current SoSoValue feed (${newsItems?.length || 0} articles):\n${feedHeadlines(newsItems) || '(demo feed)'}\n\nUser question:\n${query}\n\nAnswer with clear sections. Max 280 words.`;
    return this.complete(system, user, 900);
  }

  async detectNarrativeRotation(newsItems, sectorContext = '', indicesContext = '') {
    const system = `You are CryptoDesk's narrative rotation engine. Return only JSON.`;
    const user = `Detect narrative rotation from this data. Return ONLY JSON:\n{\n  "current_narrative": "sector or theme name",\n  "current_momentum": "Strengthening|Stable|Weakening",\n  "emerging_narrative": "sector or theme name",\n  "emerging_momentum": "Strengthening|Stable|Weakening",\n  "insight": "One sentence on capital rotation"\n}\nNews:\n${feedHeadlines(newsItems, 22)}\nSector 24h data: ${sectorContext || 'unavailable'}\nSSI indices: ${indicesContext || 'unavailable'}`;
    const raw = await this.complete(system, user, 350);
    return parseGrokJson(raw, {
      current_narrative: 'AI Tokens',
      current_momentum: 'Weakening',
      emerging_narrative: 'RWA / ETH flows',
      emerging_momentum: 'Strengthening',
      insight: 'Headline flow suggests rotation from high-beta AI into institutional ETH/RWA narratives.',
    });
  }

  async buildPortfolio(newsItems, { capital = 1000, risk = 'Medium', goal = 'Growth' } = {}) {
    const system = `You are CryptoDesk Portfolio Intelligence Agent. Return only JSON. Allocations must sum to 100.`;
    const user = `Build a portfolio from the feed. Return ONLY JSON:\n{\n  "allocations": [{"asset": "BTC", "pct": 40, "reason": "one sentence"}],\n  "summary": "Two sentence portfolio thesis",\n  "risk_note": "One sentence risk control"\n}\nCapital: $${capital}\nRisk tolerance: ${risk}\nGoal: ${goal}\nNews:\n${feedHeadlines(newsItems, 20)}`;
    const raw = await this.complete(system, user, 500);
    return parseGrokJson(raw, {
      allocations: [
        { asset: 'BTC', pct: 40, reason: 'Core beta anchor' },
        { asset: 'ETH', pct: 30, reason: 'Institutional flow narrative' },
        { asset: 'SOL', pct: 20, reason: 'Growth beta' },
        { asset: 'AI Index', pct: 10, reason: 'Thematic satellite' },
      ],
      summary: 'Balanced growth sleeve with core L1s and a small thematic satellite.',
      risk_note: 'Size positions to medium risk; rebalance if sentiment drops below 40%.',
    });
  }

  async buildSSIIndex(newsItems, theme = 'AI Index', ssiReference = null) {
    const system = `You are CryptoDesk SSI Index Builder leveraging SoSoValue SSI Protocol. Return only JSON. Prefer symbols that appear in live SSI constituents when provided. Weights must sum to 100.`;
    const liveBlock = ssiReference?.matchedIndex
      ? `\nLive SoSo SSI reference:\n${formatReferenceForGrok(ssiReference)}`
      : '\nLive SoSo SSI reference: unavailable';
    const user = `Design a custom index aligned with SSI Protocol methodology. Return ONLY JSON:\n{\n  "index_name": "${theme}",\n  "constituents": [{"symbol": "TAO", "pct": 40, "reason": "one sentence"}],\n  "methodology": ["AI relevance", "market cap", "momentum", "liquidity"],\n  "rebalance_rule": "One sentence",\n  "ssi_alignment": "One sentence on how this maps to live SSI data"\n}\nTheme: ${theme}${liveBlock}\nNews:\n${feedHeadlines(newsItems, 16)}`;
    const raw = await this.complete(system, user, 550);
    return parseGrokJson(raw, {
      index_name: theme,
      constituents: [
        { symbol: 'TAO', pct: 40, reason: 'AI infrastructure leader' },
        { symbol: 'FET', pct: 30, reason: 'Agent economy exposure' },
        { symbol: 'RENDER', pct: 20, reason: 'Compute narrative' },
        { symbol: 'AKT', pct: 10, reason: 'Decentralized compute satellite' },
      ],
      methodology: ['AI relevance', 'market cap', 'momentum', 'liquidity'],
      rebalance_rule: 'Monthly rebalance when constituent weight drifts ±5%.',
      ssi_alignment: 'Designed to mirror SoSoValue SSI thematic indices when live data is connected.',
    });
  }

  async generateStrategy(newsItem, opportunity = {}) {
    const title = ensureString(newsItem?.title || 'Market strategy');
    const content = ensureString(newsItem?.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const whyBlock = opportunity.why?.length
      ? `\nWhy bullets: ${opportunity.why.join('; ')}`
      : '';
    const system = `You are CryptoDesk Strategy Generator. Return only JSON.`;
    const user = `Generate a trade strategy playbook. Return ONLY JSON:\n{\n  "name": "strategy name e.g. Ethereum ETF Momentum",\n  "entry": "entry guidance",\n  "risk": "Low|Medium|High",\n  "time_horizon": "e.g. 14 Days",\n  "action": "Buy|Sell|Hold|Accumulate",\n  "thesis": "One sentence thesis",\n  "exit_criteria": ["criterion 1", "criterion 2", "criterion 3"]\n}\nTitle: ${newsItem?.title || 'Market strategy'}\nContent: ${content}\nAsset: ${opportunity.asset || 'MARKET'}\nRecommendation: ${opportunity.recommendation || 'Hold'}\nConfidence: ${opportunity.confidence || '—'}%${whyBlock}`;
    const raw = await this.complete(system, user, 450);
    return parseGrokJson(raw, {
      name: `${opportunity.asset || 'Market'} Momentum`,
      entry: 'Current levels on confirmation',
      risk: opportunity.risk || 'Medium',
      time_horizon: '14 Days',
      action: opportunity.recommendation || 'Hold',
      thesis: opportunity.why?.[0] || opportunity.reason || 'Momentum from headline flow',
      exit_criteria: ['ETF inflows weaken', 'Sentiment turns negative', 'Risk score rises to High'],
    });
  }
}
