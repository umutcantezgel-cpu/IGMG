# ADR 0019 – Bau und Migration auf Vercel

- Status: angenommen · 2026-10-11 · Letzter Lauf (Kern K-013, AUFTRAG V-02, V-04, V-08) · Bezug: ADR 0017, ADR 0018

## Ziel

Auf Vercel soll jeder Bau die Inhalte der Datenbank seiner Umgebung vorrendern (Produktion: echte Inhalte, Vorschau: Inhalte des Neon-Branches). Migrationen laufen kontrolliert vor dem neuen Code; ohne Datenbank bleibt der Bau trotzdem grün.

## Wege

1. **Migration im Bau unter Sperre, dann `next build` gegen die Datenbank** (mit `DATABASE_URL`); ohne Datenbank der PGlite-Bau aus ADR 0017.
2. **Migration bei jedem Kaltstart** (`MIGRATION_BEIM_START=1`) wie im Docker-Betrieb.
3. **Migration von Hand** (Runbook) vor dem Zusammenführen.

## Bewertung

Weg 2 vervielfacht Migrationsläufe (jede neue Instanz), verlängert Kaltstarts und braucht den Migrationsordner im Funktions-Bundle. Weg 3 vergisst man. **Weg 1 gewählt:** eine Migration je Bau, unter `pg_advisory_lock`, vor dem Vorrendern – und die vorgerenderten Seiten zeigen sofort die echten Inhalte (kein Seed-Notbehelf, keine Cache-Erneuerung nach dem Start).

## Festlegungen

- `package.json` › `vercel-build` → `node scripts/vercel-bau.mjs`:
  - mit `DATABASE_URL`: `scripts/migriere-mit-sperre.mjs` (eigene Verbindung, `pg_advisory_lock(<fester Schlüssel>)`, Drizzle-Migrator auf `drizzle/migrations`, Sperre lösen), danach `next build`;
  - ohne `DATABASE_URL`: Warnung im Bauprotokoll, `pnpm db:bau-vorbereiten`, `BAU_PGLITE=1 … next build` (Beispielinhalte, wie bisher).
- Migrationen sind **additiv** (erweitern → umstellen → aufräumen in getrennten Auslieferungen), weil die alte Produktion während des Baus weiterläuft und bis zur Umschaltung auf dem neuen Schema arbeitet. Runbook: `docs/deploy/VERCEL.md`.
- `src/instrumentation.ts`: auf Vercel keine Migration beim Start und kein Selbstaufruf zur Cache-Erneuerung (Selbstaufrufe über 127.0.0.1 erreichen auf Vercel keine Instanz; Tags verfallen dort global über `revalidateTag`/`updateTag`). Docker unverändert (ADR 0017).
- Docker und lokal: unverändert (`MIGRATION_BEIM_START`, ADR 0017).

## Umkehrprobe

Falsch, wenn ein Bau mit Migration fehlschlägt, nachdem die Migration angewendet wurde – dann läuft die alte Produktion auf dem neuen Schema. Gerade deshalb nur additive Migrationen; Zurückrollen per Instant Rollback ist ohne Schemarückbau möglich.

## Folgen zweiter Ordnung

- Vorschau-Baus migrieren ihren Neon-Branch; ein Branch ohne Integration (gleiche `DATABASE_URL` wie Produktion) wäre gefährlich → Startklar-Prüfung „Vorschau nutzt nicht die Produktionsdatenbank“ (Cockpit, `pnpm startklar`).
- Der Bau braucht Netz zur Datenbank (Vercel-Bauumgebung hat es).

## Nachtrag 2026-10-11 (Prüfung H-V07/V10)

- Die Migrationssperre ist eine Sitzungssperre (`pg_advisory_lock`). Hinter einem Pooler im Transaktionsmodus (Neon-Adresse mit `-pooler`) kann jede Anweisung auf einer anderen Serververbindung laufen; Sperren und Entsperren träfen dann womöglich verschiedene Sitzungen. `scripts/migriere-mit-sperre.mjs` nimmt deshalb `DATABASE_URL_UNPOOLED` (setzt die Neon-Integration zusammen mit `DATABASE_URL`) vor `DATABASE_URL` und warnt im Bauprotokoll, wenn nur eine Pooler-Adresse vorhanden ist. Die App selbst bleibt beim Pooler (ADR 0018).

