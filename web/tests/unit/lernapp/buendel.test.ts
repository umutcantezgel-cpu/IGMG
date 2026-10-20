import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TESTAUDIO_VERZEICHNIS, testkursClipTexte } from '../../../drizzle/seeds/lernapp-test';
import {
  BUENDEL_MAX_BYTES,
  BuendelFehler,
  baueBuendel,
  buendelAdresse,
  buendelBlobSchluessel,
  buendelDatei,
  findeClip,
  kopfLaenge,
  leseBuendelKopf,
  leseBuendelPfad,
  schneideClip,
} from '@/lib/lernapp/paket/buendel';
import { sha256Hex, textHash } from '@/lib/lernapp/paket/hash';

/** Audio-Bündel `.lpa` (ADR 0039 Nr. 3, Fortschreibung S4/S5): Kopf, Index, Schnitt, Typ, Größe ≤ 16 MB. */
const testbuendel = (sprache: string) => {
  const ordner = join(TESTAUDIO_VERZEICHNIS, sprache);
  const datei = readdirSync(ordner).find((d) => d.endsWith('.lpa'))!;
  return { datei, bytes: new Uint8Array(readFileSync(join(ordner, datei))) };
};

/** Clips aus einem vorhandenen Testbündel (echte WebM/Opus-Dateien mit Dauer). */
function clipsAus(bytes: Uint8Array) {
  const kopf = leseBuendelKopf(bytes, bytes.length);
  return kopf.clips.map((c) => ({ textHash: c.textHash, daten: bytes.slice(c.versatz, c.versatz + c.laenge) }));
}

describe('Bündel bauen und lesen', () => {
  const { bytes } = testbuendel('de');
  const clips = clipsAus(bytes);

  it('Kennung, Kopflänge und Index; Clips lückenlos ab dem Kopf, nach Text-Hash sortiert', () => {
    const b = baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips: [...clips].reverse() });
    expect(new TextDecoder().decode(b.bytes.subarray(0, 4))).toBe('LPA1');
    const kopf = leseBuendelKopf(b.bytes, b.bytes.length);
    expect(kopf.clips.map((c) => c.textHash)).toEqual([...clips.map((c) => c.textHash)].sort());
    expect(kopf.clips[0]?.versatz).toBe(8 + kopfLaenge(b.bytes));
    for (const c of kopf.clips) {
      expect(c.format).toBe('webm-opus');
      expect(c.dauerMs).toBeGreaterThan(0);
      // Jeder Clip ist eine vollständige WebM-Datei (EBML-Kopf)
      expect([...b.bytes.subarray(c.versatz, c.versatz + 4)]).toEqual([0x1a, 0x45, 0xdf, 0xa3]);
    }
  });

  it('gleiche Eingabe → gleiche Bytes (Reihenfolge der Clips egal), Name aus dem SHA-256', () => {
    const a = baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips });
    const b = baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips: [...clips].reverse() });
    expect(sha256Hex(a.bytes)).toBe(sha256Hex(b.bytes));
    expect(buendelDatei('de.a1.e01', sha256Hex(a.bytes))).toMatch(/^de\.a1\.e01-[0-9a-f]{16}\.lpa$/);
  });

  it('Schnitt per Blob.slice ergibt genau die Bytes des Clips mit Typ audio/webm', async () => {
    const b = baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips });
    const blob = new Blob([b.bytes]);
    for (const c of b.kopf.clips) {
      const teil = schneideClip(blob, c);
      expect(teil.type).toBe('audio/webm');
      expect(teil.size).toBe(c.laenge);
      const original = clips.find((x) => x.textHash === c.textHash)!.daten;
      expect(new Uint8Array(await teil.arrayBuffer())).toEqual(original);
    }
    expect(findeClip(b.kopf, clips[0]!.textHash)?.laenge).toBe(clips[0]!.daten.length);
    expect(findeClip(b.kopf, '0'.repeat(64))).toBeNull();
  });

  it('weist ungültige Clips ab: kein WebM, doppelter Hash, fremde Einheit', () => {
    const c = clips[0]!;
    expect(() =>
      baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips: [{ textHash: c.textHash, daten: new Uint8Array(40) }] }),
    ).toThrow(BuendelFehler);
    expect(() => baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips: [c, c] })).toThrow(/doppelt/);
    expect(() => baueBuendel({ sprache: 'de', einheit: 'tr.a1.e01', clips: [c] })).toThrow(/Einheit/);
  });

  it('Regel: höchstens 16 MB je Bündel (CDN-Grenze 20 MB, S5)', () => {
    expect(BUENDEL_MAX_BYTES).toBe(16 * 1024 * 1024);
    const gross = new Uint8Array(BUENDEL_MAX_BYTES);
    gross.set([0x1a, 0x45, 0xdf, 0xa3]);
    expect(() =>
      baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips: [{ textHash: 'a'.repeat(64), daten: gross, dauerMs: 1000 }] }),
    ).toThrow(/zu groß/);
  });

  it('lehnt beschädigte Köpfe ab', () => {
    const b = baueBuendel({ sprache: 'de', einheit: 'de.a1.e01', clips });
    const kaputt = b.bytes.slice();
    kaputt[0] = 0x58;
    expect(() => leseBuendelKopf(kaputt)).toThrow(/Kennung/);
    expect(() => leseBuendelKopf(b.bytes, b.bytes.length + 1)).toThrow(/Größe/);
    expect(() => leseBuendelKopf(b.bytes.subarray(0, 20))).toThrow(/unvollständig/);
  });
});

describe('Pfade und Adressen', () => {
  it('prüft <sprache>/<einheit>-<sha16>.lpa', () => {
    expect(leseBuendelPfad('tr/tr.a1.e01-0123456789abcdef.lpa')).toEqual({
      sprache: 'tr',
      einheit: 'tr.a1.e01',
      sha16: '0123456789abcdef',
      datei: 'tr.a1.e01-0123456789abcdef.lpa',
    });
    for (const falsch of [
      'tr/de.a1.e01-0123456789abcdef.lpa',
      'en/en.a1.e01-0123456789abcdef.lpa',
      'tr/tr.a1.e01-0123456789ABCDEF.lpa',
      'tr/../tr.a1.e01-0123456789abcdef.lpa',
      'tr/tr.a1.e01-0123456789abcdef.webm',
      'tr/tr-0123456789abcdef.lpa',
    ])
      expect(leseBuendelPfad(falsch), falsch).toBeNull();
    expect(buendelAdresse('ar', 'ar.a1.e01-0123456789abcdef.lpa')).toBe('/lern-app/audio/ar/ar.a1.e01-0123456789abcdef.lpa');
    expect(buendelBlobSchluessel('ar', 'x.lpa')).toBe('lernapp/audio/ar/x.lpa');
  });
});

describe('Testbündel des Testkurses (synthetische Töne)', () => {
  for (const sprache of ['de', 'tr', 'ar'] as const)
    it(`${sprache}: Name passt zum Inhalt, ≤ 16 MB, ein Clip je Zieltext`, () => {
      const { datei, bytes } = testbuendel(sprache);
      const pfad = leseBuendelPfad(`${sprache}/${datei}`);
      expect(pfad?.sha16).toBe(sha256Hex(bytes).slice(0, 16));
      expect(bytes.length).toBeLessThanOrEqual(BUENDEL_MAX_BYTES);
      const kopf = leseBuendelKopf(bytes, bytes.length);
      expect(kopf.sprache).toBe(sprache);
      expect(new Set(kopf.clips.map((c) => c.textHash))).toEqual(new Set(testkursClipTexte(sprache).map(textHash)));
    });
});
