import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { hadithAnker, stelle } from '@/lib/hadith/anzeige';
import type { HadithTreffer } from '@/server/queries/suche';

/**
 * Gruppe „Hadith“ der Suche (Muster Trefferliste): Bezug als Link zur Stelle im Buch (`#h-<nummer>`), darunter der
 * Ausschnitt aus dem unveränderten arabischen Text mit markierten Trefferwörtern. Die ganze Karte ist klickbar.
 */
export async function HadithTrefferliste({ treffer }: { treffer: HadithTreffer[] }) {
  const [t, ts, tb] = await Promise.all([getTranslations('hadith'), getTranslations('suche'), getTranslations('hadith.buch')]);
  const name = t('bukhari.titel');
  return (
    <section aria-labelledby="suche-gruppe-hadith" className="flex flex-col gap-5">
      <h3 id="suche-gruppe-hadith" className="flex flex-wrap items-center gap-3 text-24 leading-tight font-bold">
        <span>{t('suche.gruppe')}</span>
        <span aria-hidden="true" className="inline-flex rounded-pill bg-gruen-50 px-3 text-16 leading-normal font-bold text-gruen-800">
          {treffer.length}
        </span>
        <span className="sr-only">{ts('gruppe', { anzahl: treffer.length })}</span>
      </h3>
      <ol className="grid raster-karten gap-6">
        {treffer.map((z) => {
          const s = stelle(z.buchNr, z.imBuchNr);
          return (
            <li key={z.nummer}>
              <article className="relative flex h-full flex-col gap-3 rounded-lg border border-linie bg-weiss p-6 shadow-s1 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:shadow-s2">
                <h4 className="text-20 leading-snug font-bold">
                  <Link
                    href={{ pathname: '/hadith/bukhari/[buch]', params: { buch: String(z.buchNr) }, hash: hadithAnker(z.nummer) }}
                    className="text-tinte no-underline after:absolute after:inset-0 after:rounded-lg hover:text-gruen-800 hover:underline"
                  >
                    {name} {z.nummer}
                  </Link>
                </h4>
                <p className="text-16 text-tinte-2">
                  {s.hadith === null ? tb('stelleBuch', { buch: s.buch }) : tb('stelle', { buch: s.buch, hadith: s.hadith })}
                </p>
                <p lang="ar" dir="rtl" className="text-20 leading-loose text-tinte-2">
                  {z.ausschnitt.vorn ? '… ' : null}
                  {z.ausschnitt.teile.map((teil, i) =>
                    teil.treffer ? (
                      <mark key={i} className="rounded-sm bg-warnung-toenung px-0.5 text-tinte">
                        {teil.text}
                      </mark>
                    ) : (
                      teil.text
                    ),
                  )}
                  {z.ausschnitt.hinten ? ' …' : null}
                </p>
              </article>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
