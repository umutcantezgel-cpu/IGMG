import type { PgTable } from 'drizzle-orm/pg-core';
import { afterAll, describe, expect, it, vi } from 'vitest';
import { schema } from '@/lib/db';
import type { Aktion } from '@/lib/rechte/matrix';
import { verwaltungsUmgebung } from '../hilfen/verwaltung';
import { anmelden, ausgang, type Ausgang, erlaubt, formular, momentaufnahme, PERSONEN, type Person } from './rechte-hilfen';

/**
 * Generierte Rechte-Matrix für die Verwaltungs-Actions der Lern-App (L3-06, PLAN §7.1): 3 Action-Dateien × alle Personengruppen
 * (auch Leitung, religiöse Prüfung, Kinderschutz und Sprachprüfung) × jede exportierte Action – nach dem Muster von
 * `rechte-matrix-gemeinde.test.ts`.
 *
 * Je Action steht hier die Matrix-Prüfung, die sie laut Code als ERSTES ausführt (`mitLernappRecht` → `verlangeRecht`). Ein
 * Spion auf `verlangeRecht` hält fest, welche Prüfung tatsächlich lief:
 * - nicht zugelassen (laut `darf()`): Rückgabe „keinRecht“, der Datenbestand bleibt unverändert;
 * - zugelassen: Der Spion zeigt die erwartete Prüfung als bestanden; danach endet die Action an der leeren Eingabe. Die
 *   weiteren Prüfungen (Prüfsprache auch für die Administration, Schalter, Wirkung) prüft `lernapp-verwaltung.test.ts`.
 * Eine Vollständigkeitsprüfung stellt sicher, dass jede exportierte Action dieser Dateien hier steht.
 */
const protokoll: { aktion: string; ok: boolean }[] = [];
vi.mock('@/lib/rechte/pruefe', async (original) => {
  const echt = await original<typeof import('@/lib/rechte/pruefe')>();
  return {
    ...echt,
    verlangeRecht: async (aktion: Aktion, ziel?: Parameters<typeof echt.verlangeRecht>[1]) => {
      try {
        const a = await echt.verlangeRecht(aktion, ziel);
        protokoll.push({ aktion, ok: true });
        return a;
      } catch (e) {
        protokoll.push({ aktion, ok: false });
        throw e;
      }
    },
  };
});

const { client, db } = await verwaltungsUmgebung();
afterAll(() => client.close());

/** Alle Personengruppen der Verwaltung (wie die Matrix der Gemeinde-Plattform; Sprachprüfung steht in `PERSONEN`). */
const PERSONEN_ALLE: Person[] = [
  ...PERSONEN,
  { name: 'Leitung', rollen: [{ rolle: 'leitung' }], zweiFaktor: true },
  { name: 'Religiöse Prüfung', rollen: [{ rolle: 'religioese_pruefung' }], zweiFaktor: true },
  { name: 'Kinderschutz', rollen: [{ rolle: 'kinderschutz' }], zweiFaktor: true },
];

const MODULE = {
  'lernapp-sprachpruefung': () => import('@/server/actions/lernapp-sprachpruefung'),
  'lernapp-meldungen': () => import('@/server/actions/lernapp-meldungen'),
  'lernapp-audio': () => import('@/server/actions/lernapp-audio'),
} as const;
type Datei = keyof typeof MODULE;

/** Tabellen, die eine Abweisung nicht verändern darf. */
const TABELLEN: PgTable[] = [
  schema.auditEintrag,
  schema.medium,
  schema.lernappKurs,
  schema.lernappStichprobe,
  schema.lernappPruefung,
  schema.lernappPrueferSprache,
  schema.lernappMeldung,
  schema.lernappSprecher,
  schema.lernappAufnahme,
  schema.lernappAudioWahl,
];

type Fall = { datei: Datei; aktion: string; pruefung: Aktion };
const f = (datei: Datei, aktionen: string[], pruefung: Aktion): Fall[] => aktionen.map((aktion) => ({ datei, aktion, pruefung }));

