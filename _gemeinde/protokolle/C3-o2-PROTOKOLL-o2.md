# Stufe C, zweite Nachprüfung · Prüfer o2 · Z-03, Z-05, Z-06, Z-09, Z-19, Z-21 · Stand main = 90a8e37

Prüfzeit 16.10.2026, 09:15–10:40 UTC. Ordner `O=/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c3/o2`.
Alle Pfade unten relativ zu `O`, Skripte unter `O/skripte/`.

## 0. Umgebung und Abweichung

- Arbeitsbaum `/home/user/IGMG`, HEAD = 90a8e37 (`git rev-parse HEAD`), `git status --short` vorher und nachher leer (`O/git-vorher.txt`, Schlusskontrolle 0 Zeilen).
- Node v24.21.0 (`scratchpad/node24`), Chromium 141 (`/opt/pw-browsers/chromium-1194`), Playwright aus `_gemeinde/werkzeuge/node_modules`.
- **Server 3100 lief nicht.** `curl http://localhost:3100/` ergab von ca. 09:15 bis 09:54 UTC durchgehend `000` (zwei Wartezeiten von je 300 s). Kein Prozess `next-server`. Den fehlenden Server habe ich NICHT auf 3100 gestartet (Port gehört dem Orchestrator).
- **Ersatz: eigener Produktionsbau wie frischer Vercel-Import**, außerhalb des Repos:
  - `git archive 90a8e37 web` nach `O/baum`, `node_modules` kopiert (Next-Patch `IGMG-Patch (P4, next@16.4.0)` vorhanden), **keine `.env`, kein `DATABASE_URL`**, Aufruf `pnpm vercel-build` (= `scripts/vercel-bau.mjs`, also derselbe Weg wie auf Vercel ohne Variablen). Skripte `O/skripte/bau.sh` (1. Anlauf: tsx-Socket-Pfad unter langem TMPDIR zu lang, `listen EINVAL`, `O/bau.log`) und `O/skripte/bau2.sh` (kurzer TMPDIR, `O/bau2.log`).
  - Bauprotokoll: `[bau] WARNUNG: DATABASE_URL fehlt – Bau mit Beispielinhalten …`, `[suchindex] 248 Titel, 7580 Hadith-Nummern, 108.8 KB`, `Generating static pages … (1887/1887)`, BUILD_ID `da22H2mbgcXaCfgXPjOqv`, rc=0 (09:56–09:59 UTC).
  - Start: `NODE_ENV=production APP_URL=http://localhost:3152 next start -p 3152` (ohne `APP_URL` bricht der Start lokal mit „APP_URL fehlt“ ab; auf Vercel ersetzt `VERCEL_PROJECT_PRODUCTION_URL` diese Angabe). Alle übrigen Pflichtwerte fehlen wie beim frischen Import (Startprotokoll `O/server-3152.log`). `/api/health` → 503 `{"status":"fehler"}` wie live ohne Datenbank.
  - Nach den Messungen: Server beendet (3152 → `000`), `O/baum` (4,2 GB) und die TMPDIR-Ordner gelöscht.
- `web/.env`, `web/.next` (BUILD_ID `hQZX3v2_…`, 08:53) und `web/test-results` im Haupt-Arbeitsbaum stammen vom E2E-Lauf des Prüfers k1 (mit Datenbank) und wurden nicht angefasst.
- Keine arabische Schrift in diesem Protokoll; keine Geheimnisse ausgegeben.

## Z-03 Designsystem: erfüllt

Befehl (Werkzeuglogik unverändert, nur ohne Protokollschreiben ins Repo; Liste aus git):

```
git diff --name-only 033ea6f..90a8e37 -- web/src        → 86 Dateien (diff-filter ACMR ebenfalls 86, 0 gelöscht)
node freie-werte.mjs $(git diff --name-only --diff-filter=ACMR 033ea6f..90a8e37 -- web/src)
→ Geprüft: 86 Dateien · Funde: 1 (Tailwind-Klammerwert 1)
  web/src/lib/validierung/wissen.ts:33: [Tailwind-Klammerwert] -[a-z0-9]
```

