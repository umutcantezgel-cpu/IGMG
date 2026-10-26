import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

// Die Regel ist rein; das Modul lädt aber Datenbank, Audit und Mail-Ausgang für die übrigen Funktionen
vi.mock('@/lib/db', () => ({ db: {}, schema: {} }));
vi.mock('@/lib/audit', () => ({ protokolliere: vi.fn() }));
vi.mock('@/lib/mail/ausgang', () => ({
  planeHinweis: vi.fn(),
  planeBetroffenenHinweis: vi.fn(),
  SCHUTZROLLEN_EMPFAENGER: 'schutzrollen:',
}));

const { ENTZUG_GESCHUETZT, SCHUTZROLLEN, istSchutzrolle, schutzrollenRegel } = await import('@/lib/rechte/schutzrollen');

/**
 * Vergaberegel der Schutzrollen (S-11, ADR 0026; Stufe C N2, Z-L02): Die Erwartung ist NICHT aus `schutzrollen.ts`
 * abgeleitet, sondern aus den Regeln – je Schutzrolle (Leitung, Kinderschutz, religiöse Prüfung):
 * - nie zusammen mit `administration` in einem Konto (gilt auch, wenn die Rolle schon da war);
 * - nie an sich selbst (neu hinzukommend); Behalten einer eigenen Rolle ist kein Vergeben.
 * Andere Rollen (z. B. Redaktion, Sprachprüfung) sind frei kombinierbar.
 */
const SCHUTZ = ['leitung', 'kinderschutz', 'religioese_pruefung'] as const;
const FEHLER_ADMIN = {
  leitung: 'leitungAdministration',
  kinderschutz: 'kinderschutzAdministration',
  religioese_pruefung: 'religioesePruefungAdministration',
} as const;
const FEHLER_SELBST = {
  leitung: 'leitungSelbst',
  kinderschutz: 'kinderschutzSelbst',
  religioese_pruefung: 'religioesePruefungSelbst',
} as const;
const r = (...rollen: string[]) => rollen.map((rolle) => ({ rolle }));

describe('Schutzrollen: Vergaberegel (Wahrheitstafel)', () => {
  it('religiöse Prüfung ist Schutzrolle – bei Vergabe und Entzug', () => {
    expect([...SCHUTZROLLEN].sort()).toEqual([...SCHUTZ].sort());
    expect([...ENTZUG_GESCHUETZT].sort()).toEqual([...SCHUTZ].sort());
    for (const rolle of SCHUTZ) expect(istSchutzrolle(rolle)).toBe(true);
    for (const rolle of ['administration', 'redaktion', 'sprachpruefung', 'bildung']) expect(istSchutzrolle(rolle)).toBe(false);
  });

  it('je Schutzrolle × vorher da × mit Administration × an sich selbst', () => {
    for (const rolle of SCHUTZ)
      for (const vorherDa of [false, true])
        for (const mitAdmin of [false, true])
          for (const selbst of [false, true]) {
            const vorher = vorherDa ? r(rolle) : [];
            const neu = mitAdmin ? r(rolle, 'administration') : r(rolle);
            const erwartet = mitAdmin ? FEHLER_ADMIN[rolle] : selbst && !vorherDa ? FEHLER_SELBST[rolle] : null;
            expect(schutzrollenRegel(vorher, neu, selbst), `${rolle} vorher=${vorherDa} admin=${mitAdmin} selbst=${selbst}`).toBe(erwartet);
          }
  });

  it('Administration mit anderen Rollen, Abgeben einer Schutzrolle und leere Listen sind erlaubt', () => {
    expect(schutzrollenRegel([], r('administration', 'redaktion', 'sprachpruefung'), true)).toBeNull();
    expect(schutzrollenRegel(r('religioese_pruefung', 'administration'), r('administration'), true)).toBeNull();
    expect(schutzrollenRegel(r('religioese_pruefung'), [], false)).toBeNull();
    expect(schutzrollenRegel([], [], true)).toBeNull();
    // religiöse Prüfung mit Redaktion oder Sprachprüfung: keine Sperre (nur Hinweis im Cockpit)
    expect(schutzrollenRegel([], r('religioese_pruefung', 'redaktion', 'sprachpruefung'), false)).toBeNull();
  });

  it('das Kommandozeilen-Skript für Einladungen kennt dieselben Schutzrollen (lädt das Server-Modul nicht)', () => {
    const skript = readFileSync(new URL('../../../scripts/einladen.ts', import.meta.url), 'utf8');
    const liste = /const SCHUTZROLLEN: readonly Rolle\[\] = \[([^\]]*)\]/.exec(skript)?.[1];
    expect(liste?.match(/[a-z_]+/g)?.sort()).toEqual([...SCHUTZROLLEN].sort());
  });
});
