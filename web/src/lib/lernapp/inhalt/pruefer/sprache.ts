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

/**
 * Bekannte arabische Wörter des kaikki-Kernauszugs in Vergleichsform: alle Formen (Stichwort, Plural, Beugungsformen) und
 * die Wortarten der Stichwörter (Stichwort, Plural).
 */
export type ArabischBekannt = { formen: ReadonlySet<string>; wortarten: ReadonlyMap<string, ReadonlySet<string>> };

/** Nisba bzw. Pronomen der 1. Person (-ī): wird immer abgetrennt (Adjektiv zum Nomen, z. B. „magisch“ zu „Zauber“) */
const AR_NISBA = '\u064A';

/**
 * Arabisch: Vergleichsform mit und ohne Klitika (Wortreste mit mindestens 2 Buchstaben). Mit `bekannt` wird ein bekanntes
 * Wort nicht falsch zerlegt: Ist die ganze Form bekannt, wird kein Klitikum abgetrennt (sonst ergäben die weibliche Form
 * von „groß“ nach ka- oder „weit“ nach bi- Wörter, mit denen sie nichts zu tun haben). Ist die Form bzw. der Rest nach
 * Klitikum oder Artikel ein Stichwort und wäre der Rest ohne Pronomen-Suffix (Tāʾ marbūṭa = Hāʾ) ein Stichwort nur anderer
 * Wortart, wird das Suffix nicht abgetrennt: Die Staatsangehörigkeit (Nomen) ist nicht die weibliche Form des Adjektivs,
 * dessen Nisba sie ist; ein Tanz (Nomen) bleibt eine Form des Nomens Tanz. Ohne `bekannt` wie bisher.
 */
export function arabischeKandidaten(form: string, bekannt?: ArabischBekannt): string[] {
  const ergebnis = new Set([form]);
  const ohneVor = [form];
  if (!bekannt?.formen.has(form))
    for (const v of AR_VORSILBEN) if (form.startsWith(v) && form.length - v.length >= 2) ohneVor.push(form.slice(v.length));
  for (const f of ohneVor) {
    ergebnis.add(f);
    const arten = bekannt?.wortarten.get(f);
    for (const n of AR_NACHSILBEN) {
      if (!f.endsWith(n) || f.length - n.length < 2) continue;
      const rest = f.slice(0, -n.length);
      const restArten = arten && n !== AR_NISBA ? bekannt!.wortarten.get(rest) : undefined;
      if (!restArten || [...restArten].some((a) => arten!.has(a))) ergebnis.add(rest);
    }
  }
  return [...ergebnis];
}

// ——— Teilwörter an Morphemgrenzen (Tabu-Prüfer) ———

/** Deutsche Vorsilben (auch fremde) und Fugenelemente für die Zerlegung des Vorderteils eines Kompositums. */
const DE_VORSILBEN = new Set(
  (
    'ab an auf aus be bei bi dar durch ein ent er ex fort ge gegen her hin hinter homo hetero miss mit nach nicht ober ' +
    'um un unter ur ver vor weg wider zer zu über anti pro extra hyper super ultra mega semi pseudo'
  ).split(' '),
);
const DE_FUGEN = new Set(['s', 'es', 'n', 'en', 'e', 'er', 'ens', 'nen']);
/** Deutsche Ableitungs- und Flexionsendungen (nur für die Zerlegung des ganzen Worts, nach einem Wort oder Stamm) */
const DE_NACHSILBEN = new Set(
  (
    'e en n er ern es em s st t et est te ten tet ung ungen ier ieren iert ierte ierten ierst ierung ierungen lich isch ig ' +
    'heit keit bar sam los schaft chen lein in innen nen ei erei ist ismus ität ion ation end ende'
  ).split(' '),
);

/**
 * Zerlegung in Morpheme: bekannte Wörter (ab 3 Buchstaben), Stämme (Stamm + -en/-n/-e/-te bekannt), Vorsilben; nach einem
 * Wort Fugen und – nur mit `endungen` – Nachsilben.
 */
function deutschZerlegbar(wort: string, bekannt: ReadonlySet<string>, endungen: boolean): boolean {
  const stueck = (s: string) =>
    DE_VORSILBEN.has(s) || (s.length >= 3 && (bekannt.has(s) || ['en', 'n', 'e', 'te'].some((e) => bekannt.has(s + e))));
  // erreichbar[i]: wort.slice(0, i) ist zerlegbar; nachWort[i]: das letzte Stück davor war ein Wort oder Stamm
  const erreichbar = new Array<boolean>(wort.length + 1).fill(false);
  const nachWort = new Array<boolean>(wort.length + 1).fill(false);
  erreichbar[0] = true;
  for (let i = 0; i < wort.length; i++) {
    if (!erreichbar[i]) continue;
    for (let j = i + 1; j <= wort.length; j++) {
      const s = wort.slice(i, j);
      if (stueck(s)) erreichbar[j] = nachWort[j] = true;
      else if (nachWort[i] && (DE_FUGEN.has(s) || (endungen && DE_NACHSILBEN.has(s)))) erreichbar[j] = true;
    }
  }
  return erreichbar[wort.length]!;
}

