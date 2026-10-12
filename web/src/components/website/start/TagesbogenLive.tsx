'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type CSSProperties, useEffect, useId, useRef, useState } from 'react';
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
 * Mit `ruhig` (Gebetszeiten): keine Enthüllung und kein Hervortreten; der Achtstern blendet nur nach einem echten
 * Gebetswechsel ein (B-10). Ohne `alleHref` entfällt der Link.
 */
export function TagesbogenLive({
  tage,
  referenz,
  alleHref,
  texte,
  className,
  ruhig = false,
}: {
  tage: GebetszeitTag[];
  referenz: string;
  alleHref?: string;
  texte: TagesbogenTexte;
  className?: string;
  ruhig?: boolean;
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
  const naechstes =
    jetzt && heute
      ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
      : null;
  // B-10 (ruhig): Der Achtstern blendet nur nach einem echten Wechsel von Gebet oder Tagesteil ein. Der erste Wert nach
  // dem Einhängen zählt nicht. Der letzte Schlüssel steht in einer Ref und wird erst im Effekt fortgeschrieben.
  const schluessel = naechstes ? `${naechstes.gebet}-${naechstes.morgen ? 'morgen' : 'heute'}` : null;
  const vorher = useRef<string | null>(null);
  const [gewechselt, setGewechselt] = useState(false);
  useEffect(() => {
    const alt = vorher.current;
    vorher.current = schluessel;
    if (alt !== null && schluessel !== null && alt !== schluessel) setGewechselt(true);
  }, [schluessel]);
  if (!heute) return null;

  const bogen = tagesbogen(heute);
  const minuten = jetzt ? minutenAus(uhr.format(jetzt)) : null;
  const sonne = minuten !== null && bogen.anteil(minuten) > 0 && bogen.anteil(minuten) < 1 ? bogen.punktZu(minuten) : null;
  const bisX = minuten === null ? 0 : bogen.punktZu(minuten).x * (bogen.anteil(minuten) > 0 ? 1 : 0);
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
        <svg
          viewBox={`0 0 ${BOGEN.breite} ${BOGEN.hoehe}`}
          role="img"
          aria-label={zusammenfassung}
          className="absolute inset-0 size-full overflow-visible"
        >
          <defs>
            <clipPath id={`${kennung}-bis`}>
              {bisX > 0 ? <rect x="0" y="0" width={bisX} height={BOGEN.hoehe} className={ruhig ? undefined : 'bogen-enthuellt'} /> : null}
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
          <line
            x1="0"
            x2={BOGEN.breite}
            y1={BOGEN.horizont}
            y2={BOGEN.horizont}
            vectorEffect="non-scaling-stroke"
            className="stroke-linie"
            strokeWidth="2"
          />
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

        {/* „Jetzt“ zuerst, damit der Achtstern des nächsten Gebets bei Nähe obenauf liegt */}
        {sonne ? (
          <span
            aria-hidden
            className={klassen(
              'absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-700 ring-6 ring-gruen-700/15',
              !ruhig && 'marke-tritt-hervor',
            )}
            style={{ left: links(sonne.x), top: oben(sonne.y), '--verzoegerung': 'var(--dauer-moment)' } as CSSProperties}
          />
        ) : null}
        {/* Marken als HTML über der Zeichnung: gleiche Größe auf jedem Gerät, Achtstern aus dem Formsystem */}
        {bogen.punkte.map((p) => {
          const erreicht = minuten !== null && minuten >= p.minuten;
          // Nach Isha trägt der Imsak-Punkt den Stern: er markiert den Beginn des nächsten Tages wie nach Mitternacht
          const ist = naechstes?.gebet === p.gebet;
          return ist ? (
            <span
              key={p.gebet}
              aria-hidden
              className={klassen(
                'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-weiss text-gruen-700 shadow-s2',
                ruhig ? gewechselt && 'blendet-ein' : 'marke-tritt-hervor',
              )}
              style={
                ruhig
                  ? ({ left: links(p.x), top: oben(p.y), '--dauer': 'var(--dauer-wechsel)' } as CSSProperties)
                  : ({ left: links(p.x), top: oben(p.y), '--verzoegerung': 'calc(var(--dauer-moment) + 160ms)' } as CSSProperties)
              }
            >
              <Achtstern size={26} />
            </span>
          ) : (
            <span
              key={p.gebet}
              aria-hidden
              className={klassen(
                'absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 transition-colors duration-(--dauer-wechsel)',
                // Mit ruhig steht die Linie schon voll: Der Punkt folgt ihr ohne Verzögerung (keine Enthüllung).
                erreicht ? klassen('border-gruen-700 bg-gruen-700', !ruhig && 'bogen-punkt-erreicht') : 'border-rand bg-weiss',
              )}
              style={
                erreicht && !ruhig
                  ? ({ left: links(p.x), top: oben(p.y), '--anteil': bisX > 0 ? p.x / bisX : 0 } as CSSProperties)
                  : { left: links(p.x), top: oben(p.y) }
              }
            />
          );
        })}
      </div>

      {/* Mit ruhig (Gebetszeiten) trägt die Tafel daneben die Zeiten für Hilfstechnik; hier sonst doppelt vorgelesen */}
      <ol aria-label={texte.listeHeute} aria-hidden={ruhig || undefined} className="grid grid-cols-3 gap-3 @xl:relative @xl:block @xl:h-27">
        {bogen.punkte.map((p) => {
          const ist = naechstes?.gebet === p.gebet && !naechstes.morgen;
          return (
            <li
              key={p.gebet}
              aria-current={ist ? 'time' : undefined}
              className={klassen(
                'flex min-w-0 flex-col @xl:absolute @xl:left-(--links) @xl:-translate-x-1/2 @xl:items-center @xl:text-center @xl:whitespace-nowrap',
                p.gebet === 'imsak' || p.gebet === 'yatsi' ? '@xl:top-15' : '@xl:top-0',
              )}
              style={{ '--links': links(p.x) } as CSSProperties}
            >
              {/* Ab @xl enger gesetzt (Eintrag 42,5 px statt 50 px): die zweite Ebene hat so ≥ 16 px Abstand zur ersten */}
              <span
                className={klassen(
                  'text-16 leading-snug font-bold wrap-anywhere @xl:leading-tight',
                  ist ? 'text-gruen-800' : 'text-tinte-2',
                )}
              >
                {texte.namen[p.gebet]}
              </span>
              <span className={klassen('text-18 font-bold tabular-nums @xl:leading-tight', ist ? 'text-gruen-800' : 'text-tinte')}>
                {heute[p.gebet]}
              </span>
            </li>
          );
        })}
      </ol>

      {alleHref ? (
        <Link
          href={alleHref}
          className="inline-flex min-h-11 items-center gap-2 self-start font-bold text-gruen-700 underline-offset-4 hover:underline"
        >
          <span>{texte.alle}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      ) : null}
    </figure>
  );
}
