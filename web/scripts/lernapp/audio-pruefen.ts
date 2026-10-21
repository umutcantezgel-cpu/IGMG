// Prüfkette der Sprachausgabe (PLAN §6.8 Nr. 6, Beleg S3 §5; src/lib/lernapp/audio/pruefung.ts):
//   (a) alle Clips physisch (Netto-Dauer, Silbenrate, Rand-Stille, Clipping, −23 ± 1 LUFS) am dekodierten Clip (ffmpeg),
//   (b) de-Sätze ab 4 Wörtern: Rückerkennung mit whisper-base aus public/lern-app/modelle, in Node ohne Netz
//       (Kindprozesse scripts/lernapp/audio-erkennung.mjs); Trefferanteil ≥ 0,75 gut, 0,6–0,75 einmal neu, < 0,6 hören,
//   (c) Lemmata ohne Rückerkennung.
// Bericht ohne Inhalte: nur textHash, Schlüssel, Messwerte, Urteil und Gründe (keine Texte, keine Abschriften). Dazu
// `<bericht>.neu.txt` mit den textHashes für `erzeuge.py --nur` (Neuerzeugung) und `<bericht>.hoeren.txt` (an Menschen).
// Aufruf: pnpm lernapp:audio-pruefen --liste <liste.jsonl> --clips <clipordner> --aus <bericht.json> [--prozesse 4]
//         [--ohne-erkennung]
// Der Versuch je Text kommt aus `<clipordner>/erzeugung.jsonl` (eine Zeile je Erzeugung; nur Erzeugungen mit derselben
// Eingabe wie die letzte zählen – nach einer Aussprache-Änderung beginnt der Text wieder beim ersten Versuch).
import { execFile, fork } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { cpus, loadavg } from 'node:os';
import { join } from 'node:path';
import { parseArgs, promisify } from 'node:util';
import { leseJsonl, type ListenZeile } from '../../src/lib/lernapp/audio/liste';
import {
  miss,
  mitRueckerkennung,
  physischeFehler,
  treffer,
  urteile,
  type Urteil,
  versucheJeText,
} from '../../src/lib/lernapp/audio/pruefung';

const WEB = join(import.meta.dirname, '..', '..');
const RATE = 48_000;
const ausfuehren = promisify(execFile);

const { values } = parseArgs({
  options: {
    liste: { type: 'string' },
    clips: { type: 'string' },
    aus: { type: 'string' },
    prozesse: { type: 'string', default: String(Math.min(4, cpus().length)) },
    'ohne-erkennung': { type: 'boolean', default: false },
  },
});

type Erkennung = { text: string; ms: number } | null;

/** Kindprozesse der Rückerkennung: je Prozess ein Auftrag zur Zeit. */
async function erkenne(auftraege: { id: string; clip: string; ziel: string; sprache: string }[], prozesse: number) {
  const ergebnis = new Map<string, Erkennung>();
  let falle = 0;
  let naechster = 0;
  const arbeiter = Array.from(
    { length: Math.min(prozesse, auftraege.length) },
    () =>
      new Promise<void>((fertig, fehler) => {
        const kind = fork(join(WEB, 'scripts', 'lernapp', 'audio-erkennung.mjs'), [], { stdio: ['ignore', 'ignore', 'inherit', 'ipc'] });
        const weiter = () => {
          const a = auftraege[naechster++];
          if (a) kind.send({ art: 'erkenne', ...a });
          else kind.send({ art: 'ende' });
        };
        kind.on('message', (n: { art: string; id?: string; text?: string; ms?: number; anfragen?: number }) => {
          if (n.art === 'bereit') weiter();
          else if (n.art === 'ergebnis' || n.art === 'fehler') {
            ergebnis.set(n.id!, n.art === 'ergebnis' ? { text: n.text ?? '', ms: n.ms ?? 0 } : null);
            weiter();
          } else if (n.art === 'falle') falle += n.anfragen ?? 0;
        });
        kind.on('exit', (code) => (code === 0 ? fertig() : fehler(new Error(`Rückerkennung beendet mit ${code}`))));
      }),
  );
  await Promise.all(arbeiter);
  return { ergebnis, falle };
}

async function dekodiere(clip: string): Promise<Float32Array> {
  const { stdout } = await ausfuehren('ffmpeg', ['-v', 'error', '-i', clip, '-f', 'f32le', '-ac', '1', '-ar', String(RATE), 'pipe:1'], {
    encoding: 'buffer',
    maxBuffer: 1 << 28,
  });
  return new Float32Array(stdout.buffer.slice(stdout.byteOffset, stdout.byteOffset + stdout.length));
}

