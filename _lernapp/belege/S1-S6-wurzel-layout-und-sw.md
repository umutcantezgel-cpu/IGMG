# Beleg L0-S1 + L0-S6 – Wurzel-Layout `/lern-app/[ui]` und Service Worker im eigenen Scope

Stand: 16.10.2026 · Paket L0-05 (Code-Agent A) · Arbeitsbaum `.claude/worktrees/agent-a212ace6efc9226bb`
(Zweig `worktree-agent-a212ace6efc9226bb`, per Fast-Forward auf `e9aab6e` gebracht) · Commits `072c65a` (S6) und
`b7cc3ad` (S1), beide „ZWISCHENSTAND L0-S1/S6: …“ · KI-Regel 2 beachtet: keine religiösen Texte, keine arabische Schrift
(Arabisch nur in Umschrift, Ziffern als Codepunkte).

## 1. Ziel

- **S1 (ADR 0037 Nr. 1–3, 5, 6, 8; ADR 0044 Nr. 4):** eigenes Wurzel-Layout außerhalb von `[locale]` mit `<html lang dir>`
  über `next/root-params`, nur de/tr/ar, statisch unter Cache Components; Proxy-Ausnahme samt Weiterleitungen; Manifest je
  Oberflächensprache (Scope `/lern-app/`); eingegrenzte Arabisch-Regel; Platzhaltertexte aus `web/messages/lernapp/*.json`.
  Nachweis: Produktionsbau wie frischer Import grün, Seiten statisch, keine Kollision mit `[locale]`, `app/manifest.ts` nicht
  doppelt verlinkt, Website-Routen unverändert.
- **S6 (ADR 0037 Nr. 8, ADR 0038 Nr. 1):** eigener Service Worker `web/public/lern-app/sw.js` (Scope `/lern-app/`) neben dem
  Root-SW; Root-SW behält `igmg-lernapp-*`; `idb` (ISC) speichert und liest in IndexedDB.

## 2. Vorgehen

### 2.1 Geänderte und neue Dateien (Arbeitsbaum, committet)

| Datei | Inhalt |
|---|---|
| `web/src/app/lern-app/[ui]/layout.tsx` | Wurzel-Layout: `generateStaticParams` de/tr/ar, `unstable_paramMatching = { ui: 'not-found' }` (statt `dynamicParams`, s. 3.1), `ui()` aus `next/root-params`, `<html lang dir data-oberflaeche="lernapp">`, Metadaten mit eigenem `manifest`, `robots: noindex` (Platzhalter), Schriften wie Website, SW-Anmeldung |
| `web/src/app/lern-app/[ui]/page.tsx` | Platzhalter-Start: Titel, Hinweis, Sprachwahl als `<a>` (Eigenname mit `lang`/`dir`), Probe der Pluralformen n = 0, 1, 2, 3, 11, 100 |
| `web/src/app/lern-app/[ui]/not-found.tsx` | „Nicht gefunden“ in der Oberflächensprache |
| `web/src/app/lern-app/[ui]/[...rest]/page.tsx` | **zusätzlich nötig** (3.2): Fangroute, `notFound()` in Suspense, `ensureStatic = 'navigation'`, Platzhalter `_` |
| `web/src/app/lern-app/[ui]/manifest.webmanifest/route.ts` | Manifest je Sprache, statisch (`generateStaticParams`) |
| `web/src/lib/lernapp/texte.ts` | `OBERFLAECHEN`, `istOberflaeche`, `richtung`, `lernTexte()` = `createTranslator` mit ausdrücklicher Sprache (Vorgriff auf L1-03) |
| `web/src/components/lernapp/ServiceWorkerAnmeldung.tsx` | `register('/lern-app/sw.js', { scope: '/lern-app/' })`, nur Produktion und sicherer Kontext |
| `web/messages/lernapp/{de,tr,ar}.json` | Platzhalter; `ar.json` nur Umschrift in eckigen Klammern (z. B. „[ar: marhaban bika fi tatbiq at-taʿallum]“) |
| `web/src/proxy.ts` | `lernAppWeg()` vor allen übrigen Regeln (3.3) |
| `web/src/app/globals.css` | `[lang='ar']:not(:where([data-oberflaeche])), [dir='rtl']:not(:where([data-oberflaeche]))` |
| `web/public/lern-app/sw.js` | Hülle `igmg-lernapp-schale-v1`; Seiten Netz zuerst, `/_next/static` Vorrat zuerst; nie `/api/**`, `…/anmelden`, POST, fremde Ursprünge; löscht beim Aktivieren nur eigene alte Hüllen |
| `web/public/sw.js` | Aktivieren: `&& !n.startsWith('igmg-lernapp-')` |

