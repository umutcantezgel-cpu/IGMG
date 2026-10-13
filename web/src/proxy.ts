import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { cspVerwaltung, istKontoPfad } from './lib/sicherheit/header';

const sprachRouting = createMiddleware(routing);

/**
 * Proxy (Next.js 16): Sprachrouting (next-intl) und Schutzschicht der Verwaltung und der Konto-Seiten.
 * Prüft KEINE Rechte – das macht jede Route und jede Server Action selbst (ADR 0003).
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Verwaltung ist nur deutsch (ADR 0016): /tr/verwaltung… und /en/verwaltung… → /verwaltung…
  const fremd = pathname.match(/^\/(tr|en)(\/verwaltung(?:\/.*)?)$/);
  if (fremd) {
    return NextResponse.redirect(new URL(`${fremd[2]}${search}`, request.url), 308);
  }

  const verwaltung =
    pathname === '/verwaltung' ||
    pathname.startsWith('/verwaltung/') ||
    pathname === '/de/verwaltung' ||
    pathname.startsWith('/de/verwaltung/');
  // Konto-Seiten (Anmeldung, Mein Bereich) schützt dieselbe Nonce-CSP wie die Verwaltung (ADR Kontoarten)
  if (verwaltung || istKontoPfad(pathname)) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const csp = cspVerwaltung(nonce);
    // next-intl übernimmt die Request-Header in den Rewrite; Next.js liest die Nonce aus der CSP.
    request.headers.set('x-nonce', nonce);
    request.headers.set('Content-Security-Policy', csp);
    const antwort = sprachRouting(request);
    antwort.headers.set('Content-Security-Policy', csp);
    antwort.headers.set('X-Robots-Tag', 'noindex, nofollow');
    antwort.headers.set('Cache-Control', 'private, no-store');
    return antwort;
  }

  return sprachRouting(request);
}

export const config = {
  // Keine API-Routen, keine Next-Interna, keine Medien, keine Dateien mit Endung.
  matcher: ['/((?!api|_next|_vercel|medien|.*\\..*).*)'],
};
