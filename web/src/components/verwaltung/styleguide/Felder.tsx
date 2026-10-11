import { getTranslations } from 'next-intl/server';
import { FeldAuswahl, FeldBereich, FeldEinwilligung, FeldHaken, FeldOptionen, FeldText } from '@/components/formular/Felder';
import { Abschnitt } from './Abschnitt';

/**
 * Felder (V14): die Bausteine aus `components/formular/Felder.tsx` mit Beschriftung, Hinweis, Pflichtkennzeichnung und
 * Fehler am Feld. Die Beispiele stehen außerhalb eines Formulars und lösen nichts aus.
 */
export async function Felder() {
  const t = await getTranslations('verwaltung.styleguide');
  const pflicht = t('felder.pflicht');
  const optionen = [
    { wert: 'erste', label: t('felder.optionErste') },
    { wert: 'zweite', label: t('felder.optionZweite') },
  ];
  return (
    <Abschnitt id="felder" titel={t('felder.titel')} einleitung={t('felder.einleitung')}>
      <div className="grid gap-6 md:grid-cols-2">
        <FeldText name="beispiel-name" label={t('felder.name')} hinweis={t('felder.nameHinweis')} pflicht={pflicht} />
        <FeldText name="beispiel-email" typ="email" label={t('felder.email')} fehler={t('felder.emailFehler')} pflicht={pflicht} />
        <FeldBereich name="beispiel-nachricht" label={t('felder.nachricht')} hinweis={t('felder.nachrichtHinweis')} zeilen={3} />
        <FeldAuswahl name="beispiel-auswahl" label={t('felder.auswahl')} leer={t('felder.auswahlLeer')} optionen={optionen} />
        <FeldOptionen
          name="beispiel-option"
          label={t('felder.optionen')}
          typ="radio"
          optionen={[
            { wert: 'erste', label: t('felder.optionErste'), beschreibung: t('felder.optionErsteText') },
            { wert: 'zweite', label: t('felder.optionZweite'), beschreibung: t('felder.optionZweiteText') },
          ]}
        />
        <FeldHaken name="beispiel-haken" label={t('felder.haken')} beschreibung={t('felder.hakenText')} />
        <div className="md:col-span-2">
          <FeldEinwilligung name="beispiel-einwilligung" text={t('felder.einwilligung')} />
        </div>
      </div>
    </Abschnitt>
  );
}
