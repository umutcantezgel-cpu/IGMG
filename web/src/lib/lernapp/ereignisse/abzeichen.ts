import { SPRACH_STUFEN } from '../kurse';
import type { Ereignis } from './typen';

/**
 * Abzeichen (ADR 0043 Nr. 5, PLAN §8) – Katalog und Ableitung, rein. Jedes Abzeichen folgt allein aus dem Ereignisprotokoll
 * (ADR 0038): Die Ereignisse laufen in ihrer festen Ordnung (`vereinige`: am, geraet, seq) durch; ein Abzeichen gilt ab dem
 * Lerntag (`tag`) des Ereignisses, mit dem seine Bedingung erstmals erfüllt ist. So ergibt dasselbe Protokoll auf jedem
 * Gerät dieselben Abzeichen mit demselben Tag. Ohne Konto voll nutzbar; mit Konto kommen fremde Ereignisse nur über den
 * bestehenden Abgleich hinzu.
 *
 * Grundsätze (ADR 0043, KERN 4.0 §1): keine Serien-Abzeichen (Lerntage zählen gesamt, nicht in Folge), keine Zeitboni, kein
 * Vergleich mit anderen; „Stufe abgeschlossen“ ist nie ein Zertifikat. Wiederholte Lektionen zählen einmal (Lektion,
 * Geschichte, Prüfstein, Schrift); Wiederholungssitzungen zählen je Sitzung.
 *
 * | Gruppe | Bedingung | Stufen |
 * |---|---|---|
 * | stufe | in einem Sprachkurs die Prüfsteine aller Einheiten der Stufe geschafft (Zahl je Stufe nach Rahmenplan) | A1–C1 |
 * | lerntage | Lerntage gesamt | 7, 30, 100, 365 |
 * | woerter | verschiedene Karten (Wörter und Sätze) mindestens einmal richtig | 100, 500, 1.000, 2.500, 5.000 |
 * | schrift | alle Lektionen des Schrift-Vorkurses einer Zielsprache (Zahl nach Rahmenplan) | Arabisch, Latein, Türkisch |
 * | lektionen | verschiedene Lektionen geschafft (ohne Wiederholung) | 1, 10, 50, 100, 250 |
 * | geschichten | verschiedene Geschichten | 1, 10, 25 |
 * | wiederholungen | Wiederholungssitzungen | 1, 10, 50 |
 * | pruefsteine | verschiedene Prüfsteine | 1, 10, 25 |
 * | tagesziel | Tage mit erreichtem Tagesziel (gesamt) | 7, 30, 100 |
 * | erstes | erste Sprech- bzw. Schreiblektion | Sprechen, Schreiben |
 * | einstufung | Einstufungstest gemacht | – |
 * | wissen | erste Lektion je Bereich des Wissenskurses | Grundlagen, Aufbau, Vertiefung |
 * | gruppe | Gruppenziel einer Woche erreicht (Kontext aus L7-02, nur mit Konto und Gruppe) | – |
 *
 * Schlüssel der Lektionen (paket/bauen.ts): `<richtung>.<stufe>.<einheit>.<lektion>` (z. B. `tr-aus-de.a1.e01.l02`), Wissen
 * `islam.<stufe>.<einheit>.<lektion>`.
 */

export const ABZEICHEN_GRUPPEN = [
  'stufe',
  'lerntage',
  'woerter',
  'schrift',
  'lektionen',
  'geschichten',
  'wiederholungen',
  'pruefsteine',
  'tagesziel',
  'erstes',
  'einstufung',
  'wissen',
  'gruppe',
] as const;
export type AbzeichenGruppe = (typeof ABZEICHEN_GRUPPEN)[number];

export type AbzeichenArt = {
  /** stabiler Schlüssel (Speicher `abzeichen`, Texte) */
  id: string;
  gruppe: AbzeichenGruppe;
  /** Schwelle (Zahl) bzw. Stufe, Schrift oder Bereich (Text) – Platzhalter der Texte */
  wert: number | string;
  /** Rang innerhalb der Gruppe ab 1 (Form der Achtstern-Variante) */
  rang: number;
};

/** Einheiten je Sprachstufe laut Rahmenplan (gleich für de, tr, ar; Unit-Test gegen `inhalte/lernapp/rahmen/*.rahmen.json`). */
export const EINHEITEN_JE_STUFE: Readonly<Record<(typeof SPRACH_STUFEN)[number], number>> = { a1: 12, a2: 14, b1: 16, b2: 16, c1: 14 };

