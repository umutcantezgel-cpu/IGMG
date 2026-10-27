# BERICHT – Lauf „Lern-App“

> **Stand 26.10.2026, 23:21 UTC** – App-Endstand `390b6715` auf `main`, live auf https://igmg-wetzlarer.vercel.app
> (`data-bau` `390b67150bac`; danach nur Tests und Unterlagen). Stufe C ist abgeschlossen: Fünf Prüfgruppen mit Gegenprüfung (`protokolle/C-*.md`), Nacharbeit N1–N9,
> frischer Endprüfer (`berichte/stufe-c.md`) und Vollständigkeitskritik (`protokolle/C-endpruefer-kritik.md`). Die Auflagen des
> Endprüfers sind behoben oder entschieden (L3-E17…L3-E21, `ENTSCHEIDUNGEN.md`); Status und Belege je Kriterium stehen in
> `ABNAHME.md`, der Abschluss in `ABSCHLUSS.md`.
> - Lauf vom 16.10. bis 26.10.2026, Etappen L0–L8, ≈ 1.240 Commits auf `claude/trusting-lovelace-6nfolz`.
> - Grundlage: `AUFTRAG.md`, Entscheidungen L3-E01…L3-E21 (`ENTSCHEIDUNGEN.md`), Mengen `berichte/mengen.md`, Leistung
>   `berichte/leistung.md`, Schalter `GO-LIVE.md`.

## Ergebnis in drei Sätzen

1. **Die Sprachkurse sind live,** Deutsch, Türkisch und Arabisch in allen sechs Richtungen, Stufen A1 bis B1 (Nutzer, L3-E16:
   „Bis B1 reicht erstmal“).
   - Je Richtung gibt es 42–43 Einheiten, 329–344 Lektionen und 5.250–5.677 Aufgaben.
   - Dazu kommen ein Schrift-Vorkurs, ein Einstufungstest und eine Wiederholung nach der Vergessenskurve. Alles läuft ohne
     Konto und auch offline.
   - Jede Einheit trägt den Hinweis „Noch nicht von Muttersprachlern geprüft“ (L3-E15). Er bleibt, bis Muttersprachler die
     Einheit in Stichproben geprüft haben.
2. **Islamisches Wissen und Koran-Arabisch sind technisch fertig, aber bewusst noch nicht sichtbar.**
   - Der Wissenskurs nach hanefitischer Lehre umfasst 26 Einheiten, 146 Lektionen und 2.124 Aussagen mit 4.603 Belegen. Alles
     ist Entwurf.
   - Der Koran-Arabisch-Pfad hat 40 Einheiten mit 936 häufigen Wortformen und noch keine Bedeutungen.
   - Sichtbar wird beides erst nach zwei menschlichen Schritten: Zwei Prüfende der Gemeinde (Imam und Hoca) geben jeden
     Baustein frei (LM-03), und die Hoca verfasst die Wortbedeutungen (LM-13). Bis dahin zeigt die App einen ruhigen Platzhalter.
3. **Offen sind Aufgaben für Menschen; technisch ist der Lauf abgenommen.**
   - Urteil des frischen Endprüfers: **abgenommen mit Auflagen** (unten wörtlich). Die Auflagen sind seitdem behoben oder als
     AUSNAHME mit Grund und Ersatz entschieden: Fokus in „Sprechen“ (243aecfe), Ladezeit des Lernpfads (b9e581e8), libvips nur
     in der Website-Hülle (L3-E18), Lighthouse-Note auf dem Messrechner (L3-E20); die Vercel-Bauzeit ist belegt (L3-E21).
   - Für Menschen: die Stichprobe durch Muttersprachler, die religiösen Freigaben, die Stimmen bzw. eigene Aufnahmen. Live gibt
     es noch kein Audio; Hörübungen zeigen „Audio folgt“.
   - Alles mit Konto ist gebaut und getestet: Abgleich, Gruppen und Lehrkräfte, Bestenliste, Schreibabgaben. Es bleibt aus, bis
     die Datenbank (G1) und der Datenschutz (LM-08) freigegeben sind. B2 und C1 sind offener Ausbau.

## Was du heute live siehst (igmg-wetzlarer.vercel.app)

Die Zahlen der Kurstabellen sind am 26.10.2026 um ≈ 09:05 UTC live nachgezählt (vom Endprüfer am Endstand bestätigt): Kursverzeichnisse, alle 254 Sprachpakete und
40 Koran-Pakete per curl, alle mit 200. Wortschatz und Sätze stammen aus dem Mengenbericht (`berichte/mengen.md`).

