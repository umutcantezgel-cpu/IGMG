'use client';

import { useEffect } from 'react';

/**
 * Meldet den Service Worker an (D-P1): nur im Produktionsbetrieb und nur in sicheren Kontexten (https oder localhost).
 * Keine Daten, keine Meldungen an Dritte – der Worker hält nur Gebetszeiten-Seiten und unveränderliche Dateien vor.
 */
export function ServiceWorkerAnmeldung() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
  }, []);
  return null;
}
