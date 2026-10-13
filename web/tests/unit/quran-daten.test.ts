import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { leseBukhari, normalisiereArabisch } from '@/lib/hadith/import';
import { leseMetadaten } from '@/lib/quran/metadaten';
import { abschnitte, bereinige, graphemGrenzen, REGEL_FAMILIE, type TajwidSegment } from '@/lib/quran/tajwid';
import { leseTanzil } from '@/lib/quran/tanzil';
import { leseKopf, leseUebersetzung } from '@/lib/quran/uebersetzung';
import { woerter, zerlege, zusammensetzen } from '@/lib/quran/woerter';

const DATEN = join(import.meta.dirname, '../../daten');
const lies = (p: string) => readFileSync(join(DATEN, p));
const sha = (b: Buffer) => createHash('sha256').update(b).digest('hex');

const text = lies('tanzil/quran-uthmani.xml');
const suren = leseTanzil(text.toString('utf8'));
const verseJeSure = new Map(suren.map((s) => [s.nr, s.verse.length]));

describe('Koran-Daten im Repository (ADR 0025)', () => {
  it('Tanzil-Text ist unverändert (SHA-256 laut QUELLE.md) und vollständig', () => {
    expect(sha(text)).toBe('5ea5cbab9b4d031613a819a70822aff75e7c4500dea4946fc554b1bf84b7468a');
    expect(suren).toHaveLength(114);
    expect(suren.reduce((n, s) => n + s.verse.length, 0)).toBe(6236);
  });

  it('Basmala nur als Attribut der Suren 2–114 außer 9, nie im Verstext', () => {
    expect(suren[0].basmala).toBeUndefined();
    expect(suren[8].basmala).toBeUndefined();
    expect(suren.filter((s) => s.basmala).length).toBe(112);
  });

  it('Metadaten passen zum Text: 114 Suren, Verszahlen gleich, 30 Cüz', () => {
    const { suren: meta, einteilungen } = leseMetadaten(lies('tanzil/quran-data.xml').toString('utf8'));
    for (const m of meta) expect(m.verse).toBe(verseJeSure.get(m.nr));
    expect(einteilungen.filter((e) => e.art === 'cuz')).toHaveLength(30);
    expect(einteilungen.filter((e) => e.art === 'secde').length).toBeGreaterThan(0);
  });

  it('Wortzerlegung ist für alle 6.236 Verse verlustfrei (Rundreise)', () => {
    let anzahl = 0;
    for (const s of suren)
      for (const v of s.verse) {
        expect(zusammensetzen(zerlege(v.textAr))).toBe(v.textAr);
        anzahl += woerter(v.textAr).length;
      }
    expect(anzahl).toBe(77433);
  });

  it('Tajwid: alle Bereiche liegen im Vers, auf Graphem-Grenzen, mit bekannter Regel', () => {
    const roh = JSON.parse(lies('quran-tajweed/tajwid-tanzil-1.1.json').toString('utf8')) as [number, number, TajwidSegment[]][];
    expect(roh).toHaveLength(6236);
    const verse = new Map(suren.flatMap((s) => s.verse.map((v) => [`${s.nr}:${v.nr}`, v.textAr] as const)));
    let verworfen = 0;
    for (const [s, v, seg] of roh.slice(0, 600)) {
      const t = verse.get(`${s}:${v}`)!;
      const b = bereinige(t, seg);
      verworfen += b.verworfen;
      const grenzen = graphemGrenzen(t);
      for (const [start, ende, regel] of b.segmente) {
        expect(grenzen.has(start) && grenzen.has(ende)).toBe(true);
        expect(regel in REGEL_FAMILIE).toBe(true);
      }
    }
    expect(verworfen).toBe(0);
  });

  it('Abschnitte setzen den Text unverändert zusammen', () => {
    const t = suren[1].verse[0].textAr;
    const ab = abschnitte(t, [[0, 2, 'madd_6']]);
    expect(ab.map((a) => a.text).join('')).toBe(t);
    expect(ab[0].familie).toBe('madd');
  });
});

describe('Übersetzungen (Tanzil-Übergang)', () => {
  it('vollständig, mit Kopfangaben', () => {
    for (const id of ['de.bubenheim', 'tr.diyanet', 'en.sahih']) {
      const inhalt = lies(`tanzil-uebersetzungen/${id}.txt`).toString('utf8');
      expect(leseUebersetzung(inhalt, verseJeSure)).toHaveLength(6236);
      expect(leseKopf(inhalt).id).toBe(id);
    }
  });

  it('lehnt unvollständige Dateien ab', () => {
    expect(() => leseUebersetzung('1|1|x\n', verseJeSure)).toThrow();
  });
});

describe('Sahih al-Bukhari (arabisch)', () => {
  it('97 Bücher, alle Hadithe mit Buch, leere übersprungen', () => {
    const { buecher, hadithe, uebersprungen } = leseBukhari(lies('hadith/ara-bukhari.json').toString('utf8'));
    expect(buecher).toHaveLength(97);
    expect(hadithe.length + uebersprungen.length).toBe(7589);
    expect(hadithe.every((h) => h.buchNr >= 1 && h.buchNr <= 97)).toBe(true);
    expect(new Set(hadithe.map((h) => h.nummer)).size).toBe(hadithe.length);
  });

  it('Normalisierung entfernt nur Harakat und Tatweel', () => {
    expect(normalisiereArabisch('بَـابٌ')).toBe('باب');
  });
});
