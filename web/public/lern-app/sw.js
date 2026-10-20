/*
 * Service Worker der Lern-App (ADR 0037 Nr. 8, Spike L0-S6): Scope `/lern-app/`, neben dem Root-Worker `/sw.js`
 * (Scope `/`). Der genauere Scope steuert die Lern-App-Seiten.
 * - Vorräte nur mit dem Präfix `igmg-lernapp-` (der Root-Worker behält sie beim Aktivieren): Hülle
 *   `igmg-lernapp-schale-v<N>`; Pakete, Audio und Modelle (ADR 0039, ADR 0042) behalten ihre Namen über Versionen.
 * - Seiten der Lern-App: Netz zuerst, gelungene Antworten in die Hülle; ohne Netz die vorgehaltene Fassung.
 * - /_next/static/** (unveränderlich, Inhalts-Hash): Vorrat zuerst.
 * - Nie vorgehalten: /api/**, /lern-app/<ui>/anmelden, alles außer GET, fremde Ursprünge.
 * Beim Aktivieren löscht er nur eigene veraltete Hüllen, nie Vorräte der Website.
 */
const PRAEFIX = 'igmg-lernapp-';
const SCHALE = `${PRAEFIX}schale-v1`;
const DAUERHAFT = [`${PRAEFIX}pakete`, `${PRAEFIX}audio`, `${PRAEFIX}modelle`];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SCHALE).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((namen) =>
        Promise.all(namen.filter((n) => n.startsWith(PRAEFIX) && n !== SCHALE && !DAUERHAFT.includes(n)).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;
  const pfad = url.pathname;
  if (pfad.startsWith('/api/') || /^\/lern-app\/[^/]+\/anmelden(\/|$)/.test(pfad)) return;

  if (pfad.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(anfrage).then(
        (vorrat) =>
          vorrat ||
          fetch(anfrage).then((antwort) => {
            if (antwort.ok) {
              const kopie = antwort.clone();
              caches.open(SCHALE).then((c) => c.put(anfrage, kopie));
            }
            return antwort;
          }),
      ),
    );
    return;
  }

  if (anfrage.mode === 'navigate' && pfad.startsWith('/lern-app/')) {
    e.respondWith(
      fetch(anfrage)
        .then((antwort) => {
          if (antwort.ok) {
            const kopie = antwort.clone();
            caches.open(SCHALE).then((c) => c.put(pfad, kopie));
          }
          return antwort;
        })
        .catch(() => caches.open(SCHALE).then((c) => c.match(pfad).then((vorrat) => vorrat || Response.error()))),
    );
  }
});
