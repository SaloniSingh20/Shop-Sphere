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
  const isUnsplash = image.includes('images.unsplash.com');

  if ((image.startsWith('http://') || image.startsWith('https://')) && !isUnsplash) {
    return image;
  }

  if (image.startsWith('//')) {
    return `https:${image}`;
  }

  if (image.startsWith('/')) {
    return `${PLATFORM_BASE[platform]}${image}`;
  }

  const label = encodeURIComponent((item.platform || 'product').toUpperCase());
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='600' height='600'><rect width='100%25' height='100%25' fill='%23f4f4f5'/><text x='50%25' y='47%25' text-anchor='middle' fill='%236b7280' font-family='Arial, sans-serif' font-size='22'>${label}</text><text x='50%25' y='54%25' text-anchor='middle' fill='%239ca3af' font-family='Arial, sans-serif' font-size='16'>Image unavailable</text></svg>`;
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