| Bereich | Adresse | Was es kann |
|---|---|---|
| Einstieg | Menü „Bildung › Sprachen lernen“ im Kopf und im Telefonmenü (de/tr/en); `/lernen`, Abschnitt „Üben in der Lern-App“ | der Menüpunkt führt direkt nach `/lern-app/de` (bzw. `/lern-app/tr`); die Stationen „Sprachen lernen“ und „Wissen üben“ auf `/lernen` ebenso |
| Start | `/lern-app/de`, `/lern-app/tr`, `/lern-app/ar` | Oberfläche in drei Sprachen; Kurswahl nach Ausgangssprache; „Heute“ mit Tagesziel und nach der ersten Lektion „Weiter lernen“; weitere Kurse (Wissen, Koran) |
| Lernpfad | `/lern-app/<oberfläche>/<kurs>` | Stufen A1–B1. Jede Einheit ist eine Station am Lernweg mit acht Teilen: Lektionen, eine Geschichte, eine Wiederholung und ein Prüfstein. Dazu Grammatik-Tipps, „Einheit offline speichern“ an jeder Station und „Stufe offline speichern“ am Ende jeder Stufe |
| Üben | `…/<kurs>/ueben?l=<lektion>` | 17 Übungstypen, u. a. Auswahl, Lücke, Wortbank, Paare, Satzbau, Dialog, Geschichte, Lesetext mit Fragen, Formen, Harakat (Arabisch), Sprechen und Schreiben mit Selbstbewertung. Rückmeldung nach jeder Aufgabe, ruhiger Abschluss, XP stehen fest |
| Wiederholen, Einstufung, Tipps | `…/<kurs>/wiederholen`, `…/einstufung`, `…/tipps` | fällige Karten nach Vergessenskurve (FSRS); Einstufungstest aus den Aufgaben der Einheiten (ohne Vorkurs); 242–263 Tipp-Karten je Richtung, die die beiden Sprachen vergleichen |
| Fortschritt, Wortschatz, Einstellungen | `/lern-app/de/fortschritt`, `/wortschatz`, `/einstellungen` | Tagesziel (auch „kein Tagesziel“), Serie mit 0–3 Pausetagen je Woche und Ruhezeit bis 30 Tage im Jahr, Abzeichen; Hör- und Sprechübungen abschaltbar; Lernstand als Datei sichern und einlesen |
| Quellen | `/lern-app/de/quellen`, `/quellen` | Namensnennung je Eintrag (Tatoeba, Wiktionary u. a.); Lerninhalte unter CC BY-SA 4.0 |
| Wissen | `/lern-app/de/islam` | *Nachtrag 27.10.2026 (L3-E22):* 26 Einheiten mit 146 Lektionen als „Entwurf zur Prüfung“ – Hinweis auf der Kursseite, Vermerk „Entwurf“ statt Prüfvermerk, Quellenzeile je Aussage; noch nicht von zwei Gelehrten geprüft. Vorher (26.10.): nur der Platzhalter „Jede Lektion erscheint erst, wenn zwei Gelehrte der Gemeinde sie geprüft haben“ |
| Koran-Arabisch | `/lern-app/de/koran` | 40 Einheiten in Grund-, Aufbau- und Vertiefungsstufe. Die Wortformen kommen aus den gepinnten Tanzil-Daten. „Bedeutungen geprüft: 0 von …“, keine Übungen, keine Computerstimme |
| Installieren | Manifest je Oberfläche, Service Worker `/lern-app/sw.js` | als App auf dem Telefon installierbar (PWA) |

**Die sechs Sprachkurse** (live gezählt; A1 = 12 Einheiten plus Schrift-Vorkurs):

| Kurs | Adresse | A1 | A2 | B1 | Lektionen | Aufgaben | davon Hörübungen („Audio folgt“) |
|---|---|---:|---:|---:|---:|---:|---:|
| Türkisch für Deutschsprachige | `/lern-app/de/tr-aus-de` | 12 + Vorkurs (2) | 14 | 15¹ | 330 | 5.250 | 347 |
| Arabisch für Deutschsprachige | `/lern-app/de/ar-aus-de` | 12 + Vorkurs (8) | 14 | 16 | 344 | 5.677 | 652 |
| Deutsch für Türkischsprachige | `/lern-app/tr/de-aus-tr` | 12 + Vorkurs (1) | 14 | 15¹ | 329 | 5.471 | 1.020 |
| Arabisch für Türkischsprachige | `/lern-app/tr/ar-aus-tr` | 12 + Vorkurs (8) | 14 | 16 | 344 | 5.677 | 652 |
| Deutsch für Arabischsprachige | `/lern-app/ar/de-aus-ar` | 12 + Vorkurs (6) | 14 | 15¹ | 334 | 5.543 | 1.041 |
| Türkisch für Arabischsprachige | `/lern-app/ar/tr-aus-ar` | 12 + Vorkurs (2) | 14 | 15¹ | 330 | 5.252 | 347 |

¹ B1 Einheit 16 bleibt in Deutsch und Türkisch Entwurf, bis die Redaktion entschieden hat: Deutsch wegen Politik und
Staatskunde (OF-10), Türkisch wegen eines Fehltreffers des Religionswächters beim Wort „Pilz“ (R-06). Siehe „Was nur
Menschen tun können“.

- **Wortschatz und Sätze je Zielsprache** (A1–B1, `berichte/mengen.md`):
  - 2.758–2.800 Wörter und 11.333–11.488 Sätze, alle in die jeweils zwei Ausgangssprachen übersetzt (100 %).
  - Über Aufgaben erreichen 9.333 (de), 7.572 (tr) und 7.591 (ar) Sätze ein Gerät. Der Rest ist Vorrat für spätere Übungen
    und wird nicht ausgeliefert.
- **Offline:** Jede Einheit lässt sich mit „Einheit offline speichern“ auf das Gerät holen (je Einheit ≈ 0,1–0,4 MB), eine
  ganze Stufe mit „Stufe offline speichern“ (Speicherbedarf vorher, abbrechbar). Danach ist sie ohne Netz spielbar, auch nach
  einer neuen Bereitstellung (N9a, G-1). Der Lernstand liegt auf dem Gerät (keine Cookies, keine Tracker) und lässt sich als Datei sichern.
- **Spielerisch, aber sanft:** XP, Tagesziel, Serie mit Pausetagen, Abzeichen, Lernpfad. Es gibt keine Herzen, keine Ligen,
  keine Zeitgrenzen und keine Schuld-Texte. Ist das Tagesziel erreicht, steht dort „Schön, dass du da bist.“
- **Von rechts nach links:** Die arabische Oberfläche (`/lern-app/ar/…`) läuft vollständig von rechts nach links, mit
  östlich-arabischen Ziffern (Standard nach LM-18). Vokalisierte Kursinhalte stehen in einer eigenen arabischen Schrift. Die
  übrige Website bleibt Deutsch, Türkisch, Englisch.
- **Beschriftung:** Kurskarten, Einstieg `/lernen` und Menüpunkt nennen „A1 bis B1“ (0e3a03a0), wie ausgeliefert.

**Bewusst aus** (Nutzer, L3-E12b: „Die App ist ein Teil der Seite!“ – an, aber ohne Personendaten; KERN §6, `GO-LIVE.md`):

