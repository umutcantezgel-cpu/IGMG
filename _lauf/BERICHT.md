# BERICHT – Morgenberichte

Einmal täglich ab 07:00 Uhr: Zielabstand, Erledigtes, Plananpassung, Pufferverbrauch, neue Fragen in MENSCHEN.md.

## Morgenbericht 2026-10-11 (geschrieben 06:59, Stand vor dem 07:00-Fenster)

**Zielabstand:** Z-01…Z-12 noch 0/12 abgehakt (Abnahme erst mit Belegen am Ende). Inhaltlich erreicht: P0–P3 mit Toren P2/P3, Welle A geliefert (16 Pakete), Welle B zu 4/9 (B01, B02, B04, B05). Offen bis Z: Tor A (Reparaturrunde), Rest Welle B (Kontakt, Mitglied werden, Webseite für Moscheen, Mail-Vorlagen, Tests, Tor B), Welle C (14 Verwaltungsmodule), Welle D (Quran, Suche, PWA, SEO), P5.

**Erledigt seit Lauf-Beginn (Auszug, alle Commits gepusht auf main):**
- P0 Erkundung, 56 Blätter; P1 Plan v2 und 17 ADRs; P2 Fundament (Docker-Probelauf, 2FA-E2E); P3 Durchstich: Hülle, Startseite, Veranstaltungen (Liste, Detail, iCal), Verwaltung Veranstaltungen, Tor P3 bestanden.
- Heute Nacht: B02 Formular-Infrastruktur und B04 Veranstaltungsanmeldung (b9747ff), B01 FormWizard und B05 Schüler-Voranmeldung (44baa6f), Welle A mit 16 öffentlichen Seiten (2c06edc).
- Leistung (K-12): alle Messrouten 166–173 kB JS (Budget 180), Lighthouse mobil Perf. 98–99, LCP 1,6–1,9 s, CLS ≤ 0,002 – nach Welle A zuerst 184–206 kB, behoben durch E-030 (eine schlanke Fehlergrenze, kein tailwind-merge im Browser, kein Vorabruf der Anzeige).
- Barrierefreiheit und Datenschutz: Routenlauf über 19 Routen × 3 Sprachen × 390/1440 px – 234/234 grün (keine axe-Verstöße, keine Anfragen an Dritte, keine Cookies).
- Tests: 226 Unit, 66 Integration, E2E-Formulare bis Mailpit (Anmeldung, Voranmeldung).

**Tor A (läuft):** Darstellungsprüfer melden u. a. Serifen statt Sans an Kartentiteln, abgeschnittenen Text in der Missionskarte der Organisationen, fehlende Hinweisbox der Korankurse und kompakte Terminliste der Organisationen; Sicherheitsprüfer 17 Befunde (hoch: fehlende Löschfristen – geplant C08; Rechtstexte ungeprüft – M-079), mittel u. a. `javascript:`-Links in Social-Feldern (behoben), Audit beim Anlegen von Eingängen, geplante Nachrichten vorab abrufbar, Soft-404, Mail-Dateitransport als stiller Fallback. Reparaturrunde startet jetzt; danach Tor-A-Abschluss.

**Plananpassungen:** E-028 (Formulare: Ansicht vom Server, kleine Insel), E-029 (FormWizard ohne Client-Logik), E-030 (Leistungsregeln, Unit-Test `bundle-regeln`). Formulare B03/B06/B07 können nach MUSTER 6a/6b an Haiku gehen.

**Pufferverbrauch:** Plan 17 Schichten inkl. 20 % Puffer; verbraucht ≈ 9 Schichten (P2–P3, Welle A, B-Teil), Reparaturen im Rahmen (Welle A: 1 Paket ohne Bericht, 5 Pakete mit Nacharbeit durch O). Kein Mehrbedarf absehbar.

**Next.js-Sicherheitsupdate:** heute geprüft – npm `latest` = 16.4.0 (installiert). Angekündigt für 14.10.2026; tägliche Prüfung läuft weiter.

**Neue Fragen in MENSCHEN.md:** M-068 (Geschlecht des Kindes in der Voranmeldung nötig?), M-069–M-081 aus Welle A (Gründungsjahr 1975/1976, Spenden- und Bankdaten, widersprüchliche IGMG-Zahlen, Kontaktdaten der Organisationen, Öffnungszeiten, Rechtstexte und Pflichtangaben, Wissensinhalte, Qibla-Entfernung). Dringlich (A): **M-072** Spendenangaben, **M-079** Rechtstexte/Impressum.
