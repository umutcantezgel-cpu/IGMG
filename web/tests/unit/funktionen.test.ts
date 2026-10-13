import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/server/queries/einstellungen', () => ({ ladeEinstellung: async () => ({}) }));

const { entscheide, FUNKTIONEN, MIT_PERSONENDATEN } = await import('@/lib/funktionen');
const { IN_PRODUKTION_AN } = await import('@/lib/funktionen-regeln');

describe('Funktionsschalter (ADR 0035)', () => {
  it('Produktion: ohne Angaben ist alles aus – außer den freigegebenen Funktionen ohne Personendaten', () => {
    for (const f of FUNKTIONEN)
      expect(entscheide(f, { SITE_MODE: 'produktion', NODE_ENV: 'production' }, null)).toBe(IN_PRODUKTION_AN.includes(f));
    expect(IN_PRODUKTION_AN).toEqual(['hadith_gesamt']);
  });

  it('Funktionen mit Personendaten sind in der Produktion nie standardmäßig an', () => {
    for (const f of MIT_PERSONENDATEN) expect(IN_PRODUKTION_AN).not.toContain(f);
  });

  it('auch freigegebene Funktionen lassen sich per Umgebung oder Einstellung abschalten', () => {
    const prod = { SITE_MODE: 'produktion', NODE_ENV: 'production' };
    expect(entscheide('hadith_gesamt', { ...prod, FUNKTION_HADITH_GESAMT: 'aus' }, null)).toBe(false);
    expect(entscheide('hadith_gesamt', prod, { hadith_gesamt: false })).toBe(false);
  });

  it('Entwicklung und Vorschau: Standard an (Vorführung)', () => {
    expect(entscheide('chat', { NODE_ENV: 'development' }, null)).toBe(true);
  });

  it('Umgebung schlägt Einstellung, Einstellung schlägt Standard', () => {
    const prod = { SITE_MODE: 'produktion', NODE_ENV: 'production' };
    expect(entscheide('chat', prod, { chat: true })).toBe(true);
    expect(entscheide('chat', { ...prod, FUNKTION_CHAT: 'aus' }, { chat: true })).toBe(false);
    expect(entscheide('push', { ...prod, FUNKTION_PUSH: 'an' }, { push: false })).toBe(true);
  });
});
