Hinweis: Die Datei `_gemeinde/berichte/E0-K01-auth-rechte.md` habe ich nicht geschrieben, weil die Vorgabe für Kundschafter lautet, Berichte als Antwort zurückzugeben. Der Bericht steht vollständig hier. Ich habe nichts geändert. Alle Pfade liegen unter `/home/user/IGMG/web/`.

# E0-K01: Anmeldung, Sitzung, Rechte, Einladungen

## 1. Better-Auth-Konfiguration (better-auth 1.7.7)
- `src/lib/auth/optionen.ts`: `authOptionen` (:16). Cookie-Präfix `igmg` (:45), sichere Cookies bei https (:46), keine IP-Speicherung (:49).
- Passwort: 12 bis 128 Zeichen (:23-24), kein Auto-Login (:25), Sitzungen enden beim Zurücksetzen (:26). Reset-Link 1 h (`src/lib/auth/server.ts:25`). Versand über den Mail-Ausgang (`server.ts:26`, `src/lib/auth/passwort.ts:11-18`). Gesperrte Konten erhalten keinen Link (`passwort.ts:13`).
- Sitzung: 8 h (`optionen.ts:29`), Aktualisierung nach 30 min (:30), kein Cookie-Cache (:31). Der Hook `databaseHooks.session.create` verweigert gesperrte Konten (`server.ts:30-43`, Ablehnung :40). Zusätzlich prüft `ladeAngemeldet` das Sperrkennzeichen (`src/lib/rechte/pruefe.ts:38`).
- Plugins: `twoFactor` mit TOTP und 10 Ersatzcodes (`optionen.ts:57`), `passkey` (:58, Endpunkte über HTTP gesperrt), `nextCookies` (`server.ts:29`).
- Rate-Limit (:33-43): Datenbank-Speicher. `/sign-in/email` 5 pro 60 s, `/two-factor/*` 5 pro 60 s, `/request-password-reset` 3 pro 300 s. Nur für HTTP; direkte `auth.api`-Aufrufe umgehen es (Kommentar :63-64). Deshalb hat jede Action eine eigene Begrenzung.
- Hooks (:67-82): wirken nur, wenn `ctx.request` gesetzt ist (:68). Über HTTP gesperrt sind `/sign-up/email` (:69) sowie `/sign-in/email`, `/two-factor/*`, `/passkey/*`, `/request-password-reset`, `/reset-password`, `/change-password`, `/update-user` (:70-81).
- Route: `src/app/api/auth/[...all]/route.ts`. `src/proxy.ts` prüft keine Rechte. Er setzt CSP und `no-store` für `/verwaltung` (:21-32) und lässt `/api` aus (:39).

