/**
 * Leser für die Tanzil-Metadaten `quran-data.xml` (CC BY, ADR 0025): Suren (Umschrift, Ort, Offenbarungsfolge,
 * Rukus) und Einteilungen (Cüz, Hizb-Viertel, Manzil, Ruku, Seite, Secde). Reine Funktion, keine Abhängigkeit.
 */
export type SureMeta = {
  nr: number;
  verse: number;
  nameAr: string;
  umschrift: string;
  englisch: string;
  ort: 'mekki' | 'medeni';
  offenbarungsfolge: number;
  rukus: number;
};

export type EinteilungArt = 'cuz' | 'hizb_viertel' | 'seite' | 'manzil' | 'ruku' | 'secde';
export type Einteilung = { art: EinteilungArt; nr: number; sure: number; vers: number; zusatz?: string };

export class MetadatenFehler extends Error {}

function attribute(tag: string): Record<string, string> {
  const werte: Record<string, string> = {};
  for (const t of tag.matchAll(/([A-Za-z_]+)\s*=\s*"([^"]*)"/g)) werte[t[1]] = t[2].replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  return werte;
}

function zahl(wert: string | undefined, was: string): number {
  if (!wert || !/^\d+$/.test(wert)) throw new MetadatenFehler(`${was}: keine gültige Zahl (${wert ?? 'fehlt'})`);
  return Number(wert);
}

const ELEMENTE: Record<string, EinteilungArt> = {
  juz: 'cuz',
  quarter: 'hizb_viertel',
  page: 'seite',
  manzil: 'manzil',
  ruku: 'ruku',
  sajda: 'secde',
};

export function leseMetadaten(xml: string): { suren: SureMeta[]; einteilungen: Einteilung[] } {
  const suren: SureMeta[] = [];
  for (const m of xml.matchAll(/<sura\b([^>]*?)\/>/g)) {
    const a = attribute(m[1]);
    if (a.ayas === undefined) continue;
    suren.push({
      nr: zahl(a.index, 'Sure'),
      verse: zahl(a.ayas, 'Verse'),
      nameAr: a.name ?? '',
      umschrift: a.tname ?? '',
      englisch: a.ename ?? '',
      ort: a.type === 'Medinan' ? 'medeni' : 'mekki',
      offenbarungsfolge: zahl(a.order, 'Reihenfolge'),
      rukus: zahl(a.rukus, 'Rukus'),
    });
  }
  if (suren.length !== 114) throw new MetadatenFehler(`Erwartet 114 Suren, gefunden ${suren.length}`);
  const einteilungen: Einteilung[] = [];
  for (const [element, art] of Object.entries(ELEMENTE)) {
    for (const m of xml.matchAll(new RegExp(`<${element}\\b([^>]*?)\\/>`, 'g'))) {
      const a = attribute(m[1]);
      einteilungen.push({
        art,
        nr: zahl(a.index, art),
        sure: zahl(a.sura, `${art} Sure`),
        vers: zahl(a.aya, `${art} Vers`),
        ...(art === 'secde' && a.type ? { zusatz: a.type } : {}),
      });
    }
  }
  const anzahl = (art: EinteilungArt) => einteilungen.filter((e) => e.art === art).length;
  if (anzahl('cuz') !== 30) throw new MetadatenFehler(`Erwartet 30 Cüz, gefunden ${anzahl('cuz')}`);
  return { suren, einteilungen };
}
