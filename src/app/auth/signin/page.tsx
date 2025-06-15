import { Suspense } from 'react';
import SignInClient from './SignInClient';

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading sign-in page...</div>}>
      <SignInClient />
    </Suspense>
  );
}
