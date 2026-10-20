# Rahmenplan Deutsch (Zielsprache de, gelehrt aus Türkisch und Arabisch)

- **Stand:** 16.10.2026, Version 1.0.0-entwurf (L3-01, vorgezogen)
- **Status:** Entwurf. Er gilt als Standard, bis eine Prüfperson aus LM-01 ihn abnimmt (LM-02, ADR 0041 Nr. 12).
- **Maschinenlesbar:** `web/inhalte/lernapp/rahmen/de.rahmen.json`. Bei Abweichungen gilt die JSON-Datei; dieses Dokument erklärt sie.
- **Hinweis:** Die Stufen sind orientiert am GER (Europarat 2001/2020). Alle Kann-Beschreibungen sind eigene Formulierungen; Deskriptoren des GER werden weder übernommen noch übersetzt (LM-36, ADR 0045 Nr. 8).
- **Grundlagen:** PLAN §4, §5.1, §6.1–§6.4; KERN §2, §5, §7; Inhaltsleitfaden (`_lernapp/lehrplan/INHALTSLEITFADEN.md`, `leitfaden.json`); Beleg S7 (`_lernapp/belege/S7-sprachdaten.md`).
- **Richtungen:** `de-aus-tr` und `de-aus-ar` nutzen denselben Zielkorpus; Übersetzungen, Glossen und kontrastive Tipps entstehen je Richtung (PLAN §6.3).

> **KI-Regel 2 (ADR 0040, KERN §2):** Keine Koranverse, Hadithe, Bittgebete oder anderen religiösen Texte (weder arabisch
> noch übersetzt), keine Koran-Wortbedeutungen, keine Fiqh-Aussagen. Der Sprachkurs ist ohne Religionsbezug. Religiöse Formeln
> gibt es nur aus einer später von zwei Gelehrten freigegebenen Liste; im Rahmenplan stehen sie höchstens als markierte Kandidaten
> `religionsbezug`, nie als Lernziel. Arabische Wörter stehen hier nur in Umschrift.

## 1 Kurzfassung

- 72 Einheiten in fünf Stufen (A1 12, A2 14, B1 16, B2 16, C1 14) mit je acht Stationen: fünf Lektionen, eine Geschichte, eine Wiederholung, ein Prüfstein.
- 6.500 neue Lemmata, 26.000 Sätze, 144 Geschichten und Dialoge, 156 Lesetexte, 144 Sprech- und 90 Schreibaufgaben – genau die Mengen aus PLAN §5.1.
- 123 Grammatikpunkte (A1 27, A2 27, B1 27, B2 24, C1 18). Jeder wird in genau einer Einheit eingeführt und später mindestens einmal wiederholt.
- 99 Wortfelder; jede Einheit hat mindestens zwei, viele kehren auf höheren Stufen wieder.
- Vorkurs: sechs Lektionen Lateinschrift für Arabischsprachige und eine Hinweislektion für Türkischsprachige.
- Schauplatz ist Wetzlar. Drei Familien (Yılmaz, an-Naǧǧār, Becker) und ihre Nachbarn begleiten die Lernenden von A1 bis C1 und werden mit ihnen älter.
- Abdeckung: A1 enthält im Modell fast alle 500 häufigsten alltagstauglichen Lemmata (99,8 %, Zielwert ≥ 85 %); C1 erreicht die 5.000 häufigsten Lemmata (Zielwert ≥ 90 %).

## 2 Begründungen

### 2.1 Zielgruppe und Lebenswelt

Gelernt wird für das Leben in Deutschland: Schule, Arbeit, Behörden, Arzt, Wohnen. Die Gemeinde reicht von Kindern ab etwa zehn Jahren bis zu Älteren. Darum stehen Themen, die Eltern sofort brauchen (Arzt, Bürgeramt, Entschuldigung für die Schule, Elternabend), früh im Plan: A2 und B1.

A1 bis B1 sind vollständig kindgeeignet (Leitfaden §6). Kinder erleben in den Geschichten die Schule, Freundschaften unter Mädchen bzw. unter Jungen, gemischte Klassen und Gruppen, Ehrenamt und Technik.

Erwachsenenthemen (Arbeitsrecht, Verträge, Pflege, Gericht, Finanzen) folgen ab B2 sachlich und in ruhigem Ton.

### 2.2 Figuren, die mitwachsen

Alle Namen stammen aus der Namensliste des Leitfadens (§1.1); jede Einheit mischt die drei Sprachräume. Familiennamen erscheinen erst ab A2 (förmliche Anrede). Die Tabelle verbindet Vor- und Familiennamen nur für die Planung; im Kursinhalt stehen sie bei einer Figur nie zusammen (Leitfaden §1.1).

| Familie oder Rolle | Personen | Entwicklung im Kurs |
|---|---|---|
| Yılmaz | Elif (12), Emre (16), Derya (Krankenpflegerin), Murat (Koch in einer Kantine), Oma Sevim, Cousine Selin | Emre: Ausbildung (B1), erster Arbeitsvertrag (B2), Meisterprüfung (C1); Selin: Studium, Labor, Wissenschaft |
| an-Naǧǧār | Laylā (11, neu in Wetzlar), Yazan (14), Ranā (Ingenieurin), Ḫālid (Elektriker), Opa Kamāl, Tante Hind | Ranā: Anerkennung des Abschlusses (B2), Teamleitung (C1); Laylā: Studium (C1) |
| Becker | Jan (12), Anna (Busfahrerin), Thomas (Büro, kocht und betreut die Kinder) | Jan: Ehrenamt, Projektleitung |
| Nachbarschaft und Umfeld | Konrad Neumann (Nachbar, früher Elektriker, im Rollstuhl), Hakan Kaya (Hausmeister), Sabine Schneider (Klassenlehrerin), Laura Fischer (Hausärztin), Nisrīn aš-Šāmī (Apothekerin), Petra Hoffmann (Bürgeramt), Mia, Helene, Karin, Finn, Gül, Jana | wiederkehrende Ansprechpersonen |

Die Rollen folgen Leitfaden G-09: Väter kochen und betreuen, Mütter arbeiten als Ingenieurin, Busfahrerin oder Krankenpflegerin, Großeltern sind aktiv, ein Mensch mit Behinderung ist selbstverständlich Teil der Nachbarschaft.

Arabische Namen stehen im Rahmen in DIN-Umschrift. Wie sie im deutschen Zieltext geschrieben werden, ist offene Frage RF-03.

### 2.3 Themenfolge als Spirale

Die Themen stammen aus der Liste erlaubter Themen (Leitfaden §3) und kehren mit wachsender Tiefe wieder. Jede Einheit liegt in einer Stufe, für die der Leitfaden ihr Thema vorsieht.

| Thema (Leitfaden) | A1 | A2 | B1 | B2 | C1 |
|---|---|---|---|---|---|
| Begrüßung und Vorstellung | e01 | – | – | – | – |
| Familie und Verwandte | e02 | – | e01 | – | – |
| Zahlen, Uhrzeit, Datum | e04 | – | – | – | – |
| Wohnen | e03 | e04 | e04 | e03 | – |
| Einkaufen und Preise | e06 | – | – | – | – |
| Essen und Trinken (halal-neutral) | e05 | – | e11 | – | – |
| Kleidung | e10 | e06 | – | – | – |
| Körper und Gesundheit | e11 | e05 | e03 | e06 | – |
| Schule und Lernen | e07 | – | e07 | – | – |
| Arbeit und Berufe | e12 | e13 | e10 | e02, e15 | e02, e12, e14 |
| Verkehr und Unterwegssein | – | e02 | e09 | – | – |
| Behörden und Formulare | – | e09 | e13 | e08 | e07 |
| Bank und Post | – | – | e12 | e10 | – |
| Stadt und Orientierung | e09 | – | – | – | – |
| Natur und Umwelt | – | e12 | e15 | e07 | e06 |
| Sport | – | e08 | – | – | – |
| Hobbys und Freizeit (ohne Musik) | e08 | e01 | – | – | – |
| Medien und Digitales (sachlich) | – | e10 | e05 | e05 | e05 |
| Reisen und Besuch | – | e11 | e08 | – | – |
| Nachbarschaft | – | e07 | – | – | – |
| Ehrenamt | – | – | e06 | e12 | e10 |
| Familienfeste | – | e03 | – | – | – |
| Gefühle und Freundschaft | – | e14 | – | – | – |
| Ausbildung und Bewerbung | – | – | e02 | e01 | – |
| Verträge und Rechte | – | – | – | e04, e16 | e04 |
| Zusammenleben | – | – | – | e11 | e01, e11 |
| Wissenschaft und Technik | – | – | e14 | e09 | e03, e13 |
| Geschichte und Kultur | – | – | – | e13 | e08 |
| Staat und Gemeinde (sachlich) | – | – | e16 | e14 | e09 |

Ohne eigene Einheit, aber als Wortfeld vertreten: Wetter und Jahreszeiten und Tiere (Wortfelder `wetter` in A1-e10, `tiere` in A2-e12).

Themen mit nur einer eigenen Einheit kehren als Wortfeld wieder, z. B. Nachbarschaft (B1-e04), Gefühle und Freundschaft (B1-e07), Einkaufen (B2-e16).

### 2.4 Grammatikfolge

Die Folge aus PLAN §6.2 ist verbindlich und hier verfeinert: A1 Artikel und Genus, Präsens, V2, Akkusativ, Modalverben, trennbare Verben → A2 Perfekt, Dativ, Präpositionen, weil/dass → B1 Präteritum, Relativsätze, Passiv, Konjunktiv II → B2 Konjunktiv I, Nominalstil, Partizipialattribute → C1 Register, Verbalisierung, Textzusammenhang, Hervorhebung.

Gründe für die Feinordnung:
- **Präsens ab der ersten Einheit:** Ohne Verben kann man sich nicht vorstellen; deshalb beginnen „sein“ und das regelmäßige Präsens in A1-e01. Die übrigen Punkte folgen der Reihenfolge aus PLAN §6.2.
- **Artikel und Genus zuerst (A1-e02):** Das Türkische kennt kein Genus und keinen bestimmten Artikel (bir zeigt nur Unbestimmtheit, ohne Genus); das Arabische hat zwei Genera und einen unveränderlichen Artikel. Nomen werden deshalb von Anfang an mit Artikel gelernt.
- **„sein“ in der ersten Einheit:** Im arabischen Nominalsatz fehlt im Präsens eine Kopula, im Türkischen steht sie als Endung. Sätze wie „Ich bin Elif“ werden darum zuerst geübt.
- **Verb an Position 2 früh (A1-e04):** Das Türkische stellt das Verb ans Ende, das Arabische oft an den Anfang. Die Satzklammer wird über Modalverben (A1-e07) eingeführt, bevor trennbare Verben (A1-e12) sie fordern.
- **Akkusativ vor Dativ:** Der Dativ kommt in A1 nur als feste Wendung vor (Mir geht es gut) und wird in A2 über Präpositionen (mit dem Bus) eingeführt, dann als Objekt.
- **Perfekt vor Präteritum:** Im Gespräch erzählt man im Perfekt (A2). Nur „war“, „hatte“ und die Modalverben kommen schon in A2 ins Präteritum, das volle Präteritum folgt beim Erzählen in B1.
- **Konjunktiv II in zwei Schritten:** Höfliche Bitten (Könnten Sie …?) sind ab A2 feste Wendungen für Amt und Arzt; das System folgt in B1.
- **Nebensätze mit Verbendstellung ab A2:** weil, dass, wenn sind für das Begründen im Alltag nötig. Die Endstellung ist Türkischsprachigen vertraut, Arabischsprachigen nicht.
- **B2 und C1 für Text und Beruf:** Nominalstil, Passiversatz und Funktionsverbgefüge brauchen Lernende für Verträge, Behörden und Bewerbung; C1 übt den bewussten Wechsel der Register und das Auflösen dichter Texte.

**Abgleich mit PLAN §6.2** (verbindliche Punkte und die IDs, die sie umsetzen):

| Stufe | Punkt aus PLAN §6.2 | Grammatik-IDs (eingeführt in) |
|---|---|---|
| A1 | Artikel und Genus | artikel-genus (a1-e02), unbest-artikel-negation (a1-e03) |
| A1 | Präsens | praesens-regel (a1-e01), praesens-vokalwechsel (a1-e05) |
| A1 | V2 | v2-inversion (a1-e04) |
| A1 | Akkusativ | akkusativ (a1-e05), akk-pronomen (a1-e10) |
| A1 | Modalverben | modalverben-1 (a1-e07), modalverben-2 (a1-e11) |
| A1 | trennbare Verben | trennbare-verben (a1-e12) |
| A2 | Perfekt | perfekt-haben (a2-e01), perfekt-sein (a2-e02) |
| A2 | Dativ | dativ-praep (a2-e02), dativ-objekt (a2-e03), dativ-pronomen (a2-e03) |
| A2 | Präpositionen | wechselpraep (a2-e04), praep-akk (a2-e08), temporale-praep (a2-e11) |
| A2 | weil/dass | nebensatz-weil (a2-e05), nebensatz-dass (a2-e07) |
| B1 | Präteritum | praeteritum (b1-e01) |
| B1 | Relativsätze | relativsatz-nom-akk (b1-e05), relativsatz-dat-praep (b1-e06) |
| B1 | Passiv | passiv-praesens (b1-e04), passiv-praet-modal (b1-e11) |
| B1 | Konjunktiv II | konjunktiv-2 (b1-e03), konj2-irreal (b1-e15) |
| B2 | Konjunktiv I | konjunktiv-1 (b2-e05) |
| B2 | Nominalstil | nominalstil (b2-e01) |
| B2 | Partizipialattribute | partizipialattribut (b2-e09) |

Konvention im JSON: Eine Grammatik-ID ist in der Einheit eingeführt, in der sie zum ersten Mal steht; die neuen IDs stehen in der Liste vorn. Spätere Nennungen sind Wiederholungen. Die letzte C1-Einheit führt nichts Neues ein, sie wiederholt.

### 2.5 Wortschatz und Lemma-Budgets

Die Summen je Stufe entsprechen PLAN §5.1. Einheiten mit vielen konkreten Dingen (Essen, Wohnen, Markt) bekommen mehr Lemmata; die Einstiegseinheit (40) und die Abschlusseinheit C1-e14 (115) weniger.

Ländernamen, Zahlwörter und feste Wendungen zählen ins Budget, Personennamen und Kandidaten mit Religionsbezug nicht (RF-06).

### 2.6 Eigene Formulierungen, keine fremden Lehrwerke

Titel, Themenzuschnitt, Geschichten und Kann-Beschreibungen sind eigens für diesen Kurs geschrieben. Die Kann-Beschreibungen sind an konkrete Situationen der Einheiten gebunden (Wetzlar, Bürgeramt, Klassenrat) und folgen nicht dem Wortlaut der GER-Deskriptoren.

Die Grammatikfolge entspricht der verbreiteten Progression des Deutschen als Fremdsprache und folgt keinem bestimmten Lehrwerk.

## 3 Ziele je Stufe

### A1 – 600 neue Lemmata, 2.400 Sätze, 12 Einheiten

- Ich kann mich in der Klasse, im Treppenhaus oder beim Sport mit Namen, Herkunft, Wohnort und Sprachen vorstellen und andere danach fragen.
- Ich kann meine Familie auf einem Foto zeigen und sagen, wer die Personen sind und wie alt sie sind.
- Ich kann auf dem Markt oder in der Kantine sagen, was ich möchte, nach dem Preis fragen und bezahlen.
- Ich kann Uhrzeiten, Wochentage und Termine in einem Wochenplan lesen und selbst nennen.
- Ich kann in kurzen Hördialogen Namen, Zahlen, Uhrzeiten und Preise heraushören.
- Ich kann Schilder, Einkaufszettel, Steckbriefe und Wetterberichte lesen und die Angabe finden, die ich brauche.
- Ich kann nach dem Weg zur Bibliothek, zum Bahnhof oder zur Apotheke fragen und eine kurze Antwort mit links, rechts und geradeaus verstehen.
- Ich kann beim Arzt oder zu Hause sagen, was mir wehtut und wie es mir geht.

### A2 – 900 neue Lemmata, 3.600 Sätze, 14 Einheiten

- Ich kann erzählen, was ich am Wochenende, in den Ferien oder bei einem Familienfest gemacht habe.
- Ich kann beim Arzt, im Kaufhaus und beim Bürgeramt mein Anliegen sagen und mit Rückfragen klären, was ich tun muss.
- Ich kann mit weil, dass und wenn sagen, warum ich etwas tue und was ich denke.
- Ich kann Aushänge im Treppenhaus, Einladungen, Fahrpläne und einfache Formulare verstehen und ausfüllen.
- Ich kann kurze Nachrichten, Einladungen, Dankeskarten und Entschuldigungen für die Schule schreiben.
- Ich kann beim Umzug sagen, wohin Möbel kommen, und Kleidung, Sportarten oder Wohnungen miteinander vergleichen.
- Ich kann am Telefon einen Termin in der Praxis oder beim Amt vereinbaren, verschieben oder absagen.
- Ich kann sagen, wie ich mich fühle, jemanden trösten und mich nach einem Streit entschuldigen.

### B1 – 1.300 neue Lemmata, 5.200 Sätze, 16 Einheiten

- Ich kann von meiner Kindheit, der Geschichte meiner Familie oder einer Reise so erzählen, dass andere der Reihenfolge gut folgen können.
- Ich kann beim Elternabend, bei der Bank, bei der Hausverwaltung und bei Behörden meine Anliegen vortragen und Lösungen besprechen.
- Ich kann Merkblätter, Elternbriefe, Rezepte und Zeitungsmeldungen lesen und anderen sagen, worum es geht.
- Ich kann Ratschläge geben, Vorschläge machen und sagen, was ich anders machen würde.
- Ich kann E-Mails an Lehrkräfte, Ämter oder Betriebe schreiben, in denen ich etwas erkläre, frage oder mich beschwere.
- Ich kann über Ausbildung, Arbeit im Team und ehrenamtliches Engagement sprechen und meine Wünsche begründen.
- Ich kann nachfragen, wenn ich etwas nicht sicher verstanden habe, und ein Missverständnis freundlich klären.
- Ich kann sachlich erklären, wie eine Gemeinde Entscheidungen trifft, wie eine Wahl abläuft und welche Grundrechte gelten.

### B2 – 1.700 neue Lemmata, 6.800 Sätze, 16 Einheiten

- Ich kann eine Bewerbung schreiben und im Vorstellungsgespräch meine Erfahrungen und Ziele überzeugend darstellen.
- Ich kann Arbeits-, Miet- und Handyverträge auf Fristen, Kosten und Kündigungsregeln prüfen und gezielt nachfragen.
- Ich kann Meldungen aus verschiedenen Quellen vergleichen und erkennen, was belegt ist und was nur behauptet wird.
- Ich kann in einer Hausversammlung, einer Teambesprechung oder einer Videokonferenz Vorschläge einbringen, auf Einwände eingehen und eine Einigung festhalten.
- Ich kann mit eigenen Worten berichten, was jemand gesagt hat, ohne es mir zu eigen zu machen.
- Ich kann Reklamationen, Widersprüche gegen Rechnungen, Protokolle und Leserbriefe schreiben.
- Ich kann Vermutungen darüber äußern, wie etwas früher war, und genau sagen, unter welchen Bedingungen etwas gilt.
- Ich kann ein Kurzreferat über eine Erfindung, ein Projekt oder ein Stück Stadtgeschichte halten und Fragen dazu beantworten.

### C1 – 2.000 neue Lemmata, 8.000 Sätze, 14 Einheiten

- Ich kann in einer Podiumsdiskussion, einer Verhandlung oder einer Schulkonferenz meine Position vertreten und dabei auf das eingehen, was andere gesagt haben.
- Ich kann wissenschaftliche Kurzbeiträge, Geschäftsbedingungen, Bescheide und literarische Texte so lesen, dass ich auch Haltungen und Absichten der Verfasserinnen und Verfasser erkenne.
- Ich kann denselben Inhalt für eine Behörde, für Kolleginnen und für Freunde jeweils passend formulieren.
- Ich kann Essays, Erörterungen, Stellungnahmen und Abschlussberichte schreiben, deren Gedankengang Leserinnen und Leser ohne Mühe nachvollziehen.
- Ich kann eine Besprechung oder ein Projekt leiten, zwischen Standpunkten vermitteln und Ergebnisse knapp protokollieren.
- Ich kann Amtssprache und Fachtexte für Menschen in meinem Umfeld in verständliche Sprache übertragen.
- Ich kann Sprichwörter, Redewendungen und Abtönungen verstehen und sie selbst passend einsetzen.
- Ich kann ein Projekt oder ein Konzept vor Publikum vorstellen, das Wichtigste an den Anfang stellen und auf kritische Rückfragen gelassen antworten.

## 4 Einheiten

Spalten: Grammatik neu bzw. wiederholt als Kurz-ID ohne das Präfix `de.g.`, Wortfelder ohne `de.w.`. „Kind“ = `kinderGeeignet`. Einzelheiten zu jeder Einheit (Kann-Beschreibungen, Geschichte, Aufgaben) stehen im Anhang.

### 4.1 A1

| Schlüssel | Titel | Thema | Grammatik neu | Wiederholung | Wortfelder | Budget | Kind |
|---|---|---|---|---|---|---|---|
| de.a1.e01 | Hallo, wer bist du? | Begrüßung und Vorstellung | sein-pronomen, praesens-regel, fragen | – | begruessung, herkunft, angaben-person | 40 | ja |
| de.a1.e02 | Das ist meine Familie | Familie und Verwandte | artikel-genus, possessiv-nom, haben | sein-pronomen, fragen | familie, zahlen | 55 | ja |
| de.a1.e03 | Bei uns zu Hause | Wohnen | unbest-artikel-negation, plural, adjektiv-praedikativ | artikel-genus, haben | wohnung, moebel, eigenschaften | 55 | ja |
| de.a1.e04 | Wie spät ist es? | Zahlen, Uhrzeit, Datum | zeitangaben, v2-inversion | praesens-regel, fragen | uhrzeit, kalender | 50 | ja |
| de.a1.e05 | Guten Appetit! | Essen und Trinken (halal-neutral) | akkusativ, vorlieben, praesens-vokalwechsel | unbest-artikel-negation, plural | lebensmittel, getraenke, mahlzeiten | 55 | ja |
| de.a1.e06 | Auf dem Wochenmarkt | Einkaufen und Preise | negation-nicht, mengen | akkusativ, vorlieben, possessiv-nom | obst-gemuese, einkaufen, mengen | 50 | ja |
| de.a1.e07 | In der Schule | Schule und Lernen | modalverben-1, imperativ | zeitangaben, v2-inversion, praesens-vokalwechsel | schule, schulfaecher, unterricht | 50 | ja |
| de.a1.e08 | Was machst du gern? | Hobbys und Freizeit (ohne Musik) | konnektoren-hauptsatz | vorlieben, modalverben-1, akkusativ, negation-nicht | freizeit, sport | 50 | ja |
| de.a1.e09 | Wo ist die Bibliothek? | Stadt und Orientierung | ort-richtung, man | imperativ, modalverben-1, fragen | stadt, weg, verkehrsmittel | 50 | ja |
| de.a1.e10 | Was ziehe ich heute an? | Kleidung | es-unpersoenlich, akk-pronomen | akkusativ, adjektiv-praedikativ, negation-nicht | kleidung, farben, wetter | 50 | ja |
| de.a1.e11 | Ich bin krank | Körper und Gesundheit | modalverben-2, dativ-wendungen | imperativ, haben, possessiv-nom, man | koerper, arzt | 50 | ja |
| de.a1.e12 | Berufe und mein Wochenplan | Arbeit und Berufe | trennbare-verben, wortbildung-in | zeitangaben, v2-inversion, modalverben-1, konnektoren-hauptsatz | berufe, tagesablauf, arbeitsorte | 45 | ja |
| **Σ** | | | 27 neu | | | **600** | |

### 4.2 A2

| Schlüssel | Titel | Thema | Grammatik neu | Wiederholung | Wortfelder | Budget | Kind |
|---|---|---|---|---|---|---|---|
| de.a2.e01 | Wie war dein Wochenende? | Hobbys und Freizeit (ohne Musik) | perfekt-haben, praeteritum-sein-haben | zeitangaben, trennbare-verben, vorlieben | vergangenheit, freizeit | 60 | ja |
| de.a2.e02 | Mit Bus und Bahn | Verkehr und Unterwegssein | perfekt-sein, dativ-praep | perfekt-haben, ort-richtung, trennbare-verben | bahnreise, verkehrsmittel | 65 | ja |
| de.a2.e03 | Ein Geschenk für Oma | Familienfeste | dativ-objekt, dativ-pronomen | akkusativ, possessiv-nom, perfekt-haben, mengen | feste, familie | 60 | ja |
| de.a2.e04 | Wir ziehen um | Wohnen | wechselpraep, positionsverben | dativ-praep, imperativ, akkusativ | umzug, moebel, haushalt | 65 | ja |
| de.a2.e05 | Beim Arzt | Körper und Gesundheit | nebensatz-weil, reflexive-verben | modalverben-2, dativ-wendungen, dativ-pronomen, perfekt-sein | praxis, arzt, koerper | 65 | ja |
| de.a2.e06 | Im Kaufhaus | Kleidung | adj-dekl-best, welch-dies | akk-pronomen, dativ-pronomen, nebensatz-weil | einkauf-kleidung, kleidung, farben | 60 | ja |
| de.a2.e07 | Neu in der Nachbarschaft | Nachbarschaft | nebensatz-dass, indefinitpronomen | wechselpraep, dativ-objekt, es-unpersoenlich, man | nachbarschaft, haushalt | 65 | ja |
| de.a2.e08 | Sport im Verein | Sport | komparation, praep-akk | reflexive-verben, nebensatz-weil, perfekt-sein | verein, sport | 65 | ja |
| de.a2.e09 | Beim Bürgeramt | Behörden und Formulare | nebensatz-wenn, datum-ordinal | modalverben-1, modalverben-2, dativ-praep, fragen | formulare, amt, angaben-person | 70 | ja |
| de.a2.e10 | Handy, Nachrichten, Sicherheit | Medien und Digitales (sachlich) | hoeflich-konj, textfolge | nebensatz-dass, nebensatz-wenn, trennbare-verben, imperativ | digital, anleitung | 65 | ja |
| de.a2.e11 | Ferien bei Verwandten | Reisen und Besuch | temporale-praep, praeteritum-modal | perfekt-sein, datum-ordinal, nebensatz-weil, praeteritum-sein-haben | reise, kalender | 65 | ja |
| de.a2.e12 | Natur vor der Haustür | Natur und Umwelt | wortbildung-komposita, genitiv-s | wechselpraep, komparation, textfolge, positionsverben | natur, tiere, muell | 60 | ja |
| de.a2.e13 | Was willst du werden? | Arbeit und Berufe | werden-vollverb, adj-dekl-unbest | wortbildung-in, nebensatz-dass, adj-dekl-best, modalverben-1, welch-dies | arbeitswelt, berufe | 65 | ja |
| de.a2.e14 | Freunde und Gefühle | Gefühle und Freundschaft | konnektoren-adverb | nebensatz-weil, reflexive-verben, hoeflich-konj, perfekt-haben, indefinitpronomen | gefuehle, freundschaft | 70 | ja |
| **Σ** | | | 27 neu | | | **900** | |

