import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * JS-Regeln der Lern-App (KERN 4.0 §9, PLAN §3.6, ADR 0037 Nr. 5 mit Fortschreibung Nr. 4):
 * - Im Client der Lern-App kein next-intl und kein `@/lib/utils` (tailwind-merge) – auch nicht über Umwege: geprüft wird
 *   der ganze Modulgraph ab jeder Client-Komponente unter `components/lernapp` und `app/lern-app` (Server-Actions-Module
 *   mit `'use server'` sind im Browser nur Verweise und enden dort).
 * - In der Lern-App nie `next-intl/server` bzw. die `getRequestConfig` der Website (unter `/lern-app` fehlt `locale()`).
 * - Übungstypen (`components/lernapp/aufgaben/**`) nur per `import()`, nie statisch von außerhalb ihres Ordners.
 * - `@huggingface/transformers` nur in `*.worker.ts`.
 * - Zod im Client nur als `zod/mini` über `lib/lernapp/z.ts` (JS-Budget: ≈ 10 KB statt ≈ 28–90 KB gz).
 * - Kein GPL-/LGPL-Code im Client (PLAN §3.6, KERN 4.0 §1): Lizenz jedes Pakets im Client-Modulgraph und seiner
 *   Abhängigkeiten aus der `package.json` (MIT, ISC, Apache-2.0, BSD, MPL-2.0, OFL, 0BSD).
 */
const WURZEL = join(import.meta.dirname, '..', '..', '..', 'src');
const LERNAPP = [join(WURZEL, 'components', 'lernapp'), join(WURZEL, 'app', 'lern-app'), join(WURZEL, 'lib', 'lernapp')];

function dateien(ordner: string): string[] {
  if (!existsSync(ordner)) return [];
  return readdirSync(ordner).flatMap((n) => {
    const p = join(ordner, n);
    return statSync(p).isDirectory() ? dateien(p) : /\.tsx?$/.test(n) ? [p] : [];
  });
}

/** Laufzeit-Importe (statisch, ohne `import type`) und dynamische `import()` einer Datei. */
function importe(text: string): { statisch: string[]; dynamisch: string[] } {
  const ohneTypen = text.replace(/^import type [\s\S]*?from '[^']+';$/gm, '').replace(/^export type [\s\S]*?from '[^']+';$/gm, '');
  const statisch = [...ohneTypen.matchAll(/^(?:import|export)\s[\s\S]*?\sfrom\s'([^']+)';?$|^import\s'([^']+)';?$/gm)].map(
    (m) => m[1] ?? m[2],
  );
  const dynamisch = [...text.matchAll(/\bimport\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]);
  return { statisch, dynamisch };
}

/** Pfad eines Imports in src auflösen (Alias `@/` und relative Pfade); Pakete ergeben null. */
function aufloesen(von: string, ziel: string): string | null {
  const basis = ziel.startsWith('@/') ? join(WURZEL, ziel.slice(2)) : ziel.startsWith('.') ? join(dirname(von), ziel) : null;
  if (!basis) return null;
  for (const kandidat of [basis, `${basis}.ts`, `${basis}.tsx`, join(basis, 'index.ts'), join(basis, 'index.tsx')])
    if (existsSync(kandidat) && statSync(kandidat).isFile()) return kandidat;
  return null;
}

