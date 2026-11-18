'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { QABrandLogo } from '@/components/ui/qa-brand-logo';
import { QADatabase } from '@/lib/qa-db';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Bot,
  HelpCircle,
  Users,
  LogOut,
  Eye,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onPreviewStudent?: () => void;
}

export default function AdminSidebar({
  mobileOpen = false,
  onCloseMobile,
  onPreviewStudent,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'overview';

  const currentUser = typeof window !== 'undefined' ? QADatabase.getCurrentUser() : null;

  const navItems = [
    {
      id: 'overview',
      name: 'Admin Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      badge: 'Command Center',
      color: 'text-indigo-400',
    },
    {
      id: 'course',
      name: 'Course',
      href: '/admin?section=course',
      icon: BookOpen,
      badge: 'Tracks & Docs',
      color: 'text-emerald-400',
    },
    {
      id: 'labs',
      name: 'Practice Labs',
      href: '/admin?section=labs',
      icon: Terminal,
      badge: 'Coding & Sandboxes',
      color: 'text-sky-400',
    },
    {
      id: 'agents',
      name: 'AI Tools and Agents',
      href: '/admin?section=agents',
      icon: Bot,
      badge: 'Prompts & Agents',
      color: 'text-purple-400',
    },
    {
      id: 'interviews',
      name: 'Interview Banks',
      href: '/admin?section=interviews',
      icon: HelpCircle,
      badge: '500+ Scenarios',
      color: 'text-amber-400',
    },
    {
      id: 'team',
      name: 'Team & RBAC',
      href: '/admin?section=team',
      icon: Users,
      badge: 'Access Control',
      color: 'text-rose-400',
    },
  ];

  const handleLogout = () => {
    QADatabase.logout();
    window.location.href = '/login';
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#141414] border-r border-[#262626] text-white select-none font-sans">
      {/* Brand & Portal Header */}
      <div className="p-5 border-b border-[#262626] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">IntelligentQA</span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-[#A1A1AA]">Content &amp; Platform Console</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#222222]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Admin Profile Pill */}
      <div className="p-3 mx-4 my-3 bg-[#1A1A1A] border border-[#2B2B2B] rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0">
            A
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              {currentUser?.displayName || 'Administrator'}
            </p>
            <p className="text-[10px] text-purple-300/80 truncate">
              {currentUser?.email || 'admin@intelligentqa.io'}
            </p>
          </div>
        </div>
        <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
          ONLINE
        </span>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
          Management Sections
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === '/admin'
              ? (item.id === 'overview' && (!searchParams.get('section') || currentSection === 'overview')) ||
                currentSection === item.id
              : false;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onCloseMobile}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-purple-600/20 text-white font-bold border border-purple-500/40 shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : item.color}`} />
                <span className="truncate">{item.name}</span>
              </div>
              <span
                className={`text-[9px] font-mono font-medium px-2 py-0.5 rounded ${
                  isActive
                    ? 'bg-purple-500/30 text-purple-200'
                    : 'bg-[#222222] text-[#888888] group-hover:text-white'
                }`}
              >
                {item.badge}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Footer / Student Preview & Logout */}
      <div className="p-4 border-t border-[#262626] space-y-2">
        <Link
          href="/dashboard"
          onClick={() => {
            if (onPreviewStudent) onPreviewStudent();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#1A1A1A] hover:bg-[#222222] border border-[#2A2A2A] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Preview Student Portal</span>
          </div>
          <ExternalLink className="w-3 h-3 text-[#71717A]" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin &amp; Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
