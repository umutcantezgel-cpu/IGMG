import type { ComponentProps, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/** Eingabefeld der Bearbeitungsformulare: 48 px hoch, Rand über Tokens, Fehler über aria-invalid (K-07, K-11, K-16). */
export const eingabe =
  'min-h-12 w-full rounded-md border border-rand bg-weiss px-3.5 text-18 text-tinte placeholder:text-tinte-3 aria-invalid:border-2 aria-invalid:border-fehler disabled:bg-sand';

/**
 * Rahmen eines Formularfelds der Verwaltung (K-07, K-11, K-16): Beschriftung, Hinweis und Fehler am Feld. Hinweis und
 * Fehler hängen über aria-describedby am Eingabefeld; der Fehler steht darunter mit Symbol und Klartext. Alle
 * Bearbeitungsformulare der Verwaltung nutzen diese eine Fassung (vorher je Formular eine Kopie).
 */
export function Rahmen({
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
      {kinder({ id, ...(fehler ? { 'aria-invalid': true as const } : {}), 'aria-describedby': beschreibung })}
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}

/**
 * Formularfeld mit Beschriftung, Hinweis und Fehler am Feld (K-07, K-11): Fehler über aria-describedby,
 * aria-invalid; Fehlertext mit Icon und Klartext (design/BaseComponents.dc.html). Der Hinweis steht unter dem
 * Eingabefeld, damit nebeneinanderliegende Felder auch dann bündig bleiben, wenn nur eines einen Hinweis hat (DP-C1 M4).
 */
type FeldProps = ComponentProps<typeof Input> & {
  id: string;
  label: ReactNode;
  hinweis?: ReactNode;
  fehler?: ReactNode;
  pflicht?: ReactNode;
};

export function Feld({ id, label, hinweis, fehler, pflicht, ...input }: FeldProps) {
  const beschreibung = [hinweis ? `${id}-hinweis` : null, fehler ? `${id}-fehler` : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>
        {label}
        {pflicht ? <span className="font-normal text-tinte-2"> {pflicht}</span> : null}
      </Label>
      <Input id={id} aria-invalid={fehler ? true : undefined} aria-describedby={beschreibung} {...input} />
      {hinweis ? (
        <p id={`${id}-hinweis`} className="text-16 text-tinte-2">
          {hinweis}
        </p>
      ) : null}
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}
