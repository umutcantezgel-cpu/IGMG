import type { Metadata } from 'next';
import { Mail } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { KontaktFormular } from '@/components/website/formulare/KontaktFormular';
import { Anfahrt } from '@/components/website/kontakt/Anfahrt';
import { AngeboteBesuch } from '@/components/website/kontakt/AngeboteBesuch';
import { KontaktKarten } from '@/components/website/kontakt/KontaktKarten';
import { KARTE, UEBERSCHRIFT_GROSS } from '@/components/website/kontakt/stil';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { metadatenFuer } from '@/lib/seo/metadaten';
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
      <PageHeader kennung={tp('moschee')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-8 px-4 pt-8 pb-12 md:px-8 md:pt-12 md:pb-24">
        <KontaktKarten kontakt={kontakt} />
        <Anfahrt kontakt={kontakt} />
        <AngeboteBesuch kontakt={kontakt} />
        <section id="nachricht" aria-labelledby="kontakt-nachricht" className={cn(KARTE, 'scroll-mt-24 gap-4 md:p-8')}>
          <h2 id="kontakt-nachricht" className={UEBERSCHRIFT_GROSS}>
            <Mail aria-hidden className="size-7 shrink-0 text-gruen-700" />
            {tk('titel')}
          </h2>
          <p className="max-w-(--container-text) text-pretty">{tk('einleitung')}</p>
          <FormularInsel aktion={sendeKontakt} ohneSkript={tf('ohneSkript')}>
            <KontaktFormular sprache={sprache} />
          </FormularInsel>
        </section>
      </div>
    </Seitenrahmen>
  );
}
