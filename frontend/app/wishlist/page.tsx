'use client';

import { motion } from 'framer-motion';
import { Heart, ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/product-card';
import { Empty } from '@/components/ui/empty';
import {
  addRecentlyViewed,
  clearAuthToken,
  getAuthToken,
  getWishlist,
  normalizePlatform,
  removeWishlistItem,
} from '@/lib/api';

interface WishlistProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  platform: 'amazon' | 'flipkart' | 'nykaa' | 'myntra';
  productUrl: string;
}

function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString()}`;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadWishlist() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) {
          setError('Please login to view your wishlist.');
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await getWishlist(token);
        if (cancelled) return;

        const mapped = response.wishlist.map((item, index) => ({
          id: `${index + 1}`,
          title: item.title,
          price: item.price,
          rating: item.rating ?? 0,
          reviewCount: 0,
          image:
            item.image ||
            'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
          platform: normalizePlatform(item.platform),
          productUrl: item.product_url,
        }));

        setWishlist(mapped);
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : 'Unable to load wishlist';
        if (message.toLowerCase().includes('token') || message.toLowerCase().includes('unauthorized')) {
          clearAuthToken();
          setError('Session expired. Please login again.');
        } else {
          setError(message);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadWishlist();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRemoveFromWishlist = async (productUrl: string) => {
    const token = getAuthToken();
    if (!token) {
      setError('Please login to manage wishlist.');
      return;
    }

    try {
      const response = await removeWishlistItem(token, productUrl);
      const mapped = response.wishlist.map((item, index) => ({
        id: `${index + 1}`,
        title: item.title,
        price: item.price,
        rating: item.rating ?? 0,
        reviewCount: 0,
        image:
          item.image ||
          'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop',
        platform: normalizePlatform(item.platform),
        productUrl: item.product_url,
      }));

      setWishlist(mapped);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove item');
    }
  };

  const totalValue = wishlist.reduce((sum, product) => sum + product.price, 0);

  const handleOpenProduct = async (product: WishlistProduct) => {
    const token = getAuthToken();
    if (!token) return;

    try {
      await addRecentlyViewed(token, {
        title: product.title,
        price: product.price,
        rating: product.rating,
        image: product.image,
        platform: product.platform,
        product_url: product.productUrl,
      });
    } catch (_error) {
      // Best effort tracking only; do not block navigation.
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-secondary/20 border-b border-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8 text-accent fill-current" />
              <h1 className="text-4xl font-bold text-foreground">My Wishlist</h1>
            </div>
            <p className="text-muted-foreground">
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved
            </p>
          </motion.div>
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
            Loading wishlist...
          </div>
        )}

        {wishlist.length > 0 ? (
          <>
            {/* Wishlist Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-6 mb-8"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Items</p>
                  <p className="text-3xl font-bold text-foreground">{wishlist.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Value</p>
                  <p className="text-3xl font-bold text-foreground">
                    {formatInr(totalValue)}
                  </p>
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <Link href="/search">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Continue Shopping
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Wishlist
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {wishlist.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <ProductCard
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    image={product.image}
                    platform={product.platform}
                    onWishlist={true}
                    onAddWishlist={() => handleRemoveFromWishlist(product.productUrl)}
                    href={product.productUrl}
                    onOpenProduct={() => handleOpenProduct(product)}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center pointer-events-none group-hover:pointer-events-auto"
                  >
                    <Button
                      variant="default"
                      onClick={() => handleRemoveFromWishlist(product.productUrl)}
                      className="pointer-events-auto bg-background text-foreground hover:bg-background/90"
                    >
                      Remove
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <Empty
            title="Your wishlist is empty"
            description="Start adding products to your wishlist to save them for later"
          />
        )}
      </div>
    </div>
  );
}
