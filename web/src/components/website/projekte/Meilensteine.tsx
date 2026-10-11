import { Building2, CircleCheck, Clock } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { ProjekteInhalt } from '@/lib/validierung/seiteninhalte/projekte';
import { brauchtRueckfall } from './hilfen';

type Meilenstein = ProjekteInhalt['meilensteine'][number];

/**
 * Projektmeilensteine (Design Projects.dc.html D:72–86, Sprungziel #meilensteine): Karten in der Reihenfolge der Liste,
 * Status „Abgeschlossen“ oder „Geplant“ je Karte. Ohne Einträge steht ein Platzhalter.
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
      <h2 id="meilensteine-titel" className="flex items-center gap-3 text-30 md:text-36">
        <Building2 aria-hidden className="size-7 shrink-0 text-gruen-700" />
        {t('bezeichnungen.meilensteine')}
      </h2>
      {rueckfall ? <p className="text-16 text-tinte-2">{tAllg('nurDeutsch')}</p> : null}
      {liste.length > 0 ? (
        <ol className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
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
