# S1 – Sicherheitsprüfung Gemeinde-Plattform (Konten, Rechte, Chat, Push, Kopfzeilen)

- Stand: Branch `claude/trusting-lovelace-6nfolz`, Commit `6b58403` (inkl. der nachgemeldeten Dateien `sechzehn.ts`,
  `kinderschutz.ts`, `gemeinde-im-blick/page.tsx`, `loeschen/gemeinde.ts`, `public/sw.js`). Better Auth 1.7.7, Next 16.4.0.
- Im Repository wurde nichts geändert. Nachweise liefen als Wegwerf-Tests außerhalb des Repos
  (`scratchpad/s1/t*/…test.ts` mit eigener Vitest-Konfiguration gegen PGlite und echtes Better Auth) bzw. mit `tsx`.
- **Urteil: 2 × hoch offen (H-1, H-2), kein kritischer Befund → blockiert den Fast-Forward nach `main` (Regel ADR 0035 / Z-13).**
  Mildernd: Alle betroffenen Funktionen (`konten`, `chat`, `push`) sind in der Produktion per Schalter aus.

---

## Hoch

### H-1 Chat: Kind liest ohne bzw. nach widerrufener Elterneinwilligung (S-03, D-01, D-11)
- **Ort:** `src/lib/chat/dienst.ts:174` (`ladeNachrichten` sperrt nur bei `lage === 'einwilligungFehlt'`) zusammen mit
  `src/lib/chat/regeln.ts:118-133` (`schreibGrund` prüft die Einwilligung erst ganz am Ende, nach Notfall-Pause,
  Kanal aus, < 2 Erwachsene, Pause, `nur_lehrkraft`, Öffnungszeiten und Stummschaltung).
- **Angriffsweg:** Eltern widerrufen „Gruppenchat“ (oder haben nie eingewilligt; bzw. Jugendliche ≥ 16 + 30 Tage ohne eigene
  Einwilligung, D-11). Das Kind ruft `GET /api/mein/chat/<kanal>` nach 20:00 oder vor 08:00 auf (Standardfenster 08–20 Uhr),
  oder während der Kanal pausiert / im Modus „nur Lehrkraft“ / mit nur einer Leitungsperson ist, oder während es stummgeschaltet
  ist. `schreibGrund` liefert dann `geschlossen` / `pausiert` / `nurLehrkraft` / `zuWenigeErwachsene` / `stumm` statt
  `einwilligungFehlt` → die Route liefert alle Nachrichten samt Namen der anderen Kinder. Der Widerruf wirkt also nur
  innerhalb der Öffnungszeiten; der bestehende Test (`chat.test.ts:134`) besteht nur, weil dort das Fenster 00:00–23:59 ist.
- **Nachweis:** Wegwerf-Test: Einwilligung widerrufen → Fenster offen: `einwilligungFehlt`, 0 Nachrichten; Fenster
  geschlossen: `geschlossen`, 1 Nachricht (Text sichtbar); Modus `nur_lehrkraft`: 1 Nachricht.
- **Behebung:** Einwilligung für Lernende vor allen anderen Lagen prüfen (in `schreibGrund` direkt nach `keinRecht`:
  `if (l.istLernende && l.unter16 && !l.einwilligungGruppenchat) return 'einwilligungFehlt'`) oder eine eigene Lese-Prüfung
  `leseGrund()` für `ladeNachrichten`. Dieselbe Prüfung in `GET /api/mein/echtzeit` (Token nur mit Einwilligung).
  Test S-03 zusätzlich mit geschlossenem Fenster, `nur_lehrkraft`, `pausiert`, `stumm` und für D-11 (≥ 16 ohne eigene).

