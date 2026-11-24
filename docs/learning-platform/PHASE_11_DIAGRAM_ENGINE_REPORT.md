# Phase 11: Professional AI-Powered Architecture Diagram Generation Engine Implementation Report

**Status:** Completed  
**Technology:** React Flow (`@xyflow/react`), ELK.js (`elkjs`), Zod, Google Gemini API (Imagen 3 & Text Flash), SVG Vector Engine, Next.js 16  
**Target:** Admin Content Management Studio, Visual Lesson Editor, Media Library  
**Date:** November 24, 2026  

---

## 1. Executive Summary

Phase 11 transitions the **IntelligentQA Learning Academy** from basic Mermaid-style text-in-box flowcharts to an **Enterprise-Grade Technical Architecture Visualization Engine**.

Rather than relying on basic flowchart boxes or asking generative image models to invent system components, the platform now utilizes a structured, deterministic architecture generation workflow:
1. **Mode A — Professional Architecture Diagram**: Text-based QA Content Architect generates structured, schema-validated JSON representing real-world components, communication protocols, and architectural tiers. Layout is calculated using **ELK.js** (`elkjs`) and rendered interactively with **React Flow** (`@xyflow/react`) and standalone SVG vector graphics with 6 enterprise themes.
2. **Mode B — Educational Technical Infographic**: Powered by a dedicated image-generation pipeline (**Google Gemini Imagen 3** / Local High-Resolution Rasterizer), generating persistent PNG graphics for complex conceptual breakdowns (e.g. LLMs, Tokenization, Self-Attention, Test Pyramid).
3. **Mode C — Simple Technical Flowchart**: Preserves Mermaid exclusively for sequence diagrams, decision trees, and simple conditional workflows.

---

## 2. Diagram Engine Architecture

The architecture separates structured data specification from vector rendering and persistent storage:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      ADMIN DIAGRAM STUDIO MODAL                         │
│  (Triggered via: Enhance with AI / Lesson Editor / CMS Media Library)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │    MODE A     │          │    MODE B     │          │    MODE C     │
 │ Architecture  │          │  Infographic  │          │   Flowchart   │
 └──────┬────────┘          └───────┬───────┘          └───────┬───────┘
        │                           │                          │
        ▼                           ▼                          ▼
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │ Gemini Flash  │          │ Gemini Imagen │          │  Mermaid.js   │
 │ Text / SDET   │          │  (Dedicated   │          │  Live Syntax  │
 │ Template      │          │  Image Model) │          │  Renderer     │
 └──────┬────────┘          └───────┬───────┘          └───────┬───────┘
        │                           │                          │
        ▼                           ▼                          ▼
 ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
 │ Zod Schema    │          │ Persistent    │          │ HTML Wrap &   │
 │ & AI Review   │          │ PNG Storage   │          │ Syntax Copy   │
 └──────┬────────┘          │ (/uploads/)   │          └───────┬───────┘
        │                   └───────┬───────┘                  │
        ▼                           │                          │
 ┌───────────────┐                  │                          │
 │  ELK.js Graph │                  │                          │
 │  Layout Auto  │                  │                          │
 └──────┬────────┘                  │                          │
        │                           │                          │
   ┌────┴──────────────────────────┐│                          │
   ▼                               ▼│                          │
┌───────────────────────┐ ┌────────────────────────┐           │
│ React Flow Canvas     │ │ Standalone SVG & PNG   │           │
│ (Interactive Editing) │ │ Vector Export          │           │
└───────────┬───────────┘ └────────┬───────────────┘           │
            │                      │                           │
            └───────────┬──────────┴───────────────────────────┘
                        ▼
       ┌─────────────────────────────────┐
       │   Tiptap WYSIWYG Lesson Editor  │
       │   (Single-click Insertion)      │
       └─────────────────────────────────┘
