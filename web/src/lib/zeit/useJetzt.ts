'use client';

import { useSyncExternalStore } from 'react';

/**
 * Aktuelle Zeit im Browser, minütlich (bzw. im gewählten Takt) aktualisiert. Auf dem Server und beim
 * Hydrieren `null` – so entsteht kein Unterschied zwischen statischem HTML und Browser (K-01, K-08).
 */
const zuhoerer = new Set<() => void>();
let jetzt: Date | null = null;
let takt: ReturnType<typeof setInterval> | null = null;

function abonnieren(rueckruf: () => void) {
  zuhoerer.add(rueckruf);
  if (!takt) {
    jetzt = new Date();
    takt = setInterval(() => {
      jetzt = new Date();
      zuhoerer.forEach((z) => z());
    }, 30_000);
    queueMicrotask(() => zuhoerer.forEach((z) => z()));
  }
  return () => {
    zuhoerer.delete(rueckruf);
    if (zuhoerer.size === 0 && takt) {
      clearInterval(takt);
      takt = null;
    }
  };
}

export function useJetzt(): Date | null {
  return useSyncExternalStore(
    abonnieren,
    () => jetzt,
    () => null,
  );
}
