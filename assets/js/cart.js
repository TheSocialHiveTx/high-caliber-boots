/**
 * HIGH CALIBER BOOTS — Shopping Cart Architecture & Slide-Over Drawer
 * 
 * Manages client-side cart state with localStorage persistence and 
 * prepares line payloads for Shopify Storefront API checkout handoff.
 * 
 * Features:
 * - Dynamic Free Shipping Progress Bar ($150 threshold)
 * - Working Promo Code Engine (e.g. 'CALIBER10' for 10% off)
 * - Order / Gift Notes persistence
 * - Quantity stepper and instant recalculation
 */

import { isShopifyConfigured, createCart } from './shopify.js';

const STORAGE_KEY = 'highcaliber_cart_v2';
const FREE_SHIPPING_THRESHOLD = 150.00;

class CartManager {
  constructor() {
    this.items = this.loadCart();
    this.discountCode = localStorage.getItem('highcaliber_discount_code') || '';
    this.discountPercent = parseFloat(localStorage.getItem('highcaliber_discount_percent') || '0');
    this.orderNote = localStorage.getItem('highcaliber_order_note') || '';
    this.isOpen = false;
    this.drawerEl = null;
    this.overlayEl = null;
    this.init();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('[High Caliber Cart] Could not parse stored cart:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      localStorage.setItem('highcaliber_discount_code', this.discountCode);
      localStorage.setItem('highcaliber_discount_percent', this.discountPercent.toString());
      localStorage.setItem('highcaliber_order_note', this.orderNote);
    } catch (e) {
      console.warn('[High Caliber Cart] Could not save cart:', e);
    }
    this.updateBadges();
    this.render();
  }

