import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/website/PageHeader';
import { CuzRing } from '@/components/website/quran/CuzRing';
import { SurenRaster } from '@/components/website/quran/SurenRaster';
import { SurenSuche } from '@/components/website/quran/SurenSuche';
import { Weiterlesen } from '@/components/website/quran/Weiterlesen';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { TAJWID_FAMILIEN } from '@/lib/quran/tajwid';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeCuzBereiche, ladeQuranStand } from '@/server/queries/quran';
import '@/components/website/quran/quran.css';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('quranSeite');
  return metadatenFuer({ pfad: '/quran', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Übersicht /quran (O-Q01, Erzählansicht): Cüz-Ring mit Liste der 30 Cüz, „Weiterlesen“ aus dem Gerät, Tajwid-Hinweis
 * und das Raster aller 114 Suren mit Suche im Browser. Kachel → Surenseite mit Morph des Medaillons.
 */
export default async function QuranEinstieg() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('quranSeite');
  const tu = await getTranslations('quranSeite.uebersicht');
  const [{ suren }, bereiche] = await Promise.all([ladeQuranStand(), ladeCuzBereiche()]);
  const cuzZiel = (nr: number) => ({ pathname: '/quran/cuz/[nr]', params: { nr: String(nr) } }) as const;

  return (
    <Seitenrahmen bereich="islam" seite="quran" sprachZiel="/quran" pfad={[{ label: t('breadcrumb') }]}>
      <PageHeader kennung={t('eyebrow')} titel={t('titel')} untertitel={t('untertitel')} />
      {suren.length === 0 ? (
        <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt-klein md:px-8">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
            <Zustandsgrafik art="leer" />
            <p className="text-20 font-bold">{t('keineSuren')}</p>
            <p className="max-w-text text-18 text-tinte-2">{t('keineSurenText')}</p>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt px-4 py-abschnitt-klein md:px-8">
          <div className="grid items-start gap-8 lg:grid-cols-12">
            <section aria-labelledby="cuz-titel" className="flex flex-col gap-6 lg:col-span-7">
              <div className="flex max-w-einleitung flex-col gap-2">
                <h2 id="cuz-titel" className="text-display-2">
                  {tu('cuzTitel')}
                </h2>
                <p className="text-18 leading-einleitung text-pretty text-tinte-2">{tu('cuzText')}</p>
              </div>
              <div className="flex flex-col items-center gap-8 md:flex-row md:items-start">
                <div className="aspect-square w-full max-w-80 shrink-0">
                  <CuzRing mitte={tu('cuzMitte')} eintraege={bereiche.map((b) => ({ nr: b.nr, href: pfadFuer(cuzZiel(b.nr), sprache) }))} />
                </div>
                <nav aria-label={tu('cuzListe')} className="w-full">
                  <ol className="grid grid-cols-6 gap-2">
                    {bereiche.map((b) => (
                      <li key={b.nr}>
                        <Link
                          href={cuzZiel(b.nr)}
                          prefetch={false}
                          aria-label={tu('cuzLabel', { nr: b.nr, sure: b.von.sure, vers: b.von.vers })}
                          className="flex aspect-square min-h-12 items-center justify-center rounded-md border border-linie bg-weiss font-bold text-tinte tabular-nums no-underline transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98"
                        >
                          {b.nr}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </nav>
              </div>
            </section>
            <div className="flex flex-col gap-4 lg:col-span-5">
              <Weiterlesen
                namen={suren.map((s) => s.umschrift)}
                pfadSure={pfadFuer({ pathname: '/quran/[sure]', params: { sure: '__s__' } }, sprache)}
                pfadCuz={pfadFuer({ pathname: '/quran/cuz/[nr]', params: { nr: '__n__' } }, sprache)}
                texte={{
                  titel: tu('weiterlesenTitel'),
                  stelle: tu.raw('weiterlesenStelle') as string,
                  stelleCuz: tu.raw('weiterlesenCuz') as string,
                  link: tu('weiterlesenLink'),
                  lesezeichenTitel: tu('lesezeichenTitel'),
                  lesezeichenLink: tu('lesezeichenLink'),
                  leer: tu('weiterlesenLeer'),
                  geraet: tu('geraetHinweis'),
                }}
              />
              <section aria-labelledby="tajwid-titel" className="flex flex-col gap-3 rounded-lg border border-linie bg-sand p-6">
                <h2 id="tajwid-titel" className="text-24">
                  {tu('tajwidTitel')}
                </h2>
                <p className="text-18 text-tinte-2">{tu('tajwidText')}</p>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-16">
                  {TAJWID_FAMILIEN.map((f) => (
                    <li key={f}>
                      <span className={`tj tj-${f} muster-probe`}>{t(`familien.${f}`)}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/quran/tajwid" className="inline-flex min-h-12 items-center gap-2 self-start font-bold">
                  {tu('tajwidLink')}
                  <ArrowRight aria-hidden className="size-5" />
                </Link>
              </section>
            </div>
          </div>

          <section aria-labelledby="suren-titel" className="flex flex-col gap-6">
            <div className="flex max-w-einleitung flex-col gap-2">
              <h2 id="suren-titel" className="text-display-2">
                {tu('surenTitel')}
              </h2>
              <p className="text-18 leading-einleitung text-pretty text-tinte-2">{tu('surenText')}</p>
            </div>
            <SurenSuche
              texte={{
                label: tu('sucheLabel'),
                platzhalter: tu('suchePlatzhalter'),
                keine: tu('trefferKeine'),
                treffer: tu.raw('treffer') as string,
              }}
            >
              <SurenRaster suren={suren} />
            </SurenSuche>
          </section>
        </div>
      )}
    </Seitenrahmen>
  );
}
