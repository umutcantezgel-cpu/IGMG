'use client';

import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { klassen } from '@/lib/klassen';

/**
 * Schwebender Knopf „Nach oben“ für lange Seiten (Sichtabnahme K-3, H-2): erscheint erst, wenn die Seite mehr als eine
 * Fensterhöhe gescrollt ist, und führt zum Inhaltsanfang (`#inhalt`, Ziel des Sprunglinks – der Fokus folgt).
 * Verborgen (`visibility: hidden`) ist er weder sichtbar noch fokussierbar; ohne Skript bleibt er verborgen. Kein Ein-
 * oder Ausblenden mit Bewegung; Ebene wie der Seitenkopf (unter Dialogen). Unter sm ist er nur ein runder Symbolknopf
 * (48 px), der Text bleibt für Screenreader der Name – so verdeckt er weniger Lesetext (Sichtabnahme Runde 3, HB-8).
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
        'fixed right-4 bottom-4 z-(--ebene-kopf) inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-rand bg-weiss px-4 font-bold text-gruen-800 no-underline shadow-s2 transition duration-(--dauer-rueckmeldung) hover:border-gruen-700 hover:bg-gruen-50 hover:text-gruen-800 active:scale-98 max-sm:size-12 max-sm:px-0 md:right-8 md:bottom-8',
        !sichtbar && 'invisible',
      )}
    >
      <ArrowUp aria-hidden className="size-5" />
      <span className="max-sm:sr-only">{text}</span>
    </a>
  );
}
