import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HatimZahlen, KNOPF_PRIMAER, tagText } from '@/components/website/hatim/HatimKarte';
import { HatimRing, StandZeichen } from '@/components/website/hatim/HatimRing';
import { morphStil } from '@/components/website/morph';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { textMitSprache } from '@/components/website/Text';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { text } from '@/lib/i18n/inhalt';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { ladeHatimIds, ladeHatimOeffentlich } from '@/server/queries/hatim';

export const ensureStatic = 'navigation';

/** Beim Bau alle veröffentlichten Hatims; neue entstehen bei der ersten Anfrage (ensureStatic verlangt ≥ 1 Wert). */
export async function generateStaticParams() {
  const ids = (await funktionAn('hatim')) ? await ladeHatimIds() : [];
  return (ids.length ? ids : ['_']).map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps<'/[locale]/hatim/[id]'>): Promise<Metadata> {
  const { locale, id } = await params;
  const h = await ladeHatimOeffentlich(id);
  if (!h) return {};
  const t = await getTranslations('hatim');
  return metadatenFuer({
    pfad: { pathname: '/hatim/[id]', params: { id } },
    titel: `${text(h.titel, locale as Locale)} – ${t('titel')}`,
    beschreibung: t('metaBeschreibung'),
  });
}

/** Hatim im Detail (B-19): großer Ring, Zahlen, die 30 Cüz mit Stand (ohne Namen) und Link in den Koran-Leser. */
export default function HatimDetailSeite({ params }: PageProps<'/[locale]/hatim/[id]'>) {
  return (
    <Suspense fallback={null}>
      <HatimDetail params={params} />
    </Suspense>
  );
}

const STAND_RAHMEN = {
  frei: 'border-linie bg-weiss',
  vergeben: 'border-gruen-700 bg-weiss',
  gelesen: 'border-gruen-700 bg-gruen-50',
} as const;

async function HatimDetail({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if (!(await funktionAn('hatim'))) notFound();
  const sprache = locale as Locale;
  const h = await ladeHatimOeffentlich(id);
  if (!h) notFound();
  const [t, tk] = await Promise.all([getTranslations('hatim'), getTranslations('kopf')]);
  const titel = textMitSprache(h.titel, sprache);
  const offen = h.status === 'offen';
  return (
    <Seitenrahmen
      bereich="islam"
      seite="hatim"
      sprachZiel={{ pathname: '/hatim/[id]', params: { id } }}
      pfad={[{ label: tk('islam') }, { label: t('titel'), ziel: '/hatim' }, { label: titel.text }]}
    >
      <PageHeader
        oben={
          <Link
            href="/hatim"
            className="inline-flex min-h-12 items-center gap-2 font-bold text-gruen-700 underline-offset-4 hover:underline"
          >
            <ArrowLeft aria-hidden className="size-5" />
            {t('zurueck')}
          </Link>
        }
        kennung={t(`status.${h.status}`)}
        titel={titel.text}
        titelLang={titel.lang}
        titelStil={morphStil(`h-${h.id}-titel`, 'text')}
        untertitel={h.anlass?.de ? `${t('anlass')}: ${text(h.anlass, sprache)}` : undefined}
      />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 py-abschnitt-klein md:px-8">
        <section className="grid items-center gap-8 rounded-lg border border-linie bg-weiss p-6 shadow-s1 md:grid-cols-2 md:p-10">
          <HatimRing
            kennung={`detail-${h.id}`}
            teile={h.teile}
            zeichnen
            stil={morphStil(`h-${h.id}-ring`)}
            className="mx-auto w-full max-w-80"
            label={t('ringLabel', { titel: titel.text, gelesen: h.gelesen, vergeben: h.vergeben - h.gelesen, frei: 30 - h.vergeben })}
            mitte={{ zahl: `${h.gelesen}/30`, text: t('ringMitte') }}
          />
          <div className="flex flex-col gap-4">
            <p className="text-18 text-tinte-2">
              {t('beginn', { datum: tagText(h.beginn, sprache) })}
              {h.ziel ? (
                <>
                  <br />
                  {t('ziel', { datum: tagText(h.ziel, sprache) })}
                </>
              ) : null}
            </p>
            <h2 className="text-20 font-bold">{t('legende')}</h2>
            <HatimZahlen h={h} kennung={`detail-${h.id}`} />
            {h.status === 'abgeschlossen' ? (
              <p className="rounded-md bg-gruen-50 px-4 py-3 font-bold text-gruen-800">{t('vollendetText')}</p>
            ) : null}
            {offen ? (
              <div className="flex flex-col items-start gap-2">
                <Link href="/mein-bereich/hatim" aria-label={t('uebernehmenLabel', { titel: titel.text })} className={KNOPF_PRIMAER}>
                  <BookOpen aria-hidden className="size-5" />
                  <span>{t('uebernehmen')}</span>
                </Link>
                <p className="text-16 text-tinte-2">{t('kontoHinweis')}</p>
              </div>
            ) : null}
          </div>
        </section>

        <section aria-labelledby="hatim-cuz" className="flex flex-col gap-4">
          <h2 id="hatim-cuz" className="text-display-2">
            {t('cuzTitel')}
          </h2>
          <p className="max-w-text text-tinte-2">{t('cuzEinleitung')}</p>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {h.teile.map((stand, i) => {
              const nr = i + 1;
              return (
                <li key={nr} data-stand={stand} className={cn('flex flex-col gap-1 rounded-md border-2 p-3', STAND_RAHMEN[stand])}>
                  <span className="font-bold">{t('cuz', { nr })}</span>
                  <span className="inline-flex items-center gap-2 text-16 text-tinte-2">
                    <StandZeichen stand={stand} kennung={`liste-${nr}`} />
                    {t(`stand.${stand}`)}
                  </span>
                  <Link
                    href={{ pathname: '/quran/cuz/[nr]', params: { nr } }}
                    aria-label={t('lesenLabel', { nr })}
                    className="-mx-1 inline-flex min-h-12 items-center gap-1 self-start px-1 font-bold text-gruen-700 underline-offset-4 hover:underline"
                  >
                    {t('lesen')}
                    <ChevronRight aria-hidden className="size-4" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <p className="max-w-text text-16 text-tinte-2">{t('datenschutz')}</p>
      </div>
    </Seitenrahmen>
  );
}
