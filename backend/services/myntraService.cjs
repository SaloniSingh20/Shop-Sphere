const { withPage } = require("./puppeteerClient.cjs");
const { normalizeProduct, dedupeByLink, autoScroll, delay } = require("./serviceUtils.cjs");

async function fetchMyntra(query, { limit = 30, pages = 2 } = {}) {
  const all = [];

  for (let page = 1; page <= pages; page += 1) {
    const searchUrl = `https://www.myntra.com/${encodeURIComponent(query)}?p=${page}`;

    try {
      const items = await withPage(async (tab) => {
        await tab.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
        await tab.waitForSelector("body", { timeout: 15000 });
        await autoScroll(tab, 7, 420);
        await tab.waitForSelector("li.product-base, a[href*='/buy']", { timeout: 12000 });

        return tab.evaluate(() => {
          const rows = [];
          const cards = Array.from(document.querySelectorAll("li.product-base"));

          for (const card of cards) {
            const brand = card.querySelector("h3.product-brand")?.textContent || "";
            const name = card.querySelector("h4.product-product")?.textContent || "";
            const title = `${brand} ${name}`.trim();
            const link = card.querySelector("a")?.getAttribute("href") || "";

            rows.push({
              title,
              price:
                card.querySelector("span.product-discountedPrice")?.textContent ||
                card.querySelector("span.product-price")?.textContent ||
                "",
              image:
                card.querySelector("img.img-responsive")?.getAttribute("src") ||
                card.querySelector("img")?.getAttribute("src") ||
                "",
              rating:
                card.querySelector("div.product-ratingsContainer span")?.textContent || "",
              product_url: link,
              baseUrl: "https://www.myntra.com",
            });
          }

          return rows;
        });
      });

      all.push(...items.map((p) => normalizeProduct("myntra", p)).filter(Boolean));
    } catch (error) {
      console.error(`Myntra page ${page} failed:`, error.message || error);
    }

    await delay(900);
  }

  return dedupeByLink(all).slice(0, Math.max(20, limit));
}

module.exports = {
  fetchMyntra,
};
