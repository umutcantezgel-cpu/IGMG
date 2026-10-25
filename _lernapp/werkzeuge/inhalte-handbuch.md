# Inhalts-Handbuch der Sprachkurse (für Inhalts-Agenten)

- **Stand:** 21.10.2026 (L3-03). Für Entwurf, Lektorat, Übersetzung, Rückübersetzung und Schlussprüfung aller Stufen A1–C1 der Kurse `de`, `tr`, `ar`.
- **Lesen:** nur dieses Handbuch und die Ausschnitte aus deinem Briefing (eigener Rahmen-Eintrag, eigener Plan-Ausschnitt, Hinweise der Vorgänger; Schnipsel in §9). Schema, Prüfer,
  Rahmenpläne und Pläne nicht vollständig lesen. Bei Widerspruch gilt: Briefing, dann Code (Schema, Prüfer), dann dieses Handbuch.
- **Grundlage:** `web/src/lib/lernapp/inhalt/schema.ts`, `…/inhalt/pruefer/*.ts`, `web/src/lib/lernapp/kurse.ts`, PLAN §4, §5.1, §6.1–§6.4, KERN §2, §3, §5, §7,
  `_lernapp/lehrplan/INHALTSLEITFADEN.md`, `web/inhalte/lernapp/rahmen/leitfaden.json`, `web/daten/{tatoeba,kaikki,haeufigkeit}/QUELLE.md`, die A1-Dateien und die Rückgaben aus
  L3-07.

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte, weder arabisch noch übersetzt; keine Koran-Wortbedeutungen, keine
> Fiqh-Aussagen. Sprachkurse sind ohne Religionsbezug; Begriffe mit Religionsbezug nur als markierter Kandidat (§7). Arabische Schrift nur in
> `web/inhalte/lernapp/{sprache,uebersetzung,aussprache}/**`, nie in `_lernapp/**`, Berichten, Rückgaben oder Commit-Texten (dort Umschrift nach DIN 31635 oder Schlüssel, auch
> keine Codepunkt- oder Entitäten-Schreibweise). Keine Wörter des Tabu-Lexikons in Rückgaben (nur Kategorie-IDs), keine Modellbezeichnungen.

## 1 Ablauf und Zuständigkeit

Kette (PLAN §6.3): Entwurf → Prüfer → Lektorat → Nachbessern (höchstens 2 Runden, Rest `menschlich_klaeren`) → Übersetzung je Richtung → Rückübersetzung → Schlussprüfung der Stufe
→ Import (`pnpm lernapp:import`, kein Inhalts-Agent).

| Rolle | Eingabe | schreibt | fertig, wenn |
|---|---|---|---|
| Entwurf | Rahmen-Eintrag, Plan-Ausschnitt (Lemmata), Hinweise, Lemmata und Sätze früherer Einheiten (§9) | `sprache/<kurs>/<stufe>/<einheit>.json` | eigene Datei 0 blockierend; `menschlich_klaeren` nur bekannte Fehlalarme (§8), gemeldet; Tipp-Themen und -Nummern für die Übersetzung in der Rückgabe |
| Lektorat (frischer Agent) | Einheit, Prüferbericht der Datei, Rahmen-Eintrag | Urteil je Punkt; Korrekturen nur, wenn das Briefing es erlaubt, dann nur in dieser Einheit | Natürlichkeit, Stufe, Kultur und Leitfaden (§7), Ablenker eindeutig falsch, Alternativen vollständig |
| Übersetzung (je Richtung) | Einheit, Tipp-Wünsche des Entwurfs, Kontrastdokument `_lernapp/lehrplan/kontrast-<richtung>.md` §6 (nur Zeilen der Einheit) | `uebersetzung/<richtung>/<stufe>/<einheit>.json` | jedes Lemma und jeder Satz der Einheit übersetzt; jedes `tNN` der Einheit vorhanden; 0 blockierend |
| Rückübersetzung (frischer Agent) | Einheit und Übersetzungsdatei | nur Befunde in der Rückgabe | je Eintrag Bedeutung gleich; jede Alternative richtig; keine Alternative gleich der Übersetzung eines Ablenkers derselben Aufgabe |
| Schlussprüfung (je Kurs und Stufe) | Gesamtbericht, alle Dateien der Stufe per jq | nur nach Briefing | Stufe 0 blockierend; Lemmata der Stufe ±5 % des Budgets; Übersetzungen und Tipps vollständig (§9); offene Punkte gesammelt |

- Nur die eigenen Dateien ändern. Andere Agenten schreiben gleichzeitig im selben Arbeitsbaum; ihre Dateien und Befunde nicht anfassen, nur in der Rückgabe nennen. `status` bleibt
  `entwurf`; `automatisch_geprueft` setzt nur der Import.
- Rückgabe knapp: Dateien, Commit, Zahlen, Prüferstand der eigenen Datei, Mängel, `menschlich_klaeren`, Hinweise für Folgende.

## 2 Ablage, Dateinamen, Schlüssel

Pfade relativ zu `web/inhalte/lernapp/`:
- **Sprach-Einheit** (gilt für beide Ausgangssprachen): `sprache/<kurs>/<stufe>/<einheit>.json`, z. B. `sprache/de/a2/de.a2.e03.json`.
- **Übersetzung:** `uebersetzung/<richtung>/<stufe>/<einheit>.json`, je Richtung und Einheit genau eine Datei. Richtungen `<ziel>-aus-<ausgang>`: `tr-aus-de`, `ar-aus-de`,
  `de-aus-tr`, `ar-aus-tr`, `de-aus-ar`, `tr-aus-ar`; jede Einheit hat zwei.
- **Vorkurs (Schrift):** `sprache/<kurs>/a1/<kurs>.a1.e00-<ausgang>.json` mit `nurFuerAusgang`; im Rahmen unter `vorkurs`, nicht unter `stufen[].einheiten` (Warnung `abdeckung`
  erwartet); 0 Lemmata, belastet kein Budget.
- Falscher Ort → blockierend „gehört nach …“. Stufen in Pfaden und Schlüsseln klein (`a1` … `c1`).

| Was | Muster | Beispiel |
|---|---|---|
| Einheit | `<kurs>.<stufe>.eNN` (wie im Rahmen) | `de.a2.e03` |
| Vorkurs | `<kurs>.a1.e00-<ausgang>` | `tr.a1.e00-ar` |
| Lemma | `<einheit>.<slug>`; slug aus a–z, 0–9, `-`; ä → ae, ö → oe, ü → ue, ß → ss; tr und ar als ASCII-Umschrift (`canta`, `kitab`); gleiche Schreibung mit Zusatz (`sein-poss`, `sie-hoeflich`) | `de.a2.e03.kueche` |
| Satz | `<einheit>.sNNNN`, vierstellig, fortlaufend | `de.a2.e03.s0042` |
| Lektion | `<einheit>.lNN`: l01–l05 Lektion, l06 Geschichte, l07 Wiederholung, l08 Prüfstein | `de.a2.e03.l06` |
| Aufgabe | `<lektion>.aNN` | `de.a2.e03.l06.a01` |
| Tipp | in der Übersetzungsdatei `<einheit>.<ausgang>.tNN`; die Aufgabe nennt nur `tNN` | `de.a2.e03.tr.t02` |

- Gültig (`kurse.ts`): `^[a-z0-9-]+(\.[a-z0-9-]+)+$`, höchstens 120 Zeichen, beginnt mit `<kurs>.`; alles in der Datei beginnt mit dem Einheitenschlüssel; über alle Dateien eines
  Kurses eindeutig (sonst blockierend „Schlüssel auch in …“). Plan-Lemmata behalten ihre Plan-Schlüssel.
- **`reihenfolge` = NN + 1:** Vorkurs 1, e01 2, e02 3 … (so in A1 aller drei Kurse; in A2–C1 ebenso). Der Wortschatz-Prüfer ordnet Lemmata nach Stufe und `reihenfolge`.
- Aufgaben dürfen Lemmata und Sätze früherer Einheiten desselben Kurses verweisen (Wiederholung, Ablenker); früher eingeführte Lemmata nie neu anlegen; Verweise auf spätere
  Einheiten meiden.
