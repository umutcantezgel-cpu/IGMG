# SP-A Sicherheit

SP-A · Sicherheitsprüfung, Umfang 1–5 · Stand 2026-10-11

Basis für alle Fundstellen (Datei:Zeile): `/Users/umurey/Downloads/IGMG Wetzlar Website Design/web/`. Geprüft wurde nur lesend. Live wurde ausschließlich mit GET gearbeitet (kein POST, kein Formularversand, keine Mails, keine Schreibvorgänge). Von Geheimnissen wurden nur Namen und Vorhandensein geprüft, Werte wurden nicht ausgegeben.

## Befunde

### Hoch

**SP-A-01 · S10 · Eingänge mit Kinderdaten ohne Löschfrist**
- Fundstelle: `src/lib/formulare/verarbeiten.ts:70–80` (Insert ohne `loeschenAb`); `src/lib/db/schema/eingaenge.ts:32` (Spalte wird nirgends befüllt); `docs/BETRIEB.md:42` (Löschroute „folgt in Welle C“); `src/app/api/wartung/` enthält nur `cache-erneuern`; `src/lib/validierung/altcha.ts:68` und `src/lib/validierung/ratenbegrenzung.ts:38` haben keinen Aufrufer.
- Befund: Eltern- und Kinderdaten bleiben unbegrenzt gespeichert, eine Löschung gibt es nicht. Die Datenschutzangabe räumt das selbst ein (`drizzle/seeds/bereiche/rechtliches.ts:135`). ADR 0005 (`docs/adr/0005-formularaufbau.md:29`) setzt Fristen über `einstellung` an, das Schema über `loeschenAb`. Beides widerspricht sich.
- Vorschlag: Vor dem Livebetrieb Löschfristen je Eingangsart und eine Löschroute mit `WARTUNG_TOKEN` umsetzen (inkl. Einwilligungen und `mail_ausgang`). `loeschenAb` befüllen oder die Spalte entfernen.

**SP-A-02 · S10 · Datenschutzerklärung und Impressum sind ungeprüfte Entwürfe**
- Fundstelle: `messages/bereiche/rechtliches.json` (Schlüssel `de.rechtliches.entwurf`, `entwurfText`); `drizzle/seeds/bereiche/rechtliches.ts:135` und Platzhalter in eckigen Klammern. Live zeigt `/datenschutz` „Entwurf – rechtliche Prüfung ausstehend“.
- Befund: Pflichtangaben nach Art. 13 DSGVO fehlen. Das ist ein Freigabe-Blocker, kein technischer Fehler.
- Vorschlag: Platzhalter füllen und rechtlich prüfen lassen, bevor Formulare mit Kinderdaten live gehen.

### Mittel

**SP-A-03 · S3 · IP-Ermittlung vertraut dem letzten X-Forwarded-For-Eintrag**
- Fundstelle: `src/lib/sicherheit/ip.ts:9–20`; `src/lib/formulare/verarbeiten.ts:51–53`; `src/lib/validierung/ratenbegrenzung.ts:13` (5 je 600 s); `docs/BETRIEB.md:51` (Proxy muss die Adresse anhängen).
- Befund: Ohne Proxy, der den Header anhängt, setzt der Client die Adresse selbst, und das Limit lässt sich mit wechselnden Werten umgehen. Mit einer gültigen ALTCHA-Lösung ergibt das eine praktisch unbegrenzte Zahl an Voranmeldungen. Folgen: Datenbankzeilen, Bestätigungsmails an beliebige Adressen (`src/lib/mail/ausgang.ts:120`) und Benachrichtigungen an die Rollen. Der Aufwand je Lösung liegt grob bei 2–4 s auf einem Kern (Schätzung: Zähler 5.000–10.000 laut `altcha.ts:26`, lokal gemessen 0,40 ms je PBKDF2-Ableitung mit 5.000 Iterationen). Im Compose-Dienst bindet die App nur an 127.0.0.1. Die Proxy-Konfiguration liegt nicht im Repo.
- Vorschlag: Proxy-Konfiguration prüfen (nginx: `$proxy_add_x_forwarded_for`). Im Code nur einem bekannten Proxy vertrauen oder in Produktion Anfragen ohne vertrauenswürdige Adresse ablehnen. Zusätzlich ein Limit je Empfängeradresse einführen.

