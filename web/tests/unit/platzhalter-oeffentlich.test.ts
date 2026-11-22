import { describe, expect, it } from 'vitest';
import { angabe, hatPlatzhalter, istNurPlatzhalter, ohnePlatzhalter } from '@/lib/inhalt/platzhalter';

/**
 * Platzhalter der Gemeinde „[…]“ erscheinen auf öffentlichen Seiten nicht (Vorstellung 23.11.2026): Angaben, die nur ein
 * Platzhalter sind, entfallen; in Fließtext entfällt jeder Satz mit Platzhalter. Nichts wird erfunden oder umgeschrieben.
 */
describe('angabe', () => {
  it('echte Angaben bleiben (ohne Rand)', () => {
    expect(angabe(' info@igmg-wetzlar.de ')).toBe('info@igmg-wetzlar.de');
    expect(angabe('06441 000000')).toBe('06441 000000');
  });

  it('Platzhalter, Leeres und Fehlendes ergeben null', () => {
    expect(angabe('[Telefonnummer]')).toBeNull();
    expect(angabe('[Name – Vorsitzender]')).toBeNull();
    expect(angabe('Tel. [Telefonnummer]')).toBeNull();
    expect(angabe('  ')).toBeNull();
    expect(angabe('')).toBeNull();
    expect(angabe(null)).toBeNull();
    expect(angabe(undefined)).toBeNull();
  });
});

describe('hatPlatzhalter und istNurPlatzhalter', () => {
  it('erkennen Platzhalter im Text bzw. als ganzen Text', () => {
    expect(hatPlatzhalter('Eröffnung: [Datum]')).toBe(true);
    expect(hatPlatzhalter('April 2024')).toBe(false);
    expect(hatPlatzhalter(null)).toBe(false);
    expect(istNurPlatzhalter(' [Tarih] ')).toBe(true);
    expect(istNurPlatzhalter('Eröffnung: [Datum]')).toBe(false);
  });
});

describe('ohnePlatzhalter', () => {
  it('Text ohne Platzhalter bleibt wörtlich', () => {
    const text = 'Die Fatih-Moschee ist offen für alle.  Besuche sind z. B. am 3. Oktober möglich.';
    expect(ohnePlatzhalter(text)).toBe(text);
    expect(ohnePlatzhalter('')).toBe('');
    expect(ohnePlatzhalter(null)).toBe('');
  });

  it('Sätze mit Platzhalter entfallen, die übrigen bleiben', () => {
    expect(
      ohnePlatzhalter('Die neue Fatih-Moschee ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]. Alle sind herzlich eingeladen.'),
    ).toBe('Die neue Fatih-Moschee ist fertiggestellt. Alle sind herzlich eingeladen.');
  });

  it('bleibt nichts übrig, ist das Ergebnis leer', () => {
    expect(
      ohnePlatzhalter(
        'Die neue Fatih-Moschee in [Ortsangabe – von der Gemeinde] ist fertiggestellt. Eröffnung: [Datum – von der Gemeinde]. [Kurzbeschreibung der Moschee – von der Gemeinde]',
      ),
    ).toBe('');
    expect(ohnePlatzhalter('[Telefonnummer]')).toBe('');
  });

  it('Punkte im Platzhalter, in Abkürzungen und Ordnungszahlen beenden keinen Satz', () => {
    expect(ohnePlatzhalter('Bitte rufen Sie z. B. unter [Telefonnummer] an. Danke.')).toBe('Danke.');
    expect(ohnePlatzhalter('Am 3. Oktober spricht [Name – Imam]. Beginn ist um 19 Uhr.')).toBe('Beginn ist um 19 Uhr.');
    // Punkte im Platzhalter trennen nicht; ohne Satzzeichen nach dem Platzhalter gehört der Rest zum selben Satz
    expect(ohnePlatzhalter('Wir bitten um Geduld. Hinweis: [Text. Mit Punkt.] und mehr dazu. Das hier bleibt.')).toBe(
      'Wir bitten um Geduld. Das hier bleibt.',
    );
  });

  it('Zeilen sind eigene Sätze (Listen, Absätze)', () => {
    expect(ohnePlatzhalter('Teravih: [Zeit – von der Gemeinde]\nIftar gemeinsam in der Moschee')).toBe('Iftar gemeinsam in der Moschee');
  });

  it('türkische und englische Texte', () => {
    expect(ohnePlatzhalter('Yeni Fatih Camii tamamlandı. Açılış: [Tarih – cemaatten].')).toBe('Yeni Fatih Camii tamamlandı.');
    expect(ohnePlatzhalter('The mosque is complete. Opening: [date – from the community]. Welcome!')).toBe(
      'The mosque is complete. Welcome!',
    );
  });
});
