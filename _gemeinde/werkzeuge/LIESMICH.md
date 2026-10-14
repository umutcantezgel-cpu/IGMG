# Prüfwerkzeuge (E0) – Liesmich

Dieser Ordner enthält die Werkzeuge, mit denen Prüfer Gestaltung, Zugänglichkeit, Leistung und Bewegung der Web-App messen. Du änderst mit ihnen nichts am Projekt. Sie schreiben nur Protokolle nach `_gemeinde/protokolle/` (Standard) und Bilder nach `SCRATCHPAD/bilder/` (außerhalb des Repos). Den Scratchpad-Pfad nennen alle Skripte; Vorgabe: `/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad`. Er lässt sich mit `SCRATCHPAD=…` ändern.

## Einrichtung in 5 Schritten

Die Schritte sind wiederholbar. Alle Befehle laufen im Projektordner `/home/user/IGMG`.

**1. Node 24 und pnpm prüfen**

```
S=/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad
export PATH=$S/node24/bin:$PATH COREPACK_ENABLE_DOWNLOAD_PROMPT=0 NEXT_TELEMETRY_DISABLED=1
node --version            # v24.x (geprüft: v24.21.0)
cd web && pnpm --version  # 12.11.2 (aus packageManager in web/package.json)
```

Außerhalb von `web/` meldet corepack eine andere pnpm-Version. Maßgeblich ist der Aufruf in `web/`.

**2. Prüfwerkzeuge installieren, außerhalb des Repos**

```
mkdir -p $S/werkzeuge-nm && cp _gemeinde/werkzeuge/package.json $S/werkzeuge-nm/
cd $S/werkzeuge-nm && PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install --no-audit --no-fund
cd /home/user/IGMG && ln -sfn $S/werkzeuge-nm/node_modules _gemeinde/werkzeuge/node_modules
```

Ergebnis: playwright 1.64.0, @axe-core/playwright 4.13.0, lighthouse 13.5.0 (Versionen aus `web/package.json` und `web/node_modules`). `_gemeinde/.gitignore` ignoriert den Symlink.

**3. Browser prüfen**

Chromium liegt unter `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` (Version 141). `playwright install` nicht ausführen. Andere Pfade setzt `CHROME_PATH=/pfad/zu/chrome`. Schnelltest:

```
node _gemeinde/werkzeuge/einzelbild.mjs / --breite 390
```

**4. Ausgangsstand bauen und einfrieren**

```
cd web && pnpm install --frozen-lockfile        # nur falls node_modules fehlt
pnpm db:bau-vorbereiten                         # PGlite-Datenbank mit Migrationen und Seeds
set -a; . $S/lokal.env; set +a                  # Laufzeitwerte (siehe unten)
BAU_PGLITE=1 PGLITE_VERZEICHNIS="$PWD/.pglite-bau" DATABASE_URL= NODE_ENV=production pnpm build
```

Eingefroren wird aus `web/.next/standalone`. Next bündelt `@electric-sql/pglite` nicht, deshalb wird der Paketlink ergänzt (gleiche Version 0.5.8 wie im Projekt):

```
B=$S/basis-standalone; W=$PWD
mkdir -p $B && cp -a $W/.next/standalone/. $B/
mkdir -p $B/.next/static && cp -a $W/.next/static/. $B/.next/static/
cp -a $W/public/. $B/public/ && cp -a $W/.pglite-bau $B/.pglite-bau
mkdir -p $B/node_modules/@electric-sql
ln -sfn ../.pnpm/@electric-sql+pglite@0.5.8/node_modules/@electric-sql/pglite $B/node_modules/@electric-sql/pglite
sed -i "s#^PGLITE_VERZEICHNIS=.*#PGLITE_VERZEICHNIS=$B/.pglite-bau#" $S/lokal.env
```

Der eingefrorene Stand gehört zum Commit, der beim Build auscheckt war (`git rev-parse HEAD`). Einen neuen Build nur auf ausdrückliche Anweisung.

**5. Server starten und prüfen**

```
_gemeinde/werkzeuge/server-starten.sh start    # wartet auf /api/health, Standard: Port 3100
_gemeinde/werkzeuge/server-starten.sh status
_gemeinde/werkzeuge/server-starten.sh stop
```

`$S/lokal.env` (außerhalb des Repos, Rechte 600) enthält die Laufzeitwerte: `NODE_ENV`, `PORT=3100`, `HOSTNAME=0.0.0.0`, `APP_URL`, `BETTER_AUTH_URL`, `BAU_PGLITE=1`, `PGLITE_VERZEICHNIS`, `DATABASE_URL=` (leer), `PROXY_VERTRAUEN=1`, `EINGANG_SCHLUESSEL_ID=1`, `SPEICHER=dateisystem`, `MEDIEN_VERZEICHNIS`, sowie die Geheimnisse `BETTER_AUTH_SECRET`, `ALTCHA_GEHEIMNIS`, `RATE_GEHEIMNIS`, `EINGANG_SCHLUESSEL` (32 Byte, Base64) und `WARTUNG_TOKEN`. Erzeugen mit `openssl rand -base64 32` (`WARTUNG_TOKEN`: `-base64 48`). Werte nie in den Bericht oder ins Repo.

## Werkzeuge

