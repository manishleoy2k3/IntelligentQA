# MISSION: Zero-Cost QA Automation & AI Transformation Intelligence Platform (IntelligentQA)

You are an expert Principal SDET (Software Development Engineer in Test), full-stack fintech engineer, and test automation architect. Build a world-class, zero-cost web application designed to empower Manual QA Professionals, Quality Engineers, and aspiring programmers to master **Playwright + TypeScript**, **Selenium + Java**, **API Testing (REST Assured & Playwright API)**, **AI-Driven QA Engineering**, and **Core Programming (Python, JavaScript, Java)**, transforming them into high-demand, interview-ready SDETs and confident software builders.

The primary goal is to bridge the gap between traditional manual verification and modern AI-augmented test automation with hands-on interactive labs, live DOM & API practice sandboxes, a multi-tier zero-cost online compiler, a curated Coding Problem Library, an AI Interview Griller, a dedicated in-app **QA Agents** suite, an AI Debugging Mentor, and a Kids/Beginner Game & Project Studio.

This document is the authoritative implementation specification. Follow `AGENTS-QA.md`, including Next.js (App Router, React 19, TypeScript), Tailwind CSS, InsForge PostgreSQL with Row-Level Security (RLS), and zero-cost constraints.

---

## CRITICAL PROJECT CONSTRAINTS

1. **NO MANDATORY PAID DEPENDENCIES**:
   - Zero mandatory paid subscriptions, zero paid coding sandboxes, zero paid cloud testing grids (SauceLabs/BrowserStack), and zero paid LLM APIs.
   - Operate 100% within documented free tiers:
     - **Cloud AI (Online Engine)**: Google Gemini Flash Lite (`gemini-flash-lite-latest`, `gemini-2.5-flash`) via Google AI Studio free tier (15 RPM / 1,500 RPD) with deterministic local fallback engine and per-user BYOK (Bring Your Own Key) support.
     - **Database & Auth**: Managed InsForge PostgreSQL with owner-scoped RLS, Email OTP verification, and official Google OAuth 2.0 account selection.
     - **Online Compilers**: Multi-tier engine leveraging local subprocesses, SWC transpilation, open-source mirrors (Piston, Wandbox, Judge0, Glot), Gemini fallback, and in-process V8 VM sandboxes with zero external hosting dependencies.
     - **WhatsApp Bot / Daily Challenge**: Official Meta WhatsApp Cloud API free tier (1,000 free conversations/month).
   - Require explicit owner confirmation before introducing any service capable of incurring fees.
2. **HANDS-ON FIRST & SCRATCH-TO-SDET LEARNING**:
   - Enable users with zero programming background (pure manual testers) to select their target technology and learn step-by-step from ground zero (variables, loops, async/await, OOPs) to enterprise framework design.
   - Every theoretical concept must map to:
     1. The **Manual Test Step** (e.g. "Click login button, wait for spinner to disappear, verify dashboard header").
     2. The **Automation Script** (Playwright TypeScript and Selenium Java code).
     3. The **AI-Augmented Approach** (Prompt engineering, agentic test generation, self-healing locators).
3. **BUILT-IN MOCK APIS & INTERACTIVE PRACTICE SANDBOX**:
   - Provide an in-browser live testing lab with realistic challenging web scenarios (Shadow DOM, nested iframes, dynamic AJAX delays, stale elements, multi-tab popups, infinite scroll, file uploads, OTP input pins).
   - Provide real mock REST API endpoints (`/api/sandbox/v1/auth/login`, `/api/sandbox/v1/users`, `/api/sandbox/v1/delay/:sec`, `/api/sandbox/v1/status/:code`) with deliberate status codes (`200`, `201`, `400`, `401`, `404`, `500`), delay injection, and JWT token simulation for API automation practice.
4. **DURABLE USER PERSISTENCE & STRICT MULTI-TENANT ISOLATION**:
   - All user account logins, selected tech stacks, learning progress, custom coding problems, exercises, and game projects are durably stored in PostgreSQL with strict Row-Level Security (`auth.uid() = user_id`).
   - Insecure un-scoped `localStorage` has been completely replaced with a server-backed database client (`/api/db/user-data`, `QADatabase`).
   - **Zero Data Leakage**: User A can NEVER view or modify User B's progress, code, or interview evaluations. Browser cache is purely an offline acceleration layer, never the sole source of truth, and is purged on logout.
