import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { sichererRuecksprung } from '@/lib/konto/regeln';
import { istLernAppZiel, lernAdresse, oberflaecheVon } from '@/lib/lernapp/adressen';
import { bauKennung } from '@/lib/lernapp/bau';
import { LERNAPP_FARBE } from '@/lib/lernapp/farben';
import {
  ausgangVon,
  pruefeEinstellungen,
  STANDARD_EINSTELLUNGEN,
  TAGESZIELE,
  zielAus,
  zielSchluessel,
} from '@/lib/lernapp/oberflaeche/einstellungen';
import { LEERER_START_STAND } from '@/lib/lernapp/oberflaeche/stand';
import { TAGESZIEL_STANDARD } from '@/lib/lernapp/ereignisse/typen';

/**
 * Bausteine der Oberfläche (L1-03): Adressen und Rücksprung nach der Anmeldung (ADR 0037 Nr. 4), Einstellungen auf dem
 * Gerät (ADR 0037 Nr. 7, ADR 0043 Nr. 2), Bau-Kennung der Hülle (PLAN §3.5), Farben der Metadaten = Tokens.
 */
describe('Adressen der Lern-App', () => {
  it('Pfade je Oberfläche', () => {
    expect(lernAdresse('de')).toBe('/lern-app/de');
    expect(lernAdresse('ar', 'tr-aus-ar', 'ueben')).toBe('/lern-app/ar/tr-aus-ar/ueben');
    expect(lernAdresse('tr', '')).toBe('/lern-app/tr');
    expect(oberflaecheVon('/lern-app/tr/einstellungen')).toBe('tr');
    expect(oberflaecheVon('/lern-app/ar?x=1')).toBe('ar');
    expect(oberflaecheVon('/lern-app/en')).toBeNull();
    expect(oberflaecheVon('/mein-bereich')).toBeNull();
  });

  it('Rücksprung nur in die Lern-App (nie zur Anmeldung) oder auf Konto-Seiten – keine offene Weiterleitung', () => {
    for (const gut of ['/lern-app/de', '/lern-app/tr/einstellungen', '/lern-app/ar/de-aus-ar/ueben?l=de.a1.e01.l01', '/mein-bereich'])
      expect(sichererRuecksprung(gut), gut).toBe(gut);
    for (const boese of [
      '/lern-app/de/anmelden',
      '/lern-app/de/anmelden?weiter=/lern-app/de',
      '/lern-app/xx',
      '/lern-app/de/../verwaltung',
      '/lern-app/de/Gross',
      '//evil.example/lern-app/de',
      'https://evil.example/lern-app/de',
      '/lern-app',
      '/lern-appx/de',
    ])
      expect(sichererRuecksprung(boese), boese).toBeNull();
    expect(istLernAppZiel('/lern-app/de/tr-aus-de')).toBe(true);
    expect(istLernAppZiel('/lern-app/tr/anmelden/zwei-faktor')).toBe(false);
  });
});

