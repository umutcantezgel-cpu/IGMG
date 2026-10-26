/**
 * Kern des Religionswächters (KERN 4.0 §3, ADR 0040 Nr. 6; Fortschreibung nach S-L1 M-3). Gemeinsam genutzt von:
 * - dem Werkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs` (Tor, Unit-Test `tests/unit/lernapp/religion-waechter.test.ts`),
 * - dem Import und `pnpm lernapp:pruefen` (`src/lib/lernapp/inhalt/religion.ts`), auch im Vercel-Bau, wo `_gemeinde/` fehlt,
 * - später den Eingaben der Verwaltung (L3-06).
 *
 * Reines JavaScript ohne Abhängigkeiten. **Keine arabische Schrift in dieser Datei:** Zeichen stehen als Codepunkte; die
 * arabischen Einträge des Formel-Lexikons sind Verweise in den gepinnten Tanzil-Text (`web/daten/tanzil`) und werden erst
 * zur Laufzeit aufgelöst (KI-Regel 2: kein Agent schreibt sie).
 */

export const ARABISCH = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFE]/u;

// ——— Normalisierung (gleich für Korpus und geprüften Text) ———

/**
 * Unsichtbares und Kombinierendes, das ein Wort zerreißen oder tarnen kann: alle Format- und kombinierenden Zeichen (u. a.
 * U+00AD weicher Trennstrich, U+034F, U+061C, U+180E, U+200B–U+200F, U+202A–U+202E, U+2060–U+2069, U+FEFF; Harakat sind
 * ebenfalls kombinierend).
 */
const UNSICHTBAR = /[\p{Cf}\p{Mn}\p{Me}]/gu;
/**
 * Zeilen- und Absatztrenner U+2028/U+2029 trennen Wörter wie ein Leerzeichen; sonst verschmölzen Wörter, die nur durch sie
 * getrennt sind, und eine Folge aus 4 Wörtern bliebe unerkannt (Restbefund L1). Wer sie mitten in ein Wort setzt, um es zu
 * zerreißen, fällt über die zweite Lesart ohne Trenner auf ({@link woerterVarianten}).
 */
