function parsePrice(value) {
  if (!value) return null;
  const input = String(value);
  const raw = input.replace(/[^\d.,]/g, "").trim();
  if (!raw) return null;

  const tokens = raw
    .split(/\s+/)
    .flatMap((part) => part.split(/(?<=\d)[,](?=\d{1,2}\b)/))
    .map((token) => token.trim())
    .filter(Boolean);

  const candidates = (tokens.length ? tokens : [raw])
    .map((token) => {
      let cleaned = token.replace(/,/g, "");

      // Handle price formats where dot is used as thousand separator (e.g. 0.899 -> 899, 12.999 -> 12999).
      if (/^\d+\.\d{3}$/.test(cleaned)) {
        cleaned = cleaned.replace(".", "");
      }

      const parsed = Number.parseFloat(cleaned);
      if (!Number.isFinite(parsed) || parsed <= 0) return null;
      return parsed;
    })
    .filter((num) => num !== null);

  if (!candidates.length) {
    return null;
  }

  // Prefer realistic shopping prices when multiple numeric fragments exist in the same text.
  const realistic = candidates.filter((num) => num >= 10);
  return realistic.length ? Math.max(...realistic) : Math.max(...candidates);
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
