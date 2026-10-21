// Startklar-Prüfung auf der Kommandozeile (Kern 2.0, AUFTRAG V-11, Z-12; ENTSCHEIDUNGEN L-E02).
// Dieselben Prüfungen wie das Cockpit /verwaltung/startklar (src/lib/startklar/pruefungen.ts).
// Aufruf: pnpm startklar [--json] [--betriebsart produktion|vorschau|entwicklung] [--pglite <verzeichnis>]
// Exit 1 bei mindestens einem Fehler oder Aufruffehler, sonst 0. Werte von Geheimnissen erscheinen nie in der Ausgabe.
import { db, holeDb } from '@/lib/db';
import { type Bereich, fuehreStartklarAus, type Pruefung, type StartklarErgebnis, type Status } from '@/lib/startklar/pruefungen';
import { BETRIEBSARTEN, type Betriebsart, istBetriebsart } from '@/lib/umgebung';

type Optionen = { json: boolean; hilfe: boolean; betriebsart?: Betriebsart; pglite?: string };

class Aufruffehler extends Error {}

const HILFE = `Aufruf: pnpm startklar [Optionen]

  --json                  maschinenlesbare Ausgabe (JSON) statt der Tabelle
  --betriebsart <art>     Betriebsart für diese Probe: produktion, vorschau oder entwicklung
                          (überschreibt SITE_MODE)
  --pglite <verzeichnis>  lokale PGlite-Datenbank statt DATABASE_URL, nur für Proben. PGlite schreibt
                          beim Öffnen in das Verzeichnis: mit einer Kopie arbeiten, nie mit laufenden Servern.
  --hilfe                 diese Hilfe

Ohne --pglite und ohne DATABASE_URL laufen die Datenbank- und Inhaltsprüfungen nicht; sie erscheinen mit Hinweis.
Exit 0: keine Fehler (STARTKLAR). Exit 1: mindestens ein Fehler oder ein Aufruffehler (NICHT STARTKLAR).`;

const GEHEIM = /DATABASE_URL|SECRET|TOKEN|PASS|KEY|GEHEIMNIS|SCHLUESSEL|ZUGANG/i;

const SYMBOL: Record<Status, string> = { ok: '[OK]', hinweis: '[HINWEIS]', warnung: '[WARNUNG]', fehler: '[FEHLER]', manuell: '[MANUELL]' };
const BEREICHE: { id: Bereich; titel: string }[] = [
  { id: 'umgebung', titel: 'Umgebung' },
  { id: 'auslieferung', titel: 'Auslieferung' },
  { id: 'datenbank', titel: 'Datenbank' },
  { id: 'inhalte', titel: 'Inhalte' },
  { id: 'recht', titel: 'Recht' },
  { id: 'gemeinde', titel: 'Gemeinde-Plattform' },
  { id: 'lernapp', titel: 'Lern-App' },
  { id: 'mail', titel: 'Mail' },
];
const BREITE = { titel: 26, meldung: 56, aufwand: 14 };

function liesOptionen(argv: readonly string[]): Optionen {
  const optionen: Optionen = { json: false, hilfe: false };
  for (let i = 0; i < argv.length; i++) {
    const eintrag = argv[i];
    if (eintrag === '--') continue; // pnpm reicht ein `--` vor den Optionen manchmal durch
    const gleich = eintrag.indexOf('=');
    const name = eintrag.startsWith('--') && gleich > 0 ? eintrag.slice(0, gleich) : eintrag;
    const eingebettet = eintrag.startsWith('--') && gleich > 0 ? eintrag.slice(gleich + 1) : undefined;
    const wert = (): string => {
      if (eingebettet !== undefined) return eingebettet;
      const naechster = argv[i + 1];
      if (naechster === undefined || naechster.startsWith('--')) throw new Aufruffehler(`${name} braucht einen Wert.`);
      i++;
      return naechster;
    };
    if ((name === '--json' || name === '--hilfe' || name === '-h') && eingebettet === undefined) {
      if (name === '--json') optionen.json = true;
      else optionen.hilfe = true;
    } else if (name === '--betriebsart') {
      const gewaehlt = wert();
      if (!istBetriebsart(gewaehlt)) throw new Aufruffehler(`Unbekannte Betriebsart „${gewaehlt}“ (erlaubt: ${BETRIEBSARTEN.join(', ')}).`);
      optionen.betriebsart = gewaehlt;
    } else if (name === '--pglite') {
      optionen.pglite = wert();
    } else {
      throw new Aufruffehler(`Unbekannte Option „${eintrag}“. Hilfe: pnpm startklar --hilfe`);
    }
  }
  return optionen;
}

/** Entfernt Werte sensibler Umgebungsvariablen aus einem Text (Fehlermeldungen können Verbindungsdaten enthalten). */
function verbergen(text: string): string {
  let ausgabe = text;
  for (const [name, wert] of Object.entries(process.env)) {
    if (wert && wert.length >= 6 && GEHEIM.test(name)) ausgabe = ausgabe.split(wert).join('[verborgen]');
  }
  return ausgabe;
}

