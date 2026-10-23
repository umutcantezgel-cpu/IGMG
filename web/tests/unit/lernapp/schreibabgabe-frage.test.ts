import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Nachfrage der Schreibübung, ob der Text an die Lehrkraft darf (`schreiben/Abgabe.tsx`, `frage`; L5-03, Gegenprüfung
 * „Sackgasse ohne `lernapp_sync`“): Ohne verbundenes Gerät entsteht keine Anfrage, bis die Person „Mit meinem Konto
 * prüfen“ wählt (KERN 4.0 §6) – dann genügt die Anmeldung der Website, ein Abgleich ist nicht nötig. Mit verbundenem
 * Gerät fragt die Übung sofort. Ohne Anmeldung folgt der Hinweis mit „Anmelden“.
 */
const geraet = vi.hoisted(() => ({ benutzerId: null as string | null }));
vi.mock('@/lib/lernapp/oberflaeche/geraet', () => ({
  vorhandenesProfil: async () => ({ sp: null, profil: geraet.benutzerId === null ? null : { benutzerId: geraet.benutzerId } }),
}));

const { frage } = await import('@/components/lernapp/schreiben/Abgabe');

const GRUPPE = { id: '00000000-0000-4000-8000-000000000002', name: '[Gruppe Eins]' };
const AUFGABE = 'tr.a1.e01.l04.a08';
let abrufe: string[] = [];

function antwortMit(status: number, koerper: unknown) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (adresse: string) => {
      abrufe.push(adresse);
      return Response.json(koerper, { status });
    }),
  );
}

beforeEach(() => {
  abrufe = [];
  geraet.benutzerId = null;
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Schreibabgabe: Nachfrage beim Server', () => {
  it('ohne verbundenes Gerät: keine Anfrage, nur das Angebot „Mit meinem Konto prüfen“', async () => {
    antwortMit(200, { moeglich: true, gruppen: [GRUPPE] });
    expect(await frage('de', 'tr-aus-de', AUFGABE)).toEqual({ art: 'ohneKonto' });
    expect(abrufe).toEqual([]);
  });

  it('ohne verbundenes Gerät, nach „Mit meinem Konto prüfen“: fragt mit der Anmeldung der Website (ohne Abgleich)', async () => {
    antwortMit(200, { moeglich: true, gruppen: [GRUPPE] });
    expect(await frage('de', 'tr-aus-de', AUFGABE, true)).toEqual({ art: 'bereit', gruppen: [GRUPPE], sendet: false });
    expect(abrufe).toEqual([`/api/lernapp/schreiben?ui=de&kurs=tr-aus-de&aufgabe=${AUFGABE}`]);
  });

  it('nach „Mit meinem Konto prüfen“ ohne Anmeldung: Hinweis „Anmelden“ statt Sackgasse', async () => {
    antwortMit(401, { fehler: 'anmeldung' });
    expect(await frage('tr', 'tr-aus-de', AUFGABE, true)).toEqual({ art: 'nicht', grund: 'anmeldung' });
    expect(abrufe).toHaveLength(1);
  });

  it('mit verbundenem Gerät: fragt sofort', async () => {
    geraet.benutzerId = '00000000-0000-4000-8000-000000000009';
    antwortMit(200, { moeglich: false, grund: 'zuweisung' });
    expect(await frage('de', 'tr-aus-de', AUFGABE)).toEqual({ art: 'nicht', grund: 'zuweisung' });
    expect(abrufe).toHaveLength(1);
  });
});
