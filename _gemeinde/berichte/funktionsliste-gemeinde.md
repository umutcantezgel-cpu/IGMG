# Funktionsliste der Gemeinde-Plattform: F-25 … F-60 (Nacharbeit Stufe C, Z-02)

Stand 15.10.2026, Paket N3; die Zeilen F-28, F-29, F-35, F-36, F-39, F-45 und der E2E-Stand sind am 16.10.2026 nach
Nacharbeit 2 (echte E2E) und Nacharbeit 3 nachgeführt (Endprüfung `berichte/stufe-c-nachpruefung-2.md`, Z-10).
`ABNAHME.md` bleibt unverändert; diese Datei holt nach, was `AUFTRAG.md:506` als Ergebnis von E0 verlangt hatte
(„LAGEBILD v2, Funktionsliste F-01…F-60“) und was laut Stufe C nie definiert wurde (`berichte/stufe-c.md`, Nachprüfung 11;
`protokolle/C-k3-protokoll-k3.md`, Z-02).

## Wie die Liste gebaut ist

- **F-01 … F-24** sind die Bestandsfunktionen des Vorlaufs (`_archiv/lauf-gestaltung-2026-10/LAGEBILD.md` §3). Das Werkzeug
  `_gemeinde/werkzeuge/funktionsliste.mjs` prüft sie im Browser. Für F-02 (kompakte Leiste auf dem Telefon), F-03 (fünf Tabs mit
  „Mein Ort“, nachgeladene Monatstabelle und Kompass) und F-08 (Kopf „{Name} ist eröffnet“) sind die Erwartungen in diesem Paket
  nach `protokolle/C-k3-funktionsliste-3100.md` nachgeführt (siehe unten).
- **F-25 … F-60** ordnen den **Funktionskatalog** des Auftrags (`AUFTRAG.md:85-114`) zu, in der Reihenfolge des Katalogs:
  Pflicht F-25 … F-45, Kür A F-46 … F-53, Kür B F-54 … F-60. Zusammengesetzte Pflichtzeilen sind dort geteilt, wo ein Teil fehlt
  (Push und Rückfall; CMS und Startseite/Islamisches Wissen). Die vier Kür-B-Funktionen ohne Oberfläche stehen gemeinsam in F-60.
- **Beleg:** Route bzw. Ort im Code und der Test, der die Funktion prüft. Für F-25 … F-60 gibt es kein Browser-Werkzeug; der
  Nachweis „ohne Rückschritt“ läuft über die Suiten (Unit, Integration, E2E). Grundlage der Zuordnung ist die Stichprobe des
  Prüfers k3 (`protokolle/C-k3-protokoll-k3.md`, Z-01), ergänzt um die Änderungen dieses Pakets.
- **Stand:** *erfüllt* (Oberfläche und Test vorhanden), *teilweise* (Teil fehlt, benannt), *offen* (nicht gebaut),
  *nur Code* (gebaut, aber nur mit Daten oder Rechten der Gemeinde vorführbar). Spalte **Schalter**: Funktionsschalter (ADR 0035);
  in der Produktion sind alle Schalter mit Personendaten aus, bis Menschen freigeben (MENSCHEN).

## Pflicht (P)

