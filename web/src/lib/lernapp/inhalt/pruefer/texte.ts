import { SPRACH_STUFEN, type Sprache, zerlegeRichtung } from '../../kurse';
import type { SprachEinheitDatei } from '../schema';
import type { Inhalte } from './dateien';

export type SprachStufe = (typeof SPRACH_STUFEN)[number];

/** Stufen, in denen jede Einheit für Kinder geeignet sein muss (Leitfaden `kinder.kennzeichnung`). */
export const KINDER_STUFEN: readonly SprachStufe[] = ['a1', 'a2', 'b1'];

/** Ein Text einer Sprach- oder Übersetzungsdatei mit allem, was die Prüfer brauchen. */
export type TextEintrag = {
  datei: string;
  /** Schlüssel des Eintrags (bei Übersetzungen `<bezug>@<richtung>`) bzw. Ort (`….thema.de`) */
  ort: string;
  /** Sprache dieses Texts */
  sprache: Sprache;
  text: string;
  /** Zielsprache (Kurs) der Einheit */
  kurs: Sprache;
  stufe: SprachStufe;
  einheit: string;
  art: 'lemma' | 'form' | 'satz' | 'wortbank' | 'option' | 'uebersetzung' | 'alternative' | 'tipp' | 'thema' | 'kann' | 'ziel';
  /** Kennzeichen am Eintrag; `null`: Text ohne eigenes Kennzeichen (Thema, Kann-Beschreibung, Lektionsziel) */
  religionsbezug: boolean | null;
  /** Einheit gilt als kindgeeignet (A1–B1 immer, sonst Angabe der Einheit) */
  kinder: boolean;
};

/** Stufe aus einem Einheitenschlüssel `<kurs>.<stufe>.eNN`. */
export function stufeVon(einheit: string): SprachStufe {
  const s = einheit.split('.')[1] as SprachStufe;
  return (SPRACH_STUFEN as readonly string[]).includes(s) ? s : 'a1';
}

export const istKinderStufe = (stufe: SprachStufe) => KINDER_STUFEN.includes(stufe);

/** Text-Knoten eines Tiptap-Dokuments in Reihenfolge. */
export function tiptapTexte(knoten: unknown): string[] {
  if (!knoten || typeof knoten !== 'object') return [];
  const k = knoten as { text?: unknown; content?: unknown };
  return [...(typeof k.text === 'string' ? [k.text] : []), ...(Array.isArray(k.content) ? k.content.flatMap(tiptapTexte) : [])];
}

const einheitKinder = (d: SprachEinheitDatei) => istKinderStufe(d.stufe) || d.einheit.kinderGeeignet === true;

/** Alle Texte der Sprach- und Übersetzungsdateien. */
export function sammleTexte(inhalte: Inhalte): TextEintrag[] {
  const ergebnis: TextEintrag[] = [];
  const kinderJeEinheit = new Map<string, boolean>();
  const bezug = new Map<string, boolean>();
  for (const { pfad, daten: d } of inhalte.sprache) {
    const kinder = einheitKinder(d);
    kinderJeEinheit.set(d.einheit.schluessel, kinder);
    const basis = { datei: pfad, kurs: d.kurs, stufe: d.stufe, einheit: d.einheit.schluessel, kinder };
    const lern = (ort: string, art: TextEintrag['art'], t: Partial<Record<Sprache, string>> | undefined) => {
      for (const [s, text] of Object.entries(t ?? {}))
        if (text) ergebnis.push({ ...basis, ort: `${ort}.${s}`, sprache: s as Sprache, text, art, religionsbezug: null });
    };
    lern(`${d.einheit.schluessel}.thema`, 'thema', d.einheit.thema);
    (d.einheit.kannBeschreibungen ?? []).forEach((k, i) => lern(`${d.einheit.schluessel}.kann${i + 1}`, 'kann', k));
    for (const l of d.lemmata) {
      bezug.set(l.schluessel, l.religionsbezug ?? false);
      ergebnis.push({
        ...basis,
        ort: l.schluessel,
        sprache: d.kurs,
        text: l.lemma,
        art: 'lemma',
        religionsbezug: l.religionsbezug ?? false,
      });
      for (const f of Object.values(l.formen ?? {}))
        ergebnis.push({ ...basis, ort: l.schluessel, sprache: d.kurs, text: f, art: 'form', religionsbezug: l.religionsbezug ?? false });
    }
    for (const s of d.saetze) {
      bezug.set(s.schluessel, s.religionsbezug ?? false);
      ergebnis.push({ ...basis, ort: s.schluessel, sprache: d.kurs, text: s.text, art: 'satz', religionsbezug: s.religionsbezug ?? false });
    }
    for (const l of d.lektionen) {
      lern(`${l.schluessel}.ziel`, 'ziel', l.ziel);
      for (const a of l.aufgaben) {
        if (a.typ === 'wortbank')
          for (const text of [...(a.alternativen ?? []), ...(a.ablenker ?? [])])
            ergebnis.push({
              ...basis,
              ort: a.schluessel,
              sprache: d.kurs,
              text,
              art: 'wortbank',
              religionsbezug: bezug.get(a.satz) ?? false,
            });
        if (a.typ === 'schrift_tr' || a.typ === 'schrift_latein')
          for (const text of [...(a.vorgabe ? [a.vorgabe] : []), ...a.optionen])
            ergebnis.push({ ...basis, ort: a.schluessel, sprache: d.kurs, text, art: 'option', religionsbezug: false });
        if (a.typ === 'schreiben')
          for (const text of a.pflichtwoerter ?? [])
            ergebnis.push({ ...basis, ort: a.schluessel, sprache: d.kurs, text, art: 'option', religionsbezug: false });
      }
    }
  }
  for (const { pfad, daten: d } of inhalte.uebersetzung) {
    const { ziel, ausgang } = zerlegeRichtung(d.richtung);
    const stufe = stufeVon(d.einheit);
    const kinder = kinderJeEinheit.get(d.einheit) ?? istKinderStufe(stufe);
    const basis = { datei: pfad, kurs: ziel, stufe, einheit: d.einheit, kinder, sprache: ausgang };
    for (const e of d.eintraege) {
      const r = (e.religionsbezug ?? false) || (bezug.get(e.bezug) ?? false);
      const ort = `${e.bezug}@${d.richtung}`;
      ergebnis.push({ ...basis, ort, text: e.text, art: 'uebersetzung', religionsbezug: r });
      for (const text of e.alternativen ?? []) ergebnis.push({ ...basis, ort, text, art: 'alternative', religionsbezug: r });
    }
    for (const t of d.tipps)
      for (const text of [...(t.titel ? [t.titel] : []), ...tiptapTexte(t.inhalt)])
        ergebnis.push({ ...basis, ort: t.schluessel, text, art: 'tipp', religionsbezug: t.religionsbezug ?? false });
  }
  return ergebnis;
}
