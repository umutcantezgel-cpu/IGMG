import { describe, expect, it } from 'vitest';
import {
  buchNummer,
  buchTeilZiel,
  enthaeltArabisch,
  gepruefteUebersetzung,
  hadithAnker,
  hadithNummerAus,
  hadithSicht,
  stelle,
  suchAusschnitt,
  TEIL_GROESSE,
  teilAnzahl,
  teilBereich,
  teilNummer,
  teilVon,
} from '@/lib/hadith/anzeige';

/**
 * Hadith-Seiten (AUFTRAG 3.3, ADR 0030): Sichtbarkeit der Gesamtsammlung über den Schalter `hadith_gesamt`, nur geprüfte
 * Übersetzungen, Anker und Bezug, Suchausschnitt im unveränderten Text. Arabische Testwörter nur aus Codepunkten
 * (Buchstaben und Harakat), keine religiösen Texte.
 */
const BA = '\u0628';
const TA = '\u062a';
const KAF = '\u0643';
const LAM = '\u0644';
const MIM = '\u0645';
const FATHA = '\u064e';
const SUKUN = '\u0652';
const wort = (...z: string[]) => z.join('');

describe('Sichtbarkeit (Schalter hadith_gesamt, MN-06)', () => {
  it('aus: keine Gesamtsammlung, keine Buchlinks – die Auswahl bleibt', () => {
    expect(hadithSicht(false, 97)).toEqual({ gesamt: false, buecherVerlinken: false, auswahl: true });
  });

  it('an: Gesamtsammlung; Bücher nur verlinkt, wenn importiert', () => {
    expect(hadithSicht(true, 97)).toEqual({ gesamt: true, buecherVerlinken: true, auswahl: true });
    expect(hadithSicht(true, 0).buecherVerlinken).toBe(false);
  });

  it('Übersetzung nur „geprueft“ und nur in der Sprache der Seite', () => {
    const liste = [
      { sprache: 'de', freigabe: 'entwurf', text: '[Entwurf]' },
      { sprache: 'de', freigabe: 'zur_pruefung', text: '[Zur Prüfung]' },
      { sprache: 'tr', freigabe: 'geprueft', text: '[Geprüft tr]' },
    ];
    expect(gepruefteUebersetzung(liste, 'de')).toBeNull();
    expect(gepruefteUebersetzung(liste, 'en')).toBeNull();
    expect(gepruefteUebersetzung(liste, 'tr')?.text).toBe('[Geprüft tr]');
    expect(gepruefteUebersetzung([...liste, { sprache: 'de', freigabe: 'geprueft', text: '[Geprüft de]' }], 'de')?.text).toBe(
      '[Geprüft de]',
    );
  });
});

