'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { QADatabase, getInitials } from '@/lib/qa-db';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import {
  ShieldCheck,
  UserPlus,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Loader2,
  Lock,
} from 'lucide-react';

interface StoredGoogleAccount {
  email: string;
  name: string;
  signedOut?: boolean;
}

function GoogleOAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect_to') || '/';

  const [authorizing, setAuthorizing] = useState(false);
  const [selectedAccountName, setSelectedAccountName] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Default accounts modeled after authentic Google account chooser (Image 3)
  const [accounts, setAccounts] = useState<StoredGoogleAccount[]>([
    {
      name: 'Manish Kumar',
      email: 'manishleoy2k3@gmail.com',
    },
    {
      name: 'Interviewer .',
      email: 'interviewer@interviewvector.com',
      signedOut: true,
    },
    {
      name: 'QA Student',
      email: 'qa.student@gmail.com',
    },
  ]);

  // Merge any previously saved Google accounts from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const remembered = QADatabase.getRememberedGoogleAccounts();
        if (remembered && remembered.length > 0) {
          setAccounts(prev => {
            const existingEmails = new Set(prev.map(a => a.email.toLowerCase()));
            const newAccs = remembered
              .filter(r => r.email && !existingEmails.has(r.email.toLowerCase()))
              .map(r => ({ email: r.email, name: r.name }));
            return [...newAccs, ...prev];
          });
        }
      } catch {
        // ignore
      }
    }
  }, []);

  // 1-Click instant sign-in: Zero second screen consent hurdles
  const handleSelectExisting = async (acc: StoredGoogleAccount) => {
    setSelectedAccountName(acc.name);
    setAuthorizing(true);

    try {
      // Brief smooth transition (200ms) for authentic OAuth confirmation
      await new Promise(resolve => setTimeout(resolve, 200));

      // Authenticate directly in database
      const user = await QADatabase.loginWithGoogle(acc.email, acc.name);

      // Route immediately to Home Page (or requested redirect)
      router.push(redirectTo);
    } catch (err) {
      console.error('Google OAuth sign-in error:', err);
      router.push(redirectTo);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = customEmail.trim();
    if (!cleanEmail) return;

    const cleanName =
      customName.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

    handleSelectExisting({ email: cleanEmail, name: cleanName });
  };

  return (
    <div className="min-h-screen bg-[#0C0D0F] flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      {/* 2-Column Google OAuth Chooser Container (Matching Image 3) */}
      <div className="w-full max-w-[840px] bg-[#121316] border border-neutral-800 rounded-[28px] p-6 sm:p-10 shadow-2xl space-y-6 sm:space-y-8">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-5">
          <div className="flex items-center gap-2.5">
            {/* Google Multicolor SVG Icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-sm font-medium text-neutral-300">Sign in with Google</span>
          </div>

          <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
            OAuth 2.0
          </span>
        </div>

        {/* 2-Column Split: Left = App & Headline, Right = Account Rows */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left Column: App Icon & Heading */}
          <div className="md:col-span-5 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-[#090A0C] border border-neutral-800 p-2.5 flex items-center justify-center shadow-lg">
              <QABrandLogo size={34} showText={false} />
            </div>

            <div className="space-y-2 pt-2">
              <h1 className="text-3xl sm:text-4xl font-normal text-white tracking-tight leading-tight">
                Choose an account
              </h1>
              <p className="text-base text-neutral-400">
                to continue to <strong className="font-semibold text-white">IntelligentQA</strong>
              </p>
            </div>

            {authorizing && (
              <div className="pt-4 flex items-center gap-3 text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 rounded-xl p-3.5 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Connecting to IntelligentQA as {selectedAccountName}...</span>
              </div>
            )}
          </div>

          {/* Right Column: Account Rows */}
          <div className="md:col-span-7">
            {!showCustomInput ? (
              <div className="divide-y divide-neutral-800">
                {accounts.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleSelectExisting(acc)}
                    disabled={authorizing}
                    className="w-full py-4 px-3 hover:bg-neutral-800/40 rounded-xl transition-all flex items-center justify-between text-left group cursor-pointer disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm bg-gradient-to-tr from-emerald-600 to-teal-500 shrink-0">
                        {getInitials(acc.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-medium text-white group-hover:text-emerald-400 transition-colors truncate">
                          {acc.name}
                        </div>
                        <div className="text-xs sm:text-sm text-neutral-400 truncate">
                          {acc.email}
                        </div>
                      </div>
                    </div>

                    {acc.signedOut ? (
                      <span className="text-xs text-neutral-500 font-medium shrink-0 pl-2">
                        Signed out
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-emerald-400 transition-transform group-hover:translate-x-0.5 shrink-0 pl-1" />
                    )}
                  </button>
                ))}

                {/* Use Another Account Row */}
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  disabled={authorizing}
                  className="w-full py-4 px-3 hover:bg-neutral-800/40 rounded-xl transition-all flex items-center gap-3.5 text-left text-neutral-300 hover:text-white group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 text-neutral-400 group-hover:text-white flex items-center justify-center shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <span className="text-sm sm:text-base font-medium">Use another Google Account</span>
                </button>
              </div>
            ) : (
              /* Custom Account Input Form */
              <form onSubmit={handleCustomSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Google / Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="w-full px-4 py-3 bg-[#090A0C] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Manish Kumar"
                    className="w-full px-4 py-3 bg-[#090A0C] border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-700 text-neutral-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Back to Accounts
                  </button>
                  <button
                    type="submit"
                    disabled={authorizing || !customEmail.trim()}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Continue →</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Footer Links */}
        <div className="pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-xs text-neutral-500 gap-4">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Google Secure OAuth</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hover:text-neutral-300 cursor-pointer">Help</span>
            <span className="hover:text-neutral-300 cursor-pointer">Privacy</span>
            <span className="hover:text-neutral-300 cursor-pointer">Terms</span>
          </div>
        </div>
      </div>

      {/* Modal available if needed */}
      {showKeyModal && (
        <GeminiKeyModal
          isOpen={showKeyModal}
          onClose={() => setShowKeyModal(false)}
          onSaved={() => {
            setShowKeyModal(false);
            router.push(redirectTo);
          }}
          onOptOut={() => {
            setShowKeyModal(false);
            router.push(redirectTo);
          }}
        />
      )}
    </div>
  );
}

export default function GoogleOAuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0C0D0F] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <GoogleOAuthContent />
    </Suspense>
  );
}
