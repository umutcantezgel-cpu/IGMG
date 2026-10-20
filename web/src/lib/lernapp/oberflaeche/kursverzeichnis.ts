import type { KursSlug, Stufe } from '../kurse';

/**
 * Kursverzeichnis für den Lernpfad (PLAN §3.1, §3.10): Einheiten eines Kurses mit Stufe und Titel. Die Route
 * `/lern-app/pakete/[kurs]` und ihr Format kommen aus Paket L1-05; die Zusammenführung bildet es auf diese kleine Form ab
 * und ersetzt `ladeKursverzeichnis`. Bis dahin gibt es kein Verzeichnis, und der Lernpfad zeigt „wird vorbereitet“.
 */
export type LernpfadEinheit = { schluessel: string; stufe: Stufe; titel: string; lektionen: { schluessel: string; titel: string }[] };
export type LernpfadVerzeichnis = { kurs: KursSlug; einheiten: LernpfadEinheit[] };

export async function ladeKursverzeichnis(kurs: KursSlug): Promise<LernpfadVerzeichnis | null> {
  void kurs;
  return null;
}
