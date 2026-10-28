# Entscheidungen

Routine-Entscheidungen stehen hier kurz; folgenreiche zusätzlich als ADR (`web/docs/adr/` (bis P2 in `_lauf/adr/`)).
Format: Kennung · Datum · Quelle · Entscheidung · Grund.

## Nutzer-Festlegungen (überschreiben den Auftrag)

**E-001 · 2026-10-11 · Nutzer („der Workspace ist alles, was wir haben!“) · Projektort = Workspace**
Workspace `/Users/umurey/Downloads/IGMG Wetzlar Website Design`. Logische Zuordnung ohne Verschieben:
design/ ≙ Wurzel (*.dc.html, tokens/, assets/, readme.md, SKILL.md, support.js, styles.css); bestand/ ≙ `uploads/igmg-wetzlar-website/`. Zweitkopie `uploads/IGMG_Wetzlar_Website_Code/` und `uploads/IGMG Wetzlar Moschee Website.make` nur als Referenz. Geschrieben wird nur in `web/` und `_lauf/` (plus `.git/`). Kein `UEBERGABE.md` vorhanden – das Bündel liegt bereits exportiert vor, der Ladeschritt aus Abschnitt 7 entfällt.

**E-002 · 2026-10-11 · Nutzer („irrelevant, fang an“) · ~/Downloads/CLAUDE.md wird ignoriert**
Die Datei beschreibt ein anderes Projekt (Coday-Bildverarbeitung) und wird nie ausgeführt. Jeder Agentenauftrag enthält den Hinweis; `web/CLAUDE.md` wiederholt ihn.

**E-003 · 2026-10-11 · Nutzer · Docker darf gestartet werden**
Docker Desktop per `open -a Docker`. Bis PostgreSQL in Docker läuft: PGlite. Lizenz-/Anmeldedialoge übernimmt der Nutzer.

**E-004 · 2026-10-11 · Nutzer („arbeite immer nur im Main und push immer alles“) · Git nur main, immer pushen**
Repository in der Workspace-Wurzel (design + bestand + web + _lauf), Zweig `main`, Remote `origin = https://github.com/umutcantezgel-cpu/IGMG.git`. Nach jedem abgenommenen Paket Commit und `git push origin main`. Ersetzt „Arbeitszweig aufbau“ und „Push: AUS“ aus Abschnitt 0 sowie „kein git push“ aus G-01. Weiterhin: kein Force-Push, kein Umschreiben der Geschichte.

**E-005 · 2026-10-11 · Orchestrator (mit Plan freigegeben) · Schutz für das öffentliche Repository**
`gh repo view` zeigt `visibility: PUBLIC`. Daher: (a) `uploads/IGMG Wetzlar Moschee Website.make` (vollständiger Figma-Make-Chat mit Konto-IDs) bleibt über `.git/info/exclude` draußen, bis der Nutzer sie freigibt; (b) Pre-Push-Prüfung auf Geheimnisse, `.env*` (außer `.env.example`), PGlite-Daten, Mail-Ausgaben, Formulardaten; (c) Personennamen aus dem Bestand nicht in Seeds, sondern `[Name – Funktion]`, Originalwerte zur Bestätigung in MENSCHEN.md; (d) Empfehlung an den Nutzer, das Repo privat zu stellen (M-002).

## Laufentscheidungen

**E-006 · 2026-10-11 · pnpm über corepack nach ~/.local/bin**
`/usr/local/bin` gehört root; `corepack enable --install-directory ~/.local/bin pnpm` ohne sudo. Version beim Einrichten: pnpm 12.11.2. Alle Befehle setzen `PATH="$HOME/.local/bin:$PATH"`.

**E-007 · 2026-10-11 · ADR-Ablage bis P2 in `_lauf/adr/`**
`create-next-app` verlangt einen leeren Zielordner; ADRs ziehen in P2 per `git mv` nach `web/docs/adr/`.

**E-008 · 2026-10-11 · Haiku-Pakete als Workflow-Skripte**
Unteragenten laufen als Workflow mit `model: 'haiku'`, `effort: 'max'`, Pool mit genau 6 gleichzeitigen Agenten. Gemeinsamer Arbeitsbaum ohne Worktrees; Dateihoheit verhindert Konflikte.

**E-009 · 2026-10-11 · Orchestrator (nach Blockade durch die Sicherheitsprüfung „PII“) · Nur web/ und _lauf/ im Repository**
Das Einchecken des ganzen Workspace in das öffentliche Repo wurde von der automatischen Sicherheitsprüfung wegen Personendaten blockiert (Bestand und Design enthalten Namen aus Figma Make, teils möglicherweise echte Vorstandsnamen). Sicherere Form von E-004: Das Repository in der Wurzel versioniert über `.git/info/exclude` nur `web/` und `_lauf/`; Bestand und Design bleiben lokal und werden nur gelesen. MENSCHEN.md nennt keine Personennamen, sondern Fundstellen. Ob Bestand und Design doch ins Repo sollen, steht als M-003 in MENSCHEN.md.

**E-010 · 2026-10-11 · Bildbelege bleiben lokal**
Bildreferenzen und App-Bildschirmfotos (`_lauf/belege/**/*.png`) werden nicht versioniert: Sie sind groß (Hunderte Bilder) und zeigen Beispielnamen aus dem Design – im öffentlichen Repo unerwünscht (E-005/E-009). Versioniert werden die Berichte (`index.json`, Prüfberichte) mit Dateinamen; die Bilder lassen sich mit `_lauf/werkzeuge/referenz/render.mjs` jederzeit neu erzeugen.

