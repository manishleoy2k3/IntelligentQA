'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QADatabase } from '@/lib/qa-db';
import {
  Menu,
  ShieldCheck,
  Eye,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AdminTopNavProps {
  onToggleMobileSidebar: () => void;
  onPreviewStudent?: () => void;
}

const SECTION_TITLES: Record<string, string> = {
  overview: 'Administration Dashboard',
  course: 'Course & Curriculum Management',
  labs: 'Practice Labs & Sandbox Editor',
  agents: 'AI Tools & QA Agents Suite',
  interviews: 'Interview Banks & Scenario Editor',
  team: 'Access Control & Administrator Team',
};

export default function AdminTopNav({
  onToggleMobileSidebar,
  onPreviewStudent,
}: AdminTopNavProps) {
  const searchParams = useSearchParams();
  const currentSection = searchParams?.get('section') || 'overview';
  const sectionTitle = SECTION_TITLES[currentSection] || 'Administration Dashboard';

  const currentUser = typeof window !== 'undefined' ? QADatabase.getCurrentUser() : null;

  const handleLogout = () => {
    QADatabase.logout();
    window.location.href = '/login';
  };

  return (
    <header className="w-full h-16 bg-[#141414]/95 backdrop-blur-md border-b border-[#262626] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 font-sans">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Admin Mode</span>
          </span>
          <span className="text-zinc-600 hidden sm:inline">•</span>
          <h1 className="text-sm font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">
            {sectionTitle}
          </h1>
        </div>
      </div>

      {/* Right Corner: Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Preview as Student Button */}
        <Link
          href="/dashboard"
          onClick={onPreviewStudent}
          className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1C1C1C] hover:bg-[#262626] text-zinc-300 hover:text-white border border-[#2F2F2F] transition-all cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span>Student View</span>
        </Link>

        {/* Admin Badge */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#1C1C1C] border border-[#2F2F2F] text-xs">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-400 text-[11px]">Logged in:</span>
          <span className="font-semibold text-white truncate max-w-[130px]">
            {currentUser?.email || 'admin@intelligentqa.io'}
          </span>
        </div>

        {/* Log Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 rounded-full text-zinc-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
          title="Sign Out"
          aria-label="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
