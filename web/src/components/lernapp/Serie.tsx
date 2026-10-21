'use client';

import { useEffect, useState } from 'react';
import type { WochenTag } from '@/lib/lernapp/ereignisse/serie';
import { formatiere, intlSprache, type Ziffern } from '@/lib/lernapp/format';
import type { Oberflaeche } from '@/lib/lernapp/kurse';

export type SerieTexte = {
  titel: string;
  laenge: string;
  woche: string;
  gelernt: string;
  pause: string;
  ruhe: string;
  heute: string;
  offen: string;
};

const STERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5z';

/** Gerät merkt sich, an welchem Lerntag sich der heutige Stern schon gefüllt hat (B-33: einmal am Tag). */
export const SERIE_GEFUELLT = 'igmg-lernapp-serie-gefuellt';

function schonGefuellt(tag: string): boolean {
  try {
    return localStorage.getItem(SERIE_GEFUELLT) === tag;
  } catch {
    return true;
  }
}

/**
 * Serie „Lerntage in Folge“ als Wochenband (ADR 0043 Nr. 3, B-33; Muster `Wochenband.tsx` der Website): sieben Achtsterne
 * von Montag bis Sonntag. Gelernt = gefüllt, Pause und Ruhezeit = Linie (sie tragen die Serie), heute noch offen = Linie
 * in Grün, später = blass. Der heutige Stern füllt sich **einmal am Tag** von unten (`stern-fuellt`, B-18), danach steht er
 * gefüllt; reduziert sofort gefüllt. Jeder Tag hat seinen Zustand als Text; die Zahl steht statisch, nie „verloren“.
 */
export function Serie({
  laenge,
  woche,
  heute,
  texte,
  ui,
  ziffern,
}: {
  laenge: number;
  woche: readonly WochenTag[];
  /** heutiger Lerntag `JJJJ-MM-TT` */
  heute: string;
  texte: SerieTexte;
  ui: Oberflaeche;
  ziffern: Ziffern;
}) {
  const heuteGelernt = woche.some((t) => t.tag === heute && t.art === 'gelernt');
  // nur im Browser eingehängt (der Server kennt den Stand des Geräts nicht): gleich beim ersten Zeichnen entscheiden
  const [fuellen] = useState(() => heuteGelernt && !schonGefuellt(heute));
  useEffect(() => {
    if (!fuellen) return;
    try {
      localStorage.setItem(SERIE_GEFUELLT, heute);
    } catch {
      // ohne Speicher füllt sich der Stern beim nächsten Besuch noch einmal – kein Schaden
    }
  }, [fuellen, heute]);
  const tagName = new Intl.DateTimeFormat(intlSprache(ui, ziffern), { weekday: 'short', timeZone: 'UTC' });
  const zustand = (t: WochenTag) =>
    t.art === 'gelernt'
      ? texte.gelernt
      : t.art === 'pause'
        ? texte.pause
        : t.art === 'ruhe'
          ? texte.ruhe
          : t.art === 'heute'
            ? texte.offen
            : null;

  return (
    <div className="flex flex-col gap-3 rounded-md bg-weiss p-4">
      <p className="font-bold">{texte.titel}</p>
      <p className="text-18">{formatiere(texte.laenge, { n: laenge }, ui, ziffern)}</p>
      <ol aria-label={texte.woche} className="grid grid-cols-7 gap-1">
        {woche.map((t) => {
          const name = tagName.format(new Date(`${t.tag}T00:00:00Z`));
          const text = zustand(t);
          const gefuellt = t.art === 'gelernt';
          const animiert = gefuellt && t.tag === heute && fuellen;
          const linie =
            t.art === 'heute'
              ? 'stroke-gruen-700'
              : t.art === 'zukunft'
                ? 'stroke-linie'
                : gefuellt
                  ? 'stroke-gruen-700'
                  : 'stroke-tinte-3';
          return (
            <li key={t.tag} className="flex flex-col items-center gap-1 text-16">
              <svg aria-hidden viewBox="2.5 2.5 19 19" className="size-8 overflow-visible">
                <path d={STERN} className={`fill-weiss ${linie}`} strokeWidth={1.5} strokeLinejoin="round" />
                {gefuellt ? <path d={STERN} className={`fill-gruen-700 ${animiert ? 'stern-fuellt' : ''}`} /> : null}
              </svg>
              <span aria-hidden className={t.tag === heute ? 'font-bold' : 'text-tinte-2'}>
                {name}
              </span>
              <span className="sr-only">
                {name}
                {t.tag === heute ? ` (${texte.heute})` : ''}
                {text ? `: ${text}` : ''}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