| F | Funktion (AUFTRAG) | Route / Ort | Testbeleg | Stand | Schalter |
|---|---|---|---|---|---|
| F-25 | Koran-Leser: Text, Übersetzungen, Lesemodi, Lesezeichen lokal, Cüz-Seiten, Druck (`:87`) | `/quran`, `/quran/[sure]`, `/quran/cuz/[nr]`; `components/website/quran/QuranLeser.tsx`, `quran.css` (`@media print`) | `tests/unit/quran-leser.test.ts`, `tests/unit/quran-daten.test.ts`, `tests/integration/quran.test.ts`, `tests/e2e/quran-leser.spec.ts`, `tests/e2e/quran.spec.ts` | erfüllt (Übersetzungen erst nach Freigabe, MN-02) | – |
| F-26 | Wortkarte + Werkstatt Wortbedeutungen mit Freigabe (`:88`) | Wortkarte `website/quran/Wortkarte.tsx`; `/verwaltung/koran/woerter/[sure]/[form]` | `tests/integration/verwaltung-koran.test.ts`, `tests/unit/religioese-freigabe.test.ts` | erfüllt (Bedeutungen von Menschen, MN-05) | – |
| F-27 | Tajwid: Farbe + Unterstreichung, Regel-Leiste, Regeltexte (`:89`) | `TajwidLeiste.tsx`, `/quran/tajwid`, `/verwaltung/koran/tajwid/[schluessel]` | `tests/unit/quran-daten.test.ts`, `tests/integration/verwaltung-koran.test.ts`, `tests/e2e/quran-leser.spec.ts` | erfüllt (Regeltexte nach Freigabe, MN-04) | – |
| F-28 | Rezitations-Player: jede Rezitation, Vers/Wort, Wiederholen, Tempo (`:90`) | `website/quran/Player.tsx`; Auslieferung `/audio/[...pfad]` (L2-E06) | `tests/e2e/quran-leser.spec.ts`, `tests/e2e/quran-player.spec.ts` (Testton, 7 Fälle), `tests/integration/verwaltung-rezitationen.test.ts` (Auslieferung, Byte-Bereiche) | nur Code (keine aktive Rezitation bis MN-03); Player-E2E mit Testton seit Nacharbeit 2 echt gelaufen, 7/7 grün (Z-16) | – |
| F-29 | Rezitations-Werkstatt: Aufnahme/Upload, Versgrenzen aus Stille, Mitklopfen (`:91`) | `/verwaltung/rezitationen/[id]/abgleich/[sure]`; `lib/audio/abgleich.ts`, `Mitklopfen.tsx` | `tests/unit/audio-abgleich.test.ts`, `tests/unit/rezitation-werkstatt.test.ts`, `tests/integration/verwaltung-rezitationen.test.ts`, `tests/e2e/verwaltung-rezitationen.spec.ts` | erfüllt (E2E echt gelaufen, 2/2 grün, Nacharbeit 2; Z-16) | – |
| F-30 | Import lizenzierter Gesamtrezitation + quran-align (`:92`) | `scripts/rezitation-import.ts`, `lib/audio/import.ts` | `tests/unit/rezitation-manifest.test.ts` | nur Code (MN-03b) | – |
| F-31 | Hadith Bukhari: 97 Bücher, Kapitel, Bezüge, Bewertung, Auswahl, Suche (`:93`) | `/hadith`, `/hadith/bukhari/[buch]/teil/[teil]`, `/hadith/auswahl`, `/suche` | `tests/integration/hadith.test.ts`, `tests/unit/hadith-anzeige.test.ts`, `tests/e2e/hadith.spec.ts` | erfüllt | `hadith_gesamt` (Produktion an, Nutzerentscheidung 13.10.) |
| F-32 | Elifbe: 28 Buchstaben + Hamza, Formen, Lektionen, Übungen, Schreibweg; Hub `/lernen` (`:94`) | `/elifbe`, `/elifbe/buchstaben/[buchstabe]`, `/elifbe/lektion/[lektion]`, `/elifbe/ueben`, `/lernen` | `tests/unit/elifbe-alphabet.test.ts`, `tests/unit/elifbe-schreibweg.test.ts`, `tests/unit/elifbe-uebung.test.ts`, `tests/integration/elifbe.test.ts`, `tests/e2e/elifbe.spec.ts` | erfüllt (Lektionstexte von der Hoca, MN-07) | – |
| F-33 | Gebetszeiten „Mein Ort“, Qibla am Standort (`:95`) | `/gebetszeiten` (Tab „Mein Ort“, „Qibla“); `MeinOrtRechner.tsx`, `QiblaKompass*.tsx` | `tests/unit/gebetszeiten-ort.test.ts`, `tests/unit/gebetszeiten/qibla.test.ts`, `tests/e2e/gebetszeiten-mein-ort.spec.ts`; F-03 | erfüllt | – |
| F-34 | Konten Gemeinde/Eltern/Lehrkraft/Schüler (Kind < 16 mit Benutzername), Mein Bereich (`:96`) | `/anmelden`, `/registrieren`, `/mein-bereich/*`; `lib/konto/benutzername.ts` | `tests/integration/konten.test.ts`, `tests/integration/datenschutz-konten.test.ts`, `tests/unit/sechzehn.test.ts`, `tests/unit/konto-regeln.test.ts`, `tests/e2e/konten.spec.ts` | erfüllt | `konten` |
| F-35 | Lernplattform: Gruppen, Aufnahme aus Voranmeldung, Anwesenheit, Fortschritt, Hifz, Eltern (`:97`) | `/verwaltung/gruppen`, `/verwaltung/lernende`, `/mein-bereich/unterricht/*`, `/mein-bereich/kinder/[id]` | `tests/integration/verwaltung-aufnahme.test.ts`, `tests/integration/verwaltung-lernen.test.ts`, `tests/integration/mein-bereich-lernen.test.ts`, `tests/integration/lernen.test.ts`, `tests/integration/lernkette.test.ts`, `tests/e2e/mein-bereich-lernen.spec.ts`, `tests/e2e/lernkette.spec.ts`, `tests/e2e/verwaltung-lernen.spec.ts` | erfüllt (Kette Voranmeldung → Aufnahme → Eltern → Kind → Anwesenheit → Fortschritt im Browser echt grün; Fortschritt seit Nacharbeit 3 in `lernkette.spec.ts`, Z-17) | `lernplattform` |
| F-36 | Moderierter Gruppen- und Elternkanal (S-01 … S-18) (`:98`) | `/mein-bereich/gruppen/[id]/chat`, `/mein-bereich/unterricht/[gruppe]/moderation`, `/verwaltung/kinderschutz`, `api/mein/chat/[kanal]` | `tests/integration/chat.test.ts`, `tests/unit/chat-regeln.test.ts`, `tests/integration/verwaltung-kinderschutz.test.ts`, `tests/e2e/chat.spec.ts` (Leitung und Kind in zwei Browsern), `tests/e2e/zugaenglichkeit-gemeinde.spec.ts` | erfüllt (E2E mit zwei Browsern echt gelaufen, Nacharbeit 2; Kind-Senden nur im Chatfenster 08–20 Uhr, S-05) | `chat`, `echtzeit` |
| F-37 | Web Push opt-in, vier Themen Gebet, Ankündigung, Chat, Unterricht (`:99`) | `/gebetszeiten` (Gebet, Ankündigung), `/mein-bereich/benachrichtigungen`; Versand `lib/push/abo.ts` (Takt), `lib/push/ankuendigung.ts` (neu in N3), `lib/push/gruppe.ts` | `tests/unit/push.test.ts`, `tests/integration/push.test.ts`, `tests/integration/push-ankuendigung.test.ts`, `tests/integration/mein-bereich-lernen.test.ts` (Gruppen-Push) | erfüllt (echte Zustellung: Umgebungsausnahme ohne VAPID, Z-19) | `push`, `push_gebet` |
| F-38 | Push-Rückfall: Mail-Zusammenfassung ohne Inhalt, In-Seite-Benachrichtigung (`:99`, ADR 0034 Nr. 6) | `/mein-bereich/benachrichtigungen` (Abschnitte „Zusammenfassung per E-Mail“ und „Hinweis in Mein Bereich“), Insel `NeuesHinweis` in jeder Seite von Mein Bereich, `api/mein/neues`, Planung im Cron `api/wartung/mail-ausgang`; `lib/push/{rueckfall,neues,zusammenfassung,zusammenfassung-mail}.ts`, Mail-Vorlage `lib/mail/vorlagen/zusammenfassung.tsx`, Migration `0016_mail_zusammenfassung` | `tests/integration/push-zusammenfassung.test.ts`, `tests/unit/push-rueckfall.test.ts`; Bilder `scratchpad/na2-p2/` (Nacharbeit 2, P2) | erfüllt (Nacharbeit 2, P2; echte Zustellung erst mit SMTP, MN-00; Handbücher Eltern/Lehrkräfte nachgeführt) | `push` (Chat zusätzlich `chat` und `lernplattform`, Unterricht `lernplattform`) |
| F-39 | CMS: freie Seiten mit Bausteinen, Menüs, Revisionen, Zeitplan, Weiterleitungen, Freigaben (`:100`) | `[locale]/[...rest]`, `/verwaltung/seiten/*`, `/verwaltung/menues`, `/verwaltung/weiterleitungen`, `/verwaltung/freigaben`, `/verwaltung/vorschau/[token]` | `tests/integration/verwaltung-cms.test.ts`, `tests/unit/cms-bloecke.test.ts`, `tests/unit/cms-adressen.test.ts`, `tests/e2e/cms.spec.ts`, `tests/e2e/verwaltung-reihenfolge.spec.ts` | erfüllt (E2E echt; „Frühere Fassungen“ stürzte ab, sobald es eine Fassung gab – in Nacharbeit 3 behoben, `cms.spec.ts` prüft Ansehen und Zurückholen bis zur Website; Zeitplan und Seiten-Freigabe nur in der Prüfer-Spec der Nachprüfung 2, Z-18) | – |
| F-40 | CMS: Startseiten-Abschnitte sortierbar, „Islamisches Wissen“ pflegen (`:100`) | `/verwaltung/startseite` (Einstellung `startseite`, öffentlich `server/queries/startseite.ts`, Tag `startseite`, Rückfall Bestand); `/verwaltung/wissen`, `/verwaltung/wissen/[id]`, `…/[id]/revisionen`, Freigabe über `/verwaltung/freigaben` (Typ `wissen_thema`, Vier-Augen); Migration 0015 (Bestand geprüft mit Vermerk) | `tests/integration/verwaltung-startseite.test.ts`, `tests/integration/verwaltung-wissen.test.ts`, `tests/unit/startseite-abschnitte.test.ts`, `tests/unit/wissen-pflege.test.ts`, `tests/integration/verwaltung/rechte-matrix-gemeinde.test.ts` (Startseite, Wissen), `tests/e2e/cms.spec.ts` (ohne Anmeldung → Anmeldung) | erfüllt (Nacharbeit 2, P1; Startseite statisch „○“, JS laut Bauausgabe unverändert 156,0 kB gzip; Bestand „nicht einzeln geprüft“ bis zur Durchsicht durch die religiöse Prüfung, MN-20/MN-24) | – |
| F-41 | Bildschirm-Anzeige per CMS: Folien, Iqama, Freitagsmodus, Ruhephase (`:101`) | `/gebetszeiten/anzeige`, `/verwaltung/anzeige/*`, `api/anzeige`; `AnzeigeLive.tsx` (B-25) | `tests/unit/anzeige-plan.test.ts`, `tests/unit/anzeige-folien.test.ts`, `tests/integration/verwaltung-anzeige.test.ts`; F-04 | erfüllt (Iqama nach MN-14) | – |
| F-42 | Moschee 2026 „fertiggestellt“: Seeds, Inhaltsmigration, Texte, Cockpit (`:102`) | `/`, `/projekte`, `/ueber-uns`; `drizzle/seeds/bereiche/projekte.ts`, `lib/inhalt/stand-2026.ts`, `lib/startklar/pruefungen.ts` | `tests/unit/inhalte-2026.test.ts`, `tests/integration/inhalte-2026.test.ts`; F-08 | erfüllt (Fakten als Platzhalter, MN-08) | – |
| F-43 | `/barrierefreiheit`, `/quellen` (`:103`) | `/barrierefreiheit`, `/quellen` | `tests/e2e/barrierefreiheit.spec.ts` | erfüllt | – |
| F-44 | Bestandslücken: Einwilligung für Personenfotos (K-29), Voranmeldung ↔ Kurs (`:104`) | `/verwaltung/medien` (Haken „Personen erkennbar“); Kurskarte und „Jetzt anmelden“ auf `/bildung/korankurse` („Für diesen Kurs voranmelden“, `?kurs=<slug>`), `/bildung/voranmeldung` (statisch; `KursWahl` liest den Kurs im Browser), Kurs als `eingang.bezug_id`; Verwaltung: Eingang (Liste, Kopf, Detail, Export) und Aufnahme `components/verwaltung/lernen/AufnahmeKarte.tsx` mit Kurs und vorbelegter Gruppe | `tests/integration/verwaltung-medien.test.ts`, `tests/integration/formular-voranmeldung.test.ts`, `tests/integration/verwaltung-aufnahme.test.ts`, `tests/unit/kurs-wahl.test.tsx`, `tests/unit/lernen-verwaltung.test.ts` | erfüllt (Nacharbeit 2, P2) | – |
| F-45 | Lokaler-Server-Kit: Sicherung, Medienspiegel, Takt, Überwachung, Kiosk (`:105`) | `betrieb/lokal/*` (Echtzeit-Profil mit Namensraum `chat`, N3) | `tests/integration/startklar.test.ts` (Meldungen des Servers), `tests/integration/push.test.ts` (lokal-meldung), `tests/unit/echtzeit.test.ts` (Kit-Datei), `betrieb/lokal/echtzeit/pruefen.mjs` | erfüllt (Wiederherstellungsprobe mit den unveränderten Skripten ohne Docker echt gelaufen: Wiederherstellen rc=0, Probe ok, 5/5 Fehlerfälle erkannt, `protokolle/NA2-P4-e2e-echt-protokoll.md` §4; auf dem lokalen Server mit PostgreSQL 17 offen, MN-12/MN-18, Z-20) | – |

