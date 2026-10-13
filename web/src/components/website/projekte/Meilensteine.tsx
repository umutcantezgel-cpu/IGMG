import { Check } from 'lucide-react';
import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { ErstesSichtbarwerden } from '@/components/website/ErstesSichtbarwerden';
import { Achtstern, Stern8 } from '@/components/website/Icons';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

type Meilenstein = ProjekteInhalt['meilensteine'][number];

/**
 * Zuletzt erledigter Meilenstein (-1, wenn keiner erledigt ist) und der nächste offene (-1, wenn alle erledigt sind).
 * Gemeinsam für Linie und Karten, damit Achtstern und Linie dieselbe Marke meinen.
 */
function marken(liste: Meilenstein[]): { zuletzt: number; naechster: number } {
  const zuletzt = liste.reduce((bis, m, i) => (m.erledigt ? i : bis), -1);
  const naechster = zuletzt + 1 < liste.length ? zuletzt + 1 : -1;
  return { zuletzt, naechster };
}

/**
 * Projektmeilensteine (Design Projects.dc.html D:72–86, Sprungziel #meilensteine): Karten in der Reihenfolge der Liste,
 * Status „Abgeschlossen“ oder „Geplant“ je Karte. Darüber die Meilensteinlinie (großer Moment B-08): Stand als Satz, die
 * Linie reicht bis zum letzten erledigten Meilenstein und wächst beim ersten Sichtbarwerden. Ohne Einträge ein Platzhalter.
 * Kennung „Baufortschritt“ mit Achtstern über dem Titel (Referenz: Seitenkopf).
 */
export async function Meilensteine({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const liste = inhalt.meilensteine;
  const { naechster } = marken(liste);
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
        <ol className="grid gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3">
          {liste.map((m, i) => (
            <Karte key={i} m={m} sprache={sprache} bezeichnung={bezeichnung} nummer={i + 1} naechster={i === naechster} />
          ))}
        </ol>
      ) : (
        <p className="text-18 text-tinte-2">{t('platzhalter.gemeinde')}</p>
      )}
    </section>
  );
}

/**
 * Meilensteinlinie: gestrichelte Strecke über alle Meilensteine, durchgezogen bis zum letzten erledigten. Die Marken
 * sind Bild (aria-hidden); den Stand trägt der Satz darüber, die Einzelheiten tragen die Karten darunter. Der nächste
 * offene Meilenstein trägt einen gefüllten Achtstern (wie „nächstes Gebet“), erledigte einen Haken, übrige eine Ziffer.
 */
function Linie({ liste, sprache, stand }: { liste: Meilenstein[]; sprache: Sprache; stand: string }) {
  const { zuletzt, naechster } = marken(liste);
  const lage = (i: number) => (liste.length > 1 ? i / (liste.length - 1) : 0.5);
  const anteil = zuletzt < 0 ? 0 : lage(zuletzt);
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
          {liste.map((m, i) => (
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
              <Text feld={m.datum} sprache={sprache} />
            </li>
          ))}
        </ol>
      ) : null}
    </ErstesSichtbarwerden>
  );
}

/**
 * Eine Karte: Marke (Haken, Ziffer oder nächster Achtstern – dieselbe Marke wie auf der Linie), Titel, Datum und Status
 * als Text (nicht nur Farbe), Beschreibung.
 */
function Karte({
  m,
  sprache,
  bezeichnung,
  nummer,
  naechster,
}: {
  m: Meilenstein;
  sprache: Sprache;
  bezeichnung: { abgeschlossen: string; geplant: string };
  nummer: number;
  naechster: boolean;
}) {
  return (
    <li
      className={cn(
        'flex gap-4',
        naechster
          ? 'rounded-lg border border-linie bg-weiss p-5 shadow-s1'
          : cn('border-t-2 px-5 pt-5', m.erledigt ? 'border-gruen-700' : 'border-linie'),
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center text-16 font-bold',
          m.erledigt && 'rounded-pill border-2 border-gruen-700 bg-gruen-700 text-weiss',
          !m.erledigt && !naechster && 'rounded-pill border-2 border-rand bg-weiss text-tinte-2',
          naechster && 'relative text-gruen-700',
        )}
      >
        {m.erledigt ? (
          <Check className="size-4" strokeWidth={3} />
        ) : naechster ? (
          <>
            <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
            <span className="relative rounded-pill text-weiss">{nummer}</span>
          </>
        ) : (
          nummer
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <Text feld={m.titel} sprache={sprache} als="h3" className="font-text text-20 leading-snug font-bold" />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="text-16 text-tinte-2 tabular-nums">
            <Text feld={m.datum} sprache={sprache} />
          </span>
          <span
            className={cn(
              'inline-flex rounded-pill px-2.5 text-16 font-bold',
              m.erledigt ? 'bg-gruen-50 text-gruen-800' : 'border border-dashed border-rand bg-weiss text-tinte-2',
            )}
          >
            {m.erledigt ? bezeichnung.abgeschlossen : bezeichnung.geplant}
          </span>
        </div>
        <Text feld={m.beschreibung} sprache={sprache} als="p" className="text-16 text-tinte-2" />
      </div>
    </li>
  );
}
