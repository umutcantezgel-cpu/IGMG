import { getTranslations } from 'next-intl/server';
import { Meldung } from '@/components/verwaltung/Meldung';
import { Abschnitt } from './Abschnitt';

/** Meldungen (V14): Information, Erfolg und Fehler mit Symbol und Text. */
export async function Meldungen() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="meldungen" titel={t('meldungen.titel')} einleitung={t('meldungen.einleitung')}>
      <div className="flex flex-col gap-4">
        <Meldung art="info">{t('meldungen.info')}</Meldung>
        <Meldung art="erfolg">{t('meldungen.erfolg')}</Meldung>
        <Meldung art="fehler">{t('meldungen.fehler')}</Meldung>
      </div>
    </Abschnitt>
  );
}
