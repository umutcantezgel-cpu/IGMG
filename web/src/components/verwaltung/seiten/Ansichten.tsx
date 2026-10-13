import NextLink from 'next/link';
import { cn } from '@/lib/utils';

/** Umschalter zwischen Ansichten einer Verwaltungsseite (z. B. Aktuell/Papierkorb, Kopf-/Fußmenü) als Linkliste. */
export function Ansichten({
  label,
  eintraege,
}: {
  label: string;
  eintraege: { schluessel: string; label: string; href: string; aktiv: boolean }[];
}) {
  return (
    <nav aria-label={label}>
      <ul className="flex flex-wrap gap-2">
        {eintraege.map((v) => (
          <li key={v.schluessel}>
            <NextLink
              href={v.href}
              aria-current={v.aktiv ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-12 items-center rounded-pill border px-4 font-bold no-underline',
                v.aktiv
                  ? 'border-gruen-700 bg-gruen-700 text-weiss hover:text-weiss'
                  : 'border-rand bg-weiss text-tinte hover:bg-gruen-50 hover:text-tinte',
              )}
            >
              {v.label}
            </NextLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export const PILLE = 'inline-flex items-center rounded-pill px-3 py-0.5 text-16 font-bold whitespace-nowrap';
