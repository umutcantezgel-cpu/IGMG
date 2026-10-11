'use client';

import { Printer } from 'lucide-react';

/** Druckknopf der Monatsansicht (window.print); der Text kommt als Prop (K-12). */
export function DruckKnopf({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-md border-2 border-gruen-700 bg-weiss px-5 font-bold text-gruen-800 transition duration-(--dauer-rueckmeldung) hover:bg-gruen-50 active:scale-98 print:hidden"
    >
      <Printer aria-hidden className="size-5" />
      <span>{text}</span>
    </button>
  );
}