/** Schriften der Vorkurse: Zielsprache → Abzeichen (ar: Arabisch, de: Lateinschrift aus ar, tr: türkische Buchstaben). */
export const SCHRIFTEN = { ar: 'ar', de: 'latein', tr: 'tr' } as const;
/** Lektionen des Schrift-Vorkurses je Zielsprache laut Rahmenplan (`vorkurs`; Unit-Test gegen die Rahmenpläne). */
export const VORKURS_LEKTIONEN: Readonly<Record<keyof typeof SCHRIFTEN, number>> = { ar: 8, de: 7, tr: 2 };

export const WISSEN_BEREICHE = ['grund', 'aufbau', 'vertiefung'] as const;

const reihe = (gruppe: AbzeichenGruppe, werte: readonly (number | string)[]): AbzeichenArt[] =>
  werte.map((wert, i) => ({ id: `${gruppe}-${wert}`, gruppe, wert, rang: i + 1 }));

const SCHWELLEN = {
  lerntage: [7, 30, 100, 365],
  woerter: [100, 500, 1000, 2500, 5000],
  lektionen: [1, 10, 50, 100, 250],
  geschichten: [1, 10, 25],
  wiederholungen: [1, 10, 50],
  pruefsteine: [1, 10, 25],
  tagesziel: [7, 30, 100],
} as const satisfies Partial<Record<AbzeichenGruppe, readonly number[]>>;

/** Alle Abzeichen in Anzeigereihenfolge. */
export const ABZEICHEN: readonly AbzeichenArt[] = [
  ...reihe('stufe', SPRACH_STUFEN),
  ...reihe('lerntage', SCHWELLEN.lerntage),
  ...reihe('woerter', SCHWELLEN.woerter),
  ...reihe('schrift', Object.values(SCHRIFTEN)),
  ...reihe('lektionen', SCHWELLEN.lektionen),
  ...reihe('geschichten', SCHWELLEN.geschichten),
  ...reihe('wiederholungen', SCHWELLEN.wiederholungen),
  ...reihe('pruefsteine', SCHWELLEN.pruefsteine),
  ...reihe('tagesziel', SCHWELLEN.tagesziel),
  ...reihe('erstes', ['sprechen', 'schreiben']),
  ...reihe('einstufung', ['test']),
  ...reihe('wissen', WISSEN_BEREICHE),
  ...reihe('gruppe', ['ziel']),
];

const NACH_ID: ReadonlyMap<string, AbzeichenArt> = new Map(ABZEICHEN.map((a) => [a.id, a]));
export const abzeichenArt = (id: string): AbzeichenArt | undefined => NACH_ID.get(id);

export type ErhaltenesAbzeichen = { id: string; /** Lerntag, an dem die Bedingung erstmals erfüllt war */ tag: string };

export type AbzeichenKontext = {
  /** Lerntage mit erreichtem Tagesziel (aus der Ableitung, `TagesStand.erreicht`) */
  zielTage?: Iterable<string>;
  /** Lerntag, an dem die Gruppe ihr Wochenziel erstmals erreicht hat (L7-02; ohne Gruppe `null`) */
  gruppenziel?: string | null;
};

/** Arten, die einen Tag zum Lerntag machen (wie `ableiten.ts`). */
const LERNEN: ReadonlySet<Ereignis['art']> = new Set(['bewertung', 'lektion', 'xp', 'einstufung']);

/** Zerlegt einen Lektionsschlüssel `<kurs>.<stufe>.<einheit>.<lektion>`; `null` bei anderer Form. */
function teile(lektion: string): { kurs: string; stufe: string; einheit: string } | null {
  const t = lektion.split('.');
  if (t.length < 4) return null;
  const [kurs, stufe, einheit] = t as [string, string, string];
  return { kurs, stufe, einheit };
}

/** Zielsprache eines Sprachkurses (`tr-aus-de` → `tr`), sonst `null`. */
function zielsprache(kurs: string): keyof typeof SCHRIFTEN | null {
  const m = /^(de|tr|ar)-aus-(?:de|tr|ar)$/.exec(kurs);
  return m ? (m[1] as keyof typeof SCHRIFTEN) : null;
}

/**
 * Erhaltene Abzeichen aus den Ereignissen. `sortiert`: Ereignisse in der festen Ordnung (`vereinige`). Ergebnis in der
 * Reihenfolge von `ABZEICHEN`. Bis auf `tagesziel` (ein später abgeglichenes Tagesziel kann frühere Tage ändern) wächst die
 * Menge mit jedem weiteren Ereignis nur.
 */
