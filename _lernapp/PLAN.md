# PLAN – Lern-App (Arbeitsplan)

Stand: 16.10.2026, L0. Grundlagen dieses Plans:
- genehmigter Plan „Lern-App“ (Abschnitt „Plan „Lern-App““ bis „# Anhang“, gesichert laut `AUFTRAG.md`)
- Verfeinerung durch den zweiten Planungs-Agenten (gesichert als `berichte/plan-verfeinerung-2026-10-16.md`, arabische Schrift
  durch Umschrift ersetzt); ihre Gliederung §0–§18 bleibt erhalten, damit Verweise aus KERN, ENTSCHEIDUNGEN und den ADRs
  gültig bleiben
- Lizenzbefund L0 (`berichte/lizenzen-l0.md` mit vier Teilberichten, Workflow `wf_cf9ab8d3-fce`)

**Rangfolge:** `AUFTRAG.md` → `KERN.md` → `ENTSCHEIDUNGEN.md` und ADR 0037–0045 → dieser PLAN. Bei Widerspruch gilt das
höhere Dokument; der PLAN wird dann nachgezogen.

**Fortschreibungen gegenüber Entwurf und genehmigtem Plan:**

| Punkt | Neu | Grund |
|---|---|---|
| Adresse | `/lern-app/[ui]`; jede Nennung von `/app` im genehmigten Plan gilt als `/lern-app` | L3-E11, ADR 0037 |
| Sprachausgabe | Piper nur noch `de_DE-mls-medium`; Stimmen je Sprache nach L3-E10 (§6.8) | Lizenzbefund, L3-E10 |
| Hanafitische Quellen | OpenITI nur lokal, nie im Repository; Ausgaben nach Lizenzbericht (§6.7) | Lizenzbefund, ADR 0045 Nr. 12 |
| Koran-Wurzeln | Quranic Arabic Corpus nicht verwenden; eigene Wurzeltabelle (§5.3) | Lizenzbefund, L0-E12 |
| Sprachinhalte vor der Stichprobe | öffentlich mit Hinweis „noch nicht von Muttersprachlern geprüft“ (O-1, `lernapp_ungeprueft` an) | genehmigter Plan §6 ML-02, L3-E03, ADR 0041 Nr. 8 |
| Religiöse Freigaben | Sprachkurs-Einträge mit `religionsbezug`, Formelliste, Koran-Bedeutungen und Wurzeltabelle mit zwei Freigaben; Hadith-N-Gramm ab 4 Wörtern (O-2, O-10, O-11) | genehmigter Plan §2.3, §3.1, §3.4; L3-E09, ADR 0040 |
| Budgets | Hülle ≤ 120 KB zusätzlich zu den Routenbudgets (§3.6) | KERN §9 |
| Mengen | 72 Einheiten je Zielsprache statt 195; Wissen 28 Einheiten statt 14 Module | Verfeinerung, L3-E04 |
| Tagesziel | XP oder Lektionen statt Minuten | ADR 0043 |
| Bestenliste | Gruppe **oder Familie**, nur Zustimmung ab 16 | L3-E02, ADR 0043 |
| Schalter | `lernapp_sync` statt `lernapp_abgleich`; Schreibkorrektur unter `lernapp_gruppen` statt eigenem `lernapp_schreiben`; neu `lernapp_ungeprueft`, `lernapp_sprechen`, `lernapp_meldungen`, `lernapp_rangliste`, `lernapp_statistik`, `push_lernapp` (§11) | Verfeinerung, KERN §6 |
| Meldungen | eigene Antwort nur optional bei Angemeldeten ab 16; sonst wie genehmigter Plan §2.7 nur Aufgabe und Kategorie | KERN §5, ADR 0041 Nr. 9 |
| Bewegung | Register B-28…B-35 statt B-28…B-32 | Verfeinerung, KERN §10 |
| ADR-Nummern | Plan-ADR 0038 → 0040, 0039 → 0039 + 0045, 0040 → 0037, 0041 → 0043 | Verfeinerung |
| Abnahme | Plan LZ-01…LZ-08 → `ABNAHME.md` Z-L01…Z-L22 | Verfeinerung, Lizenzbefund |
| Menschen | Plan ML-01…ML-06 → `MENSCHEN.md` LM-01…LM-36 | Verfeinerung, Lizenzbefund |
| Schrift | arabische Schrift aus dem Entwurf durch Umschrift oder Codepunkte ersetzt | KERN §3 (Werkstatt nur Umschrift) |

---

## 0 Kurzfassung

- **Eigener Bereich:** `/lern-app/{de|tr|ar}/…` mit eigenem Wurzel-Layout außerhalb von `[locale]`. Arabisch mit voller
  RTL-Darstellung gibt es nur dort. Das Website-Routing bleibt de/tr/en, die vorgerenderten Seiten bleiben unberührt. Eigene
  installierbare PWA (Scope `/lern-app/`) mit eigenem Service Worker.
- **Lokal zuerst:** Fortschritt, Wiederholungskarten (FSRS über `ts-fsrs`), XP, Serie und Abzeichen stehen als
  Ereignisprotokoll in IndexedDB (`idb`). Ohne Konto voll nutzbar. Mit Konto, Einwilligung und Schalter wird abgeglichen:
  Ereignisse werden vereinigt, der Zustand entsteht durch deterministisches Nachspielen, ohne Konflikte.
- **Inhalte:** je Zielsprache ein Korpus A1–C1 (72 Einheiten, ≈ 6.500 Lemmata, ≈ 26.000 Sätze), den beide Ausgangssprachen
  nutzen; Übersetzungen, angenommene Antworten und kontrastive Tipps je Richtung. KI-Entwurf über Workflow-Agenten gegen
  JSON-Schemas, danach harte Prüfer, Gegenprüfung, Rückübersetzung und muttersprachliche Stichproben.
- **Auslieferung:** Kurspakete als JSON je Richtung und Einheit, adressiert über den Inhalts-Hash. Audio als Bündel `.lpa` je
  Zielsprache und Einheit im Blob `lernapp`, ausgeliefert über eine eigene Route. Sprachausgabe läuft lokal beim Erzeugen, nie
  im Vercel-Bau und nie im Browser.
- **Islamisches Wissen:** nur Deutsch, hanafitisch, Glaube maturiditisch; Aussagen nur aus gelieferten Passagen benannter
  Werke mit Beleg je Aussage. Sichtbar erst nach **zwei** Freigaben zum aktuellen Inhalts-Hash, Verfasser ausgeschlossen, die
  Administration ersetzt keine Prüfung. Koran-Arabisch zeigt nur freigegebene Bedeutungen und hat keine Sprachausgabe.
- **Sprechen und Schreiben:** Whisper im Browser (Worker, Modell vom eigenen Ursprung, nur nach Klick). Schreiben mit
  Prüfliste, Musterantwort, Selbsteinschätzung und optional der Lehrkraft.
- **Spielelemente:** sanft, ohne Herzen und ohne Schuldtexte. Bestenliste nur auf Wunsch ab 16 in Gruppe oder Familie.
- **Lizenzen:** ausgelieferter Code MIT, Apache-2.0, BSD, ISC, MPL-2.0, OFL; Daten, Audio und Bilder CC0, CC BY, CC BY-SA.
  Lerninhalte unter CC BY-SA 4.0. Kein NC-, ND- oder Research-only-Material. GPL und LGPL nur als lokales Werkzeug.
- **Ablauf:** Etappen L0–L8 (§14). Höchstens 2 Code-Agenten gleichzeitig in Arbeitsbäumen, Inhalts-Agenten ohne Bau bis 6.

---

## 1 Befunde im Bestand, die den Plan prägen

| # | Befund | Datei(en) | Folge für den Plan |
|---|---|---|---|
| 1 | Sprachen fest de/tr/en, `as-needed`; `request.ts` prüft `hasLocale` → `notFound` | `web/src/i18n/routing.ts`, `web/src/i18n/request.ts` | `ar` **nicht** in `routing.locales`; eigene Wurzel `/lern-app/[ui]` mit eigener Textladung |
| 2 | Der Proxy schreibt jede Adresse ohne Präfix über next-intl auf `/de/…` um | `web/src/proxy.ts` | früher Bypass für `/lern-app` und Weiterleitung `/(tr\|en)/lern-app…` |
| 3 | Das Wurzel-Layout meldet den Root-SW an; öffentliche Seiten laden kein next-intl im Client | `web/src/app/[locale]/layout.tsx`, `web/tests/unit/bundle-regeln.test.ts` | eigene SW-Anmeldung; Texte als Props oder kleines Wörterbuch |
| 4 | Der Root-SW (Scope `/`) löscht beim Aktivieren alle Caches außer `igmg-v1-*` und `igmg-koran-v1` | `web/public/sw.js` | Ausnahme `igmg-lernapp-*` im Root-SW **zwingend** |
| 5 | Manifest mit Scope `/` | `web/src/app/manifest.ts` | eigenes Manifest je UI-Sprache mit `scope: /lern-app/` und eigener `id` |
| 6 | CSP ohne `'wasm-unsafe-eval'`, `worker-src 'self'`, `media-src 'self'`; Mikrofon nur `/verwaltung/rezitationen` | `web/src/lib/sicherheit/header.ts`, `web/next.config.ts` | eigene Header-Regel für `/lern-app/:pfad*` |
| 7 | Arabische Schrift nur in `web/daten/**`, `alphabet.ts`, Tests und zwei Dateien erlaubt | `_gemeinde/werkzeuge/religion-pruefung.mjs` | begründete Erlaubnisse für arabische UI-Texte und MSA-Inhalte **plus** Formel- und N-Gramm-Wächter (KERN §3) |
| 8 | Freigabe kennt genau **eine** Prüfung (Vier-Augen) | `web/src/lib/religioes/freigabe.ts`, `web/src/server/actions/freigaben.ts`, Tabelle `freigabe` | Zwei-Prüfer-Logik, an den Inhalts-Hash gebunden |
| 9 | Administration darf alles außer `NIE_PER_ADMINISTRATION`; keine Sprachprüf-Rolle | `web/src/lib/rechte/matrix.ts`, Enum `rolle` in `schema/typen.ts` | Rolle `sprachpruefung` in **eigener** Migration (PostgreSQL 16, `web/tests/e2e/LIESMICH.md` 1a); `lernapp.religioes.pruefen` in `NIE_PER_ADMINISTRATION` |
| 10 | Tabelle `aufgabe` (mit `AufgabeBezug`) samt `aufgabe_erledigt` hat keine Oberfläche | `web/src/lib/db/schema/lernen.ts` | Zuweisungen als `bezug = { art: 'lernapp', … }`; Lehrkraft-Oberfläche neu |
| 11 | Elifbe: Codepunkte, Formen, Züge (B-17), Übungen (B-18), Weg (B-24); Enum enthält `hoeren`, Logik nur 4 Arten | `web/src/lib/elifbe/*`, `web/src/components/website/elifbe/*` | Schrift-Vorkurs Arabisch nutzt `bewerteSpur`, `Schreibweg.tsx`, `Weg.tsx` |
| 12 | Koran: `quran_wortform`, `quran_wort`, `quran_wortbedeutung(_ort)` mit Freigabe, `quran_wortzeit` | `web/src/lib/db/schema/quran.ts` | Koran-Arabisch nur über Verweise; Häufigkeitsliste als Hoca-Arbeitsliste |
| 13 | Audio: Magic-Bytes, WebM-Dauer, Route mit Byte-Bereichen (L2-E06), Werkstatt-Komponenten | `web/src/lib/audio/*`, `web/src/app/audio/[...pfad]/route.ts`, `web/src/components/verwaltung/rezitationen/*` | Audio-Route und Audio-Studio nach diesem Muster |
| 14 | Schalter: `FUNKTIONEN`, `IN_PRODUKTION_AN`, `MIT_PERSONENDATEN` | `web/src/lib/funktionen-regeln.ts`, `web/src/lib/validierung/einstellungen.ts` | neue Schalter `lernapp*` (§11) |
| 15 | Bau: Migration, `inhalte-import.ts`, `next build`; ohne DB PGlite (Beispielmodus) | `web/scripts/vercel-bau.mjs`, `web/scripts/bau-datenbank.mjs`, ADR 0017/0019 | Lern-App-Import idempotent einhängen; Pakete im Beispielmodus vorrendern |
| 16 | `Mehrsprachig = { de, tr?, en? }` | `web/src/lib/db/schema/typen.ts` | eigener Typ `LernText = Partial<Record<'de'\|'tr'\|'ar', string>>` |
| 17 | 4 Kerne, **7,0 GB frei** (gemessen 16.10.2026) | – | Werkzeuge und Modelle im Scratchpad, Audio direkt in den Blob, `.next` nach jedem Merge löschen (§15) |
| 18 | Prüfinfrastruktur: vitest unit/integration (PGlite), Playwright telefon/desktop, `web/scripts/messen.mjs`, Regeltests | `web/vitest.config.mts`, `web/playwright.config.ts`, `web/tests/unit/{bundle,bewegung}-regeln.test.ts` | Lern-App-Projekte und Messrouten ergänzen |
| 19 | Letzte Migration `0016_mail_zusammenfassung.sql`; höchste ADR 0036 | `web/drizzle/migrations/`, `web/docs/adr/` | Migrationen 0017–0019, ADR 0037–0045 frei |
| 20 | Vorlage für Sprecher-Vereinbarungen vorhanden | `web/docs/recht/entwuerfe/vereinbarung-rezitation.md` | Grundlage für die Vereinbarung der Lern-App-Aufnahmen (LM-06, LM-26) |

---

## 2 Entscheidungen und ADRs

**Werkstatt:** `_lernapp/` mit AUFTRAG, KERN, PLAN, ABNAHME, MENSCHEN, ENTSCHEIDUNGEN, STATUS, PRUEFPUNKT sowie `berichte/`,
`belege/`, `protokolle/`, `werkzeuge/`, `lehrplan/`. Dazu ein CLAUDE.md-Block und der Eintrag `_lernapp` in `.vercelignore`.
Branch, Tore und Fast-Forward nach `ENTSCHEIDUNGEN.md` L3-E12.

**`ENTSCHEIDUNGEN.md`:** L3-E01…L3-E08 sind die Nutzerentscheidungen vom 16.10.2026; L3-E09 (KI-Regel 2), L3-E10 (Stimmen),
L3-E11 (Adresse), L3-E12 (Arbeitsweise).

| ADR | Datei | Kern |
|---|---|---|
| 0037 | `0037-lern-app-bereich-und-oberflaechensprachen.md` | `/lern-app/[ui]`, Proxy-Bypass, RTL, Manifest und SW je Scope, Anmeldung im Scope |
| 0038 | `0038-lern-app-offline-und-synchronisation.md` | IndexedDB, Ereignisprotokoll, FSRS-Nachspielen, Zusammenführung, Uhrzeit-Klemme |
| 0039 | `0039-lern-app-kurspakete-und-audio.md` | Hash-Adressen, Bündel `.lpa`, Blob `lernapp`, Route `immutable`, was vertont wird |
| 0040 | `0040-ki-regel-2-lern-app.md` | KI-Regel 2: erlaubt/verboten, Quellenpflicht, zwei Freigaben, Wächter |
| 0041 | `0041-lern-app-sprachpruefung-und-stichproben.md` | Rolle `sprachpruefung`, Status je Eintrag, Stichprobe, Annahmeregel, Hinweis statt Sperre |
| 0042 | `0042-lern-app-sprechen-und-schreiben-im-browser.md` | Whisper im Worker, Modell selbst gehostet, `'wasm-unsafe-eval'` nur unter `/lern-app`, Schreiben ohne KI |
| 0043 | `0043-lern-app-spielelemente-ohne-druck.md` | XP, Tagesziel, Serie mit Pausetagen, Abzeichen, Gruppenziel, Bestenliste ab 16 mit Zustimmung |
| 0044 | `0044-schrift-der-arabischen-oberflaeche.md` | Noto Sans Arabic nur im Lern-App-Layout, Eingrenzung der RTL-Regel |
| 0045 | `0045-offene-sprachdaten-und-stimmen.md` | Lizenzrahmen, Tatoeba, kaikki, Häufigkeit, Bildkarten, Stimmen je Sprache, hanefitische Quellen, eigene Koran-Wurzeltabelle |

**Status-Vermerke in bestehenden ADRs:** 0030 („Nr. 4 für die Lern-App fortgeschrieben durch ADR 0040“), 0014 (→ 0044), 0016
(Prüfoberfläche Sprache dreisprachig → 0041), 0025 (→ 0045), 0009 (Tanzil, ergänzt durch 0045), 0012 (CSP der Lern-App →
0042). ADR 0029 bleibt für Rezitationen unberührt; ADR 0039 baut darauf auf.

---

## 3 Architektur

### 3.1 Routen und Adressen

| Adresse | Art | Inhalt |
|---|---|---|
| `/lern-app` | Proxy 308 → `/lern-app/de` | Einstieg ohne Sprache |
| `/(tr\|en)/lern-app/…` | Proxy 308 → `/lern-app/(tr\|de)/…` | Links aus der Website |
| `/lern-app/[ui]` | statisch (3 Seiten) | Start: Kurswahl, Tagesziel, „Weiter lernen“, fällige Wiederholung (Client) |
| `/lern-app/[ui]/[kurs]` | statisch (3 × 8) | Lernpfad: Abschnitte → Einheiten → Stationen (B-24) |
| `/lern-app/[ui]/[kurs]/ueben?l=<lektion>` | statische Hülle | Lektionsspieler (`useSearchParams` unter `Suspense`; SW mit `ignoreSearch`) |
| `/lern-app/[ui]/[kurs]/wiederholen` | statische Hülle | FSRS-Sitzung |
| `/lern-app/[ui]/[kurs]/einstufung` | statische Hülle | Einstufungstest (adaptiv, lokal) |
| `/lern-app/[ui]/[kurs]/tipps?e=<einheit>` | statische Hülle | Grammatik-Tipps aus dem Paket |
| `/lern-app/[ui]/{fortschritt,wortschatz,einstellungen,quellen}` | statisch | lokale Ansichten; Quellen und Namensnennung (auch offline) |
| `/lern-app/[ui]/gruppe` | statische Hülle + API | Zuweisungen, Gruppenziel, Bestenliste (Schalter) |
| `/lern-app/[ui]/anmelden` | dynamisch, Nonce-CSP | Anmeldung im Scope (iOS-PWA mit eigener Cookie-Ablage): E-Mail, Benutzername (Kind), Passkey, TOTP |
| `/lern-app/[ui]/manifest.webmanifest` | Route | Manifest je UI-Sprache (`lang`, `dir`, `id` und `scope` `/lern-app/`) |
| `/lern-app/pakete/[kurs]` | Route, `'use cache'` + Tag | Kursverzeichnis (Version, Einheiten-Hashes, Größen) |
| `/lern-app/pakete/[kurs]/[einheit]/[hash]` | Route, unveränderlich | Einheitenpaket (nur ausgelieferte Einträge) |
| `/lern-app/audio/[...pfad]` | Route (Muster `app/audio`) | Bündel `.lpa` aus dem Blob, `immutable` |
| `/lern-app/modelle/[...pfad]` | Route oder statisch (Spike S5, LM-27) | Whisper-ONNX und ORT-WASM vom eigenen Ursprung |
| `/api/lernapp/{sitzung,sync,gruppe,schreiben,meldung,statistik}` | dynamisch | §3.8, §11 |
| `/mein-bereich/unterricht/[gruppe]/lern-app` (tr `/hesabim/derslerim/[gruppe]/ogrenme-uygulamasi`, en `/my-account/teaching/[gruppe]/learning-app`) | Konto-Seite | Lehrkraft: zuweisen, Stand, Schreibabgaben korrigieren |
| `/verwaltung/lernapp/**` | Verwaltung | §7 |

**Kurs-Slugs:** Sprachkurse `tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`; Wissen `islam` (nur
Deutsch, unter jeder UI-Sprache mit Hinweis „auf Deutsch“); Koran `koran` (Bedeutungen de oder tr; in der arabischen UI
ausgeblendet). UI-Sprache und Ausgangssprache sind getrennte Einstellungen; Standard: gleich.

### 3.2 Wurzel-Layout, Proxy und Header

**Wurzel-Layout** `web/src/app/lern-app/[ui]/layout.tsx`: `generateStaticParams` de/tr/ar mit `unstable_paramMatching` und fester Fangroute `[ui]/[...rest]` (ADR 0037, Fortschreibung S1; `dynamicParams = false` bricht den Bau);
`<html lang dir>`; Schriften (ADR 0044); Anmeldung von `/lern-app/sw.js`; `metadata.manifest`; eigene `not-found.tsx` und
`error.tsx`. Spike S1 belegt den Vorrang vor `[locale]`, den Bau unter Cache Components und dass `app/manifest.ts` nicht
zusätzlich verlinkt wird.

**Proxy-Ergänzung** (vor `sprachRouting`, gemeinsame Datei):

```ts
if (pathname === '/lern-app' || pathname === '/lern-app/') return NextResponse.redirect(new URL('/lern-app/de', request.url), 308);
const fremd = pathname.match(/^\/(tr|en)\/lern-app(\/.*)?$/);           // Links der Website
if (fremd) return NextResponse.redirect(new URL(`/lern-app/${fremd[1] === 'tr' ? 'tr' : 'de'}${fremd[2] ?? ''}`, request.url), 308);
if (/^\/lern-app\/(de|tr|ar)\/anmelden(\/|$)/.test(pathname)) { /* Nonce-CSP + noindex + no-store wie Konto-Seiten */ }
if (pathname.startsWith('/lern-app/')) return NextResponse.next();      // kein next-intl
```

**Header** (`web/src/lib/sicherheit/header.ts` + `web/next.config.ts`, ADR 0042 Nr. 9):
- `cspLernApp()`: öffentliche CSP plus `script-src 'wasm-unsafe-eval'`, `worker-src 'self'`, `media-src 'self' blob:`; dazu
  COOP `same-origin` und COEP `require-corp` für ganz `/lern-app/:pfad*` (ADR 0042, Fortschreibung S2);
  Regel `/lern-app/:pfad*` nach der öffentlichen Regel; `CSP_AUSNAHMEN` um `lern-app` ergänzen.
- `Permissions-Policy: microphone=(self)` nur für `…/ueben`, `…/wiederholen` und `/verwaltung/lernapp/audio/:pfad*`.
- COOP/COEP: Gewinn in Spike S2 belegt (1,4–1,8× mit Threads) – für ganz `/lern-app` gesetzt (siehe oben).

### 3.3 Texte der Oberfläche

- `web/messages/lernapp/{de,tr,ar}.json`, Namensraum `lernapp` (nicht in `messages/bereiche`, dort gilt de/tr/en).
- Server: `web/src/lib/lernapp/texte.ts` mit `createTranslator` und ausdrücklichem `locale`.
- Client: `web/src/lib/lernapp/format.ts` (< 1 KB), ICU-Teilformatierer für `{name}` und `{n, plural, …}`; Arabisch mit
  zero/one/two/few/many/other; Unit-Test gegen `createTranslator`.
- `web/scripts/sprachen-pruefen.mjs` prüft zusätzlich de ⊆ tr, de ⊆ ar, gleiche Platzhalter; ar darf mehr Pluralkategorien
  haben.
- **Religion-Prüfung** (KERN §3): arabische Schrift zusätzlich erlaubt in `web/messages/lernapp/ar.json`,
  `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**`, `web/messages/verwaltung/lernapp-pruefung.json` (nur bei O-3) und
  in der geprüften eigenen Wurzeltabelle unter `web/daten/` (L0-E12), jeweils nur zusammen mit dem Wächter (§6.4). **Nie** in
  `web/inhalte/lernapp/{islam,koran}/**`, in Komponenten und in `_lernapp/**`. Rahmenpläne: arabische Beispiele nur in
  Umschrift oder als Verweis.
- Website: `/lernen` bekommt die Stationen „Sprachen lernen“ und „Wissen üben“ als `<a href="/lern-app/…">`.

### 3.4 RTL und Schriften

- Nur logische Klassen (`ms-/me-/ps-/pe-/start-/end-/text-start`), Spiegelung über `rtl:`; Regeltest
  `web/tests/unit/lernapp/rtl-regeln.test.ts`.
- Neue Werkzeugklassen in `globals.css`: `auslauf-anfang`, `auslauf-ende`, `raster-wortbank`, `lern-leiste`; `freie-werte.mjs` 0.
- Fremde Richtung im Inhalt immer mit `lang` und `dir`; gemischte Zeilen isoliert (`<bdi>`).
- Schriften (ADR 0044): `--font-arabisch-ui` (Noto Sans Arabic 400/700, OFL, nur im Lern-App-Layout); Kursinhalt in
  `--font-arabic` (Amiri); `--font-quran` nur für den Koran. Die globale Regel `[dir=rtl]` in `globals.css` wird eingegrenzt.
- Ziffern in der arabischen UI östlich-arabisch, umschaltbar (O-5, LM-18).

### 3.5 PWA und Service Worker

- Eigener SW `web/public/lern-app/sw.js`, Scope `/lern-app/`:
  - `igmg-lernapp-schale-v<N>`: Hülle der gewählten UI-Sprache und `/_next/static/**` (Vorrat zuerst)
  - `igmg-lernapp-pakete`: Verzeichnis „Netz zuerst“, Einheiten „Vorrat zuerst“
  - `igmg-lernapp-audio`: Bündel, Vorrat zuerst
  - `igmg-lernapp-modelle`: Whisper und ORT
  - nie vorgehalten: `/api/**`, `/lern-app/*/anmelden`
- Root-SW `web/public/sw.js` behält `igmg-lernapp-*` (Befund 4; gemeinsame Datei).
- Speichern: automatisch aktuelle und nächste Einheit; bewusst „Stufe offline speichern“ mit Ring nach Bytes (B-27);
  `navigator.storage.persist()` erst dabei; Belegung über `storage.estimate()`.
- Push-Erinnerung nur über die bestehende Root-Registrierung (ADR 0043).

### 3.6 JS-Budget und Ladeplan (KERN §9)

| Teil | Budget (gz) | Laden |
|---|---|---|
| Hülle (Rahmen, Kopf, Inseln) | eigener Anteil ≤ 20 KB über dem Next/React-Grundstock (≈ 128 KB) | statisch |
| Start, Lernpfad, Fortschritt | eigener Anteil ≤ 30 KB, Route gesamt ≤ 180 KB | statisch; Insel für den lokalen Stand |
| Lektionsspieler | zusätzlich ≤ 60 KB, Route gesamt ≤ 210 KB (KERN §9, Fortschreibung S1) | erst in der Lektion |
| je Übungstyp | ≤ 15 KB | `import()` beim ersten Auftreten, vorab für die nächste Aufgabe |
| arabische Bildschirmtastatur | ≤ 10 KB | erst bei arabischem Freitext |
| Sprechmodul (Worker, transformers.js, ORT-WASM, whisper-base q8 ≈ 77 MB) | außerhalb des Routenbudgets | nur nach Klick, Größe vorher angezeigt, Gerätecheck |
| Mein Bereich (Lehrkraft) | ≤ 230 KB | wie bisher |

Durchgesetzt durch `web/tests/unit/lernapp/bundle-regeln.test.ts` (kein next-intl, kein `@/lib/utils` im Client;
`@huggingface/transformers` nur in `*.worker.ts`; Übungstypen nur per `import()`; kein GPL-/LGPL-Code im Client) und
Messrouten in `web/scripts/messen.mjs`.

### 3.7 Lokale Datenhaltung (ADR 0038)

Datenbank `igmg-lernapp`, Migrationen in `web/src/lib/lernapp/lokal/db.ts`: Speicher `profile`, `ereignisse` (Wahrheit, nur
anhängen), `karten`, `lektionen`, `tage`, `abzeichen` (abgeleitet), `einstellungen` (letzter Schreiber gewinnt), `pakete`,
`sync`. Neuberechnung bei neuer `ableitungsVersion`; ohne IndexedDB Speicher im Arbeitsspeicher mit Hinweis; Export und Import
als JSON (Gerätewechsel, Art. 20 DSGVO).

### 3.8 Synchronisation (ADR 0038)

```ts
type Ereignis = {
  geraet: string;   // UUID je Gerät+Profil
  seq: number;      // fortlaufend je Gerät
  am: string;       // ISO, Geräteuhr; Server klemmt auf ≤ jetzt + 5 min
  tag: string;      // Lerntag JJJJ-MM-TT in Ortszeit des Geräts
  art: 'bewertung' | 'lektion' | 'xp' | 'pause' | 'einstellung' | 'einstufung' | 'tagesziel';
  daten: unknown;   // je Art ein Zod-Schema (src/lib/lernapp/ereignisse/typen.ts)
};
```

| Zustand | Regel |
|---|---|
| Ereignisse | Vereinigung über `(benutzer, geraet, seq)`: idempotent, kommutativ, assoziativ |
| SRS-Karte | Bewertungen nach `(am, geraet, seq)` durch `ts-fsrs` nachspielen (Parameterversion fest, Fuzz aus oder geseedet) |
| Lektion erledigt, beste Quote | Vereinigung bzw. Maximum |
| XP, Tagesziel, Serie, Abzeichen | aus den Ereignissen abgeleitet (`ableiten.ts`, `serie.ts`, `abzeichen.ts`) |
| Einstellungen | letzter Schreiber gewinnt nach `(am, geraet)` |

`POST /api/lernapp/sync` mit `{ geraet, cursor, ereignisse[≤ 500] }` (≤ 256 KB); Prüfung von Sitzung, Schalter `lernapp_sync`,
Einwilligung `lernapp`, Ursprung, Zod; `ON CONFLICT DO NOTHING`; Kartenstand mit derselben Ableitung; erledigte Zuweisungen
setzen `aufgabe_erledigt`; Antwort mit fremden Ereignissen (≤ 2.000, `mehr`) und neuem Zeiger; Bremse 30 je Minute und Konto.
Erste Anmeldung fragt nach Übernahme des lokalen Fortschritts. Ereignisse älter als 12 Monate werden verdichtet.

### 3.9 Datenmodell (Drizzle)

Migrationen additiv in `web/drizzle/migrations/`: `0017_lernapp_rolle.sql` (nur `ALTER TYPE rolle ADD VALUE 'sprachpruefung'`),
`0018_lernapp_inhalte.sql`, `0019_lernapp_nutzung.sql`. Schemas `web/src/lib/db/schema/lernapp.ts` und `lernapp-nutzung.ts`,
registriert in `schema/index.ts`.

**Inhalt** (Schlüssel stabil, z. B. `ar.a1.e03.s0042`; `inhaltHash` = SHA-256 des kanonischen JSON):

| Tabelle | Wichtige Spalten |
|---|---|
| `lernapp_kurs` | id (`de`, `tr`, `ar`, `islam`, `koran`), art, zielsprache, version, aktiv |
| `lernapp_richtung` | id (`tr-aus-de` …), kursId, ausgangssprache, aktiv, titel (LernText) |
| `lernapp_abschnitt` | kursId, stufe (`a1…c1` bzw. `grund/aufbau/vertiefung`), kannBeschreibungen (eigene Formulierungen, L0-E19) |
| `lernapp_einheit` | abschnittId, schluessel, reihenfolge, thema, kannBeschreibungen, symbol, `nurFuerAusgang`, status |
| `lernapp_lektion` | einheitId, schluessel, art (`lektion`, `geschichte`, `wiederholung`, `pruefstein`, `schrift`, `schreiben`, `sprechen`), ziel |
| `lernapp_aufgabe` | lektionId, schluessel, typ (§4), daten jsonb (Zod-Union), reihenfolge, inhaltHash |
| `lernapp_lemma` | kursId, lemma, wortart, merkmale, formen, stufe, frequenzRang, symbol, religionsbezug, quelle, lizenz, namensnennung |
| `lernapp_satz` | kursId, text, tokens, stufe, quelle (`ki:<lauf>`, `tatoeba:<id>`, `redaktion`), lizenz, namensnennung, religionsbezug |
| `lernapp_uebersetzung` | bezugTyp, bezugId, sprache, text, alternativen, quelle, lizenz, namensnennung |
| `lernapp_tipp` | einheitId, ausgangssprache, inhalt (Tiptap, ADR 0006) |
| `lernapp_text` | Dialog, Geschichte, Lesetext: zeilen `[{sprecher, satzId}]`, fragen |
| `lernapp_aussage` | Wissen: lektionId, text (de), reihenfolge, meinung, kinderGeeignet |
| `lernapp_quelle` | kurz, werk, autor, todesjahr, ausgabe, art (`fiqh`/`aqida`/`ilmihal`/`offene_daten`), openitiUri, sha256 der lokalen Arbeitskopie, lizenz, nurVerweis |
| `lernapp_beleg` | bausteinTyp, bausteinId, quelleId, passage (z. B. `quduri.ms0042`), stelle (Kitab/Bab/Fasl, Band, Seite), zitatVon/zitatBis (Zeichenbereich in der lokalen Arbeitskopie), art (`sinngemaess` für KI-Aussagen; `woertlich` nur für von Menschen übersetzte Stellen, ADR 0040 Nr. 4) |
| `lernapp_audio` | sprache, textHash, stimme (`tts:<modell>@<sha>` / `mensch:<sprecherId>`), buendel, versatz, laenge, dauerMs, sha256 |
| `lernapp_sprecher` | name, vereinbarungMediumId (Pflicht, ADR 0029 Nr. 4), kiSyntheseErlaubt |
| `lernapp_pruefung` | inhaltTyp, inhaltId, inhaltHash, art (`sprache_ziel`/`sprache_uebersetzung`/`religioes`), pruefendeId, urteil, kategorie, belegeGeprueft, kommentar, am |
| `lernapp_stichprobe` | einheitId, sprache/richtung, art, seed, groesse, ergebnis, entscheidung |
| `lernapp_pruefer_sprache` | benutzerId, sprache, ebene |
| `lernapp_meldung` | aufgabeSchluessel, kategorie, antwort (optional, nur angemeldet ab 16; ohne Konto und bei Kindern nie), am; ohne Benutzerbezug |

**Status je Baustein** (`web/src/lib/lernapp/freigabe.ts`, rein):
- **Sprache** (ADR 0041): `entwurf` → `automatisch_geprueft` (sichtbar mit Hinweis, Schalter `lernapp_ungeprueft`) →
  `veroeffentlicht` (Stichprobe bestanden, kein „abgelehnt“ zum aktuellen Hash). Einträge mit kritischem Befund werden nicht
  ausgeliefert. Einträge mit `religionsbezug` erst nach zwei religiösen Freigaben, unabhängig von Status und Schalter.
- **Wissen** (ADR 0040 Nr. 5): `geprueft` bei ≥ 2 Prüfungen `ok` zum aktuellen `inhaltHash` von verschiedenen Personen mit
  `religioese_pruefung`, keine davon Verfasser, `belegeGeprueft` je Beleg. Lektion nur sichtbar, wenn alle Bausteine geprüft
  sind. Verlauf zusätzlich in `freigabe`.

**Nutzung:** `lernapp_profil`, `lernapp_ereignis` (eindeutig `(benutzerId, geraet, seq)`), `lernapp_karte`, `lernapp_tag`,
`lernapp_schreibabgabe` (`textVerschluesselt` + schluesselId, Rubrik, Kommentar, loeschenAb), `lernapp_statistik_tag` (ohne
Personenbezug).

**Bestand erweitern:** `AufgabeBezug` um `{ art: 'lernapp'; kurs; einheit?; lektion? }`; Enum `konto_einwilligung_art` um
`'lernapp'`; `TAG` in `web/src/lib/cache/tags.ts` um `lernapp`, `lernappKurs(id)`; Löschlauf `web/src/lib/loeschen/gemeinde.ts`
(12 Monate Inaktivität, Schreibabgaben 12 Monate).

**Rechte** (`web/src/lib/rechte/matrix.ts`): `lernapp.lesen`, `lernapp.bearbeiten`, `lernapp.veroeffentlichen`,
`lernapp.sprache.pruefen`, `lernapp.religioes.pruefen` (in `NIE_PER_ADMINISTRATION`), `lernapp.audio.bearbeiten`,
`lernapp.statistik.lesen`. Rollen: `bildung` (lesen, bearbeiten, veröffentlichen, Audio, Statistik), `sprachpruefung` neu
(lesen, sprache.pruefen je eigener Sprache), `religioese_pruefung` (lesen, religioes.pruefen), `leitung` (lesen, Statistik).
Gruppenrechte der Lehrkräfte in `web/src/lib/rechte/gruppen.ts`.

### 3.10 Kurspakete und Audio (ADR 0039)

- Paketbau `web/src/lib/lernapp/paket/bauen.ts`: kanonisches JSON je Richtung und Einheit mit Texten, Alternativen, Tokens,
  Lemma-Angaben, Tipps, Symbolpfaden, Audio-Verweisen und **Quelle, Lizenz und Namensnennung je Eintrag** (offline lesbar).
  Adresse = SHA-256. Kursverzeichnis mit `'use cache'`, `cacheTag(TAG.lernappKurs(id))`, `cacheLife('max')`; jede Freigabe ruft
  `updateTag`. Einheiten bei Bedarf; nur im Beispielmodus alle vorgerendert (≈ 450 Ausgaben).
- Bündel `.lpa` (`paket/buendel.ts`) je Zielsprache und Einheit: Kopf mit Index, danach die Clips; Abspielen über `Blob.slice`;
  „langsam“ = `playbackRate 0.75` mit `preservesPitch`.
- Blob `lernapp` (fra1), Route `/lern-app/audio/…` nach `liefereAudio` (200/206/416, `immutable`); Rückfall bei Kosten: externer Rewrite
  (ADR 0039, Fortschreibung Nr. 6; die Blob-Adresse in `media-src` entfällt).
- Ohne Blob (Beispielmodus, E2E): synthetische Testbündel aus Tönen, nie Rezitationen; sonst „Audio folgt“.
- Keine technischen Schutzmaßnahmen (CC BY-SA 4.0).

### 3.11 Neue Module (Überblick)

```
web/src/app/lern-app/[ui]/…                      Seiten (3.1), layout.tsx, not-found.tsx, error.tsx, manifest.webmanifest/route.ts
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
web/src/lib/lernapp/inhalt/{schema,import}.ts, inhalt/pruefer/*.ts
web/src/lib/db/schema/{lernapp,lernapp-nutzung}.ts
web/src/server/queries/lernapp/*.ts, web/src/server/actions/lernapp-*.ts
web/src/components/lernapp/{Rahmen,Kopf,Lernpfad,Spieler,Rueckmeldung,Fortschrittsleiste,Abschluss,Serie,Abzeichen,OfflineKurs}.tsx
web/src/components/lernapp/{aufgaben/*,tastatur/ArabischeTastatur.tsx,tastatur/Sonderzeichen.tsx,sprechen/*,schreiben/*}
web/src/components/verwaltung/lernapp/*
web/scripts/lernapp/{import,schemas,pruefen,audio-liste,audio-manifest,modelle-pruefen,export-korrekturen}.ts
web/inhalte/lernapp/{rahmen,sprache,uebersetzung,islam,koran,aussprache,audio-manifest,symbole,schemas}/
web/daten/{tatoeba,kaikki,haeufigkeit,lernapp-modelle}/QUELLE.md + gepinnte Auszüge
web/daten/hanafi-quellen/QUELLE.md                (nur Metadaten: OpenITI-URI, Version, Ausgabe, SHA-256 – kein Text)
web/drizzle/seeds/lernapp-test.ts                (fester Testkurs, alle Übungstypen, synthetische Töne)
_lernapp/werkzeuge/{*.workflow.js,tts/,sprachpruefung/,quellen/,wurzeln/}
_lernapp/lehrplan/                               (Kontrastdokumente je Richtung)
```

Neue `package.json`-Skripte: `lernapp:import`, `lernapp:schemas`, `lernapp:pruefen`, `lernapp:audio-liste`,
`lernapp:export-korrekturen`. `web/scripts/vercel-bau.mjs` und `web/scripts/bau-datenbank.mjs` rufen `lernapp:import` nach
`inhalte-import.ts` auf.

---

## 4 Übungstypen

| Typ (`typ`) | Gegenstück | Bewertung | Tastatur und Screenreader | ab |
|---|---|---|---|---|
| `auswahl` | Auswahl | Index | Radiogruppe, Pfeiltasten, Ziffern 1–4 | A1 |
| `bild_wort` | Bildkarten | Index | Radiogruppe; `alt` erst nach der Antwort, Hinweis „Bildübung“ | A1 |
| `paare` | Paare zuordnen | Paarmenge | zwei Listen mit `aria-pressed`; kein Ziehen nötig (2.5.7) | A1 |
| `wortbank` | Übersetzen mit Kacheln | Abgleich (4.1) | Werkzeugleiste (roving tabindex), Antwortzeile als Liste | A1 |
| `frei` | Freitext | toleranter Abgleich | Textfeld mit `lang`/`dir`; Sonderzeichenleiste, arabische Tastatur | A2 (ar: B1) |
| `hoeren_waehlen` | Hören und wählen | Index bzw. Kacheln | Wiedergabe, „langsam“; „Ich kann gerade nicht hören“ | A1 |
| `hoeren_schreiben` | Diktat | Abgleich ohne Harakat | wie `frei`; Abschrift nach der Antwort | A1 (ar: A2) |
| `minimalpaare` | Ausspracheunterscheidung | Index | wie `hoeren_waehlen` (tr ı/i, ü/u; ar ṣād/sīn, ḥāʾ/hāʾ) | A1 |
| `luecke` | Lückentext | Option oder Freitext | beschriftetes Feld, Optionen als Radiogruppe | A1 |
| `satzbau` | Satz ordnen | Reihenfolge gegen Alternativen | wie `wortbank` | A2 |
| `formen` | Konjugation, Endungen | Tabelle | Zellen als Felder mit Kopfbezug | B1 |
| `harakat` | (ar) Vokalzeichen, Iʿrāb | Auswahl der Vokalisierung | Radiogruppe; Lesen mit Codepunkt-Namen | A2/B1 |
| `dialog` | Gespräch | passende Antwort | Verlauf als Liste, Live-Region | A1 |
| `geschichte` | Geschichten | eingestreute Fragen | zeilenweise mit Audio | A1 |
| `lesen_fragen` | Lesen | Auswahl, richtig/falsch/nicht im Text | Wort antippen → Glosse (B-14) | B1 |
| `grammatik_tipp` | Tipps | – | Karte mit Überschriften, Beispiele mit `lang` | A1 |
| `schrift_ar` | Vorkurs Alphabet | Elifbe-Logik | `erkennen/zuordnen/lesen/nachspuren`, `Schreibweg.tsx` (B-17); Alternative „auf Papier geschrieben“ | Vorkurs de/tr→ar |
| `schrift_tr` | ç ğ ı İ ö ş ü | Index/Freitext | wie `minimalpaare` | Vorkurs de/ar→tr |
| `schrift_latein` | Lateinalphabet, Groß/Klein, Umlaute | Index | wie oben | Vorkurs ar→de/tr |
| `sprechen` | Sprechübung | Whisper-Abschrift → Abgleich (4.2) | Aufnahme per Taste, Live-Region; „Ich kann gerade nicht sprechen“; „Sprechübungen aus“ | A1 (C1 Pflicht, Selbstbewertung genügt) |
| `schreiben` | Schreiben | Prüfliste, Selbsteinschätzung, optional Lehrkraft | Formular mit Zähler, Prüfliste als Fieldset | B1–C1 |
| `koran_wort` | (Koran-Arabisch) | Index bzw. Paarmenge | Wortform ↔ freigegebene Bedeutung; Wurzel ↔ Wortfamilie nur aus der geprüften Wurzeltabelle (LM-31) | Koran-Pfad |

**Wissenskurs:** `auswahl`, `wahr_falsch` (mit Begründung), `zuordnen` (z. B. Fard/Wajib/Sunna/Mustahab/Makruh),
`reihenfolge`, `luecke`, `fallfrage`. Jede Aufgabe entsteht nur aus einer Aussage, braucht selbst zwei Freigaben und gibt keine
Auskunft zu persönlichen Fällen (KERN §2.2 Nr. 3).

**Ablauf der Lektion** (`engine/sitzung.ts`): 12–15 Aufgaben, neue Wörter mit Einführungskarte; Fehler am Ende erneut, ohne
Strafe; keine Zeitgrenze. FSRS: richtig im ersten Versuch → Good, mit Tippfehler oder Hinweis → Hard, falsch → Again; kein
„Easy“; Selbstbewertung nur bei Sprechen und Schreiben. Kartenwahl nach Stabilität: erkennen → `wortbank` → Produktion.

### 4.1 Antwortabgleich (`web/src/lib/lernapp/abgleich/`)

Grundschritte: NFC; Satzzeichen und Leerraum vereinheitlichen; Apostrophe gleichsetzen; Vergleich mit allen Alternativen;
Token-Levenshtein (`fastest-levenshtein`): ab 4 Zeichen gilt 1 Fehler als Tippfehler mit Hinweis, **nicht** wenn ein anderes
gültiges Kurswort entsteht (Lexikonschutz).

| Sprache | Regeln |
|---|---|
| de | `ß`↔`ss`, `ae/oe/ue`↔`ä/ö/ü` → angenommen mit Hinweis; kleingeschriebene Nomen → Hinweis „Großschreibung“ |
| tr | `toLocaleLowerCase('tr')` (I→ı, İ→i); `i/ı`, `ş/s`, `ğ/g`, `ç/c`, `ö/o`, `ü/u` ohne Sonderzeichen → Hinweis; Eigennamen-Apostroph tolerant |
| ar | Harakat U+064B–U+0652 und U+0670 entfernen, Tatweel U+0640 entfernen; Alif mit Hamza, Madda oder Wasla (U+0623, U+0625, U+0622, U+0671) → Alif U+0627; Alif maqṣūra U+0649 ↔ Yāʾ U+064A und Tāʾ marbūṭa U+0629 ↔ Hāʾ U+0647 am Wortende mit Hinweis; Hamza-Träger tolerant; persisches Yāʾ/Kāf (U+06CC, U+06A9) → U+064A, U+0643; Ziffern U+0660–U+0669 ↔ 0–9; kanonische Reihenfolge Schadda/Vokal. Strenger Modus nur in `harakat` |

Ab Stufe 2 Tokenisierung der arabischen Klitika (wa-, fa-, bi-, li-, al-); Varianten liefert der Inhalt, der Abgleich rät keine
Morphologie. Knopf „Meine Antwort hätte stimmen sollen“ erzeugt eine `lernapp_meldung`.

### 4.2 Sprechen (ADR 0042)

- Worker `web/src/components/lernapp/sprechen/whisper.worker.ts` mit `@huggingface/transformers`; WebGPU, sonst WASM;
  `allowRemoteModels = false`, `localModelPath` `/lern-app/modelle/`, `wasmPaths` `/lern-app/modelle/ort/`; Sprache fest,
  `task: 'transcribe'`, kein Prompt mit der Lösung.
- Modell: `Xenova/whisper-base` q8 (`*_quantized.onnx`, Encoder 23,2 MB + Decoder 53,7 MB), Commit `64da572`, SHA-256 in
  `web/daten/lernapp-modelle/QUELLE.md`. `Xenova/whisper-small` (Commit `2d67713`, ≈ 249 MB) nur nach Praxistest ar/tr und
  nur auf geeigneten Geräten (LM-27). Rückfall `whisper-tiny` nur, wenn S2 `base` auf Telefonen als zu langsam zeigt.
- Auswertung: Abschrift normalisieren (4.1), Wortausrichtung, je Wort grün/gelb; benannt als „Verständlichkeit“, keine Note.
- Aufnahme verlässt das Gerät nie. Rückfall: eigene Aufnahme anhören, vergleichen, selbst bewerten.

### 4.3 Schreiben (B1–C1)

Aufgabe in der Zielsprache, Wortzahl, Pflichtwörter; automatisch nur Länge, Pflichtwörter und `spellcheck` des Browsers;
1–2 Musterantworten; Prüfliste nach GER (Aufgabe, Zusammenhang, Wortschatz, Grammatik; je 4 Stufen, eigene Formulierungen);
Selbsteinschätzung. Optional an die Lehrkraft der eigenen Gruppe (Konto, Gruppe, `lernapp_gruppen`), verschlüsselt, Löschung nach
12 Monaten. Wörterbücher im Client nach LM-28: tr `dictionary-tr` (MIT) und ar Ayaspell (MPL-2.0) erst nach einem Lasttest mit `nspell`
(ADR 0042 Nr. 11), de keines.

### 4.4 Schrift-Vorkurse

- Arabisch: `web/src/lib/elifbe/{alphabet,uebung,zuege}.ts` und `Schreibweg.tsx`; Buchstabennamen nach MSA in
  `messages/lernapp/*.json`; Elifbe-Seiten unverändert; Einstufung erkennt Elifbe-Vorwissen.
- Türkisch und Lateinisch: neue Kurzeinheiten mit Sprachausgabe.

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

Weiter je Zielsprache: ≈ 8.000 gespeicherte Aufgaben, ≈ 400 Aufgaben Einstufungsbank, ≈ 300 Tipp-Karten je Ausgangssprache.
Je Richtung: 26.000 Satzübersetzungen mit ≈ 3 Alternativen, 6.500 Glossen, ≈ 300 kontrastive Tipps. Vorkurse: 8 Lektionen ar,
6 Latein, 2 tr.

**Gesamt:** 216 Einheiten, 1.728 Stationen, 19.500 Lemmata, 78.000 Zielsätze, 156.000 Übersetzungen, ≈ 470.000 Alternativen.
Zeichendaten im Repository ≈ 115 MB JSON (git ≈ 25–35 MB) plus Auszüge offener Daten ≈ 15 MB komprimiert.

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

Bausteine: ≈ 1.400 Aussagen, ≈ 2.000 Belege, ≈ 1.700 Quizfragen; kein Audio. Prüfaufwand 2 × (1.400 × 3 min + 1.700 × 1 min)
≈ **200 h** (LM-03); gestaffelt, Taharah und Salah zuerst. Werke, deren Ausgabe fehlt (LM-33), werden zurückgestellt; Aussagen
stützen sich bis dahin auf die übrigen Werke.

### 5.3 Koran-Arabisch

- ≈ 10 Einheiten mit ≈ 60 Lektionen (genehmigter Plan §3.1 nannte 40 Einheiten; überholt durch die Verfeinerung).
- Inhalt: 500–1.000 häufigste Wortformen (`quran_wortform`) sowie der Wortschatz der Fatiha und von Cüz 30.
- Bedeutungen **nur** aus `quran_wortbedeutung`, von Menschen verfasst (MN-05), sichtbar mit zwei Freigaben zum aktuellen
  Stand (genehmigter Plan §3.1, O-11, LM-13). Die Pipeline erzeugt nur eine Arbeitsliste für die Hoca (≈ 25–50 h) und schreibt
  keine Bedeutungen.
- **Wurzeln:** eigene Wurzeltabelle (L0-E12, ADR 0045 Nr. 13): 18.994 verschiedene Wortformen aus Tanzil, Vorschläge lokal mit
  CAMeL Tools (`morphology-db-msa-r13`, nie `msa-s31`), Abgleich mit Wiktionary, Prüfung durch eine benannte Lehrkraft und zwei
  Freigaben (LM-31),
  gepinnt unter `web/daten/[Ordnername festlegen]/` mit `QUELLE.md`, CC BY-SA 4.0 mit Tanzil-Hinweis. Kein Quranic Arabic Corpus,
  keine Ableger; QUL und NoorBayan bis zur Klärung nicht. Bis zur Prüfung keine Wurzel-Übungen.
- Audio nur aus `quran_wortzeit` freigegebener Rezitationen (MN-03); nie Sprachausgabe.

### 5.4 Audio, Modelle, Speicher, Bauzeit

| Posten | Menge | Größe |
|---|---|---|
| Sprachausgabe-Clips je Zielsprache | ≈ 32.500 (Lemmata, Sätze, Dialogzeilen), ≈ 25 h | Opus 24 kbit/s mono ≈ 270 MB |
| alle 3 Zielsprachen | ≈ 100.000 Clips, ≈ 75 h | ≈ 0,8 GB |
| Bündel je Einheit | 216 | A1 ≈ 1,5 MB … C1 ≈ 6 MB |
| Kurspaket je Richtung | 72 Einheiten | ≈ 35 KB gz je Einheit → ≈ 2,5 MB gz je Richtung |
| Whisper + ORT-WASM | base q8 ≈ 77 MB; small q8 ≈ 249 MB (nur nach Test); ORT 14–28 MB je Datei | ≈ 0,1–0,4 GB |
| **Blob `lernapp` gesamt** | | ≈ 0,93 GB, nur Audio (S3: ≈ 310 MB je Sprache; Modelle statisch, ADR 0042) (LM-15) |
| Offline auf dem Gerät | eine Stufe | A1 ≈ 25 MB … C1 ≈ 90 MB je Richtung |

**Erzeugung der Sprachausgabe:** lokal oder auf dem lokalen Server, nie im Vercel-Bau. Echtzeitfaktor der gewählten Stimmen
misst Spike S3 `[eintragen]`; der Entwurfswert 0,1–0,3 (≈ 1–2 h Wandzeit je Sprache auf 4 Kernen) galt für Piper-Stimmen und
ist für Coqui-VITS, glow-tts und Chatterbox neu zu messen. Lokal höchstens ≈ 300 MB je Sprache zwischenlagern, nach dem Upload
löschen. Training eigener Stimmen (ar auf ClArTTS, tr nach Aufnahme) braucht Rechenzeit `[GPU klären, LM-26]`.

**Vercel-Bau** (≤ 15 min): Lern-App-Import mit SHA-Idempotenz (beim ersten Mal ≈ 300.000 Zeilen, PGlite ≈ 30–60 s), ≈ 30 neue
statische Seiten, Einheitenpakete nur im Beispielmodus vorgerendert, Audio und Modelle nie im Bau.

---

## 6 Inhalts-Pipeline

### 6.1 Ablage

```
web/inhalte/lernapp/
  rahmen/{de,tr,ar}.rahmen.json + RAHMEN-{de,tr,ar}.md   Rahmenplan (eigene Kann-Beschreibungen, Grammatikfolge, Themen, Lemma-Budgets); Arabisch nur in Umschrift
  schemas/*.schema.json                                  aus Zod erzeugt (pnpm lernapp:schemas)
  sprache/<ziel>/<stufe>/<einheit>.json                  Zielinhalt
  uebersetzung/<richtung>/<stufe>/<einheit>.json         Übersetzungen, Alternativen, Glossen, Tipps
  islam/<bereich>/<einheit>.json                         Aussagen + Belege + Quiz (kein Arabisch)
  koran/pfad.json                                        Auswahl und Reihenfolge (nur Verweise)
  aussprache/{de,tr,ar}.json                             Aussprache-Überschreibungen für die Sprachausgabe
  audio-manifest/{de,tr,ar}.json                         textHash → Bündel, Versatz, Dauer, Stimme, SHA
  symbole/symbole.json                                   SVG-Pfade der Bildkarten (Stil nach KERN §7, Motivliste LM-34)
web/daten/{tatoeba,kaikki,haeufigkeit,lernapp-modelle}/  gepinnte Auszüge + QUELLE.md (ADR 0025/0045)
web/daten/hanafi-quellen/QUELLE.md                       nur Metadaten; Texte lokal außerhalb des Repositorys
_lernapp/lehrplan/kontrast-<richtung>.md                 Kontrastdokumente je Richtung
```

### 6.2 Rahmenpläne

Auf Grundlage der GER-Stufen (nur Stufen und Konzept): eigene „Ich kann …“-Formulierungen mit dem Hinweis „orientiert am GER
(Europarat 2001/2020)“ (L0-E19, LM-36). Keine Übernahme oder Übersetzung der Deskriptoren, keine fremden Lehrpläne.

Grammatikfolge (verbindlich im Rahmenplan, Abnahme LM-02):
- **ar:** Schrift/Harakat → Nominalsatz, Artikel und Sonnen-/Mondbuchstaben, Genus, Suffixe, Iḍāfa, Muḍāriʿ (A1) → Māḍī,
  Plurale, Kongruenz, Präpositionen (A2) → Verbstämme II–X, schwache Verben, Relativsätze, Dual, Zahl + Tamyīz, Iʿrāb (B1) →
  Passiv, kāna/inna, Bedingung, Maṣdar (B2) → Stil, komplexe Syntax, Register (C1)
- **tr:** Vokalharmonie, Fälle, Possessiv, -iyor, var/yok, mi (A1) → -di/-miş/-ecek, Aorist, -ebil (A2) → Partizipien,
  Konverben, Bedingung (B1) → Passiv/Kausativ, Evidentialität (B2) → Nominalisierungen, Register, Redewendungen (C1)
- **de:** Artikel und Genus, Präsens, V2, Akkusativ, Modalverben, trennbare Verben (A1) → Perfekt, Dativ, Präpositionen,
  weil/dass (A2) → Präteritum, Relativsätze, Passiv, Konjunktiv II (B1) → Konjunktiv I, Nominalstil, Partizipialattribute (B2)
  → C1

Kontrastive Tipps je Ausgangssprache, z. B. tr → de Artikel und Wortstellung; ar → de p/b, Vokale, Großschreibung,
Lateinschrift; tr → ar Lehnwörter und falsche Freunde, Elifbe-Vorwissen; de → ar Wurzelsystem.

### 6.3 Workflow (`_lernapp/werkzeuge/*.workflow.js`, Muster `_gemeinde/werkzeuge/hb-welle.workflow.js`)

| Phase | Wer | Eingabe | Ausgabe |
|---|---|---|---|
| R Rahmen | Opus (einmal je Sprache) | GER-Stufen, Häufigkeitslisten, Themen | `rahmen/*.json` + `.md`; Abnahme LM-02 |
| E Entwurf Ziel | Opus | Rahmen-Eintrag, erlaubte Lemmata, Kandidaten (Häufigkeit, kaikki-Glossen, Tatoeba-Sätze mit Lizenz), Inhaltsleitfaden (LM-09), KI-Regel 2, JSON-Schema | `sprache/<ziel>/…/<einheit>.json` mit Token-Annotation |
| V Validierung | `pnpm lernapp:pruefen` | Einheit | Befundliste (blockierend/Warnung) |
| G Gegenprüfung | frischer Opus („Lektorat“) | Einheit + Befunde | Natürlichkeit, Stufe, Kultur, Ablenker; strukturiertes Urteil |
| N Nachbessern | Entwurfs-Agent (≤ 2 Runden), Haiku für reine Schemafehler | Befunde | korrigierte Einheit; Rest → `menschlich_klaeren` |
| Ü Übersetzung | Opus je Richtung | Zieleinheit | `uebersetzung/<richtung>/…` |
| B Rückübersetzung | frischer Agent | Übersetzung | Bedeutungsgleichheit je Satz; Abweichung → Befund |
| I Import | `pnpm lernapp:import` | JSON | Status `automatisch_geprueft`; Stichproben-Warteschlange |

- Inhalts-Agenten bis 6 gleichzeitig (kein Bau); Prüfer nacheinander.
- Umfang: ≈ 1.730 Agentenläufe Sprachen, ≈ 680 Wissenskurs; ≈ 72 h bzw. ≈ 28 h Wandzeit bei 6 parallelen Läufen; grob 70–90 Mio.
  Ausgabetokens.
- Herkunft je Eintrag: `quelle: 'ki:<lauf>/<modell>/<promptVersion>'` bzw. `tatoeba:<id>`; Lizenz und Namensnennung je Eintrag.

### 6.4 Automatische Prüfer

| Prüfung | Werkzeug | blockiert |
|---|---|---|
| Schema, eindeutige Schlüssel | eigenes Skript | ja |
| Wortschatzabdeckung (Token-Lemma eingeführt ≤ aktuelle Einheit); Formen stichprobenartig gegen kaikki-Flexionstabellen | eigenes Skript + `web/daten/kaikki` | ja |
| Satzlänge je Stufe (A1 ≤ 8, A2 ≤ 12, B1 ≤ 18, B2 ≤ 25, C1 ≤ 35 Wörter), Lemma-Budget | eigenes Skript | ja |
| Dubletten exakt und nahe (Jaccard ≥ 0,9) | eigenes Skript | ja (> 1 %) |
| Abgleich-Selbsttest: Alternativen konsistent, kein Ablenker zufällig richtig, Wortbank lösbar | `abgleich/*` | ja |
| Arabisch: Vokalisierung vollständig, NFC-Reihenfolge | eigenes Skript | ja |
| Arabisch: Zweitmeinung Vokalisierung | Mishkal (GPL-3.0) oder CAMeL Tools (Daten GPL v2), nur lokal | Warnung → Stichprobe |
| Türkisch: Vokal- und Konsonantenharmonie | eigenes Regelskript; optional Zemberek (Apache-2.0, lokal) | Warnung |
| Rechtschreibung | Hunspell-Wörterbücher über `nspell`, nur im Werkzeug (de igerman98 GPL nur lokal) | Warnung |
| Grammatik de | LanguageTool 6.8 als lokaler Server (nie die öffentliche API) | Warnung |
| **Religionswächter** | `_gemeinde/werkzeuge/religion-pruefung.mjs` (Erweiterung, KERN §3) | ja |
| Inhaltsleitfaden (Tabu-Lexikon, LM-09) | eigenes Skript | Befund → Mensch |
| **Lizenz:** `quelle`, `lizenz`, Namensnennung 100 %; nur zulässige Lizenzen; Tatoeba nur mit Lizenzfeld, `correctness > -1`, nicht `is_unapproved`; keine kaikki-Beispiele mit `ref`; Tatoeba-Audio nur CC BY 4.0 / CC BY-SA 4.0 / CC0 | eigenes Skript | ja |
| **Ausschlüsse:** keine OpenITI-Dateien oder OpenITI-Markierungen unter `web/**`; keine Daten aus dem Quranic Arabic Corpus | eigenes Skript | ja |
| Wissen: ≥ 1 Beleg je Aussage, Werk aus dem Quellenregister, passende Schule, `meinung` nur mit Quelle (CI); Passage und Zitatbereich in der lokalen Arbeitskopie (nur lokal, ADR 0040 Nr. 4) | eigenes Skript | ja |

**Religionswächter** in den erlaubten Lern-App-Dateien (Normalisierung ohne Harakat und Tatweel, Alif-Formen vereinheitlicht):
- (a) **Formel-Lexikon:** Gottesname, Basmala, Hamdala, „inschallah“, Eulogie nach dem Prophetennamen, Wörter für Sure, Vers,
  Hadith, Bittgebet; dazu deutsche und türkische Religionsbegriffe. Treffer verlangen `religionsbezug: true`, sonst rot;
  gekennzeichnete Einträge brauchen zwei religiöse Freigaben. Die arabischen Einträge stammen aus `web/daten/**` oder von der
  religiösen Prüfung, nie von einem Agenten; Ablage gepinnt in `web/daten/` `[Ordnername festlegen]`.
- (b) **Koran-N-Gramm:** ≥ 4 aufeinanderfolgende normalisierte Wörter aus `web/daten/tanzil` → rot.
- (c) **Hadith-N-Gramm:** ≥ 4 aufeinanderfolgende normalisierte Wörter aus `web/daten/hadith` (Bukhari) → rot (genehmigter
  Plan §3.4, O-10).
- Ausnahmen nur über die Liste erlaubter Alltagsformeln mit zwei religiösen Freigaben (LM-09).

### 6.5 Muttersprachliche Stichprobe (ADR 0041)

- Text n = max(20, 10 %); Audio 10 %, Arabisch 20 %; Einlauf: erste 3 Einheiten je Sprache 30 %, nach 3 bestandenen in Folge
  Grundquote; gemeldete Einträge immer; Startwert reproduzierbar in `lernapp_stichprobe`.
- Urteil `ok` | kritisch (Bedeutung, Grammatik, anstößig, falsche Aussprache) | leicht (Natürlichkeit, Zeichensetzung) |
  Korrektur im Feld.
- Annahme: 0 kritische und ≤ 2 leichte je 20 Einträge → `bestanden`; sonst `nachbessern` mit Mustersuche und neuer Stichprobe.
- Menschliche Korrekturen eingefroren (`menschlichGeprueft`); KI-Neuimport legt einen Konflikt an.
- Änderung nach Bestehen: < 10 % geänderte, einzeln geprüfte Einträge → Stand bleibt; sonst neu ziehen.
- Bis zur bestandenen Stichprobe ist die Einheit öffentlich mit Hinweis (O-1, LM-11).

### 6.6 Versionierung und Import

- `web/scripts/lernapp/import.ts` idempotent über SHA-256 je Datei und `inhaltHash` je Eintrag: unverändert → Status bleibt;
  geändert → Status zurück; entfernt → `archiviert`.
- Jede Veröffentlichung erhöht `lernapp_kurs.version`.
- `pnpm lernapp:export-korrekturen` schreibt menschliche Korrekturen als Commit nach `web/inhalte/lernapp/**` zurück.

### 6.7 Religiöse Pipeline (ADR 0040, Quellen nach ADR 0045 Nr. 12)

1. **Quellen lokal bereitstellen** (Spike S8): OpenITI-Release 2025.1.9 (CC BY-NC-SA 4.0) nur als Arbeitstext außerhalb des
   Repositorys bzw. in einem von Git ausgeschlossenen Ordner; ins Repository nur Metadaten (Version-URI, Ausgabe, SHA-256) in
   `web/daten/hanafi-quellen/QUELLE.md`. Nie ausgeliefert, kein OpenITI-Markup in Inhalten.

   | Werk | Verwendung | Arbeitsgrundlage und Ausgabe (Lizenzbericht §1.4) |
   |---|---|---|
   | *Muḫtaṣar al-Qudūrī* (st. 428/1037) | Grundtext Fiqh | OpenITI `Sham19Y0124336`, DKI-Ausgabe 1997; § 70-Frist abgelaufen |
   | *Nūr al-Īḍāḥ* (aš-Šurunbulālī, st. 1069/1659) | ʿIbādāt | OpenITI `JK000284`, Vorlage 1985; Frist abgelaufen |
   | *Marāqī al-Falāḥ* (aš-Šurunbulālī) | ʿIbādāt, Erläuterung | OpenITI `Shamela0000412` (Vorlage 2005, Frist möglicherweise bis 31.12.2030) nur lokal; maßgeblich Ḥāshiyat aṭ-Ṭaḥṭāwī, Būlāq 1318/1900 (LM-33) |
   | *al-Hidāya* (al-Marġīnānī, st. 593/1197) | Begründungen | OpenITI `JK000242`, Vorlage ohne Jahr; Ausgabe klären (LM-33) |
   | *al-Ikhtiyār li-Taʿlīl al-Mukhtār* | Vergleichstext | nur SEC-Fassung `Shamela0001066` (Ḥalabī 1937) |
   | *Radd al-Muḥtār* (Ibn ʿĀbidīn, st. 1252/1836) | einschlägige Kapitel; Meinung, nach der Fatwa gegeben wird | OpenITI `JK000170`, Dār al-Fikr 2000; Frist am 31.12.2025 abgelaufen |
   | *al-Fiqh al-Akbar* | Akaid | OpenITI `JK001085`, Vorlage 1999; Frist am 31.12.2024 abgelaufen |
   | *al-ʿAqīda aṭ-Ṭaḥāwiyya* | Akaid | OpenITI `JK000126`; nur der Matn, keine Anmerkungen al-Albānīs |
   | *al-ʿAqāʾid an-Nasafiyya* | maturiditische Lehre | fehlt in OpenITI; zurückgestellt bis ein alter Druck beschafft ist (LM-33) |

   İlmihal-Werke (Diyanet/TDV, Bilmen, IGMG) nur als Seitenverweis für Menschen (LM-05). Joseph Hell 1923 (deutsche Übersetzung
   von al-Fiqh al-Akbar und Ṭaḥāwiyya) nur nach LM-32 und nur durch Menschen bearbeitet. Nicht verwendet: Shamela-Texte,
   Verlagsübersetzungen, Ḥiṣn al-Muslim (LM-16).
2. **Passagen-Index** lokal: `_lernapp/werkzeuge/quellen/openiti-passagen.mjs` schneidet nach Meilensteinen und Überschriften
   und ordnet Kapitel den Lehrplanthemen zu. Der Index bleibt lokal; ins Repository nur Passagen-Kennungen.
3. **Entwurf** (Opus) nur mit gelieferten Passagen: deutsche Aussagen in eigenen Worten, Belege mit Passage und Zeichenbereich,
   Quizfragen mit Bezug zur Aussage. Kein arabischer Text vom Agenten; Verse und Hadithe nur als Verweis (`sure:vers`,
   `sammlung:nummer`), angezeigt mit freigegebener Übersetzung, sonst „Übersetzung folgt“.
4. **Validierung** nach §6.4 (CI: Formalien; lokal: Passage und Zitatbereich).
5. **Belegprüfung durch einen frischen Agenten** (`belegt` / `teilweise` / `nicht belegt`); ordnet nur die Warteschlange.
6. **Menschliche Prüfung** in `/verwaltung/lernapp/religioes`: deutsche Aussage mit Fundstelle (Werk, Kapitel, Ausgabe,
   OpenITI-URI); Prüfende prüfen am eigenen Exemplar, Pflicht-Häkchen „Beleg am Original geprüft“ je Beleg. Ob die arabische
   Passage angezeigt wird, entscheidet LM-04 (Standard: nein). Urteil `ok`, `Änderungsvorschlag` oder `ablehnen`; Prüfende
   bearbeiten nicht selbst, die Redaktion arbeitet ein, danach prüfen beide den neuen Hash.
7. **Sichtbarkeit:** Lektionen nur vollständig freigegeben; Vermerk „Nach hanefitischer Lehre; geprüft von zwei Gelehrten der
   Gemeinde am [Datum]“ ohne Namen (LM-20); Quellenzeile je Aussage; strittige Themen ausgewiesen; „für Kinder geeignet“ je
   Lektion (LM-17).

### 6.8 Sprachausgabe (ADR 0039, L3-E10, ADR 0045 Nr. 11)

**Stimmen** (nur mit freier Kette aus Daten, Basismodell und Gewichten; Hörabnahme LM-06):

| Sprache | Standard | Übergang oder Ersatz | Mensch |
|---|---|---|---|
| de | Coqui-VITS Thorsten (`tts_models/de/thorsten/vits`, Apache-2.0, Daten CC0, gruut statt espeak-ng) | Hörvergleich mit Piper `de_DE-mls-medium` (CC BY 4.0); Ersatz `Thorsten-Voice/Kokoro` (mit Auflagen) | LM-23 |
| tr | Ziel: eigene Stimme aus eigener Aufnahme (piper1-gpl lokal, Start von `en_US-ljspeech` oder `de_DE-mls-medium`) | Übergang Coqui `tr/common-voice/glow-tts` + HiFi-GAN (MIT, CC0); Chatterbox Multilingual (MIT) nur bei besserer Hörprobe und besserem Verständlichkeitstest (L0-E05) | LM-24, LM-26 |
| ar | eigene Piper-Stimme auf ClArTTS (CC BY 4.0), optional Arabic Speech Corpus (CC BY 4.0); Eingabe immer voll vokalisiert | Chatterbox nur nach bestandenem Vokalisierungstest (≈ 200 Minimalpaare mit Harakat, Schadda, Tanwin); sonst „Audio folgt“ oder Aufnahmen | LM-25, LM-26 |

Ausgeschlossen: alle übrigen Piper-Stimmen für de/tr/ar (Ketten über `en_US-lessac` „nur Forschung“ bzw. `en_US-ryan`
CC BY-NC-SA; `tr_TR-fahrettin/-fettah` am 30.12.2025 entfernt), lessac und ryan auch als Startpunkt, MMS-TTS, XTTS-v2, ArTST,
kikiri-turkish, Community-Stimmen ohne belegte Datenherkunft, `de_DE-eva_k`/`-ramona`.

**Schritte:**
1. `pnpm lernapp:audio-liste <sprache>` → JSONL (textHash, Text, Stimme) nur für fehlende Einträge ohne `religionsbezug`.
2. `_lernapp/werkzeuge/tts/erzeuge.py` ruft die Engine der Stimme lokal auf (Coqui TTS MPL-2.0, chatterbox-tts MIT, piper1-gpl
   GPL-3.0 mit espeak-ng); Aussprache-Überschreibungen aus `web/inhalte/lernapp/aussprache/`.
3. Lautheit EBU R128, Stille kürzen, Opus 24 kbit/s mono (opus-tools bzw. ffmpeg, lokal).
4. `.lpa` je Einheit bauen, in Blob `lernapp` laden, lokale Kopie löschen.
5. Commit `audio-manifest/<sprache>.json` (Stimme mit Modell und SHA bzw. `mensch:<id>`).
6. Prüfkette nach S3: alle Clips physisch (Netto-Dauer ≥ 0,25 s, 2–8 Silben/s, Rand-Stille ≤ 0,3 s, kein Clipping, −23 ± 1 LUFS); de-Sätze ≥ 4 Wörter per whisper-base: Trefferanteil ≥ 0,75 gut, 0,6–0,75 einmal neu erzeugen, < 0,6 hören; Lemma-Clips ohne Rückerkennung; Schwellen tr/ar erst mit eigener Stimme; Ausreißer neu erzeugen oder aufnehmen.

**Nie vertont:** Koran, Hadith, Bittgebete, Einträge mit `religionsbezug`, Wissenskurs, Koran-Arabisch-Pfad (Test + Wächter).
**Namensnennung** je Stimme in App und `/quellen`; synthetische Stimmen als „Sprachausgabe“ gekennzeichnet; Chatterbox:
Wasserzeichen offengelegt, Klonen nur mit eingewilligter Referenzstimme. **Menschliche Aufnahmen** ersetzen Clips je textHash
(Audio-Studio, Vereinbarung Pflicht); bevorzugt für den arabischen Kern A1/A2 (≈ 1.500 Wörter + 2.500 Sätze, ≈ 10–15 h).
**Fremdes Audio:** Tatoeba-Audio nur mit CC BY 4.0 / CC BY-SA 4.0 / CC0 (am 16.10.2026 nur Deutsch, 5.334 Dateien), Lizenz je
Import neu abgleichen; Wikimedia Commons je Datei über die API.

---

## 7 Verwaltung

### 7.1 Module (`web/src/app/[locale]/verwaltung/(geschuetzt)/lernapp/…`)

| Modul | Inhalt | Recht |
|---|---|---|
| `lernapp` (Übersicht) | Stand je Kurs, Stufe, Einheit; Prüfquoten; offene Befunde; Pipeline-Lauf | `lernapp.lesen` |
| `lernapp/kurse/[kurs]` | Baum Abschnitt → Einheit → Lektion; Vorschau im echten Spieler ohne Ereignisse | `lernapp.lesen` |
| `lernapp/sprachpruefung` (+ `[stichprobe]`) | Warteschlange je eigener Sprache, Tastenkürzel, Fehlerkategorie, Korrektur, Audio | `lernapp.sprache.pruefen` |
| `lernapp/religioes` (+ `[baustein]`) | Zwei-Prüfer-Ansicht (1/2, 2/2), Fundstelle, Beleg-Häkchen; auch in `/verwaltung/freigaben` | `lernapp.religioes.pruefen` |
| `lernapp/audio` (+ `direkt/route.ts`) | Audio-Studio: fehlende/auffällige Clips, Aufnahme (Bausteine der Rezitations-Werkstatt), Sprecher mit Vereinbarung, Sprachausgabe ↔ Mensch je Clip | `lernapp.audio.bearbeiten` |
| `lernapp/quellen` | Quellenregister (SHA, Lizenz, Namensnennung, nur Verweis), Stimmen mit Herkunftskette | `lernapp.bearbeiten` |
| `lernapp/meldungen` | Meldungen → Alternativen ergänzen, Eintrag sperren | `lernapp.bearbeiten` |
| `lernapp/statistik` | nur Summen mit n ≥ 10 | `lernapp.statistik.lesen` |

Cockpit (`web/src/lib/startklar/*`): Karte „Lern-App“ mit Schaltern, Blob, Prüfenden (≥ 2 religiös, ≥ 1 je Sprache),
Einheiten je Status. Audit jedes Prüfschritts ohne Inhalte.

### 7.2 Sprache der Prüfoberfläche (Fortschreibung ADR 0016, O-3)

Nur „Sprachprüfung“ hat eine Sprachwahl de/tr/ar; Gerüst links-nach-rechts, Inhaltsblöcke mit `dir`; Texte in
`messages/verwaltung/lernapp-pruefung.json` (Ausnahme im Schlüsselabgleich).

---

## 8 Spielelemente (ADR 0043)

| Element | Regel |
|---|---|
| XP | Lektion 10, Geschichte 15, Prüfstein 20, Wiederholung 1 je 2 Karten (≤ 10), Schreiben 15; keine Zeitboni; Zahl statisch |
| Tagesziel | 10/20/30/50 XP, 1/2/3 Lektionen oder „kein Ziel“; Standard `[festlegen]` |
| Serie | „Lerntage in Folge“; bis 2 Pausetage je Kalenderwoche (0–3 einstellbar), bis 30 Tage Ruhezeit im Jahr; Wochenband mit Achtsternen; nie „Serie verloren“ |
| Erinnerung | standardmäßig keine; Push mit Konto und Opt-in, neutral, ohne Serienbezug (`push_lernapp`); Kinder nur mit der Einwilligung `push_kind` der Eltern |
| Abzeichen (≈ 40) | Stufen, Lerntage gesamt, Wortschatz, Schrift, Geschichten, Wiederholungen, erstes Sprechen/Schreiben, Wissensbereiche, Gruppenziel; Achtstern-Formen; kein „Zertifikat“ |
| Lernpfad | Stationen (B-24); Prüfstein ab 80 % überspringt eine Einheit; Einstufungstest (20 Aufgaben, adaptiv, lokal) |
| Gruppe | Standard **Gruppenziel** (Summe gegen Wochenziel, ohne Namen); Eltern sehen die Lernwoche ihrer Kinder |
| Bestenliste | nur in Lerngruppe oder Familie, von Lehrkraft bzw. Eltern eingeschaltet; nur Personen ab 16 mit eigener Zustimmung; Wochen-XP, Vorname + Initial, ohne Medaillen; Kinder im Code gesperrt; Schalter `lernapp_rangliste` (LM-10) |
| Keine | Herzen, Leben, Ligen, globale Ranglisten, Zeitdruck, Käufe, Werbung, Spendenaufrufe (LM-35) |

Wortlaut-Test `web/tests/unit/lernapp/sanfte-texte.test.ts` (verbotene Formulierungen je Sprache `[Liste festlegen; tr und ar
von Muttersprachlern prüfen lassen]`).

---

## 9 Zugänglichkeit (WCAG 2.2 AA)

Jeder Übungstyp per Tastatur; Ziehen nie nötig; Ziele ≥ 24 × 24 px; Live-Region je Bildschirm; Fokus auf „Weiter“, Rückmeldeblatt
verdeckt den Fokus nie; „Hörübungen aus“, „Sprechübungen aus“, Abschrift nach jeder Hörübung, keine Zeitgrenzen; `lang`/`dir` an
jedem fremdsprachigen Teil; Tasten der arabischen Bildschirmtastatur mit Buchstabennamen; 400 % Zoom; reduzierte Bewegung. axe auf
allen Lern-App-Routen × 3 UI-Sprachen × 2 Breiten; Screenreader-Prüfung LM-19.

---

## 10 Bewegung

Register B-28…B-35 nach KERN §10 (nur CSS, jeweils mit reduzierter Variante; B-17, B-24, B-27 wiederverwendet).
`web/tests/unit/bewegung-regeln.test.ts` gilt auch für `src/components/lernapp/**`. Keine Mondsichel, keine hochzählenden
Zahlen.

---

## 11 Kinderschutz, Datenschutz, Funktionsschalter

Regeln in KERN §5 und §6. Zusätzlich aus dem Lizenzbefund: keine Spendenaufrufe, Mitgliederwerbung oder Förderhinweise in der
Lern-App (L0-E17, LM-35); Bildkarten ohne Menschen- und Tierdarstellungen bis LM-34.

**Schalter** (wie KERN §6; ausgeschaltet heißt 404, Links verschwinden):

| Schalter | Personendaten | Vorschau | Produktion | Sperre im Cockpit |
|---|---|---|---|---|
| `lernapp` | nein | an | an nach Abnahme (`IN_PRODUKTION_AN`) | – |
| `lernapp_ungeprueft` (Einheiten ohne bestandene Stichprobe, mit Hinweis) | nein | an | **an** (O-1, LM-11) | – |
| `lernapp_sprechen` | nein (lokal) | an | aus bis Gerätetest (LM-07) | – |
| `lernapp_meldungen` (anonym, Kategorien) | nein | an | an | – |
| `lernapp_sync` | ja | an | aus | `konten` an, LM-08 |
| `lernapp_gruppen` | ja | an | aus | `lernplattform` an, LM-08 |
| `lernapp_rangliste` | ja | an | aus | `lernapp_gruppen` an, LM-10 |
| `lernapp_statistik` (anonyme Telemetrie, Opt-in) | grenzwertig (IP) | an | aus | Entscheidung der DSB |
| `push_lernapp` | ja | an | aus | wie `push` |

---

## 12 Abhängigkeiten (Versionen nach Mindestreife ≥ 14 Tage, exakt gepinnt; L0-E10, LM-29)

| Paket | Zweck | Lizenz | Version | Ort |
|---|---|---|---|---|
| `ts-fsrs` | FSRS | MIT | 5.4.2 | dependencies (Spieler-Chunk) |
| `idb` | IndexedDB | ISC | 8.0.3, ab 20.10.2026 8.0.4 | dependencies |
| `fastest-levenshtein` | Abstand | MIT | 1.0.16 | dependencies |
| `@huggingface/transformers` (+ `onnxruntime-web`) | Whisper im Worker | Apache-2.0 (+ MIT, ThirdPartyNotices aus dem Repository, Eigen MPL-2.0) | 4.3.0, ab 20.10.2026 4.3.1; Dev-Build von onnxruntime-web im Lockfile fixiert | dependencies, nur Worker |
| Whisper-Gewichte `Xenova/whisper-base` q8 | Modell | MIT (OpenAI) und Apache-2.0 (Karte), beide nennen | Commit `64da572` | Blob oder statisch (LM-27), SHA in `web/daten/lernapp-modelle/QUELLE.md` |
| `@fontsource/noto-sans-arabic` | UI-Schrift | OFL-1.1 | 5.3.0 | devDependencies (kopiert) |
| `nspell` + `dictionary-tr` | Rechtschreibung tr im Client (nach LM-28 und Lasttest) | MIT, MIT | 2.1.5, 2.0.0 | dependencies, lazy |
| Ayaspell | Rechtschreibung ar (nach Lasttest) | MPL-2.0 (gewählt aus Dreifachlizenz) | `[Version festlegen]` | lazy |
| OpenMoji | Bildkarten | Grafiken CC BY-SA 4.0 | 17.0.0 | Werkzeug, nur ausgewählte SVG |
| `@tabler/icons` (nur Pfade) | Bildkarten abstrakter Begriffe | MIT | 3.48.0, ab 19.10.2026 3.49.0 | Werkzeug |
| `fast-check` (optional) | Eigenschaftstests | MIT | `[Version prüfen]` | devDependencies |
| Coqui TTS (`coqui-tts`) + gruut | Sprachausgabe de, tr-Übergang | MPL-2.0, MIT | 0.27.5; gruut 2.4.0 | Werkzeug im Scratchpad |
| chatterbox-tts | Übergang tr/ar nach Test | MIT | 0.1.7 | Werkzeug |
| piper1-gpl (`piper-tts`) + espeak-ng | Training eigener Stimmen | GPL-3.0 | 1.8.0; espeak-ng `[Release prüfen]` | Werkzeug, nie ausgeliefert |
| opus-tools / ffmpeg | Kodierung, Lautheit | BSD / LGPL-GPL | – | Werkzeug |
| LanguageTool, Zemberek, Mishkal, CAMeL Tools, Hunspell-CLI | Prüfer | LGPL-2.1, Apache-2.0, GPL-3.0, MIT (Daten GPL v2), MPL/GPL | 6.8, 0.17.1, 1.10, 1.6.0 | Werkzeug |
| Daten: Tatoeba-Sätze, kaikki/Wiktionary, wordfreq 3.1.1, CAMeL-Häufigkeitslisten v1.0, FrequencyWords | Inhalt | CC BY 2.0 FR (CC0-Teil), CC BY-SA 4.0 | Wochenexport bzw. Stand der Auszüge | `web/daten/**` gepinnt |
| OpenITI 2025.1.9 | Arbeitstext Wissen | CC BY-NC-SA 4.0 | – | nur lokal, nie im Repository |

`zod` (v4) ist vorhanden. Keine Laufzeit-KI, keine Drittanfragen.

---

## 13 Tests

**Unit** (`web/tests/unit/lernapp/`): `abgleich-{de,tr,ar}` (je ≥ 150 Fälle), `srs`, `zusammenfuehren` (Eigenschaftstests),
`aufgaben-schema`, `paket-hash`, `buendel`, `freigabe-zwei`, `stichprobe`, `einstufung`, `format`, `rtl-regeln`,
`bundle-regeln` (inkl. kein GPL-/LGPL-Code im Client), `sanfte-texte`, `religion-waechter`, `lizenzen` (Lizenzfeld,
zulässige Lizenzen, Ausschlussliste), `audio-stimmen` (jede Stimme im Manifest auf der Liste nach L3-E10; kein Clip zu
`religionsbezug`, `islam`, `koran`).

**Integration** (PGlite, `web/tests/integration/lernapp-*.test.ts`, kleiner Testkurs): Import idempotent; Pakete nur mit
ausgelieferten Einträgen und `updateTag`; Wissen eine Freigabe → unsichtbar, zwei → sichtbar; Sync (Einwilligung, Schalter 404,
Isolation, Bremse); Zuweisung; Schreibabgabe verschlüsselt; Statistik ohne Bezug; Rechte-Matrix mit neuer Rolle.

**E2E** (`web/tests/e2e/lernapp/*.spec.ts`, telefon + desktop, Seed `web/drizzle/seeds/lernapp-test.ts`): je Übungstyp;
Rauchtest je UI-Sprache (`ar`: `html[dir=rtl]`, kein Überlauf bei 390 px); axe; offline; zwei Kontexte; Lehrkraft → Schüler*in →
Lehrkraft; Kind ohne Bestenliste; Verwaltung (Stichprobe, zwei Prüfkonten, Audio-Studio mit Attrappen-Mikrofon);
Netzprotokoll ohne Konto; `sprechen` mit Attrappen-Worker nur im Testbau (`E2E_ATTRAPPEN=1`).

**Leistung:** `pnpm messen` mit `/lern-app/de`, `/lern-app/ar/de-aus-ar`, `/lern-app/tr/de-aus-tr/ueben?l=…`; Perf ≥ 90,
A11y 100, Budgets §3.6.

**Inhalt im Tor:** `pnpm lernapp:pruefen`, `religion-pruefung.mjs` mit Wächter, `pnpm sprachen:pruefen`, Lizenzbericht.

---

## 14 Etappen L0–L8

Zeiten sind Agenten-Wandzeit bei Dauerbetrieb, grob geschätzt; die menschliche Prüfung läuft parallel und länger.

**Wer:** O = Orchestrator (gemeinsame Dateien, §15) · A, B = Code-Agent im Arbeitsbaum A bzw. B · I = Inhalts-Workflow (bis 6
parallel, kein Bau) · W = lokales Werkzeug bzw. Hintergrundlauf · M = Menschen (MENSCHEN.md).

**Prüfstufen** (L3-E12): **A** je Paket (Typen, Lint, betroffene Tests, Bilder, `religion-pruefung`, `freie-werte`,
`lernapp:pruefen`) · **B** je Etappe (Bau Vorschau und Produktion, alle Suiten, axe, Lighthouse, reduzierte Bewegung, startklar
mit Produktionsschaltern, `sprachen:pruefen`, Regeltests) · **S** an L1, L5, L8 (frischer Sicherheits-Agent) · **C** am Ende
(frischer Endprüfer). Nach grünem Tor Fast-Forward `main`.

| Etappe | Kern | Dauer | Tor (Kurzform) |
|---|---|---|---|
| L0 Grundlagen | Werkstatt, ADRs, Lizenzbefund, Spikes S1–S8, Werkzeuge | 2 Tage | ADRs angenommen, 8 Spike-Belege, Religion-Prüfung grün, MENSCHEN eingetragen |
| L1 Kern | Datenmodell, gemeinsame Dateien, Wurzel-Layout, Engine-Kern, Pakete, Sync | 3–4 Tage | Unit/Integration/E2E Kern, Budgets, S-L1 |
| L2 Übungstypen | alle Typen aus §4, Bewegung, Wiederholen, Einstufung | 4–5 Tage | je Typ Zod, Bewertung, Tastatur, E2E, Chunk ≤ 15 KB |
| L3 Pipeline + A1 | Rahmenpläne, Prüfer, Workflows, offene Daten, Sprachausgabe, Verwaltung v1, A1 | 5–7 Tage | `lernapp:pruefen` 0, Audio A1 (ar nach Stimme), Pakete |
| L4 A2–B1 | 30 Einheiten × 3, Übersetzungen, Audio, Geschichten, Lesetexte | 7–9 Tage | Abdeckung ±5 %, Dubletten < 1 % |
| L5 B2–C1 | 30 Einheiten × 3, Schreiben, Sprechen, Korrekturweg | 8–10 Tage | Whisper-Messung, Schreib-E2E, S-L2 |
| L6 Wissen + Koran-Arabisch | Quellen lokal, Zwei-Prüfer, 28 Einheiten, Koran-Pfad, Wurzeltabelle | 6–8 Tage (+ Wochen Prüfung) | 0 sichtbar ohne 2 Freigaben, 0 Sprachausgabe religiös |
| L7 Spielelemente, Gruppen | XP, Serie, Abzeichen, Gruppenziel, Bestenliste, Lehrkraft, Eltern | 3–4 Tage | sanfte Texte, keine Bestenliste < 16, Gruppen-E2E |
| L8 Härtung + Abnahme | S-L3, Leistung, Last, Lizenzverzeichnis, Handbücher, Stufe C | 3–4 Tage | Z-L01…Z-L22 erfüllt oder AUSNAHME mit Grund |

### L0 Grundlagen (2 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L0-01 | O | Werkstatt übernehmen; genehmigten Plan und Verfeinerung sichern; Lizenzberichte übernehmen; arabische Schrift in übernommenen Berichten durch Umschrift ersetzen; `.vercelignore`; CLAUDE.md-Block | `_lernapp/*`, `_lernapp/berichte/plan-2026-10-16.md`, `_lernapp/berichte/plan-verfeinerung-2026-10-16.md`, `_lernapp/berichte/lizenzen-l0*.md`, `.vercelignore`, `CLAUDE.md` |
| L0-02 | O | Lizenzprüfung (erledigt, `wf_cf9ab8d3-fce`) | `_lernapp/berichte/lizenzen-l0.md` + 4 Teilberichte |
| L0-03 | O | ADR 0037–0045; Status-Vermerke in 0009, 0012, 0014, 0016, 0025, 0030 | `web/docs/adr/0037-…` bis `0045-…` |
| L0-04 | O | DSFA-Nachtrag Lern-App als Entwurf (Art. 9, Ausnahme R-08, Löschfristen); Vorlage Sprecher-Vereinbarung mit KI-Synthese | `web/docs/recht/entwuerfe/[dsfa-lernapp.md]`, `web/docs/recht/entwuerfe/[vereinbarung-lernapp-aufnahme.md]` |
| L0-05 | A | S1 Wurzel-Layout `/lern-app/[ui]` + Proxy + RTL unter Cache Components (Bau grün, Manifest) · S6 `idb` + SW-Scope neben dem Root-SW | Probe-Zweig, Beleg `_lernapp/belege/S1.md`, `S6.md` |
| L0-06 | B | S2 Whisper base/small de/tr/ar headless (Latenz, Speicher, WER an 30 Sätzen je Sprache, davon 10 menschlich; WebGPU/WASM; COOP/COEP) · S4 Opus in WebM/Ogg auf Safari · S5 Auslieferung großer Dateien (Route, statisch, Blob) | `_lernapp/belege/S2.md`, `S4.md`, `S5.md` |
| L0-07 | W | S3 Stimmen nach L3-E10: Coqui-VITS Thorsten gegen `de_DE-mls-medium` (inkl. Bestätigung, dass Coqui-Release v0.7.0 dieselbe Konfiguration hat); Coqui tr glow-tts gegen Chatterbox; Chatterbox ar Vokalisierungstest (≈ 200 Minimalpaare); Echtzeitfaktor, Hörproben, Speicherbedarf | `_lernapp/belege/S3.md`, Hörproben im Scratchpad |
| L0-08 | W | S7 Tatoeba-, kaikki- und Häufigkeitsauszüge (wordfreq, CAMeL-Listen, FrequencyWords) im Strom gefiltert, SHA, `QUELLE.md` mit Namensnennung · S8 OpenITI-Werke lokal, Passagen-Index lokal, nur Metadaten ins Repository | `_lernapp/belege/S7.md`, `S8.md`; Entwürfe `web/daten/{tatoeba,kaikki,haeufigkeit,hanafi-quellen}/QUELLE.md` |
| L0-09 | W | Werkzeuge im Scratchpad (Sprachausgabe, Prüfer, OpenITI); Pfade in STATUS | `_lernapp/STATUS.md` |

**Tor L0:** ADRs angenommen; 8 Spike-Belege; `religion-pruefung` grün; MENSCHEN LM-01…LM-36 eingetragen; Lizenztabelle
übernommen; ENTSCHEIDUNGEN L3-E01…L3-E12 eingetragen.

### L1 Kern (3–4 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L1-01 | O | Migrationen 0017–0019; Schemas; Enum-Erweiterungen; `AufgabeBezug`; Rechte inkl. `NIE_PER_ADMINISTRATION`; Schalter; Cache-Tags; Löschlauf | `web/drizzle/migrations/0017…0019`, `web/src/lib/db/schema/{lernapp,lernapp-nutzung,index,typen,lernen}.ts`, `web/src/lib/rechte/{matrix,gruppen}.ts`, `web/src/lib/funktionen-regeln.ts`, `web/src/lib/validierung/einstellungen.ts`, `web/src/lib/cache/tags.ts`, `web/src/lib/loeschen/gemeinde.ts` |
| L1-02 | O | Gemeinsame Dateien: Proxy, Header, Root-SW, `globals.css` (RTL-Eingrenzung, Werkzeugklassen, Token), Religion-Prüfung (Erlaubnisse + Wächter), `sprachen-pruefen.mjs`, `package.json` (§12) | `web/src/proxy.ts`, `web/src/lib/sicherheit/header.ts`, `web/next.config.ts`, `web/public/sw.js`, `web/src/app/globals.css`, `_gemeinde/werkzeuge/religion-pruefung.mjs`, `web/scripts/sprachen-pruefen.mjs`, `web/package.json` |
| L1-03 | A | Wurzel-Layout, `not-found`, `error`, Manifest-Route, Texte de/tr/ar, `texte.ts`, `format.ts`, Schrift, SW `/lern-app/sw.js`, Anmeldung im Scope, Stationen auf `/lernen` | `web/src/app/lern-app/[ui]/**`, `web/messages/lernapp/*.json`, `web/src/lib/lernapp/{texte,format}.ts`, `web/src/fonts/`, `web/public/lern-app/sw.js` |
| L1-04 | B | Abgleich, FSRS, Ereignisse und Ableitung, lokale DB, Profile, Export; Spieler mit `auswahl`, `wortbank`, `paare` | `web/src/lib/lernapp/{abgleich,ereignisse,lokal,engine}/**`, `web/src/lib/lernapp/srs.ts`, `web/src/components/lernapp/{Spieler,Rueckmeldung,Fortschrittsleiste}.tsx`, `aufgaben/{Auswahl,Wortbank,Paare}.tsx` |
| L1-05 | A | Paketbau, `.lpa`, Routen Pakete/Audio, Sync-API + Client, Import, Seed-Testkurs, Einhängen in den Bau | `web/src/lib/lernapp/paket/**`, `web/src/app/lern-app/{pakete,audio}/**`, `web/src/app/api/lernapp/{sitzung,sync}/route.ts`, `web/scripts/lernapp/import.ts`, `web/drizzle/seeds/lernapp-test.ts`, `web/scripts/{vercel-bau,bau-datenbank}.mjs` |
| L1-S | S | Sicherheitsprüfung S-L1 (Proxy, CSP, Sync, Rechte, Einwilligung) | `_lernapp/berichte/s-l1.md` |

**Tor L1:** Unit (Abgleich ≥ 450 Fälle, Eigenschaftstests); Integration (Import, Pakete, Sync); E2E (Offline-Lektion, zwei
Geräte); Budgets nach KERN §9 (Hülle eigener Anteil ≤ 20 KB, Spieler-Route gesamt ≤ 210 KB); axe 0 in 3 Sprachen; Bau beider Betriebsarten grün; S-L1 ohne hoch/kritisch.

### L2 Übungstypen (4–5 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L2-01 | A | `bild_wort`, `frei`, `hoeren_waehlen`, `hoeren_schreiben`, `minimalpaare`, `luecke`, `satzbau`, `formen`, `harakat`, Sonderzeichenleiste, arabische Tastatur; Stil der Bildkarten (KERN §7) | `web/src/lib/lernapp/aufgaben/*`, `web/src/components/lernapp/aufgaben/*`, `web/src/components/lernapp/tastatur/*` |
| L2-02 | B | `dialog`, `geschichte`, `lesen_fragen`, `grammatik_tipp`, `schrift_ar/tr/latein`, `sprechen` (Worker, Gerätecheck, Rückfall), `schreiben`; Modell-Route | `web/src/components/lernapp/{aufgaben,sprechen,schreiben}/*`, `web/src/app/lern-app/modelle/**` |
| L2-03 | A oder B | Wissens-Typen (`wahr_falsch`, `zuordnen`, `reihenfolge`, `fallfrage`) und `koran_wort` mit Testdaten | `web/src/lib/lernapp/aufgaben/*`, `web/src/components/lernapp/aufgaben/*` |
| L2-04 | O | Wiederholen und Einstufung (Routen, `kartenwahl`, `einstufung`); B-28…B-35 in KERN §10 | `web/src/app/lern-app/[ui]/[kurs]/{wiederholen,einstufung}/**`, `web/src/lib/lernapp/engine/{kartenwahl,einstufung}.ts`, `_lernapp/KERN.md` |

**Tor L2:** je Typ Zod, Bewertung mit Unit-Tests, Tastatur- und Screenreader-Semantik, E2E (2 Breiten; 6 Typen auch in `ar`),
Chunk ≤ 15 KB; Bewegungs-Regeltest grün.

### L3 Pipeline + A1 (5–7 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L3-01 | I | Rahmenpläne de/tr/ar; Kontrastdokumente je Richtung | `web/inhalte/lernapp/rahmen/*`, `_lernapp/lehrplan/*` |
| L3-02 | A | Schemas, `lernapp:schemas`, Prüfer inkl. Lizenz- und Ausschlussprüfung, Wächter-Tests | `web/src/lib/lernapp/inhalt/{schema,pruefer/*}.ts`, `web/scripts/lernapp/{schemas,pruefen}.ts`, `web/inhalte/lernapp/schemas/*` |
| L3-03 | O | Workflows E/V/G/N/Ü/B/I | `_lernapp/werkzeuge/*.workflow.js` |
| L3-04 | W | Offene Daten pinnen (aus S7) | `web/daten/{tatoeba,kaikki,haeufigkeit}/**` |
| L3-05 | W | Sprachausgabe-Kette mit Stimmen nach S3; `audio-liste`, `audio-manifest` | `_lernapp/werkzeuge/tts/*`, `web/scripts/lernapp/{audio-liste,audio-manifest}.ts`, `web/inhalte/lernapp/{aussprache,audio-manifest}/*` |
| L3-06 | B | Verwaltung v1: Übersicht, Kurse, Sprachprüfung, Audio-Studio, Meldungen, Quellen; Cockpit-Karte | `web/src/app/[locale]/verwaltung/(geschuetzt)/lernapp/**`, `web/src/components/verwaltung/lernapp/*`, `web/src/lib/startklar/*` |
| L3-07 | I | A1 für 3 Zielsprachen × 6 Richtungen, Vorkurse, Einstufungsbank A1 | `web/inhalte/lernapp/{sprache,uebersetzung}/*/a1/*` |
| L3-08 | W | Audio A1 | Blob `lernapp`, `audio-manifest` |

**Tor L3:** `lernapp:pruefen` 0 Fehler (inkl. Lizenzfeld und Ausschlüsse); Befunde der Gegenprüfung erledigt oder an Menschen
übergeben; Audio für 100 % der vertonbaren A1-Inhalte in de und tr, ar nach Stand der Stimme (sonst „Audio folgt“); Pakete
gebaut; E2E eine A1-Lektion je Richtung; Einlauf-Stichproben gezogen; Produktion zeigt nur `automatisch_geprueft` (mit Hinweis)
und `veroeffentlicht`.

### L4 A2–B1 (7–9 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L4-01 | I | A2 (14) und B1 (16) Einheiten je Zielsprache, Übersetzungen je Richtung, Geschichten, Lesetexte, Prüfsteine | `web/inhalte/lernapp/{sprache,uebersetzung}/*/{a2,b1}/*` |
| L4-02 | W | Audio A2–B1 | Blob, `audio-manifest` |
| L4-03 | A | Abzeichen je Stufe; Geschichten- und Lese-Ansichten nach Bedarf | `web/src/lib/lernapp/ereignisse/abzeichen.ts`, `web/src/components/lernapp/*` |

**Tor L4:** Abdeckungsbericht (Lemma-Ziele ±5 %), Dubletten < 1 %, Stichproben laufen, Lighthouse stabil.

### L5 B2–C1 (8–10 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L5-01 | I | B2 (16) und C1 (14) Einheiten je Zielsprache, lange Lesetexte, Schreibaufgaben mit Prüfliste und Musterantworten, Sprechaufgaben | `web/inhalte/lernapp/{sprache,uebersetzung}/*/{b2,c1}/*` |
| L5-02 | W | Audio B2–C1 | Blob, `audio-manifest` |
| L5-03 | B | Korrekturweg Lehrkraft (Schalter `lernapp_gruppen`), Schreibabgabe verschlüsselt, Löschlauf | `web/src/app/api/lernapp/schreiben/route.ts`, `web/src/server/actions/lernapp-*.ts`, Konto-Seite §3.1 |
| L5-S | S | Sicherheitsprüfung S-L2 (Sync, Abgaben, Rechte) | `_lernapp/berichte/s-l2.md` |

**Tor L5:** Whisper-Messung je Sprache dokumentiert (Latenz ≤ 3 s auf dem Referenzgerät oder Rückfall aktiv); Schreibabläufe in
E2E; S-L2 ohne hoch/kritisch.

### L6 Wissen + Koran-Arabisch (6–8 Tage, dazu Wochen menschlicher Prüfung)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L6-01 | W | Quellen lokal (aus S8), Passagen-Index, Quellenregister mit Metadaten | lokal; `web/daten/hanafi-quellen/QUELLE.md` |
| L6-02 | O | KI-Regel 2 im Werkzeug; Zwei-Prüfer-Logik; Freigaben-Integration (`FREIGABE_TYPEN`, Warteschlange) | `web/src/lib/lernapp/freigabe.ts`, `web/src/lib/religioes/freigabe.ts`, `web/src/server/actions/freigaben.ts` |
| L6-03 | B | Zwei-Prüfer-Oberfläche `lernapp/religioes` | `web/src/app/[locale]/verwaltung/(geschuetzt)/lernapp/religioes/**` |
| L6-04 | I | Lehrplan 28 Einheiten; Entwürfe mit Belegen; Belegprüfung; Quizfragen | `web/inhalte/lernapp/islam/**` |
| L6-05 | A | Koran-Pfad (Häufigkeit, freigegebene Bedeutungen, Wortzeiten), Hoca-Arbeitsliste | `web/inhalte/lernapp/koran/pfad.json`, `_lernapp/berichte/koran-arbeitsliste.md` |
| L6-06 | W | Eigene Wurzeltabelle (Tanzil-Formen, CAMeL Tools lokal, Wiktionary) zur Prüfung durch die Lehrkraft (LM-31) | `_lernapp/werkzeuge/wurzeln/*`, nach Prüfung `web/daten/[Ordnername]/` |

**Tor L6:** 0 sichtbare Bausteine ohne 2 Freigaben (Integration + Abfrage am Live-Stand); jede Aussage ≥ 1 Beleg; Belege am
Original bestätigt, bevor sichtbar; `religion-pruefung` 0; 0 Sprachausgabe für Koran, Hadith, Wissen (Test); Koran-Pfad zeigt nur
freigegebene Bedeutungen; 0 OpenITI-Text im Repository.

### L7 Spielelemente, Gruppen, Lehrkräfte (3–4 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L7-01 | A | XP, Tagesziel, Serie mit Pausen und Ruhezeit, Abzeichen (≈ 40), B-30, B-33, B-34 | `web/src/lib/lernapp/ereignisse/{serie,abzeichen,ableiten}.ts`, `web/src/components/lernapp/{Serie,Abzeichen,Abschluss}.tsx` |
| L7-02 | B | Gruppenziel, Bestenliste (ab 16, Zustimmung), Familienansicht; Lehrkraft-Seite (Pfade in `routing.ts` durch O); Schüler-Start mit Zuweisungen; Eltern-Übersicht; optional Push-Erinnerung | `web/src/app/api/lernapp/gruppe/route.ts`, `web/src/app/lern-app/[ui]/gruppe/**`, `web/src/components/mein-bereich/SchuelerStart.tsx`, Konto-Seite §3.1 |

**Tor L7:** Regeltests (sanfte Texte, keine Bestenliste < 16, keine hochzählenden Zahlen); Integration Gruppenisolation; E2E
Lehrkraft → Schüler*in → Lehrkraft; Mein Bereich ≤ 230 KB.

### L8 Härtung und Abnahme (3–4 Tage)

| Paket | Wer | Inhalt | Dateien |
|---|---|---|---|
| L8-01 | S | S-L3 vollständig (CSP/WASM, Sync, Rechte, Einwilligung, Meldungen, Uploads) | `_lernapp/berichte/s-l3.md` |
| L8-02 | A | Lighthouse aller Routen, axe, Drosselung CPU ×6, Lasttest Sync (200 gleichzeitige Konten) | `_lernapp/berichte/leistung.md` |
| L8-03 | O | Lizenzverzeichnis und Namensnennungen (`/quellen`, `/lern-app/[ui]/quellen`, offline), Mengenbericht, GO-LIVE-Liste der Schalter | `web/src/app/[locale]/(website)/quellen/**`, `_lernapp/berichte/mengen.md`, `_lernapp/GO-LIVE.md` |
| L8-04 | B | Handbücher (Lernende, Lehrkräfte, Sprachprüfung, Imam/Hoca) | `web/docs/handbuch/*` |
| L8-05 | O | Stufe C mit frischem Endprüfer, BERICHT mit Vorführpfad (AUFTRAG §6), ABSCHLUSS | `_lernapp/berichte/stufe-c.md`, `_lernapp/BERICHT.md`, `_lernapp/ABSCHLUSS.md` |

**Tor L8:** Z-L01…Z-L22 erfüllt oder als AUSNAHME mit Grund und Ersatz.

### Querschnitt (läuft neben den Etappen, abhängig von Menschen)

| Paket | Wer | Inhalt | Abhängig von |
|---|---|---|---|
| X-01 | W + M | Eigene arabische Stimme auf ClArTTS trainieren, Vokalisierungstest, danach Neuerzeugung ar | LM-25, LM-26 (Rechenzeit) |
| X-02 | W + M | Türkische Aufnahme (2–4 h) und eigene Stimme; danach Neuerzeugung tr | LM-24, LM-26 |
| X-03 | M | Menschliche Aufnahmen arabischer Kern A1/A2 über das Audio-Studio | LM-26 |
| X-04 | M | Muttersprachliche Stichproben, religiöse Freigaben, Koran-Bedeutungen | LM-01, LM-03, LM-13 |

**Gesamt:** Code ≈ 15–19 Agententage, Inhalt ≈ 25–35 Agententage; Inhalte ab L3 parallel zum Code, daher ≈ **6–8 Wochen
kritischer Pfad**. Menschliche Prüfung: Sprache ≈ 180 h, Wissen ≈ 200 h, Koran-Bedeutungen ≈ 25–50 h. Veröffentlicht wird
gestaffelt. (Der genehmigte Plan §4 schätzte 6–8 Tage Technik und 10–15 Tage Inhalt; überholt durch die Verfeinerung.)

---

## 15 Parallelisierung und Ressourcen

- **Code:** höchstens 2 Arbeitsbäume gleichzeitig (4 Kerne).
- **Gemeinsame Dateien nur durch den Orchestrator:** `routing.ts`, `proxy.ts`, `next.config.ts`, `header.ts`, `public/sw.js`,
  `globals.css`, `matrix.ts`, `funktionen-regeln.ts`, `tags.ts`, Schemas und Migrationen, `package.json`,
  `religion-pruefung.mjs`, `sprachen-pruefen.mjs`, KERN (L3-E12).
- **Texte:** je Paket ein eigener Namensraum in `messages/lernapp/*.json`, vom Orchestrator angelegt.
- **Inhalt:** bis 6 Agenten parallel, keine Bauten. Sprachausgabe nur in Zeitfenstern ohne Bau und E2E oder auf dem lokalen
  Server.
- **Plattenbudget bei 7,0 GB frei:**

  | Posten | Bedarf |
  |---|---|
  | 2 Arbeitsbäume (`.next` ≈ 1,5 GB je Bau, `node_modules` als pnpm-Hardlinks) | ≈ 3,5 GB |
  | Werkzeuge im Scratchpad: Sprachausgabe (Coqui TTS mit Modellen, ggf. Chatterbox, piper1-gpl) `[in S3 messen]`, LanguageTool ≈ 0,3 GB, Python-venv `[mit PyTorch neu messen]`, Testmodelle Whisper ≈ 0,4 GB, OpenITI-Auszüge der benannten Werke `[messen]` | Entwurf ≈ 1,7 GB, nach S3 neu rechnen |
  | Audio-Zwischenlager | ≤ 0,3 GB |
  | Reserve | ≈ 1,5 GB |

  Downloads im Strom filtern, Vollabzüge nicht speichern. Werkzeuge mit großen Modellen nacheinander installieren und wieder
  entfernen, wenn das Budget nicht reicht. Training eigener Stimmen nicht in dieser Umgebung, sondern auf einem Rechner nach
  LM-26. Nach jedem Merge `.next` und `test-results` löschen, `pnpm store prune` je Etappe.

---

## 16 MENSCHEN

Vollständige Liste mit Standard bis zur Antwort: `MENSCHEN.md` (LM-01…LM-36). Zuordnung der Lizenz-Entscheidungen
L0-E01…L0-E19 und der Plan-Aufgaben ML-01…ML-06 steht dort.

---

## 17 Risiken und Gegenmaßnahmen

| Risiko | Wirkung | Gegenmaßnahme |
|---|---|---|
| Inhaltsqualität bei 78.000 Sätzen | Vertrauensverlust | Rahmenpläne, Token-Annotation, Gegenprüfung, Rückübersetzung, Einlauf-Stichprobe 30 %, Annahmeregel, Meldeknopf, Hinweis bis zur Stichprobe |
| Arabische Morphologie im Abgleich | gültige Antworten abgelehnt | Abgleich ohne Harakat, Alternativen aus dem Inhalt, Wortbank vor Freitext, Bildschirmtastatur, Meldungen erweitern Alternativen |
| Sprachausgabe Arabisch mit Harakat | falsche Aussprache wird gelernt | Vokalisierungstest vor jedem Einsatz, 20 % Audio-Stichprobe, Aussprache-Überschreibungen, menschliche Aufnahmen für den Kern, sonst „Audio folgt“ |
| Keine freigegebene Stimme für ar oder tr | Hörübungen fehlen | Übergangsstimmen nach Test, „Audio folgt“ ohne Sackgasse, Querschnitt X-01…X-03, Z-L15 mit AUSNAHME-Regel |
| Rechtskette synthetischer Stimmen (L0-E03) | Rechtsrisiko | nur Stimmen mit freier Kette, Kette je Stimme in `QUELLE.md`, Klärung mit dem Rechtsberater (LM-22) |
| ClArTTS bzw. MLS beruhen auf LibriVox; Schutzstatus der Vorlagen in DE/EU ungeklärt | Rechtsrisiko für ar- und de-Ersatzstimme | vor dem Training bzw. Einsatz klären (LM-23, LM-25) |
| Chatterbox: Trainingsdaten nur pauschal beschrieben, Wasserzeichen | Herkunftsrisiko | nur als Übergang nach Test, Wasserzeichen offenlegen, kein Klonen ohne Einwilligung |
| Rechenzeit für eigene Stimmen fehlt | Ziel-Stimmen tr/ar verzögert | Übergang bleibt, Training auf Rechner nach LM-26 |
| Whisper auf Telefonen (Größe, Speicher, schwaches tr/ar) | Frust, Abstürze | Laden auf Wunsch mit Größe, Gerätecheck, base statt small, großzügige Schwellen, Selbstbewertung, Schalter |
| Religiöse Fehler oder erfundene Belege | schwer | nur gelieferte Passagen, Belegprüfer, zwei Prüfende mit Häkchen je Beleg, Quellenzeile, sofortiges Zurückziehen, keine Einzelfall-Fatwas |
| OpenITI NC-SA, Prüfende ohne Volltext | Prüfung langsamer | Fundstelle mit Kapitel und Ausgabe, Prüfung am eigenen Exemplar; Anzeige der Passage nach LM-04 |
| Fehlende Ausgaben (Nasafiyya, Hidāya, Marāqī) | Lücken im Akaid- und Fiqh-Teil | zurückstellen, alte Drucke beschaffen (LM-33) |
| Engpass menschliche Prüfung (≈ 400+ h) | Inhalte stauen sich | Stichproben statt Vollprüfung, effiziente Oberfläche, Reihenfolge nach Nutzen, Cockpit |
| Lizenzen offener Daten (BY, BY-SA) | Rechtsrisiko | `QUELLE.md` + SHA, Lizenzfeld je Eintrag (blockiert), Namensnennung offline, Ausschlussprüfung |
| Versionen mit Dev-Build (onnxruntime-web) | unerwartete Änderungen | exakt pinnen, Lockfile, Mindestreife (LM-29) |
| iOS: Speicher nach 7 Tagen geräumt, eigene Cookie-Ablage | Fortschritt weg, Anmeldung scheitert | Installation empfehlen, Anmeldung im Scope, Sync, Datei-Export |
| Konflikte und Uhrzeitfehler beim Sync | falsche Planung | Ereignisprotokoll, Nachspielen, Klemme, Eigenschaftstests |
| Root-SW löscht Lern-App-Caches | Offline kaputt | Ausnahme in `public/sw.js`, E2E „Root-SW-Update behält Lern-App-Vorrat“ |
| JS-Budget wächst | Leistung | Lazy-Chunks, Regeltests, Messrouten |
| Bauzeit und Repository-Größe | Bau > 15 min | Pakete bei Bedarf, Audio und Modelle außerhalb, idempotenter Import |
| Platte (7,0 GB), große Sprachausgabe-Werkzeuge | Abbruch | Budget §15, Strom-Filter, Werkzeuge nacheinander, Aufräumen |
| KI-Arabisch mit Religionsbezug in Sprachkursen | Verstoß gegen KI-Regel | Formel- und N-Gramm-Wächter, Pflicht-Kennzeichnung, religiöse Prüfung, keine Sprachausgabe |
| Verwechslung mit Elifbe (osmanisch-türkische Buchstabennamen vs. MSA) | Verwirrung | eigene Namen in Lern-App-Texten, Elifbe unverändert |
| Suchtmuster bei Kindern | Schaden | keine Benachrichtigungen standardmäßig, keine Schuldtexte, keine Bestenliste < 16, Pausetage |
| Kosten der Audio- und Modellroute | Kosten | `immutable` + CDN, SW-Vorrat, Rückfall Blob direkt (LM-15) |

---

## 18 Offene Entscheidungen (mit Standard, laufen ohne Warten weiter)

| ID | Frage | Standard | Mensch |
|---|---|---|---|
| O-1 | Sprachinhalte in Produktion vor bestandener Stichprobe zeigen? | **ja, mit Hinweis** „noch nicht von Muttersprachlern geprüft“ (`lernapp_ungeprueft` an) | LM-11 |
| O-2 | Religionsbezogene Einträge in Sprachkursen: eine oder zwei religiöse Prüfungen? | **zwei**, wie im genehmigten Plan §2.3 („Freigabe ×2“); ebenso die Formelliste; Wissensbausteine immer zwei | – |
| O-3 | Prüfoberfläche „Sprachprüfung“ dreisprachig? | ja, nur dieses Modul | – |
| O-4 | Bildkarten | nur Gegenstände und Symbole, keine Fotos, keine Gesichter, keine Menschen- und Tierdarstellungen | LM-34 |
| O-5 | Ziffern in der arabischen UI | östlich-arabisch, umschaltbar | LM-18 |
| O-6 | Audioformat | WebM/Opus 24 kbit/s; AAC-Rückfall nur nach Gerätetest | LM-07 |
| O-7 | Anmeldung im Scope der Lern-App | ja (iOS) | – |
| O-8 | Prüfvermerk mit Namen? | nein, Rollenangabe | LM-20 |
| O-9 | Kindgerechter Wissenspfad | Kennzeichnung je Lektion; eigener Pfad später | LM-17 |
| O-10 | Schwelle des Hadith-N-Gramms | **4 Wörter** wie im genehmigten Plan §3.4 (KERN §3); Fehlalarme nur über die Liste erlaubter Alltagsformeln ausnehmen | – |
| O-11 | Koran-Wortbedeutungen im Lern-App-Pfad: Status `geprueft` (ADR 0030) oder zwei Freigaben wie im Wissenskurs (Plan §3.1)? | **zwei Freigaben** wie im genehmigten Plan §3.1; ebenso die eigene Wurzeltabelle | LM-13 |
| O-12 | Standard-Tagesziel | `[festlegen in L7]` | – |

### Kritische Dateien

- `web/src/proxy.ts`
- `web/src/lib/sicherheit/header.ts` mit `web/next.config.ts`
- `web/public/sw.js`
- `_gemeinde/werkzeuge/religion-pruefung.mjs`
- `web/src/lib/religioes/freigabe.ts` mit `web/src/server/actions/freigaben.ts` und `web/src/lib/rechte/matrix.ts`

---

## 19 Stand je Etappe

| Etappe | Stand | Tor | Commit | Bemerkung |
|---|---|---|---|---|
| L0 Grundlagen | fertig | grün 20.10.2026 (8 Belege, Gegenprüfung frei, Religion und Wortlaut rc=0) | d1a754e | ADR 0037–0045 angenommen mit Fortschreibungen; Stimmen tr/ar „Audio folgt“ (L3-E10a) |
| L1 Kern | | | | |
| L2 Übungstypen | | | | |
| L3 Pipeline + A1 | L3-01 fertig (20.10.2026) | Lektorat de/tr/ar frei | [L3-01] | Leitfaden, Rahmen 3 × 72 Einheiten, Kontrast 6 Richtungen; LM-02 offen; Restpunkte `lehrplan/LEKTORAT-OFFEN.md` |
| L4 A2–B1 | | | | |
| L5 B2–C1 | | | | |
| L6 Wissen + Koran-Arabisch | | | | |
| L7 Spielelemente, Gruppen | | | | |
| L8 Härtung + Abnahme | | | | |
