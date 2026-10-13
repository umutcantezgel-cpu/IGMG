/**
 * Leser für Sahih al-Bukhari aus fawazahmed0/hadith-api (`ara-bukhari.json`, ADR 0025). Arabischer Text unverändert;
 * nur für die Suche entsteht eine normalisierte Fassung ohne Harakat und Tatweel. Einträge ohne Text werden
 * übersprungen und gezählt; fehlende Buchnummern (0) werden aus den Nummernbereichen der Abschnitte ergänzt.
 */
export type HadithZeile = {
  nummer: string;
  sortierung: number;
  arabischeNummer: string;
  buchNr: number;
  imBuchNr: number | null;
  textAr: string;
  textNormalisiert: string;
  bewertung: string | null;
  bewertetVon: string | null;
};

export type BuchZeile = { nr: number; titelEn: string; hadithVon: number; hadithBis: number };

type Quelle = {
  metadata: {
    name: string;
    sections: Record<string, string>;
    section_details: Record<string, { hadithnumber_first: number; hadithnumber_last: number }>;
  };
  hadiths: {
    hadithnumber: number;
    arabicnumber: number | string;
    text: string;
    grades: { name: string; grade: string }[];
    reference: { book: number; hadith: number };
  }[];
};

export class HadithFehler extends Error {}

/** Harakat (U+064B–U+065F), hochgestelltes Alef (U+0670), Koranzeichen (U+06D6–U+06ED) und Tatweel (U+0640) entfernen. */
export function normalisiereArabisch(text: string): string {
  return text
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function leseBukhari(json: string): { buecher: BuchZeile[]; hadithe: HadithZeile[]; uebersprungen: string[] } {
  const quelle = JSON.parse(json) as Quelle;
  if (!quelle.metadata?.sections || !Array.isArray(quelle.hadiths)) throw new HadithFehler('Unerwartetes Format');
  const buecher: BuchZeile[] = Object.entries(quelle.metadata.section_details)
    .filter(([nr]) => nr !== '0')
    .map(([nr, d]) => ({
      nr: Number(nr),
      titelEn: quelle.metadata.sections[nr] ?? '',
      hadithVon: d.hadithnumber_first,
      hadithBis: d.hadithnumber_last,
    }));
  // Buch aus den Abschnittsbereichen; liegt die Nummer in einer Lücke, gilt das Buch der nächstkleineren Nummer mit Buch.
  const bekannt = quelle.hadiths
    .filter((h) => h.reference.book > 0)
    .map((h) => [h.hadithnumber, h.reference.book] as const)
    .sort((a, b) => a[0] - b[0]);
  const buchFuer = (n: number) =>
    buecher.find((b) => n >= b.hadithVon && n <= b.hadithBis)?.nr ?? bekannt.filter(([nr]) => nr <= n).at(-1)?.[1];
  const hadithe: HadithZeile[] = [];
  const uebersprungen: string[] = [];
  const gesehen = new Set<string>();
  for (const h of quelle.hadiths) {
    const nummer = String(h.hadithnumber);
    if (!h.text?.trim()) {
      uebersprungen.push(nummer);
      continue;
    }
    if (gesehen.has(nummer)) throw new HadithFehler(`Doppelte Nummer ${nummer}`);
    gesehen.add(nummer);
    const buchNr = h.reference.book || buchFuer(h.hadithnumber);
    if (!buchNr) throw new HadithFehler(`Kein Buch für Nummer ${nummer}`);
    const bewertung = h.grades?.[0];
    hadithe.push({
      nummer,
      sortierung: Math.round(h.hadithnumber * 10),
      arabischeNummer: String(h.arabicnumber),
      buchNr,
      imBuchNr: h.reference.hadith || null,
      textAr: h.text,
      textNormalisiert: normalisiereArabisch(h.text),
      bewertung: bewertung?.grade ?? null,
      bewertetVon: bewertung?.name ?? null,
    });
  }
  return { buecher, hadithe, uebersprungen };
}
