import type { MetadataRoute } from 'next';

/**
 * Web-App-Manifest (D-P1, PWA): installierbar, startet auf der Startseite; Symbole = neutrales Monogramm
 * (scripts/pwa-symbole.mjs, nicht das IGMG-Logo). Farben aus den Tokens (gruen-800, papier).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'IGMG Wetzlar',
    short_name: 'IGMG Wetzlar',
    description: 'Gebetszeiten, Veranstaltungen und Neuigkeiten der IGMG Wetzlar',
    lang: 'de',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fcfaf6',
    theme_color: '#065f46',
    icons: [
      { src: '/symbole/symbol-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/symbole/symbol-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/symbole/symbol-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
