import { existsSync } from 'node:fs';
import { expect, type Page, test } from '@playwright/test';
import pg from 'pg';
import freigabenTexte from '../../../messages/verwaltung/freigaben.json';
import lernappTexte from '../../../messages/verwaltung/lernapp.json';
import { angemeldetesKonto } from '../hilfen/konto';
import { ernsteBefunde } from './hilfen';

/**
 * Verwaltung › Lern-App › Religiöse Prüfung (L6-03, ADR 0040 Nr. 5, KERN 4.0 §2.3, PLAN §6.7 Nr. 6, §7.1): Zwei Personen mit
 * der Rolle „Religiöse Prüfung“ geben eine Aussage des Wissenskurses frei. Geprüft wird die Oberfläche: Warteschlange mit
 * „unsicher“ (Belegprüfung) zuerst, Stand 0/2 → 1/2 → 2/2, Inhalt und Fundstelle (Werk › Kitab/Bab, Ausgabe, Band, Seite)
 * nebeneinander, Urteil „unsicher/Änderungsvorschlag“ zuerst ohne Vorauswahl, „ok“ nur mit dem Haken je Beleg, dieselbe
 * Person nicht zweimal, „Freigegeben“ erst mit zwei Freigaben, Freigaben-Warteschlange mit Verweis statt Entscheidung, axe.
 * Rechte, Hash-Bindung, Rücksetzen und Audit prüft die Integration (`tests/integration/lernapp-religioes.test.ts`).
 * Testdaten nur als Platzhalter in eckigen Klammern – keine religiösen Texte (KI-Regel 2). Nur Desktop.
 */
const r = lernappTexte.lernapp.religioes;
const f = r.formular;
const fehler = lernappTexte.lernapp.fehler;
const fr = freigabenTexte.freigaben;

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'Verwaltungsabläufe nur einmal je Lauf');
  await page.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
});

async function mitDatenbank<T>(arbeit: (c: pg.Client) => Promise<T>): Promise<T> {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    return await arbeit(client);
  } finally {
    await client.end();
  }
}

const H = (z: string) => z.repeat(64);
const S = {
  einheit: 'islam.grund.e90',
  lektion: 'islam.grund.e90.l01',
  sicher: 'islam.grund.e90.l01.s01',
  unsicher: 'islam.grund.e90.l01.s02',
};
const TEXT = { sicher: '[Aussage eins – Platzhalter]', unsicher: '[Aussage zwei – Platzhalter]' };

/**
 * Platzhalter-Bausteine (G-04): eine Lektion des Wissenskurses mit zwei Aussagen und je einem Beleg; die Belegprüfung hält den
 * Beleg der zweiten Aussage für „teilweise“ (→ unsicher). Verfasst von einem KI-Lauf, damit keine Testperson Verfasserin ist.
 */