| Funktion | Stand live | Warum | Was es zum Einschalten braucht |
|---|---|---|---|
| Konto und Abgleich mehrerer Geräte (`lernapp_sync`) | aus; `/lern-app/de/anmelden` → 404 | Lerndaten am Server sind besondere Personendaten (Art. 9 DSGVO) | Datenbank G1, Datenschutz LM-08, Auflage S-L3 N-2 |
| Gruppen: Zuweisungen der Lehrkraft, Lernwoche für Eltern, Schreibabgaben an die Lehrkraft (`lernapp_gruppen`) | aus; `/lern-app/de/gruppe` → 404 | Personendaten | LM-08, Schulung LM-14, Auflagen S-L3 M-1/N-3 |
| Bestenliste (`lernapp_rangliste`) | aus | Entscheidung des Vorstands offen; für Konten unter 16 im Code gesperrt | LM-10, LM-08 |
| Spracherkennung beim Sprechen (`lernapp_sprechen`) | aus. Sprechübungen laufen als Selbstvergleich, die Aufnahme verlässt das Gerät nie | Gerätetest auf iPhone, Android und Laptop fehlt | LM-07 |
| Statistik, Push-Erinnerung | aus | Entscheidung der Datenschutzbeauftragten | DSB, Web Push G4 |
| Audio | 0 Clips. Hörübungen zeigen „Audio folgt“ und werden ohne Wertung übersprungen | Deutsch: Stimme „Thorsten“ mit sauberer Rechtekette, aber Hörabnahme (LM-06) und Speicher (LM-15) offen. Türkisch und Arabisch: keine Stimme mit sauberer Kette (L3-E10a) | LM-06, LM-15; LM-24…LM-26 |
| „Fehler melden“ | Knopf sichtbar; eine Meldung kommt aber erst mit Datenbank an | anonyme Meldungen brauchen Datenbank und ALTCHA | G1 |
| Verwaltung der Lern-App | `/verwaltung/lernapp` zeigt „Verwaltung noch nicht eingerichtet“ | die Produktion läuft im Beispielmodus ohne Datenbank | G1, G2 |

## Vorführpfad (`AUFTRAG.md` §6, 9 Stationen)

**Was wo geht:**
- Die Stationen 1–5 gehen **live** auf der Test-Domain, ohne Konto und ohne Ton.
- Station 6 zeigt live den Platzhalter. Eine Lektion mit Testfreigaben zeigt die **Vorschau mit Testkurs**.
- Die Stationen 7–9 brauchen eine **Datenbank**: lokal mit Testdaten, in der Produktion erst nach G1 und den Freigaben.

1. **Einstieg – live.**
   - Weg: https://igmg-wetzlarer.vercel.app → Menü „Bildung“ → „Sprachen lernen“ → `/lern-app/de`. Alternativ `/lernen` →
     „Üben in der Lern-App“ → „Sprachen lernen“ → „Zur Lern-App“.
   - Zeigen: die Kurswahl (Türkisch, Arabisch; „Mit einer anderen Ausgangssprache lernen“) und „Tagesziel ändern“. Nach der
     ersten Lektion steht dort „Weiter lernen“.
2. **Türkisch lernen auf Deutsch – live.**
   - Weg: `/lern-app/de/tr-aus-de` → Lernpfad A1. Einheit 1 ist der Vorkurs, Einheit 2 heißt „Begrüßung und Vorstellung“.
   - Die erste Lektion lässt sich auch direkt öffnen:
     `/lern-app/de/tr-aus-de/ueben?l=tr-aus-de.a1.e01.l01`. Sie hat 16 Aufgaben mit Auswahl, Wortbank, Paaren, Lücke, Dialog
     und Grammatik-Tipp.
   - Nach jeder Antwort kommt die Rückmeldung („Richtig!“, mit „Fehler melden“), am Ende der Abschluss mit festen XP.
   - Hörübungen zeigen live „Audio folgt“. Mit Ton geht es nur im Testkurs (Vorschau, siehe unten).
3. **Offline – live.**
   - Im Lernpfad bei einer Einheit „Einheit offline speichern“ wählen; ein Ring zeigt den Fortschritt nach Bytes.
   - Dann Flugmodus an (am Rechner: Entwicklerwerkzeuge → Netzwerk → Offline), die Lektion vollständig spielen und wieder online
     gehen. Der Fortschritt bleibt.
   - Ganze Stufe: am Ende der Stufe A1 „Stufe offline speichern“; der Speicherbedarf steht vorher dort, Abbrechen ist möglich.
   - Der Knopf reagiert nach N8/N9a ohne spürbare Verzögerung (INP 160–208 ms statt 416 ms, `leistung.md` N9a.1).
4. **Deutsch lernen auf Arabisch – live.**
   - Weg: `/lern-app/ar/de-aus-ar`. Die Oberfläche läuft von rechts nach links.
   - Einheit 1 ist der Vorkurs Lateinschrift mit 6 Lektionen, z. B. `/lern-app/ar/de-aus-ar/ueben?l=de-aus-ar.a1.e00-ar.l01`.
   - Danach eine A1-Lektion: `/lern-app/ar/de-aus-ar/ueben?l=de-aus-ar.a1.e01.l01`.
5. **Wiederholen – live, mit vorbereitetem Gerät.**
   - Weg: `/lern-app/de/tr-aus-de/wiederholen` zeigt die fälligen Karten.
   - Karten werden erst fällig, wenn auf dem Gerät schon gelernt wurde. Für die Vorführung also am Vortag zwei Lektionen spielen.
   - Die Serie mit Pausetag steht unter `/lern-app/de/einstellungen` → „Serie“. Es gibt keinen Schuld-Text; nach dem Tagesziel
     erscheint „Schön, dass du da bist.“
6. **Wissen „Gebet“ – live nur der Platzhalter; mit Testkurs in der Vorschau.**
   - Live (`/lern-app/de/islam`) zeigt die Seite nur den Satz „Jede Lektion erscheint erst, wenn zwei Gelehrte der Gemeinde sie
     geprüft haben“. Das ist zugleich die Gegenprobe in der Produktion: Ohne zwei Freigaben ist nichts sichtbar.
   - Die **Vorschau mit Testkurs** zeigt die Testeinheit `islam.grund.test`. Sie enthält nur Platzhaltertexte, keine religiösen
     Inhalte, und hat Testfreigaben zweier nicht anmeldbarer Prüfkonten. Zu sehen sind der Lernpfad mit Prüfvermerk ohne Namen,
     die aufklappbare Quellenzeile je Aussage und eine als strittig markierte Aussage.
   - Gegenprobe in der Vorschau: Die Lektion `islam.grund.test.l02` hat nur eine Freigabe und erscheint nirgends
     (E2E `typen-wissen.spec.ts`).
   - Eine echte Lektion „Gebet“ gibt es erst nach LM-03.
