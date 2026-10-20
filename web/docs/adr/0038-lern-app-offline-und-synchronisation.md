# ADR 0038 – Lern-App: Offline zuerst und Synchronisation (Ereignisprotokoll, FSRS-Nachspielen)

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: vorgeschlagen (16.10.2026) (Lauf Lern-App); Nr. 1 folgt der Nutzerentscheidung „Platzierung“ (ohne Konto voll nutzbar, Fortschritt auf dem Gerät, offline; L3-E05) · Bezug: Plan „Lern-App“ Kontext („Verfeinerung“, Synchronisation), §1, §2.4; `_lernapp/PLAN.md` §3.7–3.9, §11, §13; Spike S6 · ersetzt die Zusammenführungsregel aus Plan §2.4 („Bestwert gewinnt, jüngstes `last_review` gewinnt“)

## Kontext

- Die Lern-App ist ohne Konto voll nutzbar. Fortschritt und Wiederholungskarten liegen auf dem Gerät, Einheiten sind offline spielbar (Nutzerentscheidung).
- Mit Konto sollen mehrere Geräte denselben Stand zeigen. Beide Geräte können offline lernen und später abgleichen.
- Die Wiederholung folgt der Vergessenskurve (FSRS). Ein FSRS-Zustand hängt von der Reihenfolge aller Bewertungen ab. Eine Regel „der jüngste Stand gewinnt“ verliert Bewertungen des anderen Geräts.
- Gerätezeiten können falsch sein. Serie und Tagesziel hängen am Lerntag in Ortszeit.
- Safari räumt den Speicher von Websites, die eine Woche nicht genutzt wurden; installierte PWAs sind ausgenommen. Private Fenster haben teils keine IndexedDB.
- Fortschritt im Wissenskurs gilt als Angabe zu religiösen Überzeugungen (Art. 9 DSGVO; Plan §2.2, Einwilligung `lernapp`). Kinder unter 16 brauchen die Einwilligung der Eltern (KERN 3.0).

## Entscheidung

1. **Lokal zuerst:** IndexedDB-Datenbank `igmg-lernapp` über `idb` (ISC), versionierte Migrationen in `web/src/lib/lernapp/lokal/db.ts`. Ohne Konto stellt die App nur GET-Anfragen an den eigenen Ursprung (Seiten, Pakete, Audio, Modelle). Einzige Ausnahme ist eine ausdrücklich ausgelöste anonyme Meldung (ADR 0041 Nr. 9).

   | Speicher                         | Schlüssel             | Inhalt                                                                                                                   |
   | -------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------ |
   | `profile`                        | id                    | Lernprofile auf dem Gerät (mehrere je Familiengerät, ohne Passwort), Oberflächensprache, `benutzerId` nach der Anmeldung |
   | `ereignisse`                     | [profil, geraet, seq] | **Wahrheit**, nur anhängen; Indizes [profil, am] und [profil, synchron]                                                  |
   | `karten`                         | [profil, karte]       | abgeleitet: FSRS-Zustand, Index [profil, faellig]                                                                        |
   | `lektionen`, `tage`, `abzeichen` | je Profil             | abgeleitet                                                                                                               |
   | `einstellungen`                  | [profil, schluessel]  | Register „letzter Schreiber gewinnt“ nach (am, geraet)                                                                   |
   | `pakete`                         | [kurs, einheit]       | Hash, Bytes, offline ja/nein; der Inhalt liegt im Cache Storage (ADR 0039)                                               |
   | `sync`                           | profil                | Zeiger des Servers, letzter Abgleich                                                                                     |

2. **Ereignisse:** `{ geraet, seq, am, tag, art, daten }`.
   - `geraet` ist eine UUID je Gerät und Profil, `seq` zählt je Gerät fortlaufend.
   - `am` ist die Gerätezeit (ISO), `tag` der Lerntag `JJJJ-MM-TT` in Ortszeit des Geräts.
   - `art`: `bewertung`, `lektion`, `xp`, `pause`, `einstellung`, `einstufung`, `tagesziel`; `daten` je Art mit eigenem Zod-Schema (`web/src/lib/lernapp/ereignisse/typen.ts`).
   - Abgeleitete Speicher entstehen durch reine Funktionen (`ableiten.ts`, `serie.ts`, `abzeichen.ts`). Ändert sich die Ableitung, erhöht sich `ableitungsVersion`, und alles wird aus den Ereignissen neu berechnet.
