const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited, randomDelay, detectChromeExecutablePath } = require("./serviceUtils");
const { searchDatasetByPlatform } = require("../data/platformDatasets");

const BASE_URL = "https://www.nykaa.com";

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

async function searchNykaaWithPuppeteer(query) {
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

    await page.goto(`${BASE_URL}/search/result/?q=${encodeURIComponent(query)}&root=search`, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await randomDelay(700, 1300);

    const extracted = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("a[href*='/p/'], a[href*='/buy/']"));
      return nodes.slice(0, 18).map((node) => {
        const textFrom = (selector) => {
          const el = node.querySelector(selector);
          return el ? String(el.textContent || "").trim() : "";
        };

        return {
          title: node.getAttribute("title") || textFrom("h2") || textFrom("h3") || textFrom("p"),
          price: textFrom("span") || "",
          image: (node.querySelector("img") && (node.querySelector("img").getAttribute("src") || node.querySelector("img").getAttribute("data-src"))) || null,
          link: node.getAttribute("href") || "",
        };
      });
    });

    return extracted
      .map((item) =>
        normalizeProduct({
          title: item.title,
          description: item.title,
          price: parsePrice(item.price),
          rating: null,
          image: item.image,
          platform: "Nykaa",
          product_url: normalizeUrl(item.link, BASE_URL),
        })
      )
      .filter(Boolean);
  } finally {
    await browser.close();
  }
}

async function searchNykaaWithCheerio(query) {
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
    const description = compactText(
      card
        .find("p, span")
        .map((_i, el) => $(el).text())
        .get()
        .filter(Boolean)
        .slice(0, 3)
        .join(" | ")
    );
    const price = parsePrice(card.find("span").filter((_i, el) => $(el).text().includes("Rs.") || $(el).text().includes("₹")).first().text());
    const rating = parseRating(card.find("span").filter((_i, el) => $(el).text().includes("rating") || $(el).text().includes("/")).first().text());
    const image = card.find("img").attr("src") || card.find("img").attr("data-src") || null;
    const href = card.attr("href");

    const normalized = normalizeProduct({
      title,
      description,
      price,
      rating,
      image,
      platform: "Nykaa",
      product_url: normalizeUrl(href, BASE_URL),
    });

    if (normalized) items.push(normalized);
  });

  return items;
}

async function searchNykaa(query) {
  return rateLimited("nykaa", async () => {
    const datasetFallback = () => searchDatasetByPlatform("Nykaa", query, 24);

    try {
      const dynamicResults = await searchNykaaWithPuppeteer(query);
      if (dynamicResults.length) return dynamicResults;
      const cheerioResults = await searchNykaaWithCheerio(query);
      if (cheerioResults.length) return cheerioResults;
      return datasetFallback();
    } catch (_error) {
      try {
        const cheerioResults = await searchNykaaWithCheerio(query);
        if (cheerioResults.length) return cheerioResults;
        return datasetFallback();
      } catch (_nestedError) {
        return datasetFallback();
      }
    }
  });
}

module.exports = { searchNykaa };