**SP-A-04 · S2 · `javascript:`-Adressen in Social-Links werden akzeptiert (gespeicherte XSS)**
- Fundstelle: `src/lib/validierung/seiteninhalte.ts:32` (`z.url()` ohne Protokollbeschränkung); `src/components/website/Footer.tsx:30–35` (Quelle `kontakt.social`) und `:51–56` (`href={url}`); Wirkung durch `src/lib/sicherheit/header.ts:35`.
- Befund: Ein Schreibzugriff auf den Seiteninhalt „kontakt“ genügt, um eine `javascript:`-URL zu setzen. Sie läuft beim Klick eines Besuchers im Ursprung der Website. Getestet mit Zod 4.6.5: `z.url()` akzeptiert `javascript:` und `data:`, `z.url({ protocol: /^https$/ })` lehnt beides ab. Die CSP erlaubt das wegen `'unsafe-inline'` (SP-A-10). Verwaltungsrechte wurden nicht geprüft.
- Vorschlag: Schema auf https beschränken (`z.url({ protocol: /^https$/ })`) und bestehende Werte prüfen.

**SP-A-05 · S9/S3 · Unbekannte Pfade werden als eigene Cache-Einträge gespeichert, teils mit HTTP 200**
- Fundstelle: `src/app/[locale]/[...rest]/page.tsx:8–10` (Platzhalter `_`), `:22–24` (Standardseite mit HTTP 200); `src/i18n/routing.ts:30–31` (Quran-Pfade ohne Seite); `src/app/[locale]/(website)/organisationen/[organisation]/page.tsx:51` (`notFound()`).
- Befund: Live antwortet `/xyz-unbekannt-…` mit HTTP 200 (122 KB). Beim Zweitabruf kommt `x-nextjs-cache: HIT`. Dasselbe gilt für 404-Antworten unter `/organisationen/…`, `/islamisches-wissen/…`, `/veranstaltungen/…` und `/nachrichten/…` (je 43–44 KB, Zweitabruf HIT). Jeder zufällige Wert belegt also Cache-Speicher. In `next.config.ts` ist keine Obergrenze gesetzt. Außerdem entsteht ein weiches 404 (200 statt 404), das für SEO schlecht ist.
- Vorschlag: `dynamicParams = false` für feste Mengen, echter 404-Status (lokalisierte Seite über `notFound()`), Anfragen an unbekannte Pfade am Proxy begrenzen.

**SP-A-06 · S4/S10 · Dateiversand als stiller Fallback mit Klartext-Adressen**
- Fundstelle: `src/lib/mail/transport.ts:27–34` (Datei-Transport, wenn `MAIL_TRANSPORT=datei` oder `SMTP_HOST` fehlt); `src/lib/mail/ausgang.ts:121` (Eintrag wird als gesendet markiert).
- Befund: Fehlt `SMTP_HOST` in Produktion, schreibt die App jede Mail als `.eml` im Klartext mit Empfängeradresse und markiert sie als gesendet. Geprüft: `.env` hat `MAIL_TRANSPORT=smtp` und `SMTP_HOST` gesetzt. Im Repo liegen 14 `.eml`-Dateien mit 42 Adressen, alle auf `example.test` (Testdaten). `.mail/` steht in `.gitignore:46`.
- Vorschlag: In Produktion beim Start abbrechen, wenn `SMTP_HOST` fehlt. Datei-Transport nur bei explizitem `MAIL_TRANSPORT=datei` und nie in Produktion.

