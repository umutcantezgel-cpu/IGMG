import { beforeAll, describe, expect, it, afterAll } from 'vitest';
import { schema } from '@/lib/db';
import { ROLLEN } from '@/lib/rechte/matrix';
import audit from '../../messages/verwaltung/audit.json';
import { angemeldetAls, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Audit-Log der Verwaltung (C13, G-07): Recht je Rolle, Filter (Zeitraum mit Berliner Tagesgrenzen, Aktion,
 * Ziel-Typ, Konto), Seiten zu 50 Einträgen, keine Personendaten in Details, vollständige Aktionstexte.
 * Vorbild: verwaltung-veranstaltungen-rollen.test.ts. Die Seite selbst wird nicht gerendert; geprüft werden die
 * Funktionen, die sie aufruft, und der Rechteaufruf `verlangeSeitenRecht('audit.lesen')` wie in page.tsx.
 */
const { client, db } = await verwaltungsUmgebung();
const { verlangeSeitenRecht } = await import('@/lib/rechte/pruefe');
const { protokolliere } = await import('@/lib/audit');
const { speichereVeranstaltung } = await import('@/server/actions/veranstaltungen');
const { AKTION_SCHLUESSEL, AKTIONEN, OHNE_KONTO, SEITENGROESSE, filterAusSuche, ladeAuditSeite, ladeKonten, ladeZielTypen } =
  await import('@/server/queries/verwaltung/audit');
const anzeige = await import('@/components/verwaltung/audit/anzeige');
afterAll(() => client.close());

const EINGANG_ID = '5b1d0e2c-7f3a-4c8e-9a10-2d6e8f4b1c3a';
let adminId = '';

describe('Verwaltung › Audit-Log › Recht (Kriterium 1)', () => {
  it('ohne Anmeldung: Umleitung zur Anmeldung', async () => {
    await angemeldetAls(null);
    await expect(verlangeSeitenRecht('audit.lesen')).rejects.toMatchObject({ ziel: '/verwaltung/anmelden' });
  });

  it('ohne zweiten Faktor: Umleitung zur Einrichtung, auch mit Administrationsrolle', async () => {
    await angemeldetAls([{ rolle: 'administration' }], false);
    await expect(verlangeSeitenRecht('audit.lesen')).rejects.toMatchObject({ ziel: '/verwaltung/zwei-faktor' });
  });

  it('angemeldet ohne Rolle: Umleitung zur Anmeldung mit Hinweis', async () => {
    await angemeldetAls([]);
    await expect(verlangeSeitenRecht('audit.lesen')).rejects.toMatchObject({ ziel: '/verwaltung/anmelden?keine-rolle=1' });
  });

  it('Administration darf lesen', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    await expect(verlangeSeitenRecht('audit.lesen')).resolves.toMatchObject({ rollen: [{ rolle: 'administration' }] });
  });

  for (const rolle of ROLLEN.filter((r) => r !== 'administration')) {
    it(`Rolle ${rolle}: kein Zugriff, Umleitung auf „Kein Zugriff“`, async () => {
      await angemeldetAls([{ rolle, organisation: rolle === 'organisationsredaktion' ? 'gt' : null }]);
      await expect(verlangeSeitenRecht('audit.lesen')).rejects.toMatchObject({ ziel: '/verwaltung/kein-zugriff' });
    });
  }
});

describe('Verwaltung › Audit-Log › Leerzustand', () => {
  it('ohne Einträge: leere Liste auf Seite 1 von 1', async () => {
    const ergebnis = await ladeAuditSeite(filterAusSuche({}).filter, 1);
    expect(ergebnis).toEqual({ zeilen: [], gesamt: 0, seite: 1, seiten: 1 });
  });
});

