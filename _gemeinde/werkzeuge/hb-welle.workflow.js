export const meta = {
  name: 'hb-welle',
  description: 'H-B-Befundpakete der Sichtabnahme: Haiku baut, Opus nimmt ab, Haiku bessert nach, frischer Opus nimmt erneut ab',
  phases: [
    { title: 'Bauen', model: 'haiku' },
    { title: 'Abnahme' },
    { title: 'Nachbessern', model: 'haiku' },
    { title: 'Nachabnahme' },
  ],
}

const S = '/tmp/claude-0/-home-user-IGMG/6e3f84a1-4b22-5662-a7be-b2354f6302e9/scratchpad'
const PAKETE = args.pakete
const ANDERE = args.andere ?? ''
const LAUF = args.lauf ?? 'E3'

const bauPrompt = (p) => `Rolle: Baumeister (Haiku). Befundpaket ${p.kennung} aus der Sichtabnahme ${LAUF}. Projekt: IGMG Wetzlar (Moscheegemeinde, vier Organisationen, de/tr/en), Next.js 16.4 in /home/user/IGMG/web, Branch claude/blissful-edison-x3j16w.

ZUERST LESEN: dein Paketauftrag ${p.datei} (verbindlich: Änderung, Abnahmekriterien, Schreibrechte, Hinweise), dann /home/user/IGMG/_gemeinde/pakete/briefings/ROLLEN.md („Baumeister“, „Für alle“), /home/user/IGMG/_gemeinde/pakete/REFERENZ.md (Muster, freie Werte → Tokens), /home/user/IGMG/_gemeinde/KERN.md K-005 bis K-010 (Bewegungsregister K-007), web/CLAUDE.md, web/AGENTS.md, web/docs/MUSTER.md. Vor Next.js-Code die passende Seite in web/node_modules/next/dist/docs/ lesen.

ARBEITSWEISE:
1. Vorher-Bilder ZUERST (vor jeder Änderung): je Prüfpfad 390 und 1440 mit 'node /home/user/IGMG/_gemeinde/werkzeuge/einzelbild.mjs <pfad> --breite 390 --basis http://localhost:3200 --warte 4000 --voll --aus /home/user/IGMG/_gemeinde/bilder/${p.kennung}/vorher-<name>-390.jpg' (Verwaltung zusätzlich --zustand ${S}/verwaltung-state.json). Prüfpfade: ${p.pfade}. Antwortet der Server nicht oder zeigt alten Stand: 'bash ${S}/dev-neustart.sh' (stellt sicher, dass du danach weiterarbeitest).
2. Die Änderung aus dem Paketauftrag vollständig umsetzen, Punkt für Punkt, nur in deinen Schreibrechten. Kein Punkt stillschweigend weglassen: was nicht geht, im Bericht mit Grund.
3. UNANTASTBAR: Logos (nie hochskalieren), Rechtstext-Wortlaut, Gebetszeiten-Logik und -Quelle, Formularlogik (Feldnamen, Validierung, Actions, ALTCHA), Rechte, Datenmodell, Datenabfragen (server/queries nur lesen), Stammdaten/Seeds, Prüfungen des Cockpits (nur erweitern). Religion: keine Verse/Kalligrafie als Schmuck, geometrische Muster nur dezent und nie hinter Text. Keine neuen Abhängigkeiten, keine eigenen @keyframes (nur Register), keine freien Werte, nichts erfinden (neue Texte nur wie im Paket genannt).
4. Stufe A (aus /home/user/IGMG/web): 'pnpm exec tsc --noEmit -p .' (Fehler in fremden Dateien stammen von parallelen Paketen), 'pnpm exec eslint <deine Dateien>', 'pnpm exec prettier --check <deine Dateien>' (bei Befund --write), betroffene Unit-Tests ('grep -rl' nach Komponentennamen in web/tests/unit, dann 'pnpm exec vitest run --project unit <Dateien>'; bei Sprachdateien zusätzlich 'pnpm sprachen:pruefen'), 'node /home/user/IGMG/_gemeinde/werkzeuge/freie-werte.mjs --protokoll /home/user/IGMG/_gemeinde/protokolle/${p.kennung}-freie-werte <Dateien>' (Ziel 0), E2E-Erwartungen nicht brechen ('grep -rn' nach geänderten Texten/Rollen in web/tests/e2e; Aria-Labels und Überschriftenebenen, die Tests erwarten, beibehalten).
5. Nachher-Bilder wie in 1. (Namenszusatz nachher-), mit Read ansehen und selbstkritisch gegen die Abnahmekriterien prüfen; Überlauf bei 390 ausschließen.
RÜCKSICHT: Parallel arbeiten andere Pakete (${ANDERE}) in anderen Dateien. Nur deine Dateien schreiben; keine Builds; Server 3100, 3400, 3500 nie beenden; Integrationstests nur einzeln; nie Formulare absenden, keine Daten in der Verwaltung ändern.

RÜCKGABE (deine Abschlussantwort, keine Berichtsdatei schreiben): Bericht im Ausgabeformular aus ROLLEN.md – geänderte/neue Dateien; je Punkt der Änderung: umgesetzt / teilweise / nicht (mit Grund); Prüfergebnisse mit Zahlen; Bilderpfade; neue oder geänderte Sprachschlüssel (Schlüssel + de/tr/en); BEDARF an gemeinsamen Dateien (globals.css, MENSCHEN, TEXTVORSCHLAEGE, KERN, Seeds) mit genauem Text; OFFENE FRAGEN. Du committest und pushst nicht.`

