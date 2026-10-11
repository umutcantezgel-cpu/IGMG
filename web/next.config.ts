import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { cspOeffentlich, grundHeader, noindexHeader } from './src/lib/sicherheit/header';

/**
 * Beispielmodus auf Vercel (Bau ohne DATABASE_URL, ADR 0019): Die Inhalte stammen aus der PGlite-Bau-Datenbank und
 * können sich nicht ändern. Jede Erneuerung im Hintergrund scheitert dort („DATABASE_URL fehlt“ im Laufzeitprotokoll),
 * und nach `expire` (bei `hours` ein Tag) müsste eine Anfrage synchron neu erzeugen – mit Fehlerseite. Deshalb
 * gelten in diesem Modus alle Cache-Profile, auch die eingebauten Namen, als dauerhaft (ein Jahr). Mit Datenbank
 * (und unter Docker, das BAU_PGLITE ohne VERCEL nutzt) bleiben die Vorgaben von Next unverändert.
 */
const JAHR = 60 * 60 * 24 * 365;
const beispielmodus = process.env.VERCEL === '1' && process.env.BAU_PGLITE === '1';
const DAUERHAFT = { stale: 300, revalidate: JAHR, expire: 2 * JAHR };
const PROFILE = ['default', 'seconds', 'minutes', 'hours', 'days', 'weeks', 'max'] as const;

/**
 * Next.js-Konfiguration (K-01, K-13, K-14, K-17, K-19).
 * Telemetrie ist zusätzlich über NEXT_TELEMETRY_DISABLED=1 in .env und Skripten aus.
 */
const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  poweredByHeader: false,
  ...(beispielmodus ? { cacheLife: Object.fromEntries(PROFILE.map((name) => [name, DAUERHAFT])) } : {}),
  // PGlite (Bau-Datenbank, ADR 0017) nicht bündeln: Gebündelt sucht es pglite.data unter dem Turbopack-Platzhalter
  // /ROOT/node_modules/… statt im echten node_modules, und der Bau mit BAU_PGLITE=1 bricht beim Vorrendern ab.
  serverExternalPackages: ['@electric-sql/pglite'],
  experimental: {
    agentFeedback: false,
    // Medien bis 10 MB (ADR 0007) plus Formular-Overhead. Standard wäre 1 MB für Actions und 10 MB gepufferter Body im
    // Proxy – größere Bilder kämen gekürzt an (Tor B/C SP-C2 B9). Öffentliche Formulare begrenzt der Reverse-Proxy
    // enger (BETRIEB.md 5b).
    serverActions: { bodySizeLimit: '11mb' },
    proxyClientMaxBodySize: '11mb',
    // Produktions-Builds ohne persistenten Turbopack-Zwischenspeicher (L-E09): Ein Build übernahm das alte
    // globals.css aus dem Zwischenspeicher, während die Klassen frisch eingelesen wurden (Tokens und Keyframes fehlten).
    // Vercel stellt `.next/cache` zwischen Deployments wieder her; deterministische Builds gehen vor Bauzeit.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    // Medien kommen ausschließlich aus der eigenen Herkunft (ADR 0007).
    localPatterns: [
      { pathname: '/medien/**', search: '' },
      { pathname: '/bilder/**', search: '' },
    ],
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    // Vercel (Services-Modus, BETRIEB.md 9) bindet /_next/image nicht an – die Anfrage landet in der App und endet
    // mit 404, Logos und Bilder fehlen. Dort direkt ausliefern; Medien sind beim Hochladen bereits verkleinert (ADR 0007).
    unoptimized: process.env.VERCEL === '1',
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  async headers() {
    const noindex = noindexHeader();
    return [
      { source: '/:pfad*', headers: grundHeader() },
      ...(noindex.length ? [{ source: '/:pfad*', headers: noindex }] : []),
      // Logos und Symbole (ADR 0023): Dateinamen ohne Versionsanteil → kein „immutable“, aber ein Tag Cache und eine
      // Woche „stale-while-revalidate“; ein neues Logo bekommt einen neuen Dateinamen (BETRIEB.md)
      {
        source: '/:ordner(bilder|symbole)/:pfad*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        // Öffentliche Seiten: statische CSP. Die Verwaltung bekommt ihre Nonce-CSP im Proxy.
        source: '/:pfad((?!verwaltung|de/verwaltung|tr/verwaltung|en/verwaltung).*)',
        headers: [{ key: 'Content-Security-Policy', value: cspOeffentlich() }],
      },
    ];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
