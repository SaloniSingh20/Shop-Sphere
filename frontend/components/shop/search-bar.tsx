'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({
  placeholder = 'Search products across all platforms...',
  onSearch,
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const trimmedQuery = searchQuery.trim();
      if (onSearch) {
        onSearch(trimmedQuery);
        return;
      }

      if (trimmedQuery) {
        router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
    },
    [router, onSearch]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 3px rgba(201, 160, 96, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        className="relative bg-background rounded-full border border-border overflow-hidden transition-all duration-300"
      >
        <div className="flex items-center px-4 py-3">
          <Search className="w-5 h-5 text-muted-foreground mr-3 flex-shrink-0" />

          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 border-0 bg-transparent outline-none text-foreground placeholder-muted-foreground px-0 py-0 text-base"
          />

          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={handleClear}
              className="flex-shrink-0 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="ml-3 px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full font-medium transition-colors flex-shrink-0"
          >
            Search
          </motion.button>
        </div>
      </motion.div>
    </form>
  );
}
