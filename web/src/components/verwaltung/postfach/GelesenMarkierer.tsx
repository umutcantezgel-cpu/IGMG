'use client';

import { startTransition, useEffect } from 'react';

/**
 * Markiert die geöffnete Unterhaltung als gelesen, sobald sie ungelesene Nachrichten hat. Die Aktion lädt die Seite
 * danach neu (Liste und Zähler der Seitenleiste). Ohne ungelesene Nachrichten geschieht nichts.
 */
export function GelesenMarkierer({ id, ungelesen, markiere }: { id: string; ungelesen: boolean; markiere: (id: string) => Promise<void> }) {
  useEffect(() => {
    if (!ungelesen) return;
    startTransition(() => {
      void markiere(id);
    });
  }, [id, ungelesen, markiere]);
  return null;
}
