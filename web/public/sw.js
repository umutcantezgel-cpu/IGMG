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
const VORHALTEN = [/^\/(tr\/|en\/)?(gebetszeiten|namaz-vakitleri|prayer-times)(\/(anzeige|ekran|display))?\/?$/, /^\/(tr|en)?\/?$/];

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
  if (pfad.startsWith('/verwaltung') || pfad.startsWith('/api/') || pfad.startsWith('/medien/') || /^\/(tr|en)\/verwaltung/.test(pfad))
    return;

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

/*
 * Web Push (ADR 0034): Die Nachricht trägt nur Art, Gebet und Uhrzeit – nie Namen oder Inhalte (S-16). Den Wortlaut
 * holt der Worker aus /api/push/texte/<sprache> (statisch, vorgehalten). Ein Tipp öffnet die passende Seite.
 */
const TEXTE = `${VERSION}-push-texte`;
const ZIELE = { gebet: { de: '/gebetszeiten', tr: '/tr/namaz-vakitleri', en: '/en/prayer-times' } };

function sprachePruefen(s) {
  return s === 'tr' || s === 'en' ? s : 'de';
}

function texteLaden(sprache) {
  const adresse = `/api/push/texte/${sprache}`;
  return caches.open(TEXTE).then((c) =>
    fetch(adresse)
      .then((antwort) => {
        if (antwort.ok) c.put(adresse, antwort.clone());
        return antwort.json();
      })
      .catch(() => c.match(adresse).then((vorrat) => (vorrat ? vorrat.json() : null))),
  );
}

function fuelle(vorlage, werte) {
  return String(vorlage).replace(/\{(\w+)\}/g, (_, k) => (k in werte ? String(werte[k]) : ''));
}

self.addEventListener('push', (e) => {
  let daten = {};
  try {
    daten = e.data ? e.data.json() : {};
  } catch {
    daten = {};
  }
  const sprache = sprachePruefen(daten.sprache);
  e.waitUntil(
    texteLaden(sprache).then((t) => {
      t = t || {};
      let titel = t.probe || 'IGMG Wetzlar';
      let text = t.probeText || '';
      let ziel = ZIELE.gebet[sprache];
      if (daten.art === 'gebet') {
        const name = (t.gebete && t.gebete[daten.gebet]) || daten.gebet;
        titel = daten.minuten > 0 ? fuelle(t.gebetVorher, { gebet: name, minuten: daten.minuten }) : fuelle(t.gebetJetzt, { gebet: name });
        text = fuelle(t.gebetText, { gebet: name, zeit: daten.zeit });
      } else if (daten.art === 'ankuendigung' || daten.art === 'chat' || daten.art === 'unterricht') {
        titel = t[daten.art] || titel;
        text = t[`${daten.art}Text`] || '';
        if (typeof daten.pfad === 'string' && daten.pfad.startsWith('/')) ziel = daten.pfad;
      }
      return self.registration.showNotification(titel, {
        body: text,
        icon: '/symbole/symbol-192.png',
        badge: '/symbole/symbol-192.png',
        tag: daten.art === 'gebet' ? `gebet-${daten.gebet}` : daten.art || 'igmg',
        lang: sprache,
        data: { ziel },
      });
    }),
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const ziel = (e.notification.data && e.notification.data.ziel) || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenster) => {
      for (const f of fenster) {
        if (new URL(f.url).pathname === ziel && 'focus' in f) return f.focus();
      }
      return self.clients.openWindow(ziel);
    }),
  );
});
