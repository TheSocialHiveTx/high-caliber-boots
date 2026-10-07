/**
 * HIGH CALIBER — Shopify Storefront API client (GraphQL + Cart API)
 * ---------------------------------------------------------------------------
 * Thin, dependency-free wrapper around Shopify's Storefront API. Only the
 * PUBLIC Storefront access token is used. Checkout is hosted by Shopify; this
 * file only ever hands the customer the `checkoutUrl` returned by the Cart API
 * (the legacy Checkout API is intentionally not used).
 *
 * Every function throws a `ShopifyError` on failure so the UI layer can show
 * proper loading / empty / error states. Nothing here falls back to fake data.
 */

import { shopifyConfig, isShopifyConfigured } from './shopify-config.js';

export { isShopifyConfigured };

/* ------------------------------------------------------------------------- *
 * Errors & small helpers
 * ------------------------------------------------------------------------- */

export class ShopifyError extends Error {
  /**
   * @param {string} message
   * @param {'not-configured'|'network'|'http'|'graphql'|'user'} type
   */
  constructor(message, type = 'graphql', details = null) {
    super(message);
    this.name = 'ShopifyError';
    this.type = type;
    this.details = details;
  }
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatMoney(amount, currency = 'USD') {
  const value = Number(amount);
  if (!Number.isFinite(value)) return '';
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);
  } catch (e) {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Absolute URL of the site root (with trailing slash), derived from where this
 * module lives (/assets/js/). Works on a custom domain AND on a GitHub Pages
 * project site served from /<repo-name>/, with no per-page path math.
 */
export const SITE_ROOT = new URL('../../', import.meta.url).href;

export const FALLBACK_IMAGE = `${SITE_ROOT}assets/images/branding/monogram.svg`;

/** In-page product detail link (there are no per-product pages; see products.js). */
export const productLink = (handle) => `${SITE_ROOT}shop/#product=${encodeURIComponent(handle)}`;

/* ------------------------------------------------------------------------- *
 * Core GraphQL transport
 * ------------------------------------------------------------------------- */

export function getEndpoint() {
  return `https://${shopifyConfig.domain}/api/${shopifyConfig.apiVersion}/graphql.json`;
}

/**
 * Execute a Storefront API GraphQL request.
 * @returns {Promise<object>} the `data` object
 */
export async function storefrontRequest(query, variables = {}) {
  if (!isShopifyConfigured()) {
    throw new ShopifyError(
      'Shopify is not configured. Add the store domain and Storefront token in /assets/js/shopify-config.js.',
      'not-configured'
    );
  }

  let response;
  try {
    response = await fetch(getEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': shopifyConfig.storefrontToken
      },
      body: JSON.stringify({ query, variables })
    });
  } catch (err) {
    throw new ShopifyError('Could not reach Shopify. Check your connection and try again.', 'network', err);
  }

  if (!response.ok) {
    throw new ShopifyError(`Shopify responded with HTTP ${response.status}.`, 'http', response.status);
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new ShopifyError('Shopify returned an unreadable response.', 'http', err);
  }

  if (json.errors?.length) {
    throw new ShopifyError(json.errors[0]?.message || 'Shopify GraphQL error.', 'graphql', json.errors);
  }
  return json.data;
}

/* ------------------------------------------------------------------------- *
 * Fragments
 * ------------------------------------------------------------------------- */

const IMAGE_FIELDS = `url altText width height`;

const PRODUCT_FRAGMENT = `
  fragment ProductFields on Product {
    id
    handle
    title
    vendor
    productType
    tags
    description
    availableForSale
    featuredImage { ${IMAGE_FIELDS} }
    images(first: 8) { nodes { ${IMAGE_FIELDS} } }
    options { name optionValues { name } }
    collections(first: 25) { nodes { handle } }
    variants(first: 100) {
      nodes {
        id
        title
        availableForSale
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
        selectedOptions { name value }
        image { ${IMAGE_FIELDS} }
      }
    }
  }
`;

