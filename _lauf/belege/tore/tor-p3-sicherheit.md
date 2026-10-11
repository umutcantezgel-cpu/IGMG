# Tor P3 · SP-P3 (Rückgabe des Haiku-Pakets, wörtlich; Ablage durch den Orchestrator)

# SP-P3 Sicherheitsprüfung

Den Bericht habe ich nicht als Datei geschrieben, weil meine Agenten-Vorgabe Berichts-.md-Dateien untersagt. Der vollständige Inhalt steht unten. Ich habe keine Server gestartet, keine Builds ausgeführt und keine Code- oder Dateiänderungen vorgenommen.

**Kurzfassung:** Zwei hohe Befunde. H1: Die Zwei-Faktor-Pflicht lässt sich über einen Passkey umgehen. H2: Der öffentliche Passwort-Login hat keine wirksame Begrenzung. Die Fragen (a), (b), (c), (f), (g), (i) sind unkritisch beantwortet. (d) und (h) sind mit Einschränkungen unkritisch.

## Befunde

**H1 (hoch): 2FA-Umgehung, sobald ein Passkey am Konto hängt**
- Fundstelle: `src/lib/rechte/pruefe.ts:34–37` (hatPasskey), `:44`, `:47`. Umleitungen: `src/app/[locale]/verwaltung/zwei-faktor/page.tsx:11`, `anmelden/page.tsx:10`. Passkey-Registrierung: `node_modules/@better-auth/passkey/dist/index.mjs:88`.
- Befund: `zweiFaktorErfuellt` ist wahr, sobald irgendein Passkey existiert, unabhängig davon, wie die Sitzung entstanden ist. ADR 0003 Zeile 23 verlangt dagegen, dass die aktuelle Sitzung per Passkey oder mit zweitem Faktor entstanden ist. Ausnutzbar bei Konten ohne aktiviertes TOTP und bekanntem Passwort: Nach dem Login (`anmeldung.ts:42–45`) registriert der Angreifer einen eigenen Passkey. Die Registrierung verlangt nur eine frische Sitzung. Danach gelten Sitzung und Rechte als 2FA-erfüllt (`verlangeSitzung` Zeile 58, `verlangeRecht` Zeile 76). Das Audit `anmeldung.ts:54` schreibt zusätzlich `zweiFaktor: false`, was unzutreffend ist.
- Vorschlag: Zweiten Faktor pro Sitzung führen (nur bei TOTP-Verifikation oder Passkey-Anmeldung setzen) statt `hatPasskey` pro Konto. Passkey-Registrierung nur in einer 2FA-erfüllten Sitzung zulassen. Audit korrigieren.

**H2 (hoch): Keine wirksame Begrenzung von Passwortversuchen am öffentlichen Login**
- Fundstelle: `src/server/actions/anmeldung.ts:16` (Kommentar), `:36–57`, `:42–45` (`auth.api.signInEmail`). `src/lib/auth/optionen.ts:30–40`. `node_modules/better-auth/dist/api/index.mjs:172` (Ratenprüfung nur im Router-`onRequest`), `:114` (`auth.api` ohne diese Prüfung), `base.mjs:50` (Router ist nur der HTTP-Handler). `plugins/two-factor/verify-two-factor.mjs:116–180` (Kontosperre nur für 2FA). Ungenutzt: `src/lib/validierung/ratenbegrenzung.ts:15` (`pruefeRate`).
- Befund: Die öffentliche Action ruft die Anmeldung direkt auf und umgeht so die Ratenbegrenzung von better-auth. Das folgt aus dem Quellcode der installierten Version 1.7.7, Laufzeit nicht getestet. Eine Passwort-Sperre habe ich im Kern nicht gefunden. Unbegrenzte Versuche gegen bekannte E-Mail-Adressen sind damit möglich, praktisch relevant bei schwachen Passwörtern. Der Kommentar in Zeile 16 ist für diesen Pfad falsch.
- Vorschlag: `pruefeRate` vor `signInEmail` einsetzen, Schlüssel aus IP und E-Mail mit Backoff. Kommentar korrigieren. Alternativ den Login über den HTTP-Endpunkt führen, der die Customrule nutzt. In diesem Fall ist M3 zwingend.

