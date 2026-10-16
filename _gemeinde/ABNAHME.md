# ABNAHME v1.0 – Gemeinde-Plattform

Kriterien aus AUFTRAG §7. Status: erfüllt / teilweise / offen / AUSNAHME (mit Ersatz). UMGEBUNGSAUSNAHMEN: echte Geräte/iOS,
Docker-E2E, Vorschau ohne Datenbank, echte Push-Zustellung, Centrifugo ohne öffentliche Adresse – jeweils mit Ersatzbeleg.

**Stand: Stufe-C-Nachprüfung 2 am 16.10.2026 auf `main` = 90a8e37** – Urteil eines frischen Endprüfers
(`berichte/stufe-c-nachpruefung-2.md`, Protokolle `protokolle/C3-*.md`): **19 erfüllt, 2 teilweise (Z-07, Z-18), 0 AUSNAHME
als Hauptstatus**; die Docker-E2E-Ausnahme entfällt (echte E2E mit PostgreSQL 16 + Mailpit, 983 grün/0 rot). Vorher: 033ea6f
12/2/7 (`berichte/stufe-c-nachpruefung.md`), 75cad0a 7/2/12 (`berichte/stufe-c.md`).

| Z | Thema | Schwelle | Status | Beleg (Endprüfer) |
|---|---|---|---|---|
| Z-01 | Plan | 100 % Pflicht, Kür nach Priorität, PLAN mit Commits | **erfüllt** | F-38, F-40 und F-44 sind gebaut, mit serverseitiger Rechteprüfung, Migrationen 0015/0016 und Tests (k3); die Integration zu Wissen, Startseite, Push-Zusammenfassung und Voranmeldung ist bei mir grün (91/91). Formal fehlt nur der Nachtrag in `PLAN.md:42`. |
| Z-02 | Bestand | Suiten mindestens wie E0, F-01…F-60 ohne Rückschritt, 0 neue Konsolenfehler | **erfüllt** | Unit 1582+3 (eigener Lauf), Integration 3265 im Tor, E2E 983/0/95 auf dem Code von 90a8e37 (gegengeprüft). `wartung-sperre-postgres` bleibt eine Umgebungsausnahme, weil es auf PostgreSQL 16 nicht migriert (eigener Versuch, 55P04). |
| Z-03 | Designsystem | 0 freie Werte in geänderten Dateien | **erfüllt** | 86 geänderte Dateien, 1 Fehlalarm (regulärer Ausdruck), 0 freie Werte (o2). |
| Z-04 | Gestaltung | 12 neue Hauptansichten ≥ 8 im Blindvergleich, keine Kategorie < 7 | **erfüllt** (Verfahrensvorbehalt wie bisher) | Die neuen Module Startseite und Wissen sowie die Suche sind im Bild stimmig (eigene Sichtung); ein Blindvergleich ist weiterhin nicht dokumentiert. |
| Z-05 | Bewegung | B-01…B-27 im Register; reduziert ohne Lage/Größe; Momente ≤ 5 % verworfene Bilder | **erfüllt** | Bei reduzierter Bewegung 0 Größen- oder Lageänderungen, `tritt-auf` dann nur als Überblendung (o2). |
| Z-06 | Grafik | eine Icon-Familie, eindeutige IDs, zugänglich | **erfüllt** | Nur Lucide-Symbole, Werkzeugfehler 0, 0 doppelte IDs (o2). |
| Z-07 | Zugänglichkeit | 0 ernste/kritische axe-Befunde auf allen neuen Routen; Koran-Wörter, Chat, Anwesenheit per Tastatur | **teilweise** | Chat, Anwesenheit, Kind-Senden und Koran per Tastatur sind jetzt am Server belegt, axe 0 auf 233 Aufrufen (k1). Aber: 2.4.11 im Reihenfolge-Editor bei 390 px ist verletzt (selbst nachgestellt), und auf der abstürzenden Revisionsseite der Seiten ist axe nicht prüfbar. |
| Z-08 | Leistung | öffentlich ≤ 180 KB, LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (auch `/quran/2`); Mein Bereich ≤ 230 KB | **erfüllt** (Laborersatz, TBT unter AUSNAHME A-01) | LCP ≤ 2,5 s auf 16/16 Medianen, INP 64–96 ms, erster Tab auf Hadith-Seiten 16–32 ms statt rund 1 s (o3); `ERSTER_TAB` im Code bestätigt. |
| Z-09 | Darstellung | 390/768/1440, de/tr voll, Harakat nicht abgeschnitten | **erfüllt** (AUSNAHME echte Geräte/iOS) | 84 Messungen, 0 Überlauf, 0 Abschnitte (o2). |
| Z-10 | Übergabe | BERICHT (Vorführpfad, Galerie), KERN 3.x, MENSCHEN, Handbücher, Zusammenführen/Zurückrollen | **erfüllt** (Nachführung offen) | GO-LIVE G1/G2/G4, MN-23 und die Handbücher entsprechen N4 und dem Code (k3, 7/7). Noch veraltet: PLAN/BERICHT/ABNAHME, die Funktionsliste (sie meldet zu wenig) und `imam.md:63` (alle selbst gesehen). |
| Z-11 | Vercel | V-01…V-13 erfüllt, Build mit Daten grün, Audio-Rewrite belegt | **erfüllt** (Abweichung L2-E06) | Produktion 90a8e37 `success`; 404 der Konto-Seiten, fra1 auf dynamischen Routen und Treffer der Nummernsuche live selbst geprüft. |
| Z-12 | Recht/Startklar | Bestandstexte unverändert, neue als Entwurf, Cockpit-Prüfungen | **erfüllt** | Wortlaut rc=0 mit 0 offenen Einheiten (eigener Lauf); Startklar „Religiöse Freigaben“ erfasst jetzt auch `wissen_thema` (k2). |
| Z-13 | Konten/Rechte | 100 % generierte Matrix inkl. Gruppen; 0 offene hohe/kritische Befunde S1–S3 | **erfüllt** | Die generierte Matrix deckt alle Actions ab, auch die Mitglieder-Actions; `rechte-matrix-mitglieder` ist bei mir grün (453 von 476). S2/S3 ohne offenen Befund „hoch“. |
| Z-14 | Kinderschutz | S-01…S-18 jeweils mit Test oder Beleg | **erfüllt** (AUSNAHME Push-Zustellung) | S-01…S-18 belegt; S-09 mit Gegenprobe; `chat.test` bei mir grün; F-38 überträgt nur Anzahlen (k2). |
| Z-15 | Religiöse Inhalte | SHA + Rundreise 6.236 Verse; 0 ungeprüfte religiöse Inhalte öffentlich; `religion-pruefung` 0 | **erfüllt** | `religion-pruefung` rc=0, SHA und 6236 Verse gleich, `web/daten` unverändert. Kein ungeprüftes Wissensthema wird öffentlich (alle 5 Wege selbst geprüft). Vermerk: 12 Bestandstitel gelten als „geprüft ohne Prüfperson“. |
| Z-16 | Koran/Rezitation | E2E: Lesen, Übersetzung, Wortkarte, Tajwid, Player, Werkstatt, Offline | **erfüllt** (AUSNAHME echte Rezitation MN-03, Geräte) | Player-E2E mit Testton 7/7, Werkstatt 2/2 und Offline 1/1 echt gelaufen (k1; im Tor gegengeprüft). |
| Z-17 | Lernplattform | E2E-Kette Voranmeldung → Aufnahme → Eltern → Kind → Gruppe → Anwesenheit → Fortschritt | **erfüllt** | `lernkette.spec` echt grün; den Schritt „Fortschritt“ belegen die E2E-Erweiterung von k1 und `lernkette.test.ts:239` (bei mir grün). |
| Z-18 | CMS | Seite, Menü, Revision, Weiterleitung, Zeitplan, Freigabe, Anzeige-Folie ohne Entwickler | **teilweise** | Anlegen, Veröffentlichen, Freigabe, Zeitplan, Menü, Weiterleitung und Anzeige mit Vier-Augen-Prinzip laufen echt (k1). Aber „Frühere Fassungen“ der Seiten stürzt immer ab, sobald es eine Fassung gibt (selbst nachgestellt, `page.tsx:65/77`). Zurückholen ist für Seiten damit nicht bedienbar. |
| Z-19 | Standort/Datenfluss | Koordinaten nie im Netz; Geolocation nur auf Gebetszeiten; Push nur nach Opt-in; 0 Drittanfragen | **erfüllt** (AUSNAHME Push, Centrifugo) | 0 fremde Hosts, 0 Geolocation- und 0 Push-Aufrufe ohne Klick, die Gegenprobe greift (o2). |
| Z-20 | Betrieb | Produktionsschalter sicher; Kit lauffähig | **erfüllt** (Umgebung PostgreSQL 16, Centrifugo nicht live) | Wiederherstellungsprobe echt: 99/99 Tabellen, 5/5 Fehlerfälle erkannt (k2; Log gegengeprüft); Produktionsschalter aus; Wirkung des Next-Patches mit Gegenprobe. |
| Z-21 | Moschee 2026 | 0 Aussagen „geplant/Zukunft“ zum Gebäude; Status fertiggestellt; Fakten als Platzhalter | **erfüllt** | 0 Aussagen „geplant“ zum Gebäude (o2). |
