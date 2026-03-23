const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited } = require("./serviceUtils");

const BASE_URL = "https://www.myntra.com";

async function searchMyntra(query) {
  return rateLimited("myntra", async () => {
    const url = `${BASE_URL}/${encodeURIComponent(query)}`;
    const $ = await fetchHtml(url);

    const items = [];

    $("li.product-base, div.product-productMetaInfo").each((_index, element) => {
      if (items.length >= 12) return;

      const card = $(element);
      const title =
        compactText(card.find("h3.product-brand").text()) +
        " " +
        compactText(card.find("h4.product-product").text());
      const price = parsePrice(card.find("span.product-discountedPrice, span.product-price").first().text());
      const rating = parseRating(card.find("div.product-ratingsContainer span").first().text());
      const image = card.find("img").attr("src") || card.find("img").attr("data-src") || null;
      const href = card.find("a").attr("href");

      const normalized = normalizeProduct({
        title: compactText(title),
        price,
        rating,
        image,
        platform: "Myntra",
        product_url: normalizeUrl(href, BASE_URL),
      });

      if (normalized) items.push(normalized);
    });

    return items;
  });
}

module.exports = { searchMyntra };