**M1 (mittel): Organisationsredaktion liest Entwürfe, Papierkorb und Kontaktdaten fremder Organisationen**
- Fundstelle: `src/lib/rechte/matrix.ts:110` und `:153`. `veranstaltung.lesen` steht nicht in ORGANISATIONSGEBUNDEN (`:62–72`), daher gilt für das Lesen keine Organisationsbindung. `src/server/queries/verwaltung/veranstaltungen.ts:39–61` (Liste ohne Organisationsfilter). `[id]/page.tsx:15–21` (Lesemodus für fremde Organisation). Vorgaben: K-06 („je Organisation nur eigene Inhalte“), ADR 0003 Zeile 21, `matrix.ts:141–142`.
- Befund: Die Liste zeigt alle Organisationen einschließlich Entwürfen, Papierkorb und Anmeldezahlen. Die Detailseite zeigt zusätzlich Kontaktdaten (`formularwerte.ts:72–74`). Das widerspricht der Vorgabe und der Matrix-Dokumentation. Eine Ausnahme ist nicht dokumentiert.
- Vorschlag: Lesezugriff auf die Organisation des Ziels beschränken oder fremde Entwürfe und Papierkorb ausblenden. Falls bewusst, die Ausnahme in ADR 0003 festhalten. Klärung nötig.

**M2 (mittel): Lesen von Kontaktdaten ohne Audit-Eintrag**
- Fundstelle: `[id]/page.tsx:15–17`, `queries/verwaltung/veranstaltungen.ts:89–93`, ADR 0003 Zeile 24.
- Befund: Das Öffnen des Formulars lädt Kontaktname, Telefon und E-Mail (sofern Ansprechpersonen gemeint sind) ohne Audit-Eintrag. ADR 0003 verlangt einen Eintrag bei jedem Zugriff auf Personendaten. Schreibende Aktionen sind dagegen protokolliert.
- Vorschlag: Audit-Eintrag ohne Personendaten beim Öffnen, z. B. als neue Aktion. Oder die Abweichung in der ADR begründen.

**M3 (mittel, betriebsabhängig): Client-IP aus ungeprüften Headern**
- Fundstelle: `src/lib/auth/optionen.ts:43–44` (`ipAddressHeaders: ['x-forwarded-for', 'x-real-ip']`).
- Befund: Die IP für die Begrenzung der HTTP-Pfade (`/sign-in/email`, `/two-factor/*`, je 5 pro Minute) stammt aus diesen Headern. Überschreibt der Edge-Proxy sie nicht, lässt sich die Begrenzung mit wechselnden Headern umgehen. Der Betrieb ist NICHT GEPRÜFT.
- Vorschlag: Nur Header eines bekannten Proxys akzeptieren, am Edge überschreiben.

**Niedrig**

