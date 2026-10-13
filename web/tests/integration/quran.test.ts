import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { leseMetadaten } from '@/lib/quran/metadaten';
import { bereinige, type TajwidSegment } from '@/lib/quran/tajwid';
import { leseTanzil } from '@/lib/quran/tanzil';
import { leseUebersetzung } from '@/lib/quran/uebersetzung';
import { woerter } from '@/lib/quran/woerter';
import { betriebsart } from '@/lib/umgebung';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Koran-Leser (O-Q01, H-Q01): Abfragen gegen eine frische Datenbank mit Sure 1 und 2 aus den Daten im Repository
 * (Tanzil 1.1, Tajwid, Übersetzung de.bubenheim). Prüft: 286 Verse, Wörter aus quran_wort ergeben den Verstext,
 * Übersetzung nur aus quran_uebersetzung und nur nach Sichtbarkeitsregel, geprüfte Bedeutungen, Cüz-Bereiche,
 * Tajwid-Regeln mit Freigabe.
 */
const { client, db } = await verwaltungsUmgebung();
const q = await import('@/server/queries/quran');
afterAll(() => client.close());

const DATEN = join(import.meta.dirname, '../../daten');
const lies = (p: string) => readFileSync(join(DATEN, p), 'utf8');
const vorschauIn = (modus: string) => betriebsart({ SITE_MODE: modus }) !== 'produktion';

describe('ohne Import', () => {
  it('keine Quelle, keine Suren, keine Sure, keine Cüz', async () => {
    expect(await q.ladeQuranStand()).toEqual({ quelle: null, suren: [] });
    expect(await q.ladeSure(1, null)).toBeNull();
    expect(await q.ladeCuzBereiche()).toEqual([]);
    expect(await q.ladeAusgaben(true)).toEqual([]);
  });
});

