# Tor E2 – Protokoll (13.10.2026)

Stand: Branch `claude/trusting-lovelace-6nfolz` ab a0b13d9 (Merges Recht, Hadith, Elifbe, Koran-Leser, Konten/Mein Bereich-Kern,
CMS, Kür A, Lernen-Verwaltung, Koran-Verwaltung; Orchestrator-Arbeiten; S1 behoben) + Beispielmodus-Schutz.

| Prüfung | Ergebnis |
|---|---|
| Typen (`pnpm typen`) | grün |
| Lint (`eslint .`) | grün |
| Unit (`vitest --project unit`) | 1300 grün, 3 erwartet fehlgeschlagen; `speicher-probe` unter Last über 10 s (ohne Last grün) |
| Sprachen (`sprachen:pruefen`) | vollständig (2413 Schlüssel de/tr/en, 3547 Verwaltung) |
| Religion (`religion-pruefung.mjs`) | 0 Befunde (5137 Dateien) |
| Wortlaut (`wortlaut.mjs`, Basis b702c7c) | 0 offene Befunde (Ausnahmen G-01…G-05) |
| S1 Sicherheitsprüfung | 2 hoch, 4 mittel, 7 niedrig → alle behoben (`berichte/S1-sicherheit.md`), Nachweistests grün |
| Startklar (Produktion, Bau-DB) | Funktionsschalter sicher (alles mit Personendaten aus); übrige Fehler = Umgebung/Platzhalter wie im Vorlauf |
| Bau Produktion | grün (1399 Seiten) |
| Befund Beispielmodus | Live und lokal: unbekannte Adressen → 500 statt 404 (ungeschützter Datenbankzugriff beim dynamischen Rendern, `ladeEinstellung` u. a.). Behoben durch Schutzabfragen in den zentralen Ladern. |
