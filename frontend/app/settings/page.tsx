'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { clearAuthToken, getAuthToken, getMe } from '@/lib/api';

export default function SettingsPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      const token = getAuthToken();
      if (!token) {
        if (!cancelled) setError('Please login to access settings.');
        return;
      }

      try {
        const response = await getMe(token);
        if (cancelled) return;
        setName(response.user.name);
        setEmail(response.user.email);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load profile');
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-foreground mb-6">Account Settings</h1>
        {error && (
          <div className="mb-6 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 mb-6">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-foreground font-medium">{name || '—'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-foreground font-medium">{email || '—'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              clearAuthToken();
              window.location.href = '/login';
            }}
          >
            Logout
          </Button>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
