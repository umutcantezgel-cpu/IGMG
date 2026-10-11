import { darf, type RollenZuweisung } from '@/lib/rechte/matrix';
import { rechtListe, type Modul, type ModulSchluessel } from '../shell/module';

/** Module mit einer Kennzahl-Kachel auf der Übersicht (Blatt V01); Reihenfolge wie die Seitenleiste. */
export const KENNZAHL_MODULE = ['neuigkeiten', 'veranstaltungen', 'ankuendigungen', 'eingaenge', 'postfach', 'tickets'] as const;
export type KennzahlModul = (typeof KENNZAHL_MODULE)[number];

export type SichtbareKachel = { schluessel: KennzahlModul; pfad: string };

function istKennzahlModul(schluessel: ModulSchluessel): schluessel is KennzahlModul {
  return (KENNZAHL_MODULE as readonly ModulSchluessel[]).includes(schluessel);
}

/**
 * Kacheln, die diese Person sieht: gebautes Modul mit Kennzahl und mindestens einem Leserecht des Moduls.
 * Die Reihenfolge folgt der übergebenen Modulliste (`MODULE`), damit ein später freigeschaltetes Modul ohne
 * Änderung an der Übersicht erscheint.
 */
export function sichtbareKacheln(modul: readonly Modul[], rollen: readonly RollenZuweisung[]): SichtbareKachel[] {
  const kacheln: SichtbareKachel[] = [];
  for (const m of modul) {
    if (!m.gebaut || !istKennzahlModul(m.schluessel)) continue;
    if (!rechtListe(m).some((r) => darf(rollen, r))) continue;
    kacheln.push({ schluessel: m.schluessel, pfad: m.pfad });
  }
  return kacheln;
}
