import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { echtzeitUrsprung } from './lib/echtzeit/konfig';
import { umgebungsSchalter } from './lib/funktionen-regeln';
import { kontenSicherAus, nichtGefundenZiel } from './lib/konto/ohne-konten';
import { istOberflaeche, type Oberflaeche, STANDARD_OBERFLAECHE } from './lib/lernapp/kurse';
import { cspLernApp, cspOeffentlich, cspVerwaltung, istKontoPfad, istLernappVerwaltung } from './lib/sicherheit/header';

const sprachRouting = createMiddleware(routing);

/**
 * Lern-App (ADR 0037 Nr. 1 und 3, Fortschreibung S1): eigener Bereich `/lern-app/[ui]` außerhalb von next-intl.
 * - `/lern-app` → 308 `/lern-app/de`; Links aus der Website `/(de|tr|en)/lern-app…` → 308 `/lern-app/(de|tr)…` in einem
 *   Sprung (für en gibt es keine Oberfläche, also de; eine Oberflächensprache im Rest bleibt erhalten); `/lern-app/en…`
 *   → 308 `/lern-app/de…`.
 * - Andere unbekannte Oberflächensprache: intern auf den festen Platzhalter `/lern-app/de/_` der Fangroute (404 im Layout
 *   der Lern-App, `noindex`, `no-store`). Sonst träfe `[locale]/[...rest]` die Adresse (Sprache „lern-app“, leere
 *   404-Seite; Spike L0-S1). Nie auf `/lern-app/de/<segment>…`: Sonst lieferten `/lern-app/anmelden`,
 *   `/lern-app/einstellungen` oder `/lern-app/tr-aus-de` echte Seiten unter fremder Adresse, die Anmeldung ohne Nonce-CSP
 *   (S-L1 N-1).
 * - `/lern-app/(de|tr|ar)/anmelden…`: dynamisch mit Nonce-CSP, `noindex`, `no-store` wie die Konto-Seiten (ADR 0037 Nr. 4).
 * - Alles Übrige unter `/lern-app/` läuft ohne next-intl durch. `null`: kein Pfad der Lern-App.
 * Pakete, Audio und Modelle (`/lern-app/(pakete|audio|modelle)/…`) erreichen den Proxy nicht (Matcher, ADR 0039 S5 Nr. 7).
 */
type LernAppWeg = { art: 'weiter'; ziel: string } | { art: 'unbekannt' } | { art: 'durch' } | { art: 'anmelden'; ui: Oberflaeche } | null;
function lernAppWeg(pfad: string): LernAppWeg {
  if (pfad === '/lern-app' || pfad === '/lern-app/') return { art: 'weiter', ziel: `/lern-app/${STANDARD_OBERFLAECHE}` };
  const fremd = pfad.match(/^\/(de|tr|en)\/lern-app(\/.*)?$/);
  if (fremd) {
    const rest = fremd[2] === '/' ? '' : (fremd[2] ?? '');
    if (/^\/(de|tr|ar)(\/|$)/.test(rest)) return { art: 'weiter', ziel: `/lern-app${rest}` };
    if (/^\/en(\/|$)/.test(rest)) return { art: 'weiter', ziel: `/lern-app/${STANDARD_OBERFLAECHE}${rest.slice(3)}` };
    return { art: 'weiter', ziel: `/lern-app/${fremd[1] === 'tr' ? 'tr' : STANDARD_OBERFLAECHE}${rest}` };
  }
  if (!pfad.startsWith('/lern-app/')) return null;
  const [, ui = '', rest = ''] = pfad.match(/^\/lern-app\/([^/]*)(\/.*)?$/) ?? [];
  if (istOberflaeche(ui)) return /^\/anmelden(\/|$)/.test(rest) ? { art: 'anmelden', ui } : { art: 'durch' };
  if (ui === 'en') return { art: 'weiter', ziel: `/lern-app/${STANDARD_OBERFLAECHE}${rest}` };
  return { art: 'unbekannt' };
}

