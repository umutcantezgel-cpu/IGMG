# Plan „Gemeinde-Plattform“ – IGMG Wetzlar von 0 auf 100 (Lauf über 7 Tage)

> **Änderung 13.10. (Nutzer):** Kein Warten, keine Startprüfung, kein Anhalten. Der Plan wird **sofort** und ohne Unterbrechung von E0 bis E7 abgearbeitet.
> - Die geplante Prüfung `trig_01SaGbiCUMd2FmSB9k1bQMfT` wird gelöscht.
> - Prüfstufen sind Arbeitsschritte im Fluss, keine Haltepunkte. Was Menschen entscheiden müssen, läuft mit Standardannahme weiter (MENSCHEN).
> - Gesichert auf `origin/claude/trusting-lovelace-6nfolz` (`_plan/GEMEINDE-PLATTFORM.md`, d30393d).

## Kontext
- **Auftrag des Nutzers:** Die Web-App wird komplett zu Ende entwickelt und aufgewertet, mehr als verlangt, damit die Führung der Moschee begeistert ist. Im Einzelnen:
  - ganzer Koran digital: lesen, vorlesen lassen, Wort antippen → Bedeutung, Tajwid-Regeln in einer Seitenleiste
  - alle Hadithe von Sahih al-Bukhari
  - Elifbe und Arabisch-Lernen
  - Gebetszeiten per GPS (Wetzlar ≠ Frankfurt)
  - Backend fertig, Login, CMS für eigene Nachrichten
  - Schülerkonten mit Gruppen und Gruppenchat
  - Die Moschee ist **fertig gebaut** (es ist 2026).
  - UI/UX, Seitenwechsel- und SVG-Animation auf jeder Seite individuell
  - Der lokale Server der Moschee darf mitgenutzt werden.
  - Zeit: eine Woche, praktisch unbegrenzte Tokens.
- **Ausgangslage:**
  - Next.js 16 / React 19 / Drizzle / Better Auth / next-intl, Vercel fra1. Produktion läuft im Beispielmodus, noch ohne Datenbank.
  - Der Vorlauf (Branch `claude/blissful-edison-x3j16w`) steckt in der Endprüfung: Pflicht 70/70, Ausnahme A-01 (TBT).
  - Koran-Hülle mit Tanzil-Import (`scripts/quran-import.ts`), aber nie befüllt.
  - Verwaltung mit 5 Personal-Rollen, aber **keine** Konten für Gemeinde, Eltern, Lehrkräfte oder Schüler; keine Gruppen, kein Chat, Push oder Echtzeit.
  - Gebetszeiten (adhan, Methode Turkey) nur für einen Ort; GPS ist per `Permissions-Policy` gesperrt.
  - CMS-Lücken: freie Seiten, Menüs, Revisionen.
  - Mehrere Texte sagen „Moschee in Planung“.
- **Entscheidungen des Nutzers:**
  - Lokaler Server = Helfer neben Vercel (Sicherungen, Anzeige-Kiosk, Takt, optional Echtzeit).
  - Chat = nur moderierter Gruppenchat.
  - Konten für Schüler, Eltern, Lehrkräfte und Gemeindemitglieder.
  - Rezitation auf **beiden** Wegen: eigene Aufnahmen (Fatiha + Cüz 30 zuerst) und Erlaubnis eines bekannten Rezitators.
  - Web Push nur auf Wunsch der Person.
  - Start **sofort** (Nutzer, 13.10.): kein Warten, kein Anhalten; der Vorlauf läuft parallel und wird per Merge von `main` aufgenommen.
- **Recherche-Ergebnis Lizenzen:**
  - Offen nutzbar mit Namensnennung: Tanzil-Text (CC BY 3.0, unverändert), cpfair/quran-tajweed und quran-align (CC BY 4.0), Amiri Quran (OFL), adhan-js (MIT), Centrifugo (Apache-2.0), QuranEnc-Übersetzungen (unter 7 Bedingungen).
  - Schriftliche Erlaubnis nötig: KFGQPC-Schrift, Diyanet-Meal, fremde Rezitationen, deutsche/türkische Bukhari-Übersetzungen, Datenabzug von sunnah.com.
- **Ziel:** Nach 7 Tagen ist die Web-App das digitale Gemeindehaus der fertigen Fatih-Moschee:
  - lesen, hören und verstehen
  - Elifbe und Tajwid lernen
  - Hadithe nachschlagen
  - Gebetszeiten für die Moschee und den eigenen Ort
  - ein geschützter Lernraum mit Eltern und Hoca
  - Ehrenamtliche pflegen alles selbst

  Alles würdevoll, schnell, ohne Drittanbieter und mit religiöser Freigabe durch Menschen. Riskantes (Konten, Chat, Push) geht hinter **Funktionsschaltern** live, die in Produktion aus bleiben, bis Menschen freigeben.

## 0. Start und Standardannahmen
1. **Sofortstart, ohne Startbedingung.** Der Vorlauf (`claude/blissful-edison-x3j16w`, Endprüfung) läuft parallel weiter und wird **nicht** angefasst. Damit sich beide nicht stören:
   - Mein Arbeitsbranch nimmt `origin/main` regelmäßig per Merge auf (nie Rebase oder Force): zu Beginn jeder Welle und vor jedem Fast-Forward. Konflikte löst der Orchestrator sofort, ohne anzuhalten.
   - Die neue Werkstatt liegt **bis zum Ende des Vorlaufs** im eigenen Ordner `_gemeinde/` (AUFTRAG, KERN 3.0, PLAN, ABNAHME, MENSCHEN, ENTSCHEIDUNGEN, STATUS, PRUEFPUNKT, berichte, protokolle, werkzeuge). `_werkstatt/` des Vorlaufs bleibt unberührt und wird erst nach dessen ABSCHLUSS (spätestens in E7) nach `_archiv/lauf-gestaltung-2026-10` verschoben; seine Werkzeuge werden in `_gemeinde/werkzeuge` kopiert, nicht verschoben.
   - `.vercelignore` bekommt `_gemeinde`.
2. **Arbeitsbranch:** `claude/trusting-lovelace-6nfolz` (Branch dieser Sitzung; Plan-Commit d30393d bleibt), sofort mit `origin/main` zusammengeführt.
   - Push nach jeder Welle und mindestens stündlich (ZWISCHENSTAND).
   - `main` nur per Fast-Forward nach grünem Tor (L-E01), nie erzwungen, mit sicheren Schaltern. Vorher wird `origin/main` gemergt; ist `main` inzwischen weitergerückt, wird erneut gemergt und dann vorgespult.
3. **Gedächtnis gegen Neustarts:**
   - Der CLAUDE.md-Block für diesen Lauf steht **unter** dem Block des Vorlaufs: „Gemeinde-Plattform: `_gemeinde/AUFTRAG.md`, `STATUS.md`, `PRUEFPUNKT.md` lesen und dort fortsetzen; Branch `claude/trusting-lovelace-6nfolz`; nie anhalten.“
   - Nach jedem Neustart der Sitzung geht es sofort an PRUEFPUNKT weiter, ohne Rückfrage.
   - Daten- und Rechtemodell sind ausdrücklich **erweiterbar**.
   - Unantastbar bleiben: Logos, Wortlaut der Rechtstexte, religiöse Quellenregeln, Logik der Moschee-Gebetszeiten (Änderung nur per ADR + Imam), Prüfungen des Cockpits.
4. **Standardannahmen** (gelten, bis Menschen anders entscheiden; Eintrag in MENSCHEN):

| # | Frage | Standard |
|---|---|---|
| V1 | Offene Datensätze (Tanzil, QuranEnc, quran-tajweed, quran-align, GeoNames) ins Repo, gepinnt mit SHA-256 und `QUELLE.md` | Ja (ADR ersetzt den Menschen-Download aus ADR 0009) |
| V2 | Arabischer Bukhari-Volltext (fawazahmed0, Unlicense) | Import fertig, in der Vorschau aktiv; öffentlich erst nach Rechtsfreigabe (MN-06), bis dahin kuratierte Auswahl |
| V3 | Neon-Datenbank für die Vorschau | ohne: Vorführung lokal, UMGEBUNGSAUSNAHME |
| V4 | Minutentakt für Push und Zeitplan | vom lokalen Server; Vercel-Pro-Cron nur nach Menschen-Entscheidung |
| V5 | Übersetzungen | de Bubenheim, tr `turkish_rwwad`, en `english_rwwad` (QuranEnc), bis Irşad oder Imam anders wählt |

