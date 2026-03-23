const SearchCache = require("../models/SearchCache");
const PriceHistory = require("../models/PriceHistory");
const { searchAmazon } = require("../services/amazonService");
const { searchFlipkart } = require("../services/flipkartService");
const { searchNykaa } = require("../services/nykaaService");
const { searchMyntra } = require("../services/myntraService");
const { dedupeProducts } = require("../utils/normalizers");
const { scoreProducts } = require("../utils/scoring");

const CACHE_WINDOW_MS = 10 * 60 * 1000;

async function searchProducts(req, res, next) {
  try {
    const query = String(req.query.q || "").trim().toLowerCase();
    if (!query || query.length < 2) {
      return res.status(400).json({ message: "Query must be at least 2 characters" });
    }

    const cutoff = new Date(Date.now() - CACHE_WINDOW_MS);
    const cached = await SearchCache.findOne({ query, timestamp: { $gte: cutoff } });
    if (cached) {
      return res.json({
        query,
        cached: true,
        timestamp: cached.timestamp,
        results: cached.results,
        failures: [],
      });
    }

    const [amazon, flipkart, nykaa, myntra] = await Promise.allSettled([
      searchAmazon(query),
      searchFlipkart(query),
      searchNykaa(query),
      searchMyntra(query),
    ]);

    const failures = [];
    const allResults = [];

    for (const [platform, result] of [
      ["Amazon", amazon],
      ["Flipkart", flipkart],
      ["Nykaa", nykaa],
      ["Myntra", myntra],
    ]) {
      if (result.status === "fulfilled") {
        allResults.push(...result.value);
      } else {
        failures.push({ platform, error: result.reason?.message || "Unknown failure" });
      }
    }

    const merged = scoreProducts(dedupeProducts(allResults));

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

    if (merged.length) {
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
