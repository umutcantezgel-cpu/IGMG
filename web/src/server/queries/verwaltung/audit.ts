import 'server-only';
import { TZDate } from '@date-fns/tz';
import { and, asc, desc, eq, gte, isNotNull, isNull, lt, sql, type SQL } from 'drizzle-orm';
import type { AuditAktion, AuditDetails } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { ZEITZONE } from '@/lib/termine';

/**
 * Abfragen des Audit-Logs (C13, G-07). Nur lesen, ohne Cache (Verwaltungsseiten sind dynamisch, ADR 0016).
 * Aufrufer prüfen vorher `verlangeSeitenRecht('audit.lesen')`; nur Administration hat dieses Recht (matrix.ts).
 */
const a = schema.auditEintrag;
const u = schema.user;

/** Einträge je Seite. */
export const SEITENGROESSE = 50;

/**
 * Textschlüssel je Aktion unter `verwaltung.audit.aktion` (messages/verwaltung/audit.json). `satisfies` erzwingt:
 * jede Aktion der Union `AuditAktion` steht genau einmal, keine fremde Aktion.
 */
export const AKTION_SCHLUESSEL = {
  'anmeldung.erfolg': 'anmeldungErfolg',
  'anmeldung.fehlgeschlagen': 'anmeldungFehlgeschlagen',
  abmeldung: 'abmeldung',
  'zwei_faktor.eingerichtet': 'zweiFaktorEingerichtet',
  'einladung.erstellt': 'einladungErstellt',
  'einladung.angenommen': 'einladungAngenommen',
  'einladung.widerrufen': 'einladungWiderrufen',
  'benutzer.rollen_geaendert': 'benutzerRollenGeaendert',
  'benutzer.gesperrt': 'benutzerGesperrt',
  'benutzer.entsperrt': 'benutzerEntsperrt',
  'benutzer.zwei_faktor_zurueckgesetzt': 'benutzerZweiFaktorZurueckgesetzt',
  'benutzer.geloescht': 'benutzerGeloescht',
  'benutzer.gelesen': 'benutzerGelesen',
  'konto.passwort_geaendert': 'kontoPasswortGeaendert',
  'konto.passwort_zurueckgesetzt': 'kontoPasswortZurueckgesetzt',
  'konto.ersatzcodes_erzeugt': 'kontoErsatzcodesErzeugt',
  'inhalt.angelegt': 'inhaltAngelegt',
  'inhalt.geaendert': 'inhaltGeaendert',
  'inhalt.veroeffentlicht': 'inhaltVeroeffentlicht',
  'inhalt.papierkorb': 'inhaltPapierkorb',
  'inhalt.wiederhergestellt': 'inhaltWiederhergestellt',
  'inhalt.geloescht': 'inhaltGeloescht',
  'inhalt.zur_pruefung': 'inhaltZurPruefung',
  'inhalt.revision_wiederhergestellt': 'inhaltRevisionWiederhergestellt',
  'inhalt.vorschau_erstellt': 'inhaltVorschauErstellt',
  'freigabe.erteilt': 'freigabeErteilt',
  'freigabe.zurueckgewiesen': 'freigabeZurueckgewiesen',
  'eingang.angelegt': 'eingangAngelegt',
  'eingang.gelesen': 'eingangGelesen',
  'eingang.status': 'eingangStatus',
  'eingang.notiz': 'eingangNotiz',
  'eingang.exportiert': 'eingangExportiert',
  'eingang.geloescht': 'eingangGeloescht',
  'eingang.frist_geloescht': 'eingangFristGeloescht',
  'medium.hochgeladen': 'mediumHochgeladen',
  'medium.geloescht': 'mediumGeloescht',
  'gebetszeiten.importiert': 'gebetszeitenImportiert',
  'gebetszeiten.import_entfernt': 'gebetszeitenImportEntfernt',
  'gebetszeiten.einstellung': 'gebetszeitenEinstellung',
  'einstellung.geaendert': 'einstellungGeaendert',
  'ticket.angelegt': 'ticketAngelegt',
  'ticket.geaendert': 'ticketGeaendert',
  'ticket.kommentiert': 'ticketKommentiert',
  'ticket.gelesen': 'ticketGelesen',
  'postfach.gesendet': 'postfachGesendet',
} as const satisfies Record<AuditAktion, string>;

/** Alle Aktionen in der Reihenfolge des Schlüsselverzeichnisses. */
export const AKTIONEN = Object.keys(AKTION_SCHLUESSEL) as AuditAktion[];

