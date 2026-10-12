'use client';

import { Moon, Sun, Sunrise, Sunset, type LucideIcon } from 'lucide-react';
import { type CSSProperties, type ReactNode, useState } from 'react';
import { Achtstern } from '@/components/website/Icons';
import { TagesbogenLive, type TagesbogenTexte } from '@/components/website/start/TagesbogenLive';
import { berlinerDatum, naechstesGebet, type NaechstesGebet } from '@/lib/gebetszeiten/naechstes';
import { GEBETE, type Gebet, type GebetszeitTag } from '@/lib/gebetszeiten/typen';
import { klassen } from '@/lib/klassen';
import { useJetzt } from '@/lib/zeit/useJetzt';
import { GebetszeitenTabs, type TabSchluessel } from './GebetszeitenTabs';
import { fuelle, restzeitText } from './zeiten';

/** Fertig übersetzte Texte aus messages; Platzhalter wie {name} füllt die Komponente (K-12). */
export type GebetszeitenSeiteTexte = {
  /** „{name} (morgen)“: Das nächste Gebet liegt am Folgetag (nach Isha), damit die Zeit nicht mit der heutigen Tafel verwechselt wird. */
  naechstesMorgen: string;
  uhr: string;
  verbleibt: string;
  restStunden: string;
  restMinuten: string;
  /** Kennung „Nächstes Gebet“ (Leiste): in der Überschrift des Bereichs und an der nächsten Zeit der Tafel. */
  naechstesTag: string;
  badgeInfo: string;
  /** Name der Tafel für Hilfstechnik (Leiste, listeHeute). */
  listeHeute: string;
  /** Titel und Beschreibung des Tagesbogens (start.bogenTitel, start.bogenBeschreibung). */
  bogenTitel: string;
  bogenBeschreibung: string;
  /** Locale für Datum und Hidschri im Tagesbogen. */
  bogenLocale: string;
  /** Kopfzeilen des Tagesbogens je Kalendertag, auf dem Server berechnet (H-L01) */
  tageszeilen?: Record<string, string>;
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
  panels: Record<'monat' | 'qibla' | 'einstellungen', ReactNode>;
};

const SYMBOL: Record<Gebet, LucideIcon> = { imsak: Moon, gunes: Sunrise, ogle: Sun, ikindi: Sun, aksam: Sunset, yatsi: Moon };

/**
 * Gebetszeiten im Browser (Blatt S02): oben das nächste Gebet mit Restzeit, im Tab Heute der Tagesbogen (ruhig, B-10)
 * neben einer Tafel mit den sechs Zeiten. Uhrzeit, nächstes Gebet und Restzeit rechnet der Browser aus den
 * zwischengespeicherten Tageszeiten (K-08). Bis zur Hydrierung steht ein Platzhalter „–“, und die Tafel zeigt alle
 * Zeiten grün, damit nichts springt (K-12, kein CLS).
 */
