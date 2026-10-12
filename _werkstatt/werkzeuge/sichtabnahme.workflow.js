export const meta = {
  name: 'sichtabnahme',
  description: 'Frische Opus-Sichtprüfer bewerten alle Hauptansichten (Bilder eines Produktions-Builds), Gegenprüfer verifizieren jedes Befundpaket, Synthese zu priorisierten Paketen',
  phases: [
    { title: 'Bewerten', detail: 'fünf unabhängige Sichtprüfer je Ansichtsgruppe' },
    { title: 'Gegenprüfen', detail: 'je Gruppe ein adversarialer Prüfer für alle Befundpakete' },
    { title: 'Synthese', detail: 'Zusammenführen, entdoppeln, priorisieren, Schreibrechte schneiden' },
  ],
}

const S = '/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad'
// args: { lauf: 'E4', bilder: '<scratchpad>/bilder/e4', vorher: '<scratchpad>/bilder/head', vorherName: 'E3', verwaltung: '<werkstatt>/bilder/E4-verwaltung', vorherVerwaltung: '<werkstatt>/bilder/HEAD-verwaltung', praefix: 'H-C' }
const LAUF = args.lauf
const BASIS = args.bilder
const B = `${BASIS}/bildsatz`
const R = `${BASIS}/bildsatz-reduziert`
const VB = `${args.vorher}/bildsatz`
const VN = args.vorherName
const E0 = '/home/user/IGMG/_werkstatt/bilder/e0'
const W = '/home/user/IGMG/_werkstatt'
const PX = args.praefix

const RAHMEN = `Du bist ein frischer, unabhängiger Sichtprüfer (keine Vorgeschichte) im Lauf „Gestaltung aufwerten und Vercel-startklar machen“ für die Web-App der IGMG Wetzlar (Moscheegemeinde; vier Organisationen AT/KT/GT/KGT; Deutsch/Türkisch/Englisch). Du urteilst anhand von Bildern (mit dem Read-Werkzeug öffnen), Kern und Register – du änderst keine Dateien, startest keine Server, führst keine Tests aus.
Lies zuerst: ${W}/KERN.md (K-001 Leitidee, K-005 Designsystem, K-006 Typografie, K-007 Bewegungsregister B-01…B-12 inkl. „Arbeitsansichten nur B-01–B-05, B-10–B-12“, K-008 SVG-Formsystem, K-009 Zustände, K-010 Ton), ${W}/pakete/REFERENZ.md (Muster der Referenzansicht Startseite), ${W}/AUFTRAG.md §10 (Rubrik) und die Regeln zu Religion (keine Verse/Kalligrafie als Schmuck, geometrische Muster nur dezent und nie hinter Text) und UNANTASTBAR (Logos nie hochskalieren, Rechtstexte, Gebetszeiten-Logik und -Quelle, Formularlogik, Rechte, Datenmodell, Stammdaten).
Hinweise zu den Bildern: Gestreifte Flächen mit „Foto: …“ sind gewollte Platzhalter für fehlende echte Fotos (bewerte die Gestaltung der Fläche, nicht das Fehlen). Eckige Klammern wie [Name], [Adresse] sind gewollte Inhalts-Platzhalter. Im normalen Bildsatz können Auftritte mitten in der Bewegung fotografiert sein – dann im reduzierten Bildsatz (${R}/<ansicht>/…) den Endzustand ansehen. Die Aufnahmen entstanden nachts bzw. früh am Morgen (die Leiste zeigt Imsak als nächstes Gebet). Vergleichsbilder des vorigen Stands (${VN}) liegen unter ${VB}/<ansicht>/… – bewerte den heutigen Stand eigenständig nach der Rubrik, der Vergleich dient nur der Begründung.
RUBRIK: Kategorien typografie · komposition · farbe_bild · bewegung · grafik · details, je 1–10. Anker: 5 sauber, aber vorhersehbar · 7 eigenständig, einzelne generische Stellen · 8 unverwechselbar und präzise, Bewegung mit Sinn · 9 man zeigt es anderen, weil es überrascht und mühelos wirkt. wert = Mittel der sechs (eine Nachkommastelle). Ziel: jede Ansicht ≥ 8.
BEFUNDPAKETE: Für jede Kategorie unter 8 höchstens zwei konkrete Pakete je Ansicht; bevorzuge übergreifende Pakete (ein Baustein, der in mehreren Ansichten wirkt). Jedes Paket: titel, ansicht (oder „mehrere: …“), kategorie, ort (Bilddatei + vermutliches Element), aenderung (genau, umsetzbar, nur mit Werten des Designsystems, kein erfundener Inhalt, keine neue Bewegung außerhalb des Registers), abnahme (woran man das Ergebnis im Bild erkennt), wirkung (hoch/mittel/gering), uebergreifend (true/false). Lieber wenige starke Pakete als viele kleine. Verstöße gegen Kern/Religion/UNANTASTBAR gesondert nennen.`

