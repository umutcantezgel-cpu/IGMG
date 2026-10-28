import type { MetadataRoute } from 'next';
import { basisUrl } from '@/lib/seo/metadaten';
import { betriebsart } from '@/lib/umgebung';

/**
 * robots.txt (D-O2): öffentliche Seiten frei; Verwaltung, API und Suchergebnisse ausgenommen.
 * Vorschauen (ADR 0022, V-09): alles gesperrt, ohne Sitemap. Die Indexierungs-Schranke (Konzept-Hinweis, ADR 0049) wirkt
 * bewusst nur über `noindex` im Layout: Ein Disallow hier verböte das Abrufen, und Suchmaschinen sähen das `noindex` nie.
 * KI-Crawler sind wie alle anderen zugelassen (Entscheidung offen, MENSCHEN).
 */
export default function robots(): MetadataRoute.Robots {
  if (betriebsart(process.env) === 'vorschau') return { rules: [{ userAgent: '*', disallow: '/' }] };
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
