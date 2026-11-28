import { Metadata } from 'next';
import Link from 'next/link';
import { fetchPublishedArticles } from '@/lib/supabase/articles';
import {
  BookOpen,
  Clock,
  Calendar,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  CheckCircle2,
  Terminal,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'QA & SDET Engineering Tutorials & Masterclasses | IntelligentQA Blog',
  description:
    'Comprehensive, hands-on technical tutorials for Software Development Engineers in Test (SDETs). Master Selenium, Playwright, REST Assured, and CI/CD test automation.',
  alternates: {
    canonical: 'https://intelligentqa.io/blog',
  },
};

export default async function BlogListingPage() {
  const articles = await fetchPublishedArticles();
  const categories = Array.from(new Set(articles.map((a) => a.category))).map((name) => ({
    id: name,
    name,
  }));
  const heroArticle = articles[0] || null;
  const standardArticles = articles.slice(1);

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 font-sans pb-24">
      {/* Header Banner */}
      <section className="relative border-b border-[#1E1E22] bg-gradient-to-b from-[#141418] via-[#0E0E11] to-[#09090B] py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Open-Source QA Knowledge Base</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Technical Tutorials &amp; Architecture Guides
          </h1>
          <p className="text-sm sm:text-base text-[#A1A1AA] max-w-2xl mx-auto leading-relaxed">
            In-depth guides crafted by veteran SDETs and Test Architects. Learn Selenium,
            Playwright, API test automation, and scalable test design.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
        {/* Hero Featured Article Card */}
        {heroArticle && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Featured Masterclass</span>
            </div>

            <Link
              href={`/blog/${heroArticle.slug}`}
              className="group block rounded-3xl border border-[#27272A] bg-gradient-to-br from-[#18181C] to-[#121215] hover:border-purple-500/50 p-6 sm:p-8 transition-all shadow-2xl relative overflow-hidden"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                      {heroArticle.category}
                    </span>
                    <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <span>{heroArticle.readingTimeMinutes} min read</span>
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white group-hover:text-purple-300 transition-colors leading-snug">
                    {heroArticle.title}
                  </h2>

                  <p className="text-sm text-[#A1A1AA] line-clamp-3 leading-relaxed">
                    {heroArticle.shortDescription}
                  </p>

                  <div className="pt-2 flex items-center gap-3 text-xs text-purple-400 font-bold group-hover:translate-x-1 transition-transform">
                    <span>Read Complete Tutorial</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="rounded-2xl border border-[#27272A] overflow-hidden bg-[#09090B] aspect-video flex items-center justify-center">
                    {heroArticle.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={heroArticle.featuredImage}
                        alt={heroArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <Terminal className="w-12 h-12 text-[#71717A]" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </section>
        )}

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-[#1E1E22]">
          <span className="text-xs font-semibold text-[#71717A] mr-2">Topics:</span>
          {categories.map((c) => (
            <span
              key={c.id}
              className="px-3 py-1 rounded-full text-xs font-medium bg-[#141417] text-[#D4D4D8] border border-[#27272A] hover:border-purple-500/40 hover:text-white transition-colors cursor-pointer"
            >
              {c.name}
            </span>
          ))}
        </div>

        {/* All Articles Grid */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold text-white">All Tutorials &amp; Articles</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <Link
                key={art.id}
                href={`/blog/${art.slug}`}
                className="group rounded-2xl border border-[#27272A] bg-[#121215] hover:border-purple-500/50 hover:bg-[#15151A] p-5 transition-all shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="aspect-video w-full rounded-xl border border-[#27272A] overflow-hidden bg-[#09090B] flex items-center justify-center">
                    {art.featuredImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={art.featuredImage}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <BookOpen className="w-8 h-8 text-[#71717A]" />
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#A1A1AA]">
                    <span className="font-bold text-purple-400 uppercase tracking-wider">
                      {art.category}
                    </span>
                    <span>{art.readingTimeMinutes} min read</span>
                  </div>

                  <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>

                  <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                    {art.shortDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1E1E22] flex items-center justify-between text-xs text-[#71717A]">
                  <span>{new Date(art.updatedDate).toLocaleDateString()}</span>
                  <span className="text-purple-400 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Read &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
