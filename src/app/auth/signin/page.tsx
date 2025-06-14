'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// A simple Google icon component (replace with a proper SVG or lucide-react if available)
const GoogleIcon = () => (
  <svg className='mr-2 h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
    <path d='M1 1h22v22H1z' fill='none' />
  </svg>
);

export default function SignInPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/profile';

  useEffect(() => {
    if (!loading && user) {
      router.push(redirect); // Redirect if already logged in
    }
  }, [user, loading, router, redirect]);

  if (loading || user) {
    // Show loader if loading or if user exists (implies redirection is pending)
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
        {user && <p className='ml-2 mt-2'>Redirecting...</p>}
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-purple-100 dark:to-purple-900/50 p-4'>
      <Card className='w-full max-w-sm shadow-xl animate-fadeIn'>
        <CardHeader className='text-center'>
          <CardTitle className='text-3xl font-headline text-primary'>
            Sign In
          </CardTitle>
          <CardDescription className='text-md'>
            Access AnkiRin to save your progress.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6 pt-6'>
          <Button
            onClick={signInWithGoogle}
            className='w-full py-6 text-lg'
            disabled={loading}>
            {loading ? (
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            ) : (
              <GoogleIcon />
            )}
            Sign in with Google
          </Button>
          <p className='text-xs text-center text-muted-foreground px-4'>
            By signing in, you agree to our Terms of Service and Privacy Policy
            (placeholders).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
