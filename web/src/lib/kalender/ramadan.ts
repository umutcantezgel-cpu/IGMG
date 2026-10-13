import { hijriDatum } from '@/lib/gebetszeiten/hijri';
import { tagPlus } from './raster';

/**
 * Der Ramadan, der heute läuft oder als nächster beginnt (AUFTRAG 3.10): berechnet über den Kalender
 * „islamic-umalqura“ und daher vorläufig (MN-15), bis der Imam Beginn und Ende bestätigt. Reine Funktion.
 * `laeuft` heißt: `heute` liegt im Ramadan. Sucht höchstens 400 Tage voraus.
 */
export type RamadanZeitraum = { von: string; bis: string; laeuft: boolean; hijriJahr: number };

export function ramadanUm(heute: string): RamadanZeitraum | null {
  const istRamadan = (d: string) => hijriDatum(d).monat === 9;
  let von: string | null = null;
  if (istRamadan(heute)) {
    von = heute;
    while (istRamadan(tagPlus(von, -1))) von = tagPlus(von, -1);
  } else {
    for (let i = 1, d = tagPlus(heute, 1); i <= 400; i++, d = tagPlus(d, 1)) {
      if (istRamadan(d)) {
        von = d;
        break;
      }
    }
  }
  if (!von) return null;
  let bis = von;
  while (istRamadan(tagPlus(bis, 1))) bis = tagPlus(bis, 1);
  return { von, bis, laeuft: heute >= von && heute <= bis, hijriJahr: hijriDatum(von).jahr };
}

/** Alle Kalendertage von `von` bis `bis` (inklusive). */
export function tageVonBis(von: string, bis: string): string[] {
  const tage: string[] = [];
  for (let d = von; d <= bis; d = tagPlus(d, 1)) tage.push(d);
  return tage;
}

/** Monate „JJJJ-MM“, die der Zeitraum berührt (für `ladeGebetszeitenMonat`). */
export function monateVonBis(von: string, bis: string): string[] {
  const monate: string[] = [];
  for (const d of tageVonBis(von, bis)) if (!monate.includes(d.slice(0, 7))) monate.push(d.slice(0, 7));
  return monate;
}
