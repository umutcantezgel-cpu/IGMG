# ABSCHLUSS – Lauf „Lern-App“ (16.–26.10.2026)

## Ergebnis

**Urteil des frischen Endprüfers (`berichte/stufe-c.md`, Stand `e0292127`, 26.10.2026):** **abgenommen mit Auflagen** – 16
erfüllt, 3 AUSNAHME mit Ersatz, 3 teilweise. Das Urteil steht wörtlich in `BERICHT.md`.

Die Auflagen sind danach behoben oder als AUSNAHME mit Grund und Ersatz entschieden (Tor L8, `PLAN.md` §14):

| Stand | erfüllt | AUSNAHME | teilweise |
|---|---|---|---|
| `fb10e4dd` – Stufe C, Gruppenprotokolle | 5 | 0 | 14 (+ 3 offen) |
| `e0292127` – nach N1–N9, Endprüfer | 16 | 3 | 3 |
| `390b6715` – nach den Auflagen | **17** | **5** | **0** |

- **Behoben:** Fokus in „Sprechen“ nach „zu leise“ und „kein Mikrofon“ (243aecfe); LCP des Lernpfads live 5,7 s durch den spät
  gezeichneten Block „Stufe offline speichern“ (b9e581e8); Beschriftung „A1 bis B1“ (0e3a03a0).
- **Entschieden:** L3-E17 (Aufnahme bis 15 s) bestätigt; AUSNAHMEN L3-E18 (Z-L19, libvips nur in der Website-Hülle nach M-060),
  L3-E19 (Z-L02, 26/28 Einheiten), L3-E20 (Z-L07, Lighthouse-Note auf dem Messrechner); Z-L16 belegt über die Zeit vom Push bis
  live, 11 min 24 s (L3-E21).
- Status und Beleg je Kriterium: `ABNAHME.md`. Prüfumfang am Endstand: `BERICHT.md`, „Stand der Prüfungen“.

## Was gebaut ist

Seit `f2dc1a1` (Abschluss des Vorlaufs): ≈ 1.240 Commits, 353 neue Dateien in `web/src`, 7 Migrationen, 9 ADRs (0037–0045),
447 Inhaltsdateien unter `web/inhalte/lernapp`, 131 neue Testdateien (davon 23 E2E-Specs der Lern-App).

**Lern-App, live unter https://igmg-wetzlarer.vercel.app/lern-app/de (bzw. `/tr`, `/ar`):**
- Oberfläche Deutsch, Türkisch, Arabisch (vollständig von rechts nach links), als App installierbar (PWA), ohne Konto und
  offline nutzbar; Einstieg auch über das Menü „Bildung › Sprachen lernen“ der Website.
- Sprachkurse A1–B1 in allen sechs Richtungen: je Richtung 42–43 Einheiten, 329–344 Lektionen, 5.250–5.677 Aufgaben, 17
  Übungstypen; Schrift-Vorkurs, Einstufung, Wiederholung nach der Vergessenskurve (FSRS), Tipps im Sprachvergleich. Hinweis
  „noch nicht von Muttersprachlern geprüft“ bis zur Stichprobe.
- Sanft spielerisch: XP, Tagesziel, Serie mit Pausetagen, Abzeichen, Lernpfad; keine Herzen, Ligen, Zeitgrenzen oder Schuld-Texte.
- Einheit oder ganze Stufe offline speichern, auch über eine neue Bereitstellung hinweg; Lernstand als Datei sichern.

**Gebaut, aber bewusst nicht sichtbar bzw. aus:**
- Wissenskurs nach hanefitischer Lehre (26 Einheiten, 2.124 Aussagen mit 4.603 Belegen): nichts sichtbar ohne zwei Freigaben.
- Koran-Arabisch (40 Einheiten, 936 Wortformen): Bedeutungen nur von Menschen, mit zwei Freigaben.
- Konto mit Abgleich, Gruppen und Lehrkräfte, Lernwoche für Eltern, Schreibabgaben, Bestenliste (ab 16), Spracherkennung im
  Browser (Whisper, nichts verlässt das Gerät; an seit 27.10.2026, Nachtrag L3-E23), Verwaltung mit Sprach- und religiöser
  Prüfung, Audio-Studio.

