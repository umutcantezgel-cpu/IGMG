import { ArrowRight, BookOpen } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Text, textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import type { HatimOeffentlich } from '@/lib/hatim/dienst';
import { datumOhneWochentag } from '@/lib/i18n/format';
import { HatimRing, StandZeichen } from './HatimRing';

export const KNOPF_PRIMAER =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss active:scale-98';
export const KNOPF_RAHMEN =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 hover:text-gruen-800 active:scale-98';

/** Kalendertag „JJJJ-MM-TT“ als Datum ohne Wochentag in der Sprache der Seite. */
export function tagText(datum: string, sprache: Locale): string {
  return datumOhneWochentag(new Date(`${datum}T12:00:00Z`), sprache);
}

/** Zahlen einer Hatim als Liste mit Musterzeichen (nie nur Farbe). */
export async function HatimZahlen({ h, kennung }: { h: HatimOeffentlich; kennung: string }) {
  const t = await getTranslations('hatim');
  const frei = 30 - h.vergeben;
  const eintraege = [
    { stand: 'gelesen' as const, text: t('zahl.gelesen', { anzahl: h.gelesen }) },
    { stand: 'vergeben' as const, text: t('zahl.vergeben', { anzahl: h.vergeben - h.gelesen }) },
    { stand: 'frei' as const, text: t('zahl.frei', { anzahl: frei }) },
  ];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-2 text-16 tabular-nums">
      {eintraege.map((e) => (
        <li key={e.stand} className="inline-flex items-center gap-2">
          <StandZeichen stand={e.stand} kennung={`${kennung}-${e.stand}`} />
          {e.text}
        </li>
      ))}
    </ul>
  );
}

/**
 * Karte einer Hatim in der Übersicht: Ring (B-19, Morph-Paar „Hatim-Karte → Ring“), Titel, Anlass, Ziel, Zahlen und
 * zwei Handlungen. `zeichnen` nur für die erste Karte (höchstens ein Auftritt mit Gewicht je Bildschirmhöhe).
 */
export async function HatimKarte({ h, sprache, zeichnen }: { h: HatimOeffentlich; sprache: Locale; zeichnen: boolean }) {
  const t = await getTranslations('hatim');
  const titel = textMitSprache(h.titel, sprache);
  const offen = h.status === 'offen';
  return (
    <article
      data-morph-karte={`h-${h.id}`}
      className="flex flex-col gap-6 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:flex-row md:items-center md:gap-10 md:p-8"
    >
      <HatimRing
        kennung={`karte-${h.id}`}
        teile={h.teile}
        zeichnen={zeichnen}
        className="mx-auto w-48 shrink-0 md:mx-0 md:w-52"
        label={t('ringLabel', { titel: titel.text, gelesen: h.gelesen, vergeben: h.vergeben - h.gelesen, frei: 30 - h.vergeben })}
        mitte={{ zahl: `${h.gelesen}/30`, text: t('ringMitte') }}
      />
      <div className="flex min-w-0 flex-col gap-3">
        <p className="inline-flex items-center gap-2 text-16 font-bold text-gruen-800">
          <span className={offen ? 'rounded-pill bg-gruen-50 px-3 py-0.5' : 'rounded-pill bg-sand px-3 py-0.5 text-tinte-2'}>
            {t(`status.${h.status}`)}
          </span>
        </p>
        <h3 lang={titel.lang} className="text-30" data-morph="titel">
          {titel.text}
        </h3>
        {h.anlass?.de ? (
          <p className="text-18 text-tinte-2">
            <span className="font-bold text-tinte">{t('anlass')}: </span>
            <Text feld={h.anlass} sprache={sprache} />
          </p>
        ) : null}
        <p className="text-16 text-tinte-2">
          {t('beginn', { datum: tagText(h.beginn, sprache) })}
          {h.ziel ? ` · ${t('ziel', { datum: tagText(h.ziel, sprache) })}` : null}
        </p>
        <HatimZahlen h={h} kennung={`karte-${h.id}`} />
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href={{ pathname: '/hatim/[id]', params: { id: h.id } }}
            aria-label={t('standAnsehenLabel', { titel: titel.text })}
            className={KNOPF_RAHMEN}
          >
            <span>{t('standAnsehen')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
          {offen ? (
            <Link href="/mein-bereich/hatim" aria-label={t('uebernehmenLabel', { titel: titel.text })} className={KNOPF_PRIMAER}>
              <BookOpen aria-hidden className="size-5" />
              <span>{t('uebernehmen')}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
