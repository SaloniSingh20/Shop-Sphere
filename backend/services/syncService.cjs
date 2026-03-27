const { searchByPlatform, collectPlatformDatasets } = require("./productServices.cjs");
const { upsertProducts } = require("../db/productStore.cjs");

const DEFAULT_SYNC_PLAN = [
  {
    platform: "amazon",
    queries: [
      "wireless earbuds",
      "bluetooth headphones",
      "smartphone",
      "laptop",
      "smartwatch",
      "tablet",
      "power bank",
      "jeans",
      "lipstick",
    ],
  },
  {
    platform: "flipkart",
    queries: [
      "wireless earbuds",
      "bluetooth headphones",
      "smartphone",
      "laptop",
      "smartwatch",
      "tablet",
      "power bank",
      "jeans",
    ],
  },
  { platform: "nykaa", queries: ["lipstick", "serum", "foundation", "moisturizer", "sunscreen"] },
  { platform: "myntra", queries: ["jeans", "dress", "bag", "sneakers", "tshirt"] },
];

async function syncProducts({ perQueryLimit = 10 } = {}) {
  const runs = [];

  for (const entry of DEFAULT_SYNC_PLAN) {
    for (const query of entry.queries) {
      const sourceQuery = `${entry.platform}:${query}`;
      try {
        const products = await searchByPlatform(entry.platform, query, perQueryLimit);
        const persisted = await upsertProducts(products, sourceQuery);

        runs.push({
          ok: true,
          platform: entry.platform,
          query,
          fetched: products.length,
          persisted,
        });
      } catch (error) {
        runs.push({
          ok: false,
          platform: entry.platform,
          query,
          error: error.message || "Sync failed",
        });
      }
    }
  }

  return runs;
}

const COMPREHENSIVE_QUERY_BANK = {
  amazon: [
    "wireless earbuds",
    "bluetooth headphones",
    "smartphone",
    "laptop",
    "gaming laptop",
    "tablet",
    "smartwatch",
    "power bank",
    "keyboard",
    "mouse",
    "monitor",
    "router",
    "ssd",
    "memory card",
    "jeans",
    "tshirt",
    "lipstick",
    "face serum",
  ],
  flipkart: [
    "wireless earbuds",
    "bluetooth headphones",
    "smartphone",
    "laptop",
    "gaming laptop",
    "tablet",
    "smartwatch",
    "power bank",
    "keyboard",
    "mouse",
    "monitor",
    "router",
    "ssd",
    "memory card",
    "jeans",
    "tshirt",
  ],
  nykaa: [
    "lipstick",
    "serum",
    "foundation",
    "moisturizer",
    "sunscreen",
    "face wash",
    "mascara",
    "eyeliner",
    "perfume",
    "hair serum",
  ],
  myntra: [
    "jeans",
    "dress",
    "bag",
    "sneakers",
    "tshirt",
    "shirt",
    "jacket",
    "hoodie",
    "kurta",
    "watch",
  ],
};

async function syncComprehensiveDatasets({
  perQueryLimit = 20,
  pagesByPlatform = { amazon: 3, flipkart: 5, nykaa: 3, myntra: 3 },
} = {}) {
  const allRuns = [];
  const summary = {};

  for (const platform of Object.keys(COMPREHENSIVE_QUERY_BANK)) {
    const queries = COMPREHENSIVE_QUERY_BANK[platform];
    const pages = Number(pagesByPlatform[platform] || 1);

    const { products, runs } = await collectPlatformDatasets({
      platform,
      queries,
      perQueryLimit,
      pages,
    });

    const persisted = await upsertProducts(products, `full-sync:${platform}`);

    summary[platform] = {
      queries: queries.length,
      pages,
      fetchedUnique: products.length,
      persisted,
    };

    allRuns.push(...runs);
  }

  return {
    summary,
    runs: allRuns,
  };
}

module.exports = {
  syncProducts,
  syncComprehensiveDatasets,
};
