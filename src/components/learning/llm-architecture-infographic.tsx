'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Zap,
  HardDrive,
  Database,
  ArrowRight,
  ArrowDown,
  Info,
  CheckCircle2,
  Server,
  Binary,
  Sliders,
  Scale,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export default function LlmArchitectureInfographic() {
  const [activeTab, setActiveTab] = useState<'training' | 'inference' | 'components' | 'comparison' | 'scaling'>('training');
  const [selectedComponent, setSelectedComponent] = useState<string>('self-attention');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // The 10 Core Components mandated in Phase 8
  const componentsList = [
    {
      id: 'tokenization',
      name: '1. Tokenization',
      icon: Binary,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      summary: 'Breaks raw text strings into discrete sub-word numerical tokens.',
      technicalDetails: 'Modern tokenizers (like Byte-Pair Encoding / Tiktoken) convert words into integers using a fixed vocabulary (typically 32,000 to 128,000 tokens). Common words map to a single token, while uncommon or complex words decompose into multiple sub-word units.',
      qaImpact: 'Token boundaries directly dictate test assertions, regex matching, and character count limits in automated evaluation suites.',
    },
    {
      id: 'embeddings',
      name: '2. Token Embeddings',
      icon: Layers,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      summary: 'Projects discrete integer tokens into high-dimensional geometric vector space.',
      technicalDetails: 'Each token ID indexes a learned embedding matrix to extract a dense vector (e.g., 4,096 to 12,288 dimensions). Semantically related words (e.g. "click" and "tap") naturally cluster closely in this multi-dimensional coordinate space.',
      qaImpact: 'Understanding embedding cosine similarity is foundational for self-healing locators and semantic similarity verification.',
    },
    {
      id: 'positional-info',
      name: '3. Positional Information',
      icon: Sliders,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      summary: 'Injects sequence order coordinates so the model knows word positioning.',
      technicalDetails: 'Unlike recurrent neural networks (RNNs) that process text sequentially, transformers process all tokens simultaneously in parallel. Rotary Position Embeddings (RoPE) or sinusoidal vectors add positional coordinates so the model distinguishes "dog bites man" from "man bites dog".',
      qaImpact: 'Ensures sequential step order in generated BDD Cucumber scenarios is strictly preserved without chronological reversal.',
    },
    {
      id: 'self-attention',
      name: '4. Multi-Head Self-Attention',
      icon: Sparkles,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      summary: 'The core transformer engine: computes dynamic contextual attention weights across all tokens.',
      technicalDetails: 'For every token, the attention mechanism calculates Query (Q), Key (K), and Value (V) matrices. The dot-product Softmax((Q*K^T)/sqrt(d_k))*V allows each token to dynamically weight its relationship with every other token in the prompt, regardless of distance.',
      qaImpact: 'Enables an AI agent to resolve pronoun references in requirements, such as linking "it" back to "the checkout submit button" across multiple paragraphs.',
    },
    {
      id: 'feed-forward',
      name: '5. Feed-Forward Networks (FFN)',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      summary: 'Applies non-linear transformations to store and retrieve factual patterns.',
      technicalDetails: 'After self-attention mixes token information across the sequence, dense two-layer feed-forward networks process each position independently with non-linear activation functions (SwiGLU / GeLU), acting as associative key-value memory for world knowledge.',
      qaImpact: 'Contains the learned knowledge base of Playwright APIs, Selenium syntax, and Java language conventions.',
    },
    {
      id: 'transformer-layers',
      name: '6. Transformer Layers',
      icon: Server,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
      borderColor: 'border-violet-500/30',
      summary: 'Repeated stacked blocks of Attention + FFN that build progressively abstract reasoning.',
      technicalDetails: 'Frontier LLMs stack between 32 and 128 identical transformer blocks. Early layers learn low-level grammar and syntax; middle layers learn semantic logic and entity relations; deep layers perform multi-step deduction and algorithmic problem solving.',
      qaImpact: 'Determines the model depth required to synthesize complete end-to-end framework architectures versus simple one-line locators.',
    },
    {
      id: 'context-window',
      name: '7. Context Window',
      icon: Maximize2,
      color: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      borderColor: 'border-sky-500/30',
      summary: 'The maximum token buffer the model can observe and attend to in a single forward pass.',
      technicalDetails: 'Context windows have expanded from 2,048 tokens in GPT-3 to 128k, 1M, and 2M+ tokens in Gemini 2.5 and Claude 3.7. The attention mechanism requires memory proportional to the active context length, traditionally scaling quadratically O(N^2) or quasi-linearly with FlashAttention.',
      qaImpact: 'Directly bounds how much of your codebase, Swagger schema, or HTML DOM tree can be ingested during an automated test generation run.',
    },
    {
      id: 'model-parameters',
      name: '8. Model Parameters (Weights)',
      icon: Database,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      summary: 'The learned numerical weights stored in memory that define the model behavior.',
      technicalDetails: 'Parameter counts vary widely: 1B-3B for mobile edge devices, 7B-14B for local developer laptops, 70B for private enterprise servers, and 500B-1T+ (often Sparse Mixture-of-Experts) for frontier models. 175B is NOT a universal constant.',
      qaImpact: 'Dictates hardware hosting requirements, inference cost per test suite run, and local vs cloud deployment feasibility.',
    },
    {
      id: 'gpu-hardware',
      name: '9. GPU / TPU Hardware Accelerators',
      icon: Cpu,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      summary: 'High-bandwidth parallel compute chips (NVIDIA H100, B200, Google TPU v5p) executing matrix math.',
      technicalDetails: 'Both training and inference are fundamentally tensor matrix multiplication operations (GEMM). Tensor Core accelerators with High Bandwidth Memory (HBM3e) provide terabytes-per-second memory bandwidth to stream billions of parameters into compute cores.',
      qaImpact: 'Explains latency characteristics, queue timeouts, and throughput limits when scaling autonomous agents across hundreds of CI/CD threads.',
    },
    {
      id: 'next-token',
      name: '10. Next-Token Prediction',
      icon: ArrowRight,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      summary: 'Softmax probability calculation and autoregressive token-by-token generation.',
      technicalDetails: 'The final transformer layer passes hidden states to a Linear Head and Softmax function, yielding a probability distribution across the entire vocabulary. A decoding algorithm (Temperature, Top-P, Top-K) samples the next token, appends it to the sequence, and repeats the forward pass.',
      qaImpact: 'Highlights why temperature must be set to 0.0 or 0.1 in QA test generation to eliminate random syntax permutations and flakiness.',
    },
  ];

  // Training vs Inference Comparison Matrix
  const comparisonRows = [
    {
      dimension: 'Primary Objective',
      training: 'Learn universal patterns, syntax, facts, and reasoning from vast web-scale text corpora.',
      inference: 'Generate output responses to specific user prompts using fixed frozen parameters.',
    },
    {
      dimension: 'Mathematical Operation',
      training: 'Two-way flow: Forward pass (calculate loss) followed by Backward pass (backpropagation gradient descent).',
      inference: 'One-way flow: Forward pass only (autoregressive token generation). Zero backpropagation.',
    },
    {
      dimension: 'Parameter State',
      training: 'Continuously mutated and updated across millions of training steps via optimizers (AdamW).',
      inference: 'Completely static and frozen in read-only memory. No weights are altered during inference.',
    },
    {
      dimension: 'Hardware Scale',
      training: 'Massive compute clusters: thousands of interconnected GPUs/TPUs running continuously for months.',
      inference: 'Single GPU, small node, or local developer laptop (for quantized 7B/14B models).',
    },
    {
      dimension: 'Execution Latency',
      training: 'Batch-oriented throughput measured in hours, days, or months of compute time.',
      inference: 'Real-time interactive generation measured in milliseconds (20 - 150 tokens per second).',
    },
    {
      dimension: 'Financial Cost',
      training: 'Huge capital expenditure: $10M - $100M+ per training run for frontier foundation models.',
      inference: 'Operational cost: fractions of a cent per prompt (e.g., $0.0005 per 1,000 tokens).',
    },
  ];

  // Parameter Spectrum Data
  const parameterSpectrum = [
    { tier: 'Edge & Mobile SLMs', range: '1B - 3B', example: 'Gemma 2B, SmolLM', useCase: 'On-device auto-complete, lightweight mobile agents', vram: '2 - 4 GB' },
    { tier: 'Local Developer SDET', range: '7B - 14B', example: 'Qwen 2.5 Coder 7B, Mistral 7B', useCase: 'Private offline test script generation, IDE code review', vram: '8 - 16 GB' },
    { tier: 'Enterprise Self-Hosted', range: '32B - 70B', example: 'Llama 3.3 70B, DeepSeek R1 Distill', useCase: 'Enterprise test framework architecture, complex RAG', vram: '40 - 80 GB' },
    { tier: 'Frontier Foundation Models', range: '200B - 1T+ (Dense / MoE)', example: 'Gemini 2.5, GPT-4o, Claude 3.7', useCase: 'Autonomous test agents, multimodal vision regression', vram: 'Multi-Node H100 Cluster' },
  ];

  const currentComp = componentsList.find((c) => c.id === selectedComponent) || componentsList[3];

  return (
    <div
      className={`my-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden transition-all ${
        isExpanded ? 'fixed inset-4 z-50 overflow-y-auto bg-white/98 dark:bg-neutral-950/98 backdrop-blur-md ring-1 ring-emerald-500/30 p-6' : ''
      }`}
    >
      {/* Header Infographic Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-900/50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Architectural Infographic
              </span>
              <span className="text-xs text-indigo-200/80 font-mono">
                Large Language Model Internals
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              End-to-End LLM Architecture: Training vs Inference Deep-Dive
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
              Explore how raw internet text is transformed into numerical weights during pre-training, and how frozen transformer layers generate next-token test code at runtime.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition cursor-pointer"
              title={isExpanded ? 'Exit Fullscreen' : 'Expand Fullscreen'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-4 border-t border-white/10">
          {[
            { id: 'training', label: 'A. Training Phase Pipeline', icon: Database },
            { id: 'inference', label: 'B. Inference Phase Pipeline', icon: Zap },
            { id: 'components', label: 'C. 10 Core Components Visualizer', icon: Layers },
            { id: 'comparison', label: 'D. Training vs Inference Matrix', icon: Scale },
            { id: 'scaling', label: 'E. Parameter Spectrum (1B to 1T+)', icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'bg-white/10 hover:bg-white/15 text-indigo-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Body */}
      <div className="p-6">
        {/* ========================================================================= */}
        {/* VIEW 1: TRAINING PHASE PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === 'training' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-300 text-xs leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Training Phase: Learning Deep Representations:</strong> Raw text corpora (books, code repositories, documentation) are cleaned, tokenized, and passed forward through transformer blocks to compute prediction loss. Backpropagation gradient descent iteratively optimizes billions of model parameters across thousands of GPU hours.
              </div>
            </div>

            {/* Step-by-Step Training Pipeline Flow */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5 relative">
              {[
                { step: '1', title: 'Training Data', sub: 'Terabytes of web text, GitHub code, documentation', badge: 'Source' },
                { step: '2', title: 'Text Processing', sub: 'Deduplication, filtering, HTML/boilerplate cleaning', badge: 'ETL' },
                { step: '3', title: 'Tokenization', sub: 'Byte-pair encoding into vocabulary token IDs', badge: 'Tokens' },
                { step: '4', title: 'Token Embeddings', sub: 'High-dimensional vector projection with position', badge: 'Vectors' },
                { step: '5', title: 'Transformer Core', sub: 'Self-attention and feed-forward forward pass', badge: 'Architecture', highlight: true },
                { step: '6', title: 'Pattern Learning', sub: 'Loss calculation (cross-entropy) & backprop', badge: 'Gradients' },
                { step: '7', title: 'Model Parameters', sub: 'Optimized weights saved into checkpoint file', badge: 'Trained Weights' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between text-center ${
                    item.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-200">
                      Step {item.step} · {item.badge}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-normal">
                      {item.sub}
                    </p>
                  </div>
                  {idx < 6 && (
                    <div className="hidden md:flex justify-center pt-3 text-slate-400">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Result: Billions of parameters encode language syntax, reasoning, and test framework conventions.</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">Resource: 10,000+ GPU-hours (NVIDIA H100)</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: INFERENCE PHASE PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === 'inference' && (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300 text-xs leading-relaxed flex items-start gap-3">
              <Zap className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Inference Phase: Real-Time Token Generation:</strong> When an SDET asks an agent to generate test scripts, the model weights remain 100% frozen. The prompt is converted into embeddings, processed through the transformer layers in a single forward pass, and the next token is sampled from the vocabulary probability curve until the final token is emitted.
              </div>
            </div>

            {/* Inference Steps */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {[
                { step: '1', title: 'User Input (Prompt)', desc: '"Write Playwright POM for Login with semantic locators"', badge: 'Input Text' },
                { step: '2', title: 'Tokenization', desc: 'Mapped to integers: [1542, 8914, 284, ...]', badge: 'Tokenizer' },
                { step: '3', title: 'Vector Embeddings', desc: 'Projected into 4096-dimensional geometric space', badge: 'Embedding Matrix' },
                { step: '4', title: 'Transformer Layers', desc: 'Multi-head self-attention computes context across tokens', badge: 'Frozen Weights', highlight: true },
                { step: '5', title: 'Next Token Prediction', desc: 'Softmax probability curve sampled with Temperature', badge: 'Probabilities' },
                { step: '6', title: 'Final Response Stream', desc: 'Generated TypeScript code emitted back to user/IDE', badge: 'Complete Output' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col justify-between text-center ${
                    item.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/30'
                      : 'bg-slate-50 dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-200">
                      Step {item.step} · {item.badge}
                    </span>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-600 dark:text-neutral-400 leading-normal">
                      {item.desc}
                    </p>
                  </div>
                  {idx < 5 && (
                    <div className="hidden md:flex justify-center pt-3 text-slate-400">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero backpropagation during inference. Weights remain completely unchanged.</span>
              </div>
              <span className="font-mono text-[11px] text-slate-500">Latency: 20-100 ms per token</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: 10 CORE COMPONENTS VISUALIZER */}
        {/* ========================================================================= */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Click on any of the 10 fundamental components to inspect its internal mechanics, architectural purpose, and direct practical impact on automated QA engineering:
            </p>

            {/* Component Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {componentsList.map((comp) => {
                const isSelected = comp.id === selectedComponent;
                const Icon = comp.icon;
                return (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => setSelectedComponent(comp.id)}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${comp.bgColor} ${comp.borderColor} ring-2 ring-emerald-400/40 shadow-xs`
                        : 'bg-slate-50 dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${comp.color}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {comp.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2">
                      {comp.summary}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Selected Component Deep Dive Card */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-neutral-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${currentComp.bgColor} border ${currentComp.borderColor}`}>
                    <currentComp.icon className={`w-5 h-5 ${currentComp.color}`} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentComp.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-neutral-400">
                      {currentComp.summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-neutral-800/90 border border-slate-200 dark:border-neutral-700 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Technical Architecture &amp; Mechanics</span>
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                    {currentComp.technicalDetails}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-World QA &amp; SDET Practical Impact</span>
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                    {currentComp.qaImpact}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: TRAINING VS INFERENCE MATRIX */}
        {/* ========================================================================= */}
        {activeTab === 'comparison' && (
          <div className="space-y-4 overflow-x-auto">
            <p className="text-xs text-slate-600 dark:text-neutral-400">
              Clear technical comparison distinguishing the training phase from runtime inference:
            </p>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/80">
                  <th className="py-3 px-4 font-bold text-slate-900 dark:text-white w-1/5">Architectural Dimension</th>
                  <th className="py-3 px-4 font-bold text-blue-600 dark:text-blue-400 w-2/5">Training Phase (Pre-Training / Fine-Tuning)</th>
                  <th className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400 w-2/5">Inference Phase (Runtime Generation)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-800/60">
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-neutral-800/30 transition">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white align-top">
                      {row.dimension}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-neutral-300 leading-relaxed align-top">
                      {row.training}
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-neutral-300 leading-relaxed align-top">
                      {row.inference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: PARAMETER SPECTRUM (NOT UNIVERSALLY 175B) */}
        {/* ========================================================================= */}
        {activeTab === 'scaling' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-300 text-xs leading-relaxed flex items-start gap-3">
              <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Important Architecture Principle:</strong> 175 Billion parameters is NOT a universal requirement for Large Language Models. Model sizes span a spectrum from lightweight 1B-3B Small Language Models (SLMs) on mobile devices to 7B-14B local developer models, 70B enterprise models, and trillion-parameter Mixture-of-Experts (MoE) frontier models.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {parameterSpectrum.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-800/70 space-y-2"
                >
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    {item.range}
                  </span>
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.tier}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    <strong>Examples:</strong> {item.example}
                  </p>
                  <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed">
                    <strong>QA Workload:</strong> {item.useCase}
                  </p>
                  <div className="pt-2 border-t border-slate-200 dark:border-neutral-700 text-[11px] font-mono text-slate-500">
                    Hardware: {item.vram}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { LlmArchitectureInfographic };