**SP-A-07 · S5 · Anlegen von Eingängen mit Personendaten ohne Audit-Eintrag**
- Fundstelle: `src/lib/formulare/verarbeiten.ts:69–105` (Transaktion ohne `protokolliere`); `src/lib/audit/index.ts:50` (vorhanden, genutzt in `src/server/actions/anmeldung.ts:8` und `veranstaltungen.ts:7`); `/Users/umurey/Downloads/IGMG Wetzlar Website Design/_lauf/KERN.md:56` (G-07: jeder Zugriff auf Personendaten im Audit-Log); `docs/adr/0005-formularaufbau.md:25`.
- Befund: Auslegungsfrage. G-07 verlangt ein Audit für Zugriffe, ADR 0005 nennt ausdrücklich Lesezugriffe. Das Anlegen durch Besucher ist nicht eindeutig erfasst, die Nachvollziehbarkeit der Kinderdaten fehlt aber.
- Vorschlag: In der Transaktion `protokolliere({ benutzerId: null, aktion: 'eingang.angelegt', zielTyp: 'eingang', zielId: eingang.id, details: { art } }, tx)` aufrufen. Keine Personendaten in `details`.

**SP-A-08 · S9/Publikation · Geplante Beiträge sind vor ihrem Datum abrufbar und werden beim Bau vorgerendert**
- Fundstelle: `src/server/queries/nachrichten.ts:59–71` (`ladeNachricht` ohne Datumsfilter, Abfrage `:63–67`); `:83–92` (`ladeNachrichtenSlugs` ohne Datumsfilter, Abfrage `:87–90`); `src/app/[locale]/(website)/nachrichten/[slug]/page.tsx:25–28` (`generateStaticParams`), `:30–33` (`generateMetadata`), `:58–62` (Detailseite). Korrekt gefiltert sind die Liste (`nachrichten.ts:52`, `:78`) und die Beitrags-Vorschläge.
- Befund: Die Liste blendet geplante Beiträge aus (`nachrichten.ts:40`), die Detailseite nicht. Ein Beitrag mit Zukunftsdatum ist unter `/nachrichten/<slug>` sofort abrufbar und wird beim Bau als statische Seite erzeugt. Live nicht prüfbar, weil alle Beispielinhalte aus 2024/2025 stammen (`drizzle/seeds/daten/nachrichten.ts`).
- Vorschlag: `lte(veroeffentlichtAm, jetzt)` in `ladeNachricht` und `ladeNachrichtenSlugs` ergänzen. Den Zeitbezug nicht im `'use cache'` fixieren (siehe SP-A-12).

**SP-A-09 · S10 · Karte nach Klick wird durch die CSP blockiert; die Datenschutzangabe beschreibt sie als geladen**
- Fundstelle: `src/lib/sicherheit/header.ts:17` (`default-src 'self'`), `:33–37` (`cspOeffentlich`, kein `frame-src`); `src/components/website/kontakt/KarteNachKlick.tsx:33` (iframe nach Klick); `src/components/website/kontakt/karte.ts:9` (OpenStreetMap-URL); `src/components/website/kontakt/Anfahrt.tsx:24` (Einbettung erst bei Koordinaten). Live `/kontakt`: CSP ohne `frame-src`.
- Befund: Ohne `frame-src` fällt der Browser auf `default-src 'self'` zurück. Das Karten-iframe von openstreetmap.org wird dann blockiert, sobald die Koordinaten bestätigt sind. Heute ist keine Karte eingebunden („[Koordinaten fehlen]“), der Datenschutztext beschreibt die OSM-Übermittlung aber bereits. Kein Browsertest durchgeführt, die Aussage stammt aus der CSP-Regel und dem Live-Header.
- Vorschlag: Bei der Einbindung `frame-src https://www.openstreetmap.org` ergänzen und vor der Freigabe im Browser testen.

**SP-A-10 · S7/S10 · `'unsafe-inline'` für Skripte auf öffentlichen Seiten**
- Fundstelle: `src/lib/sicherheit/header.ts:35` (`script-src 'self' 'unsafe-inline'`), Begründung `:31`; `src/components/website/KonzeptHinweis.tsx:16` (verweist auf ADR 0012), `:18` (Inline-Skript). Live bestätigt.
- Befund: Eine bewusste Entscheidung, aber die CSP schützt kaum gegen eingeschleuste Skripte. Erst dadurch wirkt SP-A-04.
- Vorschlag: Hash für das eine Inline-Skript prüfen oder das Skript entfernen (SP-A-13). Restrisiko dokumentieren.

