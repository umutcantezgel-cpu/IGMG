import { describe, expect, it } from 'vitest';
import type { FreigabeBaustein, Pruefung } from '@/lib/lernapp/freigabe';
import { IslamEinheitDateiSchema } from '@/lib/lernapp/inhalt/schema';
import { WISSENS_QUELLEN } from '@/lib/lernapp/inhalt/wissen-quellen';
import { quellenzeile, type QuellenBeleg } from '@/lib/lernapp/paket/quellenzeile';
import { PaketSchema } from '@/lib/lernapp/paket/typen';
import { baueWissensEinheit, type WissensAussageRoh, type WissensEinheitEingabe, wissensAufgabe } from '@/lib/lernapp/paket/wissen';
import { ARABISCH } from '@/lib/lernapp/waechter/kern.mjs';
import { inhaltsdateien } from '../../../scripts/lernapp/inhaltsdateien';

/**
 * Vertragsprobe Wissenskurs (Gegenprüfung N3): alle echten Inhaltsdateien `inhalte/lernapp/islam/**` in genau der Abbildung,
 * die `server/queries/lernapp/wissen.ts` aus der Datenbank liest – und die der Wissens-Import (`wissen-import.ts`) schreibt:
 *
 * - Lektion: `titel` (Spalte `ziel.de`), `kinderGeeignet`, Reihenfolge wie in der Datei.
 * - Aussage: `text`, `strittig`; Quellenzeile aus den Belegen (`kapitel` → `stelle.kitab`, `band`, `seite`; Werk, Autor und
 *   Ausgabe kommen dann aus `lernapp_quelle` – hier stehen Registerkürzel und die Ausgabe des Belegs dafür).
 * - Quizfrage: `typ`, `daten` = die Quizfrage der Datei ohne `schluessel`, `typ`, `aussage`, `quelle`, `lizenz`; die Aussage
 *   per Schlüssel aus derselben Einheit.
 *
 * Mit simulierten zwei Freigaben je Baustein (zwei Personen, aktueller Hash, Belege bestätigt) muss jede Lektion ins Paket
 * kommen, jede Quizfrage spielbar sein und bei `zuordnen`/`reihenfolge` die inhaltliche Frage ankommen; keine arabische
 * Schrift im Paket. Liest nur, schreibt nichts (KI-Regel 2).
 */

const HASH = 'a'.repeat(64);
const AM = new Date('2026-10-26T10:00:00Z');

/** Baustein mit zwei Freigaben zweier Personen zum aktuellen Hash (Belege am Original bestätigt). */
function zweiFreigaben(art: 'lektion' | 'aussage' | 'aufgabe', belege: number = 0): FreigabeBaustein {
  const b = {
    inhaltHash: HASH,
    verfasser: ['ki:vertragsprobe'],
    belege: Array.from({ length: belege }, (_, i) => ({ id: `beleg-${i}`, inhaltHash: HASH })),
    belegPflicht: art === 'aussage',
    art,
  };
  const ok = (person: string): Pruefung => ({
    pruefendeId: person,
    pruefendeRollen: ['religioese_pruefung'],
    art: 'religioes',
    urteil: 'ok',
    inhaltHash: HASH,
    belegeGeprueft: b.belege.map((x) => ({ belegId: x.id, inhaltHash: x.inhaltHash })),
    am: AM,
  });
  return { status: 'automatisch_geprueft', baustein: b, pruefungen: [ok('pruefung-1'), ok('pruefung-2')] };
}

const dateien = inhaltsdateien(undefined, ['islam']).map((q) => ({
  pfad: q.pfad,
  d: IslamEinheitDateiSchema.parse(JSON.parse(q.text)),
}));

/**
 * Inhaltsdatei → Eingabe des Paketbaus, wie sie aus der Datenbank käme. `register`: Werk und Verfasser aus dem Quellenregister
 * (`wissen-quellen.ts`, wie `lernapp_quelle` nach dem Wissens-Import), sonst das Registerkürzel ohne Verfasser.
 */
function eingabe(d: (typeof dateien)[number]['d'], register = false): WissensEinheitEingabe {
  const aussagen = new Map<string, WissensAussageRoh>();
  for (const l of d.lektionen)
    for (const a of l.aussagen) {
      const belege: QuellenBeleg[] = a.belege.map((b) => ({
        werk: register ? WISSENS_QUELLEN[b.werk].werk : b.werk,
        autor: register ? WISSENS_QUELLEN[b.werk].autor : null,
        ausgabe: b.ausgabe,
        stelle: {
          kitab: b.kapitel,
          ...(b.band ? { band: String(b.band) } : {}),
          ...(b.seite ? { seite: String(b.seite) } : {}),
        },
      }));
      aussagen.set(a.schluessel, {
        schluessel: a.schluessel,
        text: a.text,
        quelle: quellenzeile(belege),
        strittig: a.strittig,
        freigabe: zweiFreigaben('aussage', a.belege.length),
      });
    }
  return {
    einheit: {
      schluessel: d.einheit.schluessel,
      stufe: d.stufe,
      reihenfolge: d.einheit.reihenfolge,
      thema: d.einheit.thema,
      symbol: d.einheit.symbol ?? null,
      status: 'automatisch_geprueft',
    },
    lektionen: d.lektionen.map((l) => ({
      schluessel: l.schluessel,
      art: 'lektion',
      titel: l.titel,
      kinderGeeignet: l.kinderGeeignet,
      freigabe: zweiFreigaben('lektion'),
      aussagen: l.aussagen.map((a) => aussagen.get(a.schluessel)!),
      aufgaben: l.aufgaben.map((a) => {
        const { schluessel, typ, aussage, quelle: _q, lizenz: _l, ...daten } = a;
        return { schluessel, typ, daten, aussage: aussagen.get(aussage) ?? null, freigabe: zweiFreigaben('aufgabe') };
      }),
    })),
  };
}

