import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { echtzeitUrsprung } from './lib/echtzeit/konfig';
import { kontenSicherAus, nichtGefundenZiel } from './lib/konto/ohne-konten';
import { cspOeffentlich, cspVerwaltung, istKontoPfad } from './lib/sicherheit/header';

const sprachRouting = createMiddleware(routing);

/**
 * Lern-App (ADR 0037 Nr. 1 und 3): eigener Bereich `/lern-app/[ui]` außerhalb von next-intl.
 * - `/lern-app` → 308 `/lern-app/de`; Links aus der Website `/(de|tr|en)/lern-app…` → 308 `/lern-app/(de|tr)…` (für en gibt
 *   es keine Oberfläche, also de; eine Oberflächensprache im Rest bleibt erhalten); `/lern-app/en…` → 308 `/lern-app/de…`.
 * - Andere unbekannte Oberflächensprache: intern auf die Fangroute `/lern-app/de/…` (404 im Layout der Lern-App). Sonst
 *   träfe `[locale]/[...rest]` die Adresse (Sprache „lern-app“, leere 404-Seite; Spike L0-S1).
 * - Alles Übrige unter `/lern-app/` läuft ohne next-intl durch. `null`: kein Pfad der Lern-App.
 */
type LernAppWeg = { art: 'weiter' | 'intern'; ziel: string } | { art: 'durch' } | null;
function lernAppWeg(pfad: string): LernAppWeg {
  if (pfad === '/lern-app' || pfad === '/lern-app/') return { art: 'weiter', ziel: '/lern-app/de' };
  const fremd = pfad.match(/^\/(de|tr|en)\/lern-app(\/.*)?$/);
  if (fremd) {
    const rest = fremd[2] === '/' ? '' : (fremd[2] ?? '');
    if (/^\/(de|tr|ar)(\/|$)/.test(rest)) return { art: 'weiter', ziel: `/lern-app${rest}` };
    return { art: 'weiter', ziel: `/lern-app/${fremd[1] === 'tr' ? 'tr' : 'de'}${rest}` };
  }
  if (!pfad.startsWith('/lern-app/')) return null;
  const [, ui = '', rest = ''] = pfad.match(/^\/lern-app\/([^/]*)(\/.*)?$/) ?? [];
  if (ui === 'de' || ui === 'tr' || ui === 'ar') return { art: 'durch' };
  if (ui === 'en') return { art: 'weiter', ziel: `/lern-app/de${rest}` };
  return { art: 'intern', ziel: `/lern-app/de/${ui}${rest}` };
}

/**
 * Proxy (Next.js 16): Sprachrouting (next-intl) und Schutzschicht der Verwaltung und der Konto-Seiten.
 * Prüft KEINE Rechte – das macht jede Route und jede Server Action selbst (ADR 0003).
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Lern-App vor allen übrigen Regeln: weder Sprachrouting noch Konto-Regeln (ADR 0037 Nr. 3)
  const lernApp = lernAppWeg(pathname);
  if (lernApp?.art === 'durch') return NextResponse.next();
  if (lernApp?.art === 'weiter') return NextResponse.redirect(new URL(`${lernApp.ziel}${search}`, request.url), 308);
  if (lernApp?.art === 'intern') return NextResponse.rewrite(new URL(lernApp.ziel, request.url));

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
  // Konto-Seiten ohne Konten: echtes 404 (statt Status 200 mit Nicht-gefunden-Inhalt), öffentliche CSP wie jede 404-Seite.
  // Nur, was die Umgebung entscheidet (keine Datenbank, `FUNKTION_KONTEN=aus`); aus per Einstellung oder Standard der
  // Produktion bleibt es beim Soft-404 des Layouts (200 + noindex) – Grenze und Betriebsweg in `ohne-konten.ts`.
  if (istKontoPfad(pathname) && kontenSicherAus()) {
    const antwort = NextResponse.rewrite(new URL(nichtGefundenZiel(pathname), request.url));
    antwort.headers.set('Content-Security-Policy', cspOeffentlich());
    antwort.headers.set('X-Robots-Tag', 'noindex, nofollow');
    antwort.headers.set('Cache-Control', 'private, no-store');
    return antwort;
  }

  // Konto-Seiten (Anmeldung, Mein Bereich) schützt dieselbe Nonce-CSP wie die Verwaltung (ADR 0026)
  if (verwaltung || istKontoPfad(pathname)) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    // Echtzeit-Server (wss://) nur für Konto-Seiten, nie für die Verwaltung oder öffentliche Seiten (ADR 0027)
    const echtzeit = verwaltung ? null : echtzeitUrsprung();
    const csp = cspVerwaltung(nonce, echtzeit ? [echtzeit] : []);
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
