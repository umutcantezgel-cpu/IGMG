import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { AnmeldeRahmen } from '@/components/verwaltung/anmeldung/AnmeldeRahmen';
import { ZweiFaktorEinrichten } from '@/components/verwaltung/anmeldung/ZweiFaktorEinrichten';
import { ladeAngemeldet } from '@/lib/rechte/pruefe';

/** Pflicht-Einrichtung des zweiten Faktors (K-06): erreichbar mit Sitzung, aber ohne erfüllten zweiten Faktor. */
export default async function ZweiFaktorEinrichtenSeite() {
  const a = await ladeAngemeldet();
  if (!a) redirect('/verwaltung/anmelden');
  // Ohne Verwaltungsrolle nützt die Einrichtung hier nichts (verlangeSitzung)
  if (a.rollen.length === 0) redirect('/verwaltung/kein-zugang');
  if (a.zweiFaktorErfuellt) redirect('/verwaltung');
  const t = await getTranslations('verwaltung.zweiFaktorEinrichten');
  return (
    <AnmeldeRahmen titel={t('titel')} untertitel={t('einleitung')}>
      <ZweiFaktorEinrichten />
    </AnmeldeRahmen>
  );
}