3. **Wiederholung:** `ts-fsrs` (MIT, Reihe 5.x; 6.0 ist Beta).
   - Bewertungen werden nach (am, geraet, seq) sortiert nachgespielt. Die Parameterversion ist festgehalten; der Zufallsanteil („Fuzz“) ist aus oder mit festem Startwert je Karte. So entsteht auf jedem Gerät derselbe Zustand.
   - Abbildung: richtig im ersten Versuch → Good; mit Tippfehler oder Hinweis → Hard; falsch → Again. Kein „Easy“. Selbstbewertung gibt es nur bei Sprechen und Schreiben (ADR 0042).
4. **Zusammenführung:**

   | Zustand                         | Regel                                                                        |
   | ------------------------------- | ---------------------------------------------------------------------------- |
   | Ereignisse                      | Vereinigung über (benutzer, geraet, seq): idempotent, kommutativ, assoziativ |
   | Wiederholungskarte              | Nachspielen nach Nr. 3                                                       |
   | Lektion erledigt, beste Quote   | Vereinigung bzw. Maximum                                                     |
   | XP, Tagesziel, Serie, Abzeichen | aus den Ereignissen abgeleitet                                               |
   | Einstellungen                   | „letzter Schreiber gewinnt“ nach (am, geraet)                                |

5. **Abgleich** `POST /api/lernapp/sync` mit `{ geraet, cursor, ereignisse }`:
   - höchstens 500 Ereignisse und 256 KB je Anfrage
   - Voraussetzungen: Sitzung, Schalter `lernapp_sync` (ADR 0035), Einwilligung `lernapp`, gleicher Ursprung, Zod-Prüfung; sonst 404 bzw. Fehler
   - Schreiben mit `ON CONFLICT DO NOTHING`; der Server erneuert den Kartenstand der betroffenen Karten mit **derselben** reinen Ableitung
   - erledigte Zuweisungen setzen `aufgabe_erledigt`, wenn das Konto mit `lernende` in der Gruppe verbunden ist (Zuweisung als `aufgabe` mit `bezug = { art: 'lernapp', … }`, `_lernapp/PLAN.md` §3.9)
   - Antwort: fremde Ereignisse nach dem Zeiger (höchstens 2.000, mit `mehr`) und der neue Zeiger
   - Bremse: 30 Anfragen je Minute und Konto
   - Der Service Worker hält `/api/**` nie vor.
6. **Uhrzeit:** Der Server klemmt `am` auf höchstens Empfangszeit + 5 Minuten. Serie und Tagesziel rechnen mit `tag`.
7. **Erste Anmeldung:** Die App fragt: „Lokalen Fortschritt in dein Konto übernehmen?“ Ein Profil gehört zu genau einem Konto.
8. **Ohne Konto sichern:** Export und Import als JSON-Datei (auch für den Gerätewechsel und Art. 20 DSGVO). Ohne IndexedDB läuft ein Speicher im Arbeitsspeicher, mit Hinweis, dass nichts bleibt.
9. **Speicherschutz:** `navigator.storage.persist()` erst beim bewussten „Stufe offline speichern“ (ADR 0039); die Belegung zeigt `storage.estimate()`. Auf iOS empfiehlt die App die Installation.
10. **Server-Tabellen** (eigene Migration): `lernapp_profil`, `lernapp_ereignis` (eindeutig über benutzerId, geraet, seq; fortlaufende id als Zeiger), `lernapp_karte` (Kartenstand), `lernapp_tag` (für die Gruppenwoche).
    - Ereignisse älter als 12 Monate werden in den Kartenstand gefaltet.
    - Löschung 12 Monate nach der letzten Aktivität und mit dem Konto (Löschlauf `web/src/lib/loeschen/gemeinde.ts`); Export nach Art. 20.
    - Kinderkonten gleichen nur mit der Einwilligung `lernapp` ab, die die Eltern erteilen.

## Fortschreibung durch Spike S6 (16.10.2026, Beleg `_lernapp/belege/S1-S6-wurzel-layout-und-sw.md`)

