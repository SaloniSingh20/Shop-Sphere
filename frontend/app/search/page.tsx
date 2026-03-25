'use client';

import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/shop/search-bar';
import { ProductCard } from '@/components/shop/product-card';
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar';
import {
  addRecentlyViewed,
  addWishlistItem,
  fetchCatalogProducts,
  fetchSearchResults,
  getAuthToken,
  getWishlist,
} from '@/lib/api';
import { Suspense, useState, useMemo, useEffect } from 'react';
import { Empty } from '@/components/ui/empty';
import { LiveProductCard, mapApiProducts } from '@/lib/live-products';
import { useDebounce } from '@/hooks/use-debounce';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);
  const [products, setProducts] = useState<LiveProductCard[]>([]);
  const [wishlistedUrls, setWishlistedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 100000],
    platforms: ['amazon', 'flipkart', 'nykaa', 'myntra'],
    minRating: 0,
    sort: 'price-low',
  });

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      const token = getAuthToken();
      if (!token) return;

      try {
        const response = await getWishlist(token);
        if (cancelled) return;
        setWishlistedUrls(response.wishlist.map((item) => item.product_url));
      } catch (_error) {
        if (!cancelled) {
          setWishlistedUrls([]);
        }
      }
    }

    loadWishlist();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function runSearch() {
      if (!debouncedQuery) {
        setIsLoading(true);
        setError('');

        try {
          const response = await fetchCatalogProducts({ limit: 80 });
          if (cancelled) return;
          setProducts(mapApiProducts(response.results));
        } catch (err) {
          if (cancelled) return;
          setProducts([]);
          setError(err instanceof Error ? err.message : 'Failed to fetch products');
        } finally {
          if (!cancelled) {
            setIsLoading(false);
          }
        }

        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const catalogResponse = await fetchCatalogProducts({ q: debouncedQuery, limit: 80 });
        if (cancelled) return;

        if (catalogResponse.results.length > 0) {
          setProducts(mapApiProducts(catalogResponse.results));
          return;
        }

        const response = await fetchSearchResults(debouncedQuery);
        if (cancelled) return;
        setProducts(mapApiProducts(response.results));
      } catch (err) {
        if (cancelled) return;
        setProducts([]);
        setError(err instanceof Error ? err.message : 'Failed to fetch search results');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  async function handleAddWishlist(product: LiveProductCard) {
    const token = getAuthToken();
    if (!token) {
      setError('Please login first to save wishlist items.');
      return;
    }

    try {
      const response = await addWishlistItem(token, {
        title: product.title,
        description: product.description,
        price: product.price,
        rating: product.rating,
        image: product.image,
        platform: product.platform,
        product_url: product.productUrl,
      });
      setWishlistedUrls(response.wishlist.map((item) => item.product_url));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save in wishlist');
    }
  }

  async function handleOpenProduct(product: LiveProductCard) {
    const token = getAuthToken();
    if (!token) return;

    try {
      await addRecentlyViewed(token, {
        title: product.title,
        description: product.description,
        price: product.price,
        rating: product.rating,
        image: product.image,
        platform: product.platform,
        product_url: product.productUrl,
      });
    } catch (_error) {
      // Best effort tracking only; do not block navigation.
    }
  }

  const filteredAndSortedProducts = useMemo(() => {
    let results = [...products];

    // Apply filters
    results = results.filter((product) => {
      const inPriceRange =
        product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const platformMatch = filters.platforms.includes(product.platform);
      const ratingMatch = product.rating >= filters.minRating;
      return inPriceRange && platformMatch && ratingMatch;
    });

    // Apply sorting
    switch (filters.sort) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        results.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        // Keep original order for 'newest'
        break;
    }

    return results;
  }, [products, filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Search Bar Section */}
      <div className="bg-secondary/20 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">
            {query ? `Search Results for "${query}"` : 'All Products'}
          </h1>
          <SearchBar />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar - Hidden on mobile */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 hidden lg:block"
          >
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <h2 className="font-bold text-foreground mb-6">Filters</h2>
              <FilterSidebar onFilterChange={setFilters} />
            </div>
          </motion.aside>

          {/* Product Grid */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {filteredAndSortedProducts.length}{' '}
                {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} found
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="mb-6 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
                Fetching live marketplace results...
              </div>
            )}

            {/* Products Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredAndSortedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProductCard
                      id={product.id}
                      title={product.title}
                      price={product.price}
                      originalPrice={product.originalPrice}
                      rating={product.rating}
                      reviewCount={product.reviewCount}
                      image={product.image}
                      platform={product.platform}
                      isCheapest={product.isCheapest}
                      badge={product.badge}
                      href={product.productUrl}
                      onWishlist={wishlistedUrls.includes(product.productUrl)}
                      onAddWishlist={() => handleAddWishlist(product)}
                      onOpenProduct={() => handleOpenProduct(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <Empty
                title="No products found"
                description={
                  query
                    ? 'Try adjusting your filters or search for something else'
                    : 'Search for a product to get live results from all platforms'
                }
              />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPageContent />
    </Suspense>
  );
}
