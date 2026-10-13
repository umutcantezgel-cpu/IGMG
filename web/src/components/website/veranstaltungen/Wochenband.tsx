import { getTranslations } from 'next-intl/server';
import { Achtstern, Stern8 } from '@/components/website/Icons';
import { textMitSprache } from '@/components/website/Text';
import { datumLang, uhrzeitNackt } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import { type WochenQuelle, wochenband } from './wochenband';

const LOCALE: Record<Sprache, string> = { de: 'de-DE', tr: 'tr-TR', en: 'en-GB' };
/** Je Tag sichtbar höchstens so viele Termine; der Rest steht als „+n“ (Bildschirmleser hören alle). */
const SICHTBAR = 3;

/** Kalendertag (JJJJ-MM-TT) als Mittag UTC: für Wochentag und Tageszahl unabhängig von der Zeitzone des Servers. */
function mittag(datum: string): Date {
  return new Date(`${datum}T12:00:00Z`);
}

/**
 * Wochenband der Veranstaltungsseite (AUFTRAG 4, Arbeitsansicht; Formsystem K-008): die sieben Tage ab heute als Reihe
 * an einer durchgehenden Linie. Ein Tag mit Terminen trägt einen Achtstern-Punkt, ein freier Tag einen kleinen Punkt;
 * darunter die Uhrzeiten (ab md mit Titel). Statisch und ohne Bewegung (Arbeitsansicht: kein Auftritt mit Gewicht),
 * reines SVG/HTML ohne JavaScript. „Heute“ kommt aus dem stündlich erneuerten Datum (`heuteBerlin`), die Termine aus
 * `ladeVeranstaltungen` (stündlich). Die Linie und die Punkte sind Bild (`aria-hidden`); Bildschirmleser hören je Tag
 * das Datum und die Termine bzw. „kein Termin“.
 */
export async function Wochenband({ liste, heute, sprache }: { liste: readonly WochenQuelle[]; heute: string; sprache: Sprache }) {
  const t = await getTranslations('wochenband');
  const tage = wochenband(liste, heute);
  const locale = LOCALE[sprache];
  const wochentag = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  const tagZahl = new Intl.DateTimeFormat(locale, { day: 'numeric', timeZone: 'UTC' });
  const spanne = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const zeitraum = spanne.formatRange(mittag(tage[0].datum), mittag(tage[tage.length - 1].datum));
  return (
    <section aria-labelledby="wochenband-titel" className="flex flex-col gap-3">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-16">
        <Stern8 className="size-4 text-gruen-700" />
        <span id="wochenband-titel" className="font-bold text-gruen-800">
          {t('kennung')}
        </span>
        <span className="text-tinte-2">{zeitraum}</span>
      </p>
      <ol className="grid grid-cols-7 rounded-lg border border-linie bg-weiss px-1 py-3 md:px-3 md:py-4">
        {tage.map((tag, i) => {
          const istHeute = i === 0;
          const mehr = tag.termine.length - SICHTBAR;
          return (
            <li
              key={tag.datum}
              aria-current={istHeute ? 'date' : undefined}
              className={cn('flex min-w-0 flex-col items-center gap-2 rounded-md py-1 text-center', istHeute && 'bg-gruen-50')}
            >
              <span className="sr-only">{datumLang(mittag(tag.datum), sprache)}</span>
              <span aria-hidden className="flex flex-col items-center">
                <span className={cn('text-16', istHeute ? 'font-bold text-gruen-800' : 'text-tinte-2')}>
                  {istHeute ? t('heute') : wochentag.format(mittag(tag.datum))}
                </span>
                <span className={cn('font-display text-24 leading-tight', istHeute ? 'text-gruen-800' : 'text-tinte')}>
                  {tagZahl.format(mittag(tag.datum))}
                </span>
              </span>
              {/* Die Linie läuft durch alle Tage: je Tag die linke und rechte Hälfte, am Rand nur die innere */}
              <span aria-hidden className="relative flex h-6 w-full items-center justify-center">
                {i > 0 ? <span className="absolute top-1/2 right-1/2 left-0 h-0.5 -translate-y-1/2 bg-linie" /> : null}
                {i < tage.length - 1 ? <span className="absolute top-1/2 right-0 left-1/2 h-0.5 -translate-y-1/2 bg-linie" /> : null}
                {tag.termine.length ? (
                  <Achtstern viewBox="3.5 3.5 17 17" className="relative size-5 text-gruen-700" />
                ) : (
                  <span className="relative size-2 rounded-pill bg-rand" />
                )}
              </span>
              {tag.termine.length ? (
                <ul className="flex w-full min-w-0 flex-col gap-1.5 px-0.5 md:px-2">
                  {tag.termine.map((termin, j) => {
                    const titel = textMitSprache(termin.titel, sprache);
                    const beginn = new Date(termin.beginn);
                    return (
                      <li
                        key={`${termin.id}-${termin.beginn}`}
                        className={cn('flex flex-col text-16 leading-snug', j >= SICHTBAR && 'sr-only')}
                      >
                        {termin.ganztaegig ? (
                          <span className="text-tinte-2 max-md:sr-only">{t('ganztaegig')}</span>
                        ) : (
                          <time dateTime={termin.beginn} className="font-bold text-gruen-800 tabular-nums">
                            {uhrzeitNackt(beginn, sprache)}
                          </time>
                        )}
                        <span lang={titel.lang} className="text-tinte-2 max-md:sr-only md:line-clamp-2 md:break-words">
                          {titel.text}
                        </span>
                      </li>
                    );
                  })}
                  {mehr > 0 ? (
                    <li aria-hidden className="text-16 text-tinte-2">
                      {t('mehr', { anzahl: mehr })}
                    </li>
                  ) : null}
                </ul>
              ) : (
                <span className="sr-only">{t('keinTermin')}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
