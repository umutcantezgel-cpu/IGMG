import { lernAdresse } from '@/lib/lernapp/adressen';
import { istImplementiert, type AufgabenTyp } from '@/lib/lernapp/aufgaben/schema';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';
import type { Paket } from '@/lib/lernapp/paket/typen';
import { AUFGABEN_LADER } from './aufgaben/lader';

/**
 * Offline vorbereiten (ADR 0039 Nr. 12, PLAN §3.5): Nach „Einheit offline speichern“ liegen Paket und Töne im Vorrat. Damit
 * die Lektion ohne Netz auch startet, kommen dazu
 * - die Programmteile des Spielers und der Übungstypen der Einheit (`import()`; der Service Worker hält `/_next/static/**`
 *   beim Laden vor) und
 * - die Seiten des Kurses (Lernpfad, Üben, Wiederholen, Tipps) samt ihren Programmteilen: Bitte `{ art: 'seiten' }` an den
 *   Service Worker der Lern-App; er antwortet über den Kanal, wenn alles vorgehalten ist.
 * Ohne Service Worker (Entwicklung, unsicherer Kontext) bleibt es beim Vorrat der Pakete.
 */

const WARTEN_MS = 20_000;

/** Übungstypen, die die Lektionen einer Einheit brauchen. */
export const typenDer = (paket: Pick<Paket, 'lektionen'>): AufgabenTyp[] => [
  ...new Set(paket.lektionen.flatMap((l) => l.aufgaben.map((a) => a.typ))),
];

async function seitenVorhalten(pfade: string[]): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration('/lern-app/');
  const worker = reg?.active;
  if (!worker) return;
  await new Promise<void>((fertig) => {
    const kanal = new MessageChannel();
    const zeit = setTimeout(fertig, WARTEN_MS);
    kanal.port1.onmessage = () => {
      clearTimeout(zeit);
      fertig();
    };
    worker.postMessage({ art: 'seiten', pfade }, [kanal.port2]);
  });
}

export async function bereiteOfflineVor(ui: Oberflaeche, kurs: KursSlug, typen: readonly AufgabenTyp[]): Promise<void> {
  await Promise.allSettled([
    import('./Spieler'),
    ...typen.filter(istImplementiert).map((t) => AUFGABEN_LADER[t]()),
    seitenVorhalten(['', 'ueben', 'wiederholen', 'tipps'].map((teil) => lernAdresse(ui, kurs, teil))),
  ]);
}
