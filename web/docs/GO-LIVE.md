# GO-LIVE: Was vor dem Livegang erledigt sein muss

Stand: 12.10.2026 (Abschluss des Gestaltungs- und Vercel-Laufs), Nachtrag 28.10.2026 (Marktstart IGMG: B6, C6–C14, G1). Diese Liste sagt dir, was vor der ersten öffentlichen Veröffentlichung auf Vercel fertig sein muss. Der Weg dorthin steht in **VERCEL.md** (Runbook, etwa 30 Minuten). Was nur ein Mensch entscheiden oder erledigen kann, steht in **MENSCHEN.md**.

## So liest du die Liste

- **Ort:** Wo du es erledigst.
- **Aufwand:** Schätzung der reinen Arbeitszeit. Wartezeiten stehen extra dabei.
- **Wer:** **Vorstand** entscheidet oder bestätigt. **Technik** richtet ein oder führt aus.
- **Das siehst du, wenn es geklappt hat:** Der Prüfpunkt.
- **[Code fehlt]:** Dieser Punkt braucht noch Arbeit im Programm. Er ist ein Hindernis für den Livegang.

Die Reihenfolge ist: A, dann B, dann C, dann D, dann E; danach G (Gemeinde-Plattform). Einige Punkte in C und D lassen sich parallel erledigen.

## A. Zugänge und Konten

- [ ] **A1 · Vercel-Team mit zwei Verantwortlichen**
  - **Ort:** Vercel › Team-Einstellungen › Mitglieder **[prüfen: Menüname]**.
  - **Aufwand:** 15 Minuten.
  - **Wer:** Vorstand benennt die Personen, Technik richtet sie ein.
  - **Das siehst du, wenn es geklappt hat:** Zwei Personen sehen das Projekt `igmg`, damit der Zugang bei Krankheit oder Urlaub nicht an einer Person hängt.

- [ ] **A2 · Zugriff auf das GitHub-Repository**
  - **Ort:** GitHub › Repository › Settings › Collaborators **[prüfen]**.
  - **Aufwand:** 10 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Die Verbindung zu Vercel läuft, und Vorschauen entstehen bei neuen Ständen **[prüfen: VERCEL.md, Abschnitt 5.1]**.

- [ ] **A3 · Neon-Konto für die Datenbank**
  - **Ort:** Vercel › Projekt `igmg` › Storage **[prüfen]** (siehe VERCEL.md, Abschnitt 2).
  - **Aufwand:** 10 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Die Datenbank ist mit dem Projekt verbunden.

- [ ] **A4 · Mailanbieter gewählt und Zugang eingerichtet**
  - **Ort:** Vertragsunterlagen des Anbieters, dann die Werte in Vercel (VERCEL.md, Abschnitt 4).
  - **Aufwand:** Abhängig vom Anbieter.
  - **Wer:** Vorstand entscheidet und schließt den Vertrag. Technik trägt die Zugangsdaten ein.
  - **Stand:** Der Anbieter ist **offen**. Dazu gibt es in MENSCHEN.md den Eintrag **ML-10**.
  - **Das siehst du, wenn es geklappt hat:** Eine Testmail geht aus der Vorschau an eine Adresse im Vorstand.

- [ ] **A5 · Zugang zur Domainverwaltung**
  - **Ort:** Dort, wo `[deine-domain.de]` registriert ist.
  - **Aufwand:** 10 Minuten.
  - **Wer:** Vorstand hat das Konto, Technik setzt die Einträge.
  - **Das siehst du, wenn es geklappt hat:** Technik kann die DNS-Einträge anlegen, und der Vorstand kennt das Konto.

## B. Technik-Grundlagen

- [ ] **B1 · Datenbank in Frankfurt mit Vorschau-Zweigen**
  - **Ort:** VERCEL.md, Abschnitt 2 (Neon über den Vercel Marketplace).
  - **Aufwand:** 15 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Neon zeigt die Region Frankfurt, die Vorschau hat einen eigenen Zweig und die Produktion einen anderen.

- [ ] **B2 · Dateispeicher in Frankfurt (Vercel Blob)**
  - **Ort:** VERCEL.md, Abschnitt 3.
  - **Aufwand:** 10 Minuten im Dashboard.
  - **Wer:** Technik.
  - **Code:** vorhanden (`SPEICHER=blob`, `web/src/lib/storage/index.ts`, ADR 0020). Auf Vercel verkleinert der Browser Bilder über 4,2 MB vor dem Hochladen; PDF-Dateien über 4,2 MB (bis 10 MB) lädt er direkt in Vercel Blob (ADR 0020).
  - **Das siehst du, wenn es geklappt hat:** Ein Testbild lässt sich in der Vorschau über die Verwaltung hochladen und erscheint auf der Seite.

- [ ] **B3 · Umgebungsvariablen für Produktion und Vorschau**
  - **Ort:** VERCEL.md, Abschnitt 4. Die vollständige Liste steht in `web/docs/deploy/VERCEL-ENV.md`.
  - **Aufwand:** 30 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Jede Variable aus VERCEL-ENV.md ist in Vercel eingetragen, für den richtigen Bereich. `SITE_MODE` ist für Produktion `produktion` und für Vorschau `vorschau`.

