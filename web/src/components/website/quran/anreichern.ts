import { teileMitVersatz, versHtml } from '@/lib/quran/satz';
import { ladeWoerter } from './daten';
import { adresse } from './leser-typen';

/**
 * Nachsatz für sehr lange Suren (`data-roh`, siehe `VOLLSATZ_GRENZE` in lib/quran/satz.ts): Das HTML trägt den Vers
 * als schlichten Text; hier entstehen nach dem Laden dieselben Wort-Spans und Tajwid-Abschnitte wie im vollen Satz –
 * aus dem Text im Dokument und den Tajwid-Segmenten der Wort-Route. Der Text selbst bleibt unverändert (gleiche
 * Codepunkte); passt ein Vers nicht zur Wortliste, bleibt er schlicht.
 */
export async function reichereAn(c: HTMLElement, muster: string): Promise<void> {
  const listen = [...c.querySelectorAll<HTMLElement>('ol[data-sure]')].filter((ol) => ol.querySelector('.vers-ar[data-roh]'));
  for (const ol of listen) {
    const sure = Number(ol.dataset.sure);
    const daten = await ladeWoerter(adresse(muster, { s: sure }));
    for (const p of ol.querySelectorAll<HTMLElement>('.vers-ar[data-roh]')) {
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
