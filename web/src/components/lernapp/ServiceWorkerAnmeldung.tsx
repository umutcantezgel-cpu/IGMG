'use client';

import { useEffect } from 'react';
import type { Oberflaeche } from '@/lib/lernapp/kurse';

/**
 * Meldet den Service Worker der Lern-App an (ADR 0037 Nr. 8, PLAN §3.5): Datei `/lern-app/sw.js` mit der Bau-Kennung als
 * Suchparameter (`?v=<bau>`, Versionierung der Hülle), Scope `/lern-app/`. Der genauere Scope steuert die
 * Lern-App-Seiten; der Root-Worker (`/sw.js`, Scope `/`) bleibt für die Website zuständig. Danach bittet er den Worker,
 * die Hülle dieser Oberflächensprache vorzuhalten (Start, Fortschritt, Wortschatz, Einstellungen, Quellen samt
 * Programmteilen). Nur im Produktionsbetrieb und in sicheren Kontexten, wie die Anmeldung der Website.
 */
export function ServiceWorkerAnmeldung({ ui, bau }: { ui: Oberflaeche; bau: string }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator) || !window.isSecureContext) return;
    const sw = navigator.serviceWorker;
    sw.register(`/lern-app/sw.js?v=${encodeURIComponent(bau)}`, { scope: '/lern-app/' })
      .then(() => sw.ready)
      .then((r) => r.active?.postMessage({ art: 'schale', ui }))
      .catch(() => undefined);
  }, [ui, bau]);
  return null;
}
