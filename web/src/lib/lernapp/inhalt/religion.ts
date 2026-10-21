import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { baueIndex, baueLexikon, hatTrenner, lexikonTreffer, vierGrammStrom, vierGrammTreffer, woerter } from '../waechter/kern.mjs';
import { hauptVerweis, type InhaltDatei, vorlageTexte } from './schema';

/**
 * Religionswächter für Inhaltsdateien (KERN 4.0 §3, ADR 0040 Nr. 6; S-L1 M-3) – „fail closed“ im Import und in
 * `pnpm lernapp:pruefen`, nicht erst im Tor:
 *
 * - **Formel-Lexikon (a):** Ein Treffer (arabisch aus den Verweisen in den Tanzil-Text, deutsch/türkisch aus der Startliste,
 *   `waechter/kern.mjs`) verlangt `religionsbezug: true` am Eintrag. Texte ohne eigenes Kennzeichen (Thema, Kann-Beschreibung,
 *   Lektionsziel) dürfen nie treffen. Eine Übersetzung erbt das Kennzeichen ihres Zieleintrags, die eigenen Texte einer
 *   Aufgaben-Vorlage (Wortbank-Fassungen, Ablenker, Varianten, Formentabellen) das ihres Hauptverweises.
 * - **Koran- und Hadith-4-Gramm (b, c):** Folgen aus 4 Wörtern sind immer Rot – über alle Texte einer Datei hinweg (Sätze
 *   einer Lektion, Dialogzeilen), nicht nur innerhalb eines Felds. Ausnahmen erst mit der geprüften Formelliste (LM-09).
 *
 * Gekennzeichnete Einträge brauchen zwei religiöse Freigaben und bekommen keine Sprachausgabe (`freigabe.ts`,
 * `paket/bauen.ts`). Befunde enthalten keine arabische Schrift (nur Datei, Ort und Name des Eintrags bzw. die Fundstelle).
 */

export type Waechter = { index: ReturnType<typeof baueIndex>; lexikon: ReturnType<typeof baueLexikon> };

let geladen: Waechter | null = null;

/** Index und Lexikon aus den gepinnten Daten (`web/daten`), einmal je Prozess (≈ 3 s). */
export function ladeWaechter(daten = join(process.cwd(), 'daten')): Waechter {
  if (geladen) return geladen;
  const tanzilXml = readFileSync(join(daten, 'tanzil/quran-uthmani.xml'), 'utf8');
  geladen = {
    index: baueIndex({ tanzilXml, bukhariJson: readFileSync(join(daten, 'hadith/ara-bukhari.json'), 'utf8') }),
    lexikon: baueLexikon(tanzilXml),
  };
  return geladen;
}

/** Ein Text einer Inhaltsdatei: Ort für die Meldung und Kennzeichen (`null`: kein Kennzeichen möglich). */
export type GepruefterText = { ort: string; text: string; religionsbezug: boolean | null };

type LernText = { de?: string; tr?: string; ar?: string };
const lernTexte = (ort: string, t: LernText | undefined): GepruefterText[] =>
  t ? Object.entries(t).flatMap(([s, v]) => (v ? [{ ort: `${ort}.${s}`, text: v, religionsbezug: null }] : [])) : [];

/** Text-Knoten eines Tiptap-Dokuments in Reihenfolge. */
function tiptapTexte(knoten: unknown): string[] {
  if (!knoten || typeof knoten !== 'object') return [];
  const k = knoten as { text?: unknown; content?: unknown };
  return [...(typeof k.text === 'string' ? [k.text] : []), ...(Array.isArray(k.content) ? k.content.flatMap(tiptapTexte) : [])];
}

