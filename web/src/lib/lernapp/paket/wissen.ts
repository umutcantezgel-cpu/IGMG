import { type Aufgabe, AufgabeSchema, type AufgabeVon, type Lektion, LektionSchema } from '../aufgaben/schema';
import {
  type FreigabeBaustein,
  koranWortSichtbar,
  type KoranWortFreigabe,
  lektionSichtbar,
  NOETIGE_FREIGABEN,
  religioeseLage,
  type Status,
  wissenSichtbar,
  wissensAufgabeSichtbar,
  wissensAufgabeVorschauSichtbar,
  wissenVorschauSichtbar,
} from '../freigabe';
import type { LektionsArt } from '../engine/xp';
import type { Sprache, Stufe } from '../kurse';
import type { BauErgebnis } from './bauen';
import { kanonischGeprueft, sha256Hex } from './hash';
import { INHALT_LIZENZ, PAKET_FORMAT } from './kennungen';
import { type Paket, PaketSchema, WissensLektionSchema, type WissensLektionVermerk } from './typen';

/**
 * Lektionen des Wissenskurses und des Koran-Arabisch-Pfads für den Paketbau (ADR 0039 Nr. 1, ADR 0040 Nr. 5, KERN 4.0
 * §2.3) – rein. Was ausgeliefert wird, entscheidet nur `freigabe.ts`; hier wird es zusammengesetzt:
 *
 * - Jede Aufgabe ist sichtbar nur mit zwei Freigaben für sich und für jede Aussage, aus der sie entsteht
 *   (`wissensAufgabeSichtbar`); `koran_wort` nur, wenn alle gezeigten Bedeutungen bzw. die Wurzeltabelle geprüft sind
 *   (`koranWortSichtbar`).
 * - Eine Lektion gibt es nur ganz: Ist ein einziger Baustein nicht geprüft (auch die Lektion selbst), fällt die ganze
 *   Lektion weg (`lektionSichtbar`) – es gibt keine Teilauslieferung religiöser Inhalte.
 * - Nur die Typen des jeweiligen Kurses: im Wissenskurs `auswahl`, `wahr_falsch`, `zuordnen`, `reihenfolge`, `luecke`,
 *   `fallfrage` (PLAN §4); im Koran-Pfad `koran_wort`. Andere Typen machen die Lektion ungültig (`null`).
 * - Keine Audio-Verweise: Wissenskurs und Koran-Pfad haben keine Sprachausgabe (KERN 4.0 §4).
 *
 * - Wissenskurs: **alle** Aussagen der Lektion zählen mit, auch solche ohne Quizfrage (KERN 4.0 §2.3 „alle ihre Bausteine“).
 *
 * - Vorschau (Schalter `lernapp_wissen_vorschau`, L3-E22, nur Wissenskurs): Eine Lektion, die die strenge Regel nicht
 *   erfüllt, kommt als gekennzeichneter Entwurf (`entwurf: true` statt Prüfvermerk), wenn kein Baustein zurückgezogen ist,
 *   niemand mit der Rolle Einwand erhoben hat, jede Aussage ihren Beleg hat und jede Quizfrage spielbar ist
 *   (`wissenVorschauSichtbar`). Ohne Vorschau ist das Paket byte-gleich wie zuvor. Der Koran-Pfad kennt keine Vorschau.
 *
 * Den Paketbau des Wissenskurses (`baueWissensEinheit`, Format `PaketSchema` mit `kurs: 'islam'`) speist
 * `server/queries/lernapp/wissen.ts` aus den Tabellen `lernapp_lektion`, `lernapp_aussage`, `lernapp_beleg` und
 * `lernapp_aufgabe`; der Koran-Pfad baut seine eigenen Pakete (`paket/koran.ts`).
 */

export const WISSENSKURS_TYPEN = ['auswahl', 'wahr_falsch', 'zuordnen', 'reihenfolge', 'luecke', 'fallfrage'] as const;
export const KORAN_TYPEN = ['koran_wort'] as const;

