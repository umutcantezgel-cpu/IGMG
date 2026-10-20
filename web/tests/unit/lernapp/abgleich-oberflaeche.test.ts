import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Abgleich aus Sicht der Oberfläche (`oberflaeche/abgleich.ts`, S-L1 M-1): Je Seitenaufruf prüft die erste Anfrage die
 * Sitzung – auch vor dem ersten Abgleich nach einer Handlung und auch, wenn der letzte Abgleich keine Minute her ist. Nur ein
 * Ja gilt für den Rest des Aufrufs; nach einem Nein (offline, anderes Konto) fragt die nächste Handlung erneut.
 */
const zustand = {
  sitzungOk: [] as boolean[],
  pruefungen: 0,
  handlungen: 0,
  abgleiche: 0,
  profil: { id: 'p1', benutzerId: 'konto-a' } as { id: string; benutzerId?: string } | null,
  zuletzt: null as string | null,
};
const speicher = { lies: async () => (zustand.zuletzt ? { zuletzt: zustand.zuletzt } : undefined) };

vi.mock('@/lib/lernapp/oberflaeche/geraet', () => ({
  speicher: async () => speicher,
  vorhandenesProfil: async () => ({ sp: speicher, profil: zustand.profil }),
  meldeStand: () => undefined,
}));
vi.mock('@/lib/lernapp/lokal/profile', () => ({ aktivesProfil: async () => zustand.profil }));
vi.mock('@/lib/lernapp/lokal/sync', () => ({
  erzeugeAbgleich: () => ({
    pruefeSitzung: async () => {
      zustand.pruefungen++;
      return zustand.sitzungOk.shift() ?? true;
    },
    nachHandlung: () => void zustand.handlungen++,
    abgleichen: async () => {
      zustand.abgleiche++;
      return null;
    },
    beimOeffnen: async () => null,
    beenden: () => undefined,
  }),
}));

async function frischesModul() {
  vi.resetModules();
  return import('@/lib/lernapp/oberflaeche/abgleich');
}

beforeEach(() => {
  Object.assign(zustand, { sitzungOk: [], pruefungen: 0, handlungen: 0, abgleiche: 0, zuletzt: null });
  zustand.profil = { id: 'p1', benutzerId: 'konto-a' };
});

describe('Sitzungsprüfung je Seitenaufruf', () => {
  it('vor dem ersten Abgleich nach einer Handlung; danach gilt das Ja für den Aufruf', async () => {
    const a = await frischesModul();
    await a.nachHandlung();
    await a.nachHandlung();
    expect(zustand.pruefungen).toBe(1);
    expect(zustand.handlungen).toBe(2);
  });

  it('beim Öffnen auch dann, wenn der letzte Abgleich keine Minute her ist – abgeglichen wird dann nicht', async () => {
    zustand.zuletzt = new Date(Date.now() - 10_000).toISOString();
    const a = await frischesModul();
    await a.beimOeffnen();
    expect(zustand.pruefungen).toBe(1);
    expect(zustand.abgleiche).toBe(0);
    zustand.zuletzt = new Date(Date.now() - 120_000).toISOString();
    const b = await frischesModul();
    await b.beimOeffnen();
    expect(zustand.abgleiche).toBe(1);
  });

  it('Sitzung gehört zu einem anderen Konto (Nein): kein Abgleich; die nächste Handlung fragt erneut', async () => {
    zustand.sitzungOk = [false, true];
    const a = await frischesModul();
    await a.nachHandlung();
    expect(zustand.handlungen).toBe(0);
    await a.nachHandlung();
    expect(zustand.pruefungen).toBe(2);
    expect(zustand.handlungen).toBe(1);
  });

  it('ohne gebundenes Profil keine Anfrage', async () => {
    zustand.profil = { id: 'p1' };
    const a = await frischesModul();
    await a.nachHandlung();
    await a.beimOeffnen();
    expect(zustand.pruefungen).toBe(0);
  });
});
