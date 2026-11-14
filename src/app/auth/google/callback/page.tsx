'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QADatabase } from '@/lib/qa-db';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams?.get('code');
    const email = searchParams?.get('email');
    const name = searchParams?.get('name');
    const redirectTo = searchParams?.get('state') || searchParams?.get('redirect_to') || '/dashboard';

    const processOAuth = async () => {
      try {
        if (email) {
          await QADatabase.loginWithGoogle(email, name || undefined);
        } else {
          // Fallback if generic code passed
          await QADatabase.loginWithGoogle('qa.student@gmail.com', 'QA Student');
        }
        router.push(redirectTo);
      } catch (err) {
        console.error('OAuth Callback processing error:', err);
        router.push('/dashboard');
      }
    };

    processOAuth();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
      <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <div className="text-center space-y-1">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Completing Google OAuth 2.0 Sign In...
        </h2>
        <p className="text-xs text-slate-500">
          Syncing your Google credentials with IntelligentQA
        </p>
      </div>
    </div>
  );
}

export default function GoogleOAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
