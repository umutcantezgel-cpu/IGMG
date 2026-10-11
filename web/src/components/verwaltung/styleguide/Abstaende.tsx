import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { Tokenkarte } from './Tokenkarte';
import { ABSCHNITTSABSTAENDE, ABSTAENDE, ABSTAND_BASIS, remZuPx } from './tokens';

/** Abstände (V14): Vielfache der Basis; die Balken nutzen die Klassen w-N derselben Schritte. */
export async function Abstaende() {
  const t = await getTranslations('verwaltung.styleguide');
  const basisPx = remZuPx(ABSTAND_BASIS.wert);
  return (
    <Abschnitt id="abstaende" titel={t('abstaende.titel')} einleitung={t('abstaende.einleitung')}>
      <p className="font-mono text-16 text-tinte-2">{t('abstaende.basis', { name: ABSTAND_BASIS.name, wert: ABSTAND_BASIS.wert })}</p>
      <ul className="flex flex-col gap-3">
        {ABSTAENDE.map((a) => (
          <li key={a.schritt} className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-16">
            <span className="w-28 font-bold">{t('abstaende.schritt', { schritt: a.schritt })}</span>
            <span className="w-16 font-mono text-tinte-2">{t('abstaende.pixel', { wert: basisPx * a.schritt })}</span>
            <span aria-hidden="true" className={cn('block h-4 rounded-sm bg-gruen-700', a.klasse)} />
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4">
        <h3 className="text-24">{t('abstaende.abschnittTitel')}</h3>
        <p className="max-w-text text-tinte-2">{t('abstaende.abschnittEinleitung')}</p>
        <ul className="grid gap-4 md:grid-cols-2">
          {ABSCHNITTSABSTAENDE.map((a) => (
            <li key={a.name} className="min-w-0">
              <Tokenkarte
                name={a.name}
                wert={a.wert}
                verwendung={t(`abstaende.abschnittRollen.${a.schluessel}`)}
                vorschau={
                  <div className={cn('bg-papier px-4', a.klasse)}>
                    <span className="block h-6 bg-gruen-100" />
                  </div>
                }
              />
            </li>
          ))}
        </ul>
      </div>
    </Abschnitt>
  );
}
