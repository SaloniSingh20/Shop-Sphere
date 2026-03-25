const ProductCatalog = require("../models/ProductCatalog");
const { searchAmazon } = require("../services/amazonService");
const { searchFlipkart } = require("../services/flipkartService");
const { searchNykaa } = require("../services/nykaaService");
const { searchMyntra } = require("../services/myntraService");
const { withTimeout } = require("../services/serviceUtils");
const env = require("../config/env");
const { dedupeProducts } = require("../utils/normalizers");

const CATEGORY_KEYWORDS = {
  electronics: ["smartphone", "laptop", "earbuds", "smartwatch"],
  fashion: ["men tshirt", "women dress", "sneakers", "handbag"],
  beauty: ["face serum", "lipstick", "sunscreen", "moisturizer"],
  home: ["kitchen organizer", "bedsheet", "storage box", "table lamp"],
};

const CATEGORY_MIN_ITEMS = 20;
const CATEGORY_STALE_MS = 6 * 60 * 60 * 1000;

const CATEGORY_REQUIRED_PLATFORMS = {
  electronics: ["Amazon", "Flipkart"],
  fashion: ["Myntra", "Amazon", "Flipkart"],
  beauty: ["Nykaa", "Amazon", "Flipkart"],
};
const CORE_PLATFORMS = ["Amazon", "Flipkart", "Nykaa"];

function isValidProductPrice(price) {
  return Number.isFinite(Number(price)) && Number(price) > 0;
}

const FALLBACK_CATEGORY_PRODUCTS = {
  electronics: [
    {
      title: "boAt Airdopes 141 True Wireless Earbuds",
      description: "Bluetooth earbuds with long battery life",
      price: 1299,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop",
      platform: "Amazon",
      product_url: "https://www.amazon.in/s?k=boat+airdopes+141",
    },
    {
      title: "Samsung Galaxy M14 5G Smartphone",
      description: "Budget 5G smartphone",
      price: 10999,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop",
      platform: "Flipkart",
      product_url: "https://www.flipkart.com/search?q=samsung+galaxy+m14+5g",
    },
    {
      title: "OnePlus Nord Buds 2",
      description: "In-ear wireless earbuds",
      price: 2199,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?w=600&h=600&fit=crop",
      platform: "Amazon",
      product_url: "https://www.amazon.in/s?k=oneplus+nord+buds+2",
    },
    {
      title: "Realme Narzo Smartphone",
      description: "Performance focused mobile phone",
      price: 12499,
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&h=600&fit=crop",
      platform: "Flipkart",
      product_url: "https://www.flipkart.com/search?q=realme+narzo",
    },
  ],
  fashion: [
    {
      title: "Men Slim Fit Casual Shirt",
      description: "Cotton casual shirt",
      price: 799,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&h=600&fit=crop",
      platform: "Amazon",
      product_url: "https://www.amazon.in/s?k=men+slim+fit+casual+shirt",
    },
    {
      title: "Women Solid Maxi Dress",
      description: "Elegant everyday maxi dress",
      price: 999,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop",
      platform: "Flipkart",
      product_url: "https://www.flipkart.com/search?q=women+solid+maxi+dress",
    },
    {
      title: "Unisex Cotton Bath Towel",
      description: "Soft and absorbent towel pack",
      price: 459,
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=600&h=600&fit=crop",
      platform: "Myntra",
      product_url: "https://www.myntra.com/towel",
    },
    {
      title: "Men Running Sneakers",
      description: "Lightweight sports sneakers",
      price: 1499,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop",
      platform: "Flipkart",
      product_url: "https://www.flipkart.com/search?q=men+running+sneakers",
    },
  ],
  beauty: [
    {
      title: "Nykaa Matte Lipstick",
      description: "Long-lasting matte lipstick",
      price: 499,
      rating: 4.3,
      image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=600&fit=crop",
      platform: "Nykaa",
      product_url: "https://www.nykaa.com/search/result/?q=matte+lipstick&root=search",
    },
    {
      title: "Vitamin C Face Serum",
      description: "Brightening daily-use face serum",
      price: 699,
      rating: 4.2,
      image: "https://images.unsplash.com/photo-1629198735660-e39ea93f5f8d?w=600&h=600&fit=crop",
      platform: "Amazon",
      product_url: "https://www.amazon.in/s?k=vitamin+c+face+serum",
    },
    {
      title: "Sunscreen SPF 50",
      description: "Lightweight broad-spectrum sunscreen",
      price: 399,
      rating: 4.1,
      image: "https://images.unsplash.com/photo-1556228724-4f0f4c2a7f1a?w=600&h=600&fit=crop",
      platform: "Flipkart",
      product_url: "https://www.flipkart.com/search?q=sunscreen+spf+50",
    },
    {
      title: "Hydrating Moisturizer",
      description: "Daily hydration cream",
      price: 349,
      rating: 4.0,
      image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&h=600&fit=crop",
      platform: "Nykaa",
      product_url: "https://www.nykaa.com/search/result/?q=moisturizer&root=search",
    },
  ],
};

