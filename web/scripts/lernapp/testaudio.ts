// Synthetische Testbündel `.lpa` für den Testkurs (ADR 0039 Nr. 11): je Zieltext ein Sinuston (kein Sprachsignal, keine
// Rezitation), WebM/Opus 24 kbit/s mono wie die echten Clips (ADR 0039, Fortschreibung S4 Nr. 1). Braucht ffmpeg und läuft
// nur lokal, nie im Bau; die erzeugten Dateien werden eingecheckt (drizzle/seeds/lernapp-testaudio/).
// Aufruf: pnpm exec tsx --conditions=react-server scripts/lernapp/testaudio.ts
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TESTAUDIO_VERZEICHNIS, testkursClipTexte } from '../../drizzle/seeds/lernapp-test';
import { baueBuendel, buendelDatei } from '../../src/lib/lernapp/paket/buendel';
import { sha256Hex, textHash } from '../../src/lib/lernapp/paket/hash';

const arbeit = mkdtempSync(join(tmpdir(), 'igmg-testaudio-'));
try {
  for (const sprache of ['de', 'tr', 'ar'] as const) {
    const texte = [...new Set(testkursClipTexte(sprache))].sort();
    const clips = texte.map((text, i) => {
      const datei = join(arbeit, `${sprache}-${i}.webm`);
      const dauer = (0.4 + 0.1 * (i % 4)).toFixed(2);
      // Ton je Text verschieden, weich ein- und ausgeblendet; reproduzierbare Bytes (bitexact, ohne Metadaten)
      execFileSync('ffmpeg', [
        '-v',
        'error',
        '-y',
        '-f',
        'lavfi',
        '-i',
        `sine=frequency=${330 + 55 * i}:duration=${dauer}:sample_rate=48000`,
        '-af',
        `afade=t=in:d=0.02,afade=t=out:st=${(Number(dauer) - 0.03).toFixed(2)}:d=0.03,volume=0.3`,
        '-ac',
        '1',
        '-c:a',
        'libopus',
        '-b:a',
        '24k',
        '-vbr',
        'on',
        '-application',
        'voip',
        '-frame_duration',
        '20',
        '-map_metadata',
        '-1',
        '-fflags',
        '+bitexact',
        '-flags:a',
        '+bitexact',
        datei,
      ]);
      return { textHash: textHash(text), daten: new Uint8Array(readFileSync(datei)) };
    });
    const einheit = `${sprache}.a1.e01`;
    const { bytes } = baueBuendel({ sprache, einheit, clips });
    const ziel = join(TESTAUDIO_VERZEICHNIS, sprache);
    mkdirSync(ziel, { recursive: true });
    for (const alt of readdirSync(ziel)) if (alt.endsWith('.lpa')) rmSync(join(ziel, alt));
    const name = buendelDatei(einheit, sha256Hex(bytes));
    writeFileSync(join(ziel, name), bytes);
    console.log(`${sprache}/${name}: ${clips.length} Clips, ${bytes.length} Bytes`);
  }
} finally {
  rmSync(arbeit, { recursive: true, force: true });
}
