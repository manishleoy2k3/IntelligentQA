import { ArchitectureDiagramData, ArchitectureNodeType } from '@/types/architecture-diagram';
import { DiagramLayoutResult, PositionedNode, PositionedEdge, PositionedLayer } from './elk-layout';
import { THEME_CONFIGS, NODE_TYPE_PALETTES, PROTOCOL_STYLES } from './themes';
import { sanitizeSvg } from './sanitizer';

// Inline vector icon SVG paths for zero-dependency standalone rendering
const NODE_ICONS_SVG: Record<ArchitectureNodeType, string> = {
  client: '<rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="8" y1="20" x2="16" y2="20" stroke="currentColor" stroke-width="2"/><line x1="12" y1="16" x2="12" y2="20" stroke="currentColor" stroke-width="2"/>',
  browser: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" stroke-width="2"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" fill="none" stroke="currentColor" stroke-width="2"/>',
  application: '<polygon points="12 2 2 7 12 12 22 7 12 2" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="2 17 12 22 22 17" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="2 12 12 17 22 12" fill="none" stroke="currentColor" stroke-width="2"/>',
  api: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" stroke-width="2"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="2" y="14" width="20" height="8" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="6" y1="6" x2="6.01" y2="6" stroke="currentColor" stroke-width="2"/><line x1="6" y1="18" x2="6.01" y2="18" stroke="currentColor" stroke-width="2"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" fill="none" stroke="currentColor" stroke-width="2"/>',
  'ai-model': '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>',
  agent: '<rect x="3" y="11" width="18" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="5" r="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v4" stroke="currentColor" stroke-width="2"/><line x1="8" y1="16" x2="8.01" y2="16" stroke="currentColor" stroke-width="2"/><line x1="16" y1="16" x2="16.01" y2="16" stroke="currentColor" stroke-width="2"/>',
  'external-service': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="15 3 21 3 21 9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" stroke-width="2"/>',
  queue: '<line x1="4" y1="6" x2="20" y2="6" stroke="currentColor" stroke-width="2"/><line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" stroke-width="2"/><line x1="4" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="2"/><circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="18" r="1" fill="currentColor"/>',
  container: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="none" stroke="currentColor" stroke-width="2"/><polyline points="3.27 6.96 12 12.01 20.73 6.96" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>',
  monitoring: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" fill="none" stroke="currentColor" stroke-width="2"/>',
  'test-runner': '<polygon points="5 3 19 12 5 21 5 3" fill="none" stroke="currentColor" stroke-width="2"/>',
  'cloud-service': '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke="currentColor" stroke-width="2"/>',
  security: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" stroke-width="2"/>',
};

/**
 * Generates an enterprise-grade, standalone SVG document for any architecture diagram.
 * Supports layers, custom node rendering, crisp connectors with labels, and theming.
 */