7. **Koran-Arabisch – live ohne Bedeutungen; mit Bedeutungen nur lokal mit Datenbank.**
   - Live (`/lern-app/de/koran`): 40 Einheiten, z. B. „Einheit 1: Sure 1“ mit 26 Wortformen und „Bedeutungen geprüft: 0 von
     26“. Es gibt keine Übungen und keine Computerstimme.
   - Lokal legt `koran.spec.ts` für die erste Lektion Platzhalter-Bedeutungen mit je zwei Freigaben an. Damit ist die Lektion
     spielbar, ohne Audio.
   - Audio aus einer freigegebenen Rezitation gibt es erst nach der Aufnahme des Imams (MN-03). Heute lässt es sich nicht
     vorführen.
8. **Mit Konto – nur lokal mit Datenbank.**
   - Nötig sind die Schalter `FUNKTION_LERNAPP_SYNC=an`, `FUNKTION_LERNAPP_GRUPPEN=an` und `FUNKTION_LERNAPP_RANGLISTE=an`.
   - `zwei-geraete.spec.ts`: Zwei Geräte bewerten dieselbe Karte unterschiedlich und zeigen nach dem Abgleich denselben Stand.
   - `gruppe.spec.ts`: Die Lehrkraft weist zu, das Kind lernt ohne Bestenliste, und die Lehrkraft sieht „erledigt“. Dazu eine
     Schreibabgabe mit Rückmeldung.
   - In der Produktion erst nach G1, LM-08 und den Auflagen S-L3 N-2 und M-1.
9. **Verwaltung – nur lokal mit Datenbank.**
   - `/verwaltung/lernapp/sprachpruefung`: eine Stichprobe einer Einheit ziehen, mit Tastenkürzeln und Korrektur
     (`verwaltung-sprachpruefung.spec.ts`).
   - `/verwaltung/lernapp/religioes`: die Zwei-Prüfer-Ansicht. „Unsicher“ steht zuerst, die Fundstelle neben der Aussage; es
     gibt einen Haken je Beleg und den Stand 1/2 bzw. 2/2 von zwei verschiedenen Personen (`verwaltung-religioes.spec.ts`).
   - Live zeigt die Seite „Verwaltung noch nicht eingerichtet“. In der Produktion geht es erst nach G1 und G2 sowie LM-01 und
     LM-03.

**Vorschau mit Testkurs (Station 6, Hörübungen mit Testtönen):**
- Eine Preview-Bereitstellung bei Vercel mit der Variable `LERNAPP_TESTKURS=1`. Sie gilt nur für Preview, nie für Production
  (`web/docs/deploy/VERCEL-ENV.md`).
- Der Bau ohne Datenbank nimmt dann den Testkurs auf: in jedem Sprachkurs `<kurs>.a1.test` mit synthetischen Tönen, dazu
  `islam.grund.test` mit Testfreigaben.

**Vorführung lokal mit Datenbank (Stationen 6–9),** alle Befehle im Ordner `web/`, Anleitung `web/tests/e2e/LIESMICH.md`:
1. PostgreSQL, Mailpit und `.env` einrichten (§1–2), mit den Schaltern `FUNKTION_LERNAPP*=an`.
2. Bauen: `pnpm db:migrate && pnpm db:seed && pnpm inhalte:import && pnpm build` (§2 Schritt 2).
3. Vorführen: `pnpm test:e2e tests/e2e/lernapp/<spec>.spec.ts --project=desktop --headed`. Der Browser zeigt die Station. Der
   Test legt Konten und Testfreigaben selbst an und räumt danach auf.

## Was nur Menschen tun können

Liste und Standards: `_lernapp/MENSCHEN.md` (LM-01…LM-39, Nachträge Stufe C). Die Reihenfolge beim Freischalten steht in
`_lernapp/GO-LIVE.md`. Alles läuft bis zur Antwort mit dem Standard weiter; nichts Religiöses wird ohne zwei Menschen sichtbar.