## Kür A (K-A)

| F | Funktion (AUFTRAG) | Route / Ort | Testbeleg | Stand | Schalter |
|---|---|---|---|---|---|
| F-46 | Ramadan-Modus: Imsakiye, Fastenbogen, Teravih (`:106`) | `/ramadan`; Startseite mit Fastenbogen B-20 | `tests/e2e/kuer.spec.ts` (Ramadan), `tests/unit/startbogen.test.ts` | erfüllt | `ramadan_vorschau` (Vorschau außerhalb des Ramadan) |
| F-47 | Gemeinsame Hatim: 30 Cüz verteilen, Ring (`:107`) | `/hatim`, `/hatim/[id]`, `/verwaltung/hatim` | `tests/integration/hatim.test.ts`, `tests/integration/verwaltung-hatim.test.ts`, `tests/e2e/kuer.spec.ts` | erfüllt | `hatim` |
| F-48 | Islamischer Kalender, Kandil/Bayram bestätigt, iCal (`:108`) | `/kalender`, `api/ical/*`, `/verwaltung/besondere-tage` | `tests/unit/kalender-ical.test.ts`, `tests/unit/kalender-raster.test.ts`, `tests/unit/besondere-tage.test.ts`, `tests/integration/verwaltung-besondere-tage.test.ts`, `tests/e2e/kuer.spec.ts` | erfüllt (Bestätigung MN-15) | – |
| F-49 | Spenden per GiroCode (`:109`) | `/spenden`, `/verwaltung/einstellungen` (Spenden) | `tests/unit/girocode.test.ts`, `tests/unit/spenden-einstellung.test.ts`, `tests/e2e/kuer.spec.ts` | erfüllt (Bankdaten MN-13) | – |
| F-50 | Leitungs-Cockpit „Gemeinde im Blick“ (< 5, Druckbericht) (`:110`) | `/verwaltung/gemeinde-im-blick`; `lib/leitung/kennzahlen.ts` | `tests/integration/leitung.test.ts` | erfüllt | – |
| F-51 | Vers/Hadith des Tages aus freigegebenen Listen (`:111`) | `/verwaltung/koran/des-tages`, Startseite | `tests/integration/verwaltung-anzeige.test.ts` („Vers des Tages“) | erfüllt | – |
| F-52 | Offline-Koran: Sure/Cüz speichern, Audio Cüz 30 (`:112`) | `/quran/*` „Offline speichern“; `OfflineSpeichern.tsx`, `public/sw.js` | `tests/e2e/quran-offline.spec.ts` | erfüllt (Audio erst mit aktiver Rezitation) | – |
| F-53 | Echtzeit über Centrifugo, nur Signal (`:113`) | `api/mein/echtzeit`; `lib/echtzeit/centrifugo.ts`; `betrieb/lokal/echtzeit` | `tests/unit/echtzeit.test.ts`, `betrieb/lokal/echtzeit/pruefen.mjs` (am 15.10. 8/8 gegen Centrifugo v6.5.1) | erfüllt (Betrieb braucht DynDNS, MN-12) | `echtzeit` |