5. **CONTEMPORARY QA BRAND LOGO & VISUAL IDENTITY**:
   - Modern, stylized QA brand mark fusing the Verification Checkmark (`✔`), Code Syntax Brackets (`{ }` / `< >`), and the AI Neural Spark (`✦`), symbolizing "Verified Code Augmented with AI Intelligence".
   - Sleek, tech-forward developer aesthetic matching Linear, Stripe, and Vercel.
6. **PUBLIC & IN-APP "ASK AI" (Pre-Signup Guidance & Deep Error Debugging)**:
   - Header button and modal accessible for career advice, roadmap navigation, and live code debugging.
   - Enhanced with `diagnoseCodeError` in `src/lib/qa-knowledge-base.ts`: analyzes code errors (e.g. `IndexOutOfBoundsException`, `StaleElementReferenceException`, `IndentationError`, `TypeError`), highlights culprit lines, explains root causes in plain English, and generates corrected code snippets.
   - Strict Privacy Shield: Unauthenticated visitors are limited to 3 preview questions; unlimited access requires free login and user Gemini key to protect shared server quotas.
7. **DEDICATED IN-APP "QA AGENTS" SUITE**:
   - Inside user login, a dedicated **QA Agents** section with 5 autonomous/interactive agents: Requirements Clarifier, Test Case Generator, Automation Code Generator, Code Reviewer & Quality Auditor, and SDET Technical Chat Agent.
8. **MONETIZATION READY, CURRENTLY 100% FREE**:
   - Built to deliver complete unrestricted learning, sandboxes, and interview prep for free.
   - Architectural modularity allows optional future premium tiers (e.g. 1-on-1 human mock interviews, enterprise team analytics) without refactoring the core codebase.

---

## STRICT ARCHITECTURAL SEPARATION: SDET PLATFORM VS. KIDS CODING PLATFORM

The application enforces a **100% strict, permanent separation** between the Enterprise SDET Platform and the Kids Coding Platform. Both platforms function as completely independent sites with independent navigation, dedicated views, independent target audiences, and zero cross-switching.

### Rules of Separation:
1. **ZERO CROSS-SWITCHING AT ANY POINT IN TIME**:
   - Neither platform permits switching to the other at any time.
   - All portal switchers ("Switch to SDET Professional", "Switch to Kids Coding", "Kids Coding (10-14) Switch →") are strictly eradicated from Top Navigation, Profile Menus, Sidebars, and Home pages.
2. **TOTAL PLATFORM INDEPENDENCE**:
   - **Enterprise SDET Platform (`/`, `/dashboard`, `/tracks/*`, `/sandbox/*`, `/qa-agents`, `/interview-*`, `/guides/*`)**:
     - Dedicated exclusively to professional QA engineers and manual testers transitioning into high-demand SDETs.
     - Contains only enterprise tracks: Playwright + TypeScript, Selenium + Java, API Testing (REST Assured), AI in QA, and Interview Mastery.
     - Contains only professional practice labs: Web DOM Sandbox, Mock REST API, Online Multi-Language Compilers, and Algorithmic Coding Problem Library.
     - Home page (`/`) is 100% focused on SDET transformation; logged-in users route directly to `/dashboard`. Zero links, banners, or references to Kids Coding exist on the SDET site.
   - **Kids Coding Platform (`/kids`)**:
     - Dedicated exclusively to young learners and beginners (ages 10-18+).
     - Contains only core programming tracks: Python (30 lessons), JavaScript (27 lessons), Java (29 lessons).
     - Contains only beginner-friendly practice: Knowledge Testing Exercises (4-5 questions per section) and the Kids Game & Project Studio (9 playable starter projects).
     - Operates with its own independent navigation and layout without any SDET tracks, automation frameworks, or links back to the SDET portal.
3. **STRICT ROUTE-DRIVEN ISOLATION**:
   - The UI view is governed strictly by the requested route (`pathname?.startsWith('/kids')`), ensuring zero shared portal toggle state or cross-redirection between the two platforms.

---

## 1. TECH STACK & BRAND DESIGN SYSTEM

