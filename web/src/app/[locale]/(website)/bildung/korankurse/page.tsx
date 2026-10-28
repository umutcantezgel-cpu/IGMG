import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { CourseCard } from '@/components/website/CourseCard';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { AllgemeineInformationen } from '@/components/website/korankurse/AllgemeineInformationen';
import { AnmeldeKarte } from '@/components/website/korankurse/AnmeldeKarte';
import { KursWeg } from '@/components/website/korankurse/KursWeg';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeKurse } from '@/server/queries/kurse';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.korankurse');
  return metadatenFuer({ pfad: '/bildung/korankurse', titel: t('titel'), beschreibung: t('beschreibung') });
}

/**
 * Korankurse (design/QuranCourses.dc.html, Blatt S19): Kursangebote aus der Tabelle kurs – darüber der Kurs-Lernweg
 * (AUFTRAG 4, B-24: zeichnet sich einmal, Sprünge zu den Karten) –, danach Allgemeine Informationen und die Anmeldekarte.
 * Vollständig statisch (K-01): keine Cookies, keine Header, kein Datum im Render.
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
      <PageHeader kennung={tp('bildung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-10 px-4 py-abschnitt-klein md:gap-16 md:px-8">
        <section aria-labelledby="kurse" className="flex flex-col gap-8">
          <h2 id="kurse" className="text-display-2">
            {t('kursangebote')}
          </h2>
          <KursWeg kurse={kurse} sprache={sprache} />
          {kurse.length ? (
            <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {kurse.map((kurs) => (
                <li key={kurs.id} id={`kurs-${kurs.slug}`} className="scroll-mt-6 md:max-xl:odd:last:col-span-2">
                  <CourseCard kurs={kurs} sprache={sprache} bild={kurs.bild} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
              <Zustandsgrafik art="leer" />
              <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{t('keineKurse')}</p>
              <Link
                href="/kontakt"
                className="inline-flex min-h-12 druck items-center rounded-md bg-gruen-700 px-6 font-bold text-weiss no-underline transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 hover:text-weiss"
              >
                {t('kontaktKnopf')}
              </Link>
            </div>
          )}
        </section>
        <AllgemeineInformationen />
        <AnmeldeKarte kurse={kurse} kontakt={kontakt} sprache={sprache} />
      </div>
    </Seitenrahmen>
  );
}