## 2. Exportierte Funktionen
- `src/lib/auth/server.ts`: `auth` (:17), `type Sitzung` (:47).
- `src/lib/auth/passwort.ts`: `planePasswortMail(user, link): Promise<void>` (:11), `protokolliereZuruecksetzen(benutzerId): Promise<void>` (:21).
- `src/lib/rechte/pruefe.ts`: `class KeinRecht` (:11). `ladeAngemeldet(): Promise<Angemeldet | null>` (:35, React-`cache`). `verlangeSitzung(): Promise<Angemeldet>` (:52). `verlangeSeitenRecht(aktion, ziel?)` (:61). `verlangeRecht(aktion, ziel?)` (:71). Re-Export von `darf` und `organisationsFilter` (:77).
- `src/lib/rechte/matrix.ts`: `ROLLEN` (:6), `ORGANISATION_KUERZEL` (:9), `AKTIONEN` (:15), `MATRIX` (:85), `darf(rollen, aktion, ziel?): boolean` (:149), `organisationsFilter(rollen, aktion): OrganisationKuerzel[] | null` (:161), `EINGANG_AKTION` (:170).
- `src/lib/rechte/administration.ts`: `mitAdministrationsSchutz(arbeit: (tx) => Promise<void>): Promise<boolean>` (:17).
- `src/server/queries/einladung.ts`: `ladeGueltigeEinladung(token: string)` (:11).
- `src/server/queries/verwaltung/benutzer.ts`: `ladeBenutzerListe(leser)` (:88), `ladeBenutzer(id)` (:110), `emailBelegt(email)` (:143), `ladeOffeneEinladungen()` (:127), `zaehleAdministration(ohne?, ausfuehrer?)` (:163).
- `src/lib/validierung/benutzer.ts`: `rollenSchema` (:16), `einladungSchema` (:18), `alsZuweisungen(d)` (:28), `passwortSchema` (:36).
- Server Actions. `src/server/actions/anmeldung.ts`: `anmelden` (:60), `zweiFaktorPruefen` (:92), `zweiFaktorStarten` (:115), `zweiFaktorBestaetigen` (:133), `abmelden` (:148), `einladungAnnehmen` (:163), `passwortVergessen` (:207), `passwortNeuSetzen` (:230). `src/server/actions/benutzer.ts`: `einladen` (:51), `einladungWiderrufen(fd)` (:109), `rollenSpeichern` (:131), `kontoSperren` (:167), `kontoEntsperren` (:186), `zweiFaktorZuruecksetzen` (:197), `kontoLoeschen` (:215), `passwortAendern` (:230), `ersatzcodesErzeugen` (:256).

## 3. Abläufe
- **Anmeldung** (`anmeldung.ts:60-87`): Zod (:33-36). Begrenzung je IP 10 pro 10 min und je Konto 8 pro 15 min (:42-54). `auth.api.signInEmail` (:70). Bei 2FA geht es nach `/verwaltung/anmelden/zwei-faktor` (:79). Ohne 2FA wird `anmeldung.erfolg` protokolliert (:84), dann folgt die Weiterleitung nach `/verwaltung/zwei-faktor` (:86). Die Einrichtung ist dann Pflicht.
- **2FA**: Prüfung per TOTP oder Ersatzcode (:92-113). Einrichtung: `zweiFaktorStarten` mit Passwort über `enableTwoFactor` (:124), dann `zweiFaktorBestaetigen` mit `verifyTOTP` (:140) und Audit `zwei_faktor.eingerichtet` (:144).
- **Zugang** (`pruefe.ts:52-58`): Sitzung, dann erfüllter zweiter Faktor, dann mindestens eine Rolle. Sonst Umleitung nach `/verwaltung/anmelden`, `/verwaltung/zwei-faktor` oder `/verwaltung/anmelden?keine-rolle=1`.
- **Einladung**: `einladen` (`benutzer.ts:51-107`) verlangt `benutzer.einladen` und prüft die E-Mail (:69). Token mit 32 Byte (:71), gespeichert nur als SHA-256 (:85). Laufzeit 1 bis 14 Tage, Standard 3 (`validierung/benutzer.ts:22`). Der Link erscheint nur in der Antwort (:106). Die Mail ist verschlüsselt im Mail-Ausgang abgelegt (:74-92). `einladungAnnehmen` (`anmeldung.ts:163-199`) prüft Token, Annahme, Widerruf und Ablauf (`queries/einladung.ts`). Dann legt `signUpEmail` ohne Request das Konto an (:184). Danach folgt eine Transaktion mit E-Mail-Verifizierung, Rollen, Annahme und Audit (:185-194).
- **Passwort**: `passwortVergessen` antwortet immer gleich. Link und Mail entstehen erst in `after()` (:207-223). `passwortNeuSetzen` (:230-253). In „Mein Konto“ ändert `passwortAendern` (`benutzer.ts:230-253`) das Passwort mit `verwaltung.betreten`. Andere Sitzungen enden dabei.

