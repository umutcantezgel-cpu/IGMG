import type { JSONContent } from '@tiptap/core';
import { describe, expect, it } from 'vitest';
import { ohnePlatzhalter } from '@/lib/inhalt/platzhalter';
import { klartext, ohnePlatzhalterImDokument } from '@/lib/inhalt/tiptap';

/**
 * Rich-Text ohne Platzhalter der Gemeinde (Vorstellung 23.11.2026): In Nachrichten und Veranstaltungen entfallen die Sätze
 * mit „[…]“ wie in `ohnePlatzhalter`, die Auszeichnung des übrigen Textes bleibt. Absätze, Listenpunkte und Überschriften,
 * von denen bzw. unter denen nichts bleibt, entfallen. Nichts wird umgeschrieben.
 */
const text = (t: string, ...marken: string[]): JSONContent => ({
  type: 'text',
  text: t,
  ...(marken.length ? { marks: marken.map((type) => ({ type })) } : {}),
});
const absatz = (...inhalt: (string | JSONContent)[]): JSONContent => ({
  type: 'paragraph',
  content: inhalt.map((k) => (typeof k === 'string' ? text(k) : k)),
});
const titel = (level: number, t: string): JSONContent => ({ type: 'heading', attrs: { level }, content: [text(t)] });
const umbruch: JSONContent = { type: 'hardBreak' };
const doc = (...content: JSONContent[]): JSONContent => ({ type: 'doc', content });