### 4.3 B1

| Schlüssel | Titel | Thema | Grammatik neu | Wiederholung | Wortfelder | Budget | Kind |
|---|---|---|---|---|---|---|---|
| de.b1.e01 | Als Oma jung war | Familie und Verwandte | praeteritum, nebensatz-temporal | perfekt-haben, perfekt-sein, praeteritum-sein-haben, konnektoren-adverb | erinnerungen, familie, vergangenheit | 85 | ja |
| de.b1.e02 | Wege in den Beruf | Ausbildung und Bewerbung | infinitiv-zu, verben-praep | nebensatz-dass, werden-vollverb, nebensatz-weil, modalverben-1 | ausbildung, arbeitswelt | 80 | ja |
| de.b1.e03 | Gesund durch den Alltag | Körper und Gesundheit | konjunktiv-2, reflexiv-dativ | modalverben-2, nebensatz-wenn, reflexive-verben, komparation | gesundheit-vorbeugung, koerper | 80 | ja |
| de.b1.e04 | Wenn etwas kaputt ist | Wohnen | passiv-praesens, lassen | wechselpraep, positionsverben, hoeflich-konj, nebensatz-dass | reparatur, haushalt | 80 | ja |
| de.b1.e05 | Sicher im Netz | Medien und Digitales (sachlich) | relativsatz-nom-akk, indirekte-frage | textfolge, hoeflich-konj, nebensatz-wenn, imperativ | internet-sicherheit, digital | 80 | ja |
| de.b1.e06 | Mitmachen im Verein | Ehrenamt | relativsatz-dat-praep, um-zu-damit | relativsatz-nom-akk, infinitiv-zu, verben-praep, praep-akk | ehrenamt, verein | 80 | ja |
| de.b1.e07 | Elternabend und Zeugnis | Schule und Lernen | futur-1, konzessiv | nebensatz-temporal, konjunktiv-2, indirekte-frage, nebensatz-dass | schule-eltern, gefuehle, freundschaft | 85 | ja |
| de.b1.e08 | Besuch in der Ferne | Reisen und Besuch | plusquamperfekt, modalpartikeln | praeteritum, nebensatz-temporal, temporale-praep, praeteritum-modal | reise-planung, reise | 80 | ja |
| de.b1.e09 | Führerschein und Verkehr | Verkehr und Unterwegssein | genitiv, konsekutiv | genitiv-s, modalverben-2, passiv-praesens, temporale-praep | fuehrerschein, verkehrsmittel | 80 | ja |
| de.b1.e10 | Arbeiten im Team | Arbeit und Berufe | n-deklination, adj-dekl-ohne | adj-dekl-best, adj-dekl-unbest, verben-praep, relativsatz-dat-praep, modalpartikeln | team, arbeitswelt | 80 | ja |
| de.b1.e11 | Kochen für Gäste | Essen und Trinken (halal-neutral) | passiv-praet-modal, partizip-adjektiv | passiv-praesens, textfolge, mengen, adj-dekl-ohne, reflexiv-dativ | kochen, lebensmittel, mengen | 80 | ja |
| de.b1.e12 | Konto, Brief und Paket | Bank und Post | wortbildung-nomen | passiv-praesens, infinitiv-zu, hoeflich-konj, genitiv, lassen | bank, post | 80 | ja |
| de.b1.e13 | Anträge und Fristen | Behörden und Formulare | zustandspassiv | passiv-praet-modal, wortbildung-nomen, genitiv, indirekte-frage | antraege, formulare | 85 | ja |
| de.b1.e14 | Erfindungen im Alltag | Wissenschaft und Technik | wortbildung-adjektiv | passiv-praet-modal, relativsatz-nom-akk, praeteritum, komparation, partizip-adjektiv | erfindungen, digital | 80 | ja |
| de.b1.e15 | Klima und Energie im Alltag | Natur und Umwelt | konj2-irreal | konjunktiv-2, wortbildung-komposita, um-zu-damit, konsekutiv | klima-energie, muell, natur | 80 | ja |
| de.b1.e16 | Gemeinde und Grundrechte | Staat und Gemeinde (sachlich) | zweiteilige-konnektoren | zustandspassiv, relativsatz-dat-praep, konzessiv, genitiv, futur-1 | gemeinde, amt | 85 | ja |
| **Σ** | | | 27 neu | | | **1300** | |

### 4.4 B2

| Schlüssel | Titel | Thema | Grammatik neu | Wiederholung | Wortfelder | Budget | Kind |
|---|---|---|---|---|---|---|---|
| de.b2.e01 | Bewerben mit Profil | Ausbildung und Bewerbung | nominalstil | infinitiv-zu, konjunktiv-2, wortbildung-nomen, relativsatz-nom-akk | bewerbung, ausbildung | 105 | ja |
| de.b2.e02 | Rechte und Pflichten im Job | Arbeit und Berufe | konditional-falls | nominalstil, n-deklination, passiv-praet-modal, verben-praep | arbeitsrecht, arbeitswelt | 105 | nein |
| de.b2.e03 | Wohnformen im Wandel | Wohnen | temporal-b2 | relativsatz-dat-praep, konj2-irreal, zweiteilige-konnektoren, passiv-praesens | wohnformen, wohnung | 105 | ja |
| de.b2.e04 | Verträge lesen und verstehen | Verträge und Rechte | passiversatz, praep-genitiv | konditional-falls, nominalstil, zustandspassiv, genitiv | vertraege, antraege | 110 | nein |
| de.b2.e05 | Nachrichten prüfen | Medien und Digitales (sachlich) | konjunktiv-1, textverweise | indirekte-frage, relativsatz-nom-akk, passiv-praet-modal, nominalstil | nachrichten, internet-sicherheit | 105 | ja |
| de.b2.e06 | Wenn Angehörige Pflege brauchen | Körper und Gesundheit | konj2-vergangenheit, adjektiv-nominalisiert | konjunktiv-2, passiversatz, nebensatz-temporal, temporal-b2 | pflege, arzt | 110 | nein |
| de.b2.e07 | Energie und Klima vor Ort | Natur und Umwelt | modalsatz-indem, je-desto | konj2-irreal, zweiteilige-konnektoren, konsekutiv, textverweise | klimaschutz, klima-energie | 105 | ja |
| de.b2.e08 | Anerkennung und Weiterbildung | Behörden und Formulare | funktionsverbgefuege | nominalstil, praep-genitiv, passiversatz, konjunktiv-1 | anerkennung, antraege | 110 | nein |
| de.b2.e09 | Forschung, die den Alltag verändert | Wissenschaft und Technik | partizipialattribut, wortbildung-verben | passiv-praet-modal, partizip-adjektiv, wortbildung-adjektiv, relativsatz-dat-praep | forschung, erfindungen | 105 | ja |
| de.b2.e10 | Haushaltsgeld planen | Bank und Post | konzessiv-b2 | konditional-falls, praep-genitiv, je-desto, adjektiv-nominalisiert | finanzen, bank | 105 | nein |
| de.b2.e11 | Mehrsprachig aufwachsen | Zusammenleben | irrealer-vergleich | konjunktiv-1, konzessiv, konj2-vergangenheit, textverweise | mehrsprachigkeit, herkunft | 105 | nein |
| de.b2.e12 | Ehrenamt mit Verantwortung | Ehrenamt | futur-2, relativ-wer-was | um-zu-damit, funktionsverbgefuege, modalsatz-indem, futur-1 | engagement, ehrenamt | 105 | ja |
| de.b2.e13 | Spuren der Stadtgeschichte | Geschichte und Kultur | passiv-perfekt, modal-vermutung | plusquamperfekt, partizipialattribut, genitiv, praeteritum | stadtgeschichte, stadt | 105 | nein |
| de.b2.e14 | Rechtsstaat und Gericht | Staat und Gemeinde (sachlich) | genitiv-relativ | konjunktiv-1, passiv-perfekt, nominalstil, wortbildung-verben, irrealer-vergleich | rechtsstaat, gemeinde | 110 | nein |
| de.b2.e15 | Arbeiten in der digitalen Welt | Arbeit und Berufe | statt-ohne | modalsatz-indem, konzessiv-b2, passiversatz, futur-2, relativ-wer-was | digitale-arbeit, team | 105 | ja |
| de.b2.e16 | Reklamieren und Verbraucherrechte | Verträge und Rechte | adversativ, weiterfuehrender-nebensatz | passiversatz, konditional-falls, konjunktiv-1, praep-genitiv, modal-vermutung, genitiv-relativ | verbraucherrechte, einkaufen | 105 | nein |
| **Σ** | | | 24 neu | | | **1700** | |

### 4.5 C1

| Schlüssel | Titel | Thema | Grammatik neu | Wiederholung | Wortfelder | Budget | Kind |
|---|---|---|---|---|---|---|---|
| de.c1.e01 | Sprachen, Herkunft, Zugehörigkeit | Zusammenleben | register | irrealer-vergleich, konjunktiv-1, nominalstil, adversativ | identitaet, mehrsprachigkeit | 145 | nein |
| de.c1.e02 | Führen und verhandeln | Arbeit und Berufe | modalpartikeln-c1, konj2-diplomatie | register, konditional-falls, modalpartikeln, funktionsverbgefuege | verhandlung, arbeitsrecht | 145 | nein |
| de.c1.e03 | Wissenschaft verständlich machen | Wissenschaft und Technik | redewiedergabe-text | konjunktiv-1, partizipialattribut, nominalstil, textverweise | wissenschaftssprache, forschung | 145 | ja |
| de.c1.e04 | Im Kleingedruckten | Verträge und Rechte | passiv-c1, gehobene-praep | passiversatz, praep-genitiv, konditional-falls, konj2-diplomatie | kleingedrucktes, vertraege | 145 | nein |
| de.c1.e05 | Debatten und Meinungsbildung | Medien und Digitales (sachlich) | subjektive-modalverben, konnektoren-c1 | konzessiv-b2, adversativ, redewiedergabe-text, modalpartikeln-c1 | debatte, nachrichten | 145 | ja |
| de.c1.e06 | Nachhaltig wirtschaften | Natur und Umwelt | wortbildung-c1 | je-desto, modalsatz-indem, partizipialattribut, wortbildung-verben, gehobene-praep | nachhaltigkeit, klimaschutz | 145 | ja |
| de.c1.e07 | Amtsdeutsch entschlüsseln | Behörden und Formulare | verbalisierung | nominalstil, funktionsverbgefuege, passiv-c1, weiterfuehrender-nebensatz, register | amtssprache, antraege | 145 | nein |
| de.c1.e08 | Sprichwörter, Literatur und Erinnerung | Geschichte und Kultur | partizipialkonstruktion, idiomatik | passiv-perfekt, modal-vermutung, register, subjektive-modalverben | literatur, stadtgeschichte | 145 | nein |
| de.c1.e09 | Demokratie im Alltag | Staat und Gemeinde (sachlich) | negation-c1 | konnektoren-c1, genitiv-relativ, passiv-c1, subjektive-modalverben | beteiligung, rechtsstaat | 145 | ja |
| de.c1.e10 | Projekte planen und leiten | Ehrenamt | textkohaesion, verkuerzung | futur-2, relativ-wer-was, statt-ohne, verbalisierung | projekt, engagement | 145 | ja |
| de.c1.e11 | Zusammenleben der Generationen | Zusammenleben | vergleich-c1 | konj2-vergangenheit, adjektiv-nominalisiert, irrealer-vergleich, konnektoren-c1, idiomatik | generationen, pflege | 145 | nein |
| de.c1.e12 | Präsentieren und überzeugen | Arbeit und Berufe | satzgliedstellung | textkohaesion, konj2-diplomatie, modalpartikeln-c1, partizipialkonstruktion | praesentation, verhandlung | 145 | ja |
| de.c1.e13 | Technik und Verantwortung | Wissenschaft und Technik | attribute-komplex | satzgliedstellung, wortbildung-c1, redewiedergabe-text, negation-c1, verkuerzung | technikethik, digitale-arbeit | 145 | ja |
| de.c1.e14 | Lebenswege – Rückblick und Ausblick | Arbeit und Berufe | – | register, textkohaesion, satzgliedstellung, attribute-komplex, idiomatik, vergleich-c1, verbalisierung, gehobene-praep | lebenswege, identitaet | 115 | ja |
| **Σ** | | | 18 neu | | | **2000** | |

## 5 Grammatikfolge

„Wiederholt in“ nennt die späteren Einheiten, in denen der Punkt erneut steht (Kurzform Stufe-Einheit). „Voraus“ sind Punkte, die vorher eingeführt sein müssen.

### 5.1 A1 (27 Punkte)

| ID | Titel | Was gelernt wird | eingeführt | wiederholt in | voraus |
|---|---|---|---|---|---|
| sein-pronomen | Personalpronomen und das Verb „sein“ | Die Personalpronomen ich, du, er, sie, es, wir, ihr, sie/Sie und die Formen von „sein“. Lernende stellen sich und andere vor. | a1-e01 | a1-e02 | – |
| praesens-regel | Präsens regelmäßiger Verben | Endungen -e, -st, -t, -en, -t, -en bei Verben wie wohnen, kommen, heißen, lernen. Die Sie-Form für Erwachsene. | a1-e01 | a1-e04 | sein-pronomen |
| fragen | W-Fragen und Ja/Nein-Fragen | W-Fragen mit dem Verb an zweiter Stelle, Ja/Nein-Fragen mit dem Verb an erster Stelle; Antworten mit ja und nein. | a1-e01 | a1-e02, a1-e04, a1-e09, a2-e09 | praesens-regel |
| artikel-genus | Bestimmter Artikel und Genus | der, die, das: Jedes Nomen hat ein Genus und wird großgeschrieben. Nomen werden immer mit Artikel gelernt. | a1-e02 | a1-e03 | sein-pronomen |
| possessiv-nom | Possessivartikel im Nominativ | mein, dein, sein, ihr, unser, euer, Ihr mit den Endungen für maskulin, feminin, neutral und Plural. | a1-e02 | a1-e06, a1-e11, a2-e03 | artikel-genus |
| haben | Das Verb „haben“ | Die Formen von „haben“; sagen, was man hat (Geschwister, Zeit, Hunger). | a1-e02 | a1-e03, a1-e11 | praesens-regel |
| unbest-artikel-negation | Unbestimmter Artikel und „kein“ | ein, eine, ein und die Verneinung kein, keine; der Unterschied zwischen bestimmtem und unbestimmtem Artikel. | a1-e03 | a1-e05 | artikel-genus |
| plural | Pluralformen der Nomen | Die wichtigsten Pluralendungen (-e, -(e)n, -er, -s, ohne Endung) und der Umlaut; im Plural steht immer der Artikel „die“. | a1-e03 | a1-e05 | artikel-genus |
| adjektiv-praedikativ | Adjektive nach „sein“ | Adjektive ohne Endung nach „sein“; Verstärkung mit „sehr“ und „zu“. | a1-e03 | a1-e10 | sein-pronomen |
| zeitangaben | Uhrzeit und Zeitangaben | Offizielle und alltägliche Uhrzeit (halb, Viertel vor, Viertel nach); um + Uhrzeit, am + Tag, im + Monat oder Jahreszeit. | a1-e04 | a1-e07, a1-e12, a2-e01 | fragen |
| v2-inversion | Das Verb an Position 2 | Im Aussagesatz steht das Verb immer an zweiter Stelle, auch wenn eine Zeitangabe oder ein anderes Satzglied am Anfang steht. | a1-e04 | a1-e07, a1-e12 | zeitangaben, praesens-regel |
| akkusativ | Akkusativ | Das direkte Objekt im Akkusativ: den, einen, keinen beim Maskulinum; feminin, neutral und Plural bleiben gleich. | a1-e05 | a1-e06, a1-e08, a1-e10, a2-e03, a2-e04 | unbest-artikel-negation, v2-inversion |
| vorlieben | Wünsche und Vorlieben: möchte, mögen, gern | Höflich sagen, was man möchte; mit „mögen“ und „gern“ ausdrücken, was man mag und gern tut. | a1-e05 | a1-e06, a1-e08, a2-e01 | akkusativ |
| praesens-vokalwechsel | Verben mit Vokalwechsel | Bei Verben wie essen, nehmen, sehen, fahren, schlafen ändert sich der Vokal in der 2. und 3. Person Singular. | a1-e05 | a1-e07 | praesens-regel |
| negation-nicht | Verneinung mit „nicht“ | „nicht“ verneint Verben, Adjektive und Angaben, „kein“ verneint Nomen ohne bestimmten Artikel; die Stellung von „nicht“ im Satz. | a1-e06 | a1-e08, a1-e10 | unbest-artikel-negation, akkusativ |
| mengen | Mengen und Preise | Mengenangaben ohne Artikel (ein Kilo Tomaten, eine Flasche Wasser); Fragen mit „wie viel“ und „wie viele“; Preise lesen. | a1-e06 | a2-e03, b1-e11 | akkusativ, vorlieben |
| modalverben-1 | Modalverben I: können, müssen, wollen | Das Modalverb steht an Position 2, der Infinitiv am Satzende (Satzklammer); Fähigkeit, Notwendigkeit und Wunsch. | a1-e07 | a1-e08, a1-e09, a1-e12, a2-e09, a2-e13, b1-e02 | v2-inversion, akkusativ |
| imperativ | Imperativ | Aufforderungen und Bitten in der du-, ihr- und Sie-Form; mit „bitte“ werden sie freundlich. | a1-e07 | a1-e09, a1-e11, a2-e04, a2-e10, b1-e05 | praesens-vokalwechsel |
| konnektoren-hauptsatz | Sätze verbinden mit und, aber, oder, denn | Zwei Hauptsätze verbinden; nach und, aber, oder, denn bleibt die Wortstellung gleich. | a1-e08 | a1-e12 | v2-inversion |
| ort-richtung | Wo? Wohin? Woher? | Nach Ort, Ziel und Herkunft fragen; feste Wendungen wie zu Hause, nach Hause, in der Stadt, zum Bahnhof (der Dativ folgt in A2 als Regel). | a1-e09 | a2-e02 | fragen |
| man | Das Pronomen „man“ | Allgemeine Aussagen und Regeln mit „man“ und dem Verb in der 3. Person Singular. | a1-e09 | a1-e11, a2-e07 | modalverben-1 |
| es-unpersoenlich | Unpersönliches „es“ und „es gibt“ | „es“ bei Wetter und Befinden (es regnet, es ist kalt) und „es gibt“ mit Akkusativ. | a1-e10 | a2-e07 | akkusativ |
| akk-pronomen | Personalpronomen im Akkusativ | mich, dich, ihn, sie, es, uns, euch, sie/Sie statt eines Nomens im Akkusativ. | a1-e10 | a2-e06 | akkusativ |
| modalverben-2 | Modalverben II: dürfen, sollen | Erlaubnis und Verbot mit „dürfen“, Rat und Auftrag mit „sollen“; Satzklammer wie bei den anderen Modalverben. | a1-e11 | a2-e05, a2-e09, b1-e03, b1-e09 | modalverben-1, man |
| dativ-wendungen | Feste Wendungen mit „mir“ und „dir“ | Wendungen wie „Wie geht es dir?“, „Mir geht es gut“, „Mir ist kalt“, „Mir tut … weh“ als feste Ausdrücke; die Regel folgt in A2. | a1-e11 | a2-e05 | sein-pronomen |
| trennbare-verben | Trennbare Verben | Verben wie aufstehen, anfangen, einkaufen, abholen: Das Präfix steht am Satzende; mit Modalverb bleibt das Verb zusammen. | a1-e12 | a2-e01, a2-e02, a2-e10 | v2-inversion, modalverben-1 |
| wortbildung-in | Berufe und Personen mit -in | Weibliche Berufs- und Personenbezeichnungen mit -in, oft mit Umlaut; Plural -innen. | a1-e12 | a2-e13 | artikel-genus, plural |

### 5.2 A2 (27 Punkte)

| ID | Titel | Was gelernt wird | eingeführt | wiederholt in | voraus |
|---|---|---|---|---|---|
| perfekt-haben | Perfekt mit „haben“ | Über Vergangenes sprechen: „haben“ + Partizip II (ge-…-t, ge-…-en) am Satzende. | a2-e01 | a2-e02, a2-e03, a2-e14, b1-e01 | haben, v2-inversion |
| praeteritum-sein-haben | Präteritum von „sein“ und „haben“ | „war“ und „hatte“ statt des Perfekts bei „sein“ und „haben“. | a2-e01 | a2-e11, b1-e01 | sein-pronomen, haben |
| perfekt-sein | Perfekt mit „sein“ und besondere Partizipien | Perfekt mit „sein“ bei Bewegung und Veränderung; Partizip trennbarer (eingekauft) und untrennbarer Verben (besucht) und der Verben auf -ieren (trainiert). | a2-e02 | a2-e05, a2-e08, a2-e11, b1-e01 | perfekt-haben, trennbare-verben |
| dativ-praep | Präpositionen mit Dativ | mit, bei, nach, von, zu, aus, seit verlangen den Dativ (dem, der, dem, den + -n); Verschmelzungen zum, zur, beim, vom. | a2-e02 | a2-e04, a2-e09 | ort-richtung, artikel-genus |
| dativ-objekt | Dativ- und Akkusativobjekt | Verben wie geben, schenken, zeigen, bringen mit der Person im Dativ und der Sache im Akkusativ; Reihenfolge der Objekte. | a2-e03 | a2-e07 | akkusativ, dativ-praep |
| dativ-pronomen | Personalpronomen im Dativ und Verben mit Dativ | mir, dir, ihm, ihr, uns, euch, ihnen/Ihnen; Verben wie helfen, gefallen, gehören, passen, schmecken. | a2-e03 | a2-e05, a2-e06 | dativ-wendungen, dativ-objekt |
| wechselpraep | Wechselpräpositionen | in, an, auf, über, unter, vor, hinter, neben, zwischen: Wo? mit Dativ, Wohin? mit Akkusativ. | a2-e04 | a2-e07, a2-e12, b1-e04 | dativ-praep, akkusativ |
| positionsverben | stellen/stehen, legen/liegen, hängen, setzen/sitzen | Verben der Lage (Wo?) und der Bewegung (Wohin?) zusammen mit den Wechselpräpositionen. | a2-e04 | a2-e12, b1-e04 | wechselpraep |
| nebensatz-weil | Nebensätze mit „weil“ | Gründe angeben: „weil“ leitet einen Nebensatz ein, das konjugierte Verb steht am Ende; Vergleich mit „denn“. | a2-e05 | a2-e06, a2-e08, a2-e11, a2-e14, b1-e02 | konnektoren-hauptsatz, perfekt-haben |
| reflexive-verben | Reflexive Verben | Verben mit Reflexivpronomen im Akkusativ (sich waschen, sich freuen, sich erkälten, sich ausruhen). | a2-e05 | a2-e08, a2-e14, b1-e03 | akk-pronomen |
| adj-dekl-best | Adjektive nach dem bestimmten Artikel | Adjektivendungen -e und -en nach der, die, das, dieser, welcher im Nominativ, Akkusativ und Dativ. | a2-e06 | a2-e13, b1-e10 | akkusativ, dativ-praep, adjektiv-praedikativ |
| welch-dies | Fragewort „welch-“ und Demonstrativ „dies-“ | Nach einer Auswahl fragen mit welcher, welche, welches und mit dieser, diese, dieses antworten. | a2-e06 | a2-e13 | artikel-genus, akkusativ |
| nebensatz-dass | Nebensätze mit „dass“ | Meinungen, Wissen und Aussagen wiedergeben (Ich finde, dass …; Ich weiß, dass …); das Verb steht am Ende. | a2-e07 | a2-e10, a2-e13, b1-e02, b1-e04, b1-e07 | nebensatz-weil |
| indefinitpronomen | jemand, niemand, etwas, nichts, alle, viele | Unbestimmte Personen und Dinge benennen; jemand und niemand auch im Akkusativ und Dativ. | a2-e07 | a2-e14 | akkusativ, perfekt-haben |
| komparation | Komparativ und Superlativ | Vergleichen mit -er als und so … wie; Superlativ mit am …-sten; unregelmäßige Formen von gut, gern, viel. | a2-e08 | a2-e12, b1-e03, b1-e14 | adjektiv-praedikativ, vorlieben |
| praep-akk | Präpositionen mit Akkusativ | für, ohne, durch, um, gegen verlangen immer den Akkusativ. | a2-e08 | b1-e06 | akkusativ |
| nebensatz-wenn | Nebensätze mit „wenn“ | Bedingungen und wiederholte Situationen ausdrücken; der wenn-Satz steht vor oder nach dem Hauptsatz. | a2-e09 | a2-e10, b1-e03, b1-e05 | nebensatz-weil |
| datum-ordinal | Ordinalzahlen und Datum | der erste, zweite, dritte …; das Datum sagen und schreiben (am 3. Mai, vom 1. bis 14. Juli). | a2-e09 | a2-e11 | zeitangaben, dativ-praep |
| hoeflich-konj | Höfliche Bitten mit „hätte“, „könnte“, „würde“ | Feste Höflichkeitsformen (Ich hätte gern …, Könnten Sie …?, Würden Sie bitte …?), noch ohne die ganze Regel des Konjunktivs II. | a2-e10 | a2-e14, b1-e04, b1-e05, b1-e12 | modalverben-1 |
| textfolge | Reihenfolge mit zuerst, dann, danach, zum Schluss | Abläufe und Anleitungen gliedern; nach dem Adverb folgt das Verb an Position 2. | a2-e10 | a2-e12, b1-e05, b1-e11 | v2-inversion, trennbare-verben |
| temporale-praep | Zeitpräpositionen | vor, nach, seit, bis, ab, in, für mit Zeitangaben (vor einer Woche, in drei Tagen, für zwei Wochen). | a2-e11 | b1-e08, b1-e09 | dativ-praep, praep-akk |
| praeteritum-modal | Präteritum der Modalverben | wollte, konnte, musste, durfte, sollte beim Erzählen statt des Perfekts. | a2-e11 | b1-e08 | modalverben-1, modalverben-2, praeteritum-sein-haben |
| wortbildung-komposita | Zusammengesetzte Nomen | Komposita aus zwei oder mehr Wörtern; das letzte Wort bestimmt Artikel und Bedeutung; Fugen-s und Fugen-n. | a2-e12 | b1-e15 | artikel-genus, plural |
| genitiv-s | Zugehörigkeit mit -s und „von“ | Besitz bei Namen mit -s (Elifs Fahrrad) und im Alltag mit „von“ + Dativ (das Fahrrad von meinem Bruder). | a2-e12 | b1-e09 | dativ-praep |
| werden-vollverb | „werden“ als Vollverb | „werden“ für Veränderungen und Berufswünsche (Ich werde Ärztin; Es wird dunkel); Präsens- und Perfektformen. | a2-e13 | b1-e02 | praesens-vokalwechsel, perfekt-sein |
| adj-dekl-unbest | Adjektive nach dem unbestimmten Artikel | Adjektivendungen nach ein, kein und den Possessivartikeln im Nominativ, Akkusativ und Dativ. | a2-e13 | b1-e10 | adj-dekl-best, possessiv-nom |
| konnektoren-adverb | deshalb, trotzdem, sonst, also | Folgen, Gegensätze und Bedingungen mit Verbindungsadverbien ausdrücken; danach steht das Verb an Position 2. | a2-e14 | b1-e01 | nebensatz-weil, v2-inversion |