**SP-A-11 · S9 · Keine Cache-Invalidierung für Welle-A-Inhalte, lange Lebensdauer (vorbeugend, heute ohne Wirkung)**
- Fundstelle: `src/server/queries/kurse.ts:35`, `seiteninhalte.ts:14`, `wissen.ts:40/53/66/79` (Profil `max`); `src/lib/cache/aktualisieren.ts:15` (`inhaltGeaendert`), nur aufgerufen in `src/server/actions/veranstaltungen.ts:8` und `formulare/veranstaltungsanmeldung.tsx:8`.
- Befund: Für nachrichten, kurse, wissen und seiteninhalte gibt es keine Server Action, die Tags aktualisiert. Sobald die Verwaltung diese Inhalte ändern kann, bleiben Änderungen und Papierkorb-Inhalte bis zur Neuberechnung sichtbar (Profil `max` bedeutet Wochen).
- Vorschlag: Jede Verwaltungsaktion ruft `inhaltGeaendert(TAG…)` auf, auch beim Papierkorb und beim Zurücknehmen der Veröffentlichung. Lebensdauer für Kurse und Seiteninhalte kürzen.

### Niedrig

**SP-A-12 · S9 · Zeitbezug im `'use cache'`**
- Fundstelle: `src/server/queries/nachrichten.ts:42–43`, `:52` (`new Date()` im Cache, Profil `hours`), `:74–80`; `src/server/queries/gebetszeiten.ts:31`, `:34` (Referenzdatum, Profil `days`); `src/lib/zeit/heute.ts:9–12` (`hours`). Außerhalb des Umfangs, gleiches Muster: `src/server/queries/veranstaltungen.ts:78`, `:108`.
- Befund: Der Zeitpunkt wird beim Füllen des Caches eingefroren. Termine erscheinen verspätet (etwa eine Stunde). Das Gebetszeiten-Referenzdatum kann einen Tag alt sein. Das Fenster (−1 bis +45 Tage) deckt „heute“ weiterhin ab, das Restrisiko ist gering.
- Vorschlag: Zeitfilter bei jedem Abruf auswerten (`connection()`) oder zum Termin revalidieren. Lebensdauer kürzen.

**SP-A-13 · S10 · Browser-Speicher für den Konzept-Hinweis**
- Fundstelle: `src/components/website/KonzeptHinweis.tsx:11` (Schlüssel `igmg-konzepthinweis-gesehen`), `:18` (Inline-Skript), `:30`, `:39`.
- Befund: Der Merker ist technisch nicht nötig, die S10-Vorgabe erlaubt nur notwendigen Speicher. Ein Personenbezug besteht nicht. Die Datenschutzangabe nennt den Merker (Live: „Im Browser merkt sich die Website nur …“).
- Vorschlag: Hinweis ohne Speicher erneut anzeigen oder rechtlich als notwendig begründen. Bei Entfernung entschärft sich zugleich SP-A-10.

**SP-A-14 · S3 · Keine Ratenbegrenzung bei Schritten und Challenge-Route; Datenbankschreiben vor ALTCHA**
- Fundstelle: `src/server/actions/formulare/voranmeldung.tsx:21–29` (Schritte ohne Limit); `src/app/api/altcha/route.ts:5–8` (GET ohne Limit); `src/lib/formulare/verarbeiten.ts:52` (Rate-UPSERT vor ALTCHA).
- Befund: Schritte schreiben nichts, kosten aber Rechenzeit. Jeder Absende-Versuch schreibt die Ratenzeile, auch ohne gültige Lösung.
- Vorschlag: Schritte und `/api/altcha` am Proxy begrenzen. Das Limit nach ALTCHA setzen, sofern das Missbrauchsbild es erlaubt.

**SP-A-15 · S10 · Irreführende Beschriftung „Google Maps“**
- Fundstelle: `src/components/website/kontakt/KontaktKarten.tsx:31–32` (`href="#karte"`, `aria-label` aus `karteLabel`); `messages/bereiche/kontakt.json:10–11` (de), `:61–62` (tr), `:112–113` (en).
- Befund: Der Knopf springt nur zum Kartenbereich und öffnet keinen Google-Dienst, das Label behauptet es aber. Für Screenreader ist das ebenfalls irreführend.
- Vorschlag: Label auf „Zur Karte“ ändern (in allen drei Sprachen).

