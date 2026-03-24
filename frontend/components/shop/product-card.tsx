'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  platform: 'amazon' | 'flipkart' | 'nykaa' | 'myntra';
  badge?: string;
  isCheapest?: boolean;
  onWishlist?: boolean;
  onAddWishlist?: () => void;
  href?: string;
  onOpenProduct?: () => void;
}

const platformColors: Record<string, string> = {
  amazon: 'bg-[#FF9900]/10 text-[#FF9900]',
  flipkart: 'bg-[#2874F0]/10 text-[#2874F0]',
  nykaa: 'bg-[#E6008E]/10 text-[#E6008E]',
  myntra: 'bg-[#FC2B37]/10 text-[#FC2B37]',
};

const platformLogos: Record<string, string> = {
  amazon: '🛒',
  flipkart: '📦',
  nykaa: '💄',
  myntra: '👗',
};

function formatInr(value: number): string {
  return `${Math.round(value).toLocaleString()} inr`;
}

export function ProductCard({
  id,
  title,
  price,
  originalPrice,
  rating,
  reviewCount,
  image,
  platform,
  badge,
  isCheapest,
  onWishlist,
  onAddWishlist,
  href,
  onOpenProduct,
}: ProductCardProps) {
  const router = useRouter();
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  const detailHref = href
    ? `/product/${id}?url=${encodeURIComponent(href)}`
    : `/product/${id}`;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
      className="group"
    >
      <Link
        href={detailHref}
        onClick={() => {
          onOpenProduct?.();
        }}
      >
        <div className="overflow-hidden rounded-xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:border-accent/50 cursor-pointer h-full flex flex-col">
          {/* Image Container */}
          <div className="relative h-48 w-full overflow-hidden bg-muted">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-2">
              {isCheapest && (
                <Badge className="bg-accent text-accent-foreground text-xs font-semibold">
                  Best Price 🔥
                </Badge>
              )}
              {badge && (
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold"
                >
                  {badge}
                </Badge>
              )}
              {discount && (
                <Badge className="bg-destructive text-destructive-foreground text-xs font-semibold">
                  {discount}% OFF
                </Badge>
              )}
            </div>

            {/* Platform Badge - Bottom Right */}
            <div className="absolute bottom-3 right-3">
              <div className={`px-2 py-1 rounded-lg text-sm font-medium ${platformColors[platform]}`}>
                {platformLogos[platform]}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 flex flex-col">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 mb-2 group-hover:text-accent transition-colors">
              {title}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-foreground">⭐ {rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({reviewCount})</span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-foreground">
                  {formatInr(price)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatInr(originalPrice)}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-auto flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(detailHref);
                }}
              >
                View Details
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={(e) => {
                  e.preventDefault();
                  if (href) {
                    window.open(href, '_blank', 'noopener,noreferrer');
                    return;
                  }
                  router.push(detailHref);
                }}
              >
                <ShoppingCart className="w-4 h-4" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  onAddWishlist?.();
                }}
                className={`w-10 ${onWishlist ? 'bg-accent/10 text-accent border-accent' : ''}`}
              >
                <Heart className={`w-4 h-4 ${onWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
