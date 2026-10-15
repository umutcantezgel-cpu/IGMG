# Stufe C, Nachprüfung · Prüfer k3 · Z-01, Z-02, Z-10, Z-11

Zeitpunkt: 15.10.2026, 16:40–17:20 UTC. Nur gelesen und Tests ausgeführt, nichts im Repository geändert
(`git status --short` vor und nach dem Lauf leer). Alle Dateien unter
`/tmp/claude-0/-home-user-IGMG/5899b547-bfdb-5933-87a3-0b05226c4116/scratchpad/stufe-c2/k3/` (im Folgenden `K/`).

## Prüfling

- `origin/main` = 033ea6f (15.10. 15:47:40 UTC). Branch-HEAD 38440af = 033ea6f + nur `_gemeinde/PRUEFPUNKT.md`
  (`git diff --stat 033ea6f HEAD`: 1 Datei). Lokaler Zweig `main` steht weiter veraltet auf 71e263f; maßgeblich `origin/main`.
- Server 3100: PID 12728 `next-server (v16.4.0)`, cwd `web`, `SITE_MODE=vorschau`, `BAU_PGLITE=1`, Daten `scratchpad/pglite-sicht`;
  `.next/BUILD_ID` = e3nweErdOdf1jsAtYsjE2 vom 15.10. 16:21:28 UTC (nach 033ea6f), `/api/health` → `{"status":"ok"}`.

## Z-01 Plan – teilweise

Pflichtzeilen `AUFTRAG.md:87-105` wie in `protokolle/C-k3-protokoll-k3.md` erneut; alle 30 dort genannten Code-Pfade und
17 Testdateien bestehen in 033ea6f (Abgleich gegen `git ls-tree`, `K/baum-033ea6f.txt`). Änderungen seit 75cad0a an den drei
Lückenzeilen:

| AUFTRAG | Teil | 75cad0a | 033ea6f | Beleg |
|---|---|---|---|---|
| :99 | Push-Thema „ankuendigung“ | kein Versand | **versendet** | Aufruf `web/src/server/actions/ankuendigungen.ts:97-98` (`after(() => sendeAnkuendigungsPush(zielId))` beim ersten Veröffentlichen mit Recht `push.ankuendigung`); Takt `web/src/app/api/wartung/takt/route.ts:28` → `sendeFaelligeAnkuendigungen` (`web/src/lib/push/ankuendigung.ts:151-197`, zweiphasig Verfall/Versand :40-41); Versand je Abo `ankuendigung.ts:77-114` (Einmal-Schlüssel :104-109, Kinder nur mit Einwilligung :100-103). Test: `vitest run --project integration tests/integration/push-ankuendigung.test.ts tests/integration/verwaltung-ankuendigungen.test.ts` → **2 Dateien, 60/60 grün** (`K/int-push-ankuendigung.log`); dazu im Volllauf (unten). |
| :99 | Rückfall Mail-Zusammenfassung / In-Seite-`Notification` | fehlt | **fehlt weiter** | kein `new Notification`, Mail-Vorlagen nur `Rahmen`, `newsletter`, `konto-vorlagen`; ehrlich dokumentiert als F-38 „offen (nicht gebaut)“ (`berichte/funktionsliste-gemeinde.md:40`), `handbuch/eltern.md:105` „Eine Erinnerung per E-Mail gibt es nicht“. ADR 0034 Nr. 6 (`web/docs/adr/0034-web-push-ohne-bibliothek.md:24`) nennt den Rückfall weiter als Entscheidung, ohne Vermerk „nicht umgesetzt“; keine Entscheidung in ENTSCHEIDUNGEN. |
| :100 | Startseite sortierbar, Verwaltung „Islamisches Wissen“ | fehlt, Handbuch versprach es | **fehlt weiter, ehrlich dokumentiert** | keine Route `verwaltung/(geschuetzt)/startseite` oder `…/wissen` (find), Rechte `startseite.bearbeiten`/`wissen.bearbeiten` nur in `lib/rechte/matrix.ts` ohne Aufrufer; F-40 „offen (nicht gebaut; Handbücher nachgeführt)“ (`funktionsliste-gemeinde.md:42`); `handbuch/redaktion.md:5,94,116` und `handbuch/imam.md:48` sagen „gibt es nicht“. Keine Entscheidung zur Abweichung in ENTSCHEIDUNGEN. |
| :104 | Voranmeldung ↔ Kurs | nur mittelbar | unverändert | F-44 „teilweise“ (`funktionsliste-gemeinde.md:46`) |

