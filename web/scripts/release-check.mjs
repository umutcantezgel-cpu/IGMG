#!/usr/bin/env node
// Release-Check vor dem Livegang (ENTSCHEIDUNGEN L-E02, L-E03; AUFTRAG Z-12). Bündelt die Prüfsuiten nacheinander.
// Ein roter Schritt bricht nicht ab: alle Schritte laufen, am Ende stehen Tabelle und Exit-Code.
// Aufruf: pnpm release:check [--bau] [--protokoll <pfad>]
// Exit 1, wenn ein Schritt rot ist. Übersprungene Schritte sind nicht rot, werden in der Zusammenfassung aber genannt.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const WEB = join(import.meta.dirname, '..');

const HILFE = `Aufruf: pnpm release:check [Optionen]

  --bau                 zusätzlich pnpm vercel-build (Bau wie auf Vercel; schreibt in .pglite-bau)
  --protokoll <pfad>    vollständige Ausgabe zusätzlich in diese Datei schreiben (relativ zum Aufrufort)
  --hilfe               diese Hilfe

Schritte: typen, lint, test:unit, test:integration, sprachen:pruefen, geheimnisse:pruefen, startklar
(--betriebsart produktion; nur mit DATABASE_URL in der Umgebung oder in .env, sonst übersprungen).
Exit 0: alle Schritte grün (übersprungene nicht gerechnet). Exit 1: mindestens ein Schritt rot.`;

function liesOptionen(argv) {
  const optionen = { bau: false, hilfe: false, protokoll: undefined };
  for (let i = 0; i < argv.length; i++) {
    const eintrag = argv[i];
    if (eintrag === '--') continue; // pnpm reicht ein `--` vor den Optionen manchmal durch
    if (eintrag === '--bau') optionen.bau = true;
    else if (eintrag === '--hilfe' || eintrag === '-h') optionen.hilfe = true;
    else if (eintrag === '--protokoll' || eintrag.startsWith('--protokoll=')) {
      const gleich = eintrag.indexOf('=');
      const wert = gleich >= 0 ? eintrag.slice(gleich + 1) : argv[++i];
      if (!wert || wert.startsWith('--')) throw new Error('--protokoll braucht einen Pfad.');
      // pnpm wechselt in das Paketverzeichnis; INIT_CWD ist der Ort, an dem der Befehl eingegeben wurde.
      optionen.protokoll = resolve(process.env.INIT_CWD ?? process.cwd(), wert);
    } else {
      throw new Error(`Unbekannte Option „${eintrag}“. Hilfe: pnpm release:check --hilfe`);
    }
  }
  return optionen;
}

/** Ob eine Datenbank konfiguriert ist: Umgebung oder .env. Der Wert wird nie ausgegeben. */
function datenbankGesetzt() {
  if (process.env.DATABASE_URL) return true;
  const datei = join(WEB, '.env');
  if (!existsSync(datei)) return false;
  return /^\s*DATABASE_URL\s*=\s*\S/m.test(readFileSync(datei, 'utf8'));
}

function schritteFuer({ bau, datenbank }) {
  const liste = [
    { name: 'typen', args: ['typen'] },
    { name: 'lint', args: ['lint'] },
    { name: 'test:unit', args: ['test:unit'] },
    { name: 'test:integration', args: ['test:integration'] },
    { name: 'sprachen:pruefen', args: ['sprachen:pruefen'] },
    { name: 'geheimnisse:pruefen', args: ['geheimnisse:pruefen'] },
  ];
  liste.push(
    datenbank
      ? { name: 'startklar', args: ['startklar', '--betriebsart', 'produktion'] }
      : {
          name: 'startklar',
          uebersprungen:
            'keine DATABASE_URL gesetzt (weder in der Umgebung noch in .env). Datenbankprüfung nicht ausgeführt; mit DATABASE_URL erneut starten.',
        },
  );
  if (bau) liste.push({ name: 'vercel-build', args: ['vercel-build'] });
  return liste;
}

