# GO-LIVE: Was vor dem Livegang erledigt sein muss

Stand: 11.10.2026. Diese Liste sagt dir, was vor der ersten öffentlichen Veröffentlichung auf Vercel fertig sein muss. Der Weg dorthin steht in **VERCEL.md** (Runbook, etwa 30 Minuten). Was nur ein Mensch entscheiden oder erledigen kann, steht in **MENSCHEN.md**.

## So liest du die Liste

- **Ort:** Wo du es erledigst.
- **Aufwand:** Schätzung der reinen Arbeitszeit. Wartezeiten stehen extra dabei.
- **Wer:** **Vorstand** entscheidet oder bestätigt. **Technik** richtet ein oder führt aus.
- **Das siehst du, wenn es geklappt hat:** Der Prüfpunkt.
- **[Code fehlt]:** Dieser Punkt braucht noch Arbeit im Programm. Er ist ein Hindernis für den Livegang.

Die Reihenfolge ist: A, dann B, dann C, dann D, dann E. Einige Punkte in C und D lassen sich parallel erledigen.

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
  - **Code:** vorhanden (`SPEICHER=blob`, `web/src/lib/storage/index.ts`, ADR 0020). Auf Vercel verkleinert der Browser Bilder über 4,2 MB vor dem Hochladen; größere PDF-Dateien werden abgelehnt.
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
  - **Code:** vorhanden (`vercel.json` › `crons`: Löschfristen 01:00 UTC, Mail-Ausgang 02:00 UTC). Nötig ist nur `CRON_SECRET` in Production.
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
  - **Aufwand:** 10 Minuten zum Durchsehen.
  - **Wer:** Technik.
  - **Das siehst du, wenn es geklappt hat:** Alle Punkte sind grün. Soll-Zustand: Jeder Punkt, der rot bleibt, nennt Grund und Ort.

- [ ] **E2 · Abnahme der zwölf Hauptseiten**
  - **Ort:** Die Vorschau-Adresse über den teilbaren Link (VERCEL.md, Abschnitt 5.4). Die Liste mit Adressen steht in VERCEL.md, Abschnitt 11.
  - **Aufwand:** 30 Minuten, auf dem Handy und auf dem Computer.
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

## Verweise

- **VERCEL.md** (`web/docs/deploy/VERCEL.md`): das Runbook, Schritt für Schritt.
- **VERCEL-ENV.md** (`web/docs/deploy/VERCEL-ENV.md`): alle Umgebungsvariablen mit Pflicht je Betriebsart.
- **MENSCHEN.md** (`_werkstatt/MENSCHEN.md`): alle offenen Entscheidungen und Aufgaben für Menschen.
- **BETRIEB.md** (`web/docs/BETRIEB.md`): Betrieb mit Docker und Betrieb auf Vercel (§ 9).
- **Entscheidungen** (`web/docs/adr/`): ADR 0017 bis 0024.