const SCHEMA = {
  type: 'object',
  properties: {
    urteil: { type: 'string', enum: ['angenommen', 'nachbessern', 'zurueckweisen'] },
    note: { type: 'number', description: 'Gestaltungsnote 1-10 der betroffenen Ansichten nach der Änderung (Ziel ≥ 8)' },
    zusammenfassung: { type: 'string' },
    punkte: {
      type: 'array',
      description: 'je Punkt der Paketänderung',
      items: {
        type: 'object',
        properties: { punkt: { type: 'string' }, stand: { type: 'string', enum: ['umgesetzt', 'teilweise', 'offen'] }, beleg: { type: 'string' } },
        required: ['punkt', 'stand', 'beleg'],
      },
    },
    befunde: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          schwere: { type: 'string', enum: ['muss', 'soll', 'kann'] },
          datei: { type: 'string' },
          beschreibung: { type: 'string' },
          korrektur: { type: 'string' },
        },
        required: ['schwere', 'datei', 'beschreibung', 'korrektur'],
      },
    },
    regelverstoesse: { type: 'array', items: { type: 'string' } },
    bedarf_opus: { type: 'array', items: { type: 'string' }, description: 'gemeinsame Dateien, Texte, Tokens, MENSCHEN – was der Orchestrator tun muss' },
  },
  required: ['urteil', 'note', 'zusammenfassung', 'punkte', 'befunde', 'regelverstoesse', 'bedarf_opus'],
}

const abnahmePrompt = (p, bericht, runde, vorher) => `Du bist ${runde === 1 ? 'Abnehmer' : 'frischer Nachabnehmer'} (Opus) im Lauf „Gestaltung aufwerten und Vercel-startklar machen“ (IGMG Wetzlar, /home/user/IGMG/web, Next.js 16.4, Tokens in web/src/app/globals.css). Ein Haiku-Baumeister hat das Befundpaket ${p.kennung} aus der Sichtabnahme ${LAUF} ${runde === 1 ? 'gebaut' : 'nach deiner Vorgängerabnahme nachgebessert'}. Prüfe streng, aber fair. ÄNDERE KEINE DATEIEN (nur lesen, Befehle, eigene Bilder nach /home/user/IGMG/_gemeinde/bilder/${p.kennung}/${runde === 1 ? 'abnahme' : 'nachabnahme'}-*.jpg).

LIES ZUERST den Paketauftrag ${p.datei} (Änderung, Abnahmekriterien, Schreibrechte). Maßstab: Leitidee (KERN K-001), REFERENZ.md, Startseite als Referenzansicht; Ziel ist Note ≥ 8 der betroffenen Ansichten.
${vorher ? `VORGÄNGER-ABNAHME (Runde 1):\n${JSON.stringify(vorher, null, 1)}\n` : ''}BERICHT DES BAUMEISTERS:
<<<
${bericht ?? '(kein Bericht – Baumeister ausgefallen; Arbeitsstand direkt prüfen)'}
>>>

PRÜFE:
1. Diff: 'git -C /home/user/IGMG diff -- <Schreibrechte>' und neue Dateien ('git -C /home/user/IGMG status --short'). Parallel arbeiten andere Pakete (${ANDERE}) – fremde Änderungen ignorieren, aber melden, wenn DIESES Paket außerhalb seiner Schreibrechte geschrieben hat (Sprachdateien nur wie im Auftrag erlaubt).
2. Je Punkt der Änderung: umgesetzt / teilweise / offen mit Beleg (Datei:Zeile oder Bild).
3. Unantastbares (Logos, Rechtstext-Wortlaut, Gebetszeiten-Logik, Formularlogik, Rechte, Datenmodell/-abfragen, Seeds, Cockpit-Prüfungen), Religion (keine Verse/Kalligrafie als Schmuck, Muster nie hinter Text), keine neuen Abhängigkeiten, keine eigenen @keyframes, keine freien Werte, nichts erfunden, E2E-Erwartungen (web/tests/e2e: Aria-Labels, Rollen, Überschriftenebenen) nicht gebrochen.
4. Stufe A selbst (aus /home/user/IGMG/web): eslint, prettier --check, 'node /home/user/IGMG/_gemeinde/werkzeuge/freie-werte.mjs --protokoll /home/user/IGMG/_gemeinde/protokolle/${p.kennung}-${runde === 1 ? 'abnahme' : 'nachabnahme'}-freie-werte <Dateien>', betroffene Unit-Tests, tsc nur für Paketdateien bewerten.
5. Gestaltung: Vorher-/Nachher-Bilder des Baumeisters unter /home/user/IGMG/_gemeinde/bilder/${p.kennung}/ und die Bilder der Sichtabnahme (Bildbezug im Auftrag) mit Read ansehen; selbst je Prüfpfad 390 und 1440 erzeugen ('node /home/user/IGMG/_gemeinde/werkzeuge/einzelbild.mjs <pfad> --breite 390 --basis http://localhost:3200 --warte 4000 --voll --aus <datei>'; Verwaltung mit --zustand ${S}/verwaltung-state.json). Prüfpfade: ${p.pfade}. Achte auf Hierarchie, Komposition, Abstände, Formsystem (Achtstern), Grün nur für Handlung, Lesemaß, mobile Komposition, Zustände.
6. Urteil: 'angenommen' (Note ≥ 8, keine offenen Muss-Punkte), 'nachbessern' (konkrete Muss/Soll-Befunde, in einer Runde umsetzbar), 'zurueckweisen' (Regelverstoß mit Rückbau – in korrektur genau, was zurück). Höchstens 8 Befunde, wirksamste zuerst, je mit präziser Korrektur (Klassen/Token/Datei:Zeile). bedarf_opus: was nur der Orchestrator tun kann (globals.css, Sprachdateien außerhalb der Erlaubnis, neu-uebersetzt.json, MENSCHEN, TEXTVORSCHLAEGE, KERN, Seeds).`

