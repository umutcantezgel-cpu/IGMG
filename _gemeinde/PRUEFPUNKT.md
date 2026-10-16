# PRÜFPUNKT – Gemeinde-Plattform

- **Stand 16.10. 13:35 UTC:** Stufe-C-Nachprüfung 2 (90a8e37): 19 erfüllt, 2 teilweise (Z-07, Z-18). Nacharbeit 3 (bb57055…35ffc00,
  a59ce95) behebt beides; Gegenprüfung: Z-07 und Z-18 erfüllt (eigene Nachstellung am Server). Tor grün: Unit 1584,
  Integration 3269, E2E 991/0, Import 1887 (Sweep ohne 5xx, Crawl 1315), Vorschau 2228. Nächster Schritt: Fast-Forward `main`,
  Produktion prüfen, frischer Endprüfer bestätigt Z-07/Z-18 (Abschlussurteil), dann ABNAHME/BERICHT/ABSCHLUSS,
  CLAUDE.md-Block ersetzen (neuer Lauf „Lern-App“, Plan genehmigt 16.10., `_lernapp/` in L0).
- **Stand 16.10. 09:05 UTC:** Nacharbeit 2 zusammengeführt (P1 41e5985, P2 4325608 mit 0016 neu erzeugt, P3 05e3a31, P4 9c7e9f0,
  Feinschliff 731e838/d5b2b76; alle Gegenprüfungen frei). Tor grün: Unit 1582, Integration 3265, E2E mit PostgreSQL/Mailpit
  983 grün/0 rot, Sprachen, Religion, Wortlaut rc=0, Bau wie frischer Import 1887 (Sweep ohne 5xx, Crawl 1315 ohne Fehler,
  Konto-Seiten 404), Vorschau 2228; Vercel-Preview 9c7e9f0 in beiden Projekten success. Nächster Schritt: Fast-Forward `main`,
  Produktion prüfen, dann Stufe-C-Nachprüfung 2 (`scratchpad/stufe-c3.js`, args {scratchpad, stand}), ABNAHME/BERICHT,
  ABSCHLUSS, CLAUDE.md-Block entfernen.
- **Stand 16.10. 00:00 UTC:** Nacharbeit 2 brach am Sitzungslimit ab. P1 fertig 9089a8b (F-40, Migration 0015), P2 fertig
  d193c8a (F-38/F-44, Migration 0016 → beim Merge neu erzeugen), P3 ZWISCHENSTAND c7341a3, P4 ZWISCHENSTAND 29b9c7d (echte E2E
  Lauf 2: 967 grün, 10 rot; Patch next@16.4.0; Probe offen). Umgebung: `scratchpad/e2e-echt/start.sh` (PostgreSQL 16 unter
  /var/lib/postgresql/igmg-e2e-echt, Mailpit). Läuft: Fortsetzungs-Workflow (P3/P4 fertigstellen, Gegenprüfung P1–P4). Danach
  Merge P1→P2(0016 neu)→P3→P4, `pnpm install --frozen-lockfile`, Tor inkl. voller E2E, Preview-Deployments `success`, FF,
  Stufe-C-Nachprüfung 2, ABSCHLUSS. Neu für die Unterlagen: Neon/Server mit PostgreSQL ≥ 17 (0013/0014 scheitern auf 16).
