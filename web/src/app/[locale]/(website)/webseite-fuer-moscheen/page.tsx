import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { MoscheeAnfrageFormular } from '@/components/website/formulare/MoscheeAnfrageFormular';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { sendeMoscheeAnfrage } from '@/server/actions/formulare/moschee-anfrage';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('moscheeAnfrage');
  return metadatenFuer({ pfad: '/webseite-fuer-moscheen', titel: t('seite.titel'), beschreibung: t('seite.untertitel') });
}

/** Webseite für Moscheen (design/MosqueRequest.dc.html, Blatt S22, B07): FormWizard in drei Schritten, Erfolgsbox. */
export default async function WebseiteFuerMoscheenSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf] = await Promise.all([getTranslations('moscheeAnfrage'), getTranslations('formulare')]);
  return (
    <Seitenrahmen bereich="keiner" seite="mosque-request" sprachZiel="/webseite-fuer-moscheen" pfad={[{ label: t('seite.brotkrumen') }]}>
      <PageHeader kennung={t('seite.titel')} titel={t('seite.titel')} untertitel={t('seite.untertitel')} />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 pt-4 pb-12 md:px-8 md:pt-8 md:pb-24">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {t('nav.zurueck')}
        </Link>
        <FormularInsel aktion={sendeMoscheeAnfrage} ohneSkript={tf('ohneSkript')}>
          <MoscheeAnfrageFormular sprache={sprache} />
        </FormularInsel>
      </div>
    </Seitenrahmen>
  );
}
