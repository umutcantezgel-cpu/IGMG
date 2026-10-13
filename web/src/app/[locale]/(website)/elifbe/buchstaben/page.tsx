import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Buchstabenraster } from '@/components/website/elifbe/Buchstabenraster';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { BUCHSTABEN, FORM_ARTEN, formen } from '@/lib/elifbe/alphabet';
import { metadatenFuer } from '@/lib/seo/metadaten';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('elifbe.liste');
  return metadatenFuer({ pfad: '/elifbe/buchstaben', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Alle 29 Buchstaben als Raster und die vier Formen jedes Buchstabens als Tabelle (Ziel der Station „Formen“). */
export default async function BuchstabenSeite() {
  const sprache = (await getLocale()) as Locale;
  const t = await getTranslations('elifbe');
  return (
    <Seitenrahmen
      bereich="bildung"
      seite="elifbe"
      sprachZiel="/elifbe/buchstaben"
      pfad={[{ label: t('pfadLernen'), ziel: '/lernen' }, { label: t('titel'), ziel: '/elifbe' }, { label: t('pfadBuchstaben') }]}
    >
      <PageHeader kennung={t('kennung')} titel={t('liste.titel')} untertitel={t('liste.untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-abschnitt-klein px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="alle-buchstaben" className="flex flex-col gap-6">
          <h2 id="alle-buchstaben" className="sr-only">
            {t('raster.titel')}
          </h2>
          <Buchstabenraster
            sprache={sprache}
            gross
            label={(b) => t('raster.karte', { name: b.elifbe, nr: b.nr })}
            className="md:grid-cols-6 lg:grid-cols-8"
          />
        </section>
        <section aria-labelledby="formen-titel" id="formen" className="flex scroll-mt-24 flex-col gap-6">
          <div className="flex max-w-einleitung flex-col gap-3">
            <h2 id="formen-titel" className="text-display-2">
              {t('liste.formenTitel')}
            </h2>
            <p className="text-18 leading-einleitung text-pretty text-tinte-2">{t('liste.formenEinleitung')}</p>
          </div>
          <div className="relative overflow-x-auto rounded-lg border border-linie bg-weiss shadow-s1">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{t('liste.tabelle')}</caption>
              <thead className="bg-sand text-16">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">
                    {t('liste.spalteName')}
                  </th>
                  {FORM_ARTEN.map((f) => (
                    <th key={f} scope="col" className="px-4 py-3 text-center font-bold">
                      {t(`formen.${f}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BUCHSTABEN.map((b) => {
                  const form = formen(b);
                  return (
                    <tr key={b.slug} className="border-t border-linie">
                      <th scope="row" className="px-4 py-2 align-middle">
                        <Link
                          href={{ pathname: '/elifbe/buchstaben/[buchstabe]', params: { buchstabe: b.slug } }}
                          className="inline-flex min-h-12 flex-col justify-center font-bold"
                        >
                          <span lang={sprache === 'tr' ? undefined : 'tr'}>{b.elifbe}</span>
                          {!b.verbindetRechts ? (
                            <span className="text-16 font-normal text-tinte-2">{t('liste.verbindetGar')}</span>
                          ) : !b.verbindetLinks ? (
                            <span className="text-16 font-normal text-tinte-2">{t('liste.verbindetNicht')}</span>
                          ) : null}
                        </Link>
                      </th>
                      {FORM_ARTEN.map((f) => (
                        <td key={f} lang="ar" dir="rtl" className="px-4 py-0 text-center text-36 leading-loose text-gruen-950">
                          {form[f]}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Seitenrahmen>
  );
}