describe('Verwaltung › Audit-Log › Einträge', () => {
  beforeAll(async () => {
    adminId = (await angemeldetAls([{ rolle: 'administration' }])) ?? '';
    // Echte Verwaltungsaktion: Anlegen und Veröffentlichen erzeugen zwei Einträge mit Konto (Weiterleitung als Fehler)
    await speichereVeranstaltung(
      {},
      formular({ titelDe: 'Audit Testtermin', kategorie: 'gemeinde', datum: '2026-11-07', beginnZeit: '19:00', status: 'veroeffentlicht' }),
    ).catch(() => undefined);
    // Einträge ohne Konto, mit Konto und mit einem Konto, das es nicht (mehr) gibt
    await protokolliere({ benutzerId: null, aktion: 'anmeldung.fehlgeschlagen', details: { grund: 'ratenbegrenzung' } });
    await protokolliere({ benutzerId: adminId, aktion: 'anmeldung.erfolg', details: { zweiFaktor: true, ersatzcode: false } });
    await protokolliere({ benutzerId: 'konto-entfernt', aktion: 'abmeldung' });
    await protokolliere({
      benutzerId: null,
      aktion: 'eingang.angelegt',
      zielTyp: 'eingang',
      zielId: EINGANG_ID,
      details: { art: 'kontakt' },
    });
  });

  it('neueste zuerst; Konto mit Name und E-Mail; System/Besucher ohne Konto; entferntes Konto ohne Name', async () => {
    const ergebnis = await ladeAuditSeite(filterAusSuche({}).filter, 1);
    expect(ergebnis.zeilen.slice(0, 6).map((z) => z.aktion)).toEqual([
      'eingang.angelegt',
      'abmeldung',
      'anmeldung.erfolg',
      'anmeldung.fehlgeschlagen',
      'inhalt.veroeffentlicht',
      'inhalt.angelegt',
    ]);
    const erfolg = ergebnis.zeilen.find((z) => z.aktion === 'anmeldung.erfolg');
    expect(erfolg).toMatchObject({ benutzerId: adminId, benutzerName: 'Testperson Eins' });
    expect(erfolg?.benutzerEmail).toMatch(/@example\.test$/);
    const system = ergebnis.zeilen.find((z) => z.aktion === 'anmeldung.fehlgeschlagen');
    expect(system).toMatchObject({ benutzerId: null, benutzerName: null, benutzerEmail: null });
    const entfernt = ergebnis.zeilen.find((z) => z.aktion === 'abmeldung');
    expect(entfernt).toMatchObject({ benutzerId: 'konto-entfernt', benutzerName: null });
    const eingang = ergebnis.zeilen.find((z) => z.aktion === 'eingang.angelegt');
    expect(eingang).toMatchObject({ zielTyp: 'eingang', zielId: EINGANG_ID, details: { art: 'kontakt' } });
  });

  it('Anzeige: Benutzer und Ziel mit Textfallback, Details als Schlüssel=Wert', () => {
    const texte = { system: 'System/Besucher', kontoFehlt: 'Konto nicht mehr vorhanden' };
    expect(anzeige.benutzerAnzeige({ benutzerId: null, benutzerName: null, benutzerEmail: null }, texte)).toEqual({
      haupt: 'System/Besucher',
      zweit: null,
    });
    expect(anzeige.benutzerAnzeige({ benutzerId: 'konto-entfernt', benutzerName: null, benutzerEmail: null }, texte)).toEqual({
      haupt: 'Konto nicht mehr vorhanden',
      zweit: null,
    });
    expect(anzeige.zielAnzeige('eingang', EINGANG_ID, { eingang: 'Eingang' }, '–')).toEqual({ typ: 'Eingang', kurz: '5b1d0e2c…' });
    expect(anzeige.zielAnzeige(null, null, {}, '–')).toBeNull();
    expect(anzeige.zielAnzeige('constructor', null, {}, '–')).toEqual({ typ: 'constructor', kurz: null });
    expect(anzeige.detailZeilen({ zweiFaktor: true, ersatzcode: false })).toEqual(['zweiFaktor=true', 'ersatzcode=false']);
    expect(anzeige.detailZeilen(null)).toEqual([]);
    expect(anzeige.kurzeId('kurz')).toBe('kurz');
  });

  it('Zeitpunkt in Europe/Berlin (Sommerzeit: 16:30 UTC ist 18:30 Uhr)', () => {
    expect(anzeige.zeitpunktText(new Date('2026-07-28T16:30:00Z'))).toBe('Di., 28. Juli 2026, 18:30 Uhr');
  });

  it('Aktion: nur dieser Schlüssel; eine unbekannte Aktion bleibt ohne Wirkung', async () => {
    const gefiltert = await ladeAuditSeite(filterAusSuche({ aktion: 'eingang.angelegt' }).filter, 1);
    expect(gefiltert.zeilen.map((z) => z.aktion)).toEqual(['eingang.angelegt']);
    const unbekannt = filterAusSuche({ aktion: 'gibt.es.nicht' });
    expect(unbekannt.filter.aktion).toBeNull();
    expect(unbekannt.werte.aktion).toBe('');
  });

  it('Ziel-Typ: nur dieser Typ', async () => {
    const gefiltert = await ladeAuditSeite(filterAusSuche({ zielTyp: 'eingang' }).filter, 1);
    expect(gefiltert.zeilen.map((z) => z.zielId)).toEqual([EINGANG_ID]);
  });

  it('Benutzer: „ohne Konto“ nur Einträge ohne Konto; eine Konto-ID nur dessen Einträge', async () => {
    const ohne = await ladeAuditSeite(filterAusSuche({ benutzer: OHNE_KONTO }).filter, 1);
    expect(ohne.zeilen.length).toBeGreaterThan(0);
    expect(ohne.zeilen.every((z) => z.benutzerId === null)).toBe(true);
    expect(ohne.zeilen.map((z) => z.aktion)).toContain('anmeldung.fehlgeschlagen');
    const konto = await ladeAuditSeite(filterAusSuche({ benutzer: adminId }).filter, 1);
    expect(konto.zeilen.every((z) => z.benutzerId === adminId)).toBe(true);
    expect(konto.zeilen.map((z) => z.aktion)).toContain('anmeldung.erfolg');
  });

  it('Konten und Ziel-Typen für die Auswahlfelder', async () => {
    const konten = await ladeKonten();
    expect(konten.some((k) => k.id === adminId && k.name === 'Testperson Eins')).toBe(true);
    const typen = await ladeZielTypen();
    expect(typen).toEqual(expect.arrayContaining(['eingang', 'veranstaltung']));
    expect(typen).toEqual([...typen].sort());
  });
});