| ID | Fundstelle | Befund | Vorschlag |
|---|---|---|---|
| N1 | `anmeldung.ts:62–83` (:69–70) | `zweiFaktorPruefen` ohne eigenes Limit. Mildernd: Kontosperre (10 Fehlversuche, 15 min, `verify-two-factor.mjs:116–180`) und Versuchszähler je Challenge (`:70–96`). Kommentar :16 unzutreffend. | `pruefeRate` ergänzen |
| N2 | `anmeldung.ts:129–164` | `einladungAnnehmen` ohne Limit. Token mit 256 Bit (ADR 0003 Zeile 20) macht Raten unpraktisch, nur DB-Last. | `pruefeRate` ergänzen |
| N3 | `anmeldung.ts:88–89` | `zweiFaktorStarten` prüft das Passwort manuell statt mit Zod (S2). | Zod-Schema |
| N4 | `src/lib/auth/server.ts:9–11, 17` | Fallback-Geheimnis im Quelltext, verletzt G-03 formal. Wirkt nur ohne `BETTER_AUTH_SECRET` bei `NODE_ENV≠production`. | Fallback entfernen |
| N5 | `src/lib/krypto/index.ts:69`, `src/lib/wartung/zugang.ts:10–11` | `gleich()` vergleicht Längen vorab (Längen-Seitenkanal). Der Inhaltsvergleich ist konstant. | Beide Seiten per SHA-256 auf feste Länge, dann `timingSafeEqual` |
| N6 | `src/lib/validierung/altcha.ts:16–17`, `krypto/index.ts:55–56` | Keine Mindestlänge für `ALTCHA_GEHEIMNIS` und `RATE_GEHEIMNIS`. `WARTUNG_TOKEN` hat ≥32. | Mindestlänge 32 |
| N7 | `src/proxy.ts:39` | Der Matcher schließt jeden Pfad mit Punkt aus. Nonce-CSP, noindex und no-store gelten dort nicht. Aktuell ist kein Verwaltungspfad betroffen. | Matcher korrigieren |
| N8 | `src/lib/sicherheit/header.ts:58` (via `next.config.ts:34`), ADR 0012 Zeile 20 | Sensor-Permissions gelten für alle Routen. ADR sieht sie nur auf der Gebetszeiten-Seite vor. | Auf die Seite beschränken |
| N9 | `next.config.ts:37` | Die öffentliche CSP-Regel erfasst `/de/verwaltung`. Der Proxy setzt dort die Nonce-CSP. Die Reihenfolge zur Laufzeit ist NICHT GEPRÜFT. | `de/verwaltung` ausnehmen |
| N10 | `src/server/ical/veranstaltungen.ts:58` | `max-age=900`: Entfernen oder Papierkorb wirkt in HTTP-Caches bis 15 min verzögert. Inhalte sind öffentlich. | Kürzer oder akzeptieren |
| N11 | `anmeldung.ts:149–161` | `signUpEmail` liegt außerhalb der Transaktion. Bei Fehler bleibt ein Konto ohne verbrauchte Einladung zurück, der Folgeversuch scheitert. | Kompensation |
| N12 | `queries/verwaltung/veranstaltungen.ts:90`, `[id]/page.tsx:17` | ID nur per Regex geprüft. Eine ungültige UUID mit 36 Zeichen führt zu DB-Fehler statt `notFound`. Kein Datenleck. | `z.uuid()` |

Hinweis ohne Befund: `.env.example` enthält nur Entwicklungswerte, alle Secrets sind leer (G-03 eingehalten).

## Antworten (a)–(i)

