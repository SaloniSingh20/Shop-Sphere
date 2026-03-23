import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("shopspear_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function searchProducts(query) {
  const response = await api.get("/search", { params: { q: query } });
  return response.data;
}

export async function login(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function signup(payload) {
  const response = await api.post("/auth/signup", payload);
  return response.data;
}

export async function fetchWishlist() {
  const response = await api.get("/wishlist");
  return response.data;
}

export async function addWishlist(product) {
  const response = await api.post("/wishlist", product);
  return response.data;
}

export async function removeWishlist(productUrl) {
  const response = await api.delete(`/wishlist/${encodeURIComponent(productUrl)}`);
  return response.data;
}
