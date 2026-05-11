/**
 * Intelligence Extraction Utilities
 * Ticker detection, sentiment analysis, signal generation
 * @version 3.0
 */

class IntelligenceExtractor {
  constructor() {
    // Ticker patterns
    this.tickerPattern = /\$([A-Z]{2,5})\b/g;
    this.cryptoTickers = new Set([
      'BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI',
      'ATOM', 'XRP', 'DOGE', 'SHIB', 'LTC', 'BCH', 'XLM', 'ALGO', 'VET', 'FIL',
      'AAVE', 'MKR', 'SNX', 'COMP', 'YFI', 'CRV', 'SUSHI', 'BAL', 'REN', 'ZRX'
    ]);

    // Sentiment keywords with weights
    this.sentimentLexicon = {
      bullish: {
        strong: ['surge', 'soar', 'explode', 'rocket', 'moon', 'breakout', 'rally', 'pump'],
        moderate: ['rise', 'gain', 'increase', 'grow', 'advance', 'climb', 'recover', 'bounce'],
        weak: ['stable', 'steady', 'hold', 'maintain', 'consolidate']
      },
      bearish: {
        strong: ['crash', 'plunge', 'collapse', 'dump', 'tank', 'plummet', 'devastate'],
        moderate: ['fall', 'drop', 'decline', 'decrease', 'slide', 'slip', 'retreat'],
        weak: ['concern', 'worry', 'caution', 'risk', 'uncertainty']
      },
      bullish_events: ['approval', 'adoption', 'partnership', 'launch', 'upgrade', 'milestone', 'record', 'inflow', 'accumulation'],
      bearish_events: ['hack', 'exploit', 'ban', 'regulation', 'lawsuit', 'fraud', 'scam', 'outflow', 'liquidation']
    };
  }

  /**
   * Extract tickers from text
   * @param {string} text
   * @returns {Array<{ticker: string, positions: Array}>}
   */
  extractTickers(text) {
    const tickers = new Map();
    const matches = text.matchAll(this.tickerPattern);

    for (const match of matches) {
      const ticker = match[1];
      if (this.cryptoTickers.has(ticker)) {
        if (!tickers.has(ticker)) {
          tickers.set(ticker, {
            ticker,
            positions: [],
            count: 0
          });
        }
        const data = tickers.get(ticker);
        data.positions.push(match.index);
        data.count++;
      }
    }

    return Array.from(tickers.values());
  }

