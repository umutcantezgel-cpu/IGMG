import { describe, expect, it } from 'vitest';
import { deckt, fehlendeVorschlaege, oeffentlicheTage, ordneZu, type TagEintrag } from '@/lib/kalender/abgleich';
import { besondereTage, type BesondererTagVorschlag } from '@/lib/kalender/besondere-tage';
import { folgemonate, monatsRaster, tagPlus, wochentagMontag, wochentagNamen } from '@/lib/kalender/raster';
import { monateVonBis, ramadanUm, tageVonBis } from '@/lib/kalender/ramadan';
import { hijriDatum } from '@/lib/gebetszeiten/hijri';

/** Kalender (AUFTRAG 3.10): Monatsraster mit Hidschri-Tagen, Abgleich der besonderen Tage, Ramadan-Zeitraum. */
describe('Monatsraster', () => {
  it('Oktober 2026: beginnt am Montag, 28. September, endet am Sonntag, 1. November; 5 Wochen', () => {
    const r = monatsRaster('2026-10');
    expect(r.wochen).toHaveLength(5);
    expect(r.wochen[0][0]).toMatchObject({ datum: '2026-09-28', imMonat: false, wochentag: 0 });
    expect(r.wochen[0][3]).toMatchObject({ datum: '2026-10-01', tag: 1, imMonat: true, wochentag: 3 });
    expect(r.wochen.at(-1)!.at(-1)).toMatchObject({ datum: '2026-11-01', imMonat: false, wochentag: 6 });
    for (const w of r.wochen) expect(w).toHaveLength(7);
    expect(r.wochen.flat().filter((t) => t.imMonat)).toHaveLength(31);
  });

  it('Februar 2027 (Beginn Montag, 28 Tage) hat genau 4 Wochen; Februar 2026 (Sonntag) 5', () => {
    expect(monatsRaster('2027-02').wochen).toHaveLength(4);
    expect(monatsRaster('2026-02').wochen).toHaveLength(5);
  });

  it('Hidschri-Tag je Kalendertag aus hijriDatum; Monatswechsel als Liste', () => {
    const r = monatsRaster('2027-02');
    for (const t of r.wochen.flat()) expect(t.hijri).toEqual(hijriDatum(t.datum));
    // Im Februar 2027 beginnt der Ramadan (9. Monat): zwei Hidschri-Monate, der zweite ist Ramadan
    expect(r.hijriMonate.map((m) => m.monat)).toEqual([8, 9]);
    expect(hijriDatum(r.hijriMonate[1].ab)).toMatchObject({ monat: 9, tag: 1 });
  });

  it('folgemonate über den Jahreswechsel; ungültiger Monat wirft', () => {
    expect(folgemonate('2026-11', 4)).toEqual(['2026-11', '2026-12', '2027-01', '2027-02']);
    expect(folgemonate('2026-10', 12)).toHaveLength(12);
    expect(() => monatsRaster('2026-13')).toThrow();
    expect(() => folgemonate('26-1', 2)).toThrow();
  });

  it('Hilfen: tagPlus über Monats- und Jahresgrenzen, Montag = 0, Wochentagsnamen ab Montag', () => {
    expect(tagPlus('2026-12-31', 1)).toBe('2027-01-01');
    expect(tagPlus('2028-03-01', -1)).toBe('2028-02-29');
    expect(wochentagMontag('2026-10-12')).toBe(0);
    expect(wochentagMontag('2026-10-18')).toBe(6);
    expect(wochentagNamen('de-DE')[0].lang).toBe('Montag');
    expect(wochentagNamen('tr-TR')[4].lang).toBe('Cuma');
  });
});

