# Handbuch für Imam und Hoca: religiöse Freigabe in der Lern-App

Für die Personen mit der Rolle **„religiöse Prüfung“**, die religiöse Inhalte der Lern-App prüfen und freigeben. Ergänzt das Handbuch für den Imam und die Hoca (`imam.md`); Konto, Zwei-Faktor und die Freigaben der Website stehen dort. Dieses Handbuch beschreibt **nur die Arbeitsabläufe**. Es enthält keinen religiösen Inhalt.

**Stand:** 21.10.2026, Nachtrag 27.10.2026 (unten). Die **Regeln** der Freigabe sind im Programm gebaut und mit Tests abgesichert: Ohne zwei Freigaben ist nichts Religiöses in der App sichtbar – mit einer Ausnahme auf Zeit, der gekennzeichneten Vorschau des Wissenskurses (Nachtrag). Die **Prüfoberfläche** der Lern-App in der Verwaltung entsteht in der Etappe L6; Bezeichnungen, die noch nicht feststehen, sind mit **[folgt mit L6]** markiert. Bildschirmfotos folgen (Marke **[Bildschirmfoto folgt]**). Schaltflächen stehen in „Anführungszeichen“.

**Bis zu Ihrer Freigabe** zeigt die App im Kurs „Islamisches Wissen“ ohne die Vorschau: „Die Einheiten dieses Kurses werden gerade vorbereitet.“ Das ist so gewollt.

**Nachtrag 27.10.2026 – Vorschau des Wissenskurses (`_lernapp/ENTSCHEIDUNGEN.md` L3-E22).** Auf Auftrag des Nutzers ist der Schalter `lernapp_wissen_vorschau` an. Solange er an ist, gilt im Wissenskurs:

- Lektionen ohne Ihre zwei Freigaben erscheinen als **„Entwurf zur Prüfung“**: Hinweis auf der Kursseite, über der Übung und beim Wiederholen, Vermerk „Entwurf“ statt des Prüfvermerks, Marke an der Einheit. Die App sagt dazu, dass es keine geprüfte Lehrmeinung ist.
- Lektionen, deren Bausteine alle geprüft sind, tragen wie bisher den Prüfvermerk (Abschnitt 7).
- **Ihr Einwand wirkt weiter sofort:** Ein Urteil „Änderungsvorschlag“ oder „Ablehnen“ zum aktuellen Stand blendet die ganze Lektion auch in der Vorschau aus – ebenso ein zurückgezogener (gesperrter) Baustein oder eine Aussage ohne Beleg.
- Jede Änderung setzt die Freigaben zurück, auch ein neuer, geänderter oder entfernter Beleg.
- **Vor dem öffentlichen Start** wird die Vorschau ausgeschaltet (`FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus`), oder alles ist von zwei von Ihnen geprüft (LM-03). Dann gilt wieder allein „sichtbar erst nach zwei Freigaben“; offline gespeicherte Entwürfe verlassen ein Gerät beim nächsten Öffnen des Lernpfads mit Netz.
- Ohne Datenbank (heutiger Beispielmodus) können Sie die Entwürfe nur ansehen, noch nicht freigeben (`web/docs/GO-LIVE.md` G1, G2).

## 1. Was die Lern-App nie tut

- Keine künstliche Intelligenz schreibt **Koranverse, Hadithe, Bittgebete**, deren Übersetzungen, **Koran-Wortbedeutungen** oder **Tajwid-Texte**. Auch keine deutschen Fassungen von Quelltexten.
- Es gibt **keinen Frage-Bot**, keine Fatwa-Funktion und keine Antworten auf persönliche Fälle.
- Es gibt **keine Computerstimme** für Koran, Hadith, Bittgebete, den Wissenskurs, den Pfad „Koran-Arabisch“ und für Einträge mit religiösem Bezug in den Sprachkursen.
- Arabischer Text im Wissenskurs und im Koran-Pfad kommt nur aus **gepinnten Quelldateien** (mit Prüfsumme) über einen **Verweis** (Sure und Vers, Sammlung und Nummer). Ohne freigegebene Übersetzung steht „Übersetzung folgt“.
- **Sichtbar wird nichts Religiöses, bevor zwei von Ihnen es freigegeben haben.** Einzige Ausnahme auf Zeit: die gekennzeichnete Vorschau des Wissenskurses (Nachtrag oben).

