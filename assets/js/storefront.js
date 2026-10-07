/**
 * HIGH CALIBER — Storefront page controllers
 * ---------------------------------------------------------------------------
 * Wires Shopify data into the 5 commerce pages. Each page declares itself with
 * <body data-page="home|shop|boots|clothing|accessories">; this file decides
 * what to run. There are no per-category pages: Boots / Clothing / Accessories
 * each render their categories as filter tabs inside the one page.
 *
 *   boots | clothing | accessories  -> CatalogPage  (primary collection + category tabs)
 *   shop                            -> ShopPage     (entire catalog + filters)
 *   home                            -> HomePage     (Featured / New Arrivals / Promotions)
 *
 * Category tabs are generated from `catalogLayout` in shopify-config.js and are
 * hidden automatically while their Shopify collection is blank, missing, or empty.
 */

import { shopifyConfig, catalogLayout, getHandle } from './shopify-config.js';
import {
  isShopifyConfigured,
  ShopifyError,
  fetchAllProducts,
  fetchCollectionsBatch,
  fetchCollectionProducts
} from './shopify-api.js';
import {
  renderProductGrid,
  renderState,
  renderErrorState,
  attachProductHandlers,
  openProductDialog
} from './products.js';
import './cart.js';

const $ = (id) => document.getElementById(id);

const notConfiguredError = () =>
  new ShopifyError('Shopify is not configured. Add values in /assets/js/shopify-config.js.', 'not-configured');

/* ------------------------------------------------------------------------- *
 * Shared sorting / list view
 * ------------------------------------------------------------------------- */

const SORTERS = {
  featured: null, // keep Shopify's collection order
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'title-asc': (a, b) => a.title.localeCompare(b.title),
  'title-desc': (a, b) => b.title.localeCompare(a.title)
};

function sortProducts(products, key) {
  const fn = SORTERS[key];
  return fn ? [...products].sort(fn) : [...products];
}

function dedupe(products) {
  const seen = new Set();
  return products.filter((p) => (seen.has(p.handle) ? false : seen.add(p.handle)));
}

/* ------------------------------------------------------------------------- *
 * Category pages: Boots / Clothing / Accessories
 * ------------------------------------------------------------------------- */

class CatalogPage {
  constructor(layoutKey) {
    this.layout = catalogLayout[layoutKey];
    this.grid = $('productGrid');
    this.tabsWrap = $('categoryTabs');
    this.countEl = $('productCount');
    this.sortEl = $('collectionSort');
    this.controlsBar = $('catalogControls');
    this.active = 'all';
    this.all = [];
    this.byCategory = {};
    this.visibleCategories = [];
    if (this.grid) this.init();
  }

  async init() {
    attachProductHandlers(this.grid);
    renderState(this.grid, { type: 'loading' });

    try {
      if (!isShopifyConfigured()) throw notConfiguredError();

      const primaryHandle = getHandle(this.layout.primary);
      const categoryHandles = this.layout.categories.map((c) => getHandle(c.key));
      if (!primaryHandle && categoryHandles.every((h) => !h)) {
        this.showEmpty('This collection is not set up yet', 'Check back soon for new arrivals.');
        return;
      }

      const batch = await fetchCollectionsBatch([primaryHandle, ...categoryHandles]);

      // Primary collection (page through if it is larger than one request)
      let primaryProducts = batch[primaryHandle]?.products || [];
      if (batch[primaryHandle]?.hasMore) {
        primaryProducts = (await fetchCollectionProducts(primaryHandle)).products;
      }

      // A product shows up under a category if it is in that category's collection,
      // or if the primary collection reports it as a member of it.
      this.layout.categories.forEach((cat) => {
        const handle = getHandle(cat.key);
        if (!handle) return;
        const fromCollection = batch[handle]?.products || [];
        const fromPrimary = primaryProducts.filter((p) => p.collections.includes(handle));
        this.byCategory[cat.key] = dedupe([...fromCollection, ...fromPrimary]);
      });

      this.all = dedupe([
        ...primaryProducts,
        ...Object.values(this.byCategory).flat()
      ]);

      this.visibleCategories = this.layout.categories.filter((c) => (this.byCategory[c.key] || []).length > 0);

      if (this.all.length === 0) {
        this.showEmpty('New styles are on the way', 'We are stocking this collection. Check back soon.');
        return;
      }

      const requested = new URLSearchParams(location.search).get('category');
      if (requested && this.visibleCategories.some((c) => c.key === requested)) this.active = requested;

      this.buildTabs();
      this.sortEl?.addEventListener('change', () => this.render());
      this.render();
    } catch (err) {
      this.updateCount('');
      renderErrorState(this.grid, err);
    }
  }

