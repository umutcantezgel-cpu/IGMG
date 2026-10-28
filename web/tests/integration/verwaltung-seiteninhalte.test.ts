import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { VERWALTUNG_BEREICHE } from '@/components/verwaltung/seiteninhalte/bereiche';
import { schema } from '@/lib/db';
import { SEITENINHALT } from '@/lib/validierung/seiteninhalte';
import { HADSCH_UMRA_BEISPIEL } from '../../drizzle/seeds/bereiche/hadsch-umra';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * V05 „Seiteninhalte I“ (Muster 5, Akzeptanz): Recht je Rolle und zweiter Faktor, Bereich und Schema, Feldfehler mit
 * Pfad am Feld, Speichern mit Audit ohne Personendaten und Cache-Tag, öffentliche Lesbarkeit nach dem Speichern und die
 * Übersicht je Rolle (Organisationsredaktion nur eigene Karten). Testpersonen sind fiktiv (G-04).
 */
const { client, db } = await verwaltungsUmgebung();
const { speichereSeiteninhalt } = await import('@/server/actions/seiteninhalte');
const { ladeSeiteninhalt } = await import('@/server/queries/seiteninhalte');
const { ladeZustaende, ladeSeiteninhaltFuerVerwaltung } = await import('@/server/queries/verwaltung/seiteninhalte');
const { uebersichtFuer } = await import('@/components/verwaltung/seiteninhalte/sicht');
afterAll(() => client.close());

/** Gültiger Eingabewert eines Bereichs: die Standardwerte des Schemas (sie sind selbst gültig). */
function standard(bereich: keyof typeof SEITENINHALT): Record<string, unknown> {
  return JSON.parse(JSON.stringify(SEITENINHALT[bereich].parse({}))) as Record<string, unknown>;
}

/** Speichert wie das Formular: Bereich und Inhalt als Text im Formularfeld `inhalt`. */
function speichern(bereich: string, inhalt: unknown) {
  return speichereSeiteninhalt({}, formular({ bereich, inhalt: JSON.stringify(inhalt) }));
}

async function zeile(bereich: string) {
  const [treffer] = await db.select().from(schema.seiteninhalt).where(eq(schema.seiteninhalt.bereich, bereich)).limit(1);
  return treffer;
}

const TEXT_UEBER_UNS = 'Testabsatz zur Geschichte der Gemeinde, fiktiv.';

/** Gültige Eingabe für „Über uns“ mit einem Absatz, einem Zeitleisten-Eintrag und einem Wert. */
function ueberUnsEingabe(): Record<string, unknown> {
  return {
    geschichte: { absaetze: [{ absatz: { de: TEXT_UEBER_UNS } }] },
    zeitleiste: [
      {
        kennzeichnung: { de: '1976' },
        titel: { de: 'Testereignis' },
        bildbeschreibung: { de: 'Testbild' },
        reihenfolge: 0,
        symbol: 'haus',
      },
    ],
    gemeinschaft: { absaetze: [] },
    werte: [{ titel: { de: 'Testwert' }, beschreibung: { de: 'Testbeschreibung' }, reihenfolge: 0, symbol: 'herz' }],
  };
}

describe('Rechte je Rolle', () => {
  it('ohne Anmeldung: keinRecht, nichts gespeichert', async () => {
    await angemeldetAls(null);
    expect(await speichern('ueber-uns', standard('ueber-uns'))).toEqual({ fehler: 'keinRecht' });
    expect(await zeile('ueber-uns')).toBeUndefined();
  });

  it('Bildung darf nicht speichern und sieht keine Übersicht', async () => {
    await angemeldetAls([{ rolle: 'bildung' }]);
    expect(await speichern('ueber-uns', ueberUnsEingabe())).toEqual({ fehler: 'keinRecht' });
    expect(uebersichtFuer([{ rolle: 'bildung' }])).toEqual([]);
    expect(await zeile('ueber-uns')).toBeUndefined();
  });

  it('Organisationsredaktion darf die Seiten dieses Moduls weder lesen noch speichern', async () => {
    await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'at' }]);
    expect(await speichern('ueber-uns', ueberUnsEingabe())).toEqual({ fehler: 'keinRecht' });
    expect(await zeile('ueber-uns')).toBeUndefined();
  });

  it('ohne zweiten Faktor: keinRecht, auch für die Administration', async () => {
    await angemeldetAls([{ rolle: 'administration' }], false);
    expect(await speichern('ueber-uns', ueberUnsEingabe())).toEqual({ fehler: 'keinRecht' });
    expect(await zeile('ueber-uns')).toBeUndefined();
  });

  it('Redaktion und Administration dürfen speichern', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await speichern('igmg', standard('igmg'))).toMatchObject({ gespeichert: expect.any(Number) as number });
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await speichern('vorstand', standard('vorstand'))).toMatchObject({ gespeichert: expect.any(Number) as number });
  });
});

