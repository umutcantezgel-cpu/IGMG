import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { CourseCard } from '@/components/website/CourseCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { AllgemeineInformationen } from '@/components/website/korankurse/AllgemeineInformationen';
import { AnmeldeKarte } from '@/components/website/korankurse/AnmeldeKarte';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeKurse } from '@/server/queries/kurse';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('korankurse');
  return metadatenFuer({ pfad: '/bildung/korankurse', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Korankurse (design/QuranCourses.dc.html, Blatt S19): Kursangebote aus der Tabelle kurs, danach Allgemeine
 * Informationen und die Anmeldekarte. Vollständig statisch (K-01): keine Cookies, keine Header, kein Datum im Render.
 */
export default async function KorankurseSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('korankurse');
  const tp = await getTranslations('kopf');
  const [kurse, kontakt] = await Promise.all([ladeKurse(), ladeSeiteninhalt('kontakt')]);
  return (
    <Seitenrahmen
      bereich="bildung"
      seite="korankurse"
      sprachZiel="/bildung/korankurse"
      pfad={[{ label: tp('bildung') }, { label: tp('korankurse') }]}
    >
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 pt-8 pb-12 md:gap-16 md:px-8 md:pt-16 md:pb-24">
        <section aria-labelledby="kurse" className="flex flex-col gap-6">
          <h2 id="kurse" className="text-30 md:text-36">
            {t('kursangebote')}
          </h2>
          {kurse.length ? (
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,340px),1fr))] gap-6">
              {kurse.map((kurs) => (
                <li key={kurs.id}>
                  <CourseCard kurs={kurs} sprache={sprache} bild={kurs.bild} />
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('keineKurse')}</p>
          )}
        </section>
        <div className="flex flex-wrap items-stretch gap-6">
          <AllgemeineInformationen />
          <AnmeldeKarte kurse={kurse} kontakt={kontakt} sprache={sprache} />
        </div>
      </div>
    </Seitenrahmen>
  );
}
