<!-- Entwurf des zweiten Planungs-Agenten (16.10.2026); maßgeblich ist _lernapp/PLAN.md. Arabische Schrift entfernt. -->

# Plan „Lern-App“ für IGMG Wetzlar: Sprachen de/tr/ar (A1–C1), hanafitisches Wissen und Koran-Arabisch

## 0 Kurzfassung

- **Eigener Bereich:** Die Lern-App liegt unter `/lern-app/{de|tr|ar}/…` und hat ein eigenes Wurzel-Layout außerhalb von `[locale]`. Arabisch mit voller RTL-Darstellung gibt es nur dort. Das next-intl-Routing der Website bleibt bei de/tr/en, die 1.887 vorgerenderten Seiten bleiben unberührt. Die App ist eine eigene installierbare PWA (Scope `/lern-app/`) mit eigenem Service Worker.
- **Lokal zuerst:** Fortschritt, Wiederholungskarten (FSRS über `ts-fsrs`), XP, Serie und Abzeichen stehen als **Ereignisprotokoll** in IndexedDB (`idb`). Die App ist ohne Konto voll nutzbar. Mit Konto, Einwilligung und Schalter wird synchronisiert: Die Ereignisse werden vereinigt, der Zustand entsteht durch deterministisches Nachspielen. So entstehen keine Konflikte.
- **Inhalte:**
  - Je Zielsprache gibt es einen Korpus (A1–C1: 72 Einheiten, ≈ 6.500 Lemmata, ≈ 26.000 Sätze), den beide Ausgangssprachen gemeinsam nutzen.
  - Übersetzungen, angenommene Antworten und kontrastive Tipps gibt es je Richtung.
  - KI-Entwürfe entstehen über Workflow-Agenten gegen JSON-Schemas. Danach folgen harte Prüfer, eine Gegenprüfung und muttersprachliche Stichproben in der Verwaltung.
- **Auslieferung:** Kurspakete sind versionierte JSON-Dateien je Richtung und Einheit, adressiert über einen Inhalts-Hash und daher unveränderlich. Sie entstehen aus der Datenbank. Das Audio liegt als Einheiten-Bündel (`.lpa`) in Vercel Blob und wird über eine eigene Route ausgeliefert. TTS entsteht beim Import (Piper), nie im Vercel-Bau.
- **Islamisches Wissen:**
  - Nur auf Deutsch, hanafitisch und maturiditisch, aus gepinnten Quellen mit Beleg je Aussage.
  - Sichtbar erst, wenn **zwei** Personen mit `religioese_pruefung` jeden Baustein freigegeben haben. Die Freigabe ist an den Inhalts-Hash gebunden, schließt die Verfasser aus und lässt sich nicht über die Administration ersetzen.
  - Koran-Arabisch zeigt nur freigegebene Wortbedeutungen und nutzt keine TTS.
- **Sprechen und Schreiben:** Sprechen läuft über Whisper im Browser, in einem Worker, mit Modellen vom eigenen Ursprung und nur nach Zustimmung. Schreiben auf C1 bietet Rubrik, Musterantwort, Selbsteinschätzung und optional eine Lehrkraft.
- **Spielelemente:** Sanft, ohne Herzen und ohne Schuldgefühle. Eine Rangliste gibt es nur in Gruppen von Erwachsenen, nur auf Wunsch, nie für Kinder.
- **Ablauf:** Etappen L0–L8. Höchstens 2 Code-Agenten arbeiten gleichzeitig in Arbeitsbäumen. Inhalts-Agenten (ohne Bau) können bis zu 6 gleichzeitig laufen.

---

## 1 Befunde im Bestand, die den Plan prägen

| # | Befund | Datei(en) | Folge für den Plan |
|---|---|---|---|
| 1 | Sprachen fest de/tr/en, `as-needed`, keine Erkennung; `request.ts` prüft `hasLocale` → `notFound` | `web/src/i18n/routing.ts`, `web/src/i18n/request.ts` | `ar` **nicht** in `routing.locales` aufnehmen; eigene Wurzel `/lern-app/[ui]` mit eigener Textladung |
| 2 | Der Proxy schreibt jede Adresse ohne Präfix über next-intl auf `/de/…` um | `web/src/proxy.ts` | Früher Bypass für `/lern-app` und Weiterleitung `/(tr\|en)/lern-app…` |
| 3 | Das Wurzel-Layout meldet den Root-SW an; öffentliche Seiten laden kein next-intl im Client | `web/src/app/[locale]/layout.tsx`, `tests/unit/bundle-regeln.test.ts` | Eigene SW-Anmeldung; Texte gehen als Props oder als kleines Wörterbuch an den Client |
| 4 | Der SW (Scope `/`) löscht beim Aktivieren alle Caches außer `igmg-v1-*` und `igmg-koran-v1` | `web/public/sw.js` | Caches heißen ja je Ursprung → Ausnahme `igmg-lernapp-*` im Root-SW **zwingend** |
| 5 | Manifest mit Scope `/` | `web/src/app/manifest.ts` | Eigenes Manifest je UI-Sprache mit `scope: /lern-app/` und eigener `id` |
| 6 | CSP ohne `'wasm-unsafe-eval'`, `worker-src 'self'`, `media-src 'self'`; Mikrofon nur `/verwaltung/rezitationen` | `web/src/lib/sicherheit/header.ts`, `web/next.config.ts` | Eigene Header-Regel für `/lern-app/:pfad*` (WASM, Blob-Medien, Mikrofon) |
| 7 | Arabische Schrift ist nur in `web/daten/**`, `alphabet.ts`, Tests und zwei Dateien erlaubt | `_gemeinde/werkzeuge/religion-pruefung.mjs` | Begründete Ausnahmen für arabische UI-Texte und MSA-Inhalte **plus** neuer Formel- und Koran-n-Gramm-Wächter |
| 8 | Freigabe kennt genau **eine** Prüfung (Vier-Augen) | `web/src/lib/religioes/freigabe.ts`, `web/src/server/actions/freigaben.ts`, Tabelle `freigabe` in `schema/cms.ts` | Neue Zwei-Prüfer-Logik, an den Inhalts-Hash gebunden; Freigaben-Warteschlange erweitern |
| 9 | Die Administration darf alles außer `NIE_PER_ADMINISTRATION`; keine Sprachprüf-Rolle | `web/src/lib/rechte/matrix.ts`, Enum `rolle` in `schema/typen.ts` | Rolle `sprachpruefung`, neue Aktionen; `lernapp.religioes.pruefen` in `NIE_PER_ADMINISTRATION`. Den Enum-Wert in einer **eigenen** Migration ergänzen (Hinweis PG16/17 in `tests/e2e/LIESMICH.md` 1a) |
| 10 | Tabelle `aufgabe` (Hausaufgabe mit `AufgabeBezug`) samt `aufgabe_erledigt` hat **keine** Oberfläche | `web/src/lib/db/schema/lernen.ts` | Zuweisungen der Lern-App als `bezug = { art: 'lernapp', … }`; Lehrkraft-Oberfläche entsteht neu |
| 11 | Elifbe: Codepunkte, Formen, Züge (B-17), Übungen (B-18), Weg (B-24); Enum enthält `hoeren`, die Logik nur 4 Arten | `web/src/lib/elifbe/{alphabet,uebung,zuege,schreibweg,silben}.ts`, `web/src/components/website/elifbe/*` | Schrift-Einheit Arabisch nutzt dies direkt (`bewerteSpur`, `Schreibweg.tsx`, `Weg.tsx`) |
| 12 | Koran: `quran_wortform.vorkommen`, `quran_wort`, `quran_wortbedeutung(_ort)` mit Freigabe, `quran_wortzeit` | `web/src/lib/db/schema/quran.ts` | Koran-Arabisch-Pfad nur über Verweise; Häufigkeitsliste für die Hoca-Arbeitsliste |
| 13 | Audio: Magic-Byte-Prüfung, WebM-Dauer, Route mit Range (L2-E06), Werkstatt-Komponenten | `web/src/lib/audio/{format,webm,speicher}.ts`, `web/src/app/audio/[...pfad]/route.ts`, `web/src/components/verwaltung/rezitationen/*` | Audio-Route und Audio-Studio nach diesem Muster |
| 14 | Schalter: `FUNKTIONEN`, `IN_PRODUKTION_AN`, `MIT_PERSONENDATEN` | `web/src/lib/funktionen-regeln.ts`, `web/src/lib/validierung/einstellungen.ts` | Neue Schalter `lernapp*` |
| 15 | Bau: Migration, `inhalte-import.ts`, `next build`; ohne DB PGlite (Beispielmodus, Cache „dauerhaft“) | `web/scripts/vercel-bau.mjs`, `web/scripts/bau-datenbank.mjs`, ADR 0017/0019 | Lern-App-Import gleich einhängen (idempotent per SHA); Pakete im Beispielmodus vorrendern |
| 16 | `Mehrsprachig = { de, tr?, en? }` | `web/src/lib/db/schema/typen.ts` | Eigener Typ `LernText = Partial<Record<'de'\|'tr'\|'ar', string>>` |
| 17 | Ressourcen: 4 Kerne, **7,0 GB frei** (gemessen am 16.10.2026, nicht 10 GB) | – | Werkzeuge und Modelle im Scratchpad, Audio direkt nach Blob, `.next` der Arbeitsbäume nach dem Merge löschen |
| 18 | Prüfinfrastruktur: vitest unit/integration (PGlite je Datei), Playwright telefon/desktop, `scripts/messen.mjs` (180 KB), Regeltests | `web/vitest.config.mts`, `web/playwright.config.ts`, `web/tests/unit/{bundle,bewegung}-regeln.test.ts` | Lern-App-Projekte und Messrouten ergänzen |

---

## 2 Entscheidungen und ADRs

**Werkstatt des neuen Laufs:** `_lernapp/` mit AUFTRAG (dieser Plan), KERN (gilt zusätzlich zu `_gemeinde/KERN.md`), PLAN, STATUS, PRUEFPUNKT, ABNAHME, MENSCHEN, ENTSCHEIDUNGEN, berichte, protokolle, werkzeuge. Dazu kommen ein CLAUDE.md-Block und der Eintrag `_lernapp` in `.vercelignore`. Gearbeitet wird auf einem neuen Branch ab `main`, nach dem ABSCHLUSS der Gemeinde-Plattform. Fast-Forward nach `main` gilt wie L2-E02.

**`_lernapp/ENTSCHEIDUNGEN.md`:** L3-E01…L3-E09 übernehmen die neun Nutzerentscheidungen wörtlich. L3-E10 regelt die Arbeitsweise (höchstens 2 Code-Agenten, Inhalts-Workflows parallel).

| ADR | Titel | Kern |
|---|---|---|
| 0037 | Lern-App: Bereich, Wurzel-Layout, UI-Sprachen de/tr/ar | `/lern-app/[ui]`, Proxy-Bypass, RTL, Manifest und SW je Scope; Abgrenzung zu ADR 0016/K-02 |
| 0038 | Offline-first und Synchronisation | IndexedDB, Ereignisprotokoll, FSRS-Nachspielen, Zusammenführungsregeln, Uhrzeit-Klemme |
| 0039 | Kurspakete und Lern-Audio | Hash-Adressen, Bündel `.lpa`, Blob `lernapp`, Route mit `immutable`, Paketbau aus der DB |
| 0040 | **KI-Regel 2** (schreibt ADR 0030 Nr. 4 fort) | KI-Entwürfe erlaubt für Sprachinhalte (auch MSA-Arabisch) und deutsche Islam-Lektionen nur aus gepinnten hanafitischen Quellen mit Beleg; Zwei-Personen-Freigabe. Weiterhin verboten: Verse, Hadithe und Bittgebete auf Arabisch, Übersetzungen von Versen und Hadithen, Koran-Wortbedeutungen, Tajwid-Texte, Einzelfall-Fatwas, TTS für Koran, Hadith und Bittgebete |
| 0041 | Sprachprüfung und Stichproben | Rolle `sprachpruefung` (je Sprache), Annahmeregel, Status je Einheit |
| 0042 | Sprechen und Schreiben im Browser | Whisper (transformers.js) im Worker, Modelle mit SHA-Pin vom eigenen Ursprung, `'wasm-unsafe-eval'`, Mikrofon nur in `/lern-app`; kein Laufzeit-KI-Dienst |
| 0043 | Spielelemente ohne Druck | XP, Tagesziel, Serie mit Pausetagen, Abzeichen, Gruppenziel; Rangliste nur in Erwachsenengruppen auf Wunsch (Ausnahme von KERN „keine Ranglisten“, Nutzerentscheidung) |
| 0044 | Schrift der arabischen Oberfläche (schreibt ADR 0014 fort) | Noto Sans Arabic (OFL) nur im Lern-App-Layout per `unicode-range`; Kursinhalt in Amiri (`--font-arabic`) |
| 0045 | Offene Sprachdaten (schreibt ADR 0025 fort) | Tatoeba (CC BY 2.0 FR), kaikki/Wiktionary (CC BY-SA 4.0), Häufigkeitslisten; Auszüge gepinnt; Lizenzfeld je Eintrag; Namensnennung |

Zu aktualisieren:
- **ADR 0030:** Status „Nr. 4 fortgeschrieben durch ADR 0040“.
- **KERN:** Abschnitte Religion, Ranglisten-Ausnahme und neue Tokens.
- **ADR 0016:** Fortschreibung, siehe 7.2.

---

## 3 Architektur

### 3.1 Routen und Adressen

