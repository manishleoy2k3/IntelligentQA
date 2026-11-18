'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QADatabase } from '@/lib/qa-db';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import TopNav from '@/components/layout/top-nav';
import Footer from '@/components/layout/footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUser(QADatabase.getCurrentUser());
      const handleAuth = () => setCurrentUser(QADatabase.getCurrentUser());
      window.addEventListener('intelligentqa_auth_changed', handleAuth);
      return () => window.removeEventListener('intelligentqa_auth_changed', handleAuth);
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

  // When user is logged in (and not on auth cards):
  // Render the Side Left Navigation + Main Content Area
  if (currentUser && !isAuthRoute) {
    return (
      <div className="min-h-screen flex bg-[#111111] text-[#FFFFFF]">
        {/* Side Left Navigation */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#111111]">
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
    <div className="min-h-screen flex flex-col bg-[#111111] text-[#FFFFFF]">
      <Header onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
      <main className="flex-1 flex flex-col">{children}</main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}