## 1. Leitidee, Vorführpfad, Funktionskatalog
**Leitidee (K-001 v3):** „Die Website lebt im Takt des Tages und im Weg des Lernens: Die sechs Gebetszeiten geben den Tag vor, der Achtstern die Ordnung, und jeder Schritt vom ersten Buchstaben bis zum Hatim ist ein sichtbarer Weg – warm wie Papier, ruhig wie ein Lehrraum.“

**Vorführpfad für den Vorstand** (7 Stationen, 5 Minuten; Skript in BERICHT, Beispieldaten in der Vorschau):
1. Startseite: Tagesbogen, im Ramadan als Fastenbogen; „Unsere neue Moschee – eröffnet“.
2. Fatiha abspielen: Der eigene Imam rezitiert, Vers und Wort leuchten mit. Ein Wort öffnet seine Bedeutung, eine Regel (z. B. „Ikhfa“) öffnet die Seitenleiste.
3. Elifbe: „Be“ schreibt sich selbst; dazu Formen, Stimme der Hoca und eine Übung.
4. Gebetszeiten „Mein Ort“ (z. B. Gießen) neben Wetzlar, mit Qibla-Nadel.
5. Lehrkraft: Anwesenheit in 20 s, Fortschritt je Stufe.
6. Eltern: Fortschritt des Kindes, Fehlmeldung, Elternkanal. Der Kinderchat hat Meldeknopf und Öffnungszeiten.
7. Verwaltung: Nachricht mit Zeitplan; die Anzeige im Gebetsraum wechselt in den Freitagsmodus; „Gemeinde im Blick“.

**Funktionskatalog** (P = Pflicht, K-A/K-B = Kür nach Wirkung):

| Funktion | Art | Abhängig |
|---|---|---|
| Koran-Leser: Text, Übersetzungen, Lesemodi, Lesezeichen lokal, Cüz-Seiten, Druck | P | V1 |
| Wortkarte + Werkstatt für Wortbedeutungen (Bedeutungen nur von Menschen, Freigabe) | P | MN-05 |
| Tajwid: Farbe + Unterstreichung, Regel-Seitenleiste, Regeltexte | P | MN-04 |
| Rezitations-Player: jede Rezitation, Vers- und Wort-Hervorhebung, Wiederholen, Tempo | P | – |
| Rezitations-Werkstatt: Aufnahme oder Upload, Versgrenzen aus Stille, Mitklopfen der Wörter; zuerst Fatiha + Cüz 30 | P | MN-03 |
| Import lizenzierter Gesamtrezitation + quran-align-Zeiten (umschaltbar) | P (Code) | MN-03b |
| Hadith Bukhari: 97 Bücher, Kapitel, Bezüge, Bewertung, Auswahl, Suche | P | V2, MN-06 |
| Elifbe: 28 Buchstaben + Hamza, Formen, Lektionen, Übungen, **Schreibweg-Animation**; Hub `/lernen` | P | MN-07 |
| Gebetszeiten „Mein Ort“ (GPS oder Ortsliste, nur im Browser), Qibla am Standort | P | – |
| Konten Gemeinde/Eltern/Lehrkraft/Schüler (Kind < 16 mit Benutzername), Mein Bereich | P | – |
| Lernplattform: Gruppen, Aufnahme aus Voranmeldung, Anwesenheit, Fortschritt, Hifz, Eltern-Portal | P | – |
| Moderierter Gruppen- und Elternkanal (S-01…S-18) | P | MN-10/11 |
| Web Push opt-in (Gebet, Ankündigung, Chat, Unterricht) + Rückfall Mail/In-Seite | P | MN-17 |
| CMS: freie Seiten mit Blöcken, Menüs, Startseiten-Abschnitte, Revisionen, Zeitplan, Weiterleitungen, Freigaben, Islamisches Wissen | P | – |
| Bildschirm-Anzeige per CMS: Folien, Iqama, Freitagsmodus, Ruhephase | P | MN-14 |
| Moschee 2026 „fertiggestellt“: Seeds, Inhaltsmigration, Texte, Cockpit-Prüfung | P | MN-08 |
| `/barrierefreiheit`, `/quellen` (Lizenzen) | P | – |
| Bestandslücken: Einwilligung für Personenfotos (K-29), Voranmeldung ↔ Kurs | P | – |
| Lokaler-Server-Kit: Sicherung, Medienspiegel, Takt, Überwachung, Kiosk | P | MN-12 |
| Ramadan-Modus `/ramadan` (Imsakiye, Fastenbogen, Teravih) | K-A | – |
| Gemeinsame Hatim (30 Cüz verteilen, Ring) | K-A | Konten |
| Islamischer Kalender + Kandil/Bayram (bestätigt) + iCal | K-A | MN-15 |
| Spenden per GiroCode (EPC-QR, kein Zahlungsdienst) | K-A | MN-13 |
| Leitungs-Cockpit „Gemeinde im Blick“ (Werte < 5 als „< 5“, Druckbericht) | K-A | – |
| Vers/Hadith des Tages aus freigegebenen Listen | K-A | MN-05/06 |
| Offline-Koran (Sure/Cüz speichern, Audio Cüz 30) | K-A | – |
| Echtzeit über Centrifugo auf dem lokalen Server (nur Signal, kein Inhalt) | K-A | MN-12 |
| Newsletter (Double-Opt-in), QR-Check-in, Ehrenamt-Dienstplan, Urkunden mit Prüfcode, Hausaufgaben, Hifz-Modus, Moscheeführung anfragen, Passkey-Oberfläche, Zugangskarte für Kinder, Schriftgröße für Ältere | K-B | – |

**Bewusst abgelehnt:**
- Zahlungsdienste und Spendenplattformen
- Tracker und Seitenaufruf-Zähler
- KI-erzeugte Übersetzungen, Wortbedeutungen, Tajwid-Erklärungen; „Frag-den-Imam“-Bot
- Sprachausgabe (TTS) für Koran oder Hadith
- im Kinderchat: Direktnachrichten, eigene Gruppen, Bilder, Dateien
- Ranglisten, Serien-Druck, Punktevergleich
- Zekat-Rechner mit Goldkurs
- Standort an den Server, fremde Geokodierung
- 3D-Modell, generierte Moscheebilder, Halbmond- oder Kuppel-Grafiken
- YouTube-Einbettung (höchstens ein Link)
- hochzählende Zahlen

## 2. Architektur
**2.1 Bereiche**

| Bereich | Pfade | Rendering | Cookies | JS-Budget |
|---|---|---|---|---|
| Öffentlich | `src/app/[locale]/(website)/**` | statisch (`ensureStatic`, `'use cache: remote'` + Tags) | nie | ≤ 180 KB gz |
| Öffentliche Daten-APIs | `api/quran/**`, `api/anzeige`, `api/push/abo`, `push-texte/[sprache].json` | statisch, wo möglich | nie | – |
| Konto-Einstieg | `(konto)/{anmelden,registrieren,einladung,passwort-*}` | dynamisch, Nonce-CSP | ja | ≤ 200 KB |
| Mein Bereich | `(konto)/mein-bereich/**` (tr `hesabim`, en `my-account`) | dynamisch, `no-store`, noindex | ja | ≤ 230 KB |
| Mein-APIs | `api/mein/**` (Chat-Abruf, Lesezeichen-Sync) | `connection()`, Sitzung | ja | – |
| Verwaltung | `/verwaltung/**` (Bestand, nur Deutsch) | dynamisch | ja | Bestand |

- „Anmelden“ im Kopf zeigt auf `/anmelden`.
- Danach entweder die Wahl Verwaltung/Mein Bereich oder direkt Mein Bereich.
- `src/proxy.ts` bekommt einen Nonce-Zweig für die Konto-Pfade.

**2.2 Konten und Rechte** – zwei Ebenen plus Gruppenbezug:
- **Verwaltung** (`rolle_zuweisung`, `darf()` in `src/lib/rechte/matrix.ts`):
  - neue Rollen `leitung` (Cockpit, nur lesen), `religioese_pruefung` (Imam/Hoca: verfassen und freigeben), `kinderschutz` (Meldungen, Protokoll, Notfall-Pause)
  - rund 30 neue Aktionen (`gruppe.*`, `lernende.*`, `seite.*`, `menue.bearbeiten`, `quran.*`, `hadith.*`, `elifbe.*`, `rezitation.bearbeiten`, `religioes.freigeben`, `anzeige.*`, `hatim.*`, `newsletter.*`, `meldung.chat.*`, `chat.notfallpause`, `leitung.lesen`, `funktion.schalten` …)
  - **ADR 0026:** Chat-Inhalte sind *nie* über „Administration darf alles“ erreichbar (Ausschlussliste `NIE_PER_ADMINISTRATION` + Negativtest).