- [ ] **B4 · Geheimnisse erzeugt und sicher abgelegt**
  - **Ort:** Ein Passwortmanager der Gemeinde. VERCEL.md, Abschnitt 4.3.
  - **Aufwand:** 15 Minuten.
  - **Wer:** Technik erzeugt. Vorstand bestätigt, dass eine zweite Person Zugriff auf den Passwortmanager hat.
  - **Das siehst du, wenn es geklappt hat:** Alle Geheimnisse liegen im Passwortmanager, und `EINGANG_SCHLUESSEL` ist zusätzlich getrennt vom Datenbank-Backup gesichert (`web/docs/BETRIEB.md` § 3).

- [ ] **B5 · Absender und Mailversand**
  - **Ort:** Vercel › Projekt `igmg` › Settings › Environment Variables **[prüfen]**.
  - **Aufwand:** 20 Minuten.
  - **Wer:** Technik.
  - **Hinweis:** `MAIL_ABSENDER` darf nicht auf der Platzhalteradresse `noreply@example.test` bleiben (`web/src/lib/mail/transport.ts` Zeile 35).
  - **Das siehst du, wenn es geklappt hat:** Ein Formular in der Vorschau schickt eine Bestätigungsmail, und die Absenderadresse ist `[noreply@beispiel.de]`. Formulardaten bitte nur mit einer Testeingabe senden.

- [ ] **B6 · Wiederkehrende Aufgaben (Crons)**
  - **Ort:** `vercel.json` (Abschnitt `crons`) und Vercel › Projekt › Cron Jobs **[prüfen]**.
  - **Aufwand:** 15 Minuten.
  - **Wer:** Technik.
  - **Code:** vorhanden (`vercel.json` › `crons`: Löschfristen 01:00 UTC, Mail-Ausgang 02:00 UTC; seit dem Marktstart dazu Gebetszeiten-Abgleich 20:00 UTC und Dachverband-Abgleich 04:00 UTC, siehe C8). Nötig ist nur `CRON_SECRET` in Production.
  - **Das siehst du, wenn es geklappt hat:** Die Löschfristen und der Mail-Ausgang laufen täglich. Die Antwort der Löschroute nennt die Anzahl gelöschter Einträge (`web/docs/BETRIEB.md` § 4).

- [ ] **B7 · Bau nach ADR 0019 eingeschaltet**
  - **Ort:** `web/package.json`, Zeile 8 (`vercel-build`).
  - **Aufwand:** 5 Minuten, plus Prüfung.
  - **Wer:** Technik.
  - **Stand:** eingeschaltet (`vercel-build` → `scripts/vercel-bau.mjs`).
  - **Das siehst du, wenn es geklappt hat:** Im Build-Protokoll steht `[bau] Datenbank vorhanden`, und die Migration läuft unter Sperre.

## C. Inhalte und Recht

- [ ] **C1 · Hinweisfenster „Alle angezeigten Daten sind fiktiv“ abschalten (ML-03)**
  - **Ort:** Verwaltung › Startklar-Cockpit (`/verwaltung/startklar`), Zeile „Hinweis ‚Konzept-Website‘“ › „Hinweis ausschalten“ (nur Administration).
  - **Aufwand:** 5 Minuten.
  - **Wer:** Technik.
  - **Was passiert:** Das Fenster wird nur angezeigt, wenn der Wert `konzepthinweis` in der Zeile `allgemein` auf `true` steht (`web/src/components/website/Seitenrahmen.tsx` Zeilen 56 und 78; `web/src/lib/validierung/einstellungen.ts` Zeile 37). Die Werte stehen in der Tabelle `einstellung` (`web/src/lib/db/schema/system.ts` ab Zeile 24).
  - **Ersatzweg ohne Verwaltung (Notfall):** in der Neon-Konsole `UPDATE einstellung SET wert = jsonb_set(wert, '{konzepthinweis}', 'false'::jsonb) WHERE schluessel = 'allgemein';`
  - **Das siehst du, wenn es geklappt hat:** Beim ersten Besuch der Startseite erscheint kein Fenster, und das Cockpit zeigt den Punkt als erledigt.

- [ ] **C2 · Platzhalter in den Rechtstexten gefüllt**
  - **Ort:** Verwaltung › Seiteninhalte › Impressum und Datenschutz **[prüfen]**.
  - **Aufwand:** 60 Minuten (Schätzung).
  - **Wer:** Vorstand liefert die Angaben. Technik trägt sie ein.
  - **Regel:** Der Wortlaut der Rechtstexte bleibt unverändert. Nur die Platzhalter in eckigen Klammern werden durch echte Angaben ersetzt. Erfundene Angaben sind nicht erlaubt (`web/CLAUDE.md`, Abschnitt zu Personendaten und Platzhaltern).
  - **Fundstellen der Platzhalter:** `web/drizzle/seeds/bereiche/rechtliches.ts` (unter anderem Zeilen 16–24, 40, 152 und 178; alle Stellen mit eckiger Klammer finden).
  - **Das siehst du, wenn es geklappt hat:** Auf `/impressum` und `/datenschutz` stehen keine eckigen Klammern mehr.

