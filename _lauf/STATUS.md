# STATUS

**Statuszeile:** Phase P4 · Welle B und C fertig · Tor B/C bestanden (Befunde behoben, Beleg `_lauf/belege/tore/tor-bc.md`) · Welle D begonnen (Suche, PWA, sitemap/robots) · Z 0/12 · nächster Schritt: C11b Bilder an Inhalten, C17 Rollen-Matrix-Tests, C19 Probeläufer, Rest Welle D

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