`package.json` blieb unverändert (gemeinsame Datei, L1-02): `idb` wurde für die Probe aus dem Scratchpad eingespielt.

### 2.2 Befehle (Kurzform)

```sh
SP=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad
export PATH=$SP/node24/bin:$PATH
cd .claude/worktrees/agent-a212ace6efc9226bb && git status && git merge --ff-only claude/trusting-lovelace-6nfolz
cd web && pnpm install --frozen-lockfile --offline            # Patch next@16.4.0 aus dem Merge anwenden
# Vergleichsbau des unveränderten Stands (e9aab6e), dann jeder Bau gleich:
. $SP/env-import.sh; TMPDIR=$SP/l0/tmp-s1 node scripts/vercel-bau.mjs > $SP/l0/s1/bau-<n>.log
$SP/l0/s1/starte-3241.sh <log> (next start -p 3241, Umgebung wie frischer Import) · Stopp per PID: $SP/l0/s1/stoppe-3241.sh
sed 's/3100/3241/g' $SP/pruefe-adressen.sh > $SP/l0/s1/pruefe-adressen-3241.sh    # Sweep 61 Website-Adressen
node $SP/l0/s6/skripte/stil-website.mjs        # berechnete Schrift aller [lang=ar]/[dir=rtl] auf 5 Website-Seiten
PROBE_STOPP="$SP/l0/s1/stoppe-3241.sh <pid>" node $SP/l0/s6/skripte/probe.mjs http://localhost:3241 <web> \
  $SP/l0/s6/idb-x/package/build/umd.js $SP/l0/s6/aus                   # Playwright, Chromium 141 (/opt/pw-browsers/chromium)
next typegen && tsc --noEmit · eslint (geänderte Dateien) · prettier --check · vitest --project unit
node _gemeinde/werkzeuge/religion-pruefung.mjs · node scripts/sprachen-pruefen.mjs · node _gemeinde/werkzeuge/freie-werte.mjs
```

Downloads (eigene leere Ordner, nur gelesen): `idb-8.0.3.tgz` (SHA-256 `bb775ec42726f743720ad9709cf778c33a835233355cef840676f34be6965f92`),
`@fontsource/noto-sans-arabic-5.3.0.tgz` (SHA-256 `e0a81ade67ce507c9b91546ca3d91332d184a8277fc683440b00896b430856bb`, nur zum Messen).

## 3. Ergebnisse

### 3.1 `dynamicParams = false` ist unter Cache Components verboten

| Variante im Layout | Ergebnis |
|---|---|
| `export const dynamicParams = false` | **Bau bricht ab:** „Route segment config "dynamicParams" is not compatible with `nextConfig.cacheComponents`. Please remove it.“ (Turbopack, `bau-v0-dynamicparams.log`; auch `docs/01-app/02-guides/migrating-to-cache-components.md`) |
| `export const unstable_paramMatching = { ui: 'not-found' }` (Next 16.4, `build/segment-config/app/app-segments.js`, Modi not-found/blocking/fallback/dynamic) | Bau grün; `prerender-manifest`: `notFoundParams: ["ui"]`. **Aber:** ein nicht passender Wert fällt nicht auf 404, sondern zur nächsten Route – `[locale]/[...rest]` (s. 3.2). |
| zusätzlich `if (!istOberflaeche(ui)) notFound()` im Layout | Absicherung, falls die Parameter-Zuordnung (unstable) entfällt |

