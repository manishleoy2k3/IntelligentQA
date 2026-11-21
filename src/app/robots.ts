import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/blog', '/blog/*', '/courses', '/courses/*', '/tracks', '/tracks/*'],
        disallow: ['/admin', '/admin/*', '/api/*', '/scratch/*'],
      },
    ],
    sitemap: 'https://intelligentqa.io/sitemap.xml',
  };
}
