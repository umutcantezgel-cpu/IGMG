/**
 * Verwaltung „Lernen und Aufnahme“ (O-L01, H-L01…L05): reine Funktionen ohne Datenbank – unit-getestet in
 * `tests/unit/lernen-verwaltung.test.ts`. Die Dienste und Actions setzen sie mit Daten zusammen.
 */
import { MIN_ERWACHSENE, MINDESTALTER_UNTERGRENZE } from '@/lib/chat/regeln';
import { anzeigenameAus } from '@/lib/konto/regeln';

export const KURSARTEN = ['elifbe', 'kuran', 'tecvid', 'ilmihal', 'hifz'] as const;
export type Kursart = (typeof KURSARTEN)[number];

/** Wochentage in der Reihenfolge der Woche (Montag zuerst); Werte wie `Date.getUTCDay` (0 = Sonntag). */
export const WOCHENTAGE_REIHE = [1, 2, 3, 4, 5, 6, 0] as const;

/** S-06: Der Chat ist höchstens von 08:00 bis 20:00 Uhr offen; die Gruppe darf das Fenster nur verkleinern. */
export const CHAT_FRUEHESTENS = '08:00';
export const CHAT_SPAETESTENS = '20:00';
/** Höchstes einstellbares Chat-Mindestalter (ab 16 entfällt die Elterneinwilligung). */
export const CHAT_MINDESTALTER_HOECHSTENS = 18;
export { MIN_ERWACHSENE, MINDESTALTER_UNTERGRENZE };

/** Löschfrist für unbestätigte Registrierungen (Tage ohne Bestätigung der Adresse). */
export const UNBESTAETIGT_TAGE = 7;

const UHRZEIT = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATUM = /^\d{4}-\d{2}-\d{2}$/;

export function istUhrzeit(wert: string): boolean {
  return UHRZEIT.test(wert);
}

/** Gültiger Kalendertag „JJJJ-MM-TT“ (kein 31. Februar). */
export function istDatum(wert: string): boolean {
  if (!DATUM.test(wert)) return false;
  const d = new Date(`${wert}T12:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === wert;
}

/** S-06: Chatfenster gültig? Beginn vor Ende, beides innerhalb 08:00–20:00. */
export function chatFensterGueltig(von: string, bis: string): boolean {
  if (!istUhrzeit(von) || !istUhrzeit(bis)) return false;
  return von >= CHAT_FRUEHESTENS && bis <= CHAT_SPAETESTENS && von < bis;
}

/**
 * Tag des 16. Geburtstags aus dem Geburtsdatum (für die Einwilligungslogik, Art. 8 DSGVO). Wer am 29. Februar geboren
 * ist, wird in einem Nicht-Schaltjahr am 1. März 16 (der Tag nach dem 28. Februar). null bei ungültigem Datum.
 */
export function sechzehnAus(geburtsdatum: string): string | null {
  if (!istDatum(geburtsdatum)) return null;
  const [j, m, t] = geburtsdatum.split('-').map(Number);
  const ziel = new Date(Date.UTC(j + 16, m - 1, t, 12));
  // Überlauf (29.02. → 01.03.) ergibt sich aus Date.UTC von selbst
  return ziel.toISOString().slice(0, 10);
}

export type ChatLage = 'aus' | 'zuWenigeErwachsene' | 'bereit';

/** S-02: Lage des Gruppenchats für die Anzeige (erzwungen wird sie im Chat-Dienst). */
export function chatLage(chatModus: 'aus' | 'nur_lehrkraft' | 'offen', erwachsene: number): { lage: ChatLage; fehlen: number } {
  const fehlen = Math.max(0, MIN_ERWACHSENE - erwachsene);
  if (chatModus === 'aus') return { lage: 'aus', fehlen };
  return { lage: fehlen > 0 ? 'zuWenigeErwachsene' : 'bereit', fehlen };
}

/** Zeitraum für eine Terminserie: höchstens ein Jahr (Schutz vor versehentlich riesigen Serien). */
export const TERMINE_HOECHSTENS_TAGE = 366;

export function tageZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T12:00:00Z`) - Date.parse(`${von}T12:00:00Z`)) / 86_400_000);
}

/**
 * Sortieren im Lehrplan: Tausch mit dem Nachbarn (hoch/runter). Ergebnis: beide IDs mit ihrer neuen Reihenfolge,
 * oder null am Rand bzw. bei unbekannter ID. `stufen` ist nach Reihenfolge sortiert.
 */
export function tauschPartner(
  stufen: readonly { id: string; reihenfolge: number }[],
  id: string,
  richtung: 'hoch' | 'runter',
): { a: { id: string; reihenfolge: number }; b: { id: string; reihenfolge: number } } | null {
  const i = stufen.findIndex((s) => s.id === id);
  const j = richtung === 'hoch' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= stufen.length) return null;
  return {
    a: { id: stufen[i].id, reihenfolge: stufen[j].reihenfolge },
    b: { id: stufen[j].id, reihenfolge: stufen[i].reihenfolge },
  };
}

