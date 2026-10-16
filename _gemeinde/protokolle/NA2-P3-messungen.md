# Nacharbeit 2, Paket P3 – Ergebnisse

Arbeitsbaum `/home/user/IGMG/.claude/worktrees/agent-ac6673f9fb57f2154`, Zweig `worktree-agent-ac6673f9fb57f2154`
(Start: Fast-Forward auf `claude/trusting-lovelace-6nfolz` = 2c11368). Messungen am Produktionsbau wie ein frisch
importiertes Vercel-Projekt ohne Datenbank (`( . scratchpad/env-import.sh; node scripts/vercel-bau.mjs )`,
`next start -p 3233`). Alle Protokolle liegen in diesem Ordner.

## Schlussprüfung 16.10.2026 (Stand db7387b, nach Fortsetzung am Sitzungslimit)

Bau neu wie frischer Import (`bau-schluss.log`, rc=0, eigener TMPDIR `scratchpad/tmp-p3`), `next start -p 3233`
(`prod-schluss.log`). **Bedingungen:** Maschine geteilt; Last (load average 1 min) vor dem ersten Tab 2,2, danach 7,0
(fremder Lauf eines anderen Pakets begann währenddessen), vor Lighthouse 6,5, danach 3,9. Die Werte sind deshalb
**Hinweise**; die gültige Messung macht ein Prüfer allein auf ruhiger Maschine.

### Z-08 erster Tab (390 px, CPU 4×, 3 Läufe, Dauer des ersten keydown in ms; `erster-tab-schluss.log`)

| Route | vorher (2c11368, 15.10.) | Schluss (db7387b, 16.10.) | Ziel ≤ 200 ms |
|---|---|---|---|
| /hadith/bukhari/56 | 1184 · 1152 · 864 | 16 · 24 · 16 | erfüllt |
| /hadith/bukhari/56/teil/2 | 1056 · 760 · 952 | 24 · 24 · 24 | erfüllt |
| /hadith/bukhari/1 | 192 · 192 · 168 | 40 · 24 · 16 | erfüllt |
| /quran/2 | 56 · 48 · 88 | 80 · 64 · 40 | erfüllt (Koran-Leser unverändert; Streuung unter Last) |

Fokus nach dem ersten Tab in allen 12 Läufen: Sprunglink „Zum Inhalt“ (`a.sr-only`), kein offener Dialog, Status 200.

### Lighthouse mobil (Median aus 3 Läufen, Drosselung „devtools“; `lh-schluss.md`, `lh-schluss.json`)

| Route | Perf. vorher → Schluss | LCP ms vorher → Schluss | TBT ms vorher → Schluss | JS kB gzip vorher → Schluss | Ziel LCP ≤ 2500, JS ≤ 180 |
|---|---|---|---|---|---|
| /hadith/bukhari/1 | 83 → 91 | 1947 → 1828 | 561 → 333 | 170,1 → 170,1 | erfüllt |
| /gebetszeiten | 91 → 97 | 1911 → 1865 | 315 → 156 | 179,3 → 179,3 | erfüllt (geteiltes JS nicht vergrößert) |

TBT > 200 ms auf /hadith/bukhari/1 bestand schon vorher und ist nicht Ziel dieses Pakets; LCP-Element ist auf beiden
Seiten der Konzepthinweis (Erstbesuch).

### Soft-404 per curl gegen next start ohne Datenbank (`soft404-schluss.log`, Skript `skripte/soft404.sh`)

| Pfad | vorher | Schluss |
|---|---|---|
| /anmelden, /registrieren, /mein-bereich, /mein-bereich/kinder, /konto, /passwort-vergessen, /einladung/abc, /de/anmelden | 200 | **404**, `private, no-store` |
| /tr/giris, /tr/kayit, /tr/hesabim | 200 | **404** |
| /en/sign-in, /en/register, /en/my-account | 200 | **404** |
| /gebetszeiten · /suche · /verwaltung · /gibtsnicht | 200 · 200 · 200 · 404 | unverändert |

