/**
 * Virtual List Component - HFT Grade
 * Zero-lag virtualized rendering for 10,000+ items
 * Optimized for Bloomberg Terminal-level performance
 * @version 3.0
 */

class VirtualList {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Scroll container
   * @param {Array} options.items - Data items to render
   * @param {number} options.itemHeight - Fixed height per item (px)
   * @param {number} options.bufferSize - Number of items to render outside viewport
   * @param {(item: any, index: number) => string} options.renderItem - Render function
   * @param {(item: any, index: number) => void} options.onItemClick - Click handler
   */
  constructor(options) {
    this.container = options.container;
    this.items = options.items || [];
    this.itemHeight = options.itemHeight || 120;
    this.bufferSize = options.bufferSize || 8; // Increased buffer
    this.renderItem = options.renderItem;
    this.onItemClick = options.onItemClick;

    this.scrollTop = 0;
    this.viewportHeight = 0;
    this.totalHeight = 0;
    this.visibleStart = 0;
    this.visibleEnd = 0;

    this.contentWrapper = null;
    this.viewport = null;
    
    // Performance optimizations
    this.rafId = null;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.lastRenderTime = 0;
    this.renderThrottle = 16; // 60fps
    
    // DOM node pooling for reuse
    this.nodePool = [];
    this.activeNodes = new Map();
    
    // Intersection observer for visibility
    this.intersectionObserver = null;

    this.init();
  }

  /**
   * Initialize virtual list
   */
  init() {
    // Create DOM structure
    this.container.innerHTML = '';
    this.container.style.overflow = 'auto';
    this.container.style.position = 'relative';
    this.container.style.willChange = 'scroll-position'; // GPU hint

    // Content wrapper (maintains scroll height)
    this.contentWrapper = document.createElement('div');
    this.contentWrapper.style.position = 'relative';
    this.contentWrapper.style.width = '100%';
    this.contentWrapper.style.contain = 'layout style paint'; // CSS containment
    
    // Viewport (renders visible items)
    this.viewport = document.createElement('div');
    this.viewport.style.position = 'absolute';
    this.viewport.style.top = '0';
    this.viewport.style.left = '0';
    this.viewport.style.width = '100%';
    this.viewport.style.willChange = 'transform';
    this.viewport.style.contain = 'layout style paint';

    this.contentWrapper.appendChild(this.viewport);
    this.container.appendChild(this.contentWrapper);

    // Bind scroll handler with passive listener
    this.handleScroll = this.handleScroll.bind(this);
    this.container.addEventListener('scroll', this.handleScroll, { passive: true });

    // Setup intersection observer for visibility detection
    this.setupIntersectionObserver();

    // Initial render
    this.update();
  }

