import { describe, expect, it } from 'vitest';
import { bicGueltig, spendenAnsicht } from '@/lib/spenden/ansicht';
import { EINSTELLUNG, spendenEinstellung } from '@/lib/validierung/einstellungen';
import { spendenAusFormular, spendenFormularWerte } from '@/lib/validierung/spenden';

/** Spenden (AUFTRAG 3.10, MN-13): Einstellung, Formular und Ansicht – ohne gültige IBAN kein GiroCode. */
const IBAN = 'DE89370400440532013000'; // Prüf-IBAN aus der Norm, keine echte Bankverbindung

describe('Einstellung „spenden“', () => {
  it('ist registriert; leer → Standardwerte (keine Bankverbindung)', () => {
    expect(EINSTELLUNG.spenden.schluessel).toBe('spenden');
    expect(spendenEinstellung.parse({})).toEqual({ empfaenger: '', iban: '', bic: '', zwecke: [] });
  });

  it('Verwendungszweck höchstens 140 Zeichen, höchstens 6 Zwecke', () => {
    const zweck = { titel: { de: 'Moschee' }, verwendungszweck: 'x'.repeat(141) };
    expect(spendenEinstellung.safeParse({ zwecke: [zweck] }).success).toBe(false);
    const gut = { ...zweck, verwendungszweck: 'Spende Moschee' };
    expect(spendenEinstellung.safeParse({ zwecke: Array(7).fill(gut) }).success).toBe(false);
  });
});

describe('Ansicht', () => {
  it('ohne IBAN oder mit falscher Prüfziffer: null (Platzhalter, kein QR)', () => {
    expect(spendenAnsicht(spendenEinstellung.parse({}), 'Spende')).toBeNull();
    expect(spendenAnsicht(spendenEinstellung.parse({ empfaenger: 'Verein', iban: 'DE89370400440532013001' }), 'Spende')).toBeNull();
    // IBAN gültig, aber ohne Empfänger: kein GiroCode
    expect(spendenAnsicht(spendenEinstellung.parse({ iban: IBAN }), 'Spende')).toBeNull();
  });

  it('gültig ohne Zwecke: ein allgemeiner Zweck mit EPC-Nutzlast ohne Betrag', () => {
    const a = spendenAnsicht(spendenEinstellung.parse({ empfaenger: '[Verein]', iban: 'de89 3704 0044 0532 0130 00' }), 'Spende')!;
    expect(a.ibanAnzeige).toBe('DE89 3704 0044 0532 0130 00');
    expect(a.bic).toBeNull();
    expect(a.zwecke).toHaveLength(1);
    expect(a.zwecke[0].nutzlast.split('\n')).toEqual(['BCD', '002', '1', 'SCT', '', '[Verein]', IBAN, '', '', '', 'Spende']);
  });

  it('Zwecke mit Titel, Beschreibung und BIC', () => {
    const a = spendenAnsicht(
      spendenEinstellung.parse({
        empfaenger: '[Verein]',
        iban: IBAN,
        bic: 'cobadeffxxx',
        zwecke: [{ titel: { de: 'Moschee', tr: 'Cami' }, beschreibung: { de: 'Für den Bau' }, verwendungszweck: 'Spende Moscheebau' }],
      }),
      'Spende',
    )!;
    expect(a.bic).toBe('COBADEFFXXX');
    expect(a.zwecke[0]).toMatchObject({ schluessel: 'zweck-1', titel: { de: 'Moschee', tr: 'Cami' }, beschreibung: { de: 'Für den Bau' } });
    expect(a.zwecke[0].nutzlast).toContain('\nCOBADEFFXXX\n');
    expect(a.zwecke[0].nutzlast.endsWith('Spende Moscheebau')).toBe(true);
  });

  it('BIC-Prüfung: 8 oder 11 Zeichen', () => {
    expect(bicGueltig('COBADEFF')).toBe('COBADEFF');
    expect(bicGueltig('COBA DE FF XXX')).toBe('COBADEFFXXX');
    expect(bicGueltig('COBADE')).toBeNull();
  });
});

describe('Formular „Spenden“', () => {
  const basis = { empfaenger: '[Verein]', iban: IBAN, bic: '' };

  it('leere Zeilen entfallen, Übersetzungen nur wenn gefüllt', () => {
    const r = spendenAusFormular({
      ...basis,
      zweck0TitelDe: 'Moschee',
      zweck0TitelTr: 'Cami',
      zweck0Verwendungszweck: '  Spende   Moschee ',
    });
    expect(r).toEqual({
      ok: true,
      wert: { ...basis, zwecke: [{ titel: { de: 'Moschee', tr: 'Cami' }, verwendungszweck: 'Spende Moschee' }] },
    });
  });

  it('Fehler als Schlüssel: falsche IBAN, fehlender Empfänger, falsche BIC, halbe Zweck-Zeile', () => {
    expect(spendenAusFormular({ empfaenger: '', iban: 'DE00 1234', bic: 'XX' })).toEqual({
      ok: false,
      feldFehler: { iban: 'iban', empfaenger: 'pflicht', bic: 'bic' },
    });
    expect(spendenAusFormular({ ...basis, zweck1TitelEn: 'Mosque' })).toEqual({
      ok: false,
      feldFehler: { zweck1TitelDe: 'pflicht', zweck1Verwendungszweck: 'pflicht' },
    });
  });

  it('leere IBAN ist erlaubt (Spenden ausgeblendet); Startwerte spiegeln die Einstellung', () => {
    expect(spendenAusFormular({})).toEqual({ ok: true, wert: { empfaenger: '', iban: '', bic: '', zwecke: [] } });
    const w = spendenFormularWerte(
      spendenEinstellung.parse({ ...basis, zwecke: [{ titel: { de: 'Moschee' }, verwendungszweck: 'Spende' }] }),
    );
    expect(w).toMatchObject({ iban: IBAN, zweck0TitelDe: 'Moschee', zweck0Verwendungszweck: 'Spende', zweck1TitelDe: '' });
  });
});
