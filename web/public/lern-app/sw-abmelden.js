/*
 * Abmelde-Worker der Lern-App (S-L3 N-4; `_lernapp/GO-LIVE.md`, Ausnahme N-4): Ist die Lern-App über die Umgebung
 * ausgeschaltet (`FUNKTION_LERNAPP=aus`), liefert der Proxy diese Datei unter der Adresse `/lern-app/sw.js` aus
 * (`src/proxy.ts`). Geräte mit dem Worker der Lern-App holen sie bei der nächsten Update-Prüfung als neue Fassung:
 * - sofort aktiv (`skipWaiting`), ohne `fetch`-Hörer – nichts kommt mehr aus dem Vorrat, alles geht ans Netz (dort 404);
 * - löscht die Vorräte `igmg-lernapp-*` außer den Modellen (`igmg-lernapp-modelle`, groß und unverändert, S-L3 N-4);
 * - meldet sich ab und lädt offene Seiten der Lern-App neu, damit sie die Antwort des Servers zeigen.
 * Der Lernstand in IndexedDB (`igmg-lernapp`) bleibt auf dem Gerät (GO-LIVE „Abschalten“).
 */
const PRAEFIX = 'igmg-lernapp-';
const BEHALTEN = new Set([`${PRAEFIX}modelle`]);

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (ereignis) => {
  ereignis.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => n.startsWith(PRAEFIX) && !BEHALTEN.has(n)).map((n) => caches.delete(n))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((fenster) => Promise.all(fenster.map((f) => f.navigate(f.url).catch(() => undefined)))),
  );
});