## 4. Rollen- und Aktionsmodell
- **AKTIONEN** (`matrix.ts:15-58`, 42 Einträge). Inhalte: Veranstaltungen, Nachrichten und Ankündigungen je lesen, bearbeiten, löschen; Seiteninhalte, Organisationsinhalt, Kurse, Gebetszeiten, Medien (20). Eingänge: 5 Arten je lesen und bearbeiten (10). Kommunikation: `postfach.nutzen` und Tickets (4). Betrieb: `verwaltung.betreten`, `uebersicht.lesen`, Benutzer (3), `audit.lesen`, `einstellung.bearbeiten`, `styleguide.lesen` (8).
- **Matrix** (`matrix.ts:85-134`):
  - administration: alle 42.
  - redaktion (25): Grundrechte plus Inhalte, Gebetszeiten, Medien löschen und hochladen, Veranstaltungsanmeldungen.
  - organisationsredaktion (20): Grundrechte plus Veranstaltungen, Nachrichten, Ankündigungen, Organisationsinhalt, Medien hochladen, Veranstaltungsanmeldungen. Nur für die eigene Organisation.
  - bildung (13): Grundrechte, Kurse (3), Voranmeldungen (2), Medien hochladen.
  - mitgliederverwaltung (9): Grundrechte, Mitgliedsanträge (2).
- **Grundrechte** (:74-82): `verwaltung.betreten`, `uebersicht.lesen`, `postfach.nutzen`, `ticket.lesen`, `ticket.anlegen`, `styleguide.lesen`, `medium.lesen`.
- **ORGANISATIONSGEBUNDEN** (:62-72, 9 Einträge): Veranstaltungen, Nachrichten und Ankündigungen je bearbeiten und löschen, `organisationsinhalt.bearbeiten`, `eingang.veranstaltungsanmeldung.lesen` und `.bearbeiten`.
- **`darf`** (:149-158): Mehrere Zuweisungen addieren sich. Außer bei der Organisationsredaktion genügt ein Matrixtreffer. Die Organisationsredaktion darf nicht gebundene Aktionen unabhängig von der Organisation. Gebundene `.lesen`-Aktionen ohne Ziel (Listen) sind erlaubt. Sonst gilt nur die eigene Organisation.
- **`organisationsFilter`** (:161-167): `null` bedeutet uneingeschränkt, sonst die eigenen Organisationen.

## 5. Wie Seiten und Actions prüfen
- Layout `(geschuetzt)/layout.tsx:22` ruft `verlangeSitzung` auf. Seiten rufen `verlangeSeitenRecht(aktion, ziel?)` auf, z. B. `benutzer/page.tsx:19` oder `seiteninhalte/organisationen/[org]/page.tsx:20` mit Ziel. Ausnahme: `eingaenge/[id]/page.tsx:25` prüft nur `verwaltung.betreten` und danach die Eingangsart per `darf`.
- Menü: `components/verwaltung/shell/module.ts` (`MODULE` :44, `rechtListe` :147). Kacheln: `components/verwaltung/uebersicht/sichtbarkeit.ts`.
- Actions beginnen mit `verlangeRecht(...)` (z. B. `benutzer.ts:52`, `:132`). Datensatzbezogen per `darf(..., {organisation})` (`ankuendigungen.ts:106`). Listen über `organisationsFilter` in den Queries (`queries/verwaltung/uebersicht.ts:70`, `tickets.ts:35`).
- Mail-Empfänger folgen der Matrix (`lib/mail/ausgang.ts:36`).

