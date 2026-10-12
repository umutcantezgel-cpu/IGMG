import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Scrollbarer Rahmen für breite Tabellen (Muster 7). Der Rahmen ist per Tastatur erreichbar, hat einen Namen
 * (role="region") und zeigt unter 768 px den Hinweis „Zum Weiterlesen seitlich wischen“ (DP-C2 Befund 3).
 * Mit `mobil` (H-B06) zeigt das Telefon stattdessen diese Fassung (Karten), die Tabelle ist dort ausgeblendet; dann
 * entfällt auch der Wischhinweis. Nur für Server-Komponenten; die Tabelle selbst bleibt unverändert.
 */
export async function TabellenRahmen({
  beschriftung,
  children,
  className,
  mobil,
}: {
  beschriftung: string;
  children: ReactNode;
  className?: string;
  mobil?: ReactNode;
}) {
  const t = await getTranslations('verwaltung.shell');
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className={cn('text-16 text-tinte-2 md:hidden', mobil && 'max-md:hidden')}>{t('wischen')}</p>
      {mobil ? <div className="flex min-w-0 flex-col gap-3 md:hidden">{mobil}</div> : null}
      <div
        role="region"
        aria-label={beschriftung}
        tabIndex={0}
        className={cn('relative overflow-x-auto rounded-lg border border-linie bg-weiss', mobil && 'max-md:hidden', className)}
      >
        {children}
      </div>
    </div>
  );
}
