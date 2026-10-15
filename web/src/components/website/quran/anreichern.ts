import { teileMitVersatz, versHtml } from '@/lib/quran/satz';
import { ladeWoerter } from './daten';
import { adresse } from './leser-typen';

/**
 * Höchstens so lange arbeitet der Nachsatz am Stück, dann gibt er den Hauptthread frei (Z-08): Al-Baqara (286 Verse)
 * war eine einzige Aufgabe von rund 470 ms bei CPU 4× und blockierte Eingaben.
 */
export const ABSCHNITT_MS = 8;

/** Hauptthread freigeben: `scheduler.yield()`, wo vorhanden (setzt vor anderen Aufgaben fort), sonst eine neue Aufgabe. */
export function pause(): Promise<void> {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return typeof s?.yield === 'function' ? s.yield() : new Promise((weiter) => setTimeout(weiter, 0));
}

/**
 * Nachsatz für sehr lange Suren (`data-roh`, siehe `VOLLSATZ_GRENZE` in lib/quran/satz.ts): Das HTML trägt den Vers
 * als schlichten Text; hier entstehen nach dem Laden dieselben Wort-Spans und Tajwid-Abschnitte wie im vollen Satz –
 * aus dem Text im Dokument und den Tajwid-Segmenten der Wort-Route. Der Text selbst bleibt unverändert (gleiche
 * Codepunkte); passt ein Vers nicht zur Wortliste, bleibt er schlicht. Die Arbeit läuft in Abschnitten von höchstens
 * `ABSCHNITT_MS` (`jetzt` nur für Tests austauschbar).
 */
export async function reichereAn(c: HTMLElement, muster: string, jetzt: () => number = () => performance.now()): Promise<void> {
  const listen = [...c.querySelectorAll<HTMLElement>('ol[data-sure]')].filter((ol) => ol.querySelector('.vers-ar[data-roh]'));
  for (const ol of listen) {
    const sure = Number(ol.dataset.sure);
    const daten = await ladeWoerter(adresse(muster, { s: sure }));
    let beginn = jetzt();
    for (const p of ol.querySelectorAll<HTMLElement>('.vers-ar[data-roh]')) {
      if (jetzt() - beginn >= ABSCHNITT_MS) {
        await pause();
        beginn = jetzt();
      }
      // Während der Pause kann sich das Dokument geändert haben (Seitenwechsel): nur noch schlichte Verse im Dokument
      if (!p.isConnected || !p.hasAttribute('data-roh')) continue;
      const vers = Number(p.closest<HTMLElement>('[data-v]')?.dataset.v);
      const d = daten.verse[vers];
      const teile = teileMitVersatz(p.textContent ?? '');
      const woerter = teile.filter((t) => t.pos !== null);
      if (!d || woerter.length !== d.w.length || woerter.some((t, i) => t.versatz !== d.w[i]?.[1])) continue;
      p.innerHTML = versHtml(teile, d.tj);
      p.removeAttribute('data-roh');
    }
  }
}
