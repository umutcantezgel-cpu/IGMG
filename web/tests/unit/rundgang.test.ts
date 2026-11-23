import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import texte from '../../messages/verwaltung/rundgang.json';
import { AUFNAHMEN, RUNDGANG_GRUPPEN, aufnahmeAdresse, type SchirmId } from '@/components/verwaltung/rundgang/aufnahmen';

/**
 * Rundgang der Vorführung ohne Datenbank: Jede Aufnahme hat ihre zwei Dateien, einen Titel und einen Erklärtext und steht
 * in genau einem Bereich – sonst zeigte die Seite ein kaputtes Bild oder einen Schlüssel statt Text.
 */
const ORDNER = join(process.cwd(), 'public', 'vorfuehrung');
const t = texte.rundgang;
const ids = Object.keys(AUFNAHMEN) as SchirmId[];
const inGruppen = RUNDGANG_GRUPPEN.flatMap((g) => [...g.schirme]);

describe('Rundgang: Aufnahmen, Bereiche und Texte passen zusammen', () => {
  it('jeder Bildschirm steht in genau einem Bereich', () => {
    expect([...inGruppen].sort()).toEqual([...ids].sort());
    expect(new Set(inGruppen).size).toBe(inGruppen.length);
  });

  it('zu jeder Aufnahme liegen beide Dateien vor, und es liegt keine Datei ohne Eintrag herum', () => {
    const erwartet = ids.flatMap((id) => (['desktop', 'telefon'] as const).map((g) => aufnahmeAdresse(id, g).replace('/vorfuehrung/', '')));
    for (const datei of erwartet) expect(existsSync(join(ORDNER, datei)), datei).toBe(true);
    expect(readdirSync(ORDNER).sort()).toEqual([...erwartet].sort());
  });

  it('Breite und Höhe sind gesetzt (Platz halten beim Nachladen)', () => {
    for (const id of ids)
      for (const g of ['desktop', 'telefon'] as const) {
        expect(AUFNAHMEN[id][g].breite, `${id} ${g}`).toBeGreaterThan(300);
        expect(AUFNAHMEN[id][g].hoehe, `${id} ${g}`).toBeGreaterThan(300);
      }
  });

  it('jeder Bildschirm und jeder Bereich hat Titel und Erklärtext, ohne überzählige Schlüssel', () => {
    expect(Object.keys(t.schirme).sort()).toEqual([...ids].sort());
    for (const eintrag of Object.values(t.schirme)) {
      expect(eintrag.titel.trim()).not.toBe('');
      expect(eintrag.text.trim()).not.toBe('');
    }
    expect(Object.keys(t.gruppen).sort()).toEqual(RUNDGANG_GRUPPEN.map((g) => g.id).sort());
    for (const eintrag of Object.values(t.gruppen)) {
      expect(eintrag.titel.trim()).not.toBe('');
      expect(eintrag.text.trim()).not.toBe('');
    }
  });
});
