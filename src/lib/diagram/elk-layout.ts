import ELK, { ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk.bundled.js';
import { ArchitectureDiagramData, ArchitectureNode, ArchitectureEdge, ArchitectureLayer } from '@/types/architecture-diagram';

const elk = new ELK();

export interface PositionedNode extends ArchitectureNode {
  x: number;
  y: number;
  width: number;
  height: number;
  layerId?: string;
}

export interface PositionedEdge extends ArchitectureEdge {
  sections?: Array<{
    startPoint: { x: number; y: number };
    endPoint: { x: number; y: number };
    bendPoints?: Array<{ x: number; y: number }>;
  }>;
}

export interface PositionedLayer extends ArchitectureLayer {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramLayoutResult {
  width: number;
  height: number;
  nodes: PositionedNode[];
  edges: PositionedEdge[];
  layers: PositionedLayer[];
}

const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 100;
const LAYER_PADDING = 36;
const LAYER_HEADER_HEIGHT = 42;

/**
 * Executes automatic graph layout using ELK.js with layered hierarchy,
 * avoiding collisions, overlapping nodes, and out-of-bound connectors.
 */
export async function calculateElkLayout(
  diagram: ArchitectureDiagramData
): Promise<DiagramLayoutResult> {
  const isTB = diagram.direction === 'TB';
  const direction = isTB ? 'DOWN' : 'RIGHT';

  // Group nodes by layer if any
  const layerMap = new Map<string, ArchitectureNode[]>();
  const unlayeredNodes: ArchitectureNode[] = [];

  diagram.nodes.forEach((node) => {
    if (node.layer) {
      if (!layerMap.has(node.layer)) {
        layerMap.set(node.layer, []);
      }
      layerMap.get(node.layer)!.push(node);
    } else {
      unlayeredNodes.push(node);
    }
  });

  // Construct ELK graph definition
  const elkGraph: ElkNode = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '85',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    },
    children: diagram.nodes.map((node) => ({
      id: node.id,
      width: DEFAULT_NODE_WIDTH,
      height: DEFAULT_NODE_HEIGHT,
      layoutOptions: {
        'elk.portConstraints': 'FREE',
      },
    })),
    edges: diagram.edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  const layout = await elk.layout(elkGraph);

  const positionedNodes: PositionedNode[] = [];
  const nodePositionMap = new Map<string, { x: number; y: number; width: number; height: number }>();

  // Process positioned children
  (layout.children || []).forEach((child) => {
    const origNode = diagram.nodes.find((n) => n.id === child.id);
    if (origNode) {
      const pNode: PositionedNode = {
        ...origNode,
        x: (child.x || 0) + 40,
        y: (child.y || 0) + 40,
        width: child.width || DEFAULT_NODE_WIDTH,
        height: child.height || DEFAULT_NODE_HEIGHT,
        layerId: origNode.layer,
      };
      positionedNodes.push(pNode);
      nodePositionMap.set(pNode.id, {
        x: pNode.x,
        y: pNode.y,
        width: pNode.width,
        height: pNode.height,
      });
    }
  });

  // Calculate layer bounding boxes to clearly encapsulate member nodes
  const positionedLayers: PositionedLayer[] = [];
  const layerDefs = diagram.layers || [];

  layerMap.forEach((layerNodes, layerId) => {
    const def = layerDefs.find((l) => l.id === layerId) || {
      id: layerId,
      label: formatLayerTitle(layerId),
    };

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    layerNodes.forEach((node) => {
      const pos = nodePositionMap.get(node.id);
      if (pos) {
        minX = Math.min(minX, pos.x);
        minY = Math.min(minY, pos.y);
        maxX = Math.max(maxX, pos.x + pos.width);
        maxY = Math.max(maxY, pos.y + pos.height);
      }
    });

    if (minX !== Infinity) {
      positionedLayers.push({
        ...def,
        x: minX - LAYER_PADDING,
        y: minY - LAYER_HEADER_HEIGHT - 12,
        width: maxX - minX + LAYER_PADDING * 2,
        height: maxY - minY + LAYER_HEADER_HEIGHT + LAYER_PADDING + 16,
      });
    }
  });

  // Map edges
  const positionedEdges: PositionedEdge[] = diagram.edges.map((edge) => {
    const elkEdge = (layout.edges || []).find((e) => e.id === edge.id) as any;
    return {
      ...edge,
      sections: elkEdge?.sections,
    };
  });

  // Calculate diagram bounding box
  let totalWidth = layout.width ? layout.width + 100 : 1200;
  let totalHeight = layout.height ? layout.height + 100 : 700;

  positionedLayers.forEach((layer) => {
    totalWidth = Math.max(totalWidth, layer.x + layer.width + 60);
    totalHeight = Math.max(totalHeight, layer.y + layer.height + 60);
  });

  positionedNodes.forEach((node) => {
    totalWidth = Math.max(totalWidth, node.x + node.width + 60);
    totalHeight = Math.max(totalHeight, node.y + node.height + 60);
  });

  return {
    width: Math.max(totalWidth, 900),
    height: Math.max(totalHeight, 520),
    nodes: positionedNodes,
    edges: positionedEdges,
    layers: positionedLayers,
  };
}

function formatLayerTitle(id: string): string {
  return id
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') + (id.toLowerCase().includes('layer') ? '' : ' Layer');
}