- `einheit.symbol`: Lucide-Name wie im Bestand (`message-circle`, `users`, `house`).

## 3 Dateiaufbau

### 3.1 Sprach-Einheit (Gerüst, gegen das Schema geprüft)

```json
{
  "format": "igmg-lernapp-sprache", "version": 1, "status": "entwurf", "kurs": "de", "stufe": "a2",
  "einheit": {
    "schluessel": "de.a2.e03", "reihenfolge": 4, "thema": { "de": "Unsere neue Wohnung", "tr": "…", "ar": "…" },
    "kannBeschreibungen": [{ "de": "Ich kann meine Wohnung beschreiben.", "tr": "…", "ar": "…" }], "symbol": "house", "kinderGeeignet": true
  },
  "lemmata": [{ "schluessel": "de.a2.e03.kueche", "lemma": "Küche", "wortart": "nomen", "merkmale": { "genus": "f", "artikel": "die", "plural": "Küchen" },
                "formen": { "pl": "Küchen" }, "frequenzRang": 2900, "quelle": "ki:lernapp-inhalte/a2/v1", "lizenz": "CC-BY-SA-4.0" }],
  "saetze": [{ "schluessel": "de.a2.e03.s0001", "text": "Die Küche ist klein.", "quelle": "ki:lernapp-inhalte/a2/v1", "lizenz": "CC-BY-SA-4.0" }],
  "lektionen": [{ "schluessel": "de.a2.e03.l01", "art": "lektion", "ziel": { "de": "Ich kann Räume benennen.", "tr": "…", "ar": "…" },
                  "aufgaben": [{ "schluessel": "de.a2.e03.l01.a01", "typ": "auswahl", "anweisung": "waehleWort", "ziel": "de.a2.e03.kueche", "ablenker": ["de.a2.e01.zimmer"] }] }]
}
```

| Feld | Pflicht | Grenzen, Regeln |
|---|---|---|
| `einheit.thema` | ja | Lerntext `{de, tr, ar}`, je ≤ 300 Zeichen; im Bestand immer alle drei Sprachen |
| `einheit.kannBeschreibungen` | kann | ≤ 12 Lerntexte; aus dem Rahmen übernehmen und übersetzen |
| `einheit.kinderGeeignet` | A1–B1 ja | `true`; B2/C1 nur `true`, wenn alle Einträge die Kinderregeln erfüllen |
| `einheit.symbol`, `nurFuerAusgang` | kann | ≤ 200 Zeichen; `nurFuerAusgang` nur im Vorkurs |
| `lemmata[]` | – | ≤ 400; `lemma` ≤ 80, `wortart` ≤ 40, `merkmale` und `formen` (Schlüssel ≤ 40, Wert ≤ 80 bzw. 120), `frequenzRang` 1–10.000.000, `symbol` nur mit freigegebenem Motiv |
| `saetze[]` | – | ≤ 1000; `text` ≤ 600 (darf mehrere Sätze enthalten), `tokens` ≤ 80 Einträge je ≤ 80 Zeichen |
| `lektionen[]` | ja | 1–20; `art` aus `lektion`, `geschichte`, `wiederholung`, `pruefstein`, `schrift`, `schreiben`, `sprechen`; `ziel` Lerntext; `kinderGeeignet` in A1–B1 nie `false`; `aufgaben` 1–40 |
| Herkunft je Lemma, Satz, Übersetzungseintrag | ja | `quelle`, `lizenz`, `namensnennung` (≤ 300, wo nötig), `religionsbezug` (§3.3, §7) |

- Alle Objekte sind strikt: unbekannte Felder (z. B. `plan` aus dem ar-Plan) sind Schemafehler. Texte getrimmt, nicht leer, NFC.
- `formen`-Werte zählen für den Wortschatz-Prüfer als bekannte Formen; gebeugte Formen in Sätzen sollten dort stehen.
- `tokens` nur für feste Wendungen aus mehreren Wörtern (`["Auf Wiedersehen"]`) oder abgetrennte Klitika; sie ersetzen beim Zählen die Wörter des Texts, müssen also alle Wörter
  abdecken; eine Wendung muss selbst Lemma oder Form sein.

### 3.2 Übersetzung (Gerüst, gegen das Schema geprüft)

```json
{
  "format": "igmg-lernapp-uebersetzung", "version": 1, "status": "entwurf", "richtung": "de-aus-tr", "einheit": "de.a2.e03",
  "eintraege": [
    { "bezug": "de.a2.e03.kueche", "text": "mutfak", "quelle": "ki:lernapp-inhalte/a2/v1", "lizenz": "CC-BY-SA-4.0" },
    { "bezug": "de.a2.e03.s0001", "text": "Mutfak küçük.", "alternativen": ["Mutfak ufak."], "quelle": "ki:lernapp-inhalte/a2/v1", "lizenz": "CC-BY-SA-4.0" }
  ],
  "tipps": [{ "schluessel": "de.a2.e03.tr.t01", "titel": "Die Küche: Artikel immer mitlernen", "quelle": "ki:lernapp-inhalte/a2/v1",
              "inhalt": { "type": "doc", "content": [
                { "type": "paragraph", "content": [{ "type": "text", "text": "…" }] },
                { "type": "blockquote", "content": [{ "type": "paragraph", "content": [{ "type": "text", "text": "die Küche – die Küchen" }] }] } ] } }]
}
```

- `eintraege` ≤ 2000: je Lemma (Glosse) und je Satz der Einheit genau ein Eintrag, `bezug` eindeutig; `text` ≤ 600; `alternativen` ≤ 30, durchschnittlich 3 je Satz: weitere
  richtige Fassungen (Wortstellung, Synonym, Pronomen gesetzt oder weggelassen, Ziffer oder Zahlwort), jede verschieden in der Vergleichsform (§4) vom Text und untereinander.
- Fehlt die Übersetzung eines Verweises, lässt der Paketbau Aufgabe oder Ablenker still weg (kein Prüferbefund).
- `tipps` ≤ 20, Tiptap-Dokument (≤ 200 Knoten): `paragraph` = Text (je Abschnitt 1–10), `heading` = neuer Abschnitt (≤ 12), `blockquote` mit `paragraph` = Beispiele in der
  Zielsprache (≤ 10), `bulletList` = Textpunkte. Kurz: Titel, höchstens zwei Sätze, ein bis drei Beispiele mit Wortschatz bis zur Einheit; Brücke zuerst, keine Wertung der
  Ausgangssprache. Der Tabu-Prüfer liest Tipps auch gegen die Zielsprache; Beispiele daher nur in Zitatblöcke.

### 3.3 Herkunft und Lizenz

| Herkunft | `quelle` | `lizenz` | `namensnennung` |
|---|---|---|---|
| eigener Text | `ki:lernapp-inhalte/<stufe>/v1` | `CC-BY-SA-4.0` | – |
| Redaktion | `redaktion` | `CC-BY-SA-4.0` | – |
| Tatoeba-Satz | `tatoeba:<id>` | wie im Auszug: `CC-BY-2.0-FR` (oder `CC0-1.0`) | `Satz #<id> von <benutzer> (Tatoeba), CC BY 2.0 FR`; ohne Benutzer `Tatoeba-Mitwirkende`; geänderter Text mit „bearbeitet“, ar nach Vokalisierung „bearbeitet (vokalisiert)“ |
| Wiktionary (kaikki) | `wiktionary:<en,de,tr>:<Seitentitel>` | `CC-BY-SA-4.0` | Pflicht, Wortlaut wie in den Plan-Lemmata (Artikel, Adresse, Wiktextract, „gekürzt und umformatiert“) |

