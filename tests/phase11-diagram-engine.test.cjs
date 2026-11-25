/**
 * Phase 11: Professional AI-Powered Architecture Diagram Generation Engine Test Suite
 *
 * Verifies all 6 required scenarios and technical architectural requirements:
 * TEST 1: Selenium Architecture (Local WebDriver, Test Script, Client, W3C Protocol, Browser Driver, Browser)
 * TEST 2: Playwright Architecture (Test Runner, API, Browser, BrowserContext, Page, Processes)
 * TEST 3: Appium Architecture (Test Client, Appium Server, WebDriver Protocol, Platform Driver, Device/Emulator)
 * TEST 4: MCP Architecture (MCP Host, MCP Client, MCP Server, Tools, Resources, Prompts)
 * TEST 5: LLM Educational Infographic (Real PNG image file, persistent media storage, not Mermaid or SVG)
 * TEST 6: Export, SVG Sanitization, Tiptap Insertion & Publishing Integrity
 */

process.env.NODE_ENV = 'test';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const jiti = require('jiti')(__filename, {
  alias: {
    '@': path.join(process.cwd(), 'src'),
  },
});

const { validateArchitectureDiagram } = jiti('../src/lib/diagram/schema.ts');
const { THEME_CONFIGS, NODE_TYPE_PALETTES, PROTOCOL_STYLES } = jiti('../src/lib/diagram/themes.ts');
const { calculateElkLayout } = jiti('../src/lib/diagram/elk-layout.ts');
const { generateArchitectureSvg } = jiti('../src/lib/diagram/svg-generator.ts');
const { sanitizeSvg } = jiti('../src/lib/diagram/sanitizer.ts');
const { generateSdetArchitectureTemplate, reviewArchitectureDiagram } = jiti(
  '../src/lib/diagram/ai-diagram-service.ts'
);
const { generateEducationalInfographic, DEFAULT_GEMINI_IMAGE_MODEL } = jiti(
  '../src/lib/diagram/image-generation.ts'
);
const { generateHighFidelityInfographicSvg } = jiti('../src/lib/diagram/infographic-templates.ts');
const { QA_TECHNICAL_CONTENT_ARCHITECT } = jiti('../src/lib/ai/system-instructions.ts');

