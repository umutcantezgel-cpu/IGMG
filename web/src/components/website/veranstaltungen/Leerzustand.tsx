import type { ReactNode } from 'react';
import { Zustandsgrafik } from '@/components/website/Zustandsgrafik';

/** Leerzustand (Muster der Startseite, REFERENZ §2): Zustandsgrafik, Überschrift, ein Satz, optional ein nächster Schritt. */
export function Leerzustand({ titel, text, aktion }: { titel: string; text: string; aktion?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-linie bg-weiss px-6 py-12 text-center">
      <Zustandsgrafik art="leer" />
      <h2 className="text-display-2">{titel}</h2>
      <p className="max-w-text text-20 leading-einleitung text-pretty text-tinte-2">{text}</p>
      {aktion}
    </div>
  );
}
