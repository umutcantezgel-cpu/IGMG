'use client';

import { ArrowRight, Send } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { LadeStern } from '@/components/website/Zustandsgrafik';

/**
 * Absende-Knopf mit Ladezustand (useFormStatus). Im FormWizard auch „Weiter“ (`symbol="weiter"`, `name="richtung"`).
 * Während des Sendens steht der Lade-Achtstern (B-12) vor dem Text, das Symbol weicht ihm. Rückmeldung: Farbe und
 * Druck `active:scale-98` (B-01).
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
  // Eigener Name: `Symbol` würde das globale Symbol überschatten und den Knopf beim Hydrieren abbrechen.
  const Icon = symbol === 'weiter' ? ArrowRight : Send;
  return (
    <button
      type="submit"
      name={name}
      value={wert}
      disabled={pending}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss transition duration-(--dauer-rueckmeldung) hover:bg-gruen-800 active:scale-98 disabled:cursor-wait disabled:opacity-80"
    >
      {pending ? <LadeStern /> : symbol === 'senden' ? <Icon aria-hidden className="size-5" /> : null}
      <span>{pending ? texte.sendet : texte.senden}</span>
      {symbol === 'weiter' && !pending ? <Icon aria-hidden className="size-5" /> : null}
    </button>
  );
}