**SP-A-16 · S2 · Rich-Text-Link-Regel lässt `/\host` zu**
- Fundstelle: `src/components/website/RichText.tsx:7` (`/^\/(?!\/)/`).
- Befund: Ein Browser löst `/\evil.example/…` auf den Host `evil.example` auf (mit WHATWG-URL getestet). Betroffen sind nur Verwaltungsinhalte.
- Vorschlag: `/^\/(?![\/\\])/` verwenden.

**SP-A-17 · Konfiguration · HSTS und upgrade-insecure nur bei `APP_URL=https://`**
- Fundstelle: `src/lib/sicherheit/header.ts:8`, `:28`, `:61`; `.env` (nur der Wert von `APP_URL` gelesen: `http://localhost:3000`).
- Befund: Fehlt die Produktions-`APP_URL` oder steht dort `http://`, entfallen HSTS und `upgrade-insecure-requests` ohne Warnung. Canonical und hreflang folgen ebenfalls `APP_URL` (live zeigen sie auf :3000, obwohl der Server auf :3200 läuft).
- Vorschlag: `APP_URL` in Produktion auf `https://` setzen und beim Start prüfen, oder HSTS am Proxy setzen.

### Hinweise (keine Befunde)
- H-1: Die Einwilligung speichert nur den SHA-256 des Textes (`verarbeiten.ts:87`, `eingaenge.ts:49`). Für den Nachweis den Wortlaut je Version archivieren.
- H-2: Vorstandskarten zeigen E-Mail und Telefon, wenn der Seiteninhalt sie enthält (`src/components/website/PersonCard.tsx:114–128`). Einwilligung der Personen dokumentieren.
- H-3: Das ALTCHA-Paket enthält eine Cookie-Funktion (`node_modules/altcha/dist/external/altcha.js`, Standard `setCookie: null`). Das Projekt setzt keinen Wert (`src/components/formular/AltchaFeld.tsx:49`), also entstehen keine Cookies. Bei Konfigurationsänderung prüfen.

## Formular je Datei und Punkt

**1. `src/server/actions/formulare/voranmeldung.tsx`**
- S1 · OK · öffentlich, keine Rolle nötig, Antwort nur als Ansicht (`:19–67`)
- S2 · OK · Schritt über `wizard.ts:27`; Abschluss vollständig geprüft in `verarbeiten.ts:60–61`; Sprache per Allowlist (`:20`)
- S3 · BEFUND SP-A-14 (niedrig) für die Schritte `:21–29`; das Absenden wird durch `verarbeiten.ts:52` begrenzt, wirksam nur mit SP-A-03
- S4 · OK · Fehler nur als Schlüssel (`wizard.ts:31`), kein Log
- S5 · BEFUND SP-A-07 (mittel), Anlegen in `:30–49`
- S6 · NICHT ZUTREFFEND · kein Upload
- S7 · OK · serverseitig, kein Geheimnis
- S8 · OK · Drizzle, kein Roh-SQL
- S9 · OK · dynamisch durch die Action (`headers()` in `verarbeiten.ts:51`)
- S10 · OK · keine Dritten, keine Cookies

