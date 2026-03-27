const fs = require("fs");
const puppeteer = require("puppeteer-core");
const { USER_AGENT } = require("./serviceUtils.cjs");

let sharedBrowser = null;

function resolveChromeExecutablePath() {
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

  throw new Error(
    "No Chrome/Edge executable found. Set PUPPETEER_EXECUTABLE_PATH in .env to your browser executable path."
  );
}

async function getBrowser() {
  if (sharedBrowser) return sharedBrowser;

  const executablePath = resolveChromeExecutablePath();
  const headless = process.env.PUPPETEER_HEADLESS === "true" ? true : false;

  sharedBrowser = await puppeteer.launch({
    headless,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  return sharedBrowser;
}

async function withPage(task) {
  const browser = await getBrowser();
  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);
  await page.setViewport({ width: 1400, height: 900 });

  try {
    return await task(page);
  } finally {
    await page.close();
  }
}

async function closeBrowser() {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

module.exports = {
  withPage,
  closeBrowser,
};
