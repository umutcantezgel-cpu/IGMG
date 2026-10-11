import { beforeEach, describe, expect, it, vi } from 'vitest';

/** Absenden ohne JavaScript (natives POST): zurück zur Formularseite statt Fehlerseite, nie zu fremder Herkunft. */
let kopf = new Headers();
vi.mock('next/headers', () => ({ headers: async () => kopf }));
vi.mock('next/navigation', () => ({
  redirect: (ziel: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { ziel });
  },
}));
const { zurueckOhneSkript } = await import('@/lib/formulare/ohne-skript');

const ziel = async () => {
  try {
    await zurueckOhneSkript();
    return null;
  } catch (e) {
    return (e as { ziel: string }).ziel;
  }
};

beforeEach(() => {
  kopf = new Headers({ host: 'igmg.test' });
});

describe('zurueckOhneSkript', () => {
  it('mit Next-Action-Header (JavaScript aktiv): nichts', async () => {
    kopf.set('next-action', 'abc');
    expect(await ziel()).toBeNull();
  });

  it('natives POST: zurück zum Pfad des Referers der eigenen Herkunft, mit Anker', async () => {
    kopf.set('referer', 'https://igmg.test/tr/iletisim?x=1#y');
    expect(await ziel()).toBe('/tr/iletisim#ohne-skript');
  });

  it('fremder, fehlender oder ungültiger Referer: Startseite', async () => {
    kopf.set('referer', 'https://boese.test/falle');
    expect(await ziel()).toBe('/#ohne-skript');
    kopf.delete('referer');
    expect(await ziel()).toBe('/#ohne-skript');
    kopf.set('referer', 'kein url');
    expect(await ziel()).toBe('/#ohne-skript');
  });

  it('Pfad mit doppeltem Schrägstrich wird nicht übernommen (kein offener Redirect)', async () => {
    kopf.set('referer', 'https://igmg.test//boese.test/x');
    expect(await ziel()).toBe('/#ohne-skript');
  });
});