export type WissensAufgabeEingabe = { aufgabe: Aufgabe; freigabe: FreigabeBaustein; aussagen: readonly FreigabeBaustein[] };
export type KoranAufgabeEingabe = { aufgabe: AufgabeVon<'koran_wort'>; freigabe: KoranWortFreigabe };

export type WissensLektionEingabe = {
  /** Kopf der Lektion (ohne Aufgaben) */
  lektion: Omit<Lektion, 'aufgaben'>;
  /** Freigabe der Lektion selbst (Titel, Ziel, Kennzeichnung „für Kinder geeignet“) */
  freigabe: FreigabeBaustein;
} & (
  | {
      kurs: 'islam';
      aufgaben: readonly WissensAufgabeEingabe[];
      /** alle Aussagen der Lektion (auch ohne Quizfrage) – jede braucht zwei Freigaben */
      aussagen: readonly FreigabeBaustein[];
    }
  | { kurs: 'koran'; aufgaben: readonly KoranAufgabeEingabe[] }
);

const sichtbar = (b: FreigabeBaustein) => wissenSichtbar(b.status, b.baustein, b.pruefungen);
const vorschauSichtbar = (b: FreigabeBaustein) => wissenVorschauSichtbar(b.status, b.baustein, b.pruefungen);

/** Steht irgendwo in der Aufgabe ein Audio-Verweis? */
function hatAudio(x: unknown): boolean {
  if (Array.isArray(x)) return x.some(hatAudio);
  if (x === null || typeof x !== 'object') return false;
  return Object.entries(x).some(([k, v]) => (k === 'audio' && v !== undefined) || hatAudio(v));
}

/**
 * Lektion mit allen Aufgaben, wenn jeder Baustein geprüft ist; sonst `null`. Mit `vorschau` (nur Wissenskurs) gilt statt
 * „geprüft“ die Regel der Vorschau (`wissenVorschauSichtbar`) – der Aufrufer kennzeichnet die Lektion dann als Entwurf.
 */
export function sichtbareWissensLektion(e: WissensLektionEingabe, { vorschau = false }: { vorschau?: boolean } = {}): Lektion | null {
  if (!e.aufgaben.length || e.aufgaben.some((x) => hatAudio(x.aufgabe))) return null;
  const typen: readonly string[] = e.kurs === 'islam' ? WISSENSKURS_TYPEN : KORAN_TYPEN;
  if (e.aufgaben.some((x) => !typen.includes(x.aufgabe.typ))) return null;
  if (e.kurs === 'islam' && !e.aussagen.length) return null;
  const entwurf = vorschau && e.kurs === 'islam';
  const geprueft = [
    (entwurf ? vorschauSichtbar : sichtbar)(e.freigabe),
    ...(e.kurs === 'islam'
      ? [
          ...e.aussagen.map(entwurf ? vorschauSichtbar : sichtbar),
          ...e.aufgaben.map((x) => (entwurf ? wissensAufgabeVorschauSichtbar : wissensAufgabeSichtbar)(x.freigabe, x.aussagen)),
        ]
      : e.aufgaben.map((x) => koranWortSichtbar(x.freigabe))),
  ];
  if (!lektionSichtbar(geprueft)) return null;
  return { ...e.lektion, aufgaben: e.aufgaben.map((x) => x.aufgabe) };
}

// ——— Paketbau des Wissenskurses ———

/** Aussage einer Lektion für den Paketbau: Text, Quellenzeile (aus den Belegen, vom Aufrufer gesetzt) und Freigabelage. */
export type WissensAussageRoh = { schluessel: string; text: string; quelle: string; strittig: boolean; freigabe: FreigabeBaustein };
/**
 * Quizfrage wie in `lernapp_aufgabe`: `daten` im Format der Inhaltsdatei (`IslamAufgabeSchema` ohne Kopf); `aussage` ist die
 * Aussage, aus der sie entsteht (Quellenzeile, „strittig“ und Freigabelage; `null` ohne Aussage – dann nie sichtbar).
 */
