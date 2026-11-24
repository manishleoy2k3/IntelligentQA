import { ArchitectureDiagramTheme, ArchitectureNodeType, ArchitectureConnectionType } from '@/types/architecture-diagram';

export interface ThemeColors {
  background: string;
  canvasBg: string;
  layerBg: string;
  layerBorder: string;
  layerText: string;
  gridColor: string;
  textColor: string;
  textMuted: string;
  edgeStroke: string;
  edgeLabelBg: string;
  edgeLabelText: string;
  edgeLabelBorder: string;
  nodeBg: string;
  nodeBorder: string;
  nodeShadow: string;
  fontFamily: string;
}

export interface NodeTypeColorConfig {
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  accentBorder: string;
}

export const THEME_CONFIGS: Record<ArchitectureDiagramTheme, { name: string; description: string; colors: ThemeColors }> = {
  'clean-enterprise': {
    name: 'Clean Enterprise',
    description: 'Corporate slate palette, crisp borders, high readability for production architectures',
    colors: {
      background: '#FFFFFF',
      canvasBg: '#F8FAFC',
      layerBg: 'rgba(241, 245, 249, 0.65)',
      layerBorder: '#CBD5E1',
      layerText: '#334155',
      gridColor: '#E2E8F0',
      textColor: '#0F172A',
      textMuted: '#64748B',
      edgeStroke: '#475569',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#1E293B',
      edgeLabelBorder: '#CBD5E1',
      nodeBg: '#FFFFFF',
      nodeBorder: '#E2E8F0',
      nodeShadow: '0 4px 12px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif',
    },
  },
  'modern-technical': {
    name: 'Modern Technical',
    description: 'Indigo & cyan highlights with refined geometric contrast for cloud & developer platforms',
    colors: {
      background: '#FAFAFB',
      canvasBg: '#F4F5F8',
      layerBg: 'rgba(238, 242, 255, 0.6)',
      layerBorder: '#C7D2FE',
      layerText: '#3730A3',
      gridColor: '#E0E7FF',
      textColor: '#18181B',
      textMuted: '#71717A',
      edgeStroke: '#4F46E5',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#312E81',
      edgeLabelBorder: '#C7D2FE',
      nodeBg: '#FFFFFF',
      nodeBorder: '#E4E4E7',
      nodeShadow: '0 4px 14px rgba(79, 70, 229, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    },
  },
  'cloud-architecture': {
    name: 'Cloud Architecture',
    description: 'AWS/GCP/Azure cloud diagram standards with Sky & Cobalt accents',
    colors: {
      background: '#FFFFFF',
      canvasBg: '#F0F9FF',
      layerBg: 'rgba(224, 242, 254, 0.55)',
      layerBorder: '#7DD3FC',
      layerText: '#0369A1',
      gridColor: '#BAE6FD',
      textColor: '#0C4A6E',
      textMuted: '#0284C7',
      edgeStroke: '#0284C7',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#075985',
      edgeLabelBorder: '#7DD3FC',
      nodeBg: '#FFFFFF',
      nodeBorder: '#BAE6FD',
      nodeShadow: '0 4px 12px rgba(2, 132, 199, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
    },
  },
  'ai-architecture': {
    name: 'AI Architecture',
    description: 'Emerald and violet accents designed for LLM, Agentic & RAG pipelines',
    colors: {
      background: '#FAFAF9',
      canvasBg: '#F5F5F4',
      layerBg: 'rgba(236, 253, 245, 0.6)',
      layerBorder: '#A7F3D0',
      layerText: '#065F46',
      gridColor: '#D1FAE5',
      textColor: '#1C1917',
      textMuted: '#78716C',
      edgeStroke: '#059669',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#064E3B',
      edgeLabelBorder: '#A7F3D0',
      nodeBg: '#FFFFFF',
      nodeBorder: '#E7E5E4',
      nodeShadow: '0 4px 14px rgba(5, 150, 105, 0.08)',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
  },
  'automation-framework': {
    name: 'Automation Framework',
    description: 'Emerald, teal & amber styling for test automation, CI/CD and QA execution engines',
    colors: {
      background: '#FFFFFF',
      canvasBg: '#F0FDF4',
      layerBg: 'rgba(220, 252, 231, 0.55)',
      layerBorder: '#86EFAC',
      layerText: '#166534',
      gridColor: '#BBF7D0',
      textColor: '#14532D',
      textMuted: '#15803D',
      edgeStroke: '#16A34A',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#14532D',
      edgeLabelBorder: '#86EFAC',
      nodeBg: '#FFFFFF',
      nodeBorder: '#DCFCE7',
      nodeShadow: '0 4px 12px rgba(22, 163, 74, 0.08)',
      fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    },
  },
  'minimal-documentation': {
    name: 'Minimal Documentation',
    description: 'Black & white crisp technical drawing aesthetic for books & clean whitepapers',
    colors: {
      background: '#FFFFFF',
      canvasBg: '#FAFAFA',
      layerBg: 'rgba(244, 244, 245, 0.5)',
      layerBorder: '#D4D4D8',
      layerText: '#27272A',
      gridColor: '#E4E4E7',
      textColor: '#18181B',
      textMuted: '#52525B',
      edgeStroke: '#27272A',
      edgeLabelBg: '#FFFFFF',
      edgeLabelText: '#18181B',
      edgeLabelBorder: '#D4D4D8',
      nodeBg: '#FFFFFF',
      nodeBorder: '#D4D4D8',
      nodeShadow: '0 2px 6px rgba(0, 0, 0, 0.05)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
  },
};

export const NODE_TYPE_PALETTES: Record<ArchitectureNodeType, NodeTypeColorConfig> = {
  client: {
    badgeBg: '#EFF6FF',
    badgeText: '#1D4ED8',
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    accentBorder: '#93C5FD',
  },
  browser: {
    badgeBg: '#ECFDF5',
    badgeText: '#047857',
    iconBg: '#D1FAE5',
    iconColor: '#059669',
    accentBorder: '#6EE7B7',
  },
  application: {
    badgeBg: '#EEF2FF',
    badgeText: '#4338CA',
    iconBg: '#E0E7FF',
    iconColor: '#4F46E5',
    accentBorder: '#A5B4FC',
  },
  api: {
    badgeBg: '#F5F3FF',
    badgeText: '#6D28D9',
    iconBg: '#EDE9FE',
    iconColor: '#7C3AED',
    accentBorder: '#C4B5FD',
  },
  server: {
    badgeBg: '#F8FAFC',
    badgeText: '#334155',
    iconBg: '#E2E8F0',
    iconColor: '#475569',
    accentBorder: '#94A3B8',
  },
  database: {
    badgeBg: '#FEF3C7',
    badgeText: '#B45309',
    iconBg: '#FDE68A',
    iconColor: '#D97706',
    accentBorder: '#FCD34D',
  },
  'ai-model': {
    badgeBg: '#FAF5FF',
    badgeText: '#7E22CE',
    iconBg: '#F3E8FF',
    iconColor: '#9333EA',
    accentBorder: '#D8B4FE',
  },
  agent: {
    badgeBg: '#FDF2F8',
    badgeText: '#BE185D',
    iconBg: '#FCE7F3',
    iconColor: '#DB2777',
    accentBorder: '#F9A8D4',
  },
  'external-service': {
    badgeBg: '#F1F5F9',
    badgeText: '#475569',
    iconBg: '#E2E8F0',
    iconColor: '#64748B',
    accentBorder: '#CBD5E1',
  },
  queue: {
    badgeBg: '#FFFBEB',
    badgeText: '#92400E',
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
    accentBorder: '#FDE68A',
  },
  container: {
    badgeBg: '#F0FDFA',
    badgeText: '#0F766E',
    iconBg: '#CCFBF1',
    iconColor: '#0D9488',
    accentBorder: '#5EEAD4',
  },
  monitoring: {
    badgeBg: '#FEF2F2',
    badgeText: '#B91C1C',
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    accentBorder: '#FCA5A5',
  },
  'test-runner': {
    badgeBg: '#F0FDF4',
    badgeText: '#15803D',
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    accentBorder: '#86EFAC',
  },
  'cloud-service': {
    badgeBg: '#F0F9FF',
    badgeText: '#0369A1',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    accentBorder: '#7DD3FC',
  },
  security: {
    badgeBg: '#FFF1F2',
    badgeText: '#BE123C',
    iconBg: '#FFE4E6',
    iconColor: '#E11D48',
    accentBorder: '#FDA4AF',
  },
};

export const PROTOCOL_STYLES: Record<ArchitectureConnectionType, { strokeDasharray?: string; color: string; label: string }> = {
  sync: { color: '#2563EB', label: 'Synchronous' },
  async: { strokeDasharray: '6 4', color: '#D97706', label: 'Asynchronous' },
  http: { color: '#059669', label: 'HTTP' },
  https: { color: '#047857', label: 'HTTPS (TLS)' },
  websocket: { strokeDasharray: '4 4', color: '#7C3AED', label: 'WebSocket (Bi-directional)' },
  webdriver: { color: '#2563EB', label: 'W3C WebDriver' },
  api: { color: '#4F46E5', label: 'API Call' },
  'data-flow': { color: '#0891B2', label: 'Data Stream' },
  'event-flow': { strokeDasharray: '5 3', color: '#EA580C', label: 'Event Trigger' },
  'auth-flow': { strokeDasharray: '8 4', color: '#DC2626', label: 'Auth Token / Key' },
  dependency: { strokeDasharray: '2 2', color: '#64748B', label: 'Dependency' },
};
