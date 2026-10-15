# Stufe C · Prüfer o2 · Z-19, Z-11, Z-03, Z-05, Z-06

Stand: 15.10.2026, 03:18–03:40 UTC. Geprüft wurde `main` = 75cad0a (Arbeitsbaum HEAD 39f03da, `web/` unverändert gegenüber 75cad0a:
`git diff --stat 75cad0a HEAD -- web` ist leer). Server: http://localhost:3100 (`next start -p 3100`, Produktionsbau wie frischer
Vercel-Import, Beispielmodus ohne Datenbank, Sitemap-Basis igmg-neu.vercel.app). Am Repository wurde nichts geändert (`git status` sauber).
Während der Messungen lief die Maschine unter Fremdlast (Last 9,9 auf 4 Kernen, andere Prüfer mit Chromium). Bildraten sind deshalb nur
eingeschränkt aussagekräftig.

Ordner: `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/o2/` (im Folgenden `O/`).

---

## Z-19 Standort/Datenfluss → erfüllt (echte Push-Zustellung: UMGEBUNGSAUSNAHME)

Skript `O/skripte/z19-netz.mjs`, Ausgabe `O/z19-netz.out`, Rohdaten `O/z19-netz.json`.

**Netzmitschnitt.** Playwright (Chromium 141) auf 63 öffentlichen Routen (de 48, tr 8, en 7), Kontext-Ereignis `request`, also auch
Anfragen des Service Workers. Jede Seite wurde bis `networkidle` geladen, dann in 600-px-Schritten bis ans Ende gescrollt.
Ergebnis: 60 × 200 und 3 × 404 (`/hatim` und `/newsletter` sind im Import-Modus abgeschaltet, dazu `/gibt-es-nicht`). Insgesamt
4.565 Anfragen, davon **0 an fremde Hosts** und 0 WebSockets.

**Permissions-Policy.** Gelesen aus dem Kopf jeder Dokumentantwort.
- Nur `/gebetszeiten`, `/tr/namaz-vakitleri` und `/en/prayer-times` liefern `geolocation=(self)`. Alle 60 übrigen Routen liefern
  `geolocation=()`, auch `/gebetszeiten/anzeige`. Fehlbelegungen: 0.