## 2. Was Sie freigeben

| Art                                          | Was es ist                                                                                                                                                                                                      | Wer verfasst                                                                       | Bis zur Freigabe zeigt die App                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| **Wissenskurs „Islamisches Wissen“**         | Bausteine einer Lektion: **Aussagen** (kurze deutsche Lehrsätze in eigenen Worten, nach hanefitischer Lehre), **Belege** (Werk, Kapitel, Ausgabe, Band, Seite), **Quizfragen** (nur aus Aussagen) und **Tipps** | KI-Entwurf, nur aus gelieferten Passagen der benannten Werke, mit Beleg je Aussage | nichts: die Lektion fehlt (mit Vorschau: „Entwurf zur Prüfung“, Nachtrag oben) |
| **Sprachkurs-Einträge mit religiösem Bezug** | Wörter oder Sätze der Sprachkurse, die eine Alltagsformel enthalten (zum Beispiel einen Gruß); im Programm gekennzeichnet                                                                                       | KI-Entwurf, vom Wächter erkannt                                                    | nichts: der Eintrag und seine Aufgaben fehlen                                  |
| **Liste erlaubter Alltagsformeln**           | welche Formeln in Sprachkursen überhaupt vorkommen dürfen (MENSCHEN LM-09)                                                                                                                                      | religiöse Prüfung bzw. Redaktion                                                   | alle Formeln gesperrt                                                          |
| **Koran-Arabisch: Wortbedeutungen**          | Bedeutungen häufiger Wortformen                                                                                                                                                                                 | **nur Menschen** (Hoca, MN-05), nach einer Arbeitsliste aus der Pipeline           | nur die Wortform, ohne Bedeutung                                               |
| **Koran-Arabisch: Wurzeltabelle**            | Zuordnung von Wortformen zu Wurzeln                                                                                                                                                                             | Werkzeugvorschlag, fachlich geprüft von der benannten Lehrkraft (LM-31)            | keine Übungen zu Wurzeln                                                       |

**Umfang:** etwa 28 Einheiten Wissen mit rund 1.400 Aussagen. Rechnen Sie mit etwa 200 Stunden für beide zusammen, verteilt über Monate. Veröffentlicht wird **gestaffelt**: zuerst die Einheiten zu **Reinheit und Gebet** (LM-03).

## 3. Die Regeln der Freigabe

Ein Baustein ist **geprüft**, wenn alle Punkte zutreffen:

1. Es gibt **zwei** Urteile „in Ordnung“ von **zwei verschiedenen Personen** mit der Rolle „religiöse Prüfung“.
2. **Keine** der beiden hat den aktuellen Stand verfasst. Als Verfasser gilt der KI-Lauf und jede Person, die einen Vorschlag eingearbeitet hat.
3. Jeder Beleg ist mit **„Beleg am Original geprüft“** bestätigt **[Bezeichnung folgt mit L6]**. Sie prüfen an **Ihrem eigenen Exemplar** der genannten Ausgabe. Die Verwaltung zeigt die **Fundstelle** (Werk, Kapitel, Ausgabe, Band, Seite), keinen arabischen Quelltext – bis der Vorstand anders entscheidet (LM-04).
4. Beide Urteile gelten für den **aktuellen Stand**. **Jede Änderung** – auch ein Wort – setzt beide Freigaben zurück.

Dazu gilt:

