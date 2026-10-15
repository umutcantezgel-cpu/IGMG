# Stufe C – Nachprüfung · Schlüssel k1 · Z-07 (Konten/Tastatur)

Prüfzeit 15.10.2026, 16:24–16:45 UTC (18:24–18:45 Europe/Berlin). Im Repository wurde nichts geändert (`git status` leer), kein Server
gestartet oder beendet. Pfade relativ zu `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/k1/`
(`skripte/`, `ergebnisse/`, `bilder/`, `harness/`, `zustand/` mit 0700/0600).

## Stand und Umgebung

- `origin/main` = 033ea6f; Arbeitsbaum = 38440af (gegenüber 033ea6f nur `_gemeinde/PRUEFPUNKT.md`, `git diff --stat 033ea6f HEAD -- web` leer).
- Server 3100: `next-server (v16.4.0)` aus `/home/user/IGMG/web` (`/proc/12728/cwd`), `BUILD_ID` e3nweErdOdf1jsAtYsjE2 vom 15.10. 16:21:28 UTC
  (nach 033ea6f, 15:47:40 UTC); `/api/health` → 200 `{"status":"ok"}`.
- **Datenbank des Servers ohne die N4-Migrationen.** `PGLITE_VERZEICHNIS` = `scratchpad/pglite-sicht` (angelegt 14.10. 08:19 UTC,
  Sichtabnahme). Das Serverprotokoll `scratchpad/server-sicht3.log` (stdout/stderr des Prozesses) zeigt
  `column chat_meldung.gemeldete_person does not exist` (Zeilen 27, 115, 161, 291, 337, 383, 429, 517, 563) und
  `column "kinderschutz_pause" of relation "chat_kanal" does not exist` (Zeilen 70, 204, 246, 472, 606, 648). Beide Spalten legt
  `web/drizzle/migrations/0013_sicherheit_s2_s3.sql` an (c38977e, N4); im Journal folgt noch `0014_vier_augen_n4`. Mit PGlite läuft beim
  Start keine Migration (`web/src/lib/db/migration.ts` braucht `DATABASE_URL`).
- Folge (`skripte/probe.mjs` → `ergebnisse/probe-routen.json`): HTTP 200, aber Titel und h1 „Ein Fehler ist aufgetreten“ auf
  `/mein-bereich/gruppen/ff33563e-…/chat` (Kind und Lehrkraft), `/mein-bereich/unterricht`, `/mein-bereich/unterricht/ff33563e-…` und
  beiden Anwesenheits-Terminen (`ba6d3ada-…`, `99c42eb0-…`). Bild: `bilder/axe-kind-gruppenchat-1440.jpg`.
- **Kein Verwaltungszugang.** Das Prüfkonto `sicht.admin@beispiel.invalid` wird abgewiesen („E-Mail-Adresse oder Passwort ist nicht korrekt.“,
  `bilder/diag-admin-anmelden.png`). Ursache ist die N4-Regel S3: `verwaltungsKonto()` lehnt Adressen mit Endung `.invalid` ab
  (`web/src/server/actions/anmeldung.ts:108-112,128-130`, `web/src/lib/mail/adresse.ts:8-19`). Alle Prüfkonten aus `sicht2/konten.json`
  enden auf `.invalid`; Lehrkraft-Sitzung → `/verwaltung/anmelden?keine-rolle=1`, Kind/Eltern → `/verwaltung/zwei-faktor`
  (`skripte/probe-verw.mjs`).
- Sitzungen (`skripte/sitzungen.mjs`): Eltern gültig; Kind und Lehrkraft (TOTP) neu angemeldet; Verwaltung nicht möglich (s. o.).
  Keine Zugangsdaten ausgegeben.
- Werkzeuge: Node v22.22.0, Playwright 1.64.0 und @axe-core/playwright 4.13.0 (`werkzeuge-nm`), Chromium 141 `/opt/pw-browsers/chromium`,
  axe-Tags wcag2a/2aa/21a/21aa/22aa.