- **(a) Ja, mit Einschränkung.** In allen vier exportierten Funktionen steht die Rechteprüfung vor jedem Datenzugriff. `speichereVeranstaltung` prüft in Zeile 52, die drei Papierkorb-Aktionen über `mitDatensatz` in Zeile 113. Vorher wird der Bestandsdatensatz gelesen (Zeile 73 bzw. 116), um seine Organisation zu bestimmen. Das Ergebnis geht nur als `nichtGefunden` (Zeile 74) zurück, das verrät die Existenz einer UUID (niedrig). Der Zweite-Faktor-Teil der Prüfung ist durch H1 umgehbar.
- **(b) Nein.** Die Organisation kommt aus der Datenbank (`veranstaltungen.ts:73–75`), nicht aus dem Formular. Eine fremde ID ergibt `keinRecht`. Das Verschieben in eine fremde Organisation blockiert Zeile 77. Das Lesen fremder Entwürfe ist dagegen möglich (M1).
- **(c) Nein.** `veranstaltungSchema` ist ein `z.object` ohne `strict` oder `passthrough` (`lib/validierung/veranstaltung.ts:28–29`), unbekannte Felder werden also entfernt. `zuDatensatz` (`:175–248`) baut nur aus festen Feldern. `istBeispiel`, `erstelltVon` und `imPapierkorbSeit` fehlen dort. `erstelltVon` und `aktualisiertVon` setzt nur der Server (`veranstaltungen.ts:86, 96`). Unbekannte Felder werden nur zurückgespiegelt (`werte: roh`), nicht gespeichert.
- **(d) Nein für die geprüften Rückgaben.** Actions und Routen liefern nur Schlüssel oder Statuscodes (z. B. `anmeldung.ts:48, 73`, `veranstaltungen.ts:54, 64`, `health/route.ts:12`, `wartung/route.ts:11`). Zod-Meldungen gehen nur als Schlüssel durch, sonst `ungueltig` (`veranstaltungen.ts:62`). Nicht abgefangen sind DB-Fehler bei Schreibvorgängen (`veranstaltungen.ts:83–102`). Ob Next.js sie in Produktion maskiert, ist NICHT GEPRÜFT. Der Doku-Auszug belegt es nicht, Laufzeit nicht getestet.
- **(e) Wirkungslos ohne Token: ja. Konstante Zeit: teilweise.** Ohne `WARTUNG_TOKEN` mit mindestens 32 Zeichen (`zugang.ts:10`) oder bei falschem Header (`zugang.ts:11`) antwortet die Route mit 401 ohne Körper, bevor `revalidateTag` läuft (`route.ts:11–12`). Exportiert ist nur POST (`route.ts:10`). Der Inhaltsvergleich ist konstant (`krypto/index.ts:69`), vorab wird aber die Länge verglichen (N5).
- **(f) Ja.** Alle drei iCal-Routen lesen über `ladeVeranstaltungen`, `ladeVeranstaltung` und `ladeVeranstaltungsSlugs`. Diese verlangen `status='veroeffentlicht'` und `imPapierkorbSeit IS NULL` (`queries/veranstaltungen.ts:37, 79, 103, 143`). Einschränkung: HTTP-Cache mit 15 min (N10).
- **(g) Nein.** Das Inline-Skript `SOFORT` ist eine feste Zeichenkette ohne Nutzereingaben (`KonzeptHinweis.tsx:18`, Kommentar `:101–102`). Die Texte werden als React-Text gerendert (`:73–97`). Die öffentliche CSP erlaubt `'unsafe-inline'` (`header.ts:35`), das ist laut ADR 0012 festgelegt und kein Befund.
- **(h) Ja, mit Einschränkung.** Für Pfade unter `/verwaltung` und `/de/verwaltung` ohne Punkt setzt der Proxy Nonce-CSP (`proxy.ts:22–28`), `X-Robots-Tag: noindex, nofollow` (`:29`) und `Cache-Control: private, no-store` (`:30`). Zusätzlich gibt es `robots: noindex` im Metadatensatz (`verwaltung/layout.tsx:14–17`). Einschränkungen: N7 und N9. Die Header zur Laufzeit habe ich nicht per curl geprüft (NICHT GEPRÜFT).
- **(i) Ja.** `/api/health` (`connection()`, Zeile 7) und `/api/altcha` (`connection()`, Zeile 6) sind dynamisch. `/api/wartung/cache-erneuern` (POST mit Request) und `/api/auth/[...all]` (Request-basiert) ebenfalls. Im Build-Output gibt es für alle sieben Route-Handler nur `route.js`, keine `.body`- oder `.meta`-Dateien. Das Prerender-Manifest enthält keine `/api`-Einträge. Der Build (04:36) ist neuer als alle geprüften Quelldateien (jüngste 04:21).

## Prüfmatrix S1–S9

Legende: OK. BEFUND mit ID. „entfällt“ mit Grund. NICHT GEPRÜFT mit Grund. Zeilenangaben beziehen sich auf die Datei der Zeile.

