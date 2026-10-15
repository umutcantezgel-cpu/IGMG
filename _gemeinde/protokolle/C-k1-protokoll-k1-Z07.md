# Stufe C · Schlüssel k1 · Z-07 (Teil Konten/Tastatur)

Prüfzeit 15.10.2026, 02:39–02:53 UTC (04:39–04:53 Europe/Berlin). Nur gelesen und Werkzeuge ausgeführt, im Repository nichts geändert.

Alle Pfade unten sind relativ zu `/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c/k1/`
(Ordner `bilder/`, `ergebnisse/`, `skripte/`, `zustand/` mit Rechten 0600).

## Stand und Umgebung

- `origin/main` = 75cad0a. Arbeitsbaum `claude/trusting-lovelace-6nfolz` = 39f03da. Die beiden späteren Commits ändern nur
  `_gemeinde/`: `git diff --stat 75cad0a HEAD -- web/src` ist leer.
  Der lokale Zweig `main` (71e263f) ist veraltet und ein Vorfahr von 75cad0a.
- Server http://localhost:3100: `next-server (v16.4.0)` via `pnpm exec next start -p 3100` aus `web/.next`.
  `BUILD_ID` ist `IMdqfKcRXVgGFSjcXiIg5`, gebaut am 14.10. um 18:40:11 UTC und damit nach Commit 75cad0a (18:23:03 UTC).
  `/api/health` antwortet 200 `{"status":"ok"}`. Der Server wurde weder gestartet noch beendet.
- Werkzeuge: Node v24.21.0 (`scratchpad/node24`), Playwright 1.64.0, @axe-core/playwright 4.13.0 und axe-core 4.13.0
  (`scratchpad/werkzeuge-nm`), Chromium 141 unter `/opt/pw-browsers/chromium`. Die axe-Tags sind dieselben wie in
  `_gemeinde/werkzeuge/a11y.mjs`: wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa.
- Sitzungen (`skripte/sitzungen.mjs`):
  - Kind (kind.beispiel, „Emre“) und Eltern: Der Zustand der Sichtabnahme war gültig.
  - Lehrkraft („Selin B.“, TOTP) und Verwaltung (sicht.admin@beispiel.invalid, TOTP) waren abgelaufen und wurden neu angemeldet.
  - Es wurden keine Zugangsdaten ausgegeben.

## (a) axe auf den Konto-Routen

Es gab zwei unabhängige Läufe, jeweils mit 390 und 1440 px Breite.

1. **Offizielles Werkzeug**, je Rolle mit Anmeldezustand (POST wird dabei abgebrochen):
   `SCRATCHPAD=… node _gemeinde/werkzeuge/a11y.mjs --routen ergebnisse/routen-<rolle>.json --breite <390|1440> --zustand zustand/<rolle>.json --warte 2500 --protokoll ergebnisse/a11y-<rolle>-<breite>`
   Die Protokolle liegen unter `ergebnisse/a11y-{kind,eltern,lehrkraft,admin}-{390,1440}.{md,json}`.
2. **Eigener Lauf** `skripte/axe-konten.mjs` → `ergebnisse/axe-konten.json`. Er belegt zusätzlich, dass die angemeldete
   Ansicht wirklich geladen war: Pfad nach Weiterleitung, h1 und ein Kennzeichen-Selektor. Dazu kommt ein Bild je Lauf
   (`bilder/axe-*.jpg`).

| Route (Rolle) | geladen als | 390: krit./ernst/mittel/gering | 1440: krit./ernst/mittel/gering |
|---|---|---|---|
| `/mein-bereich` (Kind) | h1 „Willkommen, Emre“ | 0/0/0/0 | 0/0/0/0 |
| `/mein-bereich/kinder/818c2890-…` (Eltern) | h1 „Emre B.“ | 0/0/0/0 | 0/0/0/0 |
| `/mein-bereich/unterricht/ff33563e-…/anwesenheit/ba6d3ada-…` (Lehrkraft, Termin 14.10.) | h1 „Anwesenheit“ | 0/0/0/0 | 0/0/0/0 |
| `/mein-bereich/gruppen/ff33563e-…/chat` (Kind) | h1 „Gruppenchat“, 3 Nachrichten | 0/0/0/0 | 0/0/0/0 |
| ebenso, Melde-Dialog offen (Zustand) | Dialog „Nachricht melden“ | 0/0/0/0 | 0/0/0/0 |
| `/verwaltung/seiten/neu` (Verwaltung) | h1 „Neue Seite“ | 0/0/0/0 | 0/0/0/0 |
| `/verwaltung/anzeige` (Verwaltung) | h1 „Anzeige“ | 0/0/0/0 | 0/0/0/0 |
| `/verwaltung` (Verwaltung) | h1 „Übersicht“ | 0/0/0/0 | 0/0/0/0 |
| Zusatz: `/quran/1` mit offener Wortkarte (`skripte/axe-wortkarte.mjs`) | Wortkarte offen | 0/0/0/0 | 0/0/0/0 |

