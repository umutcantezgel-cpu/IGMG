'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type CSSProperties, useId } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { BOGEN, minutenAus, tagesbogen } from '@/lib/gebetszeiten/bogen';
import { hijriText } from '@/lib/gebetszeiten/hijri';
import { berlinerDatum, naechstesGebet } from '@/lib/gebetszeiten/naechstes';
import type { Gebet, GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';

export type TagesbogenTexte = {
  titel: string;
  beschreibung: string;
  namen: Record<Gebet, string>;
  listeHeute: string;
  alle: string;
  locale: string;
};

const uhr = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });

/** Lage im Zeichenfeld als Prozent der Breite bzw. Höhe (für HTML-Marken über der Zeichnung). */
const links = (x: number) => `${(x / BOGEN.breite) * 100}%`;
const oben = (y: number) => `${(y / BOGEN.hoehe) * 100}%`;

/**
 * Tagesbogen im Browser (B-06): Der Server liefert den Bogen des Referenztags ohne Hervorhebung; nach dem Einhängen
 * enthüllt sich die Linie bis „jetzt“ (einmal, `dauer-moment`), dann treten Sonne und Achtstern des nächsten Gebets
 * hervor. Reduzierte Bewegung: Endzustand sofort. Die Zeiten stehen zusätzlich als Liste im Text (K-008).
 */
