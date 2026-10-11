import { getTranslations } from 'next-intl/server';
import { cn } from '@/lib/utils';
import { Abschnitt } from './Abschnitt';
import { Tokenkarte } from './Tokenkarte';
import { FARBEN, FARBGRUPPEN } from './tokens';

/** Farben (V14): je Token eine Fläche mit Name, Wert und Verwendung; Kontrast nur, wenn der Token-Kommentar ihn nennt. */
export async function Farben() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <Abschnitt id="farben" titel={t('farben.titel')} einleitung={t('farben.einleitung')}>
      {FARBGRUPPEN.map((gruppe) => (
        <div key={gruppe} className="flex flex-col gap-4">
          <h3 className="text-24">{t(`farben.gruppen.${gruppe}`)}</h3>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FARBEN.filter((f) => f.gruppe === gruppe).map((f) => (
              <li key={f.name} className="min-w-0">
                <Tokenkarte
                  name={f.name}
                  wert={f.wert}
                  verwendung={t(`farben.verwendungen.${f.schluessel}`)}
                  kontrast={f.kontrast}
                  vorschau={<span className={cn('block h-16 border-b border-linie', f.klasse)} />}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Abschnitt>
  );
}