## Nachtrag 2026-10-11 (Beispielmodus ohne Datenbank)

- Befund in der Produktion ohne `DATABASE_URL` (Vercel-Laufzeitfehler, 7 h): 755 × „DATABASE_URL fehlt“, fast nur Segment-Abrufe (`*.segments/_tree.segment.rsc`). Ursache: Die Cache-Profile (`hours`: Erneuerung stündlich, Ablauf nach einem Tag) lösen Erneuerungen im Hintergrund aus, die ohne Datenbank scheitern. Nach Ablauf (`expire`) müsste eine Anfrage synchron neu erzeugen – mit Fehlerseite.
- Entscheidung: Im Beispielmodus (`VERCEL=1` und `BAU_PGLITE=1`, gesetzt von `scripts/vercel-bau.mjs`) überschreibt `next.config.ts` alle Cache-Profile, auch die eingebauten Namen, mit „dauerhaft“ (Erneuerung nach einem Jahr, Ablauf nach zwei). Die Inhalte stammen dort unveränderlich aus der Bau-Datenbank; ein neuer Bau aktualisiert sie. Mit Datenbank und unter Docker (BAU_PGLITE ohne VERCEL) gelten die Vorgaben von Next unverändert.
- Folge: Datumsabhängige Teile (heute, kommende Termine, das 45-Tage-Fenster der Gebetszeiten) bleiben im Beispielmodus auf dem Stand des Baus. Das ist kein Betriebszustand – der Beispielmodus endet mit dem Anschluss der Datenbank (Runbook Abschnitt 4).

## Nachtrag 2026-10-12 (Beispielmodus: Linkvorschauen und OG-Bilder)

- **Befund 1 (Laufzeitfehler der Produktion):** Die ersten Abrufe von `/opengraph-image/standard` unter `/tr` und `/en` endeten mit 500 und `DYNAMIC_SERVER_USAGE`. Bildrouten unter `[locale]` werden mit Cache Components zur Laufzeit erzeugt (ISR). `lib/seo/og-bild.tsx` las Monogramm und Schriften mit `readFile` aus `node:fs/promises`, also ungecacht und asynchron außerhalb von `'use cache'`. Next wertet das als dynamische Datenquelle.
- **Entscheidung 1:** Die festen Dateien werden synchron gelesen (`readFileSync`, Next-Doku Cache Components, „Predictable values“) und im Prozess gemerkt. Im OG-Pfad steht kein asynchroner Dateizugriff außerhalb von `'use cache'`. Das gilt mit und ohne Datenbank.
- **Befund 2:** Auf `/de` erschien „DATABASE_URL fehlt“. Ursache waren Abrufe von „HTML-begrenzten“ Bots (WhatsApp, Slackbot, facebookexternalhit, Twitterbot, Bingbot …). Für diese Bots umgeht Next die vorgerenderte Hülle und rendert neu, und ohne Datenbank scheitert das. Linkvorschauen bekamen 500.
- **Entscheidung 2:** Nur im Beispielmodus setzt `next.config.ts` die Option `htmlLimitedBots` auf ein Muster, das auf keinen echten Bot passt. Bots bekommen dann dieselbe vorgerenderte Hülle wie Browser. Titel, Beschreibung und `og:*` stehen dort schon im `<head>`. Mit Datenbank gilt die Vorgabe von Next.
- **Entscheidung 3:** Die OG-Bilder von Beiträgen und Veranstaltungen entstehen zur Laufzeit (ISR). Zur Laufzeit des Beispielmodus fragen sie die Datenbank gar nicht erst ab und zeigen das Standardbild (`inhaltOderStandard` in `lib/seo/og-bild.tsx`, Bedingung `datenbankVerfuegbar` in `lib/db/verfuegbar.ts`, dieselbe wie in `lib/db/index.ts`). Abfangen allein reichte nicht: Nach einer scheiternden `'use cache'`-Abfrage hing die Antwort in der Gegenprobe ohne Datenbank (0 % CPU, keine Antwort). Auf Vercel liefe sie bis zum Funktionslimit. Mit Datenbank, in Entwicklung und beim Bau wird normal geladen, und ein Fehler geht weiter.
- **Bekannte Grenzen des Beispielmodus** (alle enden mit dem Anschluss der Datenbank, Runbook Abschnitt 4):
  - ~~Unbekannte Slugs von Beiträgen und Veranstaltungen zeigen eine Fehlerseite~~ – behoben: Die Lader prüfen `datenbankVerfuegbar` und liefern „nicht gefunden“ (Stand 14.10.2026, gemessen im Lauf wie ein frischer Import).
  - Die Suche mit Begriff (`/suche?q=…`) braucht die Datenbank.
  - ~~POST-Anfragen ohne `Next-Action` enden mit 500~~ – im Lauf vom 14.10.2026 nicht mehr nachstellbar.
  - Alle Schreibwege (Formulare, Verwaltung) brauchen die Datenbank. `/api/altcha` antwortet ohne `ALTCHA_GEHEIMNIS` mit 503 statt 500.
  - Kalender-Abos (`/api/ical/…`): Feiertage nur berechnet („vorläufig“), Veranstaltungen leer; der Einzeltermin als .ics wird auf vorgerenderten Seiten nicht angeboten (`ohneLaufzeitDatenbank` in `lib/db/verfuegbar.ts`). `/medien/…` antwortet mit 404.