- **Stand 15.10. 19:15 UTC:** Stufe-C-Nachprüfung auf 033ea6f: 12 erfüllt, 2 AUSNAHME, 7 teilweise
  (`berichte/stufe-c-nachpruefung.md`, ABNAHME nachgeführt; `main` = 06fcf03). Wortlaut G-06 erweitert → rc=0 (9757df3).
  Läuft: Workflow „nacharbeit-2“ `wf_68b411e9-63f` (Skript unter `~/.claude/projects/-home-user-IGMG-web/…/workflows/scripts/`):
  P1 F-40 Startseite/Wissen (`agent-a212ace6…`, Migration 0015), P2 F-38 Push-Rückfall + F-44 (`agent-a2e7dbaf…`, ggf. 0016),
  P3 Kleinigkeiten + Z-08 erster Tab Hadith + Player-E2E + Matrix (`agent-ac6673f9…`), P4 echte E2E ohne Docker
  (PostgreSQL 16 aus /usr/lib/postgresql/16/bin + Mailpit `scratchpad/mailpit`, `scratchpad/e2e-echt/`) + Wiederherstellungsprobe
  (`agent-a360d92e…`). Node 24: `scratchpad/node24/bin` vor PATH. Nach Abbruch: Arbeitsbäume als ZWISCHENSTAND committen,
  Workflow mit `resumeFromRunId` fortsetzen. Danach: mergen (Migrationen fortlaufend), Tor, echte E2E auf dem Merge-Stand,
  FF `main`, Stufe-C-Nachprüfung 2 (frischer Endprüfer), ABNAHME/BERICHT, ABSCHLUSS, CLAUDE.md-Block entfernen.
- **Stand 15.10. 17:40 UTC:** `main` = 033ea6f – Nacharbeit N1–N4 gemergt (alle Gegenprüfungen frei, Restmängel in zweiter
  Runde behoben). Tor: Unit 1488, Integration 2638, Sprachen, Religion, Bau wie frischer Import 1866 (Sweep 61/24, Crawl 1311
  ohne Fehler), Vorschau 2207. Läuft: Stufe-C-Nachprüfung `wf_a9e24335-d06` (Konten → Umbau → Öffentlich → Endprüfer).
  Danach: ABNAHME/BERICHT nachführen, ABSCHLUSS, CLAUDE.md-Block entfernen, letzter FF.
- **Stand 15.10. 10:30 UTC:** `main` = d10295f (Religion-Prüfung wieder grün: arabische Zitate in zwei Protokollen
  ersetzt). Nacharbeit: N2 fertig (89e4c43), N3 fertig (c812fc7), N1 mit ZWISCHENSTAND 691fd66; Fortsetzungs-Workflow
  `wf_8a45301c-16c` läuft (N1 fertigstellen, Gegenprüfung N1–N3, S2/S3 mit Behebung N4 in `agent-a2e7dbaf…`). Nach
  Abbruch: offene Arbeitsbäume als ZWISCHENSTAND committen, Workflow mit `resumeFromRunId` fortsetzen.
- **Stand 15.10. 05:40 UTC:** Stufe C gelaufen (`berichte/stufe-c.md`, `ABNAHME.md`: 7 erfüllt, 2 AUSNAHME, 12 teilweise),
  `main` = b241611 (nur Unterlagen seit 75cad0a). Läuft: Nacharbeit-Workflow `wf_1e893666-097` (N1 Leistung in
  `agent-ac6673f9…`, N2 Zugänglichkeit/Bewegung/Werte in `agent-a360d92e…`, N3 Funktion/Unterlagen in `agent-a212ace6…`,
  N4 Sicherheit S2/S3 in `agent-a2e7dbaf…`). Nach Abbruch: Workflow mit `resumeFromRunId` fortsetzen; fertige Branches
  mergen → Tor → FF → betroffene Stufe-C-Prüfungen erneut (o3, k1, o2 Z-03/Z-05, k2 Wortlaut, Z-13) → ABNAHME nachführen →
  ABSCHLUSS, CLAUDE.md-Block entfernen.
- **Stand 14.10. 19:40 UTC:** `main` = 75cad0a (Feinschliff Runde 3 gemergt; Tor grün: Unit 1438, Integration 1680,
  Bau wie frischer Import 1866 + Vorschau 2207, Sweep 61/24). Sichtabnahme Runde 3: alle 19 Ansichten ≥ 8 → Z-04 erfüllt
  (`berichte/sichtabnahme-3.md`). Entscheidungen L2-E04 (Vercel-Import) und L2-E05 (Null der Textschrift). Läuft: Stufe C
  (Workflow `wf_2c143eb4-fb9`: Konten → Umbau auf Import-Bau → Öffentlich → Endprüfer). Danach: ABNAHME.md mit Belegen,
  Protokolle nach `_gemeinde/protokolle/C-*`, BERICHT mit Galerie, ABSCHLUSS, CLAUDE.md-Block entfernen, letzter FF.