/** Bekannte Aktion? Die Datenbank kann auch Werte enthalten, die der Code nicht (mehr) kennt. */
export function istAktion(wert: string): wert is AuditAktion {
  return Object.hasOwn(AKTION_SCHLUESSEL, wert);
}

/** Wert des Benutzerfilters für Einträge ohne Konto (System/Besucher). Enthält einen Punkt und ist daher nie eine Konto-ID. */
export const OHNE_KONTO = 'ohne.konto';

const ZIELTYP = /^[A-Za-z0-9_.-]{1,60}$/;
const KONTO_ID = /^[A-Za-z0-9_-]{1,64}$/;
const SEITE = /^\d{1,6}$/;

/** Umgesetzter Filter für die Abfrage; `null` heißt: kein Filter. */
export type AuditFilter = {
  /** Beginn des ersten gewählten Tages in Europe/Berlin (inklusiv). */
  von: Date | null;
  /** Beginn des Tages nach dem letzten gewählten Tag in Europe/Berlin (exklusiv). */
  bisEnde: Date | null;
  aktion: AuditAktion | null;
  zielTyp: string | null;
  benutzerId: string | null;
  /** Nur Einträge ohne Konto (System/Besucher). */
  ohneKonto: boolean;
};

/** Eingaben aus den Suchparametern: Filter, gültige Werte fürs Formular, Seite und Fehler je Feld. */
export type AuditSuche = {
  filter: AuditFilter;
  /** Nur gültige Werte; ungültige Eingaben werden im Formular leer gezeigt. */
  werte: { von: string; bis: string; aktion: string; zielTyp: string; benutzer: string };
  /** Angefragte Seite (ab 1). */
  seite: number;
  fehler: { von: boolean; bis: boolean; zeitraum: boolean };
};

/** Suchparameter wie sie Next.js liefert (mehrfach vorkommende Namen als Liste). */
export type SucheRoh = Record<string, string | string[] | undefined>;

type Kalendertag = { jahr: number; monat: number; tag: number };

/** Gültiges Kalenderdatum im Format JJJJ-MM-TT oder null. */
function kalendertag(roh: string): Kalendertag | null {
  const teile = /^(\d{4})-(\d{2})-(\d{2})$/.exec(roh);
  if (!teile) return null;
  const jahr = Number(teile[1]);
  const monat = Number(teile[2]);
  const tag = Number(teile[3]);
  const probe = new Date(Date.UTC(jahr, monat - 1, tag));
  if (probe.getUTCFullYear() !== jahr || probe.getUTCMonth() !== monat - 1 || probe.getUTCDate() !== tag) return null;
  return { jahr, monat, tag };
}

/** Beginn eines Kalendertags um 00:00 Ortszeit in Europe/Berlin als echter Zeitpunkt (Sommerzeit inbegriffen). */
function berlinBeginn({ jahr, monat, tag }: Kalendertag): Date {
  return new Date(new TZDate(jahr, monat - 1, tag, 0, 0, 0, ZEITZONE).getTime());
}

/** Der Kalendertag nach `k`. */
function tagDanach({ jahr, monat, tag }: Kalendertag): Kalendertag {
  const d = new Date(Date.UTC(jahr, monat - 1, tag + 1));
  return { jahr: d.getUTCFullYear(), monat: d.getUTCMonth() + 1, tag: d.getUTCDate() };
}

/** Negativ, wenn `x` vor `y` liegt, positiv, wenn danach, sonst 0. */
function tagVergleich(x: Kalendertag, y: Kalendertag): number {
  return Date.UTC(x.jahr, x.monat - 1, x.tag) - Date.UTC(y.jahr, y.monat - 1, y.tag);
}

/**
 * Liest die Suchparameter (?von, ?bis, ?aktion, ?zielTyp, ?benutzer, ?seite). Unbekannte oder ungültige Werte
 * entfallen, statt die Seite zu brechen; ein Datum ohne Kalendertag und ein Zeitraum mit „bis“ vor „von“ melden Fehler.
 */
