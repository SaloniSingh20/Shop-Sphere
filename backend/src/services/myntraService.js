const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited, randomDelay, detectChromeExecutablePath } = require("./serviceUtils");

const BASE_URL = "https://www.myntra.com";

function loadPuppeteer() {
  try {
    // eslint-disable-next-line global-require
    return require("puppeteer");
  } catch (_error) {
    try {
      // eslint-disable-next-line global-require
      return require("puppeteer-core");
    } catch (_nestedError) {
      return null;
    }
  }
}

async function searchMyntraWithPuppeteer(query) {
  const puppeteer = loadPuppeteer();
  if (!puppeteer) return [];

  const executablePath = detectChromeExecutablePath();
  if (!executablePath && typeof puppeteer.executablePath !== "function") {
    return [];
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: executablePath || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
    );

    await page.goto(`${BASE_URL}/${encodeURIComponent(query)}`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await randomDelay(700, 1300);

    const extracted = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("li.product-base"));
      return nodes.slice(0, 18).map((node) => {
        const text = (selector) => {
          const el = node.querySelector(selector);
          return el ? String(el.textContent || "").trim() : "";
        };

        const img = node.querySelector("img");
        const anchor = node.querySelector("a");
        return {
          title: `${text("h3.product-brand")} ${text("h4.product-product")}`.trim(),
          price: text("span.product-discountedPrice") || text("span.product-price"),
          rating: text("div.product-ratingsContainer span") || "",
          image: img ? img.getAttribute("src") || img.getAttribute("data-src") : null,
          link: anchor ? anchor.getAttribute("href") : "",
        };
      });
    });

    return extracted
      .map((item) =>
        normalizeProduct({
          title: item.title,
          description: item.title,
          price: parsePrice(item.price),
          rating: parseRating(item.rating),
          image: item.image,
          platform: "Myntra",
          product_url: normalizeUrl(item.link, BASE_URL),
        })
      )
      .filter(Boolean);
  } finally {
    await browser.close();
  }
}

async function searchMyntraWithCheerio(query) {
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
    const description = compactText(
      card
        .find("h4.product-product, div.product-productMetaInfo h4")
        .map((_i, el) => $(el).text())
        .get()
        .slice(0, 2)
        .join(" | ")
    );
    const price = parsePrice(card.find("span.product-discountedPrice, span.product-price").first().text());
    const rating = parseRating(card.find("div.product-ratingsContainer span").first().text());
    const image = card.find("img").attr("src") || card.find("img").attr("data-src") || null;
    const href = card.find("a").attr("href");

    const normalized = normalizeProduct({
      title: compactText(title),
      description,
      price,
      rating,
      image,
      platform: "Myntra",
      product_url: normalizeUrl(href, BASE_URL),
    });

    if (normalized) items.push(normalized);
  });

  return items;
}

async function searchMyntra(query) {
  return rateLimited("myntra", async () => {
    try {
      const dynamicResults = await searchMyntraWithPuppeteer(query);
      if (dynamicResults.length) return dynamicResults;
      return await searchMyntraWithCheerio(query);
    } catch (_error) {
      try {
        return await searchMyntraWithCheerio(query);
      } catch (_nestedError) {
        return [];
      }
    }
  });
}

module.exports = { searchMyntra };
