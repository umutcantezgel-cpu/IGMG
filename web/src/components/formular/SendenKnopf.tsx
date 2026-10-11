'use client';

import { Send } from 'lucide-react';
import { useFormStatus } from 'react-dom';

/** Senden-Knopf mit Ladezustand (useFormStatus). */
export function SendenKnopf({ texte }: { texte: { senden: string; sendet: string } }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 self-start rounded-md bg-gruen-700 px-6 text-18 font-bold text-weiss hover:bg-gruen-800 disabled:cursor-wait disabled:opacity-80"
    >
      <Send aria-hidden className="size-5" />
      {pending ? texte.sendet : texte.senden}
    </button>
  );
}
