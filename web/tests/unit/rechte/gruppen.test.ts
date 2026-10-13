import { describe, expect, it } from 'vitest';
import { GRUPPEN_AKTIONEN, darfInGruppe, sichtbareGruppen, type GruppenKontext } from '@/lib/rechte/gruppen';
import {
  SITZUNG_GEMEINDE_MS,
  SITZUNG_KIND_MS,
  SITZUNG_LEHRKRAFT_MS,
  SITZUNG_VERWALTUNG_MS,
  sitzungAbgelaufen,
  sitzungsGrenzeMs,
} from '@/lib/rechte/sitzung';

const G1 = 'gruppe-1';
const G2 = 'gruppe-2';

function kontext(teil: Partial<GruppenKontext>): GruppenKontext {
  return { benutzerId: 'u', leitung: new Map(), eigeneLernendeId: null, eigeneGruppen: new Set(), kinder: new Map(), ...teil };
}

const lehrkraft = kontext({ leitung: new Map([[G1, 'lehrkraft']]) });
const aufsicht = kontext({ leitung: new Map([[G1, 'aufsicht']]) });
const schueler = kontext({ eigeneLernendeId: 'kind-a', eigeneGruppen: new Set([G1]) });
const eltern = kontext({ kinder: new Map([['kind-b', new Set([G1])]]) });
const fremd = kontext({});

describe('Gruppenrechte (ADR 0026)', () => {
  it('ohne Bezug zur Gruppe ist nichts erlaubt', () => {
    for (const a of GRUPPEN_AKTIONEN) expect(darfInGruppe(fremd, a, G1, { lernendeId: 'kind-a' })).toBe(false);
  });

  it('Bezüge gelten nur für die eigene Gruppe', () => {
    for (const k of [lehrkraft, aufsicht, schueler, eltern]) {
      for (const a of GRUPPEN_AKTIONEN) expect(darfInGruppe(k, a, G2, { lernendeId: 'kind-a' })).toBe(false);
    }
  });

  it('Schüler: Gruppenkanal ja, Elternkanal nein, nur eigene Anwesenheit', () => {
    expect(darfInGruppe(schueler, 'chat.gruppe.schreiben', G1)).toBe(true);
    expect(darfInGruppe(schueler, 'chat.eltern.lesen', G1)).toBe(false);
    expect(darfInGruppe(schueler, 'anwesenheit.sehen', G1, { lernendeId: 'kind-a' })).toBe(true);
    expect(darfInGruppe(schueler, 'anwesenheit.sehen', G1, { lernendeId: 'kind-b' })).toBe(false);
    expect(darfInGruppe(schueler, 'chat.moderieren', G1)).toBe(false);
  });

  it('Eltern: Elternkanal ja, Kinderkanal nein, nur das eigene Kind', () => {
    expect(darfInGruppe(eltern, 'chat.eltern.schreiben', G1)).toBe(true);
    expect(darfInGruppe(eltern, 'chat.gruppe.lesen', G1)).toBe(false);
    expect(darfInGruppe(eltern, 'fortschritt.sehen', G1, { lernendeId: 'kind-b' })).toBe(true);
    expect(darfInGruppe(eltern, 'fortschritt.sehen', G1, { lernendeId: 'kind-a' })).toBe(false);
    expect(darfInGruppe(eltern, 'fehlmeldung.anlegen', G1, { lernendeId: 'kind-b' })).toBe(true);
    expect(darfInGruppe(eltern, 'fehlmeldung.anlegen', G1, { lernendeId: 'kind-a' })).toBe(false);
  });

  it('Aufsicht: moderiert und erfasst Anwesenheit, aber keinen Fortschritt', () => {
    expect(darfInGruppe(aufsicht, 'chat.moderieren', G1)).toBe(true);
    expect(darfInGruppe(aufsicht, 'anwesenheit.erfassen', G1)).toBe(true);
    expect(darfInGruppe(aufsicht, 'fortschritt.erfassen', G1)).toBe(false);
    expect(darfInGruppe(aufsicht, 'fortschritt.sehen', G1, { lernendeId: 'kind-a' })).toBe(false);
  });

  it('Lehrkraft darf alles in der eigenen Gruppe außer Fehlmeldungen der Eltern', () => {
    for (const a of GRUPPEN_AKTIONEN) {
      expect(darfInGruppe(lehrkraft, a, G1, { lernendeId: 'kind-a' })).toBe(a !== 'fehlmeldung.anlegen');
    }
  });

  it('sichtbare Gruppen vereinen Leitung, eigene Gruppen und Gruppen der Kinder', () => {
    const k = kontext({ leitung: new Map([[G1, 'lehrkraft']]), kinder: new Map([['x', new Set([G2])]]) });
    expect([...sichtbareGruppen(k)].sort()).toEqual([G1, G2]);
  });
});

describe('Sitzungsgrenzen je Kontoart', () => {
  it('die strengste Grenze gilt', () => {
    expect(sitzungsGrenzeMs({ verwaltung: true, gemeindeRollen: ['lehrkraft'], istKind: false })).toBe(SITZUNG_VERWALTUNG_MS);
    expect(sitzungsGrenzeMs({ verwaltung: false, gemeindeRollen: ['lehrkraft', 'eltern'], istKind: false })).toBe(SITZUNG_LEHRKRAFT_MS);
    expect(sitzungsGrenzeMs({ verwaltung: false, gemeindeRollen: ['schueler'], istKind: true })).toBe(SITZUNG_KIND_MS);
    expect(sitzungsGrenzeMs({ verwaltung: false, gemeindeRollen: ['gemeinde'], istKind: false })).toBe(SITZUNG_GEMEINDE_MS);
  });

  it('Verwaltung: nach 8 Stunden abgelaufen, absolut ab Anmeldung', () => {
    const start = new Date('2026-10-13T08:00:00Z');
    const konto = { verwaltung: true, gemeindeRollen: [], istKind: false };
    expect(sitzungAbgelaufen(start, konto, new Date('2026-10-13T15:59:59Z'))).toBe(false);
    expect(sitzungAbgelaufen(start, konto, new Date('2026-10-13T16:00:01Z'))).toBe(true);
  });
});
