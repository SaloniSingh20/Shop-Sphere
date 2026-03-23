const cheerio = require("cheerio");
const pLimit = require("p-limit").default;
const { httpClient } = require("../config/axiosClient");

const platformLimiter = {
  amazon: pLimit(2),
  flipkart: pLimit(2),
  nykaa: pLimit(2),
  myntra: pLimit(2),
};

async function fetchHtml(url) {
  const { data } = await httpClient.get(url);
  return cheerio.load(data);
}

function rateLimited(platform, fn) {
  return platformLimiter[platform](fn);
}

module.exports = {
  fetchHtml,
  rateLimited,
};
