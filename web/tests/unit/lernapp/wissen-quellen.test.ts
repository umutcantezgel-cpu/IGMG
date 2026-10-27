import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ISLAM_WERKE } from '@/lib/lernapp/inhalt/schema';
import { WISSENS_QUELLEN } from '@/lib/lernapp/inhalt/wissen-quellen';
import { ARABISCH } from '@/lib/lernapp/waechter/kern.mjs';

/**
 * Quellenregister des Wissens-Imports (`wissen-quellen.ts`) gegen `web/daten/hanafi-quellen/QUELLE.md`, Tabelle „Werke des
 * Quellenregisters“ (KI-Regel 2: Werk- und Verfassernamen nur aus dem Register): je Schlüssel Werk, Verfasser, Todesjahr
 * (Hidschra, erste Zahl in Klammern) und Version-URI wörtlich wie dort.
 */
const md = readFileSync(join(import.meta.dirname, '../../../daten/hanafi-quellen/QUELLE.md'), 'utf8');
const abschnitt = md.split('## Werke des Quellenregisters')[1]!.split('\n## ')[0]!;
const zeilen = abschnitt
  .split('\n')
  .filter((z) => z.startsWith('| `'))
  .map((z) =>
    z
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((x) => x.trim()),
  );

describe('Quellenregister des Wissenskurses = QUELLE.md', () => {
  it('dieselben Schlüssel wie ISLAM_WERKE und die Tabelle', () => {
    const schluessel = zeilen.map((z) => z[0]!.replaceAll('`', ''));
    expect(schluessel.sort()).toEqual(Object.keys(ISLAM_WERKE).sort());
    expect(Object.keys(WISSENS_QUELLEN).sort()).toEqual(Object.keys(ISLAM_WERKE).sort());
  });

  it.each(zeilen.map((z) => [z[0]!.replaceAll('`', ''), z] as const))('%s: Werk, Verfasser, Todesjahr, Version-URI', (k, z) => {
    const r = WISSENS_QUELLEN[k as keyof typeof WISSENS_QUELLEN];
    const verfasser = /^(.*) \((\d+)(?:\/\d+)?\)$/.exec(z[2]!);
    expect(verfasser, z[2]).not.toBeNull();
    const uri = /^`([^`]+)`/.exec(z[3]!);
    expect(r).toEqual({
      werk: z[1],
      autor: verfasser![1],
      todesjahr: Number(verfasser![2]),
      art: ISLAM_WERKE[k as keyof typeof ISLAM_WERKE].art,
      openitiUri: uri ? uri[1] : null,
    });
    expect(ARABISCH.test(JSON.stringify(r))).toBe(false);
  });
});
