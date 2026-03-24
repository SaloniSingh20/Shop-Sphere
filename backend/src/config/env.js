const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopsphere",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  platformTimeoutMs: Number(process.env.PLATFORM_TIMEOUT_MS || 12000),
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || "",
  amazon: {
    accessKey: process.env.AMAZON_PAAPI_ACCESS_KEY,
    secretKey: process.env.AMAZON_PAAPI_SECRET_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    marketplace: process.env.AMAZON_MARKETPLACE || "www.amazon.in",
    rapidApiKey: process.env.AMAZON_RAPIDAPI_KEY,
    rapidApiHost: process.env.AMAZON_RAPIDAPI_HOST || "real-time-amazon-data.p.rapidapi.com",
  },
};

module.exports = env;
