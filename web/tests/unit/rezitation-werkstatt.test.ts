import { describe, expect, it } from 'vitest';
import { einsaetze, lautstaerke, rasteEin, versgrenzen } from '@/lib/audio/abgleich';
import {
  bereinigeAnfaenge,
  formatZeit,
  MIN_VERS_MS,
  MIN_WORT_MS,
  mono,
  pruefeVerszeiten,
  pruefeWortanfaenge,
  punkteAusVerszeiten,
  spalten,
  spitzen,
  verschiebeGrenze,
  verszeitenAusPunkten,
  wortzeitenAusAnfaengen,
  zeitRaster,
  zeitVorlesen,
} from '@/lib/audio/werkstatt';
import { kennungAus, rezitationSchema } from '@/lib/validierung/rezitation';

/** Synthetisches Signal (nie Rezitationen, AUFTRAG 2.5): Sinus-Töne mit Stille dazwischen. */
function signal(abschnitte: { ms: number; ton: boolean }[], rate = 8000): Float32Array {
  const gesamt = abschnitte.reduce((s, a) => s + Math.round((a.ms * rate) / 1000), 0);
  const x = new Float32Array(gesamt);
  let pos = 0;
  for (const a of abschnitte) {
    const n = Math.round((a.ms * rate) / 1000);
    for (let i = 0; i < n; i++) x[pos + i] = a.ton ? 0.5 * Math.sin((2 * Math.PI * 330 * i) / rate) : 0;
    pos += n;
  }
  return x;
}

describe('Grenzen verschieben (Ziehen und Tastatur)', () => {
  const punkte = [0, 1000, 2000, 3000];

  it('verschiebt innerhalb der Nachbarn und rundet', () => {
    expect(verschiebeGrenze(punkte, 1, 1250.4, { maxMs: 3000 })).toEqual([0, 1250, 2000, 3000]);
    expect(verschiebeGrenze(punkte, 1, 1000 - 50, { maxMs: 3000 })[1]).toBe(950);
  });

  it('hält den Mindestabstand zu den Nachbarn und die Ränder', () => {
    expect(verschiebeGrenze(punkte, 1, 5000, { maxMs: 3000 })[1]).toBe(2000 - MIN_VERS_MS);
    expect(verschiebeGrenze(punkte, 1, -10, { maxMs: 3000 })[1]).toBe(0 + MIN_VERS_MS);
    expect(verschiebeGrenze(punkte, 0, -500, { maxMs: 3000 })[0]).toBe(0);
    expect(verschiebeGrenze(punkte, 3, 9999, { maxMs: 3200 })[3]).toBe(3200);
    expect(verschiebeGrenze([500, 900], 0, 0, { minMs: 400, maxMs: 1000, abstandMs: MIN_WORT_MS })[0]).toBe(400);
  });

  it('ohne Platz zwischen den Nachbarn bleibt der Punkt; ungültige Eingaben ändern nichts', () => {
    expect(verschiebeGrenze([0, 100, 150], 1, 140, { maxMs: 1000 })).toEqual([0, 100, 150]);
    expect(verschiebeGrenze(punkte, 7, 10, { maxMs: 3000 })).toEqual(punkte);
    expect(verschiebeGrenze(punkte, 1, Number.NaN, { maxMs: 3000 })).toEqual(punkte);
  });
});

describe('Verszeiten ↔ Punkte', () => {
  it('Rundreise und geschlossene Lücken', () => {
    const p = punkteAusVerszeiten(
      [
        [2, 1100, 2000],
        [1, 300, 1000],
        [3, 2000, 2900],
      ],
      3,
    );
    expect(p).toEqual([300, 1100, 2000, 2900]);
    expect(verszeitenAusPunkten(p!)).toEqual([
      [1, 300, 1100],
      [2, 1100, 2000],
      [3, 2000, 2900],
    ]);
  });

  it('fehlender Vers oder nicht aufsteigend: null', () => {
    expect(punkteAusVerszeiten([[1, 0, 100]], 2)).toBeNull();
    expect(
      punkteAusVerszeiten(
        [
          [1, 500, 900],
          [2, 400, 1000],
        ],
        2,
      ),
    ).toBeNull();
    expect(punkteAusVerszeiten([], 0)).toBeNull();
  });
});