```

---

## 3. Dependencies and Licenses

All packages integrated in Phase 11 are strictly open-source, permissive, and free of paid enterprise tiers:

| Package | Version | Purpose | License |
| :--- | :--- | :--- | :--- |
| `@xyflow/react` | `^12.15.0` | Interactive canvas, panning, zooming, custom node mounting | MIT |
| `elkjs` | `^0.9.3` | Eclipse Layout Kernel compiled to JS for automatic graph layout | EPL-2.0 / EDLv1.0 |
| `zod` | `^3.25.0` | Strict server-side JSON schema validation and refinement | MIT |
| `lucide-react` | `^1.73.0` | Production technical SVG icons for 15 node types | ISC |

**No paid React Flow Pro components or proprietary diagram SaaS APIs were used.**

---

## 4. Architecture JSON Schema

Architecture diagrams are governed by a strict Zod schema (`src/lib/diagram/schema.ts`):
- Node IDs must be unique across the diagram.
- All edges must reference existing source and target node IDs.
- Connecting a node to itself is rejected.
- Protocols and communication types are strictly categorized.

### Specification Interface:
```typescript
interface ArchitectureDiagramData {
  diagramType: 'architecture';
  title: string;
  description?: string;
  layout?: 'layered' | 'hierarchical';
  direction?: 'LR' | 'TB';
  theme?: ArchitectureDiagramTheme;
  layers?: ArchitectureLayer[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  legend?: ArchitectureLegendItem[];
  technicalNotes?: string[];
}
```

---

## 5. Custom SVG Node Components (15 Enterprise Types)

The visual design system implements 15 dedicated technical node types, each with its own palette, accent line, and Lucide vector icon (`src/components/diagram/nodes/architecture-node.tsx`):

1. **Client Node (`client`)**: User test code, script runners, test clients (Icon: `Monitor`).
2. **Browser Node (`browser`)**: Chromium, WebKit, Firefox DOM processes (Icon: `Globe`).
3. **Application Node (`application`)**: Language client bindings, core applications (Icon: `Layers`).
4. **API Node (`api`)**: REST, GraphQL, and RPC endpoints (Icon: `Link`).
5. **Server Node (`server`)**: Application servers, browser drivers, HTTP bridges (Icon: `Server`).
6. **Database Node (`database`)**: PostgreSQL, MySQL, Redis, Vector DBs (Icon: `Database`).
7. **AI Model Node (`ai-model`)**: LLMs, Foundation models, Embeddings (Icon: `Cpu`).
8. **Agent Node (`agent`)**: Autonomous test agents, MCP clients, orchestrators (Icon: `Bot`).
9. **External Service Node (`external-service`)**: Third-party APIs, SaaS tools (Icon: `ExternalLink`).
10. **Queue Node (`queue`)**: RabbitMQ, Kafka, SQS asynchronous message buses (Icon: `ListOrdered`).
11. **Container Node (`container`)**: Docker, Kubernetes pods, BrowserContext isolation (Icon: `Box`).
12. **Monitoring Node (`monitoring`)**: APM, Prometheus, Grafana observability (Icon: `Activity`).
13. **Test Runner Node (`test-runner`)**: TestNG, JUnit 5, Playwright Runner (Icon: `Play`).
14. **Cloud Service Node (`cloud-service`)**: AWS, GCP, Azure infrastructure (Icon: `Cloud`).
15. **Security / Authentication Node (`security`)**: OAuth2, Keycloak, JWT, TLS terminators (Icon: `Shield`).

### Connection Protocols & Styles:
- **Synchronous (`sync`)**: Solid blue `#2563EB`.
- **Asynchronous (`async`)**: Dashed amber stroke `6 4`.
- **W3C WebDriver (`webdriver`)**: Solid blue `#2563EB` with `[W3C WebDriver]` badge.
- **WebSocket (`websocket`)**: Violet dashed stroke `4 4` with `[WebSocket]` badge.
- **HTTP / HTTPS (`http`, `https`)**: Solid emerald `#059669`.
- **Auth Flow (`auth-flow`)**: Rose dashed stroke `8 4`.

---

## 6. Layout Implementation (ELK.js)

The layout engine (`src/lib/diagram/elk-layout.ts`) executes Eclipse Layout Kernel's layered hierarchy algorithm:
- **Direction**: Supports Left-to-Right (`LR` / `DOWN`) and Top-to-Bottom (`TB` / `RIGHT`).
- **Node Collision Prevention**: Sets `elk.spacing.nodeNode = 60` and `nodeNodeBetweenLayers = 85`.
- **Edge Routing**: Employs `ORTHOGONAL` routing and `LAYER_SWEEP` crossing minimization.
- **Layer Bounding Boxes**: Automatically computes bounding rectangles encapsulating all member nodes with 36px comfortable internal padding and a distinct header pill.

---

## 7. Diagram Themes

6 predefined enterprise themes allow administrators to switch visual styling instantly without regenerating the architecture JSON:

1. **Clean Enterprise**: Slate palette, crisp borders, high contrast.
2. **Modern Technical**: Indigo & cyan highlights for cloud platforms.
3. **Cloud Architecture**: Sky & Cobalt accents (AWS/GCP/Azure standard).
4. **AI Architecture**: Emerald & violet accents for LLM & RAG pipelines.
5. **Automation Framework**: Emerald & teal accents for QA & CI/CD engines.
6. **Minimal Documentation**: Crisp monochrome technical drawing aesthetic.

---

## 8. Gemini Image-Generation Integration (Mode B)

For Mode B (Educational Technical Infographics):
- Uses dedicated image model: **`imagen-3.0-generate-002`** (Google AI Studio Imagen 3).
- **Separately configurable**: Configured via `GEMINI_IMAGE_MODEL` independently from text models.
- **Safety & Cost Guardrails**: Rate limited to maximum 5 requests/min. Displays estimated cost ($0.00 on Free Tier, $0.03/image on pay-as-you-go).
- **Persistent Storage**: Generates actual binary image files saved to `public/uploads/` and tracked in `cmsStore.saveMediaItem`. No temporary blob URLs.
- **Local Fallback**: Includes a standalone pure Node.js PNG rasterizer that guarantees 100% offline generation of high-resolution educational graphics when API keys are absent or quotas are reached.

---

## 9. Security & SVG Sanitization

All SVG outputs undergo sanitization (`src/lib/diagram/sanitizer.ts`) prior to storage or rendering:
- Strips `<script>`, `<iframe>`, `<object>`, `<embed>`, `<foreignObject>`.
- Removes all `on*` event handlers (`onload`, `onerror`, `onclick`, etc.).
- Neutralizes `javascript:`, `vbscript:`, and `data:text/html` URLs.
- Strips external DOCTYPE declarations and entity declarations to prevent XML External Entity (XXE) injection.

---

## 10. Verification & Test Scenarios

The test suite (`tests/phase11-diagram-engine.test.cjs`) verified all required scenarios:

| Test Scenario | Status | Key Validations |
| :--- | :--- | :--- |
| **TEST 1: Selenium Architecture** | **PASSED** | Test Script, Client Library, W3C Protocol, Browser Driver, Chrome Browser. Verified NO incorrect assumption of Selenium Grid in local execution. |
| **TEST 2: Playwright Architecture** | **PASSED** | Test Runner, Playwright API, WebSocket/CDP, Browser process, BrowserContext, Page Target. |
| **TEST 3: Appium Architecture** | **PASSED** | Test Client, Appium Server, WebDriver Protocol, Platform Driver (UiAutomator2/XCUITest), Mobile Device/Emulator. |
| **TEST 4: MCP Architecture** | **PASSED** | MCP Host, MCP Client, MCP Server, JSON-RPC 2.0, Tools & Resources. |
| **TEST 5: LLM Educational Infographic** | **PASSED** | Generated real binary PNG file (`image/png` header bytes `0x89 0x50 0x4E 0x47`), saved to `/uploads/`, verified NOT Mermaid or SVG text. |
| **TEST 6: Export & Publishing** | **PASSED** | SVG export, 2x Retina PNG export, SVG XSS sanitization, 6 themes rendering, Advisory AI Review. |
| **Extra: Schema Rejection** | **PASSED** | Duplicate node IDs and non-existent edge references are properly rejected with detailed Zod issues. |

Production build verification:
- `next build --webpack`: **Passed with exit code 0**. All 149 static pages and dynamic routes compiled cleanly.

---

## 11. Known Limitations & Future Enhancements

1. **Client-Side Rendering Requirement**: React Flow requires browser DOM APIs (`window`, `ResizeObserver`). The canvas component correctly includes `'use client'` and fallback SVG rendering for server-side environments.
2. **Complex Multi-Subnet Clustering**: Extremely large diagrams (>50 nodes) are best split into parent and drill-down sub-diagrams for optimal visual clarity.
