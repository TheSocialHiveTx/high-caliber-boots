/**
 * HIGH CALIBER — Reusable product rendering
 * ---------------------------------------------------------------------------
 * ONE product-card renderer and ONE product-detail dialog used by Home, Shop,
 * Boots, Clothing, Accessories and search. There are intentionally no
 * per-product pages (the site is capped at 8 primary pages); product details
 * open in an accessible in-page dialog and are deep-linkable via `#product=<handle>`.
 *
 * All text from Shopify is HTML-escaped before it touches the DOM.
 */

import { shopifyConfig } from './shopify-config.js';
import {
  escapeHtml,
  formatMoney,
  FALLBACK_IMAGE,
  fetchProductByHandle,
  findVariant,
  getDefaultSelection,
  isOptionValueAvailable,
  ShopifyError
} from './shopify-api.js';
import { cart } from './cart.js';

export { formatMoney };

/** handle -> normalized product, so cards/dialog never need a second fetch. */
const registry = new Map();
export const getRegisteredProduct = (handle) => registry.get(handle) || null;

const imgUrl = (img) => (img?.url ? img.url : FALLBACK_IMAGE);
const imgDims = (img) => (img?.width && img?.height ? `width="${img.width}" height="${img.height}"` : '');

/* ------------------------------------------------------------------------- *
 * Page states (loading / empty / error / not connected)
 * ------------------------------------------------------------------------- */

export function renderState(container, { type = 'empty', title = '', message = '', actionLabel = '', actionHref = '' } = {}) {
  if (!container) return;
  if (type === 'loading') {
    container.innerHTML = `
      <div class="collection-loading-state" role="status" aria-live="polite">
        <div class="loading-spinner" aria-hidden="true"></div>
        <p>${escapeHtml(message || 'Loading the High Caliber catalog...')}</p>
      </div>`;
    return;
  }
  container.innerHTML = `
    <div class="collection-empty-state ${type === 'error' ? 'collection-error-state' : ''}" role="${type === 'error' ? 'alert' : 'status'}">
      <h3 class="empty-title">${escapeHtml(title)}</h3>
      <p class="empty-desc">${escapeHtml(message)}</p>
      ${actionLabel ? `<a class="btn btn-secondary" href="${escapeHtml(actionHref)}">${escapeHtml(actionLabel)}</a>` : ''}
    </div>`;
}

/** Map a thrown error to a friendly state. */
export function renderErrorState(container, err) {
  if (err instanceof ShopifyError && err.type === 'not-configured') {
    console.info('[High Caliber Storefront]', err.message);
    renderState(container, {
      type: 'empty',
      title: 'The catalog is being stocked',
      message: 'Our online store is almost ready. Check back soon, or reach out and we will help you find the right pair.',
      actionLabel: 'CONTACT US',
      actionHref: new URL('contact/', new URL('../../', import.meta.url)).href
    });
    return;
  }
  console.warn('[High Caliber Storefront]', err);
  renderState(container, {
    type: 'error',
    title: 'We could not load products',
    message: err instanceof ShopifyError && err.type === 'network'
      ? err.message
      : 'Something went wrong while loading the catalog. Please refresh the page and try again.'
  });
}

/* ------------------------------------------------------------------------- *
 * Product card
 * ------------------------------------------------------------------------- */

const hasTag = (p, tag) => p.tags.some((t) => t.toLowerCase() === tag);

