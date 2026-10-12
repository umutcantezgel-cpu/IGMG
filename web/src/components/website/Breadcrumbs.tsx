import { ChevronRight, House } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/link';
import { cn } from '@/lib/utils';
import type { Ziel } from './navigation';

export type PfadEintrag = { label: string; ziel?: Ziel };

/**
 * Breadcrumbs (02.3, design/Breadcrumbs.dc.html): Startseite › [Elternseiten] › aktuelle Seite.
 * Nicht auf Startseite und Styleguide (Laufbuch D-16). JSON-LD BreadcrumbList ergänzt die Seite (K-16).
 * Auf dem Telefon eine Zeile (H-B07): das Haus wird zum Symbol mit 48-px-Ziel, das Endglied kürzt sich mit „…“;
 * nur das Endglied ist fett grün, Zwischenglieder ohne Ziel stehen in Tinte-2.
 */
export async function Breadcrumbs({ pfad }: { pfad: PfadEintrag[] }) {
  const t = await getTranslations('pfad');
  const letzte = pfad.length - 1;
  return (
    <nav aria-label={t('label')} className="border-b border-linie bg-sand">
      <ol className="mx-auto flex max-w-(--container-inhalt) flex-nowrap items-center gap-x-0.5 px-2 py-1 text-16 leading-snug md:flex-wrap md:px-6">
        <li className="flex min-w-0 shrink-0 items-center">
          <Link
            href="/"
            aria-label={t('zurStartseite')}
            className="inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-sm px-2 text-tinte-2 underline underline-offset-3 hover:bg-gruen-50 hover:text-gruen-800 md:min-h-11 md:min-w-0"
          >
            <House aria-hidden className="size-5 md:size-4" />
            <span className="hidden md:inline">{t('startseite')}</span>
          </Link>
        </li>
        {pfad.map((e, i) => (
          <li key={`${e.label}-${i}`} className={cn('flex min-w-0 items-center', i < letzte && 'shrink-0')}>
            <ChevronRight aria-hidden className="size-4 shrink-0 text-tinte-3" />
            {i === letzte ? (
              <span aria-current="page" className="inline-flex min-h-11 min-w-0 items-center px-2 font-bold text-gruen-800">
                <span className="min-w-0 truncate md:overflow-visible md:whitespace-normal">{e.label}</span>
              </span>
            ) : e.ziel ? (
              <Link
                href={e.ziel}
                className="inline-flex min-h-11 items-center rounded-sm px-2 text-tinte-2 underline underline-offset-3 hover:bg-gruen-50 hover:text-gruen-800"
              >
                {e.label}
              </Link>
            ) : (
              <span className="inline-flex min-h-11 items-center px-2 text-tinte-2">{e.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