## Nachtrag 2026-10-28 (Marktstart IGMG: Stand-Migration „marktstart“ im Bau)

- **Befund:** Neue Beispielstände der Seiteninhalte (IGMG, Über uns, Vorstand, vier Organisationen, Aus dem Dachverband, Hadsch & Umra, der Entwurf der Datenschutzerklärung mit Videos und Karte nach Klick) und neue Wissensthemen (vier Entwürfe nach ADR 0047, Videos von IGMG Reisen) erreichen eine bestehende Datenbank nicht über `pnpm db:seed`, weil die Seeds mit `onConflictDoNothing` arbeiten.
- **Festlegung:** Eine idempotente Stand-Migration `pnpm inhalte:marktstart` (`scripts/inhalte-marktstart.ts`, Helfer `src/lib/inhalt/seed-stand.ts` und `src/lib/inhalt/stand-marktstart.ts`) ersetzt nur Zeilen mit `istBeispiel = true`, legt fehlende Bereiche an und schreibt einen Audit-Eintrag. Was die Redaktion gespeichert hat (`istBeispiel = false`), bleibt unberührt und muss von Hand nachgezogen werden (etwa `[Gründungsjahr]` oder „1975“ in gespeicherten Fassungen).
- **Im Vercel-Bau:** `scripts/vercel-bau.mjs` ruft sie im Zweig mit `DATABASE_URL` nach Migration und Inhaltsimporten und vor `next build` auf; ein zweiter Lauf ändert nichts. Davor läuft jetzt auch `inhalte-2026` (bisher nur von Hand), damit die Stände in ihrer Reihenfolge ankommen (2026, dann Marktstart); beide sind idempotent. Ohne Datenbank (Beispielmodus) entfällt der Schritt, die PGlite-Bau-Datenbank bekommt die neuen Seeds direkt.
- **Docker und Handbetrieb:** Kein automatischer Aufruf beim Start; nach dem Update einmal `pnpm inhalte:marktstart` mit der `DATABASE_URL` der Produktion, danach `POST /api/wartung/cache-erneuern` (BETRIEB § 4, GO-LIVE C).
- **KI-Entwürfe nur einmal je Datenbank (Gegenprüfung 28.10.2026):** Die Migration erkannte fehlende Entwürfe nur an der fehlenden Zeile. Ein Thema, das die Redaktion endgültig gelöscht hatte (Verwaltung oder Leerung des Papierkorbs), legte so jeder Bau mit Datenbank neu an – öffentlich als „zur Prüfung“. Jetzt merkt sich die Datenbank in `einstellung` unter `wissen_entwuerfe_angelegt` (`{ slugs: [...] }`), welche Entwurfs-Slugs sie je bekommen hat. Angelegt wird nur ein Slug, der fehlt und nicht im Merker steht; danach gilt Merker = bisheriger Merker ∪ vorhandene ∪ neu angelegte Slugs. Den Merker setzen Seed (`pnpm db:seed`) und Migration über dieselbe Funktion (`legeFehlendeEntwuerfeAn` in `drizzle/seeds/bereiche/wissen-entwuerfe.ts`, mit Slug-Filter samt Freigabe-Antrag und Revision). Bestand ohne Merker: Als angelegt gelten die vorhandenen Slugs und die, die die Migration laut Audit (`inhalt.angelegt` mit `details.migration` und `details.slug`) schon angelegt hat. Audit-Einträge entstehen nur für wirklich eingefügte Zeilen (`returning`). Freie Schlüssel in `einstellung` sind üblich (`inhaltsdaten`, `schutzrollen_start`, `lernapp_*`); kein Leser geht über alle Schlüssel, Cockpit und Verwaltung lesen nur ihre eigenen.
- **Sperre der Inhaltsstände:** `inhalte-2026`, `inhalte-marktstart` und der Seed der Entwürfe laufen je in einer Transaktion, die zuerst `pg_advisory_xact_lock(4242018)` nimmt (`src/lib/inhalt/sperre.ts`). Zwei Bauläufe gegen dieselbe Datenbank laufen so nacheinander; der zweite findet nichts mehr zu tun. Eigener Schlüssel neben der Migrationssperre 4242017 (Sitzungssperre); eine Transaktionssperre hält auch hinter dem Pooler. Unter PGlite (eine Sitzung) läuft sie durch; die Wirkung über zwei Sitzungen prüft `tests/integration/inhalte-sperre-postgres.test.ts` mit `TEST_PG_URL`.
- Migrationen bleiben additiv (Migration 0024 `igmg_abgleich`: neuer Enum-Wert, zwei Spalten, eine Tabelle). Gespeicherte Seiteninhalte älterer Form parsen weiter (Schema-Unions und `.catch(null)`, ADR 0046 Nr. 3).

