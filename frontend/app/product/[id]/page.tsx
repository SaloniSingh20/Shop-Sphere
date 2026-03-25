'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingCart, ArrowLeft, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  addWishlistItem,
  fetchCatalogProductByUrl,
  fetchCatalogProducts,
  getAuthToken,
} from '@/lib/api';
import { getProductById, MOCK_PRODUCTS } from '@/lib/mock-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/shop/product-card';
import { LiveProductCard, mapApiProducts } from '@/lib/live-products';

function formatInr(value: number): string {
  return `₹${Math.round(value).toLocaleString()}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<LiveProductCard[]>([]);

  const productUrlParam = searchParams.get('url') || '';
  const decodedUrlParam = productUrlParam ? decodeURIComponent(productUrlParam) : '';
  const decodedId = decodeURIComponent(String(params?.id || ''));
  const isUrlId = /^https?:\/\//i.test(decodedUrlParam) || /^https?:\/\//i.test(decodedId);
  const resolvedUrl = /^https?:\/\//i.test(decodedUrlParam) ? decodedUrlParam : decodedId;
  const fallbackProduct = getProductById(String(params?.id || ''));
  const [liveProduct, setLiveProduct] = useState<LiveProductCard | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLiveProduct() {
      if (!isUrlId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const detail = await fetchCatalogProductByUrl(resolvedUrl);
        if (cancelled) return;

        const mapped = mapApiProducts([detail.product])[0] || null;
        setLiveProduct(mapped);

        const category = String(detail.product.category || '').toLowerCase();
        if (category) {
          const related = await fetchCatalogProducts({ category, limit: 8 });
          if (cancelled) return;

          setRelatedProducts(
            mapApiProducts(related.results).filter((item) => item.productUrl !== resolvedUrl).slice(0, 4)
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product details');
          setLiveProduct(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadLiveProduct();

    return () => {
      cancelled = true;
    };
  }, [isUrlId, resolvedUrl]);

  const product = useMemo(() => {
    if (liveProduct) {
      return {
        id: liveProduct.id,
        title: liveProduct.title,
        price: liveProduct.price,
        originalPrice: liveProduct.originalPrice,
        rating: liveProduct.rating,
        reviewCount: liveProduct.reviewCount,
        image: liveProduct.image,
        platform: liveProduct.platform,
        category: 'live',
        isCheapest: liveProduct.isCheapest,
        description: liveProduct.description,
        productUrl: liveProduct.productUrl,
      };
    }

    if (fallbackProduct) {
      return {
        ...fallbackProduct,
        productUrl: undefined,
      };
    }

    return null;
  }, [fallbackProduct, liveProduct]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          {error && <p className="text-destructive mb-4">{error}</p>}
          <Link href="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get other sellers of same product for mock mode.
  const otherSellers = product.category === 'live'
    ? []
    : MOCK_PRODUCTS.filter((p) => p.title === product.title && p.platform !== product.platform);

  const mockRelatedProducts = MOCK_PRODUCTS.filter(
    (p) =>
      p.category === product.category &&
      p.id !== product.id &&
      p.platform === product.platform
  ).slice(0, 4);

  const finalRelatedProducts = product.category === 'live' ? relatedProducts : mockRelatedProducts;

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const allSellersOfProduct = [product, ...otherSellers];
  const cheapestPrice = Math.min(...allSellersOfProduct.map((p) => p.price));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/search">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Search
          </Button>
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl overflow-hidden bg-muted border border-border"
          >
            <div className="relative w-full h-96 lg:h-full">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                priority
              />
              {product.isCheapest && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-accent text-accent-foreground text-sm">
                    Best Price 🔥
                  </Badge>
                </div>
              )}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl font-bold text-foreground mb-4">{product.title}</h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">⭐ {product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-8 pb-8 border-b border-border">
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-bold text-foreground">{formatInr(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatInr(product.originalPrice)}
                  </span>
                )}
              </div>
              {discount && (
                <div className="flex items-center gap-2">
                  <Badge className="bg-destructive text-destructive-foreground">
                    {discount}% OFF
                  </Badge>
                  <span className="text-sm text-muted-foreground">Limited time offer</span>
                </div>
              )}
            </div>

            {/* Platform Info */}
            <div className="mb-8 p-4 bg-card border border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Available on</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {{
                    amazon: '🛒',
                    flipkart: '📦',
                    nykaa: '💄',
                    myntra: '👗',
                  }[product.platform]}
                </span>
                <span className="font-semibold text-foreground capitalize">{product.platform}</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                size="lg"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  if (product.productUrl) {
                    window.open(product.productUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                {product.productUrl ? 'Buy Now' : 'View Product'}
              </Button>
              {product.productUrl && (
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    window.open(product.productUrl, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Visit Store
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                onClick={async () => {
                  setIsWishlisted(!isWishlisted);

                  const token = getAuthToken();
                  if (!token || !product.productUrl) return;

                  try {
                    await addWishlistItem(token, {
                      title: product.title,
                      description: product.description,
                      price: product.price,
                      rating: product.rating,
                      image: product.image,
                      platform: product.platform,
                      product_url: product.productUrl,
                    });
                  } catch (_err) {
                    // Keep UI optimistic; wishlist page shows authoritative DB state.
                  }
                }}
                className={`flex-1 ${
                  isWishlisted
                    ? 'bg-accent/10 text-accent border-accent'
                    : 'border-border text-foreground'
                }`}
              >
                <Heart className={`w-5 h-5 mr-2 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Saved' : 'Save'}
              </Button>
            </div>

            {/* Key Features */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground">✓ Free delivery on orders above ₹500</li>
                <li className="text-sm text-muted-foreground">✓ 7-day return policy</li>
                <li className="text-sm text-muted-foreground">✓ Secure payment options</li>
                <li className="text-sm text-muted-foreground">✓ Authentic product guarantee</li>
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Price Comparison */}
        {allSellersOfProduct.length > 1 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-8">Price Comparison</h2>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full">
                <thead className="bg-card border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-foreground">Platform</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">Price</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">Rating</th>
                    <th className="px-6 py-4 text-right font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allSellersOfProduct.map((seller, index) => (
                    <tr
                      key={`${seller.platform}-${index}`}
                      className={`border-b border-border hover:bg-card/50 transition-colors ${
                        seller.price === cheapestPrice ? 'bg-accent/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-foreground capitalize">
                        {seller.price === cheapestPrice && (
                          <Badge className="mr-2 bg-accent text-accent-foreground">Best Price</Badge>
                        )}
                        {seller.platform}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-bold text-foreground">
                          {formatInr(seller.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">⭐ {seller.rating}</td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline">
                          Shop
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}

        {/* Related Products */}
        {finalRelatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-8">Similar Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {finalRelatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  id={relatedProduct.id}
                  title={relatedProduct.title}
                  price={relatedProduct.price}
                  originalPrice={relatedProduct.originalPrice}
                  rating={relatedProduct.rating}
                  reviewCount={relatedProduct.reviewCount}
                  image={relatedProduct.image}
                  platform={relatedProduct.platform}
                  isCheapest={relatedProduct.isCheapest}
                  badge={
                    'badge' in relatedProduct
                      ? (relatedProduct as LiveProductCard).badge
                      : undefined
                  }
                  href={
                    'productUrl' in relatedProduct
                      ? (relatedProduct as LiveProductCard).productUrl
                      : undefined
                  }
                />
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}
