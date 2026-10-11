'use client';

import { ArrowRight, ChevronDown, ChevronUp, Clock, Info, MapPin, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { berlinerDatum, naechstesGebet, restzeit } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';

export type LeisteTexte = {
  label: string;
  ort: string;
  namen: Record<Gebet, string>;
  naechstes: string;
  verbleibt: string;
  hinweis: string | null;
  alle: string;
  anzeigen: string;
  ausblenden: string;
  listeHeute: string;
  uhrSuffix: boolean;
  dauer: { std: string; min: string };
  locale: string;
};

const ICON: Record<Gebet, typeof Sun> = { imsak: Moon, gunes: Sunrise, ogle: Sun, ikindi: Sun, aksam: Sunset, yatsi: Moon };

/**
 * PrayerTimesBar (design/PrayerTimesBar.dc.html): Tageszeiten, nächstes Gebet und Restzeit rechnet der
 * Browser aus den zwischengespeicherten Zeiten (K-08). Restzeit ohne Live-Region (K-11: keine Daueransage).
 * Vor dem Einhängen zeigt die Leiste den Referenztag des Servers ohne Hervorhebung (keine Uhrzeit beim Prerender).
 */
export function LeisteLive({
  tage,
  referenz,
  alleHref,
  texte,
}: {
  tage: GebetszeitTag[];
  referenz: string;
  alleHref: string;
  texte: LeisteTexte;
}) {
  const jetzt = useJetzt();
  const [aufgeklappt, setAufgeklappt] = useState(false);

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
  const rest = naechstes ? restzeit(naechstes.restMs) : null;
  const restText = rest ? `${rest.stunden ? `${rest.stunden}${texte.dauer.std} ` : ''}${rest.minuten}${texte.dauer.min}` : '–';
  const zeit = (z: string) => (texte.uhrSuffix ? `${z} Uhr` : z);
  const datumText = jetzt
    ? new Intl.DateTimeFormat(texte.locale, { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'short' }).format(jetzt)
    : '';
  const uhrText = jetzt
    ? zeit(
        new Intl.DateTimeFormat(texte.locale, { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(
          jetzt,
        ),
      )
    : '';
  const naechstesName = naechstes ? texte.namen[naechstes.gebet] : '–';
  const naechstesZeit = naechstes ? zeit((naechstes.morgen ? morgen : heute)?.[naechstes.gebet] ?? '') : '';

  if (!heute) return null;

  const karte = (g: Gebet, klein: boolean) => {
    const ist = naechstes?.gebet === g && !naechstes.morgen;
    const Icon = ICON[g];
    return (
      <li
        key={g}
        aria-current={ist ? 'time' : undefined}
        className={klassen(
          'flex min-w-0 flex-col justify-center gap-0.5 border',
          klein ? 'rounded-md px-2.5 py-2' : 'min-h-[118px] rounded-lg px-3 py-2.5',
          ist ? 'border-weiss bg-weiss' : 'border-gruen-800 bg-gruen-950',
        )}
      >
        {ist && !klein ? <span className="text-16 font-bold text-gruen-800">{texte.naechstes}</span> : null}
        <span
          className={klassen(
            'flex items-center gap-1.5 text-16 leading-snug font-bold [overflow-wrap:anywhere]',
            ist ? 'text-gruen-800' : 'text-gruen-50',
          )}
        >
          {klein ? null : <Icon aria-hidden className="size-4 shrink-0" />}
          <span>{texte.namen[g]}</span>
        </span>
        <span
          className={klassen('font-bold tabular-nums', klein ? 'text-20' : 'text-24 leading-tight', ist ? 'text-gruen-950' : 'text-weiss')}
        >
          {heute[g]}
        </span>
        {ist && !klein ? <span className="text-16 font-bold text-tinte-2">{texte.verbleibt.replace('{zeit}', restText)}</span> : null}
      </li>
    );
  };

  const hinweis = texte.hinweis ? (
    <span className="inline-flex items-center gap-1.5 self-start rounded-pill bg-warnung-toenung px-2.5 py-0.5 text-16 font-bold text-warnung">
      <Info aria-hidden className="size-4" />
      {texte.hinweis}
    </span>
  ) : null;

  return (
    <aside aria-label={texte.label} className="bg-gruen-950 text-weiss">
      {/* Breit (ab 768 px): Ort, sechs Karten, Link */}
      <div className="mx-auto hidden max-w-(--container-inhalt) flex-wrap items-center gap-x-6 gap-y-4 px-6 py-4 md:flex lg:px-8">
        <div className="order-1 flex min-w-[220px] flex-none flex-col gap-1">
          <div className="flex items-center gap-2 font-bold">
            <MapPin aria-hidden className="size-5 text-gruen-100" />
            <span>{texte.ort}</span>
          </div>
          <div className="flex min-h-6 items-center gap-2 text-16 text-gruen-100">
            <Clock aria-hidden className="size-5" />
            <span>{jetzt ? `${datumText} · ${uhrText}` : ''}</span>
          </div>
          {hinweis}
        </div>
        <ul aria-label={texte.listeHeute} className="order-3 grid w-full grid-cols-6 gap-2 menu:order-2 menu:w-auto menu:flex-1">
          {GEBETE.map((g) => karte(g, false))}
        </ul>
        <Link
          href={alleHref}
          className="order-2 ml-auto inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border border-gruen-100 px-4 font-bold text-weiss no-underline transition-colors hover:bg-gruen-800 hover:text-weiss menu:order-3"
        >
          <span>{texte.alle}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>
      {/* Telefon: nächstes Gebet + aufklappbare Liste */}
      <div className="flex flex-col gap-3 px-4 pt-3 pb-4 md:hidden">
        {/* Hinweis in eigener Zeile: Das Datum erscheint erst nach der Hydrierung und darf nichts umbrechen (CLS, K-12) */}
        <div className="flex flex-col items-start gap-2 text-16">
          <span className="flex items-center gap-1.5 text-gruen-100">
            <MapPin aria-hidden className="size-4" />
            <span>
              {texte.ort}
              {jetzt ? ` · ${datumText}` : ''}
            </span>
          </span>
          {hinweis}
        </div>
        <div className="flex flex-col gap-0.5 rounded-lg bg-weiss px-4 py-3 text-gruen-950">
          <span className="text-16 font-bold text-gruen-800">{texte.naechstes}</span>
          <span className="text-24 leading-tight font-bold">
            {naechstesName} · <span className="tabular-nums">{naechstesZeit}</span>
          </span>
          <span className="text-16 font-bold text-tinte-2">{texte.verbleibt.replace('{zeit}', restText)}</span>
        </div>
        <button
          type="button"
          aria-expanded={aufgeklappt}
          aria-controls="leiste-alle"
          onClick={() => setAufgeklappt((a) => !a)}
          className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md border border-gruen-100 bg-transparent text-18 font-bold text-weiss"
        >
          <span>{aufgeklappt ? texte.ausblenden : texte.anzeigen}</span>
          {aufgeklappt ? <ChevronUp aria-hidden className="size-5" /> : <ChevronDown aria-hidden className="size-5" />}
        </button>
        <div id="leiste-alle" hidden={!aufgeklappt} className="flex flex-col gap-3">
          <ul aria-label={texte.listeHeute} className="grid grid-cols-3 gap-2">
            {GEBETE.map((g) => karte(g, true))}
          </ul>
          <Link
            href={alleHref}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-weiss font-bold text-gruen-950 no-underline hover:text-gruen-950"
          >
            <span>{texte.alle}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