Beantwortete Fragen:
- Schrittprüfungen ohne ALTCHA oder Limit speichern nichts und lösen keine Mail aus. Nur der Zweig `:30` (`verarbeiteFormular`) schreibt, mit ALTCHA (`verarbeiten.ts:58`), Limit (`:52`), Honigtopf (`:55–56`) und vollständiger Zod-Prüfung (`:60–61`). Betroffen sind nur Rechenzeit (SP-A-14).
- Versteckte Felder sind harmlos: `schritt` wird begrenzt (`wizard.ts:23–24`), `richtung` wirkt nur bei `zurueck` (`:26`), `sprache` ist per Allowlist geprüft (`voranmeldung.tsx:20`), der Honigtopf `website` (`Felder.tsx:308`) speichert nichts.
- Kinderdaten: verschlüsselt mit AES-256-GCM und 12-Byte-IV (`verarbeiten.ts:68`, `src/lib/krypto/index.ts:28–35`), Schlüssel-ID für Rotation (`:19–26`). Mails enthalten die Adresse nur verschlüsselt (`verarbeiten.ts:95`). Im Klartext stehen nur Art, Status, Sprache und Zeitpunkte. Nicht geloggt (kein `console` im Umfang, `mail/ausgang.ts:129` speichert nur `e.name`). Lücke: Löschung (SP-A-01).
- Werte in der Antwort: React escaped (`Felder.tsx:77`, `:98`), kein `dangerouslySetInnerHTML`. Die Rückgabe geht nur an denselben Browser, also kein Drittabfluss. Kein Befund.

**2. `src/lib/formulare/wizard.ts`, `rohwerte.ts`, `ergebnis.ts`**
- S1 OK · S2 OK (`wizard.ts:23–24`, Schutzfelder in `rohwerte.ts:2`) · S3 BEFUND SP-A-14 (niedrig) · S4 OK (`rohwerte.ts:16–23` nur Schlüssel) · S5 NICHT ZUTREFFEND (keine Speicherung) · S6 NICHT ZUTREFFEND · S7 OK · S8 OK · S9 OK · S10 OK

**3. `src/lib/formulare/verarbeiten.ts`**
- S1 OK · S2 OK (Zod `:60–61`, Zusatzprüfung `:63–66`) · S3 BEFUND SP-A-03 (mittel) für `:51–53` und SP-A-14 (niedrig) für `:52` · S4 OK (`:107` verwirft Fehler, keine Logs) · S5 BEFUND SP-A-07 (mittel) · S6 NICHT ZUTREFFEND · S7 OK · S8 OK (`:70–80`) · S9 OK (`:51`) · S10 BEFUND SP-A-01 (hoch) für fehlende Löschung in `:70–80`; Einwilligungs-Hash siehe H-1

**4. `src/lib/validierung/formulare/voranmeldung.ts`**
- S1 NICHT ZUTREFFEND · S2 OK (Pflichtfelder `:8–11`, Geburtsdatum höchstens 18 Jahre und nicht in der Zukunft `:13–25`, Einwilligung nur „ja“ `:56–57`, Schritte `:62–67`) · S3 NICHT ZUTREFFEND · S4 OK · S5 NICHT ZUTREFFEND · S6 NICHT ZUTREFFEND · S7 OK · S8 NICHT ZUTREFFEND · S9 NICHT ZUTREFFEND · S10 OK (Datensparsamkeit; das Freitext-Feld Geschwister ist auf 500 Zeichen begrenzt, `:54`)

**5. `src/components/website/formulare/VoranmeldungFormular.tsx` und `src/components/formular/*.tsx`**
- S2 OK (Werte nur als `defaultValue`, `Felder.tsx:77`) · S4 OK (Fehlertexte über Schlüssel, `VoranmeldungFormular.tsx:33–37`) · S6 NICHT ZUTREFFEND (keine Datei-Eingabe) · S7 OK (kein `process.env` in Client-Komponenten) · S9 OK · S10 OK (`AltchaFeld.tsx:22–40` lädt erst bei Interaktion, same-origin; `altcha-laden.ts:9–12` Worker von eigener Herkunft; Datenschutz-Link `VoranmeldungFormular.tsx:241`)
- `FormWizard.tsx:95–97` (versteckte Felder), `:109` (Honigtopf), `:110` (ALTCHA nur im letzten Schritt): unauffällig.

