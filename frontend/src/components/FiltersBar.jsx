const platforms = ["All", "Amazon", "Flipkart", "Nykaa", "Myntra"];

export function FiltersBar({ filters, onChange }) {
  return (
    <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white/70 p-4 shadow-sm backdrop-blur md:grid-cols-3">
      <select
        className="rounded-xl border border-zinc-300 px-3 py-2"
        value={filters.platform}
        onChange={(event) => onChange({ ...filters, platform: event.target.value })}
      >
        {platforms.map((platform) => (
          <option key={platform} value={platform}>
            {platform}
          </option>
        ))}
      </select>

      <input
        type="number"
        min="0"
        className="rounded-xl border border-zinc-300 px-3 py-2"
        value={filters.maxPrice}
        placeholder="Max price"
        onChange={(event) => onChange({ ...filters, maxPrice: event.target.value })}
      />

      <input
        type="number"
        min="0"
        max="5"
        step="0.1"
        className="rounded-xl border border-zinc-300 px-3 py-2"
        value={filters.minRating}
        placeholder="Min rating"
        onChange={(event) => onChange({ ...filters, minRating: event.target.value })}
      />
    </div>
  );
}
