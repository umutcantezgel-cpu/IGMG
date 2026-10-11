/*
 * Service Worker (D-P1, PWA, K-08): Gebetszeiten und die Moschee-Anzeige laufen offline weiter, sonst die Offline-Seite.
 * - Seiten: Netz zuerst; gelungene Antworten der Gebetszeiten-Seiten (alle Sprachen, Anzeige) werden vorgehalten;
 *   ohne Netz die vorgehaltene Fassung, sonst /offline bzw. /<sprache>/offline.
 * - /_next/static/** (unveränderlich, Inhalts-Hash): Vorrat zuerst.
 * - Nie vorgehalten: Verwaltung, API, Medien-Uploads, Server Actions (POST) – keine Personendaten im Speicher.
 */
const VERSION = 'igmg-v1';
const SEITEN = `${VERSION}-seiten`;
const DATEIEN = `${VERSION}-dateien`;
const OFFLINE = ['/offline', '/tr/offline', '/en/offline'];
const VORHALTEN = [
  /^\/(tr\/|en\/)?(gebetszeiten|namaz-vakitleri|prayer-times)(\/(anzeige|ekran|display))?\/?$/,
  /^\/(tr|en)?\/?$/,
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SEITEN)
      .then((c) => c.addAll([...OFFLINE, '/gebetszeiten', '/gebetszeiten/anzeige']))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((namen) => Promise.all(namen.filter((n) => !n.startsWith(VERSION)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

function offlineSeite(pfad) {
  const sprache = pfad.startsWith('/tr/') || pfad === '/tr' ? '/tr' : pfad.startsWith('/en/') || pfad === '/en' ? '/en' : '';
  return caches.match(`${sprache}/offline`).then((r) => r || caches.match('/offline'));
}

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;
  const pfad = url.pathname;
  if (pfad.startsWith('/verwaltung') || pfad.startsWith('/api/') || pfad.startsWith('/medien/') || /^\/(tr|en)\/verwaltung/.test(pfad)) return;

  if (pfad.startsWith('/_next/static/')) {
    e.respondWith(
      caches.open(DATEIEN).then((c) =>
        c.match(anfrage).then(
          (vorrat) =>
            vorrat ||
            fetch(anfrage).then((antwort) => {
              if (antwort.ok) c.put(anfrage, antwort.clone());
              return antwort;
            }),
        ),
      ),
    );
    return;
  }

  if (anfrage.mode === 'navigate') {
    const vorhalten = VORHALTEN.some((r) => r.test(pfad)) || OFFLINE.includes(pfad);
    e.respondWith(
      fetch(anfrage)
        .then((antwort) => {
          if (vorhalten && antwort.ok) {
            const kopie = antwort.clone();
            caches.open(SEITEN).then((c) => c.put(pfad, kopie));
          }
          return antwort;
        })
        .catch(() => caches.match(pfad).then((vorrat) => vorrat || offlineSeite(pfad))),
    );
  }
});
