function scoreProducts(products) {
  if (!products.length) return [];

  const prices = products.map((p) => p.price).filter((n) => Number.isFinite(n));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const rated = products.map((p) => p.rating || 0);
  const maxRating = Math.max(...rated, 0);

  const bestPriceProduct = products.reduce((acc, product) => {
    if (!acc || product.price < acc.price) return product;
    return acc;
  }, null);

  const bestRatedProduct = products.reduce((acc, product) => {
    if (!acc || (product.rating || 0) > (acc.rating || 0)) return product;
    return acc;
  }, null);

  const withScore = products.map((product) => {
    const priceScore =
      maxPrice === minPrice ? 1 : 1 - (product.price - minPrice) / (maxPrice - minPrice);
    const ratingScore = maxRating === 0 ? 0 : (product.rating || 0) / maxRating;
    const score = Number((priceScore * 0.35 + ratingScore * 0.65).toFixed(4));

    return {
      ...product,
      meta: {
        score,
        bestPrice: bestPriceProduct?.product_url === product.product_url,
        bestRated: bestRatedProduct?.product_url === product.product_url,
      },
    };
  });

  return withScore.sort((a, b) => b.meta.score - a.meta.score || a.price - b.price);
}

module.exports = { scoreProducts };
