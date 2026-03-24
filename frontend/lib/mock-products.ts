export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  platform: 'amazon' | 'flipkart' | 'nykaa' | 'myntra';
  category: string;
  description?: string;
  isCheapest?: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max',
    price: 139999,
    originalPrice: 149999,
    rating: 4.8,
    reviewCount: 2543,
    image: 'https://images.unsplash.com/photo-1592286927505-1def25115558?w=400&h=400&fit=crop',
    platform: 'amazon',
    category: 'electronics',
    isCheapest: true,
  },
  {
    id: '2',
    title: 'Sony WH-1000XM5 Headphones',
    price: 19999,
    originalPrice: 24999,
    rating: 4.7,
    reviewCount: 1892,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    platform: 'flipkart',
    category: 'electronics',
  },
  {
    id: '3',
    title: 'Premium Cotton T-Shirt',
    price: 799,
    originalPrice: 1299,
    rating: 4.5,
    reviewCount: 523,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    platform: 'myntra',
    category: 'fashion',
  },
  {
    id: '4',
    title: 'NARS Lipstick - Dragon Girl',
    price: 2500,
    originalPrice: 3000,
    rating: 4.6,
    reviewCount: 341,
    image: 'https://images.unsplash.com/photo-1588785965583-67a46e33d4d0?w=400&h=400&fit=crop',
    platform: 'nykaa',
    category: 'beauty',
  },
  {
    id: '5',
    title: 'Samsung 55" Smart TV',
    price: 42999,
    originalPrice: 59999,
    rating: 4.6,
    reviewCount: 1456,
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
    platform: 'amazon',
    category: 'electronics',
    isCheapest: true,
  },
  {
    id: '6',
    title: 'Nike Air Force 1',
    price: 6999,
    originalPrice: 8999,
    rating: 4.7,
    reviewCount: 2134,
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop',
    platform: 'flipkart',
    category: 'fashion',
  },
  {
    id: '7',
    title: 'Maybelline Fit Me Foundation',
    price: 399,
    originalPrice: 549,
    rating: 4.4,
    reviewCount: 892,
    image: 'https://images.unsplash.com/photo-1596462502278-af242a4ad98b?w=400&h=400&fit=crop',
    platform: 'nykaa',
    category: 'beauty',
  },
  {
    id: '8',
    title: 'Apple Watch Series 9',
    price: 35999,
    originalPrice: 41999,
    rating: 4.8,
    reviewCount: 1876,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    platform: 'amazon',
    category: 'electronics',
    isCheapest: true,
  },
];

export const getTrendingProducts = (): Product[] => {
  return MOCK_PRODUCTS.sort(() => Math.random() - 0.5).slice(0, 8);
};

export const getProductsByCategory = (category: string): Product[] => {
  return MOCK_PRODUCTS.filter((p) => p.category === category);
};

export const getProductById = (id: string): Product | undefined => {
  return MOCK_PRODUCTS.find((p) => p.id === id);
};

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.title.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
};