## Kür B (K-B, `:114`)

| F | Funktion (AUFTRAG) | Route / Ort | Testbeleg | Stand | Schalter |
|---|---|---|---|---|---|
| F-54 | Newsletter mit Double-Opt-in | `/newsletter`, `/verwaltung/newsletter` | `tests/integration/newsletter.test.ts`, `tests/integration/newsletter-anmeldung.test.ts`, `tests/e2e/kuer.spec.ts` | erfüllt | `newsletter` |
| F-55 | Hifz-Modus | `/mein-bereich/unterricht/[gruppe]/fortschritt` („Hifz eintragen“); `unterricht/HifzEintragen.tsx` | `tests/integration/mein-bereich-lernen.test.ts`, `tests/integration/lernen.test.ts` | erfüllt | `lernplattform` |
| F-56 | Moscheeführung anfragen | `MoscheeAnfrageFormular.tsx` (Bestand) | `tests/integration/formular-moschee-anfrage.test.ts`, `tests/e2e/formular-moschee-anfrage.spec.ts` | erfüllt | – |
| F-57 | Passkey-Oberfläche | `PasskeyHinzufuegen.tsx`, `PasskeyAnmelden.tsx` | `tests/integration/konten.test.ts`, `tests/integration/verwaltung-benutzer.test.ts`, `tests/e2e/konten.spec.ts` | erfüllt | `konten` |
| F-58 | Zugangskarte für Kinder | `/mein-bereich/kinder/[id]` („Zugangskarte drucken“); `components/kinder/Kinderzugang.tsx` | `tests/integration/mein-bereich-lernen.test.ts` (Kinderzugang) | erfüllt | `konten`, `lernplattform` |
| F-59 | Schriftgröße für Ältere | nur im Koran-Leser (Stufen 1–5, `QuranLeser.tsx`) | `tests/unit/quran-leser.test.ts` | teilweise (nicht seitenweit) | – |
| F-60 | QR-Check-in, Ehrenamt-Dienstplan, Urkunden mit Prüfcode, Hausaufgaben | nur Datenmodell: `schema/eingaenge.ts` (`checkinHash`), `schema/gemeinde.ts`, `schema/lernen.ts` | – | **offen** (keine Oberfläche; K-B entfällt laut Risikoplan zuerst) | – |