PLAN: alle 57 Hashes in `PLAN.md` (Stand 033ea6f) sind Vorfahren von 033ea6f; die veralteten Zeilen von 75cad0a sind
nachgeführt (O-B01 1281d68, O-K05 b4c1a9a, H-X01 1c8117e/b4c1a9a/4aff0f4, O-F01 53e78ad, H-B09, Vercel-Import, Sichtabnahme,
Stufe C, N3). **Aber:** PLAN zuletzt geändert in c812fc7 (15.10. 06:30 UTC); `PLAN.md:38` „weitere Nacharbeit Stufe C (N1, N2, N4)
… in Arbeit“ ohne Commit, obwohl N2 (89e4c43, Merge a0a73f3), N4 (2504b1d, 9cf309d, Merge 69ad49c), N1 (65b51b0, cbc2ff1,
Merge 033ea6f) und die N3-Nachträge (7a61f0a, bfb3546) auf main sind; `PLAN.md:37` nennt den N3-Abschluss ohne Hash (c812fc7).

**Urteil Z-01: teilweise** – Ankündigungs-Push jetzt geliefert und getestet; Pflicht weiter nicht 100 %: Push-Rückfall,
sortierbare Startseite und Verwaltung „Islamisches Wissen“ nicht gebaut (ehrlich dokumentiert, Abweichung aber nicht
entschieden), Voranmeldung↔Kurs nur mittelbar; PLAN für N1/N2/N4 nicht nachgeführt.

## Z-02 Bestand – erfüllt (mit Hinweisen)

Suiten (vorgelegte Logs, 15.10. ab 15:49:54 UTC, nach Commit 033ea6f 15:47:40; nennen keinen Hash):
`tor-n-check.log` „Test Files 103 passed · Tests 1488 passed | 3 expected fail (1491) · check exit 0“ (typen+lint+unit),
`tor-n-int.log` „68 passed | 1 skipped (69) · 2638 passed | 2 expected fail | 4 skipped (2644) · int exit 0“,
`tor-n-rel.log` „Religion-Prüfung grün: 5358 Dateien“, `tor-n-spr.log` „2961 Schlüssel … 4114 Verwaltung“.
Eigene Wiederholung auf HEAD 38440af (Code = 033ea6f): `pnpm test:unit` → **103 Dateien, 1488 grün + 3 erwartet**
(`K/unit-eigen.log`, 16:45 UTC); `pnpm test:integration` → **68 + 1 übersprungen, 2638 grün, 2 erwartet, 4 übersprungen,
exit 0** (`K/int-eigen.log`, 16:49–17:10 UTC). Gegenüber 75cad0a (1438 / 1680) gestiegen; übersprungen bleibt
`wartung-sperre-postgres` (echtes Postgres, UMGEBUNGSAUSNAHME); E2E (Docker/Mailpit) nicht gelaufen = UMGEBUNGSAUSNAHME.

Funktionsliste F-01…F-24 – Befehl:
`SCRATCHPAD=$S node _gemeinde/werkzeuge/funktionsliste.mjs --basis http://localhost:3100 --protokoll K/funktionsliste-3100
--bilder K/bilder-funktionsliste --hinweis "…"` → exit 0, „Funktionen: 24 · technische Fehler: 0“, 14 Formular-POSTs
(nur leere/Schritt-Prüfungen), ohne Anmeldezustand. Ergebnis **gleich dem Vorlauf-Endstand**
(`_archiv/lauf-gestaltung-2026-10/protokolle/C-funktionsliste-3500.md`) in allen Zeilen außer F-20:
- F-02: jetzt erfüllt/erfüllt (vorher 390 nicht prüfbar).
- F-03: nicht prüfbar/nicht prüfbar wie im Vorlauf; alle Teilprüfungen erfüllt (fünf Tabs, Tastatur Pfeil→Mein Ort→Monatlich,
  Ende→Einstellungen, Pos1→Heute; Monatstabelle „Oktober 2026 – Gebetszeiten“; Kompass 1); einzig „Monat wechselt“ = offene
  Frage seit dem Vorlauf (kein Bedienelement). Bild `K/bilder-funktionsliste/F-03-monat-390.jpg` (angesehen).