function buildFallbackCategoryProducts(category) {
  return (FALLBACK_CATEGORY_PRODUCTS[category] || []).map((item) => ({
    title: item.title,
    description: item.description,
    category,
    sourceKeyword: category,
    price: Number(item.price),
    rating: Number(item.rating || 0),
    image: item.image,
    platform: item.platform,
    product_url: item.product_url,
    tags: [category, String(item.platform || "").toLowerCase()],
    lastSeenAt: new Date(),
  }));
}

function buildQueryFallbackProduct(platform, query, category) {
  const keyword = String(query || category || "deals").trim() || "deals";
  const isBeauty = category === "beauty" || platform === "Nykaa";

  const urls = {
    Amazon: `https://www.amazon.in/s?k=${encodeURIComponent(keyword)}`,
    Flipkart: `https://www.flipkart.com/search?q=${encodeURIComponent(keyword)}`,
    Nykaa: `https://www.nykaa.com/search/result/?q=${encodeURIComponent(keyword)}&root=search`,
  };

  return {
    title: `${keyword} on ${platform}`,
    description: `Trending ${keyword} picks from ${platform}`,
    category: category || (isBeauty ? "beauty" : "electronics"),
    sourceKeyword: keyword,
    price: platform === "Nykaa" ? 499 : 999,
    rating: 4.1,
    image: null,
    platform,
    product_url: urls[platform],
    tags: [String(category || "general"), platform.toLowerCase(), keyword.toLowerCase()],
    lastSeenAt: new Date(),
  };
}

function ensureCorePlatformsInCatalog(products, category, query) {
  const current = (Array.isArray(products) ? products : []).filter(
    (item) => item && item.title && item.product_url && isValidProductPrice(item.price)
  );
  const targetPlatforms = category && CATEGORY_REQUIRED_PLATFORMS[category]
    ? CATEGORY_REQUIRED_PLATFORMS[category]
    : CORE_PLATFORMS;

  const present = new Set(current.map((item) => String(item.platform || "")));
  if (targetPlatforms.every((platform) => present.has(platform))) {
    return current;
  }

  const fallbackPool = Object.keys(FALLBACK_CATEGORY_PRODUCTS)
    .flatMap((key) => buildFallbackCategoryProducts(key))
    .filter((item) => targetPlatforms.includes(item.platform));

  const existingUrls = new Set(current.map((item) => item.product_url));
  for (const platform of targetPlatforms) {
    if (present.has(platform)) continue;

    const queryFallback = buildQueryFallbackProduct(platform, query, category);
    if (queryFallback && !existingUrls.has(queryFallback.product_url)) {
      current.push(queryFallback);
      present.add(platform);
      existingUrls.add(queryFallback.product_url);
      continue;
    }

    const pick = fallbackPool.find(
      (item) => item.platform === platform && !existingUrls.has(item.product_url)
    );

    if (pick) {
      current.push(pick);
      present.add(platform);
      existingUrls.add(pick.product_url);
    }
  }

  return current;
}

async function searchAllPlatforms(query) {
  const calls = [
    ["Amazon", searchAmazon],
    ["Flipkart", searchFlipkart],
    ["Nykaa", searchNykaa],
    ["Myntra", searchMyntra],
  ];

  const settled = await Promise.allSettled(
    calls.map(([platform, fn]) =>
      withTimeout(fn(query), env.platformTimeoutMs, `${platform} catalog sync timed out`)
    )
  );

  const all = [];
  for (const item of settled) {
    if (item.status === "fulfilled") {
      all.push(...item.value);
    }
  }

  return dedupeProducts(all);
}

function enrichProduct(product, category, keyword) {
  return {
    title: product.title,
    description: product.description || "",
    category,
    sourceKeyword: keyword,
    price: Number(product.price),
    rating: Number(product.rating || 0),
    image: product.image || null,
    platform: product.platform,
    product_url: product.product_url,
    tags: [category, keyword, product.platform?.toLowerCase()].filter(Boolean),
    lastSeenAt: new Date(),
  };
}