- Der einzige Fund ist der reguläre Ausdruck `const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;` (`wissen.ts:33`) → Fehlalarm-Klasse „regulärer Ausdruck in .ts“ (REFERENZ §1). **Frei: 0.**
- Von Hand nachgesehen (Inline-Stile in den 86 Dateien, `grep -n "style="`):
  - `lib/mail/vorlagen/zusammenfassung.tsx:30-44` (neue Mailvorlage F-38) liest Maße und Farben nur aus `MAILMASS`/`MAILFARBE` (`import … from './farben'`, Z. 2) → belegte Ausnahme `mail/vorlagen/farben.ts`.
  - `ChatFenster.tsx:318` setzt `--dauer: var(--dauer-wechsel)` (Token); `QiblaKompassAnsicht.tsx:57/94` drehen um berechnete Winkel (Zeilen unverändert seit 033ea6f).
- Gegenprobe Musterliste: 0 `w-[`, `h-[`, `p-[`, `text-[`, `bg-[` … in den 86 Dateien (`grep -nE "\b(w|h|p|m|text|bg|gap|top|left|min-w|max-w|min-h|max-h)-\["` leer).

## Z-05 Bewegung: erfüllt (Hinweis Register)

**Neue Oberfläche im Code**
- Reihenfolge-Editor (`components/verwaltung/reihenfolge/ReihenfolgeEditor.tsx`): Verschieben tauscht die Einträge ohne Animation (Z. 84-94), Knöpfe aus `ui/button.tsx` mit `transition-colors` (nur Farbe), klebende Speicherleiste ohne Bewegung (Z. 215-224). Kein `animate-`, kein `tritt-auf`, keine Lage- oder Größenänderung.
- Hinweis „Neues“ (`components/mein-bereich/NeuesHinweis.tsx:158`): Karte mit `tritt-auf`; Kommentar Z. 27 „Auftritt wie B-22 (`tritt-auf`, reduziert nur Überblendung)“; Schließen-Knopf Z. 182 nur Farbe auf Hover.
- `globals.css:702-704` `.tritt-auf { animation: auftritt … }`; `globals.css:789` im Block `@media (prefers-reduced-motion: reduce)` → `animation-name: einblenden`, dazu Dauer 0,01 ms für alles.
- In den 86 geänderten Dateien: `active:scale-` 0; Größe/Lage auf `hover|focus|active|group-hover` ohne `motion-safe:` 0 (`grep -nE "(hover|focus|focus-visible|active|group-hover|peer-hover):(-?translate|scale|rotate|w-|h-|size-|top-|left-|inset)"` leer).

**Laufzeit (eigener Bau, 3152)**
- `O/skripte/z05-tritt-auf.mjs` (Element mit genau den Klassen der Karte aus `NeuesHinweis.tsx:158` in `/` eingesetzt, `getAnimations()`), Ausgabe `O/z05-tritt-auf.out`:
  - no-preference: Animation `auftritt`, 320 ms, Keyframes opacity 0 → 1 und `translate: 0px 8px` → none.
  - reduce: Animation `einblenden`, **0,01 ms, nur opacity** – keine Lage.
  - Grund für das Ersatzverfahren: Die Insel erscheint nur angemeldet mit Datenbank; der Bau wie frischer Import hat keine.
- Druck-Rückmeldung (`O/skripte/z05-druck.mjs`, Ausgabe `O/z05-druck.out`, Rohdaten `O/z05-druck.json`), Routen `/`, `/bildung/korankurse`, `/suche?q=Gebet`, `/suche?q=Bukhari+1`, `/hadith/bukhari/56`, `/bildung/voranmeldung?kurs=korankurs-fuer-kinder`, `/islamisches-wissen`, je 1440 und 390:
  - reduce: 78 `.druck`-Elemente (u. a. neue Kurskarten-Aktion „Für diesen Kurs voranmelden“, „Suchen“, „Weiter“), 77 nachweislich `:active`, **scale gedrückt `none`, Größe ändert 0, Lage ändert 0**, Fehler 0, Navigation 0.
  - no-preference (Gegenprobe): scale 0.98 an allen aktiven Elementen.
