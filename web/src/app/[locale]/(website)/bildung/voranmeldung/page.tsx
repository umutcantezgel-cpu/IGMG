import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { VoranmeldungFormular } from '@/components/website/formulare/VoranmeldungFormular';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { sendeVoranmeldung } from '@/server/actions/formulare/voranmeldung';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('seo.voranmeldung');
  return metadatenFuer({ pfad: '/bildung/voranmeldung', titel: t('titel'), beschreibung: t('beschreibung') });
}

/** Schüler-Voranmeldung (design/StudentRegistration.dc.html, Blatt S20, B05): FormWizard in vier Schritten, Warteliste. */
export default async function VoranmeldungSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tp, tf] = await Promise.all([getTranslations('voranmeldung'), getTranslations('kopf'), getTranslations('formulare')]);
  return (
    <Seitenrahmen
      bereich="bildung"
      seite="voranmeldung"
      sprachZiel="/bildung/voranmeldung"
      pfad={[{ label: tp('bildung') }, { label: tp('voranmeldung') }]}
    >
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto max-w-(--container-inhalt) px-4 py-abschnitt md:px-8">
        <FormularInsel aktion={sendeVoranmeldung} ohneSkript={tf('ohneSkript')}>
          <VoranmeldungFormular sprache={sprache} />
        </FormularInsel>
      </div>
    </Seitenrahmen>
  );
}
