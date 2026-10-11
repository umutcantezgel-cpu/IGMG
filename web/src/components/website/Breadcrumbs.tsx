import { ChevronRight, House } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Ziel } from './navigation';

export type PfadEintrag = { label: string; ziel?: Ziel };

/**
 * Breadcrumbs (02.3, design/Breadcrumbs.dc.html): Startseite › [Elternseiten] › aktuelle Seite.
 * Nicht auf Startseite und Styleguide (Laufbuch D-16). JSON-LD BreadcrumbList ergänzt die Seite (K-16).
 */
export async function Breadcrumbs({ pfad }: { pfad: PfadEintrag[] }) {
  const t = await getTranslations('pfad');
  const letzte = pfad.length - 1;
  return (
    <nav aria-label={t('label')} className="border-b border-linie bg-sand">
      <ol className="mx-auto flex max-w-(--container-inhalt) flex-wrap items-center gap-x-0.5 px-2 py-1 text-16 leading-snug md:px-6">
        <li className="flex items-center">
          <Link
            href="/"
            aria-label={t('zurStartseite')}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-tinte-2 underline underline-offset-[3px] hover:bg-gruen-50 hover:text-gruen-800"
          >
            <House aria-hidden className="size-4" />
            <span>{t('startseite')}</span>
          </Link>
        </li>
        {pfad.map((e, i) => (
          <li key={`${e.label}-${i}`} className="flex items-center">
            <ChevronRight aria-hidden className="size-4 text-tinte-3" />
            {i === letzte || !e.ziel ? (
              <span
                aria-current={i === letzte ? 'page' : undefined}
                className="inline-flex min-h-11 items-center px-2 font-bold text-gruen-800"
              >
                {e.label}
              </span>
            ) : (
              <Link
                href={e.ziel}
                className="inline-flex min-h-11 items-center rounded-sm px-2 text-tinte-2 underline underline-offset-[3px] hover:bg-gruen-50 hover:text-gruen-800"
              >
                {e.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