/**
 * Deutsch: Steht eine Teilwort-Form an Stelle `i` des Worts an einer Morphemgrenze? Am Wortanfang immer; sonst, wenn der
 * Teil davor ein möglicher Vorderteil eines Kompositums ist (bekannte Wörter, Stämme, Vorsilben, Fugen: „Rot|wein“,
 * „Glüh|wein“, „un|partei|isch“). Ist er das nicht, liegt die Form nur dann sicher in einem anderen Morphem, wenn das ganze
 * Wort anders zerlegbar ist (bekanntes Wort, Stamm + Endungen: „Buchstab|ieren“); ein unbekanntes Wort zählt als Grenze.
 */
export function deutscheMorphemgrenze(wort: string, i: number, bekannt: ReadonlySet<string>): boolean {
  if (i === 0 || deutschZerlegbar(wort.slice(0, i), bekannt, false)) return true;
  return !(bekannt.has(wort) || deutschZerlegbar(wort, bekannt, true));
}

const H = '[ıiuü]';
const A = '[ae]';
/** Ableitungen am Nomen, türkisch und entlehnt (alkol-ik, terör-ist, kumar-hane, müzik-al, domuz-cuk, eroin-man …) */
const TR_ABLEITUNG = [
  `l${H}[kğ]?`,
  `s${H}z`,
  `[cç]${H}`,
  `[cç]${H}[kğ]`,
  `${H}st`,
  `${H}zm`,
  `${H}k`,
  `[sş]?[ae]l`,
  `üel`,
  `o(?:loji|log|graf|grafi|grafik)`,
  `(?:graf|grafi|grafik)`,
  `baz`,
  `hane`,
  `ane`,
  `man`,
  `kar`,
  `t?ör`,
  `öz`,
  `tek`,
  `zan`,
].join('|');
const TR_MEHRZAHL = `l${A}r`;
const TR_BESITZ = `${H}m|${H}n|${H}|s${H}|${H}?m${H}z|${H}?n${H}z|l${A}r${H}|m|n`;
const TR_FALL = `[yn]?${H}|[yn]?${A}|n?[dt]${A}n?|n?${H}n|y?l${A}|n?[cç]${A}`;
const TR_KOPULA = `y?${H}m|s${H}n|y?${H}z|s${H}n${H}z|[dt]${H}r|l${A}r|y?[dt]${H}[mnkz]?|y?m${H}ş|y?s${A}|m${H}`;
/**
 * Türkisch: Ist `rest` eine Endungskette am Nomen (Ableitungen, Mehrzahl, Besitz, Fall, -ki, Kopula; ohne Prüfung der
 * Vokalharmonie) oder beginnt er mit -la/-le (Verb aus dem Nomen, Mehrzahl, Instrumental)? Großzügig gefasst: Was hier
 * passt, bleibt ein Treffer.
 */
const TR_ENDUNGEN = new RegExp(
  `^(?:(?:${TR_ABLEITUNG})*l${A}.*|(?:${TR_ABLEITUNG})*(?:${TR_MEHRZAHL})?(?:${TR_BESITZ})?(?:${TR_FALL})?(?:k${H})?(?:${TR_KOPULA})*)$`,
  'u',
);
const tuerkischeEndungen = (rest: string): boolean => TR_ENDUNGEN.test(rest);

/**
 * Türkisch: Das längere bekannte Wort, als das `wort` (beginnt mit der Form `form`) mit Endungen lesbar ist – nur, wenn
 * `form` selbst ein bekanntes Nomen ist (kein Verbstamm, kein Wortstumpf wie „siyas“) und der Rest hinter `form` keine
 * Endungskette ist (Zahlwort 80 gegen das Nomen, dessen Anfang es teilt); sonst null.
 */
export function tuerkischesLaengeresWort(wort: string, form: string, bekannt: ReadonlySet<string>): string | null {
  if (wort === form || !bekannt.has(form) || bekannt.has(`${form}mek`) || bekannt.has(`${form}mak`)) return null;
  if (tuerkischeEndungen(wort.slice(form.length))) return null;
  for (let i = wort.length; i > form.length; i--)
    if (bekannt.has(wort.slice(0, i)) && tuerkischeEndungen(wort.slice(i))) return wort.slice(0, i);
  return null;
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