Alle Skripte: `node _gemeinde/werkzeuge/<name>.mjs --hilfe`. Basisadresse: `--basis URL` oder `BASIS` (Standard `http://127.0.0.1:3100`). Protokolle: `--protokoll <basisname>` (schreibt `.json` und `.md`), Standard `_gemeinde/protokolle/werkzeug-<name>-<zeit>`. Befunde sind Daten und führen nicht zu Exit-Code 1. Exit-Code 1 bedeutet technischen Fehler oder HTTP-Fehler der Seite.

Gemeinsame Schalter: Der Konzept-Hinweis (Modal beim ersten Besuch, `localStorage`) wird als „gesehen“ markiert, damit er Ansichten nicht überdeckt. `HINWEIS_ZEIGEN=1` lässt ihn stehen.

| Werkzeug | Zweck | Beispiel |
|---|---|---|
| `einzelbild.mjs` | Ein Bild einer Seite, JPEG 70 (PNG mit `--png`), höchstens 1440 px breit | `node _gemeinde/werkzeuge/einzelbild.mjs / --breite 1440`<br>`node …/einzelbild.mjs /gebetszeiten --breite 390 --voll --aus /tmp/g.jpg` |
| `bildsatz.mjs` | Je Route 390×844, 768×1024, 1440×900: ein Ausschnitt je Bildschirmhöhe (kein fullPage), Überlauf- und Textkürzungsprüfung | `node …/bildsatz.mjs --routen …/routen-hauptansichten.json --reduziert` |
| `a11y.mjs` | axe mit wcag2a/aa, wcag21a/aa, wcag22aa; Zahl je Schwere | `node …/a11y.mjs --routen …/routen-tr.json --breite 390` |
| `lighthouse.mjs` | Lighthouse mobil, je Lauf „devtools“ (maßgeblich) und „simulate“, Median aus `--laeufe` (Standard 3) | `node …/lighthouse.mjs --routen …/routen-hauptansichten.json --laeufe 3` |
| `bewegung.mjs` | Reduzierte Bewegung, fünf Einzelbilder, Bildrate unter CPU 4× | `node …/bewegung.mjs --route /veranstaltungen --dauer 2000 [--scrollen]` |
| `freie-werte.mjs` | Tailwind-Klammerwerte, Hex-Farben, Farbfunktionen, px-Literale in Style-Objekten | `node …/freie-werte.mjs` (alle `web/src`)<br>`node …/freie-werte.mjs --seit 9ebb4bc` |
| `svg-pruefung.mjs` | Alle `.svg` im Repo und inline `<svg>` in `web/src` | `node …/svg-pruefung.mjs` |
| `anmeldung.mjs` | Testkonto der Verwaltung mit TOTP, Anmeldezustand | siehe unten |
| `server-starten.sh` | Startet und stoppt den eingefrorenen Server | siehe Schritt 5 |

**Routen-Dateien** sind JSON-Listen aus `{ "name": "…", "pfad": "/…" }`. `routen-hauptansichten.json` (11 Routen, Deutsch) und `routen-tr.json` (11 Routen, Türkisch unter `/tr/…`) liegen hier. Eigene Dateien genauso aufbauen.

**Bildsatz-Ergebnis**: `…/bilder/bildsatz-<zeit>/<route>/<breite>x<höhe>/schirm-NN.jpg` plus `zusammenfassung.md`. Befunde „waagerecht“ bedeuten, dass Text über den Rand läuft, „senkrecht“ dass er abgeschnitten ist. Kürzungen mit Auslassungszeichen sind getrennt gekennzeichnet. Verborgener Text für Bildschirmleser (`sr-only`) zählt nicht.

**Anmeldung in der Verwaltung** (PGlite, nur ein Prozess je Datenbank):

```
_gemeinde/werkzeuge/server-starten.sh stop
node _gemeinde/werkzeuge/anmeldung.mjs einladen          # Einladung in die Datenbank, Server gestoppt
_gemeinde/werkzeuge/server-starten.sh start
node _gemeinde/werkzeuge/anmeldung.mjs anmelden          # Passwort, TOTP, Anmeldung, storageState
node _gemeinde/werkzeuge/einzelbild.mjs /verwaltung --zustand $S/verwaltung-state.json --breite 1440
```

Testkonto: `pruefer@example.test` (Rolle administration, nur Testdaten). Die Einladung ist 72 Stunden gültig; bei einem neuen Lauf eine neue Datenbank verwenden. `einladen` verweigert den Lauf, solange der Server läuft.

## Grenzen

- **Browser-Version:** Playwright 1.64 erwartet Chromium 156 (Revision 1248). Installiert ist Chromium 141 (Revision 1194). Die Werkzeuge laufen damit (Test bestanden). Der Abstand kann Befunde zur Bildrate verändern.
- **Lighthouse** setzt den Browserspeicher bei jedem Lauf zurück. Der Konzept-Hinweis erscheint deshalb in jeder Messung. Die Werte sind untereinander vergleichbar, aber nicht frei von diesem Modal.
- **Bildrate** misst den Leerlauf der Seite, und zwar nur Animationen, die gerade laufen. `--scrollen` fügt Scrollen hinzu.
- **Bewegung** erkennt nur Animationen, die während der Messung laufen. Scroll-gesteuerte Effekte brauchen `--scrollen`.
- **Mailpit** und **PostgreSQL** sind für diese Werkzeuge nicht nötig.
