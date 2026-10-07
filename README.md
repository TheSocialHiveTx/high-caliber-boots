# High Caliber — Headless Shopify Storefront (GitHub Pages)

A static storefront in plain HTML, CSS and JavaScript. **Shopify is the commerce backend** (products, prices, inventory, cart, checkout); this site is the customer-facing frontend. There is no build step, no framework and no Shopify theme.

```
Shopify (Storefront API, public token) → static pages on GitHub Pages → Shopify-hosted checkout
```

## The 8 primary pages (locked)

| Page | Path | Shopify data |
|---|---|---|
| Home | `/` | Featured, New Arrivals, Promotions |
| Shop | `/shop/` | Entire catalog (no "Shop" collection needed) |
| Boots | `/boots/` | `boots` + tabs: Men's Boots, Women's Boots |
| Clothing | `/clothing/` | `clothing` + tabs: T-Shirts, Leather Jackets, Sweaters, Women's Clothing |
| Accessories | `/accessories/` | `accessories` + tabs: Belts & Buckles, Cologne, Glasses, Cowboy Hats, Western Jewelry |
| About Us | `/about/` | none |
| Contact Us | `/contact/` | none |
| FAQ / Shipping & Returns | `/faq/` | none |

Categories are **tabs inside a page**, never extra pages. Product details open in an in-page dialog (deep link: `/boots/#product=<handle>`). A category tab is hidden automatically while its collection handle is blank, missing or has no products, so future categories (Women's Boots, Cowboy Hats, Women's Clothing, Western Jewelry) appear on their own once products are added in Shopify.

## Files

```
assets/js/
  shopify-config.js   ← the ONLY file you edit to connect Shopify (domain, token, version, collection handles)
  shopify-api.js      GraphQL transport, catalog/collection/product queries, variants, Cart API, checkout redirect
  products.js         the single product card + product dialog (used by every page)
  cart.js             sitewide cart drawer on the Shopify Cart API (persistent cart ID in localStorage)
  storefront.js       page controllers (Home / Shop / Boots / Clothing / Accessories)
  main.js             header, mobile nav, search (live Storefront search), accordions, newsletter UI
```

Each commerce page declares `<body data-page="home|shop|boots|clothing|accessories">`.

## Going live — what you must provide

1. **Store domain** → `domain` (`your-store.myshopify.com`).
2. **Storefront API public access token** → `storefrontToken`. Create it via Shopify admin → *Settings → Apps and sales channels → Develop apps* (or the Headless channel). Enable Storefront scopes: read products/listings, read inventory (optional), and the cart/checkout scopes. **Never** use an Admin API token here.
3. **API version** → confirm `apiVersion` is currently supported (quarterly releases).
4. **Collection handles** → in Shopify create the collections below and paste each *handle* (the URL slug) into `collections`. A product can be in many collections (a men's boot belongs to `boots` **and** `mensBoots`).

   Boots, Men's Boots, Women's Boots · Clothing, T-Shirts, Leather Jackets, Sweaters, Women's Clothing · Accessories, Belts & Buckles, Cologne, Glasses, Cowboy Hats, Western Jewelry · Featured, New Arrivals · (optional) Promotions.

   The existing *Boots / Women Wear / Men Wear* collections do not drive the frontend; only the handles you enter do.
5. **Publish products and collections to the sales channel that owns the token** (Online Store / Headless), otherwise the Storefront API will not return them.
6. Set shipping, taxes, payments and the discount code(s) in Shopify. Discount codes entered in the cart are validated by Shopify.

Until steps 1–2 are filled in, pages show a friendly "catalog is being stocked" state, the cart is inactive, and nothing is faked.

## Security

Only the public Storefront token lives in the browser. Admin API tokens, API secret keys and client secrets must never be committed. Checkout is Shopify-hosted; no payment data touches this site. Operations that need privileged access (e.g. real newsletter signup storage, order lookup/customer accounts, inventory counts beyond what the Storefront API exposes) cannot be done safely from GitHub Pages and need Shopify Forms/Email, Shopify customer accounts, or a small serverless proxy.

## Deploy

Push to GitHub and enable Pages for the branch root. All internal URLs are resolved from the script location, so it works on a custom domain or on a `/<repo-name>/` project site. Update the `https://highcaliberboots.com` canonical/Open Graph URLs if your final domain differs.
