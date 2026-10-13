import { describe, expect, it } from 'vitest';
import { girocodeNutzlast, ibanAnzeige, ibanGueltig } from '@/lib/spenden/girocode';

// Beispiel-IBAN aus der Dokumentation der Deutschen Bundesbank (keine echte Kontoverbindung der Gemeinde)
const IBAN = 'DE02120300000000202051';

describe('GiroCode (EPC-QR)', () => {
  it('prüft IBANs mit Prüfziffer', () => {
    expect(ibanGueltig('de02 1203 0000 0000 2020 51')).toBe(IBAN);
    expect(ibanGueltig('DE03120300000000202051')).toBeNull();
    expect(ibanGueltig('kein')).toBeNull();
    expect(ibanAnzeige(IBAN)).toBe('DE02 1203 0000 0000 2020 51');
  });

  it('Nutzlast nach EPC069-12 Version 002', () => {
    expect(girocodeNutzlast({ empfaenger: 'IGMG Wetzlar e. V.', iban: IBAN, zweck: 'Spende Moschee', betrag: 25 })).toBe(
      ['BCD', '002', '1', 'SCT', '', 'IGMG Wetzlar e. V.', IBAN, 'EUR25.00', '', '', 'Spende Moschee'].join('\n'),
    );
    expect(girocodeNutzlast({ empfaenger: 'X', iban: IBAN, zweck: 'Zweck' })?.split('\n')[7]).toBe('');
  });

  it('weist ungültige Daten ab', () => {
    expect(girocodeNutzlast({ empfaenger: '', iban: IBAN, zweck: 'x' })).toBeNull();
    expect(girocodeNutzlast({ empfaenger: 'X', iban: IBAN, zweck: 'x'.repeat(141) })).toBeNull();
    expect(girocodeNutzlast({ empfaenger: 'X', iban: IBAN, zweck: 'x', betrag: 0 })).toBeNull();
  });
});
