import type { JSONContent } from '@tiptap/core';
import { hatPlatzhalter, ohnePlatzhalter } from './platzhalter';

/** Einfaches Tiptap-Dokument aus Absätzen (Seeds, Import). ADR 0006. */
export function dokumentAusAbsaetzen(absaetze: readonly string[]): JSONContent {
  return {
    type: 'doc',
    content: absaetze.filter((a) => a.trim()).map((a) => ({ type: 'paragraph', content: [{ type: 'text', text: a }] })),
  };
}

/** Klartext eines Tiptap-Dokuments (Volltextsuche, Lesezeit, Vorschau). */
export function klartext(doc: JSONContent | null | undefined): string {
  if (!doc) return '';
  const teile: string[] = [];
  const lauf = (k: JSONContent) => {
    if (k.type === 'text' && k.text) teile.push(k.text);
    k.content?.forEach(lauf);
    if (k.type === 'paragraph' || k.type === 'heading' || k.type === 'listItem') teile.push('\n');
  };
  lauf(doc);
  return teile
    .join('')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

/** Vergleichsform eines Textes: Leerraum zusammengezogen, Ränder entfernt. */
function norm(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Auszug und Rumpf (H-C02, Nachrichtendetail): Beginnt der Rich-Text mit einem einzelnen Absatz, dessen Wortlaut dem
 * Kurztext entspricht, steht der Satz doppelt da. Dann gilt: Folgen weitere Knoten, rendert der Rumpf sie ohne den
 * Absatz (der Untertitel bleibt im Kopf); ist der Absatz der einzige Knoten, entfällt der Untertitel und der Rumpf zeigt
 * den Absatz. Sind beide verschieden, bleibt alles unverändert. Kein Abschneiden von Präfixen.
 */
export function auszugImRumpf(doc: JSONContent, kurztext: string): { untertitel: boolean; doc: JSONContent } {
  const erster = doc.content?.[0];
  const absatz = erster?.type === 'paragraph' ? norm(klartext(erster)) : '';
  if (absatz === '' || absatz !== norm(kurztext)) return { untertitel: true, doc };
  if ((doc.content?.length ?? 0) <= 1) return { untertitel: false, doc };
  return { untertitel: true, doc: { ...doc, content: doc.content?.slice(1) } };
}

/** Lesezeit in Minuten (200 Wörter je Minute, mindestens 1). */
export function lesezeit(text: string): number {
  const woerter = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}

/** Zeichen, das im Fließtext eines Blocks für einen Inline-Knoten ohne Text steht (kein Buchstabe, kein Leerraum). */
const OBJEKT = '￼';
const PLATZHALTER_ALLE = /\[[^\]]*\]/g;

/**
 * Bereiche [von, bis) eines Textes, die `ohnePlatzhalter` stehen lässt – in der Reihenfolge des Textes, je Bereich samt
 * nachfolgendem Leerraum. Zwischen zwei Platzhaltern bleiben genau die ganzen Sätze, die keinen der beiden berühren:
 * Der Abschnitt wird dazu mit Marken an den Stellen seiner Nachbarn geprüft.
 */
function bleibendeBereiche(text: string): [number, number][] {
  const bereiche: [number, number][] = [];
  const abschnitt = (von: number, bis: number, davor: boolean, danach: boolean) => {
    const teil = text.slice(von, bis);
    const bleibt = ohnePlatzhalter(`${davor ? '[]' : ''}${teil}${danach ? '[]' : ''}`);
    if (!bleibt) return;
    // Anfang der ganzen Sätze: nach einem Platzhalter hinter dem Rest des entfallenden Satzes, sonst am Textanfang
    const rest = davor && danach ? ohnePlatzhalter(`[]${teil}`) : bleibt;
    const ab = davor ? teil.trimEnd().length - rest.length : teil.length - teil.trimStart().length;
    let ende = ab + bleibt.length;
    while (ende < teil.length && /\s/.test(teil[ende])) ende++;
    bereiche.push([von + ab, von + ende]);
  };
  let start = 0;
  let davor = false;
  for (const m of text.matchAll(PLATZHALTER_ALLE)) {
    abschnitt(start, m.index, davor, true);
    start = m.index + m[0].length;
    davor = true;
  }
  abschnitt(start, text.length, davor, false);
  // Wie `ohnePlatzhalter`: Leerraum am Anfang und am Ende des Ganzen entfällt
  const erster = bereiche[0];
  const letzter = bereiche.at(-1);
  if (erster) while (erster[0] < erster[1] && /\s/.test(text[erster[0]])) erster[0]++;
  if (letzter) while (letzter[1] > letzter[0] && /\s/.test(text[letzter[1] - 1])) letzter[1]--;
  return bereiche.filter(([von, bis]) => bis > von);
}

/** Inline-Inhalt eines Absatzes oder einer Überschrift ohne die Sätze mit Platzhalter; Marken (fett, Link) bleiben. */
function inlineOhnePlatzhalter(inhalt: JSONContent[]): JSONContent[] {
  const laenge = (k: JSONContent) => (k.type === 'text' ? (k.text ?? '').length : 1);
  const flach = inhalt.map((k) => (k.type === 'text' ? (k.text ?? '') : k.type === 'hardBreak' ? '\n' : OBJEKT)).join('');
  const bereiche = bleibendeBereiche(flach);
  const neu: JSONContent[] = [];
  let ort = 0;
  for (const k of inhalt) {
    const von = ort;
    const bis = (ort += laenge(k));
    if (k.type !== 'text') {
      if (bereiche.some(([a, b]) => von >= a && bis <= b)) neu.push(k);
      continue;
    }
    const text = bereiche.map(([a, b]) => (k.text ?? '').slice(Math.max(a, von) - von, Math.max(Math.min(b, bis) - von, 0))).join('');
    if (text) neu.push({ ...k, text });
  }
  return neu;
}

/** Knoten ohne Platzhalter-Sätze; `null`, wenn nichts von ihm bleibt. Knoten ohne Platzhalter kommen unverändert zurück. */
function knotenOhnePlatzhalter(k: JSONContent): JSONContent | null {
  if (!k.content?.length || !hatPlatzhalter(klartext(k))) return k;
  if (k.content.some((kind) => kind.type === 'text' || kind.type === 'hardBreak')) {
    const inhalt = inlineOhnePlatzhalter(k.content);
    return inhalt.length ? { ...k, content: inhalt } : null;
  }
  const inhalt = k.content.map(knotenOhnePlatzhalter).filter((kind) => kind !== null);
  return inhalt.length ? { ...k, content: inhalt } : null;
}

/**
 * Rich-Text für die öffentliche Seite (`src/lib/inhalt/platzhalter.ts`): In jedem Absatz entfallen die Sätze mit einem
 * Platzhalter „[…]“, der Rest bleibt wörtlich und behält seine Auszeichnung. Ein Absatz, Listenpunkt oder Zitat, von dem
 * nichts bleibt, entfällt; ebenso eine Überschrift, unter der dadurch nichts mehr steht. Ein Dokument ohne Platzhalter
 * kommt unverändert zurück. Nur dort anwenden, wo eckige Klammern Platzhalter sind (nicht für Übersetzungen).
 */
export function ohnePlatzhalterImDokument(doc: JSONContent): JSONContent {
  if (!doc.content || !hatPlatzhalter(klartext(doc))) return doc;
  const knoten: { alt: JSONContent; neu: JSONContent | null }[] = doc.content.map((k) => ({ alt: k, neu: knotenOhnePlatzhalter(k) }));
  const stufe = (k: JSONContent) => (k.type === 'heading' ? ((k.attrs?.level as number | undefined) ?? 2) : null);
  // Überschriften von hinten (Unterabschnitte zuerst): Ist alles bis zur nächsten Überschrift derselben oder einer
  // höheren Ebene entfallen, entfällt auch die Überschrift
  for (let i = knoten.length - 1; i >= 0; i--) {
    const eigene = stufe(knoten[i].alt);
    if (eigene === null || !knoten[i].neu) continue;
    let bis = i + 1;
    while (bis < knoten.length && (stufe(knoten[bis].alt) ?? Infinity) > eigene) bis++;
    if (bis > i + 1 && knoten.slice(i + 1, bis).every((k) => !k.neu)) knoten[i].neu = null;
  }
  return { ...doc, content: knoten.flatMap((k) => (k.neu ? [k.neu] : [])) };
}
