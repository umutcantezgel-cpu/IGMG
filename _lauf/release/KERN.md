# KERN – Version 2.0

Gilt für den Release-Lauf. K-01 bis K-20 stammen aus `_lauf/KERN.md` v1.1, mit den dort dokumentierten Änderungen. K-21 bis K-32 und die Grenzen G-01 bis G-10 stammen wörtlich aus Abschnitt 8 bzw. 4 des Auftrags „Startklar machen“. Änderungen nur über `_lauf/release/ENTSCHEIDUNGEN.md` mit neuer Versionsnummer.

Änderungen: 2.0 (R-E11) – K-21 bis K-32 aufgenommen; K-03 um /meldung und /barrierefreiheit ergänzt. Die Grenzen des Auftrags „Startklar machen“ ersetzen G-01 bis G-10 der Version 1.1. Geltende Festlegungen der Nutzerantworten: R-E01 (main + push) und R-E09 (öffentliches Repo).

K-01 Rendering: Cache Components mit cacheComponents und partialPrefetching. Öffentliche Inhalte werden mit 'use cache', cacheLife und cacheTag zwischengespeichert; Änderungen in der Verwaltung lösen updateTag in der Server Action aus, sonst revalidateTag(tag, 'max'). Reine Inhaltsseiten sichern das mit ensureStatic ab. Öffentliche Seiten lesen keine Cookies; Anmeldung und alles Persönliche liegt im Bereich Verwaltung.

K-02 Mehrsprachigkeit: next-intl mit [locale]-Segment ganz oben; Deutsch ohne Präfix, /tr und /en mit Präfix; lokalisierte Pfade; hreflang und x-default. Alle UI-Texte stehen in messages/{de,tr,en}.json, keiner im Code. Bestandsübersetzungen gehen vor; neue Übersetzungen sind markiert und stehen in MENSCHEN.md. Datenbankinhalte: Deutsch Pflicht, Türkisch und Englisch optional mit sichtbarem Rückfall auf Deutsch.

K-03 Adressen auf Deutsch, für tr und en entsprechend lokalisiert: / · /gebetszeiten · /gebetszeiten/anzeige · /veranstaltungen · /veranstaltungen/[slug] · /nachrichten · /nachrichten/[slug] · /ueber-uns · /vorstand · /projekte · /kontakt · /igmg · /quran · /quran/[sure] · /islamisches-wissen · /islamisches-wissen/[thema] · /organisationen/[organisation] · /bildung/korankurse · /bildung/voranmeldung · /mitglied-werden · /webseite-fuer-moscheen · /impressum · /datenschutz · /suche · /offline · /meldung · /barrierefreiheit · /verwaltung/… *(1.1: /suche und /offline ergänzt, E-012; 2.0: /meldung (E-034) und /barrierefreiheit (K-28/R3) ergänzt, R-E11)*

K-04 Gestaltung: Design-Tokens aus der Übergabe als Tailwind-Theme (@theme); shadcn/ui-Bausteine nach diesen Tokens gestaltet; Komponentennamen wie in Design und Bestand (Header, PrayerTimesBar, Breadcrumbs, Footer …); Schriften selbst gehostet über next/font; Seitenübergänge mit React View Transitions, abgeschaltet bei reduzierter Bewegung.

K-05 Daten: PostgreSQL mit Drizzle; versionierte Migrationen; Zeitstempel in UTC, Anzeige in Europe/Berlin; Inhalte mit Entwurf, Veröffentlicht und Papierkorb (30 Tage); Personendaten werden echt gelöscht.

K-06 Rechte: Rollen Administration, Redaktion, Organisationsredaktion (je Organisation nur eigene Inhalte), Bildung (Kurse und Voranmeldungen), Mitgliederverwaltung (Anträge). Jede Server Action und jede Route prüft die Rolle serverseitig. Zwei-Faktor-Anmeldung (TOTP oder Passkey) ist für alle Konten Pflicht; Konten entstehen nur per Einladung.

