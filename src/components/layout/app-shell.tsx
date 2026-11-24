'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QADatabase } from '@/lib/qa-db';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import TopNav from '@/components/layout/top-nav';
import Footer from '@/components/layout/footer';
import AdminSidebar from '@/components/layout/admin-sidebar';
import AdminTopNav from '@/components/layout/admin-top-nav';
import { ShieldCheck, ArrowRight, Eye } from 'lucide-react';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [previewStudent, setPreviewStudent] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const syncUser = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setIsAdmin(QADatabase.isAdmin(u));
      };
      syncUser();

      // Proactively sync latest curriculum modifications from database so all users see changes
      QADatabase.syncCurriculumFromDatabase();

      window.addEventListener('intelligentqa_auth_changed', syncUser);
      window.addEventListener('intelligentqa_role_changed', syncUser);
      return () => {
        window.removeEventListener('intelligentqa_auth_changed', syncUser);
        window.removeEventListener('intelligentqa_role_changed', syncUser);
      };
    }
  }, []);

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const isAuthRoute =
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/auth');

  const isAcademyRoute = pathname?.startsWith('/learning');

  // =========================================================================
  // GUEST EXPLORING ACADEMY / GUIDES: Render single unified sidebar layout
  // =========================================================================
  const isGuestExploringAcademy = !currentUser && (isAcademyRoute || pathname?.startsWith('/guides'));
  if (isGuestExploringAcademy && !isAuthRoute) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] transition-colors duration-150">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50 dark:bg-[#111111]">
          <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
          <div className="md:hidden">
            <Header onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
          </div>
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // ADMIN USER EXPERIENCE: Dedicated Admin Shell & Screens
  // Admin does NOT share the same standard user screens unless explicitly previewing
  // =========================================================================
  if (currentUser && isAdmin && !isAuthRoute) {
    const isOnAdminRoute = pathname?.startsWith('/admin');

    // If admin explicitly clicked "Preview Student Portal" and is on a user route
    if (previewStudent && !isOnAdminRoute) {
      return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] transition-colors duration-150">
          {/* Sticky Admin Preview Banner */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 border-b border-purple-500/40 px-4 py-2 text-xs font-semibold flex items-center justify-between text-white z-50 sticky top-0 shadow-lg">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-300" />
              <span>Admin Preview Mode — Viewing Student Portal Experience</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                onClick={() => setPreviewStudent(false)}
                className="px-3 py-1 rounded-full bg-purple-500 hover:bg-purple-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all shadow"
              >
                <span>Return to Admin Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex-1 flex">
            {/* Student Sidebar for preview */}
            <Sidebar
              mobileOpen={mobileSidebarOpen}
              onCloseMobile={() => setMobileSidebarOpen(false)}
            />

            <div className="flex-1 min-w-0 flex flex-col min-h-[calc(100vh-40px)] bg-slate-50 dark:bg-[#111111]">
              <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
              <main className="flex-1 flex flex-col">{children}</main>
            </div>
          </div>
        </div>
      );
    }

    // Default for Admin: Pure Admin Shell with Admin Navigation
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] transition-colors duration-150">
        {/* Dedicated Admin Sidebar */}
        <AdminSidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onPreviewStudent={() => setPreviewStudent(true)}
        />

        {/* Main Admin Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50 dark:bg-[#111111]">
          <AdminTopNav
            onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)}
            onPreviewStudent={() => setPreviewStudent(true)}
          />
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </div>
    );
  }

  // =========================================================================
  // NORMAL STUDENT USER EXPERIENCE: Standard Learning Shell
  // =========================================================================
  if (currentUser && !isAuthRoute) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] transition-colors duration-150">
        {/* Side Left Navigation */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-slate-50 dark:bg-[#111111]">
          {/* Top Right Navigation: Ask AI, Notifications, and Profiles */}
          <TopNav onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
          <div className="md:hidden">
            <Header onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
          </div>
          <main className="flex-1 flex flex-col">{children}</main>
        </div>
      </div>
    );
  }

  // Guest / Public / Auth Route: Full-width layout
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#111111] text-slate-900 dark:text-[#FFFFFF] transition-colors duration-150">
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}
