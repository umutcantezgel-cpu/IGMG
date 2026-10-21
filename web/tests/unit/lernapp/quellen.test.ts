import { readdirSync, readFileSync, realpathSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LIZENZTEXTE } from '@/lib/lernapp/lizenztexte';
import { BIBLIOTHEKEN, SCHRIFTEN, SPRACHERKENNUNG } from '@/lib/lernapp/quellen';
import { LIZENZ_DATEIEN, MODELL, ORT } from '@/lib/lernapp/sprechen/modell';

/**
 * Quellen und Lizenzen der Lern-App (ADR 0044 Nr. 7): Fassungen wie in node_modules, Lizenzen wie in den Paketen,
 * Lizenztexte gleich den Lizenzdateien (ohne Urheberzeile), Urheberzeilen aus den Lizenzdateien.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
// onnxruntime-web ist eine Abhängigkeit von transformers.js (pnpm: neben ihm im eigenen node_modules)
const TRANSFORMERS = realpathSync(join(WEB, 'node_modules', '@huggingface', 'transformers'));
const ordner = (name: string) =>
  name === 'onnxruntime-web'
    ? join(TRANSFORMERS, '..', '..', 'onnxruntime-web')
    : name === '@huggingface/jinja' || name === '@huggingface/tokenizers'
      ? join(TRANSFORMERS, '..', name.split('/')[1]!)
      : join(WEB, 'node_modules', name);
const paket = (name: string) => JSON.parse(readFileSync(join(ordner(name), 'package.json'), 'utf8'));
const lizenzNebenGewichten = (datei: string) => readFileSync(join(WEB, 'public', 'lern-app', 'modelle', MODELL.name, datei), 'utf8');
const normal = (s: string) => s.replace(/\s+/g, ' ').trim();

describe('Quellen der Lern-App', () => {
  it('Bibliotheken: Fassung und Lizenz wie das installierte Paket', () => {
    const zuPaket: Record<string, string> = {
      next: 'next',
      react: 'react',
      'lucide-react': 'lucide-react',
      idb: 'idb',
      'ts-fsrs': 'ts-fsrs',
      'fastest-levenshtein': 'fastest-levenshtein',
      zod: 'zod',
      'altcha-lib': 'altcha-lib',
      transformers: '@huggingface/transformers',
      tokenizers: '@huggingface/tokenizers',
      jinja: '@huggingface/jinja',
      'onnxruntime-web': 'onnxruntime-web',
    };
    for (const b of BIBLIOTHEKEN) {
      const p = paket(zuPaket[b.id]);
      expect(b.version, b.id).toBe(p.version);
      expect(b.lizenz, b.id).toBe(p.license);
    }
  });

  it('Schriften: Fassung der @fontsource-Pakete, OFL, Urheber aus der Lizenzdatei', () => {
    const datei: Record<string, [string, string]> = {
      'atkinson-hyperlegible-next': ['@fontsource/atkinson-hyperlegible-next', 'src/fonts/atkinson-hyperlegible-next-OFL.txt'],
      'noto-sans-arabic': ['@fontsource/noto-sans-arabic', 'src/fonts/noto-sans-arabic-OFL.txt'],
      amiri: ['@fontsource/amiri', 'src/fonts/amiri-OFL.txt'],
    };
    for (const s of SCHRIFTEN) {
      expect(s.lizenz, s.id).toBe('OFL-1.1');
      if (!datei[s.id]) continue;
      const [name, lizenz] = datei[s.id];
      expect(s.version, s.id).toBe(paket(name).version);
      expect(normal(readFileSync(join(WEB, lizenz), 'utf8')), s.id).toContain(normal(s.urheber));
    }
    expect(SCHRIFTEN.map((s) => s.id)).toEqual(['atkinson-hyperlegible-next', 'noto-sans-arabic', 'amiri', 'igmg-wetzlar-titel']);
  });

  it('jede Bibliothek, die Client-Code der Lern-App importiert, steht in der Liste (aus den Quellen ermittelt)', () => {
    const ids = new Set(BIBLIOTHEKEN.map((b) => b.id));
    // Pakete, deren Eintrag anders heißt (react-dom gehört zu React; im Worker gebündelte Pakete unter eigenem Namen)
    const eintragVon: Record<string, string> = {
      'react-dom': 'react',
      '@huggingface/transformers': 'transformers',
      '@huggingface/tokenizers': 'tokenizers',
      '@huggingface/jinja': 'jinja',
    };
    // Client-Code: Komponenten, Seiten und Module der Lern-App ohne `server-only` und ohne Node-Module (die laufen nur auf
    // dem Server oder beim Bau). Erfasst werden statische, dynamische und Seiteneffekt-Importe, keine reinen Typ-Importe.
    const dateien = ['src/components/lernapp', 'src/lib/lernapp', 'src/app/lern-app'].flatMap((o) =>
      readdirSync(join(WEB, o), { recursive: true, encoding: 'utf8' })
        .filter((d) => /\.(ts|tsx|mjs)$/.test(d) && !d.endsWith('.d.ts'))
        .map((d) => join(WEB, o, d)),
    );
    const pakete = new Set<string>();
    for (const datei of dateien) {
      const text = readFileSync(datei, 'utf8');
      if (/^import 'server-only';/m.test(text) || /from 'node:|import\('node:/.test(text)) continue;
      const ohneTypen = text.replace(/^(?:import|export) type [^;]*;/gm, '');
      for (const [, quelle] of ohneTypen.matchAll(/(?:\bfrom|^import|\bimport\()\s*'([^']+)'/gm)) {
        if (quelle!.startsWith('.') || quelle!.startsWith('@/')) continue;
        const teile = quelle!.split('/');
        pakete.add(quelle!.startsWith('@') ? teile.slice(0, 2).join('/') : teile[0]!);
      }
    }
    // Stichprobe der Erkennung: der Melde-Dialog (altcha-lib, L3-06b) und der Worker der Sprechübung
    expect([...pakete]).toEqual(expect.arrayContaining(['react', 'lucide-react', 'idb', 'altcha-lib', '@huggingface/transformers']));
    for (const p of pakete) expect(ids.has(eintragVon[p] ?? p), p).toBe(true);
    // altcha-lib ist exakt gepinnt (L0-E10)
    const abhaengigkeiten = JSON.parse(readFileSync(join(WEB, 'package.json'), 'utf8')).dependencies as Record<string, string>;
    expect(abhaengigkeiten['altcha-lib']).toBe(BIBLIOTHEKEN.find((b) => b.id === 'altcha-lib')!.version);
    expect(normal(readFileSync(join(WEB, 'node_modules', 'altcha-lib', 'LICENSE.txt'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'altcha-lib')!.urheber),
    );
    // Abhängigkeiten von transformers.js stehen in der Liste und im Lizenzkopf des Workers
    const abhaengig = Object.keys(paket('@huggingface/transformers').dependencies as Record<string, string>).filter((n) =>
      n.startsWith('@huggingface/'),
    );
    expect(abhaengig.sort()).toEqual(['@huggingface/jinja', '@huggingface/tokenizers']);
    const bauschritt = readFileSync(join(WEB, 'scripts', 'lernapp-modelle.mjs'), 'utf8');
    for (const n of [...abhaengig, '@huggingface/transformers', 'onnxruntime-web']) expect(bauschritt, n).toContain(`${n} \${`);
    expect(normal(readFileSync(join(ordner('@huggingface/jinja'), 'LICENSE'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'jinja')!.urheber),
    );
    expect(normal(readFileSync(join(WEB, 'node_modules', 'zod', 'LICENSE'), 'utf8'))).toContain(
      normal(BIBLIOTHEKEN.find((b) => b.id === 'zod')!.urheber),
    );
  });

  it('Lizenztexte gleich den Lizenzdateien', () => {
    expect(normal(readFileSync(join(WEB, 'node_modules', 'fastest-levenshtein', 'LICENSE.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'next', 'license.md'), 'utf8'))).toContain(normal(LIZENZTEXTE.MIT));
    expect(normal(readFileSync(join(WEB, 'node_modules', 'idb', 'LICENSE'), 'utf8'))).toContain(normal(LIZENZTEXTE.ISC));
    for (const ofl of ['noto-sans-arabic-OFL.txt', 'amiri-OFL.txt', 'atkinson-hyperlegible-next-OFL.txt'])
      expect(normal(readFileSync(join(WEB, 'src', 'fonts', ofl), 'utf8')), ofl).toContain(normal(LIZENZTEXTE['OFL-1.1']));
    expect(LIZENZTEXTE['OFL-1.1']).toContain('SIL OPEN FONT LICENSE Version 1.1');
    expect(normal(readFileSync(join(TRANSFORMERS, 'LICENSE'), 'utf8'))).toContain(normal(LIZENZTEXTE['Apache-2.0']));
    expect(normal(lizenzNebenGewichten('LIZENZ-Apache-2.0.txt'))).toContain(normal(LIZENZTEXTE['Apache-2.0']));
    expect(normal(lizenzNebenGewichten('LIZENZ-whisper-MIT.txt'))).toContain(normal(LIZENZTEXTE.MIT));
  });

  it('Spracherkennung (ADR 0042 Nr. 3 und 10): Modell, Bibliotheken und Lizenztexte neben den Gewichten', () => {
    expect(SPRACHERKENNUNG.map((q) => [q.id, q.lizenz])).toEqual([
      ['whisper', 'MIT'],
      ['whisper-base-onnx', 'Apache-2.0'],
    ]);
    // Urheber von Whisper wie im Lizenztext neben den Gewichten; Commit der ONNX-Fassung wie das ausgelieferte Modell
    expect(normal(lizenzNebenGewichten('LIZENZ-whisper-MIT.txt'))).toContain(SPRACHERKENNUNG[0]!.urheber);
    expect(MODELL.commit.startsWith(SPRACHERKENNUNG[1]!.version)).toBe(true);
    expect(MODELL.name).toContain(SPRACHERKENNUNG[1]!.version);
    expect(BIBLIOTHEKEN.find((b) => b.id === 'onnxruntime-web')?.version).toBe(ORT.version);
    expect(LIZENZ_DATEIEN.map((d) => d.pfad)).toEqual(['LIZENZ-whisper-MIT.txt', 'LIZENZ-Apache-2.0.txt']);
  });
});
