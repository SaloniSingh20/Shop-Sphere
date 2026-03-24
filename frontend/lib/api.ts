export type ApiPlatform = 'Amazon' | 'Flipkart' | 'Nykaa' | 'Myntra' | string;

export interface ApiProduct {
  id?: string;
  title: string;
  description?: string;
  price: number;
  rating?: number;
  image?: string;
  platform: ApiPlatform;
  product_url: string;
  category?: string;
  score?: number;
  isBestPrice?: boolean;
  isTopMatch?: boolean;
  meta?: {
    score?: number;
    bestPrice?: boolean;
    bestMatch?: boolean;
  };
}

export interface ApiSearchResponse {
  query: string;
  cached: boolean;
  timestamp: string;
  results: ApiProduct[];
  failures: Array<{ platform: string; error: string }>;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UserActivityResponse {
  user: {
    id: string;
    name: string;
    email: string;
    joinDate: string;
  };
  wishlist: ApiProduct[];
  recentSearches: Array<{ query: string; searchedAt: string }>;
  recentlyViewed: ApiProduct[];
}

export interface CatalogCategory {
  key: string;
  label: string;
  count: number;
}

export interface CatalogProductResponse {
  product: ApiProduct;
}

const API_BASE_URL = '/api';
const TOKEN_KEY = 'shopsphere_token';

function getHeaders(authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    const message = (data as { message?: string })?.message || 'Request failed';
    throw new Error(message);
  }

  return data;
}

export function getAuthToken(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(TOKEN_KEY);
}

export function normalizePlatform(platform: string): 'amazon' | 'flipkart' | 'nykaa' | 'myntra' {
  const value = platform.toLowerCase();

  if (value.includes('flipkart')) return 'flipkart';
  if (value.includes('nykaa')) return 'nykaa';
  if (value.includes('myntra')) return 'myntra';
  return 'amazon';
}

export async function fetchSearchResults(query: string): Promise<ApiSearchResponse> {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: token ? getHeaders(token) : undefined,
    cache: 'no-store',
  });
  return parseJson<ApiSearchResponse>(response);
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return parseJson<AuthResponse>(response);
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, email, password }),
  });
  return parseJson<AuthResponse>(response);
}

export async function getWishlist(token: string): Promise<{ wishlist: ApiProduct[] }> {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  return parseJson<{ wishlist: ApiProduct[] }>(response);
}

export async function addWishlistItem(token: string, product: ApiProduct): Promise<{ wishlist: ApiProduct[] }> {
  const response = await fetch(`${API_BASE_URL}/wishlist`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(product),
  });
  return parseJson<{ wishlist: ApiProduct[] }>(response);
}

export async function removeWishlistItem(token: string, productUrl: string): Promise<{ wishlist: ApiProduct[] }> {
  const response = await fetch(`${API_BASE_URL}/wishlist/${encodeURIComponent(productUrl)}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });
  return parseJson<{ wishlist: ApiProduct[] }>(response);
}

export async function getMe(token: string): Promise<{ user: AuthResponse['user'] }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  return parseJson<{ user: AuthResponse['user'] }>(response);
}

export async function getUserActivity(token: string): Promise<UserActivityResponse> {
  const response = await fetch(`${API_BASE_URL}/activity`, {
    headers: getHeaders(token),
    cache: 'no-store',
  });
  return parseJson<UserActivityResponse>(response);
}

export async function addRecentlyViewed(token: string, product: ApiProduct): Promise<{ recentlyViewed: ApiProduct[] }> {
  const response = await fetch(`${API_BASE_URL}/activity/viewed`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(product),
  });
  return parseJson<{ recentlyViewed: ApiProduct[] }>(response);
}

export async function fetchCatalogCategories(): Promise<{ categories: CatalogCategory[] }> {
  const response = await fetch(`${API_BASE_URL}/catalog/categories`, {
    cache: 'no-store',
  });
  return parseJson<{ categories: CatalogCategory[] }>(response);
}

export async function fetchCatalogProducts(params?: {
  category?: string;
  q?: string;
  limit?: number;
}): Promise<{ category: string | null; query: string | null; results: ApiProduct[] }> {
  const search = new URLSearchParams();
  if (params?.category) search.set('category', params.category);
  if (params?.q) search.set('q', params.q);
  if (params?.limit) search.set('limit', String(params.limit));

  const response = await fetch(
    `${API_BASE_URL}/catalog${search.toString() ? `?${search.toString()}` : ''}`,
    {
      cache: 'no-store',
    }
  );

  return parseJson<{ category: string | null; query: string | null; results: ApiProduct[] }>(response);
}

export async function syncCatalog(category?: string): Promise<{ synced: Array<{ category: string; upserted: number }> }> {
  const response = await fetch(
    `${API_BASE_URL}/catalog/sync${category ? `?category=${encodeURIComponent(category)}` : ''}`,
    {
      method: 'POST',
      headers: getHeaders(),
    }
  );
  return parseJson<{ synced: Array<{ category: string; upserted: number }> }>(response);
}

export async function fetchCatalogProductByUrl(productUrl: string): Promise<CatalogProductResponse> {
  const response = await fetch(
    `${API_BASE_URL}/catalog/product?url=${encodeURIComponent(productUrl)}`,
    {
      cache: 'no-store',
    }
  );

  return parseJson<CatalogProductResponse>(response);
}