const TRENNER = /[\u2028\u2029]/g;
const HAT_TRENNER = /[\u2028\u2029]/;
/** Koranzeichen, die keine kombinierenden Zeichen sind (U+06D6–U+06ED), hohes Hamza und Tatweel. */
const ZEICHEN = /[\u06D6-\u06ED\u0674\u0640]/g;
const ALIF = /[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g;
const NICHT_BUCHSTABE = /[^\u0621-\u063A\u0641-\u064A\u0671-\u06D3]+/g;

/**
 * Normalisierte Form: Zerlegung (NFKD, auch Präsentationsformen und Ligaturen), ohne Harakat, Tatweel und unsichtbare
 * Zeichen; Alif-Formen und Alif wasla = Alif, Hamza-Träger = Grundbuchstabe, Ta marbuta und Ha-Formen (U+06C1, U+06BE,
 * U+06D5) = Ha, Alif maqsura und Ya-Formen (U+06CC, U+06D2) = Ya, Kaf-Formen (U+06A9, U+06AA) = Kaf.
 */
export function normalisiere(text) {
  return String(text)
    .normalize('NFKD')
    .replace(TRENNER, ' ')
    .replace(UNSICHTBAR, '')
    .replace(ZEICHEN, '')
    .replace(ALIF, '\u0627')
    .replace(/[\u0629\u06C1\u06BE\u06D5]/g, '\u0647')
    .replace(/[\u0649\u06CC\u06D2]/g, '\u064A')
    .replace(/[\u06A9\u06AA]/g, '\u0643');
}

/** Wörter der normalisierten Form (nur arabische Buchstaben); U+2028/U+2029 trennen wie ein Leerzeichen. */
export function woerter(text) {
  return normalisiere(text).replace(NICHT_BUCHSTABE, ' ').trim().split(' ').filter(Boolean);
}

/**
 * Lesarten eines Texts als Wortlisten: immer mit U+2028/U+2029 als Trenner; enthält der Text solche Trenner, zusätzlich
 * ohne sie (ein Trenner mitten im Wort zerreißt es sonst). Ein Treffer in einer der Lesarten zählt.
 */
export function woerterVarianten(text) {
  const t = String(text);
  if (!HAT_TRENNER.test(t)) return [woerter(t)];
  return [woerter(t), woerter(t.replace(TRENNER, ''))];
}

/** Enthält der Text Zeilen- oder Absatztrenner (dann zusätzlich {@link vierGrammTreffer} je Text statt nur im Strom)? */
export function hatTrenner(text) {
  return HAT_TRENNER.test(String(text));
}

/**
 * Schreibvarianten eines Worts im Uthmani-Text: (a) Zeichen entfernt, (b) hochgestelltes Alif als Alif, Waw mit Alif als
 * Alif, kleines Waw/Ya als Buchstabe – so trifft auch die vereinfachte Schreibung (z. B. mit Alif statt hochgestelltem Alif).
 */
export function koranVarianten(roh) {
  const a = woerter(roh).join('');
  const b = woerter(
    String(roh)
      .normalize('NFKD')
      .replace(/\u0648\u0670/g, '\u0627')
      .replace(/([\u0649\u064A])\u0670/g, '$1')
      .replace(/\u0640?\u0670/g, '\u0627')
      .replace(/\u06E5/g, '\u0648')
      .replace(/[\u06E6\u06E7]/g, '\u064A'),
  ).join('');
  return [...new Set([a, b])].filter(Boolean);
}

// ——— Verschleierte Schreibungen auflösen ———

const zeichenAus = (n) => (Number.isInteger(n) && n >= 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '');

/**
 * Codepunkt-Folgen und andere Schreibungen auflösen, damit sie den Wächter nicht umgehen: `\u0627`, `\u{627}`,
 * HTML-Entitäten (`&#x627;`, `&#1575;`), `String.fromCharCode(…)`/`fromCodePoint(…)` mit Zahlen und Prozent-Kodierung
 * (UTF-8 im Bereich U+0600–U+07FF).
 */
export function loeseCodepunkte(zeile) {
  let t = String(zeile);
  if (t.includes('\\u'))
    t = t
      .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, h) => zeichenAus(parseInt(h, 16)))
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
  if (t.includes('&#'))
    t = t
      .replace(/&#[xX]([0-9a-fA-F]{1,6});?/g, (_, h) => zeichenAus(parseInt(h, 16)))
      .replace(/&#(\d{1,7});?/g, (_, d) => zeichenAus(parseInt(d, 10)));
  if (t.includes('fromC'))
    t = t.replace(/fromC(?:harCode|odePoint)\(\s*((?:0[xX][0-9a-fA-F]+|\d+)(?:\s*,\s*(?:0[xX][0-9a-fA-F]+|\d+))*)\s*,?\s*\)/g, (_, liste) =>
      liste
        .split(',')
        .map((n) => zeichenAus(Number(n.trim())))
        .join(''),
    );
  if (t.includes('%'))
    t = t.replace(/(?:%[dD][89aAbBeEfF]%[89aAbB][0-9a-fA-F])+/g, (s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        return s;
      }
    });
  return t;
}

/** Enthält der Text (auch verschleiert) arabische Schrift? */
export function enthaeltArabisch(text) {
  return ARABISCH.test(text) || ARABISCH.test(loeseCodepunkte(text));
}

// ——— 4-Gramm-Index (Tanzil, Bukhari) ———