| Rang | Schritt | Wer | Aufwand | Standard bis zur Antwort |
|---|---|---|---|---|
| 1 | **Religiöse Prüfung (LM-03):** mindestens zwei Konten mit der Rolle „religiöse Prüfung“, ohne Administrationsrolle (MN-24). Zuerst Taharah und Salah, dann der übrige Wissenskurs. Ebenso mit zwei Freigaben: die Formelliste (LM-09), die Koran-Bedeutungen (LM-13) und die Wurzeltabelle (LM-31). Wer etwas verfasst, gibt es nicht frei | Imam, Hoca | ≈ 200 h Wissenskurs; Übriges zu schätzen | nichts Religiöses sichtbar |
| 2 | **Muttersprachliche Prüfung (LM-01):** je Sprache mindestens zwei Personen mit der Rolle „Sprachprüfung“; Stichproben je Einheit unter Verwaltung › Lern-App › Sprachprüfung | Bildung, Vorstand | ≈ 60 h je Zielsprache + ≈ 20 h je Richtung | live mit Hinweis „Noch nicht von Muttersprachlern geprüft“; abgelehnte Einträge nie sichtbar |
| 3 | **Datenbank und Verwaltungskonten (G1, G2 der Website; MN-00):** Neon und die Geheimnisse in Vercel, darunter `ALTCHA_GEHEIMNIS`; Verwaltungskonten mit Zwei-Faktor | Technik, Vorstand | Schritte in `web/docs/GO-LIVE.md` G1/G2 | Beispielmodus: keine Meldungen, keine Verwaltung, keine Prüfoberflächen |
| 4 | **Redaktionsfragen (LM-02, LM-09):** Rahmenpläne abnehmen; Inhaltsleitfaden mit den offenen Fragen OF-01…OF-18 freigeben, darunter OF-10 „Politik und Staatskunde“: de.b1.e16 bleibt Entwurf, ar.b1.e10/e11 sind sachlich gehalten und mit Hinweis frei. Dazu R-06: Fehltreffer „Pilz“ in tr.b1.e16 („Fehltreffer“ oder „ersetzen“). Dazu die Fragen B1 tr/ar: Schreibweise *iş birliği*, Namen mit Längezeichen, Vokalisierung, Wortzahl der Schreibaufgaben, Figuren-Kanon, Passiv mit *tamma*, Kinderregel, Ausnahme für *li-* mit Artikel | Prüfende aus LM-01, Hoca, Vorstand | ≈ 3 h je Sprache + 1 h | Stand wie ausgeliefert; de und tr B1 e16 bleiben Entwurf; Lautet OF-10 „nein“, nimmt die Redaktion die drei Einheiten bzw. Abschnitte zurück |
| 5 | **Liste erlaubter Alltagsformeln (LM-09)**, z. B. Gruß und „inschallah“, mit zwei religiösen Freigaben | zwei Personen mit „religiöse Prüfung“ | zu schätzen | Alltagsformeln in den Sprachkursen gesperrt |
| 6 | **Stimmen und Audio:** Abweichung vom Wortlaut „Piper“ bestätigen und Hörabnahme der deutschen Stimme Thorsten mit 20 Sätzen und 10 Wörtern (LM-06); Blob-Speicher `lernapp` verbinden (LM-15, ≈ 0,93 GB); Türkisch: Rechte am Datensatz „Talent_TR_Male“ anfragen (LM-24); eigene Aufnahmen Türkisch 2–4 h und Arabisch-Kern 10–15 h mit Sprecher-Vereinbarung (LM-25, LM-26) | Nutzer bzw. Vorstand, Technik, Sprecherinnen und Sprecher | 1 h + 20 min; Aufnahmen 2–15 h | „Audio folgt“, Hörübungen übersprungen |
| 7 | **Datenschutz (LM-08):** DSFA-Nachtrag Lern-App, Einwilligungstext `lernapp`, Datenschutzerklärung, Löschfristen; offene Fragen D-L01…D-L15 (Entwürfe in `web/docs/recht/entwuerfe/`) | DSB, Recht | 4–6 h | Abgleich, Gruppen, Bestenliste, Statistik in der Produktion aus |
| 8 | **Werke und Ausgaben (LM-04, LM-33):** benannte hanefitische Werke bestätigen; ein Werk für die zwei Siyar-Einheiten benennen; Ausgaben der Hidāya und der ʿAqāʾid an-Nasafiyya festlegen, Marāqī al-Falāḥ beschaffen | Imam, Vorstand, Recht | 2 h + Beschaffung | Werke laut KERN §2.4; zwei Einheiten zurückgestellt (26 von 28 entworfen) |
| 9 | **Koran-Bedeutungen und Wurzeln (LM-13, LM-31):** die Bedeutungen der 936 Wortformen verfassen (Arbeitsliste liegt bereit); eine Lehrkraft für die Wurzeltabelle benennen | Hoca; Vorstand | 25–50 h; Benennung 5 min | nur Wortformen ohne Bedeutung, keine Wurzel-Übungen |
| 10 | **Gerätetest Sprechen (LM-07, LM-27):** iPhone, Android-Mittelklasse, Laptop | Technik | 2 h | Spracherkennung aus, Sprechen nur als Selbstvergleich |
| 11 | **Kurze Entscheidungen des Vorstands** (je ≈ 5 min): Veröffentlichung vor der Stichprobe (LM-11), Bestenliste (LM-10), Prüfvermerk ohne Namen (LM-20), Ziffern im Arabischen (LM-18), Motivliste der Bildkarten (LM-34), Lizenz CC BY-SA 4.0 (LM-12), keine Spendenaufrufe (LM-35), eigene „Ich kann …“-Sätze (LM-36), kein NC-/ND-Material (LM-21) | Vorstand | ≈ 1 h zusammen | jeweils der Standard in MENSCHEN.md (ja mit Hinweis; Bestenliste aus; ohne Namen; östlich-arabisch; keine Lebewesen; CC BY-SA 4.0; keine; eigene Sätze; nein) |
| 12 | **Weitere:** Lehrkräfte schulen (LM-14); Screenreader-Prüfung mit NVDA, VoiceOver und TalkBack (LM-19); İlmihal-Zitaterlaubnis und Anfrage bei der IGMG e. V. (LM-05); eigene Sammlung von Bittgebeten (LM-16); kindgerechter Pfad (LM-17); Trainingsdaten-Frage (LM-22); OpenITI-Anfrage (LM-30); Joseph Hell 1923 (LM-32) | Bildung, Technik, Imam, Hoca, Vorstand, Recht | je nach Punkt | Handbuch; UMGEBUNGSAUSNAHME; nur Seitenverweis; nur Bittgebete aus dem Koran per Verweis; Kennzeichnung „für Kinder geeignet“; konservativ; nicht nötig; nicht verwendet |
| 13 | **Aus der Abnahme (Stufe C):** libvips in den Lern-App-Seiten der Website-Hülle unter M-060 bestätigen oder den Umbau beauftragen (LM-37, L3-E18); Vercel-Bauzeit im Dashboard bestätigen (LM-38, L3-E21); Lighthouse-Leistung auf einem Referenzgerät bzw. mit PageSpeed Insights gegenmessen (LM-39, L3-E20) | Vorstand, Technik | je ≈ 10 min | M-060 gilt mit; Beleg Push bis live 11 min 24 s; Ersatz Messung live auf dem Messrechner |

## Stand der Prüfungen

- **Schluss-Tor am Endstand** (`b9e581e8`, Arbeitsbaum `l3-05`; Nachläufe am Code-Endstand `808edeed` in `l8`; PostgreSQL/Mailpit, alle Lern-App-Schalter an):
  - Produktionsbau grün (5 min).
  - Lern-App-E2E (telefon + desktop): 159 grün, 1 rot, 46 übersprungen. Das Rote (`offline.spec`, Telefon) kam von der Verschiebung in b9e581e8: Die
    Stationen über „Stufe offline speichern“ zeichnen sich erst in Sichtweite, der Knopf rutschte beim Tippen. Der Test tippt jetzt
    erst, wenn der Knopf still steht (808edeed); Nachlauf `offline.spec` und `lernpfad.spec` je zweimal: **20 grün, 0 rot**.
  - Übrige Website-E2E: **323 grün, 0 rot**, 89 übersprungen (meist nur-Desktop- bzw. nur-Telefon-Tests). Die sechs Specs zu Kopf und Menü liefen am Stand `e0292127` mit 663 grün, 0 rot,
    7 übersprungen; an Kopf und Menü hat sich seither nichts geändert.
  - Integration voll: **3.878 grün**, 2 erwartet rot, 4 übersprungen (93 Dateien). `pnpm check` (Typen, Lint, Unit): Typen und Lint grün, **Unit 3.717 grün** (194 Dateien; im Tor lief
    parallel zur E2E einmal eine 5-s-Zeitgrenze ab, ohne Last wiederholt grün).
