/**
 * HIGH CALIBER BOOTS — Reusable Product Grid & Luxury Card Engine
 * 
 * Renders rich, interactive, Shopify-ready product cards with:
 * - Instant Size-Add Pill Drawer directly on the card
 * - In-Page Quick View Modal with technical specifications & gallery
 * - Dual-angle hover image inspection (Cross-fade)
 * - Star ratings and verified buyer count
 * - Faceted client-side filtering and sorting
 */

import { fetchCollection } from './shopify.js';
import { cart } from './cart.js';
import { getMockProductById } from './mock-products.js';

export function getRelativeBasePath() {
  const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return './';
  if (parts.length === 1) return '../';
  if (parts.length === 2) return '../../';
  return './';
}

export function resolveImageUrl(src, basePath = '') {
  if (!src) return `${basePath}assets/images/branding/monogram.svg`;
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:')) {
    return src;
  }
  return `${basePath}${src.replace(/^\/+/, '')}`;
}

export function formatMoney(amount) {
  if (typeof amount !== 'number') return '$0.00';
  return `$${amount.toFixed(2)}`;
}

/**
 * Generates HTML string for a luxury product card with instant size selector
 */
export function renderProductCard(product, basePath = '') {
  if (!basePath) basePath = getRelativeBasePath();
  const primaryImg = resolveImageUrl(product.images?.[0], basePath);
  const secondaryImg = product.images?.[1] ? resolveImageUrl(product.images[1], basePath) : null;
  const productUrl = `${basePath}product/?handle=${product.handle}`;

  const hasComparePrice = Boolean(product.compareAtPrice && product.compareAtPrice > product.price);
  const savings = hasComparePrice ? Math.round(product.compareAtPrice - product.price) : 0;
  
  const badgeHTML = product.badge ? `
    <span class="product-badge product-badge-${product.badge.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
      ${product.badge}
    </span>
  ` : (hasComparePrice ? `<span class="product-badge product-badge-sale">SAVE $${savings}</span>` : '');

  // Render quick size pills for instant add
  const variants = product.variants || [];
  const quickSizes = variants.slice(0, 5);
  const sizePillsHTML = quickSizes.length > 0 ? `
    <div class="card-quick-sizes-wrap">
      <span class="quick-size-label">QUICK SIZE:</span>
      <div class="card-quick-sizes-pills">
        ${quickSizes.map(v => `
          <button 
            type="button" 
            class="card-size-btn ${!v.available ? 'is-out' : ''}" 
            data-product-id="${product.id}"
            data-variant-id="${v.id}"
            data-variant-title="${v.title}"
            ${!v.available ? 'disabled' : ''}
            title="Quick add size ${v.title}"
          >
            ${v.title.replace(' (Wide)', 'W').replace(' (FR)', '')}
          </button>
        `).join('')}
      </div>
    </div>
  ` : '';

  const ratingVal = product.rating || 4.9;
  const reviewsVal = product.reviewCount || 38;

  return `
    <article class="product-card" data-product-id="${product.id}" data-handle="${product.handle}">
      <div class="product-card-media">
        <a href="${productUrl}" class="product-card-image-wrap" aria-label="View details for ${product.title}">
          <img 
            src="${primaryImg}" 
            alt="${product.title}" 
            class="product-image primary-img" 
            loading="lazy"
            referrerpolicy="no-referrer"
          />
          ${secondaryImg ? `
            <img 
              src="${secondaryImg}" 
              alt="${product.title} alternate view" 
              class="product-image secondary-img" 
              loading="lazy"
              referrerpolicy="no-referrer"
            />
          ` : ''}
        </a>
        ${badgeHTML}
        
        <!-- Action Overlay: Quick View & Full Details -->
        <div class="card-actions-overlay">
          <button 
            type="button" 
            class="card-action-btn card-quick-view-btn" 
            data-product-id="${product.id}"
            aria-label="Quick inspect ${product.title}"
          >
            QUICK VIEW
          </button>
          <a href="${productUrl}" class="card-action-btn card-view-details-btn">
            FULL DETAILS
          </a>
        </div>
      </div>

      <div class="product-card-content">
        <div class="product-card-meta">
          <span class="product-vendor">${product.vendor || 'High Caliber Select'}</span>
          ${product.toeShape ? `<span class="meta-sep" aria-hidden="true">·</span><span class="product-spec">${product.toeShape}</span>` : ''}
        </div>

        <h3 class="product-card-title">
          <a href="${productUrl}">${product.title}</a>
        </h3>

        <div class="product-card-rating">
          <span class="star-icons" aria-hidden="true">★★★★★</span>
          <span class="rating-number tabular-nums">${ratingVal.toFixed(1)}</span>
          <span class="rating-count">(${reviewsVal})</span>
        </div>

        <div class="product-card-pricing">
          <span class="product-price tabular-nums">${formatMoney(product.price)}</span>
          ${hasComparePrice ? `
            <span class="product-compare-price tabular-nums">${formatMoney(product.compareAtPrice)}</span>
          ` : ''}
        </div>

        ${sizePillsHTML}
      </div>
    </article>
  `;
}

