/**
 * CryptoDesk State Management
 * Lightweight reactive state container with signals pattern
 * @version 2.0
 */

/**
 * @typedef {Object} NewsItem
 * @property {string} id
 * @property {string} title
 * @property {string} content
 * @property {number} category
 * @property {string} category_name
 * @property {number} release_time
 * @property {string} nick_name
 * @property {string} author
 * @property {string[]} tags
 * @property {Array<{name: string}>} matched_currencies
 * @property {number} impression_count
 * @property {boolean} is_blue_verified
 * @property {string} source_link
 */

/**
 * @typedef {Object} AppState
 * @property {NewsItem[]} news
 * @property {string} currentTab - 'latest' | 'hot' | 'featured'
 * @property {number} currentCategory - 0 = all, 1-4 = specific
 * @property {boolean} isLoading
 * @property {string|null} error
 * @property {Object} config
 * @property {string} config.sosoKey
 * @property {string} config.grokKey
 * @property {string} config.topic
 * @property {Object} intelligence
 * @property {string|null} intelligence.briefing
 * @property {Object|null} intelligence.selectedArticle
 * @property {Array} intelligence.signals
 * @property {Object} stats
 * @property {number} stats.totalArticles
 * @property {number} stats.signals
 * @property {number} stats.sentimentScore
 */

class StateManager {
  constructor() {
    /** @type {AppState} */
    this.state = {
      news: [],
      currentTab: 'latest',
      currentCategory: 0,
      isLoading: false,
      error: null,
      config: {
        sosoKey: sessionStorage.getItem('cd_soso') || '',
        grokKey: sessionStorage.getItem('cd_grok') || '',
        topic: sessionStorage.getItem('cd_topic') || ''
      },
      intelligence: {
        briefing: null,
        selectedArticle: null,
        signals: []
      },
      stats: {
        totalArticles: 0,
        signals: 0,
        sentimentScore: 0
      }
    };

    this.subscribers = new Map();
    this.subscriberId = 0;
  }

  /**
   * Subscribe to state changes
   * @param {(state: AppState) => void} callback
   * @returns {() => void} Unsubscribe function
   */
  subscribe(callback) {
    const id = this.subscriberId++;
    this.subscribers.set(id, callback);
    
    // Immediately call with current state
    callback(this.state);
    
    return () => this.subscribers.delete(id);
  }

  /**
   * Update state and notify subscribers
   * @param {Partial<AppState> | ((state: AppState) => Partial<AppState>)} updates
   */
  setState(updates) {
    const newState = typeof updates === 'function' 
      ? updates(this.state)
      : updates;

    this.state = {
      ...this.state,
      ...newState,
      // Deep merge for nested objects
      config: { ...this.state.config, ...newState.config },
      intelligence: { ...this.state.intelligence, ...newState.intelligence },
      stats: { ...this.state.stats, ...newState.stats }
    };

    this.notifySubscribers();
  }

  /**
   * Notify all subscribers of state change
   */
  notifySubscribers() {
    this.subscribers.forEach(callback => {
      try {
        callback(this.state);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  /**
   * Get current state (immutable)
   * @returns {Readonly<AppState>}
   */
  getState() {
    return Object.freeze({ ...this.state });
  }

  /**
   * Update configuration and persist
   * @param {Partial<AppState['config']>} config
   */
  updateConfig(config) {
    const newConfig = { ...this.state.config, ...config };
    
    // Persist to sessionStorage
    if (config.sosoKey !== undefined) {
      sessionStorage.setItem('cd_soso', config.sosoKey);
    }
    if (config.grokKey !== undefined) {
      sessionStorage.setItem('cd_grok', config.grokKey);
    }
    if (config.topic !== undefined) {
      sessionStorage.setItem('cd_topic', config.topic);
    }

    this.setState({ config: newConfig });
  }

  /**
   * Set news data and update stats
   * @param {NewsItem[]} news
   */
  setNews(news) {
    const stats = this.calculateStats(news);
    this.setState({ news, stats, isLoading: false, error: null });
  }

  /**
   * Calculate statistics from news data
   * @param {NewsItem[]} news
   * @returns {AppState['stats']}
   */
  calculateStats(news) {
    const totalArticles = news.length;
    
    // Sentiment analysis
    const bullishWords = ['surge', 'rally', 'inflow', 'record', 'high', 'buy', 'accumulate', 'bullish', 'adoption', 'approval', 'launch', 'milestone', 'partnership', 'upgrade', 'growth'];
    const bearishWords = ['crash', 'dump', 'hack', 'exploit', 'ban', 'bearish', 'outflow', 'decline', 'fall', 'drop', 'sell', 'fraud', 'scam', 'lawsuit', 'regulatory', 'concern'];
    
    let bullCount = 0;
    let bearCount = 0;
    
    news.forEach(item => {
      const text = `${item.title} ${item.content}`.toLowerCase();
      const bullScore = bullishWords.filter(w => text.includes(w)).length;
      const bearScore = bearishWords.filter(w => text.includes(w)).length;
      
      if (bullScore > bearScore) bullCount++;
      else if (bearScore > bullScore) bearCount++;
    });
    
    const sentimentScore = totalArticles > 0 
      ? Math.round((bullCount / totalArticles) * 100)
      : 0;
    
    const signals = Math.floor(totalArticles * 0.35);
    
    return { totalArticles, signals, sentimentScore };
  }

  /**
   * Set loading state
   * @param {boolean} isLoading
   */
  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  /**
   * Set error state
   * @param {string|null} error
   */
  setError(error) {
    this.setState({ error, isLoading: false });
  }

  /**
   * Set current tab
   * @param {'latest'|'hot'|'featured'} tab
   */
  setTab(tab) {
    this.setState({ currentTab: tab });
  }

  /**
   * Set current category
   * @param {number} category
   */
  setCategory(category) {
    this.setState({ currentCategory: category });
  }

  /**
   * Set intelligence briefing
   * @param {string} briefing
   */
  setBriefing(briefing) {
    this.setState({
      intelligence: { ...this.state.intelligence, briefing }
    });
  }

  /**
   * Select article for detailed view
   * @param {NewsItem|null} article
   */
  selectArticle(article) {
    this.setState({
      intelligence: { ...this.state.intelligence, selectedArticle: article }
    });
  }

  /**
   * Add signal to intelligence
   * @param {Object} signal
   */
  addSignal(signal) {
    const signals = [...this.state.intelligence.signals, signal];
    this.setState({
      intelligence: { ...this.state.intelligence, signals }
    });
  }

  /**
   * Clear all signals
   */
  clearSignals() {
    this.setState({
      intelligence: { ...this.state.intelligence, signals: [] }
    });
  }

  /**
   * Reset state to initial
   */
  reset() {
    this.state = {
      news: [],
      currentTab: 'latest',
      currentCategory: 0,
      isLoading: false,
      error: null,
      config: this.state.config, // Preserve config
      intelligence: {
        briefing: null,
        selectedArticle: null,
        signals: []
      },
      stats: {
        totalArticles: 0,
        signals: 0,
        sentimentScore: 0
      }
    };
    this.notifySubscribers();
  }
}

// Create singleton instance
const stateManager = new StateManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.StateManager = stateManager;
}

export default stateManager;