describe('ohnePlatzhalterImDokument', () => {
  it('ohne Platzhalter: dasselbe Dokument, unverändert', () => {
    const d = doc(titel(2, 'Anfahrt'), absatz('Die Moschee liegt in Wetzlar. ', text('Parkplätze', 'bold'), ' gibt es am Haus.'));
    expect(ohnePlatzhalterImDokument(d)).toBe(d);
  });

  it('Beispielmeldung „Eröffnung“: beide Absätze bestehen nur aus Sätzen mit Platzhalter – nichts bleibt', () => {
    const d = doc(
      absatz(
        'Die neue Fatih-Moschee in [Ortsangabe – von der Gemeinde] ist fertiggestellt. Die Eröffnung findet am [Datum – von der Gemeinde] statt.',
      ),
      absatz('[Programm und Einzelheiten zur Eröffnung – von der Gemeinde]'),
    );
    expect(ohnePlatzhalterImDokument(d).content).toEqual([]);
  });

  it('Sätze mit Platzhalter entfallen, der Rest bleibt wörtlich; Absätze ohne Platzhalter bleiben dieselben Knoten', () => {
    const frei = absatz('Alle sind herzlich eingeladen.');
    const d = doc(absatz('Die neue Fatih-Moschee ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]. Wir freuen uns auf Sie.'), frei);
    const ergebnis = ohnePlatzhalterImDokument(d);
    expect(ergebnis.content).toEqual([absatz('Die neue Fatih-Moschee ist fertiggestellt. Wir freuen uns auf Sie.'), frei]);
    expect(ergebnis.content?.[1]).toBe(frei);
  });

  it('Auszeichnung bleibt: Platzhalter in fettem Text, kursives Wort im Satz danach', () => {
    const d = doc(
      absatz('Die Eröffnung ist am ', text('[Datum]', 'bold'), '. Alle sind ', text('herzlich', 'italic'), ' eingeladen. Beginn: [Uhrzeit].'),
    );
    expect(ohnePlatzhalterImDokument(d).content).toEqual([absatz('Alle sind ', text('herzlich', 'italic'), ' eingeladen.')]);
  });

  it('Zeilen mit Umbruch: die Zeile mit Platzhalter entfällt samt ihrem Umbruch', () => {
    expect(ohnePlatzhalterImDokument(doc(absatz('Teravih: [Zeit – von der Gemeinde]', umbruch, 'Iftar gemeinsam in der Moschee'))).content).toEqual([
      absatz('Iftar gemeinsam in der Moschee'),
    ]);
    expect(ohnePlatzhalterImDokument(doc(absatz('Iftar gemeinsam', umbruch, 'Teravih: [Zeit]'))).content).toEqual([absatz('Iftar gemeinsam')]);
    expect(ohnePlatzhalterImDokument(doc(absatz('Iftar gemeinsam', umbruch, 'Teravih: [Zeit]', umbruch, 'Danach Tee'))).content).toEqual([
      absatz('Iftar gemeinsam', umbruch, 'Danach Tee'),
    ]);
  });

  it('Listen und Zitate: leere Punkte entfallen, eine leere Liste entfällt ganz', () => {
    const punkt = (...inhalt: (string | JSONContent)[]): JSONContent => ({ type: 'listItem', content: [absatz(...inhalt)] });
    const liste = (...content: JSONContent[]): JSONContent => ({ type: 'bulletList', content });
    const d = doc(
      liste(punkt('Beginn um 10 Uhr'), punkt('Redner: [Name – Imam]'), punkt('Essen für alle. Ort: [Raum].')),
      liste(punkt('[Programm – von der Gemeinde]')),
      { type: 'blockquote', content: [absatz('[Zitat – von der Gemeinde]')] },
    );
    expect(ohnePlatzhalterImDokument(d).content).toEqual([liste(punkt('Beginn um 10 Uhr'), punkt('Essen für alle.'))]);
  });

  it('Überschrift ohne Inhalt entfällt – auch die übergeordnete, wenn ihr ganzer Abschnitt entfällt; andere bleiben', () => {
    const d = doc(
      titel(2, 'Programm'),
      titel(3, 'Vormittag'),
      absatz('[Programm am Vormittag – von der Gemeinde]'),
      titel(3, 'Nachmittag'),
      absatz('Beginn: [Uhrzeit].'),
      titel(2, 'Anfahrt'),
      titel(3, 'Mit dem Bus'),
      absatz('Haltestelle: [Name der Haltestelle].'),
      titel(3, 'Mit dem Auto'),
      absatz('Parkplätze gibt es am Haus.'),
      titel(2, 'Kontakt'),
    );
    expect(ohnePlatzhalterImDokument(d).content).toEqual([
      titel(2, 'Anfahrt'),
      titel(3, 'Mit dem Auto'),
      absatz('Parkplätze gibt es am Haus.'),
      titel(2, 'Kontakt'),
    ]);
  });

  it('Überschrift mit Platzhalter entfällt, der Absatz darunter bleibt', () => {
    expect(ohnePlatzhalterImDokument(doc(titel(2, 'Eröffnung am [Datum]'), absatz('Alle sind eingeladen.'))).content).toEqual([
      absatz('Alle sind eingeladen.'),
    ]);
  });

  it('ein Absatz aus einem Textknoten ergibt genau den Text von `ohnePlatzhalter` (de, tr, en; Abkürzungen, Wiederholungen)', () => {
    const texte = [
      'Bitte rufen Sie z. B. unter [Telefonnummer] an. Danke.',
      'Am 3. Oktober spricht [Name – Imam]. Beginn ist um 19 Uhr.',
      'Wir bitten um Geduld. Hinweis: [Text. Mit Punkt.] und mehr dazu. Das hier bleibt.',
      'Yeni Fatih Camii tamamlandı. Açılış: [Tarih – cemaatten].',
      'The mosque is complete. Opening: [date – from the community]. Welcome!',
      '  Kommt alle. Kommt alle. Eröffnung am [Datum]. Kommt alle. Redner: [Name]. Kommt alle.  ',
      'Danke. Danke [Name]. Danke. [Ort] Danke. Danke.',
      '[Datum]. Erster Satz. [Ort] zweiter Satz. Dritter Satz! Vierter Satz mit [Name]? Fünfter Satz …',
    ];
    for (const t of texte) {
      const ergebnis = ohnePlatzhalterImDokument(doc(absatz(t)));
      expect(klartext(ergebnis), t).toBe(ohnePlatzhalter(t));
    }
  });

  it('über mehrere Textknoten verteilt bleibt derselbe Text wie im Ganzen', () => {
    const t = 'Kommt alle. Eröffnung am [Datum – von der Gemeinde]. Kommt alle. Redner ist [Name – Imam] aus Wetzlar. Danke fürs Lesen.';
    for (const schnitt of [3, 12, 24, 27, 40, 52, 60, 75, 99]) {
      const d = doc(absatz(text(t.slice(0, schnitt), 'bold'), t.slice(schnitt, schnitt + 9), text(t.slice(schnitt + 9), 'italic')));
      expect(klartext(ohnePlatzhalterImDokument(d)), String(schnitt)).toBe(ohnePlatzhalter(t));
    }
  });
});
