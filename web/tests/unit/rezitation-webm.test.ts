import { describe, expect, it } from 'vitest';
import { webmDauer, webmMitDauer } from '@/lib/audio/webm';

/**
 * Dauer in WebM-Aufnahmen (MediaRecorder): synthetischer EBML-Aufbau wie aus Chromium – EBML-Kopf, Segment mit
 * unbekannter Größe, Info ohne Duration, Tracks, Cluster. Keine Audiodaten nötig.
 */
const el = (id: number[], inhalt: number[]) => {
  const n = inhalt.length;
  return [...id, 0x80 | n, ...inhalt]; // Größe mit einem Byte (< 127)
};
const UNBEKANNT = [0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff];

function aufnahme(segmentGroesseBekannt = false, mitDauer = false): Uint8Array {
  const ebml = el(
    [0x1a, 0x45, 0xdf, 0xa3],
    el(
      [0x42, 0x82],
      [...'webm'].map((z) => z.charCodeAt(0)),
    ),
  );
  const info = el(
    [0x15, 0x49, 0xa9, 0x66],
    [
      ...el([0x2a, 0xd7, 0xb1], [0x0f, 0x42, 0x40]), // TimecodeScale 1 000 000
      ...el(
        [0x4d, 0x80],
        [...'Test'].map((z) => z.charCodeAt(0)),
      ), // MuxingApp
      ...(mitDauer ? el([0x44, 0x89], [0x40, 0x8f, 0x40, 0, 0, 0, 0, 0]) : []), // 1000.0
    ],
  );
  const tracks = el([0x16, 0x54, 0xae, 0x6b], [0xae, 0x80]);
  const cluster = el([0x1f, 0x43, 0xb6, 0x75], [0xe7, 0x81, 0x00]);
  const inhalt = [...info, ...tracks, ...cluster];
  const segment = [
    0x18,
    0x53,
    0x80,
    0x67,
    ...(segmentGroesseBekannt ? [0x40 | (inhalt.length >> 8), inhalt.length & 0xff] : UNBEKANNT),
    ...inhalt,
  ];
  return Uint8Array.from([...ebml, ...segment]);
}

describe('WebM-Dauer nachtragen', () => {
  it('trägt die Dauer in Segment › Info ein; alles andere bleibt gleich', () => {
    const roh = aufnahme();
    expect(webmDauer(roh)).toBeNull();
    const neu = webmMitDauer(roh, 4321);
    expect(webmDauer(neu)).toBeCloseTo(4321, 6);
    expect(neu.length).toBe(roh.length + 11 + 7); // Duration-Element + 8-Byte-Größenfeld statt 1 Byte
    // Cluster am Ende unverändert
    expect(Array.from(neu.slice(-7))).toEqual(Array.from(roh.slice(-7)));
  });

  it('ist wiederholbar und lässt vorhandene Dauer, Unbekanntes und 0 unverändert', () => {
    const neu = webmMitDauer(aufnahme(), 1000);
    expect(webmMitDauer(neu, 2000)).toBe(neu);
    const mit = aufnahme(false, true);
    expect(webmDauer(mit)).toBe(1000);
    expect(webmMitDauer(mit, 5000)).toBe(mit);
    const ogg = Uint8Array.from([0x4f, 0x67, 0x67, 0x53, 0, 2, 0, 0]);
    expect(webmMitDauer(ogg, 1000)).toBe(ogg);
    expect(webmMitDauer(aufnahme(), 0)).toEqual(aufnahme());
  });

  it('passt eine bekannte Segmentgröße an', () => {
    const roh = aufnahme(true);
    const neu = webmMitDauer(roh, 777);
    expect(webmDauer(neu)).toBeCloseTo(777, 6);
    // Segmentgröße (8 Byte) = Inhalt bis zum Ende
    const start = 4 + 1 + 7; // EBML-Kopf: ID 4 + Größe 1 + Inhalt 7 (DocType)
    const groesse = neu.slice(start + 4, start + 12).reduce((n, b, i) => (i === 0 ? 0 : n * 256 + b), 0);
    expect(groesse).toBe(neu.length - (start + 12));
  });
});
