const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited, randomDelay, detectChromeExecutablePath } = require("./serviceUtils");

const BASE_URL = "https://www.flipkart.com";

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

    const scrapeWithCheerio = async () => {
      const $ = await fetchHtml(url);
      const items = [];

      $("div[data-id]").each((_index, element) => {
        if (items.length >= 12) return;

        const card = $(element);
        const title = pickText(card, ["a.wjcEIp", "div.KzDlHZ", "a.IRpwTa", "a.s1Q9rs"]);
        const description = compactText(
          card
            .find("ul.G4BRas li, ul._6NESgJ li, ul.rkYjQf li")
            .map((_i, el) => $(el).text())
            .get()
            .slice(0, 4)
            .join(" | ")
        );
        const price = parsePrice(
          pickText(card, ["div.Nx9bqj", "div._30jeq3", "div._4b5DiR", "div.cN1yYO .Nx9bqj"])
        );
        const rating = parseRating(pickText(card, ["div.XQDdHH", "div._3LWZlK", "span.Y1HWO0"]));
        const image = pickAttr(card, ["img.DByuf4", "img._53J4C-", "img"], "src");
        const href = pickAttr(card, ["a.CGtC98", "a.wjcEIp", "a.IRpwTa", "a.s1Q9rs", "a"], "href");

        const normalized = normalizeProduct({
          title,
          description,
          price,
          rating,
          image,
          platform: "Flipkart",
          product_url: normalizeUrl(href, BASE_URL),
        });

        if (normalized) items.push(normalized);
      });

      return items;
    };

    const scrapeWithPuppeteer = async () => {
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

        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
        await randomDelay(500, 1100);

        const extracted = await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll("div[data-id]"));
          return cards.slice(0, 18).map((card) => {
            const by = (selector) => {
              const node = card.querySelector(selector);
              return node ? String(node.textContent || "").trim() : "";
            };
            const img = card.querySelector("img");
            const anchor =
              card.querySelector("a.CGtC98") ||
              card.querySelector("a.wjcEIp") ||
              card.querySelector("a.IRpwTa") ||
              card.querySelector("a.s1Q9rs") ||
              card.querySelector("a");

            return {
              title: by("a.wjcEIp") || by("div.KzDlHZ") || by("a.IRpwTa") || by("a.s1Q9rs"),
              description: Array.from(card.querySelectorAll("ul li"))
                .slice(0, 4)
                .map((node) => String(node.textContent || "").trim())
                .join(" | "),
              price:
                by("div.Nx9bqj") || by("div._30jeq3") || by("div._4b5DiR") || by("div.cN1yYO .Nx9bqj"),
              rating: by("div.XQDdHH") || by("div._3LWZlK") || by("span.Y1HWO0"),
              image: img ? img.getAttribute("src") || img.getAttribute("data-src") : null,
              link: anchor ? anchor.getAttribute("href") : "",
            };
          });
        });

        return extracted
          .map((item) =>
            normalizeProduct({
              title: item.title,
              description: item.description,
              price: parsePrice(item.price),
              rating: parseRating(item.rating),
              image: item.image,
              platform: "Flipkart",
              product_url: normalizeUrl(item.link, BASE_URL),
            })
          )
          .filter(Boolean);
      } finally {
        await browser.close();
      }
    };

    try {
      const firstPass = await scrapeWithCheerio();
      if (firstPass.length) return firstPass;
    } catch (_error) {
      // Try browser-based scraping fallback.
    }

    try {
      return await scrapeWithPuppeteer();
    } catch (_error) {
      return [];
    }
  });
}

module.exports = { searchFlipkart };
