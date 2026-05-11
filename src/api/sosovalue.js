/**
 * SoSoValue API Client
 * Base URL: https://openapi.sosovalue.com/openapi/v1
 * Auth: x-soso-api-key header
 */

const SOSO_BASE = 'https://openapi.sosovalue.com/openapi/v1';

class SoSoValueAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }

  async _fetch(path, params = {}) {
    const url = new URL(SOSO_BASE + path);
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });
    const res = await fetch(url.toString(), {
      headers: { 'x-soso-api-key': this.apiKey }
    });
    if (!res.ok) throw new Error(`SoSoValue API ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // ── Feeds ──────────────────────────────────────────────
  getNews(params = {})         { return this._fetch('/news', params); }
  getHotNews(params = {})      { return this._fetch('/news/hot', params); }
  getFeaturedNews(params = {}) { return this._fetch('/news/featured', params); }

  // ── Currency ───────────────────────────────────────────
  getCurrencies(params = {})                        { return this._fetch('/currencies', params); }
  getCurrency(id)                                   { return this._fetch(`/currencies/${id}`); }
  getCurrencySnapshot(id)                           { return this._fetch(`/currencies/${id}/market-snapshot`); }
  getCurrencyKlines(id, params = {})                { return this._fetch(`/currencies/${id}/klines`, params); }
  getCurrencySupply(id, params = {})                { return this._fetch(`/currencies/${id}/supply`, params); }
  getCurrencyPairs(id)                              { return this._fetch(`/currencies/${id}/pairs`); }
  getSectorSpotlight()                              { return this._fetch('/currencies/sector-spotlight'); }
  getCurrencyFundraising(id)                        { return this._fetch(`/currencies/${id}/fundraising`); }

  // ── ETF ────────────────────────────────────────────────
  getETFSummaryHistory(params = {})                 { return this._fetch('/etfs/summary-history', params); }
  getETFs(params = {})                              { return this._fetch('/etfs', params); }
  getETFSnapshot(ticker)                            { return this._fetch(`/etfs/${ticker}/market-snapshot`); }
  getETFHistory(ticker, params = {})                { return this._fetch(`/etfs/${ticker}/history`, params); }

  // ── SoSoValue Index ────────────────────────────────────
  getIndices(params = {})                           { return this._fetch('/indices', params); }
  getIndexConstituents(ticker)                      { return this._fetch(`/indices/${ticker}/constituents`); }
  getIndexSnapshot(ticker)                          { return this._fetch(`/indices/${ticker}/market-snapshot`); }
  getIndexKlines(ticker, params = {})               { return this._fetch(`/indices/${ticker}/klines`, params); }

  // ── Crypto Stocks ──────────────────────────────────────
  getCryptoStocks(params = {})                      { return this._fetch('/crypto-stocks', params); }
  getCryptoStockSnapshot(ticker)                    { return this._fetch(`/crypto-stocks/${ticker}/market-snapshot`); }
  getCryptoStockMarketCap(ticker, params = {})      { return this._fetch(`/crypto-stocks/${ticker}/market-cap`, params); }
  getCryptoStockKlines(ticker, params = {})         { return this._fetch(`/crypto-stocks/${ticker}/klines`, params); }
  getCryptoStockSectors()                           { return this._fetch('/crypto-stocks/sector'); }
  getSectorIndex(sectorName, params = {})           { return this._fetch(`/crypto-stocks/sector/${sectorName}/index`, params); }

  // ── BTC Treasuries ─────────────────────────────────────
  getBTCTreasuries(params = {})                     { return this._fetch('/btc-treasuries', params); }
  getBTCPurchaseHistory(ticker, params = {})        { return this._fetch(`/btc-treasuries/${ticker}/purchase-history`, params); }

  // ── Fundraising ────────────────────────────────────────
  getFundraisingProjects(params = {})               { return this._fetch('/fundraising/projects', params); }
  getFundraisingProject(id)                         { return this._fetch(`/fundraising/projects/${id}`); }

  // ── Macro ──────────────────────────────────────────────
  getMacroEvents(params = {})                       { return this._fetch('/macro/events', params); }
  getMacroEventHistory(event, params = {})          { return this._fetch(`/macro/events/${event}/history`, params); }

  // ── Analysis ───────────────────────────────────────────
  getAnalyses(params = {})                          { return this._fetch('/analyses', params); }
  getAnalysisChart(chartName)                       { return this._fetch(`/analyses/${chartName}`); }
}

// Export for use in index.html via window global
window.SoSoValueAPI = SoSoValueAPI;
