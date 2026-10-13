import { describe, expect, it } from 'vitest';
import {
  chatFensterGueltig,
  chatLage,
  istDatum,
  istMindestens16,
  lernendeAusVoranmeldung,
  loeschZustand,
  naechsteReihenfolge,
  pruefeGemeindeRollen,
  sechzehnAus,
  tageZwischen,
  tauschPartner,
} from '@/lib/lernen/verwaltung';
import {
  gemeindeEinladungSchema,
  gruppeAusFormular,
  gruppeDatensatz,
  gruppeFormularWerte,
  gruppeSchema,
  termineSchema,
} from '@/lib/validierung/lernen';

/** Verwaltung „Lernen und Aufnahme“ (O-L01, H-L01…L05): reine Regeln. Alle Personendaten fiktiv (G-04). */

describe('Datum, 16. Geburtstag, Alter', () => {
  it('istDatum erkennt echte Kalendertage', () => {
    expect(istDatum('2026-02-28')).toBe(true);
    expect(istDatum('2026-02-29')).toBe(false);
    expect(istDatum('2028-02-29')).toBe(true);
    expect(istDatum('2026-13-01')).toBe(false);
    expect(istDatum('1.1.2026')).toBe(false);
  });

  it('sechzehnAus: plus 16 Jahre; 29. Februar → Schaltjahr bleibt, sonst 1. März', () => {
    expect(sechzehnAus('2012-05-17')).toBe('2028-05-17');
    expect(sechzehnAus('2012-02-29')).toBe('2028-02-29');
    expect(sechzehnAus('2084-02-29')).toBe('2100-03-01');
    expect(sechzehnAus('kein Datum')).toBeNull();
  });

  it('istMindestens16 am Stichtag (Tag des 16. Geburtstags zählt)', () => {
    expect(istMindestens16('2026-10-13', '2026-10-13')).toBe(true);
    expect(istMindestens16('2026-10-14', '2026-10-13')).toBe(false);
    expect(istMindestens16(null, '2026-10-13')).toBe(false);
  });

  it('tageZwischen', () => {
    expect(tageZwischen('2026-10-13', '2026-10-13')).toBe(0);
    expect(tageZwischen('2026-03-28', '2026-03-30')).toBe(2);
    expect(tageZwischen('2026-01-01', '2027-01-01')).toBe(365);
  });
});

describe('Gruppenchat (S-02, S-06)', () => {
  it('chatLage: aus, zu wenige Erwachsene, bereit', () => {
    expect(chatLage('aus', 0)).toEqual({ lage: 'aus', fehlen: 2 });
    expect(chatLage('offen', 0)).toEqual({ lage: 'zuWenigeErwachsene', fehlen: 2 });
    expect(chatLage('nur_lehrkraft', 1)).toEqual({ lage: 'zuWenigeErwachsene', fehlen: 1 });
    expect(chatLage('offen', 2)).toEqual({ lage: 'bereit', fehlen: 0 });
    expect(chatLage('offen', 5)).toEqual({ lage: 'bereit', fehlen: 0 });
  });

  it('chatFensterGueltig: nur innerhalb 08:00–20:00, Beginn vor Ende', () => {
    expect(chatFensterGueltig('08:00', '20:00')).toBe(true);
    expect(chatFensterGueltig('15:00', '18:30')).toBe(true);
    expect(chatFensterGueltig('07:59', '20:00')).toBe(false);
    expect(chatFensterGueltig('08:00', '20:01')).toBe(false);
    expect(chatFensterGueltig('18:00', '17:00')).toBe(false);
    expect(chatFensterGueltig('18:00', '18:00')).toBe(false);
    expect(chatFensterGueltig('8:00', '20:00')).toBe(false);
  });
});

