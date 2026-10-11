# ADR 0010 – Repository und Schutz beim Pushen in ein öffentliches Repo

- Status: angenommen · 2026-10-11 · P1 · Bezug: G-01, G-03, G-04, E-004, E-005, E-009, E-010, Z-12

## Ziel
Der Nutzer will „nur main, immer alles pushen“ (E-004). Das Ziel-Repo ist öffentlich. Es darf nie ein Geheimnis, eine Personendatenzeile oder eine lokale Datenbank öffentlich werden.

## Wege
1. **Alles pushen** (Workspace samt Bestand und Design).
2. **Nur Arbeitsergebnisse (`web/`, `_lauf/`) versionieren**, mit technischem Pre-Push-Schutz.
3. **Nicht pushen** (Auftrag ursprünglich „Push: AUS“).

## Bewertung
Weg 1 wurde von der automatischen Sicherheitsprüfung wegen Personendaten blockiert (E-009). Weg 3 widerspricht der ausdrücklichen Nutzeranweisung. **Weg 2 gewählt.**

## Festlegungen
- Repo in der Workspace-Wurzel; `.git/info/exclude` schließt alles außer `/web/` und `/_lauf/` aus (E-009).
- `web/.gitignore`: `.env*` außer `.env.example`, `.medien/`, `.mail/`, `.pglite*/`, `test-results/`, `playwright-report/`, `coverage/`, `.next/`, `node_modules/`.
- `_lauf/.gitignore`: Bildbelege, Spike-Daten, Caches (E-010).
- **Pre-Push- und Pre-Commit-Prüfung** `web/scripts/geheimnis-pruefung.mjs` (eigenes Skript, keine neue Abhängigkeit): prüft die zu übertragenden Dateien auf (a) verbotene Pfade (`.env` außer `.env.example`, `*.pem`, `*.key`, Datenbankdateien, PGlite-Ordner, Mail-Ausgaben), (b) Muster für Schlüssel/Token (AWS, GitHub, Slack, private Schlüssel, generische `secret=`/`password=` mit langen Werten, Better-Auth-Secret), (c) E-Mail-Adressen außer erlaubten Beispiel-Domains (`example.test`, `example.com`, `beispiel.de`, `igmg-wetzlar.de` als Beispielwerte aus dem Bestand). Treffer brechen Commit/Push ab.
- Hooks über `simple-git-hooks` (pre-commit: lint-staged + Prüfung; pre-push: Prüfung über `git diff origin/main..HEAD`).
- Commits nur durch den Orchestrator, je abgenommenem Paket, Push direkt danach; kein Force-Push, kein Rebase von Gepushtem.

## Umkehrprobe
Falsch, wenn der Nutzer das Repo privat stellt und Bestand/Design ausdrücklich im Repo will (M-002, M-003): dann `.git/info/exclude` anpassen – der Schutz bleibt.

## Folgen zweiter Ordnung
- Wer das Repo klont, braucht Bestand und Design nicht zum Bauen der App; Bildreferenzen lassen sich nur mit dem lokalen Design-Ordner neu erzeugen (BETRIEB.md).
