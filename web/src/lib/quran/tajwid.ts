/**
 * Tajwid-Markierungen (ADR 0025, 0030): Bereiche [Start, Ende) in Codepunkten des Tanzil-1.1-Verstexts mit Regel
 * (cpfair/quran-tajweed, neu berechnet für Tanzil 1.1). Beim Import werden die Grenzen auf Graphem-Grenzen erweitert,
 * damit Buchstabe und Vokalzeichen nie getrennt dargestellt werden; die Anzeige erzeugt daraus Abschnitte.
 * Reine Funktionen ohne Abhängigkeit.
 */
export type TajwidSegment = [number, number, string];

/** Sechs Regelfamilien mit eigener Farbe und eigenem Unterstreichungsmuster (WCAG 1.4.1, KERN 3.0). */
export const TAJWID_FAMILIEN = ['ghunna', 'ikhfa', 'iqlab', 'qalqala', 'madd', 'stumm'] as const;
export type TajwidFamilie = (typeof TAJWID_FAMILIEN)[number];

/** Regel → Familie. Unbekannte Regeln erhalten keine Färbung. */
export const REGEL_FAMILIE: Readonly<Record<string, TajwidFamilie>> = {
  ghunnah: 'ghunna',
  idghaam_ghunnah: 'ghunna',
  idghaam_shafawi: 'ghunna',
  ikhfa: 'ikhfa',
  ikhfa_shafawi: 'ikhfa',
  iqlab: 'iqlab',
  qalqalah: 'qalqala',
  madd_2: 'madd',
  madd_246: 'madd',
  madd_6: 'madd',
  madd_munfasil: 'madd',
  madd_muttasil: 'madd',
  silent: 'stumm',
  hamzat_wasl: 'stumm',
  lam_shamsiyyah: 'stumm',
  idghaam_no_ghunnah: 'stumm',
  idghaam_mutajanisayn: 'stumm',
  idghaam_mutaqaribayn: 'stumm',
};

/**
 * Deutsche Fachbegriffe der Regeln aus dem Import (Reihenfolge = Sortierung). Sie gelten öffentlich, bis die Lehrkraft
 * einen eigenen Namen erfasst und dieser religiös geprüft ist (ADR 0030, Verwaltung „Koran & Hadith“).
 */
export const REGEL_FACHBEGRIFF: Readonly<Record<string, string>> = {
  ghunnah: 'Ghunna',
  idghaam_ghunnah: 'Idgham mit Ghunna',
  idghaam_shafawi: 'Idgham schafawi',
  ikhfa: 'Ikhfa',
  ikhfa_shafawi: 'Ikhfa schafawi',
  iqlab: 'Iqlab',
  qalqalah: 'Qalqala',
  madd_2: 'Madd (2)',
  madd_246: 'Madd (2, 4 oder 6)',
  madd_6: 'Madd (6)',
  madd_munfasil: 'Madd munfasil',
  madd_muttasil: 'Madd muttasil',
  silent: 'Nicht gesprochen',
  hamzat_wasl: 'Hamzat al-Wasl',
  lam_shamsiyyah: 'Lam schamsiyya',
  idghaam_no_ghunnah: 'Idgham ohne Ghunna',
  idghaam_mutajanisayn: 'Idgham mutadschanisain',
  idghaam_mutaqaribayn: 'Idgham mutaqaribain',
};

/** Codepunkt-Indizes, an denen ein neues Graphem beginnt (plus Textende). */
export function graphemGrenzen(text: string): Set<number> {
  const grenzen = new Set<number>([0]);
  const segmenter = new Intl.Segmenter('ar', { granularity: 'grapheme' });
  let codepunkte = 0;
  for (const { segment } of segmenter.segment(text)) {
    codepunkte += Array.from(segment).length;
    grenzen.add(codepunkte);
  }
  return grenzen;
}

/**
 * Erweitert Bereiche auf Graphem-Grenzen und verwirft ungültige oder unbekannte Regeln.
 * Liefert die bereinigten Segmente und die Zahl der verworfenen.
 */
export function bereinige(text: string, segmente: readonly TajwidSegment[]): { segmente: TajwidSegment[]; verworfen: number } {
  const laenge = Array.from(text).length;
  const grenzen = graphemGrenzen(text);
  const sortiert = [...grenzen].sort((a, b) => a - b);
  const davor = (i: number) => sortiert.filter((g) => g <= i).at(-1) ?? 0;
  const danach = (i: number) => sortiert.find((g) => g >= i) ?? laenge;
  const ergebnis: TajwidSegment[] = [];
  let verworfen = 0;
  for (const [start, ende, regel] of segmente) {
    if (!(regel in REGEL_FAMILIE) || start < 0 || ende > laenge || start >= ende) {
      verworfen++;
      continue;
    }
    ergebnis.push([davor(start), danach(ende), regel]);
  }
  return { segmente: ergebnis, verworfen };
}

export type Abschnitt = { text: string; familie: TajwidFamilie | null; regeln: string[] };

/**
 * Zerlegt einen Text (z. B. ein Wort mit seinem Versatz im Vers) in Abschnitte gleicher Färbung.
 * Bei überlappenden Regeln gewinnt die zuerst begonnene; alle Regeln bleiben in `regeln` erhalten (Seitenleiste).
 */
export function abschnitte(text: string, segmente: readonly TajwidSegment[], versatz = 0): Abschnitt[] {
  const zeichen = Array.from(text);
  const familieJe: (TajwidFamilie | null)[] = new Array(zeichen.length).fill(null);
  const regelnJe: string[][] = zeichen.map(() => []);
  for (const [start, ende, regel] of segmente) {
    for (let i = Math.max(start - versatz, 0); i < Math.min(ende - versatz, zeichen.length); i++) {
      familieJe[i] ??= REGEL_FAMILIE[regel] ?? null;
      if (!regelnJe[i].includes(regel)) regelnJe[i].push(regel);
    }
  }
  const ergebnis: Abschnitt[] = [];
  for (let i = 0; i < zeichen.length; i++) {
    const letzte = ergebnis.at(-1);
    const regeln = regelnJe[i];
    if (letzte && letzte.familie === familieJe[i] && letzte.regeln.join() === regeln.join()) letzte.text += zeichen[i];
    else ergebnis.push({ text: zeichen[i], familie: familieJe[i], regeln: [...regeln] });
  }
  return ergebnis;
}