export function renderProductCard(product) {
  registry.set(product.handle, product);

  const primary = product.images[0];
  const secondary = product.images[1];
  const title = escapeHtml(product.title);
  const handle = escapeHtml(product.handle);
  const href = `#product=${encodeURIComponent(product.handle)}`;

  let badge = '';
  if (!product.available) {
    badge = `<span class="product-badge product-badge-sold-out">SOLD OUT</span>`;
  } else if (product.compareAtPrice) {
    const save = Math.round(product.compareAtPrice - product.price);
    badge = `<span class="product-badge product-badge-sale">SAVE ${escapeHtml(formatMoney(save, product.currency).replace(/\.00$/, ''))}</span>`;
  } else if (hasTag(product, 'new')) {
    badge = `<span class="product-badge product-badge-new">NEW</span>`;
  }

  const price = `
    <span class="product-price tabular-nums">${product.hasPriceRange ? 'From ' : ''}${escapeHtml(formatMoney(product.price, product.currency))}</span>
    ${product.compareAtPrice ? `<span class="product-compare-price tabular-nums"><span class="sr-only">Regular price </span>${escapeHtml(formatMoney(product.compareAtPrice, product.currency))}</span>` : ''}`;

  let cta;
  if (!product.available) {
    cta = `<button type="button" class="btn btn-secondary btn-sm product-card-cta" disabled>SOLD OUT</button>`;
  } else if (product.hasSingleVariant) {
    cta = `<button type="button" class="btn btn-primary btn-sm product-card-cta" data-action="add" data-product-handle="${handle}" data-variant-id="${escapeHtml(product.variants[0].id)}" aria-label="Add ${title} to bag">ADD TO BAG</button>`;
  } else {
    cta = `<button type="button" class="btn btn-secondary btn-sm product-card-cta" data-action="view" data-product-handle="${handle}" aria-label="Select options for ${title}">SELECT OPTIONS</button>`;
  }

  return `
    <article class="product-card ${product.available ? '' : 'is-sold-out'}" data-product-handle="${handle}">
      <div class="product-card-media">
        <a href="${href}" class="product-card-image-wrap" data-product-handle="${handle}" aria-label="View details for ${title}">
          <img src="${escapeHtml(imgUrl(primary))}" ${imgDims(primary)} alt="${escapeHtml(primary?.altText || product.title)}" class="product-image primary-img" loading="lazy" decoding="async" />
          ${secondary ? `<img src="${escapeHtml(imgUrl(secondary))}" ${imgDims(secondary)} alt="" class="product-image secondary-img" loading="lazy" decoding="async" />` : ''}
        </a>
        ${badge}
        <div class="card-actions-overlay">
          <button type="button" class="card-action-btn card-quick-view-btn" data-action="view" data-product-handle="${handle}" aria-label="Quick view ${title}">QUICK VIEW</button>
        </div>
      </div>
      <div class="product-card-content">
        ${product.vendor ? `<div class="product-card-meta"><span class="product-vendor">${escapeHtml(product.vendor)}</span></div>` : ''}
        <h3 class="product-card-title"><a href="${href}" data-product-handle="${handle}">${title}</a></h3>
        <div class="product-card-pricing">${price}</div>
        <p class="product-availability ${product.available ? 'is-in-stock' : 'is-out-of-stock'}">${product.available ? 'In stock' : 'Sold out'}</p>
        ${cta}
      </div>
    </article>`;
}

export function renderProductGrid(container, products) {
  if (!container) return;
  container.innerHTML = products.map(renderProductCard).join('');
}

/**
 * Attach delegated click handling for cards inside `root` (idempotent).
 * Handles: open details, quick add.
 */
export function attachProductHandlers(root) {
  if (!root || root.dataset.productHandlers === 'true') return;
  root.dataset.productHandlers = 'true';

  root.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-product-handle]');
    if (!trigger || !root.contains(trigger)) return;
    const handle = trigger.getAttribute('data-product-handle');
    const action = trigger.getAttribute('data-action');

    if (action === 'add') {
      e.preventDefault();
      const product = registry.get(handle);
      cart.addVariant(trigger.getAttribute('data-variant-id'), 1, product?.title || '');
      return;
    }
    // Any other trigger (image link, title link, quick view, select options)
    e.preventDefault();
    openProductDialog(handle, trigger);
  });
}

/* ------------------------------------------------------------------------- *
 * Product detail dialog
 * ------------------------------------------------------------------------- */

let activeDialog = null;

export function closeProductDialog() {
  if (activeDialog) activeDialog.close();
}