**E-011 · 2026-10-11 · Lichtung (c) gelungen – Bildreferenzen per Hülle**
Die Artboards sind 1280 px breit gebaut; eine direkte 390-px-Ansicht zeigt das Desktop-Layout. Das Werkzeug `_lauf/werkzeuge/referenz/render.mjs` bindet jedes Artboard wie 08/09 per `dc-import` in einen Rahmen fester Breite (390 bzw. 1440 px) ein und setzt Eigenschaften als Attribute (kebab-case). React 18.3.1 von unpkg wird lokal zwischengespeichert (gleiche Bytes, SRI gültig); Google Fonts werden beim Rendern geladen. Probe: Events bei 390/1440 und state=leer ohne Fehler.

**E-012 · 2026-10-11 · KERN 1.1 – K-03 um `/suche` und `/offline` ergänzt**
Welle D verlangt eine Suche (ADR 0013), K-15 eine Offline-Seite; beide Adressen fehlten in K-03. Lokalisiert: `/suche` → tr `/arama`, en `/search`; `/offline` in allen Sprachen gleich. Keine weitere Änderung am Kern.

**E-013 · 2026-10-11 · ADRs 0002–0007, 0010–0016 angenommen (P1)**
Mehrsprachige Inhalte als JSONB (0002), eigene Rollentabelle statt Better-Auth-Organisationen (0003), Caching-Grenzen (0004), ein verschlüsseltes Eingangsmodul (0005), Tiptap-JSON (0006), Speicher-Adapter (0007), Push-Schutz (0010), Mailpit/Datei-Transport (0011), getrennte CSP öffentlich/Verwaltung (0012), PostgreSQL-Volltext (0013), lokale Schriftdateien (0014), Seeds mit Kennzeichnung (0015), Verwaltung nur Deutsch (0016). 0008 und 0009 folgen nach der Quellenrecherche.

**E-014 · 2026-10-11 · ADR 0008 (Gebetszeiten) und 0009 (Quran) angenommen**
Gebetszeiten: Import verbindlich, bis dahin adhan „Turkey“, Shafi, SeventhOfTheNight, Imsak = Fajr, sichtbar „berechnet“, Qibla ≈ 128,3°. Quran: Tanzil-Text nur nach menschlicher Zustimmung zu den Nutzungsbedingungen (M-036) per Import-Skript; bis dahin Platzhalter. Der Al-Fatiha-Text aus dem Bestand wird nicht verwendet (keine Quellenangabe, G-06).

**E-015 · 2026-10-11 · Standalone-Server mit HOSTNAME=0.0.0.0**
Befund im Fundament: Mit `HOSTNAME=127.0.0.1` bzw. `localhost` behandelt der standalone-Server von Next.js 16.4 die Rewrites von next-intl (Standardsprache ohne Präfix) bei abweichendem Host als externe Ziele → Weiterleitungsschleife (307 auf sich selbst). Mit `HOSTNAME=0.0.0.0` (wie im Docker-Image) bleiben die Rewrites intern; geprüft mit Host `localhost`, `127.0.0.1` und einem fremden Host-Header. Festlegung: Start-Skript und Dockerfile setzen `HOSTNAME=0.0.0.0`; BETRIEB.md nennt das als Pflicht.

**E-016 · 2026-10-11 · Stichprobe der Kundschafter-Blätter (P0.4) bestanden**
Drei Blätter, je drei Angaben gegen die Quelle geprüft:
- S04 (Veranstaltungen): `event.2.desc` = Events.tsx:178 ✓ · „Kommende Events“ = Events.dc.html:28 ✓ · sieben Kategorie-Schalter (:23–25, :51) ✓
- S11 (Kontakt): `contact.subtitle` de/tr/en = Contact.tsx:25/81/137 ✓ · `[Adresse]` als Designplatzhalter, Bestand als Beispielwert ✓ · Kartenknopf „Google Maps“ sprachunabhängig (Contact.tsx:257) ✓
- S20 (Voranmeldung): „Bitte füllen Sie die markierten Pflichtfelder aus.“ in FormWizard.dc.html ✓ · vier Schritte ✓ · Einwilligung ohne Link auf eine Erklärung (StudentRegistration.tsx:600 ff.) ✓
Kein Fehler → kein Blatt muss neu erstellt werden. Qualität der Blätter: Texte wörtlich mit Fundstelle, Personennamen als Platzhalter (A5) eingehalten.

**E-017 · 2026-10-11 · ADR 0017: Image-Bau gegen PGlite-Bau-Datenbank, frische Inhalte beim Start**
Der Docker-Bau scheiterte zunächst, weil `src/lib/db` beim Import verband. Jetzt: Verbindung erst beim ersten Zugriff; Bau mit `BAU_PGLITE=1` gegen eine PGlite-Datenbank aus Migrationen + Seeds; beim Start verfallen alle Inhalts-Tags (Prüfauftrag D04). Der Namensraum `verwaltung` wird immer aus `de.json` geladen (verhindert Prerender-Fehler der tr/en-Varianten der Verwaltungsseiten).

**E-018 · 2026-10-11 · Uhrzeiten in allen Sprachen im 24-Stunden-Format**
Deutsch „18:30 Uhr“ (Design D-10); Türkisch und Englisch „18:30“ ohne Zusatz (Bestand und Design liefern keine Fassung; 24-Stunden-Format ist in der Türkei üblich und für eine Gemeinde in Deutschland eindeutig). Umsetzung `src/lib/i18n/format.ts`, Prüfung in `tests/unit/i18n.test.ts`.

