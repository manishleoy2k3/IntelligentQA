'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
  MarkerType,
  NodeTypes,
  EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ArchitectureCustomNode from './nodes/architecture-node';
import LayerGroupNode from './nodes/layer-group-node';
import ArchitectureCustomEdge from './edges/architecture-edge';
import {
  ArchitectureDiagramData,
  ArchitectureDiagramTheme,
  ArchitectureNode,
  ArchitectureEdge,
  ArchitectureNodeType,
} from '@/types/architecture-diagram';
import { THEME_CONFIGS, PROTOCOL_STYLES } from '@/lib/diagram/themes';
import { calculateElkLayout } from '@/lib/diagram/elk-layout';
import { generateArchitectureSvg } from '@/lib/diagram/svg-generator';

import {
  Download,
  Copy,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Code,
  Layout,
  Maximize2,
  Palette,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface DiagramCanvasProps {
  initialData: ArchitectureDiagramData;
  onDataChange?: (data: ArchitectureDiagramData) => void;
  onExportSvg?: (svg: string) => void;
  readOnly?: boolean;
}

export default function DiagramCanvas({
  initialData,
  onDataChange,
  onExportSvg,
  readOnly = false,
}: DiagramCanvasProps) {
  const [diagramData, setDiagramData] = useState<ArchitectureDiagramData>(initialData);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedTheme, setSelectedTheme] = useState<ArchitectureDiagramTheme>(
    initialData.theme || 'clean-enterprise'
  );
  const [direction, setDirection] = useState<'LR' | 'TB'>(initialData.direction || 'LR');
  const [copied, setCopied] = useState(false);
  const [jsonView, setJsonView] = useState(false);
  const [jsonInput, setJsonInput] = useState(JSON.stringify(initialData, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Edit Node Modal State
  const [editingNode, setEditingNode] = useState<ArchitectureNode | null>(null);
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [newNodeType, setNewNodeType] = useState<ArchitectureNodeType>('application');
  const [newNodeDesc, setNewNodeDesc] = useState('');
  const [newNodeTech, setNewNodeTech] = useState('');
  const [newNodeLayer, setNewNodeLayer] = useState('');

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      architectureNode: ArchitectureCustomNode as any,
      layerGroup: LayerGroupNode as any,
    }),
    []
  );

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      architectureEdge: ArchitectureCustomEdge as any,
    }),
    []
  );

  // Build React Flow Graph from Architecture Data & ELK
  const refreshLayout = useCallback(
    async (
      data: ArchitectureDiagramData,
      dir: 'LR' | 'TB',
      themeName: ArchitectureDiagramTheme
    ) => {
      try {
        const layoutDiagram = { ...data, direction: dir, theme: themeName };
        const layout = await calculateElkLayout(layoutDiagram);

        // Layer Nodes (background grouping)
        const rfLayerNodes: Node[] = layout.layers.map((layer) => ({
          id: `layer-${layer.id}`,
          type: 'layerGroup',
          position: { x: layer.x, y: layer.y },
          style: { width: layer.width, height: layer.height, zIndex: -1 },
          data: {
            label: layer.label,
            theme: themeName,
            description: layer.description,
            width: layer.width,
            height: layer.height,
          },
          selectable: false,
          draggable: false,
        }));

        // Architecture Nodes
        const rfNodes: Node[] = layout.nodes.map((n) => ({
          id: n.id,
          type: 'architectureNode',
          position: { x: n.x, y: n.y },
          data: {
            id: n.id,
            type: n.type,
            label: n.label,
            shortDescription: n.shortDescription,
            technology: n.technology,
            version: n.version,
            metadata: n.metadata,
            layer: n.layer,
            theme: themeName,
          },
          draggable: !readOnly,
        }));

        // Architecture Edges
        const rfEdges: Edge[] = data.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'architectureEdge',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: THEME_CONFIGS[themeName].colors.edgeStroke,
            width: 14,
            height: 14,
          },
          data: {
            label: e.label,
            protocol: e.protocol,
            communicationType: e.communicationType,
            style: e.style,
            theme: themeName,
          },
        }));

        setNodes([...rfLayerNodes, ...rfNodes]);
        setEdges(rfEdges);

        const currentSvg = generateArchitectureSvg(layoutDiagram, layout);
        onExportSvg?.(currentSvg);
      } catch (err) {
        console.error('Failed to calculate layout:', err);
      }
    },
    [onExportSvg, readOnly, setNodes, setEdges]
  );

  useEffect(() => {
    setDiagramData(initialData);
    setJsonInput(JSON.stringify(initialData, null, 2));
    refreshLayout(initialData, direction, selectedTheme);
  }, [initialData]);

  // Handle Theme Change
  const handleThemeChange = (newTheme: ArchitectureDiagramTheme) => {
    setSelectedTheme(newTheme);
    const updated = { ...diagramData, theme: newTheme };
    setDiagramData(updated);
    onDataChange?.(updated);
    refreshLayout(updated, direction, newTheme);
  };

  // Handle Direction Change
  const handleDirectionChange = (newDir: 'LR' | 'TB') => {
    setDirection(newDir);
    const updated = { ...diagramData, direction: newDir };
    setDiagramData(updated);
    onDataChange?.(updated);
    refreshLayout(updated, newDir, selectedTheme);
  };

  // Handle Edge Connection in Canvas
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const newEdge: ArchitectureEdge = {
        id: `e-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        label: 'Method Call',
        protocol: 'API',
        communicationType: 'api',
        style: 'solid',
      };
      const updatedEdges = [...diagramData.edges, newEdge];
      const updated = { ...diagramData, edges: updatedEdges };
      setDiagramData(updated);
      onDataChange?.(updated);
      refreshLayout(updated, direction, selectedTheme);
    },
    [diagramData, direction, onDataChange, refreshLayout, selectedTheme]
  );

  // Add Node Action
  const handleAddNode = () => {
    if (!newNodeLabel.trim()) return;
    const newId = `node_${newNodeLabel.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36).substring(2, 5)}`;
    const createdNode: ArchitectureNode = {
      id: newId,
      type: newNodeType,
      label: newNodeLabel.trim(),
      shortDescription: newNodeDesc.trim() || undefined,
      technology: newNodeTech.trim() || undefined,
      layer: newNodeLayer.trim() || undefined,
    };

    const updatedNodes = [...diagramData.nodes, createdNode];
    const updated = { ...diagramData, nodes: updatedNodes };
    setDiagramData(updated);
    onDataChange?.(updated);
    refreshLayout(updated, direction, selectedTheme);

    setShowAddNodeModal(false);
    setNewNodeLabel('');
    setNewNodeDesc('');
    setNewNodeTech('');
    setNewNodeLayer('');
  };

  // Delete Node Action
  const handleDeleteNode = (nodeId: string) => {
    const updatedNodes = diagramData.nodes.filter((n) => n.id !== nodeId);
    const updatedEdges = diagramData.edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    const updated = { ...diagramData, nodes: updatedNodes, edges: updatedEdges };
    setDiagramData(updated);
    onDataChange?.(updated);
    refreshLayout(updated, direction, selectedTheme);
  };

  // Download SVG
  const handleDownloadSvg = async () => {
    const layout = await calculateElkLayout({ ...diagramData, direction, theme: selectedTheme });
    const svg = generateArchitectureSvg(
      { ...diagramData, direction, theme: selectedTheme },
      layout
    );
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${diagramData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'architecture'}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download PNG (via Canvas rasterization)
  const handleDownloadPng = async () => {
    const layout = await calculateElkLayout({ ...diagramData, direction, theme: selectedTheme });
    const svg = generateArchitectureSvg(
      { ...diagramData, direction, theme: selectedTheme },
      layout
    );

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(layout.width + 120, 1200) * 2; // 2x Retina
      canvas.height = Math.max(layout.height + 180, 680) * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const pngUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = pngUrl;
            link.download = `${diagramData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'architecture'}.png`;
            link.click();
            URL.revokeObjectURL(pngUrl);
          }
        }, 'image/png');
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  // Copy SVG to clipboard
  const handleCopySvg = async () => {
    const layout = await calculateElkLayout({ ...diagramData, direction, theme: selectedTheme });
    const svg = generateArchitectureSvg(
      { ...diagramData, direction, theme: selectedTheme },
      layout
    );
    await navigator.clipboard.writeText(svg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Apply JSON Changes
  const handleApplyJson = () => {
    try {
      setJsonError(null);
      const parsed = JSON.parse(jsonInput);
      setDiagramData(parsed);
      onDataChange?.(parsed);
      refreshLayout(parsed, direction, selectedTheme);
      setJsonView(false);
    } catch (err: any) {
      setJsonError(`Invalid JSON: ${err.message}`);
    }
  };

  const themeColors = THEME_CONFIGS[selectedTheme].colors;

  return (
    <div className="relative w-full h-[620px] rounded-2xl border border-slate-200 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-950 overflow-hidden flex flex-col">
      {/* Top Diagram Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 z-10 shadow-2xs">
        {/* Title & Theme Selection */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200 dark:border-neutral-800">
            <Palette className="w-4 h-4 text-emerald-500" />
            <select
              value={selectedTheme}
              onChange={(e) => handleThemeChange(e.target.value as ArchitectureDiagramTheme)}
              className="text-xs font-semibold bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {Object.entries(THEME_CONFIGS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Direction Toggle */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-neutral-800 p-0.5 border border-slate-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => handleDirectionChange('LR')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                direction === 'LR'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900'
              }`}
            >
              Left → Right
            </button>
            <button
              type="button"
              onClick={() => handleDirectionChange('TB')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition cursor-pointer ${
                direction === 'TB'
                  ? 'bg-white dark:bg-neutral-700 text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900'
              }`}
            >
              Top ↓ Bottom
            </button>
          </div>

          {!readOnly && (
            <button
              type="button"
              onClick={() => setShowAddNodeModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Node
            </button>
          )}
        </div>

        {/* Export & Developer Tools */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setJsonView(!jsonView)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition cursor-pointer ${
              jsonView
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400'
                : 'bg-slate-100 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-slate-600 dark:text-neutral-300 hover:bg-slate-200'
            }`}
            title="Toggle Raw JSON Mode"
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleCopySvg}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 text-xs font-semibold transition cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copied' : 'SVG'}
          </button>

          <button
            type="button"
            onClick={handleDownloadSvg}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-200 border border-slate-200 dark:border-neutral-700 text-xs font-semibold transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            SVG
          </button>

          <button
            type="button"
            onClick={handleDownloadPng}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            PNG
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
      <div className="relative flex-1 w-full h-full">
        {jsonView ? (
          <div className="absolute inset-0 z-20 bg-neutral-900 p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="font-mono">Architecture Schema JSON Editor</span>
              <button
                type="button"
                onClick={handleApplyJson}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition cursor-pointer"
              >
                Apply Changes
              </button>
            </div>
            {jsonError && (
              <div className="p-2 rounded bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono">
                {jsonError}
              </div>
            )}
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="flex-1 w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-emerald-400 font-mono text-xs resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              spellCheck={false}
            />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={readOnly ? undefined : onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.2}
            maxZoom={2.5}
            className="bg-slate-50 dark:bg-neutral-950"
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={24}
              size={1.5}
              color={themeColors.gridColor}
            />
            <Controls className="!bg-white dark:!bg-neutral-900 !border-slate-200 dark:!border-neutral-800 !shadow-sm !rounded-xl overflow-hidden" />
          </ReactFlow>
        )}
      </div>

      {/* Add Node Modal Drawer */}
      {showAddNodeModal && (
        <div className="absolute inset-0 z-30 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-neutral-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Architecture Node
              </h3>
              <button
                type="button"
                onClick={() => setShowAddNodeModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Node Type (15 Enterprise Types)
                </label>
                <select
                  value={newNodeType}
                  onChange={(e) => setNewNodeType(e.target.value as ArchitectureNodeType)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white font-medium"
                >
                  <option value="client">Client Node</option>
                  <option value="browser">Browser Node</option>
                  <option value="application">Application Node</option>
                  <option value="api">API Node</option>
                  <option value="server">Server Node</option>
                  <option value="database">Database Node</option>
                  <option value="ai-model">AI Model Node</option>
                  <option value="agent">Agent Node</option>
                  <option value="external-service">External Service Node</option>
                  <option value="queue">Queue Node</option>
                  <option value="container">Container Node</option>
                  <option value="monitoring">Monitoring Node</option>
                  <option value="test-runner">Test Runner Node</option>
                  <option value="cloud-service">Cloud Service Node</option>
                  <option value="security">Security / Auth Node</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Component Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chrome Browser or ChromeDriver"
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Executes commands in browser DOM"
                  value={newNodeDesc}
                  onChange={(e) => setNewNodeDesc(e.target.value)}
                  className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Technology
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Java, W3C"
                    value={newNodeTech}
                    onChange={(e) => setNewNodeTech(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-neutral-300 mb-1">
                    Architecture Layer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. driver-layer"
                    value={newNodeLayer}
                    onChange={(e) => setNewNodeLayer(e.target.value)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowAddNodeModal(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-700 text-xs font-semibold text-slate-600 dark:text-neutral-300 hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNode}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Add Component
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
