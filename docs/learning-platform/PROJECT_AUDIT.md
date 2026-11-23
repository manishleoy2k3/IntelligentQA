# IntelligentQA Existing Website Architecture Audit
**Document:** `docs/learning-platform/PROJECT_AUDIT.md`  
**Phase:** 0 — Existing Website Audit & Learning Platform Architecture  
**Date:** November 2026  
**Auditor:** Senior Full Stack Architect & Technical Lead  

---

## Executive Summary

The **IntelligentQA** platform is a modern, high-performance web application designed for Software Development Engineers in Test (SDETs) and Quality Assurance professionals. The platform combines interactive coding problem sandboxes, curriculum tracks, AI testing agents, technical interview preparation banks, and a self-hosted Content Management System (CMS).

This audit documents the complete baseline architecture of the IntelligentQA repository prior to the introduction of the Learning Academy / Technical Documentation Platform. It verifies that the proposed expansion will strictly reuse existing frameworks, styling systems, authorization primitives, and data persistence patterns without introducing breaking changes, paid cloud dependencies, or rewrite costs.

---

## 1. Technical Stack Inventory

| Architectural Layer | Technology | Version | Purpose & Notes |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `16.4.6` | React Server Components (RSC), Client Components (`'use client'`), Suspense, Dynamic Routing, Metadata generation |
| **UI Library** | React & React DOM | `19.3.1` | Next-gen React concurrent rendering, hooks, transitions |
| **Styling & CSS** | Tailwind CSS (PostCSS plugin) | `4.3.5` | Utility-first styling with custom dark theme tokens (`#111111`, `#141414`, `#1E1E1E`, `#262626`, emerald `#81FF89`, sky `#80FFF9`) |
| **Icons & Visuals** | Lucide React | `1.73.0` | Comprehensive icon suite used consistently across navigation, modals, and status badges |
| **Class Utilities** | `clsx` & `tailwind-merge` | `2.1.1` / `3.7.0` | Conflict-free conditional className resolution |
| **Backend Framework** | Next.js Route Handlers (`app/api/**/route.ts`) | `16.4.6` | Edge & Node.js serverless route handlers executing API logic |
| **Runtime Environment** | Node.js | `>=20.x` | Native ESM & CJS support, child process execution for sandbox compilation |
| **Language** | TypeScript | `7.0.2` | Strict typing across data models (`types/qa.ts`, `types/cms.ts`) and API contracts |
| **Testing Engine** | Node.js Native Test Runner (`node:test`, `node:assert`) | Node built-in | 296 unit, integration, and security regression tests in `tests/*.test.cjs` |
| **Authentication** | Dual: Local AscentWealth RBAC + Firebase Auth SDK | Custom / `13.4.0` | Role-based authentication via `QADatabase` with optional Firebase phone/email fallback |
| **Database & Persistence** | Dual: Local JSON Store + PostgreSQL Schema | DDL / JSON | `src/lib/curriculum-data-store.json` (active file store) + `scripts/schema.sql` (PostgreSQL DDL) |
| **File Storage** | Local Disk (`public/uploads`) + Client IndexedDB | Native | Free, zero-hosting-cost local filesystem and client-side IndexedDB vault |

---

## 2. Detailed Architecture Subsystem Analysis

### 2.1 Frontend Framework & Component Architecture
* **Routing Paradigm:** Next.js App Router (`src/app/`). All page routes use folder-based routing:
  * `/dashboard` — Learner dashboard with enrollment and progress stats.
  * `/tracks` — Learning track directory with stage progression.
  * `/tracks/[trackId]` — Track overview with syllabus and module accordions.
  * `/tracks/[trackId]/[lessonId]` — Interactive dual-panel lesson workspace.
  * `/guides/[trackId]` — Comprehensive technical guides and tutorial catalog.
  * `/courses/[courseId]` — Public SEO landing page for courses.
  * `/blog`, `/blog/[slug]` — Published technical articles and tutorials.
  * `/admin`, `/admin/cms` — Admin Control Center and CMS Publishing suite.
  * `/sandbox/code`, `/sandbox/api` — Interactive online compiler and mock API server.
  * `/qa-agents`, `/prompt-lab` — Autonomous QA testing agents and prompt engineering workbench.
