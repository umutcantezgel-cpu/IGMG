import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tailwind-merge kennt die eigenen Schriftgrößen-Tokens (text-16 … text-48, Anzeige- und Display-Stufen), damit sie nicht
 * mit Farben kollidieren: Unbekannte `text-*` hält es für Farben und verwirft sie neben `text-weiss` (Sichtabnahme E3,
 * Kontakt „Besucher willkommen“ in 18 statt 40 px).
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['16', '18', '20', '24', '30', '36', '48', 'anzeige-64', 'anzeige-96', 'anzeige-144', 'display-1', 'display-2'] },
      ],
    },
  },
});

export function cn(...eingaben: ClassValue[]) {
  return twMerge(clsx(eingaben));
}
