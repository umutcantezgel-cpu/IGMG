#!/usr/bin/env node
/**
 * OpenITI-Passagen (Lauf „Lern-App“, Spike S8, PLAN §6.7 Nr. 2, ADR 0040 Nr. 4, ADR 0045 Nr. 12).
 *
 * Schneidet eine LOKALE OpenITI-Datei (mARkdown) in einen Passagen-Index und ordnet die Kapitel den Lehrplanthemen des
 * Wissenskurses zu. Ohne Abhängigkeiten (Node ≥ 20).
 *
 * Lizenz der Eingabe: OpenITI steht unter CC BY-NC-SA 4.0. Datei und Index bleiben lokal (Scratchpad oder ein Ordner
 * außerhalb des Repositorys). Das Werkzeug verweigert Ein- und Ausgabe innerhalb des Repositorys. Ins Repository kommen nur
 * Passagen-Kennungen und Metadaten (Version-URI, SHA-256, Ausgabe), nie Text oder Markup.
 *
 * KI-Regel 2 (ADR 0040, KERN 4.0 §2): Diese Datei enthält keine arabische Schrift. Arabische Schlüsselwörter stehen in
 * Buckwalter-Umschrift (ASCII) und werden erst zur Laufzeit über die Codepunkt-Tabelle `BW` in Arabisch umgesetzt.
 *
 * Aufruf:
 *   node openiti-passagen.mjs index <datei> --werk <kennung> --aus <verzeichnis>
 *        [--uri <version-uri>] [--sha256 <erwartet>] [--standard-thema <thema>] [--korrektur <json>]
 *        [--gliederung auto|ueberschriften|absatznummern]
 *   node openiti-passagen.mjs pruefe <index.json> [--datei <pfad>]
 *   node openiti-passagen.mjs text <index.json> <werk.msNNNN> [--roh] [--datei <pfad>]
 *   node openiti-passagen.mjs abdeckung <index.json> [<index.json> …]
 *
 * Begriffe:
 *   Passage   = Text zwischen zwei OpenITI-Meilensteinen (≈ 300 Wörter). Passage N endet mit dem Token „msN“ (einschließlich);
 *               Kennung `<werk>.msNNNN`. Text nach dem letzten Meilenstein wird zur Passage N+1 (`rest: true`).
 *   Zeichen   = UTF-16-Codeeinheiten der dekodierten Datei (wie JavaScript `String.slice`, Byte-Order-Mark mitgezählt);
 *               dazu der Byte-Bereich der Datei. `sha256` = SHA-256 der Rohbytes der Passage (mit Markup),
 *               `sha256Text` = SHA-256 des bereinigten Texts (ohne Markup, UTF-8).
 *   Kapitel   = Überschrift bis zur nächsten Überschrift gleicher oder höherer Ebene.
 *   Seite     = Band und Seite der Druckvorlage nach den OpenITI-Seitenmarken `PageV<band>P<seite>`. Die Marke steht am
 *               Seitenende (Text vor der Marke gehört zu dieser Seite). Angabe `V01P079`; ±1 Seite möglich, am Druck prüfen.
 *               Text nach der letzten Marke hat keine Seite (`null`).
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const WERKZEUG = { name: 'openiti-passagen', version: '1.2.0' };

// ---------------------------------------------------------------------------------------------------------------------
// Buckwalter-Umschrift ↔ Arabisch (nur Codepunkte, keine arabische Schrift im Quelltext)
// ---------------------------------------------------------------------------------------------------------------------

/** Buckwalter-Zeichen → Codepunkt. */
export const BW = {
  "'": 0x0621, '|': 0x0622, '>': 0x0623, '&': 0x0624, '<': 0x0625, '}': 0x0626, A: 0x0627, b: 0x0628, p: 0x0629,
  t: 0x062a, v: 0x062b, j: 0x062c, H: 0x062d, x: 0x062e, d: 0x062f, '*': 0x0630, r: 0x0631, z: 0x0632, s: 0x0633,
  $: 0x0634, S: 0x0635, D: 0x0636, T: 0x0637, Z: 0x0638, E: 0x0639, g: 0x063a, _: 0x0640, f: 0x0641, q: 0x0642,
  k: 0x0643, l: 0x0644, m: 0x0645, n: 0x0646, h: 0x0647, w: 0x0648, Y: 0x0649, y: 0x064a,
  F: 0x064b, N: 0x064c, K: 0x064d, a: 0x064e, u: 0x064f, i: 0x0650, '~': 0x0651, o: 0x0652, '`': 0x0670, '{': 0x0671,
};
const BW_ZURUECK = Object.fromEntries(Object.entries(BW).map(([k, v]) => [String.fromCodePoint(v), k]));

/** Buckwalter → Arabisch (Leerzeichen und andere Zeichen bleiben). */
export function ar(buckwalter) {
  let aus = '';
  for (const z of buckwalter) aus += z in BW ? String.fromCodePoint(BW[z]) : z;
  return aus;
}

/** Arabisch → Buckwalter (nicht abgebildete Zeichen bleiben). */
export function bw(text) {
  let aus = '';
  for (const z of text) aus += BW_ZURUECK[z] ?? z;
  return aus;
}

const HARAKAT = /[\u{64B}-\u{65F}\u{670}\u{6D6}-\u{6ED}\u{640}]/gu;
const ZIFFERN_OST = /[\u{660}-\u{669}\u{6F0}-\u{6F9}]/gu;

/** Entfernt Vokalzeichen und Tatweel (Hamza- und Alif-Formen bleiben). */
export function ohneHarakat(text) {
  return text.replace(HARAKAT, '');
}

/** Vereinheitlicht für den Abgleich: ohne Harakat/Tatweel, Alif-Formen → Alif, Alif maqsura → Ya, Ta marbuta → Ha,
 *  Hamza auf Waw/Ya → Waw/Ya, persische Varianten → arabisch, östliche Ziffern → 0–9. */
export function vereinheitliche(text) {
  return ohneHarakat(text)
    .replace(/[\u{622}\u{623}\u{625}\u{671}]/gu, '\u{627}')
    .replace(/[\u{649}\u{6CC}]/gu, '\u{64A}')
    .replace(/\u{629}/gu, '\u{647}')
    .replace(/\u{624}/gu, '\u{648}')
    .replace(/\u{626}/gu, '\u{64A}')
    .replace(/\u{6A9}/gu, '\u{643}')
    .replace(ZIFFERN_OST, (z) => String((z.codePointAt(0) & 0xf) % 10));
}

