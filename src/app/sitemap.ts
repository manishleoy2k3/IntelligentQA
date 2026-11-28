import { MetadataRoute } from 'next';
import { fetchPublishedArticles } from '@/lib/supabase/articles';
import { fetchAllCourses } from '@/lib/supabase/lessons';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
  const articles = await fetchPublishedArticles();
  const articleRoutes: MetadataRoute.Sitemap = articles.map((art) => ({
    url: `${baseUrl}/blog/${art.slug}`,
    lastModified: new Date(art.updatedDate || art.publishedDate || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  // Dynamic course tracks
  const courses = await fetchAllCourses();
  const courseRoutes: MetadataRoute.Sitemap = courses.map((course) => ({
    url: `${baseUrl}/courses/${course.id}`,
    lastModified: new Date(course.updated_at || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.75,
  }));

  return [...staticRoutes, ...articleRoutes, ...courseRoutes];
}
