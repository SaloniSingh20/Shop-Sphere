require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {
  searchByPlatform,
  searchAllPlatforms,
  fetchElectronicsFromAmazonFlipkart,
  closeBrowser,
} = require("./services/productServices.cjs");
const {
  initStore,
  upsertProducts,
  searchProductsFromDb,
  getDiscoverProducts,
  getAllProductsFromDb,
  getStoreStats,
} = require("./db/productStore.cjs");
const { syncProducts, syncComprehensiveDatasets } = require("./services/syncService.cjs");

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

initStore().catch((error) => {
  console.error("Failed to initialize product store:", error);
});

app.get("/api/health", (_, res) => {
  res.json({ ok: true, service: "shopsphere-product-aggregator" });
});

app.get("/api/products/platform/:platform", async (req, res) => {
  const platform = String(req.params.platform || "").toLowerCase();
  const query = String(req.query.query || "").trim();
  const limit = Math.max(1, Math.min(Number(req.query.limit || 12), 40));
  const page = Math.max(1, Math.min(Number(req.query.page || 1), 50));

  if (!query) {
    return res.status(400).json({
      ok: false,
      message: "Missing query parameter. Example: /api/products/platform/amazon?query=earbuds",
    });
  }

  try {
    const products = await searchByPlatform(platform, query, limit, { page });
    await upsertProducts(products, `${platform}:${query}:page-${page}`);

    if (products.length > 0) {
      return res.json({
        ok: true,
        platform,
        query,
        source: "live",
        count: products.length,
        products,
      });
    }

    const dbFallback = await searchProductsFromDb({ query, platform, limit });
    return res.json({
      ok: true,
      platform,
      query,
      source: "database",
      count: dbFallback.length,
      products: dbFallback,
    });
  } catch (error) {
    const dbFallback = await searchProductsFromDb({ query, platform, limit });
    if (dbFallback.length > 0) {
      return res.json({
        ok: true,
        platform,
        query,
        source: "database",
        count: dbFallback.length,
        products: dbFallback,
        warning: error.message || "Live provider failed",
      });
    }

    return res.status(500).json({
      ok: false,
      platform,
      query,
      message: error.message || "Failed to fetch products",
    });
  }
});

app.get("/api/products/search", async (req, res) => {
  const query = String(req.query.query || "").trim();
  const limit = Math.max(1, Math.min(Number(req.query.limit || 8), 30));

  if (!query) {
    return res.status(400).json({
      ok: false,
      message: "Missing query parameter. Example: /api/products/search?query=laptop",
    });
  }

  try {
    const { products, errors } = await searchAllPlatforms(query, limit);
    await upsertProducts(products, `search:${query}`);

    if (products.length > 0) {
      return res.json({
        ok: true,
        query,
        source: "live",
        count: products.length,
        products,
        errors,
      });
    }

    const dbResults = await searchProductsFromDb({ query, limit: limit * 4 });
    return res.json({
      ok: true,
      query,
      source: "database",
      count: dbResults.length,
      products: dbResults,
      errors,
    });
  } catch (error) {
    const dbResults = await searchProductsFromDb({ query, limit: limit * 4 });
    if (dbResults.length > 0) {
      return res.json({
        ok: true,
        query,
        source: "database",
        count: dbResults.length,
        products: dbResults,
        errors: [{ platform: "all", message: error.message || "Live providers failed" }],
      });
    }

    return res.status(500).json({
      ok: false,
      query,
      message: error.message || "Failed to fetch products",
    });
  }
});

app.get("/api/products/discover", async (req, res) => {
  const seedQuery = String(req.query.query || "").trim() || "best seller";
  const perPlatformLimit = Math.max(1, Math.min(Number(req.query.limit || 10), 20));

  try {
    const fromDb = await getDiscoverProducts(perPlatformLimit * 4);
    if (fromDb.length >= perPlatformLimit) {
      return res.json({
        ok: true,
        query: seedQuery,
        source: "database",
        count: fromDb.length,
        products: fromDb,
        errors: [],
      });
    }

    const [amazon, flipkart, nykaa, myntra] = await Promise.allSettled([
      searchByPlatform("amazon", `${seedQuery} electronics`, perPlatformLimit),
      searchByPlatform("flipkart", `${seedQuery} earbuds`, perPlatformLimit),
      searchByPlatform("nykaa", `${seedQuery} beauty`, perPlatformLimit),
      searchByPlatform("myntra", `${seedQuery} fashion`, perPlatformLimit),
    ]);

    const buckets = { amazon, flipkart, nykaa, myntra };
    const products = Object.values(buckets).flatMap((result) =>
      result.status === "fulfilled" ? result.value : []
    );

    const errors = Object.entries(buckets)
      .filter(([, result]) => result.status === "rejected")
      .map(([platform, result]) => ({
        platform,
        message: result.reason?.message || "Unknown error",
      }));

    await upsertProducts(products, `discover:${seedQuery}`);

    const merged = products.length > 0 ? products : await getDiscoverProducts(perPlatformLimit * 4);

    return res.json({
      ok: true,
      query: seedQuery,
      source: products.length > 0 ? "live" : "database",
      count: merged.length,
      products: merged,
      errors,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Failed to build discover feed",
    });
  }
});

