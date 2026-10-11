'use client';

import { knopfRahmen } from './knopf';

/** „Erneut versuchen“ auf der Offline-Seite: lädt die Seite neu (Netz oder Zwischenspeicher, Welle D). Text als Prop (K-12). */
export function ErneutLadenKnopf({ text }: { text: string }) {
  return (
    <button type="button" onClick={() => window.location.reload()} className={knopfRahmen}>
      {text}
    </button>
  );
}
