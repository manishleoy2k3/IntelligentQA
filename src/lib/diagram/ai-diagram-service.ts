import {
  ArchitectureDiagramData,
  DiagramReviewResult,
  DiagramReviewIssue,
} from '@/types/architecture-diagram';
import { validateArchitectureDiagram } from './schema';
import { calculateElkLayout } from './elk-layout';
import { generateArchitectureSvg } from './svg-generator';

const SYSTEM_ARCHITECTURE_DESIGNER = `ROLE AND RESPONSIBILITY
You are a Principal Software & QA Test Architecture Visualization Engineer.
Your job is to generate accurate, professional, enterprise-grade architecture diagram specifications in strictly valid JSON.

CRITICAL RULES:
1. NEVER invent non-existent components, libraries, protocols, or fake layers.
2. Accurately represent real-world enterprise architectures (e.g. Selenium WebDriver, Playwright, Appium, MCP, RAG, CI/CD, Microservices).
3. Distinguish local executions from distributed grids (e.g. do not assume Selenium Grid is part of standard local WebDriver execution).
4. Node IDs must be unique and descriptive (e.g., "test_script", "client_library", "browser_driver", "browser").
5. Every edge MUST have an existing source and target node ID.
6. Communication protocols MUST be technically accurate (e.g., "W3C WebDriver Protocol", "Chrome DevTools Protocol (CDP)", "WebSocket", "JSON-RPC 2.0", "HTTP/REST", "gRPC").
7. Group nodes logically into meaningful architectural layers (e.g., "client", "automation", "driver", "runtime", "data", "infrastructure").
8. Return ONLY raw JSON without markdown code fences or explanatory text.`;