/** Bricht einen Text an Wortgrenzen auf die Breite um; zu lange Wörter werden zerteilt. */
function umbrechen(text: string, breite: number): string[] {
  const zeilen: string[] = [];
  let aktuell = '';
  for (const wort of text.split(/\s+/).filter(Boolean)) {
    let rest = wort;
    while (rest.length > breite) {
      if (aktuell) {
        zeilen.push(aktuell);
        aktuell = '';
      }
      zeilen.push(rest.slice(0, breite));
      rest = rest.slice(breite);
    }
    if (aktuell === '') aktuell = rest;
    else if (aktuell.length + 1 + rest.length <= breite) aktuell += ` ${rest}`;
    else {
      zeilen.push(aktuell);
      aktuell = rest;
    }
  }
  if (aktuell) zeilen.push(aktuell);
  return zeilen.length > 0 ? zeilen : [''];
}

function zeileZuPruefung(p: Pruefung): string {
  const titel = umbrechen(p.titel, BREITE.titel);
  const meldung = [...umbrechen(p.meldung, BREITE.meldung), ...(p.ort ? umbrechen(`Ort: ${p.ort}`, BREITE.meldung) : [])];
  const aufwand = umbrechen(p.aufwand ?? '–', BREITE.aufwand);
  const hoehe = Math.max(titel.length, meldung.length, aufwand.length);
  const zeilen: string[] = [];
  for (let n = 0; n < hoehe; n++) {
    const status = n === 0 ? SYMBOL[p.status] : '';
    zeilen.push(
      `  ${status.padEnd(9)}  ${(titel[n] ?? '').padEnd(BREITE.titel)}  ${(meldung[n] ?? '').padEnd(BREITE.meldung)}  ${aufwand[n] ?? ''}`.trimEnd(),
    );
  }
  return zeilen.join('\n');
}

function ausgabeTabelle(e: StartklarErgebnis): string {
  const zeilen: string[] = [`Startklar-Prüfung · Betriebsart: ${e.betriebsart} · ${e.zeitpunkt}`, ''];
  const bekannte = new Set(BEREICHE.map((b) => b.id));
  const rest = [...new Set(e.pruefungen.map((p) => p.bereich))].filter((id) => !bekannte.has(id));
  const reihe: { id: string; titel: string }[] = [...BEREICHE, ...rest.map((id) => ({ id, titel: id }))];
  for (const bereich of reihe) {
    const liste = e.pruefungen.filter((p) => p.bereich === bereich.id);
    if (liste.length === 0) continue;
    zeilen.push(bereich.titel);
    zeilen.push(`  ${'STATUS'.padEnd(9)}  ${'TITEL'.padEnd(BREITE.titel)}  ${'MELDUNG / ORT'.padEnd(BREITE.meldung)}  AUFWAND`);
    for (const p of liste) zeilen.push(zeileZuPruefung(p));
    zeilen.push('');
  }
  const z = e.zaehler;
  zeilen.push(
    `Zusammenfassung: ${z.ok} OK, ${z.hinweis} Hinweise, ${z.warnung} Warnungen, ${z.fehler} Fehler, ${z.manuell} manuell.`,
    'Startklar heißt: kein Fehler. Warnungen und manuelle Punkte bleiben im Bericht.',
    e.startklar ? 'ERGEBNIS: STARTKLAR' : `ERGEBNIS: NICHT STARTKLAR (${z.fehler} Fehler beheben, dann erneut prüfen)`,
  );
  return zeilen.join('\n');
}

async function schliesseDatenbank(): Promise<void> {
  try {
    const client = (holeDb() as unknown as { $client?: { end?: () => Promise<void>; close?: () => Promise<void> } }).$client;
    if (client?.end) await client.end();
    else if (client?.close) await client.close();
  } catch {
    // Verbindung war nie offen oder ist schon beendet: nichts zu tun.
  }
}

async function main(): Promise<number> {
  let optionen: Optionen;
  try {
    optionen = liesOptionen(process.argv.slice(2));
  } catch (fehler) {
    process.stderr.write(`${(fehler as Error).message}\n`);
    return 1;
  }
  if (optionen.hilfe) {
    process.stdout.write(`${HILFE}\n`);
    return 0;
  }

  // Proben: PGlite statt DATABASE_URL, Betriebsart überschreibt SITE_MODE. Nur für diesen Prozess.
  if (optionen.pglite !== undefined) {
    process.env.PGLITE_VERZEICHNIS = optionen.pglite;
    process.env.BAU_PGLITE = '1';
    delete process.env.DATABASE_URL;
  }
  if (optionen.betriebsart !== undefined) process.env.SITE_MODE = optionen.betriebsart;

  const mitDatenbank = optionen.pglite !== undefined || Boolean(process.env.DATABASE_URL);
  try {
    const ergebnis = await fuehreStartklarAus({ env: process.env, db: mitDatenbank ? db : null });
    process.stdout.write(`${optionen.json ? JSON.stringify(ergebnis, null, 2) : ausgabeTabelle(ergebnis)}\n`);
    return ergebnis.startklar ? 0 : 1;
  } catch (fehler) {
    const text = fehler instanceof Error ? `${fehler.name}: ${fehler.message}` : String(fehler);
    process.stderr.write(`Startklar-Prüfung abgebrochen: ${verbergen(text)}\n`);
    return 1;
  } finally {
    if (mitDatenbank) await schliesseDatenbank();
  }
}

main().then((code) => {
  process.exitCode = code;
});