describe('Prüfung der Zeiten (Browser und Server)', () => {
  it('Verszeiten: vollständig, aufsteigend, mindestens 0,2 s, in der Datei', () => {
    const gut: [number, number, number][] = [
      [1, 0, 1000],
      [2, 1000, 2500],
    ];
    expect(pruefeVerszeiten(gut, 2, 2500)).toBeNull();
    expect(pruefeVerszeiten(gut, 2, null)).toBeNull();
    expect(pruefeVerszeiten(gut, 3, 2500)).toBe('anzahl');
    expect(
      pruefeVerszeiten(
        [
          [1, 0, 1000],
          [3, 1000, 2000],
        ],
        2,
        null,
      ),
    ).toBe('anzahl');
    expect(
      pruefeVerszeiten(
        [
          [1, 0, 1000],
          [2, 900, 2000],
        ],
        2,
        null,
      ),
    ).toBe('reihenfolge');
    expect(pruefeVerszeiten([[1, 0, 100]], 1, null)).toBe('reihenfolge');
    expect(pruefeVerszeiten([[1, -5, 1000]], 1, null)).toBe('reihenfolge');
    expect(pruefeVerszeiten(gut, 2, 2000)).toBe('dauer');
    // Rundung der Dauer im Browser wird toleriert
    expect(pruefeVerszeiten(gut, 2, 2400)).toBeNull();
  });

  it('Wortanfänge: einer je Wort, steigend mit Abstand, im Versfenster', () => {
    const fenster = { startMs: 1000, endeMs: 2000 };
    expect(pruefeWortanfaenge([1000, 1300, 1600], 3, fenster)).toBeNull();
    expect(pruefeWortanfaenge([1000, 1300], 3, fenster)).toBe('anzahl');
    expect(pruefeWortanfaenge([1000, 1020, 1600], 3, fenster)).toBe('reihenfolge');
    expect(pruefeWortanfaenge([900, 1300, 1600], 3, fenster)).toBe('fenster');
    expect(pruefeWortanfaenge([1000, 1300, 1990], 3, fenster)).toBe('fenster');
    expect(pruefeWortanfaenge([1000.5], 1, fenster)).toBe('reihenfolge');
  });

  it('Wortzeiten aus den Anfängen: Ende = nächster Anfang bzw. Versende', () => {
    expect(wortzeitenAusAnfaengen([1000, 1300, 1600], 2000)).toEqual([
      [1000, 1300],
      [1300, 1600],
      [1600, 2000],
    ]);
  });

  it('bereinigt eingerastete Anfänge ins Fenster mit Mindestabstand', () => {
    const fenster = { startMs: 1000, endeMs: 2000 };
    expect(bereinigeAnfaenge([950, 1200, 1210, 2100], fenster)).toEqual([1000, 1200, 1240, 1960]);
    const b = bereinigeAnfaenge([1990, 1995, 1999], fenster);
    expect(pruefeWortanfaenge(b, 3, fenster)).toBeNull();
    // Fenster zu klein: gleichmäßig verteilt
    expect(bereinigeAnfaenge([0, 0, 0], { startMs: 0, endeMs: 100 })).toEqual([0, 25, 50]);
    expect(bereinigeAnfaenge([], fenster)).toEqual([]);
  });
});

describe('Zeitraster und Zeitangaben', () => {
  it('wählt die kleinste Schrittweite mit genug Abstand', () => {
    expect(zeitRaster(0, 10_000, 1000).schrittMs).toBe(1000);
    expect(zeitRaster(0, 60_000, 1000).schrittMs).toBe(10_000);
    expect(zeitRaster(0, 1000, 1000).schrittMs).toBe(100);
    expect(zeitRaster(0, 3_600_000, 300).schrittMs).toBe(300_000);
  });

  it('Striche sind Vielfache der Schrittweite im Ausschnitt', () => {
    const r = zeitRaster(1500, 6500, 1000);
    expect(r.schrittMs).toBe(500);
    expect(r.striche[0]).toBe(1500);
    expect(r.striche.at(-1)).toBe(6500);
    for (const s of r.striche) expect(s % r.schrittMs).toBe(0);
  });

  it('formatiert Zeiten mit deutschem Komma und ohne Minus', () => {
    expect(formatZeit(0)).toBe('0:00,00');
    expect(formatZeit(62_345)).toBe('1:02,35');
    expect(formatZeit(62_345, 1)).toBe('1:02,3');
    expect(formatZeit(62_345, 0)).toBe('1:02');
    expect(formatZeit(-40)).toBe('0:00,00');
    expect(zeitVorlesen(12_350)).toBe('12,35 Sekunden');
    expect(zeitVorlesen(62_500)).toBe('1 Minute 2,5 Sekunden');
    expect(zeitVorlesen(180_000)).toBe('3 Minuten 0 Sekunden');
  });
});

