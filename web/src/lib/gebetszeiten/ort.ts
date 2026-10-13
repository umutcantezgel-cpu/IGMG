/**
 * Gebetszeiten „Mein Ort“ (AUFTRAG 3.8, ADR 0028): reine Hilfsfunktionen ohne Abhängigkeit. Der Standort bleibt im
 * Browser; er wird sofort auf zwei Nachkommastellen (≈ 1 km) gerundet und nie gesendet (Z-19).
 */
import { GEBETE, type Gebet, type Tageszeiten } from './typen';

/** Eintrag der kompakten Ortsliste (`orte.json`, GeoNames CC BY 4.0): [Name, Breite, Länge]. */
export type OrtEintrag = readonly [name: string, breite: number, laenge: number];
export type Lage = { breite: number; laenge: number };

/** Auf zwei Nachkommastellen runden (≈ 1,1 km in Nord-Süd-Richtung). */
export function runde(wert: number): number {
  return Math.round(wert * 100) / 100;
}

export function gerundet(lage: Lage): Lage {
  return { breite: runde(lage.breite), laenge: runde(lage.laenge) };
}

/** Großkreisentfernung in Kilometern (Haversine). */
export function entfernungKm(a: Lage, b: Lage): number {
  const rad = (g: number) => (g * Math.PI) / 180;
  const h =
    Math.sin(rad(b.breite - a.breite) / 2) ** 2 +
    Math.cos(rad(a.breite)) * Math.cos(rad(b.breite)) * Math.sin(rad(b.laenge - a.laenge) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Nächster Ort der Liste mit Entfernung; null bei leerer Liste. */
export function naechsterOrt(lage: Lage, orte: readonly OrtEintrag[]): { name: string; km: number } | null {
  let bester: { name: string; km: number } | null = null;
  for (const [name, breite, laenge] of orte) {
    const km = entfernungKm(lage, { breite, laenge });
    if (!bester || km < bester.km) bester = { name, km };
  }
  return bester;
}

/** Minuten zwischen zwei Zeiten „HH:MM“ (b − a); über Mitternacht hinweg auf ±12 h gefaltet. */
export function minutenUnterschied(a: string, b: string): number {
  const m = (z: string) => {
    const [h, min] = z.split(':').map(Number);
    return h * 60 + min;
  };
  let d = m(b) - m(a);
  if (d > 720) d -= 1440;
  if (d < -720) d += 1440;
  return d;
}

/** Unterschied je Gebet: eigene Zeit minus Wetzlar (positiv = später als in Wetzlar). */
export function unterschiede(eigen: Tageszeiten, wetzlar: Tageszeiten): Record<Gebet, number> {
  return Object.fromEntries(GEBETE.map((g) => [g, minutenUnterschied(wetzlar[g], eigen[g])])) as Record<Gebet, number>;
}

/** Kalenderdatum „JJJJ-MM-TT“ in einer Zeitzone. */
export function datumIn(zone: string, jetzt: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(jetzt);
}

/** Schlüssel im Gerätespeicher (localStorage) – nur nach ausdrücklichem „Ort merken“. */
export const ORT_SPEICHER = 'igmg.gebetszeiten.ort';

/** Gespeicherter Ort (nur nach ausdrücklichem „Ort merken“): Name und gerundete Lage. */
export type GemerkterOrt = { name: string; breite: number; laenge: number; zone: string };

export function leseGemerktenOrt(roh: string | null): GemerkterOrt | null {
  if (!roh) return null;
  try {
    const wert = JSON.parse(roh) as Partial<GemerkterOrt>;
    if (typeof wert.name !== 'string' || typeof wert.breite !== 'number' || typeof wert.laenge !== 'number') return null;
    if (Math.abs(wert.breite) > 90 || Math.abs(wert.laenge) > 180) return null;
    return {
      name: wert.name,
      ...gerundet({ breite: wert.breite, laenge: wert.laenge }),
      zone: typeof wert.zone === 'string' ? wert.zone : 'Europe/Berlin',
    };
  } catch {
    return null;
  }
}