const PAKET = {
  type: 'object',
  properties: {
    titel: { type: 'string' }, ansicht: { type: 'string' }, kategorie: { type: 'string' }, ort: { type: 'string' },
    aenderung: { type: 'string' }, abnahme: { type: 'string' }, wirkung: { type: 'string', enum: ['hoch', 'mittel', 'gering'] },
    uebergreifend: { type: 'boolean' },
  },
  required: ['titel', 'ansicht', 'kategorie', 'ort', 'aenderung', 'abnahme', 'wirkung', 'uebergreifend'],
}
const URTEIL = {
  type: 'object',
  properties: {
    ansichten: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ansicht: { type: 'string' }, typografie: { type: 'number' }, komposition: { type: 'number' }, farbe_bild: { type: 'number' },
          bewegung: { type: 'number' }, grafik: { type: 'number' }, details: { type: 'number' }, wert: { type: 'number' },
          begruendung: { type: 'string' }, vergleich_vorher: { type: 'string' },
        },
        required: ['ansicht', 'typografie', 'komposition', 'farbe_bild', 'bewegung', 'grafik', 'details', 'wert', 'begruendung'],
      },
    },
    uebergreifend: { type: 'string' },
    pakete: { type: 'array', items: PAKET },
    verstoesse: { type: 'array', items: { type: 'string' } },
  },
  required: ['ansichten', 'uebergreifend', 'pakete', 'verstoesse'],
}

const GRUPPEN = [
  { key: 'start', label: 'Startseite (Referenzansicht)', inhalt: `Startseite: ${B}/start/{390x844,768x1024,1440x900}/schirm-*.jpg (alle Ausschnitte), Vorher ${VB}/start/… (Stand ${VN}) und ${E0}/start/… (Ausgangsstand). Großer Moment B-06 Tagesbogen: ${BASIS}/momente/b06-l1-1.jpg … b06-l1-5.jpg (Bildfolge über die Laufzeit, aufgenommen mit fester Browser-Uhr 14:00, damit die Linie bis „jetzt“ sichtbar ist; der Bildsatz der Startseite selbst entstand nachts vor Imsak, dort ist der Bogen noch leer) und b06-reduziert.jpg. Seitenwechsel B-05 mit gemeinsamen Elementen Karte → Detail: ${BASIS}/seitenwechsel/nachricht/zeitlupe-01…05.jpg und ${BASIS}/seitenwechsel/veranstaltung/zeitlupe-01…05.jpg. Gebetszeit-Wechsel B-10 in der Leiste: ${BASIS}/leiste/wechsel-1440/leiste-1440-1…5.jpg und wechsel-390/…. Bewerte die Startseite streng als Referenz: sie setzt den Maßstab für alle anderen.` },
  { key: 'arbeit-a', label: 'Arbeitsansichten A', inhalt: `Gebetszeiten (${B}/gebetszeiten), Veranstaltungen (${B}/veranstaltungen), Veranstaltungsdetail (${B}/veranstaltungen_freitagsgebet-mit-anschliessendem-vortrag), Nachrichten (${B}/nachrichten), Nachrichtendetail (${B}/nachrichten_neue-gebetszeiten-fuer-den-winter). Je Ansicht höchstens 6 Ausschnitte (bevorzugt 390 schirm-01..03 und 1440 schirm-01..03). Vorher unter ${VB}/<ansicht>/… (Stand ${VN}).` },
  { key: 'arbeit-b', label: 'Arbeitsansichten B und Zustände', inhalt: `Korankurse (${B}/bildung_korankurse), Schüler-Voranmeldung (${B}/bildung_voranmeldung), Kontakt (${B}/kontakt), dazu die 404-Seite (${B}/gibt-es-nicht) als Zustandsansicht. Je Ansicht höchstens 6 Ausschnitte (390 schirm-01..03, 1440 schirm-01..03). Vorher unter ${VB}/<ansicht>/… (Stand ${VN}).` },
  { key: 'erzaehl', label: 'Erzählansichten', inhalt: `Über uns (${B}/ueber-uns), Projekte (${B}/projekte), Organisationsseite (${B}/organisationen_ana-teskilati). Je Ansicht höchstens 6 Ausschnitte plus Endzustände im reduzierten Bildsatz, wo Momente mitten in der Bewegung stehen. Große Momente: B-07 Weg der Gemeinde ${BASIS}/momente/b07-l1-1…5.jpg und b07-reduziert.jpg; B-08 Meilensteinlinie b08-*; B-09 Familie der vier b09-*. Vorher unter ${VB}/<ansicht>/… (Stand ${VN}). Erzählansichten dürfen mehr Charakter zeigen als Arbeitsansichten.` },
  { key: 'verwaltung', label: 'Verwaltung und Startklar-Cockpit', inhalt: `Angemeldete Verwaltung (Arbeitsoberfläche für Ehrenamtliche, nur Deutsch): ${args.verwaltung}/verwaltung-{390,1440}.jpg (Übersicht), postfach-*, veranstaltungen-* (Liste), startklar-* (Startklar-Cockpit, eine Hauptansicht: Prüfungen vor dem Livegang). Vorher (Stand ${VN}): ${args.vorherVerwaltung}/…. Maßstab: ruhige, klare Arbeitsoberfläche im selben Designsystem wie die Website; Bewegung nur Register-Arbeitsansichten.` },
]