- [ ] **C3 · Rechtliche Prüfung**
  - **Ort:** MENSCHEN.md, Punkte ML-01 (Einwilligungs-Banner) und ML-11 (Hosting-Baustein).
  - **Aufwand:** 60 Minuten (Schätzung), plus Wartezeit der Rechtsberatung.
  - **Wer:** Vorstand, mit Rechtsberatung.
  - **Das siehst du, wenn es geklappt hat:** Die Rechtsberatung bestätigt die Annahmen, dass ohne Drittanbieter kein Einwilligungs-Banner nötig ist, und der Baustein für Vercel ist in MENSCHEN.md zur Prüfung eingetragen.

- [ ] **C4 · Verarbeitungsverzeichnis**
  - **Ort:** `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` (Vorlage liegt vor; Ergänzung nach ML-12).
  - **Aufwand:** 30 Minuten.
  - **Wer:** Vorstand prüft. Technik liefert Region und Anbieter.
  - **Das siehst du, wenn es geklappt hat:** Vercel, Neon, Vercel Blob und der Mailanbieter stehen mit Rolle, Region und Auftragsverarbeitungsvertrag darin (AUFTRAG V-11).

- [ ] **C5 · Tarif entschieden**
  - **Ort:** MENSCHEN.md, Eintrag ML-09 (Tarif).
  - **Aufwand:** 15 Minuten.
  - **Wer:** Vorstand.
  - **Stand:** Die Empfehlung steht in MENSCHEN.md als ML-09. Die Entscheidung fehlt noch.
  - **Das siehst du, wenn es geklappt hat:** Der Tarif ist entschieden und begründet dokumentiert.

- [ ] **C6 · Inhalte vom Dachverband prüfen (Marktstart IGMG)**
  - **Ort:** `_lauf/MENSCHEN.md`, Punkte M-099 bis M-102; Seiten `/igmg`, `/ueber-uns`, `/hadsch-umra`, `/islamisches-wissen`, `/spenden`, `/mitglied-werden`, Fußzeile.
  - **Aufwand:** 2–3 Stunden, verteilt auf Vorstand, Imam und zwei Muttersprachler.
  - **Wer:** Vorstand legt die schriftliche Zustimmung der IGMG ab (M-099). Imam prüft die vier Erklärtexte, „Bedeutung“ und Leitbild (M-101). Muttersprachler prüfen Türkisch und Englisch (M-102, Liste in `web/messages/neu-uebersetzt.json`).
  - **Das siehst du, wenn es geklappt hat:** M-099 bis M-102 tragen eine Antwort; die Zustimmung liegt als Datei beim Vorstand.

- [ ] **C7 · IGMG-Gebetszeiten als offizielle Quelle**
  - **Ort:** IGMG (Anfrage, M-100), Vercel › Environment Variables (Production), Verwaltung › Gebetszeiten.
  - **Aufwand:** 30 Minuten, plus Wartezeit auf die IGMG.
  - **Wer:** Vorstand fragt an, Technik richtet ein.
  - **Schritte:**
    1. Offiziellen Zugang bei der IGMG anfragen (Feed mit Schlüssel oder Jahresdatei für Wetzlar, Stadt-ID 20238; dazu Rechenmethode und Sommerregel; M-100).
    2. `GEBETSZEITEN_IGMG_URL` (https, Platzhalter `{stadt}`, `{jahr}`, `{monat}`) und gegebenenfalls `GEBETSZEITEN_IGMG_SCHLUESSEL` in Production setzen (`docs/deploy/VERCEL-ENV.md`), neu bereitstellen. Eine gelieferte Jahresdatei liegt stattdessen unter `web/daten/igmg-gebetskalender/<stadtId>-<jahr>.csv` mit `QUELLE.md` (SHA-256, Abrufdatum).
    3. Verwaltung › Gebetszeiten › „IGMG-Abgleich“: einschalten und die Freigabe-Art wählen („sofort übernehmen“ oder „erst nach Freigabe“).
    4. Bis der Zugang da ist: Monate über „Tabelle aus dem IGMG-Gebetskalender einfügen“ übernehmen (`docs/handbuch/redaktion.md` 12.5).
  - **Das siehst du, wenn es geklappt hat:** Für die nächsten 30 Tage liegen IGMG-Zeiten vor (unter 7 Tagen ist es in der Produktion ein Fehler). Im Startklar-Cockpit sind `inhalte.gebetszeiten-abdeckung`, `inhalte.gebetszeiten-abgleich`, `inhalte.gebetszeiten-konflikte`, `inhalte.gebetszeiten-datei` und `inhalte.gebetszeiten-igmg-zugang` grün oder begründet. `/gebetszeiten` zeigt „Quelle: IGMG-Gebetskalender, Stand …“ statt „berechnet (vorläufig)“.

- [ ] **C8 · `CRON_SECRET` und die vier Crons**
  - **Ort:** Vercel › Projekt › Settings › Environment Variables und Cron Jobs **[prüfen: Menüname]**; `vercel.json` und `web/vercel.json`.
  - **Aufwand:** 15 Minuten.
  - **Wer:** Technik.
  - **Was läuft (UTC):** `loeschfristen` 01:00, `mail-ausgang` 02:00, `dachverband-abgleich` 04:00, `gebetszeiten-abgleich` 20:00 (nur wenn in der Verwaltung eingeschaltet). Tabelle mit lokalem Takt: `web/docs/BETRIEB.md` § 9a.
  - **Tarif:** Die Zahl der Crons kann je Vercel-Tarif begrenzt sein; vier Crons gegen den gewählten Tarif prüfen (C5).
  - **Das siehst du, wenn es geklappt hat:** Vercel führt alle vier Crons, und ihre Läufe enden mit Status 200. Der Dachverband-Abgleich steht im Audit-Log (`dachverband.abgleich`).