## (a) axe auf den 7 Konto-Routen

Eigener Lauf `skripte/axe-konten.mjs` → `ergebnisse/axe-konten.json` (mit Pfad-, h1- und Kennzeichenprüfung, Bilder `bilder/axe-*.jpg`);
offizielles Werkzeug `_gemeinde/werkzeuge/a11y.mjs --zustand … --warte 2500` → `ergebnisse/a11y-{kind,eltern,lehrkraft}-{390,1440}.{md,json}`.

| Route (Rolle) | geladen als | 390 krit./ernst/mittel/gering | 1440 | Bewertung |
|---|---|---|---|---|
| `/mein-bereich` (Kind) | h1 „Willkommen, Emre“ | 0/0/0/0 | 0/0/0/0 | erfüllt |
| `/mein-bereich/kinder/818c2890-…` (Eltern) | h1 „Emre B.“ | 0/0/0/0 | 0/0/0/0 | erfüllt |
| Anwesenheit `ba6d3ada-…` (Lehrkraft) | **Fehlerseite** (Kennzeichen `fieldset input[type=radio]` fehlt) | – | – | auf dem Server nicht prüfbar |
| Gruppenchat (Kind) | **Fehlerseite** (Kennzeichen `[role=log] ol > li` fehlt) | – | – | auf dem Server nicht prüfbar |
| `/verwaltung/seiten/neu`, `/verwaltung/anzeige`, `/verwaltung` | keine Verwaltungssitzung möglich | – | – | offen |

- Unklar (incomplete) nur `color-contrast` an den Lernweg-Ziffern („content too short“): 7,68:1 und 8,49:1 (`ergebnisse/axe-unklar.json`).
- **Achtung Werkzeug:** `a11y.mjs` meldet für die beiden abgebrochenen Routen HTTP 200 und 0/0/0/0, prüft dabei aber die Fehlerseite
  (`ergebnisse/a11y-kind-1440.md`, `a11y-lehrkraft-1440.md`). Diese Nullen sind kein Beleg.
- **Ersatz für Chat und Anwesenheit** (nur Komponente, ohne Seitenrahmen): axe im Prüfgestell (s. b) auf den echten Komponenten
  `skripte/gestell-axe.mjs` → `ergebnisse/gestell-axe.json`: Chat (Kind) offen, mit offenem Melde-Dialog, Chat geschlossen, Anwesenheit,
  je 390 und 1440: alles 0/0/0/0, keine unklaren Regeln. Bilder `bilder/gestell-axe-*.jpg`.
- Verwaltung: seit 75cad0a nur Klassenänderungen in den betroffenen Komponenten (Tokens statt freier Werte, Utility `druck`,
  `git diff 75cad0a 033ea6f -- web/src/components/verwaltung/{seiten,richtext,anzeige,shell,uebersicht}`), aber zur Laufzeit nicht belegt.

## (b) F-1 und F-2 – Fokus nach Senden und Speichern

**Auf dem Server nicht prüfbar** (Seiten brechen ab, s. o.). Die Kind-Prüfung fiel in das Zeitfenster (18:24–18:45 Uhr Berlin, Chat 08–20 Uhr),
scheiterte aber an der Fehlerseite, nicht an der Uhrzeit.

**Code am Stand 033ea6f** (Commit bf23e3f, danach nur Klassen-Änderungen 0f26433/c335c7e):
- `web/src/components/chat/ChatFenster.tsx:211` `feld.current?.focus()` vor `setSendet(true)`; `:221` bei sperrenden Gründen Fokus auf die
  Statusmeldung (`:419` `tabIndex={-1}`), bei `leer/zuLang/rate` (`:64`) bleibt er im Feld; `:262` nach „Regeln bestätigen“ ins Feld bzw. aufs
  Sperrband (`:611`). Der Knopf bleibt `disabled` (`:402`), hält aber den Fokus nicht mehr.
