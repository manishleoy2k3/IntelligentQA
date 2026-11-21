'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  FolderPlus,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  Presentation,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  Folder,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck2,
  HardDrive,
  Copy,
  Check,
  MoveRight,
} from 'lucide-react';
import { QADatabase } from '@/lib/qa-db';
import { parseRequirementsFile } from '@/lib/file-parser';
import {
  ProjectFile,
  getProjectFiles,
  saveProjectFile,
  deleteProjectFile,
  deleteProjectFiles,
  getProjectFolders,
  createProjectFolder,
  deleteProjectFolder,
  moveFilesToFolder,
  MAX_PROJECT_FILE_SIZE_MB,
  MAX_PROJECT_FILE_SIZE_BYTES,
} from '@/lib/project-files';

export default function ProjectFilesWorkspace() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState('Root');
  const [copiedPreview, setCopiedPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user, files, and folders
  const loadData = async () => {
    setIsLoading(true);
    const u = QADatabase.getCurrentUser();
    setCurrentUser(u);
    const uId = u?.id || 'default';
    try {
      const [loadedFiles, loadedFolders] = await Promise.all([
        getProjectFiles(uId),
        getProjectFolders(uId),
      ]);
      setFiles(loadedFiles);
      setFolders(loadedFolders);
    } catch (e) {
      console.error('Error loading project files:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('intelligentqa_project_files_updated', handleUpdate);
    return () => {
      window.removeEventListener('intelligentqa_project_files_updated', handleUpdate);
    };
  }, []);

  const showNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  // Filtered files
  const filteredFiles = files.filter(f => {
    const matchesFolder = selectedFolder === 'All' || f.folder === selectedFolder;
    const matchesQuery =
      !searchQuery.trim() ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesQuery;
  });

  // Multi-selection handlers
  const handleToggleSelectAll = () => {
    if (selectedFileIds.length === filteredFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredFiles.map(f => f.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const uId = currentUser?.id || 'default';
    const folderToUse = selectedFolder === 'All' ? 'Root' : selectedFolder;

    for (let i = 0; i < uploadedFiles.length; i++) {
      const file = uploadedFiles[i];

      // Check max zero-cost file size
      if (file.size > MAX_PROJECT_FILE_SIZE_BYTES) {
        showNotification(
          'error',
          `"${file.name}" exceeds the ${MAX_PROJECT_FILE_SIZE_MB}MB zero-cost quota. Please upload files under ${MAX_PROJECT_FILE_SIZE_MB}MB.`
        );
        continue;
      }

      try {
        const parsed = await parseRequirementsFile(file);
        const ext = file.name.split('.').pop()?.toLowerCase() || 'other';

        const newRecord: ProjectFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          userId: uId,
          name: file.name,
          folder: folderToUse,
          type: (['pdf', 'md', 'xlsx', 'xls', 'pptx', 'ppt', 'docx', 'txt', 'json', 'csv'].includes(ext)
            ? ext
            : 'other') as any,
          size: file.size,
          uploadedAt: new Date().toISOString(),
          extractedText: parsed.extractedText,
          summary: parsed.summary,
          itemCount: parsed.itemCount,
        };

        await saveProjectFile(newRecord);
        successCount++;
      } catch (err: any) {
        console.error('File parsing error:', err);
        showNotification('error', `Could not parse ${file.name}: ${err?.message || 'Unknown error'}`);
      }
    }

    setIsUploading(false);
    setShowUploadModal(false);
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (successCount > 0) {
      showNotification('success', `🎉 Successfully imported and indexed ${successCount} file(s) into "${folderToUse}"!`);
      loadData();
    }
  };

  // Folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const uId = currentUser?.id || 'default';
    await createProjectFolder(newFolderName.trim(), uId);
    showNotification('success', `Folder "${newFolderName.trim()}" created successfully.`);
    setNewFolderName('');
    setShowNewFolderModal(false);
    loadData();
  };

  // Folder deletion
  const handleDeleteFolder = async (folderName: string) => {
    if (folderName === 'Root') return;
    if (!confirm(`Delete folder "${folderName}"? Any files inside will be moved to Root.`)) return;
    const uId = currentUser?.id || 'default';
    await deleteProjectFolder(folderName, uId);
    showNotification('info', `Folder "${folderName}" deleted. Files moved to Root.`);
    if (selectedFolder === folderName) setSelectedFolder('All');
    loadData();
  };

  // Batch delete
  const handleBatchDelete = async () => {
    if (selectedFileIds.length === 0) return;
    if (!confirm(`Delete ${selectedFileIds.length} selected file(s) permanently?`)) return;
    const uId = currentUser?.id || 'default';
    await deleteProjectFiles(selectedFileIds, uId);
    setSelectedFileIds([]);
    showNotification('info', `Deleted ${selectedFileIds.length} file(s).`);
    loadData();
  };

  // Batch move
  const handleBatchMove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFileIds.length === 0) return;
    const uId = currentUser?.id || 'default';
    await moveFilesToFolder(selectedFileIds, targetMoveFolder, uId);
    showNotification('success', `Moved ${selectedFileIds.length} file(s) to "${targetMoveFolder}".`);
    setSelectedFileIds([]);
    setShowMoveModal(false);
    loadData();
  };

  // Send selected to AI QA Agents
  const handleSendToQAAgents = (fileIdsToSend: string[] = selectedFileIds) => {
    if (fileIdsToSend.length === 0) return;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('intelligentqa_selected_agent_files', JSON.stringify(fileIdsToSend));
      router.push('/qa-agents?tab=test_cases');
    }
  };

  // File type icon helper
  const getFileIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t === 'pdf') return <FileText className="w-4 h-4 text-rose-500" />;
    if (t === 'xlsx' || t === 'xls' || t === 'csv') return <FileSpreadsheet className="w-4 h-4 text-emerald-500" />;
    if (t === 'pptx' || t === 'ppt') return <Presentation className="w-4 h-4 text-amber-500" />;
    if (t === 'md' || t === 'txt' || t === 'json') return <FileCode className="w-4 h-4 text-cyan-500" />;
    return <FileCheck2 className="w-4 h-4 text-blue-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 mb-1.5">
            <HardDrive className="w-3.5 h-3.5" />
            <span>Zero-Cost Local Vault • 15 MB Max / File</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FolderKanban className="w-7 h-7 text-blue-500" />
            <span>Project Files &amp; Folders</span>
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-3xl leading-relaxed">
            Upload and organize project requirements, test matrices, specs, and slide decks (<strong>.pdf, .md, .xlsx, .pptx</strong>). Select and inject any file directly into AI QA Agent context.
          </p>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowNewFolderModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-purple-400" />
            <span>New Folder</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition cursor-pointer shadow-md"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Files</span>
          </button>

          <Link
            href="/qa-agents"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white transition cursor-pointer shadow-md"
            title="Open AI QA Agents suite"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI QA Agents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Status Notification Banner */}
      {banner && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 transition-all animate-in fade-in ${
            banner.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : banner.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          {banner.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          ) : banner.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          ) : (
            <FileCheck2 className="w-4 h-4 text-blue-500 shrink-0" />
          )}
          <span className="flex-1 font-medium">{banner.text}</span>
          <button type="button" onClick={() => setBanner(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left: Folders Sidebar */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#262626]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Folders &amp; Categories
              </span>
              <button
                type="button"
                onClick={() => setShowNewFolderModal(true)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2A2A2A] text-slate-600 dark:text-zinc-300"
                title="Create custom folder"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              {/* "All Files" Button */}
              <button
                type="button"
                onClick={() => setSelectedFolder('All')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left ${
                  selectedFolder === 'All'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#222]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Folder className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">All Project Files</span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    selectedFolder === 'All'
                      ? 'bg-blue-800 text-white'
                      : 'bg-slate-200 dark:bg-[#262626] text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  {files.length}
                </span>
              </button>

              {/* Individual Folders */}
              {folders.map(folderName => {
                const count = files.filter(f => f.folder === folderName).length;
                const isCustom = !['Root', 'Requirements & PRDs', 'Test Matrices & Plans', 'Architecture & Specs', 'Defect Logs & Sprints'].includes(folderName);

                return (
                  <div key={folderName} className="group flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedFolder(folderName)}
                      className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer text-left truncate ${
                        selectedFolder === folderName
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-[#222]'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Folder className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span className="truncate">{folderName}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ml-1.5 ${
                          selectedFolder === folderName
                            ? 'bg-blue-800 text-white'
                            : 'bg-slate-200 dark:bg-[#262626] text-slate-600 dark:text-zinc-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>

                    {isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteFolder(folderName)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition ml-1"
                        title={`Delete folder "${folderName}"`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context Injection Guidance */}
          <div className="bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-2xl p-4 text-xs text-slate-600 dark:text-zinc-400 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI QA Agent Integration</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Check the boxes in front of any files and click <strong>&quot;Inject into QA Agents&quot;</strong> to ground your Test Case, Automation, and Requirement Generators with real project specs.
            </p>
          </div>
        </div>

        {/* Right: Files Table & Action Toolbar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-2xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search files by name, type, or extracted contents..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500 dark:text-zinc-400">
              <span>Showing:</span>
              <span className="font-bold text-slate-900 dark:text-white">{filteredFiles.length} file(s)</span>
            </div>
          </div>

          {/* Multi-Selection Batch Actions Bar (when 1 or more files are selected) */}
          {selectedFileIds.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-800 rounded-2xl flex items-center justify-between flex-wrap gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                <CheckSquare className="w-4 h-4 text-blue-500" />
                <span>{selectedFileIds.length} file(s) selected</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-slate-300 dark:border-[#3A3A3A] text-xs font-semibold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#2A2A2A] transition cursor-pointer flex items-center gap-1.5"
                >
                  <MoveRight className="w-3.5 h-3.5 text-blue-400" />
                  <span>Move to Folder...</span>
                </button>

                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendToQAAgents(selectedFileIds)}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inject into QA Agents ({selectedFileIds.length})</span>
                </button>
              </div>
            </div>
          )}

          {/* Files List / Table */}
          <div className="bg-slate-50 dark:bg-[#161616] border border-slate-200 dark:border-[#262626] rounded-2xl overflow-hidden shadow-xs">
            {isLoading ? (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-blue-500" />
                <p>Loading project files...</p>
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-[#222] text-slate-500 dark:text-zinc-400 flex items-center justify-center mx-auto">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Files Found in &quot;{selectedFolder}&quot;
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
                    Upload your project documents (.pdf, .md, .xlsx, .pptx) to start extracting requirements and test scenarios.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition cursor-pointer shadow-md inline-flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload Document</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-[#1C1C1C] border-b border-slate-200 dark:border-[#262626] text-slate-600 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <button
                          type="button"
                          onClick={handleToggleSelectAll}
                          className="cursor-pointer text-slate-600 dark:text-zinc-400 hover:text-blue-500"
                          title="Select / Deselect all"
                        >
                          {selectedFileIds.length === filteredFiles.length && filteredFiles.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-blue-500" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </th>
                      <th className="p-3.5">Document Name</th>
                      <th className="p-3.5">Folder</th>
                      <th className="p-3.5">Type</th>
                      <th className="p-3.5">Size</th>
                      <th className="p-3.5">Extracted Summary</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-[#242424]">
                    {filteredFiles.map(file => {
                      const isSelected = selectedFileIds.includes(file.id);

                      return (
                        <tr
                          key={file.id}
                          className={`hover:bg-slate-100/70 dark:hover:bg-[#1E1E1E] transition ${
                            isSelected ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                          }`}
                        >
                          {/* Checkbox Column */}
                          <td className="p-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectOne(file.id)}
                              className="cursor-pointer text-slate-500 hover:text-blue-500"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* File Name with Icon */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5">
                              {getFileIcon(file.type)}
                              <span
                                onClick={() => setPreviewFile(file)}
                                className="font-bold text-slate-900 dark:text-white hover:text-blue-500 cursor-pointer truncate max-w-xs"
                                title="Click to preview extracted content"
                              >
                                {file.name}
                              </span>
                            </div>
                          </td>

                          {/* Folder badge */}
                          <td className="p-3.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-[#282828] text-slate-700 dark:text-zinc-300 font-medium">
                              {file.folder}
                            </span>
                          </td>

                          {/* Type */}
                          <td className="p-3.5 uppercase font-mono text-[10px] font-bold text-slate-500 dark:text-zinc-400">
                            .{file.type}
                          </td>

                          {/* Size */}
                          <td className="p-3.5 text-slate-600 dark:text-zinc-400 font-mono text-[11px]">
                            {formatFileSize(file.size)}
                          </td>

                          {/* Summary */}
                          <td className="p-3.5 text-slate-600 dark:text-zinc-400 max-w-xs truncate" title={file.summary}>
                            {file.summary}
                          </td>

                          {/* Row Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setPreviewFile(file)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-[#2A2A2A] text-slate-600 dark:text-zinc-300"
                                title="Preview extracted text"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleSendToQAAgents([file.id])}
                                className="p-1.5 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-950/60 text-purple-600 dark:text-purple-400"
                                title="Open in AI QA Agents"
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`Delete "${file.name}"?`)) {
                                    await deleteProjectFile(file.id, currentUser?.id || 'default');
                                    showNotification('info', `Deleted "${file.name}".`);
                                    loadData();
                                  }
                                }}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 text-slate-400 hover:text-rose-500"
                                title="Delete file"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: UPLOAD FILES MODAL                                  */}
      {/* ============================================================ */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-lg bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upload Project Documents
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Target Folder:
                </label>
                <select
                  value={selectedFolder === 'All' ? 'Root' : selectedFolder}
                  onChange={e => setSelectedFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0F0F0F] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folders.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              {/* Drag & Drop Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-[#333] hover:border-blue-500 rounded-2xl p-8 text-center space-y-2 bg-slate-50 dark:bg-[#181818] transition cursor-pointer"
              >
                <UploadCloud className="w-10 h-10 text-blue-500 mx-auto" />
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  Click or drag files to upload
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Supports <strong>.pdf, .md, .xlsx, .xls, .pptx, .ppt, .docx, .txt</strong>
                </p>
                <span className="inline-block text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                  Max {MAX_PROJECT_FILE_SIZE_MB}MB per file • Zero server cost
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.md,.xlsx,.xls,.pptx,.ppt,.docx,.txt,.json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              {isUploading && (
                <div className="flex items-center justify-center gap-2 text-xs text-blue-500 font-semibold py-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Extracting document text &amp; indexing in local vault...</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#262626]">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: NEW FOLDER MODAL                                    */}
      {/* ============================================================ */}
      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-md bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Folder</h3>
              </div>
              <button type="button" onClick={() => setShowNewFolderModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Folder Name
                </label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="e.g. Sprint 42 Requirements, Payment APIs"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0F0F0F] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-md"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: MOVE FILES TO FOLDER MODAL                          */}
      {/* ============================================================ */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-md bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <MoveRight className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Move {selectedFileIds.length} File(s)
                </h3>
              </div>
              <button type="button" onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchMove} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Select Destination Folder
                </label>
                <select
                  value={targetMoveFolder}
                  onChange={e => setTargetMoveFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0F0F0F] border border-slate-300 dark:border-[#333] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {folders.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-[#262626]">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 4: PREVIEW EXTRACTED CONTENT MODAL                     */}
      {/* ============================================================ */}
      {previewFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs p-4 flex items-center justify-center min-h-screen">
          <div className="relative my-auto w-full max-w-3xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-[#262626] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-[#262626] shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {getFileIcon(previewFile.type)}
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {previewFile.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400">
                  <span className="font-semibold text-blue-500">Folder: {previewFile.folder}</span>
                  <span>•</span>
                  <span>{formatFileSize(previewFile.size)}</span>
                  <span>•</span>
                  <span>{previewFile.summary}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Extracted text body */}
            <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] font-mono text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {previewFile.extractedText || '// No text extracted from this file.'}
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#262626] shrink-0 flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(previewFile.extractedText);
                  setCopiedPreview(true);
                  setTimeout(() => setCopiedPreview(false), 2000);
                }}
                className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-[#333] hover:bg-slate-100 dark:hover:bg-[#222] text-xs font-semibold text-slate-700 dark:text-zinc-300 transition flex items-center gap-1.5"
              >
                {copiedPreview ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-[#222] text-slate-700 dark:text-zinc-300"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSendToQAAgents([previewFile.id])}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Open in AI QA Agents</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