### 3.2 Kollision mit `[locale]` – gefunden und behoben

Erster Bau ohne Fangroute: Die genauen Adressen `/lern-app/(de|tr|ar)` haben Vorrang vor `[locale]` (statisches Segment),
**unbekannte** Adressen nicht:

| Adresse | ohne Fangroute | mit Fangroute ohne Suspense | mit Suspense, ohne `ensureStatic` | **Endstand** |
|---|---|---|---|---|
| `/lern-app/de/gibt-es-nicht` | 404, `<html lang="lern-app">`, leere Seite (`[locale]`-Baum) | 404, Hülle `<html id="__next_error__">` (ohne `lang`) | **200** (Streaming begann vor `notFound`) | **404**, `<html lang="de" dir="ltr" data-oberflaeche>` |
| `/lern-app/xx` | 404, `lang="lern-app"`, leer | 404, `__next_error__` | 200 | **404**, Lern-App-Layout de (Proxy schreibt intern auf `/lern-app/de/xx` um) |
| `/lern-app/ar/a/b` | 404, `lang="lern-app"` | 404, `__next_error__` | 200 | **404**, `lang="ar" dir="rtl"` |

Endstand = Muster der Website-Fangroute: `params` erst in `<Suspense>` lesen, `ensureStatic = 'navigation'`. Im Browser
(nach dem Laden) zeigt jede dieser 404-Seiten die Überschrift der Lern-App in der richtigen Sprache und Richtung.

### 3.3 Adressen der Lern-App (Endstand, `next start` wie frischer Import)

| Adresse | Status | Ziel bzw. `<html>` |
|---|---|---|
| `/lern-app`, `/lern-app/` | 308 | `/lern-app/de` (Schrägstrich-Variante über Next 308 → `/lern-app` → 308) |
| `/lern-app/de`, `/tr`, `/ar` | 200 | `lang="de|tr" dir="ltr"` bzw. `lang="ar" dir="rtl"`, je `data-oberflaeche="lernapp"`; `x-nextjs-prerender: 1`, Cache HIT |
| `/tr/lern-app`, `/en/lern-app`, `/de/lern-app` | 308 | `/lern-app/tr`, `/lern-app/de`, `/lern-app/de` |
| `/tr/lern-app/ar`, `/en/lern-app/tr-aus-de`, `/tr/lern-app?x=1` | 308 | `/lern-app/ar`, `/lern-app/de/tr-aus-de`, `/lern-app/tr?x=1` |
| `/lern-app/en`, `/lern-app/en/x` | 308 | `/lern-app/de`, `/lern-app/de/x` |
| `/lern-app/xx`, `/lern-app/xx/yy`, `/lern-app/de/gibt-es-nicht`, `/lern-app/tr/_` | 404 | Lern-App-Layout (3.2) |
| `/lern-app/(de|tr|ar)/manifest.webmanifest` | 200 | `application/manifest+json; charset=utf-8`, `Cache-Control: s-maxage=31536000` |
| `/lern-app/xx/manifest.webmanifest` | 404 | – |
| `/lern-app/sw.js` | 200 | `application/javascript`, `Cache-Control: public, max-age=0` |
| `/lern-app-x`, `/lern-appx/de` | 404 | Website (`lang="de"`) – kein Präfix-Übergriff |
| `/lern-app/xx.json` (Punkt im Pfad, am Proxy vorbei) | 404 | `[locale]`-Baum, `lang="lern-app"` – wie die Website bei `/gibt.es/x` (`lang="gibt.es"`), vorbestehend |

Vor dem Spike (Basisbau) antworteten `/lern-app/de`, `/tr/lern-app`, `/lern-app/sw.js` und die Manifeste mit 404.

### 3.4 Bau und Website unverändert

