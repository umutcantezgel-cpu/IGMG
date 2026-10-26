/*
 * Service Worker der Lern-App (ADR 0037 Nr. 8, PLAN §3.5, Spike L0-S6): Scope `/lern-app/`, neben dem Root-Worker `/sw.js`
 * (Scope `/`). Der genauere Scope steuert die Lern-App-Seiten.
 * Vorräte nur mit dem Präfix `igmg-lernapp-` (der Root-Worker behält sie beim Aktivieren):
 * - `igmg-lernapp-schale-v<bau>`: Hülle – Seiten der Lern-App und /_next/static/** (Vorrat zuerst), höchstens 400 Einträge
 *   (die ältesten fallen heraus). `<bau>` ist die Bau-Kennung aus der Anmeldung (`/lern-app/sw.js?v=<bau>`): Ein neuer Bau ist
 *   ein neuer Worker. Auf Bitte der Seite (`{ art: 'schale', ui }`) hält er die Hülle der Oberflächensprache vor.
 * - `igmg-lernapp-kurse-v<bau>` (Stufe C N9a, Befund G-1): Seiten der Kurse, die jemand offline gespeichert hat (Lernpfad,
 *   Üben, Wiederholen, Tipps) samt aller Programmteile, auch der nachgeladenen – ein eigener Vorrat ohne Obergrenze, den das
 *   Stöbern in der Hülle nie verdrängt. Ein Merkzeichen je Kurs und Oberflächensprache (`…/<ui>/<kurs>?vorrat=vollstaendig`)
 *   sagt: alles da (Bitte `{ art: 'kurs', ui, kurs }`, Abfrage ohne Netz `{ art: 'kursStand', ui, kurs }`).
 * - Bauwechsel: Das Aktivieren eines neuen Workers löscht die Hülle des vorigen Baus, behält aber jeden älteren Kursvorrat mit
 *   Merkzeichen; der alte Worker, noch bei der Arbeit, legt seine gelöschten Vorräte nicht neu an (`aktuell`). Mit der nächsten
 *   Bitte um die Hülle (jede Seite beim Laden) holt der neue Worker diese Kurse tief neu in seinen Kursvorrat und löscht den
 *   alten erst, wenn alles da ist (`stelleKurseWiederHer`). Bis dahin liefert er ohne Netz die Seiten und Programmteile des
 *   alten Baus (in sich stimmig). Übergang von Workern vor N9a: Lag noch kein Kursvorrat vor, gilt ein Kurs, dessen vier
 *   Seiten in der alten Hülle liegen, als gespeichert.
 * - `igmg-lernapp-pakete`: Kursverzeichnis `/lern-app/pakete/<kurs>` Netz zuerst, Einheiten `…/<kurs>/<einheit>/<hash>`
 *   Vorrat zuerst (unveränderlich, ADR 0039).
 * - `igmg-lernapp-audio`: Bündel `/lern-app/audio/…`, Vorrat zuerst; Bereichsanfragen gehen ans Netz.
 * - `igmg-lernapp-modelle`: Whisper und ORT `/lern-app/modelle/…`, Vorrat zuerst (ADR 0042); als Originalantwort samt
 *   Kopfzeilen (COEP). Den Worker der Sprechübung (`…/modelle/sprechen/…?v=<bau>`) gibt es je Bau neu: Beim Vorhalten
 *   fallen ältere Fassungen derselben Datei weg. Die Lizenztexte neben den Gewichten (`…/LIZENZ-*.txt`, ADR 0042
 *   Fortschreibung Nr. 11) gehören nicht zum Vorrat; sie gehen ans Netz (Volltext auf der Seite „Quellen“).
 *   Die Drittlizenzen von ONNX Runtime (`/lern-app/lizenzen/…?v=<fassung>`, Z-L17) legt der Download der Sprachprüfung
 *   selbst in diesen Vorrat (`fuelleVorrat`, er räumt dabei ältere Fassungen weg); der Worker liefert sie von dort – Abgleich
 *   samt Suchteil, eine alte Fassung nie für eine neue Adresse –, sonst aus dem Netz (ohne sie vorzuhalten).
 * Seiten: Netz zuerst, gelungene Antworten in die Hülle – unter dem Pfad ohne Suchteil (`ignoreSearch`, z. B.
 * `…/ueben?l=…`); ohne Netz die Seite aus der Hülle, dem Kursvorrat oder einem älteren Bau, sonst der Start der
 * Oberflächensprache.
 * Nie vorgehalten: /api/**, /lern-app/<ui>/anmelden, RSC-Abrufe, alles außer GET, fremde Ursprünge.
 */
