import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cmsStore } from '@/lib/cms-store';
import PublicArticleView from '@/components/blog/public-article-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = cmsStore.getArticles({ status: 'published' });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = cmsStore.getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Article Not Found | IntelligentQA',
      description: 'The requested technical tutorial or article was not found.',
    };
  }

  const title = article.seoTitle || `${article.title} | IntelligentQA`;
  const description = article.seoDescription || article.shortDescription;
  const canonical = article.canonicalUrl || `https://intelligentqa.io/blog/${article.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'IntelligentQA',
      type: 'article',
      publishedTime: article.publishedDate,
      modifiedTime: article.updatedDate,
      authors: [article.createdBy.name],
      images: article.featuredImage ? [{ url: article.featuredImage, alt: article.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: article.featuredImage ? [article.featuredImage] : [],
    },
    robots: {
      index: article.status === 'published',
      follow: true,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const article = cmsStore.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // Get related articles
  const allArticles = cmsStore.getArticles({ status: 'published' });
  const related = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 2);

  return <PublicArticleView article={article} relatedArticles={related} />;
}