- Hover-Sweep (`O/skripte/z05-hover.mjs`, `O/z05-hover.out`): 86 Links/Knöpfe in `main` auf denselben 7 Routen, 1440: reduce 0 Änderungen; no-preference 0 Änderungen (auf diesen Routen gibt es keine `group-hover:translate`-Pfeile).
- Bildrate und reduzierte Bewegung (`_gemeinde/werkzeuge/bewegung.mjs --dauer 2000`, `O/z05-bewegung.out`, `O/z05-bewegung_*.md`, Bilder `O/bilder/bewegung-*`), Last 0,38:
  - `/`, `/suche?q=Gebet`, `/islamisches-wissen`, `/bildung/korankurse`: reduziert 0 laufende Animationen, 0 Lage/Größe-Keyframes, größte Lageänderung 0 px, 0 Elemente mit opacity 0; Bildrate CPU 4× 0 % verworfen (121–122 Bilder, Median 16,7 ms), ohne Drosselung 0–0,8 %. Schwelle ≤ 5 %.

**Register (Hinweis, niedrig):** `_gemeinde/KERN.md` ist seit 033ea6f unverändert (`git log 033ea6f..90a8e37 -- _gemeinde/KERN.md` leer). B-22 (`KERN.md:65`) nennt als Umsetzung nur `chat/ChatFenster.tsx`; der neue Auftritt des Hinweises „Neues“ (`NeuesHinweis.tsx:158`) steht nicht im Register, obwohl der Code darauf verweist. Inhaltlich ist es dasselbe Muster (`tritt-auf`, reduziert nur Überblendung); eine Zeile in B-22 genügt.

## Z-06 Grafik: erfüllt

- `svg-pruefung.mjs` (Logik unverändert, ohne Protokoll ins Repo): `SVG-Prüfung: 0 .svg-Dateien, 41 inline <svg> in web/src · Fehler 0 · Befund 15 · OK 26` – dieselben 41/15/26 wie bei 033ea6f (C2-o2); keine der 15 Fundstellen liegt in Zeilen, die Nacharbeit 2 geändert hat.
- Keine neue `.svg`-Datei (`git diff --name-only 033ea6f..90a8e37 | grep -i '\.svg$'` leer), kein neues inline `<svg>` in den 86 Dateien, `web/package.json` unverändert (nur `lucide-react` 1.55.0, Z. 60).
- Neue Symbole nur aus `lucide-react` (hinzugefügte Importe: BellOff, BellRing, LifeBuoy, Mail, MonitorSmartphone, Newspaper, Smartphone, ExternalLink, RotateCcw, ArrowLeft/Right/Up/Down, History, Trash2, Eye, Pencil, Plus, ChevronDown, CircleAlert, Flag, Phone, CirclePause, Clock, Lock, X, Save, Send, Library, PanelsTopLeft) und `Stern8` aus `website/Icons.tsx` (setzt selbst `aria-hidden="true"`, Z. 21). Alle neuen Lucide-Symbole tragen `aria-hidden` bzw. kommen über `Abschnitt.tsx:31` (`<Icon aria-hidden …>`).
- IDs: Reihenfolge-Editor bildet IDs aus `useId()` + Schlüssel (`ReihenfolgeEditor.tsx:46/52`), die Startseiten-Ordnung lässt jeden Abschnitt höchstens einmal zu (`lib/startseite/abschnitte.ts:29-33`), die zwei `id="push"` in `benachrichtigungen/page.tsx:121/146` liegen in sich ausschließenden Zweigen.
- Laufzeit (`O/z09-ueberlauf-*.json`, Feld `svg`/`doppelteIds`): 14 Routen × 3 Breiten × 2 Modi = 84 Messungen, **SVG ungeklärt 0, doppelte IDs 0**.

## Z-09 Darstellung: erfüllt (UMGEBUNGSAUSNAHME echte Geräte/iOS)

Skript `O/skripte/z09-ueberlauf.mjs` (laden, in 600-px-Schritten bis ans Ende scrollen, zurück; `documentElement`/`body` scrollWidth vs. clientWidth; Elemente über dem Rand ohne Vorfahren mit `overflow-x ≠ visible`), 390×844, 768×1024, 1440×900, `no-preference` und `reduce`.

Routen (de + tr): `/`, `/suche?q=Gebet`, `/suche?q=Bukhari+1`, `/bildung/korankurse`, `/bildung/voranmeldung?kurs=korankurs-fuer-kinder` (Slug aus dem Link der Kurskarte), `/hadith/bukhari/56`, `/islamisches-wissen`, `/tr`, `/tr/arama?q=Namaz`, `/tr/arama?q=Buhari+1`, `/tr/egitim/kuran-kurslari`, `/tr/egitim/on-kayit?kurs=korankurs-fuer-kinder`, `/tr/hadis/buhari/56`, `/tr/islami-bilgiler`.

