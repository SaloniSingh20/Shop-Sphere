import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-lg w-full border border-border rounded-xl p-8 bg-card">
        <h1 className="text-3xl font-bold text-foreground mb-4">Forgot Password</h1>
        <p className="text-muted-foreground mb-6">
          Password reset flow is not enabled yet. Please contact support at
          hello@shopsphere.com from your registered email.
        </p>
        <div className="flex gap-3">
          <Link href="/login">
            <Button>Back to Login</Button>
          </Link>
          <a href="mailto:hello@shopsphere.com">
            <Button variant="outline">Email Support</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
