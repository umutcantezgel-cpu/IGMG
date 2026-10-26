import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { basename, dirname, join, relative, sep } from 'node:path';
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
  const statisch = [...ohneTypen.matchAll(/^(?:import|export)\s(?!['"])[^;]*?\sfrom\s'([^']+)';?$|^import\s'([^']+)';?$/gm)].map(
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
    // Seiteneffekt-Importe verschlucken den folgenden Import nicht; `export const` reicht nicht bis zum nächsten `from`
    expect(importe("import 'server-only';\nimport { a } from '@/x';\nexport const b = 1;\nexport { c } from './c';").statisch).toEqual([
      'server-only',
      '@/x',
      './c',
    ]);
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
            return (ziel ?? z).includes(`${join('components', 'lernapp', 'aufgaben')}`) || /components\/lernapp\/aufgaben(\/|$)/.test(z);
          })
          .map((z) => `${kurz(p)} → ${z}`),
      );
    expect(funde).toEqual([]);
  });
});

describe('Bewertung nur in den Übungs-Chunks (KERN 4.0 §9)', () => {
  const AUFGABEN_LIB = join(WURZEL, 'lib', 'lernapp', 'aufgaben');
  /** Module mit Bewertung oder Anzeige-Hilfen eines Typs (gehören in den Chunk des Typs, nicht in die Route). */
  const istBewertung = (p: string) =>
    p.startsWith(join(AUFGABEN_LIB, 'auswertung')) ||
    ['bewerte.ts', 'auswahl.ts', 'wortbank.ts', 'paare.ts'].some((n) => p === join(AUFGABEN_LIB, n));

  it.each([
    'Spieler.tsx',
    'Einstufung.tsx',
    join('inseln', 'UebenInsel.tsx'),
    join('inseln', 'WiederholenInsel.tsx'),
    join('inseln', 'EinstufungInsel.tsx'),
  ])('%s lädt statisch keine Bewertung', (datei) => {
    const graph = clientGraph(join(WURZEL, 'components', 'lernapp', datei));
    expect(graph.size).toBeGreaterThan(3);
    expect([...graph.keys()].filter(istBewertung).map(kurz)).toEqual([]);
  });

  it('die Nutzlast-Dateien der Typen (Zod) importieren keine Bewertung', () => {
    const nutzlast = readdirSync(AUFGABEN_LIB)
      .filter((n) => n.endsWith('.ts'))
      .map((n) => join(AUFGABEN_LIB, n))
      .filter((p) => !istBewertung(p));
    expect(nutzlast.length).toBeGreaterThan(10);
    const funde = nutzlast.flatMap((p) =>
      importe(readFileSync(p, 'utf8'))
        .statisch.map((z) => aufloesen(p, z))
        .filter((z): z is string => z !== null && istBewertung(z))
        .map((z) => `${kurz(p)} → ${kurz(z)}`),
    );
    expect(funde).toEqual([]);
  });
});

