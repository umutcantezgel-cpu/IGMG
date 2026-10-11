import type { ComponentProps, ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
