# ABSCHLUSS – Lauf „Gemeinde-Plattform“ (13.–16.10.2026)

## Ergebnis

**Urteil des frischen Endprüfers (`berichte/stufe-c-abschluss.md`, Stand `main` = e68f658, 16.10.2026):** **alle 21 Kriterien erfüllt** (0 teilweise, 0 AUSNAHME als Hauptstatus; Ausnahme-Vermerke für echte Geräte/iOS, echte Push-Zustellung, Centrifugo ohne öffentliche Adresse, echte Rezitation und PostgreSQL 16 statt 17 bleiben bei Z-08, Z-09, Z-14, Z-16, Z-19, Z-20).

| Stand | erfüllt | AUSNAHME | teilweise |
|---|---|---|---|
| 75cad0a – Stufe C | 7 | 2 | 12 |
| 033ea6f – nach Nacharbeit N1–N4 | 12 | 2 | 7 |
| 90a8e37 – nach Nacharbeit 2 | 19 | 0 | 2 |
| e68f658 – nach Nacharbeit 3 | **21** | 0 | 0 |

Die Bewertung je Kriterium mit Beleg steht in `ABNAHME.md`. Das Urteil steht wörtlich in `BERICHT.md`.

## Was gebaut ist

Seit `b702c7c` (Start des Laufs): 410 Commits, 676 Dateien in `web/src`, 17 Migrationen, 54 E2E-Specs, 34 ADRs.

**Öffentliche Website, live unter https://igmg-wetzlar.vercel.app:**
- Koran-Leser mit Wortkarte, Tajwid-Leiste, Lesemodi, Offline-Sure und Player.
- Alle 7580 Hadithe aus Sahih al-Bukhari (arabisch).
- Elifbe mit Schreibweg.
- Gebetszeiten für Wetzlar und den eigenen Ort, mit Qibla.
- Kalender, Ramadan, Hatim, Spenden-GiroCode.
- Suche, auch ohne Datenbank.
- Erzählansichten zur eröffneten Moschee.

**Gemeinde-Plattform** (gebaut und geprüft; schaltet ein, wer die Datenbank verbindet und die Schalter freigibt):
- Konten für Gemeinde, Eltern, Lehrkräfte und Kinder.
- Mein Bereich, Lernplattform (Gruppen, Anwesenheit, Fortschritt, Hifz), moderierter Gruppen- und Elternchat mit Kinderschutz S-01…S-18.
- Web Push mit Rückfall per Mail-Zusammenfassung.
- CMS mit Seiten, Menüs, Startseite, Islamischem Wissen, Revisionen, Zeitplan, Weiterleitungen und Freigaben im Vier-Augen-Prinzip.
- Anzeige im Gebetsraum.
- Kit für den lokalen Server (Sicherung, Wiederherstellungsprobe, Takt, Echtzeit, Kiosk).

**Prüfung:**
- **Tests:** Unit 1584, Integration 3269, E2E mit PostgreSQL und Mailpit 991 grün und 0 rot.
- **Sicherheit:** Prüfungen S1–S3 ohne offenen Befund „hoch“.
- **Abnahme:** Sichtabnahme in drei Runden; Stufe C mit drei Nachprüfungen.

## Übergabe – was nur Menschen tun können

Die vollständige Liste steht in `MENSCHEN.md` (MN-00 … MN-29) und `web/docs/GO-LIVE.md` (Abschnitt G).

1. **MN-00:** Produktionsdatenbank (Neon, Frankfurt, **PostgreSQL ≥ 17**), Geheimnisse und SMTP in Vercel. Danach gehen Verwaltung, CMS, Konten, Volltextsuche und Mails live.
2. **MN-20/23/24:** Verwaltungskonten mit Zwei-Faktor: erst die Leitung, dann Kinderschutz im Vier-Augen-Prinzip, dazu zwei Konten für die religiöse Prüfung.
3. **MN-10/11, MN-21…23:** DSFA, Datenschutz v2, Schutzkonzept, Löschfristen und Sicherungsschlüssel. Erst danach die Schalter `konten`, `lernplattform`, `chat` und `push` einschalten (GO-LIVE G4).
4. **Religiöse Freigaben:** Übersetzungen, Tajwid, Wortbedeutungen, Elifbe-Lektionen und Wissensthemen (MN-02/04/05/07/28).
5. **Rezitation und Lizenzen:** Fatiha und Cüz 30 aufnehmen, Vereinbarung (MN-03); Lizenzen (MN-01/06).
6. **Lokaler Server:** einrichten, Takt und Wiederherstellungsprobe auf PostgreSQL 17 (MN-12/18).
7. **Echte Geräte:** Test auf iPhone und Android (MN-19).
8. **Aufräumen:**
   - Überzählige Vercel-Projekte löschen (`igmg` in uus-projects, `igmg-ldk`, `web`, `spiegel`).
   - Die alten Agenten-Arbeitsbäume unter `.claude/worktrees/` (≈ 17 GB, alle gemergt) im Container entfernen lassen.

## Zurückrollen

`main` wird nur per Fast-Forward fortgeschrieben. Ein Revert-Commit des letzten Merge-Commits auf dem Arbeitsbranch und ein neuer Fast-Forward stellen den vorigen Stand wieder her. Vercel baut ihn automatisch (`web/docs/deploy/VERCEL.md` §12).

## Wie es weitergeht

Der Nutzer hat am 16.10.2026 den Plan „Lern-App“ genehmigt:
- Sprachen Deutsch, Türkisch und Arabisch in allen sechs Richtungen, A1–C1.
- Hanefitisches Wissen auf Deutsch, Koran-Arabisch.
- Spielerisch und sanft, offline-fähig.

Er läuft als neuer Lauf in `_lernapp/`, beginnend mit der Etappe L0.

## Verbleibende Feinheiten (niedrig, aus dem Abschlussurteil)

- **Beschädigte Fassung zurückholen:** Wer eine von Hand beschädigte Fassung zurückholt, sieht die allgemeine Fehlerseite statt einer eigenen Meldung. Die Daten bleiben unverändert.
- **Gleiche Namen bei Fassungen:** Mehrere Fassungen aus derselben Minute tragen gleiche Namen.
- **Kurze Verdeckung beim Scrollen:** Beim weichen Scrollen liegt der Fokus 0,3–0,5 s lang noch unter der Speicherleiste. Bei reduzierter Bewegung scrollt die App sofort.
- **Testlücken:**
  - Zeitplan und Seiten-Freigabe sind nur in der Prüfer-Spec abgedeckt.
  - `wartung-sperre-postgres` braucht PostgreSQL 17.