**E-019 · 2026-10-11 · Tor P2 bestanden; E2E bekommt eine eigene Datenbank**
Testläufer-Bericht `_lauf/belege/tore/tor-p2.md`: check, Integration, Build, E2E „Anmelden mit Zwei-Faktor“ (4/4), Startseite in drei Sprachen mit korrektem `lang`, Sicherheits-Header, kein Set-Cookie – alles grün. Befund des Testläufers: Die E2E-Läufe legen Einladungen/Testkonten in der Entwicklungsdatenbank an. Festlegung: E2E nutzt ab P3 eine eigene Datenbank `igmg_e2e` im selben PostgreSQL-Container (`E2E_DATABASE_URL`), die vor jedem Lauf frisch migriert und geseedet wird (Playwright globalSetup).

**E-020 · 2026-10-11 · Felder der Veranstaltungsanmeldung**
Name, E-Mail, Telefon (optional), Personenzahl 1–10, Einwilligung (Pflicht); Platzzählung über `eingang.anzahl` ohne Entschlüsseln; Zustände „ausgebucht“ und „Anmeldung geschlossen“ (abgeleitet, keine Artboards). Datensparsam nach G-07.

**E-021 · 2026-10-11 · Tickets und Z-05**
Tickets (Meldungen) entstehen in der Verwaltung (Abschnitt 9). Spam-Schutz = Anmeldung mit Zwei-Faktor + Ratenbegrenzung je Konto (ALTCHA wäre für angemeldete Ehrenamtliche ohne Nutzen). Erfasst ein Ticket Kontaktdaten der meldenden Person (TicketDialog-Felder), dokumentiert ein Pflicht-Häkchen deren Einwilligung mit Textversion. Mails: Bestätigung an die anlegende Person, Benachrichtigung an die Administration.

**E-022 · 2026-10-11 · PLAN v2 nach Gegenprüfung Runde 1**
14 Lücken, 7 Konfliktgruppen und 3 Risiken bewertet und eingearbeitet (`_lauf/PLAN.md` Abschnitt 8). Runde 2 folgt nach dem Durchstich nur bei Strukturfehlern (L0: höchstens zwei Runden).

**E-023 · 2026-10-11 · Übersetzungsprüfung D06: 6 von 26 Korrekturen übernommen**
Übernommen: tr `kopf.bVorstand` (Yönetim, Bestand), `kopf.hauptnavigation` (navigasyon, Bestand), `fuss.beschreibung` (İman/topluluk, Bestand), `allgemein.mehrErfahren` (Bestand „Daha fazla öğren“); en `allgemein.mehrErfahren` („Learn More“, Bestand), `fuss.platzhalterLink` (Platzhalter wie im Deutschen). Abgelehnt: 20 Umstellungen von Schaltflächen auf die Siz-Form – Bedienelemente bleiben im kurzen Imperativ wie im Bestand, Sätze in Siz-Form (M-063).

**E-024 · 2026-10-11 · Verwaltung: eigene Hülle, Formulare als Seiten**
Die Verwaltung bekommt eine eigene Kopfzeile mit Kontomenü und die Seitenleiste des Designs (280 px, unter 900 px aufklappbar); öffentlicher Kopf, Gebetszeitenleiste und Fußzeile entfallen dort (ADR 0016, dynamische Nonce-CSP-Seiten). Das Veranstaltungsformular ist eine eigene Seite statt des Design-Dialogs: Es hat mit Wiederholung, Ausfällen, Anmeldung, Programm und drei Sprachen rund 50 Felder; eine Seite hat eine Adresse, Fokus- und Zurück-Verhalten. Beides in `web/docs/ABWEICHUNGEN.md` (A-V01, A-V02). Seitenleiste zeigt nur gebaute Module, für die die Rolle Leserecht hat.

**E-025 · 2026-10-11 · Cache-Invalidierung zweistufig (F-002)**
Alle Verwaltungs-Actions rufen `inhaltGeaendert(...tags)`: `updateTag` sofort, zweite Invalidierung nach 5 s per `after()`. Grund: Rennen mit gleichzeitigen öffentlichen Seitenaufbauten. „Sofort öffentlich“ gilt damit im Normalfall sofort, im Rennfall nach höchstens rund 5 s.

**E-026 · 2026-10-11 · Leistungsmessung (T7): Drosselung „devtools“ maßgeblich, „simulate“ wird mitberichtet**
`pnpm messen` misst jede Route zweimal mit Lighthouse 13.5 mobil. Gegen localhost liefert der Standard „simulate“ ein systematisch zu hohes LCP (~3,0 s), obwohl das beobachtete LCP dem FCP entspricht (0,07–0,8 s): Im ungedrosselten Trace starten alle Anfragen vor dem ersten Zeichnen, daher rechnet die Simulation das gesamte JavaScript in die LCP-Kette. Mit angewandter Drosselung (150 ms RTT, 1,6 Mbit/s, CPU ×4) liegt das LCP bei ~1,6 s. Bewertet wird K-12 mit „devtools“; der simulierte Wert steht in jedem Bericht. Nach der Bereitstellung prüft eine Person mit PageSpeed Insights gegen die echte Adresse (M-065).
Umgesetzte Leistungsmaßnahmen in diesem Schritt: Telefon-Gebetszeitenleiste ohne Umbruch nach der Hydrierung (CLS 0,27 → 0), kein next-intl im Browser (eigene Pfadberechnung, serverseitiger `Link`, −12 kB), Zeitzonenrechnung über Intl statt `@date-fns/tz` im Browser, Konzept-Hinweis schon beim ersten Zeichnen (kein spätes LCP-Element). JS beim ersten Laden 172–177 kB gzip (Budget 180).

