'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { ArchitectureNodeType, ArchitectureDiagramTheme } from '@/types/architecture-diagram';
import { DiagramNodeIcon } from '../diagram-node-icon';
import { NODE_TYPE_PALETTES, THEME_CONFIGS } from '@/lib/diagram/themes';

export interface ArchitectureNodeData {
  id: string;
  type: ArchitectureNodeType;
  label: string;
  shortDescription?: string;
  technology?: string;
  version?: string;
  metadata?: Record<string, string>;
  layer?: string;
  theme?: ArchitectureDiagramTheme;
  isEditing?: boolean;
}

function ArchitectureCustomNode({ data, selected }: NodeProps<any>) {
  const nodeData = data as ArchitectureNodeData;
  const themeName = nodeData.theme || 'clean-enterprise';
  const theme = THEME_CONFIGS[themeName] || THEME_CONFIGS['clean-enterprise'];
  const palette = NODE_TYPE_PALETTES[nodeData.type] || NODE_TYPE_PALETTES.application;

  return (
    <div
      className={`relative w-[240px] rounded-xl border bg-white dark:bg-neutral-900 transition-all select-none ${
        selected
          ? 'ring-2 ring-emerald-500 shadow-lg border-emerald-500'
          : 'hover:shadow-md'
      }`}
      style={{
        borderColor: selected ? '#10B981' : palette.accentBorder,
        boxShadow: selected ? '0 8px 24px rgba(16, 185, 129, 0.2)' : theme.colors.nodeShadow,
      }}
    >
      {/* React Flow Handles on all four edges for flexible routing */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-left"
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white dark:!border-neutral-900 !rounded-full"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="source-right"
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-neutral-900 !rounded-full"
      />
      <Handle
        type="target"
        position={Position.Top}
        id="target-top"
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white dark:!border-neutral-900 !rounded-full"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="source-bottom"
        className="!w-2.5 !h-2.5 !bg-emerald-500 !border-2 !border-white dark:!border-neutral-900 !rounded-full"
      />

      {/* Left Accent Stripe */}
      <div
        className="absolute left-0 top-2 bottom-2 w-1 rounded-r"
        style={{ backgroundColor: palette.iconColor }}
      />

      <div className="p-3">
        {/* Header: Icon + Title + Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="p-1.5 rounded-lg shrink-0 flex items-center justify-center"
              style={{
                backgroundColor: palette.iconBg,
                color: palette.iconColor,
              }}
            >
              <DiagramNodeIcon type={nodeData.type} className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h4
                className="text-xs font-bold text-slate-900 dark:text-white truncate leading-tight"
                title={nodeData.label}
              >
                {nodeData.label}
              </h4>
              {nodeData.technology && (
                <span
                  className="text-[10px] font-semibold truncate block"
                  style={{ color: palette.iconColor }}
                >
                  {nodeData.technology}
                  {nodeData.version ? ` v${nodeData.version}` : ''}
                </span>
              )}
            </div>
          </div>

          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0"
            style={{
              backgroundColor: palette.badgeBg,
              color: palette.badgeText,
            }}
          >
            {nodeData.type.replace('-', ' ')}
          </span>
        </div>

        {/* Description Body */}
        {nodeData.shortDescription && (
          <p className="mt-2 text-[11px] text-slate-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
            {nodeData.shortDescription}
          </p>
        )}

        {/* Optional Metadata Tags */}
        {nodeData.metadata && Object.keys(nodeData.metadata).length > 0 && (
          <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-neutral-800 flex flex-wrap gap-1">
            {Object.entries(nodeData.metadata).map(([k, v]) => (
              <span
                key={k}
                className="text-[9px] px-1.5 py-0.2 bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 rounded font-mono"
              >
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(ArchitectureCustomNode);