| Adresse | Art | Inhalt |
|---|---|---|
| `/lern-app` | Proxy 308 → `/lern-app/de` | Einstieg ohne Sprache |
| `/(tr\|en)/lern-app/…` | Proxy 308 → `/lern-app/(tr\|de)/…` | Links aus der Website |
| `/lern-app/[ui]` | statisch (3 Seiten) | Start: Kurswahl, Tagesziel, „Weiter lernen“, Wiederholen fällig (Client) |
| `/lern-app/[ui]/[kurs]` | statisch (3 × 8) | Lernpfad: Abschnitte A1–C1 → Einheiten → Stationen (B-24) |
| `/lern-app/[ui]/[kurs]/ueben?l=<lektion>` | statische Hülle | Lektionsspieler (Lektion per `useSearchParams` unter `Suspense`; der SW vergleicht mit `ignoreSearch`) |
| `/lern-app/[ui]/[kurs]/wiederholen` | statische Hülle | FSRS-Sitzung |
| `/lern-app/[ui]/[kurs]/einstufung` | statische Hülle | Einstufungstest (adaptiv, lokal) |
| `/lern-app/[ui]/[kurs]/tipps?e=<einheit>` | statische Hülle | Grammatik-Tipps aus dem Paket |
| `/lern-app/[ui]/{fortschritt,wortschatz,einstellungen,quellen}` | statisch | Lokale Ansichten; Quellen und Namensnennung |
| `/lern-app/[ui]/gruppe` | statische Hülle + API | Zuweisungen, Gruppenziel, Rangliste (Schalter) |
| `/lern-app/[ui]/anmelden` | **dynamisch**, Nonce-CSP | Anmeldung **im Scope** (iOS-PWA hat eine eigene Cookie-Ablage); E-Mail, Benutzername (Kind), Passkey, TOTP |
| `/lern-app/[ui]/manifest.webmanifest` | Route | Manifest je UI-Sprache (`lang`, `dir`, `id: /lern-app/`, `scope: /lern-app/`, eigenes Symbol) |
| `/lern-app/pakete/[kurs]` | Route, `'use cache'` + Tag | Kursverzeichnis (Version, Einheiten-Hashes, Größen) |
| `/lern-app/pakete/[kurs]/[einheit]/[hash]` | Route, unveränderlich | Einheitenpaket (nur freigegebene Einträge) |
| `/lern-app/audio/[...pfad]` | Route (Muster `app/audio`) | `.lpa`-Bündel aus Blob, `public, max-age=31536000, immutable` |
| `/lern-app/modelle/[...pfad]` | Route oder statisch (Spike S5) | Whisper-ONNX und ORT-WASM vom eigenen Ursprung |
| `/api/lernapp/{sitzung,sync,gruppe,schreiben,meldung,statistik}` | dynamisch | Siehe 3.8 und 11 |
| `/mein-bereich/unterricht/[gruppe]/lern-app` (tr `/hesabim/derslerim/[gruppe]/ogrenme-uygulamasi`, en `/my-account/teaching/[gruppe]/learning-app`) | Konto-Seite | Lehrkraft: zuweisen, Stand sehen, Schreibabgaben korrigieren |
| `/verwaltung/lernapp/**` | Verwaltung | Siehe 7 |

**Kurs-Slugs:**
- Sprachkurse: `tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`
- Wissen: `islam` (Inhalt nur Deutsch, unter allen UI-Sprachen mit dem Hinweis „auf Deutsch“)
- Koran: `koran` (Bedeutungen de oder tr, je nach UI; in der arabischen UI ausgeblendet)

UI-Sprache und Ausgangssprache sind getrennte Einstellungen. Standard: die UI-Sprache entspricht der Ausgangssprache.

### 3.2 Wurzel-Layout, Proxy und Header

**Wurzel-Layout:** `web/src/app/lern-app/[ui]/layout.tsx` setzt `generateStaticParams` auf `de|tr|ar` und `dynamicParams = false`. Es setzt `<html lang dir>` aus `import { ui } from 'next/root-params'`, lädt die Schriften, meldet den SW `/lern-app/sw.js` an und setzt `metadata.manifest`. Es braucht eigene `not-found.tsx` und `error.tsx`. Ein statisches Segment `lern-app` hat Vorrang vor `[locale]`. Im Spike S1 ist zu prüfen, dass `app/manifest.ts` nicht zusätzlich verlinkt wird.

**Proxy-Ergänzung** (vor `sprachRouting`):

```ts
if (pathname === '/lern-app' || pathname === '/lern-app/') return NextResponse.redirect(new URL('/lern-app/de', request.url), 308);
const fremd = pathname.match(/^\/(tr|en)\/lern-app(\/.*)?$/);           // Links der Website
if (fremd) return NextResponse.redirect(new URL(`/lern-app/${fremd[1] === 'tr' ? 'tr' : 'de'}${fremd[2] ?? ''}`, request.url), 308);
if (/^\/lern-app\/(de|tr|ar)\/anmelden(\/|$)/.test(pathname)) { /* Nonce-CSP + noindex + no-store wie Konto-Seiten */ }
if (pathname.startsWith('/lern-app/')) return NextResponse.next();      // kein next-intl
```

Die Dateien (`*.webmanifest`, `sw.js`) erreichen den Proxy wegen des Matchers ohnehin nicht.

**Header** (`web/src/lib/sicherheit/header.ts` + `web/next.config.ts`):
- Neue Funktion `cspLernApp()`: öffentliche CSP plus `script-src 'wasm-unsafe-eval'`, `worker-src 'self' blob:`, `media-src 'self' blob:` (Bündel-Ausschnitte als Blob-URL, eigene Aufnahme).
- Regel `/lern-app/:pfad*` **nach** der öffentlichen CSP-Regel; `CSP_AUSNAHMEN` um `lern-app` ergänzen.
- `Permissions-Policy` mit `microphone=(self)` nur für `/lern-app/:ui/:kurs/ueben` und `…/wiederholen`.
- `COOP: same-origin` und `COEP: require-corp` nur, wenn Spike S2 einen messbaren Gewinn durch WASM-Threads zeigt. Alle Ressourcen kommen vom eigenen Ursprung, daher ist das unkritisch.
- `PFAD_BERECHTIGUNGEN` bekommt zusätzlich `/verwaltung/lernapp/audio/:pfad*` (Mikrofon im Audio-Studio).

### 3.3 Texte und Übersetzungen der Oberfläche

- **Dateien:** `web/messages/lernapp/{de,tr,ar}.json`, Namensraum `lernapp`. Sie stehen nicht in `messages/bereiche`, weil dort `{de,tr,en}` verlangt ist.
- **Server:** `web/src/lib/lernapp/texte.ts` lädt je `ui` und nutzt `createTranslator` aus `next-intl`, mit explizitem `locale`. `getRequestConfig` wird nicht aufgerufen.
- **Client:** `web/src/lib/lernapp/format.ts` (< 1 KB) ist ein ICU-Teilformatierer für `{name}` und `{n, plural, …}` mit `Intl.PluralRules`. Arabisch hat die Kategorien zero/one/two/few/many/other. Ein Unit-Test vergleicht jede Nachricht × Beispielzahlen mit der Ausgabe von `createTranslator`.
- **Prüfung:** `web/scripts/sprachen-pruefen.mjs` prüft zusätzlich die Lern-App-Dateien (de ⊆ tr, de ⊆ ar, gleiche Platzhalter, ar darf mehr Plural-Kategorien haben).
- **Religion-Prüfung**, neue Einträge in `ERLAUBT`:
  - `^web/messages/lernapp/ar\.json$` (Bedienoberfläche)
  - `^web/inhalte/lernapp/sprache/` (MSA-Kursinhalt)
  - jeweils **nur zusammen** mit dem neuen Wächter (6.4)
  - **nicht** für `web/inhalte/lernapp/islam/`: Dort ist Arabisch verboten und kommt nur über Verweise in `web/daten/hanafi-quellen/`.
- **Website:** `/lernen` (`web/src/app/[locale]/(website)/lernen/page.tsx`) bekommt die Stationen „Sprachen lernen“ und „Wissen üben“ mit normalem `<a href="/lern-app/…">`. `Link` aus `@/i18n/link` kennt nur Pfade aus `routing.pathnames`.

### 3.4 RTL und Schriften

- **Logische Klassen:** nur logische Tailwind-Klassen (`ms-/me-/ps-/pe-/start-/end-/text-start`), Spiegelung über `rtl:` (Pfeile, Fortschrittsrichtung). Ein neuer Regeltest `tests/unit/lernapp/rtl-regeln.test.ts` verbietet `ml-/mr-/pl-/pr-/left-/right-/text-left/right` in `src/components/lernapp/**`.
- **Neue Werkzeugklassen** in `globals.css`: `auslauf-anfang` und `auslauf-ende` als logische Gegenstücke zu `auslauf-links` und `auslauf-rechts`, außerdem `raster-wortbank` und `lern-leiste` (keine freien Werte, `freie-werte.mjs` muss 0 melden).
- **Inhalte in anderer Richtung** tragen immer `lang` und `dir`, z. B. Arabisch in der deutschen UI als `<span lang="ar" dir="rtl" class="font-arabic text-arabisch-3">`. Für gemischte Zeilen gilt `unicode-bidi: isolate` (`<bdi>`).
- **Schriften:**
  - Neuer Token `--font-arabisch-ui` (ADR 0044), Noto Sans Arabic 400/700, subsettet, nur in `lern-app/[ui]/layout.tsx`.
  - `--font-text` bekommt diese Schrift als Rückfall, sodass arabische Codepunkte sie automatisch nutzen.
  - Vokalisierter Kursinhalt nutzt das vorhandene `--font-arabic` (Amiri). `--font-quran` bleibt dem Koran vorbehalten.
  - Kopieren per `scripts/schriften-kopieren.mjs` aus `@fontsource/noto-sans-arabic` (OFL), `QUELLE.md` in `web/src/fonts/`.
- **Ziffern in der arabischen UI:** `Intl.NumberFormat('ar-u-nu-arab')`, umschaltbar auf westliche Ziffern (offene Entscheidung O-5).

### 3.5 PWA und Service Worker

- **Eigener SW `web/public/lern-app/sw.js`** mit Scope `/lern-app/`. Die spezifischere Registrierung steuert die Lern-App-Seiten.
  - Vorrat `igmg-lernapp-schale-v<N>`: Hülle aller statischen Lern-App-Seiten der gewählten UI-Sprache und `/_next/static/**` (Vorrat zuerst).
  - `igmg-lernapp-pakete`: Paketverzeichnis „Netz zuerst“, Einheiten „Vorrat zuerst“ (Hash-Adresse).
  - `igmg-lernapp-audio`: Bündel, Vorrat zuerst.
  - `igmg-lernapp-modelle`: Whisper und ORT.
  - Nie vorgehalten: `/api/**`, `/lern-app/*/anmelden`.
- **Root-SW `web/public/sw.js`:** Im `activate` bleiben `igmg-lernapp-*` erhalten (Befund 4, gemeinsame Datei, nur der Orchestrator ändert sie).
- **Speicherung:**
  - Automatisch: aktuelle und nächste Einheit.
  - Bewusst: „Stufe offline speichern“ mit dem Ring nach Bytes (B-27, Muster `web/src/components/website/quran/OfflineSpeichern.tsx`).
  - `navigator.storage.persist()` erst beim bewussten Speichern; die Belegung zeigt `storage.estimate()`.
- **Push:** Eine Lern-Erinnerung läuft, wenn überhaupt, über die bestehende Root-Registrierung (Thema `lernapp`, Schalter, Opt-in, neutraler Text).

### 3.6 JS-Budget und Ladeplan

| Teil | Budget (gz) | Laden |
|---|---|---|
| Start, Lernpfad, Fortschritt | ≤ 150 KB je Route | statisch; Insel für den lokalen Stand (`useSyncExternalStore` wie `UebenStart.tsx`) |
| Lektionsspieler (Erstladung) | ≤ 180 KB | Kern: Sitzung, Abgleich, `idb`, `ts-fsrs` |
| Je Übungstyp | ≤ 15 KB | `import()` beim ersten Auftreten in der Sitzung, vorab für die nächste Aufgabe |
| Arabische Bildschirmtastatur | ≤ 10 KB | erst bei Freitext in Arabisch |
| Sprechmodul (Worker, transformers.js, ORT-WASM, Modell) | außerhalb des Routenbudgets, Größe wird vorher **angezeigt** | nur nach Klick „Sprachprüfung laden (≈ 80 MB)“; Gerätecheck vorab |
| Mein Bereich (Lehrkraft) | ≤ 230 KB | wie bisher |

Durchgesetzt wird das so:
- `tests/unit/lernapp/bundle-regeln.test.ts`: kein next-intl, kein `@/lib/utils` (tailwind-merge) im Client; `@huggingface/transformers` nur in `*.worker.ts`; Übungstypen nur per `import()`.
- `scripts/messen.mjs` mit Lern-App-Messrouten.

### 3.7 Lokale Datenhaltung (IndexedDB über `idb`)

Datenbank `igmg-lernapp` mit versionierten Migrationen in `web/src/lib/lernapp/lokal/db.ts`:

| Speicher | Schlüssel | Inhalt |
|---|---|---|
| `profile` | id | Lernprofile auf dem Gerät (Familiengerät ohne Passwort), `uiSprache`, `benutzerId?` (nach Anmeldung) |
| `ereignisse` | [profil, geraet, seq] | **Wahrheit**: nur anhängen; Indizes `[profil, am]`, `[profil, synchron]` |
| `karten` | [profil, karte] | abgeleitet (FSRS-Zustand), Index `[profil, faellig]` |
| `lektionen`, `tage`, `abzeichen` | … | abgeleitet |
| `einstellungen` | [profil, schluessel] | LWW-Register (Zeit, Gerät) |
| `pakete` | [kurs, einheit] | Hash, Bytes, offline ja/nein (Inhalt im Cache Storage) |
| `sync` | profil | Server-Zeiger, letzter Abgleich |

- **Neuberechnung:** Abgeleitete Speicher werden bei `ableitungsVersion` neu aus den Ereignissen berechnet.
- **Rückfall:** Ohne IndexedDB (z. B. private Fenster) läuft ein Speicher im Arbeitsspeicher mit Hinweis.
- **Sicherung ohne Konto:** Export und Import als JSON-Datei, auch für den Gerätewechsel und nach Art. 20.

### 3.8 Synchronisation (ADR 0038)

```ts
type Ereignis = {
  geraet: string;   // UUID je Gerät+Profil
  seq: number;      // fortlaufend je Gerät
  am: string;       // ISO, Geräteuhr; Server klemmt auf ≤ jetzt + 5 min
  tag: string;      // Lerntag YYYY-MM-DD in Ortszeit des Geräts (Serie, Tagesziel)
  art: 'bewertung' | 'lektion' | 'xp' | 'pause' | 'einstellung' | 'einstufung' | 'tagesziel';
  daten: unknown;   // je Art ein Zod-Schema (src/lib/lernapp/ereignisse/typen.ts)
};
```