describe('Phase 11: Architecture Diagram Generation Engine Verification', () => {
  // -------------------------------------------------------------
  // TEST 1: Selenium Architecture Scenario
  // -------------------------------------------------------------
  it('TEST 1: Selenium Architecture — Professional WebDriver Specification', async () => {
    const data = generateSdetArchitectureTemplate('Selenium Architecture');

    // 1. Validate Schema
    const validation = validateArchitectureDiagram(data);
    assert.strictEqual(validation.success, true, `Validation failed: ${validation.error}`);

    // 2. Verify Required Nodes
    const nodeIds = data.nodes.map((n) => n.id);
    const nodeLabels = data.nodes.map((n) => n.label.toLowerCase());

    assert.ok(nodeIds.includes('test_script'), 'Must include Test Script node');
    assert.ok(
      nodeLabels.some((l) => l.includes('selenium') && l.includes('client')),
      'Must include Selenium Client Library'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('browser driver') || l.includes('chromedriver')),
      'Must include Browser Driver node'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('chrome browser') || l.includes('browser')),
      'Must include Browser node'
    );

    // 3. Verify No Erroneous Selenium Grid Assumption
    assert.ok(
      !nodeLabels.some((l) => l.includes('grid')),
      'Must NOT assume Selenium Grid is part of standard local WebDriver architecture'
    );

    // 4. Verify W3C WebDriver Protocol on communication edges
    const driverEdge = data.edges.find(
      (e) => e.target === 'browser_driver' || e.source === 'selenium_client'
    );
    assert.ok(driverEdge, 'Must have edge connecting to browser driver');
    assert.match(driverEdge.protocol || '', /WebDriver/i, 'Must specify W3C WebDriver Protocol');

    // 5. Layout & Standalone SVG Generation
    const layout = await calculateElkLayout(data);
    assert.ok(layout.width > 0 && layout.height > 0, 'Layout dimensions must be positive');
    assert.strictEqual(
      layout.nodes.length,
      data.nodes.length,
      'All nodes must be positioned by ELK'
    );

    const svg = generateArchitectureSvg(data, layout);
    assert.ok(svg.includes('<svg'), 'Generated output must be valid SVG');
    assert.ok(svg.includes('Selenium WebDriver Architecture'), 'SVG must include diagram title');
    assert.ok(svg.includes('WebDriver'), 'SVG must render protocol label');
  });

  // -------------------------------------------------------------
  // TEST 2: Playwright Architecture Scenario
  // -------------------------------------------------------------
  it('TEST 2: Playwright Architecture — Process & Hierarchy Verification', async () => {
    const data = generateSdetArchitectureTemplate('Playwright Architecture');

    const validation = validateArchitectureDiagram(data);
    assert.strictEqual(validation.success, true, `Validation failed: ${validation.error}`);

    const nodeLabels = data.nodes.map((n) => n.label.toLowerCase());

    assert.ok(
      nodeLabels.some((l) => l.includes('test runner')),
      'Must include Test Runner'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('playwright') && l.includes('api')),
      'Must include Playwright Client API'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('browser instance') || l.includes('browser process')),
      'Must include Browser process'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('browsercontext')),
      'Must include BrowserContext'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('page')),
      'Must include Page'
    );

    // Verify WebSocket / CDP protocol
    const wsEdge = data.edges.find(
      (e) => e.communicationType === 'websocket' || (e.protocol && e.protocol.includes('WebSocket'))
    );
    assert.ok(wsEdge, 'Must use WebSocket bi-directional communication to drive browser processes');

    const layout = await calculateElkLayout(data);
    const svg = generateArchitectureSvg(data, layout);
    assert.ok(svg.includes('BrowserContext'), 'SVG must render BrowserContext component');
  });

  // -------------------------------------------------------------
  // TEST 3: Appium Architecture Scenario
  // -------------------------------------------------------------
  it('TEST 3: Appium Architecture — Mobile Decoupled Driver Verification', async () => {
    const data = generateSdetArchitectureTemplate('Appium Mobile Architecture');

    const validation = validateArchitectureDiagram(data);
    assert.strictEqual(validation.success, true, `Validation failed: ${validation.error}`);

    const nodeLabels = data.nodes.map((n) => n.label.toLowerCase());

    assert.ok(
      nodeLabels.some((l) => l.includes('test client')),
      'Must include Test Client'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('appium server')),
      'Must include Appium Server'
    );
    assert.ok(
      nodeLabels.some(
        (l) => l.includes('platform driver') || l.includes('uiautomator2') || l.includes('xcuitest')
      ),
      'Must include Platform Driver'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('device') || l.includes('emulator')),
      'Must include Mobile Device or Emulator'
    );

    const layout = await calculateElkLayout(data);
    const svg = generateArchitectureSvg(data, layout);
    assert.ok(svg.includes('Appium Server'), 'SVG must render Appium Server');
  });

  // -------------------------------------------------------------
  // TEST 4: MCP Architecture Scenario
  // -------------------------------------------------------------
  it('TEST 4: MCP Architecture — Model Context Protocol Standards', async () => {
    const data = generateSdetArchitectureTemplate('Model Context Protocol (MCP) Architecture');

    const validation = validateArchitectureDiagram(data);
    assert.strictEqual(validation.success, true, `Validation failed: ${validation.error}`);

    const nodeLabels = data.nodes.map((n) => n.label.toLowerCase());

    assert.ok(
      nodeLabels.some((l) => l.includes('mcp host')),
      'Must include MCP Host'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('mcp client')),
      'Must include MCP Client'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('mcp server')),
      'Must include MCP Server'
    );
    assert.ok(
      nodeLabels.some((l) => l.includes('tools') || l.includes('resources')),
      'Must include Tools and Resources'
    );

    // Edge protocols
    const rpcEdge = data.edges.find((e) => e.source === 'mcp_client' && e.target === 'mcp_server');
    assert.ok(rpcEdge, 'Must connect MCP Client to MCP Server');
    assert.match(
      rpcEdge.protocol || '',
      /JSON-RPC|Stdio|SSE/i,
      'Must use standard JSON-RPC protocol'
    );

    const layout = await calculateElkLayout(data);
    const svg = generateArchitectureSvg(data, layout);
    assert.ok(svg.includes('MCP Host Application'), 'SVG must render MCP Host');
  });

  // -------------------------------------------------------------
  // TEST 5: Educational Technical Infographic Generation & Fidelity Verification
  // -------------------------------------------------------------
  it('TEST 5: LLM Educational Infographic — Persistent High-Resolution Image File Generation', async () => {
    assert.strictEqual(
      DEFAULT_GEMINI_IMAGE_MODEL,
      'imagen-3.0-generate-002',
      'Image model must default to imagen-3.0-generate-002'
    );

    const result = await generateEducationalInfographic({
      prompt: 'What is an LLM?',
      subject: 'Large Language Models for QA Engineers',
      targetLearner: 'QA Automation Engineers and SDETs',
      technicalSections: [
        'Training Data',
        'Tokenization',
        'Embeddings',
        'Transformer Architecture',
        'Self-Attention',
        'Feed-Forward Networks',
        'Next-Token Prediction',
      ],
    });

    assert.strictEqual(result.success, true, 'Infographic generation must succeed');
    assert.ok(result.imageUrl, 'Must return a media URL');
    assert.ok(result.imageUrl.startsWith('/uploads/'), 'Must save to persistent /uploads/ storage');
    assert.ok(result.imageUrl.endsWith('.png'), 'Output must be a PNG image file');

    // 1. Verify physical PNG binary exists on disk and has substantial high-resolution payload
    const filePath = path.join(process.cwd(), 'public', result.imageUrl);
    assert.ok(fs.existsSync(filePath), `Physical image file must exist at ${filePath}`);

    const fileBuffer = fs.readFileSync(filePath);
    // Real rendered graphics with typography, diagrams, and cards are substantial (> 15 KB), NEVER a blank 500-byte mockup!
    assert.ok(
      fileBuffer.length > 15000,
      `Image file size must be high-resolution and substantial (>15KB), got ${fileBuffer.length} bytes`
    );

    // PNG Magic Header check (89 50 4E 47 0D 0A 1A 0A)
    assert.strictEqual(fileBuffer[0], 0x89, 'Byte 0 must be 0x89');
    assert.strictEqual(fileBuffer[1], 0x50, 'Byte 1 must be 0x50 (P)');
    assert.strictEqual(fileBuffer[2], 0x4e, 'Byte 2 must be 0x4E (N)');
    assert.strictEqual(fileBuffer[3], 0x47, 'Byte 3 must be 0x47 (G)');

    // 2. Verify companion vector SVG exists on disk and contains actual educational content
    const svgFilePath = filePath.replace('.png', '.svg');
    assert.ok(
      fs.existsSync(svgFilePath),
      'Must create companion SVG file for 100% vector fidelity'
    );

    const svgContent = fs.readFileSync(svgFilePath, 'utf-8');
    assert.ok(svgContent.includes('Large Language Models'), 'Infographic must render title');
    assert.ok(
      svgContent.includes('PHASE 01') && svgContent.includes('Tokens'),
      'Must include Tokenization section'
    );
    assert.ok(
      svgContent.includes('PHASE 03') && svgContent.includes('Self-Attention'),
      'Must include Self-Attention section'
    );
    assert.ok(svgContent.includes('softmax'), 'Must include mathematical attention formula');
    assert.ok(svgContent.includes('SDET / QA Implication'), 'Must include QA takeaways');
    assert.ok(!svgContent.includes('graph TD'), 'Must NOT be Mermaid code');

    // 3. Verify Test Pyramid Infographic generation fidelity
    const pyramidSvg = generateHighFidelityInfographicSvg({
      prompt: 'Test Automation Pyramid',
      targetLearner: 'QA Automation Engineers and SDETs',
    });
    assert.ok(
      pyramidSvg.includes('Enterprise Test Automation Pyramid'),
      'Pyramid must render header'
    );
    assert.ok(pyramidSvg.includes('E2E UI TESTS'), 'Pyramid must render E2E UI tier');
    assert.ok(pyramidSvg.includes('API &amp; INTEGRATION'), 'Pyramid must render API tier');
    assert.ok(pyramidSvg.includes('UNIT TESTS'), 'Pyramid must render Unit tier');
    assert.ok(
      pyramidSvg.includes('Playwright') || pyramidSvg.includes('Selenium'),
      'Must include real automation tools'
    );
    assert.ok(
      pyramidSvg.includes('TIER METRIC COMPARISON MATRIX'),
      'Must include trade-off matrix'
    );

    // 4. Verify Tokenization Infographic generation fidelity
    const tokenSvg = generateHighFidelityInfographicSvg({
      prompt: 'What is Tokenization?',
      targetLearner: 'SDETs',
    });
    assert.ok(
      tokenSvg.includes('Tokenization Mechanics'),
      'Tokenization infographic must render title'
    );
    assert.ok(tokenSvg.includes('BPE SUBWORDS'), 'Must render BPE subword segmentation');
    assert.ok(tokenSvg.includes('VOCABULARY IDS'), 'Must render token lookup IDs');
    assert.ok(tokenSvg.includes('DENSE EMBEDDINGS'), 'Must render embedding vectors');

    // 5. Verify Self-Attention Infographic generation fidelity
    const attentionSvg = generateHighFidelityInfographicSvg({
      prompt: 'What is Self-Attention?',
      targetLearner: 'SDETs',
    });
    assert.ok(
      attentionSvg.includes('Transformer Self-Attention'),
      'Self-attention must render title'
    );
    assert.ok(attentionSvg.includes('QUERY VECTOR (Q)'), 'Must render Query vector section');
    assert.ok(attentionSvg.includes('KEY VECTOR (K)'), 'Must render Key vector section');
    assert.ok(attentionSvg.includes('VALUE VECTOR (V)'), 'Must render Value vector section');
  });

  // -------------------------------------------------------------
  // TEST 5B: Multi-Concept Infographic Fidelity — Generates High-Resolution Visuals for All Core Topics
  // -------------------------------------------------------------
  it('TEST 5B: Multi-Concept Infographic Fidelity — Generates High-Resolution Visuals for All Core Topics', async () => {
    const topics = [
      { prompt: 'What is Tokenization?', expectedText: 'Tokenization Mechanics' },
      { prompt: 'What is Self-Attention?', expectedText: 'Transformer Self-Attention' },
      { prompt: 'Test Automation Pyramid', expectedText: 'Enterprise Test Automation Pyramid' },
      { prompt: 'How API Authentication Works', expectedText: 'API Authentication Architecture' },
      { prompt: 'RAG Pipeline Architecture', expectedText: 'Retrieval-Augmented Generation' },
    ];

    for (const item of topics) {
      const res = await generateEducationalInfographic({
        prompt: item.prompt,
        targetLearner: 'QA Engineers',
      });
      assert.strictEqual(res.success, true);
      assert.ok(res.imageUrl.endsWith('.png'));

      const filePath = path.join(process.cwd(), 'public', res.imageUrl);
      assert.ok(fs.existsSync(filePath));
      const buf = fs.readFileSync(filePath);
      assert.ok(
        buf.length > 15000,
        `File size for "${item.prompt}" must be high-resolution (>15KB), got ${buf.length}`
      );

      const svgPath = filePath.replace('.png', '.svg');
      assert.ok(fs.existsSync(svgPath));
      const svg = fs.readFileSync(svgPath, 'utf-8');
      assert.ok(svg.includes(item.expectedText), `SVG must contain "${item.expectedText}"`);
    }
  });

  // -------------------------------------------------------------
  // TEST 6: Export, SVG Sanitization, Tiptap Insertion & Publishing
  // -------------------------------------------------------------
  it('TEST 6: Export and Publishing — SVG & PNG Integrity with Security Sanitization', async () => {
    const data = generateSdetArchitectureTemplate('Selenium Architecture');
    const layout = await calculateElkLayout(data);
    const rawSvg = generateArchitectureSvg(data, layout);

    // 1. Export as SVG
    assert.ok(rawSvg.includes('viewBox="0 0'), 'SVG must include viewBox');
    assert.ok(rawSvg.includes('IntelligentQA Architecture'), 'SVG must include watermark');

    // 2. SVG Sanitization Security Test
    const maliciousSvg =
      rawSvg +
      '<script>alert("xss")</script><a href="javascript:steal()"><rect onload="hack()"/></a>';
    const sanitized = sanitizeSvg(maliciousSvg);

    assert.ok(!sanitized.includes('<script>'), 'Sanitizer must remove script tags');
    assert.ok(!sanitized.includes('alert('), 'Sanitizer must remove inline script content');
    assert.ok(!sanitized.includes('javascript:'), 'Sanitizer must remove javascript: URLs');
    assert.ok(!sanitized.includes('onload='), 'Sanitizer must remove onload event handlers');

    // 3. 6 Themes validation
    const themes = [
      'clean-enterprise',
      'modern-technical',
      'cloud-architecture',
      'ai-architecture',
      'automation-framework',
      'minimal-documentation',
    ];

    for (const theme of themes) {
      assert.ok(THEME_CONFIGS[theme], `Theme "${theme}" must be defined`);
      const themedData = { ...data, theme };
      const themedSvg = generateArchitectureSvg(themedData, layout);
      assert.ok(
        themedSvg.includes(THEME_CONFIGS[theme].colors.edgeStroke),
        `Theme stroke must be applied`
      );
    }

    // 4. Advisory AI Technical Reviewer
    const review = reviewArchitectureDiagram(data);
    assert.ok(review.score >= 80, 'Well-formed architecture must receive high score');
    assert.strictEqual(review.passed, true, 'Well-formed architecture must pass');

    // 5. Instruction Update Verification: Strict Prohibition of Mermaid & Flowcharts
    assert.match(QA_TECHNICAL_CONTENT_ARCHITECT, /STRICT PROHIBITION OF MERMAID & FLOWCHARTS/);
    assert.match(
      QA_TECHNICAL_CONTENT_ARCHITECT,
      /Mermaid and flowchart generation are strictly forbidden/
    );
    assert.match(
      QA_TECHNICAL_CONTENT_ARCHITECT,
      /DO NOT generate flowcharts or Mermaid code blocks/
    );
  });

  // -------------------------------------------------------------
  // Extra: Schema Rejection of Malformed Architecture Data
  // -------------------------------------------------------------
  it('Extra: Schema Rejection — Disallows duplicate IDs and broken references', () => {
    // Duplicate node IDs
    const dupNodes = {
      diagramType: 'architecture',
      title: 'Bad Diagram',
      nodes: [
        { id: 'node_1', type: 'application', label: 'App 1' },
        { id: 'node_1', type: 'database', label: 'App 2' },
      ],
      edges: [],
    };
    const dupRes = validateArchitectureDiagram(dupNodes);
    assert.strictEqual(dupRes.success, false, 'Must reject duplicate node IDs');

    // Non-existent source node reference in edge
    const brokenEdge = {
      diagramType: 'architecture',
      title: 'Bad Diagram',
      nodes: [{ id: 'node_1', type: 'application', label: 'App 1' }],
      edges: [{ id: 'e1', source: 'node_1', target: 'non_existent_node', label: 'Broken' }],
    };
    const brokenRes = validateArchitectureDiagram(brokenEdge);
    assert.strictEqual(brokenRes.success, false, 'Must reject non-existent edge target references');
  });
});
