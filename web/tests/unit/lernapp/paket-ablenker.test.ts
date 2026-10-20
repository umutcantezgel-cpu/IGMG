import { describe, expect, it } from 'vitest';
import { type BauEingabe, type BauEintrag, type BauUebersetzung, baueEinheit } from '@/lib/lernapp/paket/bauen';

/**
 * Wortbank-Ablenker in die Ausgangssprache (Gegenprüfung L1): Sie kommen nur aus Übersetzungen, deren Zieleintrag selbst
 * sichtbar ist. Ein Eintrag mit Religionsbezug ohne zwei Freigaben bleibt verborgen – seine Übersetzung liefert dann auch
 * keine Kacheln. Neutrale Testwörter.
 */
const basis = { status: 'veroeffentlicht' as const, verfasstVon: null, pruefungen: [] };
const eintrag = (schluessel: string, text: string, religionsbezug = false): BauEintrag => ({
  ...basis,
  inhaltHash: `h-${schluessel}`,
  religionsbezug,
  art: schluessel.includes('.s') ? 'satz' : 'lemma',
  schluessel,
  text,
  quelle: 'test:paket-ablenker',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});
const uebersetzung = (bezug: string, text: string): BauUebersetzung => ({
  ...basis,
  inhaltHash: `u-${bezug}`,
  religionsbezug: false,
  bezug,
  text,
  alternativen: [],
  quelle: 'test:paket-ablenker',
  lizenz: 'CC-BY-SA-4.0',
  namensnennung: null,
});

function eingabe(verborgen: boolean): BauEingabe {
  const e = [eintrag('tr.a1.e01.s0001', 'Ev büyük.'), eintrag('tr.a1.e01.w001', 'masa'), eintrag('tr.a1.e01.w002', 'kalem', verborgen)];
  const u = [
    uebersetzung('tr.a1.e01.s0001', 'Das Haus ist groß.'),
    uebersetzung('tr.a1.e01.w001', 'Tisch'),
    uebersetzung('tr.a1.e01.w002', 'Bleistift'),
  ];
  return {
    richtung: 'tr-aus-de',
    einheit: {
      ...basis,
      inhaltHash: 'einheit',
      religionsbezug: false,
      schluessel: 'tr.a1.e01',
      stufe: 'a1',
      reihenfolge: 1,
      thema: { de: 'Probe' },
      symbol: null,
      nurFuerAusgang: null,
    },
    lektionen: [
      {
        ...basis,
        inhaltHash: 'lektion',
        religionsbezug: false,
        schluessel: 'tr.a1.e01.l01',
        art: 'lektion',
        ziel: {},
        aufgaben: [
          {
            ...basis,
            inhaltHash: 'aufgabe',
            religionsbezug: false,
            schluessel: 'tr.a1.e01.l01.a01',
            typ: 'wortbank',
            daten: { anweisung: 'uebersetze', satz: 'tr.a1.e01.s0001', nach: 'ausgang' },
          },
        ],
      },
    ],
    eintraege: new Map(e.map((x) => [x.schluessel, x])),
    uebersetzungen: new Map(u.map((x) => [x.bezug, x])),
    tipps: [],
    audio: new Map(),
  };
}

const kacheln = (verborgen: boolean) => {
  const a = baueEinheit(eingabe(verborgen), { ungeprueftZeigen: false })!.paket.lektionen[0]!.aufgaben[0]!;
  return a.typ === 'wortbank' ? a.kacheln : [];
};

describe('Wortbank-Ablenker nur aus sichtbaren Zieleinträgen', () => {
  it('sichtbarer Zieleintrag: seine Übersetzung liefert Kacheln', () => {
    expect(kacheln(false)).toEqual(expect.arrayContaining(['Tisch', 'Bleistift']));
  });

  it('Zieleintrag mit Religionsbezug ohne Freigaben: keine Kachel aus seiner Übersetzung', () => {
    const k = kacheln(true);
    expect(k).toContain('Tisch');
    expect(k).not.toContain('Bleistift');
  });
});