- Tatoeba nur aus `web/daten/tatoeba/saetze_{deu,tur,ara}.tsv` (Spalten id, sprache, text, benutzer, lizenz, angelegt, geaendert, bew_pos, bew_neg, tags): `bew_neg` 0, kein Tag mit
  `@`, höchstens 12 Wörter, nicht auf der Ausschlussliste in `QUELLE.md`, Text wörtlich. Sätze mit Tags zur Religion oder mit Treffer im Tabu-Lexikon weglassen, nicht umschreiben.
  Nicht als `luecke` (gilt als Bearbeitung). Benutzer mit anstößig wirkendem Namen meiden. Eine Übersetzung darf den verlinkten Tatoeba-Satz der Ausgangssprache nehmen
  (`paare_<a>-<b>.tsv`), dann mit dessen ID und Nennung.
- Aus kaikki nie Beispiele übernehmen. Andere Quellen gibt es nicht; der Prüfer `ausschluss` blockiert fremde Korpora.

## 4 Aufgabentypen

Für alle: `schluessel` und `typ` sind Pflicht; Verweise sind Schlüssel von Lemmata oder Sätzen des Kurses. Der Paketbau braucht für Ziel, Ablenker und Paare die Übersetzung;
bleiben weniger als 2 Optionen, entfällt die Aufgabe. **Gleich** heißt immer: gleich in der Vergleichsform (Groß/Klein, Satzzeichen, Leerraum zählen nicht; de ß = ss; tr türkisch
klein, ohne Zirkumflex; ar ohne Harakat und Tatweel, Alif-Formen = Alif, Tāʾ marbūṭa = Hāʾ, Alif maqṣūra = Yāʾ). „ab“ nach PLAN §4. Beispiele aus `de.a2.e03` (Wohnen). Muster aus
dem Bestand, auch für ar: `jq '.lektionen[].aufgaben[] | select(.typ=="dialog")' <Datei>`.