  showEmpty(title, message) {
    if (this.controlsBar) this.controlsBar.hidden = true;
    renderState(this.grid, { type: 'empty', title, message });
  }

  buildTabs() {
    if (!this.tabsWrap) return;
    // Nothing to filter by: hide the control entirely (no empty/broken controls).
    if (this.visibleCategories.length === 0) {
      this.tabsWrap.hidden = true;
      return;
    }
    const tabs = [{ key: 'all', label: 'All' }, ...this.visibleCategories];
    this.tabsWrap.hidden = false;
    this.tabsWrap.innerHTML = tabs.map((t) => `
      <button type="button" class="showcase-tab ${t.key === this.active ? 'is-active' : ''}" data-category="${t.key}" aria-pressed="${t.key === this.active}">${t.label}</button>`).join('');
    this.tabsWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-category]');
      if (!btn) return;
      this.active = btn.dataset.category;
      this.tabsWrap.querySelectorAll('[data-category]').forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const url = new URL(location.href);
      if (this.active === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', this.active);
      url.hash = '';
      history.replaceState(null, '', url);
      this.render();
    });
  }

  updateCount(text) {
    if (this.countEl) this.countEl.textContent = text;
  }

  render() {
    const base = this.active === 'all' ? this.all : (this.byCategory[this.active] || []);
    const list = sortProducts(base, this.sortEl?.value || 'featured');
    this.updateCount(`${list.length} ${list.length === 1 ? 'style' : 'styles'}`);
    renderProductGrid(this.grid, list);
  }
}

/* ------------------------------------------------------------------------- *
 * Shop page: the complete catalog with extensible filters
 * ------------------------------------------------------------------------- */

/**
 * Filter registry — add an entry to add a filter. Each filter maps a form field
 * name to a predicate. `populate` (optional) fills a <select> from the data.
 */
const SHOP_FILTERS = [
  {
    name: 'productType',
    predicate: (p, v) => p.productType === v,
    populate: (products) => [...new Set(products.map((p) => p.productType).filter(Boolean))].sort()
      .map((t) => ({ value: t, label: t }))
  },
  {
    name: 'availability',
    predicate: (p, v) => (v === 'in-stock' ? p.available : true)
  },
  {
    name: 'priceRange',
    predicate: (p, v) => {
      if (v === 'under-100') return p.price < 100;
      if (v === '100-250') return p.price >= 100 && p.price <= 250;
      if (v === '250-500') return p.price > 250 && p.price <= 500;
      if (v === 'over-500') return p.price > 500;
      return true;
    }
  }
];

class ShopPage {
  constructor() {
    this.grid = $('productGrid');
    this.form = $('collectionFilters');
    this.countEl = $('productCount');
    this.sortEl = $('collectionSort');
    this.products = [];
    if (this.grid) this.init();
  }

  async init() {
    attachProductHandlers(this.grid);
    renderState(this.grid, { type: 'loading' });
    try {
      if (!isShopifyConfigured()) throw notConfiguredError();
      this.products = await fetchAllProducts();
      if (this.products.length === 0) {
        if (this.countEl) this.countEl.textContent = '';
        renderState(this.grid, { type: 'empty', title: 'New styles are on the way', message: 'We are stocking the shop. Check back soon.' });
        return;
      }
      this.populateFilters();
      this.bind();
      this.render();
    } catch (err) {
      if (this.countEl) this.countEl.textContent = '';
      renderErrorState(this.grid, err);
    }
  }

  populateFilters() {
    SHOP_FILTERS.forEach((f) => {
      if (!f.populate || !this.form) return;
      const select = this.form.elements[f.name];
      if (!select) return;
      const options = f.populate(this.products);
      if (options.length === 0) {
        select.hidden = true; // no values to filter by
        return;
      }
      options.forEach((o) => select.add(new Option(o.label, o.value)));
    });
  }

