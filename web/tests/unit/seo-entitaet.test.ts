import { describe, expect, it } from 'vitest';
import { ENTITAET } from '@/lib/seo/entitaet';
import de from '../../messages/de.json';
import en from '../../messages/en.json';
import tr from '../../messages/tr.json';

/** Entitätsdaten (Plan Marktstart, Welle 1): nur Belegtes, Namen in allen Sprachen stimmig, Dachverband laut Impressum. */
describe('Entitätsdaten der Gemeinde', () => {
  it('Marke, Gründungsjahr und Belege', () => {
    expect(ENTITAET.kurzname).toBe('IGMG Wetzlar');
    expect(ENTITAET.gruendung).toBe('1978');
    expect(ENTITAET.gruendungBeleg).toMatch(/^https:\/\/www\.igmg\.org\//);
    expect(ENTITAET.regionalverband).toEqual({ name: 'IGMG Regionalverband Hessen', beleg: ENTITAET.gruendungBeleg, stand: '2008-04-07' });
  });

  it('der lokalisierte Moscheename steht in messages unter dem Schlüssel und ist auch alternateName', () => {
    expect(ENTITAET.moscheeNameSchluessel).toBe('meta.moscheeName');
    const namen = [de, tr, en].map((m) => m.meta.moscheeName);
    expect(namen).toEqual(['Fatih-Moschee Wetzlar', 'Wetzlar Fatih Camii', 'Fatih Mosque Wetzlar']);
    for (const name of namen) expect(ENTITAET.alternateName).toContain(name);
    for (const name of ENTITAET.alternateName) expect(name).toContain('Wetzlar');
  });

  it('Dachverband mit Anschrift und Register, ohne Personen', () => {
    expect(ENTITAET.dachverband).toEqual({
      name: 'Islamische Gemeinschaft Millî Görüş e.V.',
      alternateName: 'IGMG',
      url: 'https://www.igmg.org/',
      adresse: { strasse: 'Colonia-Allee 3', plz: '51067', ort: 'Köln', land: 'DE' },
      register: 'Amtsgericht Köln, VR 17018',
    });
  });
});
