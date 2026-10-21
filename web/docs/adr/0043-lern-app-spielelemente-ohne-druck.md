# ADR 0043 – Lern-App: Spielelemente ohne Druck

- Status: **angenommen im Tor L0 (20.10.2026)** mit den Abschnitten „Fortschreibung …“ (Orchestrator nach L3-E12; Gegenprüfung L0 ohne Mangel hoch/mittel) · vorher: angenommen im Kern (Nutzerentscheidung „Spielerisches“ vom 16.10.2026, L3-E02) (Lauf Lern-App); Werte und Texte vorgeschlagen · Bezug: Plan „Lern-App“ Kontext (Widerspruch „Spielerisches“), §1, §2.5; `_lernapp/PLAN.md` §8, §10, §11; AUFTRAG Gemeinde-Plattform §1 („Bewusst abgelehnt“); KERN 3.0 „Gestaltung“; DSFA Lernplattform R-08 (`web/docs/recht/entwuerfe/dsfa-lernplattform.md`) · Ausnahme von „keine Ranglisten“ (KERN 3.0, AUFTRAG) für die Lern-App per Nutzerentscheidung

## Kontext

- Nutzerentscheidung: sanft, ohne Druck. XP, Tagesziel, Serie mit Pausetagen und ohne Schuld-Mitteilungen, Abzeichen, Lernpfad, Wiederholung nach Vergessenskurve. Bestenliste freiwillig, nur in der eigenen Gruppe oder Familie; für Kinder aus.
- Bestand: Der Vorlauf hat „Ranglisten, Serien-Druck, Punktevergleich“ und „hochzählende Zahlen“ bewusst abgelehnt (AUFTRAG Gemeinde-Plattform §1). KERN 3.0: „Keine hochzählenden Zahlen, keine Ranglisten“. Die DSFA nennt als Gegenmittel zu R-08 (Überwachung und Leistungsdruck) „keine Ranglisten, keine Punktevergleiche“.
- Kinder nutzen die App; Suchtmuster und Vergleichsdruck schaden ihnen besonders.
- Muster wie Herzen, Ligen und Verlust-Alarme erzeugen Druck.

## Entscheidung

1. **XP:** Lektion 10, Geschichte 15, Prüfstein 20, Wiederholung 1 je 2 Karten (höchstens 10), Schreiben 15. Keine Zeitboni. Die Zahl steht statisch da und zählt nie hoch.
2. **Tagesziel:** 10, 20, 30 oder 50 XP, 1, 2 oder 3 Lektionen oder „kein Ziel“ `[Standard festlegen]`.
3. **Serie** „Lerntage in Folge“:
   - automatisch bis zu 2 Pausetage je Kalenderwoche (einstellbar 0–3)
   - dazu bis zu 30 Tage Ruhezeit im Jahr (z. B. Urlaub, Krankheit, Ramadan)
   - Darstellung als Wochenband mit Achtsternen (Muster `website/veranstaltungen/Wochenband.tsx`)
   - **nie** „Serie verloren“, keine Schuld- oder Verlust-Mitteilungen; nach einer Pause ein freundlicher Wiedereinstieg („Schön, dass du da bist“)
