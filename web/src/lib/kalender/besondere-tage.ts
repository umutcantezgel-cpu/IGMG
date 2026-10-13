import { hijriDatum } from '@/lib/gebetszeiten/hijri';

/**
 * Besondere Tage im islamischen Jahr (AUFTRAG 3.10, MN-15): aus dem Kalender „islamic-umalqura“ berechnet und deshalb
 * „vorläufig“, bis der Imam sie bestätigt (Tabelle `besonderer_tag`, Quelle „bestätigt“). Die Kandil-Nächte beginnen am
 * Abend vor dem angegebenen Tag; `datum` ist der Kalendertag, an dessen Abend die Nacht beginnt.
 * Reine Funktionen ohne Datenbank.
 */
export type BesondereArt = 'kandil' | 'bayram' | 'ramadan_beginn' | 'ramadan_ende' | 'asure' | 'hicri_neujahr';
export type BesondererSchluessel =
  | 'hicriNeujahr'
  | 'asure'
  | 'mevlid'
  | 'regaib'
  | 'mirac'
  | 'berat'
  | 'ramadanBeginn'
  | 'kadir'
  | 'ramazanBayrami'
  | 'arefe'
  | 'kurbanBayrami';

export type BesondererTagVorschlag = { schluessel: BesondererSchluessel; art: BesondereArt; datum: string; tage: number };

function tagPlus(datum: string, n: number): string {
  const d = new Date(`${datum}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** Alle Kalendertage eines gregorianischen Jahres mit ihrem Hidschri-Datum. */
function jahrTage(jahr: number): { datum: string; h: ReturnType<typeof hijriDatum>; wochentag: number }[] {
  const tage = [];
  for (let d = `${jahr}-01-01`; d <= `${jahr}-12-31`; d = tagPlus(d, 1)) {
    tage.push({ datum: d, h: hijriDatum(d), wochentag: new Date(`${d}T12:00:00Z`).getUTCDay() });
  }
  return tage;
}

/**
 * Vorschläge für ein gregorianisches Jahr. Nächte (Kandil, Kadir) liegen am Abend des Vortags des Hidschri-Tags:
 * Mevlid 12. Rebiülevvel, Mirac 27. Recep, Berat 15. Şaban, Kadir 27. Ramazan; Regaib ist die Nacht zum ersten Freitag
 * im Recep (also Donnerstagabend).
 */
export function besondereTage(jahr: number): BesondererTagVorschlag[] {
  const tage = jahrTage(jahr);
  // Auch die Tage des Folgejahres-Anfangs, damit Nächte am 31.12. gefunden werden
  const folge = jahrTage(jahr + 1).slice(0, 2);
  const alle = [...tage, ...folge];
  const finde = (monat: number, tag: number) => alle.filter((t) => t.h.monat === monat && t.h.tag === tag).map((t) => t.datum);
  const ergebnis: BesondererTagVorschlag[] = [];
  const nimm = (schluessel: BesondererSchluessel, art: BesondereArt, daten: string[], tageAnzahl = 1, nacht = false) => {
    for (const d of daten) {
      const datum = nacht ? tagPlus(d, -1) : d;
      if (datum.startsWith(String(jahr))) ergebnis.push({ schluessel, art, datum, tage: tageAnzahl });
    }
  };
  nimm('hicriNeujahr', 'hicri_neujahr', finde(1, 1));
  nimm('asure', 'asure', finde(1, 10));
  nimm('mevlid', 'kandil', finde(3, 12), 1, true);
  // Regaib: erster Freitag im Recep → Nacht am Donnerstag davor
  const recepFreitage = alle.filter((t) => t.h.monat === 7 && t.h.tag <= 7 && t.wochentag === 5).map((t) => t.datum);
  nimm('regaib', 'kandil', recepFreitage.slice(0, 1), 1, true);
  nimm('mirac', 'kandil', finde(7, 27), 1, true);
  nimm('berat', 'kandil', finde(8, 15), 1, true);
  nimm('ramadanBeginn', 'ramadan_beginn', finde(9, 1));
  nimm('kadir', 'kandil', finde(9, 27), 1, true);
  nimm('ramazanBayrami', 'bayram', finde(10, 1), 3);
  nimm('arefe', 'bayram', finde(12, 9));
  nimm('kurbanBayrami', 'bayram', finde(12, 10), 4);
  return ergebnis.sort((a, b) => a.datum.localeCompare(b.datum));
}

/** Ramadan-Zeitraum (1. Ramazan bis letzter Tag vor 1. Şevval) in einem gregorianischen Jahr; null ohne Ramadan. */
export function ramadanZeitraum(jahr: number): { von: string; bis: string } | null {
  const tage = jahrTage(jahr).filter((t) => t.h.monat === 9);
  return tage.length ? { von: tage[0].datum, bis: tage.at(-1)!.datum } : null;
}
