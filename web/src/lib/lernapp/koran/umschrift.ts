/**
 * Maschinelle Umschrift einer Wortform des Tanzil-Texts (uthmanische Schreibung) in lateinische Buchstaben nach DMG-Art –
 * nur als Orientierung in Arbeitslisten der Werkstatt (`_lernapp/**` enthält keine arabische Schrift, KERN 4.0 §3). Maßgeblich
 * bleibt die Stelle `Sure:Vers:Wort`; die Umschrift ist keine Lesehilfe für den Koran und wird nicht ausgeliefert.
 *
 * Regeln (vereinfacht): Konsonanten nach DMG, Vokalzeichen a/i/u, Tanwin -an/-in/-un, Schadda verdoppelt, Dehnung durch Alif,
 * Waw, Ya und die kleinen Zeichen (Alif khanjariyya, kleines Waw/Ya); Zeichen „nicht gesprochen“ (U+06DF) entfallen; der Artikel
 * am Wortanfang wird mit Bindestrich abgetrennt, bei Sonnenbuchstaben angeglichen (ar-r…). Alle Zeichen stehen als Codepunkte,
 * das Ergebnis enthält nie arabische Schrift.
 */

const KONSONANT: Readonly<Record<number, string>> = {
  0x0621: 'ʾ',
  0x0622: 'ʾā',
  0x0623: 'ʾ',
  0x0624: 'ʾ',
  0x0625: 'ʾ',
  0x0626: 'ʾ',
  0x0628: 'b',
  0x0629: 't',
  0x062a: 't',
  0x062b: 'ṯ',
  0x062c: 'ǧ',
  0x062d: 'ḥ',
  0x062e: 'ḫ',
  0x062f: 'd',
  0x0630: 'ḏ',
  0x0631: 'r',
  0x0632: 'z',
  0x0633: 's',
  0x0634: 'š',
  0x0635: 'ṣ',
  0x0636: 'ḍ',
  0x0637: 'ṭ',
  0x0638: 'ẓ',
  0x0639: 'ʿ',
  0x063a: 'ġ',
  0x0641: 'f',
  0x0642: 'q',
  0x0643: 'k',
  0x0644: 'l',
  0x0645: 'm',
  0x0646: 'n',
  0x0647: 'h',
  0x0648: 'w',
  0x064a: 'y',
};

const ALIF = 0x0627;
const ALIF_WASLA = 0x0671;
const ALIF_MAQSURA = 0x0649;
const WAW = 0x0648;
const YA = 0x064a;
const LAM = 0x0644;
const FATHA = 0x064e;
const DAMMA = 0x064f;
const KASRA = 0x0650;
const SCHADDA = 0x0651;
const SUKUN = 0x0652;
const MADDA = 0x0653;
const HAMZA_OBEN = 0x0654;
const HAMZA_UNTEN = 0x0655;
const ALIF_KLEIN = 0x0670;
const NICHT_GESPROCHEN = 0x06df;
const WAW_KLEIN = 0x06e5;
const YA_KLEIN = 0x06e6;
const YA_KLEIN_OBEN = 0x06e7;
const NUN_KLEIN = 0x06e8;

const VOKAL: Readonly<Record<number, string>> = { [FATHA]: 'a', [DAMMA]: 'u', [KASRA]: 'i', 0x064b: 'an', 0x064c: 'un', 0x064d: 'in' };
/** Sonnenbuchstaben (Angleichung des Artikels). */
const SONNE = new Set([0x062a, 0x062b, 0x062f, 0x0630, 0x0631, 0x0632, 0x0633, 0x0634, 0x0635, 0x0636, 0x0637, 0x0638, 0x0644, 0x0646]);

const istZeichen = (c: number) => (c >= 0x064b && c <= 0x065f) || c === ALIF_KLEIN || (c >= 0x06d6 && c <= 0x06ed) || c === 0x0640;

type Buchstabe = { c: number; marken: number[] };

