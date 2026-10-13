import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { verschluessele } from '@/lib/krypto';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/** „Gemeinde im Blick“: nur Zahlen, kleine Werte als „< 5“, Quote erst ab 20 Einträgen. */
const { client, db } = await verwaltungsUmgebung();
const { ladeKennzahlen, schwelle } = await import('@/lib/leitung/kennzahlen');
afterAll(() => client.close());

describe('Gemeinde im Blick', () => {
  it('Schwelle', () => {
    expect(schwelle(0)).toBe(0);
    expect(schwelle(1)).toBe('< 5');
    expect(schwelle(4)).toBe('< 5');
    expect(schwelle(5)).toBe(5);
  });

  it('Kennzahlen ohne Personendaten', async () => {
    const v = verschluessele({ name: 'Testperson' });
    for (let i = 0; i < 6; i++)
      await db.insert(schema.eingang).values({ art: 'voranmeldung', datenVerschluesselt: v.daten, schluesselId: v.schluesselId });
    await db.insert(schema.eingang).values({ art: 'kontakt', datenVerschluesselt: v.daten, schluesselId: v.schluesselId });
    const k = await ladeKennzahlen(30);
    expect(k.eingaenge).toEqual({ voranmeldung: 6, kontakt: '< 5' });
    expect(k.anwesenheitsquote).toBeNull();
    expect(JSON.stringify(k)).not.toContain('Testperson');
  });
});
