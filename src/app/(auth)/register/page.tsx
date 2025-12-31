'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Building } from 'lucide-react';
import { Button, Input, Card, Select } from '@/components/ui';
import { authApi } from '@/lib/api';
import { supabase } from '@/lib/api/supabaseClient';
import { registerSchema } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [organizationSize, setOrganizationSize] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const organizationSizeOptions = [
    { value: '1-10', label: '1-10 employees' },
    { value: '10-50', label: '10-50 employees' },
    { value: '50-100', label: '50-100 employees' },
    { value: '100-500', label: '100-500 employees' },
    { value: '500+', label: '500+ employees' },
  ];

  // Redirect if already authenticated
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/dashboard');
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);

    // Validate
    const result = registerSchema.safeParse({
      full_name: fullName,
      email,
      password,
      confirm_password: confirmPassword,
      organization_name: organizationName || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        fieldErrors[path] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const { session } = await authApi.register({
        email,
        password,
        full_name: fullName,
        organization_name: organizationName,
        organization_size: organizationSize,
      });
      if (session) {
        // Set cookie for middleware authentication
        document.cookie = `proposal_access_token=${session.access_token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
        router.replace('/dashboard');
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrors({ email: 'This email is already registered.' });
        } else {
          setGeneralError(error.message);
        }
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-500">
          Start creating professional proposals today.
        </p>

        {generalError && (
          <div className="mt-4 rounded-lg bg-danger-50 border border-danger-200 p-3 text-sm text-danger-700">
            {generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.full_name}
            placeholder="John Smith"
            leftIcon={<User className="h-4 w-4" />}
            autoComplete="name"
            required
          />

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

          <Input
            label="Organization Name"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            error={errors.organization_name}
            placeholder="Acme Corporation"
            leftIcon={<Building className="h-4 w-4" />}
            required
          />

          <Select
            label="Organization Size"
            value={organizationSize}
            onChange={(e) => setOrganizationSize(e.target.value)}
            error={errors.organization_size}
            options={organizationSizeOptions}
            placeholder="Select organization size"
            required
          />

          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="Create a strong password"
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
            autoComplete="new-password"
            required
          />

          <Input
            label="Confirm Password"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirm_password}
            placeholder="Confirm your password"
            leftIcon={<Lock className="h-4 w-4" />}
            autoComplete="new-password"
            required
          />

          <p className="text-xs text-slate-500">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </Card>
  );
}