export type WissensAufgabeRoh = {
  schluessel: string;
  typ: string;
  daten: unknown;
  aussage: (Pick<WissensAussageRoh, 'quelle' | 'freigabe'> & { strittig?: boolean }) | null;
  freigabe: FreigabeBaustein;
};
export type WissensLektionRoh = {
  schluessel: string;
  art: LektionsArt;
  titel: string | null;
  kinderGeeignet: boolean;
  freigabe: FreigabeBaustein;
  aussagen: readonly WissensAussageRoh[];
  aufgaben: readonly WissensAufgabeRoh[];
};
export type WissensEinheitEingabe = {
  einheit: {
    schluessel: string;
    stufe: Stufe;
    reihenfolge: number;
    thema: Partial<Record<Sprache, string>>;
    symbol: string | null;
    status: Status;
  };
  lektionen: readonly WissensLektionRoh[];
};

type Daten = Record<string, unknown>;
const istDaten = (x: unknown): x is Daten => typeof x === 'object' && x !== null && !Array.isArray(x);

/**
 * Quizfrage aus der Datenbank (Format der Inhaltsdatei) als Aufgabe des Spielers, mit der Quellenzeile ihrer Aussage und – bei
 * einem strittigen Thema (ADR 0040 Nr. 4) – der Kennzeichnung `strittig`; gegen `AufgabeSchema` geprüft. `null`, wenn sie nicht
 * passt oder der Spieler für den Typ keine Quellenzeile zeigt (`auswahl`, `luecke`): Dann fehlt die Lektion lieber, als dass
 * eine Aussage ohne Quelle erscheint.
 *
 * Alles, was die Prüfenden freigegeben haben, kommt an: Bei `zuordnen` und `reihenfolge` wird die inhaltliche `anweisung` der
 * Inhaltsdatei zur `frage` der Aufgabe (der Spieler zeigt sie unter der festen Überschrift „Ordne zu“/„Ordne“). Fehlt sie, ist
 * die Quizfrage nicht lösbar → `null`.
 */
export function wissensAufgabe(
  a: Pick<WissensAufgabeRoh, 'schluessel' | 'typ' | 'daten'>,
  quelle: string,
  strittig = false,
): Aufgabe | null {
  const d = a.daten;
  if (!istDaten(d)) return null;
  const kopf = { schluessel: a.schluessel, sprache: 'de' as const, quelle, ...(strittig ? { strittig: true as const } : {}) };
  // inhaltliche Frage von `zuordnen`/`reihenfolge` (Feld `anweisung` der Inhaltsdatei)
  const frage = typeof d.anweisung === 'string' && d.anweisung.trim() ? d.anweisung : null;
  let roh: unknown = null;
  if (a.typ === 'wahr_falsch')
    roh = { ...kopf, typ: 'wahr_falsch', anweisung: 'stimmtDas', aussage: d.behauptung, wahr: d.richtig, begruendung: d.begruendung };
  else if (a.typ === 'fallfrage')
    roh = { ...kopf, typ: 'fallfrage', anweisung: 'waehleAntwort', fall: d.fall, frage: d.frage, optionen: d.optionen, richtig: d.richtig };
  else if (a.typ === 'reihenfolge' && frage) roh = { ...kopf, typ: 'reihenfolge', anweisung: 'ordne', frage, schritte: d.schritte };
  else if (a.typ === 'zuordnen' && frage && Array.isArray(d.paare)) {
    // Paare „links → rechts“: die rechten Seiten sind die Kategorien (Reihenfolge des ersten Auftretens)
    const paare = d.paare.filter(istDaten);
    const kategorien = [...new Set(paare.map((p) => p.rechts))];
    roh = {
      ...kopf,
      typ: 'zuordnen',
      anweisung: 'ordneZu',
      frage,
      kategorien,
      eintraege: paare.map((p) => ({ text: p.links, kategorie: kategorien.indexOf(p.rechts) })),
    };
  }
  if (!roh || !WISSENSKURS_TYPEN.includes(a.typ as (typeof WISSENSKURS_TYPEN)[number])) return null;
  const p = AufgabeSchema.safeParse(roh);
  return p.success ? p.data : null;
}

