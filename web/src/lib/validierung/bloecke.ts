import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';
import { istGueltigesZiel, seitenIdAusZiel } from '@/lib/cms/ziele';
import { ORGANISATION_KUERZEL } from '@/lib/rechte/matrix';
import { istLeer, richtextSchema } from './richtext';

/**
 * Bausteine freier Seiten (ADR 0032): ein Zod-Schema für den Editor der Verwaltung und für die Server Action.
 * Jeder Baustein trägt eine kurze `id` (Schlüssel im Editor, Anker der Fehlerliste) und den `typ`.
 * Texte sind mehrsprachig: Deutsch Pflicht, Türkisch/Englisch optional; fehlt eine Übersetzung, zeigt die Website den
 * deutschen Text mit `lang="de"` (ADR 0002). Fehlermeldungen sind Schlüssel unter `verwaltung.seiten.fehler`.
 *
 * Religiöse Inhalte (ADR 0030): Die Bausteine `vers` und `hadith` speichern nur einen Verweis (Sure/Verse bzw.
 * Sammlung/Nummer). Arabischer Text und Übersetzung kommen aus der Datenbank – Übersetzungen nur, wenn sie
 * freigegeben sind. Niemand tippt hier religiöse Texte ein.
 */
export const BLOCK_TYPEN = [
  'text',
  'bild',
  'galerie',
  'aufruf',
  'faq',
  'trenner',
  'spalten',
  'termine',
  'nachrichten',
  'kontakt',
  'download',
  'gebetszeiten',
  'vers',
  'hadith',
] as const;
export type BlockTyp = (typeof BLOCK_TYPEN)[number];

/** Höchstzahl der Bausteine je Seite und der Verse je Vers-Baustein. */
export const BLOECKE_MAX = 60;
export const VERSE_MAX = 10;
export const HADITH_SAMMLUNGEN = ['bukhari'] as const;

const pflicht = (max: number) => z.string('pflicht').trim().min(1, 'pflicht').max(max, 'zuLang');
const uebersetzung = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'zuLang')
    .transform((v) => (v ? v : undefined))
    .optional();

/** Mehrsprachiger Pflichttext: Deutsch Pflicht. */
export const mehr = (max: number) => z.object({ de: pflicht(max), tr: uebersetzung(max), en: uebersetzung(max) });

/** Mehrsprachiger freiwilliger Text: alles leer erlaubt; Übersetzungen nur mit deutscher Fassung. */
export const mehrOptional = (max: number) =>
  z.object({ de: z.string().trim().max(max, 'zuLang').default(''), tr: uebersetzung(max), en: uebersetzung(max) }).superRefine((w, ctx) => {
    if ((w.tr || w.en) && !w.de) ctx.addIssue({ code: 'custom', path: ['de'], message: 'pflicht' });
  });

/** Rich-Text-Dokument (Tiptap-JSON); leere Dokumente gelten als „kein Text“. */
const dokument = richtextSchema.nullable().transform((d) => (d && !istLeer(d) ? d : null));
const dokumentOptional = dokument.optional().transform((d) => d ?? null);

const blockId = z.string().regex(/^[a-z0-9]{6,24}$/, 'ungueltig');
const zielFeld = z.string('zielUngueltig').trim().max(300, 'zielUngueltig').refine(istGueltigesZiel, 'zielUngueltig');
const anzahl = z.number('zahl').int('zahl').min(1, 'zahl').max(12, 'zahl');
const medienId = (meldung: string) => z.uuid(meldung);

export const textBlock = z.object({
  typ: z.literal('text'),
  id: blockId,
  inhalt: z.object({ de: dokument, tr: dokumentOptional, en: dokumentOptional }).superRefine((w, ctx) => {
    if (!w.de) ctx.addIssue({ code: 'custom', path: ['de'], message: 'pflicht' });
  }),
});

export const bildBlock = z.object({
  typ: z.literal('bild'),
  id: blockId,
  mediumId: medienId('bildFehlt'),
  /** Alt-Text Pflicht (K-10): beschreibt, was auf dem Bild zu sehen ist. */
  alt: mehr(300),
  unterschrift: mehrOptional(300),
  breite: z.enum(['text', 'breit'], 'ungueltig').default('text'),
});

