'use client';

import { Info, TriangleAlert } from 'lucide-react';
import { useEffect, useRef } from 'react';

type Texte = Record<
  'titelDe' | 'titelTr' | 'textDe' | 'textTr' | 'blockDe' | 'blockTr' | 'knopfDe' | 'knopfTr' | 'einmalDe' | 'einmalTr',
  string
> & { punkteDe: string[]; punkteTr: string[] };

const SCHLUESSEL = 'igmg-konzepthinweis-gesehen';

/**
 * Öffnet den Hinweis schon beim ersten Zeichnen (vor der Hydrierung): Ein erst nach der Hydrierung eingeblendeter
 * Dialog wäre das späteste große Element (LCP, K-12). Schließen ohne JavaScript über `<form method="dialog">`;
 * der Merker wird beim Schließen gesetzt. Öffentliche CSP erlaubt Inline-Skripte (ADR 0012).
 */
const SOFORT = `(function(){var d=document.getElementById('konzepthinweis');if(!d||!d.showModal)return;try{if(localStorage.getItem('${SCHLUESSEL}')==='1')return}catch(e){}d.addEventListener('close',function(){try{localStorage.setItem('${SCHLUESSEL}','1')}catch(e){}});d.showModal()})()`;

/**
 * Konzept-Hinweis (design/DisclaimerDialog.dc.html), zweisprachig DE/TR wie im Design. Erscheint einmal je Browser
 * (localStorage, kein Cookie), nur solange in der Verwaltung eingeschaltet (Einstellung „konzepthinweis“).
 * Texte wörtlich aus dem Bestand – fachliche Prüfung MENSCHEN M-034.
 */
export function KonzeptHinweis({ texte }: { texte: Texte }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    let gesehen = false;
    try {
      gesehen = window.localStorage.getItem(SCHLUESSEL) === '1';
    } catch {
      gesehen = false;
    }
    // Client-Navigation (Inline-Skript läuft dann nicht) oder Skript blockiert: hier öffnen
    if (!gesehen && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);
  const schliessen = () => {
    try {
      window.localStorage.setItem(SCHLUESSEL, '1');
    } catch {
      /* Speicher nicht verfügbar – Hinweis erscheint dann erneut */
    }
    dialog.current?.close();
  };
  const block = (lang: 'de' | 'tr', titel: string, punkte: string[]) => (
    <div lang={lang} className="flex-1 rounded-lg border border-linie bg-weiss p-4">
      <h3 className="flex items-center gap-2 font-text text-16 font-bold tracking-normal text-info">
        <Info aria-hidden className="size-4" />
        {titel}
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-16">
        {punkte.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
  return (
    <>
      {/* Das Skript SOFORT öffnet den Dialog vor der Hydrierung (Attribut `open`) – der Unterschied ist gewollt */}
      <dialog
        id="konzepthinweis"
        suppressHydrationWarning
        ref={dialog}
        role="alertdialog"
        aria-labelledby="hinweis-titel"
        aria-describedby="hinweis-text"
        onCancel={schliessen}
        className="m-auto w-[calc(100%-32px)] max-w-[680px] rounded-lg bg-papier p-0 text-tinte shadow-s3 backdrop:bg-tinte/55"
      >
        <div className="bg-warnung-toenung px-6 pt-6 pb-4">
          <h2 id="hinweis-titel" className="flex items-start gap-3 text-24 leading-tight">
            <TriangleAlert aria-hidden className="mt-1 size-6 shrink-0 text-warnung" />
            <span>
              {texte.titelDe} / <span lang="tr">{texte.titelTr}</span>
            </span>
          </h2>
          <p id="hinweis-text" className="mt-2 text-16">
            {texte.textDe}
            <br />
            <span lang="tr">{texte.textTr}</span>
          </p>
        </div>
        <div className="flex flex-col gap-3 px-6 py-4 md:flex-row">
          {block('de', texte.blockDe, texte.punkteDe)}
          {block('tr', texte.blockTr, texte.punkteTr)}
        </div>
        <div className="flex flex-col items-center gap-3 border-t border-linie bg-weiss px-6 py-5">
          <form method="dialog" className="contents">
            <button
              type="submit"
              onClick={schliessen}
              className="inline-flex min-h-12 cursor-pointer items-center rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800"
            >
              {texte.knopfDe} / <span lang="tr">&nbsp;{texte.knopfTr}</span>
            </button>
          </form>
          <p className="text-center text-16 text-tinte-2">
            {texte.einmalDe} / <span lang="tr">{texte.einmalTr}</span>
          </p>
        </div>
      </dialog>
      {/* festes Skript ohne Nutzereingaben (SOFORT) */}
      <script dangerouslySetInnerHTML={{ __html: SOFORT }} />
    </>
  );
}