const FAELLE: Fall[] = [
  // Ziehen: lesen; danach Prüfsprache oder `lernapp.bearbeiten` (Integrationstest)
  ...f('lernapp-sprachpruefung', ['stichprobeZiehen'], 'lernapp.lesen'),
  ...f('lernapp-sprachpruefung', ['eintragPruefen'], 'lernapp.sprache.pruefen'),
  ...f('lernapp-sprachpruefung', ['pruefsprachenSetzen'], 'lernapp.bearbeiten'),
  ...f('lernapp-meldungen', ['meldungErledigen', 'alternativeErgaenzen', 'eintragSperren'], 'lernapp.bearbeiten'),
  ...f('lernapp-audio', ['sprecherAnlegen', 'aufnahmeSpeichern', 'aufnahmeVerwerfen', 'stimmeWaehlen'], 'lernapp.audio.bearbeiten'),
];

const abgewiesen = (a: Ausgang) => (a.wert as { fehler?: unknown } | null | undefined)?.fehler === 'keinRecht';

async function rufe(fall: Fall): Promise<Ausgang> {
  const modul = (await MODULE[fall.datei]()) as unknown as Record<string, (...a: unknown[]) => Promise<unknown>>;
  return ausgang(() => modul[fall.aktion]!({}, formular({})));
}

for (const fall of FAELLE) {
  describe(`${fall.datei}.${fall.aktion} (${fall.pruefung})`, () => {
    for (const p of PERSONEN_ALLE) {
      const darfJa = erlaubt(p, [{ aktion: fall.pruefung }]);
      it(`${p.name}: ${darfJa ? 'Rechteprüfung bestanden' : 'abgewiesen'}`, async () => {
        await anmelden(p);
        const vorher = await momentaufnahme(db, TABELLEN);
        protokoll.length = 0;
        const ergebnis = await rufe(fall);
        if (darfJa) {
          expect(protokoll[0], 'Erste Rechteprüfung der Action').toEqual({ aktion: fall.pruefung, ok: true });
          expect(ergebnis.fehler, 'Unerwarteter Fehler der Action').toBeUndefined();
          expect((ergebnis.wert as { fehler?: unknown } | null | undefined)?.fehler, 'Rückgabe meldet „keinRecht“').not.toBe('keinRecht');
        } else {
          expect(abgewiesen(ergebnis), `Abweisung erwartet, erhalten: ${JSON.stringify(ergebnis)}`).toBe(true);
          if (p.rollen !== null && p.zweiFaktor)
            expect(protokoll[0], 'Erste Rechteprüfung der Action').toEqual({ aktion: fall.pruefung, ok: false });
        }
        expect(await momentaufnahme(db, TABELLEN), 'Leere Eingabe oder Abweisung hat den Datenbestand verändert').toBe(vorher);
      });
    }
  });
}

describe('Vollständigkeit: jede exportierte Action der Lern-App-Verwaltung ist erfasst', () => {
  it('stimmt mit den Fällen überein', async () => {
    const exportiert: string[] = [];
    for (const [datei, laden] of Object.entries(MODULE)) {
      const modul = (await laden()) as Record<string, unknown>;
      for (const [name, wert] of Object.entries(modul)) if (typeof wert === 'function') exportiert.push(`${datei}.${name}`);
    }
    expect(FAELLE.map((x) => `${x.datei}.${x.aktion}`).sort()).toEqual(exportiert.sort());
  });

  it('jede Rolle der Matrix ist vertreten', async () => {
    const { ROLLEN } = await import('@/lib/rechte/matrix');
    const vertreten = new Set(PERSONEN_ALLE.flatMap((p) => (p.rollen ?? []).map((r) => r.rolle)));
    expect([...vertreten].sort()).toEqual([...ROLLEN].sort());
  });
});
