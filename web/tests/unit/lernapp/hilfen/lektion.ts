import type { Lektion } from '@/lib/lernapp/aufgaben/schema';

/**
 * Beispiellektion für Tests (Türkisch für Deutschsprachige, A1): neutrale Alltagswörter, je eine Aufgabe der drei in L1
 * implementierten Typen und eine L2-Aufgabe (wird übersprungen). Kein Inhalt aus echten Kursdaten.
 */
export const LEKTION: Lektion = {
  schluessel: 'tr-aus-de.a1.e01.l01',
  kurs: 'tr-aus-de',
  art: 'lektion',
  zielsprache: 'tr',
  ausgangssprache: 'de',
  titel: '[Titel der Lektion]',
  aufgaben: [
    {
      typ: 'auswahl',
      schluessel: 'tr.a1.e01.a001',
      karten: ['tr.a1.l0001'],
      anweisung: 'waehleUebersetzung',
      vorgabe: { text: 'Wasser', sprache: 'de' },
      optionen: [
        { text: 'su', sprache: 'tr' },
        { text: 'ekmek', sprache: 'tr' },
        { text: 'elma', sprache: 'tr' },
      ],
      richtig: 0,
    },
    {
      typ: 'wortbank',
      schluessel: 'tr.a1.e01.a002',
      karten: ['tr.a1.s0001'],
      anweisung: 'uebersetze',
      vorgabe: { text: 'Ich trinke Wasser.', sprache: 'de' },
      sprache: 'tr',
      loesungen: ['Su içiyorum.', 'Ben su içiyorum.'],
      kacheln: ['Su', 'içiyorum', 'Ben', 'ekmek', 'yiyorum'],
    },
    {
      typ: 'paare',
      schluessel: 'tr.a1.e01.a003',
      anweisung: 'findePaare',
      paare: [
        { links: { text: 'su', sprache: 'tr' }, rechts: { text: 'Wasser', sprache: 'de' }, karte: 'tr.a1.l0001' },
        { links: { text: 'ekmek', sprache: 'tr' }, rechts: { text: 'Brot', sprache: 'de' }, karte: 'tr.a1.l0002' },
        { links: { text: 'elma', sprache: 'tr' }, rechts: { text: 'Apfel', sprache: 'de' }, karte: 'tr.a1.l0003' },
      ],
    },
    {
      typ: 'frei',
      schluessel: 'tr.a1.e01.a004',
      vorgabe: { text: 'Brot', sprache: 'de' },
      sprache: 'tr',
      loesungen: ['ekmek'],
    },
  ],
  lexikon: ['su', 'ekmek', 'elma', 'içiyorum', 'yiyorum', 'ben'],
};