## Testlauf der Belege (15.10.2026, Arbeitsbaum N3)

- Unit vollständig: 94 Dateien, **1440 grün + 3 erwartet fehlgeschlagen** (`vitest run --project unit`).
- Integration gezielt (die 32 in den Tabellen genannten Integrationsdateien samt `verwaltung/rechte-matrix` und
  `verwaltung/startklar-aktion`): **1253 grün + 2 erwartet fehlgeschlagen**, 0 rot. Log im Scratchpad `n3/integration-n3.log`.
- E2E am 15.10. nicht gelaufen (Docker/Mailpit fehlten). Seit Nacharbeit 2 laufen sie echt gegen den Standalone-Bau mit
  PostgreSQL 16 und Mailpit (`web/tests/e2e/LIESMICH.md`): Tor 90a8e37 **983 grün, 0 rot**, 95 übersprungen
  (`protokolle/NA2-P4-e2e-lauf-3-je-spec.md`). Nacharbeit 3 (16.10., 14:11 Uhr Berlin, im Chatfenster): `cms`,
  `verwaltung-reihenfolge` (neu), `lernkette`, `mein-bereich-lernen`, `zugaenglichkeit-gemeinde`, `verwaltung-lernen`,
  `formular-voranmeldung` – **23 grün, 0 rot, 0 flaky**, 7 übersprungen (Abläufe mit Anmeldung nur im Projekt „desktop“).