- **Volles Tor** (Stand `e06a648b`, `scratchpad/tor-final/zusammenfassung.md`):
  - Unit 3.656 grün; Integration 3.878 grün.
  - `sprachen:pruefen`, Religion und Wortlaut rc=0; `lernapp:pruefen` 0 blockierend.
  - Import-Bau wie Vercel 609 s, 2.438 Seiten, Sweep ohne 5xx; Vorschau-Bau 647 s.
  - E2E 1.222 Tests: rot nur sieben Zeitgrenzen der Cüz-Seiten (f56f74bd, danach 12/12 grün) und einmal `gruppe.spec:155` unter
    Volllast (an Bau 5 grün).
- **Nach der Nacharbeit:**
  - N9a: Lern-App-E2E 114 grün, 0 rot. N9b an Bau 5 (Merge N9a + N9b): 159 grün, 0 rot, 45 übersprungen.
  - Endstand `e0292127`: `pnpm typen` und Unit 3.717 grün, Religion und Sprachen grün, Website-E2E Kopf 663 grün, 0 rot.
- **Inhalte:** `lernapp:pruefen` 0 blockierend über 435 Dateien und 137.493 Einträge; Quelle, Lizenz und Namensnennung 100 %,
  Dubletten 0,00 %. Lektorat 126/126, Rückübersetzung 126/126, Schlussprüfungen 9/9.
- **Religion:** `religion-pruefung` 0 Befunde. Live 0 Einträge mit Religionsbezug in 254 Sprachpaketen; 0 Audio zu Religion,
  Wissen und Koran; 0 von 936 Koran-Bedeutungen von einer KI.
- **Leistung live** (Lighthouse mobil auf dem Messrechner, Median aus 3 Läufen, `berichte/leistung.md` Abschnitt „Schluss“):
  - Vorher (Endstand des Endprüfers): Start 92, Übungen 83–90, aber der Lernpfad nur 69–71 mit **LCP 5,6–5,8 s** – der Block
    „Stufe offline speichern“ aus N9a wurde spät gezeichnet und war das größte Element im ersten Bildschirm.
  - Nachher (b9e581e8, Block am Ende der Stufe; gemessen parallel zum Schluss-Tor unter Last 4,6–10,7): Start 92 · LCP 1,9 s,
    Lernpfad de 92 · LCP 1,9 s, Lernpfad ar 88 · LCP 1,9 s. Zugänglichkeit überall 100, CLS ≤ 0,007, JS-Budgets eingehalten.
  - Die Übungsseiten bleiben auf dem Messrechner bei 83–90 (TBT 360–560 ms aus der Drosselung) → AUSNAHME L3-E20, LM-39.
- **Bereitstellung:** Vom Push auf `main` bis live vergingen für `b9e581e8` **11 min 24 s** (22:01:17 → 22:12:41 UTC) – eine
  Obergrenze für Bau und Bereitstellung, also ≤ 15 min (L3-E21). Andere Stände brauchten 20–34 min, weil mehrere Vercel-Projekte
  und die Vorschau des Branches dasselbe Repository nacheinander bauen. Lokal wie Vercel 609 s; das Dashboard bestätigt LM-38.

**Kriterien Z-L01…Z-L22** (Schwellen und Belege in `ABNAHME.md`; Endprüfer = `berichte/stufe-c.md`):

| Z | Kriterium | Endprüfer | Nach den Auflagen | Kurz |
|---|---|---|---|---|
| Z-L01 | Umfang Sprachkurse | erfüllt | erfüllt | 42 Einheiten, 336 Stationen, 2.758–2.800 Lemmata, 11.333–11.488 Sätze je Zielsprache, Übersetzungen 100 %; gezählt sind die Inhaltsdateien, in Aufgaben ausgeliefert Sätze 67,6–83,3 % und Lemmata 91,8–95,2 % des Ziels |
| Z-L02 | Wissenskurs | AUSNAHME | AUSNAHME (L3-E19) | 26/28 Einheiten, zwei bis zur Benennung der Werke zurückgestellt (LM-04); live 0 sichtbar |
| Z-L03 | Koran-Arabisch | erfüllt | erfüllt | 80/80 Pakete ohne Bedeutungen; Bedeutungen nur durch Menschen |
| Z-L04 | Offline | erfüllt | erfüllt | Einheit und Stufe offline, Bauwechsel G-1, Root-SW |
| Z-L05 | Abgleich | erfüllt | erfüllt | Eigenschaftstests, Integration, zwei Geräte |
| Z-L06 | Zugänglichkeit | erfüllt (L3-E17 offen) | erfüllt | axe-Matrix 26/26, alle Typen per Tastatur; L3-E17 bestätigt; Fokus in „Sprechen“ behoben (243aecfe) |
| Z-L07 | Leistung | teilweise | AUSNAHME (L3-E20) | Budgets, LCP, CLS, INP erfüllt; Lighthouse live: Start und Lernpfad de 92, Lernpfad ar 88 (unter Last), Übungen 83–90 (TBT); LCP des Lernpfads 5,7 → 1,9 s (b9e581e8) |
| Z-L08 | Datenfluss | erfüllt | erfüllt | nur GET an den eigenen Ursprung, auch mit echtem Modell |
| Z-L09 | Kinderschutz | erfüllt | erfüllt | Bestenliste ab 16, Gruppen- und Elterntrennung |
| Z-L10 | Religion-Prüfung | erfüllt | erfüllt | 0 Befunde, Formelliste erzwungen |
| Z-L11 | Bewegung | erfüllt | erfüllt | Register B-28…B-35 mit reduzierter Variante |
| Z-L12 | Betrieb | erfüllt | erfüllt | Schalter wie KERN §6, Cockpit-Karte |
| Z-L13 | Sprachen und RTL | erfüllt | erfüllt | `sprachen:pruefen`, RTL ohne Überlauf |
| Z-L14 | Inhaltsprüfer | erfüllt | erfüllt | 0 blockierend, Quelle/Lizenz 100 % |
| Z-L15 | Audio | AUSNAHME | AUSNAHME | „Audio folgt“ bis zur Hörabnahme (LM-06) |
| Z-L16 | Bau | teilweise | erfüllt (L3-E21) | Push bis live 11 min 24 s ≤ 15 min; Bau beider Betriebsarten, Website-Suiten ohne Rückschritt |
| Z-L17 | Lizenzverzeichnis | erfüllt | erfüllt | `/quellen` live vollständig |
| Z-L18 | Ausschlüsse | erfüllt | erfüllt | 0 NC/ND, 0 OpenITI-Dateien, 0 QAC |
| Z-L19 | Werkzeuge nur lokal | teilweise | AUSNAHME (L3-E18) | öffentliche Lern-App frei von libvips; Verwaltung/Mein Bereich über die Website-Hülle nach M-060 (LM-37) |
| Z-L20 | Herkunft der Stimmen | erfüllt | erfüllt | 0 Clips; Thorsten mit voller Kette, nicht freigegeben |
| Z-L21 | Qualität der Stimmen | AUSNAHME | AUSNAHME | „Audio folgt“; 0 Audio zu Religion |
| Z-L22 | Versionen und Modelle | erfüllt | erfüllt | exakt gepinnt, Whisper-SHA live gleich |

