/**
 * SoDEX API Client — Wave 3
 * On-chain orderbook execution via SoDEX/ValueChain
 * Docs: https://sodex.com/documentation/api/api
 *
 * Status: Stubbed for Wave 1 | Active in Wave 3
 */

const SODEX_BASE = 'https://api.sodex.com';

class SoDEXAPI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isTestnet = true; // Use testnet until Wave 3
  }

  get base() {
    return this.isTestnet
      ? 'https://testnet-api.sodex.com'
      : SODEX_BASE;
  }

  async _fetch(path, options = {}) {
    const res = await fetch(this.base + path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        ...(options.headers || {})
      }
    });
    if (!res.ok) throw new Error(`SoDEX API ${res.status}`);
    return res.json();
  }

  // ── Market Data (Wave 2 — read only) ───────────────────
  getOrderbook(pair)       { return this._fetch(`/v1/orderbook/${pair}`); }
  getTicker(pair)          { return this._fetch(`/v1/ticker/${pair}`); }
  getMarkets()             { return this._fetch('/v1/markets'); }

  // ── Trading (Wave 3 — execution) ───────────────────────
  placeOrder(params) {
    return this._fetch('/v1/order', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  }

  cancelOrder(orderId) {
    return this._fetch(`/v1/order/${orderId}`, { method: 'DELETE' });
  }

  getOpenOrders()          { return this._fetch('/v1/orders/open'); }
  getOrderHistory()        { return this._fetch('/v1/orders/history'); }
  getPortfolio()           { return this._fetch('/v1/portfolio'); }

  // ── Rebalance helper (Wave 3) ──────────────────────────
  async rebalanceToIndex(currentPortfolio, targetWeights, totalValue) {
    const orders = [];
    for (const [symbol, targetWeight] of Object.entries(targetWeights)) {
      const targetValue = totalValue * (targetWeight / 100);
      const currentValue = currentPortfolio[symbol] || 0;
      const diff = targetValue - currentValue;
      if (Math.abs(diff) > 10) { // $10 minimum trade threshold
        orders.push({
          symbol,
          side: diff > 0 ? 'buy' : 'sell',
          amount: Math.abs(diff),
          type: 'market'
        });
      }
    }
    return orders;
  }
}

window.SoDEXAPI = SoDEXAPI;