4. **Erinnerung:** standardmäßig keine. Auf Wunsch Web Push (ADR 0034) mit Konto und Opt-in, Thema `lernapp`, Schalter `push_lernapp`; neutraler Text ohne Bezug zur Serie. Kinder nur mit der Einwilligung `push_kind` der Eltern (Bestand).
5. **Abzeichen** (≈ 40 Arten): Stufe je Kurs abgeschlossen (A1–C1), Lerntage gesamt (7/30/100/365, nicht in Folge), Wortschatz (100 bis 5.000), Schrift gemeistert (Arabisch, Latein, Türkisch), Geschichten, Wiederholungen, erstes Sprechen und Schreiben, Bereiche des Wissenskurses, Gruppenziel. Formen aus der Achtstern-Geometrie (Muster `website/nachrichten/KategorieMarke.tsx`). „Stufe abgeschlossen“ heißt nie „Zertifikat“.
6. **Lernpfad:** Stationen an der Linie (B-24); ein Prüfstein ab 80 % erlaubt, eine Einheit zu überspringen; Einstufungstest mit 20 Aufgaben, adaptiv, lokal.
7. **Gruppe:** Standard ist das **Gruppenziel**: Summe der XP gegen ein Wochenziel der Lehrkraft, ohne Namen. Eltern sehen die Lernwoche ihrer Kinder.
8. **Bestenliste** (Ausnahme per Nutzerentscheidung):
   - nur in einer Lerngruppe oder einer Familie; die Lehrkraft schaltet sie für die Gruppe, die Eltern für die Familie ein
   - freiwillig: Es erscheint nur, wer selbst zugestimmt hat; Zustimmung jederzeit widerrufbar
   - nur Personen ab 16 Jahren; Konten unter 16 erscheinen nie und sehen keine Bestenliste. Die Sperre steht im Code (`sechzehnAm`, `istKind`), nicht in einem Schalter.
   - Wochen-XP, Vorname und Initial (S-14), ohne Medaillen
   - Schalter `lernapp_rangliste` (Personendaten; Produktion aus, setzt `lernapp_gruppen` voraus; LM-10)
9. **Ausgeschlossen:** Herzen oder Leben, Ligen, öffentliche oder globale Ranglisten, Zeitdruck und Zeitgrenzen (WCAG 2.2.1), Käufe, Werbung, Tracker, hochzählende Zahlen. Falsche Antworten kommen am Ende der Lektion ohne Strafe noch einmal.
10. **Wortlaut:** `tests/unit/lernapp/sanfte-texte.test.ts` prüft eine Liste verbotener Formulierungen in `messages/lernapp/{de,tr,ar}.json`, z. B. „verloren“ oder „verpasst“ im Zusammenhang mit der Serie `[Liste je Sprache festlegen, tr und ar von Muttersprachlern prüfen lassen]`.
11. **Bewegung** (Register in KERN fortschreiben), nur CSS, jeweils mit reduzierter Variante:

    | ID   | Bewegung                                                                                             | Reduziert                                  |
    | ---- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------ |
    | B-28 | Lektionsleiste füllt sich je Aufgabe (vom Anfang der Zeile)                                          | ohne Übergang                              |
    | B-29 | Rückmeldeblatt von unten; richtig: Achtstern füllt sich (B-18), falsch: Farbe und Text ohne Bewegung | nur Deckkraft                              |
    | B-30 | Lektion abgeschlossen: Achtstern-Ring zeichnet sich ≤ 1,6 s; XP und Tagesziel statisch               | Endzustand                                 |
    | B-31 | Wortkachel wandert in die Antwortzeile (Deckkraft + 8 px)                                            | sofort                                     |
    | B-32 | Paar gefunden: Häkchen zeichnet sich, Paar wird gedämpft                                             | Häkchen sofort                             |
    | B-33 | Serie: heutiger Stern im Wochenband füllt sich einmal am Tag                                         | gefüllt                                    |
    | B-34 | Abzeichen erhalten: Deckkraft und Skalierung 0,96 → 1                                                | nur Deckkraft                              |
    | B-35 | Aufnahme läuft: Pegelbalken                                                                          | statischer Punkt und Text „Aufnahme läuft“ |

## Fortschreibung durch L7-02 (21.10.2026)

Gilt vor Nr. 7 und 8, wo es genauer ist. Umsetzung: `web/src/lib/lernapp/gruppe/{regeln,dienst,protokoll}.ts`, Route
`/api/lernapp/gruppe`, Seite `/lern-app/[ui]/gruppe`, Lehrkraft-Seite `/mein-bereich/unterricht/[gruppe]/lern-app`,
Migration `0021_lernapp_gruppen.sql` (`lernapp_gruppe`, `lernapp_familie`, `lernapp_rangliste_zustimmung`).

