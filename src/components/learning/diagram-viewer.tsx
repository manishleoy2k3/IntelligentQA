'use client';

import React, { useState } from 'react';
import {
  Workflow,
  Layers,
  Network,
  RotateCw,
  GitCommit,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  FileCode,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { TechnicalDiagramConfig } from '@/types/standard-lesson';

interface DiagramViewerProps {
  config: TechnicalDiagramConfig;
  className?: string;
}

export default function DiagramViewer({ config, className = '' }: DiagramViewerProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagram' | 'components'>('diagram');

  const getIcon = () => {
    switch (config.type) {
      case 'pipeline':
        return <Workflow className="w-4 h-4 text-emerald-500" />;
      case 'layers':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'client-server':
        return <Network className="w-4 h-4 text-cyan-500" />;
      case 'agent-loop':
        return <RotateCw className="w-4 h-4 text-amber-500" />;
      case 'sequence':
        return <GitCommit className="w-4 h-4 text-purple-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-500" />;
      default:
        return <Workflow className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div
      className={`my-8 rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden transition-all ${
        isZoomed ? 'fixed inset-4 z-50 flex flex-col p-6 overflow-y-auto bg-white/98 dark:bg-neutral-950/98 backdrop-blur-md ring-1 ring-emerald-500/30' : ''
      } ${className}`}
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-50 dark:bg-neutral-900/80 border-b border-slate-200 dark:border-neutral-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xs shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {config.title}
            </h4>
            {config.caption && (
              <p className="text-xs text-slate-500 dark:text-neutral-400 truncate">
                {config.caption}
              </p>
            )}
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {config.componentsExplanation && config.componentsExplanation.length > 0 && (
            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-neutral-800 p-0.5 border border-slate-200 dark:border-neutral-700">
              <button
                type="button"
                onClick={() => setActiveTab('diagram')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'diagram'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Diagram
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('components')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                  activeTab === 'components'
                    ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-neutral-400 hover:text-slate-900'
                }`}
              >
                Component Roles ({config.componentsExplanation.length})
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            title={isZoomed ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isZoomed ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="p-6">
        {activeTab === 'components' && Array.isArray(config.componentsExplanation) && config.componentsExplanation.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {config.componentsExplanation.map((comp, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/60 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                    {comp.name}
                  </h5>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {comp.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed">
                  {comp.details}
                </p>
              </div>
            ))}
          </div>
        ) : config.type === 'image' && config.imageUrl ? (
          <div className="flex flex-col items-center group relative cursor-zoom-in" onClick={() => setIsZoomed(true)}>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src={config.imageUrl}
                alt={config.altText || config.title}
                className="max-h-[640px] w-auto rounded-xl object-contain shadow-xs border border-slate-200 dark:border-neutral-800 transition-transform duration-200 group-hover:scale-[1.01]"
                loading="lazy"
                title="Click to expand fullscreen"
              />
              <div className="absolute inset-0 bg-neutral-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none rounded-xl">
                <span className="px-3 py-1.5 rounded-full bg-neutral-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-xs flex items-center gap-1.5 border border-neutral-700">
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                  Click to enlarge
                </span>
              </div>
            </div>
            {config.sourceAttribution && (
              <p className="text-[11px] text-slate-400 dark:text-neutral-500 mt-2 italic">
                Source: {config.sourceAttribution}
              </p>
            )}
          </div>
        ) : config.svgContent ? (
          <div
            className="w-full overflow-x-auto flex justify-center py-2 text-slate-800 dark:text-slate-200"
            dangerouslySetInnerHTML={{ __html: config.svgContent }}
          />
        ) : config.type === 'pipeline' && Array.isArray(config.nodes) && config.nodes.length > 0 ? (
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto pb-2">
            {config.nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div
                  className={`flex-1 min-w-[170px] p-4 rounded-xl border text-center transition-all ${
                    node.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 shadow-sm ring-1 ring-emerald-400/20'
                      : 'bg-white dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {node.badge && (
                    <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-mono font-bold tracking-wider uppercase rounded bg-slate-100 dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400">
                      {node.badge}
                    </span>
                  )}
                  <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                    {node.label}
                  </h5>
                  {node.subtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-neutral-400 mt-1 leading-normal">
                      {node.subtitle}
                    </p>
                  )}
                </div>

                {config.nodes && idx < config.nodes.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-slate-400 dark:text-neutral-500 shrink-0">
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : config.type === 'layers' && Array.isArray(config.nodes) && config.nodes.length > 0 ? (
          <div className="space-y-3">
            {config.nodes.map((node, idx) => (
              <div
                key={node.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  node.highlight
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/50'
                    : 'bg-slate-50/70 dark:bg-neutral-800/80 border-slate-200 dark:border-neutral-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-200 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                      {node.label}
                    </h5>
                    {node.subtitle && (
                      <p className="text-xs text-slate-500 dark:text-neutral-400">
                        {node.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                {node.badge && (
                  <span className="self-start sm:self-auto px-2.5 py-1 rounded text-xs font-mono font-semibold bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 border border-slate-200 dark:border-neutral-700">
                    {node.badge}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : Array.isArray(config.nodes) && config.nodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {config.nodes.map((node) => (
              <div
                key={node.id}
                className={`p-4 rounded-xl border ${
                  node.highlight
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50'
                    : 'bg-white dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700'
                }`}
              >
                {node.badge && (
                  <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-bold uppercase rounded bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-neutral-300">
                    {node.badge}
                  </span>
                )}
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                  {node.label}
                </h5>
                {node.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    {node.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-slate-400">
            Diagram configuration loaded.
          </div>
        )}
      </div>

      {/* Component Explanation Sub-Footer if on diagram tab */}
      {activeTab === 'diagram' && config.componentsExplanation && config.componentsExplanation.length > 0 && (
        <div className="px-6 py-4 bg-slate-50 dark:bg-neutral-950/50 border-t border-slate-200 dark:border-neutral-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-neutral-300 mb-3">
            <Info className="w-3.5 h-3.5 text-emerald-500" />
            <span>Key Architecture Components &amp; Responsibilities:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs">
            {config.componentsExplanation.slice(0, 6).map((comp, i) => (
              <div key={i} className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800">
                <span className="font-bold text-slate-900 dark:text-white">{comp.name}:</span>{' '}
                <span className="text-slate-600 dark:text-neutral-400">{comp.role}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { DiagramViewer };

export function renderPipelineDiagram(nodes: any[] = []) {
  return nodes.map((node) => node.label).join(' -> ');
}

export function renderMermaidDiagram(code: string = '') {
  return `<pre class="mermaid"><code>${code}</code></pre>`;
}

export function renderCustomImage(url: string, alt: string = '', caption?: string) {
  return `<figure><img src="${url}" alt="${alt}" /><figcaption>${caption || ''}</figcaption></figure>`;
}

export function renderSequenceDiagram(steps: any[] = []) {
  return steps.map((s) => `${s.from} ->> ${s.to}: ${s.message}`).join('\n');
}
