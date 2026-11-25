'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  ExternalLink,
  Download,
  X,
  Move,
  Layers,
} from 'lucide-react';

export interface ContentImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  altText?: string;
  title?: string;
  caption?: string;
}

export default function ContentImageLightbox({
  isOpen,
  onClose,
  imageUrl,
  altText = '',
  title = '',
  caption = '',
}: ContentImageLightboxProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Reset zoom & pan when image changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen, imageUrl]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom((prev) => Math.min(prev + 0.25, 4));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
      } else if (e.key === '0') {
        e.preventDefault();
        setZoom(1);
        setPosition({ x: 0, y: 0 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoom((prev) => {
      const next = Math.min(Math.max(prev + delta, 0.5), 4);
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
      }
      return parseFloat(next.toFixed(2));
    });
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    e.preventDefault();
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen || !imageUrl) return null;

  const isSvg = imageUrl.toLowerCase().endsWith('.svg') || imageUrl.includes('.svg?');
  const displayTitle = title || altText || 'Diagram View';

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-neutral-950/92 backdrop-blur-md select-none animate-in fade-in duration-200"
      onMouseUp={handleMouseUp}
      role="dialog"
      aria-modal="true"
    >
      {/* Top Floating Action Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-neutral-900/90 border-b border-neutral-800/80 shadow-lg">
        {/* Title & Metadata */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-emerald-400 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md md:max-w-xl">
              {displayTitle}
            </h3>
            {caption && caption !== displayTitle && (
              <p className="text-xs text-neutral-400 truncate max-w-xs sm:max-w-md md:max-w-xl">
                {caption.replace(/^[📐\s]+/, '')}
              </p>
            )}
          </div>
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isSvg ? 'Vector SVG • 100% Crisp' : 'High-Resolution'}
          </span>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center bg-neutral-800/90 rounded-xl p-1 border border-neutral-700">
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.max(prev - 0.25, 0.5))}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700 transition cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs font-mono font-bold text-white min-w-[54px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((prev) => Math.min(prev + 0.25, 4))}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-700 transition cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-700 mx-1" />
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-700 transition cursor-pointer"
              title="Reset Zoom to 100% (0)"
            >
              100%
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1.5);
                setPosition({ x: 0, y: 0 });
              }}
              className="px-2 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:text-emerald-300 hover:bg-neutral-700 transition cursor-pointer hidden md:inline-block"
              title="Expand to 150%"
            >
              150%
            </button>
          </div>

          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            title="Open Original in New Tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href={imageUrl}
            download
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer hidden sm:flex"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-red-300 transition cursor-pointer ml-1"
            title="Close Lightbox (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Interactive Zoomable Canvas */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center p-4 sm:p-8"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onClick={(e) => {
          // If clicking strictly on the background backdrop, close
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        style={{
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }}
      >
        <div
          className="transition-transform duration-75 ease-out max-w-full max-h-full flex items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt={altText || displayTitle}
            className="max-h-[82vh] max-w-[92vw] w-auto h-auto object-contain rounded-xl shadow-2xl border border-neutral-800 bg-[#FAFAF9] dark:bg-neutral-900 pointer-events-auto"
            style={{
              imageRendering: '-webkit-optimize-contrast',
            }}
            draggable={false}
          />
        </div>

        {/* Helpful Tip Pill at Bottom */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-[11px] font-medium text-neutral-300 shadow-xl pointer-events-none flex items-center gap-2">
          <Move className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {zoom > 1
              ? 'Click and drag to pan • Scroll to zoom • Press Esc to close'
              : 'Scroll to zoom in • Double click or use controls to enlarge • Press Esc to close'}
          </span>
        </div>
      </div>
    </div>
  );
}
