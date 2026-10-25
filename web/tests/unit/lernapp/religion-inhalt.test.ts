import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { testkursQuellen } from '../../../drizzle/seeds/lernapp-test';
import { ImportFehler, type ImportQuelle, leseDateien } from '@/lib/lernapp/inhalt/import';
import { ladeWaechter, pruefeReligion } from '@/lib/lernapp/inhalt/religion';

/**
 * Religionswächter für Inhaltsdateien (KERN 4.0 §3, S-L1 M-3): Formel-Lexikon mit Kennzeichen `religionsbezug` und
 * Koran-4-Gramme über Satzgrenzen – geprüft am Testkurs (neutral, grün) und an veränderten Fassungen davon. Arabisches nur
 * aus `web/daten` zur Laufzeit; keine arabische Schrift in dieser Datei.
 */
const DATEN = join(import.meta.dirname, '../../../daten');
const waechter = ladeWaechter(DATEN);

type Json = Record<string, unknown> & { saetze: { text: string; religionsbezug?: boolean; tokens?: string[] }[] };
function geaendert(aendere: (pfad: string, d: Record<string, unknown>) => void): ImportQuelle[] {
  return testkursQuellen().map((q) => {
    const d = JSON.parse(q.text) as Record<string, unknown>;
    aendere(q.pfad, d);
    return { pfad: q.pfad, text: JSON.stringify(d) };
  });
}
const pruefe = (quellen: ImportQuelle[]) => pruefeReligion(leseDateien(quellen), waechter);

/** Vier Wörter aus einem Vers mit mindestens acht Wörtern (vereinfachte Schreibung ohne Zeichen). */
const tanzil = readFileSync(join(DATEN, 'tanzil/quran-uthmani.xml'), 'utf8');
const vers = [...tanzil.matchAll(/<aya index="(\d+)" text="([^"]*)"/g)].map((a) => a[2]!).find((t) => t.split(/\s+/).length >= 8)!;
const VIER = vers
  .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
  .replace(/\u0671/g, '\u0627')
  .split(/\s+/)
  .filter(Boolean)
  .slice(2, 6);

describe('Inhaltsdateien: Formel-Lexikon mit Kennzeichen, 4-Gramme über Satzgrenzen', () => {
  it('der neutrale Testkurs ist grün', () => {
    expect(pruefe(testkursQuellen())).toEqual([]);
  });

  it('ein Satz mit Religionsbegriff braucht religionsbezug: true', () => {
    const ohne = geaendert((pfad, d) => {
      if (pfad.includes('sprache/de/')) (d as Json).saetze[0]!.text = 'Wir gehen zur Moschee.';
    });
    expect(pruefe(ohne)).toEqual([
      expect.stringMatching(/sprache\/de\/.*: de\.a1\.test\.s0001: Formel-Lexikon \(Moschee\) ohne religionsbezug: true$/),
    ]);
    const mit = geaendert((pfad, d) => {
      if (pfad.includes('sprache/de/')) Object.assign((d as Json).saetze[0]!, { text: 'Wir gehen zur Moschee.', religionsbezug: true });
    });
    expect(pruefe(mit)).toEqual([]);
  });

  it('eine Übersetzung erbt das Kennzeichen ihres Zieleintrags; ohne Kennzeichen am Ziel ist sie Rot', () => {
    const satzMit = (bezug: boolean) =>
      geaendert((pfad, d) => {
        if (pfad.includes('sprache/tr/')) Object.assign((d as Json).saetze[0]!, { text: 'Camiye gidiyoruz.', religionsbezug: bezug });
        if (pfad.includes('uebersetzung/tr-aus-de/'))
          (d as { eintraege: { bezug: string; text: string }[] }).eintraege.find((e) => e.bezug.endsWith('.s0001'))!.text =
            'Wir gehen zur Moschee.';
      });
    expect(pruefe(satzMit(true))).toEqual([]);
    const befunde = pruefe(satzMit(false));
    expect(befunde).toHaveLength(2);
    expect(befunde.join('\n')).toMatch(/uebersetzung\/tr-aus-de\/.*@tr-aus-de: Formel-Lexikon \(Moschee\)/);
  });

  it('Thema, Kann-Beschreibung und Lektionsziel haben kein Kennzeichen: ein Treffer ist immer Rot', () => {
    const befunde = pruefe(
      geaendert((pfad, d) => {
        if (pfad.includes('sprache/de/')) (d as { einheit: { thema: Record<string, string> } }).einheit.thema = { de: 'Das Gebet' };
      }),
    );
    expect(befunde).toEqual([expect.stringMatching(/thema\.de: Formel-Lexikon \(Gebet\) in einem Text ohne Kennzeichen$/)]);
  });

  it('vier Koran-Wörter, verteilt auf zwei Sätze, sind Rot – auch mit religionsbezug', () => {
    expect(VIER).toHaveLength(4);
    const befunde = pruefe(
      geaendert((pfad, d) => {
        if (!pfad.includes('sprache/ar/')) return;
        const s = (d as Json).saetze;
        Object.assign(s[0]!, { text: VIER.slice(0, 2).join(' '), religionsbezug: true, tokens: undefined });
        Object.assign(s[1]!, { text: VIER.slice(2).join(' '), religionsbezug: true, tokens: undefined });
      }),
    );
    expect(befunde).toEqual([expect.stringMatching(/sprache\/ar\/.*: ar\.a1\.test\.s0001: Koran-4-Gramm \(Sure \d+:\d+\)$/)]);
  });

  it('der Import bricht bei einem Befund ab, bevor er schreibt (ImportFehler mit den Befunden)', async () => {
    const { importiereLernapp } = await import('@/lib/lernapp/inhalt/import');
    const quellen = geaendert((pfad, d) => {
      if (pfad.includes('sprache/de/')) (d as Json).saetze[0]!.text = 'Inschallah, bis morgen.';
    });
    const db = {
      transaction: () => {
        throw new Error('darf nicht schreiben');
      },
    };
    await expect(importiereLernapp(db as never, quellen)).rejects.toBeInstanceOf(ImportFehler);
    await expect(importiereLernapp(db as never, quellen)).rejects.toThrow(/Formel-Lexikon \(Formel\)/);
  });
});
