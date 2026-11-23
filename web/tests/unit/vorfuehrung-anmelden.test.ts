import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VORFUEHRUNG_COOKIE, VORFUEHRUNG_PASSWORT } from '@/lib/vorfuehrung/konten';

/**
 * Server Action des Testzugangs (ADR 0052): wirkt nur in der Vorführung ohne Datenbank; sonst setzt sie kein Cookie.
 * `redirect` wirft wie in Next – hier mit dem Ziel in der Meldung.
 */
const gesetzt = vi.fn();
const geloescht = vi.fn();
vi.mock('next/headers', () => ({ cookies: async () => ({ set: gesetzt, delete: geloescht }) }));
vi.mock('next/navigation', () => ({
  redirect: (ziel: string) => {
    throw new Error(`UMLEITUNG ${ziel}`);
  },
}));

function formular(benutzername: string, passwort: string): FormData {
  const daten = new FormData();
  daten.set('benutzername', benutzername);
  daten.set('passwort', passwort);
  return daten;
}

async function anmelden(benutzername: string, passwort: string): Promise<string> {
  const { testzugangAnmelden } = await import('@/server/actions/vorfuehrung');
  return testzugangAnmelden(formular(benutzername, passwort)).then(
    () => 'ohne Umleitung',
    (e: Error) => e.message,
  );
}

beforeEach(() => gesetzt.mockClear());
afterEach(() => vi.unstubAllEnvs());

describe('testzugangAnmelden', () => {
  it('außerhalb der Vorführung: kein Cookie, auch mit richtigem Passwort', async () => {
    vi.stubEnv('VORFUEHRUNG', '');
    vi.stubEnv('DATABASE_URL', '');
    expect(await anmelden('verwaltung', VORFUEHRUNG_PASSWORT)).toBe('UMLEITUNG /verwaltung/anmelden');
    expect(gesetzt).not.toHaveBeenCalled();
  });

  it('mit echter Datenbank: kein Cookie, auch wenn das Kennzeichen im Bau steht', async () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', 'postgres://beispiel');
    expect(await anmelden('verwaltung', VORFUEHRUNG_PASSWORT)).toBe('UMLEITUNG /verwaltung/anmelden');
    expect(gesetzt).not.toHaveBeenCalled();
  });

  it('in der Vorführung: richtiges Passwort setzt das Cookie des Zugangs und führt in seinen Bereich', async () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', '');
    expect(await anmelden('redaktion', VORFUEHRUNG_PASSWORT)).toBe('UMLEITUNG /verwaltung');
    expect(gesetzt).toHaveBeenCalledWith(VORFUEHRUNG_COOKIE, 'redaktion', expect.objectContaining({ httpOnly: true, path: '/' }));
    gesetzt.mockClear();
    expect(await anmelden('Eltern', VORFUEHRUNG_PASSWORT)).toBe('UMLEITUNG /mein-bereich');
    expect(gesetzt).toHaveBeenCalledWith(VORFUEHRUNG_COOKIE, 'eltern', expect.anything());
  });

  it('in der Vorführung: falsche Eingabe führt mit Hinweis zurück, ohne Cookie', async () => {
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', '');
    expect(await anmelden('verwaltung', 'falsch')).toBe('UMLEITUNG /verwaltung/anmelden?fehler=1');
    expect(await anmelden('niemand', VORFUEHRUNG_PASSWORT)).toBe('UMLEITUNG /verwaltung/anmelden?fehler=1');
    expect(gesetzt).not.toHaveBeenCalled();
  });

  it('Abmelden auf der Anmeldeseite löscht das Cookie nur in der Vorführung', async () => {
    const { testzugangAbmelden } = await import('@/server/actions/vorfuehrung');
    const ab = () =>
      testzugangAbmelden().then(
        () => 'ohne Umleitung',
        (e: Error) => e.message,
      );
    geloescht.mockClear();
    vi.stubEnv('VORFUEHRUNG', '');
    expect(await ab()).toBe('UMLEITUNG /verwaltung/anmelden?abgemeldet=1');
    expect(geloescht).not.toHaveBeenCalled();
    vi.stubEnv('VORFUEHRUNG', '1');
    vi.stubEnv('DATABASE_URL', '');
    expect(await ab()).toBe('UMLEITUNG /verwaltung/anmelden?abgemeldet=1');
    expect(geloescht).toHaveBeenCalledWith(VORFUEHRUNG_COOKIE);
  });
});