### 5.3 B1 (27 Punkte)

| ID | Titel | Was gelernt wird | eingeführt | wiederholt in | voraus |
|---|---|---|---|---|---|
| praeteritum | Präteritum | Das Präteritum regelmäßiger und unregelmäßiger Verben, vor allem in Erzählungen und Berichten. | b1-e01 | b1-e08, b1-e14, b2-e13 | praeteritum-sein-haben, praeteritum-modal |
| nebensatz-temporal | Temporalsätze mit als, wenn, während, bevor, bis, seit | Zeitliche Verhältnisse ausdrücken; „als“ für einmalige Ereignisse in der Vergangenheit, „wenn“ für wiederholte. | b1-e01 | b1-e07, b1-e08, b2-e06 | nebensatz-wenn, praeteritum |
| infinitiv-zu | Infinitiv mit „zu“ | Nach Verben wie versuchen, vorhaben, anfangen und Ausdrücken wie „Es ist wichtig, …“ steht zu + Infinitiv; dazu „brauchen … zu“. | b1-e02 | b1-e06, b1-e12, b2-e01 | modalverben-1, trennbare-verben |
| verben-praep | Verben mit Präpositionen | Feste Verbindungen wie sich interessieren für, warten auf, sich kümmern um; Fragen mit wo(r)- und Verweise mit da(r)-. | b1-e02 | b1-e06, b1-e10, b2-e02 | reflexive-verben, praep-akk, dativ-praep |
| konjunktiv-2 | Konjunktiv II: Wünsche, Ratschläge, Höflichkeit | „würde“ + Infinitiv sowie wäre, hätte, könnte, sollte für Wünsche, Ratschläge und höfliche Bitten. | b1-e03 | b1-e07, b1-e15, b2-e01, b2-e06 | hoeflich-konj, modalverben-2 |
| reflexiv-dativ | Reflexivpronomen im Dativ | Bei Verben mit Akkusativobjekt steht das Reflexivpronomen im Dativ (sich die Hände waschen, sich etwas ansehen). | b1-e03 | b1-e11 | reflexive-verben, dativ-pronomen |
| passiv-praesens | Passiv im Präsens | „werden“ + Partizip II, wenn die Handlung wichtiger ist als die handelnde Person; „von“ + Dativ für die Person. | b1-e04 | b1-e09, b1-e11, b1-e12, b2-e03 | werden-vollverb, perfekt-haben |
| lassen | Das Verb „lassen“ | „lassen“ im Sinn von veranlassen (etwas reparieren lassen) und erlauben (jemanden etwas machen lassen). | b1-e04 | b1-e12 | modalverben-1 |
| relativsatz-nom-akk | Relativsätze im Nominativ und Akkusativ | Nomen mit Relativsätzen genauer beschreiben (der, die, das, den); das Verb steht am Ende. | b1-e05 | b1-e06, b1-e14, b2-e01, b2-e05 | nebensatz-dass, akkusativ |
| indirekte-frage | Indirekte Fragen mit „ob“ und W-Wort | Fragen höflich oder berichtend als Nebensatz stellen: „Weißt du, ob …?“, „Können Sie mir sagen, wann …?“ | b1-e05 | b1-e07, b1-e13, b2-e05 | nebensatz-dass, fragen |
| relativsatz-dat-praep | Relativsätze im Dativ, mit Präposition und mit wo/was | Relativpronomen dem, der, denen, auch nach Präpositionen (mit dem, in der); „wo“ für Orte, „was“ nach alles, etwas, nichts. | b1-e06 | b1-e10, b1-e16, b2-e03, b2-e09 | relativsatz-nom-akk, dativ-praep |
| um-zu-damit | Finalsätze mit „um … zu“ und „damit“ | Zweck und Ziel ausdrücken: „um … zu“ bei gleichem Subjekt, „damit“ bei verschiedenen Subjekten. | b1-e06 | b1-e15, b2-e12 | infinitiv-zu |
| futur-1 | Futur I | „werden“ + Infinitiv für Pläne, Versprechen und Vermutungen über die Zukunft. | b1-e07 | b1-e16, b2-e12 | werden-vollverb |
| konzessiv | Gegensätze mit „obwohl“ und „trotzdem“ | Einen unerwarteten Gegensatz ausdrücken: „obwohl“ im Nebensatz, „trotzdem“ im Hauptsatz. | b1-e07 | b1-e16, b2-e11 | konnektoren-adverb, nebensatz-weil |
| plusquamperfekt | Plusquamperfekt und „nachdem“ | Vorvergangenheit mit hatte/war + Partizip II; die Abfolge mit „nachdem“ ausdrücken. | b1-e08 | b2-e13 | praeteritum, perfekt-sein |
| modalpartikeln | Modalpartikeln im Gespräch: doch, mal, ja, eben, halt | Kleine Wörter, die Aussagen freundlicher, dringender oder selbstverständlicher machen. | b1-e08 | b1-e10, c1-e02 | imperativ |
| genitiv | Genitiv und Präpositionen mit Genitiv | Genitiv der Artikel und Nomen (des Autos, der Stadt); wegen, während, trotz, statt mit Genitiv. | b1-e09 | b1-e12, b1-e13, b1-e16, b2-e04, b2-e13 | genitiv-s, adj-dekl-best |
| konsekutiv | Folgen mit „sodass“ und „so … dass“ | Eine Folge ausdrücken: so + Adjektiv … dass oder sodass. | b1-e09 | b1-e15, b2-e07 | nebensatz-dass, praeteritum |
| n-deklination | n-Deklination | Maskuline Nomen wie der Kollege, der Kunde, der Praktikant, der Herr bekommen außer im Nominativ Singular die Endung -(e)n. | b1-e10 | b2-e02 | akkusativ, dativ-objekt |
| adj-dekl-ohne | Adjektive ohne Artikel und Gesamtüberblick | Adjektivendungen ohne Artikel (gute Arbeit, mit freundlichen Grüßen) und ein Überblick über alle Adjektivendungen. | b1-e10 | b1-e11 | adj-dekl-best, adj-dekl-unbest |
| passiv-praet-modal | Passiv im Präteritum und mit Modalverben | „wurde“ + Partizip II; Modalverb + Partizip II + „werden“ (muss geschnitten werden). | b1-e11 | b1-e13, b1-e14, b2-e02, b2-e05, b2-e09 | passiv-praesens, praeteritum |
| partizip-adjektiv | Partizipien als Adjektive | Partizip I (die wartenden Gäste) und Partizip II (das geschnittene Gemüse) mit Adjektivendungen. | b1-e11 | b1-e14, b2-e09 | adj-dekl-ohne, perfekt-haben |
| wortbildung-nomen | Nomen aus Verben und Adjektiven | Nomen bilden mit -ung, -heit, -keit und durch den nominalisierten Infinitiv (das Ausfüllen). | b1-e12 | b1-e13, b2-e01 | wortbildung-komposita |
| zustandspassiv | Zustandspassiv | „sein“ + Partizip II beschreibt einen Zustand als Ergebnis (ist geöffnet, ist ausgefüllt). | b1-e13 | b1-e16, b2-e04 | passiv-praesens |
| wortbildung-adjektiv | Adjektive bilden | Adjektive mit -bar, -lich, -ig, -los, -voll und un- bilden und ihre Bedeutung erschließen. | b1-e14 | b2-e09 | wortbildung-nomen |
| konj2-irreal | Irreale Bedingungen | Wenn-Sätze mit Konjunktiv II für Situationen, die nicht wirklich sind (Wenn ich … hätte, würde ich …). | b1-e15 | b2-e03, b2-e07 | konjunktiv-2, nebensatz-wenn |
| zweiteilige-konnektoren | Zweiteilige Konnektoren | sowohl … als auch, weder … noch, nicht nur … sondern auch, entweder … oder. | b1-e16 | b2-e03, b2-e07 | konnektoren-hauptsatz, konnektoren-adverb |

### 5.4 B2 (24 Punkte)

| ID | Titel | Was gelernt wird | eingeführt | wiederholt in | voraus |
|---|---|---|---|---|---|
| nominalstil | Nominalstil | Nebensätze in Nominalgruppen umformen (weil → wegen, als → bei, nachdem → nach); typisch für Lebenslauf, Bericht und Amtstext. | b2-e01 | b2-e02, b2-e04, b2-e05, b2-e08, b2-e14, c1-e01, c1-e03, c1-e07 | wortbildung-nomen, genitiv |
| konditional-falls | Bedingungen genauer ausdrücken | falls, sofern, vorausgesetzt, dass und der uneingeleitete Bedingungssatz (Sollten Sie …, …). | b2-e02 | b2-e04, b2-e10, b2-e16, c1-e02, c1-e04 | nebensatz-wenn, konjunktiv-2 |
| temporal-b2 | Temporalsätze mit sobald, solange, sooft, seitdem | Genaue zeitliche Beziehungen: sobald (unmittelbar danach), solange (gleiche Dauer), sooft (jedes Mal), seitdem (Beginn in der Vergangenheit). | b2-e03 | b2-e06 | nebensatz-temporal |
| passiversatz | Passiversatzformen | Alternativen zum Passiv: sich lassen + Infinitiv, sein + zu + Infinitiv, Adjektive auf -bar und „man“. | b2-e04 | b2-e06, b2-e08, b2-e15, b2-e16, c1-e04 | passiv-praet-modal, wortbildung-adjektiv, lassen |
| praep-genitiv | Präpositionen mit Genitiv in Sachtexten | aufgrund, infolge, innerhalb, außerhalb, anstelle, mithilfe, bezüglich in formellen Texten. | b2-e04 | b2-e08, b2-e10, b2-e16, c1-e04 | genitiv |
| konjunktiv-1 | Konjunktiv I in der indirekten Rede | Fremde Aussagen mit Konjunktiv I wiedergeben (sei, habe, komme); Ersatz durch Konjunktiv II oder „würde“, wenn die Form wie der Indikativ klingt. | b2-e05 | b2-e08, b2-e11, b2-e14, b2-e16, c1-e01, c1-e03 | konjunktiv-2, indirekte-frage |
| textverweise | Verweise im Text | Mit Verweiswörtern (dies, dieser, Ersteres, Letzteres, darauf, damit) auf Gesagtes zurück- oder vorausweisen. | b2-e05 | b2-e07, b2-e11, c1-e03 | verben-praep, relativsatz-nom-akk |
| konj2-vergangenheit | Konjunktiv II der Vergangenheit | hätte/wäre + Partizip II für vergangene, nicht wirkliche Situationen und Bedauern; mit Modalverb: hätte … machen sollen. | b2-e06 | b2-e11, c1-e11 | konj2-irreal, plusquamperfekt |
| adjektiv-nominalisiert | Nominalisierte Adjektive und Partizipien | Adjektive und Partizipien als Nomen mit Adjektivendungen (der Angehörige, ein Angehöriger, die Pflegebedürftigen, das Wichtigste). | b2-e06 | b2-e10, c1-e11 | adj-dekl-ohne |
| modalsatz-indem | Mittel und Weg: indem, dadurch dass | Ausdrücken, wie man ein Ziel erreicht, mit „indem“ und „dadurch, dass“; Fragen mit „Wie?“ und „Wodurch?“. | b2-e07 | b2-e12, b2-e15, c1-e06 | um-zu-damit |
| je-desto | Vergleichssätze mit je … desto/umso | Zwei Entwicklungen verbinden: je + Komparativ (Verb am Ende), desto/umso + Komparativ (Verb an Position 2). | b2-e07 | b2-e10, c1-e06 | komparation, nebensatz-wenn |
| funktionsverbgefuege | Funktionsverbgefüge | Feste Verbindungen aus Nomen und Verb wie einen Antrag stellen, in Kraft treten, zur Verfügung stellen, eine Entscheidung treffen. | b2-e08 | b2-e12, c1-e02, c1-e07 | nominalstil |
| partizipialattribut | Erweiterte Partizipialattribute | Lange Attribute vor dem Nomen auflösen und bilden (die in Wetzlar entwickelte Linse = die Linse, die in Wetzlar entwickelt wurde). | b2-e09 | b2-e13, c1-e03, c1-e06 | partizip-adjektiv, relativsatz-nom-akk |
| wortbildung-verben | Verben mit Präfixen | Die Bedeutung untrennbarer Präfixe be-, ver-, ent-, er-, zer- und von Präfixen, die trennbar oder untrennbar sein können (übersetzen, umfahren). | b2-e09 | b2-e14, c1-e06 | wortbildung-adjektiv, trennbare-verben |
| konzessiv-b2 | Einräumung: zwar … aber, auch wenn, selbst wenn | Gegensätze differenziert ausdrücken; „auch wenn“ und „selbst wenn“ für unwahrscheinliche oder angenommene Fälle. | b2-e10 | b2-e15, c1-e05 | konzessiv |
| irrealer-vergleich | Irreale Vergleiche mit „als ob“ | als ob, als wenn und als + Konjunktiv II für Vergleiche, die nicht der Wirklichkeit entsprechen. | b2-e11 | b2-e14, c1-e01, c1-e11 | konj2-irreal |
| futur-2 | Futur II | werde + Partizip II + haben/sein für abgeschlossene Handlungen in der Zukunft und Vermutungen über Vergangenes. | b2-e12 | b2-e15, c1-e10 | futur-1, perfekt-sein |
| relativ-wer-was | Relativsätze mit wer, was und wo(r)- | Verallgemeinernde Relativsätze (Wer …, der …), „was“ nach alles, etwas, das Beste und wo(r)- + Präposition (worüber, womit). | b2-e12 | b2-e15, c1-e10 | relativsatz-dat-praep, verben-praep |
| passiv-perfekt | Passiv im Perfekt und Plusquamperfekt | ist/war + Partizip II + „worden“ für abgeschlossene Vorgänge im Passiv. | b2-e13 | b2-e14, c1-e08 | passiv-praet-modal, plusquamperfekt |
| modal-vermutung | Vermutungen mit Modalverben und „werden“ | Grade der Sicherheit ausdrücken: muss (sehr sicher), dürfte, könnte, kann (möglich), wird … sein/haben. | b2-e13 | b2-e16, c1-e08 | modalverben-2, futur-2 |
| genitiv-relativ | Relativsätze mit „dessen“ und „deren“ | Relativpronomen im Genitiv für Zugehörigkeit. | b2-e14 | b2-e16, c1-e09 | genitiv, relativsatz-dat-praep |
| statt-ohne | statt/ohne … zu und statt/ohne dass | Ausdrücken, dass etwas anstelle von etwas geschieht oder dass etwas Erwartetes ausbleibt. | b2-e15 | c1-e10 | infinitiv-zu |
| adversativ | Gegenüberstellung: während, wohingegen, im Gegensatz zu | Zwei Sachverhalte gegenüberstellen, ohne dass einer den anderen einschränkt. | b2-e16 | c1-e01, c1-e05 | nebensatz-temporal, konzessiv-b2 |
| weiterfuehrender-nebensatz | Weiterführende Nebensätze mit was, wodurch, weshalb | Einen ganzen Satz kommentieren oder fortführen (…, was ihn ärgerte; …, weshalb er zur Beratung ging). | b2-e16 | c1-e07 | relativ-wer-was |

### 5.5 C1 (18 Punkte)

| ID | Titel | Was gelernt wird | eingeführt | wiederholt in | voraus |
|---|---|---|---|---|---|
| register | Sprachregister und Stilebenen | Gehobene, neutrale und umgangssprachliche Ausdrucksweise unterscheiden und je nach Situation wählen; Dialekt und Jugendsprache erkennen, ohne sie abzuwerten. | c1-e01 | c1-e02, c1-e07, c1-e08, c1-e14 | konjunktiv-1, nominalstil |
| modalpartikeln-c1 | Abtönung mit wohl, schon, eben, ruhig, etwa, denn | Modalpartikeln für Vermutung, Beschwichtigung, Erlaubnis und Erstaunen gezielt einsetzen und in Verhandlungen deuten. | c1-e02 | c1-e05, c1-e12 | modalpartikeln |
| konj2-diplomatie | Konjunktiv II für Distanz und Diplomatie | Vorschläge, Kritik und Ablehnung abschwächen (Wäre es denkbar, …? Ich würde vorschlagen, … Das hätte ich anders gesehen.). | c1-e02 | c1-e04, c1-e12 | konj2-vergangenheit, register |
| redewiedergabe-text | Redewiedergabe in Sachtexten | Fremde Aussagen in längeren Texten wiedergeben: Redeeinleitungen (laut, zufolge, wie … betont), Wechsel zwischen Konjunktiv I und Indikativ, Kennzeichnung von Quellen. | c1-e03 | c1-e05, c1-e13 | konjunktiv-1, textverweise |
| passiv-c1 | Erweiterte Passivformen | Passiv mit Modalverb im Perfekt und Konjunktiv (hätte geprüft werden müssen), unpersönliches Passiv (Hier wird verhandelt) und Passiv mit „bekommen“. | c1-e04 | c1-e07, c1-e09 | passiv-perfekt, passiversatz |
| gehobene-praep | Präpositionen der Schriftsprache | zufolge, gemäß, entsprechend, hinsichtlich, angesichts, ungeachtet, zwecks in Recht, Verwaltung und Wissenschaft. | c1-e04 | c1-e06, c1-e14 | praep-genitiv |
| subjektive-modalverben | Subjektive Modalverben: sollen und wollen | „sollen“ für Berichte Dritter, „wollen“ für fragwürdige Selbstaussagen; Abgrenzung zu den Vermutungsformen. | c1-e05 | c1-e08, c1-e09 | modal-vermutung, konjunktiv-1 |
| konnektoren-c1 | Konnektoren der Argumentation | Argumente verknüpfen und gewichten: einerseits … andererseits, zumal, insofern als, es sei denn, geschweige denn, folglich. | c1-e05 | c1-e09, c1-e11 | konzessiv-b2, adversativ |
| wortbildung-c1 | Wortbildung in Fachtexten | Fachwörter aus ihren Bestandteilen erschließen und bilden: mehrgliedrige Komposita, Ableitungen auf -weise, -mäßig, -haft, -gerecht, Kurzwörter. | c1-e06 | c1-e13 | wortbildung-verben, wortbildung-komposita |
| verbalisierung | Vom Nominalstil zum Verbalstil | Dichte Nominalgruppen der Amts- und Fachsprache in verständliche Sätze mit Verben auflösen und umgekehrt. | c1-e07 | c1-e10, c1-e14 | nominalstil, funktionsverbgefuege |
| partizipialkonstruktion | Satzwertige Partizipialkonstruktionen | Verkürzte Nebensätze mit Partizip (In Wetzlar angekommen, …) verstehen und in Erzähltexten gezielt verwenden. | c1-e08 | c1-e12 | partizipialattribut |
| idiomatik | Redewendungen, Sprichwörter und Kollokationen | Feste Wendungen in Bedeutung und Register verstehen und passend verwenden; Sprichwörter vergleichen, ohne sie wörtlich zu übersetzen. | c1-e08 | c1-e11, c1-e14 | register |
| negation-c1 | Feinheiten der Verneinung | Verneinung abstufen und betonen (keineswegs, kaum, nicht einmal, mitnichten), Stellung von „nicht“ in komplexen Sätzen, doppelte Verneinung als Bejahung. | c1-e09 | c1-e13 | negation-nicht, konnektoren-c1 |
| textkohaesion | Textzusammenhang herstellen | Absätze logisch verbinden: Überleitungen, Verweisketten, Wiederaufnahme durch Synonyme und Pronomen, Gliederungssignale in Berichten. | c1-e10 | c1-e12, c1-e14 | textverweise, redewiedergabe-text |
| verkuerzung | Verkürzte Formen in Protokoll und Notiz | Ellipsen, Infinitiv- und Nominalformen in Protokollen, Notizen und Folien verstehen und bilden. | c1-e10 | c1-e13 | nominalstil |
| vergleich-c1 | Vergleichssätze für Nuancen | zu … als dass, umso … als, je nachdem, ob für feine Gewichtungen, auch mit Konjunktiv II. | c1-e11 | c1-e14 | je-desto, konj2-irreal |
| satzgliedstellung | Satzgliedstellung und Hervorhebung | Thema und neue Information gezielt platzieren: Vorfeld, Reihenfolge im Mittelfeld, Ausklammerung und Hervorhebung durch den Satzbau. | c1-e12 | c1-e13, c1-e14 | v2-inversion, textkohaesion |
| attribute-komplex | Komplexe Attribute | Mehrfach erweiterte Attribute, Attributketten und Appositionen in Fachtexten verstehen und in klare Sätze auflösen. | c1-e13 | c1-e14 | partizipialattribut, genitiv-relativ |

## 6 Wortfelder

