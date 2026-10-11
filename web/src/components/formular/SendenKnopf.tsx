'use client';

import { ArrowRight, Send } from 'lucide-react';
import { useFormStatus } from 'react-dom';

/**
 * Absende-Knopf mit Ladezustand (useFormStatus). Im FormWizard auch „Weiter“ (`symbol="weiter"`, `name="richtung"`).
 */
export function SendenKnopf({
  texte,
  symbol = 'senden',
  name,
  wert,
}: {
  texte: { senden: string; sendet: string };
  symbol?: 'senden' | 'weiter';
  name?: string;
  wert?: string;
}) {
  const { pending } = useFormStatus();
  const Symbol = symbol === 'weiter' ? ArrowRight : Send;
  return (
    <button
      type="submit"
      name={name}
      value={wert}
      disabled={pending}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800 disabled:cursor-wait disabled:opacity-80"
    >
      {symbol === 'senden' ? <Symbol aria-hidden className="size-5" /> : null}
      <span>{pending ? texte.sendet : texte.senden}</span>
      {symbol === 'weiter' ? <Symbol aria-hidden className="size-5" /> : null}
    </button>
  );
}