**E-027 · 2026-10-11 · Dateihoheit für parallele Seitenpakete (Welle A)**
Damit Baumeister gleichzeitig arbeiten, ohne gemeinsame Dateien zu ändern, hat jeder Seitenbereich eigene Dateien: Texte `web/messages/bereiche/<bereich>.json` (`{ de, tr, en }`, eigene Namensräume; `src/i18n/request.ts` führt zusammen, `pnpm sprachen:pruefen` meldet Lücken und Überschneidungen), Seiteninhalts-Schema `web/src/lib/validierung/seiteninhalte/<bereich>.ts` (Registry in `seiteninhalte.ts`), Seed `web/drizzle/seeds/bereiche/<bereich>.ts`. Platzhalterdateien legt der Orchestrator an; neue Bereiche trägt nur er in die Register ein. Ersetzt PLAN L4 (Fragmente in `_lauf/eingang/`).


**E-028 · 2026-10-11 · Öffentliche Formulare: Ansicht vom Server, kleine Client-Insel**
Felder, Fehler und Erfolgsmeldung rendert der Server; die Action liefert die nächste Ansicht mit (`FormularAntwort.ansicht`), im Browser bleiben `FormularInsel`, `SendenKnopf` und das nachgeladene ALTCHA. Gemessen auf der Veranstaltungsdetailseite: 182,5 → 178,7 kB JS (Budget 180). ALTCHA über `altcha/external` mit eigenem Worker (CSP `worker-src 'self'`), nach jeder Fehlerantwort neu gelöst. Die Insel bleibt beim Neurendern der Seite an ihrem Platz (Erfolgsmeldung bleibt sichtbar, wenn die Anmeldung den letzten Platz belegt). Zod nur auf dem Server. ADR 0005 Nachtrag; Muster: `web/docs/MUSTER.md` 6a.

**E-029 · 2026-10-11 · FormWizard ohne Client-Logik (B01)**
Schritte stehen alle im Formular (nicht sichtbare mit `hidden`), „Weiter“/„Zurück“ sind Absende-Knöpfe; `wizardSchritt()` prüft auf dem Server mit dem ganzen Schema nur die Felder des aktuellen Schritts, die Action rendert den nächsten Schritt (E-028). Schrittprüfungen speichern nichts und zählen nicht gegen die Ratenbegrenzung; ALTCHA nur im letzten Schritt. Ein unsichtbarer erster „Weiter“-Knopf sorgt dafür, dass die Eingabetaste vorwärts geht. Abweichungen A-C12a–d; Muster 6b. Insel der Voranmeldung: 1,8 kB.

**E-030 · 2026-10-11 · Leistung nach Welle A: eine Fehlergrenze, kein tailwind-merge im Browser, kein Vorabruf der Anzeige**
Gemessen nach Welle A: alle Routen 184–206 kB JS (Budget 180). Ursachen und Maßnahmen: (1) `[locale]/error.tsx` und `global-error.tsx` lagen in jeder Route, je mit Seitenkopf, `next/image`, Icon-Datei, ganzer Fehlertext-Datei und Pfadtabelle (+≈ 20 kB) → nur noch `global-error.tsx` mit schlanker `FehlerAnsicht` (Inline-SVG, eigene Sprachdatei `fehlergrenze.json`, `'use no memo'`), ≈ 3 kB; ohne Kopf und Fußzeile sahen beide Grenzen ohnehin gleich aus. (2) `cn()` (tailwind-merge, ≈ 10 kB) in öffentlichen Client-Komponenten → `klassen()` (nur clsx); alle 16 Aufrufe haben keine widersprüchlichen Klassen. (3) Gebetszeitenseite lud den Code der Vollbildanzeige vor (≈ 16 kB) → `prefetch={false}`. Ergebnis: 166–173 kB auf allen Messrouten (vor Welle A 173–179). `tests/unit/bundle-regeln.test.ts` sichert die Regeln.

**E-031 · 2026-10-11 · Welle C parallel zu Welle B; Dateihoheit in der Verwaltung**
Welle-C-Pakete ohne Formularbezug (Audit-Log, Styleguide, Rich-Text-Editor, später weitere) starten vor Tor B, weil sie keine Dateien mit Welle B teilen. Dafür: alle Verwaltungsmodule vorab in `module.ts` mit `gebaut: false` (der Orchestrator schaltet bei der Abnahme frei), Symbole für alle Module in der Seitenleiste, Texte je Modul in `messages/verwaltung/<modul>.json` (nur Deutsch, unter `verwaltung`), geprüft von `sprachen:pruefen`. Rich-Text-Prüfung beim Speichern zentral in `src/lib/validierung/richtext.ts` (Orchestrator, sicherheitskritisch).

**E-032 · 2026-10-11 · Formulare ohne JavaScript: zurück zur Seite statt Fehlerseite**
Gefunden bei B07: Natives Absenden (JavaScript aus) endete in allen Formularen mit HTTP 500. Next.js rendert die Rückgabe der Action dann im SSR-Graphen; die mitgelieferte Server-Ansicht (E-028) enthält dort nicht aufrufbare Client-Referenzen (Lucide-Icons), und ein Zustand mit JSX lässt sich nicht für Progressive Enhancement kodieren. Da ALTCHA ohnehin JavaScript braucht, gibt es keinen eigenen Formularweg ohne Skript: `zurueckOhneSkript()` (`src/lib/formulare/ohne-skript.ts`, erste Zeile jeder öffentlichen Formular-Action) erkennt den fehlenden `Next-Action`-Header und leitet auf den Pfad des Referers der eigenen Herkunft mit `#ohne-skript` um (sonst Startseite; `//`-Pfade nie). `FormularInsel` zeigt per `<noscript>` den Hinweis `formulare.ohneSkript` (Pflicht-Prop). Nichts wird gespeichert, keine Ratenbegrenzung. Verworfen: Ansicht im Browser rendern (hebt E-028 auf, +≈ 20 kB) und Formular erst nach der Hydrierung zeigen (schlechterer LCP, ohne JS kein Inhalt). Belege: `tests/unit/ohne-skript.test.ts`, `tests/e2e/formulare-ohne-skript.spec.ts`; MUSTER 6a.

