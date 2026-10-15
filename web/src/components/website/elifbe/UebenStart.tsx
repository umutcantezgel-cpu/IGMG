'use client';

import { lazy, Suspense, useState, useSyncExternalStore } from 'react';
import { FORTSCHRITT_SCHLUESSEL, leseFortschritt, UEBUNGS_ARTEN, type UebungsArt } from '@/lib/elifbe/uebung';
import { fuelle, type UebenDaten, type UebenTexte } from './uebenTypen';

/** Zahl der geübten Buchstaben aus localStorage (Server und Hydrierung: null, danach der gespeicherte Stand). */
const hoerer = new Set<() => void>();
function abonnieren(rueckruf: () => void) {
  hoerer.add(rueckruf);
  addEventListener('storage', rueckruf);
  return () => {
    hoerer.delete(rueckruf);
    removeEventListener('storage', rueckruf);
  };
}
function geuebtJetzt(): number {
  try {
    return Object.keys(leseFortschritt(localStorage.getItem(FORTSCHRITT_SCHLUESSEL)).buchstaben).length;
  } catch {
    return 0;
  }
}

const Uebungen = lazy(() => import('./Uebungen').then((m) => ({ default: m.Uebungen })));

/** Zeichen je Übungsart (Lucide-Pfade, ISC; 24-px-Raster, 2-px-Strich). */
const ZEICHEN: Record<UebungsArt | 'alle', string[]> = {
  alle: ['M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z'],
  erkennen: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z'],
  zuordnen: ['M8 3 4 7l4 4', 'M4 7h16', 'm16 21 4-4-4-4', 'M20 17H4'],
  lesen: ['M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z', 'M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z'],
  nachspuren: ['M12 20h9', 'M16.38 3.62a1 1 0 0 1 3 3L7.37 18.64a2 2 0 0 1-.86.5l-2.87.84a.5.5 0 0 1-.62-.62l.84-2.87a2 2 0 0 1 .5-.86z'],
};

/**
 * Einstieg in die Übungen (B-18): Auswahl der Übungsart; die Übungsmaschine (`Uebungen`, Lazy-Chunk ≤ 10 kB gz) lädt
 * erst nach dem Klick (Interaktion nur über dynamischen Import nach einer Nutzeraktion). Der Fortschritt bleibt im
 * Browser; er erscheint nach dem Laden in einer Zeile mit fester Höhe.
 */
export function UebenStart({ daten, texte }: { daten: UebenDaten; texte: UebenTexte }) {
  const [arten, setArten] = useState<UebungsArt[] | null>(null);
  const geuebt = useSyncExternalStore(abonnieren, geuebtJetzt, () => null);

  function vergessen() {
    try {
      localStorage.removeItem(FORTSCHRITT_SCHLUESSEL);
    } catch {
      // Speicher gesperrt: nichts zu löschen
    }
    hoerer.forEach((h) => h());
  }

  if (arten) {
    return (
      <Suspense
        fallback={
          <p role="status" className="min-h-40 text-18 text-tinte-2">
            {texte.laden}
          </p>
        }
      >
        <Uebungen arten={arten} daten={daten} texte={texte} zurueck={() => setArten(null)} />
      </Suspense>
    );
  }

  const wahl: { schluessel: UebungsArt | 'alle'; titel: string; text: string; arten: UebungsArt[] }[] = [
    { schluessel: 'alle', titel: texte.alle, text: texte.alleText, arten: [...UEBUNGS_ARTEN] },
    ...UEBUNGS_ARTEN.map((a) => ({ schluessel: a, ...texte.arten[a], arten: [a] })),
  ];

  return (
    <section aria-labelledby="ueben-wahl" className="flex flex-col gap-6">
      <h2 id="ueben-wahl" className="text-display-2">
        {texte.wahl}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {wahl.map((w, i) => (
          <li key={w.schluessel} className={i === 0 ? 'sm:col-span-2 lg:col-span-4' : undefined}>
            <button
              type="button"
              onClick={() => setArten(w.arten)}
              className={`flex size-full min-h-24 druck items-center gap-4 rounded-lg border-2 p-5 text-left transition duration-(--dauer-rueckmeldung) ${
                i === 0
                  ? 'border-gruen-700 bg-gruen-700 text-weiss hover:bg-gruen-800'
                  : 'border-linie bg-weiss text-tinte shadow-s1 hover:border-gruen-700 hover:bg-gruen-50'
              }`}
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-pill ${i === 0 ? 'bg-weiss text-gruen-800' : 'bg-gruen-50 text-gruen-800'}`}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="size-6 fill-none stroke-current"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ZEICHEN[w.schluessel].map((d) => (
                    <path key={d} d={d} />
                  ))}
                </svg>
              </span>
              <span className="flex flex-col">
                <span className="text-20 font-bold">{w.titel}</span>
                <span className={i === 0 ? 'text-16 text-gruen-100' : 'text-16 text-tinte-2'}>{w.text}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <div className="flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 text-16 text-tinte-2">
        {geuebt !== null ? (
          <>
            <span>{fuelle(texte.geuebt, { anzahl: geuebt })}</span>
            {geuebt > 0 ? (
              <button type="button" onClick={vergessen} className="min-h-12 font-bold text-gruen-800 underline underline-offset-4">
                {texte.vergessen}
              </button>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
