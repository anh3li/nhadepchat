import type { MetadataRoute } from 'next';

const origin = 'https://nhadepchat.tranvukim-tvk.workers.dev';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/api/', '/tai-khoan/'],
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
