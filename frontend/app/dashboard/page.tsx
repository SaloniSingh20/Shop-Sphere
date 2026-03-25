'use client';

import { motion } from 'framer-motion';
import { LogOut, Heart, Clock, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/product-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  addRecentlyViewed,
  clearAuthToken,
  fetchCatalogProducts,
  getAuthToken,
  getUserActivity,
} from '@/lib/api';
import { LiveProductCard, mapApiProducts } from '@/lib/live-products';

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: 'Guest User',
    email: 'Please login',
    avatar: '👤',
    joinDate: 'Recently',
  });
  const [wishlistItems, setWishlistItems] = useState<LiveProductCard[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<LiveProductCard[]>([]);
  const [recommendations, setRecommendations] = useState<LiveProductCard[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{ query: string; searchedAt: string }>>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboardData() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setError('Please login to view your dashboard.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getUserActivity(token);
        if (cancelled) return;

        setUserProfile({
          name: response.user.name,
          email: response.user.email,
          avatar: response.user.name?.[0]?.toUpperCase() || '👤',
          joinDate: new Date(response.user.joinDate).toLocaleDateString(),
        });
        setWishlistItems(mapApiProducts(response.wishlist));
        setRecentlyViewed(mapApiProducts(response.recentlyViewed));
        setRecentSearches(response.recentSearches || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      cancelled = true;
    };
  }, []);

  const savedComparisons = recentlyViewed.slice(0, 3);
  const randomRecommendations = useMemo(() => {
    const list = [...recommendations];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list.slice(0, 4);
  }, [recommendations]);

  useEffect(() => {
    let cancelled = false;

    async function loadRecommendations() {
      try {
        const response = await fetchCatalogProducts({ limit: 30 });
        if (cancelled) return;
        setRecommendations(mapApiProducts(response.results));
      } catch (_err) {
        if (!cancelled) {
          setRecommendations([]);
        }
      }
    }

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogout() {
    clearAuthToken();
    window.location.href = '/login';
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/10 to-secondary/20 border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center text-4xl border-2 border-accent/30">
                {userProfile.avatar}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">{userProfile.name}</h1>
                <p className="text-muted-foreground mb-2">{userProfile.email}</p>
                <p className="text-sm text-muted-foreground">Joined {userProfile.joinDate}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-border hover:border-accent hover:text-accent"
                onClick={() => {
                  window.location.href = '/settings';
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-destructive text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Wishlist Items', value: wishlistItems.length, icon: '❤️' },
              { label: 'Comparisons', value: savedComparisons.length, icon: '📊' },
              { label: 'Recently Viewed', value: recentlyViewed.length, icon: '👀' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-background/50 border border-border rounded-lg p-4"
              >
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="mb-6 rounded-md border border-border bg-card p-3 text-sm text-muted-foreground">
            Loading dashboard data...
          </div>
        )}

        <Tabs defaultValue="wishlist" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card border border-border">
            <TabsTrigger value="wishlist" className="data-[state=active]:bg-background">
              <Heart className="w-4 h-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="viewed" className="data-[state=active]:bg-background">
              <Clock className="w-4 h-4 mr-2" />
              Recently Viewed
            </TabsTrigger>
            <TabsTrigger value="comparisons" className="data-[state=active]:bg-background">
              <span className="text-lg mr-2">📊</span>
              Comparisons
            </TabsTrigger>
          </TabsList>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">My Wishlist</h2>
              <Link href="/wishlist">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
            {wishlistItems.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {wishlistItems.map((product, index) => (
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
                      onWishlist={true}
                      href={product.productUrl}
                      onOpenProduct={() => handleOpenProduct(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-muted-foreground py-8">No items in your wishlist yet</p>
            )}
          </TabsContent>

          {/* Recently Viewed Tab */}
          <TabsContent value="viewed" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Recently Viewed</h2>
            {recentlyViewed.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {recentlyViewed.map((product, index) => (
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
                      onOpenProduct={() => handleOpenProduct(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <p className="text-muted-foreground py-8">You haven't viewed any products yet</p>
            )}
          </TabsContent>

          {/* Comparisons Tab */}
          <TabsContent value="comparisons" className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">Saved Comparisons</h2>
            {savedComparisons.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {savedComparisons.map((product, index) => (
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
                      onOpenProduct={() => handleOpenProduct(product)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-muted-foreground py-8 space-y-3">
                <p>No saved comparisons yet</p>
                <p className="font-medium text-foreground">Recent searches:</p>
                {recentSearches.length > 0 ? (
                  <ul className="space-y-1">
                    {recentSearches.slice(0, 6).map((item, index) => (
                      <li key={`${item.query}-${index}`}>• {item.query}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">No recent searches saved yet.</p>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {randomRecommendations.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recommended For You</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRecommendations((prev) => [...prev])}
              >
                Refresh Picks
              </Button>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {randomRecommendations.map((product, index) => (
                <motion.div
                  key={`${product.id}-${index}`}
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
                    onOpenProduct={() => handleOpenProduct(product)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}
      </div>
    </div>
  );
}