- F-08: jetzt erfüllt/erfüllt (`/projekte` H1 „Neue Fatih-Moschee ist eröffnet“ zählt).
- F-06, F-07, F-12 nicht prüfbar (Datenlage, wie Vorlauf); F-21 nicht prüfbar (wie Vorlauf).
- F-20 (1440) nicht prüfbar (Vorlauf erfüllt): Anmeldung bräuchte den gestoppten Server bzw. schreibt Sitzungen – Regel
  „keine Server beenden, nur lesend“. Ersatz: Integration grün inkl. `tests/integration/verwaltung/rechte-anmeldung.test.ts`
  (Anmeldeschritte, Zwei-Faktor-Einrichtung, Abmelden) und `tests/integration/anmeldung-audit.test.ts` (TOTP, Ersatzcode).
F-25…F-60: jetzt definiert in `_gemeinde/berichte/funktionsliste-gemeinde.md` (Pflicht F-25…F-45, Kür A F-46…F-53, Kür B
F-54…F-60) mit Route und Test je Zeile; alle 69 genannten Testdateien bestehen in 033ea6f; Zählung :83-86 nachgerechnet
(Pflicht 16 erfüllt, 2 nur Code, 1 teilweise, 2 offen). „Ohne Rückschritt“ über die grünen Suiten.

Konsole (`node _gemeinde/werkzeuge/tor/konsole3.mjs --routen K/routen-haupt-k3.json` = 46 Routen der ersten Prüfung,
Protokoll `K/konsole-haupt.json`): 45×200, 1×404; Konsolenfehler/-warnungen nur auf `/gibt-es-nicht` (gewolltes 404, wie
vorher). `/gebetszeiten/anzeige` jetzt 0 (vorher Umgebungs-404 Bild). Neu: `/verwaltung/anmelden` 2× „anfrage-fehlgeschlagen
net::ERR_ABORTED“ für RSC-Prefetch `/verwaltung/passwort-vergessen?_rsc=…` (2× wiederholt, `K/konsole-wdh-1.json`,
`-2.json`); Sonde `K/prefetch-probe.json`: Antwort 200 nach 25 ms, danach bricht der Next-Router das Lesen ab; 0
Konsolenmeldungen. Kein Konsolenfehler, keine Nutzerwirkung – nur Hinweis.

## Z-10 Übergabe – teilweise

