import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { KontaktFormular } from '@/components/website/formulare/KontaktFormular';
import { Anfahrt } from '@/components/website/kontakt/Anfahrt';
import { AngeboteBesuch } from '@/components/website/kontakt/AngeboteBesuch';
import { KarteAdresse, KarteKontaktdaten, KarteNotfall, KarteOeffnungszeiten } from '@/components/website/kontakt/KontaktKarten';
import { KARTE } from '@/components/website/kontakt/stil';
import { PageHeader } from '@/components/website/PageHeader';
import { JsonLd } from '@/components/website/JsonLd';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { moschee } from '@/lib/seo/jsonld';
import { adresse, metadatenFuer } from '@/lib/seo/metadaten';
import { cn } from '@/lib/utils';
import { sendeKontakt } from '@/server/actions/formulare/kontakt';
import { ladeSeiteninhalt } from '@/server/queries/seiteninhalte';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('kontakt');
  return metadatenFuer({ pfad: '/kontakt', titel: t('titel'), beschreibung: t('untertitel') });
}

/** Kontakt & Anfahrt (design/Contact.dc.html, Blatt S11): Kontaktdaten, Öffnungszeiten, Anfahrt, Karte erst nach Klick. */
export default async function KontaktSeite() {
  const sprache = (await getLocale()) as Locale;
  const [t, tp, tk, tf, kontakt] = await Promise.all([
    getTranslations('kontakt'),
    getTranslations('kopf'),
    getTranslations('kontaktformular'),
    getTranslations('formulare'),
    ladeSeiteninhalt('kontakt'),
  ]);
  return (
    <Seitenrahmen bereich="moschee" seite="kontakt" sprachZiel="/kontakt" pfad={[{ label: tp('kontakt') }]}>
      <JsonLd daten={moschee({ url: adresse('/', 'de'), kontakt })} />
      <PageHeader kennung={tp('moschee')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 py-abschnitt-klein md:px-8">
        {/* Erster Block (H-B10): Telefonreihenfolge im DOM – Kontaktdaten, Formular, dann die Begleitspalte; ab 1024 px nebeneinander */}
        <div className="grid gap-6 lg:grid-cols-3 lg:raster-begleitspalte">
          {/* Ab lg fest rechts oben neben dem Formular, nicht nur durch Auto-Platzierung */}
          <div className="flex flex-col lg:col-start-3 lg:row-start-1">
            <KarteKontaktdaten kontakt={kontakt} />
          </div>
          <section
            id="nachricht"
            aria-labelledby="kontakt-nachricht"
            className={cn(KARTE, 'scroll-mt-24 gap-4 md:p-8 lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start')}
          >
            <h2 id="kontakt-nachricht" className="text-display-2">
              {tk('titel')}
            </h2>
            <p className="max-w-einleitung text-20 leading-einleitung text-pretty text-tinte-2">{tk('einleitung')}</p>
            <FormularInsel aktion={sendeKontakt} ohneSkript={tf('ohneSkript')}>
              <KontaktFormular sprache={sprache} />
            </FormularInsel>
            {/* Öffentliche Meldung (E-034): eigene Seite statt Dialog im Kopf */}
            <p className="flex flex-wrap items-center gap-x-2 border-t border-linie pt-4">
              {tk('meldungHinweis')}
              <Link href="/meldung" className="inline-flex min-h-12 items-center font-bold text-gruen-700 underline underline-offset-4">
                {tk('meldungLink')}
              </Link>
            </p>
          </section>
          <div className="flex flex-col gap-6 lg:col-start-3 lg:row-start-2 lg:self-start">
            <KarteOeffnungszeiten kontakt={kontakt} />
            <KarteNotfall kontakt={kontakt} />
            <KarteAdresse kontakt={kontakt} />
          </div>
        </div>
        <Anfahrt kontakt={kontakt} />
        <AngeboteBesuch kontakt={kontakt} />
      </div>
    </Seitenrahmen>
  );
}
