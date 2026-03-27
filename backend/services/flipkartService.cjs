const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const { dedupeByLink, delay } = require("./serviceUtils.cjs");

function resolveExecutablePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);

  for (const path of candidates) {
    if (fs.existsSync(path)) return path;
  }

  return undefined;
}

async function fetchFlipkart(query, { limit = 30, pages = 2 } = {}) {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 50,
    executablePath: resolveExecutablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    let allResults = [];

    for (let p = 1; p <= Math.max(1, pages); p += 1) {
      const url = `https://www.flipkart.com/search?q=${encodeURIComponent(query)}&page=${p}`;
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 0 });

      await page.screenshot({ path: "flipkart.png", fullPage: true });
      const debugHtml = await page.content();
      console.log(debugHtml);

      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForSelector("._1AtVbE", { timeout: 10000 }).catch(() => null);
      await delay(5000);

      await autoScroll(page, 6, 600);

      const renderedHtml = await page.content();
      const $ = cheerio.load(renderedHtml);
      const pageProducts = [];
      const cardNodes = $(".jIjQ8S");
      const nodesToParse = cardNodes.length > 0 ? cardNodes : $("._1AtVbE");

      nodesToParse.each((_, node) => {
        const el = $(node);
        const title =
          el.find(".KzDlHZ").first().text().trim() ||
          el.find("._4rR01T").first().text().trim() ||
          el.find(".RG5Slk").first().text().trim();

        const priceText =
          el.find("._4b5DiR").first().text().trim() ||
          el.find("._30jeq3").first().text().trim() ||
          el.find(".hZ3P6w").first().text().trim();

        const image =
          el.find("img.UCc1lI").attr("src") ||
          el.find("img").attr("src") ||
          el.find("img").attr("data-src") ||
          "";

        const href = el.find("a.k7wcnx").attr("href") || el.find("a").attr("href") || "";
        const link = href
          ? /^https?:\/\//i.test(href)
            ? href
            : `https://www.flipkart.com${href}`
          : "";

        const ratingText = el.find(".MKiFS6").first().text().trim();

        if (title && priceText && image && link) {
          pageProducts.push({
            title,
            price: parseFloat(String(priceText).replace(/[^0-9]/g, "")) || 0,
            image,
            rating: parseFloat(String(ratingText).replace(/[^0-9.]/g, "")) || 0,
            link,
            platform: "flipkart",
            category: "electronics",
          });
        }
      });

      allResults = allResults.concat(pageProducts);

      if (pageProducts.length === 0) {
        console.log(await page.content());
      }

      await delay(1200);
    }

    const products = dedupeByLink(allResults)
      .filter((p) => p.title && p.price > 0 && p.image && p.link)
      .slice(0, Math.max(20, limit));

    console.log("Flipkart fetched:", products.length);
    return products;
  } catch (error) {
    console.error("Flipkart error:", error.message || error);
    return [];
  } finally {
    await browser.close();
  }
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 500;

      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
}

module.exports = { fetchFlipkart };
