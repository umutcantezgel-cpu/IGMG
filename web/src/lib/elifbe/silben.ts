/**
 * Silbentafeln aus Codepunkten (ADR 0030): Buchstabe × Haraka, ohne getippten arabischen Text. Die Umschrift ist eine
 * vereinfachte Lesehilfe (Konsonant aus `laut`, Vokal a/i/u, Tanwin mit „n“, Dehnung mit Strich); die Aussprache lehrt
 * die Hoca (MN-07).
 */
import { type Buchstabe, type HarakaSchluessel, buchstabeFuer, haraka, type Sprache } from './alphabet';

export type Silbe = {
  /** Schlüssel für Listen und Audio (`silbe:0628-064E`). */
  schluessel: string;
  /** Arabischer Text aus Codepunkten. */
  text: string;
  /** Vereinfachte Umschrift je Sprache. */
  umschrift: Record<Sprache, string>;
  buchstabe: string;
  art: SilbenArt;
};

/** Harakat einer Silbentafel plus die Dehnung (Med) als eigene Art. */
export type SilbenArt = HarakaSchluessel | 'med-fatha' | 'med-kasra' | 'med-damma';

const SPRACHEN: Sprache[] = ['de', 'tr', 'en'];
const ELIF = 0x0627;
const VAV = 0x0648;
const YE = 0x064a;

const cp = (n: number) => String.fromCodePoint(n);
const hex4 = (n: number) => n.toString(16).toUpperCase().padStart(4, '0');

/** Verdopplung in der Umschrift: einzelner Laut doppelt („bb“), Lautgruppen nur mit dem ersten Zeichen („ddsch“). */
function doppelt(laut: string): string {
  const zeichenListe = [...laut.normalize('NFC')];
  return zeichenListe.length <= 1 ? laut + laut : (zeichenListe[0] ?? '') + laut;
}

/** Kann der Buchstabe diese Art tragen? Elif und Hamza tragen weder Sukun noch Shadda (Träger bzw. Sonderfall). */
export function erlaubt(b: Pick<Buchstabe, 'slug'>, art: SilbenArt): boolean {
  if (b.slug === 'elif' || b.slug === 'hemze') return !['sukun', 'shadda', 'med-fatha', 'med-kasra', 'med-damma'].includes(art);
  return true;
}

export function silbe(b: Buchstabe, art: SilbenArt): Silbe {
  const fatha = haraka('fatha');
  let codes: number[];
  let umschrift: (laut: string) => string;
  switch (art) {
    case 'sukun':
      // Mit Elif und Fatha davor: „ab“
      codes = [ELIF, fatha.codepunkt, b.codepunkt, haraka('sukun').codepunkt];
      umschrift = (laut) => `a${laut}`;
      break;
    case 'shadda':
      // Elif mit Fatha, dann der Buchstabe mit Shadda und Fatha: „abba“
      codes = [ELIF, fatha.codepunkt, b.codepunkt, haraka('shadda').codepunkt, fatha.codepunkt];
      umschrift = (laut) => `a${doppelt(laut)}a`;
      break;
    case 'med-fatha':
      codes = [b.codepunkt, fatha.codepunkt, ELIF];
      umschrift = (laut) => `${laut}ā`;
      break;
    case 'med-kasra':
      codes = [b.codepunkt, haraka('kasra').codepunkt, YE];
      umschrift = (laut) => `${laut}ī`;
      break;
    case 'med-damma':
      codes = [b.codepunkt, haraka('damma').codepunkt, VAV];
      umschrift = (laut) => `${laut}ū`;
      break;
    default: {
      const h = haraka(art);
      codes = [b.codepunkt, h.codepunkt];
      umschrift = (laut) => `${laut}${h.vokal}${h.tanwin ? 'n' : ''}`;
    }
  }
  return {
    schluessel: `silbe:${codes.map(hex4).join('-')}`,
    text: codes.map(cp).join(''),
    umschrift: Object.fromEntries(SPRACHEN.map((s) => [s, umschrift(b.laut[s])])) as Record<Sprache, string>,
    buchstabe: b.slug,
    art,
  };
}

/** Tafel: je Buchstabe eine Zeile mit den Silben der gewählten Arten (nicht erlaubte bleiben leer). */
export function silbentafel(
  buchstaben: readonly Buchstabe[],
  arten: readonly SilbenArt[],
): { buchstabe: Buchstabe; silben: (Silbe | null)[] }[] {
  return buchstaben.map((b) => ({ buchstabe: b, silben: arten.map((a) => (erlaubt(b, a) ? silbe(b, a) : null)) }));
}

/** Kleiner, fester Zufall (mulberry32): gleiche Lektion → gleiche Lesereihen, auf Server und im Browser. */
export function zufall(saat: number): () => number {
  let a = saat >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function mischen<T>(liste: readonly T[], z: () => number): T[] {
  const a = [...liste];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(z() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/**
 * Lesereihen: alle erlaubten Silben der Lektion, gemischt und in Reihen zu `breite` Silben – zum Vorlesen von rechts
 * nach links. Jede Silbe kommt genau einmal vor.
 */
export function lesereihen(buchstaben: readonly Buchstabe[], arten: readonly SilbenArt[], saat: number, breite = 6): Silbe[][] {
  const alle = buchstaben.flatMap((b) => arten.filter((a) => erlaubt(b, a)).map((a) => silbe(b, a)));
  const gemischt = mischen(alle, zufall(saat));
  const reihen: Silbe[][] = [];
  for (let i = 0; i < gemischt.length; i += breite) reihen.push(gemischt.slice(i, i + breite));
  return reihen;
}

/** Silbe zu einem Schlüssel „slug:art“ (z. B. für Übungen). */
export function silbeFuer(slug: string, art: SilbenArt): Silbe | undefined {
  const b = buchstabeFuer(slug);
  return b && erlaubt(b, art) ? silbe(b, art) : undefined;
}