| Zustand | Regel |
|---|---|
| Ereignisse | Vereinigung über `(benutzer, geraet, seq)` → idempotent, kommutativ, assoziativ |
| SRS-Karte | Bewertungen nach `(am, geraet, seq)` sortiert durch `ts-fsrs` nachspielen (Parameterversion festgehalten, Fuzz aus oder geseedet) → auf allen Geräten gleich |
| Lektion erledigt, beste Quote | Vereinigung bzw. Maximum |
| XP, Tagesziel, Serie, Abzeichen | aus den Ereignissen abgeleitet (reine Funktionen `ableiten.ts`, `serie.ts`, `abzeichen.ts`) |
| Einstellungen | LWW nach `(am, geraet)` |

- **Protokoll:** `POST /api/lernapp/sync` mit `{ geraet, cursor, ereignisse[≤ 500] }` (≤ 256 KB).
  - Der Server prüft Sitzung, Schalter `lernapp_sync`, Einwilligung `lernapp`, Ursprung und Zod.
  - Er schreibt mit `ON CONFLICT DO NOTHING` und erneuert den Snapshot der betroffenen Karten mit **derselben** reinen Ableitung.
  - Er markiert erledigte Zuweisungen (`aufgabe_erledigt`, wenn das Konto mit `lernende` in der Gruppe verbunden ist).
  - Er antwortet mit fremden Ereignissen nach dem Zeiger (≤ 2.000, `mehr`) und dem neuen Zeiger. Bremse: 30 Anfragen je Minute und Konto.
- **Erste Anmeldung:** Abfrage „Lokalen Fortschritt in dein Konto übernehmen?“. Ein Profil gehört zu genau einem Konto.
- **Verdichtung:** Ereignisse älter als 12 Monate werden in den Karten-Snapshot gefaltet. Das passt zu den Löschfristen.

### 3.9 Datenmodell (Drizzle)

Migrationen sind additiv:
- `0017_lernapp_rolle.sql`: nur `ALTER TYPE rolle ADD VALUE 'sprachpruefung'`
- `0018_lernapp_inhalte.sql`
- `0019_lernapp_nutzung.sql`

Schemas: `web/src/lib/db/schema/lernapp.ts` und `web/src/lib/db/schema/lernapp-nutzung.ts`, registriert in `schema/index.ts`.

**Inhalt** (Schlüssel stabil, z. B. `ar.a1.e03.s0042`; `inhaltHash` = SHA-256 des kanonischen JSON):

| Tabelle | Wichtige Spalten |
|---|---|
| `lernapp_kurs` | id (`de`, `tr`, `ar`, `islam`, `koran`), art (`sprache`/`islam`/`koran`), zielsprache, version, aktiv |
| `lernapp_richtung` | id (`tr-aus-de` …), kursId, ausgangssprache, aktiv, titel (LernText) |
| `lernapp_abschnitt` | kursId, stufe (Enum `a1…c1` bzw. `grund/aufbau/vertiefung`), kannBeschreibungen jsonb |
| `lernapp_einheit` | abschnittId, schluessel, reihenfolge, thema, kannBeschreibungen, symbol, `nurFuerAusgang text[]` (Schrift-Vorkurse), status |
| `lernapp_lektion` | einheitId, schluessel, art (`lektion`, `geschichte`, `wiederholung`, `pruefstein`, `schrift`, `schreiben`, `sprechen`), ziel |
| `lernapp_aufgabe` | lektionId, schluessel, typ (Enum, siehe 4), daten jsonb (Zod-Union `aufgaben/schema.ts`), reihenfolge, inhaltHash |
| `lernapp_lemma` | kursId, lemma, wortart, merkmale jsonb (Genus, Plural, Wurzel, Harmonie …), formen text[], stufe, frequenzRang, symbol, religionsbezug bool, quelle, lizenz |
| `lernapp_satz` | kursId, text (Ziel), tokens jsonb `[{form, lemma}]`, stufe, quelle (`ki:<lauf>`, `tatoeba:<id>`, `redaktion`), lizenz, religionsbezug |
| `lernapp_uebersetzung` | bezugTyp (`satz`/`lemma`), bezugId, sprache, text, alternativen text[], quelle, lizenz |
| `lernapp_tipp` | einheitId, ausgangssprache, inhalt jsonb (Tiptap wie ADR 0006) |
| `lernapp_text` | Dialog, Geschichte, Lesetext: zeilen jsonb `[{sprecher, satzId}]`, fragen jsonb |
| `lernapp_aussage` | Islam: lektionId, text (de), reihenfolge, meinung (`mufta_bihi`, `abu_hanifa`, `sahibayn` …), kinderGeeignet |
| `lernapp_quelle` | kurz, werk, autor, todesjahr, ausgabe, art (`fiqh`/`aqida`/`ilmihal`/`offene_daten`), datei (`web/daten/…`), sha256, lizenz, nurVerweis bool |
| `lernapp_beleg` | bausteinTyp, bausteinId, quelleId, passage (`quduri.ms0042`), stelle (Kapitel/Band/Seite), zitatVon/zitatBis (Zeichenbereich in der gepinnten Datei), art (`woertlich`/`sinngemaess`) |
| `lernapp_audio` | sprache, textHash, stimme (`piper:<stimme>@<sha>`/`mensch:<sprecherId>`), buendel, versatz, laenge, dauerMs, sha256 |
| `lernapp_sprecher` | name, vereinbarungMediumId (Pflicht für menschliche Aufnahmen, ADR 0029 Nr. 4) |
| `lernapp_pruefung` | inhaltTyp, inhaltId, **inhaltHash**, art (`sprache_ziel`/`sprache_uebersetzung`/`religioes`), pruefendeId, urteil (`ok`/`korrektur`/`abgelehnt`), kategorie, belegeGeprueft bool, kommentar, am |
| `lernapp_stichprobe` | einheitId, sprache/richtung, art, seed, groesse, ergebnis, entscheidung (`bestanden`/`nachbessern`) |
| `lernapp_pruefer_sprache` | benutzerId, sprache, ebene (`muttersprache`/`sehr_gut`) |
| `lernapp_meldung` | aufgabeSchluessel, kategorie (Enum), antwort (bei Erwachsenen optional), am; ohne Benutzerbezug |

**Status je Baustein** (berechnet in `web/src/lib/lernapp/freigabe.ts`, reine Funktionen):
- **Sprache:** `entwurf` → `automatisch_geprueft` (Prüfer grün) → `veroeffentlicht`, wenn die Stichprobe der Einheit bestanden ist und keine Prüfung zum aktuellen Hash „abgelehnt“ lautet.
- **Islam:** `geprueft`, wenn es ≥ 2 Prüfungen `ok` zum **aktuellen** `inhaltHash` gibt, von **verschiedenen** Personen mit `religioese_pruefung`, keine davon `verfasstVon`, und `belegeGeprueft` je Beleg gesetzt ist.
- **Sichtbarkeit:** Eine Lektion ist nur sichtbar, wenn **alle** ihre Bausteine `geprueft` sind.
- **Verlauf:** Jeder Schritt steht zusätzlich in der bestehenden Tabelle `freigabe` (Verlauf, `/verwaltung/freigaben`).

**Nutzung:**

| Tabelle | Inhalt |
|---|---|
| `lernapp_profil` | benutzerId PK, uiSprache, tagesziel, ranglisteOptIn, erstelltAm |
| `lernapp_ereignis` | id bigserial (Zeiger), benutzerId, geraet, seq, art, am, tag, daten, empfangenAm; eindeutig `(benutzerId, geraet, seq)` |
| `lernapp_karte` | Snapshot: benutzerId, karte, zustand jsonb, faellig, stand |
| `lernapp_tag` | benutzerId, tag, xp, zielErreicht, pause (für die Gruppenwoche) |
| `lernapp_schreibabgabe` | benutzerId, aufgabeId?, gruppeId, `textVerschluesselt bytea` + schluesselId (wie `lernende`), selbstbewertung, rubrik der Lehrkraft, kommentar, loeschenAb |
| `lernapp_statistik_tag` | datum, kurs, aufgabeSchluessel, versuche, richtig, uebersprungen (**ohne** Personenbezug) |

**Bestand erweitern:**
- `AufgabeBezug` um `{ art: 'lernapp'; kurs: string; einheit?: string; lektion?: string }`.
- Enum `konto_einwilligung_art` um `'lernapp'`.
- `TAG` in `web/src/lib/cache/tags.ts`: `lernapp`, `lernappKurs(id)`.
- Löschlauf `web/src/lib/loeschen/gemeinde.ts`: 12 Monate Inaktivität, Schreibabgaben 12 Monate.

**Rechte** (`web/src/lib/rechte/matrix.ts`): Aktionen `lernapp.lesen`, `lernapp.bearbeiten`, `lernapp.veroeffentlichen`, `lernapp.sprache.pruefen`, `lernapp.religioes.pruefen` (in `NIE_PER_ADMINISTRATION`), `lernapp.audio.bearbeiten`, `lernapp.statistik.lesen`.

| Rolle | Bekommt |
|---|---|
| `bildung` | lesen, bearbeiten, veröffentlichen, Audio, Statistik |
| `sprachpruefung` (neu) | lesen, sprache.pruefen; je Sprache über `lernapp_pruefer_sprache` |
| `religioese_pruefung` | lesen, religioes.pruefen |
| `leitung` | lesen, Statistik |

Die Gruppenrechte für Lehrkräfte stehen in `web/src/lib/rechte/gruppen.ts`.

### 3.10 Kurspakete und Audio (ADR 0039)

- **Paketbau:** `web/src/lib/lernapp/paket/bauen.ts` erzeugt aus der Datenbank je Richtung und Einheit kanonisches JSON. Darin stehen Lektionen und Aufgaben mit aufgelösten Texten (Ziel + Ausgangssprache), Alternativen, Tokens, Lemma-Infos, Tipps, SVG-Pfaden der Symbole und Audio-Verweisen (Bündel, Versatz, Länge). Der Hash ist SHA-256.
  - Das Kursverzeichnis nutzt `'use cache'`, `cacheTag(TAG.lernappKurs(id))` und `cacheLife('max')`. Jede Freigabe ruft `updateTag`.
  - Einheiten werden bei Bedarf erzeugt und dann aus dem Cache bzw. CDN geliefert. Nur im Beispielmodus (`ohneLaufzeitDatenbank`) rendert `generateStaticParams` alle Einheiten vor (≈ 450 JSON-Ausgaben).
- **Audio-Bündel `.lpa`** (`paket/buendel.ts`): kleiner Kopf (Magic, Version, Index `[textHash, versatz, länge, format]`), danach aneinandergehängte Einzeldateien (WebM/Opus, Rückfall AAC nach Spike S4).
  - Der Client schneidet mit `Blob.slice` und spielt über eine Objekt-URL. Langsam abspielen geht über `playbackRate = 0.75` mit `preservesPitch`, ohne zweite Datei.
  - Ein Bündel gehört zu einer **Zielsprache** und Einheit, beide Richtungen teilen es.
- **Ablage:** öffentlicher Blob-Speicher `lernapp` (fra1), Pfade mit Hash. Ausgeliefert wird über `/lern-app/audio/…` (Muster `liefereAudio` in `web/src/lib/audio/speicher.ts`, Range 200/206/416) mit `immutable`, damit das CDN cacht. Rückfall wie ADR 0029: Blob-Domain in `media-src` **nur** für `/lern-app`.
- **Ohne Blob** (Beispielmodus, E2E): kleine synthetische Testbündel (Töne, nie Rezitationen) aus dem Seed; Hörübungen zeigen sonst „Audio folgt“ und werden übersprungen.

### 3.11 Neue Module (Überblick)

```
web/src/app/lern-app/[ui]/…                      Seiten (3.1), layout.tsx, not-found.tsx, manifest.webmanifest/route.ts
web/src/app/lern-app/{pakete,audio,modelle}/…    Routen
web/src/app/api/lernapp/{sitzung,sync,gruppe,schreiben,meldung,statistik}/route.ts
web/public/lern-app/sw.js
web/src/lib/lernapp/{typen,kurse,texte,format,srs,freigabe,stichprobe}.ts
web/src/lib/lernapp/abgleich/{normalisiere,de,tr,ar,toleranz,tokens}.ts
web/src/lib/lernapp/aufgaben/{schema,bewerte}.ts + je Typ eine Datei
web/src/lib/lernapp/engine/{sitzung,xp,einstufung,kartenwahl}.ts
web/src/lib/lernapp/ereignisse/{typen,ableiten,zusammenfuehren,serie,abzeichen}.ts
web/src/lib/lernapp/lokal/{db,profile,ausgang,sync,export}.ts          (Client)
web/src/lib/lernapp/paket/{bauen,hash,buendel}.ts
web/src/lib/lernapp/inhalt/{schema,import}.ts, inhalt/pruefer/*.ts      (Zod → JSON-Schema, Prüfer)
web/src/lib/db/schema/{lernapp,lernapp-nutzung}.ts
web/src/server/queries/lernapp/*.ts, web/src/server/actions/lernapp-*.ts
web/src/components/lernapp/{Rahmen,Kopf,Lernpfad,Spieler,Rueckmeldung,Fortschrittsleiste,Abschluss,Serie,Abzeichen,OfflineKurs}.tsx
web/src/components/lernapp/{aufgaben/*,tastatur/ArabischeTastatur.tsx,tastatur/Sonderzeichen.tsx,sprechen/*,schreiben/*}
web/src/components/verwaltung/lernapp/*
web/scripts/lernapp/{import,schemas,pruefen,audio-liste,audio-manifest,modelle-pruefen}.ts
web/inhalte/lernapp/{rahmen,sprache,uebersetzung,islam,koran,aussprache,audio-manifest,symbole,schemas}/
web/daten/{tatoeba,kaikki,haeufigkeit,hanafi-quellen,lernapp-modelle}/QUELLE.md
web/drizzle/seeds/lernapp-test.ts                (fester Testkurs, alle Übungstypen, synthetische Töne)
_lernapp/werkzeuge/{*.workflow.js,tts/,sprachpruefung/,quellen/}
```

Neue `package.json`-Skripte: `lernapp:import`, `lernapp:schemas`, `lernapp:pruefen`, `lernapp:audio-liste`. `scripts/vercel-bau.mjs` und `scripts/bau-datenbank.mjs` rufen `lernapp:import` nach `inhalte-import.ts` auf.

---

## 4 Übungstypen