### Technology Stack
- **Framework**: Next.js 16 (App Router, React 19, TypeScript), Tailwind CSS, shadcn/ui, Lucide Icons, Framer Motion.
- **Code Editor & Syntax Highlighting**: Lightweight PrismJS/Shiki syntax-highlighted editor with synchronized scrolling, real-time line numbering, and execution error highlights.
- **Database, Auth & Storage**: InsForge PostgreSQL with Row-Level Security (RLS), AscentWealth-style Email OTP verification (`/api/db/user-data`), and official Google OAuth 2.0 Account Chooser & Consent screen (`accounts.google.com`).
- **Compiler & Execution Engine**:
  - *Tier 1 (Local)*: Native Node.js (`node -e`), Python 3 (`python3 -c`), and JDK (`javac` & `java`).
  - *Tier 2 (TypeScript)*: Next.js SWC JIT transform (`@swc/wasm` or native build swc).
  - *Tier 3 (Cloud Mirrors)*: Piston API, Wandbox (`cpython-head`), Judge0, and Glot with dynamic Java class extraction (`Main.java`).
  - *Tier 4 (AI Fallback)*: Gemini Flash Lite execution evaluation.
  - *Tier 5 (In-Process VM)*: Zero-dependency sandboxed V8 execution for Python (`simulatePythonInProcess`) and Java (`simulateJavaInProcess`) ensuring 100% Vercel serverless resiliency.
- **AI Dual-Engine Architecture**:
  - *Cloud LLM*: Google Gemini Flash Lite (`gemini-flash-lite-latest`, `gemini-2.5-flash`) via Google AI Studio API for interactive interview grilling, code reviews, test case generation, and error debugging.
  - *Local Deterministic Engine*: Zero-latency fallback in `src/lib/qa-knowledge-base.ts` covering 50+ SDET interview scenarios, locator strategies, architecture diagrams, and syntax snippets.
- **Messaging & Notifications**: Meta WhatsApp Cloud API (`/api/whatsapp/webhook`) for daily interview challenge delivery, streak reminders, and quick concept digests.
- **Hosting Targets**: Vercel (Hobby Free Tier) and InsForge Managed Backend.

### Contemporary QA Brand Logo & Visual Identity
- **Logo Concept**: The IntelligentQA brand mark is a geometric fusion of three core elements:
  1. **The Verification Checkmark (`✔`)**: Represents software quality, passing test suites, and trusted release validation.
  2. **The Code Syntax Brackets (`{ }` / `< >`)**: Represents the transition into software engineering, test automation code, and robust framework design.
  3. **The AI Neural Spark (`✦`)**: Represents intelligence, automated test synthesis, and next-generation SDET capabilities.
- **Visual Style**:
  - Crisp, modern developer aesthetic inspired by Linear, Raycast, and Stripe.
  - Background: Crisp off-white (`#F9FAFB`) in light mode; deep obsidian slate (`#0B0F17`) in dark mode.
  - Responsive SVG components provided in `src/components/ui/qa-brand-logo.tsx` for Header, Favicon, Light Mode, and Dark Mode.
- **Technology Identity Badges**:
  - **Playwright**: Emerald Green (`bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800`)
  - **TypeScript**: Sky Blue (`bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800`)
  - **Selenium**: Amber / Orange (`bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800`)
  - **Java**: Rose / Crimson (`bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800`)
  - **API Automation**: Purple / Indigo (`bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800`)
  - **AI in QA**: Violet / Cyan (`bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-800`)
  - **Interview Mastery**: Electric Indigo (`bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800`)

---

## 2. LEARNING TRACKS & CURRICULUM ARCHITECTURE

The platform provides 5 Enterprise SDET Tracks plus 3 Core Programming tracks for beginners and kids:

```
IntelligentQA Learning Platform
├── SDET CAREER TRACKS
│   ├── 1. Playwright + TypeScript (Modern E2E Web & Component Automation - 88h · 38 Lessons)
│   ├── 2. Selenium WebDriver + Java (Enterprise Test Automation & Core Java)
│   ├── 3. API Testing & Automation (REST Assured & Playwright API Testing)
│   ├── 4. AI in QA & Testing AI Applications (The Next-Gen SDET - 8-Step Studio)
│   └── 5. QA Interview Mastery & Coding Griller (Top 500+ Scenarios & Framework Design)
└── CORE PROGRAMMING & KIDS CODING TRACKS (/kids)
    ├── Python Programming (30 Sequential Lessons · Integrated Exercises · 4 Game Projects)
    ├── JavaScript Programming (27 Sequential Lessons · Integrated Exercises · 3 Game Projects)
    └── Java Programming (29 Sequential Lessons · Integrated Exercises · 2 Game Projects)
```

---

