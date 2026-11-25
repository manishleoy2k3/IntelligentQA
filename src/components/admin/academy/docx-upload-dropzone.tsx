'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Loader2,
  Trash2,
  File,
} from 'lucide-react';

export interface UploadedDocInfo {
  id: string;
  originalFilename: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  hash: string;
  contentHtml?: string;
  pdfPath?: string;
  metadata?: any;
  extractedImages?: any[];
}

interface DocxUploadDropzoneProps {
  lessonId?: string;
  onUploaded: (info: UploadedDocInfo) => void;
  onClear?: () => void;
  currentDocumentPath?: string;
  maxSizeBytes?: number; // Default 25MB
  acceptedExtensions?: string[]; // Default ['.docx']
}

export default function DocxUploadDropzone({
  lessonId,
  onUploaded,
  onClear,
  currentDocumentPath,
  maxSizeBytes = 25 * 1024 * 1024, // 25 MB
  acceptedExtensions = ['.docx', '.pdf'],
}: DocxUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadedInfo, setUploadedInfo] = useState<UploadedDocInfo | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const validateFile = async (file: File): Promise<{ valid: boolean; error?: string }> => {
    // 1. Extension check
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Invalid file extension "${ext}". Only Microsoft Word (${acceptedExtensions.join(', ')}) files are supported.`,
      };
    }

    // 2. Size check
    if (file.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size (${formatFileSize(file.size)}) exceeds maximum permitted limit (${formatFileSize(maxSizeBytes)}).`,
      };
    }

    if (file.size === 0) {
      return {
        valid: false,
        error: 'Uploaded document is empty (0 bytes).',
      };
    }

    // 3. Binary signature check (ZIP signature PK\x03\x04 for .docx or %PDF for .pdf)
    try {
      const headerBytes = new Uint8Array(await file.slice(0, 4).arrayBuffer());
      if (ext === '.docx') {
        // Zip magic bytes: 0x50 0x4B 0x03 0x04
        const isZip = headerBytes[0] === 0x50 && headerBytes[1] === 0x4b;
        if (!isZip) {
          return {
            valid: false,
            error:
              'Document appears corrupted or is not a valid Microsoft Word OpenXML (.docx) package.',
          };
        }
      } else if (ext === '.pdf') {
        // PDF magic bytes: %PDF
        const isPdf =
          headerBytes[0] === 0x25 &&
          headerBytes[1] === 0x50 &&
          headerBytes[2] === 0x44 &&
          headerBytes[3] === 0x46;
        if (!isPdf) {
          return {
            valid: false,
            error: 'File is not a valid PDF document.',
          };
        }
      }
    } catch {
      // Non-blocking binary inspection
    }

    return { valid: true };
  };

  const handleUploadFile = async (file: File) => {
    setErrorMessage(null);
    const validation = await validateFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(15);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
      }, 100);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('lessonId', lessonId || 'unassigned');
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      formData.append('assetType', isPdf ? 'pdf' : 'attachment');

      const res = await fetch('/api/admin/learning/documents/upload', {
        method: 'POST',
        headers: {
          'x-admin-token': 'admin',
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || `Upload failed with status ${res.status}`);
      }

      const processing = json.data.processing;
      const info: UploadedDocInfo = {
        id: json.data.id,
        originalFilename: json.data.originalFilename || file.name,
        filePath: json.data.filePath,
        fileSizeBytes: json.data.fileSizeBytes || file.size,
        mimeType: json.data.mimeType || file.type,
        hash: json.data.hash || '',
        contentHtml: processing?.html || '',
        pdfPath: processing?.pdfPath || '',
        metadata: processing?.metadata || null,
        extractedImages: processing?.extractedImages || [],
      };

      setUploadedInfo(info);
      onUploaded(info);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred during document upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleClear = () => {
    setUploadedInfo(null);
    setErrorMessage(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedExtensions.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Success State: File is Uploaded or Linked */}
      {(uploadedInfo || currentDocumentPath) && !isUploading ? (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 truncate">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h5 className="text-xs font-semibold text-emerald-300 truncate">
                {uploadedInfo
                  ? uploadedInfo.originalFilename
                  : currentDocumentPath?.split('/').pop()}
              </h5>
              <p className="text-[10px] text-zinc-400">
                {uploadedInfo ? formatFileSize(uploadedInfo.fileSizeBytes) : 'Preserved Document'} •
                Ready for Preview &amp; Publishing
              </p>
              {uploadedInfo?.metadata && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Fidelity: High
                  </span>
                  {uploadedInfo.metadata.headings_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {uploadedInfo.metadata.headings_count} Headings
                    </span>
                  )}
                  {uploadedInfo.metadata.images_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      {uploadedInfo.metadata.images_count} Images Extracted
                    </span>
                  )}
                  {uploadedInfo.metadata.code_blocks_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {uploadedInfo.metadata.code_blocks_count} Code Blocks
                    </span>
                  )}
                  {uploadedInfo.metadata.tables_count > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      {uploadedInfo.metadata.tables_count} Tables
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition-colors cursor-pointer"
              title="Replace current document"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Remove document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Drag & Drop Area */
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-emerald-500 bg-emerald-500/10'
              : 'border-[#2D2D2D] hover:border-emerald-500/50 hover:bg-[#1A1A1A] bg-[#161616]'
          } ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
        >
          {isUploading ? (
            <div className="space-y-3 py-2">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-200">
                  Uploading and validating document... {uploadProgress}%
                </p>
                <div className="w-48 max-w-full h-1.5 bg-zinc-800 rounded-full mx-auto overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  Click to upload or drag &amp; drop Microsoft Word document
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Supports <span className="font-mono text-emerald-400">.docx</span> up to{' '}
                  {formatFileSize(maxSizeBytes)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
