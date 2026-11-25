/**
 * IntelligentQA Zero-Cost Project Files & Folders Vault
 * Stores and indexes user project documents (.pdf, .md, .xlsx, .pptx, .docx, .txt)
 * directly in client-side IndexedDB with 0 server hosting or cloud bucket cost.
 */

export interface ProjectFile {
  id: string;
  userId: string;
  name: string;
  folder: string; // "Root" or custom folder name like "Requirements", "Test Plans", etc.
  type: 'pdf' | 'md' | 'xlsx' | 'xls' | 'pptx' | 'ppt' | 'docx' | 'txt' | 'json' | 'csv' | 'other';
  size: number;
  uploadedAt: string;
  extractedText: string;
  summary: string;
  itemCount?: number;
  dataUrl?: string;
}

export interface ProjectFolder {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export const MAX_PROJECT_FILE_SIZE_MB = 15;
export const MAX_PROJECT_FILE_SIZE_BYTES = MAX_PROJECT_FILE_SIZE_MB * 1024 * 1024;

const DB_NAME = 'IntelligentQA_ProjectVault_v1';
const DB_VERSION = 2;
const FILES_STORE = 'files';
const FOLDERS_STORE = 'folders';

// Fallback keys for resilient browser storage
const FALLBACK_KEY = 'intelligentqa_fallback_project_files_';
const FOLDERS_FALLBACK_KEY = 'intelligentqa_fallback_project_folders_';

// Default starter folders for organizing QA artifacts
export const DEFAULT_PROJECT_FOLDERS: string[] = [
  'Root',
  'Requirements & PRDs',
  'Test Matrices & Plans',
  'Architecture & Specs',
  'Defect Logs & Sprints',
];

// Default starter sample files for initial orientation
const DEFAULT_SAMPLE_FILES: ProjectFile[] = [
  {
    id: 'sample-file-1',
    userId: 'default',
    name: 'user_authentication_2fa_spec.md',
    folder: 'Requirements & PRDs',
    type: 'md',
    size: 4250,
    uploadedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    extractedText: `# Feature Specification: User Authentication & 2FA Verification\n\n## Summary\nUsers must authenticate with email/password and verify an OTP SMS token for high-value transactions.\n\n### Acceptance Criteria (Given-When-Then)\n1. Given a user navigates to the login screen, when they submit valid credentials, then a 6-digit OTP is dispatched via SMS.\n2. Given the OTP screen is visible, when the user inputs an expired or invalid token 3 times, then the account is locked for 15 minutes.\n3. Given valid 2FA token entry, when verified, then an authenticated session token is persisted in storageState with 30-day expiration.\n\n### Edge Cases\n- Network latency during SMS gateway dispatch (>5000ms timeout fallback).\n- Concurrent logins from multiple browser sessions.\n- SQL injection patterns in email input fields.`,
    summary: 'Auth & 2FA specification with 3 Given-When-Then criteria and security edge cases',
    itemCount: 3,
  },
  {
    id: 'sample-file-2',
    userId: 'default',
    name: 'ecommerce_checkout_matrix.xlsx',
    folder: 'Test Matrices & Plans',
    type: 'xlsx',
    size: 18400,
    uploadedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    extractedText: `Test ID | Module | Scenario Description | Priority | Test Type | Expected Outcome\nTC-CHK-001 | Checkout | Valid credit card checkout with active coupon | P1 | Functional | Order confirmed with discount applied\nTC-CHK-002 | Checkout | Expired promotional voucher entry | P2 | Negative | Error banner "Voucher has expired"\nTC-CHK-003 | Payment | Insufficient funds card authorization | P1 | Negative | Payment declined status code 402\nTC-CHK-004 | Cart | Empty cart checkout attempt | P3 | Edge Case | Disabled checkout CTA and message`,
    summary: '4 Functional and Negative test scenarios covering Cart, Checkout, and Payment',
    itemCount: 4,
  },
  {
    id: 'sample-file-3',
    userId: 'default',
    name: 'microservices_api_architecture.pdf',
    folder: 'Architecture & Specs',
    type: 'pdf',
    size: 24800,
    uploadedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    extractedText: `Microservices Architecture Guide & REST Assured Test Specification\n\nBase URL: https://api.intelligentqa.io/v1\n\nEndpoints:\n1. POST /api/auth/login - Request body: { email, password }. Returns: { token, refreshToken, expiresIn: 3600 }\n2. GET /api/accounts/{id}/balance - Headers: { Authorization: Bearer <token> }. Returns: 200 OK with Balance POJO\n3. POST /api/transfers - Idempotency-Key header mandatory. Returns 201 Created\n\nContract Constraints: JSON Schema validation mandatory for all payloads. Latency SLA < 250ms p95.`,
    summary: 'API Architecture Specification covering Auth, Balance, and Transfer Endpoints',
    itemCount: 3,
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isBrowser()) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(FILES_STORE)) {
        const fileStore = db.createObjectStore(FILES_STORE, { keyPath: 'id' });
        fileStore.createIndex('userId', 'userId', { unique: false });
        fileStore.createIndex('folder', 'folder', { unique: false });
      }
      if (!db.objectStoreNames.contains(FOLDERS_STORE)) {
        const folderStore = db.createObjectStore(FOLDERS_STORE, { keyPath: 'id' });
        folderStore.createIndex('userId', 'userId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function notifyFilesUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('intelligentqa_project_files_updated'));
  }
}

// ============================================================
// FILE STORAGE CRUD
// ============================================================

export async function getProjectFiles(userId: string = 'default'): Promise<ProjectFile[]> {
  if (!isBrowser()) return DEFAULT_SAMPLE_FILES;

  const currentUserId = userId || 'default';

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(FILES_STORE, 'readonly');
      const store = transaction.objectStore(FILES_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        let results: ProjectFile[] = request.result || [];
        // Filter by user if populated, or fallback to default/unassigned files
        if (currentUserId && currentUserId !== 'default') {
          results = results.filter(
            (f) => !f.userId || f.userId === currentUserId || f.userId === 'default'
          );
        }

        // Merge with local fallback files if any exist
        const local = getLocalFilesFallback(currentUserId);
        const existingIds = new Set(results.map((r) => r.id));
        for (const loc of local) {
          if (!existingIds.has(loc.id)) {
            results.push(loc);
          }
        }

        // If brand-new user with 0 files, initialize sample files
        if (results.length === 0) {
          saveInitialSampleFiles(currentUserId)
            .then((saved) => resolve(saved))
            .catch(() => resolve([]));
          return;
        }

        resolve(results);
      };

      request.onerror = () => {
        resolve(getLocalFilesFallback(currentUserId));
      };
    });
  } catch (err) {
    // Fallback: localStorage
    return getLocalFilesFallback(currentUserId);
  }
}