### H-2 Konto-Vorbelegung: fremde Adresse registrieren → nach Bestätigung durch die Inhaberin gilt das Passwort des Angreifers; Passkey überlebt das Zurücksetzen
- **Ort:**
  - `src/lib/konto/registrierung.ts:72-83`: Registriert sich jemand mit einer Adresse, für die schon ein **unbestätigtes**
    Konto existiert, bekommt das *alte* Konto (mit dem Passwort des ersten Registrierenden) einen neuen Bestätigungslink.
  - `src/lib/konto/registrierung.ts:122-143` (`bestaetigeKonto`): setzt `emailVerified` und Rolle `gemeinde`, beendet aber
    keine vorhandenen Sitzungen und verwirft keine vorher gesetzten Zugangsdaten.
  - `src/server/actions/anmeldung.ts:60-87` (Verwaltungsanmeldung) prüft `emailVerified` nicht → unbestätigte
    Gemeinde-Konten erhalten dort eine Sitzung (30 Tage gleitend), die die Bestätigung überlebt; ebenso der Zwei-Faktor-Schritt
    `src/server/actions/konto.ts:147-173` (kein `emailVerified`).
  - `src/lib/auth/optionen.ts:27` `revokeSessionsOnPasswordReset` beendet nur Sitzungen – Passkeys
    (`src/server/actions/mein-bereich.ts:202-236`) und ein vom Angreifer eingerichtetes TOTP bleiben.
- **Angriffsweg:** (1) Angreifer registriert `opfer@…` mit eigenem Passwort (Mail an das Opfer wird ignoriert). Optional holt er
  sich über `/verwaltung/anmelden` schon jetzt eine Sitzung. (2) Später registriert sich das Opfer selbst → gleiche Antwort,
  neuer Bestätigungslink an das Opfer → Opfer bestätigt. (3) Das Opfer kommt mit seinem Passwort nicht hinein; der Angreifer
  meldet sich an (ob bestätigt, verrät ihm `anmelden.unbestaetigt` → Erfolg beim Abfragen), legt einen eigenen Passkey an
  (Gemeinde-Konten dürfen das) und/oder TOTP. (4) Das Opfer setzt das Passwort zurück → Angreifersitzungen enden, der Passkey
  bleibt → dauerhafter, unbemerkter Zugang. Wird das Konto später per `uebernimmEinladung` zum Elternkonto, erbt der Angreifer
  Kinderdaten, Elternkanal und künftig den Kinderzugang (AUFTRAG 3.5). Bei eingerichtetem Angreifer-TOTP ist das Opfer
  nach dem Zurücksetzen ausgesperrt.
- **Nachweis:** Wegwerf-Test mit echtem Better Auth: Verwaltungsanmeldung des unbestätigten Kontos → Sitzung; nach Bestätigung
  durch die Inhaberin: Opfer-Passwort `anmelden.fehler`, Angreifer-Passwort → `/mein-bereich`; vorab erlangte Sitzung noch da;
  nach `resetPassword`: Sitzungen 0, Passkey 1.
- **Einstufung:** hoch (Grenzfall zu mittel): braucht Kenntnis der Adresse und dass das Opfer sich nach dem Angreifer
  registriert; Folge ist eine dauerhafte Kontoübernahme mit Weg zu Kinderdaten.
- **Behebung:** (a) Bei erneuter Registrierung einer unbestätigten Adresse das alte Konto samt Sitzungen/2FA/Passkeys
  löschen und neu anlegen – oder den neuen Passwort-Hash am Bestätigungstoken speichern und erst bei Bestätigung setzen.
  (b) `bestaetigeKonto`: alle Sitzungen des Kontos löschen (und vorhandenes TOTP verwerfen). (c) Verwaltungsanmeldung und
  2FA-Schritt: unbestätigte Konten wie in `kontoAnmelden` abweisen. (d) Mail „Neuer Passkey/Zwei-Faktor eingerichtet“ an die
  Adresse; beim Zurücksetzen auf vorhandene Passkeys hinweisen bzw. sie optional entfernen.

---

## Mittel

### M-1 Abruf-Route und Echtzeit-Token ohne Zwei-Faktor-Pflicht der Lehrkraft
- **Ort:** `src/app/api/mein/chat/[kanal]/route.ts:16`, `src/app/api/mein/echtzeit/route.ts:18` (beide `ladeKonto()` statt
  `verlangeKontoRecht()`); ebenso Kontoverknüpfung in `src/app/api/push/abo/route.ts:49`. Kein Schalter `konten` geprüft.
- **Angriffsweg:** Lehrkraft-Passwort bekannt, TOTP noch nicht eingerichtet (Pflicht-Einrichtung erst auf der Seite) →
  Sitzung nur mit Passwort → `GET /api/mein/chat/<kanal>` liefert den Gruppenchat der Kinder; die Actions verweigern korrekt.
  Gilt auch für jede `gruppen_leitung` ohne Rolle `lehrkraft` (Aufsicht).
