import { Check, LockKeyhole } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { FormularInsel } from '@/components/formular/FormularInsel';
import { NewsletterFormular } from '@/components/website/newsletter/NewsletterFormular';
import { NewsletterMeldung } from '@/components/website/newsletter/NewsletterMeldung';
import { PageHeader } from '@/components/website/PageHeader';
import { Seitenrahmen } from '@/components/website/Seitenrahmen';
import type { Locale } from '@/i18n/routing';
import { funktionAn } from '@/lib/funktionen';
import { metadatenFuer } from '@/lib/seo/metadaten';
import { meldeNewsletterAn } from '@/server/actions/formulare/newsletter';

export const ensureStatic = 'navigation';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('newsletter');
  return metadatenFuer({ pfad: '/newsletter', titel: t('titel'), beschreibung: t('metaBeschreibung') });
}

/**
 * Newsletter (AUFTRAG 3.10, K-B): Anmeldung mit Double-Opt-in als öffentliches Formular (E-028: Felder vom Server,
 * FormularInsel, ALTCHA, Honigtopf, Ratenbegrenzung). Die Meldungen nach Bestätigen/Abmelden zeigt eine kleine Insel
 * aus dem Anker. Statisch; ohne Funktionsschalter „newsletter“ (zur Bauzeit) gibt es die Seite nicht.
 */
export default async function NewsletterSeite() {
  if (!(await funktionAn('newsletter'))) notFound();
  const sprache = (await getLocale()) as Locale;
  const [t, tf] = await Promise.all([getTranslations('newsletter'), getTranslations('formulare')]);
  const liste = (k: 'info' | 'daten') => (['eins', 'zwei', 'drei'] as const).map((s) => t(`${k}.${s}`));
  return (
    <Seitenrahmen bereich="moschee" seite="newsletter" sprachZiel="/newsletter" pfad={[{ label: t('titel') }]}>
      <PageHeader kennung={t('kennung')} titel={t('titel')} untertitel={t('untertitel')} />
      <div className="mx-auto flex max-w-(--container-inhalt) flex-col gap-6 px-4 py-abschnitt-klein md:px-8">
        <NewsletterMeldung
          texte={{ bestaetigt: t('meldung.bestaetigt'), abgemeldet: t('meldung.abgemeldet'), ungueltig: t('meldung.ungueltig') }}
        />
        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <section
            id="anmelden"
            aria-labelledby="newsletter-formular"
            className="flex scroll-mt-24 flex-col gap-4 rounded-lg border border-linie bg-weiss p-6 md:p-8 lg:col-span-2"
          >
            <h2 id="newsletter-formular" className="text-display-2">
              {t('formularTitel')}
            </h2>
            <p className="max-w-einleitung text-18 text-tinte-2">{t('formularEinleitung')}</p>
            <FormularInsel aktion={meldeNewsletterAn} ohneSkript={tf('ohneSkript')}>
              <NewsletterFormular sprache={sprache} />
            </FormularInsel>
          </section>
          <aside className="flex flex-col gap-6">
            <section aria-labelledby="newsletter-info" className="flex flex-col gap-3 rounded-lg bg-sand p-6">
              <h2 id="newsletter-info" className="font-text text-20 font-bold tracking-normal">
                {t('info.titel')}
              </h2>
              <ul className="flex flex-col gap-2">
                {liste('info').map((p) => (
                  <li key={p} className="flex gap-2 text-16">
                    <Check aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
            <section aria-labelledby="newsletter-daten" className="flex flex-col gap-3 rounded-lg border border-linie bg-weiss p-6">
              <h2 id="newsletter-daten" className="font-text text-20 font-bold tracking-normal">
                {t('daten.titel')}
              </h2>
              <ul className="flex flex-col gap-2">
                {liste('daten').map((p) => (
                  <li key={p} className="flex gap-2 text-16">
                    <LockKeyhole aria-hidden className="mt-0.5 size-5 shrink-0 text-gruen-700" />
                    {p}
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </Seitenrahmen>
  );
}
