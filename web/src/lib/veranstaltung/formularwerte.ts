import { lokalesDatum, ZEITZONE } from '@/lib/termine';
import { zerlegeRegel } from '@/lib/termine/regel';
import type { schema } from '@/lib/db';

/** Werte eines Formulars: Text, Mehrfachauswahl oder Schalter (Feldnamen wie `veranstaltungSchema`). */
export type FormularWerte = Record<string, string | string[] | boolean>;

type Zeile = typeof schema.veranstaltung.$inferSelect;

const uhr = new Intl.DateTimeFormat('de-DE', { timeZone: ZEITZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Tiptap-Dokument → Absätze, durch Leerzeile getrennt (Gegenstück zu `zuDatensatz`). */
function absaetze(doc: unknown): string {
  const k = doc as { content?: { content?: { text?: string }[] }[] } | undefined;
  return (k?.content ?? []).map((p) => (p.content ?? []).map((t) => t.text ?? '').join('')).join('\n\n');
}

/** Datensatz → Formularwerte zum Bearbeiten (Zeiten in Europe/Berlin, Regel zerlegt). */
export function formularWerte(z: Zeile): FormularWerte {
  const w = zerlegeRegel(z.wiederholung, z.beginn);
  const sprachen = (feld: { de: string; tr?: string; en?: string } | null | undefined, name: string) => ({
    [`${name}De`]: feld?.de ?? '',
    [`${name}Tr`]: feld?.tr ?? '',
    [`${name}En`]: feld?.en ?? '',
  });
  const zeilen = <T>(liste: T[], f: (x: T) => string | undefined) => liste.map((x) => f(x) ?? '').join('\n');
  const kommas = (liste: { de: string; tr?: string; en?: string }[], s: 'de' | 'tr' | 'en') =>
    liste.some((x) => x[s]) ? liste.map((x) => x[s] ?? '').join(', ') : '';
  const programm = (s: 'de' | 'tr' | 'en') =>
    z.programm.some((p) => p.text[s]) ? zeilen(z.programm, (p) => `${p.zeit} ${p.text[s] ?? ''}`) : '';
  const hinweise = (s: 'de' | 'tr' | 'en') => (z.hinweise.some((h) => h[s]) ? zeilen(z.hinweise, (h) => h[s]) : '');
  return {
    id: z.id,
    bildId: z.bildId ?? '',
    ...sprachen(z.titel, 'titel'),
    ...sprachen(z.kurztext, 'kurztext'),
    beschreibungDe: absaetze(z.beschreibung?.de),
    beschreibungTr: absaetze(z.beschreibung?.tr),
    beschreibungEn: absaetze(z.beschreibung?.en),
    slug: z.slug,
    kategorie: z.kategorie,
    organisation: z.organisation ?? '',
    ...sprachen(z.zielgruppe, 'zielgruppe'),
    ...sprachen(z.ort, 'ort'),
    datum: lokalesDatum(z.beginn),
    ganztaegig: z.ganztaegig,
    beginnZeit: z.ganztaegig ? '' : uhr.format(z.beginn),
    endeZeit: z.ende && !z.ganztaegig ? uhr.format(z.ende) : '',
    whArt: w.art,
    whIntervall: String(w.intervall),
    whTage: w.wochentage,
    whPosition: String(w.position),
    whEnde: w.ende,
    whEndeDatum: w.endeDatum ?? '',
    whAnzahl: w.anzahl ? String(w.anzahl) : '',
    whRoh: w.roh ?? '',
    ausnahmen: z.ausnahmen,
    anmeldungAktiv: z.anmeldungAktiv,
    plaetze: z.plaetze ? String(z.plaetze) : '',
    kosten: z.kosten,
    empfohlen: z.empfohlen,
    programmDe: programm('de'),
    programmTr: programm('tr'),
    programmEn: programm('en'),
    hinweiseDe: hinweise('de'),
    hinweiseTr: hinweise('tr'),
    hinweiseEn: hinweise('en'),
    schlagwoerterDe: kommas(z.schlagwoerter, 'de'),
    schlagwoerterTr: kommas(z.schlagwoerter, 'tr'),
    schlagwoerterEn: kommas(z.schlagwoerter, 'en'),
    veranstalterName: z.veranstalter?.name ?? '',
    ...sprachen(z.veranstalter?.funktion, 'veranstalterFunktion'),
    kontaktName: z.kontakt?.name ?? '',
    kontaktTelefon: z.kontakt?.telefon ?? '',
    kontaktEmail: z.kontakt?.email ?? '',
    status: z.status,
  };
}

/** Startwerte für „Neue Veranstaltung“. */
export const NEUE_VERANSTALTUNG: FormularWerte = {
  kategorie: 'gemeinde',
  organisation: '',
  whArt: 'einmalig',
  whIntervall: '1',
  whPosition: '1',
  whEnde: 'nie',
  kosten: 'kostenlos',
  status: 'entwurf',
  ganztaegig: false,
  anmeldungAktiv: false,
  empfohlen: false,
  whTage: [],
  ausnahmen: [],
};
