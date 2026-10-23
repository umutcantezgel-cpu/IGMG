# Einwilligungstext „lernapp“ der Lern-App (versioniert, de; tr und ar als Übersetzungsaufgabe)

> **ENTWURF – vor Veröffentlichung durch Datenschutz/Recht prüfen (MENSCHEN LM-08, MN-11).** Diese Texte sind nicht in die Lern-App eingebaut und nicht veröffentlicht. Dies ist keine Rechtsberatung. Der Wortlaut der bestehenden Einwilligungstexte (`einwilligungen.md`, `web/messages/bereiche/benachrichtigungen.json`) bleibt unverändert. Alles in eckigen Klammern `[ ]` ist offen; `[prüfen]` ist rechtlich zu klären. **Türkisch und Arabisch sind Übersetzungsaufgaben:** Sie entstehen durch Menschen mit Sprachkenntnis aus dem freigegebenen deutschen Text. Die arabische Fassung steht nur in `web/messages/lernapp/ar.json` (KERN 4.0 §3); in dieser Datei steht keine arabische Schrift.

Stand: 20.10.2026 · Bezug: `_lernapp/KERN.md` §5, §6; ADR 0038 Nr. 5 und 10, ADR 0042 Nr. 7 und 11, ADR 0043 Nr. 4 und 8; `dsfa-lernapp.md`; Regeln für Einbau und Nachweis aus `einwilligungen.md` §2; Art. 6 Abs. 1 lit. a, Art. 7, Art. 8, Art. 9 Abs. 2 lit. a DSGVO.

## 1. Übersicht

| Nr. | Text | Art (Vorschlag) | Wer willigt ein | Besondere Kategorie (Art. 9) | Funktionsschalter |
| --- | --- | --- | --- | --- | --- |
| EL1 | Lern-App mit Konto (Erwachsene) | `lernapp` | die Person selbst | **ja**, ausdrücklich | `lernapp_sync`, `lernapp_gruppen` |
| EL2 | Lern-App für ein Kind unter 16 | `lernapp` | Eltern bzw. Sorgeberechtigte | **ja**, ausdrücklich | `lernapp_sync`, `lernapp_gruppen` |
| EL3 | Lern-App ab 16 (eigene Einwilligung) | `lernapp` | die bzw. der Jugendliche selbst | **ja**, ausdrücklich | `lernapp_sync`, `lernapp_gruppen` |
| EL4 | Zustimmung zur Bestenliste (nur ab 16) | `[Art festlegen: konto_einwilligung.art „lernapp_bestenliste“ oder Einstellung im Profil]` | die Person selbst, nie die Eltern für ein Kind | möglich (D-L04) | `lernapp_rangliste` |

**Ohne Konto braucht die Lern-App keine Einwilligung:** Alles bleibt auf dem Gerät (`dsfa-lernapp.md` §2.1). Dafür gibt es nur einen Hinweis (Abschnitt 7), keinen Einwilligungstext. Erinnerungen per Push nutzen die bestehenden Einwilligungen `push` bzw. `push_kind` (Thema `lernapp`).

## 2. Regeln für Einbau und Oberfläche (Ergänzung zu `einwilligungen.md` §2)

1. **Wann gefragt wird:** wenn eine angemeldete Person in der Lern-App den Abgleich einschaltet oder einer Lerngruppe mit Lern-App-Zuweisungen beitritt; für Kinder in „Mein Bereich“ unter „Meine Kinder“ durch die Eltern. Nie beim ersten Öffnen der App, nie als Bedingung zum Lernen.
2. **Getrennt und nicht vorangekreuzt:** EL1 bis EL3 und EL4 haben je ein eigenes Kästchen. Die Frage „Lokalen Fortschritt in dein Konto übernehmen?“ (ADR 0038 Nr. 7) ist **keine** Einwilligung und steht erst danach.
3. **Zusatz „Einvernehmen“:** nur bei EL2, wie `einwilligungen.md` §2 Nr. 2.
4. **Sprache und Version:** Die Person sieht den Text in der Sprache der Oberfläche (Lern-App: de, tr, ar; „Mein Bereich“: de, tr, en `[Entscheidung D-L15: englische Fassung für Mein Bereich]`). Version `<Art>/2026-10-entwurf` mit `+sha256:<Hash des angezeigten Wortlauts>` je Sprache (wie D-15 der Grund-DSFA); Entwurfsversionen nie in der Produktion.
5. **Nachweis:** Art, Textversion, Sprache, Haken „Einvernehmen“ (EL2), erteilende Person, Zeitpunkt (Löschkonzept L-15).
6. **Widerruf** an derselben Stelle (Einstellungen der Lern-App und „Mein Bereich“), so einfach wie die Einwilligung, wirkt sofort (Abschnitt 6).
7. **Klare Sprache:** kurze Sätze, keine Fachwörter, Kästchen mit Tastatur und Bildschirmleser bedienbar (KERN 4.0 §8). Die Übersetzungen halten diese Einfachheit.
8. **Platzhalter vor dem Einbau füllen:** Name und Rechtsform, E-Mail-Adresse, Umfang der Lehrkraft-Sicht (D-L03), Fristen.

