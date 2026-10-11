# DP-A3 Darstellung

DP-A3 · Darstellungsprüfung Gruppe a3 · 8 Seiten, je 390 und 1440 px

Vorgehen: App-Bilder mit app-bilder.mjs erzeugt und jede Seite in beiden Breiten abschnittsweise gegen ihre Referenz geprüft. Zur Klärung dienten Vergrößerungen. Die Übersicht hat im Quelltext keine Themenlinks, nur Filter-Buttons. Der Slug „allah“ stammt aus den Themendaten der Übersicht und ist per curl mit HTTP 200 bestätigt. Keine Projektdateien geändert.

**Globale Befunde (in den Seitenzeilen mitgezählt)**

- G1 · Überschriften h2/h4 · 1440 und 390 · ABWEICHUNG: App-Überschriften sind ca. 2 % schmaler und wirken leichter. Übersicht 1440: „Entdecken Sie diese Themen“ 439 statt 448 px, „Empfohlene Artikel“ 207 statt 211 px, Kartentitel „Allah - Wer ist Gott im Islam?“ 303 statt 309 px. Bei 390 bleibt dieser Titel einzeilig statt zweizeilig. H1 „Den Islam verstehen“ stimmt in der Breite überein. · STUFE: mittel · VORSCHLAG: Ursache im Code ist `--tracking-titel: -0.01em` (src/app/globals.css Zeile 80) zusammen mit font-weight 600 in der h1–h4-Regel (Zeilen 169–173). Laufweite für h2–h4 auf 0 setzen und das Gewicht prüfen, da die Referenz vermutlich kräftiger ist.
- G2 · Zeilenumbruch · 1440 und 390 · ABWEICHUNG: text-wrap: balance bricht Überschriften anders. 1440 Footer „Webseite für / Ihre Moschee“ (Referenz „Webseite für Ihre / Moschee“). 390 „Entdecken Sie / diese Themen“ (Referenz „Entdecken Sie diese / Themen“) und Kartentitel wie „Dschihad - Was / bedeutet das wirklich?“. Die Referenz trennt zudem Silben („tägli-chen“), die App nicht. · STUFE: niedrig · VORSCHLAG: balance für Titel abschalten oder auf Kurztitel begrenzen. Datei: src/app/globals.css Zeile 173, src/components/website/Footer.tsx.

**Seitenbefunde**

- F1 · Gebetszeiten (/gebetszeiten) · 390 und 1440 · ABWEICHUNG: Standort-Feld ohne Auswahlpfeil (Referenz: Pfeil rechts). App-Feld 66 statt 57 px hoch, bei 1440 240 statt 276 px breit. · STUFE: hoch (Element fehlt) · VORSCHLAG: Laut Code bewusst fest auf Wetzlar (Kommentar „der Standort ist fest Wetzlar“). Entscheidung nötig: Pfeil als inaktives Element ergänzen oder die Abweichung dokumentieren. Datei: src/app/[locale]/(website)/gebetszeiten/page.tsx
- F2 · Gebetszeiten · 390 und 1440 · ABWEICHUNG: Jede Gebetskarte reserviert die Zeile „Nächstes Gebet“. App-Karten 219–221 px hoch, Referenz 186 px. Bei 390 je Karte +34 px, bei 1440 liegt die Fußzeile 40 px tiefer. · STUFE: mittel · VORSCHLAG: Laut Code bewusst (K-12, kein Springen). Entscheidung nötig: Zeile nur bei der markierten Karte oder Höhe über min-height lösen. Datei: src/components/website/gebetszeiten/GebetszeitenSeite.tsx (Kartenraster ab Zeile 107, Kommentar Zeile 45)
- F3 · Gebetszeiten · 390 und 1440 · ABWEICHUNG: Qibla-Symbol im Tab und in der Zeile „Qibla: 128°“ ist ein Kompass, die Referenz zeigt ein eigenes Symbol. · STUFE: niedrig (Icon) · VORSCHLAG: Referenz-Symbol übernehmen. Dateien: src/components/website/gebetszeiten/GebetszeitenTabs.tsx (Zeile 10), GebetszeitenSeite.tsx (Zeile 84)
- F4 · Übersicht und Themenseite · 390 und 1440 · ABWEICHUNG: Such-Icon zeigt Lupe mit Griff, die Referenz nur einen Kreis. · STUFE: niedrig (Icon) · VORSCHLAG: Referenz-Symbol übernehmen. Dateien: src/components/website/wissen/WissenInsel.tsx (Zeile 140), ThemaInsel.tsx (Zeile 133)
- F5 · Impressum und Datenschutz · 390 und 1440 · ABWEICHUNG: Gelber Hinweiskasten „Entwurf – rechtliche Prüfung ausstehend“ zwischen Hero und Karten, in der Referenz nicht vorhanden. Kasten 1440 ca. 130 px, 390 ca. 215 px hoch. · STUFE: mittel (zusätzliches Element) · VORSCHLAG: Laut Code bewusst (Entwurfskennzeichnung auf jeder Rechtsseite, G-08). Entscheidung nötig: beibehalten und Referenz ergänzen oder nur im Entwurfsmodus zeigen. Datei: src/components/website/rechtliches/Rechtstext.tsx (Zeilen 31–32)
- F6 · Voranmeldung (/bildung/voranmeldung) · 390 und 1440 · ABWEICHUNG: Optionskarten haben in der Beschreibung ca. 24 px Zeilenabstand statt 21 px. Karten 5–6 px höher (1440: 123 statt 118 px, 390: 98 statt 92 px). · STUFE: niedrig · VORSCHLAG: Zeilenhöhe der Beschreibung an die Referenz angleichen. Datei (vermutet): src/components/formular/Felder.tsx
- F7 · Voranmeldung · 390 · ABWEICHUNG: Schrittleiste, Beschriftung „Einverständniserklärungen“ in 7 statt 6 Zeilen (Silbentrennung „run-gen“). · STUFE: niedrig · VORSCHLAG: Datei (vermutet): src/components/formular/FormWizard.tsx

