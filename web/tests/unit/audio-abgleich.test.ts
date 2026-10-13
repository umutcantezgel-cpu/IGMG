import { describe, expect, it } from 'vitest';
import { einsaetze, lautstaerke, rasteEin, stillephasen, versgrenzen } from '@/lib/audio/abgleich';

/** Synthetisches Signal (nie Rezitationen, AUFTRAG 2.5): Töne mit Pausen dazwischen. */
function signal(abschnitte: { ms: number; ton: boolean }[], rate = 8000): Float32Array {
  const gesamt = abschnitte.reduce((s, a) => s + Math.round((a.ms * rate) / 1000), 0);
  const x = new Float32Array(gesamt);
  let pos = 0;
  for (const a of abschnitte) {
    const n = Math.round((a.ms * rate) / 1000);
    for (let i = 0; i < n; i++) x[pos + i] = a.ton ? 0.5 * Math.sin((2 * Math.PI * 220 * i) / rate) : 0.002 * Math.sin(i);
    pos += n;
  }
  return x;
}

describe('Rezitations-Werkstatt: Abgleich', () => {
  const x = signal([
    { ms: 400, ton: false },
    { ms: 2000, ton: true },
    { ms: 600, ton: false },
    { ms: 1500, ton: true },
    { ms: 900, ton: false },
    { ms: 1800, ton: true },
    { ms: 200, ton: false },
    { ms: 1000, ton: true },
    { ms: 400, ton: false },
  ]);
  const r = lautstaerke(x, 8000);

  it('findet die Stillephasen', () => {
    const p = stillephasen(r);
    expect(p.map((x) => x.endeMs - x.startMs)).toEqual([400, 600, 900, 400]); // 200 ms ist zu kurz
  });

  it('drei Verse: die zwei längsten inneren Pausen werden Grenzen', () => {
    const v = versgrenzen(r, 3);
    expect(v).toHaveLength(3);
    expect(v[0].startMs).toBe(400);
    expect(Math.abs(v[0].endeMs - 2700)).toBeLessThanOrEqual(40);
    expect(Math.abs(v[1].endeMs - 4950)).toBeLessThanOrEqual(40);
    expect(v[2].endeMs).toBe(8400);
  });

  it('mehr Verse als Pausen: Grenzen werden gleichmäßig ergänzt', () => {
    const v = versgrenzen(r, 6);
    expect(v).toHaveLength(6);
    for (let i = 1; i < v.length; i++) expect(v[i].startMs).toBe(v[i - 1].endeMs);
  });

  it('Einsätze und Einrasten der Klopfzeiten bei 0,75-facher Geschwindigkeit', () => {
    const e = einsaetze(r);
    expect(e.length).toBeGreaterThanOrEqual(4);
    // Geklopft bei Tempo 0,75: Einsatz bei 3000 ms erscheint beim langsamen Abspielen bei 4000 ms
    const k = rasteEin([540, 4060, 4010], 0.75, e);
    expect(Math.abs(k[0] - 400)).toBeLessThanOrEqual(20);
    expect(Math.abs(k[1] - 3000)).toBeLessThanOrEqual(20);
    expect(k[2]).toBeGreaterThan(k[1]);
  });
});