/** Führt `pnpm <args>` aus, gibt die Ausgabe live aus und sammelt sie für das Protokoll. */
function laufe(schritt) {
  return new Promise((ergebnis) => {
    const start = Date.now();
    const ausgabe = [];
    let fertig = false;
    const beende = (code, zusatz = '') => {
      if (fertig) return;
      fertig = true;
      ergebnis({ code, dauerMs: Date.now() - start, ausgabe: ausgabe.join('') + zusatz });
    };
    let kind;
    try {
      kind = spawn('pnpm', schritt.args, { cwd: WEB, env: process.env, stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (fehler) {
      beende(-1, `Start fehlgeschlagen: ${fehler.message}\n`);
      return;
    }
    kind.stdout.on('data', (daten) => {
      const text = daten.toString();
      ausgabe.push(text);
      process.stdout.write(text);
    });
    kind.stderr.on('data', (daten) => {
      const text = daten.toString();
      ausgabe.push(text);
      process.stderr.write(text);
    });
    kind.on('error', (fehler) => beende(-1, `Start fehlgeschlagen: ${fehler.message}\n`));
    kind.on('close', (code) => beende(code ?? -1));
  });
}

const ZEICHEN = { ok: '[OK]', fehler: '[FEHLER]', uebersprungen: '[ÜBERSPRUNGEN]' };

function dauer(ms) {
  return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
}

function tabelle(ergebnisse) {
  const breiteSchritt = Math.max('Schritt'.length, ...ergebnisse.map((e) => e.name.length));
  const breiteErgebnis = Math.max('Ergebnis'.length, ...Object.values(ZEICHEN).map((z) => z.length));
  const zeile = (a, b, c) => `  ${a.padEnd(breiteSchritt)}  ${b.padEnd(breiteErgebnis)}  ${c}`;
  const zeilen = [zeile('Schritt', 'Ergebnis', 'Dauer'), zeile('-'.repeat(breiteSchritt), '-'.repeat(breiteErgebnis), '------')];
  for (const e of ergebnisse) {
    zeilen.push(zeile(e.name, ZEICHEN[e.status], e.status === 'uebersprungen' ? '–' : dauer(e.dauerMs)));
  }
  return zeilen.join('\n');
}

async function main() {
  let optionen;
  try {
    optionen = liesOptionen(process.argv.slice(2));
  } catch (fehler) {
    process.stderr.write(`${fehler.message}\n`);
    return 1;
  }
  if (optionen.hilfe) {
    process.stdout.write(`${HILFE}\n`);
    return 0;
  }

  const datenbank = datenbankGesetzt();
  const schritte = schritteFuer({ bau: optionen.bau, datenbank });
  const protokoll = [`Release-Check · ${new Date().toISOString()} · --bau: ${optionen.bau ? 'ja' : 'nein'}\n`];
  const ergebnisse = [];

  for (const schritt of schritte) {
    if (schritt.uebersprungen) {
      const hinweis = `\n=== Schritt ${schritt.name}: übersprungen ===\nHinweis: ${schritt.uebersprungen}\n`;
      process.stdout.write(hinweis);
      protokoll.push(hinweis);
      ergebnisse.push({ name: schritt.name, status: 'uebersprungen', dauerMs: 0 });
      continue;
    }
    const kopf = `\n=== Schritt ${schritt.name}: pnpm ${schritt.args.join(' ')} ===\n`;
    process.stdout.write(kopf);
    protokoll.push(kopf);
    const r = await laufe(schritt);
    protokoll.push(r.ausgabe);
    ergebnisse.push({ name: schritt.name, status: r.code === 0 ? 'ok' : 'fehler', dauerMs: r.dauerMs });
  }

  const rot = ergebnisse.filter((e) => e.status === 'fehler').map((e) => e.name);
  const uebersprungen = ergebnisse.filter((e) => e.status === 'uebersprungen').map((e) => e.name);
  const tabellenText = tabelle(ergebnisse);
  const fazit =
    rot.length > 0
      ? `=== RELEASE-CHECK: NICHT BESTANDEN (rot: ${rot.join(', ')}) ===`
      : uebersprungen.length > 0
        ? `=== RELEASE-CHECK: BESTANDEN, mit übersprungenem Schritt: ${uebersprungen.join(', ')} ===`
        : '=== RELEASE-CHECK: BESTANDEN ===';
  const abschluss = `\n${tabellenText}\n\n${fazit}\n`;
  process.stdout.write(abschluss);
  protokoll.push(abschluss);

  if (optionen.protokoll) {
    mkdirSync(dirname(optionen.protokoll), { recursive: true });
    writeFileSync(optionen.protokoll, protokoll.join(''), 'utf8');
    process.stdout.write(`Protokoll: ${optionen.protokoll}\n`);
  }
  return rot.length > 0 ? 1 : 0;
}

main().then((code) => {
  process.exitCode = code;
});