describe('Verwaltung › Audit-Log › Zeitraum', () => {
  // 29. März 2026 beginnt die Sommerzeit (UTC+2). Die vier Zeitpunkte liegen um die Tagesgrenze in Europe/Berlin.
  beforeAll(async () => {
    await db.insert(schema.auditEintrag).values([
      { zeitpunkt: new Date('2026-03-31T21:59:59Z'), aktion: 'inhalt.angelegt', zielTyp: 'zeitraumtest', zielId: 'vor-tag' },
      { zeitpunkt: new Date('2026-03-31T22:30:00Z'), aktion: 'inhalt.angelegt', zielTyp: 'zeitraumtest', zielId: 'tag-anfang' },
      { zeitpunkt: new Date('2026-04-01T21:59:59Z'), aktion: 'inhalt.angelegt', zielTyp: 'zeitraumtest', zielId: 'tag-ende' },
      { zeitpunkt: new Date('2026-04-01T22:00:00Z'), aktion: 'inhalt.angelegt', zielTyp: 'zeitraumtest', zielId: 'tag-danach' },
    ]);
  });

  const ziele = async (suche: Record<string, string>) =>
    (await ladeAuditSeite(filterAusSuche({ zielTyp: 'zeitraumtest', ...suche }).filter, 1)).zeilen.map((z) => z.zielId);

  it('„von“ und „bis“ umfassen ganze Berliner Kalendertage (1. April 00:30 Uhr ist der 1. April)', async () => {
    expect(await ziele({ von: '2026-04-01', bis: '2026-04-01' })).toEqual(['tag-ende', 'tag-anfang']);
    expect(await ziele({ von: '2026-04-01' })).toEqual(['tag-danach', 'tag-ende', 'tag-anfang']);
    expect(await ziele({ bis: '2026-03-31' })).toEqual(['vor-tag']);
  });

  it('ungültiges Datum: Fehler am Feld, kein Filter für dieses Feld', () => {
    const suche = filterAusSuche({ von: '2026-02-31' });
    expect(suche.fehler).toEqual({ von: true, bis: false, zeitraum: false });
    expect(suche.filter.von).toBeNull();
    expect(suche.werte.von).toBe('');
  });

  it('„bis“ vor „von“: Fehler am Zeitraum und keine Einträge', async () => {
    const suche = filterAusSuche({ von: '2026-05-10', bis: '2026-05-01' });
    expect(suche.fehler.zeitraum).toBe(true);
    expect((await ladeAuditSeite(suche.filter, 1)).gesamt).toBe(0);
  });
});

