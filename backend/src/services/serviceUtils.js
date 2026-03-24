const cheerio = require("cheerio");
const pLimit = require("p-limit").default;
const fs = require("fs");
const { httpClient } = require("../config/axiosClient");

const DEFAULT_MIN_DELAY_MS = 350;
const DEFAULT_MAX_DELAY_MS = 850;

const platformLimiter = {
  amazon: pLimit(2),
  flipkart: pLimit(2),
  nykaa: pLimit(2),
  myntra: pLimit(2),
};

async function fetchHtml(url) {
  await randomDelay();
  const { data } = await httpClient.get(url);
  return cheerio.load(data);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function randomDelay(minMs = DEFAULT_MIN_DELAY_MS, maxMs = DEFAULT_MAX_DELAY_MS) {
  const floor = Math.max(0, Number(minMs) || 0);
  const ceil = Math.max(floor, Number(maxMs) || floor);
  const delay = Math.floor(Math.random() * (ceil - floor + 1)) + floor;
  await sleep(delay);
}

function rateLimited(platform, fn) {
  return platformLimiter[platform](fn);
}

function detectChromeExecutablePath() {
  const candidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ].filter(Boolean);

  for (const path of candidates) {
    if (fs.existsSync(path)) {
      return path;
    }
  }

  return "";
}

async function withTimeout(promise, timeoutMs, timeoutMessage = "Operation timed out") {
  const limit = Number(timeoutMs) || 0;
  if (limit <= 0) return promise;

  let timerId;
  const timeoutPromise = new Promise((_, reject) => {
    timerId = setTimeout(() => reject(new Error(timeoutMessage)), limit);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timerId) clearTimeout(timerId);
  }
}

module.exports = {
  fetchHtml,
  rateLimited,
  sleep,
  randomDelay,
  withTimeout,
  detectChromeExecutablePath,
};