| Messung | Basis (`e9aab6e`) | Endstand | Befund |
|---|---|---|---|
| `vercel-bau.mjs` wie frischer Import (ohne `DATABASE_URL`, PGlite) | grün, 194 s (Kompilieren 41 s, 1887 Seiten in 76 s) | grün, 188 s (35 s, **1897** Seiten in 78 s) | +10: 3 Seiten, 3 Manifeste, 3 × `_`, 1 Fallback-Hülle |
| Routenliste aus dem Bauprotokoll | 872 Zeilen | nur Zugänge `/lern-app/[ui]` (○ statisch ×3), `/[...rest]`, `/manifest.webmanifest` (● ×3) | keine Website-Zeile geändert |
| `prerender-manifest.json` `routes` | 1533 | +9 (`/lern-app/{de,tr,ar}`, `…/_`, `…/manifest.webmanifest`) | keine entfernt oder geändert |
| HTML-Dateien in `.next/server/app` | 1693 | +7 | keine entfernt |
| Sweep 61 Website-Adressen (Port 3241) | Statuscodes | identisch (`diff` leer) | bei allen 4 Bauständen |
| Schrift/Zeilenhöhe aller `[lang=ar]`/`[dir=rtl]` auf `/quran/1`, `/elifbe/buchstaben/be`, `/hadith/bukhari/1`, `/`, `/elifbe` (68 Elemente) | z. B. Koran `schriftQuran` 2,30; Hadith `schriftArabisch` 2,00 | identisch (`diff` leer) | Eingrenzung ändert die Website nicht |
| Manifest-Verweis | Website: 1× `/manifest.webmanifest` | Lern-App: genau 1× `/lern-app/<ui>/manifest.webmanifest`; Website weiter 1× | `app/manifest.ts` nicht doppelt (Metadaten-Feld `manifest` der tieferen Ebene ersetzt den Dateiwert, `metadata-resolution-primitives.js`) |

Seiten sind statisch: `renderingMode PARTIALLY_STATIC`, `compute: static`, Bauprotokoll „○“; die Manifest-Route „●“.

### 3.5 Oberfläche, RTL und Texte (Playwright, 390 × 844)

| UI | Status | `lang`/`dir` | Manifest-Link | Titel | Überlauf bei 390 px |
|---|---|---|---|---|---|
| de | 200 | de / ltr | `/lern-app/de/manifest.webmanifest` | `[IGMG Lernen]` | nein |
| tr | 200 | tr / ltr | `/lern-app/tr/manifest.webmanifest` | `[IGMG Öğren]` | nein |
| ar | 200 | ar / rtl | `/lern-app/ar/manifest.webmanifest` | `[ar: IGMG lit-taʿallum]` | nein |

Pluralformen über `createTranslator` (Server, statisch): ar → `zero, one, two, few, many, other` für 0, 1, 2, 3, 11, 100 –
identisch mit `Intl.PluralRules('ar')`. **Ziffern:** `createTranslator`/`Intl.NumberFormat` mit `ar` liefern in Node 24.21
(ICU 78.3, CLDR 48.0) **westliche** Ziffern (U+0031 U+0030 U+0030); östlich-arabische (U+0661 U+0660 U+0660) nur mit
`ar-u-nu-arab` (oder Region wie `ar-EG`).

**Arabisch-Regel (ADR 0044 Nr. 4), gemessen auf `/lern-app/de` (berechnete Schrift / Zeilenhöhe ÷ Schriftgröße):**

| Selektor | `html` | `body` | Sprachwahl-Link `a[lang=ar]` in der Oberfläche |
|---|---|---|---|
| A: ADR-Form `[lang='ar']:not(:where([data-oberflaeche]))`, `[dir='rtl']:…` (umgesetzt) | schriftTitelErweitert / 1,50 | schriftText / 1,60 | **schriftArabisch (Amiri) / 2,00** |
| B: ohne Eingrenzung (Attribut entfernt) | wie A | wie A | schriftArabisch / 2,00 |
| C: Teilbaum `:is([lang='ar'],[dir='rtl']):not(:where([data-oberflaeche], [data-oberflaeche] *))` | wie A | wie A | **schriftText / 1,60** |

