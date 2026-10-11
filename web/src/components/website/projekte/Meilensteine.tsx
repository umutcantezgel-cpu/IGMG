import { Building2, Check, CircleCheck, Clock } from 'lucide-react';
import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { ErstesSichtbarwerden } from '@/components/website/ErstesSichtbarwerden';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

type Meilenstein = ProjekteInhalt['meilensteine'][number];

/**
 * Projektmeilensteine (Design Projects.dc.html D:72–86, Sprungziel #meilensteine): Karten in der Reihenfolge der Liste,
 * Status „Abgeschlossen“ oder „Geplant“ je Karte. Darüber die Meilensteinlinie (großer Moment B-08): Stand als Satz, die
 * Linie reicht bis zum letzten erledigten Meilenstein und wächst beim ersten Sichtbarwerden. Ohne Einträge ein Platzhalter.
 */
export async function Meilensteine({ inhalt, sprache }: { inhalt: ProjekteInhalt; sprache: Sprache }) {
  const t = await getTranslations('projekte');
  const tAllg = await getTranslations('allgemein');
  const liste = inhalt.meilensteine;
  const rueckfall = brauchtRueckfall(
    sprache,
    liste.flatMap((m) => [m.titel, m.beschreibung, m.datum]),
  );
  const bezeichnung = { abgeschlossen: t('meilenstein.abgeschlossen'), geplant: t('meilenstein.geplant') };
  return (
    <section id="meilensteine" aria-labelledby="meilensteine-titel" className="flex scroll-mt-24 flex-col gap-6">
      <h2 id="meilensteine-titel" className="flex items-center gap-3 text-display-2">
        <Building2 aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('bezeichnungen.meilensteine')}
      </h2>
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
      {liste.length > 0 ? (
        <Linie liste={liste} stand={t('meilenstein.stand', { erledigt: liste.filter((m) => m.erledigt).length, gesamt: liste.length })} />
      ) : null}
      {liste.length > 0 ? (
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {liste.map((m, i) => (
            <Karte key={i} m={m} sprache={sprache} bezeichnung={bezeichnung} />
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
 * sind Bild (aria-hidden); den Stand trägt der Satz darüber, die Einzelheiten tragen die Karten darunter.
 */
function Linie({ liste, stand }: { liste: Meilenstein[]; stand: string }) {
  const zuletzt = liste.reduce((bis, m, i) => (m.erledigt ? i : bis), -1);
  const lage = (i: number) => (liste.length > 1 ? i / (liste.length - 1) : 0.5);
  const anteil = zuletzt < 0 ? 0 : lage(zuletzt);
  return (
    <ErstesSichtbarwerden className="flex flex-col gap-4 rounded-lg border border-linie bg-weiss px-5 py-5 md:px-8">
      <p className="text-18 font-bold text-gruen-800">{stand}</p>
      <div aria-hidden className="relative mx-4 h-10">
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-rand" />
        {anteil > 0 ? (
          <span
            className="meilenstein-fortschritt absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-pill bg-gruen-700"
            style={{ width: `${anteil * 100}%` }}
          />
        ) : null}
        <ol className="absolute inset-0">
          {liste.map((m, i) => (
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
          ))}
        </ol>
      </div>
    </ErstesSichtbarwerden>
  );
}

/** Eine Karte: Symbol, Titel, Datum und Status als Text (nicht nur Farbe), Beschreibung. */
function Karte({ m, sprache, bezeichnung }: { m: Meilenstein; sprache: Sprache; bezeichnung: { abgeschlossen: string; geplant: string } }) {
  return (
    <li className={cn('flex gap-4 rounded-lg bg-weiss p-5', m.erledigt ? 'border-2 border-gruen-700' : 'border border-linie')}>
      {m.erledigt ? (
        <CircleCheck aria-hidden className="mt-0.5 size-6 shrink-0 text-gruen-700" />
      ) : (
        <Clock aria-hidden className="mt-0.5 size-6 shrink-0 text-warnung" />
      )}
      <div className="flex min-w-0 flex-col gap-1.5">
        <Text feld={m.titel} sprache={sprache} als="h3" className="font-text text-20 leading-snug font-bold" />
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-pill border border-linie bg-sand px-2.5 text-16 font-bold text-tinte-2">
            <Text feld={m.datum} sprache={sprache} />
          </span>
          <span
            className={cn(
              'inline-flex rounded-pill px-2.5 text-16 font-bold',
              m.erledigt ? 'bg-gruen-50 text-gruen-800' : 'bg-warnung-toenung text-warnung',
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