### Track 1: Playwright + TypeScript (Modern Web SDET)
- TypeScript Fundamentals for Testers: Types, interfaces, async/await, promises, and error handling.
- Core Playwright Architecture: BrowserContext isolation, Page lifecycle, and WebSocket CDP connection.
- Locators & Web-First Assertions: Strict mode locators, auto-waiting, `expect(locator).toBeVisible()`, and custom wait conditions.
- Advanced Interactions: Nested iframes, native Shadow DOM piercing, downloads, popups, and dialog handling.
- Production Framework Design: Page Object Model (POM), component fixtures, custom workers, cross-browser matrices, CI/CD GitHub Actions, and HTML/Allure report generation.

### Track 2: Selenium WebDriver + Java (Enterprise SDET)
- Core Java for Automation: Variables, arrays, collections (`List`, `Set`, `Map`), OOP pillars (Inheritance, Polymorphism, Encapsulation, Abstraction), and exception handling.
- WebDriver Architecture: W3C WebDriver Protocol, ChromeDriver/GeckoDriver communication, and session management.
- Dynamic Synchronization: Thread.sleep anti-patterns, Implicit vs Explicit waits, FluentWait, and ExpectedConditions.
- Enterprise Framework Architecture: PageFactory, hybrid keyword/data-driven frameworks (Apache POI Excel), TestNG lifecycle annotations, thread-safe parallel execution with `ThreadLocal<WebDriver>`, and ExtentReports.

