/**
 * HIGH CALIBER BOOTS — Global Interactive Script Controller
 * 
 * Handles:
 * - Top Announcement Marquee Ticker
 * - Sticky Header Scroll & Western Corner Accents
 * - Mobile Navigation Drawer with Accordion Submenus
 * - Global Instant Search Modal
 * - Interactive Boot Anatomy & Craftsmanship Inspector
 * - Newsletter Capture
 */

import { searchProducts, isShopifyConfigured, productLink, SITE_ROOT, FALLBACK_IMAGE, formatMoney } from './shopify-api.js';

document.addEventListener('DOMContentLoaded', () => {
  initAnnouncementBar();
  initHeaderScroll();
  initMobileNavigation();
  initSearchModal();
  initAccordions();
  initNewsletterForms();
  initBootAnatomyInspector();
  highlightActiveNavLinks();
});

/**
 * Top Announcement Bar Ticker
 */
function initAnnouncementBar() {
  const bar = document.getElementById('announcementBar');
  if (!bar) return;

  const messages = [
    "COMPLIMENTARY INSURED FREIGHT ON ORDERS OVER $150",
    "BENCHCRAFTED EXOTIC LEATHERS · HAND-PEGGED ARCHES",
    "HASSLE-FREE 30-DAY DOMESTIC BOOT EXCHANGES",
    "ENTER CODE 'CALIBER10' AT CHECKOUT FOR 10% OFF FIRST PAIR"
  ];

  let idx = 0;
  const textEl = bar.querySelector('.announcement-text');
  if (!textEl) return;

  setInterval(() => {
    idx = (idx + 1) % messages.length;
    textEl.style.opacity = '0';
    setTimeout(() => {
      textEl.textContent = messages[idx];
      textEl.style.opacity = '1';
    }, 250);
  }, 4500);
}

/**
 * Sticky Header Scroll Behavior
 */
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 30) {
      header.classList.add('header-scrolled');
    } else {
      header.classList.remove('header-scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/**
 * Mobile Navigation Drawer
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const closeBtn = document.getElementById('mobileNavClose');
  const overlay = document.getElementById('mobileNavOverlay');

  if (!toggleBtn || !drawer) return;

  const openDrawer = () => {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    if (overlay) {
      overlay.classList.add('is-open');
      overlay.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('nav-open-scroll-lock');
  };

  const closeDrawer = () => {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    if (overlay) {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('nav-open-scroll-lock');
  };

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const isOpen = drawer.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  drawer.querySelectorAll('.mobile-nav-accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = trigger.closest('.mobile-nav-item');
      if (parent) {
        parent.classList.toggle('is-expanded');
      }
    });
  });
}

/**
 * Global Search Modal
 */
