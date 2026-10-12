export const meta = {
  name: 'endpruefung',
  description: 'Endprüfung (AUFTRAG Abschluss): Blindvergleich Vorher/Nachher für Z-04, danach ein frischer Opus-Endprüfer, der jedes Kriterium Z-01–Z-12 gegen seinen Beleg bestätigt',
  phases: [{ title: 'Blindvergleich' }, { title: 'Endprüfer' }],
}

// args: { blind: '<ordner ansicht-NN/{390,1440}/{A,B}>', schluessel: { 'ansicht-01': { name, pfad, A: 'vorher'|'nachher', B } … },
//         abnahme: '/home/user/IGMG/_werkstatt/ABNAHME.md', bewegung: '<ordner momente/seitenwechsel des Abschlusses>', stand: '<commit>' }
// Der Schlüssel steht nur in args (Skript), nie im Auftrag der Blindprüfer.
const BLIND = args.blind
const SCHLUESSEL = args.schluessel
const ANSICHTEN = Object.keys(SCHLUESSEL).sort()
const GRUPPEN = []
for (let i = 0; i < ANSICHTEN.length; i += 3) GRUPPEN.push(ANSICHTEN.slice(i, i + 3))

const KATEGORIEN = ['typografie', 'komposition', 'farbe_bild', 'grafik', 'details']
const NOTEN = { type: 'object', properties: Object.fromEntries(KATEGORIEN.map((k) => [k, { type: 'number' }])), required: KATEGORIEN }
const BLIND_SCHEMA = {
  type: 'object',
  properties: {
    ansichten: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ansicht: { type: 'string' },
          A: NOTEN,
          B: NOTEN,
          vorgezogen: { type: 'string', enum: ['A', 'B'] },
          begruendung: { type: 'string', description: 'höchstens drei Sätze, mit Bildbezug (Gerät, Bildschirm)' },
        },
        required: ['ansicht', 'A', 'B', 'vorgezogen', 'begruendung'],
      },
    },
  },
  required: ['ansichten'],
}

const blindPrompt = (gruppe) => `Du bist unabhängiger Gestaltungsprüfer (Blindvergleich). Für jede der Ansichten ${gruppe.join(', ')} liegen zwei Bildsätze derselben Webseite einer Moscheegemeinde (IGMG Wetzlar, Deutsch/Türkisch) vor: ${BLIND}/<ansicht>/{390,1440}/{A,B}/schirm-NN.jpg (390 = Telefon, 1440 = Desktop, je bis zu drei Bildschirmhöhen von oben). Gleiche Inhalte, unterschiedliche Gestaltungsstände. Welcher Stand älter ist, weißt du nicht und sollst du nicht herausfinden: Lies KEINE Dateien außerhalb von ${BLIND}, keine Git-Befehle, keine Projektdateien.

Sieh dir jedes Bild mit Read an. Bewerte A und B getrennt je Kategorie von 1 bis 10 (10 = Spitzenniveau, 8 = sehr gut, 6 = solide, 4 = schwach):
- typografie: Hierarchie, Lesemaß, Zeilenabstand, Schriftmischung, Umbrüche
- komposition: Raster, Weißraum, Gewichtung, mobile Komposition als eigene Lösung (nicht gestapelter Desktop)
- farbe_bild: Farbklima, Grün nur für Handlung/Marke, Kontraste, Bildflächen
- grafik: Formsystem und Ornament (Achtstern als einziges Ornament, dezent, nie hinter Text), Icons aus einer Familie
- details: Präzision (Abstände, Ausrichtung, Waisen, abgeschnittene Texte, Zustände)
Dann: welcher Stand insgesamt vorgezogen wird (A oder B), mit kurzer Begründung und Bildbezug. Urteile streng und fair; kein Stand ist automatisch besser.`

const BEURTEILUNG = {
  type: 'object',
  properties: {
    kriterien: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          kennung: { type: 'string', description: 'Z-01 … Z-12, AUSNAHME-…, UA-01 …' },
          ergebnis: { type: 'string', enum: ['bestätigt', 'nicht bestätigt'] },
          zeile: { type: 'string', description: 'eine Zeile: Kennung · Ergebnis · Kurzbegründung · Belegpfad(e)' },
        },
        required: ['kennung', 'ergebnis', 'zeile'],
      },
    },
    bewegung_noten: {
      type: 'array',
      description: 'Bewegungsnote 1–10 je Hauptansicht aus den Bewegungsbelegen (Einzelbilder der Momente, Seitenwechsel, Messprotokolle)',
      items: { type: 'object', properties: { ansicht: { type: 'string' }, note: { type: 'number' }, beleg: { type: 'string' } }, required: ['ansicht', 'note', 'beleg'] },
    },
    gesamturteil: { type: 'string' },
  },
  required: ['kriterien', 'bewegung_noten', 'gesamturteil'],
}