app.get("/api/products/all", async (req, res) => {
  const limit = Math.max(1, Math.min(Number(req.query.limit || 500), 3000));
  const platform = String(req.query.platform || "").trim();
  const category = String(req.query.category || "").trim();
  const sortBy = String(req.query.sortBy || "updated_desc").trim();

  const products = await getAllProductsFromDb({
    limit,
    platform,
    category,
    sortBy,
  });

  return res.json({
    ok: true,
    source: "database",
    count: products.length,
    products,
  });
});

app.get("/api/products/electronics", async (req, res) => {
  const limitPerQuery = Math.max(1, Math.min(Number(req.query.limitPerQuery || 10), 40));
  const page = Math.max(1, Math.min(Number(req.query.page || 1), 20));
  const forceLive = String(req.query.forceLive || "false").toLowerCase() === "true";

  try {
    const { amazonResults, flipkartResults, uniqueProducts, usedFallback } =
      await fetchElectronicsFromAmazonFlipkart({ limitPerQuery, page });

    if (!usedFallback) {
      await upsertProducts(uniqueProducts, `electronics:multi-query:page-${page}`);
    }

    if (uniqueProducts.length > 0) {
      return res.json({
        ok: true,
        source: usedFallback ? "fallback" : "live",
        forceLive,
        amazonCount: amazonResults.length,
        flipkartCount: flipkartResults.length,
        liveCount: uniqueProducts.length,
        dbCount: 0,
        fallback: usedFallback,
        products: uniqueProducts,
      });
    }

    if (forceLive) {
      return res.json({
        ok: true,
        source: "live",
        forceLive,
        amazonCount: amazonResults.length,
        flipkartCount: flipkartResults.length,
        liveCount: 0,
        dbCount: 0,
        products: [],
        warning: "forceLive=true and no live products were returned",
      });
    }

    const dbElectronics = await getAllProductsFromDb({
      limit: 3000,
      category: "electronics",
      sortBy: "updated_desc",
    });

    return res.json({
      ok: true,
      source: "database",
      forceLive,
      amazonCount: amazonResults.length,
      flipkartCount: flipkartResults.length,
      liveCount: 0,
      dbCount: dbElectronics.length,
      products: dbElectronics,
    });
  } catch (error) {
    if (forceLive) {
      return res.status(500).json({
        ok: false,
        source: "live",
        forceLive,
        message: error.message || "Live electronics fetch failed",
      });
    }

    const dbElectronics = await getAllProductsFromDb({
      limit: 3000,
      category: "electronics",
      sortBy: "updated_desc",
    });

    return res.json({
      ok: true,
      source: "database",
      forceLive,
      amazonCount: 0,
      flipkartCount: 0,
      liveCount: 0,
      dbCount: dbElectronics.length,
      warning: error.message || "Live electronics fetch failed",
      products: dbElectronics,
    });
  }
});

app.post("/api/sync/run", async (req, res) => {
  const perQueryLimit = Math.max(1, Math.min(Number(req.body?.limit || 8), 20));

  try {
    const results = await syncProducts({ perQueryLimit });
    const stats = await getStoreStats();

    return res.json({
      ok: true,
      synced: results,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Failed to sync products",
    });
  }
});

app.post("/api/sync/full", async (req, res) => {
  const perQueryLimit = Math.max(1, Math.min(Number(req.body?.limit || 20), 60));
  const pagesByPlatform = {
    amazon: Math.max(1, Math.min(Number(req.body?.pages?.amazon || 3), 10)),
    flipkart: Math.max(1, Math.min(Number(req.body?.pages?.flipkart || 5), 12)),
    nykaa: Math.max(1, Math.min(Number(req.body?.pages?.nykaa || 3), 8)),
    myntra: Math.max(1, Math.min(Number(req.body?.pages?.myntra || 3), 8)),
  };

  try {
    const result = await syncComprehensiveDatasets({
      perQueryLimit,
      pagesByPlatform,
    });
    const stats = await getStoreStats();

    return res.json({
      ok: true,
      mode: "full",
      perQueryLimit,
      pagesByPlatform,
      summary: result.summary,
      runs: result.runs,
      stats,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: error.message || "Failed to run full dataset sync",
    });
  }
});

app.get("/api/status", async (_, res) => {
  const stats = await getStoreStats();
  return res.json({
    ok: true,
    stats,
  });
});

const server = app.listen(PORT, () => {
  console.log(`ShopSphere product API listening on http://localhost:${PORT}`);
});

const shutdown = async () => {
  server.close(async () => {
    await closeBrowser();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
