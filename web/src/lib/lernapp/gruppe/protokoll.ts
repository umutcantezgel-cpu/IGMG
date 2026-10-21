import { z } from 'zod';
import { OBERFLAECHEN, type Oberflaeche, type RichtungId } from '../kurse';

/**
 * Format von `/api/lernapp/gruppe` (L7-02, PLAN §3.1): Die statische Seite `/lern-app/[ui]/gruppe` holt damit im Browser
 * Zuweisungen, Gruppenziel, Bestenlisten und die eigene Zustimmung. Rein, auch im Client nutzbar. Die Antwort nennt nie
 * Kennungen anderer Konten – nur Vorname und Initial mit Wochen-XP und `ich` für die eigene Zeile.
 */
export const GRUPPE_ADRESSE = '/api/lernapp/gruppe';

export const GRUPPE_FEHLER = ['ursprung', 'anmeldung', 'anfrage', 'alter', 'einwilligung', 'bremse', 'aus'] as const;
export type GruppeFehler = (typeof GRUPPE_FEHLER)[number];

export const UiSchema = z.enum(OBERFLAECHEN);

/** POST: eigene Zustimmung zur Bestenliste erteilen oder zurücknehmen (ausblenden). */
export const ZustimmungAnfrageSchema = z.strictObject({
  aktion: z.enum(['zustimmen', 'ausblenden']),
  ui: UiSchema,
});
export type ZustimmungAnfrage = z.infer<typeof ZustimmungAnfrageSchema>;

export type ZielStand =
  { ziel: number; summe: number; erreicht: boolean; anteil: number; zuWenige: false } | { ziel: number; zuWenige: true };

export type ListenPlatz = { name: string; xp: number; ich: boolean };

export type GruppeAntwort = {
  /** Einwilligung `lernapp` (ohne sie gibt es keinen Stand auf dem Server) */
  einwilligung: 'erteilt' | 'fehlt' | 'eltern';
  zuweisungen: {
    id: string;
    gruppe: string;
    kurs: RichtungId;
    einheit: string;
    thema: string | null;
    /** Lektion im Paket (Adresse `/lern-app/<ui>/<kurs>/ueben?l=<lektion>`) und ihre Nummer; null: ganze Einheit */
    lektion: string | null;
    nr: number | null;
    faellig: string | null;
    erledigt: boolean;
  }[];
  gruppen: { id: string; name: string; ziel: ZielStand | null; bestenliste: ListenPlatz[] | null }[];
  familien: { eigene: boolean; bestenliste: ListenPlatz[] }[];
  /** null: keine Zustimmung möglich (unter 16, Schalter aus oder keine Bestenliste eingeschaltet) */
  zustimmung: { erteilt: boolean } | null;
};

export type ZustimmungAntwort = { erteilt: boolean };

/** Thema einer Einheit in der Oberflächensprache, sonst Deutsch. */
export function themaIn(thema: Partial<Record<Oberflaeche, string>> | undefined, ui: Oberflaeche): string | null {
  return thema?.[ui] ?? thema?.de ?? null;
}