async function main(): Promise<number> {
  if (!values.liste || !values.clips || !values.aus) {
    console.error('Aufruf: pnpm lernapp:audio-pruefen --liste <liste.jsonl> --clips <ordner> --aus <bericht.json> [--prozesse 4]');
    return 2;
  }
  const beginn = Date.now();
  const liste = leseJsonl(readFileSync(values.liste, 'utf8'));
  const protokoll = join(values.clips, 'erzeugung.jsonl');
  const versuche = versucheJeText(
    existsSync(protokoll)
      ? readFileSync(protokoll, 'utf8')
          .split('\n')
          .filter(Boolean)
          .map((z) => JSON.parse(z) as { textHash: string; eingabe?: string })
      : [],
  );
  const vorhanden = liste.filter((z) => existsSync(join(values.clips!, `${z.textHash}.webm`)));
  const fehlend = liste.length - vorhanden.length;

  // (a) physisch – vier ffmpeg-Aufrufe zugleich
  const messungen = new Map<string, { sha256: string; bytes: number; m: ReturnType<typeof miss> }>();
  for (let i = 0; i < vorhanden.length; i += 4)
    await Promise.all(
      vorhanden.slice(i, i + 4).map(async (z) => {
        const pfad = join(values.clips!, `${z.textHash}.webm`);
        const daten = readFileSync(pfad);
        messungen.set(z.textHash, {
          sha256: createHash('sha256').update(daten).digest('hex'),
          bytes: daten.length,
          m: miss(await dekodiere(pfad), RATE, z.text, z.sprache),
        });
      }),
    );

  // (b) Rückerkennung
  const zuErkennen = values['ohne-erkennung'] ? [] : vorhanden.filter((z) => mitRueckerkennung(z));
  const t0 = Date.now();
  const { ergebnis, falle } = zuErkennen.length
    ? await erkenne(
        zuErkennen.map((z) => ({ id: z.textHash, clip: join(values.clips!, `${z.textHash}.webm`), ziel: z.text, sprache: z.sprache })),
        Number(values.prozesse),
      )
    : { ergebnis: new Map<string, Erkennung>(), falle: 0 };
  const erkennungS = (Date.now() - t0) / 1000;

  const clips = vorhanden.map((z: ListenZeile) => {
    const { sha256, bytes, m } = messungen.get(z.textHash)!;
    const e = ergebnis.get(z.textHash);
    const anteil = e ? Math.round(treffer(e.text, z.text, z.sprache) * 1000) / 1000 : null;
    const erkannt = mitRueckerkennung(z) && !values['ohne-erkennung'];
    const versuch = versuche.get(z.textHash) ?? 1;
    const u = urteile({ physisch: physischeFehler(m), treffer: anteil, versuch });
    if (erkannt && e === null) {
      u.gruende.push('rueckerkennung_fehler');
      u.urteil = 'hoeren';
    }
    return {
      textHash: z.textHash,
      schluessel: z.schluessel,
      einheit: z.einheit,
      art: z.art,
      woerter: z.woerter,
      versuch,
      sha256,
      bytes,
      ...u,
      treffer: anteil,
      messwerte: m,
    };
  });
  const zaehle = (u: Urteil) => clips.filter((c) => c.urteil === u).length;
  const sekunden = clips.reduce((s, c) => s + c.messwerte.dauerS, 0);
  const bytes = clips.reduce((s, c) => s + c.bytes, 0);
  const anteile = clips.flatMap((c) => (c.treffer === null ? [] : [c.treffer])).sort((a, b) => a - b);
  const bericht = {
    format: 'igmg-lernapp-audio-pruefung',
    version: 1,
    am: new Date().toISOString(),
    stimmen: [...new Set(liste.map((z) => z.stimme))],
    sprachen: [...new Set(liste.map((z) => z.sprache))],
    summen: {
      liste: liste.length,
      fehlend,
      clips: clips.length,
      ok: zaehle('ok'),
      neu_erzeugen: zaehle('neu_erzeugen'),
      hoeren: zaehle('hoeren'),
      sekunden: Math.round(sekunden * 100) / 100,
      bytes,
      kbProSekunde: sekunden ? Math.round((bytes / 1000 / sekunden) * 100) / 100 : null,
      rueckerkennung: anteile.length,
      trefferMedian: anteile.length ? anteile[Math.floor(anteile.length / 2)] : null,
      trefferUnter075: anteile.filter((a) => a < 0.75).length,
      trefferUnter06: anteile.filter((a) => a < 0.6).length,
      gruende: Object.fromEntries(
        [...new Set(clips.flatMap((c) => c.gruende))].sort().map((g) => [g, clips.filter((c) => c.gruende.includes(g)).length]),
      ),
    },
    erkennung: {
      modell: 'Xenova/whisper-base@64da572 (q8)',
      prozesse: Math.min(Number(values.prozesse), zuErkennen.length),
      sekunden: Math.round(erkennungS * 10) / 10,
      fremdanfragen: falle,
    },
    dauerS: Math.round((Date.now() - beginn) / 100) / 10,
    last: loadavg().map((l) => Math.round(l * 100) / 100),
    clips,
  };
  writeFileSync(values.aus, `${JSON.stringify(bericht, null, 1)}\n`);
  writeFileSync(
    `${values.aus}.neu.txt`,
    clips
      .filter((c) => c.urteil === 'neu_erzeugen')
      .map((c) => `${c.textHash}\n`)
      .join(''),
  );
  writeFileSync(
    `${values.aus}.hoeren.txt`,
    clips
      .filter((c) => c.urteil === 'hoeren')
      .map((c) => `${c.textHash}\n`)
      .join(''),
  );
  const { clips: _, ...kurz } = bericht;
  console.log(JSON.stringify(kurz));
  return falle ? 1 : 0;
}

main().then(
  (code) => (process.exitCode = code),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  },
);
