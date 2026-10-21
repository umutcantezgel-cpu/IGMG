import { normalisiere } from '../../abgleich';
import { RICHTUNGEN, type Sprache, zerlegeRichtung } from '../../kurse';
import { lueckeIn } from '../../paket/bauen';
import type { Inhalte } from './dateien';
import { Befunde } from './typen';

/**
 * Prüfer „Abgleich-Selbsttest“ (PLAN §6.4, blockierend; Vergleichsform aus `lib/lernapp/abgleich`, wie im Spieler):
 * - **Alternativen konsistent:** keine Alternative gleich dem Haupttext oder einer anderen Alternative (Übersetzungen,
 *   Wortbank in die Zielsprache).
 * - **kein Ablenker zufällig richtig:** Ablenker unterscheiden sich in der Vergleichsform von der Antwort – in der Zielsprache
 *   (Auswahl, Bildkarte, Hören, Minimalpaar, Dialog, Geschichte, Lesen, Lücke) und je Richtung in der Übersetzung (Auswahl,
 *   Bildkarte, Hören, Paare); ein Wortbank-Ablenker ist kein Wort der Lösung; Harakat-Varianten sind genau verschieden.
 * - **Alternativen** von Freitext, Diktat und Satzbau sind verschieden vom Zieltext und untereinander.
 * - **Wortbank und Satzbau lösbar:** Der Satz hat mindestens zwei Wörter; die Lücke zeigt auf ein vorhandenes Wort.
 */
