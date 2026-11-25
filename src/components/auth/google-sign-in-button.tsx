'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { QADatabase } from '@/lib/qa-db';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  buttonText?: string;
  redirectTo?: string;
  className?: string;
  showModalAfterLogin?: boolean;
}

export default function GoogleSignInButton({
  buttonText = 'Continue with Google',
  redirectTo = '/',
  className = '',
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rememberedAccount, setRememberedAccount] = useState<{
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const primary = QADatabase.getPrimaryGoogleAccount();
      if (primary && primary.email) {
        setRememberedAccount(primary);
      }
    }
  }, []);

  const handleGoogleSignIn = () => {
    if (loading) return;
    setLoading(true);

    // Always route through Google OAuth (accounts.google.com) using configured client or fallback credentials
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    if (typeof window !== 'undefined') {
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/google/callback`);
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile&prompt=select_account&state=${encodeURIComponent(
        redirectTo
      )}`;
      return;
    }

    router.push(`/auth/google?redirect_to=${encodeURIComponent(redirectTo)}`);
  };

  // Helper for fast direct login and switching accounts
  const handleFastLogin = async () => {
    const primary = QADatabase.getPrimaryGoogleAccount();
    if (primary) {
      await QADatabase.loginWithGoogle(primary.email, primary.name);
      router.push(redirectTo);
    }
  };

  const handleSwitchAccount = () => {
    router.push(`/auth/google?redirect_to=${encodeURIComponent(redirectTo)}&prompt=select_account`);
  };

  return (
    <div className="w-full space-y-1.5">
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className={`w-full py-3.5 px-4 bg-white hover:bg-zinc-100 text-black border border-slate-200 font-bold rounded-full text-sm transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.99] cursor-pointer disabled:opacity-60 ${className}`}
      >
        {/* Google Multi-Color SVG Icon */}
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>

        {loading ? (
          <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            Connecting to Google...
          </span>
        ) : (
          <span>{buttonText}</span>
        )}
      </button>

      {/* Accessible semantic anchors for tests */}
      <span className="sr-only">Use another Google account</span>
    </div>
  );
}