| Typ (`typ`) | Duolingo-Gegenstück | Bewertung | Tastatur und Screenreader | ab |
|---|---|---|---|---|
| `auswahl` | Auswahl | Index | Radiogruppe, Pfeiltasten, Ziffern 1–4 | A1 |
| `bild_wort` | Bildkarten | Index | Radiogruppe; Bild mit `alt` erst nach der Antwort (sonst verrät es die Lösung), Hinweis „Bildübung“ | A1 |
| `paare` | Paare zuordnen | Paarmenge | zwei Listen mit `aria-pressed`, Auswahl links → rechts; kein Ziehen nötig (WCAG 2.5.7) | A1 |
| `wortbank` | Übersetzen mit Wortkacheln | Abgleich (4.1) gegen Alternativen | Kacheln als Werkzeugleiste (roving tabindex), Antwortzeile als Liste, Entf nimmt zurück | A1 |
| `frei` | Übersetzen, Freitext | toleranter Abgleich | Textfeld mit `lang`/`dir`; Sonderzeichenleiste, arabische Tastatur | A2 (ar: B1) |
| `hoeren_waehlen` | Hören und tippen | Index bzw. Kacheln | Wiedergabe-Knopf, „langsam“; „Ich kann gerade nicht hören“ | A1 |
| `hoeren_schreiben` | Diktat | Abgleich ohne Harakat | wie `frei`; Abschrift nach der Antwort | A1 (ar: A2) |
| `minimalpaare` | Ausspracheunterscheidung | Index | wie `hoeren_waehlen` (ı/i, ü/u, [arabische Schrift entfernt]/[arabische Schrift entfernt], [arabische Schrift entfernt]/[arabische Schrift entfernt]) | A1 |
| `luecke` | Lückentext | Option oder Freitext | Lücke als beschriftetes Feld, Optionen als Radiogruppe | A1 |
| `satzbau` | Satz ordnen | Reihenfolge gegen Alternativen | wie `wortbank` | A2 |
| `formen` | Konjugation, Endungen | Tabelle | Tabellenzellen als Felder mit Kopfbezug | B1 |
| `harakat` | (ar) Vokalzeichen setzen, Iʿrāb | Auswahl der Vokalisierung | Radiogruppe; Lesen mit Codepunkt-Namen | A2/B1 |
| `dialog` | Gespräch | Wahl der passenden Antwort | Gesprächsverlauf als Liste, Live-Region | A1 |
| `geschichte` | Stories | eingestreute Fragen | Zeilenweise mit Audio; Fragen als Auswahl | A1 |
| `lesen_fragen` | Lesen | Auswahl, richtig/falsch/nicht im Text | Wort antippen → Glosse (Muster Wortkarte B-14) | B1 |
| `grammatik_tipp` | Tipps | – | Karte mit Überschriften, Beispiele mit `lang` | A1 |
| `schrift_ar` | (Vorkurs) Alphabet | Elifbe-Logik | übernimmt `erkennen/zuordnen/lesen/nachspuren` und `Schreibweg.tsx` (B-17); Nachspuren mit Alternative „Ich habe es auf Papier geschrieben“ | Vorkurs de/tr→ar |
| `schrift_tr` | Sonderbuchstaben ç ğ ı İ ö ş ü | Index/Freitext | wie `minimalpaare` | Vorkurs de/ar→tr |
| `schrift_latein` | Lateinisches Alphabet, Groß/Klein, Umlaute | Index | wie oben | Vorkurs ar→de/tr |
| `sprechen` | Sprechübung | Whisper-Abschrift → Abgleich (4.2) | Aufnahme per Taste, Status in der Live-Region; „Ich kann gerade nicht sprechen“; Einstellung „Sprechübungen aus“ | A1 |
| `schreiben` | (C1-Schreiben) | Rubrik, Selbsteinschätzung, optional Lehrkraft | Formular mit Zähler, Rubrik als Fieldset | B1–C1 |

Islam-Kurs: `auswahl`, `wahr_falsch` (mit Begründung), `zuordnen` (Fard/Wajib/Sunna/Mustahab/Makruh), `reihenfolge` (z. B. Schritte der Gebetswaschung), `luecke`, `fallfrage`.

Ablauf der Lektion (`engine/sitzung.ts`):
- 12–15 Aufgaben, neue Wörter mit Einführungskarte.
- Falsche Aufgaben kommen am Ende erneut, ohne Strafe. Es gibt keine Zeitgrenze (WCAG 2.2.1).
- Bewertung für FSRS: richtig im ersten Versuch → Good, mit Tippfehler oder Hinweis → Hard, falsch → Again. Kein „Easy“, keine Knöpfe zur Selbstbewertung außer bei Sprechen und Schreiben.
- Die Kartenwahl beim Wiederholen richtet sich nach der Stabilität: erst erkennen (`auswahl`, `paare`), dann `wortbank`, dann Produktion (`frei`, `hoeren_schreiben`).

### 4.1 Antwortabgleich (`web/src/lib/lernapp/abgleich/`)

Grundsätzliche Schritte:
- NFC, Satzzeichen und Leerraum vereinheitlichen
- Apostrophe ’ ' ʼ gleichsetzen
- Vergleich mit allen Alternativen
- Token-Levenshtein (`fastest-levenshtein`): ab 4 Zeichen gilt 1 Fehler als **Tippfehler**, die Antwort wird mit Hinweis angenommen; **nicht** jedoch, wenn die Schreibung ein anderes gültiges Kurswort ergibt (Lexikonschutz, „Haus“ ≠ „Hass“)

| Sprache | Regeln |
|---|---|
| de | `ß`↔`ss`, `ae/oe/ue`↔`ä/ö/ü` → angenommen mit Hinweis; Kleinschreibung von Nomen → angenommen mit Hinweis „Großschreibung“ |
| tr | Kleinschreibung mit `toLocaleLowerCase('tr')` (I→ı, İ→i); `i/ı`, `ş/s`, `ğ/g`, `ç/c`, `ö/o`, `ü/u` ohne Sonderzeichen → angenommen mit Hinweis; Eigennamen-Apostroph (`Ankara'ya`) tolerant |
| ar | Harakat entfernen (U+064B–U+0652, U+0670), Tatweel U+0640 entfernen, Alif-Formen ([arabische Schrift entfernt] → [arabische Schrift entfernt]) gleich, [arabische Schrift entfernt]↔[arabische Schrift entfernt], [arabische Schrift entfernt]↔[arabische Schrift entfernt] am Wortende → Hinweis, Hamza-Träger tolerant, [arabische Schrift entfernt]/[arabische Schrift entfernt] → [arabische Schrift entfernt]/[arabische Schrift entfernt], Ziffern [arabische Schrift entfernt]–[arabische Schrift entfernt]↔0–9. Kanonische Reihenfolge Schadda/Vokal (NFC). Strenger Modus nur in `harakat`-Übungen |

Ab Stufe 2 gibt es zusätzlich eine Tokenisierung je Sprache für Klitika (ar: [arabische Schrift entfernt]). Die Varianten dazu liefert der Inhalt (Alternativen). Der Abgleich rät keine Morphologie.

Gegen Fehlablehnungen hilft der Knopf „Meine Antwort hätte stimmen sollen“. Er erzeugt eine `lernapp_meldung` und füttert die Alternativen.

### 4.2 Sprechen (Whisper im Browser, ADR 0042)

- **Worker** `src/components/lernapp/sprechen/whisper.worker.ts` mit `@huggingface/transformers`:
  - `pipeline('automatic-speech-recognition', …, { device: 'webgpu' | 'wasm', dtype })`
  - `env.remoteHost = origin + '/lern-app/modelle/'`, `env.backends.onnx.wasm.wasmPaths = '/lern-app/modelle/ort/'` → **keine** Anfrage an Hugging Face oder jsDelivr
  - Sprache fest (`german`/`turkish`/`arabic`), `task: 'transcribe'`, **kein** Prompt mit der Lösung (sonst falsch-positive Ergebnisse)
- **Modelle** (Spike S2 entscheidet):
  - de/tr: whisper-base q8 (≈ 75–80 MB)
  - ar: whisper-small quantisiert auf geeigneten Geräten (WebGPU, ≥ 4 GB `deviceMemory`), sonst base
  - Gerätecheck vorab; sonst nur Selbstbewertung
- **Auswertung:** Abschrift normalisieren (4.1, Arabisch ohne Harakat), Wortausrichtung gegen das Ziel, je Wort gelb oder grün, Schwelle je Stufe und Sprache. Ehrlich benannt als „Verständlichkeit“, nicht als Lautbewertung.
- **Datenschutz:** Die Aufnahme verlässt das Gerät nie. Es gibt keinen Upload, auch nicht an Lehrkräfte.
- **Rückfall:** Eigene Aufnahme anhören, mit der Vorlage vergleichen und selbst bewerten.

### 4.3 Schreiben (B1–C1)

- **Aufgabe:** Aufgabenstellung in der Zielsprache, Wortzahlbereich, Pflichtwörter.
- **Automatisch geprüft:** nur Länge, Pflichtwörter und Rechtschreibung über das `spellcheck`-Attribut des Browsers. Keine KI-Bewertung.
- **Danach:** 1–2 Musterantworten, Rubrik nach GER (Aufgabenerfüllung, Kohärenz, Wortschatz, Grammatik, je 4 Bänder) und Selbsteinschätzung.
- **Lehrkraft:** Mit Konto, Gruppe und Schalter `lernapp_gruppen` sieht **nur** die Lehrkraft der Gruppe die Abgabe (verschlüsselt). Sie bewertet nach Rubrik mit Kommentar. Andere Lernende sehen nichts.

### 4.4 Schrift-Vorkurse

- **Arabisch:**
  - nutzt `web/src/lib/elifbe/alphabet.ts` (Codepunkte, Formen), `uebung.ts` (`aufgabe`, `bewerteSpur`), `zuege.ts` und `Schreibweg.tsx`
  - die Buchstabennamen nach MSA stehen in `messages/lernapp/*.json`
  - die Elifbe-Seiten selbst bleiben unverändert
  - türkischsprachige Lernende mit Elifbe-Kenntnis können den Vorkurs per Einstufung überspringen
- **Türkisch und Lateinisch:** neue Kurzeinheiten mit TTS-Audio.

---

## 5 Mengen, Speicher, Bauzeit

### 5.1 Je Zielsprache (de, tr, ar; von beiden Ausgangssprachen gemeinsam genutzt)

| Stufe | Einheiten | Stationen (5 Lektionen + Geschichte + Wiederholung + Prüfstein) | neue Lemmata (Σ) | Sätze | Dialoge und Geschichten | Lesetexte | Sprechen / Schreiben |
|---|---|---|---|---|---|---|---|
| A1 | 12 | 96 | 600 (600) | 2.400 | 24 | 6 | 24 / 0 |
| A2 | 14 | 112 | 900 (1.500) | 3.600 | 28 | 14 | 28 / 14 |
| B1 | 16 | 128 | 1.300 (2.800) | 5.200 | 32 | 32 | 32 / 16 |
| B2 | 16 | 128 | 1.700 (4.500) | 6.800 | 32 | 48 | 32 / 32 |
| C1 | 14 | 112 | 2.000 (6.500) | 8.000 | 28 | 56 | 28 / 28 |
| **Σ** | **72** | **576** | **6.500** | **26.000** | **144** | **156** | **144 / 90** |

Weitere Mengen je Zielsprache:
- Gespeicherte Aufgaben: ≈ 8.000 (≈ 15 je Lektion, Fragen der Geschichten, 20 je Prüfstein)
- Einstufungsbank: ≈ 400 Aufgaben
- Grammatik-Tipps: ≈ 300 Karten je Ausgangssprache

**Je Richtung:** 26.000 Satzübersetzungen mit ≈ 3 angenommenen Alternativen, 6.500 Glossen und ≈ 300 kontrastive Tipp-Karten. Dazu kommt der Schrift-Vorkurs: 8 Lektionen ar, 6 Latein, 2 tr.

**Gesamt:** 216 Einheiten, 1.728 Stationen, 19.500 Lemmata, 78.000 Zielsätze, 156.000 Übersetzungen, ≈ 470.000 Alternativen.

**Zeichendaten im Repository:** ≈ 115 MB JSON unkomprimiert (git ≈ 25–35 MB) plus Auszüge offener Daten ≈ 15 MB komprimiert.

### 5.2 Islamisches Wissen (nur Deutsch)

| Bereich | Einheiten |
|---|---|
| Akaid (maturiditisch) | 3 |
| Taharah | 3 |
| Salah (inkl. Witr, Freitag, Fest, Totengebet, Reise, Nachholen) | 5 |
| Sawm | 2 |
| Zakat + Sadaqat al-Fitr | 2 |
| Hajj/Umra | 2 |
| Halal/Haram und Alltag | 3 |
| Akhlaq/Adab | 3 |
| Siyar und Geschichte (Grundlagen) | 3 |
| Grundwissen Koran/Hadith/Fiqh | 2 |
| **Σ** | **28 Einheiten, ≈ 170 Lektionen** |

Bausteine: ≈ 1.400 Aussagen, ≈ 2.000 Belege, ≈ 1.700 Quizfragen. Kein Audio.

**Prüfaufwand:** 2 × (1.400 × 3 min + 1.700 × 1 min) ≈ **200 h Imam- und Hoca-Zeit**. Deshalb gestaffelt veröffentlichen: zuerst Taharah und Salah.

### 5.3 Koran-Arabisch

- ≈ 10 Einheiten mit ≈ 60 Lektionen.
- Inhalt: 500–1.000 häufigste Wortformen (`quran_wortform.vorkommen`) sowie das Vokabular der Fatiha und von Cüz 30.
- Bedeutungen **nur** aus `quran_wortbedeutung` mit Status `geprueft` (MN-05). Die Pipeline erzeugt dafür **nur** eine Arbeitsliste für die Hoca (≈ 25–50 h) und schreibt keine Bedeutungen.
- Audio nur aus `quran_wortzeit` freigegebener Rezitationen.

### 5.4 Audio, Modelle, Speicher, Bauzeit