async function saveInitialSampleFiles(userId: string): Promise<ProjectFile[]> {
  const initial = DEFAULT_SAMPLE_FILES.map((f) => ({ ...f, userId }));
  for (const f of initial) {
    await saveProjectFile(f);
  }
  return initial;
}

export async function saveProjectFile(file: ProjectFile): Promise<ProjectFile> {
  if (!isBrowser()) return file;

  // Dual-write to LocalStorage fallback for seamless persistence
  saveLocalFileFallback(file);

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(FILES_STORE, 'readwrite');
      const store = transaction.objectStore(FILES_STORE);
      const request = store.put(file);

      request.onsuccess = () => {
        notifyFilesUpdated();
        resolve(file);
      };

      request.onerror = () => {
        notifyFilesUpdated();
        resolve(file);
      };
    });
  } catch (err) {
    notifyFilesUpdated();
    return file;
  }
}

export async function deleteProjectFile(id: string, userId: string = 'default'): Promise<void> {
  if (!isBrowser()) return;

  deleteLocalFileFallback(id);

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(FILES_STORE, 'readwrite');
      const store = transaction.objectStore(FILES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => {
        notifyFilesUpdated();
        resolve();
      };

      request.onerror = () => {
        notifyFilesUpdated();
        resolve();
      };
    });
  } catch (err) {
    notifyFilesUpdated();
  }
}

export async function deleteProjectFiles(ids: string[], userId: string = 'default'): Promise<void> {
  for (const id of ids) {
    await deleteProjectFile(id, userId);
  }
}

export async function moveFilesToFolder(
  fileIds: string[],
  targetFolder: string,
  userId: string = 'default'
): Promise<void> {
  const allFiles = await getProjectFiles(userId);
  for (const file of allFiles) {
    if (fileIds.includes(file.id)) {
      await saveProjectFile({ ...file, folder: targetFolder });
    }
  }
  notifyFilesUpdated();
}

// ============================================================
// FOLDER STORAGE CRUD
// ============================================================

export async function getProjectFolders(userId: string = 'default'): Promise<string[]> {
  if (!isBrowser()) return DEFAULT_PROJECT_FOLDERS;

  const currentUserId = userId || 'default';
  let storedFolders: string[] = [];

  try {
    const db = await openDatabase();
    storedFolders = await new Promise((resolve) => {
      const transaction = db.transaction(FOLDERS_STORE, 'readonly');
      const store = transaction.objectStore(FOLDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const folders: ProjectFolder[] = request.result || [];
        resolve(folders.map((f) => f.name));
      };

      request.onerror = () => resolve([]);
    });
  } catch (err) {
    // IndexedDB failure handled gracefully
  }

  // Also read from LocalStorage fallback
  try {
    const keys = [`${FOLDERS_FALLBACK_KEY}${currentUserId}`, `${FOLDERS_FALLBACK_KEY}default`];
    for (const k of keys) {
      const raw = window.localStorage.getItem(k);
      if (raw) {
        const parsed: string[] = JSON.parse(raw);
        storedFolders = Array.from(new Set([...storedFolders, ...parsed]));
      }
    }
  } catch {}

  // Also inspect any folder currently assigned to files
  try {
    const allFiles = await getProjectFiles(currentUserId);
    const fileFolders = allFiles.map((f) => f.folder).filter(Boolean);
    storedFolders = Array.from(new Set([...storedFolders, ...fileFolders]));
  } catch {}

  // Merge default folders with user and custom folders uniquely
  const merged = Array.from(new Set([...DEFAULT_PROJECT_FOLDERS, ...storedFolders])).filter(
    Boolean
  );
  return merged;
}

