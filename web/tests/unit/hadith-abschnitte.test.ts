import { describe, expect, it } from 'vitest';
import { abschnittAnker, hadithAbschnitte } from '@/components/website/hadith/abschnitte';

/** Nummern wie in der Quelle (Zeichenketten), fortlaufend ab `von`. */
const nummern = (von: number, anzahl: number) => Array.from({ length: anzahl }, (_, i) => String(von + i));

describe('hadithAbschnitte (Sichtabnahme Runde 2, H-6)', () => {
  it('Buch 2 (51 Hadithe ab 8): fünf Abschnitte, der Rest kommt zum letzten', () => {
    const a = hadithAbschnitte(nummern(8, 51));
    expect(a.map((x) => `${x.von}–${x.bis}`)).toEqual(['8–17', '18–27', '28–37', '38–47', '48–58']);
    expect(a.map((x) => x.anker)).toEqual(['ab-8', 'ab-18', 'ab-28', 'ab-38', 'ab-48']);
    expect(a.at(-1)).toMatchObject({ start: 40, ende: 51 });
  });

  it('ein voller Teil (100 Hadithe): zehn gleich große Abschnitte ohne Lücke', () => {
    const a = hadithAbschnitte(nummern(101, 100));
    expect(a).toHaveLength(10);
    expect(a.every((x) => x.ende - x.start === 10)).toBe(true);
    a.slice(1).forEach((x, i) => expect(x.start).toBe(a[i].ende));
  });

  it('unter 20 Hadithen bleibt die Liste ungegliedert', () => {
    expect(hadithAbschnitte(nummern(1, 7))).toEqual([]);
    expect(hadithAbschnitte(nummern(1, 19))).toEqual([]);
    expect(hadithAbschnitte(nummern(1, 20))).toHaveLength(2);
    expect(hadithAbschnitte([])).toEqual([]);
  });

  it('Anker folgt der ersten Nummer, auch bei Nummern mit Buchstaben', () => {
    expect(abschnittAnker('8')).toBe('ab-8');
    const a = hadithAbschnitte(['1', '2a', ...nummern(3, 18)]);
    expect(a[0]).toMatchObject({ anker: 'ab-1', von: '1', bis: '10' });
  });
});