async function bausteineAnlegen(): Promise<{ sicher: string; unsicher: string }> {
  return mitDatenbank(async (c) => {
    const id = async (sql: string, werte: unknown[]) => (await c.query<{ id: string }>(sql, werte)).rows[0]!.id;
    await c.query(
      `insert into lernapp_kurs (id, art, zielsprache, aktiv) values ('islam', 'wissen', 'de', true) on conflict (id) do nothing`,
    );
    const abschnitt = await id(
      `insert into lernapp_abschnitt (kurs_id, stufe, reihenfolge) values ('islam', 'grund', 1)
       on conflict on constraint lernapp_abschnitt_eindeutig do update set reihenfolge = excluded.reihenfolge returning id`,
      [],
    );
    const einheit = await id(
      `insert into lernapp_einheit (abschnitt_id, schluessel, reihenfolge, inhalt_hash, verfasst_von, status)
       values ($1, $2, 90, $3, 'ki:e2e', 'automatisch_geprueft') returning id`,
      [abschnitt, S.einheit, H('a')],
    );
    const lektion = await id(
      `insert into lernapp_lektion (einheit_id, schluessel, reihenfolge, ziel, inhalt_hash, verfasst_von, status)
       values ($1, $2, 1, $3::jsonb, $4, 'ki:e2e', 'automatisch_geprueft') returning id`,
      [einheit, S.lektion, JSON.stringify({ de: '[Lernziel – Platzhalter]' }), H('b')],
    );
    const quelle = await id(
      `insert into lernapp_quelle (kurz, werk, autor, ausgabe, art, openiti_uri)
       values ('e2e_werk', '[Werk – Platzhalter]', '[Autor]', '[Ausgabe 1900]', 'fiqh', '0000Test.Werk.E2e-ara1')
       on conflict (kurz) do update set werk = excluded.werk returning id`,
      [],
    );
    const aussage = (schluessel: string, nr: number, text: string, hash: string) =>
      id(
        `insert into lernapp_aussage (lektion_id, schluessel, text, reihenfolge, inhalt_hash, verfasst_von, status)
         values ($1, $2, $3, $4, $5, 'ki:e2e', 'automatisch_geprueft') returning id`,
        [lektion, schluessel, text, nr, hash],
      );
    const beleg = (aussageId: string, hash: string) =>
      id(
        `insert into lernapp_beleg (aussage_id, quelle_id, passage, stelle, inhalt_hash, verfasst_von)
         values ($1, $2, 'e2e_werk.ms0042', $3::jsonb, $4, 'ki:e2e') returning id`,
        [aussageId, quelle, JSON.stringify({ kitab: '[Kitab]', bab: '[Bab]', band: '1', seite: '12' }), hash],
      );
    const sicher = await aussage(S.sicher, 1, TEXT.sicher, H('c'));
    await beleg(sicher, H('d'));
    const unsicher = await aussage(S.unsicher, 2, TEXT.unsicher, H('e'));
    const belegUnsicher = await beleg(unsicher, H('f'));
    // Belegprüfung durch den Agenten (ohne Person): „teilweise“ – ordnet nur die Warteschlange
    await c.query(
      `insert into lernapp_pruefung (inhalt_typ, inhalt_id, inhalt_hash, art, pruefende_id, urteil)
       values ('beleg', $1, $2, 'religioes', null, 'aenderungsvorschlag')`,
      [belegUnsicher, H('f')],
    );
    return { sicher, unsicher };
  });
}

const BELEG_HAKEN = new RegExp(`${r.belegName.replace('{nr}', '1')}: ${f.belegHaken}`);

/** Urteil „ok“ mit allen Haken absenden (die Haken setzt die Person ausdrücklich). */
async function freigeben(page: Page) {
  await page.getByRole('checkbox', { name: BELEG_HAKEN }).check();
  await page.getByRole('radio', { name: f.urteile.ok }).check();
  await page.getByRole('button', { name: f.speichern }).click();
}