const CART_FRAGMENT = `
  fragment CartFields on Cart {
    id
    checkoutUrl
    totalQuantity
    note
    discountCodes { code applicable }
    cost {
      subtotalAmount { amount currencyCode }
      totalAmount { amount currencyCode }
    }
    lines(first: 100) {
      nodes {
        id
        quantity
        cost {
          totalAmount { amount currencyCode }
          amountPerQuantity { amount currencyCode }
          compareAtAmountPerQuantity { amount currencyCode }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            availableForSale
            selectedOptions { name value }
            image { ${IMAGE_FIELDS} }
            product { id handle title }
          }
        }
      }
    }
  }
`;

/* ------------------------------------------------------------------------- *
 * Normalization (Shopify node -> storefront product model)
 * ------------------------------------------------------------------------- */

const num = (money) => (money ? parseFloat(money.amount) : null);

export function normalizeProduct(node) {
  if (!node) return null;

  const variants = (node.variants?.nodes || []).map((v) => ({
    id: v.id,
    title: v.title,
    available: Boolean(v.availableForSale),
    price: num(v.price) ?? 0,
    compareAtPrice: num(v.compareAtPrice),
    currency: v.price?.currencyCode || 'USD',
    selectedOptions: v.selectedOptions || [],
    image: v.image || null
  }));

  // Representative variant for listing cards: the cheapest purchasable one.
  const sorted = [...variants].sort((a, b) => a.price - b.price);
  const rep = sorted.find((v) => v.available) || sorted[0] || null;
  const prices = variants.map((v) => v.price);
  const hasPriceRange = prices.length > 1 && Math.min(...prices) !== Math.max(...prices);

  const images = (node.images?.nodes || []).filter(Boolean);
  if (node.featuredImage && !images.some((i) => i.url === node.featuredImage.url)) {
    images.unshift(node.featuredImage);
  }

  const options = (node.options || [])
    .map((o) => ({ name: o.name, values: (o.optionValues || []).map((ov) => ov.name) }))
    // Shopify gives single-variant products a placeholder "Title: Default Title" option.
    .filter((o) => !(o.name === 'Title' && o.values.length === 1 && o.values[0] === 'Default Title'));

  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    vendor: node.vendor || '',
    productType: node.productType || '',
    tags: node.tags || [],
    description: node.description || '',
    available: Boolean(node.availableForSale),
    price: rep ? rep.price : 0,
    compareAtPrice: rep && rep.compareAtPrice && rep.compareAtPrice > rep.price ? rep.compareAtPrice : null,
    currency: rep?.currency || 'USD',
    hasPriceRange,
    images,
    options,
    variants,
    hasSingleVariant: options.length === 0 && variants.length === 1,
    collections: (node.collections?.nodes || []).map((c) => c.handle)
  };
}

/* ------------------------------------------------------------------------- *
 * Catalog queries
 * ------------------------------------------------------------------------- */

const pageSize = () => Math.min(250, Math.max(1, shopifyConfig.settings.pageSize || 50));
const maxProducts = () => shopifyConfig.settings.maxProducts || 250;

/** Fetch the whole catalog (paged up to settings.maxProducts). */
export async function fetchAllProducts({ limit = maxProducts() } = {}) {
  const query = `
    ${PRODUCT_FRAGMENT}
    query AllProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        pageInfo { hasNextPage endCursor }
        nodes { ...ProductFields }
      }
    }
  `;
  const products = [];
  let after = null;
  while (products.length < limit) {
    const data = await storefrontRequest(query, { first: Math.min(pageSize(), limit - products.length), after });
    products.push(...data.products.nodes.map(normalizeProduct));
    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor;
  }
  return products;
}

/** Fetch collection metadata only (no products). Returns null if the handle doesn't exist. */
export async function fetchCollectionByHandle(handle) {
  if (!handle) return null;
  const data = await storefrontRequest(
    `query CollectionMeta($handle: String!) {
       collection(handle: $handle) { id handle title description image { ${IMAGE_FIELDS} } }
     }`,
    { handle }
  );
  return data.collection || null;
}