## 3. EL1: Lern-App mit Konto (Erwachsene)

Version: `lernapp/2026-10-entwurf` · Art: `lernapp` · Zusatz Einvernehmen: nein

### Deutsch

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) meinen Lernstand aus der Lern-App mit meinem Konto speichert und zwischen meinen Geräten abgleicht.

Gespeichert wird: welche Lektionen und Wiederholungen ich gemacht habe, wie ich bei den Aufgaben abgeschnitten habe (richtig, mit Hilfe oder falsch), mein Wiederholungsplan, meine XP, mein Tagesziel, meine Lerntage und meine Einstellungen in der Lern-App. Nicht gespeichert wird der Wortlaut meiner Antworten. Sprachaufnahmen verlassen mein Gerät nie.

Wenn ich in einer Lerngruppe der Gemeinde bin, kann mir die Lehrkraft dieser Gruppe Einheiten zuweisen. Sie sieht, welche zugewiesenen Einheiten ich erledigt habe [und mit welchem Ergebnis – Umfang nach Entscheidung D-L03]. Schreibaufgaben schicke ich nur an diese Lehrkraft, wenn ich es will. Sie werden verschlüsselt gespeichert und 12 Monate nach der Abgabe gelöscht.

Mein Lernstand im Kurs „Islamisches Wissen“ und im Pfad „Koran-Arabisch“ kann Rückschlüsse auf meine religiöse Überzeugung zulassen. Ich willige **ausdrücklich** auch in die Verarbeitung dieser Angaben ein.

Es gibt keine Werbung, keine Weitergabe an Dritte und keine Auswertung über mich als Person. In einer Bestenliste erscheine ich nur, wenn ich dem eigens zustimme. Mein Lernstand wird 12 Monate nach meiner letzten Aktivität in der Lern-App gelöscht, außerdem, wenn ich mein Konto lösche.

Die Einwilligung ist freiwillig. Ich kann die Lern-App auch ohne Konto voll nutzen; mein Lernstand bleibt dann nur auf meinem Gerät.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in der Lern-App unter „Einstellungen“, in „Mein Bereich“ unter „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Dann endet der Abgleich sofort, und mein Lernstand auf dem Server wird binnen [Frist – Vorschlag 30 Tage] gelöscht. Der Lernstand auf meinem Gerät bleibt. Bis zum Widerruf bleibt die Verarbeitung rechtmäßig.

### Türkçe

[Übersetzungsaufgabe – Übersetzung des freigegebenen deutschen Textes durch eine Person mit Sprachkenntnis; Gegenlesen durch eine zweite Person (LM-01). Ablage: `web/messages/lernapp/tr.json`; für „Mein Bereich“ zusätzlich im Bereich der Konten.]

### Arabisch

[Übersetzungsaufgabe – Übersetzung des freigegebenen deutschen Textes durch eine Person mit Sprachkenntnis; Gegenlesen durch eine zweite Person (LM-01). Ablage nur in `web/messages/lernapp/ar.json` (KERN 4.0 §3); keine arabische Schrift in dieser Datei.]

## 4. EL2: Lern-App für ein Kind unter 16 (Eltern)

Version: `lernapp-kind/2026-10-entwurf` · Art: `lernapp` · Zusatz Einvernehmen: **ja**