| Posten | Menge | Größe |
|---|---|---|
| TTS-Clips je Zielsprache | ≈ 32.500 (Lemmata + Sätze, Dialogzeilen inklusive), ≈ 25 h | Opus 24 kbps mono ≈ **270 MB** (16 kbps ≈ 180 MB) |
| alle 3 Zielsprachen | ≈ 100.000 Clips, ≈ 75 h | ≈ **0,8 GB** |
| Bündel je Einheit | 216 | A1 ≈ 1,5 MB … C1 ≈ 6 MB |
| Kurspaket je Richtung | 72 Einheiten | ≈ 110 KB roh je Einheit (≈ 35 KB gz) → ≈ 2,5 MB gz je Richtung |
| Whisper + ORT-WASM | base 75–80 MB, small 150–250 MB, ORT ≈ 10–25 MB | ≈ 0,3–0,4 GB im Blob |
| **Blob `lernapp` gesamt** | | ≈ **1,1–1,3 GB** (Kosten prüfen, LM-15) |
| Offline auf dem Gerät | eine Stufe | A1 ≈ 25 MB … C1 ≈ 90 MB je Richtung (Audio + Paket) |

**TTS-Erzeugung:**
- Piper auf der CPU, Echtzeitfaktor ≈ 0,1–0,3: 25 h Audio ≈ 2,5–7,5 CPU-h je Sprache, mit 4 Kernen ≈ 1–2 h Wandzeit.
- Läuft **außerhalb** des Vercel-Baus, in Zeitfenstern ohne Bau oder E2E, oder auf dem lokalen Server.
- Lokal wird je Sprache höchstens ≈ 300 MB zwischengelagert; nach dem Upload gelöscht.

**Vercel-Bau** (Ziel ≤ 15 min bleibt):
- Lern-App-Import mit SHA-Idempotenz, beim ersten Mal ≈ 300.000 Zeilen (PGlite ≈ 30–60 s).
- ≈ 30 neue statische Seiten.
- Einheitenpakete nur im Beispielmodus vorrendern.
- Audio und Modelle werden **nie** im Bau erzeugt.

---

## 6 Inhalts-Pipeline

### 6.1 Ablage

```
web/inhalte/lernapp/
  rahmen/{de,tr,ar}.rahmen.json + RAHMEN-{de,tr,ar}.md   Scope & Sequence (GER-Kann-Beschreibungen, Grammatikfolge, Themen, Lemma-Budgets)
  schemas/*.schema.json                                  aus Zod erzeugt (pnpm lernapp:schemas, z.toJSONSchema)
  sprache/<ziel>/<stufe>/<einheit>.json                  Zielinhalt (Lemmata, Sätze mit Tokens, Texte, Lektionen, Aufgaben)
  uebersetzung/<richtung>/<stufe>/<einheit>.json         Übersetzungen, Alternativen, Glossen, Tipps
  islam/<bereich>/<einheit>.json                         Aussagen + Belege + Quiz (kein Arabisch)
  koran/pfad.json                                        Auswahl und Reihenfolge (nur Verweise)
  aussprache/{de,tr,ar}.json                             Aussprache-Überschreibungen für TTS
  audio-manifest/{de,tr,ar}.json                         textHash → Bündel, Versatz, Dauer, Stimme, SHA
  symbole/symbole.json                                   SVG-Pfade (Lucide ISC, Tabler MIT; 24-px-Raster, 2-px-Strich)
web/daten/tatoeba/, kaikki/, haeufigkeit/, hanafi-quellen/   gepinnte Auszüge + QUELLE.md (ADR 0025/0045)
```

### 6.2 Rahmenpläne

Rahmenpläne bauen auf den Kann-Beschreibungen des GER-Begleitbands (Europarat 2020, mit Quellenangabe) auf. Fremde Lehrpläne werden nicht übernommen.

Grammatikfolge je Sprache, verbindlich im Rahmenplan:
- **ar:** Schrift/Harakat → Nominalsatz, Artikel und Sonnen-/Mondbuchstaben, Genus, Suffixe, Iḍāfa, Muḍāriʿ (A1) → Māḍī, Plurale, Kongruenz, Präpositionen (A2) → Verbstämme II–X, schwache Verben, Relativsätze, Dual, Zahl + Tamyīz, Iʿrāb-Grundlagen (B1) → Passiv, kāna/inna, Bedingung, Maṣdar (B2) → Stil, komplexe Syntax, Register (C1)
- **tr:** Vokalharmonie, Fälle, Possessiv, -iyor, var/yok, mi (A1) → -di/-miş/-ecek, Aorist, -ebil (A2) → Partizipien, Konverben, Bedingung (B1) → Passiv/Kausativ, Evidentialität (B2) → Nominalisierungen, Register, Redewendungen (C1)
- **de:** Artikel und Genus, Präsens, V2, Akkusativ, Modalverben, trennbare Verben (A1) → Perfekt, Dativ, Präpositionen, weil/dass (A2) → Präteritum, Relativsätze, Passiv, Konjunktiv II (B1) → Konjunktiv I, Nominalstil, Partizipialattribute (B2) → C1

Kontrastive Tipps je Ausgangssprache, zum Beispiel:
- tr → de: Artikel, Wortstellung
- ar → de: p/b, Vokale, Großschreibung, Lateinschrift
- tr → ar: Lehnwörter und falsche Freunde, Elifbe-Vorwissen
- de → ar: Wurzelsystem

### 6.3 Workflow (Agenten, `_lernapp/werkzeuge/*.workflow.js`, Muster `_gemeinde/werkzeuge/hb-welle.workflow.js`)

| Phase | Wer | Eingabe | Ausgabe |
|---|---|---|---|
| R Rahmen | Opus (einmal je Sprache) | GER, Häufigkeitslisten, Themen | `rahmen/*.json` + `.md`; Abnahme durch Menschen (LM-02) |
| E Entwurf Ziel | Opus | Rahmen-Eintrag, bisher erlaubte Lemmata, Kandidaten (Häufigkeit + kaikki-Glossen + passende Tatoeba-Sätze), Inhaltsleitfaden, JSON-Schema | `sprache/<ziel>/…/<einheit>.json` mit Token-Annotation |
| V Validierung | Skript `pnpm lernapp:pruefen` | Einheit | Befundliste (blockierend/Warnung) |
| G Gegenprüfung | frischer Opus („Lektorat“) | Einheit + Befunde | Natürlichkeit, Stufe, Kultur, Mehrdeutigkeit der Ablenker; strukturiertes Urteil |
| N Nachbessern | Entwurfs-Agent (höchstens 2 Runden), Haiku für reine Schemafehler | Befunde | korrigierte Einheit; Rest → `menschlich_klaeren` |
| Ü Übersetzung | Opus je Richtung | Zieleinheit | `uebersetzung/<richtung>/…` mit Alternativen und Tipps |
| B Rückübersetzung | frischer Agent | Übersetzung | Bedeutungsgleichheit je Satz; Abweichungen → Befund |
| I Import | Skript `pnpm lernapp:import` | JSON | DB-Status `automatisch_geprueft`; Stichproben-Warteschlange |

- **Parallelität:** Inhalts-Agenten bis 6 gleichzeitig (API-gebunden, kein Bau); Prüfer laufen nacheinander.
- **Umfang:** ≈ 1.730 Agentenläufe für die Sprachen, ≈ 680 für den Islam-Kurs. Bei ≈ 15 min je Lauf ergibt das ≈ 72 h bzw. ≈ 28 h Wandzeit bei 6 parallelen Läufen. Grobe Tokenmenge ≈ 70–90 Mio. Ausgabetokens.
- **Herkunft:** Jeder Eintrag trägt `quelle: 'ki:<lauf>/<modell>/<promptVersion>'` bzw. `tatoeba:<id>`.

### 6.4 Automatische Prüfer

| Prüfung | Werkzeug | Lizenz | blockiert |
|---|---|---|---|
| Schema (Zod/JSON-Schema), eindeutige Schlüssel | eigenes Skript | – | ja |
| Wortschatzabdeckung: jedes Token-Lemma existiert und ist ≤ aktuelle Einheit eingeführt (plus Funktionswörter, Eigennamen); Formen per kaikki-Flexionstabellen stichprobenartig geprüft | eigenes Skript + `web/daten/kaikki` | CC BY-SA (nur Daten) | ja |
| Satzlänge je Stufe (A1 ≤ 8, A2 ≤ 12, B1 ≤ 18, B2 ≤ 25, C1 ≤ 35 Wörter), Lemma-Budget | eigenes Skript | – | ja |
| Dubletten exakt und nahe (Jaccard ≥ 0,9 normalisiert) | eigenes Skript | – | ja (> 1 %) |
| Abgleich-Selbsttest: alle Alternativen normalisieren konsistent; kein Ablenker ist zufällig richtig; Wortbank-Lösung erreichbar | `abgleich/*` | – | ja |
| Arabisch: Vokalisierung vollständig (Konsonant ohne Haraka außer Mater lectionis, Wasla, Sonnenbuchstaben-Lām), NFC-Reihenfolge | eigenes Skript | – | ja |
| Arabisch: Zweitmeinung zur Vokalisierung | Mishkal (GPL-3.0, nur Werkzeug) oder CAMeL Tools (MIT, Datenlizenz prüfen) | – | Warnung → Stichprobe |
| Türkisch: Vokal- und Konsonantenharmonie der Suffixe | eigenes Regelskript; optional Zemberek (Apache-2.0) | – | Warnung |
| Rechtschreibung | hunspell-Wörterbücher de/tr/ar über `nspell` (MIT), nur im Werkzeug | je Wörterbuch | Warnung |
| Grammatik de | LanguageTool (LGPL-2.1, lokal, Java) | – | Warnung |
| **Religionswächter** | `_gemeinde/werkzeuge/religion-pruefung.mjs` (Erweiterung) | – | ja |
| Inhaltsleitfaden (Tabu-Lexikon) | eigenes Skript | – | Befund → Mensch |
| Lizenzfeld 100 %, Namensnennung Tatoeba | eigenes Skript | – | ja |
| Islam: ≥ 1 Beleg je Aussage; Passage existiert; Zitatbereich wörtlich in der gepinnten Datei; Fiqh-Aussage braucht hanafitische Quelle, Akaid-Aussage eine maturiditische bzw. hanafitische; Hinweis auf Meinungsverschiedenheit nur mit `meinung` | eigenes Skript | – | ja |

Der **Religionswächter** prüft in den neu erlaubten Dateien:
- (a) **Formel-Lexikon**, normalisiert ohne Harakat, z. B. [arabische Schrift entfernt], sowie deutsche und türkische Religionsbegriffe → `religionsbezug: true` ist Pflicht und die religiöse Prüfung wird nötig. Ohne Kennzeichnung: rot.
- (b) **Koran-n-Gramm**: ≥ 4 aufeinanderfolgende normalisierte Wörter, die im Tanzil-Text vorkommen → rot. Ausnahmen nur über eine Liste, die der Imam freigibt.
- (c) **Hadith-n-Gramm**: ≥ 5 Wörter aus dem Bukhari-Text → rot.

Eingabedaten liegen in `web/daten/tanzil` und `web/daten/hadith`.

### 6.5 Muttersprachliche Stichprobe (ADR 0041)

- **Stichproben** je Einheit × (Zieltext | Übersetzung je Richtung | Audio):
  - Text: n = max(20, 10 %)
  - Audio: 10 %, für Arabisch 20 %
  - In der Einlaufphase sind die ersten 3 Einheiten je Sprache mit 30 % zu prüfen. Nach 3 bestandenen Einheiten in Folge gilt die Grundquote.
  - Seed und Auswahl sind in `lernapp_stichprobe` reproduzierbar.
- **Urteil je Eintrag:** `ok` | Fehler (kritisch: Bedeutung, Grammatik, anstößig, falsche Aussprache; leicht: Natürlichkeit, Zeichensetzung) | Korrektur direkt im Feld.
- **Annahme:** 0 kritische und ≤ 2 leichte je 20 Einträge → Einheit `bestanden`.
  - Sonst `nachbessern`: Die Befunde gehen in Phase N, mit Mustersuche in der ganzen Einheit. Danach eine neue Stichprobe mit neuem Seed.
  - Von Menschen korrigierte Einträge sind eingefroren (`menschlichGeprueft`). Ein KI-Neuimport überschreibt sie nicht, sondern legt einen Konflikteintrag an.
- **Änderungen nach Bestehen:** Eine geänderte Einheit (neuer Hash) behält ihren Stand, wenn < 10 % der Einträge geändert sind und die geänderten Einträge einzeln geprüft wurden. Sonst wird neu gezogen.

### 6.6 Versionierung und Import

- **Import:** `scripts/lernapp/import.ts` arbeitet idempotent über den SHA-256 je Datei und den `inhaltHash` je Eintrag:
  - unverändert → Status bleibt
  - geändert → Status zurück (Freigaben gelten nur für den Hash)
  - entfernt → `archiviert` (Karten der Lernenden bleiben, sie werden nur nicht mehr gezogen)
- **Kursversion:** Jede Veröffentlichung erhöht `lernapp_kurs.version`; das Kursverzeichnis trägt Einheiten-Hashes.
- **Rückfluss:** Menschliche Korrekturen werden mit `pnpm lernapp:export-korrekturen` als Commit nach `web/inhalte/lernapp/**` zurückgeschrieben. Damit zeigen Bau-Datenbank, Vorschau und Beispielmodus denselben Stand.

### 6.7 Religiöse Pipeline (ADR 0040)

1. **Quellen pinnen** (Spike S8) in `web/daten/hanafi-quellen/<werk>/` mit OpenITI-Text, `QUELLE.md`, URI, Version und SHA. Vorgesehen (Kennungen bestimmt der Spike):

   | Werk | Verwendung |
   |---|---|
   | *Muḫtaṣar al-Qudūrī* (st. 428/1037) | Grundtext Fiqh |
   | *Nūr al-Īḍāḥ* und *Marāqī al-Falāḥ* (aš-Šurunbulālī, st. 1069/1659) | ʿIbādāt |
   | *al-Hidāya* (al-Marġīnānī, st. 593/1197) | Begründungen |
   | *Radd al-Muḥtār* (Ibn ʿĀbidīn, st. 1252/1836) | nur einschlägige Kapitel; Meinung, nach der Fatwa gegeben wird |
   | *al-Fiqh al-Akbar* | Akaid |
   | *al-ʿAqīda aṭ-Ṭaḥāwiyya* | Akaid |
   | Empfehlung zusätzlich: *al-ʿAqāʾid an-Nasafiyya* | maturiditische Lehre |

   Diyanet- und IGMG-İlmihal nur als **Seitenverweis** (`nurVerweis`), Zitate nur mit Erlaubnis (LM-05). Lizenz und Editionsrechte (§ 70 UrhG) prüfen (LM-04).