## Nachtrag 2026-10-28 (Livegang ohne Rechner: Erstbefüllung und erstes Konto im Bau, E-047)

- **Befund:** Der Bau spielt nie `db:seed` ein (Festlegung oben); das erste Verwaltungskonto entsteht nur über `pnpm verwaltung:einladen` mit Zugang zur Datenbank. Für den Livegang „Technik live, Hinweis an“ hat niemand einen Rechner mit diesem Zugang. Eine neue Datenbank bliebe leer, die Verwaltung ohne Konto.
- **Festlegung (Ausnahme, nur auf Anforderung):** `scripts/vercel-bau.mjs` startet nach der Migration und vor den Inhaltsdaten `scripts/erstbefuellung.ts`, wenn `scripts/erstbefuellung-regel.mjs` etwas plant – nur bei `VERCEL_ENV=production`:
  - `ERSTBEFUELLUNG=1`: alle Seeds (`fuehreSeedsAus` in `drizzle/seeds/alle.ts`, dieselben wie `pnpm db:seed`), nur solange der Merker `erstbefuellung` in `einstellung` fehlt und die Datenbank noch kein Konto hat; danach setzt der Bau den Merker (mit Audit `einstellung.geaendert`). Endgültig löschen kann nur ein Konto – ohne Konto bringen die Seeds also nichts Gelöschtes zurück; mit Konto (etwa nach `pnpm db:seed` von Hand oder einer Wiederherstellung ohne Merker) setzt der Bau nur den Merker (`ergebnis: konten_vorhanden`). Ein stehen gelassenes Flag legt so nie endgültig Gelöschtes neu an. Scheitert ein Seed, bleibt der Merker aus und der Bau bricht ab; die Seeds sind idempotent.
  - `ERSTE_VERWALTUNG_EMAIL` und `ERSTE_VERWALTUNG_NAME`: Zuerst widerruft der Bau offene Bau-Einladungen (es gilt der Link des neuesten Baus), dann prüft er, ob ein Konto die Rolle `administration` hat; nur ohne legt er die Einladung an (72 h, `erstellt_von = 'bau'`). Die Reihenfolge schließt das Rennen mit einer gleichzeitigen Annahme: Die Annahme (`einladungAnnehmen` in `src/server/actions/anmeldung.ts`) beansprucht die Einladung jetzt in ihrer Transaktion mit Bedingung (nicht angenommen, nicht widerrufen, nicht abgelaufen), bevor sie Rollen vergibt – vorher setzte sie `angenommen_am` ohne Bedingung und vergab die Rollen auch aus einer eben widerrufenen Einladung. Scheitert das Beanspruchen, löscht sie das eben registrierte Konto wieder. Ist schon ein Konto mit Administration da, entwertet jeder weitere Bau übrig gebliebene Bau-Links. Der Link (Basis `APP_URL`, sonst `VERCEL_PROJECT_PRODUCTION_URL`, nie die geschützte Adresse des Deployments) erscheint nur im Bauprotokoll; gespeichert wird nur der SHA-256-Hash des Tokens (`src/lib/rechte/einladung-anlegen.ts`, gemeinsam mit `scripts/einladen.ts`). Audit `einladung.erstellt` bzw. `einladung.widerrufen` ohne Personendaten.
  - Unvollständige oder ungültige Angaben brechen den Production-Bau ab; in Preview bleibt es bei einem Hinweis im Protokoll.
