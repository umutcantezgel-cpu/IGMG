import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { SCHATTEN } from './tokens';
import { Tokenkarte } from './Tokenkarte';

/** Schatten (V14): drei Ebenen, jeweils mit Verwendung; die Vorschau nutzt die Klasse des Tokens. */
export async function Schatten() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="schatten" titel={t('schatten.titel')} einleitung={t('schatten.einleitung')}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SCHATTEN.map((s) => (
          <li key={s.name} className="min-w-0">
            <Tokenkarte
              name={s.name}
              wert={s.wert}
              verwendung={t(`schatten.verwendungen.${s.schluessel}`)}
              vorschau={
                <div className="flex h-32 items-center justify-center bg-papier p-6">
                  <span className={cn('block h-full w-3/4 rounded-lg bg-weiss', s.klasse)} />
                </div>
              }
            />
          </li>
        ))}
      </ul>
    </Abschnitt>
  );
}