export function generateArchitectureSvg(
  diagram: ArchitectureDiagramData,
  layout: DiagramLayoutResult
): string {
  const themeName = diagram.theme || 'clean-enterprise';
  const theme = THEME_CONFIGS[themeName] || THEME_CONFIGS['clean-enterprise'];
  const colors = theme.colors;

  const width = Math.max(layout.width + 120, 1000);
  const height = Math.max(layout.height + 180, 640);

  // Map nodes to fast lookup
  const nodeMap = new Map<string, PositionedNode>();
  layout.nodes.forEach((n) => nodeMap.set(n.id, n));

  // Build layers SVG
  const layersSvg = layout.layers
    .map((layer) => {
      const title = escapeXml(layer.label);
      return `
    <!-- Layer: ${title} -->
    <g class="architecture-layer" id="layer-${layer.id}">
      <rect 
        x="${layer.x}" 
        y="${layer.y}" 
        width="${layer.width}" 
        height="${layer.height}" 
        rx="16" 
        fill="${colors.layerBg}" 
        stroke="${colors.layerBorder}" 
        stroke-width="1.5" 
        stroke-dasharray="6 4"
      />
      <rect 
        x="${layer.x + 16}" 
        y="${layer.y + 12}" 
        width="${Math.min(title.length * 9 + 32, 260)}" 
        height="26" 
        rx="6" 
        fill="${colors.background}" 
        stroke="${colors.layerBorder}" 
        stroke-width="1"
      />
      <text 
        x="${layer.x + 28}" 
        y="${layer.y + 29}" 
        font-family="${colors.fontFamily}" 
        font-size="12" 
        font-weight="700" 
        fill="${colors.layerText}"
        letter-spacing="0.5"
      >
        ${title.toUpperCase()}
      </text>
    </g>`;
    })
    .join('\n');

  // Build edges SVG
  const edgesSvg = layout.edges
    .map((edge, idx) => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      if (!sourceNode || !targetNode) return '';

      const protoStyle = edge.communicationType
        ? PROTOCOL_STYLES[edge.communicationType]
        : PROTOCOL_STYLES['api'];
      const strokeColor = protoStyle?.color || colors.edgeStroke;
      const dashArray = edge.style === 'dashed' ? '6 4' : edge.style === 'dotted' ? '3 3' : (protoStyle?.strokeDasharray || '');

      // Calculate connection endpoints
      let x1 = sourceNode.x + sourceNode.width;
      let y1 = sourceNode.y + sourceNode.height / 2;
      let x2 = targetNode.x;
      let y2 = targetNode.y + targetNode.height / 2;

      // Check vertical layout
      if (diagram.direction === 'TB') {
        x1 = sourceNode.x + sourceNode.width / 2;
        y1 = sourceNode.y + sourceNode.height;
        x2 = targetNode.x + targetNode.width / 2;
        y2 = targetNode.y;
      } else if (sourceNode.x > targetNode.x) {
        // Target is left of source
        x1 = sourceNode.x;
        x2 = targetNode.x + targetNode.width;
      }

      // Orthogonal or smooth bezier path
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const pathData = diagram.direction === 'TB'
        ? `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`
        : `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

      const label = edge.label ? escapeXml(edge.label) : '';
      const protocol = edge.protocol ? escapeXml(edge.protocol) : '';

      const labelGroup = label || protocol ? `
      <g transform="translate(${midX}, ${midY})">
        <rect 
          x="-${Math.max(label.length, protocol.length) * 4 + 18}" 
          y="-14" 
          width="${Math.max(label.length, protocol.length) * 8 + 36}" 
          height="28" 
          rx="6" 
          fill="${colors.edgeLabelBg}" 
          stroke="${colors.edgeLabelBorder}" 
          stroke-width="1"
          filter="url(#shadow-subtle)"
        />
        <text 
          x="0" 
          y="${protocol ? '-1' : '4'}" 
          text-anchor="middle" 
          font-family="${colors.fontFamily}" 
          font-size="11" 
          font-weight="600" 
          fill="${colors.edgeLabelText}"
        >
          ${label}
        </text>
        ${protocol ? `
        <text 
          x="0" 
          y="10" 
          text-anchor="middle" 
          font-family="${colors.fontFamily}" 
          font-size="9" 
          font-weight="500" 
          fill="${strokeColor}"
        >
          [${protocol}]
        </text>` : ''}
      </g>` : '';

      return `
    <!-- Edge: ${edge.source} -> ${edge.target} -->
    <g class="architecture-edge" id="edge-${edge.id}">
      <path 
        d="${pathData}" 
        fill="none" 
        stroke="${strokeColor}" 
        stroke-width="2" 
        ${dashArray ? `stroke-dasharray="${dashArray}"` : ''}
        marker-end="url(#arrow-${themeName})"
      />
      ${labelGroup}
    </g>`;
    })
    .join('\n');

  // Build nodes SVG
  const nodesSvg = layout.nodes
    .map((node) => {
      const palette = NODE_TYPE_PALETTES[node.type] || NODE_TYPE_PALETTES.application;
      const iconSvg = NODE_ICONS_SVG[node.type] || NODE_ICONS_SVG.application;
      const label = escapeXml(node.label);
      const desc = node.shortDescription ? escapeXml(node.shortDescription) : '';
      const tech = node.technology ? escapeXml(node.technology) : '';
      const ver = node.version ? escapeXml(node.version) : '';

      return `
    <!-- Node: ${node.id} (${node.type}) -->
    <g class="architecture-node" id="node-${node.id}" transform="translate(${node.x}, ${node.y})">
      <!-- Node Card Container -->
      <rect 
        x="0" 
        y="0" 
        width="${node.width}" 
        height="${node.height}" 
        rx="12" 
        fill="${colors.nodeBg}" 
        stroke="${palette.accentBorder}" 
        stroke-width="1.5" 
        filter="url(#shadow-node)"
      />
      
      <!-- Left Accent Line -->
      <rect 
        x="0" 
        y="8" 
        width="4" 
        height="${node.height - 16}" 
        rx="2" 
        fill="${palette.iconColor}"
      />

      <!-- Icon Box -->
      <rect 
        x="14" 
        y="14" 
        width="34" 
        height="34" 
        rx="8" 
        fill="${palette.iconBg}"
      />
      <g transform="translate(19, 19)" color="${palette.iconColor}">
        <svg width="24" height="24" viewBox="0 0 24 24">
          ${iconSvg}
        </svg>
      </g>

      <!-- Node Type Badge -->
      <rect 
        x="${node.width - 92}" 
        y="14" 
        width="78" 
        height="18" 
        rx="4" 
        fill="${palette.badgeBg}"
      />
      <text 
        x="${node.width - 53}" 
        y="27" 
        text-anchor="middle" 
        font-family="${colors.fontFamily}" 
        font-size="9" 
        font-weight="700" 
        letter-spacing="0.5" 
        fill="${palette.badgeText}"
      >
        ${node.type.toUpperCase().replace('-', ' ')}
      </text>

      <!-- Component Title -->
      <text 
        x="56" 
        y="34" 
        font-family="${colors.fontFamily}" 
        font-size="13" 
        font-weight="700" 
        fill="${colors.textColor}"
      >
        ${truncate(label, 20)}
      </text>

      <!-- Technology Tag or Version -->
      ${tech || ver ? `
      <text 
        x="56" 
        y="50" 
        font-family="${colors.fontFamily}" 
        font-size="10" 
        font-weight="600" 
        fill="${palette.iconColor}"
      >
        ${tech}${ver ? ` v${ver}` : ''}
      </text>` : ''}

      <!-- Description Line -->
      <text 
        x="16" 
        y="76" 
        font-family="${colors.fontFamily}" 
        font-size="11" 
        fill="${colors.textMuted}"
      >
        ${truncate(desc, 32)}
      </text>
    </g>`;
    })
    .join('\n');

  // Title and header
  const titleText = escapeXml(diagram.title || 'Technical Architecture Diagram');
  const descText = diagram.description ? escapeXml(diagram.description) : '';

  // Notes and Legend Footer
  const legendSvg = diagram.legend && diagram.legend.length > 0 ? `
    <g transform="translate(60, ${height - 65})">
      <text font-family="${colors.fontFamily}" font-size="11" font-weight="700" fill="${colors.textColor}">Legend:</text>
      ${diagram.legend.map((item, i) => `
        <circle cx="${70 + i * 160}" cy="-4" r="5" fill="${item.color || colors.edgeStroke}" />
        <text x="${82 + i * 160}" y="0" font-family="${colors.fontFamily}" font-size="11" fill="${colors.textMuted}">${escapeXml(item.label)}</text>
      `).join('')}
    </g>` : '';

  const fullSvg = `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 ${width} ${height}" 
  width="100%" 
  height="100%" 
  style="background-color: ${colors.background}; font-family: ${colors.fontFamily}; display: block; max-width: 100%; border-radius: 16px;"
>
  <defs>
    <!-- Arrow Marker -->
    <marker 
      id="arrow-${themeName}" 
      viewBox="0 0 10 10" 
      refX="8" 
      refY="5" 
      markerWidth="6" 
      markerHeight="6" 
      orient="auto-start-reverse"
    >
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${colors.edgeStroke}" />
    </marker>

    <!-- Node Drop Shadow Filter -->
    <filter id="shadow-node" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.06"/>
    </filter>

    <filter id="shadow-subtle" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.04"/>
    </filter>

    <!-- Canvas Grid Pattern -->
    <pattern id="grid-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="${colors.gridColor}" />
    </pattern>
  </defs>

  <!-- Canvas Background -->
  <rect x="0" y="0" width="${width}" height="${height}" fill="${colors.background}" rx="16"/>
  <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grid-pattern)" opacity="0.6"/>

  <!-- Architecture Header -->
  <g transform="translate(60, 48)">
    <text font-size="22" font-weight="800" fill="${colors.textColor}" letter-spacing="-0.3">
      ${titleText}
    </text>
    ${descText ? `
    <text y="24" font-size="13" font-weight="400" fill="${colors.textMuted}">
      ${descText}
    </text>` : ''}
  </g>

  <!-- Diagram Content Container -->
  <g transform="translate(20, 60)">
    ${layersSvg}
    ${edgesSvg}
    ${nodesSvg}
  </g>

  <!-- Legend / Footer -->
  ${legendSvg}

  <!-- Watermark / Standard Signature -->
  <text 
    x="${width - 60}" 
    y="${height - 24}" 
    text-anchor="end" 
    font-size="10" 
    font-weight="600" 
    fill="${colors.textMuted}" 
    letter-spacing="0.4"
  >
    IntelligentQA Architecture Visualization Engine
  </text>
</svg>`.trim();

  return sanitizeSvg(fullSvg);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function truncate(str: string, maxLen: number): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen - 1) + '…' : str;
}
