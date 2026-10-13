import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { BestaetigenFormular } from '@/components/konto/EinstiegFormulare';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { Meldung } from '@/components/verwaltung/Meldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('konto.meta');
  return { title: t('bestaetigen') };
}

/**
 * Adresse bestätigen (Link aus der Mail „Adresse bestätigen“). Der Aufruf allein ändert nichts – erst der Klick auf
 * „Jetzt bestätigen“ (POST) schaltet das Konto frei und vergibt die Kontoart `gemeinde`. So lösen Link-Vorschauen
 * und Virenscanner der Mailprogramme nichts aus.
 */
export default async function BestaetigenSeite({ searchParams }: PageProps<'/[locale]/konto/bestaetigen'>) {
  const sprache = (await getLocale()) as Locale;
  const s = await searchParams;
  const token = typeof s.token === 'string' && /^[A-Za-z0-9_-]{20,100}$/.test(s.token) ? s.token : null;
  const t = await getTranslations('konto');
  return (
    <KontoEinstieg
      seite="bestaetigen"
      sprachZiel={token ? { pathname: '/konto/bestaetigen', query: { token } } : '/konto/bestaetigen'}
      titel={t('bestaetigen.titel')}
      untertitel={token ? t('bestaetigen.text') : undefined}
    >
      {token ? (
        <BestaetigenFormular token={token} />
      ) : (
        <div className="flex flex-col gap-5">
          <Meldung art="fehler">{t('bestaetigen.ungueltig')}</Meldung>
          <a href={pfadFuer('/registrieren', sprache)} className="inline-flex min-h-12 items-center self-start font-bold">
            {t('bestaetigen.zurRegistrierung')}
          </a>
        </div>
      )}
    </KontoEinstieg>
  );
}
