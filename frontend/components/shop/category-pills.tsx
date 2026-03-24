'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '📱',
    color: 'from-blue-400 to-blue-600',
  },
  {
    id: 'fashion',
    name: 'Fashion',
    icon: '👗',
    color: 'from-pink-400 to-pink-600',
  },
  {
    id: 'beauty',
    name: 'Beauty',
    icon: '💄',
    color: 'from-purple-400 to-purple-600',
  },
  {
    id: 'home',
    name: 'Home',
    icon: '🏠',
    color: 'from-orange-400 to-orange-600',
  },
];

interface CategoryPillsProps {
  className?: string;
}

export function CategoryPills({ className = '' }: CategoryPillsProps) {
  return (
    <div className={`flex flex-wrap gap-3 justify-center ${className}`}>
      {CATEGORIES.map((category, index) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Link href={`/category/${category.id}`}>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-6 py-3 rounded-full font-semibold text-foreground bg-card border border-border hover:border-accent/50 transition-all duration-300 overflow-hidden group"
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Content */}
              <div className="relative flex items-center gap-2">
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