  init() {
    this.mountDrawer();
    this.updateBadges();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  mountDrawer() {
    if (document.getElementById('cartDrawer')) return;

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.className = 'cart-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

    // Drawer Container
    const drawer = document.createElement('aside');
    drawer.id = 'cartDrawer';
    drawer.className = 'cart-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Shopping Cart');
    drawer.setAttribute('aria-hidden', 'true');

    drawer.innerHTML = `
      <div class="cart-header">
        <div class="cart-title-row">
          <span class="cart-monogram-icon">★</span>
          <h2 class="cart-title">YOUR CART</h2>
          <span class="cart-count-badge" id="cartHeaderCount">(0)</span>
        </div>
        <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Dynamic Free Shipping Progress Bar -->
      <div class="cart-shipping-meter" id="cartShippingMeter">
        <div class="shipping-meter-text" id="shippingMeterText">
          Add $150.00 for complimentary insured freight
        </div>
        <div class="shipping-meter-bar">
          <div class="shipping-meter-fill" id="shippingMeterFill" style="width: 0%;"></div>
        </div>
      </div>

      <!-- Items List -->
      <div class="cart-items" id="cartItemsList" tabindex="0">
        <!-- Rendered dynamically -->
      </div>

      <!-- Footer -->
      <div class="cart-footer" id="cartFooter">
        
        <!-- Promo Code Accordion / Input -->
        <div class="cart-promo-row">
          <div class="cart-promo-input-wrap">
            <input 
              type="text" 
              id="cartPromoInput" 
              class="cart-promo-input" 
              placeholder="Promo code (e.g. CALIBER10)" 
              value="${this.discountCode}" 
            />
            <button type="button" class="cart-promo-apply-btn" id="cartPromoApplyBtn">APPLY</button>
          </div>
          <div class="cart-promo-status" id="cartPromoStatus"></div>
        </div>

        <!-- Subtotal Rows -->
        <div class="cart-subtotal-breakdown">
          <div class="cart-subtotal-row">
            <span class="subtotal-label">Subtotal</span>
            <span class="subtotal-value tabular-nums" id="cartSubtotalRaw">$0.00</span>
          </div>

          <div class="cart-discount-row" id="cartDiscountRow" style="display: none;">
            <span class="discount-label">Discount (<span id="cartDiscountLabel"></span>)</span>
            <span class="discount-value tabular-nums" id="cartDiscountVal">-$0.00</span>
          </div>

          <div class="cart-final-total-row">
            <span class="total-label">Estimated Total</span>
            <span class="total-value tabular-nums" id="cartFinalTotal">$0.00</span>
          </div>
        </div>

        <p class="cart-tax-notice">Taxes, freight &amp; duties calculated at checkout.</p>
        
        <button type="button" class="btn btn-primary btn-checkout" id="cartCheckoutBtn">
          PROCEED TO SECURE CHECKOUT
        </button>

        <div class="cart-trust-ribbon">
          <span class="trust-badge-item">🔒 Shopify 256-Bit SSL</span>
          <span class="trust-badge-item">★ 30-Day Exchanges</span>
          <span class="trust-badge-item">🔨 Handcrafted</span>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;

    // Attach listeners
    drawer.querySelector('#cartCloseBtn').addEventListener('click', () => this.close());
    drawer.querySelector('#cartCheckoutBtn').addEventListener('click', () => this.handleCheckout());
    
    // Promo apply listener
    const promoBtn = drawer.querySelector('#cartPromoApplyBtn');
    const promoInput = drawer.querySelector('#cartPromoInput');
    promoBtn.addEventListener('click', () => {
      this.applyPromoCode(promoInput.value.trim());
    });
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyPromoCode(promoInput.value.trim());
      }
    });

    // Hook up any [data-cart-open] buttons on the page
    document.querySelectorAll('[data-cart-open], .cart-trigger-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });
  }

  applyPromoCode(code) {
    const clean = code.toUpperCase();
    const statusEl = this.drawerEl.querySelector('#cartPromoStatus');
    if (!clean) {
      this.discountCode = '';
      this.discountPercent = 0;
      if (statusEl) statusEl.textContent = '';
      this.saveCart();
      return;
    }

    if (clean === 'CALIBER10' || clean === 'WESTERN10') {
      this.discountCode = clean;
      this.discountPercent = 0.10;
      if (statusEl) {
        statusEl.className = 'cart-promo-status is-success';
        statusEl.textContent = `Promo code "${clean}" applied (10% off).`;
      }
      this.saveCart();
      this.showToast('10% discount applied to your order.');
    } else if (clean === 'FIRSTPAIR' || clean === 'WELCOME') {
      this.discountCode = clean;
      this.discountPercent = 0.15;
      if (statusEl) {
        statusEl.className = 'cart-promo-status is-success';
        statusEl.textContent = `Promo code "${clean}" applied (15% off).`;
      }
      this.saveCart();
      this.showToast('15% discount applied to your order.');
    } else {
      if (statusEl) {
        statusEl.className = 'cart-promo-status is-error';
        statusEl.textContent = `Code "${clean}" is not recognized. Try "CALIBER10".`;
      }
    }
  }

  addItem(product, variantId, quantity = 1, variantTitle = null) {
    const variant = product.variants?.find(v => v.id === variantId) || {
      id: variantId || (product.id + '_default'),
      title: variantTitle || 'Standard',
      price: product.price
    };

    const existingIndex = this.items.findIndex(
      item => item.productId === product.id && item.variantId === variant.id
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        productId: product.id,
        variantId: variant.id,
        title: product.title,
        handle: product.handle,
        variantTitle: variant.title,
        price: variant.price || product.price,
        image: product.images?.[0] || 'assets/images/branding/monogram.svg',
        quantity: quantity
      });
    }

    this.saveCart();
    this.open();
    this.showToast(`Added "${product.title} (${variant.title})" to bag.`);
  }

  updateQuantity(variantId, newQty) {
    const idx = this.items.findIndex(item => item.variantId === variantId);
    if (idx === -1) return;

    if (newQty <= 0) {
      this.items.splice(idx, 1);
    } else {
      this.items[idx].quantity = newQty;
    }
    this.saveCart();
  }

  removeItem(variantId) {
    this.items = this.items.filter(item => item.variantId !== variantId);
    this.saveCart();
  }

  getRawSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscountAmount() {
    const sub = this.getRawSubtotal();
    return sub * this.discountPercent;
  }

  getFinalTotal() {
    return Math.max(0, this.getRawSubtotal() - this.getDiscountAmount());
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  open() {
    this.isOpen = true;
    this.mountDrawer();
    this.render();
    if (this.drawerEl) {
      this.drawerEl.classList.add('is-open');
      this.drawerEl.setAttribute('aria-hidden', 'false');
    }
    if (this.overlayEl) {
      this.overlayEl.classList.add('is-open');
      this.overlayEl.setAttribute('aria-hidden', 'false');
    }
    document.body.classList.add('cart-open-scroll-lock');
  }

  close() {
    this.isOpen = false;
    if (this.drawerEl) {
      this.drawerEl.classList.remove('is-open');
      this.drawerEl.setAttribute('aria-hidden', 'true');
    }
    if (this.overlayEl) {
      this.overlayEl.classList.remove('is-open');
      this.overlayEl.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('cart-open-scroll-lock');
  }

  updateBadges() {
    const count = this.getTotalCount();
    document.querySelectorAll('.cart-badge, [data-cart-count]').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    const headerCount = document.getElementById('cartHeaderCount');
    if (headerCount) {
      headerCount.textContent = `(${count})`;
    }
  }

  render() {
    if (!this.drawerEl) return;
    const listEl = this.drawerEl.querySelector('#cartItemsList');
    const footerEl = this.drawerEl.querySelector('#cartFooter');
    const rawSubtotalEl = this.drawerEl.querySelector('#cartSubtotalRaw');
    const discountRowEl = this.drawerEl.querySelector('#cartDiscountRow');
    const discountLabelEl = this.drawerEl.querySelector('#cartDiscountLabel');
    const discountValEl = this.drawerEl.querySelector('#cartDiscountVal');
    const finalTotalEl = this.drawerEl.querySelector('#cartFinalTotal');
    const meterBarEl = this.drawerEl.querySelector('#shippingMeterFill');
    const meterTextEl = this.drawerEl.querySelector('#shippingMeterText');

    if (!listEl) return;

    // Update Shipping Meter
    const rawSubtotal = this.getRawSubtotal();
    if (rawSubtotal >= FREE_SHIPPING_THRESHOLD) {
      meterBarEl.style.width = '100%';
      meterTextEl.innerHTML = '★ <strong>Complimentary Insured Ground Freight Unlocked!</strong>';
    } else {
      const remaining = (FREE_SHIPPING_THRESHOLD - rawSubtotal).toFixed(2);
      const pct = Math.min(100, Math.round((rawSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
      meterBarEl.style.width = `${pct}%`;
      meterTextEl.innerHTML = `Add <strong>$${remaining}</strong> to unlock complimentary insured freight`;
    }

    if (this.items.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C7A477" stroke-width="1.5">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 class="cart-empty-title">Your cart is empty</h3>
          <p class="cart-empty-text">Your selected Western footwear, gear, and apparel will appear here.</p>
          <a href="${this.resolveBasePath()}shop/" class="btn btn-secondary btn-shop-empty">
            EXPLORE THE STORE
          </a>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (footerEl) footerEl.style.display = 'block';
    
    // Pricing Breakdown
    rawSubtotalEl.textContent = `$${rawSubtotal.toFixed(2)}`;
    
    if (this.discountPercent > 0) {
      discountRowEl.style.display = 'flex';
      discountLabelEl.textContent = `${this.discountCode} - ${(this.discountPercent * 100)}%`;
      discountValEl.textContent = `-$${this.getDiscountAmount().toFixed(2)}`;
    } else {
      discountRowEl.style.display = 'none';
    }

    finalTotalEl.textContent = `$${this.getFinalTotal().toFixed(2)}`;

    // Helper for image resolution
    const resolveItemImg = (img) => {
      if (!img) return `${this.resolveBasePath()}assets/images/branding/monogram.svg`;
      if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('//') || img.startsWith('data:')) {
        return img;
      }
      return `${this.resolveBasePath()}${img.replace(/^\/+/, '')}`;
    };

    // Render Line Items
    listEl.innerHTML = this.items.map(item => `
      <div class="cart-item" data-variant-id="${item.variantId}">
        <a href="${this.resolveBasePath()}product/?handle=${item.handle}" class="cart-item-image-link">
          <img src="${resolveItemImg(item.image)}" alt="${item.title}" class="cart-item-image" loading="lazy" />
        </a>
        <div class="cart-item-info">
          <a href="${this.resolveBasePath()}product/?handle=${item.handle}" class="cart-item-title">
            ${item.title}
          </a>
          <div class="cart-item-variant">Size: <strong>${item.variantTitle || 'Standard'}</strong></div>
          <div class="cart-item-price tabular-nums">$${item.price.toFixed(2)}</div>
          
          <div class="cart-item-controls">
            <div class="quantity-stepper">
              <button type="button" class="qty-btn qty-decrease" aria-label="Decrease quantity" data-id="${item.variantId}">−</button>
              <span class="qty-val tabular-nums">${item.quantity}</span>
              <button type="button" class="qty-btn qty-increase" aria-label="Increase quantity" data-id="${item.variantId}">+</button>
            </div>
            <button type="button" class="cart-remove-btn" data-id="${item.variantId}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach listeners
    listEl.querySelectorAll('.qty-decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = this.items.find(i => i.variantId === id);
        if (item) this.updateQuantity(id, item.quantity - 1);
      });
    });

    listEl.querySelectorAll('.qty-increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const item = this.items.find(i => i.variantId === id);
        if (item) this.updateQuantity(id, item.quantity + 1);
      });
    });

    listEl.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        this.removeItem(id);
      });
    });
  }

  async handleCheckout() {
    if (this.items.length === 0) return;

    if (isShopifyConfigured()) {
      const checkoutBtn = document.getElementById('cartCheckoutBtn');
      if (checkoutBtn) checkoutBtn.textContent = 'CONNECTING TO SHOPIFY CHECKOUT...';
      const cart = await createCart(this.items);
      if (cart?.checkoutUrl) {
        window.location.href = cart.checkoutUrl;
        return;
      }
    }

    this.showDemoCheckoutModal();
  }

  showDemoCheckoutModal() {
    const existing = document.getElementById('demoCheckoutModal');
    if (existing) existing.remove();

    const subtotal = this.getFinalTotal().toFixed(2);
    const count = this.getTotalCount();

    const modal = document.createElement('div');
    modal.id = 'demoCheckoutModal';
    modal.className = 'modal-backdrop is-open';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <div class="modal-title-lockup">
            <span class="modal-kicker">SHOPIFY STOREFRONT API HANDOFF</span>
            <h3 class="modal-title">Cart Payload Ready for Checkout</h3>
          </div>
          <button type="button" class="modal-close-btn" id="closeDemoModal">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-desc">
            This front-end is configured for <strong>Shopify Storefront API</strong> headless checkout.
            In production, clicking checkout transmits these <strong>${count} items ($${subtotal})</strong> to Shopify's <code>cartCreate</code> GraphQL mutation and routes directly to your secure Shopify checkout.
          </p>
          <div class="modal-payload-preview">
            <pre><code>${JSON.stringify({
              itemsCount: count,
              appliedDiscount: this.discountCode ? `${this.discountCode} (${this.discountPercent * 100}%)` : 'None',
              finalTotalUSD: subtotal,
              lines: this.items.map(i => ({
                merchandiseId: i.variantId,
                title: i.title,
                size: i.variantTitle,
                quantity: i.quantity,
                unitPrice: i.price
              }))
            }, null, 2)}</code></pre>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" id="ackDemoModal">CONTINUE SHOPPING</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeModal = () => modal.remove();
    modal.querySelector('#closeDemoModal').addEventListener('click', closeModal);
    modal.querySelector('#ackDemoModal').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  showToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  resolveBasePath() {
    const path = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 0) return './';
    if (parts.length === 1) return '../';
    if (parts.length === 2) return '../../';
    return './';
  }
}

export const cart = new CartManager();
window.HighCaliberCart = cart;
