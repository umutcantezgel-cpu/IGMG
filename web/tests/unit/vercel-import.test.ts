import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Import als neues Vercel-Projekt (Wunsch des Nutzers, 14.10.2026; docs/deploy/VERCEL.md Abschnitt 0): Jeder Weg, den die
 * Import-Maske anbietet, deployt gleich – geprüft mit vercel CLI 64.0.2 (`vercel build`):
 * - Root Directory leer, Preset „Services“ oder „Other“: Services-Bau aus `/vercel.json` (Service web). Die Bau-CLI baut
 *   schon allein wegen des `services`-Blocks so; fällt Vercel laut KB doch auf „Other“ zurück, bricht der Wächter
 *   `/package.json` mit Anleitung ab, statt den Stamm statisch auszuliefern. `web/vercel.json` wird dort nicht gelesen.
 * - Root Directory `web` (Vercels Erkennung findet dort Next.js – getProjectPaths liefert nur „web“): `web/vercel.json`
 *   gilt, mit denselben Einstellungen (Region, Crons, Ignore-Regel).
 */
const WURZEL = resolve(__dirname, '../../..');
const konfig = JSON.parse(readFileSync(join(WURZEL, 'vercel.json'), 'utf8')) as Record<string, unknown>;
const dienste = konfig.services as Record<string, Record<string, unknown>>;

describe('vercel.json für den Import', () => {
  it('liegt im Stamm (Services) und gleichwertig in web/ (Import mit Root Directory web)', () => {
    const web = JSON.parse(readFileSync(join(WURZEL, 'web', 'vercel.json'), 'utf8')) as Record<string, unknown>;
    expect(web.framework).toBe('nextjs');
    expect(web.regions).toEqual(konfig.regions);
    expect(web.crons).toEqual(konfig.crons);
    expect(web.ignoreCommand).toBe('node scripts/vercel-ignore.mjs');
    expect(web).not.toHaveProperty('services');
    expect(existsSync(join(WURZEL, 'web', 'scripts', 'vercel-ignore.mjs'))).toBe(true);
  });

  it('beschreibt die Web-App als Service mit Wurzel web und Next.js', () => {
    expect(Object.keys(dienste)).toEqual(['web']);
    expect(dienste.web.root).toBe('web');
    expect(dienste.web.framework).toBe('nextjs');
  });

  it('leitet jede Anfrage an den Service weiter (sonst bekäme er keinen öffentlichen Verkehr)', () => {
    expect(konfig.rewrites).toEqual([{ source: '/(.*)', destination: { service: 'web' } }]);
  });

  it('hat im Stamm nur einen Wächter, der ohne Services-Preset mit Anleitung abbricht', () => {
    const waechter = JSON.parse(readFileSync(join(WURZEL, 'package.json'), 'utf8')) as Record<string, unknown> & {
      scripts: Record<string, string>;
    };
    expect(waechter.private).toBe(true);
    for (const feld of ['dependencies', 'devDependencies', 'packageManager', 'workspaces', 'engines'])
      expect(waechter).not.toHaveProperty(feld);
    for (const skript of ['build', 'vercel-build']) {
      expect(waechter.scripts[skript]).toContain('Framework Preset auf Services');
      expect(waechter.scripts[skript]).toContain('process.exit(1)');
    }
    // Keine Lockfile im Stamm: Vercel soll dort nichts installieren
    for (const datei of ['pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'pnpm-workspace.yaml'])
      expect(existsSync(join(WURZEL, datei))).toBe(false);
  });

  it('hat keine Bau- oder Laufzeitschlüssel auf oberster Ebene (im Services-Modus ungültig)', () => {
    for (const schluessel of [
      'framework',
      'buildCommand',
      'installCommand',
      'devCommand',
      'ignoreCommand',
      'outputDirectory',
      'functions',
      'builds',
    ])
      expect(konfig).not.toHaveProperty(schluessel);
  });

  it('baut mit dem Skript, das ohne Datenbank und ohne Umgebungsvariablen auskommt (Beispielmodus)', () => {
    const paket = JSON.parse(readFileSync(join(WURZEL, 'web', 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
      engines?: { node?: string };
    };
    expect(paket.scripts['vercel-build']).toBe('node scripts/vercel-bau.mjs');
    expect(paket.engines?.node).toMatch(/^\d+\.x$/);
    expect(existsSync(join(WURZEL, 'web', 'pnpm-lock.yaml'))).toBe(true);
  });

  it('schließt Laufunterlagen vom Upload aus, aber nie die Web-App', () => {
    const ignoriert = readFileSync(join(WURZEL, '.vercelignore'), 'utf8')
      .split('\n')
      .map((z) => z.trim())
      .filter((z) => z && !z.startsWith('#'));
    expect(ignoriert).toEqual(expect.arrayContaining(['_archiv', '_gemeinde', '_lauf']));
    expect(ignoriert.some((z) => z === 'web' || z.startsWith('web/') || z === '*')).toBe(false);
  });
});
