import NextLink from 'next/link';
import { getTranslations } from 'next-intl/server';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { PasswortNeuFormular } from '@/components/verwaltung/anmeldung/PasswortFormulare';
import { Meldung } from '@/components/verwaltung/Meldung';

/** Verwaltung › Neues Passwort (C12): Ziel des Links aus der Mail (Better Auth leitet mit `token` oder `error` hierher). */
export default async function PasswortNeuSeite({ searchParams }: PageProps<'/[locale]/verwaltung/passwort-neu'>) {
  const [t, sp] = await Promise.all([getTranslations('verwaltung.passwortNeu'), searchParams]);
  const token = typeof sp.token === 'string' && !sp.error ? sp.token : null;
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('untertitel')}>
      {token ? (
        <PasswortNeuFormular token={token} />
      ) : (
        <div className="flex flex-col gap-4">
          <Meldung art="fehler">{t('ungueltig')}</Meldung>
          <NextLink href="/verwaltung/passwort-vergessen" className="inline-flex min-h-12 items-center font-bold">
            {t('neuAnfordern')}
          </NextLink>
        </div>
      )}
    </AnmeldeRahmen>
  );
}
