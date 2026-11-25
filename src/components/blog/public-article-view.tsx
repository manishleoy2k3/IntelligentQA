'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  Share2,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  BookOpen,
  ArrowLeft,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  List,
  Terminal,
  ExternalLink,
  Layers,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { CMSArticle, TableOfContentsItem, EditorBlock } from '@/types/cms';
import { generateTableOfContents } from '@/lib/cms-engine.js';

interface PublicArticleViewProps {
  article: CMSArticle;
  relatedArticles?: CMSArticle[];
}

export default function PublicArticleView({
  article,
  relatedArticles = [],
}: PublicArticleViewProps) {
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const toc: TableOfContentsItem[] = generateTableOfContents(article.content);

  // Scroll spy to highlight current active TOC section
  useEffect(() => {
    if (toc.length === 0) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (let i = toc.length - 1; i >= 0; i--) {
        const el = document.getElementById(toc[i].id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveHeadingId(toc[i].id);
          return;
        }
      }
      if (toc.length > 0) setActiveHeadingId(toc[0].id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [toc]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveHeadingId(id);
      setMobileTocOpen(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Structured Data (JSON-LD) for SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.shortDescription,
    image: article.featuredImage ? [article.featuredImage] : undefined,
    datePublished: article.publishedDate || article.updatedDate,
    dateModified: article.updatedDate,
    author: {
      '@type': 'Person',
      name: article.createdBy.name,
      jobTitle: article.createdBy.role,
    },
    publisher: {
      '@type': 'Organization',
      name: 'IntelligentQA',
      logo: {
        '@type': 'ImageObject',
        url: 'https://intelligentqa.io/images/hero-preview.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.canonicalUrl || `https://intelligentqa.io/blog/${article.slug}`,
    },
  };

  const breadcrumbsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://intelligentqa.io',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://intelligentqa.io/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.category,
        item: `https://intelligentqa.io/blog?category=${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: article.title,
        item: `https://intelligentqa.io/blog/${article.slug}`,
      },
    ],
  };

  // Extract FAQ items for FAQPage Schema
  const faqBlocks = article.content?.blocks?.filter((b) => b.type === 'faq') || [];
  const faqItems = faqBlocks.flatMap((b: any) => b.data.items || []);
  const faqSchema =
    faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map((item: any) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }
      : null;

  return (
    <article className="min-h-screen bg-[#09090B] text-slate-100 font-sans antialiased selection:bg-purple-500/30 selection:text-white pb-24">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* 1. Header Banner & Breadcrumbs */}
      <div className="border-b border-[#1E1E22] bg-[#0E0E11]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-xs text-[#A1A1AA]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 truncate">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#52525B]" />
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-[#52525B]" />
            <span className="text-purple-400 font-medium truncate">{article.category}</span>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1C1C20] hover:bg-[#27272A] border border-[#27272A] text-white transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Article Hero & Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
            {article.category}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-[#A1A1AA]">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>{article.readingTimeMinutes} min read</span>
          </span>
        </div>

        {/* H1 Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-base sm:text-lg text-[#A1A1AA] leading-relaxed">{article.subtitle}</p>
        )}

        {/* Author & Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#1E1E22]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-md">
              <div className="w-full h-full rounded-full bg-[#18181B] flex items-center justify-center overflow-hidden">
                {article.createdBy.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={article.createdBy.avatarUrl}
                    alt={article.createdBy.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-purple-400" />
                )}
              </div>
            </div>
            <div>
              <div className="font-bold text-sm text-white">{article.createdBy.name}</div>
              <div className="text-xs text-[#A1A1AA]">
                {article.createdBy.role || 'SDET & Test Architect'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#A1A1AA]">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span>
                Updated on{' '}
                {new Date(article.updatedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {article.featuredImage && (
          <figure className="pt-4">
            <div className="rounded-2xl border border-[#27272A] bg-[#09090B] overflow-hidden shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featuredImage}
                alt={article.featuredImageCaption || article.title}
                className="w-full max-h-[500px] object-contain mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            {article.featuredImageCaption && (
              <figcaption className="text-center text-xs text-[#71717A] mt-2 italic">
                {article.featuredImageCaption}
              </figcaption>
            )}
          </figure>
        )}
      </header>

      {/* 3. Main Content Grid (Central readable column + Sticky Table of Contents) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Mobile Collapsible TOC */}
        {toc.length > 0 && (
          <div className="lg:hidden mb-8 rounded-2xl border border-[#27272A] bg-[#121215] overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileTocOpen(!mobileTocOpen)}
              className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-bold text-white bg-[#18181C]"
            >
              <span className="flex items-center gap-2">
                <List className="w-4 h-4 text-purple-400" />
                <span>Table of Contents ({toc.length} sections)</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 text-[#A1A1AA] transition-transform ${
                  mobileTocOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {mobileTocOpen && (
              <div className="p-4 space-y-2 bg-[#121215] text-xs">
                {toc.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left py-1.5 transition-colors ${
                      item.level === 3 ? 'pl-4 text-xs' : 'font-semibold'
                    } ${
                      activeHeadingId === item.id
                        ? 'text-purple-400 font-bold'
                        : 'text-[#A1A1AA] hover:text-white'
                    }`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Main Article Content Column (8 cols on Desktop) */}
          <main className="lg:col-span-8 space-y-6">
            <div className="prose prose-invert max-w-none text-slate-200">
              {article.content?.blocks?.map((block) => (
                <RenderPublicBlock
                  key={block.id}
                  block={block}
                  onCopyCode={handleCopyCode}
                  copiedCodeId={copiedCodeId}
                />
              ))}
            </div>

            {/* Tags Footer */}
            {article.tags?.length > 0 && (
              <div className="pt-8 border-t border-[#1E1E22] flex flex-wrap items-center gap-2">
                <span className="text-xs text-[#71717A] mr-2">Tags:</span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-lg bg-[#141417] hover:bg-[#1E1E22] border border-[#27272A] text-xs text-[#D4D4D8] hover:text-white transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Author Bio Box */}
            <div className="p-6 rounded-2xl border border-[#27272A] bg-[#121215] flex flex-col sm:flex-row items-center sm:items-start gap-4 my-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shrink-0 shadow-lg">
                <div className="w-full h-full rounded-2xl bg-[#18181B] flex items-center justify-center overflow-hidden">
                  {article.createdBy.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.createdBy.avatarUrl}
                      alt={article.createdBy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-purple-400" />
                  )}
                </div>
              </div>
              <div className="space-y-1 text-center sm:text-left">
                <div className="text-sm font-bold text-white">{article.createdBy.name}</div>
                <div className="text-xs font-semibold text-purple-400">
                  {article.createdBy.role || 'SDET Lead'}
                </div>
                <p className="text-xs text-[#A1A1AA] pt-1 leading-relaxed">
                  {article.createdBy.bio ||
                    'Author and test architect specializing in enterprise test automation frameworks, continuous testing, and resilient test design.'}
                </p>
              </div>
            </div>

            {/* Related Tutorials */}
            {relatedArticles.length > 0 && (
              <div className="pt-10 space-y-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <span>Related Tutorials &amp; Masterclasses</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/blog/${rel.slug}`}
                      className="group p-5 rounded-2xl border border-[#27272A] bg-[#121215] hover:border-purple-500/50 hover:bg-[#141418] transition-all flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 uppercase">
                          {rel.category}
                        </span>
                        <h4 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors mt-2">
                          {rel.title}
                        </h4>
                        <p className="text-xs text-[#71717A] line-clamp-2 mt-1">
                          {rel.shortDescription}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#A1A1AA] pt-2 border-t border-[#1E1E22]">
                        <span>{rel.readingTimeMinutes} min read</span>
                        <span className="text-purple-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Read Tutorial &rarr;
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Sticky Table of Contents Sidebar (Desktop 4 cols) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-20 space-y-6">
            {toc.length > 0 && (
              <div className="p-6 rounded-3xl border border-[#27272A] bg-[#121215]/90 backdrop-blur-md shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                    <List className="w-4 h-4 text-purple-400" />
                    <span>Table of Contents</span>
                  </h3>
                  <span className="text-[10px] font-mono text-[#71717A] px-2 py-0.5 rounded bg-[#1C1C20]">
                    {toc.length} sections
                  </span>
                </div>

                <nav
                  aria-label="Table of Contents"
                  className="space-y-1 max-h-[65vh] overflow-y-auto pr-1"
                >
                  {toc.map((item) => {
                    const isActive = activeHeadingId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => scrollToHeading(item.id)}
                        className={`block w-full text-left py-1.5 px-3 rounded-lg text-xs transition-all cursor-pointer ${
                          item.level === 3 ? 'pl-6 text-[11px]' : 'font-semibold'
                        } ${
                          isActive
                            ? 'bg-purple-600/15 text-purple-300 border-l-2 border-purple-500 font-bold'
                            : 'text-[#A1A1AA] hover:text-white hover:bg-[#1A1A1E]'
                        }`}
                      >
                        {item.text}
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* Community Free Access Banner Card */}
            <div className="p-6 rounded-3xl border border-purple-500/20 bg-gradient-to-br from-purple-900/20 via-[#141418] to-[#121215] space-y-3 shadow-lg">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                100% FREE COMMUNITY
              </span>
              <h4 className="text-sm font-bold text-white">Master SDET Automation</h4>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                Practice in our real in-browser sandbox with instant test execution, zero setup, and
                AI mentor guidance.
              </p>
              <Link
                href="/tracks"
                className="inline-flex items-center justify-center w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
              >
                Explore Free Tracks
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

// ----------------------------------------------------
// Public Block Component Renderer
// ----------------------------------------------------
function RenderPublicBlock({
  block,
  onCopyCode,
  copiedCodeId,
}: {
  block: EditorBlock;
  onCopyCode: (code: string, id: string) => void;
  copiedCodeId: string | null;
}) {
  switch (block.type) {
    case 'header': {
      const Tag =
        block.data.level === 1
          ? 'h1'
          : block.data.level === 2
            ? 'h2'
            : block.data.level === 3
              ? 'h3'
              : 'h4';

      const baseClasses =
        block.data.level === 2
          ? 'text-2xl sm:text-3xl font-extrabold text-white mt-12 mb-4 pt-6 border-t border-[#1E1E22] scroll-mt-24'
          : block.data.level === 3
            ? 'text-xl sm:text-2xl font-bold text-white mt-8 mb-3 scroll-mt-24'
            : 'text-lg font-bold text-[#E4E4E7] mt-6 mb-2 scroll-mt-24';

      return (
        <Tag id={block.data.anchor} className={baseClasses}>
          {block.data.text}
        </Tag>
      );
    }

    case 'paragraph':
      return (
        <p
          className="text-base sm:text-lg text-[#D4D4D8] leading-relaxed my-4"
          dangerouslySetInnerHTML={{ __html: block.data.text }}
        />
      );

    case 'code': {
      const isCopied = copiedCodeId === block.id;
      return (
        <div className="rounded-2xl border border-[#27272A] bg-[#09090B] overflow-hidden shadow-2xl my-6">
          <div className="px-4 py-2.5 border-b border-[#27272A] bg-[#141416] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                {block.data.language || 'code'}
              </span>
              {block.data.caption && (
                <span className="text-xs text-[#71717A]">• {block.data.caption}</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onCopyCode(block.data.code, block.id)}
              className="px-2.5 py-1 rounded-md bg-[#1F1F24] hover:bg-[#2A2A30] text-xs text-[#D4D4D8] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#A1A1AA]" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed">
            <code>{block.data.code}</code>
          </pre>
        </div>
      );
    }

    case 'terminal': {
      const isCopied = copiedCodeId === block.id;
      return (
        <div className="rounded-2xl border border-[#27272A] bg-[#09090B] p-4 my-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono text-white overflow-x-auto">
            <span className="text-sky-400 font-bold select-none">{block.data.prompt || '$'}</span>
            <span className="text-slate-100">{block.data.code}</span>
          </div>
          <button
            type="button"
            onClick={() => onCopyCode(block.data.code, block.id)}
            className="p-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-xs text-[#A1A1AA] hover:text-white shrink-0 ml-3"
            title="Copy command"
          >
            {isCopied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      );
    }

    case 'image': {
      const imgUrl = block.data.file?.url || (block.data as any).url;
      if (!imgUrl) return null;

      const alignClass =
        block.data.alignment === 'left'
          ? 'text-left'
          : block.data.alignment === 'right'
            ? 'text-right'
            : 'text-center';

      const sizeClass =
        block.data.size === 'small'
          ? 'max-w-md'
          : block.data.size === 'medium'
            ? 'max-w-2xl'
            : block.data.size === 'full'
              ? 'w-full'
              : 'max-w-4xl';

      return (
        <figure className={`my-8 ${alignClass}`}>
          <div
            className={`rounded-2xl border border-[#27272A] overflow-hidden bg-[#09090B] shadow-2xl inline-block ${sizeClass} max-w-full`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={
                block.data.alt ||
                block.data.caption ||
                'Technical screenshot or architecture diagram'
              }
              className="max-h-[550px] w-full object-contain mx-auto"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          {block.data.caption && (
            <figcaption className="mt-2.5 text-xs sm:text-sm text-[#A1A1AA] italic">
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'callout': {
      const isWarn = block.data.type === 'warning';
      const isTip = block.data.type === 'tip';
      const isDanger = block.data.type === 'danger';
      const style = isWarn
        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
        : isTip
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
          : isDanger
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
            : 'bg-sky-500/10 border-sky-500/30 text-sky-200';
      return (
        <div className={`p-5 rounded-2xl border ${style} my-6 space-y-1.5 shadow-md`}>
          <div className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
            {isWarn ? (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            ) : isTip ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span>{block.data.title}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#D4D4D8] leading-relaxed pl-6">
            {block.data.message}
          </p>
        </div>
      );
    }

    case 'table':
      return (
        <div className="overflow-x-auto my-8 border border-[#27272A] rounded-2xl bg-[#09090B] shadow-xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <tbody>
              {block.data.content.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={
                    rIdx === 0 && block.data.withHeadings
                      ? 'bg-[#18181C] font-bold text-white border-b border-[#27272A]'
                      : 'border-b border-[#27272A]/50 hover:bg-[#121215]'
                  }
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-3.5 sm:p-4 border-r border-[#27272A]/40">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'stepByStep':
      return (
        <div className="space-y-4 my-8">
          {block.data.title && (
            <h3 className="text-xl font-bold text-white mb-2">{block.data.title}</h3>
          )}
          <div className="space-y-3">
            {block.data.steps.map((st, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] space-y-2 shadow-md hover:border-emerald-500/30 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-extrabold flex items-center justify-center shrink-0">
                    {st.stepNumber || i + 1}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-white">{st.title}</span>
                  {st.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono font-bold">
                      {st.badge}
                    </span>
                  )}
                </div>
                {st.summary && (
                  <p className="text-xs text-[#A1A1AA] pl-8 font-medium">{st.summary}</p>
                )}
                <p className="text-xs sm:text-sm text-[#D4D4D8] pl-8 leading-relaxed">
                  {st.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'comparisonTable':
      return (
        <div className="my-8 border border-[#27272A] rounded-2xl overflow-hidden bg-[#09090B] shadow-xl">
          {block.data.title && (
            <div className="p-4 bg-[#18181C] border-b border-[#27272A] text-sm font-bold text-white">
              {block.data.title}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-[#141416] border-b border-[#27272A]">
                  {block.data.columns.map((c, i) => (
                    <th key={i} className="p-3.5 font-bold text-emerald-400 text-left">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.data.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-[#27272A]/50 hover:bg-[#121215]">
                    <td className="p-3.5 font-bold text-white border-r border-[#27272A]/40">
                      {row.feature}
                    </td>
                    {row.values.map((v, vIdx) => (
                      <td key={vIdx} className="p-3.5 text-[#D4D4D8] border-r border-[#27272A]/40">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className="space-y-4 my-10">
          {block.data.title && (
            <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              <span>{block.data.title}</span>
            </h3>
          )}
          <div className="space-y-3">
            {block.data.items.map((item, i) => (
              <details
                key={i}
                className="p-5 rounded-2xl border border-[#27272A] bg-[#121215] group cursor-pointer shadow-md"
              >
                <summary className="font-bold text-sm sm:text-base text-white flex items-center justify-between list-none">
                  <span>{item.question}</span>
                  <ChevronDown className="w-4 h-4 text-[#71717A] group-open:rotate-180 transition-transform shrink-0" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed pt-3 border-t border-[#1E1E22]">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}
