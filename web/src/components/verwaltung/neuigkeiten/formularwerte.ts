import type { schema } from '@/lib/db';
import { lokalesDatum, ZEITZONE } from '@/lib/termine';

/** Werte eines Formulars: Text, Auswahl oder Schalter (Feldnamen wie `neuigkeitSchema`). */
export type FormularWerte = Record<string, string | boolean>;

type Zeile = typeof schema.nachricht.$inferSelect;

const uhr = new Intl.DateTimeFormat('de-DE', { timeZone: ZEITZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Datensatz → Formularwerte zum Bearbeiten. Zeitpunkte in Europe/Berlin, Schlagwörter als Kommaliste je Sprache. */
export function formularWerte(z: Zeile): FormularWerte {
  const sprachen = (feld: { de: string; tr?: string; en?: string } | null | undefined, name: string): FormularWerte => ({
    [`${name}De`]: feld?.de ?? '',
    [`${name}Tr`]: feld?.tr ?? '',
    [`${name}En`]: feld?.en ?? '',
  });
  const kommas = (liste: { de: string; tr?: string; en?: string }[], s: 'de' | 'tr' | 'en') =>
    liste.some((x) => x[s]) ? liste.map((x) => x[s] ?? '').join(', ') : '';
  return {
    id: z.id,
    ...sprachen(z.titel, 'titel'),
    ...sprachen(z.kurztext, 'kurztext'),
    slug: z.slug,
    kategorie: z.kategorie,
    organisation: z.organisation ?? '',
    status: z.status,
    veroeffentlichtAm: z.veroeffentlichtAm ? `${lokalesDatum(z.veroeffentlichtAm)}T${uhr.format(z.veroeffentlichtAm)}` : '',
    empfohlen: z.empfohlen,
    wichtig: z.wichtig,
    lesezeit: z.lesezeit ? String(z.lesezeit) : '',
    schlagwoerterDe: kommas(z.schlagwoerter, 'de'),
    schlagwoerterTr: kommas(z.schlagwoerter, 'tr'),
    schlagwoerterEn: kommas(z.schlagwoerter, 'en'),
  };
}

/** Startwerte für „Neue Nachricht“. */
export const NEUE_NACHRICHT: FormularWerte = {
  kategorie: 'neuigkeiten',
  organisation: '',
  status: 'entwurf',
  empfohlen: false,
  wichtig: false,
};