/** Lesbare maschinelle Umschrift ohne Vokale (nur zur Orientierung, nicht wissenschaftlich). */
const UMSCHRIFT = {
  0x0621: 'ʾ', 0x0622: 'ʾā', 0x0623: 'ʾ', 0x0624: 'ʾ', 0x0625: 'ʾ', 0x0626: 'ʾ', 0x0627: 'ā', 0x0628: 'b', 0x0629: 'a',
  0x062a: 't', 0x062b: 'th', 0x062c: 'j', 0x062d: 'ḥ', 0x062e: 'kh', 0x062f: 'd', 0x0630: 'dh', 0x0631: 'r',
  0x0632: 'z', 0x0633: 's', 0x0634: 'sh', 0x0635: 'ṣ', 0x0636: 'ḍ', 0x0637: 'ṭ', 0x0638: 'ẓ', 0x0639: 'ʿ',
  0x063a: 'gh', 0x0641: 'f', 0x0642: 'q', 0x0643: 'k', 0x0644: 'l', 0x0645: 'm', 0x0646: 'n', 0x0647: 'h',
  0x0648: 'w', 0x0649: 'ā', 0x064a: 'y', 0x0671: 'a', 0x060c: ',', 0x061b: ';', 0x061f: '?', 0x06cc: 'y', 0x06a9: 'k',
};
export function umschrift(text) {
  const woerter = ohneHarakat(text).replace(ZIFFERN_OST, (z) => String((z.codePointAt(0) & 0xf) % 10)).split(/(\s+)/u);
  return woerter
    .map((wort) => {
      if (/^\s+$/u.test(wort)) return ' ';
      let w = wort;
      let vorne = '';
      const vor = { 0x0648: 'wa-', 0x0641: 'fa-', 0x0628: 'bi-' }[w.codePointAt(0)];
      if (vor && w.slice(1, 3) === '\u{627}\u{644}' && w.length > 4) {
        vorne = `${vor}l-`;
        w = w.slice(3);
      } else if (w.startsWith('\u{627}\u{644}') && w.length > 3) {
        vorne = 'al-';
        w = w.slice(2);
      }
      let aus = '';
      const zeichen = [...w];
      zeichen.forEach((z, i) => {
        const cp = z.codePointAt(0);
        if (cp === 0x0627 && i === 0) aus += 'a';
        else if (cp === 0x0629 && i > 0 && zeichen[i - 1] === '\u{627}') aus += 'h'; // -āh statt -āa
        else aus += UMSCHRIFT[cp] ?? z;
      });
      return vorne + aus;
    })
    .join('')
    .trim();
}

// ---------------------------------------------------------------------------------------------------------------------
// Lehrplanthemen (14 Module des genehmigten Plans §3.1 „Wissen“; Bereiche nach `_lernapp/PLAN.md` §5.2)
// ---------------------------------------------------------------------------------------------------------------------

export const THEMEN = [
  { id: 'aqaid', umschrift: 'ʿaqāʾid', name: 'Glaube nach maturiditischer Lehre', bereich: 'Akaid' },
  { id: 'taharah', umschrift: 'ṭahāra', name: 'Reinheit', bereich: 'Taharah' },
  { id: 'salah', umschrift: 'ṣalāh', name: 'Gebet', bereich: 'Salah' },
  { id: 'sawm', umschrift: 'ṣawm', name: 'Fasten', bereich: 'Sawm' },
  { id: 'zakah', umschrift: 'zakāh', name: 'Zakat und Ṣadaqat al-Fiṭr', bereich: 'Zakat' },
  { id: 'hajj', umschrift: 'ḥajj wa-ʿumra', name: 'Hadsch und Umra', bereich: 'Hajj/Umra' },
  { id: 'udhiyya', umschrift: 'uḍḥiyya', name: 'Opfer', bereich: 'Halal/Haram und Alltag' },
  { id: 'nikah', umschrift: 'nikāḥ', name: 'Ehe-Grundlagen', bereich: 'Halal/Haram und Alltag' },
  { id: 'halal-haram', umschrift: 'al-ḥaẓr wa-l-ibāḥa', name: 'Erlaubtes und Verbotenes im Alltag', bereich: 'Halal/Haram und Alltag' },
  { id: 'speisen-erwerb', umschrift: 'aṭʿima wa-kasb', name: 'Speisen und Erwerb', bereich: 'Halal/Haram und Alltag' },
  { id: 'adab', umschrift: 'akhlāq wa-ādāb', name: 'Ethik und Adab', bereich: 'Akhlaq/Adab' },
  { id: 'sira', umschrift: 'sīra', name: 'Prophetenbiografie', bereich: 'Siyar und Geschichte' },
  { id: 'usul', umschrift: 'uṣūl', name: 'Grundlagen der Rechtsquellen', bereich: 'Grundwissen Koran/Hadith/Fiqh' },
  { id: 'taqwim', umschrift: 'taqwīm', name: 'Kalender und besondere Tage', bereich: 'quer (Salah, Sawm, Hajj)' },
];
const THEMA_IDS = new Set(THEMEN.map((t) => t.id));

/**
 * Zuordnungsregeln: Wortfolgen in vereinheitlichter Buckwalter-Umschrift (Alif-Formen = A, Ta marbuta = h, Alif maqsura = y).
 * `roh`: Abgleich ohne Vereinheitlichung (nur Harakat entfernt), z. B. um al-īmān (Glaube) von al-aymān (Eide) zu trennen.
 * Ein Wort im Titel passt auch mit vorangestelltem w/f/b/l/k („und“, „mit“ …). Absichtlich NICHT erfasst:
 * „al-qirān“ (fällt mit „al-qurʾān“ zusammen), „as-siyar“ (Kriegsrecht, nicht Sīra), „al-mawāqīt“ (Gebetszeiten und Miqāt),
 * „al-jamāʿa“ (auch „ahl as-sunna wa-l-jamāʿa“), „al-aymān“ (Eide), „an-nafl“ (auch Beuteanteil), „al-ʿushr“ (auch „die
 * letzten zehn“), „al-iḥrām“ (auch „takbīrat al-iḥrām“), „al-hady“ (fällt mit „al-hudā“ zusammen), „al-ashhur“,
 * „al-fatwā“ (in Radd al-Muḥtār meist Fallberichte „ḥādithat al-fatwā“, keine Uṣūl-Kapitel). Solche
 * Kapitel erben das Thema des Oberkapitels.
 */