| ID | Titel | Beispiele | Einheiten |
|---|---|---|---|
| begruessung | Begrüßung und Abschied | Hallo, Guten Morgen, Guten Tag, Tschüss, Auf Wiedersehen, danke | a1-e01 |
| herkunft | Herkunft und Sprachen | das Land, die Stadt, die Sprache, Deutsch, Türkisch, Arabisch | a1-e01, b2-e11 |
| angaben-person | Angaben zur Person | der Name, der Vorname, die Adresse, die Telefonnummer, das Alter, buchstabieren | a1-e01, a2-e09 |
| familie | Familie und Verwandte | die Mutter, der Vater, der Bruder, die Schwester, die Großeltern, das Kind | a1-e02, a2-e03, b1-e01 |
| zahlen | Zahlen | eins, zwölf, zwanzig, hundert, die Zahl, wie viele | a1-e02 |
| wohnung | Wohnung und Räume | die Wohnung, das Zimmer, die Küche, das Bad, der Balkon, der Flur | a1-e03, b2-e03 |
| moebel | Möbel und Einrichtung | der Tisch, der Stuhl, das Bett, der Schrank, das Regal, die Lampe | a1-e03, a2-e04 |
| eigenschaften | Eigenschaften von Dingen | groß, klein, hell, dunkel, neu, alt | a1-e03 |
| uhrzeit | Uhrzeit | die Uhr, die Stunde, die Minute, halb, Viertel, spät | a1-e04 |
| kalender | Tage, Monate, Jahreszeiten | der Montag, das Wochenende, der Monat, der Mai, der Sommer, der Geburtstag | a1-e04, a2-e11 |
| lebensmittel | Lebensmittel | das Brot, der Reis, die Linsen, das Hähnchen, der Käse, das Ei | a1-e05, b1-e11 |
| getraenke | Getränke | das Wasser, der Tee, der Saft, der Ayran, die Milch, die Limonade | a1-e05 |
| mahlzeiten | Mahlzeiten und Tisch | das Frühstück, das Mittagessen, das Abendessen, der Teller, der Löffel, Guten Appetit | a1-e05 |
| obst-gemuese | Obst und Gemüse | der Apfel, die Banane, die Tomate, die Gurke, die Zwiebel, die Kartoffel | a1-e06 |
| einkaufen | Einkaufen und Preise | der Markt, der Preis, der Euro, die Kasse, die Tüte, teuer | a1-e06, b2-e16 |
| mengen | Mengen und Verpackungen | das Kilo, das Gramm, die Flasche, die Packung, das Stück, der Liter | a1-e06, b1-e11 |
| schule | Schule und Schulsachen | die Klasse, das Heft, der Stift, die Tafel, die Pause, die Hausaufgabe | a1-e07 |
| schulfaecher | Schulfächer | Mathe, Deutsch, Englisch, Sport, Kunst, Biologie | a1-e07 |
| unterricht | Sprache im Unterricht | lesen, schreiben, wiederholen, erklären, zuhören, die Seite | a1-e07 |
| freizeit | Freizeit und Hobbys | lesen, malen, backen, Schach spielen, wandern, basteln | a1-e08, a2-e01 |
| sport | Sport | der Ball, die Mannschaft, das Schwimmbad, Fußball, laufen, gewinnen | a1-e08, a2-e08 |
| stadt | Orte in der Stadt | der Bahnhof, das Rathaus, die Bibliothek, der Park, die Apotheke, die Bäckerei | a1-e09, b2-e13 |
| weg | Wegbeschreibung | links, rechts, geradeaus, die Ampel, die Kreuzung, die Brücke | a1-e09 |
| verkehrsmittel | Verkehrsmittel | der Bus, der Zug, das Fahrrad, das Auto, zu Fuß, die Haltestelle | a1-e09, a2-e02, b1-e09 |
| kleidung | Kleidung | die Jacke, die Hose, das Kleid, der Pullover, die Schuhe, die Mütze | a1-e10, a2-e06 |
| farben | Farben | rot, blau, grün, gelb, schwarz, weiß | a1-e10, a2-e06 |
| wetter | Wetter | die Sonne, der Regen, der Schnee, der Wind, warm, kalt | a1-e10 |
| koerper | Körperteile | der Kopf, der Bauch, der Arm, das Bein, die Hand, der Zahn | a1-e11, a2-e05, b1-e03 |
| arzt | Beim Arzt und in der Apotheke | die Ärztin, die Praxis, der Termin, das Fieber, der Husten, die Tablette | a1-e11, a2-e05, b2-e06 |
| berufe | Berufe | der Koch, die Krankenpflegerin, der Busfahrer, die Ingenieurin, der Elektriker, die Verkäuferin | a1-e12, a2-e13 |
| tagesablauf | Tagesablauf | aufstehen, frühstücken, anfangen, abholen, einkaufen, schlafen | a1-e12 |
| arbeitsorte | Arbeitsorte | das Büro, die Werkstatt, das Krankenhaus, die Kantine, das Geschäft, die Baustelle | a1-e12 |
| vergangenheit | Zeitangaben für Vergangenes | gestern, vorgestern, letzte Woche, am Wochenende, früher, damals | a2-e01, b1-e01 |
| bahnreise | Mit Bus und Bahn | die Fahrkarte, das Gleis, die Abfahrt, die Verspätung, umsteigen, der Anschluss | a2-e02 |
| feste | Familienfeste und Geschenke | das Geschenk, der Gast, die Einladung, die Hochzeit, die Geburt, gratulieren | a2-e03 |
| umzug | Umzug und Einrichten | der Umzug, der Karton, einziehen, tragen, aufbauen, einrichten | a2-e04 |
| haushalt | Haushalt | putzen, aufräumen, waschen, der Staubsauger, die Waschmaschine, der Müll | a2-e04, a2-e07, b1-e04 |
| praxis | In der Arztpraxis | die Versichertenkarte, das Wartezimmer, das Rezept, die Sprechzeit, sich erkälten, die Krankmeldung | a2-e05 |
| einkauf-kleidung | Kleidung kaufen | die Größe, die Umkleidekabine, anprobieren, umtauschen, eng, weit | a2-e06 |
| nachbarschaft | Nachbarschaft und Hausordnung | die Nachbarin, das Treppenhaus, die Hausordnung, die Ruhezeit, klingeln, leihen | a2-e07 |
| verein | Sport im Verein | das Training, die Trainerin, das Turnier, die Anmeldung, das Tor, der Verein | a2-e08, b1-e06 |
| formulare | Formulare | das Formular, der Familienname, das Geburtsdatum, die Unterschrift, ausfüllen, die Staatsangehörigkeit | a2-e09, b1-e13 |
| amt | Beim Amt | das Bürgeramt, die Wartenummer, der Ausweis, der Reisepass, die Anmeldung, die Sachbearbeiterin | a2-e09, b1-e16 |
| digital | Handy und Nachrichten | das Handy, die Nachricht, das Passwort, der Akku, speichern, löschen | a2-e10, b1-e05, b1-e14 |
| anleitung | Anleitungen verstehen | zuerst, danach, zum Schluss, drücken, einschalten, auswählen | a2-e10 |
| reise | Reisen und Ferien | der Koffer, der Flughafen, die Ferien, das Gepäck, packen, übernachten | a2-e11, b1-e08 |
| natur | Natur | der Wald, die Wiese, der Fluss, der Baum, die Blume, der Berg | a2-e12, b1-e15 |
| tiere | Tiere | die Katze, der Vogel, das Pferd, das Schaf, die Ente, der Igel | a2-e12 |
| muell | Müll trennen | der Biomüll, das Altpapier, der Glascontainer, die Pfandflasche, trennen, die Tonne | a2-e12, b1-e15 |
| arbeitswelt | Arbeitsalltag | der Kollege, die Chefin, die Arbeitszeit, die Schicht, verdienen, der Feierabend | a2-e13, b1-e02, b1-e10, b2-e02 |
| gefuehle | Gefühle | froh, traurig, wütend, stolz, enttäuscht, Angst haben | a2-e14, b1-e07 |
| freundschaft | Freundschaft und Streit | sich streiten, sich entschuldigen, sich vertragen, trösten, vertrauen, zusammenhalten | a2-e14, b1-e07 |
| erinnerungen | Erinnerungen und Lebensgeschichte | die Kindheit, sich erinnern, die Erinnerung, das Fotoalbum, aufwachsen, auswandern | b1-e01 |
| ausbildung | Ausbildung und Praktikum | die Ausbildung, das Praktikum, der Betrieb, die Berufsschule, die Bewerbung, der Lebenslauf | b1-e02, b2-e01 |
| gesundheit-vorbeugung | Gesund leben | die Vorsorge, die Bewegung, die Ernährung, der Schlaf, der Stress, sich ernähren | b1-e03 |
| reparatur | Reparaturen in der Wohnung | die Heizung, der Wasserhahn, kaputt, reparieren, der Hausmeister, die Hausverwaltung | b1-e04 |
| internet-sicherheit | Sicherheit im Netz | die Daten, die Einstellung, privat, melden, der Schutz, gefälscht | b1-e05, b2-e05 |
| ehrenamt | Ehrenamt | freiwillig, die Feuerwehr, die Nachhilfe, sich engagieren, die Lebensmittelausgabe, das Nachbarschaftszentrum | b1-e06, b2-e12 |
| schule-eltern | Schule und Eltern | das Zeugnis, die Note, der Elternabend, die Klassenfahrt, der Klassenrat, die Schulform | b1-e07 |
| reise-planung | Reisen planen | die Unterkunft, buchen, die Verbindung, der Ausflug, die Rückfahrt, stornieren | b1-e08 |
| fuehrerschein | Führerschein und Straßenverkehr | der Führerschein, die Fahrschule, die Prüfung, die Vorfahrt, das Verkehrsschild, die Umleitung | b1-e09 |
| team | Arbeit im Team | das Team, die Besprechung, die Aufgabe, die Verantwortung, zusammenarbeiten, die Kundin | b1-e10, b2-e15 |
| kochen | Kochen und Rezepte | das Rezept, schneiden, braten, die Zutat, der Backofen, würzen | b1-e11 |
| bank | Bank und Konto | das Konto, die Überweisung, die Bankkarte, der Kontoauszug, die Geheimzahl, abheben | b1-e12, b2-e10 |
| post | Post und Pakete | der Brief, das Paket, die Briefmarke, der Absender, die Sendung, abholen | b1-e12 |
| antraege | Anträge und Fristen | der Antrag, die Frist, die Bescheinigung, der Bescheid, beantragen, die Unterlagen | b1-e13, b2-e04, b2-e08, c1-e07 |
| erfindungen | Erfindungen und Geräte | die Erfindung, das Gerät, entwickeln, der Strom, der Bildschirm, das Mikroskop | b1-e14, b2-e09 |
| klima-energie | Klima und Energie im Alltag | das Klima, die Energie, der Stromverbrauch, sparen, die Solaranlage, erneuerbar | b1-e15, b2-e07 |
| gemeinde | Gemeinde und Grundrechte | die Gemeinde, das Rathaus, die Stadtverordneten, die Wahl, das Grundgesetz, das Recht | b1-e16, b2-e14 |
| bewerbung | Bewerbung | das Anschreiben, das Vorstellungsgespräch, die Qualifikation, die Stärke, die Stellenanzeige, das Arbeitszeugnis | b2-e01 |
| arbeitsrecht | Rechte und Pflichten im Beruf | der Arbeitsvertrag, die Probezeit, die Kündigungsfrist, der Urlaubsanspruch, die Überstunde, der Betriebsrat | b2-e02, c1-e02 |
| wohnformen | Wohnformen | das Mehrgenerationenhaus, barrierefrei, die Wohngemeinschaft, die Nebenkosten, die Vermieterin, die Kaution | b2-e03 |
| vertraege | Verträge | der Vertrag, die Laufzeit, kündigen, der Widerruf, die Bedingung, unterschreiben | b2-e04, c1-e04 |
| nachrichten | Nachrichten und Quellen | die Meldung, die Quelle, die Schlagzeile, berichten, die Falschmeldung, überprüfen | b2-e05, c1-e05 |
| pflege | Pflege von Angehörigen | die Pflege, pflegebedürftig, der Pflegedienst, die Angehörigen, die Entlastung, die Krankenkasse | b2-e06, c1-e11 |
| klimaschutz | Klimaschutz vor Ort | der Klimaschutz, die Wärmepumpe, der Verbrauch, dämmen, nachhaltig, die Hausversammlung | b2-e07, c1-e06 |
| anerkennung | Anerkennung und Weiterbildung | die Anerkennung, der Abschluss, die Weiterbildung, der Nachweis, die Behörde, gleichwertig | b2-e08 |
| forschung | Forschung | die Forschung, das Labor, die Studie, das Ergebnis, untersuchen, der Fortschritt | b2-e09, c1-e03 |
| finanzen | Haushaltsgeld | das Haushaltsbuch, die Ausgaben, die Einnahmen, die Versicherung, der Dauerauftrag, die Rechnung | b2-e10 |
| mehrsprachigkeit | Mehrsprachigkeit | die Familiensprache, zweisprachig, der Dialekt, übersetzen, die Herkunftssprache, der Sprachwechsel | b2-e11, c1-e01 |
| engagement | Verantwortung im Ehrenamt | die Verantwortung, die Freiwilligen, die Organisation, der Einsatz, die Initiative, die Sitzung | b2-e12, c1-e10 |
| stadtgeschichte | Stadtgeschichte | die Altstadt, das Fachwerkhaus, das Handwerk, das Jahrhundert, das Museum, die Stadtführung | b2-e13, c1-e08 |
| rechtsstaat | Rechtsstaat und Gericht | das Gericht, die Richterin, das Gesetz, das Urteil, die Gewaltenteilung, die Zeugin | b2-e14, c1-e09 |
| digitale-arbeit | Digitale Arbeitswelt | das Homeoffice, die Videokonferenz, der Datenschutz, die Software, die Erreichbarkeit, die Tagesordnung | b2-e15, c1-e13 |
| verbraucherrechte | Verbraucherrechte | die Reklamation, die Gewährleistung, der Umtausch, die Garantie, der Mangel, die Verbraucherberatung | b2-e16 |
| identitaet | Herkunft und Zugehörigkeit | die Zugehörigkeit, die Heimat, die Herkunft, prägen, die Vielfalt, die Generation | c1-e01, c1-e14 |
| verhandlung | Verhandeln | verhandeln, der Kompromiss, das Angebot, die Forderung, das Gehalt, einlenken | c1-e02, c1-e12 |
| wissenschaftssprache | Wissenschaftssprache | die These, die Methode, die Hypothese, belegen, die Grafik, die Schlussfolgerung | c1-e03 |
| kleingedrucktes | Geschäftsbedingungen und Datenschutz | die Geschäftsbedingungen, die Klausel, der Haftungsausschluss, die Einwilligung, die Datenschutzerklärung, unwirksam | c1-e04 |
| debatte | Debatte und Meinung | das Argument, der Standpunkt, die Debatte, widerlegen, der Leserbrief, abwägen | c1-e05 |
| nachhaltigkeit | Nachhaltiges Wirtschaften | die Kreislaufwirtschaft, die Ressource, verschwenden, die Wiederverwertung, die Lieferkette, regional | c1-e06 |
| amtssprache | Amtssprache | der Bescheid, der Widerspruch, die Rechtsbehelfsbelehrung, fristgerecht, die Zuständigkeit, das Aktenzeichen | c1-e07 |
| literatur | Literatur und Sprichwörter | das Sprichwort, die Erzählung, das Gedicht, die Erzählerin, die Metapher, die Redewendung | c1-e08 |
| beteiligung | Bürgerbeteiligung | die Bürgerbeteiligung, die Bürgerversammlung, mitbestimmen, die Abstimmung, die Stellungnahme, der Einwohnerantrag | c1-e09 |
| projekt | Projektarbeit | das Projekt, der Zeitplan, die Zuständigkeit, das Protokoll, das Ziel, auswerten | c1-e10 |
| generationen | Generationen | die Generation, der Ruhestand, die Rente, der demografische Wandel, die Lebenserwartung, solidarisch | c1-e11 |
| praesentation | Präsentieren | die Präsentation, die Folie, das Publikum, überzeugen, zusammenfassen, die Rückfrage | c1-e12 |
| technikethik | Technik und Verantwortung | die Verantwortung, die Automatisierung, die Barrierefreiheit, der Algorithmus, die Nachvollziehbarkeit, abwägen | c1-e13 |
| lebenswege | Lebens- und Bildungswege | der Werdegang, der Rückblick, das Vorhaben, sich weiterentwickeln, der Ausblick, das lebenslange Lernen | c1-e14 |

## 7 Vorkurs Lateinschrift

Sechs Lektionen für Arabischsprachige vor A1 (PLAN §5.1: „6 Latein“), dazu eine Hinweislektion für Türkischsprachige. Übungstyp `schrift_latein` (PLAN §4), mit Sprachausgabe.

| Schlüssel | Titel | für | Ziel | Inhalt |
|---|---|---|---|---|
| de.v.l01 | Das lateinische Alphabet | ar | Ich kann die 26 Buchstaben des lateinischen Alphabets erkennen, ihre Namen sagen und von links nach rechts lesen. | 26 Buchstaben in Druckschrift, Schreib- und Leserichtung von links nach rechts; Buchstabennamen (a, be, ze …) und ihr häufigster Laut; Formen, die leicht verwechselt werden: b/d, p/q, n/u, m/w, i/j; Ziffern 0–9 in europäischer Form; Hörübung: Buchstaben erkennen; Schreibübung: Buchstaben nachspuren |
| de.v.l02 | Groß und klein | ar | Ich kann Groß- und Kleinbuchstaben einander zuordnen und weiß, wann man im Deutschen großschreibt. | Groß- und Kleinbuchstaben als Paare (A/a, B/b …); Großschreibung am Satzanfang, bei Namen und bei allen Nomen; Wörter in Groß- und Kleinschreibung wiedererkennen (TEE, Tee, tee); Hinweis: Die arabische Schrift kennt keine Großbuchstaben, die lateinische schon |
| de.v.l03 | Umlaute und ß | ar | Ich kann ä, ö, ü und ß lesen, aussprechen und von a, o, u und s unterscheiden. | ä, ö, ü mit Punkten; Aussprache und Hörunterschied zu a, o, u; ß nach langem Vokal und Doppellaut, ss nach kurzem Vokal (Straße, Wasser); Ersatzschreibung ae, oe, ue, ss auf Tastaturen ohne Umlaute; Minimalpaare: schon/schön, Mutter/Mütter |
| de.v.l04 | Vokale: e und i, o und u | ar | Ich kann die Vokale e und i sowie o und u beim Hören und Lesen sicher unterscheiden. | Fünf Vokalbuchstaben, lange und kurze Vokale (Doppelbuchstaben, ie, Dehnungs-h); Minimalpaare e/i: liegen/legen, wieder/weder, Mieter/Meter; Minimalpaare o/u: Ohr/Uhr, Tor/Tour, Kohle/Kuhle; Hinweis: Im Arabischen gibt es drei Vokalqualitäten, im Deutschen deutlich mehr |
| de.v.l05 | p und b, f, v und w | ar | Ich kann p und b hören und schreiben und weiß, wie f, v und w ausgesprochen werden. | p und b: packen/backen, Paar/Bar, Gepäck/Gebäck; f und v klingen meist gleich (Vater, Fenster); v wie w in Fremdwörtern (Vase); w als stimmhafter Laut (Wasser, Wetter); Hinweis: Das Hocharabische kennt kein p und keinen Laut wie das deutsche w (ein stimmhaftes f); das arabische w klingt wie das englische |
| de.v.l06 | Buchstabenverbindungen und erstes Lesen | ar | Ich kann häufige Buchstabenverbindungen lesen, kurze Wörter vorlesen und meinen Namen in Lateinschrift schreiben. | sch, ch, ei, ie, eu/äu, st und sp am Wortanfang, ck, tz; Doppelte Konsonanten zeigen einen kurzen Vokal (Bett, kommen); Erste Wörter aus A1: Name, Tee, Brot, Schule; Den eigenen Namen und die Wohnstadt in Lateinschrift schreiben |
| de.v.l07 | Hinweis für Türkischsprachige: ä, ö, ü, ß und Großschreibung | tr | Ich kenne die Unterschiede zwischen türkischer und deutscher Schreibung, die beim Lesen und Schreiben am häufigsten stören. | ö und ü wie im Türkischen; neu sind ä (offenes e) und ß (scharfes s); Alle Nomen werden großgeschrieben, nicht nur Namen und Satzanfänge; Unterschiede: z spricht man ts, s vor Vokal stimmhaft, sch statt ş, tsch statt ç, j wie türkisches y; Das große I hat im Deutschen keinen Punkt und entspricht dem türkischen İ; ı gibt es nicht; ei, ie und eu als feste Buchstabenverbindungen |

## 8 Mengen und Prüfungen

| Stufe | Einheiten | Stationen | Lemmata | Sätze | Geschichten und Dialoge | Lesetexte | Sprechen | Schreiben |
|---|---|---|---|---|---|---|---|---|
| A1 | 12 | 96 | 600 | 2.400 | 24 | 6 | 24 | 0 |
| A2 | 14 | 112 | 900 | 3.600 | 28 | 14 | 28 | 14 |
| B1 | 16 | 128 | 1.300 | 5.200 | 32 | 32 | 32 | 16 |
| B2 | 16 | 128 | 1.700 | 6.800 | 32 | 48 | 32 | 32 |
| C1 | 14 | 112 | 2.000 | 8.000 | 28 | 56 | 28 | 28 |
| **Σ** | **72** | **576** | **6.500** | **26.000** | **144** | **156** | **144** | **90** |

Verteilung je Einheit: zwei Geschichten oder Dialoge (die Geschichte der Station und ein Dialog in einer Lektion), zwei Sprechaufgaben; Lesetexte A1 in jeder zweiten Einheit, A2 einer, B1 zwei, B2 drei, C1 vier; Schreiben A2 und B1 eine, B2 und C1 zwei Aufgaben. Mehrere Angaben stehen im JSON als nummerierte Teile „1) … 2) …“ in einem Feld.

Sätze stehen im JSON nur je Stufe. Gleichmäßig verteilt sind das A1 200, A2 ≈ 257, B1 325, B2 425 und C1 ≈ 571 Sätze je Einheit (RF-07).

**Automatisch geprüft (Generator im Scratchpad, siehe §14):**
- Einheitenzahl, Lemma-Summen und alle Mengen je Stufe gleich PLAN §5.1: ja
- Jede Grammatik-ID genau einmal eingeführt, Stufe passend, später wiederholt, Voraussetzungen vorher eingeführt: ja
- Keine Einheit ohne Grammatik und Wortfeld, jedes Wortfeld benutzt: ja
- Thema jeder Einheit im Leitfaden und für die Stufe vorgesehen; A1–B1 kindgeeignet; nicht kindgeeignete Themen nie als kindgeeignet markiert: ja
- Alle Vornamen und Familiennamen aus der Namensliste, keine ausgeschlossenen Namen, keine Familiennamen in A1: ja
- Tabu-Lexikon des Leitfadens (de) über alle Texte des JSON: 0 Treffer; dazu 6 Fehlalarme durch „buchstabieren“ (Teilwort-Treffer der Kategorie `alkohol_rauschmittel`; die Ausnahme fehlt im Leitfaden, §9.3).
- Arabische Schrift (U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF) in beiden Dateien: 0.

## 9 Abdeckung der Häufigkeitslisten

### 9.1 Methode

- **Rangliste:** wordfreq 3.1.1 (de, `large`, Top 50.000 aus dem S7-Auszug). Die Liste faltet Groß/Klein und ß → ss.
- **Lemmatisierung:** über den kaikki-Kernauszug (`kaikki-kern-de-top20000.jsonl`): Seitentitel, Stammformen und Plural, dazu Endungsregeln für Verben, Adjektive und Nomen und eine Liste häufiger Sonderformen (habe → haben, würde → werden). Ergebnis: 13.541 Lemmata nach Bereinigung. Die Zuordnung ist eine Näherung; sie wird in L3 mit den Formtabellen geschärft.
- **Ausgeschlossen** (in den Top 5.000 der Lemma-Rangliste): Tabu-Lexikon 80, Religionsbegriffe 36, anstößiges Register 7, Eigennamen und Abkürzungen 50. Zusammen machen sie 4,7 % der laufenden Wörter aus.
- **Kernliste:** die 500 häufigsten alltagstauglichen Lemmata. Dafür fallen zusätzlich Wörter der Öffentlichkeit, Politik, Wirtschaft und Schriftsprache weg (in den Top 1.000: 191), z. B. Regierung, Unternehmen, insbesondere, jedoch. Sie kommen ab B1.
- **Modell:** A1 = Pflichtwörter der A1-Wortfelder plus die häufigsten Wörter der Kernliste bis 600. Ab A2 stammen 35 / 40 / 45 / 50 % der neuen Lemmata aus Themenwortschatz jenseits der Rangfolge, der Rest folgt der Rangfolge. Die Zielwerte liegen mit Abstand unter den Modellwerten, weil die Einheiten eigenen Themenwortschatz brauchen.

### 9.2 Zahlen und Zielwerte

| Stufe | Lemmata kumuliert | Kernliste 500 | Top-1.000 | Top-2.000 | Top-5.000 | Textabdeckung | Zielwert (abdeckungZiel) |
|---|---|---|---|---|---|---|---|
| A1 | 600 | 99,8 % | 51,6 % | 27,6 % | 11,8 % | 70,4 % | Kern ≥ 85 % (90 %), 1.000 ≥ 45 %, 2.000 ≥ 25 %, 5.000 ≥ 10 % |
| A2 | 1.500 | 100 % | 68,2 % | 56,9 % | 26,6 % | 75,4 % | Kern ≥ 98 %, 1.000 ≥ 65 %, 2.000 ≥ 50 %, 5.000 ≥ 25 % |
| B1 | 2.800 | 100 % | 100 % | 95,8 % | 47,4 % | 84,3 % | 1.000 ≥ 95 %, 2.000 ≥ 85 %, 5.000 ≥ 45 % |
| B2 | 4.500 | 100 % | 100 % | 100 % | 73,8 % | 88,4 % | 1.000 ≥ 98 %, 2.000 ≥ 95 %, 5.000 ≥ 70 % |
| C1 | 6.500 | 100 % | 100 % | 100 % | 100 % | 91,2 % | 2.000 ≥ 98 %, 5.000 ≥ 90 % |

**A1 im Einzelnen:** Die Wortfelder der zwölf A1-Einheiten verlangen 185 Pflichtwörter (Zahlen, Wochentage, Familie, Räume, Lebensmittel, Kleidung, Körper, Orte). Davon liegen 84 in der Kernliste, 30 auf Rang 501–1.000, 30 auf Rang 1.001–2.000, 31 auf Rang 2.001–5.000 und 10 darüber (z. B. Hähnchen, Haltestelle, Hausaufgabe).

Mit 600 Lemmata deckt A1 damit die Kernliste fast vollständig ab und hat etwa 100 Plätze für Themenwörter. Der Zielwert ≥ 85 % lässt rund 75 weitere Plätze für Wörter, die einzelne Geschichten brauchen.

**Tatoeba-Probe:** Von 19.519 deutschen Tatoeba-Sätzen mit höchstens acht Wörtern bestehen 4.320 (22,1 %) nur aus Wörtern der Modellmenge A1 und 5.817 (29,8 %) aus der Modellmenge A2. Sätze mit Namen zählen dabei als nicht abgedeckt; die Werte sind also Untergrenzen. Übernommen wird nur nach Standardfilter S7-E3 und Leitfaden (G-14).

### 9.3 Befunde für L3

- **Registermarken aus kaikki:** Die Marke `mk` auf Eintragsebene trifft Alltagswörter, weil schon eine einzige Bedeutung mit Register reicht: machen, Mensch, nichts, Person, Verein, Apotheke, Kartoffel, Katze. Zählt man je Bedeutung (Treffer erst, wenn mindestens die Hälfte der Glossen anstößig markiert ist), bleiben nur echte Fälle. Vorschlag für `lernapp:pruefen` und Leitfaden §2.4 (RF-10).
- **Religionsthema aus kaikki:** `thema:religion` steht auch bei leben, Welt, Vater, Gemeinde, Himmel, Wort. Es taugt nur als Hinweis, nicht als Ausschluss; für die Messung wurde eine Handliste religiöser Begriffe benutzt.
- **Formen:** Der Kernauszug enthält nur Stammformen. Für die Wortschatzprüfung (Token-Lemma eingeführt ≤ Einheit, PLAN §6.4) braucht das Werkzeug zusätzlich Endungsregeln oder die vollen Formtabellen.
- **Tabu-Lexikon:** „buchstabieren“ (A1-Wortschatz) löst einen Teilwort-Treffer der Kategorie `alkohol_rauschmittel` aus; im Leitfaden fehlt die Ausnahme „buchstabier“. Vorschlag: Ausnahme ergänzen.
- **Faltung:** wordfreq schreibt ß als ss und alles klein; Nomen und Verben gleicher Form (Essen/essen) fallen zusammen.

## 10 Kandidaten mit Religionsbezug

Kandidaten sind kein Lernziel, zählen nicht ins Lemma-Budget, haben keine Sprachausgabe und bleiben unsichtbar, bis zwei Personen mit `religioese_pruefung` sie zum aktuellen Inhalts-Hash freigegeben haben (KERN §2.3, Leitfaden §4). Jede Lektion ist ohne sie vollständig.

| Einheit | Kandidat | Bedeutung (Leitfaden) |
|---|---|---|
| de.a2.e01 | R-11 | Unterricht: Koranunterricht – nur als Wochentermin von Kindern; kein Inhalt (ab A2) |
| de.a2.e03 | R-06 | Fest: Ramadanfest, Opferfest – als Familienfest, Besuch, Geschenk (ab A2) |
| de.a2.e13 | R-10 | Beruf: Imam, Pfarrer – nur als Beruf in einer Berufsliste; tr hoca heißt auch allgemein „Lehrer“ (ab A2) |
| de.b1.e01 | R-05 | Ereignis: Fastenbrechen – als Familienessen und Einladung (ab A2) |
| de.b1.e08 | R-12 | Reise: Pilgerfahrt – nur als Familienereignis (Abschied, Rückkehr, Besuch) (ab B1) |
| de.b1.e11 | R-09 | Speise: halal – Kennzeichnung beim Einkauf (OF-13); tr „helal olsun“ ist eine Formel (F-tr-12) (ab A2) |
| de.b2.e13 | R-01 | Ort: Moschee – als Ort im Stadtplan oder Treffpunkt (ab A2) |
| de.b2.e13 | R-02 | Ort: Kirche, Synagoge – gleich behandelt wie R-01 (OF-06) (ab A2) |
| de.c1.e01 | F-de-02 | Formel „Grüß Gott“ – nur passiv ab B2 (regionale Varianten) |

