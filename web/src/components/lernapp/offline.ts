import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';

/**
 * Offline vorbereiten (ADR 0039 Nr. 12, PLAN §3.5): Nach „offline speichern“ liegen Paket und Töne im Vorrat. Damit die
 * Lektion ohne Netz auch startet, hält der Service Worker der Lern-App die Seiten des Kurses (Lernpfad, Üben, Wiederholen,
 * Tipps) samt ihren Programmteilen in seinem Kursvorrat – auch die nachgeladenen (Spieler, Übungstypen, lokale Datenbank),
 * deren Dateinamen nur in den Programmteilen der Seite stehen (Bitte `{ art: 'kurs' }`, Antwort über den Kanal).
 *
 * Seitenstand (Stufe C N9a, Befund G-1): Jeder neue Bau ist ein neuer Worker mit eigenem Kursvorrat. Der Lernpfad fragt
 * deshalb ohne Netz nach (`seitenStand`), ob die Seiten des Kurses im Vorrat dieses Baus vollständig sind, und lässt sie sonst
 * neu holen – „offline gespeichert“ steht erst wieder, wenn das gelungen ist.
 * - `vollstaendig`: alles da; `fehlt`: nicht (vollständig) im Vorrat dieses Baus; `netz`: Holen ohne Verbindung gescheitert
 *   (bzw. keine Antwort in der Zeit); `ohne`: kein Service Worker (Entwicklung, unsicherer Kontext, Worker vor N9a) – dann
 *   bleibt es beim Vorrat der Pakete, wie bisher.
 */
export type SeitenStand = 'vollstaendig' | 'fehlt' | 'netz' | 'ohne';

/** Frage ohne Netz: kurz warten. Holen: bis zu zwei Minuten (tiefe Programmteile bei langsamer Verbindung). */
const WARTEN_STAND_MS = 3_000;
const WARTEN_HOLEN_MS = 120_000;

type Bitte = { art: 'kurs' | 'kursStand'; ui: Oberflaeche; kurs: KursSlug };

async function frageWorker(bitte: Bitte, wartenMs: number): Promise<SeitenStand> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator) || typeof MessageChannel === 'undefined') return 'ohne';
  const reg = await navigator.serviceWorker.getRegistration('/lern-app/');
  const worker = reg?.active;
  if (!worker) return 'ohne';
  return new Promise<SeitenStand>((fertig) => {
    const kanal = new MessageChannel();
    const zeit = setTimeout(() => fertig(bitte.art === 'kurs' ? 'netz' : 'ohne'), wartenMs);
    kanal.port1.onmessage = (e: MessageEvent<{ stand?: unknown }>) => {
      clearTimeout(zeit);
      const stand = e.data?.stand;
      // Ein Worker vor N9a antwortet ohne Stand
      fertig(stand === 'vollstaendig' || stand === 'fehlt' || stand === 'netz' ? stand : 'ohne');
    };
    worker.postMessage(bitte, [kanal.port2]);
  });
}

/** Liegen die Seiten des Kurses vollständig im Kursvorrat dieses Baus? (ohne Netz) */
export function seitenStand(ui: Oberflaeche, kurs: KursSlug): Promise<SeitenStand> {
  return frageWorker({ art: 'kursStand', ui, kurs }, WARTEN_STAND_MS).catch((): SeitenStand => 'ohne');
}

/** Seiten des Kurses samt Programmteilen in den Kursvorrat holen (nur was fehlt). */
export function bereiteOfflineVor(ui: Oberflaeche, kurs: KursSlug): Promise<SeitenStand> {
  return frageWorker({ art: 'kurs', ui, kurs }, WARTEN_HOLEN_MS).catch((): SeitenStand => 'netz');
}
