# IntelligentQA - Autonomous SDET & AI Transformation Platform

> Learning Contents which will Transition Manual QA Professionals into Intelligent QA or Smart SDET.
> A comprehensive, zero-cost learning platform designed for QA engineers and manual testers to master modern test automation (**Playwright + TypeScript**, **Selenium + Java**, **API Testing**), autonomous QA AI agents, and architecture-level SDET interview preparation.

---

## 🚀 Key Features

### 1. Autonomous QA AI Agents Suite
- **1. Requirement Generator**: Transform high-level business ideas into structured user stories, Gherkin acceptance criteria (`Given-When-Then`), and edge-case specifications. Export directly to Excel (`.xls`) or Markdown.
- **2. Test Case Generator**: Generate exhaustive positive, negative, and security test matrices with priority and preconditions from scratch or by importing Word (`.docx`), Excel (`.xlsx`), or PDF documents.
- **3. Automation Code Generator**: Scaffold production-ready Page Object Model automation suites with resilient locators and web-first assertions for Playwright TS, Selenium Java, and REST Assured.
- **4. Code Auditor & Flakiness Review**: Detect brittle XPath locators, hardcoded timeouts, unhandled race conditions, and get actionable SDET refactoring recommendations.
- **5. Senior SDET Mentor Chat**: Technical coaching on test architecture, CI/CD design, and flakiness triage.

### 2. Comprehensive 500+ SDET Interview Question Bank
- Scenario-based questions categorized across **Junior SDET**, **Mid-Level SDET**, **Senior SDET**, and **Test Architect**.
- Comprehensive coverage across:
  - Playwright & TypeScript Architecture
  - Selenium & Java Framework Design
  - REST Assured & API Contract Testing
  - AI & LLM Testing Strategies
  - CI/CD & Distributed Test Infrastructure
- Built-in **Excel/CSV Import** and template download to expand your question bank anytime.

### 3. AI Technical Interview Griller
- Live simulation with dynamic follow-ups, code evaluation, and automated percentage scorecards.
- Tracks performance history on your personal dashboard.

### 4. Interactive Learning Sandboxes
- **Web Automation Playground (`/sandbox/web`)**: Practice against dynamic DOM elements, shadow roots, nested iframes, pagination, and multi-field OTP inputs.
- **Mock REST API Sandbox (`/api/sandbox/v1/*`)**: Test authentication (JWT), status codes, delayed responses, and CRUD endpoints without external dependencies.

### 5. Personal Dashboard & Artifacts Manager
- Permanent local storage and history of all generated requirements, test matrices, and automation scripts.
- Interactive modal viewer, one-click clipboard copy, and direct Excel export.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Client-side RLS with session fallback and export utilities
- **AI Engine**: Google Gemini API (BYOK - Bring Your Own Key with zero quota burn guarantee) + deterministic offline knowledge base

---

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
git clone https://github.com/manishleoy2k3/IntelligentQA.git
cd IntelligentQA
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```

---

## 📄 License
ISC