export const REGELN = [
  // Reinheit
  { thema: 'taharah', worte: ['AlThArh', 'AlThArAt'], label: 'aṭ-ṭahāra' },
  { thema: 'taharah', worte: ["AlwDw'"], label: 'al-wuḍūʾ' },
  { thema: 'taharah', worte: ['Algsl', 'AlAgtsAl'], label: 'al-ghusl' },
  { thema: 'taharah', worte: ['Altymm'], label: 'at-tayammum' },
  { thema: 'taharah', worte: ['Alxfyn'], label: 'al-masḥ ʿalā l-khuffayn' },
  { thema: 'taharah', worte: ['AlHyD', 'AlnfAs', 'AlAstHADh'], label: 'al-ḥayḍ wa-n-nifās' },
  { thema: 'taharah', worte: ['AlAnjAs', 'AlnjAsh', 'AlnjAsAt'], label: 'an-najāsa' },
  { thema: 'taharah', worte: ['AlmyAh', "AlmA'", 'AlAbAr', 'Albyr'], label: 'al-miyāh' },
  { thema: 'taharah', worte: ["AlAstnjA'"], label: 'al-istinjāʾ' },
  // Gebet
  { thema: 'salah', worte: ['AlSlAh', 'SlAh', 'AlSlwAt'], label: 'aṣ-ṣalāh' },
  { thema: 'salah', worte: ['AlA*An'], label: 'al-adhān' },
  { thema: 'salah', worte: ['AlAmAmh'], label: 'al-imāma' },
  { thema: 'salah', worte: ['Alwtr', 'AlnwAfl', 'AltrAwyH'], label: 'al-witr wa-n-nawāfil' },
  { thema: 'salah', worte: ['Alshw', 'AltlAwh'], label: 'sujūd as-sahw / at-tilāwa' },
  { thema: 'salah', worte: ['AlmsAfr', 'Alsfr'], label: 'ṣalāt al-musāfir' },
  { thema: 'salah', worte: ['AljmEh'], label: 'al-jumuʿa' },
  { thema: 'salah', worte: ['AlEydyn', 'AlEyd'], label: 'al-ʿīdayn' },
  { thema: 'salah', worte: ['Alkswf', 'Alxswf', "AlAstsqA'", 'Alxwf'], label: 'al-kusūf / al-istisqāʾ / al-khawf' },
  { thema: 'salah', worte: ['AljnAyz', 'AljnAzh', 'Al$hyd'], label: 'al-janāʾiz' },
  { thema: 'salah', worte: ['AlfwAyt'], label: 'qaḍāʾ al-fawāʾit' },
  { thema: 'salah', worte: ['Almsjd', 'AlmsAjd', 'Alqblh'], label: 'al-masjid / al-qibla' },
  // Fasten
  { thema: 'sawm', worte: ['AlSwm', 'AlSyAm', 'AlSAym', 'rmDAn'], label: 'aṣ-ṣawm' },
  { thema: 'sawm', worte: ['AlAEtkAf'], label: 'al-iʿtikāf' },
  // Zakat
  { thema: 'zakah', worte: ['AlzkAh', 'zkAh'], label: 'az-zakāh' },
  { thema: 'zakah', worte: ['Sdqh AlfTr'], label: 'ṣadaqat al-fiṭr' },
  // Hadsch
  { thema: 'hajj', worte: ['AlHj', 'AlEmrh', 'AlmnAsk'], label: 'al-ḥajj wa-l-ʿumra' },
  { thema: 'hajj', worte: ['AlTwAf', 'AlAHSAr'], label: 'aṭ-ṭawāf / al-iḥṣār' },
  // Opfer
  { thema: 'udhiyya', worte: ['AlADHyh', 'AlADAHy', 'AlEqyqh'], label: 'al-uḍḥiyya' },
  // Ehe
  { thema: 'nikah', worte: ['AlnkAH'], label: 'an-nikāḥ' },
  { thema: 'nikah', worte: ['AlTlAq', 'AlxlE', 'AlEdh'], label: 'aṭ-ṭalāq / al-ʿidda' },
  { thema: 'nikah', worte: ['AlrDAE', 'AlHDAnh', 'Alnfqh', 'AlnfqAt'], label: 'ar-raḍāʿ / al-ḥaḍāna / an-nafaqa' },
  // Erlaubtes und Verbotenes
  { thema: 'halal-haram', worte: ['AlkrAhyh', 'AlkrAhh', 'AlAstHsAn'], label: 'al-karāhiya wa-l-istiḥsān' },
  { thema: 'halal-haram', worte: ['AlHZr', 'AlAbAHh'], label: 'al-ḥaẓr wa-l-ibāḥa' },
  { thema: 'halal-haram', worte: ['AllbAs', 'Allbs'], label: 'al-libās' },
  // Speisen und Erwerb
  { thema: 'speisen-erwerb', worte: ['Al*bAyH', 'AlSyd', 'AlATEmh', 'AlA$rbh'], label: 'adh-dhabāʾiḥ / aṣ-ṣayd / al-aṭʿima / al-ashriba' },
  { thema: 'speisen-erwerb', worte: ['AlbywE', 'AlbyE', 'AlrbA', 'AlSrf', 'Alslm'], label: 'al-buyūʿ / ar-ribā / aṣ-ṣarf' },
  { thema: 'speisen-erwerb', worte: ['AlAjArh', 'AlAjArAt', 'Alksb'], label: 'al-ijāra / al-kasb' },
  // Ethik und Adab
  { thema: 'adab', worte: ['AlAdAb', 'AdAb', 'AlAdb', 'AlAxlAq'], label: 'al-ādāb / al-akhlāq' },
  // Prophetenbiografie
  { thema: 'sira', worte: ['Alsyrh', 'Al$mAyl', 'mwld', 'Alhjrh', "AbnA' rswl Allh"], label: 'as-sīra' },
  // Grundlagen der Rechtsquellen
  { thema: 'usul', worte: ['AlAjthAd', 'Altqlyd', 'Almfty', 'ASwl Alfqh', 'TbqAt', 'Alm*hb'], label: 'al-ijtihād / at-taqlīd / al-muftī' },
  // Kalender und besondere Tage
  { thema: 'taqwim', worte: ['AlhlAl', 'lylh Alqdr', 'ywm Erfh', "EA$wrA'", 'Alt$ryq', 'AlEydyn', 'AlEyd'], label: 'al-hilāl / al-ʿīdayn / al-ayyām' },
  // Glaube
  { thema: 'aqaid', worte: ['AltwHyd', 'AlEqydh', 'AlEqAyd', 'ASwl Aldyn'], label: 'at-tawḥīd / al-ʿaqīda' },
  { thema: 'aqaid', roh: ['Al<ymAn', '<ymAn'], label: 'al-īmān' },
];

/** Unterthemen des Glaubens; nur angewandt, wenn das Hauptthema `aqaid` ist. */
export const UNTERTHEMEN_AQAID = [
  { unterthema: 'tawhid', worte: ['wHdAnyh', 'AltwHyd', 'mErftnA', 'mErfh'], label: 'at-tawḥīd' },
  { unterthema: 'sifat', worte: ['AlSfAt', 'SfAt', 'Alqrb'], label: 'aṣ-ṣifāt' },
  { unterthema: 'kutub', worte: ['AlqrAn', 'AlktAb', 'Alktb'], label: 'al-kutub / al-qurʾān' },
  { unterthema: 'qadar', worte: ['Alqdr', "AlqDA'", 'AlTAEAt', 'AlmEASy'], label: 'al-qadar' },
  { unterthema: 'ruya', worte: ['rwyh', 'Alrwyh'], label: 'ar-ruʾya' },
  { unterthema: 'akhira', worte: ['AlAxrh', 'Alqbr', 'AlsAEh', 'Al$fAEh', 'AlmyzAn', 'AlHwD', 'Aljnh', 'AlnAr', 'AlbEv'], label: 'al-ākhira' },
  { unterthema: 'nubuwwa', worte: ["AlAnbyA'", 'Alrswl', 'rswl', 'Alnbwh', 'ESmh', 'krAmAt', "AlAwlyA'"], label: 'an-nubuwwa' },
  { unterthema: 'sahaba', worte: ['AlSHAbh'], label: 'aṣ-ṣaḥāba' },
  { unterthema: 'malaika', worte: ['AlmlAykh'], label: 'al-malāʾika' },
  { unterthema: 'iman', worte: ['AlAymAn', 'AlAslAm', 'ykfr', 'Al*nb', 'ftr'], label: 'al-īmān wa-l-islām' },
];