### Deutsch

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) den Lernstand meines Kindes [Name des Kindes] aus der Lern-App mit seinem Kinderkonto speichert und zwischen seinen Geräten abgleicht.

Gespeichert wird: welche Lektionen und Wiederholungen mein Kind gemacht hat, wie es bei den Aufgaben abgeschnitten hat (richtig, mit Hilfe oder falsch), sein Wiederholungsplan, seine XP, sein Tagesziel, seine Lerntage und seine Einstellungen in der Lern-App. Nicht gespeichert wird der Wortlaut seiner Antworten. Sprachaufnahmen verlassen das Gerät nie.

Ich sehe in „Mein Bereich“ die Lernwoche meines Kindes: Lerntage, erledigte Lektionen und XP. Ist mein Kind in einer Lerngruppe der Gemeinde, kann ihm die Lehrkraft dieser Gruppe Einheiten zuweisen. Sie sieht, welche zugewiesenen Einheiten mein Kind erledigt hat [und mit welchem Ergebnis – Umfang nach Entscheidung D-L03]. Schreibaufgaben schickt mein Kind nur an diese Lehrkraft. Sie werden verschlüsselt gespeichert und 12 Monate nach der Abgabe gelöscht.

Der Lernstand im Kurs „Islamisches Wissen“ und im Pfad „Koran-Arabisch“ kann Rückschlüsse auf die religiöse Überzeugung zulassen. Ich willige **ausdrücklich** auch in die Verarbeitung dieser Angaben ein.

Mein Kind erscheint nie in einer Bestenliste und sieht keine. Es gibt keine Werbung, keine Weitergabe an Dritte und keine Auswertung über mein Kind als Person. Erinnerungen auf dem Gerät meines Kindes gibt es nur, wenn ich dafür eigens einwillige. Der Lernstand wird 12 Monate nach der letzten Aktivität in der Lern-App gelöscht, außerdem mit dem Kinderkonto.

Die Einwilligung ist freiwillig. Mein Kind kann die Lern-App auch ohne Konto voll nutzen; der Lernstand bleibt dann nur auf seinem Gerät. Die Teilnahme am Unterricht hängt nicht von dieser Einwilligung ab.

Ab dem 16. Geburtstag entscheidet mein Kind selbst. Bis es selbst einwilligt, längstens 30 Tage, gilt meine Einwilligung weiter.

☐ Ich bin sorgeberechtigt und handle im Einvernehmen mit der zweiten sorgeberechtigten Person.

*Widerruf:* Ich kann diese Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen: in „Mein Bereich“ unter „Meine Kinder“ und „Einwilligungen“ oder per E-Mail an [E-Mail-Adresse]. Dann endet der Abgleich sofort, und der Lernstand meines Kindes auf dem Server wird binnen [Frist – Vorschlag 30 Tage] gelöscht. Der Lernstand auf dem Gerät bleibt. Bis zum Widerruf bleibt die Verarbeitung rechtmäßig.

### Türkçe

[Übersetzungsaufgabe – wie EL1.]

### Arabisch

[Übersetzungsaufgabe – wie EL1; Ablage nur in `web/messages/lernapp/ar.json`.]

## 5. EL3: Lern-App ab 16 (eigene Einwilligung)

Am 16. Geburtstag fragt die Lern-App die Jugendliche bzw. den Jugendlichen selbst (binnen 30 Tagen; Folge bei Ausbleiben: D-L09). Kein Zusatz „Einvernehmen“. Version: `lernapp-ab16/2026-10-entwurf` · Art: `lernapp`.

### Deutsch

Ich willige ein, dass die IGMG Wetzlar ([Name und Rechtsform – Vorstand]) meinen Lernstand aus der Lern-App mit meinem Konto speichert und zwischen meinen Geräten abgleicht: Lektionen und Wiederholungen, wie ich abgeschnitten habe (richtig, mit Hilfe oder falsch), Wiederholungsplan, XP, Tagesziel, Lerntage und Einstellungen. Nicht gespeichert wird der Wortlaut meiner Antworten; Sprachaufnahmen verlassen mein Gerät nie.

