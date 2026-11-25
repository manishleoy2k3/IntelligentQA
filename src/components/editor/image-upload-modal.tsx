'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Check,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react';

interface ImageUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (options: {
    src: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: 'left' | 'center' | 'right';
  }) => void;
}

export default function ImageUploadModal({
  isOpen,
  onClose,
  onInsertImage,
}: ImageUploadModalProps) {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [directUrl, setDirectUrl] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [width, setWidth] = useState<string>('100%');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Check size <= 10MB
    if (selected.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    if (!altText) setAltText(selected.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUploadAndInsert = async () => {
    setError(null);

    if (tab === 'url') {
      if (!directUrl.trim()) {
        setError('Please enter a valid image URL.');
        return;
      }
      onInsertImage({
        src: directUrl.trim(),
        alt: altText.trim(),
        caption: caption.trim(),
        width,
        alignment,
      });
      onClose();
      return;
    }

    if (!file) {
      setError('Please select an image file to upload.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt', altText || file.name);
      formData.append('caption', caption);
      formData.append('category', 'Academy Lessons');

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'x-admin-role': 'admin',
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      onInsertImage({
        src: data.item?.url || data.url || previewUrl,
        alt: altText.trim() || file.name,
        caption: caption.trim(),
        width,
        alignment,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error uploading image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="px-5 py-4 border-b border-[#27272A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Insert Image / Diagram</h3>
              <p className="text-[11px] text-zinc-400">Supports PNG, JPG, WebP, SVG, and GIFs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-[#27272A] bg-[#141417] px-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              tab === 'upload'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${
              tab === 'url'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Direct URL
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {tab === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#333] hover:border-emerald-500/60 rounded-xl p-6 text-center cursor-pointer bg-[#141417] hover:bg-[#1C1C20] transition-colors"
              >
                {previewUrl ? (
                  <div className="space-y-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-40 mx-auto rounded-lg object-contain shadow"
                    />
                    <p className="text-[11px] text-emerald-400 font-semibold">
                      Click to choose another image
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto" />
                    <p className="text-zinc-200 font-semibold">
                      Click to select or drag &amp; drop
                    </p>
                    <p className="text-zinc-500 text-[10px]">PNG, JPG, WebP, SVG up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-zinc-300 font-semibold">Image URL</label>
              <input
                type="url"
                value={directUrl}
                onChange={(e) => {
                  setDirectUrl(e.target.value);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://example.com/diagram.png"
                className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-[#2D2D2D] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          {/* METADATA: ALT & CAPTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">
                Alt Description (SEO &amp; A11y)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Architecture execution flow diagram"
                className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-[#2D2D2D] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Figure Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Figure 1.1: Distributed Automation"
                className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-[#2D2D2D] text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* FORMATTING: WIDTH & ALIGNMENT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#27272A]">
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Display Width</label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-[#2D2D2D] text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="100%">100% (Full Width)</option>
                <option value="75%">75% (Medium Large)</option>
                <option value="50%">50% (Half Width)</option>
                <option value="35%">35% (Compact)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-zinc-300 font-semibold">Alignment</label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setAlignment('left')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    alignment === 'left'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-[#2D2D2D] bg-[#141417] text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Left</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlignment('center')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    alignment === 'center'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-[#2D2D2D] bg-[#141417] text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Center</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAlignment('right')}
                  className={`flex-1 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition-colors ${
                    alignment === 'right'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-[#2D2D2D] bg-[#141417] text-zinc-400 hover:text-white'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                  <span>Right</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-5 py-3 border-t border-[#27272A] bg-[#141417] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#202025] text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUploadAndInsert}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <span>Uploading...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Insert Into Lesson</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
