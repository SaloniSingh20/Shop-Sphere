const SearchCache = require("../models/SearchCache");
const PriceHistory = require("../models/PriceHistory");
const ProductCatalog = require("../models/ProductCatalog");
const User = require("../models/User");
const { searchAmazon } = require("../services/amazonService");
const { searchFlipkart } = require("../services/flipkartService");
const { searchNykaa } = require("../services/nykaaService");
const { searchMyntra } = require("../services/myntraService");
const { withTimeout } = require("../services/serviceUtils");
const env = require("../config/env");
const { dedupeProducts } = require("../utils/normalizers");
const { scoreProducts } = require("../utils/scoring");

const CACHE_WINDOW_MS = 10 * 60 * 1000;

async function searchPlatform(platform, query, fn) {
  try {
    const results = await withTimeout(
      fn(query),
      env.platformTimeoutMs,
      `${platform} search timed out`
    );
    return { platform, ok: true, results: Array.isArray(results) ? results : [] };
  } catch (error) {
    return { platform, ok: false, results: [], error: error?.message || "Unknown failure" };
  }
}

async function recordRecentSearch(userId, query) {
  if (!userId || !query) return;

  const user = await User.findById(userId);
  if (!user) return;

  const deduped = (user.recentSearches || []).filter((entry) => entry.query !== query);
  user.recentSearches = [{ query, searchedAt: new Date() }, ...deduped].slice(0, 30);
  await user.save();
}

async function searchProducts(req, res, next) {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters" });
    }

    if (req.user?.sub) {
      await recordRecentSearch(req.user.sub, query);
    }

    const cutoff = new Date(Date.now() - CACHE_WINDOW_MS);
    const cached = await SearchCache.findOne({ query, timestamp: { $gte: cutoff } });
    if (cached?.results?.length) {
      return res.json({
        query,
        cached: true,
        timestamp: cached.timestamp,
        results: cached.results,
        failures: [],
      });
    }

    const platformResults = await Promise.all([
      searchPlatform("Amazon", query, searchAmazon),
      searchPlatform("Flipkart", query, searchFlipkart),
      searchPlatform("Nykaa", query, searchNykaa),
      searchPlatform("Myntra", query, searchMyntra),
    ]);

    const failures = [];
    const allResults = [];

    for (const result of platformResults) {
      if (result.ok) {
        allResults.push(...result.results);
      } else {
        failures.push({ platform: result.platform, error: result.error });
      }
    }

    let merged = scoreProducts(dedupeProducts(allResults), query);

    if (!merged.length) {
      const dbFallback = await ProductCatalog.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .sort({ rating: -1, updatedAt: -1 })
        .limit(80)
        .lean();

      if (dbFallback.length) {
        merged = scoreProducts(dedupeProducts(dbFallback), query);
      }
    }

    if (!merged.length) {
      const staleCache = await SearchCache.findOne({ query }).sort({ timestamp: -1 });
      if (staleCache?.results?.length) {
        merged = staleCache.results;
      }
    }

    if (merged.length) {
      await SearchCache.findOneAndUpdate(
        { query },
        {
          query,
          results: merged,
          timestamp: new Date(),
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    if (merged.length) {
      const catalogOps = merged.map((item) => ({
        updateOne: {
          filter: { product_url: item.product_url },
          update: {
            $set: {
              title: item.title,
              description: item.description || "",
              category: String(item.category || "general").toLowerCase(),
              sourceKeyword: query,
              price: Number(item.price || 0),
              rating: Number(item.rating || 0),
              image: item.image || null,
              platform: item.platform,
              product_url: item.product_url,
              tags: Array.from(
                new Set(
                  [
                    String(item.platform || "").toLowerCase(),
                    String(item.category || "").toLowerCase(),
                    query,
                  ].filter(Boolean)
                )
              ),
              lastSeenAt: new Date(),
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      }));

      await ProductCatalog.bulkWrite(catalogOps, { ordered: false });

      const historyDocs = merged.map((item) => ({
        query,
        title: item.title,
        platform: item.platform,
        product_url: item.product_url,
        price: item.price,
        rating: item.rating,
        capturedAt: new Date(),
      }));
      await PriceHistory.insertMany(historyDocs, { ordered: false });
    }

    return res.json({
      query,
      cached: false,
      timestamp: new Date(),
      results: merged,
      failures,
    });
  } catch (error) {
    return next(error);
  }
}

async function getRecommendations(req, res, next) {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    const budget = req.query.budget ? Number(req.query.budget) : null;
    if (!query) {
      return res.status(400).json({ message: "q is required" });
    }

    const cached = await SearchCache.findOne({ query }).sort({ timestamp: -1 });
    const source = cached?.results || [];

    const candidates = source
      .filter((item) => !budget || item.price <= budget)
      .sort((a, b) => (b.meta?.score || 0) - (a.meta?.score || 0));

    return res.json({
      query,
      budget,
      recommendations: candidates.slice(0, 5),
    });
  } catch (error) {
    return next(error);
  }
}

async function getPriceDrops(req, res, next) {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    if (!query) {
      return res.status(400).json({ message: "q is required" });
    }

    const records = await PriceHistory.find({ query }).sort({ capturedAt: -1 }).limit(500);
    const latestByProduct = new Map();
    const previousByProduct = new Map();

    for (const item of records) {
      const key = `${item.platform}|${item.product_url}`;
      if (!latestByProduct.has(key)) {
        latestByProduct.set(key, item);
      } else if (!previousByProduct.has(key)) {
        previousByProduct.set(key, item);
      }
    }

    const drops = [];
    for (const [key, latest] of latestByProduct.entries()) {
      const previous = previousByProduct.get(key);
      if (!previous || !previous.price || !latest.price) continue;
      if (latest.price < previous.price) {
        const drop = previous.price - latest.price;
        drops.push({
          title: latest.title,
          platform: latest.platform,
          product_url: latest.product_url,
          previousPrice: previous.price,
          currentPrice: latest.price,
          dropAmount: drop,
          dropPercent: Number(((drop / previous.price) * 100).toFixed(2)),
        });
      }
    }

    return res.json({ query, drops: drops.sort((a, b) => b.dropPercent - a.dropPercent) });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  searchProducts,
  getRecommendations,
  getPriceDrops,
};