- **Gemeinde** (neu `gemeinde_rolle`): `gemeinde`, `eltern`, `lehrkraft`, `schueler`; Prüfung über `verlangeKonto(rolle?)` in `src/lib/rechte/gemeinde.ts`.
- **Gruppe:** `gruppen_leitung` (lehrkraft | aufsicht), `gruppen_mitglied`, `eltern_kind`; reine Funktion `darfInGruppe()` + `verlangeGruppenRecht` in `src/lib/rechte/gruppen.ts`. Schüler sehen nur sich selbst, Eltern nur ihr Kind, Lehrkräfte nur die eigene Gruppe.
- **Faktor und Sitzung** (absolut ab `session.createdAt` in `ladeAngemeldet`, `src/lib/rechte/pruefe.ts`):

  | Konto | Zweiter Faktor | Sitzung |
  |---|---|---|
  | Verwaltung | TOTP Pflicht | 8 h |
  | Lehrkraft | TOTP Pflicht | 12 h |
  | Eltern | Opt-in | 30 Tage |
  | Gemeinde, Schüler ≥ 16 | optional | 30 Tage |
  | Kind < 16 | – | 12 h, Eltern setzen zurück |

- **Kinderkonten ohne E-Mail:**
  - Better-Auth-Plugin `username` (bereits Teil von better-auth).
  - Synthetische Adresse `k-<zufall>@konto.invalid`; der Mail-Ausgang weist `.invalid` hart ab (Test).
  - Anmeldung nur über Server Action, mit Rate je Konto und IP.
- **Registrierung:**
  - Gemeinde: selbst, mit ALTCHA und Honigtopf (`pruefeEinsendung` aus `src/lib/formulare/verarbeiten.ts`) und E-Mail-Bestätigung.
  - Eltern: Einladung aus der Aufnahme einer Voranmeldung.
  - Lehrkraft und Schüler ≥ 16: bestehendes Einladungssystem, erweitert um `gemeindeRollen`.
- **Einwilligungen** (Art. 8/9 DSGVO; Prüfung MN-11):
  - getrennt und einzeln widerrufbar, mit Textversion (SHA-256), Zeit und erteilender Person: Lernplattform, Kinderkonto, Gruppenchat, Push für das Kind
  - Zusatzhaken „sorgeberechtigt, im Einvernehmen“
  - am 16. Geburtstag eigene Einwilligung binnen 30 Tagen (Cron `loeschfristen` erweitert)

**2.3 Datenmodell:**
- Der Orchestrator schreibt in E1 **eine** Migration `0008_gemeinde_plattform.sql` plus `0009_trigger_und_pruefungen.sql` (custom).
- Danach nur noch erweiternde Migrationen an Toren.

| Schema-Datei | Neue Tabellen (Kern) |
|---|---|
| `schema/auth.ts` (generiert) | `user.username`, `display_username` |
| `schema/typen.ts` | Enums: Rollen + `gemeindeRolleEnum`, `freigabeStatusEnum (entwurf, zur_pruefung, geprueft)` |
| `schema/konten.ts` | `gemeinde_rolle`, `konto_profil`, `konto_einwilligung` (versioniert) |
| `schema/lernen.ts` | `lernende` (Personendaten verschlüsselt über `src/lib/krypto`), `eltern_kind`, `gruppe` (Kurs, Zeiten, Chat-Modus/-Mindestalter/-Zeiten), `gruppen_leitung`, `gruppen_mitglied`, `unterrichtstermin`, `anwesenheit`, `fehlmeldung`, `lehrplan_stufe` (elifbe, kuran, tecvid, ilmihal, hifz), `lernfortschritt`, `hifz_eintrag`; K-B: `aufgabe`, `urkunde` |
| `schema/chat.ts` | `chat_kanal` (gruppe, eltern), `chat_nachricht` (verschlüsselt, Soft-Entfernung), `chat_gelesen`, `chat_regeln_bestaetigt`, `chat_stumm`, `chat_meldung`, `moderationsprotokoll` (Trigger gegen UPDATE/DELETE + Hash-Kette); Vorbild: Postfach in `schema/verwaltung.ts` |
| `schema/quran.ts` (erweitert) | `quran_sure` + Umschrift/Ort/Basmala; `quran_vers.tajwid jsonb`; `quran_einteilung` (Cüz/Hizb/Seite/Secde); `quran_wort`, `quran_wortform`, `quran_wortbedeutung` (+ Status, verfasst/geprüft von), `quran_ausgabe`, `quran_uebersetzung`, `tajwid_regel`, `quran_rezitation` (eigen, lizenziert; Vereinbarung Pflicht), `quran_audio`, `quran_verszeit`, `quran_wortzeit` |
| `schema/hadith.ts` | `hadith_sammlung`, `hadith_buch`, `hadith_kapitel`, `hadith` (sunnah.com-Bezug als ID, Bewertung, Suche), `hadith_uebersetzung` (Status), `hadith_auswahl` |
| `schema/elifbe.ts` | `elifbe_lektion`, `elifbe_uebung` (erkennen, zuordnen, hoeren, lesen, nachspuren), `elifbe_beispielwort` (nur Verweis auf `quran_wort`), `elifbe_audio`, `elifbe_fortschritt` |
| `schema/cms.ts` | `seite` (Blöcke, Slugs je Sprache, Zeitplan), `revision` (für alle Typen), `menue`, `weiterleitung`, `freigabe` (redaktionell, religiös), `vorschau_token` |
| `schema/gemeinde.ts` | `anzeige_folie`, `besonderer_tag`, `hatim`, `hatim_teil` (eindeutig je Cüz), `newsletter_abo`, `dienst`, `dienst_eintrag`; `eingang.checkin_hash` |
| `schema/push.ts` | `push_abo` (Endpoint verschlüsselt, Themen, Einwilligungsversion), `push_versand` (Einmal-Schlüssel) |

- Neue Cache-Tags in `src/lib/cache/tags.ts`: `hadith`, `elifbe`, `seite(id)`, `menue`, `weiterleitungen`, `anzeige`, `kalender`, `hatim(id)`, `rezitation(id)`, `funktionen`.

**2.4 Inhalts-Pipelines** (alle mit SHA-256-Pin, `web/daten/<quelle>/QUELLE.md`, Import in die PGlite-Bau-Datenbank `scripts/bau-datenbank.mjs`, damit die Vorschau volle Inhalte hat):

| Skript | Quelle | Prüfung |
|---|---|---|
| `scripts/quran-import.ts` (Bestand erweitert; `src/lib/quran/tanzil.ts`) | Tanzil Uthmani (Variante passend zu quran-tajweed, in E0 bestimmt) + Metadaten | Rundreise: Wörter = Verstext für alle 6.236 Verse; Zählung gegen Metadaten |
| `scripts/tajwid-import.ts` | cpfair/quran-tajweed (Commit gepinnt) | Graphem- und Wortgrenzen (`Intl.Segmenter`); bei Abweichung Vers ohne Färbung + Bericht |
| `scripts/uebersetzung-import.ts` | QuranEnc (Version und Abruf) | unverändert und vollständig; Cockpit-Hinweis nach 90 Tagen (Pflegepflicht) |
| `scripts/hadith-import.ts` | nach V2 | lückenlose Nummern, Bücher und Kapitel konsistent |
| `scripts/rezitation-import.ts` | lizenzierter Satz + quran-align | Manifest, Lizenzdatei Pflicht |

`/quellen` zeigt jede Attribution (Tanzil, QuranEnc-Version, quran-tajweed, quran-align, Hadith-Quelle, GeoNames, Schriften, Bibliotheken).

**2.5 Audio (ADR 0029):**
- **Speicher:** öffentlicher Vercel-Blob-Speicher `audio` (fra1), Pfade mit Inhalts-Hash, ausgeliefert über einen `vercel.json`-Rewrite `/audio/*`; CSP bleibt `'self'`. E0 prüft Range-Anfragen; Rückfall: Blob-Domain in `media-src` + Verarbeitungsverzeichnis.
- **Upload:** direkt vom Browser (`@vercel/blob/client`, Token-Route mit Rechteprüfung) wegen der 4,5-MB-Grenze. Erlaubt sind m4a/mp3/ogg/webm per Magic Bytes, ≤ 60 MB je Sure.
- **Werkstatt** `/verwaltung/quran/rezitationen/[id]/abgleich/[sure]`:
  1. Aufnahme im Browser (MediaRecorder; `microphone=(self)` nur in der Verwaltung).
  2. Wellenform aus `decodeAudioData`.
  3. Versgrenzen aus Stillephasen.
  4. **Mitklopfen** der Wortanfänge bei 0,6–0,8-facher Geschwindigkeit mit Einrasten.
  5. Prüfwiedergabe.
