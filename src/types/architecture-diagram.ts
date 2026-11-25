export type ArchitectureNodeType =
  | 'client'
  | 'browser'
  | 'application'
  | 'api'
  | 'server'
  | 'database'
  | 'ai-model'
  | 'agent'
  | 'external-service'
  | 'queue'
  | 'container'
  | 'monitoring'
  | 'test-runner'
  | 'cloud-service'
  | 'security';

export type ArchitectureConnectionType =
  | 'sync'
  | 'async'
  | 'http'
  | 'https'
  | 'websocket'
  | 'webdriver'
  | 'api'
  | 'data-flow'
  | 'event-flow'
  | 'auth-flow'
  | 'dependency';

export type ArchitectureEdgeStyle = 'solid' | 'dashed' | 'dotted';

export type ArchitectureDiagramTheme =
  | 'clean-enterprise'
  | 'modern-technical'
  | 'cloud-architecture'
  | 'ai-architecture'
  | 'automation-framework'
  | 'minimal-documentation';

export interface ArchitectureLayer {
  id: string;
  label: string;
  description?: string;
  color?: string;
}

export interface ArchitectureNode {
  id: string;
  type: ArchitectureNodeType;
  label: string;
  shortDescription?: string;
  technology?: string;
  version?: string;
  metadata?: Record<string, string>;
  layer?: string;
}

export interface ArchitectureEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  protocol?: string;
  communicationType?: ArchitectureConnectionType;
  style?: ArchitectureEdgeStyle;
  bidirectional?: boolean;
}

export interface ArchitectureLegendItem {
  label: string;
  color?: string;
  description?: string;
}

export interface ArchitectureDiagramData {
  diagramType: 'architecture';
  title: string;
  description?: string;
  layout?: 'layered' | 'hierarchical';
  direction?: 'LR' | 'TB';
  theme?: ArchitectureDiagramTheme;
  layers?: ArchitectureLayer[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  legend?: ArchitectureLegendItem[];
  technicalNotes?: string[];
}

export interface DiagramReviewIssue {
  severity: 'error' | 'warning' | 'info';
  category:
    'relationship' | 'missing-component' | 'ambiguous-connection' | 'protocol' | 'assumption';
  message: string;
  nodeIds?: string[];
  edgeIds?: string[];
  suggestion?: string;
}

export interface DiagramReviewResult {
  passed: boolean;
  score: number;
  summary: string;
  issues: DiagramReviewIssue[];
}

export type DiagramEngineMode = 'MODE_A_ARCHITECTURE' | 'MODE_B_INFOGRAPHIC';

export interface StoredDiagramRecord {
  id: string;
  title: string;
  description?: string;
  mode: DiagramEngineMode;
  architectureData?: ArchitectureDiagramData;
  svgContent?: string;
  imageUrl?: string;
  pngUrl?: string;
  courseId?: string;
  lessonId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  metadata?: Record<string, any>;
}
