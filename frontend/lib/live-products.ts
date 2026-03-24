import { ApiProduct, normalizePlatform } from '@/lib/api';

export interface LiveProductCard {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  platform: 'amazon' | 'flipkart' | 'nykaa' | 'myntra';
  isCheapest: boolean;
  isTopMatch: boolean;
  badge?: string;
  productUrl: string;
}

const PLATFORM_BASE: Record<string, string> = {
  amazon: 'https://www.amazon.in',
  flipkart: 'https://www.flipkart.com',
  nykaa: 'https://www.nykaa.com',
  myntra: 'https://www.myntra.com',
};

function resolveImage(item: ApiProduct, index: number): string {
  const platform = normalizePlatform(item.platform);
  const image = String(item.image || '').trim();

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }

  if (image.startsWith('//')) {
    return `https:${image}`;
  }

  if (image.startsWith('/')) {
    return `${PLATFORM_BASE[platform]}${image}`;
  }

  // Use product-specific fallback query instead of a single static image.
  const seed = encodeURIComponent(`${item.title || 'product'} ${item.platform || ''} ${index}`);
  return `https://source.unsplash.com/600x600/?${seed}`;
}

export function mapApiProducts(results: ApiProduct[]): LiveProductCard[] {
  const minPrice = results.reduce((min, item) => (item.price < min ? item.price : min), Number.POSITIVE_INFINITY);

  const bestScore = results.reduce((top, item) => {
    const score = item.score ?? item.meta?.score ?? 0;
    return score > top ? score : top;
  }, 0);

  return results.map((item, index) => ({
    id: item.id || `${index + 1}`,
    title: item.title,
    description: item.description || item.title,
    price: item.price,
    rating: item.rating ?? 0,
    reviewCount: 0,
    image: resolveImage(item, index),
    platform: normalizePlatform(item.platform),
    isCheapest: Boolean(item.isBestPrice || item.meta?.bestPrice || item.price === minPrice),
    isTopMatch: Boolean(item.isTopMatch || item.meta?.bestMatch || (item.score ?? item.meta?.score ?? 0) === bestScore),
    badge: Boolean(item.isTopMatch || item.meta?.bestMatch || (item.score ?? item.meta?.score ?? 0) === bestScore)
      ? 'Top Match ⭐'
      : undefined,
    productUrl: item.product_url,
  }));
}
