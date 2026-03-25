const { compactText } = require("./parsers");
const crypto = require("crypto");

const categoryMap = {
  myntra: "Fashion",
  nykaa: "Beauty",
  amazon: "Electronics",
  flipkart: "Electronics",
};

function normalizeProduct(item = {}) {
  const price = Number(item.price);
  if (!item.title || !item.product_url || !Number.isFinite(price) || price <= 0) {
    return null;
  }

  const platform = compactText(item.platform || "Unknown");
  const key = `${platform}|${item.product_url}`;
  const id = crypto.createHash("sha1").update(key).digest("hex").slice(0, 16);
  const lowerPlatform = platform.toLowerCase();

  return {
    id,
    title: compactText(item.title),
    description: compactText(item.description || ""),
    price,
    rating: Number.isFinite(Number(item.rating)) ? Number(item.rating) : null,
    image: item.image || null,
    platform,
    category: categoryMap[lowerPlatform] || "General",
    product_url: item.product_url,
  };
}

function dedupeProducts(products = []) {
  const seen = new Set();
  return products.filter((product) => {
    if (!product) return false;
    const key = `${product.platform}|${product.product_url}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

module.exports = {
  normalizeProduct,
  dedupeProducts,
  categoryMap,
};