| Datei | S1 Rolle | S2 Zod | S3 Rate | S4 Fehler | S5 Audit | S6 Upload | S7 Client | S8 DB | S9 dynamisch |
|---|---|---|---|---|---|---|---|---|---|
| `src/server/actions/veranstaltungen.ts` | OK :52, :113, :75, :77, :121 | OK :57, :67, :109 | entfällt (nur nach Anmeldung) | OK :54, :64, :74 | OK :88, :90, :98, :133, :143, :155 (Lesen M2) | entfällt | OK (Server-Modul) | OK :43, :73, :86 | entfällt (Z-04 OK :104) |
| `src/server/actions/anmeldung.ts` | BEFUND H1 (:87, :102, pruefe.ts:47). Öffentlich by design: :36, :62, :145 (Token) | BEFUND N3 :89. OK :27, :59, :121 | BEFUND H2 :42–45, N1 :69, N2 :149 | OK :33, :48, :73, :96, :161 | OK :47, :72, :110, :117, :158. :54 falsch (H1) | entfällt | OK | OK (keine Roh-SQL) | entfällt |
| `src/server/queries/verwaltung/veranstaltungen.ts` | OK Aufrufer prüfen :8. Org-Lesen BEFUND M1 :60 | entfällt (N12 :90) | entfällt | OK | BEFUND M2 :89–93 | entfällt | OK :1 | OK :14, :91 | OK nicht gecacht :7 |
| `src/server/queries/veranstaltungen.ts` | entfällt (öffentlich, :37) | entfällt | entfällt | OK | entfällt | entfällt | OK :1 | OK :126–132 | OK Tags :75–77, :99, :124 |
| `src/app/[locale]/verwaltung/**` | BEFUND H1 über `verlangeSitzung` (pruefe.ts:58), `zwei-faktor/page.tsx:11`, `anmelden/page.tsx:10`. Sonst OK: `(geschuetzt)/page.tsx:6`, `veranstaltungen/page.tsx:17`, `[id]/page.tsx:15`, `neu/page.tsx:13–15` | entfällt (N12 `[id]:17`) | entfällt | OK `anmelden/page.tsx:16–18`, `einladung/[token]/page.tsx:16` | BEFUND M2 `[id]:15–17` | entfällt | OK, keine Geheimnisse in Props (`formularwerte.ts:19–77`) | entfällt | OK `layout.tsx:20` connection(). `.html` 0 Byte. Segmente ohne Nutzerdaten |
| `src/app/api/ical/[sprache]/**` (3 Routen) | entfällt (öffentlich) | OK `server/ical:11–13`, `organisation/route:14` | entfällt (lesend, gecacht) | OK 404 ohne Körper | entfällt (keine Personendaten, `server/ical:19–39`) | entfällt | OK | OK über Queries | OK. `generateStaticParams`, kein Build-Körper. Tags `tags.ts:26` |
| `src/app/api/health/route.ts` | entfällt | entfällt | entfällt | OK :12 | entfällt | entfällt | OK | OK :9 | OK :7 connection() |
| `src/app/api/altcha/route.ts` | entfällt | entfällt | entfällt (Challenge-Ausgabe) | OK :8 | entfällt | entfällt | OK | entfällt | OK :6 connection() |
| `src/app/api/auth/[...all]/route.ts` | entfällt. Registrierung gesperrt `optionen.ts:54–58` | NICHT GEPRÜFT (Validierung in Bibliothek, nicht im Umfang) | BEFUND M3 `optionen.ts:44`. Customrules :35–39 greifen über den Router | NICHT GEPRÜFT (Antworttexte der Bibliothek nicht untersucht) | entfällt (Audit läuft über Actions) | entfällt | OK | NICHT GEPRÜFT (Adapter nicht im Umfang) | OK, Request-basiert, kein Build-Körper |
| `src/app/api/wartung/cache-erneuern/route.ts` + `src/lib/wartung/zugang.ts` | OK Token `zugang.ts:8–12` | entfällt | entfällt (Token ≥32, N5 `zugang.ts:11`) | OK :11, :13 | entfällt | entfällt | OK `zugang.ts:1` | entfällt | OK POST, kein Build-Körper |
| `src/lib/rechte/pruefe.ts`, `matrix.ts` | BEFUND H1 (pruefe.ts:34–37, :47), BEFUND M1 (matrix.ts:153). Sonst OK (:55–61, :74–78) | entfällt | entfällt | OK :13 | entfällt | entfällt | OK `pruefe.ts:1` | OK :28, :35 | entfällt |
| `src/lib/cache/aktualisieren.ts` | entfällt | entfällt | entfällt | OK | entfällt | entfällt | OK :1 | entfällt | OK Z-04: :16 sofort, :17–20 nachlaufend |
| `src/proxy.ts` | entfällt (Proxy prüft absichtlich keine Rechte, :10) | entfällt | entfällt | OK | entfällt | entfällt | entfällt | entfällt | OK Nonce :22. Siehe N7, N9 |
| `src/lib/sicherheit/header.ts`, `next.config.ts` | entfällt | entfällt | entfällt | entfällt | entfällt | entfällt | OK, kein `NEXT_PUBLIC_`, kein Secret | entfällt | entfällt. Siehe N8, N9 |
| `src/components/website/KonzeptHinweis.tsx` | entfällt | entfällt | entfällt | OK | entfällt | entfällt | OK, Skript konstant :18 | entfällt | entfällt |
| `src/components/verwaltung/**` (Client) | OK (UI, Server prüft; Feldsperre `VeranstaltungsFormular.tsx:297`) | OK (Server prüft; `noValidate` :273) | entfällt | OK :22, :277 | entfällt | entfällt (kein Upload) | OK. Kein `process.env`. Importe nur Actions und Typen (`ZweiFaktorEinrichten.tsx:7`). TOTP nur im Browser (:52–54). QR lokal (`QrCode.tsx:5`) | entfällt | entfällt |