| Teil | Beleg | Befund |
|---|---|---|
| Galerie auf main | `git show 033ea6f:_gemeinde/BERICHT.md` :96-111, 18 Verweise, alle 18 Dateien in 033ea6f (`git cat-file -e`) | **vorhanden** (Lücke geschlossen) |
| BERICHT-Stand | `BERICHT.md:3` „Stand 15.10.2026 (`main` = 75cad0a)“; :75-84 „Stand der Prüfungen (… 75cad0a)“, Unit 1438/Integration 1680; :86-94 Urteil nennt S2/S3 „nicht stattgefunden“ | **veraltet** gegenüber 033ea6f (1488/2638, S2/S3 in `berichte/S2-S3-sicherheit.md`); laut `PRUEFPUNKT.md:3-5` nach dieser Nachprüfung geplant. `ABNAHME.md:6` ebenso Stand 75cad0a. |
| KERN-Verweise | `KERN.md:3` → `_archiv/lauf-gestaltung-2026-10/KERN.md` (existiert), `web/docs/MUSTER.md` (existiert); B-25 `KERN.md:68` mit `AnzeigeLive.tsx`; 57 Code-Pfade in KERN geprüft, alle vorhanden außer dem historisch markierten `_werkstatt/KERN.md` | **behoben** |
| MENSCHEN-Verweise | `MENSCHEN.md:3-4` → `_archiv/…/MENSCHEN.md`, `_lauf/MENSCHEN.md` (beide vorhanden) | behoben; **aber** `MENSCHEN.md:32` MN-23 „Vergabe … nur durch ein Konto mit Rolle `leitung` …; die erste Person per `pnpm verwaltung:einladen`“ widerspricht N4: Administration beantragt, zweite Person mit Leitung/Kinderschutz bestätigt, Einladung erzeugt bei Annahme nur einen Antrag (`web/src/lib/rechte/schutzrollen.ts:8-21`, `web/src/server/actions/benutzer.ts:153-161`, `web/src/server/actions/anmeldung.ts:259`) |
| PLAN | s. Z-01 | N1/N2/N4 nicht nachgeführt (`PLAN.md:38`) |
| Handbücher – Stichprobe 5 | (1) `redaktion.md:45` Ankündigungs-Push nur beim ersten Veröffentlichen, später Beginn 1–2 min danach, Organisationsredaktion ohne Hinweis, 3 Tage → `ankuendigungen.ts:97-98`, `ankuendigung.ts:40-41`, `matrix.ts:177` vs. `:179-197`, `abo.ts:114` + `api/wartung/loeschfristen/route.ts:28`: **stimmt**. (2) `redaktion.md:94` Startseite fest, „Empfohlen“ 30 Tage → `server/queries/nachrichten.ts:80,88-95`, keine Route: **stimmt**. (3) `redaktion.md:86` Seiten-Zeitplan ohne automatisches Ende → `lib/db/schema/cms.ts:23` nur `veroeffentlichenAm`: **stimmt**. (4) `eltern.md:105` Chat-Push höchstens 1 je 10 min, keine Mail → `lib/push/gruppe.ts:15,19`: **stimmt**. (5) `eltern.md:133` Einwilligungen 30 Tage nach dem 16. → `lib/konto/sechzehn.ts:3,7`: **stimmt**. Zusatz: `imam.md:48` Wissensthemen ohne Verwaltung, `lehrkraefte.md:97` 500 Zeichen (`lib/chat/regeln.ts:7`): stimmen. | 5/5 stimmen |
| Handbücher – N4 nicht nachgeführt | Handbücher zuletzt eef0cfb (06:16 UTC), N4 danach. `kinderschutz.md` nennt nicht, dass die Seite „Kinderschutz“ Rollen-Anträge (Vergabe/Entzug von Leitung, Kinderschutz, religiöser Prüfung, Eltern-Kind-Bezug beenden) zur Bestätigung zeigt (`app/[locale]/verwaltung/(geschuetzt)/kinderschutz/page.tsx:7,69` `RollenAntraege`; `benutzer.ts:260-263`) | Lücke |
| GO-LIVE | Abschnitt G vorhanden (`GO-LIVE.md:197-247`). **Veraltet:** `:205` „Migrationen 0000–0012“, in 033ea6f gibt es 0013 und 0014 (`web/drizzle/migrations/0013_sicherheit_s2_s3.sql`, `0014_vier_augen_n4.sql`); `:212` „`kinderschutz` (MN-23, nur durch ein Konto mit Rolle `leitung` vergeben)“ widerspricht N4 (s. MENSCHEN) | teilweise |
| VERCEL.md | §0 `:61-107` Import, beide `vercel.json`, Test genannt – stimmt; §10 `:369-383` Fast-Forward, kein Erzwingen, Cache erneuern; Verweis L-E01 löst auf (`_archiv/…/ENTSCHEIDUNGEN.md:5`); §12 `:413-429` Instant Rollback, Revert, Datenbank additiv, Übung; §14 `:457-460` jetzt mit Pfad `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md`, ML-09 dort `:33` vorhanden | vorhanden; Hinweis: 16× „Projekt `igmg`“, 0× `igmg-wetzlar` (live ist `igmg-wetzlar`; `igmg` existiert und deployt ebenfalls); Kopf „Stand: 11.10.2026“ |

## Z-11 Vercel – erfüllt (Abweichung Audio entschieden)