- `O/z09-ueberlauf-no-preference.out`: `42 Messungen, Überlauf 0, max(scrollWidth − clientWidth) = 0, HTTP≠200 0`, jede Seite genau eine h1, keine Fehlerseite.
- `O/z09-ueberlauf-reduce.out`: dasselbe, 42/0/0.
- Einziges Element außerhalb des Rands: auf der Voranmeldung das Honigtopf-Feld `div.absolute.-left-full.h-px.w-px` (links außerhalb, 1 px, `aria-hidden`, wie bei C2), kein Scrollbereich.
- Abschneiden/Kürzung (`_gemeinde/werkzeuge/bildsatz.mjs --routen O/routen-o2.json --max-schirme 8`, `O/z09-bildsatz.md/.json/.out`, Bilder `O/bilder/bildsatz/…`): 10 Routen × 3 Größen, **horizontal nein, abgeschnitten 0** überall. Auf `/` bei 1440 drei „Kürzungen (beabsichtigt?)“: die Anrisstexte der Neuigkeiten-Karten mit Auslassungszeichen (`O/bilder/bildsatz/start/1440x900/schirm-05.jpg` angesehen, gewollt).
- Bilder angesehen:
  - `O/bilder/z09/suche_q_Bukhari_1-390.jpg`, `O/bilder/ausschnitt-suche-bukhari-390.jpg`: „1 Treffer für „Bukhari 1““, Gruppe „Hadith (Sahih al-Bukhari)“, Karte „Sahih al-Bukhari 1 · Buch 1, Hadith 1“; ehrlicher Hinweis zur Suche ohne Datenbank.
  - `O/bilder/ausschnitt-suche-gebet-390.jpg`: „4 Treffer für „Gebet““ (Seiten 1, Neuigkeiten 1, Veranstaltungen 2) – die frühere Lücke „Keine Treffer“ ist im Bau wie frischer Import behoben.
  - `O/bilder/z09/bildung_voranmeldung_kurs_korankurs-fuer-kinder-390.jpg`: Band „Voranmeldung für den Kurs: Korankurs für Kinder“ (F-44) bricht sauber um.
  - `O/bilder/kurskarte-de-390.jpg`: Aktion „Für diesen Kurs voranmelden“ bricht bei 390 auf zwei Zeilen um (308 × 57,6 px), ohne Überlauf; tr „Bu kurs için ön kayıt yap“ einzeilig (308 × 48 px).
  - `O/bilder/z09/hadith_bukhari_56-390.jpg`, `O/bilder/bildsatz/hadith_bukhari_56/390x844/schirm-03.jpg`: Kopf, Sprungleiste, arabischer Text mit vollständigen Harakat, nichts abgeschnitten.
  - `O/bilder/z09/islamisches-wissen-1440.jpg`: Kopf, Suche, Themenraster.
- Nicht geprüft (UMGEBUNGSAUSNAHME): echte Geräte und iOS/Safari (MN-19).

## Z-19 Standort/Datenfluss: erfüllt (Zustellung AUSNAHME)

Skript `O/skripte/z19-fremd.mjs` (Init-Skript zählt `getCurrentPosition`/`watchPosition`, `PushManager.subscribe`, `Notification.requestPermission`; jede Anfrage nach Host; Kopfzeilen des Dokuments), 12 Routen × 390/1440 ohne Klick, mit Scrollen. Ausgabe `O/z19-fremd.out`:

```
SUMME Seitenaufrufe 24 Anfragen 1624 fremde Hosts 0 Geolocation-Aufrufe 0 Push/Notification-Aufrufe 0
```

