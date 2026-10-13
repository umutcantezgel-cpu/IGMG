# MENSCHEN – Gemeinde-Plattform (was nur Menschen entscheiden oder tun können)

Format: Kennung · Aufgabe · Wer · Aufwand · Standard bis zur Antwort · Stand. Die Liste des Vorlaufs (`_werkstatt/MENSCHEN.md`,
`_lauf/MENSCHEN.md` M-001…M-098, ML-…) gilt weiter. Alles hier läuft mit der Standardannahme weiter (L2-E01, kein Warten).

| ID | Aufgabe | Wer | Aufwand | Standard bis zur Antwort | Stand |
|---|---|---|---|---|---|
| MN-00 | Neon-Datenbank für die Vorschau anlegen (`DATABASE_URL` in Vercel Preview) | Technik | 20 min | Vorführung lokal bzw. mit Bau-Datenbank (PGlite) | offen |
| MN-01 | Bedingungen Tanzil (Text CC BY 3.0, Übersetzungen nicht-kommerziell) und quran-tajweed (CC BY 4.0) bestätigen | Vorstand | 10 min | Ja (Gemeinde-Website ist nicht kommerziell) | offen |
| MN-02 | Koranübersetzungen wählen und je Ausgabe freigeben (de/tr/en). QuranEnc war aus der Cloud nicht erreichbar; Übergang: Tanzil de.bubenheim, tr.diyanet, en.sahih (importiert, **nicht aktiv**). Für Diyanet und Saheeh International liegen die Rechte bei den Herausgebern | Imam / Irşad | 30 min | Produktion zeigt nur Arabisch + „Übersetzung folgt“; Vorschau zeigt den Übergang mit „Freigabe ausstehend“ | offen |
| MN-03 | Rezitation Fatiha + Cüz 30 aufnehmen, Vereinbarung über Rechte und Stimme unterschreiben | Imam / Hafız | 2–4 h + 2–3 h Abgleich | Leser zeigt „Rezitation unseres Imams folgt“ | offen |
| MN-03b | Erlaubnis eines bekannten Rezitators oder Verlags für eine Gesamtrezitation | Vorstand | Wartezeit | nur eigene Aufnahmen | offen |
| MN-04 | Tajwid-Regeltexte de/tr verfassen (18 Regeln) und Basmala-Darstellung bestätigen | Hoca | ≈ 6 h | Fachname + Platzhalter „[Erklärung – von der Lehrkraft]“ | offen |
| MN-05 | Wortbedeutungen (zuerst Cüz 30) verfassen und freigeben; Liste „Vers des Tages“ | Hoca | laufend | „Bedeutung noch nicht erfasst“ | offen |
| MN-06 | Hadith: Nutzung des arabischen Bukhari-Volltexts (fawazahmed0/hadith-api, Unlicense; Ursprung sunnah.com) rechtlich prüfen; Auswahl übersetzen und freigeben | Vorstand / Imam / Rechtsberatung | 1 h + laufend | Volltext nur in der Vorschau (Schalter `hadith_gesamt` in Produktion aus); öffentlich nur die freigegebene Auswahl | offen |
| MN-07 | Elifbe-Lehrplan (Stationen), Aufnahmen der Buchstaben, Schreibrichtung der Züge prüfen | Hoca | ≈ 4 h | Platzhalter-Audio, Züge „von Hoca zu prüfen“ | offen |
| MN-08 | Moschee-Fakten: Eröffnungsdatum, Adresse/Standort (Philipsstraße oder neuer Ort?), Fotos, Kapazität, Einrichtungen, Spendenzweck, Gebäudename „Neue Fatih-Moschee“ | Vorstand | 1 h | Platzhalter in eckigen Klammern | offen |
| MN-09 | IGMG-Jahrestabelle Wetzlar und Berechnungsmethode (M-082) | Vorstand / Imam | 30 min | Berechnung wie bisher (Methode unverändert) | offen |
| MN-10 | Schutzkonzept, Ansprechpersonen Kinderschutz, erweiterte Führungszeugnisse, Hilfenummern | Vorstand | 4–8 h | Chat aus | offen |
| MN-11 | DSFA Lernplattform, Datenschutzerklärung v2, Einwilligungstexte, Löschfristen, Push-Dienste (Drittland) | DSB / Recht | 6–10 h | Lernplattform, Chat, Push in Produktion aus | offen |
| MN-12 | Lokaler Server: Hardware, Installation des Kits, DynDNS (nur für Echtzeit) | Technik | 3–4 h | Cockpit gelb; alles läuft ohne ihn | offen |
| MN-13 | Bankdaten und Spendenzwecke (GiroCode) | Kassenwart | 15 min | Spendenseite aus | offen |
| MN-14 | Iqama- und Freitagszeiten für die Anzeige | Imam | 15 min | ausgeblendet | offen |
| MN-15 | Kandil- und Bayram-Tage 2026/27 bestätigen | Imam | 15 min | „vorläufig“ markiert | offen |
| MN-16 | Lehrkräfte einladen, Gruppen anlegen (≥ 2 Erwachsene je Gruppe) | Bildung | 1–2 h | – | offen |
| MN-17 | Push-Themen bestätigen, VAPID-Schlüssel setzen (`pnpm geheimnisse:erzeugen`) | Vorstand / Technik | 15 min | Push aus | offen |
| MN-18 | Minutentakt: Vercel Pro oder lokaler Server | Vorstand | 10 min | lokaler Server | offen |
| MN-19 | Prüfung auf echten Geräten (iOS/Safari, Android), u. a. Tajwid-Färbung in WebKit | Technik | 1 h | UMGEBUNGSAUSNAHME | offen |
| MN-20 | Imam-Konto mit Zwei-Faktor und Rolle `religioese_pruefung` | Vorstand | 15 min | Freigaben stauen sich | offen |
| MN-21 | Löschfristen bestätigen (Vorschläge der DSFA, im Code umgesetzt in `web/src/lib/loeschen/gemeinde.ts`): Moderationsprotokoll 3 Jahre, offene Meldungen höchstens 12 Monate, Audit 12 Monate, Lernende 12 Monate nach Austritt, unzustellbare Mails 30 Tage; Frist für inaktive Konten (Vorschlag 24 Monate mit Vorwarnung) | Vorstand / DSB | 30 min | Vorschläge gelten | offen |
| MN-22 | Vierteljährlich eine Sicherung mit dem privaten age-Schlüssel entschlüsseln (Schlüssel nie auf dem lokalen Server, DSFA D-08); nach jeder Wiederherstellung Löschanträge seit Sicherungsdatum erneut anwenden (D-09) | Vorstand / Technik | 30 min je Quartal | Probe nur ohne Entschlüsseln | offen |
| MN-23 | Rolle `kinderschutz` an zwei benannte Personen vergeben (Zwei-Faktor); Meldewege im Schutzkonzept. Vergabe in der Verwaltung nur durch ein Konto mit Rolle `leitung` (nie an sich selbst, nie zusammen mit `administration`, S1 M-2); die erste Person per `pnpm verwaltung:einladen` | Vorstand | 15 min | Meldungen erreichen nur die Gruppenleitung | offen |
| MN-24 | Mindestens **zwei** Konten mit religiöser Freigabe (Imam und Hoca): Freigaben folgen dem Vier-Augen-Prinzip – niemand gibt frei, was er selbst verfasst hat | Vorstand | 15 min | Eigene Entwürfe bleiben „zur Prüfung“ | offen |
| MN-25 | Kleine Entscheidungen aus den Paketen: (a) Weiterleitungen nur 308 statt wählbar 301/308; (b) eigenes Recht „Seite löschen“ statt „veröffentlichen“; (c) Newsletter-Abmeldung per Link sofort oder mit Bestätigungsschritt (Mail-Scanner); (d) Einwilligungen eines später gelöschten Elternkontos weiter gültig oder als widerrufen; (e) Liste „Vers des Tages“ (neue Tabelle) | Vorstand / DSB | 30 min | (a) 308, (b) wie jetzt, (c) sofort + POST nach RFC 8058, (d) gültig, (e) nur Hadith des Tages | offen |

## Datenbefunde aus E0/E1 (zur Kenntnis)
- Tajwid-Daten von cpfair/quran-tajweed passten nicht zu Tanzil 1.1 (Versatz um die Basmala in Vers 1). Sie wurden mit dem Klassifizierer
  des Projekts für Tanzil 1.1 **neu berechnet** und zu 100 % an den Zielbuchstaben geprüft (`web/daten/quran-tajweed/QUELLE.md`).
- Bukhari: 9 Einträge ohne Text in der Quelle (5710–5712, 5774, 5775, 6074, 6075, 6174, 6175) werden übersprungen und gezählt.
- Nummern mit Dezimalstelle (z. B. 402.2) sind Unterzählungen der Quelle; gespeichert als Text, sortiert nach Zahl.
