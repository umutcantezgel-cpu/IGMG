import NextLink from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { TITEL_ARTEN, type TitelArt, type TitelTreffer } from '@/lib/suche/titelindex';
import { cn } from '@/lib/utils';

/** Tönung je Bereich an der Zahl-Pille (wie Trefferliste; Suren und Hadith-Bücher wie die Hadith-Gruppe) – nur Token-Klassen. */
const TOENUNG: Record<TitelArt, string> = {
  seite: 'bg-tag-gemeinde-bg text-tag-gemeinde',
  sure: 'bg-gruen-50 text-gruen-800',
  hadithBuch: 'bg-gruen-50 text-gruen-800',
  nachricht: 'bg-tag-neuigkeiten-bg text-tag-neuigkeiten',
  veranstaltung: 'bg-tag-veranstaltung-bg text-tag-veranstaltung',
  wissen: 'bg-tag-bildung-bg text-tag-bildung',
};

/** Lokalisierte Adresse eines Treffers (feste und freie Seiten bringen sie fertig mit). */
function adresse(z: TitelTreffer, sprache: Locale): string {
  if (z.href) return z.href;
  const s = String(z.slug ?? z.nr ?? '');
  switch (z.art) {
    case 'sure':
      return pfadFuer({ pathname: '/quran/[sure]', params: { sure: s } }, sprache);
    case 'hadithBuch':
      return pfadFuer({ pathname: '/hadith/bukhari/[buch]', params: { buch: s } }, sprache);
    case 'nachricht':
      return pfadFuer({ pathname: '/nachrichten/[slug]', params: { slug: s } }, sprache);
    case 'veranstaltung':
      return pfadFuer({ pathname: '/veranstaltungen/[slug]', params: { slug: s } }, sprache);
    default:
      return pfadFuer({ pathname: '/islamisches-wissen/[thema]', params: { thema: s } }, sprache);
  }
}

/**
 * Treffer der Titel-Suche ohne Datenbank (`sucheFuerSeite`, Modus „titel“), gruppiert wie die Trefferliste der
 * Volltextsuche: Überschrift mit Zahl, Karten im Kartenraster, die ganze Karte klickbar. Ohne Ausschnitt (der Index
 * kennt nur Titel); Suren zeigen ihre Nummer und den arabischen Namen aus den Quelldaten, Hadith-Bücher Sammlung und Nummer.
 */
export async function TitelTrefferliste({ treffer }: { treffer: TitelTreffer[] }) {
  const sprache = (await getLocale()) as Locale;
  const [t, tq, th] = await Promise.all([getTranslations('suche'), getTranslations('quranSeite'), getTranslations('hadith')]);
  const gruppen = TITEL_ARTEN.map((art) => ({ art, eintraege: treffer.filter((z) => z.art === art) })).filter((g) => g.eintraege.length > 0);
  const kennung = (z: TitelTreffer) =>
    z.art === 'sure'
      ? tq('sureNr', { nr: z.nr ?? 0 })
      : z.art === 'hadithBuch'
        ? `${th('bukhari.titel')} · ${th('buch.kennung', { nr: z.nr ?? 0 })}`
        : null;
  return (
    <div className="flex flex-col gap-10">
      {gruppen.map(({ art, eintraege }) => (
        <section key={art} aria-labelledby={`suche-gruppe-${art}`} className="flex flex-col gap-5">
          <h3 id={`suche-gruppe-${art}`} className="flex flex-wrap items-center gap-3 text-24 leading-tight font-bold">
            <span>{t(`gruppen.${art}`)}</span>
            <span aria-hidden="true" className={cn('inline-flex rounded-pill px-3 text-16 leading-normal font-bold', TOENUNG[art])}>
              {eintraege.length}
            </span>
            <span className="sr-only">{t('gruppe', { anzahl: eintraege.length })}</span>
          </h3>
          <ol className="grid raster-karten gap-6">
            {eintraege.map((z) => {
              const unter = kennung(z);
              return (
                <li key={`${z.art}-${z.href ?? z.slug ?? z.nr}`}>
                  <article className="relative flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 text-18 leading-relaxed shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2">
                    <h4 className="text-20 leading-snug font-bold text-balance">
                      <NextLink
                        href={adresse(z, sprache)}
                        lang={z.titelSprache}
                        className="text-tinte no-underline after:absolute after:inset-0 after:rounded-lg hover:text-gruen-800 hover:underline"
                      >
                        {z.titel}
                      </NextLink>
                    </h4>
                    {unter || z.nebentitel ? (
                      <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-16 text-tinte-2">
                        {unter ? <span>{unter}</span> : null}
                        {z.nebentitel ? (
                          <span lang="ar" dir="rtl" className="text-20">
                            {z.nebentitel}
                          </span>
                        ) : null}
                      </p>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
