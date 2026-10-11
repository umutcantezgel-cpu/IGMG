import type { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';

/** Eingabefelder nach den Tokens der Verwaltung (wie im Veranstaltungsformular): 48 px hoch, Rand Tokens, Fehler über aria-invalid. */
export const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler disabled:bg-sand';

/** Mehrzeiliges Feld: gleiche Ränder, Höhe über die Zeilenzahl. */
export const textfeld =
  'w-full rounded-md border border-rand bg-weiss px-3.5 py-2.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler disabled:bg-sand';

/**
 * Rahmen eines Felds: Beschriftung, Hinweis und Fehler am Feld. Fehler und Hinweis hängen über aria-describedby am
 * Eingabefeld (K-07, K-11). Ohne Hooks, daher in Server- und Client-Komponenten gleichermaßen verwendbar.
 */
export function Feldrahmen({
  id,
  label,
  hinweis,
  fehler,
  pflicht,
  kinder,
}: {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: string;
  pflicht?: string;
  kinder: (aria: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}) {
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-bold">
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> {pflicht}</span> : null}
      </label>
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {kinder({ id, ...(fehler ? { 'aria-invalid': true as const } : {}), 'aria-describedby': beschreibung })}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}
