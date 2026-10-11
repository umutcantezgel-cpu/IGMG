import { CalendarX } from 'lucide-react';
import type { ReactNode } from 'react';

/** Leerzustand (Events.dc.html state=leer, 08 Nr. 07/08): gestrichelter Rand, Kreis, Überschrift, Text, Aktion. */
export function Leerzustand({ titel, text, aktion }: { titel: string; text: string; aktion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border-2 border-dashed border-rand bg-weiss px-6 py-12 text-center">
      <span className="flex size-16 items-center justify-center rounded-pill bg-sand text-tinte-2">
        <CalendarX aria-hidden className="size-8" />
      </span>
      <h2 className="text-30">{titel}</h2>
      <p className="max-w-[56ch] text-tinte-2">{text}</p>
      {aktion}
    </div>
  );
}
