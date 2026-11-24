/**
 * High-Fidelity Educational Technical Infographic Templates
 * 
 * Generates rich, professional 16:9 technical infographic illustrations
 * with enterprise typography, detailed conceptual breakdowns, visual process flows,
 * architectural diagrams, and QA/SDET takeaways.
 */

export interface InfographicTemplateOptions {
  prompt: string;
  subject?: string;
  targetLearner?: string;
  technicalSections?: string[];
  context?: {
    courseTitle?: string;
    moduleTitle?: string;
    lessonTitle?: string;
    currentContent?: string;
  };
}

function escapeXml(unsafe: string): string {
  return (unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateHighFidelityInfographicSvg(options: InfographicTemplateOptions): string {
  const rawPrompt = options.prompt || options.subject || options.context?.lessonTitle || 'Technical Architecture';
  const p = (rawPrompt + ' ' + (options.context?.lessonTitle || '') + ' ' + (options.context?.courseTitle || '')).toLowerCase();

  const courseName = options.context?.courseTitle || 'QA Technical Learning Academy';
  const lessonName = options.context?.lessonTitle || options.subject || rawPrompt;
  const targetLearner = options.targetLearner || 'QA Engineers and SDETs';

  // Topic 1: What is an LLM? / Large Language Models
  if (p.includes('llm') || p.includes('language model') || p.includes('what is an llm')) {
    return renderLlmInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 2: What is Tokenization?
  if (p.includes('token') || p.includes('bpe') || p.includes('subword')) {
    return renderTokenizationInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 3: What is Self-Attention?
  if (p.includes('attention') || p.includes('transformer') || p.includes('query') || p.includes('key') || p.includes('value')) {
    return renderSelfAttentionInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 4: Test Automation Pyramid
  if (p.includes('pyramid') || p.includes('test pyramid') || p.includes('testing pyramid')) {
    return renderTestPyramidInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 5: How API Authentication Works
  if (p.includes('auth') || p.includes('oauth') || p.includes('jwt') || p.includes('token auth')) {
    return renderAuthInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 6: RAG (Retrieval-Augmented Generation)
  if (p.includes('rag') || p.includes('retrieval') || p.includes('vector db') || p.includes('embeddings')) {
    return renderRagInfographic(courseName, lessonName, targetLearner);
  }

  // Topic 7: Context Engineering
  if (p.includes('context') || p.includes('prompt engineering') || p.includes('system prompt')) {
    return renderContextEngineeringInfographic(courseName, lessonName, targetLearner);
  }

  // Generic Dynamic Technical Infographic
  return renderDynamicTechnicalInfographic(rawPrompt, courseName, lessonName, targetLearner, options.technicalSections);
}

// =========================================================================
// 1. LLM INFOGRAPHIC
// =========================================================================
function renderLlmInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="cardAccent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.06" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1360" height="765" fill="#f8fafc" />

  <!-- Top Executive Header Banner -->
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="url(#cardAccent)" />

  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="24" font-weight="800" fill="#ffffff" letter-spacing="-0.5">Large Language Models (LLM) — Neural Architecture &amp; Inference Pipeline</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Comprehensive Technical Breakdown for ${escapeXml(audience)} • ${escapeXml(course)}</text>

  <!-- Badge in Header -->
  <rect x="1110" y="32" width="200" height="34" rx="8" fill="#1e293b" stroke="#334155" stroke-width="1" />
  <circle cx="1128" cy="49" r="5" fill="#10b981" />
  <text x="1142" y="53" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#e2e8f0">CORE AI ARCHITECTURE</text>

  <!-- 4 Main Sequential Technical Cards -->
  <!-- CARD 1: Training Data & Tokenization -->
  <g transform="translate(50, 135)" filter="url(#shadow)">
    <rect width="290" height="495" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <path d="M 0 14 Q 0 0 14 0 L 276 0 Q 290 0 290 14 L 290 56 L 0 56 Z" fill="#3b82f6" />
    <rect x="16" y="16" width="60" height="22" rx="4" fill="#1d4ed8" />
    <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff">PHASE 01</text>
    <text x="86" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Ingestion &amp; Tokens</text>

    <!-- Content -->
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">1. Massive Pre-Training Corpus</text>
    <text x="20" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Web crawl, open source code, docs</text>
    <text x="20" y="123" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• 10T to 15T tokens deduplicated</text>

    <text x="20" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">2. Subword Tokenization (BPE)</text>
    <text x="20" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Text mapped to vocabulary IDs</text>
    <text x="20" y="193" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Vocabulary size: 32K – 128K tokens</text>

    <!-- Visual Box -->
    <rect x="18" y="220" width="254" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="28" y="242" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#2563eb">Raw Text:</text>
    <text x="28" y="260" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#0f172a">&quot;assert response.status == 200&quot;</text>
    <text x="28" y="285" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#10b981">Token IDs:</text>
    <text x="28" y="303" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#0f172a">[1849, 9382, 14, 4391, 281]</text>

    <!-- QA Takeaway -->
    <rect x="18" y="350" width="254" height="125" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1" />
    <text x="28" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#1d4ed8">SDET / QA Implication:</text>
    <text x="28" y="394" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#1e3a8a">• Prompt token limits directly bound</text>
    <text x="28" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#1e3a8a">  test suite memory context.</text>
    <text x="28" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#1e3a8a">• Token pricing scales per request.</text>
    <text x="28" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#1e3a8a">• Unrecognized tokens increase latency.</text>
  </g>

  <!-- CARD 2: Embeddings & Transformer Layers -->
  <g transform="translate(370, 135)" filter="url(#shadow)">
    <rect width="290" height="495" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <path d="M 0 14 Q 0 0 14 0 L 276 0 Q 290 0 290 14 L 290 56 L 0 56 Z" fill="#6366f1" />
    <rect x="16" y="16" width="60" height="22" rx="4" fill="#4338ca" />
    <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff">PHASE 02</text>
    <text x="86" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Dense Embeddings</text>

    <!-- Content -->
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">1. High-Dimensional Vectors</text>
    <text x="20" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Each token projected to d=4096 / d=8192</text>
    <text x="20" y="123" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Encodes semantic meaning &amp; syntax</text>

    <text x="20" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">2. Positional Encoding (RoPE)</text>
    <text x="20" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Injects word order information</text>
    <text x="20" y="193" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Critical for code execution order</text>

    <!-- Visual Box -->
    <rect x="18" y="220" width="254" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="28" y="242" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#6366f1">Embedding Space (d=4096):</text>
    <text x="28" y="265" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#334155">[+0.842, -0.194, +0.651, ...]</text>
    <text x="28" y="288" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#059669">Cosine Similarity:</text>
    <text x="28" y="306" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#334155">sim(&quot;click&quot;, &quot;tap&quot;) = 0.932</text>

    <!-- QA Takeaway -->
    <rect x="18" y="350" width="254" height="125" rx="8" fill="#eef2ff" stroke="#c7d2fe" stroke-width="1" />
    <text x="28" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#4338ca">SDET / QA Implication:</text>
    <text x="28" y="394" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#312e81">• Vector embeddings power RAG for</text>
    <text x="28" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#312e81">  matching bug tickets &amp; test failures.</text>
    <text x="28" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#312e81">• Self-healing locators use semantic</text>
    <text x="28" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#312e81">  similarity to recover altered DOM elements.</text>
  </g>

  <!-- CARD 3: Multi-Head Self-Attention -->
  <g transform="translate(690, 135)" filter="url(#shadow)">
    <rect width="290" height="495" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <path d="M 0 14 Q 0 0 14 0 L 276 0 Q 290 0 290 14 L 290 56 L 0 56 Z" fill="#0d9488" />
    <rect x="16" y="16" width="60" height="22" rx="4" fill="#0f766e" />
    <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff">PHASE 03</text>
    <text x="86" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Self-Attention</text>

    <!-- Content -->
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">1. Scaled Dot-Product</text>
    <text x="20" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Attention(Q, K, V) = softmax(QK^T / √d)V</text>
    <text x="20" y="123" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Computes cross-token relevance</text>

    <text x="20" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">2. Multi-Head Parallelism</text>
    <text x="20" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• 32 to 128 attention heads in parallel</text>
    <text x="20" y="193" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Discovers dependencies across code blocks</text>

    <!-- Visual Box -->
    <rect x="18" y="220" width="254" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="28" y="242" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#0f766e">Attention Formula:</text>
    <text x="28" y="265" font-family="Monaco, 'Courier New', monospace" font-size="11" font-weight="700" fill="#0f172a">softmax( (Q · K^T) / √d_k ) · V</text>
    <text x="28" y="288" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#64748b">Q = Query, K = Key, V = Value</text>
    <text x="28" y="306" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#059669">Context Span: 128K – 1M Tokens</text>

    <!-- QA Takeaway -->
    <rect x="18" y="350" width="254" height="125" rx="8" fill="#f0fdfa" stroke="#99f6e4" stroke-width="1" />
    <text x="28" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#0f766e">SDET / QA Implication:</text>
    <text x="28" y="394" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#134e4a">• KV Cache accelerates continuous</text>
    <text x="28" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#134e4a">  agentic test step generation.</text>
    <text x="28" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#134e4a">• Long-context degradation (lost-in-the-</text>
    <text x="28" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#134e4a">  middle) requires targeted assertions.</text>
  </g>

  <!-- CARD 4: Next-Token Prediction & Output -->
  <g transform="translate(1010, 135)" filter="url(#shadow)">
    <rect width="290" height="495" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <path d="M 0 14 Q 0 0 14 0 L 276 0 Q 290 0 290 14 L 290 56 L 0 56 Z" fill="#8b5cf6" />
    <rect x="16" y="16" width="60" height="22" rx="4" fill="#6d28d9" />
    <text x="24" y="31" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="800" fill="#ffffff">PHASE 04</text>
    <text x="86" y="33" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff">Prediction Loop</text>

    <!-- Content -->
    <text x="20" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">1. Softmax Distribution</text>
    <text x="20" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Probability scored over entire vocab</text>
    <text x="20" y="123" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Temperature controls determinism</text>

    <text x="20" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#1e293b">2. Autoregressive Sampling</text>
    <text x="20" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Output token fed back as next input</text>
    <text x="20" y="193" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Stops on &lt;|endoftext|&gt; or max tokens</text>

    <!-- Visual Box -->
    <rect x="18" y="220" width="254" height="110" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" />
    <text x="28" y="242" font-family="Monaco, 'Courier New', monospace" font-size="10" font-weight="600" fill="#8b5cf6">Candidate Probabilities:</text>
    <text x="28" y="262" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#0f172a">&quot;expect&quot;  [88.4%] ■■■■■■■■</text>
    <text x="28" y="280" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#64748b">&quot;verify&quot;  [ 8.2%] ■</text>
    <text x="28" y="298" font-family="Monaco, 'Courier New', monospace" font-size="10" fill="#64748b">&quot;assert&quot;  [ 2.1%] </text>
    <text x="28" y="316" font-family="Monaco, 'Courier New', monospace" font-size="9" fill="#059669">Selected: &quot;expect&quot; (temp=0.1)</text>

    <!-- QA Takeaway -->
    <rect x="18" y="350" width="254" height="125" rx="8" fill="#f5f3ff" stroke="#ddd6fe" stroke-width="1" />
    <text x="28" y="372" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#6d28d9">SDET / QA Implication:</text>
    <text x="28" y="394" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#4c1d95">• Temperature = 0 enforces reproducible</text>
    <text x="28" y="412" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#4c1d95">  deterministic automated test runs.</text>
    <text x="28" y="432" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#4c1d95">• Zod JSON schema validation prevents</text>
    <text x="28" y="452" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#4c1d95">  structural hallucination in API tests.</text>
  </g>

  <!-- Connectors Between Cards -->
  <g stroke="#94a3b8" stroke-width="2" fill="none">
    <path d="M 340 380 L 368 380" marker-end="url(#arrow)" />
    <path d="M 660 380 L 688 380" marker-end="url(#arrow)" />
    <path d="M 980 380 L 1008 380" marker-end="url(#arrow)" />
  </g>

  <!-- Bottom QA Summary Footer Bar -->
  <rect x="50" y="650" width="1250" height="75" rx="12" fill="#1e293b" />
  <text x="75" y="682" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">SDET AUTOMATION RULEBOOK:</text>
  <text x="75" y="705" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">1. Set temperature &lt; 0.2 for test generation • 2. Validate all structured outputs with strict Zod schemas • 3. Truncate context to eliminate Lost-in-the-Middle noise.</text>
  <text x="1140" y="695" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#94a3b8">IntelligentQA • Verified 2026</text>
</svg>`;
}

// =========================================================================
// 2. TEST AUTOMATION PYRAMID INFOGRAPHIC
// =========================================================================
function renderTestPyramidInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.08" />
    </filter>
  </defs>

  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#10b981" />

  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Enterprise Test Automation Pyramid — Quality Strategy &amp; Execution Economics</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Optimization Guide for ${escapeXml(audience)} • ${escapeXml(course)}</text>

  <!-- Left Side: Geometric Pyramid Diagram -->
  <g transform="translate(60, 140)">
    <!-- Pyramid Level 4: E2E UI Tests (Peak) -->
    <polygon points="260,30 380,30 430,120 210,120" fill="#f43f5e" stroke="#ffffff" stroke-width="2" />
    <text x="320" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">E2E UI TESTS (5-10%)</text>
    <text x="320" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#ffe4e6" text-anchor="middle">Playwright / Selenium / Appium</text>

    <!-- Pyramid Level 3: Integration & Contract Tests -->
    <polygon points="210,122 430,122 480,220 160,220" fill="#f59e0b" stroke="#ffffff" stroke-width="2" />
    <text x="320" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">API &amp; INTEGRATION (20-30%)</text>
    <text x="320" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#fef3c7" text-anchor="middle">REST Assured / Postman / Supertest / Pact</text>

    <!-- Pyramid Level 2: Component & Service Tests -->
    <polygon points="160,222 480,222 530,330 110,330" fill="#3b82f6" stroke="#ffffff" stroke-width="2" />
    <text x="320" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff" text-anchor="middle">COMPONENT &amp; SERVICE (20-30%)</text>
    <text x="320" y="290" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#dbeafe" text-anchor="middle">WireMock / Testcontainers / SpringBootTest</text>

    <!-- Pyramid Level 1: Unit Tests (Base) -->
    <polygon points="110,332 530,332 590,460 50,460" fill="#10b981" stroke="#ffffff" stroke-width="2" />
    <text x="320" y="390" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#ffffff" text-anchor="middle">UNIT TESTS (40-60%)</text>
    <text x="320" y="415" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#d1fae5" text-anchor="middle">JUnit 5 / TestNG / Jest / PyTest / Mockito</text>
    <text x="320" y="435" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#ecfdf5" text-anchor="middle">Fast, Isolated, Zero Network Call</text>

    <!-- Side Indicators -->
    <line x1="20" y1="40" x2="20" y2="450" stroke="#64748b" stroke-width="2" stroke-dasharray="4" />
    <text x="10" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#ef4444" transform="rotate(-90 10 250)" text-anchor="middle">COST &amp; EXECUTION TIME INCREASES ▲</text>

    <line x1="620" y1="40" x2="620" y2="450" stroke="#64748b" stroke-width="2" stroke-dasharray="4" />
    <text x="635" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#10b981" transform="rotate(90 635 250)" text-anchor="middle">SPEED &amp; STABILITY INCREASES ▼</text>
  </g>

  <!-- Right Side: Comparison Matrix & Strategy Cards -->
  <g transform="translate(710, 140)">
    <!-- Card 1: Trade-off Breakdown Table -->
    <rect width="590" height="240" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow)" />
    <rect width="590" height="42" rx="12" fill="#1e293b" />
    <rect x="0" y="30" width="590" height="12" fill="#1e293b" />
    <text x="24" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">TIER METRIC COMPARISON MATRIX</text>

    <!-- Table Header -->
    <text x="30" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748b">TIER</text>
    <text x="140" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748b">SPEED</text>
    <text x="230" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748b">COST</text>
    <text x="320" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748b">FLAKINESS</text>
    <text x="440" y="65" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748b">FEEDBACK LOOP</text>
    <line x1="20" y1="75" x2="570" y2="75" stroke="#e2e8f0" stroke-width="1" />

    <!-- Row 1: E2E UI -->
    <text x="30" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#e11d48">E2E UI</text>
    <text x="140" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">Seconds to Min</text>
    <text x="230" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#e11d48">$$$$</text>
    <text x="320" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#e11d48">High (DOM/Net)</text>
    <text x="440" y="102" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">Post-Deployment</text>
    <line x1="20" y1="115" x2="570" y2="115" stroke="#f1f5f9" stroke-width="1" />

    <!-- Row 2: API -->
    <text x="30" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#d97706">API / Service</text>
    <text x="140" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">50ms – 500ms</text>
    <text x="230" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#d97706">$$</text>
    <text x="320" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#059669">Low (Deterministic)</text>
    <text x="440" y="142" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">CI Pipeline (&lt;5 min)</text>
    <line x1="20" y1="155" x2="570" y2="155" stroke="#f1f5f9" stroke-width="1" />

    <!-- Row 3: Unit -->
    <text x="30" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#059669">Unit Tests</text>
    <text x="140" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">&lt; 1ms – 5ms</text>
    <text x="230" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#059669">$</text>
    <text x="320" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#059669">Zero Flake</text>
    <text x="440" y="182" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#334155">Pre-Commit / IDE</text>

    <!-- Card 2: SDET Anti-Patterns & Solutions -->
    <g transform="translate(0, 260)">
      <rect width="590" height="215" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" filter="url(#shadow)" />
      <rect width="590" height="42" rx="12" fill="#0f766e" />
      <rect x="0" y="30" width="590" height="12" fill="#0f766e" />
      <text x="24" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">COMMON ANTI-PATTERNS VS BEST PRACTICES</text>

      <text x="24" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#ef4444">❌ The Ice-Cream Cone Anti-Pattern</text>
      <text x="24" y="90" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">90% tests at UI layer, leading to slow CI runs, constant flaky alerts, and prohibitive grid maintenance.</text>

      <text x="24" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#059669">✓ The Inversion Strategy (Push Tests Down)</text>
      <text x="24" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Whenever a UI test verifies backend business logic or status codes, replace with an API or integration test.</text>
      <text x="24" y="165" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Reserve UI tests exclusively for critical user journeys, accessibility, and visual render validation.</text>
    </g>
  </g>

  <!-- Bottom Bar -->
  <rect x="50" y="660" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="698" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">PYRAMID GOLDEN RULE: </tspan>
    Test logic as close to the source as possible. Maximize unit &amp; API tests; minimize end-to-end browser tests.
  </text>
  <text x="1140" y="698" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#94a3b8">IntelligentQA • Verified 2026</text>
</svg>`;
}

// =========================================================================
// 3. TOKENIZATION INFOGRAPHIC
// =========================================================================
function renderTokenizationInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#06b6d4" />
  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Tokenization Mechanics — From Raw Code to Vector Embeddings</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Subword Segmentation &amp; Vocabulary Indexing for ${escapeXml(audience)}</text>

  <!-- Step 1: Raw String -->
  <g transform="translate(60, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="44" rx="12" fill="#0284c7" />
    <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">01. RAW INPUT STRING</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Continuous Character Stream</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Raw Unicode bytes or UTF-8 code points entering the model.</text>
    <rect x="15" y="130" width="240" height="90" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
    <text x="25" y="155" font-family="Monaco, monospace" font-size="11" fill="#0369a1">&quot;WebDriver driver =&quot;</text>
    <text x="25" y="180" font-family="Monaco, monospace" font-size="11" fill="#0369a1">&quot;new ChromeDriver();&quot;</text>
    <text x="20" y="250" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#0f172a">Challenge:</text>
    <text x="20" y="270" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Neural networks cannot process raw strings; characters must be transformed into discrete integers.</text>
  </g>

  <!-- Step 2: BPE Subwords -->
  <g transform="translate(370, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="44" rx="12" fill="#2563eb" />
    <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">02. BPE SUBWORDS</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Byte-Pair Encoding Merge</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Splits rare words, preserves common keywords intact.</text>
    <rect x="15" y="130" width="240" height="150" rx="6" fill="#f1f5f9" stroke="#cbd5e1" />
    <rect x="25" y="145" width="90" height="26" rx="4" fill="#dbeafe" stroke="#93c5fd" />
    <text x="35" y="162" font-family="Monaco, monospace" font-size="10" font-weight="700" fill="#1e40af">Web</text>
    <rect x="125" y="145" width="90" height="26" rx="4" fill="#dbeafe" stroke="#93c5fd" />
    <text x="135" y="162" font-family="Monaco, monospace" font-size="10" font-weight="700" fill="#1e40af">Driver</text>
    <rect x="25" y="180" width="90" height="26" rx="4" fill="#dbeafe" stroke="#93c5fd" />
    <text x="35" y="197" font-family="Monaco, monospace" font-size="10" font-weight="700" fill="#1e40af">Chrome</text>
    <rect x="125" y="180" width="90" height="26" rx="4" fill="#dbeafe" stroke="#93c5fd" />
    <text x="135" y="197" font-family="Monaco, monospace" font-size="10" font-weight="700" fill="#1e40af">Driver()</text>
  </g>

  <!-- Step 3: Vocabulary IDs -->
  <g transform="translate(680, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="44" rx="12" fill="#7c3aed" />
    <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">03. VOCABULARY IDS</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Integer Lookup Table</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Fixed dictionary mapping subwords to unique integers.</text>
    <rect x="15" y="130" width="240" height="150" rx="6" fill="#f5f3ff" stroke="#ddd6fe" />
    <text x="25" y="155" font-family="Monaco, monospace" font-size="10" fill="#4c1d95">&quot;Web&quot;    -&gt; ID: 1249</text>
    <text x="25" y="180" font-family="Monaco, monospace" font-size="10" fill="#4c1d95">&quot;Driver&quot; -&gt; ID: 8492</text>
    <text x="25" y="205" font-family="Monaco, monospace" font-size="10" fill="#4c1d95">&quot;Chrome&quot; -&gt; ID: 4182</text>
    <text x="25" y="230" font-family="Monaco, monospace" font-size="10" fill="#4c1d95">&quot;Driver&quot; -&gt; ID: 8492</text>
    <text x="25" y="255" font-family="Monaco, monospace" font-size="10" fill="#4c1d95">&quot;()&quot;     -&gt; ID: 94</text>
  </g>

  <!-- Step 4: Vector Embeddings -->
  <g transform="translate(990, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="44" rx="12" fill="#059669" />
    <text x="20" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">04. DENSE EMBEDDINGS</text>
    <text x="20" y="75" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Continuous Vector Space</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Each ID points to high-dimensional weights matrix (d=4096).</text>
    <rect x="15" y="130" width="240" height="150" rx="6" fill="#ecfdf5" stroke="#a7f3d0" />
    <text x="25" y="155" font-family="Monaco, monospace" font-size="9" fill="#065f46">v[1249] = [0.81, -0.42, 0.19...]</text>
    <text x="25" y="180" font-family="Monaco, monospace" font-size="9" fill="#065f46">v[8492] = [0.12, 0.94, -0.73...]</text>
    <text x="25" y="210" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#047857">Position Encoding Added:</text>
    <text x="25" y="230" font-family="Monaco, monospace" font-size="9" fill="#065f46">Final = Embedding + RoPE(pos)</text>
  </g>

  <rect x="50" y="650" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">SDET KEY TAKEAWAY: </tspan>
    Whitespace, punctuation, and code indentation generate distinct tokens. Always sanitize unnecessary whitespace to prevent token budget waste.
  </text>
</svg>`;
}

// =========================================================================
// 4. SELF-ATTENTION INFOGRAPHIC
// =========================================================================
function renderSelfAttentionInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#10b981" />
  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Transformer Self-Attention — Query, Key, and Value Mechanics</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">How Neural Models Model Long-Range Relationships Across Test Code for ${escapeXml(audience)}</text>

  <!-- Center Formula Callout -->
  <rect x="50" y="135" width="1260" height="75" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="75" y="178" font-family="Monaco, 'Courier New', monospace" font-size="18" font-weight="800" fill="#0f172a">Attention(Q, K, V) = softmax( (Q · K^T) / √d_k ) · V</text>
  <text x="940" y="178" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#059669">Scaled Dot-Product Formula</text>

  <!-- 3 Vectors Breakdown: Q, K, V -->
  <!-- QUERY CARD -->
  <g transform="translate(50, 230)">
    <rect width="390" height="390" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="390" height="42" rx="12" fill="#3b82f6" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff">QUERY VECTOR (Q)</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">&quot;What am I looking for?&quot;</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">The current token probes context tokens to find related information.</text>
    <rect x="20" y="125" width="350" height="120" rx="8" fill="#eff6ff" stroke="#bfdbfe" />
    <text x="35" y="155" font-family="Monaco, monospace" font-size="11" fill="#1e40af">Current Token: &quot;driver.findElement&quot;</text>
    <text x="35" y="180" font-family="Monaco, monospace" font-size="11" fill="#1e40af">Q-Projection: Linear(W_Q · X)</text>
    <text x="35" y="205" font-family="Monaco, monospace" font-size="11" fill="#1e40af">Dimension: [batch, heads, seq, d_k]</text>
  </g>

  <!-- KEY CARD -->
  <g transform="translate(480, 230)">
    <rect width="390" height="390" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="390" height="42" rx="12" fill="#10b981" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff">KEY VECTOR (K)</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">&quot;What do I contain?&quot;</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Every preceding context token broadcasts its identity and role.</text>
    <rect x="20" y="125" width="350" height="120" rx="8" fill="#ecfdf5" stroke="#a7f3d0" />
    <text x="35" y="155" font-family="Monaco, monospace" font-size="11" fill="#065f46">Candidate Token: &quot;By.xpath(...)&quot;</text>
    <text x="35" y="180" font-family="Monaco, monospace" font-size="11" fill="#065f46">K-Projection: Linear(W_K · X)</text>
    <text x="35" y="205" font-family="Monaco, monospace" font-size="11" fill="#065f46">Dot product Q · K^T = Relevance Score</text>
  </g>

  <!-- VALUE CARD -->
  <g transform="translate(910, 230)">
    <rect width="390" height="390" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="390" height="42" rx="12" fill="#8b5cf6" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#ffffff">VALUE VECTOR (V)</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">&quot;Information passed forward&quot;</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Weighted by softmax attention scores, blended into final context.</text>
    <rect x="20" y="125" width="350" height="120" rx="8" fill="#f5f3ff" stroke="#ddd6fe" />
    <text x="35" y="155" font-family="Monaco, monospace" font-size="11" fill="#4c1d95">V-Projection: Linear(W_V · X)</text>
    <text x="35" y="180" font-family="Monaco, monospace" font-size="11" fill="#4c1d95">Attention Weight: softmax(Score)</text>
    <text x="35" y="205" font-family="Monaco, monospace" font-size="11" fill="#4c1d95">Output = Σ (Weight_i · Value_i)</text>
  </g>

  <!-- Footer -->
  <rect x="50" y="650" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">SDET INSIGHT: </tspan>
    Self-attention enables the LLM to connect variable declarations at line 5 with assertions at line 85 without losing track.
  </text>
</svg>`;
}

// =========================================================================
// 5. API AUTHENTICATION INFOGRAPHIC
// =========================================================================
function renderAuthInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#f59e0b" />
  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">API Authentication Architecture — OAuth 2.0 &amp; JWT Bearer Flow</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Security Verification Standards for SDETs &amp; API Automation Engineers</text>

  <!-- 4 Step Boxes -->
  <g transform="translate(60, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#2563eb" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">01. CLIENT CREDENTIALS</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">POST /oauth/v2/token</text>
    <rect x="15" y="90" width="240" height="110" rx="6" fill="#f8fafc" stroke="#cbd5e1" />
    <text x="25" y="115" font-family="Monaco, monospace" font-size="10" fill="#1e40af">client_id: &quot;qa_automation&quot;</text>
    <text x="25" y="135" font-family="Monaco, monospace" font-size="10" fill="#1e40af">client_secret: &quot;secret_key&quot;</text>
    <text x="25" y="155" font-family="Monaco, monospace" font-size="10" fill="#1e40af">grant_type: &quot;client_cred&quot;</text>
    <text x="25" y="175" font-family="Monaco, monospace" font-size="10" fill="#1e40af">scope: &quot;read:reports&quot;</text>
  </g>

  <g transform="translate(370, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#d97706" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">02. AUTH SERVER (IDP)</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Cryptographic Signing</text>
    <rect x="15" y="90" width="240" height="110" rx="6" fill="#fefce8" stroke="#fef08a" />
    <text x="25" y="115" font-family="Monaco, monospace" font-size="10" fill="#854d0e">Algorithm: RS256 (RSA)</text>
    <text x="25" y="135" font-family="Monaco, monospace" font-size="10" fill="#854d0e">Signs Header + Payload</text>
    <text x="25" y="155" font-family="Monaco, monospace" font-size="10" fill="#854d0e">Issues Access Token</text>
    <text x="25" y="175" font-family="Monaco, monospace" font-size="10" fill="#854d0e">Expiry: 3600 seconds</text>
  </g>

  <g transform="translate(680, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#7c3aed" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">03. JWT TOKEN STRUCTURE</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Base64URL Segments</text>
    <rect x="15" y="90" width="240" height="110" rx="6" fill="#f5f3ff" stroke="#ddd6fe" />
    <text x="25" y="115" font-family="Monaco, monospace" font-size="10" fill="#dc2626">1. Header (alg, typ)</text>
    <text x="25" y="135" font-family="Monaco, monospace" font-size="10" fill="#7c3aed">2. Payload Claims (sub, exp)</text>
    <text x="25" y="155" font-family="Monaco, monospace" font-size="10" fill="#059669">3. Digital Signature</text>
    <text x="25" y="175" font-family="Monaco, monospace" font-size="10" fill="#334155">header.payload.signature</text>
  </g>

  <g transform="translate(990, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#059669" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">04. API GATEWAY ACCESS</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Bearer Token Header</text>
    <rect x="15" y="90" width="240" height="110" rx="6" fill="#ecfdf5" stroke="#a7f3d0" />
    <text x="25" y="115" font-family="Monaco, monospace" font-size="10" fill="#065f46">Authorization: Bearer &lt;jwt&gt;</text>
    <text x="25" y="135" font-family="Monaco, monospace" font-size="10" fill="#065f46">Gateway validates signature</text>
    <text x="25" y="155" font-family="Monaco, monospace" font-size="10" fill="#065f46">Checks expiration (exp)</text>
    <text x="25" y="175" font-family="Monaco, monospace" font-size="10" fill="#065f46">Dispatches to Microservice</text>
  </g>

  <rect x="50" y="650" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">SDET TEST STRATEGY: </tspan>
    Always test negative scenarios: 1. Expired tokens (401) • 2. Tampered signatures (401) • 3. Missing scopes (403 Forbidden).
  </text>
</svg>`;
}

// =========================================================================
// 6. RAG (RETRIEVAL-AUGMENTED GENERATION) INFOGRAPHIC
// =========================================================================
function renderRagInfographic(course: string, lesson: string, audience: string): string {
  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#8b5cf6" />
  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">Retrieval-Augmented Generation (RAG) — Grounding LLMs with Enterprise Knowledge</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">End-to-End Ingestion, Embedding Search &amp; Grounded Synthesis for ${escapeXml(audience)}</text>

  <!-- 4 Step Boxes -->
  <g transform="translate(60, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#3b82f6" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">01. CHUNKING &amp; CLEANING</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Document Ingestion</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Raw PDF, Markdown, Confluence docs parsed into 500-token chunks with 50-token overlap.</text>
  </g>

  <g transform="translate(370, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#8b5cf6" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">02. VECTOR DATABASE</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Semantic Vector Search</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">HNSW index computes cosine similarity between user question vector and stored document vectors.</text>
  </g>

  <g transform="translate(680, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#0d9488" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">03. PROMPT AUGMENTATION</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Context Injection</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Top-K retrieved chunks appended into LLM prompt as ground-truth reference material.</text>
  </g>

  <g transform="translate(990, 150)">
    <rect width="270" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="270" height="42" rx="12" fill="#10b981" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">04. GROUNDED SYNTHESIS</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#0f172a">Cited Generation</text>
    <text x="20" y="95" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">LLM produces response strictly grounded in supplied facts, eliminating hallucinations.</text>
  </g>

  <rect x="50" y="650" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">RAG QA EVALUATION (RAGAS): </tspan>
    Measure 1. Faithfulness (no hallucinations) • 2. Answer Relevance • 3. Context Recall (did vector search find the right doc?).
  </text>
</svg>`;
}

// =========================================================================
// 7. CONTEXT ENGINEERING INFOGRAPHIC
// =========================================================================
function renderContextEngineeringInfographic(course: string, lesson: string, audience: string): string {
  return renderDynamicTechnicalInfographic('Context Engineering & System Prompt Architecture', course, lesson, audience, [
    'System Role & Behavioral Boundaries',
    'Dynamic Memory & Tool Ingestion',
    'Few-Shot Demonstrations & Format Guidance',
    'Constrained Schema & Output Enforcers',
  ]);
}

// =========================================================================
// 8. DYNAMIC TECHNICAL INFOGRAPHIC
// =========================================================================
function renderDynamicTechnicalInfographic(
  topic: string,
  course: string,
  lesson: string,
  audience: string,
  customSections?: string[]
): string {
  const sections = customSections && customSections.length >= 3 ? customSections : [
    'Concept Overview & Architectural Role',
    'Core Execution Mechanics & Protocols',
    'Component Dependencies & Data Flow',
    'Verification Strategy & QA Assertions',
  ];

  const colors = ['#2563eb', '#7c3aed', '#0d9488', '#059669'];

  return `<svg width="1360" height="765" viewBox="0 0 1360 765" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1360" height="765" fill="#f8fafc" />
  <rect width="1360" height="110" fill="url(#headerGrad)" />
  <rect x="0" y="107" width="1360" height="3" fill="#10b981" />

  <text x="50" y="44" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#ffffff">${escapeXml(topic)} — Technical Educational Infographic</text>
  <text x="50" y="74" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#94a3b8">Comprehensive Architectural Guide for ${escapeXml(audience)} • ${escapeXml(course)}</text>

  <!-- 4 Step Boxes -->
  ${sections.slice(0, 4).map((sec, idx) => {
    const x = 60 + idx * 310;
    const color = colors[idx % colors.length];
    return `
  <g transform="translate(${x}, 150)">
    <rect width="280" height="470" rx="12" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5" />
    <rect width="280" height="42" rx="12" fill="${color}" />
    <text x="20" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" fill="#ffffff">PHASE 0${idx + 1}</text>
    <text x="20" y="70" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#0f172a">${escapeXml(sec)}</text>
    <text x="20" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">Detailed execution and operational characteristics for ${escapeXml(sec)}.</text>
    <rect x="15" y="140" width="250" height="140" rx="8" fill="#f8fafc" stroke="#e2e8f0" />
    <text x="25" y="170" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="600" fill="#334155">• Enterprise Architecture Standard</text>
    <text x="25" y="195" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Deterministic Contract Verification</text>
    <text x="25" y="220" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Automated Regression Guardrails</text>
    <text x="25" y="245" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" fill="#64748b">• Real-time Observability &amp; Metrics</text>
  </g>`;
  }).join('')}

  <rect x="50" y="650" width="1260" height="65" rx="10" fill="#1e293b" />
  <text x="75" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#cbd5e1">
    <tspan font-weight="700" fill="#38bdf8">INTELLIGENT QA ARCHITECTURE SUMMARY: </tspan>
    Verified educational illustration adhering to industry engineering standards.
  </text>
  <text x="1140" y="688" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#94a3b8">IntelligentQA • Verified 2026</text>
</svg>`;
}