- Voller Wert: `camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), accelerometer=(self), gyroscope=(self), magnetometer=(self)`.
- Quelle: `web/src/lib/sicherheit/header.ts:57-75` (`PFAD_BERECHTIGUNGEN`), eingetragen in `web/next.config.ts:91-98`.
- Live (https://igmg-wetzlar.vercel.app, `O/z11-live.tsv`): dasselbe Bild. Die drei Gebetszeiten-Routen haben `(self)`, alle anderen
  geprüften Routen `()`.

**Wirksamkeit.** Die Browser-Erlaubnis für den Standort war erteilt, trotzdem verweigert der Browser `getCurrentPosition` mit
„code 1: Geolocation has been disabled in this document by permissions policy“. Geprüft auf `/`, `/quran`, `/veranstaltungen`,
`/gebetszeiten/anzeige`, `/kalender`, `/tr` und `/en`. Auf den drei Gebetszeiten-Routen ist die Abfrage erlaubt.

**„Mein Ort“ mit simulierter Geolocation.** Koordinaten 48.137154 / 11.576124 (München), Ablauf in de, tr und en: Reiter „Mein Ort“,
dann „Meinen Standort verwenden“ bzw. „Konumumu kullan“ bzw. „Use my location“.
- Das Ergebnis erscheint („Gebetszeiten in der Nähe von München“, Qibla 129,8°). Bild: `O/z19-meinort_gebetszeiten.png`, dazu `_tr_…` und `_en_…`.
- Nach dem Klick folgen je 4 Anfragen. Das sind nur zwei JS-Chunks, je einmal Seite und einmal Service Worker.
- Gesucht wurde nach `48.137`, `11.576`, `48,137`, `11,576`, `48.14`, `11.58`, `48.1`, `11.5`, `48137` und `11576`, und zwar in URL,
  Body und Kopfzeilen aller Anfragen sowie in WebSocket-Frames. **0 Treffer.**
- `getCurrentPosition` wurde je Sprache genau einmal aufgerufen, nach dem Klick.
- `localStorage` enthält ohne den Haken „merken“ nur `igmg-konzepthinweis-gesehen`.
- Der Code rundet sofort und sendet nichts: `MeinOrtRechner.tsx:148-160`. Die E2E-Spezifikation `tests/e2e/gebetszeiten-mein-ort.spec.ts:16-32` prüft dasselbe.

**Push nur nach Opt-in.** Das Init-Skript zählt Aufrufe von `Notification.requestPermission` und `PushManager.prototype.subscribe`.
- Auf allen 63 Routen gab es 0 Aufrufe und kein Abo (`pushManager.getSubscription()` → null).
- Die Push-Einstiegskarte (`push-titel`) wird im Import-Modus nicht gerendert, weder lokal noch live (0 Treffer). Grund: VAPID fehlt
  zur Bauzeit (`gebetszeiten/page.tsx:55`).
- Im Code läuft das Abo nur in `speichern()` nach Klick und Haken: `PushEinstellungen.tsx:130-144` mit Prüfung `einwilligung`,
  `requestPermission`, `subscribe`. `PushStart.tsx:46-55` lädt die Einstellungen erst nach Klick.
- Server: `tests/integration/push.test.ts:100` („weist … fehlende Einwilligung ab“).
- Echte Zustellung ist nicht prüfbar: **UMGEBUNGSAUSNAHME** (echte Push-Zustellung).

**Unit-Tests.** `pnpm exec vitest run --project unit` mit kopfzeilen-pfade, push, vercel-import, vercel-env-doku, token-spiegel,
styleguide-tokens und umgebung: **7 Dateien, 284 Tests grün.**

---

## Z-11 Vercel → teilweise

**V-01 Konfiguration.**
- `vercel.json`: `$schema`, `regions ["fra1"]`, Service `web`, `ignoreCommand`, 2 Crons täglich (01:00 und 02:00 UTC).
- `web/vercel.json`: gleichwertig für Root Directory `web`.
- `web/scripts/vercel-ignore.mjs`: Vorschau bei „ZWISCHENSTAND“ wird nicht gebaut, Produktion baut immer.
- `web/package.json:114-116`: `packageManager pnpm@12.11.2`, `engines.node 24.x`.
- `.vercelignore`: `_archiv`, `_lauf`, `_gemeinde`, `betrieb`. `_werkstatt` existiert nicht mehr.
- Wurzel-`package.json`: Wächter-Build, der bei falschem Preset abbricht.

**V-02 Build wie auf Vercel, mit Daten.**
- `scratchpad/bau-import-f.log` (18:37 UTC): 1866/1866 Seiten, „bau exit 0“. Umgebung `env-import.sh`: `VERCEL=1`,
  `VERCEL_ENV=production`, ohne `APP_URL`/`SITE_MODE`.
- `scratchpad/bau-vorschau-f.log` (18:41 UTC): 2207/2207 Seiten, „bau exit 0“.
- Beide mit Daten in der PGlite-Bau-Datenbank, z. B. `bau-import-f.log:22-27`: Koran 114 Suren, 6236 Verse, 77.433 Wörter,
  3 Übersetzungen à 6236, Bukhari 97 Bücher, 7580 Hadithe.
- Einschränkung: Die Logs nennen keinen Commit. Sie entstanden nach dem Commit 75cad0a (18:23 UTC), und PRÜFPUNKT 14.10. 19:40
  ordnet sie 75cad0a zu.

**V-03 Umgebung.** `web/docs/deploy/VERCEL-ENV.md` hat 48 Variablenzeilen mit Zweck, Pflicht je Betriebsart, Bereich, „geheim“ und
Beispiel. Test `vercel-env-doku.test.ts` grün.

**V-04 Datenbank.** ADR 0018; `attachDatabasePool` in `web/src/lib/db/index.ts:2,83`. Eine Produktionsdatenbank ist nicht verbunden
(MN-00). Deshalb liefert `/api/health` lokal und live 503 `{"status":"fehler"}`; die Route prüft `select 1` (`api/health/route.ts`).
Das ist Beispielmodus, keine Störung.

**V-05 Dateien.** ADR 0020: Blob fra1, 4,2 MB, Browser-Verkleinerung, PDF-Direktupload.

**V-06 Cron.** Täglich. `/api/wartung/loeschfristen` und `/mail-ausgang` liefern ohne Geheimnis 401, lokal und live. Sperre in
`web/src/lib/wartung/sperre.ts`.

**V-07 Mehrere Instanzen.** Ratenbegrenzung in Datenbanktabellen: `lib/db/schema/system.ts:32` `ratenbegrenzung`,
`schema/auth.ts:117` `rate_limit`, `auth/optionen.ts:38` `storage: 'database'`.

**V-08 Caching.** 19 Dateien mit `cacheTag`, 6 mit `revalidateTag`/`updateTag`. Live `x-vercel-cache` PRERENDER/HIT auf statischen Seiten.

**V-09 Vorschau.** Die Deployment-Adressen `igmg-wetzlar-fvfkrpizf-tez1`, `igmg-wetzlar-g2vqtylq0-tez1` und
`igmg-5dxravulu-uus-projects-…` antworten mit 302 auf `vercel.com/sso-api` und `x-robots-tag: noindex`.

**V-10 Betrieb.** Health-Route vorhanden. Zurückrollen in VERCEL.md §12, Sicherung und Wiederherstellung in §13.

**V-11 Recht und Cockpit.** `web/docs/recht/entwuerfe/verarbeitungsverzeichnis-ergaenzung.md:55` nennt Vercel als Auftragsverarbeiter.
`web/src/lib/startklar/pruefungen.ts:102-131` prüft Region fra1, HTTPS und Cron.

**V-12 Tarif.** Die Empfehlung ML-09 steht in `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md:33`. VERCEL.md §14 (Z. 459-460) sagt
nur „in MENSCHEN.md“. `_gemeinde/MENSCHEN.md` enthält ML-09 nicht. Das ist ein Verweisfehler, kein Inhaltsfehler.

**V-13 Runbook.** VERCEL.md hat die Abschnitte 0–16 (Import, Region, DB, Speicher, Variablen, Vorschau, Domain, DNS SPF/DKIM/DMARC,
Zusammenführen, Abnahme, Zurückrollen); dazu `web/docs/GO-LIVE.md`. Es gibt keinen Vercel-Lesezugang. Ersatz: die öffentliche
GitHub-Deployments-API (`O/z11-deployments.json`, `O/z11-status-*.json`).
- **75cad0a, Production:** `igmg-wetzlar` (7074252719, success 18:48:10, igmg-wetzlar-g2vqtylq0-tez1) und `igmg` (7074251414, success).
- **75cad0a, Preview:** `igmg-wetzlar` (7073826331, success) und `igmg` (7073893202).
- Spätere Einträge (0a008e1, 39f03da) sind nur ZWISCHENSTAND-Vorschauen.

**Live-Stand.** https://igmg-wetzlar.vercel.app (`O/z11-live.tsv`, 03:24 UTC):
- 200 auf `/`, `/gebetszeiten` (de/tr/en), `/veranstaltungen`, `/nachrichten`, `/ueber-uns`, `/projekte`, `/organisationen/ana-teskilati`,
  `/bildung/korankurse`, `/bildung/voranmeldung`, `/kontakt`, `/vorstand`, `/quran`, `/quran/2`, `/hadith`, `/hadith/bukhari/1`,
  `/elifbe`, `/elifbe/buchstaben/elif`, `/lernen`, `/kalender`, `/ramadan`, `/spenden`, `/quellen`, `/datenschutz`, `/impressum`,
  `/suche`, `/sitemap.xml`, `/robots.txt`, `/verwaltung`, `/mein-bereich` und `/anmelden`.
- 404 (erwartet): `/hatim`, `/newsletter`, `/gibt-es-nicht` und `/audio/…`.
- 503: `/api/health` (ohne Datenbank).
- Funktionsregion: Die Funktionsantworten tragen `x-vercel-id: iad1::fra1::…`, z. B. `/api/health`, `/audio/…`, `/gibt-es-nicht`.
  Edge iad1 liegt am Prüfstandort, die Funktion läuft in **fra1**.
- Stand 75cad0a: Die in 75cad0a geänderte Klasse in `Bauprojekt.tsx` (`border-linie md:pb-0 pb-16`) ist live und lokal je 2× vorhanden.

**Audio.**
- `vercel.json` und `web/vercel.json` enthalten **keinen** Rewrite `/audio/*`. ADR 0029 Nr. 1 und `_gemeinde/AUFTRAG.md:208`
  verlangen ihn aber.
- Die Auslieferung läuft über die Route `web/src/app/audio/[...pfad]/route.ts`: gleicher Ursprung, Blob über `liefereAudio`, das
  `fetch` mit Range nutzt (`lib/audio/speicher.ts:95-115`). `speicher.ts:12-13` nennt das ausdrücklich als Rückfall
  („ohne Rewrite reicht die Route durch“).
- Im Beispielmodus belegt: lokal 404 und live 404 über fra1. Range 206 und 404 sind nur im Integrationstest belegt
  (`tests/integration/verwaltung-rezitationen.test.ts:373-382`).
- Blob-Weg: UMGEBUNGSAUSNAHME, weil weder Blob-Token noch Datenbank vorhanden sind.

**Bewertung.** V-01…V-13 sind im Repository und live erfüllt; zwei Verweise sind veraltet (V-12, siehe oben). Der Build mit Daten
ist grün. „Audio-Rewrite belegt“ ist **nur als Route** belegt. Der in ADR 0029 entschiedene `vercel.json`-Rewrite fehlt, und die
Abweichung steht in keiner Entscheidung. Deshalb „teilweise“.

---

## Z-03 Designsystem → teilweise (27 freie Werte, darunter 12 mit rohen Maßen)

Befehl:

```
git diff --name-only --diff-filter=ACMR b702c7c..75cad0a -- web/src > O/z03-dateien.txt
node _gemeinde/werkzeuge/freie-werte.mjs $(cat O/z03-dateien.txt) --protokoll O/z03-freie-werte
```

Ausgabe in `O/z03-freie-werte.out`, `.md` und `.json`. Ergebnis: **586 geprüfte Dateien, 171 Funde** (Klammerwerte 75, Hex 65,
px in Style 28, Farbfunktion 3). Die Funde wurden per Skript nach REFERENZ §1 (`_archiv/lauf-gestaltung-2026-10/pakete/REFERENZ.md`)
eingeteilt:

| Klasse | Anzahl |
|---|---|
| Belegte Ausnahmen: styleguide/tokens.ts 56, mail/vorlagen/farben.ts 25, seo/og-bild.tsx 7, layout.tsx themeColor 1 | 89 |
| Fehlalarm, regulärer Ausdruck: audio/direkt+speicher, cms/slugs+ziele, medien/direkt, quran/tanzil, actions/besondere-tage, hatim, newsletter | 28 |
| Fehlalarm, Attributselektor: globals.css 916-926, quran.css 138/141 | 13 |
| Fehlalarm, Kommentar: globals.css 122-146, 195, 244 | 8 |
| Fehlalarm, Zahl 0: mail Rahmen/index | 5 |
| Fehlalarm, rootMargin: QiblaKompassBeiBedarf.tsx:35 | 1 |
| **frei** (alle 27 im Lauf neu, geprüft gegen `git show b702c7c:…`) | **27** |

Die 27 freien Werte:

**Mit rohem Maß (12):**
- `KontoEinstieg.tsx:61` `lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]`
- `MeinBereichRahmen.tsx:88` `lg:grid-cols-[17rem_minmax(0,1fr)]`
- `KontoFormulare.tsx:217` `grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))]`
- `richtext/Werkzeugleiste.tsx:89,195,262` `@min-[21rem]` ×2 und `@min-[18rem]` ×2
- `anzeige/FolienFormular.tsx:112` `min-h-[calc(4lh+1.5rem+0.125rem)]`
- `seiten/SeitenFormular.tsx:266` `min-h-[calc(2lh+…)]`
- `seiten/felder.tsx:73` `min-h-[calc(3lh+…)]`
- `projekte/Bauprojekt.tsx:169` `text-[length:clamp(var(--text-18),12cqi,var(--text-24))]`
- `elifbe/buchstaben/[buchstabe]/BuchstabenAnsicht.tsx:192` `text-[calc(var(--text-48)*4/3)]`

**Rasterschablonen ohne Maß (8):**
- `mein-bereich/konto/page.tsx:85`
- `verwaltung/(geschuetzt)/koran/des-tages/page.tsx:48`
- `chat/ChatFenster.tsx:291,351`, nach Sichtabnahme-2 GC-3 so empfohlen
- `KontoFormulare.tsx:197`
- `MeinOrtRechner.tsx:28`
- `projekte/Meilensteine.tsx:197` ×2

**Beliebige Eigenschaften oder Varianten (7):**
- `[mask-image:…black_--spacing(12)…]` (Token-Maß): `mein-bereich/kinder/[id]/page.tsx:188` und `BereichLeiste.tsx:49` ×3
- `[scrollbar-width:none]`: `GebetszeitenTabs.tsx:114`
- `[&::-webkit-details-marker]:hidden`: `verwaltung/(geschuetzt)/lehrplan/page.tsx:117`
- `transition-[stroke-dashoffset]`: `OfflineSpeichern.tsx:34`

Schwelle „0 freie Werte in geänderten Dateien“: **nicht erreicht.** Mindestens die 12 Werte mit rohem Maß sind echte Werte außerhalb
der Skalen. Die 15 übrigen sind strukturell, brauchen aber eine Ausnahmeklasse in REFERENZ §1 oder ein Utility, wie es
`raster-karten` für `grid-cols-[repeat(…)]` ist.

---

## Z-05 Bewegung → teilweise

**Register B-01…B-27.** Alle 27 IDs sind definiert, aber in zwei Dateien:
- B-01…B-12 in `_archiv/lauf-gestaltung-2026-10/KERN.md:61-72` (v1.4)
- B-07/B-08 (Fortschreibung) und B-13…B-27 in `_gemeinde/KERN.md:46-64`

Das Register hat zwei Dokumentationsfehler:
- `_gemeinde/KERN.md:3` verweist auf `_werkstatt/KERN.md`. Den Pfad gibt es seit der Archivierung nicht mehr.
- `_gemeinde/KERN.md:62` sagt zu B-25 „noch nicht im Code“. B-25 ist aber umgesetzt: `components/website/anzeige/AnzeigeLive.tsx:49`
  (Folien blenden über), `:164` (im Gebetsfenster keine Folien) und `:321` (`blendet-ein`).

**Abgleich Register gegen Code.** Alle im Register genannten Dateien existieren; alle 23 Dateipfade wurden geprüft. Die Klassen und
Keyframes sind vorhanden:
- `globals.css:373-504`: Keyframes `einblenden`, `ausblenden`, `auftritt`, `auftritt-mitte`, `zeichnen`, `enthuellen`,
  `schiebefenster(-gegen)`, `wachsen`, `aufziehen`, `hervortreten`, `schublade` und `seite-von/nach-*`; dazu `schreiben` in Z. 663.
- `quran.css:318-329`: `regel-schublade` und `regel-blatt`.
- Andere Keyframes gibt es in `web/src` nicht.
- `animate-in`/`animate-out` (8×) stecken nur in den shadcn-Vorlagen, ohne Plugin also ohne Wirkung (archivierter KERN Z. 78).
  `animate-spin` steht nur in der nicht eingebundenen `ui/sonner.tsx`.

Block „Reduzierte Bewegung“ (`globals.css:671-718`, `quran.css:419-437`): Linien und Marken auf `animation: none`, Auftritte auf
`einblenden`, alle Dauern auf 0,01 ms, View Transitions `none`. B-07/B-08 starten bei reduzierter Bewegung nicht
(`ErstesSichtbarwerden.tsx:23`), B-26 auch nicht (`SeitenUebergang.tsx:94`).

**Stichprobe ohne Interaktion.** `bewegung.mjs` lief auf 11 Routen, Ausgabe `O/z05-bewegung.out`, Protokolle
`O/z05-bewegung-*.json/.md`, Bilder `O/bilder/bewegung-*/`. Routen: `/`, `/ueber-uns` (scrollen), `/projekte` (scrollen),
`/organisationen/ana-teskilati`, `/elifbe/buchstaben/elif`, `/quran`, `/lernen`, `/elifbe`, `/bildung/korankurse` (scrollen),
`/gebetszeiten` und `/ramadan`.
- Bei reduzierter Bewegung gab es überall 0 Keyframes mit Lage oder Größe und die größte Lageänderung war 0 px.
- Nach 2 s und nach dem Scrollen blieb kein Element mit Deckkraft 0 zurück.
- Bildrate bei CPU 4× (unter Fremdlast): höchstens 4,9 % verworfene Bilder (`/ramadan`), sonst 0–2,5 %.
- Ohne Drosselung waren `/bildung/korankurse` 11,6 % und `/ramadan` 6,6 %. Das ist mehr als mit 4× Drosselung, spricht also für
  Fremdlast. Diese Werte bitte in Ruhe nachmessen.

**Stichprobe mit Interaktion.** Skripte `O/skripte/z05-reduziert.mjs` und `z05-wortkarte*.mjs`, Ausgaben `O/z05-reduziert.json` und
`O/z05-wortkarte*.out`. Vergleich: reduzierte Bewegung gegen „keine Vorliebe“.

| Bewegung | Reduziert | Keine Vorliebe |
|---|---|---|
| Telefonmenü (B-03) | 6 Animationen, nur `einblenden`/opacity | `schublade`/`auftritt` mit translate |
| Seitenwechsel (B-26) | `startViewTransition` 0×, kein `data-richtung` | 1×, `tiefer` |
| Wortkarte (B-14), 390 und 1440 | nur opacity, `translate: none`, `scale: 1`; bei 1440 zusätzlich `top` mit 0,01 ms, also ein Sprung ohne Bewegung | `translate` bzw. `scale` 320 ms |
| Schreibweg (B-17) | Pfeile `inline`, Tinte `none`, keine Animation (`O/z05-schreibweg-reduce.jpg`) | – |
| Mein Ort / Qibla (B-21) | nur `einblenden` 0,01 ms, keine Drehung | `transform` 1200 ms |

**Befund B-01, Druck-Rückmeldung.** Das Register (archivierter KERN Z. 61) verlangt für „reduziert“ „nur Farbe“. Gemessen mit
`reducedMotion: 'reduce'` auf `/gebetszeiten`: `#gz-tab-monat` hat gedrückt `scale: 0.98`, die Breite fällt von 147,2 auf 144,2 px.
Nur Knöpfe mit `motion-reduce:active:scale-100` bleiben bei `scale: 1`.
- Zählung in `web/src`: 146 × `active:scale-98`, davon nur 31 mit `motion-reduce:active:scale-100`. **115 Stellen** ändern also
  auch bei reduzierter Bewegung die Größe, sofort und ohne Übergang. Liste: `O/z05-druck-ohne-reduziert.txt`.
- Laufbeginn b702c7c: 83 Stellen, 75 davon ohne Variante. Im Lauf kamen 40 hinzu.
- Ähnlich, aber nur Lage: Pfeile mit `group-hover:translate-x-1` ohne `motion-reduce:group-hover:translate-x-0` in
  `verwaltung/(geschuetzt)/koran/page.tsx:53` und `mein-bereich/unterricht/page.tsx:162`.

Schwelle „reduziert ohne Lage/Größe“: Für Animationen ist sie erfüllt. Die Druck-Skalierung um 2 % widerspricht B-01, deshalb „teilweise“.

---

## Z-06 Grafik → erfüllt

**Befehl.** `node _gemeinde/werkzeuge/svg-pruefung.mjs --protokoll O/z06-svg`, Ausgabe `O/z06-svg.out/.md/.json`.

**Statische Prüfung.**
- 0 `.svg`-Dateien im Repository, 41 Inline-`<svg>` in `web/src`.
- Werkzeug-Ergebnis: Fehler 0 (weder doppelte IDs je Datei noch `<image>`), Befund 15, OK 26.
- Die 15 Befunde wurden einzeln von Hand geprüft. Alle sind zugänglich:
  - **10 × JSX-Kurzform `aria-hidden`.** Das Werkzeug erkennt nur `="true"`. Fundstellen: `Kinderzugang.tsx:213`, `Lernweg.tsx:115`,
    `AnwesenheitErfassen.tsx:106`, `FortschrittErfassen.tsx:31`, `verwaltung/koran/Teile.tsx:88`, `SchreibwegSteuerung.tsx:75,94`,
    `UebenStart.tsx:93`, `Uebungen.tsx:22` und `Weg.tsx:48`.
  - **4 × in einem Elternelement mit `aria-hidden`:** `Lernweg.tsx:28` (Span Z. 22-23), `QiblaKompassAnsicht.tsx:58` (Div Z. 57),
    `BuchStern.tsx:44` (Span Z. 38-39) und `KursWeg.tsx:56` (Span Z. 54).
  - **1 × `role="progressbar"` mit `aria-label`:** `OfflineSpeichern.tsx:15-17`.

**Laufzeit.** Gemessen auf 63 Routen (`O/z19-netz.json`, Feld `dom`).
- 4.499 SVG auf oberster Ebene: 4.492 in `aria-hidden`, 7 mit Rolle und Name (Tagesbogen bzw. Schreibweg), **0 ungeklärt**.
- **0 doppelte IDs** im DOM. IDs innerhalb der SVGs entstehen über `useId` bzw. Props: `TagesbogenLive.tsx:65`,
  `Schreibweg.tsx:51-80`, `Uebungen.tsx:328` und `HatimRing.tsx:46`.
- 0 Schrift- oder Bild-Icons fremder Familien.

**Eine Icon-Familie.** `web/package.json:60` hat nur `lucide-react` 1.55.0, mit 291 Importen. Die eigenen Zeichen in
`components/website/Icons.tsx` (Achtstern, Nachtzeichen) liegen auf dem Lucide-Raster: 24er-viewBox, Strich 2, runde Enden. Zur
Laufzeit sind 3.128 von 4.499 SVG `lucide`; der Rest sind Grafiken und Achtstern-Marken.

**Hinweis zum Werkzeug.** `svg-pruefung.mjs:51` sollte auch die Kurzform `aria-hidden` ohne Wert erkennen. Sonst bleiben die
10 Fehlalarme stehen.
