import type { schema } from '@/lib/db';
import { uhrzeitNackt } from '@/lib/i18n/format';
import { lokalesDatum } from '@/lib/termine';

/** Werte eines Formulars „Ankündigung“ (Feldnamen wie `ankuendigungSchema`); Zeiten in Europe/Berlin. */
export type AnkuendigungWerte = Record<string, string>;

type Zeile = typeof schema.ankuendigung.$inferSelect;

/** Startwerte für „Neue Ankündigung“: Entwurf, Priorität Mittel, ohne Beginn und ohne Ende (sofort sichtbar, läuft nicht ab). */
export const NEUE_ANKUENDIGUNG: AnkuendigungWerte = {
  titelDe: '',
  titelTr: '',
  titelEn: '',
  inhaltDe: '',
  inhaltTr: '',
  inhaltEn: '',
  prioritaet: 'mittel',
  organisation: '',
  sichtbarAbDatum: '',
  sichtbarAbZeit: '',
  laeuftAbDatum: '',
  laeuftAbZeit: '',
  link: '',
  status: 'entwurf',
};

/** Datensatz → Formularwerte zum Bearbeiten (Beginn und Ende als Datum und Uhrzeit in Europe/Berlin). */
export function formularWerte(z: Zeile): AnkuendigungWerte {
  return {
    id: z.id,
    titelDe: z.titel.de,
    titelTr: z.titel.tr ?? '',
    titelEn: z.titel.en ?? '',
    inhaltDe: z.inhalt.de,
    inhaltTr: z.inhalt.tr ?? '',
    inhaltEn: z.inhalt.en ?? '',
    prioritaet: z.prioritaet,
    organisation: z.organisation ?? '',
    sichtbarAbDatum: z.sichtbarAb ? lokalesDatum(z.sichtbarAb) : '',
    sichtbarAbZeit: z.sichtbarAb ? uhrzeitNackt(z.sichtbarAb, 'de') : '',
    laeuftAbDatum: z.laeuftAb ? lokalesDatum(z.laeuftAb) : '',
    laeuftAbZeit: z.laeuftAb ? uhrzeitNackt(z.laeuftAb, 'de') : '',
    link: z.link ?? '',
    status: z.status,
  };
}
