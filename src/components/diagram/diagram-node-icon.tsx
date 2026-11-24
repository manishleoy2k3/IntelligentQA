'use client';

import React from 'react';
import {
  Monitor,
  Globe,
  Layers,
  Link,
  Server,
  Database,
  Cpu,
  Bot,
  ExternalLink,
  ListOrdered,
  Box,
  Activity,
  Play,
  Cloud,
  Shield,
  LucideIcon,
} from 'lucide-react';
import { ArchitectureNodeType } from '@/types/architecture-diagram';

export const NODE_LUCIDE_ICONS: Record<ArchitectureNodeType, LucideIcon> = {
  client: Monitor,
  browser: Globe,
  application: Layers,
  api: Link,
  server: Server,
  database: Database,
  'ai-model': Cpu,
  agent: Bot,
  'external-service': ExternalLink,
  queue: ListOrdered,
  container: Box,
  monitoring: Activity,
  'test-runner': Play,
  'cloud-service': Cloud,
  security: Shield,
};

interface DiagramNodeIconProps {
  type: ArchitectureNodeType;
  className?: string;
}

export function DiagramNodeIcon({ type, className = 'w-5 h-5' }: DiagramNodeIconProps) {
  const IconComponent = NODE_LUCIDE_ICONS[type] || Layers;
  return <IconComponent className={className} />;
}