- **Sperren:** Sitzungssperre `pg_advisory_lock(4242019)` über die direkte Verbindung (`DATABASE_URL_UNPOOLED`, sonst `DATABASE_URL` mit Warnung bei einer Pooler-Adresse), wie die Migrationssperre: Zwei Bauläufe gleichzeitig laufen nacheinander, der zweite findet den Merker. Die Einladung nimmt zusätzlich die Transaktionssperre `pg_advisory_xact_lock(4242020)`, die auch hinter dem Pooler hält: Der zweite Bau widerruft die Einladung des ersten.
- **Restrisiko:** Wer das Bauprotokoll lesen kann, sieht den Link bis zur Annahme und könnte ihn zuerst annehmen; Passwort und Zwei-Faktor setzt dann diese Person. Schutz geben nur: Build-Logs nur für das Team sichtbar (Vercel-Einstellung „Build Logs and Source Protection“, im Code nicht prüfbar, in beiden `vercel.json` kein `public: true`), der Link gilt 72 h und einmal, und die berechtigte Person nimmt ihn gleich nach dem Bau an. Nach der Annahme legt kein Bau mehr eine Einladung an; die Variablen werden gelöscht (`web/docs/deploy/VERCEL.md` 2.5). Bewusst offen: Wer ohne Vercel-Team auf `main` pushen darf, kann bis zur Annahme mit jedem Bau den Link erneuern lassen (Störung, kein Zugriff); eine falsch gesetzte `APP_URL` (fremder Host) würde den Token dorthin tragen – beides setzt Zugang zum Repository bzw. zum Vercel-Team voraus.
- **Tests:** `tests/unit/erstbefuellung.test.ts` (Regel, Linkbasis, Reihenfolge im Bau-Skript), `tests/integration/erstbefuellung.test.ts` (einmal Seed mit Merker, Datenbank mit Konten, gescheiterter Seed, echte Seeds, Einladung nur ohne Administration, Widerruf, Link über die Abfrage der Annahmeseite), `tests/integration/einladung-annahme-widerruf.test.ts` (Widerruf während der Annahme mit echtem Better Auth; scheitert mit der alten Annahme).