/** Zeitpunkt der zweiten zählenden Freigabe zum aktuellen Hash (`null`, wenn der Baustein nicht sichtbar ist). */
export function freigegebenAm(b: FreigabeBaustein): Date | null {
  if (!sichtbar(b)) return null;
  const hash = b.baustein.inhaltHash;
  const zeiten = religioeseLage(b.baustein, b.pruefungen)
    .freigaben.map((person) =>
      Math.max(
        ...b.pruefungen
          .filter((p) => p.pruefendeId === person && p.art === 'religioes' && p.inhaltHash === hash && p.urteil === 'ok')
          .map((p) => p.am.getTime()),
      ),
    )
    .sort((x, y) => x - y);
  const t = zeiten[NOETIGE_FREIGABEN - 1];
  return t === undefined ? null : new Date(t);
}

/**
 * Lektion des Wissenskurses samt Prüfvermerk, wenn alle Bausteine geprüft und alle Quizfragen spielbar sind; sonst `null`.
 * Mit `vorschau` (L3-E22): Erfüllt sie die strenge Regel nicht, kommt sie als Entwurf (`entwurf: true` statt `geprueftAm`),
 * sofern sie die Regel der Vorschau erfüllt.
 */
export function wissensLektionImPaket(
  l: WissensLektionRoh,
  { vorschau = false }: { vorschau?: boolean } = {},
): { lektion: Lektion; vermerk: WissensLektionVermerk } | null {
  const streng = geprueftImPaket(l);
  return streng || !vorschau ? streng : entwurfImPaket(l);
}

/** Lektion und Aufgaben für den Paketbau (gemeinsam für die strenge Regel und die Vorschau); `null`, wenn nicht spielbar. */
function lektionMitAufgaben(l: WissensLektionRoh, vorschau: boolean): Lektion | null {
  const aufgaben: WissensAufgabeEingabe[] = [];
  for (const a of l.aufgaben) {
    const aufgabe = a.aussage ? wissensAufgabe(a, a.aussage.quelle, a.aussage.strittig === true) : null;
    if (!a.aussage || !aufgabe) return null;
    aufgaben.push({ aufgabe, freigabe: a.freigabe, aussagen: [a.aussage.freigabe] });
  }
  const lektion = sichtbareWissensLektion(
    {
      kurs: 'islam',
      lektion: {
        schluessel: l.schluessel,
        kurs: 'islam',
        art: l.art,
        zielsprache: 'de',
        ausgangssprache: 'de',
        ...(l.titel ? { titel: l.titel } : {}),
      },
      freigabe: l.freigabe,
      aussagen: l.aussagen.map((a) => a.freigabe),
      aufgaben,
    },
    { vorschau },
  );
  return lektion && LektionSchema.safeParse(lektion).success ? lektion : null;
}

/** Aussagen der Lektion im Format des Vermerks (Text, Quellenzeile, „strittig“). */
const vermerkAussagen = (l: WissensLektionRoh) =>
  l.aussagen.map((a) => ({ schluessel: a.schluessel, text: a.text, quelle: a.quelle, ...(a.strittig ? { strittig: true } : {}) }));