const nachbessernPrompt = (p, abnahme) => `${bauPrompt(p)}

NACHBESSERUNG (Runde 2): Du hast dieses Paket schon gebaut; der Opus-Abnehmer verlangt Änderungen. Setze alle Befunde „muss“ und „soll“ um (bei „zurueckweisen“ genau den beschriebenen Rückbau) und alle Punkte mit Stand „teilweise“/„offen“, soweit in deinen Schreibrechten; „kann“ nur wenn klein. Danach Stufe A wiederholen und Nachher-Bilder mit Zusatz -r2 erzeugen.
ABNAHME:
${JSON.stringify(abnahme, null, 1)}

RÜCKGABE: kurzer Bericht – je Befund/Punkt umgesetzt/nicht (mit Grund), Prüfergebnisse, Bilderpfade, Sprachschlüssel, Bedarf.`

const ergebnisse = await pipeline(
  PAKETE,
  (p) => agent(bauPrompt(p), { label: `Bau ${p.kennung}`, phase: 'Bauen', model: 'haiku', agentType: 'general-purpose' }),
  (bericht, p) =>
    agent(abnahmePrompt(p, bericht, 1, null), { label: `Abnahme ${p.kennung}`, phase: 'Abnahme', schema: SCHEMA, agentType: 'general-purpose', effort: 'high' }).then(
      (abnahme) => ({ bericht, abnahme }),
    ),
  async (r, p) => {
    if (!r.abnahme || r.abnahme.urteil === 'angenommen') return { ...r, nachbesserung: null }
    const nachbesserung = await agent(nachbessernPrompt(p, r.abnahme), { label: `Nachbessern ${p.kennung}`, phase: 'Nachbessern', model: 'haiku', agentType: 'general-purpose' })
    return { ...r, nachbesserung }
  },
  async (r, p) => {
    if (!r.nachbesserung) return { kennung: p.kennung, ...r, nachabnahme: null }
    const nachabnahme = await agent(abnahmePrompt(p, r.nachbesserung, 2, r.abnahme), {
      label: `Nachabnahme ${p.kennung}`,
      phase: 'Nachabnahme',
      schema: SCHEMA,
      agentType: 'general-purpose',
      effort: 'high',
    })
    return { kennung: p.kennung, ...r, nachabnahme }
  },
)
return ergebnisse.map((e, i) => e ?? { kennung: PAKETE[i].kennung, ausgefallen: true })
