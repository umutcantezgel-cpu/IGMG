# Tor B/C – Beleg (2026-10-11)

Prüfbericht: `_lauf/belege/tore/tor-bc-bericht.md` (DP-B, DP-C1, DP-C2, SP-B, SP-C1, SP-C2). Hier steht je Befund, was geschah. Die Prüfläufe stehen am Ende.

## Sicherheit und Datenschutz

| Befund | Stufe | Erledigt durch | Test |
|---|---|---|---|
| SP-C1 H1 / SP-B B3: X-Forwarded-For vom Client | hoch | E-041: `clientAdresse` nur mit `PROXY_VERTRAUEN=1`, X-Real-IP | `tests/unit/client-adresse.test.ts` |
| SP-B B1: Meldung im Klartext am Ticket | hoch | Betreff/Text im verschlüsselten Melderpaket, Ticket „Öffentliche Meldung“ | `formular-meldung.test.ts`, `formular-meldung.spec.ts` |
| SP-B B2: Bestätigungen an Dritte | mittel | `begrenzeBestaetigungen` (3 je Adresse/24 h, HMAC) | `formular-meldung.test.ts` |
| SP-B B4: Fristen | mittel | Höchstfrist 365 Tage; „gelöst“ setzt `geschlossenAm`; Löschlauf gelöst+geschlossen; Migration 0007 | `formular-kontakt`, `verwaltung-eingaenge`, `verwaltung-tickets` |
| SP-C1 M1: Reset-Endpunkt offen | mittel | HTTP-Sperre in `optionen.ts` | bestehende Anmeldetests |
| SP-C1 M2: Lese-Audit Konten | mittel | `benutzer.gelesen` (Liste, Detail) | `verwaltung-benutzer.test.ts` |
| SP-C1 M3: letzte Administration (Race) | mittel | `mitAdministrationsSchutz` (Advisory Lock, Zählung im `tx`) | `verwaltung-benutzer.test.ts` (gleichzeitige Sperren) |
| SP-C1 M4/M5: Ticketinhalt, Klartext | mittel | Klassifikation E-042, Regel M-095 | – |
| SP-C1 M6: IP-Adressen bei Better Auth | mittel | `disableIpTracking`, Migration 0006 | – |
| SP-C1 M7: 2FA-Anmeldung ohne Audit | mittel | Konto-ID aus dem Prüfergebnis | `anmeldung-audit.test.ts` |
| SP-C1 N1: Zeitsignal Passwort vergessen | niedrig | Reset in `after()` | `verwaltung-passwort.test.ts` |
| SP-C1 N2: Konto-ID-Format | niedrig | Regex in `ladeBenutzer` | – |
| SP-C1 N3: Zod vor Recht | niedrig | `mitEingang` zuerst | `verwaltung-eingaenge.test.ts` |
| SP-C1 N4: Melder-E-Mail-Format | niedrig | bewusst offen (E-042) | – |
| SP-C1 N5: weitere Lesezugriffe | niedrig | Klassifikation E-042 | – |
| SP-C1 N6: Reset-Links nach Sperre | niedrig | Sperre löscht Verifikationen | `verwaltung-benutzer.test.ts` |
| SP-C1 N7: Einladungen ohne Frist | niedrig | Löschlauf 30 Tage, Verifikationen sofort | `verwaltung-eingaenge.test.ts` |
| SP-C1 N8: 200 statt 307 | niedrig | bewusst offen (E-042) | – |
| SP-B B5: Formular-Schritte ohne Zähler | niedrig | Proxy-Limit (BETRIEB 5b), E-042 | – |
| SP-B B6: ALTCHA-Zählerbereich | niedrig | 1 … 2·KOSTEN | – |
| SP-B B7: Link mit Tab | niedrig | Steuerzeichen abgelehnt | `richtext-links.test.ts` |
| SP-B B8: Ankündigungen im Stundencache | niedrig | bewusst offen (E-042) | – |
| SP-B B9: Überbuchung | niedrig | `imVorgang` mit `FOR UPDATE` | `formular-veranstaltungsanmeldung.test.ts` |
| SP-B B10: Karte und CSP | niedrig | schon dokumentiert (BETRIEB 5b, nach M-010) | – |
| SP-B B11: APP_URL fehlt | niedrig | Start bricht ab (Betrieb) | – |
| SP-C2 B1: `verwendungVon` | mittel | `jsonb_path_exists` | `verwaltung-medien.test.ts` |
| SP-C2 B2: Pfadregel `/\` | niedrig | `^\/(?![/\\])` | – |
| SP-C2 B3/B4: Organisationsbindung im Aufrufer | niedrig | bewusst offen (E-042) | – |
| SP-C2 B5: Import `[null]` | niedrig | Formatfehler statt Absturz | `gebetszeiten.test.ts` |
| SP-C2 B6: Schemagrenzen Seiteninhalte | niedrig | Paket R-BC-S3 (Haiku) | `seiteninhalte-grenzen.test.ts` |
| SP-C2 B7: Medien-Cache 1 Jahr | niedrig | 7 Tage, nicht immutable | `verwaltung-medien.test.ts` |
| SP-C2 B8: PDF-Metadaten | niedrig | M-097, Hinweis mit C11b | – |
| SP-C2 B9: Upload-Grenze 1 MB | niedrig | 11 MB (Actions, Proxy) | – |
| SP-C2 B10: Namen ohne Audit | niedrig | Klassifikation E-042 | – |

## Darstellung

- **DP-B-01 bis -16:** R-BC-D1 (Haiku). Abweichungen A-C12e, A-C04b, A-T01 und A-T02.
- **DP-C1 H1–H3, M1–M4, N1–N4:** R-BC-D2 (Haiku). H2-Daten und H3 (A-V03b) hat der Orchestrator ergänzt.
- **DP-C2 1–10:** R-BC-D2. Die Benutzerseite hat der Orchestrator nachgezogen. Offen und niedrig: Vorstand-Einträge einklappen, Übersetzungen einheitlich.
- **Zusatzbefund:** Die Kopfzeile war bei 390 px 397 px breit. Unter 640 px steht die Suche deshalb im Telefonmenü (A-C01c). Nachmessung bei 360, 390 und 640 px ergab keinen Überlauf.

## Prüfläufe (2026-10-11, nach allen Reparaturen)

- `pnpm check`: Typen und Lint ohne Befund. Unit: 28 Dateien, 493 bestanden, 3 erwartet fehlschlagend.
- `pnpm test:integration`: 26 Dateien, 426/426.
- `pnpm build`: grün. Erster Versuch abgebrochen: Die Suchseite hatte `ensureStatic = 'navigation'`, siehe FEHLERSTATISTIK. Endstand: Suche je Anfrage (ƒ), ohne Suspense, damit sie ohne JavaScript nutzbar ist.
- `pnpm test:e2e` (voll): 490 bestanden, 10 fehlgeschlagen, 60 übersprungen (Verwaltungs-Specs laufen nur auf dem Desktop). Die 10 Fehler:
  - Suche (8): Locator nicht auf `main` begrenzt, außerdem ohne JavaScript keine Treffer (gestreamt) → Seite blockierend.
  - Eingänge (1): Folge von B4, offene Eingänge haben jetzt die Höchstfrist → eigener Hinweistext „Noch offen: wird spätestens am … gelöscht“.
  - Gebetszeiten (1): Zeitfenster der Cache-Erneuerung (E-025) → Neuladen mit `toPass`, wie in den Formular-Specs.
- **Nachlauf:**
  - suche, verwaltung-eingaenge, verwaltung-gebetszeiten: 10 bestanden, 2 übersprungen.
  - barrierefreiheit, datenschutz (Routentabellen mit `/suche`) und pwa: 285 bestanden, 7 übersprungen.
- `pnpm messen` (Lighthouse mobil, devtools-Drosselung; `_lauf/belege/lighthouse/2026-10-11-09-07/`):
  - Alle sechs Messrouten: P 98–99, A/BP/SEO 100, LCP ≤ 1885 ms, CLS ≤ 0,002, TBT ≤ 100 ms, JS ≤ 174,1 kB.
  - Zusätzlich `/suche?q=…` (`…-09-09/`): P 99, A 100, BP 100, JS 168 kB. SEO 63 nur wegen `is-crawlable`, also gewollt `noindex` für Trefferseiten (ADR 0013).
- Next.js: 16.4.0 ist weiter aktuell (`pnpm view next version`, 2026-10-11 10:44).