const PRAEFIX = 'igmg-lernapp-';
const BAU = (new URL(self.location.href).searchParams.get('v') || '1').replace(/[^a-z0-9]/g, '').slice(0, 12) || '1';
const SCHALE_PRAEFIX = `${PRAEFIX}schale-v`;
const KURSE_PRAEFIX = `${PRAEFIX}kurse-v`;
const SCHALE = `${SCHALE_PRAEFIX}${BAU}`;
const KURSE = `${KURSE_PRAEFIX}${BAU}`;
const PAKETE = `${PRAEFIX}pakete`;
const AUDIO = `${PRAEFIX}audio`;
const MODELLE = `${PRAEFIX}modelle`;
const DAUERHAFT = [PAKETE, AUDIO, MODELLE];
const OBERFLAECHEN = ['de', 'tr', 'ar'];
/** Kurse der Lern-App (wie `KURS_SLUGS` in `src/lib/lernapp/kurse.ts`, Unit-Test hält beide gleich) */
const KURS_SLUGS = ['tr-aus-de', 'ar-aus-de', 'de-aus-tr', 'ar-aus-tr', 'de-aus-ar', 'tr-aus-ar', 'islam', 'koran'];
/** Seiten der Hülle je Oberflächensprache (statisch, ohne Kurs) */
const SCHALEN_SEITEN = ['', '/fortschritt', '/wortschatz', '/einstellungen', '/quellen'];
/** Seiten eines Kurses für den Start ohne Netz (wie `bereiteOfflineVor`): Lernpfad, Üben, Wiederholen, Tipps */
const KURS_SEITEN = ['', '/ueben', '/wiederholen', '/tipps'];
/** Obergrenze der Hülle: älteste Einträge fallen heraus (nur die Hülle, nie der Kursvorrat) */
const GRENZE_SCHALE = 400;
/** Obergrenze der Programmteile je Bitte (Hülle bzw. Kurs) */
const GRENZE_DATEIEN = 600;

const istSeitePfad = (pfad) => /^\/lern-app\/(de|tr|ar)(\/[a-z0-9-]+)*$/.test(pfad);
const istAnmeldung = (pfad) => /^\/lern-app\/[^/]+\/anmelden(\/|$)/.test(pfad);
const istBauVorrat = (name) => name.startsWith(SCHALE_PRAEFIX) || name.startsWith(KURSE_PRAEFIX);
const istKurs = (ui, kurs) => OBERFLAECHEN.includes(ui) && KURS_SLUGS.includes(kurs);
const LERNPFAD = /^\/lern-app\/(de|tr|ar)\/([a-z0-9-]+)$/;
/** Merkzeichen „Seiten des Kurses vollständig im Kursvorrat“ (mit Suchteil: nie eine Seite) */
const MERK = '?vorrat=vollstaendig';
const merkzeichen = (ui, kurs) => `/lern-app/${ui}/${kurs}${MERK}`;
const ja = () => new Response('1', { headers: { 'content-type': 'text/plain' } });

/**
 * Ist dieser Worker noch der aktive seiner Registrierung? Nach einem Bauwechsel arbeitet der alte Worker begonnene Aufgaben zu
 * Ende (Hülle, Programmteile, Kursseiten). Dann schreibt er nicht mehr in seine Hülle und seinen Kursvorrat – ein
 * `caches.open` legte die beim Aktivieren des neuen Baus gelöschten Vorräte wieder an (so blieb die alte Hülle stehen, Stufe C
 * N9a, Nachprüfung G-1) – und löscht nichts: Die Vorräte des neuen Baus hielte er für ältere.
 */
function aktuell() {
  const aktiv = self.registration && self.registration.active;
  return !aktiv || aktiv.scriptURL === self.location.href;
}

/**
 * Hülle und Kursvorrat dieses Baus, je Laufzeit des Workers einmal geöffnet; für einen überholten Worker `null`. Was er noch in
 * einen schon geöffneten, inzwischen gelöschten Vorrat schreibt, bleibt folgenlos (die Cache-API legt ihn dafür nicht neu an).
 * Andere Vorräte wie bisher.
 */