/**
 * Fetch every product in a collection (paged).
 * @returns {Promise<{found:boolean, handle:string, title:string, products:object[]}>}
 */
export async function fetchCollectionProducts(handle, { limit = maxProducts() } = {}) {
  if (!handle) return { found: false, handle: '', title: '', products: [] };

  const query = `
    ${PRODUCT_FRAGMENT}
    query CollectionProducts($handle: String!, $first: Int!, $after: String) {
      collection(handle: $handle) {
        handle
        title
        products(first: $first, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes { ...ProductFields }
        }
      }
    }
  `;
  const products = [];
  let after = null;
  let title = '';
  while (products.length < limit) {
    const data = await storefrontRequest(query, { handle, first: Math.min(pageSize(), limit - products.length), after });
    if (!data.collection) return { found: false, handle, title: '', products: [] };
    title = data.collection.title;
    products.push(...data.collection.products.nodes.map(normalizeProduct));
    if (!data.collection.products.pageInfo.hasNextPage) break;
    after = data.collection.products.pageInfo.endCursor;
  }
  return { found: true, handle, title, products };
}

/**
 * Fetch several collections in ONE request (first page each).
 * Missing/unknown handles resolve to `found: false` rather than throwing.
 * @returns {Promise<Object<string, {found:boolean, title:string, products:object[], hasMore:boolean}>>}
 */
export async function fetchCollectionsBatch(handles) {
  const unique = [...new Set(handles.filter(Boolean))];
  const result = {};
  if (unique.length === 0) return result;

  const vars = { first: pageSize() };
  const defs = ['$first: Int!'];
  const body = unique.map((h, i) => {
    vars[`h${i}`] = h;
    defs.push(`$h${i}: String!`);
    return `c${i}: collection(handle: $h${i}) {
      handle title
      products(first: $first) { pageInfo { hasNextPage } nodes { ...ProductFields } }
    }`;
  });

  const data = await storefrontRequest(
    `${PRODUCT_FRAGMENT} query CollectionsBatch(${defs.join(', ')}) { ${body.join('\n')} }`,
    vars
  );

  unique.forEach((h, i) => {
    const c = data[`c${i}`];
    result[h] = c
      ? {
          found: true,
          title: c.title,
          products: c.products.nodes.map(normalizeProduct),
          hasMore: c.products.pageInfo.hasNextPage
        }
      : { found: false, title: '', products: [], hasMore: false };
  });
  return result;
}

/** Fetch full product details by handle (null when not found). */
export async function fetchProductByHandle(handle) {
  if (!handle) return null;
  const data = await storefrontRequest(
    `${PRODUCT_FRAGMENT} query ProductByHandle($handle: String!) { product(handle: $handle) { ...ProductFields } }`,
    { handle }
  );
  return normalizeProduct(data.product);
}

/** Fetch just the variants for a product (null when not found). */
export async function fetchProductVariants(handle) {
  const product = await fetchProductByHandle(handle);
  return product ? product.variants : null;
}

/** Free-text catalog search for the header search modal. */
export async function searchProducts(term, { limit = 8 } = {}) {
  const clean = String(term || '').trim();
  if (!clean) return [];
  const data = await storefrontRequest(
    `${PRODUCT_FRAGMENT} query SearchProducts($q: String!, $first: Int!) {
       products(first: $first, query: $q) { nodes { ...ProductFields } }
     }`,
    { q: clean, first: limit }
  );
  return data.products.nodes.map(normalizeProduct);
}

/* ------------------------------------------------------------------------- *
 * Variant selection & availability
 * ------------------------------------------------------------------------- */

/**
 * Find the variant matching a full set of selected options.
 * @param {object} product normalized product
 * @param {Object<string,string>} selected e.g. { Size: "10", Width: "D" }
 */
export function findVariant(product, selected) {
  return (
    product.variants.find((v) =>
      v.selectedOptions.every((o) => selected[o.name] === o.value)
    ) || null
  );
}

