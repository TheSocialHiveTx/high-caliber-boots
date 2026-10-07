/**
 * HIGH CALIBER — Centralized Shopify Configuration
 * ---------------------------------------------------------------------------
 * Centralized Storefront API configuration and collection handle mapping.
 *
 * SECURITY DIRECTIVE:
 * - ONLY public Storefront API Access Tokens may be placed here.
 * - NEVER place an Admin API token (shpat_*) or app secret here.
 */

export const shopifyConfig = {
  // Customer's live Shopify Storefront domain
  domain: "high-caliber-boots.myshopify.com",

  // Customer's PUBLIC Storefront API Access Token
  storefrontToken: "c4e456e829b6bce119f56a557fd871b6",

  // Supported Shopify Storefront API GraphQL version
  apiVersion: "2024-07",

  // Full GraphQL endpoint URL
  get endpoint() {
    return `https://${this.domain}/api/${this.apiVersion}/graphql.json`;
  },

  /**
   * Shopify Collection Handles (URL slugs in Shopify Admin)
   * Matches customer's live collections + configurable placeholders for future ones.
   */
  collections: {
    boots: "boots",             // Live "Boots" collection (12 products)
    mensBoots: "",              // Configurable sub-filter handle
    womensBoots: "",            // Configurable sub-filter handle

    clothing: "frontpage",      // Live "Women Wear" collection (3 jacket products)
    tshirts: "",
    leatherJackets: "",
    sweaters: "",
    womensClothing: "",

    accessories: "",           // Future accessories collection
    beltsBuckles: "",
    cologne: "",
    glasses: "",
    cowboyHats: "",
    westernJewelry: "",

    featured: "boots",         // Uses Boots collection for homepage featured section
    newArrivals: "boots",      // Uses Boots collection for homepage new arrivals
    promotions: ""             // Derived automatically from compareAtPrice if blank
  },

  // Storefront display settings
  settings: {
    pageSize: 50,              // Products per Shopify request (max 250)
    maxProducts: 250,          // Safety cap when paging through catalog
    homeSectionLimit: 8,       // Products per homepage section
    freeShippingThreshold: 150,// Cart drawer progress meter ($150 USD)
    freeShippingLabel: "complimentary insured freight"
  }
};

/**
 * Page -> category layout mapping. Order here is the order of filter tabs.
 */
export const catalogLayout = {
  boots: {
    primary: "boots",
    categories: [
      { key: "mensBoots", label: "Men's Boots" },
      { key: "womensBoots", label: "Women's Boots" }
    ]
  },
  clothing: {
    primary: "clothing",
    categories: [
      { key: "tshirts", label: "T-Shirts" },
      { key: "leatherJackets", label: "Leather Jackets" },
      { key: "sweaters", label: "Sweaters" },
      { key: "womensClothing", label: "Women's Clothing" }
    ]
  },
  accessories: {
    primary: "accessories",
    categories: [
      { key: "beltsBuckles", label: "Belts & Buckles" },
      { key: "cologne", label: "Cologne" },
      { key: "glasses", label: "Glasses" },
      { key: "cowboyHats", label: "Cowboy Hats" },
      { key: "westernJewelry", label: "Western Jewelry" }
    ]
  }
};

/** True when required public connection credentials are provided. */
export function isShopifyConfigured() {
  return Boolean(shopifyConfig.domain && shopifyConfig.storefrontToken);
}

/** Resolve a config key (e.g., "mensBoots") to its Shopify handle ("" if unset). */
export function getHandle(key) {
  return (shopifyConfig.collections[key] || "").trim();
}