- **Aligner auf dem lokalen Server** (K-B): nur Vorschläge, ein Mensch bestätigt.
- **Aktivieren** nur mit hinterlegter Vereinbarung über Rechte und Stimme (Datenbank erzwingt das). Die Quellenzeile im Player nennt Rezitator und Lizenz.
- **Testdaten** nur synthetische Töne, nie Rezitationen.

**2.6 Echtzeit (ADR 0027):**
- **Pflicht:** adaptiver Abruf `GET /api/mein/chat/[kanal]?nach=<id>`. 4 s nach Aktivität, dann 15/30 s; Pause bei verborgenem Tab und außerhalb der Öffnungszeiten.
- **K-A:** Centrifugo auf dem lokalen Server hinter Caddy. Next.js meldet **nur „Kanal hat Neues“**; Inhalte berühren den Server nie. JWT je Kanal für 10 Minuten. `wss://` nur in der CSP von Mein Bereich. Fällt der Server aus, läuft automatisch wieder der Abruf.

**2.7 Web Push (ADR 0034):**
- **Ohne Bibliothek:** `src/lib/push/{vapid,verschluesselung,senden}.ts` (RFC 8292/8291, `node:crypto`), getestet mit den RFC-Vektoren. VAPID-Schlüssel per `pnpm geheimnisse:erzeugen`.
- **Themen** je Person wählbar: Gebetserinnerung (nur Wetzlar-Moscheezeiten), Ankündigung, Chat/Elternkanal (höchstens 1 Meldung je 10 min; Kind nur mit Elternfreigabe), Unterricht.
- **Nutzlast** ohne Inhalte und Namen; Texte aus `push-texte/[sprache].json`. Handler in `public/sw.js`.
- **Takt:** `/api/wartung/takt` (`CRON_SECRET`, idempotent über `push_versand`), angestoßen vom lokalen Server (oder Vercel Pro).
- **Rückfall:** Mail-Zusammenfassung ohne Inhalt; In-Seite-`Notification`.
- **Recht und Pflege:** Opt-in-Text nennt die Push-Dienste; inaktive Abos werden nach 12 Monaten gelöscht; Hinweis für iOS (erst zum Home-Bildschirm hinzufügen).

**2.8 Funktionsschalter (ADR 0035):**
- `src/lib/funktionen.ts`: Einstellung in der Datenbank, in Produktion übersteuert durch die Umgebung `FUNKTION_<NAME>=an|aus`.
- Schalter: `konten`, `lernplattform`, `chat`, `echtzeit`, `push`, `push_gebet`, `hatim`, `newsletter`, `hadith_gesamt`, `rezitation_<id>`, `ramadan_vorschau`.
- In Produktion ist alles mit Personendaten aus.
- Cockpit-Sperren: `chat` erst mit bestätigter DSFA, Schutzkonzept und ≥ 2 Erwachsenen je Gruppe; `push` erst mit VAPID.
- Ausgeschaltet bedeutet `notFound()`, und die Links verschwinden.

**2.9 Lokaler-Server-Kit** (`betrieb/lokal/`, Docker Compose, ADR 0036):

| Dienst | Aufgabe |
|---|---|
| `sicherung` | täglich `pg_dump` (Neon, Leserolle), mit `age` verschlüsselt, Rotation 30 Tage |
| `medien-spiegel` | Blob-Medien und Audio spiegeln, mit Prüfsummen |
| `wiederherstellungsprobe` | monatlich, mit Meldung ins Cockpit |
| `takt` | jede Minute `/api/wartung/takt` |
| `ueberwachung` | Health-Abfrage, Mail an die Technik bei Ausfall |
| `centrifugo` + `caddy` | Profil `echtzeit` |
| `aligner` | Profil `abgleich`, K-B |

Dazu eine Kiosk-Anleitung (Mini-PC oder Raspberry Pi, Chromium im Kiosk-Modus auf `/gebetszeiten/anzeige`). Die Menschen-Schritte stehen in MN-12.

**2.10 Kopfzeilen:**
- `geolocation=(self)` **nur** auf den Gebetszeiten-Pfaden (de/tr/en).
- `microphone` und `camera` nur in der Verwaltung.
- Abgesichert durch den Test `kopfzeilen-pfade.test.ts`.

## 3. Funktionen im Detail
**3.1 Koran-Leser:**
- **Routen:**
  - `/quran` (Surenliste, **Cüz-Ring** mit 30 Segmenten als Navigation, „Weiterlesen“)
  - `/quran/[sure]` (statisch ×114×3)
  - `/quran/cuz/[nr]`, `/quran/tajwid`
  - statische JSON-Routen `/api/quran/[sure]/woerter` und `/zeiten/[rezitation]`
  - tr `kuran`, en `quran`
- **Surenseite:**
  - Kopf mit Medaillon (Morph-Ziel), Name arabisch und Umschrift, Ort, Quellenzeile.
  - Basmala aus dem Tanzil-Attribut, nicht bei Sure 1 und 9.
  - Vers in `--font-quran` (Amiri Quran, OFL, nur hier vorgeladen) mit `lang="ar" dir="rtl"`; Wörter als Spans; Tajwid-Segmente als `<b class="tj tj-…">`; Versende U+06DD.
  - Darunter die Übersetzung; `content-visibility: auto`.
  - Ohne JavaScript voll lesbar.
- **Insel `QuranLeser`** (≤ 6 KB, Rest lazy):
  - Werkzeugleiste: Lesemodus, Ausgabe, Tajwid an/aus mit Legende, Schriftgröße, Abspielen.
  - **Wortkarte** (≤ 4 KB): geprüfte Bedeutung de/tr oder ehrlicher Hinweis, Wurzel, Vorkommen, Wort abspielen, Regel → Seitenleiste.
  - **Tajwid-Seitenleiste** (≤ 3 KB): Regel mit Farbe + Muster, freigegebener Text, Beispiel im Vers markiert, Hörbeispiel.
  - **Player** (≤ 6 KB): Vers wiederholen ×1/3/5/∞, Bereich, Tempo, Rezitation wählen, „Mitlesen folgen“, Media Session, nächster Vers vorab geladen; Wort-Hervorhebung über die **CSS Custom Highlight API**.
  - Tastatur: ein Tab-Halt je Vers, Pfeile wandern durch die Wörter, Enter öffnet die Wortkarte.
  - Lesezeichen lokal, Sync nur nach Einschalten in Mein Bereich.
- **Leistung:** Al-Baqara als Prüffall (HTML ≤ 150 KB gz, LCP ≤ 2,5 s, INP ≤ 200 ms); sonst Plan B mit Abschnitts-Routen.

**3.2 Rezitations-Werkstatt** (Verwaltung):
- Liste der Rezitationen mit Vollständigkeit; Suren-Raster mit Aufnahme oder Upload; Abgleich je Sure.
- Reihenfolge: Fatiha, dann Suren 78–114.

**3.3 Hadith:**
- Routen: `/hadith` (Einführung, Auswahl, Stand), `/hadith/bukhari` (97 Bücher), `/hadith/bukhari/[buch]` (statisch; Kapitel; Karten mit Bezug „Sahih al-Bukhari n · Buch b, Hadith h“, arabisch, geprüfte Übersetzung oder „in Arbeit“, Bewertung, Anker, Link kopieren, Suche als Lazy-Insel), `/hadith/auswahl`; tr `hadis`.
- Suchfilter „Hadith“ in `/suche`.

**3.4 Elifbe und Lernen:**
- `/lernen` (Weg Elifbe → Tajwid → Koran → Hifz → Kurse).
- `/elifbe` (Stationen nach Diyanet-Systematik, bestätigt in MN-07).
- `/elifbe/buchstaben/[b]` (×29×3): **Schreibweg** B-17, vier Formen, Audio der Hoca, Artikulationsort, ähnliche Buchstaben, Beispielwörter nur als Verweis auf `quran_wort`.
- `/elifbe/[lektion]`: berechnete Silbentafeln (Buchstabe × Haraka aus Codepunkten).
- `/elifbe/ueben` (Lazy ≤ 10 KB): erkennen, zuordnen, hören, lesen, nachspuren.
- **Glyphen:** Generator `_gemeinde/werkzeuge/elifbe-glyphen.mjs` (opentype.js nur im Werkzeugordner) erzeugt Amiri-Umrisse; die Mittellinien-Züge zeichnet Opus, die Hoca prüft.
- **Fortschritt:** lokal, für Schüler synchronisiert.

**3.5 Lernplattform:**

