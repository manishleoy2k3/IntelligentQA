'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Upload,
  Download,
  Code2,
  Terminal,
  CheckCircle2,
  AlertCircle,
  X,
  ListPlus,
  ArrowRight,
  Laptop,
  Layers,
  Trash2,
  Tag,
} from 'lucide-react';
import {
  CodingProblem,
  DEFAULT_CODING_PROBLEMS,
  getAllProblems,
  saveCustomProblem,
  deleteCustomProblem,
  parseImportedProblems,
} from '@/lib/coding-problems';

function CodingProblemsCatalogContent() {
  const searchParams = useSearchParams();
  const initialGroup = searchParams?.get('group') || 'All';

  const [problems, setProblems] = useState<CodingProblem[]>(DEFAULT_CODING_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>(initialGroup);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [bannerFeedback, setBannerFeedback] = useState<string | null>(null);

  // Add Problem Form
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [newCategory, setNewCategory] = useState<string>('Arrays');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newConstraints, setNewConstraints] = useState<string>('');
  const [newExampleInput, setNewExampleInput] = useState<string>('');
  const [newExampleOutput, setNewExampleOutput] = useState<string>('');
  const [newExplanation, setNewExplanation] = useState<string>('');

  // Import Form
  const [importText, setImportText] = useState<string>('');
  const [importStatus, setImportStatus] = useState<{ error?: string; success?: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load problems from localStorage on mount
  useEffect(() => {
    const all = getAllProblems();
    setProblems(all);
  }, []);

  const showBanner = (msg: string) => {
    setBannerFeedback(msg);
    setTimeout(() => setBannerFeedback(null), 3000);
  };

  // Available groups/categories
  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    problems.forEach(p => {
      // Split compound categories like "Arrays & HashMaps"
      if (p.category.includes('&')) {
        p.category.split('&').forEach(c => groups.add(c.trim()));
      } else {
        groups.add(p.category.trim());
      }
    });
    return ['All', ...Array.from(groups)];
  }, [problems]);

  // Filtered problems
  const filteredProblems = useMemo(() => {
    return problems.filter(p => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Group filter
      if (selectedGroup !== 'All') {
        const matchesGroup = p.category.toLowerCase().includes(selectedGroup.toLowerCase());
        if (!matchesGroup) return false;
      }

      // Level filter
      if (selectedLevel !== 'All') {
        if (p.difficulty.toLowerCase() !== selectedLevel.toLowerCase()) return false;
      }

      return true;
    });
  }, [problems, searchQuery, selectedGroup, selectedLevel]);

  // Grouped by Category for display
  const problemsByGroup = useMemo(() => {
    const map = new Map<string, CodingProblem[]>();
    filteredProblems.forEach(p => {
      const groupKey = p.category || 'General Algorithms';
      if (!map.has(groupKey)) {
        map.set(groupKey, []);
      }
      map.get(groupKey)!.push(p);
    });
    return map;
  }, [filteredProblems]);

  // Delete problem handler
  const handleDeleteProblem = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this custom problem?')) {
      deleteCustomProblem(id);
      const updated = getAllProblems();
      setProblems(updated);
      showBanner('Custom problem deleted.');
    }
  };

  // Add problem handler
  const handleSaveNewProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert('Please enter a problem title.');
      return;
    }

    const examples: CodingProblem['examples'] = [];
    if (newExampleInput.trim() || newExampleOutput.trim()) {
      examples.push({
        input: newExampleInput.trim() || 'N/A',
        output: newExampleOutput.trim() || 'N/A',
        explanation: newExplanation.trim() || undefined,
      });
    }

    const constraints = newConstraints
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const created = saveCustomProblem({
      title: newTitle.trim(),
      difficulty: newDifficulty,
      category: newCategory.trim() || 'General',
      description: newDescription.trim() || 'Custom problem description.',
      constraints,
      examples,
      starterTemplates: {
        java: `public class Main {\n    public static void main(String[] args) {\n        // Problem: ${newTitle}\n        System.out.println("Solution for ${newTitle}");\n    }\n}`,
        python: `# Problem: ${newTitle}\ndef solve():\n    pass\n\nif __name__ == "__main__":\n    print("Solution for ${newTitle}")`,
        typescript: `// Problem: ${newTitle}\nconsole.log("Solution for ${newTitle}");`,
        javascript: `// Problem: ${newTitle}\nconsole.log("Solution for ${newTitle}");`,
        csharp: `using System;\nclass Program {\n    static void Main() {\n        Console.WriteLine("Solution for ${newTitle}");\n    }\n}`,
      },
    });

    const updated = getAllProblems();
    setProblems(updated);
    setShowAddModal(false);

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewConstraints('');
    setNewExampleInput('');
    setNewExampleOutput('');
    setNewExplanation('');

    showBanner(`Problem "${created.title}" added to library!`);
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        processImport(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const processImport = (text: string) => {
    const res = parseImportedProblems(text);
    if (res.error) {
      setImportStatus({ error: res.error });
    } else {
      const updated = getAllProblems();
      setProblems(updated);
      setImportStatus({ success: `Successfully imported ${res.problems.length} coding problem(s)!` });
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus(null);
        setImportText('');
        showBanner(`Imported ${res.problems.length} problem(s) into your library.`);
      }, 1200);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(problems, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `sdet_coding_problems_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchorElem.click();
    showBanner('Coding problems exported to JSON.');
  };

  const loadSampleJson = () => {
    const sample = [
      {
        title: "Count Vowels in a String",
        difficulty: "Easy",
        category: "Strings",
        description: "Given a string text, return the total count of vowels (a, e, i, o, u) case-insensitively.",
        constraints: ["1 <= text.length <= 10^5"],
        examples: [
          {
            input: "text = 'Quality Assurance'",
            output: "7",
            explanation: "Vowels: u, a, i, y (not counted), A, u, a, e = 7"
          }
        ]
      }
    ];
    setImportText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="border-b border-slate-800 bg-slate-900/90 px-4 py-3 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
                <span>/</span>
                <Link href="/sandbox/code" className="hover:text-white transition">Online Compilers</Link>
                <span>/</span>
                <span className="text-emerald-400 font-semibold">Coding Library</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SDET Coding Problem Library
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {problems.length} Problems
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/sandbox/code"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              title="Open pure freeform online compiler"
            >
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>Freeform Compiler</span>
            </Link>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Problem</span>
            </button>

            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import / Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Banner Feedback */}
      {bannerFeedback && (
        <div className="max-w-7xl mx-auto w-full px-4 pt-3">
          <div className="py-2 px-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{bannerFeedback}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search coding problems by name, keyword, or algorithm..."
                className="w-full bg-slate-950 border border-slate-700 hover:border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Level Filter Pills */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                Level:
              </span>
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedLevel === lvl
                      ? lvl === 'Easy'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                        : lvl === 'Medium'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                        : lvl === 'Hard'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                        : 'bg-white/10 text-white border border-white/20 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                  }`}
                >
                  {lvl === 'Easy' ? '🟢 Easy' : lvl === 'Medium' ? '🟡 Medium' : lvl === 'Hard' ? '🔴 Hard' : 'All Levels'}
                </button>
              ))}
            </div>
          </div>

          {/* Group Filter Pills */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              Groups:
            </span>
            {availableGroups.map(grp => (
              <button
                key={grp}
                type="button"
                onClick={() => setSelectedGroup(grp)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                  selectedGroup === grp
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-200">{filteredProblems.length}</strong> problem{filteredProblems.length === 1 ? '' : 's'}
            {selectedGroup !== 'All' && <span> in group &quot;{selectedGroup}&quot;</span>}
            {selectedLevel !== 'All' && <span> ({selectedLevel})</span>}
          </span>
          <button
            type="button"
            onClick={handleExportJSON}
            className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition"
          >
            <Download className="w-3 h-3" />
            <span>Export Library JSON</span>
          </button>
        </div>

        {/* Grouped Problems List */}
        {filteredProblems.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
            <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">No matching coding problems found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search query, or clear group and difficulty filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedGroup('All');
                setSelectedLevel('All');
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from(problemsByGroup.entries()).map(([groupName, groupProblems]) => (
              <div key={groupName} className="space-y-3">
                {/* Group Section Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <h2 className="text-sm font-bold text-white tracking-wide">{groupName}</h2>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                      {groupProblems.length} Problem{groupProblems.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                {/* Problem Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {groupProblems.map(prob => (
                    <Link
                      key={prob.id}
                      href={`/sandbox/code/problems/${prob.id}`}
                      className="group bg-slate-900/70 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 transition-all shadow-md hover:shadow-xl flex flex-col justify-between space-y-3"
                    >
                      <div>
                        {/* Top Card Bar: Title & Level Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">
                            {prob.title}
                          </h3>
                          <span
                            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              prob.difficulty === 'Easy'
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                                : prob.difficulty === 'Medium'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {prob.difficulty}
                          </span>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {prob.description}
                        </p>
                      </div>

                      {/* Bottom Card Bar: Language support & Solve link */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 font-mono">Languages:</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            Java
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            Python
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            TS
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                            C#
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {prob.isCustom && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteProblem(prob.id, e)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                              title="Delete custom problem"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                            Solve Problem
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD CODING PROBLEM MANUALLY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <ListPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Add Coding Problem to Library</h3>
                  <p className="text-[11px] text-slate-400">Create a new problem visible under Groups and Difficulty.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNewProblem} className="p-4 overflow-y-auto space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Problem Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Reverse an Integer / Validate Phone Number"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Difficulty Level</label>
                  <select
                    value={newDifficulty}
                    onChange={(e) => setNewDifficulty(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Easy">Easy (🟢)</option>
                    <option value="Medium">Medium (🟡)</option>
                    <option value="Hard">Hard (🔴)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Group / Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Arrays, Strings, HashMaps, RegEx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Problem Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Detail the algorithm, problem context, and expected output..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sample Input</label>
                  <input
                    type="text"
                    value={newExampleInput}
                    onChange={(e) => setNewExampleInput(e.target.value)}
                    placeholder="e.g. nums = [1, 2, 3], target = 4"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sample Output</label>
                  <input
                    type="text"
                    value={newExampleOutput}
                    onChange={(e) => setNewExampleOutput(e.target.value)}
                    placeholder="e.g. [0, 2]"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Constraints (Optional, one per line)</label>
                <textarea
                  rows={2}
                  value={newConstraints}
                  onChange={(e) => setNewConstraints(e.target.value)}
                  placeholder="1 <= nums.length <= 10^4&#10;Numbers can be negative"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md"
                >
                  Add Problem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT / UPLOAD CODING PROBLEMS */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Import or Upload Coding Problems</h3>
                  <p className="text-[11px] text-slate-400">Upload a JSON or CSV file, or paste your question list.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 overflow-y-auto space-y-4 text-xs">
              {/* Option A: File Upload */}
              <div
                className="p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/70 text-center transition cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-200">Click to upload a .json or .csv file</p>
                <p className="text-[11px] text-slate-500 mt-1">Supports JSON array of questions or CSV format</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".json,.csv,.txt"
                  className="hidden"
                />
              </div>

              {/* Quick Template Helpers */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Or Paste Raw Content:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSampleJson}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Paste Sample JSON
                  </button>
                </div>
              </div>

              {/* Textarea for JSON/CSV */}
              <textarea
                rows={6}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste JSON array or CSV text here..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-600 font-mono text-[11px] focus:outline-none focus:border-blue-500"
              />

              {/* Status / Feedback */}
              {importStatus?.error && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{importStatus.error}</span>
                </div>
              )}

              {importStatus?.success && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{importStatus.success}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  title="Download all available questions as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Library (JSON)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportStatus(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!importText.trim()}
                    onClick={() => processImport(importText)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold transition shadow-md"
                  >
                    Import Questions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CodingProblemsCatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mr-2" />
          Loading Coding Problems...
        </div>
      }
    >
      <CodingProblemsCatalogContent />
    </Suspense>
  );
}