## 6. Wie Tests Sitzungen erzeugen
- `tests/integration/hilfen/verwaltung.ts`: `vi.mock('@/lib/auth/server')` (:47), `auth.api.getSession` liefert eine Modulvariable. `verwaltungsUmgebung()` (:50) legt PGlite mit allen Migrationen an (`hilfen/db.ts`). `angemeldetAls(rollen | null, zweiFaktor = true)` (:60) schreibt Konto und `rolle_zuweisung`. Außerdem Mocks für next/cache, next/server (`after` sammelt), next/headers und next/navigation (`redirect` wirft `NEXT_REDIRECT:ziel`).
- `tests/integration/verwaltung/rechte-hilfen.ts`: `PERSONEN` (:23, 8 Gruppen inkl. ohne 2FA), `erlaubt()` (:41) als Erwartung über `darf()`, `ausgang()` (:50) fängt KEIN_RECHT und Weiterleitung.
- `rechte-matrix.test.ts`: `FAELLE` (:1000). `it.fails` markiert dokumentierte Befunde. Vollständigkeit (:1092-1116) gleicht exportierte Actions mit den Fällen ab.
- Anmeldung: `rechte-anmeldung.test.ts:17` stubbt `auth.api.signOut`. `anmeldung-audit.test.ts:29, 45` stubbt `verifyTOTP`. `anmeldung-ratenbegrenzung.test.ts` nutzt die echte Tabelle.
- E2E: `tests/e2e/hilfen/einladung.ts:5` erzeugt eine Einladung per `pnpm verwaltung:einladen --nur_token`.

## 7. Wo neue Rollen und Aktionen eingetragen werden
**Neue Rolle:**
1. `src/lib/rechte/matrix.ts:6` ROLLEN, `:85-134` MATRIX, bei Bedarf `:62-72` ORGANISATIONSGEBUNDEN.
2. `src/lib/db/schema/typen.ts:25` `rolleEnum`, dazu Drizzle-Migration (`ALTER TYPE ... ADD VALUE`) und Snapshot.
3. Texte: `messages/de.json:359` (`verwaltung.rollen`) und `messages/verwaltung/benutzer.json:40` (`rollenBeschreibung`).
4. Automatisch aus ROLLEN: `validierung/benutzer.ts:9`, `components/verwaltung/benutzer/RollenFelder.tsx:47`, `lib/mail/ausgang.ts:36`, `schema/rechte.ts:26`, `scripts/einladen.ts`.
5. Tests: `tests/unit/rechte/matrix.test.ts` und `matrix-negativ.test.ts` (Fachbereichslisten fest kodiert), `rechte-hilfen.ts:23` PERSONEN, `rechte-matrix.test.ts` FAELLE. Danach `pnpm sprachen:pruefen`.

**Neue Aktion:**
1. `matrix.ts:15-58` AKTIONEN, `MATRIX` für jede Rolle, bei Bedarf ORGANISATIONSGEBUNDEN.
2. `tests/unit/rechte/matrix-negativ.test.ts:13` führt eine eigene Kopie der Liste.
3. Modul: `shell/module.ts` MODULE (:44) mit `recht`.
4. Wird sie protokolliert: `src/lib/audit/index.ts:8` (`AuditAktion`), `src/server/queries/verwaltung/audit.ts:22` (`AKTION_SCHLUESSEL`), `messages/verwaltung/audit.json`, Test `verwaltung-audit.test.ts:250`.
5. Eingangsarten: `matrix.ts:170` `EINGANG_AKTION` und `lib/eingaenge/arten`.