1. **Nr. 1 bestätigt:** `idb` trägt zusammengesetzte Schlüssel und Indizes, `put` ist idempotent, der Stand bleibt über Neuladen erhalten. Version exakt 8.0.3, ab 20.10.2026 8.0.4 (L0-E10).
2. IndexedDB gilt je Ursprung, nicht je Scope des Service Workers. Der Name `igmg-lernapp` trennt die Lern-App sauber von der Website.
3. **Tests:** Unit-Tests der lokalen Datenhaltung mit `fake-indexeddb` (Apache-2.0, nur Entwicklung). E2E für Offline: siehe ADR 0037, Fortschreibung Nr. 7.

## Fortschreibung nach der Sicherheitsprüfung S-L1 (20.10.2026, `_lernapp/berichte/s-l1.md` M-1, M-2)

1. **Kontobindung auf dem Server:** Die Anfrage nennt das Konto, an das das Profil gebunden ist (`konto`). Weicht es vom
   Konto der Sitzung ab, antwortet `/api/lernapp/sync` mit 409 `konto` und schreibt nichts. Der Client ruht dann und zeigt in
   den Einstellungen die Bindungsfrage. Zusätzlich prüft die Oberfläche die Sitzung einmal je Seitenaufruf vor dem ersten
   Abgleich, auch vor dem ersten Abgleich nach einer Handlung (die Sperre von 60 s gilt nur noch für den Abgleich selbst).
2. **Grenzen je Konto** (`GRENZEN` in `src/lib/lernapp/sync/protokoll.ts`): höchstens 200.000 gespeicherte Ereignisse,
   20.000 neue in 24 Stunden und 50 Geräte; darüber 429 `grenze` ohne zu schreiben. Eine Folgenummer mehr als 50.000 über der
   höchsten gespeicherten ihres Geräts wird abgelehnt.
3. **Kein Nachspielen des ganzen Protokolls:** Die Lerntage werden nur aus den Ereignissen der berührten Tage abgeleitet
   (Lektionen und XP dieser Tage, das letzte Tagesziel davor und die Ziele im Bereich, Pausen der berührten Jahre). Erledigte
   Zuweisungen lesen nur die Lektionen der offenen Zuweisungen. Die Abgleich-Transaktion hat `statement_timeout` 15 s.

## Alternativen

- „Bestwert gewinnt“ und „jüngstes `last_review` gewinnt“ (Plan §2.4): verworfen. Lernen zwei Geräte offline, gehen Bewertungen eines Geräts verloren, und der Kartenstand hängt von der Reihenfolge des Abgleichs ab.
- Server als einzige Wahrheit: verworfen. Die App muss ohne Konto und ohne Netz voll funktionieren.
- Fertige CRDT-Bibliothek: nicht nötig. Die Vereinigung von Ereignissen mit eindeutigem Schlüssel ist schon konfliktfrei.
- Dexie (Apache-2.0, ≈ 30 KB) statt `idb` (≈ 1–2 KB): nicht gewählt, wegen des JS-Budgets.
- `localStorage`: verworfen (zu klein, blockiert den Hauptfaden).

## Folgen

- Tests:
  - Unit: `zusammenfuehren` mit Eigenschaftstests (idempotent, kommutativ, assoziativ; Register; Uhrzeit-Klemme; Serie mit Pausetagen über Tages- und Sommerzeitgrenzen), `srs` (Nachspielen deterministisch, Parameterversion).
  - Integration: Anmeldung, Einwilligung, Schalter aus ergibt 404, Trennung zwischen Konten, Idempotenz, Zeiger-Seiten, Bremse.
  - E2E: Lektion offline; zwei Browser-Kontexte bewerten dieselbe Karte unterschiedlich und zeigen nach dem Abgleich denselben Kartenstand; Netzprotokoll ohne Konto nur GET an den eigenen Ursprung (außer der ausgelösten Meldung).
- Versionen nach Mindestreife (Lizenzbericht L0-E10): `idb` 8.0.3, ab 20.10.2026 8.0.4; `ts-fsrs` 5.4.2; exakt gepinnt.
- Schalter `lernapp_sync` (Personendaten): in der Produktion aus bis zum DSFA-Nachtrag und dem Einwilligungstext `lernapp` (LM-08).
- Ein Wechsel der FSRS-Parameter ist eine neue Parameterversion mit Neuberechnung, kein stilles Update.
- Abnahme: Z-L04 (offline), Z-L05 (Abgleich deterministisch), Z-L08 (ohne Konto nur eigener Ursprung, kein POST ohne ausdrückliche Handlung).