export async function openProductDialog(productOrHandle, returnFocusTo = null) {
  closeProductDialog();

  const handle = typeof productOrHandle === 'string' ? productOrHandle : productOrHandle.handle;
  let product = typeof productOrHandle === 'string' ? registry.get(handle) : productOrHandle;

  const backdrop = document.createElement('div');
  backdrop.id = 'productDialog';
  backdrop.className = 'modal-backdrop is-open qv-modal';
  backdrop.innerHTML = `<div class="modal-card qv-modal-card" role="dialog" aria-modal="true" aria-label="Product details" tabindex="-1"></div>`;
  document.body.appendChild(backdrop);
  document.body.classList.add('search-open-scroll-lock');
  const card = backdrop.querySelector('.qv-modal-card');

  const previousFocus = returnFocusTo || document.activeElement;

  const dialog = {
    close() {
      document.removeEventListener('keydown', onKey, true);
      backdrop.remove();
      document.body.classList.remove('search-open-scroll-lock');
      activeDialog = null;
      if (location.hash.startsWith('#product=')) {
        history.replaceState(null, '', location.pathname + location.search);
      }
      if (previousFocus && document.contains(previousFocus) && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    }
  };
  activeDialog = dialog;

  const onKey = (e) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      dialog.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = [...card.querySelectorAll('a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])')];
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener('keydown', onKey, true);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) dialog.close(); });

  if (location.hash !== `#product=${encodeURIComponent(handle)}`) {
    history.replaceState(null, '', `${location.pathname}${location.search}#product=${encodeURIComponent(handle)}`);
  }

  // Loading (deep link / search result not yet in the registry)
  if (!product) {
    card.innerHTML = `<div class="qv-modal-header"><span class="qv-vendor"></span><button type="button" class="modal-close-btn" data-close aria-label="Close product details">&times;</button></div>
      <div class="qv-modal-body" style="display:block"><div class="collection-loading-state" role="status"><div class="loading-spinner" aria-hidden="true"></div><p>Loading product...</p></div></div>`;
    card.querySelector('[data-close]').addEventListener('click', () => dialog.close());
    card.focus();
    try {
      product = await fetchProductByHandle(handle);
    } catch (err) {
      if (activeDialog !== dialog) return;
      card.querySelector('.qv-modal-body').innerHTML = `<div class="collection-empty-state collection-error-state" role="alert"><h3 class="empty-title">Product unavailable</h3><p class="empty-desc">We could not load this product right now.</p></div>`;
      return;
    }
    if (activeDialog !== dialog) return;
    if (!product) {
      card.querySelector('.qv-modal-body').innerHTML = `<div class="collection-empty-state" role="status"><h3 class="empty-title">Product not found</h3><p class="empty-desc">This product is no longer available.</p><a class="btn btn-secondary" href="${escapeHtml(new URL('../../shop/', import.meta.url).href)}">BROWSE THE SHOP</a></div>`;
      return;
    }
    registry.set(product.handle, product);
  }

  renderDialogContent(card, product, dialog);
  card.focus();
}

