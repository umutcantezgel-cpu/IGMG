import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import {
  KONTO_SEGMENTE,
  PFAD_BERECHTIGUNGEN,
  cspOeffentlich,
  grundHeader,
  lernAppHeaderRegeln,
  noindexHeader,
  permissionsPolicy,
} from './src/lib/sicherheit/header';

/**
 * Pfade ohne öffentliche CSP: Verwaltung und Konto-Seiten (Nonce-CSP im Proxy), mit/ohne Sprachpräfix, und die Lern-App
 * nur ohne Sprachpräfix (eigene CSP aus `lernAppHeaderRegeln`, ADR 0042 Nr. 9). `/(de|tr|en)/lern-app/…` leitet der Proxy
 * weiter; erreicht ihn ein solcher Pfad nicht (Punkt im Pfad), gilt die öffentliche CSP – nie gar keine (S-L1 N-2).
 */
const CSP_AUSNAHMEN = [...['verwaltung', ...KONTO_SEGMENTE].map((s) => `(?:(?:de|tr|en)/)?${s}(?:/|$)`), 'lern-app(?:/|$)'].join('|');

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
  // Beispielmodus: Für „HTML-begrenzte“ Bots (WhatsApp, Slackbot, facebookexternalhit, Twitterbot, Bingbot …) umgeht
  // Next die vorgerenderte Hülle und rendert jede Anfrage neu – ohne Datenbank „DATABASE_URL fehlt“ und 500 für Linkvorschauen.
  // Die Hülle trägt Titel, Beschreibung und og:* schon im <head>; deshalb hier kein Bot als HTML-begrenzt (reines Literal ohne ^/$,
  // Next macht daraus „.*(?:…).*“ für den Vercel-Header-Matcher). Mit Datenbank: Vorgabe.
  ...(beispielmodus ? { htmlLimitedBots: /igmg-beispielmodus-ohne-html-begrenzte-bots/ } : {}),
  // PGlite (Bau-Datenbank, ADR 0017) nicht bündeln: Gebündelt sucht es pglite.data unter dem Turbopack-Platzhalter
  // /ROOT/node_modules/… statt im echten node_modules, und der Bau mit BAU_PGLITE=1 bricht beim Vorrendern ab.
  serverExternalPackages: ['@electric-sql/pglite'],
  // OG-Bilder (lib/seo/og-bild.tsx) lesen Monogramm und WOFF-Schriften zur Laufzeit von der Platte: in den Funktionsbau
  // (standalone, Vercel) mitnehmen, auch für erst zur Laufzeit erzeugte Bilder (K-05). Ohne Schriften nimmt next/og
  // seine eingebaute Schrift, ohne Monogramm schlüge das Bild fehl.
  // Suche ohne Datenbank (Beispielmodus): den beim Bau erzeugten Titel-Index (scripts/suchindex.ts) zur Laufzeit lesen.
  outputFileTracingIncludes: {
    ...Object.fromEntries(
      ['/**/opengraph-image*', '/**/opengraph-image*/**'].map((route) => [
        route,
        [
          'public/symbole/symbol-512.png',
          'node_modules/@fontsource/source-serif-4/files/source-serif-4-latin{,-ext}-600-normal.woff',
          'node_modules/@fontsource/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin{,-ext}-{400,700}-normal.woff',
        ],
      ]),
    ),
    '/**/suche': ['.suchindex.json'],
    // Lern-App ohne Blob-Speicher (Beispielmodus, E2E): synthetische Testbündel aus dem Dateisystem (ADR 0039 Nr. 11); die
    // Route liefert sie nur, wenn der Testkurs importiert ist (Fortschreibung Stufe C Nr. 4)
    '/lern-app/audio/**': ['drizzle/seeds/lernapp-testaudio/**/*.lpa'],
    // Verwaltung der Lern-App (L3-06): Religionswächter für Eingaben (S-L1 M-3) und Quellenregister (QUELLE.md der Datensätze)
    '/**/verwaltung/lernapp/**': ['daten/tanzil/quran-uthmani.xml', 'daten/hadith/ara-bukhari.json', 'daten/*/QUELLE.md'],
    // IGMG-Abgleich (ADR 0048): Jahresdateien der IGMG mit QUELLE.md für Cron, Verwaltung und Startklar (nur mit Erlaubnis im Repo)
    '/api/wartung/gebetszeiten-abgleich': ['daten/igmg-gebetskalender/**'],
    '/**/verwaltung/gebetszeiten': ['daten/igmg-gebetskalender/**'],
    '/**/verwaltung/startklar': ['daten/igmg-gebetskalender/**'],
  },
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
    // Z-08 (N1): Gemeinsame Chunks (Leiste, Seitenwechsel), die auch not-found lädt, nicht in die Chunks jeder Seite
    // mischen – sonst lädt jede Seite sie doppelt. Vorgabe 200000 (ungepackte Bytes).
    turbopackChunking: { maxMergeChunkSize: 30000 },
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
      // Berechtigungen je Pfad (Standort nur Gebetszeiten, Mikrofon/Kamera nur Verwaltung)
      ...PFAD_BERECHTIGUNGEN.map(({ source, erlaubt }) => ({
        source,
        headers: [{ key: 'Permissions-Policy', value: permissionsPolicy(erlaubt) }],
      })),
      ...(noindex.length ? [{ source: '/:pfad*', headers: noindex }] : []),
      // Logos und Symbole (ADR 0023): Dateinamen ohne Versionsanteil → kein „immutable“, aber ein Tag Cache und eine
      // Woche „stale-while-revalidate“; ein neues Logo bekommt einen neuen Dateinamen (BETRIEB.md)
      {
        source: '/:ordner(bilder|symbole)/:pfad*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' }],
      },
      {
        // Öffentliche Seiten: statische CSP. Verwaltung und Konto-Seiten bekommen ihre Nonce-CSP im Proxy.
        source: `/:pfad((?!${CSP_AUSNAHMEN}).*)`,
        headers: [{ key: 'Content-Security-Policy', value: cspOeffentlich() }],
      },
      // Lern-App: COOP/COEP, eigene CSP, Modelle und Service Worker (nach der öffentlichen Regel)
      ...lernAppHeaderRegeln(),
    ];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
