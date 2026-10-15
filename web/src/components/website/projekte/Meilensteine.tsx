import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { ErstesSichtbarwerden } from '@/components/website/ErstesSichtbarwerden';
import { Achtstern, Stern8 } from '@/components/website/Icons';
import { istNurPlatzhalter, MitPlatzhaltern } from '@/components/website/Platzhalter';
import { Text } from '@/components/website/Text';
import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

type Meilenstein = ProjekteInhalt['meilensteine'][number];

/**
 * Zuletzt erledigter Meilenstein (-1, wenn keiner erledigt ist) und der nächste offene (-1, wenn alle erledigt sind).
 * Gemeinsam für Linie und Zeilen, damit Achtstern und Linie dieselbe Marke meinen.
 */
function marken(liste: Meilenstein[]): { zuletzt: number; naechster: number } {
  const zuletzt = liste.reduce((bis, m, i) => (m.erledigt ? i : bis), -1);
  const naechster = zuletzt + 1 < liste.length ? zuletzt + 1 : -1;
  return { zuletzt, naechster };
}

/**
 * Projektmeilensteine (Design Projects.dc.html D:72–86, Sprungziel #meilensteine): Zeilen in der Reihenfolge der Liste,
 * Status „Abgeschlossen“ oder „Geplant“ je Zeile. Darüber die Meilensteinlinie (großer Moment B-08): Stand als Satz, die
 * Linie reicht bis zum letzten erledigten Meilenstein und wächst beim ersten Sichtbarwerden. Ohne Einträge ein Platzhalter.
 * Kennung „Baufortschritt“ mit Achtstern über dem Titel (Referenz: Seitenkopf).
 * Sichtabnahme Runde 2: Sind alle Meilensteine erledigt, sagt der Stand „6 von 6“ schon alles – „Abgeschlossen“ steht
 * dann nur noch für Screenreader in jeder Zeile (PR-5; die Haken sind Bild). Platzhalter „[…]“ sind gekennzeichnet (PR-3).
 */