export async function generateArchitectureFromPrompt(
  prompt: string,
  lessonContext?: { courseTitle?: string; moduleTitle?: string; lessonTitle?: string; currentContent?: string },
  apiKey?: string
): Promise<{
  success: boolean;
  diagramData: ArchitectureDiagramData;
  svg: string;
  source: 'gemini' | 'sdet-engine';
  error?: string;
}> {
  const normalized = prompt.toLowerCase();

  // If API key is provided, try calling Gemini 2.5/2.0/1.5 Flash
  if (apiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_ARCHITECTURE_DESIGNER }] },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `Generate a structured Architecture Diagram JSON for the following technical request:
Prompt: "${prompt}"
${lessonContext ? `Lesson Context:
- Course: "${lessonContext.courseTitle || ''}"
- Module: "${lessonContext.moduleTitle || ''}"
- Lesson: "${lessonContext.lessonTitle || ''}"
${lessonContext.currentContent ? `- Lesson Content Excerpt: "${lessonContext.currentContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 1500)}"` : ''}` : ''}

Output must adhere to this exact schema:
{
  "diagramType": "architecture",
  "title": "string",
  "description": "string",
  "layout": "layered",
  "direction": "LR",
  "theme": "clean-enterprise",
  "layers": [
    { "id": "layer_id", "label": "Layer Label", "description": "Layer role" }
  ],
  "nodes": [
    {
      "id": "node_id",
      "type": "client" | "browser" | "application" | "api" | "server" | "database" | "ai-model" | "agent" | "external-service" | "queue" | "container" | "monitoring" | "test-runner" | "cloud-service" | "security",
      "label": "Component Label",
      "shortDescription": "Role explanation",
      "technology": "Technology name (e.g. Java, TypeScript, Node.js)",
      "layer": "layer_id"
    }
  ],
  "edges": [
    {
      "id": "edge_id",
      "source": "source_node_id",
      "target": "target_node_id",
      "label": "Communication label",
      "protocol": "Protocol name (e.g. W3C WebDriver, HTTP/REST, CDP, JSON-RPC)",
      "communicationType": "sync" | "async" | "http" | "https" | "websocket" | "webdriver" | "api" | "data-flow" | "event-flow" | "auth-flow" | "dependency",
      "style": "solid" | "dashed" | "dotted"
    }
  ],
  "legend": [
    { "label": "Legend title", "description": "Role" }
  ],
  "technicalNotes": ["Key architectural notes"]
}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        const jsonRes = await response.json();
        const textContent = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (textContent) {
          const parsed = JSON.parse(textContent);
          const validation = validateArchitectureDiagram(parsed);
          if (validation.success && validation.data) {
            const layout = await calculateElkLayout(validation.data as any);
            const svg = generateArchitectureSvg(validation.data as any, layout);
            return {
              success: true,
              diagramData: validation.data as any,
              svg,
              source: 'gemini',
            };
          }
        }
      }
    } catch (geminiErr) {
      console.warn('[ai-diagram-service] Gemini generation error, using SDET engine:', geminiErr);
    }
  }

  // High-Fidelity SDET Architecture Generation Engine (Offline & Fallback)
  const diagramData = generateSdetArchitectureTemplate(prompt, lessonContext);
  const layout = await calculateElkLayout(diagramData);
  const svg = generateArchitectureSvg(diagramData, layout);

  return {
    success: true,
    diagramData,
    svg,
    source: 'sdet-engine',
  };
}

/**
 * SDET Architecture Template Engine
 * Produces 100% verified, technically accurate architectures for QA, SDET, and AI systems.
 */
export function generateSdetArchitectureTemplate(
  prompt: string,
  context?: { courseTitle?: string; moduleTitle?: string; lessonTitle?: string; currentContent?: string }
): ArchitectureDiagramData {
  const cleanContent = context?.currentContent ? context.currentContent.replace(/<[^>]+>/g, ' ') : '';
  const p = `${prompt} ${context?.lessonTitle || ''} ${context?.moduleTitle || ''} ${context?.courseTitle || ''} ${cleanContent}`.toLowerCase();

  // SCENARIO 1: Selenium Architecture
  if (p.includes('selenium') || p.includes('webdriver')) {
    return {
      diagramType: 'architecture',
      title: 'Selenium WebDriver Architecture',
      description: 'End-to-end W3C WebDriver communication flow from Test Code to Native Browser Engine',
      layout: 'layered',
      direction: 'LR',
      theme: 'automation-framework',
      layers: [
        { id: 'automation-layer', label: 'Test Automation Layer', description: 'Test scripts and language bindings' },
        { id: 'driver-layer', label: 'Browser Driver Layer', description: 'Native binary bridge' },
        { id: 'browser-layer', label: 'Browser Engine Layer', description: 'Target browser processes' },
      ],
      nodes: [
        {
          id: 'test_script',
          type: 'client',
          label: 'Test Script',
          technology: 'Java / TestNG',
          shortDescription: 'Executes test scenarios & assertions',
          layer: 'automation-layer',
        },
        {
          id: 'selenium_client',
          type: 'application',
          label: 'Selenium Client Library',
          technology: 'Selenium Java 4.x',
          shortDescription: 'Translates test commands to W3C JSON payload',
          layer: 'automation-layer',
        },
        {
          id: 'browser_driver',
          type: 'server',
          label: 'Browser Driver',
          technology: 'ChromeDriver / GeckoDriver',
          shortDescription: 'Lightweight HTTP server interpreting W3C commands',
          layer: 'driver-layer',
        },
        {
          id: 'chrome_browser',
          type: 'browser',
          label: 'Chrome Browser',
          technology: 'Chromium Engine',
          shortDescription: 'Executes actions directly in the DOM',
          layer: 'browser-layer',
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'test_script',
          target: 'selenium_client',
          label: 'Method Invocations',
          protocol: 'Java API',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'e2',
          source: 'selenium_client',
          target: 'browser_driver',
          label: 'WebDriver Commands',
          protocol: 'W3C WebDriver Protocol (HTTP/JSON)',
          communicationType: 'webdriver',
          style: 'solid',
        },
        {
          id: 'e3',
          source: 'browser_driver',
          target: 'chrome_browser',
          label: 'Native OS Events',
          protocol: 'DevTools / Native Socket',
          communicationType: 'sync',
          style: 'solid',
        },
      ],
      legend: [
        { label: 'Language Bindings', color: '#16A34A' },
        { label: 'W3C Protocol', color: '#2563EB' },
        { label: 'Native Browser', color: '#059669' },
      ],
      technicalNotes: [
        'Selenium 4 enforces W3C standard compliance across all drivers.',
        'Local execution does not require Selenium Grid or standalone server jars.',
        'Communication between language bindings and driver is purely over HTTP REST.',
      ],
    };
  }

  // SCENARIO 2: Playwright Architecture
  if (p.includes('playwright')) {
    return {
      diagramType: 'architecture',
      title: 'Playwright Unified Process Architecture',
      description: 'Single WebSocket connection driving multiple isolated BrowserContexts and Pages',
      layout: 'layered',
      direction: 'LR',
      theme: 'modern-technical',
      layers: [
        { id: 'client-layer', label: 'Test Runner Layer', description: 'Test execution process' },
        { id: 'driver-layer', label: 'Playwright Server Layer', description: 'Node.js driver process' },
        { id: 'browser-layer', label: 'Browser Hierarchy Layer', description: 'Browser, contexts, and pages' },
      ],
      nodes: [
        {
          id: 'test_runner',
          type: 'test-runner',
          label: 'Test Runner',
          technology: 'Playwright Test Runner',
          shortDescription: 'Orchestrates workers, fixtures, and assertions',
          layer: 'client-layer',
        },
        {
          id: 'playwright_api',
          type: 'application',
          label: 'Playwright Client API',
          technology: 'TypeScript / Node.js',
          shortDescription: 'High-level user automation API',
          layer: 'client-layer',
        },
        {
          id: 'browser_process',
          type: 'browser',
          label: 'Browser Instance',
          technology: 'Chromium / Firefox / WebKit',
          shortDescription: 'Single headless or headed browser process',
          layer: 'browser-layer',
        },
        {
          id: 'browser_context',
          type: 'container',
          label: 'BrowserContext',
          technology: 'Incognito Isolation',
          shortDescription: 'Fast, isolated session with private cookies & storage',
          layer: 'browser-layer',
        },
        {
          id: 'page_target',
          type: 'browser',
          label: 'Page Target',
          technology: 'Tab / Frame DOM',
          shortDescription: 'Single tab executing auto-waiting actions',
          layer: 'browser-layer',
        },
      ],
      edges: [
        {
          id: 'pw_e1',
          source: 'test_runner',
          target: 'playwright_api',
          label: 'Test Execution',
          protocol: 'TypeScript API',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'pw_e2',
          source: 'playwright_api',
          target: 'browser_process',
          label: 'Bi-directional Channel',
          protocol: 'WebSocket / Pipe (CDP)',
          communicationType: 'websocket',
          style: 'solid',
        },
        {
          id: 'pw_e3',
          source: 'browser_process',
          target: 'browser_context',
          label: 'Creates Session',
          protocol: 'Internal Process Bridge',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'pw_e4',
          source: 'browser_context',
          target: 'page_target',
          label: 'Spawns Tab',
          protocol: 'Frame Tree Protocol',
          communicationType: 'sync',
          style: 'solid',
        },
      ],
      legend: [
        { label: 'Runner Process', color: '#4F46E5' },
        { label: 'WebSocket Stream', color: '#7C3AED' },
        { label: 'Browser Hierarchy', color: '#059669' },
      ],
      technicalNotes: [
        'Playwright communicates via a single multiplexed WebSocket connection without per-command HTTP overhead.',
        'BrowserContext creation takes milliseconds and guarantees complete test isolation.',
      ],
    };
  }

  // SCENARIO 3: Appium Architecture
  if (p.includes('appium') || p.includes('mobile')) {
    return {
      diagramType: 'architecture',
      title: 'Appium 2.x Mobile Automation Architecture',
      description: 'Decoupled Server, Platform Drivers and Native Mobile Device Automation Agents',
      layout: 'layered',
      direction: 'LR',
      theme: 'clean-enterprise',
      layers: [
        { id: 'client-layer', label: 'Client Automation Layer', description: 'Test client language bindings' },
        { id: 'server-layer', label: 'Appium Server Layer', description: 'Node.js REST server & plugins' },
        { id: 'driver-layer', label: 'Driver Engine Layer', description: 'Platform driver & mobile agent' },
        { id: 'device-layer', label: 'Mobile Device Layer', description: 'Target emulator or physical device' },
      ],
      nodes: [
        {
          id: 'test_client',
          type: 'client',
          label: 'Test Client',
          technology: 'Java / Python / JS',
          shortDescription: 'Appium Client Library issuing mobile commands',
          layer: 'client-layer',
        },
        {
          id: 'appium_server',
          type: 'server',
          label: 'Appium Server',
          technology: 'Appium 2.x (Node.js)',
          shortDescription: 'REST router managing sessions and plugins',
          layer: 'server-layer',
        },
        {
          id: 'platform_driver',
          type: 'application',
          label: 'Platform Driver',
          technology: 'UiAutomator2 / XCUITest',
          shortDescription: 'Platform-specific automation translation driver',
          layer: 'driver-layer',
        },
        {
          id: 'target_device',
          type: 'client',
          label: 'Target Device / Emulator',
          technology: 'Android / iOS Device',
          shortDescription: 'Executes native accessibility actions',
          layer: 'device-layer',
        },
      ],
      edges: [
        {
          id: 'ap_e1',
          source: 'test_client',
          target: 'appium_server',
          label: 'Mobile Commands',
          protocol: 'W3C WebDriver Protocol (HTTP/JSON)',
          communicationType: 'webdriver',
          style: 'solid',
        },
        {
          id: 'ap_e2',
          source: 'appium_server',
          target: 'platform_driver',
          label: 'Driver Delegation',
          protocol: 'Driver Plugin IPC',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'ap_e3',
          source: 'platform_driver',
          target: 'target_device',
          label: 'Instrumentation Bridge',
          protocol: 'ADB Socket / Usbmuxd',
          communicationType: 'sync',
          style: 'solid',
        },
      ],
      legend: [
        { label: 'Client Command', color: '#2563EB' },
        { label: 'Server Routing', color: '#475569' },
        { label: 'Device Bridge', color: '#059669' },
      ],
      technicalNotes: [
        'Appium 2.0 completely decoupled platform drivers from the core server.',
        'UiAutomator2 server runs as an instrumented APK on the Android device.',
        'XCUITest driver uses WebDriverAgent running on iOS devices via Xcode.',
      ],
    };
  }

  // SCENARIO 4: Model Context Protocol (MCP) Architecture
  if (p.includes('mcp') || p.includes('model context protocol')) {
    return {
      diagramType: 'architecture',
      title: 'Model Context Protocol (MCP) Architecture',
      description: 'Standardized client-server protocol enabling LLMs to securely query external tools and data',
      layout: 'layered',
      direction: 'LR',
      theme: 'ai-architecture',
      layers: [
        { id: 'host-layer', label: 'MCP Host Layer', description: 'Application hosting the AI model' },
        { id: 'client-layer', label: 'MCP Client Layer', description: 'Protocol client maintaining 1:1 server sessions' },
        { id: 'server-layer', label: 'MCP Server Layer', description: 'Resource & tool providers' },
        { id: 'integration-layer', label: 'External Systems', description: 'Live databases, APIs & test engines' },
      ],
      nodes: [
        {
          id: 'mcp_host',
          type: 'ai-model',
          label: 'MCP Host Application',
          technology: 'Claude Desktop / Antigravity IDE',
          shortDescription: 'Hosts the LLM and coordinates human-in-the-loop interactions',
          layer: 'host-layer',
        },
        {
          id: 'mcp_client',
          type: 'agent',
          label: 'MCP Client',
          technology: 'MCP SDK (TypeScript / Python)',
          shortDescription: 'Establishes connections, discovers capabilities & routes calls',
          layer: 'client-layer',
        },
        {
          id: 'mcp_server',
          type: 'server',
          label: 'MCP Server',
          technology: 'Local Stdio / SSE Server',
          shortDescription: 'Exposes Tools, Resources, and Prompts to the client',
          layer: 'server-layer',
        },
        {
          id: 'tools_resources',
          type: 'database',
          label: 'Tools & Enterprise Systems',
          technology: 'Jira / GitHub / Test Database',
          shortDescription: 'Target execution environments and context sources',
          layer: 'integration-layer',
        },
      ],
      edges: [
        {
          id: 'mcp_e1',
          source: 'mcp_host',
          target: 'mcp_client',
          label: 'User Query & Context Needs',
          protocol: 'Internal Host API',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'mcp_e2',
          source: 'mcp_client',
          target: 'mcp_server',
          label: 'JSON-RPC 2.0 Messages',
          protocol: 'Stdio / HTTP SSE',
          communicationType: 'sync',
          style: 'solid',
        },
        {
          id: 'mcp_e3',
          source: 'mcp_server',
          target: 'tools_resources',
          label: 'Tool Execution & Retrieval',
          protocol: 'REST / GraphQL / SQL',
          communicationType: 'api',
          style: 'solid',
        },
      ],
      legend: [
        { label: 'Host System', color: '#9333EA' },
        { label: 'MCP Protocol', color: '#059669' },
        { label: 'Enterprise Systems', color: '#D97706' },
      ],
      technicalNotes: [
        'MCP establishes a standard open protocol for context delivery to LLMs.',
        'Communication uses JSON-RPC 2.0 over standard I/O or Server-Sent Events (SSE).',
        'Servers expose three core capabilities: Prompts, Resources (data), and Tools (functions).',
      ],
    };
  }

  // DEFAULT / GENERAL QA ARCHITECTURE
  return {
    diagramType: 'architecture',
    title: prompt.length > 5 ? prompt : 'QA Test Automation Architecture',
    description: 'Enterprise quality engineering and test execution architecture',
    layout: 'layered',
    direction: 'LR',
    theme: 'clean-enterprise',
    layers: [
      { id: 'client-layer', label: 'Test Execution Layer' },
      { id: 'service-layer', label: 'API & Service Layer' },
      { id: 'data-layer', label: 'Persistence Layer' },
    ],
    nodes: [
      {
        id: 'test_engine',
        type: 'test-runner',
        label: 'Test Automation Engine',
        technology: 'JUnit 5 / TestNG',
        shortDescription: 'Executes integration and API test cases',
        layer: 'client-layer',
      },
      {
        id: 'api_gateway',
        type: 'api',
        label: 'API Gateway',
        technology: 'Spring Cloud Gateway / Envoy',
        shortDescription: 'Routes requests & enforces auth policies',
        layer: 'service-layer',
      },
      {
        id: 'database_store',
        type: 'database',
        label: 'Data Store',
        technology: 'PostgreSQL / Redis',
        shortDescription: 'Stores transactional entity records',
        layer: 'data-layer',
      },
    ],
    edges: [
      {
        id: 'def_e1',
        source: 'test_engine',
        target: 'api_gateway',
        label: 'API Requests',
        protocol: 'HTTP/REST',
        communicationType: 'http',
        style: 'solid',
      },
      {
        id: 'def_e2',
        source: 'api_gateway',
        target: 'database_store',
        label: 'Data Queries',
        protocol: 'TCP / Connection Pool',
        communicationType: 'data-flow',
        style: 'solid',
      },
    ],
    legend: [
      { label: 'Test Execution', color: '#16A34A' },
      { label: 'Services', color: '#4F46E5' },
      { label: 'Database', color: '#D97706' },
    ],
  };
}

/**
 * Advisory AI Technical Review Step
 * Reviews architecture diagram data for completeness, correct protocols, and SDET accuracy.
 */
export function reviewArchitectureDiagram(
  diagram: ArchitectureDiagramData
): DiagramReviewResult {
  const issues: DiagramReviewIssue[] = [];
  const nodeMap = new Map(diagram.nodes.map((n) => [n.id, n]));

  // Check 1: Disconnected nodes
  const connectedNodes = new Set<string>();
  diagram.edges.forEach((edge) => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  diagram.nodes.forEach((node) => {
    if (!connectedNodes.has(node.id)) {
      issues.push({
        severity: 'warning',
        category: 'ambiguous-connection',
        message: `Node "${node.label}" (${node.id}) is disconnected. Every architectural component should participate in communication or dependency relationships.`,
        nodeIds: [node.id],
        suggestion: `Connect ${node.label} to its caller or upstream dependency.`,
      });
    }
  });

  // Check 2: Selenium Protocol validation
  const isSelenium = diagram.title.toLowerCase().includes('selenium');
  if (isSelenium) {
    const hasClient = diagram.nodes.some((n) => n.id.toLowerCase().includes('client') || n.label.toLowerCase().includes('selenium'));
    const hasDriver = diagram.nodes.some((n) => n.id.toLowerCase().includes('driver') || n.label.toLowerCase().includes('driver'));
    const hasBrowser = diagram.nodes.some((n) => n.id.toLowerCase().includes('chrome') || n.label.toLowerCase().includes('browser') || n.type === 'browser');

    if (!hasDriver) {
      issues.push({
        severity: 'error',
        category: 'missing-component',
        message: 'Missing Browser Driver component (e.g. ChromeDriver). Selenium cannot drive browsers without an intermediate driver binary.',
        suggestion: 'Add a Browser Driver node between the client library and browser.',
      });
    }

    // Check if W3C WebDriver Protocol is labeled on the client-driver edge
    const clientDriverEdge = diagram.edges.find((e) => {
      const src = nodeMap.get(e.source)?.label.toLowerCase() || '';
      const tgt = nodeMap.get(e.target)?.label.toLowerCase() || '';
      return src.includes('selenium') && tgt.includes('driver');
    });

    if (clientDriverEdge && (!clientDriverEdge.protocol || !clientDriverEdge.protocol.toLowerCase().includes('webdriver'))) {
      issues.push({
        severity: 'warning',
        category: 'protocol',
        message: 'The communication between Selenium Client and Browser Driver should specify "W3C WebDriver Protocol".',
        edgeIds: [clientDriverEdge.id],
        suggestion: 'Update protocol to "W3C WebDriver Protocol".',
      });
    }

    // Check for erroneous Selenium Grid assumption
    const hasGrid = diagram.nodes.some((n) => n.label.toLowerCase().includes('grid') || n.id.toLowerCase().includes('grid'));
    if (hasGrid && !diagram.title.toLowerCase().includes('grid')) {
      issues.push({
        severity: 'info',
        category: 'assumption',
        message: 'Selenium Grid is included in a standard local WebDriver diagram. Local execution connects directly to the local browser driver without Grid.',
        suggestion: 'Verify if Grid is required for this specific lesson scenario.',
      });
    }
  }

  // Check 3: Playwright Architecture verification
  const isPlaywright = diagram.title.toLowerCase().includes('playwright');
  if (isPlaywright) {
    const hasBrowser = diagram.nodes.some((n) => n.label.toLowerCase().includes('browser'));
    const hasContext = diagram.nodes.some((n) => n.label.toLowerCase().includes('context'));
    const hasPage = diagram.nodes.some((n) => n.label.toLowerCase().includes('page'));

    if (!hasContext) {
      issues.push({
        severity: 'warning',
        category: 'missing-component',
        message: 'Missing "BrowserContext" node. BrowserContext is Playwright\'s core isolation unit between the Browser and Page.',
        suggestion: 'Add BrowserContext to highlight Playwright\'s browser process hierarchy.',
      });
    }
  }

  // Check 4: MCP Architecture verification
  const isMcp = diagram.title.toLowerCase().includes('mcp') || diagram.title.toLowerCase().includes('model context');
  if (isMcp) {
    const hasHost = diagram.nodes.some((n) => n.label.toLowerCase().includes('host'));
    const hasClient = diagram.nodes.some((n) => n.label.toLowerCase().includes('client'));
    const hasServer = diagram.nodes.some((n) => n.label.toLowerCase().includes('server'));

    if (!hasHost || !hasClient || !hasServer) {
      issues.push({
        severity: 'warning',
        category: 'missing-component',
        message: 'MCP Architecture standard requires: MCP Host, MCP Client, and MCP Server.',
        suggestion: 'Ensure all three distinct tiers (Host, Client, Server) are explicitly modeled.',
      });
    }
  }

  const score = Math.max(100 - issues.filter((i) => i.severity === 'error').length * 30 - issues.filter((i) => i.severity === 'warning').length * 10, 60);

  return {
    passed: !issues.some((i) => i.severity === 'error'),
    score,
    summary: issues.length === 0
      ? 'Architecture diagram adheres to enterprise standards with verified components and protocols.'
      : `Identified ${issues.length} technical advisory observation(s) across components and protocol semantics.`,
    issues,
  };
}