- [ ] **C9 · Stand-Migration „marktstart“ für bestehende Datenbanken**
  - **Ort:** Vercel-Bau (automatisch) oder Kommandozeile (Docker).
  - **Aufwand:** 5 Minuten.
  - **Wer:** Technik.
  - **Was passiert:** `pnpm inhalte:marktstart` bringt die Beispielstände von IGMG, Über uns, Vorstand, den vier Organisationen, „Aus dem Dachverband“, „Hadsch & Umra“, die vier Wissens-Entwürfe und die Videos von IGMG Reisen in die Datenbank. Ersetzt werden nur Zeilen mit `istBeispiel = true`; fehlende Bereiche werden angelegt; ein zweiter Lauf ändert nichts (ADR 0019, Nachtrag 2026-10-28).
  - **Auf Vercel:** läuft im Bau mit `DATABASE_URL` automatisch. **Docker:** nach dem Update einmal von Hand mit der `DATABASE_URL` der Produktion, danach `POST /api/wartung/cache-erneuern`.
  - **Von Hand nachziehen:** Was die Redaktion schon gespeichert hat, bleibt unverändert, etwa `[Gründungsjahr]` oder „1975“ in einer gespeicherten Fassung von Über uns oder Vorstand.
  - **Das siehst du, wenn es geklappt hat:** Das Bauprotokoll bzw. die Konsole nennt die Bereiche; `/igmg` zeigt „Stand Juni 2026“, `/ueber-uns` das Gründungsjahr 1978, `/hadsch-umra` die Abflüge.

- [ ] **C10 · Probelauf des Dachverband-Abgleichs**
  - **Ort:** Kommandozeile: `curl -fsS -X POST -H "Authorization: Bearer <WARTUNG_TOKEN>" "https://<domain>/api/wartung/dachverband-abgleich?trocken=1"`.
  - **Aufwand:** 5 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Die Antwort nennt geprüfte, neue und vorhandene Predigten und schreibt nichts (`trocken`). Danach ohne `?trocken=1` oder in der Verwaltung „Jetzt aus dem Feed holen“; Startklar `inhalte.dachverband-aktuell` ist grün.

- [ ] **C11 · Vorschau der Wissens-Entwürfe entscheiden**
  - **Ort:** Vorstand; technisch Vercel › Environment Variables oder Verwaltung › Einstellungen › Funktionen.
  - **Aufwand:** 10 Minuten.
  - **Wer:** Vorstand entscheidet, Technik schaltet.
  - **Stand:** Die vier Erklärtexte (Hadsch und Umra, Islamischer Kalender, Zakat/Fitra/Kurban, Freitagsgebet) sind öffentlich als „Entwurf zur Prüfung“ gekennzeichnet (ADR 0047, Schalter `website_wissen_vorschau`, Standard an).
  - **Abschalten:** `FUNKTION_WEBSITE_WISSEN_VORSCHAU=aus` und neu bereitstellen, oder die Einstellung `funktionen` setzen und danach `POST /api/wartung/cache-erneuern`. Alternativ gibt der Imam die Texte frei (M-101).
  - **Das siehst du, wenn es geklappt hat:** Die Entscheidung steht in MENSCHEN; Startklar `gemeinde.wissen-vorschau` zeigt den gewählten Stand.

- [ ] **C12 · Datenschutzerklärung: YouTube und Karte (vor dem Einbinden weiterer Videos)**
  - **Ort:** Verwaltung › Seiteninhalte › Datenschutz; Entwurf im Seed `web/drizzle/seeds/bereiche/rechtliches.ts` (Abschnitt „Empfänger“: „Videos (Entwurf)“ und Prüfhinweis M-111); `web/docs/recht/VERARBEITUNGSVERZEICHNIS.md` 2.6 und 2.7.
  - **Aufwand:** 30 Minuten, plus Rechtsberatung.
  - **Wer:** Vorstand mit Rechtsberatung (M-111, G-08).
  - **Hinweis:** Bestehende Datenbanken bekommen den Entwurfsabsatz nicht über die Stand-Migration; die Technik überträgt ihn mit der geprüften Fassung in die Verwaltung. Die Karte erscheint erst mit bestätigten Koordinaten (M-010).
  - **Das siehst du, wenn es geklappt hat:** `/datenschutz` beschreibt Videos und Karte ohne Prüfhinweis in eckigen Klammern; erst danach kommen weitere Videos auf die Website. Einmal im echten Browser „Video laden“ auf `/hadsch-umra` testen.

