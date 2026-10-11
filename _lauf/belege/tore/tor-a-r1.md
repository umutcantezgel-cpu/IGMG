# Rückgabe R1 Typografie und Karten

Kennung R1 · Tor-A-Reparatur Typografie und Karten

GEÄNDERTE DATEIEN
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/kontakt/Anfahrt.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/PersonCard.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/(website)/vorstand/page.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/igmg/Ueberblick.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/NewsCard.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/nachrichten/AehnlicheArtikel.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Spezifikationen.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Spenden.tsx
- /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/fuss/JetztGeoeffnet.tsx
- Bildschirmfotos: /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-a-reparatur/R1/

UMSETZUNG (kurz)
- K1 Anfahrt.tsx: Wegtitel (h3) mit `font-text tracking-normal`, `font-bold` bleibt.
- Nr. 12 PersonCard.tsx: Labels „Aufgabenbereiche/Errungenschaften“ und „Kontakt“ (h4) mit `font-text tracking-normal`.
- Nr. 14 PersonCard.tsx: Liste der Variante leader mit `list-[circle]`, board bleibt `list-disc` (cn, Server-Komponente).
- Nr. 13 vorstand/page.tsx: Raster der Vorsitzenden (ol) mit `items-start`. Das `h-full` in PersonCard wirkt dadurch nicht mehr auf die Höhe, die Karten sind inhaltsabhängig hoch.
- I1 Ueberblick.tsx: `tabular-nums` am Kennzahl-dd entfernt.
- Nr. 2 NewsCard.tsx und AehnlicheArtikel.tsx: `ankuendigung` von `bg-tag-bildung-bg text-tag-bildung` auf `bg-tag-wichtig-bg text-tag-wichtig`. Die Zuordnung ist in beiden Dateien identisch.
- Nr. 17 Spezifikationen.tsx und Spenden.tsx: `p-6 md:p-8` → `p-5 md:p-8`.
- G2 JetztGeoeffnet.tsx ('use client', kein cn-Import): CircleX → Ban (lucide-react 1.54.0).
- Keine Hex-Werte, keine neuen Texte, keine neuen Abhängigkeiten.

PRÜFUNGEN
- `pnpm exec tsc --noEmit -p .` (in web/): Exit 0, keine Ausgabe, also 0 Fehler.
- `pnpm exec eslint` auf die 9 Dateien: Exit 0, keine Befunde.
- `pnpm sprachen:pruefen`: Exit 0, „Sprachdateien vollständig: 922 Schlüssel in de, tr, en; dazu 243 Schlüssel der Verwaltung (nur de, ADR 0016).“
- `pnpm exec prettier --write` auf die 9 Dateien: alle „(unchanged)“.
- `node ../_lauf/werkzeuge/app-bilder.mjs http://127.0.0.1:3000 ../_lauf/belege/app/tor-a-reparatur/R1 …` (/kontakt, /vorstand, /igmg, /nachrichten, /projekte, Detailseite): „fertig“. Konsolenmeldungen nur der HMR-WebSocket des Dev-Servers, keine Seitenfehler.
- Vergleich mit der Referenz:
  - /kontakt: Anfahrt-Titel serifenlos fett wie Contact. Erfüllt.
  - /vorstand: Labels serifenlos fett, Errungenschaften mit hohlen Kreisen (Ausschnitt geprüft), Chronik-Karten unterschiedlich hoch wie BoardMembers. Erfüllt.
  - /igmg: Textbreite „518“ von 68,3 px auf 59,4 px, optisch wie Referenz. Erfüllt.
  - /projekte: berechneter Innenabstand 20 px bei 390 px und 32 px ab 768 px. Chips in 5 statt 4 Reihen (siehe Abweichungen).
  - Fußzeile: Symbol und Statustext im Lauf nicht sichtbar (siehe Offene Fragen). Die Icon-Form stimmt: lucide Ban ist Kreis mit Diagonale, wie im Referenzausschnitt.
  - /nachrichten: nicht bestätigt (siehe Offene Fragen).

ABWEICHUNGEN VOM DESIGN mit Grund
- Geschlossen-Symbol: Footer.dc.html und Icon.dc.html nennen `circle-x` (X im Kreis). Das Referenzbild zeigt einen Kreis mit Schrägstrich. Umgesetzt wie Referenzbild.
- Ankündigung: NewsCard.dc.html (Standardtabelle CAT) färbt „Ankündigung“ blau, News.dc.html (Tonwahl „rot“) und Befund Nr. 2 verlangen rot. Umgesetzt rot (tag-wichtig). Folge: Ankündigung und Wichtig haben dieselbe Farbe, unterschieden nur durch den Text.
- Projektchips: 5 statt 4 Reihen bei 390 px. Restdifferenz nach dem Padding-Fix, Ursache nicht geklärt, nicht im Auftrag.
- Chronik: statt `h-full` für leader zu entfernen, `items-start` im Raster. Ergebnis wie Referenz.
- Kennzahlen: Die Vermutung aus DP-A2 I1 (Mono-Regel in globals.css) trifft nicht zu, globals.css enthält keine Mono-Regel. Ursache war `tabular-nums`.

OFFENE FRAGEN
1. Fußzeile live: Im Dev-Lauf hydriert die Seite nicht (auf /kontakt trägt nur 1 von 753 DOM-Elementen einen React-Schlüssel). „Jetzt:“ zeigt deshalb nur den unsichtbaren Platzhalter. Bitte im Browser prüfen: „Geschlossen“ mit Kreis und Schrägstrich.
2. /nachrichten und Startseite: Der Dev-Server liefert derzeit HTTP 500. Das Dev-Log zeigt „Failed query“ auf die Tabelle `kurs` (die Abfrage enthält u. a. die Spalte `hinweis`). Ursache nicht geprüft, vermutlich Schema- oder Migrationsstand außerhalb dieser Dateien. Der Screenshot nachrichten__1440.png von 07:04 zeigt noch blaue Ankündigung-Tags, also einen veralteten Render und keinen Beleg. Die Farbe in NewsCard und AehnlicheArtikel ist damit nicht live bestätigt. Neuer Lauf nötig, sobald die Seite wieder rendert.
3. Designquelle widerspricht dem Referenzbild (`circle-x` in Footer.dc.html und Icon.dc.html). Soll die Quelle angeglichen werden?
4. Nicht im Paket R1 und nicht geändert: G1 (Kartenkopf-Abstand, z. B. Anfahrt, Überblick, Organisationsseiten), Abstand zur Fußzeile 96 statt 86 px (vorstand, igmg, ueber-uns), Umbruch „Webseite für Ihre Moschee“ (DP-A2 G3), Schreibweise „Seit 2025“ (DP-A1 15), Kartenplatzhalter-Text (K2).
5. Nebeneffekt: `tsc` hat web/tsconfig.tsbuildinfo aktualisiert (in .gitignore). Kein Commit, kein Build, keine weiteren Dateien geändert.

=== ENDE R1 · BEREIT ZUR RÜCKGABE ===