describe('Ramadan um ein Datum', () => {
  it('außerhalb: der nächste Ramadan (2027 im Februar), nicht laufend', () => {
    const r = ramadanUm('2026-10-13')!;
    expect(r.laeuft).toBe(false);
    expect(r.von.startsWith('2027-02')).toBe(true);
    expect(hijriDatum(r.von)).toMatchObject({ monat: 9, tag: 1 });
    expect(hijriDatum(tagPlus(r.bis, 1)).monat).toBe(10);
    const tage = tageVonBis(r.von, r.bis).length;
    expect(tage === 29 || tage === 30).toBe(true);
  });

  it('mitten im Ramadan: derselbe Zeitraum, laufend', () => {
    const r = ramadanUm('2027-02-20')!;
    expect(r.laeuft).toBe(true);
    expect(r).toEqual({ ...ramadanUm(r.von)!, laeuft: true });
    expect(monateVonBis(r.von, r.bis)).toEqual(['2027-02', '2027-03']);
  });
});

describe('Abgleich besonderer Tage', () => {
  const v = (schluessel: BesondererTagVorschlag['schluessel'], art: BesondererTagVorschlag['art'], datum: string, tage = 1) =>
    ({ schluessel, art, datum, tage }) as BesondererTagVorschlag;
  const e = (id: string, art: TagEintrag['art'], datum: string): TagEintrag => ({ id, art, datum, titel: { de: id }, beschreibung: null });

  it('Arefe und Kurban Bayramı (benachbarte Tage, beide „bayram“) behalten ihren eigenen Eintrag', () => {
    const vorschlaege = [v('arefe', 'bayram', '2027-05-15'), v('kurbanBayrami', 'bayram', '2027-05-16', 4)];
    // Beide um einen Tag korrigiert
    const paare = ordneZu(vorschlaege, [e('kurban', 'bayram', '2027-05-17'), e('arefe', 'bayram', '2027-05-16')]);
    expect(paare.get(0)?.id).toBe('arefe');
    expect(paare.get(1)?.id).toBe('kurban');
  });

  it('nur gleiche Art und höchstens 3 Tage Abstand', () => {
    const vorschlaege = [v('mevlid', 'kandil', '2026-08-24')];
    expect(ordneZu(vorschlaege, [e('a', 'bayram', '2026-08-24')]).size).toBe(0);
    expect(ordneZu(vorschlaege, [e('a', 'kandil', '2026-08-28')]).size).toBe(0);
    expect(ordneZu(vorschlaege, [e('a', 'kandil', '2026-08-27')]).size).toBe(1);
  });

  it('fehlendeVorschlaege: nach Übernahme aller Vorschläge bleibt nichts (idempotent)', () => {
    const vorschlaege = besondereTage(2027);
    expect(fehlendeVorschlaege(vorschlaege, [])).toEqual(vorschlaege);
    const uebernommen = vorschlaege.map((x, i) => e(String(i), x.art, x.datum));
    expect(fehlendeVorschlaege(vorschlaege, uebernommen)).toEqual([]);
  });

  it('öffentlich: geprüfter Eintrag ersetzt den Vorschlag (mit dessen Dauer), übrige bleiben vorläufig', () => {
    const vorschlaege = [v('mevlid', 'kandil', '2026-08-24'), v('ramazanBayrami', 'bayram', '2027-03-10', 3)];
    const tage = oeffentlicheTage(vorschlaege, [e('bayram-id', 'bayram', '2027-03-09')]);
    expect(tage).toEqual([
      expect.objectContaining({ id: 'v-mevlid-2026-08-24', vorlaeufig: true, schluessel: 'mevlid', tage: 1 }),
      expect.objectContaining({ id: 't-bayram-id', vorlaeufig: false, datum: '2027-03-09', tage: 3, titel: { de: 'bayram-id' } }),
    ]);
    expect(deckt(tage[1], '2027-03-11')).toBe(true);
    expect(deckt(tage[1], '2027-03-12')).toBe(false);
    expect(deckt(tage[1], '2027-03-08')).toBe(false);
  });

  it('ein eigener Eintrag („sonstiges“) deckt keinen Vorschlag und erscheint zusätzlich', () => {
    const tage = oeffentlicheTage([v('asure', 'asure', '2026-06-25')], [e('fest', 'sonstiges', '2026-06-25')]);
    expect(tage.map((t) => t.id)).toEqual(['t-fest', 'v-asure-2026-06-25']);
  });
});
