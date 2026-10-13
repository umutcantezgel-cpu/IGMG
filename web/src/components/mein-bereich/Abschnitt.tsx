import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/** Abschnitt einer Seite in „Mein Bereich“: weiße Karte mit Symbol, Überschrift (h2), Einleitung und Inhalt. */
export function Abschnitt({
  id,
  Icon,
  titel,
  text,
  rechts,
  children,
  ton = 'normal',
}: {
  id: string;
  Icon: LucideIcon;
  titel: string;
  text?: ReactNode;
  rechts?: ReactNode;
  children?: ReactNode;
  ton?: 'normal' | 'warnung';
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titel`}
      className={`scroll-mt-6 rounded-lg border bg-weiss p-5 md:p-7 ${ton === 'warnung' ? 'border-2 border-warnung' : 'border-linie'}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gruen-50 text-gruen-700">
            <Icon aria-hidden className="size-5" />
          </span>
          <h2 id={`${id}-titel`} className="pt-1 text-24">
            {titel}
          </h2>
        </div>
        {rechts}
      </div>
      {text ? <div className="mt-3 max-w-text text-pretty text-tinte-2">{text}</div> : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </section>
  );
}

/** Kleines Statusschild (aktiv/inaktiv). */
export function Status({ an, text }: { an: boolean; text: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-16 font-bold ${an ? 'bg-gruen-50 text-gruen-800' : 'bg-sand text-tinte-2'}`}
    >
      <span aria-hidden className={`size-2 rounded-pill ${an ? 'bg-gruen-700' : 'bg-rand'}`} />
      {text}
    </span>
  );
}
