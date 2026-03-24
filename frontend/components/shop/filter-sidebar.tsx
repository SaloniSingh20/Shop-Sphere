'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

const PLATFORMS = [
  { id: 'amazon', label: 'Amazon', color: '#FF9900' },
  { id: 'flipkart', label: 'Flipkart', color: '#2874F0' },
  { id: 'nykaa', label: 'Nykaa', color: '#E6008E' },
  { id: 'myntra', label: 'Myntra', color: '#FC2B37' },
];

interface FilterSidebarProps {
  onFilterChange?: (filters: FilterState) => void;
  maxPrice?: number;
}

export interface FilterState {
  priceRange: [number, number];
  platforms: string[];
  minRating: number;
  sort: 'price-low' | 'price-high' | 'rating' | 'newest';
}

export function FilterSidebar({ onFilterChange, maxPrice = 100000 }: FilterSidebarProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([
    'amazon',
    'flipkart',
    'nykaa',
    'myntra',
  ]);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<'price-low' | 'price-high' | 'rating' | 'newest'>('price-low');
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    platform: true,
    rating: true,
    sort: true,
  });

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
    onFilterChange?.({
      priceRange: value,
      platforms: selectedPlatforms,
      minRating,
      sort,
    });
  };

  const handlePlatformToggle = (platformId: string) => {
    const updated = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter((p) => p !== platformId)
      : [...selectedPlatforms, platformId];
    setSelectedPlatforms(updated);
    onFilterChange?.({
      priceRange,
      platforms: updated,
      minRating,
      sort,
    });
  };

  const handleRatingChange = (rating: number) => {
    setMinRating(rating);
    onFilterChange?.({
      priceRange,
      platforms: selectedPlatforms,
      minRating: rating,
      sort,
    });
  };

  const handleSortChange = (newSort: typeof sort) => {
    setSort(newSort);
    onFilterChange?.({
      priceRange,
      platforms: selectedPlatforms,
      minRating,
      sort: newSort,
    });
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Price Range */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between mb-3 text-foreground font-semibold hover:text-accent transition-colors"
        >
          <span>Price Range</span>
          <motion.div
            animate={{ rotate: expandedSections.price ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {expandedSections.price && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            <Slider
              value={priceRange}
              onValueChange={handlePriceChange}
              min={0}
              max={maxPrice}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{Math.round(priceRange[0]).toLocaleString()} inr</span>
              <span>{Math.round(priceRange[1]).toLocaleString()} inr</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Platform Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <button
          onClick={() => toggleSection('platform')}
          className="w-full flex items-center justify-between mb-3 text-foreground font-semibold hover:text-accent transition-colors"
        >
          <span>Platforms</span>
          <motion.div
            animate={{ rotate: expandedSections.platform ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {expandedSections.platform && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {PLATFORMS.map((platform) => (
              <label key={platform.id} className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={selectedPlatforms.includes(platform.id)}
                  onCheckedChange={() => handlePlatformToggle(platform.id)}
                  className="w-5 h-5"
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  {platform.label}
                </span>
              </label>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Rating Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => toggleSection('rating')}
          className="w-full flex items-center justify-between mb-3 text-foreground font-semibold hover:text-accent transition-colors"
        >
          <span>Min. Rating</span>
          <motion.div
            animate={{ rotate: expandedSections.rating ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {expandedSections.rating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {[4.5, 4, 3.5, 3, 0].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  minRating === rating
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {rating > 0 ? `${rating}⭐ & above` : 'All Ratings'}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Sort */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={() => toggleSection('sort')}
          className="w-full flex items-center justify-between mb-3 text-foreground font-semibold hover:text-accent transition-colors"
        >
          <span>Sort By</span>
          <motion.div
            animate={{ rotate: expandedSections.sort ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </button>

        {expandedSections.sort && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {[
              { id: 'price-low', label: 'Price: Low to High' },
              { id: 'price-high', label: 'Price: High to Low' },
              { id: 'rating', label: 'Highest Rated' },
              { id: 'newest', label: 'Newest' },
            ].map((option) => (
              <button
                key={option.id}
                onClick={() => handleSortChange(option.id as typeof sort)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  sort === option.id
                    ? 'bg-accent/20 text-accent font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {
          setPriceRange([0, maxPrice]);
          setSelectedPlatforms(['amazon', 'flipkart', 'nykaa', 'myntra']);
          setMinRating(0);
          setSort('price-low');
          onFilterChange?.({
            priceRange: [0, maxPrice],
            platforms: ['amazon', 'flipkart', 'nykaa', 'myntra'],
            minRating: 0,
            sort: 'price-low',
          });
        }}
      >
        Reset Filters
      </Button>
    </div>
  );
}