| Wer | Wo | Was |
|---|---|---|
| Bildung | `/verwaltung/gruppen`, `/lernende`, `/lehrplan`, `/gemeinde-konten`; „Aufnehmen“ in `/verwaltung/eingaenge/[id]` | Gruppen mit ≥ 2 Erwachsenen, Terminserien, Aufnahme → Lernende + Eltern-Einladung |
| Lehrkraft | `/mein-bereich/unterricht/**` | „Heute“, Anwesenheit auf einem Bildschirm (große Schalter, Fehlmeldungen vorbelegt), Fortschritt je Stufe, Hifz, Elternbrief, Moderation |
| Eltern | `/mein-bereich/kinder/**` | Termin, Anwesenheit, Fortschritt, Fehlmeldung, Einwilligungen, Kinderzugang (Passwort zurücksetzen, Zugangskarte), Elternkanal |
| Schüler | `/mein-bereich` | Lernweg (B-24), Gruppe, Aufgaben, Chat |
| Alle | `/mein-bereich/konto`, `/benachrichtigungen` | Profil, 2FA, Datenexport (Art. 15/20), Löschantrag (Art. 17), Push, Newsletter |

**3.6 Kinderschutz im Chat** (jede Maßnahme mit Test oder Beleg):
- S-01: Nur Gruppen- und Elternkanal; keine Direktnachrichten, keine eigenen Gruppen.
- S-02: Ein Kanal ist nur mit ≥ 2 Erwachsenen aktiv.
- S-03: Kinder unter 16 nur mit Elterneinwilligung; ein Widerruf wirkt sofort.
- S-04: Mindestalter je Gruppe 10; keine Kindergartengruppen.
- S-05: Nur Text bis 500 Zeichen; keine Bilder oder Dateien; externe Links nur als Text.
- S-06: Öffnungszeiten 08–20 Uhr, außerhalb nur lesen.
- S-07: Melden in zwei Schritten, mit Hilfehinweis.
- S-08: Meldungen gehen an die Lehrkräfte und die Rolle `kinderschutz`; Mail ohne Inhalt.
- S-09: Entfernen, Stummschalten, Pausieren, Mitglied entfernen – immer mit Grund.
- S-10: Unveränderliches Moderationsprotokoll mit Hash-Kette.
- S-11: Administration liest keine Chats; `kinderschutz` sieht nur den Meldekontext (±10 Nachrichten), mit Audit.
- S-12: Fristen: Nachrichten 90 Tage bzw. spätestens 30 Tage nach Gruppenende; Meldungen 1 Jahr.
- S-13: Rate 10 pro Minute und 200 pro Tag.
- S-14: Keine Lesebestätigungen, keine Online-Anzeige; Name = Vorname + Initial.
- S-15: Kindgerechte Regeln bestätigen.
- S-16: Text verschlüsselt; nie in Push, Mail oder Logs.
- S-17: Notfall-Pause für alle Chats.
- S-18: Sperren beendet alle Sitzungen sofort.

**3.7 CMS (ADR 0032):**
- **Blöcke** (Zod in `src/lib/validierung/bloecke.ts`, Renderer in `components/website/bloecke/*`): text, bild, galerie, aufruf, faq, trenner, spalten, termine, nachrichten, kontakt, karte (nach Klick), download, gebetszeiten. Die Blöcke `vers` und `hadith` sind **nur Verweise** auf freigegebene Datenbankinhalte.
- **Freie Seiten** über den Bestand `[locale]/[...rest]`: zuerst `generateStaticParams` und die Weiterleitungstabelle, sonst `notFound`; reservierte Slugs werden geprüft.
- **Ablauf:** Entwurf → Prüfung → Veröffentlicht, mit Zeitplan; Revision bei jedem Speichern; signierte Vorschau.
- **Rechte und Übersetzung:** Organisationsredaktion nur für die eigene Organisation; Übersetzungsstand je Sprache.
- **Menüs** aus der Datenbank ersetzen `components/website/navigation.ts` (mit Rückfall).
- **Startseite:** Abschnitte sortierbar.
- **Neue Verwaltungsmodule** (Muster §7, `module.ts`): Seiten, Menüs, Startseite, Weiterleitungen, Islamisches Wissen, Freigaben, Anzeige, Besondere Tage, Hatim, Newsletter, Ehrenamt, Koran (Ausgaben, Wörter, Tajwid, Rezitationen), Hadith, Elifbe, Gemeinde-Konten, Gemeinde im Blick, Meldungen & Kinderschutz.

**3.8 Gebetszeiten „Mein Ort“:**
- **Ablauf:** neuer Tab → Knopf (≈ 1 KB) → Lazy-Chunk ≤ 12 KB (adhan, Ortsliste) → `getCurrentPosition`, auf 2 Nachkommastellen gerundet.
- **Rechnung:** mit den Moschee-Einstellungen und der Gerätezeitzone; `berechneTag` bekommt einen Zeitzonen-Parameter mit Standard Europe/Berlin.
- **Anzeige:**
  - Unterschied zu Wetzlar (z. B. „+2 Min.“)
  - nächster Ort aus der lokalen GeoNames-Liste (≈ 40 Orte)
  - Qibla über `qiblaRichtung()` aus `src/lib/gebetszeiten/berechnung.ts`
  - Beschriftung „Berechnet für deinen Standort – die Zeiten der Moschee gelten für Wetzlar.“
- **Ohne GPS:** Ort aus der Liste wählen; merken oder vergessen über localStorage.
- **Nie** Koordinaten ins Netz (E2E mit Netz-Abhörung).
- **Moschee-Zeiten:** Logik unverändert; „IGMG-Gemeinschaftskalender (Annäherung, 18°/16° + Nachtdrittel)“ nur als wählbare Methode, Umstellung nur nach Imam-Entscheidung (MN-09). Die offizielle Jahrestabelle läuft über den bestehenden Import.

**3.9 Moschee 2026 fertiggestellt:**
- `drizzle/seeds/bereiche/projekte.ts`: `status: 'fertiggestellt'`, alle Meilensteine erledigt (fehlende Daten als Platzhalter), Spendenzweck neu (TEXTVORSCHLAEGE).
- `messages/bereiche/projekte.json`: Galerie „Unsere Moschee“.
- `drizzle/seeds/bereiche/ueber-uns.ts`: „Zukunft“ → „[Jahr] – Eröffnung der neuen Fatih-Moschee“.
- Alte, ungenutzte Schlüssel `messages/*.json` `bestand.aboutUs.*` bereinigen.
- Neue Beispielnachricht „Eröffnung“.
- **Inhaltsmigration** `scripts/inhalte-2026.ts`: idempotent, nur für `ist_beispiel = true`, mit Audit und Test.
- **Cockpit-Prüfung:** „Meilenstein vergangen, aber offen“.
- Historische Nachrichten und Vorstandsgeschichte bleiben.

**3.10 Kür im Detail:**
- **Hatim:** `/hatim`, eindeutige Übernahme je Cüz; öffentlich nur Zahlen und Ring.
- **Ramadan:** `/ramadan` mit Imsakiye aus `gebetszeit_tag` (druckbar), Teravih und Fitre aus Seiteninhalt.
- **Kalender:** `/kalender` mit Hidschri-Monaten (`src/lib/gebetszeiten/hijri.ts`), besondere Tage „vorläufig“ bis bestätigt, iCal.
- **Spenden:** `/spenden` mit GiroCode (EPC, `uqr` aus dem Bestand), IBAN kopieren.
- **Anzeige-CMS:** Folien mit Zeitplan, Iqama, Freitagsmodus, Ruhephase Ezan → Iqama + 15 min, offline weiter.
- **Gemeinde im Blick:** Zahlen ohne Personendaten, „< 5“-Schwelle, Monatsbericht.
- **Weitere Kür:**
  - Vers/Hadith des Tages nach Datum, nur aus freigegebenen Listen.
  - Newsletter mit Double-Opt-in.
  - QR-Check-in (`BarcodeDetector`).
  - Ehrenamt-Dienstplan.

**3.11 Bestandslücken:**
- K-29: Haken für Personenfotos (`src/server/actions/medien.ts`).
- Verknüpfung über `eingang.bezugId`.
- Einstellungs-Oberfläche: Allgemein, Funktionen, Anzeige.
- Passkey-Oberfläche (K-B).
- Neue Mail-Vorlagen in `src/lib/mail/vorlagen`: Adresse bestätigen, Einladungen, Newsletter, Meldung eingegangen, Chat-Zusammenfassung – alle ohne Inhalte.

## 4. Gestaltung und Bewegung
**Neue Tokens** (K-005, nur als Skalen):
- `--font-quran`
- `--text-arabisch-1/2/3` (Zeilenhöhe 2,1–2,3, Harakat nie abgeschnitten)
- `--color-tajwid-{ghunna,ikhfa,iqlab,qalqala,madd,stumm}` (Kontrast ≥ 4,5:1, Test) plus Unterstreichungs-Utilities, damit nichts nur über Farbe unterscheidbar ist
- `--container-lesen`
- `--ebene-player`