describe('Vertragsprobe: alle echten Inhaltsdateien des Wissenskurses durch den Paketbau', () => {
  const lektionen = dateien.flatMap((x) => x.d.lektionen);
  const quizfragen = lektionen.flatMap((l) => l.aufgaben.map((a) => ({ a, l })));

  it('Bestand: 26 Dateien, 146 Lektionen, 1.041 Quizfragen (273 mit inhaltlicher Frage)', () => {
    expect(dateien).toHaveLength(26);
    expect(lektionen).toHaveLength(146);
    expect(quizfragen).toHaveLength(1041);
    expect(quizfragen.filter(({ a }) => a.typ === 'zuordnen' || a.typ === 'reihenfolge')).toHaveLength(273);
  });

  it('jede Quizfrage wird zur spielbaren Aufgabe; zuordnen/reihenfolge tragen ihre Frage (anweisung → frage)', () => {
    const fehlt: string[] = [];
    const ohneFrage: string[] = [];
    for (const { a } of quizfragen) {
      const { schluessel, typ, aussage: _a, quelle: _q, lizenz: _l, ...daten } = a;
      const aufgabe = wissensAufgabe({ schluessel, typ, daten }, '[Quellenzeile]');
      if (!aufgabe) fehlt.push(schluessel);
      else if ((a.typ === 'zuordnen' || a.typ === 'reihenfolge') && (!('frage' in aufgabe) || aufgabe.frage !== a.anweisung))
        ohneFrage.push(schluessel);
    }
    expect(fehlt).toEqual([]);
    expect(ohneFrage).toEqual([]);
  });

  it('mit zwei Freigaben je Baustein: alle 146 Lektionen im Paket, gültig nach PaketSchema, ohne arabische Schrift', () => {
    let imPaket = 0;
    const ohnePaket: string[] = [];
    for (const { pfad, d } of dateien) {
      const r = baueWissensEinheit(eingabe(d));
      if (!r) {
        ohnePaket.push(pfad);
        continue;
      }
      imPaket += r.paket.lektionen.length;
      expect(
        r.paket.lektionen.map((l) => l.schluessel),
        pfad,
      ).toEqual(d.lektionen.map((l) => l.schluessel));
      expect(PaketSchema.safeParse(JSON.parse(r.json)).success, pfad).toBe(true);
      expect(ARABISCH.test(r.json), pfad).toBe(false);
      // jede Aussage mit Quellenzeile im Prüfvermerk; die Fragen von zuordnen/reihenfolge stehen im Paket
      for (const l of d.lektionen) {
        expect(
          r.paket.wissen?.[l.schluessel]?.aussagen.map((a) => a.schluessel),
          l.schluessel,
        ).toEqual(l.aussagen.map((a) => a.schluessel));
        for (const q of l.aufgaben)
          if (q.typ === 'zuordnen' || q.typ === 'reihenfolge') expect(r.json, q.schluessel).toContain(JSON.stringify(q.anweisung));
      }
    }
    expect(ohnePaket).toEqual([]);
    expect(imPaket).toBe(146);
  });

  it('mit Werk und Verfasser aus dem Quellenregister (wie nach dem Import): alle 146 Lektionen, Quellenzeile ≤ 1.200 Zeichen', () => {
    let imPaket = 0;
    let laengste = 0;
    for (const { pfad, d } of dateien) {
      const e = eingabe(d, true);
      for (const l of e.lektionen) for (const a of l.aussagen) laengste = Math.max(laengste, a.quelle.length);
      const r = baueWissensEinheit(e);
      expect(r, pfad).not.toBeNull();
      imPaket += r!.paket.lektionen.length;
      expect(ARABISCH.test(r!.json), pfad).toBe(false);
    }
    expect(imPaket).toBe(146);
    expect(laengste).toBeLessThanOrEqual(1200);
  });

  it('eine fehlende Freigabe (eine Aussage ohne Quizfrage mit nur einer Prüfung) nimmt genau ihre Lektion heraus', () => {
    const { d } = dateien[0]!;
    const e = eingabe(d);
    const [erste, ...rest] = e.lektionen;
    const aussage = erste!.aussagen.at(-1)!;
    const eine = { ...aussage.freigabe, pruefungen: aussage.freigabe.pruefungen.slice(0, 1) };
    const r = baueWissensEinheit({
      ...e,
      lektionen: [{ ...erste!, aussagen: [...erste!.aussagen.slice(0, -1), { ...aussage, freigabe: eine }] }, ...rest],
    });
    expect(r?.paket.lektionen.map((l) => l.schluessel) ?? []).toEqual(rest.map((l) => l.schluessel));
  });
});
