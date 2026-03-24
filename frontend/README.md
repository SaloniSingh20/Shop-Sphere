# ShopSphere - Ultra-Premium E-Commerce Aggregator

A production-ready, ultra-premium e-commerce aggregator that helps users compare products and find the best deals across Amazon, Flipkart, Nykaa, and Myntra in a single, beautiful interface.

## Overview

ShopSphere is a modern web application built with Next.js 16, React 19, and Tailwind CSS that showcases a luxury e-commerce shopping experience. The platform features intelligent product comparison, price filtering, wishlists, and a premium design aesthetic inspired by Apple and modern D2C brands.

## Features

### Core Features
- **Multi-Platform Product Search**: Search across Amazon, Flipkart, Nykaa, and Myntra simultaneously
- **Smart Price Comparison**: See side-by-side pricing from different platforms with cheapest option highlighted
- **Advanced Filtering**: Filter by price range, platform, minimum rating, and sorting preferences
- **Product Wishlist**: Save favorite products and track them across your account
- **Category Browse**: Browse products by Electronics, Fashion, Beauty, and Home categories
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark Mode**: Beautiful dark theme with automatic preference detection

### Premium UI/UX
- **Smooth Animations**: Framer Motion micro-interactions and transitions throughout
- **Modern Aesthetics**: Apple-inspired minimalist design with luxury spacing
- **Glassmorphism Effects**: Subtle frosted glass effects for depth
- **Accessibility**: Semantic HTML, ARIA labels, and keyboard navigation
- **Performance Optimized**: Image optimization, lazy loading, and efficient rendering

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, CSS Variables for theming
- **Animation**: Framer Motion 11
- **Components**: shadcn/ui + custom premium components
- **Data**: Mock data with realistic product information
- **Icons**: Lucide React

## Project Structure

```
app/
├── page.tsx                    # Homepage with hero and trending products
├── search/page.tsx            # Search results with advanced filtering
├── product/[id]/page.tsx      # Product details with price comparison
├── category/[name]/page.tsx   # Category-specific browsing
├── login/page.tsx             # Login authentication page
├── signup/page.tsx            # Signup with password validation
├── dashboard/page.tsx         # User dashboard with wishlist & history
├── wishlist/page.tsx          # Wishlist management page
├── not-found.tsx              # 404 error page
└── layout.tsx                 # Root layout with navbar and footer

components/shop/
├── navbar.tsx                 # Navigation bar with responsive menu
├── footer.tsx                 # Footer with links and info
├── product-card.tsx           # Reusable product card component
├── search-bar.tsx             # Debounced search input
├── filter-sidebar.tsx         # Advanced filters with animations
├── category-pills.tsx         # Category navigation pills
├── search-suggestions.tsx     # Search suggestions dropdown
└── product-recommendations.tsx # Recommendation section

lib/
├── mock-products.ts           # Product data and utilities
└── utils.ts                   # Helper functions

hooks/
├── use-debounce.ts            # Debounce hook for search
└── use-wishlist.ts            # Wishlist state management

styles/
└── globals.css                # Premium design tokens and theme
```

## Design System

### Color Palette
- **Primary**: Warm charcoal (#3D3D3D) - for CTAs and primary elements
- **Secondary**: Soft beige (#E0D5D0) - accent and highlights
- **Accent**: Warm gold/amber (#B89970) - interactive elements
- **Neutral**: Off-white, light grays, dark charcoal - backgrounds and text
- **Dark Mode**: Deep warm brown backgrounds with light text

### Typography
- **Font Family**: Geist (sans-serif) for all text
- **Heading Scale**: 1.2x multiplier for hierarchy
- **Line Height**: 1.4-1.6 for body text (optimal readability)

### Spacing
- **Base Unit**: 8px grid system
- **Border Radius**: 18px for premium feel
- **Component Padding**: 12px-24px range for spacious layout

## Getting Started

### Installation

```bash
# Using shadcn CLI (recommended)
npx shadcn-cli@latest init my-project -d next
cd my-project

# Or clone and install manually
npm install
# or
pnpm install
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Build

```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## Key Pages

### Homepage (`/`)
- Hero section with prominent search bar
- Category pills for quick navigation
- Trending products carousel
- Feature benefits section
- Call-to-action sections

### Search (`/search?q=...`)
- Full-text product search
- Advanced filtering sidebar
- Responsive product grid
- Real-time result count
- Multiple sorting options

### Product Details (`/product/[id]`)
- Large product image
- Rating and reviews
- Price with discount calculation
- Platform availability
- Price comparison table
- Related products carousel

### Authentication
- **Login**: Email/password with remember me
- **Signup**: Name, email, password with strength indicator
- Form validation and error handling

### User Dashboard (`/dashboard`)
- User profile information
- Quick statistics
- Wishlist management
- Recently viewed products
- Saved comparisons
- Logout functionality

## Features Implementation

### Search & Filtering
- Debounced search input (500ms delay)
- Price range slider with min/max controls
- Multi-platform checkboxes
- Rating minimum filter
- Sort by: price (low/high), rating, newest

### Smart Features
- **Cheapest Price Highlighting**: "Best Price 🔥" badge on lowest option
- **Rating Display**: 5-star rating with review count
- **Discount Calculation**: Automatic percentage calculation
- **Responsive Grid**: 1-4 columns based on screen size

### State Management
- Client-side React hooks for filtering
- URL parameters for search persistence
- Local state for wishlist (can be extended to backend)

## Mobile Responsiveness

- **Mobile (< 640px)**: Single column grid, mobile menu, optimized spacing
- **Tablet (640px - 1024px)**: 2 column grid, side-by-side layouts
- **Desktop (> 1024px)**: 4 column grid, sidebar filters, full navigation

## Customization

### Adding Products
Edit `/lib/mock-products.ts` to add more products:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'product-id',
    title: 'Product Name',
    price: 9999,
    originalPrice: 12999,
    rating: 4.5,
    reviewCount: 123,
    image: 'image-url',
    platform: 'amazon',
    category: 'electronics',
  },
  // ...
];
```

### Modifying Colors
Edit design tokens in `/app/globals.css`:

```css
:root {
  --primary: 45 13% 22%;
  --accent: 35 70% 60%;
  /* ... more tokens */
}
```

### Changing Fonts
Update `/app/layout.tsx`:

```typescript
import { YourFont } from 'next/font/google';

const yourFont = YourFont({ subsets: ['latin'] });
```

## Performance Features

- **Image Optimization**: Next.js Image component with automatic sizing
- **Lazy Loading**: Components load on viewport intersection
- **Code Splitting**: Automatic route-based code splitting
- **CSS Optimization**: Tailwind purges unused styles
- **Animation Performance**: Hardware-accelerated Framer Motion animations

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Future Enhancements

- Real backend API integration with database
- User authentication with JWT/OAuth
- Shopping cart and checkout
- Payment gateway integration
- Product reviews and ratings system
- Push notifications for price drops
- Advanced recommendation engine
- Admin dashboard for product management

## Deployment

### Vercel (Recommended)

```bash
git push origin main
# Visit Vercel dashboard and connect repository
```

### Other Platforms

```bash
npm run build
npm run start
```

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open an issue in the repository or contact the development team.

---

Built with passion using Next.js, React, and Tailwind CSS. Ready to deploy and scale.
