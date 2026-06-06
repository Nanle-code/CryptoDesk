/**
 * CryptoDesk Application Core
 * Production-grade application controller
 * @version 2.0
 */

// @ts-check

/**
 * @typedef {import('./state.js').default} StateManager
 * @typedef {import('../components/VirtualList.js').default} VirtualList
 */

class CryptoDeskApp {
  constructor() {
    /** @type {StateManager} */
    this.state = window.StateManager;
    
    /** @type {VirtualList|null} */
    this.virtualList = null;
    
    /** @type {number|null} */
    this.refreshInterval = null;
    
    /** @type {number|null} */
    this.clockInterval = null;

    /** @type {MotionController} */
    this.motion = window.MotionController;

    this.init();
  }

  /**
   * Initialize application
   */
  async init() {
    this.setupClock();
    this.setupEventListeners();
    this.setupVirtualList();
    this.subscribeToState();
    
    // Initial data load
    await this.loadNews();
    
    // Auto-refresh if API key present
    if (this.state.getState().config.sosoKey) {
      this.startAutoRefresh();
    }
    
    // Show welcome toast if no API key
    if (!this.state.getState().config.sosoKey) {
      setTimeout(() => {
        this.showToast('Demo mode — click  Settings to connect SoSoValue API', 5000);
      }, 1200);
    }
  }

  /**
   * Setup clock updates
   */
  setupClock() {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      
      const clockEl = document.getElementById('clock');
      if (clockEl) {
        clockEl.textContent = `${hours}:${minutes}:${seconds} UTC`;
      }
    };

