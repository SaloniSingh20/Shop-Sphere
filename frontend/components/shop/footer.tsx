import Link from 'next/link';
import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
                <span className="text-accent font-bold">S</span>
              </div>
              <span className="font-bold text-foreground">ShopSphere</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Shop smarter across multiple platforms. Find the best deals and compare products in seconds.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Browse</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/search"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/category/electronics"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Electronics
                </Link>
              </li>
              <li>
                <Link
                  href="/category/fashion"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Fashion
                </Link>
              </li>
              <li>
                <Link
                  href="/category/beauty"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Beauty
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Contact</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions? We'd love to hear from you.
            </p>
            <a
              href="mailto:hello@shopsphere.com"
              className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@shopsphere.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 ShopSphere. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                href="/privacy"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
