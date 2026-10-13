/**
 * Koran-Lesezeichen im Gerätespeicher (abgestimmt mit dem Koran-Leser, AUFTRAG 3.1). Der Leser schreibt unter
 * `igmg-quran-lesezeichen` ein einzelnes Objekt `{ sure, vers, cuz?, zeit }`; akzeptiert wird auch eine Liste solcher
 * Objekte. `igmg-quran-weiterlesen` hat dasselbe Format (Stelle zum Weiterlesen). `zeit` = ISO-Zeitpunkt oder
 * Millisekunden. Reine Funktionen; nichts davon geht an den Server, bis die Synchronisierung eingeschaltet ist.
 */
export const LESEZEICHEN_SCHLUESSEL = 'igmg-quran-lesezeichen';
export const WEITERLESEN_SCHLUESSEL = 'igmg-quran-weiterlesen';

/** Wie `Stelle` im Koran-Leser (`leser-typen.ts`): `cuz` und `zeit` sind optional. */
export type Lesezeichen = { sure: number; vers: number; cuz?: number | null; zeit?: string | number };

function istLesezeichen(e: unknown): e is Lesezeichen {
  if (!e || typeof e !== 'object' || Array.isArray(e)) return false;
  const z = e as Record<string, unknown>;
  const ganz = (w: unknown, min: number, max: number) => Number.isInteger(w) && (w as number) >= min && (w as number) <= max;
  const zeitOk =
    z.zeit === undefined || ((typeof z.zeit === 'string' || typeof z.zeit === 'number') && !Number.isNaN(new Date(z.zeit).getTime()));
  return ganz(z.sure, 1, 114) && ganz(z.vers, 1, 286) && (z.cuz === undefined || z.cuz === null || ganz(z.cuz, 1, 30)) && zeitOk;
}

const zeitwert = (z: Lesezeichen) => (z.zeit === undefined ? 0 : new Date(z.zeit).getTime());

/** Liest und prüft den gespeicherten Wert (Objekt oder Liste; fremde oder kaputte Einträge fallen weg), neueste zuerst. */
export function leseLesezeichen(roh: string | null): Lesezeichen[] {
  if (!roh) return [];
  try {
    const daten: unknown = JSON.parse(roh);
    const liste = Array.isArray(daten) ? daten : [daten];
    return liste.filter(istLesezeichen).sort((a, b) => zeitwert(b) - zeitwert(a));
  } catch {
    return [];
  }
}

/** Die Stelle zum Weiterlesen (einzelnes Objekt), sonst null. */
export function leseWeiterlesen(roh: string | null): Lesezeichen | null {
  return leseLesezeichen(roh)[0] ?? null;
}

/**
 * Neuer Speicherwert ohne den angegebenen Eintrag – im Format des Lesers: kein Eintrag mehr → null (Schlüssel
 * entfernen), einer → einzelnes Objekt, mehrere → Liste.
 */
export function ohneLesezeichen(liste: Lesezeichen[], weg: Lesezeichen): string | null {
  const rest = liste.filter((e) => !(e.sure === weg.sure && e.vers === weg.vers && e.zeit === weg.zeit));
  if (rest.length === 0) return null;
  return JSON.stringify(rest.length === 1 ? rest[0] : rest);
}