- Eine **Lektion** erscheint erst, wenn **alle** ihre Bausteine geprüft sind. Halbe Lektionen gibt es nicht. Mit der Vorschau erscheint sie vorher als „Entwurf zur Prüfung“ – auch dann nur ganz und nie mit einem Einwand (Nachtrag oben).
- Die **Administration** kann keine Freigabe geben oder ersetzen – auch nicht technisch.
- **Zurückziehen** (ein neues Urteil „Änderungsvorschlag“ oder „Ablehnen“ zum aktuellen Stand) wirkt **sofort**: Die Lektion verschwindet aus der App, auch aus der Vorschau. Ein Gerät, das die Einheit offline gespeichert hat, übernimmt den neuen Stand, sobald es wieder mit Verbindung lädt.
- **Meinungsunterschiede innerhalb der Schule** stehen nur dann in einer Aussage, wenn die Quelle sie nennt; strittige Themen werden als solche ausgewiesen.

## 4. Ihre Urteile

| Urteil                 | Wann                                                                          | Was danach passiert                                                                                                 |
| ---------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **In Ordnung**         | Aussage, Beleg und Wortlaut stimmen; die Belege haben Sie am Original geprüft | Zählt als eine Freigabe. Mit der zweiten Freigabe einer anderen Person ist der Baustein geprüft                     |
| **Änderungsvorschlag** | Etwas soll anders formuliert oder belegt werden                               | Der Baustein bleibt unsichtbar. Die Redaktion arbeitet Ihren Vorschlag ein; danach prüfen **beide** den neuen Stand |
| **Ablehnen**           | Die Aussage ist falsch, nicht belegt oder gehört nicht in den Kurs            | Der Baustein bleibt unsichtbar, bis es einen neuen Stand gibt                                                       |

**Sie bearbeiten nicht selbst.** Wer ändert, wird Verfasser und dürfte nicht mehr freigeben; dann bräuchte jede Änderung eine dritte Person. Schreiben Sie deshalb Ihren Vorschlag in das Feld; die Redaktion übernimmt ihn.

## 5. So prüfen Sie einen Baustein

1. Öffnen Sie Verwaltung → „Lern-App“ → **[„Religiöse Prüfung“, folgt mit L6]**. Die Bausteine stehen zusätzlich in der Warteschlange **„Freigaben“** **[folgt mit L6]**. [Bildschirmfoto folgt]
2. Die Warteschlange zeigt je Baustein den Stand **„0 von 2“** oder **„1 von 2“** und die Einheit. Arbeiten Sie eine Lektion möglichst am Stück durch.
3. Öffnen Sie den Baustein. Sie sehen die **Aussage**, die **Belege** mit Fundstelle und – bei Quizfragen – die Aussage, aus der die Frage entstanden ist.
4. Schlagen Sie **jede Fundstelle** im Original nach. Setzen Sie je Beleg das Häkchen „am Original geprüft“.
5. Wählen Sie Ihr **Urteil** (Abschnitt 4) und speichern Sie.
6. Die **zweite Person** prüft unabhängig. Sprechen Sie sich ab, wer welche Einheit zuerst nimmt; die Reihenfolge der Freigaben ist egal.

**Für Kinder geeignet:** Je Lektion wird vermerkt, ob sie für Kinder geeignet ist (LM-17) **[Bedienung folgt mit L6]**.

## 6. Koran-Arabisch

- Die Pipeline erstellt nur eine **Arbeitsliste** der häufigsten Wortformen. Sie enthält keine Bedeutungen.
- Die **Hoca** verfasst die Bedeutungen in der Verwaltung unter „Koran & Hadith“ (Wortbedeutungen, siehe `imam.md`). Im Pfad der Lern-App erscheinen sie erst mit **zwei Freigaben** zum aktuellen Stand (LM-13 b ist noch offen).
- Weil die Hoca hier selbst verfasst, müssen **zwei andere Personen** mit „religiöse Prüfung“ freigeben. Dafür braucht die Gemeinde ein **drittes Prüfkonto** (LM-03). Bis dahin bleiben die Bedeutungen im Pfad unsichtbar.
- Zu hören sind im Koran-Pfad **nur freigegebene Rezitationen** (mit Wortzeiten aus dem Abgleich), nie eine Computerstimme.
- Die **Wurzeltabelle** prüft die benannte Lehrkraft fachlich (LM-31); sichtbar wird sie ebenfalls erst mit zwei Freigaben.

