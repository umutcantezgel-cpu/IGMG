import { getTranslations } from 'next-intl/server';
import { ABSCHNITTE } from './tokens';

/** Sprungnavigation der Styleguide-Seite: Pillen mit mindestens 48 px Höhe, verlinkt auf die Abschnitte. */
export async function Sprungnavigation() {
  const t = await getTranslations('verwaltung.styleguide');
  return (
    <nav aria-label={t('navName')}>
      <ul className="flex flex-wrap gap-2">
        {ABSCHNITTE.map((a) => (
          <li key={a}>
            <a
              href={`#${a}`}
              className="inline-flex min-h-12 items-center rounded-pill border border-rand bg-weiss px-4 font-bold text-tinte no-underline hover:border-gruen-700 hover:bg-gruen-50 hover:text-tinte"
            >
              {t(`nav.${a}`)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
