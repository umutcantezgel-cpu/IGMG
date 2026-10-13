import type { CSSProperties } from 'react';
import { getTranslations } from 'next-intl/server';
import { Achtstern } from '@/components/website/Icons';
import { Text, textMitSprache } from '@/components/website/Text';
import type { Sprache } from '@/lib/i18n/inhalt';
import { cn } from '@/lib/utils';
import type { KursDaten } from '@/server/queries/kurse';

/** Waagerecht ab md, solange die Stationen nebeneinander lesbar bleiben; mehr Kurse stehen auch dort untereinander. */
const SPALTEN: Record<number, string> = { 2: 'md:grid md:grid-cols-2', 3: 'md:grid md:grid-cols-3', 4: 'md:grid md:grid-cols-4' };

/** Umriss des Achtsterns (Quadrat 6–18 und dasselbe Quadrat um 45° gedreht) für geschlossene Kurse. */
const ACHTSTERN = 'M12 3.5 14.5 6H18v3.5l2.5 2.5-2.5 2.5V18h-3.5L12 20.5 9.5 18H6v-3.5L3.5 12 6 9.5V6h3.5Z';

/**
 * Kurs-Lernweg der Korankurse (AUFTRAG 4, Register B-24): die Kurse in ihrer Reihenfolge als Achtstern-Stationen an
 * einer Linie, die sich beim ersten Bild einmal von Station zu Station zeichnet; jede Station tritt hervor, wenn die
 * Linie sie erreicht (nur CSS, `lernweg-abschnitt` senkrecht bzw. `lernweg-abschnitt-quer` waagerecht, `lernweg-station`).
 * Reduzierte Bewegung und ohne Animation: Endzustand. Je Station Titel als Sprung zur Karte (`#kurs-<slug>`),
 * Zielgruppe und Anmeldeweg als Text – ein geschlossener Kurs trägt den Stern als Umriss, nie nur über die Farbe.
 * Ab zwei Kursen; Server-Komponente ohne JavaScript.
 */
export async function KursWeg({ kurse, sprache }: { kurse: KursDaten[]; sprache: Sprache }) {
  if (kurse.length < 2) return null;
  const [t, tk] = await Promise.all([getTranslations('korankurse'), getTranslations('kurskarte')]);
  const quer = SPALTEN[kurse.length];
  const status = { register: tk('statusVoranmeldung'), join: tk('statusKeineAnmeldung'), closed: tk('statusGeschlossen') };
  return (
    <ol aria-label={t('wegLabel')} className={cn('flex flex-col', quer)} style={{ '--n': kurse.length - 1 } as CSSProperties}>
      {kurse.map((kurs, i) => {
        const titel = textMitSprache(kurs.titel, sprache);
        const geschlossen = kurs.anmeldeweg === 'closed';
        return (
          <li
            key={kurs.id}
            className={cn('relative flex gap-4', quer && 'md:flex-col md:items-center md:gap-2 md:px-4 md:text-center')}
            style={{ '--i': i } as CSSProperties}
          >
            {/* Linie zur nächsten Station: senkrecht von Mitte zu Mitte der Sterne, ab md waagerecht von Spalte zu Spalte */}
            {i < kurse.length - 1 ? (
              <>
                <span
                  aria-hidden
                  className={cn('lernweg-abschnitt absolute top-6 left-6 h-full w-0.5 -translate-x-1/2 bg-gruen-700', quer && 'md:hidden')}
                />
                {quer ? (
                  <span
                    aria-hidden
                    className="lernweg-abschnitt-quer absolute top-6 left-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gruen-700 md:block"
                  />
                ) : null}
              </>
            ) : null}
            <span aria-hidden className="lernweg-station relative flex size-12 shrink-0 items-center justify-center">
              {geschlossen ? (
                <svg viewBox="3 3 18 18" className="absolute inset-0 size-full">
                  <path
                    d={ACHTSTERN}
                    className="fill-weiss stroke-rand"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full text-gruen-700" />
              )}
              <span className={cn('relative text-18 font-bold', geschlossen ? 'text-tinte-2' : 'text-weiss')}>{i + 1}</span>
            </span>
            <div className={cn('flex min-w-0 flex-col pb-5', quer && 'md:items-center md:pb-0')}>
              <a
                href={`#kurs-${kurs.slug}`}
                lang={titel.lang}
                className="inline-flex min-h-12 items-center text-20 leading-snug font-bold text-balance text-tinte no-underline hover:text-gruen-800 hover:underline"
              >
                {titel.text}
              </a>
              {kurs.zielgruppe ? <Text feld={kurs.zielgruppe} sprache={sprache} className="text-16 text-tinte-2" /> : null}
              <span className={cn('text-16 font-bold', kurs.anmeldeweg === 'register' ? 'text-gruen-800' : 'text-tinte-2')}>
                {status[kurs.anmeldeweg]}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
