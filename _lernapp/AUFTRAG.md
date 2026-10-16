# AUFTRAG – Lauf „Lern-App“ (Sprachen de/tr/ar A1–C1, hanefitisches Wissen, Koran-Arabisch)

> **Genehmigt vom Nutzer am 16.10.2026.** Die Etappen L0–L8 laufen ohne Anhalten; was Menschen entscheiden müssen, läuft
> mit Standardannahme weiter (`MENSCHEN.md`).
> - Grundlage: genehmigter Plan „Lern-App“ (Plan-Datei der Sitzung, Abschnitt „Plan „Lern-App““ bis „# Anhang“), gesichert als
>   `_lernapp/berichte/plan-2026-10-16.md` (Verfeinerung: `_lernapp/berichte/plan-verfeinerung-2026-10-16.md`, Lizenzbericht: `_lernapp/berichte/lizenzen-l0.md`).
> - Ausgearbeitet in `PLAN.md` (Verfeinerung durch den zweiten Planungs-Agenten, 16.10.2026, gesichert als
>   `berichte/plan-verfeinerung-2026-10-16.md`).
> - Lizenzbefund L0 (`berichte/lizenzen-l0.md`, Workflow `wf_cf9ab8d3-fce`, 31 Primärquellen gegengeprüft) überholt den Plan
>   bei Sprachausgabe-Stimmen, OpenITI und Quranic Arabic Corpus.

**Rangfolge bei Widerspruch:**
1. Nutzerentscheidungen (§2, `ENTSCHEIDUNGEN.md` L3-E01…L3-E08)
2. `KERN.md` (gilt zusätzlich zu `_gemeinde/KERN.md`)
3. übrige Entscheidungen L3-E09 ff. und ADRs 0037–0045
4. `PLAN.md`

Der genehmigte Plan ist die Grundlage aller Dokumente. Abweichungen stehen mit Grund in `PLAN.md` („Fortschreibungen“) bzw. in
`ENTSCHEIDUNGEN.md`; bei religiösen Freigaben gilt immer die strengere Regel.

## 1. Auftrag des Nutzers (16.10.2026, sinngemäß)

Aus der bestehenden Web-App der IGMG Wetzlar entsteht zusätzlich eine **Lern-App als Web-App**:
- **Sprachkurse** Deutsch, Türkisch und Arabisch in **allen sechs Richtungen** (Türkisch und Arabisch für Deutschsprachige,
  Deutsch und Arabisch für Türkischsprachige, Deutsch und Türkisch für Arabischsprachige), jeweils **A1–C1**.
- **Arabisch** heißt modernes Hocharabisch (Fusha), voll vokalisiert, dazu ein Pfad „Koran-Arabisch verstehen“.
- **Islamisches Wissen nach der hanefitischen Rechtsschule** (Glaube nach maturiditischer Lehre), **nur auf Deutsch**.
- **Anspruch:** Alles ist komplett fertig, keine Prototypen. Spielerisch wie Duolingo, aber sanft. Open Source und
  Bibliotheken sind erlaubt.

## 2. Entscheidungen des Nutzers (16.10.2026, verbindlich)

Wortlaut aus dem genehmigten Plan. Umsetzung und Status je Punkt: `ENTSCHEIDUNGEN.md` L3-E01…L3-E08.

| L3 | Frage | Entscheidung |
|---|---|---|
| E01 | Fiqh-Inhalte | Die KI entwirft Lektionen und Übungen **streng nach benannten hanefitischen Quellen, mit Quellenangabe je Aussage**. **Nichts wird sichtbar, bevor zwei Prüfer (Imam/Hoca) jeden Baustein freigegeben haben.** |
| E02 | Spielerisches | **Sanft, ohne Druck:** XP, Tagesziel, Serie mit Pause-Tagen und ohne Schuld-Mitteilungen, Abzeichen, Lernpfad, Wiederholung nach Vergessenskurve. Bestenliste freiwillig, nur in der eigenen Gruppe oder Familie; **für Kinder aus**. |
| E03 | Sprachinhalte | KI-Entwurf nach GER, ergänzt um offene Daten (Tatoeba, Wiktionary). Muttersprachler prüfen stichprobenweise. Audio per Open-Source-Sprachausgabe (Piper), später durch Aufnahmen ersetzbar. **Kein Koran-/Hadith-Text in der Sprachausgabe.** |
| E04 | Niveau | **A1–C1** je Zielsprache. |
| E05 | Platzierung | **Eigener Bereich in der bestehenden Web-App**, als PWA installierbar. Gleiche Konten; Lehrkräfte weisen ihren Gruppen Lektionen zu. **Ohne Konto voll nutzbar** (Fortschritt auf dem Gerät, offline). |
| E06 | Sprechen/Schreiben (C1) | **Open Source im Browser:** Whisper lokal, nichts verlässt das Gerät. Schreiben mit Musterlösung, Prüfliste und Selbstbewertung; optional korrigiert die Lehrkraft. |
| E07 | Arabisch | Hocharabisch (Fusha) **und** ein Pfad „Koran-Arabisch“ aus den vorhandenen Koran-Wortdaten (nur freigegebene Bedeutungen). |
| E08 | Oberfläche | **Deutsch, Türkisch, Arabisch** (Arabisch voll von rechts nach links). Die übrige Website bleibt DE/TR/EN. |

**Fortschreibungen ohne Nutzerentscheidung** (Standard bis zur Antwort, `ENTSCHEIDUNGEN.md`):
- **L3-E03, Teil „Piper“:** überholt durch den Lizenzbefund. Fast alle Piper-Stimmen für de, tr und ar sind nicht nutzbar;
  die Stimmenwahl steht in L3-E10.
- **Adresse:** `/lern-app/[ui]` statt `/app/[ui]` (L3-E11).

## 3. Leitidee

„Die Lern-App ist ein ruhiger Lehrraum für jeden Tag: kleine Schritte in Deutsch, Türkisch und Arabisch und im Wissen der
eigenen Schule – spielerisch ohne Druck, auch ohne Konto und ohne Netz, und nichts Religiöses ohne zwei Menschen, die es
geprüft haben.“ (Vorschlag des Orchestrators, Standard bis zur Antwort)

Daraus folgt (Einzelregeln in `KERN.md`):
- **Lernen mit Würde:** keine Herzen, keine Ligen, keine Schuld-Texte, keine Werbung, keine Tracker.
- **Lokal zuerst:** Fortschritt auf dem Gerät; der Abgleich mit dem Konto ist ein Angebot, keine Bedingung.
- **Religiöse Inhalte nur geprüft:** Quellen je Aussage, zwei Freigaben für alles Religiöse, Arabisch nur aus gepinnten Dateien.
- **Gleiche Formensprache wie die Website:** Achtstern, Lernweg (B-24), ruhige Bewegung; Arabisch voll von rechts nach links.

## 4. Ziele

1. **Sprachkurse:** sechs Richtungen, A1–C1, vollständig nach Rahmenplan. Inhalte automatisch geprüft, gegengeprüft und
   muttersprachlich in Stichproben geprüft; Audio für alle Zielinhalte der Sprachkurse.
2. **Islamisches Wissen (Deutsch):** vollständig entworfen, mit Beleg je Aussage. Öffentlich nur, was zwei Prüfende
   freigegeben haben; gestaffelt, Reinheit (Taharah) und Gebet (Salah) zuerst.
3. **Koran-Arabisch:** häufigste Wortformen, Wurzeln und Muster aus den vorhandenen Koran-Wortdaten; Bedeutungen nur
   freigegeben, Audio nur aus freigegebenen Rezitationen, nie Sprachausgabe.
4. **Ohne Konto voll nutzbar und offline:** Fortschritt und Wiederholungskarten auf dem Gerät, Einheiten offline spielbar.
5. **Mit Konto:** Abgleich mehrerer Geräte ohne Konflikte, Zuweisungen der Lehrkraft an ihre Gruppe, Eltern sehen das Kind,
   C1-Schreibabgaben an die Lehrkraft. Alles hinter Einwilligung und Funktionsschalter.
6. **Oberfläche de/tr/ar** mit voller Rechts-nach-links-Darstellung im Arabischen; die Website bleibt de/tr/en.
7. **Sprechen und Schreiben** ohne Laufzeit-KI: Spracherkennung im Browser, Aufnahme verlässt das Gerät nie.
8. **Qualität wie die Website:** WCAG 2.2 AA, JS-Budgets, keine Drittanfragen, saubere Lizenzen (Lerninhalte unter
   CC BY-SA 4.0), Kinderschutz.

## 5. Umfang

### 5.1 Kurse

| Kurs | Inhalt | Menge (Ziel, Einzelheiten `PLAN.md` §5) |
|---|---|---|
| Sprachkurse `tr-aus-de`, `ar-aus-de`, `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar` | je Zielsprache ein gemeinsamer Korpus A1–C1; Übersetzungen, angenommene Antworten und kontrastive Tipps je Richtung; Schrift-Vorkurse (Arabisch, Latein, türkische Sonderbuchstaben) | je Zielsprache 72 Einheiten, ≈ 6.500 Lemmata, ≈ 26.000 Sätze |
| Wissen `islam` | hanefitisch, Glaube maturiditisch, nur Deutsch; Aussagen mit Belegen, Quizfragen | 28 Einheiten, ≈ 170 Lektionen, ≈ 1.400 Aussagen |
| Koran-Arabisch `koran` | häufigste 500–1.000 Wortformen, Wortschatz der Fatiha und von Cüz 30; Wurzeln und Muster; nur Verweise auf Koran-Wortdaten | ≈ 10 Einheiten, ≈ 60 Lektionen (`PLAN.md` §5.3) |

### 5.2 Funktionen
- **Lernpfad** je Kurs: Stufe → Einheit (Station am Lernweg) → Lektionen, Geschichte, Wiederholung, Prüfstein;
  Einstufungstest.
- **Übungstypen** laut `PLAN.md` §4 (Auswahl, Bildkarten, Paare, Wortbank, Freitext, Hören, Diktat, Minimalpaare, Lücke,
  Satzbau, Formen, Harakat, Dialog, Geschichte, Lesen, Grammatik-Tipp, Schrift, Sprechen, Schreiben; Wissen: Auswahl,
  Wahr/Falsch mit Begründung, Zuordnen, Reihenfolge, Fallfrage).
- **Wiederholung** nach Vergessenskurve (FSRS), täglicher Mix.
- **Sanftes Spielerisches:** XP statisch, Tagesziel (auch „kein Ziel“), Serie mit Pausetagen, Abzeichen, Gruppenziel;
  Bestenliste nur freiwillig, in Gruppe oder Familie, nur für Personen ab 16 mit eigener Zustimmung (L3-E02).
- **Konto, Gruppen, Eltern, Lehrkräfte:** Abgleich, Zuweisungen, Lernwoche des Kindes, Korrektur von Schreibabgaben.
- **Verwaltung (nur Deutsch, Prüfoberfläche Sprache dreisprachig):** Kurse und Vorschau, Sprachprüfung, Zwei-Prüfer-Ansicht
  für Wissen, Audio-Studio, Quellenregister, Meldungen, Statistik ohne Personenbezug.
- **PWA** mit eigenem Manifest und Service Worker im Bereich `/lern-app/`.

### 5.3 Bewusst nicht im Umfang
- Herzen oder Leben, Ligen, globale Ranglisten, Zeitdruck, Käufe, Werbung, Spendenaufrufe in der Lern-App
- Fatwa-Funktion, „Frag den Imam“-Bot, jede Laufzeit-KI auf dem Server oder bei Drittanbietern
- Sprachausgabe für Koran, Hadith, Bittgebete, Einträge mit Religionsbezug, den Wissenskurs und den Koran-Arabisch-Pfad
- Zertifikate (ein Abzeichen „Stufe abgeschlossen“ ist kein Nachweis)
- Freitext-Kommunikation zwischen Lernenden
- Material unter NC-, ND- oder Research-only-Bedingungen

### 5.4 Was „komplett fertig“ heißt
- Technik und KI-Inhalte sind fertig und automatisch geprüft; die Abnahme steht in `ABNAHME.md`.
- Der Wissenskurs ist vollständig entworfen und belegt. Öffentlich ist nur, was zwei Prüfende freigegeben haben; die
  menschliche Prüfung läuft danach weiter (≈ 200 h, `MENSCHEN.md`).
- Sprachkurse sind öffentlich, sobald die automatischen Prüfer und die KI-Gegenprüfung grün sind. Bis die
  Muttersprachler-Stichprobe einer Einheit bestanden ist, trägt sie den Hinweis „noch nicht von Muttersprachlern geprüft“
  (Plan §6 ML-02, L3-E03).

## 6. Vorführpfad (für BERICHT und Stufe C)

Stationen 6 und 7 zeigen religiöse Inhalte nur mit echten Freigaben. Solange LM-03 und LM-13 offen sind, laufen sie im
Beispielmodus mit dem Testkurs aus dem Seed (Testfreigaben zweier Prüfkonten, synthetische Töne statt Rezitation); in der
Produktion zeigen sie dann die Platzhalter.

1. **Einstieg:** `/lernen` → Station „Sprachen lernen“ → `/lern-app/de`: Kurswahl, Tagesziel, „Weiter lernen“.
2. **Türkisch lernen auf Deutsch** (`/lern-app/de/tr-aus-de`): Lernpfad A1, erste Lektion mit Wortbank, Paaren und Hören.
   Rückmeldung B-29, Abschluss B-30; XP stehen statisch.
3. **Offline:** Einheit speichern (Ring nach Bytes), Netz aus, Lektion vollständig spielen, wieder online.
4. **Deutsch lernen auf Arabisch** (`/lern-app/ar/de-aus-ar`): Oberfläche von rechts nach links, Vorkurs Lateinschrift,
   eine A1-Lektion.
5. **Wiederholen:** fällige Karten, Serie mit Pausetag ohne Schuld-Text („Schön, dass du da bist“).
6. **Wissen „Gebet“** (`/lern-app/de/islam`): eine freigegebene Lektion mit Quellenzeile je Aussage und Prüfvermerk ohne
   Namen. Gegenprobe: Ein Baustein mit nur einer Freigabe ist nirgends sichtbar.
7. **Koran-Arabisch** (`/lern-app/de/koran`): häufige Wortformen, nur freigegebene Bedeutungen, Audio aus einer freigegebenen
   Rezitation.
8. **Mit Konto:** zwei Geräte zeigen nach dem Abgleich denselben Stand. Die Lehrkraft weist ihrer Gruppe eine Einheit zu, die
   Schülerin sieht die Zuweisung, die Lehrkraft den Stand.
9. **Verwaltung:** Sprach-Stichprobe einer Einheit; Zwei-Prüfer-Ansicht für eine Aussage mit Beleg-Häkchen.

## 7. Start und Werkstatt

- **Schritt 0 (erledigt):** Der Lauf „Gemeinde-Plattform“ ist abgeschlossen. Das Abschlussurteil auf e68f658 lautet 21/21
  erfüllt; der ABSCHLUSS-Commit ist f2dc1a1 auf `main` (16.10.2026). Offen ist nur noch der Ersatz des CLAUDE.md-Blocks
  (L0). `_gemeinde/` ist damit abgeschlossen; dort ändern sich nur Verweise.
- **Werkstatt `_lernapp/`:** AUFTRAG, KERN, PLAN, ABNAHME, MENSCHEN, ENTSCHEIDUNGEN, STATUS, PRUEFPUNKT, `berichte/`,
  `belege/`, `protokolle/`, `werkzeuge/`, `lehrplan/`. `.vercelignore` bekommt `_lernapp`.
- **Gedächtnis gegen Neustarts:** CLAUDE.md-Block „Lern-App“. Nach jedem Neustart und jeder Kontextverdichtung geht es an
  `PRUEFPUNKT.md` weiter, ohne Rückfrage.
- **Arbeitsweise und Tore:** `ENTSCHEIDUNGEN.md` L3-E12; Etappen L0–L8 in `PLAN.md` §14.