describe('Bereich und Inhalt', () => {
  it('Kontakt und Organisationen sind über diese Action nicht änderbar', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    expect(await speichern('kontakt', {})).toEqual({ fehler: 'nichtGefunden' });
    expect(await speichern('organisation-ana-teskilati', standard('igmg'))).toEqual({ fehler: 'nichtGefunden' });
    expect(await zeile('kontakt')).toBeUndefined();
  });

  it('kein gültiger JSON-Text: unlesbar, nichts gespeichert', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await speichereSeiteninhalt({}, formular({ bereich: 'projekte', inhalt: '{nicht json' }))).toEqual({ fehler: 'unlesbar' });
    expect(await zeile('projekte')).toBeUndefined();
  });

  it('leerer Pflichttext: Feldfehler mit Pfad, Speichern unterbleibt', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const eingabe = standard('projekte') as { projekt: { name: { de: string } } };
    eingabe.projekt.name.de = '';
    const ergebnis = await speichern('projekte', eingabe);
    expect(ergebnis.fehler).toBe('pruefen');
    expect(ergebnis.feldFehler?.['projekt.name.de']).toBe('pflicht');
    expect(await zeile('projekte')).toBeUndefined();
  });

  it('Liste über der Höchstzahl: zuVieleEintraege am Listenpfad, Stand bleibt unverändert', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const vorher = await zeile('igmg');
    const eingabe = standard('igmg') as { bedeutung: { absaetze: { de: string }[] } };
    eingabe.bedeutung.absaetze = Array.from({ length: 7 }, (_, n) => ({ de: `Absatz ${n + 1}` }));
    const ergebnis = await speichern('igmg', eingabe);
    expect(ergebnis.feldFehler?.['bedeutung.absaetze']).toBe('zuVieleEintraege');
    expect(await zeile('igmg')).toEqual(vorher);
  });

  it('ungültige E-Mail-Adresse im Vorstand: ungueltigeAdresse am Feld des Mitglieds, Stand bleibt unverändert', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const vorher = await zeile('vorstand');
    const eingabe = standard('vorstand') as Record<string, unknown>;
    eingabe.vorstand = [
      {
        name: 'Testperson Eins',
        funktion: { de: 'Vorsitz' },
        seit: '2020',
        aufgaben: [],
        email: 'kein-mail',
        telefon: '[Telefonnummer]',
      },
    ];
    const ergebnis = await speichern('vorstand', eingabe);
    expect(ergebnis.feldFehler?.['vorstand.0.email']).toBe('ungueltigeAdresse');
    expect(await zeile('vorstand')).toEqual(vorher);
  });

  it('Platzhalter in eckigen Klammern bleiben beim Speichern erlaubt (G-05)', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const eingabe = standard('impressum') as Record<string, unknown>;
    eingabe.verantwortlich = {
      name: '[Name und Rechtsform – Vorstand]',
      anschrift: '[Anschrift]',
      telefon: '[Telefonnummer]',
      email: '[E-Mail-Adresse]',
      vertretung: '[Vertretungsberechtigte – Vorstand]',
      register: '[Registergericht und Registernummer]',
    };
    expect(await speichern('impressum', eingabe)).toMatchObject({ gespeichert: expect.any(Number) as number });
  });
});

describe('Speichern: Zeile, Audit und Cache', () => {
  it('speichert mit Quelle, Speichernden und Audit ohne Personendaten; Cache-Tag des Bereichs', async () => {
    const id = await angemeldetAls([{ rolle: 'redaktion' }]);
    const ergebnis = await speichern('ueber-uns', ueberUnsEingabe());
    expect(ergebnis).toMatchObject({ gespeichert: expect.any(Number) as number });

    const gespeichert = await zeile('ueber-uns');
    expect(gespeichert).toMatchObject({ bereich: 'ueber-uns', istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: id });

    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, 'ueber-uns'));
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', benutzerId: id, details: null });

    expect(aufrufe.updateTag).toContain('seiteninhalt:ueber-uns');
  });

  it('nach dem Speichern liefert die öffentliche Abfrage den neuen Text', async () => {
    const oeffentlich = await ladeSeiteninhalt('ueber-uns');
    expect(oeffentlich.geschichte.absaetze[0]?.absatz.de).toBe(TEXT_UEBER_UNS);
    expect(oeffentlich.istBeispiel).toBe(false);
  });
});

