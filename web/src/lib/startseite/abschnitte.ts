import { z } from 'zod';

/**
 * Abschnitte der Startseite (F-40, Plan §3.7 „Startseite: Abschnitte sortierbar“, ADR 0032 Nr. 6). Reine Daten und
 * Funktionen ohne Datenbank – unit-testbar (`tests/unit/startseite-abschnitte.test.ts`).
 *
 * Der Kopf mit Tagesbogen (Hero) steht immer oben und ist kein Abschnitt dieser Liste. Darunter folgen die Abschnitte in
 * der gespeicherten Reihenfolge; ausgeblendete Abschnitte entfallen. Ohne Datenbank (Beispielmodus), ohne gespeicherte
 * Ordnung oder bei ungültigem Wert gilt der Bestand: {@link STANDARD_ORDNUNG} (Rückfall).
 * Marktstart P3 (E-044 Nr. 2): „Aus dem Dachverband“ (`dachverband`) steht nach den Neuigkeiten; in gespeicherten
 * Ordnungen von vorher fehlt er und wird von {@link ordnungAus} sichtbar am Ende ergänzt.
 */
export const STARTSEITE_ABSCHNITTE = ['moschee', 'veranstaltungen', 'neuigkeiten', 'dachverband', 'desTages'] as const;
export type StartseitenAbschnitt = (typeof STARTSEITE_ABSCHNITTE)[number];

export type AbschnittEintrag = { schluessel: StartseitenAbschnitt; sichtbar: boolean };
export type StartseitenOrdnung = AbschnittEintrag[];

/** Schlüssel der Einstellung (Tabelle `einstellung`). */
export const STARTSEITE_EINSTELLUNG = 'startseite';

/** Reihenfolge des Bestands (Startseite bis F-40): alle Abschnitte sichtbar. */
export const STANDARD_ORDNUNG: readonly AbschnittEintrag[] = STARTSEITE_ABSCHNITTE.map((schluessel) => ({ schluessel, sichtbar: true }));

const eintrag = z.strictObject({ schluessel: z.enum(STARTSEITE_ABSCHNITTE), sichtbar: z.boolean() });

/**
 * Gespeicherte Form: jede bekannte Kennung höchstens einmal, nichts Unbekanntes. Fehlt eine Kennung (z. B. ein später
 * hinzugekommener Abschnitt), ergänzt {@link ordnungAus} sie am Ende als sichtbar.
 */
export const startseitenOrdnung = z
  .array(eintrag)
  .min(1)
  .max(STARTSEITE_ABSCHNITTE.length)
  .refine((liste) => new Set(liste.map((e) => e.schluessel)).size === liste.length, 'doppelt');

/** Neue Liste der Standardordnung (veränderbar). */
export function standardOrdnung(): StartseitenOrdnung {
  return STANDARD_ORDNUNG.map((e) => ({ ...e }));
}

/**
 * Ordnung aus einem gespeicherten Wert (jsonb). Ungültig, leer oder `null` → Standardordnung. Gültig, aber
 * unvollständig → fehlende Abschnitte in Bestandsreihenfolge sichtbar angehängt.
 */
export function ordnungAus(roh: unknown): StartseitenOrdnung {
  const p = startseitenOrdnung.safeParse(roh);
  if (!p.success) return standardOrdnung();
  const vorhanden = new Set(p.data.map((e) => e.schluessel));
  return [
    ...p.data.map((e) => ({ schluessel: e.schluessel, sichtbar: e.sichtbar })),
    ...STARTSEITE_ABSCHNITTE.filter((s) => !vorhanden.has(s)).map((schluessel) => ({ schluessel, sichtbar: true })),
  ];
}

/** Sichtbare Abschnitte in Anzeigereihenfolge. */
export function sichtbareAbschnitte(ordnung: readonly AbschnittEintrag[]): StartseitenAbschnitt[] {
  return ordnung.filter((e) => e.sichtbar).map((e) => e.schluessel);
}

/** Entspricht die Ordnung dem Bestand (Reihenfolge und Sichtbarkeit)? */
export function istStandard(ordnung: readonly AbschnittEintrag[]): boolean {
  return (
    ordnung.length === STANDARD_ORDNUNG.length &&
    ordnung.every((e, i) => e.schluessel === STANDARD_ORDNUNG[i].schluessel && e.sichtbar === STANDARD_ORDNUNG[i].sichtbar)
  );
}

/**
 * Abschnitt eine Stelle nach oben oder unten. Unbekannter Abschnitt oder Rand: unveränderte Kopie. Ergebnis immer als
 * neue Liste (React-Zustand).
 */
export function verschiebeAbschnitt(
  ordnung: readonly AbschnittEintrag[],
  schluessel: StartseitenAbschnitt,
  richtung: 'hoch' | 'runter',
): StartseitenOrdnung {
  const neu = ordnung.map((e) => ({ ...e }));
  const i = neu.findIndex((e) => e.schluessel === schluessel);
  const j = richtung === 'hoch' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= neu.length) return neu;
  [neu[i], neu[j]] = [neu[j], neu[i]];
  return neu;
}

/** Sichtbarkeit eines Abschnitts setzen (neue Liste). */
export function setzeSichtbar(
  ordnung: readonly AbschnittEintrag[],
  schluessel: StartseitenAbschnitt,
  sichtbar: boolean,
): StartseitenOrdnung {
  return ordnung.map((e) => (e.schluessel === schluessel ? { ...e, sichtbar } : { ...e }));
}