- [ ] **C13 · Links zum Netzwerk und Hadsch-Termine prüfen**
  - **Ort:** Kommandozeile in `web/`: `pnpm links:pruefen [basis]` (Bericht unter `_lauf/belege/links/`); Seite `/hadsch-umra` gegen igmgreisen.com.
  - **Aufwand:** 20 Minuten.
  - **Wer:** Technik prüft die Links, Redaktion die Termine.
  - **Was:** Alle Ziele aus `NETZWERK` (Stand 2026-10-27) antworten; die Abflüge, Fristen und Programme auf `/hadsch-umra` stimmen mit IGMG Reisen überein (Seed-Stand 13.10.2026). Der Hinweis „Frist 01.11.2026“ verschwindet am 02.11.2026 von selbst.
  - **Das siehst du, wenn es geklappt hat:** Der Bericht zeigt keine toten Links (Antworten wie 403 hinter einer Abfrage von Hand im Browser nachsehen); die Seite nennt den aktuellen Stand.

- [ ] **C14 · Nach dem Abschalten des Konzept-Hinweises: Sichtbarkeit in der Suche**
  - **Ort:** nach C1, gegen die Produktionsadresse.
  - **Aufwand:** 30 Minuten.
  - **Wer:** Technik.
  - **Schritte:**
    1. `curl -s https://<domain>/ | grep -i robots` zeigt kein `noindex` mehr (die Schranke gilt nur mit `VERCEL=1`, solange der Hinweis an ist; ADR 0049).
    2. `https://<domain>/llms.txt` antwortet mit 200.
    3. `E2E_BASIS=https://<domain> pnpm exec playwright test tests/e2e/seo.spec.ts --project desktop` ist grün.
    4. `https://<domain>/sitemap.xml` in der Google Search Console und in Bing Webmaster Tools einreichen (Konten: M-109).
    5. Stichproben im Rich Results Test und im Schema Markup Validator für `/`, `/igmg`, `/hadsch-umra`, `/gebetszeiten`.
  - **Das siehst du, wenn es geklappt hat:** Alle fünf Schritte erledigt; die Konsolen zeigen die Sitemap als gelesen.

## D. Domain und Mail

- [ ] **D1 · Domain verbunden, HTTPS aktiv**
  - **Ort:** Vercel › Projekt `igmg` › Settings › Domains **[prüfen]**. Eintrag beim Domainanbieter (VERCEL.md, Abschnitt 6).
  - **Aufwand:** 10 Minuten, plus Wartezeit **[prüfen: Dauer]**.
  - **Wer:** Technik.
  - **Danach:** `APP_URL` und `BETTER_AUTH_URL` auf `https://[deine-domain.de]` setzen (`web/docs/BETRIEB.md` § 2).
  - **Das siehst du, wenn es geklappt hat:** `https://[deine-domain.de]` öffnet mit Schloss-Symbol.

- [ ] **D2 · E-Mail-DNS: SPF, DKIM und DMARC**
  - **Ort:** Domainanbieter › DNS **[prüfen]**. Die Werte stellt der Mailanbieter bereit (VERCEL.md, Abschnitt 7).
  - **Aufwand:** 15 Minuten, plus Wartezeit.
  - **Wer:** Technik trägt die Einträge ein. Vorstand stellt sicher, dass der Mailanbieter-Zugang da ist.
  - **Das siehst du, wenn es geklappt hat:** Der Mailanbieter zeigt die Domain als verifiziert **[prüfen: Anzeige]**.

## E. Prüfung und Abnahme

- [ ] **E1 · Startklar-Cockpit grün**
  - **Ort:** `/verwaltung/startklar` in der Verwaltung, oder auf der Kommandozeile `pnpm startklar`.
  - **Stand:** Das Cockpit ist im Code vorhanden (`web/src/app/[locale]/verwaltung/(geschuetzt)/startklar/page.tsx`, Prüfungen in `web/src/lib/startklar/pruefungen.ts`). Ob alle Punkte grün sind, zeigt ein Lauf.
  - **Von Hand:** Die Funktionsregion `fra1` im Projekt bestätigen (MENSCHEN ML-22). Ob der Medienspeicher antwortet, zeigt die Zeile „Medienspeicher erreichbar“ (lesende Probe, `auslieferung.speicher`); der Testupload aus B2 bestätigt das Schreiben.
  - **Aufwand:** 10 Minuten zum Durchsehen.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Alle Punkte sind grün. Soll-Zustand: Jeder Punkt, der rot bleibt, nennt Grund und Ort.

- [ ] **E2 · Abnahme der zwölf Hauptseiten**
  - **Ort:** Die Vorschau-Adresse über den teilbaren Link (VERCEL.md, Abschnitt 5.4; MENSCHEN ML-23). Die Liste mit Adressen steht in VERCEL.md, Abschnitt 11.
  - **Aufwand:** 30 Minuten, auf dem Handy und auf dem Computer. Mindestens ein iPhone mit Safari und ein Android-Telefon mit Chrome, denn der Lauf hat nur mit Chromium-Emulation geprüft (MENSCHEN, Umgebungsausnahmen UA-01 und UA-04).
  - **Dazu in der Verwaltung:** einmal anmelden (mit zweitem Faktor), einen Seiteninhalt speichern, ein Bild hochladen. Der Lauf konnte diese Abläufe nur lokal prüfen (UA-03).
  - **Wer:** Vorstand.
  - **Das siehst du, wenn es geklappt hat:** Jede Seite öffnet ohne Fehler, Texte und Bilder sind vollständig, das Menü funktioniert auf dem Handy, und der Vorstand hat schriftlich bestätigt, was er übernimmt.

