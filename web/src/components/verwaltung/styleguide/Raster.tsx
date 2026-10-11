import { getTranslations } from 'next-intl/server';
import { Abschnitt } from './Abschnitt';
import { BREITEN, HALTEPUNKTE, remZuPx } from './tokens';

const ZEILE = 'flex flex-col gap-3 border-t border-linie py-5 md:flex-row md:items-baseline md:gap-8';
const BESCHRIFTUNG = 'flex shrink-0 flex-col gap-1 text-16 md:w-72';

/** Raster und Breiten (V14): Breiten der Inhalte und Haltepunkte der Layouts, je mit Token, Wert und Zweck. */
export async function Raster() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="raster" titel={t('raster.titel')} einleitung={t('raster.einleitung')}>
      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('raster.breitenTitel')}</h3>
        <ul className="flex flex-col">
          {BREITEN.map((b) => (
            <li key={b.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{b.name}</code>
                <span className="text-tinte-2">{t(`raster.breiten.${b.schluessel}`)}</span>
                <span className="font-mono text-tinte-2">{b.klasse}</span>
              </div>
              <p className="font-mono break-all">{b.wert}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('raster.haltepunktTitel')}</h3>
        <ul className="flex flex-col">
          {HALTEPUNKTE.map((h) => (
            <li key={h.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{h.name}</code>
                <span className="text-tinte-2">{t(`raster.haltepunkte.${h.schluessel}`)}</span>
                <span className="font-mono text-tinte-2">{h.klasse}</span>
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-mono">{h.wert}</p>
                <p className="font-mono text-tinte-2">{t('raster.pixel', { wert: remZuPx(h.wert) })}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Abschnitt>
  );
}