const PRUEF_SCHEMA = {
  type: 'object',
  properties: {
    pakete: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          titel: { type: 'string' }, urteil: { type: 'string', enum: ['behalten', 'aendern', 'verwerfen'] }, grund: { type: 'string' },
          aenderung_praezisiert: { type: 'string' }, abnahme: { type: 'string' }, dateien_vermutlich: { type: 'array', items: { type: 'string' } },
          wirkung: { type: 'string', enum: ['hoch', 'mittel', 'gering'] }, ansicht: { type: 'string' }, uebergreifend: { type: 'boolean' },
        },
        required: ['titel', 'urteil', 'grund', 'aenderung_praezisiert', 'abnahme', 'dateien_vermutlich', 'wirkung', 'ansicht', 'uebergreifend'],
      },
    },
    zusaetzlich_uebersehen: { type: 'array', items: PAKET },
  },
  required: ['pakete', 'zusaetzlich_uebersehen'],
}

phase('Bewerten')
const ergebnisse = await pipeline(
  GRUPPEN,
  (g) => agent(`${RAHMEN}

DEINE ANSICHTEN (${g.label}): ${g.inhalt}

Gib das Urteil über das Schema zurück.`, { label: `Sicht ${g.key}`, phase: 'Bewerten', agentType: 'general-purpose', schema: URTEIL }),
  (urteil, g) => urteil && agent(`Du bist ein adversarialer Gegenprüfer (frisch, keine Vorgeschichte) für die Sichtabnahme der Ansichtsgruppe „${g.label}“ der Web-App der IGMG Wetzlar (Repo /home/user/IGMG, App in web/). Ein Sichtprüfer hat Befundpakete vorgeschlagen. Deine Aufgabe ist, jedes Paket zu WIDERLEGEN zu versuchen – im Zweifel „verwerfen“ oder „aendern“.
Regeln und Maßstab: ${W}/KERN.md (K-005…K-010; Bewegungsregister: Arbeitsansichten nur B-01–B-05, B-10–B-12), ${W}/pakete/REFERENZ.md, ${W}/AUFTRAG.md (UNANTASTBAR, Religion, keine erfundenen Inhalte, Logos nie hochskalieren, Rechtstexte unverändert), web/CLAUDE.md (Texte nur aus messages, Werte nur aus Tokens in web/src/app/globals.css).
Prüfe je Paket: (1) Ist der Befund im genannten Bild wirklich zu sehen? Öffne das Bild (Read). Im normalen Bildsatz können Auftritte mitten in der Bewegung stehen – vergleiche mit dem reduzierten Bildsatz unter ${R}. (2) Ist die Änderung erlaubt (Register, UNANTASTBAR, Religion, Designsystem, kein erfundener Inhalt, keine neuen Texte ohne Bedarf)? (3) Ist sie verhältnismäßig und eindeutig umsetzbar? Finde mit Grep/Glob die vermutlich betroffenen Dateien unter web/src (Komponenten, Seiten) und nenne sie in dateien_vermutlich. (4) Präzisiere die Änderung so, dass ein Baumeister sie ohne Rückfrage umsetzen kann.
Wenn du beim Prüfen einen gravierenderen Befund siehst, den der Sichtprüfer übersehen hat, nenne ihn unter zusaetzlich_uebersehen (höchstens zwei).

URTEIL DES SICHTPRÜFERS (JSON):
${JSON.stringify(urteil)}`, { label: `Gegenprüfung ${g.key}`, phase: 'Gegenprüfen', agentType: 'general-purpose', schema: PRUEF_SCHEMA })
    .then((pruefung) => ({ gruppe: g.key, urteil, pruefung })),
)

