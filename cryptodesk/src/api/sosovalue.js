/**
 * SoSoValue OpenAPI v1 — full client
 * https://openapi.sosovalue.com/openapi/v1
 */
import { sosoFetch, unwrapData } from '../lib/api';

export { unwrapData };

export function createSoSoClient(apiKey) {
  const get = (path, params) => sosoFetch(apiKey, path, params).then(unwrapData);

  return {
    getNews: (p) => get('/news', p),
    getHotNews: (p) => get('/news/hot', p),
    getFeaturedNews: (p) => get('/news/featured', p),
    getCurrencies: () => get('/currencies'),
    getCurrency: (id) => get(`/currencies/${id}`),
    getMarketSnapshot: (id) => get(`/currencies/${id}/market-snapshot`),
    getKlines: (id, p) => get(`/currencies/${id}/klines`, p),
    getSectorSpotlight: () => get('/currencies/sector-spotlight'),
    getETFSummaryHistory: (p) => get('/etfs/summary-history', p),
    getETFs: (p) => get('/etfs', p),
    getETFSnapshot: (ticker) => get(`/etfs/${ticker}/market-snapshot`),
    getIndices: (p) => get('/indices', p),
    getIndexConstituents: (ticker) => get(`/indices/${ticker}/constituents`),
    getIndexSnapshot: (ticker) => get(`/indices/${ticker}/market-snapshot`),
    getIndexKlines: (ticker, p) => get(`/indices/${ticker}/klines`, p),
    getBTCTreasuries: (p) => get('/btc-treasuries', p),
    getBTCPurchases: (ticker, p) => get(`/btc-treasuries/${ticker}/purchase-history`, p),
    getFundraising: (p) => get('/fundraising/projects', p),
    getMacroEvents: () => get('/macro/events'),
    getAnalyses: (p) => get('/analyses', p),
    getAnalysisChart: (name) => get(`/analyses/${name}`),
  };
}