**Prüfungen:** Inhaltsprüfer und religiöse Sperre (0 blockierend, 0 Befunde), Lektorat und Rückübersetzung je Einheit, axe-Matrix
über alle Routen, Tastaturwege für alle Typen, Netzprotokoll, Lasttest des Abgleichs, Sicherheitsprüfungen S-L1…S-L3, Stufe C mit
fünf Gruppen, Nacharbeit N1–N9, frischer Endprüfer und Vollständigkeitskritik.

## Übergabe – was nur Menschen tun können

Die vollständige Liste steht in `MENSCHEN.md` (LM-01…LM-40) und `GO-LIVE.md` (Schalter, Reihenfolge, Entscheidungen der Abnahme).
Die Rangfolge steht in `BERICHT.md`, „Was nur Menschen tun können“. Das Wichtigste:

1. **Religiöse Prüfung (LM-03, MN-24):** zwei Konten „religiöse Prüfung“ ohne Administrationsrolle; Wissenskurs (zuerst Taharah
   und Salah), Formelliste (LM-09), Koran-Bedeutungen (LM-13), Wurzeltabelle (LM-31).
2. **Muttersprachliche Prüfung (LM-01):** je Sprache zwei Personen „Sprachprüfung“; Stichproben je Einheit.
3. **Datenbank und Geheimnisse (G1/G2, MN-00):** danach Verwaltung, Meldungen und – nach LM-08 – Konto, Abgleich und Gruppen.
4. **Redaktionsfragen (LM-02, LM-09):** Rahmenpläne, OF-01…OF-18, darunter OF-10 Staatskunde; R-06 „Pilz“.
5. **Stimmen und Audio (LM-06, LM-15, LM-24…LM-26):** Hörabnahme Thorsten, Blob-Speicher, Stimmen bzw. Aufnahmen tr und ar.
6. **Werke (LM-04, LM-33):** Werke für die Siyar-Einheiten benennen, Ausgaben festlegen.
7. **Geräte und Screenreader (LM-07, LM-19, MN-19):** iPhone, Android, Laptop; NVDA, VoiceOver, TalkBack.
8. **Aus der Abnahme:** M-060 für die Lern-App-Seiten der Website-Hülle bestätigen (LM-37), Vercel-Bauzeit im Dashboard bestätigen (LM-38),
   Lighthouse auf einem Referenzgerät gegenmessen (LM-39).
9. **Aufräumen:** überzählige Vercel-Projekte (sie bauen dasselbe Repository nacheinander und verlängern jede Bereitstellung) und
   die gemergten Arbeitsbäume unter `.claude/worktrees/` entfernen lassen.

## Nachtrag 27.10.2026 – Wissenskurs als Entwurf auf der Test-Domain (L3-E22)

Auf Auftrag des Nutzers: Die 26 Einheiten des Wissenskurses werden im Bau importiert (Status „Entwurf“, ohne Prüfungen) und
sind mit dem neuen Schalter `lernapp_wissen_vorschau` (in der Produktion an) als „Entwurf zur Prüfung“ gekennzeichnet
erreichbar. Vor dem öffentlichen Start: Schalter aus (`FUNKTION_LERNAPP_WISSEN_VORSCHAU=aus`) oder alles von zwei Gelehrten
geprüft (LM-03); das Cockpit warnt bis dahin. `lernapp_sprechen` bleibt aus (S-L3 N-4: erst Ratenregel). Einzelheiten:
`ENTSCHEIDUNGEN.md` L3-E22, `GO-LIVE.md`.

## Nachtrag 27.10.2026 – Spracherkennung an, B1 de/tr Einheit 16 frei (L3-E23)