/** Strenge Regel: alle Bausteine mit zwei Freigaben, Prüfvermerk mit dem Tag der letzten zweiten Freigabe. */
function geprueftImPaket(l: WissensLektionRoh): { lektion: Lektion; vermerk: WissensLektionVermerk } | null {
  const lektion = lektionMitAufgaben(l, false);
  if (!lektion) return null;
  const zeiten = [
    l.freigabe,
    ...l.aussagen.map((a) => a.freigabe),
    ...l.aufgaben.flatMap((a) => [a.freigabe, ...(a.aussage ? [a.aussage.freigabe] : [])]),
  ].map(freigegebenAm);
  if (zeiten.some((t) => t === null)) return null;
  const am = new Date(Math.max(...zeiten.map((t) => t!.getTime())));
  // Vermerk im Format des Pakets (Länge von Text und Quellenzeile, Anzahl der Aussagen): Ein Paket, das der Client verwirft
  // (`PaketSchema` in `lokal/pakete.ts`), entsteht nie – lieber keine Lektion als eine kaputte (wie bei den Quizfragen)
  const vermerk = WissensLektionSchema.safeParse({
    geprueftAm: am.toISOString().slice(0, 10),
    kinderGeeignet: l.kinderGeeignet,
    aussagen: vermerkAussagen(l),
  });
  return vermerk.success ? { lektion, vermerk: vermerk.data } : null;
}

/** Vorschau (L3-E22): ungeprüfter Entwurf mit Kennzeichnung, Aussagen und Quellenzeilen – ohne Prüfvermerk. */
function entwurfImPaket(l: WissensLektionRoh): { lektion: Lektion; vermerk: WissensLektionVermerk } | null {
  const lektion = lektionMitAufgaben(l, true);
  if (!lektion) return null;
  const vermerk = WissensLektionSchema.safeParse({ entwurf: true, kinderGeeignet: l.kinderGeeignet, aussagen: vermerkAussagen(l) });
  return vermerk.success ? { lektion, vermerk: vermerk.data } : null;
}

/**
 * Einheitenpaket des Wissenskurses (Format `PaketSchema`, `kurs: 'islam'`, Inhalt Deutsch): nur Lektionen, deren Bausteine
 * alle zwei Freigaben zum aktuellen Hash haben; je Lektion der Prüfvermerk und die Aussagen mit Quellenzeile. Keine Einträge,
 * Tipps oder Audio (keine Sprachausgabe, KERN 4.0 §4). `null`, wenn die Einheit zurückgezogen ist, keine Lektion bleibt oder das
 * Paket nicht dem `PaketSchema` entspricht. Mit `vorschau` (L3-E22) zusätzlich die übrigen Lektionen als Entwurf; dann trägt
 * das Paket `vorschau: true`.
 */
export function baueWissensEinheit(e: WissensEinheitEingabe, { vorschau = false }: { vorschau?: boolean } = {}): BauErgebnis | null {
  if (e.einheit.status === 'gesperrt') return null;
  const lektionen: Lektion[] = [];
  const wissen: Record<string, WissensLektionVermerk> = {};
  for (const l of e.lektionen) {
    const x = wissensLektionImPaket(l, { vorschau });
    if (!x) continue;
    lektionen.push(x.lektion);
    wissen[x.lektion.schluessel] = x.vermerk;
  }
  if (!lektionen.length) return null;
  const paket: Paket = {
    format: PAKET_FORMAT,
    version: 1,
    kurs: 'islam',
    zielsprache: 'de',
    ausgangssprache: 'de',
    einheit: {
      schluessel: e.einheit.schluessel,
      stufe: e.einheit.stufe,
      reihenfolge: e.einheit.reihenfolge,
      thema: e.einheit.thema,
      ...(e.einheit.symbol ? { symbol: e.einheit.symbol } : {}),
    },
    hinweis: false,
    lektionen,
    eintraege: {},
    tipps: [],
    audio: [],
    lizenz: INHALT_LIZENZ,
    wissen,
    ...(Object.values(wissen).some((v) => 'entwurf' in v) ? { vorschau: true as const } : {}),
  };
  // Gegenprobe am fertigen Paket (wie der Client, `lokal/pakete.ts`): Was er verwerfen würde, nennt auch das Verzeichnis nie
  if (!PaketSchema.safeParse(paket).success) return null;
  const json = kanonischGeprueft(paket);
  return { paket, json, hash: sha256Hex(json), bytes: new TextEncoder().encode(json).length, warnungen: [] };
}
