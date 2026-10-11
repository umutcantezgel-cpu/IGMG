import { z, type ZodError } from 'zod';

/**
 * Verwaltung „Tickets“ (V10, ADR 0005): Zod-Schemata für Formular und Server Action, Auswahllisten und Filter.
 * Rein – ohne Datenbank und ohne Serverimporte, damit die Client-Formulare dieselben Werte nutzen.
 * Fehlermeldungen sind Schlüssel unter `verwaltung.tickets.fehler`; Feldnamen = Schlüssel des Schemas.
 */
export const TICKET_STATUS = ['offen', 'in_bearbeitung', 'geloest', 'geschlossen'] as const;
export type TicketStatus = (typeof TICKET_STATUS)[number];

export const TICKET_PRIORITAETEN = ['niedrig', 'mittel', 'hoch', 'dringend'] as const;
export type TicketPrioritaet = (typeof TICKET_PRIORITAETEN)[number];

export const TICKET_TYPEN = ['beschwerde', 'wunsch', 'vorschlag', 'information', 'intern'] as const;
export type TicketTyp = (typeof TICKET_TYPEN)[number];

/** Organisation im Formular: leer = ohne Organisation (Allgemein). */
export const TICKET_ORGANISATION_FELD = ['', 'at', 'kt', 'gt', 'kgt'] as const;

/** Kontaktangaben aus künftigen öffentlichen Meldungen (Rückmeldeart, G-07). */
export const RUECKMELDEARTEN = ['telefon', 'email', 'persoenlich'] as const;

const schalter = z.preprocess((v) => v === 'on' || v === 'true' || v === true, z.boolean());

/** Neues Ticket aus der Verwaltung; der Typ ist immer „intern“. */
export const neuesTicketSchema = z.object({
  titel: z.string('pflicht').trim().min(1, 'pflicht').max(160, 'zuLang'),
  beschreibung: z.string('pflicht').trim().min(1, 'pflicht').max(5000, 'zuLang'),
  kategorie: z.string().trim().max(80, 'zuLang').default(''),
  organisation: z.enum(TICKET_ORGANISATION_FELD, 'ungueltig').default(''),
  prioritaet: z.enum(TICKET_PRIORITAETEN, 'ungueltig').default('mittel'),
});

/** Status und Priorität ändern (nur Administration, Recht `ticket.bearbeiten`). */
export const aenderungSchema = z.object({
  id: z.uuid(),
  status: z.enum(TICKET_STATUS, 'ungueltig'),
  prioritaet: z.enum(TICKET_PRIORITAETEN, 'ungueltig'),
});

/** Kommentar im Verlauf eines Tickets. */
export const kommentarSchema = z.object({
  id: z.uuid(),
  text: z.string('pflicht').trim().min(1, 'pflicht').max(2000, 'zuLang'),
  intern: schalter,
});

/** Suchparameter der Liste (GET-Formular). Ungültige Werte entfallen, statt die Seite zu brechen. */
export const listenFilterSchema = z.object({
  status: z.enum(TICKET_STATUS).optional().catch(undefined),
  prioritaet: z.enum(TICKET_PRIORITAETEN).optional().catch(undefined),
  typ: z.enum(TICKET_TYPEN).optional().catch(undefined),
});
export type ListenFilter = z.infer<typeof listenFilterSchema>;

/**
 * Angaben der meldenden Person, verschlüsselt in `ticket.melder_verschluesselt` (G-07). Die Form ist mit dem
 * öffentlichen Meldeformular (C10b) abzustimmen; hier gelesen wird genau diese Form, alles andere gilt als unlesbar.
 * Bei öffentlichen Meldungen stehen auch Betreff und Text hier (Tor B/C SP-B B1: Freitext kann Personendaten enthalten);
 * das Ticket selbst trägt dann nur `OEFFENTLICHE_MELDUNG_TITEL` und eine leere Beschreibung.
 */
export const OEFFENTLICHE_MELDUNG_TITEL = 'Öffentliche Meldung';

export const melderSchema = z.object({
  betreff: z.string().max(200).optional(),
  nachricht: z.string().max(4000).optional(),
  vorname: z.string().max(200).optional(),
  nachname: z.string().max(200).optional(),
  telefon: z.string().max(60).optional(),
  email: z.string().max(254).optional(),
  rueckmeldung: z.boolean().optional(),
  rueckmeldeArt: z.enum(RUECKMELDEARTEN).optional(),
});
export type Melder = z.infer<typeof melderSchema>;

/** FormData → Rohobjekt für das Schema (Schlüssel der Aktion entfallen). */
export function ausFormular(fd: FormData): Record<string, unknown> {
  const roh: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === 'string' && !k.startsWith('$ACTION')) roh[k] = v;
  return roh;
}

/** Feldfehler je Feld: der Schlüssel der Meldung, sonst „ungueltig“. */
export function feldFehlerAus(fehler: ZodError): Record<string, string> {
  const feldFehler: Record<string, string> = {};
  for (const f of fehler.issues) {
    const feld = String(f.path[0] ?? 'formular');
    feldFehler[feld] ??= /^[a-zA-Z]+$/.test(f.message) && f.message.length < 30 ? f.message : 'ungueltig';
  }
  return feldFehler;
}

/** Ob ein Fehler die Kennung (ID) betrifft: dann gibt es keinen Datensatz, kein Formularfehler. */
export function kennungFehlt(fehler: ZodError): boolean {
  return fehler.issues.some((f) => f.path[0] === 'id');
}