**Zählung:** Endprüfer 16 erfüllt, 3 AUSNAHME, 3 teilweise. Nach den Auflagen 17 erfüllt, 5 AUSNAHME, 0 teilweise – jedes Kriterium erfüllt oder AUSNAHME mit
Grund und Ersatz, wie es das Tor L8 verlangt (`PLAN.md` §14).

**Nacharbeit nach der Stufe C:**

| N | Was | Behoben | Merge |
|---|---|---|---|
| N1 | Testkurs von echten Inhalten getrennt: Testeinheit `<kurs>.a1.test` nur mit `LERNAPP_TESTKURS=1`; Paketbau nur mit freigegebenen Stimmen; Feld für die Hörabnahme | Einheit 1 ist live wieder die echte („Begrüßung und Vorstellung“), 0 Testtöne (Z-L15, Z-L20, Z-L21) | 25515a23 |
| N2 | Freigabe-Härtung: die religiöse Prüfung als Schutzrolle (nie zusammen mit Administration, nie an sich selbst), Formelliste in Prüfer und Paketbau erzwungen, Wächter erweitert | Z-L02, Z-L10 | 7029a828 |
| N3 | Auslieferungsweg des Wissenskurses (Verzeichnis, Einheit, Paket, Spieler), strittige Themen ausgewiesen; alle Koran-Pakete vorgerendert | live 40/40 Koran-Einheiten statt 1/40 (Z-L02, Z-L03) | aa8b273f |
| N4 | Kleinkram: kein `sharp` in der Lern-App, Lizenzhinweise von ONNX Runtime offline, Python-Pins mit Hashes, Messwerkzeuge, Unterlagen | Z-L17, Z-L19, Z-L22 | 0eb19c2e |
| N5 | Test „Meldung aus Kinderkonto“; L3-E12b und KERN §6 nachgetragen; Abmelde-Worker beim Abschalten (S-L3 N-4 als AUSNAHME); Warteschlange der Sprachprüfung 7,3 → 2,3–3,0 s; E2E stabilisiert | Z-L09, Z-L12 | 9a8ca1f8 |
| N6 | Paketbau einer Richtung ≈ 2 s statt ≈ 9 s, der Server blockiert höchstens 0,4 s statt 6–10 s; gezielte Cache-Erneuerung in der E2E; Leistung mit echten Inhalten gemessen; Spieler-Budget ≤ 60 KB | Z-L07 (Budgets), Z-L16 | e06a648b |
| N7 | Prüferregeln (Übersetzung gleich Quelltext oder falsche Schrift, Probe des Paketbaus); 25 Aufgaben berichtigt; Mengenbericht A1–B1; Einstufung ohne Vorkurs; dazu ein Satz in de-aus-tr übersetzt (452102ea) | Z-L01, Z-L14 | 25ce3abf |
| N8 | Lernpfad schlank (zugeklappte Stufen, Stationen in Zeitscheiben), „offline speichern“ in kleinen Schritten, Paketprüfung im Spieler entlastet | Z-L07 (TBT, INP) | 2d6c1adc |
| N9a | Offline: Bauwechsel G-1 (Kursvorrat je Bau, überholter Worker schreibt und löscht nichts), „Stufe offline speichern“, Wiederholen ohne Netz, Wissenskurs nur mit Prüfvermerk, INP des Lernpfads | Z-L04, Z-L07 | 11e45cbe |
| N9b | Zugänglichkeit und Datenfluss: axe-Matrix über alle Routen × de/tr/ar × 390/1440, echte Tastaturwege, Ansage der 15-s-Grenze, Netzprotokoll mit echtem Whisper-Modell | Z-L06, Z-L08 | a9a79302, e0292127 |
| Schluss | Menüpunkt „Sprachen lernen“ (1482184c); Fokus in „Sprechen“ nach „zu leise“/„kein Mikrofon“ (243aecfe); „Stufe offline speichern“ ans Ende der Stufe, LCP des Lernpfads (b9e581e8); Beschriftung A1–B1 (0e3a03a0); E2E robuster (808edeed); Entscheidungen L3-E17…L3-E21 | Z-L06, Z-L07, Z-L16, Z-L19 | `main` |

**Offener Ausbau:**
- B2 und C1 (L3-E16). Für Deutsch B2 liegen 12 Einheiten als unsichtbarer Entwurf bereit (1.275 Lemmata, 5.145 Sätze).
- Wissenskurs: 1.041 Quizfragen statt ≈ 1.700; Siyar-Einheiten nach LM-04.
- Website-Hülle so umbauen, dass `sharp` nur in den Upload-Seiten gebunden wird (L3-E18).
- Mehr Sätze aus dem Vorrat in Aufgaben bringen (Z-L01-Auslegung).

## Urteil des Endprüfers (wörtlich)

Frischer Endprüfer, Stufe C, 26.10.2026, Stand `e0292127` (`berichte/stufe-c.md`):

