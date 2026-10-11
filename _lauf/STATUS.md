# STATUS

**Statuszeile:** Phase P3 (Durchstich) · D01–D04 fertig, D05 in Arbeit · Pakete P0: 54/56 Blätter · Z 0/12 · Tore P2 grün · Puffer 0 % · nächster Schritt: D05 Verwaltungs-Shell + Modul Veranstaltungen; parallel D06/D07/D09a (Haiku)

## Prüfpunkt (2026-10-11, ~03:40)
- **Erledigt:**
  - P0/P1 wie zuvor (Laufdateien, ADR 0001–0016, Lichtungen a/b/c, Bildreferenzen, PLAN v2 nach Gegenprüfung)
  - P2: F01–F10, **Tor P2 grün** (Testläufer wf_42b18d83: check, integration, build, E2E 4/4, `/` `/tr` `/en` 200, Header ohne Set-Cookie)
  - P3 D01 Hülle, D02 Karten/RichText, D03 Termine + iCal, D04 Startseite + Veranstaltungen Liste/Detail (Commit 9605ecc)
  - ADR 0017 im Durchstich bestätigt (`_lauf/belege/adr-0017/pruefung-d04.md`, Skript `_lauf/werkzeuge/pruefe-adr-0017.sh`)
- **Laufende Pakete:** Kundschafter-Workflow `wf_333df54b-23b` (54/56, C15 offen); Dev-Server `next dev` Port 3000 (Hintergrund)
- **Nächster Schritt:** D05 → D08/D09b → Tor P3 (TL, DP, SP, Lighthouse, T5, T8) → `docs/MUSTER.md` → Welle A
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit` (PostgreSQL 127.0.0.1:5432, Mailpit 127.0.0.1:8025)
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh` (pnpm, Docker ohne Keychain-Helper, Telemetrie aus)

## Offene Punkte für spätere Pakete
- Passkey-Registrierung und -Anmeldung (Client-Plugin) → C12 Benutzer/Konto
- Passwort vergessen (sendResetPassword) → C12
- TOTP-Wiederverwendung im selben Zeitfenster (Lichtung b) → Sicherheitsprüfer Tor P3/P5
- E2E legt Einladungen in der Entwicklungs-DB an → eigene DB `igmg_e2e` (E-019) vor Tor P3
- Anmeldung zu Veranstaltungen (Formular, Platzzählung via `TAG.anmeldungenVon`) → B04
- Redirect in Verwaltungsseiten liefert HTTP 200 + Client-Umleitung (gestreamt) – prüfen, ob 307 möglich (D05)

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md` (sobald vorhanden), `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