export const galerieBild = z.object({ mediumId: medienId('bildFehlt'), alt: mehr(300) });
export const galerieBlock = z.object({
  typ: z.literal('galerie'),
  id: blockId,
  titel: mehrOptional(160),
  bilder: z.array(galerieBild).min(2, 'galerieMin').max(24, 'galerieMax'),
});

export const aufrufBlock = z.object({
  typ: z.literal('aufruf'),
  id: blockId,
  titel: mehr(160),
  text: mehrOptional(600),
  knopf: mehr(60),
  ziel: zielFeld,
});

export const faqEintrag = z.object({ frage: mehr(300), antwort: mehr(3000) });
export const faqBlock = z.object({
  typ: z.literal('faq'),
  id: blockId,
  titel: mehrOptional(160),
  eintraege: z.array(faqEintrag).min(1, 'faqMin').max(40, 'zuViele'),
});

export const trennerBlock = z.object({ typ: z.literal('trenner'), id: blockId });

export const spalte = z.object({ titel: mehrOptional(120), text: mehr(3000) });
export const spaltenBlock = z.object({
  typ: z.literal('spalten'),
  id: blockId,
  titel: mehrOptional(160),
  spalten: z.array(spalte).min(2, 'spaltenAnzahl').max(3, 'spaltenAnzahl'),
});

export const termineBlock = z.object({
  typ: z.literal('termine'),
  id: blockId,
  titel: mehrOptional(160),
  anzahl: anzahl.default(3),
  /** Nur Veranstaltungen dieser Organisation; leer = alle. */
  organisation: z.union([z.literal(''), z.enum(ORGANISATION_KUERZEL)], 'ungueltig').default(''),
});

export const nachrichtenBlock = z.object({
  typ: z.literal('nachrichten'),
  id: blockId,
  titel: mehrOptional(160),
  anzahl: anzahl.default(3),
});

export const kontaktBlock = z.object({ typ: z.literal('kontakt'), id: blockId, titel: mehrOptional(160) });

export const downloadBlock = z.object({
  typ: z.literal('download'),
  id: blockId,
  mediumId: medienId('dateiFehlt'),
  titel: mehr(160),
  beschreibung: mehrOptional(400),
});

export const gebetszeitenBlock = z.object({ typ: z.literal('gebetszeiten'), id: blockId, titel: mehrOptional(160) });

export const versBlock = z
  .object({
    typ: z.literal('vers'),
    id: blockId,
    sure: z.number('zahl').int('zahl').min(1, 'sure').max(114, 'sure'),
    von: z.number('zahl').int('zahl').min(1, 'vers').max(286, 'vers'),
    bis: z.number('zahl').int('zahl').min(1, 'vers').max(286, 'vers'),
    /** Freigegebene Übersetzung der Seitensprache zeigen (falls vorhanden). */
    uebersetzung: z.boolean().default(true),
  })
  .superRefine((b, ctx) => {
    if (b.bis < b.von) ctx.addIssue({ code: 'custom', path: ['bis'], message: 'versBereich' });
    else if (b.bis - b.von + 1 > VERSE_MAX) ctx.addIssue({ code: 'custom', path: ['bis'], message: 'versBereich' });
  });

export const hadithBlock = z.object({
  typ: z.literal('hadith'),
  id: blockId,
  sammlung: z.enum(HADITH_SAMMLUNGEN, 'ungueltig'),
  /** Nummer der Quelle („1“, „402.2“). */
  nummer: z
    .string('pflicht')
    .trim()
    .regex(/^\d{1,5}(\.\d{1,2})?$/, 'hadithNummer'),
});

export const blockSchema = z.discriminatedUnion('typ', [
  textBlock,
  bildBlock,
  galerieBlock,
  aufrufBlock,
  faqBlock,
  trennerBlock,
  spaltenBlock,
  termineBlock,
  nachrichtenBlock,
  kontaktBlock,
  downloadBlock,
  gebetszeitenBlock,
  versBlock,
  hadithBlock,
]);

export const bloeckeSchema = z.array(blockSchema).max(BLOECKE_MAX, 'zuViele');

export type Block = z.output<typeof blockSchema>;
export type BlockVon<T extends BlockTyp> = Extract<Block, { typ: T }>;
export type MehrsprachigText = { de: string; tr?: string; en?: string };

