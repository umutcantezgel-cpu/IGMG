'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type CSSProperties, Fragment, useEffect, useId, useRef, useState } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { BOGEN, minutenAus, tagesbogen, zeitAnteilEintritt } from '@/lib/gebetszeiten/bogen';
import { berlinerDatum, naechstesGebet, uhrzeitBerlin } from '@/lib/gebetszeiten/naechstes';
import type { Gebet, GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { useNachRuhe } from '@/lib/zeit/useNachRuhe';

export type TagesbogenTexte = {
  titel: string;
  beschreibung: string;
  namen: Record<Gebet, string>;
  listeHeute: string;
  alle: string;
  locale: string;
  /** Kopfzeile je Kalendertag (Wochentag · Hidschri-Datum), auf dem Server berechnet (`tageszeilen`, H-L01) */
  tageszeilen?: Record<string, string>;
};

/** Lage im Zeichenfeld als Prozent der Breite bzw. Höhe (für HTML-Marken über der Zeichnung). */
const links = (x: number) => `${(x / BOGEN.breite) * 100}%`;
const oben = (y: number) => `${(y / BOGEN.hoehe) * 100}%`;

/**
 * Tagesbogen im Browser (B-06): Der Server liefert den Bogen des Referenztags ohne Hervorhebung; nach dem Einhängen
 * enthüllt sich die Linie bis „jetzt“ (einmal, `dauer-moment`, 1,2 s). Die Sonne tritt ab 880 ms hervor, der Achtstern
 * des nächsten Gebets ab 960 ms (gesamt 1,6 s, Register B-06). Der Ort des nächsten Gebets trägt durchgehend eine Marke:
 * zuerst den Ring, darüber den Achtstern. Erreichte Punkte färben sich im Takt der Linie (`zeitAnteilEintritt`).
 * Reduzierte Bewegung: Endzustand sofort. Die Zeiten stehen zusätzlich als Liste im Text (K-008).
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
  const jetztRoh = useJetzt();
  // B-06: Der Bogen enthüllt sich erst, wenn die Seite nach der Hydrierung zur Ruhe kommt (Z-05: vorher fiel die
  // Enthüllung in die Rechnungen der Zeitinseln, 11,5 % verworfene Bilder bei 4-facher Drosselung). Bis dahin zeigt er
  // den Zustand ohne Uhrzeit, wie beim Hydrieren. Die ruhige Fassung (ohne Bewegung) rechnet sofort.
  const ruhe = useNachRuhe(!ruhig && jetztRoh !== null);
  const jetzt = ruhig || ruhe ? jetztRoh : null;
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
  const minuten = jetzt ? minutenAus(uhrzeitBerlin(jetzt)) : null;
  const sonne = minuten !== null && bogen.anteil(minuten) > 0 && bogen.anteil(minuten) < 1 ? bogen.punktZu(minuten) : null;
  const bisX = minuten === null ? 0 : bogen.punktZu(minuten).x * (bogen.anteil(minuten) > 0 ? 1 : 0);
  const datumText = jetzt ? (texte.tageszeilen?.[datum] ?? '') : '';
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
        </svg>

        {/* Der vergangene Teil des Tages (Fläche und Linie) als eigene Ebene, sichtbar bis „jetzt“. B-06 enthüllt sie als
            Schiebefenster: Das Fenster (Breite bis „jetzt“) gleitet von links herein, sein Inhalt gleitet gleich weit zurück.
            Die Zeichnung steht still, die Kante wandert – nur transform, also im Compositor (Z-05: die frühere SVG-Schnittmaske
            zeichnete jedes Bild neu). Verläufe und Himmel-Schnitt kommen aus den defs der Zeichnung darüber. */}
        {bisX > 0 ? (
          <div
            aria-hidden
            className={klassen('absolute inset-y-0 left-0 overflow-hidden', !ruhig && 'bogen-enthuellt')}
            style={{ width: `${(bisX / BOGEN.breite) * 100}%` }}
          >
            <div className={klassen('relative size-full', !ruhig && 'bogen-enthuellt-inhalt')}>
              <svg
                viewBox={`0 0 ${BOGEN.breite} ${BOGEN.hoehe}`}
                aria-hidden
                className="absolute inset-y-0 left-0 h-full overflow-visible"
                style={{ width: `${(BOGEN.breite / bisX) * 100}%` }}
              >
                <path
                  d={`${bogen.pfad} L${BOGEN.breite - BOGEN.rand} ${BOGEN.horizont} L${BOGEN.rand} ${BOGEN.horizont} Z`}
                  clipPath={`url(#${kennung}-himmel)`}
                  fill={`url(#${kennung}-tag)`}
                />
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
                  className="stroke-gruen-700"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        ) : null}

        {/* „Jetzt“ zuerst, damit der Achtstern des nächsten Gebets bei Nähe obenauf liegt */}
        {sonne ? (
          <span
            aria-hidden
            className={klassen(
              'absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-gruen-700 ring-6 ring-gruen-700/15',
              !ruhig && 'marke-tritt-hervor',
            )}
            style={
              {
                left: links(sonne.x),
                top: oben(sonne.y),
                '--verzoegerung': 'calc(var(--dauer-moment) - var(--dauer-wechsel))',
              } as CSSProperties
            }
          />
        ) : null}
        {/* Marken als HTML über der Zeichnung: gleiche Größe auf jedem Gerät, Achtstern aus dem Formsystem */}
        {bogen.punkte.map((p) => {
          const erreicht = minuten !== null && minuten >= p.minuten;
          // Nach Isha trägt der Imsak-Punkt den Stern: er markiert den Beginn des nächsten Tages wie nach Mitternacht
          const ist = naechstes?.gebet === p.gebet;
          // H-E01: Der Ring bleibt auch am nächsten Gebet stehen; der Achtstern liegt darüber (36-px-Chip deckt den Ring ab),
          // damit der Ort nie ohne Marke ist.
          return (
            <Fragment key={p.gebet}>
              <span
                aria-hidden
                className={klassen(
                  'absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-pill border-2 transition-colors duration-(--dauer-wechsel)',
                  // Mit ruhig steht die Linie schon voll: Der Punkt folgt ihr ohne Verzögerung (keine Enthüllung).
                  // Ohne ruhig färbt eine Deckfläche (::after) den Punkt per Überblendung, wenn die Linie ihn erreicht – nur opacity.
                  erreicht
                    ? ruhig
                      ? 'border-gruen-700 bg-gruen-700'
                      : 'bogen-punkt-erreicht border-rand bg-weiss'
                    : 'border-rand bg-weiss',
                )}
                style={
                  erreicht && !ruhig
                    ? ({ left: links(p.x), top: oben(p.y), '--anteil': bisX > 0 ? zeitAnteilEintritt(p.x / bisX) : 0 } as CSSProperties)
                    : { left: links(p.x), top: oben(p.y) }
                }
              />
              {ist ? (
                <span
                  aria-hidden
                  className={klassen(
                    'absolute flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-weiss text-gruen-700 shadow-s2',
                    ruhig ? gewechselt && 'blendet-ein' : 'marke-tritt-hervor',
                  )}
                  style={
                    ruhig
                      ? ({ left: links(p.x), top: oben(p.y), '--dauer': 'var(--dauer-wechsel)' } as CSSProperties)
                      : ({
                          left: links(p.x),
                          top: oben(p.y),
                          '--verzoegerung': 'calc(var(--dauer-moment) - var(--dauer-wechsel) + var(--staffel))',
                        } as CSSProperties)
                  }
                >
                  <Achtstern size={26} />
                </span>
              ) : null}
            </Fragment>
          );
        })}
      </div>

      {/* Mit ruhig (Gebetszeiten) trägt die Tafel daneben die Zeiten für Hilfstechnik; hier sonst doppelt vorgelesen */}
      <ol
        aria-label={texte.listeHeute}
        aria-hidden={ruhig || undefined}
        className={klassen('grid grid-cols-3 gap-3 @xl:relative @xl:block @xl:h-27', ruhig && '@max-xl:hidden')}
      >
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
              {/* Ab @xl enger gesetzt (Eintrag 42,5 px statt 50 px): die zweite Ebene hat so ≥ 16 px Abstand zur ersten; betonter Eintrag 44 px, Abstand zur zweiten Ebene ≥ 16 px */}
              <span
                className={klassen(
                  'flex items-center gap-1 text-16 leading-snug font-bold wrap-anywhere @xl:relative @xl:block @xl:leading-tight',
                  ist ? 'text-gruen-800' : 'text-tinte-2',
                )}
              >
                {/* Achtstern des nächsten Gebets vor dem Namen; ab @xl links daneben. Blendet nur nach einem Wechsel ein (B-10). */}
                {ist ? (
                  <Achtstern
                    size={16}
                    className={klassen(
                      'shrink-0 @xl:absolute @xl:top-1/2 @xl:right-full @xl:mr-1 @xl:-translate-y-1/2',
                      gewechselt && 'blendet-ein',
                    )}
                    style={{ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties}
                  />
                ) : null}
                {texte.namen[p.gebet]}
              </span>
              <span
                className={klassen(
                  'leading-8 font-bold tabular-nums',
                  ist ? 'text-24 text-gruen-800 @xl:leading-none' : 'text-18 text-tinte @xl:leading-tight',
                )}
              >
                {heute[p.gebet]}
              </span>
            </li>
          );
        })}
      </ol>

      {alleHref ? (
        <Link
          href={alleHref}
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline-offset-4 hover:underline"
        >
          <span>{texte.alle}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      ) : null}
    </figure>
  );
}
