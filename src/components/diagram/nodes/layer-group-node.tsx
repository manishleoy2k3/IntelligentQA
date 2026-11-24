'use client';

import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { THEME_CONFIGS } from '@/lib/diagram/themes';
import { ArchitectureDiagramTheme } from '@/types/architecture-diagram';

export interface LayerGroupNodeData {
  label: string;
  theme?: ArchitectureDiagramTheme;
  description?: string;
  width?: number;
  height?: number;
}

function LayerGroupNode({ data }: NodeProps<any>) {
  const layerData = data as LayerGroupNodeData;
  const themeName = layerData.theme || 'clean-enterprise';
  const theme = THEME_CONFIGS[themeName] || THEME_CONFIGS['clean-enterprise'];

  return (
    <div
      className="w-full h-full rounded-2xl border border-dashed transition-all p-3 pointer-events-none select-none"
      style={{
        backgroundColor: theme.colors.layerBg,
        borderColor: theme.colors.layerBorder,
      }}
    >
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-2xs">
        <span
          className="text-xs font-bold tracking-wider uppercase"
          style={{ color: theme.colors.layerText }}
        >
          {layerData.label}
        </span>
        {layerData.description && (
          <span className="text-[10px] text-slate-400 dark:text-neutral-500">
            • {layerData.description}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(LayerGroupNode);
