'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';

const EINGABE = 'min-h-12 w-full rounded-md border border-rand bg-weiss px-3 text-18 text-tinte aria-invalid:border-fehler';

/** Beschriftetes Eingabefeld der Lern-App (ohne next-intl und ohne gemeinsame UI-Bibliothek im Client, KERN 4.0 §9). */
export function LernFeld({
  id,
  label,
  fehler,
  ...rest
}: { id: string; label: string; fehler?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={fehler ? true : undefined}
        aria-describedby={fehler ? `${id}-fehler` : undefined}
        className={EINGABE}
        {...rest}
      />
      {fehler ? (
        <p id={`${id}-fehler`} className="text-16 font-bold text-fehler">
          {fehler}
        </p>
      ) : null}
    </div>
  );
}

/** Passwortfeld mit Anzeigen/Verbergen (44-px-Knopf, `aria-pressed`); Richtung immer von links nach rechts. */
export function LernPasswort({ id, name, label, zeigen }: { id: string; name: string; label: string; zeigen: string }) {
  const [sichtbar, setSichtbar] = useState(false);
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          type={sichtbar ? 'text' : 'password'}
          autoComplete="current-password"
          required
          dir="ltr"
          maxLength={128}
          className={EINGABE}
        />
        <button
          type="button"
          aria-pressed={sichtbar}
          aria-label={zeigen}
          aria-controls={id}
          onClick={() => setSichtbar((s) => !s)}
          className="inline-flex min-h-12 min-w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-rand bg-weiss text-tinte-2 hover:bg-sand"
        >
          {sichtbar ? <EyeOff aria-hidden className="size-5" /> : <Eye aria-hidden className="size-5" />}
        </button>
      </div>
    </div>
  );
}

/** Rückmeldung oben im Formular; bekommt nach einem Fehler den Fokus (WCAG 3.3.1). */
export function LernMeldung({ id, art, children }: { id: string; art: 'fehler' | 'info'; children: ReactNode }) {
  return (
    <div
      id={id}
      role={art === 'fehler' ? 'alert' : 'status'}
      tabIndex={-1}
      className={`rounded-md border-s-4 p-4 text-16 font-bold ${art === 'fehler' ? 'border-fehler bg-fehler-toenung text-fehler' : 'border-info bg-info-toenung text-info'}`}
    >
      {children}
    </div>
  );
}
