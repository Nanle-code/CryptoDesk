/**
 * CryptoDesk Motion Controller
 * Advanced animation orchestration
 * @version 2.0
 */

class MotionController {
  constructor() {
    this.observers = new Map();
    this.init();
  }

  /**
   * Initialize motion system
   */
  init() {
    this.setupScrollReveal();
    this.setupPriceFlash();
    this.setupStaggeredAnimations();
    this.setupHoverEffects();
  }

  /**
   * Scroll reveal animations using Intersection Observer
   */
  setupScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Optionally unobserve after reveal
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements with scroll-reveal class
    document.querySelectorAll('.scroll-reveal').forEach(el => {
      observer.observe(el);
    });

    this.observers.set('scroll-reveal', observer);
  }

  /**
   * Price flash animation when values change
   */
  setupPriceFlash() {
    this.priceCache = new Map();
  }

  /**
   * Flash price element when value changes
   * @param {HTMLElement} element
   * @param {number} newValue
   * @param {number} oldValue
   */
  flashPrice(element, newValue, oldValue) {
    if (!element || newValue === oldValue) return;

    const direction = newValue > oldValue ? 'up' : 'down';
    const className = `price-flash-${direction}`;

    element.classList.remove('price-flash-up', 'price-flash-down');
    
    // Trigger reflow
    void element.offsetWidth;
    
    element.classList.add(className);

    setTimeout(() => {
      element.classList.remove(className);
    }, 600);
  }

  /**
   * Staggered animations for lists
   */
  setupStaggeredAnimations() {
    const staggerContainers = document.querySelectorAll('.stagger-children');
    
    staggerContainers.forEach(container => {
      const children = Array.from(container.children);
      
      children.forEach((child, index) => {
        child.style.animationDelay = `${index * 0.05}s`;
      });
    });
  }

  /**
   * Enhanced hover effects
   */
  setupHoverEffects() {
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.createRipple(e, btn);
      });
    });
  }

  /**
   * Create ripple effect
   * @param {MouseEvent} event
   * @param {HTMLElement} element
   */
  createRipple(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      border-radius: 50%;
      background: rgba(255,255,255,0.3);
      pointer-events: none;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Animate element entrance
   * @param {HTMLElement} element
   * @param {string} animation - Animation name
   */
  animateIn(element, animation = 'slideUp') {
    if (!element) return;

    element.classList.add(`animate-${animation}`);
    
    element.addEventListener('animationend', () => {
      element.classList.remove(`animate-${animation}`);
    }, { once: true });
  }

  /**
   * Animate element exit
   * @param {HTMLElement} element
   * @param {string} animation - Animation name
   * @returns {Promise}
   */
  animateOut(element, animation = 'fadeOut') {
    return new Promise(resolve => {
      if (!element) {
        resolve();
        return;
      }

      element.classList.add(`animate-${animation}`);
      
      element.addEventListener('animationend', () => {
        element.classList.remove(`animate-${animation}`);
        resolve();
      }, { once: true });
    });
  }

  /**
   * Stagger animation for multiple elements
   * @param {NodeList|Array} elements
   * @param {string} animation
   * @param {number} delay - Delay between each element (ms)
   */
  staggerIn(elements, animation = 'slideUp', delay = 50) {
    elements.forEach((element, index) => {
      setTimeout(() => {
        this.animateIn(element, animation);
      }, index * delay);
    });
  }

  /**
   * Parallax effect on scroll
   * @param {HTMLElement} element
   * @param {number} speed - Parallax speed (0-1)
   */
  setupParallax(element, speed = 0.5) {
    if (!element) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const offset = scrolled * speed;
      element.style.transform = `translateY(${offset}px)`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  /**
   * Smooth scroll to element
   * @param {HTMLElement|string} target - Element or selector
   * @param {number} offset - Offset from top (px)
   */
  scrollTo(target, offset = 0) {
    const element = typeof target === 'string' 
      ? document.querySelector(target)
      : target;

    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }

  /**
   * Animate number counting
   * @param {HTMLElement} element
   * @param {number} start
   * @param {number} end
   * @param {number} duration - Duration in ms
   */
  animateNumber(element, start, end, duration = 1000) {
    if (!element) return;

    const startTime = performance.now();
    const difference = end - start;

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (difference * eased);

      element.textContent = Math.round(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  }

  /**
   * Shake element (for errors)
   * @param {HTMLElement} element
   */
  shake(element) {
    if (!element) return;

    element.style.animation = 'none';
    void element.offsetWidth; // Trigger reflow
    element.style.animation = 'wiggle 0.5s ease-in-out';

    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  }

  /**
   * Pulse element (for notifications)
   * @param {HTMLElement} element
   */
  pulse(element) {
    if (!element) return;

    element.classList.add('animate-bounce-subtle');

    setTimeout(() => {
      element.classList.remove('animate-bounce-subtle');
    }, 2000);
  }

  /**
   * Typewriter effect
   * @param {HTMLElement} element
   * @param {string} text
   * @param {number} speed - Characters per second
   */
  async typewriter(element, text, speed = 50) {
    if (!element) return;

    element.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      element.textContent += text[i];
      await new Promise(resolve => setTimeout(resolve, 1000 / speed));
    }
  }

  /**
   * Confetti effect (for celebrations)
   * @param {Object} options
   */
  confetti(options = {}) {
    const defaults = {
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 }
    };

    const config = { ...defaults, ...options };
    
    // Simple confetti implementation
    for (let i = 0; i < config.particleCount; i++) {
      this.createConfettiParticle(config);
    }
  }

  /**
   * Create single confetti particle
   * @param {Object} config
   */
  createConfettiParticle(config) {
    const particle = document.createElement('div');
    const colors = ['#1a6b3c', '#c0392b', '#1a3a6b', '#9a6108'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    particle.style.cssText = `
      position: fixed;
      width: 10px;
      height: 10px;
      background: ${color};
      left: ${config.origin.x || 0.5 * 100}%;
      top: ${config.origin.y * 100}%;
      pointer-events: none;
      z-index: 9999;
    `;

    document.body.appendChild(particle);

    const angle = (Math.random() - 0.5) * config.spread;
    const velocity = 5 + Math.random() * 5;
    const gravity = 0.3;
    let vx = Math.sin(angle * Math.PI / 180) * velocity;
    let vy = -Math.cos(angle * Math.PI / 180) * velocity;
    let x = parseFloat(particle.style.left);
    let y = parseFloat(particle.style.top);

    const animate = () => {
      vy += gravity;
      x += vx;
      y += vy;

      particle.style.left = x + '%';
      particle.style.top = y + '%';
      particle.style.transform = `rotate(${x * 10}deg)`;

      if (y < 100) {
        requestAnimationFrame(animate);
      } else {
        particle.remove();
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Cleanup observers
   */
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Add ripple animation to stylesheet dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Create singleton instance
const motionController = new MotionController();

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.MotionController = motionController;
}

export default motionController;
