| Spec | telefon ok/rot/übersprungen | desktop ok/rot/übersprungen |
|---|---|---|
| chat.spec.ts | 0/0/1 | 1/0/0 |
| cms.spec.ts | 0/0/2 | 2/0/0 |
| formular-voranmeldung.spec.ts | 0/0/1 | 1/0/0 |
| lernkette.spec.ts | 0/0/1 | 1/0/0 |
| mein-bereich-lernen.spec.ts | 0/0/2 | 2/0/0 |
| quran-leser.spec.ts | 7/0/0 | 7/0/0 |
| quran-offline.spec.ts | 0/0/1 | 1/0/0 |
| quran-player.spec.ts | 0/0/7 | 7/0/0 |
| quran.spec.ts | 16/0/0 | 16/0/0 |
| verwaltung-anzeige.spec.ts | 0/0/3 | 3/0/0 |
| verwaltung-rezitationen.spec.ts | 0/0/2 | 2/0/0 |
| zugaenglichkeit-gemeinde.spec.ts | 4/0/0 | 4/0/0 |

stats {"startTime": "2026-10-16T08:55:08.236Z", "duration": 304893.007, "expected": 74, "skipped": 20, "unexpected": 0, "flaky": 0}

 -  chat.spec.ts | telefon | Leitung und Kind in zwei Browsern: Nachricht kommt an, Melden; im Chat | skip | Abläufe mit Anmeldung nur einmal je Lauf
 -  cms.spec.ts | telefon | Seite anlegen und veröffentlichen, Menüeintrag und Weiterleitung ersch | skip | Verwaltungsabläufe nur einmal je Lauf
 -  formular-voranmeldung.spec.ts | telefon | Voranmeldung in vier Schritten bis zur Bestätigung | skip | Formular- und Verwaltungsabläufe nur einmal je Lauf
 -  lernkette.spec.ts | telefon | Voranmeldung → Aufnahme → Eltern-Einladung → Kinderzugang → Kind sieht | skip | Abläufe mit Anmeldung nur einmal je Lauf
 -  mein-bereich-lernen.spec.ts | telefon | Lehrkraft: Heute → Anwesenheit auf einem Bildschirm, Abmeldung vorbele | skip | Abläufe mit Anmeldung nur einmal je Lauf
 -  quran-offline.spec.ts | telefon | Sure offline speichern, ohne Netz lesen und wieder entfernen | skip | einmal je Lauf genügt
 -  quran-player.spec.ts | telefon | ohne aktive Rezitation: ruhiger Hinweis statt Abspiel-Knopf (390 und 1 | serial | 
 -  quran-player.spec.ts | telefon | ohne aktive Rezitation: ruhiger Hinweis statt Abspiel-Knopf (390 und 1 | skip | Eine aktive Rezitation gilt für die ganze Website – einmal je Lauf
 -  quran-player.spec.ts | desktop | ohne aktive Rezitation: ruhiger Hinweis statt Abspiel-Knopf (390 und 1 | serial | 
 -  verwaltung-anzeige.spec.ts | telefon | Textfolie anlegen, sichtbar schalten, öffentlich über /api/anzeige; Ei | skip | Verwaltungsabläufe nur einmal je Lauf
 -  verwaltung-rezitationen.spec.ts | telefon | Werkstatt: Testton hochladen, Grenzen vorschlagen und speichern, mitkl | serial | 
 -  verwaltung-rezitationen.spec.ts | telefon | Werkstatt: Testton hochladen, Grenzen vorschlagen und speichern, mitkl | skip | Verwaltungsabläufe nur einmal je Lauf
 -  verwaltung-rezitationen.spec.ts | desktop | Werkstatt: Testton hochladen, Grenzen vorschlagen und speichern, mitkl | serial | 
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Anwesenheit erfassen (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Anwesenheit nach dem Speichern (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Gruppenchat (Leitung) (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Gruppenchat (Leitung) nach dem Senden (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind, Regeln) (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind, offen) (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind) nach dem Senden (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Meldungen & Kinderschutz: axe ohne ernste Befunde | axe | Verwaltung › Kinderschutz (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Meldungen & Kinderschutz: axe ohne ernste Befunde | axe | Verwaltung › Kinderschutz (alle) (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppen (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppe (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppe nach dem Speichern (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | telefon | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Freigaben (390 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Anwesenheit erfassen (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Anwesenheit nach dem Speichern (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Gruppenchat (Leitung) (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Lehrkraft: Anwesenheit und Gruppenchat – axe ohne ernste Befunde, Foku | axe | Gruppenchat (Leitung) nach dem Senden (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind, Regeln) (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind, offen) (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Kind: Gruppenchat – Regeln bestätigen und Senden per Tastatur, Fokus i | axe | Gruppenchat (Kind) nach dem Senden (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Meldungen & Kinderschutz: axe ohne ernste Befunde | axe | Verwaltung › Kinderschutz (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Meldungen & Kinderschutz: axe ohne ernste Befunde | axe | Verwaltung › Kinderschutz (alle) (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppen (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppe (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Gruppe nach dem Speichern (1440 px): ernst/kritisch 0, mittel/gering 0
 -  zugaenglichkeit-gemeinde.spec.ts | desktop | Verwaltung › Gruppen und Freigaben: axe ohne ernste Befunde, Fokus nac | axe | Verwaltung › Freigaben (1440 px): ernst/kritisch 0, mittel/gering 0