Das offizielle Werkzeug kommt auf dieselben Zahlen: alle Routen HTTP 200, 0/0/0/0.

**Unklar (incomplete), nur `color-contrast`.** Nachgeprüft mit `skripte/axe-unklar.mjs` → `ergebnisse/axe-unklar.json`.

- `/mein-bereich` und Eltern › Kind: Ziffern der Lernweg-Stationen. axe meldet dafür „content too short“.
  - Ziffer in rgb(6,95,70) auf Weiß: 7,68:1.
  - Ziffer in rgb(81,76,70) auf Weiß: 8,49:1.
- `/verwaltung/anzeige` bei 1440: Seitenleiste. axe meldet dafür „partially obscured“.
  - Text in rgb(29,26,23) auf Weiß: 17,32:1.
  - Text in rgb(81,76,70) auf Weiß: 8,49:1.

Alle Werte liegen über 4,5:1. **Ergebnis (a): 0 ernste und 0 kritische Befunde auf allen 7 Routen und den beiden Dialogzuständen, bei beiden Breiten.**

## (b) Tastatur mit sichtbarem Fokus

Der Fokusindikator wird jeweils so geprüft: Stil im Fokus gegen den Stil nach `blur()`, danach wird der Fokus zurückgesetzt (`skripte/gemeinsam.mjs` › `indikator`).
Verdeckung wird geprüft, indem `elementFromPoint` auf die Mitte des Fokusziels zeigt (WCAG 2.4.11).

### Koran-Wörter `/quran/1`

Skript `skripte/tast-koran.mjs`, Ergebnis in `ergebnisse/tast-koran.json`. Gast, 1440 und 390, Bilder `bilder/tast-koran-<breite>-<schritt>.png`.

| Schritt | 1440 | 390 |
|---|---|---|
| Tab vom Seitenanfang bis Vers 1 (`p.vers-ar`) | 16 Tabs, Weg über Sprunglink, Kopf und Leiste. Fokusring: `outline none → solid 2px rgb(14,57,41)` | 9 Tabs, Ring gleich |
| ← (erstes Wort, rechtsläufig) | `span[role=button]` „بِسْمِ“ (w 1), Ring 2px | gleich |
| ← ← | Wort 3 „ٱلرَّحْمَٰنِ“ | gleich |
| → | Wort 2 „ٱللَّهِ“ | gleich |
| Ende / Pos1 | Wort 4 / Wort 1 | gleich |
| ←, dann Enter | Wortkarte offen: `popover`, `role=dialog`, Titel „Wort 2 in Vers 1“, Fokus in der Karte, `aria-expanded=true` am Wort | gleich |
| Tab | „Schließen“ in der Karte, Ring sichtbar | gleich |
| Escape | Karte zu, Fokus zurück auf Wort 2, `:focus-visible` | gleich |
| Escape | Fokus zurück auf Vers 1 | gleich |
| Tab | Vers 2: ein Tab-Halt je Vers | gleich |

Bildbelege mit sichtbarem Fokus:

- `bilder/tast-koran-1440-1-vers-fokus.png`
- `bilder/tast-koran-1440-3-drittes-wort.png`
- `bilder/tast-koran-1440-7-enter-wortkarte-offen.png`
- `bilder/tast-koran-1440-8-tab-in-karte.png`
- `bilder/tast-koran-1440-9-escape-karte-zu-fokus-wort.png`
- `bilder/tast-koran-390-1-vers-fokus.png`

Bei keinem Schritt war das Fokusziel verdeckt, und es gab keinen Seitenfehler.

**Hinweis (gering, kein Verstoß):** Beim Öffnen liegt der Fokus auf dem Kartenbehälter. Er hat `tabIndex -1` und `outline-none`
(`web/src/components/website/quran/Wortkarte.tsx:165`) und zeigt deshalb selbst keinen Ring. Das entspricht dem Dialogmuster.
Der erste Tab führt auf „Schließen“ mit Ring.

### Gruppenchat

Skript `skripte/tast-chat.mjs`, Ergebnisse in `ergebnisse/tast-chat-A.json` und `ergebnisse/tast-chat-B.json`.

**Kind** (Emre), 1440 und 390. Alle POST außerhalb von `/_next/` werden abgebrochen und gezählt.