/** Initial selection: first available variant (or first variant). */
export function getDefaultSelection(product) {
  const base = product.variants.find((v) => v.available) || product.variants[0];
  const selected = {};
  (base?.selectedOptions || []).forEach((o) => { selected[o.name] = o.value; });
  return selected;
}

/**
 * Is an option value purchasable given the other current selections?
 * Used to grey-out sold-out sizes while the customer picks options.
 */
export function isOptionValueAvailable(product, optionName, value, selected) {
  const trial = { ...selected, [optionName]: value };
  return product.variants.some(
    (v) => v.available && v.selectedOptions.every((o) => trial[o.name] === undefined || trial[o.name] === o.value)
  );
}

export const isVariantAvailable = (variant) => Boolean(variant && variant.available);
export const isProductAvailable = (product) => Boolean(product && product.available);

/* ------------------------------------------------------------------------- *
 * Cart API (Storefront API `cart*` operations — NOT the deprecated checkout API)
 * ------------------------------------------------------------------------- */

function unwrapCart(payload, key) {
  const result = payload[key];
  if (result?.userErrors?.length) {
    throw new ShopifyError(result.userErrors[0].message, 'user', result.userErrors);
  }
  return result?.cart || null;
}

const userErrorFields = `userErrors { field message code }`;

export async function createCart(lines = [], discountCodes = []) {
  const data = await storefrontRequest(
    `${CART_FRAGMENT}
     mutation CartCreate($input: CartInput!) {
       cartCreate(input: $input) { cart { ...CartFields } ${userErrorFields} }
     }`,
    {
      input: {
        lines: lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: l.quantity })),
        ...(discountCodes.length ? { discountCodes } : {})
      }
    }
  );
  return unwrapCart(data, 'cartCreate');
}

/** Retrieve cart state. Resolves null if the cart expired / was completed. */
export async function getCart(cartId) {
  if (!cartId) return null;
  const data = await storefrontRequest(
    `${CART_FRAGMENT} query GetCart($id: ID!) { cart(id: $id) { ...CartFields } }`,
    { id: cartId }
  );
  return data.cart || null;
}

export async function addCartLines(cartId, lines) {
  const data = await storefrontRequest(
    `${CART_FRAGMENT}
     mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
       cartLinesAdd(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${userErrorFields} }
     }`,
    { cartId, lines: lines.map((l) => ({ merchandiseId: l.merchandiseId, quantity: l.quantity })) }
  );
  return unwrapCart(data, 'cartLinesAdd');
}

/** @param {{id:string, quantity:number}[]} lines cart LINE ids (not variant ids) */
export async function updateCartLines(cartId, lines) {
  const data = await storefrontRequest(
    `${CART_FRAGMENT}
     mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
       cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { ...CartFields } ${userErrorFields} }
     }`,
    { cartId, lines: lines.map((l) => ({ id: l.id, quantity: l.quantity })) }
  );
  return unwrapCart(data, 'cartLinesUpdate');
}

export async function removeCartLines(cartId, lineIds) {
  const data = await storefrontRequest(
    `${CART_FRAGMENT}
     mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
       cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { ...CartFields } ${userErrorFields} }
     }`,
    { cartId, lineIds }
  );
  return unwrapCart(data, 'cartLinesRemove');
}

/** Apply / clear Shopify discount codes (validated by Shopify, never in the browser). */
export async function updateCartDiscountCodes(cartId, discountCodes) {
  const data = await storefrontRequest(
    `${CART_FRAGMENT}
     mutation CartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
       cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) { cart { ...CartFields } ${userErrorFields} }
     }`,
    { cartId, discountCodes }
  );
  return unwrapCart(data, 'cartDiscountCodesUpdate');
}

/** Hand the customer to Shopify-hosted checkout. */
export function redirectToCheckout(checkoutUrl) {
  if (!checkoutUrl) throw new ShopifyError('No checkout URL is available for this cart.', 'user');
  window.location.assign(checkoutUrl);
}
