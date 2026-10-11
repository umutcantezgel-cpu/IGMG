import type { ReactNode } from 'react';
import { Stern8 } from './Icons';

/**
 * Textteil des Seitenkopfs (design/PageHeader.dc.html): Kennung mit Stern, Titel (h1), Untertitel. Ohne `next/image`
 * und ohne `cn` – so können ihn auch Client-Komponenten auf Routenebene (error.tsx, global-error.tsx) nutzen, ohne
 * dass jede Seite Bildkomponente und tailwind-merge mitlädt (K-12, FEHLERSTATISTIK A18). `PageHeader` baut darauf auf.
 */
export function Seitenkopf({
  titel,
  untertitel,
  kennung,
  kennungFarbe = 'text-gruen-800',
  flaeche = 'bg-sand',
  vorn,
  hinten,
  kinder,
}: {
  titel: string;
  untertitel?: string;
  kennung?: string;
  kennungFarbe?: string;
  flaeche?: string;
  /** z. B. Organisationslogo */
  vorn?: ReactNode;
  /** z. B. Akzentband */
  hinten?: ReactNode;
  kinder?: ReactNode;
}) {
  return (
    <section className={`border-b border-linie ${flaeche}`}>
      <div className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-start gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14">
        {vorn}
        <div className="flex max-w-seitenkopf min-w-0 flex-1 basis-120 flex-col gap-3">
          {kennung ? (
            <span className={`inline-flex items-center gap-2 text-16 font-bold ${kennungFarbe}`}>
              <Stern8 />
              <span>{kennung}</span>
            </span>
          ) : null}
          <h1 className="text-display-1 text-balance">{titel}</h1>
          {untertitel ? <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{untertitel}</p> : null}
          {kinder}
        </div>
      </div>
      {/* Ohne eigenes Akzentband: schmales Achtstern-Band an der Abschnittskante (K-008, dekorativ, nie hinter Text) */}
      {hinten ?? <div aria-hidden className="h-5 achtstern-band" />}
    </section>
  );
}