- Lage zur Prüfzeit (04:48 Uhr in Berlin): Der Chat ist geschlossen (S-06, 08:00–20:00 Uhr).
  - Das Feld ist `disabled`, Platzhalter „Schreiben ist gerade nicht möglich“.
  - Das Band zeigt „Der Chat ist gerade geschlossen … Schreiben geht wieder ab 08:00 Uhr“.
  - Bild: `bilder/tast-chat-kind-1440-0-eingabe-gesperrt.png`.
  - Das gesperrte Feld steht nicht in der Tab-Reihenfolge, wie gewollt.
- Tab (1440: 21, 390: 12) führt auf „Melden: Nachricht von Selin B.“. Fokusring: `outline none → solid 2px rgb(14,57,41)`.
- **Enter** öffnet den modalen Dialog „Nachricht melden“ (`:modal`). Der Fokus liegt auf dem ersten Grund (Radio) mit Ring.
- **↓** wählt „Bedrohung oder Angst“.
- 4× **Tab** geht über Textfeld, „116 111“ und „Meldung senden“ auf **„Abbrechen“** mit Ring.
- **Enter** schließt den Dialog, der Fokus kehrt auf „Melden“ zurück, mit Ring.
- Erneut **Enter**, dann **Escape**: Der Dialog schließt, der Fokus kehrt auf „Melden“ zurück.
- Es wurde **0 POST** gesendet, also nichts gemeldet.
- Bilder: `bilder/tast-chat-kind-{1440,390}-{1-melden-fokus,2-enter-dialog-offen,3-pfeil-grund-gewaehlt,4-tab-abbrechen-fokus,5-enter-abbrechen-dialog-zu,7-escape-dialog-zu}.png`.

**Schreiben und Senden.** Für Kinder ist das zur Prüfzeit fachlich gesperrt. Ersatz: dieselbe Komponente `ChatFenster` als
**Lehrkraft (Leitung)**, die nach `web/src/lib/chat/regeln.ts:139` (`istLeitung` → `ok`, noch vor der Zeitprüfung in Zeile 141) außerhalb der Zeiten schreiben darf. Breite 1440,
Route `/mein-bereich/gruppen/ff33563e-…/chat`.

- 30 Tabs bis zum Feld, Ring 2px.
- Text getippt, **Tab** auf „Senden“ (Ring 2px), **Shift+Tab** zurück ins Feld.
- **Enter** sendet über `ChatFenster.tsx:363`. Die Nachrichten steigen von 3 auf 4, „Tastaturprobe Stufe C: …“ steht im Verlauf.
- Das Feld ist danach leer, der **Fokus bleibt im Feld** und ist sichtbar.
- Bilder: `bilder/tast-chat-lehrkraft-1440-{1-feld-fokus,2-text-getippt,3-tab-senden-fokus,4-shift-tab-zurueck-feld,5-enter-gesendet}.png`.

**Befund F-1 (mittel, WCAG 2.4.3/2.4.7): Fokusverlust beim Senden über den Knopf.**
Prüfung mit `skripte/tast-fokusverlust.mjs` → `ergebnisse/tast-fokusverlust.json`, Lehrkraft, 390.

- Ablauf: Text tippen, **Tab** auf „Senden“, **Enter**. Die Nachricht wird gesendet.
- Danach ist `document.activeElement` aber `body`, und es gibt keinen sichtbaren Fokus.
- Ursache: Der fokussierte Knopf wird `disabled`, erst wegen `sendet` und danach wegen des leeren Feldes
  (`web/src/components/chat/ChatFenster.tsx:378`).
- Chromium setzt beim nächsten Tab hinter dem Knopf fort („Abmelden“).
- Bilder: `bilder/fokusverlust-chat-390-senden-fokus.png` (vorher) und `bilder/fokusverlust-chat-390-nach-enter.png` (kein Ring).
- Der Weg mit Enter im Feld ist nicht betroffen.

### Anwesenheit (Lehrkraft)

Skript `skripte/tast-anwesenheit.mjs`, Ergebnis in `ergebnisse/tast-anwesenheit.json`. Termin Sa 10.10.
`/mein-bereich/unterricht/ff33563e-…/anwesenheit/99c42eb0-8dff-4241-805a-05e0d816ffc7`. Der Termin der Sichtabnahme (14.10.) blieb unberührt.