Die Lehrkraft meiner Lerngruppe sieht, welche zugewiesenen Einheiten ich erledigt habe [Umfang nach D-L03]. Meine Eltern sehen meine Lernwoche [nur wenn ich es erlaube – Entscheidung Bildung/DSB]. Schreibaufgaben schicke ich nur an meine Lehrkraft, wenn ich es will; sie werden verschlüsselt gespeichert und nach 12 Monaten gelöscht.

Mein Lernstand im Kurs „Islamisches Wissen“ und im Pfad „Koran-Arabisch“ kann Rückschlüsse auf meine religiöse Überzeugung zulassen. Ich willige **ausdrücklich** auch hierin ein.

In einer Bestenliste erscheine ich nur, wenn ich dem eigens zustimme. Mein Lernstand wird 12 Monate nach meiner letzten Aktivität gelöscht, außerdem mit meinem Konto. Die Einwilligung ist freiwillig; ohne sie lerne ich auf meinem Gerät weiter.

*Widerruf:* jederzeit mit Wirkung für die Zukunft, in der Lern-App unter „Einstellungen“, in „Mein Bereich“ oder per E-Mail an [E-Mail-Adresse]. Dann endet der Abgleich sofort, und mein Lernstand auf dem Server wird binnen [Frist – Vorschlag 30 Tage] gelöscht.

### Türkçe

[Übersetzungsaufgabe – wie EL1.]

### Arabisch

[Übersetzungsaufgabe – wie EL1; Ablage nur in `web/messages/lernapp/ar.json`.]

## 6. EL4: Zustimmung zur Bestenliste (nur ab 16)

Nur sichtbar für Konten ab 16, wenn die Lehrkraft die Bestenliste für die Gruppe oder die Eltern sie für die Familie eingeschaltet haben (ADR 0043 Nr. 8). Für Konten unter 16 gibt es dieses Kästchen nicht. Version: `lernapp-bestenliste/2026-10-entwurf`.

### Deutsch

Ich möchte in der Bestenliste meiner [Lerngruppe / Familie] erscheinen. Dort sehen die anderen, die ebenfalls zugestimmt haben, meinen Anzeigenamen (Vorname und Anfangsbuchstabe des Nachnamens) und meine XP dieser Woche [nur aus den Sprachkursen – Entscheidung D-L04]. Es gibt keine Medaillen und keinen Verlauf. Die Zustimmung ist freiwillig. Ich kann sie jederzeit in den Einstellungen zurücknehmen; dann verschwinde ich sofort aus der Liste.

### Türkçe

[Übersetzungsaufgabe – wie EL1.]

### Arabisch

[Übersetzungsaufgabe – wie EL1; Ablage nur in `web/messages/lernapp/ar.json`.]

## 7. Hinweise ohne Einwilligung (Text für die Oberfläche, Entwurf)

Diese Texte sind **Informationen**, keine Einwilligungen. Sie stehen in den Einstellungen der Lern-App unter „Wo liegen meine Daten?“ und vor dem ersten Laden der Sprachprüfung. Übersetzung tr und ar wie oben.

- **Ohne Konto:** „Dein Lernstand liegt nur auf diesem Gerät. Die Gemeinde sieht ihn nicht. Du kannst ihn als Datei sichern und auf einem anderen Gerät wieder einlesen. Wenn du die Daten der Website im Browser löschst, ist er weg.“
- **Sprechübungen:** „Deine Aufnahme bleibt auf diesem Gerät. Sie wird nicht hochgeladen, auch nicht an deine Lehrkraft. Die Sprachprüfung lädt einmalig etwa 95 MB von unserer eigenen Website.“
- **Fehler melden:** „Wir bekommen nur, welche Aufgabe du meinst und was nicht stimmt. Wir wissen nicht, wer du bist.“ Ab 16 und angemeldet zusätzlich: „Du kannst deine Antwort mitschicken. Bitte schreib keine persönlichen Angaben hinein.“
- **Geteiltes Gerät:** „Lernen hier mehrere Personen? Jede kann ein eigenes Profil anlegen. Beim Abmelden fragen wir, ob dein Lernstand auf diesem Gerät gelöscht werden soll.“ `[nach Entscheidung D-L12]`

## 8. Widerruf und Folgen

