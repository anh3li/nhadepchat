import type { MetadataRoute } from 'next';

const origin = 'https://nhadepchat.tranvukim-tvk.workers.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/tim-kiem',
    '/bo-suu-tap',
    '/cong-dong',
    '/dang-ban',
    '/dang-ky',
    '/dang-nhap',
  ];

  return routes.map((route) => ({
    url: `${origin}${route}`,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
