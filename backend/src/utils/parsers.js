function parsePrice(value) {
  if (!value) return null;
  const cleaned = String(value).replace(/[^\d.,]/g, "").replace(/,/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseRating(value) {
  if (!value) return null;
  const match = String(value).match(/\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeUrl(url, baseUrl) {
  if (!url) return null;
  try {
    return new URL(url, baseUrl).toString();
  } catch (_error) {
    return null;
  }
}

function compactText(value) {
  if (!value) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

module.exports = {
  parsePrice,
  parseRating,
  normalizeUrl,
  compactText,
};
