function rankProducts(products = [], query = "") {
  const normalizedQuery = String(query || "").trim().toLowerCase();

  return products
    .map((product) => {
      let relevanceScore = 0;
      const title = String(product.title || "").toLowerCase();

      if (normalizedQuery && title.includes(normalizedQuery)) {
        relevanceScore += 50;
      }

      relevanceScore += Number(product.rating || 0) * 10;
      relevanceScore += 10000 / (Number(product.price || 0) + 1);

      return {
        ...product,
        score: Number(relevanceScore.toFixed(4)),
      };
    })
    .sort((a, b) => b.score - a.score || a.price - b.price);
}

function markBestDeals(products = []) {
  if (!products.length) return [];
  const cheapest = Math.min(...products.map((p) => Number(p.price || 0)));
  const topScore = products[0]?.score ?? null;

  return products.map((product) => ({
    ...product,
    isBestPrice: Number(product.price || 0) === cheapest,
    isTopMatch: topScore !== null && product.score === topScore,
    meta: {
      score: product.score,
      bestPrice: Number(product.price || 0) === cheapest,
      bestMatch: topScore !== null && product.score === topScore,
    },
  }));
}

function scoreProducts(products = [], query = "") {
  return markBestDeals(rankProducts(products, query));
}

module.exports = { scoreProducts, rankProducts, markBestDeals };
