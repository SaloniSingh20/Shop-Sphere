'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { SearchBar } from '@/components/shop/search-bar';
import { ProductCard } from '@/components/shop/product-card';
import { CategoryPills } from '@/components/shop/category-pills';
import { Button } from '@/components/ui/button';
import { addRecentlyViewed, fetchCatalogProducts, getAuthToken } from '@/lib/api';
import { useEffect, useState } from 'react';
import { LiveProductCard, mapApiProducts } from '@/lib/live-products';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 40 },
  },
};

export default function Home() {
  const [trendingProducts, setTrendingProducts] = useState<LiveProductCard[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadTrendingProducts() {
      try {
        const response = await fetchCatalogProducts({ limit: 16 });
        if (cancelled) return;
        setTrendingProducts(mapApiProducts(response.results).slice(0, 8));
      } catch (_error) {
        if (!cancelled) {
          setTrendingProducts([]);
        }
      }
    }

    loadTrendingProducts();

    return () => {
      cancelled = true;
    };
  }, []);

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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/30 to-background pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 text-balance">
              Shop Smarter Across <span className="text-accent">All Platforms</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Compare prices, find the best deals, and shop from Amazon, Flipkart, Nykaa, and Myntra in one place.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-3xl mx-auto mb-12"
          >
            <SearchBar />
          </motion.div>

          {/* Category Pills */}
          <CategoryPills className="mb-12" />

          {/* Platform Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap"
          >
            <span className="text-sm text-muted-foreground font-medium">Trusted by millions:</span>
            <div className="flex gap-6">
              {['🛒 Amazon', '📦 Flipkart', '💄 Nykaa', '👗 Myntra'].map((platform) => (
                <span key={platform} className="text-sm font-medium text-foreground">
                  {platform}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Trending Now</h2>
            <Link href="/search">
              <Button
                variant="ghost"
                className="text-accent hover:text-accent hover:bg-accent/10"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <p className="text-muted-foreground">
            Discover what's hot right now across all platforms
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {trendingProducts.map((product) => (
            <motion.div key={product.id} variants={item}>
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
                badge={product.isCheapest ? '🔥 Hot Deal' : undefined}
                href={product.productUrl}
                onOpenProduct={() => handleOpenProduct(product)}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-12"
          >
            Why Choose ShopSphere?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Compare Instantly',
                description: 'See prices from multiple platforms side-by-side in seconds',
              },
              {
                icon: '💰',
                title: 'Find Best Deals',
                description: 'Get notified of the cheapest option with our smart highlighting',
              },
              {
                icon: '❤️',
                title: 'Save Favorites',
                description: 'Create wishlists and track price changes across platforms',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-background border border-border hover:border-accent/50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-accent/10 border border-accent/20 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Ready to Find Better Deals?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start comparing products now and save on every purchase. It takes just seconds to find the best price.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/search">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                Explore Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-accent text-accent hover:bg-accent/10"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