- **Nachweis:** Wegwerf-Test: Lehrkraft ohne TOTP → Route 200 mit Nachrichtentext; `sendeChatNachricht` → `KEIN_RECHT`.
- **Behebung:** In beiden Routen `verlangeKontenAktion()` + `verlangeKontoRecht()` (KeinRecht → 404/401); Push-Route nur mit
  erfülltem Faktor verknüpfen.

### M-2 Administration kann sich selbst die Rolle `kinderschutz` geben (NIE_PER_ADMINISTRATION umgehbar, S-11)
- **Ort:** `src/server/actions/benutzer.ts:131-164` (`rollenSpeichern` erlaubt Änderungen am eigenen Konto, solange
  `administration` bleibt), `src/lib/validierung/benutzer.ts:9` (alle Rollen wählbar); gleichwertig `einladen` (`:51`) an eine
  eigene Zweitadresse.
- **Angriffsweg:** Administration speichert für sich `administration` + `kinderschutz` → `meldungsKontextLaden` liefert
  Chat-Inhalte (±10). Protokolliert (Audit nur 12 Monate, `loeschen/gemeinde.ts:51`; Einsicht im Moderationsprotokoll).
- **Nachweis:** Wegwerf-Test: `rollenSpeichern(id = eigene)` → `{ ok: true }`, Rollen `administration, kinderschutz`,
  `darf(…, 'meldung.chat.lesen') === true`.
- **Behebung (mit MN-23 abstimmen):** `kinderschutz` nicht an sich selbst und nicht zusammen mit `administration`;
  Vergabe nur mit Bestätigung durch eine bestehende `kinderschutz`-Person oder den Vorstand (Vier-Augen); Mail an alle
  `kinderschutz`-Konten und die Leitung bei jeder Vergabe; Cockpit-Hinweis bei mehr als den benannten Personen.

### M-3 Passkey-Anmeldung ersetzt die TOTP-Pflicht der Lehrkräfte – ohne Nutzerverifikation
- **Ort:** `src/server/actions/konto.ts:194-226` sperrt Passkeys nur bei Verwaltungsrollen (`:218`), nicht bei
  `lehrkraft`; `src/lib/rechte/gemeinde.ts:64` wertet `twoFactorEnabled` (Konto-Merkmal) als „Faktor erfüllt“;
  `@better-auth/passkey` prüft mit `requireUserVerification: false` (dist/index.mjs:355, :483).
- **Angriffsweg:** Wer den (z. B. PIN-losen) Sicherheitsschlüssel einer Lehrkraft besitzt, erhält ohne Passwort und ohne TOTP
  eine volle Lehrkraft-Sitzung (Kinderdaten, Chat-Moderation). Abweichung von KERN „Lehrkraft: TOTP Pflicht“.
- **Behebung:** `passkeyAnmelden` auch für `faktorPflicht(k)` sperren (wie Verwaltung, bis C12-Sitzungskennzeichen) oder
  Nutzerverifikation erzwingen und per ADR festhalten.

### M-4 Push-Takt: anonyme, dauerhafte Störung der Gebetserinnerungen durch ungültige Schlüssel
- **Ort:** `src/lib/validierung/push.ts:13-14` (Länge 86–88/22–24 Zeichen erlaubt 64/66 bzw. 18 Byte und Nicht-Kurvenpunkte),
  `src/lib/push/senden.ts:44` (Verschlüsselung außerhalb `try`), `src/lib/push/abo.ts:156-162` (kein `try` je Abo; Fehler vor
  Fehlerzähler → Abo wird nie entfernt).
- **Angriffsweg:** Anonymes `POST /api/push/abo` (gleiche Herkunft per `fetch` von der Seite selbst oder Skript mit passenden
  Kopfzeilen) mit gültigem FCM-Endpunkt und `p256dh = "B" + "A"×85` für alle sechs Gebete → `verschluesselePush` wirft
  („p256dh ungültig“ / „Public key is not valid for specified curve“) → der ganze Lauf bricht ab. Pro Minute kommt der Takt nur
  an einem vergifteten Abo vorbei (Einmal-Schlüssel); mit ≥ 6 solchen Abos verpassen alle später angelegten Abos das
  5-Minuten-Fenster – täglich, bis zu 12 Monate.
