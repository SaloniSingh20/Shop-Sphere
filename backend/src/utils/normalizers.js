const { compactText } = require("./parsers");

function normalizeProduct(item = {}) {
  if (!item.title || !item.price || !item.product_url) {
    return null;
  }

  return {
    title: compactText(item.title),
    price: Number(item.price),
    rating: item.rating ? Number(item.rating) : null,
    image: item.image || null,
    platform: item.platform,
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
};
