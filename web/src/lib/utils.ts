import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/** tailwind-merge kennt die eigenen Schriftgrößen-Tokens (text-16 … text-48), damit sie nicht mit Farben kollidieren. */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['16', '18', '20', '24', '30', '36', '48', 'anzeige-64', 'anzeige-96', 'anzeige-144'] }],
    },
  },
});

export function cn(...eingaben: ClassValue[]) {
  return twMerge(clsx(eingaben));
}
