const dotenv = require("dotenv");

dotenv.config();

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/shopspear",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  amazon: {
    accessKey: process.env.AMAZON_PAAPI_ACCESS_KEY,
    secretKey: process.env.AMAZON_PAAPI_SECRET_KEY,
    partnerTag: process.env.AMAZON_PARTNER_TAG,
    marketplace: process.env.AMAZON_MARKETPLACE || "www.amazon.in",
  },
};

module.exports = env;
