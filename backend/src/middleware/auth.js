const jwt = require("jsonwebtoken");
const env = require("../config/env");

function extractBearerToken(req) {
  const authHeader = req.headers.authorization || "";
  return authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
}

function requireAuth(req, res, next) {
  const token = extractBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = payload;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function optionalAuth(req, _res, next) {
  const token = extractBearerToken(req);
  if (!token) {
    return next();
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
  } catch (_error) {
    req.user = null;
  }

  return next();
}

module.exports = { requireAuth, optionalAuth };
