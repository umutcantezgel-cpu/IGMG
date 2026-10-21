import { zerlege } from '../../abgleich/tokens';
import type { Sprache } from '../../kurse';
import { normalisiere as normalisiereArabisch, woerter as arabischeWoerter } from '../../waechter/kern.mjs';

/**
 * Sprachwerkzeuge der Prüfer: Wörter eines Texts, Vergleichsform je Sprache und Kandidaten für die Grundform (ohne
 * Morphologie-Bibliothek; Heuristiken genügen für Prüfer mit Toleranz). Keine arabische Schrift in dieser Datei: Zeichen
 * stehen als Codepunkte.
 */

/** Wörter eines Texts (Satzzeichen weg, Schreibung bleibt; wie die Wortbank). */
export const woerterVon = (text: string): string[] => zerlege(text);

/** Vergleichsform eines Worts: de klein und ß → ss (wie wordfreq), tr türkisch klein ohne Zirkumflex, ar wie der Wächter. */
export function vergleichsform(wort: string, sprache: Sprache): string {
  const w = wort.normalize('NFC');
  if (sprache === 'ar') return arabischeWoerter(w).join('');
  if (sprache === 'tr')
    return w
      .toLocaleLowerCase('tr')
      .replace(/[âîû]/g, (z) => ({ â: 'a', î: 'i', û: 'u' })[z]!)
      .replace(/['’].*$/, '');
  return w.toLowerCase().replace(/ß/g, 'ss');
}

/** Arabische Vorsilben (Klitika wa-, fa-, bi-, li-, ka-, al- und Verbindungen) als Codepunkt-Folgen der Vergleichsform. */
const AR_VORSILBEN = [
  '\u0648\u0627\u0644',
  '\u0641\u0627\u0644',
  '\u0628\u0627\u0644',
  '\u0643\u0627\u0644',
  '\u0644\u0644',
  '\u0627\u0644',
  '\u0648',
  '\u0641',
  '\u0628',
  '\u0644',
  '\u0643',
];
/** Arabische Pronomen-Suffixe (Vergleichsform: Ta marbuta bereits als Ha). */
const AR_NACHSILBEN = [
  '\u0647\u0645\u0627',
  '\u0643\u0645\u0627',
  '\u0647\u0645',
  '\u0647\u0646',
  '\u0643\u0645',
  '\u0643\u0646',
  '\u0646\u0627',
  '\u0646\u064A',
  '\u0647\u0627',
  '\u0647',
  '\u0643',
  '\u064A',
];

/** Arabisch: Vergleichsform mit und ohne Klitika (Wortreste mit mindestens 2 Buchstaben). */
export function arabischeKandidaten(form: string): string[] {
  const ergebnis = new Set([form]);
  const ohneVor = [form];
  for (const v of AR_VORSILBEN) if (form.startsWith(v) && form.length - v.length >= 2) ohneVor.push(form.slice(v.length));
  for (const f of ohneVor) {
    ergebnis.add(f);
    for (const n of AR_NACHSILBEN) if (f.endsWith(n) && f.length - n.length >= 2) ergebnis.add(f.slice(0, -n.length));
  }
  return [...ergebnis];
}

/** Deutsche Endungen der Flexion (Verb, Nomen, Adjektiv); Kandidaten mit Infinitiv-Endung dazu. */
const DE_ENDUNGEN = ['est', 'et', 'st', 'en', 'em', 'er', 'es', 'e', 'n', 't', 's'];

/**
 * Kandidaten der Grundform zu einer Vergleichsform: das Wort selbst; de ohne Endung bzw. mit -en/-n; tr alle Anfänge ab
 * 3 Buchstaben (agglutinierend); ar ohne Klitika.
 */
export function grundformKandidaten(form: string, sprache: Sprache): string[] {
  if (sprache === 'ar') return arabischeKandidaten(form);
  const ergebnis = new Set([form]);
  if (sprache === 'de') {
    for (const e of DE_ENDUNGEN)
      if (form.endsWith(e) && form.length - e.length >= 3) {
        const stamm = form.slice(0, -e.length);
        ergebnis.add(stamm);
        ergebnis.add(`${stamm}en`);
        ergebnis.add(`${stamm}n`);
        ergebnis.add(`${stamm}e`);
      }
    // Umlaut im Plural (Häuser → Haus): grob ohne Umlaut
    if (/[äöü]/.test(form)) ergebnis.add(form.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/er$/, ''));
  } else for (let i = form.length - 1; i >= 3; i--) ergebnis.add(form.slice(0, i));
  return [...ergebnis];
}

/** Grundform-Schlüssel eines Lemmas: tr-Verben zusätzlich ohne -mek/-mak (Stamm), de-Verben ohne -en/-n. */
export function lemmaSchluessel(lemma: string, sprache: Sprache): string[] {
  const f = vergleichsform(lemma, sprache);
  const ergebnis = new Set([f]);
  if (sprache === 'tr' && /m[ae]k$/.test(f) && f.length >= 5) ergebnis.add(f.slice(0, -3));
  return [...ergebnis].filter(Boolean);
}

/** Arabische Vergleichsform eines Worts aus einer Häufigkeitsliste (ohne Zeichen, Alif und Ya vereinheitlicht). */
export const arabischNormal = (wort: string): string => normalisiereArabisch(wort).replace(/\s+/g, '');

/** Zahlen, einzelne Zeichen und Platzhalter in eckigen Klammern zählen nicht als Wortschatz. */
export const istZahlOderZeichen = (wort: string): boolean =>
  /^[\d\u0660-\u0669.,:/%-]+$/.test(wort) || [...wort].length < 2 || /^\[.*\]$/.test(wort);

/** Sätze eines Texts (an . ! ? … und dem arabischen Fragezeichen). */
export function saetzeVon(text: string): string[] {
  return text
    .split(/(?<=[.!?…\u061F])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);
}
