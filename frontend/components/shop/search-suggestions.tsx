'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Clock } from 'lucide-react';

interface SearchSuggestionsProps {
  suggestions: string[];
  recentSearches?: string[];
  onSelectSuggestion: (query: string) => void;
  isOpen: boolean;
}

export function SearchSuggestions({
  suggestions,
  recentSearches = [],
  onSelectSuggestion,
  isOpen,
}: SearchSuggestionsProps) {
  if (!isOpen) return null;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: -10 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
    >
      {/* Trending Suggestions */}
      {suggestions.length > 0 && (
        <div className="border-b border-border">
          <div className="px-4 py-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-foreground">Trending</span>
          </div>
          <div className="space-y-1">
            {suggestions.slice(0, 5).map((suggestion, index) => (
              <motion.button
                key={index}
                variants={item}
                onClick={() => onSelectSuggestion(suggestion)}
                className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {suggestion}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div>
          <div className="px-4 py-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold text-foreground">Recent</span>
          </div>
          <div className="space-y-1">
            {recentSearches.slice(0, 3).map((search, index) => (
              <motion.button
                key={index}
                variants={item}
                onClick={() => onSelectSuggestion(search)}
                className="w-full px-4 py-2 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {search}
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
