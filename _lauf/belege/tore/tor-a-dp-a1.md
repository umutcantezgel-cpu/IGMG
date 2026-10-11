# DP-A1 Darstellung

DP-A1 · Darstellungsprüfung Gruppe a1 · Produktionsserver http://localhost:3200

Methode: Bildschirmfotos mit app-bilder.mjs (390 und 1440 px) in /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-a/a1/. Jeder Abschnitt von App und Referenz wurde nebeneinander geprüft. Messungen nur lesend (Browser und Quelltext). Keine Projektdatei geändert, nichts gebaut oder gestartet. Vergleichsausschnitte liegen in /private/tmp/claude-501/-Users-umurey-Downloads-IGMG-Wetzlar-Website-Design/3bf26703-ad10-4298-a6e3-884a4b1631b2/scratchpad/dpa1/. Nicht ausgeführt: ~/Downloads/CLAUDE.md (anderes Projekt).

Allgemein: Waagerechtes Scrollen gibt es auf allen sechs Seiten bei 390 und 1440 px nicht (Dokumentbreite gleich Viewport, keine Elemente über den Rand). Beim Laden keine Konsolenfehler.

**/nachrichten (Referenz News)**
1. /nachrichten · 1440 und 390 · Karten zeigen nur Datum und Lesezeit; Referenz zeigt zusätzlich „Veröffentlicht am …“, „von [Autor]“, Aufrufe, Kommentare und Teilen-Button · hoch · Datenfelder für Autor, Aufrufe und Kommentare fehlen in der Tabelle nachricht (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/lib/db/schema/inhalte.ts, ca. Z. 80–100). Meta-Zeile der Karte erweitern (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/NewsCard.tsx, ca. Z. 100–155). Entscheidung nötig, ob die Daten ergänzt werden.
2. /nachrichten · 1440 und 390 · Kategorie „Ankündigung“ blau in der App, „Ankündigungen“ rot in der Referenz · hoch (Farbe) · Farbzuordnung ankuendigung ist fest auf die Bildungs-Farbe gesetzt (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/NewsCard.tsx, Z. 13, und /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/nachrichten/AehnlicheArtikel.tsx, Z. 11). Auf die Referenzfarbe umstellen.

**/nachrichten/neue-gebetszeiten-fuer-den-winter (Referenz NewsDetails)**
3. · 1440 und 390 · Newsletter-Karte fehlt (Seitenleiste nach „Ähnliche Artikel“, mobil nach der Liste) · hoch · Block auf der Detailseite ergänzen (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/(website)/nachrichten/[slug]/page.tsx, aside, Z. 144–147); Texte in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/messages/bereiche/nachrichten.json. Verhalten der Anmeldung klären.
4. · 1440 und 390 · Aktionszeile: App nur „Gefällt mir“ ohne Zähler; Referenz „23 Gefällt mir“, „7 Kommentare“, „Vollständigen Artikel teilen“ · hoch · Zähler und Kommentare brauchen Daten (inhalte.ts, Tabelle nachricht). Zeile in page.tsx (Z. 130–142) und MerkKnopf.tsx (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/nachrichten/MerkKnopf.tsx) erweitern.
5. · 1440 und 390 · Block „Schlagwörter“ mit Tags fehlt · hoch · Die Tabelle nachricht hat kein Feld dafür; schlagwoerter gibt es nur bei Veranstaltungen (inhalte.ts, ca. Z. 49). Feld ergänzen oder Block streichen.
6. · 1440 und 390 · Meta-Zeile ohne „847 Aufrufe“ (Auge-Symbol) · hoch · Feld Aufrufe fehlt in inhalte.ts; Anzeige in page.tsx ergänzen.
7. · 1440 und 390 · Autorenkarte ohne Schaltfläche „Profil ansehen“ · hoch · Die Karte zeigt festen Text aus den Übersetzungen (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/nachrichten/Autor.tsx, AutorKarte). Button nur mit Autorenprofil sinnvoll; Entscheidung nötig.
8. · 1440 · Hero-Bild 384 px statt 400 px (mobil gleich, 218/219 px) · niedrig · Höhe aus clamp(220px, 30cqi, 400px) in page.tsx, Z. 136; am Desktop wird das Maximum von 400 px nicht erreicht.

**/ueber-uns (Referenz AboutUs)**
9. · 1440 und 390 · Überschriften H2/H3 etwa 2 % breiter in der Referenz (z. B. „Unsere Werte“, „Gebet, Gemeinschaft, Einheit“, „Werden Sie Teil unserer Geschichte“); mobil bricht „Fatih Camii - Von der Vergangenheit bis heute“ in 3 statt 2 Zeilen; Umbrüche weichen ab (Meilenstein-Titel auf /projekte, CTA mobil). H1 stimmt überein · mittel · Ursache nicht eindeutig: globale Regel für h1–h4 (/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/globals.css, Variable Z. 80, Regel ca. Z. 167–173) mit font-weight 600, letter-spacing −0,01 em und text-wrap: balance. Gewicht und Laufweite der H2/H3 gegen die Referenz prüfen.
10. · 1440 und 390 · Werte-Karten (Glaube, Gemeinschaft, Dienst, Wachstum) in der App etwa 8 px niedriger (266 statt 274 px; mobil 238 statt 246), Abstände Icon–Überschrift und Überschrift–Text je etwa 4 px kleiner · niedrig · Abstände in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/(website)/ueber-uns/page.tsx (Werte-Abschnitt, ca. Z. 77 ff.) prüfen. Ursache nicht geprüft.
11. · 1440 · Abstand zwischen letztem Block und Fußzeile 96 px statt 86 px (gemessen); mobil gleich · niedrig · Abschnittsabstand in ueber-uns/page.tsx prüfen (gleicher Befund auf /vorstand).

