/**
 * HIGH CALIBER BOOTS — Mock Product Catalog (Development Dataset)
 * 
 * NOTICE: Clearly marked temporary/demo product data for development.
 * This file isolates mock catalog records until Shopify Storefront API
 * credentials and live store collections are supplied.
 * Do not present invented products as actual verified High Caliber store inventory.
 */

export const MOCK_PRODUCTS = [
  // =========================================================================
  // 1. EXOTIC BOOTS
  // =========================================================================
  {
    id: "gid://shopify/Product/101",
    handle: "caiman-belly-western-boot-espresso",
    title: "Caiman Belly Western Boot",
    vendor: "High Caliber Select",
    productType: "Exotic Boots",
    collection: "exotic-boots",
    collections: ["boots", "exotic-boots", "featured", "new"],
    price: 495.00,
    compareAtPrice: 550.00,
    badge: "EXOTIC GRADE A",
    rating: 4.9,
    reviewCount: 48,
    available: true,
    bootType: "Western Boot",
    toeShape: "Wide Square Toe",
    material: "Caiman Belly Leather",
    heel: '1.5" Stockman Heel',
    sole: "Hand-Pegged Leather Outsole with Lemonwood Pegs",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Exotic", "Caiman", "Square Toe", "Men's Boots", "Handcrafted", "Featured"],
    variants: [
      { id: "gid://shopify/ProductVariant/201", title: "8.5 D", price: 495.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/202", title: "9.0 D", price: 495.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/203", title: "9.5 D", price: 495.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/204", title: "10.0 D", price: 495.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/205", title: "10.5 D", price: 495.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/206", title: "11.0 D", price: 495.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/207", title: "11.5 D", price: 495.00, available: true, stock: 2 },
      { id: "gid://shopify/ProductVariant/208", title: "12.0 D", price: 495.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/209", title: "10.0 EE (Wide)", price: 495.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/210", title: "11.0 EE (Wide)", price: 495.00, available: false, stock: 0 }
    ],
    description: "Handcrafted from genuine caiman belly leather, this standout pair features deep espresso glazed scales paired with a supple calfskin shaft. Built with traditional lemonwood pegging, channeled leather insole, and reinforced steel shank for all-day comfort and commanding presence.",
    details: [
      "Vamp: Genuine caiman belly leather in rich deep espresso",
      "Shaft: 12-inch premium calfskin with multi-row Western stitch cord",
      "Toe: Wide Square Toe with reinforced double-stitch welt",
      "Heel: 1.5-inch underslung stockman heel with durable rubber cap",
      "Outsole: Channeled leather sole with brass nails and lemonwood pegging",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/102",
    handle: "nile-crocodile-roper-boot-black",
    title: "Nile Crocodile Roper Boot",
    vendor: "High Caliber Select",
    productType: "Exotic Boots",
    collection: "exotic-boots",
    collections: ["boots", "exotic-boots", "new"],
    price: 585.00,
    compareAtPrice: 650.00,
    badge: "LIMITED RESERVE",
    rating: 5.0,
    reviewCount: 32,
    available: true,
    bootType: "Roper Boot",
    toeShape: "Round Roper Toe",
    material: "Nile Crocodile",
    heel: '1.125" Low Walking Heel',
    sole: "Oiled Leather Sole",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Exotic", "Crocodile", "Roper", "Round Toe", "Black Leather"],
    variants: [
      { id: "gid://shopify/ProductVariant/211", title: "9.0 D", price: 585.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/212", title: "9.5 D", price: 585.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/213", title: "10.0 D", price: 585.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/214", title: "10.5 D", price: 585.00, available: true, stock: 2 },
      { id: "gid://shopify/ProductVariant/215", title: "11.0 D", price: 585.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/216", title: "12.0 D", price: 585.00, available: true, stock: 2 }
    ],
    description: "An understated luxury roper crafted from selected glazed Nile crocodile flanks. The low walking heel and round roper toe offer timeless versatility from formal gatherings to long days on your feet.",
    details: [
      "Vamp: Selected glazed Nile crocodile in obsidian black",
      "Shaft: 10-inch matched goat leather shaft with clean pull-straps",
      "Toe: Classic round roper profile",
      "Heel: 1 1/8-inch flat walking roper heel",
      "Sole: Hand-treated oiled sole with lemonwood pegging",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/103",
    handle: "black-diamond-stingray-western-boot",
    title: "Black Diamond Stingray Western Boot",
    vendor: "High Caliber Select",
    productType: "Exotic Boots",
    collection: "exotic-boots",
    collections: ["boots", "exotic-boots"],
    price: 645.00,
    compareAtPrice: 720.00,
    badge: "SIGNATURE",
    rating: 4.8,
    reviewCount: 26,
    available: true,
    bootType: "Western Boot",
    toeShape: "Cutter Toe",
    material: "Genuine Stingray with Polished Pearl Crown",
    heel: '1.625" Western Cowboy Heel',
    sole: "Hand-Pegged Leather Outsole",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Exotic", "Stingray", "Cutter Toe", "Black Leather", "High-End"],
    variants: [
      { id: "gid://shopify/ProductVariant/217", title: "9.5 D", price: 645.00, available: true, stock: 2 },
      { id: "gid://shopify/ProductVariant/218", title: "10.0 D", price: 645.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/219", title: "10.5 D", price: 645.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/220", title: "11.0 D", price: 645.00, available: true, stock: 2 },
      { id: "gid://shopify/ProductVariant/221", title: "11.5 D", price: 645.00, available: false, stock: 0 }
    ],
    description: "One of the most durable and visually arresting exotics on earth. Features an authentic polished stingray pearl diamond centered on each vamp, paired with a hand-stitched black calfskin shaft and cutter toe.",
    details: [
      "Vamp: Full row-cut genuine stingray with polished center diamond eye",
      "Shaft: 13-inch premium milled calfskin with tonal Western cord embroidery",
      "Toe: Sharp Cutter Toe with clean single welt",
      "Heel: 1 5/8-inch angled cowboy heel with spur ledge",
      "Sole: 3/4 Goodyear welt with double lemonwood pegging",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/104",
    handle: "full-quill-ostrich-boot-cognac",
    title: "Full Quill Ostrich Boot",
    vendor: "High Caliber Select",
    productType: "Exotic Boots",
    collection: "exotic-boots",
    collections: ["boots", "exotic-boots", "featured"],
    price: 540.00,
    compareAtPrice: 595.00,
    badge: "BESTSELLER",
    rating: 4.9,
    reviewCount: 64,
    available: true,
    bootType: "Western Boot",
    toeShape: "Wide Square Toe",
    material: "Full Quill Ostrich",
    heel: '1.5" Stockman Heel',
    sole: "Hand-Pegged Leather Outsole with Lemonwood Pegs",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Exotic", "Ostrich", "Cognac", "Square Toe", "Bestseller"],
    variants: [
      { id: "gid://shopify/ProductVariant/222", title: "8.5 D", price: 540.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/223", title: "9.0 D", price: 540.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/224", title: "9.5 D", price: 540.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/225", title: "10.0 D", price: 540.00, available: true, stock: 9 },
      { id: "gid://shopify/ProductVariant/226", title: "10.5 D", price: 540.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/227", title: "11.0 D", price: 540.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/228", title: "12.0 D", price: 540.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/229", title: "10.5 EE (Wide)", price: 540.00, available: true, stock: 3 }
    ],
    description: "Renowned for its unmatched softness and distinctive quill pattern, full quill ostrich offers incredible breathability and molds effortlessly to the wearer's foot within days.",
    details: [
      "Vamp: Full-grain Grade-A full quill ostrich skin in burnished cognac",
      "Shaft: 12-inch contrast goat leather shaft with 8-row Western stitching",
      "Toe: Broad square toe profile",
      "Heel: 1.5-inch stockman heel with slip-resistant heel plate",
      "Sole: Prime leather sole with lemonwood pegs and brass nail reinforcement",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },

  // =========================================================================
  // 2. WESTERN HERITAGE BOOTS
  // =========================================================================
  {
    id: "gid://shopify/Product/105",
    handle: "black-bison-roughout-western-boot",
    title: "Black Bison Roughout Western Boot",
    vendor: "High Caliber Select",
    productType: "Western Boots",
    collection: "western-boots",
    collections: ["boots", "western-boots", "featured"],
    price: 385.00,
    compareAtPrice: 425.00,
    badge: "RUGGED LUXURY",
    rating: 4.9,
    reviewCount: 51,
    available: true,
    bootType: "Western Boot",
    toeShape: "Medium Round Toe",
    material: "American Bison Roughout",
    heel: '1.5" Underslung Walking Heel',
    sole: "Hybrid Leather and Rubber Commando Outsole",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Western", "Bison", "Roughout", "Round Toe", "Rugged"],
    variants: [
      { id: "gid://shopify/ProductVariant/230", title: "9.0 D", price: 385.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/231", title: "9.5 D", price: 385.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/232", title: "10.0 D", price: 385.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/233", title: "10.5 D", price: 385.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/234", title: "11.0 D", price: 385.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/235", title: "12.0 D", price: 385.00, available: true, stock: 3 }
    ],
    description: "Built from heavy-nap American bison roughout that shrugs off scuffs, barbed wire, and pasture grit without sacrificing an ounce of rich Western character.",
    details: [
      "Vamp: Full-grain American bison roughout with natural textured grain",
      "Shaft: 11.5-inch matching bison shaft with corded spine",
      "Toe: Medium round toe with storm welt",
      "Heel: 1.5-inch walking heel with leather stack",
      "Sole: Hybrid outsole featuring Vibram mini-lug center insert",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/106",
    handle: "oil-tanned-ranch-boot-whiskey",
    title: "Oil-Tanned Ranch Boot",
    vendor: "High Caliber Select",
    productType: "Western Boots",
    collection: "western-boots",
    collections: ["boots", "western-boots"],
    price: 365.00,
    compareAtPrice: 395.00,
    badge: "PATINA READY",
    rating: 4.8,
    reviewCount: 39,
    available: true,
    bootType: "Western Boot",
    toeShape: "Wide Square Toe",
    material: "Oil-Tanned Pull-Up Cowhide",
    heel: '1.5" Stockman Heel',
    sole: "Hand-Pegged Leather Outsole",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1605812860427-4024433a70fd?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Western", "Oil-Tanned", "Square Toe", "Whiskey Leather"],
    variants: [
      { id: "gid://shopify/ProductVariant/236", title: "8.5 D", price: 365.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/237", title: "9.0 D", price: 365.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/238", title: "9.5 D", price: 365.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/239", title: "10.0 D", price: 365.00, available: true, stock: 10 },
      { id: "gid://shopify/ProductVariant/240", title: "10.5 D", price: 365.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/241", title: "11.0 D", price: 365.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/242", title: "12.0 D", price: 365.00, available: true, stock: 4 }
    ],
    description: "Rich, waxy pull-up leather steeped in natural oils that lighten at flex points and deepen with age. Built to develop a distinct golden whiskey patina over years of faithful ranch and town wear.",
    details: [
      "Vamp: Full-grain oil-tanned pull-up steerhide",
      "Shaft: 12-inch steerhide with heritage 6-row contrast stitching",
      "Toe: Wide square toe with clean double-row welt stitch",
      "Heel: 1.5-inch stockman heel",
      "Sole: Channeled leather sole with lemonwood pegging",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/107",
    handle: "heritage-calfskin-dress-western-boot",
    title: "Heritage Calfskin Dress Western Boot",
    vendor: "High Caliber Select",
    productType: "Western Boots",
    collection: "western-boots",
    collections: ["boots", "western-boots"],
    price: 420.00,
    compareAtPrice: null,
    badge: "DRESS WESTERN",
    rating: 5.0,
    reviewCount: 22,
    available: true,
    bootType: "Western Boot",
    toeShape: "French Snip Toe",
    material: "Hand-Burnished French Calfskin",
    heel: '1.75" Traditional Cowboy Heel',
    sole: "Polished Hard Leather Sole",
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1582845512747-e42001c95638?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Western", "Calfskin", "Snip Toe", "Dress Boots", "Dark Brown"],
    variants: [
      { id: "gid://shopify/ProductVariant/243", title: "9.0 D", price: 420.00, available: true, stock: 2 },
      { id: "gid://shopify/ProductVariant/244", title: "9.5 D", price: 420.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/245", title: "10.0 D", price: 420.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/246", title: "10.5 D", price: 420.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/247", title: "11.0 D", price: 420.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/248", title: "12.0 D", price: 420.00, available: true, stock: 2 }
    ],
    description: "An aristocratic Western silhouette crafted from hand-burnished French calfskin. Tailored with a clean French snip toe, hand-corded shaft embroidery, and mirror-finished leather sole.",
    details: [
      "Vamp: Full-grain French calfskin with hand-antiqued edge",
      "Shaft: 13-inch calfskin with fine cord embroidery",
      "Toe: French snip toe with clean single welt",
      "Heel: 1.75-inch pitched cowboy heel",
      "Sole: High-shine dressed leather sole with lemonwood pegging",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },

  // =========================================================================
  // 3. WORK & SAFETY BOOTS
  // =========================================================================
  {
    id: "gid://shopify/Product/108",
    handle: "steel-gauge-waterproof-work-boot",
    title: "Steel Gauge Waterproof Work Boot",
    vendor: "High Caliber Workwear",
    productType: "Work Boots",
    collection: "work-boots",
    collections: ["boots", "work-boots", "featured"],
    price: 245.00,
    compareAtPrice: 275.00,
    badge: "ASTM F2413-18",
    rating: 4.9,
    reviewCount: 78,
    available: true,
    bootType: "Work Boot",
    toeShape: "Broad Safety Toe",
    material: "Full-Grain Oiled Steerhide",
    heel: '1.25" Work Heel',
    sole: "Vibram Oil and Slip Resistant Lug Sole",
    safetyClassification: "ASTM F2413-18 M/I/C EH PR (Steel Toe / Electrical Hazard / Puncture Resistant)",
    images: [
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Work", "Steel Toe", "Safety", "Waterproof", "ASTM Certified"],
    variants: [
      { id: "gid://shopify/ProductVariant/249", title: "8.5 D", price: 245.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/250", title: "9.0 D", price: 245.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/251", title: "9.5 D", price: 245.00, available: true, stock: 9 },
      { id: "gid://shopify/ProductVariant/252", title: "10.0 D", price: 245.00, available: true, stock: 12 },
      { id: "gid://shopify/ProductVariant/253", title: "10.5 D", price: 245.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/254", title: "11.0 D", price: 245.00, available: true, stock: 11 },
      { id: "gid://shopify/ProductVariant/255", title: "12.0 D", price: 245.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/256", title: "10.5 EE (Wide)", price: 245.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/257", title: "11.5 EE (Wide)", price: 245.00, available: true, stock: 4 }
    ],
    description: "Engineered for harsh pipeline conditions, refineries, and heavy construction. Features an ASTM certified steel safety toe, breathable waterproof membrane, and Vibram oil-resistant lug outsole.",
    details: [
      "Vamp & Shaft: 2.2mm waterproof treated full-grain cowhide",
      "Safety: ASTM F2413-18 M/I/C EH certified steel toe",
      "Membrane: 100% waterproof breathable bootie lining",
      "Insole: Removable dual-density polyurethane anti-fatigue footbed",
      "Outsole: Heat, oil, chemical, and slip-resistant rubber lug",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/109",
    handle: "rig-runner-composite-toe-western-work-boot",
    title: "Rig Runner Composite Toe Western Work Boot",
    vendor: "High Caliber Workwear",
    productType: "Work Boots",
    collection: "work-boots",
    collections: ["boots", "work-boots"],
    price: 265.00,
    compareAtPrice: null,
    badge: "NON-METALLIC",
    rating: 4.8,
    reviewCount: 43,
    available: true,
    bootType: "Western Work Boot",
    toeShape: "Wide Square Safety Toe",
    material: "Waterproof Bison Leather",
    heel: '1.25" Walking Work Heel',
    sole: "Dual-Density Rubber Outsole with Ladder Lock Grips",
    safetyClassification: "ASTM F2413-18 M/I/C EH (Non-Metallic Composite Toe / Electrical Hazard)",
    images: [
      "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Work", "Composite Toe", "Western Work", "Bison", "EH Rated"],
    variants: [
      { id: "gid://shopify/ProductVariant/258", title: "9.0 D", price: 265.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/259", title: "9.5 D", price: 265.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/260", title: "10.0 D", price: 265.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/261", title: "10.5 D", price: 265.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/262", title: "11.0 D", price: 265.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/263", title: "12.0 D", price: 265.00, available: true, stock: 3 }
    ],
    description: "A pull-on Western silhouette built for demanding jobsites. Light non-metallic composite toe does not conduct cold or heat and passes through metal detectors seamlessly.",
    details: [
      "Vamp: Full-grain waterproof bison hide with scuff-resistant toe cap",
      "Shaft: 11-inch western pull-on shaft with heavy-duty pull holes",
      "Safety: Non-metallic composite safety toe ASTM F2413-18 EH rated",
      "Shank: High-torsion composite shank for all-day ladder support",
      "Outsole: Acid and chemical resistant rubber with 90-degree defined heel",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },

  // =========================================================================
  // 4. WESTERN CLOTHING
  // =========================================================================
  {
    id: "gid://shopify/Product/110",
    handle: "range-canvas-barn-jacket-tobacco",
    title: "Range Canvas Barn Jacket",
    vendor: "High Caliber Outfitter",
    productType: "Clothing",
    collection: "clothing",
    collections: ["clothing", "featured"],
    price: 195.00,
    compareAtPrice: 225.00,
    badge: "HEAVYWEIGHT",
    rating: 4.9,
    reviewCount: 37,
    available: true,
    bootType: null,
    toeShape: null,
    material: "14oz Waxed Cotton Duck Canvas with Blanket Lining",
    heel: null,
    sole: null,
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Clothing", "Jackets", "Canvas", "Waxed Cotton", "Tobacco"],
    variants: [
      { id: "gid://shopify/ProductVariant/264", title: "Small", price: 195.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/265", title: "Medium", price: 195.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/266", title: "Large", price: 195.00, available: true, stock: 9 },
      { id: "gid://shopify/ProductVariant/267", title: "X-Large", price: 195.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/268", title: "2X-Large", price: 195.00, available: true, stock: 5 }
    ],
    description: "Constructed from custom-milled 14-ounce heavy cotton duck canvas finished with natural weather-resistant wax. Lined with a warm wool-blend Southwestern blanket cloth and corduroy collar.",
    details: [
      "Shell: 14oz tightly woven cotton duck canvas with water-repellent wax finish",
      "Lining: Insulating wool-blend blanket body lining and quilted poly-sleeve lining",
      "Collar: 100% cotton wale corduroy collar and cuff facings",
      "Hardware: Heavy-gauge antiqued brass two-way front zipper with storm flap",
      "Pockets: Dual chest cargo pockets, dual fleece-lined handwarmer pockets",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/111",
    handle: "sawtooth-denim-western-shirt-raw-indigo",
    title: "Sawtooth Denim Western Shirt",
    vendor: "High Caliber Outfitter",
    productType: "Clothing",
    collection: "clothing",
    collections: ["clothing", "new"],
    price: 98.00,
    compareAtPrice: null,
    badge: "HERITAGE",
    rating: 4.8,
    reviewCount: 42,
    available: true,
    bootType: null,
    toeShape: null,
    material: "8.5oz Raw Ring-Spun Denim",
    heel: null,
    sole: null,
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Clothing", "Shirts", "Denim", "Sawtooth", "Raw Indigo"],
    variants: [
      { id: "gid://shopify/ProductVariant/269", title: "Small", price: 98.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/270", title: "Medium", price: 98.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/271", title: "Large", price: 98.00, available: true, stock: 10 },
      { id: "gid://shopify/ProductVariant/272", title: "X-Large", price: 98.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/273", title: "2X-Large", price: 98.00, available: true, stock: 4 }
    ],
    description: "A timeless Western staple crafted with genuine sawtooth flap pockets, mother-of-pearl snap fasteners, and a tailored Western back yoke. Cut from sturdy 8.5oz raw denim that molds to your silhouette.",
    details: [
      "Fabric: 8.5oz 100% ring-spun cotton raw denim",
      "Closures: Authentic iridescent pearl snap fasteners throughout",
      "Pockets: Dual sawtooth chest pockets with snap closures and pencil slot",
      "Yoke: Signature deep-V pointed Western shoulder and back yokes",
      "Fit: Tailored traditional Western cut with generous tail length",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },

  // =========================================================================
  // 5. FR (FLAME RESISTANT) CLOTHING
  // =========================================================================
  {
    id: "gid://shopify/Product/112",
    handle: "fr-heavyweight-welding-utility-jacket",
    title: "FR Heavyweight Welding & Utility Jacket",
    vendor: "High Caliber FR",
    productType: "FR Clothing",
    collection: "fr-clothing",
    collections: ["fr-clothing", "featured"],
    price: 215.00,
    compareAtPrice: 245.00,
    badge: "NFPA 2112 / 70E",
    rating: 5.0,
    reviewCount: 31,
    available: true,
    bootType: null,
    toeShape: null,
    material: "12oz 100% Flame Resistant Cotton Duck Canvas (ATPV 41 cal/cm²)",
    heel: null,
    sole: null,
    safetyClassification: "NFPA 2112 Certified & NFPA 70E PPE CAT 4",
    images: [
      "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["FR Clothing", "Flame Resistant", "NFPA 2112", "Safety Jacket", "Workwear"],
    variants: [
      { id: "gid://shopify/ProductVariant/274", title: "Medium (FR)", price: 215.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/275", title: "Large (FR)", price: 215.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/276", title: "X-Large (FR)", price: 215.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/277", title: "2X-Large (FR)", price: 215.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/278", title: "3X-Large (FR)", price: 215.00, available: true, stock: 2 }
    ],
    description: "Certified industrial protection built specifically for welders, utility lineman, and petrochemical operators. Meets and exceeds NFPA 2112 standards for flash fire protection and ASTM F1506 for arc flash hazard.",
    details: [
      "Protection Standard: NFPA 2112 certified by UL, NFPA 70E CAT 4 compliant",
      "Arc Rating: ATPV 41 cal/cm² quilted modacrylic thermal insulation",
      "Fabric: 12oz 100% flame resistant cotton duck with FR brass zipper",
      "Hardware: Heavy-duty concealed brass front zipper with protective Nomex tape",
      "Cuffs: Adjustable snap cuffs designed to fit comfortably over insulated gloves",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/113",
    handle: "fr-workwear-snap-front-work-shirt",
    title: "FR Workwear Snap-Front Work Shirt",
    vendor: "High Caliber FR",
    productType: "FR Clothing",
    collection: "fr-clothing",
    collections: ["fr-clothing"],
    price: 110.00,
    compareAtPrice: null,
    badge: "CAT 2 / 8.7 CAL",
    rating: 4.8,
    reviewCount: 29,
    available: true,
    bootType: null,
    toeShape: null,
    material: "7oz 88/12 FR Cotton-Nylon Twill",
    heel: null,
    sole: null,
    safetyClassification: "NFPA 2112 & NFPA 70E CAT 2 Compliant",
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["FR Clothing", "FR Shirt", "NFPA 2112", "Safety Twill"],
    variants: [
      { id: "gid://shopify/ProductVariant/279", title: "Small (FR)", price: 110.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/280", title: "Medium (FR)", price: 110.00, available: true, stock: 7 },
      { id: "gid://shopify/ProductVariant/281", title: "Large (FR)", price: 110.00, available: true, stock: 10 },
      { id: "gid://shopify/ProductVariant/282", title: "X-Large (FR)", price: 110.00, available: true, stock: 8 },
      { id: "gid://shopify/ProductVariant/283", title: "2X-Large (FR)", price: 110.00, available: true, stock: 5 }
    ],
    description: "Daily jobsite comfort meets uncompromising compliance. Breathable lightweight FR twill features durable melamine snap closures and dual chest pockets with safety pen slots.",
    details: [
      "Protection Standard: NFPA 2112 certified and NFPA 70E compliant",
      "Arc Rating: ATPV 8.7 cal/cm² (CAT 2)",
      "Fabric: 7oz flame-resistant 88% cotton / 12% high-tenacity nylon blend",
      "Closures: Non-conductive heavy-duty pearl snap buttons with Nomex stitching",
      "Pockets: Two chest pockets with snap flaps; left pocket has pencil opening",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },

  // =========================================================================
  // 6. ACCESSORIES, BELTS, HATS, COLOGNE
  // =========================================================================
  {
    id: "gid://shopify/Product/114",
    handle: "hand-tooled-floral-western-belt-cognac",
    title: "Hand-Tooled Floral Western Belt",
    vendor: "High Caliber Leathercraft",
    productType: "Accessories",
    collection: "accessories",
    collections: ["accessories", "featured"],
    price: 135.00,
    compareAtPrice: 155.00,
    badge: "HAND-TOOLED",
    rating: 4.9,
    reviewCount: 36,
    available: true,
    bootType: null,
    toeShape: null,
    material: "9oz Hermann Oak Vegetable-Tanned Saddle Leather",
    heel: null,
    sole: null,
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Accessories", "Belts", "Hand-Tooled", "Leathercraft", "Cognac"],
    variants: [
      { id: "gid://shopify/ProductVariant/284", title: "32-inch", price: 135.00, available: true, stock: 3 },
      { id: "gid://shopify/ProductVariant/285", title: "34-inch", price: 135.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/286", title: "36-inch", price: 135.00, available: true, stock: 6 },
      { id: "gid://shopify/ProductVariant/287", title: "38-inch", price: 135.00, available: true, stock: 5 },
      { id: "gid://shopify/ProductVariant/288", title: "40-inch", price: 135.00, available: true, stock: 4 },
      { id: "gid://shopify/ProductVariant/289", title: "42-inch", price: 135.00, available: true, stock: 2 }
    ],
    description: "Handcrafted from 9oz American saddle leather, hand-carved with deep floral Sheridan tooling and antiqued with natural oils. Includes an interchangeable solid antiqued brass buckle.",
    details: [
      "Leather: Full-grain 9-10oz vegetable-tanned American steerhide",
      "Width: Standard 1.5-inch width compatible with Western trousers and jeans",
      "Tooling: Genuine hand-carved floral motif with hand-dyed dark contrast background",
      "Hardware: Removable solid brass engraved buckle secured by heavy Chicago screws",
      "Edges: Hand-beveled, burnished with beeswax, and edge-coated",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/115",
    handle: "high-caliber-signature-amber-smoke-cologne",
    title: "High Caliber Amber & Smoke Cologne",
    vendor: "High Caliber Apothecary",
    productType: "Accessories",
    collection: "accessories",
    collections: ["accessories", "new"],
    price: 88.00,
    compareAtPrice: null,
    badge: "SIGNATURE SCENT",
    rating: 5.0,
    reviewCount: 45,
    available: true,
    bootType: null,
    toeShape: null,
    material: "100ml Eau de Parfum (Leather, Bourbon, Amber, Cedarwood, Cured Tobacco)",
    heel: null,
    sole: null,
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Accessories", "Cologne", "Fragrance", "Leather", "Amber"],
    variants: [
      { id: "gid://shopify/ProductVariant/290", title: "100ml / 3.4 fl oz", price: 88.00, available: true, stock: 18 }
    ],
    description: "An unmistakably masculine eau de parfum opening with cracked black pepper and aged leather, deepening into Texas cedarwood, rich bourbon cask, and smoldering dark pipe tobacco.",
    details: [
      "Size: 100ml / 3.4 FL. OZ. heavyweight glass flacon with magnetic bronze cap",
      "Concentration: Eau de Parfum (18% fragrance oil concentration for 12+ hour longevity)",
      "Top Notes: Bergamot, Crushed Allspice, Scorched Birch Bark",
      "Heart Notes: Worn Saddle Leather, Dark Amber Resin, Texas Cedar",
      "Base Notes: Aged Bourbon Cask, Smoked Vanilla Bean, Sweet Pipe Tobacco",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  },
  {
    id: "gid://shopify/Product/116",
    handle: "black-caiman-leather-bifold-wallet",
    title: "Black Caiman Leather Bifold Wallet",
    vendor: "High Caliber Leathercraft",
    productType: "Accessories",
    collection: "accessories",
    collections: ["accessories"],
    price: 115.00,
    compareAtPrice: 130.00,
    badge: "GENUINE EXOTIC",
    rating: 4.9,
    reviewCount: 28,
    available: true,
    bootType: null,
    toeShape: null,
    material: "Genuine Glazed Caiman Belly Exterior with Full-Grain Calfskin Interior",
    heel: null,
    sole: null,
    safetyClassification: null,
    images: [
      "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=900&q=85",
      "https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=900&q=85"
    ],
    tags: ["Accessories", "Wallets", "Caiman", "Exotic", "Bifold"],
    variants: [
      { id: "gid://shopify/ProductVariant/291", title: "Standard Bifold", price: 115.00, available: true, stock: 8 }
    ],
    description: "Precision-stitched from select caiman belly scales with an interior crafted from supple full-grain calfskin. Built with RFID blocking mesh to keep credentials secure.",
    details: [
      "Exterior: Genuine glazed caiman belly tile in obsidian black",
      "Interior: Ultra-thin full-grain calfskin with 8 card slots and dual cash dividers",
      "Security: High-density RFID shielding integrated into lining",
      "Dimensions: 4.25-inch x 3.5-inch folded",
      "Origin: [MANUFACTURING ORIGIN PLACEHOLDER]"
    ]
  }
];

export function getMockProductById(id) {
  return MOCK_PRODUCTS.find(p => p.id === id) || null;
}

export function getMockProductByHandle(handle) {
  return MOCK_PRODUCTS.find(p => p.handle === handle) || null;
}

export function getMockProductsByCollection(collectionHandle) {
  if (!collectionHandle || collectionHandle === 'all') {
    return MOCK_PRODUCTS;
  }
  return MOCK_PRODUCTS.filter(p => 
    p.collection === collectionHandle || 
    (p.collections && p.collections.includes(collectionHandle))
  );
}
