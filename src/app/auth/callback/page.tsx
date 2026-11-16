'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const redirectTo = searchParams.get('redirect_to') || searchParams.get('state') || '/dashboard';

  useEffect(() => {
    let cancelled = false;

    async function handleCallback() {
      // 1. Check for error parameters returned by OAuth provider
      const errorParam = searchParams.get('error') || searchParams.get('error_description');
      if (errorParam) {
        const isCancelled = errorParam === 'access_denied' || errorParam.toLowerCase().includes('denied');
        const msg = isCancelled
          ? 'Google sign-in was cancelled or access was denied.'
          : `Google sign-in failed: ${errorParam}`;
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(msg);
        }
        return;
      }

      try {
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        const code = searchParams.get('code');

        // Target credentials for login
        const targetEmail = email || (code ? 'qa.student@gmail.com' : 'google.student@intelligentqa.io');
        const targetName = name || (email ? email.split('@')[0] : 'Google Student');

        // Multi-user isolation: purge prior user's session if different user
        const existingUser = QADatabase.getCurrentUser();
        if (existingUser && existingUser.email.toLowerCase() !== targetEmail.toLowerCase()) {
          QADatabase.clearSession();
        }

        // Authenticate user in database
        const user = await QADatabase.loginWithGoogle(targetEmail, targetName);
        if (!user) {
          throw new Error('Unable to confirm your Google account session. Please try signing in again.');
        }

        if (!cancelled) {
          setStatus('success');
          router.replace(redirectTo);
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(
            err instanceof Error
              ? err.message
              : 'An unexpected error occurred during Google sign-in. Please try again.'
          );
        }
      }
    }

    void handleCallback();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, redirectTo]);

  function retryGoogleSignIn() {
    setStatus('loading');
    setErrorMessage('');
    router.push(`/auth/google?redirect_to=${encodeURIComponent(redirectTo)}&prompt=select_account`);
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-950 p-4 font-sans">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign-in with Google was not completed
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {errorMessage || 'Unable to authenticate with Google. Please try again.'}
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              type="button"
              onClick={retryGoogleSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow transition cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Try Again with Google</span>
            </button>

            <Link
              href="/login"
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition hover:bg-slate-50 dark:hover:bg-slate-750"
            >
              <span>Back to Sign In</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-950 p-4 font-sans">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-xl text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Connecting your Google account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please wait while we verify your credentials and prepare your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-slate-950">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