**Neue Einträge im Bewegungsregister (K-007, alle mit reduzierter Variante):**

| ID | Bewegung | Kern |
|---|---|---|
| B-13 | Mitlesen | Vers-Tönung per opacity, Wort per Highlight sofort; Folgen-Scroll nur mit Schalter, nie gegen den Nutzer |
| B-14 | Wortkarte | opacity + scale .96→1 vom Wort aus |
| B-15 | Regel-Seitenleiste | Schublade bzw. Blatt (Kurven aus B-03) |
| B-16 | Tajwid-Farben | sofort, ohne Bewegung |
| B-17 | **Schreibweg** (großer Moment) | Züge per `stroke-dashoffset` nacheinander, dann Punkte; ≤ 1,6 s; Glyphe ohne JS sichtbar; reduziert: Endzustand + nummerierte Zugpfeile |
| B-18 | Übungs-Rückmeldung | richtig: Achtstern füllt sich; falsch: Farbe + Text, ohne Bewegung |
| B-19 | Hatim-Ring | Fortschrittsbogen zeichnet sich; keine hochzählende Zahl |
| B-20 | Fastenbogen | Ramadan-Variante von B-06 |
| B-21 | Ortswechsel | Zeiten überblenden, Qibla-Nadel dreht einmal |
| B-22 | Neue Nachricht | opacity + translateY 8px; nicht beim ersten Laden |
| B-23 | Anwesenheit | Druck-Rückmeldung, Häkchen zeichnet sich |
| B-24 | Lernweg | Linie bis zur aktuellen Station |
| B-25 | Anzeige-Folien | Überblendung; im Gebetsfenster keine Folien |
| B-26 | **Seitenwechsel mit Richtung** (B-05 v2) | tiefer → von rechts, höher → von links, seitlich → Überblendung; Kopf steht |
| B-27 | Offline speichern | Ring nach echten Bytes |
| B-08 | Fortschreibung | die Linie endet in der gefüllten Marke „Eröffnung“ |

**Seitenwechsel:**
- `SeitenUebergang.tsx` setzt `data-richtung` aus der Pfadtiefe.
- Neue Morph-Paare über `components/website/morph.ts`: Surenkachel → Kopf, Buchstabenkarte → Glyphe, Hadith-Buch → Kopf, Wissen-Karte → Kopf, Hatim-Karte → Ring, Gruppenkarte → Kopf.

**SVG- und Bewegungsprogramm je Route** (Form: Achtstern, 24-px-Raster, 2-px-Strich; höchstens ein Auftritt mit Gewicht je Bildschirmhöhe):
- **Erzählansichten:**
  - Start: B-06/B-20 + „Unsere Moschee“
  - Über uns: B-07 mit Eröffnung
  - Projekte: B-08 bis zur Eröffnung
  - Organisation: B-09
  - `/lernen`: großer Lernweg
  - `/quran`: Cüz-Ring + Morph
  - `/elifbe`: Stationen + Buchstabenraster
  - Buchstabenseite: B-17
  - `/hatim`: B-19
  - Schüler-Start: B-24
- **Arbeitsansichten:**
  - Veranstaltungen: Wochenband mit Achtstern-Punkten (statisch)
  - Nachrichten: Kategorie-Marken
  - Korankurse: Kurs-Lernweg zeichnet sich einmal
  - Voranmeldung: Achtstern-Schrittanzeige
  - Gebetszeiten: B-10/B-21
  - Kalender/Ramadan: Achtstern-Marken, **keine Mondsichel**
  - Spenden: statischer GiroCode
  - Vorstand: Verbindungslinien
  - Hadith: Buchraster mit Morph
  - Verwaltung: nur Rückmeldung; Cockpit-Diagramme als statisches SVG

**Budgets:**
- öffentlich ≤ 180 KB gz auf jeder Route
- Interaktion nur über dynamische Importe nach einer Nutzeraktion
- `bundle-regeln.test.ts` erweitert (kein adhan, Player oder Übungsmaschine im ersten Chunk)
- Bewegung bleibt reines CSS
- neue Messrouten: `/quran/1`, `/quran/2`, `/hadith/bukhari/1`, `/elifbe/buchstaben/be`, `/lernen`, `/gebetszeiten`

## 5. Recht, Datenschutz, Kinderschutz, Religion
**Dokumente** (alle als markierter Entwurf in `docs/recht/**`; der Wortlaut der bestehenden Rechtstexte bleibt unverändert, Prüfung mit `wortlaut.mjs`):
- Datenschutzerklärung v2 (Bausteine): Konten, Lernplattform (Art. 9), Chat, Push mit Diensten, Newsletter, Standort nur lokal, Audio, lokaler Server, Gerätespeicher
- kindgerechte Hinweise und Chat-Regeln (de/tr)
- Einträge im Verarbeitungsverzeichnis
- DSFA Lernplattform
- Gerüst Schutzkonzept
- versionierte Einwilligungstexte
- Vereinbarung Rezitation
- Nutzungsbedingungen
- `/quellen`, `/barrierefreiheit`
- Löschkonzept

**MENSCHEN** (Wer · Aufwand · Standard bis zur Antwort):

| ID | Aufgabe | Wer | Aufwand | Standard |
|---|---|---|---|---|
| MN-00 | Neon-Vorschau-Datenbank | Technik | 20 min | Vorführung lokal |
| MN-01 | Tanzil-/QuranEnc-Bedingungen bestätigen | Vorstand | 10 min | Ja |
| MN-02 | Übersetzungen wählen (Irşad/Imam) | Imam | 30 min | V5 |
| MN-03 | Aufnahmen Fatiha + Cüz 30, Vereinbarung | Imam/Hafız | 2–4 h + 2–3 h Abgleich | „Rezitation folgt“ |
| MN-03b | Erlaubnis bekannter Rezitator oder Verlag | Vorstand | Wartezeit | nur eigene |
| MN-04 | Tajwid-Regeltexte de/tr, Basmala bestätigen | Hoca | ≈ 6 h | Platzhalter |
| MN-05 | Wortbedeutungen (zuerst Cüz 30), Vers-Liste | Hoca | laufend | „noch nicht erfasst“ |
| MN-06 | Hadith-Quelle (Rechtsberatung), Auswahl übersetzen | Vorstand/Imam | 1 h + laufend | V2 |
| MN-07 | Elifbe-Lehrplan, Aufnahmen, Schreibrichtung prüfen | Hoca | ≈ 4 h | Platzhalter-Audio |
| MN-08 | Moschee-Fakten: Eröffnungsdatum, Adresse, Fotos, Kapazität, Spendenzweck | Vorstand | 1 h | Platzhalter |
| MN-09 | IGMG-Jahrestabelle Wetzlar, Methode (M-082) | Vorstand/Imam | 30 min | Berechnung wie bisher |
| MN-10 | Schutzkonzept, Ansprechpersonen, Führungszeugnisse, Hilfenummern | Vorstand | 4–8 h | Chat aus |
| MN-11 | DSFA, Datenschutz v2, Einwilligungen, Fristen, Push-Drittland | DSB/Recht | 6–10 h | Lernplattform/Chat/Push aus |
| MN-12 | Lokaler Server: Hardware, Installation, DynDNS (nur Echtzeit) | Technik | 3–4 h | Cockpit gelb |
| MN-13 | Bankdaten und Spendenzwecke | Kassenwart | 15 min | Spenden aus |
| MN-14 | Iqama- und Freitagszeiten | Imam | 15 min | ausgeblendet |
| MN-15 | Kandil/Bayram 2026/27 bestätigen | Imam | 15 min | „vorläufig“ |
| MN-16 | Lehrkräfte einladen, Gruppen anlegen | Bildung | 1–2 h | – |
| MN-17 | Push-Themen bestätigen, VAPID setzen | Vorstand/Technik | 15 min | Push aus |
| MN-18 | Takt: Vercel Pro oder lokal | Vorstand | 10 min | lokal |
| MN-19 | Echte Geräte: iOS/Safari, Android | Technik | 1 h | UMGEBUNGSAUSNAHME |
| MN-20 | Imam-Konto mit 2FA (`religioese_pruefung`) | Vorstand | 15 min | Freigaben stauen sich |

