/**
 * HIGH CALIBER — Sitewide Cart (Shopify Cart API)
 * ---------------------------------------------------------------------------
 * One cart shared by every page (Home, Shop, Boots, Clothing, Accessories).
 *
 *  - State lives in Shopify (Storefront API `cart`); only the cart ID is kept
 *    in localStorage so the cart persists across pages and visits.
 *  - Prices, discounts and totals shown here come straight from Shopify.
 *  - Checkout is Shopify-hosted: we redirect to the cart's `checkoutUrl`.
 *    No payment data ever touches this site.
 *
 * Any element with `[data-cart-open]` or `.cart-trigger-btn` opens the drawer.
 * Other modules call `cart.addVariant(variantId, qty)`.
 * A `hc:cart-updated` event fires on `document` whenever the cart changes.
 */

import { shopifyConfig } from './shopify-config.js';
import {
  isShopifyConfigured,
  ShopifyError,
  escapeHtml,
  formatMoney,
  SITE_ROOT,
  FALLBACK_IMAGE,
  productLink,
  createCart,
  getCart,
  addCartLines,
  updateCartLines,
  removeCartLines,
  updateCartDiscountCodes,
  redirectToCheckout
} from './shopify-api.js';

const CART_ID_KEY = 'highcaliber_shopify_cart_id';

class CartManager {
  constructor() {
    this.cart = null;          // latest Shopify cart (or null)
    this.isOpen = false;
    this.isBusy = false;
    this.drawerEl = null;
    this.overlayEl = null;
    this.lastFocus = null;
    this.queue = Promise.resolve();

    document.addEventListener('DOMContentLoaded', () => this.init());
    if (document.readyState !== 'loading') this.init();
  }

  /* ----------------------------- lifecycle ----------------------------- */

