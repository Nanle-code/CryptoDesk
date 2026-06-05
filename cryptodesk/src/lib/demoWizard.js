/** Guided judge demo — aligned with nextstep.md Demo Scenario (steps 1–7). */
export const DEMO_STEPS = [
  {
    id: 'connect',
    step: 0,
    title: 'Connect APIs',
    summary: 'Paste SoSoValue + Grok keys. Keys stay in sessionStorage only.',
    proof: 'cd_soso · cd_grok',
    action: 'openSettings',
  },
  {
    id: 'news',
    step: 1,
    title: 'Breaking news arrives',
    summary: 'Live SoSoValue headlines load in the center News feed tab.',
    proof: 'GET /news · code 0',
    action: 'newsFeed',
  },
  {
    id: 'classify',
    step: 2,
    title: 'AI classification',
    summary: 'Trust bar shows Grok classifying top 5 signals (sentiment, confidence, assets).',
    proof: 'Grok classifySignal · auto on load',
    action: 'signals',
  },
  {
    id: 'opportunity',
    step: 3,
    title: 'Opportunity engine',
    summary: 'High-conviction signals become opportunities with confidence, risk, and horizon.',
    proof: 'buildOpportunities · Opportunities panel',
    action: 'opportunities',
  },
  {
    id: 'committee',
    step: 4,
    title: 'Investment committee',
    summary: 'Multi-agent review: Analyst · Risk · Macro · Execution → final recommendation.',
    proof: 'Grok runInvestmentCommittee',
    action: 'committee',
  },
  {
    id: 'portfolio',
    step: 5,
    title: 'Portfolio agent',
    summary: 'Generate allocation sleeves from the live feed ($1k · Medium · Growth).',
    proof: 'Grok buildPortfolio',
    action: 'portfolio',
  },
  {
    id: 'execution',
    step: 6,
    title: 'Execution preview',
    summary: 'Bind recommendation + allocation + slippage to SoDEX orderbook depth.',
    proof: 'SoDEX testnet · execution preview card',
    action: 'execution',
  },
  {
    id: 'explain',
    step: 7,
    title: 'Explainability',
    summary: 'Every opportunity shows Why? and Risks bullets (lexicon + Grok top 3).',
    proof: 'explainability layer · Demo Step 7',
    action: 'explainability',
  },
];

export function getDemoStep(index) {
  return DEMO_STEPS[Math.max(0, Math.min(index, DEMO_STEPS.length - 1))];
}