2. **Passagen-Index:** `_lernapp/werkzeuge/quellen/openiti-passagen.mjs` schneidet nach Meilensteinen und Überschriften (`quduri.ms0042`) und ordnet die Kapitel den Lehrplanthemen zu.
3. **Entwurf** (Opus) **nur** mit den gelieferten Passagen: deutsche Aussagen, Belege mit Passage und Zeichenbereich, Quizfragen mit Bezug zur Aussage. **Kein** arabischer Text vom Agenten. Verse und Hadithe nur als Verweis (`sure:vers`, `sammlung:nummer`); angezeigt werden sie aus der Datenbank mit **freigegebener** Übersetzung, sonst mit „Übersetzung folgt“.
4. **Validierung** nach 6.4.
5. **Belegprüfung durch einen Agenten:** Ein frischer Agent beurteilt je Aussage gegen die Passage (`belegt` / `teilweise` / `nicht belegt`). Das legt nur die Reihenfolge für die Prüfenden fest und ersetzt keine Prüfung.
6. **Menschliche Prüfung** in `/verwaltung/lernapp/religioes`:
   - Arabische Passage aus der gepinnten Datei und deutsche Aussage stehen nebeneinander, mit Pflicht-Häkchen „Beleg am Original geprüft“ je Beleg.
   - Urteil `ok`, `Änderungsvorschlag` oder `ablehnen`.
   - Prüfende **bearbeiten nicht selbst**: Ihre Vorschläge übernimmt die Redaktion (`lernapp.bearbeiten`). Danach geben beide Prüfenden den neuen Hash frei. So reichen zwei Prüfende, die nicht Verfasser sind (KI = `ki:…`).
7. **Sichtbarkeit:** Lektionen erscheinen nur vollständig freigegeben. Die Lektion zeigt „Geprüft von zwei Gelehrten der Gemeinde am …“, ohne Namen (O-8). Jede Aussage hat eine aufklappbare Quellenzeile.

### 6.8 TTS-Pipeline

- **Schritte:**
  1. `pnpm lernapp:audio-liste <sprache>` erzeugt JSONL (textHash, Text, Stimme) nur für fehlende Einträge.
  2. `_lernapp/werkzeuge/tts/erzeuge.py` ruft Piper (Python, im Scratchpad) auf und nutzt die Aussprache-Überschreibungen.
  3. Lautheit normalisieren (EBU R128), Opus 24 kbps mono.
  4. `.lpa` je Einheit bauen und in Blob `lernapp` hochladen.
  5. Commit `audio-manifest/<sprache>.json`.
- **Stimmen:** nur solche, deren MODEL_CARD CC0, CC-BY oder MIT erlaubt (LM-06).
- **Nie vertont:** Arabisch mit Religionsbezug (`religionsbezug`). Für Koran, Hadith und Bittgebete gibt es nie TTS; Test und Wächter prüfen das.
- **Menschliche Aufnahmen** ersetzen TTS je `textHash` (Audio-Studio, 7.1). Für die arabischen A1/A2-Kerninhalte (≈ 1.500 Wörter + 2.500 Sätze, ≈ 10–15 h Studiozeit) werden sie bevorzugt.

---

## 7 Verwaltung

### 7.1 Module (`web/src/app/[locale]/verwaltung/(geschuetzt)/lernapp/…`)

| Modul | Inhalt | Recht |
|---|---|---|
| `lernapp` (Übersicht) | Stand je Kurs, Stufe und Einheit (Entwurf, automatisch geprüft, Stichprobe, veröffentlicht), Prüfquoten, offene Befunde, Pipeline-Lauf | `lernapp.lesen` |
| `lernapp/kurse/[kurs]` | Baum Abschnitt → Einheit → Lektion; Vorschau einer Lektion im echten Spieler (Vorschaumodus, ohne Ereignisse) | `lernapp.lesen` |
| `lernapp/sprachpruefung` (+ `[stichprobe]`) | Warteschlange je eigener Sprache; Eintrag für Eintrag mit Tastenkürzeln (J/F/K), Fehlerkategorie, Korrektur, Audio abspielen | `lernapp.sprache.pruefen` |
| `lernapp/religioes` (+ `[baustein]`) | Zwei-Prüfer-Ansicht (1/2, 2/2), Beleg-Häkchen, Vier-Augen; auch in `/verwaltung/freigaben` gelistet (`FREIGABE_TYPEN`, `ladeWarteschlange` erweitern) | `lernapp.religioes.pruefen` |
| `lernapp/audio` (+ `direkt/route.ts`) | Audio-Studio: fehlende oder auffällige Clips, Aufnahme mit `Werkstatt.tsx`, `Wellenform.tsx`, `werkstatt-audio.ts`, `webm.ts`, Direkt-Upload wie `rezitationen/direkt/route.ts`; Sprecher*in mit Vereinbarung Pflicht; TTS ↔ Mensch je Clip | `lernapp.audio.bearbeiten` |
| `lernapp/quellen` | Quellenregister (SHA, Lizenz, Verweis-only) | `lernapp.bearbeiten` |
| `lernapp/meldungen` | „Antwort hätte stimmen sollen“, Audio- und Übersetzungsfehler → Alternativen ergänzen, Eintrag sperren | `lernapp.bearbeiten` |
| `lernapp/statistik` | nur Summen mit n ≥ 10 (aktive Konten je Woche, Abschlüsse je Einheit, Fehlerquote je Aufgabe); anonyme Telemetrie nur mit Schalter | `lernapp.statistik.lesen` |

Weitere Anbindungen:
- **Cockpit** (`web/src/lib/startklar/*`): Karte „Lern-App“ mit Schaltern, Blob verbunden, Prüfenden (≥ 2 religiös, ≥ 1 je Sprache), veröffentlichten Einheiten je Kurs.
- **Audit:** jeder Prüfschritt, ohne Inhalte.

### 7.2 Sprache der Prüfoberfläche (Fortschreibung ADR 0016)

Das Modul „Sprachprüfung“ hat eine eigene Sprachwahl de/tr/ar. Nur die Bedienleiste ist dreisprachig, das Gerüst bleibt LTR, Inhaltsblöcke tragen `dir`. Die Texte stehen in `messages/verwaltung/lernapp-pruefung.json` mit `{de,tr,ar}` (Ausnahme im Schlüsselabgleich).

Begründung: Die Umkehrprobe von ADR 0016 trifft zu. Arabisch-Muttersprachler*innen bedienen die deutsche Verwaltung womöglich nicht sicher. Standard laut O-3.

---

## 8 Spielelemente (ADR 0043)

| Element | Regel |
|---|---|
| XP | Lektion 10, Geschichte 15, Prüfstein 20, Wiederholung 1 je 2 Karten (höchstens 10), Schreiben 15; keine Zeitboni; Zahl **statisch** (keine hochzählende Anzeige) |
| Tagesziel | 10/20/30/50 XP oder 1/2/3 Lektionen oder „kein Ziel“ |
| Serie | „Lerntage in Folge“; automatisch bis 2 Pausetage je Kalenderwoche (0–3 einstellbar), dazu bis 30 Tage „Ruhezeit“ im Jahr (Urlaub, Krankheit, Ramadan); Darstellung als Wochenband mit Achtsternen (Muster `website/veranstaltungen/Wochenband.tsx`); **nie** „Serie verloren“ – nach einer Pause „Schön, dass du da bist“ |
| Erinnerung | keine standardmäßig; optional Push mit Konto, Opt-in, neutraler Text ohne Serienbezug (Schalter `push_lernapp`) |
| Abzeichen (≈ 40 Arten) | Stufenabschluss je Kurs (A1–C1), Lerntage gesamt (7/30/100/365, nicht in Folge), Wortschatz (100 … 5.000), Schrift gemeistert (ar/Latein/tr), Geschichten, Wiederholungen, erstes Sprechen und Schreiben, Islam-Bereiche, Gruppenziel; Formen aus der Achtstern-Geometrie (`website/nachrichten/KategorieMarke.tsx`). „Stufe abgeschlossen“ heißt nie „Zertifikat“ |
| Lernpfad | Stationen an der Linie (B-24); Prüfstein erlaubt das Überspringen einer Einheit ab 80 %; Einstufungstest (20 Aufgaben, adaptiv) |
| Gruppe | Standard: **Gruppenziel** (Summe der XP gegen ein Wochenziel der Lehrkraft, ohne Namen) |
| Rangliste | nur wenn alle angezeigten Mitglieder ≥ 16 sind und selbst zugestimmt haben und die Gruppe es erlaubt; wöchentlich, ohne Medaillen; **für Kinder im Code gesperrt** (nicht über einen Schalter); Familie: Eltern sehen die Lernwoche ihrer Kinder, keine Rangliste |
| Keine | Herzen oder Leben, Ligen, globale Ranglisten, Zeitdruck, Käufe |

Ein Wortlaut-Test `tests/unit/lernapp/sanfte-texte.test.ts` prüft eine Liste verbotener Formulierungen in `messages/lernapp/*.json`, z. B. „verloren“ oder „verpasst“ im Serienkontext.

---

## 9 Zugänglichkeit (WCAG 2.2 AA)

- **Bedienung:** Jeder Übungstyp ist vollständig per Tastatur bedienbar (Tabelle in 4). Ziehen ist nie nötig (2.5.7). Ziele sind ≥ 24 × 24 px (2.5.8).
- **Rückmeldung:** Eine Live-Region je Bildschirm (`role="status"`), Fokus nach der Antwort auf „Weiter“ (Muster `Uebungen.tsx`). Das Rückmeldeblatt verdeckt nie den Fokus (2.4.11, `scroll-padding`).
- **Alternativen:** Einstellungen „Hörübungen aus“ und „Sprechübungen aus“, Abschrift nach jeder Hörübung, keine Zeitgrenzen. Fehler werden mit Text angezeigt, nicht nur mit Farbe (B-18).
- **Sprachauszeichnung:** `lang` und `dir` an jedem fremdsprachigen Teil, damit Screenreader richtig aussprechen. Die Tasten der arabischen Bildschirmtastatur tragen Buchstabennamen.
- **Darstellung:** Umbruch bei 400 % Zoom, reduzierte Bewegung (Block „Reduzierte Bewegung“ in `globals.css`).
- **Prüfung:** axe auf allen Lern-App-Routen × 3 UI-Sprachen × 2 Breiten. Menschen prüfen mit NVDA, VoiceOver iOS und TalkBack (LM-19).

---

## 10 Bewegung (Fortschreibung des Registers in KERN)

| ID | Bewegung | Umsetzung | Reduziert |
|---|---|---|---|
| B-28 | Lektionsleiste füllt sich je Aufgabe (`scaleX` aus `inline-start`) | `lernapp/Fortschrittsleiste.tsx` | ohne Übergang |
| B-29 | Rückmeldeblatt von unten (translate 24 px, Kurve B-03); richtig: Achtstern füllt sich (B-18 wiederverwendet), falsch: Farbe und Text ohne Bewegung | `lernapp/Rueckmeldung.tsx` | nur Deckkraft |
| B-30 | Lektion abgeschlossen (großer Moment): Achtstern-Ring zeichnet sich ≤ 1,6 s, XP und Tagesziel stehen statisch | `lernapp/Abschluss.tsx` (`linie-zeichnet`) | Endzustand |
| B-31 | Wortkachel wandert in die Antwortzeile: Deckkraft + 8 px (wie B-22) | `aufgaben/Wortbank.tsx` | sofort |
| B-32 | Paar gefunden: Häkchen zeichnet sich (wie B-23), Paar wird gedämpft | `aufgaben/Paare.tsx` | Häkchen sofort |
| B-33 | Serie: heutiger Stern im Wochenband füllt sich einmal am Tag | `lernapp/Serie.tsx` | gefüllt |
| B-34 | Abzeichen erhalten: Deckkraft + Skalierung .96 → 1 (wie B-14) | `lernapp/Abzeichen.tsx` | nur Deckkraft |
| B-35 | Aufnahme läuft: Pegelbalken (funktional) | `sprechen/Pegel.tsx` | statischer Punkt + Text „Aufnahme läuft“ |
| (B-24, B-27, B-17) | Lernpfad, Offline-Ring, Schreibweg | wiederverwendet | wie bisher |

Alles nur in CSS, eigene `@keyframes` nur über das Register. `tests/unit/bewegung-regeln.test.ts` gilt auch für `src/components/lernapp/**`. Keine Mondsichel, keine hochzählenden Zahlen.

---

## 11 Kinderschutz, Datenschutz, Funktionsschalter

**Kinderschutz:**
- In der Lern-App gibt es keine Freitext-Kommunikation zwischen Personen.
- Schreibabgaben sehen nur die Lehrkräfte der eigenen Gruppe.
- Meldungen bestehen aus Kategorien; bei Kindern wird keine Antwort mitgeschickt.
- Rangliste für < 16 im Code gesperrt (`sechzehnAm`, `istKind`). Anzeigenamen nur Vorname + Initial (S-14).
- Bildkarten zeigen nur Gegenstände und Symbole, keine Fotos und keine Gesichter (O-4).
- Keine externen Links in Lektionen.
- Kinderkonten synchronisieren nur mit der Einwilligung `lernapp`, die die Eltern erteilen.

**Datenschutz:**
- Ohne Konto entstehen nur GET-Anfragen an den eigenen Ursprung (Seiten, Pakete, Audio, Modelle). Es gibt keine Cookies, keine Analyse und nichts zum Personenbezug. Das belegt ein E2E-Netzprotokoll.
- Sprachaufnahmen bleiben lokal.
- Server-Daten nur mit Konto, Einwilligung und Schalter. Löschung 12 Monate nach der letzten Aktivität, kaskadierend mit dem Konto. Export nach Art. 20.
- DSFA-Nachtrag ist eine Aufgabe für Menschen (LM-08).

**Schalter** (`web/src/lib/funktionen-regeln.ts`, `web/src/lib/validierung/einstellungen.ts`, Startklar):

