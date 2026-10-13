import { describe, expect, it } from 'vitest';
import {
  BLOCK_TYPEN,
  blockFehler,
  blockSchema,
  bloeckeSchema,
  gleicheVerweise,
  gueltigeBloecke,
  medienIdsAus,
  neuerBlock,
  religioeseVerweise,
  uebersetzungsstand,
  type Block,
} from '@/lib/validierung/bloecke';

/**
 * Bausteine freier Seiten (ADR 0032): ein Zod-Schema für Editor und Server. Geprüft werden gültige und ungültige
 * Bausteine je Art, die Fehlerschlüssel mit Baustein-ID, religiöse Verweise (ADR 0030) und der Übersetzungsstand.
 */
const UUID = '0b7e1c3a-5d2f-4c8e-9a61-2f3b4c5d6e7f';
const doc = (text: string) => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });
const fehlerVon = (b: unknown) => {
  const p = blockSchema.safeParse(b);
  return p.success ? [] : p.error.issues.map((i) => `${i.path.join('.')}:${i.message}`);
};

const GUELTIG: Record<string, unknown> = {
  text: { typ: 'text', id: 'text000001', inhalt: { de: doc('Willkommen'), tr: doc('Hoş geldiniz') } },
  bild: { typ: 'bild', id: 'bild000001', mediumId: UUID, alt: { de: 'Gebetsraum mit Teppich' }, unterschrift: { de: '' } },
  galerie: {
    typ: 'galerie',
    id: 'galerie001',
    titel: { de: '' },
    bilder: [
      { mediumId: UUID, alt: { de: 'Bild eins' } },
      { mediumId: UUID, alt: { de: 'Bild zwei' } },
    ],
  },
  aufruf: {
    typ: 'aufruf',
    id: 'aufruf0001',
    titel: { de: 'Besuchen Sie uns' },
    text: { de: '' },
    knopf: { de: 'Kontakt' },
    ziel: '/kontakt',
  },
  faq: { typ: 'faq', id: 'faq0000001', titel: { de: '' }, eintraege: [{ frage: { de: 'Frage?' }, antwort: { de: 'Antwort.' } }] },
  trenner: { typ: 'trenner', id: 'trenner001' },
  spalten: {
    typ: 'spalten',
    id: 'spalten001',
    titel: { de: '' },
    spalten: [
      { titel: { de: 'A' }, text: { de: 'Text A' } },
      { titel: { de: '' }, text: { de: 'Text B' } },
    ],
  },
  termine: { typ: 'termine', id: 'termine001', titel: { de: '' }, anzahl: 3, organisation: 'gt' },
  nachrichten: { typ: 'nachrichten', id: 'nachricht1', titel: { de: '' }, anzahl: 6 },
  kontakt: { typ: 'kontakt', id: 'kontakt001', titel: { de: '' } },
  download: { typ: 'download', id: 'download01', mediumId: UUID, titel: { de: 'Flyer' }, beschreibung: { de: '' } },
  gebetszeiten: { typ: 'gebetszeiten', id: 'gebet00001', titel: { de: '' } },
  vers: { typ: 'vers', id: 'vers000001', sure: 2, von: 255, bis: 257, uebersetzung: true },
  hadith: { typ: 'hadith', id: 'hadith0001', sammlung: 'bukhari', nummer: '402.2' },
};

