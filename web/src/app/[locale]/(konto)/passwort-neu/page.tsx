import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { PasswortNeuFormular } from '@/components/konto/EinstiegFormulare';
import { KontoEinstieg } from '@/components/konto/KontoEinstieg';
import { Meldung } from '@/components/verwaltung/Meldung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/** Je Anfrage gerendert, wartet auf die Sitzung (siehe Layout). */
export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('konto.meta');
  return { title: t('passwortNeu') };
}

/**
 * Neues Passwort (Better Auth `reset-password`): Der Link aus der Mail führt über `/api/auth/reset-password/<token>`
 * hierher (`?token=…`, bei ungültigem Link `?error=INVALID_TOKEN`). Danach enden alle Sitzungen.
 */
export default async function PasswortNeuSeite({ searchParams }: PageProps<'/[locale]/passwort-neu'>) {
  const sprache = (await getLocale()) as Locale;
  const s = await searchParams;
  const token = typeof s.token === 'string' && /^[A-Za-z0-9_-]{10,100}$/.test(s.token) && !s.error ? s.token : null;
  const t = await getTranslations('konto');
  return (
    <KontoEinstieg
      seite="passwort-neu"
      sprachZiel="/passwort-neu"
      titel={t('passwortNeu.titel')}
      untertitel={token ? t('passwortNeu.text') : undefined}
      ohneEinordnung
    >
      {token ? (
        <PasswortNeuFormular token={token} />
      ) : (
        <div className="flex flex-col gap-5">
          <Meldung art="fehler">{t('passwortNeu.ungueltig')}</Meldung>
          <a href={pfadFuer('/passwort-vergessen', sprache)} className="inline-flex min-h-12 items-center self-start font-bold">
            {t('passwortNeu.neuAnfordern')}
          </a>
        </div>
      )}
    </KontoEinstieg>
  );
}
