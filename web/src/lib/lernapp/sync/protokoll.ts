import { EreignisSchema, GeraetSchema } from '../ereignisse/typen';
import type { Ereignis } from '../ereignisse/typen';
import * as z from '../z';

/**
 * Protokoll des Abgleichs (ADR 0038 Nr. 5–7 und 10, PLAN §3.8): gemeinsam für Server (`/api/lernapp/sync`,
 * `/api/lernapp/sitzung`) und Client (`lokal/sync.ts`). Rein, ohne Next und ohne Datenbank.
 *
 * Anfrage `POST /api/lernapp/sync` (JSON, ≤ 256 KB, gleicher Ursprung):
 * `{ geraet, cursor, ereignisse[≤ 500], basis? }`
 * - `geraet`: UUID des sendenden Profils auf dem Gerät; dessen eigene Ereignisse kommen nicht zurück.
 * - `cursor`: Zeiger des Servers aus der letzten Antwort (`null` beim ersten Abgleich).
 * - `ereignisse`: noch nicht abgeglichene Ereignisse (`lokal/ausgang.ts` `ausstehende`); jedes wird einzeln mit
 *   `EreignisSchema` geprüft, ungültige stehen in `abgelehnt`.
 * - `basis`: zuletzt bekannter Stand der verdichteten Karten (`basisStand`); weicht er ab, kommen die Basen mit.
 *
 * Antwort: `{ cursor, mehr, ereignisse[≤ 2.000], angenommen, doppelt, abgelehnt, geklemmt, angelegt, basisStand, basen? }`
 * - `ereignisse`: fremde Ereignisse (andere Geräte bzw. Profile des Kontos) nach dem Zeiger, aufsteigend nach Zeiger.
 * - `mehr`: Es gibt weitere Seiten; der Client fragt mit dem neuen `cursor` sofort weiter.
 * - `geklemmt`: neu gespeicherte Ereignisse, deren Zeit oder Lerntag der Server geklemmt hat (ADR 0038 Nr. 6) – der Client
 *   übernimmt diese Fassung, damit alle Geräte dieselben Ereignisse nachspielen.
 * - `angelegt`: Anlage des Lernstands auf dem Server. Ändert er sich (Löschung nach 12 Monaten ohne Abgleich), sendet der
 *   Client sein ganzes Protokoll neu.
 */

export const SYNC_ADRESSE = '/api/lernapp/sync';
export const SITZUNG_ADRESSE = '/api/lernapp/sitzung';

/** Höchstens so viele Ereignisse je Anfrage. */
export const HOECHSTENS_EREIGNISSE = 500;
/** Höchstens so viele Bytes je Anfrage. */
export const HOECHSTENS_BYTES = 256 * 1024;
/** Höchstens so viele fremde Ereignisse je Antwort (danach `mehr`). */
export const HOECHSTENS_FREMDE = 2000;
/** Bremse: Anfragen je Minute und Konto. */
export const BREMSE = { max: 30, fensterSekunden: 60 } as const;

/** Zeiger des Servers: fortlaufende Kennung als Dezimaltext (höchstens 15 Stellen, damit sie als Zahl exakt bleibt). */
export const CursorSchema = z.string().check(z.regex(/^(0|[1-9]\d{0,14})$/));
const Zeit = () => z.iso.datetime({ offset: true });
const Anzahl = () => z.int().check(z.minimum(0));

export const SyncAnfrageSchema = z.strictObject({
  geraet: GeraetSchema,
  cursor: z.nullable(CursorSchema),
  ereignisse: z.array(z.unknown()).check(z.maxLength(HOECHSTENS_EREIGNISSE)),
  basis: z.optional(z.nullable(Zeit())),
});
export type SyncAnfrage = z.infer<typeof SyncAnfrageSchema>;

/** Kartenstand, wie ihn `srs.ts` erzeugt (für verdichtete Basen auf dem Draht). */
export const KartenstandSchema = z.strictObject({
  karte: z.string().check(z.minLength(1), z.maxLength(200)),
  faellig: Zeit(),
  stabilitaet: z.number(),
  schwierigkeit: z.number(),
  tageVergangen: z.number(),
  tageGeplant: z.number(),
  lernschritt: z.number(),
  wiederholungen: z.number(),
  fehler: z.number(),
  zustand: z.enum(['neu', 'lernen', 'wiederholen', 'neu_lernen']),
  zuletzt: z.nullable(Zeit()),
  letzteNote: z.nullable(z.enum(['nochmal', 'schwer', 'gut'])),
  /** FSRS-Parameterversion (`srs.ts` `FSRS_PARAMETERVERSION`); eine neue Version heißt Neuberechnung */
  parameterversion: z.string().check(z.minLength(1), z.maxLength(80)),
});

export const KartenBasisSchema = z.strictObject({ stand: KartenstandSchema, bis: Zeit() });

const SchluesselPaar = z.strictObject({ geraet: GeraetSchema, seq: Anzahl() });

export const SyncAntwortSchema = z.strictObject({
  cursor: CursorSchema,
  mehr: z.boolean(),
  ereignisse: z.array(z.unknown()).check(z.maxLength(HOECHSTENS_FREMDE)),
  angenommen: Anzahl(),
  doppelt: Anzahl(),
  abgelehnt: z.array(SchluesselPaar),
  geklemmt: z.array(EreignisSchema),
  angelegt: Zeit(),
  basisStand: z.nullable(Zeit()),
  basen: z.optional(z.record(z.string(), KartenBasisSchema)),
});
export type SyncAntwort = Omit<z.infer<typeof SyncAntwortSchema>, 'ereignisse' | 'geklemmt'> & {
  ereignisse: Ereignis[];
  geklemmt: Ereignis[];
};

/** Fehler der Sync-Route (Körper `{ fehler }`); 404 ohne Körper heißt: Abgleich aus. */
export const SYNC_FEHLER = ['ursprung', 'anmeldung', 'einwilligung', 'eltern', 'bremse', 'anfrage', 'zuGross', 'pruefen'] as const;
export type SyncFehler = (typeof SYNC_FEHLER)[number];

/** Lage der Einwilligung `lernapp`: erteilt, fehlt (selbst erteilen) oder fehlt und nur die Eltern können sie erteilen. */
export type EinwilligungsStand = 'erteilt' | 'fehlt' | 'eltern';

/** Antwort von `GET /api/lernapp/sitzung` (404 heißt: Abgleich aus). */
export const SitzungAntwortSchema = z.discriminatedUnion('angemeldet', [
  z.strictObject({ angemeldet: z.literal(false) }),
  z.strictObject({
    angemeldet: z.literal(true),
    konto: z.string().check(z.minLength(1), z.maxLength(200)),
    einwilligung: z.enum(['erteilt', 'fehlt', 'eltern']),
  }),
]);
export type SitzungAntwort = z.infer<typeof SitzungAntwortSchema>;