- Routen: `/`, `/gebetszeiten`, `/suche?q=Gebet`, `/suche?q=Bukhari+1`, `/bildung/korankurse`, `/bildung/voranmeldung?kurs=korankurs-fuer-kinder`, `/hadith/bukhari/56`, `/islamisches-wissen`, `/quran/2`, `/tr/namaz-vakitleri`, `/tr/arama?q=Namaz`, `/en/prayer-times`; alle HTTP 200, `set-cookie` nein.
- `Permissions-Policy`: `geolocation=(self)` nur auf `/gebetszeiten`, `/tr/namaz-vakitleri`, `/en/prayer-times`; auf allen 9 anderen Routen `geolocation=()` (Quelle `lib/sicherheit/header.ts:69-72`).
- Gegenprobe (`O/skripte/z19-gegenprobe.mjs`, `O/z19-gegenprobe.out`): `/gebetszeiten`, Reiter „Mein Ort“, Klick „Meinen Standort verwenden“ mit gesetzter Testposition → `geoVorKlick 0, geoNachTab 0, geoNachKlick 1, anfragenMitKoordinaten 0, fremdeHosts []`. Der Zähler greift also, und die Koordinaten gehen in keine Anfrage.
- Code der Nacharbeit 2: Neue Netzaufrufe nur zur eigenen Herkunft (`NeuesHinweis.tsx:88` `/api/mein/neues`, `ChatFenster.tsx:129/189`) und das Echtzeit-Signal `lib/echtzeit/signal.ts:11` (WebSocket zum eigenen Centrifugo, nur angemeldet, ADR 0027). `Notification.requestPermission` nur im Klick-Handler (`MitteilungImBrowser.tsx:35`, ausgelöst von `:51`); `NeuesHinweis.tsx:60` zeigt eine Browser-Mitteilung nur bei ausdrücklich eingeschaltetem Merker und erteilter Erlaubnis. Geolocation weiterhin nur in `MeinOrtRechner.tsx:148`.
- Zusatzbeleg (fremder Lauf, nicht von mir): Tor-Lauf `e2e-echt/lauf-tor/liste.txt` mit `datenschutz.spec.ts:321` „Anfragen nur an die eigene Herkunft, keine Set-Cookie-Header“ grün u. a. für Suche, Hadith, Korankurse, Gebetszeiten, Islamisches Wissen, Schüler-Voranmeldung (telefon und desktop).
- UMGEBUNGSAUSNAHME: echte Push-Zustellung (kein VAPID).

## Z-21 Moschee 2026 (kurz): erfüllt

- Gerenderter Text (Skripte/Stile entfernt) von 11 Seiten des eigenen Baus nach `geplant|planned|planlan…|in Planung|im Bau|wird gebaut|under construction|inşa…|Bauphase|Baubeginn` (`O/z21-geplant.out`):
  - `/`, `/tr`, `/en`: je 1 Treffer „Informationen zu den geplanten Aktivitäten und Programmen für den kommenden Ramadan“ (Neuigkeit, nicht das Gebäude; wie bei C2).
  - `/tr/projeler`: 1 Treffer „Kaba İnşaat … Tamamlandı“ (Meilenstein Rohbau, Status abgeschlossen).
  - `/projekte`, `/ueber-uns`, `/tr/hakkimizda`, `/en/projects`, `/en/about-us`, `/islamisches-wissen`, `/suche?q=Moschee`: 0.
- Status: `/` „Unsere neue Moschee ist eröffnet“, „Fertiggestellt · 2026“, „Eröffnung: [Datum – von der Gemeinde]“; `/projekte` „Projekt Fertiggestellt“; `/tr/projeler` „Yeni Fatih Camii açıldı … 6 aşamadan 6 tanesi tamamlandı“; `/en/projects` „Project Completed … 6 of 6 milestones completed“. Fakten als Platzhalter in eckigen Klammern.
- Code: In den neuen Texten von Nacharbeit 2 (`git diff 033ea6f..90a8e37 -- web/messages`, Seeds, Migrationen) keine Aussage über ein geplantes Gebäude; die neue Verwaltungsbeschreibung des Abschnitts lautet „Unsere neue Moschee“ (`messages/verwaltung/startseite.json:17-19`). Die Startseite rendert weiter `UnsereMoschee` (unverändert), nur in verwaltbarer Reihenfolge.

## Hinweise (keine Kriterienlücke)

1. Server 3100 lief während der gesamten Prüfung nicht; gemessen wurde am gleichwertigen eigenen Bau (Port 3152, siehe §0).
2. KERN-Register B-22 um `mein-bereich/NeuesHinweis.tsx` ergänzen (Z-05, Dokumentation).
3. `/hadith/bukhari/56` trägt im deutschen Seitentitel den englischen Buchtitel der Quelle („Fighting for the Cause of Allah (Jihaad) · Buch 56 …“); die Seite kennzeichnet ihn als „Buchtitel der Quelle (Englisch)“. Nur zur Kenntnis, nicht Teil dieser Kriterien.
4. Auf `/tr` und `/en` erscheinen die Beispiel-Neuigkeiten auf Deutsch (Beispielinhalt ohne Datenbank).