Auf Auftrag des Nutzers („Ja alles freischalten“, „Jetzt einschalten“), Branch `lernapp-freischalten`:
- **Spracherkennung** (`lernapp_sprechen`) ist in der Produktion an (a67d3a7c). Deutsch und Türkisch bieten „Sprachprüfung laden
  (≈ 95 MB)“ an; die Aufnahme bleibt auf dem Gerät. Die Ratenregel der Vercel-Firewall für `/lern-app/modelle/` setzt der
  Betreiber (LM-40; 200 Anfragen je 600 s und IP, Klickfolge in `GO-LIVE.md` „Ausnahme N-4“). Gerätetest LM-07 bleibt offen.
- **B1 Einheit 16** in Deutsch („Gemeinde und Grundrechte“, OF-10 nach dem Standard „Ja, sachlich“) und Türkisch („Wir kochen
  für Gäste“, R-06 „Pilz“ als Fehltreffer) ist `automatisch_geprueft` (e95f4213, nur die Zeile `status`). Damit hat jede
  Richtung 43 Einheiten (B1 vollständig, `berichte/mengen.md`). Abweichung von L3-E15: 15 bekannte `menschlich_klaeren`
  bleiben im Prüferlauf sichtbar.
- Zurücknehmen können Vorstand bzw. Hoca jederzeit (`FUNKTION_LERNAPP_SPRECHEN=aus`; `status` zurück auf `entwurf` und neu
  bauen). Einzelheiten: `ENTSCHEIDUNGEN.md` L3-E23.

## Zurückrollen

`main` wird nur per Fast-Forward fortgeschrieben. Die Lern-App lässt sich ohne Codeänderung abschalten: `FUNKTION_LERNAPP=aus` in
Vercel (dann 404, Abmelde-Worker räumt die Geräte auf; `GO-LIVE.md`). Einzelne Stände nimmt ein Revert-Commit auf dem
Arbeitsbranch und ein neuer Fast-Forward zurück; Vercel baut automatisch (`web/docs/deploy/VERCEL.md` §12).

## Wie es weitergeht

- **Menschen** arbeiten die Übergabe ab; jede Freigabe macht Inhalte ohne neuen Bau sichtbar (Export der Freigaben, Paketbau).
- **Ausbau** (offen, nach Entscheidung des Nutzers): B2 und C1 (L3-E16; Deutsch B2 mit 12 Einheiten als Entwurf), mehr Sätze
  aus dem Vorrat in Aufgaben (Z-L01), Wissenskurs-Quiz auf ≈ 1.700 Fragen, Siyar nach LM-04, Website-Hülle mit `sharp` nur in
  den Upload-Seiten (L3-E18), TBT von Startseite und Spieler weiter senken (L3-E20, `leistung.md` N8.7).

## Verbleibende Feinheiten (niedrig, aus Endprüfer und Kritik)

- „Stufe offline speichern“ steht seit b9e581e8 am Ende der Stufe. Die Stationskarten darüber zeichnen sich erst in Sichtweite
  (Schätzhöhe); beim schnellen Hinscrollen auf dem Telefon kann der Knopf deshalb kurz nachrutschen. Die E2E tippen erst, wenn er
  still steht.
- Fünf Verwaltungsseiten der Lern-App ohne eigenen axe-E2E (Übersicht, Befunde, Kurs, Prüfende, Quellen).
- Netzprotokoll nur im Desktop-Projekt; der Beleg mit echtem Modell stammt von einem Bau vor N9a.
- INP des Spielers streut auf dem Messrechner um 200 ms (Median erfüllt, Einzelwert 216 ms).
- Live liefert `/api/health` ohne Datenbank 503; „Fehler melden“ wirkt erst mit Datenbank.
- Die Bau-Ausgabe zu Z-L19 ist nur am Testbau gezählt; die Zählung am Vercel-Bau (`.vercel/output/functions`) gehört zu LM-37.
