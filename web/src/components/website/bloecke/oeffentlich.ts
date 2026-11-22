import { waehle, type Sprache } from '@/lib/i18n/inhalt';
import { hatPlatzhalter, ohnePlatzhalter } from '@/lib/inhalt/platzhalter';
import type { Block, BlockVon, MehrsprachigText } from '@/lib/validierung/bloecke';
import type { RichtextDokument } from '@/lib/validierung/richtext';

/**
 * Bausteine einer freien Seite für die öffentliche Ausgabe (`src/lib/inhalt/platzhalter.ts`): Platzhalter der Gemeinde
 * „[…]“ erscheinen nicht. In jedem Text entfallen die Sätze mit Platzhalter; ein Feld, von dem nichts bleibt, entfällt,
 * und ein Baustein ohne Inhalt entfällt ganz (Text ohne Absätze, Fragen ohne Antwort, Spalten ohne Text, Aufruf ohne
 * Titel). Trennlinien bleiben nur zwischen zwei Bausteinen. Nichts wird ersetzt oder erfunden.
 * Die Verwaltung (Vorschau, Fassungen, Freigabe) zeigt die Bausteine unverändert – dort sollen Platzhalter auffallen.
 * Reine Funktionen ohne React und ohne Datenbank (`tests/unit/bloecke-oeffentlich.test.ts`).
 */

/**
 * Mehrsprachiges Feld so, dass die Seitensprache den Text ohne Sätze mit Platzhalter ergibt. Gewählt wird wie bei der
 * Ausgabe (Seitensprache, sonst Deutsch); bleibt nichts, ist das Feld leer – ohne Rückfall auf eine andere Fassung.
 */
export function feldOhnePlatzhalter(feld: MehrsprachigText, sprache: Sprache): MehrsprachigText {
  const w = waehle(feld, sprache);
  if (!hatPlatzhalter(w.text)) return feld;
  const text = ohnePlatzhalter(w.text);
  if (!text) return { de: '' };
  return w.rueckfall || sprache === 'de' ? { ...feld, de: text } : { ...feld, [sprache]: text };
}

type Knoten = RichtextDokument['content'][number];
type Inline = NonNullable<Extract<Knoten, { type: 'paragraph' }>['content']>;

/**
 * Inhalt eines Absatzes ohne Platzhalter: `null`, wenn dadurch kein Text bleibt; ohne Platzhalter unverändert. Gearbeitet
 * wird je Zeile (Umbruch trennt): Besteht die Zeile aus einem Textstück, entfallen darin die Sätze mit Platzhalter; ist sie
 * aus mehreren Stücken gesetzt (fett, Link …), entfällt die ganze Zeile – ein Satz kann über Stücke laufen, und halbe
 * Sätze sollen nicht stehen bleiben.
 */
function inlineOhnePlatzhalter(inhalt: Inline | undefined): Inline | undefined | null {
  const lesbar = (teile: Inline) => teile.map((i) => (i.type === 'text' ? i.text : '\n')).join('');
  if (!inhalt || !hatPlatzhalter(lesbar(inhalt))) return inhalt;
  const zeilen: Inline[] = [[]];
  for (const i of inhalt) {
    if (i.type === 'hardBreak') zeilen.push([]);
    else zeilen[zeilen.length - 1].push(i);
  }
  const aus: Inline = [];
  for (const zeile of zeilen) {
    let rest: Inline = zeile;
    if (hatPlatzhalter(lesbar(zeile))) {
      const [einziges] = zeile;
      const text = zeile.length === 1 && einziges.type === 'text' ? ohnePlatzhalter(einziges.text) : '';
      rest = text && einziges.type === 'text' ? [{ ...einziges, text }] : [];
    }
    if (rest.length === 0) continue;
    if (aus.length) aus.push({ type: 'hardBreak' });
    aus.push(...rest);
  }
  return lesbar(aus).trim() ? aus : null;
}

function knotenOhnePlatzhalter(k: Knoten): Knoten | null {
  switch (k.type) {
    case 'paragraph':
    case 'heading': {
      const inhalt = inlineOhnePlatzhalter(k.content);
      if (inhalt === null) return null;
      return inhalt === k.content ? k : { ...k, content: inhalt };
    }
    case 'bulletList':
    case 'orderedList': {
      const punkte = k.content
        .map((p) => ({ ...p, content: p.content.map(knotenOhnePlatzhalter).filter((b): b is Knoten => b !== null) }))
        .filter((p) => p.content.length > 0);
      return punkte.length ? { ...k, content: punkte } : null;
    }
    case 'blockquote': {
      const inhalt = k.content.map(knotenOhnePlatzhalter).filter((b): b is Knoten => b !== null);
      return inhalt.length ? { ...k, content: inhalt } : null;
    }
    case 'image':
      return k;
  }
}