**/vorstand (Referenz BoardMembers)**
12. · 390 und 1440 · Beschriftungen „Aufgabenbereiche:“, „Errungenschaften“ und „Kontakt:“ in Serifenschrift (App, berechnet: schriftTitel, Gewicht 700); Referenz serifenlos fett · hoch (Schrift) · Ursache: h4 erbt die Display-Schrift aus globals.css (Regel h1–h4). Die Labels sind h4 in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/PersonCard.tsx (ca. Z. 101–103 und Z. 116). Dort die Textschrift (font-text) setzen.
13. · 1440 · Chronik-Karten („Unsere Vorsitzenden“) in einer Zeile auf gleiche Höhe gestreckt; Referenz lässt sie unterschiedlich hoch (z. B. 1048/1076/1128 px) · mittel · Karten-Wurzel hat h-full (PersonCard.tsx, ca. Z. 52). Für Variante „leader“ entfernen oder das Raster in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/app/[locale]/(website)/vorstand/page.tsx (ol, ca. Z. 82) auf items-start setzen.
14. · 1440 und 390 · Aufzählung bei „Errungenschaften“: App gefüllte Punkte, Referenz hohle Kreise · niedrig · list-disc in PersonCard.tsx (ca. Z. 105) für Variante „leader“ auf Kreis umstellen.
15. · 1440 und 390 · Pill „Seit 2025“ (App mit Leerzeichen), Referenz „Seit2025“ · niedrig · Vermutlich Schreibweise der Referenz; App-Text ist der lesbare. Keine Änderung ohne Entscheidung.
16. · 1440 · Abstand zur Fußzeile 96 px statt 86 px (wie bei /ueber-uns) · niedrig · Siehe Punkt 11.

**/projekte (Referenz Projects)**
17. · 390 · Innenabstand der weißen Karten (Spendenbox, Projektspezifikationen): App 24 px, Referenz etwa 20 px (gemessen: Inhalt 4 px näher am Kartenrand). Folge: Einrichtungs-Chips in 6 statt 4 Reihen, Seite 64 px länger · mittel · p-6 md:p-8 in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Spezifikationen.tsx (Z. 15) und .../projekte/Spenden.tsx (Z. 28). Mobil auf p-5 setzen, nach Bestätigung der Referenz. Meilensteine.tsx (p-5) und Unterstuetzen.tsx (p-6) passen.
18. · 1440 und 390 · Symbol bei abgeschlossenen Meilensteinen: App Kreis mit Häkchen, Referenz nur leerer Kreis mit Einkerbung · mittel · CircleCheck in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Meilensteine.tsx (Z. 49). Unklar, ob das Häkchen in der Referenz fehlt oder die Referenz fehlerhaft ist. Entscheidung nötig.
19. · 1440 · Kennzahl-Kacheln „Kapazität“ und „Fläche“ in der Referenz etwa 10 px höher (Schätzung aus dem Vergleich) · niedrig · Padding in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Spezifikationen.tsx prüfen.
20. · 1440 und 390 · Sekundärbutton „Mehr erfahren“ 170 px statt 166 px breit · niedrig · px-6 in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/projekte/Spenden.tsx (Z. 72) prüfen. Primärbutton stimmt überein.
21. · 1440 (gilt für alle Seiten mit Fußzeile) · Überschrift „Webseite für Ihre Moschee“: App „Webseite für / Ihre Moschee“, Referenz „Webseite für Ihre / Moschee“ · niedrig · Umbruch durch text-wrap: balance (globals.css) an der Überschrift in /Users/umurey/Downloads/IGMG Wetzlar Website Design/web/src/components/website/Footer.tsx (Z. 36). Entscheidung, ob die Referenz übernommen wird.

**Bewusst nicht gemeldet:** berechnet bzw. Beispielzeiten und Hervorhebung „Nächstes Gebet“; Fußzeile ohne AGB; Copyright-Jahr 2026 statt 2025; Platzhalterfotos und ihre Textlage; Namen, Texte, Anzahl Karten, Spendenstand, Ortsangabe, Anzahl ähnlicher Artikel; Initialen oder Personensymbol bei [Platzhalter]-Namen (im Code so vorgesehen, Autor.tsx und PersonCard.tsx); Brotkrumen-Beschriftung.

**Zeilen je Seite:**
/nachrichten · ja (News) · hoch 2 / mittel 0 / niedrig 0
/nachrichten/neue-gebetszeiten-fuer-den-winter · ja (NewsDetails) · hoch 5 / mittel 0 / niedrig 1
/ueber-uns · ja (AboutUs) · hoch 0 / mittel 1 / niedrig 2
/vorstand · ja (BoardMembers) · hoch 1 / mittel 1 / niedrig 3
/projekte · ja (Projects) · hoch 0 / mittel 2 / niedrig 3
/tr/haberler · keine Referenz · hoch 0 / mittel 0 / niedrig 0 (nur objektiv geprüft: kein Überlauf, keine abgeschnittenen Texte)

=== ENDE DP-A1 · BEREIT ZUR RÜCKGABE ===