describe('Lehrplan sortieren', () => {
  const stufen = [
    { id: 'a', reihenfolge: 1 },
    { id: 'b', reihenfolge: 2 },
    { id: 'c', reihenfolge: 5 },
  ];
  it('tauscht mit dem Nachbarn und behält die Reihenfolge-Werte', () => {
    expect(tauschPartner(stufen, 'b', 'hoch')).toEqual({ a: { id: 'b', reihenfolge: 1 }, b: { id: 'a', reihenfolge: 2 } });
    expect(tauschPartner(stufen, 'b', 'runter')).toEqual({ a: { id: 'b', reihenfolge: 5 }, b: { id: 'c', reihenfolge: 2 } });
  });
  it('am Rand und bei unbekannter ID nichts', () => {
    expect(tauschPartner(stufen, 'a', 'hoch')).toBeNull();
    expect(tauschPartner(stufen, 'c', 'runter')).toBeNull();
    expect(tauschPartner(stufen, 'x', 'hoch')).toBeNull();
  });
  it('naechsteReihenfolge hängt hinten an', () => {
    expect(naechsteReihenfolge(stufen)).toBe(6);
    expect(naechsteReihenfolge([])).toBe(1);
  });
});

describe('Aufnahme aus der Voranmeldung (O-L01)', () => {
  const eingang = {
    sprache: 'tr',
    klasse: 'grundkurs',
    geschlecht: 'weiblich',
    vorname: ' Testkind ',
    nachname: 'Beispiel',
    geburtsdatum: '2015-04-02',
    strasse: '[Straße 1]',
    plz: '35578',
    ort: 'Wetzlar',
    eltern1Name: 'Testperson Eins',
    eltern1Telefon: '0123 456',
    eltern1Email: 'Testperson.Eins@Example.test',
    eltern2Name: 'Testperson Zwei',
    eltern2Telefon: '',
    eltern2Email: '',
    geschwister: '',
    ausgefuelltVon: 'Testperson Eins',
  };
  it('Anzeigename Vorname + Initial, 16. Geburtstag, Eltern mit Adresse (klein geschrieben)', () => {
    const r = lernendeAusVoranmeldung(eingang)!;
    expect(r.anzeigename).toBe('Testkind B.');
    expect(r.sechzehnAm).toBe('2031-04-02');
    expect(r.eltern).toEqual([{ name: 'Testperson Eins', email: 'testperson.eins@example.test' }]);
    expect(r.daten).toMatchObject({
      vorname: 'Testkind',
      nachname: 'Beispiel',
      geburtsdatum: '2015-04-02',
      klasse: 'grundkurs',
      geschwister: null,
    });
    expect(r.daten.eltern).toHaveLength(2);
    expect(r.daten.eltern?.[1]).toEqual({ name: 'Testperson Zwei', telefon: null, email: null });
  });
  it('ohne Namen null; ungültiges Geburtsdatum ohne 16. Geburtstag', () => {
    expect(lernendeAusVoranmeldung({ ...eingang, nachname: '' })).toBeNull();
    const r = lernendeAusVoranmeldung({ ...eingang, geburtsdatum: '2015-02-30' })!;
    expect(r.sechzehnAm).toBeNull();
    expect(r.daten.geburtsdatum).toBeNull();
  });
});

describe('Gemeinde-Rollen und Löschanträge', () => {
  it('Kinderkonten nur „schueler“; unbekannte Rollen abgelehnt; feste Reihenfolge ohne Doppel', () => {
    expect(pruefeGemeindeRollen(['lehrkraft', 'gemeinde', 'lehrkraft'], false)).toEqual({ ok: true, rollen: ['gemeinde', 'lehrkraft'] });
    expect(pruefeGemeindeRollen(['schueler'], true)).toEqual({ ok: true, rollen: ['schueler'] });
    expect(pruefeGemeindeRollen([], true)).toEqual({ ok: true, rollen: [] });
    expect(pruefeGemeindeRollen(['eltern'], true)).toEqual({ ok: false, fehler: 'kindRollen' });
    expect(pruefeGemeindeRollen(['administration'], false)).toEqual({ ok: false, fehler: 'unbekannt' });
  });
  it('loeschZustand', () => {
    const jetzt = new Date('2026-10-13T10:00:00Z');
    expect(loeschZustand(null, jetzt)).toBe('kein');
    expect(loeschZustand(new Date('2026-10-14T10:00:00Z'), jetzt)).toBe('laeuft');
    expect(loeschZustand(new Date('2026-10-13T10:00:00Z'), jetzt)).toBe('faellig');
  });
});