/**
 * Collection Page Controller
 */
export class CollectionManager {
  constructor(collectionHandle, options = {}) {
    this.handle = collectionHandle;
    this.gridEl = document.getElementById(options.gridId || 'productGrid');
    this.countEl = document.getElementById(options.countId || 'productCount');
    this.filtersForm = document.getElementById(options.filterFormId || 'collectionFilters');
    this.sortSelect = document.getElementById(options.sortSelectId || 'collectionSort');
    this.allProducts = [];
    this.filteredProducts = [];
    this.basePath = getRelativeBasePath();
    
    this.init();
  }

  async init() {
    if (!this.gridEl) return;

    this.gridEl.innerHTML = `
      <div class="collection-loading-state">
        <div class="loading-spinner"></div>
        <p>Accessing High Caliber handcrafted inventory...</p>
      </div>
    `;

    try {
      const collection = await fetchCollection(this.handle);
      this.allProducts = collection.products || [];
      this.filteredProducts = [...this.allProducts];
      
      this.populateDynamicFilters();
      this.bindEvents();
      this.applyFiltersAndSort();
    } catch (err) {
      console.error('[High Caliber Products] Error loading collection:', err);
      this.gridEl.innerHTML = `
        <div class="collection-empty-state">
          <p>Failed to load collection products. Please check connection.</p>
        </div>
      `;
    }
  }

