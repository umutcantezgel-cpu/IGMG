import texte from '../../../../messages/verwaltung/rezitationen.json';
import type { RezitationZustand } from '@/server/actions/rezitationen';

const BEKANNT = new Set(Object.keys(texte.rezitationen.fehler));

/** Fehlerschlüssel der Werkstatt (Action, Route, Browser) → Textschlüssel unter `verwaltung.rezitationen.fehler`. */
export function fehlerSchluessel(schluessel: string): string {
  return BEKANNT.has(schluessel) ? schluessel : 'hochladenFehlgeschlagen';
}

/** Server Action mit Formulardaten aufrufen (die Werkstatt hat keine klassischen Formulare). */
export async function rufe(
  aktion: (vorher: RezitationZustand, fd: FormData) => Promise<RezitationZustand>,
  felder: Record<string, string>,
): Promise<RezitationZustand> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(felder)) fd.set(k, v);
  return aktion({}, fd);
}
