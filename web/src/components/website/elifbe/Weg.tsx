import { ArrowRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { Achtstern } from '@/components/website/Icons';
import type { Ziel } from '@/components/website/navigation';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';

export type WegStation = {
  kennung: string;
  titel: string;
  text: string;
  /** Ohne Ziel steht die Station ohne Link (z. B. „Folgt bald“). */
  ziel?: Ziel;
  linkText?: string;
  /** Zusatzzeile, z. B. Platzhalter. */
  hinweis?: string;
  /** Plakette in der Fußzeile der Karte statt eines Links, z. B. „Folgt bald“ (Sichtabnahme L-1). */
  plakette?: string;
  /** Zeichen in der Marke (Vorgabe: Nummer). */
  zeichen?: ReactNode;
  /** Arabischer Inhalt der Marke (dann `lang="ar"`). */
  arabisch?: boolean;
};

/**
 * Lernweg (Bewegungsregister B-24): Achtstern-Stationen an einer Linie, die sich beim ersten Bild von Station zu
 * Station zeichnet; jede Station tritt hervor, wenn die Linie sie erreicht (nur CSS, globals.css `lernweg-*`).
 * Senkrecht auf jeder Breite; mit `waagerecht` ab lg als Welle über fünf Spalten (Stationen genau auf den Nulldurchgängen
 * bei 10 %, 30 %, 50 %, 70 %, 90 %). Die Welle ist gestreckt (preserveAspectRatio none) und ohne non-scaling-stroke,
 * weil Chromium sonst das Strichmuster mit pathLength in Bildschirmpixeln rechnet. Ohne Animation steht der Endzustand.
 */
export function Weg({
  stationen,
  waagerecht = false,
  kompakt = false,
  beschriftung,
}: {
  stationen: WegStation[];
  waagerecht?: boolean;
  /** Kleinere Karten; ohne `linkText` wird der Titel zum Link über die ganze Karte. */
  kompakt?: boolean;
  beschriftung: string;
}) {
  const n = Math.max(1, stationen.length - 1);
  return (
    <div className="relative">
      {waagerecht ? (
        <svg
          aria-hidden
          viewBox="0 0 1000 96"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-0 hidden h-24 w-full lg:block"
        >
          <path
            d="M100 48C166 8 233 8 300 48S433 88 500 48S633 8 700 48S833 88 900 48"
            pathLength={1}
            fill="none"
            className="lernweg-welle stroke-gruen-700"
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      ) : null}
      <ol
        aria-label={beschriftung}
        className={cn('relative flex flex-col', waagerecht && 'lg:grid lg:grid-cols-5')}
        style={{ '--n': n } as CSSProperties}
      >
        {stationen.map((s, i) => (
          <li
            key={s.titel}
            className={cn('flex gap-4 md:gap-5', waagerecht && 'lg:flex-col lg:items-stretch lg:gap-4 lg:px-3')}
            style={{ '--i': i } as CSSProperties}
          >
            <div aria-hidden className={cn('flex shrink-0 flex-col items-center pt-2', waagerecht && 'lg:h-24 lg:justify-center lg:pt-0')}>
              <span className="lernweg-station relative flex size-14 items-center justify-center text-gruen-700">
                <Achtstern viewBox="3.5 3.5 17 17" className="absolute inset-0 size-full" />
                <span
                  lang={s.arabisch ? 'ar' : undefined}
                  className={cn('relative font-bold text-weiss', s.arabisch ? 'text-24 leading-none' : 'text-18')}
                >
                  {s.zeichen ?? i + 1}
                </span>
              </span>
              {i < stationen.length - 1 ? (
                <span
                  className={cn('lernweg-abschnitt -mb-2 min-h-6 w-0.5 flex-1 bg-gruen-700', waagerecht && 'lg:hidden')}
                  style={{ '--i': i } as CSSProperties}
                />
              ) : null}
            </div>
            <div className={cn('min-w-0 flex-1', kompakt ? 'pb-3' : 'pb-6', waagerecht && 'lg:pb-0')}>
              <div
                className={cn(
                  'relative flex h-full flex-col rounded-lg border border-linie bg-weiss shadow-s1',
                  kompakt ? 'gap-1 px-4 py-3' : 'gap-2 p-5',
                  s.ziel && !s.linkText && 'transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50',
                )}
              >
                <span className="text-16 font-bold text-gruen-800">{s.kennung}</span>
                <h3 className={cn('leading-tight', kompakt ? 'text-20' : 'text-24')}>
                  {s.ziel && !s.linkText ? (
                    <Link
                      href={s.ziel}
                      className="text-tinte no-underline after:absolute after:inset-0 after:rounded-lg hover:text-gruen-800"
                    >
                      {s.titel}
                    </Link>
                  ) : (
                    s.titel
                  )}
                </h3>
                <p className={cn('text-pretty text-tinte-2', kompakt ? 'text-16' : 'text-18 leading-einleitung')}>{s.text}</p>
                {s.hinweis ? <p className="text-16 text-tinte-2">{s.hinweis}</p> : null}
                {s.plakette ? (
                  <span className="mt-auto inline-flex min-h-12 items-center self-start">
                    <span className="rounded-pill bg-sand px-3 py-1 text-16 font-bold text-tinte-2">{s.plakette}</span>
                  </span>
                ) : null}
                {s.ziel && s.linkText ? (
                  <Link
                    href={s.ziel}
                    aria-label={`${s.linkText}: ${s.titel}`}
                    className="mt-auto inline-flex min-h-12 items-center gap-2 self-start font-bold underline-offset-4 hover:underline"
                  >
                    {s.linkText}
                    <ArrowRight aria-hidden className="size-5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
