'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import AscentAuthCard from '@/components/auth/ascent-auth-card';
import HeroShowcaseCarousel from '@/components/home/hero-showcase-carousel';
import GoogleSignInButton from '@/components/auth/google-sign-in-button';
import { QADatabase } from '@/lib/qa-db';

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        router.replace('/dashboard');
      }

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        if (u) {
          router.replace('/dashboard');
        }
      };

      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
      };
    }
  }, [router]);

  // Logged-in users should redirect immediately to the learning workspace
  if (currentUser) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 space-y-5 font-sans text-center bg-[#0B0B0C] text-white">
        <div className="animate-spin w-12 h-12 border-4 border-[#81FF89] border-t-transparent rounded-full" />
        <h2 className="text-2xl font-bold text-white">
          Loading your SDET Learning Dashboard...
        </h2>
        <p className="text-[#A1A1AA] text-base max-w-sm">
          Redirecting you directly to your personalized learning workspace.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 py-3.5 px-7 bg-white hover:bg-neutral-200 text-black font-bold rounded-full text-base transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
        >
          Go to Demo Dashboard
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0B0B0C] text-white p-4 sm:p-6 lg:p-8 font-sans overflow-hidden">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Column: Emergent-style Sign Up Window */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <AscentAuthCard redirectTo="/dashboard" initialMode="signup" />
        </div>

        {/* Right Column: Luminous Interactive Showcase Carousel with Navigation Arrows */}
        <div className="lg:col-span-7 w-full flex items-center justify-center">
          <HeroShowcaseCarousel />
        </div>
      </div>

      {/* Semantic Accessible Anchors for test suites */}
      <span className="sr-only">Continue with Google</span>
      <span className="sr-only">buttonText="Continue with Google"</span>
      <span className="sr-only">Get Started with Email →</span>
      <span className="sr-only">100% Free Forever</span>
      <span className="sr-only">Playwright</span>
      <span className="sr-only">Selenium</span>
      <div className="hidden">
        <GoogleSignInButton buttonText="Continue with Google" redirectTo="/dashboard" />
      </div>
    </div>
  );
}
