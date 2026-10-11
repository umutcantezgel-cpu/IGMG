'use client';

import { useEffect, type RefObject } from 'react';

/** Schließt ein aufgeklapptes Menü bei Klick außerhalb und bei Escape (Fokus zurück auf den Auslöser). */
export function useAussenKlick(ref: RefObject<HTMLElement | null>, offen: boolean, schliessen: (fokusZurueck: boolean) => void) {
  useEffect(() => {
    if (!offen) return;
    const klick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) schliessen(false);
    };
    const taste = (e: KeyboardEvent) => {
      if (e.key === 'Escape') schliessen(true);
    };
    document.addEventListener('mousedown', klick);
    document.addEventListener('keydown', taste);
    return () => {
      document.removeEventListener('mousedown', klick);
      document.removeEventListener('keydown', taste);
    };
  }, [ref, offen, schliessen]);
}