describe('Wellenform: Spitzen und Spalten', () => {
  it('Minimum und Maximum je Fenster, Spalten über mehrere Fenster', () => {
    const x = new Float32Array([0.1, -0.5, 0.3, 0.9, -0.2, 0, 0.4, -0.8]);
    const sp = spitzen(x, 1000, 2); // 2 Samples je Fenster
    expect(Array.from(sp.min)).toEqual([-0.5, 0, -0.2, -0.8].map(Math.fround));
    expect(Array.from(sp.max)).toEqual([0.1, 0.9, 0, 0.4].map(Math.fround));
    const s = spalten(sp, 0, 8, 2);
    expect(Array.from(s.max)).toEqual([0.9, 0.4].map(Math.fround));
    expect(Array.from(s.min)).toEqual([-0.5, -0.8].map(Math.fround));
    // außerhalb der Datei: Stille
    expect(Array.from(spalten(sp, 100, 200, 3).max)).toEqual([0, 0, 0]);
  });

  it('Mono als Mittelwert der Kanäle', () => {
    expect(Array.from(mono([new Float32Array([1, 0.5]), new Float32Array([0, 0.5])]))).toEqual([0.5, 0.5]);
    const k = new Float32Array([0.2]);
    expect(mono([k])).toBe(k);
  });
});

describe('Ablauf mit synthetischem Testton: Grenzen vorschlagen, Mitklopfen einrasten', () => {
  const x = signal([
    { ms: 300, ton: false },
    { ms: 1000, ton: true },
    { ms: 700, ton: false },
    { ms: 1000, ton: true },
    { ms: 700, ton: false },
    { ms: 1000, ton: true },
    { ms: 300, ton: false },
  ]);
  const r = lautstaerke(x, 8000);

  it('drei Verse: Grenzen in den Pausen, als Verszeiten speicherbar', () => {
    const g = versgrenzen(r, 3);
    const punkte = [g[0].startMs, ...g.map((v) => v.endeMs)];
    expect(Math.abs(punkte[1] - 1650)).toBeLessThanOrEqual(40);
    expect(Math.abs(punkte[2] - 3350)).toBeLessThanOrEqual(40);
    expect(pruefeVerszeiten(verszeitenAusPunkten(punkte), 3, 5000)).toBeNull();
  });

  it('Klopfen bei 0,7-fach: Medienzeit rastet am Einsatz ein und ergibt gültige Wortzeiten', () => {
    const e = einsaetze(r);
    expect(e.some((t) => Math.abs(t - 2000) <= 20)).toBe(true);
    // zwei „Wörter“: Einsatz bei 2000 ms, zweites Wort ohne Einsatz (bleibt bei der Klopfzeit)
    const angeklopft = rasteEin([2090, 2500], 1, e);
    expect(angeklopft[0]).toBe(e.find((t) => Math.abs(t - 2000) <= 20));
    expect(angeklopft[1]).toBe(2500);
    const anfaenge = bereinigeAnfaenge(angeklopft, { startMs: 1650, endeMs: 3350 });
    expect(pruefeWortanfaenge(anfaenge, 2, { startMs: 1650, endeMs: 3350 })).toBeNull();
  });
});

describe('Kennung und Formular der Rezitation', () => {
  it('bildet die Kennung aus dem Namen', () => {
    expect(kennungAus('Eigene Rezitation 2026')).toBe('eigene-rezitation-2026');
    expect(kennungAus('Öğrenci Çalışması')).toBe('oegrenci-calismasi');
    expect(kennungAus('  !! ')).toBe('rezitation');
    expect(kennungAus('x')).toBe('rezitation-x');
    expect(kennungAus('a'.repeat(60))).toHaveLength(36);
  });

  it('prüft Pflichtfelder, Art und Kennung', () => {
    const basis = { nameDe: 'Eigene Rezitation', rezitator: '[Name]', art: 'eigen', lizenz: '[Lizenz]' };
    expect(rezitationSchema.safeParse(basis).success).toBe(true);
    expect(rezitationSchema.safeParse({ ...basis, art: 'fremd' }).success).toBe(false);
    expect(rezitationSchema.safeParse({ ...basis, kennung: 'Mit Leerzeichen' }).success).toBe(false);
    expect(rezitationSchema.safeParse({ ...basis, kennung: '-x-' }).success).toBe(false);
    expect(rezitationSchema.safeParse({ ...basis, kennung: 'IMAM-2026' }).data?.kennung).toBe('imam-2026');
    const leer = rezitationSchema.safeParse({ ...basis, nameDe: '' });
    expect(leer.error?.issues[0].message).toBe('pflicht');
  });
});