**`auswahl`** · ab A1 · Wort erkennen (`waehleUebersetzung`: Zielwort gezeigt; `waehleWort`: Übersetzung gezeigt). Pflicht: `anweisung`, `ziel`, `ablenker` (1–5). Blockiert:
Ablenker gleich dem Ziel oder mit gleicher Übersetzung in einer Richtung, auch über Alternativen (Synonyme; er/sie/es → tr „o“; ihr/Sie → tr „siz“; arabische Genuspaare → tr
gleich).
```json
{"schluessel": "de.a2.e03.l01.a02", "typ": "auswahl", "anweisung": "waehleUebersetzung", "ziel": "de.a2.e03.kueche", "ablenker": ["de.a2.e03.bad", "de.a2.e03.flur"]}
```
**`bild_wort`** · ab A1 · Bildkarte, Zielwort wählen. Pflicht: `ziel` (Lemma mit `symbol`), `ablenker` (1–5). Nur mit Motiv, das in `symbole/symbole.json` `freigegeben` ist (LM-34;
Stand: keines): `symbol` ohne Freigabe blockiert, ohne `symbol` fällt die Aufgabe im Paketbau weg. Bis zur Freigabe weder `symbol` noch `bild_wort`, außer das Briefing sagt
anderes. Nur Gegenstände (§7).
```json
{"schluessel": "de.a2.e03.l01.a03", "typ": "bild_wort", "ziel": "de.a2.e03.lampe", "ablenker": ["de.a2.e03.tisch", "de.a2.e03.stuhl"]}
```
**`paare`** · ab A1 · Paare zuordnen. Pflicht: `lemmata` (2–6, verschieden). Blockiert: zwei Einträge mit gleicher Form oder gleicher Übersetzung in einer Richtung.
```json
{"schluessel": "de.a2.e03.l01.a04", "typ": "paare", "lemmata": ["de.a2.e03.kueche", "de.a2.e03.bad", "de.a2.e03.flur", "de.a2.e03.zimmer"]}
```
**`wortbank`** · ab A1 · mit Kacheln übersetzen. Pflicht: `anweisung: "uebersetze"`, `satz`, `nach` (`ziel`: in die Zielsprache legen; `ausgang`: Zielsatz in die Ausgangssprache).
`alternativen` (≤ 20) und `ablenker` (≤ 8, je ≤ 60) nur bei `nach: "ziel"`, sonst blockiert (dort gelten Übersetzung und deren Alternativen). Blockiert auch: Satz unter 2 Wörtern,
Ablenker ist ein Wort der Lösung, Alternative gleich dem Satz. Jede andere richtige Wortstellung als Alternative; Ablenker eindeutig falsch (kein Synonym, kein Genuswechsel ohne
Name oder Kontext). Bezug: s0002 „Heute ist das Bad frei.“
```json
[{"schluessel": "de.a2.e03.l02.a01", "typ": "wortbank", "anweisung": "uebersetze", "satz": "de.a2.e03.s0002", "nach": "ziel", "alternativen": ["Das Bad ist heute frei."], "ablenker": ["gestern", "Küche"]},
 {"schluessel": "de.a2.e03.l02.a02", "typ": "wortbank", "anweisung": "uebersetze", "satz": "de.a2.e03.s0002", "nach": "ausgang"}]
```
**`frei`** · ab A2 (ar ab B1) · Freitext übersetzen. Pflicht: `ziel`, `nach`; `alternativen` (≤ 20) nur bei `nach: "ziel"` (sonst blockiert), verschieden vom Ziel. Bezug: s0004
„Unsere Wohnung hat drei Zimmer.“
```json
{"schluessel": "de.a2.e03.l03.a01", "typ": "frei", "ziel": "de.a2.e03.s0004", "nach": "ziel", "alternativen": ["Unsere Wohnung hat 3 Zimmer."]}
```
**`hoeren_waehlen`** · ab A1 · hören und wählen (`waehleGehoertes`: Optionen in der Zielsprache; `waehleBedeutung`: Übersetzungen). Pflicht: `anweisung`, `ziel`, `ablenker` (1–5).
Optionen und bei `waehleBedeutung` ihre Übersetzungen verschieden (ar: Hamza-Formen gelten als Alif). Ohne Audio überspringt der Spieler die Aufgabe (tr und ar derzeit „Audio
folgt“): Die Lektion muss ohne Hörtypen tragen. Nie für Einträge mit `religionsbezug`.
```json
{"schluessel": "de.a2.e03.l03.a02", "typ": "hoeren_waehlen", "anweisung": "waehleGehoertes", "ziel": "de.a2.e03.s0005", "ablenker": ["de.a2.e03.s0006", "de.a2.e03.s0007"]}
```
**`hoeren_schreiben`** · ab A1 (ar ab A2) · Diktat. Pflicht: `ziel`; kann `alternativen` (≤ 20) nur als gleichwertige Schreibung (Ziffer oder Zahlwort), nie gekürzt; Alternative
gleich dem Ziel blockiert.
```json
{"schluessel": "de.a2.e03.l03.a03", "typ": "hoeren_schreiben", "ziel": "de.a2.e03.s0004", "alternativen": ["Unsere Wohnung hat 3 Zimmer."]}
```
**`minimalpaare`** · ab A1 · fast gleich klingende Wörter unterscheiden. Pflicht: `ziel` (gehört), `ablenker` (1–3). Blockiert: gleich dem Ziel (ar: reine Vokal- oder
Schadda-Paare, Hamza gegen Alif). Partnerwort möglichst als Lemma, auch früherer Einheit; neue Ein-Wort-Sätze doppeln leicht Vorkurs-Sätze. Bezug: Miete – Mitte.
```json
{"schluessel": "de.a2.e03.l03.a04", "typ": "minimalpaare", "ziel": "de.a2.e03.miete", "ablenker": ["de.a2.e02.mitte"]}
```
**`luecke`** · ab A1 · Lückentext. Pflicht: `ziel` (Satz), `wort` (0-basiert, Leerraum trennt, Satzzeichen an den Rändern zählen nicht); kann `ablenker` (1–5, je ≤ 60; ohne =
Freitext), `alternativen` (≤ 10). Blockiert: Index ohne Wort; Ablenker gleich dem Wort oder einer Alternative. Ablenker, die im Satz auch stimmen, meiden; keine Tatoeba-Sätze; ar
in A1 nur mit Ablenkern. Bezug: s0008 „Ich stelle die Lampe auf den Tisch.“
```json
{"schluessel": "de.a2.e03.l04.a01", "typ": "luecke", "ziel": "de.a2.e03.s0008", "wort": 5, "ablenker": ["dem", "der"]}
```
**`satzbau`** · ab A2 · Wörter ordnen. Pflicht: `ziel`; kann `alternativen` (≤ 20) mit jeder anderen richtigen Wortstellung (fehlende wird als falsch bewertet). Blockiert: Satz
unter 2 Wörtern. Höchstens 24 Kacheln.
```json
{"schluessel": "de.a2.e03.l04.a02", "typ": "satzbau", "ziel": "de.a2.e03.s0002", "alternativen": ["Das Bad ist heute frei."]}
```
**`formen`** · ab B1 · Formentabelle. Pflicht: `zeilen` (1–12), `spalten` (1–8), `zellen` (1–96; `zeile`, `spalte`, `loesungen` 1–10 je ≤ 60, `vorgabe` = vorausgefüllt); kann
`lemma`. Köpfe in der Zielsprache. Blockiert: Zelle außerhalb der Tabelle; ar: alle Zellen voll vokalisiert.
```json
{"schluessel": "de.b1.e04.l02.a05", "typ": "formen", "lemma": "de.b1.e04.fahren", "zeilen": ["ich", "du", "er/sie/es"], "spalten": ["Präsens", "Präteritum"], "zellen": [{"zeile": 0, "spalte": 0, "loesungen": ["fahre"], "vorgabe": true}, {"zeile": 1, "spalte": 0, "loesungen": ["fährst"]}, {"zeile": 2, "spalte": 1, "loesungen": ["fuhr"]}]}
```
**`harakat`** · nur Kurs `ar`, ab A2/B1 · richtige Vokalisierung wählen. Pflicht: `ziel`, `varianten` (1–3, je ≤ 120): gleiches Gerüst, nur die Zeichen anders, genau verschieden
vom Ziel und untereinander (strenger Vergleich mit Harakat); auch Varianten tragen an jedem Buchstaben ein Zeichen (Prüfer `vokalisierung`). In de und tr blockiert.
```json
{"schluessel": "ar.b1.e02.l03.a05", "typ": "harakat", "ziel": "ar.b1.e02.s0031", "varianten": ["‹falsch vokalisierte Fassung 1›", "‹falsch vokalisierte Fassung 2›"]}
```
**`dialog`** · ab A1 · passende Antwort im Gespräch. Pflicht: `zeilen` (1–20; `sprecher` a/b, `satz`), `antwort`, `ablenker` (1–5). Blockiert: Ablenker gleich der Antwort. Keine
Ablenker, die nur in Person oder Zahl abweichen und als Antwort durchgingen. Bezug: a „Ist die Wohnung groß?“ – b „Sie hat drei Zimmer.“ – a „Und wie hoch ist die Miete?“ → „Sie
kostet 700 Euro.“; Ablenker „Das Bad ist links.“, „Wir wohnen in Wetzlar.“
```json
{"schluessel": "de.a2.e03.l05.a01", "typ": "dialog", "zeilen": [{"sprecher": "a", "satz": "de.a2.e03.s0010"}, {"sprecher": "b", "satz": "de.a2.e03.s0011"}, {"sprecher": "a", "satz": "de.a2.e03.s0012"}], "antwort": "de.a2.e03.s0013", "ablenker": ["de.a2.e03.s0014", "de.a2.e03.s0015"]}
```
**`geschichte`** · ab A1 · Geschichte mit eingestreuten Fragen. Pflicht: `zeilen` (1–60; `sprecher` a/b/c, ohne = Erzähler); kann `titel` (Satz), `fragen` (≤ 10; `nach` = Index der
Zeile, 0-basiert, aufsteigend; `frage`, `antwort`, `ablenker` 1–5). Blockiert: `nach` hinter der letzten Zeile, Fragen nicht aufsteigend, Ablenker gleich der Antwort.
```json
{"schluessel": "de.a2.e03.l06.a01", "typ": "geschichte", "titel": "de.a2.e03.s0020", "zeilen": [{"satz": "de.a2.e03.s0021"}, {"sprecher": "a", "satz": "de.a2.e03.s0022"}, {"sprecher": "b", "satz": "de.a2.e03.s0023"}], "fragen": [{"nach": 2, "frage": "de.a2.e03.s0024", "antwort": "de.a2.e03.s0025", "ablenker": ["de.a2.e03.s0026"]}]}
```
**`lesen_fragen`** · ab B1 (PLAN §4); in A1/A2 eine Aufgabe, wo der Rahmen einen Lesetext verlangt (Bestand, offene Frage). Pflicht: `absaetze` (1–40 Sätze), `fragen` (1–10:
`auswahl` mit `frage`, `antwort`, `ablenker` oder `rfn` mit `aussage` und `richtig` = `richtig`, `falsch`, `nicht_im_text`); kann `titel`, `glossen` (≤ 200 Lemmata).
```json
{"schluessel": "de.a2.e03.l05.a10", "typ": "lesen_fragen", "titel": "de.a2.e03.s0030", "absaetze": ["de.a2.e03.s0031", "de.a2.e03.s0032"], "glossen": ["de.a2.e03.miete"], "fragen": [{"art": "rfn", "aussage": "de.a2.e03.s0033", "richtig": "nicht_im_text"}, {"art": "auswahl", "frage": "de.a2.e03.s0034", "antwort": "de.a2.e03.s0035", "ablenker": ["de.a2.e03.s0036"]}]}
```
**`grammatik_tipp`** · ab A1 · Tipp-Karte. Pflicht: `tipp` (`tNN`). Der Tipp `<einheit>.<ausgang>.tNN` muss in beiden Übersetzungsdateien stehen, sonst fällt die Karte still weg;
der Entwurf nennt Thema und Nummer jedes Tipps in der Rückgabe, die Übersetzung nummeriert genauso.
```json
{"schluessel": "de.a2.e03.l01.a01", "typ": "grammatik_tipp", "tipp": "t01"}
```
**`sprechen`** · ab A1 · Satz nachsprechen. Pflicht: `satz`; nie mit `religionsbezug`; Inhalt nach dem Feld `sprechen` des Rahmens.
```json
{"schluessel": "de.a2.e03.l05.a15", "typ": "sprechen", "satz": "de.a2.e03.s0040"}
```
**`schreiben`** · B1–C1 · Schreibaufgabe. Pflicht: `aufgabe` (Satz), `woerter` (`min` ≤ `max`, je 1–600), `muster` (1–2 Sätze); kann `pflichtwoerter` (≤ 10, je ≤ 60). Eine
Musterantwort ist ein Satz-Eintrag (≤ 600 Zeichen), jeder ihrer Sätze unter der Satzlänge der Stufe (§5).
```json
{"schluessel": "de.b1.e05.l05.a14", "typ": "schreiben", "aufgabe": "de.b1.e05.s0060", "woerter": {"min": 40, "max": 80}, "pflichtwoerter": ["Wohnung", "Miete"], "muster": ["de.b1.e05.s0061"]}
```
**`schrift_ar`** · nur Vorkurs `ar.a1.e00-<de,tr>` · Buchstaben, keine Wörter. Pflicht: `art`, `ziel`; `erkennen`: `ablenker`; `zuordnen`: `ablenker`, `form` (`anfang`, `mitte`,
`ende`); `lesen`: `ablenker`, `vokal` (`fatha`, `kasra`, `damma`, `sukun`, `shadda`, `fathatan`, `kasratan`, `dammatan`, `med-fatha`, `med-kasra`, `med-damma`); `nachspuren`:
nichts weiter. Buchstaben: elif, be, te, se, cim, ha, hi, dal, zel, ra, ze, sin, shin, sad, dad, ti, zi, ayin, gayin, fe, kaf, kef, lam, mim, nun, vav, he, ye, hemze.
```json
{"schluessel": "ar.a1.e00-de.l02.a05", "typ": "schrift_ar", "art": "lesen", "ziel": "be", "ablenker": ["te", "se"], "vokal": "fatha"}
```
**`schrift_tr`, `schrift_latein`** · nur Vorkurs (`tr.a1.e00-*` bzw. `de.a1.e00-ar`) · Buchstabe, Wort oder Groß/Klein wählen. Pflicht: `anweisung` (`waehleBuchstabe`,
`waehleWort`, `grossKlein`), `optionen` (2–6, je ≤ 60), `richtig` (Index, sonst blockiert), dazu `vorgabe` oder `hoeren` (braucht Audio, sonst fällt die Aufgabe weg; also
`vorgabe`). Keine zweite passende Option.
```json
[{"schluessel": "tr.a1.e00-de.l01.a20", "typ": "schrift_tr", "anweisung": "waehleBuchstabe", "vorgabe": "_ay", "optionen": ["ç", "tsch", "c"], "richtig": 0},
 {"schluessel": "de.a1.e00-ar.l02.a30", "typ": "schrift_latein", "anweisung": "grossKlein", "vorgabe": "b", "optionen": ["B", "D", "P"], "richtig": 0}]
```