  /**
   * Setup intersection observer for performance
   */
  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            // Container not visible, pause updates
            this.pauseUpdates = true;
          } else {
            this.pauseUpdates = false;
            this.render();
          }
        });
      },
      { threshold: 0 }
    );

    this.intersectionObserver.observe(this.container);
  }

  /**
   * Handle scroll events with RAF throttling and performance optimization
   */
  handleScroll() {
    if (this.pauseUpdates) return;
    if (this.rafId) return;

    // Throttle rendering to 60fps max
    const now = performance.now();
    if (now - this.lastRenderTime < this.renderThrottle) {
      return;
    }

    this.rafId = requestAnimationFrame(() => {
      this.scrollTop = this.container.scrollTop;
      this.render();
      this.rafId = null;
      this.lastRenderTime = performance.now();
    });

    // Scroll state management
    if (!this.isScrolling) {
      this.isScrolling = true;
      this.container.classList.add('is-scrolling');
      this.container.style.pointerEvents = 'none'; // Disable interactions during scroll
    }

    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
      this.container.classList.remove('is-scrolling');
      this.container.style.pointerEvents = 'auto';
    }, 150);
  }

  /**
   * Update items and re-render
   * @param {Array} items
   */
  updateItems(items) {
    this.items = items || [];
    this.update();
  }

  /**
   * Update dimensions and render
   */
  update() {
    this.viewportHeight = this.container.clientHeight;
    this.totalHeight = this.items.length * this.itemHeight;
    this.contentWrapper.style.height = `${this.totalHeight}px`;
    
    this.render();
  }

  /**
   * Calculate visible range and render items with DOM pooling
   */
  render() {
    if (!this.items.length) {
      this.viewport.innerHTML = this.renderEmpty();
      return;
    }

    // Calculate visible range
    const scrollTop = this.scrollTop;
    const viewportHeight = this.viewportHeight;

    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.ceil((scrollTop + viewportHeight) / this.itemHeight);

    // Add buffer
    this.visibleStart = Math.max(0, startIndex - this.bufferSize);
    this.visibleEnd = Math.min(this.items.length, endIndex + this.bufferSize);

    // Batch DOM updates
    const fragment = document.createDocumentFragment();
    const newActiveNodes = new Map();

    // Reuse or create nodes
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.items[i];
      let itemElement = this.activeNodes.get(i);

      if (!itemElement) {
        // Try to reuse from pool
        itemElement = this.nodePool.pop() || this.createItemElement(item, i);
        this.updateItemElement(itemElement, item, i);
      }

      newActiveNodes.set(i, itemElement);
      fragment.appendChild(itemElement);
    }

    // Return unused nodes to pool
    this.activeNodes.forEach((node, index) => {
      if (!newActiveNodes.has(index)) {
        this.nodePool.push(node);
      }
    });

    this.activeNodes = newActiveNodes;

    // Single DOM update (minimize reflow)
    this.viewport.innerHTML = '';
    this.viewport.appendChild(fragment);
    
    // Position viewport with transform (GPU accelerated)
    const offsetY = this.visibleStart * this.itemHeight;
    this.viewport.style.transform = `translate3d(0, ${offsetY}px, 0)`;
  }

  /**
   * Create item element with optimizations
   * @param {any} item
   * @param {number} index
   * @returns {HTMLElement}
   */
  createItemElement(item, index) {
    const wrapper = document.createElement('div');
    wrapper.className = 'virtual-item';
    wrapper.style.height = `${this.itemHeight}px`;
    wrapper.style.contain = 'layout style paint'; // CSS containment
    wrapper.dataset.index = index;
    
    return wrapper;
  }

  /**
   * Update item element content
   * @param {HTMLElement} element
   * @param {any} item
   * @param {number} index
   */
  updateItemElement(element, item, index) {
    element.dataset.index = index;
    element.innerHTML = this.renderItem(item, index);
    
    // Add click handler with event delegation
    if (this.onItemClick) {
      element.style.cursor = 'pointer';
      element.onclick = () => this.onItemClick(item, index);
    }
  }

  /**
   * Render empty state
   * @returns {string}
   */
  renderEmpty() {
    return `
      <div class="virtual-empty" style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--space-12);
        text-align: center;
        min-height: 300px;
      ">
        <div style="
          font-family: var(--font-display);
          font-size: var(--text-3xl);
          font-style: italic;
          color: var(--ink-30);
          margin-bottom: var(--space-4);
        ">∅</div>
        <p style="
          font-size: var(--text-sm);
          color: var(--ink-50);
          max-width: 280px;
        ">No articles found. Try adjusting your filters or check your API connection.</p>
      </div>
    `;
  }

  /**
   * Scroll to specific index
   * @param {number} index
   * @param {'start'|'center'|'end'} align
   */
  scrollToIndex(index, align = 'start') {
    const targetIndex = Math.max(0, Math.min(index, this.items.length - 1));
    let scrollTop = targetIndex * this.itemHeight;

    if (align === 'center') {
      scrollTop -= (this.viewportHeight - this.itemHeight) / 2;
    } else if (align === 'end') {
      scrollTop -= this.viewportHeight - this.itemHeight;
    }

    this.container.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: 'smooth'
    });
  }

  /**
   * Get currently visible items
   * @returns {Array}
   */
  getVisibleItems() {
    return this.items.slice(this.visibleStart, this.visibleEnd);
  }

  /**
   * Resize handler (call on window resize)
   */
  resize() {
    this.update();
  }

  /**
   * Destroy and cleanup
   */
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    clearTimeout(this.scrollTimeout);
    this.container.removeEventListener('scroll', this.handleScroll);
    this.container.innerHTML = '';
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.VirtualList = VirtualList;
}

export default VirtualList;