**E-033 · 2026-10-11 · Ankündigungen öffentlich oben auf „Nachrichten“**
Das Design hat für Ankündigungen (Verwaltung: Titel, Inhalt, Priorität, Laufzeit) keinen öffentlichen Ort; der Kopf beschreibt „Nachrichten“ als „Aktuelle Nachrichten und Ankündigungen“ (Header.dc.html), die Kategorie „Ankündigung“ der Neuigkeiten bleibt davon unberührt. Entscheidung: aktive Ankündigungen (veröffentlicht, nicht im Papierkorb, `sichtbarAb` ≤ jetzt < `laeuftAb`) stehen als eigener Block über der Nachrichtenliste, nach Priorität, in den Info-Farben der Kategorie „Ankündigung“ (01 Grundlagen). Server-Komponente ohne Client-JS; Cache-Tag `ankuendigungen`, `cacheLife('hours')` – eine abgelaufene Ankündigung verschwindet spätestens nach einer Stunde, eine Änderung in der Verwaltung sofort. Verworfen: Hinweisband auf jeder Seite (kein Design, Platz in Kopf/Leiste fehlt) und Startseite (Design ohne Bereich). Abweichung A-S06b.

**E-034 · 2026-10-11 · Öffentliche „Meldung“ (TicketDialog) als eigene Seite**
Das Design öffnet aus dem Kopf („Meldung“) einen Dialog für Anliegen von Gemeindemitgliedern (TicketDialog.dc.html; Bestand TicketDialog.tsx). Ein Dialog im Kopf läge auf jeder Seite im ersten Laden (K-12, Budget 180 kB). Entscheidung: Seite `/meldung` (tr `/bildirim`, en `/report`) mit Formular nach MUSTER 6a; der Kopf verlinkt sie. Die Meldung wird ein Ticket (Typ beschwerde/wunsch/vorschlag/information), Kontaktangaben der meldenden Person nur verschlüsselt (`melderVerschluesselt`, G-07), Einwilligung mit Textversion, Bestätigung nur bei angegebener E-Mail. Paket C10b nach C10; Abweichung A-C01b.

**E-035 · 2026-10-11 · Audit im Postfach und bei Tickets; Sperren von Konten**
Postfach: Senden wird protokolliert (`postfach.gesendet`, nur Empfängerzahl), Lesen nicht – es ist Kommunikation zwischen Mitarbeitenden, keine Daten von Besucherinnen und Besuchern, und ein Eintrag je Öffnen würde das Audit-Log überfluten. Tickets: Das Öffnen eines Tickets mit Kontaktangaben einer meldenden Person schreibt `ticket.gelesen` (G-07), ohne Kontaktangaben nichts. Konten sperren (C12): Spalte `user.gesperrt_am` über `additionalFields` von Better Auth (Migration 0005); der Datenbank-Hook verweigert neue Sitzungen, `ladeAngemeldet()` prüft zusätzlich, Sperren löscht alle Sitzungen; gesperrte Konten erhalten keine Benachrichtigungen und erscheinen nicht als Postfach-Empfänger. Nie das eigene Konto, nie die letzte nicht gesperrte Administration.

**E-036 · 2026-10-11 · Papierkorb-Löschlauf nach 30 Tagen**
Der tägliche Löschlauf (`POST /api/wartung/loeschfristen`) löscht Veranstaltungen, Neuigkeiten, Ankündigungen und Kurse, die seit mehr als 30 Tagen im Papierkorb liegen (K-05), mit Audit `inhalt.geloescht` durch „System“ (`details.papierkorb`). Bearbeiten im Papierkorb ist serverseitig gesperrt (Befund C03/C06 an `speichereVeranstaltung`).

**E-037 · 2026-10-11 · Öffentliche Meldung wird ein Ticket**
Die Meldung (E-034, `/meldung`) landet als Ticket (Typ beschwerde/wunsch/vorschlag/information) im Modul Tickets, nicht als Eingang – so sieht die Verwaltung „Tickets und Meldungen“ an einem Ort (Blatt V10). Schutz wie bei allen Formularen über `pruefeEinsendung()` (Rate, Honigtopf, ALTCHA, Zod; aus `verarbeiteFormular` herausgelöst). Kontaktangaben und der Einwilligungsnachweis (Schlüssel, SHA-256 der Textfassung, Sprache, Zeitpunkt) stehen verschlüsselt in `ticket.melder_verschluesselt` in der Form von `melderSchema` (C10) plus `einwilligung`; der Löschlauf entfernt sie 180 Tage nach dem Schließen (`MELDER_FRIST_TAGE`, M-088), das Ticket bleibt. Benachrichtigung an `recht:ticket.bearbeiten` mit Link auf das Ticket, Bestätigung nur bei angegebener E-Mail. Audit `ticket.angelegt` durch „Besucher“ (benutzerId null), Details nur Typ. Verworfen: neue Eingangsart (doppelte Pflege in Eingängen und Tickets) und eine Einwilligungsspalte für Tickets (Schemaänderung ohne Mehrwert gegenüber dem verschlüsselten Nachweis).

