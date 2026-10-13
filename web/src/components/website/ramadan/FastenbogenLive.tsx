'use client';

import type { CSSProperties } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { minutenAus } from '@/lib/gebetszeiten/bogen';
import { berlinerDatum, uhrzeitBerlin } from '@/lib/gebetszeiten/naechstes';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { useNachRuhe } from '@/lib/zeit/useNachRuhe';

/**
 * Fastenbogen (B-20, Ramadan-Variante des Tagesbogens B-06): ein Halbbogen von Imsak (links) bis Akşam/Iftar (rechts).
 * Der Server zeigt den Bogen des Referenztags ohne Fortschritt; im Browser zeichnet sich die Linie bis „jetzt“ einmal
 * (`linie-zeichnet`, erst nach der Hydrierung zur Ruhe), dann tritt der Achtstern als Marke hervor. Reduzierte
 * Bewegung: Endzustand sofort. Keine Restzeit, keine hochzählenden Zahlen – nur die Uhrzeiten als Text.
 * `vorschau`: außerhalb des Ramadan statisch (kein Fortschritt). Texte mit einfachen Platzhaltern {imsak}/{iftar}.
 */
export type FastenTag = { datum: string; imsak: string; aksam: string };
export type FastenbogenTexte = {
  titel: string;
  beschreibung: string;
  imsak: string;
  iftar: string;
  vorImsak: string;
  fastet: string;
  nachIftar: string;
  label: string;
  /** Datumszeile je Tag, auf dem Server formatiert */
  datum: Record<string, string>;
};

/** Zeichenfeld: flacher Bogen (Ellipse) von Imsak (links) bis Akşam (rechts), Horizont unten. */
const B = 320;
const H = 132;
const MX = 160;
const MY = 116;
const R = 136;
const RY = 96;

function punkt(anteil: number): { x: number; y: number } {
  const winkel = Math.PI * (1 - anteil);
  return { x: MX + R * Math.cos(winkel), y: MY - RY * Math.sin(winkel) };
}

const BOGEN_PFAD = `M${MX - R} ${MY} A${R} ${RY} 0 0 1 ${MX + R} ${MY}`;

function ersetze(text: string, werte: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (_, k: string) => werte[k] ?? '');
}

export function FastenbogenLive({
  tage,
  referenz,
  vorschau = false,
  texte,
}: {
  tage: FastenTag[];
  referenz: string;
  vorschau?: boolean;
  texte: FastenbogenTexte;
}) {
  const jetztRoh = useJetzt();
  const ruhe = useNachRuhe(!vorschau && jetztRoh !== null);
  const jetzt = vorschau ? null : ruhe ? jetztRoh : null;
  const heute = jetzt ? berlinerDatum(jetzt) : referenz;
  const tag = tage.find((t) => t.datum === heute) ?? tage.find((t) => t.datum === referenz) ?? tage[0];
  if (!tag) return null;
  const morgen = tage[tage.indexOf(tag) + 1] ?? null;
  const live = jetzt !== null && tag.datum === heute;
  const minuten = live ? minutenAus(uhrzeitBerlin(jetzt)) : null;
  const von = minutenAus(tag.imsak);
  const bis = minutenAus(tag.aksam);
  const anteil = minuten === null ? null : Math.min(1, Math.max(0, (minuten - von) / (bis - von)));
  const zustand = minuten === null ? null : minuten < von ? 'vor' : minuten >= bis ? 'nach' : 'fastet';
  const ende = anteil !== null && anteil > 0 ? punkt(anteil) : null;
  const werte = { imsak: tag.imsak, iftar: tag.aksam, datum: texte.datum[tag.datum] ?? tag.datum };
  const status =
    zustand === 'vor'
      ? ersetze(texte.vorImsak, werte)
      : zustand === 'fastet'
        ? ersetze(texte.fastet, werte)
        : zustand === 'nach'
          ? ersetze(texte.nachIftar, { ...werte, imsak: morgen?.imsak ?? tag.imsak })
          : '';

  return (
    <figure className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-display text-20 font-semibold text-gruen-800">{texte.titel}</span>
        <span className="text-16 text-tinte-2">{werte.datum}</span>
      </figcaption>
      <div className="relative">
        <svg viewBox={`0 0 ${B} ${H}`} role="img" aria-label={ersetze(texte.label, werte)} className="block h-auto w-full overflow-visible">
          <line x1="8" x2={B - 8} y1={MY} y2={MY} className="stroke-linie" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          {/* Vorschau: der ganze Fastentag als ruhige Fläche des Bogens (ohne „jetzt“) */}
          {vorschau ? <path d={BOGEN_PFAD} fill="none" className="stroke-gruen-100" strokeWidth="10" strokeLinecap="round" /> : null}
          <path
            d={BOGEN_PFAD}
            fill="none"
            className={vorschau ? 'stroke-gruen-700' : 'stroke-rand'}
            strokeWidth="2"
            strokeDasharray={vorschau ? undefined : '1 6'}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {ende ? (
            <path
              key={`${tag.datum}-${anteil}`}
              d={`M${MX - R} ${MY} A${R} ${RY} 0 0 1 ${ende.x.toFixed(2)} ${ende.y.toFixed(2)}`}
              fill="none"
              pathLength={1}
              className="linie-zeichnet stroke-gruen-700"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ '--dauer': 'var(--dauer-moment)' } as CSSProperties}
            />
          ) : null}
          <circle cx={MX - R} cy={MY} r="6" className="fill-gruen-700" />
          <circle cx={MX + R} cy={MY} r="6" className={anteil === 1 ? 'fill-gruen-700' : 'fill-weiss stroke-gruen-700'} strokeWidth="2" />
        </svg>
        {ende && anteil !== null && anteil < 1 ? (
          <span
            aria-hidden="true"
            className="marke-tritt-hervor absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-weiss text-gruen-700 shadow-s2"
            style={
              {
                left: `${(ende.x / B) * 100}%`,
                top: `${(ende.y / H) * 100}%`,
                '--verzoegerung': 'calc(var(--dauer-moment) - var(--dauer-wechsel))',
              } as CSSProperties
            }
          >
            <Achtstern size={24} />
          </span>
        ) : null}
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <dt className="text-16 font-bold text-tinte-2">{texte.imsak}</dt>
          <dd className="text-24 font-bold text-gruen-800 tabular-nums">{tag.imsak}</dd>
        </div>
        <div className="flex flex-col items-end text-right">
          <dt className="text-16 font-bold text-tinte-2">{texte.iftar}</dt>
          <dd className="text-24 font-bold text-gruen-800 tabular-nums">{tag.aksam}</dd>
        </div>
      </dl>
      <p className="text-16 text-tinte-2">{texte.beschreibung}</p>
      {/* Eigene Zeile mit fester Höhe: erscheint erst im Browser, ohne das Layout zu verschieben (CLS) */}
      {vorschau ? null : (
        <p role="status" className="min-h-6 font-bold text-gruen-800">
          {status}
        </p>
      )}
    </figure>
  );
}