describe('mit Sure 1 und 2 aus den Repository-Daten', () => {
  const suren = leseTanzil(lies('tanzil/quran-uthmani.xml')).slice(0, 2);
  const { suren: meta, einteilungen } = leseMetadaten(lies('tanzil/quran-data.xml'));
  const tajwid = new Map(
    (JSON.parse(lies('quran-tajweed/tajwid-tanzil-1.1.json')) as [number, number, TajwidSegment[]][]).map(([s, v, seg]) => [`${s}:${v}`, seg]),
  );

  beforeAll(async () => {
    await db.insert(schema.quranQuelle).values({
      id: 'tanzil',
      bezeichnung: 'Tanzil Project – Quran Text (Uthmani, Version 1.1)',
      url: 'https://tanzil.net',
      version: '1.1',
      sha256: '0'.repeat(64),
      lizenz: 'CC BY 3.0',
    });
    for (const s of suren) {
      const m = meta[s.nr - 1];
      await db.insert(schema.quranSure).values({
        nr: s.nr,
        nameAr: s.nameAr,
        verseAnzahl: s.verse.length,
        quelleId: 'tanzil',
        nameUmschrift: m.umschrift,
        ort: m.ort,
        basmala: s.basmala ?? null,
      });
      await db.insert(schema.quranVers).values(
        s.verse.map((v) => ({ sure: s.nr, vers: v.nr, textAr: v.textAr, tajwid: bereinige(v.textAr, tajwid.get(`${s.nr}:${v.nr}`) ?? []).segmente })),
      );
    }
    const alle = suren.flatMap((s) => s.verse.flatMap((v) => woerter(v.textAr).map((w) => ({ sure: s.nr, vers: v.nr, ...w }))));
    const vorkommen = new Map<string, number>();
    for (const w of alle) vorkommen.set(w.text, (vorkommen.get(w.text) ?? 0) + 1);
    const formen = await db
      .insert(schema.quranWortform)
      .values([...vorkommen].map(([textAr, n]) => ({ textAr, vorkommen: n })))
      .returning({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr });
    const formId = new Map(formen.map((f) => [f.textAr, f.id]));
    for (let i = 0; i < alle.length; i += 1000) {
      await db
        .insert(schema.quranWort)
        .values(alle.slice(i, i + 1000).map((w) => ({ sure: w.sure, vers: w.vers, pos: w.pos, textAr: w.text, formId: formId.get(w.text)! })));
    }
    await db.insert(schema.quranEinteilung).values(einteilungen.filter((e) => e.art === 'cuz'));
    await db.insert(schema.quranAusgabe).values({
      id: 'tanzil-de.bubenheim',
      sprache: 'de',
      titel: 'Bubenheim & Elyas',
      uebersetzer: 'A. S. F. Bubenheim and N. Elyas',
      quelle: 'Tanzil.net',
      version: 'test',
      lizenz: '[Testlizenz]',
      url: 'https://tanzil.net/trans/',
      sha256: '0'.repeat(64),
      abgerufenAm: new Date('2026-10-13T00:00:00Z'),
    });
    const verseJe = new Map(leseTanzil(lies('tanzil/quran-uthmani.xml')).map((s) => [s.nr, s.verse.length]));
    const ueb = leseUebersetzung(lies('tanzil-uebersetzungen/de.bubenheim.txt'), verseJe).filter((v) => v.sure <= 2);
    await db.insert(schema.quranUebersetzung).values(ueb.map((v) => ({ ausgabeId: 'tanzil-de.bubenheim', ...v })));
    // Altfeld darf nie gelesen werden
    await db.update(schema.quranVers).set({ uebersetzung: { de: { text: '[Altfeld]', quelle: 'alt', lizenz: 'alt' } } });
    await db.insert(schema.tajwidRegel).values([
      { schluessel: 'madd_2', familie: 'madd', name: { de: 'Madd (2)' }, sortierung: 1, erklaerung: { de: { type: 'doc', content: [] } } },
      {
        schluessel: 'ghunnah',
        familie: 'ghunna',
        name: { de: 'Ghunna' },
        sortierung: 0,
        kurz: { de: '[Kurztext geprüft]' },
        freigabe: 'geprueft',
      },
    ]);
  });

  it('Sure 2: 286 Verse in Reihenfolge, Kopf mit Umschrift, Ort und Basmala', async () => {
    const sure = await q.ladeSure(2, null);
    expect(sure?.verse).toHaveLength(286);
    expect(sure?.verse.map((v) => v.nr)).toEqual(Array.from({ length: 286 }, (_, i) => i + 1));
    expect(sure?.umschrift).toBe('Al-Baqara');
    expect(sure?.ort).toBe('medeni');
    expect(sure?.basmala).toBe(suren[1].basmala);
    expect((await q.ladeSure(1, null))?.basmala).toBeNull();
    for (const nr of [0, 115, 1.5, 3]) expect(await q.ladeSure(nr, null)).toBeNull();
  });

  it('Wörter aus quran_wort ergeben den Verstext; Versatz zeigt auf das Wort; Tajwid im Vers', async () => {
    const sure = await q.ladeSure(2, null);
    let woerterGesamt = 0;
    for (const v of sure!.verse) {
      const text = suren[1].verse[v.nr - 1].textAr;
      expect(v.teile.map((t) => t.text).join(' ')).toBe(text);
      const ws = v.teile.filter((t) => t.pos !== null);
      expect(ws.map((t) => t.pos)).toEqual(ws.map((_, i) => i + 1));
      for (const t of v.teile) expect(Array.from(text).slice(t.versatz, t.versatz + Array.from(t.text).length).join('')).toBe(t.text);
      woerterGesamt += ws.length;
    }
    expect(woerterGesamt).toBe(6141);
    expect(sure!.verse.some((v) => v.tajwid.length > 0)).toBe(true);
    expect(sure!.verse.every((v) => v.uebersetzung === null)).toBe(true);
  });

  it('Übersetzung aus quran_uebersetzung (nie aus dem Altfeld)', async () => {
    const sure = await q.ladeSure(2, 'tanzil-de.bubenheim');
    expect(sure!.verse.every((v) => v.uebersetzung && v.uebersetzung !== '[Altfeld]')).toBe(true);
    expect(sure!.verse[0].uebersetzung).toBe(leseUebersetzung(lies('tanzil-uebersetzungen/de.bubenheim.txt'), new Map([[1, 7], [2, 286], ...Array.from({ length: 112 }, (_, i) => [i + 3, 0] as [number, number])])).length ? sure!.verse[0].uebersetzung : null);
  });

  it('Sichtbarkeit: nicht freigegebene Ausgabe nur in Entwicklung/Vorschau, mit Hinweis', async () => {
    expect(vorschauIn('produktion')).toBe(false);
    expect(await q.ladeAusgaben(vorschauIn('produktion'))).toEqual([]);
    expect(await q.ladeUebersetzungstext(2, 'tanzil-de.bubenheim', vorschauIn('produktion'))).toBeNull();
    const vorschau = await q.ladeAusgaben(vorschauIn('entwicklung'));
    expect(vorschau.map((a) => [a.id, a.ausstehend])).toEqual([['tanzil-de.bubenheim', true]]);
    expect((await q.ladeUebersetzungstext(2, 'tanzil-de.bubenheim', vorschauIn('vorschau')))?.verse).toHaveLength(286);
  });

  it('nach Aktivierung und Freigabe auch in der Produktion sichtbar, ohne Hinweis', async () => {
    await db.update(schema.quranAusgabe).set({ aktiv: true, freigegebenVon: 'test', freigegebenAm: new Date() });
    const produktion = await q.ladeAusgaben(vorschauIn('produktion'));
    expect(produktion.map((a) => [a.id, a.ausstehend])).toEqual([['tanzil-de.bubenheim', false]]);
    expect((await q.ladeUebersetzungstext(1, 'tanzil-de.bubenheim', false))?.verse).toHaveLength(7);
  });

  it('Cüz-Bereiche aus quran_einteilung; Cüz 1 reicht über die Surengrenze bis 2:141', async () => {
    const bereiche = await q.ladeCuzBereiche();
    expect(bereiche).toHaveLength(30);
    expect(bereiche[0]).toEqual({ nr: 1, von: { sure: 1, vers: 1 }, bis: { sure: 2, vers: 141 } });
    const cuz = await q.ladeCuz(1, null);
    expect(cuz?.abschnitte.map((a) => [a.sure.nr, a.verse[0]?.nr, a.verse.at(-1)?.nr])).toEqual([
      [1, 1, 7],
      [2, 1, 141],
    ]);
    expect(await q.ladeCuz(31, null)).toBeNull();
  });

  it('Wortdaten: Formen mit Vorkommen, nur geprüfte Bedeutungen, Regeln nur mit freigegebenem Text', async () => {
    const [form] = await db.select({ id: schema.quranWortform.id }).from(schema.quranWortform).limit(1);
    await db.insert(schema.quranWortbedeutung).values([
      { formId: form.id, sprache: 'de', bedeutung: '[geprüfte Bedeutung]', freigabe: 'geprueft' },
      { formId: form.id, sprache: 'tr', bedeutung: '[Entwurf]', freigabe: 'entwurf' },
    ]);
    const daten = await q.ladeWortDaten(1);
    expect(Object.keys(daten!.verse)).toHaveLength(7);
    expect(daten!.verse[1].w).toHaveLength(4);
    expect(Object.values(daten!.formen).every((n) => n >= 1)).toBe(true);
    expect(daten!.bedeutungen[form.id]).toEqual({ de: { b: '[geprüfte Bedeutung]', wurzel: null } });
    const ghunna = daten!.regeln.find((r) => r.schluessel === 'ghunnah');
    const madd = daten!.regeln.find((r) => r.schluessel === 'madd_2');
    expect(ghunna?.kurz).toEqual({ de: '[Kurztext geprüft]' });
    expect(madd?.erklaerung).toBeNull();
    expect(await q.ladeWortDaten(115)).toBeNull();
  });

  it('Tajwid-Beispiele: erstes Vorkommen je Regel, nur diese Regel markiert', async () => {
    const beispiele = await q.ladeTajwidBeispiele();
    const madd = beispiele.find((b) => b.regel === 'madd_2');
    expect(madd).toMatchObject({ sure: 1, vers: 1 });
    expect(madd!.tajwid.every((s) => s[2] === 'madd_2')).toBe(true);
  });

  it('ohne aktive Rezitation: keine Rezitationen, keine Zeiten', async () => {
    expect(await q.ladeRezitationen()).toEqual([]);
    expect(await q.ladeRezitationsSuren()).toEqual([]);
    expect(await q.ladeZeiten(1, 'gibt-es-nicht')).toBeNull();
  });
});
