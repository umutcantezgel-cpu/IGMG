import { describe, expect, it } from 'vitest';
import { EIGENE_EINWILLIGUNG_FRIST_TAGE, einwilligungGilt, einwilligungsLage } from '@/lib/konto/sechzehn';

/** D-11: Einwilligung vor und nach dem 16. Geburtstag (Eltern → Übergang 30 Tage → eigene). */
describe('Einwilligung um den 16. Geburtstag', () => {
  it('Lage: ohne Datum und vor 16 Eltern, dann 30 Tage Übergang, danach eigene', () => {
    expect(EIGENE_EINWILLIGUNG_FRIST_TAGE).toBe(30);
    expect(einwilligungsLage(null, '2026-10-13')).toBe('eltern');
    expect(einwilligungsLage('2026-10-14', '2026-10-13')).toBe('eltern');
    expect(einwilligungsLage('2026-10-13', '2026-10-13')).toBe('uebergang');
    expect(einwilligungsLage('2026-09-14', '2026-10-13')).toBe('uebergang');
    expect(einwilligungsLage('2026-09-13', '2026-10-13')).toBe('eigene');
    expect(einwilligungsLage('2026-02-01', '2026-03-03')).toBe('eigene');
  });

  it('vor 16 und im Übergang zählt jede gültige Einwilligung, danach nur die eigene', () => {
    const eltern = [{ erteiltVon: 'mutter' }];
    const selbst = [{ erteiltVon: 'kind' }];
    expect(einwilligungGilt('eltern', eltern, 'kind')).toBe(true);
    expect(einwilligungGilt('uebergang', eltern, 'kind')).toBe(true);
    expect(einwilligungGilt('eigene', eltern, 'kind')).toBe(false);
    expect(einwilligungGilt('eigene', [...eltern, ...selbst], 'kind')).toBe(true);
    expect(einwilligungGilt('eigene', [{ erteiltVon: null }], null)).toBe(false);
    expect(einwilligungGilt('eltern', [], 'kind')).toBe(false);
  });
});
