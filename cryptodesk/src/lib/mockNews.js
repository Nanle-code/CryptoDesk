export function mockNews() {
  const now = Date.now();
  return [
    { title: 'Bitcoin ETF sees $120M net inflow as institutional demand persists', content: 'BlackRock IBIT leads weekly BTC inflows.', category: 3, release_time: now - 3600000, nick_name: 'Demo', tags: ['ETF', 'BTC'] },
    { title: 'Ethereum L2 volumes hit record as DeFi adoption accelerates', content: 'ETH ecosystem growth on Arbitrum and Base.', category: 2, release_time: now - 7200000, nick_name: 'Demo', matched_currencies: [{ name: 'ETH' }] },
    { title: 'SEC delays spot crypto ETF decision', content: 'Regulatory uncertainty weighs on altcoins.', category: 1, release_time: now - 10800000, nick_name: 'Demo' },
    { title: 'Solana DeFi TVL rebounds after upgrade', content: '$SOL rallies on new perp dex launches.', category: 2, release_time: now - 14400000, nick_name: 'Demo', matched_currencies: [{ name: 'SOL' }] },
    { title: 'Fed signals cautious rate path ahead of CPI', content: 'Risk assets watch FOMC minutes.', category: 3, release_time: now - 18000000, nick_name: 'Demo' },
  ];
}