K-07 Formulare: Server Actions mit Zod – ein Schema für Client und Server – und useActionState; mehrstufige Formulare mit Fortschritt; ALTCHA, Honigtopf-Feld und Ratenbegrenzung; Einwilligungen mit Zeitpunkt und Textversion gespeichert; Bestätigungsmail an Absender und Benachrichtigung an die zuständige Rolle; Fehlertext am Feld, Fokus auf die Rückmeldung.

K-08 Gebetszeiten: Quelle umschaltbar – (a) Tabellen-Import (CSV oder JSON) in der Verwaltung als verbindliche Quelle, (b) Berechnung mit adhan als vorläufiger Ersatz mit sichtbarem Hinweis „berechnet“, Methode und Parameter einstellbar (Annahme bis zur Klärung: Methode „Turkey“, steht in MENSCHEN.md). Zeitzone Europe/Berlin samt Sommerzeit. Nächstes Gebet und Restzeit berechnet der Browser aus den zwischengespeicherten Tageszeiten. Monatsansicht druckbar, im Ramadan mit hervorgehobenem Imsak und Iftar. Qibla-Richtung für Wetzlar fest berechnet, Kompass nur nach ausdrücklichem Klick. Die Anzeige für den Bildschirm in der Moschee ist aus der Ferne lesbar, aktualisiert sich um Mitternacht selbst und läuft offline weiter.

K-09 Termine: wiederkehrend über rrule mit Ausnahmen; Organisation, Kategorie, Zielgruppe, Ort, optionale Anmeldung mit Platzzahl; iCal-Datei je Termin und Abo-Feed je Organisation.

K-10 Medien: Upload nur in der Verwaltung; Speicher über einen Adapter (lokales Verzeichnis in der Entwicklung, S3-kompatibel im Betrieb); Prüfung von Typ und Größe; Alt-Text ist Pflicht; Auslieferung über next/image.

K-11 Barrierefreiheit: WCAG 2.2 AA. Aus dem Design: Fließtext mindestens 16 px, Kontrast 4,5:1 (große Schrift 3:1), Klickziele 44 px (Telefon 48 px), sichtbarer Fokus. Dazu: lang-Attribut je Sprache, Fehlermeldungen über aria-describedby, Restzeit-Anzeige ohne Daueransage für Screenreader, prefers-reduced-motion.

K-12 Leistung (Lighthouse mobil): Performance mindestens 90, Barrierefreiheit 100, Best Practices und SEO mindestens 95; LCP höchstens 2,5 s, CLS höchstens 0,1, INP höchstens 200 ms; JavaScript beim ersten Laden einer öffentlichen Seite höchstens 180 kB (gzip).

K-13 Sicherheit: Sicherheits-Header (Content-Security-Policy passend zu statischen Seiten, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, frame-ancestors); Datenbankzugriffe nur über Drizzle mit Parametern; keine Personendaten in Logs oder Fehlermeldungen; immer die neueste Next.js-Patchversion (für den 14.10.2026 ist ein Sicherheitsupdate angekündigt); pnpm audit ohne kritische und hohe Befunde.

K-14 Datenschutz-Technik: keine Anfragen an Dritte beim Seitenaufruf; Karte erst nach Klick; Next.js-Telemetrie und experimental.agentFeedback aus.

K-15 PWA: Manifest, Symbole (bis echte Logos in höherer Auflösung vorliegen ein neutrales Monogramm – das Logo wird nie nachgezeichnet), Offline-Seite, Gebetszeiten des laufenden Monats offline verfügbar.

K-16 SEO: Metadaten je Seite und Sprache, sitemap.ts mit Sprachvarianten, robots.ts, JSON-LD (Mosque, Organization, Event, NewsArticle, BreadcrumbList), OG-Bilder.

K-17 Code: TypeScript strict ohne any; ESLint Flat Config mit Next.js- und jsx-a11y-Regeln; Prettier; lint-staged prüft und formatiert beim Commit nur geänderte Dateien; 'use client' nur, wo Interaktion es verlangt; reactCompiler an; experimentelle Schalter nur mit ADR.

K-18 Struktur von web/: src/app/[locale]/(website) · src/app/[locale]/verwaltung · src/components/{ui,website,verwaltung} · src/lib (db, auth, mail, storage, gebetszeiten, termine, rechte, audit, validierung) · src/server (actions, queries) · messages/ · drizzle/ · tests/{unit,integration,e2e} · docs/ (adr, README, BETRIEB, HANDBUCH-VERWALTUNG, LIZENZEN, MUSTER, ABWEICHUNGEN).