- `web/src/components/unterricht/AnwesenheitErfassen.tsx:133` `aria-disabled={sendet || undefined}` statt `disabled`, `:49` `if (sendet) return;`.
- E2E `web/tests/e2e/mein-bereich-lernen.spec.ts:135,153,156` prüft `toBeFocused()` – nicht ausgeführt (UMGEBUNGSAUSNAHME Docker-E2E).

**Ersatzprüfung im echten Chromium** (`skripte/gestell-pruefen.mjs` → `ergebnisse/gestell-f1-f2.json`): Das Prüfgestell
(`harness/eintrag.tsx`, gebündelt mit esbuild 0.28.2 aus `web/node_modules` über `harness/bauen.mjs`) rendert die **echten** Komponenten
aus `web/src` mit dem **gebauten CSS** des Servers (`web/.next/static/chunks/0olybzqedzasz.css`, `2q9xmg2hf0p0q.css`, Klassen von `<html>` wie auf
`/mein-bereich`). Ersetzt sind nur die Server Actions (`harness/mock-chat.ts`, `mock-unterricht.ts`, Verzögerung 500–900 ms) und der Abruf
`/api/mein/chat` (im Browser). Playwright beantwortet `http://gestell.test/` selbst, es läuft kein Server.

| Fall | Ergebnis 033ea6f | Gegenprobe 75cad0a (`GESTELL_APP=app-alt.js`) |
|---|---|---|
| Chat Kind 1440: Text, Tab auf „Senden“, Enter | während des Sendens Fokus im Feld (Knopf `disabled`), danach Feld leer, Fokus im Feld, `:focus-visible`, Ring `solid 2px rgb(14,57,41)`, nicht verdeckt; danach Enter im Feld sendet erneut, Fokus bleibt | Fokus `body`, kein Ring (F-1 reproduziert) |
| Chat Kind 390, ebenso | gleich | `body` |
| Chat Leitung 1440, ebenso | gleich | `body` |
| Chat: Ablehnung „geschlossen“ | Fokus auf der Statusmeldung (`p[role=status]`, Ring 2px); 5 s später Feld gesperrt, Fokus bleibt dort | `body` |
| Chat: Ablehnung „rate“ | Fokus bleibt im Feld | `body` |
| „Ich habe die Regeln gelesen“ + Enter | Fokus im freigegebenen Feld, Ring 2px | `body` |
| Anwesenheit 1440/390: Radio → „Später“, Tab auf „Anwesenheit speichern“, Enter | während des Speicherns Fokus auf dem Knopf (`aria-disabled="true"`), zweites Enter speichert nicht doppelt (1 Aufruf), danach „Gespeichert.“, Fokus auf dem Knopf, `:focus-visible`, Ring 2px, nicht verdeckt; Tab → nächster Link, Shift+Tab → Knopf | Fokus `body` (F-2 reproduziert) |

Bilder (Auswahl, alle mit sichtbarem Ring): `bilder/gestell-chat-1440-kind-1-senden-fokus.png`, `…-2-waehrend-senden.png`,
`…-3-nach-enter.png`, `bilder/gestell-chat-390-kind-3-nach-enter.png`, `bilder/gestell-chat-1440-leitung-3-nach-enter.png`,
`bilder/gestell-chat-1440-kind-5-abgelehnt-geschlossen-nach-abruf.png`, `bilder/gestell-chat-1440-kind-6-regeln-bestaetigt.png`,
`bilder/gestell-anwesenheit-{1440,390}-{1-speichern-fokus,2-waehrend-speichern,3-nach-enter-gespeichert}.png`;
Gegenprobe ohne Ring: `bilder/gegenprobe-75cad0a-chat-1440-kind-3-nach-enter.png`, `bilder/gegenprobe-75cad0a-anwesenheit-1440-3-nach-enter-gespeichert.png`
(`ergebnisse/gegenprobe-75cad0a-f1-f2.json`). In keinem Lauf gab es Seiten- oder Konsolenfehler.