export async function Meilensteine({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const liste = inhalt.meilensteine;
  const { naechster } = marken(liste);
  const alleErledigt = liste.length > 0 && liste.every((m) => m.erledigt);
  const rueckfall = brauchtRueckfall(
    sprache,
    liste.flatMap((m) => [m.titel, m.beschreibung, m.datum]),
  );
  const bezeichnung = { abgeschlossen: t('meilenstein.abgeschlossen'), geplant: t('meilenstein.geplant') };
  return (
    <section id="meilensteine" aria-labelledby="meilensteine-titel" className="flex scroll-mt-24 flex-col gap-6">
      <div className="flex max-w-einleitung flex-col gap-3">
        <span className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
          <Stern8 className="size-4" />
          {t('bezeichnungen.meilensteinKennung')}
        </span>
        <h2 id="meilensteine-titel" className="text-display-2">
          {t('bezeichnungen.meilensteine')}
        </h2>
      </div>
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
      {liste.length > 0 ? (
        <Linie
          liste={liste}
          sprache={sprache}
          stand={t('meilenstein.stand', { erledigt: liste.filter((m) => m.erledigt).length, gesamt: liste.length })}
        />
      ) : null}
      {liste.length > 0 ? (
        // PR-2: alle Meilensteine als gleich gebaute Zeilen, getrennt durch eine feine 1-px-Linie
        <ol className="divide-y divide-linie overflow-hidden rounded-lg border border-linie bg-weiss">
          {liste.map((m, i) => (
            <Zeile
              key={i}
              m={m}
              sprache={sprache}
              bezeichnung={bezeichnung}
              nummer={i + 1}
              hervorgehoben={i === naechster || (naechster < 0 && i === liste.length - 1)}
              alleErledigt={alleErledigt}
            />
          ))}
        </ol>
      ) : (
        <p className="text-18 text-tinte-2">
          <MitPlatzhaltern text={t('platzhalter.gemeinde')} />
        </p>
      )}
    </section>
  );
}

/**
 * Meilensteinlinie: gestrichelte Strecke über alle Meilensteine, durchgezogen bis zum letzten erledigten. Die Marken
 * sind Bild (aria-hidden); den Stand trägt der Satz darüber, die Einzelheiten tragen die Zeilen darunter. Der nächste
 * offene Meilenstein trägt einen gefüllten Achtstern (wie „nächstes Gebet“), erledigte einen Haken, übrige eine Ziffer.
 * Die Datumszeile lässt reine Platzhalter wie „[Datum]“ weg (Sichtabnahme Runde 2, PR-3): Die Zeilen darunter nennen sie.
 */
function Linie({ liste, sprache, stand }: { liste: Meilenstein[]; sprache: Sprache; stand: string }) {
  const { zuletzt, naechster } = marken(liste);
  const lage = (i: number) => (liste.length > 1 ? i / (liste.length - 1) : 0.5);
  const anteil = zuletzt < 0 ? 0 : lage(zuletzt);
  // B-08 Fortschreibung (AUFTRAG 4): Ist alles erledigt, endet die Linie in der gefüllten Marke des letzten Meilensteins
  const ziel = naechster < 0 && liste.length > 0 ? liste.length - 1 : -1;
  return (
    <ErstesSichtbarwerden className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss px-5 py-5 md:px-8">
      <p className="font-display text-24 text-tinte">{stand}</p>
      <div aria-hidden className="relative mx-4 h-10">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-rand" />
        {anteil > 0 ? (
          <span
            className="meilenstein-fortschritt absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-pill bg-gruen-700"
            style={{ width: `${anteil * 100}%` }}
          />
        ) : null}
        <ol className="absolute inset-0">
          {liste.map((m, i) =>
            i === naechster ? (
              <li
                key={i}
                className="absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-gruen-700"
                style={{ left: `${lage(i) * 100}%` } as CSSProperties}
              >
                <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
                <span className="relative rounded-pill text-16 font-bold text-weiss">{i + 1}</span>
              </li>
            ) : i === ziel ? (
              <li
                key={i}
                className="meilenstein-erreicht absolute top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-gruen-700"
                style={{ left: `${lage(i) * 100}%`, '--anteil': 1 } as CSSProperties}
              >
                <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
                <Check className="relative size-5 text-weiss" strokeWidth={3} />
              </li>
            ) : (
              <li
                key={i}
                className={cn(
                  'absolute top-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border-2 text-16 font-bold',
                  m.erledigt ? 'meilenstein-erreicht border-gruen-700 bg-gruen-700 text-weiss' : 'border-rand bg-weiss text-tinte-2',
                )}
                style={{ left: `${lage(i) * 100}%`, '--anteil': anteil > 0 ? lage(i) / anteil : 0 } as CSSProperties}
              >
                {m.erledigt ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </li>
            ),
          )}
        </ol>
      </div>
      {liste.length <= 6 ? (
        <ol aria-hidden className="relative mx-4 hidden h-6 lg:block">
          {liste.map((m, i) =>
            istNurPlatzhalter(waehle(m.datum, sprache).text) ? null : (
              <li
                key={i}
                className={cn(
                  'absolute top-0 text-16 whitespace-nowrap text-tinte-2 tabular-nums',
                  liste.length === 1
                    ? '-translate-x-1/2'
                    : i === 0
                      ? '-ml-4'
                      : i === liste.length - 1
                        ? 'ml-4 -translate-x-full'
                        : '-translate-x-1/2',
                )}
                style={{ left: `${lage(i) * 100}%` }}
              >
                <Text feld={m.datum} sprache={sprache} platzhalter />
              </li>
            ),
          )}
        </ol>
      ) : null}
    </ErstesSichtbarwerden>
  );
}

/**
 * Eine Zeile (Sichtabnahme Z-04, PR-2; vorher Karten mit wechselndem Aufbau): Marke (Haken, Ziffer oder Achtstern –
 * dieselbe Marke wie auf der Linie), Titel und Beschreibung, dazu Datum und Status als Text (nicht nur Farbe); ab md
 * stehen Datum und Status rechts. Alle Zeilen sind gleich gebaut; hervorgehoben ist nur die Marke: Der nächste offene
 * Meilenstein – oder, wenn alles erledigt ist, der letzte (B-08: „Eröffnung“) – trägt den gefüllten Achtstern.
 */
function Zeile({
  m,
  sprache,
  bezeichnung,
  nummer,
  hervorgehoben,
  alleErledigt,
}: {
  m: Meilenstein;
  sprache: Sprache;
  bezeichnung: { abgeschlossen: string; geplant: string };
  nummer: number;
  /** Nächster offener Meilenstein – oder, wenn alles erledigt ist, der letzte (B-08: „Eröffnung“) */
  hervorgehoben: boolean;
  /** Alle Meilensteine erledigt: der Status steht nur für Screenreader (PR-5) */
  alleErledigt: boolean;
}) {
  return (
    <li className="grid raster-symbol gap-x-4 gap-y-2 px-5 py-5 md:raster-symbol-aktion md:gap-x-6 md:px-8">
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center text-16 font-bold',
          m.erledigt && !hervorgehoben && 'rounded-pill border-2 border-gruen-700 bg-gruen-700 text-weiss',
          !m.erledigt && !hervorgehoben && 'rounded-pill border-2 border-rand bg-weiss text-tinte-2',
          hervorgehoben && 'relative text-gruen-700',
        )}
      >
        {hervorgehoben ? (
          <>
            <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
            {m.erledigt ? (
              <Check className="relative size-4 text-weiss" strokeWidth={3} />
            ) : (
              <span className="relative rounded-pill text-weiss">{nummer}</span>
            )}
          </>
        ) : m.erledigt ? (
          <Check className="size-4" strokeWidth={3} />
        ) : (
          nummer
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <Text feld={m.titel} sprache={sprache} als="h3" className="font-text text-20 leading-snug font-bold" platzhalter />
        <Text feld={m.beschreibung} sprache={sprache} als="p" className="text-16 text-tinte-2" platzhalter />
      </div>
      <div className="col-start-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 md:col-start-3 md:row-start-1 md:mt-0.5 md:justify-end">
        <span className="text-16 text-tinte-2 tabular-nums">
          <Text feld={m.datum} sprache={sprache} platzhalter />
        </span>
        {m.erledigt && alleErledigt ? (
          <span className="sr-only">{bezeichnung.abgeschlossen}</span>
        ) : (
          <span
            className={cn(
              'inline-flex rounded-pill px-2.5 text-16 font-bold',
              m.erledigt ? 'bg-gruen-50 text-gruen-800' : 'border border-dashed border-rand bg-weiss text-tinte-2',
            )}
          >
            {m.erledigt ? bezeichnung.abgeschlossen : bezeichnung.geplant}
          </span>
        )}
      </div>
    </li>
  );
}
