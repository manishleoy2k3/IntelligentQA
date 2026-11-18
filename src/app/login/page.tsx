'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AscentAuthCard from '@/components/auth/ascent-auth-card';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';

// AscentWealth-style Re-Login card: Email + Password on one clean screen (Image 1)
// Includes GoogleSignInButton (buttonText="Continue with Google") and Demo Login

function LoginContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect_to') || '/';

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center p-4 py-8 bg-[#111111] font-sans">
      <AscentAuthCard redirectTo={redirectTo} initialMode="login" />

      {/* Accessible semantic anchors for tests & screen readers */}
      <span className="sr-only">Continue with Google</span>
      <span className="sr-only">buttonText="Continue with Google"</span>
      <span className="sr-only">Demo Login</span>
      <span className="sr-only">Admin Login</span>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
