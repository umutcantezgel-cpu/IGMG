import { describe, expect, it } from 'vitest';
import { statusNachSpeichern } from '@/lib/religioes/freigabe';
import { anteil, wissenDatensatz, wissenKlartext, wissenSchema, wissenUebersetzungsstand } from '@/lib/validierung/wissen';

/**
 * Pflege „Islamisches Wissen“ (F-40): Formularschema, Übersetzungsstand je Sprache, Suchtext, Rücksetzen der Freigabe.
 * Alle Texte sind neutrale Testtexte – keine religiösen Inhalte.
 */
const absatz = (text: string) => JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text }] }] });
const basis = { titelDe: 'Testthema', slug: 'testthema' };

describe('wissenSchema', () => {
  it('neues Thema braucht eine gültige Adresse', () => {
    expect(wissenSchema.safeParse(basis).success).toBe(true);
    const ohne = wissenSchema.safeParse({ titelDe: 'Testthema' });
    expect(ohne.success).toBe(false);
    expect(ohne.error?.issues.map((i) => [i.path[0], i.message])).toContainEqual(['slug', 'pflicht']);
    for (const slug of ['Test', 'test thema', '-test', 'test-', 'test--thema', 'tést']) {
      const r = wissenSchema.safeParse({ ...basis, slug });
      expect(r.success, slug).toBe(false);
      expect(r.error?.issues[0]).toMatchObject({ path: ['slug'], message: 'slug' });
    }
  });

  it('beim Bearbeiten (mit id) bleibt die Adresse außen vor', () => {
    expect(wissenSchema.safeParse({ titelDe: 'Testthema', id: '00000000-0000-4000-8000-000000000001' }).success).toBe(true);
  });

  it('Titel ist Pflicht, Übersetzungen brauchen die deutsche Fassung', () => {
    expect(wissenSchema.safeParse({ slug: 'testthema' }).error?.issues[0]).toMatchObject({ path: ['titelDe'], message: 'pflicht' });
    const k = wissenSchema.safeParse({ ...basis, kurztextTr: 'Test' });
    expect(k.error?.issues[0]).toMatchObject({ path: ['kurztextDe'], message: 'pflicht' });
    const i = wissenSchema.safeParse({ ...basis, inhaltEn: absatz('Test') });
    expect(i.error?.issues[0]).toMatchObject({ path: ['inhaltDe'], message: 'pflicht' });
  });

  it('Schalter: sichtbar nur mit Haken, einreichen nur mit „ja“', () => {
    const r = wissenSchema.parse({ ...basis, sichtbar: 'ja', einreichen: 'ja' });
    expect([r.sichtbar, r.einreichen]).toEqual([true, true]);
    const s = wissenSchema.parse({ ...basis, sichtbar: '', einreichen: '' });
    expect([s.sichtbar, s.einreichen]).toEqual([false, false]);
  });

  it('Rich-Text: leerer Editor gilt als kein Inhalt, kaputtes JSON ist ein Fehler', () => {
    expect(wissenSchema.parse({ ...basis, inhaltDe: '' }).inhaltDe).toBeNull();
    expect(wissenSchema.safeParse({ ...basis, inhaltDe: '{kaputt' }).error?.issues[0]).toMatchObject({ path: ['inhaltDe'], message: 'richtext' });
  });
});

describe('Datensatz, Übersetzungsstand und Suchtext', () => {
  const e = wissenSchema.parse({
    ...basis,
    titelTr: 'Test başlık',
    titelEn: 'Test title',
    kurztextDe: 'Kurzer Testtext',
    kurztextEn: 'Short test text',
    inhaltDe: absatz('Testabsatz'),
  });
  const d = wissenDatensatz(e);

  it('leere Übersetzungen fallen weg', () => {
    expect(d.titel).toEqual({ de: 'Testthema', tr: 'Test başlık', en: 'Test title' });
    expect(d.kurztext).toEqual({ de: 'Kurzer Testtext', en: 'Short test text' });
    expect(Object.keys(d.inhalt ?? {})).toEqual(['de']);
  });

  it('Übersetzungsstand: Titel, Kurztext, Einführung je Sprache', () => {
    expect(wissenUebersetzungsstand(d)).toEqual({ gesamt: 3, tr: 1, en: 2 });
    expect(wissenUebersetzungsstand({ titel: { de: 'Testthema' }, kurztext: null, inhalt: null })).toEqual({ gesamt: 1, tr: 0, en: 0 });
    expect(anteil(2, 3)).toBe(67);
    expect(anteil(0, 0)).toBe(100);
  });

  it('Suchtext je Sprache aus Titel, Kurztext und Einführung', () => {
    expect(d.klartext.de).toBe('Testthema\nKurzer Testtext\nTestabsatz');
    expect(d.klartext.en).toBe('Test title\nShort test text');
    expect(wissenKlartext({ titel: { de: 'Testthema' }, kurztext: null, inhalt: null })).toEqual({ de: 'Testthema' });
  });
});

describe('Freigabe nach dem Speichern (Plan §5)', () => {
  it('jede inhaltliche Änderung an einem geprüften Thema setzt auf „zur Prüfung“ zurück', () => {
    expect(statusNachSpeichern('geprueft', true, false)).toBe('zur_pruefung');
    expect(statusNachSpeichern('geprueft', false, false)).toBe('geprueft');
    expect(statusNachSpeichern('entwurf', true, false)).toBe('entwurf');
    expect(statusNachSpeichern(null, true, true)).toBe('zur_pruefung');
  });
});
