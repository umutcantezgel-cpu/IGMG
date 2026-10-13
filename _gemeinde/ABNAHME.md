# ABNAHME v1.0 – Gemeinde-Plattform

Kriterien aus AUFTRAG §7. Status: offen / teilweise / erfüllt / AUSNAHME (mit Ersatz). UMGEBUNGSAUSNAHMEN: echte Geräte/iOS,
Docker-E2E, Vorschau ohne Datenbank, echte Push-Zustellung, Centrifugo ohne öffentliche Adresse – jeweils mit Ersatzbeleg.

| Z | Thema | Schwelle | Status | Beleg |
|---|---|---|---|---|
| Z-01 | Plan | 100 % Pflicht, Kür nach Priorität, PLAN mit Commits | offen | `_gemeinde/PLAN.md` |
| Z-02 | Bestand | Suiten mindestens wie E0, F-01…F-60 ohne Rückschritt, 0 neue Konsolenfehler | offen | |
| Z-03 | Designsystem | 0 freie Werte in geänderten Dateien | offen | `freie-werte` |
| Z-04 | Gestaltung | 12 neue Hauptansichten ≥ 8 im Blindvergleich, keine Kategorie < 7 | offen | |
| Z-05 | Bewegung | B-01…B-27 im Register; reduziert ohne Lage/Größe; Momente ≤ 5 % verworfene Bilder | offen | |
| Z-06 | Grafik | eine Icon-Familie, eindeutige IDs, zugänglich | offen | |
| Z-07 | Zugänglichkeit | 0 ernste/kritische axe-Befunde auf allen neuen Routen; Koran-Wörter, Chat, Anwesenheit per Tastatur | offen | |
| Z-08 | Leistung | öffentlich ≤ 180 KB, LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (auch `/quran/2`); Mein Bereich ≤ 230 KB | offen | |
| Z-09 | Darstellung | 390/768/1440, de/tr voll, Harakat nicht abgeschnitten | offen | |
| Z-10 | Übergabe | BERICHT (Vorführpfad, Galerie), KERN 3.x, MENSCHEN, Handbücher, Zusammenführen/Zurückrollen | teilweise | KERN 3.0, MENSCHEN |
| Z-11 | Vercel | V-01…V-13 erfüllt, Build mit Daten grün, Audio-Rewrite belegt | offen | |
| Z-12 | Recht/Startklar | Bestandstexte unverändert, neue als Entwurf, Cockpit-Prüfungen | offen | |
| Z-13 | Konten/Rechte | 100 % generierte Matrix inkl. Gruppen; 0 offene hohe/kritische Befunde S1–S3 | teilweise | `tests/unit/rechte/*` |
| Z-14 | Kinderschutz | S-01…S-18 jeweils mit Test oder Beleg | offen | |
| Z-15 | Religiöse Inhalte | SHA + Rundreise 6.236 Verse; 0 ungeprüfte religiöse Inhalte öffentlich; `religion-pruefung` 0 | teilweise | `tests/unit/quran-daten.test.ts`, `religion-pruefung.mjs` grün |
| Z-16 | Koran/Rezitation | E2E: Lesen, Übersetzung, Wortkarte, Tajwid, Player, Werkstatt, Offline | offen | |
| Z-17 | Lernplattform | E2E-Kette Voranmeldung → Aufnahme → Eltern → Kind → Gruppe → Anwesenheit → Fortschritt | offen | |
| Z-18 | CMS | Seite, Menü, Revision, Weiterleitung, Zeitplan, Freigabe, Anzeige-Folie ohne Entwickler | offen | |
| Z-19 | Standort/Datenfluss | Koordinaten nie im Netz; Geolocation nur auf Gebetszeiten; Push nur nach Opt-in; 0 Drittanfragen | teilweise | `kopfzeilen-pfade.test.ts` |
| Z-20 | Betrieb | Produktionsschalter sicher; Kit lauffähig | teilweise | `funktionen.test.ts` |
| Z-21 | Moschee 2026 | 0 Aussagen „geplant/Zukunft“ zum Gebäude; Status fertiggestellt; Fakten als Platzhalter | offen | |
