import type { MetadataRoute } from 'next';
import { basisUrl } from '@/lib/seo/metadaten';

/** robots.txt (D-O2): öffentliche Seiten frei; Verwaltung, API und Suchergebnisse ausgenommen. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/verwaltung', '/tr/verwaltung', '/en/verwaltung', '/api/', '/suche', '/tr/arama', '/en/search'],
      },
    ],
    sitemap: `${basisUrl()}/sitemap.xml`,
  };
}