* **Shell Architecture (`src/components/layout/app-shell.tsx`):**
  * Coordinates layout modes: `AdminShell` (pure admin console), `StudentLearningShell` (persistent left navigation + top navigation), and `PublicShell` (marketing header and footer).
  * Avoids layout thrashing through persistent state coordination.
* **Design System & Theme:**
  * Dark-mode primary design language matching enterprise developer tools (JetBrains / VS Code aesthetic).
  * Background tokens: Base `#111111`, Card `#161616`, Border `#262626`, Sub-nav `#141414`.
  * Accent tokens: Emerald `#81FF89`, Sky `#80FFF9`, Purple `#A855F7`, Amber `#F59E0B`.

### 2.2 Backend & API Architecture
* All backend services operate as standard Next.js Route Handlers (`src/app/api/`):
  * `/api/admin/cms` — Handles article, category, tag, and revision CRUD.
  * `/api/admin/media` — Handles multi-part file uploads, disk persistence, and media cataloging.
  * `/api/db/curriculum` — Provides GET/POST endpoints for live curriculum persistence and disk synchronization.
  * `/api/sandbox/compiler` — Multi-language sandboxed code executor (Java, Python, TypeScript, JavaScript).
  * `/api/ai/*` — AI mentor chat, test review agent, and Gemini API proxy.
