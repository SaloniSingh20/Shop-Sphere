'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductCard } from '@/components/shop/product-card';
import { FilterSidebar, FilterState } from '@/components/shop/filter-sidebar';
import { SearchBar } from '@/components/shop/search-bar';
import {
  addRecentlyViewed,
  addWishlistItem,
  fetchCatalogProducts,
  getAuthToken,
  getWishlist,
} from '@/lib/api';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { LiveProductCard, mapApiProducts } from '@/lib/live-products';

const CATEGORY_INFO: Record<string, { title: string; description: string; icon: string }> = {
  electronics: {
    title: 'Electronics',
    description: 'Latest gadgets, phones, and tech accessories',
    icon: '📱',
  },
  fashion: {
    title: 'Fashion',
    description: 'Clothing, shoes, and fashion accessories',
    icon: '👗',
  },
  beauty: {
    title: 'Beauty',
    description: 'Cosmetics, skincare, and personal care',
    icon: '💄',
  },
  home: {
    title: 'Home & Living',
    description: 'Furniture, decor, and home essentials',
    icon: '🏠',
  },
};

const CATEGORY_MAX_PRICE: Record<string, number> = {
  fashion: 20000,
  beauty: 20000,
  electronics: 100000,
  home: 100000,
};

export default function CategoryPage() {
  const params = useParams<{ name: string }>();
  const categoryName = String(params?.name || '').toLowerCase();
  const categoryInfo = CATEGORY_INFO[categoryName];
  const categoryMaxPrice = CATEGORY_MAX_PRICE[categoryName] || 100000;
  const [products, setProducts] = useState<LiveProductCard[]>([]);
  const [categoryQuery, setCategoryQuery] = useState('');
  const debouncedCategoryQuery = useDebounce(categoryQuery, 300);
  const [wishlistedUrls, setWishlistedUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, categoryMaxPrice],
    platforms: ['amazon', 'flipkart', 'nykaa', 'myntra'],
    minRating: 0,
    sort: 'price-low',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, priceRange: [0, categoryMaxPrice] }));
  }, [categoryMaxPrice]);

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
        if (!cancelled) setWishlistedUrls([]);
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCategoryProducts() {
      if (!categoryInfo) return;

      setIsLoading(true);
      setError('');
      try {
        const response = await fetchCatalogProducts({
          category: categoryName,
          q: debouncedCategoryQuery || undefined,
          limit: 80,
        });
        if (cancelled) return;
        setProducts(mapApiProducts(response.results));
      } catch (err) {
        if (cancelled) return;
        setProducts([]);
        setError(err instanceof Error ? err.message : 'Failed to load category products');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadCategoryProducts();

    return () => {
      cancelled = true;
    };
  }, [categoryName, categoryInfo, debouncedCategoryQuery]);

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
        break;
    }

    return results;
  }, [products, filters]);

  if (!categoryInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Category not found</h1>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Category Header */}
      <div className="bg-secondary/20 border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="inline-block mb-6">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-4">
              <span className="text-5xl">{categoryInfo.icon}</span>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">{categoryInfo.title}</h1>
            </div>
            <p className="text-lg text-muted-foreground">{categoryInfo.description}</p>
            <div className="mt-6 max-w-3xl">
              <SearchBar
                placeholder={`Search in ${categoryInfo.title}...`}
                onSearch={(value) => setCategoryQuery(value.trim())}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 hidden lg:block"
          >
            <div className="sticky top-24 bg-card rounded-xl border border-border p-6">
              <h2 className="font-bold text-foreground mb-6">Filters</h2>
              <FilterSidebar onFilterChange={setFilters} maxPrice={categoryMaxPrice} />
            </div>
          </motion.aside>

          {/* Product Grid */}
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4"
          >
            {error && (
              <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {isLoading && (
              <div className="mb-6 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
                Loading category products...
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-muted-foreground">
                {filteredAndSortedProducts.length}{' '}
                {filteredAndSortedProducts.length === 1 ? 'product' : 'products'} available
              </p>
            </div>

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
                description="Try adjusting your filters"
              />
            )}
          </motion.main>
        </div>
      </div>
    </div>
  );
}
