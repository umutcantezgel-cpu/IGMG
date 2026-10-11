## Befundformat und Schwere-Rubrik (für alle Prüfer- und Quellenprüfer-Pakete)

**Format je Befund** (eine Tabellenzeile oder ein Block):
`F-<Paket>-<nnn>` · Prüffeld · Schwere · Beschreibung · Beleg (Datei:Zeile, Route, Befehl+Ausgabe oder Bildschirmfoto-Pfad) · zuständig (Lauf | Mensch) · Aufwand (S ≤ 2 h, M ≤ 1 Tag, L > 1 Tag) · Vorschlag

**Schwere – Definition und Beispiele:**
- **Blocker:** verhindert rechtssicheren oder sicheren Betrieb oder eine Kernfunktion.
  - Banner fehlt, aber ein einwilligungspflichtiger Speicher wird gesetzt.
  - Impressum ohne Pflichtangabe nach §5 DDG, obwohl das Feld existieren müsste.
  - Server Action ohne Rechteprüfung.
  - Daten von Kindern ohne Rechtsgrundlage.
  - Formular speichert nicht.
- **Hoch:** deutliches Risiko oder unvollständige Kernfunktion.
  - Rechtstext ohne Version.
  - Verwaltungsliste ohne Suche bei mehr als 50 Einträgen.
  - Fehlender Fehlerzustand in einem Formular.
  - Backup ohne Wiederherstellungsprobe.
  - Fehlende Übersetzung in einer E-Mail.
- **Mittel:** spürbarer Mangel mit Umgehung.
  - Hilfetext fehlt.
  - Leerer Zustand ohne Erklärung.
  - Sortierung fehlt, Filter vorhanden.
- **Niedrig:** Feinschliff.
  - Wortwahl, Abstand.
  - Doppelte Hinweise.

**Zuständigkeit:**
- **Lauf:** alles, was Code, Konfiguration, Texte oder Dokumente im Repo betrifft.
- **Mensch:** Vereinsdaten, Freigaben, Konten, Verträge (AVV), Entscheidungen der Gemeinde, rechtliche Prüfung durch Fachleute.

**Regeln:**
- Ohne Beleg gibt es keinen Befund (stattdessen OFFENE FRAGE).
- Absichtliche Abweichungen aus `web/docs/ABWEICHUNGEN.md` und Entscheidungen aus `_lauf/ENTSCHEIDUNGEN.md` / `_lauf/release/ENTSCHEIDUNGEN.md` sind keine Befunde, außer sie verstoßen gegen geltendes Recht oder K-21…K-32.
- Keine Ausnutzungsdetails für Sicherheitslücken in die Datei schreiben (öffentliches Repo, R-E09): Ort und Art ja, Schritt-für-Schritt nein.
