import { describe, expect, it } from 'vitest';
import { type Pruefung, RELIGIOESE_BAUSTEINE } from '@/lib/lernapp/freigabe';
import { FORMELLISTE_ID, FORMELN, type Formeln, formellisteBaustein, formellisteFrei, formellisteHash } from '@/lib/lernapp/formelliste';

/**
 * Formelliste als Ganzes (KERN 4.0 §2.3 „Formelliste“, LM-09; Stufe C N2, Z-L10): Hash über die Liste, Freigabe nur mit zwei
 * religiösen Freigaben zum aktuellen Hash und Status „freigegeben“ im Leitfaden. Einträge stammen aus dem Leitfaden selbst.
 */
const AM = new Date('2026-10-25T10:00:00Z');
const freigabe = (person: string, hash: string, extra: Partial<Pruefung> = {}): Pruefung => ({
  pruefendeId: person,
  pruefendeRollen: ['religioese_pruefung'],
  art: 'religioes',
  urteil: 'ok',
  inhaltHash: hash,
  belegeGeprueft: [],
  am: AM,
  ...extra,
});

describe('Formelliste', () => {
  const gesperrt: Formeln = { status: 'gesperrt', liste: FORMELN.liste };
  const frei: Formeln = { status: 'freigegeben', liste: FORMELN.liste };
  const hash = formellisteHash(FORMELN.liste);

  it('ist ein religiöser Baustein mit fester Kennung (UUID-Form) und Hash über die Liste', () => {
    expect(RELIGIOESE_BAUSTEINE).toContain('formelliste');
    expect(FORMELLISTE_ID).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(FORMELN.liste.length).toBeGreaterThan(30);
    expect(formellisteBaustein(FORMELN)).toEqual({ inhaltHash: hash, verfasser: [], belege: [], belegPflicht: false, art: 'formelliste' });
    // Im Repository ist die Liste gesperrt (LM-09 offen)
    expect(FORMELN.status).toBe('gesperrt');
  });

  it('Hash: jede Änderung eines Eintrags und der Reihenfolge setzt zurück; Status, NFC und Rand-Leerraum nicht', () => {
    const [erster, ...rest] = FORMELN.liste;
    expect(formellisteHash([{ ...erster!, anlass: `${String(erster!.anlass)} ` }, ...rest])).toBe(hash);
    expect(formellisteHash([{ ...erster!, begriff: erster!.begriff.normalize('NFD') }, ...rest])).toBe(hash);
    expect(formellisteHash([{ ...erster!, vorschlag: 'nicht aufnehmen' }, ...rest])).not.toBe(hash);
    expect(formellisteHash([...rest, erster!])).not.toBe(hash);
    expect(formellisteHash(rest)).not.toBe(hash);
    expect(formellisteBaustein(frei).inhaltHash).toBe(formellisteBaustein(gesperrt).inhaltHash);
  });

  it('frei nur mit zwei Freigaben zum aktuellen Hash UND Status „freigegeben“; Administration und alter Hash zählen nicht', () => {
    const zwei = [freigabe('imam', hash), freigabe('hoca', hash)];
    expect(formellisteFrei(gesperrt, zwei)).toBe(false);
    expect(formellisteFrei(frei, zwei)).toBe(true);
    expect(formellisteFrei(frei, zwei.slice(0, 1))).toBe(false);
    expect(formellisteFrei(frei, [freigabe('imam', hash), freigabe('imam', hash)])).toBe(false);
    expect(
      formellisteFrei(frei, [
        freigabe('imam', hash),
        freigabe('admin', hash, { pruefendeRollen: ['religioese_pruefung', 'administration'] }),
      ]),
    ).toBe(false);
    expect(formellisteFrei(frei, [freigabe('imam', hash), freigabe('hoca', 'b'.repeat(64))])).toBe(false);
    expect(formellisteFrei(frei, [...zwei, freigabe('dritte', hash, { urteil: 'abgelehnt' })])).toBe(false);
  });
});