- **Nachweis:** `tsx`: Zod akzeptiert, Endpunkt erlaubt, Verschlüsselung wirft.
- **Behebung:** Schlüssel bei der Anmeldung dekodieren und prüfen (p256dh genau 65 Byte, `0x04`, Probe-ECDH; auth genau
  16 Byte); in `sendePush` Verschlüsselungsfehler als `entfernen: true` melden; in `fuehreTaktAus` je Abo `try/catch`.

---

## Niedrig

- **N-1 Sitzung vor Einrichtung des zweiten Faktors gilt danach als „mit Faktor“.** `src/lib/rechte/pruefe.ts:54`,
  `gemeinde.ts:64`; Better Auth ersetzt beim Einrichten nur die aktuelle Sitzung. Wer das Passwort vor der Pflicht-Einrichtung
  kennt, behält eine Sitzung, die nach der Einrichtung durch die echte Person volle Rechte hat (Verwaltung 8 h, Lehrkraft 12 h).
  Behebung: in `zweiFaktorBestaetigen` (`anmeldung.ts:133`) und `kontoZweiFaktorBestaetigen` (`mein-bereich.ts:164`) alle
  anderen Sitzungen löschen; langfristig Sitzungskennzeichen „Faktor“.
- **N-2 Chat-Actions ohne Schalter, Melden ohne Rate.** `src/server/actions/chat.ts:40` (`kontext()` prüft `chat` nicht – nur
  `sendeChatNachricht`), `:71` `meldeChatNachricht` ohne Begrenzung → beliebig viele Meldungen und Mails an Gruppenleitung und
  `kinderschutz`. Behebung: `chatAn()` in `kontext()`, Rate je Konto (z. B. 10/Stunde), Mails bündeln.
- **N-3 S-02 zählt gesperrte Leitungspersonen mit.** `src/lib/chat/dienst.ts:60`. Behebung: Join auf `user`, `gesperrtAm is null`.
- **N-4 Verwaltungskonten ohne TOTP dürfen „Mein Bereich“-Actions.** `src/lib/rechte/gemeinde.ts:31/68` kennt nur `lehrkraft`;
  `faktorPflicht` (`src/lib/konto/zugang.ts:30`) wird nicht zum Sperren genutzt. Behebung: `faktorFehlt = !zweiFaktorErfuellt && faktorPflicht(k)`.
- **N-5 Service Worker: `pfad` aus der Push-Nutzlast nur auf `startsWith('/')` geprüft** (`public/sw.js`, Push-Handler) –
  `//fremd.example` würde beim Tipp eine fremde Seite öffnen. Nur der eigene Server kann senden (VAPID); Härtung: `//` abweisen.
- **N-6 Kinderkonto bleibt nach Löschung der Lernenden bestehen.** `src/lib/loeschen/gemeinde.ts:33-36` löscht `lernende`,
  das Benutzerkonto des Kindes (`.invalid`, Rolle `schueler`) bleibt anmeldbar (FK `set null`). Behebung: Kinderkonten
  ohne Lernende im selben Lauf löschen (Datensparsamkeit).
- **N-7 Abmelden hängt am Schalter `konten`** (`src/server/actions/konto.ts:414-416`): bei ausgeschaltetem Schalter wirft
  `kontoAbmelden` vor `signOut`. Folgenarm (Seiten sind dann 404), aber Abmelden sollte immer gehen.

## Hinweise für kommende Pakete (heute ohne Schreibweg, daher kein Befund)
- `gruppen_leitung` (v. a. `aufsicht`) bei der Vergabe an Rolle `lehrkraft` mit TOTP binden; sonst Leitungsrechte ohne Faktor.
- `ladeGruppenKontext` (`gemeinde.ts`) und Export (`server/queries/konto.ts`) filtern `eltern_kind` nicht nach
  `bestaetigtAm`/`sorgeberechtigt`; der Export gibt entschlüsselte `angaben` aller verknüpften Kinder aus – bei der Aufnahme prüfen.
