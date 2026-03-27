const path = require("path");
const { Low } = require("lowdb");
const { JSONFile } = require("lowdb/node");

const DB_PATH = path.join(__dirname, "..", "data", "products.db.json");

const adapter = new JSONFile(DB_PATH);
const db = new Low(adapter, {
  products: [],
  syncRuns: [],
});

let initialized = false;

async function initStore() {
  if (initialized) return;
  await db.read();
  db.data ||= { products: [], syncRuns: [] };
  db.data.products ||= [];
  db.data.syncRuns ||= [];
  await db.write();
  initialized = true;
}

function normalizeInput(products) {
  return (products || []).filter(
    (p) => p && p.id && p.title && p.link && p.image && Number(p.price) > 0
  );
}

async function upsertProducts(products, sourceQuery = "") {
  await initStore();

  const validProducts = normalizeInput(products);
  const indexById = new Map(db.data.products.map((p, i) => [p.id, i]));
  const now = new Date().toISOString();

  let inserted = 0;
  let updated = 0;

  for (const product of validProducts) {
    const existingIndex = indexById.get(product.id);

    const next = {
      ...product,
      sourceQuery,
      updatedAt: now,
      createdAt:
        existingIndex != null
          ? db.data.products[existingIndex].createdAt || now
          : now,
    };

    if (existingIndex == null) {
      db.data.products.push(next);
      inserted += 1;
      continue;
    }

    db.data.products[existingIndex] = {
      ...db.data.products[existingIndex],
      ...next,
    };
    updated += 1;
  }

  if (validProducts.length > 0) {
    db.data.syncRuns.unshift({
      id: `sync-${Date.now()}`,
      sourceQuery,
      inserted,
      updated,
      totalSeen: validProducts.length,
      ranAt: now,
    });

    db.data.syncRuns = db.data.syncRuns.slice(0, 200);
  }

  await db.write();

  return {
    inserted,
    updated,
    total: validProducts.length,
  };
}

function scoreForQuery(product, query) {
  const q = String(query || "").toLowerCase().trim();
  if (!q) return 0;

  const words = q.split(/\s+/).filter(Boolean);
  const title = String(product.title || "").toLowerCase();
  const category = String(product.category || "").toLowerCase();

  return words.reduce((acc, w) => {
    if (title.includes(w)) return acc + 25;
    if (category.includes(w)) return acc + 8;
    return acc;
  }, 0);
}

async function searchProductsFromDb({ query = "", platform = "", limit = 24 }) {
  await initStore();

  const platformLower = String(platform || "").toLowerCase().trim();
  const list = db.data.products.filter((product) => {
    if (!platformLower) return true;
    return String(product.platform || "").toLowerCase() === platformLower;
  });

  if (!query?.trim()) {
    return [...list]
      .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
      .slice(0, limit);
  }

  return list
    .map((product) => ({ product, score: scoreForQuery(product, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ product }) => product);
}

async function getDiscoverProducts(limit = 24) {
  await initStore();

  return [...db.data.products]
    .sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")))
    .slice(0, limit);
}

async function getAllProductsFromDb({
  limit = 500,
  platform = "",
  category = "",
  sortBy = "updated_desc",
} = {}) {
  await initStore();

  const platformLower = String(platform || "").toLowerCase().trim();
  const categoryLower = String(category || "").toLowerCase().trim();

  let list = [...db.data.products].filter((product) => {
    const matchPlatform =
      !platformLower || String(product.platform || "").toLowerCase() === platformLower;
    const matchCategory =
      !categoryLower || String(product.category || "").toLowerCase() === categoryLower;
    return matchPlatform && matchCategory;
  });

  if (sortBy === "price_asc") {
    list = list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
  } else if (sortBy === "price_desc") {
    list = list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  } else {
    list = list.sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  }

  return list.slice(0, Math.max(1, Math.min(Number(limit || 500), 3000)));
}

async function getStoreStats() {
  await initStore();
  const byPlatform = db.data.products.reduce((acc, p) => {
    const key = String(p.platform || "unknown");
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return {
    products: db.data.products.length,
    byPlatform,
    lastSync: db.data.syncRuns[0] || null,
  };
}

module.exports = {
  initStore,
  upsertProducts,
  searchProductsFromDb,
  getDiscoverProducts,
  getAllProductsFromDb,
  getStoreStats,
};
