import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Rückmeldung (Fehler, Erfolg, Hinweis) mit Icon und Klartext; Fokus-Ziel nach dem Absenden (K-07). */
export function Meldung({
  art,
  children,
  id,
  fokus,
}: {
  art: 'fehler' | 'erfolg' | 'info';
  children: ReactNode;
  id?: string;
  fokus?: boolean;
}) {
  const Icon = art === 'fehler' ? CircleAlert : art === 'erfolg' ? CircleCheck : Info;
  return (
    <div
      id={id}
      role={art === 'fehler' ? 'alert' : 'status'}
      tabIndex={fokus ? -1 : undefined}
      className={cn(
        'flex items-start gap-2 rounded-md border px-4 py-3 text-16',
        art === 'fehler' && 'border-fehler bg-fehler-toenung text-fehler',
        art === 'erfolg' && 'border-gruen-700 bg-gruen-50 text-gruen-800',
        art === 'info' && 'border-info bg-info-toenung text-info',
      )}
    >
      <Icon aria-hidden className="mt-0.5 size-5 shrink-0" />
      <div className="font-bold">{children}</div>
    </div>
  );
}