## 5 Mengen je Stufe und Einheit

| Stufe | Einh. | Lemmata Stufe (je Einheit laut Rahmen) | Sätze Stufe (≈ je Einheit) | Wörter je Satz höchstens | Rang-Schwelle de / tr, ar | Lesetexte (Stufe) | Sprechen / Schreiben je Einheit |
|---|---|---|---|---|---|---|---|
| A1 | 12 | 600 (36–56) | 2.400 (≈ 200) | 8 | 3.000 / 4.000 | 6 | 2 / 0 |
| A2 | 14 | 900 (58–70) | 3.600 (≈ 260) | 12 | 6.000 / 8.000 | 14 | 2 / 1 |
| B1 | 16 | 1.300 (74–86) | 5.200 (≈ 325) | 18 | 12.000 / 15.000 | 32 | 2 / 1 |
| B2 | 16 | 1.700 (98–112) | 6.800 (≈ 425) | 25 | 25.000 / 30.000 | 48 | 2 / 2 |
| C1 | 14 | 2.000 (115–152) | 8.000 (≈ 570) | 35 | 50.000 / 50.000 | 56 | 2 / 2 |

- **8 Stationen je Einheit** (Rahmen `stationen`): l01–l05 `lektion`, l06 `geschichte`, l07 `wiederholung`, l08 `pruefstein`; 2 Dialoge oder Geschichten je Einheit; Einzelheiten in
  den Feldern `geschichte`, `lesetext`, `sprechen`, `schreiben` des Rahmens.
- **Aufgaben je Lektion:** PLAN 12–15; Bestand A1: Lektion 15–16 (mit Tipp-Karten), Geschichte 4–12, Wiederholung 15–20, Prüfstein 15–16; Schema 1–40.
- **Lemmata:** genau der Plan-Ausschnitt (Budget der Einheit oder knapp darunter), keine zusätzlichen; die Stufe endet innerhalb ±5 % ihres Budgets. **Sätze:** etwa die Zahl oben;
  Sätze ohne Aufgabe sind als Vorrat erlaubt, brauchen aber Übersetzungen.
- **Übersetzung je Richtung:** ein Eintrag je Lemma und Satz, durchschnittlich 3 Alternativen je Satz; Tipps je Einheit nach Kontrastdokument §6 (A1 ≈ 6, A2 ≈ 5, B1 ≈ 4, B2 ≈ 3, C1
  ≈ 2; höchstens 20).

## 6 Prüfer

Aufruf in `web/` (Node 24, etwa 5 s): `pnpm -s lernapp:pruefen --json <scratchpad>/bericht-<einheit>.json`. Der Prüfer liest alle Dateien auf der Platte, auch unfertige anderer
Agenten; Ausgang 1 heißt nur, dass irgendwo etwas blockiert. Maßgeblich ist der Bericht, gefiltert auf die eigene Datei (§9). Schweregrade: **blockierend** (Tor verlangt 0);
**menschlich_klaeren** (blockiert nicht, der Eintrag bleibt `entwurf`, bis die Redaktion entscheidet; echte Treffer umformulieren oder ersetzen, bekannte Fehlalarme aus §8 nicht
verbiegen, sondern melden); **warnung** (Hinweis, meist erwartet).

| Prüfer | blockiert | menschlich_klaeren / Warnung |
|---|---|---|
| `schema` | JSON, Schema, Ablageort, Schlüssel doppelt, zweite Übersetzungsdatei je Richtung und Einheit | – |
| `dubletten` | Satz gleich (Wortfolge in Vergleichsform) irgendwo im Kurs; Lemma mit gleicher Form und gleicher `wortart`; nahe Dubletten bei mehr als 1 % der Sätze des Kurses | Warnung je Satzpaar mit Jaccard ≥ 0,9 der Wortmengen (auch nur umgestellt) |
| `abgleich` | Ablenker gleich Ziel oder Antwort; gleiche Übersetzung bei `auswahl`, `bild_wort`, `hoeren_waehlen`, `paare`; Alternativen doppelt; Wortbank-Ablenker in der Lösung; Wortbank oder Satzbau unter 2 Wörtern; Lücke ohne Wort; Harakat-Variante doppelt | – |
| `lizenz`, `ausschluss` | Regeln aus §3.3; eigene Texte nicht `CC-BY-SA-4.0` | Warnung: Wiktionary-Artikel nicht im Kernauszug |
| `wortschatz` | mehr als 5 % der Wörter einer Einheit über der Stufe | Warnung: Vorgriff auf Lemmata späterer Einheiten derselben Stufe |
| `satzlaenge`, `lemmabudget` | Satz über der Grenze (§5); Lemmata ohne `religionsbezug` über dem Budget der Einheit oder der Stufe | – |
| `abdeckung` | Einheit fehlt im Rahmen; vollständige Stufe außerhalb ±5 % | Warnung: Stationen anders als im Rahmen; Vorkurs ohne Rahmen-Eintrag |
| `vokalisierung` (ar) | Buchstabe ohne Zeichen in Lemma, Formen, Sätzen, eigenen Texten der Aufgaben | Warnung: Pausa (Satzende ohne Endvokal) |
| `kinder`, `symbole` | A1–B1: `kinderGeeignet` nicht `true` oder Lektion `false`; `symbol` unbekannt oder ohne Freigabe | – |
| `religion` | Formel-Lexikon ohne `religionsbezug: true`; Koran- oder Hadith-4-Gramm (auch über Satzgrenzen) | – |
| `religionsbezug` | Prüfstein verweist auf gekennzeichneten Eintrag | menschlich_klaeren: Kandidat R-/F- ohne Kennzeichen oder unter `ab_stufe`; Warnung `kaikki-religion` |
| `tabu` | – | menschlich_klaeren: `verboten`, `offene_frage`, `nur_sachlich` unter `ab_stufe` oder in kindgeeigneter Einheit; sonst Warnung |

**So rechnen die Prüfer:**
- **Wortschatz:** gezählt werden die Wörter aller Sätze (bzw. ihre `tokens`) ohne `religionsbezug`; nicht gezählt: Zahlen, Einzelzeichen, `[Platzhalter]` und Namen der de- und
  tr-Namenslisten des Leitfadens (ar-Namen in Umschrift und alle Namen in arabischer Schrift zählen mit). Bekannt ist ein Wort, das (selbst, als `formen`-Wert oder über
  Grundform-Kandidaten: de ohne Endung, tr Wortanfänge ab 3 Buchstaben, ar ohne Klitika und Suffixe) Lemma dieser oder einer früheren Einheit ist oder dessen Häufigkeitsrang unter
  der Schwelle der Stufe liegt (§5). Über der Stufe: Lemma einer höheren Stufe oder seltenes Wort ohne Lemma. Erlaubt sind höchstens max(1, abgerundet 5 % der gezählten Wörter);
  der Befund nennt die Sätze mit den meisten Treffern. Abhilfe: Wort ersetzen, Kompositum zerlegen, Namen und Ortsnamen sparsam.