- [ ] **E3 · Zurückrollen geübt**
  - **Ort:** Vercel › Projekt `igmg` › Deployments (VERCEL.md, Abschnitt 12).
  - **Aufwand:** 15 Minuten.
  - **Wer:** Technik führt vor, Vorstand sieht zu.
  - **Das siehst du, wenn es geklappt hat:** Das Menü „Instant Rollback“ ist gefunden und der Ablauf ist beschrieben. Die Technik kennt den Weg über einen Revert-Commit.

- [ ] **E4 · Wiederherstellung der Datenbank einmal getestet**
  - **Ort:** Neon-Konsole, Sicherungen **[prüfen]** (VERCEL.md, Abschnitt 13).
  - **Aufwand:** 30 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Ein Zweig mit dem Stand von gestern lässt sich lesen. Die Aufbewahrungsdauer ist notiert.

- [ ] **E5 · Vorstand hat den Livegang freigegeben**
  - **Ort:** Schriftlich, zum Beispiel per E-Mail an die Technik.
  - **Aufwand:** 5 Minuten.
  - **Wer:** Vorstand.
  - **Das siehst du, wenn es geklappt hat:** Eine Nachricht vom Vorstand mit dem Satz „Freigegeben“ liegt vor.

## F. Nach dem Livegang

- [ ] **F1 · Ladeleistung im Feld prüfen**
  - **Ort:** https://pagespeed.web.dev, „Mobil“, für Startseite, `/gebetszeiten` und `/veranstaltungen` (MENSCHEN ML-27).
  - **Aufwand:** 10 Minuten.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Performance ≥ 90 sowie INP und LCP im grünen Bereich. Sonst folgt ein eigener Auftrag „Hydrierung verkleinern“.

- [ ] **F2 · Eingaben vor dem Laden der Verwaltungsformulare entscheiden**
  - **Ort:** Technik, Vorschlag in MENSCHEN ML-28.
  - **Aufwand:** Entscheidung 5 Minuten; Umsetzung 1–2 Stunden mit Test.
  - **Wer:** Vorstand entscheidet, Technik setzt um.
  - **Das siehst du, wenn es geklappt hat:** Wer in der ersten Ladesekunde tippt, verliert keine Eingabe mehr.

## G. Gemeinde-Plattform freischalten (Lauf vom 13.10.2026)

Die Plattform (Koran, Hadith, Elifbe, Lernen, Konten, Chat, Push, Anzeige) ist live im **Beispielmodus**: Alle öffentlichen Seiten laufen ohne Datenbank, die Verwaltung zeigt „Verwaltung noch nicht eingerichtet“, Konten und alles mit Personendaten sind aus. Die folgenden Schritte schalten Stück für Stück frei. Die offenen Entscheidungen dazu stehen in `_gemeinde/MENSCHEN.md` (MN-xx).

- [ ] **G1 · Datenbank anbinden (Beispielmodus endet)**
  - **Ort:** VERCEL.md, Abschnitt 2 (Neon, Region Frankfurt), dann Vercel › Projekt › Settings › Environment Variables.
  - **Aufwand:** 30 Minuten.
  - **Wer:** Technik.
  - **Schritte:** Neon-Datenbank mit **PostgreSQL 17** anlegen (VERCEL.md 2.1: ab 17 wegen der Migrationen 0013/0014, nicht neuer als das Sicherungs-Image `postgres:17.6-alpine`). `DATABASE_URL` für Production setzen. Geheimnisse mit `pnpm geheimnisse:erzeugen` erzeugen und eintragen (mindestens `BETTER_AUTH_SECRET`, `EINGANG_SCHLUESSEL`, `EINGANG_SCHLUESSEL_ID`, `RATE_GEHEIMNIS`, `ALTCHA_GEHEIMNIS`, `CRON_SECRET`, `WARTUNG_TOKEN`; Liste in VERCEL-ENV.md). Neu bauen lassen: Der Vercel-Bau spielt alle Migrationen aus `drizzle/meta/_journal.json` (bei der Übergabe 0000 bis mindestens 0014) unter Sperre ein und importiert Koran, Tajwid, Übersetzungen und Bukhari. Die Beispielinhalte einmal mit `pnpm db:seed` gegen die neue Datenbank anlegen (VERCEL.md, Abschnitt 2).
  - **Ergänzung Marktstart IGMG (28.10.2026):** Der Bau spielt jetzt bis mindestens Migration 0024 (`igmg_abgleich`) ein und führt danach die Stand-Migration `inhalte:marktstart` aus (C9). Bei einer neuen Datenbank legt `pnpm db:seed` die neuen Bereiche direkt an. Mit der Datenbank laufen Gebetszeiten-Abgleich, Hutba-Feed und die Pflege von „Aus dem Dachverband“ und „Hadsch & Umra“ in der Verwaltung live; ohne Datenbank friert der Beispielmodus die Freitagspredigt auf dem Stand des Baus ein (datierte Überschrift). Danach C7, C8 und C10.
  - **Das siehst du, wenn es geklappt hat:** `/verwaltung/anmelden` zeigt das Anmeldeformular, und das Startklar-Cockpit (`/verwaltung/startklar`) führt die Prüfungen zur Datenbankverbindung und zu den Migrationen als erfüllt.