  bind() {
    this.sortEl?.addEventListener('change', () => this.render());
    if (!this.form) return;
    this.form.addEventListener('change', () => this.render());
    this.form.querySelector('[data-reset-filters]')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.form.reset();
      this.render();
    });
  }

  render() {
    let list = [...this.products];
    if (this.form) {
      const data = new FormData(this.form);
      SHOP_FILTERS.forEach((f) => {
        const value = data.get(f.name);
        if (value && value !== 'all') list = list.filter((p) => f.predicate(p, value));
      });
    }
    list = sortProducts(list, this.sortEl?.value || 'featured');
    if (this.countEl) this.countEl.textContent = `${list.length} ${list.length === 1 ? 'style' : 'styles'}`;

    if (list.length === 0) {
      renderState(this.grid, {
        type: 'empty',
        title: 'No matching styles found',
        message: 'Try clearing or adjusting your filters.'
      });
      return;
    }
    renderProductGrid(this.grid, list);
  }
}

/* ------------------------------------------------------------------------- *
 * Home page: Featured / New Arrivals / Promotions
 * ------------------------------------------------------------------------- */

class HomePage {
  constructor() {
    this.section = $('homeShowcase');
    this.grid = $('featuredProductGrid');
    this.tabsWrap = $('homeShowcaseTabs');
    this.sources = {};
    if (this.section && this.grid) this.init();
  }

  async init() {
    attachProductHandlers(this.grid);
    const limit = shopifyConfig.settings.homeSectionLimit;

    // Not connected yet: keep the homepage clean rather than showing an empty section.
    if (!isShopifyConfigured()) {
      console.info('[High Caliber Storefront] Homepage product sections hidden until Shopify is configured.');
      return;
    }

    const featuredHandle = getHandle('featured');
    const newHandle = getHandle('newArrivals');
    const promoHandle = getHandle('promotions');

    this.section.hidden = false;
    renderState(this.grid, { type: 'loading' });

    try {
      const batch = await fetchCollectionsBatch([featuredHandle, newHandle, promoHandle]);
      this.sources.featured = batch[featuredHandle]?.products || [];
      this.sources.newArrivals = batch[newHandle]?.products || [];

      if (promoHandle) {
        this.sources.promotions = batch[promoHandle]?.products || [];
      } else {
        // No promotions collection configured: derive from live compare-at pricing.
        const all = await fetchAllProducts({ limit: 100 });
        this.sources.promotions = all.filter((p) => p.compareAtPrice && p.available);
      }

      Object.keys(this.sources).forEach((k) => { this.sources[k] = this.sources[k].slice(0, limit); });

      const visible = ['featured', 'newArrivals', 'promotions'].filter((k) => this.sources[k].length > 0);
      if (visible.length === 0) {
        this.section.hidden = true; // nothing qualifying yet
        return;
      }
      this.buildTabs(visible);
      this.show(visible[0]);
    } catch (err) {
      renderErrorState(this.grid, err);
      if (this.tabsWrap) this.tabsWrap.hidden = true;
    }
  }

  buildTabs(visible) {
    if (!this.tabsWrap) return;
    this.tabsWrap.querySelectorAll('[data-source]').forEach((btn) => {
      btn.hidden = !visible.includes(btn.dataset.source);
      btn.addEventListener('click', () => this.show(btn.dataset.source));
    });
    this.tabsWrap.hidden = visible.length < 2; // a single source needs no tabs
  }

  show(source) {
    this.tabsWrap?.querySelectorAll('[data-source]').forEach((btn) => {
      const on = btn.dataset.source === source;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', String(on));
    });
    renderProductGrid(this.grid, this.sources[source]);
  }
}

/* ------------------------------------------------------------------------- *
 * Product deep links (#product=<handle>) — no per-product pages needed
 * ------------------------------------------------------------------------- */

function handleProductHash() {
  const match = location.hash.match(/^#product=(.+)$/);
  if (match) openProductDialog(decodeURIComponent(match[1]));
}

/* ------------------------------------------------------------------------- *
 * Boot
 * ------------------------------------------------------------------------- */

function start() {
  const page = document.body.dataset.page;
  if (catalogLayout[page]) new CatalogPage(page);
  else if (page === 'shop') new ShopPage();
  else if (page === 'home') new HomePage();

  handleProductHash();
  window.addEventListener('hashchange', handleProductHash);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
