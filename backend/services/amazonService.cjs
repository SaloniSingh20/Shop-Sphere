const axios = require("axios");
const cheerio = require("cheerio");
const { dedupeByLink } = require("./serviceUtils.cjs");

const RAPIDAPI_HOST = "real-time-amazon-data.p.rapidapi.com";
const AMAZON_RETRY_QUERIES = ["iphone", "laptop", "headphones"];

async function fetchAmazon(query, { limit = 50, pages = 2 } = {}) {
  if (!process.env.RAPIDAPI_KEY) {
    console.error("Amazon API error: RAPIDAPI_KEY missing in .env");
    return [];
  }

  try {
    const maxPages = Math.max(1, pages);
    const queryCandidates = [query, ...AMAZON_RETRY_QUERIES.filter((q) => q !== query)];
    const merged = [];

    for (const q of queryCandidates) {
      for (let page = 1; page <= maxPages; page += 1) {
        try {
          const response = await axios.get("https://real-time-amazon-data.p.rapidapi.com/search", {
            params: {
              query: q,
              country: "IN",
              sort_by: "RELEVANCE",
              product_condition: "ALL",
              page: String(page),
            },
            headers: {
              "Content-Type": "application/json",
              "x-rapidapi-key": process.env.RAPIDAPI_KEY,
              "x-rapidapi-host": RAPIDAPI_HOST,
            },
            timeout: 30000,
          });

          console.log("Amazon STATUS:", response.status);
          console.log(JSON.stringify(response.data, null, 2));

          const products = response.data?.data?.products || [];
          console.log("Amazon PRODUCTS:", products.length);

          const mapped = products
            .map((item) => ({
              title: item.product_title,
              price: parseFloat(String(item.product_price || "").replace(/[^0-9.]/g, "")) || 0,
              image: item.product_photo,
              rating: Number(item.product_star_rating) || 0,
              link: item.product_url,
              platform: "amazon",
              category: "electronics",
            }))
            .filter((p) => p.title && p.price > 0 && p.image && p.link);

          merged.push(...mapped);
        } catch (error) {
          const status = error?.response?.status;
          const payload = error?.response?.data;
          console.error("Amazon API request failed:", status || error.message || error);
          if (payload) {
            console.log(JSON.stringify(payload, null, 2));
          }
        }
      }

      if (dedupeByLink(merged).length >= Math.max(20, limit)) {
        break;
      }
    }

    let products = dedupeByLink(merged).slice(0, Math.max(20, limit));

    if (products.length === 0) {
      const webFallback = await fetchAmazonFromWeb(queryCandidates, Math.max(20, limit));
      products = dedupeByLink(webFallback).slice(0, Math.max(20, limit));
    }

    console.log("Amazon fetched:", products.length);
    return products;
  } catch (error) {
    console.error("Amazon API error:", error.message || error);
    return [];
  }
}

async function fetchAmazonFromWeb(queries, limit) {
  const results = [];

  for (const q of queries) {
    try {
      const response = await axios.get("https://www.amazon.in/s", {
        params: { k: q },
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-IN,en;q=0.9",
        },
        timeout: 30000,
      });

      const $ = cheerio.load(response.data || "");
      const cards = $("[data-component-type='s-search-result']");

      cards.each((_, el) => {
        const title = $(el).find("h2 a span").first().text().trim();
        const priceWhole = $(el).find(".a-price-whole").first().text().replace(/,/g, "").trim();
        const priceFraction = $(el).find(".a-price-fraction").first().text().trim();
        const image = $(el).find("img.s-image").attr("src") || $(el).find("img").attr("src") || "";
        const href = $(el).find("h2 a").attr("href") || "";
        const ratingText = $(el).find(".a-icon-alt").first().text().trim();

        const price = parseFloat(`${priceWhole}${priceFraction ? `.${priceFraction}` : ""}`.replace(/[^0-9.]/g, "")) || 0;
        const rating = parseFloat(String(ratingText).replace(/[^0-9.]/g, "")) || 0;
        const link = href ? `https://www.amazon.in${href}` : "";

        if (title && price > 0 && image && link) {
          results.push({
            title,
            price,
            image,
            rating,
            link,
            platform: "amazon",
            category: "electronics",
          });
        }
      });

      if (dedupeByLink(results).length >= limit) {
        break;
      }
    } catch (error) {
      console.error("Amazon web fallback failed:", error.message || error);
    }
  }

  return dedupeByLink(results).slice(0, limit);
}

module.exports = {
  fetchAmazon,
};
