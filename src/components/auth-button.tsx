
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth'; 
import { LogIn, LogOut, UserCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"


export function AuthButtons() {
  const { user, signInWithGoogle, signOutUser, loading } = useAuth();

  if (loading) {
    return <Button variant="ghost" size="sm" disabled><Loader2 className="h-4 w-4 animate-spin"/></Button>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Profile button is now part of the header links in page.tsx for logged-in users */}
        {/* Desktop Sign Out */}
        <Button variant="outline" size="sm" onClick={signOutUser} aria-label="Sign Out" className="hidden sm:flex">
          <LogOut className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
        {/* Mobile Sign Out Icon */}
        <Button variant="ghost" size="icon" onClick={signOutUser} aria-label="Sign Out" className="sm:hidden">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sign In */}
      <Button onClick={signInWithGoogle} size="sm" aria-label="Sign in with Google" className="hidden sm:flex">
        <LogIn className="h-4 w-4 sm:mr-1" />
        <span className="hidden sm:inline">Sign In</span>
      </Button>
      {/* Mobile Sign In Icon */}
      <Button variant="ghost" size="icon" onClick={signInWithGoogle} aria-label="Sign in with Google" className="sm:hidden">
        <LogIn className="h-5 w-5" />
      </Button>
    </>
  );
}
