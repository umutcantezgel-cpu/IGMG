import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

// `connection()` wartet in Next auf die Anfrage; im Test gibt es keine
vi.mock('next/server', async (original) => ({ ...(await original<typeof import('next/server')>()), connection: async () => undefined }));
import { GET as abmelden } from '@/app/api/vorfuehrung/abmelden/route';
import { GET as anmeldenPerLink, POST as anmeldenPerFormular } from '@/app/api/vorfuehrung/anmelden/route';
import { VORFUEHRUNG_COOKIE, VORFUEHRUNG_PASSWORT } from '@/lib/vorfuehrung/konten';

/**
 * Anmelden und Abmelden des Testzugangs (ADR 0052) als gewöhnliches Formular und gewöhnliche Links: nur in der Vorführung
 * ohne Datenbank; sonst 404 und kein Cookie.
 */
const BASIS = 'https://igmg.test';

function formular(benutzername: string, passwort: string): NextRequest {
  const daten = new URLSearchParams({ benutzername, passwort });
  return new NextRequest(`${BASIS}/api/vorfuehrung/anmelden`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: daten.toString(),
  });
}
const link = (als: string) => new NextRequest(`${BASIS}/api/vorfuehrung/anmelden?als=${als}`);
const cookie = (antwort: Response) => antwort.headers.get('set-cookie') ?? '';

function vorfuehrungAn() {
  vi.stubEnv('VORFUEHRUNG', '1');
  vi.stubEnv('DATABASE_URL', '');
}

afterEach(() => vi.unstubAllEnvs());

describe('Anmeldung mit dem Testzugang', () => {
  it('außerhalb der Vorführung: 404 ohne Cookie, per Formular und per Link', async () => {
    vi.stubEnv('VORFUEHRUNG', '');
    vi.stubEnv('DATABASE_URL', '');
    for (const antwort of [await anmeldenPerFormular(formular('admin', VORFUEHRUNG_PASSWORT)), await anmeldenPerLink(link('admin'))]) {
      expect(antwort.status).toBe(404);
      expect(cookie(antwort)).toBe('');
    }
  });

  it('mit echter Datenbank: 404 ohne Cookie, auch wenn das Kennzeichen im Bau steht', async () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', 'postgres://beispiel');
    for (const antwort of [await anmeldenPerFormular(formular('admin', VORFUEHRUNG_PASSWORT)), await anmeldenPerLink(link('admin'))]) {
      expect(antwort.status).toBe(404);
      expect(cookie(antwort)).toBe('');
    }
  });

  it('Formular: richtiges Passwort setzt das Cookie des Benutzers und führt in seinen Bereich', async () => {
    vorfuehrungAn();
    const redaktion = await anmeldenPerFormular(formular('redaktion', VORFUEHRUNG_PASSWORT));
    expect(redaktion.status).toBe(303);
    expect(redaktion.headers.get('location')).toBe('/verwaltung');
    expect(redaktion.headers.get('cache-control')).toBe('no-store');
    expect(cookie(redaktion)).toMatch(new RegExp(`^${VORFUEHRUNG_COOKIE}=redaktion;`));
    expect(cookie(redaktion)).toMatch(/HttpOnly/i);
    const eltern = await anmeldenPerFormular(formular(' Eltern ', VORFUEHRUNG_PASSWORT));
    expect(eltern.headers.get('location')).toBe('/mein-bereich');
    expect(cookie(eltern)).toMatch(new RegExp(`^${VORFUEHRUNG_COOKIE}=eltern;`));
  });

  it('Formular: falsche Eingabe führt mit Hinweis zurück, ohne Cookie', async () => {
    vorfuehrungAn();
    for (const antwort of [
      await anmeldenPerFormular(formular('admin', 'falsch')),
      await anmeldenPerFormular(formular('niemand', VORFUEHRUNG_PASSWORT)),
    ]) {
      expect(antwort.status).toBe(303);
      expect(antwort.headers.get('location')).toBe('/verwaltung/anmelden?fehler=1');
      expect(cookie(antwort)).toBe('');
    }
  });

  it('Link: bekannter Benutzername meldet an, unbekannter führt mit Hinweis zurück', async () => {
    vorfuehrungAn();
    const imam = await anmeldenPerLink(link('imam'));
    expect(imam.status).toBe(303);
    expect(imam.headers.get('location')).toBe('/verwaltung');
    expect(cookie(imam)).toMatch(new RegExp(`^${VORFUEHRUNG_COOKIE}=imam;`));
    const kind = await anmeldenPerLink(link('kind'));
    expect(kind.headers.get('location')).toBe('/mein-bereich');
    const fremd = await anmeldenPerLink(link('administration'));
    expect(fremd.headers.get('location')).toBe('/verwaltung/anmelden?fehler=1');
    expect(cookie(fremd)).toBe('');
  });
});

describe('Abmelden des Testzugangs', () => {
  it('außerhalb der Vorführung: 404', async () => {
    vi.stubEnv('VORFUEHRUNG', '');
    expect((await abmelden()).status).toBe(404);
  });

  it('in der Vorführung: Cookie gelöscht, zurück zur Anmeldeseite', async () => {
    vorfuehrungAn();
    const antwort = await abmelden();
    expect(antwort.status).toBe(303);
    expect(antwort.headers.get('location')).toBe('/verwaltung/anmelden?abgemeldet=1');
    expect(cookie(antwort)).toMatch(new RegExp(`^${VORFUEHRUNG_COOKIE}=;`));
  });
});