K-19 Betrieb: output standalone; Dockerfile und docker-compose (App, PostgreSQL, Mail-Fänger); Health-Check-Route; geschützte Route für Löschfristen, aufrufbar per Cron; README für Entwicklung, Betrieb, Backup und Updates.

K-20 Agentenhilfen: web/CLAUDE.md enthält @AGENTS.md, wo Next.js seine Regeln pflegt; die Next.js DevTools MCP nutzt du, wenn sie verbunden ist.

K-21 Betriebsarten über SITE_MODE: entwicklung · vorschau · produktion. Vorschau: Zugang nur mit Passwort, geprüft in proxy.ts, damit es auch vor statischen Seiten greift; X-Robots-Tag noindex und robots.txt mit vollständiger Sperre; sichtbares Band „Vorschau – nicht öffentlich“; E-Mails nur an Mail-Fänger oder Test-Postfach; Beispielinhalte erlaubt und als „Beispiel“ gekennzeichnet; fehlende Pflichtangaben als markierte Platzhalter. Produktion: keine Beispielinhalte und keine Platzhalter öffentlich; der Startklar-Check muss grün sein.

K-22 Stammdaten als einzige Quelle: Vereinsname, Rechtsform, Anschrift, Vertretungsberechtigte, Kontaktwege, Registergericht und Registernummer, USt-IdNr. und W-IdNr. (beide optional), verantwortliche Person nach Medienstaatsvertrag, Datenschutzbeauftragte Person (optional), Aufsichtsbehörde, Hosting-, E-Mail- und Speicheranbieter, Bankverbindung, Gemeinnützigkeit mit Bescheiddatum, Gebetszeiten-Quelle. Pflege nur durch die Rolle Administration, versioniert und mit Audit-Eintrag. Impressum, Datenschutzerklärung, Footer, JSON-LD und E-Mails lesen ausschließlich hier.

K-23 Einwilligungs-Konfiguration als einzige Quelle: Kategorien, Dienste, Speicher-Einträge (Name, Zweck, Dauer, Anbieter, Kategorie, Rechtsgrundlage) und Textversion. Daraus entstehen Banner, Einstellungsdialog, die Speicher-Tabelle der Datenschutzerklärung und die Sperre externer Inhalte: Karte und Videos erscheinen vor der Einwilligung als Platzhalter mit „Einmal laden“ und „Immer erlauben“. Selbst gehostet, ohne externen Dienst.

K-24 Banner: erste Ebene mit „Alle akzeptieren“, „Alle ablehnen“ und „Einstellungen“; Akzeptieren und Ablehnen gleich groß und gleich gewichtet; keine Vorauswahl; nur Kategorien, die die Website wirklich nutzt (Notwendig immer, Externe Medien, Statistik nur bei AN); Impressum und Datenschutz bleiben ohne Entscheidung erreichbar; keine Cookie-Wall; Widerruf über „Datenschutz-Einstellungen“ im Footer jeder Seite; neue Abfrage nach zwölf Monaten und bei neuer Textversion; Global Privacy Control gilt als Ablehnung; drei Sprachen; zugänglicher Dialog mit Fokusführung; keine Anzeige auf dem Bildschirm in der Moschee.

K-25 Einwilligungsnachweis: Zufallskennung, Zeitpunkt, Textversion und Auswahl – ohne IP-Adresse, Aufbewahrung laut Löschkonzept.

K-26 Endgerätezugriff: Cookies, Web-Speicher, IndexedDB, Cache Storage und Service Worker sind einzeln erfasst und entweder als unbedingt erforderlich begründet oder einwilligungspflichtig.

K-27 Rechtstexte: Deutsch ist maßgeblich, Türkisch und Englisch sind Übersetzungen mit diesem Hinweis; jede Fassung trägt Version und Stand-Datum; die Freigabe durch den Vorstand ist ein Schalter im Cockpit; jede Änderung erzeugt eine neue Version, und Formular-Einwilligungen speichern die Version, der zugestimmt wurde.

