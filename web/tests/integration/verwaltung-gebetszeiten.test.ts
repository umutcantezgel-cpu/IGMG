import { eq } from 'drizzle-orm';
import { afterAll, describe, expect, it } from 'vitest';
import { schema } from '@/lib/db';
import { angemeldetAls, aufrufe, formular, verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * C07 (K-08, ADR 0008, G-06): Quelle und Bestätigung nur mit Recht, Berechnung mit Vorschau ohne Speichern, Import in
 * zwei Schritten (Server prüft beim Übernehmen erneut), öffentliche Zeiten aus dem Import, Import wieder entfernen.
 */
const { client, db } = await verwaltungsUmgebung();
const actions = await import('@/server/actions/gebetszeiten');
const { ladeGebetszeitenFenster } = await import('@/server/queries/gebetszeiten');
const { berlinerDatum } = await import('@/lib/gebetszeiten/naechstes');
afterAll(() => client.close());

const einstellung = async () =>
  (await db.select({ wert: schema.einstellung.wert }).from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'gebetszeiten')))[0]
    ?.wert as Record<string, unknown> | undefined;
const auditVon = (aktion: string) => db.select().from(schema.auditEintrag).where(eq(schema.auditEintrag.aktion, aktion));

function tagPlus(n: number): string {
  const [j, m, t] = berlinerDatum(new Date()).split('-').map(Number);
  return new Date(Date.UTC(j, m - 1, t + n)).toISOString().slice(0, 10);
}
const csv = (tage: string[]) =>
  ['datum;imsak;gunes;ogle;ikindi;aksam;yatsi', ...tage.map((d) => `${d};05:01;06:40;13:05;16:20;19:10;20:45`)].join('\n');
const dateiForm = (inhalt: string, name: string) => {
  const fd = new FormData();
  fd.append('datei', new File([inhalt], name, { type: 'text/csv' }));
  return fd;
};

describe('Quelle und Berechnung', () => {
  it('ohne gebetszeiten.bearbeiten: KeinRecht', async () => {
    await angemeldetAls([{ rolle: 'bildung' }]);
    await expect(actions.speichereQuelle({}, formular({ aktiveQuelle: 'import' }))).rejects.toThrow('KEIN_RECHT');
    await expect(actions.pruefeImport({}, dateiForm(csv([tagPlus(0)]), 'z.csv'))).rejects.toThrow('KEIN_RECHT');
  });

  it('Quelle speichern: Einstellung, Audit, sofort öffentlich (Tags)', async () => {
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    expect(await actions.speichereQuelle({}, formular({ aktiveQuelle: 'berechnung', bestaetigt: 'ja' }))).toEqual({ ok: true });
    expect(await einstellung()).toMatchObject({ aktiveQuelle: 'berechnung', bestaetigt: true, methode: 'Turkey' });
    expect(aufrufe.updateTag).toEqual(expect.arrayContaining(['gebetszeiten', 'einstellungen']));
    expect((await auditVon('gebetszeiten.einstellung')).some((a) => a.benutzerId === ich)).toBe(true);
    expect((await actions.speichereQuelle({}, formular({ aktiveQuelle: 'irgendwas' }))).fehler).toBe('pruefen');
  });

  it('Vorschau rechnet 7 Tage und speichert nichts; ungültige Anpassung am Feld; Speichern übernimmt', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const werte = {
      methode: 'MuslimWorldLeague',
      madhab: 'hanafi',
      hoheBreite: 'middleofthenight',
      breite: '50,567',
      laenge: '8.5',
      'anpassung-imsak': '2',
    };
    const v = await actions.speichereBerechnung({}, formular({ ...werte, richtung: 'vorschau' }));
    expect(v.vorschau).toHaveLength(7);
    expect(v.vorschau![0]).toMatchObject({ datum: tagPlus(0) });
    expect(v.vorschau![0].imsak).toMatch(/^\d{2}:\d{2}$/);
    expect(await einstellung()).toMatchObject({ methode: 'Turkey' });
    expect((await actions.speichereBerechnung({}, formular({ ...werte, 'anpassung-ogle': '99' }))).feldFehler).toMatchObject({
      'anpassung-ogle': 'ungueltig',
    });
    expect(await actions.speichereBerechnung({}, formular({ ...werte, richtung: 'speichern' }))).toEqual({ ok: true });
    expect(await einstellung()).toMatchObject({
      methode: 'MuslimWorldLeague',
      madhab: 'hanafi',
      anpassungen: { imsak: 2 },
      breite: 50.567,
      bestaetigt: true,
    });
  });
});

