import NextLink from 'next/link';
import { OBERFLAECHEN, type Oberflaeche, richtung } from '@/lib/lernapp/kurse';
import { rohPruefTexte } from '@/lib/lernapp/verwaltung/pruefung-texte';
import { cn } from '@/lib/utils';

/**
 * Sprachwahl der Prüfoberfläche (ADR 0041 Nr. 10, PLAN §7.2): de/tr/ar über den Suchparameter `ui`. Jede Sprache heißt in
 * ihrer eigenen Sprache und trägt `lang` und `dir`; das Gerüst bleibt links-nach-rechts.
 */
export function SprachWahl({ ui, pfad }: { ui: Oberflaeche; pfad: string }) {
  const t = rohPruefTexte(ui);
  return (
    <nav aria-label={t.sprachwahl} lang={ui} dir={richtung(ui)}>
      <ul className="flex flex-wrap gap-2" dir="ltr">
        {OBERFLAECHEN.map((s) => (
          <li key={s}>
            <NextLink
              href={`${pfad}?ui=${s}`}
              lang={s}
              dir={richtung(s)}
              hrefLang={s}
              aria-current={s === ui ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-12 items-center rounded-pill border px-4 font-bold no-underline',
                s === ui ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss' : 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte',
              )}
            >
              {rohPruefTexte(s).sprachname[s]}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