**E-038 · 2026-10-11 · Medien: Pipeline, Auslieferung, Dubletten**
Typ nur über Magic Bytes (JPEG, PNG, WebP, AVIF, PDF; SVG/GIF/HEIC abgelehnt), Bilder mit sharp neu kodiert (EXIF/GPS entfernt, Ausrichtung übernommen, ≤ 2560 px), PDF unverändert. Schlüssel `<16 Zeichen SHA-256 des gespeicherten Inhalts>/<sicherer Name>.<Endung>`; gleicher Inhalt unter anderem Namen wird nicht doppelt gespeichert (Vergleich über den Hash-Teil). Auslieferung `GET /medien/…` nur für bekannte Einträge außerhalb des Papierkorbs, Typ aus der Datenbank, `immutable`, `nosniff`, PDF mit `Content-Security-Policy: sandbox`. Verwendungsprüfung über Bild-Spalten (Veranstaltung, Neuigkeit, Kurs) und `mediumId` im Rich-Text der Neuigkeiten; der Löschlauf leert den Medien-Papierkorb nach 30 Tagen nur für ungenutzte Medien. Medienwahl im Editor und Bilder an Inhalten folgen als C11b.

**E-039 · 2026-10-11 · Gebetszeiten-Verwaltung**
Import in zwei Schritten: „Datei prüfen“ speichert nichts und zeigt Zeilenfehler oder eine Vorschau; „Import übernehmen“ prüft die zurückgesandten Tage erneut mit demselben Parser (nie der Vorschau vertrauen) und ersetzt vorhandene Tage. Bestätigung „von der Gemeinde“ ist ein eigenes Häkchen (G-06), nur dann entfällt öffentlich der Hinweis „berechnet“. Entfernen eines Imports löscht dessen Tage (danach gilt die Berechnung); das Import-Protokoll bleibt. Audit: Einstellung, Import, Entfernen.

**E-040 · 2026-10-11 · Seiteninhalte: Bearbeitung über das Schema, kein Lese-Audit**
Seiteninhalte werden als ganzes JSON-Dokument bearbeitet (Client-Zustand → verstecktes Feld `inhalt`) und auf dem Server mit genau dem Schema geprüft, das auch die öffentliche Seite liest (`SEITENINHALT[bereich]`); Feldfehler tragen den Pfad. Das Öffnen der Bearbeitungsseiten wird nicht protokolliert: Die Angaben (z. B. Vorstand) sind zur Veröffentlichung bestimmt, keine Daten von Besucherinnen und Besuchern (G-07 betrifft Eingänge, Melderdaten, Konten); Änderungen stehen im Audit-Log. Öffnungszeiten haben eine Quelle (Kontakt-Seiteninhalt) für Kontaktseite und Fußzeile.

**E-041 · 2026-10-11 · Besucheradresse nur vom vertrauten Proxy; keine IP-Adressen bei Better Auth**
Gefunden im Tor B/C (SP-C1 H1, live bestätigt): Next.js setzt `X-Forwarded-For` nur, wenn der Header fehlt. Ein vom Client mitgeschickter Wert geht unverändert durch. Damit ließen sich alle Ratenbegrenzungen (Formulare, Anmeldung, Passwort vergessen) mit wechselnden Fantasie-Adressen umgehen. Entscheidung: `clientAdresse()` wertet Adress-Header nur mit `PROXY_VERTRAUEN=1` aus. Dann gilt zuerst `X-Real-IP`, das der Proxy überschreibt, sonst der letzte XFF-Eintrag, den der Proxy anhängt. Ohne vertrauten Proxy teilen sich alle Anfragen ein Limit; das ist strenger, aber nicht umgehbar. Der Start meldet diesen Zustand im Betrieb als Fehler im Log. Better Auth speichert keine IP-Adressen (`disableIpTracking`, Migration 0006 leert vorhandene Werte, M6). Über HTTP gesperrt sind zusätzlich `request-password-reset`, `reset-password`, `change-password` und `update-user`; die App nutzt eigene Server Actions mit Begrenzung und Audit (M1). Betrieb: BETRIEB.md 5a (nginx/Caddy). Verworfen: (a) den ersten XFF-Eintrag nehmen, weil der fälschbar ist; (b) eine Liste vertrauter Proxy-Adressen, weil sie für einen Ein-Server-Betrieb zu aufwendig und fehleranfällig wäre.

**E-042 · 2026-10-11 · Datenschutz-Nachbesserungen aus Tor B/C und Klassifikation der Lesezugriffe**
Umgesetzt (ADR 0003, 0005, 0007 Nachträge):
- Öffentliche Meldungen: Betreff und Text verschlüsselt bei den Melderangaben, das Ticket nur mit neutralem Titel (B1).
- Bestätigungsmails: höchstens 3 je Adresse in 24 h (B2).
- Höchstfrist von 365 Tagen für offene Eingänge; „gelöst“ setzt die Abschlusszeit der Tickets (B4).
- Platzprüfung unter Zeilensperre (B9).
- Letzte Administration: Schutz per Transaktionssperre (M3).
- Lese-Audit für Konten (`benutzer.gelesen`, M2) und Audit der Anmeldung mit zweitem Faktor (M7).
- Sperren entwertet offene Passwort-Links (N6). Einladungen werden 30 Tage nach Annahme, Widerruf oder Ablauf gelöscht, abgelaufene Verifikationen sofort (N7). „Passwort vergessen“ antwortet zeitlich gleich (N1).
- `verwendungVon` über JSONPath (SP-C2 B1).
- Upload-Grenze 11 MB (SP-C2 B9); Medien-Cache 7 Tage statt immutable (B7).

