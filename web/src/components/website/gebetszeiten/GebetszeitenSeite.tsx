'use client';

import { Clock, Compass, Globe, Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { berlinerDatum, naechstesGebet, type NaechstesGebet } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { GebetszeitenTabs, type TabSchluessel } from './GebetszeitenTabs';
import { fuelle, restzeitText } from './zeiten';

/** Fertig übersetzte Texte aus messages; Platzhalter wie {name} füllt die Komponente (K-12). */
export type GebetszeitenSeiteTexte = {
  naechstesTitel: string;
  /** „{name} (morgen)“: Das nächste Gebet liegt am Folgetag (nach Isha), damit die Zeit nicht mit der heutigen Karte verwechselt wird. */
  naechstesMorgen: string;
  uhr: string;
  verbleibt: string;
  restStunden: string;
  restMinuten: string;
  naechstesTag: string;
  badgeGebet: string;
  badgeInfo: string;
  namen: Record<Gebet, string>;
  beschreibungen: Record<Gebet, string>;
  ansichtAria: string;
  tabs: Record<TabSchluessel, string>;
};

export type GebetszeitenSeiteProps = {
  /** Tageszeiten von gestern bis 45 Tage voraus (Abfrage ladeGebetszeitenFenster). */
  tage: GebetszeitTag[];
  /** Kalendertag des Servers beim Rendern; bis zur Hydrierung und ohne Browserzeit gilt er. */
  referenz: string;
  texte: GebetszeitenSeiteTexte;
  qiblaText: string;
  koordinatenText: string;
  panels: Record<'monat' | 'qibla' | 'einstellungen', ReactNode>;
};

const SYMBOL: Record<Gebet, LucideIcon> = { imsak: Moon, gunes: Sunrise, ogle: Sun, ikindi: Sun, aksam: Sunset, yatsi: Moon };

/**
 * Gebetszeiten im Browser (design/PrayerTimes.dc.html, Blatt S02): Nächstes Gebet mit Restzeit über den Tabs,
 * im Tab Heute sechs Karten mit der nächsten Karte hervorgehoben. Uhrzeit, nächstes Gebet und Restzeit rechnet
 * der Browser aus den zwischengespeicherten Tageszeiten (K-08). Bis zur Hydrierung steht ein Platzhalter „–“
 * und jede Karte reserviert ihre Zeile für „Nächstes Gebet“, damit nichts springt (K-12, kein CLS).
 */
export function GebetszeitenSeite({ tage, referenz, texte, qiblaText, koordinatenText, panels }: GebetszeitenSeiteProps) {
  const jetzt = useJetzt();
  const datum = jetzt ? berlinerDatum(jetzt) : referenz;
  const gefunden = tage.findIndex((t) => t.datum === datum);
  const index =
    gefunden >= 0
      ? gefunden
      : Math.max(
          0,
          tage.findIndex((t) => t.datum === referenz),
        );
  const heute = tage[index];
  if (!heute) return null;
  const morgen = tage[index + 1];
  const naechstes = jetzt
    ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
    : null;
  const zeitTag = naechstes ? (naechstes.morgen ? morgen : heute) : undefined;
  const naechstesName = naechstes
    ? naechstes.morgen
      ? fuelle(texte.naechstesMorgen, { name: texte.namen[naechstes.gebet] })
      : texte.namen[naechstes.gebet]
    : '–';
  const naechsteZeit = naechstes && zeitTag ? fuelle(texte.uhr, { zeit: zeitTag[naechstes.gebet] }) : '–';
  const verbleibt = naechstes ? restzeitText(naechstes.restMs, { stunden: texte.restStunden, minuten: texte.restMinuten }) : '–';

  return (
    <>
      <section
        aria-labelledby="gz-naechstes"
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-lg bg-gruen-950 p-5 text-weiss md:p-8"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="gz-naechstes" className="font-text text-20 font-bold text-gruen-100">
            {fuelle(texte.naechstesTitel, { name: naechstesName })}
          </h2>
          <span className="text-48 font-bold tabular-nums md:text-anzeige-64">{naechsteZeit}</span>
          <span className="text-20 font-bold">{fuelle(texte.verbleibt, { zeit: verbleibt })}</span>
        </div>
        <ul className="flex flex-col gap-2 text-18">
          <li className="flex items-center gap-2.5">
            <Compass aria-hidden className="size-5 shrink-0 text-gruen-100" />
            <span>{qiblaText}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <Globe aria-hidden className="size-5 shrink-0 text-gruen-100" />
            <span>{koordinatenText}</span>
          </li>
        </ul>
      </section>
      <GebetszeitenTabs
        ansichtAria={texte.ansichtAria}
        labels={texte.tabs}
        panels={{
          heute: <HeuteKarten heute={heute} naechstes={naechstes} texte={texte} />,
          monat: panels.monat,
          qibla: panels.qibla,
          einstellungen: panels.einstellungen,
        }}
      />
    </>
  );
}

/** Sechs Tageszeiten als Karten (Tab Heute). Die Karte „Nächstes Gebet“ bekommt Ring und Hintergrund, ihre Zeile bleibt immer. */
function HeuteKarten({
  heute,
  naechstes,
  texte,
}: {
  heute: GebetszeitTag;
  naechstes: NaechstesGebet | null;
  texte: GebetszeitenSeiteTexte;
}) {
  // Sechs Karten: eine Reihe ab 1280 px, sonst 3 × 2 bzw. 2 × 3 – nie 4 + 2 (O-Feinschliff nach H-A01)
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {GEBETE.map((g) => {
        const ist = naechstes !== null && !naechstes.morgen && naechstes.gebet === g;
        const Icon = SYMBOL[g];
        const sonnenaufgang = g === 'gunes';
        return (
          <li
            key={g}
            data-gebet={g}
            className={klassen(
              'flex flex-col gap-2 rounded-lg border border-linie px-6 py-5 shadow-s1 transition duration-(--dauer-wechsel)',
              ist ? 'bg-gruen-50 ring-2 ring-gruen-700 ring-inset' : 'bg-weiss',
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <Icon aria-hidden className="size-6 text-gruen-700" />
              <span
                className={klassen(
                  'inline-flex rounded-pill px-2.5 py-0.5 text-16 font-bold',
                  sonnenaufgang ? 'bg-info-toenung text-info' : 'bg-gruen-50 text-gruen-800',
                )}
              >
                {sonnenaufgang ? texte.badgeInfo : texte.badgeGebet}
              </span>
            </div>
            <h3 className="font-text text-20 leading-snug font-bold">{texte.namen[g]}</h3>
            <span className="text-36 font-bold text-gruen-800 tabular-nums">{heute[g]}</span>
            <span className="text-16 text-tinte-2">{texte.beschreibungen[g]}</span>
            <span
              className={klassen(
                'mt-auto inline-flex items-center gap-1.5 self-start rounded-pill bg-gruen-700 px-2.5 py-0.5 text-16 font-bold text-weiss',
                !ist && 'invisible',
              )}
            >
              <Clock aria-hidden className="size-4" />
              {texte.naechstesTag}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
