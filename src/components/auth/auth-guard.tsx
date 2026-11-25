'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import QABrandLogo from '@/components/ui/qa-brand-logo';

interface AuthGuardProps {
  children: React.ReactNode;
  featureName?: string;
  description?: string;
}

export default function AuthGuard({
  children,
  featureName = 'this Feature',
  description = 'Create a 100% free account to access hands-on interactive labs, code executors, and SDET tools.',
}: AuthGuardProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser(QADatabase.getCurrentUser());
      setIsReady(true);

      const handleAuth = () => setCurrentUser(QADatabase.getCurrentUser());
      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      };
    }
  }, []);

  if (!isReady) {
    return null; // Avoid hydration flash
  }

  // If user is authenticated, render children smoothly
  if (currentUser) {
    return <>{children}</>;
  }

  // If guest, show clean, executive professional gate
  return (
    <div className="w-full min-h-[80vh] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Free Forever · No Credit Card Required</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign In to Access {featureName}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Google Sign In */}
        <div className="space-y-3 pt-2">
          <GoogleSignInButton
            buttonText="Continue with Google"
            redirectTo={typeof window !== 'undefined' ? window.location.pathname : '/dashboard'}
          />

          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
            <span className="text-[11px] font-semibold text-slate-400 uppercase">
              Or sign in with email
            </span>
            <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/signup"
              className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              Sign Up Free
            </Link>
            <Link
              href="/login"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <LogIn className="w-4 h-4" />
              Log In
            </Link>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
          All courses, practice sandboxes, and interview question banks unlock instantly upon
          sign-in.
        </div>
      </div>
    </div>
  );
}