const eigene = new Map();
function oeffne(name) {
  if (name !== SCHALE && name !== KURSE) return caches.open(name);
  if (!aktuell()) return Promise.resolve(null);
  if (!eigene.has(name)) eigene.set(name, caches.open(name));
  return eigene.get(name);
}

function begrenze(name) {
  return oeffne(name).then(
    (c) =>
      c &&
      c
        .keys()
        .then((schluessel) => Promise.all(schluessel.slice(0, Math.max(0, schluessel.length - GRENZE_SCHALE)).map((k) => c.delete(k)))),
  );
}

/** Speichert eine gelungene, eigene, vollständige Antwort (keine Teilantwort, keine Weiterleitung). */
function vorhalten(name, schluessel, antwort) {
  if (!antwort || !antwort.ok || antwort.status !== 200 || antwort.type !== 'basic' || antwort.redirected) return Promise.resolve();
  const kopie = antwort.clone();
  return oeffne(name)
    .then((c) => c && c.put(schluessel, kopie).then(() => (name === MODELLE ? alteFassungenWeg(c, schluessel) : undefined)))
    .then(() => (name === SCHALE ? begrenze(SCHALE) : undefined));
}

/** Worker der Sprechübung: andere Fassungen (anderer Suchteil `?v=`) derselben Datei aus dem Vorrat nehmen. */
function alteFassungenWeg(c, schluessel) {
  const neu = new URL(typeof schluessel === 'string' ? schluessel : schluessel.url, self.location.origin);
  if (!neu.pathname.startsWith('/lern-app/modelle/sprechen/')) return Promise.resolve();
  return c
    .keys()
    .then((alle) =>
      Promise.all(alle.filter((k) => new URL(k.url).pathname === neu.pathname && k.url !== neu.href).map((k) => c.delete(k))),
    );
}

/** Der erste Treffer in den genannten Vorräten, der Reihe nach. */
function ersterTreffer(anfrage, namen) {
  return namen.reduce((p, name) => p.then((a) => a || caches.match(anfrage, { cacheName: name })), Promise.resolve(undefined));
}