/** Kurze, zufällige Baustein-ID (Kleinbuchstaben und Ziffern). */
export function neueBlockId(): string {
  const zeichen = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const zufall = new Uint8Array(10);
  globalThis.crypto.getRandomValues(zufall);
  return Array.from(zufall, (b) => zeichen[b % zeichen.length]).join('');
}

const leer = (): MehrsprachigText => ({ de: '' });

/** Neuer Baustein mit Startwerten (Editor). Pflichtfelder sind leer und werden beim Speichern geprüft. */
export function neuerBlock(typ: BlockTyp, id = neueBlockId()): Block {
  switch (typ) {
    case 'text':
      return { typ, id, inhalt: { de: null, tr: null, en: null } };
    case 'bild':
      return { typ, id, mediumId: '', alt: leer(), unterschrift: leer(), breite: 'text' };
    case 'galerie':
      return { typ, id, titel: leer(), bilder: [] };
    case 'aufruf':
      return { typ, id, titel: leer(), text: leer(), knopf: leer(), ziel: '/kontakt' };
    case 'faq':
      return { typ, id, titel: leer(), eintraege: [{ frage: leer(), antwort: leer() }] };
    case 'trenner':
      return { typ, id };
    case 'spalten':
      return {
        typ,
        id,
        titel: leer(),
        spalten: [
          { titel: leer(), text: leer() },
          { titel: leer(), text: leer() },
        ],
      };
    case 'termine':
      return { typ, id, titel: leer(), anzahl: 3, organisation: '' };
    case 'nachrichten':
      return { typ, id, titel: leer(), anzahl: 3 };
    case 'kontakt':
      return { typ, id, titel: leer() };
    case 'download':
      return { typ, id, mediumId: '', titel: leer(), beschreibung: leer() };
    case 'gebetszeiten':
      return { typ, id, titel: leer() };
    case 'vers':
      return { typ, id, sure: 1, von: 1, bis: 1, uebersetzung: true };
    case 'hadith':
      return { typ, id, sammlung: 'bukhari', nummer: '' };
  }
}

/** Gespeicherte Bausteine lesen: ungültige (z. B. aus einer älteren Fassung) fallen weg, statt die Seite zu brechen. */
export function gueltigeBloecke(roh: unknown): Block[] {
  if (!Array.isArray(roh)) return [];
  const aus: Block[] = [];
  for (const b of roh.slice(0, BLOECKE_MAX)) {
    const p = blockSchema.safeParse(b);
    if (p.success) aus.push(p.data);
  }
  return aus;
}

/* ---------------------------------------------------------------------------------------------------------------- */
/* Auswertungen                                                                                                        */
/* ---------------------------------------------------------------------------------------------------------------- */

/**
 * Religiöse Verweise einer Seite als sortierte Liste („vers:2:255-257“, „hadith:bukhari:1“). Ändert sich diese Liste,
 * braucht die Seite eine neue religiöse Freigabe (ADR 0030).
 */
export function religioeseVerweise(bloecke: readonly Block[]): string[] {
  const liste: string[] = [];
  for (const b of bloecke) {
    if (b.typ === 'vers') liste.push(`vers:${b.sure}:${b.von}-${b.bis}`);
    if (b.typ === 'hadith') liste.push(`hadith:${b.sammlung}:${b.nummer}`);
  }
  return [...new Set(liste)].sort();
}

export function gleicheVerweise(a: readonly Block[], b: readonly Block[]): boolean {
  return religioeseVerweise(a).join('|') === religioeseVerweise(b).join('|');
}

/** Medien-IDs der Bausteine: Bilder (Bild, Galerie, Bildknoten im Text) und Dateien (Download). */
export function medienIdsAus(bloecke: readonly Block[]): { bilder: string[]; dateien: string[] } {
  const bilder: string[] = [];
  const dateien: string[] = [];
  const besuche = (k: unknown) => {
    if (!k || typeof k !== 'object') return;
    if (Array.isArray(k)) return k.forEach(besuche);
    const knoten = k as JSONContent;
    if (knoten.type === 'image' && typeof knoten.attrs?.mediumId === 'string') bilder.push(knoten.attrs.mediumId);
    besuche(knoten.content);
  };
  for (const b of bloecke) {
    if (b.typ === 'bild' && b.mediumId) bilder.push(b.mediumId);
    if (b.typ === 'galerie') for (const g of b.bilder) if (g.mediumId) bilder.push(g.mediumId);
    if (b.typ === 'download' && b.mediumId) dateien.push(b.mediumId);
    if (b.typ === 'text') [b.inhalt.de, b.inhalt.tr, b.inhalt.en].forEach(besuche);
  }
  return { bilder: [...new Set(bilder)], dateien: [...new Set(dateien)] };
}

