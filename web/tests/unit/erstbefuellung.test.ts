import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { einladungsLink } from '@/lib/rechte/einladung-anlegen';
import { einladungsBasis, erstbefuellungImBau } from '../../scripts/erstbefuellung-regel.mjs';

/**
 * Erstbefüllung im Vercel-Bau (E-047, Nachtrag ADR 0019 vom 28.10.2026): Seeds und erste Einladung nur im Production-Bau
 * und nur auf Anforderung; unvollständige Angaben brechen den Bau ab, statt den Link stillschweigend wegzulassen. Der
 * Einladungslink zeigt auf die Produktionsadresse, nie auf die geschützte Adresse des einzelnen Deployments.
 */
const PROD = { VERCEL_ENV: 'production' } as const;
const PERSON = { ERSTE_VERWALTUNG_EMAIL: ' Person@Example.test ', ERSTE_VERWALTUNG_NAME: ' Testperson Eins ' };

describe('erstbefuellungImBau', () => {
  it('ohne Anforderung: nichts zu tun, keine Hinweise', () => {
    expect(erstbefuellungImBau({})).toEqual({ seed: false, einladung: null, hinweise: [], fehler: [] });
    expect(erstbefuellungImBau(PROD)).toEqual({ seed: false, einladung: null, hinweise: [], fehler: [] });
  });

  it('Production mit ERSTBEFUELLUNG=1 und Person: Seeds und Einladung (E-Mail klein, beides getrimmt)', () => {
    expect(erstbefuellungImBau({ ...PROD, ERSTBEFUELLUNG: '1', ...PERSON })).toEqual({
      seed: true,
      einladung: { email: 'person@example.test', name: 'Testperson Eins' },
      hinweise: [],
      fehler: [],
    });
    expect(erstbefuellungImBau({ ...PROD, ...PERSON })).toMatchObject({ seed: false, einladung: { email: 'person@example.test' } });
    expect(erstbefuellungImBau({ ...PROD, ERSTBEFUELLUNG: '1' })).toMatchObject({ seed: true, einladung: null, fehler: [] });
  });

  it('Vorschau, Entwicklung und lokal: nie, nur ein Hinweis mit den gesetzten Variablen', () => {
    for (const VERCEL_ENV of ['preview', 'development', undefined]) {
      const plan = erstbefuellungImBau({ VERCEL_ENV, ERSTBEFUELLUNG: '1', ...PERSON });
      expect(plan).toMatchObject({ seed: false, einladung: null, fehler: [] });
      expect(plan.hinweise).toEqual([
        'ERSTBEFUELLUNG, ERSTE_VERWALTUNG_EMAIL, ERSTE_VERWALTUNG_NAME gilt nur im Production-Bau – hier übersprungen.',
      ]);
    }
  });

  it('Production mit unvollständigen oder ungültigen Angaben: Fehler (Bau bricht ab), nichts geplant', () => {
    expect(erstbefuellungImBau({ ...PROD, ERSTBEFUELLUNG: 'ja' }).fehler).toEqual(['ERSTBEFUELLUNG muss 1 sein (gesetzt: „ja“).']);
    expect(erstbefuellungImBau({ ...PROD, ERSTE_VERWALTUNG_NAME: 'Testperson' })).toMatchObject({
      einladung: null,
      fehler: ['ERSTE_VERWALTUNG_NAME ist gesetzt, ERSTE_VERWALTUNG_EMAIL fehlt.'],
    });
    expect(erstbefuellungImBau({ ...PROD, ERSTE_VERWALTUNG_EMAIL: 'person@example.test' }).fehler).toEqual([
      'ERSTE_VERWALTUNG_EMAIL ist gesetzt, ERSTE_VERWALTUNG_NAME fehlt.',
    ]);
    expect(erstbefuellungImBau({ ...PROD, ERSTE_VERWALTUNG_EMAIL: 'keine-adresse', ERSTE_VERWALTUNG_NAME: 'T' })).toMatchObject({
      einladung: null,
      fehler: ['ERSTE_VERWALTUNG_EMAIL ist keine gültige E-Mail-Adresse.'],
    });
  });

  it('leere oder nur aus Leerzeichen bestehende Werte gelten als nicht gesetzt', () => {
    expect(erstbefuellungImBau({ ...PROD, ERSTBEFUELLUNG: ' ', ERSTE_VERWALTUNG_EMAIL: '', ERSTE_VERWALTUNG_NAME: '  ' })).toEqual({
      seed: false,
      einladung: null,
      hinweise: [],
      fehler: [],
    });
  });
});

describe('einladungsBasis und einladungsLink', () => {
  it('APP_URL vor der Produktionsadresse von Vercel, nie VERCEL_URL', () => {
    expect(einladungsBasis({ APP_URL: 'https://moschee.example/', VERCEL_PROJECT_PRODUCTION_URL: 'x.vercel.app' })).toBe(
      'https://moschee.example',
    );
    expect(einladungsBasis({ VERCEL_PROJECT_PRODUCTION_URL: 'igmg-test.vercel.app', VERCEL_URL: 'igmg-abc123.vercel.app' })).toBe(
      'https://igmg-test.vercel.app',
    );
    expect(einladungsBasis({ VERCEL_URL: 'igmg-abc123.vercel.app' })).toBeUndefined();
  });

  it('Verwaltungsrolle führt in die Verwaltung, sonst auf die Einladungsseite der Website', () => {
    expect(einladungsLink('https://moschee.example/', 'abc', true)).toBe('https://moschee.example/verwaltung/einladung/abc');
    expect(einladungsLink('https://moschee.example', 'abc', false)).toBe('https://moschee.example/einladung/abc');
  });
});

describe('Bau-Skript', () => {
  const skript = readFileSync(join(import.meta.dirname, '../../scripts/vercel-bau.mjs'), 'utf8');

  it('startet die Erstbefüllung nur im Zweig mit Datenbank, nach der Migration und vor den Inhaltsdaten', () => {
    const mitDb = skript.slice(skript.indexOf('if (process.env.DATABASE_URL)'), skript.indexOf('} else {'));
    const migration = mitDb.indexOf("'scripts/migriere-mit-sperre.mjs'");
    const erst = mitDb.indexOf("'scripts/erstbefuellung.ts'");
    expect(migration).toBeGreaterThan(0);
    expect(erst).toBeGreaterThan(migration);
    expect(erst).toBeLessThan(mitDb.indexOf("'scripts/inhalte-import.ts'"));
    expect(skript.slice(skript.indexOf('} else {'))).not.toContain('erstbefuellung');
  });

  it('entscheidet nur über erstbefuellungImBau', () => {
    expect(skript).toContain("import { erstbefuellungImBau } from './erstbefuellung-regel.mjs';");
    expect(skript).not.toMatch(/process\.env\.(?:ERSTBEFUELLUNG|ERSTE_VERWALTUNG_\w+)\b/);
  });
});
