/**
 * HIGH CALIBER BOOTS — Shopify Storefront API Integration Layer
 * 
 * Architecture:
 * High Caliber Shopify Admin 
 *   → Products & Collections 
 *   → Shopify Storefront API (GraphQL) 
 *   → High Caliber Static Front-End 
 *   → Cart 
 *   → Shopify Hosted Checkout
 * 
 * SECURITY DIRECTIVE:
 * Never use Shopify Admin API credentials in client-side code.
 * Only use public Shopify Storefront Access Tokens (read-only for storefront).
 */

import { 
  MOCK_PRODUCTS, 
  getMockProductByHandle, 
  getMockProductsByCollection 
} from './mock-products.js';

// Configuration Placeholders (Replace with your actual Shopify store credentials)
export const SHOPIFY_CONFIG = {
  // e.g. "high-caliber-boots.myshopify.com"
  storeDomain: "SHOPIFY_STORE_DOMAIN",
  // Storefront API access token (Public token generated in Shopify Admin > Headless / Storefront App)
  storefrontAccessToken: "SHOPIFY_STOREFRONT_ACCESS_TOKEN",
  // Storefront API GraphQL version
  apiVersion: "2024-01"
};

/**
 * Checks if real Shopify credentials have been configured
 */
export function isShopifyConfigured() {
  return (
    SHOPIFY_CONFIG.storeDomain !== "SHOPIFY_STORE_DOMAIN" &&
    Boolean(SHOPIFY_CONFIG.storeDomain) &&
    SHOPIFY_CONFIG.storefrontAccessToken !== "SHOPIFY_STOREFRONT_ACCESS_TOKEN" &&
    Boolean(SHOPIFY_CONFIG.storefrontAccessToken)
  );
}

/**
 * Executes a GraphQL query against the Shopify Storefront API
 */
async function shopifyGraphQL(query, variables = {}) {
  if (!isShopifyConfigured()) {
    console.info(
      "[High Caliber Storefront] Running in development mode using local mock dataset. " +
      "To connect live Shopify inventory, configure SHOPIFY_STORE_DOMAIN and " +
      "SHOPIFY_STOREFRONT_ACCESS_TOKEN in /assets/js/shopify.js."
    );
    return null;
  }

  const endpoint = `https://${SHOPIFY_CONFIG.storeDomain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_CONFIG.storefrontAccessToken,
        "Accept": "application/json"
      },
      body: JSON.stringify({ query, variables })
    });

    if (!response.ok) {
      throw new Error(`Shopify API responded with status ${response.status}`);
    }

    const json = await response.json();
    if (json.errors) {
      console.error("[High Caliber Storefront] GraphQL Errors:", json.errors);
      throw new Error(json.errors[0]?.message || "GraphQL query error");
    }

    return json.data;
  } catch (error) {
    console.warn("[High Caliber Storefront] GraphQL request failed, falling back to mock dataset:", error);
    return null;
  }
}

/**
 * Fetch a collection by handle
 * Future Shopify integration uses GraphQL query: collection(handle)
 */
export async function fetchCollection(handle, options = {}) {
  if (isShopifyConfigured()) {
    const query = `
      query GetCollection($handle: String!, $first: Int!) {
        collection(handle: $handle) {
          id
          title
          description
          products(first: $first) {
            edges {
              node {
                id
                handle
                title
                vendor
                productType
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                compareAtPriceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 2) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 20) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
                tags
              }
            }
          }
        }
      }
    `;

    const data = await shopifyGraphQL(query, { handle, first: options.limit || 24 });
    if (data?.collection) {
      return normalizeShopifyCollection(data.collection);
    }
  }

  // Graceful fallback to mock products
  const products = getMockProductsByCollection(handle);
  return {
    handle,
    title: formatCollectionTitle(handle),
    products
  };
}

/**
 * Fetch a single product by handle
 * Future Shopify integration uses GraphQL query: product(handle)
 */
export async function fetchProduct(handle) {
  if (isShopifyConfigured()) {
    const query = `
      query GetProduct($handle: String!) {
        product(handle: $handle) {
          id
          handle
          title
          vendor
          productType
          description
          descriptionHtml
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 8) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 50) {
            edges {
              node {
                id
                title
                availableForSale
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
          tags
        }
      }
    `;

    const data = await shopifyGraphQL(query, { handle });
    if (data?.product) {
      return normalizeShopifyProduct(data.product);
    }
  }

  return getMockProductByHandle(handle);
}

/**
 * Creates a new checkout cart in Shopify
 * Future Shopify integration uses GraphQL mutation: cartCreate
 */
export async function createCart(lines = []) {
  if (isShopifyConfigured()) {
    const mutation = `
      mutation CartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 50) {
              edges {
                node {
                  id
                  quantity
                }
              }
            }
          }
        }
      }
    `;
    const input = {
      lines: lines.map(line => ({
        merchandiseId: line.variantId,
        quantity: line.quantity
      }))
    };
    const data = await shopifyGraphQL(mutation, { input });
    return data?.cartCreate?.cart || null;
  }

  return {
    id: "mock_cart_" + Date.now(),
    checkoutUrl: null,
    lines
  };
}

/**
 * Adds line items to an existing cart
 * Future Shopify integration uses GraphQL mutation: cartLinesAdd
 */
export async function addToCart(cartId, lines = []) {
  if (isShopifyConfigured()) {
    const mutation = `
      mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;
    const data = await shopifyGraphQL(mutation, {
      cartId,
      lines: lines.map(l => ({ merchandiseId: l.variantId, quantity: l.quantity }))
    });
    return data?.cartLinesAdd?.cart || null;
  }
  return { id: cartId };
}