**Klassifikation (M4, M5, N5, SP-C2 B10):** Protokolliert wird jeder Lesezugriff auf Daten von Besucherinnen und Besuchern (Eingänge, Melderangaben samt Meldungstext) und auf das Kontenverzeichnis (Namen und E-Mail-Adressen aller Mitarbeitenden). Nicht protokolliert werden:
- interne Ticketbeschreibungen und Kommentare (M4/M5): von Mitarbeitenden geschrieben, keine Besucherdaten;
- Postfach (E-035);
- Abfragen im Audit-Log: nur die Administration, der Zugriff ist selbst Prüfhandlung;
- Namen von Erstellenden oder Importierenden neben Inhalten (B10).

Diese Texte bleiben im Klartext, damit Liste, Suche und Zähler funktionieren. Die Verwaltung erhält die Regel „In Tickets und im Postfach keine Gesundheitsdaten, Kontaktdaten oder Anliegen Dritter eintragen – dafür sind Eingänge und Meldungen da“ (HANDBUCH-VERWALTUNG, M-095).

**Bewusst offen (niedrig):**
- Formular-Schritte ohne eigenen Zähler (SP-B B5): Proxy-Limit, BETRIEB 5b.
- Ankündigungszeitfenster im Stundencache (SP-B B8): bis zu 1 h Verzug, dokumentiert.
- Geschützte Seiten antworten ohne Sitzung mit 200 und Stream-Weiterleitung statt 307 (N8): kein Personendatum.
- Melder-E-Mail im Leseschema ohne Formatprüfung (N4): Das öffentliche Schema prüft beim Schreiben.
- Organisationsbindung erst im Aufrufer statt in der Abfrage (SP-C2 B3/B4): Seiten prüfen vor dem Rendern.
- PDF-Metadaten (SP-C2 B8): Hinweis im Upload-Formular mit C11b.

**E-043 · 2026-10-11 · Bilder an Inhalten (C11b)**
- **Verweis:** Neuigkeiten, Veranstaltungen und Kurse verweisen per `bildId` auf die Mediathek, Neuigkeiten zusätzlich per Bildknoten im Rich-Text. Gespeichert wird nur ein vorhandenes Bild außerhalb des Papierkorbs, kein PDF; die Prüfung macht der Server, `bildUngueltig` steht am Feld.
- **Alt-Text** kommt immer aus der Mediathek, je Sprache mit Rückfall Deutsch und `lang="de"`. Er wird nicht je Inhalt gepflegt, damit dasselbe Bild überall gleich beschrieben ist.
- **Öffentliche Darstellung:**
  - über `getImageProps` als Server-Element, ohne Client-JavaScript (E-030);
  - Bilder im Papierkorb fallen weg, dann erscheint der Platzhalter;
  - die Veranstaltungsdetailseite bleibt ohne Bild, weil das Design dort keines vorsieht;
  - die Karten der Startseiten-Veranstaltungen bleiben ohne Bild (Design).
- **Auswahl:** Die Formularseite lädt höchstens 300 Bilder und gibt sie an einen nativen Dialog. Eine eigene Schnittstelle gibt es nicht.
- **Löschfristen:** `/medien` wird 1 Tag gecacht, die Bildoptimierung übernimmt dieses Höchstalter. Spätestens nach einem Tag ist ein gelöschtes Bild auch aus den optimierten Kopien verschwunden (K-05).
- **Verworfen:**
  - Bild-URL im Inhalt speichern: verwaist beim Löschen, kein Alt-Text.
  - `next/image` als Client-Komponente: zusätzliches JavaScript.
  - Eine Such-Schnittstelle für Medien: mehr Angriffsfläche ohne Bedarf.

## Marktstart mit IGMG-Daten (Plan vom 27./28.10.2026)

**E-044 · 2026-10-27/28 · Nutzer · Marktstart mit IGMG-Daten**
Grundlage: Crawls von igmg.org und igmgreisen.com (Stand 13.10.2026) und der freigegebene Plan. Verbindlich:
1. **Zustimmung der IGMG liegt vor.** Texte schreibt der Lauf selbst, abgeleitet aus den IGMG-Quellen und für Suche und Antwortmaschinen formuliert (kein Doppel-Content, keine wörtlichen Übernahmen). Fakten wie Zahlen und Kontakt werden mit Quelle und Stand übernommen.
2. **„Aus dem Dachverband“** zeigt Freitagspredigt (Hutba) und Gemeinschaftsthemen, **keine politischen Pressemitteilungen**.
3. **Der IGMG-Gebetskalender ist die offizielle Quelle** der Gebetszeiten (Wetzlar, ID 20238). Gewünscht ist ein automatischer Abgleich; die eigene Berechnung weicht heute bis zu 4–6 Minuten ab. Die interne AJAX-Schnittstelle von igmg.org wird nicht umgangen.
4. **Gründungsjahr der Gemeinde: 1978.** Beleg: IGMG-Artikel vom 07.04.2008 zur 30-Jahr-Feier (Regionalverband Hessen); der Artikel vom 17.10.2011 nennt die „Fatih Moschee Wetzlar“.
5. **Religiöse Erklärtexte** (Hadsch/Umra, Feste und Kalender, Zakat/Fitra/Kurban, Freitagsgebet) schreibt der Agent. Sie gehen sofort live, deutlich gekennzeichnet als „Entwurf zur Prüfung“; der Imam gibt sie später über das bestehende Freigabeverfahren frei (Fortschreibung von ADR 0030 Nr. 4 für die Website, ADR 0047). Koranverse, Hadithe und Bittgebete schreibt der Agent weiterhin nie (G-06).
6. **Indexierung:** `noindex`, solange der Konzept-Hinweis „Daten fiktiv“ aktiv ist; danach wird die Seite automatisch indexierbar.
7. **Vor dem Marktstart wird die Datenbank angeschlossen** (GO-LIVE G1). Damit laufen Verwaltung, Gebetszeiten-Abgleich und Hutba-Pflege live.