async function syncCategory(category) {
  const keywords = CATEGORY_KEYWORDS[category] || [];
  if (!keywords.length) return { category, upserted: 0 };

  let upserted = 0;

  for (const keyword of keywords) {
    const existingCount = await ProductCatalog.countDocuments({
      category,
      $or: [
        { title: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ],
    });

    if (existingCount >= 8) {
      // Already hydrated for this keyword.
      // eslint-disable-next-line no-continue
      continue;
    }

    const results = await searchAllPlatforms(keyword);
    const docs = results.map((item) => enrichProduct(item, category, keyword));

    if (!docs.length) continue;

    const operations = docs.map((doc) => ({
      updateOne: {
        filter: { product_url: doc.product_url },
        update: {
          $set: doc,
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    }));

    const writeResult = await ProductCatalog.bulkWrite(operations, { ordered: false });
    upserted += (writeResult.upsertedCount || 0) + (writeResult.modifiedCount || 0);
  }

  return { category, upserted };
}

async function needsCategorySync(category) {
  const count = await ProductCatalog.countDocuments({ category });
  if (count < CATEGORY_MIN_ITEMS) return true;

  const latest = await ProductCatalog.findOne({ category }).sort({ updatedAt: -1 }).select("updatedAt");
  if (!latest?.updatedAt) return true;

  return Date.now() - latest.updatedAt.getTime() > CATEGORY_STALE_MS;
}

async function ensureCategory(category) {
  if (!CATEGORY_KEYWORDS[category]) return;

  const shouldSync = await needsCategorySync(category);
  if (shouldSync) {
    await syncCategory(category);
  }
}

async function getCategories(_req, res, next) {
  try {
    const keys = Object.keys(CATEGORY_KEYWORDS);

    await Promise.all(keys.map((category) => ensureCategory(category)));

    const counts = await ProductCatalog.aggregate([
      { $match: { category: { $in: keys } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const byCategory = new Map(counts.map((row) => [row._id, row.count]));

    return res.json({
      categories: keys.map((key) => ({
        key,
        label: key[0].toUpperCase() + key.slice(1),
        count: byCategory.get(key) || 0,
      })),
    });
  } catch (error) {
    return next(error);
  }
}

async function getCatalogProducts(req, res, next) {
  try {
    const category = String(req.query.category || "").trim().toLowerCase();
    const query = String(req.query.q || "").trim();
    const limit = Math.min(Number(req.query.limit || 40), 100);

    if (category && CATEGORY_KEYWORDS[category]) {
      await ensureCategory(category);
    }

    if (!category && query && query.length >= 2) {
      const existing = await ProductCatalog.find({
        $or: [
          { title: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { tags: { $regex: query, $options: "i" } },
        ],
      })
        .limit(8)
        .lean();

      if (existing.length < 4) {
        const results = await searchAllPlatforms(query);
        const docs = results.map((item) => enrichProduct(item, "uncategorized", query));

        if (docs.length) {
          const operations = docs.map((doc) => ({
            updateOne: {
              filter: { product_url: doc.product_url },
              update: {
                $set: doc,
                $setOnInsert: { createdAt: new Date() },
              },
              upsert: true,
            },
          }));

          await ProductCatalog.bulkWrite(operations, { ordered: false });
        }
      }
    }

    const filter = {
      price: { $gt: 0 },
    };
    if (category) filter.category = category;

    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { tags: { $regex: query, $options: "i" } },
      ];
    }

    let products = await ProductCatalog.find(filter)
      .sort({ rating: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    if (category && FALLBACK_CATEGORY_PRODUCTS[category]) {
      const fallback = buildFallbackCategoryProducts(category);

      if (!products.length) {
        products = fallback.slice(0, limit);
      } else {
        const required = CATEGORY_REQUIRED_PLATFORMS[category] || [];
        const presentPlatforms = new Set(products.map((item) => item.platform));
        const missingPlatforms = required.filter((platform) => !presentPlatforms.has(platform));

        if (missingPlatforms.length) {
          const existingUrls = new Set(products.map((item) => item.product_url));
          const extra = fallback.filter(
            (item) => missingPlatforms.includes(item.platform) && !existingUrls.has(item.product_url)
          );
          if (extra.length) {
            const keepCount = Math.max(0, limit - extra.length);
            products = [...products.slice(0, keepCount), ...extra].slice(0, limit);
          }
        }
      }
    }

    products = ensureCorePlatformsInCatalog(products, category || null, query || null)
      .filter((item) => isValidProductPrice(item.price))
      .slice(0, limit);

    return res.json({ category: category || null, query: query || null, results: products });
  } catch (error) {
    return next(error);
  }
}

async function getCatalogProductByUrl(req, res, next) {
  try {
    const encodedUrl = String(req.query.url || "");
    if (!encodedUrl) {
      return res.status(400).json({ message: "url is required" });
    }

    const productUrl = decodeURIComponent(encodedUrl);
    const product = await ProductCatalog.findOne({ product_url: productUrl }).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ product });
  } catch (error) {
    return next(error);
  }
}

async function syncCatalog(req, res, next) {
  try {
    const category = String(req.query.category || "").trim().toLowerCase();

    if (category) {
      if (!CATEGORY_KEYWORDS[category]) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const result = await syncCategory(category);
      return res.json({ synced: [result] });
    }

    const categories = Object.keys(CATEGORY_KEYWORDS);
    const synced = [];

    for (const key of categories) {
      // Sequential sync keeps scraping traffic conservative.
      // eslint-disable-next-line no-await-in-loop
      synced.push(await syncCategory(key));
    }

    return res.json({ synced });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getCategories,
  getCatalogProducts,
  getCatalogProductByUrl,
  syncCatalog,
};
