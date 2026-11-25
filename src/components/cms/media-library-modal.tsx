'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Search,
  Trash2,
  Check,
  X,
  Image as ImageIcon,
  Copy,
  ExternalLink,
  AlertCircle,
  Folder,
  Plus,
  Loader2,
  FileImage,
  Workflow,
} from 'lucide-react';
import { CMSMediaItem } from '@/types/cms';
import DiagramStudioModal from '@/components/diagram/diagram-studio-modal';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage?: (media: CMSMediaItem) => void;
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
}: MediaLibraryModalProps) {
  const [mediaList, setMediaList] = useState<CMSMediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState<CMSMediaItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDiagramStudio, setShowDiagramStudio] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load media items
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/media');
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
        if (data.media.length > 0 && !selectedItem) {
          setSelectedItem(data.media[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  // Handle computer file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('category', selectedCategory === 'all' ? 'Tutorials' : selectedCategory);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: {
          'x-admin-token': 'admin-session',
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.item) {
        setMediaList((prev) => [data.item, ...prev]);
        setSelectedItem(data.item);
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Network error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Drag and Drop
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', file.name.replace(/\.[^/.]+$/, ''));
    formData.append('category', selectedCategory === 'all' ? 'Tutorials' : selectedCategory);

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'x-admin-token': 'admin-session' },
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.item) {
        setMediaList((prev) => [data.item, ...prev]);
        setSelectedItem(data.item);
      } else {
        setUploadError(data.error || 'Upload failed');
      }
    } catch (err: any) {
      setUploadError(err.message || 'Drop upload error');
    } finally {
      setUploading(false);
    }
  };

  // Handle clipboard paste inside modal
  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          setUploading(true);
          setUploadError(null);

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
              const res = await fetch('/api/admin/media', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-admin-token': 'admin-session',
                },
                body: JSON.stringify({
                  base64,
                  alt: 'Pasted Screenshot',
                  category: 'Screenshots',
                }),
              });
              const data = await res.json();
              if (data.success && data.item) {
                setMediaList((prev) => [data.item, ...prev]);
                setSelectedItem(data.item);
              } else {
                setUploadError(data.error || 'Paste failed');
              }
            } catch (err: any) {
              setUploadError(err.message || 'Paste upload error');
            } finally {
              setUploading(false);
            }
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    }
  };

  // Delete media item
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-token': 'admin-session' },
      });
      const data = await res.json();
      if (data.success) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        setDeleteError(data.error || 'Could not delete media');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Delete error');
    }
  };

  // Filter media
  const filtered = mediaList.filter((item) => {
    const matchesSearch =
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.alt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...Array.from(new Set(mediaList.map((m) => m.category || 'General')))];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-hidden font-sans"
      onPaste={handlePaste}
    >
      <div className="bg-[#18181B] border border-[#27272A] rounded-2xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#27272A] flex items-center justify-between shrink-0 bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Centralized Media Library</h2>
              <p className="text-xs text-[#A1A1AA]">
                Upload, paste screenshots (Ctrl+V / Cmd+V), and manage article assets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-white hover:bg-[#27272A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="px-6 py-3 border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3 bg-[#18181B] shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                placeholder="Search media by title or ALT text..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs text-white placeholder-[#71717A] focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#09090B] border border-[#27272A] rounded-lg text-xs text-[#D4D4D8] px-3 py-1.5 focus:outline-none focus:border-purple-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>

          {/* Action Upload */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowDiagramStudio(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors cursor-pointer"
            >
              <Workflow className="w-4 h-4" />
              <span>Create Diagram</span>
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow transition-colors disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Image</span>
                </>
              )}
            </button>
          </div>
        </div>

        {uploadError && (
          <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {uploadError}
            </span>
            <button type="button" onClick={() => setUploadError(null)} className="text-rose-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {deleteError && (
          <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              {deleteError}
            </span>
            <button type="button" onClick={() => setDeleteError(null)} className="text-amber-400">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Body: Grid (Left) + Detail Sidebar (Right) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Media Grid / Dropzone */}
          <div
            className="flex-1 overflow-y-auto p-6"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Drag & Drop Hero Box */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#27272A] hover:border-purple-500/50 rounded-xl p-4 mb-6 flex items-center justify-center gap-3 text-[#A1A1AA] hover:text-purple-300 transition-colors cursor-pointer bg-[#141416]/50"
            >
              <UploadCloud className="w-6 h-6 text-purple-400 shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-white">Drag &amp; drop images here</span>, click
                to browse, or press{' '}
                <kbd className="px-1.5 py-0.5 rounded bg-[#27272A] text-purple-300 font-mono text-[10px]">
                  Ctrl+V / Cmd+V
                </kbd>{' '}
                to paste screenshot
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-[#71717A] gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                <span className="text-xs">Loading media assets...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-[#71717A] gap-3">
                <FileImage className="w-12 h-12 stroke-[1.2]" />
                <p className="text-sm">No media items found</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[#27272A] text-xs text-white hover:bg-[#323238]"
                >
                  Upload your first screenshot
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filtered.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className={`group relative rounded-xl border overflow-hidden cursor-pointer bg-[#09090B] transition-all ${
                        isSelected
                          ? 'border-purple-500 ring-2 ring-purple-500/20'
                          : 'border-[#27272A] hover:border-[#3F3F46]'
                      }`}
                    >
                      <div className="aspect-video w-full bg-[#141416] flex items-center justify-center overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-2.5">
                        <p
                          className="text-xs font-semibold text-white truncate"
                          title={item.filename}
                        >
                          {item.alt || item.filename}
                        </p>
                        <p className="text-[10px] text-[#71717A] mt-0.5 flex items-center justify-between">
                          <span>{item.category || 'General'}</span>
                          <span>{(item.size / 1024).toFixed(0)} KB</span>
                        </p>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Asset Detail & Action Panel (Right 320px) */}
          <div className="w-80 border-l border-[#27272A] bg-[#141416] p-5 flex flex-col justify-between overflow-y-auto shrink-0">
            {selectedItem ? (
              <div className="space-y-4">
                <div className="aspect-video w-full rounded-xl border border-[#27272A] bg-[#09090B] overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedItem.url}
                    alt={selectedItem.alt}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                      Filename
                    </label>
                    <p className="text-xs font-mono text-white break-all">
                      {selectedItem.filename}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                      ALT Description
                    </label>
                    <input
                      type="text"
                      value={selectedItem.alt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedItem({ ...selectedItem, alt: val });
                        setMediaList((prev) =>
                          prev.map((m) => (m.id === selectedItem.id ? { ...m, alt: val } : m))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block mb-1">
                      Caption (Optional)
                    </label>
                    <input
                      type="text"
                      value={selectedItem.caption || ''}
                      placeholder="Figure caption..."
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedItem({ ...selectedItem, caption: val });
                        setMediaList((prev) =>
                          prev.map((m) => (m.id === selectedItem.id ? { ...m, caption: val } : m))
                        );
                      }}
                      className="w-full px-2.5 py-1.5 bg-[#09090B] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-[#1E1E22] border border-[#27272A]">
                      <span className="text-[#71717A] block">Format</span>
                      <span className="text-white font-mono uppercase">
                        {selectedItem.mimeType.split('/')[1]}
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#1E1E22] border border-[#27272A]">
                      <span className="text-[#71717A] block">Size</span>
                      <span className="text-white font-mono">
                        {(selectedItem.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>

                  {/* Copy URL */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedItem.url);
                        setCopiedUrl(selectedItem.url);
                        setTimeout(() => setCopiedUrl(null), 2000);
                      }}
                      className="w-full py-1.5 rounded-lg border border-[#27272A] bg-[#1E1E22] hover:bg-[#27272A] text-xs text-[#D4D4D8] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      {copiedUrl === selectedItem.url ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied URL</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />
                          <span>Copy Image URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-[#71717A] p-4">
                <FileImage className="w-8 h-8 mb-2 stroke-1" />
                <p className="text-xs">Select an asset to view metadata and insertion controls</p>
              </div>
            )}

            {/* Bottom Actions */}
            {selectedItem && (
              <div className="pt-4 border-t border-[#27272A] space-y-2">
                {onSelectImage && (
                  <button
                    type="button"
                    onClick={() => {
                      onSelectImage(selectedItem);
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Insert into Tutorial</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(selectedItem.id)}
                  className="w-full py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDiagramStudio && (
        <DiagramStudioModal
          isOpen={showDiagramStudio}
          onClose={() => setShowDiagramStudio(false)}
          onInsertDiagram={() => {
            fetchMedia();
            setShowDiagramStudio(false);
          }}
        />
      )}
    </div>
  );
}