/**
 * Updates item quantities in an existing cart
 * Future Shopify integration uses GraphQL mutation: cartLinesUpdate
 */
export async function updateCartLines(cartId, lines = []) {
  if (isShopifyConfigured()) {
    const mutation = `
      mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;
    const data = await shopifyGraphQL(mutation, { cartId, lines });
    return data?.cartLinesUpdate?.cart || null;
  }
  return { id: cartId };
}

/**
 * Removes lines from an existing cart
 * Future Shopify integration uses GraphQL mutation: cartLinesRemove
 */
export async function removeCartLines(cartId, lineIds = []) {
  if (isShopifyConfigured()) {
    const mutation = `
      mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
          }
        }
      }
    `;
    const data = await shopifyGraphQL(mutation, { cartId, lineIds });
    return data?.cartLinesRemove?.cart || null;
  }
  return { id: cartId };
}

/**
 * Normalizes a Shopify GraphQL product into the High Caliber model
 */
function normalizeShopifyProduct(node) {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    vendor: node.vendor,
    productType: node.productType,
    collection: node.productType ? node.productType.toLowerCase().replace(/\s+/g, '-') : 'all',
    price: parseFloat(node.priceRange?.minVariantPrice?.amount || 0),
    compareAtPrice: node.compareAtPriceRange?.minVariantPrice ? parseFloat(node.compareAtPriceRange.minVariantPrice.amount) : null,
    badge: node.tags?.includes('Exotic') ? 'EXOTIC' : node.tags?.includes('New') ? 'NEW' : null,
    available: node.availableForSale,
    images: node.images?.edges?.map(e => e.node.url) || [],
    tags: node.tags || [],
    variants: node.variants?.edges?.map(e => ({
      id: e.node.id,
      title: e.node.title,
      price: parseFloat(e.node.price?.amount || 0),
      available: e.node.availableForSale
    })) || [],
    description: node.description || '',
    details: [
      `Vendor: ${node.vendor}`,
      `Category: ${node.productType}`,
      `Origin: [MANUFACTURING ORIGIN PLACEHOLDER]`
    ]
  };
}

/**
 * Normalizes a Shopify GraphQL collection
 */
function normalizeShopifyCollection(col) {
  return {
    id: col.id,
    handle: col.handle,
    title: col.title,
    description: col.description,
    products: col.products?.edges?.map(e => normalizeShopifyProduct(e.node)) || []
  };
}

/**
 * Helper to display clean collection titles
 */
function formatCollectionTitle(handle) {
  const map = {
    'boots': 'All Boots',
    'exotic-boots': 'Exotic Boots',
    'western-boots': 'Western Boots',
    'work-boots': 'Work & Steel Toe Boots',
    'clothing': 'Western Clothing',
    'fr-clothing': 'FR Flame Resistant Clothing',
    'accessories': 'Accessories & Leather Belts',
    'featured': 'Featured Boots & Gear',
    'new': 'New Arrivals'
  };
  return map[handle] || handle.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