- **Satzlänge:** Text an `.`, `!`, `?`, `…` und dem arabischen Fragezeichen mit folgendem Leerraum geteilt; Wörter wie bei der Wortbank.
- **Lemma-Budget und Abdeckung:** zählen nur `lemmata` ohne `religionsbezug`. Die Zeile „Abdeckung de.a2: Einheiten 3/14 …“ ist Bericht, solange die Stufe unvollständig ist; mit
  der letzten Einheit wird ±5 % blockierend.
- **Dubletten:** kursweit über alle Stufen, Dateien in Pfad-Reihenfolge; den Befund trägt die später gelesene Datei (Vorkurs `e00-…` vor `e01`). Steht er in deiner Datei: deinen
  Satz ändern oder den vorhandenen per Schlüssel verweisen.
- **Vokalisierung ar:** ohne Zeichen erlaubt sind nur Alif (auch mit Madda, Wasla), Alif maqṣūra, Wāw nach Damma, Yāʾ nach Kasra, das Lām des Artikels nach Alif zu Wortbeginn (auch
  nach wa-, fa-, bi-, ka-, li-) und der letzte Buchstabe (Lemma frei, Satz Warnung). Schadda braucht einen Vokal, außer auf dem letzten Buchstaben.
- **Tabu:** geprüft werden `thema`, Kann-Beschreibungen und Lektionsziele in jeder Sprache, Lemmata und Formen, Sätze, eigene Texte der Aufgaben, Übersetzungen mit Alternativen und
  Tipps (auch gegen die Zielsprache); dazu Wortformen, die im kaikki-Register ganz markiert sind. Der Prüfer wird verfeinert: maßgeblich ist der aktuelle Bericht.

**Erwartet während paralleler Arbeit** (fremd, nicht anfassen): Ausgang 1 durch Befunde anderer Dateien (z. B. `wortschatz` im Vorkurs `ar.a1.e00-de`, bis spätere Einheiten ihre
Lemmata bringen); `abdeckung` „Vorkurs ohne Rahmen-Eintrag“ und „Stufe unvollständig“; Vorgriff-Warnungen in Vorkurs-Dateien; bekannte Fehlalarme (§8) anderer Dateien;
`kaikki-religion` an Alltagswörtern; `symbole`-Warnungen in `symbole.json`. `abgleich` gegen Übersetzungen greift erst mit den Übersetzungsdateien: Der Entwurf wählt Ablenker schon
so, dass ihre Übersetzungen verschieden sein werden. Dublette mit einer gleichzeitig entstehenden Datei: wer sie in der eigenen Datei sieht, ändert seinen Satz.

## 7 Inhaltsleitfaden kurz (maßgeblich ist `leitfaden.json`)

- **Grundsätze:** Würde, Fehler ohne Spott; familientauglich; alltagsnah (Leben in Deutschland und im Alltag der Zielsprache, Herkunftsländer neutral); keine Herabsetzung von
  Nationen, Herkunft, Religionen, Geschlechtern, Alter, Behinderung, Aussehen; ohne Politik; keine Marken, Prominenten, echten Firmen, Schulen oder Praxen (Städte ja, Einrichtungen
  allgemein); keine Werbung, Spendenaufrufe, Links, echten Adressen oder Nummern (110 und 112 erlaubt; E-Mail nur mit example.org); ernste Themen ruhig, unter B1 nur leichte Fälle;
  höflich, keine Ironie unter B2, Umgangssprache erst ab B1 und gekennzeichnet.
- **Rollenbilder:** Frauen und Männer in allen Berufen; Väter kochen und erziehen; Mütter mit oder ohne Beruf, ohne Wertung; aktive Großeltern; Menschen mit Behinderung
  selbstverständlich; Begegnungen von Frauen und Männern sachlich.
- **Namen:** nur aus `web/inhalte/lernapp/rahmen/leitfaden.json` → `.namen.vornamen`, `.namen.familiennamen` (§9), genau so geschrieben (z. B. Laylā, Ḫālid); je Einheit die drei
  Sprachräume gemischt; Familiennamen erst ab A2 (förmliche Anrede). Nie religiös gebundene Namen (`.namen.ausgeschlossen_beispiele`) oder Namen realer Gemeindemitglieder.
- **Themen:** `thema` des Rahmen-Eintrags; Hinweise: `jq '.themen[] | select(.id=="wohnen")' <leitfaden.json>`. Essen: Fleischart immer nennen (Rind, Lamm, Hähnchen, Pute, Fisch);
  Getränke Wasser, Tee, Saft, Ayran, Milch; drei Küchen gleichwertig. Geburtstag nur als Datum und Glückwunsch; Spiele: Schach, Puzzle, Brettspiele.
- **Tabu-Kategorien** (Wortlisten nur in `leitfaden.json` → `tabu.kategorien[].formen`; nicht abschreiben, den Prüfer laufen lassen). „Nur sachlich“ heißt: nie als Normalität, in
  kindgeeigneten Einheiten nur für Vorbeugung, Sicherheit und Hilfe.

| Regel | Kategorie-IDs |
|---|---|
| `verboten` | `beziehungen`, `sexualitaet`, `aberglaube`, `kleidung_koerper`, `fluchen_schimpfwoerter`, `politik` (Thema `staatskunde` sachlich ab B1) |
| `nur_sachlich` (ab) | `alkohol_rauschmittel` (B1), `schwein` (A2, nur Etikett und Nachfrage), `gluecksspiel` (B2), `gewalt_waffen` (B1), `zinsgeschaefte` (B2) |
| `offene_frage` (Standard) | `musik_tanz` (kein Lernthema, passiv ab B2), `hund_im_haus` (nicht in der Wohnung; draußen sachlich ab A2) |

- **Kinder (A1–B1 immer):** nichts, was Angst macht; keine Geheimnisse vor den Eltern, keine Treffen mit Fremden, keine Kontakte zu Unbekannten im Netz; nichts gefährlich
  Nachahmbares; keine Bewertung von Körper oder Aussehen, keine Diäten; kein Konsumdruck; Erwachsene vorbildlich, Konflikte enden friedlich; keine Paarbeziehungen; Krankheit leicht
  und mit Trost, Tod und Trauer erst ab B1 ohne Einzelheiten; gemischte Klassen sachlich, enge Freundschaften unter Mädchen bzw. unter Jungen.
- **Bildkarten:** nur Gegenstände der Motivliste (`.bildkarten.motivliste_vorschlag`) mit Freigabe in `symbole.json`; keine Menschen, Körperteile, Tiere, Gesichter, religiösen
  Symbole oder Gebäude, Flaggen, Marken; Mond nur als Kreis. Wörter ohne zulässiges Motiv mit `auswahl`, `hoeren_waehlen`, `paare` üben.
- **Religionsbezug:** Religion ist kein Lernthema. Orte und Ereignisse R-01 … R-13 und Formeln F-ar-, F-tr-, F-de-NN (`.religionsbezug.orte_ereignisse`,
  `.religionsbezug.formeln.liste`) nur als Kandidat: `religionsbezug: true` beim Eintrag, nur die Sache als Ort oder Termin, erst ab `ab_stufe`, nur IDs aus
  `religionsbezugKandidaten` des Rahmen-Eintrags. Nie Lernziel: nicht im Prüfstein, nicht im Budget, keine Hör- oder Sprechaufgabe, Lektion ohne sie vollständig. Formeln sind
  gesperrt; die weltlichen Alternativen (`.religionsbezug.weltliche_alternativen`) tragen die Lernziele. Im Zweifel weglassen.