describe('Verwaltung › Audit-Log › Seiten', () => {
  const basis = Date.UTC(2026, 0, 1);
  beforeAll(async () => {
    // 120 Einträge im Sekundentakt: Seiten zu 50, 50 und 20
    await db.insert(schema.auditEintrag).values(
      Array.from({ length: 120 }, (_, i) => ({
        zeitpunkt: new Date(basis + i * 1000),
        aktion: 'medium.hochgeladen',
        zielTyp: 'seitentest',
        zielId: `seite-${i}`,
      })),
    );
  });

  it('50 Einträge je Seite, neueste zuerst; Seite 3 mit dem Rest', async () => {
    expect(SEITENGROESSE).toBe(50);
    const erste = await ladeAuditSeite(filterAusSuche({ zielTyp: 'seitentest' }).filter, 1);
    expect(erste).toMatchObject({ gesamt: 120, seite: 1, seiten: 3 });
    expect(erste.zeilen).toHaveLength(50);
    expect(erste.zeilen[0]?.zeitpunkt.getTime()).toBe(basis + 119_000);
    const letzte = await ladeAuditSeite(filterAusSuche({ zielTyp: 'seitentest' }).filter, 3);
    expect(letzte.zeilen).toHaveLength(20);
    expect(letzte.zeilen[19]?.zeitpunkt.getTime()).toBe(basis);
  });

  it('eine Seite hinter dem Ende zeigt die letzte Seite', async () => {
    const hinter = await ladeAuditSeite(filterAusSuche({ zielTyp: 'seitentest' }).filter, 99);
    expect(hinter).toMatchObject({ seite: 3, seiten: 3 });
    expect(hinter.zeilen).toHaveLength(20);
  });

  it('ungültige Seitenangaben zählen als Seite 1', () => {
    expect(filterAusSuche({ seite: 'abc' }).seite).toBe(1);
    expect(filterAusSuche({ seite: '0' }).seite).toBe(1);
    expect(filterAusSuche({ seite: '2' }).seite).toBe(2);
    expect(filterAusSuche({ seite: ['3', '4'] }).seite).toBe(3);
  });
});

describe('Verwaltung › Audit-Log › Keine Personendaten in Details (G-07)', () => {
  it('kein gespeichertes Detail enthält eine E-Mail-Adresse oder einen Namen', async () => {
    const alle = await db.select().from(schema.auditEintrag);
    const mitDetails = alle.filter((e) => e.details !== null);
    expect(mitDetails.length).toBeGreaterThan(0);
    for (const e of mitDetails) {
      const text = JSON.stringify(e.details);
      expect(text, `Eintrag ${e.id} (${e.aktion})`).not.toContain('@');
      expect(text, `Eintrag ${e.id} (${e.aktion})`).not.toContain('Testperson');
    }
  });
});

describe('Verwaltung › Audit-Log › Aktionstexte', () => {
  const texte = audit.audit.aktion as Record<string, string>;

  it('jede Aktion hat genau einen Text in verwaltung.audit.aktion', () => {
    const schluessel = Object.values(AKTION_SCHLUESSEL).sort();
    expect(Object.keys(texte).sort()).toEqual(schluessel);
    for (const s of schluessel) expect(texte[s], s).toBeTruthy();
    expect(AKTIONEN).toHaveLength(schluessel.length);
  });
});
