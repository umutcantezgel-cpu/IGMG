# ADR 0025 – Offene Datensätze im Repository mit SHA-256-Pin

- Status: vorgeschlagen (Lauf Gemeinde-Plattform) · Bezug: Plan „Gemeinde-Plattform“ §0 (V1), §2.4, §7 (Z-15) · ersetzt den Menschen-Download aus ADR 0009

## Kontext

- ADR 0009 erlaubt den Koran-Text nur über einen Import aus einer Datei, die Menschen herunterladen, außerhalb des Repositorys halten und per Hash eintragen. Dieser Schritt hängt an Personen und fehlt im Bau und in der Vorschau.
- Der Plan braucht offene Datensätze für Koran-Leser, Tajwid, Übersetzungen, Hadith, Elifbe, Rezitation und Ortsliste:
  - Tanzil (CC BY 3.0, unverändert)
  - cpfair/quran-tajweed und quran-align (CC BY 4.0)
  - QuranEnc-Übersetzungen (unter sieben Bedingungen)
  - GeoNames, Amiri (OFL)
  - arabischer Bukhari-Volltext (fawazahmed0, Unlicense; in der Vorschau, öffentlich erst nach Rechtsfreigabe)
- Der Plan verlangt „ohne Drittanbieter“ und einen offline lauffähigen Koran. Ein Laufzeitabruf scheidet daher aus.

## Entscheidung

1. Offene Datensätze liegen unter `web/daten/<quelle>/` im Repository. Jede Quelle hat eine Datei `QUELLE.md` mit Herkunft (Adresse), Version oder Commit, Abrufdatum, Lizenz, Namensnennung und SHA-256 der Rohdatei.
2. Die Import-Skripte prüfen den SHA-256 vor jedem Lauf. Bei Abweichung brechen sie ab und laden nicht selbst neu.
3. Je Quelle gilt eine Prüfung (Plan §2.4):
   - Tanzil Uthmani: Rundreise. Die Wörter ergeben den Verstext für alle 6.236 Verse; die Zählung stimmt mit den Metadaten überein. Die Variante passend zu quran-tajweed wird in E0 bestimmt.
   - cpfair/quran-tajweed: Graphem- und Wortgrenzen mit `Intl.Segmenter`. Bei Abweichung bleibt der Vers ohne Färbung, und ein Bericht entsteht.
   - QuranEnc: unverändert und vollständig. Nach 90 Tagen erscheint ein Cockpit-Hinweis (Pflegepflicht).
   - Hadith: lückenlose Nummern, Bücher und Kapitel.
   - Rezitation: Manifest und Lizenzdatei (Pflicht, siehe ADR 0029).
4. Jede Quelle erscheint auf `/quellen` mit ihrer Attribution (Tanzil, QuranEnc-Version, quran-tajweed, quran-align, Hadith-Quelle, GeoNames, Schriften, Bibliotheken).
5. Datensätze mit ungeklärter Erlaubnis kommen nicht ins Repository, bis eine schriftliche Erlaubnis vorliegt: KFGQPC-Schrift, Diyanet-Meal, fremde Rezitationen, deutsche und türkische Bukhari-Übersetzungen, Datenabzug von sunnah.com.
6. Der arabische Bukhari-Volltext ist in der Vorschau aktiv. Öffentlich wird bis zur Rechtsfreigabe nur die kuratierte Auswahl (V2, MN-06).
7. Die Zustimmung zu den Bedingungen von Tanzil und QuranEnc bleibt eine Menschen-Entscheidung (MN-01, Standard „Ja“). Der Menschen-Schritt „Datei herunterladen, Hash eintragen“ aus ADR 0009 entfällt.

## Alternativen

- Menschen-Download mit Hash-Eintrag (ADR 0009, Weg 1 in bisheriger Form): ersetzt. Bau und Vorschau hingen sonst an einer Person.
- Laufzeitabruf bei der Quran-Foundation-API (ADR 0009, Weg 2): verworfen. Die Lizenz ist widerruflich, der Zwischenspeicher auf höchstens eine Woche begrenzt, und der Seitenaufruf löst eine Drittanfrage aus (K-14). Ein Offline-Betrieb ist so nicht möglich.
- Nur Platzhalter auf den Koranseiten (ADR 0009, Weg 3): verworfen. Die Pflichtfunktion Koran-Leser entstünde nicht.

## Folgen

- Der Bau braucht die Datensätze lokal im Repository. `scripts/bau-datenbank.mjs` lädt sie in die PGlite-Bau-Datenbank, damit die Vorschau volle Inhalte hat (Plan §2.4).
- Eine Ausschlussregel für `web/daten/quran/` aus ADR 0009 ist anzupassen, falls sie in `.gitignore` steht. Das ist ein Schritt des Orchestrators.
- Neue Pflege: QuranEnc-Version nach 90 Tagen prüfen. Lizenzänderungen laufen über einen Schalter je Ausgabe (Risiko „Lizenzen verzögern sich“).
- Umkehrprobe: Falsch, wenn eine Quelle die Weitergabe im Repository untersagt. Dann bleibt der Import bei einem Menschen-Download nach ADR 0009.
- OFFENE FRAGE: Die Tanzil-Variante (Uthmani oder Simple) ist hier nicht festgelegt. Sie wird in E0 bestimmt.