describe('Einstellungen auf dem Gerät', () => {
  it('Tagesziele nach ADR 0043 Nr. 2, Kurzform hin und zurück', () => {
    expect(TAGESZIELE.map(zielSchluessel)).toEqual([
      'kein',
      'xp-10',
      'xp-20',
      'xp-30',
      'xp-50',
      'lektionen-1',
      'lektionen-2',
      'lektionen-3',
    ]);
    for (const z of TAGESZIELE) expect(zielAus(zielSchluessel(z))).toEqual(z);
    expect(zielAus('xp-15')).toBeNull();
    expect(zielAus(undefined)).toBeNull();
  });

  it('Standard: Ausgang wie Oberfläche, kleines Tagesziel (wie die Ableitung), östlich-arabische Ziffern, Hören und Sprechen an', () => {
    expect(STANDARD_EINSTELLUNGEN.tagesziel).toEqual(TAGESZIEL_STANDARD);
    expect(STANDARD_EINSTELLUNGEN).toEqual({
      ausgang: null,
      tagesziel: { art: 'lektionen', wert: 1 },
      ziffern: 'oestlich',
      hoeren: true,
      sprechen: true,
    });
    expect(ausgangVon(STANDARD_EINSTELLUNGEN, 'tr')).toBe('tr');
    expect(ausgangVon({ ausgang: 'ar' }, 'tr')).toBe('ar');
  });

  it('gespeicherte Werte werden feldweise geprüft; Unbekanntes fällt auf den Standard', () => {
    expect(pruefeEinstellungen(null)).toEqual(STANDARD_EINSTELLUNGEN);
    expect(pruefeEinstellungen('kaputt')).toEqual(STANDARD_EINSTELLUNGEN);
    expect(
      pruefeEinstellungen({
        ausgang: 'ar',
        tagesziel: { art: 'lektionen', wert: 2 },
        ziffern: 'latn',
        hoeren: false,
        sprechen: false,
        fremd: 1,
      }),
    ).toEqual({ ausgang: 'ar', tagesziel: { art: 'lektionen', wert: 2 }, ziffern: 'westlich', hoeren: false, sprechen: false });
    expect(pruefeEinstellungen({ ausgang: 'en', tagesziel: { art: 'xp', wert: 999 }, ziffern: 'x', hoeren: 'ja' })).toEqual(
      STANDARD_EINSTELLUNGEN,
    );
    expect(pruefeEinstellungen({ tagesziel: { art: 'keins' } }).tagesziel).toEqual({ art: 'kein' });
  });

  it('Startstand eines neuen Geräts: leer', () => {
    expect(LEERER_START_STAND).toEqual({ begonnen: false, heute: { xp: 0, lektionen: 0 }, weiter: null, faellig: [], serie: null });
  });
});

describe('Bau-Kennung der Hülle', () => {
  it('aus der Commit-Kennung des Baus, sonst Bereitstellung, sonst „lokal“; nur a–z0–9, höchstens 12 Zeichen', () => {
    const ohneBau = join(tmpdir(), 'igmg-ohne-bau');
    expect(bauKennung({ VERCEL_GIT_COMMIT_SHA: 'A1B2c3d4e5f6a7b8' }, ohneBau)).toBe('a1b2c3d4e5f6');
    expect(bauKennung({ VERCEL_DEPLOYMENT_ID: 'dpl_X9y8' }, ohneBau)).toBe('dplx9y8');
    expect(bauKennung({ BAU_KENNUNG: 'Docker-42' }, ohneBau)).toBe('docker42');
    expect(bauKennung({}, ohneBau)).toBe('lokal');
    expect(bauKennung({ VERCEL_GIT_COMMIT_SHA: '../--' }, ohneBau)).toBe('lokal');
    // Ohne Vercel und ohne BAU_KENNUNG: Hash des Bau-Manifests – jeder Bau mit anderen Programmteilen hat eine neue Hülle
    const bau = mkdtempSync(join(tmpdir(), 'igmg-bau-'));
    writeFileSync(join(bau, 'BUILD_ID'), 'zufall-1');
    const ausId = bauKennung({}, bau);
    expect(ausId).toMatch(/^[0-9a-f]{12}$/);
    writeFileSync(join(bau, 'build-manifest.json'), '{"a":"/_next/static/chunks/a-1.js"}');
    const eins = bauKennung({}, bau);
    expect(eins).toMatch(/^[0-9a-f]{12}$/);
    expect(eins).not.toBe(ausId);
    expect(bauKennung({}, bau)).toBe(eins);
    writeFileSync(join(bau, 'build-manifest.json'), '{"a":"/_next/static/chunks/a-2.js"}');
    expect(bauKennung({}, bau)).not.toBe(eins);
    rmSync(bau, { recursive: true, force: true });
  });
});

describe('Farben der Metadaten', () => {
  it('sind die Tokens aus globals.css', () => {
    const css = readFileSync(join(import.meta.dirname, '..', '..', '..', 'src', 'app', 'globals.css'), 'utf8');
    const token = (name: string) => new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6})`).exec(css)?.[1];
    expect(LERNAPP_FARBE).toEqual({ tiefgruen: token('gruen-950'), gruen: token('gruen-800'), papier: token('papier') });
  });
});
