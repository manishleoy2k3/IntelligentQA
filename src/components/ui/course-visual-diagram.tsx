'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Sparkles,
  Info,
  Layers,
  ArrowRight,
  Maximize2,
  ZoomIn,
  CheckCircle2,
} from 'lucide-react';

export type SupportedDiagramTrack =
  'selenium-java' | 'selenium' | 'playwright-ts' | 'playwright' | 'api-testing' | 'ai-qa';

// =========================================================================
// 1. SELENIUM WEB DRIVER ARCHITECTURE (Faithful to User Uploaded Diagram)
// =========================================================================
function SeleniumDiagramGraphic() {
  return (
    <div className="w-full bg-[#0a1a2f] border-2 border-[#1e3a5f] rounded-2xl overflow-hidden shadow-2xl font-sans select-none">
      {/* Top Header Banner */}
      <div className="bg-[#8bc34a] border-b-4 border-[#689f38] py-2.5 px-4 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-[#1b3a1a] tracking-wide">
          Selenium Web Driver Architecture
        </h2>
      </div>

      {/* Top Protocol Sub-Banner */}
      <div className="bg-[#0f2847] border-b border-[#1b3a5c] py-1 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#80d8ff] uppercase">
          HTTP OVER HTTP SERVER (W3C STANDARDIZED PROTOCOL)
        </span>
      </div>

      {/* Main Visual Blueprint Area */}
      <div className="p-4 sm:p-8 overflow-x-auto">
        <div className="min-w-[820px] flex items-center justify-between gap-4 py-6 px-2">
          {/* COLUMN 1: Selenium Language Bindings */}
          <div className="w-[170px] bg-[#122e4d] border-2 border-[#29b6f6] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Selenium Language
              <br />
              Bindings
            </div>
            <div className="w-full space-y-2">
              {['.JAVA', 'RUBY', 'C#', 'Python', 'JavaScript'].map((lang, idx) => (
                <div
                  key={lang}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#29b6f6] to-[#0288d1] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                >
                  {lang}
                </div>
              ))}
            </div>
          </div>

          {/* SVG ARROWS 1: Converging Lines into JSON Wire/W3C Protocol */}
          <div className="w-[90px] h-[190px] flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 90 190">
              <defs>
                <marker
                  id="arrow-white"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#ffffff" />
                </marker>
              </defs>
              {/* Lines from 5 pills converging to right center */}
              <line
                x1="0"
                y1="25"
                x2="82"
                y2="95"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
              <line
                x1="0"
                y1="60"
                x2="82"
                y2="95"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
              <line
                x1="0"
                y1="95"
                x2="82"
                y2="95"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
              <line
                x1="0"
                y1="130"
                x2="82"
                y2="95"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
              <line
                x1="0"
                y1="165"
                x2="82"
                y2="95"
                stroke="#ffffff"
                strokeWidth="2.5"
                markerEnd="url(#arrow-white)"
              />
            </svg>
          </div>

          {/* COLUMN 2: JSON WIRE PROTOCOL / W3C BOX */}
          <div className="w-[145px] h-[140px] bg-gradient-to-b from-[#ff9800] to-[#f57c00] border-2 border-[#ffe082] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-3 text-center">
            <span className="text-sm sm:text-base font-extrabold text-white leading-tight uppercase drop-shadow-md">
              JSON WIRE
              <br />
              PROTOCOL
            </span>
            <span className="text-[10px] font-mono text-[#fff3e0] mt-1 font-semibold">
              (W3C Standard)
            </span>
          </div>

          {/* CHUNKY ORANGE ARROW */}
          <div className="w-[60px] flex items-center justify-center">
            <svg className="w-12 h-10 overflow-visible" viewBox="0 0 50 30">
              <defs>
                <linearGradient id="orangeArrowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ff9800" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="url(#orangeArrowGrad)"
                stroke="#f57c00"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 3: Browser Drivers */}
          <div className="w-[170px] bg-[#1a3826] border-2 border-[#8bc34a] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Browser Drivers
            </div>
            <div className="w-full space-y-2">
              {[
                'Firefox Driver',
                'Chrome Driver',
                'Safari Driver',
                'Opera Driver',
                'Edge Driver',
              ].map((drv) => (
                <div
                  key={drv}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#9ccc65] to-[#7cb342] text-[#1b3a1a] text-xs sm:text-sm font-extrabold text-center rounded-xl border border-white/60 shadow-md"
                >
                  {drv}
                </div>
              ))}
            </div>
          </div>

          {/* BIDIRECTIONAL GREEN ARROWS */}
          <div className="w-[80px] h-[120px] flex flex-col justify-around items-center">
            {/* Top Arrow: Drivers -> Real Browser */}
            <div className="w-full flex items-center justify-center">
              <svg className="w-16 h-8" viewBox="0 0 60 24">
                <polygon
                  points="0,6 40,6 40,0 58,12 40,24 40,18 0,18"
                  fill="#cddc39"
                  stroke="#8bc34a"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
            {/* Bottom Arrow: Real Browser -> Drivers (Response) */}
            <div className="w-full flex items-center justify-center">
              <svg className="w-16 h-8" viewBox="0 0 60 24">
                <polygon
                  points="58,6 18,6 18,0 0,12 18,24 18,18 58,18"
                  fill="#cddc39"
                  stroke="#8bc34a"
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>

          {/* COLUMN 4: Real Browser */}
          <div className="w-[170px] bg-[#283818] border-2 border-[#cddc39] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Real Browser
            </div>
            <div className="w-full space-y-2">
              {[
                'Firefox Browser',
                'Chrome Browser',
                'Safari Browser',
                'Opera Browser',
                'Edge Browser',
              ].map((brw) => (
                <div
                  key={brw}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#d4e157] to-[#c0ca33] text-[#1e300d] text-xs sm:text-sm font-extrabold text-center rounded-xl border border-white/60 shadow-md"
                >
                  {brw}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Protocol Sub-Banner */}
      <div className="bg-[#0f2847] border-t border-[#1b3a5c] py-2 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#80d8ff] uppercase">
          HTTP OVER HTTP SERVER (PORT 9515 / CHROMEDRIVER REST API)
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 2. PLAYWRIGHT MODERN ARCHITECTURE (Single Browser, Multi-Context)
// =========================================================================
function PlaywrightDiagramGraphic() {
  return (
    <div className="w-full bg-[#0d1b2a] border-2 border-[#1f3a52] rounded-2xl overflow-hidden shadow-2xl font-sans select-none">
      {/* Top Header Banner */}
      <div className="bg-[#2e7d32] border-b-4 border-[#1b5e20] py-2.5 px-4 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide">
          Playwright Modern Architecture (Zero-Flakiness CDP Model)
        </h2>
      </div>

      {/* Top Protocol Sub-Banner */}
      <div className="bg-[#102a45] border-b border-[#1b436e] py-1 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#69f0ae] uppercase">
          PERSISTENT DUPLEX WEBSOCKET CONNECTION (CHROME DEVTOOLS PROTOCOL - 0MS PROTOCOL LATENCY)
        </span>
      </div>

      {/* Main Visual Blueprint Area */}
      <div className="p-4 sm:p-8 overflow-x-auto">
        <div className="min-w-[820px] flex items-center justify-between gap-4 py-6 px-2">
          {/* COLUMN 1: Test Runner & Languages */}
          <div className="w-[170px] bg-[#12283e] border-2 border-[#40c4ff] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Playwright Runner
              <br />
              &amp; Bindings
            </div>
            <div className="w-full space-y-2">
              {['TypeScript', 'JavaScript', 'Python (pytest)', 'Java TestNG', '.NET / C#'].map(
                (lang) => (
                  <div
                    key={lang}
                    className="w-full py-1.5 px-2 bg-gradient-to-r from-[#00b0ff] to-[#0091ea] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                  >
                    {lang}
                  </div>
                )
              )}
            </div>
          </div>

          {/* SVG DUPLEX WEBSOCKET ARROW */}
          <div className="w-[90px] h-[160px] flex items-center justify-center">
            <svg className="w-full h-24 overflow-visible" viewBox="0 0 90 40">
              <defs>
                <marker
                  id="pw-arrow-green"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#69f0ae" />
                </marker>
                <marker
                  id="pw-arrow-blue"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 8 5 L 0 9 z" fill="#40c4ff" />
                </marker>
              </defs>
              <line
                x1="5"
                y1="12"
                x2="80"
                y2="12"
                stroke="#69f0ae"
                strokeWidth="3"
                markerEnd="url(#pw-arrow-green)"
              />
              <line
                x1="80"
                y1="28"
                x2="5"
                y2="28"
                stroke="#40c4ff"
                strokeWidth="3"
                markerEnd="url(#pw-arrow-blue)"
              />
              <text x="45" y="8" fill="#69f0ae" fontSize="8" fontWeight="bold" textAnchor="middle">
                WebSocket
              </text>
              <text x="45" y="38" fill="#40c4ff" fontSize="8" fontWeight="bold" textAnchor="middle">
                CDP Events
              </text>
            </svg>
          </div>

          {/* COLUMN 2: SINGLE BROWSER PROCESS (Launched Once) */}
          <div className="w-[160px] bg-gradient-to-b from-[#4a148c] to-[#311b92] border-2 border-[#b388ff] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-3 text-center">
            <span className="text-sm sm:text-base font-extrabold text-white leading-tight uppercase drop-shadow-md">
              Single Browser
              <br />
              OS Process
            </span>
            <span className="text-[10px] font-mono text-[#ea80fc] mt-1 font-semibold">
              Chromium / WebKit / Firefox
            </span>
            <div className="w-full mt-2.5 pt-2 border-t border-purple-400/40 text-[11px] text-purple-200">
              Launched ONCE (~2s)
              <br />
              Shared by All Tests
            </div>
          </div>

          {/* FAN-OUT CONNECTORS */}
          <div className="w-[60px] flex items-center justify-center">
            <svg className="w-12 h-16 overflow-visible" viewBox="0 0 50 50">
              <line x1="5" y1="25" x2="45" y2="10" stroke="#b388ff" strokeWidth="2.5" />
              <line x1="5" y1="25" x2="45" y2="25" stroke="#69f0ae" strokeWidth="3" />
              <line x1="5" y1="25" x2="45" y2="40" stroke="#b388ff" strokeWidth="2.5" />
            </svg>
          </div>

          {/* COLUMN 3: In-Memory BrowserContexts */}
          <div className="w-[180px] bg-[#004d40] border-2 border-[#1de9b6] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Isolated BrowserContexts
              <br />
              (Ultra-Fast ~5ms Sandboxes)
            </div>
            <div className="w-full space-y-2">
              {[
                'Context 1: Auth State A',
                'Context 2: Auth State B',
                'Context 3: Guest User',
                'Context 4: Admin Role',
              ].map((ctx) => (
                <div
                  key={ctx}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#00bfa5] to-[#00897b] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/60 shadow-md"
                >
                  {ctx}
                </div>
              ))}
            </div>
          </div>

          {/* ARROW */}
          <div className="w-[60px] flex items-center justify-center">
            <svg className="w-12 h-10 overflow-visible" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#69f0ae"
                stroke="#00bfa5"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 4: Actionability Auto-Wait & Real DOM */}
          <div className="w-[170px] bg-[#1a3826] border-2 border-[#76ff03] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Auto-Waiting Engine
              <br />
              &amp; Live DOM
            </div>
            <div className="w-full space-y-2">
              {[
                'Attached to DOM',
                'Visible in Viewport',
                'Stable (No Animation)',
                'Receives Events',
                'Enabled (Not Disabled)',
              ].map((act) => (
                <div
                  key={act}
                  className="w-full py-1 px-1.5 bg-gradient-to-r from-[#64dd17] to-[#43a047] text-[#142d0b] text-[11px] sm:text-xs font-extrabold text-center rounded-xl border border-white/60 shadow-md"
                >
                  ✔ {act}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Protocol Sub-Banner */}
      <div className="bg-[#102a45] border-t border-[#1b436e] py-2 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#69f0ae] uppercase">
          BUILT-IN AUTO-WAITING ELIMINATES THREAD.SLEEP • STORAGESTATE CACHES LOGIN IN 2MS
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 3. REST ASSURED ARCHITECTURE (Given-When-Then BDD Pipeline)
// =========================================================================
function RestAssuredDiagramGraphic() {
  return (
    <div className="w-full bg-[#160d27] border-2 border-[#3d2466] rounded-2xl overflow-hidden shadow-2xl font-sans select-none">
      {/* Top Header Banner */}
      <div className="bg-[#6a1b9a] border-b-4 border-[#4a148c] py-2.5 px-4 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide">
          REST Assured Given-When-Then BDD Architecture
        </h2>
      </div>

      {/* Top Protocol Sub-Banner */}
      <div className="bg-[#241340] border-b border-[#432373] py-1 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#ea80fc] uppercase">
          HTTP / HTTPS TRANSPORT OVER APACHE HTTPCLIENT WITH JACKSON OBJECTMAPPER
        </span>
      </div>

      {/* Main Visual Blueprint Area */}
      <div className="p-4 sm:p-8 overflow-x-auto">
        <div className="min-w-[840px] flex items-center justify-between gap-3 py-6 px-2">
          {/* COLUMN 1: given() Preconditions */}
          <div className="w-[170px] bg-[#2a134a] border-2 border-[#ba68c8] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-[#ea80fc] mb-3 px-1 leading-tight">
              given() Preconditions
              <br />
              (RequestSpecification)
            </div>
            <div className="w-full space-y-2">
              {[
                'Base URI & Port',
                'Auth Bearer Token',
                'Content-Type: JSON',
                'Headers & Query Params',
                'Request POJO Body',
              ].map((gvn) => (
                <div
                  key={gvn}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#ab47bc] to-[#8e24aa] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                >
                  {gvn}
                </div>
              ))}
            </div>
          </div>

          {/* ARROW 1 */}
          <div className="w-[50px] flex items-center justify-center">
            <svg className="w-10 h-8" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#ea80fc"
                stroke="#ba68c8"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 2: Jackson POJO Serialization */}
          <div className="w-[140px] h-[150px] bg-gradient-to-b from-[#ff8f00] to-[#e65100] border-2 border-[#ffe082] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-3 text-center">
            <span className="text-xs sm:text-sm font-extrabold text-white leading-tight uppercase drop-shadow-md">
              Jackson
              <br />
              ObjectMapper
            </span>
            <span className="text-[10px] font-mono text-[#fff8e1] mt-1">
              Java Object &harr; JSON
            </span>
            <div className="w-full mt-2 pt-1 border-t border-amber-300/40 text-[10px] text-amber-100">
              Type-Safe POJOs
              <br />
              Compile-Time Safe
            </div>
          </div>

          {/* ARROW 2 */}
          <div className="w-[50px] flex items-center justify-center">
            <svg className="w-10 h-8" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#ffb300"
                stroke="#ff8f00"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 3: when() HTTP Actions */}
          <div className="w-[150px] bg-[#0c2447] border-2 border-[#42a5f5] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-[#90caf9] mb-3 px-1 leading-tight">
              when() Actions
              <br />
              (HTTP Client Dispatch)
            </div>
            <div className="w-full space-y-2">
              {[
                'GET (Retrieve)',
                'POST (Create)',
                'PUT (Replace)',
                'PATCH (Update)',
                'DELETE (Remove)',
              ].map((meth) => (
                <div
                  key={meth}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#1e88e5] to-[#1565c0] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                >
                  {meth}
                </div>
              ))}
            </div>
          </div>

          {/* BIDIRECTIONAL ARROWS: HTTP Request / Response */}
          <div className="w-[60px] h-[100px] flex flex-col justify-around items-center">
            <svg className="w-12 h-6" viewBox="0 0 50 20">
              <polygon points="0,5 30,5 30,0 48,10 30,20 30,15 0,15" fill="#42a5f5" />
            </svg>
            <svg className="w-12 h-6" viewBox="0 0 50 20">
              <polygon points="48,5 18,5 18,0 0,10 18,20 18,15 48,15" fill="#66bb6a" />
            </svg>
          </div>

          {/* COLUMN 4: then() Validations */}
          <div className="w-[170px] bg-[#14331d] border-2 border-[#66bb6a] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-[#a5d6a7] mb-3 px-1 leading-tight">
              then() Verifications
              <br />
              (ResponseSpecification)
            </div>
            <div className="w-full space-y-2">
              {[
                'Status Code (200 / 201)',
                'Hamcrest Body Matchers',
                'Response Time SLA (<500ms)',
                'JSON Schema RFC Check',
                'Response POJO Extraction',
              ].map((res) => (
                <div
                  key={res}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#43a047] to-[#2e7d32] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/60 shadow-md"
                >
                  {res}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Protocol Sub-Banner */}
      <div className="bg-[#241340] border-t border-[#432373] py-2 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#ea80fc] uppercase">
          BDD GIVEN-WHEN-THEN • 500 CONCURRENT TESTS IN 10 SECONDS VIA TESTNG PARALLEL
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// 4. AI FOR QA & AUTONOMOUS AGENT ARCHITECTURE
// =========================================================================
function AiQaDiagramGraphic() {
  return (
    <div className="w-full bg-[#0a1f24] border-2 border-[#164e57] rounded-2xl overflow-hidden shadow-2xl font-sans select-none">
      {/* Top Header Banner */}
      <div className="bg-[#00838f] border-b-4 border-[#006064] py-2.5 px-4 text-center">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-extrabold text-white tracking-wide">
          Autonomous AI-Augmented QA Engineering Architecture
        </h2>
      </div>

      {/* Top Protocol Sub-Banner */}
      <div className="bg-[#0e2f37] border-b border-[#155e6c] py-1 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#80deea] uppercase">
          MODEL CONTEXT PROTOCOL (MCP) • GEMINI REASONING • DYNAMIC HEURISTIC SELF-HEALING
        </span>
      </div>

      {/* Main Visual Blueprint Area */}
      <div className="p-4 sm:p-8 overflow-x-auto">
        <div className="min-w-[840px] flex items-center justify-between gap-3 py-6 px-2">
          {/* COLUMN 1: Jira & Spec Ingestion */}
          <div className="w-[170px] bg-[#0c2e36] border-2 border-[#26c6da] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-white mb-3 px-1 leading-tight">
              Specification Ingestion
              <br />
              &amp; User Stories
            </div>
            <div className="w-full space-y-2">
              {[
                'Jira Acceptance Criteria',
                'Figma Design Tokens',
                'OpenAPI / Swagger Specs',
                'HTML DOM Snapshots',
                'Database Schemas',
              ].map((spec) => (
                <div
                  key={spec}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#00acc1] to-[#00838f] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                >
                  {spec}
                </div>
              ))}
            </div>
          </div>

          {/* ARROW 1 */}
          <div className="w-[50px] flex items-center justify-center">
            <svg className="w-10 h-8" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#80deea"
                stroke="#26c6da"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 2: Gemini Cognitive Engine */}
          <div className="w-[155px] h-[155px] bg-gradient-to-b from-[#6a1b9a] to-[#4a148c] border-2 border-[#e1bee7] rounded-2xl shadow-2xl flex flex-col items-center justify-center p-3 text-center">
            <span className="text-sm font-extrabold text-white leading-tight uppercase drop-shadow-md">
              Gemini LLM
              <br />
              Cognitive Layer
            </span>
            <span className="text-[10px] font-mono text-[#ea80fc] mt-1 font-semibold">
              RCCF Prompting
            </span>
            <div className="w-full mt-2 pt-1 border-t border-purple-300/40 text-[10px] text-purple-200">
              BDD Feature Files
              <br />
              Boundary Matrices
              <br />
              Security Edge Cases
            </div>
          </div>

          {/* ARROW 2 */}
          <div className="w-[50px] flex items-center justify-center">
            <svg className="w-10 h-8" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#ce93d8"
                stroke="#ba68c8"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 3: Self-Healing & Scaffolding */}
          <div className="w-[170px] bg-[#1a3826] border-2 border-[#81c784] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-[#c8e6c9] mb-3 px-1 leading-tight">
              Self-Healing Engine
              <br />
              &amp; DOM Fingerprinting
            </div>
            <div className="w-full space-y-2">
              {[
                'Multi-Attribute Fingerprint',
                'Role & Text Semantic Match',
                'Similarity Score > 85%',
                'Page Object Scaffolding',
                'Synthetic Zod Data',
              ].map((sh) => (
                <div
                  key={sh}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#43a047] to-[#2e7d32] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/40 shadow-md"
                >
                  {sh}
                </div>
              ))}
            </div>
          </div>

          {/* ARROW 3 */}
          <div className="w-[50px] flex items-center justify-center">
            <svg className="w-10 h-8" viewBox="0 0 50 30">
              <polygon
                points="0,7 28,7 28,0 48,15 28,30 28,23 0,23"
                fill="#81c784"
                stroke="#43a047"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* COLUMN 4: Autonomous CI/CD Loop */}
          <div className="w-[170px] bg-[#3e2723] border-2 border-[#ff8a65] rounded-2xl p-3 shadow-lg flex flex-col items-center">
            <div className="text-center font-bold text-xs sm:text-sm text-[#ffccbc] mb-3 px-1 leading-tight">
              Autonomous CI/CD Loop
              <br />
              (MCP Tools Integration)
            </div>
            <div className="w-full space-y-2">
              {[
                'Headless Test Execution',
                'Trace Log Triage Agent',
                'Flake vs Bug Classifier',
                'Auto-Fix PR Generation',
                'LLM-as-a-Judge Eval',
              ].map((loop) => (
                <div
                  key={loop}
                  className="w-full py-1.5 px-2 bg-gradient-to-r from-[#e64a19] to-[#bf360c] text-white text-xs sm:text-sm font-bold text-center rounded-xl border border-white/60 shadow-md"
                >
                  {loop}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Protocol Sub-Banner */}
      <div className="bg-[#0e2f37] border-t border-[#155e6c] py-2 px-4 text-center">
        <span className="text-xs sm:text-sm font-extrabold tracking-widest text-[#80deea] uppercase">
          AUTONOMOUS AGENTS RESOLVE LOCATOR BREAKS IN REAL TIME &bull; ZERO PII SYNTHETIC DATA
        </span>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN VISUAL DIAGRAM CONTAINER
// =========================================================================
export default function CourseVisualDiagram({
  trackId = 'selenium-java',
}: {
  trackId?: SupportedDiagramTrack | string;
  showTitle?: boolean;
}) {
  const normalizedKey =
    trackId === 'selenium' || trackId === 'selenium-java'
      ? 'selenium-java'
      : trackId === 'playwright' || trackId === 'playwright-ts'
        ? 'playwright-ts'
        : trackId === 'api-testing'
          ? 'api-testing'
          : trackId === 'ai-qa'
            ? 'ai-qa'
            : 'selenium-java';

  return (
    <div className="w-full space-y-6">
      {/* Render the Course-Specific Visual Diagram Graphic Directly */}
      <div className="w-full">
        {normalizedKey === 'selenium-java' && <SeleniumDiagramGraphic />}
        {normalizedKey === 'playwright-ts' && <PlaywrightDiagramGraphic />}
        {normalizedKey === 'api-testing' && <RestAssuredDiagramGraphic />}
        {normalizedKey === 'ai-qa' && <AiQaDiagramGraphic />}
      </div>

      {/* Beginner-Friendly Breakdown for Manual Testers */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
          <Info className="w-5 h-5 text-emerald-400" />
          <span>Manual Tester&apos;s Visual Walkthrough: How to Read This Diagram</span>
        </div>

        {normalizedKey === 'selenium-java' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#29b6f6] uppercase text-xs">
                1. Language Bindings
              </span>
              <p>
                Your Java / Python test script is just an HTTP client writing commands like{' '}
                <code className="text-white">driver.get()</code> and{' '}
                <code className="text-white">element.click()</code>.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ff9800] uppercase text-xs">
                2. JSON Wire / W3C Protocol
              </span>
              <p>
                Translates your code into standardized REST requests over HTTP (e.g.{' '}
                <code className="text-white">POST /session/:id/element/:id/click</code>).
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#8bc34a] uppercase text-xs">3. Browser Drivers</span>
              <p>
                ChromeDriver / GeckoDriver runs as a local HTTP web server on port 9515, listening
                for commands and executing native OS calls.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#cddc39] uppercase text-xs">4. Real Browser</span>
              <p>
                The actual browser window on your desktop. Dispatches real DOM events and renders
                the webpage visually.
              </p>
            </div>
          </div>
        )}

        {normalizedKey === 'playwright-ts' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#00b0ff] uppercase text-xs">1. Test Runner</span>
              <p>
                Runs tests in parallel across worker processes with built-in auto-retry, video
                recording, and trace captures.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ea80fc] uppercase text-xs">2. Single Browser</span>
              <p>
                Launches ONE heavy OS browser process per worker, eliminating the 3-second penalty
                of opening a browser per test.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#00bfa5] uppercase text-xs">3. BrowserContexts</span>
              <p>
                Creates in-memory incognito sandboxes in 5ms with isolated cookies and tokens. Tests
                never leak data into each other.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#76ff03] uppercase text-xs">4. Auto-Waiting</span>
              <p>
                Verifies element is attached, visible, stable, enabled, and receiving pointer events
                before clicking. Zero <code className="text-white">Thread.sleep</code>.
              </p>
            </div>
          </div>
        )}

        {normalizedKey === 'api-testing' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ea80fc] uppercase text-xs">
                1. given() Preconditions
              </span>
              <p>
                Sets up Base URI, Bearer tokens, headers, and query parameters before dispatching
                the request.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ffb300] uppercase text-xs">
                2. Jackson Serialization
              </span>
              <p>
                Serializes strongly-typed Java POJOs into JSON payloads with zero escaped string
                errors.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#42a5f5] uppercase text-xs">
                3. when() HTTP Actions
              </span>
              <p>
                Dispatches GET, POST, PUT, DELETE requests against microservice endpoints over
                high-speed HTTP transport.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#66bb6a] uppercase text-xs">
                4. then() Validations
              </span>
              <p>
                Asserts status code 200, Hamcrest body matchers, latency SLA (&lt;500ms), and
                validates response against JSON Schema RFC.
              </p>
            </div>
          </div>
        )}

        {normalizedKey === 'ai-qa' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-300">
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#26c6da] uppercase text-xs">1. Spec Ingestion</span>
              <p>
                Ingests Jira acceptance criteria, Figma tokens, and OpenAPI schemas directly into
                the AI context.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ce93d8] uppercase text-xs">
                2. Gemini Cognitive Layer
              </span>
              <p>
                Applies Role-Context-Constraint prompting to synthesize BDD scenarios, boundary
                value tests, and SQL injection attack vectors.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#81c784] uppercase text-xs">
                3. Dynamic Self-Healing
              </span>
              <p>
                Captures multi-attribute element fingerprints and heals broken selectors in real
                time when frontend styling changes.
              </p>
            </div>
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <span className="font-bold text-[#ff8a65] uppercase text-xs">
                4. Autonomous CI/CD Loop
              </span>
              <p>
                MCP agents run headless browsers, triage failure traces, classify flakes vs bugs,
                and open pull requests automatically.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
