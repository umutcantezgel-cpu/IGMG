import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Einzelnes Häkchen (Einwilligung, Bestätigung) als ganze Fläche anklickbar (≥ 56 px), Fehler am Feld
 * (aria-invalid, aria-describedby). Wert „ja“ wie bei den öffentlichen Formularen.
 */
export function Haken({ id, name, label, fehler }: { id: string; name: string; label: ReactNode; fehler?: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={`flex min-h-14 cursor-pointer items-start gap-3 rounded-md border bg-weiss px-3.5 py-3 text-16 has-checked:bg-gruen-50 ${fehler ? 'border-2 border-fehler' : 'border-rand'}`}
      >
        <input
          id={id}
          type="checkbox"
          name={name}
          value="ja"
          required
          aria-invalid={fehler ? true : undefined}
          aria-describedby={fehler ? `${id}-fehler` : undefined}
          className="mt-0.5 size-5.5 shrink-0 accent-gruen-700"
        />
        <span className="leading-normal text-pretty">{label}</span>
      </label>
      {fehler ? (
        <p id={`${id}-fehler`} className="flex items-start gap-1.5 text-16 font-bold text-fehler">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />
          <span>{fehler}</span>
        </p>
      ) : null}
    </div>
  );
}