Lesart: `body` setzt Schrift und Zeilenhöhe selbst; die globale Regel trifft im Lern-App-Layout nur das `<html>`-Element
(ohne sichtbare Wirkung) und **jedes innere Element mit `lang="ar"` oder `dir="rtl"`** – etwa Sprachwahl, arabische Kursnamen
in der de/tr-Oberfläche oder Bedienblöcke mit `dir`. Die ADR-Form grenzt diese nicht aus; erst C tut es. In der ar-Oberfläche
(Bildschirmfoto `$SP/l0/s6/aus/lern-app-ar-390.png`) steht die Sprachwahl deshalb noch in Amiri.

`:where()` hält die Spezifität der Regel bei (0,1,0) wie vorher; Lightning CSS lässt den Selektor unverändert (CSSOM:
`[lang="ar"]:not(:where([data-oberflaeche]))`).

### 3.6 Service Worker und IndexedDB (Playwright, Chromium 141, `serviceWorkers: 'allow'`)

| Probe | Ergebnis |
|---|---|
| Website `/` | eine Registrierung: Scope `/`, `/sw.js`, activated; Controller `/sw.js` |
| danach `/lern-app/de` | **zwei Registrierungen:** `/` → `/sw.js` und `/lern-app/` → `/lern-app/sw.js` (beide activated); Controller der Lern-App-Seite `/lern-app/sw.js`; Controller von `/quran/1` weiter `/sw.js` |
| `getRegistration(pfad)` | `/lern-app/de`, `/lern-app/ar/x` → `/lern-app/`; `/lern-app` (ohne Schrägstrich), `/quran/1`, `/`, `/lern-appx` → `/` |
| Vorräte nach dem ersten Besuch | `igmg-lernapp-schale-v1`, `igmg-v1-dateien`, `igmg-v1-seiten` |
| `idb` 8.0.3 (UMD-Bau eingespielt): DB `igmg-lernapp` v1, Speicher `ereignisse` (keyPath `[profil, geraet, seq]`, Index `[profil, am]`) und `einstellungen` (`[profil, schluessel]`) | 4 `put` (davon 1 mit gleichem Schlüssel) → **3 gelesen** (idempotent), XP-Summe 60, Index-Reihenfolge 1, 2, 3, Einstellung gelesen; nach Neuladen: 2 Speicher, 3 Einträge, Version 1 |
| **Root-SW-Update** (neuer Root-SW = Endstand mit Ausnahme, Marke angehängt, `registration.update()`) | vorher `igmg-fremd-probe, igmg-koran-v1, igmg-lernapp-audio, igmg-lernapp-pakete, igmg-lernapp-schale-v1, igmg-v1-*` → nachher **alle `igmg-lernapp-*` erhalten**, nur `igmg-fremd-probe` gelöscht (Aktivieren ist gelaufen) |
| **Gegenprobe** Root-SW ohne Ausnahme (`git show HEAD:web/public/sw.js`) | nachher nur noch `igmg-koran-v1, igmg-v1-dateien, igmg-v1-seiten` – **alle `igmg-lernapp-*` gelöscht** → die Ausnahme ist zwingend (PLAN Befund 4) |
| Update des Lern-App-SW (Hülle v1 → v2) | `igmg-lernapp-schale-v1` gelöscht, `-v2` angelegt; `igmg-lernapp-pakete`/`-audio`, `igmg-v1-*`, `igmg-koran-v1` und (Lauf vom Bau 2) ein fremder Vorrat bleiben |
| Offline, **Server beendet** | `/lern-app/de` und `/lern-app/ar` (zuvor besucht) 200 aus dem Vorrat, CSS geladen, richtige `lang`; `/lern-app/tr` (nie besucht) `net::ERR_FAILED` (erwartet) |
| Offline per `context.setOffline(true)` | **nicht aussagekräftig:** wirkt in Chromium nur auf die Seite, nicht auf Anfragen des SW (`/lern-app/tr` kam „offline“ mit 200) |

`next start` lieferte die geänderte `public/sw.js` sofort aus (Marke im Abruf gefunden); die SW-Dateien wurden nach jeder
Probe byte-gleich wiederhergestellt (`cmp`).

### 3.7 Größen

