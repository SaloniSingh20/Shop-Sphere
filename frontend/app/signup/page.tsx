'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { setAuthToken, signup, socialLogin } from '@/lib/api';

interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength: PasswordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordStrong = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordStrong || !passwordsMatch) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await signup(name, email, password);
      setAuthToken(response.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'apple') => {
    const defaultEmail = provider === 'google' ? 'you@gmail.com' : 'you@icloud.com';
    const email = window.prompt(`Enter your ${provider} email`, defaultEmail)?.trim();
    if (!email) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await socialLogin(provider, email, email.split('@')[0]);
      setAuthToken(response.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to sign up with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <span className="text-accent font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-lg text-foreground">ShopSphere</span>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
            <p className="text-muted-foreground">
              Join ShopSphere to save favorites and track deals
            </p>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 space-y-2"
                >
                  <StrengthCheckItem label="At least 8 characters" met={passwordStrength.hasMinLength} />
                  <StrengthCheckItem label="Uppercase letter" met={passwordStrength.hasUpperCase} />
                  <StrengthCheckItem label="Lowercase letter" met={passwordStrength.hasLowerCase} />
                  <StrengthCheckItem label="Number" met={passwordStrength.hasNumber} />
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full ${
                  confirmPassword && !passwordsMatch
                    ? 'border-destructive focus-visible:ring-destructive'
                    : ''
                }`}
              />
              {confirmPassword && !passwordsMatch && (
                <p className="mt-2 text-sm text-destructive">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="mt-2 text-sm text-accent flex items-center gap-1">
                  <Check className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="checkbox" required className="w-4 h-4 rounded mt-1" />
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="/terms" className="text-accent hover:text-accent/80 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-accent hover:text-accent/80 transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !isPasswordStrong || !passwordsMatch}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or sign up with</span>
            </div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:border-accent hover:text-accent"
              onClick={() => handleSocialSignup('google')}
              disabled={isLoading}
            >
              <span className="text-lg mr-2">🔵</span>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full border-border hover:border-accent hover:text-accent"
              onClick={() => handleSocialSignup('apple')}
              disabled={isLoading}
            >
              <span className="text-lg mr-2">🍎</span>
              Apple
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function StrengthCheckItem({ label, met }: { label: string; met: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2"
    >
      {met ? (
        <Check className="w-4 h-4 text-accent" />
      ) : (
        <X className="w-4 h-4 text-muted-foreground" />
      )}
      <span className={`text-xs ${met ? 'text-accent' : 'text-muted-foreground'}`}>
        {label}
      </span>
    </motion.div>
  );
}
