"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QADatabase, getInitials } from "@/lib/qa-db";
import ProfileModal from "@/components/profile/profile-modal";
import GeminiKeyModal from "@/components/auth/gemini-key-modal";
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
  Key,
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
  const [showKeyModal, setShowKeyModal] = useState(false);
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
    <header className="w-full h-16 bg-[#141414]/95 backdrop-blur-md border-b border-[#262626] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20 font-sans">
      {/* Left: Mobile Sidebar Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] transition-colors cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right Corner: Action Controls, Notifications and Profiles */}
      <div className="flex items-center gap-2 sm:gap-3.5 ml-auto">
        {/* Gemini API Key Button */}
        <button
          type="button"
          onClick={() => setShowKeyModal(true)}
          className={`flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full font-bold text-xs sm:text-sm transition-all border shadow-sm cursor-pointer active:scale-95 select-none ${
            hasGeminiKey
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
              : "bg-[#1E1E1E] hover:bg-[#282828] text-amber-400 border-amber-500/30"
          }`}
          title="Gemini API Key: Configure your free Google AI Studio key"
        >
          <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{hasGeminiKey ? "Gemini Key: Active" : "Add Gemini Key"}</span>
        </button>

        {/* 1. "Ask AI" Button (formerly "Ask SDET AI") */}
        <button
          type="button"
          onClick={handleOpenAskAI}
          aria-label="Ask SDET AI"
          className="flex items-center gap-2 sm:gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 hover:opacity-95 text-white font-extrabold rounded-full shadow-[0_0_20px_rgba(129,255,137,0.35)] transition-all hover:scale-[1.02] active:scale-95 cursor-pointer select-none text-xs sm:text-sm"
          title="Ask AI: Coding queries, algorithms, syntax, and programming help (Ask SDET AI)"
        >
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <span className="font-extrabold tracking-tight">Ask AI</span>
          <span className="sr-only">Ask SDET AI</span>
        </button>

        {/* 2. Notifications Bell & Popover */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2.5 rounded-full text-[#A1A1AA] hover:text-white hover:bg-[#1E1E1E] transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#81FF89] ring-2 ring-[#141414]" />
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-[#161616] border border-[#262626] rounded-[24px] shadow-2xl p-4 space-y-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#262626] px-1">
                <span className="text-xs font-bold text-white">
                  Notifications
                </span>
                <span className="text-xs font-semibold text-[#81FF89] bg-[#81FF89]/15 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>

              <div className="divide-y divide-[#262626] max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="py-3 px-2 hover:bg-[#1E1E1E] rounded-xl transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-semibold text-white">
                        {n.title}
                      </span>
                      <span className="text-xs text-[#A1A1AA]">{n.time}</span>
                    </div>
                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
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
              className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full text-xs font-semibold bg-[#161616] hover:bg-[#1E1E1E] text-white transition-all cursor-pointer border border-[#262626]"
              aria-label="User profile menu"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#81FF89] to-[#80FFF9] text-black font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                {getInitials(currentUser.displayName)}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate text-xs font-bold text-white">
                {currentUser.displayName?.split(" ")[0] || "Profile"}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform ${profileMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {profileMenuOpen && (
              <div className="absolute right-0 mt-3 w-76 bg-[#161616] border border-[#262626] rounded-[24px] shadow-2xl p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User Identity Card */}
                <div className="p-3.5 bg-[#1F1F1F] rounded-[18px] border border-[#262626] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs truncate">
                      {currentUser.displayName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isAdmin
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-[#81FF89]/15 text-[#81FF89] border border-[#81FF89]/30"
                        }`}
                      >
                        {isAdmin
                          ? "ADMIN"
                          : currentUser.targetRole || "STUDENT"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-[#A1A1AA] truncate">
                    {currentUser.email}
                  </div>

                  {/* Protected Access Level */}
                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-[11px] text-[#A1A1AA]">
                      Access Level:
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isAdmin
                          ? "bg-purple-500/20 text-purple-300"
                          : "bg-[#2A2A2A] text-[#D4D4D8]"
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
                      href="/admin"
                      onClick={() => setProfileMenuOpen(false)}
                      className="w-full px-3.5 py-2.5 text-left rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold flex items-center justify-between transition-colors border border-purple-500/30"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                        <span>Admin Dashboard</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">
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
                      className="w-full px-3.5 py-2 text-left rounded-xl hover:bg-[#222222] text-[#A1A1AA] hover:text-white flex items-center gap-2 transition-colors cursor-pointer text-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-[#81FF89] shrink-0" />
                      <span>Admin Access Gateway</span>
                    </button>
                  )}

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

                  <Link
                    href={
                      pathname?.startsWith("/kids") ? "/kids" : "/dashboard"
                    }
                    onClick={() => setProfileMenuOpen(false)}
                    className="w-full px-3.5 py-2.5 text-left rounded-xl hover:bg-[#222222] text-[#D4D4D8] hover:text-white font-medium flex items-center gap-2.5 transition-colors"
                  >
                    <Layers className="w-4 h-4 text-[#80FFF9] shrink-0" />
                    <span>
                      {pathname?.startsWith("/kids")
                        ? "Coding Tutorial Hub"
                        : "Learning Dashboard"}
                    </span>
                  </Link>
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#262626] rounded-[28px] w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowAdminUnlockModal(false)}
              className="absolute top-4 right-4 p-2 text-[#A1A1AA] hover:text-white rounded-full hover:bg-[#222222] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Admin Access Gateway
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Restricted system administration portal
                </p>
              </div>
            </div>

            <p className="text-xs text-[#D4D4D8] leading-relaxed">
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
                <label className="block text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-1.5">
                  Admin Master Passcode
                </label>
                <input
                  type="password"
                  value={adminPasscode}
                  onChange={(e) => setAdminPasscode(e.target.value)}
                  placeholder="Enter security key..."
                  className="w-full bg-[#0F0F0F] border border-[#2B2B2B] rounded-xl px-4 py-3 text-sm text-white placeholder-[#71717A] focus:outline-none focus:border-[#81FF89] transition"
                  autoFocus
                />
              </div>

              {adminUnlockStatus?.error && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-400 text-xs flex items-center gap-2">
                  <X className="w-4 h-4 shrink-0" />
                  <span>{adminUnlockStatus.error}</span>
                </div>
              )}

              {adminUnlockStatus?.success && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-[#81FF89] text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{adminUnlockStatus.success}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminUnlockModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#222222] hover:bg-[#2A2A2A] text-[#D4D4D8] text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!adminPasscode.trim()}
                  className="px-5 py-2.5 rounded-full bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authorize Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Gemini Key Modal */}
      <GeminiKeyModal
        isOpen={showKeyModal}
        onClose={() => setShowKeyModal(false)}
        onSaved={() => {
          const u = QADatabase.getCurrentUser();
          setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(u?.id)));
          setShowKeyModal(false);
        }}
        onOptOut={() => {
          const u = QADatabase.getCurrentUser();
          setHasGeminiKey(Boolean(QADatabase.getUserGeminiKey(u?.id)));
          setShowKeyModal(false);
        }}
        reason="Connect your personal free Google AI Studio key (1,500 requests/day at zero cost) to use AI features, or opt out to focus purely on core traditional automation."
      />
    </header>
  );
}