| Teil | Größe |
|---|---|
| `idb` 8.0.3 `build/umd.js` (minifiziert) | 3 713 B, **1 462 B gz** · ESM `build/index.js` (unminifiziert) 11 656 B, 3 362 B gz |
| Noto Sans Arabic 5.3.0, Teilmenge `arabic` | **400: 48 840 B, 700: 50 228 B** (WOFF2, zusammen 99 068 B ≈ 96,7 KiB); Teilmenge `latin` 10 748 / 10 620 B (nicht nötig, Atkinson deckt Latein) |
| JS der Platzhalterseite `/lern-app/de` (Skripte aus dem HTML, gzip -9) | 10 Dateien 174,1 KB, davon `noModule`-Polyfill 38,5 KB (lädt kein moderner Browser) → **≈ 135,6 KB** |
| davon Next/React-Grundstock | 71,6 + 35,1 + 8,5 + 8,2 + 4,3 KB ≈ 127,7 KB; übrige 4 Dateien 8,1 KB (Seiten- und Layout-Chunks, darin die SW-Anmeldung; nicht weiter aufgeschlüsselt) |
| zum Vergleich Website `/` | 13 Dateien 199,3 KB (≈ 160,8 KB ohne Polyfill) |
| HTML `/lern-app/de` | 13,4 KB (3,5 KB gz) |

Veröffentlichung: `idb` 8.0.3 am 07.05.2025, 8.0.4 am 06.10.2026 (Mindestreife ab 20.10.2026, L0-E10);
`@fontsource/noto-sans-arabic` 5.3.0 am 19.07.2026; Lizenz `idb` ISC, Noto OFL-1.1 (Paketangabe, wie Lizenzbericht).

### 3.8 Prüfstufe A im Arbeitsbaum

| Prüfung | Ergebnis |
|---|---|
| `next typegen && tsc --noEmit` | 0 Fehler (49 s). `next/root-params`: `locale()` und `ui()` sind jetzt beide `Promise<string \| undefined>` (zwei Wurzel-Layouts); bestehender Code bleibt typrichtig |
| ESLint (geänderte Dateien) | 0 Befunde |
| Prettier | `public/lern-app/sw.js` formatiert, übrige sauber |
| `vitest --project unit` | 114 Dateien, 1584 bestanden, 3 erwartete Fehlschläge, 19 s |
| `religion-pruefung.mjs` (nach Commit) | grün, 5526 Dateien |
| `sprachen-pruefen.mjs` | grün (prüft `messages/lernapp/` noch nicht, L1-02) |
| `freie-werte.mjs` | 3 Hex-Funde in Lern-App-Dateien (`themeColor`, `background_color`, `theme_color`) – dasselbe Muster wie `app/[locale]/layout.tsx` und `app/manifest.ts` (Metadaten verlangen Farbtext); Protokolldateien des Werkzeugs wieder entfernt |

## 4. Entscheidungsvorschläge für offene Punkte der ADRs

