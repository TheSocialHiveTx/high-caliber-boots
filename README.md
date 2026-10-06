# HIGH CALIBER BOOTS — Front-End Storefront Architecture

Production-ready, bespoke static front end for **High Caliber Boots**, designed with an unapologetic dark Western aesthetic, tactile leather material language, and headless commerce integration anticipating the **Shopify Storefront API**.

---

## 1. Commerce Architecture

High Caliber operates on a modern decoupled headless architecture:

```
High Caliber Shopify Admin
        ↓
Products, Variants, Collections & Inventory
        ↓
Shopify Storefront API (GraphQL)
        ↓
High Caliber Static Website (HTML5, Modern CSS, Vanilla JS)
        ↓
Interactive Slide-Out Cart
        ↓
Shopify Hosted 256-Bit SSL Checkout
```

### Storefront API Configuration
The Shopify integration layer is cleanly isolated in `/assets/js/shopify.js`. 
To connect a live Shopify store:
1. Open `/assets/js/shopify.js`.
2. Replace `SHOPIFY_CONFIG.storeDomain` with your myshopify domain (e.g., `high-caliber-boots.myshopify.com`).
3. Replace `SHOPIFY_CONFIG.storefrontAccessToken` with your public Storefront API token.
4. The application will automatically switch from the development mock dataset to live GraphQL collection and product queries.

> **Security Mandate:** Never insert Shopify Admin API private tokens into client-side JavaScript. Only public Storefront Access Tokens are supported.

---

## 2. Directory Structure

```
/
├── index.html                   # High Caliber Homepage (All 9 sections)
├── shop/
│   └── index.html               # Shop All Catalog with Faceted Filters
├── boots/
│   ├── index.html               # All Boots Overview
│   ├── exotic/
│   │   └── index.html           # Exotic Leather Boots (Caiman, Crocodile, Ostrich, Stingray)
│   ├── western/
│   │   └── index.html           # Traditional Western & Buckaroo Boots
│   └── work/
│       └── index.html           # ASTM Safety Steel & Composite Work Boots
├── clothing/
│   └── index.html               # Ranch Shirts, Denim, & Waxed Coats
├── fr-clothing/
│   └── index.html               # Certified NFPA 2112 & CAT 2 Flame Resistant Workwear
├── accessories/
│   └── index.html               # Hand-Tooled Floral Leather Belts & Gear
├── about/
│   └── index.html               # High Caliber Story & Craftsmanship Principles
├── contact/
│   └── index.html               # Customer Support & Inquiries
├── faq/
│   └── index.html               # FAQ, Sizing Guides, Shipping, & Returns
├── product/
│   └── index.html               # Reusable Product Detail Template (PDP)
│
├── assets/
│   ├── css/
│   │   ├── styles.css           # Modern CSS System, Color Tokens, Components
│   │   └── responsive.css       # Mobile-first Breakpoints (375px to 1440px+)
│   ├── js/
│   │   ├── main.js              # Header Scroll, Mobile Drawer, Search, Accordions
│   │   ├── products.js          # Reusable Product Card & Grid Renderer
│   │   ├── mock-products.js     # Isolated Development Catalog (16 items)
│   │   ├── shopify.js           # Shopify Storefront API GraphQL Client
│   │   └── cart.js              # Persistent Client Cart & Drawer Controller
│   └── images/
│       ├── branding/            # Logo & Monogram SVGs
│       ├── textures/            # Caiman Scale & Western Filigree Dividers
│       ├── hero/                # Section Backdrops & Editorial Graphics
│       ├── categories/          # Category Editorial Illustrations
│       └── products/            # Primary & Secondary Product Views (32 SVGs)
└── README.md
```

---

## 3. Brand & Visual System

- **Primary Background:** `#090909` (Deep Charcoal Black)
- **Secondary Background:** `#111111`
- **Elevated Card Surfaces:** `#181716`
- **Warm Dark Brown:** `#211A15`
- **Weathered Bronze:** `#806247`
- **Leather Brown:** `#9A542E`
- **Rust Accent:** `#A54B25` (Industrial & Safety Accents)
- **Warm Tan:** `#C7A477` (Primary Western Metallic Accent)
- **Off-White:** `#F1EDE6` (Headings & Typography)
- **Borders:** `rgba(199, 164, 119, 0.20)`
- **Typography:** `Cinzel` for editorial Western headings paired with clean `Plus Jakarta Sans` for body legibility.

---

## 4. Hosting & Deployment

The codebase is built entirely with semantic HTML5, modern CSS, and vanilla ES modules using relative path resolution. It runs identically on:
- **GitHub Pages**
- **Cloudflare Pages / Vercel / Netlify**
- **Amazon S3 / Google Cloud Storage**
- **Standard Apache / Nginx web servers**