- Audio: `_gemeinde/ENTSCHEIDUNGEN.md` L2-E06 (Route `/audio/[...pfad]` statt Rewrite, Begründung Schutz nicht aktiver
  Rezitationen, gleicher Ursprung, Import ohne Einstellungen; Abweichung von `AUFTRAG.md:208,564` ausdrücklich benannt;
  Entscheider „Orchestrator“). ADR 0029 `:3` „Status: angenommen … Nr. 1 geändert am 15.10.2026“, `:15-18` Route,
  `:39` Rewrite verworfen. Route `web/src/app/audio/[...pfad]/route.ts` vorhanden; Bytebereiche/Schutz im Test
  `tests/integration/verwaltung-rezitationen.test.ts:369-385` (im Volllauf grün). Weder `vercel.json` noch `web/vercel.json`
  enthalten „audio“.
- `vercel.json`/`web/vercel.json`: absichtlich nicht byte-gleich (Stamm = Services-Form), gleichwertig per Test:
  `vitest run --project unit tests/unit/vercel-import.test.ts` → **7/7 grün** (`K/unit-vercel.log`; prüft `regions`,
  `crons`, `framework`, `ignoreCommand`, keinen `services`-Block in `web/`). Seit 75cad0a unverändert (nur `web/next.config.ts`
  +3 Zeilen `turbopackChunking`).
- Live für 033ea6f: GitHub-API `/repos/umutcantezgel-cpu/IGMG/deployments` (`K/gh-deployments.json`): 7098340184
  „Production – igmg-wetzlar“ sha 033ea6f, 16:29:34Z, Status **success** → `igmg-wetzlar-i98by2nbg-tez1.vercel.app`
  (`K/gh-status-7098340184.json`); jüngste Produktion dieses Projekts (Vorgänger d10295f, b241611, 75cad0a). Ebenso
  „Production – igmg“ 7098349348 success. 38440af nur Preview. Inhaltsbeleg: Klasse `breite-nach-muster` (nur ab cbc2ff1, in
  d10295f/a0a73f3 0 Treffer) live auf `/gebetszeiten` vorhanden (`K/live/gebetszeiten.html`); `druck` statt `active:scale-98`
  live auf `/ueber-uns`. canonical `https://igmg-wetzlar.vercel.app/gebetszeiten`.
- Statuscodes (`K/live-routen.txt`, 15.10. ~16:48 UTC): 30 Inhaltsrouten (Quran, Hadith, Elifbe, Lernen, Gebetszeiten,
  Anzeige, Kalender, Ramadan, Spenden, Quellen, Barrierefreiheit, Projekte, Über uns, Nachrichten, Veranstaltungen, Kontakt,
  Suche, /tr, /en, /tr/namaz-vakitleri, /verwaltung) **200**; `/barrierefreiheit` erst im zweiten Versuch (TLS-Abbruch im
  Proxy, dann 200). Erwartet: `/api/health` 503 (ohne DB), `/audio/x.mp3` 404, `/hatim` 404, `/newsletter` 404,
  `/gibt-es-nicht` 404. Funktionen in fra1: `x-vercel-id: iad1::fra1::…` auf `/api/health`, `/audio/x.mp3`,
  `/gibt-es-nicht` (Kante iad1 = Ausgang des Proxys).
- Hinweis: Soft-404 weiter live: `/mein-bereich`, `/anmelden`, `/registrieren` HTTP 200 mit Titel „Seite nicht gefunden“ und
  `noindex` (Endprüfer Nachprüfung 15, unverändert).

## Dateien

`K/protokoll-k3.md` (dieses), `K/int-push-ankuendigung.log`, `K/unit-eigen.log`, `K/int-eigen.log`, `K/unit-vercel.log`,
`K/funktionsliste-3100.md|.json|.log`, `K/bilder-funktionsliste/`, `K/routen-haupt-k3.json`, `K/konsole-haupt.json|.log`,
`K/routen-wdh.json`, `K/konsole-wdh-1.json`, `K/konsole-wdh-2.json`, `K/skripte/prefetch-probe.mjs`, `K/prefetch-probe.json`,
`K/gh-deployments.json`, `K/gh-status-*.json`, `K/live-routen.txt`, `K/live/*.html`, `K/PLAN-033ea6f.md`,
`K/KERN-033ea6f.md`, `K/VERCEL-033ea6f.md`, `K/GO-LIVE-033ea6f.md`, `K/baum-033ea6f.txt`, `K/fl-tests.txt`.
