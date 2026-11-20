'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QADatabase, getInitials } from '@/lib/qa-db';
import { UserProfile } from '@/types/qa';
import ProfileModal from '@/components/profile/profile-modal';
import {
  Menu,
  ShieldCheck,
  Eye,
  LogOut,
  ChevronDown,
  UserCheck,
  Layers,
  Settings,
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

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const u = QADatabase.getCurrentUser();
      setCurrentUser(u);

      const handleAuth = () => {
        const updated = QADatabase.getCurrentUser();
        setCurrentUser(updated);
      };

      const handleOpenProfileModal = () => setShowProfileModal(true);

      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      window.addEventListener('intelligentqa_role_changed', handleAuth);
      window.addEventListener('intelligentqa_open_profile_modal', handleOpenProfileModal);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', handleAuth);
        window.removeEventListener('intelligentqa_role_changed', handleAuth);
        window.removeEventListener('intelligentqa_open_profile_modal', handleOpenProfileModal);
      };
    }
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Right Corner: Preview Student Portal & Profile Details */}
      <div className="flex items-center gap-3">
        {/* Preview Student Portal */}
        <Link
          href="/dashboard"
          onClick={onPreviewStudent}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1C1C1C] hover:bg-[#262626] text-zinc-300 hover:text-white border border-[#2F2F2F] transition-all cursor-pointer shadow-sm"
        >
          <Eye className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Preview Student Portal</span>
          <span className="sm:hidden">Student</span>
        </Link>

        {/* Profile Details Container matching normal user topnav */}
        <div ref={profileRef} id="admin-profile-menu-container" className="relative">
          <button
            type="button"
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-xs font-semibold bg-[#161616] hover:bg-[#1E1E1E] text-white transition-all cursor-pointer border border-[#262626]"
            aria-label="Admin profile menu"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
              {getInitials(currentUser?.displayName || 'Admin')}
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate text-xs font-bold text-white">
              {currentUser?.displayName?.split(' ')[0] || 'Admin'}
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ADMIN
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#161616] border border-[#262626] rounded-[24px] shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Identity Card */}
              <div className="p-3.5 bg-[#1F1F1F] rounded-[18px] border border-[#262626] space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs truncate">
                    {currentUser?.displayName || 'Administrator'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    ADMIN
                  </span>
                </div>
                <div className="text-xs text-[#A1A1AA] truncate">
                  {currentUser?.email || 'admin@intelligentqa.io'}
                </div>

                <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                  <span className="text-[11px] text-[#A1A1AA]">Access Level:</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                    System Administrator
                  </span>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="space-y-1 text-xs">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    if (onPreviewStudent) onPreviewStudent();
                  }}
                  className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-[#222222] text-[#D4D4D8] hover:text-white font-medium flex items-center gap-2.5 transition-colors"
                >
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Preview Student Portal</span>
                </Link>

                <Link
                  href="/admin"
                  onClick={() => setProfileMenuOpen(false)}
                  className="w-full px-3.5 py-2.5 text-left rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold flex items-center justify-between transition-colors border border-purple-500/30"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Admin Dashboard</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
                    Active
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    setShowProfileModal(true);
                  }}
                  className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-[#222222] text-[#D4D4D8] hover:text-white font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-[#81FF89] shrink-0" />
                  <span>Complete / Edit QA Profile</span>
                </button>
              </div>

              {/* Log Out */}
              <div className="pt-2 border-t border-[#262626]">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2 text-left rounded-xl hover:bg-rose-950/40 text-rose-400 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-xs"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSaved={(updated: UserProfile) => setCurrentUser(updated)}
        />
      )}
    </header>
  );
}
