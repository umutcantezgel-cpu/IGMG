import { Info, TriangleAlert } from 'lucide-react';
import { KonzeptHinweisOeffner } from './KonzeptHinweisOeffner';
import { KONZEPTHINWEIS_GESEHEN } from './konzepthinweis-merker';

type Texte = Record<
  'titelDe' | 'titelTr' | 'textDe' | 'textTr' | 'blockDe' | 'blockTr' | 'knopfDe' | 'knopfTr' | 'einmalDe' | 'einmalTr',
  string
> & { punkteDe: string[]; punkteTr: string[] };

/**
 * Öffnet den Hinweis schon beim ersten Zeichnen (vor der Hydrierung): Ein erst nach der Hydrierung eingeblendeter
 * Dialog wäre das späteste große Element (LCP, K-12). Steht der Hinweis in einem Suspense-Inhalt, den React ausgelagert
 * streamt (`<div hidden id="S:…">`, später an seinen Platz verschoben), öffnet das Skript ihn erst nach dem Verschieben:
 * Ein vorher geöffneter Dialog verlöre beim Verschieben die oberste Ebene (Modalität) und erschiene erst nach der
 * Hydrierung erneut (Z-08, Hadith und Elifbe). Schließen ohne JavaScript über `<form method="dialog">`; der Merker wird
 * bei jedem Schließen gesetzt (Knopf und Escape lösen `close` aus). Öffentliche CSP erlaubt Inline-Skripte (ADR 0012).
 */
export const SOFORT = `(function(){var d=document.getElementById('konzepthinweis');if(!d||!d.showModal)return;try{if(localStorage.getItem('${KONZEPTHINWEIS_GESEHEN}')==='1')return}catch(e){}d.addEventListener('close',function(){try{localStorage.setItem('${KONZEPTHINWEIS_GESEHEN}','1')}catch(e){}});function z(){if(d.open)return;d.showModal();var h=document.getElementById('hinweis-titel');if(h)h.focus()}function p(){return d.isConnected&&!d.closest('[hidden]')}if(p())return z();var m=new MutationObserver(function(){if(d.open)m.disconnect();else if(p()){m.disconnect();z()}});m.observe(document.documentElement,{childList:true,subtree:true})})()`;

/**
 * Konzept-Hinweis (design/DisclaimerDialog.dc.html), zweisprachig DE/TR wie im Design. Erscheint einmal je Browser
 * (localStorage, kein Cookie), nur solange in der Verwaltung eingeschaltet (Einstellung „konzepthinweis“).
 * Texte wörtlich aus dem Bestand – fachliche Prüfung MENSCHEN M-034. Das Markup kommt vom Server (kein Client-JavaScript
 * für Texte und Symbole, Z-08); nur `KonzeptHinweisOeffner` läuft im Browser (Client-Navigation, Rückfall).
 */
export function KonzeptHinweis({ texte }: { texte: Texte }) {
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
      {/* Das Skript SOFORT öffnet den Dialog vor der Hydrierung (Attribut `open`) – der Unterschied ist gewollt. Ohne Auftritt (B-03), weil er beim Laden erscheint (LCP) */}
      <dialog
        id="konzepthinweis"
        suppressHydrationWarning
        role="alertdialog"
        aria-labelledby="hinweis-titel"
        aria-describedby="hinweis-text"
        className="ohne-auftritt m-auto breite-dialog max-w-dialog rounded-lg bg-papier p-0 text-tinte shadow-s3 backdrop:bg-tinte/55"
      >
        <div className="bg-warnung-toenung px-6 pt-6 pb-4">
          <h2 id="hinweis-titel" tabIndex={-1} className="flex items-start gap-3 text-24 leading-tight outline-none">
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
      <KonzeptHinweisOeffner />
    </>
  );
}
