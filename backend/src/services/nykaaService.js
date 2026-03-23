const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited } = require("./serviceUtils");

const BASE_URL = "https://www.nykaa.com";

async function searchNykaa(query) {
  return rateLimited("nykaa", async () => {
    const url = `${BASE_URL}/search/result/?q=${encodeURIComponent(query)}&root=search`;
    const $ = await fetchHtml(url);

    const items = [];

    $("a[href*='/p/'], a[href*='/buy/']").each((_index, element) => {
      if (items.length >= 12) return;

      const card = $(element);
      const title =
        compactText(card.attr("title")) ||
        compactText(card.find("h2, h3, p").first().text()) ||
        compactText(card.text());
      const price = parsePrice(card.find("span").filter((_i, el) => $(el).text().includes("Rs.") || $(el).text().includes("₹")).first().text());
      const rating = parseRating(card.find("span").filter((_i, el) => $(el).text().includes("rating") || $(el).text().includes("/")).first().text());
      const image = card.find("img").attr("src") || card.find("img").attr("data-src") || null;
      const href = card.attr("href");

      const normalized = normalizeProduct({
        title,
        price,
        rating,
        image,
        platform: "Nykaa",
        product_url: normalizeUrl(href, BASE_URL),
      });

      if (normalized) items.push(normalized);
    });

    return items;
  });
}

module.exports = { searchNykaa };
