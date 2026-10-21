import 'server-only';
import { notFound } from 'next/navigation';
import { funktionAn } from '@/lib/funktionen';
import type { Aktion } from '@/lib/rechte/matrix';
import { type Angemeldet, verlangeSeitenRecht } from '@/lib/rechte/pruefe';

/**
 * Seiten der Lern-App-Verwaltung (L3-06): Sitzung mit zweitem Faktor und Recht (sonst Anmeldung bzw. „kein Zugriff“), dann
 * der Schalter `lernapp` (aus → 404, das Modul verschwindet aus der Seitenleiste; ADR 0035). Ohne Datenbank zeigt das
 * Layout der Verwaltung den Hinweis des Beispielmodus, bevor diese Seiten laufen.
 */
export async function verlangeLernappSeite(aktion: Aktion): Promise<Angemeldet> {
  const a = await verlangeSeitenRecht(aktion);
  if (!(await funktionAn('lernapp'))) notFound();
  return a;
}
