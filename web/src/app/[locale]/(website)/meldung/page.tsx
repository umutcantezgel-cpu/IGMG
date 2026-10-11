import { MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { MeldungFormular } from '@/components/website/formulare/MeldungFormular';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { sendeMeldung } from '@/server/actions/formulare/meldung';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meldung');
  return metadatenFuer({ pfad: '/meldung', titel: t('titel'), beschreibung: t('untertitel') });
}

/**
 * Meldung von Gemeindemitgliedern (design/TicketDialog.dc.html, Blätter C14 und V10): als eigene Seite statt Dialog im
 * Kopf (E-034), damit der Kopf auf jeder Seite schlank bleibt (K-12). Statisch, ohne Cookies (K-01).
 */
export default async function MeldungSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf] = await Promise.all([getTranslations('meldung'), getTranslations('formulare')]);
  return (
    <Seitenrahmen bereich="keiner" seite="meldung" sprachZiel="/meldung" pfad={[{ label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex w-full max-w-(--container-text) flex-col gap-4 px-4 pt-8 pb-abschnitt md:px-8 md:pt-12">
        <section
          id="meldung"
          aria-labelledby="meldung-titel"
          className="flex flex-col gap-8 rounded-lg border border-linie bg-weiss p-6 md:p-8"
        >
          <h2 id="meldung-titel" className="flex items-center gap-2.5 text-display-2 text-gruen-800">
            <MessageSquare aria-hidden="true" className="size-7 shrink-0 text-gruen-700" />
            {t('titelFormular')}
          </h2>
          <FormularInsel aktion={sendeMeldung} ohneSkript={tf('ohneSkript')}>
            <MeldungFormular sprache={sprache} />
          </FormularInsel>
        </section>
      </div>
    </Seitenrahmen>
  );
}