**6. Welle-A-Queries `src/server/queries/nachrichten.ts`, `kurse.ts`, `wissen.ts`, `seiteninhalte.ts`**
- S1 NICHT ZUTREFFEND (lesend, öffentlich) · S2 NICHT ZUTREFFEND (keine Eingabe) · S3 NICHT ZUTREFFEND · S4 OK · S5 NICHT ZUTREFFEND · S6 NICHT ZUTREFFEND · S7 OK · S8 OK (`eq`, `isNull`, `lte`, `ne`, `and` durchgängig parametrisiert, Slug als Parameter `nachrichten.ts:63–67`, `seiteninhalte.ts:16`) · S9 BEFUND SP-A-08 (mittel), SP-A-12 (niedrig), SP-A-11 (mittel) · S10 OK
- Status und Papierkorb: `nachrichten.ts:50–52`, `:76–78`, `:88–90`; `kurse.ts:40`; `wissen.ts:22` korrekt. `seiteninhalte.ts` hat keine Statusspalte, Inhalte sind also immer öffentlich (so vorgesehen).
- Cache-Tags: Konstanten in `src/lib/cache/tags.ts:5–22`, in allen Queries verwendet. Die Invalidierung fehlt (SP-A-11).

**7. Öffentliche Seiten (`src/app/[locale]/(website)/…`, `global-error.tsx`, `not-found.tsx`, `[...rest]/page.tsx`)**
- S4 OK (`global-error.tsx:19`, `console.error(error)`, kein Personenbezug erwartet) · S7 OK · S8 OK · S9 BEFUND SP-A-05 (mittel) für `[...rest]`; die übrigen Seiten sind ISR mit `s-maxage=3600` · S10 OK (keine `cookies()`, `headers()` oder `draftMode` in den Seiten; keine Drittanfragen im Live-HTML; Karte erst nach Klick, SP-A-09; Hinweis vor dem Klick in `messages/bereiche/kontakt.json:39`; Entwurf SP-A-02)
- Nicht einzeln gelesen: Inhalte von `ueber-uns`, `vorstand`, `projekte`, `igmg`, `organisationen`, `islamisches-wissen`, `impressum`, `datenschutz`, `offline`. Geprüft wurden Muster (Grep auf Cookies, Header, Dritt-URLs) und das Live-HTML.

**8. Client-Komponenten `src/components/website/**` mit `'use client'` (25 Dateien)**
- `KonzeptHinweis.tsx`: localStorage (SP-A-13, niedrig). `dangerouslySetInnerHTML` (`:102`) nur mit konstantem Text, OK.
- `gebetszeiten/QiblaKompass.tsx`: Lagesensoren erst nach Klick (`:72–99`, `requestPermission` im Klick `:85–97`). Keine Geolocation im Projekt. S10 OK.
- `kontakt/KarteNachKlick.tsx`: iframe erst nach Klick (`:32–34`), `referrerPolicy="no-referrer"` (`:33`), Hinweis vor dem Klick (`:51`). S10 OK, CSP siehe SP-A-09.
- `nachrichten/MerkKnopf.tsx`: nur lokaler Zustand, keine Speicherung (`:12–27`). S10 OK.
- `veranstaltungen/TeilenKnopf.tsx`: `navigator.share` und Zwischenablage nur nach Klick (`:14–23`). OK.
- `anzeige/AnzeigeLive.tsx`: Timer und Neuladen, kein Netzwerkzugriff (`:60–65`). OK.
- `Footer.tsx`: SP-A-04 (`:56`).
- `RichText.tsx` (Server-Komponente, Allowlist `:6–8`): kein HTML, SP-A-16.
- Grep über alle 25 Dateien: kein `fetch()`, WebSocket, `sendBeacon`, `process.env`, `sessionStorage`, IndexedDB oder Geolocation.

**9. Routen**
- `src/app/api/altcha/route.ts:5–8`: `connection()` und `Cache-Control: no-store`. Zwei Live-Abrufe ergaben unterschiedliche Signatur und Nonce. S9 OK, nicht gecacht.
- `src/app/api/health/route.ts:6–13`: `connection()` und `no-store`. OK.
- `src/app/api/wartung/cache-erneuern/route.ts:10–13` mit `wartungErlaubt` (`src/lib/wartung/zugang.ts:8–12`, Mindestlänge 32, konstanter Vergleich). S1 OK.

