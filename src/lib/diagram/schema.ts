import { z } from 'zod';

export const architectureNodeTypeSchema = z.enum([
  'client',
  'browser',
  'application',
  'api',
  'server',
  'database',
  'ai-model',
  'agent',
  'external-service',
  'queue',
  'container',
  'monitoring',
  'test-runner',
  'cloud-service',
  'security',
]);

export const architectureConnectionTypeSchema = z.enum([
  'sync',
  'async',
  'http',
  'https',
  'websocket',
  'webdriver',
  'api',
  'data-flow',
  'event-flow',
  'auth-flow',
  'dependency',
]);

export const architectureEdgeStyleSchema = z.enum(['solid', 'dashed', 'dotted']);

export const architectureDiagramThemeSchema = z.enum([
  'clean-enterprise',
  'modern-technical',
  'cloud-architecture',
  'ai-architecture',
  'automation-framework',
  'minimal-documentation',
]);

export const architectureLayerSchema = z.object({
  id: z.string().min(1, 'Layer ID is required'),
  label: z.string().min(1, 'Layer label is required'),
  description: z.string().optional(),
  color: z.string().optional(),
});

export const architectureNodeSchema = z.object({
  id: z.string().min(1, 'Node ID is required'),
  type: architectureNodeTypeSchema,
  label: z.string().min(1, 'Node label is required'),
  shortDescription: z.string().optional(),
  technology: z.string().optional(),
  version: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
  layer: z.string().optional(),
});

export const architectureEdgeSchema = z.object({
  id: z.string().min(1, 'Edge ID is required'),
  source: z.string().min(1, 'Edge source is required'),
  target: z.string().min(1, 'Edge target is required'),
  label: z.string().optional(),
  protocol: z.string().optional(),
  communicationType: architectureConnectionTypeSchema.optional(),
  style: architectureEdgeStyleSchema.optional(),
  bidirectional: z.boolean().optional(),
});

export const architectureLegendItemSchema = z.object({
  label: z.string().min(1),
  color: z.string().optional(),
  description: z.string().optional(),
});

export const architectureDiagramSchema = z
  .object({
    diagramType: z.literal('architecture'),
    title: z.string().min(1, 'Diagram title is required'),
    description: z.string().optional(),
    layout: z.enum(['layered', 'hierarchical']).default('layered').optional(),
    direction: z.enum(['LR', 'TB']).default('LR').optional(),
    theme: architectureDiagramThemeSchema.default('clean-enterprise').optional(),
    layers: z.array(architectureLayerSchema).optional().default([]),
    nodes: z.array(architectureNodeSchema).min(1, 'At least one architecture node is required'),
    edges: z.array(architectureEdgeSchema).default([]),
    legend: z.array(architectureLegendItemSchema).optional().default([]),
    technicalNotes: z.array(z.string()).optional().default([]),
  })
  .superRefine((data, ctx) => {
    // 1. Verify unique node IDs
    const nodeIds = new Set<string>();
    data.nodes.forEach((node, index) => {
      if (nodeIds.has(node.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate node ID detected: "${node.id}". Node IDs must be unique.`,
          path: ['nodes', index, 'id'],
        });
      }
      nodeIds.add(node.id);
    });

    // 2. Verify all edge source and target nodes exist
    data.edges.forEach((edge, index) => {
      if (!nodeIds.has(edge.source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edge.id}" references non-existent source node: "${edge.source}".`,
          path: ['edges', index, 'source'],
        });
      }
      if (!nodeIds.has(edge.target)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edge.id}" references non-existent target node: "${edge.target}".`,
          path: ['edges', index, 'target'],
        });
      }
      if (edge.source === edge.target) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Edge "${edge.id}" connects a node to itself ("${edge.source}"), which is invalid for architecture diagrams.`,
          path: ['edges', index, 'target'],
        });
      }
    });

    // 3. Verify unique edge IDs
    const edgeIds = new Set<string>();
    data.edges.forEach((edge, index) => {
      if (edgeIds.has(edge.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate edge ID detected: "${edge.id}". Edge IDs must be unique.`,
          path: ['edges', index, 'id'],
        });
      }
      edgeIds.add(edge.id);
    });

    // 4. Verify layers if referenced by nodes
    if (data.layers && data.layers.length > 0) {
      const validLayerIds = new Set(data.layers.map((l) => l.id));
      data.nodes.forEach((node, index) => {
        if (node.layer && !validLayerIds.has(node.layer)) {
          // If layer not found in layers array, add it or warn
          // We can allow automatic layer discovery or flag
        }
      });
    }
  });

export type ArchitectureDiagramInput = z.infer<typeof architectureDiagramSchema>;

export function validateArchitectureDiagram(data: unknown): {
  success: boolean;
  data?: ArchitectureDiagramInput;
  error?: string;
  details?: z.ZodIssue[];
} {
  const result = architectureDiagramSchema.safeParse(data);
  if (!result.success) {
    const errorMsg = result.error.issues
      .map((issue) => `[${issue.path.join('.')}] ${issue.message}`)
      .join('; ');
    return {
      success: false,
      error: errorMsg,
      details: result.error.issues,
    };
  }
  return {
    success: true,
    data: result.data,
  };
}
