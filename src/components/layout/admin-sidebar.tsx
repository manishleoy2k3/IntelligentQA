'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Terminal,
  Bot,
  HelpCircle,
  Users,
  ShieldCheck,
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
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'overview';

  const navItems = [
    {
      id: 'overview',
      name: 'Admin Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'text-indigo-400',
    },
    {
      id: 'cms',
      name: 'CMS & Publishing',
      href: '/admin/cms',
      icon: BookOpen,
      color: 'text-purple-400',
    },
    {
      id: 'course',
      name: 'Course',
      href: '/admin?section=course',
      icon: BookOpen,
      color: 'text-emerald-400',
    },
    {
      id: 'labs',
      name: 'Practice Labs',
      href: '/admin?section=labs',
      icon: Terminal,
      color: 'text-sky-400',
    },
    {
      id: 'agents',
      name: 'AI Tools and Agents',
      href: '/admin?section=agents',
      icon: Bot,
      color: 'text-purple-400',
    },
    {
      id: 'interviews',
      name: 'Interview Banks',
      href: '/admin?section=interviews',
      icon: HelpCircle,
      color: 'text-amber-400',
    },
    {
      id: 'team',
      name: 'Team & RBAC',
      href: '/admin?section=team',
      icon: Users,
      color: 'text-rose-400',
    },
  ];

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

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
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
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-purple-600/20 text-white font-bold border border-purple-500/40 shadow-sm'
                  : 'text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : item.color}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
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
