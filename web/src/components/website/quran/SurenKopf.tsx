import type { CSSProperties, ReactNode } from 'react';
import { Medaillon } from './Medaillon';

/**
 * Kopf der Koran-Leseseiten (Sure, Cüz): mittig wie eine Surenüberschrift im Mushaf – Achtstern-Medaillon (Morph-Ziel
 * aus der Surenkachel), arabischer Name aus der Datenbank, Umschrift als h1, Kennung mit Angaben und die
 * Quellenzeile. Fläche Sand mit Achtstern-Band an der Kante (wie der Seitenkopf), bewusst niedrig: Der Text beginnt
 * auf dem Computer noch im ersten Bild.
 */
export function SurenKopf({
  kennung,
  nr,
  nameAr,
  titel,
  angaben,
  quelle,
  medaillonStil,
  titelStil,
}: {
  kennung: string;
  nr: number;
  /** Arabischer Name (nur aus der Quelle); fehlt er, steht nur die Umschrift */
  nameAr?: string | null;
  titel: string;
  angaben?: ReactNode;
  quelle: ReactNode;
  medaillonStil?: CSSProperties;
  titelStil?: CSSProperties;
}) {
  return (
    <section className="border-b border-linie bg-sand">
      <div className="mx-auto flex max-w-(--container-lesen) flex-col items-center px-4 pt-6 pb-8 text-center md:px-8 md:pt-10 md:pb-10">
        <Medaillon nr={nr} groesse="mittel" flaeche="fill-papier" stil={medaillonStil} />
        {nameAr ? (
          <p lang="ar" dir="rtl" className="mt-3 font-quran text-arabisch-1 leading-ueberschrift text-tinte">
            {nameAr}
          </p>
        ) : null}
        <h1 id="sure-titel" style={titelStil} className="mt-1 text-display-1 text-balance">
          {titel}
        </h1>
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-18 text-tinte-2">
          <span className="font-bold text-gruen-800">{kennung}</span>
          {angaben}
        </p>
        <div className="mt-3 flex max-w-text flex-col gap-1 text-16 text-tinte-2">{quelle}</div>
      </div>
      <div aria-hidden className="h-5 achtstern-band" />
    </section>
  );
}