/** Alle Texte einer Inhaltsdatei mit Kennzeichen; `bezug`: Kennzeichen der Lemmata und Sätze aller gelesenen Dateien. */
export function texteVon(datei: InhaltDatei, bezug: ReadonlyMap<string, boolean>): GepruefterText[] {
  if (datei.art === 'sprache') {
    const d = datei.daten;
    return [
      ...lernTexte(`${d.einheit.schluessel}.thema`, d.einheit.thema),
      ...(d.einheit.kannBeschreibungen ?? []).flatMap((k, i) => lernTexte(`${d.einheit.schluessel}.kann${i + 1}`, k)),
      ...d.lemmata.flatMap((l) =>
        [l.lemma, ...Object.values(l.formen ?? {})].map((text) => ({ ort: l.schluessel, text, religionsbezug: l.religionsbezug ?? false })),
      ),
      ...d.saetze.flatMap((s) =>
        [s.text, ...(s.tokens ?? [])].map((text) => ({ ort: s.schluessel, text, religionsbezug: s.religionsbezug ?? false })),
      ),
      ...d.lektionen.flatMap((l) => [
        ...lernTexte(`${l.schluessel}.ziel`, l.ziel),
        ...l.aufgaben.flatMap((a) => {
          const haupt = hauptVerweis(a);
          return vorlageTexte(a).map((text) => ({ ort: a.schluessel, text, religionsbezug: haupt ? (bezug.get(haupt) ?? false) : false }));
        }),
      ]),
    ];
  }
  const d = datei.daten;
  return [
    ...d.eintraege.flatMap((e) =>
      [e.text, ...(e.alternativen ?? [])].map((text) => ({
        ort: `${e.bezug}@${d.richtung}`,
        text,
        religionsbezug: (e.religionsbezug ?? false) || (bezug.get(e.bezug) ?? false),
      })),
    ),
    ...d.tipps.flatMap((t) =>
      [...(t.titel ? [t.titel] : []), ...tiptapTexte(t.inhalt)].map((text) => ({
        ort: t.schluessel,
        text,
        religionsbezug: t.religionsbezug ?? false,
      })),
    ),
  ];
}

/** Kennzeichen `religionsbezug` aller Lemmata und Sätze der gelesenen Dateien. */
export function kennzeichenVon(dateien: readonly { datei: InhaltDatei }[]): Map<string, boolean> {
  const bezug = new Map<string, boolean>();
  for (const { datei } of dateien)
    if (datei.art === 'sprache')
      for (const x of [...datei.daten.lemmata, ...datei.daten.saetze]) bezug.set(x.schluessel, x.religionsbezug ?? false);
  return bezug;
}

/**
 * Prüft gelesene Inhaltsdateien (`leseDateien`). Ergebnis: Befunde `pfad: ort: Grund` (leer = grün). `bezugExtern`:
 * Kennzeichen von Lemmata und Sätzen, die nur in der Datenbank stehen (Übersetzungen einer geänderten Datei).
 */
export function pruefeReligion(
  dateien: readonly { pfad: string; datei: InhaltDatei }[],
  w: Waechter = ladeWaechter(),
  bezugExtern: ReadonlyMap<string, boolean> = new Map(),
): string[] {
  const bezug = new Map([...bezugExtern, ...kennzeichenVon(dateien)]);
  const befunde: string[] = [];
  for (const { pfad, datei } of dateien) {
    const texte = texteVon(datei, bezug);
    const strom: [string, string][] = [];
    /** Lesart ohne Zeilen- und Absatztrenner (U+2028/U+2029 mitten im Wort) je Text */
    const einzeln: { korpus: 'koran' | 'hadith'; stelle: string; ort: string }[] = [];
    for (const t of texte) {
      const treffer = lexikonTreffer(t.text, w.lexikon);
      if (treffer && t.religionsbezug !== true)
        befunde.push(
          `${pfad}: ${t.ort}: Formel-Lexikon (${treffer.name}) ${t.religionsbezug === null ? 'in einem Text ohne Kennzeichen' : 'ohne religionsbezug: true'}`,
        );
      for (const wort of woerter(t.text)) strom.push([wort, t.ort]);
      if (hatTrenner(t.text)) {
        const v = vierGrammTreffer(t.text, w.index) as { korpus: 'koran' | 'hadith'; stelle: string } | null;
        if (v) einzeln.push({ ...v, ort: t.ort });
      }
    }
    const gemeldet = new Set<string>();
    for (const t of [...(vierGrammStrom(strom, w.index) as { korpus: 'koran' | 'hadith'; stelle: string; ort: string }[]), ...einzeln]) {
      if (gemeldet.has(t.ort)) continue;
      gemeldet.add(t.ort);
      befunde.push(`${pfad}: ${t.ort}: ${t.korpus === 'koran' ? 'Koran' : 'Hadith'}-4-Gramm (${t.stelle})`);
    }
  }
  return befunde;
}
