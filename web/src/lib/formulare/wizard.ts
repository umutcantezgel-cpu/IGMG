import type { z } from 'zod';
import type { FormularErgebnis } from './ergebnis';
import { feldFehler, rohwerte } from './rohwerte';

/**
 * Schrittlogik des FormWizard auf dem Server (B01, E-028, ADR 0005 Nachtrag): „Weiter“ und „Zurück“ sind
 * Absende-Knöpfe (`richtung`), der aktuelle Schritt steht im versteckten Feld `schritt`. Geprüft wird mit dem
 * ganzen Schema; als Fehler zählen nur Felder des aktuellen Schritts (so greifen auch feldübergreifende Regeln).
 * Im letzten Schritt meldet die Funktion „absenden“ – dann übernimmt `verarbeiteFormular` (Schutz, Speichern).
 */
export type Fehlerstand = Extract<FormularErgebnis, { status: 'fehler' }>;

export type WizardStand =
  { art: 'schritt'; schritt: number; werte: Record<string, unknown>; ergebnis?: Fehlerstand } | { art: 'absenden'; schritt: number };

export function wizardSchritt(
  fd: FormData,
  schema: z.ZodType,
  felderJeSchritt: readonly (readonly string[])[],
  mehrfach: readonly string[] = [],
): WizardStand {
  const letzter = felderJeSchritt.length - 1;
  const roh = Number.parseInt(String(fd.get('schritt') ?? '0'), 10);
  const schritt = Number.isInteger(roh) ? Math.min(Math.max(roh, 0), letzter) : 0;
  const werte = rohwerte(fd, mehrfach);
  if (fd.get('richtung') === 'zurueck') return { art: 'schritt', schritt: Math.max(0, schritt - 1), werte };
  const geprueft = schema.safeParse(werte);
  const eigene = new Set(felderJeSchritt[schritt]);
  const fehler = geprueft.success ? {} : feldFehler(geprueft.error.issues.filter((f) => eigene.has(String(f.path[0] ?? ''))));
  if (Object.keys(fehler).length)
    return { art: 'schritt', schritt, werte, ergebnis: { status: 'fehler', fehler: 'pruefen', feldFehler: fehler, werte } };
  if (schritt < letzter) return { art: 'schritt', schritt: schritt + 1, werte };
  return { art: 'absenden', schritt };
}

/**
 * Für feldübergreifende Regeln in Wizard-Schemas: Zod 4 überspringt `refine`, solange irgendein Feld ungültig ist –
 * im Wizard sind spätere Schritte aber noch leer. `{ when: wennGueltig('email', 'wiederholung') }` lässt die Regel
 * laufen, sobald die genannten Felder selbst gültig sind.
 */
export const wennGueltig =
  (...felder: string[]) =>
  (p: z.core.ParsePayload): boolean =>
    p.issues.every((i) => !felder.includes(String(i.path?.[0] ?? '')));

/** Erster Schritt, der ein fehlerhaftes Feld enthält (nach dem Absenden); sonst der letzte Schritt. */
export function schrittMitFehler(feldFehler: Record<string, string> | undefined, felderJeSchritt: readonly (readonly string[])[]): number {
  const namen = Object.keys(feldFehler ?? {}).map((k) => k.split('.')[0]);
  const i = felderJeSchritt.findIndex((felder) => namen.some((n) => felder.includes(n)));
  return i === -1 ? felderJeSchritt.length - 1 : i;
}