- **Stand 14.10. 17:30 UTC:** `main` = 4115a5e (Fast-Forward, Tor grün: Unit 1438, Integration 1680, Bau wie frischer
  Import 1866 + Vorschau 2207, Sweep 61/24 ohne Fehler). Darin: `web/vercel.json` (Import mit Root Directory `web`
  gleichwertig, b5441c0) und die drei Befundpakete der Sichtabnahme Runde 2 (A Hadith/Projekte, B Gruppenchat,
  C Seiten-Editor; je gegengeprüft, Mängel „mittel“ behoben). Vercel-Projekte des Nutzers: `igmg-wetzlar` (tez1, live)
  und `igmg` (uus-projects, Root Directory web, geschützt); dazu alte `igmg-ldk`, `web`, `spiegel` (Löschen empfohlen).
  Nächster Schritt: Nachbewertung der fünf Ansichten (Runde 3, Verfahren V-1/V-2), dann Stufe C, BERICHT mit Galerie,
  ABSCHLUSS, CLAUDE.md-Block entfernen.
- **Stand 14.10. 14:55 UTC – live:** Der Nutzer hat das Repo neu als Projekt `igmg-wetzlar` (Team tez1) importiert
  (11:25 UTC, Stand 759965e → 500, weil der Start ohne `APP_URL` abbrach). Mit `main` = 942b385 ist
  https://igmg-wetzlar.vercel.app live: 61 Adressen 200, 24 erwartete 404, 0 Fehler; Sitemap/canonical auf
  igmg-wetzlar.vercel.app; Funktionen in fra1. Weitere Projekte des Nutzers in `uus-projects` (igmg-ldk, web, spiegel –
  spiegel scheitert bei jedem Bau, Ursache nur im Vercel-Protokoll sichtbar). Deployment-Status ist über die öffentliche
  GitHub-API lesbar (`/repos/umutcantezgel-cpu/IGMG/deployments`).
- **Stand 14.10. 14:45 UTC:** `main` = 942b385 (Fast-Forward, Tor grün). Live erst nach Neu-Import durch den Nutzer
  (VERCEL.md §0: Add New › Project › Import, Root Directory leer, Preset „Services“ prüfen – oder `npx vercel@latest
  link --yes` im Stamm). Läuft: Sichtabnahme Runde 2 (`wf_18d601ae-373`, Juror 1 + Synthese). Danach: Bericht
  `berichte/sichtabnahme-2.md`, ggf. Befundpakete, Stufe C, BERICHT mit Galerie, ABSCHLUSS, CLAUDE.md-Block entfernen.
- **Stand 14.10. 08:45 UTC:** `main` = 759965e (alle 4 Befundpakete, Tor grün). Seit dem Push liefert
  igmg-five.vercel.app `DEPLOYMENT_NOT_FOUND` (Projekt/Domain in Vercel vermutlich entfernt – nur der Nutzer sieht das).
  Nutzerauftrag: Repo als neues Vercel-Projekt importierbar ohne Handgriffe → e66ee4e (Start ohne `APP_URL` auf Vercel mit
  `VERCEL_PROJECT_PRODUCTION_URL`, `tests/unit/vercel-import.test.ts`, VERCEL.md Abschnitt 0). Tor dafür: check,
  Integration, Sprachen (laufen), dann Bau wie frischer Import (`scratchpad/env-import.sh`: `VERCEL=1`,
  `VERCEL_ENV=production`, ohne `APP_URL`/`SITE_MODE`) + Sweep → Fast-Forward `main`. Sichtabnahme Runde 2
  (`wf_18d601ae-373`) läuft gegen den Vorschau-Server 3100 aus `web/.next` – Bau erst nach den Fotografen.
