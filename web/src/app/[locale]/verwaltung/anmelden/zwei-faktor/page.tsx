import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { ZweiFaktorFormular } from '@/components/verwaltung/anmeldung/ZweiFaktorFormular';

export default async function ZweiFaktorSeite() {
  const t = await getTranslations('verwaltung.zweiFaktor');
  return (
    <AnmeldeRahmen titel={t('titel')}>
      <ZweiFaktorFormular />
      <div className="mt-6">
        <Link href="/verwaltung/anmelden" className="inline-flex min-h-12 items-center font-bold">
          {t('zurueck')}
        </Link>
      </div>
    </AnmeldeRahmen>
  );
}
