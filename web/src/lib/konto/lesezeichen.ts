/**
 * Koran-Lesezeichen im Gerätespeicher (abgestimmt mit dem Koran-Leser, AUFTRAG 3.1): Schlüssel
 * `igmg.quran.lesezeichen`, JSON-Liste `{ sure, vers, zeit }` (zeit = ISO-Zeitpunkt oder Millisekunden).
 * Reine Funktionen; nichts davon geht an den Server, bis die Synchronisierung eingeschaltet ist.
 */
export const LESEZEICHEN_SCHLUESSEL = 'igmg.quran.lesezeichen';

export type Lesezeichen = { sure: number; vers: number; zeit: string | number };

function istLesezeichen(e: unknown): e is Lesezeichen {
  if (!e || typeof e !== 'object') return false;
  const z = e as Record<string, unknown>;
  return (
    Number.isInteger(z.sure) &&
    (z.sure as number) >= 1 &&
    (z.sure as number) <= 114 &&
    Number.isInteger(z.vers) &&
    (z.vers as number) >= 1 &&
    (z.vers as number) <= 286 &&
    (typeof z.zeit === 'string' || typeof z.zeit === 'number') &&
    !Number.isNaN(new Date(z.zeit as string | number).getTime())
  );
}

/** Liest und prüft die gespeicherte Liste (fremde oder kaputte Einträge fallen weg), neueste zuerst. */
export function leseLesezeichen(roh: string | null): Lesezeichen[] {
  if (!roh) return [];
  try {
    const daten: unknown = JSON.parse(roh);
    if (!Array.isArray(daten)) return [];
    return daten.filter(istLesezeichen).sort((a, b) => new Date(b.zeit).getTime() - new Date(a.zeit).getTime());
  } catch {
    return [];
  }
}

/** Liste ohne den angegebenen Eintrag (gleiche Sure, gleicher Vers, gleiche Zeit). */
export function ohneLesezeichen(liste: Lesezeichen[], weg: Lesezeichen): Lesezeichen[] {
  return liste.filter((e) => !(e.sure === weg.sure && e.vers === weg.vers && e.zeit === weg.zeit));
}