- Widerruf „kinderkonto“ hat noch keine Wirkung auf Anmeldung/Sitzungen des Kindes (kein Widerrufsweg gebaut).
- Funktional (kein Sicherheitsbefund): Kanalname `chat:<id>` liegt in Centrifugo im Namensraum `chat`, der in
  `betrieb/lokal/echtzeit/centrifugo.json` fehlt → Abo und Publish scheitern; der Abruf bleibt.
- Ohne `PROXY_VERTRAUEN=1` teilen alle Anfragenden einen Ratenzähler (Anmelde-DoS) – vor Freigabe `konten` sicherstellen.
- D-05: offene Meldungen verschwinden nach 12 Monaten automatisch (DSFA-Vorschlag, MN-21) – Kinderschutz-Sicht bei der Freigabe mitbedenken.

---

## Geprüft ohne Befund (kurz)
- **Better Auth:** HTTP-Sperren für `sign-up`, `sign-in/email|username`, `is-username-available`, `two-factor/*`, alle
  `passkey/*`, Passwort-Endpunkte und `update-user`; übrige offene Endpunkte unkritisch (`update-session` ohne Zusatzfelder,
  `change-email`/`delete-user`/`send-verification-email` aus, `verify-password` nur serverseitig); Zeitausgleich bei unbekanntem
  Konto; 2FA-Hook auch für `/sign-in/username`; 2FA-Kontosperre (10/15 min) mit Schema-Spalten; gesperrte Konten über
  `session.create.before`.
- **Registrierung/Bestätigung:** Rate → Honigtopf → ALTCHA (einmalig) → Zod; Anlage nach der Antwort (`after`), gleiche Antwort;
  3 Mails/Tag/Adresse; Token 256 Bit, nur SHA-256, einmalig, nur per POST.
- **Passwort vergessen/neu:** gleiche Antwort, `after`, `.invalid` und gesperrte Konten ausgenommen, Link 60 min, Sitzungen enden.
- **Einladung:** Token gehasht, atomar beansprucht, Rücknahme bei Fehler; Übernahme nur bei gleicher Adresse.
- **Kinderkonten:** Einwilligung „kinderkonto“ Pflicht, Benutzername nur serverseitig geprüft, `k-…@konto.invalid`,
  Mail-Ausgang weist `.invalid` ab; Kinder-Anmeldung nur per Action mit Rate je IP und Name.
- **Sitzungsgrenzen:** absolut ab `createdAt` (8 h/12 h/12 h/30 T) in `ladeAngemeldet`/`ladeKonto`, Widerruf bei Überschreitung.
- **Rücksprung `weiter`:** nur relative Konto-Pfade, kein `//`, kein `..` – keine offene Weiterleitung.
- **IDOR/Gruppenisolation:** Sitzungen/Passkeys nur eigene; Lernen-Dienst prüft Mitgliedschaft; Chat-Moderation, Melden, Stumm,
  Mitglied entfernen an `darfInGruppe`; Matrix: Schüler nur Gruppenkanal, Eltern nur Elternkanal, Fremde nichts.
- **Kinderschutz-Verwaltung:** Seiten und Actions über `verlangeSeitenRecht`/`verlangeRecht` mit `meldung.chat.*`,
  `moderationsprotokoll.lesen`; Kontext nur auf Klick und protokolliert; Hash-Kette unter Advisory-Lock; Trigger verbietet
  UPDATE/DELETE außer im Löschlauf; Kettenanker im Löschlauf korrekt; keine FKs, die den Trigger auslösen.
- **Gemeinde im Blick:** `leitung.lesen`, nur Zählungen, Schwelle „< 5“, Quote ab 20, Zeitraum aus Positivliste, parametrisiert.
- **D-11 (`sechzehn.ts`):** Lage/Übergang/eigene Einwilligung korrekt, ohne Datum vorsichtig „unter 16“ (Lesesperre siehe H-1).
- **Krypto:** AES-256-GCM (96-Bit-Zufalls-IV, Schlüssel-ID); Wartungs-Token konstantzeitig (SHA-256 + `timingSafeEqual`,
  ≥ 32 Zeichen, CRON nur GET, WARTUNG nur POST); RFC 8291/8292 korrekt (aes128gcm, ES256, `aud` = Origin, 12 h);
  Echtzeit-JWT HS256, 10 min, kanalgebundenes Abo-Token, Geheimnis ≥ 32 Zeichen.