describe('Formular-Schemas', () => {
  const fd = (werte: Record<string, string | string[]>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(werte)) for (const x of Array.isArray(v) ? v : [v]) f.append(k, x);
    return f;
  };
  const gueltig = {
    nameDe: 'Elifbe Mittwoch',
    chatModus: 'offen',
    chatMindestalter: '10',
    chatVon: '15:00',
    chatBis: '19:00',
    status: 'aktiv',
    wochentage: ['3', '6', '3'],
    uhrzeitVon: '16:00',
    uhrzeitBis: '17:30',
    beginn: '2026-09-01',
    ende: '2027-06-30',
  };

  it('Gruppe: gültig → Datensatz ohne leere Felder, Wochentage sortiert und eindeutig', () => {
    const p = gruppeSchema.safeParse(gruppeAusFormular(fd(gueltig)));
    expect(p.success).toBe(true);
    const d = gruppeDatensatz(p.data!);
    expect(d).toMatchObject({
      name: { de: 'Elifbe Mittwoch' },
      kursId: null,
      kursart: null,
      wochentage: [3, 6],
      chatMindestalter: 10,
      ort: null,
    });
  });

  it('Gruppe: Mindestalter < 10, Chatfenster außerhalb, Ende vor Beginn, Uhrzeit verkehrt', () => {
    const fehler = (werte: Record<string, string | string[]>) => {
      const p = gruppeSchema.safeParse(gruppeAusFormular(fd({ ...gueltig, ...werte })));
      return p.success ? [] : p.error.issues.map((i) => `${String(i.path[0])}:${i.message}`);
    };
    expect(fehler({ chatMindestalter: '9' })).toContain('chatMindestalter:mindestalter');
    expect(fehler({ chatMindestalter: '19' })).toContain('chatMindestalter:mindestalter');
    expect(fehler({ chatVon: '07:00' })).toContain('chatBis:chatFenster');
    expect(fehler({ chatBis: '21:00' })).toContain('chatBis:chatFenster');
    expect(fehler({ ende: '2026-08-01' })).toContain('ende:endeVorBeginn');
    expect(fehler({ uhrzeitBis: '15:00' })).toContain('uhrzeitBis:bisVorVon');
    expect(fehler({ nameDe: ' ' })).toContain('nameDe:pflicht');
    expect(fehler({ wochentage: ['7'] })).toContain('wochentage:ungueltig');
  });

  it('Startwerte einer neuen Gruppe sind sicher (Chat aus, 10 Jahre, 08–20 Uhr) und gültig mit Namen', () => {
    const w = gruppeFormularWerte();
    expect(w).toMatchObject({ chatModus: 'aus', chatMindestalter: '10', chatVon: '08:00', chatBis: '20:00' });
    expect(gruppeSchema.safeParse({ ...w, nameDe: 'Neue Gruppe' }).success).toBe(true);
  });

  it('Termine: höchstens ein Jahr, Ende nicht vor Beginn', () => {
    const id = '00000000-0000-4000-8000-000000000001';
    expect(termineSchema.safeParse({ gruppeId: id, von: '2026-10-13', bis: '2026-12-08' }).success).toBe(true);
    expect(termineSchema.safeParse({ gruppeId: id, von: '2026-10-13', bis: '2026-10-12' }).success).toBe(false);
    const lang = termineSchema.safeParse({ gruppeId: id, von: '2026-10-13', bis: '2027-10-15' });
    expect(lang.success ? '' : lang.error.issues[0].message).toBe('zeitraumZuLang');
  });

  it('Einladung: Schüler nur mit Lernenden, Lehrkraft ohne; Adresse klein', () => {
    const basis = { name: 'Testperson Drei', email: 'Testperson.Drei@Example.test', gueltigTage: '7' };
    const id = '00000000-0000-4000-8000-000000000002';
    expect(gemeindeEinladungSchema.safeParse({ ...basis, art: 'schueler' }).success).toBe(false);
    expect(gemeindeEinladungSchema.safeParse({ ...basis, art: 'schueler', lernendeId: id }).success).toBe(true);
    expect(gemeindeEinladungSchema.safeParse({ ...basis, art: 'lehrkraft', lernendeId: id }).success).toBe(false);
    const e = gemeindeEinladungSchema.parse({ ...basis, art: 'eltern' });
    expect(e).toMatchObject({ email: 'testperson.drei@example.test', lernendeId: '', gueltigTage: 7 });
    expect(gemeindeEinladungSchema.safeParse({ ...basis, art: 'eltern', gueltigTage: '31' }).success).toBe(false);
  });
});
