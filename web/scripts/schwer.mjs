#!/usr/bin/env node
// Schwere Spur (R-E10): führt einen schweren Befehl (Build, E2E, Lighthouse, ZAP, docker build) maschinenweit nur
// einzeln aus. Sperre über ein Verzeichnis (atomar per mkdir) mit PID-Datei; eine verwaiste Sperre (Prozess beendet)
// wird übernommen. Gestartet wird erst, wenn die Last (1-Minuten-Mittel) unter der Grenze liegt.
// Aufruf: node scripts/schwer.mjs [--grenze 12] [--warten 3600] -- <befehl> [argumente…]
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { loadavg } from 'node:os';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const trenner = argv.indexOf('--');
if (trenner < 0 || trenner === argv.length - 1) {
  console.error('Aufruf: node scripts/schwer.mjs [--grenze 12] [--warten 3600] -- <befehl> [argumente…]');
  process.exit(2);
}
const optionen = argv.slice(0, trenner);
const befehl = argv.slice(trenner + 1);
const wert = (name, standard) => {
  const i = optionen.indexOf(name);
  return i >= 0 && optionen[i + 1] ? Number(optionen[i + 1]) : standard;
};
const GRENZE = wert('--grenze', 12);
const WARTEN_S = wert('--warten', 3600);
// Fester Ort, damit alle Sitzungen und Agenten dieselbe Sperre sehen (tmpdir() ist je Benutzerkontext verschieden)
const SPERRE = process.env.SCHWERE_SPUR_SPERRE ?? '/tmp/igmg-schwere-spur.sperre';
const PID_DATEI = join(SPERRE, 'pid');

const lebt = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

function versucheSperre() {
  try {
    mkdirSync(SPERRE);
    writeFileSync(PID_DATEI, `${process.pid}\n${befehl.join(' ')}\n${new Date().toISOString()}\n`);
    return true;
  } catch {
    // Sperre vorhanden: verwaist?
    try {
      const [pid] = readFileSync(PID_DATEI, 'utf8').split('\n');
      if (pid && !lebt(Number(pid))) {
        rmSync(SPERRE, { recursive: true, force: true });
        return versucheSperre();
      }
    } catch {
      // PID-Datei noch nicht geschrieben – gleich erneut versuchen
    }
    return false;
  }
}

const schlafen = (ms) => new Promise((r) => setTimeout(r, ms));
const beginn = Date.now();
let gemeldet = false;
while (!versucheSperre()) {
  if (Date.now() - beginn > WARTEN_S * 1000) {
    console.error(`[schwer] Sperre nach ${WARTEN_S} s nicht frei (${SPERRE}). Abbruch.`);
    process.exit(3);
  }
  if (!gemeldet) {
    let inhaber = '';
    try {
      inhaber = readFileSync(PID_DATEI, 'utf8').split('\n')[1] ?? '';
    } catch {
      // ignorieren
    }
    console.log(`[schwer] Warte auf die schwere Spur (belegt durch: ${inhaber || 'unbekannt'}) …`);
    gemeldet = true;
  }
  await schlafen(5000);
}
const freigeben = () => rmSync(SPERRE, { recursive: true, force: true });

// Last abwarten (höchstens 10 Minuten, dann trotzdem starten und vermerken)
const lastBeginn = Date.now();
while (loadavg()[0] >= GRENZE && Date.now() - lastBeginn < 600_000) {
  console.log(`[schwer] Last ${loadavg()[0].toFixed(1)} ≥ ${GRENZE}, warte …`);
  await schlafen(15_000);
}
const last = loadavg()[0];
console.log(`[schwer] Start bei Last ${last.toFixed(1)}: ${befehl.join(' ')}`);
const kind = spawn(befehl[0], befehl.slice(1), {
  stdio: 'inherit',
  shell: false,
  env: { ...process.env, SCHWERE_SPUR_LAST: last.toFixed(1) },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => kind.kill(signal));
kind.on('exit', (code, signal) => {
  freigeben();
  console.log(`[schwer] Ende (${signal ?? code}) nach ${Math.round((Date.now() - beginn) / 1000)} s`);
  process.exit(code ?? 1);
});
kind.on('error', (e) => {
  freigeben();
  console.error(`[schwer] Befehl nicht startbar: ${e.message}`);
  process.exit(1);
});
