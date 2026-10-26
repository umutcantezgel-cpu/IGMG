import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cspLernApp } from '@/lib/sicherheit/header';
import proxy, { config } from '@/proxy';

/**
 * Proxy-Weichen der Lern-App (ADR 0037 Nr. 1/3/4 mit Fortschreibung S1, ADR 0039 Fortschreibung S5 Nr. 7): Weiterleitungen in
 * einem Sprung, interne 404 für unbekannte Oberflächensprachen, Anmeldung mit Nonce-CSP, Durchlass ohne next-intl,
 * Abschalten über die Umgebung, Matcher-Ausschluss für Pakete, Audio und Modelle.
 */
const BASIS = 'https://igmg.test';
const anfrage = (pfad: string) => new NextRequest(new URL(pfad, BASIS));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('Weiterleitungen (308, ein Sprung)', () => {
  it.each([
    ['/lern-app', '/lern-app/de'],
    ['/lern-app/', '/lern-app/de'],
    ['/de/lern-app', '/lern-app/de'],
    ['/de/lern-app/', '/lern-app/de'],
    ['/tr/lern-app', '/lern-app/tr'],
    ['/en/lern-app', '/lern-app/de'],
    ['/tr/lern-app/tr-aus-de', '/lern-app/tr/tr-aus-de'],
    ['/en/lern-app/tr-aus-de', '/lern-app/de/tr-aus-de'],
    ['/tr/lern-app/ar', '/lern-app/ar'],
    ['/de/lern-app/tr/einstellungen', '/lern-app/tr/einstellungen'],
    ['/tr/lern-app/en/x', '/lern-app/de/x'],
    ['/lern-app/en', '/lern-app/de'],
    ['/lern-app/en/tr-aus-de/ueben', '/lern-app/de/tr-aus-de/ueben'],
    ['/tr/lern-app?x=1', '/lern-app/tr?x=1'],
    ['/lern-app/en/quellen?a=b', '/lern-app/de/quellen?a=b'],
  ])('%s → %s', (von, nach) => {
    const antwort = proxy(anfrage(von));
    expect(antwort.status).toBe(308);
    expect(antwort.headers.get('location')).toBe(`${BASIS}${nach}`);
  });

  it('kein Ziel außerhalb des eigenen Ursprungs (offene Weiterleitung)', () => {
    for (const pfad of ['/lern-app//evil.test', '/tr/lern-app//evil.test', '/lern-app/en//evil.test']) {
      const antwort = proxy(anfrage(pfad));
      const ziel = antwort.headers.get('location') ?? antwort.headers.get('x-middleware-rewrite');
      if (ziel) expect(new URL(ziel).origin, pfad).toBe(BASIS);
    }
  });
});

