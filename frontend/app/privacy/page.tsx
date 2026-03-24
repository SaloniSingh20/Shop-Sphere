import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-4">
          We store only required account data (name, email, encrypted password), wishlist items,
          recent searches, and recently viewed products to improve your experience.
        </p>
        <p className="text-muted-foreground mb-4">
          Product data shown in search results is fetched from public marketplace listings and APIs.
          Clicking a product opens the original marketplace website.
        </p>
        <p className="text-muted-foreground mb-8">
          If you want your account data removed, contact us at hello@shopsphere.com from your
          registered email address.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
