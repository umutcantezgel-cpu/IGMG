import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { ANZEIGESTUFEN, LAUFWEITE, SCHRIFTEN, SCHRIFTGROESSEN, ZEILENHOEHEN } from './tokens';

const ZEILE = 'flex flex-col gap-3 border-t border-linie py-5 md:flex-row md:items-baseline md:gap-8';
const BESCHRIFTUNG = 'flex shrink-0 flex-col gap-1 text-16 md:w-72';

/** Beispieltext je Zeilenhöhe: die Schrift der Rolle, nicht die Größe des Tokens. */
const ZEILENMUSTER: Record<string, string> = {
  ueberschrift: 'font-display text-24 font-semibold',
  einleitung: 'font-text text-20',
};

/** Typografie (V14): Schriftskala text-16 bis text-48 mit Zeilenhöhe, Schriften und Laufweite, je mit Muster. */
export async function Typografie() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="typografie" titel={t('typografie.titel')} einleitung={t('typografie.einleitung')}>
      <ul className="flex flex-col">
        {SCHRIFTGROESSEN.map((s) => (
          <li key={s.name} className={ZEILE}>
            <div className={BESCHRIFTUNG}>
              <code className="font-mono font-bold">{s.name}</code>
              <span className="text-tinte-2">{t(`typografie.rollen.${s.schluessel}`)}</span>
              <span className="text-tinte-2">{t('typografie.zeile', { wert: s.wert, zeile: s.zeile })}</span>
            </div>
            <p className={cn('min-w-0 break-words', s.muster)}>{t(`typografie.muster.${s.schluessel}`)}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('typografie.anzeigeTitel')}</h3>
        <p className="max-w-text text-tinte-2">{t('typografie.anzeigeEinleitung')}</p>
        <ul className="flex flex-col">
          {ANZEIGESTUFEN.map((s) => (
            <li key={s.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{s.name}</code>
                <span className="text-tinte-2">{t(`typografie.anzeigeRollen.${s.schluessel}`)}</span>
                <span className="text-tinte-2">{t('typografie.fliessend', { min: s.min, max: s.max, zeile: s.zeile })}</span>
                <span className="font-mono break-all text-tinte-2">{s.wert}</span>
              </div>
              <p className={cn('min-w-0 break-words', s.muster)}>{t(`typografie.anzeigeMuster.${s.schluessel}`)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('typografie.zeilenTitel')}</h3>
        <p className="max-w-text text-tinte-2">{t('typografie.zeilenEinleitung')}</p>
        <ul className="flex flex-col">
          {ZEILENHOEHEN.map((z) => (
            <li key={z.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{z.name}</code>
                <span className="text-tinte-2">{t(`typografie.zeilenRollen.${z.schluessel}`)}</span>
                <span className="font-mono break-all text-tinte-2">{z.wert}</span>
              </div>
              <p className={cn('min-w-0 break-words', ZEILENMUSTER[z.schluessel], z.klasse)}>{t('typografie.zeilenMuster')}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('typografie.schriften')}</h3>
        <p className="max-w-text text-tinte-2">{t('typografie.schriftenEinleitung')}</p>
        <ul className="flex flex-col">
          {SCHRIFTEN.map((s) => (
            <li key={s.name} className={ZEILE}>
              <div className={BESCHRIFTUNG}>
                <code className="font-mono font-bold">{s.name}</code>
                <span className="text-tinte-2">{t(`typografie.schriftVerwendung.${s.schluessel}`)}</span>
                <span className="font-mono break-all text-tinte-2">{s.wert}</span>
              </div>
              <p lang={s.schluessel === 'arabisch' ? 'ar' : undefined} className={cn('min-w-0 text-30 break-words', s.klasse)}>
                {t(`typografie.schriftMuster.${s.schluessel}`)}
              </p>
            </li>
          ))}
          <li className={ZEILE}>
            <div className={BESCHRIFTUNG}>
              <code className="font-mono font-bold">{LAUFWEITE.name}</code>
              <span className="text-tinte-2">{t('typografie.laufweite')}</span>
              <span className="font-mono break-all text-tinte-2">{LAUFWEITE.wert}</span>
            </div>
            <p className={cn('min-w-0 font-display text-30 font-semibold break-words', LAUFWEITE.klasse)}>
              {t('typografie.laufweiteMuster')}
            </p>
          </li>
        </ul>
      </div>
    </Abschnitt>
  );
}
