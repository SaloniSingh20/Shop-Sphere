const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited } = require("./serviceUtils");

const BASE_URL = "https://www.flipkart.com";

function pickText($card, selectors) {
  for (const selector of selectors) {
    const text = compactText($card.find(selector).first().text());
    if (text) return text;
  }
  return "";
}

function pickAttr($card, selectors, attr) {
  for (const selector of selectors) {
    const value = $card.find(selector).first().attr(attr);
    if (value) return value;
  }
  return null;
}

async function searchFlipkart(query) {
  return rateLimited("flipkart", async () => {
    const url = `${BASE_URL}/search?q=${encodeURIComponent(query)}`;
    const $ = await fetchHtml(url);

    const items = [];

    $("div[data-id]").each((_index, element) => {
      if (items.length >= 12) return;

      const card = $(element);
      const title = pickText(card, ["a.wjcEIp", "div.KzDlHZ", "a.IRpwTa"]);
      const price = parsePrice(pickText(card, ["div.Nx9bqj", "div._30jeq3"]));
      const rating = parseRating(pickText(card, ["div.XQDdHH", "div._3LWZlK"]));
      const image = pickAttr(card, ["img.DByuf4", "img._53J4C-", "img"], "src");
      const href = pickAttr(card, ["a.CGtC98", "a.wjcEIp", "a.IRpwTa", "a"], "href");

      const normalized = normalizeProduct({
        title,
        price,
        rating,
        image,
        platform: "Flipkart",
        product_url: normalizeUrl(href, BASE_URL),
      });

      if (normalized) items.push(normalized);
    });

    return items;
  });
}

module.exports = { searchFlipkart };
