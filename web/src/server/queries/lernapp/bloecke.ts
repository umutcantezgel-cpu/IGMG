import 'server-only';
import { textHash } from '@/lib/lernapp/paket/hash';

/**
 * Abfragen über große Listen (Restmangel L3-06): PostgreSQL bindet höchstens 65.535 Parameter je Anweisung, und `inArray`
 * bindet jeden Wert einzeln. Ganze Kurse bis C1 (Aufgaben, Lemmata, Sätze, Prüfungen) kommen darüber, deshalb laufen solche
 * Abfragen in Blöcken nacheinander (keine Spitze an Verbindungen). `BLOECKE.groesse` lässt Platz für die übrigen Parameter
 * der Anweisung; Tests setzen sie klein, um die Zerlegung zu prüfen.
 */
export const BLOECKE = { groesse: 10_000 };

/** `f` je Block von `werte` (ohne Dubletten), Ergebnisse aneinandergehängt; leere Liste ohne Abfrage. */
export async function inBloecken<T, E>(werte: readonly T[], f: (block: T[]) => Promise<E[]>): Promise<E[]> {
  const eindeutig = [...new Set(werte)];
  const ergebnis: E[] = [];
  for (let i = 0; i < eindeutig.length; i += BLOECKE.groesse) ergebnis.push(...(await f(eindeutig.slice(i, i + BLOECKE.groesse))));
  return ergebnis;
}

/**
 * Text-Hash (Audio, `paket/hash.ts`) mit Gedächtnis je Server-Prozess: Studio, Warteschlange und Paketbau brauchen ihn für
 * alle vertonbaren Texte eines Kurses; berechnet wird er je Text nur einmal (Restmangel L3-06: nicht je Aufruf über alle
 * Texte). Der Speicher ist begrenzt; ist er voll, beginnt er neu.
 */
const GEMERKT = new Map<string, string>();
const HOECHSTENS = 200_000;

export function textHashGemerkt(text: string): string {
  let h = GEMERKT.get(text);
  if (h === undefined) {
    h = textHash(text);
    if (GEMERKT.size >= HOECHSTENS) GEMERKT.clear();
    GEMERKT.set(text, h);
  }
  return h;
}