/** 53-Bit-Prüfsumme (cyrb53) eines 4-Gramms: schneller und kleiner als die Zeichenfolge selbst. */
function pruefsumme(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const c = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 2654435761);
    h2 = Math.imul(h2 ^ c, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

/** Alle 4-Gramme einer Wortfolge; je Position eine Liste von Varianten (Kombinationen höchstens 2^4). */
function trageEin(ziel, folge, stelle) {
  for (let i = 0; i + 4 <= folge.length; i++) {
    for (const w0 of folge[i])
      for (const w1 of folge[i + 1])
        for (const w2 of folge[i + 2]) for (const w3 of folge[i + 3]) ziel.set(pruefsumme(`${w0} ${w1} ${w2} ${w3}`), stelle[i]);
  }
}

/** Verse des Tanzil-XML als `{ sure, vers, text }`. */
export function* verseAus(tanzilXml) {
  for (const sure of tanzilXml.matchAll(/<sura index="(\d+)"[^>]*>([\s\S]*?)<\/sura>/g))
    for (const aya of sure[2].matchAll(/<aya index="(\d+)" text="([^"]*)"/g))
      yield { sure: Number(sure[1]), vers: Number(aya[1]), text: aya[2] };
}

/**
 * Index aus Tanzil-XML (Uthmani) und Bukhari-JSON: 4-Gramme über die Verse einer Sure hinweg bzw. innerhalb eines
 * Hadiths. Wert ist die Fundstelle (Sure:Vers bzw. Hadith-Nummer) für die Meldung – ohne arabischen Text.
 */
export function baueIndex({ tanzilXml, bukhariJson }) {
  const koran = new Map();
  const jeSure = new Map();
  for (const v of verseAus(tanzilXml)) {
    const s = jeSure.get(v.sure) ?? { folge: [], stelle: [] };
    for (const roh of v.text.split(/\s+/)) {
      const varianten = koranVarianten(roh);
      if (!varianten.length) continue;
      s.folge.push(varianten);
      s.stelle.push(`Sure ${v.sure}:${v.vers}`);
    }
    jeSure.set(v.sure, s);
  }
  for (const s of jeSure.values()) trageEin(koran, s.folge, s.stelle);
  const hadith = new Map();
  const daten = typeof bukhariJson === 'string' ? JSON.parse(bukhariJson) : bukhariJson;
  for (const h of daten.hadiths ?? []) {
    const w = woerter(h.text ?? '');
    trageEin(
      hadith,
      w.map((x) => [x]),
      w.map(() => `Bukhari ${h.hadithnumber}`),
    );
  }
  return { koran, hadith };
}

/** Treffer eines 4-Gramms aus normalisierten Wörtern. */
function treffer4(w0, w1, w2, w3, index) {
  const s = pruefsumme(`${w0} ${w1} ${w2} ${w3}`);
  if (index.koran.has(s)) return { korpus: 'koran', stelle: index.koran.get(s) };
  if (index.hadith.has(s)) return { korpus: 'hadith', stelle: index.hadith.get(s) };
  return null;
}

/** Erster Treffer einer Folge aus 4 Wörtern im Koran- bzw. Hadith-Index (in jeder Lesart), sonst null. */
export function vierGrammTreffer(text, index) {
  for (const w of woerterVarianten(text))
    for (let i = 0; i + 4 <= w.length; i++) {
      const t = treffer4(w[i], w[i + 1], w[i + 2], w[i + 3], index);
      if (t) return t;
    }
  return null;
}

/**
 * Alle Treffer in einem Wortstrom über Zeilen- und Feldgrenzen hinweg (Dialogzeilen, Sätze einer Lektion, Felder einer
 * Datei). `strom`: Liste `[wort, ort]` normalisierter Wörter; Ergebnis je Treffer mit dem Ort des ersten Worts.
 */
export function vierGrammStrom(strom, index) {
  const ergebnis = [];
  for (let i = 0; i + 4 <= strom.length; i++) {
    const t = treffer4(strom[i][0], strom[i + 1][0], strom[i + 2][0], strom[i + 3][0], index);
    if (t) ergebnis.push({ ...t, ort: strom[i][1] });
  }
  return ergebnis;
}

// ——— Formel-Lexikon (KERN 4.0 §3 a) ———

/**
 * Arabische Einträge als Verweis in den Tanzil-Text: Sure:Vers und Wörter (1-basiert, Zählung nach Leerraum wie im XML).
 * Startliste des Orchestrators (S-L1 M-3), bestätigt und ergänzt von der religiösen Prüfung (LM-09); eine geprüfte Liste
 * liegt danach gepinnt in `web/daten/` (Ordner: Entscheidung der Menschen). Längere Formeln (≥ 4 Wörter, z. B. die Eulogie)
 * fängt bereits der 4-Gramm-Abgleich.
 *
 * Musterlogik ohne neuen Wortlaut (Stufe C N2, Z-L10): `artikel` erlaubt vor dem ersten Wort des Eintrags den Artikel
 * (auch hinter einer Vorsilbe), `umkehrbar` zusätzlich die umgekehrte Reihenfolge der vorhandenen Wörter (Erwiderung).
 * So trifft der Friedensgruß aus 6:54 auch mit Artikel und als Erwiderung. Weitere Formeln (Fest-, Ramadan-,
 * Freitagsgruß u. a.) ergänzt nur die religiöse Prüfung (LM-09).
 */
export const LEXIKON_VERWEISE = Object.freeze([
  { name: 'Basmala', stelle: '1:1', woerter: [1, 4] },
  { name: 'Gottesname', stelle: '1:1', woerter: [2, 2] },
  { name: 'Hamdala', stelle: '1:2', woerter: [1, 2] },
  { name: 'Gottesname (li-)', stelle: '1:2', woerter: [2, 2] },
  { name: 'inschallah', stelle: '2:70', woerter: [14, 16] },
  { name: 'maschallah', stelle: '18:39', woerter: [6, 8] },
  { name: 'subhanallah', stelle: '23:91', woerter: [23, 24] },
  { name: 'Takbir', stelle: '29:45', woerter: [18, 19] },
  { name: 'Friedensgruß', stelle: '6:54', woerter: [7, 8], artikel: true, umkehrbar: true },
  { name: 'Sure', stelle: '24:1', woerter: [1, 1] },
]);

/**
 * Deutsche und türkische Religionsbegriffe und Formeln in Umschrift (Startliste, Entwurf; die Redaktion ergänzt sie, LM-09).
 * Muster über der gefalteten Form (`falteLatein`: NFC, klein), mit Wortgrenzen; Endungen ausdrücklich, damit Alltagswörter
 * nicht treffen (z. B. „Rote Bete“, „gebeten“, tr. „suret“, „süren“, „duvar“, „hacim“, „kuran“ = gründend, „hoca“ =
 * Lehrkraft).
 */
export const LEXIKON_LATEIN = Object.freeze([
  { name: 'Allah', muster: 'allah(?:s|a|ı|ın|tan|ta)?' },
  { name: 'Gott', muster: 'gott(?:es|e|s)?|götter(?:n)?|göttlich\\p{L}*' },
  { name: 'Tanrı', muster: 'tanr[iı]\\p{L}*' },
  { name: 'Koran', muster: "koran(?:s|e)?|kur['’]an\\p{L}*|kuran-[ıi] ?kerim" },
  { name: 'Sure', muster: 'suren?|sure(?:ler\\p{L}*|si|yi|ye|de|den|nin)' },
  { name: 'Vers des Koran', muster: 'ayet\\p{L}*|koranvers\\p{L}*' },
  { name: 'Hadith', muster: 'hadith(?:e|s|en)?|hadis(?:ler\\p{L}*|i|in|e|te|ten)?' },
  { name: 'Prophet', muster: 'prophet(?:en|in|innen)?|peygamber\\p{L}*' },
  { name: 'Gebet', muster: 'gebet(?:e|es|s)?|gebets\\p{L}*|bittgebet\\p{L}*|beten|betet|betest|gebetet|namaz\\p{L}*' },
  { name: 'Bittgebet', muster: 'dua(?:s|lar\\p{L}*|sı|yı|ya|da|dan|nın)?' },
  { name: 'Moschee', muster: 'moschee(?:n)?|cami(?:i|si|ye|de|den|nin|ler\\p{L}*)?|mescit\\p{L}*' },
  { name: 'Imam', muster: 'imam(?:e|s|en|ı|a|ın|lar\\p{L}*)?' },
  { name: 'Fasten', muster: 'ramadan|ramazan\\p{L}*|fastenmonat|oruç\\p{L}*|iftar\\p{L}*|sahur\\p{L}*' },
  { name: 'Wallfahrt', muster: 'hadsch|hac(?:ca|da|dan|a)?|umre\\p{L}*' },
  { name: 'Abgabe', muster: 'zakat|zek[aâ]t\\p{L}*' },
  { name: 'Waschung', muster: 'abdest\\p{L}*|gus[uü]l\\p{L}*' },
  {
    name: 'Formel',
    muster:
      'in(?:ş|s|sch|sh)a+llah|ma(?:ş|s|sch|sh)a+llah|bismillah\\p{L}*|(?:el|al)hamd[uü]lillah|s[uü]bhanallah|' +
      'selam[uü]n ?aleyk[uü]m|as?-?salam[ua]? ?alaik[ua]m',
  },
]);

/** Unsichtbares in lateinischen Texten (Format-Zeichen, U+034F); Diakritika bleiben (ü ≠ u). */
const UNSICHTBAR_LATEIN = /[\p{Cf}\u034F]/gu;

/**
 * Gefaltete Formen lateinischer Texte: NFC, ohne unsichtbare Zeichen, klein (türkisch und allgemein); Zeilen- und
 * Absatztrenner als Leerzeichen und – falls vorhanden – zusätzlich entfernt (wie {@link woerterVarianten}).
 */
export function falteLatein(text) {
  const ohne = String(text).normalize('NFC').replace(UNSICHTBAR_LATEIN, '');
  const lesarten = HAT_TRENNER.test(ohne) ? [ohne.replace(TRENNER, ' '), ohne.replace(TRENNER, '')] : [ohne];
  return [...new Set(lesarten.flatMap((l) => [l.toLocaleLowerCase('tr'), l.toLowerCase()]))];
}

/**
 * Lexikon aus dem Tanzil-XML auflösen: je arabischem Eintrag die Folge der Wort-Varianten (`folge`) und je Stelle, ob dort
 * der Artikel stehen darf (`artikel`); bei `umkehrbar` zusätzlich die umgekehrte Folge als eigener Eintrag gleichen Namens.
 * Je lateinischem Eintrag das Muster mit Wortgrenzen.
 */
export function baueLexikon(tanzilXml) {
  const verse = new Map();
  for (const v of verseAus(tanzilXml)) verse.set(`${v.sure}:${v.vers}`, v.text);
  const arabisch = LEXIKON_VERWEISE.map((e) => {
    const text = verse.get(e.stelle);
    if (!text) throw new Error(`Formel-Lexikon: Stelle ${e.stelle} fehlt im Tanzil-Text`);
    const roh = text.split(/\s+/).slice(e.woerter[0] - 1, e.woerter[1]);
    const folge = roh.map((w) => koranVarianten(w)).filter((v) => v.length);
    if (folge.length !== e.woerter[1] - e.woerter[0] + 1)
      throw new Error(`Formel-Lexikon: Stelle ${e.stelle} Wörter ${e.woerter.join('–')} ungültig`);
    const artikel = folge.map((_, i) => Boolean(e.artikel) && i === 0);
    const vorwaerts = { name: e.name, folge, artikel };
    return e.umkehrbar && folge.length > 1
      ? [vorwaerts, { name: e.name, folge: [...folge].reverse(), artikel: [...artikel].reverse() }]
      : [vorwaerts];
  }).flat();
  const latein = LEXIKON_LATEIN.map((e) => ({
    name: e.name,
    muster: new RegExp(`(?<![\\p{L}\\p{N}])(?:${e.muster})(?![\\p{L}\\p{N}])`, 'u'),
  }));
  return { arabisch, latein };
}

/** Vorsilben, die vor dem ersten Wort eines Eintrags stehen dürfen (und, so, mit, für, wie, bei Schwur). */
const VORSILBE = /^[\u0648\u0641\u0628\u0644\u0643\u062A]{0,2}$/;
/** Artikel (Alif, Lam) – an Stellen mit `artikel`, am ersten Wort auch hinter einer Vorsilbe; mit li- als Lam, Lam. */
const ARTIKEL = '\u0627\u0644';
const MIT_ARTIKEL = /^[\u0648\u0641\u0628\u0643]{0,2}\u0627\u0644$|^[\u0648\u0641]?\u0644\u0644$/;

/** Steht das Wort `wort` an einer Stelle des Eintrags (Varianten `v`)? Am ersten Wort mit Vorsilbe, mit `artikel` auch so. */
function passtStelle(wort, v, erstes, artikel) {
  if (erstes)
    return v.some((x) => {
      if (!wort.endsWith(x)) return false;
      const vor = wort.slice(0, wort.length - x.length);
      return VORSILBE.test(vor) || (artikel && MIT_ARTIKEL.test(vor));
    });
  return v.includes(wort) || (artikel && v.some((x) => wort === ARTIKEL + x));
}

/** Erster Lexikon-Treffer in einem Text (arabisch und lateinisch), sonst null. Ausgabe ohne arabische Schrift. */
export function lexikonTreffer(text, lexikon) {
  const t = loeseCodepunkte(text);
  if (ARABISCH.test(t))
    for (const w of woerterVarianten(t))
      for (let i = 0; i < w.length; i++)
        for (const e of lexikon.arabisch) {
          if (i + e.folge.length > w.length) continue;
          const artikel = e.artikel ?? [];
          if (e.folge.every((v, j) => passtStelle(w[i + j], v, j === 0, Boolean(artikel[j])))) return { name: e.name };
        }
  for (const f of falteLatein(t)) for (const e of lexikon.latein) if (e.muster.test(f)) return { name: e.name };
  return null;
}
