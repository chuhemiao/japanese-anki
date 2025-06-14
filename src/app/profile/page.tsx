'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading, signOutUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='h-12 w-12 animate-spin text-primary' />
      </div>
    );
  }

  if (!user) {
    // Should be redirected by useEffect, but as a fallback:
    return (
      <div className='container mx-auto p-4 sm:p-6 lg:p-8 text-center'>
        <p>Please sign in to view your profile.</p>
        <Button asChild className='mt-4'>
          <Link href='/auth/signin'>Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-4 sm:p-6 lg:p-8 mt-10'>
      <Card className='max-w-md mx-auto shadow-xl'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-headline'>User Profile</CardTitle>
          <CardDescription>Your AnkiRin account details.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-col items-center space-y-3'>
            <Avatar className='w-24 h-24'>
              <AvatarImage
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                data-ai-hint='profile avatar'
              />
              <AvatarFallback>
                {user.displayName?.[0].toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <h2 className='text-xl font-semibold'>
              {user.displayName || 'User'}
            </h2>
            <p className='text-muted-foreground'>{user.email}</p>
          </div>

          <div className='space-y-2'>
            <Button
              onClick={() => router.push('/')}
              className='w-full'
              variant='outline'>
              Back to Flashcards
            </Button>
            <Button
              onClick={signOutUser}
              className='w-full'
              variant='destructive'>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