/** Ebene aus dem ersten Wort des Titels (vereinheitlichte Buckwalter-Umschrift). */
export const EBENEN_WORTE = [
  [1, ['ktAb']],
  [2, ['bAb', 'AbwAb']],
  [3, ['fSl', 'fSwl']],
  [4, ['mTlb', 'frE', 'frwE', 'mbHv', 'bHv', 'msAlh', 'msAyl', 'tnbyh', 'tnbyhAt', 'fAydh', 'ttmh']],
];

const VORSILBEN = ['\u{648}', '\u{641}', '\u{628}', '\u{644}', '\u{643}']; // w f b l k

function zerlegeWorte(titel) {
  return titel
    .split(/[\s\u{60C}\u{61B}\u{61F}.,:;()[\]{}«»"'\-–—!?/\\*+=<>|]+/u)
    .filter((w) => /\p{L}/u.test(w));
}

function varianten(wort) {
  const v = new Set([wort]);
  if (wort.length > 3 && VORSILBEN.includes(wort[0])) v.add(wort.slice(1));
  if (wort.startsWith('\u{644}\u{644}') && wort.length > 3) v.add('\u{627}\u{644}' + wort.slice(2)); // li-l- → al-
  return v;
}

/** Prüft, ob eine Wortfolge (Arabisch, gleiche Normalform) in den Titelwörtern vorkommt. */
function enthaeltFolge(titelWorte, folge) {
  if (!folge.length) return false;
  for (let i = 0; i + folge.length <= titelWorte.length; i++) {
    let ok = true;
    for (let j = 0; j < folge.length; j++) {
      if (!varianten(titelWorte[i + j]).has(folge[j])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}

const vorbereitet = new WeakMap();
function bereite(regel) {
  let r = vorbereitet.get(regel);
  if (!r) {
    r = {
      worte: (regel.worte ?? []).map((f) => ar(f).split(' ')),
      roh: (regel.roh ?? []).map((f) => ar(f).split(' ')),
    };
    vorbereitet.set(regel, r);
  }
  return r;
}

/** Alle Regeln, die auf einen Titel passen (in Regelreihenfolge). */
export function passendeRegeln(titel, regeln = REGELN) {
  const einheitlich = zerlegeWorte(vereinheitliche(titel));
  const roh = zerlegeWorte(ohneHarakat(titel));
  return regeln.filter((regel) => {
    const r = bereite(regel);
    return r.worte.some((f) => enthaeltFolge(einheitlich, f)) || r.roh.some((f) => enthaeltFolge(roh, f));
  });
}

/** Ebene aus dem Schlüsselwort am Titelanfang oder `null`. */
export function ebeneAusTitel(titel) {
  const [erstes] = zerlegeWorte(vereinheitliche(titel));
  if (!erstes) return null;
  for (const [ebene, worte] of EBENEN_WORTE) {
    if (worte.some((w) => varianten(erstes).has(ar(w)))) return ebene;
  }
  return null;
}

// ---------------------------------------------------------------------------------------------------------------------
// mARkdown lesen
// ---------------------------------------------------------------------------------------------------------------------

const KOPF_ENDE = '#META#Header#End#';
const MEILENSTEIN = /(?<![A-Za-z])ms(\d+)(?![A-Za-z0-9])/g;
const SEITENMARKE = /PageV(\d+)P(\d+)/g;
// HTML-Reste der Shamela-Abzüge (z. B. Seitenkopf-Matn in Kommentarwerken); ein Meilenstein kann mitten im Tag stehen,
// dann ist das Tag an der Passagengrenze abgeschnitten (Rest am Ende bzw. Attributrest am Anfang).
const HTML_TAG = /<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>\n]*)?(?:>|$)/gm;
const HTML_ATTRIBUTREST = /^[ \t]*(?:[A-Za-z-]+="[^"\n]*"[ \t]*)+\/?>/gm;
const MARKUP_ZEICHEN = /PageV\d+P\d+|(?<![A-Za-z])ms\d+(?![A-Za-z0-9])|@[A-Z][A-Z0-9_]*@?|AUTO|~~|#+|\|+|<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>\n]*)?>?|[A-Za-z-]+="[^"\n]*"\/?>?/g;
const UEBERSCHRIFT = /^(?:###|#) (\|+)(\d*)[ \t]*(.*)$/;
const ABSATZNUMMER = /^# (\d{1,4})[ \t]/;
const MARKUP_ANFANG = /(?:\s+|~~|#+|\|+|PageV\d+P\d+|ms\d+|@[A-Z][A-Z0-9_]*@?|AUTO|\$|<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>\n]*)?>?|[A-Za-z-]+="[^"\n]*"\/?>?|[\d\p{P}\p{S}]+)*/uy;

/** Bereinigt einen Titel: Markup, „AUTO n -“, eckige Klammern und JK-Endnummer entfernen. */
export function titelBereinigen(roh, nummeriert = false) {
  let t = roh
    .replace(/PageV\d+P\d+/g, ' ')
    .replace(MEILENSTEIN, ' ')
    .replace(/@[A-Z][A-Z0-9_]*@?/g, ' ')
    .replace(/^AUTO\s*(?:\d+\s*-\s*)?/, '')
    .replace(/[[\]]/g, ' ');
  if (nummeriert) t = t.replace(/\s+\d+\s*$/, '');
  return t.replace(/\s+/g, ' ').trim();
}

/** Text ohne OpenITI-Markup (für die lokale Lieferung an den Entwurf; nie ausliefern). */
export function bereinige(roh) {
  return roh
    .replace(/\r/g, '')
    .replace(/\n~~/g, ' ')
    .replace(/PageV\d+P\d+/g, ' ')
    .replace(MEILENSTEIN, ' ')
    .replace(/@[A-Z][A-Z0-9_]*@?/g, ' ')
    .replace(HTML_TAG, ' ')
    .replace(HTML_ATTRIBUTREST, ' ')
    .split('\n')
    .map((zeile) =>
      zeile
        .replace(/^~~/, '')
        .replace(/^(?:###|#) \|+\d*[ \t]*(?:AUTO\s*(?:\d+\s*-\s*)?)?/, '')
        .replace(/^### \$+/, '')
        .replace(/^#+ ?/, '')
        .replace(/[[\]]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim(),
    )
    .filter(Boolean)
    .join('\n');
}

/** Zählt Wörter (Buchstabenfolgen) im bereinigten Text. */
export function zaehleWoerter(bereinigt) {
  return (bereinigt.match(/\p{L}[\p{L}\p{M}]*/gu) ?? []).length;
}

/**
 * Liest Kopf, Überschriften, Absatznummern, Meilensteine und Seitenmarken.
 * @returns {{ rumpfAnfang:number, ueberschriften:object[], absatznummern:object[], meilensteine:object[], seiten:object[] }}
 */
export function lies(text) {
  const k = text.indexOf(KOPF_ENDE);
  let rumpfAnfang = 0;
  if (k >= 0) {
    const nl = text.indexOf('\n', k);
    rumpfAnfang = nl >= 0 ? nl + 1 : text.length;
  }
  const ueberschriften = [];
  const absatznummern = [];
  let pos = rumpfAnfang;
  let zeileNr = text.slice(0, rumpfAnfang).split('\n').length;
  while (pos < text.length) {
    let ende = text.indexOf('\n', pos);
    if (ende < 0) ende = text.length;
    const zeile = text.slice(pos, ende).replace(/\r$/, '');
    const m = UEBERSCHRIFT.exec(zeile);
    if (m) ueberschriften.push({ von: pos, zeile: zeileNr, striche: m[1].length, nummer: m[2] ? Number(m[2]) : null, roh: m[3] });
    else {
      const a = ABSATZNUMMER.exec(zeile);
      if (a) absatznummern.push({ von: pos, zeile: zeileNr, nummer: Number(a[1]) });
    }
    pos = ende + 1;
    zeileNr++;
  }
  const meilensteine = [];
  MEILENSTEIN.lastIndex = rumpfAnfang;
  for (let m; (m = MEILENSTEIN.exec(text)); ) meilensteine.push({ nummer: Number(m[1]), von: m.index, bis: m.index + m[0].length });
  const seiten = [];
  SEITENMARKE.lastIndex = rumpfAnfang;
  for (let m; (m = SEITENMARKE.exec(text)); ) seiten.push({ von: m.index, marke: `V${m[1]}P${m[2]}` });
  return { rumpfAnfang, ueberschriften, absatznummern, meilensteine, seiten };
}

/** Seite (Marke am Seitenende) für eine Zeichenposition: erste Seitenmarke ab `pos`, sonst `null`. */
export function seiteAn(seiten, pos) {
  let lo = 0;
  let hi = seiten.length;
  while (lo < hi) {
    const mitte = (lo + hi) >> 1;
    if (seiten[mitte].von < pos) lo = mitte + 1;
    else hi = mitte;
  }
  return lo < seiten.length ? seiten[lo].marke : null;
}

/** Position des letzten Inhaltszeichens (Buchstabe außerhalb von Markup) im Bereich [von, bis), sonst `von`. */
function letztesInhaltszeichen(text, von, bis) {
  const maskiert = text.slice(von, bis).replace(MARKUP_ZEICHEN, (m) => ' '.repeat(m.length));
  for (let i = maskiert.length - 1; i >= 0; i--) if (/\p{L}/u.test(maskiert[i])) return von + i;
  return von;
}

// ---------------------------------------------------------------------------------------------------------------------
// Kapitel bilden und zuordnen
// ---------------------------------------------------------------------------------------------------------------------

/** Ordnet jeder Überschrift eine Ebene zu, verwirft Rauschen und baut die Kapitelhierarchie. */
export function bildeKapitel(text, gelesen, { gliederung = 'auto' } = {}) {
  const warnungen = [];
  const roh = gelesen.ueberschriften.map((u) => ({ ...u, titel: titelBereinigen(u.roh, u.nummer !== null) }));
  // Rauschen: leere Titel, Markierungen wie „EDITOR|“, häufig wiederholte Titel ohne Gliederungswort (Kolumnentitel)
  const haeufigkeit = new Map();
  for (const u of roh) haeufigkeit.set(vereinheitliche(u.titel), (haeufigkeit.get(vereinheitliche(u.titel)) ?? 0) + 1);
  const schwelle = Math.max(20, Math.ceil(roh.length * 0.05));
  const verworfen = new Map();
  const gueltig = [];
  for (const u of roh) {
    const schluessel = vereinheitliche(u.titel);
    let grund = null;
    if (!/\p{L}/u.test(u.titel)) grund = 'leer';
    else if (/^[A-Z]+\|/.test(u.roh)) grund = 'markierung';
    else if (u.nummer === null && u.striche === 1 && ebeneAusTitel(u.titel) === null && haeufigkeit.get(schluessel) >= schwelle) grund = 'kolumnentitel';
    if (grund) {
      const k = grund === 'leer' ? 'leer' : `${grund}:${umschrift(u.titel)}`;
      verworfen.set(k, (verworfen.get(k) ?? 0) + 1);
    } else gueltig.push(u);
  }
  for (const [k, n] of verworfen) warnungen.push(`Überschrift verworfen (${k}) × ${n}`);

  let art = gliederung;
  if (art === 'auto') art = gueltig.length === 0 && gelesen.absatznummern.length >= 10 ? 'absatznummern' : 'ueberschriften';
  if (art === 'absatznummern' && gliederung === 'auto') warnungen.push('keine Überschriften: Gliederung nach Absatznummern');

  let eintraege;
  if (art === 'absatznummern') {
    eintraege = gelesen.absatznummern.map((a) => ({ von: a.von, zeile: a.zeile, ebene: 1, titel: `Nr. ${a.nummer}`, umschriftTitel: `Nr. ${a.nummer}`, ebeneQuelle: 'absatznummer' }));
  } else {
    let kontext = null;
    eintraege = gueltig.map((u) => {
      let ebene;
      let ebeneQuelle;
      if (u.nummer !== null && u.nummer > 0) {
        ebene = u.nummer;
        ebeneQuelle = 'nummer';
      } else if (u.striche > 1) {
        ebene = u.striche;
        ebeneQuelle = 'striche';
      } else {
        const ausWort = ebeneAusTitel(u.titel);
        if (ausWort !== null) {
          ebene = ausWort;
          ebeneQuelle = 'schluesselwort';
        } else {
          ebene = kontext ? Math.min(kontext + 1, 6) : 1;
          ebeneQuelle = 'kontext';
        }
      }
      if (ebeneQuelle !== 'kontext') kontext = ebene;
      return { von: u.von, zeile: u.zeile, ebene, titel: u.titel, umschriftTitel: umschrift(u.titel), ebeneQuelle };
    });
  }

  const ende = text.length;
  const stapel = [];
  const kapitel = eintraege.map((e, i) => {
    while (stapel.length && stapel[stapel.length - 1].ebene >= e.ebene) stapel.pop();
    const eltern = stapel.length ? stapel[stapel.length - 1] : null;
    const k = {
      id: `k${String(i + 1).padStart(4, '0')}`,
      ebene: e.ebene,
      ebeneQuelle: e.ebeneQuelle,
      zeile: e.zeile,
      titel: e.titel,
      titelUmschrift: e.umschriftTitel,
      von: e.von,
      bis: ende,
      eigenesBis: i + 1 < eintraege.length ? eintraege[i + 1].von : ende,
      eltern: eltern ? eltern.id : null,
      pfad: [...(eltern ? eltern.pfad : []), `k${String(i + 1).padStart(4, '0')}`],
    };
    stapel.push(k);
    return k;
  });
  // Ende = nächste Überschrift gleicher oder höherer Ebene
  const offen = [];
  for (const k of kapitel) {
    while (offen.length && offen[offen.length - 1].ebene >= k.ebene) offen.pop().bis = k.von;
    offen.push(k);
  }
  return { kapitel, gliederung: art, warnungen };
}

/**
 * Ordnet Kapitel den Lehrplanthemen zu.
 * - Hauptthema: vom Oberkapitel geerbt (bzw. `standardThema` als gedachte Wurzel), sonst erste eigene Regel.
 * - Nebenthemen: eigene Treffer außer dem Hauptthema (nicht vererbt).
 * - Unterthema (nur `aqaid`): erste passende Regel aus UNTERTHEMEN_AQAID, sonst geerbt.
 * - `korrektur`: { "<kapitel-id>": { thema, unterthema? } } überschreibt (menschliche Korrektur, Herkunft „korrektur“).
 */
export function ordneZu(kapitel, { standardThema = null, korrektur = {}, regeln = REGELN } = {}) {
  if (standardThema && !THEMA_IDS.has(standardThema)) throw new Error(`Unbekanntes Standardthema: ${standardThema}`);
  const nachId = new Map();
  for (const k of kapitel) {
    const eltern = k.eltern ? nachId.get(k.eltern) : null;
    const treffer = passendeRegeln(k.titel, regeln);
    const eigene = [...new Set(treffer.map((r) => r.thema))];
    const geerbt = eltern ? eltern.thema : standardThema;
    let thema = null;
    let herkunft = null;
    if (geerbt) {
      thema = geerbt;
      herkunft = eltern ? 'geerbt' : 'standard';
    } else if (eigene.length) {
      thema = eigene[0];
      herkunft = 'eigen';
    }
    const nebenthemen = eigene.filter((t) => t !== thema);
    let unterthema = null;
    if (thema === 'aqaid') {
      const u = passendeRegeln(k.titel, UNTERTHEMEN_AQAID)[0];
      unterthema = u ? u.unterthema : eltern && eltern.thema === 'aqaid' ? eltern.unterthema : null;
    }
    const kor = korrektur[k.id];
    if (kor) {
      if (kor.thema !== null && kor.thema !== undefined && !THEMA_IDS.has(kor.thema)) throw new Error(`Korrektur ${k.id}: unbekanntes Thema ${kor.thema}`);
      thema = kor.thema ?? null;
      unterthema = kor.unterthema ?? null;
      herkunft = 'korrektur';
    }
    Object.assign(k, {
      thema,
      nebenthemen,
      unterthema,
      herkunft,
      regeln: treffer.map((r) => r.label),
    });
    nachId.set(k.id, k);
  }
  return kapitel;
}

// ---------------------------------------------------------------------------------------------------------------------
// Passagen
// ---------------------------------------------------------------------------------------------------------------------

function sha256(daten) {
  return createHash('sha256').update(daten).digest('hex');
}

/** Byte-Versätze für aufsteigend sortierte Zeichen-Versätze (O(n)). */
function byteVersaetze(text, positionen) {
  const sortiert = [...new Set(positionen)].sort((a, b) => a - b);
  const karte = new Map();
  let zeichen = 0;
  let bytes = 0;
  for (const p of sortiert) {
    bytes += Buffer.byteLength(text.slice(zeichen, p), 'utf8');
    zeichen = p;
    karte.set(p, bytes);
  }
  return karte;
}

/** Tiefstes Kapitel, das die Position enthält (Kapitel nach `von` sortiert). */
function kapitelAn(kapitel, nachId, pos) {
  let lo = 0;
  let hi = kapitel.length - 1;
  let treffer = -1;
  while (lo <= hi) {
    const mitte = (lo + hi) >> 1;
    if (kapitel[mitte].von <= pos) {
      treffer = mitte;
      lo = mitte + 1;
    } else hi = mitte - 1;
  }
  let k = treffer >= 0 ? kapitel[treffer] : null;
  while (k && !(k.von <= pos && pos < k.bis)) k = k.eltern ? nachId.get(k.eltern) : null;
  return k;
}

/**
 * Erzeugt den Passagen-Index aus dem Dateitext.
 * @param {string} text  dekodierter Dateiinhalt (UTF-8, mit Byte-Order-Mark falls vorhanden)
 * @param {{ werk:string, uri?:string, standardThema?:string|null, korrektur?:object, gliederung?:string }} optionen
 */
export function erzeugeIndex(text, { werk, uri = null, standardThema = null, korrektur = {}, gliederung = 'auto' } = {}) {
  // Kennungen wie im Quellenregister des Schemas (`ISLAM_WERKE`, z. B. `nur_al_idah`), damit `passage` im Beleg der Kennung
  // im Index gleicht (Schema: `<werk>.msNNNN`, Werk-Präfix = Registerschlüssel; L6-01).
  if (!/^[a-z][a-z0-9_-]*$/.test(werk ?? '')) throw new Error('--werk: Kennung aus a-z, 0-9, „_“ und „-“ (z. B. nur_al_idah)');
  const gelesen = lies(text);
  const { kapitel, gliederung: art, warnungen } = bildeKapitel(text, gelesen, { gliederung });
  ordneZu(kapitel, { standardThema, korrektur });
  const nachId = new Map(kapitel.map((k) => [k.id, k]));

  // Meilensteine prüfen
  const ms = gelesen.meilensteine;
  const gesehen = new Set();
  ms.forEach((m, i) => {
    if (gesehen.has(m.nummer)) warnungen.push(`Meilenstein ms${m.nummer} doppelt`);
    gesehen.add(m.nummer);
    if (i > 0 && m.nummer !== ms[i - 1].nummer + 1) warnungen.push(`Meilenstein-Folge springt: ms${ms[i - 1].nummer} → ms${m.nummer}`);
  });
  if (!ms.length) warnungen.push('keine Meilensteine: eine einzige Passage ms0001 (rest)');

  const breite = Math.max(4, String(ms.length ? Math.max(...ms.map((m) => m.nummer)) + 1 : 1).length);
  const roh = [];
  let anfang = gelesen.rumpfAnfang;
  const vergeben = new Map();
  for (const m of ms) {
    roh.push({ nummer: m.nummer, von: anfang, bis: m.bis, rest: false });
    anfang = m.bis;
  }
  if (bereinige(text.slice(anfang)).length) roh.push({ nummer: (ms.length ? ms[ms.length - 1].nummer : 0) + 1, von: anfang, bis: text.length, rest: true });

  const bytes = byteVersaetze(text, roh.flatMap((p) => [p.von, p.bis]));
  const passagen = roh.map((p) => {
    let kennung = `${werk}.ms${String(p.nummer).padStart(breite, '0')}`;
    const n = (vergeben.get(kennung) ?? 0) + 1;
    vergeben.set(kennung, n);
    if (n > 1) kennung += `-${n}`;
    const scheibe = text.slice(p.von, p.bis);
    const sauber = bereinige(scheibe);
    MARKUP_ANFANG.lastIndex = 0;
    MARKUP_ANFANG.exec(scheibe);
    const inhaltAb = p.von + Math.min(MARKUP_ANFANG.lastIndex, Math.max(0, scheibe.length - 1));
    const inhaltBis = Math.max(inhaltAb, letztesInhaltszeichen(text, p.von, p.bis));
    const amAnfang = kapitelAn(kapitel, nachId, inhaltAb);
    const innen = kapitel.filter((k) => k.von > inhaltAb && k.von < p.bis);
    const beteiligt = [amAnfang, ...innen].filter(Boolean);
    return {
      kennung,
      ms: p.nummer,
      rest: p.rest,
      von: p.von,
      bis: p.bis,
      byteVon: bytes.get(p.von),
      byteBis: bytes.get(p.bis),
      seiteVon: seiteAn(gelesen.seiten, inhaltAb),
      seiteBis: seiteAn(gelesen.seiten, inhaltBis),
      woerter: zaehleWoerter(sauber),
      koranMarken: (scheibe.match(/@QB@/g) ?? []).length,
      sha256: sha256(Buffer.from(scheibe, 'utf8')),
      sha256Text: sha256(Buffer.from(sauber, 'utf8')),
      kapitel: amAnfang ? amAnfang.id : null,
      kapitelpfad: amAnfang ? amAnfang.pfad : [],
      kapitelpfadUmschrift: amAnfang ? amAnfang.pfad.map((id) => nachId.get(id).titelUmschrift).join(' › ') : '',
      kapitelImText: innen.map((k) => k.id),
      thema: amAnfang ? amAnfang.thema : standardThema,
      themen: [...new Set(beteiligt.map((k) => k.thema).filter(Boolean))],
    };
  });

  // Meilenstein-Bereich und Wortzahl je Kapitel
  const passageAn = (pos) => {
    let lo = 0;
    let hi = passagen.length - 1;
    while (lo < hi) {
      const mitte = (lo + hi) >> 1;
      if (passagen[mitte].bis <= pos) lo = mitte + 1;
      else hi = mitte;
    }
    return passagen[lo];
  };
  for (const k of kapitel) {
    const a = passagen.length ? passageAn(k.von) : null;
    const b = passagen.length ? passageAn(Math.max(k.von, k.bis - 1)) : null;
    k.msVon = a ? a.ms : null;
    k.msBis = b ? b.ms : null;
    k.passagen = a && b ? b.ms - a.ms + 1 : 0;
    k.seite = seiteAn(gelesen.seiten, k.von);
    k.woerterEigen = zaehleWoerter(bereinige(text.slice(k.von, k.eigenesBis)));
  }

  const woerterGesamt = passagen.reduce((s, p) => s + p.woerter, 0);
  const vorKapitel = kapitel.length ? zaehleWoerter(bereinige(text.slice(gelesen.rumpfAnfang, kapitel[0].von))) : woerterGesamt;
  const abdeckung = THEMEN.map((t) => {
    const ks = kapitel.filter((k) => k.thema === t.id);
    return {
      thema: t.id,
      kapitel: ks.length,
      passagenHaupt: passagen.filter((p) => p.thema === t.id).length,
      passagenBeruehrt: passagen.filter((p) => p.themen.includes(t.id)).length,
      woerter: ks.reduce((s, k) => s + k.woerterEigen, 0) + (kapitel.length === 0 && standardThema === t.id ? woerterGesamt : 0),
      kapitelNeben: kapitel.filter((k) => k.nebenthemen.includes(t.id)).length,
    };
  });
  const ohne = kapitel.filter((k) => !k.thema);
  const ebenen = {};
  for (const k of kapitel) ebenen[k.ebene] = (ebenen[k.ebene] ?? 0) + 1;

  return {
    hinweis: 'OpenITI, CC BY-NC-SA 4.0 – nur lokal; nie ins Repository, nie ausliefern (KERN 4.0 §2.4, ADR 0045 Nr. 12)',
    werkzeug: WERKZEUG,
    werk,
    uri,
    zeichen: text.length,
    rumpfAnfang: gelesen.rumpfAnfang,
    gliederung: art,
    standardThema,
    meilensteine: ms.length,
    seitenmarken: gelesen.seiten.length,
    seitenHinweis: 'Seite = Band/Seite der Druckvorlage nach OpenITI-Marke PageV..P.. (Marke am Seitenende); ±1 Seite möglich, am Druck prüfen',
    woerter: woerterGesamt,
    woerterVorErstemKapitel: vorKapitel,
    kapitelJeEbene: ebenen,
    kapitelOhneThema: ohne.length,
    woerterOhneThema: ohne.reduce((s, k) => s + k.woerterEigen, 0),
    warnungen,
    abdeckung,
    kapitel,
    passagen,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Ausgabe
// ---------------------------------------------------------------------------------------------------------------------

const REPO_WURZEL = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function echterPfad(pfad) {
  let p = resolve(pfad);
  const rest = [];
  while (!existsSync(p)) {
    rest.unshift(basename(p));
    const oben = dirname(p);
    if (oben === p) break;
    p = oben;
  }
  return join(realpathSync(p), ...rest);
}

/** true, wenn der Pfad im Repository liegt (dort sind OpenITI-Dateien und Indizes verboten). */
export function imRepository(pfad, wurzel = REPO_WURZEL) {
  if (!existsSync(join(wurzel, '.git'))) return false;
  const w = realpathSync(wurzel);
  const p = echterPfad(pfad);
  return p === w || p.startsWith(w + sep);
}

function tsv(zeilen) {
  return zeilen.map((z) => z.map((f) => String(f ?? '').replace(/[\t\n\r]/g, ' ')).join('\t')).join('\n') + '\n';
}

export function passagenTsv(index) {
  return tsv([
    ['kennung', 'ms', 'zeichen_von', 'zeichen_bis', 'byte_von', 'byte_bis', 'woerter', 'koran_marken', 'sha256', 'kapitel', 'kapitelpfad_umschrift', 'thema', 'themen', 'seite_von', 'seite_bis'],
    ...index.passagen.map((p) => [p.kennung, p.ms, p.von, p.bis, p.byteVon, p.byteBis, p.woerter, p.koranMarken, p.sha256, p.kapitel, p.kapitelpfadUmschrift, p.thema, p.themen.join(','), p.seiteVon, p.seiteBis]),
  ]);
}

export function zuordnungTsv(index) {
  const name = Object.fromEntries(THEMEN.map((t) => [t.id, t.umschrift]));
  return tsv([
    ['kapitel', 'ebene', 'ebene_quelle', 'zeile', 'titel_umschrift', 'thema', 'thema_umschrift', 'unterthema', 'nebenthemen', 'herkunft', 'regeln', 'ms_von', 'ms_bis', 'passagen', 'woerter_eigen', 'seite'],
    ...index.kapitel.map((k) => [
      k.id, k.ebene, k.ebeneQuelle, k.zeile, k.titelUmschrift, k.thema ?? '-', k.thema ? name[k.thema] : '-', k.unterthema ?? '',
      k.nebenthemen.join(','), k.herkunft ?? '-', k.regeln.join(' | '), k.msVon, k.msBis, k.passagen, k.woerterEigen, k.seite,
    ]),
  ]);
}

function liesDatei(pfad) {
  const puffer = readFileSync(pfad);
  return { puffer, text: puffer.toString('utf8'), sha: sha256(puffer) };
}

function uriAusDateiname(pfad) {
  return basename(pfad).replace(/\.(mARkdown|completed|inProgress)$/, '');
}

function befehlIndex(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      werk: { type: 'string' },
      aus: { type: 'string' },
      uri: { type: 'string' },
      sha256: { type: 'string' },
      'standard-thema': { type: 'string' },
      korrektur: { type: 'string' },
      gliederung: { type: 'string', default: 'auto' },
    },
  });
  const [datei] = positionals;
  if (!datei || !values.werk || !values.aus) throw new Error('Aufruf: index <datei> --werk <kennung> --aus <verzeichnis>');
  if (imRepository(datei)) throw new Error('Eingabe liegt im Repository – OpenITI-Dateien nur außerhalb (KERN 4.0 §2.4).');
  if (imRepository(values.aus)) throw new Error('Ausgabe liegt im Repository – Index nur außerhalb, z. B. im Scratchpad (KERN 4.0 §2.4).');
  if (!['auto', 'ueberschriften', 'absatznummern'].includes(values.gliederung)) throw new Error('--gliederung: auto|ueberschriften|absatznummern');
  const { puffer, text, sha } = liesDatei(datei);
  if (values.sha256 && values.sha256.toLowerCase() !== sha) throw new Error(`SHA-256 weicht ab: erwartet ${values.sha256}, Datei ${sha}`);
  const korrektur = values.korrektur ? JSON.parse(readFileSync(values.korrektur, 'utf8')) : {};
  const index = erzeugeIndex(text, {
    werk: values.werk,
    uri: values.uri ?? uriAusDateiname(datei),
    standardThema: values['standard-thema'] ?? null,
    korrektur,
    gliederung: values.gliederung,
  });
  index.datei = resolve(datei);
  index.bytes = puffer.length;
  index.dateiSha256 = sha;
  index.erstellt = new Date().toISOString();
  mkdirSync(values.aus, { recursive: true });
  const basis = join(values.aus, values.werk);
  writeFileSync(`${basis}.passagen.json`, JSON.stringify(index, null, 1));
  writeFileSync(`${basis}.passagen.tsv`, passagenTsv(index));
  writeFileSync(`${basis}.zuordnung.tsv`, zuordnungTsv(index));
  const zusammenfassung = {
    werk: index.werk,
    uri: index.uri,
    bytes: index.bytes,
    sha256: index.dateiSha256,
    gliederung: index.gliederung,
    meilensteine: index.meilensteine,
    passagen: index.passagen.length,
    woerter: index.woerter,
    kapitel: index.kapitel.length,
    kapitelJeEbene: index.kapitelJeEbene,
    kapitelOhneThema: index.kapitelOhneThema,
    woerterOhneThema: index.woerterOhneThema,
    abdeckung: Object.fromEntries(index.abdeckung.filter((a) => a.kapitel || a.passagenHaupt).map((a) => [a.thema, `${a.kapitel} Kap., ${a.passagenHaupt} ms, ${a.woerter} W.`])),
    warnungen: index.warnungen,
    dateien: [`${basis}.passagen.json`, `${basis}.passagen.tsv`, `${basis}.zuordnung.tsv`],
  };
  console.log(JSON.stringify(zusammenfassung, null, 1));
}

function ladeIndex(pfad, dateiPfad) {
  const index = JSON.parse(readFileSync(pfad, 'utf8'));
  const datei = dateiPfad ?? index.datei;
  const geladen = liesDatei(datei);
  if (geladen.sha !== index.dateiSha256) throw new Error(`Datei ${datei}: SHA-256 ${geladen.sha} ≠ Index ${index.dateiSha256}`);
  return { index, ...geladen };
}

function befehlPruefe(argv) {
  const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { datei: { type: 'string' } } });
  const { index, text } = ladeIndex(positionals[0], values.datei);
  let fehler = 0;
  for (const p of index.passagen) {
    const scheibe = text.slice(p.von, p.bis);
    if (sha256(Buffer.from(scheibe, 'utf8')) !== p.sha256 || sha256(Buffer.from(bereinige(scheibe), 'utf8')) !== p.sha256Text) {
      fehler++;
      console.error(`abweichend: ${p.kennung}`);
    }
  }
  console.log(`${index.werk}: ${index.passagen.length} Passagen geprüft, ${fehler} abweichend; Datei-SHA-256 ${index.dateiSha256}`);
  if (fehler) process.exitCode = 1;
}

function befehlText(argv) {
  const { values, positionals } = parseArgs({ args: argv, allowPositionals: true, options: { roh: { type: 'boolean' }, datei: { type: 'string' } } });
  const [indexPfad, kennung] = positionals;
  const { index, text } = ladeIndex(indexPfad, values.datei);
  const p = index.passagen.find((x) => x.kennung === kennung);
  if (!p) throw new Error(`Passage ${kennung} nicht im Index`);
  const scheibe = text.slice(p.von, p.bis);
  if (sha256(Buffer.from(scheibe, 'utf8')) !== p.sha256) throw new Error(`Passage ${kennung}: SHA-256 abweichend`);
  process.stdout.write((values.roh ? scheibe : bereinige(scheibe)) + '\n');
}

function befehlAbdeckung(argv) {
  const indizes = argv.map((p) => JSON.parse(readFileSync(p, 'utf8')));
  const kopf = ['Thema', 'Umschrift', ...indizes.map((i) => i.werk)];
  const zeilen = [kopf, kopf.map(() => '---')];
  for (const t of THEMEN) {
    zeilen.push([t.name, t.umschrift, ...indizes.map((i) => {
      const a = i.abdeckung.find((x) => x.thema === t.id);
      if (!a || (!a.kapitel && !a.passagenHaupt && !a.kapitelNeben)) return '–';
      const neben = a.kapitelNeben ? ` (+${a.kapitelNeben} neben)` : '';
      return `${a.kapitel} K. / ${a.passagenHaupt} ms${neben}`;
    })]);
  }
  zeilen.push(['ohne Thema', '', ...indizes.map((i) => `${i.kapitelOhneThema} K.`)]);
  console.log(zeilen.map((z) => `| ${z.join(' | ')} |`).join('\n'));
}

const BEFEHLE = { index: befehlIndex, pruefe: befehlPruefe, text: befehlText, abdeckung: befehlAbdeckung };

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [befehl, ...rest] = process.argv.slice(2);
  try {
    if (!BEFEHLE[befehl]) throw new Error(`Befehl: ${Object.keys(BEFEHLE).join(' | ')}`);
    BEFEHLE[befehl](rest);
  } catch (fehler) {
    console.error(`openiti-passagen: ${fehler.message}`);
    process.exitCode = 2;
  }
}