- **SSRF Push:** nur `https`, ohne Port, Allowlist (FCM, Mozilla, Apple, WNS), ≤ 1024 Zeichen.
- **Push-Abo-API:** Sec-Fetch-Site, JSON-Content-Type (Preflight), ≤ 4 KB, Rate; Kinder nur mit `push_kind`; Nutzlast ohne Namen/Inhalt.
- **Datenschutz:** Chattext nur verschlüsselt, nie in Push/Mail/Audit; Meldungsmail ohne Inhalt, gemeldete Person ausgenommen;
  Export ohne Hash/TOTP/Token.
- **Injection/XSS:** `sql`-Vorlagen parametrisiert, kein `sql.raw` im Prüfumfang; kein `dangerouslySetInnerHTML` in Konto,
  Chat, Kinderschutz; Chattext als Text gerendert.
- **CSRF:** Server Actions (Origin-Prüfung), GET-Routen ohne Zustandsänderung und `no-store`.
- **Kopfzeilen/CSP:** Nonce-CSP mit `strict-dynamic` für Verwaltung und alle Konto-Segmente (de/tr/en), `wss://` nur Konto-Seiten,
  `noindex` + `private, no-store`; statische CSP öffentlich; Permissions-Policy je Pfad; `frame-ancestors 'none'`, HSTS bei HTTPS.
- **Statik/Caches:** keine Cookie-/Header-Lesungen außerhalb Konto/Verwaltung/API; `'use cache'` nur für Inhalte/Einstellungen;
  Service Worker hält keine Konto-Seiten und keine `/api/`-Antworten außer gespeichertem Koran vor.

---

## Behebung (Orchestrator, 13.10. 14:00 UTC)
| Befund | Umsetzung | Nachweis |
|---|---|---|
| H-1 | `leseGrund()` (regeln.ts) vor allen anderen Gründen; `ladeNachrichten` und `/api/mein/echtzeit` über `leseLage` | `chat.test.ts` „H-1 (S1)“: Fenster zu, nur Lehrkraft → keine Nachrichten |
| H-2 | Unbestätigtes Konto ohne Rolle wird bei erneuter Registrierung ersetzt; Bestätigung verlangt das gewählte Passwort; bei Bestätigung enden Sitzungen, Zwei-Faktor und Passkeys von vorher; Verwaltungsanmeldung sperrt unbestätigte Konten ohne Rolle | `konten.test.ts` „H-2“ |
| M-1 | `ladeKontoMitFaktor()` in Abruf-, Echtzeit- und Push-Route (+ Schalter `konten`) | Typen, Routen |
| M-2 | `kinderschutz` nie selbst, nie mit `administration`, sonst nur durch `leitung` | `verwaltung-benutzer.test.ts` „M-2“ |
| M-3 | Passkey-Anmeldung gesperrt für Verwaltung, Lehrkraft und Gruppenleitung | Code |
| M-4 | `gueltigeAboSchluessel()` beim Anlegen, Verschlüsselungsfehler → Abo entfernen, Fehler je Abo abgefangen | `push.test.ts` „M-4“ |
| N-1 | Nach TOTP-Einrichtung enden alle älteren Sitzungen | Code |
| N-2 | Chat-Schalter in allen Chat-Actions, Melden höchstens 10/Stunde | Code |
| N-3 | S-02 zählt gesperrte Leitungspersonen nicht | Code |
| N-4 | `faktorFehlt` = Lehrkraft, Gruppenleitung oder Verwaltungsrolle ohne Faktor | Code |
| N-5 | Service Worker: Push-Ziel nur eigene Pfade (kein `//`, kein `\`) | Code |
| N-6 | Löschlauf entfernt Kinderkonten ohne Lernende | `loeschen-gemeinde.test.ts` |
| N-7 | Abmelden ohne Schalterprüfung | Code |
Offen (Hinweis d zu H-2): Mail „Neuer Passkey/Zwei-Faktor eingerichtet“ – als Kür vorgemerkt.
Urteil nach Behebung: keine offenen Befunde „hoch“ oder „kritisch“.