Neu im Repo: `web/tests/e2e/konten-ohne-datenbank.spec.ts` prüft denselben Status gegen `next start` ohne Datenbank
(übersprungen, wenn `/api/health` eine Datenbank meldet). Lauf gegen den Schlussbau: `e2e-prod-schluss.log` –
12 bestanden, 2 übersprungen (Telefon-Projekt bei reinen Statusprüfungen bzw. Player-Prüfung nur „desktop“); darin
auch Such-E2E, Hadith-Suche und „ohne aktive Rezitation“.

### Prüfungen (Schluss)

| Prüfung | Ergebnis | Protokoll |
|---|---|---|
| `pnpm typen` | rc=0 | `typen-final.log` |
| eslint (geänderte Dateien) | rc=0 | `eslint-final.log` |
| prettier --check (43 geänderte Dateien) | sauber | `prettier-final.log` |
| Unit voll | 106 Dateien, 1528 bestanden + 3 erwartete Fehlschläge | `unit-final.log` |
| Integration (21 betroffene Dateien) | 1628 bestanden | `integration-final.log` |
| `pnpm sprachen:pruefen` | ok (2969 Schlüssel de/tr/en) | `sprachen-final.log` |
| `religion-pruefung.mjs` (Kopie im Arbeitsbaum) | rc=0, 5410 Dateien | `religion-final.log` |
| `wortlaut.mjs --basis b702c7c --stand db7387b` (Kopie im Arbeitsbaum) | rc=0, 0 offene Befunde „hoch“ | `wortlaut-final.log`, `scratchpad/wortlaut-na2p3.md` |
| `freie-werte.mjs` (22 geänderte Dateien unter web/src) | 0 Funde | `freie-werte-final.md` |

Hinweis zu den Werkzeugen: `wortlaut.mjs` liest fest `/home/user/IGMG` (`REPO`); `--stand HEAD` meint dort den
Hauptzweig (heute 4325608 mit P1), nicht den Arbeitsbaum. Deshalb mit dem Commit-Hash geprüft. `religion-pruefung.mjs`
prüft das Repo, in dem es liegt – also die Kopie im Arbeitsbaum aufrufen. Beim Zusammenführen mit P1 brauchen beide
Ausnahme-Änderungen in `wortlaut.mjs` (P1: startseite/wissen in der Verwaltungs-Ausnahme; P3: neue G-09) Platz; sie
liegen an verschiedenen Stellen.

## Messungen vorher/nachher (15.10.2026)

### Z-08 erster Tab (390 px, CPU 4×, 3 Läufe; `skripte/erster-tab.mjs`, Dauer des ersten keydown-Ereignisses in ms)

| Route | vorher (2c11368) | nachher (Zwischenstand) | nachher (Endbau) | Ziel ≤ 200 ms |
|---|---|---|---|---|
| /hadith/bukhari/56 | 1184 · 1152 · 864 | 24 · 24 · 32 | 40 · 40 · 72 | erfüllt |
| /hadith/bukhari/56/teil/2 | 1056 · 760 · 952 | 24 · 32 · 32 | 40 · 48 · 24 | erfüllt |
| /hadith/bukhari/1 | 192 · 192 · 168 | 24 · 32 · 24 | 104 · 24 · 24 | erfüllt |
| /quran/2 | 56 · 48 · 88 | 32 · 64 · 40 | 64 · 48 · 32 | erfüllt (unverändert) |

Fokus nach dem ersten Tab in allen Läufen: Sprunglink „Zum Inhalt“ (`a.sr-only`), kein Dialog. Zweiter Tab und
Shift+Tab laufen danach normal weiter (`zweiter-tab.log`). Logs: `erster-tab-vorher.log`, `erster-tab-nachher.log`,
`erster-tab-final.log`.

### Lighthouse mobil (Median aus 3 Läufen, Drosselung „devtools“; `lh-vorher.md`, `lh-nachher.md`)

| Route | Perf. vorher → nachher | LCP ms vorher → nachher | TBT ms vorher → nachher | JS kB (gzip) vorher → nachher |
|---|---|---|---|---|
| /hadith/bukhari/1 | 83 → 89 | 1947 → 1939 | 561 → 384 | 170.1 → 170.1 |
| /gebetszeiten | 91 → 92 | 1911 → 1962 | 315 → 263 | 179.3 → 179.3 |