## Zählung

- Pflicht F-25 … F-45 (21): erfüllt 19, nur Code 2 (F-28, F-30); F-40 ist mit Nacharbeit 2, P1 erfüllt, F-38 und F-44 mit
  Nacharbeit 2, P2 (vorher „offen“ bzw. „teilweise“); F-37 ist mit N3 erfüllt (vorher „teilweise“, Stufe C Nachprüfung 5).
- Kür A F-46 … F-53 (8): erfüllt 8.
- Kür B F-54 … F-60 (7): erfüllt 5, teilweise 1 (F-59), offen 1 (F-60).

## Nachgeführte Erwartungen für F-01 … F-24 (`_gemeinde/werkzeuge/funktionsliste.mjs`)

Lauf am 15.10.2026 gegen den laufenden Server 3100 (nur gelesen, `--nur F-02,F-03,F-08`); Protokoll im Scratchpad
`n3/funktionsliste-n3.md`:

| F | Änderung | Ergebnis 390 / 1440 |
|---|---|---|
| F-02 | Kompakte Leiste ohne Aufklappknopf (z. B. `/projekte`): geprüft wird der Link „Alle Gebetszeiten“ direkt | erfüllt / erfüllt (vorher nicht prüfbar / erfüllt) |
| F-03 | Fünf Tabs mit „Mein Ort“; Pfeil rechts → „Mein Ort“, zweimal → „Monatlich“; Warten auf die nachgeladene Monatstabelle und den Kompass | nicht prüfbar / nicht prüfbar (vorher nicht erfüllt) – alle Teilprüfungen erfüllt; „Monat wechselt“ bleibt offene Frage wie im Vorlauf (es gibt kein Bedienelement, die Tabelle zeigt laufenden und nächsten Monat) |
| F-08 | `/projekte`: Kopf „{Name} ist eröffnet“ (Z-21) zählt neben dem allgemeinen Titel | erfüllt / erfüllt (vorher nicht erfüllt) |