**Religiöse Freigabe:**
- **Pflicht** für: Wortbedeutungen, Tajwid-Texte, Hadith-Übersetzungen, Elifbe-Lektionen, Wissensthemen, besondere Tage, Vers/Hadith-Listen, Anzeige-Folien der Art Vers/Hadith.
- **Status:** Entwurf → zur Prüfung → geprüft (Rolle `religioese_pruefung`). Jede Änderung setzt zurück auf „zur Prüfung“. Öffentlich ist nur „geprüft“.
- Unverändert importierte Ausgaben werden einmal je Ausgabe freigegeben.
- **KI-Regel** (in jedem Briefing):
  - Kein Agent schreibt Verse, Hadithe, Bittgebete, religiöse arabische Texte, Übersetzungen, Wortbedeutungen oder Tajwid-/Fiqh-Erklärungen.
  - Arabisch nur aus importierten Dateien oder aus Codepunkten (Alphabet).
  - Prüfwerkzeug `_gemeinde/werkzeuge/religion-pruefung.mjs`: arabische Schrift außerhalb von `web/daten/**` und der Alphabetdatei ergibt Rot in Prüfstufe A.

## 6. Ablauf (7 Tage)
**Modelle:**
- Opus-Orchestrator; Opus-Kernbauer höchstens 2 gleichzeitig.
- Haiku auf 6 Plätzen für Bau nach Muster, Grafik, alle Prüfungen und Dokumentation.
- Waves und Prüfungen laufen als Workflow-Skripte (`agent(…, {model:'haiku'})`).
- Schwere Prüfungen (Build, Gesamtsuite, Lighthouse, Bildsatz) nacheinander.

**Mengen und Dateihoheit:**
- ≈ 24 Opus- und ≈ 78 Haiku-Pakete plus Befundpakete.
- Gemeinsame Dateien nur der Orchestrator: `globals.css`, `routing.ts`, `messages/{de,tr,en}.json`, `next.config.ts`, `proxy.ts`, `vercel.json`, `package.json`, Schema/Migrationen, `matrix.ts`, `module.ts`, `tags.ts`, `funktionen.ts`, `umgebung.ts`, `public/sw.js`, `Seitenrahmen.tsx`, `Header.tsx`.
- Jedes Paket hat eine eigene Bereichsdatei in `messages/bereiche|verwaltung/*.json`, die in E1 leer registriert wird.

| Etappe | Inhalt (Kennung · Modell) | Tor |
|---|---|---|
| **E0 Start (Tag 1, ≈ 5 h)** | O-E0 Sofortstart: Merge `origin/main`, `_gemeinde/` mit AUFTRAG/STATUS/PRUEFPUNKT, CLAUDE.md-Block, Trigger löschen · H-E0-P01 Einrichtung + Ausgangswerte inkl. neuer Messrouten · H-E0-K01…K05 Kundschafter (Auth/Rechte, Verwaltung/CMS, Koran/Gebetszeiten/SW/JS, Bewegung je Route, Fundstellen „Moschee geplant“) · H-E0-B01 Datensätze laden + SHA + Lizenz, passende Tanzil-Variante, Aligner-Kandidaten · H-E0-K06 Vercel (Cron, Funktionsaufrufe, Blob-Range über Rewrite), Better Auth `username`/`emailVerification` | LAGEBILD v2, Funktionsliste F-01…F-60 |
| **E1 Fundament (Tag 1–2) – kritischer Pfad** | O-F01 KERN 3.0, ADR 0025–0037, PLAN, ABNAHME, L0 · O-F02 Datenmodell + Migrationen + Trigger · O-F03 Rechte (Matrix, Gruppen, Gemeinde, Sitzungsgrenzen, Admin-Ausschluss) + generierte Tests · O-F04 gemeinsame Dateien (Routing, Schalter, Header je Pfad, Proxy, SW-Gerüst) · H-F01 Koran-Bibliothek · H-F02 Import-Skripte + Daten · H-F03 Hadith-Import · H-I01 Moschee 2026 · H-R01 `/barrierefreiheit`, `/quellen` | – |
| **E2 Referenzen (Tag 2)** | O-A01 Konten-Kern · O-A02 Mein-Bereich-Hülle · O-Q01 **Koran-Leser als Referenzansicht** · H-Q01 JSON-Routen · H-Q02 Übersicht/Cüz · H-V01 Audio-Speicher · H-T01 Konten-Tests | Stufe B, Sichtabnahme (frischer Opus, ≥ 8), **S1** Sicherheitsprüfung Auth, Fast-Forward `main` (`konten` aus) |
| **E3 Lernen und Inhalte (Tag 3)** | O-L01 Aufnahme/Einwilligung/Kinderkonto · O-L02 Unterricht · O-E01 Elifbe-Kern (Glyphen, B-17, Übungen) · H-L01…L05 Verwaltung Lernen · H-L06 Eltern-Portal · H-L07 Schüler-Lernweg · H-D01 Hadith-Seiten · H-E01…E03 Elifbe-Seiten + `/lernen` · H-G01 „Mein Ort“ · H-T02 Tests | Stufe B, Sichtabnahme, Fast-Forward `main` (`lernplattform` aus) |
| **E4 Gemeinschaft und Pflege (Tag 4)** | O-C01 Chat-Kern (S-01…S-18) · H-C01 Chat-Oberfläche · H-C02 Moderation/Kinderschutz · O-M01 CMS-Kern · H-M01…M06 CMS-Module · H-Q03/Q04 Wortbedeutungen, Tajwid, Ausgaben · O-Q02 Rezitations-Werkstatt · H-Q05/Q06 Rezitation Verwaltung + Import · O-P01 Push-Kern · H-P01 Push-Oberflächen · H-T03 Tests | Stufe B, **S2** (Chat, Rechte, Push), Kinderschutz-Liste belegt, Fast-Forward `main` (`chat`/`push` aus) |
| **E5 Kür A und Bewegung (Tag 5)** | O-B01 B-26 + Morphs + Register · H-B01…B08 SVG-Programm je Route · H-K01 Hatim · H-K02 Ramadan · H-K03 Kalender · H-K04 GiroCode · O-K05 Anzeige-CMS · H-K06 Gemeinde im Blick · H-K07…K11 K-B nach Priorität | Stufe B, Sichtabnahme → Befundpakete, Fast-Forward `main` |
| **E6 Betrieb und Härtung (Tag 6)** | O-S01 Kit für den lokalen Server · H-S01 Sicherung/Wiederherstellung/Kiosk · O-C02 Centrifugo-Signal · H-O01 Offline-Koran · H-X01/X02 Bestandslücken, Passkey · H-R02 Rechtsentwürfe · H-R03 Handbücher (Lehrkräfte, Eltern, Redaktion, Imam, Server), GO-LIVE, VERCEL-ENV · H-T04 tr/en-Entwürfe | Stufe B, **S3** vollständig, Datenfluss-Prüfung, `religion-pruefung` 0 |
| **E7 Abschluss (Tag 7)** | Stufe C, Endprüfung (frischer Opus, Blindvergleich), BERICHT mit Galerie und Vorführpfad, MENSCHEN/GO-LIVE vollständig, `_werkstatt/` des Vorlaufs nach `_archiv/` (sobald dessen ABSCHLUSS vorliegt), letzter Fast-Forward `main` mit Produktionsschaltern, eigenen CLAUDE.md-Block entfernen, ABSCHLUSS | – |

**Pfade:**
- **Kritischer Pfad:** Sofortstart → Daten (H-E0-B01) → Schema (O-F02) → Rechte (O-F03) → Konten (O-A01) → Aufnahme/Einwilligung (O-L01) → Chat (O-C01) → S2/S3 → Stufe C.
- **Parallel:**
  - Koran (H-F01/F02 → O-Q01 → Hadith/Elifbe → Werkstatt)
  - CMS (O-M01 → Module → Anzeige)
  - Push (O-P01 → Oberflächen)

**Prüfstufen:**
- **A** je Paket: Typen, Lint, betroffene Tests, Bilder mobil und Desktop, `religion-pruefung`, `freie-werte`; Build je Welle.
- **B** je Etappe: V-02-Build preview und production, alle Suiten, axe auf allen neuen Routen (Mein Bereich mit Anmeldung), Lighthouse ×3, reduzierte Bewegung, Momente (B-17/19/24/26), Rechte-Matrix, Vorschau.
- **S** an E2/E4/E6: frischer Opus-Agent mit Skill `security-review`; Befunde „hoch“ oder „kritisch“ blockieren den Fast-Forward.
- **C** in E7: Stufe B + Stichprobe + Startklar, release:check und Wortlaut + Funktionsliste F-01…F-60 + Tastatur + Register- und SVG-Abgleich + V-Liste + Datenfluss + Kinderschutz-Liste.

