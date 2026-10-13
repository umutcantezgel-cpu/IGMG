/**
 * Ablaufplan der Bildschirm-Anzeige im Gebetsraum (AUFTRAG 3.10, B-25): Ruhe im Gebetsfenster (Ezan bis Iqama + 15 Min.),
 * Freitagsmodus um das Freitagsgebet, sonst Folien im Wechsel. Reine Funktion; alle Bildschirme rechnen gleich
 * (Wechsel an der Uhrzeit ausgerichtet), damit mehrere Anzeigen synchron laufen.
 */
import { zeitpunkt } from '@/lib/gebetszeiten/naechstes';
import type { Gebet, Tageszeiten } from '@/lib/gebetszeiten/typen';

export type AnzeigeEinstellungen = {
  /** Minuten vom Ezan bis zur Iqama je Gebet; fehlt ein Wert, gibt es für dieses Gebet keine Iqama-Anzeige (MN-14). */
  iqama: Partial<Record<Gebet, number>>;
  ruheNachIqamaMin: number;
  /** Ruhe ohne Iqama-Angabe: Minuten nach dem Ezan. */
  ruheOhneIqamaMin: number;
  freitag: { aktiv: boolean; vorMin: number; nachMin: number };
  folienDauerSek: number;
};

export const STANDARD_ANZEIGE: AnzeigeEinstellungen = {
  iqama: {},
  ruheNachIqamaMin: 15,
  ruheOhneIqamaMin: 20,
  freitag: { aktiv: true, vorMin: 45, nachMin: 60 },
  folienDauerSek: 12,
};

export type FolieZeitplan = { id: string; von: string | null; bis: string | null; wochentage: readonly number[]; reihenfolge: number };

export type AnzeigeZustand =
  | { modus: 'ruhe'; gebet: Gebet; iqama: string | null; bisMs: number }
  | { modus: 'freitag'; bisMs: number }
  | { modus: 'folien'; folieId: string | null; naechsterWechselMs: number };

/** Gebete mit Ezan im Gebetsraum (Güneş ist kein Gebet). */
const GEBETSZEITEN: readonly Gebet[] = ['imsak', 'ogle', 'ikindi', 'aksam', 'yatsi'];

function hhmm(ms: number): string {
  return new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(ms);
}

function wochentagBerlin(jetzt: Date): number {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin', weekday: 'short' }).format(jetzt);
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(name);
}

export function aktiveFolien(folien: readonly FolieZeitplan[], jetzt: Date): FolieZeitplan[] {
  const t = jetzt.getTime();
  const tag = wochentagBerlin(jetzt);
  return folien
    .filter(
      (f) =>
        (!f.von || Date.parse(f.von) <= t) && (!f.bis || Date.parse(f.bis) > t) && (!f.wochentage.length || f.wochentage.includes(tag)),
    )
    .sort((a, b) => a.reihenfolge - b.reihenfolge || a.id.localeCompare(b.id));
}

/** Iqama-Uhrzeit je Gebet (HH:MM, Europe/Berlin); ohne Angabe in der Einstellung kein Eintrag (MN-14: ausgeblendet). */
export function iqamaZeiten(datum: string, zeiten: Tageszeiten, e: AnzeigeEinstellungen): Partial<Record<Gebet, string>> {
  const ergebnis: Partial<Record<Gebet, string>> = {};
  for (const g of GEBETSZEITEN) {
    const min = e.iqama[g];
    if (min !== undefined) ergebnis[g] = hhmm(zeitpunkt(datum, zeiten[g]).getTime() + min * 60_000);
  }
  return ergebnis;
}

/**
 * Ruhefenster eines Tages (B-25): vom Ezan bis Iqama + Ruhe (bzw. Ezan + Ruhe ohne Iqama). In diesen Fenstern zeigt
 * die Anzeige keine Folien und blendet nichts über; Zeiten als Millisekunden seit 1970.
 */
export function ruheFenster(datum: string, zeiten: Tageszeiten, e: AnzeigeEinstellungen): { gebet: Gebet; von: number; bis: number }[] {
  return GEBETSZEITEN.map((g) => {
    const ezan = zeitpunkt(datum, zeiten[g]).getTime();
    const min = e.iqama[g];
    return { gebet: g, von: ezan, bis: ezan + (min !== undefined ? min + e.ruheNachIqamaMin : e.ruheOhneIqamaMin) * 60_000 };
  });
}

export function anzeigeZustand(
  datum: string,
  zeiten: Tageszeiten,
  folien: readonly FolieZeitplan[],
  e: AnzeigeEinstellungen,
  jetzt: Date,
): AnzeigeZustand {
  const t = jetzt.getTime();
  for (const f of ruheFenster(datum, zeiten, e)) {
    const iqamaMin = e.iqama[f.gebet];
    if (t >= f.von && t < f.bis)
      return { modus: 'ruhe', gebet: f.gebet, iqama: iqamaMin !== undefined ? hhmm(f.von + iqamaMin * 60_000) : null, bisMs: f.bis };
  }
  if (e.freitag.aktiv && wochentagBerlin(jetzt) === 5) {
    const mittag = zeitpunkt(datum, zeiten.ogle).getTime();
    if (t >= mittag - e.freitag.vorMin * 60_000 && t < mittag + e.freitag.nachMin * 60_000)
      return { modus: 'freitag', bisMs: mittag + e.freitag.nachMin * 60_000 };
  }
  const aktiv = aktiveFolien(folien, jetzt);
  const dauer = Math.max(5, e.folienDauerSek) * 1000;
  const takt = Math.floor(t / dauer);
  return { modus: 'folien', folieId: aktiv.length ? aktiv[takt % aktiv.length].id : null, naechsterWechselMs: (takt + 1) * dauer };
}
