import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-4">
          ShopSphere is a comparison platform. Prices, availability, ratings, and descriptions may
          change on marketplace websites at any time.
        </p>
        <p className="text-muted-foreground mb-4">
          By using this service, you agree that purchases are completed on third-party websites and
          are subject to their policies.
        </p>
        <p className="text-muted-foreground mb-8">
          We provide comparison and wishlist tools and do not directly sell products.
        </p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