    updateClock();
    this.clockInterval = setInterval(updateClock, 1000);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Settings modal
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Modal close
    const modalBackdrop = document.getElementById('modalBackdrop');
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) {
          this.closeSettings();
        }
      });
    }

    // Save config
    const saveConfigBtn = document.getElementById('saveConfig');
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', () => this.saveConfig());
    }

    // Cancel config
    const cancelConfigBtn = document.getElementById('cancelConfig');
    if (cancelConfigBtn) {
      cancelConfigBtn.addEventListener('click', () => this.closeSettings());
    }

    // Briefing trigger
    const briefingBtn = document.getElementById('briefingBtn');
    if (briefingBtn) {
      briefingBtn.addEventListener('click', () => this.generateBriefing());
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K: Open settings
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSettings();
      }
      
      // Escape: Close modal
      if (e.key === 'Escape') {
        this.closeSettings();
        // Close quick view
        const popover = document.querySelector('.quick-view-popover');
        if (popover) popover.remove();
      }

      // J/K: Vim-style navigation (next/previous article)
      if (e.key === 'j' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.navigateArticle('next');
      }
      if (e.key === 'k' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.navigateArticle('prev');
      }

      // Enter: Open selected article
      if (e.key === 'Enter' && document.activeElement.classList.contains('news-card')) {
        e.preventDefault();
        const index = parseInt(document.activeElement.dataset.index);
        const state = this.state.getState();
        if (state.news[index]) {
          this.selectArticle(state.news[index], index);
        }
      }

      // G: Generate briefing
      if (e.key === 'g' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.generateBriefing();
      }

      // R: Refresh news
      if (e.key === 'r' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.loadNews();
      }

      // 1-4: Switch categories
      if (['1', '2', '3', '4'].includes(e.key) && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.setCategory(parseInt(e.key));
      }

      // ?: Show keyboard shortcuts
      if (e.key === '?' && !e.target.matches('input, textarea')) {
        e.preventDefault();
        this.showKeyboardShortcuts();
      }
    });

    // Enable keyboard navigation mode
    document.body.classList.add('keyboard-nav-active');

    // Window resize
    window.addEventListener('resize', () => {
      if (this.virtualList) {
        this.virtualList.resize();
      }
    });
  }

  /**
   * Navigate to next/previous article
   * @param {string} direction - 'next' or 'prev'
   */
  navigateArticle(direction) {
    const cards = Array.from(document.querySelectorAll('.news-card'));
    const currentIndex = cards.findIndex(card => card === document.activeElement);
    
    let nextIndex;
    if (direction === 'next') {
      nextIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
    }

    if (cards[nextIndex]) {
      cards[nextIndex].focus();
      cards[nextIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /**
   * Show keyboard shortcuts overlay
   */
  showKeyboardShortcuts() {
    const shortcuts = [
      { key: 'j/k', desc: 'Navigate articles (Vim-style)' },
      { key: '↑/↓', desc: 'Navigate articles' },
      { key: 'Enter', desc: 'Open selected article' },
      { key: '1-4', desc: 'Switch categories' },
      { key: 'g', desc: 'Generate AI briefing' },
      { key: 'r', desc: 'Refresh news feed' },
      { key: 'Cmd+K', desc: 'Open settings' },
      { key: 'Esc', desc: 'Close modal/popover' },
      { key: '?', desc: 'Show this help' }
    ];

    const html = `
      <div class="modal-backdrop open" id="shortcutsModal" style="z-index: 300;">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-header">
            <div class="modal-title">Keyboard Shortcuts</div>
            <div class="modal-subtitle">HFT-Grade Navigation</div>
          </div>
          <div class="modal-body">
            <div style="display: grid; gap: var(--space-2);">
              ${shortcuts.map(s => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2); background: var(--paper-90); border-radius: 2px;">
                  <span style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--ink-100);">${s.desc}</span>
                  <kbd class="keyboard-shortcut-hint">${s.key}</kbd>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary" onclick="document.getElementById('shortcutsModal').remove()">Got it</button>
          </div>
        </div>
      </div>
    `;

    const temp = document.createElement('div');
    temp.innerHTML = html;
    document.body.appendChild(temp.firstElementChild);
  }

  /**
   * Setup virtual list for news feed
   */
  setupVirtualList() {
    const container = document.getElementById('feedContainer');
    if (!container) return;

    this.virtualList = new window.VirtualList({
      container,
      items: [],
      itemHeight: 140,
      bufferSize: 5,
      renderItem: (item, index) => this.renderNewsCard(item, index),
      onItemClick: (item, index) => this.selectArticle(item, index)
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribeToState() {
    this.state.subscribe((state) => {
      // Update virtual list
      if (this.virtualList && state.news) {
        this.virtualList.updateItems(state.news);
      }

      // Update stats
      this.updateStats(state.stats);

      // Update nav counts
      this.updateNavCounts(state.news);

      // Update loading states
      this.updateLoadingState(state.isLoading);
    });
  }

  /**
   * Render news card HTML with intelligence extraction
   * @param {any} item
   * @param {number} index
   * @returns {string}
   */
  renderNewsCard(item, index) {
    const isLead = index === 0;
    const categoryClass = this.getCategoryClass(item.category);
    const categoryName = this.getCategoryName(item.category);
    const timeAgo = this.formatTimeAgo(item.release_time);
    
    // Extract intelligence
    const intelligence = window.IntelligenceExtractor.generateIntelligence(item);
    const snippet = this.stripHtml(item.content).slice(0, 130);
    
    // Highlight tickers in title
    const titleWithTickers = window.IntelligenceExtractor.highlightTickers(this.escapeHtml(item.title || 'Untitled'));
    
    const currencies = (item.matched_currencies || []).slice(0, 2);
    const tags = (item.tags || []).slice(0, 3);

    // Render sentiment gauge
    const sentimentGauge = this.renderSentimentGauge(intelligence.sentiment);
    
    // Render trading signal
    const tradingSignal = this.renderTradingSignal(intelligence.signal);

    return `
      <div class="news-card ${isLead ? 'lead' : ''}" data-index="${index}" tabindex="0">
        <div class="news-meta">
          <span class="news-source">${this.escapeHtml(item.nick_name || item.author || 'Source')}</span>
          <span class="news-category ${categoryClass}">${categoryName}</span>
          ${item.is_blue_verified ? '<span class="news-verified"></span>' : ''}
          <span class="news-time">${timeAgo}</span>
        </div>
        <div class="news-title">${titleWithTickers}</div>
        ${snippet ? `<div class="news-snippet">${this.escapeHtml(snippet)}</div>` : ''}
        ${sentimentGauge}
        <div style="display: flex; align-items: center; gap: var(--space-2); margin-top: var(--space-2);">
          ${tradingSignal}
          ${(currencies.length || tags.length) ? `
            <div class="news-footer" style="margin: 0;">
              ${currencies.map(c => `<span class="news-tag currency">${this.escapeHtml(c.name)}</span>`).join('')}
              ${tags.map(t => `<span class="news-tag">${this.escapeHtml(t)}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render sentiment gauge
   * @param {Object} sentiment
   * @returns {string}
   */
  renderSentimentGauge(sentiment) {
    const bars = Array.from({ length: 5 }, (_, i) => 
      `<span class="${i < sentiment.strength ? 'active' : ''}"></span>`
    ).join('');

    return `
      <div class="sentiment-gauge ${sentiment.sentiment}">
        <div class="sentiment-indicator">
          <div class="sentiment-label">${sentiment.sentiment}</div>
          <div class="sentiment-strength-bar">${bars}</div>
        </div>
        <div class="sentiment-confidence">
          <strong>${sentiment.confidence}%</strong> confidence
        </div>
      </div>
    `;
  }

  /**
   * Render trading signal badge
   * @param {Object} signal
   * @returns {string}
   */
  renderTradingSignal(signal) {
    const actionClass = signal.action.toLowerCase().replace(/\s+/g, '-');
    return `
      <div class="trading-signal ${actionClass}">
        <span>${signal.action}</span>
        ${signal.ticker !== 'MARKET' ? `<span class="signal-confidence">${signal.ticker}</span>` : ''}
      </div>
    `;
  }

  /**
   * Load news from API with error boundary
   */
  async loadNews() {
    const state = this.state.getState();
    this.state.setLoading(true);

    // Remove stale banner if exists
    const staleBanner = document.querySelector('.data-stale-banner');
    if (staleBanner) staleBanner.remove();

    // If no API key, use mock data
    if (!state.config.sosoKey) {
      const mockNews = this.getMockNews();
      this.state.setNews(mockNews);
      return;
    }

    try {
      const { currentTab, currentCategory } = state;
      let path = '/news';
      const params = { page_size: 50 };

      if (currentTab === 'hot') path = '/news/hot';
      if (currentTab === 'featured') path = '/news/featured';
      if (currentCategory > 0 && currentTab === 'latest') {
        params.category = currentCategory;
      }

      const data = await this.fetchSoSoValue(path, params);
      const news = data?.list || data?.news || (Array.isArray(data) ? data : []);
      
      if (news.length === 0) {
        throw new Error('No data received from API');
      }

      this.state.setNews(news);
      this.lastSuccessfulFetch = Date.now();
    } catch (error) {
      console.error('Failed to load news:', error);
      this.state.setError(error.message);
      
      // Show data stale banner
      this.showDataStaleBanner(error.message);
      
      // Use cached data if available, otherwise mock
      const cachedNews = this.state.getState().news;
      if (cachedNews.length === 0) {
        this.state.setNews(this.getMockNews());
      }
      
      this.showToast(`API Error: ${error.message}. Using cached data.`);
    }
  }

  /**
   * Show data stale banner
   * @param {string} errorMessage
   */
  showDataStaleBanner(errorMessage) {
    // Remove existing banner
    const existing = document.querySelector('.data-stale-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.className = 'data-stale-banner';
    banner.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-2);">
        <span></span>
        <span>Data Stale: ${this.escapeHtml(errorMessage)}</span>
      </div>
      <button class="btn" onclick="window.app.loadNews()">
        Refresh Now
      </button>
    `;

    const feedColumn = document.querySelector('.feed-column');
    if (feedColumn) {
      feedColumn.insertBefore(banner, feedColumn.firstChild);
    }
  }

  /**
   * Fetch from SoSoValue API
   * @param {string} path
   * @param {Object} params
   * @returns {Promise<any>}
   */
  async fetchSoSoValue(path, params = {}) {
    const state = this.state.getState();
    const baseUrl = 'https://openapi.sosovalue.com/openapi/v1';
    const url = new URL(baseUrl + path);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'x-soso-api-key': state.config.sosoKey
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  /**
   * Generate AI briefing
   */
  async generateBriefing() {
    const state = this.state.getState();
    
    if (!state.config.grokKey) {
      this.showToast('Please add Grok API key in Settings');
      return;
    }

    if (!state.news.length) {
      await this.loadNews();
    }

    const btn = document.getElementById('briefingBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner"></span> Generating…';
    }

    this.showIntelligencePanel('briefing', 'Generating...');

    try {
      const headlines = state.news.slice(0, 20).map(item => {
        const plain = this.stripHtml(item.content).slice(0, 150);
        const cat = this.getCategoryName(item.category);
        return `• [${cat}] ${item.title}${plain ? ' — ' + plain : ''}`;
      }).join('\n');

      const prompt = `You are CryptoDesk, an elite on-chain finance analyst powered by SoSoValue real-time data.

Today's SoSoValue news feed (${state.news.length} articles):
${headlines}
${state.config.topic ? '\nUser focus: ' + state.config.topic : ''}

Write a sharp DAILY INTELLIGENCE BRIEFING with these exact section headers (use all caps, no markdown):

EXECUTIVE SUMMARY
MARKET SIGNALS
SECTOR SPOTLIGHT
RISK WATCH
24H CALL

Be specific, data-driven, institutional in tone. Max 300 words. No filler.`;

      const briefing = await this.callGrokAPI(prompt);
      this.state.setBriefing(briefing);
      this.renderBriefing(briefing);
      this.showToast(' Intelligence briefing generated');
    } catch (error) {
      console.error('Briefing generation failed:', error);
      this.showToast(`Grok Error: ${error.message}`);
      this.renderStaticBriefing();
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = ' Generate Briefing';
      }
    }
  }

  /**
   * Call Grok API
   * @param {string} prompt
   * @returns {Promise<string>}
   */
  async callGrokAPI(prompt) {
    const state = this.state.getState();
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.config.grokKey}`
      },
      body: JSON.stringify({
        model: 'grok-2',
        max_tokens: 1000,
        temperature: 0,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * Render AI briefing
   * @param {string} text
   */
  renderBriefing(text) {
    const sections = ['EXECUTIVE SUMMARY', 'MARKET SIGNALS', 'SECTOR SPOTLIGHT', 'RISK WATCH', '24H CALL'];
    const lines = text.split('\n').filter(l => l.trim());
    
    let html = `
      <div class="intel-block ai-generated">
        <div class="intel-block-header"> Daily Intelligence · ${new Date().toUTCString().slice(0, 22)}</div>
        <div class="intel-block-body">
          <div class="report-title">AI Intelligence Report</div>
          <div class="report-byline">Powered by SoSoValue × Grok</div>
    `;

    lines.forEach(line => {
      const trimmed = line.trim();
      const isSection = sections.some(s => trimmed.toUpperCase().startsWith(s.split(' ')[0]) && trimmed.length < 40);
      
      if (isSection) {
        html += `<div class="report-section-title">${this.escapeHtml(trimmed)}</div>`;
      } else if (trimmed) {
        const cleaned = trimmed.replace(/^[•\-\*]\s*/, '');
        html += `<p class="report-paragraph">${this.escapeHtml(cleaned)}</p>`;
      }
    });

    html += `</div></div>`;
    
    const intelBody = document.getElementById('intelBody');
    if (intelBody) {
      intelBody.innerHTML = html;
    }
  }

  /**
   * Select article for detailed view
   * @param {any} item
   * @param {number} index
   */
  selectArticle(item, index) {
    this.state.selectArticle(item);
    
    // Update UI selection
    document.querySelectorAll('.news-card').forEach((card, i) => {
      card.classList.toggle('selected', i === index);
    });

    this.renderArticleDetail(item);
  }

  /**
   * Render article detail in intelligence panel
   * @param {any} item
   */
  renderArticleDetail(item) {
    const timeAgo = this.formatTimeAgo(item.release_time);
    const plain = this.stripHtml(item.content).slice(0, 800);
    const state = this.state.getState();

    const html = `
      <div class="intel-block">
        <div class="intel-block-header"> Article Detail</div>
        <div class="intel-block-body">
          <div class="report-title">${this.escapeHtml(item.title || '')}</div>
          <div class="report-byline">${this.escapeHtml(item.nick_name || item.author || '')} · ${new Date(item.release_time).toUTCString().slice(0, 22)}</div>
          <p class="report-paragraph">${this.escapeHtml(plain)}${plain.length >= 800 ? '…' : ''}</p>
          ${(() => { const sourceUrl = item.source_link || item.url || item.link || item.original_url; return sourceUrl && sourceUrl !== '#' && (sourceUrl.startsWith('http://') || sourceUrl.startsWith('https://')) ? `<a href="${this.escapeHtml(sourceUrl)}" target="_blank" rel="noopener" style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--accent-primary);text-decoration:none;margin-top:var(--space-3);display:inline-block;letter-spacing:0.04em;">Read source →</a>` : ''; })()}
        </div>
      </div>
      ${state.config.grokKey ? `
        <button class="btn btn-primary" style="width:100%;" onclick="app.analyzeArticle(${this.state.getState().news.indexOf(item)})">
           Analyze with Grok
        </button>
      ` : `<p style="font-family:var(--font-mono);font-size:var(--text-xs);color:var(--ink-50);text-align:center;letter-spacing:0.06em;text-transform:uppercase;padding:var(--space-4);">Add Grok key to enable AI analysis</p>`}
    `;

    const intelBody = document.getElementById('intelBody');
    if (intelBody) {
      intelBody.innerHTML = html;
    }

    const intelTitle = document.getElementById('intelTitle');
    if (intelTitle) {
      intelTitle.textContent = 'Article';
    }

    const intelSubtitle = document.getElementById('intelSubtitle');
    if (intelSubtitle) {
      intelSubtitle.textContent = timeAgo;
    }
  }

  /**
   * Analyze article with AI
   * @param {number} index
   */
  async analyzeArticle(index) {
    const state = this.state.getState();
    const item = state.news[index];
    
    if (!item || !state.config.grokKey) return;

    this.showToast('Analyzing with Grok…');

    const plain = this.stripHtml(item.content).slice(0, 500);
    const prompt = `Analyze this crypto news article and give a brief intelligence assessment:

Title: ${item.title}
Content: ${plain}

Return:
1. SENTIMENT: bullish/bearish/neutral + strength (1-5)
2. KEY INSIGHT: one sharp sentence
3. AFFECTED ASSETS: which tokens/sectors
4. TRADE IMPLICATION: one sentence action

Be direct and specific. Max 120 words.`;

    try {
      const analysis = await this.callGrokAPI(prompt);
      this.renderArticleAnalysis(item, analysis);
      this.showToast(' Analysis complete');
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showToast(`Grok Error: ${error.message}`);
    }
  }

  /**
   * Render article analysis
   * @param {any} item
   * @param {string} analysis
   */
  renderArticleAnalysis(item, analysis) {
    const timeAgo = this.formatTimeAgo(item.release_time);
    const lines = analysis.split('\n').filter(l => l.trim());

    const html = `
      <div class="intel-block ai-generated">
        <div class="intel-block-header"> Article Analysis — Grok</div>
        <div class="intel-block-body">
          <div class="report-title" style="font-size:var(--text-base);font-style:normal;">${this.escapeHtml(item.title)}</div>
          <div class="report-byline">${timeAgo} · AI Analysis</div>
          ${lines.map(l => `<p class="report-paragraph">${this.escapeHtml(l)}</p>`).join('')}
        </div>
      </div>
    `;

    const intelBody = document.getElementById('intelBody');
    if (intelBody) {
      intelBody.innerHTML = html;
    }
  }

  /**
   * Settings modal
   */
  openSettings() {
    const state = this.state.getState();
    const modal = document.getElementById('modalBackdrop');
    
    // Populate form
    const sosoInput = document.getElementById('inputSosoKey');
    const grokInput = document.getElementById('inputGrokKey');
    const topicInput = document.getElementById('inputTopic');
    
    if (sosoInput) sosoInput.value = state.config.sosoKey;
    if (grokInput) grokInput.value = state.config.grokKey;
    if (topicInput) topicInput.value = state.config.topic;
    
    if (modal) {
      modal.classList.add('open');
    }
  }

  closeSettings() {
    const modal = document.getElementById('modalBackdrop');
    if (modal) {
      modal.classList.remove('open');
    }
  }

  async saveConfig() {
    const sosoKey = /** @type {HTMLInputElement} */ (document.getElementById('inputSosoKey'))?.value.trim() || '';
    const grokKey = /** @type {HTMLInputElement} */ (document.getElementById('inputGrokKey'))?.value.trim() || '';
    const topic = /** @type {HTMLInputElement} */ (document.getElementById('inputTopic'))?.value.trim() || '';

    this.state.updateConfig({ sosoKey, grokKey, topic });
    this.closeSettings();
    this.showToast('Connected — loading live data…');
    
    await this.loadNews();
    
    if (sosoKey && !this.refreshInterval) {
      this.startAutoRefresh();
    }
  }

  /**
   * Auto-refresh news
   */
  startAutoRefresh() {
    if (this.refreshInterval) return;
    
    this.refreshInterval = setInterval(() => {
      this.loadNews();
    }, 60000); // 1 minute
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  /**
   * Update stats display
   * @param {Object} stats
   */
  updateStats(stats) {
    const newsEl = document.getElementById('statNews');
    const sigEl = document.getElementById('statSignals');
    const sentEl = document.getElementById('statSentiment');

    if (newsEl) {
      // Animate number change
      const oldValue = parseInt(newsEl.textContent) || 0;
      if (oldValue !== stats.totalArticles) {
        this.motion.animateNumber(newsEl, oldValue, stats.totalArticles, 800);
      }
    }
    
    if (sigEl) {
      const oldValue = parseInt(sigEl.textContent) || 0;
      if (oldValue !== stats.signals) {
        this.motion.animateNumber(sigEl, oldValue, stats.signals, 800);
      }
    }
    
    if (sentEl) {
      sentEl.textContent = stats.sentimentScore + '%';
      sentEl.style.color = stats.sentimentScore > 55 
        ? 'var(--signal-bull)' 
        : stats.sentimentScore < 40 
          ? 'var(--signal-bear)' 
          : 'var(--signal-neutral)';
      
      // Pulse on change
      sentEl.classList.add('updating');
      setTimeout(() => sentEl.classList.remove('updating'), 300);
    }
  }

  /**
   * Update nav counts
   * @param {Array} news
   */
  updateNavCounts(news) {
    const countAll = document.getElementById('countAll');
    if (countAll) countAll.textContent = news.length;

    [1, 2, 3, 4].forEach(cat => {
      const el = document.getElementById(`count${cat}`);
      if (el) {
        const count = news.filter(n => n.category === cat).length;
        el.textContent = count || '—';
      }
    });
  }

  /**
   * Update loading state
   * @param {boolean} isLoading
   */
  updateLoadingState(isLoading) {
    const container = document.getElementById('feedContainer');
    if (container) {
      container.classList.toggle('loading', isLoading);
    }
  }

  /**
   * Show intelligence panel
   * @param {string} type
   * @param {string} content
   */
  showIntelligencePanel(type, content) {
    const intelBody = document.getElementById('intelBody');
    if (!intelBody) return;

    if (type === 'briefing') {
      intelBody.innerHTML = `
        <div class="intel-block">
          <div class="intel-block-header"> Generating AI Intelligence Report…</div>
          <div class="intel-block-body">
            ${[1,2,3,4].map(() => `<div class="skeleton" style="height:12px;margin-bottom:var(--space-2);width:${60+Math.random()*35}%;"></div>`).join('')}
          </div>
        </div>
      `;
    }
  }

  /**
   * Render static briefing (no API key)
   */
  renderStaticBriefing() {
    const html = `
      <div class="intel-block">
        <div class="intel-block-header"> Daily Intelligence Report</div>
        <div class="intel-block-body">
          <div class="report-title">No Briefing Available</div>
          <div class="report-byline">CryptoDesk · ${new Date().toUTCString().slice(0, 22)}</div>
          <p class="report-paragraph">Add your SoSoValue and Grok API keys in Settings to generate live AI intelligence briefings based on real-time crypto news and data.</p>
          <p class="report-paragraph" style="color:var(--ink-50);font-size:var(--text-xs);margin-top:var(--space-3);">Demo mode shows sample data. Connect APIs for personalized insights.</p>
        </div>
      </div>
    `;

    const intelBody = document.getElementById('intelBody');
    if (intelBody) {
      intelBody.innerHTML = html;
    }
  }

  /**
   * Show toast notification
   * @param {string} message
   * @param {number} duration
   */
  showToast(message, duration = 3500) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    // Animate in
    this.motion.animateIn(toast, 'slide-in-right');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  /**
   * Set tab
   * @param {'latest'|'hot'|'featured'} tab
   */
  async setTab(tab) {
    this.state.setTab(tab);
    
    // Update UI
    document.querySelectorAll('.feed-tab').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });

    await this.loadNews();
  }

  /**
   * Set category
   * @param {number} category
   */
  async setCategory(category) {
    this.state.setCategory(category);
    
    // Update UI
    document.querySelectorAll('.nav-item').forEach(el => {
      el.classList.toggle('active', parseInt(el.dataset.category || '0') === category);
    });

    await this.loadNews();
  }

  // ═══════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════

  /**
   * Escape HTML
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Strip HTML tags
   * @param {string} html
   * @returns {string}
   */
  stripHtml(html) {
    return (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Format time ago
   * @param {number} timestamp
   * @returns {string}
   */
  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
    return Math.floor(seconds / 86400) + 'd ago';
  }

  /**
   * Get category class
   * @param {number} category
   * @returns {string}
   */
  getCategoryClass(category) {
    const map = {
      1: 'cat-breaking',
      2: 'cat-research',
      3: 'cat-inst',
      4: 'cat-kol',
      7: 'cat-official',
      13: 'cat-official'
    };
    return map[category] || 'cat-breaking';
  }

  /**
   * Get category name
   * @param {number} category
   * @returns {string}
   */
  getCategoryName(category) {
    const map = {
      1: 'Breaking',
      2: 'Research',
      3: 'Institutional',
      4: 'KOL',
      7: 'Official',
      13: 'Stocks'
    };
    return map[category] || 'News';
  }

  /**
   * Get mock news data
   * @returns {Array}
   */
  getMockNews() {
    return [
      {
        id: '1',
        title: 'Bitcoin ETF inflows hit $500M in a single session as institutional demand reaccelerates',
        content: '<p>Spot Bitcoin ETFs recorded their strongest single-day inflow in three months, with BlackRock\'s IBIT leading at $312M. Institutional demand shows no sign of slowing as macro conditions improve.</p>',
        category: 1,
        release_time: Date.now() - 1800000,
        nick_name: 'CryptoDesk Demo',
        tags: ['ETF', 'INSTITUTIONAL', 'BTC'],
        matched_currencies: [{ name: 'BTC' }],
        impression_count: 9200,
        is_blue_verified: 1,
        source_link: '#'
      },
      {
        id: '2',
        title: 'MicroStrategy adds 15,000 BTC — total treasury exceeds 500,000 Bitcoin',
        content: '<p>The business intelligence firm continues its aggressive accumulation strategy, making its largest single purchase this quarter. CFO confirms no plans to sell existing holdings.</p>',
        category: 3,
        release_time: Date.now() - 7200000,
        nick_name: 'CryptoDesk Demo',
        tags: ['MICROSTRATEGY', 'TREASURY', 'BTC'],
        matched_currencies: [{ name: 'BTC' }],
        impression_count: 14000,
        is_blue_verified: 1,
        source_link: '#'
      },
      {
        id: '3',
        title: 'Ethereum L2 ecosystem surpasses $50B TVL — Base leads monthly growth at 34%',
        content: '<p>Combined value locked across Arbitrum, Optimism, Base and other L2 networks reaches a new all-time high. Base\'s growth is attributed to Coinbase distribution and low transaction fees.</p>',
        category: 2,
        release_time: Date.now() - 10800000,
        nick_name: 'CryptoDesk Demo',
        tags: ['ETH', 'LAYER2', 'TVL', 'BASE'],
        matched_currencies: [{ name: 'ETH' }],
        impression_count: 5600,
        is_blue_verified: 0,
        source_link: '#'
      }
    ];
  }

  /**
   * Cleanup on destroy
   */
  destroy() {
    if (this.clockInterval) clearInterval(this.clockInterval);
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.virtualList) this.virtualList.destroy();
  }

  /**
   * Show ticker quick view popover
   * @param {string} ticker
   */
  showTickerQuickView(ticker) {
    // Remove existing popover
    const existing = document.querySelector('.quick-view-popover');
    if (existing) existing.remove();

    // Create popover
    const popover = document.createElement('div');
    popover.className = 'quick-view-popover';
    popover.innerHTML = `
      <div class="quick-view-header">
        <div class="quick-view-ticker">$${ticker}</div>
        <button class="quick-view-close" onclick="this.closest('.quick-view-popover').remove()">×</button>
      </div>
      <div class="quick-view-stats">
        <div class="quick-view-stat">
          <div class="quick-view-stat-label">Price</div>
          <div class="quick-view-stat-value" id="qv-price-${ticker}">Loading...</div>
        </div>
        <div class="quick-view-stat">
          <div class="quick-view-stat-label">24h Change</div>
          <div class="quick-view-stat-value" id="qv-change-${ticker}">Loading...</div>
        </div>
        <div class="quick-view-stat">
          <div class="quick-view-stat-label">Volume</div>
          <div class="quick-view-stat-value" id="qv-volume-${ticker}">Loading...</div>
        </div>
        <div class="quick-view-stat">
          <div class="quick-view-stat-label">Market Cap</div>
          <div class="quick-view-stat-value" id="qv-mcap-${ticker}">Loading...</div>
        </div>
      </div>
      <div class="quick-view-actions">
        <button class="btn btn-ghost" onclick="this.closest('.quick-view-popover').remove()">Close</button>
        <button class="btn btn-primary" onclick="window.app.addToWatchlist('${ticker}')">Add to Watchlist</button>
      </div>
    `;

    document.body.appendChild(popover);

    // Position popover at cursor (simplified - center of screen)
    popover.style.left = '50%';
    popover.style.top = '50%';
    popover.style.transform = 'translate(-50%, -50%)';

    // Load ticker data (mock for now)
    this.loadTickerData(ticker);

    // Close on outside click
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!popover.contains(e.target) && !e.target.classList.contains('ticker-highlight')) {
          popover.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 100);
  }

  /**
   * Load ticker data for quick view
   * @param {string} ticker
   */
  async loadTickerData(ticker) {
    // Mock data for now - replace with real API call
    const mockData = {
      BTC: { price: 94280, change: 2.4, volume: '28.5B', mcap: '1.85T' },
      ETH: { price: 3412, change: -0.8, volume: '15.2B', mcap: '410B' },
      SOL: { price: 148, change: 5.2, volume: '2.8B', mcap: '68B' },
      BNB: { price: 612, change: 1.1, volume: '1.5B', mcap: '89B' }
    };

    const data = mockData[ticker] || { price: 0, change: 0, volume: 'N/A', mcap: 'N/A' };

    const priceEl = document.getElementById(`qv-price-${ticker}`);
    const changeEl = document.getElementById(`qv-change-${ticker}`);
    const volumeEl = document.getElementById(`qv-volume-${ticker}`);
    const mcapEl = document.getElementById(`qv-mcap-${ticker}`);

    if (priceEl) priceEl.textContent = '$' + data.price.toLocaleString();
    if (changeEl) {
      changeEl.textContent = (data.change >= 0 ? '+' : '') + data.change + '%';
      changeEl.style.color = data.change >= 0 ? 'var(--signal-bull)' : 'var(--signal-bear)';
    }
    if (volumeEl) volumeEl.textContent = '$' + data.volume;
    if (mcapEl) mcapEl.textContent = '$' + data.mcap;
  }

  /**
   * Add ticker to watchlist
   * @param {string} ticker
   */
  addToWatchlist(ticker) {
    this.showToast(`${ticker} added to watchlist`);
    // Close popover
    const popover = document.querySelector('.quick-view-popover');
    if (popover) popover.remove();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new CryptoDeskApp();
  });
} else {
  window.app = new CryptoDeskApp();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CryptoDeskApp;
}