- **Stand 14.10. 05:30 UTC:** Sichtabnahme Runde 1 fertig (`berichte/sichtabnahme-1.md`, 11/19 abgenommen). Die 4
  Befundpakete laufen in ihren Arbeitsbäumen (`agent-ac6673f9…` P1 Koran/Hadith/Elifbe/Lernen, `agent-ac281c5b…` P2
  Startseite/Gebetszeiten/Projekte, `agent-a360d92e…` P3 Mein Bereich, `agent-a212ace6…` P4 Verwaltung), nach dem
  Container-Neustart per Nachricht fortgesetzt; nach Neustart: Arbeitsbaum committen (ZWISCHENSTAND) und Agent per
  SendMessage fortsetzen (keine neuen Arbeitsbäume – Platte knapp, ≈ 7 GB frei; alte gemergte Arbeitsbäume ≈ 25 GB darf
  nur der Nutzer entfernen). Erledigt: `_werkstatt/` archiviert, GO-LIVE Abschnitt G, BERICHT-Entwurf.
- **Danach:** Pakete mergen → Nachabnahme der 8 Ansichten (Vorschau-Server mit `pglite-sicht`, Beispielkonten, Admin
  über `scratchpad/werkzeug/einladung-pglite.ts`) → Tor → Fast-Forward → Stufe C → BERICHT mit Galerie → ABSCHLUSS.
- **Stand 13.10. 20:05 UTC:** `main` = c581594 live (`dpl_FC6GBM8cpj3WLm3KBQvU8d9i2xFB`): zusätzlich Anzeige-CMS (Migration
  0012), Vers/Hadith des Tages, D-14…D-17, Sicherheitsmail, Erzählansichten (Moschee eröffnet, Eröffnung in Über uns,
  Fastenbogen-Vorschau, Nachtzeichen), Brotkrumen-Kürzung, Konto-Einstiegsseiten prüfen den Schalter selbst. Tor: Bau
  Produktion 1866 + Vorschau 2207 Seiten, Integration 1680 grün, Unit 1395 (Speicherprobe robust gemacht), Religion 0,
  Sweep wie Vercel ohne Fehler; zweite Live-Prüfung ohne 5xx.
- **Läuft:** Sichtabnahme Z-04 (Workflow `wf_c540185b-0fe`) gegen den Vorschau-Server mit Beispieldaten
  (`scratchpad/pglite-sicht`, Konten `scratchpad/sicht/konten.json`, Admin-Einladung `scratchpad/sicht/admin-token.txt`).
  Danach: Befundpakete parallel umsetzen → Tor → Fast-Forward; dann Stufe C, BERICHT, `_werkstatt/` archivieren.
- **Stand 13.10. 19:05 UTC – Auftrag des Nutzers: „so viel live wie möglich“.** `main` = 2ee3e80 live
  (`dpl_ErTf52ypPHU5hC21df6S2nGAMQh6`): Beispielmodus ohne Absturz in Verwaltung/Konten (auth ohne Geheimnis nur mit
  Datenbank Pflicht; Sitzungslader ohne Datenbank null; /api/auth 404; Verwaltung zeigt Hinweis), Bukhari-Gesamt an
  (`IN_PRODUKTION_AN`, MN-06 vom Nutzer entschieden), Hadith-/Koran-Lader geschützt, Mikrofon nur in der Werkstatt,
  Konzept-Hinweis wieder modal, Wochenband gecacht (TZDate liest intern die Uhrzeit). Lokal wie Vercel (ohne Geheimnisse):
  61 + 22 Adressen nur 200/404, 0 Serverfehler; Bau 1845 Seiten.
- **Branch b5b3c71** = main + Erzählansichten H-B09 (Startseite „Unsere neue Moschee“, Fastenbogen B-20, Eröffnung in
  Über uns, Cüz-Ring-Staffel, Nachtzeichen) – Typen, Unit 1369, Sprachen grün; volle Integration läuft
  (`scratchpad/integration-live2.log`); erneute Live-Prüfung läuft (Workflow `wf_601a8df2-d3e`).
- **Läuft:** Anzeige-CMS + D-14…D-17 + Mail Passkey/2FA + Vers/Hadith des Tages (Agent ada6de6…, Migration 0012).
- **Nächster Schritt:** Live-Befunde beheben; Anzeige-Paket mergen; Bau (Produktion + Vorschau), Integration, Sweep wie
  Vercel → Fast-Forward `main`; danach Sichtabnahme (Workflow) und Stufe C.