### Track 3: API Testing & Automation (REST Assured & Playwright API)
- HTTP & REST Principles: Methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`), headers, cookies, status codes, query & path params.
- REST Assured Framework: Given-When-Then syntax, request/response specifications, authentication (Basic, Bearer, OAuth2), and JSONPath assertions.
- Serialization & Deserialization: Jackson/Gson POJOs, Builder pattern (Lombok), dynamic payload generation, and JSON schema validation.
- Playwright API Testing: Built-in `request` fixture, cookie synchronization with UI tests, and auth session state reusability (`storageState`).

### Track 4: AI in QA & Testing AI Applications (The Next-Gen SDET)
Dedicated 8-step curriculum designed specifically for manual testers transitioning to AI-augmented quality engineering:
1. Step 0: Demystifying AI in QA (Mental model shift from manual clicker to AI orchestrator).
2. Step 1: QA Prompt Engineering Mastery (Few-shot prompting, system role constraints, persona framing).
3. Step 2: AI Synthetic Test Data Generation (Generating HIPAA, GDPR, and edge-case boundary data).
4. Step 3: AI Test Automation Code Generation (Page Object Model scaffolding from DOM trees).
5. Step 4: Self-Healing Locators & Visual AI (Cosine similarity fallback locators, perceptual diffing).
6. Step 5: AI-Driven Failure Log Triage & Root Cause Analysis (RCA) (Stack trace classification and cluster deduplication).
7. Step 6: Testing AI/LLM Applications (Hallucination detection, prompt injection defense, semantic similarity distance, LLM-as-a-Judge).
8. Step 7: Autonomous Agentic QA Workflows (Multi-agent loops: requirements → test cases → automated suites → self-review).

### Track 5: QA Interview Mastery & Coding Griller
- Top 500+ categorized SDET interview questions across Automation, Frameworks, Architecture, and Scenario-based problems.
- Interactive AI Interview Griller (`/interview-griller`) with real-time percentage scoring and technical grading rubrics.
- In-depth SDET design problems (e.g. designing enterprise testing infrastructure, handling flaky tests, test data management).

---

### Core Programming & Kids Learning Studio (`/kids`)
Designed for beginners and kids (ages 10-18+), providing complete, standardized programming lessons matching industry curriculum guidelines (W3Schools/MDN):

1. **Python Track (30 Lessons)**:
   - **Merged Opening**: `Python Intro, Get Started & Syntax` (Lesson 1) covering Python design, execution lifecycle (.py & REPL), and 4-space indentation rules.
   - Core Concepts: Output & f-strings, Comments, Variables, Data Types, Numbers, Casting, Strings, Booleans, Operators, Lists, Tuples, Sets, Dictionaries, If...Else, Match-Case, While Loops, For Loops, Range, Functions, Lambda, Arrays, Classes & Objects, Inheritance, Iterators & Generators, Scope, Modules & Imports, File Handling (with context managers), Try...Except, and Advanced Decorators.
   - Sequential numbering: 1 to 30 with zero gaps.
   - Integrated testing exercises (4–5 questions per section) at bottom.
2. **JavaScript Track (27 Lessons)**:
   - **Merged Opening**: `JavaScript Intro, Get Started & Syntax` (Lesson 1) covering ECMAScript, Node.js vs Browser DOM runtimes, statements, and semicolon rules.
   - Core Concepts: Output & Console, Comments, Variables & Scope (`let`/`const`), Data Types, Numbers & Math, Casting & Coercion, Strings & Template Literals, Booleans & Truthy/Falsy, Operators, Arrays, Array Iteration (`map`/`filter`/`reduce`), Objects, If...Else, Switch, While Loops, For Loops (`for...of`/`for...in`), Functions & Arrow Functions, Scope & Closures, Destructuring & Spread/Rest, Sets & Maps, Classes & OOP, Inheritance & Prototypes, Try...Catch, Async/Await & Promises, Modules (ESM), and Advanced Event Loop.
   - Sequential numbering: 1 to 27.
3. **Java Track (29 Lessons)**:
   - **Merged Opening**: `Java Intro, Get Started & Syntax` (Lesson 1) covering JVM WORA architecture, `public static void main(String[] args)` entry point, and class structure.
   - Core Concepts: Output (`println`/`printf`), Comments & Javadoc, Variables & Strong Typing, Data Types (Primitive vs Object), Type Casting (Widening/Narrowing), Operators, Strings, Booleans, Numbers & Math, Arrays (1D & 2D), If...Else, Switch & Pattern Matching, While Loops, For Loops & Enhanced For-Each, Functions & Methods, Scope, Classes & Objects, Constructors, Access Modifiers, Inheritance (`super`), Polymorphism, Abstraction & Interfaces, ArrayList, HashMap, HashSet, Iterators & Stream API, Exceptions (`try/catch/finally`), and Advanced Generics.
   - Sequential numbering: 1 to 29.
4. **Kids & Beginner Game Studio (`/kids?view=projects`)**:
   - 9 complete, playable starter projects:
     - *Python*: Secret Number Guesser, Rock Paper Scissors Championship, Dungeon Quest Text RPG, Hangman Mystery Word.
     - *JavaScript*: Classic 2D Snake Arcade, Retro Pong Arcade, Memory Card Matching Puzzle.
     - *Java*: Monster Arena RPG Combat, ATM Banking & Vault Simulator.
   - Features: Code editor with Tab indentation, live run execution with standard output terminal, download script button, and database save/reset persistence.

---

## 3. INTERACTIVE PRACTICE LABS & CODING WORKSPACE

To ensure genuine hands-on learning without requiring external installations, the platform includes dedicated interactive sandboxes built directly into the site:

### Lab A: The Web Automation Playground (`/sandbox/web`)
A dedicated suite of live, dynamic web pages designed specifically to test edge cases:
- **Dynamic Elements**: Button appearing after random 2–5 second delays; spinner overlay blocking clicks.
- **Shadow DOM**: Native and open Shadow Roots containing nested input fields and buttons.
- **Nested Iframes**: Multi-tiered parent-child iframes requiring frame switching.
- **Dynamic Data Tables**: Search, pagination, sorting, and inline editing with unpredictable row counts.
- **OTP & Masked PIN Inputs**: 6-box segmented OTP inputs with auto-focus and clipboard paste.
- **File Upload / Drag & Drop**: Native file input, hidden drop zones, and progress bars.
- **Multi-Window & Alerts**: JavaScript alerts, confirmations, prompt dialogs, and browser child windows.
- **Infinite Scroll & Virtualized Lists**: Lazy-loaded items triggering network calls upon scrolling.

### Lab B: The Mock API Server (`/api/sandbox/v1/*`)
A real, working mock RESTful backend for API automation practice:
- `POST /api/sandbox/v1/auth/login`: Accepts credentials, returns JWT Bearer token or 401 Unauthorized.
- `GET /api/sandbox/v1/users`: Supports query parameters (`?page=1&limit=10&role=sdet`), pagination headers, and sorting.
- `POST /api/sandbox/v1/users`: Validates request body schema, returns 201 Created or 400 Bad Request with validation errors.
- `PUT/PATCH /api/sandbox/v1/users/:id`: Updates resource idempotently.
- `DELETE /api/sandbox/v1/users/:id`: Deletes resource, returns 204 No Content.
- `GET /api/sandbox/v1/delay/:seconds`: Injects configurable server delay (1 to 10 seconds) to test timeouts.
- `GET /api/sandbox/v1/status/:code`: Returns requested HTTP status code (`400`, `404`, `500`) to test negative paths.

### Lab C: Multi-Tier Zero-Cost Online Compilers (`/sandbox/code`)
An in-browser multi-language compilation and execution environment supporting **Python**, **JavaScript**, **TypeScript**, and **Java**:
- **Multi-Tier Execution Engine** (`/api/sandbox/compiler`):
  1. *Local Subprocess*: Executes local `python3`, `node`, or `javac`/`java` when binaries exist.
  2. *TypeScript In-Process*: Compiles TypeScript to JavaScript via Next.js SWC transform without spawn overhead.
  3. *Cloud Compiler Mirrors*: Piston API, Wandbox (`cpython-head`), Judge0, and Glot.
  4. *Gemini AI Compiler*: AI-simulated execution for rapid syntax checking.
  5. *In-Process V8 Sandboxes*: Isolated VM transpilation for Python and Java guaranteeing 100% execution capability on serverless platforms (Vercel).
- **IDE Features**:
  - Resizable 2-column layout: Code Editor on left, Console Output on right.
  - Horizontally resizable split divider with persistent drag handles.
  - Real-time line numbers synchronized with editor scrolling.
  - Execution error line highlighting and clean error callouts.
  - Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to run code instantly.

### Lab D: Coding Problem Library & In-App Solver (`/sandbox/code/problems`, `/sandbox/code/problems/[problemId]`)
Curated LeetCode-style SDET coding library with 22+ challenges:
- **Difficulty Distribution**: 16 Easy, 2 Medium, 4 Hard problems.
- **Hard Problems Added**:
  1. *Trapping Rain Water* (`trapping-rain-water` - Arrays & Two Pointers - Hard)
  2. *Minimum Window Substring* (`minimum-window-substring` - Strings & Sliding Window - Hard)
  3. *Sliding Window Maximum* (`sliding-window-maximum` - Arrays & Monotonic Deque - Hard)
  4. *Largest Rectangle in Histogram* (`largest-rectangle-histogram` - Stacks & Monotonic Stack - Hard)
- **Multi-Language Solutions**: Every problem provides starter templates and working test suites in Java, Python, TypeScript, JavaScript, and C#.
- **Features**:
  - Filter by category (Arrays, Strings, Stacks, Kids Coding) and difficulty (All, Easy, Medium, Hard).
  - Add Custom Problem modal with full schema validation.
  - Bulk import via CSV and JSON with downloadable reference templates (`sdet_coding_problem_template.json` / `.csv`).
  - 3-Pane Resizable Solver Layout: Problem Description on left (horizontally resizable), Compiler IDE top-right, and Live Output below (vertically resizable).
  - Instant "Load Solution" toggle to study optimal approaches.

### Lab E: Dedicated Hands-On Concept Guides (`/guides/[trackId]`)
- Guided walkthroughs for Selenium, Playwright, and API Testing with importable practice templates and step-by-step automated verification.

---

## 4. DATABASE SCHEMA & AUTHENTICATION (PostgreSQL / InsForge)

The platform leverages InsForge managed PostgreSQL with Row-Level Security (RLS) to persist user accounts, progress, bookmarks, code submissions, QA agent conversations, and interview scores:

```sql
-- 1. User Profiles & Tech Stack Configuration
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  primary_track TEXT DEFAULT 'playwright-ts',
  experience_level TEXT DEFAULT 'manual_qa',
  whatsapp_number TEXT,
  whatsapp_notifications BOOLEAN DEFAULT false,
  gemini_api_key_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Curriculum Lesson Progress
CREATE TABLE user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  code_solution TEXT,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, track_id, lesson_id)
);

-- 3. Coding Problem Submissions & Custom Library
CREATE TABLE user_coding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  language TEXT NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  execution_time_ms INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Exercises & Game Projects Persistence
CREATE TABLE user_programming_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  section_id TEXT,
  exercise_answers JSONB,
  project_code JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, language)
);

-- 5. Row-Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_programming_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can only update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can only manage own lesson progress" ON user_lesson_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage own coding submissions" ON user_coding_submissions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage own programming progress" ON user_programming_progress
  FOR ALL USING (auth.uid() = user_id);
```

### AscentWealth-Style Unified Authentication Flow
- **Email OTP Authentication**:
  - `POST /api/db/user-data` (Action: `request_otp`): Generates a secure 6-digit OTP code sent to user email.
  - `POST /api/db/user-data` (Action: `verify_otp`): Verifies OTP token within 5-minute validity window.
  - `POST /api/db/user-data` (Action: `set_password`): Sets user password upon verified OTP.
  - `POST /api/db/user-data` (Action: `credential_login`): High-speed direct password authentication.
- **Official Google OAuth 2.0 Integration**:
  - Initiates redirect to Google's hosted OAuth 2.0 endpoint:
    `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`
  - Presents official Google Account Chooser and Consent screens (`accounts.google.com`).
  - Exchanges authorization code via `/auth/callback` and `/auth/google/callback` to establish authenticated user session.
  - Completely purged legacy mock user accounts (`qa.student@gmail.com`, `interviewer@interviewvector.com`).
- **Bring-Your-Own-Key (BYOK) Gemini Protection**:
  - Secure modal allowing users to enter, validate, and store their personal Google AI Studio API key.
  - Enforces Google AI Studio format regex (`AIzaSy...`, 39 characters) with live API verification.
  - Protects platform server quotas while providing users with completely unrestricted AI generation and mock interviews.

---

## 5. CORE MODULES & USER FLOWS

### Module A: Technology Selection & Diagnostic Skill Assessment
- **Landing on `/`**: Modern, crisp developer aesthetics with a bold headline: *"Transform from Manual QA to High-Paid SDET & AI Test Engineer"*.
- **1-Click Diagnostic Assessment (`/assessment`)**:
  - 5-minute quick test evaluating: Manual Testing Fundamentals, Core Programming Logic, Locator Concepts, and API basics.
  - Recommends tailored starting track: (e.g. *"Start with Playwright + TypeScript Track"*).
- **Track Switcher**: Sticky pill bar allowing seamless toggling between Playwright, Selenium, API Testing, AI in QA, and Interview Griller.

### Module B: Interactive Split-Screen Learning Workspace (`/tracks/[trackId]/[lessonId]`)
- **Left Panel (Interactive Guide)**:
  - Concept explanation in plain English tailored for manual testers.
  - Side-by-side comparison: **"How You Did It Manually"** vs **"How Code Does It"**.
  - Interactive callouts: Pro-tips, common pitfalls, and interview alerts.
- **Right Panel (Code Editor & Instant Validation)**:
  - Multi-tab syntax editor (TypeScript/Java/Config).
  - Code validation button: Verifies syntax, required locators, assertions, and best practices.
  - "Run Code in Sandbox" button: Executes test against the live built-in sandbox with real visual feedback.
  - Progress auto-persists to InsForge PostgreSQL database.

### Module C: Dedicated Practice Labs & Online Compilers (`/sandbox/*`)
- Web Automation Playground (`/sandbox/web`): Live dynamic DOM scenarios.
- Mock API Server (`/sandbox/api`): Interactive REST endpoints with response inspector.
- Online Compilers (`/sandbox/code`): Live Python, JS, TS, and Java execution with resizable panes.
- Coding Problem Library (`/sandbox/code/problems`): 22+ LeetCode/SDET algorithmic challenges with in-app solver.

### Module D: AI Interview Griller & Coding Simulator (`/interview-griller`)
- User selects Difficulty (Junior SDET, Mid-Level SDET, Senior SDET, Test Architect) and Topic.
- AI Interviewer asks one challenging question at a time and probes candidate responses.
- Generates a final percentage scorecard with Technical, Architectural, and Communication grades.

### Module E: Public & In-App "Ask AI" SDET Mentor
- Header access for pre-signup career guidance and in-app code debugging.
- Built-in error diagnosis (`diagnoseCodeError`) detects error types, inspects stack traces, pinpointing exact failing lines and offering validated solutions.
- Suggested chips/FAQs removed from UI for a clean, distraction-free debugging experience.

### Module F: Dedicated In-App "QA Agents" Suite (`/qa-agents`)
Located inside the authenticated user navigation, this section provides 5 specialized autonomous/interactive agents:
1. **Requirements & User Story Clarifier Agent**:
   - Ingests raw business requirements, PRDs, or Jira user stories.
   - Flags missing negative paths, ambiguous acceptance criteria, and edge cases.
   - Outputs clean, structured Acceptance Criteria in Gherkin BDD format (`Given-When-Then`).
2. **Test Case Generator Agent**:
   - Generates comprehensive test matrices from user stories:
     - Positive / Happy Path scenarios
     - Negative / Error Handling scenarios
     - Boundary Value Analysis (BVA) & Equivalence Partitioning (EP)
     - Security & Permission checks
   - Supports multi-format file import (Word, Excel, PDF) and Excel export.
3. **Automation Code Generator Agent**:
   - Scaffolds complete Page Object Model (POM) classes and automated test scripts based on user target framework (Playwright TypeScript, Selenium Java, REST Assured).
4. **Code Reviewer & Quality Auditor Agent**:
   - Analyzes test code against SDET enterprise standards: flakiness detection, hardcoded wait checks, locator specificity, and assertion strength.
5. **Interactive SDET Chat Mentor Agent**:
   - Continuous 24/7 technical chat partner for debugging framework architecture, CI/CD pipelines, and interview preparation.

---

## 6. UI/UX & DESIGN SYSTEM

- **Navigation Architecture**:
  - Top Navigation: Brand Logo, Track Navigation, Ask SDET AI, Notifications, and Profile dropdown.
  - Left Sidebar: Standardized collapsible menus (Courses, Practice Labs, AI Tools & Agents, Interview Bank) with Chevron toggles, badge counts, and resizable right border.
  - Clean Language Tracks: Redundant headers ("Curriculum Lessons", "Test Knowledge & Projects") removed; clean `{Language} Exercises` and `{Language} Games & Projects` links positioned at the bottom.
- **Split-Pane Ergonomics**:
  - Drag-to-resize dividers across compilers and learning workspaces.
  - Responsive collapse on mobile and tablet devices.
  - Real-time line numbering, code folding, and auto-indentation.

---

## 7. MANDATORY REQUIREMENTS & ACCEPTANCE CRITERIA

#### 1. Zero Paid Dependencies
Operates 100% on free tiers (Gemini Flash Lite, PostgreSQL RLS, open-source compiler mirrors, V8 VM sandboxes).

#### 2. Dual-Engine AI Architecture
Cloud Gemini API with instant deterministic local fallback (`src/lib/qa-knowledge-base.ts`).

#### 3. High-Security Multi-Tenant Database
All user data, progress, code, and submissions stored in PostgreSQL with strict RLS isolation. No reliance on un-scoped client localStorage.

#### 4. AscentWealth Authentication
Email OTP verification + official Google OAuth 2.0 Account Selection & Consent flow. Zero mock email accounts.

#### 5. Multi-Tier Online Compilers
Full code execution for Python, JavaScript, TypeScript, and Java with 0 cloud dependencies using in-process V8 sandboxes.

#### 6. Coding Problem Library with Hard Challenges
22+ problems including Trapping Rain Water, Minimum Window Substring, Sliding Window Maximum, and Largest Rectangle in Histogram with full multi-language solutions.

#### 7. Standardized Programming Tracks & Kids Studio
Python (30 lessons), JavaScript (27 lessons), Java (29 lessons) with unified "Intro, Get Started & Syntax" opening and 9 playable game projects.

#### 8. AI Code Debugging
Ask AI includes `diagnoseCodeError` with stack trace analysis and line-by-line fix suggestions.

#### 9. Absolute Independence of SDET & Kids Coding Platforms
Zero cross-switching allowed at any point. Both platforms operate with completely independent navigation, layouts, and route boundaries.

---

## 8. DEFINITION OF DONE

1. All 5 SDET Learning Tracks and 3 Programming Tracks fully populated with structured lessons, code examples, and manual-to-automation walkthroughs.
2. Web Sandbox (`/sandbox/web`), Mock API (`/api/sandbox/v1/*`), and Online Compilers (`/sandbox/code`) are live, responsive, and testable.
3. Coding Problem Library (`/sandbox/code/problems`) contains Easy, Medium, and Hard challenges with working multi-language starter templates and solutions.
4. Dedicated in-app **QA Agents** suite (Requirements, Test Cases, Code Generation, Code Review, Chat) is fully operational.
5. In-process VM compilers execute Python and Java programs with full standard output and zero external dependencies.
6. Public and in-app **Ask AI** debugging mentor functions cleanly with error diagnosis, format validation, and key protection.
7. AscentWealth-style authentication with Email OTP and official Google OAuth 2.0 account chooser is fully operational.
8. InsForge PostgreSQL schema and RLS policies are applied with zero user data leakage.
9. All automated unit tests passing (`npm test`, 104/104 tests passing).
10. Zero TypeScript errors (`npx tsc --noEmit`) and clean production build (`npm run build`).
11. Zero mandatory paid dependencies or subscriptions.
12. 100% strict separation between the SDET Platform and Kids Coding Platform with zero switching mechanisms at any point in time.
