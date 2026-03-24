# ShopSphere - Development Guide

A comprehensive guide for developers working on or extending the ShopSphere platform.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

Then open [http://localhost:3000](http://localhost:3000)

## Project Architecture

### Directory Structure

```
ShopSphere/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes group (optional)
│   ├── category/[name]/          # Category pages
│   ├── product/[id]/             # Product detail pages
│   ├── search/                   # Search results
│   ├── dashboard/                # User dashboard
│   ├── wishlist/                 # Wishlist page
│   ├── login/                    # Login page
│   ├── signup/                   # Signup page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage
│   ├── not-found.tsx             # 404 page
│   └── globals.css               # Global styles & design tokens
│
├── components/
│   ├── shop/                     # Custom shop components
│   │   ├── navbar.tsx
│   │   ├── footer.tsx
│   │   ├── product-card.tsx
│   │   ├── search-bar.tsx
│   │   ├── filter-sidebar.tsx
│   │   ├── category-pills.tsx
│   │   ├── search-suggestions.tsx
│   │   └── product-recommendations.tsx
│   └── ui/                       # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       └── ... (50+ more)
│
├── lib/
│   ├── mock-products.ts          # Product data
│   └── utils.ts                  # Utility functions
│
├── hooks/
│   ├── use-debounce.ts           # Debounce hook
│   └── use-wishlist.ts           # Wishlist hook
│
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.mjs               # Next.js config
└── README.md                     # Project documentation
```

## Component Development

### Creating a New Component

#### 1. Shop Component (Custom)

```typescript
// components/shop/my-component.tsx
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <Button onClick={onAction}>Click me</Button>
    </motion.div>
  );
}
```

#### 2. UI Component (shadcn/ui)

Use the shadcn CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

### Component Best Practices

1. **Use TypeScript**: Always define props with interfaces
2. **Semantic HTML**: Use proper HTML5 elements
3. **Accessibility**: Add ARIA labels and roles
4. **Tailwind Classes**: Use design tokens where possible
5. **Framer Motion**: Add smooth animations for interactions
6. **Mobile First**: Design for mobile, enhance for desktop
7. **Dark Mode**: Ensure all components work in dark mode

## Styling Guide

### Design Tokens

All colors use CSS custom properties defined in `/app/globals.css`:

```css
/* Light mode */
:root {
  --primary: 45 13% 22%;           /* Charcoal */
  --secondary: 35 50% 88%;         /* Soft beige */
  --accent: 35 70% 60%;            /* Warm gold */
  --muted: 45 20% 92%;             /* Light gray */
  --destructive: 0 70% 55%;        /* Red */
  --border: 45 20% 90%;            /* Border gray */
}

/* Dark mode */
.dark {
  --primary: 250 10% 98%;
  --accent: 35 70% 60%;
  /* ... more tokens */
}
```

### Using Design Tokens in Components

```tsx
// ✅ Correct - Use semantic tokens
<div className="bg-primary text-primary-foreground">
  <p className="text-muted-foreground">Muted text</p>
</div>

// ❌ Avoid - Direct colors
<div className="bg-white text-black">
  <p className="text-gray-500">Muted text</p>
</div>
```

### Common Tailwind Patterns

```tsx
// Layout patterns
<div className="flex items-center justify-between gap-4">
  {/* Flexbox for alignment */}
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {/* Responsive grid */}
</div>

// Spacing (use gap instead of margin between children)
<div className="space-y-4">
  {/* Vertical spacing */}
</div>

<div className="flex gap-3">
  {/* Horizontal spacing */}
</div>

// Hover and states
<button className="hover:bg-accent hover:text-accent-foreground transition-colors">
  Interactive button
</button>

// Responsive text
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
  Responsive heading
</h1>

// Dark mode
<div className="bg-background dark:bg-background text-foreground dark:text-foreground">
  Works in both modes
</div>
```

## Data Management

### Adding Products

Edit `/lib/mock-products.ts`:

```typescript
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'unique-id',
    title: 'Product Name',
    price: 9999,
    originalPrice: 12999,           // Optional
    rating: 4.5,
    reviewCount: 123,
    image: 'https://image-url.jpg',
    platform: 'amazon',             // amazon | flipkart | nykaa | myntra
    category: 'electronics',        // electronics | fashion | beauty | home
    description: 'Optional description',
  },
];
```

### Using Product Data

```typescript
import { getProductById, searchProducts, getProductsByCategory } from '@/lib/mock-products';

// Search products
const results = searchProducts('iPhone');

// Get by category
const electronics = getProductsByCategory('electronics');

// Get single product
const product = getProductById('product-id');
```

## Routing

### App Router Structure

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          → /login
│   └── signup/
│       └── page.tsx          → /signup
├── category/
│   └── [name]/
│       └── page.tsx          → /category/electronics
├── product/
│   └── [id]/
│       └── page.tsx          → /product/1
└── page.tsx                  → /
```

### Creating a New Route

```typescript
// app/new-page/page.tsx
export default function NewPage() {
  return <div>New page content</div>;
}
```

### Dynamic Routes

```typescript
// app/dynamic/[id]/page.tsx
export default function DynamicPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  return <div>ID: {params.id}</div>;
}
```

## Animations

Using Framer Motion:

```tsx
import { motion } from 'framer-motion';

