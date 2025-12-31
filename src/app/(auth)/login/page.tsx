'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/api/supabaseClient';
import { loginSchema } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    let isMounted = true;

    // Check immediately
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted && data.session) {
        router.replace('/dashboard');
      }
    });

    // Listen for future changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          router.replace('/dashboard');
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const authData = await authApi.login({ email, password });
      if (authData?.session) {
        // Supabase handles session storage - just redirect
        router.push('/dashboard');
      } else {
        setGeneralError('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred'
      );
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Sign in to your account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back! Please enter your credentials.
        </p>

        {generalError && (
          <div className="mt-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            autoComplete="email"
            required
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              placeholder="Enter your password"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              autoComplete="current-password"
              required
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Sign up
          </Link>
        </p>
      </div>
    </Card>
  );
}