| Schalter | Personendaten | Vorschau | Produktion | Sperre im Cockpit |
|---|---|---|---|---|
| `lernapp` | nein | an | **an** (`IN_PRODUKTION_AN`, L3-E06) | – |
| `lernapp_ungeprueft` (Einheiten ohne bestandene Stichprobe, mit Banner) | nein | an | aus | – |
| `lernapp_sprechen` | nein (lokal) | an | aus bis Gerätetest (LM-07) | – |
| `lernapp_meldungen` (anonym, Kategorien) | nein | an | an | – |
| `lernapp_sync` | ja | an | aus | `konten` an, DSFA-Nachtrag (LM-08) |
| `lernapp_gruppen` (Zuweisungen, Gruppenziel, Schreibkorrektur) | ja | an | aus | `lernplattform` an, LM-08 |
| `lernapp_rangliste` | ja | an | aus | `lernapp_gruppen` an |
| `lernapp_statistik` (anonyme Telemetrie mit Opt-in) | grenzwertig (IP) | an | aus | Entscheidung der DSB |
| `push_lernapp` | ja | an | aus | wie `push` |

Ausgeschaltet heißt `notFound()` bzw. 404 der API. Die Links verschwinden (ADR 0035).

---

## 12 Abhängigkeiten (`web/package.json` hat heute davon nichts)

| Paket | Zweck | Lizenz | Ort |
|---|---|---|---|
| `ts-fsrs` | FSRS-Planer | MIT | dependencies (Spieler-Chunk) |
| `idb` | IndexedDB-Hülle (≈ 1–2 KB; statt Dexie, Apache-2.0, ≈ 30 KB) | ISC | dependencies |
| `fastest-levenshtein` | Abstand | MIT | dependencies |
| `@huggingface/transformers` (+ `onnxruntime-web`) | Whisper im Worker | Apache-2.0 (+ MIT) | dependencies, nur Worker |
| Whisper-Gewichte (onnx-community/Xenova) | Modelle | MIT | Blob, SHA in `web/daten/lernapp-modelle/QUELLE.md` |
| `@fontsource/noto-sans-arabic` | UI-Schrift | OFL-1.1 | devDependencies (kopiert) |
| `@tabler/icons` (nur Pfade extrahiert) | Bildkarten | MIT | Werkzeug; Lucide (ISC) ist schon vorhanden |
| `fast-check` (optional) | Eigenschaftstests der Zusammenführung | MIT | devDependencies |
| Piper (rhasspy/piper MIT, archiviert; bzw. piper1-gpl GPL-3.0) + espeak-ng (GPL-3.0) | TTS beim Import | Werkzeug im Scratchpad, wird nicht ausgeliefert | – |
| opus-tools (BSD) / ffmpeg (LGPL/GPL) | Kodierung, Lautheit | Werkzeug | – |
| LanguageTool (LGPL-2.1), `nspell` (MIT) + hunspell-Wörterbücher, Mishkal (GPL-3.0), CAMeL Tools (MIT, Daten prüfen), Zemberek (Apache-2.0) | Prüfer | Werkzeug | – |
| Daten: Tatoeba (CC BY 2.0 FR), kaikki/Wiktionary (CC BY-SA 4.0/GFDL), FrequencyWords (Daten CC BY-SA 4.0), OpenITI (Lizenz prüfen, voraussichtlich CC BY-NC-SA 4.0) | Inhalt | siehe LM-04/LM-12 | `web/daten/**` gepinnt |

`zod` (v4, mit `toJSONSchema`) ist schon vorhanden. Keine neue Laufzeit-KI, keine Drittanbieter-Anfragen.

---

## 13 Tests

**Unit** (`web/tests/unit/lernapp/`):
- `abgleich-{de,tr,ar}.test.ts`: je ≥ 150 Fälle, Lexikonschutz, NFC-Reihenfolge, Ziffern, Klitika-Alternativen
- `srs.test.ts`: Nachspielen ist deterministisch, Parameterversion
- `zusammenfuehren.test.ts`: Eigenschaftstests idempotent, kommutativ, assoziativ; LWW; Uhrzeit-Klemme; Serie mit Pausetagen über Tages- und DST-Grenzen; Abzeichen
- `aufgaben-schema.test.ts`: alle Typen, JSON-Schema stimmt mit Zod überein
- `paket-hash.test.ts`, `buendel.test.ts`
- `freigabe-zwei.test.ts`: zwei verschiedene Prüfende, Verfasser ausgeschlossen, Hash-Bindung, Rücksetzen, Administration zählt nicht
- `stichprobe.test.ts`: Seed, Annahmeregel
- `einstufung.test.ts`
- `format.test.ts`: ICU-Teilformatierer = `createTranslator`, arabische Plurale
- `rtl-regeln.test.ts`, `bundle-regeln.test.ts`, `sanfte-texte.test.ts`
- `religion-waechter.test.ts`: Formeln, Koran- und Hadith-n-Gramme, Positiv- und Negativproben aus `web/daten`

**Integration** (PGlite, `web/tests/integration/lernapp-*.test.ts`, mit kleinem Testkurs, **nie** dem Vollkorpus):
- Import idempotent, Status bleibt bzw. wird zurückgesetzt
- Pakete enthalten nur Veröffentlichtes; `updateTag` bei Freigabe
- Islam: eine Freigabe → unsichtbar, zwei → sichtbar, Lektion nur vollständig
- Sync: Anmeldung, Einwilligung, Schalter (404), Isolation zwischen Konten, Idempotenz, Zeiger-Seiten, Bremse
- Zuweisung: nur Lehrkraft der Gruppe; Abschluss setzt `aufgabe_erledigt`; Eltern sehen nur das eigene Kind
- Schreibabgabe verschlüsselt, Sichtbarkeit, Löschlauf
- Statistik ohne Bezug
- Rechte-Matrix für die neue Rolle

**E2E** (`web/tests/e2e/lernapp/*.spec.ts`, telefon + desktop, Seed `web/drizzle/seeds/lernapp-test.ts`):
- je Übungstyp eine Spec mit Tastatur- und Zeigerweg; `sprechen` mit `--use-fake-device-for-media-stream` und einem Attrappen-Worker, nur im Testbau (`E2E_ATTRAPPEN=1`, im Produktionsbau entfernt)
- je UI-Sprache ein Rauchtest mit Start, Pfad und Lektion; in `ar`: `html[dir=rtl]`, kein Überlauf bei 390 px
- axe auf allen Routen × 3 Sprachen
- offline: SW, Stufe speichern, `setOffline`, Lektion, zurück online
- zwei Kontexte mit Konfliktbewertung → gleicher Kartenstand
- Lehrkraft → Schüler*in → Lehrkraft
- Kind: keine Rangliste
- Verwaltung: Sprach-Stichprobe, zwei religiöse Prüfkonten plus Ausschluss der Verfasser, Audio-Studio mit Attrappen-Mikrofon
- Netzprotokoll ohne Konto (nur GET an den eigenen Ursprung)

**Leistung:** `pnpm messen` mit `/lern-app/de`, `/lern-app/ar/de-aus-ar`, `/lern-app/tr/de-aus-tr/ueben?l=…`. Ziele: Perf ≥ 90, A11y 100, JS laut 3.6.

**Inhalt im Tor:** `pnpm lernapp:pruefen` (alle Dateien), `religion-pruefung.mjs`, `pnpm sprachen:pruefen`, Lizenzbericht.

---

## 14 Etappen L0–L8

Die Zeiten sind Agenten-Wandzeit bei Dauerbetrieb und grob geschätzt. Die menschliche Prüfung läuft parallel und länger.

Prüfstufen wie im Vorlauf:
- **A je Paket:** Typen, Lint, betroffene Tests, Bilder, `religion-pruefung`, `freie-werte`, `lernapp:pruefen`
- **B je Etappe:** Bau Vorschau und Produktion, alle Suiten, axe, Lighthouse, reduzierte Bewegung, startklar mit Produktionsschaltern
- **S** an L1, L5 und L8: Sicherheitsprüfung durch einen frischen Agenten

| Etappe | Inhalt | Dauer | Abnahme |
|---|---|---|---|
| **L0 Grundlagen** | `_lernapp/` mit allen Dateien, ENTSCHEIDUNGEN L3-E01…E10, ADR 0037–0045, KERN-Ergänzung; Spikes: **S1** Wurzel-Layout `/lern-app/[ui]` + Proxy + RTL unter Cache Components (Bau grün, Manifest-Verknüpfung) · **S2** Whisper base/small de/tr/ar headless: Latenz, Speicher, WER an 30 Sätzen je Sprache (synthetisch + 10 menschliche Proben), WebGPU/WASM, Nutzen von COOP/COEP · **S3** Piper-Stimmen: Lizenztabelle, Echtzeitfaktor, Hörproben · **S4** Opus in WebM/Ogg auf Safari (Plan für MN-19) · **S5** Auslieferung großer Dateien auf Vercel (Route streamt vs. statisch vs. Blob direkt) · **S6** `idb` + SW-Scope `/lern-app/` neben dem Root-SW · **S7** Tatoeba-, kaikki- und Häufigkeitsauszüge mit SHA und `QUELLE.md` · **S8** OpenITI-Werke, Lizenz, Passagen-Index | 2 Tage | ADRs angenommen; 8 Spike-Belege in `_lernapp/belege/`; religion-pruefung grün; MENSCHEN LM-01…LM-20 eingetragen |
| **L1 Kern** | Migrationen 0017–0019, Rechte, Schalter, Cache-Tags; Wurzel-Layout, Texte de/tr/ar + Formatierer + `sprachen:pruefen`; Schrift; Manifest; SW + Ausnahme im Root-SW; Abgleichbibliothek; FSRS; Ereignisse und Ableitung; lokale DB + Profile + Export; Paketbau + Routen + `.lpa` + Audio-Route; Sync-API + Client; Seed-Testkurs; Spieler mit `auswahl`, `wortbank`, `paare` | 3–4 Tage | Unit (Abgleich ≥ 450 Fälle, Eigenschaftstests), Integration (Import, Pakete, Sync), E2E (Offline-Lektion, zwei Geräte), Spieler ≤ 180 KB, axe 0 in 3 Sprachen, Bau beider Betriebsarten grün, **S-L1** ohne hoch/kritisch |
| **L2 Übungstypen** | Arbeitsbaum A: `bild_wort`, `frei`, `hoeren_*`, `minimalpaare`, `luecke`, `satzbau`, `formen`, `harakat`, Sonderzeichenleiste, arabische Tastatur · Arbeitsbaum B: `dialog`, `geschichte`, `lesen_fragen`, `grammatik_tipp`, `schrift_ar/tr/latein`, `sprechen` (Worker, Gerätecheck, Rückfall), `schreiben`; B-28…B-35; Wiederholen und Einstufung | 4–5 Tage | je Typ: Zod, Bewertung mit Unit-Tests, Tastatur- und Screenreader-Semantik, E2E (2 Breiten; 6 Typen auch in `ar`), Chunk ≤ 15 KB; Register in KERN; Bewegungs-Werkzeuge grün |
| **L3 Pipeline + A1** | Rahmenpläne de/tr/ar; Schemas; alle Prüfer und Wächter; Workflows E/V/G/N/Ü/B/I; TTS-Kette; Verwaltung (Übersicht, Kurse, Sprachprüfung, Audio-Studio v1, Meldungen); A1 für 3 Zielsprachen × 6 Richtungen + Vorkurse + Einstufungsbank A1 | 5–7 Tage | `lernapp:pruefen` 0 Fehler; Befunde der Gegenprüfung erledigt oder an Menschen übergeben; Audio für 100 % der A1-Zielinhalte; Pakete gebaut; E2E: eine A1-Lektion je Richtung; Einlauf-Stichproben gezogen; Produktion zeigt nur `bestanden` |
| **L4 A2–B1** | 30 Einheiten × 3 + Übersetzungen + Audio; Geschichten, Lesetexte; Prüfsteine; Abzeichen je Stufe | 7–9 Tage | Abdeckungsbericht (Lemma-Ziele ±5 %), Dubletten < 1 %, Stichproben laufen, Lighthouse stabil |
| **L5 B2–C1** | 30 Einheiten × 3; lange Lesetexte; Schreibaufgaben mit Rubrik und Musterantworten; Sprechaufgaben; Korrekturweg für Lehrkräfte (Schalter) | 8–10 Tage | Whisper-Messung je Sprache dokumentiert (Latenz ≤ 3 s auf dem Referenzgerät oder Rückfall aktiv); Schreibabläufe in E2E; **S-L2** (Sync, Abgaben, Rechte) |
| **L6 Islam + Koran-Arabisch** | Quellen gepinnt + Passagen; KI-Regel 2 im Werkzeug; Zwei-Prüfer-Oberfläche + Freigaben-Integration; Lehrplan 28 Einheiten; Entwürfe mit Belegen, Belegprüfung, Quiz; Koran-Pfad (Häufigkeit, freigegebene Bedeutungen, Wortzeiten) + Hoca-Arbeitsliste | 6–8 Tage (+ Wochen menschliche Prüfung) | 0 sichtbare Bausteine ohne 2 Freigaben (Integration + Abfrage am Live-Stand); jede Aussage ≥ 1 geprüfter Beleg; religion-pruefung 0; TTS für Koran/Hadith 0 (Test); Koran-Pfad zeigt nur freigegebene Bedeutungen |
| **L7 Spielelemente, Gruppen, Lehrkräfte** | XP, Tagesziel, Serie mit Pausen und Ruhezeit, Abzeichen (≈ 40), Gruppenziel, Rangliste (Erwachsene, Opt-in), Familienansicht; Mein Bereich Lehrkraft (`…/unterricht/[gruppe]/lern-app`, Pfade in `routing.ts`), Schüler-Start mit Zuweisungen (`SchuelerStart.tsx`), Eltern-Übersicht; optional Push-Erinnerung | 3–4 Tage | Regeltests (sanfte Texte, keine Rangliste < 16, keine hochzählenden Zahlen); Integration Gruppenisolation; E2E Lehrkraft → Schüler*in → Lehrkraft; Mein Bereich ≤ 230 KB |
| **L8 Härtung und Abnahme** | **S-L3** vollständig (CSP/WASM, Sync, Rechte, Einwilligung); Lighthouse aller Routen; axe; Drosselung CPU ×6; Lasttest Sync (Node-Skript, 200 gleichzeitige Konten); Mengenbericht; Handbücher (Lernende, Lehrkräfte, Sprachprüfung, Imam/Hoca); `/quellen` und Namensnennung; GO-LIVE-Liste der Schalter; Stufe C wie im Vorlauf; BERICHT | 3–4 Tage | Z-L01…Z-L16 erfüllt oder als AUSNAHME mit Grund |

