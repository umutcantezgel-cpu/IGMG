/*
 * Service Worker der Lern-App (ADR 0037 Nr. 8, PLAN §3.5, Spike L0-S6): Scope `/lern-app/`, neben dem Root-Worker `/sw.js`
 * (Scope `/`). Der genauere Scope steuert die Lern-App-Seiten.
 * Vorräte nur mit dem Präfix `igmg-lernapp-` (der Root-Worker behält sie beim Aktivieren):
 * - `igmg-lernapp-schale-v<bau>`: Hülle – Seiten der Lern-App und /_next/static/** (Vorrat zuerst). `<bau>` ist die
 *   Bau-Kennung aus der Anmeldung (`/lern-app/sw.js?v=<bau>`): Ein neuer Bau ist ein neuer Worker, sein Aktivieren löscht
 *   die Hülle des vorigen Baus. Auf Bitte der Seite (`{ art: 'schale', ui }`) hält er die Hülle der Oberflächensprache vor.
 * - `igmg-lernapp-pakete`: Kursverzeichnis `/lern-app/pakete/<kurs>` Netz zuerst, Einheiten `…/<kurs>/<einheit>/<hash>`
 *   Vorrat zuerst (unveränderlich, ADR 0039).
 * - `igmg-lernapp-audio`: Bündel `/lern-app/audio/…`, Vorrat zuerst; Bereichsanfragen gehen ans Netz.
 * - `igmg-lernapp-modelle`: Whisper und ORT `/lern-app/modelle/…`, Vorrat zuerst (ADR 0042).
 * Seiten: Netz zuerst, gelungene Antworten in die Hülle – unter dem Pfad ohne Suchteil (`ignoreSearch`, z. B.
 * `…/ueben?l=…`); ohne Netz die vorgehaltene Seite, sonst der Start der Oberflächensprache.
 * Nie vorgehalten: /api/**, /lern-app/<ui>/anmelden, RSC-Abrufe, alles außer GET, fremde Ursprünge.
 */
const PRAEFIX = 'igmg-lernapp-';
const BAU = (new URL(self.location.href).searchParams.get('v') || '1').replace(/[^a-z0-9]/g, '').slice(0, 12) || '1';
const SCHALE = `${PRAEFIX}schale-v${BAU}`;
const PAKETE = `${PRAEFIX}pakete`;
const AUDIO = `${PRAEFIX}audio`;
const MODELLE = `${PRAEFIX}modelle`;
const DAUERHAFT = [PAKETE, AUDIO, MODELLE];
const OBERFLAECHEN = ['de', 'tr', 'ar'];
/** Seiten der Hülle je Oberflächensprache (statisch, ohne Kurs) */
const SCHALEN_SEITEN = ['', '/fortschritt', '/wortschatz', '/einstellungen', '/quellen'];
/** Obergrenze der Hülle: älteste Einträge fallen heraus */
const GRENZE_SCHALE = 400;

const istSeitePfad = (pfad) => /^\/lern-app\/(de|tr|ar)(\/[a-z0-9-]+)*$/.test(pfad);
const istAnmeldung = (pfad) => /^\/lern-app\/[^/]+\/anmelden(\/|$)/.test(pfad);

function begrenze(name) {
  return caches
    .open(name)
    .then((c) =>
      c
        .keys()
        .then((schluessel) => Promise.all(schluessel.slice(0, Math.max(0, schluessel.length - GRENZE_SCHALE)).map((k) => c.delete(k)))),
    );
}

/** Speichert eine gelungene, eigene, vollständige Antwort (keine Teilantwort, keine Weiterleitung). */
function vorhalten(name, schluessel, antwort) {
  if (!antwort || !antwort.ok || antwort.status !== 200 || antwort.type !== 'basic' || antwort.redirected) return Promise.resolve();
  const kopie = antwort.clone();
  return caches
    .open(name)
    .then((c) => c.put(schluessel, kopie))
    .then(() => (name === SCHALE ? begrenze(SCHALE) : undefined));
}

