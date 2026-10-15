import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { kontenSicherAus, nichtGefundenZiel } from '@/lib/konto/ohne-konten';
import { cspOeffentlich } from '@/lib/sicherheit/header';
import proxy from '@/proxy';

/**
 * Soft-404 der Konto-Seiten (Endprüfung Stufe C): Ohne Laufzeit-Datenbank bzw. mit `FUNKTION_KONTEN=aus` antwortete
 * /anmelden mit Status 200 und Nicht-gefunden-Inhalt, weil die teilweise vorgerenderte Seite den Status vor dem
 * `notFound()` im Layout festlegt. Der Proxy schreibt solche Anfragen jetzt auf die vorgerenderte 404-Seite der
 * Sprache um (echter Status 404, nachgewiesen gegen `next start` in scratchpad/na2-p3/soft404.log).
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

/** Produktion wie ein frisch importiertes Vercel-Projekt: keine Datenbank, keine Schalter in der Umgebung. */
function ohneDatenbank() {
  vi.stubEnv('NODE_ENV', 'production');
  vi.stubEnv('DATABASE_URL', '');
  vi.stubEnv('BAU_PGLITE', '');
  vi.stubEnv('FUNKTION_KONTEN', '');
}

describe('kontenSicherAus: nur aus der Umgebung entschieden', () => {
  it('ohne Laufzeit-Datenbank: aus – auch mit FUNKTION_KONTEN=an', () => {
    ohneDatenbank();
    expect(kontenSicherAus()).toBe(true);
    vi.stubEnv('FUNKTION_KONTEN', 'an');
    expect(kontenSicherAus()).toBe(true);
  });

  it('mit Datenbank: aus nur mit FUNKTION_KONTEN=aus; sonst entscheidet die Seite (Einstellung, Standard)', () => {
    ohneDatenbank();
    vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/igmg');
    expect(kontenSicherAus()).toBe(false);
    vi.stubEnv('FUNKTION_KONTEN', 'an');
    expect(kontenSicherAus()).toBe(false);
    vi.stubEnv('FUNKTION_KONTEN', 'aus');
    expect(kontenSicherAus()).toBe(true);
  });

  it('Entwicklung (PGlite): nie sicher aus, außer per Umgebung', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('DATABASE_URL', '');
    expect(kontenSicherAus()).toBe(false);
    vi.stubEnv('FUNKTION_KONTEN', 'aus');
    expect(kontenSicherAus()).toBe(true);
  });
});

describe('nichtGefundenZiel: Fangroute der Sprache', () => {
  it.each([
    ['/anmelden', '/de/_'],
    ['/de/anmelden', '/de/_'],
    ['/mein-bereich/kinder/x', '/de/_'],
    ['/tr/giris', '/tr/_'],
    ['/tr/kayit', '/tr/_'],
    ['/en/sign-in', '/en/_'],
    ['/en/register', '/en/_'],
    ['/en', '/en/_'],
  ])('%s → %s', (pfad, ziel) => expect(nichtGefundenZiel(pfad)).toBe(ziel));
});

describe('Proxy: Konto-Seiten ohne Konten', () => {
  const anfrage = (pfad: string) => new NextRequest(new URL(pfad, 'https://igmg.test'));

  it.each([
    '/anmelden',
    '/registrieren',
    '/mein-bereich',
    '/tr/giris',
    '/tr/kayit',
    '/tr/hesabim',
    '/en/sign-in',
    '/en/register',
    '/en/my-account',
  ])('ohne Datenbank: %s → 404-Seite der Sprache, öffentliche CSP, nicht zwischenspeichern', (pfad) => {
    ohneDatenbank();
    const antwort = proxy(anfrage(pfad));
    expect(antwort.headers.get('x-middleware-rewrite')).toBe(`https://igmg.test${nichtGefundenZiel(pfad)}`);
    expect(antwort.headers.get('Content-Security-Policy')).toBe(cspOeffentlich());
    expect(antwort.headers.get('Cache-Control')).toBe('private, no-store');
    expect(antwort.headers.get('X-Robots-Tag')).toBe('noindex, nofollow');
  });

  it('mit Datenbank und ohne Schalter in der Umgebung: unverändert (Nonce-CSP, Seite entscheidet)', () => {
    ohneDatenbank();
    vi.stubEnv('DATABASE_URL', 'postgres://test.invalid/igmg');
    const antwort = proxy(anfrage('/anmelden'));
    expect(antwort.headers.get('x-middleware-rewrite')).toBe('https://igmg.test/de/anmelden');
    expect(antwort.headers.get('Content-Security-Policy')).toMatch(/'nonce-/);
  });

  it('öffentliche Seiten und die Verwaltung bleiben unberührt', () => {
    ohneDatenbank();
    expect(proxy(anfrage('/gebetszeiten')).headers.get('x-middleware-rewrite')).toBe('https://igmg.test/de/gebetszeiten');
    expect(proxy(anfrage('/verwaltung')).headers.get('x-middleware-rewrite')).toBe('https://igmg.test/de/verwaltung');
  });
});