**E-045 · 2026-10-28 · Orchestrator (mit Plan freigegeben, E-044) · KERN 1.2**
- K-03: um die öffentlichen Bestandsrouten ergänzt, die in `web/src/i18n/routing.ts` stehen, aber im Kern fehlten (`/meldung`, `/barrierefreiheit`, `/quellen`, `/quran/cuz/[nr]`, `/quran/tajwid`, `/hadith` mit Bukhari und Auswahl, `/lernen`, `/elifbe` mit Buchstaben, Lektion und Üben, `/kalender`, `/ramadan`, `/hatim`, `/hatim/[id]`, `/spenden`, `/newsletter`), und um die neue Seite `/hadsch-umra` (tr `/hac-umre`, en `/hajj-umrah`).
- K-08 (a): verbindlich sind Tabellen aus dem Import oder aus dem Abgleich mit dem IGMG-Gebetskalender (offizielle Quelle, ADR 0048). (b) bleibt als Ersatz mit Hinweis „berechnet“.
- K-16: JSON-LD zusätzlich mit WebSite und FAQPage; Organization trägt den Dachverband (`parentOrganization`) und den Regionalverband (`memberOf`).
- G-10: Testanpassungen im Marktstart-Lauf, die Abgenommenes berühren (z. B. CSP `frame-src`, Startseiten-Ordnung, Name der Moschee im JSON-LD, Routentabellen), laufen unter dieser Entscheidung.
Grund: Der Kern beschrieb die Routen seit dem Lauf „Gemeinde-Plattform“ nicht mehr vollständig; E-044 Nr. 3 macht den IGMG-Gebetskalender zur verbindlichen Quelle.

**E-046 · 2026-10-28 · Nutzer · Fitre und Vorschau für den Vorstand**
Aus der Gegenprüfung des Marktstart-Branches:
1. **Fitre: beides.** Die Gemeinde nimmt die Fitre selbst entgegen (Knopf auf `/ramadan` bleibt); man kann sie auch direkt bei Hasene geben. Der Wissens-Entwurf „Zakat, Fitra, Fidya und Kurban“ sagt deshalb nicht mehr pauschal, die Spenden gingen nicht an die Fatih-Moschee Wetzlar, sondern: Was man direkt bei Hasene gibt, geht an Hasene; die Fitre nimmt auch die Gemeinde entgegen. Ob und wie die Gemeinde weiterleitet, steht nicht im Text (G-05) und ist ein Menschen-Punkt.
2. **Vorschau:** Der PR umutcantezgel-cpu/IGMG#5 wird nach grüner Gesamtprüfung nach `main` gemergt; die Live-Seite zeigt den neuen Stand weiter mit Konzept-Hinweis und `noindex` (E-044 Nr. 6). Die Vorstandsvorlage verlinkt die Live-Seite.

**E-047 · 2026-10-28 · Nutzer · Livegang „Technik live, Hinweis an“**
Auftrag „Alles live schalten und abschließen“. Vorhanden ist nur die Testumgebung (keine Datenbank, keine Domain, kein Mailanbieter, keine echten Gemeindedaten); niemand hat einen Rechner mit Zugang zur Datenbank. Verbindlich:
1. **Technik live, Hinweis an:** Beide Vercel-Projekte (`igmg-wetzlar`, Team tez1, Root leer; `igmg`, Team uus-projects, Root `web`) bekommen Datenbank (Neon, Frankfurt, PostgreSQL 17), Blob-Speicher, Geheimnisse und Crons. Der Konzept-Hinweis „Daten fiktiv“ und `noindex` bleiben an, bis Vorstand, Imam und Rechtsprüfung durch sind (M-099, M-100, M-101, M-111, M-114); erst dann C1/C14.
2. **Der Nutzer klickt selbst** in Vercel (keine Zugriffsfreigabe für den Agenten). Der Agent liefert die Klickliste und die Geheimnisse als Datei außerhalb des Repositorys.
3. **Erstbefüllung im Bau** (Nachtrag ADR 0019 vom 28.10.2026, Ausnahme vom „kein Seed im Bau“): Mit `ERSTBEFUELLUNG=1` spielt der Production-Bau die Seeds einmal ein und setzt den Merker `erstbefuellung` in `einstellung`; danach nie wieder, auch wenn die Variable stehen bleibt. Mit `ERSTE_VERWALTUNG_EMAIL` und `ERSTE_VERWALTUNG_NAME` legt er die Einladung des ersten Verwaltungskontos (Administration, 72 h) an, solange kein Konto diese Rolle hat; der Link steht nur im Bauprotokoll, gespeichert wird nur der Hash. Ein neuer Bau widerruft eine offene Bau-Einladung, es gilt der neueste Link. Beides nur in Production.
4. **`/lern-app`** folgt derselben Indexierungs-Schranke wie die Website (`noindex, follow` mit Konzept-Hinweis auf Vercel); bisher war sie trotz Hinweis indexierbar.
Grund: Ohne Rechner gibt es kein `pnpm db:seed` und kein `pnpm verwaltung:einladen` gegen die Produktionsdatenbank; der Container des Agenten erreicht Neon nicht. Eine leere Datenbank zeigte leere Seiten und ließe die Verwaltung ohne Zugang.

