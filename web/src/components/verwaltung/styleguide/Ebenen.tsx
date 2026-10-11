import { getTranslations } from 'next-intl/server';
import { Abschnitt } from './Abschnitt';
import { EBENEN } from './tokens';

const ZEILE = 'flex flex-col gap-3 border-t border-linie py-5 md:flex-row md:items-baseline md:gap-8';
const BESCHRIFTUNG = 'flex shrink-0 flex-col gap-1 text-16 md:w-72';

/** Ebenen (V14, Kern K-005): fünf feste Stufen der Überlagerung, aufsteigend; je Token, Klasse, Wert und Verwendung. */
export async function Ebenen() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="ebenen" titel={t('ebenen.titel')} einleitung={t('ebenen.einleitung')}>
      <ul className="flex flex-col">
        {EBENEN.map((e) => (
          <li key={e.name} className={ZEILE}>
            <div className={BESCHRIFTUNG}>
              <code className="font-mono font-bold">{e.name}</code>
              <span className="font-mono text-tinte-2">{e.klasse}</span>
              <span className="font-mono text-tinte-2">{e.wert}</span>
            </div>
            <p className="min-w-0 text-18">{t(`ebenen.ebene.${e.schluessel}`)}</p>
          </li>
        ))}
      </ul>
    </Abschnitt>
  );
}
