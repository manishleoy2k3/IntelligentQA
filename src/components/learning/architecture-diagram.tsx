import React from 'react';
import { ArrowRight, Box, Layers, Network, Workflow } from 'lucide-react';
import { DiagramData } from '@/data/learning/academy-curriculum';

interface ArchitectureDiagramProps {
  data: DiagramData;
}

export default function ArchitectureDiagram({ data }: ArchitectureDiagramProps) {
  const getIcon = () => {
    switch (data.type) {
      case 'pipeline':
        return <Workflow className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'layers':
        return <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'client-server':
        return <Network className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <Box className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="my-8 rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/70 dark:bg-neutral-900/60 p-5 shadow-xs">
      {/* Diagram Header */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200/80 dark:border-neutral-800">
        <div className="p-1 rounded-md bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-xs">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {data.title}
          </h4>
          {data.caption && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.caption}
            </p>
          )}
        </div>
      </div>

      {/* Interactive Diagram Canvas */}
      <div className="relative py-2">
        {data.type === 'pipeline' ? (
          // Horizontal flow pipeline
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 overflow-x-auto pb-2">
            {data.nodes.map((node, idx) => (
              <React.Fragment key={node.id}>
                <div
                  className={`flex-1 min-w-[150px] p-3.5 rounded-xl border text-center transition-all ${
                    node.highlight
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 shadow-sm ring-1 ring-emerald-400/20'
                      : 'bg-white dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600 shadow-xs'
                  }`}
                >
                  {node.badge && (
                    <span className="inline-block px-1.5 py-0.5 mb-1.5 text-[10px] font-semibold tracking-wider uppercase rounded bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300">
                      {node.badge}
                    </span>
                  )}
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {node.label}
                  </h5>
                  {node.subtitle && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                      {node.subtitle}
                    </p>
                  )}
                </div>

                {idx < data.nodes.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-slate-400 dark:text-neutral-500 shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          // Grid / Stack layout for layers or client-server
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.nodes.map((node) => (
              <div
                key={node.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  node.highlight
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-600/50 shadow-xs ring-1 ring-emerald-400/20'
                    : 'bg-white dark:bg-neutral-800/90 border-slate-200 dark:border-neutral-700 shadow-xs'
                }`}
              >
                {node.badge && (
                  <span className="inline-block px-2 py-0.5 mb-1.5 text-[10px] font-semibold uppercase rounded bg-slate-100 dark:bg-neutral-700 text-slate-600 dark:text-slate-300">
                    {node.badge}
                  </span>
                )}
                <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {node.label}
                </h5>
                {node.subtitle && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {node.subtitle}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