function renderDialogContent(card, product, dialog) {
  const images = product.images.length ? product.images : [null];
  const selected = getDefaultSelection(product);
  let qty = 1;

  const paragraphs = product.description
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p) => `<p class="qv-desc">${escapeHtml(p)}</p>`)
    .join('');

  const threshold = shopifyConfig.settings.freeShippingThreshold;

  card.innerHTML = `
    <div class="qv-modal-header">
      <span class="qv-vendor">${escapeHtml(product.vendor || 'HIGH CALIBER')}</span>
      <button type="button" class="modal-close-btn" data-close aria-label="Close product details">&times;</button>
    </div>
    <div class="qv-modal-body">
      <div class="qv-gallery">
        <div class="qv-main-image-wrap">
          <img src="${escapeHtml(imgUrl(images[0]))}" alt="${escapeHtml(images[0]?.altText || product.title)}" id="pdMainImg" class="qv-main-img" />
        </div>
        ${images.length > 1 ? `<div class="qv-thumbs">${images.map((img, i) => `
          <button type="button" class="qv-thumb-btn ${i === 0 ? 'is-active' : ''}" data-idx="${i}" aria-label="Show image ${i + 1} of ${images.length}">
            <img src="${escapeHtml(imgUrl(img))}" alt="" />
          </button>`).join('')}</div>` : ''}
      </div>
      <div class="qv-details">
        <h2 class="qv-title">${escapeHtml(product.title)}</h2>
        <div class="qv-price-row">
          <span class="qv-price tabular-nums" id="pdPrice"></span>
          <span class="qv-compare tabular-nums" id="pdCompare"></span>
          <span class="qv-in-stock-tag" id="pdStock" role="status"></span>
        </div>
        ${paragraphs}
        ${product.options.map((opt) => `
          <div class="qv-size-group" role="group" aria-label="${escapeHtml(opt.name)}">
            <div class="qv-size-header"><span class="qv-label">SELECT ${escapeHtml(opt.name.toUpperCase())}</span></div>
            <div class="qv-size-pills">
              ${opt.values.map((val) => `
                <button type="button" class="qv-size-pill" data-option="${escapeHtml(opt.name)}" data-value="${escapeHtml(val)}" aria-pressed="false">${escapeHtml(val)}</button>`).join('')}
            </div>
          </div>`).join('')}
        <div class="qv-actions">
          <div class="quantity-stepper">
            <button type="button" class="qty-btn" id="pdQtyDec" aria-label="Decrease quantity">−</button>
            <span class="qty-val tabular-nums" id="pdQtyVal" aria-live="polite">1</span>
            <button type="button" class="qty-btn" id="pdQtyInc" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="btn btn-primary" id="pdAddBtn" style="flex-grow: 1;">ADD TO BAG</button>
        </div>
        <div class="qv-perks-list">
          ${threshold > 0 ? `<div class="qv-perk-item">✓ Complimentary insured ground shipping on orders ${escapeHtml(formatMoney(threshold).replace(/\.00$/, ''))}+</div>` : ''}
          <div class="qv-perk-item">✓ 30-day returns &amp; exchanges</div>
        </div>
      </div>
    </div>`;

  const $ = (sel) => card.querySelector(sel);
  const mainImg = $('#pdMainImg');
  const addBtn = $('#pdAddBtn');

  function update() {
    const variant = findVariant(product, selected);

    // Option pills: reflect selection + grey out values that are sold out
    card.querySelectorAll('.qv-size-pill').forEach((pill) => {
      const name = pill.dataset.option;
      const value = pill.dataset.value;
      const isSel = selected[name] === value;
      pill.classList.toggle('is-selected', isSel);
      pill.setAttribute('aria-pressed', String(isSel));
      pill.classList.toggle('is-out', !isOptionValueAvailable(product, name, value, selected));
    });

    const shown = variant || null;
    const price = shown ? shown.price : product.price;
    const was = shown ? (shown.compareAtPrice > shown.price ? shown.compareAtPrice : null) : product.compareAtPrice;
    $('#pdPrice').textContent = `${!shown && product.hasPriceRange ? 'From ' : ''}${formatMoney(price, product.currency)}`;
    $('#pdCompare').textContent = was ? formatMoney(was, product.currency) : '';

    const stock = $('#pdStock');
    if (!shown) {
      stock.textContent = 'This combination is unavailable';
      stock.classList.add('is-out');
      addBtn.disabled = true;
      addBtn.textContent = 'UNAVAILABLE';
    } else if (!shown.available) {
      stock.textContent = 'Sold out';
      stock.classList.add('is-out');
      addBtn.disabled = true;
      addBtn.textContent = 'SOLD OUT';
    } else {
      stock.textContent = '✓ In stock';
      stock.classList.remove('is-out');
      addBtn.disabled = false;
      addBtn.textContent = 'ADD TO BAG';
    }

    if (shown?.image?.url && mainImg.src !== shown.image.url) {
      mainImg.src = shown.image.url;
      mainImg.alt = shown.image.altText || product.title;
    }
  }

  card.querySelector('[data-close]').addEventListener('click', () => dialog.close());

  card.querySelectorAll('.qv-thumb-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      card.querySelectorAll('.qv-thumb-btn').forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const img = images[parseInt(btn.dataset.idx, 10)];
      mainImg.src = imgUrl(img);
      mainImg.alt = img?.altText || product.title;
    });
  });

  card.querySelectorAll('.qv-size-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      selected[pill.dataset.option] = pill.dataset.value;
      update();
    });
  });

  $('#pdQtyDec').addEventListener('click', () => { if (qty > 1) { qty--; $('#pdQtyVal').textContent = qty; } });
  $('#pdQtyInc').addEventListener('click', () => { qty++; $('#pdQtyVal').textContent = qty; });

  addBtn.addEventListener('click', async () => {
    const variant = findVariant(product, selected);
    if (!variant || !variant.available) return;
    dialog.close();
    cart.addVariant(variant.id, qty, product.title);
  });

  update();
}

window.HighCaliberProducts = { renderProductCard, openProductDialog, formatMoney };
