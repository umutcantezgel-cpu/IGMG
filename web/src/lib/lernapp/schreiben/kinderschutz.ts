import type { EinwilligungsLage } from '@/lib/konto/sechzehn';

/**
 * Kommentar der Lehrkraft an Kinder (S-L2 M-1; offene Entscheidung D-L16 im DSFA-Entwurf der Lern-App; KERN 4.0 §5): Ein
 * Freitext-Kommentar zur Schreibabgabe eines Kindes wäre ein Kanal von einer erwachsenen Person zu einem einzelnen Kind –
 * ohne zweite erwachsene Person, ohne Eltern, ohne Meldeweg. Bis Kinderschutz, Datenschutzbeauftragte und Bildung D-L16
 * entschieden haben, gilt die harte Sperre:
 * - Abgaben von Konten in der Einwilligungslage „eltern“ (unter 16 bzw. Kinderkonto ohne bekanntes Datum,
 *   `konto/sechzehn.ts`) bekommen nur Prüfliste und Einstufung zurück; Dienst und Action lehnen einen Kommentar ab, das
 *   Formular der Lehrkraft blendet das Feld aus und sagt kurz, warum.
 * - Startklar meldet Rot (Produktion), solange `lernapp_gruppen` an ist und hier keine Entscheidung eingetragen ist.
 *
 * Eingetragen wird die Entscheidung mit Datum und Fundstelle (Beschluss, DSFA-Nachtrag). `kommentarAnKinder: true` erst
 * zusammen mit der technischen Umsetzung der beschlossenen Schutzmaßnahmen (S-L2 M-1 Behebung 2: Kommentar auch für die
 * Eltern sichtbar oder meldbar, Fassungen statt Ersetzen, Bremse) – der Eintrag allein öffnet sonst einen ungeschützten
 * Kanal. Rein, ohne Abhängigkeiten zur Datenbank (auch für `pnpm startklar`).
 */
export type EntscheidungDL16 = {
  /** Datum der Entscheidung (`JJJJ-MM-TT`) */
  am: string;
  /** Beschluss bzw. Abschnitt im DSFA-Nachtrag */
  fundstelle: string;
  /** Darf die Lehrkraft Kindern einen Kommentar schreiben? */
  kommentarAnKinder: boolean;
};

/** Stand: offen (DSFA-Entwurf Lern-App, D-L16; MENSCHEN LM-08). */
export const ENTSCHEIDUNG_D_L16: EntscheidungDL16 | null = null;

/** Darf die Lehrkraft zu einer Abgabe in dieser Einwilligungslage einen Kommentar schreiben? */
export function kommentarErlaubt(lage: EinwilligungsLage, entscheidung: EntscheidungDL16 | null = ENTSCHEIDUNG_D_L16): boolean {
  return lage !== 'eltern' || entscheidung?.kommentarAnKinder === true;
}
