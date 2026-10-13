import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));
vi.mock('@/server/queries/einstellungen', () => ({ ladeEinstellung: async () => ({}) }));

const { entscheide, FUNKTIONEN } = await import('@/lib/funktionen');

describe('Funktionsschalter (ADR Funktionsschalter)', () => {
  it('Produktion: ohne Angaben ist alles aus', () => {
    for (const f of FUNKTIONEN) expect(entscheide(f, { SITE_MODE: 'produktion', NODE_ENV: 'production' }, null)).toBe(false);
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