export function pruefeAbgleich(inhalte: Inhalte): Befunde {
  const b = new Befunde('abgleich');
  const ziel = new Map<string, string>();
  for (const { daten: d } of inhalte.sprache)
    for (const x of [...d.lemmata.map((l) => ({ ...l, text: l.lemma })), ...d.saetze]) ziel.set(x.schluessel, x.text);
  /** Übersetzungen je Richtung: Bezug → Vergleichsformen (Haupttext zuerst) */
  const uebersetzt = new Map<string, Map<string, string[]>>();
  for (const { pfad, daten: d } of inhalte.uebersetzung) {
    const { ausgang } = zerlegeRichtung(d.richtung);
    const m = uebersetzt.get(d.richtung) ?? new Map<string, string[]>();
    for (const e of d.eintraege) {
      const formen = [e.text, ...(e.alternativen ?? [])].map((t) => normalisiere(t, ausgang));
      const doppelt = formen.findIndex((f, i) => formen.indexOf(f) !== i);
      if (doppelt > 0)
        b.blockierend(pfad, `Alternative ${doppelt} gleich dem Haupttext oder einer anderen Alternative`, `${e.bezug}@${d.richtung}`);
      m.set(e.bezug, formen);
    }
    uebersetzt.set(d.richtung, m);
  }

  for (const { pfad, daten: d } of inhalte.sprache) {
    const s: Sprache = d.kurs;
    const n = (k: string) => (ziel.has(k) ? normalisiere(ziel.get(k)!, s) : null);
    const richtungen = RICHTUNGEN.filter((r) => zerlegeRichtung(r).ziel === s && uebersetzt.has(r));
    /** Ablenker mit gleicher Vergleichsform wie die Antwort (Zielsprache) */
    const gleichImZiel = (antwort: string, ablenker: readonly string[]) => {
      const a = n(antwort);
      return a !== null && ablenker.some((x) => n(x) === a);
    };
    /** Richtungen, in denen ein Ablenker eine Übersetzung der Antwort teilt */
    const gleichUebersetzt = (antwort: string, ablenker: readonly string[]) =>
      richtungen.filter((r) => {
        const m = uebersetzt.get(r)!;
        const a = new Set(m.get(antwort) ?? []);
        return a.size > 0 && ablenker.some((x) => (m.get(x) ?? []).some((f) => a.has(f)));
      });
    for (const l of d.lektionen)
      for (const a of l.aufgaben) {
        const ort = a.schluessel;
        if (a.typ === 'auswahl' || a.typ === 'bild_wort' || a.typ === 'hoeren_waehlen') {
          if (gleichImZiel(a.ziel, a.ablenker)) b.blockierend(pfad, 'Ablenker gleich dem Ziel (Vergleichsform)', ort);
          for (const r of gleichUebersetzt(a.ziel, a.ablenker))
            b.blockierend(pfad, `Ablenker mit gleicher Übersetzung wie das Ziel (${r})`, ort);
        }
        // Minimalpaar: fast gleich ist gewollt, gleich in der Vergleichsform nicht (sonst gäbe es keine richtige Wahl)
        if (a.typ === 'minimalpaare' && gleichImZiel(a.ziel, a.ablenker))
          b.blockierend(pfad, 'Minimalpaar: Ablenker gleich dem Ziel (Vergleichsform)', ort);
        // Freitext, Diktat, Satzbau: Alternativen verschieden vom Zieltext und untereinander
        if (a.typ === 'frei' || a.typ === 'hoeren_schreiben' || a.typ === 'satzbau') {
          const z = ziel.get(a.ziel);
          if (z !== undefined && (a.typ !== 'frei' || a.nach === 'ziel')) {
            const formen = [z, ...(a.alternativen ?? [])].map((t) => normalisiere(t, s));
            if (formen.some((f, i) => formen.indexOf(f) !== i))
              b.blockierend(pfad, 'Alternative gleich dem Zieltext oder einer anderen Alternative', ort);
          }
          if (a.typ === 'satzbau' && z !== undefined && normalisiere(z, s).split(' ').filter(Boolean).length < 2)
            b.blockierend(pfad, 'Satzbau: Satz mit weniger als zwei Wörtern ist nicht als Kacheln lösbar', ort);
        }
        // Lücke: das fehlende Wort gibt es; kein Ablenker ist das Wort oder eine Alternative
        if (a.typ === 'luecke') {
          const z = ziel.get(a.ziel);
          const wort = z === undefined ? undefined : lueckeIn(z, a.wort)?.wort;
          if (z !== undefined && wort === undefined) b.blockierend(pfad, `Lücke: Satz hat kein Wort ${a.wort + 1}`, ort);
          if (wort !== undefined) {
            const richtig = new Set([wort, ...(a.alternativen ?? [])].map((t) => normalisiere(t, s)));
            if ((a.ablenker ?? []).some((x) => richtig.has(normalisiere(x, s))))
              b.blockierend(pfad, 'Lücke: Ablenker gleich dem fehlenden Wort oder einer Alternative', ort);
          }
        }
        // Harakat: Varianten verschieden vom Ziel und untereinander (genau, mit Vokalzeichen: strenger Modus)
        if (a.typ === 'harakat') {
          const z = ziel.get(a.ziel);
          const formen = [...(z !== undefined ? [z] : []), ...a.varianten].map((t) => t.normalize('NFC').trim());
          if (formen.some((f, i) => formen.indexOf(f) !== i))
            b.blockierend(pfad, 'Harakat: Variante gleich dem Ziel oder einer anderen Variante', ort);
        }
        if (a.typ === 'paare')
          a.lemmata.forEach((x, i) => {
            const rest = a.lemmata.slice(i + 1);
            if (gleichImZiel(x, rest)) b.blockierend(pfad, `Paare: zwei Lemmata mit gleicher Form (${x})`, ort);
            for (const r of gleichUebersetzt(x, rest)) b.blockierend(pfad, `Paare: gleiche Übersetzung zu ${x} (${r})`, ort);
          });
        if (a.typ === 'dialog' && gleichImZiel(a.antwort, a.ablenker))
          b.blockierend(pfad, 'Ablenker gleich der Antwort (Vergleichsform)', ort);
        if (a.typ === 'geschichte' || a.typ === 'lesen_fragen')
          a.fragen.forEach((f, i) => {
            if ('antwort' in f && gleichImZiel(f.antwort, f.ablenker))
              b.blockierend(pfad, `Frage ${i + 1}: Ablenker gleich der Antwort (Vergleichsform)`, ort);
          });
        if (a.typ === 'wortbank') {
          const satz = ziel.get(a.satz);
          if (satz === undefined) continue;
          const woerter = normalisiere(satz, s).split(' ').filter(Boolean);
          if (woerter.length < 2) b.blockierend(pfad, 'Wortbank: Satz mit weniger als zwei Wörtern ist nicht als Kacheln lösbar', ort);
          if (a.nach !== 'ziel') continue;
          const formen = [satz, ...(a.alternativen ?? [])].map((t) => normalisiere(t, s));
          if (formen.some((f, i) => formen.indexOf(f) !== i))
            b.blockierend(pfad, 'Wortbank: Alternative gleich dem Satz oder einer anderen Alternative', ort);
          const loesung = new Set(woerter);
          if ((a.ablenker ?? []).some((x) => loesung.has(normalisiere(x, s))))
            b.blockierend(pfad, 'Wortbank: Ablenker ist ein Wort der Lösung', ort);
        }
      }
  }
  return b;
}
