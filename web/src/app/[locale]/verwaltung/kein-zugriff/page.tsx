import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';

export default async function KeinZugriffSeite() {
  const t = await getTranslations('verwaltung.keinZugriff');
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('text')}>
      <Link href="/verwaltung">{t('zurueck')}</Link>
    </AnmeldeRahmen>
  );
}