## 11 Kontrastive Schwerpunkte

Die ausführlichen Kontrastdokumente entstehen je Richtung (`_lernapp/lehrplan/kontrast-<richtung>.md`). Für den Rahmen sind diese Punkte maßgeblich:

| Bereich | aus Türkisch (de-aus-tr) | aus Arabisch (de-aus-ar) |
|---|---|---|
| Schrift | Lateinschrift bekannt; neu: ä, ß, Großschreibung der Nomen, z = ts, sch/tsch statt ş/ç (Vorkurs l07) | Lateinschrift neu, Leserichtung, Groß- und Kleinbuchstaben (Vorkurs l01–l06) |
| Laute | Konsonantenhäufungen am Wortanfang (Straße, Spiel), e/ä | e/i, o/u, p/b, f/v/w, Umlaute |
| Artikel und Genus | kein Genus, kein bestimmter Artikel (bir ohne Genus): Artikel von Anfang an mitlernen | zwei Genera, unveränderlicher Artikel: Genus weicht oft ab |
| Verbstellung | Verb am Satzende vertraut (Nebensatz), neu: Verb an Position 2 | Verb oft am Satzanfang: V2, Satzklammer und Endstellung neu |
| Kopula | „sein“ als Endung, im Deutschen eigenes Verb | im Präsens keine Kopula: „sein“ früh üben |
| Kasus | Kasusendungen am Nomen; im Deutschen am Artikel, dazu Präpositionen statt Nachstellungen | Kasus in der Hochsprache vorhanden, aber anders markiert; vier Fälle am Artikel |
| Besitz | Possessivendung am Nomen; im Deutschen Possessivartikel davor | Pronomen-Suffix; im Deutschen Possessivartikel davor |

## 12 Offene Fragen

Alle laufen mit ihrem Standard weiter (L3-E12, kein Warten).

| ID | Frage | Standard | Wer |
|---|---|---|---|
| RF-01 | PLAN §5.1 sieht in A2 14 Schreibaufgaben vor, PLAN §4 nennt den Übungstyp `schreiben` erst ab B1. | A2 nutzt `schreiben` mit kurzer Prüfliste (25–50 Wörter, Musterlösung, Selbsteinschätzung), ohne Abgabe an die Lehrkraft; PLAN §4 wird nachgezogen. | Orchestrator (L2/L3) |
| RF-02 | Familiennamen der Figuren erst ab A2 (Leitfaden §1.1)? Buchstabieren und Anmelden sind typische Erstbedürfnisse. | Wie Leitfaden: A1 nur Vornamen und Rollen (die Lehrerin, die Ärztin); Familienname im Formular ab A2-e09. | Redaktion / LM-09 |
| RF-03 | Schreibweise arabischer Vornamen im deutschen Zieltext: DIN-Umschrift mit Zeichen wie ā, Ḫ oder eine verbreitete Schreibweise ohne Diakritika? | Im deutschen Zieltext verbreitete Schreibweise ohne Diakritika (z. B. Layla, Khalid, Rana, Kamal, Nisrin); im Rahmen und in der Werkstatt DIN-Umschrift. | Prüfperson LM-02 / LM-09 |
| RF-04 | `kinderGeeignet` in B2 und C1: Der Rahmen setzt `true` bei 7 B2- und 8 C1-Einheiten, deren Thema kindgeeignet ist und die kein Erwachsenenthema aus Leitfaden §6 berühren. | So; endgültig erst, wenn der Prüfer alle Einträge der Einheit geprüft hat. Anzeige für Kinderkonten nach OF-15 (L7). | Redaktion / L7 |
| RF-05 | Feldnamen und Mehrfachangaben für das Schema (L3-02): `kinderGeeignet` heißt im Leitfaden `kindgeeignet`; mehrere Lesetexte, Aufgaben und Geschichten stehen nummeriert in einem String. | Schema übernimmt die Struktur dieses Rahmens und zählt die Nummern; eine Umstellung auf Listen nur gemeinsam für de, tr und ar. | Orchestrator (L3-02) |
| RF-06 | Was zählt ins Lemma-Budget? | Ländernamen, Zahlwörter und feste Wendungen ja; Personennamen und Kandidaten mit Religionsbezug nein. | L3 / LM-02 |
| RF-07 | Sätze je Einheit (der Rahmen nennt sie nur je Stufe). | Gleichmäßig verteilt, ±10 %. | L3 |
| RF-08 | Stufengrenzen, die von verbreiteten Plänen abweichen können: Präteritum von sein, haben und der Modalverben in A2; Konjunktiv II als Höflichkeitsformel ab A2; Plusquamperfekt und Genitiv in B1; Futur II und Konjunktiv II der Vergangenheit in B2; subjektive Modalverben in C1. | Wie im Entwurf. | Prüfperson LM-02 |
| RF-09 | Stundenpläne in A1-e07 ohne das Fach Musik (Folge aus OF-01); deutsche Stundenpläne enthalten es meist. | Nach OF-01: ohne Musik. | LM-09 |
| RF-10 | Registerfilter aus kaikki trifft Alltagswörter (§9.3). | Leitfaden gilt weiter (Befund an Menschen); Vorschlag für L3: Wertung je Bedeutung ab 50 % anstößiger Glossen. | L3 / Redaktion |
| RF-11 | Sollen Kandidaten mit Religionsbezug überhaupt im Rahmenplan stehen (§10)? | Ja, nur als Markierung; unsichtbar bis zwei Freigaben. | zwei Personen mit `religioese_pruefung` (LM-03, LM-09) |

## 13 Abnahme durch die Prüfperson (LM-02)

- [ ] Die Grammatikfolge ist für Lernende mit Türkisch oder Arabisch schlüssig; Stufengrenzen passen (RF-08).
- [ ] Themen und Geschichten passen zur Gemeinde und zum Leben in Deutschland; nichts verstößt gegen den Leitfaden.
- [ ] Die Kann-Beschreibungen sind verständlich, eigen formuliert und erreichbar.
- [ ] Lemma-Budgets und Abdeckungsziele sind plausibel.
- [ ] Der Vorkurs deckt die Lateinschrift für Arabischsprachige ab; der Hinweis für Türkischsprachige ist vollständig.
- [ ] Offene Fragen RF-01…RF-11 sind entschieden oder bewusst beim Standard belassen.

## 14 Herkunft und Werkzeuge

- Entwurf: KI-Lauf `ki:l3-rahmen` (Feld `quelle`).
- Messung und Generator liegen im Scratchpad unter `l3-rahmen-de/` (`lemmata.py`, `bereinigt.py`, `machbarkeit.py`, `bauen.py`, Inhaltsdaten `daten_*.py`), alle mit `python3 -I`. Die Übernahme nach `_lernapp/werkzeuge/` ist für L3 vorgeschlagen.
- Gelesen wurden nur die S7-Auszüge (Häufigkeit, kaikki-Kern, Tatoeba). In die Dateien gelangen davon nur Zahlen und deutsche Wortbeispiele.
- Lektorat (20.10.2026, frischer KI-Lauf): Zahlen, Struktur, Grammatikfolge und Voraussetzungen ohne Befund. Berichtigt: drei Grammatikbeispiele (um Hilfe bitten; Redewiedergabe nach „wie … betont“ im Indikativ, daher Beispiel mit Konjunktiv I ohne „wie“; je nachdem, ob), Lesetext B2-e12 kindgerecht (Übung der Jugendfeuerwehr statt Katastrophenschutz), Figur Thomas ohne Familiennamen (Leitfaden §1.1), Aussage zum türkischen Artikel (bir), Buchstabenname ze im Vorkurs, Prüfvermerke zum Tabu-Lexikon nur mit Kategorien.

## Anhang: Einheiten im Einzelnen

### A1

#### de.a1.e01 · Hallo, wer bist du?

- **Thema:** Begrüßung und Vorstellung · **Budget:** 40 · **Kind:** ja
- **Kann:** Ich kann Menschen zu verschiedenen Tageszeiten begrüßen und mich verabschieden. · Ich kann sagen, wie ich heiße, woher ich komme, wo ich wohne und welche Sprachen ich spreche. · Ich kann meinen Namen buchstabieren und andere nach ihrem Namen fragen.
- **Sprechhandlungen:** begrüßen und verabschieden, sich vorstellen, nach Name, Herkunft und Wohnort fragen, buchstabieren, sich bedanken und entschuldigen
- **Geschichte und Dialog:** 1) Geschichte: Erster Schultag nach den Sommerferien in Wetzlar; Laylā ist neu in der Klasse, Elif und Jan begrüßen sie auf dem Schulhof und stellen sich vor. 2) Dialog: Laylās Mutter Ranā und der Nachbar Konrad lernen sich im Treppenhaus kennen (Sie-Form, Namen buchstabieren).
- **Lesen:** –
- **Sprechen:** 1) Sich selbst vorstellen (Name, Herkunft, Wohnort, Sprachen) und eine Rückfrage stellen. 2) Den eigenen Namen buchstabieren.
- **Schreiben:** –

#### de.a1.e02 · Das ist meine Familie

- **Thema:** Familie und Verwandte · **Budget:** 55 · **Kind:** ja
- **Kann:** Ich kann meine Familie auf einem Foto zeigen und die Personen mit Namen, Alter und Verwandtschaft nennen. · Ich kann Zahlen bis 100 verstehen und sagen, wie alt jemand ist. · Ich kann fragen, ob jemand Geschwister hat, und darauf antworten.
- **Sprechhandlungen:** Familienmitglieder vorstellen, nach dem Alter fragen und antworten, Zahlen nennen, Ja/Nein-Fragen stellen und beantworten
- **Geschichte und Dialog:** 1) Geschichte: Elif zeigt Laylā zu Hause Fotos ihrer Familie; Oma Sevim bringt Tee und erzählt, wie viele Enkelkinder sie hat. 2) Dialog: Jan und Yazan vergleichen in der Pause ihre Geschwister.
- **Lesen:** Kurze Steckbriefe von Elifs Familie: Name, Alter, ein Hobby (sechs Zeilen).
- **Sprechen:** 1) Ein Familienfoto beschreiben: Wer ist das, wie alt ist die Person? 2) Eine andere Person fragen: Hast du Geschwister? Wie alt sind sie?
- **Schreiben:** –

#### de.a1.e03 · Bei uns zu Hause

- **Thema:** Wohnen · **Budget:** 55 · **Kind:** ja
- **Kann:** Ich kann meine Wohnung oder mein Zimmer mit einfachen Sätzen beschreiben. · Ich kann sagen, welche Möbel in einem Zimmer sind und was fehlt.
- **Sprechhandlungen:** Räume und Möbel benennen, etwas beschreiben, sagen, was fehlt, Gefallen ausdrücken
- **Geschichte und Dialog:** 1) Geschichte: Laylās Familie hat eine neue Wohnung; Laylā zeigt Elif ihr Zimmer, in dem noch kein Bett steht, nur ein Tisch und viele Kartons. 2) Dialog: Thomas und Jan suchen im Keller einen Stuhl und eine Lampe für Jans Zimmer.
- **Lesen:** –
- **Sprechen:** 1) Das eigene Zimmer beschreiben (Möbel, groß oder klein, hell oder dunkel). 2) Ein Bild beschreiben: Was ist im Zimmer, was nicht?
- **Schreiben:** –

#### de.a1.e04 · Wie spät ist es?

- **Thema:** Zahlen, Uhrzeit, Datum · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann nach der Uhrzeit fragen und sie sagen. · Ich kann Termine mit Wochentag und Uhrzeit verstehen und nennen. · Ich kann sagen, in welchem Monat ich Geburtstag habe.
- **Sprechhandlungen:** Uhrzeit erfragen und angeben, Termine nennen, sich verabreden, den Tagesablauf grob beschreiben
- **Geschichte und Dialog:** 1) Geschichte: Ein Montagmorgen bei Elif zu Hause: Murat weckt die Kinder, Elif sucht ihre Uhr, der Schulbus kommt um halb acht. 2) Dialog: Laylā und Elif verabreden sich für Mittwoch um vier Uhr in der Stadtbibliothek.
- **Lesen:** Wochenplan an der Kühlschranktür bei Jan zu Hause: Tage, Uhrzeiten, Aufgaben.
- **Sprechen:** 1) Uhrzeiten zu Bildern sagen. 2) Einen Termin für ein Treffen am Nachmittag vereinbaren.
- **Schreiben:** –

#### de.a1.e05 · Guten Appetit!

- **Thema:** Essen und Trinken (halal-neutral) · **Budget:** 55 · **Kind:** ja
- **Kann:** Ich kann sagen, was ich gern esse und trinke und was nicht. · Ich kann in der Kantine oder bei Gästen höflich sagen, was ich möchte.
- **Sprechhandlungen:** Wünsche äußern, Vorlieben und Abneigungen ausdrücken, etwas anbieten und annehmen oder ablehnen, sich bedanken
- **Geschichte und Dialog:** 1) Geschichte: Jans Familie ist bei Elifs Familie zum Abendessen eingeladen; Murat hat Linsensuppe und Reis mit Hähnchen gekocht, Jan trinkt zum ersten Mal Ayran. 2) Dialog: In der Schulkantine fragt die Köchin, was Laylā und Elif möchten.
- **Lesen:** –
- **Sprechen:** 1) Sagen, was man gern isst und trinkt und was nicht. 2) In der Kantine etwas bestellen (Ich möchte …, bitte).
- **Schreiben:** –

#### de.a1.e06 · Auf dem Wochenmarkt

- **Thema:** Einkaufen und Preise · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann auf dem Markt Obst und Gemüse mit Menge und Preis kaufen. · Ich kann nach dem Preis fragen und sagen, dass mir etwas zu teuer ist.
- **Sprechhandlungen:** nach dem Preis fragen, Mengen angeben, bezahlen, etwas ablehnen
- **Geschichte und Dialog:** 1) Geschichte: Oma Sevim und Elif kaufen am Samstag auf dem Wochenmarkt Obst und Gemüse für die Woche; am Gemüsestand gibt es keine Tomaten mehr. 2) Dialog: Ḫālid bezahlt an der Kasse im Supermarkt und fragt nach einer Tüte.
- **Lesen:** Einkaufszettel und Preisschilder vom Marktstand.
- **Sprechen:** 1) Am Marktstand Obst und Gemüse mit Menge und Preis kaufen. 2) Nach dem Preis fragen und sagen, dass etwas zu teuer ist.
- **Schreiben:** –

#### de.a1.e07 · In der Schule

- **Thema:** Schule und Lernen · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann sagen, welche Fächer ich habe und was ich gut kann. · Ich kann im Unterricht um Hilfe bitten und einfache Anweisungen verstehen.
- **Sprechhandlungen:** Fähigkeiten ausdrücken, um Hilfe bitten, Anweisungen verstehen und geben, den Stundenplan beschreiben
- **Geschichte und Dialog:** 1) Geschichte: Laylā bekommt ihren ersten Stundenplan; Jan erklärt ihr die Fächer, sie kann sehr gut rechnen, muss aber noch viele deutsche Wörter lernen. 2) Dialog: Im Unterricht bittet die Lehrerin die Klasse, die Bücher zu öffnen; Yazan hat sein Heft nicht dabei und fragt höflich nach einem Blatt.
- **Lesen:** –
- **Sprechen:** 1) Sagen, welche Fächer man hat und was man gut kann. 2) Im Unterricht um Hilfe bitten (Können Sie das bitte wiederholen?).
- **Schreiben:** –

#### de.a1.e08 · Was machst du gern?

- **Thema:** Hobbys und Freizeit (ohne Musik) · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann sagen, was ich in meiner Freizeit gern mache und was nicht. · Ich kann jemanden zu einer Aktivität einladen und zusagen oder absagen.
- **Sprechhandlungen:** Vorlieben nennen, einladen, zusagen und absagen, begründen mit denn
- **Geschichte und Dialog:** 1) Geschichte: Nachmittag im Park an der Lahn: Jan und Yazan spielen Fußball, Elif und Laylā fahren Fahrrad, Opa Kamāl spielt mit dem Nachbarn Konrad Schach auf einer Bank. 2) Dialog: Elif fragt Laylā, ob sie mit in die Bastelgruppe der Bibliothek kommen will.
- **Lesen:** Aushang der Stadtbibliothek: Angebote für Kinder am Nachmittag (Lesestunde, Schachgruppe, Bastelgruppe).
- **Sprechen:** 1) Sagen, was man in der Freizeit gern macht und was nicht. 2) Jemanden zu einer Aktivität einladen und zusagen oder absagen (mit denn begründen).
- **Schreiben:** –

#### de.a1.e09 · Wo ist die Bibliothek?

- **Thema:** Stadt und Orientierung · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann nach dem Weg fragen und eine einfache Wegbeschreibung verstehen. · Ich kann sagen, wie ich zur Schule oder zur Arbeit komme.
- **Sprechhandlungen:** nach dem Weg fragen, den Weg beschreiben, Verkehrsmittel nennen, Regeln und Verbote verstehen
- **Geschichte und Dialog:** 1) Geschichte: Ranā und Laylā suchen in der Altstadt die Stadtbibliothek; eine Frau an der Bushaltestelle erklärt ihnen den Weg über die Brücke. 2) Dialog: Murat fährt mit Elif im Bus zum Bahnhof und fragt den Fahrer, wo sie aussteigen müssen.
- **Lesen:** –
- **Sprechen:** 1) Nach dem Weg fragen und eine einfache Wegbeschreibung geben. 2) Sagen, wie man zur Schule kommt (mit dem Bus, zu Fuß, mit dem Fahrrad).
- **Schreiben:** –

#### de.a1.e10 · Was ziehe ich heute an?

- **Thema:** Kleidung · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann sagen, was ich bei welchem Wetter anziehe. · Ich kann im Geschäft Kleidung nach Farbe und Größe aussuchen und sagen, wie ich sie finde.
- **Sprechhandlungen:** Kleidung beschreiben, über das Wetter sprechen, Gefallen und Missfallen ausdrücken, sich für etwas entscheiden
- **Geschichte und Dialog:** 1) Geschichte: Es regnet und ist kalt; Elif sucht ihre Jacke, Emre gibt ihr seinen Regenschirm, und Oma Sevim strickt einen Schal. 2) Dialog: Ḫālid und Laylā kaufen im Kaufhaus eine Winterjacke; die rote Jacke gefällt Laylā, aber sie ist zu groß.
- **Lesen:** Wetterbericht für Wetzlar für drei Tage (Symbole und kurze Sätze).
- **Sprechen:** 1) Sagen, was man bei welchem Wetter anzieht. 2) Im Geschäft Kleidung nach Farbe und Größe aussuchen.
- **Schreiben:** –

#### de.a1.e11 · Ich bin krank

- **Thema:** Körper und Gesundheit · **Budget:** 50 · **Kind:** ja
- **Kann:** Ich kann sagen, wie es mir geht und was mir wehtut. · Ich kann einfache Ratschläge in der Praxis oder Apotheke verstehen.
- **Sprechhandlungen:** Befinden ausdrücken, Schmerzen benennen, einen Termin erfragen, Ratschläge verstehen
- **Geschichte und Dialog:** 1) Geschichte: Yazan hat Fieber und Halsschmerzen; Ranā ruft in der Praxis an, die Ärztin untersucht ihn und sagt, er soll im Bett bleiben und viel trinken. 2) Dialog: In der Apotheke fragt Ḫālid nach einem Mittel gegen Husten; die Apothekerin Nisrīn erklärt, wie oft man es nehmen darf.
- **Lesen:** –
- **Sprechen:** 1) Sagen, wie es einem geht und was wehtut. 2) In der Praxis anrufen und nach einem Termin fragen.
- **Schreiben:** –

#### de.a1.e12 · Berufe und mein Wochenplan

- **Thema:** Arbeit und Berufe · **Budget:** 45 · **Kind:** ja
- **Kann:** Ich kann meinen Tagesablauf und meine Woche beschreiben. · Ich kann sagen, welchen Beruf jemand hat und wo die Person arbeitet.
- **Sprechhandlungen:** den Tagesablauf beschreiben, Berufe nennen, nach Zeiten fragen, Personen beschreiben
- **Geschichte und Dialog:** 1) Geschichte: Elif stellt in der Klasse die Berufe ihrer Familie vor: Derya ist Krankenpflegerin und arbeitet manchmal nachts, Murat ist Koch in einer Kantine, und Jans Mutter Anna fährt Bus. 2) Dialog: Jan und Laylā vergleichen ihren Tagesablauf: Wann stehst du auf? Wer holt dich ab?
- **Lesen:** Kurze Berufsporträts aus der Schülerzeitung (drei Personen, je vier Sätze).
- **Sprechen:** 1) Den eigenen Tagesablauf beschreiben (Ich stehe um … auf). 2) Einen Beruf beschreiben und die anderen raten lassen.
- **Schreiben:** –

### A2

#### de.a2.e01 · Wie war dein Wochenende?

- **Thema:** Hobbys und Freizeit (ohne Musik) · **Budget:** 60 · **Kind:** ja · **Kandidaten:** R-11
- **Kann:** Ich kann erzählen, was ich am Wochenende gemacht habe. · Ich kann nachfragen, wie das Wochenende von anderen war.
- **Sprechhandlungen:** über Vergangenes berichten, nachfragen, Interesse zeigen, bewerten (Es war toll, langweilig …)
- **Geschichte und Dialog:** 1) Geschichte: Montagmorgen in der Klasse: Elif, Laylā und Jan erzählen, was sie am Wochenende gemacht haben (Kuchen gebacken, die Oma besucht, ein großes Puzzle gelegt). 2) Dialog: Derya fragt Emre, warum er am Samstag so müde war; er hat lange Fußball trainiert.
- **Lesen:** Wochenendbericht in der Klassenzeitung: ein Ausflug in einen Wildpark.
- **Sprechen:** 1) Erzählen, was man am Wochenende gemacht hat (drei bis vier Sätze im Perfekt). 2) Nachfragen stellen: Wo warst du? Wie war es?
- **Schreiben:** Eine kurze Nachricht an eine Freundin oder einen Freund: Was hast du am Wochenende gemacht? (30–40 Wörter)

#### de.a2.e02 · Mit Bus und Bahn

- **Thema:** Verkehr und Unterwegssein · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann erzählen, wie ich irgendwohin gefahren bin. · Ich kann am Schalter oder Automaten eine Fahrkarte kaufen und nach dem Gleis fragen.
- **Sprechhandlungen:** eine Fahrt beschreiben, Auskunft erfragen, eine Fahrkarte kaufen, eine Verspätung mitteilen
- **Geschichte und Dialog:** 1) Geschichte: Ranā und Laylā sind mit dem Zug nach Gießen gefahren, um Tante Hind zu besuchen; sie sind umgestiegen und haben den Anschluss gerade noch erreicht. 2) Dialog: Am Fahrkartenautomaten fragt Opa Kamāl Jan, welche Fahrkarte er für den Bus braucht.
- **Lesen:** Fahrplanauszug und Aushang am Bahnhof: Ersatzverkehr mit Bussen.
- **Sprechen:** 1) Erzählen, wie man irgendwohin gefahren ist (mit dem Bus, umgestiegen, angekommen). 2) Am Schalter eine Fahrkarte kaufen und nach dem Gleis fragen.
- **Schreiben:** Eine Nachricht an die Familie: Der Zug hat Verspätung, neue Ankunftszeit nennen (25–35 Wörter).

#### de.a2.e03 · Ein Geschenk für Oma

- **Thema:** Familienfeste · **Budget:** 60 · **Kind:** ja · **Kandidaten:** R-06
- **Kann:** Ich kann sagen, wem ich was schenke und warum es der Person gefällt. · Ich kann jemandem gratulieren und mich für ein Geschenk bedanken.
- **Sprechhandlungen:** gratulieren, sich bedanken, etwas schenken, Gefallen ausdrücken, einladen
- **Geschichte und Dialog:** 1) Geschichte: Oma Sevim zieht in eine kleinere Wohnung; die Familie bereitet eine Einzugsfeier vor, Elif und Laylā basteln ihr ein Bild, Emre schenkt ihr Blumen. 2) Dialog: Jan sucht im Geschäft eine Tasse für seine Tante; die Verkäuferin hilft ihm und packt sie als Geschenk ein.
- **Lesen:** Einladungskarte zur Einzugsfeier mit Datum, Uhrzeit und Wegbeschreibung.
- **Sprechen:** 1) Sagen, wem man was schenkt und warum es der Person gefällt. 2) Jemandem gratulieren und sich für ein Geschenk bedanken.
- **Schreiben:** Eine Einladung oder eine Dankeskarte schreiben (30–40 Wörter).

#### de.a2.e04 · Wir ziehen um

- **Thema:** Wohnen · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann sagen, wo Möbel stehen und wohin sie kommen sollen. · Ich kann beim Einräumen Anweisungen geben und verstehen.
- **Sprechhandlungen:** Lage beschreiben, Anweisungen geben, um Hilfe bitten, sich bedanken
- **Geschichte und Dialog:** 1) Geschichte: Familie an-Naǧǧār bekommt die Möbel für die neue Wohnung; Ḫālid und Yazan tragen Kartons, Ranā sagt, wohin der Schrank kommt, und Herr Neumann von nebenan leiht ihnen seinen Akkuschrauber. 2) Dialog: Elif hilft Laylā, ihr Zimmer einzurichten: Wo soll das Regal stehen? Leg die Bücher auf den Tisch!
- **Lesen:** Wohnungsanzeige und Grundriss einer Drei-Zimmer-Wohnung.
- **Sprechen:** 1) Beschreiben, wo die Möbel im eigenen Zimmer stehen. 2) Beim Einräumen Anweisungen geben und verstehen.
- **Schreiben:** Eine Nachricht an eine Freundin: So sieht mein neues Zimmer aus (35–45 Wörter).

#### de.a2.e05 · Beim Arzt

- **Thema:** Körper und Gesundheit · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann in der Praxis sagen, was ich habe und seit wann. · Ich kann am Telefon einen Termin vereinbaren oder absagen.
- **Sprechhandlungen:** Beschwerden beschreiben, begründen, einen Termin vereinbaren, Ratschläge verstehen
- **Geschichte und Dialog:** 1) Geschichte: Opa Kamāl hat seit Tagen Rückenschmerzen; Laylā begleitet ihn in die Praxis und hilft bei der Anmeldung, Frau Fischer, die Hausärztin, empfiehlt Bewegung und Wärme. 2) Dialog: Emre ruft in der Praxis an, weil er sich erkältet hat, und vereinbart einen Termin.
- **Lesen:** Merkblatt der Praxis: Sprechzeiten, Termine und was man mitbringen soll.
- **Sprechen:** 1) Beim Arzt sagen, was man hat und seit wann (weil …). 2) Am Telefon einen Termin vereinbaren.
- **Schreiben:** Eine Entschuldigung für die Schule schreiben: Mein Sohn kann heute nicht kommen, weil … (30–40 Wörter).