K-28 Datenschutzerklärung aus dem Verarbeitungsverzeichnis (VVT): Jede Verarbeitung – Hosting und Server-Protokolle, Kontakt, Veranstaltungsanmeldung, Schüler-Voranmeldung, Mitgliedsantrag, Moschee-Anfrage, Verwaltungskonten, E-Mail-Versand, Medien, externe Medien, Einwilligungsnachweis, gegebenenfalls Statistik – erscheint mit Zweck, Rechtsgrundlage, Empfängern, Drittlandbezug und Speicherdauer.

K-29 Uploads: Bilder werden beim Hochladen neu kodiert und von Metadaten (EXIF, GPS) befreit; bei Personenfotos bestätigt die hochladende Person die Einwilligung der Abgebildeten, bei Kindern die der Eltern.

K-30 Konfiguration: Umgebungsvariablen werden beim Start typgeprüft; fehlende oder ungültige Werte brechen mit verständlicher Meldung ab; .env.example ist vollständig kommentiert; Geheimnisse sind per Skript erzeugbar.

K-31 Deploy-Ziele, ohne Code-Änderung umschaltbar: (A) Docker-Server in Deutschland mit Reverse-Proxy und automatischem HTTPS, PostgreSQL, SMTP und verschlüsselten Backups; (B) Vercel mit Region Frankfurt, EU-PostgreSQL, EU-Objektspeicher und Vercel-Cron. Ratenbegrenzung und Sitzungen funktionieren mit mehreren Instanzen.

K-32 Startklar-Cockpit in der Verwaltung und Befehl pnpm startklar mit derselben Prüfliste: Stammdaten-Pflichtfelder · keine Platzhalter und Beispielinhalte in veröffentlichten Inhalten · Rechtstexte freigegeben · Gebetszeiten-Quelle bestätigt · Testmail zugestellt · letztes Backup und letzte Wiederherstellungsprobe erfolgreich · Cron-Aufgaben aktiv · alle Verwaltungskonten mit Zwei-Faktor, keine Testkonten · SITE_URL mit HTTPS · Betriebsart produktion · robots erlaubt · jede menschliche Aufgabe aus MENSCHEN.md. Jede Prüfung zeigt eine Ampel, eine Erklärung in einfacher Sprache und den Ort der Behebung.

## Grenzen (Auftrag „Startklar machen“, Abschnitt 4)
G-01 Schreiben nur in web/ und _lauf/release/; alles andere nur lesen. Kein Push, kein Umschreiben der Geschichte. *(R-E01: Push nach main ist durch den Nutzer erlaubt; das Umschreiben der Geschichte bleibt verboten.)*
G-02 Kein Produktions-Deployment. Ein Vorschau-Deployment nur laut Einstellung, mit vorhandenem Zugang, passwortgeschützt und noindex. Keine Konten, Domains, DNS-Einträge oder kostenpflichtigen Dienste anlegen oder ändern.
G-03 Keine echten Personendaten in Code, Seeds, Tests oder Logs; keine echten E-Mails – nur Mail-Fänger oder das Test-Postfach der Vorschau.
G-04 Rechtstexte sind Entwürfe nach aktuellem Stand mit Quellen. Du gibst sie nie als rechtlich geprüft aus; die Prüfung durch Anwalt oder Datenschutzbeauftragten steht in der Go-Live-Liste.
G-05 Keine erfundenen Fakten: Vereinsname, Anschrift, Vorstand, Registernummer, Identifikationsnummern, Bankverbindung und Ansprechpersonen nur aus vorhandenen Unterlagen, sonst ein Stammdatenfeld mit Platzhalter.
G-06 Religiöse Texte nie aus dem Modellgedächtnis; Lizenzen für Quran-Text und Übersetzungen belegt oder Platzhalter.
G-07 Datenschutz: keine Anfrage an Dritte und kein einwilligungspflichtiger Speicher vor der Einwilligung; kein externer Einwilligungsdienst, keine Tracker.
G-08 Bestandsschutz: Alle bisher grünen Tests bleiben grün, die Design-Treue bleibt erhalten; umgebaut wird nur, was einen Befund behebt.
G-09 Nur offene Lizenzen (MIT, Apache-2.0, BSD, ISC, MPL-2.0); die Lizenzliste bleibt aktuell.
G-10 Geheimnisse nie im Repository; Skripte erzeugen sie.