describe('Adressen und Bezug', () => {
  it('Anker übernimmt die Nummer der Quelle unverändert', () => {
    expect(hadithAnker('1')).toBe('h-1');
    expect(hadithAnker('402.2')).toBe('h-402.2');
  });

  it('Buchnummer nur kanonisch (1–999)', () => {
    expect(buchNummer('1')).toBe(1);
    expect(buchNummer('97')).toBe(97);
    for (const roh of ['0', '01', '2a', '', '_', '1.5', '-3', '1000']) expect(buchNummer(roh)).toBeNull();
  });

  it('Teile zu je 100 Hadithen: Anzahl, Teil je Position, Bereich (Buch 64 mit 526 Hadithen → 6 Teile)', () => {
    expect(TEIL_GROESSE).toBe(100);
    expect([0, 1, 100, 101, 200, 526].map(teilAnzahl)).toEqual([1, 1, 1, 2, 2, 6]);
    expect([0, 99, 100, 199, 200, 525].map(teilVon)).toEqual([1, 1, 2, 2, 3, 6]);
    expect(teilVon(-1)).toBe(1);
    expect(teilBereich(1, 526)).toEqual({ von: 1, bis: 100 });
    expect(teilBereich(6, 526)).toEqual({ von: 501, bis: 526 });
    expect(teilBereich(2, 113)).toEqual({ von: 101, bis: 113 });
  });

  it('Teilnummer nur kanonisch 2–99 (Teil 1 ist die Buchseite)', () => {
    expect(teilNummer('2')).toBe(2);
    expect(teilNummer('99')).toBe(99);
    for (const roh of ['1', '0', '02', '100', '_', '', '2a', '-2']) expect(teilNummer(roh)).toBeNull();
  });

  it('Linkziel: Teil 1 = Buchseite, ab Teil 2 die Teiladresse, Anker optional', () => {
    expect(buchTeilZiel(4, 1)).toEqual({ pathname: '/hadith/bukhari/[buch]', params: { buch: '4' } });
    expect(buchTeilZiel(4, 1, 'h-135')).toEqual({ pathname: '/hadith/bukhari/[buch]', params: { buch: '4' }, hash: 'h-135' });
    expect(buchTeilZiel(64, 3, 'h-4300')).toEqual({
      pathname: '/hadith/bukhari/[buch]/teil/[teil]',
      params: { buch: '64', teil: '3' },
      hash: 'h-4300',
    });
  });

  it('Stelle im Buch fehlt, wenn die Quelle sie nicht nennt', () => {
    expect(stelle(1, 1)).toEqual({ buch: 1, hadith: 1 });
    expect(stelle(6, null)).toEqual({ buch: 6, hadith: null });
    expect(stelle(6, 0)).toEqual({ buch: 6, hadith: null });
  });

  it('Nummernsuche: „1“, „402.2“, „Bukhari 7“, „Buhârî 7“; sonst null', () => {
    expect(hadithNummerAus('1')).toBe('1');
    expect(hadithNummerAus(' 402.2 ')).toBe('402.2');
    expect(hadithNummerAus('Bukhari 7')).toBe('7');
    expect(hadithNummerAus('Sahih al-Bukhari 3949')).toBe('3949');
    expect(hadithNummerAus('buhari 12')).toBe('12');
    expect(hadithNummerAus('Buhârî 12')).toBe('12');
    for (const roh of ['Gebet', '12 Gebete', '12345', '1.23', '']) expect(hadithNummerAus(roh)).toBeNull();
  });

  it('erkennt arabische Buchstaben, nicht lateinische', () => {
    expect(enthaeltArabisch(wort(KAF, TA, BA))).toBe(true);
    expect(enthaeltArabisch('Gebet 12')).toBe(false);
  });
});

describe('Suchausschnitt im unveränderten Text', () => {
  const mitHarakat = wort(KAF, FATHA, TA, FATHA, BA, FATHA);
  const ohne = wort(KAF, TA, BA);
  const fuell = (n: number) => Array.from({ length: n }, () => wort(MIM, LAM));

  it('markiert das Wort mit Harakat, wenn ohne Harakat gesucht wird (und umgekehrt)', () => {
    const text = [...fuell(3), `${mitHarakat}\u060c`, ...fuell(3)].join(' ');
    for (const begriff of [ohne, mitHarakat]) {
      const a = suchAusschnitt(text, begriff);
      expect(a.teile.filter((t) => t.treffer).map((t) => t.text)).toEqual([`${mitHarakat}\u060c`]);
      expect(a.teile.map((t) => t.text).join('')).toBe(text);
      expect(a).toMatchObject({ vorn: false, hinten: false });
    }
  });

  it('kürzt um den ersten Treffer und meldet die Kürzung', () => {
    const text = [...fuell(30), mitHarakat, ...fuell(30)].join(' ');
    const a = suchAusschnitt(text, ohne, 5);
    expect(a.vorn).toBe(true);
    expect(a.hinten).toBe(true);
    expect(
      a.teile
        .map((t) => t.text)
        .join('')
        .split(' '),
    ).toHaveLength(11);
  });

  it('ohne Treffer (Nummernsuche) der Anfang des Textes; Leerzeichen nie in der Markierung', () => {
    const text = [mitHarakat, wort(BA, SUKUN), mitHarakat, ...fuell(40)].join(' ');
    const anfang = suchAusschnitt(text, '', 4);
    expect(anfang.teile.every((t) => !t.treffer)).toBe(true);
    expect(anfang).toMatchObject({ vorn: false, hinten: true });
    const zwei = suchAusschnitt(text, ohne, 4);
    expect(zwei.teile.filter((t) => t.treffer).map((t) => t.text)).toEqual([mitHarakat, mitHarakat]);
  });
});
