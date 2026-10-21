'use client';

import { useId } from 'react';
import { richtung } from '../typen';
import { InhaltText } from '../InhaltText';
import type { AufgabenProps } from '../typen';

/** Bewertung dieses Typs (lädt mit der Komponente, `lader.ts`). */
export { bewerteGrammatikTipp as bewerte } from '@/lib/lernapp/aufgaben/grammatik_tipp';

/**
 * Übungstyp `grammatik_tipp` (PLAN §4 „Tipps“): Karte mit Überschriften (Gliederung für Screenreader), Absätzen in der Sprache
 * der Erklärung und Beispielen in der Zielsprache (je mit `lang`/`dir`). Keine Bewertung: „Verstanden – weiter“ führt ohne
 * Wertung zur nächsten Aufgabe (`ueberspringe`).
 */
export default function GrammatikTipp({ aufgabe, weitere, gesperrt, ueberspringe }: AufgabenProps<'grammatik_tipp'>) {
  const t = weitere.aufgaben2.grammatikTipp;
  const id = useId();
  return (
    <article
      aria-labelledby={`${id}-titel`}
      lang={aufgabe.sprache}
      dir={richtung(aufgabe.sprache)}
      className="flex flex-col gap-5 rounded-lg border-2 border-gruen-700 bg-weiss p-5 md:p-8"
    >
      <h3 id={`${id}-titel`} className="text-24 font-bold">
        {aufgabe.titel}
      </h3>
      {aufgabe.abschnitte.map((a, i) => (
        <section key={i} className="flex flex-col gap-3">
          {a.ueberschrift ? <h4 className="text-20 font-bold">{a.ueberschrift}</h4> : null}
          {a.absaetze.map((p, k) => (
            <p key={k} className="text-18">
              {p}
            </p>
          ))}
          {a.beispiele ? (
            <div className="flex flex-col gap-2">
              <p className="text-16 font-bold text-tinte-2">{t.beispiele}</p>
              <ul className="flex flex-col gap-2 border-s-4 border-gruen-700 ps-4">
                {a.beispiele.map((b, k) => (
                  <li key={k} className="flex flex-col">
                    <span className="text-20">
                      <InhaltText inhalt={b.ziel} />
                    </span>
                    {b.uebersetzung ? (
                      <span className="text-16 text-tinte-2">
                        <InhaltText inhalt={b.uebersetzung} />
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ))}
      {gesperrt ? null : (
        <button
          type="button"
          onClick={() => ueberspringe()}
          className="min-h-12 druck self-end rounded-pill bg-gruen-700 px-8 font-bold text-weiss hover:bg-gruen-800"
        >
          {t.verstanden}
        </button>
      )}
    </article>
  );
}