test('Religiöse Prüfung: „unsicher“ zuerst, Fundstelle neben der Aussage, Haken je Beleg, 1/2 und 2/2 von zwei Personen', async ({
  page,
  browser,
}) => {
  const ids = await bausteineAnlegen();
  const adresse = `/verwaltung/lernapp/religioes/aussage-${ids.sicher}`;

  // ——— Person A: Warteschlange ———
  await angemeldetesKonto(page, 'religioese_pruefung');
  await page.goto('/verwaltung/lernapp/religioes');
  await expect(page.getByRole('heading', { level: 1, name: r.titel })).toBeVisible();
  const tabelle = page.getByRole('region', { name: r.beschriftung });
  const zeilen = tabelle.getByRole('row');
  // „unsicher“ zuerst (vor der Lektion und der ersten Aussage, obwohl ihr Schlüssel später kommt)
  await expect(zeilen.nth(1)).toContainText(S.unsicher);
  await expect(zeilen.nth(1)).toContainText(r.hinweise.unsicher);
  const sicherZeile = zeilen.filter({ hasText: S.sicher });
  await expect(sicherZeile).toContainText(r.stand.replace('{stand}', '0'));
  await expect(sicherZeile).not.toContainText(r.hinweise.unsicher);
  expect(await ernsteBefunde(page, 'religioes-warteschlange')).toEqual([]);

  // ——— Person A: Baustein ———
  await sicherZeile.getByRole('link', { name: r.pruefenName.replace('{baustein}', `${r.typ.aussage} ${S.sicher}`) }).click();
  await expect(page).toHaveURL(new RegExp(`${adresse}$`));
  await expect(page.getByText(r.standText['0'])).toBeVisible();
  const inhalt = page.getByRole('region', { name: r.inhaltTitel, exact: true });
  const fundstellen = page.getByRole('region', { name: r.fundstellenTitel, exact: true });
  await expect(inhalt).toContainText(TEXT.sicher);
  await expect(fundstellen).toContainText('[Werk – Platzhalter] ([Autor])');
  await expect(fundstellen).toContainText('[Kitab] › [Bab]');
  await expect(fundstellen).toContainText('[Ausgabe 1900]');
  await expect(fundstellen).toContainText(`${r.beleg.band.replace('{band}', '1')}, ${r.beleg.seite.replace('{seite}', '12')}`);
  await expect(fundstellen).toContainText('0000Test.Werk.E2e-ara1#ms0042');
  // Fundstelle neben der Aussage (Desktop: zwei Spalten)
  const [links, rechts] = [await inhalt.boundingBox(), await fundstellen.boundingBox()];
  expect(rechts!.x).toBeGreaterThanOrEqual(links!.x + links!.width);
  expect(Math.abs(rechts!.y - links!.y)).toBeLessThan(4);

  // Urteile: „unsicher/Änderungsvorschlag“ zuerst, nichts vorausgewählt
  const urteile = page.getByRole('radio');
  await expect(urteile).toHaveCount(3);
  await expect(urteile.first()).toHaveAccessibleName(f.urteile.aenderungsvorschlag);
  for (let i = 0; i < 3; i++) await expect(urteile.nth(i)).not.toBeChecked();
  expect(await ernsteBefunde(page, 'religioes-baustein')).toEqual([]);

  // „ok“ ohne Haken am Beleg: verweigert
  await page.getByRole('radio', { name: f.urteile.ok }).check();
  await page.getByRole('button', { name: f.speichern }).click();
  await expect(page.getByText(fehler.urteil_belegeBestaetigen)).toBeVisible();
  // mit Haken: erste Freigabe
  await freigeben(page);
  await expect(page.getByText(f.gespeichert.stand_1)).toBeVisible();
  await expect(page.getByText(r.standText['1'])).toBeVisible();
  // dieselbe Person ein zweites Mal: verweigert, der Stand bleibt 1/2
  await freigeben(page);
  await expect(page.getByText(fehler.urteil_schonFreigegeben)).toBeVisible();
  await expect(page.getByText(r.standText['1'])).toBeVisible();

  // ——— Person B: zweite Freigabe ———
  const kontext = await browser.newContext();
  try {
    const b = await kontext.newPage();
    await b.addInitScript(() => window.localStorage.setItem('igmg-konzepthinweis-gesehen', '1'));
    await angemeldetesKonto(b, 'religioese_pruefung');
    await b.goto('/verwaltung/lernapp/religioes');
    await expect(b.getByRole('region', { name: r.beschriftung }).getByRole('row').filter({ hasText: S.sicher })).toContainText(
      r.stand.replace('{stand}', '1'),
    );
    await b.goto(adresse);
    await expect(b.getByText(r.standText['1'])).toBeVisible();
    await freigeben(b);
    await expect(b.getByText(f.gespeichert.stand_2)).toBeVisible();
    await expect(b.getByText(r.standText['2'])).toBeVisible();

    // „Freigegeben“ zeigt die Aussage mit 2/2; unter „Zu prüfen“ steht sie nicht mehr
    await b.goto('/verwaltung/lernapp/religioes?ansicht=geprueft');
    await expect(b.getByRole('region', { name: r.beschriftung }).getByRole('row').filter({ hasText: S.sicher })).toContainText(
      r.stand.replace('{stand}', '2'),
    );
    await b.goto('/verwaltung/lernapp/religioes');
    await expect(b.getByRole('region', { name: r.beschriftung }).getByRole('row').filter({ hasText: S.sicher })).toHaveCount(0);

    // Freigaben-Warteschlange: offene Bausteine mit Stand und Verweis auf die Prüfansicht – keine Entscheidung dort
    await b.goto('/verwaltung/freigaben');
    const verweis = b.getByRole('link', { name: fr.zweiPrueferPruefenName.replace('{titel}', TEXT.unsicher) });
    await expect(verweis).toHaveAttribute('href', `/verwaltung/lernapp/religioes/aussage-${ids.unsicher}`);
    await expect(b.getByRole('link', { name: fr.zweiPrueferPruefenName.replace('{titel}', TEXT.sicher) })).toHaveCount(0);
    expect(await ernsteBefunde(b, 'freigaben-lernapp')).toEqual([]);
  } finally {
    await kontext.close();
  }
});
