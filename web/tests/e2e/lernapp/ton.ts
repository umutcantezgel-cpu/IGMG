import { writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Synthetische Tonfolge (Grundton mit Obertönen, 0,3 s an / 0,3 s aus, 16 kHz mono, 3 s) als WAV für das Testmikrofon von
 * Chromium (`--use-file-for-fake-audio-capture`) – keine Sprache. Die Pegelprüfung der Sprechübung sieht darin genug Signal.
 */
export function schreibeTon(pfad: string) {
  const rate = 16_000;
  const n = rate * 3;
  const b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0);
  b.writeUInt32LE(36 + n * 2, 4);
  b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20);
  b.writeUInt16LE(1, 22);
  b.writeUInt32LE(rate, 24);
  b.writeUInt32LE(rate * 2, 28);
  b.writeUInt16LE(2, 32);
  b.writeUInt16LE(16, 34);
  b.write('data', 36);
  b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const an = Math.floor(t / 0.3) % 2 === 0;
    const f = 180 + 60 * (Math.floor(t / 0.6) % 3);
    const w = (k: number) => Math.sin(2 * Math.PI * k * f * t);
    b.writeInt16LE(an ? Math.round((0.25 * w(1) + 0.12 * w(2) + 0.06 * w(3)) * 32_767) : 0, 44 + i * 2);
  }
  writeFileSync(pfad, b);
}

/** Pfad der Tonfolge für diesen Testprozess (einmal geschrieben). */
export function testTon(): string {
  const pfad = join(tmpdir(), `igmg-lernapp-e2e-ton-${process.pid}.wav`);
  schreibeTon(pfad);
  return pfad;
}

/** Startoptionen für Chromium: Testmikrofon mit der Tonfolge, Zustimmung ohne Dialog. */
export const MIKROFON = () => ({
  permissions: ['microphone'],
  launchOptions: {
    args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${testTon()}`],
  },
});