  bindEvents() {
    if (this.sortSelect) {
      this.sortSelect.addEventListener('change', () => this.applyFiltersAndSort());
    }

    if (this.filtersForm) {
      this.filtersForm.addEventListener('change', () => this.applyFiltersAndSort());
      const resetBtn = this.filtersForm.querySelector('[data-reset-filters]');
      if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.filtersForm.reset();
          this.applyFiltersAndSort();
        });
      }
    }

    // Quick Size Add delegation
    this.gridEl.addEventListener('click', (e) => {
      const sizeBtn = e.target.closest('.card-size-btn');
      if (sizeBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pId = sizeBtn.getAttribute('data-product-id');
        const vId = sizeBtn.getAttribute('data-variant-id');
        const vTitle = sizeBtn.getAttribute('data-variant-title');
        const product = this.allProducts.find(p => p.id === pId) || getMockProductById(pId);
        if (product) {
          cart.addItem(product, vId, 1, vTitle);
        }
        return;
      }

      // Quick View button delegation
      const qvBtn = e.target.closest('.card-quick-view-btn');
      if (qvBtn) {
        e.preventDefault();
        e.stopPropagation();
        const pId = qvBtn.getAttribute('data-product-id');
        const product = this.allProducts.find(p => p.id === pId) || getMockProductById(pId);
        if (product) {
          openQuickViewModal(product, this.basePath);
        }
      }
    });
  }

  populateDynamicFilters() {
    const toeFilter = document.getElementById('filterToeShape');
    if (toeFilter) {
      const toeShapes = [...new Set(this.allProducts.map(p => p.toeShape).filter(Boolean))];
      toeShapes.forEach(toe => {
        const opt = document.createElement('option');
        opt.value = toe;
        opt.textContent = toe;
        toeFilter.appendChild(opt);
      });
    }

    const materialFilter = document.getElementById('filterMaterial');
    if (materialFilter) {
      const materials = [...new Set(this.allProducts.map(p => p.material).filter(Boolean))];
      materials.forEach(mat => {
        const opt = document.createElement('option');
        opt.value = mat;
        opt.textContent = mat;
        materialFilter.appendChild(opt);
      });
    }
  }

  applyFiltersAndSort() {
    let result = [...this.allProducts];

    if (this.filtersForm) {
      const formData = new FormData(this.filtersForm);
      const categoryVal = formData.get('category');
      const toeVal = formData.get('toeShape');
      const materialVal = formData.get('material');
      const priceVal = formData.get('priceRange');

      if (categoryVal && categoryVal !== 'all') {
        result = result.filter(p => p.collection === categoryVal || (p.collections && p.collections.includes(categoryVal)));
      }

      if (toeVal && toeVal !== 'all') {
        result = result.filter(p => p.toeShape === toeVal);
      }

      if (materialVal && materialVal !== 'all') {
        result = result.filter(p => p.material && p.material.toLowerCase().includes(materialVal.toLowerCase()));
      }

      if (priceVal && priceVal !== 'all') {
        if (priceVal === 'under-300' || priceVal === 'under-250') {
          result = result.filter(p => p.price < 300);
        } else if (priceVal === '300-500' || priceVal === '350-450') {
          result = result.filter(p => p.price >= 300 && p.price <= 500);
        } else if (priceVal === 'over-500' || priceVal === 'over-250') {
          result = result.filter(p => p.price > 500 || p.price > 250);
        }
      }
    }

    // Sort
    const sortVal = this.sortSelect?.value || 'featured';
    if (sortVal === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortVal === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortVal === 'title-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortVal === 'title-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    this.filteredProducts = result;
    this.render();
  }

  render() {
    if (this.countEl) {
      const len = this.filteredProducts.length;
      this.countEl.textContent = `${len} ${len === 1 ? 'style' : 'styles'}`;
    }

    if (this.filteredProducts.length === 0) {
      this.gridEl.innerHTML = `
        <div class="collection-empty-state">
          <div class="empty-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C7A477" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <h3 class="empty-title">No matching styles found</h3>
          <p class="empty-desc">Try clearing or adjusting your filters to see all available High Caliber pairs.</p>
          <button type="button" class="btn btn-secondary" id="resetEmptyFiltersBtn">RESET FILTERS</button>
        </div>
      `;
      const btn = this.gridEl.querySelector('#resetEmptyFiltersBtn');
      if (btn && this.filtersForm) {
        btn.addEventListener('click', () => {
          this.filtersForm.reset();
          this.applyFiltersAndSort();
        });
      }
      return;
    }

    this.gridEl.innerHTML = this.filteredProducts
      .map(p => renderProductCard(p, this.basePath))
      .join('');
  }
}

/**
 * In-Page Quick View Modal Controller
 */
