# STATUS

## Marktstart mit IGMG-Daten (Stand 28.10.2026)
- **Lauf läuft:** Pakete Fundament, P1–P8 gemergt auf `claude/peaceful-dirac-e7a06r` (Draft-PR umutcantezgel-cpu/IGMG#5); Welle 3 (Stand-Migration, Prüfwerkzeuge, Doku) in Arbeit, danach Gesamtverifikation, Push und PR-Beschreibung.
- **Plan:** `/root/.claude/plans/root-claude-uploads-d2cbb575-0c84-5ded-cozy-llama.md`. Entscheidungen E-044/E-045 (`ENTSCHEIDUNGEN.md`), KERN 1.2, ADR 0046–0049.
- **Bericht:** `belege/marktstart-igmg/BERICHT.md`. Menschen-Punkte M-099–M-120 (`MENSCHEN.md` § 8), Livegang: `web/docs/GO-LIVE.md` C6–C14.

**Statuszeile:** ABGESCHLOSSEN (Übergang an den Release-Lauf, R-E02, 2026-10-11) · Wellen A–C fertig · Welle D: Suche, PWA, sitemap/robots, Quran-Import und -Seiten, JSON-LD, OG-Bilder · C11b, C17 fertig · offene Punkte → Startklar-Audit (`_lauf/release/`)

## Endstand des Aufbau-Laufs (2026-10-11, 13:15)
- **Übergeben an:** den Release-Lauf „Startklar machen“ (`_lauf/release/STATUS.md`, Plan `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`).
- **Letzte Pakete:** C11b, D-Q1, D-Q23, D-O13, D-O4, C17. Belege: `belege/welle-c/abnahme-c11b.md`, `belege/welle-d/abnahme-welle-d-c17.md`.
- **Prüfläufe:**
  - Unit 549 (+3 erwartet fehlschlagend).
  - Integration 1338 (+2 erwartet fehlschlagend: C17-Befunde).
  - Build grün.
  - E2E voll: 550 bestanden, 7 unter Last abgebrochen (ALTCHA 20 s, Weiterleitung 5 s). Alle 7 sind bei 1 Worker grün (Flake-Befund für den Release-Lauf).
- **Offen und als Befunde übergeben:** Z-Belege (0/12), Tor D, D-Ü, D-T1, C19, H01–H07, C17-1/2, D-O4-1, Passkey (M-092).

## Prüfpunkt (2026-10-11, ~10:45)
- **Erledigt seit letztem Prüfpunkt:**
  - Tor B/C durchgeführt, Bericht `_lauf/belege/tore/tor-bc-bericht.md`.
  - Sicherheit und Datenschutz (Orchestrator, E-041/E-042):
    - H1/B3 Proxy-Vertrauen; M1/M6 Better-Auth-Endpunkte und IPs; M2 Lese-Audit Konten; M3 letzte Administration unter Sperre; M7 Audit der Anmeldung mit zweitem Faktor.
    - N1 Antwortzeit bei „Passwort vergessen“; N2 Konto-ID-Format; N3 Recht zuerst; N6 Sperre entwertet Reset-Links; N7 Löschfrist für Einladungen und Verifikationen.
    - SP-B: B1 Meldung verschlüsselt, B2 Bestätigungen je Adresse, B4 Höchstfrist, B6 ALTCHA-Zähler, B7 Link-Prüfung, B9 Platzprüfung unter Sperre, B11 APP_URL Pflicht.
    - SP-C2: B1 `verwendungVon` per JSONPath, B2 Pfadregel, B5 Import, B7 Medien-Cache, B9 Upload-Grenze 11 MB.
    - Migration 0007 (Fristen) auf der Entwicklungsdatenbank angewendet.
  - Darstellung (Haiku, Workflow R-BC-D1/D2, abgenommen):
    - DP-B-01…16, DP-C1 H1/H2/M1–M4/N1–N4, DP-C2 1–10.
    - Nacharbeit Orchestrator: Kopfzeile 397 → 390 px (Suche unter 640 px im Telefonmenü), Organisation in der Übersicht, Tabellenrahmen bei Benutzern, Kontaktdaten auf „Mitglied werden“ aus den Seiteninhalten.
  - Abweichungen A-V03b, A-C01c, A-C12e, A-C04b, A-T01, A-T02; MENSCHEN M-095…M-098; ADR 0003/0005/0007 Nachträge; BETRIEB 4/5b.
  - Integration 421/421 (vor den letzten Ergänzungen), Unit 462.
- **Laufende Pakete:** keine (R-BC-S3 abgenommen, `_lauf/belege/tore/abnahme-r-bc.md`)
- **Gesamtlauf:** check grün (Unit 493), Integration 426/426, Build grün, E2E 490 + Nachlauf 295 nach den Reparaturen, Lighthouse P 98–99 / JS ≤ 174,1 kB.
- **Nächster Schritt:** C11b (Bilder an Inhalten), danach C17, C19, Welle D (Quran mit Platzhalter, JSON-LD, OG-Bilder, Übersetzungen), Tor D.
- **Dienste lokal:** `docker compose --profile entwicklung up -d db mailpit`; Dev-Server 127.0.0.1:3000 (Hintergrund). Tor- und Messserver gestoppt.
- **Umgebung je Befehl:** `source _lauf/werkzeuge/umgebung.sh`

## Offene Punkte für spätere Pakete
- C11b: Bilder an Inhalten (Medienwahl im Editor, Neuigkeiten-Bild, öffentliche Anzeige) inkl. SP-C2 H1–H5 (Dublette im Papierkorb, Alt-Text im Papierkorb, verwaiste Datei) und Hinweis zu PDF-Metadaten (M-097).
- Passkey-Registrierung und -Anmeldung → offen (M-092).
- TOTP-Wiederverwendung im selben Zeitfenster → Sicherheitsprüfer P5.
- Redirect in Verwaltungsseiten: HTTP 200 mit Stream-Weiterleitung (N8, bewusst offen, E-042).
- DP-C2: Vorstand-Einträge einklappen, Übersetzungen einheitlich zuklappen (Entscheidung offen, niedrig).
- Übersetzungen der Organisations-Öffnungszeiten (M-098) → D-Ü.

## Fortsetzung in neuer Sitzung
Zuerst lesen: `_lauf/STATUS.md`, `_lauf/KERN.md`, `_lauf/PLAN.md`, `web/docs/MUSTER.md`, `_lauf/ENTSCHEIDUNGEN.md`. Plan: `/Users/umurey/.claude/plans/auftrag-f-r-claude-code-linear-snowglobe.md`.