function initSearchModal() {
  const searchTriggers = document.querySelectorAll('[data-search-trigger]');
  if (searchTriggers.length === 0) return;

  let modal = document.getElementById('globalSearchModal');

  const suggestionsHTML = `
    <div class="search-suggestions">
      <span class="suggestion-label">POPULAR SEARCHES:</span>
      <div class="suggestion-chips">
        <button type="button" class="search-chip" data-term="boots">Boots</button>
        <button type="button" class="search-chip" data-term="jacket">Jackets</button>
        <button type="button" class="search-chip" data-term="belt">Belts</button>
        <button type="button" class="search-chip" data-term="cologne">Cologne</button>
        <button type="button" class="search-chip" data-term="glasses">Glasses</button>
      </div>
    </div>
  `;

  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'globalSearchModal';
    modal.className = 'search-modal-backdrop';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Search Products');
    modal.innerHTML = `
      <div class="search-modal-card">
        <div class="search-input-wrap">
          <svg class="search-input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            id="globalSearchInput"
            class="search-input"
            placeholder="Search boots, clothing, accessories..."
            autocomplete="off"
            aria-label="Search High Caliber"
          />
          <button type="button" class="search-close-btn" id="closeSearchModalBtn" aria-label="Close search">&times;</button>
        </div>
        <div class="search-results-container" id="searchResultsContainer" aria-live="polite">
          ${suggestionsHTML}
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const input = modal.querySelector('#globalSearchInput');
  const resultsContainer = modal.querySelector('#searchResultsContainer');
  const closeBtn = modal.querySelector('#closeSearchModalBtn');

  const openSearch = () => {
    modal.classList.add('is-open');
    document.body.classList.add('search-open-scroll-lock');
    setTimeout(() => input.focus(), 80);
  };

  const closeSearch = () => {
    modal.classList.remove('is-open');
    document.body.classList.remove('search-open-scroll-lock');
    input.value = '';
    resultsContainer.innerHTML = suggestionsHTML;
  };

  searchTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  });

  closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeSearch();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeSearch();
  });

  // Delegated so the chips keep working after results are re-rendered
  resultsContainer.addEventListener('click', (e) => {
    const chip = e.target.closest('.search-chip');
    if (!chip) return;
    input.value = chip.getAttribute('data-term');
    input.dispatchEvent(new Event('input'));
  });

  // Live catalog search through the Shopify Storefront API (debounced)
  let timer = null;
  let requestId = 0;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const query = input.value.trim();

    if (!query) {
      resultsContainer.innerHTML = suggestionsHTML;
      return;
    }

    if (!isShopifyConfigured()) {
      resultsContainer.innerHTML = `
        <div class="search-no-results">
          <p>Search will be available as soon as the online store is connected.</p>
          <a href="${SITE_ROOT}contact/" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">CONTACT US</a>
        </div>
      `;
      return;
    }

    timer = setTimeout(async () => {
      const myRequest = ++requestId;
      resultsContainer.innerHTML = `<div class="search-no-results"><p>Searching...</p></div>`;
      try {
        const matches = await searchProducts(query);
        if (myRequest !== requestId) return; // a newer search superseded this one

        if (matches.length === 0) {
          resultsContainer.innerHTML = `
            <div class="search-no-results">
              <p>No products found matching "<strong>${escapeHtml(query)}</strong>".</p>
              <a href="${SITE_ROOT}shop/" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">VIEW FULL CATALOG</a>
            </div>
          `;
          return;
        }

        resultsContainer.innerHTML = `
          <div class="search-results-list">
            ${matches.map(p => `
              <a href="${productLink(p.handle)}" class="search-result-item">
                <img src="${escapeHtml(p.images[0]?.url || FALLBACK_IMAGE)}" alt="" class="search-result-thumb" />
                <div class="search-result-details">
                  ${p.vendor ? `<span class="search-result-vendor">${escapeHtml(p.vendor)}</span>` : ''}
                  <h4 class="search-result-title">${escapeHtml(p.title)}</h4>
                  <span class="search-result-price tabular-nums">${escapeHtml(formatMoney(p.price, p.currency))}</span>
                </div>
              </a>
            `).join('')}
          </div>
        `;
      } catch (err) {
        if (myRequest !== requestId) return;
        console.warn('[High Caliber Search]', err);
        resultsContainer.innerHTML = `<div class="search-no-results" role="alert"><p>Search is temporarily unavailable. Please try again.</p></div>`;
      }
    }, 250);
  });
}

/**
 * Interactive Boot Anatomy & Craftsmanship Explorer
 */
function initBootAnatomyInspector() {
  const inspector = document.getElementById('bootAnatomyInspector');
  if (!inspector) return;

  const data = {
    vamp: {
      title: "01. GENUINE EXOTIC VAMP",
      spec: "Selected Grade-A Caiman Belly & Wild Hides",
      desc: "Cut exclusively from prime belly leather where scale tiles are tightest and most symmetrical. Naturally resistant to abrasions and buffed to an enduring deep gloss finish.",
      craft: "Hand-stretched over wooden lasts for 72 hours to lock the natural contour."
    },
    shaft: {
      title: "02. 12\" HAND-CORDED SHAFT",
      spec: "Supple French Calfskin with 8-Row Western Stitching",
      desc: "Lined with breathable vegetable-tanned leather to prevent chafing and allow moisture release. Features contrast corded embroidery inspired by vintage 19th-century saddle tooling.",
      craft: "Double-reinforced side seams with antiqued bronze concho pull straps."
    },
    shank: {
      title: "03. LEMONWOOD-PEGGED ARCH",
      spec: "Hygroscopic Lemonwood Pegs & Triple-Ribbed Steel Shank",
      desc: "Traditional lemonwood expands and contracts at the exact same rate as sole leather, eliminating rust and squeaks while providing permanent longitudinal arch support.",
      craft: "Each peg is hand-driven in double staggered rows with brass nail lock points."
    },
    toe: {
      title: "04. HAND-LASTED WIDE SQUARE TOE",
      spec: "Double-Stitch Goodyear Welt & Reinforced Toe Box",
      desc: "Offers generous space for your toes to sit flat in comfort while maintaining a sharp, aggressive Western profile. Double-row welt stitch seals against dirt and trail water.",
      craft: "3/4 Goodyear welt allows infinite resoling by any qualified cobbler."
    },
    heel: {
      title: "05. STACKED LEATHER HEEL",
      spec: "1.5\" Underslung Stockman Heel with Spur Ledge",
      desc: "Built from solid stacked leather lifts rather than hollow synthetic heels. Fitted with an oil-resistant vulcanized rubber top lift and integrated spur ledge.",
      craft: "Secured with internal ringed brass nails through the heel seat."
    }
  };

  const buttons = inspector.querySelectorAll('.anatomy-hotspot-btn, .anatomy-tab-btn');
  const titleEl = inspector.querySelector('#anatomyTitle');
  const specEl = inspector.querySelector('#anatomySpec');
  const descEl = inspector.querySelector('#anatomyDesc');
  const craftEl = inspector.querySelector('#anatomyCraft');

  buttons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const partKey = btn.getAttribute('data-part');
      const item = data[partKey];
      if (!item) return;

      buttons.forEach(b => b.classList.remove('is-active'));
      inspector.querySelectorAll(`[data-part="${partKey}"]`).forEach(b => b.classList.add('is-active'));

      if (titleEl) titleEl.textContent = item.title;
      if (specEl) specEl.textContent = item.spec;
      if (descEl) descEl.textContent = item.desc;
      if (craftEl) craftEl.textContent = item.craft;
    });
  });
}

/**
 * Accordions
 */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const parent = trigger.closest('.accordion-item');
      if (!parent) return;

      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
      parent.classList.toggle('is-open', !isExpanded);
      trigger.setAttribute('aria-expanded', (!isExpanded).toString());
    });
  });
}

/**
 * Newsletter Form Interceptor
 */
function initNewsletterForms() {
  document.querySelectorAll('.newsletter-form, [data-newsletter-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input?.value.trim();
      if (!email) return;

      form.innerHTML = `
        <div class="newsletter-success-msg" role="status">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C7A477" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Welcome to the High Caliber Circle. Your 10% code is <strong>CALIBER10</strong>.</span>
        </div>
      `;
    });
  });
}

/**
 * Highlight active link
 */
function highlightActiveNavLinks() {
  const currentPath = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '') || '/';
  document.querySelectorAll('.desktop-nav a, .mobile-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const normalizedHref = href.replace(/^\.\.\//, '/').replace(/^\.\//, '/');
    if (normalizedHref === currentPath || (normalizedHref !== '/' && currentPath.endsWith(normalizedHref))) {
      link.classList.add('is-active');
    }
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  })[m]);
}
