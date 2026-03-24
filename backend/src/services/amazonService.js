const amazonPaapi = require("amazon-paapi");
const env = require("../config/env");
const { normalizeProduct } = require("../utils/normalizers");
const { parsePrice, parseRating, normalizeUrl, compactText } = require("../utils/parsers");
const { fetchHtml, rateLimited } = require("./serviceUtils");
const { httpClient } = require("../config/axiosClient");

const BASE_URL = "https://www.amazon.in";

function withAffiliateTag(url) {
  if (!url || !env.amazon.partnerTag) return url;
  try {
    const nextUrl = new URL(url);
    nextUrl.searchParams.set("tag", env.amazon.partnerTag);
    return nextUrl.toString();
  } catch (_error) {
    return url;
  }
}

async function searchWithPaapi(query) {
  if (!env.amazon.accessKey || !env.amazon.secretKey || !env.amazon.partnerTag) {
    return [];
  }

  const commonParameters = {
    AccessKey: env.amazon.accessKey,
    SecretKey: env.amazon.secretKey,
    PartnerTag: env.amazon.partnerTag,
    PartnerType: "Associates",
    Marketplace: env.amazon.marketplace,
  };

  const requestParameters = {
    Keywords: query,
    SearchIndex: "All",
    ItemCount: 12,
    Resources: [
      "Images.Primary.Medium",
      "ItemInfo.Title",
      "Offers.Listings.Price",
      "CustomerReviews.StarRating",
      "DetailPageURL",
    ],
  };

  const response = await amazonPaapi.SearchItems(requestParameters, commonParameters);
  const items = response?.SearchResult?.Items || [];

  return items
    .map((item) =>
      normalizeProduct({
        title: item?.ItemInfo?.Title?.DisplayValue,
        description: item?.ItemInfo?.Title?.DisplayValue,
        price: item?.Offers?.Listings?.[0]?.Price?.Amount,
        rating: item?.CustomerReviews?.StarRating?.Value,
        image: item?.Images?.Primary?.Medium?.URL,
        platform: "Amazon",
        product_url: withAffiliateTag(item?.DetailPageURL),
      })
    )
    .filter(Boolean);
}

async function searchWithRapidApi(query) {
  if (!env.amazon.rapidApiKey || !env.amazon.rapidApiHost) {
    return [];
  }

  const endpoint = `https://${env.amazon.rapidApiHost}/search`;
  const { data } = await httpClient.get(endpoint, {
    params: {
      query,
      country: "IN",
      page: "1",
    },
    headers: {
      "x-rapidapi-key": env.amazon.rapidApiKey,
      "x-rapidapi-host": env.amazon.rapidApiHost,
      Accept: "application/json",
    },
  });

  const items = Array.isArray(data?.data?.products)
    ? data.data.products
    : Array.isArray(data?.products)
      ? data.products
      : [];

  return items
    .slice(0, 12)
    .map((item) =>
      normalizeProduct({
        title: item?.product_title || item?.title,
        description: item?.product_description || item?.title,
        price: item?.product_price || item?.price,
        rating: item?.product_star_rating || item?.rating,
        image: item?.product_photo || item?.thumbnail,
        platform: "Amazon",
        product_url: withAffiliateTag(item?.product_url || item?.url),
      })
    )
    .filter(Boolean);
}

async function searchWithScraping(query) {
  const url = `${BASE_URL}/s?k=${encodeURIComponent(query)}`;
  const $ = await fetchHtml(url);

  const items = [];
  $("div[data-component-type='s-search-result']").each((_index, element) => {
    if (items.length >= 12) return;

    const card = $(element);
    const title = compactText(card.find("h2 a span").first().text());
    const description = compactText(
      card
        .find("div.a-row.a-size-small span.a-size-base")
        .map((_i, el) => $(el).text())
        .get()
        .slice(0, 3)
        .join(" | ")
    );
    const price = parsePrice(card.find("span.a-price span.a-offscreen").first().text());
    const rating = parseRating(card.find("span.a-icon-alt").first().text());
    const image = card.find("img.s-image").attr("src") || null;
    const href = card.find("h2 a").attr("href");

    const normalized = normalizeProduct({
      title,
      description,
      price,
      rating,
      image,
      platform: "Amazon",
      product_url: withAffiliateTag(normalizeUrl(href, BASE_URL)),
    });

    if (normalized) items.push(normalized);
  });

  return items;
}

async function searchAmazon(query) {
  return rateLimited("amazon", async () => {
    try {
      const apiResults = await searchWithPaapi(query);
      if (apiResults.length) return apiResults;

      const rapidApiResults = await searchWithRapidApi(query);
      if (rapidApiResults.length) return rapidApiResults;

      return searchWithScraping(query);
    } catch (_error) {
      try {
        const rapidApiResults = await searchWithRapidApi(query);
        if (rapidApiResults.length) return rapidApiResults;
      } catch (_rapidApiError) {
        // Ignore and continue to scraping fallback.
      }

      try {
        return await searchWithScraping(query);
      } catch (_scrapeError) {
        return [];
      }
    }
  });
}

module.exports = { searchAmazon };