describe('unbekannte Oberflächensprache → 404 der Lern-App', () => {
  it.each([
    '/lern-app/xx',
    '/lern-app/xx/yy',
    '/lern-app/arabisch/tr-aus-ar',
    // Seitennamen an der Stelle der Oberflächensprache treffen nie echte Seiten (S-L1 N-1)
    '/lern-app/anmelden',
    '/lern-app/anmelden/zwei-faktor',
    '/lern-app/einstellungen',
    '/lern-app/tr-aus-de',
    '/lern-app/tr-aus-de/ueben',
    '/lern-app/_',
  ])('%s → intern der feste Platzhalter /lern-app/de/_ (Fangroute), noindex, no-store, CSP der Lern-App', (von) => {
    const antwort = proxy(anfrage(von));
    expect(antwort.headers.get('x-middleware-rewrite')).toBe(`${BASIS}/lern-app/de/_`);
    expect(antwort.headers.get('location')).toBeNull();
    expect(antwort.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    expect(antwort.headers.get('Cache-Control')).toBe('private, no-store');
    expect(antwort.headers.get('Content-Security-Policy')).toBe(cspLernApp());
  });
});

describe('Durchlass ohne next-intl', () => {
  it.each(['/lern-app/de', '/lern-app/tr/tr-aus-de', '/lern-app/ar/de-aus-ar/ueben', '/lern-app/de/islam/tipps', '/lern-app/de/anmeldenx'])(
    '%s läuft unverändert durch, ohne CSP aus dem Proxy',
    (pfad) => {
      const antwort = proxy(anfrage(pfad));
      expect(antwort.headers.get('x-middleware-next')).toBe('1');
      expect(antwort.headers.get('x-middleware-rewrite')).toBeNull();
      expect(antwort.headers.get('Content-Security-Policy')).toBeNull();
    },
  );

  it('ähnliche Adressen der Website gehen weiter durch next-intl', () => {
    expect(proxy(anfrage('/lern-appx/de')).headers.get('x-middleware-rewrite')).toBe(`${BASIS}/de/lern-appx/de`);
    expect(proxy(anfrage('/lernen')).headers.get('x-middleware-rewrite')).toBe(`${BASIS}/de/lernen`);
  });
});

describe('Anmeldung im Scope (Nonce-CSP, noindex, no-store wie die Konto-Seiten)', () => {
  it.each(['/lern-app/de/anmelden', '/lern-app/tr/anmelden', '/lern-app/ar/anmelden', '/lern-app/de/anmelden/zwei-faktor'])(
    '%s',
    (pfad) => {
      vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/igmg');
      const antwort = proxy(anfrage(pfad));
      const csp = antwort.headers.get('Content-Security-Policy') ?? '';
      const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
      expect(nonce).toBeTruthy();
      expect(csp).toContain("'strict-dynamic'");
      expect(csp).not.toContain("'unsafe-inline' 'wasm");
      expect(antwort.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
      expect(antwort.headers.get('Cache-Control')).toBe('private, no-store');
      expect(antwort.headers.get('x-middleware-next')).toBe('1');
      // Next liest die Nonce aus den überschriebenen Anfrage-Kopfzeilen
      expect(antwort.headers.get('x-middleware-request-x-nonce')).toBe(nonce);
      expect(antwort.headers.get('x-middleware-request-content-security-policy')).toBe(csp);
    },
  );

  it('jede Anfrage bekommt eine neue Nonce', () => {
    vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/igmg');
    const a = proxy(anfrage('/lern-app/de/anmelden')).headers.get('Content-Security-Policy');
    const b = proxy(anfrage('/lern-app/de/anmelden')).headers.get('Content-Security-Policy');
    expect(a).not.toBe(b);
  });

  it('ohne Konten (keine Laufzeit-Datenbank bzw. FUNKTION_KONTEN=aus): echte 404 der Lern-App', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', '');
    vi.stubEnv('BAU_PGLITE', '');
    const antwort = proxy(anfrage('/lern-app/tr/anmelden'));
    expect(antwort.headers.get('x-middleware-rewrite')).toBe(`${BASIS}/lern-app/tr/_`);
    expect(antwort.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
    // wie die 404 der Konto-Seiten: nicht vorhalten
    expect(antwort.headers.get('Cache-Control')).toBe('private, no-store');
    expect(antwort.headers.get('Content-Security-Policy')).toBe(cspLernApp());
    vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/igmg');
    vi.stubEnv('FUNKTION_KONTEN', 'aus');
    expect(proxy(anfrage('/lern-app/ar/anmelden')).headers.get('x-middleware-rewrite')).toBe(`${BASIS}/lern-app/ar/_`);
    // die übrigen Seiten der Lern-App brauchen keine Konten
    expect(proxy(anfrage('/lern-app/ar')).headers.get('x-middleware-next')).toBe('1');
  });
});

describe('Schalter lernapp aus der Umgebung (ausgeschaltet heißt 404, ADR 0035)', () => {
  it('FUNKTION_LERNAPP=aus: jede Seite der Lern-App auf die 404 der Sprache, mit CSP der Lern-App', () => {
    vi.stubEnv('FUNKTION_LERNAPP', 'aus');
    for (const [pfad, ziel] of [
      ['/lern-app/de', '/lern-app/de/_'],
      ['/lern-app/ar/tr-aus-ar', '/lern-app/ar/_'],
      ['/lern-app/tr/anmelden', '/lern-app/tr/_'],
    ]) {
      const antwort = proxy(anfrage(pfad));
      expect(antwort.headers.get('x-middleware-rewrite'), pfad).toBe(`${BASIS}${ziel}`);
      expect(antwort.headers.get('Content-Security-Policy'), pfad).toBe(cspLernApp());
      expect(antwort.headers.get('X-Robots-Tag'), pfad).toBe('noindex, nofollow');
      expect(antwort.headers.get('Cache-Control'), pfad).toBe('private, no-store');
    }
    // Weiterleitungen bleiben (sie zeigen danach auf die 404)
    expect(proxy(anfrage('/lern-app')).status).toBe(308);
  });

  it('FUNKTION_LERNAPP=an oder ohne Angabe: Durchlass (die Seiten entscheiden)', () => {
    vi.stubEnv('FUNKTION_LERNAPP', 'an');
    expect(proxy(anfrage('/lern-app/de')).headers.get('x-middleware-next')).toBe('1');
    vi.stubEnv('FUNKTION_LERNAPP', '');
    expect(proxy(anfrage('/lern-app/de')).headers.get('x-middleware-next')).toBe('1');
  });

  it('S-L3 N-4: FUNKTION_LERNAPP=aus – unter /lern-app/sw.js der Abmelde-Worker; sonst die Datei aus public/', () => {
    vi.stubEnv('FUNKTION_LERNAPP', 'aus');
    const aus = proxy(anfrage('/lern-app/sw.js?v=abc123'));
    expect(aus.headers.get('x-middleware-rewrite')).toBe(`${BASIS}/lern-app/sw-abmelden.js`);
    expect(aus.status).toBe(200);
    for (const wert of ['an', '']) {
      vi.stubEnv('FUNKTION_LERNAPP', wert);
      const an = proxy(anfrage('/lern-app/sw.js?v=abc123'));
      // Durchlass zur statischen Datei – nicht die 404 einer „unbekannten Oberflächensprache“ sw.js
      expect(an.headers.get('x-middleware-next'), wert).toBe('1');
      expect(an.headers.get('x-middleware-rewrite'), wert).toBeNull();
    }
  });
});

describe('Matcher: Pakete, Audio und Modelle ohne Proxy (ADR 0039 Fortschreibung S5 Nr. 7)', () => {
  const trifft = (url: string) => unstable_doesMiddlewareMatch({ config, url });

  it.each([
    '/lern-app/pakete/tr-aus-de',
    '/lern-app/pakete/tr-aus-de/tr.a1.e01/abc123',
    '/lern-app/audio/tr/tr.a1.e01-0123456789abcdef',
    '/lern-app/modelle/whisper-base-64da572/config',
    '/lern-app/pakete',
    '/lern-app/sw-abmelden.js',
    '/lern-app/symbole/symbol-192.png',
    '/lern-app/de/manifest.webmanifest',
  ])('%s: kein Proxy', (url) => expect(trifft(url)).toBe(false));

  it.each(['/lern-app', '/lern-app/de', '/lern-app/de/anmelden', '/lern-app/paketewelt', '/de/lern-app', '/quran/1', '/lern-app/sw.js'])(
    '%s: Proxy',
    (url) => expect(trifft(url)).toBe(true),
  );
});