Grenze des Ersatzes: Rechte, Zeitfenster und Speichern in der Datenbank sind gemockt; die Fokusführung selbst ist echter Komponenten-Code
in echtem Chromium.

**Hinweis (gering):** Nach der Ablehnung „geschlossen“ steht derselbe Satz zweimal als `role=status` da (Sperrband und Meldung unter
dem Formular), `bilder/gestell-chat-1440-kind-5-abgelehnt-geschlossen-nach-abruf.png`.

## (c) Koran-Wörter `/quran/1` per Tastatur (Gast, 1440 und 390)

`skripte/tast-koran.mjs` → `ergebnisse/tast-koran.json`. Arabische Wortinhalte sind im Ergebnis durch Zeichenanzahlen ersetzt.

- Tab bis Vers 1: 16 Tabs (1440) bzw. 9 Tabs (390). Ring `outline none → solid 2px rgb(14,57,41)`.
- ← erstes Wort (`span[role=button]`, w 1), ←← Wort 3, → Wort 2, Ende Wort 4, Pos1 Wort 1, alle mit `:focus-visible`.
- ←, Enter: Wortkarte offen (`role=dialog`, Titel „Wort 2 in Vers 1“), Fokus in der Karte, `aria-expanded=true` am Wort.
- Tab → „Schließen“; Escape → Karte zu, Fokus zurück auf Wort 2; Escape → Vers 1; Tab → Vers 2.
- Nie verdeckt, keine Seitenfehler.
- Bilder: `bilder/tast-koran-{1440,390}-{1-vers-fokus,3-drittes-wort,7-enter-wortkarte-offen,8-tab-in-karte,9-escape-karte-zu-fokus-wort}.png`.

## Änderungen an Prüfdaten

Nur neue Anmeldesitzungen für Kind und Lehrkraft und ein abgewiesener Verwaltungs-Anmeldeversuch (Audit `anmeldung.fehlgeschlagen`).
Keine Nachrichten, Meldungen oder Anwesenheiten geschrieben.

## Nebenbeobachtung (außerhalb Z-07, gering)

Ein Konto ohne Verwaltungsrolle und ohne zweiten Faktor (Kind, Eltern) landet unter `/verwaltung` auf „Zwei-Faktor-Anmeldung einrichten“
statt auf „keine Rolle“. `verlangeSitzung` prüft den zweiten Faktor vor der Rolle (`web/src/lib/rechte/pruefe.ts:68-69`), und die
Seite `web/src/app/[locale]/verwaltung/zwei-faktor/page.tsx` prüft keine Rolle. Die Action weist seit N4 ab (`anmeldung.ts:181`).

## Bewertung

| Teil | Status | Kurz |
|---|---|---|
| (a) axe | teilweise | Kind-Start und Eltern › Kind 0/0 bei 390/1440; Chat und Anwesenheit brechen auf 3100 ab (nur Ersatz auf Komponenten 0/0); 3 Verwaltungsrouten ohne Sitzung offen |
| (b) F-1 Chat | erfüllt im Ersatz | Fokus bleibt im Feld bzw. auf der Meldung; Gegenprobe 75cad0a zeigt den alten Fehler; Serverlauf offen (DB ohne Migration 0013/0014) |
| (b) F-2 Anwesenheit | erfüllt im Ersatz | Fokus bleibt auf dem Knopf, Ring sichtbar, kein Doppelspeichern; Serverlauf offen |
| (b) Kind-Senden 08–20 Uhr | offen | im Zeitfenster versucht, Seite bricht ab (Umgebung) |
| (c) Koran-Wörter | erfüllt | wie verlangt, Fokus sichtbar |
| **Z-07 Teil Konten/Tastatur** | **teilweise** | Code und Ersatz belegen F-1/F-2 als behoben. Für das volle Urteil fehlen: Server-DB mit Migrationen 0013/0014 (Server neu starten) und ein Verwaltungskonto mit zustellbarer Adresse (nicht `.invalid`). |