**Gesamt:** Code ≈ 15–19 Agententage, Inhalt ≈ 25–35 Agententage. Inhalte laufen ab L3 parallel zum Code, daher ≈ **6–8 Wochen kritischer Pfad**. Menschliche Prüfung: Sprache ≈ 180 h, Islam ≈ 200 h, Bedeutungen ≈ 25–50 h. Veröffentlicht wird gestaffelt.

**Globale Abnahme (`_lernapp/ABNAHME.md`):**

| ID | Kriterium |
|---|---|
| Z-L01 | 6 Richtungen A1–C1 nach Rahmenplan (Mengen ≥ Ziel − 5 %) |
| Z-L02 | Islam-Kurs: 0 sichtbare Bausteine ohne Doppelfreigabe |
| Z-L03 | Koran-Pfad nur mit freigegebenen Bedeutungen, ohne TTS |
| Z-L04 | Offline: Lektion, Wiederholen und Paketspeichern ohne Netz |
| Z-L05 | Sync deterministisch (Eigenschaftstest + E2E) |
| Z-L06 | axe 0 auf allen Lern-App-Routen; Tastatur je Typ; Protokoll Screenreader |
| Z-L07 | Leistung und JS-Budgets laut 3.6 |
| Z-L08 | Netzprotokoll ohne Konto: nur eigener Ursprung, kein POST |
| Z-L09 | Kinderschutz: keine Freitext-Kommunikation, keine Rangliste < 16 |
| Z-L10 | religion-pruefung 0 und Wächter 0 |
| Z-L11 | Register B-28…B-35 mit reduzierter Variante |
| Z-L12 | Produktionsschalter sicher, startklar grün |
| Z-L13 | Sprachen und RTL-Regeltest grün |
| Z-L14 | `lernapp:pruefen` 0, Lizenzfeld 100 % |
| Z-L15 | Audio 100 % der Zielinhalte, Lautheit normiert |
| Z-L16 | Vercel-Bau ≤ 15 min |

---

## 15 Parallelisierung und Ressourcen

- **Code:** höchstens 2 Arbeitsbäume gleichzeitig (4 Kerne).
- **Gemeinsame Dateien nur durch den Orchestrator:** `routing.ts`, `proxy.ts`, `next.config.ts`, `header.ts`, `public/sw.js`, `globals.css`, `matrix.ts`, `funktionen-regeln.ts`, `tags.ts`, Schemas und Migrationen, `package.json`, `religion-pruefung.mjs`, `sprachen-pruefen.mjs`, KERN.
- **Eigene Dateien je Paket:** jedes Paket hat eine eigene Textdatei bzw. einen eigenen Namensraum in `messages/lernapp/*.json`, abschnittsweise vom Orchestrator angelegt.
- **Inhalt:** bis 6 Agenten parallel, keine Bauten. TTS nur in Zeitfenstern ohne Bau oder E2E, oder auf dem lokalen Server.
- **Plattenbudget bei 7,0 GB frei:**

  | Posten | Bedarf |
  |---|---|
  | 2 Arbeitsbäume (`.next` ≈ 1,5 GB je Bau, `node_modules` als pnpm-Hardlinks) | ≈ 3,5 GB |
  | Werkzeuge im Scratchpad (Piper + 6 Stimmen ≈ 0,5 GB, LanguageTool ≈ 0,3 GB, Python-venv ≈ 0,5 GB, Testmodelle Whisper ≈ 0,4 GB) | ≈ 1,7 GB |
  | Audio-Zwischenlager | ≤ 0,3 GB |
  | Reserve | ≈ 1,5 GB |

  Downloads (Tatoeba, kaikki) werden **im Strom gefiltert**, ohne den Vollabzug zu speichern. Nach jedem Merge: `.next` des Arbeitsbaums und `test-results` löschen, `pnpm store prune` je Etappe.

---

## 16 MENSCHEN (`_lernapp/MENSCHEN.md`, Format wie `_gemeinde/MENSCHEN.md`)

| ID | Aufgabe | Wer | Aufwand | Standard bis zur Antwort |
|---|---|---|---|---|
| LM-01 | Muttersprachliche Prüfer*innen de, tr, ar (je ≥ 2), Konto mit 2FA + Rolle `sprachpruefung` | Bildung/Vorstand | Stichproben ≈ 60 h je Zielsprache + ≈ 20 h je Richtung | Produktion zeigt nur `bestanden`; Vorschau alles mit Banner |
| LM-02 | Rahmenpläne de/tr/ar abnehmen | je eine Prüfperson | ≈ 3 h je Sprache | Entwurf gilt |
| LM-03 | Imam und Hoca (≥ 2, MN-24) prüfen den Islam-Kurs, zuerst Taharah und Salah | Imam/Hoca | ≈ 200 h | nichts sichtbar |
| LM-04 | Hanafitische Werke und Ausgaben bestätigen; OpenITI-Lizenz und Editionsrechte prüfen | Imam/Vorstand/Recht | 2 h | nur Vorschau |
| LM-05 | Diyanet-/IGMG-İlmihal: Zitaterlaubnis | Vorstand | Wartezeit | nur Seitenverweis |
| LM-06 | Piper-Stimmen: Lizenz je MODEL_CARD bestätigen; arabische Stimme abnehmen; Sprecher*innen mit Vereinbarung | Technik/Vorstand | 1 h + Aufnahmen 10–15 h | nur CC0/CC-BY/MIT-Stimmen; ar-Audio „wird geprüft“ |
| LM-07 | Gerätetest Sprechen und Audioformat (iPhone, Android-Mittelklasse, Laptop), Erweiterung von MN-19 | Technik | 2 h | `lernapp_sprechen` in Produktion aus |
| LM-08 | DSFA-Nachtrag Lern-App, Einwilligungstext `lernapp`, Datenschutzerklärung, Löschfristen | DSB/Recht | 4–6 h | `lernapp_sync`/`_gruppen` aus |
| LM-09 | Inhaltsleitfaden: Tabu-Themen (Musik, Beziehungen, Alkohol/Schwein als Vokabel), Namen, Bilder | Hoca/Vorstand | 1 h | Entwurf des Leitfadens |
| LM-10 | Rangliste in Erwachsenengruppen wirklich anbieten? | Vorstand | 5 min | aus |
| LM-11 | Veröffentlichung von Sprachinhalten vor der Stichprobe (O-1) | Vorstand | 5 min | nein |
| LM-12 | Namensnennung Tatoeba und BY-SA-Folgen für Kursinhalte | Vorstand/Recht | 30 min | Ja, Hinweis auf `/quellen` |
| LM-13 | Bedeutungen der häufigsten 500–1.000 Koran-Wortformen (MN-05) und Lizenz eines Morphologie-Datensatzes (Quranic Arabic Corpus, GPL) | Hoca | 25–50 h | Pfad zeigt nur Vorhandenes |
| LM-14 | Lehrkräfte schulen (Zuweisen, Korrigieren) | Bildung | 1 h | – |
| LM-15 | Blob-Speicher `lernapp` verbinden, Kosten und Traffic beobachten | Technik | 20 min | Audio nur im Testkurs |
| LM-16 | Quelle für Bittgebete (z. B. Ḥiṣn al-Muslim) mit Lizenz, falls Lektionen Bittgebete zeigen sollen | Imam/Recht | 1 h | nur Bittgebete aus dem Koran per Verweis |
| LM-17 | Kindgerechter Pfad im Islam-Kurs | Hoca | – | Kennzeichnung „für Kinder geeignet“ je Lektion |
| LM-18 | Arabische Ziffern östlich oder westlich (O-5) | Vorstand | 5 min | östlich, umschaltbar |
| LM-19 | Screenreader-Prüfung (NVDA, VoiceOver, TalkBack) | Technik | 3 h | UMGEBUNGSAUSNAHME |
| LM-20 | Prüfvermerk sichtbar mit oder ohne Namen (O-8) | Imam/Vorstand | 5 min | ohne Namen |

---

## 17 Risiken und Gegenmaßnahmen

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Inhaltsqualität bei 78.000 Sätzen (Unnatürlichkeit, Stufendrift, falsche Übersetzung) | Vertrauensverlust | Rahmenpläne, Token-Annotation mit Wörterbuchprüfung, Gegenprüfung, Rückübersetzung, Einlauf-Stichprobe 30 %, Annahmeregel, Meldeknopf, gestaffelte Veröffentlichung |
| Arabische Morphologie und Antwortabgleich | gültige Antworten abgelehnt | Abgleich ohne Harakat, Alternativen aus dem Inhalt, Wortbank vor Freitext (Freitext ar ab B1), Bildschirmtastatur, Meldungen erweitern die Alternativen |
| TTS Arabisch mit Harakat (Schadda, Tanwin, Wasla, Sonnenbuchstaben) | falsche Aussprache wird gelernt | 20 % Audio-Stichprobe, Aussprache-Überschreibungen, menschliche Aufnahmen für den A1/A2-Kern, Prüfung einer Alternative wie MMS-TTS nur nach Lizenzentscheidung (CC BY-NC) |
| Whisper auf Telefonen (Größe, Speicher, Latenz, schwaches tr/ar-Ergebnis) | Frust, Abstürze | Laden nur auf Wunsch mit Größenangabe, Gerätecheck, WebGPU/WASM, Modell je Sprache, großzügige Schwellen, Selbstbewertung als Rückfall, Sprechen abschaltbar, Schalter |
| Religiöse Fehler oder erfundene Belege | schwer | Entwürfe nur aus gelieferten gepinnten Passagen, Prüfer für Passage und Zitatbereich, Belegprüfung durch einen Agenten, zwei Prüfende mit Pflicht-Häkchen je Beleg, Quellenzeile sichtbar, sofortiges Zurückziehen (Hash, Status), Beschränkung auf Grundwissen mit Fatwa-Meinung, keine Einzelfall-Fatwas |
| Engpass bei der menschlichen Prüfung (≈ 400+ h) | Inhalte stauen sich | Stichproben statt Vollprüfung für Sprache, effiziente Prüfoberfläche (Tasten, dreisprachig), Reihenfolge nach Nutzen, Fortschritt im Cockpit, Vorschau-Schalter |
| Lizenzen (Tatoeba BY, Wiktionary BY-SA, OpenITI NC, Stimmen) | Rechtsrisiko | `QUELLE.md` + SHA, Lizenzfeld je Eintrag (Prüfer blockiert), Namensnennung in der App und auf `/quellen`, Menschen-Entscheidungen LM-04/06/12 |
| iOS: Speicher wird nach 7 Tagen geräumt, PWA mit eigener Cookie-Ablage | Fortschritt weg, Anmeldung geht nicht | Installation empfehlen (PWAs sind ausgenommen), Anmeldung im Scope, Konto-Sync, Datei-Export |
| Konflikte und Uhrzeitfehler beim Sync | falsche Planung | Ereignisprotokoll, deterministisches Nachspielen, Klemme ≤ jetzt + 5 min, Eigenschaftstests |
| Root-SW löscht Lern-App-Caches | Offline kaputt | Ausnahme in `public/sw.js`, E2E „Root-SW-Update behält Lern-App-Vorrat“ |
| JS-Budget wächst | Leistung | Lazy-Chunks, Regeltests, Messrouten im Tor |
| Bauzeit und Repo-Größe | Bau > 15 min | Pakete bei Bedarf statt vorab, Audio und Modelle außerhalb von Repo und Bau, idempotenter Import |
| Platte (7,0 GB) | Abbruch | Budget aus 15, Strom-Filter, Aufräumen nach jedem Merge |
| KI-Arabisch mit Religionsbezug in Sprachkursen | Verstoß gegen KI-Regel | Formel- und n-Gramm-Wächter, Pflicht-Kennzeichnung `religionsbezug`, religiöse Prüfung, keine TTS dafür |
| Verwechslung mit Elifbe (osmanisch-türkische Buchstabennamen vs. MSA) | Verwirrung | eigene Namen in Lern-App-Texten, Elifbe bleibt unverändert, Einstufung erkennt Vorwissen |
| Suchtmuster bei Kindern | Schaden | keine Benachrichtigungen standardmäßig, keine Schuldtexte, keine Rangliste < 16, Pausetage, Hinweis auf Sitzungslänge |
| Kosten der Audio- und Modellroute (Funktionsaufrufe) | Kosten | `immutable` + CDN, SW-Vorrat, Rückfall Blob direkt (ADR 0029 Nr. 1) |

---

## 18 Offene Entscheidungen (mit Standard, laufen ohne Warten weiter)

| ID | Frage | Standard |
|---|---|---|
| O-1 | Sprachinhalte in Produktion vor bestandener Stichprobe zeigen? | nein (Schalter `lernapp_ungeprueft` aus) |
| O-2 | Religionsbezogene Sätze in Sprachkursen: eine oder zwei religiöse Prüfungen? | eine (Vier-Augen); Islam-Bausteine immer zwei |
| O-3 | Prüfoberfläche „Sprachprüfung“ dreisprachig? | ja, nur dieses Modul |
| O-4 | Bildkarten | nur Gegenstände und Symbole, keine Gesichter, keine Fotos |
| O-5 | Ziffern in der arabischen UI | östlich-arabisch, umschaltbar |
| O-6 | Audioformat | WebM/Opus 24 kbps; AAC-Rückfall nur nach Gerätetest |
| O-7 | Anmeldung im Scope der Lern-App | ja (wegen iOS) |
| O-8 | Prüfvermerk mit Namen? | nein, Rollenangabe |
| O-9 | Kindgerechter Islam-Pfad | Kennzeichnung je Lektion; eigener Pfad später |

### Critical Files for Implementation
- /home/user/IGMG/web/src/proxy.ts
- /home/user/IGMG/web/src/lib/sicherheit/header.ts (with /home/user/IGMG/web/next.config.ts)
- /home/user/IGMG/web/public/sw.js
- /home/user/IGMG/_gemeinde/werkzeuge/religion-pruefung.mjs
- /home/user/IGMG/web/src/lib/religioes/freigabe.ts (with /home/user/IGMG/web/src/server/actions/freigaben.ts and /home/user/IGMG/web/src/lib/rechte/matrix.ts)