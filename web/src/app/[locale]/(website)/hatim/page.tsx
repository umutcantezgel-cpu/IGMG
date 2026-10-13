import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { HatimKarte } from '@/components/website/hatim/HatimKarte';
import { Stern8 } from '@/components/website/Icons';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { ladeHatimListe } from '@/server/queries/hatim';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('hatim');
  return metadatenFuer({ pfad: '/hatim', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/**
 * Hatim (AUFTRAG 3.10, B-19): laufende und vollendete gemeinsame Hatims mit Ring, Zahlen und dem Weg zur Übernahme
 * (Mein Bereich, Konto nötig). Statisch; ohne Funktionsschalter „hatim“ (zur Bauzeit) gibt es die Seite nicht.
 */
export default async function HatimSeite() {
  if (!(await funktionAn('hatim'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const [t, tk, liste] = await Promise.all([getTranslations('hatim'), getTranslations('kopf'), ladeHatimListe()]);
  const laufend = liste.filter((h) => h.status === 'offen');
  const vollendet = liste.filter((h) => h.status === 'abgeschlossen');
  return (
    <Seitenrahmen bereich="islam" seite="hatim" sprachZiel="/hatim" pfad={[{ label: tk('islam') }, { label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-12 px-4 py-abschnitt-klein md:px-8">
        <section aria-labelledby="hatim-so" className="grid gap-6 rounded-lg bg-sand p-6 md:p-8 lg:grid-cols-3 lg:items-start">
          <div className="flex flex-col gap-2">
            <h2 id="hatim-so" className="text-24">
              {t('soGehts.titel')}
            </h2>
            <p className="text-16 text-tinte-2">{t('kontoHinweis')}</p>
          </div>
          <ol className="grid gap-4 md:grid-cols-3 lg:col-span-2">
            {(['schritt1', 'schritt2', 'schritt3'] as const).map((s, i) => (
              <li key={s} className="flex gap-3 rounded-md bg-weiss p-4">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-pill bg-gruen-700 font-bold text-weiss tabular-nums"
                >
                  {i + 1}
                </span>
                <span className="text-16">{t(`soGehts.${s}`)}</span>
              </li>
            ))}
          </ol>
        </section>

        {liste.length === 0 ? (
          <section className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss p-8 text-center">
            <Zustandsgrafik art="leer" />
            <h2 className="text-24">{t('leerTitel')}</h2>
            <p className="max-w-text text-tinte-2">{t('leerText')}</p>
          </section>
        ) : null}

        {laufend.length ? (
          <section aria-labelledby="hatim-laufend" className="flex flex-col gap-6">
            <h2 id="hatim-laufend" className="flex items-center gap-2.5 text-display-2">
              <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
              {t('laufendTitel')}
            </h2>
            <ul className="flex flex-col gap-6">
              {laufend.map((h, i) => (
                <li key={h.id}>
                  <HatimKarte h={h} sprache={sprache} zeichnen={i === 0} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {vollendet.length ? (
          <section aria-labelledby="hatim-vollendet" className="flex flex-col gap-6">
            <h2 id="hatim-vollendet" className="flex items-center gap-2.5 text-display-2">
              <Stern8 aria-hidden className="size-4 shrink-0 text-gruen-700" />
              {t('vollendetTitel')}
            </h2>
            <ul className="flex flex-col gap-6">
              {vollendet.map((h) => (
                <li key={h.id}>
                  <HatimKarte h={h} sprache={sprache} zeichnen={false} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="max-w-text text-16 text-tinte-2">{t('datenschutz')}</p>
      </div>
    </Seitenrahmen>
  );
}