/** Nächste freie Reihenfolge am Ende einer Kursart. */
export function naechsteReihenfolge(stufen: readonly { reihenfolge: number }[]): number {
  return stufen.reduce((max, s) => Math.max(max, s.reihenfolge), 0) + 1;
}

/** Personendaten einer/eines Lernenden – nur verschlüsselt gespeichert (G-07). */
export type LernendeDaten = {
  vorname: string;
  nachname: string;
  geburtsdatum: string | null;
  geschlecht?: string | null;
  strasse?: string | null;
  plz?: string | null;
  ort?: string | null;
  /** Gewählte Klasse aus der Voranmeldung (kindergarten, vorbereitung, grundkurs). */
  klasse?: string | null;
  geschwister?: string | null;
  eltern?: { name: string; telefon?: string | null; email?: string | null }[];
};

export type ElternKontakt = { name: string; email: string };

const text = (w: unknown): string => (typeof w === 'string' ? w.trim() : '');

/**
 * Lernende aus einer Voranmeldung (O-L01): Personendaten für das Chiffrat, Anzeigename (Vorname + Initial, S-14),
 * Tag des 16. Geburtstags und die Eltern mit E-Mail-Adresse (für die Einladung). null, wenn Vor- oder Nachname fehlt.
 */
export function lernendeAusVoranmeldung(daten: Record<string, unknown>): {
  daten: LernendeDaten;
  anzeigename: string;
  sechzehnAm: string | null;
  eltern: ElternKontakt[];
} | null {
  const vorname = text(daten.vorname);
  const nachname = text(daten.nachname);
  if (!vorname || !nachname) return null;
  const geburtsdatum = istDatum(text(daten.geburtsdatum)) ? text(daten.geburtsdatum) : null;
  const elternListe = [1, 2]
    .map((n) => ({
      name: text(daten[`eltern${n}Name`]),
      telefon: text(daten[`eltern${n}Telefon`]) || null,
      email: text(daten[`eltern${n}Email`]).toLowerCase() || null,
    }))
    .filter((e) => e.name);
  return {
    daten: {
      vorname,
      nachname,
      geburtsdatum,
      geschlecht: text(daten.geschlecht) || null,
      strasse: text(daten.strasse) || null,
      plz: text(daten.plz) || null,
      ort: text(daten.ort) || null,
      klasse: text(daten.klasse) || null,
      geschwister: text(daten.geschwister) || null,
      eltern: elternListe,
    },
    anzeigename: anzeigenameAus(`${vorname} ${nachname}`),
    sechzehnAm: geburtsdatum ? sechzehnAus(geburtsdatum) : null,
    eltern: elternListe.filter((e): e is typeof e & { email: string } => Boolean(e.email)).map((e) => ({ name: e.name, email: e.email })),
  };
}

/** Ist die Person am Stichtag mindestens 16? (Tag des 16. Geburtstags liegt nicht nach heute.) */
/**
 * Vorbelegte Gruppe bei der Aufnahme einer Voranmeldung mit gewünschtem Kurs (F-44): die erste aktive Gruppe dieses Kurses
 * in der Reihenfolge der Auswahlliste; ohne Kurs oder ohne passende Gruppe keine („später zuordnen“).
 */
export function gruppeFuerKurs(
  gruppen: readonly { id: string; kursId: string | null }[],
  kursId: string | null | undefined,
): string | null {
  if (!kursId) return null;
  return gruppen.find((g) => g.kursId === kursId)?.id ?? null;
}

export function istMindestens16(sechzehnAm: string | null, heute: string): boolean {
  return sechzehnAm !== null && sechzehnAm <= heute;
}

export const GEMEINDE_ROLLEN = ['gemeinde', 'eltern', 'lehrkraft', 'schueler'] as const;
export type GemeindeRolleArt = (typeof GEMEINDE_ROLLEN)[number];

/**
 * Welche Gemeinde-Rollen darf ein Konto tragen? Kinderkonten (< 16, ohne E-Mail) nur `schueler`; Lehrkraft und Eltern
 * sind Erwachsenen vorbehalten. Ergebnis: bereinigte, eindeutige Liste in fester Reihenfolge oder ein Fehlerschlüssel.
 */
export function pruefeGemeindeRollen(
  rollen: readonly string[],
  istKind: boolean,
): { ok: true; rollen: GemeindeRolleArt[] } | { ok: false; fehler: 'kindRollen' | 'unbekannt' } {
  if (rollen.some((r) => !(GEMEINDE_ROLLEN as readonly string[]).includes(r))) return { ok: false, fehler: 'unbekannt' };
  const eindeutig = GEMEINDE_ROLLEN.filter((r) => rollen.includes(r));
  if (istKind && eindeutig.some((r) => r !== 'schueler')) return { ok: false, fehler: 'kindRollen' };
  return { ok: true, rollen: eindeutig };
}

/** Zustand eines Löschantrags: Frist läuft noch oder ist abgelaufen (dann darf „jetzt löschen“). */
export function loeschZustand(loeschenAb: Date | null, jetzt: Date): 'kein' | 'laeuft' | 'faellig' {
  if (!loeschenAb) return 'kein';
  return loeschenAb.getTime() <= jetzt.getTime() ? 'faellig' : 'laeuft';
}
