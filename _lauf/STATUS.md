# STATUS

**Statuszeile:** Phase P4 · Welle B fertig (B01–B07, B10) · Welle C: alle 14 Module fertig (C01–C16, C10b) · Z 0/12 · nächster Schritt: Tor B/C (Darstellung öffentlich + Verwaltung, Sicherheit), dann C11b Bilder an Inhalten, C17 Rollen-Matrix-Tests, C19 Probeläufer, Welle D

## Prüfpunkt (2026-10-11, ~09:55)
- **Erledigt seit letztem Prüfpunkt:**
  - Bündel 3 (Haiku): C04/C05 Seiteninhalte (Übersicht, sechs Bereiche, Kontakt, vier Organisationen), C10b öffentliche Meldung `/meldung` (Ticket, E-037), A23b E2E Bedienabläufe Welle A (34/34 je Projekt), B10 Übersetzungsprüfung (8 Korrekturen)
  - Orchestrator: C07 Gebetszeiten-Verwaltung (E-039), C11 Medien (E-038), „Passwort vergessen“, Öffnungszeiten aus einer Quelle (A-S11c), Linkname der Nachrichtenkarten, Medien-Weiterleitung aus der Action
  - Belege: `_lauf/belege/welle-c/abnahme-buendel-3-c07-c11.md` – Unit 453, Integration 414/414, Build grün, E2E 473 + Nachlauf 10/10, Lighthouse P 99 / JS ≤ 169,7 kB
- **Laufende Pakete:** keine
- **Nächster Schritt:** Commit/Push, Tor B/C starten (Server auf 3200 mit Beispielinhalten, `_lauf/werkzeuge/verwaltung-bilder.mjs` für die Verwaltung)
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit`; Dev-Server 127.0.0.1:3000 (Hintergrund)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh`

## Offene Punkte für spätere Pakete
- Medienwahl im Rich-Text-Editor (`bildAuswahl`) → C11; Neuigkeiten-Bild (`bildId`) → C11
- SP-A-03 Proxy-Vertrauen für `x-forwarded-for` (Ratenbegrenzung, Better Auth) → P5
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → offen (M-092), Anmeldung bisher nur mit Authenticator-App
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md`, `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