/** Hüllen und Kursvorräte älterer Bauten, der jüngste zuerst. */
function aeltereBauten() {
  return caches.keys().then((namen) => namen.filter((n) => istBauVorrat(n) && n !== SCHALE && n !== KURSE).reverse());
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

/**
 * Programmteile: Hülle und Kursvorrat dieses Baus, sonst Netz (in die Hülle); ohne Netz – oder wenn der Server die Datei
 * nicht mehr hat, etwa für eine noch offene Seite des vorigen Baus – die Kopie eines älteren Baus. Die Seiten eines älteren
 * Baus verweisen nur auf seine eigenen Programmteile (Inhalts-Hash im Namen).
 */
function programmteil(anfrage) {
  const ausAelterem = () => aeltereBauten().then((alte) => ersterTreffer(anfrage, alte));
  return ersterTreffer(anfrage, [SCHALE, KURSE]).then(
    (vorrat) =>
      vorrat ||
      fetch(anfrage).then(
        (antwort) => {
          if (!antwort.ok) return ausAelterem().then((alt) => alt || antwort);
          vorhalten(SCHALE, anfrage, antwort);
          return antwort;
        },
        (fehler) => ausAelterem().then((alt) => alt || Promise.reject(fehler)),
      ),
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

/** Seite ohne Netz: Kursvorrat dieses Baus, dann ältere Bauten (jüngster zuerst), sonst der Start der Oberflächensprache. */
function seiteOhneNetz(pfad, ui) {
  return caches
    .match(pfad, { cacheName: KURSE })
    .then((seite) => seite || aeltereBauten().then((alte) => ersterTreffer(pfad, alte)))
    .then((seite) => seite || caches.match(`/lern-app/${ui}`, { cacheName: SCHALE }))
    .then((seite) => seite || Response.error());
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

/**
 * Eine Datei bzw. Seite für den Vorrat `ziel` (Cache `c`): schon da, sonst eine Kopie aus der Hülle dieses Baus (gleiche
 * Fassung, kein Datenverbrauch), sonst aus dem Netz. Ergebnis: die Antwort aus dem Vorrat; `'fehlt'`, wenn der Server sie
 * nicht (mehr) hat (kein 200, Weiterleitung); `'netz'` ohne Verbindung.
 */
function holeInVorrat(c, ziel, schluessel, init) {
  return c.match(schluessel).then((da) => {
    if (da) return da;
    return (ziel !== SCHALE ? caches.match(schluessel, { cacheName: SCHALE }) : Promise.resolve(undefined)).then((kopie) => {
      if (kopie) return c.put(schluessel, kopie.clone()).then(() => kopie);
      return fetch(schluessel, init).then(
        (antwort) => {
          if (!antwort.ok || antwort.status !== 200 || antwort.redirected) return 'fehlt';
          return c
            .put(schluessel, antwort.clone())
            .then(() => (ziel === SCHALE ? begrenze(SCHALE) : undefined))
            .then(() => antwort);
        },
        () => 'netz',
      );
    });
  });
}

/**
 * Seiten der Lern-App in den Vorrat `ziel`: die Seiten und die Programmteile, die sie laden. Geholt wird nur, was dort noch
 * fehlt (die Seiten sind statisch je Bau) – kein Datenverbrauch bei jedem Seitenwechsel. `tief`: auch die nachgeladenen
 * Programmteile (Spieler, Übungstypen, lokale Datenbank), auf die die Programmteile der Seiten verweisen – damit eine Übung
 * ohne Netz startet. Ergebnis: `'vollstaendig'`, `'netz'` (etwas fehlt, ohne Verbindung) oder `'fehlt'` (der Server hat
 * etwas nicht).
 */
function halteSeitenVor(pfade, ziel, tief) {
  const stand = { netz: 0, fehlt: 0 };
  const zaehle = (x) => {
    if (x === 'netz' || x === 'fehlt') stand[x]++;
    return typeof x === 'string' ? null : x;
  };
  return oeffne(ziel)
    .then((c) => {
      // überholter Worker (ein neuerer Bau ist aktiv): nichts holen; die Seite fragt den neuen
      if (!c) {
        stand.netz++;
        return undefined;
      }
      return Promise.all(
        pfade.map((pfad) =>
          holeInVorrat(c, ziel, pfad, { credentials: 'same-origin' })
            .then(zaehle)
            .then((seite) => (seite ? seite.clone().text() : ''))
            .then((html) => [...new Set(html.match(/\/_next\/static\/[^"'\s)\\]+/g) || [])].filter(istProgrammteil))
            .catch(() => {
              stand.netz++;
              return [];
            }),
        ),
      ).then((listen) => {
        const gesehen = new Set();
        const offen = [...new Set(listen.flat())];
        const naechste = () => {
          const runde = offen.splice(0).filter((d) => !gesehen.has(d));
          if (!runde.length) return Promise.resolve();
          if (gesehen.size + runde.length > GRENZE_DATEIEN) {
            stand.fehlt++;
            return Promise.resolve();
          }
          for (const d of runde) gesehen.add(d);
          return Promise.all(
            runde.map((datei) =>
              holeInVorrat(c, ziel, datei)
                .then(zaehle)
                .then((antwort) =>
                  tief && antwort && datei.endsWith('.js')
                    ? antwort
                        .clone()
                        .text()
                        .then((text) => offen.push(...chunkVerweise(text)))
                    : undefined,
                )
                .catch(() => {
                  stand.netz++;
                }),
            ),
          ).then(naechste);
        };
        return naechste();
      });
    })
    .then(() => (stand.netz ? 'netz' : stand.fehlt ? 'fehlt' : 'vollstaendig'));
}

/** Hülle einer Oberflächensprache (Start, Fortschritt, Wortschatz, Einstellungen, Quellen); jede Seite bittet beim Laden darum. */
function halteSchaleVor(ui) {
  if (!OBERFLAECHEN.includes(ui)) return Promise.resolve();
  return halteSeitenVor(
    SCHALEN_SEITEN.map((rest) => `/lern-app/${ui}${rest}`),
    SCHALE,
    false,
  );
}

/** Ob die Seiten eines Kurses vollständig im Kursvorrat dieses Baus liegen (ohne Netz). */
function kursStand(ui, kurs) {
  if (!istKurs(ui, kurs)) return Promise.resolve('fehlt');
  return caches.match(merkzeichen(ui, kurs), { cacheName: KURSE }).then((da) => (da ? 'vollstaendig' : 'fehlt'));
}

/** Laufende Bitten je Kurs: zwei Seiten (oder Seite und Wiederherstellung) holen denselben Kurs nur einmal. */
const laufend = new Map();

/**
 * Seiten eines Kurses für den Start ohne Netz (nach „offline speichern“, ADR 0039 Nr. 12) in den Kursvorrat dieses Baus:
 * Lernpfad, Üben, Wiederholen, Tipps samt aller Programmteile; ist alles da, folgt das Merkzeichen. Nur Kurse der Lern-App
 * (nie die Anmeldung). Ergebnis wie `halteSeitenVor`.
 */
function halteKursVor(ui, kurs) {
  if (!istKurs(ui, kurs)) return Promise.resolve('fehlt');
  const k = `${ui}/${kurs}`;
  if (!laufend.has(k))
    laufend.set(
      k,
      kursStand(ui, kurs)
        .then((stand) =>
          stand === 'vollstaendig'
            ? stand
            : halteSeitenVor(
                KURS_SEITEN.map((teil) => `/lern-app/${ui}/${kurs}${teil}`),
                KURSE,
                true,
              ).then((neu) =>
                neu === 'vollstaendig' ? oeffne(KURSE).then((c) => (c ? c.put(merkzeichen(ui, kurs), ja()).then(() => neu) : 'netz')) : neu,
              ),
        )
        .catch(() => 'netz')
        .then((stand) => {
          laufend.delete(k);
          return stand;
        }),
    );
  return laufend.get(k);
}

/** Kurse mit Merkzeichen in einem Vorrat (nur lesen: ein inzwischen gelöschter Vorrat entsteht nicht neu). */
function kurseMitMerkzeichen(name) {
  return caches
    .has(name)
    .then((da) => (da ? caches.open(name).then((c) => c.keys()) : []))
    .then((schluessel) =>
      schluessel.flatMap((r) => {
        const u = new URL(r.url);
        const m = LERNPFAD.exec(u.pathname);
        return m && u.search === MERK && istKurs(m[1], m[2]) ? [{ ui: m[1], kurs: m[2] }] : [];
      }),
    );
}

/**
 * Behält ein älterer Bau-Vorrat Kurse für die Wiederherstellung? Kursvorrat: wenn er Merkzeichen hat. Hülle: nur im Übergang
 * von Workern vor N9a (`uebergang`, noch kein älterer Kursvorrat) – dann bekommt jeder Kurs, dessen vier Seiten dort liegen,
 * ein Merkzeichen.
 */
function behalten(name, uebergang) {
  if (name.startsWith(KURSE_PRAEFIX)) return kurseMitMerkzeichen(name).then((kurse) => kurse.length > 0);
  if (!uebergang) return Promise.resolve(false);
  return caches.open(name).then((c) =>
    c.keys().then((schluessel) => {
      const pfade = new Set(schluessel.map((r) => new URL(r.url).pathname));
      const kurse = [...pfade].flatMap((p) => {
        const m = LERNPFAD.exec(p);
        return m && istKurs(m[1], m[2]) && KURS_SEITEN.every((teil) => pfade.has(`${p}${teil}`)) ? [m] : [];
      });
      return Promise.all(kurse.map((m) => c.put(merkzeichen(m[1], m[2]), ja()))).then(() => kurse.length > 0);
    }),
  );
}

let wiederherstellung = null;

/**
 * Nach einem Bauwechsel: die Kurse aus älteren Bauten (Merkzeichen) tief in den Kursvorrat dieses Baus holen; ein älterer
 * Vorrat geht erst, wenn alle seine Kurse da sind (oder der Server sie nicht mehr hat). Ohne Verbindung bleibt er – ohne Netz
 * liefert er weiter Seiten und Programmteile – und die nächste Seite versucht es erneut.
 */
function stelleKurseWiederHer() {
  if (!aktuell()) return Promise.resolve();
  if (!wiederherstellung)
    wiederherstellung = aeltereBauten()
      .then((alte) =>
        alte.reduce(
          (kette, name) =>
            kette.then(() =>
              kurseMitMerkzeichen(name)
                .then((kurse) =>
                  kurse.reduce(
                    (fertig, { ui, kurs }) => fertig.then((ok) => halteKursVor(ui, kurs).then((stand) => ok && stand !== 'netz')),
                    Promise.resolve(true),
                  ),
                )
                .then((fertig) => (fertig && aktuell() ? caches.delete(name) : undefined)),
            ),
          Promise.resolve(),
        ),
      )
      .catch(() => undefined)
      .then(() => {
        wiederherstellung = null;
      });
  return wiederherstellung;
}

/** Ältere Seiten (vor N9a) bitten mit `{ art: 'seiten', pfade }`: der Kurs aus dem Lernpfad in der Liste. */
function kursAusPfaden(pfade) {
  for (const p of Array.isArray(pfade) ? pfade : []) {
    const m = typeof p === 'string' ? LERNPFAD.exec(p) : null;
    if (m && istKurs(m[1], m[2])) return { ui: m[1], kurs: m[2] };
  }
  return null;
}

// Der Kursvorrat entsteht schon beim Installieren: Beim nächsten Bauwechsel zeigt er, dass dieser Worker kein Übergang von
// einem Worker vor N9a mehr ist (`behalten`), auch wenn nie etwas gespeichert wurde
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(SCHALE)
      .then(() => caches.open(KURSE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((namen) => {
        const uebergang = !namen.some((n) => n.startsWith(KURSE_PRAEFIX) && n !== KURSE);
        return Promise.all(
          namen
            .filter((n) => n.startsWith(PRAEFIX) && n !== SCHALE && n !== KURSE && !DAUERHAFT.includes(n))
            .map((n) =>
              (istBauVorrat(n) ? behalten(n, uebergang).catch(() => false) : Promise.resolve(false)).then((bleibt) =>
                bleibt ? undefined : caches.delete(n),
              ),
            ),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (e) => {
  const daten = e.data || {};
  const port = e.ports && e.ports[0];
  const antworte = (inhalt) => port && port.postMessage({ fertig: true, ...inhalt });
  const ui = String(daten.ui);
  const kurs = String(daten.kurs);
  if (daten.art === 'schale')
    e.waitUntil(
      halteSchaleVor(ui)
        .then(stelleKurseWiederHer)
        .then(
          () => antworte({}),
          () => antworte({}),
        ),
    );
  else if (daten.art === 'kurs') e.waitUntil(halteKursVor(ui, kurs).then((stand) => antworte({ stand })));
  else if (daten.art === 'kursStand')
    e.waitUntil(
      kursStand(ui, kurs).then(
        (stand) => antworte({ stand }),
        () => antworte({ stand: 'fehlt' }),
      ),
    );
  else if (daten.art === 'seiten') {
    const k = kursAusPfaden(daten.pfade);
    e.waitUntil((k ? halteKursVor(k.ui, k.kurs) : Promise.resolve('fehlt')).then((stand) => antworte({ stand })));
  }
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
    e.respondWith(programmteil(anfrage));
    return;
  }
  if (pfad.startsWith('/lern-app/pakete/')) {
    const teile = pfad.split('/').filter(Boolean);
    // /lern-app/pakete/<kurs> und /lern-app/pakete/koran/<sprache> = Verzeichnis (Netz zuerst); tiefer = unveränderliches
    // Einheitenpaket (Vorrat zuerst)
    const verzeichnis = teile.length <= 3 || (teile[2] === 'koran' && teile.length === 4);
    e.respondWith(verzeichnis ? netzZuerst(anfrage, PAKETE, anfrage) : vorratZuerst(anfrage, PAKETE));
    return;
  }
  if (pfad.startsWith('/lern-app/audio/')) {
    e.respondWith(vorratZuerst(anfrage, AUDIO));
    return;
  }
  if (pfad.startsWith('/lern-app/modelle/')) {
    if (!/\/LIZENZ-[^/]+\.txt$/.test(pfad)) e.respondWith(vorratZuerst(anfrage, MODELLE));
    return;
  }
  if (pfad.startsWith('/lern-app/lizenzen/')) {
    // ohne `ignoreSearch`: Die Fassung (`?v=`) gehört zum Schlüssel
    e.respondWith(caches.match(anfrage, { cacheName: MODELLE }).then((vorrat) => vorrat || fetch(anfrage)));
    return;
  }
  if (anfrage.mode === 'navigate' && istSeitePfad(pfad)) {
    const ui = pfad.split('/')[2];
    e.respondWith(netzZuerst(anfrage, SCHALE, pfad).catch(() => seiteOhneNetz(pfad, ui)));
  }
});