/** Vorrat zuerst, sonst Netz (und vorhalten). */
function vorratZuerst(anfrage, name) {
  return caches.match(anfrage, { cacheName: name }).then(
    (vorrat) =>
      vorrat ||
      fetch(anfrage).then((antwort) => {
        vorhalten(name, anfrage, antwort);
        return antwort;
      }),
  );
}

/** Netz zuerst (und vorhalten), ohne Netz der Vorrat. */
function netzZuerst(anfrage, name, schluessel) {
  return fetch(anfrage)
    .then((antwort) => {
      vorhalten(name, schluessel, antwort);
      return antwort;
    })
    .catch(() => caches.match(schluessel, { cacheName: name }).then((vorrat) => vorrat || Promise.reject(new Error('offline'))));
}

/** Hülle einer Oberflächensprache vorhalten: die Seiten und die Programmteile, die sie laden. */
function halteSchaleVor(ui) {
  if (!OBERFLAECHEN.includes(ui)) return Promise.resolve();
  return caches.open(SCHALE).then((c) =>
    Promise.all(
      SCHALEN_SEITEN.map((rest) => {
        const pfad = `/lern-app/${ui}${rest}`;
        return fetch(pfad, { credentials: 'same-origin' })
          .then((antwort) => {
            if (!antwort.ok || antwort.redirected) return [];
            return c
              .put(pfad, antwort.clone())
              .then(() => antwort.text())
              .then((html) => [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])]);
          })
          .catch(() => []);
      }),
    ).then((listen) => {
      const dateien = [...new Set(listen.flat())].slice(0, 200);
      return Promise.all(
        dateien.map((datei) =>
          c.match(datei).then(
            (da) =>
              da ||
              fetch(datei)
                .then((antwort) => vorhalten(SCHALE, datei, antwort))
                .catch(() => undefined),
          ),
        ),
      );
    }),
  );
}

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

self.addEventListener('message', (e) => {
  const daten = e.data || {};
  if (daten.art === 'schale') e.waitUntil(halteSchaleVor(String(daten.ui)));
});

self.addEventListener('fetch', (e) => {
  const anfrage = e.request;
  if (anfrage.method !== 'GET') return;
  const url = new URL(anfrage.url);
  if (url.origin !== self.location.origin) return;
  const pfad = url.pathname;
  if (pfad.startsWith('/api/') || istAnmeldung(pfad)) return;
  // RSC-Abrufe des Routers und Bereichsanfragen (Audio-Scheiben) nie aus dem Vorrat
  if (url.searchParams.has('_rsc') || anfrage.headers.get('RSC') || anfrage.headers.get('Range')) return;

  if (pfad.startsWith('/_next/static/')) {
    e.respondWith(vorratZuerst(anfrage, SCHALE));
    return;
  }
  if (pfad.startsWith('/lern-app/pakete/')) {
    const teile = pfad.split('/').filter(Boolean);
    // /lern-app/pakete/<kurs> = Verzeichnis (Netz zuerst); tiefer = unveränderliches Einheitenpaket (Vorrat zuerst)
    e.respondWith(teile.length <= 3 ? netzZuerst(anfrage, PAKETE, anfrage) : vorratZuerst(anfrage, PAKETE));
    return;
  }
  if (pfad.startsWith('/lern-app/audio/')) {
    e.respondWith(vorratZuerst(anfrage, AUDIO));
    return;
  }
  if (pfad.startsWith('/lern-app/modelle/')) {
    e.respondWith(vorratZuerst(anfrage, MODELLE));
    return;
  }
  if (anfrage.mode === 'navigate' && istSeitePfad(pfad)) {
    const ui = pfad.split('/')[2];
    e.respondWith(
      netzZuerst(anfrage, SCHALE, pfad).catch(() =>
        caches.match(`/lern-app/${ui}`, { cacheName: SCHALE }).then((start) => start || Response.error()),
      ),
    );
  }
});
