import type { CSSProperties, ReactNode } from 'react';
import { Stern8 } from './Icons';

/**
 * Textteil des Seitenkopfs (design/PageHeader.dc.html): Kennung mit Stern, Titel (h1), Untertitel. Ohne `next/image`
 * und ohne `cn` – so können ihn auch Client-Komponenten auf Routenebene (error.tsx, global-error.tsx) nutzen, ohne
 * dass jede Seite Bildkomponente und tailwind-merge mitlädt (K-12, FEHLERSTATISTIK A18). `PageHeader` baut darauf auf.
 * `oben` steht vor der Kennung in der Textspalte (Rückweg zur Liste); die übrigen Zusatzangaben gelten für den Titel
 * (Morph-Name, Sprache) und den Untertitel. Ohne Angabe entsteht das Markup wie bisher.
 */
export function Seitenkopf({
  titel,
  untertitel,
  kennung,
  kennungFarbe = 'text-gruen-800',
  flaeche = 'bg-sand',
  vorn,
  hinten,
  zierde,
  kinder,
  oben,
  bild,
  bildAbLg = false,
  kennungZeichen = <Stern8 />,
  titelId,
  titelLang,
  titelStil,
  untertitelLang,
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
  /** Grafik rechts neben dem Text (dekorativ), z. B. „Familie der vier“ */
  zierde?: ReactNode;
  kinder?: ReactNode;
  /** Zeile vor der Kennung, z. B. Rückweg zur Liste */
  oben?: ReactNode;
  /** Kopfbild (H-C02): mit Bild steht es in einer eigenen Spalte rechts, auf dem Telefon nach dem Textblock */
  bild?: ReactNode;
  /** Kopfbild nur ab lg (Platzhalter ohne gepflegtes Bild): darunter keine leere Rasterzeile */
  bildAbLg?: boolean;
  /** Zeichen vor der Kennung; Vorgabe der Achtstern */
  kennungZeichen?: ReactNode;
  /** Kennung des h1 (Verweise, Tests) */
  titelId?: string;
  /** Sprache des Titels, wenn sie von der Seite abweicht (K-02) */
  titelLang?: string;
  /** Übergangsname des Titels (Morph aus der Liste) */
  titelStil?: CSSProperties;
  /** Sprache des Untertitels */
  untertitelLang?: string;
}) {
  const mitBild = Boolean(bild);
  return (
    <section className={`border-b border-linie ${flaeche}`}>
      <div
        className={
          mitBild
            ? 'mx-auto grid max-w-(--container-inhalt) gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14 lg:grid-cols-3 lg:items-start lg:gap-8'
            : 'mx-auto flex max-w-(--container-inhalt) flex-wrap items-start gap-6 px-4 pt-8 pb-8 md:px-8 md:pt-16 md:pb-14'
        }
      >
        {vorn}
        <div
          className={
            mitBild
              ? 'flex max-w-seitenkopf min-w-0 flex-1 flex-col gap-3 lg:col-span-2'
              : `flex max-w-seitenkopf min-w-0 flex-1 basis-120 flex-col gap-3 max-md:order-2 ${zierde ? 'md:basis-96' : ''}`
          }
        >
          {oben}
          {kennung ? (
            <span className={`inline-flex items-center gap-2 text-16 font-bold ${kennungFarbe}`}>
              {kennungZeichen}
              <span>{kennung}</span>
            </span>
          ) : null}
          <h1 id={titelId} lang={titelLang} style={titelStil} className="text-display-1 text-balance">
            {titel}
          </h1>
          {untertitel ? (
            <p lang={untertitelLang} className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">
              {untertitel}
            </p>
          ) : null}
          {kinder}
        </div>
        {mitBild ? <div className={bildAbLg ? 'min-w-0 max-lg:hidden' : 'min-w-0'}>{bild}</div> : null}
        {/* Telefon: Grafik rechts neben dem Logo, Text darunter; breit: rechts neben dem Text */}
        {zierde ? <div className="ml-auto flex shrink-0 self-center max-md:order-1">{zierde}</div> : null}
      </div>
      {/* Ohne eigenes Akzentband: schmales Achtstern-Band an der Abschnittskante (K-008, dekorativ, nie hinter Text) */}
      {hinten ?? <div aria-hidden className="h-5 achtstern-band" />}
    </section>
  );
}
