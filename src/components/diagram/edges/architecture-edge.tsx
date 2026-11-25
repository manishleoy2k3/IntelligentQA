'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import { ArchitectureConnectionType, ArchitectureDiagramTheme } from '@/types/architecture-diagram';
import { PROTOCOL_STYLES, THEME_CONFIGS } from '@/lib/diagram/themes';

export interface ArchitectureEdgeData {
  label?: string;
  protocol?: string;
  communicationType?: ArchitectureConnectionType;
  style?: 'solid' | 'dashed' | 'dotted';
  theme?: ArchitectureDiagramTheme;
}

function ArchitectureCustomEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  selected,
}: EdgeProps<any>) {
  const edgeData = (data || {}) as ArchitectureEdgeData;
  const themeName = edgeData.theme || 'clean-enterprise';
  const theme = THEME_CONFIGS[themeName] || THEME_CONFIGS['clean-enterprise'];

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const protoStyle = edgeData.communicationType
    ? PROTOCOL_STYLES[edgeData.communicationType]
    : PROTOCOL_STYLES['api'];

  const strokeColor = selected ? '#10B981' : protoStyle?.color || theme.colors.edgeStroke;

  const strokeDasharray =
    edgeData.style === 'dashed'
      ? '6 4'
      : edgeData.style === 'dotted'
        ? '3 3'
        : protoStyle?.strokeDasharray;

  const label = edgeData.label;
  const protocol = edgeData.protocol;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray,
        }}
      />
      {(label || protocol) && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className="nodrag nopan flex flex-col items-center px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 shadow-xs text-center"
          >
            {label && (
              <span className="text-[10px] font-semibold text-slate-800 dark:text-neutral-200 whitespace-nowrap">
                {label}
              </span>
            )}
            {protocol && (
              <span
                className="text-[9px] font-mono font-medium whitespace-nowrap"
                style={{ color: strokeColor }}
              >
                [{protocol}]
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default memo(ArchitectureCustomEdge);