LCP ≤ 2,5 s und JS ≤ 180 kB erfüllt; geteiltes JS nicht vergrößert (/gebetszeiten unverändert 179,3 kB). TBT über
200 ms bestand schon vorher (nicht Teil dieses Pakets; LCP-Element ist auf beiden Seiten der Konzepthinweis).

### Soft-404 der Konto-Seiten ohne Datenbank (`skripte/soft404.sh`)

| Pfad | vorher | nachher |
|---|---|---|
| /anmelden, /registrieren, /mein-bereich, /mein-bereich/kinder, /konto, /passwort-vergessen, /einladung/abc | 200 (Titel „Seite nicht gefunden“) | 404, `private, no-store`, `X-Robots-Tag: noindex, nofollow` |
| /tr/giris, /tr/kayit, /tr/hesabim | 200 („Sayfa bulunamadı“) | 404 |
| /en/sign-in, /en/register, /en/my-account, /de/anmelden | 200 | 404 |
| /gebetszeiten, /suche, /verwaltung, /gibtsnicht | unverändert | unverändert (200 / 200 / 200 / 404) |

Logs: `soft404-nachher.log`, `soft404-final.log`. Die Spalte „nicht-gefunden-text“ zählt nur Vorkommen des Wortes im
HTML und ist nur für die 404-Zeilen aussagekräftig.

### Suche ohne Laufzeit-Datenbank (`suche-nachher.log`; vorher: jede Anfrage „Keine Treffer“, `suche-vorher-bukhari1.html`)

| Anfrage | vorher | nachher |
|---|---|---|
| Gebet | Keine Treffer | 4 Titel (Gebetszeiten, 1 Neuigkeit, 2 Veranstaltungen) |
| Ramadan | Keine Treffer | 4 Titel (Seite, Hadith-Buch 31, 2 Neuigkeiten) |
| Moschee | Keine Treffer | 4 Titel (Seite, 2 Neuigkeiten, Wissen) |
| Fatiha | Keine Treffer | Sure 1 |
| Bukhari 1 / Bukhari 7563 | Keine Treffer | /hadith/bukhari/1#h-1 bzw. /hadith/bukhari/97/teil/2#h-7563 |
| Hadith n, Hadis n, Hadith Nr. n | Keine Treffer | wie „Bukhari n“ (Unit- und Integrationstest, Endbau) |
| xyzunbekannt | Keine Treffer | „Kein Titel enthält … Die Suche im ganzen Text kommt hinzu, sobald die Datenbank der Gemeinde verbunden ist.“ |
| Wort mit Filter „Hadith“ | Keine Treffer | ehrlicher Hinweis: Hadithe hier über die Nummer finden |

Mit Datenbank sucht die Seite unverändert im Volltext (Integrationstest `suche-ohne-datenbank.test.ts`: Ergebnis gleich
`suche()`/`sucheHadith()`, auch wenn eine Index-Datei daliegt).

### Chat „geschlossen“ – Live-Regionen (`chat-gestell/chat-vorher.log`, `chat-nachher.log`)

| | vorher | nachher |
|---|---|---|
| Regionen `role=status` nach Ablehnung und Abruf | 2 (Statuszeile und Sperrband sagen beide „geschlossen“) | 1 (nur das Sperrband, mit „Schreiben geht wieder ab …“) |
| Fokus | Statuszeile | Sperrband |

## Ursache Soft-404

Die Konto-Routen sind mit Cache Components teilweise vorgerendert (PPR): Der Server liefert die zwischengespeicherte
Hülle sofort mit Status 200 aus (`x-nextjs-postponed: 1`), `notFound()` im Layout läuft erst im nachgestreamten Teil –
dann ist der Status schon gesendet (Next-Doku `not-found.md`, `streaming.md` „HTTP contract“, `loading.md`). Ein echter
404 geht deshalb nur vor dem Rendern: Der Proxy (`src/proxy.ts`) schreibt Konto-Pfade auf die vorgerenderte 404-Seite um,
wenn die Funktion sicher aus ist – ohne Laufzeit-Datenbank oder mit `FUNKTION_KONTEN=aus` (`src/lib/konto/ohne-konten.ts`).
Grenze: Ist „Konten“ nur über die Einstellung in der Datenbank ausgeschaltet (Datenbank da, keine Umgebungsvariable),
bleibt es beim Soft-404, weil der Proxy keine Datenbank liest.

