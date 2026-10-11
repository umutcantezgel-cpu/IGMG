import { getTranslations } from 'next-intl/server';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { PasswortVergessenFormular } from '@/components/verwaltung/anmeldung/PasswortFormulare';

/** Verwaltung › Passwort vergessen (C12, M-092). */
export default async function PasswortVergessenSeite() {
  const t = await getTranslations('verwaltung.passwortVergessen');
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('untertitel')}>
      <PasswortVergessenFormular />
    </AnmeldeRahmen>
  );
}
