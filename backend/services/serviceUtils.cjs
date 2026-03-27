const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const FALLBACK_IMAGE = {
  beauty:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop",
  electronics:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
  fashion:
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
};

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function toAbsUrl(url, base) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (!base) return url;
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

function parsePrice(value) {
  if (value == null) return null;
  const text = String(value).replace(/,/g, "");
  const match = text.match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  return Math.round(Number(match[0]));
}

function parseRating(value) {
  if (value == null) return null;
  const match = String(value).match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const n = Number(match[0]);
  if (Number.isNaN(n)) return null;
  return Math.max(0, Math.min(5, n));
}

function inferCategory(title = "", platform = "") {
  const t = title.toLowerCase();
  const p = String(platform || "").toLowerCase();

  if (
    /(lipstick|foundation|serum|moisturizer|face wash|mascara|makeup|beauty|skincare|nykaa)/.test(
      t
    )
  ) {
    return "beauty";
  }

  if (
    /(phone|iphone|laptop|earbud|headphone|watch|tv|camera|tablet|electronics|charger|keyboard|mouse|ssd|router|power bank|monitor|speaker)/.test(
      t
    )
  ) {
    return "electronics";
  }

  if (
    /(jeans|shirt|dress|shoe|sneaker|bag|fashion|hoodie|kurta|top|jacket|myntra|t-shirt|tshirt)/.test(
      t
    )
  ) {
    return "fashion";
  }

  if (p === "nykaa") return "beauty";
  if (p === "myntra") return "fashion";
  if (p === "amazon" || p === "flipkart") return "electronics";

  return "fashion";
}

function hashId(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h).toString(36);
}

function normalizeProduct(platform, item) {
  const title = cleanText(item.title);
  const link = toAbsUrl(item.product_url || item.link || item.url, item.baseUrl || "");
  const price = parsePrice(item.price);
  const originalPrice = parsePrice(item.original_price || item.mrp);
  const rating = parseRating(item.rating);
  const category = item.category || inferCategory(title, platform);

  if (!title || !link || !price) return null;

  return {
    id: `${platform}-${hashId(link || title)}`,
    platform,
    title,
    category,
    price,
    orig: originalPrice && originalPrice >= price ? originalPrice : price,
    rating: rating || 0,
    reviews: Number(item.reviews) || 0,
    image: item.image || FALLBACK_IMAGE[category],
    link,
  };
}

function dedupeByLink(items = []) {
  return Object.values(
    (items || []).reduce((acc, item) => {
      if (item?.link) acc[item.link] = item;
      return acc;
    }, {})
  );
}

async function delay(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function autoScroll(page, steps = 6, stepDelayMs = 450) {
  for (let i = 0; i < steps; i += 1) {
    await page.evaluate(() => {
      window.scrollBy(0, Math.floor(window.innerHeight * 0.9));
    });
    await delay(stepDelayMs);
  }
}

module.exports = {
  USER_AGENT,
  cleanText,
  toAbsUrl,
  parsePrice,
  parseRating,
  inferCategory,
  normalizeProduct,
  dedupeByLink,
  delay,
  autoScroll,
};
