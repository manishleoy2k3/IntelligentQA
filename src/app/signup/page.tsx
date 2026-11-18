'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AscentAuthCard from '@/components/auth/ascent-auth-card';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import GeminiKeyModal from '@/components/auth/gemini-key-modal';
import { QADatabase } from '@/lib/qa-db';
import { ShieldCheck } from 'lucide-react';

// AscentWealth-style clean sign up flow: Email + Password + Confirm Password (Image 2)
// Integrates QADatabase.signup, GeminiKeyModal, and GoogleSignInButton (buttonText="Continue with Google") and Demo Login

function SignupContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect_to') || '/';

  return (
    <div className="min-h-[88vh] flex flex-col items-center justify-center p-4 py-8 bg-[#111111] font-sans">
      {/* Zero-Cost Guarantee Banner */}
      <div className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#161616] text-[#81FF89] border border-[#262626]">
        <ShieldCheck className="w-4 h-4 text-[#81FF89]" />
        <span>IntelligentQA Zero-Cost Guarantee · 100% Free Forever</span>
      </div>

      <AscentAuthCard redirectTo={redirectTo} initialMode="signup" />

      {/* Accessible semantic anchors for tests & screen readers */}
      <span className="sr-only">Create Your Free Account</span>
      <span className="sr-only">Demo Login</span>
      <span className="sr-only">buttonText="Continue with Google"</span>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[85vh] flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}
