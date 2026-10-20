'use client';

import { useEffect } from 'react';

/**
 * Meldet den Service Worker der Lern-App an (ADR 0037 Nr. 8): Datei `/lern-app/sw.js`, Scope `/lern-app/`. Der genauere
 * Scope steuert die Lern-App-Seiten; der Root-Worker (`/sw.js`, Scope `/`) bleibt für die Website zuständig.
 * Nur im Produktionsbetrieb und in sicheren Kontexten (https oder localhost), wie die Anmeldung der Website.
 */
export function ServiceWorkerAnmeldung() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('/lern-app/sw.js', { scope: '/lern-app/' }).catch(() => undefined);
  }, []);
  return null;
}