| Erklärung | Wirkung |
| --- | --- |
| Widerruf EL1, EL2 oder EL3 | Abgleich endet sofort (die Sync-Route antwortet ohne Einwilligung nicht); Lehrkraft und Eltern sehen keinen neuen Stand; Lernstand, Ereignisse, Kartenstand und Lerntage auf dem Server werden binnen [30 Tagen] gelöscht; offene Schreibabgaben [mitgelöscht – Entscheidung DSB]; der lokale Stand auf dem Gerät bleibt; Nachweis der Einwilligung nach Löschkonzept L-15 |
| Rücknahme EL4 | Die Person verschwindet sofort aus der Bestenliste; es gibt keinen gespeicherten Verlauf |
| Widerruf `push` bzw. `push_kind` | Abo wird gelöscht (L-27) |
| Löschung des Kontos | alles Obige mit dem Konto (Kaskade) |

## 9. Offene Punkte

1. Ein Kästchen oder zwei (Abgleich und Sichtbarkeit für die Lehrkraft; D-L02)?
2. Umfang der Lehrkraft-Sicht (D-L03) und ob Eltern ab dem 16. Geburtstag die Lernwoche weiter sehen.
3. Zählt die Bestenliste XP aus Wissenskurs und Koran-Arabisch (D-L04)? Art und Speicherort der Zustimmung EL4 festlegen.
4. Frist der Löschung nach Widerruf (Vorschlag 30 Tage) und Umgang mit offenen Schreibabgaben.
5. Formulierung zu Art. 9 („ausdrücklich“) rechtlich prüfen; ergänzend Art. 9 Abs. 2 lit. d (D-L14).
6. Englische Fassung für „Mein Bereich“ (D-L15).
7. Übersetzungen tr und ar durch Menschen, Gegenlesen durch eine zweite Person; danach Hashes beim Einbau.

## 10. Einbau als Entwurf (Stand 23.10.2026, S-L3 N-2, ADR 0042 Fortschreibung Nr. 23 und 24)

Die Texte EL1 bis EL3 sind als **Entwurf gekennzeichnet** in „Mein Bereich“ eingebaut (de; tr und en als KI-Entwurf zur Prüfung, `web/messages/neu-uebersetzt.json`). Sie gelten erst nach Freigabe (LM-08); bis dahin bleiben `lernapp_sync` und `lernapp_gruppen` in der Produktion aus. Abweichungen vom Wortlaut oben, die die Prüfung bestätigen oder zurücknehmen soll:

1. **Ort:** EL1 und EL3 unter „Mein Bereich › Konto › Lern-App“, EL2 unter „Meine Kinder“ bei den übrigen Einwilligungen des Kindes. Die Einstellungen der Lern-App verweisen dorthin (kein eigenes Kästchen in der App); der Widerrufssatz nennt deshalb „Mein Bereich“ statt „Einstellungen“.
2. **Frist nach Widerruf:** gelöscht wird **sofort** (statt „binnen 30 Tagen“): Lernstand auf dem Server, Schreibabgaben, die keine geltende Einwilligung deckt, Zustimmung zur Bestenliste und Einstellung der Familien-Bestenliste. Der Widerrufssatz sagt das.
3. **Version:** `lernapp/2026-10-entwurf`, `lernapp-ab16/2026-10-entwurf` bzw. `lernapp-kind/2026-10-entwurf` mit `+sha256:` des angezeigten Wortlauts (bei EL1 und EL3 mit dem Satz am Kästchen, bei EL2 mit dem Einvernehmen).
4. **Wer:** EL3 bis zum 18. Geburtstag (bei bekanntem Datum), danach EL1. Unter 16 erteilen und widerrufen nur die Eltern; ab 16 entscheidet die Person selbst, ihr Widerruf beendet auch eine noch laufende Einwilligung der Eltern. Eltern erteilen nur mit bestätigtem Eltern-Kind-Bezug; mit dem Ende des Bezugs endet ihre Einwilligung.
5. **Platzhalter** in eckigen Klammern (Name und Rechtsform, E-Mail-Adresse, Umfang nach D-L03, Sichtbarkeit für Eltern ab 16) stehen im angezeigten Text, bis sie entschieden sind.
