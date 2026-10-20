/*
 * Service Worker der Lern-App (ADR 0037 Nr. 8, PLAN §3.5, Spike L0-S6): Scope `/lern-app/`, neben dem Root-Worker `/sw.js`
 * (Scope `/`). Der genauere Scope steuert die Lern-App-Seiten.
 * Vorräte nur mit dem Präfix `igmg-lernapp-` (der Root-Worker behält sie beim Aktivieren):
 * - `igmg-lernapp-schale-v<bau>`: Hülle – Seiten der Lern-App und /_next/static/** (Vorrat zuerst). `<bau>` ist die
 *   Bau-Kennung aus der Anmeldung (`/lern-app/sw.js?v=<bau>`): Ein neuer Bau ist ein neuer Worker, sein Aktivieren löscht
 *   die Hülle des vorigen Baus. Auf Bitte der Seite (`{ art: 'schale', ui }`) hält er die Hülle der Oberflächensprache vor,
 *   nach „Einheit offline speichern“ (`{ art: 'seiten', pfade }`) die Seiten des Kurses samt Programmteilen.
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

/**
 * Nur echte Programmteile unter `/_next/static/`: ohne `..` (auch nicht kodiert) und ohne Backslash. Sonst holte ein Verweis
 * wie `/_next/static/../../api/…` aus dem HTML beliebige eigene GET-Antworten in die Hülle (S-L1 N-5).
 */
function istProgrammteil(datei) {
  if (typeof datei !== 'string' || /\.\.|%2e|%2f|%5c|\\/i.test(datei)) return false;
  try {
    const u = new URL(datei, self.location.origin);
    return u.origin === self.location.origin && u.pathname.startsWith('/_next/static/');
  } catch {
    return false;
  }
}

/** Programmteile, auf die ein Programmteil verweist (nachgeladene Chunks: `static/chunks/<name>.js`). */
const CHUNK_VERWEIS = /(?:\/_next\/)?static\/chunks\/[A-Za-z0-9_.~-]+\.js/g;
const chunkVerweise = (text) =>
  [...new Set(text.match(CHUNK_VERWEIS) || [])].map((t) => (t.startsWith('/_next/') ? t : `/_next/${t}`)).filter(istProgrammteil);
/** Obergrenze der Programmteile je Bitte */
const GRENZE_DATEIEN = 300;

/** Eine Datei aus der Hülle oder aus dem Netz (dann vorgehalten); `null` ohne beides. */
function dateiHolen(c, datei) {
  if (!istProgrammteil(datei)) return Promise.resolve(null);
  return c.match(datei).then(
    (da) =>
      da ||
      fetch(datei)
        .then((antwort) => vorhalten(SCHALE, datei, antwort).then(() => (antwort.ok ? c.match(datei) : null)))
        .catch(() => null),
  );
}

/**
 * Seiten der Lern-App vorhalten: die Seiten und die Programmteile, die sie laden. Geholt wird nur, was in der Hülle dieses
 * Baus noch fehlt (die Seiten sind statisch je Bau, aufgefrischt werden sie beim Besuch „Netz zuerst“) – kein
 * Datenverbrauch bei jedem Seitenwechsel. `tief`: auch die nachgeladenen Programmteile (Spieler, Übungstypen, lokale
 * Datenbank), auf die die Programmteile der Seiten verweisen – damit eine Übung ohne Netz startet.
 */
function halteSeitenVor(pfade, tief = false) {
  return caches.open(SCHALE).then((c) =>
    Promise.all(
      pfade.map((pfad) =>
        c.match(pfad).then((da) =>
          (da
            ? da.clone().text()
            : fetch(pfad, { credentials: 'same-origin' }).then((antwort) => {
                if (!antwort.ok || antwort.redirected) return '';
                return c.put(pfad, antwort.clone()).then(() => antwort.text());
              })
          )
            .then((html) => [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])].filter(istProgrammteil))
            .catch(() => []),
        ),
      ),
    ).then((listen) => {
      const gesehen = new Set();
      const offen = [...new Set(listen.flat())];
      const naechste = () => {
        const runde = offen.splice(0).filter((d) => !gesehen.has(d) && gesehen.size < GRENZE_DATEIEN);
        if (!runde.length) return Promise.resolve();
        for (const d of runde) gesehen.add(d);
        return Promise.all(
          runde.map((datei) =>
            dateiHolen(c, datei).then((antwort) =>
              tief && antwort && datei.endsWith('.js') ? antwort.text().then((text) => offen.push(...chunkVerweise(text))) : undefined,
            ),
          ),
        ).then(naechste);
      };
      return naechste();
    }),
  );
}

/** Hülle einer Oberflächensprache (Start, Fortschritt, Wortschatz, Einstellungen, Quellen); jede Seite bittet beim Laden darum. */
function halteSchaleVor(ui) {
  if (!OBERFLAECHEN.includes(ui)) return Promise.resolve();
  return halteSeitenVor(SCHALEN_SEITEN.map((rest) => `/lern-app/${ui}${rest}`));
}

/**
 * Seiten eines Kurses für den Start ohne Netz (nach „Einheit offline speichern“, ADR 0039 Nr. 12): nur Seiten der Lern-App
 * (nie die Anmeldung), höchstens zehn je Bitte, samt nachgeladenen Programmteilen. Die Antwort über den Kanal sagt der
 * Seite, dass alles vorgehalten ist.
 */
function halteKursVor(pfade) {
  const gueltig = (Array.isArray(pfade) ? pfade : [])
    .filter((p) => typeof p === 'string' && istSeitePfad(p) && !istAnmeldung(p))
    .slice(0, 10);
  return halteSeitenVor(gueltig, true);
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
  const antworte = () => e.ports && e.ports[0] && e.ports[0].postMessage({ fertig: true });
  if (daten.art === 'schale') e.waitUntil(halteSchaleVor(String(daten.ui)).then(antworte));
  else if (daten.art === 'seiten') e.waitUntil(halteKursVor(daten.pfade).then(antworte, antworte));
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
