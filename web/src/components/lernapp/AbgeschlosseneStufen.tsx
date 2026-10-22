import { formatiere, type Ziffern } from '@/lib/lernapp/format';
import { type Oberflaeche, zerlegeRichtung } from '@/lib/lernapp/kurse';
import type { StufenJeKurs } from '@/lib/lernapp/oberflaeche/fortschritt';
import type de from '../../../messages/lernapp/de.json';
import { LernStern } from './Zeichen';

/** Texte: `ansichten.stufen`, Kursnamen aus `kurse.ziel`/`kurse.fuer`, Namen der Stufen aus `lernpfad.stufe`. */
export type AbgeschlosseneStufenTexte = {
  stufen: (typeof de)['ansichten']['stufen'];
  ziel: (typeof de)['kurse']['ziel'];
  fuer: (typeof de)['kurse']['fuer'];
  namen: (typeof de)['lernpfad']['stufe'];
};

/**
 * Abgeschlossene Stufen je Sprachkurs (ADR 0043 Nr. 5 „Stufe je Kurs abgeschlossen (A1–C1)“, L4-03) auf der Seite
 * „Fortschritt“: je Kurs die Stufen, deren Prüfsteine alle geschafft sind (`stufen.ts`). Das Abzeichen „Stufe A1“ gibt es
 * einmal, gleich in welchem Kurs; diese Liste nennt den Kurs. Kein Zeugnis, kein Zertifikat, kein Vergleich mit anderen.
 * Ohne abgeschlossene Stufe erscheint nichts.
 */
export function AbgeschlosseneStufen({
  stufen,
  texte,
  ui,
  ziffern,
}: {
  stufen: readonly StufenJeKurs[];
  texte: AbgeschlosseneStufenTexte;
  ui: Oberflaeche;
  ziffern: Ziffern;
}) {
  if (!stufen.length) return null;
  return (
    <section aria-labelledby="fortschritt-stufen" className="flex flex-col gap-3">
      <h2 id="fortschritt-stufen" className="text-24">
        {texte.stufen.titel}
      </h2>
      <p className="text-16 text-tinte-2">{texte.stufen.text}</p>
      <ul className="flex flex-col gap-3">
        {stufen.map(({ kurs, stufen: fertig }) => {
          const { ziel, ausgang } = zerlegeRichtung(kurs);
          return (
            <li key={kurs} data-kurs={kurs} className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md bg-sand p-4">
              <span className="text-18 font-bold">
                {formatiere(texte.stufen.kurs, { ziel: texte.ziel[ziel], fuer: texte.fuer[ausgang] }, ui, ziffern)}
              </span>
              <ul className="flex flex-wrap gap-2">
                {fertig.map((s) => (
                  <li
                    key={s}
                    data-stufe={s}
                    className="inline-flex items-center gap-2 rounded-pill bg-weiss px-3 py-1 text-16 font-bold text-gruen-800"
                  >
                    <LernStern className="size-5 shrink-0 text-gruen-700" />
                    {texte.namen[s]}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
