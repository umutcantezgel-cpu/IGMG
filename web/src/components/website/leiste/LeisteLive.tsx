'use client';

import { ArrowRight, ChevronDown, ChevronUp, Clock, Info, MapPin, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { type CSSProperties, useState } from 'react';
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
  /** Restzeit, wenn das nächste Gebet erst morgen ist („morgen · verbleibt: …“) */
  verbleibtMorgen: string;
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

/** B-10 Gebetszeit-Wechsel: Hervorhebung wandert per Überblendung (Dauer `--dauer-wechsel`, Kurve `ease-standard`). */
const WECHSEL = 'transition-colors duration-(--dauer-wechsel) ease-standard';
/** Dauer des Einblendens für den neuen Namensbereich (`blendet-ein` liest `--dauer`). */
const DAUER_WECHSEL = { '--dauer': 'var(--dauer-wechsel)' } as CSSProperties;

/**
 * PrayerTimesBar (design/PrayerTimesBar.dc.html): Tageszeiten, nächstes Gebet und Restzeit rechnet der
 * Browser aus den zwischengespeicherten Zeiten (K-08). Restzeit ohne Live-Region (K-11: keine Daueransage).
 * Vor dem Einhängen zeigt die Leiste den Referenztag des Servers ohne Hervorhebung (keine Uhrzeit beim Prerender).
 * Bewegung nur bei einem Wechsel zwischen zwei Gebeten (B-10); beim ersten Laden steht alles sofort da.
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
  const restZeile = (naechstes?.morgen ? texte.verbleibtMorgen : texte.verbleibt).replace('{zeit}', restText);
  // Unsichtbare Platzhalter aller Formen (jedes Gebet, längste Uhrzeit, Restzeit heute/morgen): Der linke Block hat
  // vom Server an seine endgültige Breite – kein Verschieben der Karten nach dem Einhängen oder beim Gebetswechsel
  // Breite Fassung: jeder Name mit längster Uhrzeit (ohne Güneş, er zählt nicht als Gebet, siehe naechstesGebet)
  const platzWert = GEBETE.filter((g) => g !== 'gunes').map((g) => `${texte.namen[g]} · ${zeit('88:88')}`);
  const platzRest = [texte.verbleibt, texte.verbleibtMorgen].map((v) => v.replace('{zeit}', `88${texte.dauer.std} 88${texte.dauer.min}`));

  // B-10: Gewechselt wird erst, wenn ein bekanntes Gebet auf ein anderes folgt. Der Sprung von „noch keine Uhrzeit“
  // (Server) auf das erste Gebet nach dem Einhängen ist kein Wechsel und bleibt ohne Bewegung.
  const gebet = naechstes?.gebet ?? null;
  const [merke, setMerke] = useState<{ gebet: Gebet | null; gewechselt: boolean }>({ gebet: null, gewechselt: false });
  if (gebet !== merke.gebet) {
    setMerke({ gebet, gewechselt: merke.gewechselt || (merke.gebet !== null && gebet !== null) });
  }
  const gewechselt = merke.gewechselt;

  if (!heute) return null;

  /*
   * Karten zeigen nur Namen und Zeit; das nächste Gebet ist hervorgehoben (Fläche, aria-current). „Nächstes Gebet“
   * und die Restzeit stehen am Telefon in der eigenen Karte, am Desktop in festen Zeilen links – so hat die Leiste in
   * jedem Zustand dieselbe Höhe (kein Sprung nach dem Einhängen, K-12) und keine Karte bleibt halb leer.
   */
  const karte = (g: Gebet, klein: boolean) => {
    const ist = naechstes?.gebet === g && !naechstes.morgen;
    const Icon = ICON[g];
    const wechsel = gewechselt ? WECHSEL : undefined;
    return (
      <li
        key={g}
        aria-current={ist ? 'time' : undefined}
        className={klassen(
          // Breit: Namen oben, Zeiten unten – alle Zeiten stehen auf einer Linie, auch wenn ein Name umbricht
          'flex min-w-0 flex-col gap-0.5 border',
          klein ? 'justify-center rounded-md px-2.5 py-2' : 'justify-between rounded-lg px-2.5 py-2.5',
          ist ? 'border-weiss bg-weiss' : 'border-gruen-800 bg-gruen-950',
          wechsel,
        )}
      >
        <span
          className={klassen(
            'flex items-center gap-1.5 text-16 leading-snug font-bold wrap-anywhere',
            ist ? 'text-gruen-800' : 'text-gruen-50',
            wechsel,
          )}
        >
          {klein ? null : <Icon aria-hidden className="size-4 shrink-0 max-xl:hidden" />}
          <span>{texte.namen[g]}</span>
        </span>
        <span
          className={klassen(
            'font-bold tabular-nums',
            klein ? 'text-20' : 'text-24 leading-tight',
            ist ? 'text-gruen-950' : 'text-weiss',
            wechsel,
          )}
        >
          {heute[g]}
        </span>
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
        <div className="order-1 flex min-w-55 flex-none flex-col gap-1">
          <div className="flex items-center gap-2 font-bold">
            <MapPin aria-hidden className="size-5 text-gruen-100" />
            <span>{texte.ort}</span>
          </div>
          <div className="flex min-h-6 items-center gap-2 text-16 text-gruen-100">
            <Clock aria-hidden className="size-5" />
            <span className="tabular-nums">{jetzt ? `${datumText} · ${uhrText}` : ''}</span>
          </div>
          {/* Feste Zeilen: vor dem Einhängen unsichtbar mit Platzhalter, danach das nächste Gebet (B-10 blendet bei Wechsel ein) */}
          <div
            key={gebet ?? 'leer'}
            style={DAUER_WECHSEL}
            className={klassen('flex flex-col text-16 tabular-nums', !naechstes && 'invisible', gewechselt && 'blendet-ein')}
          >
            <span className="text-16 text-gruen-100">{texte.naechstes}</span>
            <span className="grid text-20 leading-tight font-bold text-weiss">
              {platzWert.map((p) => (
                <span key={p} aria-hidden className="invisible col-start-1 row-start-1">
                  {p}
                </span>
              ))}
              <span className="col-start-1 row-start-1">
                {naechstesName}
                {naechstesZeit ? ` · ${naechstesZeit}` : ''}
              </span>
            </span>
            <span className="grid text-gruen-100">
              {platzRest.map((p) => (
                <span key={p} aria-hidden className="invisible col-start-1 row-start-1">
                  {p}
                </span>
              ))}
              <span className="col-start-1 row-start-1">{restZeile}</span>
            </span>
          </div>
          {hinweis}
        </div>
        <ul aria-label={texte.listeHeute} className="order-3 grid w-full grid-cols-6 gap-2 menu:order-2 menu:w-auto menu:flex-1">
          {GEBETE.map((g) => karte(g, false))}
        </ul>
        <Link
          href={alleHref}
          className="order-2 ml-auto inline-flex min-h-12 shrink-0 items-center gap-2 rounded-md border border-gruen-100 px-4 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98 menu:order-3"
        >
          <span>{texte.alle}</span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>
      {/* Telefon: Ort und Datum in einer Zeile, darunter die Karte „Nächstes Gebet“ mit Fußzeile zum Aufklappen */}
      <div className="flex flex-col gap-3 px-4 py-3 md:hidden">
        {/* Nur Ort und Datum, einzeilig: Das Datum erscheint erst nach der Hydrierung und darf nichts umbrechen (CLS, K-12) */}
        <div className="flex min-w-0 items-center gap-1.5 text-16 text-gruen-100">
          <MapPin aria-hidden className="size-4 shrink-0" />
          <span className="min-w-0 truncate">
            {texte.ort}
            {jetzt ? ` · ${datumText}` : ''}
          </span>
        </div>
        <div className="overflow-hidden rounded-lg bg-weiss text-gruen-950">
          {/* Kopf: „Nächstes Gebet“ und der Hinweis „berechnet“ bleiben stehen, wenn das Gebet wechselt */}
          <div className="flex items-center justify-between gap-2 px-4 pt-3">
            <span className="text-16 font-bold text-gruen-800">{texte.naechstes}</span>
            {hinweis}
          </div>
          {/* Name, Zeit und Restzeit blenden bei jedem Gebetswechsel neu ein (B-10); der Countdown tickt ohne Bewegung */}
          <div
            key={gebet ?? 'ohne'}
            style={DAUER_WECHSEL}
            className={klassen('flex flex-col gap-0.5 px-4 pb-3', gewechselt && 'blendet-ein')}
          >
            <span className="text-24 leading-tight font-bold">
              {naechstesName} · <span className="tabular-nums">{naechstesZeit}</span>
            </span>
            <span className="text-16 font-bold text-tinte-2 tabular-nums">{restZeile}</span>
          </div>
          {/* Fußzeile der Karte; der Fokusrahmen liegt 2 px innen, damit der Zuschnitt der Karte ihn nicht abschneidet und er nicht mit dem dunklen Grund der Leiste verschwimmt */}
          <button
            type="button"
            aria-expanded={aufgeklappt}
            aria-controls="leiste-alle"
            onClick={() => setAufgeklappt((a) => !a)}
            className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 border-t border-linie text-18 font-bold text-gruen-800 -outline-offset-4 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98"
          >
            <span>{aufgeklappt ? texte.ausblenden : texte.anzeigen}</span>
            {aufgeklappt ? <ChevronUp aria-hidden className="size-5" /> : <ChevronDown aria-hidden className="size-5" />}
          </button>
        </div>
        <div id="leiste-alle" hidden={!aufgeklappt} className="flex flex-col gap-3">
          <ul aria-label={texte.listeHeute} className="grid grid-cols-3 gap-2">
            {GEBETE.map((g) => karte(g, true))}
          </ul>
          <Link
            href={alleHref}
            className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-weiss font-bold text-gruen-950 no-underline transition duration-(--dauer-rueckmeldung) hover:text-gruen-950 active:scale-98"
          >
            <span>{texte.alle}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
