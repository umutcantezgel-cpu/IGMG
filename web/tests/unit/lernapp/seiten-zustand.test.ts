import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { SeitenZustand } from '@/components/lernapp/OfflineEinheit';
import type { SeitenStand } from '@/components/lernapp/offline';

/**
 * Stand der Kursseiten im Lernpfad (Stufe C N9a, G-1; Gegenprüfung N9a): `holeSeiten` lässt die Seiten des Kurses in den
 * Kursvorrat dieses Baus holen. Fehlten sie („Erneut speichern“ bzw. nach einem Bauwechsel „wird aktualisiert“), steht
 * währenddessen „wird aktualisiert“ und danach „vollständig“ oder – ohne Verbindung – „unvollständig“. Ein vollständiger Stand
 * flackert dabei nicht. Ohne Service Worker (Entwicklung) gilt es als vollständig.
 */

const vor = vi.hoisted(() => ({ stand: 'vollstaendig' as SeitenStand }));
vi.mock('@/components/lernapp/offline', () => ({
  bereiteOfflineVor: vi.fn(async () => vor.stand),
  seitenStand: vi.fn(async () => 'vollstaendig'),
}));

const { holeSeiten } = await import('@/components/lernapp/inseln/LernpfadInsel');

/** Zustand wie `useState`: Werte und Funktionen, jeder Schritt im Verlauf. */
function zustand(anfang: SeitenZustand) {
  let jetzt = anfang;
  const verlauf: SeitenZustand[] = [];
  const setze = (x: SeitenZustand | ((alt: SeitenZustand) => SeitenZustand)) => {
    jetzt = typeof x === 'function' ? x(jetzt) : x;
    verlauf.push(jetzt);
  };
  return { setze, verlauf };
}

describe('holeSeiten: Stand der Kursseiten', () => {
  beforeEach(() => {
    vor.stand = 'vollstaendig';
  });

  it('fehlten sie: „wird aktualisiert“, dann „vollständig“', async () => {
    const z = zustand('unvollstaendig');
    expect(await holeSeiten('de', 'tr-aus-de', z.setze)).toBe(true);
    expect(z.verlauf).toEqual(['aktualisiert', 'vollstaendig']);
  });

  it('nach einem Bauwechsel (der Lernpfad setzt „wird aktualisiert“): danach „vollständig“', async () => {
    const z = zustand('aktualisiert');
    expect(await holeSeiten('de', 'tr-aus-de', z.setze)).toBe(true);
    expect(z.verlauf).toEqual(['aktualisiert', 'vollstaendig']);
  });

  it('ohne Verbindung gescheitert oder nur teilweise da: „unvollständig“ („Erneut speichern“)', async () => {
    for (const stand of ['netz', 'fehlt'] as const) {
      vor.stand = stand;
      const z = zustand('aktualisiert');
      expect(await holeSeiten('de', 'tr-aus-de', z.setze), stand).toBe(false);
      expect(z.verlauf, stand).toEqual(['aktualisiert', 'unvollstaendig']);
    }
  });

  it('ein vollständiger Stand flackert nicht; ohne Service Worker gilt alles als da', async () => {
    const z = zustand('vollstaendig');
    expect(await holeSeiten('de', 'tr-aus-de', z.setze)).toBe(true);
    expect(z.verlauf).toEqual(['vollstaendig', 'vollstaendig']);
    vor.stand = 'ohne';
    const ohne = zustand('unvollstaendig');
    expect(await holeSeiten('de', 'tr-aus-de', ohne.setze)).toBe(true);
    expect(ohne.verlauf).toEqual(['aktualisiert', 'vollstaendig']);
  });
});