describe('Hadsch & Umra (Plan Marktstart P4)', () => {
  /** Eingabe wie aus dem Editor: der Beispielinhalt, das erste Video als kopierte YouTube-Adresse. */
  function eingabe(): Record<string, unknown> {
    const e = JSON.parse(JSON.stringify(HADSCH_UMRA_BEISPIEL)) as { videos: { youtubeId: string }[] } & Record<string, unknown>;
    e.videos[0].youtubeId = 'https://www.youtube.com/watch?v=ytTuELK2slU';
    return e;
  }

  it('Organisationsredaktion darf nicht speichern', async () => {
    await angemeldetAls([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    expect(await speichern('hadsch-umra', eingabe())).toEqual({ fehler: 'keinRecht' });
    expect(await zeile('hadsch-umra')).toBeUndefined();
  });

  it('fremder Host im Link und Rückflug vor dem Hinflug: Feldfehler am Pfad, nichts gespeichert', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const e = eingabe() as { programme: { link: unknown }[]; abfluege: { eintraege: { hin: string; rueck: string }[] } };
    e.programme[0].link = { de: 'https://reisebuero.example/hadsch/' };
    e.abfluege.eintraege[0].rueck = '2027-04-01';
    const ergebnis = await speichern('hadsch-umra', e);
    expect(ergebnis.fehler).toBe('pruefen');
    expect(ergebnis.feldFehler?.['programme.0.link.de']).toBe('ungueltig');
    expect(ergebnis.feldFehler?.['abfluege.eintraege.0.rueck']).toBe('rueckVorHin');
    expect(await zeile('hadsch-umra')).toBeUndefined();
  });

  it('Redaktion speichert; die YouTube-Adresse wird zur ID; Audit, Cache-Tag und öffentliche Abfrage', async () => {
    const id = await angemeldetAls([{ rolle: 'redaktion' }]);
    expect(await speichern('hadsch-umra', eingabe())).toMatchObject({ gespeichert: expect.any(Number) as number });
    const gespeichert = await zeile('hadsch-umra');
    expect(gespeichert).toMatchObject({ bereich: 'hadsch-umra', istBeispiel: false, quelle: 'verwaltung', aktualisiertVon: id });
    expect((gespeichert?.inhalt as { videos: { youtubeId: string }[] }).videos[0].youtubeId).toBe('ytTuELK2slU');
    const audit = await db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.zielId, 'hadsch-umra'));
    expect(audit).toEqual([expect.objectContaining({ aktion: 'inhalt.geaendert', zielTyp: 'seiteninhalt', details: null })]);
    expect(aufrufe.updateTag).toContain('seiteninhalt:hadsch-umra');
    const oeffentlich = await ladeSeiteninhalt('hadsch-umra');
    expect(oeffentlich.abfluege.eintraege).toHaveLength(8);
    expect(oeffentlich.ansprechperson.name).toBe('[Ansprechperson Hadsch & Umra – von der Gemeinde]');
  });
});

describe('Verwaltung lesen: Zustand und Rückfall', () => {
  it('ohne gespeicherte Zeile: Standardwerte mit Platzhaltern, Beispielzustand', async () => {
    const stand = await ladeSeiteninhaltFuerVerwaltung('datenschutz');
    expect(stand).toMatchObject({ bereich: 'datenschutz', istBeispiel: true, aktualisiertAm: null, unlesbar: false });
    expect(stand.inhalt).toMatchObject({ daten: [{ art: 'absatz', text: { de: '[Text fehlt: Erhobene Daten]' } }] });
  });

  it('gespeicherte Fassung passt nicht zum Schema: unlesbar, Standardwerte', async () => {
    await db.insert(schema.seiteninhalt).values({ bereich: 'projekte', inhalt: { projekt: 'falsch' }, istBeispiel: false });
    const stand = await ladeSeiteninhaltFuerVerwaltung('projekte');
    expect(stand.unlesbar).toBe(true);
    expect(stand.istBeispiel).toBe(false);
    expect(stand.inhalt).toMatchObject({ projekt: { name: { de: '[Projektname – von der Gemeinde]' } } });
  });

  it('Zustand je Bereich: gepflegt nach dem Speichern, ohne Zeile kein Eintrag', async () => {
    const zustaende = await ladeZustaende();
    expect(zustaende.get('ueber-uns')?.istBeispiel).toBe(false);
    expect(zustaende.get('datenschutz')).toBeUndefined();
  });
});

describe('Übersicht je Rolle', () => {
  it('Redaktion sieht alle Bereiche, Kontakt und die vier Organisationen, jeweils zum Bearbeiten', () => {
    const karten = uebersichtFuer([{ rolle: 'redaktion' }]);
    expect(karten.map((k) => k.bereich)).toEqual([
      ...VERWALTUNG_BEREICHE,
      'kontakt',
      'organisation-ana-teskilati',
      'organisation-kadin-teskilati',
      'organisation-genclik-teskilati',
      'organisation-kadin-genclik-teskilati',
    ]);
    expect(karten.every((k) => k.bearbeiten)).toBe(true);
  });

  it('Organisationsredaktion sieht nur die Karte der eigenen Organisation und darf sie bearbeiten', () => {
    expect(uebersichtFuer([{ rolle: 'organisationsredaktion', organisation: 'kt' }])).toEqual([
      { bereich: 'organisation-kadin-teskilati', gruppe: 'organisation', kuerzel: 'kt', bearbeiten: true },
    ]);
  });

  it('Organisationsredaktion ohne Bereichsrecht sieht Über uns nicht, auch nicht zum Ansehen', () => {
    const karten = uebersichtFuer([{ rolle: 'organisationsredaktion', organisation: 'gt' }]);
    expect(karten.map((k) => k.bereich)).toEqual(['organisation-genclik-teskilati']);
  });
});