describe('Bausteine: Schema', () => {
  it('jede Art hat ein gültiges Beispiel', () => {
    expect(Object.keys(GUELTIG).sort()).toEqual([...BLOCK_TYPEN].sort());
    for (const [typ, b] of Object.entries(GUELTIG)) expect(fehlerVon(b), typ).toEqual([]);
  });

  it('Bild: Alt-Text Pflicht, Medium als UUID', () => {
    expect(fehlerVon({ ...(GUELTIG.bild as object), alt: { de: '  ' } })).toContain('alt.de:pflicht');
    expect(fehlerVon({ ...(GUELTIG.bild as object), mediumId: '' })).toContain('mediumId:bildFehlt');
  });

  it('Übersetzung ohne deutsche Fassung ist ein Fehler am deutschen Feld', () => {
    expect(fehlerVon({ ...(GUELTIG.bild as object), unterschrift: { de: '', tr: 'Alt yazı' } })).toContain('unterschrift.de:pflicht');
  });

  it('Text: leeres Dokument gilt als „kein Text“ (Pflicht)', () => {
    expect(fehlerVon({ typ: 'text', id: 'text000002', inhalt: { de: { type: 'doc', content: [{ type: 'paragraph' }] } } })).toContain(
      'inhalt.de:pflicht',
    );
  });

  it('Galerie braucht 2 bis 24 Bilder, Spalten 2 oder 3', () => {
    expect(fehlerVon({ ...(GUELTIG.galerie as object), bilder: [{ mediumId: UUID, alt: { de: 'eins' } }] })).toContain('bilder:galerieMin');
    const spalte = { titel: { de: '' }, text: { de: 'x' } };
    expect(fehlerVon({ ...(GUELTIG.spalten as object), spalten: [spalte, spalte, spalte, spalte] })).toContain('spalten:spaltenAnzahl');
  });

  it('Aufruf: nur interne Ziele (Pfad der Website oder freie Seite)', () => {
    expect(fehlerVon({ ...(GUELTIG.aufruf as object), ziel: 'https://example.org' })).toContain('ziel:zielUngueltig');
    expect(fehlerVon({ ...(GUELTIG.aufruf as object), ziel: '/gibt-es-nicht' })).toContain('ziel:zielUngueltig');
    expect(fehlerVon({ ...(GUELTIG.aufruf as object), ziel: `seite:${UUID}` })).toEqual([]);
    expect(fehlerVon({ ...(GUELTIG.aufruf as object), ziel: '/organisationen/genclik-teskilati' })).toEqual([]);
  });

  it('Vers: nur Verweis, Bereich aufsteigend und höchstens 10 Verse', () => {
    expect(fehlerVon({ ...(GUELTIG.vers as object), von: 5, bis: 4 })).toContain('bis:versBereich');
    expect(fehlerVon({ ...(GUELTIG.vers as object), von: 1, bis: 11 })).toContain('bis:versBereich');
    expect(fehlerVon({ ...(GUELTIG.vers as object), sure: 115 })).toContain('sure:sure');
    // Ein eingetippter Text wird nicht übernommen (unbekannte Felder fallen weg)
    const p = blockSchema.parse({ ...(GUELTIG.vers as object), text: 'eingetippt' });
    expect(p).not.toHaveProperty('text');
  });

  it('Hadith: Nummer wie in der Quelle, Sammlung aus der Liste', () => {
    expect(fehlerVon({ ...(GUELTIG.hadith as object), nummer: 'eins' })).toContain('nummer:hadithNummer');
    expect(fehlerVon({ ...(GUELTIG.hadith as object), sammlung: 'muslim' })).toContain('sammlung:ungueltig');
  });

  it('Termine/Nachrichten: Anzahl 1–12, Organisation aus der Liste', () => {
    expect(fehlerVon({ ...(GUELTIG.termine as object), anzahl: 13 })).toContain('anzahl:zahl');
    expect(fehlerVon({ ...(GUELTIG.termine as object), organisation: 'xy' })).toContain('organisation:ungueltig');
  });

  it('unbekannte Art und kaputte ID werden abgelehnt', () => {
    expect(blockSchema.safeParse({ typ: 'html', id: 'html000001', html: '<script>' }).success).toBe(false);
    expect(fehlerVon({ ...(GUELTIG.trenner as object), id: 'A B' })).toContain('id:ungueltig');
  });

  it('höchstens 60 Bausteine je Seite', () => {
    const viele = Array.from({ length: 61 }, (_, i) => ({ typ: 'trenner', id: `trenner${String(i).padStart(3, '0')}` }));
    expect(bloeckeSchema.safeParse(viele).success).toBe(false);
  });

  it('neue Bausteine ohne Pflichttexte sind sofort gültig, die übrigen melden Pflichtfelder', () => {
    for (const typ of ['trenner', 'termine', 'nachrichten', 'kontakt', 'gebetszeiten', 'vers'] as const)
      expect(blockSchema.safeParse(neuerBlock(typ)).success, typ).toBe(true);
    expect(blockSchema.safeParse(neuerBlock('aufruf')).success).toBe(false);
    expect(neuerBlock('text').id).toMatch(/^[a-z0-9]{10}$/);
  });
});

describe('Bausteine: Fehlerschlüssel, Verweise, Medien, Übersetzungsstand', () => {
  it('Fehler tragen die Baustein-ID statt der Position', () => {
    const roh = [GUELTIG.trenner, { ...(GUELTIG.bild as object), alt: { de: '' } }];
    const p = bloeckeSchema.safeParse(roh);
    expect(p.success).toBe(false);
    expect(blockFehler(roh, p.error!.issues)).toEqual({ 'block:bild000001:alt.de': 'pflicht' });
  });

  it('religiöse Verweise: sortiert, ohne Doppelte; gleiche Verweise in anderer Reihenfolge sind gleich', () => {
    const a = gueltigeBloecke([GUELTIG.hadith, GUELTIG.text, GUELTIG.vers]);
    const b = gueltigeBloecke([GUELTIG.vers, GUELTIG.hadith]);
    expect(religioeseVerweise(a)).toEqual(['hadith:bukhari:402.2', 'vers:2:255-257']);
    expect(gleicheVerweise(a, b)).toBe(true);
    expect(gleicheVerweise(a, gueltigeBloecke([GUELTIG.vers]))).toBe(false);
    expect(religioeseVerweise(gueltigeBloecke([GUELTIG.text]))).toEqual([]);
  });

  it('Medien-IDs aus Bild, Galerie, Bildknoten im Text und Download', () => {
    const anderes = '1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f';
    const mitBild = {
      typ: 'text',
      id: 'text000003',
      inhalt: { de: { type: 'doc', content: [{ type: 'image', attrs: { mediumId: anderes } }, doc('x').content[0]] } },
    };
    const m = medienIdsAus(gueltigeBloecke([GUELTIG.bild, GUELTIG.galerie, mitBild, GUELTIG.download]));
    expect(m.bilder.sort()).toEqual([UUID, anderes].sort());
    expect(m.dateien).toEqual([UUID]);
  });

  it('gespeicherte ungültige Bausteine fallen weg, statt die Seite zu brechen', () => {
    expect(gueltigeBloecke([GUELTIG.trenner, { typ: 'bild', id: 'kaputt0001' }, 'unsinn']).map((b) => b.id)).toEqual(['trenner001']);
    expect(gueltigeBloecke(null)).toEqual([]);
  });

  it('Übersetzungsstand je Sprache in Prozent', () => {
    const bloecke = gueltigeBloecke([GUELTIG.text, GUELTIG.aufruf]) as Block[];
    // Titel (tr+en), Text (tr), Aufruf-Titel und -Knopf (keine Übersetzung) → tr 2/4, en 1/4
    expect(uebersetzungsstand({ de: 'Seite', tr: 'Sayfa', en: 'Page' }, null, bloecke)).toEqual({ tr: 50, en: 25 });
    expect(uebersetzungsstand({ de: 'Seite' }, null, [])).toEqual({ tr: 0, en: 0 });
  });
});
