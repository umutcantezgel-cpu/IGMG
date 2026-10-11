import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scrollbarer Rahmen für breite Tabellen (Muster 7). Der Rahmen ist per Tastatur erreichbar, hat einen Namen
 * (role="region") und zeigt unter 768 px den Hinweis „Zum Weiterlesen seitlich wischen“ (DP-C2 Befund 3).
 * Nur für Server-Komponenten; die Tabelle selbst bleibt unverändert.
 */
export async function TabellenRahmen({
  beschriftung,
  children,
  className,
}: {
  beschriftung: string;
  children: ReactNode;
  className?: string;
}) {
  const t = await getTranslations('verwaltung.shell');
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-16 text-tinte-2 md:hidden">{t('wischen')}</p>
      <div
        role="region"
        aria-label={beschriftung}
        tabIndex={0}
        className={cn('relative overflow-x-auto rounded-lg border border-linie bg-weiss', className)}
      >
        {children}
      </div>
    </div>
  );
}
