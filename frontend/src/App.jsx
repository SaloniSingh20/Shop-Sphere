import { useEffect, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { addWishlist, searchProducts } from "./api/client";
import { AuthPanel } from "./components/AuthPanel";
import { FiltersBar } from "./components/FiltersBar";
import { ProductCard } from "./components/ProductCard";
import { SearchBar } from "./components/SearchBar";
import { SkeletonGrid } from "./components/SkeletonGrid";
import { WishlistPanel } from "./components/WishlistPanel";
import { useDebounce } from "./hooks/useDebounce";
import { useAuth } from "./hooks/useAuth";

const PAGE_SIZE = 12;

function App() {
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [failures, setFailures] = useState([]);
  const [error, setError] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [savedUrls, setSavedUrls] = useState(new Set());
  const [filters, setFilters] = useState({
    platform: "All",
    maxPrice: "",
    minRating: "",
  });

  const debouncedQuery = useDebounce(query, 500);

  const runSearch = async (term) => {
    const next = String(term || "").trim();
    if (next.length < 2) {
      setResults([]);
      setFailures([]);
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await searchProducts(next);
      setResults(data.results || []);
      setFailures(data.failures || []);
      setVisibleCount(PAGE_SIZE);
      document.title = `ShopSpear • ${next}`;
    } catch (requestError) {
      setResults([]);
      setFailures([]);
      setError(requestError.response?.data?.message || "Search failed. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSearch(debouncedQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      if (filters.platform !== "All" && item.platform !== filters.platform) return false;
      if (filters.maxPrice && item.price > Number(filters.maxPrice)) return false;
      if (filters.minRating && (item.rating || 0) < Number(filters.minRating)) return false;
      return true;
    });
  }, [filters, results]);

  const visibleResults = filteredResults.slice(0, visibleCount);

  const submitSearch = (event) => {
    event.preventDefault();
    runSearch(query);
  };

  const saveToWishlist = async (product) => {
    if (!isAuthenticated) return;
    await addWishlist(product);
    setSavedUrls((previous) => new Set(previous).add(product.product_url));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#f8fafc_42%,_#f1f5f9_100%)] text-zinc-900">
      <header className="border-b border-zinc-200 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="font-display text-2xl tracking-tight">ShopSpear</h1>
            <p className="text-sm text-zinc-600">Real-time shopping intelligence</p>
          </div>
          <p className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white">Live Aggregator</p>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
        <section>
          <SearchBar value={query} onChange={setQuery} onSubmit={submitSearch} loading={loading} />
          <FiltersBar filters={filters} onChange={setFilters} />

          {error && <p className="mt-4 rounded-xl bg-red-100 px-4 py-3 text-sm text-red-700">{error}</p>}
          {failures.length > 0 && (
            <div className="mt-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
              Partial data: {failures.map((failure) => failure.platform).join(", ")} unavailable right now.
            </div>
          )}

          {loading && <SkeletonGrid />}

          {!loading && (
            <AnimatePresence>
              <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {visibleResults.map((product) => (
                  <ProductCard
                    key={`${product.platform}-${product.product_url}`}
                    product={product}
                    onWishlist={saveToWishlist}
                    wished={savedUrls.has(product.product_url)}
                    disabledWishlist={!isAuthenticated}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}

          {!loading && filteredResults.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((previous) => previous + PAGE_SIZE)}
              className="mt-8 rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-800"
            >
              Load more
            </button>
          )}
        </section>

        <section className="space-y-4">
          <AuthPanel />
          <WishlistPanel />
          <aside className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            <h3 className="font-bold text-zinc-800">How ranking works</h3>
            <p className="mt-2">Results are weighted by rating (65%) and price competitiveness (35%).</p>
          </aside>
        </section>
      </main>
    </div>
  );
}

export default App;