## 7. Wie die App Ihre Freigabe zeigt

- Über jeder geprüften Lektion steht: „Nach hanefitischer Lehre; geprüft von zwei Gelehrten der Gemeinde am [Datum]“ – **ohne Namen** (Standard bis zur Entscheidung LM-20).
- Zu jeder Aussage gibt es eine aufklappbare **Quellenzeile** („Quelle zeigen“).
- Verse und Hadithe erscheinen nur als Verweis mit der **freigegebenen Übersetzung** der Website, sonst „Übersetzung folgt“.

## 8. Datenschutz

Ob und was jemand im Wissenskurs lernt, lässt auf die Religion schließen (Art. 9 DSGVO). Deshalb:

- Sie sehen **keine Lernstände** von Personen, nur Inhalte.
- Der Fortschritt im Wissenskurs erscheint **nicht** in Bestenlisten oder im Gruppenziel und nicht beim Stand der Lehrkraft (Auflage M-1 der Sicherheitsprüfung; die Gemeinde liefert die erste Lektion erst aus, wenn das gebaut ist, `_lernapp/GO-LIVE.md`).

## 9. Offene Entscheidungen für Sie

| Nr.          | Frage                                                                                                     | Standard bis zur Antwort                                  |
| ------------ | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| LM-03        | Prüfung des Wissenskurses, zuerst Reinheit und Gebet; mindestens zwei Konten, für Koran-Bedeutungen drei  | nichts sichtbar; auf Zeit Vorschau als Entwurf (Nachtrag) |
| LM-04        | Benannte Werke und Ausgaben bestätigen; sollen Prüfende den arabischen Quelltext in der Verwaltung sehen? | nur Fundstelle                                            |
| LM-09        | Inhaltsleitfaden und Liste erlaubter Alltagsformeln                                                       | Formeln gesperrt                                          |
| LM-13        | Koran-Bedeutungen verfassen; reicht eine Freigabe nach dem Verfahren der Website?                         | zwei Freigaben                                            |
| LM-16        | Eigene Sammlung von Bittgebeten?                                                                          | keine                                                     |
| LM-17        | Kindgerechter Pfad im Wissenskurs                                                                         | Kennzeichnung je Lektion                                  |
| LM-20        | Prüfvermerk mit oder ohne Namen                                                                           | ohne Namen                                                |
| LM-31        | Lehrkraft für die Wurzeltabelle benennen                                                                  | keine Wurzeln                                             |
| LM-32, LM-33 | Bearbeitung älterer Übersetzungen; fehlende Ausgaben beschaffen                                           | zurückgestellt                                            |

Die vollständige Liste steht in `_lernapp/MENSCHEN.md`.

## 10. Wenn etwas nicht klappt

| Problem                                  | Was Sie tun                                                            |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Ein Baustein ist wieder „0 von 2“        | Jemand hat ihn geändert (neuer Stand); prüfen Sie ihn erneut           |
| „In Ordnung“ zählt nicht                 | Sie haben den Stand selbst verfasst oder ein Beleg ist nicht bestätigt |
| Die Fundstelle passt nicht zur Ausgabe   | „Änderungsvorschlag“ mit der richtigen Stelle                          |
| Eine Aussage geht über die Quelle hinaus | „Ablehnen“ oder „Änderungsvorschlag“; nichts ohne Beleg                |
| Zwei-Faktor-Code verloren                | Ersatzcode nehmen; sonst Administration                                |
| Anderes                                  | Technik [Name, Telefon]                                                |

**Kontakte:** Vorstand [Name, Telefon] · Redaktion der Lern-App [Name, E-Mail] · Technik [Name, Telefon].
