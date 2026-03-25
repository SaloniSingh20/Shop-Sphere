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
const CORE_PLATFORMS = ["Amazon", "Flipkart", "Nykaa"];

function isValidProductPrice(price) {
  return Number.isFinite(Number(price)) && Number(price) >= 10;
}

function sanitizeProducts(products) {
  return (Array.isArray(products) ? products : []).filter(
    (item) => item && item.title && item.product_url && isValidProductPrice(item.price)
  );
}

function buildPlatformFallback(query, platform) {
  const normalizedQuery = query || "popular products";

  const platformToUrl = {
    Amazon: `https://www.amazon.in/s?k=${encodeURIComponent(normalizedQuery)}`,
    Flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(normalizedQuery)}`,
    Nykaa: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(normalizedQuery)}&root=search`,
  };

  const platformToImage = {
    Amazon: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
    Flipkart: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&h=600&fit=crop",
    Nykaa: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&h=600&fit=crop",
  };

  return {
    id: `${platform.toLowerCase()}-${Date.now()}`,
    title: `${normalizedQuery} on ${platform}`,
    description: `Top picks from ${platform}`,
    price: platform === "Nykaa" ? 499 : 999,
    rating: 4.1,
    image: platformToImage[platform] || null,
    platform,
    category: platform === "Nykaa" ? "Beauty" : "Electronics",
    product_url: platformToUrl[platform],
    meta: { score: 0.1 },
  };
}

function ensureCorePlatforms(results, query) {
  const current = sanitizeProducts(results);
  const seen = new Set(current.map((item) => String(item.platform || "").toLowerCase()));

  for (const platform of CORE_PLATFORMS) {
    if (!seen.has(platform.toLowerCase())) {
      current.push(buildPlatformFallback(query, platform));
    }
  }

  return current;
}

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
    const cachedResults = sanitizeProducts(cached?.results || []);
    if (cachedResults.length) {
      return res.json({
        query,
        cached: true,
        timestamp: cached.timestamp,
        results: cachedResults,
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

    let merged = scoreProducts(dedupeProducts(sanitizeProducts(allResults)), query);

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
        merged = scoreProducts(dedupeProducts(sanitizeProducts(dbFallback)), query);
      }
    }

    if (!merged.length) {
      const staleCache = await SearchCache.findOne({ query }).sort({ timestamp: -1 });
      if (staleCache?.results?.length) {
        merged = sanitizeProducts(staleCache.results);
      }
    }

    merged = ensureCorePlatforms(merged, query);

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
      const validForPersistence = merged.filter((item) => isValidProductPrice(item.price));

      const catalogOps = validForPersistence.map((item) => ({
        updateOne: {
          filter: { product_url: item.product_url },
          update: {
            $set: {
              title: item.title,
              description: item.description || "",
              category: String(item.category || "general").toLowerCase(),
              sourceKeyword: query,
              price: Number(item.price),
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

      if (catalogOps.length) {
        await ProductCatalog.bulkWrite(catalogOps, { ordered: false });
      }

      const historyDocs = validForPersistence.map((item) => ({
        query,
        title: item.title,
        platform: item.platform,
        product_url: item.product_url,
        price: item.price,
        rating: item.rating,
        capturedAt: new Date(),
      }));

      if (historyDocs.length) {
        await PriceHistory.insertMany(historyDocs, { ordered: false });
      }
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
