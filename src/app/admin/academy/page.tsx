'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowLeft, BookOpen, GraduationCap, ExternalLink } from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { UserProfile } from '@/types/qa';
import AcademyAdminConsole from '@/components/admin/academy/academy-admin-console';

export default function AdminAcademyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [gatePasscode, setGatePasscode] = useState<string>('');
  const [gateError, setGateError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      setCurrentUser(u);
      setIsAdmin(QADatabase.isAdmin(u));

      const syncHandler = () => {
        const updatedUser = QADatabase.getCurrentUser();
        setCurrentUser(updatedUser);
        setIsAdmin(QADatabase.isAdmin(updatedUser));
      };

      window.addEventListener('intelligentqa_auth_changed', syncHandler);
      window.addEventListener('intelligentqa_role_changed', syncHandler);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', syncHandler);
        window.removeEventListener('intelligentqa_role_changed', syncHandler);
      };
    }
  }, []);

  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setGateError(null);
    const res = QADatabase.verifyAndElevateAdmin(gatePasscode, currentUser);
    if (res.success) {
      setIsAdmin(true);
    } else {
      setGateError(res.message);
    }
  };

  // If not admin, show secure authorization barrier
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center p-4 text-white font-sans">
        <div className="w-full max-w-md p-8 rounded-3xl bg-[#161616] border border-[#262626] shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
              RESTRICTED CONSOLE
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight mt-2">
              Learning Academy Administrator Gate
            </h1>
            <p className="text-xs text-zinc-400">
              Only authorized SDET instructors and system administrators can manage curriculum,
              upload documents, and publish lessons.
            </p>
          </div>

          <form onSubmit={handleVerifyPasscode} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Admin Gate Passcode
              </label>
              <input
                type="password"
                value={gatePasscode}
                onChange={(e) => setGatePasscode(e.target.value)}
                placeholder="Enter admin passcode (e.g. SDET_ADMIN_2026)"
                className="w-full px-4 py-2.5 rounded-xl bg-[#202020] border border-[#333] text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-purple-500"
                required
              />
              {gateError && (
                <p className="text-[11px] text-red-400 mt-1 font-semibold">{gateError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg transition-colors cursor-pointer"
            >
              Verify Passcode &amp; Unlock Console
            </button>
          </form>

          <div className="pt-2 border-t border-[#222]">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] hover:bg-[#222] text-zinc-300 hover:text-white text-xs font-medium border border-[#2D2D2D] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Dashboard</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-emerald-400">Academy CMS</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/learning"
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Learner Academy</span>
            </Link>
          </div>
        </div>

        {/* Learning Academy Console */}
        <AcademyAdminConsole />
      </div>
    </div>
  );
}