- **Religionswächter:** `node _gemeinde/werkzeuge/religion-pruefung.mjs` im Arbeitsbaum muss 0 ergeben.

## 8 Bekannte Fallen aus den Rückgaben (A1)

Stand 25.10.2026. Ein hier genannter Fehlalarm, der im aktuellen Bericht nicht mehr erscheint, ist erledigt. Behoben (Prüfer, 24.10.2026, nicht mehr umschreiben):
Teilwörter mitten in einem anderen Wort (Verb fürs Buchstabieren, tr Zahlwort 80), Klitika an bekannten arabischen Wörtern (weibliche Form von „groß“, baʿīd,
ǧinsiyya, al-fuṣḥā), amām gegen imām (Hamza), Register-Nebeneinträge (kız, hiç, Koffer, niemand, Mensch, putzen, französisch, Präteritum von „schreiben“). Ein
Register-Nebeneintrag meldet seit 25.10.2026 nur noch dann einen Hinweis („möglicher Treffer (mehrdeutig)“), wenn in einer Wiktionary-Ausgabe die Lesarten mit Register
überwiegen (Hauptbedeutung je Eintrag); so melden derbe und sexuelle Formen außerhalb des Leitfadens weiter, die Alltagswörter bleiben still.

**Bewusste Verluste der Prüfer-Änderung (24.10.2026; für die Redaktion, keine Folge eigener Texte)**
- ǧinsiyya: Ohne Vokalzeichen fällt das Wort für Staatsangehörigkeit mit der weiblichen Form des Adjektivs „sexuell“ zusammen (gleiche Schreibung). Feste Wendungen mit
  dieser Form melden `sexualitaet` nicht mehr (vorher `menschlich_klaeren`); das Adjektiv selbst (ǧinsī) meldet weiter. Vorschlag an die Redaktion: die typischen
  Wendungen (Nomen + weibliche Adjektivform, etwa zu Erziehung, Beziehung, Belästigung) als `phrase` in `sexualitaet` des Leitfadens aufnehmen.
- Religionsbezug: Ohne Artikel melden wa- und bi- vor ʿīd (auch mit -hu) R-06/R-08 nicht mehr, weil sie ohne Vokalzeichen mit waʿīd („Drohung“) und baʿīd („fern“)
  zusammenfallen; ebenso li-ḥaǧǧ (R-12, gleich geschrieben wie laḥḥaja). Allein, mit Artikel (al-, wa-l-, bi-l-, li-l-, ka-l-) und mit Suffixen melden sie weiter.
- Vorbestehende Lücken (alt wie neu, keine Folge der Änderung): Komposita, deren Grundwort eine `anfang`-Form von `sexualitaet` oder `gewalt_waffen` ist (Vorderteile
  wie Kinder-, Telefon- bzw. Atom-), melden nichts, weil diese Formen nur am Wortanfang greifen; bei Bedarf als `teil`-Form in den Leitfaden. Arabische Muster mit Tāʾ
  marbūṭa melden mit Pronomen-Suffix nicht (dort steht Tāʾ vor dem Suffix); ḫammāra meldet nicht.

**Alle Kurse**
- Kein `symbol`, kein `bild_wort`, solange kein Motiv freigegeben ist; `satzbau` und `frei` nicht in A1.
- Jeder Satz mit mindestens einem Lemma der eigenen Einheit; keine Ein-Wort-Sätze; dieselbe Wortmenge in anderer Reihenfolge (Frage und Aussage) ist eine nahe Dublette.
  Wiederverwendbare Sätze früherer Einheiten per Schlüssel verweisen.
- Rahmen-Geschichte mit Wörtern späterer Einheiten anpassen statt vorgreifen, Abweichung melden; Grammatik späterer Einheiten nur als feste Wendung und melden. Synonyme und Wörter
  gleicher Übersetzung nie gemeinsam in `auswahl`, `hoeren_waehlen` (`waehleBedeutung`) oder `paare`. Oberflächentexte laufen in allen drei Sprachen durch den Tabu-Prüfer.
- Vor dem Commit die eigene Datei formatieren (`pnpm exec prettier --write <datei>` in `web/`).

**de**
- Gleich geschriebene Lemmata brauchen verschiedene `wortart` (`sie`/`sie-hoeflich` mit `anredepronomen`, `sein`/`sein-poss`, `ihr`/`ihr-poss`), sonst Dublette. Sätze, die sich nur
  in der Großschreibung unterscheiden, sind exakte Dubletten.
- Ortsnamen (Wetzlar, Lahn), lange Komposita und ar-Namen in Umschrift (Laylā, Ranā, Yazan) zählen als Wörter über der Stufe; Deutschland, Türkei, Syrien liegen unter der Schwelle.
  Komposita zerlegen („Mein Hals tut weh.“).
- Zahlen über 12, die keine Zehner sind, als Ziffern; im Diktat Ziffer und Zahlwort als Alternativen. Vorkurs-Sätze nicht wiederholen: Einwortsätze, Nomen mit Artikel („die
  Schule“), „X wie …“, Ziffern.
- Bekannte Fehlalarme (melden, nichts kennzeichnen): `kaikki-religion` an `de.a1.e02.vater`.
- Für die Übersetzung nach tr: er/sie/es → „o“, ihr/Sie → „siz“, tschüss/auf Wiedersehen nie zusammen in einer Aufgabe mit Übersetzungsvergleich. Deutsche Tipps in `tr-aus-de`:
  keine deutschen Wörter in Zitatblöcken (dort gilt das tr-Lexikon, die Verschmelzung von an + dem trifft ein tr-Registerwort).

**tr**
- Plan-Lemmata unverändert übernehmen; je Einheit bleibt 1 Lemma Reserve. Vergangenheits- und Wunschformen in A1 nur als feste Wendungen der Plan-Hinweise (z. B. hoş geldin, memnun
  oldum, geçmiş olsun, afiyet olsun, kolay gelsin).
- Homographen (on/ön, su/şu, et/etmek, iç/içmek, yaz/yazmak, bin/binmek): der Prüfer ordnet dem frühesten Lemma zu.
- Türkiye, Almanya, İzmir, Ankara, İstanbul, Mısır, Suriye kosten nichts; Wetzlar, Lahn und ar-Namen (Rim) kosten. Sprachnamen mit Endung ohne Apostroph (Türkçeyi).
- „arkadaş“ nie mit vorangestelltem Geschlechtswort (Phrase in `beziehungen`); für Mitschüler „sınıf arkadaşı“. Akkusativ und Dativ von „hala“ meiden (Fehlalarm `musik_tanz`).
- Vokalharmonie üben: Wortbank- und Lücken-Ablenker als Harmonie-Varianten (mı statt mi, da statt de). Kein tr-Audio: Hörtypen werden übersprungen. Tatoeba bietet viele kurze
  passende Sätze (§3.3).
- Übersetzung nach tr: tr hat kein Genus (o, öğretmen, arkadaş); Geschlecht über Namen markieren, wo das Arabische es verlangt. siz/sen, o/onlar, Hoş geldin/Hoş geldiniz, Hoşça
  kal/Güle güle, Merhaba/İyi günler müssen sich in den Übersetzungen unterscheiden, wo sie in einer Aufgabe stehen.
- Arabische Oberflächentexte und Tipps in `tr-aus-ar`: das Wort für Hochsprache ohne Artikel (fuṣḥā) trifft R-08 (mit Artikel nicht), ein Wort für „vor“ (zeitlich) ist
  mehrdeutig; umschreiben (al-fuṣḥā bzw. al-ʿarabiyya al-miʿyāriyya, baʿda).

**ar**
- Plan-Lemmata ohne `plan` und ohne `symbol` übernehmen; Budgets sind genau ausgeschöpft, keine Zusatzlemmata. Verben als Māḍī 3. Sg. m.; `formen` mit Präsens (8 Personen),
  Subjunktiv nach an, Imperativ ab e10; `stamm_vor_suffix` für Tāʾ marbūṭa mit Suffix.
