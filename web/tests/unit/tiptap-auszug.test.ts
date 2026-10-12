import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { auszugImRumpf } from '@/lib/inhalt/tiptap';

/**
 * H-C02: Der Kurztext erscheint auf der Nachrichtendetailseite nur einmal. Ein erster Absatz, der wörtlich dem Untertitel
 * entspricht, wird aus dem Rumpf genommen, sobald weitere Knoten folgen; ist er der einzige Knoten, entfällt dafür der
 * Untertitel. Vergleich mit zusammengezogenem Leerraum, ohne Abschneiden von Präfixen.
 */
const KURZTEXT = 'Ab dem 1. November gelten neue Gebetszeiten. Bitte beachten Sie die aktualisierten Zeiten.';
const absatz = (text: string): JSONContent => ({ type: 'paragraph', content: [{ type: 'text', text }] });

describe('auszugImRumpf', () => {
  it('gleicher Absatz als einziger Knoten: Untertitel entfällt, der Rumpf zeigt den Absatz', () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [absatz('Ab dem 1. November gelten neue Gebetszeiten.\n  Bitte beachten  Sie die aktualisierten Zeiten.')],
    };
    const ergebnis = auszugImRumpf(doc, KURZTEXT);
    expect(ergebnis.untertitel).toBe(false);
    expect(ergebnis.doc).toEqual(doc);
    expect(ergebnis.doc.content).toHaveLength(1);
  });

  it('gleicher Absatz mit Folgetext: Untertitel bleibt, der Rumpf beginnt mit dem zweiten Knoten', () => {
    const folge = absatz('Ab Montag gilt die neue Reihenfolge im Gebetsraum.');
    const doc: JSONContent = { type: 'doc', content: [absatz(KURZTEXT), folge] };
    const ergebnis = auszugImRumpf(doc, KURZTEXT);
    expect(ergebnis.untertitel).toBe(true);
    expect(ergebnis.doc.content).toEqual([folge]);
  });

  it('verschiedener Text: alles bleibt unverändert', () => {
    const doc: JSONContent = { type: 'doc', content: [absatz('Ein ganz anderer erster Absatz.'), absatz('Weiter im Text.')] };
    const ergebnis = auszugImRumpf(doc, KURZTEXT);
    expect(ergebnis.untertitel).toBe(true);
    expect(ergebnis.doc).toEqual(doc);
  });
});
