const { withPage } = require("./puppeteerClient.cjs");
const { normalizeProduct, dedupeByLink, autoScroll, delay } = require("./serviceUtils.cjs");

async function fetchNykaa(query, { limit = 30, pages = 2 } = {}) {
  const all = [];

  for (let page = 1; page <= pages; page += 1) {
    const searchUrl = `https://www.nykaa.com/search/result/?q=${encodeURIComponent(query)}&page_no=${page}`;

    try {
      const items = await withPage(async (tab) => {
        await tab.goto(searchUrl, { waitUntil: "domcontentloaded", timeout: 45000 });
        await tab.waitForSelector("body", { timeout: 15000 });
        await autoScroll(tab, 6, 420);
        await tab.waitForSelector("a[href*='/p/'], img", { timeout: 12000 });

        return tab.evaluate(() => {
          const rows = [];
          const cards = Array.from(document.querySelectorAll("a[href*='/p/']"));

          for (const anchor of cards) {
            const box = anchor.closest("div") || anchor;
            const text = (box.textContent || "").replace(/\s+/g, " ").trim();
            const priceMatch = text.match(/₹\s?[\d,]+/);

            rows.push({
              title:
                box.querySelector("img[alt]")?.getAttribute("alt") ||
                box.querySelector("h2")?.textContent ||
                box.querySelector("h3")?.textContent ||
                "",
              price: priceMatch ? priceMatch[0] : "",
              image:
                box.querySelector("img")?.getAttribute("src") ||
                box.querySelector("img")?.getAttribute("data-src") ||
                "",
              product_url: anchor.getAttribute("href") || "",
              baseUrl: "https://www.nykaa.com",
            });
          }

          return rows;
        });
      });

      all.push(...items.map((p) => normalizeProduct("nykaa", p)).filter(Boolean));
    } catch (error) {
      console.error(`Nykaa page ${page} failed:`, error.message || error);
    }

    await delay(900);
  }

  return dedupeByLink(all).slice(0, Math.max(20, limit));
}

module.exports = {
  fetchNykaa,
};