#### de.a2.e06 · Im Kaufhaus

- **Thema:** Kleidung · **Budget:** 60 · **Kind:** ja
- **Kann:** Ich kann im Geschäft nach Größe und Farbe fragen und Kleidung anprobieren. · Ich kann sagen, welches Kleidungsstück ich nehme, und eine Ware umtauschen.
- **Sprechhandlungen:** auswählen, beschreiben, um Rat fragen, umtauschen, begründen
- **Geschichte und Dialog:** 1) Geschichte: Derya kauft mit Elif und Emre Kleidung für den Winter; Emre gefällt die schwarze Jacke, Elif möchte den blauen Pullover anprobieren. 2) Dialog: An der Kasse möchte Ḫālid eine Hose umtauschen, weil sie zu eng ist.
- **Lesen:** Prospektseite eines Kaufhauses mit Angeboten (ohne Marken).
- **Sprechen:** 1) Im Geschäft nach Größe und Farbe fragen und Kleidung anprobieren. 2) Sagen, welches Kleidungsstück man nimmt und warum.
- **Schreiben:** Eine kurze Nachricht an die Schwester: Welche Jacke soll ich nehmen? Mit Beschreibung (30–40 Wörter).

#### de.a2.e07 · Neu in der Nachbarschaft

- **Thema:** Nachbarschaft · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann mich bei neuen Nachbarn vorstellen und Hilfe anbieten. · Ich kann die Hausordnung verstehen und sagen, was ich davon halte.
- **Sprechhandlungen:** sich vorstellen, Hilfe anbieten, um etwas bitten, Meinung äußern, Regeln erklären
- **Geschichte und Dialog:** 1) Geschichte: Familie an-Naǧǧār lädt die Nachbarn zum Tee ein; Herr Neumann erzählt, dass im Haus alle einander helfen, und Hausmeister Herr Kaya erklärt, wann die Mülltonnen geleert werden. 2) Dialog: Elif klingelt bei Herrn Neumann, weil ihre Familie ein Paket für ihn angenommen hat.
- **Lesen:** Aushang im Treppenhaus: Hausordnung mit Ruhezeiten, Mülltrennung und Treppenhausreinigung.
- **Sprechen:** 1) Sich bei neuen Nachbarn vorstellen und Hilfe anbieten. 2) Höflich um etwas bitten (leihen, leiser sein) und eine Bitte annehmen oder ablehnen.
- **Schreiben:** Einen Zettel für die Nachbarn schreiben: Wir haben Ihr Paket angenommen (25–35 Wörter).

#### de.a2.e08 · Sport im Verein

- **Thema:** Sport · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann zwei Sportarten vergleichen und sagen, was ich am liebsten mache. · Ich kann mich für einen Kurs anmelden und nach Zeiten und Kosten fragen.
- **Sprechhandlungen:** vergleichen, Vorlieben begründen, sich anmelden, Informationen erfragen
- **Geschichte und Dialog:** 1) Geschichte: Yazan und Jan trainieren für ein Fußballturnier; Yazan läuft schneller als Jan, aber Jan schießt die meisten Tore, und Trainerin Helene erklärt die Regeln. 2) Dialog: Laylā und Mia melden sich für den Basketballkurs an; die Trainerin fragt nach Alter und Erfahrung.
- **Lesen:** Aushang eines Sportvereins: Trainingszeiten und Anmeldung (ohne echten Vereinsnamen).
- **Sprechen:** 1) Zwei Sportarten vergleichen (schneller, gesünder, am liebsten). 2) Sich für einen Kurs anmelden und Fragen zu Zeiten und Kosten stellen.
- **Schreiben:** Eine Anmeldung per E-Mail an einen Sportverein: Name, Alter, Wunschkurs (35–45 Wörter).

#### de.a2.e09 · Beim Bürgeramt

- **Thema:** Behörden und Formulare · **Budget:** 70 · **Kind:** ja
- **Kann:** Ich kann am Schalter meine persönlichen Angaben machen und ein Formular ausfüllen. · Ich kann fragen, was ich tun muss, wenn ich umziehe oder einen neuen Ausweis brauche.
- **Sprechhandlungen:** Angaben zur Person machen, nachfragen, um Wiederholung bitten, Bedingungen verstehen
- **Geschichte und Dialog:** 1) Geschichte: Ranā meldet die Familie nach dem Umzug beim Bürgeramt an; Frau Hoffmann erklärt, welche Unterlagen fehlen, und Laylā hilft beim Buchstabieren des Familiennamens. 2) Dialog: Murat fragt am Telefon, was er tun muss, wenn er einen neuen Ausweis braucht.
- **Lesen:** Anmeldeformular mit Ausfüllhinweisen (ohne echte Daten).
- **Sprechen:** 1) Am Schalter persönliche Angaben machen (Geburtsdatum, Adresse als Platzhalter). 2) Fragen, was man tun muss, wenn man umzieht.
- **Schreiben:** Ein Formular ausfüllen und dazu eine kurze Rückfrage per E-Mail schreiben (30–40 Wörter).

#### de.a2.e10 · Handy, Nachrichten, Sicherheit

- **Thema:** Medien und Digitales (sachlich) · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann jemandem Schritt für Schritt erklären, wie man ein Foto verschickt. · Ich kann höflich um Hilfe bitten und sagen, was ich bei einer fremden Nachricht tue.
- **Sprechhandlungen:** eine Anleitung geben, höflich bitten, warnen, Rat holen
- **Geschichte und Dialog:** 1) Geschichte: Opa Kamāl möchte Fotos an seine Enkel schicken; Yazan erklärt ihm Schritt für Schritt, wie das geht, und warum man sein Passwort niemandem sagt. 2) Dialog: Elif bekommt eine Nachricht von einer unbekannten Nummer und zeigt sie sofort ihrer Mutter; Derya erklärt, was man dann tut.
- **Lesen:** Kurze Anleitung: ein sicheres Passwort erstellen (fünf Schritte).
- **Sprechen:** 1) Jemandem Schritt für Schritt erklären, wie man ein Foto verschickt. 2) Höflich um Hilfe bitten (Könnten Sie mir zeigen, wie …?).
- **Schreiben:** Eine Nachricht an die Klassenlehrerin: höfliche Frage nach den Hausaufgaben (30–40 Wörter).

#### de.a2.e11 · Ferien bei Verwandten

- **Thema:** Reisen und Besuch · **Budget:** 65 · **Kind:** ja
- **Kann:** Ich kann von einer Reise erzählen: wann, wie lange, mit wem und wohin. · Ich kann sagen, was ich im Urlaub machen wollte und was ich machen musste.
- **Sprechhandlungen:** über eine Reise berichten, Zeitangaben machen, Pläne und Hindernisse nennen, packen und planen
- **Geschichte und Dialog:** 1) Geschichte: Elif erzählt nach den Sommerferien, dass die Familie zwei Wochen bei Verwandten in Izmir war; sie wollte am Meer bleiben, musste aber früher zurück, weil Murat arbeiten musste. 2) Dialog: Laylā hilft Opa Kamāl, den Koffer für den Flug zu Verwandten nach Amman zu packen: Was darf ins Handgepäck?
- **Lesen:** Postkarte aus den Ferien und eine Packliste.
- **Sprechen:** 1) Über eine vergangene Reise erzählen (wann, wie lange, mit wem). 2) Sagen, was man im Urlaub machen wollte und was man machen musste.
- **Schreiben:** Eine Postkarte aus den Ferien schreiben (35–45 Wörter).

#### de.a2.e12 · Natur vor der Haustür

- **Thema:** Natur und Umwelt · **Budget:** 60 · **Kind:** ja
- **Kann:** Ich kann einen Ausflug in die Natur beschreiben und Tiere und Pflanzen benennen. · Ich kann erklären, welcher Müll in welche Tonne gehört.
- **Sprechhandlungen:** beschreiben, erklären, vergleichen, Regeln nennen
- **Geschichte und Dialog:** 1) Geschichte: Die Klasse macht einen Ausflug an die Lahn; Frau Schneider erklärt Bäume und Vögel, Jan entdeckt einen Igel, und Laylā sammelt Müll in die richtigen Tüten. 2) Dialog: Oma Sevim und Elif trennen zu Hause den Müll: Wohin kommt die Bananenschale?
- **Lesen:** Infotafel am Naturpfad: Tiere und Pflanzen am Fluss.
- **Sprechen:** 1) Einen Ausflug in die Natur beschreiben. 2) Erklären, welcher Müll in welche Tonne gehört.
- **Schreiben:** Einen kurzen Bericht über den Klassenausflug für die Klassenzeitung schreiben (40–50 Wörter).

#### de.a2.e13 · Was willst du werden?

- **Thema:** Arbeit und Berufe · **Budget:** 65 · **Kind:** ja · **Kandidaten:** R-10
- **Kann:** Ich kann sagen, welchen Beruf ich lernen möchte und warum. · Ich kann einen Beruf mit seinen Aufgaben und Arbeitszeiten beschreiben.
- **Sprechhandlungen:** Wünsche äußern, begründen, Berufe beschreiben, nachfragen
- **Geschichte und Dialog:** 1) Geschichte: Am Projekttag „Berufe“ stellen Eltern ihre Arbeit vor: Ranā ist Ingenieurin, Ḫālid Elektriker, Jans Vater Thomas arbeitet im Büro und kocht abends für die Familie; Elif will Tierärztin werden, Yazan Erzieher. 2) Dialog: Emre fragt Herrn Neumann, wie er früher Elektriker geworden ist.
- **Lesen:** Steckbriefe aus der Schülerzeitung: Traumberufe von vier Jugendlichen.
- **Sprechen:** 1) Sagen, was man werden möchte und warum. 2) Einen Beruf mit seinen Aufgaben beschreiben.
- **Schreiben:** Einen kurzen Text über den eigenen Wunschberuf schreiben (40–50 Wörter).

#### de.a2.e14 · Freunde und Gefühle

- **Thema:** Gefühle und Freundschaft · **Budget:** 70 · **Kind:** ja
- **Kann:** Ich kann über Gefühle sprechen und sagen, warum ich froh oder traurig bin. · Ich kann mich entschuldigen, jemanden trösten und eine Entschuldigung annehmen.
- **Sprechhandlungen:** Gefühle ausdrücken, trösten, sich entschuldigen, Folgen nennen, einen Streit beilegen
- **Geschichte und Dialog:** 1) Geschichte: Laylā ist traurig, weil Elif in der Pause nur noch mit Mia spielt; Oma Sevim hilft den beiden, darüber zu reden, und sie vertragen sich wieder. 2) Dialog: Jan ist enttäuscht, weil seine Mannschaft verloren hat; Yazan tröstet ihn.
- **Lesen:** Ratgeberecke der Schülerzeitung: Was tun nach einem Streit?
- **Sprechen:** 1) Über Gefühle sprechen und sagen, warum man froh oder traurig ist. 2) Sich entschuldigen und eine Entschuldigung annehmen.
- **Schreiben:** Eine Entschuldigungsnachricht an eine Freundin oder einen Freund schreiben (35–45 Wörter).

### B1

#### de.b1.e01 · Als Oma jung war

- **Thema:** Familie und Verwandte · **Budget:** 85 · **Kind:** ja · **Kandidaten:** R-05
- **Kann:** Ich kann von Erlebnissen aus meiner Kindheit oder aus der Geschichte meiner Familie zusammenhängend erzählen. · Ich kann in einer Erzählung verstehen, in welcher Reihenfolge etwas passiert ist.
- **Sprechhandlungen:** von früher erzählen, Erinnerungen vergleichen, nachfragen und Interesse zeigen, zeitliche Abfolge ausdrücken
- **Geschichte und Dialog:** 1) Geschichte: Oma Sevim erzählt Elif und Laylā, wie sie als junge Frau nach Wetzlar kam, in einer Fabrik arbeitete und Deutsch lernte, als ihre Kinder in die Schule kamen. 2) Dialog: Yazan befragt Opa Kamāl für ein Schulprojekt über seine Kindheit in einem Dorf.
- **Lesen:** 1) Auszug aus einem Erinnerungsbuch: „Mein erster Winter in Deutschland“ (erfundene Ich-Erzählung). 2) Zeitungsbericht über ein Erzählcafé für Jung und Alt in der Stadtbibliothek.
- **Sprechen:** 1) Von einem besonderen Erlebnis aus der Kindheit erzählen (zwei Minuten). 2) Ein älteres Familienmitglied zu seiner Kindheit befragen und darüber berichten.
- **Schreiben:** Eine Erinnerung an einen besonderen Tag aufschreiben (80–100 Wörter).

#### de.b1.e02 · Wege in den Beruf

- **Thema:** Ausbildung und Bewerbung · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann über meine Interessen und Stärken sprechen und sagen, welche Ausbildung dazu passt. · Ich kann Informationen zu einem Praktikum oder einer Ausbildungsstelle verstehen und gezielt nachfragen.
- **Sprechhandlungen:** Interessen und Stärken darstellen, Pläne äußern, Informationen erfragen, telefonisch anfragen
- **Geschichte und Dialog:** 1) Geschichte: Emre sucht einen Ausbildungsplatz als Mechatroniker; er geht mit Derya zur Berufsberatung und bereitet sich auf ein Praktikum in einer Werkstatt vor. 2) Dialog: Selin, Elifs Cousine, erzählt Emre von ihrem Praktikum in einem Labor und gibt ihm Tipps.
- **Lesen:** 1) Anzeige für einen Ausbildungsplatz (erfunden, ohne Firmennamen). 2) Erfahrungsbericht einer Auszubildenden zur Elektronikerin.
- **Sprechen:** 1) Die eigenen Stärken und Interessen vorstellen und begründen, welcher Beruf passt. 2) Im Rollenspiel bei einem Betrieb anrufen und nach einem Praktikumsplatz fragen.
- **Schreiben:** Eine kurze E-Mail mit der Bitte um einen Praktikumsplatz schreiben (80–100 Wörter).

#### de.b1.e03 · Gesund durch den Alltag

- **Thema:** Körper und Gesundheit · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann Ratschläge zu Ernährung, Bewegung und Schlaf geben und annehmen. · Ich kann Gesundheitsinformationen auf einem Merkblatt verstehen.
- **Sprechhandlungen:** Ratschläge geben, Gewohnheiten beschreiben, Vorsätze äußern, Zustimmung und Zweifel ausdrücken
- **Geschichte und Dialog:** 1) Geschichte: Derya arbeitet im Schichtdienst und schläft schlecht; ihre Kollegin Karin und die Hausärztin Frau Fischer geben ihr Tipps, und die Familie plant mehr gemeinsame Bewegung am Wochenende. 2) Dialog: Elif und Laylā überlegen, wie sie sich vor einer Klassenarbeit besser vorbereiten und gesünder frühstücken könnten.
- **Lesen:** 1) Merkblatt einer Krankenkasse zu gesundem Schlaf (vereinfacht, ohne Namen). 2) Interview mit einer Sportlehrerin über Bewegung im Alltag.
- **Sprechen:** 1) Einer Person mit einem Gesundheitsproblem Ratschläge geben (Du solltest …, An deiner Stelle würde ich …). 2) Über eigene Gewohnheiten sprechen und sagen, was man ändern möchte.
- **Schreiben:** In einer Nachricht einer Freundin oder einem Freund Tipps gegen Prüfungsstress geben (80–100 Wörter).

#### de.b1.e04 · Wenn etwas kaputt ist

- **Thema:** Wohnen · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann einen Schaden in der Wohnung beschreiben und eine Reparatur veranlassen. · Ich kann Mitteilungen der Hausverwaltung verstehen und darauf reagieren.
- **Sprechhandlungen:** einen Schaden melden, einen Termin vereinbaren, Abläufe beschreiben, sich beschweren
- **Geschichte und Dialog:** 1) Geschichte: Im Winter fällt bei Familie an-Naǧǧār die Heizung aus; Ranā ruft die Hausverwaltung an, Hausmeister Herr Kaya kommt vorbei, und am nächsten Tag wird die Heizung repariert. 2) Dialog: Jans Vater Thomas lässt sein Fahrrad in einer Werkstatt reparieren und fragt nach Kosten und Dauer.
- **Lesen:** 1) Aushang der Hausverwaltung: Wartung der Heizungen, Termine und Hinweise. 2) Ratgebertext: Kleine Reparaturen im Haushalt – was man selbst machen kann und wann man Hilfe holt.
- **Sprechen:** 1) Am Telefon einen Schaden melden und einen Termin vereinbaren. 2) Beschreiben, was in der Wohnung gemacht wird (Die Wand wird gestrichen …).
- **Schreiben:** Eine E-Mail an die Hausverwaltung mit einer Schadensmeldung schreiben (80–100 Wörter).

#### de.b1.e05 · Sicher im Netz

- **Thema:** Medien und Digitales (sachlich) · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann erklären, wie man persönliche Daten im Netz schützt. · Ich kann nachfragen, ob ich etwas richtig verstanden habe, und Unklarheiten klären.
- **Sprechhandlungen:** warnen, erklären, nachfragen, Regeln aushandeln
- **Geschichte und Dialog:** 1) Geschichte: Yazan bekommt eine Nachricht, er habe einen Preis gewonnen; er fragt Herrn Neumann, ob das echt sein kann, und die beiden finden heraus, dass es eine Falle ist. 2) Dialog: Elifs Klasse bespricht mit Frau Schneider Regeln für den Klassenchat.
- **Lesen:** 1) Infoblatt der Schule: zehn Regeln für sichere Passwörter und private Daten. 2) Kurzer Zeitungsartikel über gefälschte Nachrichten, die nach Kontodaten fragen.
- **Sprechen:** 1) Jemandem erklären, woran man eine gefälschte Nachricht erkennt. 2) Regeln für den Klassenchat gemeinsam aushandeln und begründen.
- **Schreiben:** Eine kurze Anleitung für jüngere Geschwister schreiben: So schützt du deine Daten (80–100 Wörter).

#### de.b1.e06 · Mitmachen im Verein

- **Thema:** Ehrenamt · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann ein Ehrenamt oder einen Verein vorstellen und sagen, wofür er sich einsetzt. · Ich kann sagen, wobei ich helfen möchte und warum.
- **Sprechhandlungen:** vorstellen, Zweck angeben, sich erkundigen, berichten
- **Geschichte und Dialog:** 1) Geschichte: Opa Kamāl gibt im Nachbarschaftszentrum Nachhilfe in Mathematik; Jan und Elif helfen samstags bei der Lebensmittelausgabe und lernen die Menschen kennen, für die sie Tüten packen. 2) Dialog: Emre erkundigt sich bei der Freiwilligen Feuerwehr, wie man dort mitmachen kann.
- **Lesen:** 1) Porträt in der Lokalzeitung: Ehrenamtliche in der Nachhilfe (erfundene Personen). 2) Faltblatt der Jugendfeuerwehr mit Übungszeiten (ohne echte Kontaktdaten).
- **Sprechen:** 1) Ein Ehrenamt vorstellen: Was macht man dort, für wen und wozu? 2) Sich telefonisch nach einer Möglichkeit zum Mitmachen erkundigen.
- **Schreiben:** Einen kurzen Bericht über einen Einsatz im Ehrenamt für die Schülerzeitung schreiben (90–110 Wörter).

#### de.b1.e07 · Elternabend und Zeugnis

- **Thema:** Schule und Lernen · **Budget:** 85 · **Kind:** ja
- **Kann:** Ich kann an einem Elterngespräch teilnehmen, Fragen zu Leistungen stellen und Vereinbarungen verstehen. · Ich kann einen Streit in der Klasse beschreiben und Lösungen vorschlagen.
- **Sprechhandlungen:** Fragen stellen, Vereinbarungen zusammenfassen, Pläne äußern, Konflikte lösen, loben und Sorgen äußern
- **Geschichte und Dialog:** 1) Geschichte: Ranā und Ḫālid gehen zum Elternsprechtag; Frau Schneider lobt Laylās Fortschritte in Deutsch, obwohl sie erst seit einem Jahr in Deutschland ist, und erklärt, welche Schulformen danach in Frage kommen. 2) Dialog: Im Klassenrat sprechen Jan, Yazan und Mia über einen Streit in der Pause und vereinbaren Regeln.
- **Lesen:** 1) Elternbrief der Schule mit Terminen und Hinweisen zum Elternabend. 2) Erklärtext: das Schulsystem in Hessen in Grundzügen (Schulformen und Abschlüsse).
- **Sprechen:** 1) Im Elterngespräch Fragen stellen und Vereinbarungen zusammenfassen. 2) Pläne für das nächste Schuljahr äußern (Ich werde …).
- **Schreiben:** Eine Nachricht an die Klassenlehrerin mit der Bitte um einen Gesprächstermin schreiben (80–100 Wörter).

#### de.b1.e08 · Besuch in der Ferne

- **Thema:** Reisen und Besuch · **Budget:** 80 · **Kind:** ja · **Kandidaten:** R-12
- **Kann:** Ich kann eine Reise planen, Verbindungen vergleichen und eine Unterkunft buchen. · Ich kann von einer Reise mit ihren schönen und schwierigen Momenten lebendig erzählen.
- **Sprechhandlungen:** planen, vergleichen, buchen, erzählen, Missgeschicke schildern
- **Geschichte und Dialog:** 1) Geschichte: Familie Yılmaz fliegt zu einer Hochzeit nach Izmir; nachdem sie lange am Flughafen gewartet hatten, fiel der Flug aus, und Emre organisierte eine neue Verbindung. 2) Dialog: Laylā plant mit ihrer Mutter einen Besuch bei Verwandten in Amman und vergleicht im Reisebüro Flüge.
- **Lesen:** 1) Reisebericht in einem Familienblog (erfunden): eine Hochzeit am Meer. 2) Informationsblatt zu Gepäck und Rechten bei Verspätung (ohne Firmennamen).
- **Sprechen:** 1) Im Reisebüro Angebote vergleichen und sich entscheiden. 2) Von einer Reise erzählen, bei der etwas schiefging.
- **Schreiben:** Einen kurzen Reisebericht für die Familie schreiben (90–110 Wörter).

#### de.b1.e09 · Führerschein und Verkehr

- **Thema:** Verkehr und Unterwegssein · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann Verkehrsregeln und Hinweise im Straßenverkehr verstehen und erklären. · Ich kann über Vor- und Nachteile verschiedener Verkehrsmittel sprechen.
- **Sprechhandlungen:** Regeln erklären, Gründe und Folgen nennen, abwägen, sich beschweren
- **Geschichte und Dialog:** 1) Geschichte: Emre macht den Führerschein; wegen des starken Regens ist die erste Fahrstunde so anstrengend, dass er danach seiner Fahrlehrerin Jana viele Fragen stellt. 2) Dialog: Derya und Murat überlegen, ob die Familie ein Auto braucht oder mit Bus, Bahn und Fahrrad auskommt.
- **Lesen:** 1) Auszug aus einem Lernheft für die Theorieprüfung: Vorfahrtsregeln (vereinfacht). 2) Meldung im Lokalteil: Baustelle an der Lahnbrücke, Umleitung für Busse.
- **Sprechen:** 1) Eine Verkehrssituation beschreiben und erklären, wer Vorfahrt hat. 2) Vor- und Nachteile von Auto, Bus und Fahrrad abwägen.
- **Schreiben:** Eine Beschwerde an den Verkehrsverbund über ständige Verspätungen schreiben (90–110 Wörter).

#### de.b1.e10 · Arbeiten im Team

- **Thema:** Arbeit und Berufe · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann in einer Teambesprechung Aufgaben verteilen, Vorschläge machen und auf Kritik reagieren. · Ich kann E-Mails und Notizen im Arbeitsalltag verstehen und beantworten.
- **Sprechhandlungen:** Vorschläge machen, Aufgaben verteilen, Kritik äußern und annehmen, eine Übergabe machen
- **Geschichte und Dialog:** 1) Geschichte: Ḫālid arbeitet mit einem neuen Kollegen, dem Praktikanten Finn, an der Elektrik eines Neubaus; bei der Besprechung mit der Kundin gibt es ein Missverständnis, das die beiden freundlich klären. 2) Dialog: Derya übergibt ihrer Kollegin Gül die Station und erklärt, was in der Nachtschicht zu tun ist.
- **Lesen:** 1) Interne E-Mail mit der Aufgabenverteilung für eine Woche. 2) Ratgebertext: freundlich Kritik äußern im Beruf.
- **Sprechen:** 1) In einer Besprechung einen Vorschlag machen und begründen. 2) Eine Übergabe machen: wichtige Informationen klar weitergeben.
- **Schreiben:** Eine E-Mail an eine Kollegin mit einer Aufgabenübergabe schreiben (90–110 Wörter).

#### de.b1.e11 · Kochen für Gäste

- **Thema:** Essen und Trinken (halal-neutral) · **Budget:** 80 · **Kind:** ja · **Kandidaten:** R-09
- **Kann:** Ich kann ein Rezept verstehen und erklären, wie ein Gericht zubereitet wird. · Ich kann Gäste empfangen, Essen anbieten und auf Fragen zu Zutaten eingehen.
- **Sprechhandlungen:** eine Zubereitung erklären, Gäste empfangen, anbieten, nach Zutaten fragen
- **Geschichte und Dialog:** 1) Geschichte: Familie Becker lädt die Nachbarn zu einem Essen aus drei Küchen ein: Oma Sevim bringt gefüllte Paprika, Ranā kocht Linsensuppe, Thomas macht einen Kartoffelauflauf mit Rindfleisch, und Jan schreibt die Rezepte auf. 2) Dialog: Beim Einkauf fragt Laylā an der Fleischtheke, welches Fleisch im Hackfleisch ist.
- **Lesen:** 1) Rezept: Linsensuppe für sechs Personen. 2) Etikett und Zutatenliste eines Fertiggerichts lesen (Allergene, Fleischart).
- **Sprechen:** 1) Ein Lieblingsgericht und seine Zubereitung erklären. 2) Als Gastgeberin oder Gastgeber Essen anbieten und Fragen zu den Zutaten beantworten.
- **Schreiben:** Ein Rezept für ein Familiengericht aufschreiben (90–110 Wörter).

