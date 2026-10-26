import type { ReactElement } from 'react';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';
import { LernpfadStufen, type StationsKontext } from '@/components/lernapp/inseln/LernpfadInsel';
import { formatiere } from '@/lib/lernapp/format';
import type { Stufe } from '@/lib/lernapp/kurse';
import { abschnitte, type PaketInhalt } from '@/lib/lernapp/oberflaeche/kursverzeichnis';
import { VERZEICHNIS_FORMAT } from '@/lib/lernapp/paket/kennungen';
import type { Verzeichnis, VerzeichnisEinheit } from '@/lib/lernapp/paket/typen';
import ar from '../../../messages/lernapp/ar.json';
import de from '../../../messages/lernapp/de.json';

/**
 * Lernpfad mit echten Kursgrößen (Stufe C N8, Z-L07): Stationen nur für die Stufe der aktuellen Einheit und für von Hand
 * aufgeklappte Stufen; die übrigen Stufen behalten Überschrift und „Stufe abgeschlossen“ und zeigen die Zahl ihrer Einheiten
 * in einem `<details>`. Jede Karte trägt `zeichnen-bei-sicht`. Testdaten: Platzhalter in eckigen Klammern.
 */

async function vorrendern(ui: ReactElement): Promise<string> {
  const { prelude } = await prerenderToNodeStream(ui);
  let html = '';
  for await (const teil of prelude) html += String(teil);
  return html.replaceAll('<!-- -->', '');
}
const anzahl = (html: string, muster: RegExp) => [...html.matchAll(muster)].length;

const einheit = (stufe: Stufe, n: number): VerzeichnisEinheit => ({
  schluessel: `tr.${stufe}.e${String(n).padStart(2, '0')}`,
  stufe,
  reihenfolge: n,
  thema: { de: `[Thema ${stufe} ${n}]` },
  hash: '0'.repeat(64),
  bytes: 1000,
  lektionen: 2,
  hinweis: false,
  audio: [],
});
const V: Verzeichnis = {
  format: VERZEICHNIS_FORMAT,
  version: 1,
  kurs: 'tr-aus-de',
  kursId: 'tr',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  stand: 1,
  einheiten: [einheit('a1', 1), einheit('a1', 2), einheit('a2', 1), einheit('a2', 2), einheit('a2', 3), einheit('b1', 1)],
};
const ALLE_A1 = ['tr-aus-de.a1.e01.l01', 'tr-aus-de.a1.e01.l02', 'tr-aus-de.a1.e02.l01', 'tr-aus-de.a1.e02.l02'];

function kontext(ui: 'de' | 'ar' = 'de'): StationsKontext {
  const t = ui === 'de' ? de : ar;
  return {
    ui,
    ziffern: 'oestlich',
    kurs: 'tr-aus-de',
    adresse: `/lern-app/${ui}/tr-aus-de`,
    texte: t.lernpfad,
    stufenTexte: t.ansichten.stufen,
    titelSprache: 'de',
    ausgang: 'de',
    offline: new Map(),
    fehlt: new Set(),
    zeigeLektionen: () => undefined,
    gespeichert: async () => undefined,
  };
}

const stufen = (erledigt: string[], offen: Stufe[] = [], ui: 'de' | 'ar' = 'de') =>
  vorrendern(
    <LernpfadStufen
      abschnitte={abschnitte(V, new Set(erledigt), new Map<string, PaketInhalt>())}
      fertig={new Set(erledigt.length ? ['a1'] : [])}
      offen={new Set(offen)}
      onAufklappen={() => undefined}
      k={kontext(ui)}
    />,
  );

describe('Lernpfad: nur die aktuelle Stufe mit Stationen (LernpfadStufen)', () => {
  it('neues Gerät: A1 offen mit zwei Stationen, A2 und B1 zu mit der Zahl ihrer Einheiten', async () => {
    const html = await stufen([]);
    expect(anzahl(html, /lernweg-station/g)).toBe(2);
    expect(anzahl(html, /zeichnen-bei-sicht/g)).toBe(2);
    expect(html).toContain('[Thema a1 1]');
    expect(html).not.toContain('[Thema a2 1]');
    expect(html).toContain('data-stufe-zu="a2"');
    expect(html).toContain('data-stufe-zu="b1"');
    expect(html).not.toContain('data-stufe-zu="a1"');
    expect(html).toContain(`${formatiere(de.lernpfad.einheitenZahl, { anzahl: 3 }, 'de')}</summary>`);
    expect(html).toContain(`${formatiere(de.lernpfad.einheitenZahl, { anzahl: 1 }, 'de')}</summary>`);
    // alle Stufen behalten ihre Überschrift
    for (const s of ['a1', 'a2', 'b1']) expect(html).toContain(`id="stufe-${s}"`);
  });

  it('A1 geschafft: A2 offen (aktuelle Einheit), A1 zu, „Stufe abgeschlossen“ bleibt sichtbar an A1', async () => {
    const html = await stufen(ALLE_A1);
    // A2 hat drei Einheiten; im ersten Takt stehen zwei (die dritte folgt im nächsten)
    expect(anzahl(html, /lernweg-station/g)).toBe(2);
    expect(html).toContain('[Thema a2 1]');
    expect(html).not.toContain('[Thema a1 1]');
    expect(html).toContain('data-stufe-zu="a1"');
    expect(html).toContain(`data-stufe-abgeschlossen="a1"`);
    expect(html).toContain(de.ansichten.stufen.abgeschlossen);
  });

  it('von Hand aufgeklappte Stufe rendert ihre Stationen im <details>', async () => {
    const html = await stufen([], ['b1']);
    expect(anzahl(html, /lernweg-station/g)).toBe(3);
    expect(html).toContain('[Thema b1 1]');
    expect(html).toContain('data-stufe-zu="b1"');
  });

  it('große Stufe: zuerst zwei Stationen, die übrigen folgen je Takt (kein langer Block beim Aufbau)', async () => {
    const gross: Verzeichnis = { ...V, einheiten: [1, 2, 3, 4, 5, 6, 7].map((n) => einheit('a1', n)) };
    const html = await vorrendern(
      <LernpfadStufen
        abschnitte={abschnitte(gross, new Set(), new Map<string, PaketInhalt>())}
        fertig={new Set()}
        offen={new Set()}
        onAufklappen={() => undefined}
        k={kontext()}
      />,
    );
    expect(anzahl(html, /lernweg-station/g)).toBe(2);
    expect(html).toContain('[Thema a1 2]');
    expect(html).not.toContain('[Thema a1 3]');
  });

  it('arabische Oberfläche: Zahl der Einheiten mit arabischer Pluralform und östlichen Ziffern', async () => {
    const html = await stufen([], [], 'ar');
    expect(html).toContain(`${formatiere(ar.lernpfad.einheitenZahl, { anzahl: 3 }, 'ar')}</summary>`);
    expect(formatiere(ar.lernpfad.einheitenZahl, { anzahl: 3 }, 'ar')).toContain('٣');
  });
});