/** Kopfzeilen der dynamischen Seiten (Verwaltung, Konto-Seiten, Anmeldung der Lern-App): kein Index, kein Speichern. */
function dynamischeKopfzeilen(antwort: NextResponse, csp: string): NextResponse {
  antwort.headers.set('Content-Security-Policy', csp);
  antwort.headers.set('X-Robots-Tag', 'noindex, nofollow');
  antwort.headers.set('Cache-Control', 'private, no-store');
  return antwort;
}

/**
 * Proxy (Next.js 16): Sprachrouting (next-intl) und Schutzschicht der Verwaltung und der Konto-Seiten.
 * Prüft KEINE Rechte – das macht jede Route und jede Server Action selbst (ADR 0003).
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Lern-App vor allen übrigen Regeln: weder Sprachrouting noch Konto-Regeln (ADR 0037 Nr. 3)
  const lernApp = lernAppWeg(pathname);
  if (lernApp?.art === 'weiter') return NextResponse.redirect(new URL(`${lernApp.ziel}${search}`, request.url), 308);
  if (lernApp?.art === 'unbekannt')
    return dynamischeKopfzeilen(NextResponse.rewrite(new URL(`/lern-app/${STANDARD_OBERFLAECHE}/_`, request.url)), cspLernApp());
  if (lernApp) {
    // Ausgeschaltet heißt 404 (ADR 0035): echt nur, wenn die Umgebung entscheidet (wie `kontenSicherAus`); sonst
    // entscheiden die Seiten. Die Anmeldung ohne Konten ebenso. Ziel ist die Fangroute mit Platzhalter `_`; Kopfzeilen wie
    // die 404 der Konto-Seiten (noindex, no-store – kein Vorhalten der 404 unter der eigentlichen Adresse), CSP der Lern-App.
    const ui = lernApp.art === 'anmelden' ? lernApp.ui : (pathname.split('/')[2] as Oberflaeche);
    const aus = umgebungsSchalter('lernapp', process.env) === false || (lernApp.art === 'anmelden' && kontenSicherAus());
    if (aus) return dynamischeKopfzeilen(NextResponse.rewrite(new URL(`/lern-app/${ui}/_`, request.url)), cspLernApp());
    if (lernApp.art === 'durch') return NextResponse.next();
    // Anmeldung im Scope der PWA (O-7): Nonce-CSP wie die Konto-Seiten; Next liest die Nonce aus der Anfrage-CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    const csp = cspVerwaltung(nonce);
    const kopf = new Headers(request.headers);
    kopf.set('x-nonce', nonce);
    kopf.set('Content-Security-Policy', csp);
    return dynamischeKopfzeilen(NextResponse.next({ request: { headers: kopf } }), csp);
  }

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
    return dynamischeKopfzeilen(NextResponse.rewrite(new URL(nichtGefundenZiel(pathname), request.url)), cspOeffentlich());
  }

  // Konto-Seiten (Anmeldung, Mein Bereich) schützt dieselbe Nonce-CSP wie die Verwaltung (ADR 0026)
  if (verwaltung || istKontoPfad(pathname)) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    // Echtzeit-Server (wss://) nur für Konto-Seiten, nie für die Verwaltung oder öffentliche Seiten (ADR 0027)
    const echtzeit = verwaltung ? null : echtzeitUrsprung();
    const csp = cspVerwaltung(nonce, echtzeit ? [echtzeit] : [], { medienBlob: istLernappVerwaltung(pathname) });
    // next-intl übernimmt die Request-Header in den Rewrite; Next.js liest die Nonce aus der CSP.
    request.headers.set('x-nonce', nonce);
    request.headers.set('Content-Security-Policy', csp);
    return dynamischeKopfzeilen(sprachRouting(request), csp);
  }

  return sprachRouting(request);
}

export const config = {
  // Keine API-Routen, keine Next-Interna, keine Medien, keine Dateien mit Endung; keine Pakete, Audio-Bündel und Modelle
  // der Lern-App (unveränderliche Auslieferung ohne Proxy, sonst doppelter Fast Origin Transfer – ADR 0039 S5 Nr. 7).
  matcher: ['/((?!api|_next|_vercel|medien|lern-app/(?:pakete|audio|modelle)(?:/|$)|.*\\..*).*)'],
};
