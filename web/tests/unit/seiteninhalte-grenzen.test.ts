import type { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { kontaktInhalt, SEITENINHALT } from '@/lib/validierung/seiteninhalte';
import { schema as impressum } from '@/lib/validierung/seiteninhalte/impressum';
import { schema as igmg } from '@/lib/validierung/seiteninhalte/igmg';
import { schema as organisation } from '@/lib/validierung/seiteninhalte/organisation';
import { schema as projekte } from '@/lib/validierung/seiteninhalte/projekte';
import { schema as ueberUns } from '@/lib/validierung/seiteninhalte/ueber-uns';
import { schema as vorstand } from '@/lib/validierung/seiteninhalte/vorstand';

/**
 * Obergrenzen, Formate und Wertebereiche der Seiteninhalte (Befund Tor B/C SP-C2 B6). Für jede Obergrenze gilt: die
 * Anzahl selbst ist erlaubt, eine mehr wird am Listenpfad abgelehnt. Die Standardwerte aller Bereiche bleiben gültig.
 * Testpersonen und Adressen sind fiktiv (G-04).
 */

/** Liste aus n gleichen, gültigen Einträgen. */
const liste = (n: number, eintrag: () => unknown) => Array.from({ length: n }, eintrag);

/** Meldet die Prüfung eine Obergrenze (too_big) genau an diesem Listenpfad? */
function zuVieleAm(schema: z.ZodType, wert: unknown, pfad: string): boolean {
  const ergebnis = schema.safeParse(wert);
  return !ergebnis.success && ergebnis.error.issues.some((befund) => befund.code === 'too_big' && befund.path.join('.') === pfad);
}

/** Eine gültige Öffnungszeile; Beginn, Ende und Wochentage sind frei wählbar. */
const zeile = (start = '', ende = '', von = [1]) => ({ tage: { de: 'Testtage' }, zeiten: '09:00–22:00 Uhr', von, start, ende });

describe('Kontaktdaten', () => {
  it('oeffnungszeiten: höchstens 14 Zeilen', () => {
    expect(kontaktInhalt.safeParse({ oeffnungszeiten: liste(14, () => zeile()) }).success).toBe(true);
    expect(zuVieleAm(kontaktInhalt, { oeffnungszeiten: liste(15, () => zeile()) }, 'oeffnungszeiten')).toBe(true);
  });

  it('oeffnungszeiten.von: höchstens 7 Wochentage', () => {
    expect(kontaktInhalt.safeParse({ oeffnungszeiten: [zeile('', '', [0, 1, 2, 3, 4, 5, 6])] }).success).toBe(true);
    expect(zuVieleAm(kontaktInhalt, { oeffnungszeiten: [zeile('', '', [0, 1, 2, 3, 4, 5, 6, 0])] }, 'oeffnungszeiten.0.von')).toBe(true);
  });

  it('oeffnungszeiten.start und .ende: leer oder HH:MM von 00:00 bis 23:59; Standard ist leer', () => {
    for (const zeit of ['', '00:00', '09:05', '23:59']) {
      expect(kontaktInhalt.safeParse({ oeffnungszeiten: [zeile(zeit, zeit)] }).success).toBe(true);
    }
    for (const zeit of ['24:00', '9:5', '9:05', '12:60', '0905']) {
      expect(kontaktInhalt.safeParse({ oeffnungszeiten: [zeile(zeit, '22:00')] }).success).toBe(false);
      expect(kontaktInhalt.safeParse({ oeffnungszeiten: [zeile('09:00', zeit)] }).success).toBe(false);
    }
    const ohneZeiten = kontaktInhalt.parse({ oeffnungszeiten: [{ tage: { de: 'Testtage' }, zeiten: 'Testzeit', von: [] }] });
    expect(ohneZeiten.oeffnungszeiten[0]).toMatchObject({ start: '', ende: '' });
  });

  it('angebote: höchstens 20 Einträge', () => {
    const angebot = () => ({ de: 'Testangebot' });
    expect(kontaktInhalt.safeParse({ angebote: liste(20, angebot) }).success).toBe(true);
    expect(zuVieleAm(kontaktInhalt, { angebote: liste(21, angebot) }, 'angebote')).toBe(true);
  });

  it('email: gültige Adresse ohne Randleerzeichen, Standard info@igmg-wetzlar.de', () => {
    expect(kontaktInhalt.parse({}).email).toBe('info@igmg-wetzlar.de');
    expect(kontaktInhalt.parse({ email: '  testperson@example.test  ' }).email).toBe('testperson@example.test');
    expect(kontaktInhalt.safeParse({ email: 'kein-mail' }).success).toBe(false);
    expect(kontaktInhalt.safeParse({ email: '' }).success).toBe(false);
    expect(kontaktInhalt.safeParse({ email: 'testperson@example.test?bcc=andere@example.test' }).success).toBe(false);
  });

  it('koordinaten: Breite −90 bis 90, Länge −180 bis 180, nur endliche Zahlen', () => {
    const mit = (breite: number, laenge: number) => kontaktInhalt.safeParse({ koordinaten: { breite, laenge } }).success;
    expect(mit(90, 180)).toBe(true);
    expect(mit(-90, -180)).toBe(true);
    expect(mit(50.5, 8.5)).toBe(true);
    expect(mit(91, 8.5)).toBe(false);
    expect(mit(-91, 8.5)).toBe(false);
    expect(mit(50.5, 181)).toBe(false);
    expect(mit(50.5, -181)).toBe(false);
    expect(mit(Number.NaN, 8.5)).toBe(false);
    expect(mit(50.5, Number.POSITIVE_INFINITY)).toBe(false);
  });
});

describe('Vorstand', () => {
  const mitglied = () => ({ name: 'Testperson Eins', funktion: { de: 'Vorsitz' } });
  const amtszeit = () => ({ name: 'Testperson Eins', von: '2020' });

  it('vorstand: höchstens 40 Mitglieder', () => {
    expect(vorstand.safeParse({ vorstand: liste(40, mitglied) }).success).toBe(true);
    expect(zuVieleAm(vorstand, { vorstand: liste(41, mitglied) }, 'vorstand')).toBe(true);
  });

  it('vorsitzende: höchstens 40 Amtszeiten', () => {
    expect(vorstand.safeParse({ vorsitzende: liste(40, amtszeit) }).success).toBe(true);
    expect(zuVieleAm(vorstand, { vorsitzende: liste(41, amtszeit) }, 'vorsitzende')).toBe(true);
  });

  it('aufgaben: höchstens 20 je Mitglied', () => {
    const mit = (n: number) => ({ vorstand: [{ ...mitglied(), aufgaben: liste(n, () => ({ de: 'Testaufgabe' })) }] });
    expect(vorstand.safeParse(mit(20)).success).toBe(true);
    expect(zuVieleAm(vorstand, mit(21), 'vorstand.0.aufgaben')).toBe(true);
  });

  it('erfolge: höchstens 30 je Amtszeit', () => {
    const mit = (n: number) => ({ vorsitzende: [{ ...amtszeit(), erfolge: liste(n, () => ({ de: 'Testerfolg' })) }] });
    expect(vorstand.safeParse(mit(30)).success).toBe(true);
    expect(zuVieleAm(vorstand, mit(31), 'vorsitzende.0.erfolge')).toBe(true);
  });

  it('E-Mail je Mitglied: leer oder gültige Adresse', () => {
    const mit = (email: string) => vorstand.safeParse({ vorstand: [{ ...mitglied(), email }] }).success;
    expect(mit('')).toBe(true);
    expect(mit('testperson.eins@example.test')).toBe(true);
    expect(mit('kein-mail')).toBe(false);
  });
});

describe('Über uns', () => {
  const absatz = () => ({ absatz: { de: 'Testabsatz' } });
  const zeitEintrag = () => ({ kennzeichnung: { de: '1976' }, titel: { de: 'Testereignis' }, bildbeschreibung: { de: 'Testbild' } });
  const wert = () => ({ titel: { de: 'Testwert' }, beschreibung: { de: 'Testbeschreibung' } });

  it('geschichte.absaetze: höchstens 20', () => {
    const mit = (n: number) => ({ geschichte: { absaetze: liste(n, absatz) } });
    expect(ueberUns.safeParse(mit(20)).success).toBe(true);
    expect(zuVieleAm(ueberUns, mit(21), 'geschichte.absaetze')).toBe(true);
  });

  it('gemeinschaft.absaetze: höchstens 20', () => {
    const mit = (n: number) => ({ gemeinschaft: { absaetze: liste(n, absatz) } });
    expect(ueberUns.safeParse(mit(20)).success).toBe(true);
    expect(zuVieleAm(ueberUns, mit(21), 'gemeinschaft.absaetze')).toBe(true);
  });

  it('zeitleiste: höchstens 30', () => {
    expect(ueberUns.safeParse({ zeitleiste: liste(30, zeitEintrag) }).success).toBe(true);
    expect(zuVieleAm(ueberUns, { zeitleiste: liste(31, zeitEintrag) }, 'zeitleiste')).toBe(true);
  });

  it('werte: höchstens 30', () => {
    expect(ueberUns.safeParse({ werte: liste(30, wert) }).success).toBe(true);
    expect(zuVieleAm(ueberUns, { werte: liste(31, wert) }, 'werte')).toBe(true);
  });
});

describe('Projekte', () => {
  it('einrichtungen: höchstens 30', () => {
    const mit = (n: number) => ({ projekt: { einrichtungen: liste(n, () => ({ de: 'Testeinrichtung' })) } });
    expect(projekte.safeParse(mit(30)).success).toBe(true);
    expect(zuVieleAm(projekte, mit(31), 'projekt.einrichtungen')).toBe(true);
  });

  it('meilensteine: höchstens 30', () => {
    const meilenstein = () => ({ titel: { de: 'Testmeilenstein' }, beschreibung: { de: 'Testbeschreibung' }, datum: { de: '2026' } });
    expect(projekte.safeParse({ meilensteine: liste(30, meilenstein) }).success).toBe(true);
    expect(zuVieleAm(projekte, { meilensteine: liste(31, meilenstein) }, 'meilensteine')).toBe(true);
  });
});

describe('E-Mail-Angaben in den Teil-Schemata, die in mailto-Links landen können', () => {
  /** Leer, der Platzhalter des Standardwerts oder eine gültige Adresse sind erlaubt; alles andere nicht. */
  function pruefeEmailAngabe(mit: (email: string) => boolean, platzhalter: string) {
    expect(mit('')).toBe(true);
    expect(mit(platzhalter)).toBe(true);
    expect(mit('testperson.eins@example.test')).toBe(true);
    expect(mit('kein-mail')).toBe(false);
    expect(mit('testperson@example.test?bcc=andere@example.test')).toBe(false);
  }

  const impressumMit = (email: string) => {
    const standard = impressum.parse({});
    return impressum.safeParse({ ...standard, verantwortlich: { ...standard.verantwortlich, email } }).success;
  };
  const igmgMit = (email: string) => {
    const standard = igmg.parse({});
    return igmg.safeParse({ ...standard, kontakt: { ...standard.kontakt, email } }).success;
  };
  const organisationMit = (email: string) => {
    const standard = organisation.parse({});
    return organisation.safeParse({ ...standard, kontakt: { ...standard.kontakt, email } }).success;
  };

  it('Impressum (verantwortlich.email)', () => pruefeEmailAngabe(impressumMit, '[E-Mail-Adresse]'));
  it('IGMG-Zentrale (kontakt.email)', () => pruefeEmailAngabe(igmgMit, '[E-Mail]'));
  it('Organisation (kontakt.email)', () => pruefeEmailAngabe(organisationMit, '[E-Mail]'));
});

describe('Standardwerte', () => {
  for (const [bereich, schema] of Object.entries(SEITENINHALT)) {
    it(`${bereich}: Standardwerte sind gültig und bleiben beim erneuten Lesen gültig`, () => {
      const standard = schema.parse({});
      expect(schema.safeParse(standard).success).toBe(true);
    });
  }
});
