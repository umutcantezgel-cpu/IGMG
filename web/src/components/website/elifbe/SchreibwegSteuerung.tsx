'use client';

import { useState, useSyncExternalStore } from 'react';

const REDUZIERT = '(prefers-reduced-motion: reduce)';
const nichts = () => () => {};
function aufBewegung(rueckruf: () => void) {
  const m = matchMedia(REDUZIERT);
  m.addEventListener('change', rueckruf);
  return () => m.removeEventListener('change', rueckruf);
}

/**
 * Steuerung des Schreibwegs (B-17): „Nochmal schreiben“ startet die CSS-Animation neu, „Zugpfeile“ blendet die
 * nummerierten Pfeile ein (`data-pfeile` am SVG). Erscheint erst nach dem Laden (ohne JavaScript ist nichts zu
 * bedienen); die Zeile hält ihre Höhe, damit nichts springt. Bei reduzierter Bewegung gibt es kein „Nochmal“, die
 * Pfeile sind dann von Anfang an an.
 */
export function SchreibwegSteuerung({ ziel, texte }: { ziel: string; texte: { nochmal: string; pfeile: string } }) {
  // Erst im Browser bedienbar; bis zur ersten Wahl folgen die Pfeile dem Wunsch nach reduzierter Bewegung
  const bereit = useSyncExternalStore(nichts, () => true, () => false);
  const reduziert = useSyncExternalStore(aufBewegung, () => matchMedia(REDUZIERT).matches, () => false);
  const [wahl, setPfeile] = useState<boolean | null>(null);
  const pfeile = wahl ?? reduziert;

  function svg() {
    return document.getElementById(ziel);
  }

  function nochmal() {
    const el = svg();
    if (!el) return;
    el.dataset.pfeile = 'aus';
    setPfeile(false);
    for (const zug of el.querySelectorAll<SVGPathElement>('.schreibweg-zug')) {
      if (typeof zug.getAnimations === 'function' && zug.getAnimations().length) {
        for (const a of zug.getAnimations()) {
          a.cancel();
          a.play();
        }
      } else {
        // Rückfall: Klasse kurz entfernen, Stil neu berechnen lassen, wieder setzen
        zug.classList.remove('schreibweg-zug');
        void zug.getBoundingClientRect();
        zug.classList.add('schreibweg-zug');
      }
    }
  }

  function umschalten() {
    const el = svg();
    if (!el) return;
    const neu = !pfeile;
    el.dataset.pfeile = neu ? 'an' : 'aus';
    setPfeile(neu);
  }

  return (
    <div className="flex min-h-12 flex-wrap items-center gap-3">
      {bereit ? (
        <>
          <button
            type="button"
            onClick={nochmal}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-gruen-700 px-5 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98 motion-reduce:hidden"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {texte.nochmal}
          </button>
          <button
            type="button"
            aria-pressed={pfeile}
            onClick={umschalten}
            className="inline-flex min-h-12 items-center gap-2 rounded-pill border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 aria-pressed:bg-gruen-50"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            {texte.pfeile}
          </button>
        </>
      ) : null}
    </div>
  );
}
