'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { klassen } from '@/lib/klassen';

/**
 * Schwebender Knopf „Nach oben“ für lange Seiten (Sichtabnahme K-3, H-2): erscheint erst, wenn die Seite mehr als eine
 * Fensterhöhe gescrollt ist, und führt zum Inhaltsanfang (`#inhalt`, Ziel des Sprunglinks – der Fokus folgt).
 * Verborgen (`visibility: hidden`) ist er weder sichtbar noch fokussierbar; ohne Skript bleibt er verborgen. Kein Ein-
 * oder Ausblenden mit Bewegung; Ebene wie der Seitenkopf (unter Dialogen).
 */
export function NachOben({ text }: { text: string }) {
  const [sichtbar, setSichtbar] = useState(false);
  useEffect(() => {
    let rahmen = 0;
    const pruefe = () => {
      cancelAnimationFrame(rahmen);
      rahmen = requestAnimationFrame(() => setSichtbar(window.scrollY > window.innerHeight));
    };
    pruefe();
    window.addEventListener('scroll', pruefe, { passive: true });
    window.addEventListener('resize', pruefe);
    return () => {
      cancelAnimationFrame(rahmen);
      window.removeEventListener('scroll', pruefe);
      window.removeEventListener('resize', pruefe);
    };
  }, []);
  return (
    <a
      href="#inhalt"
      className={klassen(
        'fixed right-4 bottom-4 z-(--ebene-kopf) inline-flex min-h-12 items-center gap-2 rounded-pill border border-rand bg-weiss px-4 font-bold text-gruen-800 no-underline shadow-s2 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 md:right-8 md:bottom-8',
        !sichtbar && 'invisible',
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
      {text}
    </a>
  );
}