- In A1 nicht: kāna, die Verneinungen mit lam und mit der Zukunftspartikel, qad, ʾinna, ʾanna, allaḏī, ʾiḏā u. a.; illā nur in Uhrzeiten, munḏu nur in munḏu matā.
- Vorkurs: die 50 Sätze stehen in `ar.a1.e00-de` (`ar.a1.e00-tr` verweist darauf); seine fünf Lesesätze und Ein-Wort-Sätze nicht wiederholen.
- Namen in arabischer Schrift zählen als Wörter. Ohne Kosten (Rang ≤ 4.000): Laylā, Nādiya, Salmā, Lamā, Amal, Samīr, Ḫālid, Kamāl, Hišām, ʿĀdil, Fāris, Anas (Fādī, Rāmī, Sāmī:
  Manqūṣ-Endung beachten); Emre mit Sukun. Kosten: Elif, Jan, Yazan, Ranā, Nadā, Tālā, Dīma, Hāla. Meiden: Anna, Lena, Lea, Ben, Kaan, Paul (fallen ohne Zeichen mit häufigen
  Wörtern zusammen). Fremde Namen mit Sukun auf dem letzten Buchstaben (offene Frage LM-01).
- Fragepartikel a- verschmilzt mit dem Folgewort: Satz mit `tokens` und abgetrenntem a-.
- Dubletten ohne Harakat: anta/anti, -ka/-ki, Nisba m./f. fallen zusammen; Genus über Namen oder Kontext unterscheiden. man/min und kataba/kutub sind gleich (kein Minimalpaar).
  Optionen von `hoeren_waehlen` und `minimalpaare` ohne Zeichen verschieden; Hamza-Formen gelten als Alif.
- Synonyme nie gemeinsam als Ablenker oder in `paare`: muʿallim/mudarris/ustāḏ, ṭālib/tilmīḏ, sabbūra/lawḥa, maqʿad/ṣaff, hāḏā/ḏālika, hal/a-. Genuspaare (huwa/hiya, anta/anti,
  almānī/almāniyya) und marḥaban/ahlan haben in tr dieselbe Übersetzung.
- Lücken- und Wortbank-Ablenker auch ohne Übersetzungshilfe eindeutig falsch (Genus über hiya oder anti festlegen).
- Typen in A1: kein `frei`, `satzbau`, `hoeren_schreiben`, `harakat`; `luecke` nur mit Ablenkern. Tatoeba hat kaum voll vokalisierte A1-Sätze; übernommene Sätze vokalisieren und
  „bearbeitet (vokalisiert)“ vermerken.
- Bekannte Fehlalarme (melden): Mehrdeutigkeits-Warnungen bei einem Wort für „vor“ (zeitlich) und für „Rückkehr“; `kaikki-religion` an Alltagswörtern (sāʿa, kalima, sana,
  ʿumr, ṭaqs, tilmīḏ), nicht kennzeichnen. Arabische Tipps (`de-aus-ar`, `tr-aus-ar`): Hochsprache mit Artikel (al-fuṣḥā) oder als al-ʿarabiyya al-miʿyāriyya (fuṣḥā ohne
  Artikel trifft R-08).

## 9 Befehls-Schnipsel

```sh
export PATH=<node24>/bin:$HOME/.local/bin:$PATH        # Pfad laut Briefing
W=<arbeitsbaum>; E=de.a2.e03; K=${E%%.*}; S=$(echo "$E" | cut -d. -f2); D=sprache/$K/$S/$E.json
R=$W/web/inhalte/lernapp/rahmen; L=$R/leitfaden.json
# eigener Rahmen-Eintrag, Budget der Stufe, Grammatik-IDs der Einheit aufgelöst
jq --arg e "$E" '.stufen[].einheiten[] | select(.schluessel==$e)' $R/$K.rahmen.json
jq --arg s "$S" '.stufen[] | select(.stufe==$s) | {lemmaBudget, saetze, einheiten: [.einheiten[] | {schluessel, lemmaBudget}]}' $R/$K.rahmen.json
jq --arg e "$E" '([.stufen[].einheiten[] | select(.schluessel==$e) | .grammatik[]]) as $g | .grammatik[] | select(.id | IN($g[])) | {id, titel, kurz}' $R/$K.rahmen.json
# eigener Plan-Ausschnitt (Pfad laut Briefing), ohne Felder außerhalb des Schemas
jq --arg e "$E" '.einheiten[$e] | map(del(.plan, .symbol))' <plan.json>
# Lemmata und Sätze früherer Einheiten des Kurses; Muster eines Aufgabentyps
jq -r '.lemmata[] | "\(.schluessel)\t\(.lemma)\t\(.wortart // "")"' $W/web/inhalte/lernapp/sprache/$K/*/*.json
jq -r '.saetze[] | "\(.schluessel)\t\(.text)"' $W/web/inhalte/lernapp/sprache/$K/*/*.json
jq '.lektionen[].aufgaben[] | select(.typ=="geschichte")' $W/web/inhalte/lernapp/sprache/$K/a1/$K.a1.e02.json
# Namen, Themenhinweis, Religionsbezug-Kandidaten
jq '.namen.vornamen, .namen.familiennamen' $L; jq '.themen[] | select(.id=="wohnen")' $L
jq '.religionsbezug.orte_ereignisse[] | {id, ab_stufe}' $L
# Tatoeba: Satz und verlinkte Übersetzungen nachsehen
awk -F'\t' -v id=380701 '$1==id' $W/web/daten/tatoeba/saetze_deu.tsv
awk -F'\t' -v id=380701 '$1==id' $W/web/daten/tatoeba/paare_deu-tur.tsv
# Prüfer laufen lassen und auf die eigene Datei filtern (für Übersetzungen D=uebersetzung/<richtung>/$S/$E.json)
B=<scratchpad>/bericht-$E.json; (cd $W/web && pnpm -s lernapp:pruefen --json $B > /dev/null)
jq --arg d "$D" '[.befunde[] | select(.datei==$d)] | group_by(.schwere) | map({schwere: .[0].schwere, n: length})' $B
jq -r --arg d "$D" '.befunde[] | select(.datei==$d) | "\(.schwere) [\(.pruefer)] \(.ort // "-"): \(.text) \(.kategorie // "")"' $B
jq -r --arg e "$E" '.befunde[] | select(.datei | endswith("/" + $e + ".json")) | "\(.datei) \(.schwere) [\(.pruefer)] \(.ort // "-")"' $B
jq '.abdeckung[]' $B
# Schlussprüfung: fehlende Übersetzungen und Tipps je Richtung
U=$W/web/inhalte/lernapp/uebersetzung/de-aus-tr/$S/$E.json; Z=$W/web/inhalte/lernapp/$D
comm -23 <(jq -r '.lemmata[].schluessel, .saetze[].schluessel' $Z | sort) <(jq -r '.eintraege[].bezug' $U | sort)
comm -23 <(jq -r '.lektionen[].aufgaben[] | select(.typ=="grammatik_tipp") | .tipp' $Z | sort -u) <(jq -r '.tipps[].schluessel | split(".") | last' $U | sort)
# Religionswächter (Ausgang 0)
(cd $W && node _gemeinde/werkzeuge/religion-pruefung.mjs)
```

**Commit nur unter dem Schloss**, nur die eigenen Dateien, Attributionszeilen laut Briefing; keine anderen schreibenden git-Befehle (kein stash, checkout, reset, merge, rebase,
push). Lesen (`git status`, `git log`) ist frei.

```sh
(cd $W/web && pnpm exec prettier --write inhalte/lernapp/$D)
flock <scratchpad>/git-inhalte.lock -c "cd $W && git add web/inhalte/lernapp/$D && git commit -q -m 'Lern-App L3-07: Entwurf $E' -m '<Attribution 1>' -m '<Attribution 2>' -- web/inhalte/lernapp/$D"
```