- [ ] **G2 · Erste Verwaltungskonten mit Zwei-Faktor**
  - **Ort:** Kommandozeile mit `DATABASE_URL` der Produktion: `pnpm verwaltung:einladen --email <adresse> --name "<Name>" --rolle administration`.
  - **Aufwand:** 15 Minuten je Konto.
  - **Wer:** Vorstand benennt, Technik lädt ein.
  - **Danach, in dieser Reihenfolge (Vier-Augen-Prinzip, `src/lib/rechte/schutzrollen.ts`):**
    1. **Leitung zuerst.** Die erste Person mit Rolle `leitung` wird sofort wirksam (Start-Ausnahme). Sie gilt nur, solange noch nie eine Leitung wirksam war – auch wenn diese Leitung später wieder entfernt wird, kommt die Ausnahme nicht zurück. Einladen per `pnpm verwaltung:einladen … --rolle leitung` oder unter Verwaltung › Benutzer und Rollen. **Restrisiko der Start-Ausnahme:** Wer die erste Leitung einlädt, könnte sie an eine eigene Zweitadresse vergeben und mit ihr eigene Anträge bestätigen – bei der religiösen Prüfung also zwei Freigaben aus einer Hand. Deshalb bestimmt der **Vorstand** die Person der ersten Leitung (nicht die Administration), und Leitung und Kinderschutz achten auf die Hinweise zu jedem Antrag (nur Mensch, LM-03). Das Fenster ist offen, bis die erste Leitung wirksam ist.
    2. **Kinderschutz (MN-23, zwei Personen) und jede weitere Leitung:** Die Administration lädt ein oder vergibt die Rolle; das ergibt nur einen **Antrag**. Wirksam wird die Rolle erst, wenn eine **zweite Person** mit Rolle `leitung` oder `kinderschutz` zustimmt – ohne Administration im eigenen Konto, nicht die beantragende und nicht die betroffene Person. Bestätigt wird im Kasten „Bestätigen (Vier-Augen-Prinzip)“ unter Verwaltung › Gemeinde im Blick (Leitung) bzw. Verwaltung › Kinderschutz.
    3. **Religiöse Prüfung:** Imam und Hoca mit Rolle `religioese_pruefung` (MN-20, MN-24: mindestens zwei Personen; niemand gibt frei, was er selbst verfasst hat). Seit Stufe C N2 Schutzrolle wie Kinderschutz: Einladen bzw. Vergeben ergibt nur einen **Antrag**, wirksam erst mit der Zustimmung einer zweiten Person (Leitung oder Kinderschutz, siehe 2.) – deshalb erst nach der Leitung. Ein Konto mit Administration zählt nie als religiöse Freigabe, auch nicht mit dieser Rolle.
    - Der **Entzug** von `leitung`, `kinderschutz` und `religioese_pruefung` braucht ebenfalls die zweite Person; bis dahin bleibt die Rolle wirksam. Schutzrollen nie zusammen mit `administration` in einem Konto und nie an sich selbst. Jede Vergabe und jeder Antrag geht als Hinweis ohne Namen an alle Konten mit Leitung oder Kinderschutz.
  - **Das siehst du, wenn es geklappt hat:** Die Personen melden sich mit Passwort und Code aus der Authenticator-App an.

- [ ] **G3 · Religiöse Inhalte prüfen und freigeben**
  - **Ort:** Verwaltung › Koran (Ausgaben, Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen, Vers/Hadith des Tages), Verwaltung › Anzeige (Vers- und Hadith-Folien).
  - **Aufwand:** laufend (MN-02, MN-04, MN-05, MN-06, MN-07).
  - **Wer:** Imam und Hoca.
  - **Das siehst du, wenn es geklappt hat:** Freigegebene Übersetzungen, Wortbedeutungen und Regeltexte erscheinen öffentlich; alles andere zeigt den Hinweis „Freigabe ausstehend“.

- [ ] **G4 · Funktionen mit Personendaten einschalten – in dieser Reihenfolge**
  - **Ort:** Vercel › Environment Variables (Production): `FUNKTION_<NAME>=an`, danach neu bereitstellen. Ohne Eintrag gilt in Produktion „aus“; `FUNKTION_<NAME>=aus` schaltet sofort wieder ab.
  - **Bis zur Freigabe von `KONTEN`:** `FUNKTION_KONTEN=aus` ausdrücklich setzen. Dann antworten die Konto-Seiten (z. B. `/anmelden`, `/registrieren`, `/mein-bereich`, alle Sprachen) mit echtem 404. Ohne Eintrag (oder nur per Einstellung ausgeschaltet) zeigen sie zwar „Seite nicht gefunden“ mit `noindex`, aber mit Status 200 (Soft-404; der Proxy liest keine Datenbank, `src/lib/konto/ohne-konten.ts`).
  - **Reihenfolge und Voraussetzungen:**
    1. `KONTEN` – Datenschutzerklärung v2 und Einwilligungstexte geprüft (MN-11).
    2. `LERNPLATTFORM` – DSFA bestätigt, Lehrkräfte eingeladen, Gruppen mit zwei Erwachsenen angelegt (MN-11, MN-16).
    3. `CHAT` – Schutzkonzept, Ansprechpersonen und Kinderschutz-Rollen (MN-10, MN-23); das Startklar-Cockpit sperrt sonst.
    4. `PUSH` (und `PUSH_GEBET`) – VAPID-Schlüssel gesetzt (`VAPID_PRIVAT`, `VAPID_KONTAKT`, siehe VERCEL-ENV.md), Push-Themen und Drittlandgrundlage bestätigt (MN-17).
    5. `HATIM`, `NEWSLETTER` – nach G1 jederzeit; Newsletter mit Mailanbieter (A4).
    6. `ECHTZEIT` – nur mit lokalem Server und öffentlicher Adresse (G5).
  - **Wer:** Vorstand entscheidet je Schritt, Technik schaltet.
  - **Das siehst du, wenn es geklappt hat:** Das Startklar-Cockpit führt die Funktion ohne offenen Vorbehalt; die Seiten (z. B. `/anmelden`, `/hatim`) erscheinen und stehen im Menü.

