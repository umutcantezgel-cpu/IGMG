import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { cspOeffentlich, grundHeader } from './src/lib/sicherheit/header';

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
  experimental: {
    agentFeedback: false,
    // Medien bis 10 MB (ADR 0007) plus Formular-Overhead. Standard wäre 1 MB für Actions und 10 MB gepufferter Body im
    // Proxy – größere Bilder kämen gekürzt an (Tor B/C SP-C2 B9). Öffentliche Formulare begrenzt der Reverse-Proxy
    // enger (BETRIEB.md 5b).
    serverActions: { bodySizeLimit: '11mb' },
    proxyClientMaxBodySize: '11mb',
  },
  images: {
    // Medien kommen ausschließlich aus der eigenen Herkunft (ADR 0007).
    localPatterns: [
      { pathname: '/medien/**', search: '' },
      { pathname: '/bilder/**', search: '' },
    ],
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
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
    return [
      { source: '/:pfad*', headers: grundHeader() },
      {
        // Öffentliche Seiten: statische CSP. Die Verwaltung bekommt ihre Nonce-CSP im Proxy.
        source: '/:pfad((?!verwaltung|de/verwaltung|tr/verwaltung|en/verwaltung).*)',
        headers: [{ key: 'Content-Security-Policy', value: cspOeffentlich() }],
      },
    ];
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);
