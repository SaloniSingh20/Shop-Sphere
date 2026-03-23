# ShopSpear

ShopSpear is a production-ready e-commerce aggregator that fetches real-time products from Amazon, Flipkart, Nykaa, and Myntra, normalizes results, compares price/rating, and provides auth + wishlist + historical tracking.

## Tech Stack

- Backend: Node.js, Express, Mongoose, Axios, Cheerio, Amazon PA-API
- Frontend: React, Tailwind CSS, Framer Motion, Axios
- Database: MongoDB
- Auth: JWT

## Data Strategy

- Amazon: PA-API first, controlled scraping fallback
- Flipkart: careful listing-page scraping (affiliate API can be integrated in service)
- Nykaa/Myntra: careful scraping with retry + rate control
- Reliability: user-agent headers, retry with exponential backoff, Promise.allSettled fallback, endpoint-level rate limiting

## 1) Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Environment variables in backend .env:

- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGIN`
- Optional Amazon PA-API credentials:
  - `AMAZON_PAAPI_ACCESS_KEY`
  - `AMAZON_PAAPI_SECRET_KEY`
  - `AMAZON_PARTNER_TAG`

### Backend APIs

- `GET /api/health`
- `GET /api/search?q=product_name`
- `GET /api/recommendations?q=product_name&budget=5000`
- `GET /api/price-drops?q=product_name`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/wishlist` (JWT)
- `POST /api/wishlist` (JWT)
- `DELETE /api/wishlist/:encodedUrl` (JWT)

### Search Caching Logic

- Mongo collection: search cache
- Cache key: normalized query
- Freshness window: 10 minutes
- If cache exists and fresh: return cached payload
- Else: fetch live from all sources in parallel and update cache

## 2) Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend .env:

- `VITE_API_BASE_URL=/api`

### Frontend Features

- Debounced unified search
- Animated UI with Framer Motion
- Product cards with platform logos
- Best Price / Best Rated labels
- Weighted sorting (rating 65%, price 35%)
- Filters: platform, max price, min rating
- Lazy loading (`loading="lazy"`) + incremental load-more
- JWT login/signup
- Wishlist save/remove
- Graceful partial-failure fallback banner

## 3) Integration Flow

1. User enters search term.
2. Frontend calls `/api/search?q=...`.
3. Backend checks 10-minute Mongo cache.
4. On miss, backend runs all marketplace services in parallel.
5. Results are normalized to:

```json
{
  "title": "...",
  "price": 1999,
  "rating": 4.3,
  "image": "https://...",
  "platform": "Amazon",
  "product_url": "https://..."
}
```

6. Backend deduplicates, scores, tags best price/rated, and returns merged output.

## 4) Deployment Guide

### Docker Compose (quick production-like setup)

```bash
docker compose up --build
```

Services:

- App (frontend + proxied backend API): `http://localhost:8080`
- MongoDB: `mongodb://localhost:27017`

### Single-Link Access

- Development: run backend and frontend, then open `http://localhost:5173` (or the Vite port shown in terminal). Frontend proxies `/api` to backend automatically.
- Docker: open `http://localhost:8080`. Nginx serves frontend and proxies `/api` to backend.

### Cloud Deployment

- Backend: Render/Railway/Fly/EC2 (Node + Mongo Atlas)
- Frontend: Vercel/Netlify (set `VITE_API_BASE_URL` to backend URL)
- Database: MongoDB Atlas

### Required Production Hardening

- Rotate JWT secrets
- Set strict CORS origin
- Add request logging and monitoring (OpenTelemetry/Sentry)
- Add proxy pool for scraping-heavy regions if needed
- Respect each platform terms and robots policy

## Scraping Compliance Notes

- Keep request rates conservative
- Avoid parallel spikes (platform-level limiter implemented)
- Use only publicly available listing pages
- Prefer official APIs where available (Amazon PA-API)

## Future Enhancements

- Integrate official Flipkart affiliate API in `flipkartService`
- Add BullMQ workers for scheduled price-drop notifications
- Add email alerts for wishlist price drops
- Add semantic recommendation model for category-aware ranking