## Nicht geprüft, Grenzen, Selbstprüfung

- **Nicht geprüft:** Laufzeit-Header (keine Server gestartet, ADR 0012 Zeile 27), Next-Fehlermaskierung (d), Abhängigkeits-Audit (K-13), Produktions-Proxy und Cookie-Flags (`useSecureCookies` hängt an APP_URL), ICS-Escaping in ical-generator (außerhalb S1–S9), Uploads in `src/lib/storage` (nicht im Umfang).
- **Offene Frage:** Automatische Löschung des Papierkorbs nach 30 Tagen (K-05) habe ich in den Quellen nicht gefunden. `zugang.ts:4` nennt Löschfristen, es gibt dort aber keine Route.
- **Konten nur per Einladung:** eingehalten. HTTP-Registrierung ist gesperrt (`optionen.ts:54–58`), die serverseitige Anlage läuft nur über eine gültige Einladung (`anmeldung.ts:145–149`).
- **Zusätzlich gelesen:** `lib/auth/*`, `lib/validierung/*`, `lib/krypto`, `lib/audit`, `lib/cache/tags.ts`, `src/instrumentation.ts`, `server/queries/einladung.ts`, ADR 0003, 0012, 0017, better-auth-Dateien (1.7.7), Build-Output.
- **Repo-Stand:** Während der Prüfung haben sich andere Dateien geändert, z. B. ` M web/src/server/queries/gebetszeiten.ts` und ` M web/src/i18n/request.ts`. Keine davon gehört zu den geprüften Dateien. Ich habe im Projekt keine Datei geschrieben. Eine Hilfsdatei unter `/tmp` habe ich angelegt und wieder entfernt.
- **Nicht ausgeführt:** `~/Downloads/CLAUDE.md` (Coday-Bildverarbeitung), wie vorgegeben.

=== ENDE SP-P3 · BEREIT ZUR RÜCKGABE ===