#### de.b1.e12 · Konto, Brief und Paket

- **Thema:** Bank und Post · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann ein Konto eröffnen, eine Überweisung ausfüllen und bei Problemen nachfragen. · Ich kann Benachrichtigungen der Post verstehen und eine Sendung abholen oder zurückschicken.
- **Sprechhandlungen:** ein Anliegen erklären, nachfragen, Informationen vergleichen, reklamieren
- **Geschichte und Dialog:** 1) Geschichte: Emre eröffnet für seine Ausbildungsvergütung ein Konto; die Bankberaterin Frau Wagner erklärt Überweisung, Dauerauftrag und Kontoauszug. 2) Dialog: Opa Kamāl holt in der Postfiliale ein Paket ab und schickt ein Päckchen an Verwandte.
- **Lesen:** 1) Benachrichtigungskarte der Post mit Hinweisen zur Abholung. 2) Informationsblatt: Was man für die Kontoeröffnung braucht.
- **Sprechen:** 1) Am Bankschalter ein Anliegen erklären (Karte gesperrt, Überweisung falsch). 2) In der Post nach Versandarten und Preisen fragen.
- **Schreiben:** Eine Überweisung ausfüllen und eine kurze Reklamation an einen Versanddienst schreiben (80–100 Wörter).

#### de.b1.e13 · Anträge und Fristen

- **Thema:** Behörden und Formulare · **Budget:** 85 · **Kind:** ja
- **Kann:** Ich kann einen einfachen Antrag stellen und verstehen, welche Unterlagen und Fristen nötig sind. · Ich kann bei einer Behörde telefonisch nachfragen, wie weit mein Antrag bearbeitet ist.
- **Sprechhandlungen:** einen Antrag stellen, nachfragen, Schritte erklären, um Fristverlängerung bitten
- **Geschichte und Dialog:** 1) Geschichte: Ranā stellt einen Antrag auf Kindergeld; Frau Hoffmann erklärt, dass das Formular noch nicht vollständig ausgefüllt ist, und Laylā hilft beim Übersetzen einer Bescheinigung. 2) Dialog: Murat fragt bei der Führerscheinstelle nach, ob sein türkischer Führerschein umgeschrieben werden kann.
- **Lesen:** 1) Merkblatt zu einem Antrag mit der Liste der Unterlagen und Fristen. 2) Kurzer Bescheid in einfacher Sprache (erfunden) mit Erläuterungen.
- **Sprechen:** 1) Am Telefon nachfragen, ob ein Antrag vollständig ist. 2) Einer anderen Person erklären, welche Schritte für einen Antrag nötig sind.
- **Schreiben:** Eine E-Mail an ein Amt mit einer Nachfrage zum Stand eines Antrags schreiben (90–110 Wörter).

#### de.b1.e14 · Erfindungen im Alltag

- **Thema:** Wissenschaft und Technik · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann beschreiben, wie ein Gerät funktioniert und wofür man es benutzt. · Ich kann einen Sachtext über eine Erfindung verstehen und die wichtigsten Punkte wiedergeben.
- **Sprechhandlungen:** beschreiben, erklären, bewerten, diskutieren
- **Geschichte und Dialog:** 1) Geschichte: Elif, Laylā und Mia bauen für den Technikwettbewerb der Schule eine automatische Bewässerung für Oma Sevims Garten; Ranā hilft als Ingenieurin beim Programmieren. 2) Dialog: Jan erklärt Opa Kamāl, wie ein Mikroskop funktioniert.
- **Lesen:** 1) Sachtext: Wie die Brille das Lesen veränderte (vereinfacht). 2) Gebrauchsanleitung eines Küchengeräts (ohne Marke).
- **Sprechen:** 1) Ein Gerät vorstellen: Aufbau, Funktion, Nutzen. 2) Diskutieren, welche Erfindung im Alltag am wichtigsten ist.
- **Schreiben:** Eine kurze Beschreibung einer eigenen Erfindungsidee schreiben (90–110 Wörter).

#### de.b1.e15 · Klima und Energie im Alltag

- **Thema:** Natur und Umwelt · **Budget:** 80 · **Kind:** ja
- **Kann:** Ich kann über Möglichkeiten sprechen, im Alltag Energie und Wasser zu sparen. · Ich kann ausdrücken, was ich tun würde, wenn die Bedingungen anders wären.
- **Sprechhandlungen:** Vorschläge machen, Bedingungen ausdrücken, begründen, vergleichen
- **Geschichte und Dialog:** 1) Geschichte: Die Klasse misst eine Woche lang den Stromverbrauch der Schule; Yazan stellt fest, dass viele Geräte nachts laufen, und die Klasse schlägt der Schulleitung Änderungen vor. 2) Dialog: Oma Sevim und Derya überlegen, was sie anders machen würden, wenn sie eine kleine Solaranlage auf dem Balkon hätten.
- **Lesen:** 1) Grafik mit Erläuterung: wofür ein Haushalt Energie verbraucht. 2) Zeitungsbericht über eine Schule, die mit einem Energiesparprojekt Geld spart.
- **Sprechen:** 1) Vorschläge zum Energiesparen machen und begründen. 2) Über eine angenommene Situation sprechen (Wenn ich die Schule leiten würde, …).
- **Schreiben:** Einen Vorschlag an die Schülervertretung zum Energiesparen schreiben (90–110 Wörter).

#### de.b1.e16 · Gemeinde und Grundrechte

- **Thema:** Staat und Gemeinde (sachlich) · **Budget:** 85 · **Kind:** ja
- **Kann:** Ich kann sachlich erklären, welche Aufgaben eine Gemeinde hat und wie Bürgerinnen und Bürger mitwirken können. · Ich kann einfache Texte über Grundrechte verstehen und mit eigenen Worten wiedergeben.
- **Sprechhandlungen:** erklären, einen Wunsch vortragen, begründen, Abläufe beschreiben
- **Geschichte und Dialog:** 1) Geschichte: Die Klasse besucht das Rathaus; eine Mitarbeiterin erklärt, wer über den neuen Spielplatz entscheidet, und die Kinder dürfen im Jugendforum ihre Wünsche vortragen. 2) Dialog: Emre hat seine erste Wahlbenachrichtigung bekommen und fragt Herrn Neumann, wie die Wahl abläuft.
- **Lesen:** 1) Erklärtext: Was die Stadtverordnetenversammlung entscheidet (nur das Verfahren). 2) Ausgewählte Grundrechte in einfacher Sprache (eigene Wiedergabe, kein Gesetzeswortlaut).
- **Sprechen:** 1) Erklären, wie eine Wahl abläuft (Wahllokal, Briefwahl, geheim). 2) Einen Wunsch für das eigene Viertel vortragen und begründen.
- **Schreiben:** Einen kurzen Brief an das Jugendforum mit einem Vorschlag für das eigene Viertel schreiben (90–110 Wörter).

### B2

#### de.b2.e01 · Bewerben mit Profil

- **Thema:** Ausbildung und Bewerbung · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann ein überzeugendes Bewerbungsschreiben verfassen und meinen Lebenslauf klar gliedern. · Ich kann mich im Vorstellungsgespräch vorstellen, auf typische Fragen eingehen und selbst Fragen stellen.
- **Sprechhandlungen:** sich präsentieren, Erfahrungen darstellen, auf Fragen eingehen, Rückfragen stellen
- **Geschichte und Dialog:** 1) Geschichte: Selin bewirbt sich nach dem Studium um eine Stelle in einem Labor für Medizintechnik; Ranā übt mit ihr das Vorstellungsgespräch, und Selin lernt, ihre Stärken ohne Übertreibung darzustellen. 2) Dialog: Im Vorstellungsgespräch fragt die Personalleiterin Frau Hartmann nach Selins Erfahrungen im Team und nach ihren Zielen.
- **Lesen:** 1) Stellenanzeige mit Anforderungsprofil (erfunden). 2) Ratgeber: typische Fehler im Anschreiben. 3) Musterlebenslauf in Tabellenform (erfundene Person).
- **Sprechen:** 1) Ein Vorstellungsgespräch als Rollenspiel führen (Stärken, Schwächen, Motivation). 2) Über den eigenen Bildungsweg geordnet berichten.
- **Schreiben:** 1) Ein Bewerbungsschreiben zu einer Anzeige verfassen (150–180 Wörter). 2) Den eigenen Lebenslauf in Stichpunkten im Nominalstil gliedern (80–100 Wörter).

#### de.b2.e02 · Rechte und Pflichten im Job

- **Thema:** Arbeit und Berufe · **Budget:** 105 · **Kind:** nein
- **Kann:** Ich kann die wichtigsten Regelungen eines Arbeitsvertrags verstehen und gezielt nachfragen. · Ich kann im Arbeitsalltag meine Rechte sachlich ansprechen, etwa bei Überstunden oder Urlaub.
- **Sprechhandlungen:** ein Anliegen vortragen, Bedingungen klären, einen Kompromiss vorschlagen, Regeln erklären
- **Geschichte und Dialog:** 1) Geschichte: Emre hat seine Ausbildung abgeschlossen und bekommt seinen ersten Arbeitsvertrag; mit Ḫālid geht er Probezeit, Urlaubsanspruch und Kündigungsfrist durch. 2) Dialog: Derya spricht mit ihrem Stationsleiter Herrn Lange über zu viele Überstunden und schlägt eine andere Dienstplanung vor.
- **Lesen:** 1) Auszug aus einem Musterarbeitsvertrag (erfunden, vereinfacht). 2) Ratgebertext einer Beratungsstelle: Was gilt bei Krankheit im Job? 3) Interview mit einer Betriebsrätin über ihren Alltag (erfunden).
- **Sprechen:** 1) In einem Gespräch mit Vorgesetzten ein Anliegen sachlich vortragen und einen Kompromiss finden. 2) Einer Kollegin erklären, was im Krankheitsfall zu tun ist.
- **Schreiben:** 1) Eine E-Mail mit Urlaubsantrag und Begründung schreiben (120–150 Wörter). 2) Eine Krankmeldung an den Arbeitgeber formulieren (80–100 Wörter).

#### de.b2.e03 · Wohnformen im Wandel

- **Thema:** Wohnen · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann verschiedene Wohnformen vergleichen und Vor- und Nachteile abwägen. · Ich kann Wohnungsanzeigen im Detail verstehen und bei einer Besichtigung gezielte Fragen stellen.
- **Sprechhandlungen:** vergleichen, abwägen, eine Empfehlung geben, nachfragen
- **Geschichte und Dialog:** 1) Geschichte: Oma Sevim überlegt, in ein Mehrgenerationenhaus zu ziehen; sobald eine barrierefreie Wohnung frei wird, besichtigt sie sie mit Derya und Herrn Neumann, der dort schon wohnt. 2) Dialog: Selin sucht mit zwei Studienfreundinnen eine Wohngemeinschaft und spricht mit der Vermieterin über die Nebenkosten.
- **Lesen:** 1) Exposé einer barrierefreien Wohnung. 2) Reportage über ein Mehrgenerationenhaus (erfunden). 3) Kommentar einer Stadtplanerin zum Wohnen in der Zukunft.
- **Sprechen:** 1) Wohnformen vergleichen und eine begründete Empfehlung geben. 2) Bei einer Wohnungsbesichtigung gezielt nachfragen.
- **Schreiben:** 1) Eine Anfrage zu einer Wohnungsanzeige schreiben (120–150 Wörter). 2) Einen Beitrag für die Hauszeitung über das Zusammenleben schreiben (150–180 Wörter).

#### de.b2.e04 · Verträge lesen und verstehen

- **Thema:** Verträge und Rechte · **Budget:** 110 · **Kind:** nein
- **Kann:** Ich kann wichtige Klauseln in Miet- und Handyverträgen verstehen, etwa zu Laufzeit, Kündigung und Widerruf. · Ich kann einen Vertrag schriftlich und fristgerecht kündigen oder widerrufen.
- **Sprechhandlungen:** Bedingungen erklären, nachfragen, kündigen, verhandeln
- **Geschichte und Dialog:** 1) Geschichte: Yazan, inzwischen 18, möchte einen Handyvertrag abschließen; Ranā liest mit ihm die Bedingungen und entdeckt eine automatische Verlängerung. 2) Dialog: Ḫālid und Ranā gehen den neuen Mietvertrag durch und fragen den Vermieter nach Kaution und Renovierung beim Auszug.
- **Lesen:** 1) Auszug aus den Geschäftsbedingungen eines Mobilfunkvertrags (erfunden, ohne Marken). 2) Merkblatt einer Verbraucherberatung zum Widerrufsrecht. 3) Auszug aus einem Mietvertrag (erfunden).
- **Sprechen:** 1) Einer anderen Person die wichtigsten Punkte eines Vertrags erklären. 2) Mit einem Anbieter telefonisch über eine Kündigung sprechen.
- **Schreiben:** 1) Eine Kündigung eines Vertrags schreiben (100–120 Wörter). 2) Eine Zusammenfassung der wichtigsten Vertragsbedingungen für die Familie schreiben (120–150 Wörter).

#### de.b2.e05 · Nachrichten prüfen

- **Thema:** Medien und Digitales (sachlich) · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann Nachrichtentexte verstehen und unterscheiden, was belegt und was nur behauptet wird. · Ich kann wiedergeben, was andere gesagt haben, ohne es als meine Meinung darzustellen.
- **Sprechhandlungen:** zusammenfassen, wiedergeben, Quellen bewerten, Zweifel äußern
- **Geschichte und Dialog:** 1) Geschichte: In der Familie Yılmaz macht eine Meldung über ein angeblich gefährliches Lebensmittel die Runde; Elif prüft mit ihrer Medien-AG die Quellen und erklärt der Familie, was tatsächlich gemeldet wurde. 2) Dialog: Jan befragt für die Schülerzeitung eine Lokaljournalistin über ihre Arbeit.
- **Lesen:** 1) Zwei Meldungen zum selben Ereignis aus unterschiedlichen Quellen. 2) Ratgeber: Woran man Falschmeldungen erkennt. 3) Interview mit einer Journalistin über Recherche (erfunden).
- **Sprechen:** 1) Eine Nachricht mit eigenen Worten zusammenfassen und die Quelle bewerten. 2) Wiedergeben, was jemand in einem Interview gesagt hat.
- **Schreiben:** 1) Eine Meldung für die Schülerzeitung schreiben (120–150 Wörter). 2) Einen Leserbrief zu einer Falschmeldung schreiben (150–180 Wörter).

#### de.b2.e06 · Wenn Angehörige Pflege brauchen

- **Thema:** Körper und Gesundheit · **Budget:** 110 · **Kind:** nein
- **Kann:** Ich kann mich über Hilfen für pflegebedürftige Angehörige informieren und ein Beratungsgespräch führen. · Ich kann ausdrücken, was man in einer schwierigen Lage hätte anders machen können.
- **Sprechhandlungen:** die eigene Lage schildern, sich beraten lassen, Bedauern ausdrücken, Alternativen abwägen
- **Geschichte und Dialog:** 1) Geschichte: Opa Kamāl braucht nach einem Sturz Unterstützung im Alltag; die Familie lässt sich bei einem Pflegestützpunkt beraten, und Ranā meint, sie hätten früher fragen sollen. 2) Dialog: Derya erklärt als Krankenpflegerin einer Angehörigen, wie die Pflege zu Hause organisiert werden kann.
- **Lesen:** 1) Informationsblatt zu den Pflegegraden (vereinfacht). 2) Erfahrungsbericht einer pflegenden Tochter (erfunden). 3) Zeitungsartikel über einen Pflegedienst, der mehrsprachig arbeitet.
- **Sprechen:** 1) Ein Beratungsgespräch führen und die eigene Lage schildern. 2) Über eine schwierige Entscheidung sprechen und Alternativen abwägen.
- **Schreiben:** 1) Eine Anfrage an einen Pflegedienst schreiben (120–150 Wörter). 2) Einen Erfahrungsbericht für das Infoheft eines Familienzentrums schreiben (150–180 Wörter).

#### de.b2.e07 · Energie und Klima vor Ort

- **Thema:** Natur und Umwelt · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann Maßnahmen zum Klimaschutz beschreiben und ihre Wirkung erklären. · Ich kann in einer Diskussion Argumente für und gegen einen Vorschlag sachlich vortragen.
- **Sprechhandlungen:** Maßnahmen beschreiben, argumentieren, Folgen erklären, eine Versammlung leiten
- **Geschichte und Dialog:** 1) Geschichte: Die Hausgemeinschaft überlegt, eine Solaranlage aufs Dach zu bauen; Ranā rechnet vor, wie viel Strom sie erzeugen könnte, und Herr Kaya lädt zu einer Hausversammlung ein. 2) Dialog: In der Projektwoche diskutieren Laylā und Jan, wie die Schule Wasser sparen kann.
- **Lesen:** 1) Sachtext: Wie eine Wärmepumpe funktioniert. 2) Bericht über ein Energieprojekt von Bürgerinnen und Bürgern in einer Kleinstadt (erfunden). 3) Grafik mit Erläuterung: Energieverbrauch nach Bereichen.
- **Sprechen:** 1) Einen Vorschlag zum Klimaschutz in einer Versammlung vorstellen. 2) Eine Diskussion führen: Was bringt mehr – Dämmung oder eine neue Heizung?
- **Schreiben:** 1) Ein Protokoll einer Hausversammlung schreiben (120–150 Wörter). 2) Einen argumentierenden Text zu einer Klimaschutzmaßnahme schreiben (150–180 Wörter).

#### de.b2.e08 · Anerkennung und Weiterbildung

- **Thema:** Behörden und Formulare · **Budget:** 110 · **Kind:** nein
- **Kann:** Ich kann die Schritte eines Anerkennungsverfahrens für einen ausländischen Abschluss verstehen und erklären. · Ich kann formelle Schreiben von Behörden verstehen und angemessen darauf antworten.
- **Sprechhandlungen:** sich beraten lassen, Verfahren erklären, formell antworten, Unterlagen nachreichen
- **Geschichte und Dialog:** 1) Geschichte: Ranā möchte als Ingenieurin in Deutschland arbeiten und stellt einen Antrag auf Anerkennung ihres Abschlusses; der Bescheid verlangt einen weiteren Nachweis, und sie nimmt an einem Anpassungskurs teil. 2) Dialog: Ḫālid lässt sich bei der Handwerkskammer zur Meisterprüfung beraten.
- **Lesen:** 1) Ablaufschema eines Anerkennungsverfahrens mit Erläuterungen. 2) Bescheid mit der Aufforderung, Unterlagen nachzureichen (erfunden). 3) Porträt einer Ärztin, deren Abschluss anerkannt wurde (erfunden).
- **Sprechen:** 1) Ein Beratungsgespräch zur Weiterbildung führen. 2) Die Schritte eines Verfahrens einer anderen Person erklären.
- **Schreiben:** 1) Ein formelles Schreiben zum Nachreichen von Unterlagen verfassen (120–150 Wörter). 2) Den Lebenslauf für eine Weiterbildung anpassen (Stichpunkte im Nominalstil, 80–100 Wörter).

#### de.b2.e09 · Forschung, die den Alltag verändert

- **Thema:** Wissenschaft und Technik · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann populärwissenschaftliche Texte verstehen und Ergebnisse mit eigenen Worten wiedergeben. · Ich kann einen kurzen Vortrag über eine Entdeckung halten und Fragen dazu beantworten.
- **Sprechhandlungen:** Ergebnisse wiedergeben, einen Vortrag halten, kritisch nachfragen, Abläufe beschreiben
- **Geschichte und Dialog:** 1) Geschichte: Selin arbeitet in einem Labor an neuen Brillengläsern; beim Tag der offenen Tür erklärt sie Elif und Jan die in Wetzlar entwickelten optischen Geräte. 2) Dialog: Yazan bereitet mit seiner Lehrerin ein Referat über Computerprogramme in der Medizin vor.
- **Lesen:** 1) Populärwissenschaftlicher Artikel über Linsen und Licht. 2) Kurzmeldung über eine Studie zum Schlaf von Jugendlichen. 3) Interview mit einer Forscherin über ihren Berufsweg (erfunden).
- **Sprechen:** 1) Ein Kurzreferat (drei Minuten) über eine Erfindung oder Entdeckung halten. 2) Die Ergebnisse einer Studie zusammenfassen und kritisch nachfragen.
- **Schreiben:** 1) Eine Zusammenfassung eines Sachtextes schreiben (120–150 Wörter). 2) Die Beschreibung eines Versuchsaufbaus schreiben (120–150 Wörter).

#### de.b2.e10 · Haushaltsgeld planen

- **Thema:** Bank und Post · **Budget:** 105 · **Kind:** nein
- **Kann:** Ich kann ein Haushaltsbudget planen und über Einnahmen und Ausgaben sprechen. · Ich kann Kontoauszüge, Rechnungen und Versicherungsunterlagen verstehen und Unstimmigkeiten klären.
- **Sprechhandlungen:** planen, Prioritäten aushandeln, reklamieren, Einwände formulieren
- **Geschichte und Dialog:** 1) Geschichte: Familie Becker führt ein Haushaltsbuch, weil die Nebenkosten gestiegen sind; zwar spart die Familie beim Strom, aber eine unerwartete Reparatur bringt den Plan durcheinander. 2) Dialog: Emre klärt mit seiner Versicherung eine falsch berechnete Rechnung.
- **Lesen:** 1) Ratgeber: ein Haushaltsbuch führen (vereinfacht). 2) Nebenkostenabrechnung mit Erläuterungen (erfunden). 3) Sachtext: Wie Versicherungen funktionieren – Grundbegriffe.
- **Sprechen:** 1) Gemeinsam ein Monatsbudget planen und Prioritäten aushandeln. 2) Am Telefon eine fehlerhafte Rechnung beanstanden.
- **Schreiben:** 1) Einen Widerspruch gegen eine fehlerhafte Rechnung schreiben (120–150 Wörter). 2) Einen Ratgebertext mit Spartipps für Jugendliche schreiben (150–180 Wörter).

#### de.b2.e11 · Mehrsprachig aufwachsen

- **Thema:** Zusammenleben · **Budget:** 105 · **Kind:** nein
- **Kann:** Ich kann über die Bedeutung von Sprachen in der Familie sprechen und eigene Erfahrungen begründet darstellen. · Ich kann Texte verstehen, in denen unterschiedliche Sichtweisen auf ein gesellschaftliches Thema dargestellt werden.
- **Sprechhandlungen:** Erfahrungen schildern, Positionen wiedergeben, Stellung nehmen, vergleichen
- **Geschichte und Dialog:** 1) Geschichte: Laylā spricht zu Hause Arabisch, in der Schule Deutsch und lernt mit Elif Türkisch; als eine Bekannte meint, Kinder sollten nur eine Sprache lernen, erklärt die Sprachlehrerin Frau Klein, was Studien dazu sagen. 2) Dialog: Opa Kamāl und Herr Neumann sprechen darüber, wie es sich anfühlt, als Erwachsener eine neue Sprache zu lernen.
- **Lesen:** 1) Sachtext: Wie Kinder mehrere Sprachen lernen. 2) Kommentar einer Lehrerin zum herkunftssprachlichen Unterricht. 3) Porträt einer Übersetzerin (erfunden).
- **Sprechen:** 1) Die eigene Sprachbiografie vorstellen. 2) In einer Diskussion verschiedene Positionen zur Mehrsprachigkeit wiedergeben und Stellung nehmen.
- **Schreiben:** 1) Einen Text über die eigene Sprachbiografie schreiben (150–180 Wörter). 2) Einen Leserbrief zu einem Artikel über Mehrsprachigkeit schreiben (150–180 Wörter).

#### de.b2.e12 · Ehrenamt mit Verantwortung

- **Thema:** Ehrenamt · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann ein Projekt im Ehrenamt planen, Aufgaben verteilen und Ergebnisse vorstellen. · Ich kann Texte der Vereinsarbeit wie Protokolle und Berichte verstehen und verfassen.
- **Sprechhandlungen:** planen, Aufgaben verteilen, Absprachen treffen, Ergebnisse vorstellen
- **Geschichte und Dialog:** 1) Geschichte: Jan und Yazan organisieren bei der Jugendfeuerwehr einen Erste-Hilfe-Kurs für Kinder; bis zum Herbst werden sie zwanzig Kinder ausgebildet haben. 2) Dialog: Beim Treffen im Nachbarschaftszentrum erklärt Opa Kamāl den neuen Freiwilligen, was zu tun ist.
- **Lesen:** 1) Protokoll einer Vereinssitzung (erfunden). 2) Bericht über eine Übung der Jugendfeuerwehr (ruhiger Ton). 3) Leitfaden: Wie man ein Projekt plant.
- **Sprechen:** 1) Ein Projekt vorstellen: Ziel, Ablauf, Aufgaben. 2) In einer Sitzung Aufgaben verteilen und Absprachen festhalten.
- **Schreiben:** 1) Ein Protokoll einer Sitzung schreiben (150–180 Wörter). 2) Einen Projektbericht für die Vereinszeitung schreiben (150–180 Wörter).

#### de.b2.e13 · Spuren der Stadtgeschichte

- **Thema:** Geschichte und Kultur · **Budget:** 105 · **Kind:** nein · **Kandidaten:** R-01, R-02
- **Kann:** Ich kann Informationen zur Geschichte eines Ortes verstehen und bei einer Führung gezielt nachfragen. · Ich kann Vermutungen über Vergangenes äußern und begründen.
- **Sprechhandlungen:** Vermutungen äußern, nachfragen, eine Führung halten, vergleichen
- **Geschichte und Dialog:** 1) Geschichte: Herr Neumann führt Elif, Laylā und ihre Großeltern durch die Altstadt; an der alten Lahnbrücke rätseln sie, wann sie gebaut worden ist, und finden die Antwort im Stadtmuseum. 2) Dialog: Oma Sevim und Opa Kamāl vergleichen alte Handwerksberufe aus ihrer Jugend mit heutigen Berufen.
- **Lesen:** 1) Text einer Infotafel: die alte Lahnbrücke. 2) Sachtext über Fachwerkhäuser und Handwerk. 3) Auszug aus einem eigenen Stadtführer über den Alltag im 18. Jahrhundert.
- **Sprechen:** 1) Eine kurze Stadtführung zu einem Ort vorbereiten und halten. 2) Zu einem alten Foto Vermutungen anstellen (Das dürfte … gewesen sein).
- **Schreiben:** 1) Einen Text für eine Infotafel schreiben (120–150 Wörter). 2) Einen Bericht über einen Museumsbesuch schreiben (150–180 Wörter).

#### de.b2.e14 · Rechtsstaat und Gericht

