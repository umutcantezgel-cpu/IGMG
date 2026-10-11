import { ArrowLeft, Calendar, Clock, Languages, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { MoscheeAnfrageFormular } from '@/components/website/formulare/MoscheeAnfrageFormular';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import { Trenner } from '@/components/website/Zustandsgrafik';
import { Link } from '@/i18n/link';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { sendeMoscheeAnfrage } from '@/server/actions/formulare/moschee-anfrage';

export const ensureStatic = 'navigation';

/**
 * Nutzen vor dem Formular: vier vorhandene Funktionstexte (`moscheeAnfrage.anforderung`) mit Symbol. Die Texte sind
 * dieselben, die das Formular abfragt; so wird nichts Neues behauptet. Weitere Nutzenpunkte brauchen eigene Texte.
 */
const NUTZEN = [
  { schluessel: 'prayer-times', Icon: Clock },
  { schluessel: 'events', Icon: Calendar },
  { schluessel: 'news', Icon: Newspaper },
  { schluessel: 'multilingual', Icon: Languages },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('moscheeAnfrage');
  return metadatenFuer({ pfad: '/webseite-fuer-moscheen', titel: t('seite.titel'), beschreibung: t('seite.untertitel') });
}

/** Webseite für Moscheen (design/MosqueRequest.dc.html, Blatt S22, B07): Nutzen in vier Punkten, dann der FormWizard (drei Schritte), Erfolgsbox. */
export default async function WebseiteFuerMoscheenSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tf] = await Promise.all([getTranslations('moscheeAnfrage'), getTranslations('formulare')]);
  return (
    <Seitenrahmen bereich="keiner" seite="mosque-request" sprachZiel="/webseite-fuer-moscheen" pfad={[{ label: t('seite.brotkrumen') }]}>
      <PageHeader titel={t('seite.titel')} untertitel={t('seite.untertitel')} />
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-4 py-abschnitt-klein md:px-8">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center gap-2 self-start font-bold text-gruen-700 underline underline-offset-4 hover:text-gruen-800"
        >
          <ArrowLeft aria-hidden className="size-5" />
          {t('nav.zurueck')}
        </Link>
        <ul className="grid gap-4 md:grid-cols-2">
          {NUTZEN.map(({ schluessel, Icon }) => (
            <li key={schluessel} className="flex items-center gap-4 rounded-lg border border-linie bg-weiss px-5 py-4">
              <Icon aria-hidden strokeWidth={2} className="size-6 shrink-0 text-gruen-700" />
              <span className="text-20 font-bold text-tinte">{t(`anforderung.${schluessel}`)}</span>
            </li>
          ))}
        </ul>
        <Trenner />
        <FormularInsel aktion={sendeMoscheeAnfrage} ohneSkript={tf('ohneSkript')}>
          <MoscheeAnfrageFormular sprache={sprache} />
        </FormularInsel>
      </div>
    </Seitenrahmen>
  );
}
