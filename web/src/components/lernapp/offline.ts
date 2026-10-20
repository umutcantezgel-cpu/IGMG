import { lernAdresse } from '@/lib/lernapp/adressen';
import type { KursSlug, Oberflaeche } from '@/lib/lernapp/kurse';

/**
 * Offline vorbereiten (ADR 0039 Nr. 12, PLAN §3.5): Nach „Einheit offline speichern“ liegen Paket und Töne im Vorrat. Damit
 * die Lektion ohne Netz auch startet, hält der Service Worker der Lern-App die Seiten des Kurses (Lernpfad, Üben,
 * Wiederholen, Tipps) samt ihren Programmteilen vor – auch die nachgeladenen (Spieler, Übungstypen, lokale Datenbank), deren
 * Dateinamen nur in den Programmteilen der Seite stehen (Bitte `{ art: 'seiten' }`, Antwort über den Kanal). Ohne Service
 * Worker (Entwicklung, unsicherer Kontext) bleibt es beim Vorrat der Pakete.
 */

const WARTEN_MS = 30_000;

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

export async function bereiteOfflineVor(ui: Oberflaeche, kurs: KursSlug): Promise<void> {
  await seitenVorhalten(['', 'ueben', 'wiederholen', 'tipps'].map((teil) => lernAdresse(ui, kurs, teil))).catch(() => undefined);
}