/** Hat der Knoten sichtbaren Inhalt (Text oder Bild)? */
function hatInhalt(k: Knoten): boolean {
  switch (k.type) {
    case 'paragraph':
    case 'heading':
      return (k.content ?? []).some((i) => i.type === 'text' && i.text.trim() !== '');
    case 'bulletList':
    case 'orderedList':
      return k.content.some((p) => p.content.some(hatInhalt));
    case 'blockquote':
      return k.content.some(hatInhalt);
    case 'image':
      return true;
  }
}

/** Rich-Text ohne Absätze, Überschriften und Listenpunkte, von denen ohne Platzhalter nichts bleibt; `null`, wenn leer. */
export function dokumentOhnePlatzhalter(doc: RichtextDokument): RichtextDokument | null {
  const inhalt = doc.content.map(knotenOhnePlatzhalter).filter((k): k is Knoten => k !== null);
  return inhalt.some(hatInhalt) ? { ...doc, content: inhalt } : null;
}

type FaqEintrag = BlockVon<'faq'>['eintraege'][number];

/**
 * Fragen und Antworten für die öffentliche Seite: Sätze mit Platzhalter entfallen; Einträge, denen dadurch die Frage
 * oder die Antwort fehlt, entfallen ganz. Auch für Seiten, die `FaqAnsicht` mit eigenen Einträgen nutzen.
 */
export function faqOhnePlatzhalter(eintraege: readonly FaqEintrag[], sprache: Sprache): FaqEintrag[] {
  const leer = (feld: MehrsprachigText) => waehle(feld, sprache).text.trim() === '';
  return eintraege
    .map((e) => ({ ...e, frage: feldOhnePlatzhalter(e.frage, sprache), antwort: feldOhnePlatzhalter(e.antwort, sprache) }))
    .filter((e) => !leer(e.frage) && !leer(e.antwort));
}

/** Ein Baustein für die öffentliche Seite; `null`, wenn ohne Platzhalter nichts Zeigbares bleibt. */
function bausteinOhnePlatzhalter(b: Block, sprache: Sprache): Block | null {
  const f = (feld: MehrsprachigText) => feldOhnePlatzhalter(feld, sprache);
  const leer = (feld: MehrsprachigText) => waehle(feld, sprache).text.trim() === '';
  switch (b.typ) {
    case 'text': {
      const eigen = sprache === 'de' ? null : b.inhalt[sprache];
      const doc = eigen ?? b.inhalt.de;
      const sauber = doc ? dokumentOhnePlatzhalter(doc) : null;
      if (!sauber) return null;
      return eigen ? { ...b, inhalt: { ...b.inhalt, [sprache]: sauber } } : { ...b, inhalt: { ...b.inhalt, de: sauber } };
    }
    case 'bild':
      return { ...b, alt: f(b.alt), unterschrift: f(b.unterschrift) };
    case 'galerie':
      return { ...b, titel: f(b.titel), bilder: b.bilder.map((g) => ({ ...g, alt: f(g.alt) })) };
    case 'aufruf': {
      const titel = f(b.titel);
      return leer(titel) ? null : { ...b, titel, text: f(b.text), knopf: f(b.knopf) };
    }
    case 'faq': {
      const eintraege = faqOhnePlatzhalter(b.eintraege, sprache);
      return eintraege.length ? { ...b, titel: f(b.titel), eintraege } : null;
    }
    case 'spalten': {
      const spalten = b.spalten.map((s) => ({ titel: f(s.titel), text: f(s.text) })).filter((s) => !leer(s.text));
      return spalten.length ? { ...b, titel: f(b.titel), spalten } : null;
    }
    case 'download': {
      const titel = f(b.titel);
      return leer(titel) ? null : { ...b, titel, beschreibung: f(b.beschreibung) };
    }
    case 'termine':
    case 'nachrichten':
    case 'kontakt':
    case 'gebetszeiten':
      return { ...b, titel: f(b.titel) };
    case 'trenner':
    case 'vers':
    case 'hadith':
      return b;
  }
}

/**
 * Die Bausteine der öffentlichen Seite in der Seitensprache: ohne Platzhalter, ohne leer gewordene Bausteine und ohne
 * Trennlinien am Anfang, am Ende oder direkt hintereinander.
 */
export function oeffentlicheBloecke(bloecke: readonly Block[], sprache: Sprache): Block[] {
  const aus: Block[] = [];
  for (const b of bloecke) {
    const sauber = bausteinOhnePlatzhalter(b, sprache);
    if (!sauber) continue;
    if (sauber.typ === 'trenner' && (aus.length === 0 || aus[aus.length - 1].typ === 'trenner')) continue;
    aus.push(sauber);
  }
  while (aus.length && aus[aus.length - 1].typ === 'trenner') aus.pop();
  return aus;
}