const istClient = (text: string) => /^\s*(?:\/\*[\s\S]*?\*\/\s*)?['"]use client['"]/.test(text);
const istServerActions = (text: string) => /^\s*(?:\/\*[\s\S]*?\*\/\s*)?['"]use server['"]/.test(text);

/** Alle Module, die ab `start` im Browser landen, mit ihren Paket-Importen. */
function clientGraph(start: string): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  const offen = [start];
  while (offen.length) {
    const datei = offen.pop()!;
    if (graph.has(datei)) continue;
    const text = readFileSync(datei, 'utf8');
    if (datei !== start && istServerActions(text)) {
      graph.set(datei, []);
      continue;
    }
    const { statisch } = importe(text);
    graph.set(
      datei,
      statisch.filter((z) => !z.startsWith('.') && !z.startsWith('@/')),
    );
    for (const z of statisch) {
      const pfad = aufloesen(datei, z);
      if (pfad) offen.push(pfad);
    }
  }
  return graph;
}

const lernappDateien = LERNAPP.flatMap(dateien);
const clientDateien = lernappDateien.filter((p) => istClient(readFileSync(p, 'utf8')));
const kurz = (p: string) => relative(WURZEL, p);

describe('Lern-App: Client ohne next-intl und ohne @/lib/utils', () => {
  it('die Prüfung greift (Client-Komponenten gefunden, Importe erkannt)', () => {
    expect(clientDateien.length).toBeGreaterThan(8);
    expect(importe("import { a } from '@/x';\nimport type { B } from 'y';\nconst c = import('./z');").statisch).toEqual(['@/x']);
    expect(importe("const c = import('./aufgaben/Auswahl');").dynamisch).toEqual(['./aufgaben/Auswahl']);
    const graph = clientGraph(join(WURZEL, 'components', 'lernapp', 'anmelden', 'AnmeldeFormulare.tsx'));
    // Server Actions sind im Browser nur Verweise: der Graph endet dort
    expect(graph.get(join(WURZEL, 'server', 'actions', 'konto.ts'))).toEqual([]);
  });

  it.each(clientDateien.map((p) => [kurz(p), p]))('%s: kein next-intl, kein @/lib/utils, nichts Serverseitiges im Modulgraph', (_n, p) => {
    const graph = clientGraph(p);
    const funde: string[] = [];
    for (const [datei, pakete] of graph) {
      for (const paket of pakete) if (/^next-intl(\/|$)|^server-only$/.test(paket)) funde.push(`${kurz(datei)} → ${paket}`);
      if (/lib[/\\]utils\.ts$|lib[/\\]lernapp[/\\]texte\.ts$|i18n[/\\]/.test(datei)) funde.push(kurz(datei));
    }
    expect(funde).toEqual([]);
  });
});

describe('Lern-App: Texte nur mit createTranslator', () => {
  it('nie next-intl/server, getTranslations oder die getRequestConfig der Website', () => {
    const funde = lernappDateien.filter((p) => /from 'next-intl\/server'|getTranslations\(|@\/i18n\/request/.test(readFileSync(p, 'utf8')));
    expect(funde.map(kurz)).toEqual([]);
  });
});

describe('Übungstypen nur per import()', () => {
  const AUFGABEN = join(WURZEL, 'components', 'lernapp', 'aufgaben');
  const LADER = join(AUFGABEN, 'lader.ts');
  it('der Lader enthält nur import() und Typ-Importe', () => {
    const { statisch, dynamisch } = importe(readFileSync(LADER, 'utf8'));
    expect(statisch).toEqual([]);
    expect(dynamisch.length).toBeGreaterThanOrEqual(3);
  });

  it('kein statischer Import aus components/lernapp/aufgaben von außerhalb des Ordners (außer dem Lader)', () => {
    const funde = dateien(WURZEL)
      .filter((p) => !p.startsWith(AUFGABEN))
      .flatMap((p) =>
        importe(readFileSync(p, 'utf8'))
          .statisch.filter((z) => {
            const ziel = aufloesen(p, z);
            if (ziel === LADER) return false;
            return (ziel ?? z).includes(`${join('components', 'lernapp', 'aufgaben')}`) || /lernapp\/aufgaben(\/|$)/.test(z);
          })
          .map((z) => `${kurz(p)} → ${z}`),
      );
    expect(funde).toEqual([]);
  });
});

describe('Sprachmodell nur im Worker', () => {
  it('@huggingface/transformers nur in *.worker.ts', () => {
    const funde = dateien(WURZEL).filter(
      (p) =>
        !p.endsWith('.worker.ts') &&
        /from '@huggingface\/transformers'|import\('@huggingface\/transformers'\)/.test(readFileSync(p, 'utf8')),
    );
    expect(funde.map(kurz)).toEqual([]);
  });
});

describe('Zod im Client nur als zod/mini', () => {
  it.each(clientDateien.map((p) => [kurz(p), p]))('%s: kein volles zod im Modulgraph', (_n, p) => {
    const funde = [...clientGraph(p)].flatMap(([datei, pakete]) =>
      pakete.filter((x) => x === 'zod' || x.startsWith('zod/v')).map((x) => `${kurz(datei)} → ${x}`),
    );
    expect(funde).toEqual([]);
  });
});

// ——— Lizenzen der Pakete im Client ———

const NODE_MODULES = join(WURZEL, '..', 'node_modules');
const ERLAUBT =
  /^\(?(MIT|ISC|Apache-2\.0|BSD-[23]-Clause|0BSD|MPL-2\.0|OFL-1\.1)( (OR|AND) (MIT|ISC|Apache-2\.0|BSD-[23]-Clause|0BSD|MPL-2\.0|OFL-1\.1))*\)?$/;

/** Paketname aus einem Import (`zod/mini` → `zod`, `@scope/x/y` → `@scope/x`). */
const paketName = (imp: string) => (imp.startsWith('@') ? imp.split('/').slice(0, 2).join('/') : imp.split('/')[0]!);

/** Ordner eines Pakets von `von` aus (pnpm: Abhängigkeiten liegen neben dem Paket im node_modules der .pnpm-Kopie). */
function paketOrdner(name: string, von: string): string | null {
  for (let d = von; d !== dirname(d); d = dirname(d)) {
    for (const k of [basename(d) === 'node_modules' ? join(d, name) : '', join(d, 'node_modules', name)])
      if (k && existsSync(join(k, 'package.json'))) return realpathSync(k);
  }
  return null;
}

type PaketInfo = { name: string; lizenz: string; ordner: string; abh: string[] };
function paketInfo(ordner: string): PaketInfo {
  const pj = JSON.parse(readFileSync(join(ordner, 'package.json'), 'utf8')) as {
    name: string;
    license?: string | { type: string };
    dependencies?: Record<string, string>;
  };
  const lizenz = typeof pj.license === 'string' ? pj.license : (pj.license?.type ?? '');
  return { name: pj.name, lizenz, ordner, abh: Object.keys(pj.dependencies ?? {}) };
}

describe('Kein GPL/LGPL im Client der Lern-App', () => {
  it('Lizenzen aller Pakete im Client-Modulgraph samt Abhängigkeiten sind erlaubt', () => {
    const direkt = new Set<string>();
    for (const p of clientDateien) for (const [, pakete] of clientGraph(p)) for (const x of pakete) direkt.add(paketName(x));
    expect([...direkt]).toEqual(expect.arrayContaining(['react', 'zod']));
    const gesehen = new Map<string, PaketInfo>();
    const offen = [...direkt].map((n) => ({ n, von: NODE_MODULES }));
    while (offen.length) {
      const { n, von } = offen.pop()!;
      const ordner = paketOrdner(n, von);
      if (!ordner || gesehen.has(ordner)) continue;
      const info = paketInfo(ordner);
      gesehen.set(ordner, info);
      // Next selbst gehört zum Grundstock; seine Abhängigkeiten sind Bauwerkzeuge (z. B. caniuse-lite), nicht im Client
      if (info.name !== 'next') for (const a of info.abh) offen.push({ n: a, von: ordner });
    }
    const verboten = [...gesehen.values()].filter((i) => /GPL/i.test(i.lizenz) || !ERLAUBT.test(i.lizenz));
    expect(verboten.map((i) => `${i.name}: ${i.lizenz || 'ohne Lizenz'}`)).toEqual([]);
    expect(gesehen.size).toBeGreaterThanOrEqual(direkt.size);
  });
});