export function TagesbogenLive({
  tage,
  referenz,
  alleHref,
  texte,
  className,
}: {
  tage: GebetszeitTag[];
  referenz: string;
  alleHref: string;
  texte: TagesbogenTexte;
  className?: string;
}) {
  const jetzt = useJetzt();
  const kennung = `bogen${useId().replace(/[^\w-]/g, '')}`;

  const datum = jetzt ? berlinerDatum(jetzt) : referenz;
  const index = Math.max(
    0,
    tage.findIndex((t) => t.datum === datum),
  );
  const heute = tage[index];
  const morgen = tage[index + 1] ?? null;
  if (!heute) return null;

  const bogen = tagesbogen(heute);
  const minuten = jetzt ? minutenAus(uhr.format(jetzt)) : null;
  const sonne = minuten !== null && bogen.anteil(minuten) > 0 && bogen.anteil(minuten) < 1 ? bogen.punktZu(minuten) : null;
  const bisX = minuten === null ? 0 : bogen.punktZu(minuten).x * (bogen.anteil(minuten) > 0 ? 1 : 0);
  const naechstes =
    jetzt && heute
      ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
      : null;
  const datumText = jetzt
    ? `${new Intl.DateTimeFormat(texte.locale, { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'short' }).format(jetzt)} · ${hijriText(datum, texte.locale)}`
    : '';
  const zusammenfassung = `${texte.titel}. ${texte.beschreibung}`;

  return (
    <figure className={klassen('@container flex flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6', className)}>
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-display text-20 font-semibold text-gruen-800">{texte.titel}</span>
        <span className="min-h-6 text-16 text-tinte-2">{datumText}</span>
      </figcaption>

      <div className="relative aspect-16/7">
        <svg viewBox={`0 0 ${BOGEN.breite} ${BOGEN.hoehe}`} role="img" aria-label={zusammenfassung} className="absolute inset-0 size-full overflow-visible">
          <defs>
            <clipPath id={`${kennung}-bis`}>
              {bisX > 0 ? <rect x="0" y="0" width={bisX} height={BOGEN.hoehe} className="bogen-enthuellt" /> : null}
            </clipPath>
            <clipPath id={`${kennung}-himmel`}>
              <rect x="0" y="0" width={BOGEN.breite} height={BOGEN.horizont} />
            </clipPath>
            <linearGradient id={`${kennung}-tag`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--color-gruen-100)', stopOpacity: 0.9 }} />
              <stop offset="1" style={{ stopColor: 'var(--color-gruen-50)', stopOpacity: 0.2 }} />
            </linearGradient>
            <linearGradient id={`${kennung}-nacht`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" style={{ stopColor: 'var(--color-sand)', stopOpacity: 1 }} />
              <stop offset="1" style={{ stopColor: 'var(--color-sand)', stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {/* Unter dem Horizont: die Zeit vor Sonnenaufgang und nach Sonnenuntergang */}
          <rect x="0" y={BOGEN.horizont} width={BOGEN.breite} height={BOGEN.hoehe - BOGEN.horizont} fill={`url(#${kennung}-nacht)`} />
          {/* Der vergangene Teil des Tages über dem Horizont als Fläche, enthüllt bis „jetzt“ */}
          {bisX > 0 ? (
            <g clipPath={`url(#${kennung}-bis)`}>
              <path
                d={`${bogen.pfad} L${BOGEN.breite - BOGEN.rand} ${BOGEN.horizont} L${BOGEN.rand} ${BOGEN.horizont} Z`}
                clipPath={`url(#${kennung}-himmel)`}
                fill={`url(#${kennung}-tag)`}
              />
            </g>
          ) : null}
          <line x1="0" x2={BOGEN.breite} y1={BOGEN.horizont} y2={BOGEN.horizont} vectorEffect="non-scaling-stroke" className="stroke-linie" strokeWidth="2" />
          <path
            d={bogen.pfad}
            fill="none"
            vectorEffect="non-scaling-stroke"
            className="stroke-rand"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="1 6"
          />
          {bisX > 0 ? (
            <path
              d={bogen.pfad}
              fill="none"
              clipPath={`url(#${kennung}-bis)`}
              vectorEffect="non-scaling-stroke"
              className="stroke-gruen-700"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </svg>

        {/* Marken als HTML über der Zeichnung: gleiche Größe auf jedem Gerät, Achtstern aus dem Formsystem */}
        {bogen.punkte.map((p) => {
          const erreicht = minuten !== null && minuten >= p.minuten;
          const ist = naechstes?.gebet === p.gebet && !naechstes.morgen;
          return ist ? (
            <span
              key={p.gebet}
              aria-hidden
              className="marke-tritt-hervor absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-weiss text-gruen-700 shadow-s2"
              style={{ left: links(p.x), top: oben(p.y), '--verzoegerung': 'calc(var(--dauer-moment) + 160ms)' } as CSSProperties}
            >
              <Achtstern size={26} />
            </span>
          ) : (
            <span
              key={p.gebet}
              aria-hidden
              className={klassen(
                'absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 transition-colors duration-(--dauer-wechsel)',
                erreicht ? 'border-gruen-700 bg-gruen-700' : 'border-rand bg-weiss',
              )}
              style={{ left: links(p.x), top: oben(p.y) }}
            />
          );
        })}
        {sonne ? (
          <span
            aria-hidden
            className="marke-tritt-hervor absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-700 ring-6 ring-gruen-700/15"
            style={{ left: links(sonne.x), top: oben(sonne.y), '--verzoegerung': 'var(--dauer-moment)' } as CSSProperties}
          />
        ) : null}
      </div>

      <ol aria-label={texte.listeHeute} className="grid grid-cols-3 gap-3 @xl:relative @xl:block @xl:h-16">
        {bogen.punkte.map((p) => {
          const ist = naechstes?.gebet === p.gebet;
          return (
            <li
              key={p.gebet}
              aria-current={ist && !naechstes?.morgen ? 'time' : undefined}
              className="flex min-w-0 flex-col @xl:absolute @xl:top-0 @xl:left-(--links) @xl:max-w-24 @xl:-translate-x-1/2 @xl:items-center @xl:text-center"
              style={{ '--links': links(p.x) } as CSSProperties}
            >
              <span className={klassen('text-16 leading-snug font-bold wrap-anywhere', ist ? 'text-gruen-800' : 'text-tinte-2')}>
                {texte.namen[p.gebet]}
              </span>
              <span className={klassen('text-18 font-bold tabular-nums', ist ? 'text-gruen-800' : 'text-tinte')}>{heute[p.gebet]}</span>
            </li>
          );
        })}
      </ol>

      <Link
        href={alleHref}
        className="inline-flex min-h-11 items-center gap-2 self-start font-bold text-gruen-700 underline-offset-4 hover:underline"
      >
        <span>{texte.alle}</span>
        <ArrowRight aria-hidden className="size-5" />
      </Link>
    </figure>
  );
}
