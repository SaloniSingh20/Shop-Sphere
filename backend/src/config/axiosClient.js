const axios = require("axios");
const rax = require("retry-axios");

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const httpClient = axios.create({
  timeout: 12000,
  headers: {
    "User-Agent": USER_AGENT,
    Accept: "text/html,application/json,application/xhtml+xml",
    "Accept-Language": "en-IN,en;q=0.9",
  },
});

httpClient.defaults.raxConfig = {
  instance: httpClient,
  retry: 3,
  retryDelay: 600,
  backoffType: "exponential",
  httpMethodsToRetry: ["GET", "HEAD", "OPTIONS"],
  statusCodesToRetry: [
    [429, 429],
    [500, 599],
  ],
  onRetryAttempt: (error) => {
    const cfg = rax.getConfig(error);
    if (cfg?.currentRetryAttempt) {
      // eslint-disable-next-line no-console
      console.warn(`Retry #${cfg.currentRetryAttempt} for ${error?.config?.url}`);
    }
  },
};

rax.attach(httpClient);

module.exports = { httpClient, USER_AGENT };
