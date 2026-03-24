'use client';

import { motion } from 'framer-motion';
import { MOCK_PRODUCTS } from '@/lib/mock-products';
import { ProductCard } from './product-card';

interface ProductRecommendationsProps {
  title?: string;
  description?: string;
  limit?: number;
  category?: string;
}

export function ProductRecommendations({
  title = 'Recommended For You',
  description = 'Based on your browsing history',
  limit = 8,
  category,
}: ProductRecommendationsProps) {
  const recommendations = category
    ? MOCK_PRODUCTS.filter((p) => p.category === category).slice(0, limit)
    : MOCK_PRODUCTS.slice(0, limit);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 400, damping: 40 },
    },
  };

  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {title}
        </h2>
        <p className="text-muted-foreground">{description}</p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {recommendations.map((product) => (
          <motion.div key={product.id} variants={item}>
            <ProductCard
              id={product.id}
              title={product.title}
              price={product.price}
              originalPrice={product.originalPrice}
              rating={product.rating}
              reviewCount={product.reviewCount}
              image={product.image}
              platform={product.platform}
              isCheapest={product.isCheapest}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