## Einstellungen des Laufs (Abschnitt 0)
Ziel v1.0.0-rc.1 · Träger und Aufsicht (Annahme): eingetragener Verein in Hessen, HBDI · Karte (OpenStreetMap) und YouTube-Videos vorbereitet · Statistik: AUS · Deploy-Ziele: beide vorbereiten · Vorschau-Deployment: AUS · Produktions-Deployment: AUS · Git: main + push (R-E01) · Abhängigkeiten: Patch und Minor erlaubt, Major nur mit ADR.

Glossar: Paket – ein Auftrag an genau einen Agenten · Welle – Pakete ohne gegenseitige Abhängigkeit, die gleichzeitig laufen · Tor – Prüfpunkt am Ende einer Phase oder Welle · Seitenblatt – Bauvorlage einer Seite aus Design und Bestand · Muster – die im Durchstich festgelegten Bauweisen in web/docs/MUSTER.md.

## Grenzen (Abschnitt 4, für Paket-Auszüge)
G-01 Schreiben nur in web/ und _lauf/; bestand/ und design/ werden nur gelesen. Kein git push, kein Umschreiben der Geschichte. *(Push durch E-004 erlaubt: nur main, immer pushen; kein Umschreiben der Geschichte bleibt.)*
G-02 Nichts deployen; keine Cloud-Konten, Domains oder kostenpflichtigen Dienste anlegen; keine echten E-Mails versenden – in der Entwicklung landen sie im Mail-Fänger oder in einer Datei.
G-03 Keine Geheimnisse im Repository: alle .env-Dateien außer .env.example stehen in .gitignore; nur Öffentliches trägt das Präfix NEXT_PUBLIC_.
G-04 Keine echten Personendaten in Code, Seeds, Tests oder Logs; Testdaten sind erkennbar fiktiv, etwa „Testperson Eins“.
G-05 Keine erfundenen Fakten über die Gemeinde – Namen, Adressen, Telefonnummern, Bankverbindungen, Termine, Zahlen. Inhalte kommen aus bestand/ und design/; Fehlendes wird zum Platzhalter in eckigen Klammern und steht in MENSCHEN.md.
G-06 Religiöse Texte: Koran, Hadithe und Bittgebete nie aus dem Modellgedächtnis. Arabischer Korantext nur wörtlich aus einer etablierten Quelle mit geprüfter Lizenz und Quellenangabe; Übersetzungen nur mit geklärter Lizenz, sonst Platzhalter. Gebetszeiten gelten erst als offiziell, wenn die Gemeinde die Quelle bestätigt hat.
G-07 Datenschutz: Alle Formulardaten gelten als besonders schutzwürdig. Nur nötige Felder; Zugriff nur für berechtigte Rollen; jeder Zugriff auf Personendaten im Audit-Log; Export- und Löschfunktion; Löschfristen einstellbar. Keine Tracker, nur technisch nötige Cookies, keine Anfragen an Dritte ohne Einwilligung.
G-08 Rechtstexte (Impressum, Datenschutzerklärung, Einwilligungen): Seiten und Aufbau ja, Inhalt nur als markierter Entwurf; die fachliche Prüfung steht in MENSCHEN.md.
G-09 Nur Pakete mit offenen Lizenzen (MIT, Apache-2.0, BSD, ISC, MPL-2.0); die Liste steht in web/docs/LIZENZEN.md.
G-10 Was abgenommen ist, bleibt grün; umgebaut wird nur, was einem Z-Kriterium dient.

## Ordnerzuordnung (E-001)
- design/ ≙ Workspace-Wurzel `/Users/umurey/Downloads/IGMG Wetzlar Website Design/` (*.dc.html, tokens/, assets/, readme.md, SKILL.md, support.js, styles.css) – nur lesen
- bestand/ ≙ `uploads/igmg-wetzlar-website/` – nur lesen
- web/ und _lauf/ – einzige Schreiborte