| ADR | Punkt | Vorschlag (Standard bis zur Entscheidung) |
|---|---|---|
| 0037 Nr. 2 | „`dynamicParams = false`“ | **Ersetzen:** `unstable_paramMatching = { ui: 'not-found' }` + Prüfung im Layout + Proxy (unbekannte Oberflächensprache intern auf `/lern-app/de/…`) + Fangroute `[ui]/[...rest]` mit Suspense und `ensureStatic = 'navigation'`. E2E-Test „`/lern-app/xx` und `/lern-app/de/xyz` → 404 mit `html[lang][dir]` der Lern-App“, damit ein Next-Update der unstable-API auffällt. |
| 0037 Nr. 2 | „Spike S1 belegt …“ | **Bestätigt:** Vorrang vor `[locale]` für die genauen Adressen; Bau unter Cache Components grün; `app/manifest.ts` nicht zusätzlich verlinkt. **Ergänzen:** Ohne Fangroute trifft `[locale]/[...rest]` unbekannte Lern-App-Adressen (Sprache „lern-app“); die Fangroute gehört fest zum Layout (in PLAN §3.11 aufnehmen). |
| 0037 Nr. 1/3 | Proxy-Tabelle | Um `/de/lern-app…` (308, sonst zwei Sprünge über next-intl) und `/lern-app/en…` → `/lern-app/de…` ergänzen; eine Oberflächensprache im Rest bleibt (`/tr/lern-app/ar` → `/lern-app/ar`). |
| 0037 Nr. 8 | Manifest-`id` | **Eine** `id` `/lern-app/` für alle drei Sprachen (eine installierte App; `start_url` je Sprache = Sprache bei der Installation). Statische Route, `s-maxage=31536000`. |
| 0037 OFFENE FRAGE | Name der App | Bleibt beim Vorstand; Platzhalter `[IGMG Lernen]` / `[IGMG Öğren]` / ar in Umschrift. Kein Agent setzt den arabischen Namen. |
| 0037 Nr. 8 | Root-SW | **Bestätigt zwingend** (Gegenprobe löscht alle `igmg-lernapp-*`). Optional in L1-02: Root-SW lässt `/lern-app/` ganz durch, damit beim allerersten Besuch nicht die Offline-Seite der Website greift. |
| 0044 Nr. 4 | Eingrenzung | **Teilbaum statt Element:** `:is([lang='ar'], [dir='rtl']):not(:where([data-oberflaeche], [data-oberflaeche] *))`. Gemessen: Die ADR-Form wirkt nur auf `<html>` (ohne sichtbare Folge, `body` setzt eigene Werte); innere Oberflächen-Elemente mit `lang="ar"` blieben Amiri mit Zeilenhöhe 2 – im Widerspruch zu Nr. 2 („Bedienwörter in derselben Schrift“). Kursinhalt bekommt Amiri dann ausdrücklich über `--font-arabic`/`text-arabisch-1/2/3` (KERN §7). `:where` hält die Spezifität (Website unverändert, gemessen). |
| 0044 Nr. 2 | `[Vorladen in Spike S1 prüfen]` | Nicht eingebaut (Paket `@fontsource/noto-sans-arabic` ist eine Änderung an `package.json`, L1-02). Befund: `next/font` setzt die Vorlade-Kopfzeilen je Route aus den importierten Schriften, nicht je Sprache (im Bau tragen alle drei Oberflächen dieselben `Link: …; rel=preload` für Atkinson 400/700 und die Titelschrift) – ein gemeinsames Layout für de/tr/ar würde Noto in allen drei Oberflächen vorladen (≈ 49–50 KB je Schnitt). **Vorschlag:** `preload: false` für beide Schnitte, in L1-03 Lighthouse auf `/lern-app/ar` messen (CLS ≤ 0,1, LCP); nur bei Verfehlen 400er vorladen (+48,8 KB auch für de/tr) oder eigene `@font-face` mit `ReactDOM.preload` nur bei `ui === 'ar'`. |
| 0044 Folgen | `[Größe eintragen]` | 400: 48 840 B, 700: 50 228 B (Teilmenge `arabic`, WOFF2). |
| 0044 Nr. 6 / O-5 | Ziffern | `ar` allein ergibt westliche Ziffern; der Formatierer (`format.ts`) muss `ar-u-nu-arab` ausdrücklich setzen und für den Schalter auf `ar-u-nu-latn` wechseln. |
| 0037 Nr. 5 | Texte | Bestätigt: `createTranslator` mit ausdrücklicher Sprache rendert statisch; `next-intl/server` (`getTranslations`) darf in der Lern-App **nie** genutzt werden: `request.ts` liest `locale()`, das unter `/lern-app` `undefined` ist, und ruft dann `notFound()` (aus dem Code abgeleitet, nicht ausgeführt). Regeltest in `bundle-regeln` bzw. eigener Regeltest. |
| 0038 Nr. 1 | `idb` | Bestätigt (zusammengesetzte Schlüssel und Indizes, idempotentes `put`, bleibt über Neuladen). Exakt 8.0.3 bis 19.10.2026, ab 20.10.2026 8.0.4 (L0-E10), in L1-02. IndexedDB gilt je Ursprung, nicht je SW-Scope: Name `igmg-lernapp` trennt sauber von der Website. |
| KERN §9 / PLAN §3.6 | Budgets | **Klären:** Der Next/React-Grundstock allein sind ≈ 136 KB gz (modern, ohne Polyfill) – über „Hülle ≤ 120 KB“ und nahe „Start ≤ 150 KB je Route“, bevor Lern-App-Code dazukommt. Vorschlag: Budgets als Lern-App-eigenen Anteil über dem Grundstock festschreiben (Hülle ≤ 20 KB, Start/Lernpfad ≤ 30 KB, Spieler + 60 KB, je Übungstyp ≤ 15 KB) und die Gesamtgrenze je Route wie die Website bei 180 KB (`messen.mjs`, `jsKb`) lassen; Spieler-Route gesamt dann ≈ 200 KB (Ausnahme mit Grund) oder Spieler ≤ 44 KB. |