> **Gesamt: abgenommen mit Auflagen.** Am Endstand `e0292127` sind 16 der 22 Kriterien erfüllt. Drei sind als begründete AUSNAHME mit wirksamem Ersatz belegt: Z-L02, weil der Wissenskurs bis zur Benennung der Werke 26 von 28 Einheiten umfasst (LM-04), sowie Z-L15 und Z-L21 mit „Audio folgt“, solange keine Stimme die Hörabnahme bestanden hat. Die Sprachkurse A1–B1 sind in allen sechs Richtungen vollständig: je Zielsprache 42 Einheiten, 336 Stationen, 2.758–2.800 Lemmata und 11.333–11.488 Sätze, Übersetzungen zu 100 %. Sie sind live mit dem Hinweis „noch nicht von Muttersprachlern geprüft“. Wissensinhalte, Koran-Bedeutungen und Audio sind ohne zwei menschliche Freigaben bzw. ohne Hörabnahme nicht sichtbar. Offline, Abgleich, Zugänglichkeit, Datenfluss, Kinderschutz, Religion-Prüfung, Inhaltsprüfer und Lizenzen habe ich mit eigenen Proben an Code, Logs und live bestätigt. Die Lücken der Gruppenprotokolle sind am Endstand geschlossen, darunter Bauwechsel G-1, „Stufe offline speichern“, die axe-Matrix, das Netzprotokoll mit echtem Modell, die Testtöne und die Formelliste.
>
> Drei Kriterien bleiben teilweise; sie sind die Auflagen:
> - **Z-L07 Leistung:** Die Lighthouse-Leistung liegt bei 80–89 statt ≥ 90, gemessen auf einem langsameren Rechner unter Last. Budgets, LCP, CLS und INP sind im Wesentlichen eingehalten.
> - **Z-L19:** Die Lern-App-Seiten in Verwaltung und Mein Bereich tragen über die Website-Hülle libvips (LGPL-3.0) in der Bau-Ausgabe. Die öffentliche Lern-App ist frei davon.
> - **Z-L16:** Die Vercel-Bauzeit ≤ 15 min ist nicht belegt. Bau und Website-E2E des Endstands sind grün (663/0), und der Endstand ist live.
>
> Vor der Übergabe sind diese drei Punkte zu beheben oder ausdrücklich zu entscheiden. Außerdem ist die Ausnahme L3-E17 (Aufnahme bis 15 s) zu bestätigen. Was nur Menschen tun können, steht in `MENSCHEN.md`: Muttersprachler-Stichproben, zwei religiöse Prüfende, Werke für den Wissenskurs, Hörabnahme der Stimmen, Gerätetest und Screenreader, Produktionsdatenbank und Geheimnisse. Solange diese Schritte fehlen, ist nichts Ungeprüftes sichtbar.

**Was seitdem geschah** (Orchestrator, nach der Vollständigkeitskritik `protokolle/C-endpruefer-kritik.md`):
- L3-E17 (Aufnahme bis 15 s) bestätigt; Fokusverlust in „Sprechen“ behoben (243aecfe, E2E-Schritt).
- Z-L19: AUSNAHME L3-E18 – libvips nur serverseitig in der Website-Hülle nach M-060; Bestätigung LM-37.
- Z-L02: AUSNAHME L3-E19 festgehalten.
- Z-L07: Live gemessen. Dabei zeigte sich eine LCP von 5,7 s auf dem Lernpfad durch den spät gezeichneten Block „Stufe offline
  speichern“; behoben (b9e581e8). Die Lighthouse-Note bleibt auf dem Messrechner unter 90 → AUSNAHME L3-E20 mit Ersatz und LM-39.
- Z-L16: erfüllt – vom Push bis live 11 min 24 s am Endstand (L3-E21); das Dashboard bestätigt LM-38.
- Prüfumfang am Endstand offengelegt: Schluss-Tor mit Lern-App- und Website-E2E, voller Integration und Unit (oben).

## Galerie

- Die Aufnahmen stammen live von https://igmg-wetzlarer.vercel.app am Endstand (`data-bau` `390b67150bac`), gemacht am 26.10.2026
  gegen 22:45 UTC mit `galerie-live.mjs` (Scratchpad).
- Handy 390 px (doppelte Pixeldichte), Desktop 1440 px, jeweils ein frisches Gerät ohne Konto und ohne Lernstand.
- Der einmalige Hinweis „Konzept-Website“ der Website ist geschlossen (Merker im Gerätespeicher).

| | |
|---|---|
| ![Start, Handy](galerie/01-start-390.jpg) Start mit „Heute“ und Tagesziel | ![Start, Desktop](galerie/02-start-1440.jpg) Kurswahl: Sprachen und weitere Kurse |
| ![Lernpfad, Handy](galerie/03-lernpfad-390.jpg) Lernpfad Türkisch: Einstufung, Wiederholen, Stufe A1 | ![Lernpfad, Desktop](galerie/04-lernpfad-1440.jpg) Lernpfad A1 mit Hinweis „Noch nicht von Muttersprachlern geprüft“ |
| ![Lektion, Handy](galerie/05-lektion-390.jpg) Erste Aufgabe der ersten Lektion | ![Rückmeldung, Desktop](galerie/06-lektion-1440.jpg) Dieselbe Aufgabe nach „Prüfen“: Rückmeldung mit „Fehler melden“ |
| ![RTL, Handy](galerie/07-rtl-lernpfad-390.jpg) Deutsch für Arabischsprachige: von rechts nach links | ![RTL, Desktop](galerie/08-rtl-lernpfad-1440.jpg) Vorkurs Lateinschrift im Lernpfad |
| ![Wissen](galerie/09-wissen-platzhalter-390.jpg) Wissenskurs: Platzhalter ohne Freigaben | ![Koran-Arabisch](galerie/10-koran-platzhalter-1440.jpg) Koran-Arabisch: Wortformen, 0 geprüfte Bedeutungen |
| ![Einstieg, Handy](galerie/11-lernen-einstieg-390.jpg) Einstieg `/lernen` | ![Menü, Desktop](galerie/12-menue-sprachen-lernen-1440.jpg) Menü „Bildung › Sprachen lernen“ im Kopf der Website |