**Befunde je Seite (hoch / mittel / niedrig)**

- Gebetszeiten (/gebetszeiten) · Referenz: ja (PrayerTimes, Standardzustand). State-Referenzen locOpen, tab-monthly, tab-qibla, tab-settings nicht verglichen, da app-bilder nur den Standardzustand erfasst. · 1 / 1 / 2 (F1; F2; F3, G2)
- Islamisches Wissen (/islamisches-wissen) · Referenz: ja (IslamicKnowledge, Standardzustand). State-Referenzen tab-scholars, tab-videos nicht verglichen. · 0 / 1 / 2 (G1; G2, F4)
- Themenseite (/islamisches-wissen/allah) · Referenz: keine eigene. Gemeinsame Teile gegen IslamicKnowledge geprüft. Filterleiste „Gefiltert nach“, Häkchen-Chip und Hero ohne Untertitel: keine Referenz. · 0 / 1 / 2 (G1; G2, F4)
- Impressum (/impressum) · Referenz: ja (Rechtliches). · 0 / 1 / 1 (F5; G2)
- Datenschutz (/datenschutz) · Referenz: ja (Rechtliches). Kopf und Karten verglichen, Fließtext nur stichprobenweise. · 0 / 1 / 1 (F5; G2)
- Seite nicht gefunden (/gibt-es-nicht) · Referenz: keine. Nur Layout geprüft, unauffällig. · 0 / 0 / 1 (G2)
- Offline (/offline) · Referenz: keine. Nur Layout geprüft, unauffällig. · 0 / 0 / 1 (G2)
- Voranmeldung (/bildung/voranmeldung) · Referenz: ja (StudentRegistration, Schritt 1). Schritte 2–4 und Zustände sind nicht im Bild. · 0 / 0 / 3 (F6, F7, G2)

**Nicht gemeldet**

- Bekannt oder gewollt: „berechnet“ statt „Beispielzeiten“, Datum, Uhrzeiten, Qibla-Werte und „Nächstes Gebet“ (Browser-Zustand). Fußzeile ohne AGB. Brotkrumen-Zwischenschritte „Wissen“ und „Bildung“ (bei 390 zweizeilig).
- Beispieldaten oder Text: „Aufgang“ statt „Sonnenaufgang“, Autorennamen als „[Name – Autor/in n]“, Copyright-Jahr 2026 statt 2025, Platzhalter in eckigen Klammern.

**Hinweise (keine Befunde)**

- Struktur: Die Rechtliches-Referenz zeigt Datenschutz, Impressum und AGB auf einer Seite. Die App trennt /impressum und /datenschutz, eine AGB-Karte gibt es dort nicht. Bitte bestätigen, ob das gewollt ist.
- Inhalt: Der Datenschutz-Text enthält im Klartext den internen Verweis „Bestand (Blatt S23)“, der öffentlich sichtbar ist.
- Technisch: Unbekannte Adressen liefern HTTP 200 statt 404 (/gibt-es-nicht und zum Vergleich /xq7-nicht-vorhanden-test).
- Gemessen: Waagerechtes Scrollen gibt es auf allen 8 Seiten bei 390 und 1440 px nicht (Dokumentbreite = Viewport).
- Nicht vermessen: Serif-Überschriften auf Rechtliches und Voranmeldung (G1 nur an der Übersicht gemessen).

Belege: App-Bilder /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/app/tor-a/a3/, Referenzen /Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/belege/referenz/, Zuschnitte und Messskripte /private/tmp/claude-501/-Users-umurey-Downloads-IGMG-Wetzlar-Website-Design/3bf26703-ad10-4298-a6e3-884a4b1631b2/scratchpad/dp-a3/

=== ENDE [DP-A3] · BEREIT ZUR RÜCKGABE ===
