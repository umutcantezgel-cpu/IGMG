import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testkursQuellen } from '../../../drizzle/seeds/lernapp-test';
import { ImportFehler, type ImportQuelle } from '@/lib/lernapp/inhalt/import';
import { ladeWaechter } from '@/lib/lernapp/inhalt/religion';
import { ausschlussAusQuelle, pruefeTatoebaAusschluss, TATOEBA_AUSSCHLUSS, tatoebaId } from '@/lib/lernapp/inhalt/tatoeba';
import { leseDateien } from '@/lib/lernapp/inhalt/import';
import { vierGrammTreffer } from '@/lib/lernapp/waechter/kern.mjs';

/**
 * Import-Ausschluss der Tatoeba-Sätze mit Koran- oder Hadith-4-Gramm (ADR 0045 Fortschreibung S7 Nr. 3, S7-E7; L3-02). Die
 * Sätze kommen zur Laufzeit aus `web/daten/tatoeba` und dienen als Positivproben des Wächters (KERN 4.0 §3); in dieser Datei
 * steht keine arabische Schrift, Meldungen enthalten nur IDs und Fundstellen.
 */
const DATEN = join(import.meta.dirname, '../../../daten');
const QUELLE = readFileSync(join(DATEN, 'tatoeba/QUELLE.md'), 'utf8');
const ARABISCHE_SAETZE = new Map(
  readFileSync(join(DATEN, 'tatoeba/saetze_ara.tsv'), 'utf8')
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((z) => z.split('\t'))
    .map((z) => [Number(z[0]), z[2]!] as const),
);
const waechter = ladeWaechter(DATEN);

describe('Tatoeba-Ausschlussliste', () => {
  it('stimmt mit web/daten/tatoeba/QUELLE.md überein (43 IDs)', () => {
    const ids = ausschlussAusQuelle(QUELLE);
    expect(ids).toHaveLength(43);
    expect(new Set(ids)).toEqual(TATOEBA_AUSSCHLUSS);
  });

  it('alle 43 Sätze stehen im Auszug und sind Positivproben des Wächters (Koran- bzw. Hadith-4-Gramm)', () => {
    const verfehlt = [...TATOEBA_AUSSCHLUSS].filter((id) => {
      const satz = ARABISCHE_SAETZE.get(id);
      return !satz || vierGrammTreffer(satz, waechter.index) === null;
    });
    expect(verfehlt).toEqual([]);
  });

  it('der Wächter findet im arabischen Auszug genau diese 43 (keine Lücke der Liste, Restmangel L2)', () => {
    const treffer = [...ARABISCHE_SAETZE].filter(([, satz]) => vierGrammTreffer(satz, waechter.index) !== null).map(([id]) => id);
    expect(new Set(treffer)).toEqual(TATOEBA_AUSSCHLUSS);
  });

  it('tatoebaId liest nur tatoeba:<id>', () => {
    expect(tatoebaId('tatoeba:372061')).toBe(372061);
    expect(tatoebaId('ki:l3/x')).toBeNull();
    expect(tatoebaId(undefined)).toBeNull();
  });
});

describe('Import: ein ausgeschlossener Tatoeba-Satz bricht ab, bevor geschrieben wird', () => {
  const mitQuelle = (id: number): ImportQuelle[] =>
    testkursQuellen().map((q) => {
      if (!q.pfad.includes('sprache/ar/')) return q;
      const d = JSON.parse(q.text) as { saetze: { quelle: string; lizenz: string; namensnennung?: string }[] };
      Object.assign(d.saetze[0]!, { quelle: `tatoeba:${id}`, lizenz: 'CC-BY-2.0-FR', namensnennung: `Satz #${id} von [Name]` });
      return { pfad: q.pfad, text: JSON.stringify(d) };
    });

  it('pruefeTatoebaAusschluss meldet nur ausgeschlossene IDs, ohne Text', () => {
    const id = [...TATOEBA_AUSSCHLUSS][0]!;
    const befunde = pruefeTatoebaAusschluss(leseDateien(mitQuelle(id)));
    expect(befunde).toEqual([expect.stringMatching(new RegExp(`ar\\.a1\\.e01\\.s0001: Tatoeba-Satz ${id} ausgeschlossen`))]);
    expect(pruefeTatoebaAusschluss(leseDateien(mitQuelle(78)))).toEqual([]);
  });

  it('importiereLernapp wirft ImportFehler', async () => {
    const { importiereLernapp } = await import('@/lib/lernapp/inhalt/import');
    const db = {
      transaction: () => {
        throw new Error('darf nicht schreiben');
      },
    };
    const id = [...TATOEBA_AUSSCHLUSS][5]!;
    await expect(importiereLernapp(db as never, mitQuelle(id))).rejects.toBeInstanceOf(ImportFehler);
    await expect(importiereLernapp(db as never, mitQuelle(id))).rejects.toThrow(new RegExp(`Tatoeba-Satz ${id} ausgeschlossen`));
  });
});