**Neue Tests (mindestens):**
- **Unit:**
  - Rechte und Konten: generierte Gruppen-Matrix, Admin-Ausschluss, Sitzungsgrenze, Alter/Einwilligung (16. Geburtstag).
  - Inhalte: Koran-Rundreise, Tajwid-Segmente, Übersetzungs-, Hadith- und Elifbe-Schemas, Blöcke.
  - Gebetszeiten und Werte: Ort/Zeitzone (Wetzlar vs. Frankfurt), GiroCode.
  - Push, Chat, Sicherheit: Push RFC 8291, Takt-Idempotenz, Chat-Cursor, Moderations-Kette, `.invalid`-Mail, Kopfzeilen je Pfad, Bundle-Regeln.
- **Integration (PGlite):**
  - Konten: Registrierung + Bestätigung, Benutzername.
  - Lernplattform: Aufnahme → Einladung → Einwilligung → Kinderkonto, Gruppenisolation.
  - Chat: senden, abrufen, melden, entfernen; Trigger verhindert UPDATE/DELETE; Löschlauf; Widerruf wirkt sofort.
  - Weitere: Hatim gleichzeitig, Newsletter-Double-Opt-in, CMS (Veröffentlichen, Revision, Weiterleitung, Zeitplan), Freigabe sperrt das öffentliche Lesen, Schalter aus → 404, Inhaltsmigration nur Beispiele.
- **E2E:**
  - Konten und Lernplattform: Anmeldung (Gemeinde, Kind, Lehrkraft + TOTP), Lernketten-Spec Voranmeldung → Anwesenheit → Fortschritt.
  - Koran: Wortkarte per Tastatur, Tajwid-Leiste, Player mit Testton, Werkstatt-Mitklopfen.
  - Weitere öffentliche Abläufe: GPS erlaubt/abgelehnt + Netz-Abhörung, Elifbe-Übung, CMS-Seite → öffentlich, Anzeige-Folien.
  - Chat und Push: zwei Browser-Kontexte + Melden, Push-Abo mit Attrappe.

**Vercel und `main`:**
- Vor jedem Fast-Forward: V-02-Build beider Betriebsarten (mit den Daten in der Bau-Datenbank, Ziel ≤ 15 min), `pnpm check`, Integration, `sprachen:pruefen`, startklar mit Produktionsschaltern, Datenfluss-Prüfung.
- Danach Produktion prüfen (curl der Hauptansichten, Deployment-ID; Vercel-MCP, falls verbunden); bei Rot Revert-Commit.

## 7. Abnahme und Risiken
**Kriterien** (ABNAHME v1.0; UMGEBUNGSAUSNAHMEN: echte Geräte/iOS, Docker-E2E, Vorschau ohne Datenbank, echte Push-Zustellung, Centrifugo ohne öffentliche Adresse – jeweils mit Ersatz):

| Z | Thema | Schwelle |
|---|---|---|
| Z-01 | Plan | 100 % Pflicht, Kür nach Priorität, PLAN mit Commits |
| Z-02 | Bestand | Suiten mindestens wie E0, F-01…F-60 ohne Rückschritt, 0 neue Konsolenfehler |
| Z-03 | Designsystem | 0 freie Werte in geänderten Dateien |
| Z-04 | Gestaltung | 12 neue Hauptansichten ≥ 8 im Blindvergleich, keine Kategorie < 7 (Surenansicht als Referenz, Koran-Übersicht, Hadith-Buch, Elifbe-Buchstabe, Lernen-Hub, Gebetszeiten „Mein Ort“, Schüler-Start, Eltern: Kind, Anwesenheit, Gruppenchat, Projekte fertiggestellt, Seiten-Editor) |
| Z-05 | Bewegung | B-01…B-27 im Register; reduziert ohne Lage/Größe; Momente ≤ 5 % verworfene Bilder bei 4× Drosselung |
| Z-06 | Grafik | eine Icon-Familie, eindeutige IDs, zugänglich |
| Z-07 | Zugänglichkeit | 0 ernste/kritische axe-Befunde auf allen neuen Routen; Koran-Wörter, Chat und Anwesenheit nur mit Tastatur bedienbar |
| Z-08 | Leistung | öffentlich ≤ 180 KB, LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 (auch `/quran/2`); Mein Bereich ≤ 230 KB; TBT nach Ausnahme A-01 des Vorlaufs ohne Rückschritt |
| Z-09 | Darstellung | 390/768/1440, de/tr voll, Harakat nicht abgeschnitten |
| Z-10 | Übergabe | BERICHT (Vorführpfad, Galerie), KERN 3.x, MENSCHEN, Handbücher, Anleitung Zusammenführen/Zurückrollen |
| Z-11 | Vercel | V-01…V-13 weiter erfüllt, Build mit Daten grün, Audio-Rewrite belegt |
| Z-12 | Recht/Startklar | Bestandstexte unverändert, neue als Entwurf, Cockpit-Prüfungen (Schalter, Freigaben, Takt, Sicherung, Kette) |
| Z-13 | Konten/Rechte | 100 % generierte Matrix inkl. Gruppen; 0 offene hohe/kritische Befunde aus S1–S3 |
| Z-14 | Kinderschutz | S-01…S-18 jeweils mit Test oder Beleg |
| Z-15 | Religiöse Inhalte | SHA + Rundreise 6.236 Verse; 0 ungeprüfte religiöse Inhalte öffentlich; `religion-pruefung` 0 |
| Z-16 | Koran/Rezitation | E2E: Lesen, Übersetzung, Wortkarte, Tajwid, Player (beliebige Rezitation), Werkstatt, Offline |
| Z-17 | Lernplattform | E2E-Kette Voranmeldung → Aufnahme → Eltern → Kind → Gruppe → Anwesenheit → Fortschritt |
| Z-18 | CMS | Seite, Menü, Revision, Weiterleitung, Zeitplan, Freigabe, Anzeige-Folie ohne Entwickler |
| Z-19 | Standort/Datenfluss | Koordinaten nie im Netz; Geolocation nur auf Gebetszeiten; Push nur nach Opt-in; 0 Drittanfragen öffentlich |
| Z-20 | Betrieb | Produktionsschalter sicher; Kit lauffähig (`docker compose config`, Wiederherstellungstest) |
| Z-21 | Moschee 2026 | 0 Aussagen „geplant/Zukunft“ zum Gebäude; Status fertiggestellt; Fakten als Platzhalter in MENSCHEN |

**Risiken:**
- **Lizenzen verzögern sich:** Alles läuft mit ehrlichen Platzhaltern und offenen Quellen; die eigene Rezitation kommt zuerst; Schalter je Ausgabe.
- **Tajwid-Versatz:** Tanzil-Variante pinnen; lieber ohne Färbung als falsch gefärbt.
- **Safari zerreißt arabische Ligaturen an Spans:** Graphem-Grenzen; in WebKit Tajwid aus, falls belegt (MN-19).
- **Schwere Surenseite:** `content-visibility`, sonst Abschnitts-Routen.
- **JS-Budget:** nur Knöpfe im ersten Chunk; Bundle-Test.
- **Kinderschutz und Rechte-Lecks:** Schalter aus, generierte Negativtests, S1–S3 blockieren den Fast-Forward.
- **Lokaler Server fällt aus:** Alles Kernhafte läuft ohne ihn (Abruf statt Echtzeit, täglicher Cron, In-Seite-Erinnerung); Cockpit zeigt den Zustand.
- **Kosten durch Chat-Abruf:** adaptiver Takt, Öffnungszeiten, Centrifugo-Signal.
- **Umfang wächst:** Kür nur aus Abnahmelücken; K-B entfällt zuerst.
- **Religiöser Fehler:** harte KI-Regel, Prüfwerkzeug, Freigabepflicht, nur Verweise.
- **Cloud verliert den Stand:** ZWISCHENSTAND-Commits stündlich, PRUEFPUNKT, Einrichtungsskript.

## Verifikation (Ende zu Ende)
1. Je Paket Prüfstufe A; je Welle Build; je Etappe Stufe B + Sichtabnahme; an E2/E4/E6 Sicherheitsprüfung.
2. Lokale Vorführung des Vorführpfads mit Beispieldaten:
   - Konten: Gemeinde, Eltern, Kind, Lehrkraft, Imam, Kinderschutz.
   - Inhalte und Lernen: Koran mit Testton-Rezitation, Elifbe, Lernkette.
   - Gemeinschaft und Pflege: Chat mit Melden, CMS-Seite, Anzeige.
   - Belege: Bildsatz + Galerie.
3. Vor jedem Fast-Forward von `main`: V-02-Build beider Betriebsarten, `pnpm check`, Integration, `sprachen:pruefen`, startklar, Datenfluss-Prüfung; danach Produktion per curl (Deployment-ID wechselt, Hauptansichten 200), bei Rot Revert.
4. Abschluss: Stufe C + Endprüfung durch frischen Opus-Agenten; Urteil wörtlich in die letzte Antwort; dann ABSCHLUSS.