phase('Synthese')
const gueltig = ergebnisse.filter(Boolean)
log(`${gueltig.length} von ${GRUPPEN.length} Gruppen bewertet und gegengeprüft`)
const synthese = await agent(`Du führst die Sichtabnahme ${LAUF} der Web-App der IGMG Wetzlar zusammen (Repo /home/user/IGMG). Grundlage: Urteile von fünf unabhängigen Sichtprüfern und die Ergebnisse adversarialer Gegenprüfer (unten als JSON). Lies ${W}/pakete/REFERENZ.md und ${W}/KERN.md K-007 kurz zur Einordnung.
Aufgaben:
1. Tabelle aller Ansichten mit den sechs Werten und dem Ansichtswert (aus den Urteilen; nicht verändern), dazu das Gesamtmittel und je Ansicht der Vergleich zum vorigen Stand (Werte des vorigen Laufs stehen in /home/user/IGMG/_werkstatt/berichte/SICHTABNAHME-E3.md, Abschnitt 1).
2. Endgültige Befundpakete ${PX}01, ${PX}02, … (nur für Ansichten unter 8 oder klare Mängel; sind alle Ansichten ≥ 8, darf die Liste leer sein): nur Pakete mit urteil „behalten“ oder „aendern“ (in der präzisierten Fassung) plus zusaetzlich_uebersehen, sofern plausibel. Entdoppeln (gleiche Ursache in mehreren Ansichten → ein übergreifendes Paket), priorisieren nach Wirkung (hoch zuerst, übergreifend vor einzeln), höchstens 14 Pakete. Je Paket: kennung, titel, ansichten, aenderung, abnahme, wirkung, schreibrechte (konkrete Dateien/Ordner unter web/src aus dateien_vermutlich; prüfe mit Glob, dass sie existieren), gemeinsame_dateien (z. B. globals.css, messages – die erledigt der Orchestrator), welle (1 oder 2: Pakete einer Welle müssen DISJUNKTE schreibrechte haben, damit bis zu vier Baumeister parallel arbeiten können).
3. Verworfene Pakete kurz mit Grund (eine Zeile je Paket).
4. Verstöße gegen Kern/Religion/UNANTASTBAR, falls genannt.
Gib zurück: markdown (vollständiger Bericht auf Deutsch, knapp, mit Bildbezügen) und pakete (strukturiert).

DATEN:
${JSON.stringify(gueltig)}`, {
  label: 'Synthese',
  phase: 'Synthese',
  agentType: 'general-purpose',
  schema: {
    type: 'object',
    properties: {
      markdown: { type: 'string' },
      gesamtmittel: { type: 'number' },
      pakete: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            kennung: { type: 'string' }, titel: { type: 'string' }, ansichten: { type: 'string' }, aenderung: { type: 'string' },
            abnahme: { type: 'string' }, wirkung: { type: 'string' }, schreibrechte: { type: 'array', items: { type: 'string' } },
            gemeinsame_dateien: { type: 'array', items: { type: 'string' } }, welle: { type: 'number' },
          },
          required: ['kennung', 'titel', 'ansichten', 'aenderung', 'abnahme', 'wirkung', 'schreibrechte', 'gemeinsame_dateien', 'welle'],
        },
      },
    },
    required: ['markdown', 'gesamtmittel', 'pakete'],
  },
})
return { synthese, roh: gueltig }