  /**
   * Analyze sentiment with strength gauge
   * @param {string} text
   * @returns {Object} {sentiment: string, strength: number, confidence: number, signals: Array}
   */
  analyzeSentiment(text) {
    const lower = text.toLowerCase();
    let bullScore = 0;
    let bearScore = 0;
    const signals = [];

    // Strong sentiment words (weight: 3)
    this.sentimentLexicon.bullish.strong.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bullScore += count * 3;
        signals.push({ type: 'bullish', word, strength: 'strong', count });
      }
    });

    this.sentimentLexicon.bearish.strong.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bearScore += count * 3;
        signals.push({ type: 'bearish', word, strength: 'strong', count });
      }
    });

    // Moderate sentiment words (weight: 2)
    this.sentimentLexicon.bullish.moderate.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bullScore += count * 2;
        signals.push({ type: 'bullish', word, strength: 'moderate', count });
      }
    });

    this.sentimentLexicon.bearish.moderate.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bearScore += count * 2;
        signals.push({ type: 'bearish', word, strength: 'moderate', count });
      }
    });

    // Weak sentiment words (weight: 1)
    this.sentimentLexicon.bullish.weak.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bullScore += count * 1;
        signals.push({ type: 'bullish', word, strength: 'weak', count });
      }
    });

    this.sentimentLexicon.bearish.weak.forEach(word => {
      const count = (lower.match(new RegExp(word, 'g')) || []).length;
      if (count > 0) {
        bearScore += count * 1;
        signals.push({ type: 'bearish', word, strength: 'weak', count });
      }
    });

    // Event-based sentiment
    this.sentimentLexicon.bullish_events.forEach(word => {
      if (lower.includes(word)) {
        bullScore += 2;
        signals.push({ type: 'bullish', word, strength: 'event' });
      }
    });

    this.sentimentLexicon.bearish_events.forEach(word => {
      if (lower.includes(word)) {
        bearScore += 2;
        signals.push({ type: 'bearish', word, strength: 'event' });
      }
    });

    // Calculate final sentiment
    const totalScore = bullScore + bearScore;
    const netScore = bullScore - bearScore;
    
    let sentiment = 'neutral';
    let strength = 0;
    let confidence = 0;

    if (totalScore > 0) {
      confidence = Math.min(100, (totalScore / 10) * 100);
      
      if (netScore > 2) {
        sentiment = 'bullish';
        strength = Math.min(5, Math.ceil((netScore / 5) * 5));
      } else if (netScore < -2) {
        sentiment = 'bearish';
        strength = Math.min(5, Math.ceil((Math.abs(netScore) / 5) * 5));
      } else {
        sentiment = 'neutral';
        strength = 1;
      }
    }

    return {
      sentiment,
      strength: Math.max(1, strength),
      confidence: Math.round(confidence),
      bullScore,
      bearScore,
      signals: signals.slice(0, 5) // Top 5 signals
    };
  }

  /**
   * Generate actionable intelligence from news item
   * @param {Object} newsItem
   * @returns {Object}
   */
  generateIntelligence(newsItem) {
    const text = `${newsItem.title} ${newsItem.content || ''}`;
    
    const tickers = this.extractTickers(text);
    const sentiment = this.analyzeSentiment(text);
    
    // Extract key entities
    const entities = this.extractEntities(text);
    
    // Generate trading signal
    const signal = this.generateTradingSignal(sentiment, tickers, entities);

    return {
      tickers,
      sentiment,
      entities,
      signal,
      timestamp: Date.now()
    };
  }

  /**
   * Extract named entities (companies, protocols, etc.)
   * @param {string} text
   * @returns {Array}
   */
  extractEntities(text) {
    const entities = [];
    const patterns = {
      companies: /\b(MicroStrategy|Tesla|BlackRock|Fidelity|Grayscale|Coinbase|Binance|FTX|Kraken)\b/gi,
      protocols: /\b(Ethereum|Bitcoin|Solana|Avalanche|Polygon|Arbitrum|Optimism|Base|Uniswap|Aave|Compound)\b/gi,
      people: /\b(Michael Saylor|Elon Musk|Vitalik Buterin|CZ|SBF)\b/gi
    };

    Object.entries(patterns).forEach(([type, pattern]) => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        entities.push({
          type,
          name: match[0],
          position: match.index
        });
      }
    });

    return entities;
  }

  /**
   * Generate trading signal
   * @param {Object} sentiment
   * @param {Array} tickers
   * @param {Array} entities
   * @returns {Object}
   */
  generateTradingSignal(sentiment, tickers, entities) {
    if (sentiment.strength < 3) {
      return {
        action: 'WATCH',
        confidence: sentiment.confidence,
        reason: 'Insufficient signal strength'
      };
    }

    const primaryTicker = tickers.length > 0 ? tickers[0].ticker : 'MARKET';
    
    if (sentiment.sentiment === 'bullish') {
      return {
        action: sentiment.strength >= 4 ? 'STRONG BUY' : 'BUY',
        ticker: primaryTicker,
        confidence: sentiment.confidence,
        reason: `${sentiment.strength}/5 bullish signals detected`
      };
    } else if (sentiment.sentiment === 'bearish') {
      return {
        action: sentiment.strength >= 4 ? 'STRONG SELL' : 'SELL',
        ticker: primaryTicker,
        confidence: sentiment.confidence,
        reason: `${sentiment.strength}/5 bearish signals detected`
      };
    }

    return {
      action: 'HOLD',
      ticker: primaryTicker,
      confidence: sentiment.confidence,
      reason: 'Neutral sentiment'
    };
  }

  /**
   * Highlight tickers in text
   * @param {string} text
   * @returns {string} HTML with highlighted tickers
   */
  highlightTickers(text) {
    return text.replace(this.tickerPattern, (match, ticker) => {
      if (this.cryptoTickers.has(ticker)) {
        return `<span class="ticker-highlight" data-ticker="${ticker}" onclick="window.app.showTickerQuickView('${ticker}')">${match}</span>`;
      }
      return match;
    });
  }
}

// Create singleton instance
const intelligenceExtractor = new IntelligenceExtractor();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.IntelligenceExtractor = intelligenceExtractor;
}

export default intelligenceExtractor;
