import { vorlageTexte } from '../schema';
import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Arabisch: Vokalisierung vollständig, NFC-Reihenfolge“ (PLAN §6.4, blockierend; ADR 0045 Fortschreibung S3 Nr. 3:
 * die Sprachausgabe bekommt immer voll vokalisierte Eingabe). NFC und damit die kanonische Reihenfolge von Schadda und Vokal
 * prüft bereits das Schema (`Text`), hier geht es um fehlende Zeichen.
 *
 * Jeder Buchstabe trägt einen Vokal, Sukun, Tanwin oder Schadda mit Vokal. Ohne Zeichen bleiben dürfen nur:
 * - Alif (auch Madda, Wasla) und Alif maqsura,
 * - Waw nach Damma bzw. Ya nach Kasra (langer Vokal),
 * - das Lam des Artikels nach Alif am Wortanfang (auch nach wa-, fa-, bi-, ka-, li-),
 * - der letzte Buchstabe eines Worts (Pausa): bei Lemmata immer, in Sätzen als Warnung.
 * Schadda ohne Vokal im Wortinneren fehlt ebenfalls. Meldungen nennen Wort und Zeichen nur als Position und Codepunkt.
 */

const BUCHSTABE = /[\u0621-\u063A\u0641-\u064A\u0671]/u;
const ZEICHEN = /[\u064B-\u0655\u0670]/u;
const VOKAL = /[\u064B-\u0650\u0652\u0670]/u;
const SCHADDA = '\u0651';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const OHNE_ZEICHEN_ERLAUBT = new Set(['\u0627', '\u0622', '\u0671', '\u0649']);
const ALIF = new Set(['\u0627', '\u0671']);
const LAM = '\u0644';
const WAW = '\u0648';
const YA = '\u064A';
const KLITIKUM = new Set(['\u0648', '\u0641', '\u0628', '\u0643', '\u0644']);

type Einheit = { buchstabe: string; zeichen: string[] };
export type Luecke = { wort: number; zeichen: number; codepunkt: string; art: 'fehlt' | 'schadda' | 'ende' | 'ohne_buchstabe' };

const cp = (z: string) => `U+${z.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`;

/** Fehlende Vokalzeichen eines arabischen Texts (leer = vollständig vokalisiert). */
export function vokalLuecken(text: string): Luecke[] {
  const luecken: Luecke[] = [];
  const woerter = text
    .normalize('NFC')
    .split(/[^\u0621-\u063A\u0640-\u0655\u0670\u0671]+/u)
    .filter((w) => BUCHSTABE.test(w));
  woerter.forEach((wort, w) => {
    const einheiten: Einheit[] = [];
    for (const z of wort) {
      if (BUCHSTABE.test(z)) einheiten.push({ buchstabe: z, zeichen: [] });
      else if (ZEICHEN.test(z)) {
        if (!einheiten.length) luecken.push({ wort: w + 1, zeichen: 0, codepunkt: cp(z), art: 'ohne_buchstabe' });
        else einheiten[einheiten.length - 1]!.zeichen.push(z);
      }
    }
    einheiten.forEach((e, k) => {
      const vokal = e.zeichen.some((z) => VOKAL.test(z));
      const schadda = e.zeichen.includes(SCHADDA);
      const letzter = k === einheiten.length - 1;
      const ort = { wort: w + 1, zeichen: k + 1, codepunkt: cp(e.buchstabe) };
      if (vokal) return;
      if (schadda) {
        if (!letzter) luecken.push({ ...ort, art: 'schadda' });
        return;
      }
      if (OHNE_ZEICHEN_ERLAUBT.has(e.buchstabe)) return;
      const vorher = einheiten[k - 1];
      if (e.buchstabe === WAW && vorher?.zeichen.includes(DAMMA)) return;
      if (e.buchstabe === YA && vorher?.zeichen.includes(KASRA)) return;
      // Artikel: (Klitikum mit Vokal)? + Alif + Lam
      if (e.buchstabe === LAM && vorher && ALIF.has(vorher.buchstabe) && (k === 1 || (k === 2 && KLITIKUM.has(einheiten[0]!.buchstabe))))
        return;
      luecken.push({ ...ort, art: letzter ? 'ende' : 'fehlt' });
    });
  });
  return luecken;
}

const beschreibe = (l: Luecke) =>
  l.art === 'ohne_buchstabe'
    ? `Wort ${l.wort}: Vokalzeichen ${l.codepunkt} ohne Buchstaben`
    : `Wort ${l.wort}, Zeichen ${l.zeichen} (${l.codepunkt}): ${l.art === 'schadda' ? 'Schadda ohne Vokal' : l.art === 'ende' ? 'Endung ohne Vokalzeichen' : 'ohne Vokalzeichen'}`;

export function pruefeVokalisierung(inhalte: Inhalte): Befunde {
  const b = new Befunde('vokalisierung');
  /** `lemma`: Pausa am Wortende ohne Meldung; `satz`: Pausa als Warnung */
  const pruefe = (datei: string, ort: string, text: string, art: 'lemma' | 'satz') => {
    const luecken = vokalLuecken(text);
    const harte = luecken.filter((l) => l.art !== 'ende');
    if (harte.length)
      b.blockierend(
        datei,
        `nicht voll vokalisiert: ${harte.slice(0, 3).map(beschreibe).join('; ')}${harte.length > 3 ? ` (+${harte.length - 3})` : ''}`,
        ort,
      );
    const enden = luecken.filter((l) => l.art === 'ende');
    if (art === 'satz' && enden.length) b.warnung(datei, `Pausa-Form: ${enden.slice(0, 3).map(beschreibe).join('; ')}`, ort);
  };
  for (const { pfad, daten: d } of inhalte.sprache) {
    if (d.kurs !== 'ar') continue;
    for (const l of d.lemmata) for (const t of [l.lemma, ...Object.values(l.formen ?? {})]) pruefe(pfad, l.schluessel, t, 'lemma');
    for (const s of d.saetze) pruefe(pfad, s.schluessel, s.text, 'satz');
    for (const l of d.lektionen)
      for (const a of l.aufgaben) {
        // eigene Texte der Vorlage in der Zielsprache (Alternativen, Ablenker, Harakat-Varianten, Formentabelle, Pflichtwörter);
        // Sätze darunter (Alternativen ganzer Sätze) mit der Pausa-Warnung wie Sätze
        for (const t of vorlageTexte(a)) pruefe(pfad, a.schluessel, t, /\s/.test(t.trim()) ? 'satz' : 'lemma');
      }
  }
  // Eingabe der Sprachausgabe (Aussprache-Ersatz) immer voll vokalisiert
  for (const { pfad, daten: d } of inhalte.aussprache)
    if (d.sprache === 'ar') d.eintraege.forEach((e, i) => e.ersatz && pruefe(pfad, `eintraege.${i}`, e.ersatz, 'lemma'));
  return b;
}
