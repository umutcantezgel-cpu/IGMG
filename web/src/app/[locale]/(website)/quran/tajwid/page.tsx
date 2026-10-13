import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { RichText } from '@/components/website/RichText';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { schriftQuran } from '@/app/schriften-quran';
import { Link } from '@/i18n/link';
import type { Sprache } from '@/lib/i18n/inhalt';
import { versEndeHtml, versHtml } from '@/lib/quran/satz';
import { TAJWID_FAMILIEN } from '@/lib/quran/tajwid';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeTajwidBeispiele, ladeTajwidRegeln } from '@/server/queries/quran';
import '@/components/website/quran/quran.css';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quranSeite');
  return metadatenFuer({ pfad: '/quran/tajwid', titel: t('titelTajwid'), beschreibung: t('tajwidSeite.untertitel') });
}

/**
 * Tajwid-Regeln /quran/tajwid (H-Q02): alle Regeln nach den sechs Familien, Legende mit Farbe und Muster, Erklärung nur
 * mit Freigabe (sonst Platzhalter), je Regel das erste Vorkommen im Quran als Beispielvers – nur diese Regel markiert.
 * Namen und Erklärungen aus der Datenbank (Lehrkraft, ADR 0030), arabischer Text aus der Quelle.
 */
export default async function TajwidSeite() {
  const sprache = (await getLocale()) as Sprache;
  const t = await getTranslations('quranSeite');
  const ts = await getTranslations('quranSeite.tajwidSeite');
  const [regeln, beispiele] = await Promise.all([ladeTajwidRegeln(), ladeTajwidBeispiele()]);
  const beispielJe = new Map(beispiele.map((b) => [b.regel, b]));

  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel="/quran/tajwid" pfad={[{ label: t('breadcrumb'), ziel: '/quran' }, { label: ts('titel') }]}>
      <PageHeader kennung={ts('kennung')} titel={ts('titel')} untertitel={ts('untertitel')} />
      <div className={`leser ${schriftQuran.variable} mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt px-4 py-abschnitt-klein md:px-8`}>
        <section aria-labelledby="legende-titel" className="flex flex-col gap-4">
          <div className="flex max-w-einleitung flex-col gap-2">
            <h2 id="legende-titel" className="text-display-2">
              {ts('legendeTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-tinte-2">{ts('legendeText')}</p>
          </div>
          <ul className="grid raster-kacheln gap-3">
            {TAJWID_FAMILIEN.map((f) => (
              <li key={f}>
                <a href={`#familie-${f}`} className="flex min-h-16 items-center justify-between gap-3 rounded-lg border border-linie bg-weiss px-4 py-3 text-tinte no-underline shadow-s1 hover:border-gruen-700">
                  <span className={`tj tj-${f} muster-probe text-20`}>{t(`familien.${f}`)}</span>
                  <span className="text-16 text-tinte-2">{t(`muster.${f}`)}</span>
                </a>
              </li>
            ))}
          </ul>
          <p className="max-w-einleitung text-16 text-tinte-2">{ts('hinweis')}</p>
        </section>

        {TAJWID_FAMILIEN.map((f) => {
          const inFamilie = regeln.filter((r) => r.familie === f);
          if (!inFamilie.length) return null;
          return (
            <section key={f} id={`familie-${f}`} aria-labelledby={`familie-${f}-titel`} className="flex scroll-mt-8 flex-col gap-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-linie pb-3">
                <h2 id={`familie-${f}-titel`} className="text-30">
                  <span className={`tj tj-${f}`}>{t(`familien.${f}`)}</span>
                </h2>
                <span className="text-16 text-tinte-2">
                  {t(`muster.${f}`)} · {ts('regeln', { anzahl: inFamilie.length })}
                </span>
              </div>
              <ul className="grid gap-4 lg:grid-cols-2">
                {inFamilie.map((r) => {
                  const name = r.name[sprache] ?? r.name.de;
                  const kurz = r.kurz ? (r.kurz[sprache] ?? r.kurz.de) : null;
                  const erklaerung = r.erklaerung ? (r.erklaerung[sprache] ?? r.erklaerung.de) : null;
                  const b = beispielJe.get(r.schluessel);
                  return (
                    <li key={r.schluessel} id={`regel-${r.schluessel}`} className="flex scroll-mt-8 flex-col gap-4 rounded-lg border border-linie bg-weiss p-5 shadow-s1 md:p-6">
                      <h3 lang={r.name[sprache] ? undefined : 'de'} className="text-24">
                        {name}
                      </h3>
                      {kurz || erklaerung ? (
                        <div className="flex flex-col gap-2">
                          {kurz ? <p className="text-18 font-bold">{kurz}</p> : null}
                          <RichText doc={erklaerung} />
                        </div>
                      ) : (
                        <p className="text-18 text-tinte-2">{t('tajwidLeiste.platzhalter')}</p>
                      )}
                      {r.hoerbeispiel ? (
                        <figure className="flex flex-col gap-1">
                          <figcaption className="text-16 font-bold">{t('tajwidLeiste.hoerbeispiel')}</figcaption>
                          <audio controls preload="none" src={r.hoerbeispiel} className="w-full" />
                        </figure>
                      ) : null}
                      <figure className="mt-auto flex flex-col gap-2 rounded-md bg-papier p-4">
                        <figcaption className="text-16 font-bold text-tinte-2">
                          {ts('beispiel')}
                          {b ? ` · ${ts('beispielStelle', { sure: b.sure, vers: b.vers })}` : ''}
                        </figcaption>
                        {b ? (
                          <>
                            <p
                              lang="ar"
                              dir="rtl"
                              className="vers-ar beispiel-vers"
                              dangerouslySetInnerHTML={{ __html: `${versHtml(b.teile, b.tajwid)} ${versEndeHtml(b.vers)}` }}
                            />
                            <Link
                              href={{ pathname: '/quran/[sure]', params: { sure: String(b.sure) }, hash: `v${b.vers}` }}
                              prefetch={false}
                              className="inline-flex min-h-12 items-center self-start text-16 font-bold"
                            >
                              {ts('zumVers', { sure: b.sure, vers: b.vers })}
                            </Link>
                          </>
                        ) : (
                          <p className="text-16 text-tinte-2">{ts('keinBeispiel')}</p>
                        )}
                      </figure>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </Seitenrahmen>
  );
}
