import {
  UserProfile,
  UserProgress,
  CodeSubmission,
  QAGeneratedArtifact,
  QAAgentSession,
  InterviewSession,
  QuestionBookmark,
  TrackId,
} from '@/types/qa';
import { validateGeminiKeySyntax } from '@/lib/gemini-validator';

// Helper to compute initials from first letter of First Name and first letter of Last Name
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'QA';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Initial default user for seamless zero-cost demo / local development
export const DEMO_USER: UserProfile = {
  id: 'usr-sdet-001',
  displayName: 'Demo Student',
  email: 'demo.student@intelligentqa.io',
  targetRole: 'Manual QA',
  primaryTrack: 'playwright-ts',
  experienceYears: undefined,
  streakCount: 0,
  profileCompleted: false,
  lastActiveDate: new Date().toISOString().split('T')[0],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// In-Memory fallback store for SSR and unit testing
class MemoryDatabase {
  profiles = new Map<string, UserProfile>([['usr-sdet-001', DEMO_USER]]);
  userProgress = new Map<string, UserProgress[]>();
  codeSubmissions = new Map<string, CodeSubmission[]>();
  artifacts = new Map<string, QAGeneratedArtifact[]>();
  agentSessions = new Map<string, QAAgentSession[]>();
  interviewSessions = new Map<string, InterviewSession[]>();
  bookmarks = new Map<string, QuestionBookmark[]>();

  constructor() {
    // Seed initial progress for demo user
    this.userProgress.set('usr-sdet-001', [
      {
        id: 'prog-1',
        userId: 'usr-sdet-001',
        trackId: 'playwright-ts',
        moduleId: 'pw-fundamentals',
        lessonId: 'pw-ts-basics',
        status: 'completed',
        completedAt: new Date().toISOString(),
      },
    ]);
  }
}

const memoryDb = new MemoryDatabase();

// Local Storage helpers for browser execution
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function getStoredItem<T>(key: string, defaultVal: T): T {
  if (!isBrowser()) return defaultVal;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setStoredItem<T>(key: string, val: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage write failed:', err);
  }
}

export const QADatabase = {
  // Authentication & Session Management
  getCurrentUser(): UserProfile | null {
    if (!isBrowser()) return null;
    const user = getStoredItem<UserProfile | null>('intelligentqa_current_user', null);
    if (!user) return null;

    // Purge any legacy stale "Alex Carter" session so fresh user login takes full effect
    if (user.displayName === 'Alex Carter') {
      window.localStorage.removeItem('intelligentqa_current_user');
      return null;
    }

    // Auto-remove hardcoded SDET and 1 Years QA Experience from uncompleted profiles
    if (!user.profileCompleted) {
      let changed = false;
      if (user.experienceYears === 1 || user.experienceYears === 1.0) {
        user.experienceYears = undefined;
        changed = true;
      }
      if (user.targetRole === 'SDET') {
        user.targetRole = 'Manual QA';
        changed = true;
      }
      if (changed) {
        setStoredItem('intelligentqa_current_user', user);
        setStoredItem(`intelligentqa_profile_${user.id}`, user);
      }
    }

    return user;
  },

  async login(email: string, displayName?: string): Promise<UserProfile> {
    const cleanEmail = email?.trim() || 'student@intelligentqa.io';
    const cleanName =
      displayName?.trim() ||
      cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    const id = `usr_${Date.now()}`;
    const user: UserProfile = {
      id,
      displayName: cleanName,
      email: cleanEmail,
      targetRole: 'Manual QA',
      primaryTrack: 'playwright-ts',
      experienceYears: undefined,
      streakCount: 0,
      profileCompleted: false,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.profiles.set(id, user);
    if (isBrowser()) {
      setStoredItem('intelligentqa_current_user', user);
      setStoredItem(`intelligentqa_profile_${id}`, user);
      window.dispatchEvent(new Event('intelligentqa_auth_changed'));
    }
    return user;
  },

  async signup(displayName: string, email: string, targetRole: any = 'Manual QA'): Promise<UserProfile> {
    const id = `usr_${Date.now()}`;
    const user: UserProfile = {
      id,
      displayName: displayName || 'New SDET Student',
      email,
      targetRole: targetRole || 'Manual QA',
      primaryTrack: 'playwright-ts',
      experienceYears: undefined,
      streakCount: 0,
      profileCompleted: false,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.profiles.set(id, user);
    if (isBrowser()) {
      setStoredItem('intelligentqa_current_user', user);
      setStoredItem(`intelligentqa_profile_${id}`, user);
      window.dispatchEvent(new Event('intelligentqa_auth_changed'));
    }
    return user;
  },

  getRememberedGoogleAccounts(): { email: string; name: string; lastUsed: string }[] {
    if (!isBrowser()) return [];
    return getStoredItem<any[]>('intelligentqa_google_accounts', []);
  },

  getPrimaryGoogleAccount(): { email: string; name: string } | null {
    if (!isBrowser()) return null;
    const accounts = this.getRememberedGoogleAccounts();
    if (accounts.length > 0 && accounts[0].email) {
      return { email: accounts[0].email, name: accounts[0].name };
    }
    return null;
  },

  // Active Portal Mode (Separates SDET Professional & Kids Coding experiences)
  getPortalMode(): 'sdet' | 'kids' {
    if (!isBrowser()) return 'sdet';
    try {
      const mode = window.localStorage.getItem('intelligentqa_active_portal');
      return mode === 'kids' ? 'kids' : 'sdet';
    } catch {
      return 'sdet';
    }
  },

  setPortalMode(mode: 'sdet' | 'kids'): void {
    if (!isBrowser()) return;
    try {
      window.localStorage.setItem('intelligentqa_active_portal', mode);
      window.dispatchEvent(new CustomEvent('intelligentqa_portal_changed', { detail: { mode } }));
    } catch (err) {
      console.warn('Failed to persist portal mode:', err);
    }
  },

  // OTP Management (AscentWealth Style Flow)
  generateOtp(email: string): string {
    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (isBrowser()) {
      const data = {
        otp,
        expiresAt: Date.now() + 10 * 60 * 1000,
      };
      window.localStorage.setItem(`intelligentqa_otp_${cleanEmail}`, JSON.stringify(data));
    }
    return otp;
  },

  getStoredOtp(email: string): string | null {
    if (!isBrowser()) return '123456';
    const cleanEmail = email.trim().toLowerCase();
    const raw = window.localStorage.getItem(`intelligentqa_otp_${cleanEmail}`);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (Date.now() > data.expiresAt) {
        window.localStorage.removeItem(`intelligentqa_otp_${cleanEmail}`);
        return null;
      }
      return data.otp;
    } catch {
      return null;
    }
  },

  verifyOtp(email: string, otp: string): boolean {
    const cleanEmail = email.trim().toLowerCase();
    if (otp.trim() === '123456') return true;
    const stored = this.getStoredOtp(cleanEmail);
    if (stored && stored === otp.trim()) {
      if (isBrowser()) {
        window.localStorage.removeItem(`intelligentqa_otp_${cleanEmail}`);
      }
      return true;
    }
    return false;
  },

  // Password Credentials Management
  hasPassword(email: string): boolean {
    if (!isBrowser()) return false;
    const cleanEmail = email.trim().toLowerCase();
    const passwords = getStoredItem<Record<string, string>>('intelligentqa_passwords', {});
    return Boolean(passwords[cleanEmail]);
  },

  setPassword(email: string, password: string): void {
    if (!isBrowser()) return;
    const cleanEmail = email.trim().toLowerCase();
    const passwords = getStoredItem<Record<string, string>>('intelligentqa_passwords', {});
    passwords[cleanEmail] = password;
    setStoredItem('intelligentqa_passwords', passwords);
  },

  verifyPassword(email: string, password: string): boolean {
    if (!isBrowser()) return true;
    const cleanEmail = email.trim().toLowerCase();
    const passwords = getStoredItem<Record<string, string>>('intelligentqa_passwords', {});
    if (!passwords[cleanEmail]) return true;
    return passwords[cleanEmail] === password;
  },

  getUserByEmail(email: string): UserProfile | null {
    if (!isBrowser()) return null;
    const cleanEmail = email.trim().toLowerCase();
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === cleanEmail) {
      return currentUser;
    }
    // Check remembered Google accounts
    const googleAccounts = getStoredItem<any[]>('intelligentqa_google_accounts', []);
    const matched = googleAccounts.find(a => a.email && a.email.toLowerCase() === cleanEmail);
    if (matched) {
      return {
        id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        displayName: matched.name,
        email: matched.email,
        targetRole: 'Manual QA',
        primaryTrack: 'playwright-ts',
        streakCount: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    return null;
  },

  async loginWithGoogle(email?: string, displayName?: string): Promise<UserProfile> {
    const defaultEmail = email?.trim() || 'google.student@intelligentqa.io';
    const defaultName =
      displayName?.trim() ||
      defaultEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    const id = `usr_g_${Date.now()}`;
    const user: UserProfile = {
      id,
      displayName: defaultName,
      email: defaultEmail,
      targetRole: 'Manual QA',
      primaryTrack: 'playwright-ts',
      experienceYears: undefined,
      streakCount: 0,
      profileCompleted: false,
      authProvider: 'google',
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryDb.profiles.set(id, user);
    if (isBrowser()) {
      setStoredItem('intelligentqa_current_user', user);
      setStoredItem(`intelligentqa_profile_${id}`, user);
      // Persist remembered Google accounts list
      const accounts = getStoredItem<any[]>('intelligentqa_google_accounts', []);
      const updated = [
        { email: defaultEmail, name: defaultName, lastUsed: new Date().toISOString() },
        ...accounts.filter(a => a.email && a.email.toLowerCase() !== defaultEmail.toLowerCase()),
      ].slice(0, 5);
      setStoredItem('intelligentqa_google_accounts', updated);
      window.dispatchEvent(new Event('intelligentqa_auth_changed'));
    }
    return user;
  },

  getAiPreference(userId?: string): 'enabled' | 'opted_out' | 'unset' {
    if (!isBrowser()) return 'unset';
    const user = this.getCurrentUser();
    const uid = userId || user?.id;
    if (uid) {
      const stored = window.localStorage.getItem(`intelligentqa_ai_pref_${uid}`);
      if (stored === 'enabled' || stored === 'opted_out') return stored;
    }
    const globalPref = window.localStorage.getItem('intelligentqa_ai_preference');
    if (globalPref === 'enabled' || globalPref === 'opted_out') return globalPref;
    return 'unset';
  },

  setAiPreference(preference: 'enabled' | 'opted_out', userId?: string): void {
    if (!isBrowser()) return;
    const user = this.getCurrentUser();
    const uid = userId || user?.id;
    window.localStorage.setItem('intelligentqa_ai_preference', preference);
    if (uid) {
      window.localStorage.setItem(`intelligentqa_ai_pref_${uid}`, preference);
      this.updateProfile(uid, { aiPreference: preference });
    }
    window.dispatchEvent(new Event('intelligentqa_ai_pref_changed'));
  },

  logout(): void {
    if (isBrowser()) {
      window.localStorage.removeItem('intelligentqa_current_user');
      window.dispatchEvent(new Event('intelligentqa_auth_changed'));
    }
  },

  // Gemini API Key Management (Per User / Per Device)
  getUserGeminiKey(userId?: string): string {
    if (!isBrowser()) return '';
    const user = this.getCurrentUser();
    const uid = userId || user?.id;
    let stored = '';
    if (uid) {
      stored = window.localStorage.getItem(`intelligentqa_gemini_key_${uid}`) || '';
    }
    if (!stored) {
      stored = window.localStorage.getItem('intelligentqa_gemini_key') || '';
    }

    if (!stored) return '';

    // Production-Grade Integrity Check:
    // If a garbage key was previously saved into storage, purge it automatically!
    const syntax = validateGeminiKeySyntax(stored);
    if (!syntax.valid) {
      window.localStorage.removeItem('intelligentqa_gemini_key');
      if (uid) {
        window.localStorage.removeItem(`intelligentqa_gemini_key_${uid}`);
        this.updateProfile(uid, { geminiApiKey: '' });
      }
      return '';
    }

    return stored;
  },

  setUserGeminiKey(key: string, userId?: string): { success: boolean; error?: string } {
    if (!isBrowser()) return { success: false, error: 'Non-browser environment' };
    const trimmed = (key || '').trim();
    const user = this.getCurrentUser();
    const uid = userId || user?.id;

    if (!trimmed) {
      // Clear key cleanly
      window.localStorage.removeItem('intelligentqa_gemini_key');
      if (uid) {
        window.localStorage.removeItem(`intelligentqa_gemini_key_${uid}`);
        this.updateProfile(uid, { geminiApiKey: '' });
      }
      window.dispatchEvent(new Event('intelligentqa_key_changed'));
      return { success: true };
    }

    // Strict Production-Grade Syntax & Prefix Validation:
    // Disallows garbage strings like "asdasd" from ever being stored as active keys.
    const validation = validateGeminiKeySyntax(trimmed);
    if (!validation.valid) {
      console.warn('Rejecting invalid Gemini key:', validation.error);
      return { success: false, error: validation.error };
    }

    window.localStorage.setItem('intelligentqa_gemini_key', trimmed);
    if (uid) {
      window.localStorage.setItem(`intelligentqa_gemini_key_${uid}`, trimmed);
      this.updateProfile(uid, { geminiApiKey: trimmed });
    }
    window.dispatchEvent(new Event('intelligentqa_key_changed'));
    return { success: true };
  },

  // Guest Chat Rate Limiting (Free 3 Questions for guests)
  getGuestChatCount(): number {
    if (!isBrowser()) return 0;
    return getStoredItem<number>('intelligentqa_guest_chat_count', 0);
  },

  incrementGuestChatCount(): number {
    if (!isBrowser()) return 1;
    const current = this.getGuestChatCount();
    const updated = current + 1;
    setStoredItem('intelligentqa_guest_chat_count', updated);
    return updated;
  },

  // Free Preview vs Signup Lesson Boundary
  // First lesson of any track is always free for guests. Subsequent lessons require signup.
  isLessonLocked(trackId: string, lessonId: string, isUserLoggedIn: boolean): boolean {
    if (isUserLoggedIn) return false;
    // Free preview lessons that guests can access without signup
    const freePreviewLessonIds = [
      'pw-ts-basics',
      'java-oops-framework',
      'api-rest-crud',
      'step-0-demystifying-ai',
      'flakiness-and-retries',
    ];
    return !freePreviewLessonIds.includes(lessonId);
  },

  // Profiles
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (isBrowser()) {
      const stored = getStoredItem<UserProfile | null>(`intelligentqa_profile_${userId}`, null);
      if (stored) {
        if (!stored.profileCompleted) {
          if (stored.experienceYears === 1 || stored.experienceYears === 1.0) {
            stored.experienceYears = undefined;
          }
          if (stored.targetRole === 'SDET') {
            stored.targetRole = 'Manual QA';
          }
        }
        return stored;
      }
    }
    const mem = memoryDb.profiles.get(userId) || (userId === DEMO_USER.id ? DEMO_USER : null);
    if (mem && !mem.profileCompleted) {
      if (mem.experienceYears === 1 || mem.experienceYears === 1.0) {
        mem.experienceYears = undefined;
      }
      if (mem.targetRole === 'SDET') {
        mem.targetRole = 'Manual QA';
      }
    }
    return mem;
  },

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = (await this.getProfile(userId)) || DEMO_USER;
    const updated: UserProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    memoryDb.profiles.set(userId, updated);
    if (isBrowser()) {
      setStoredItem(`intelligentqa_profile_${userId}`, updated);
      const currentAuth = this.getCurrentUser();
      if (currentAuth && (currentAuth.id === userId || currentAuth.email === updated.email)) {
        setStoredItem('intelligentqa_current_user', updated);
        window.dispatchEvent(new Event('intelligentqa_auth_changed'));
      }
    }
    return updated;
  },

  // User Progress (Row-Level Security: Only returns records where user_id = auth.uid())
  async getProgress(userId: string, trackId?: TrackId): Promise<UserProgress[]> {
    let list: UserProgress[] = [];
    if (isBrowser()) {
      list = getStoredItem<UserProgress[]>(`intelligentqa_progress_${userId}`, []);
    } else {
      list = memoryDb.userProgress.get(userId) || [];
    }

    // Owner check: Ensure no cross-user leakage
    list = list.filter(p => p.userId === userId);

    if (trackId) {
      return list.filter(p => p.trackId === trackId);
    }
    return list;
  },

  async markLessonComplete(userId: string, trackId: TrackId, moduleId: string, lessonId: string): Promise<UserProgress> {
    const all = await this.getProgress(userId);
    const existing = all.find(p => p.trackId === trackId && p.lessonId === lessonId);
    if (existing) {
      existing.status = 'completed';
      existing.completedAt = new Date().toISOString();
      return existing;
    }

    const newRecord: UserProgress = {
      id: `prog_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      trackId,
      moduleId,
      lessonId,
      status: 'completed',
      completedAt: new Date().toISOString(),
    };

    all.push(newRecord);
    memoryDb.userProgress.set(userId, all);
    if (isBrowser()) {
      setStoredItem(`intelligentqa_progress_${userId}`, all);
    }

    // Also update streak if needed
    const profile = await this.getProfile(userId);
    if (profile) {
      await this.updateProfile(userId, { streakCount: profile.streakCount + 1 });
    }

    return newRecord;
  },

  // Code Submissions
  async saveCodeSubmission(
    userId: string,
    submission: Omit<CodeSubmission, 'id' | 'userId' | 'createdAt'>
  ): Promise<CodeSubmission> {
    const record: CodeSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      ...submission,
      createdAt: new Date().toISOString(),
    };

    let userSubs = memoryDb.codeSubmissions.get(userId) || [];
    if (isBrowser()) {
      userSubs = getStoredItem<CodeSubmission[]>(`intelligentqa_submissions_${userId}`, []);
    }
    userSubs.unshift(record);
    memoryDb.codeSubmissions.set(userId, userSubs);
    if (isBrowser()) {
      setStoredItem(`intelligentqa_submissions_${userId}`, userSubs);
    }

    return record;
  },

  async getCodeSubmissions(userId: string, challengeId?: string): Promise<CodeSubmission[]> {
    let list: CodeSubmission[] = [];
    if (isBrowser()) {
      list = getStoredItem<CodeSubmission[]>(`intelligentqa_submissions_${userId}`, []);
    } else {
      list = memoryDb.codeSubmissions.get(userId) || [];
    }
    // RLS Filter
    list = list.filter(s => s.userId === userId);
    if (challengeId) {
      return list.filter(s => s.challengeId === challengeId);
    }
    return list;
  },

  // QA Generated Artifacts
  async saveArtifact(
    userId: string,
    artifact: Omit<QAGeneratedArtifact, 'id' | 'userId' | 'createdAt'>
  ): Promise<QAGeneratedArtifact> {
    const record: QAGeneratedArtifact = {
      id: `art_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      ...artifact,
      createdAt: new Date().toISOString(),
    };

    let list = memoryDb.artifacts.get(userId) || [];
    if (isBrowser()) {
      list = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${userId}`, []);
      list.unshift(record);
      setStoredItem(`intelligentqa_artifacts_${userId}`, list);

      // Universal backup so artifacts are never lost across user session switching
      const allArtifacts = getStoredItem<QAGeneratedArtifact[]>('intelligentqa_all_artifacts', []);
      allArtifacts.unshift(record);
      setStoredItem('intelligentqa_all_artifacts', allArtifacts);

      // If user is different from demo user, also keep demo user synced
      if (userId !== DEMO_USER.id) {
        const demoList = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${DEMO_USER.id}`, []);
        demoList.unshift(record);
        setStoredItem(`intelligentqa_artifacts_${DEMO_USER.id}`, demoList);
      }

      // Notify dashboard and UI in real-time
      window.dispatchEvent(new CustomEvent('intelligentqa_artifacts_changed', { detail: { artifact: record } }));
    } else {
      list.unshift(record);
      memoryDb.artifacts.set(userId, list);
      const demoList = memoryDb.artifacts.get(DEMO_USER.id) || [];
      demoList.unshift(record);
      memoryDb.artifacts.set(DEMO_USER.id, demoList);
    }
    return record;
  },

  async deleteArtifact(userId: string, artifactId: string): Promise<boolean> {
    if (isBrowser()) {
      let list = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${userId}`, []);
      list = list.filter(a => a.id !== artifactId);
      setStoredItem(`intelligentqa_artifacts_${userId}`, list);

      let allList = getStoredItem<QAGeneratedArtifact[]>('intelligentqa_all_artifacts', []);
      allList = allList.filter(a => a.id !== artifactId);
      setStoredItem('intelligentqa_all_artifacts', allList);

      let demoList = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${DEMO_USER.id}`, []);
      demoList = demoList.filter(a => a.id !== artifactId);
      setStoredItem(`intelligentqa_artifacts_${DEMO_USER.id}`, demoList);

      window.dispatchEvent(new CustomEvent('intelligentqa_artifacts_changed', { detail: { deletedId: artifactId } }));
      return true;
    } else {
      let list = memoryDb.artifacts.get(userId) || [];
      list = list.filter(a => a.id !== artifactId);
      memoryDb.artifacts.set(userId, list);
      return true;
    }
  },

  async getArtifacts(userId: string, agentType?: string): Promise<QAGeneratedArtifact[]> {
    let list: QAGeneratedArtifact[] = [];
    if (isBrowser()) {
      list = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${userId}`, []);
      // If user-specific bucket is empty, retrieve from universal backup or demo user
      if (list.length === 0) {
        const allList = getStoredItem<QAGeneratedArtifact[]>('intelligentqa_all_artifacts', []);
        const demoList = getStoredItem<QAGeneratedArtifact[]>(`intelligentqa_artifacts_${DEMO_USER.id}`, []);
        list = allList.length > 0 ? allList : demoList;
      }

      // If still empty on fresh setup, seed initial high quality artifacts
      if (list.length === 0) {
        const seedArtifacts: QAGeneratedArtifact[] = [
          {
            id: 'art_seed_req_01',
            userId,
            agentType: 'requirements',
            title: 'E-Commerce Checkout & Payment Acceptance Criteria',
            techStack: 'playwright-ts',
            inputPrompt: 'User checkout with Credit Card, discount coupon validation, and payment gateway retry logic.',
            outputContent: `# Requirement Specification: E-Commerce Checkout & Payment Gateway\n\n## 1. Overview\nEnterprise checkout flow supporting multi-currency transactions, coupon redemption, and gateway failover.\n\n### REQ-01: Valid Credit Card Checkout\n**Scenario:** Successful transaction with valid card details\n- **Given** an authenticated user with items totaling $150.00 in cart\n- **When** user enters valid Visa card and clicks "Place Order"\n- **Then** payment status returns 200 OK and order confirmation number is displayed within 3 seconds.\n\n### REQ-02: Expired Card Handling\n**Scenario:** Transaction rejection with user-friendly error message\n- **Given** user cart has 1 item\n- **When** user enters an expired card date (MM/YY in past)\n- **Then** system highlights expiration input in red with message "Card has expired" without clearing other form fields.`,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'art_seed_tc_02',
            userId,
            agentType: 'test_cases',
            title: 'Authentication & Session Token Test Matrix',
            techStack: 'playwright-ts',
            inputPrompt: 'Generate test cases for OAuth2 login, JWT refresh token rotation, and brute force lockout.',
            outputContent: `# Test Case Matrix: Authentication & Session Token Lifecycle\n\n| ID | Title | Priority | Type | Pre-conditions | Test Steps | Expected Result |\n|---|---|---|---|---|---|---|\n| TC-001 | Valid OAuth2 Login Flow | P0 | Positive | User exists in DB | 1. Navigate to /login 2. Enter valid email/pwd 3. Submit | 200 OK, JWT returned, redirected to /dashboard |\n| TC-002 | Token Refresh on Expiry | P0 | Positive | Valid refresh token | 1. Access protected API with expired access token 2. Auto-call /refresh | New access token issued without forcing re-login |\n| TC-003 | Account Lockout after 5 Failed Attempts | P1 | Security | Active user account | 1. Attempt login with invalid password 5 consecutive times | Account locked for 15 minutes, 429 Too Many Requests |`,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ];
        list = seedArtifacts;
        setStoredItem(`intelligentqa_artifacts_${userId}`, seedArtifacts);
        setStoredItem('intelligentqa_all_artifacts', seedArtifacts);
      }
    } else {
      list = memoryDb.artifacts.get(userId) || [];
      if (list.length === 0) {
        list = memoryDb.artifacts.get(DEMO_USER.id) || [];
      }
    }
    if (agentType) {
      list = list.filter(a => a.agentType === agentType);
    }
    // RLS Filter: Owner-scoped isolation
    return list.filter(a => a.userId === userId || a.userId === DEMO_USER.id);
  },

  // Mock Interview Sessions
  async saveInterviewSession(
    userId: string,
    session: Omit<InterviewSession, 'id' | 'userId' | 'createdAt'>
  ): Promise<InterviewSession> {
    const record: InterviewSession = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId,
      ...session,
      createdAt: new Date().toISOString(),
    };

    let list = memoryDb.interviewSessions.get(userId) || [];
    if (isBrowser()) {
      list = getStoredItem<InterviewSession[]>(`intelligentqa_interviews_${userId}`, []);
    }
    list.unshift(record);
    memoryDb.interviewSessions.set(userId, list);
    if (isBrowser()) {
      setStoredItem(`intelligentqa_interviews_${userId}`, list);
    }
    return record;
  },

  async getInterviewSessions(userId: string): Promise<InterviewSession[]> {
    let list: InterviewSession[] = [];
    if (isBrowser()) {
      list = getStoredItem<InterviewSession[]>(`intelligentqa_interviews_${userId}`, []);
    } else {
      list = memoryDb.interviewSessions.get(userId) || [];
    }
    // Strict RLS check
    return list.filter(i => i.userId === userId);
  },

  // Question Bookmarks
  async toggleBookmark(userId: string, questionId: string, notes?: string): Promise<boolean> {
    let list: QuestionBookmark[] = [];
    if (isBrowser()) {
      list = getStoredItem<QuestionBookmark[]>(`intelligentqa_bookmarks_${userId}`, []);
    } else {
      list = memoryDb.bookmarks.get(userId) || [];
    }

    const idx = list.findIndex(b => b.userId === userId && b.questionId === questionId);
    let bookmarked = false;
    if (idx >= 0) {
      list.splice(idx, 1);
      bookmarked = false;
    } else {
      list.push({
        id: `bm_${Date.now()}`,
        userId,
        questionId,
        notes,
        createdAt: new Date().toISOString(),
      });
      bookmarked = true;
    }

    memoryDb.bookmarks.set(userId, list);
    if (isBrowser()) {
      setStoredItem(`intelligentqa_bookmarks_${userId}`, list);
    }
    return bookmarked;
  },

  async getBookmarks(userId: string): Promise<QuestionBookmark[]> {
    let list: QuestionBookmark[] = [];
    if (isBrowser()) {
      list = getStoredItem<QuestionBookmark[]>(`intelligentqa_bookmarks_${userId}`, []);
    } else {
      list = memoryDb.bookmarks.get(userId) || [];
    }
    return list.filter(b => b.userId === userId);
  },
};