12. **Gruppenziel (Nr. 7):** Wochenziele 50, 100, 200, 300, 500 oder 1.000 XP (Woche Montag bis Sonntag, Berliner
    Lerntage). Die Summe zählt nur Lernende, deren Einwilligung `lernapp` gilt, und erscheint erst ab **drei** solchen
    Lernenden; darunter steht nur das Ziel, damit die Summe nicht auf Einzelne schließen lässt.
13. **Bestenliste (Nr. 8):** „ab 16“ heißt im Code: kein Kinderkonto (`istKind`) und – mit Lerndatensatz – `sechzehnAm`
    erreicht; ohne bekanntes Datum gilt „unter 16“. Es erscheint nur, wer selbst zugestimmt hat **und** deren
    Einwilligung `lernapp` gilt. Die Zustimmung speichert die Version des angezeigten Wortlauts; „ausblenden“ löscht sie
    ohne Verlauf. Die Liste ist ungeordnet dargestellt (keine Platznummern), gleiche XP ordnen nach dem Namen. Die Antwort
    der Route nennt keine Kennungen anderer Konten. Kinder bekommen weder Liste noch Zustimmung angeboten, auch wenn eine
    Zustimmung in der Datenbank stünde (Integrationstest).
14. **Familie (Nr. 8):** Eltern schalten die Bestenliste in „Mein Bereich › Meine Kinder“ ein; zur Familie gehören das
    Elternkonto und Konten der bestätigten, sorgeberechtigten Kinder – sichtbar nur für Mitglieder ab 16. Eltern sehen die
    Lernwoche ihres Kindes (XP, Lektionen, Lerntage je Tag, ohne Einzelergebnisse) nur bis zum Ende des Übergangs nach
    dem 16. Geburtstag; danach entscheidet die oder der Jugendliche selbst (eigene Freigabe folgt bei Bedarf).
15. **Erinnerung (Nr. 4)** ist in L7-02 nicht gebaut; der Schalter `push_lernapp` bleibt ohne Wirkung.

## Alternativen

- Spielmechanik wie Duolingo mit Herzen, Ligen und Serien-Alarm: verworfen (Nutzerentscheidung „sanft, ohne Druck“).
- Keine Spielelemente: verworfen (Nutzerentscheidung).
- Bestenliste mit Abmeldung statt Zustimmung (Plan §2.5 „jede Person kann sich ausblenden“): nicht gewählt. „Freiwillig“ wird als vorherige Zustimmung gelesen; das passt auch zur DSFA.
- Keine Bestenliste in Familien (`_lernapp/PLAN.md` §8): nicht gewählt. Die Nutzerentscheidung nennt „Gruppe oder Familie“; Kinder bleiben durch Nr. 8 ausgeschlossen.
- Bestenliste für Kinder per Schalter: verworfen. Die Nutzerentscheidung schließt Kinder aus, deshalb gibt es dafür keinen Schalter.
- Tagesziel in Minuten (Plan §2.5): nicht gewählt. Lernzeit zu messen hieße, mehr Daten zu erheben; XP und Lektionen ergeben sich deterministisch aus den Ereignissen (ADR 0038).

## Folgen

- KERN (Lern-App) nimmt die Ausnahme von „keine Ranglisten“ mit den Grenzen aus Nr. 8 auf. Für die Website gilt KERN 3.0 unverändert.
- DSFA-Nachtrag zu R-08 und Einwilligungstext `lernapp` (LM-08). Bis dahin bleiben `lernapp_gruppen` und `lernapp_rangliste` in der Produktion aus.
- Tests: `sanfte-texte`; Regeltest „keine hochzählenden Zahlen“ und `bewegung-regeln` auch für `src/components/lernapp/**`; Serie mit Pausetagen über Tages- und Sommerzeitgrenzen (ADR 0038); Integration „keine Bestenliste unter 16“ und „nur mit Zustimmung“; E2E Kind ohne Bestenliste.
- Abnahme: Z-L09 (Kinderschutz), Z-L11 (Register B-28…B-35 mit reduzierter Variante).
- OFFENE FRAGE: Standard des Tagesziels (Nr. 2) und Liste der verbotenen Formulierungen in tr und ar.
