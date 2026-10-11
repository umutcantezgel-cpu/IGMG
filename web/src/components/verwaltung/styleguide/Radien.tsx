import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { Tokenkarte } from './Tokenkarte';
import { RADIEN } from './tokens';

/** Radien (V14): Ecken je Bauteil; die vorschau nutzt die Klasse des Tokens. */
export async function Radien() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="radien" titel={t('radien.titel')} einleitung={t('radien.einleitung')}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RADIEN.map((r) => (
          <li key={r.name} className="min-w-0">
            <Tokenkarte
              name={r.name}
              wert={r.wert}
              verwendung={t(`radien.verwendungen.${r.schluessel}`)}
              vorschau={
                <div className="flex h-28 items-center justify-center bg-papier p-4">
                  <span className={cn('block h-full w-full border-2 border-rand bg-weiss', r.klasse)} />
                </div>
              }
            />
          </li>
        ))}
      </ul>
    </Abschnitt>
  );
}