describe('Import', () => {
  it('Prüfen: gültige Datei → Vorschau ohne Speichern; Lücke → Zeilenfehler; falsche Datei → Fehler', async () => {
    await angemeldetAls([{ rolle: 'redaktion' }]);
    const ok = await actions.pruefeImport({}, dateiForm(csv([tagPlus(0), tagPlus(1), tagPlus(2)]), 'zeiten.csv'));
    expect(ok.pruefung).toMatchObject({ anzahl: 3, von: tagPlus(0), bis: tagPlus(2), dateiname: 'zeiten.csv' });
    expect(await db.select().from(schema.gebetszeitTag)).toHaveLength(0);
    const luecke = await actions.pruefeImport({}, dateiForm(csv([tagPlus(0), tagPlus(2)]), 'zeiten.csv'));
    expect(luecke.importFehler?.[0]).toMatchObject({ fehler: 'luecke' });
    expect((await actions.pruefeImport({}, dateiForm('x', 'zeiten.txt'))).fehler).toBe('datei');
    expect((await actions.pruefeImport({}, new FormData())).fehler).toBe('datei');
  });

  it('Übernehmen: prüft erneut, speichert Tage mit Import-Protokoll, setzt die Quelle; öffentlich gelten die Importzeiten', async () => {
    const ich = (await angemeldetAls([{ rolle: 'redaktion' }]))!;
    const ok = await actions.pruefeImport({}, dateiForm(csv([tagPlus(0), tagPlus(1), tagPlus(2)]), 'zeiten.csv'));
    // Manipulierte Vorschau wird abgelehnt
    expect((await actions.uebernehmeImport({}, formular({ tage: '[{"datum":"x"}]' }))).importFehler?.length).toBeGreaterThan(0);
    expect(await actions.uebernehmeImport({}, formular({ tage: ok.pruefung!.tage, dateiname: 'zeiten.csv', alsQuelle: 'ja' }))).toEqual({
      uebernommen: 3,
    });
    const tage = await db.select().from(schema.gebetszeitTag);
    expect(tage).toHaveLength(3);
    expect(tage.every((t) => t.quelle === 'import' && t.importId)).toBe(true);
    const [imp] = await db.select().from(schema.gebetszeitImport);
    expect(imp).toMatchObject({ dateiname: 'zeiten.csv', zeilen: 3, erstelltVon: ich });
    expect(await einstellung()).toMatchObject({ aktiveQuelle: 'import' });
    expect((await auditVon('gebetszeiten.importiert'))[0].details).toEqual({ tage: 3, von: tagPlus(0), bis: tagPlus(2) });
    const fenster = await ladeGebetszeitenFenster();
    const heute = fenster.tage.find((t) => t.datum === tagPlus(0));
    expect(heute).toMatchObject({ quelle: 'import', imsak: '05:01', yatsi: '20:45' });
    expect(fenster.tage.find((t) => t.datum === tagPlus(5))?.quelle).toBe('berechnet');
    // Zweiter Import überschreibt vorhandene Tage
    const neu = await actions.pruefeImport({}, dateiForm(csv([tagPlus(2), tagPlus(3)]).replaceAll('05:01', '05:09'), 'neu.csv'));
    await actions.uebernehmeImport({}, formular({ tage: neu.pruefung!.tage, dateiname: 'neu.csv' }));
    const [t2] = await db
      .select()
      .from(schema.gebetszeitTag)
      .where(eq(schema.gebetszeitTag.datum, tagPlus(2)));
    expect(t2.imsak.slice(0, 5)).toBe('05:09');
  });

  it('Entfernen: Tage des Imports weg, Audit, Weiterleitung', async () => {
    await angemeldetAls([{ rolle: 'administration' }]);
    const [imp] = await db.select().from(schema.gebetszeitImport).where(eq(schema.gebetszeitImport.dateiname, 'neu.csv'));
    await expect(actions.entferneImport(formular({ id: imp.id }))).rejects.toMatchObject({ ziel: '/verwaltung/gebetszeiten?entfernt=1' });
    expect(await db.select().from(schema.gebetszeitTag).where(eq(schema.gebetszeitTag.importId, imp.id))).toHaveLength(0);
    expect(await db.select().from(schema.gebetszeitTag)).toHaveLength(2);
    expect((await auditVon('gebetszeiten.import_entfernt'))[0].details).toEqual({ tage: 2 });
  });
});
