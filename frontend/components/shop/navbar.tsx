'use client';

import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Menu, X, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shop/theme-toggle';
import { clearAuthToken, getAuthToken, getMe } from '@/lib/api';

type NavbarUser = {
  name: string;
  email: string;
};

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState<NavbarUser | null>(null);

  useEffect(() => {
    setIsMounted(true);

    let cancelled = false;

    const loadAuthState = async () => {
      const token = getAuthToken();

      if (!token) {
        if (!cancelled) {
          setUser(null);
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await getMe(token);
        if (!cancelled) {
          setUser(response.user);
        }
      } catch (_error) {
        clearAuthToken();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsCheckingAuth(false);
        }
      }
    };

    loadAuthState();

    const onAuthChange = () => {
      setIsCheckingAuth(true);
      loadAuthState();
    };

    window.addEventListener('auth-changed', onAuthChange);
    window.addEventListener('focus', onAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener('auth-changed', onAuthChange);
      window.removeEventListener('focus', onAuthChange);
    };
  }, []);

  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  const handleLogout = () => {
    clearAuthToken();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
              <span className="text-accent font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-lg text-foreground hidden sm:inline">
              ShopSphere
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/search">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Explore
              </Button>
            </Link>
            <Link href="/category/electronics">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Electronics
              </Button>
            </Link>
            <Link href="/category/fashion">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Fashion
              </Button>
            </Link>
            <Link href="/category/beauty">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Beauty
              </Button>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-accent hover:bg-accent/10"
              >
                <Heart className="w-5 h-5" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-accent hover:bg-accent/10"
              >
                <ShoppingBag className="w-5 h-5" />
              </Button>
            </Link>

            <div className="hidden sm:flex gap-2 items-center">
              {isMounted && !isCheckingAuth && user ? (
                <>
                  <Link href="/dashboard">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-accent hover:text-accent"
                    >
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold mr-2">
                        {initial}
                      </span>
                      {user.name}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border hover:border-accent hover:text-accent"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-foreground"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border py-4 space-y-3"
          >
            <Link href="/search" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                Explore
              </Button>
            </Link>
            <Link href="/category/electronics" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                Electronics
              </Button>
            </Link>
            <Link href="/category/fashion" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                Fashion
              </Button>
            </Link>
            <Link href="/category/beauty" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                Beauty
              </Button>
            </Link>
            <div className="pt-3 border-t border-border space-y-2 flex flex-col">
              <div className="flex justify-start px-2">
                <ThemeToggle />
              </div>
              {isMounted && !isCheckingAuth && user ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="outline" className="w-full justify-start">
                      <User className="w-4 h-4 mr-2" />
                      {user.name}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup" className="block">
                    <Button className="w-full bg-primary hover:bg-primary/90">Sign up</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
