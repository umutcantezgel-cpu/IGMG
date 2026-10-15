# PLAN – Pakete und Stand (Gemeinde-Plattform)

| Etappe | Paket | Inhalt | Stand | Commit |
|---|---|---|---|---|
| E0 | O-E0 | Sofortstart, Werkstatt `_gemeinde/`, CLAUDE.md-Block | fertig | 550ad03 |
| E0 | H-E0-K01…K05, B01 | Kundschafter, Datensätze mit SHA + QUELLE | fertig | 363dc79 |
| E1 | O-F02/F03 | Datenmodell (96 Tabellen), Migration 0008/0009, Rechte, Gruppen, Sitzungsgrenzen | fertig | 855ed35 |
| E1 | O-F04 | Funktionsschalter, Cache-Tags, Permissions-Policy je Pfad, Konto-CSP, Sprachbereiche | fertig | 2fe014f, bfd0931 |
| E1 | H-F01–F03 | Inhaltsimport Koran/Tajwid/Übersetzungen/Bukhari, Bau-Datenbank, Vercel-Bau | fertig | 1c476f5 |
| E1 | O-F01 | KERN 3.0, MENSCHEN, ABNAHME, PLAN, Religion-Prüfung | fertig | 53e78ad |
| E1/E3 | H-I01, H-R01, H-D01 | Moschee 2026, /quellen, /barrierefreiheit, Hadith-Seiten (Teilseiten je 100) | fertig | 08cad02 |
| E2 | O-Q01, H-Q01, H-Q02 | Koran-Leser (Referenz), JSON-Routen, Übersicht/Cüz/Tajwid | fertig | 287d50e |
| E2 | O-A01, O-A02, H-T01 | Konten-Kern, Mein Bereich, Tests; S1 behoben | fertig | be5e405, 27652ee |
| E3 | O-E01, H-E01–E03 | Elifbe, Schreibweg B-17, Übungen, /lernen | fertig | 35ec4a1 |
| E3 | H-G01 | Gebetszeiten „Mein Ort“ | fertig | f237396 |
| E3 | O-L02 | Unterrichts-Kern (Termine, Anwesenheit, Fortschritt, Hifz, Fehlmeldung) | fertig | 5b0b9ca |
| E3 | O-L01, H-L01–L07 | Aufnahme/Einwilligung, Verwaltung Lernen (Migration 0011), Mein Bereich Unterricht/Kinder/Schüler | fertig | 9e4896e, 785afc8 |
| E4 | O-C01 | Chat-Kern mit Kinderschutz S-01…S-17 | fertig | dbd22c0 |
| E4 | H-C01/C02 | Chat-Oberfläche, Moderation, Kinderschutz-Modul | fertig | 785afc8, 27652ee |
| E4 | O-M01, H-M01–M04 | CMS (Blöcke, Seiten, Menüs, Weiterleitungen, Freigaben) | fertig | edb16d7 |
| E4 | O-Q02, H-Q03–Q06 | Wortbedeutungen/Tajwid-Pflege, Rezitations-Werkstatt | fertig | a0b13d9, a88841b |
| E4 | O-P01, H-P01 | Web Push (RFC 8291/8292, Abo, Takt, SW, Einstellungen) | fertig | 6212cd3 |
| E5 | H-K01/K03/K04 (Kern) | Hatim, besondere Tage, GiroCode | fertig | 651f7a9, 06f447b |
| E5 | H-K01–K04, K06 | Kür A: Hatim, Kalender, Ramadan, Spenden, Newsletter, Gemeinde im Blick | fertig | 4fc7d9f |
| E5 | O-B01, H-B01–B08 | Bewegung (Register B-13…B-27), SVG je Route | fertig | 1281d68 |
| E5 | H-B09 | Erzählansichten (Startseite „eröffnet“, Fastenbogen B-20, Über uns, Cüz-Ring) | fertig | a99f21b |
| E5 | O-K05 | Anzeige-CMS, Vers/Hadith des Tages | fertig | b4c1a9a |
| E6 | O-S01, H-S01 | Kit lokaler Server | fertig | bb8433d |
| E6 | O-C02 | Echtzeit-Signal | fertig | 428da97 |
| E6 | H-R02/R03 | Rechtsentwürfe, Handbücher | fertig | 8b465f3 |
| E6 | H-O01 | Offline-Koran (Sure/Cüz speichern) | fertig | 6b58403 |
| E6 | H-X01/X02, D-14…D-17 | Bestandslücken (K-29), Mail bei Passkey/2FA, Datenschutz-Befunde, Löschkonzept L-08/L-14/L-15 | fertig | 1c8117e, b4c1a9a, 4aff0f4 |
| E7 | – | Archiv des Vorlaufs nach `_archiv/lauf-gestaltung-2026-10/`, GO-LIVE Abschnitt G | fertig | 9280fb3, 839024f |
| E7 | L2-E04 | Vercel-Import ohne Handgriffe (beide `vercel.json`, Wächter im Stamm) | fertig | e66ee4e, 628b981, 942b385, b5441c0 |
| E7 | Sichtabnahme Z-04 | Runde 1 und Befundpakete 1–4, Runde 2, Feinschliff Runde 3 | fertig | ea80fee, f1b951f, b799038, a95ec09, 008cb48; daef8f6, 49622d7, 4115a5e; 4ba5a9b, d4f53e3, 75cad0a |
| E7 | Stufe C | Endprüfung Z-01…Z-21 (Urteil `berichte/stufe-c.md`), Galerie | fertig | b241611, 39f03da |
| E7 | N3 | Nacharbeit Stufe C: Push „Ankündigung“, Centrifugo-Namensraum, L2-E06 Audio, Wortlaut-Ausnahmen, Cockpit „Religiöse Freigaben“, Handbücher, Funktionsliste | fertig | 439e1d4, 88c40f3, c92dce5, 22640a0, eef0cfb und Abschluss-Commit „Nacharbeit Stufe C, N3“ |
| E7 | – | weitere Nacharbeit Stufe C (N1, N2, N4), BERICHT, ABSCHLUSS | in Arbeit | |