- **1440**, Ausgangsstand: alle drei „anwesend“.
  - 22 Tabs bis zum ersten Radio (Emre, „Da“). Fokusring am Label: `outline none → solid 2px rgb(14,57,41)`
    (`has-focus-visible:outline-2`, `web/src/components/unterricht/AnwesenheitErfassen.tsx:93`).
  - Emre: **→** setzt „Später“. **Tab** zum nächsten Kind.
  - Yunus: **→ →** setzt „Entschuldigt“. **Tab**.
  - Zeynep: **→ → →** setzt „Fehlt“.
  - Der Zähler (aria-live) zeigt nacheinander 3, 2 und 1 von 3 da.
  - **Tab** auf „Anwesenheit speichern“ (Ring), **Enter** zeigt „Gespeichert.“.
  - **Neu geladen:** verspaetet, entschuldigt, fehlt sind gespeichert.
  - Danach ist der Ausgangsstand **ebenso per Tastatur** wiederhergestellt und gespeichert. Nach erneutem Laden sind alle drei
    „anwesend“, wie im Ausgangsstand.
  - Kein Fokusziel war verdeckt.
- **390** (ohne Speichern, POST abgefangen: 0): 13 Tabs, dieselben Schritte, Ring sichtbar, nicht verdeckt.
- Bilder:
  - `bilder/tast-anwesenheit-1440-a-{0-erstes-kind-fokus,1-EmreB-verspaetet,2-YunusB-entschuldigt,3-ZeynepB-fehlt,9-speichern-fokus,10-enter-gespeichert}.png`
  - `bilder/tast-anwesenheit-1440-b-zurueck-*.png`
  - `bilder/tast-anwesenheit-390-a-*.png`

**Befund F-2 (mittel, WCAG 2.4.3/2.4.7): Fokusverlust nach „Anwesenheit speichern“.**

- Ablauf: **Enter** auf den Knopf. Danach ist `document.activeElement` = `body`, und kein Ring ist zu sehen.
- Ursache: `disabled={sendet}` in `web/src/components/unterricht/AnwesenheitErfassen.tsx:130`.
- „Gespeichert.“ wird über `role=status` angesagt.
- Der nächste Tab springt in den Fuß („info@igmg-wetzlar.de“), **Shift+Tab** zurück auf „Anwesenheit speichern“.
  Chromium hält also die Position.
- Beleg in `ergebnisse/tast-fokusverlust.json`. Bilder: `bilder/fokusverlust-anwesenheit-1440-nach-enter.png` (Knopf ohne Ring)
  und `bilder/tast-anwesenheit-1440-a-10-enter-gespeichert.png`.
- Ein Abhilfevorschlag (nicht umgesetzt): Den Knopf während des Speicherns mit `aria-disabled` statt `disabled` sperren, oder den Fokus
  nach dem Speichern bzw. Senden gezielt setzen. Das gilt ebenso für „Senden“ im Chat.

## Änderungen an Prüfdaten (Vorschau-Datenbank)

- Gruppenchat „[Beispielgruppe] Elifbe am Wochenende“: zwei Prüfnachrichten der Lehrkraft Selin B. um 04:49 und 04:51 Uhr (Berlin):
  „Tastaturprobe Stufe C: …“ und „Tastaturprobe Stufe C (2): …“.
- Anwesenheit Sa 10.10.: zweimal gespeichert, Endstand wie vorgefunden (3× anwesend). Ob vorher schon Einträge gespeichert waren
  oder nur die Vorbelegung angezeigt wurde, ist aus der Oberfläche nicht ersichtlich. Jetzt sind Einträge mit „anwesend“ vorhanden.
- Meldungen wurden keine abgegeben. Die Anwesenheit vom 14.10. ist unverändert.

## Bewertung

| Teil | Status | Kurz |
|---|---|---|
| Z-07 (a) axe Konto-Routen | erfüllt | 7 Routen und 2 Dialogzustände, je 390/1440: 0 kritisch, 0 ernst, auch 0 mittel und 0 gering |
| Z-07 (b) Koran-Wörter | erfüllt | Tab, Pfeile, Pos1/Ende, Enter und Escape wie verlangt, Fokus sichtbar |
| Z-07 (b) Chat | teilweise | Melden öffnen/abbrechen und Schreiben/Senden per Tastatur gehen. F-1: Fokusverlust bei Senden über den Knopf. Kind-Senden zur Prüfzeit gesperrt (S-06), ersatzweise als Leitung belegt |
| Z-07 (b) Anwesenheit | teilweise | Status je Kind per Tastatur gesetzt und gespeichert, Fokus sichtbar. F-2: Fokusverlust nach „Speichern“ |
| **Z-07 Teil Konten/Tastatur gesamt** | **teilweise** | Bedienbar ohne Maus; offen sind F-1, F-2 und Kind-Senden innerhalb 08–20 Uhr |