export function filterAusSuche(roh: SucheRoh): AuditSuche {
  const eingabe = (name: string): string => {
    const v = roh[name];
    return (Array.isArray(v) ? v[0] : v)?.trim() ?? '';
  };
  const vonRoh = eingabe('von');
  const bisRoh = eingabe('bis');
  const von = kalendertag(vonRoh);
  const bis = kalendertag(bisRoh);
  const aktionRoh = eingabe('aktion');
  const zielRoh = eingabe('zielTyp');
  const benutzerRoh = eingabe('benutzer');
  const seiteRoh = eingabe('seite');

  const aktion = istAktion(aktionRoh) ? aktionRoh : null;
  const zielTyp = ZIELTYP.test(zielRoh) ? zielRoh : null;
  const ohneKonto = benutzerRoh === OHNE_KONTO;
  const benutzerId = !ohneKonto && KONTO_ID.test(benutzerRoh) ? benutzerRoh : null;

  return {
    filter: {
      von: von ? berlinBeginn(von) : null,
      bisEnde: bis ? berlinBeginn(tagDanach(bis)) : null,
      aktion,
      zielTyp,
      benutzerId,
      ohneKonto,
    },
    werte: {
      von: von ? vonRoh : '',
      bis: bis ? bisRoh : '',
      aktion: aktion ?? '',
      zielTyp: zielTyp ?? '',
      benutzer: ohneKonto ? OHNE_KONTO : (benutzerId ?? ''),
    },
    seite: SEITE.test(seiteRoh) ? Math.max(1, Number(seiteRoh)) : 1,
    fehler: {
      von: vonRoh !== '' && von === null,
      bis: bisRoh !== '' && bis === null,
      zeitraum: von !== null && bis !== null && tagVergleich(von, bis) > 0,
    },
  };
}

/** Eine Zeile des Logs; Name und E-Mail kommen aus dem Konto, sofern es das noch gibt. */
export type AuditZeile = {
  id: number;
  zeitpunkt: Date;
  benutzerId: string | null;
  benutzerName: string | null;
  benutzerEmail: string | null;
  /** Aktion wie gespeichert (in der Regel ein Schlüssel der Union; ältere Werte bleiben lesbar). */
  aktion: string;
  zielTyp: string | null;
  zielId: string | null;
  details: AuditDetails | null;
};

export type AuditSeite = { zeilen: AuditZeile[]; gesamt: number; seite: number; seiten: number };

/** Bedingungen des Filters; ohne Filter `undefined` (alle Einträge). */
function bedingung(f: AuditFilter): SQL | undefined {
  return and(
    f.von ? gte(a.zeitpunkt, f.von) : undefined,
    f.bisEnde ? lt(a.zeitpunkt, f.bisEnde) : undefined,
    f.aktion ? eq(a.aktion, f.aktion) : undefined,
    f.zielTyp ? eq(a.zielTyp, f.zielTyp) : undefined,
    f.ohneKonto ? isNull(a.benutzerId) : undefined,
    f.benutzerId ? eq(a.benutzerId, f.benutzerId) : undefined,
  );
}

/**
 * Eine Seite des Logs, neueste zuerst (gleicher Zeitpunkt: höhere ID zuerst). Eine Seitennummer hinter dem Ende
 * zeigt die letzte Seite; die tatsächlich gezeigte Nummer steht im Ergebnis.
 */
export async function ladeAuditSeite(filter: AuditFilter, angefragt: number): Promise<AuditSeite> {
  const where = bedingung(filter);
  const [zaehl] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(a)
    .where(where);
  const gesamt = zaehl?.n ?? 0;
  const seiten = Math.max(1, Math.ceil(gesamt / SEITENGROESSE));
  const seite = Math.min(Math.max(1, Math.floor(angefragt)), seiten);
  const zeilen = await db
    .select({
      id: a.id,
      zeitpunkt: a.zeitpunkt,
      benutzerId: a.benutzerId,
      benutzerName: u.name,
      benutzerEmail: u.email,
      aktion: a.aktion,
      zielTyp: a.zielTyp,
      zielId: a.zielId,
      details: a.details,
    })
    .from(a)
    .leftJoin(u, eq(u.id, a.benutzerId))
    .where(where)
    .orderBy(desc(a.zeitpunkt), desc(a.id))
    .limit(SEITENGROESSE)
    .offset((seite - 1) * SEITENGROESSE);
  return { zeilen, gesamt, seite, seiten };
}

/** Alle Konten für die Auswahl „Benutzer“, nach Name. */
export async function ladeKonten(): Promise<{ id: string; name: string; email: string }[]> {
  return db.select({ id: u.id, name: u.name, email: u.email }).from(u).orderBy(asc(u.name), asc(u.email));
}

/** Im Log vorkommende Ziel-Typen für die Auswahl „Ziel-Typ“ (nicht festgelegt im Schema, daher aus den Daten). */
export async function ladeZielTypen(): Promise<string[]> {
  const zeilen = await db.selectDistinct({ typ: a.zielTyp }).from(a).where(isNotNull(a.zielTyp)).orderBy(asc(a.zielTyp));
  return zeilen.flatMap((z) => (z.typ === null ? [] : [z.typ]));
}