- [ ] **G5 · Lokaler Server der Moschee (Sicherung, Takt, Kiosk)**
  - **Ort:** `betrieb/lokal/LIESMICH.md` (Docker Compose: Sicherung, Medienspiegel, Takt, Überwachung, Kiosk, optional Echtzeit).
  - **Aufwand:** 3–4 Stunden (MN-12, MN-18, MN-22).
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Das Startklar-Cockpit zeigt Sicherung, Takt und Überwachung grün; der Bildschirm im Gebetsraum zeigt `/gebetszeiten/anzeige`.

- [ ] **G6 · Rezitation des Imams (Fatiha und Cüz 30)**
  - **Ort:** Verwaltung › Koran › Rezitationen (Aufnahme oder Upload, Abgleich je Sure); optional `AUDIO_BLOB_READ_WRITE_TOKEN` für einen öffentlichen Audio-Speicher.
  - **Aufwand:** 2–4 Stunden Aufnahme, 2–3 Stunden Abgleich (MN-03).
  - **Wer:** Imam bzw. Hafız, Technik hilft beim Abgleich.
  - **Das siehst du, wenn es geklappt hat:** Nach hinterlegter Vereinbarung und Freigabe spielt der Player auf `/quran/1` die Rezitation mit Vers- und Worthervorhebung.

- [ ] **G7 · Bukhari-Gesamtsammlung bestätigen**
  - **Stand:** Seit 13.10.2026 öffentlich an (Entscheidung des Nutzers, MN-06); die Rechtsprüfung der Datenquelle bleibt empfohlen.
  - **Abschalten:** `FUNKTION_HADITH_GESAMT=aus`, danach neu bereitstellen (die Bücher antworten dann mit 404, Auswahl und Übersicht bleiben).

- [ ] **G8 · Lern-App (`/lern-app`) Schalter für Schalter**
  - **Stand:** Seit 21.10.2026 an, ohne Personendaten (der Fortschritt bleibt auf dem Gerät); Abgleich, Gruppen, Bestenliste, Statistik und Erinnerungen sind aus. „Fehler melden“ (`lernapp_meldungen`) wirkt erst nach G1 (Datenbank, `ALTCHA_GEHEIMNIS`); bis dahin zeigt die Lern-App die Inhalte aus dem Bau.
  - **Wissenskurs (seit 27.10.2026, L3-E22):** als gekennzeichneter „Entwurf zur Prüfung“ sichtbar (`lernapp_wissen_vorschau`). **Vor dem öffentlichen Start** `FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus` setzen und neu bereitstellen – oder alle Lektionen von zwei Gelehrten prüfen lassen (`_lernapp/MENSCHEN.md` LM-03). Das Startklar-Cockpit warnt, solange die Vorschau an ist.
  - **Liste:** `_lernapp/GO-LIVE.md` – je Schalter Stand, Voraussetzung, Auflagen der Sicherheitsprüfung S-L3 und wer freigibt; Handbücher `web/docs/handbuch/lernapp-*.md`.
  - **Abschalten:** `FUNKTION_LERNAPP=aus`, danach neu bereitstellen.

## Verweise

- **VERCEL.md** (`web/docs/deploy/VERCEL.md`): das Runbook, Schritt für Schritt.
- **VERCEL-ENV.md** (`web/docs/deploy/VERCEL-ENV.md`): alle Umgebungsvariablen mit Pflicht je Betriebsart.
- **MENSCHEN.md** (`_gemeinde/MENSCHEN.md` für die Gemeinde-Plattform, `_archiv/lauf-gestaltung-2026-10/MENSCHEN.md` für den Vorlauf): alle offenen Entscheidungen und Aufgaben für Menschen.
- **BETRIEB.md** (`web/docs/BETRIEB.md`): Betrieb mit Docker und Betrieb auf Vercel (§ 9).
- **Entscheidungen** (`web/docs/adr/`): ADR 0017 bis 0024; für den Marktstart IGMG ADR 0046 bis 0049.
- **Marktstart IGMG:** offene Menschen-Punkte M-099 bis M-119 in `_lauf/MENSCHEN.md`, Bericht `_lauf/belege/marktstart-igmg/BERICHT.md`.
