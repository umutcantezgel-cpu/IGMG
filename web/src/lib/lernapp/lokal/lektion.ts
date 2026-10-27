import { type Lektion, LektionSchema } from '../aufgaben/schema';
import type { Speicher } from './db';
import { type EinheitVerweis, istPaketKopf, ladePaketGeprueft, type PaketKopf, type PaketOptionen, type Pruefung } from './vorrat';

/**
 * Eine Lektion zum Spielen laden (Stufe C N8). Client-Modul, eigener Chunk des Spielers (`UebenInsel`): nur `LektionSchema` und
 * der Kern aus `vorrat.ts` – ohne `PaketSchema`, Bündel-Leser und Koran-Verzeichnis aus `pakete.ts`, die erst Wiederholung,
 * Einstufung, Tipps und der Koran-Pfad brauchen (KERN 4.0 §9: Spieler zusätzlich zur Hülle ≤ 60 KB). `pakete.ts` gibt beides
 * weiter.
 */

/** Eine Lektion zum Spielen samt dem Kopf ihres Pakets (Einheit, Lektionen mit Schlüssel und Titel für „Weiter lernen“). */
export type LektionImPaket = { paket: PaketKopf; lektion: Lektion };

/**
 * Prüfvermerk einer Lektion des Wissenskurses in gültiger Form (wie `WissensLektionSchema`, ohne Zod): Tag der zweiten
 * Freigabe – oder in der Vorschau (L3-E22) die Kennzeichnung als Entwurf, nie beides –, „für Kinder geeignet“ und
 * mindestens eine Aussage mit Text und Quelle.
 */
function hatPruefvermerk(roh: Record<string, unknown>, schluessel: string): boolean {
  const wissen = roh.wissen as Record<string, unknown> | undefined;
  const v = wissen && typeof wissen === 'object' ? (wissen[schluessel] as Record<string, unknown> | undefined) : undefined;
  if (!v || typeof v !== 'object') return false;
  const aussagen = v.aussagen;
  const datum = typeof v.geprueftAm === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.geprueftAm);
  return (
    (v.entwurf === true ? v.geprueftAm === undefined : datum) &&
    typeof v.kinderGeeignet === 'boolean' &&
    Array.isArray(aussagen) &&
    aussagen.length > 0 &&
    aussagen.every(
      (a: unknown) =>
        typeof a === 'object' &&
        a !== null &&
        typeof (a as Record<string, unknown>).text === 'string' &&
        typeof (a as Record<string, unknown>).quelle === 'string',
    )
  );
}

/**
 * Prüfung für den Spieler: das Paket nur im Kopf (ohne Zod, wie im Lernpfad), die gespielte Lektion voll gegen
 * `LektionSchema`. Die volle Prüfung des ganzen Pakets (≈ 120 Aufgaben) kostete beim Öffnen einer Lektion ≈ 10–45 ms auf dem
 * Hauptfaden (CPU ungedrosselt); jede andere Lektion wird geprüft, wenn sie gespielt wird. Die Bytes sind wie immer über
 * SHA-256 gegen die Adresse geprüft.
 *
 * Wissenskurs (KI-Regel 2, ADR 0040; Absicherung in der Tiefe, Stufe C N9a): Eine Lektion ist nur mit ihrem Prüfvermerk
 * spielbar (`wissen[schluessel]`, zwei Freigaben zum aktuellen Hash, bzw. in der Vorschau mit der Kennzeichnung als Entwurf,
 * L3-E22) – wie es `PaketSchema` für das ganze Paket verlangt.
 * Ein Paket ohne Vermerk für diese Lektion kann der Server nicht ausliefern; fehlt er trotzdem, gibt es nichts zu spielen.
 */
export const nurLektion =
  (schluessel: string): Pruefung<LektionImPaket> =>
  (roh) => {
    if (!istPaketKopf(roh)) return null;
    if (roh.kurs === 'islam' && !hatPruefvermerk(roh as unknown as Record<string, unknown>, schluessel)) return null;
    const l = roh.lektionen.find((x) => x.schluessel === schluessel);
    const geprueft = l ? LektionSchema.safeParse(l) : null;
    return geprueft?.success ? { paket: roh, lektion: geprueft.data } : null;
  };

/** Lektion zum Spielen laden: Vorrat zuerst, sonst Netz (Hash geprüft); voll geprüft wird nur diese Lektion (`nurLektion`). */
export const ladeLektion = (
  sp: Speicher,
  kurs: string,
  einheit: EinheitVerweis,
  schluessel: string,
  o: PaketOptionen & { offline?: boolean } = {},
): Promise<LektionImPaket | null> => ladePaketGeprueft(sp, kurs, einheit, nurLektion(schluessel), o);