## 5. Risiken

1. `unstable_paramMatching` ist eine unstabile API von Next 16.4; ein Update kann sie ändern. Gegenmittel: Layout-Prüfung,
   Proxy-Umschreibung und E2E-Test (Abschnitt 4).
2. `ensureStatic = 'navigation'` auf der Fangroute: Jede neue unbekannte Adresse wird beim ersten Aufruf vollständig
   gerendert und gespeichert (wie `[locale]/[...rest]` der Website) – Speicherwachstum durch Zufallsadressen; für S-L1 vormerken.
3. Pfade mit Punkt (`/lern-app/x.y`) gehen am Proxy vorbei und landen im `[locale]`-Baum (`lang="lern-app"`, 404) – gleiches
   Verhalten wie die Website bei `/gibt.es/x`; gering.
4. Arabische Bedienwörter mit `lang="ar"` erscheinen mit der ADR-Form in Amiri und Zeilenhöhe 2 (Abschnitt 3.5) – bis zur
   Entscheidung über die Teilbaum-Form.
5. Beim allerersten Besuch einer Lern-App-Seite steuert noch der Root-SW (falls von der Website installiert); ohne Netz zeigt er
   dann die Offline-Seite der Website, bis `/lern-app/sw.js` aktiv ist.
6. E2E-Offline-Tests: `context.setOffline` erfasst keine Anfragen des SW – Server beenden oder Anfragen auf Kontextebene
   abbrechen, sonst falsch grün.
7. Der Spike setzt `robots: noindex` und nutzt die öffentliche CSP (ohne `'wasm-unsafe-eval'`, `worker-src blob:`); beides
   regelt L1 (Schalter `lernapp`, Header-Regel L1-02).
8. 404-Inhalt erscheint (wie auf der Website) erst nach dem Laden der Skripte; geprüft ist die Hülle mit `lang`/`dir` und die
   Überschrift nach dem Laden, nicht die Darstellung ohne JavaScript.
9. Hex-Farben in Metadaten und Manifest (freie-werte: 3) – in L1 aus einer gemeinsamen Konstante der Website beziehen.

## 6. Aufräumen

- Im Arbeitsbaum gelöscht: `web/.next` (≈ 2,6 GB je Bau), `web/.pglite-bau` (176 MB), `web/.suchindex.json`; Protokolle von
  `freie-werte.mjs` entfernt. `git status` sauber; Zweig steht auf `b7cc3ad` (nicht gepusht, nicht auf `main`).
- Server per PID beendet (Prozessgruppen 17936, 20602, 21749, 24406, 25550; Port 3241 frei); keine fremden Prozesse berührt.
- Scratchpad: `l0/tmp-s1` und der Noto-Download gelöscht. Behalten (≈ 6 MB): Bauprotokolle, Routen-/Seitenlisten und
  Sweeps (`l0/s1/`), Probeskripte und Ergebnisse (`l0/s6/skripte/`, `l0/s6/aus/probe-ergebnis.json`, Bildschirmfoto),
  `idb`-Tarball samt Auszug (≈ 280 KB) für die Wiederholung. Platte danach 8,8 GB frei.