* **Response Contracts:** Uniform JSON envelopes:
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null
  }
  ```

### 2.3 Database & Persistence Architecture
The codebase currently implements a reliable, 100% free, two-tier persistence architecture:
1. **Active Production JSON Store (`src/lib/curriculum-data-store.json`):**
   * Acts as the zero-configuration embedded database.
   * Holds `tracks`, `modules`, `lessons`, `codingProblems`, `articles`, `categories`, `tags`, `media`, and `cmsAuditLogs`.
   * Managed via `src/lib/cms-store.ts` and `src/app/api/db/curriculum/route.ts` with atomic disk writes.
2. **Relational Database Schema (`scripts/schema.sql`):**
   * Enterprise-ready PostgreSQL / SQLite compatible schema.
   * Defines tables for categories, tags, articles, article tags, article revisions, media assets, and audit logs.
   * Driven by migration script `scripts/migrate.js`.
3. **Client-Side State & IndexedDB (`src/lib/qa-db.ts`, `src/lib/project-files.ts`):**
   * Client-side localStorage for fast session and progress synchronization.
   * Client-side IndexedDB database (`IntelligentQA_ProjectVault_v1`) for local file document indexing without server costs.

### 2.4 Authentication & Authorization
* **Identity Management:** Managed through `QADatabase` in `src/lib/qa-db.ts`:
  * Supports email/password credentials, passwordless OTP (AscentWealth flow), Google OAuth callback (`/auth/google/callback`), and optional Firebase auth.
* **Role-Based Access Control (RBAC):**
  * Core helper `QADatabase.isAdmin(user)` verifies whether the authenticated email is present in the admin whitelist (`getAdminEmails()`).
  * Default system administrator: `admin@intelligentqa.io`.
  * Elevation protocol: Users can elevate their account using the master secret passcode (`adminSecret`).
* **Server-Side API Authorization (`src/lib/cms-security.ts`):**
  * `verifyAdminAccess(req)` checks `Authorization` headers, `x-admin-email`, and `x-admin-passcode` before permitting administrative writes.

### 2.5 Existing Admin Console
* **Admin Dashboard (`/admin`):**
  * Modular console featuring overview cards, Course curriculum manager, Practice Labs manager, AI Agents configurator, Interview Bank curator, and Team RBAC panel.
* **CMS & Publishing Studio (`/admin/cms`):**
  * Tabbed management for Articles, Courses & Content Hierarchy, Categories, Tags, and Media Library.
  * In-house visual block editor (`src/components/cms/editor/rich-block-editor.tsx`) supporting EditorJS-compatible structured blocks.

### 2.6 File Storage & Media Handling
* **Physical File Uploads:**
  * Stored in the public directory at `public/uploads/`.
  * Upload handler: `src/app/api/admin/media/route.ts`.
  * Validates file extensions, MIME types, and maximum sizes (up to 15MB).
  * Stores metadata (width, height, alt text, file size, URL) in `cms_media`.
* **Zero-Cost Client Vault:**
  * `src/lib/project-files.ts` uses browser IndexedDB to hold user-uploaded `.pdf`, `.docx`, `.xlsx`, `.md` files without hosting charges.

---

## 3. Project Directory Map

```
IntelligentQA/
├── docs/                               # Architecture and project documentation
│   └── learning-platform/              # Learning Academy Platform specifications
├── public/                             # Static public assets
│   ├── images/                         # System diagrams, SVGs, and brand icons
│   └── uploads/                        # User-uploaded images, diagrams, documents
├── scripts/                            # Operational and build scripts
│   ├── build_curriculum.py             # Curriculum compilation script
│   ├── migrate.js                      # Open-source database migration runner
│   └── schema.sql                      # PostgreSQL/SQLite relational schema DDL
├── src/
│   ├── app/                            # Next.js App Router (Pages & APIs)
│   │   ├── admin/                      # Admin Console & CMS routes
│   │   │   ├── cms/page.tsx            # CMS & Publishing Studio
│   │   │   └── page.tsx                # Admin Control Center
│   │   ├── api/                        # Route Handlers (REST endpoints)
│   │   │   ├── admin/cms/route.ts      # CMS CRUD API
│   │   │   ├── admin/media/route.ts    # Media upload API
│   │   │   └── db/curriculum/route.ts  # Curriculum persistence API
│   │   ├── courses/                    # Public course SEO routes
│   │   ├── guides/                     # Technical concept guides routes
│   │   ├── tracks/                     # Learning tracks & interactive workspaces
│   │   ├── layout.tsx                  # Root Next.js layout
│   │   └── page.tsx                    # Landing / Home page
│   ├── components/                     # Reusable React components
│   │   ├── auth/                       # Auth modals, OAuth handlers, guards
│   │   ├── cms/                        # Rich block editor, media modal
│   │   ├── guides/                     # Tutorial viewer, diagram renderer
│   │   ├── layout/                     # AppShell, Sidebar, TopNav, Header, Footer
│   │   ├── tracks/                     # CodeEditorWorkspace, TrackOverviewClient
│   │   └── ui/                         # Visual diagrams, brand logos, editors
│   ├── lib/                            # Business logic, stores, utilities
│   │   ├── cms-store.ts                # Server-side CMS data store
│   │   ├── file-parser.ts              # Document and text extraction utilities
│   │   ├── office-documents.ts         # OOXML (.docx, .xlsx) generation & parsing
│   │   ├── qa-curriculum.ts            # Curriculum in-memory registry
│   │   └── qa-db.ts                    # Client-side database, RBAC, progress engine
│   └── types/                          # TypeScript definitions
│       ├── cms.ts                      # CMS, articles, blocks, media types
│       └── qa.ts                       # Tracks, modules, lessons, user types
├── tests/                              # Node.js automated test suites (296 tests)
├── package.json                        # Dependency declarations
└── tsconfig.json                       # TypeScript compiler configuration
```

---

## 4. Key Findings & Architectural Strengths

1. **Clean Separation of Concerns:**
   The codebase strictly separates presentation components, business logic engines (`src/lib/`), and data storage contracts (`src/types/`).
2. **100% Free & Open-Source Foundation:**
   There are zero paid SaaS dependencies. The app runs completely on free, standard open-source tools (Next.js, Tailwind CSS, Node.js native testing, local storage/PostgreSQL).
3. **Established Design System:**
   The UI utilizes an established dark theme with standardized component classes, custom SVG diagrams, and accessible typography.
4. **Existing Extensible Admin CMS:**
   The admin interface already contains modal builders, lesson sequence changers, media uploaders, and block editors, providing an immediate foundation for course creation.
5. **Robust Test Suite:**
   A comprehensive test harness of 296 tests verifies routing, sidebar ordering, authentication security, and curriculum integrity.

---

## 5. Conclusion & Readiness

The IntelligentQA codebase is exceptionally well-structured and primed for extension. Introducing the Learning Academy / Technical Documentation Platform will build directly on existing Next.js App Router patterns, Tailwind styling tokens, RBAC security rules, and data store abstractions without requiring any architectural rewrites or breaking changes.