  init() {
    if (this.initialised) return;
    this.initialised = true;

    this.mountDrawer();
    this.updateBadges();

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });

    this.hydrate();
  }

  /** Restore the cart from its persisted ID. */
  async hydrate() {
    const id = this.getStoredId();
    if (!id || !isShopifyConfigured()) return;
    try {
      const cart = await getCart(id);
      if (cart) {
        this.setCart(cart);
      } else {
        this.clearStoredId(); // expired or already checked out
        this.setCart(null);
      }
    } catch (err) {
      console.warn('[High Caliber Cart] Could not restore cart:', err);
    }
  }

  getStoredId() {
    try { return localStorage.getItem(CART_ID_KEY); } catch (e) { return null; }
  }
  storeId(id) {
    try { localStorage.setItem(CART_ID_KEY, id); } catch (e) { /* storage unavailable */ }
  }
  clearStoredId() {
    try { localStorage.removeItem(CART_ID_KEY); } catch (e) { /* storage unavailable */ }
  }

  /* ------------------------------ state -------------------------------- */

  get lines() { return this.cart?.lines?.nodes || []; }
  get count() { return this.cart?.totalQuantity || 0; }
  get checkoutUrl() { return this.cart?.checkoutUrl || null; }

  setCart(cart) {
    this.cart = cart;
    if (cart?.id) this.storeId(cart.id);
    this.updateBadges();
    this.render();
    document.dispatchEvent(new CustomEvent('hc:cart-updated', { detail: { cart } }));
  }

  /** Serialise mutations so rapid clicks cannot race each other. */
  run(task) {
    const next = this.queue.then(async () => {
      this.setBusy(true);
      this.showError('');
      try {
        return await task();
      } catch (err) {
        this.handleError(err);
        return null;
      } finally {
        this.setBusy(false);
      }
    });
    this.queue = next.catch(() => {});
    return next;
  }

  handleError(err) {
    console.warn('[High Caliber Cart]', err);
    let msg = 'Something went wrong updating your cart. Please try again.';
    if (err instanceof ShopifyError) {
      if (err.type === 'not-configured') msg = 'The online store is not connected yet. Please check back soon.';
      else if (err.type === 'network') msg = err.message;
      else if (err.type === 'user') msg = err.message;
    }
    this.showError(msg);
    this.showToast(msg);
  }

  /* ----------------------------- operations ---------------------------- */

  /** Add a variant (Shopify ProductVariant GID) to the cart and open the drawer. */
  addVariant(variantId, quantity = 1, label = '') {
    return this.run(async () => {
      const lines = [{ merchandiseId: variantId, quantity }];
      let cart;
      if (this.cart?.id) {
        try {
          cart = await addCartLines(this.cart.id, lines);
        } catch (err) {
          if (err instanceof ShopifyError && err.type === 'graphql') {
            // Cart probably expired on Shopify's side — start a fresh one.
            cart = await createCart(lines);
          } else {
            throw err;
          }
        }
      } else {
        cart = await createCart(lines);
      }
      if (!cart) throw new ShopifyError('Could not add this item to your cart.', 'user');
      this.setCart(cart);
      this.open();
      this.showToast(label ? `Added "${label}" to bag.` : 'Added to bag.');
      return cart;
    });
  }

  updateLine(lineId, quantity) {
    if (quantity <= 0) return this.removeLine(lineId);
    return this.run(async () => {
      const cart = await updateCartLines(this.cart.id, [{ id: lineId, quantity }]);
      if (cart) this.setCart(cart);
    });
  }

  removeLine(lineId) {
    return this.run(async () => {
      const cart = await removeCartLines(this.cart.id, [lineId]);
      if (cart) this.setCart(cart);
    });
  }

  applyDiscount(code) {
    const clean = String(code || '').trim();
    return this.run(async () => {
      if (!this.cart?.id) return;
      const cart = await updateCartDiscountCodes(this.cart.id, clean ? [clean] : []);
      if (!cart) return;
      this.setCart(cart);
      const status = this.drawerEl?.querySelector('#cartPromoStatus');
      const entry = cart.discountCodes?.find((d) => d.code.toLowerCase() === clean.toLowerCase());
      if (status) {
        if (!clean) {
          status.className = 'cart-promo-status';
          status.textContent = '';
        } else if (entry?.applicable) {
          status.className = 'cart-promo-status is-success';
          status.textContent = `Discount code "${clean.toUpperCase()}" applied.`;
        } else {
          status.className = 'cart-promo-status is-error';
          status.textContent = `Code "${clean.toUpperCase()}" is not valid for this cart.`;
        }
      }
    });
  }

  /** Hand off to Shopify-hosted checkout. */
  checkout() {
    if (!this.checkoutUrl || this.count === 0) return;
    const btn = this.drawerEl?.querySelector('#cartCheckoutBtn');
    if (btn) btn.textContent = 'CONNECTING TO SECURE CHECKOUT...';
    try {
      redirectToCheckout(this.checkoutUrl);
    } catch (err) {
      this.handleError(err);
      if (btn) btn.textContent = 'PROCEED TO SECURE CHECKOUT';
    }
  }

  /* -------------------------------- UI --------------------------------- */

  mountDrawer() {
    if (document.getElementById('cartDrawer')) return;

    const overlay = document.createElement('div');
    overlay.id = 'cartOverlay';
    overlay.className = 'cart-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () => this.close());
    document.body.appendChild(overlay);
    this.overlayEl = overlay;

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
          <span class="cart-monogram-icon" aria-hidden="true">★</span>
          <h2 class="cart-title">YOUR CART</h2>
          <span class="cart-count-badge" id="cartHeaderCount">(0)</span>
        </div>
        <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="cart-shipping-meter" id="cartShippingMeter" hidden>
        <div class="shipping-meter-text" id="shippingMeterText"></div>
        <div class="shipping-meter-bar">
          <div class="shipping-meter-fill" id="shippingMeterFill" style="width: 0%;"></div>
        </div>
      </div>

      <div class="cart-error" id="cartError" role="alert" hidden></div>

      <div class="cart-items" id="cartItemsList" tabindex="0" aria-live="polite"></div>

      <div class="cart-footer" id="cartFooter">
        <div class="cart-promo-row">
          <div class="cart-promo-input-wrap">
            <input type="text" id="cartPromoInput" class="cart-promo-input" placeholder="Discount code" aria-label="Discount code" autocomplete="off" />
            <button type="button" class="cart-promo-apply-btn" id="cartPromoApplyBtn">APPLY</button>
          </div>
          <div class="cart-promo-status" id="cartPromoStatus"></div>
        </div>

        <div class="cart-subtotal-breakdown">
          <div class="cart-subtotal-row">
            <span class="subtotal-label">Subtotal</span>
            <span class="subtotal-value tabular-nums" id="cartSubtotalRaw">$0.00</span>
          </div>
          <div class="cart-discount-row" id="cartDiscountRow" style="display: none;">
            <span class="discount-label">Discount (<span id="cartDiscountLabel"></span>)</span>
            <span class="discount-value tabular-nums" id="cartDiscountVal"></span>
          </div>
          <div class="cart-final-total-row">
            <span class="total-label">Estimated Total</span>
            <span class="total-value tabular-nums" id="cartFinalTotal">$0.00</span>
          </div>
        </div>

        <p class="cart-tax-notice">Taxes, shipping &amp; duties calculated at checkout.</p>

        <button type="button" class="btn btn-primary btn-checkout" id="cartCheckoutBtn">
          PROCEED TO SECURE CHECKOUT
        </button>

        <div class="cart-trust-ribbon">
          <span class="trust-badge-item">🔒 Secure Shopify Checkout</span>
          <span class="trust-badge-item">★ 30-Day Exchanges</span>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);
    this.drawerEl = drawer;

    drawer.querySelector('#cartCloseBtn').addEventListener('click', () => this.close());
    drawer.querySelector('#cartCheckoutBtn').addEventListener('click', () => this.checkout());

    const promoInput = drawer.querySelector('#cartPromoInput');
    drawer.querySelector('#cartPromoApplyBtn').addEventListener('click', () => this.applyDiscount(promoInput.value));
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.applyDiscount(promoInput.value);
      }
    });

    // Delegated line controls
    drawer.querySelector('#cartItemsList').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cart-action]');
      if (!btn) return;
      const id = btn.getAttribute('data-line-id');
      const line = this.lines.find((l) => l.id === id);
      if (!line) return;
      const action = btn.getAttribute('data-cart-action');
      if (action === 'inc') this.updateLine(id, line.quantity + 1);
      if (action === 'dec') this.updateLine(id, line.quantity - 1);
      if (action === 'remove') this.removeLine(id);
    });

    // Header cart buttons & any [data-cart-open]
    document.querySelectorAll('[data-cart-open], .cart-trigger-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.open();
      });
    });

    this.render();
  }

  open() {
    this.mountDrawer();
    this.lastFocus = document.activeElement;
    this.isOpen = true;
    this.render();
    this.drawerEl.classList.add('is-open');
    this.drawerEl.setAttribute('aria-hidden', 'false');
    this.overlayEl.classList.add('is-open');
    this.overlayEl.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cart-open-scroll-lock');
    this.drawerEl.querySelector('#cartCloseBtn')?.focus();
  }

  close() {
    this.isOpen = false;
    this.drawerEl?.classList.remove('is-open');
    this.drawerEl?.setAttribute('aria-hidden', 'true');
    this.overlayEl?.classList.remove('is-open');
    this.overlayEl?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cart-open-scroll-lock');
    if (this.lastFocus && typeof this.lastFocus.focus === 'function') this.lastFocus.focus();
  }

  setBusy(busy) {
    this.isBusy = busy;
    this.drawerEl?.classList.toggle('is-busy', busy);
    this.drawerEl?.setAttribute('aria-busy', String(busy));
    this.drawerEl?.querySelectorAll('button').forEach((b) => {
      if (b.id !== 'cartCloseBtn') b.disabled = busy;
    });
  }

  showError(message) {
    const el = this.drawerEl?.querySelector('#cartError');
    if (!el) return;
    el.textContent = message;
    el.hidden = !message;
  }

  updateBadges() {
    const count = this.count;
    document.querySelectorAll('.cart-badge, [data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    const headerCount = document.getElementById('cartHeaderCount');
    if (headerCount) headerCount.textContent = `(${count})`;
  }

  render() {
    if (!this.drawerEl) return;
    const listEl = this.drawerEl.querySelector('#cartItemsList');
    const footerEl = this.drawerEl.querySelector('#cartFooter');
    const meterEl = this.drawerEl.querySelector('#cartShippingMeter');
    if (!listEl) return;

    const cart = this.cart;
    const currency = cart?.cost?.subtotalAmount?.currencyCode || 'USD';
    const money = (m) => (m ? formatMoney(m.amount, m.currencyCode) : '');
    const subtotal = cart ? parseFloat(cart.cost.subtotalAmount.amount) : 0;

    // Free-shipping progress meter (threshold is configurable; 0 hides it)
    const threshold = shopifyConfig.settings.freeShippingThreshold;
    const label = shopifyConfig.settings.freeShippingLabel;
    if (meterEl) {
      meterEl.hidden = !(threshold > 0);
      if (threshold > 0) {
        const fill = this.drawerEl.querySelector('#shippingMeterFill');
        const text = this.drawerEl.querySelector('#shippingMeterText');
        if (subtotal >= threshold) {
          fill.style.width = '100%';
          text.innerHTML = `★ <strong>${escapeHtml(label)} unlocked!</strong>`;
        } else {
          fill.style.width = `${Math.min(100, Math.round((subtotal / threshold) * 100))}%`;
          text.innerHTML = `Add <strong>${escapeHtml(formatMoney(threshold - subtotal, currency))}</strong> to unlock ${escapeHtml(label)}`;
        }
      }
    }

    if (!cart || this.lines.length === 0) {
      listEl.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#C7A477" stroke-width="1.5" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <h3 class="cart-empty-title">Your cart is empty</h3>
          <p class="cart-empty-text">Your selected Western footwear, gear, and apparel will appear here.</p>
          <a href="${SITE_ROOT}shop/" class="btn btn-secondary btn-shop-empty">EXPLORE THE STORE</a>
        </div>
      `;
      if (footerEl) footerEl.style.display = 'none';
      return;
    }

    if (footerEl) footerEl.style.display = 'block';

    // Totals — all values come from Shopify
    const subtotalAmt = parseFloat(cart.cost.subtotalAmount.amount);
    const totalAmt = parseFloat(cart.cost.totalAmount.amount);
    this.drawerEl.querySelector('#cartSubtotalRaw').textContent = money(cart.cost.subtotalAmount);
    this.drawerEl.querySelector('#cartFinalTotal').textContent = money(cart.cost.totalAmount);

    const discountRow = this.drawerEl.querySelector('#cartDiscountRow');
    const applied = (cart.discountCodes || []).filter((d) => d.applicable);
    if (applied.length && totalAmt < subtotalAmt) {
      discountRow.style.display = 'flex';
      this.drawerEl.querySelector('#cartDiscountLabel').textContent = applied.map((d) => d.code).join(', ');
      this.drawerEl.querySelector('#cartDiscountVal').textContent = `-${formatMoney(subtotalAmt - totalAmt, currency)}`;
    } else {
      discountRow.style.display = 'none';
    }

    listEl.innerHTML = this.lines.map((line) => {
      const v = line.merchandise;
      if (!v) return '';
      const href = productLink(v.product.handle);
      const img = v.image?.url || FALLBACK_IMAGE;
      const variantLabel = v.title && v.title !== 'Default Title'
        ? `<div class="cart-item-variant"><strong>${escapeHtml(v.title)}</strong></div>`
        : '';
      const each = line.cost.amountPerQuantity;
      const was = line.cost.compareAtAmountPerQuantity;
      return `
        <div class="cart-item" data-line-id="${escapeHtml(line.id)}">
          <a href="${href}" class="cart-item-image-link" tabindex="-1" aria-hidden="true">
            <img src="${escapeHtml(img)}" alt="" class="cart-item-image" loading="lazy" />
          </a>
          <div class="cart-item-info">
            <a href="${href}" class="cart-item-title">${escapeHtml(v.product.title)}</a>
            ${variantLabel}
            <div class="cart-item-price tabular-nums">
              ${escapeHtml(money(each))}
              ${was && parseFloat(was.amount) > parseFloat(each.amount) ? `<s class="cart-item-was">${escapeHtml(money(was))}</s>` : ''}
            </div>
            <div class="cart-item-controls">
              <div class="quantity-stepper">
                <button type="button" class="qty-btn" data-cart-action="dec" data-line-id="${escapeHtml(line.id)}" aria-label="Decrease quantity of ${escapeHtml(v.product.title)}">−</button>
                <span class="qty-val tabular-nums" aria-live="polite">${line.quantity}</span>
                <button type="button" class="qty-btn" data-cart-action="inc" data-line-id="${escapeHtml(line.id)}" aria-label="Increase quantity of ${escapeHtml(v.product.title)}">+</button>
              </div>
              <button type="button" class="cart-remove-btn" data-cart-action="remove" data-line-id="${escapeHtml(line.id)}">Remove</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showToast(message) {
    let toast = document.getElementById('cartToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cartToast';
      toast.className = 'cart-toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

export const cart = new CartManager();
window.HighCaliberCart = cart;
