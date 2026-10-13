'use client';

import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import type { Berechnungseinstellungen } from '@/lib/gebetszeiten/typen';
import { leseGemerktenOrt, ORT_SPEICHER, type GemerkterOrt } from '@/lib/gebetszeiten/ort';
import type { MeinOrtTexte } from './MeinOrtRechner';

/** Rechner mit adhan und Ortsliste: lädt erst nach einem Klick (bzw. bei gemerktem Ort), nie mit der Seite (K-12). */
const MeinOrtRechner = lazy(() => import('./MeinOrtRechner').then((m) => ({ default: m.MeinOrtRechner })));

export type { MeinOrtTexte };
type Start = { art: 'gps' } | { art: 'liste' } | { art: 'gemerkt'; ort: GemerkterOrt };

/**
 * Tab „Mein Ort“ (AUFTRAG 3.8, B-21): zwei Knöpfe – Standort verwenden oder Ort wählen. Erst danach lädt der Rechner.
 * Der Standort wird im Browser gerundet und nie gesendet; gemerkt wird nur nach ausdrücklichem Haken (localStorage).
 */
export function MeinOrt({
  texte,
  einstellungen,
  sprache,
  symbole,
}: {
  texte: MeinOrtTexte;
  einstellungen: Berechnungseinstellungen;
  sprache: string;
  symbole: { gps: ReactNode; liste: ReactNode };
}) {
  const [start, setStart] = useState<Start | null>(null);

  useEffect(() => {
    let gemerkt: GemerkterOrt | null = null;
    try {
      gemerkt = leseGemerktenOrt(window.localStorage.getItem(ORT_SPEICHER));
    } catch {
      gemerkt = null;
    }
    // Einmaliger Abgleich mit dem Gerätespeicher nach dem Laden (externes System); ohne gemerkten Ort bleibt alles stehen.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (gemerkt) setStart({ art: 'gemerkt', ort: gemerkt });
  }, []);

  if (start) {
    return (
      <Suspense
        fallback={
          <p role="status" className="min-h-12 text-tinte-2">
            {texte.laedt}
          </p>
        }
      >
        <MeinOrtRechner
          texte={texte}
          einstellungen={einstellungen}
          sprache={sprache}
          start={start}
          zurueck={() => setStart(null)}
          symbole={symbole}
        />
      </Suspense>
    );
  }

  return (
    <section aria-labelledby="mein-ort-titel" className="flex flex-col gap-6 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-8">
      <div className="flex max-w-text flex-col gap-2">
        <h2 id="mein-ort-titel" className="text-30 text-pretty">
          {texte.titel}
        </h2>
        <p className="text-18 leading-einleitung text-tinte-2">{texte.einleitung}</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setStart({ art: 'gps' })}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md bg-gruen-700 px-5 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98"
        >
          {symbole.gps}
          <span>{texte.standortVerwenden}</span>
        </button>
        <button
          type="button"
          onClick={() => setStart({ art: 'liste' })}
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
        >
          {symbole.liste}
          <span>{texte.ortWaehlen}</span>
        </button>
      </div>
      <p className="max-w-text text-16 leading-normal text-tinte-2">{texte.datenschutz}</p>
      <noscript>
        <p className="text-16 text-tinte-2">{texte.ohneJs}</p>
      </noscript>
    </section>
  );
}