- **Nur Menschen können freischalten:** Produktions-Datenbank (MN-00) + Geheimnisse (VERCEL-ENV.md) für Verwaltung/CMS
  und Konten; Personendaten-Funktionen zusätzlich nach MN-10/11/17.
- **Stand 13.10. 15:05 UTC:** Torstand E2 = Branch 0955108 (Beispielmodus-Schutz: zentrale Lader, Koran, Suche,
  Seiteninhalte; im Beispielmodus 61 öffentliche Adressen nur 200/404, 0 Serverfehler; Bau Produktion grün, 1399 Seiten).
  `origin/main` (b0bcc11, Vorlauf-ABSCHLUSS) ist enthalten. Offen vor dem Fast-Forward: volle Integration
  (`scratchpad/integration-tor.log`) und E2E-Ersatzlauf öffentlich (`scratchpad/e2e-tor.log`).
- **Fertig zusammengeführt, noch lokal:** Branch `zusammenfuehren-e3` im Arbeitsbaum `scratchpad/wt-merge` = 0955108 +
  Mein Bereich (785afc8) + Rezitations-Werkstatt (a88841b, `/audio` im Beispielmodus 404); Typen und Lint grün. Nach dem
  Fast-Forward von `main`: Session-Branch per Fast-Forward auf `zusammenfuehren-e3`, PGlite-Kopien migrieren, Unit +
  betroffene Integration, pushen.
- **Vorlauf abgeschlossen** (b0bcc11 ABSCHLUSS) → `_werkstatt/` darf in E7 nach `_archiv/` (Plan §0.1).
- **Stand 13.10. 14:25 UTC (Branch a0b13d9):** Zusammengeführt sind Recht, Hadith/Quellen/Moschee, Elifbe, Koran-Leser,
  Konten/Mein Bereich (Kern), CMS, Kür A (Hatim, Kalender, Ramadan, Spenden, Newsletter), Verwaltung Lernen + Aufnahme
  (Migration 0011), Koran-Verwaltung. Orchestrator: Startklar „Gemeinde-Plattform“, Wortlaut G-01…G-05, Löschfristen,
  Spiegel-Löschabgleich, Probe ohne Schlüssel, D-11, Kinderschutz-Modul, Offline-Koran, Gemeinde im Blick, Navigation
  (Kalender, Ramadan, Spenden; Hatim/Newsletter mit Schalter), **S1 behoben** (`_gemeinde/berichte/S1-sicherheit.md`).
- **Laufende Pakete:** Mein Bereich Unterricht/Kinder/Gruppe/Chat/Benachrichtigungen (a2e7dba), Rezitations-Werkstatt
  (a9358d9). Beide nach Abbruch fortgesetzt; nach Bericht mergen.
- **Tor E2 in Arbeit:** Produktionsbau läuft (`scratchpad/bau-produktion-2.log`); danach `next start` (Umgebung
  `scratchpad/start-env.sh`, SITE_MODE=produktion) und E2E-Ersatzlauf der öffentlichen Specs; Speicherproben-Unit-Test
  ohne Last wiederholen; volle Integration; dann `origin/main` mergen und Fast-Forward `main`.
- **E2E-Hinweis:** Nach einem Neuladen ohne Netz `context.setOffline(false/true)` erneut setzen (Playwright 1.64 überträgt
  die Offline-Nachbildung nicht auf den neu gestarteten Service Worker).
- **Danach:** D-14 (Migration), SVG-Programm je Route, Anzeige-CMS-Oberfläche, Vers-des-Tages-Liste (Schema), Mail bei
  neuem Passkey/2FA, Stufe C, BERICHT, `_werkstatt/` archivieren, ABSCHLUSS.
- **Wiederaufnahme nach Neustart:** `git worktree list`; je Branch `worktree-agent-*` prüfen, ob ein Abschluss-Commit
  existiert; unfertige Pakete per SendMessage fortsetzen. Eigene Server nur über ihre PID beenden (`scratchpad/start.pid`).