/** IDs freier Seiten, auf die Knöpfe zeigen (Prüfung beim Speichern: Ziel existiert). */
export function seitenZieleAus(bloecke: readonly Block[]): string[] {
  const ids = bloecke.flatMap((b) => (b.typ === 'aufruf' ? [seitenIdAusZiel(b.ziel)] : [])).filter((id): id is string => id !== null);
  return [...new Set(ids)];
}

type Zaehler = { gesamt: number; tr: number; en: number };

function zaehleText(w: MehrsprachigText | null | undefined, z: Zaehler) {
  if (!w?.de) return;
  z.gesamt++;
  if (w.tr) z.tr++;
  if (w.en) z.en++;
}

/**
 * Übersetzungsstand je Sprache in Prozent (gerundet): Anteil der deutschen Texte (Titel, Beschreibung und alle
 * Bausteintexte), die eine türkische bzw. englische Fassung haben. Ohne Texte: 100.
 */
export function uebersetzungsstand(
  titel: MehrsprachigText,
  beschreibung: MehrsprachigText | null,
  bloecke: readonly Block[],
): { tr: number; en: number } {
  const z: Zaehler = { gesamt: 0, tr: 0, en: 0 };
  zaehleText(titel, z);
  zaehleText(beschreibung, z);
  for (const b of bloecke) {
    switch (b.typ) {
      case 'text':
        if (b.inhalt.de) {
          z.gesamt++;
          if (b.inhalt.tr) z.tr++;
          if (b.inhalt.en) z.en++;
        }
        break;
      case 'bild':
        zaehleText(b.alt, z);
        zaehleText(b.unterschrift, z);
        break;
      case 'galerie':
        zaehleText(b.titel, z);
        b.bilder.forEach((g) => zaehleText(g.alt, z));
        break;
      case 'aufruf':
        zaehleText(b.titel, z);
        zaehleText(b.text, z);
        zaehleText(b.knopf, z);
        break;
      case 'faq':
        zaehleText(b.titel, z);
        b.eintraege.forEach((e) => {
          zaehleText(e.frage, z);
          zaehleText(e.antwort, z);
        });
        break;
      case 'spalten':
        zaehleText(b.titel, z);
        b.spalten.forEach((s) => {
          zaehleText(s.titel, z);
          zaehleText(s.text, z);
        });
        break;
      case 'download':
        zaehleText(b.titel, z);
        zaehleText(b.beschreibung, z);
        break;
      case 'termine':
      case 'nachrichten':
      case 'kontakt':
      case 'gebetszeiten':
        zaehleText(b.titel, z);
        break;
      default:
        break;
    }
  }
  if (z.gesamt === 0) return { tr: 100, en: 100 };
  return { tr: Math.round((z.tr / z.gesamt) * 100), en: Math.round((z.en / z.gesamt) * 100) };
}

/**
 * Zod-Fehler der Bausteinliste → Feldfehler mit Schlüssel `block:<id>:<pfad>` (z. B. `block:ab12cd34:alt.de`).
 * Der Editor ordnet sie so dem Baustein zu, auch wenn er inzwischen verschoben wurde.
 */
export function blockFehler(roh: unknown, issues: z.ZodError['issues']): Record<string, string> {
  const fehler: Record<string, string> = {};
  const liste = Array.isArray(roh) ? roh : [];
  for (const f of issues) {
    const [index, ...rest] = f.path;
    if (typeof index !== 'number') {
      fehler.bloecke ??= nachricht(f.message);
      continue;
    }
    const id = (liste[index] as { id?: unknown } | undefined)?.id;
    const schluessel = `block:${typeof id === 'string' ? id : index}:${rest.join('.')}`;
    fehler[schluessel] ??= nachricht(f.message);
  }
  return fehler;
}

function nachricht(m: string): string {
  return /^[a-zA-Z]+$/.test(m) && m.length < 30 ? m : 'ungueltig';
}
