import { ladeAusgabeJson } from './daten';
import { adresse, fuelle, type LeserTexte } from './leser-typen';

/**
 * Ausgabewechsel im Leser (lazy, erst nach der Wahl): lädt den Text der Ausgabe je Sure aus der statischen JSON-Route
 * und setzt ihn unter die Verse. Hinweis „Freigabe ausstehend“, Quellenzeile und `lang` folgen der Ausgabe.
 * Nur Text (textContent), kein HTML aus den Daten.
 */
export async function setzeAusgabe(
  c: HTMLElement,
  id: string,
  muster: string,
  texte: LeserTexte,
  aktiv: () => boolean,
  melde: (text: string) => void,
): Promise<boolean> {
  const listen = [...c.querySelectorAll<HTMLElement>('ol[data-sure]')];
  melde(texte.leser.ladeUebersetzung);
  try {
    const daten = await Promise.all(listen.map((ol) => ladeAusgabeJson(adresse(muster, { s: Number(ol.dataset.sure), a: id }))));
    if (!aktiv()) return false;
    listen.forEach((ol, i) => {
      const d = daten[i];
      if (!d) return;
      ol.lang = d.ausgabe.sprache;
      const text = new Map(d.verse);
      for (const li of ol.querySelectorAll<HTMLElement>('li[data-v]')) {
        const v = Number(li.dataset.v);
        let p = li.querySelector<HTMLElement>('.vers-ue');
        if (!p) {
          p = document.createElement('p');
          p.className = 'vers-ue';
          li.append(p);
        }
        // Die Versnummer setzt das CSS (Zähler); hier nur der Text
        p.textContent = text.get(v) ?? '';
      }
    });
    const ausgabe = daten[0]?.ausgabe;
    for (const el of c.querySelectorAll<HTMLElement>('[data-hinweis-ausstehend]')) el.hidden = !ausgabe?.ausstehend;
    for (const el of c.querySelectorAll<HTMLElement>('[data-keine-uebersetzung]')) el.hidden = true;
    for (const el of document.querySelectorAll<HTMLElement>('[data-quelle-uebersetzung]')) {
      if (!c.closest('[data-seite]')?.contains(el)) continue;
      el.hidden = false;
      el.textContent = ausgabe ? fuelle(texte.quelleUebersetzung, { titel: ausgabe.titel, uebersetzer: ausgabe.uebersetzer }) : '';
    }
    melde('');
    return true;
  } catch {
    if (aktiv()) melde(texte.leser.fehlerUebersetzung);
    return false;
  }
}