export async function createProjectFolder(name: string, userId: string = 'default'): Promise<void> {
  const cleanName = name.trim();
  if (!cleanName || !isBrowser()) return;

  const currentUserId = userId || 'default';
  const folderRecord: ProjectFolder = {
    id: `folder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: currentUserId,
    name: cleanName,
    createdAt: new Date().toISOString(),
  };

  // Dual-write to LocalStorage fallback
  saveLocalFolderFallback(cleanName, currentUserId);

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(FOLDERS_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDERS_STORE);
      const request = store.put(folderRecord);

      request.onsuccess = () => {
        notifyFilesUpdated();
        resolve();
      };

      request.onerror = () => {
        notifyFilesUpdated();
        resolve();
      };
    });
  } catch (err) {
    notifyFilesUpdated();
  }
}

export async function deleteProjectFolder(
  folderName: string,
  userId: string = 'default'
): Promise<void> {
  if (!isBrowser()) return;

  const currentUserId = userId || 'default';
  deleteLocalFolderFallback(folderName, currentUserId);

  // Move files currently in this folder back to 'Root'
  const allFiles = await getProjectFiles(currentUserId);
  const filesInFolder = allFiles.filter((f) => f.folder === folderName);
  for (const f of filesInFolder) {
    await saveProjectFile({ ...f, folder: 'Root' });
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(FOLDERS_STORE, 'readwrite');
      const store = transaction.objectStore(FOLDERS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const records: ProjectFolder[] = request.result || [];
        const match = records.find((r) => r.name === folderName);
        if (match) {
          store.delete(match.id);
        }
        notifyFilesUpdated();
        resolve();
      };

      request.onerror = () => {
        notifyFilesUpdated();
        resolve();
      };
    });
  } catch {
    notifyFilesUpdated();
  }
}

// ============================================================
// CONTEXT FORMATTER FOR AI QA AGENTS
// ============================================================

export function formatContextForAgents(files: ProjectFile[]): string {
  if (!files || files.length === 0) return '';

  const chunks = files.map((file) => {
    // Truncate individual file if extremely large to maintain prompt safety
    const textSnippet =
      file.extractedText.length > 25000
        ? file.extractedText.slice(0, 25000) +
          '\n\n[... Remaining content truncated for token limits ...]'
        : file.extractedText;

    return `=== PROJECT FILE: "${file.name}" [Folder: ${file.folder} | Type: ${file.type.toUpperCase()}] ===\n${textSnippet}\n=== END OF FILE "${file.name}" ===`;
  });

  return `\n\n=======================================================\nATTACHED PROJECT CONTEXT FILES (${files.length} Files Selected)\n=======================================================\n${chunks.join('\n\n')}\n=======================================================\n`;
}

// ============================================================
// LOCAL STORAGE FALLBACK HELPERS
// ============================================================

function getLocalFilesFallback(userId: string): ProjectFile[] {
  if (typeof window === 'undefined') return DEFAULT_SAMPLE_FILES;
  try {
    const raw = window.localStorage.getItem(`${FALLBACK_KEY}${userId}`);
    if (raw) return JSON.parse(raw);
    return DEFAULT_SAMPLE_FILES;
  } catch {
    return DEFAULT_SAMPLE_FILES;
  }
}

function saveLocalFileFallback(file: ProjectFile): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalFilesFallback(file.userId);
    const updated = [file, ...current.filter((f) => f.id !== file.id)];
    window.localStorage.setItem(`${FALLBACK_KEY}${file.userId}`, JSON.stringify(updated));
  } catch {
    // Storage quota might be reached
  }
}

function deleteLocalFileFallback(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(FALLBACK_KEY));
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const files: ProjectFile[] = JSON.parse(raw);
        const filtered = files.filter((f) => f.id !== id);
        window.localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
  } catch {}
}

function saveLocalFolderFallback(folderName: string, userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = [`${FOLDERS_FALLBACK_KEY}${userId}`, `${FOLDERS_FALLBACK_KEY}default`];
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      const current: string[] = raw ? JSON.parse(raw) : [];
      if (!current.includes(folderName)) {
        current.push(folderName);
        window.localStorage.setItem(key, JSON.stringify(current));
      }
    }
  } catch {}
}

function deleteLocalFolderFallback(folderName: string, userId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const keys = [`${FOLDERS_FALLBACK_KEY}${userId}`, `${FOLDERS_FALLBACK_KEY}default`];
    for (const key of keys) {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const current: string[] = JSON.parse(raw);
        const filtered = current.filter((f) => f !== folderName);
        window.localStorage.setItem(key, JSON.stringify(filtered));
      }
    }
  } catch {}
}