**10. Konfiguration**
- `next.config.ts`: `:14` (`poweredByHeader: false`), `:24` (`remotePatterns: []`), `:35–44` (Header), `:40–41` (CSP öffentlich). OK.
- `src/lib/sicherheit/header.ts`: `frame-src` fehlt (SP-A-09), `unsafe-inline` (SP-A-10), `APP_URL` (SP-A-17). OK: `X-Frame-Options: DENY`, `frame-ancestors 'none'` (`:25`, `:54`), `geolocation=()` (`:57–59`).
- `src/i18n/routing.ts:14–15`: `localeDetection: false`, `localeCookie: false`. Keine Spracherkennung über Header, kein Sprach-Cookie. S10 OK.
- `src/proxy.ts:34`, `:37–40`: Sprachrouting, keine Auswertung von Headern für öffentliche Seiten.

## Live-Prüfung (localhost:3200, nur GET)
- `/`, `/kontakt`, `/gebetszeiten`, `/bildung/voranmeldung`, `/nachrichten`, `/datenschutz`: öffentliche CSP (`default-src 'self'`, kein `frame-src`), kein `Set-Cookie`, Permissions-Policy wie vorgesehen. OK.
- `/api/altcha`: `cache-control: no-store`, kein `x-nextjs-cache`, zwei Abrufe mit unterschiedlicher Signatur und Nonce, also nicht gecacht. OK.
- HTML von 21 Seiten (HTTP 200): keine Drittanbieter-Hosts. Die einzige fremde URL ist `www.w3.org` (SVG-Namespace). OK.
- Unbekannte Pfade: siehe SP-A-05.
- Karte: nur Platzhalter („[Koordinaten fehlen]“), kein iframe.

## S7 Client-Bundle
- Live-Chunks (14 Dateien, von `/`, `/kontakt`, `/gebetszeiten`, `/bildung/voranmeldung`) und lokaler Build (`.next/static`, 47 Dateien): keine Treffer für GEHEIMNIS, SECRET, DATABASE_URL, EINGANG_SCHLUESSEL, BETTER_AUTH_SECRET, RATE_GEHEIMNIS, ALTCHA_GEHEIMNIS, WARTUNG_TOKEN, SMTP_PASS, `postgres://`, `PRIVATE KEY`.
- Die sechs gesetzten Geheimniswerte aus `.env` (mindestens 12 Zeichen) wurden in Live- und lokalen Chunks gesucht: keine Treffer.
- „password“ kommt in zwei Chunks vor (Eingabetyp-Liste und WHATWG-URL-Parser). Kein Geheimnis. OK.

## Nicht geprüft
- Produktions-Proxy und das Anhängen von X-Forwarded-For: Konfiguration nicht im Repo (SP-A-03).
- Produktions-`.env` und Produktions-`APP_URL`: nur Namen und der Testwert gelesen (SP-A-17).
- Formular-POST und Ratenbegrenzung live: nicht ausgeführt, weil dabei Eingänge geschrieben und Mails ausgelöst würden.
- Browsertest für CSP und Karte: nicht durchgeführt (SP-A-09 aus Header und CSP-Regel abgeleitet).
- Beitrag mit Zukunftsdatum live: keine Testdaten vorhanden (SP-A-08 aus dem Code).
- Verwaltungsbereich (Rechte, Eingangsansicht, Export, Schreibrechte), Veranstaltungsanmeldung, Anmeldung und Authentifizierung: nicht im Umfang.
- Abhängigkeits-Audit, Hosting- und Serverprotokolle: nicht im Umfang.

## Zusammenfassung
Befunde: hoch 2 · mittel 9 · niedrig 6 (gesamt 17). Hinweise ohne Befund: 3.

Vor dem Livebetrieb zu klären: SP-A-01 (Löschung der Kinderdaten), SP-A-02 (Datenschutztexte), SP-A-03 (Proxy und IP-Ermittlung) und SP-A-04 zusammen mit SP-A-10 (`javascript:`-Links, CSP).

Keine Befunde zu Geheimnissen im Client-Bundle, zu SQL-Injection, zu Cookies auf öffentlichen Seiten oder zu Drittanbieter-Anfragen ohne Klick.

=== ENDE SP-A · BEREIT ZUR RÜCKGABE ===
