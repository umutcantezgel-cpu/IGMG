import { getTranslations } from 'next-intl/server';
import { Abschnitt } from './Abschnitt';
import { BewegungsVorschau } from './BewegungsVorschau';
import { DAUERN, KURVEN } from './tokens';

const ZEILE = 'flex flex-col gap-4 border-t border-linie py-5 md:flex-row md:items-center md:gap-8';
const BESCHRIFTUNG = 'flex min-w-0 flex-col gap-1 text-16 md:w-96';

/** Die Vorschau einer Dauer läuft mit der Standardkurve, die einer Kurve mit der Wechsel-Dauer (Kern K-007). */
const KURVE_STANDARD = 'ease-standard';
const DAUER_WECHSEL = 'duration-(--dauer-wechsel)';

/**
 * Bewegung (V14, Kern K-007): die vier Dauern und drei Kurven mit Wert und Zweck (Register-Nummern B-01 bis B-12).
 * Jede Zeile hat eine Vorschau, die sich nur auf Knopfdruck bewegt; reduzierte Bewegung setzt globals.css durch.
 */
export async function Bewegung() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="bewegung" titel={t('bewegung.titel')} einleitung={t('bewegung.einleitung')}>
      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('bewegung.dauerTitel')}</h3>
        <p className="max-w-text text-tinte-2">{t('bewegung.dauerEinleitung')}</p>
        <ul className="flex flex-col">
          {DAUERN.map((d) => (
            <li key={d.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{d.name}</code>
                <span className="font-mono text-tinte-2">{d.wert}</span>
                <span className="text-tinte-2">{t(`bewegung.dauer.${d.schluessel}`)}</span>
              </div>
              <BewegungsVorschau
                klasse={`${d.klasse} ${KURVE_STANDARD}`}
                name={d.name}
                abspielen={t('bewegung.vorschau.abspielen')}
                zuruecksetzen={t('bewegung.vorschau.zuruecksetzen')}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('bewegung.kurvenTitel')}</h3>
        <p className="max-w-text text-tinte-2">{t('bewegung.kurvenEinleitung')}</p>
        <ul className="flex flex-col">
          {KURVEN.map((k) => (
            <li key={k.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{k.name}</code>
                <span className="font-mono text-tinte-2">{k.wert}</span>
                <span className="text-tinte-2">{t(`bewegung.kurve.${k.schluessel}`)}</span>
              </div>
              <BewegungsVorschau
                klasse={`${DAUER_WECHSEL} ${k.klasse}`}
                name={k.name}
                abspielen={t('bewegung.vorschau.abspielen')}
                zuruecksetzen={t('bewegung.vorschau.zuruecksetzen')}
              />
            </li>
          ))}
        </ul>
      </div>

      <p className="max-w-text text-tinte-2">{t('bewegung.vorschau.reduziert')}</p>
    </Abschnitt>
  );
}