/** Zerlegt in Grundbuchstaben mit ihren nachfolgenden Zeichen (Harakat, kleine Zeichen); Tatweel trägt nur Zeichen. */
function buchstaben(wort: string): Buchstabe[] {
  const liste: Buchstabe[] = [];
  for (const z of wort) {
    const c = z.codePointAt(0)!;
    if (istZeichen(c) && liste.length && c !== 0x0640) liste.at(-1)!.marken.push(c);
    else if (c === 0x0640) liste.push({ c, marken: [] });
    else liste.push({ c, marken: [] });
  }
  return liste;
}

/** Dehnt den letzten Vokal (a → ā usw.) oder hängt den langen Vokal an. */
function dehne(aus: string[], kurz: string, lang: string) {
  const letzt = aus.at(-1) ?? '';
  if (letzt.endsWith(lang)) return;
  if (letzt.endsWith(kurz)) aus[aus.length - 1] = letzt.slice(0, -1) + lang;
  else aus.push(lang);
}

export function umschrift(wort: string): string {
  const b = buchstaben(wort);
  const aus: string[] = [];
  let i = 0;
  /** Buchstabe nach dem angeglichenen Artikel: Schadda steht schon im Artikel (ar-r…) */
  let ohneDopplung = -1;
  // Artikel am Wortanfang: Alif wasla + Lam
  if (b.length > 2 && b[0]!.c === ALIF_WASLA && b[1]!.c === LAM) {
    const lam = b[1]!;
    const folge = b[2]!;
    if (lam.marken.includes(SUKUN)) {
      aus.push('al-');
      i = 2;
    } else if (!lam.marken.some((m) => VOKAL[m]) && folge.marken.includes(SCHADDA) && SONNE.has(folge.c)) {
      aus.push(`a${KONSONANT[folge.c] ?? ''}-`);
      i = 2;
      ohneDopplung = 2;
    }
  }
  for (; i < b.length; i++) {
    const { c, marken } = b[i]!;
    if (marken.includes(NICHT_GESPROCHEN)) continue;
    const vokal = marken.map((m) => VOKAL[m]).find(Boolean);
    const schadda = marken.includes(SCHADDA) && i !== ohneDopplung;
    if (c === ALIF_WASLA) {
      if (i === 0) aus.push('a');
    } else if (c === ALIF || c === ALIF_MAQSURA) {
      if (vokal) aus.push(`ʾ${vokal}`);
      else if (marken.includes(HAMZA_OBEN) || marken.includes(HAMZA_UNTEN)) aus.push('ʾ');
      else if (c === ALIF_MAQSURA && (aus.at(-1) ?? '').endsWith('i')) dehne(aus, 'i', 'ī');
      else if ((aus.at(-1) ?? '').endsWith('a') || marken.includes(ALIF_KLEIN) || marken.includes(MADDA)) dehne(aus, 'a', 'ā');
    } else if ((c === WAW || c === YA) && !vokal && !schadda && !marken.includes(SUKUN) && aus.length) {
      const letzt = aus.at(-1) ?? '';
      if (c === WAW && letzt.endsWith('u')) dehne(aus, 'u', 'ū');
      else if (c === YA && letzt.endsWith('i')) dehne(aus, 'i', 'ī');
      else aus.push(KONSONANT[c]!);
    } else if (c === 0x0640) {
      // Tatweel: trägt nur Zeichen (unten)
    } else if (KONSONANT[c] !== undefined) {
      const k = KONSONANT[c]!;
      aus.push(schadda ? k + k : k);
      if (vokal) aus.push(vokal);
    }
    for (const m of marken) {
      if (m === ALIF_KLEIN && c !== ALIF && c !== ALIF_MAQSURA) dehne(aus, 'a', 'ā');
      else if (m === WAW_KLEIN) dehne(aus, 'u', 'ū');
      else if (m === YA_KLEIN || m === YA_KLEIN_OBEN) dehne(aus, 'i', 'ī');
      else if (m === NUN_KLEIN) aus.push('n');
      else if ((m === HAMZA_OBEN || m === HAMZA_UNTEN) && c === 0x0640) aus.push('ʾ');
    }
  }
  // Sicherheitsnetz: nie arabische Schrift im Ergebnis
  return aus.join('').replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/gu, '');
}