## 8. Stolperfallen und OFFENE FRAGEN
1. **Tickets**: Die Organisationsredaktion darf `ticket.lesen` über alle Organisationen, weil `darf()` die Bindung nicht kennt (`matrix.ts:154`). Die Grenze gilt nur in `queries/verwaltung/tickets.ts:35` und im Test `rechte-matrix.test.ts:1062-1090`.
2. **Sitzung und 2FA**: `ladeAngemeldet` liest `twoFactorEnabled` bei jeder Anfrage (`pruefe.ts:44`). OFFENE FRAGE: Stellt `verifyTOTP` in `zweiFaktorBestaetigen` (:140) eine neue Sitzung aus? Falls nicht, gilt die Passwort-Sitzung nach der Einrichtung ohne neuen Code als 2FA-erfüllt.
3. **Einladung ohne Transaktionsverbund**: `signUpEmail` (:184) liegt außerhalb der Transaktion (:185-194). Scheitert die Transaktion, bleibt ein Konto ohne Rollen zurück. Ein neuer Versuch scheitert an der belegten E-Mail. Nicht behandelt.
4. **Laufzeit**: Die Action erlaubt 1 bis 14 Tage (`validierung/benutzer.ts:22`), ADR 0003 nennt 72 h. `scripts/einladen.ts:17` nutzt 72 h, schreibt direkt in die Datenbank ohne Audit (:51) und setzt `erstelltVon: 'kommandozeile'` als Freitext.
5. **Fehlerkanäle**: Es gibt zwei Wege. Manche Actions werfen `KeinRecht`, andere geben `{fehler:'keinRecht'}` zurück (`ankuendigungen.ts:38`, `kurse.ts:53-55`).
6. **Rate-Limit ohne Proxy**: Ohne `PROXY_VERTRAUEN=1` teilen alle Anfragen einen Schlüssel (`src/lib/sicherheit/ip.ts:13-17`). Eine Sperre trifft dann alle.
7. **HTTP-Hooks**: Die Hooks greifen nur mit `ctx.request`. `dispatch.mjs:186-193` übernimmt `request` nur, wenn der Aufrufer es übergibt. `headers` allein genügt nicht. Neue HTTP-Pfade (z. B. ein `username`-Plugin) muss man in die Liste `optionen.ts:70-81` aufnehmen.
8. **Doku-Drift**: ADR 0003 nennt `/verwaltung/zwei-faktor-einrichten`. Im Code heißt der Pfad `/verwaltung/zwei-faktor` (`pruefe.ts:55`). Die ADR-Aussage „T3-Tests über alle Rollen × Aktionen (generiert)“ trifft nicht zu. Die Vollständigkeit prüft nur die Action-Exporte.
9. **Ohne Integrationsfall**: `uebersicht.lesen`, `gebetszeiten.lesen`, `medium.lesen` und `styleguide.lesen` tauchen in keinem Test auf. `benutzer.lesen` nur im Unit-Test.
10. **Sperre im Test**: `angemeldetAls` setzt kein `gesperrtAm` (`hilfen/verwaltung.ts:60-77`). Der Sperrpfad der Sitzung (`pruefe.ts:38`) ist mit diesem Helfer nicht prüfbar. OFFENE FRAGE: Prüft ein anderer Test ihn?
11. **Schema-Generator**: `scripts/auth-schema.mjs:15` ersetzt nur `timestamp("name")` mit doppelten Anführungszeichen. `schema/auth.ts` ist mit einfachen Anführungszeichen formatiert. OFFEN: Reproduziert `pnpm auth:schema` die Zeitzonen-Umstellung?
12. **Formulare**: `src/server/actions/formulare/*.tsx` haben keine Rechteprüfung. Das ist beabsichtigt, aber der Vollständigkeitstest erfasst sie nicht.

## 9. Bezug zum Plan (`_gemeinde/AUFTRAG.md`, Konten Gemeinde, Eltern, Lehrkraft, Schüler)
- E-Mail ist Pflicht: `schema/auth.ts:8` (`email notNull unique`), `pruefe.ts:45`, `anmeldung.ts:121` (Rate-Limit je Konto), `anmeldung.ts:201-210` (Passwort-Reset). Kinder unter 16 mit Benutzername brauchen eine Schemaänderung.
- 2FA ist global Pflicht (`pruefe.ts:55`, `anmeldung.ts:86`, `:112`). Der Plan verlangt je Konto Pflicht, Opt-in oder keine.
- Die Sitzungsdauer ist global 8 h (`optionen.ts:29`). Der Plan sieht 12 h und 30 Tage vor. Das braucht eigene Logik.
- Der Schutz der letzten Administration kennt nur die Rolle `administration` (`queries/verwaltung/benutzer.ts:163`).
- `rolleEnum` und ROLLEN müssen synchron bleiben. `gemeinde_rolle` (AUFTRAG:150) ist im Bestand nicht angelegt.