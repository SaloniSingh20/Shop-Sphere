const { fetchAmazon } = require("./amazonService.cjs");
const { fetchFlipkart } = require("./flipkartService.cjs");
const { fetchNykaa } = require("./nykaaService.cjs");
const { fetchMyntra } = require("./myntraService.cjs");
const { dedupeByLink } = require("./serviceUtils.cjs");
const { closeBrowser } = require("./puppeteerClient.cjs");

const ELECTRONICS_QUERIES = [
  "iphone",
  "laptop",
  "headphones",
  "smartwatch",
  "bluetooth speaker",
];

const ELECTRONICS_FALLBACK_QUERIES = ["phone", "tv", "camera"];

const ELECTRONICS_FALLBACK_PRODUCTS = [
  {
    title: "iPhone 14",
    price: 70000,
    image: "https://via.placeholder.com/200",
    rating: 4.5,
    link: "#iphone-14",
    platform: "Fallback",
    category: "electronics",
    fallback: true,
  },
  {
    title: "Dell Laptop",
    price: 55000,
    image: "https://via.placeholder.com/200",
    rating: 4.3,
    link: "#dell-laptop",
    platform: "Fallback",
    category: "electronics",
    fallback: true,
  },
  {
    title: "Sony Headphones",
    price: 3000,
    image: "https://via.placeholder.com/200",
    rating: 4.2,
    link: "#sony-headphones",
    platform: "Fallback",
    category: "electronics",
    fallback: true,
  },
];

async function fetchElectronicsByPlatform(platform, { limitPerQuery = 20, page = 1 } = {}) {
  const fetcher =
    platform === "amazon"
      ? (q) => fetchAmazon(q, { limit: limitPerQuery, pages: Math.max(1, page) })
      : (q) => fetchFlipkart(q, { limit: limitPerQuery, pages: Math.max(1, page) });

  const results = await Promise.all(ELECTRONICS_QUERIES.map((q) => fetcher(q)));
  let combined = dedupeByLink(results.flat());

  if (combined.length === 0) {
    const fallbackResults = await Promise.all(ELECTRONICS_FALLBACK_QUERIES.map((q) => fetcher(q)));
    combined = dedupeByLink(fallbackResults.flat());
  }

  return combined;
}

async function fetchElectronicsFromAmazonFlipkart({ limitPerQuery = 20, page = 1 } = {}) {
  const amazonRuns = await Promise.all(
    ELECTRONICS_QUERIES.map((q) => fetchAmazon(q, { limit: limitPerQuery, pages: Math.max(1, page) }))
  );
  let amazonResults = dedupeByLink(amazonRuns.flat());

  if (amazonResults.length === 0) {
    const amazonFallbackRuns = await Promise.all(
      ELECTRONICS_FALLBACK_QUERIES.map((q) =>
        fetchAmazon(q, { limit: limitPerQuery, pages: Math.max(1, page) })
      )
    );
    amazonResults = dedupeByLink(amazonFallbackRuns.flat());
  }

  const flipkartRuns = await Promise.all(
    ELECTRONICS_QUERIES.map((q) =>
      fetchFlipkart(q, { limit: limitPerQuery, pages: Math.max(1, page) })
    )
  );
  let flipkartResults = dedupeByLink(flipkartRuns.flat());

  if (flipkartResults.length === 0) {
    const flipkartFallbackRuns = await Promise.all(
      ELECTRONICS_FALLBACK_QUERIES.map((q) =>
        fetchFlipkart(q, { limit: limitPerQuery, pages: Math.max(1, page) })
      )
    );
    flipkartResults = dedupeByLink(flipkartFallbackRuns.flat());
  }

  console.log("Amazon count:", amazonRuns.flat().length);
  console.log("Flipkart count:", flipkartRuns.flat().length);

  const uniqueProducts = dedupeByLink([...amazonResults, ...flipkartResults]);
  console.log("Final count:", uniqueProducts.length);

  if (uniqueProducts.length === 0) {
    return {
      amazonResults,
      flipkartResults,
      uniqueProducts: ELECTRONICS_FALLBACK_PRODUCTS,
      usedFallback: true,
    };
  }

  return {
    amazonResults,
    flipkartResults,
    uniqueProducts,
    usedFallback: false,
  };
}

async function searchByPlatform(platform, query, limit = 20, options = {}) {
  const normalizedQuery = String(query || "").toLowerCase().trim();
  const page = Number(options.page || 1);

  if ((platform === "amazon" || platform === "flipkart") && normalizedQuery === "electronics") {
    const multi = await fetchElectronicsByPlatform(platform, {
      limitPerQuery: Math.max(20, limit),
      page,
    });
    return multi;
  }

  if (platform === "amazon") return fetchAmazon(query, { limit: Math.max(20, limit), pages: Math.max(1, page) });
  if (platform === "flipkart") return fetchFlipkart(query, { limit: Math.max(20, limit), pages: Math.max(1, page) });
  if (platform === "nykaa") return fetchNykaa(query, { limit: Math.max(20, limit), pages: Math.max(1, page) });
  if (platform === "myntra") return fetchMyntra(query, { limit: Math.max(20, limit), pages: Math.max(1, page) });
  return [];
}

async function collectPlatformDatasets({ platform, queries, perQueryLimit = 24, pages = 1 }) {
  const runs = [];
  const products = [];
  const seen = new Set();

  for (const query of queries) {
    try {
      const batch = await searchByPlatform(platform, query, perQueryLimit, { page: pages });
      let kept = 0;

      for (const item of batch) {
        if (!item?.link || seen.has(item.link)) continue;
        seen.add(item.link);
        products.push(item);
        kept += 1;
      }

      runs.push({ ok: true, platform, query, page: pages, fetched: batch.length, kept });
    } catch (error) {
      runs.push({ ok: false, platform, query, page: pages, error: error.message || "Dataset collection failed" });
    }
  }

  return { products, runs };
}

async function searchAllPlatforms(query, limitPerPlatform = 20) {
  const [amazon, flipkart, nykaa, myntra] = await Promise.allSettled([
    searchByPlatform("amazon", query, limitPerPlatform),
    searchByPlatform("flipkart", query, limitPerPlatform),
    searchByPlatform("nykaa", query, limitPerPlatform),
    searchByPlatform("myntra", query, limitPerPlatform),
  ]);

  const map = { amazon, flipkart, nykaa, myntra };
  const products = Object.values(map).flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  const errors = Object.entries(map)
    .filter(([, r]) => r.status === "rejected")
    .map(([platform, r]) => ({ platform, message: r.reason?.message || "Unknown error" }));

  return { products: dedupeByLink(products), errors };
}

module.exports = {
  searchByPlatform,
  searchAllPlatforms,
  fetchElectronicsFromAmazonFlipkart,
  collectPlatformDatasets,
  closeBrowser,
};
