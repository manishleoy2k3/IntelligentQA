"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QADatabase, getInitials } from "@/lib/qa-db";
import ProfileModal from "@/components/profile/profile-modal";
import { UserProfile } from "@/types/qa";
import {
  Sparkles,
  Bell,
  Menu,
  ChevronDown,
  UserCheck,
  LogOut,
  Clock,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Lock,
  X,
} from "lucide-react";

interface TopNavProps {
  onToggleMobileSidebar?: () => void;
}

export default function TopNav({ onToggleMobileSidebar }: TopNavProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAdminUnlockModal, setShowAdminUnlockModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState("");
  const [adminUnlockStatus, setAdminUnlockStatus] = useState<{
    error?: string;
    success?: string;
  } | null>(null);
  const [portalMode, setPortalMode] = useState<"sdet" | "kids">("sdet");

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = QADatabase.getCurrentUser();
      setCurrentUser(user);
      setIsAdmin(QADatabase.isAdmin(user));
      setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(user?.id)));

      if (pathname?.startsWith("/kids")) {
        setPortalMode("kids");
      } else {
        setPortalMode(QADatabase.getPortalMode());
      }

      const handleAuth = () => {
        const u = QADatabase.getCurrentUser();
        setCurrentUser(u);
        setIsAdmin(QADatabase.isAdmin(u));
        setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(u?.id)));
      };
      const handleKey = () => {
        const u = QADatabase.getCurrentUser();
        setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(u?.id)));
      };
      const handlePortal = (e: any) => {
        if (e.detail?.mode) setPortalMode(e.detail.mode);
        else setPortalMode(QADatabase.getPortalMode());
      };

      window.addEventListener("intelligentqa_auth_changed", handleAuth);
      window.addEventListener("intelligentqa_role_changed", handleAuth);
      window.addEventListener("intelligentqa_key_changed", handleKey);
      window.addEventListener("intelligentqa_portal_changed", handlePortal);
      return () => {
        window.removeEventListener("intelligentqa_auth_changed", handleAuth);
        window.removeEventListener("intelligentqa_role_changed", handleAuth);
        window.removeEventListener("intelligentqa_key_changed", handleKey);
        window.removeEventListener(
          "intelligentqa_portal_changed",
          handlePortal,
        );
      };
    }
  }, [pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenAskAI = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("intelligentqa_open_ask_ai"));
    }
  };

  const handleLogout = () => {
    QADatabase.logout();
    window.location.href = "/login";
  };

  const notifications = [
    {
      id: 1,
      title: "Playwright v1.42 Lab Updated",
      desc: "Shadow DOM and dynamic locator sandboxes now live.",
      time: "10m ago",
      unread: true,
    },
    {
      id: 2,
      title: "3-Day Study Streak Active",
      desc: "Keep practicing to earn your SDET Architecture certificate.",
      time: "2h ago",
      unread: true,
    },
    {
      id: 3,
      title: "New Interview Question Bank",
      desc: "Added 25 Lead SDET system design scenarios.",
      time: "1d ago",
      unread: false,
    },
  ];

  return (
    <header className="w-full h-14 bg-white/95 dark:bg-[#0B0D11]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 font-sans">
      {/* Left: Mobile Sidebar Toggle & Active Portal Pill */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {portalMode === "kids" ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Coding Tutorial</span>
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>SDET Career Portal</span>
          </span>
        )}
      </div>

      {/* Right Corner: "Ask SDET AI", Notifications and Profiles */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        {/* 1. "Ask AI" Button (formerly "Ask SDET AI") */}
        <button
          type="button"
          onClick={handleOpenAskAI}
          aria-label="Ask SDET AI"
          className="flex items-center gap-2 sm:gap-2.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 hover:opacity-95 text-white font-bold rounded-full shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer select-none text-xs sm:text-sm"
          title="Ask AI: Coding queries, algorithms, syntax, and programming help (Ask SDET AI)"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
          <span className="font-bold tracking-tight">Ask AI</span>
          <span className="sr-only">Ask SDET AI</span>
        </button>

        {/* 2. Notifications Bell & Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0B0D11]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-3 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800 px-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notifications
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  2 New
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-neutral-800/80 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-0.5">
                      {n.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Profiles Dropdown Container */}
        {currentUser && (
          <div
            ref={profileRef}
            id="user-profile-menu-container"
            className="relative"
          >
            <button
              type="button"
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full text-xs font-semibold hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-800 dark:text-white transition-all cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-neutral-700"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {getInitials(currentUser.displayName)}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate text-xs font-bold text-slate-900 dark:text-white">
                {currentUser.displayName?.split(" ")[0] || "Profile"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-3 space-y-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Card */}
                <div className="p-3 bg-slate-50 dark:bg-neutral-800/60 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {currentUser.displayName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdmin
                            ? "bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {isAdmin
                          ? "ADMIN"
                          : currentUser.targetRole || "STUDENT"}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                    {currentUser.email}
                  </div>

                  {/* Protected Access Level */}
                  <div className="pt-1.5 border-t border-slate-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Access Level:
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isAdmin
                          ? "bg-purple-500/20 text-purple-600 dark:text-purple-300"
                          : "bg-slate-200/60 dark:bg-neutral-700/60 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {isAdmin ? "System Administrator" : "Standard Student"}
                    </span>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="space-y-1 text-xs">
                  {/* Dedicated Admin CMS Link (Admin Only) */}
                  {isAdmin ? (
                    <Link
                      href="/admin/cms"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full px-3 py-2 text-left rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-between transition-colors border border-purple-500/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-500 shrink-0" />
                        <span>Course CMS & Approvals</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-600 dark:text-purple-300">
                        Admin
                      </span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setAdminPasscode("");
                        setAdminUnlockStatus(null);
                        setShowAdminUnlockModal(true);
                      }}
                      className="w-full px-3 py-1.5 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-500 hover:text-slate-700 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-2 transition-colors cursor-pointer text-[11px]"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Admin Access Gateway</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Complete / Edit QA Profile</span>
                  </button>

                  <Link
                    href={
                      pathname?.startsWith("/kids") ? "/kids" : "/dashboard"
                    }
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      {pathname?.startsWith("/kids")
                        ? "Coding Tutorial Hub"
                        : "Learning Dashboard"}
                    </span>
                  </Link>
                </div>

                {/* Log Out */}
                <div className="pt-2 border-t border-slate-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2.5 transition-colors cursor-pointer text-xs"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Embedded Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onSaved={(updated: UserProfile) => setCurrentUser(updated)}
        />
      )}

      {/* Admin Security Gateway Modal */}
      {showAdminUnlockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowAdminUnlockModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Admin Access Gateway
                </h3>
                <p className="text-xs text-slate-400">
                  Restricted system administration portal
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Standard students have restricted access. Enter the platform
              master security passcode to verify administrator credentials for{" "}
              <span className="font-mono text-purple-400">
                {currentUser?.email}
              </span>
              .
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const res = QADatabase.verifyAndElevateAdmin(
                  adminPasscode,
                  currentUser,
                );
                if (res.success) {
                  setAdminUnlockStatus({ success: res.message });
                  setTimeout(() => {
                    setShowAdminUnlockModal(false);
                    window.location.href = "/admin/cms";
                  }, 800);
                } else {
                  setAdminUnlockStatus({ error: res.message });
                }
              }}
              className="space-y-3 pt-2"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin Master Passcode
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter security key..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  autoFocus
                />
              </div>

              {adminUnlockStatus?.error && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{adminUnlockStatus.error}</span>
                </div>
              )}

              {adminUnlockStatus?.success && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminUnlockStatus.success}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminUnlockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!adminPasscode.trim()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
