# PRÜFPUNKT – Gemeinde-Plattform

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