// Simple fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>

// Staggered children
<motion.div
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div key={item} variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>

// Hover effects
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// Scroll triggered
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
>
  Appears on scroll
</motion.div>
```

## Forms & Validation

### Form Example

```typescript
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function MyForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Handle submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Email
        </label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Submit'}
      </Button>
    </form>
  );
}
```

## State Management

### Using React Hooks

```typescript
// Simple state
const [count, setCount] = useState(0);

// Complex state
const [filters, setFilters] = useState({
  price: [0, 100000],
  platforms: ['amazon'],
  rating: 0,
});

// Callback pattern
const handleFilterChange = useCallback((newFilters) => {
  setFilters(newFilters);
}, []);
```

### Custom Hooks

```typescript
// hooks/use-my-hook.ts
import { useState, useCallback } from 'react';

export function useMyHook() {
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    // Fetch logic
  }, []);

  return { data, fetchData };
}

// Usage
const { data, fetchData } = useMyHook();
```

## Testing Checklist

Before deploying, verify:

- [ ] All pages load without errors
- [ ] Search functionality works
- [ ] Filters apply correctly
- [ ] Mobile responsive on all screen sizes
- [ ] Dark mode toggle works
- [ ] Forms validate properly
- [ ] Links navigate correctly
- [ ] Images load properly
- [ ] Animations are smooth
- [ ] Performance is good (Lighthouse > 80)

## Performance Tips

1. **Image Optimization**
   ```tsx
   import Image from 'next/image';
   
   <Image
     src="/image.jpg"
     alt="Description"
     width={400}
     height={400}
     priority={false}  // Lazy load by default
   />
   ```

2. **Code Splitting**
   ```tsx
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(() => import('@/components/heavy'));
   ```

3. **Memoization**
   ```tsx
   import { memo } from 'react';
   
   const MyComponent = memo(function MyComponent({ data }) {
     return <div>{data}</div>;
   });
   ```

## Debugging

### Browser DevTools
- Use React DevTools for component inspection
- Use Lighthouse for performance analysis
- Check Network tab for API calls

### Console Logging
```typescript
console.log('[ShopSphere] Debug message:', data);
console.error('[ShopSphere] Error:', error);
```

## Common Issues & Solutions

### Issue: Hydration mismatch

**Solution**: Ensure `'use client'` directive is at the top of component

```tsx
'use client';

import { useEffect } from 'react';

export function MyComponent() {
  useEffect(() => {
    // Client-side only code
  }, []);
}
```

### Issue: Image not showing

**Solution**: Check image URL and alt text

```tsx
<Image
  src="/images/my-image.jpg"  // Check path
  alt="Description"           // Always include
  width={400}
  height={400}
/>
```

### Issue: Styling not applying

**Solution**: Check if using correct Tailwind classes

```tsx
// ✅ Correct
<div className="flex items-center gap-4">

// ❌ Wrong
<div className="flex items center gap4">
```

## Deployment Checklist

- [ ] Run `npm run build` - no errors
- [ ] Run `npm start` - works locally
- [ ] Test on multiple browsers
- [ ] Test on mobile device
- [ ] Check Lighthouse score
- [ ] Review environment variables
- [ ] Push to GitHub/Git
- [ ] Deploy to Vercel

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Framer Motion](https://www.framer.com/motion)
- [TypeScript](https://www.typescriptlang.org)

## Getting Help

1. Check existing code patterns in the codebase
2. Review the README.md for high-level overview
3. Check component Props interface for usage
4. Search GitHub issues for similar problems
5. Ask in team discussions or create an issue

---

Happy coding! Feel free to reach out with questions.
