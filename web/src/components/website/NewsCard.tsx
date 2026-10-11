import { ArrowRight, Calendar, Clock, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { datumLang } from '@/lib/i18n/format';
import type { Sprache } from '@/lib/i18n/inhalt';
import type { BildDaten } from '@/lib/medien/bild';
import { cn } from '@/lib/utils';
import type { NachrichtDaten } from '@/server/queries/nachrichten';
import { Bildplatzhalter } from './Bildplatzhalter';
import { MedienBild, SIZES_AUFMACHER, SIZES_RASTER } from './MedienBild';
import { Text, textMitSprache } from './Text';

const TOENUNG: Record<NachrichtDaten['kategorie'] | 'wichtig', string> = {
  wichtig: 'bg-tag-wichtig-bg text-tag-wichtig',
  ankuendigung: 'bg-tag-wichtig-bg text-tag-wichtig',
  neuigkeiten: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  gemeinde: 'bg-tag-gemeinde-bg text-tag-gemeinde',
  veranstaltung: 'bg-tag-veranstaltung-bg text-tag-veranstaltung',
  bildung: 'bg-tag-bildung-bg text-tag-bildung',
  religioes: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  soziales: 'bg-tag-jugend-bg text-tag-jugend',
};

/**
 * NewsCard (design/NewsCard.dc.html): „gross“ (Startseite, Aufmacher), „kompakt“ (Startseite, Seitenspalte),
 * „standard“ (Nachrichtenliste, ähnliche Artikel). Ganze Karte klickbar über ::after.
 */
export async function NewsCard({
  n,
  sprache,
  variante = 'standard',
  bild,
}: {
  n: NachrichtDaten;
  sprache: Sprache;
  variante?: 'gross' | 'kompakt' | 'standard';
  /** Titelbild aus der Mediathek; null oder fehlend = Bildplatzhalter wie bisher */
  bild?: BildDaten | null;
}) {
  const t = await getTranslations('karten');
  const titel = textMitSprache(n.titel, sprache);
  const ziel = { pathname: '/nachrichten/[slug]' as const, params: { slug: n.slug } };
  const datum = datumLang(new Date(n.veroeffentlichtAm), sprache);
  const lesezeit = n.lesezeit ? t('lesezeit', { minuten: n.lesezeit }) : null;
  const kategorie = (
    <span
      className={cn('inline-flex rounded-pill px-3 py-0.5 text-16 leading-normal font-bold', TOENUNG[n.wichtig ? 'wichtig' : n.kategorie])}
    >
      {t(n.wichtig ? 'nkat_wichtig' : `nkat_${n.kategorie}`)}
    </span>
  );

  if (variante === 'kompakt') {
    return (
      <article
        data-morph-karte={`n-${n.slug}`}
        className="relative flex h-full items-center gap-4 rounded-lg border border-linie bg-weiss p-4 text-18 leading-relaxed shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2"
      >
        {bild ? (
          <MedienBild bild={bild} sprache={sprache} morph="bild" sizes="88px" className="size-22 shrink-0 rounded-md border border-linie" />
        ) : (
          <Bildplatzhalter
            morph="bild"
            beschriftung={t('fotoBeitrag')}
            kurz={t('foto')}
            className="size-22 shrink-0 rounded-md border border-linie px-1"
          />
        )}
        <div className="flex min-w-0 flex-col gap-1.5">
          <span
            className={cn(
              'inline-flex self-start rounded-pill px-2.5 text-16 leading-relaxed font-bold',
              TOENUNG[n.wichtig ? 'wichtig' : n.kategorie],
            )}
          >
            {t(n.wichtig ? 'nkat_wichtig' : `nkat_${n.kategorie}`)}
          </span>
          <h3 lang={titel.lang} data-morph="titel" className="font-text text-20 leading-snug font-bold tracking-normal">
            <Link
              href={ziel}
              aria-label={`${t('artikelLesen')}: ${titel.text}`}
              className="text-tinte no-underline after:absolute after:inset-0 after:rounded-lg after:content-[''] hover:text-gruen-800 hover:underline"
            >
              {titel.text}
            </Link>
          </h3>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-16 text-tinte-2">
            <span>{datum}</span>
            {lesezeit ? (
              <span className="inline-flex items-center gap-1">
                <Clock aria-hidden className="size-4" />
                {lesezeit}
              </span>
            ) : null}
          </div>
        </div>
      </article>
    );
  }

  if (variante === 'gross') {
    return (
      <article
        data-morph-karte={`n-${n.slug}`}
        className="relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 leading-relaxed shadow-s1"
      >
        {bild ? (
          <MedienBild bild={bild} sprache={sprache} morph="bild" sizes={SIZES_AUFMACHER} className="h-75 border-b border-linie" />
        ) : (
          <Bildplatzhalter morph="bild" beschriftung={t('fotoBeitrag')} className="h-75 border-b border-linie" />
        )}
        <div className="flex flex-1 flex-col gap-4 px-7 pt-6 pb-7">
          <div className="flex flex-wrap gap-2">
            {kategorie}
            <span className="inline-flex rounded-pill bg-gruen-700 px-3 py-0.5 text-16 leading-normal font-bold text-weiss">
              {t('aktuell')}
            </span>
          </div>
          <h3 lang={titel.lang} data-morph="titel" className="text-30 leading-tight text-balance">
            {titel.text}
          </h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-16 text-tinte-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar aria-hidden className="size-4" />
              {datum}
            </span>
            {lesezeit ? (
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="size-4" />
                {lesezeit}
              </span>
            ) : null}
          </div>
          <Text feld={n.kurztext} sprache={sprache} als="p" className="max-w-[62ch] text-pretty text-tinte-2" />
          <Link
            href={ziel}
            className="mt-auto inline-flex min-h-12 items-center gap-2 self-start rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition-colors hover:bg-gruen-800 hover:text-weiss"
          >
            <span>{t('artikelLesen')}</span>
            <ArrowRight aria-hidden className="size-5" />
          </Link>
        </div>
      </article>
    );
  }

  return (
    <article
      data-morph-karte={`n-${n.slug}`}
      className="relative flex h-full flex-col overflow-hidden rounded-lg border border-linie bg-weiss text-18 leading-relaxed shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2"
    >
      {bild ? (
        <MedienBild bild={bild} sprache={sprache} morph="bild" sizes={SIZES_RASTER} className="h-[180px] border-b border-linie" />
      ) : (
        <Bildplatzhalter morph="bild" beschriftung={t('fotoBeitrag')} className="h-[180px] border-b border-linie" />
      )}
      <div className="flex flex-1 flex-col gap-3 px-6 pt-5 pb-6">
        <div className="flex flex-wrap gap-2">
          {kategorie}
          {n.empfohlen ? (
            <span className="inline-flex items-center gap-1.5 rounded-pill bg-gruen-700 px-3 py-0.5 text-16 leading-normal font-bold text-weiss">
              <Star aria-hidden className="size-4" />
              {t('empfohlen')}
            </span>
          ) : null}
        </div>
        <h3 lang={titel.lang} data-morph="titel" className="text-24 leading-tight text-balance">
          {titel.text}
        </h3>
        <Text feld={n.kurztext} sprache={sprache} als="p" className="text-pretty text-tinte-2" />
        <ul className="mt-auto flex flex-col gap-1 border-t border-linie pt-3 text-16 text-tinte-2">
          <li className="flex items-center gap-2">
            <Calendar aria-hidden className="size-4" />
            <span>{datum}</span>
          </li>
          {lesezeit ? (
            <li className="flex items-center gap-2">
              <Clock aria-hidden className="size-4" />
              <span>{lesezeit}</span>
            </li>
          ) : null}
        </ul>
        {/* Linktext mit unsichtbarem Titel statt aria-label: „Weiterlesen“ allein ist nichtssagend (Lighthouse link-text) */}
        <Link
          href={ziel}
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 after:absolute after:inset-0 after:rounded-lg after:content-['']"
        >
          {/* Name als ein Text („Weiterlesen: Titel“, K-11): ein getrennter sr-only-Teil ergäbe in Chromium „Weiterlesen : …“.
              Der Text bricht in seiner 1-px-Box um (sonst ragt sein unsichtbarer Layoutkasten über den Rand). */}
          <span aria-hidden>{t('weiterlesen')}</span>
          <span className="sr-only wrap-anywhere whitespace-normal">
            {t('weiterlesen')}: <span lang={titel.lang}>{titel.text}</span>
          </span>
          <ArrowRight aria-hidden className="size-5" />
        </Link>
      </div>
    </article>
  );
}
