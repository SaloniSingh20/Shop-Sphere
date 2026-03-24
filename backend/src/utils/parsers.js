function parsePrice(value) {
  if (!value) return null;
  const raw = String(value).replace(/[^\d.,]/g, "").trim();
  if (!raw) return null;

  let cleaned = raw.replace(/,/g, "");

  // Handle price formats where dot is used as thousand separator (e.g. 0.899 -> 899, 12.999 -> 12999).
  if (/^\d+\.\d{3}$/.test(cleaned)) {
    cleaned = cleaned.replace(".", "");
  }

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
