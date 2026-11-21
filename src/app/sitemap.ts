import { MetadataRoute } from 'next';
import { cmsStore } from '@/lib/cms-store';
import { QA_TRACKS } from '@/lib/qa-curriculum';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://intelligentqa.io';

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tracks`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/interview-questions`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic published articles
  const articles = cmsStore.getArticles({ status: 'published' });
  const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${baseUrl}/blog/${art.slug}`,
    lastModified: new Date(art.updatedDate || art.publishedDate || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic course tracks
  const courseRoutes: MetadataRoute.Sitemap = QA_TRACKS.map((track) => ({
    url: `${baseUrl}/courses/${track.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...articleRoutes, ...courseRoutes];
}