export function leiteAbzeichenAb(sortiert: readonly Ereignis[], kontext: AbzeichenKontext = {}): Map<string, ErhaltenesAbzeichen> {
  const erhalten = new Map<string, string>();
  const gib = (id: string, tag: string) => {
    if (!erhalten.has(id)) erhalten.set(id, tag);
  };
  /** Zähler: bei Erreichen einer Schwelle der Gruppe das Abzeichen am Lerntag `tag`. */
  const zaehle = (gruppe: keyof typeof SCHWELLEN, n: number, tag: string) => {
    for (const s of SCHWELLEN[gruppe]) if (n >= s) gib(`${gruppe}-${s}`, tag);
  };

  const lerntage = new Set<string>();
  const karten = new Set<string>();
  const lektionen = new Set<string>();
  const geschichten = new Set<string>();
  const pruefsteine = new Set<string>();
  let wiederholungen = 0;
  /** `<kurs>.<stufe>` → Einheiten mit geschafftem Prüfstein */
  const stufen = new Map<string, Set<string>>();
  /** Zielsprache → Lektionen des Schrift-Vorkurses */
  const schrift = new Map<keyof typeof SCHRIFTEN, Set<string>>();

  for (const e of sortiert) {
    if (LERNEN.has(e.art) && !lerntage.has(e.tag)) {
      lerntage.add(e.tag);
      zaehle('lerntage', lerntage.size, e.tag);
    }
    if (e.art === 'bewertung' && e.daten.note !== 'nochmal' && !karten.has(e.daten.karte)) {
      karten.add(e.daten.karte);
      zaehle('woerter', karten.size, e.tag);
    } else if (e.art === 'einstufung') gib('einstufung-test', e.tag);
    else if (e.art === 'lektion') {
      const { kurs, lektion, art } = e.daten;
      if (art === 'wiederholung') zaehle('wiederholungen', ++wiederholungen, e.tag);
      else if (!lektionen.has(lektion)) {
        lektionen.add(lektion);
        zaehle('lektionen', lektionen.size, e.tag);
      }
      if (art === 'geschichte' && !geschichten.has(lektion)) zaehle('geschichten', geschichten.add(lektion).size, e.tag);
      if (art === 'sprechen') gib('erstes-sprechen', e.tag);
      if (art === 'schreiben') gib('erstes-schreiben', e.tag);
      const t = teile(lektion);
      const ziel = zielsprache(kurs);
      if (art === 'pruefstein') {
        if (!pruefsteine.has(lektion)) zaehle('pruefsteine', pruefsteine.add(lektion).size, e.tag);
        const stufe = t?.stufe as (typeof SPRACH_STUFEN)[number] | undefined;
        if (ziel && t && t.kurs === kurs && stufe && stufe in EINHEITEN_JE_STUFE) {
          const schluessel = `${kurs}.${stufe}`;
          const einheiten = stufen.get(schluessel) ?? new Set<string>();
          stufen.set(schluessel, einheiten.add(t.einheit));
          if (einheiten.size >= EINHEITEN_JE_STUFE[stufe]) gib(`stufe-${stufe}`, e.tag);
        }
      }
      if (art === 'schrift' && ziel) {
        const liste = schrift.get(ziel) ?? new Set<string>();
        schrift.set(ziel, liste.add(lektion));
        if (liste.size >= VORKURS_LEKTIONEN[ziel]) gib(`schrift-${SCHRIFTEN[ziel]}`, e.tag);
      }
      if (kurs === 'islam' && t?.kurs === 'islam' && (WISSEN_BEREICHE as readonly string[]).includes(t.stufe)) gib(`wissen-${t.stufe}`, e.tag);
    }
  }

  const zielTage = [...new Set(kontext.zielTage ?? [])].sort();
  zielTage.forEach((tag, i) => zaehle('tagesziel', i + 1, tag));
  if (kontext.gruppenziel) gib('gruppe-ziel', kontext.gruppenziel);

  return new Map(ABZEICHEN.filter((a) => erhalten.has(a.id)).map((a) => [a.id, { id: a.id, tag: erhalten.get(a.id)! }]));
}

/** Neu erhaltene Abzeichen gegenüber einem früheren Stand (Reihenfolge wie `ABZEICHEN`). */
export function neueAbzeichen(jetzt: ReadonlyMap<string, unknown>, vorher: ReadonlySet<string>): string[] {
  return [...jetzt.keys()].filter((id) => !vorher.has(id));
}