## Player-E2E (Z-16) – Ausführung

Spec `web/tests/e2e/quran-player.spec.ts`, Hilfen `web/tests/e2e/hilfen/rezitation.ts` und
`web/tests/e2e/hilfen/rezitation-anlegen.ts`. Testdaten nur synthetisch: Sinuston je Vers (1,5 s Ton, 0,5 s Stille,
Frequenz steigt je Vers), mit ffmpeg nach Ogg/Opus (sonst Ogg/Vorbis oder MP3), Platzhalter-PDF als Vereinbarung,
Verszeiten und geprüfte Wortzeiten, Rezitation `e2e-testton-<hex>` aktiv. Nach dem Lauf wird alles entfernt.

- **Echter Lauf** (`playwright.config.ts`, PostgreSQL + Mailpit): nichts weiter nötig; die Spec legt die Rezitation über
  das Skript in der E2E-Datenbank an (die Konfiguration setzt `DATABASE_URL` auf die E2E-Datenbank) und erneuert die Caches
  mit `WARTUNG_TOKEN` aus `.env`. Voraussetzung: ffmpeg mit libopus, libvorbis oder libmp3lame.
- **Ersatzlauf hier** (Entwicklungsserver mit PGlite-Kopie, eigener Port 3234; die E2E-Umgebung unter
  `scratchpad/e2e-echt/` gehört zu einem anderen Paket und wurde nicht angefasst): Rezitation VOR dem Serverstart anlegen
  (`pnpm exec tsx --conditions=react-server --env-file-if-exists=.env tests/e2e/hilfen/rezitation-anlegen.ts --json >
  testrezitation.json`), Server starten, dann
  `E2E_TESTREZITATION=testrezitation.json E2E_BASIS=http://localhost:3234 pnpm exec playwright test -c playwright.lokal.config.ts tests/e2e/quran-player.spec.ts`.
  Ergebnis: 6 bestanden (`e2e-player.log`), mit `--repeat-each 3` 18 bestanden (`e2e-player-wiederholt.log`);
  „ohne aktive Rezitation“ läuft gegen den Produktionsbau ohne Datenbank (`e2e-prod-suche.log`).
- Geprüft: Abspielen, Quellenzeile, Vers- und Wort-Hervorhebung wandert, Vers ×3, Tempo 0,75×/1,25×, Tastatur
  (öffnen, nächster/vorheriger Vers, Pause/weiter, schließen), 390 px ohne Überlauf, Bedienelemente ≥ 44 px, axe.
- Fund dabei: Mit aktiver Rezitation lief die Werkzeugleiste des Lesers bei 390 px über (451 px) – „Abspielen“ steht unter
  `sm` jetzt nur als Symbol mit Beschriftung für Screenreader (`QuranLeser.tsx`).

## Weitere Prüfungen

- Unit 106 Dateien: 1527 bestanden + 3 erwartete Fehlschläge (`unit.log`); Integration 19 Dateien: 2425 bestanden + 2
  erwartete (`integration.log`); danach geänderte Tests einzeln grün.
- Rechte-Matrix Mitgliederbereich: 7 Action-Dateien, 42 Actions × 9 Personengruppen + Schalter + Vollständigkeit
  (`matrix-mitglieder.log`); Gegenprobe mit abgeschwächter Prüfung schlägt an.
- „Kein Zugang zur Verwaltung“ im Browser mit Gemeinde-Konto: `kein-zugang.log`, `kein-zugang-390.png`, `kein-zugang-1440.png`.
- `pnpm typen` rc=0, eslint rc=0, prettier sauber, `pnpm sprachen:pruefen` ok, `religion-pruefung.mjs` rc=0,
  `wortlaut.mjs --basis b702c7c` rc=0 (neue Ausnahme G-09 für `suche.statisch.hinweis`, Bedienhinweis ohne Rechtsinhalt;
  Protokoll `scratchpad/wortlaut-na2p3.md`), `freie-werte.mjs` 22 Dateien, 0 Funde.