phase('Blindvergleich')
const blind = (
  await parallel(GRUPPEN.map((g, i) => () => agent(blindPrompt(g), { label: `Blind ${i + 1}`, phase: 'Blindvergleich', schema: BLIND_SCHEMA, effort: 'high' })))
)
  .filter(Boolean)
  .flatMap((r) => r.ansichten)

// Schlüssel anwenden (nur im Skript)
const mittel = (n) => KATEGORIEN.reduce((s, k) => s + n[k], 0) / KATEGORIEN.length
const aufgeloest = blind.map((b) => {
  const s = SCHLUESSEL[b.ansicht]
  if (!s) return { ...b, fehler: 'unbekannte Ansicht' }
  const nachherSeite = s.A === 'nachher' ? 'A' : 'B'
  const vorherSeite = nachherSeite === 'A' ? 'B' : 'A'
  return {
    ansicht: b.ansicht,
    name: s.name,
    pfad: s.pfad,
    nachher: b[nachherSeite],
    vorher: b[vorherSeite],
    nachherMittel5: Math.round(mittel(b[nachherSeite]) * 100) / 100,
    vorherMittel5: Math.round(mittel(b[vorherSeite]) * 100) / 100,
    nachherVorgezogen: b.vorgezogen === nachherSeite,
    begruendung: b.begruendung,
  }
})
const fehlend = ANSICHTEN.filter((a) => !aufgeloest.some((x) => x.ansicht === a))
if (fehlend.length) log(`Blindvergleich ohne Ergebnis für: ${fehlend.join(', ')}`)

phase('Endprüfer')
const endPrompt = `Du bist der frische Endprüfer (Opus) des Laufs „Gestaltung aufwerten und Vercel-startklar machen“ für die Web-App der IGMG Wetzlar (Repo /home/user/IGMG, Stand ${args.stand}). Du führst KEINE Tests aus und änderst KEINE Dateien. Du prüfst Belege und Bildsätze.

Auftrag (AUFTRAG Abschlussregel): Bestätige jedes Häkchen, jede AUSNAHME und jede UMGEBUNGSAUSNAHME in ${args.abnahme} gegen ihren Beleg. Lies dazu ABNAHME.md vollständig und öffne JEDEN genannten Belegpfad (Protokolle unter /home/user/IGMG/_werkstatt/protokolle/, Berichte unter /home/user/IGMG/_werkstatt/berichte/, Dateien im Repo, Bilder unter /home/user/IGMG/_werkstatt/bilder/). Ein Kriterium ist nur „bestätigt“, wenn der Beleg existiert, zum behaupteten Stand passt und das Ziel aus ABNAHME.md erfüllt. Fehlt ein Beleg oder widerspricht er, „nicht bestätigt“ mit Grund. Zahlen nachrechnen, wo sie im Beleg stehen.

Für Z-04 liegt der Blindvergleich vor (unabhängige Prüfer, Schlüssel erst danach angewandt; Kategorien ohne Bewegung, Mittel aus fünf):
${JSON.stringify(aufgeloest, null, 1)}
${fehlend.length ? `Ohne Blindergebnis: ${fehlend.join(', ')}\n` : ''}Ergänze die sechste Kategorie Bewegung je Hauptansicht aus den Bewegungsbelegen (${args.bewegung}, Protokolle C-momente-*, C-bewegung-*, C-vt-*). Ansichtswert = Mittel der sechs Kategorien. Z-04 verlangt: jede Hauptansicht ≥ 8, keine Kategorie < 7, Nachher überall vorgezogen. Rechne das nach und urteile.
Z-10: prüfe BERICHT.md, KERN.md, MENSCHEN.md und die Anleitung zum Zusammenführen und Zurückrollen (in BERICHT.md) auf Vollständigkeit nach AUFTRAG (/home/user/IGMG/_werkstatt/AUFTRAG.md, Abschnitt Abschluss) und die Galerie /home/user/IGMG/_werkstatt/bilder/galerie.html.

Antwort: je Kriterium (Z-01 bis Z-12, dann jede AUSNAHME und jede UMGEBUNGSAUSNAHME UA-01 …) eine Zeile im Format „Kennung · bestätigt|nicht bestätigt · Begründung · Belegpfad(e)“.`

const endpruefer = await agent(endPrompt, { label: 'Endprüfer', phase: 'Endprüfer', schema: BEURTEILUNG, effort: 'max' })
return { blind: aufgeloest, fehlend, endpruefer }
