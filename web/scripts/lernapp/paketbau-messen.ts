// Messung des Paketbaus (Stufe C N6, Befund „kalter Neubau eines Kursverzeichnisses“): baut je Richtung alle Einheiten aus
// der Datenbank (DATABASE_URL aus web/.env, sonst PGlite der Entwicklung) wie `ladeVerzeichnisJson` nach einer Cache-
// Erneuerung, misst Laden, Bauen und die längste Blockade der Ereignisschleife und schreibt einen Fingerabdruck
// (je Einheit Schlüssel, Hash, Bytes; je Richtung SHA-256 des Verzeichnisses). Prüft dabei Hash = SHA-256 des Pakettexts.
//   pnpm exec tsx --conditions=react-server --env-file-if-exists=.env scripts/lernapp/paketbau-messen.ts \
//     [--richtung tr-aus-de] [--runden 2] [--ungeprueft an|aus] [--aus fingerabdruck.json] [--vergleich fingerabdruck.json]
// Rückgabe 1, wenn ein Hash nicht zum Pakettext passt oder der Fingerabdruck vom Vergleich abweicht.
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { parseArgs } from 'node:util';
import { istRichtung, RICHTUNGEN, type RichtungId } from '../../src/lib/lernapp/kurse';
import { sha256Hex } from '../../src/lib/lernapp/paket/hash';
import { baueRichtung, ladeBauEingaben, verzeichnisVon } from '../../src/server/queries/lernapp/pakete';

type Abdruck = Record<string, { verzeichnis: string; einheiten: [string, string, number][] }>;

const ms = (n: number) => `${Math.round(n)} ms`;

/** Längste Lücke zwischen zwei Takten eines 5-ms-Zeitgebers = längste Blockade der Ereignisschleife. */
function blockadeMessen(): () => number {
  let letzter = performance.now();
  let laengste = 0;
  const takt = setInterval(() => {
    const jetzt = performance.now();
    laengste = Math.max(laengste, jetzt - letzter);
    letzter = jetzt;
  }, 5);
  return () => {
    clearInterval(takt);
    return Math.max(laengste, performance.now() - letzter);
  };
}

async function main() {
  const { values } = parseArgs({
    options: {
      richtung: { type: 'string', multiple: true },
      runden: { type: 'string', default: '2' },
      ungeprueft: { type: 'string', default: 'an' },
      aus: { type: 'string' },
      vergleich: { type: 'string' },
    },
  });
  const richtungen = (values.richtung?.length ? values.richtung : [...RICHTUNGEN]).filter(istRichtung) as RichtungId[];
  const ungeprueft = values.ungeprueft !== 'aus';
  const runden = Math.max(1, Number(values.runden) || 1);
  const abdruck: Abdruck = {};
  let fehler = 0;

  for (let runde = 1; runde <= runden; runde++) {
    for (const r of richtungen) {
      const t0 = performance.now();
      const eingaben = await ladeBauEingaben(r);
      const t1 = performance.now();
      const t2 = performance.now();
      const blockade = blockadeMessen();
      const gebaut = await baueRichtung(r, ungeprueft);
      const laengste = blockade();
      const t3 = performance.now();
      const verzeichnis = JSON.stringify(await verzeichnisVon(r, ungeprueft));
      const t4 = performance.now();
      for (const g of gebaut)
        if (sha256Hex(g.json) !== g.hash) {
          console.error(`${r} ${g.paket.einheit.schluessel}: Hash passt nicht zum Pakettext`);
          fehler++;
        }
      abdruck[r] = {
        verzeichnis: sha256Hex(verzeichnis),
        einheiten: gebaut.map((g) => [g.paket.einheit.schluessel, g.hash, g.bytes]),
      };
      const aufgaben = eingaben.reduce((n, e) => n + e.lektionen.reduce((m, l) => m + l.aufgaben.length, 0), 0);
      console.log(
        `Runde ${runde} ${r}: ${gebaut.length}/${eingaben.length} Pakete, ${aufgaben} Aufgaben – nur Laden ${ms(t1 - t0)}, ` +
          `baueRichtung ${ms(t3 - t2)} (längste Blockade ${ms(laengste)}), Verzeichnis ${ms(t4 - t3)}`,
      );
    }
  }

  if (values.aus) writeFileSync(values.aus, `${JSON.stringify(abdruck, null, 1)}\n`);
  if (values.vergleich) {
    const alt = JSON.parse(readFileSync(values.vergleich, 'utf8')) as Abdruck;
    for (const r of richtungen) {
      const a = JSON.stringify(alt[r]);
      const b = JSON.stringify(abdruck[r]);
      if (a === b) console.log(`Vergleich ${r}: gleich (${abdruck[r]?.einheiten.length ?? 0} Einheiten)`);
      else {
        console.error(`Vergleich ${r}: ABWEICHUNG`);
        fehler++;
      }
    }
  }
  return fehler ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((e) => {
    console.error(e instanceof Error ? (e.stack ?? e.message) : e);
    process.exit(1);
  });