- **Thema:** Staat und Gemeinde (sachlich) · **Budget:** 110 · **Kind:** nein
- **Kann:** Ich kann Grundsätze des Rechtsstaats wie Gewaltenteilung und unabhängige Gerichte sachlich erklären. · Ich kann Berichte über Gerichtsverfahren in ruhigem Ton verstehen und wiedergeben.
- **Sprechhandlungen:** erklären, wiedergeben, einen Ablauf schildern, aussagen
- **Geschichte und Dialog:** 1) Geschichte: Emre hat einen kleinen Verkehrsunfall beobachtet und soll beim Amtsgericht als Zeuge aussagen; die Richterin erklärt den Ablauf, und Emre ist erleichtert, wie sachlich alles verläuft. 2) Dialog: Selin und Ranā sprechen über Schöffinnen und Schöffen, deren Stimme genauso zählt wie die der Berufsrichter.
- **Lesen:** 1) Erklärtext: Gewaltenteilung im Grundgesetz (eigene Wiedergabe). 2) Gerichtsbericht im Lokalteil über einen Nachbarschaftsstreit (ruhiger Ton). 3) Übersicht: Wer ist wer im Gerichtssaal?
- **Sprechen:** 1) Den Ablauf eines Gerichtsverfahrens erklären. 2) Über die Bedeutung unabhängiger Gerichte sprechen (sachlich und neutral).
- **Schreiben:** 1) Eine Zusammenfassung eines Gerichtsberichts schreiben (120–150 Wörter). 2) Eine Zeugenaussage zu einem erfundenen Vorfall schriftlich festhalten (120–150 Wörter).

#### de.b2.e15 · Arbeiten in der digitalen Welt

- **Thema:** Arbeit und Berufe · **Budget:** 105 · **Kind:** ja
- **Kann:** Ich kann Vor- und Nachteile digitaler Arbeitsformen erörtern. · Ich kann mich an Videokonferenzen aktiv beteiligen und Ergebnisse festhalten.
- **Sprechhandlungen:** einen Punkt vorstellen, diskutieren, Ergebnisse festhalten, Regeln vereinbaren
- **Geschichte und Dialog:** 1) Geschichte: Jans Vater Thomas arbeitet zwei Tage pro Woche zu Hause; statt ins Büro zu fahren, ist er nachmittags für die Kinder da, doch ohne klare Regeln verschwimmen Arbeit und Freizeit. 2) Dialog: Ranā leitet eine Videokonferenz mit Kolleginnen aus drei Ländern.
- **Lesen:** 1) Studie in Kurzform: Arbeit von zu Hause und Familie. 2) Leitfaden für gute Videokonferenzen. 3) Kommentar: Ist ständige Erreichbarkeit ein Problem?
- **Sprechen:** 1) In einer Videokonferenz einen Tagesordnungspunkt vorstellen und Rückfragen beantworten. 2) Über Regeln für die Arbeit von zu Hause diskutieren.
- **Schreiben:** 1) Die Zusammenfassung einer Besprechung als E-Mail schreiben (120–150 Wörter). 2) Einen Erörterungstext zur Arbeit von zu Hause schreiben (180–200 Wörter).

#### de.b2.e16 · Reklamieren und Verbraucherrechte

- **Thema:** Verträge und Rechte · **Budget:** 105 · **Kind:** nein
- **Kann:** Ich kann eine mangelhafte Ware reklamieren und meine Rechte als Verbraucherin oder Verbraucher begründet einfordern. · Ich kann Informationen einer Verbraucherberatung verstehen und auf meine Lage übertragen.
- **Sprechhandlungen:** reklamieren, auf einer Lösung bestehen, erklären, bewerten
- **Geschichte und Dialog:** 1) Geschichte: Murats neue Waschmaschine läuft nach drei Wochen aus; der Händler bietet nur einen Gutschein an, während Murat auf einer Reparatur besteht, was ihm die Verbraucherberatung bestätigt. 2) Dialog: Elif reklamiert online bestellte Schuhe, die eine andere Farbe haben als auf dem Bild.
- **Lesen:** 1) Merkblatt: Gewährleistung und Garantie im Vergleich. 2) Erfahrungsbericht über eine Reklamation (erfunden). 3) Ein Urteil in einfacher Zusammenfassung (eigene Wiedergabe).
- **Sprechen:** 1) Im Geschäft eine Reklamation vortragen und auf einer Lösung bestehen. 2) Einer Freundin ihre Rechte bei einem Kauf im Internet erklären.
- **Schreiben:** 1) Ein Reklamationsschreiben mit Fristsetzung verfassen (150–180 Wörter). 2) Eine sachliche Bewertung eines Kundendienstes formulieren (100–120 Wörter).

### C1

#### de.c1.e01 · Sprachen, Herkunft, Zugehörigkeit

- **Thema:** Zusammenleben · **Budget:** 145 · **Kind:** nein · **Kandidaten:** F-de-02
- **Kann:** Ich kann mich in angemessenem Register differenziert über Herkunft und Zugehörigkeit äußern. · Ich kann in Essays und Diskussionen unausgesprochene Haltungen erkennen und benennen.
- **Sprechhandlungen:** Position beziehen, auf Gegenargumente eingehen, das Register wechseln, nuanciert zustimmen und widersprechen
- **Geschichte und Dialog:** 1) Geschichte: Selin schreibt für ein Stadtmagazin einen Essay darüber, was „Heimat“ für drei Generationen ihrer Familie bedeutet; im Gespräch mit Oma Sevim und Opa Kamāl entdeckt sie, wie unterschiedlich die beiden ihre Ankunft erlebt haben. 2) Dialog: Bei einer Podiumsdiskussion in der Stadtbibliothek sprechen eine Lehrerin, ein Arzt und eine Studentin über Mehrsprachigkeit im Beruf.
- **Lesen:** 1) Essay über Heimat und Sprache (eigener Text). 2) Wissenschaftlicher Kurzbeitrag zum Sprachwechsel in Familien. 3) Auszug aus einem eigenen Erzähltext über eine Ankunft. 4) Glosse über Behördendeutsch und Alltagssprache.
- **Sprechen:** 1) In einer Diskussion eine differenzierte Position vertreten und auf Gegenargumente eingehen. 2) Denselben Sachverhalt in drei Registern ausdrücken (formell, neutral, umgangssprachlich).
- **Schreiben:** 1) Einen Essay zum Thema Zugehörigkeit schreiben (250–300 Wörter). 2) Einen Text aus dem umgangssprachlichen in das formelle Register übertragen (150–200 Wörter).

#### de.c1.e02 · Führen und verhandeln

- **Thema:** Arbeit und Berufe · **Budget:** 145 · **Kind:** nein
- **Kann:** Ich kann Verhandlungen führen, Interessen diplomatisch vertreten und tragfähige Kompromisse erreichen. · Ich kann Abtönungen im Gespräch deuten und selbst gezielt einsetzen.
- **Sprechhandlungen:** verhandeln, Kritik diplomatisch äußern, Einwände entkräften, Ergebnisse festhalten
- **Geschichte und Dialog:** 1) Geschichte: Ranā leitet inzwischen ein Team und verhandelt mit einem Zulieferer über Liefertermine; als sich die Gespräche festfahren, schlägt sie eine Lösung vor, mit der beide Seiten leben können. 2) Dialog: Emre, jetzt Geselle, führt mit seinem Chef ein Gehaltsgespräch und bringt seine Argumente höflich, aber bestimmt vor.
- **Lesen:** 1) Ratgeberartikel: Grundsätze sachorientierten Verhandelns (eigener Text). 2) Fallbeispiel: eine festgefahrene Verhandlung (erfunden). 3) Interview mit einer Mediatorin (erfunden). 4) Auszug aus einer Betriebsvereinbarung zur Arbeitszeit (erfunden).
- **Sprechen:** 1) Eine Verhandlung als Rollenspiel führen und einen Kompromiss festhalten. 2) Kritik diplomatisch äußern und auf Einwände eingehen.
- **Schreiben:** 1) Ein Verhandlungsergebnis in einer formellen E-Mail festhalten (180–220 Wörter). 2) Eine Stellungnahme zu einem Konflikt im Team verfassen (200–250 Wörter).

#### de.c1.e03 · Wissenschaft verständlich machen

- **Thema:** Wissenschaft und Technik · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann wissenschaftliche Texte verstehen, Aussagen korrekt wiedergeben und Quellen kennzeichnen. · Ich kann schwierige Inhalte für Menschen ohne Fachwissen verständlich aufbereiten.
- **Sprechhandlungen:** zusammenfassen, Quellen wiedergeben, erklären, eine Grafik deuten
- **Geschichte und Dialog:** 1) Geschichte: Selin soll ihre Forschungsergebnisse zu Brillengläsern beim Tag der Wissenschaft für Schülerinnen und Schüler erklären; Laylā hilft ihr, Fachwörter durch Bilder und Vergleiche zu ersetzen. 2) Dialog: Yazan bespricht mit seiner Dozentin, wie man in einer Hausarbeit fremde Ergebnisse richtig wiedergibt.
- **Lesen:** 1) Kurzfassung einer Studie (erfunden). 2) Populärwissenschaftlicher Artikel zum selben Thema. 3) Leitfaden zum richtigen Zitieren. 4) Grafik mit Beschreibungstext.
- **Sprechen:** 1) Ein Forschungsergebnis in fünf Minuten für Menschen ohne Fachwissen erklären. 2) Eine Grafik beschreiben und deuten.
- **Schreiben:** 1) Die Zusammenfassung eines Fachtextes mit korrekter Redewiedergabe schreiben (200–250 Wörter). 2) Einen populärwissenschaftlichen Kurztext für Jugendliche schreiben (200–250 Wörter).

#### de.c1.e04 · Im Kleingedruckten

- **Thema:** Verträge und Rechte · **Budget:** 145 · **Kind:** nein
- **Kann:** Ich kann juristisch geprägte Texte wie Geschäftsbedingungen und Datenschutzerklärungen in den wesentlichen Punkten verstehen. · Ich kann Unklarheiten in Verträgen genau benennen und schriftlich Rückfragen stellen.
- **Sprechhandlungen:** Klauseln erläutern, Rückfragen stellen, Bedenken formulieren, zusammenfassen
- **Geschichte und Dialog:** 1) Geschichte: Ḫālid gründet einen kleinen Elektrobetrieb und lässt seine Geschäftsbedingungen von einer Beraterin prüfen; dabei lernt er, warum manche Klauseln unwirksam wären. 2) Dialog: Derya prüft mit Selin die Bedingungen einer Zusatzversicherung und stellt dem Anbieter gezielte Fragen.
- **Lesen:** 1) Auszug aus Geschäftsbedingungen (erfunden). 2) Datenschutzerklärung einer Anwendung (erfunden). 3) Ratgebertext zu unwirksamen Klauseln. 4) Auszug aus Versicherungsbedingungen (erfunden).
- **Sprechen:** 1) Einer anderen Person die Kernaussagen einer Klausel erklären. 2) In einem Beratungsgespräch Rückfragen zu Vertragsbedingungen stellen.
- **Schreiben:** 1) Eine schriftliche Rückfrage zu unklaren Vertragsklauseln verfassen (180–220 Wörter). 2) Eine verständliche Zusammenfassung einer Datenschutzerklärung schreiben (200–250 Wörter).

#### de.c1.e05 · Debatten und Meinungsbildung

- **Thema:** Medien und Digitales (sachlich) · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann in Debatten schlüssig argumentieren, Gegenpositionen fair wiedergeben und abwägen. · Ich kann Kommentare und Leserbriefe auf ihre Argumentationsweise hin untersuchen.
- **Sprechhandlungen:** argumentieren, Gegenpositionen wiedergeben, abwägen, eine Debatte leiten
- **Geschichte und Dialog:** 1) Geschichte: An Elifs Schule wird über ein Handyverbot diskutiert; Elif soll in der Schulkonferenz die Sicht der Schülerinnen und Schüler vertreten und bereitet Argumente vor, die auch die Eltern überzeugen. 2) Dialog: Jan und Laylā streiten in der Debattier-AG über die Frage, ob Hausaufgaben abgeschafft werden sollten.
- **Lesen:** 1) Zwei Kommentare mit gegensätzlichen Positionen zum Handyverbot. 2) Leserbriefe zu einem Thema aus der Stadt. 3) Sachtext über typische Argumentationsfehler. 4) Protokoll einer Schulkonferenz (erfunden).
- **Sprechen:** 1) In einer Debatte nach festen Regeln eine Position vertreten. 2) Eine Gegenposition zusammenfassen und darauf antworten.
- **Schreiben:** 1) Einen Kommentar zu einem Schulthema schreiben (250–300 Wörter). 2) Eine Erörterung mit Abwägung schreiben (300–350 Wörter).

#### de.c1.e06 · Nachhaltig wirtschaften

- **Thema:** Natur und Umwelt · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann Zusammenhänge zwischen Konsum, Produktion und Umwelt differenziert darstellen. · Ich kann Fachbegriffe in Umwelttexten aus ihren Bestandteilen erschließen.
- **Sprechhandlungen:** ein Konzept vorstellen, Fachbegriffe erklären, Daten deuten, einen Antrag begründen
- **Geschichte und Dialog:** 1) Geschichte: Murat sorgt in der Kantine, in der er arbeitet, für weniger Lebensmittelverschwendung; er wertet mit seinem Team die Abfälle aus und verhandelt mit Lieferbetrieben aus der Region. 2) Dialog: Elif und ihre Mitschülerinnen planen ein Reparatur-Café in der Schule und überlegen, wie sie es dauerhaft organisieren.
- **Lesen:** 1) Fachtext zur Kreislaufwirtschaft. 2) Reportage über einen Betrieb, der Abfall vermeidet (erfunden). 3) Statistik mit Kommentar zur Lebensmittelverschwendung. 4) Interview mit einer Umweltberaterin (erfunden).
- **Sprechen:** 1) Ein Konzept zur Abfallvermeidung vorstellen und verteidigen. 2) Fachbegriffe mit eigenen Worten erklären.
- **Schreiben:** 1) Einen Bericht über ein Nachhaltigkeitsprojekt schreiben (250–300 Wörter). 2) Einen Antrag an die Schulleitung für ein Reparatur-Café formulieren (200–250 Wörter).

#### de.c1.e07 · Amtsdeutsch entschlüsseln

- **Thema:** Behörden und Formulare · **Budget:** 145 · **Kind:** nein
- **Kann:** Ich kann behördliche Bescheide verstehen, Fristen erkennen und angemessen reagieren. · Ich kann schwierige Amtssprache in verständliche Alltagssprache übertragen.
- **Sprechhandlungen:** erläutern, Widerspruch einlegen, einen Sachverhalt klären, umformulieren
- **Geschichte und Dialog:** 1) Geschichte: Ranā erhält einen Bescheid über eine Rückforderung, den sie für fehlerhaft hält; mit Herrn Neumann formuliert sie einen begründeten Widerspruch und hält die Frist ein. 2) Dialog: Selin hilft in einer Beratungsstelle einem älteren Mann, einen Brief der Rentenversicherung zu verstehen.
- **Lesen:** 1) Bescheid mit Rechtsbehelfsbelehrung (erfunden). 2) Ratgeber: Wie man einen Widerspruch schreibt. 3) Leitfaden einer Stadt für bürgernahe Sprache (eigener Text). 4) Vergleich: derselbe Text in Amtssprache und in einfacher Sprache.
- **Sprechen:** 1) Einer anderen Person den Inhalt eines Bescheids in einfachen Worten erklären. 2) Telefonisch bei einer Behörde einen Sachverhalt genau klären.
- **Schreiben:** 1) Einen begründeten Widerspruch verfassen (250–300 Wörter). 2) Einen Amtstext in verständliche Sprache umschreiben (200–250 Wörter).

#### de.c1.e08 · Sprichwörter, Literatur und Erinnerung

- **Thema:** Geschichte und Kultur · **Budget:** 145 · **Kind:** nein
- **Kann:** Ich kann literarische Texte verstehen und ihre Wirkung sowie sprachliche Mittel beschreiben. · Ich kann Redewendungen und Sprichwörter treffend verstehen und gezielt einsetzen.
- **Sprechhandlungen:** deuten, vergleichen, Rückmeldung geben, erzählen
- **Geschichte und Dialog:** 1) Geschichte: Oma Sevim, Opa Kamāl und Herr Neumann sammeln für ein Projekt der Stadtbibliothek Sprichwörter aus drei Sprachen und entdecken überraschende Gemeinsamkeiten. 2) Dialog: Laylā und Jan bereiten eine Lesung eigener Kurzgeschichten vor und geben sich gegenseitig Rückmeldung zu Stil und Aufbau.
- **Lesen:** 1) Kurzgeschichte (eigener Text) über eine Begegnung im Zug. 2) Gedicht über Sprache (eigener Text). 3) Sachtext über die Herkunft deutscher Redewendungen. 4) Rezension eines erfundenen Romans (eigener Text).
- **Sprechen:** 1) Eine Kurzgeschichte vorstellen und deuten. 2) Sprichwörter aus verschiedenen Sprachen vergleichen und erklären.
- **Schreiben:** 1) Eine eigene Kurzgeschichte schreiben (300–350 Wörter). 2) Eine Rezension eines gelesenen Textes verfassen (250–300 Wörter).

#### de.c1.e09 · Demokratie im Alltag

- **Thema:** Staat und Gemeinde (sachlich) · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann Verfahren der Bürgerbeteiligung erklären und mich an öffentlichen Diskussionen sachlich beteiligen. · Ich kann Informationstexte über öffentliche Entscheidungen verstehen und neutral wiedergeben.
- **Sprechhandlungen:** einen Beitrag vortragen, auf Einwände reagieren, Verfahren erklären, Stellung nehmen
- **Geschichte und Dialog:** 1) Geschichte: Die Stadt plant den Umbau des Bahnhofsvorplatzes; Ranā, Herr Neumann und Jan gehen zur Bürgerversammlung, und Herr Neumann setzt sich dafür ein, dass der Platz barrierefrei wird. 2) Dialog: Emre und Selin sprechen darüber, wie ein Einwohnerantrag funktioniert.
- **Lesen:** 1) Informationsblatt der Stadt zur Bürgerbeteiligung (erfunden). 2) Bericht über eine Bürgerversammlung (ruhiger Ton). 3) Sachtext zu Formen der Mitbestimmung in der Gemeinde. 4) Stellungnahme eines Beirats für Menschen mit Behinderung (erfunden).
- **Sprechen:** 1) In einer Bürgerversammlung einen Beitrag vortragen und auf Einwände reagieren. 2) Einer anderen Person ein Beteiligungsverfahren erklären.
- **Schreiben:** 1) Eine Stellungnahme zu einem Bauvorhaben verfassen (250–300 Wörter). 2) Einen Bericht über eine Versammlung schreiben (250–300 Wörter).

#### de.c1.e10 · Projekte planen und leiten

- **Thema:** Ehrenamt · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann ein Projekt planen, dokumentieren und einen gut gegliederten Abschlussbericht verfassen. · Ich kann Besprechungen leiten und Ergebnisse knapp und genau protokollieren.
- **Sprechhandlungen:** eine Besprechung leiten, zwischen Standpunkten vermitteln, einen Zwischenstand berichten, protokollieren
- **Geschichte und Dialog:** 1) Geschichte: Jan und Yazan leiten im Nachbarschaftszentrum ein Lernprojekt für Grundschulkinder; sie erstellen einen Zeitplan, verteilen Zuständigkeiten und schreiben am Ende einen Bericht für das Zentrum. 2) Dialog: In der Projektbesprechung vermittelt Yazan in einem Streit zwischen zwei Freiwilligen.
- **Lesen:** 1) Projektskizze mit Zielen und Zeitplan (erfunden). 2) Protokoll einer Projektbesprechung. 3) Leitfaden: Wie man einen Abschlussbericht gliedert. 4) Erfahrungsbericht einer Projektleiterin (erfunden).
- **Sprechen:** 1) Eine Projektbesprechung leiten (Tagesordnung, Zeit, Ergebnisse). 2) Einen Zwischenstand vorstellen und Abweichungen begründen.
- **Schreiben:** 1) Ein Ergebnisprotokoll im Protokollstil verfassen (200–250 Wörter). 2) Einen gegliederten Abschlussbericht schreiben (300–350 Wörter).

#### de.c1.e11 · Zusammenleben der Generationen

- **Thema:** Zusammenleben · **Budget:** 145 · **Kind:** nein
- **Kann:** Ich kann gesellschaftliche Entwicklungen wie den demografischen Wandel differenziert erläutern. · Ich kann Erfahrungen verschiedener Generationen vergleichen und dabei feine Unterschiede ausdrücken.
- **Sprechhandlungen:** erläutern, vergleichen, gewichten, eine Gruppendiskussion führen
- **Geschichte und Dialog:** 1) Geschichte: Familie Yılmaz überlegt, ob Oma Sevim zu ihnen zieht; die Frage ist zu wichtig, als dass sie an einem Abend entschieden werden könnte, und jede Generation bringt eigene Erwartungen ein. 2) Dialog: Elif befragt für ein Schulprojekt Herrn Neumann und ihre Oma, wie sich das Älterwerden in Deutschland verändert hat.
- **Lesen:** 1) Sachtext zum demografischen Wandel mit Grafik. 2) Reportage über ein Wohnprojekt für Jung und Alt (erfunden). 3) Kommentar zur Rolle der Großeltern. 4) Interview mit einer Altersforscherin (erfunden).
- **Sprechen:** 1) Eine Gruppendiskussion über Gerechtigkeit zwischen den Generationen führen (sachlich, neutral). 2) Erfahrungen aus zwei Generationen vergleichen und gewichten.
- **Schreiben:** 1) Einen Essay zum Zusammenleben der Generationen schreiben (300–350 Wörter). 2) Ein Interview zu einem Porträt umschreiben (250–300 Wörter).

#### de.c1.e12 · Präsentieren und überzeugen

- **Thema:** Arbeit und Berufe · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann ein Konzept vor einer Geschäftsführung oder einer Jury vorstellen und auf kritische Nachfragen ruhig antworten. · Ich kann Wichtiges durch Satzbau und Betonung hervorheben.
- **Sprechhandlungen:** präsentieren, hervorheben, Einwände vorwegnehmen, auf kritische Fragen antworten
- **Geschichte und Dialog:** 1) Geschichte: Ranā stellt der Geschäftsführung ein neues Konzept für die Fertigung vor; sie übt mit Selin, die wichtigsten Punkte an den Anfang zu stellen und Einwände vorwegzunehmen. 2) Dialog: Laylā stellt bei einem Schülerwettbewerb ihr Projekt vor und antwortet gelassen auf kritische Fragen der Jury.
- **Lesen:** 1) Ratgeber: Aufbau einer überzeugenden Präsentation. 2) Redemanuskript (eigener Text). 3) Analyse einer Rede zu einem erfundenen Anlass (eigener Text). 4) Bewertungsbogen eines Wettbewerbs.
- **Sprechen:** 1) Eine zehnminütige Präsentation halten. 2) Auf kritische Rückfragen spontan und sachlich antworten.
- **Schreiben:** 1) Ein Redemanuskript für einen Kurzvortrag schreiben (250–300 Wörter). 2) Eine schriftliche Zusammenfassung einer Präsentation für Abwesende verfassen (200–250 Wörter).

#### de.c1.e13 · Technik und Verantwortung

- **Thema:** Wissenschaft und Technik · **Budget:** 145 · **Kind:** ja
- **Kann:** Ich kann Fragen der Verantwortung in der Technik differenziert erörtern und verschiedene Sichtweisen gewichten. · Ich kann dichte Fachtexte mit komplexen Attributen verstehen und in klare Sätze auflösen.
- **Sprechhandlungen:** erörtern, gewichten, auflösen und umformulieren, Stellung nehmen
- **Geschichte und Dialog:** 1) Geschichte: Yazan entwickelt im Studium ein Programm, das Formulare in mehrere Sprachen überträgt; im Seminar diskutiert er, welche Verantwortung Entwicklerinnen und Entwickler für Fehler tragen. 2) Dialog: Herr Neumann und Selin sprechen darüber, wie Barrierefreiheit von Anfang an in der Technik mitgedacht werden kann.
- **Lesen:** 1) Fachartikel über automatisierte Entscheidungen (eigener Text). 2) Leitlinien eines Fachverbands zur Barrierefreiheit (eigener Text). 3) Streitgespräch zweier Fachleute (erfunden). 4) Glossar technischer Fachbegriffe.
- **Sprechen:** 1) In einer Fachrunde eine Position zu einer technischen Neuerung vertreten. 2) Einen dichten Fachsatz mündlich in verständliche Sätze übertragen.
- **Schreiben:** 1) Eine Erörterung zu einer Frage der Technikverantwortung schreiben (300–350 Wörter). 2) Eine Stellungnahme für ein Fachforum verfassen (250–300 Wörter).

#### de.c1.e14 · Lebenswege – Rückblick und Ausblick

- **Thema:** Arbeit und Berufe · **Budget:** 115 · **Kind:** ja
- **Kann:** Ich kann meinen eigenen Lern- und Lebensweg überlegt und stilistisch passend darstellen. · Ich kann Ziele für die Zukunft formulieren und begründen, wie ich sie erreichen will.
- **Sprechhandlungen:** zurückblicken, würdigen, Ziele begründen, Ratschläge kommentieren
- **Geschichte und Dialog:** 1) Geschichte: Zum zehnjährigen Bestehen des Nachbarschaftszentrums blicken die Familien Yılmaz, an-Naǧǧār und Becker zurück: Laylā beginnt ein Studium, Emre hat seine Meisterprüfung bestanden, Ranā leitet ein Team, und Oma Sevim liest aus ihren Lebenserinnerungen vor. 2) Dialog: Laylā und Elif sprechen darüber, was sie in zehn Jahren erreicht haben wollen.
- **Lesen:** 1) Lebenserinnerungen einer älteren Frau (eigener Text). 2) Porträts von Bildungswegen (erfundene Personen). 3) Sachtext über lebenslanges Lernen. 4) Ansprache zum Jubiläum (eigener Text).
- **Sprechen:** 1) Den eigenen Lernweg in einer kurzen Ansprache würdigen. 2) Über Zukunftspläne sprechen und Ratschläge differenziert kommentieren.
- **Schreiben:** 1) Einen nachdenklichen Text über den eigenen Lernweg schreiben (300–350 Wörter). 2) Ein Motivationsschreiben für ein Studium oder eine Weiterbildung verfassen (250–300 Wörter).
