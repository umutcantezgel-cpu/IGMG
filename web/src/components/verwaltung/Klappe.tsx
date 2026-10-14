import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Aufklappbarer Abschnitt der Verwaltung (X-4): `details` mit einer Kopfzeile, die immer einen Chevron trägt (dreht
 * sich beim Öffnen) und rechts optional den Stand zeigt („1 von 2“, „freiwillig“). Der Browser-Marker ist global
 * ausgeblendet (globals.css), weil `summary` hier ein Flex-Element ist – der Chevron ersetzt ihn.
 * Ohne Hooks: nutzbar in Server- und Client-Komponenten; `onToggle` nur aus Client-Komponenten übergeben.
 */
export function Klappe({
  titel,
  stand,
  kopfKlasse,
  className,
  children,
  ...details
}: Omit<ComponentProps<'details'>, 'title'> & {
  titel: ReactNode;
  /** Kurzer Stand rechts in der Kopfzeile, z. B. „1 von 2 übersetzt“. */
  stand?: ReactNode;
  /** Schrift der Kopfzeile (Standard: fett in Textgröße). */
  kopfKlasse?: string;
}) {
  return (
    <details className={cn('group/klappe', className)} {...details}>
      <summary className={cn('flex min-h-12 cursor-pointer list-none flex-wrap items-center gap-x-3 font-bold', kopfKlasse)}>
        <ChevronDown
          aria-hidden
          className="size-5 shrink-0 text-gruen-700 transition-transform duration-(--dauer-wechsel) group-open/klappe:rotate-180 motion-reduce:transition-none"
        />
        <span className="min-w-0 flex-1">{titel}</span>
        {/* Auf dem Telefon in eigener Zeile unter dem Titel, damit der Titel nicht in schmale Zeilen bricht */}
        {stand ? (
          <span className="shrink-0 font-text text-16 font-normal tracking-normal text-tinte-2 max-sm:basis-full max-sm:pb-2 max-sm:pl-8">
            {stand}
          </span>
        ) : null}
      </summary>
      {children}
    </details>
  );
}