export function GebetszeitenSeite({ tage, referenz, texte, panels }: GebetszeitenSeiteProps) {
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
  const morgen = tage[index + 1];
  const naechstes =
    heute && jetzt
      ? naechstesGebet({ datum: heute.datum, zeiten: heute }, morgen ? { datum: morgen.datum, zeiten: morgen } : null, jetzt, true)
      : null;
  // B-10: Gewechselt ist nur ein echter Wechsel von Gebet oder Tagesteil; der erste Wert nach der Hydrierung zählt nicht.
  // Der Merker wird beim Rendern fortgeschrieben (Muster „Information aus vorherigem Rendern“), nicht im Effekt: So wirken
  // Einblendung und Überblendung schon in dem Durchgang, der die neue Hervorhebung zeigt.
  const wechsel = naechstes ? `${naechstes.gebet}-${naechstes.morgen ? 'morgen' : 'heute'}` : null;
  const [merker, setMerker] = useState<{ wechsel: string | null; gewechselt: boolean }>({ wechsel, gewechselt: false });
  let gewechselt = merker.gewechselt;
  if (merker.wechsel !== wechsel) {
    gewechselt = merker.wechsel !== null && wechsel !== null;
    setMerker({ wechsel, gewechselt });
  }
  if (!heute) return null;

  const zeitTag = naechstes ? (naechstes.morgen ? morgen : heute) : undefined;
  const naechstesName = naechstes
    ? naechstes.morgen
      ? fuelle(texte.naechstesMorgen, { name: texte.namen[naechstes.gebet] })
      : texte.namen[naechstes.gebet]
    : '–';
  const naechsteZeit = naechstes && zeitTag ? fuelle(texte.uhr, { zeit: zeitTag[naechstes.gebet] }) : '–';
  const verbleibt = naechstes ? restzeitText(naechstes.restMs, { stunden: texte.restStunden, minuten: texte.restMinuten }) : '–';
  // Ohne alleHref zeigt der Tagesbogen keinen Link; das Pflichtfeld bleibt leer.
  const bogenTexte: TagesbogenTexte = {
    titel: texte.bogenTitel,
    beschreibung: texte.bogenBeschreibung,
    namen: texte.namen,
    listeHeute: texte.listeHeute,
    alle: '',
    locale: texte.bogenLocale,
    tageszeilen: texte.tageszeilen,
  };

  return (
    <>
      <section
        aria-labelledby="gz-naechstes"
        className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 rounded-lg bg-gruen-950 p-5 text-weiss md:p-8"
      >
        {/* Name, Zeit und Restzeit gehören zu einem Gebet: Bei jedem echten Wechsel blenden sie neu ein (B-10) */}
        <div
          key={wechsel ?? 'ohne'}
          className={klassen(
            'flex min-w-0 flex-col gap-1 lg:w-full lg:flex-row lg:items-end lg:justify-between lg:gap-8',
            gewechselt && 'blendet-ein',
          )}
          style={gewechselt ? ({ '--dauer': 'var(--dauer-wechsel)' } as CSSProperties) : undefined}
        >
          <h2 id="gz-naechstes" className="flex flex-col items-start gap-1">
            <span className="inline-flex items-center gap-2 font-text text-16 font-bold text-gruen-100">
              <Achtstern size={16} />
              {texte.naechstesTag}
            </span>{' '}
            <span className="block font-display text-display-2 text-weiss">{naechstesName}</span>
          </h2>
          {/* Ab lg steht die Zeit rechts neben dem Namen: die dunkle Fläche trägt eine Zeile statt eines leeren Viertels */}
          <div className="flex flex-col gap-1 lg:items-end">
            <span className="text-48 font-bold tabular-nums md:text-anzeige-64">{naechsteZeit}</span>
            <span className="text-20 font-bold">{fuelle(texte.verbleibt, { zeit: verbleibt })}</span>
          </div>
        </div>
      </section>
      <GebetszeitenTabs
        ansichtAria={texte.ansichtAria}
        labels={texte.tabs}
        panels={{
          heute: (
            // Unter lg steht die Tafel vor dem Bogen; ab lg liegt der Bogen links (zwei Spalten), die Tafel rechts
            <div className="grid items-start gap-6 lg:grid-cols-3 lg:items-stretch">
              <HeuteTafel heute={heute} naechstes={naechstes} texte={texte} gewechselt={gewechselt} />
              <TagesbogenLive ruhig tage={tage} referenz={referenz} texte={bogenTexte} className="lg:order-first lg:col-span-2" />
            </div>
          ),
          monat: panels.monat,
          qibla: panels.qibla,
          einstellungen: panels.einstellungen,
        }}
      />
    </>
  );
}

/**
 * Die sechs Tageszeiten als Tafel (Tab Heute, alle Breiten): eine Liste mit Trennlinien. Das nächste Gebet ist
 * hervorgehoben und trägt die Kennung; Gebete vor dem nächsten sind grau. Die Hervorhebung wandert nur nach einem
 * echten Wechsel (`gewechselt`), beim ersten Setzen sofort.
 */
function HeuteTafel({
  heute,
  naechstes,
  texte,
  gewechselt,
}: {
  heute: GebetszeitTag;
  naechstes: NaechstesGebet | null;
  texte: GebetszeitenSeiteTexte;
  gewechselt: boolean;
}) {
  return (
    <ul
      aria-label={texte.listeHeute}
      className="divide-y divide-linie overflow-hidden rounded-lg border border-linie bg-weiss shadow-s1 lg:flex lg:flex-col"
    >
      {GEBETE.map((g) => {
        const ist = naechstes !== null && !naechstes.morgen && naechstes.gebet === g;
        const vergangen = naechstes !== null && (naechstes.morgen || GEBETE.indexOf(g) < GEBETE.indexOf(naechstes.gebet));
        const Icon = SYMBOL[g];
        return (
          <li
            key={g}
            data-gebet={g}
            aria-current={ist ? 'time' : undefined}
            className={klassen(
              'flex min-h-18 items-center gap-4 px-4 py-3 md:px-6 lg:flex-1',
              ist && 'bg-gruen-50',
              gewechselt && 'transition-colors duration-(--dauer-wechsel)',
            )}
          >
            <Icon aria-hidden className={klassen('size-6 shrink-0', vergangen ? 'text-tinte-3' : 'text-gruen-700')} />
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="font-text text-20 leading-snug font-bold">{texte.namen[g]}</h3>
                {g === 'gunes' ? (
                  <span className="inline-flex rounded-pill bg-info-toenung px-2.5 py-0.5 text-16 font-bold text-info">
                    {texte.badgeInfo}
                  </span>
                ) : null}
              </div>
              {ist ? (
                <span className="inline-flex min-h-6 items-center gap-1.5 text-16 font-bold text-gruen-800">
                  <Achtstern size={16} className="shrink-0" />
                  {texte.naechstesTag}
                </span>
              ) : (
                <span className="min-h-6 text-16 text-tinte-2">{texte.beschreibungen[g]}</span>
              )}
            </div>
            <span className={klassen('shrink-0 text-30 font-bold tabular-nums', vergangen ? 'text-tinte-3' : 'text-gruen-800')}>
              {heute[g]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