export function openQuickViewModal(product, basePath = '') {
  if (!basePath) basePath = getRelativeBasePath();
  const existing = document.getElementById('productQuickViewModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'productQuickViewModal';
  modal.className = 'modal-backdrop is-open qv-modal';
  
  const rawImages = product.images && product.images.length > 0 ? product.images : ['assets/images/branding/monogram.svg'];
  const images = rawImages.map(img => resolveImageUrl(img, basePath));
  const variants = product.variants || [];
  let selectedVariant = variants[0] || { id: product.id + '_default', title: 'Standard', available: true, stock: 5 };
  let qty = 1;

  modal.innerHTML = `
    <div class="modal-card qv-modal-card">
      <div class="qv-modal-header">
        <span class="qv-vendor">${product.vendor || 'HIGH CALIBER SELECT'}</span>
        <button type="button" class="modal-close-btn" id="closeQvBtn" aria-label="Close modal">&times;</button>
      </div>

      <div class="qv-modal-body">
        <div class="qv-gallery">
          <div class="qv-main-image-wrap">
            <img src="${images[0]}" alt="${product.title}" id="qvMainImg" class="qv-main-img" />
          </div>
          ${images.length > 1 ? `
            <div class="qv-thumbs">
              ${images.map((img, i) => `
                <button type="button" class="qv-thumb-btn ${i === 0 ? 'is-active' : ''}" data-idx="${i}" aria-label="View angle ${i + 1}">
                  <img src="${img}" alt="" />
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>

        <div class="qv-details">
          <div class="qv-rating-strip">
            <span class="star-icons">★★★★★</span>
            <span class="rating-text">${product.rating || 4.9} rating · ${product.reviewCount || 38} verified reviews</span>
          </div>

          <h2 class="qv-title">${product.title}</h2>
          <div class="qv-price-row">
            <span class="qv-price tabular-nums">${formatMoney(product.price)}</span>
            ${product.compareAtPrice ? `<span class="qv-compare tabular-nums">${formatMoney(product.compareAtPrice)}</span>` : ''}
            <span class="qv-in-stock-tag">✓ In Stock &amp; Insured</span>
          </div>

          <p class="qv-desc">${product.description || ''}</p>

          <div class="qv-specs-mini">
            ${product.material ? `<div><strong>Leather:</strong> <span>${product.material}</span></div>` : ''}
            ${product.toeShape ? `<div><strong>Toe:</strong> <span>${product.toeShape}</span></div>` : ''}
            ${product.heel ? `<div><strong>Heel:</strong> <span>${product.heel}</span></div>` : ''}
            ${product.sole ? `<div><strong>Outsole:</strong> <span>${product.sole}</span></div>` : ''}
            ${product.safetyClassification ? `<div><strong>Safety Standard:</strong> <span>${product.safetyClassification}</span></div>` : ''}
          </div>

          ${variants.length > 0 ? `
            <div class="qv-size-group">
              <div class="qv-size-header">
                <label class="qv-label">SELECT SIZE &amp; WIDTH</label>
                <span class="qv-fit-hint">Standard Western Fit</span>
              </div>
              <div class="qv-size-pills">
                ${variants.map((v, idx) => `
                  <button 
                    type="button" 
                    class="qv-size-pill ${idx === 0 ? 'is-selected' : ''} ${!v.available ? 'is-out' : ''}" 
                    data-id="${v.id}"
                    data-title="${v.title}"
                    ${!v.available ? 'disabled' : ''}
                  >
                    ${v.title}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div class="qv-actions">
            <div class="quantity-stepper">
              <button type="button" class="qty-btn" id="qvQtyDec" aria-label="Decrease quantity">−</button>
              <span class="qty-val tabular-nums" id="qvQtyVal">1</span>
              <button type="button" class="qty-btn" id="qvQtyInc" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn btn-primary" id="qvAddToCartBtn" style="flex-grow: 1;">
              ADD TO BAG
            </button>
          </div>

          <div class="qv-perks-list">
            <div class="qv-perk-item">✓ Complimentary Insured Ground Shipping on Orders $150+</div>
            <div class="qv-perk-item">✓ 30-Day Risk-Free Returns &amp; Exchanges</div>
            <div class="qv-perk-item">✓ Goodyear Welt Recraftable Construction</div>
          </div>

          <div class="qv-footer-links">
            <a href="${basePath}product/?handle=${product.handle}" class="qv-full-link">
              View Full Product Specifications &amp; Artisan Notes &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const closeModal = () => modal.remove();
  modal.querySelector('#closeQvBtn').addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Gallery thumb clicks
  const mainImg = modal.querySelector('#qvMainImg');
  modal.querySelectorAll('.qv-thumb-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.qv-thumb-btn').forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const idx = parseInt(btn.getAttribute('data-idx'), 10);
      mainImg.src = images[idx];
    });
  });

  // Size selections
  modal.querySelectorAll('.qv-size-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      modal.querySelectorAll('.qv-size-pill').forEach(p => p.classList.remove('is-selected'));
      pill.classList.add('is-selected');
      const vId = pill.getAttribute('data-id');
      selectedVariant = variants.find(v => v.id === vId) || selectedVariant;
    });
  });

  // Quantity stepper
  const qtyValEl = modal.querySelector('#qvQtyVal');
  modal.querySelector('#qvQtyDec').addEventListener('click', () => {
    if (qty > 1) {
      qty--;
      qtyValEl.textContent = qty;
    }
  });
  modal.querySelector('#qvQtyInc').addEventListener('click', () => {
    qty++;
    qtyValEl.textContent = qty;
  });

  // Add to cart
  modal.querySelector('#qvAddToCartBtn').addEventListener('click', () => {
    cart.addItem(product, selectedVariant.id, qty, selectedVariant.title);
    closeModal();
  });
}

export function loadCollection(handle, options = {}) {
  return new CollectionManager(handle, options);
}

window.HighCaliberProducts = {
  renderProductCard,
  loadCollection,
  openQuickViewModal,
  formatMoney,
  getRelativeBasePath,
  resolveImageUrl
};