describe('Zod erst bei Bedarf (TBT der Spieler-Routen, Befund der L1-Gegenprüfung)', () => {
  const Z = join(WURZEL, 'lib', 'lernapp', 'z.ts');
  it.each([
    'Spieler.tsx',
    'Einstufung.tsx',
    join('inseln', 'UebenInsel.tsx'),
    join('inseln', 'WiederholenInsel.tsx'),
    join('inseln', 'EinstufungInsel.tsx'),
  ])('%s lädt Zod nicht statisch (Paketprüfung und Ausgang nur per import())', (datei) => {
    const graph = clientGraph(join(WURZEL, 'components', 'lernapp', datei));
    expect(graph.size).toBeGreaterThan(3);
    expect(graph.has(Z)).toBe(false);
  });

  it('die Prüfung greift: der Paket-Lader zieht Zod', () => {
    expect(clientGraph(join(WURZEL, 'lib', 'lernapp', 'lokal', 'pakete.ts')).has(Z)).toBe(true);
  });

  it('Paketprüfung und Engine ohne Ereignis-Schemas und ohne Tippfehler-Abgleich (Levenshtein nur in den Übungs-Chunks)', () => {
    const ereignisse = join(WURZEL, 'lib', 'lernapp', 'ereignisse', 'typen.ts');
    const abgleich = join(WURZEL, 'lib', 'lernapp', 'abgleich', 'index.ts');
    const pakete = clientGraph(join(WURZEL, 'lib', 'lernapp', 'lokal', 'pakete.ts'));
    expect(pakete.has(ereignisse)).toBe(false);
    expect(pakete.has(abgleich)).toBe(false);
    expect(clientGraph(join(WURZEL, 'components', 'lernapp', 'Spieler.tsx')).has(abgleich)).toBe(false);
  });

  it('Üben und Wiederholen laden den Ausgang der Ereignisse erst bei Bedarf (inseln/ausgang.ts)', () => {
    for (const datei of ['UebenInsel.tsx', 'WiederholenInsel.tsx']) {
      const text = readFileSync(join(WURZEL, 'components', 'lernapp', 'inseln', datei), 'utf8');
      expect(text, datei).not.toContain('lokal/ausgang');
    }
    expect(readFileSync(join(WURZEL, 'components', 'lernapp', 'inseln', 'ausgang.ts'), 'utf8')).toContain(
      "import('@/lib/lernapp/lokal/ausgang')",
    );
  });

  it('der Spieler holt den nächsten Übungstyp erst ab der ersten Eingabe (beim Öffnen lädt nur die erste Aufgabe)', () => {
    const text = readFileSync(join(WURZEL, 'components', 'lernapp', 'Spieler.tsx'), 'utf8');
    const vorladen = /useEffect\(\(\) => \{\s*const naechste[\s\S]*?\}, \[([^\]]*)\]\);/.exec(text);
    expect(vorladen, 'Vorladen des nächsten Typs').not.toBeNull();
    expect(vorladen![0]).toMatch(/if \(eingabe && naechste/);
    expect(vorladen![1].split(',').map((x) => x.trim())).toContain('eingabe');
    expect(text).toContain('const eingabe = useErsteEingabe();');
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

// ——— sharp/libvips und onnxruntime-node nicht in Funktionen der Lern-App (ADR 0042 Nr. 10, Z-L19) ———

/**
 * Serverseitige Startpunkte der Lern-App: jedes Modul unter `src`, dessen Pfad einen Abschnitt `lernapp*` oder `lern-app*`
 * hat – u. a. `app/lern-app`, die API `app/api/lernapp/**` (sync, sitzung, schreiben, gruppe, meldung), Verwaltung › Lern-App,
 * Mein Bereich › Unterricht › Lern-App, `components/lernapp`, `components/verwaltung/lernapp`, `lib/lernapp`,
 * `server/queries/lernapp` und die Actions `server/actions/lernapp*`. Worker (`*.worker.ts`) laufen nur im Browser (eigener
 * Bau nach `public/`) und zählen nicht.
 */
const AKTIONEN = join(WURZEL, 'server', 'actions');
const LERNAPP_ABSCHNITT = /^(lernapp|lern-app)/;
const lernappServer = dateien(WURZEL).filter(
  (p) =>
    kurz(p)
      .split(sep)
      .some((t) => LERNAPP_ABSCHNITT.test(t)) && !p.endsWith('.worker.ts'),
);

/** Ganzer Modulgraph einer Funktion: statische und dynamische Importe sowie `require()`, auch über `'use server'`/`'use client'`. */
function funktionsGraph(starts: string[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();
  const offen = [...starts];
  while (offen.length) {
    const datei = offen.pop()!;
    if (graph.has(datei)) continue;
    const text = readFileSync(datei, 'utf8');
    const { statisch, dynamisch } = importe(text);
    const erforderlich = [...text.matchAll(/\brequire\(\s*'([^']+)'\s*\)/g)].map((m) => m[1]!);
    const alle = [...statisch, ...dynamisch, ...erforderlich].filter((z): z is string => Boolean(z));
    graph.set(
      datei,
      alle.filter((z) => !z.startsWith('.') && !z.startsWith('@/') && !z.startsWith('node:')),
    );
    for (const z of alle) {
      const pfad = aufloesen(datei, z);
      if (pfad) offen.push(pfad);
    }
  }
  return graph;
}

/** sharp mit libvips (LGPL-3.0, `@img/sharp*`) und `onnxruntime-node` (ADR 0042 Nr. 10: nie in Funktionen der Lern-App). */
const istSharp = (name: string) => name === 'sharp' || name.startsWith('@img/sharp') || name === 'onnxruntime-node';

/**
 * Funde von sharp/libvips: direkte Importe im Modulgraph und Pakete, die sharp über `dependencies` oder
 * `optionalDependencies` mitbringen (z. B. `@huggingface/transformers`). Next selbst gehört zum Grundstock: Sein optionales
 * sharp dient nur der Bildoptimierung (`/_next/image`), die nicht in den Funktionen der Lern-App läuft (Bau-Ausgabe: `.nft.json`).
 */
function sharpFunde(graph: Map<string, string[]>): string[] {
  const funde: string[] = [];
  const gesehen = new Set<string>();
  const offen: { n: string; von: string; weg: string }[] = [];
  for (const [datei, pakete] of graph)
    for (const x of pakete) {
      const n = paketName(x);
      if (istSharp(n)) funde.push(`${kurz(datei)} → ${n}`);
      else if (n !== 'next') offen.push({ n, von: NODE_MODULES, weg: `${kurz(datei)} → ${n}` });
    }
  while (offen.length) {
    const { n, von, weg } = offen.pop()!;
    const ordner = paketOrdner(n, von);
    if (!ordner || gesehen.has(ordner)) continue;
    gesehen.add(ordner);
    const pj = JSON.parse(readFileSync(join(ordner, 'package.json'), 'utf8')) as {
      dependencies?: Record<string, string>;
      optionalDependencies?: Record<string, string>;
    };
    for (const a of new Set([...Object.keys(pj.dependencies ?? {}), ...Object.keys(pj.optionalDependencies ?? {})])) {
      if (istSharp(a)) funde.push(`${weg} → ${a}`);
      else offen.push({ n: a, von: ordner, weg: `${weg} → ${a}` });
    }
  }
  return funde;
}

describe('Kein sharp/libvips (LGPL-3.0) und kein onnxruntime-node in Funktionen der Lern-App', () => {
  it('die Prüfung greift (Startpunkte gefunden; die Website-Action „Medien“ zieht sharp, M-060)', () => {
    expect(lernappServer.map(kurz)).toEqual(
      expect.arrayContaining([
        join('server', 'actions', 'lernapp-audio.ts'),
        join('app', 'lern-app', 'audio', '[...pfad]', 'route.ts'),
        join('server', 'queries', 'lernapp', 'audio-studio.ts'),
        // API der Lern-App (Abgleich, Sitzung, Schreibabgabe, Gruppe, Meldung) und die Lern-App-Seite in Mein Bereich
        ...['sync', 'sitzung', 'schreiben', 'gruppe', 'meldung'].map((r) => join('app', 'api', 'lernapp', r, 'route.ts')),
        join('app', '[locale]', '(konto)', 'mein-bereich', 'unterricht', '[gruppe]', 'lern-app', 'page.tsx'),
        join('app', '[locale]', 'verwaltung', '(geschuetzt)', 'lernapp', 'audio', 'page.tsx'),
        join('components', 'verwaltung', 'lernapp', 'ClipAnhoeren.tsx'),
      ]),
    );
    expect(lernappServer.some((p) => p.endsWith('.worker.ts'))).toBe(false);
    // keine Website-Module (die Website-Action „Medien“ und ihre Bildpipeline gehören nicht dazu)
    expect(lernappServer.map(kurz)).not.toContain(join('server', 'actions', 'medien.ts'));
    expect(sharpFunde(funktionsGraph([join(AKTIONEN, 'medien.ts')]))).toContain(`${join('lib', 'medien', 'verarbeiten.ts')} → sharp`);
    // über Paket-Abhängigkeiten: der Worker (nur Browser) bringt sharp und onnxruntime-node über @huggingface/transformers mit
    const worker = join(WURZEL, 'components', 'lernapp', 'sprechen', 'whisper.worker.ts');
    expect(sharpFunde(funktionsGraph([worker]))).toEqual(
      expect.arrayContaining([
        `${kurz(worker)} → @huggingface/transformers → sharp`,
        `${kurz(worker)} → @huggingface/transformers → onnxruntime-node`,
      ]),
    );
    const graph = funktionsGraph([join(AKTIONEN, 'lernapp-audio.ts')]);
    expect(graph.has(join(WURZEL, 'lib', 'medien', 'typ.ts'))).toBe(true);
    expect(graph.has(join(WURZEL, 'lib', 'medien', 'verarbeiten.ts'))).toBe(false);
  });

  it('kein Modul der Lern-App erreicht sharp oder onnxruntime-node, auch nicht über Pakete', () => {
    expect(sharpFunde(funktionsGraph(lernappServer))).toEqual([]);
  });
});

describe('Budget-Messung (scripts/lernapp-budget.mjs)', () => {
  it('jeder Erkennungstext steht in genau einer Quelldatei, und zwar in der genannten', () => {
    const erkennung = JSON.parse(readFileSync(join(WURZEL, '..', 'scripts', 'lernapp-budget-erkennung.json'), 'utf8')) as Record<
      string,
      { datei: string; text: string }
    >;
    expect(Object.keys(erkennung).sort()).toEqual(
      [
        'abspieler',
        'anhoeren',
        'arabischeTastatur',
        'auswahl',
        'bild_wort',
        'dialog',
        'erklaerung',
        'fallfrage',
        'formen',
        'frei',
        'geschichte',
        'grammatik_tipp',
        'harakat',
        'koran_wort',
        'lesen_fragen',
        'luecke',
        'optionsgruppe',
        'paare',
        'reihenfolge',
        'schreiben',
        'schrift_ar',
        'schrift_wahl',
        'sonderzeichen',
        'spieler',
        'sprechen',
        'texteingabe',
        'wahlgruppe',
        'wahr_falsch',
        'wortbank',
        'zeichenhilfe',
        'zuordnen',
      ].sort(),
    );
    const alle = dateien(WURZEL).filter((p) => p.endsWith('.tsx') || p.endsWith('.ts'));
    for (const [name, { datei, text }] of Object.entries(erkennung)) {
      const treffer = alle.filter((p) => readFileSync(p, 'utf8').includes(text)).map((p) => relative(join(WURZEL, '..'), p));
      expect(treffer, name).toEqual([datei]);
    }
  });
});
