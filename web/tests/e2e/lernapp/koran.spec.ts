import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import pg from 'pg';
import de from '../../../messages/lernapp/de.json';
import tr from '../../../messages/lernapp/tr.json';
import pfad from '../../../inhalte/lernapp/koran/pfad.json';
import { formatiere } from '../../../src/lib/lernapp/format';
import { koranBedeutungHash } from '../../../src/lib/lernapp/paket/koran';
import { erneuereCaches } from '../hilfen/rezitation';
import { ernsteBefunde } from './hilfen';

/**
 * Koran-Arabisch-Pfad (L6-05, ADR 0040 Nr. 5, KERN 4.0 §2.3/§4) gegen die E2E-Datenbank mit dem gepinnten Tanzil-Text.
 *
 * 1. Ohne Bedeutungen oder Freigaben: Die erste Einheit zeigt ihre Wortformen (aus den gepinnten Daten, `lang="ar"`) mit
 *    „Bedeutung folgt“, keine Übungen, keine Wiedergabe und keinen Weg zur Wiederholung; axe ohne ernste Befunde.
 * 2. Mit zwei Freigaben (Restliste L6): Für die Wortformen der ersten Lektion legt der Test Bedeutungen in der türkischen
 *    Oberfläche an – nur Platzhalter in eckigen Klammern, keine Koran-Wortbedeutungen (KI-Regel 2) – und je zwei Prüfungen
 *    „ok“ zweier Personen mit der Rolle „religiöse Prüfung“ zum aktuellen Hash, direkt in der Datenbank; danach verfallen die
 *    Caches. Die Lektion ist spielbar (ohne Audio), alle Antworten richtig, Abschluss. Danach räumt der Test alles weg.
 *    Nur auf dem Desktop (Datenbank-Änderungen einmal je Lauf); die deutsche Oberfläche aus Test 1 bleibt unberührt.
 */

test.use({ serviceWorkers: 'block' });
test.describe.configure({ mode: 'serial' });

test('Koran-Kurs ohne Freigaben zeigt „Bedeutung folgt“ und keine Übungen', async ({ page }) => {
  await page.goto('/lern-app/de/koran');
  await expect(page.getByRole('heading', { level: 2, name: de.lernpfad.einheiten })).toBeVisible();
  await expect(page.locator('a[href="/lern-app/de/koran/wiederholen"]')).toHaveCount(0);

  const einheit = page.locator('details[data-einheit="koran.grund.e01"]');
  await expect(einheit).toBeVisible();
  await einheit.locator('summary').click();
  const woerter = einheit.locator('li[data-stelle]');
  await expect(woerter.first()).toBeVisible();
  const anzahl = await woerter.count();
  expect(anzahl).toBeGreaterThan(0);
  await expect(einheit.locator('[data-bedeutung="folgt"]')).toHaveCount(anzahl);
  await expect(einheit.locator('[data-bedeutung="ja"]')).toHaveCount(0);
  await expect(einheit.locator('[data-bedeutung="folgt"]').first()).toHaveText(de.koranpfad.bedeutungFolgt);
  await expect(woerter.first().locator('[lang="ar"][dir="rtl"]')).toBeVisible();
  await expect(einheit.getByText(de.koranpfad.uebungenFolgen)).toBeVisible();
  await expect(einheit.locator('a[href*="/ueben?l="]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: de.koranpfad.anhoeren })).toHaveCount(0);

  expect(await ernsteBefunde(page, 'koran')).toEqual([]);
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

type Angelegt = { personen: string[]; bedeutungen: string[]; je: Map<string, string> };

/** Bedeutungen (Platzhalter) für die Stellen der Lektion samt je zwei Prüfungen „ok“ zweier Prüfender zum aktuellen Hash. */
async function zweiFreigabenAnlegen(stellen: readonly string[], sprache: 'tr'): Promise<Angelegt> {
  return mitDatenbank(async (c) => {
    const personen = [randomUUID(), randomUUID(), randomUUID()];
    for (const [i, id] of personen.entries()) {
      await c.query(`insert into "user" (id, name, email, email_verified) values ($1, $2, $3, true)`, [
        id,
        `[Testperson Koran ${i + 1}]`,
        `e2e.koran.${id.slice(0, 8)}@example.test`,
      ]);
      // Person 1 verfasst, Personen 2 und 3 prüfen
      if (i > 0) await c.query(`insert into rolle_zuweisung (benutzer_id, rolle) values ($1, 'religioese_pruefung')`, [id]);
    }
    const formJe = new Map<string, number>();
    for (const stelle of stellen) {
      const [sure, vers, pos] = stelle.split(':').map(Number);
      const r = await c.query<{ form_id: number }>(`select form_id from quran_wort where sure = $1 and vers = $2 and pos = $3`, [
        sure,
        vers,
        pos,
      ]);
      formJe.set(stelle, r.rows[0]!.form_id);
    }
    const bedeutungen: string[] = [];
    const je = new Map<string, string>();
    for (const formId of new Set(formJe.values())) {
      const b = { formId, sprache, bedeutung: `[Bedeutung ${formId}]`, wurzel: null, anmerkung: null };
      const r = await c.query<{ id: string }>(
        `insert into quran_wortbedeutung (form_id, sprache, bedeutung, freigabe, verfasst_von)
         values ($1, $2, $3, 'zur_pruefung', $4) returning id`,
        [formId, sprache, b.bedeutung, personen[0]],
      );
      const id = r.rows[0]!.id;
      bedeutungen.push(id);
      for (const pruefende of personen.slice(1))
        await c.query(
          `insert into lernapp_pruefung (inhalt_typ, inhalt_id, inhalt_hash, art, pruefende_id, urteil)
           values ('koran_bedeutung', $1, $2, 'religioes', $3, 'ok')`,
          [id, koranBedeutungHash(b), pruefende],
        );
      for (const [stelle, f] of formJe) if (f === formId) je.set(stelle, b.bedeutung);
    }
    return { personen, bedeutungen, je };
  });
}

async function wegraeumen(a: Angelegt) {
  await mitDatenbank(async (c) => {
    await c.query(`delete from lernapp_pruefung where inhalt_typ = 'koran_bedeutung' and inhalt_id = any($1::text[])`, [a.bedeutungen]);
    await c.query(`delete from quran_wortbedeutung where id = any($1::uuid[])`, [a.bedeutungen]);
    await c.query(`delete from "user" where id = any($1::text[])`, [a.personen]);
  });
}

test('Koran-Lektion mit zwei Freigaben je Bedeutung ist spielbar (Platzhalter, ohne Audio)', async ({ page, baseURL }, info) => {
  test.skip(info.project.name !== 'desktop', 'Datenbank-Änderungen nur einmal je Lauf');
  const einheit = pfad.einheiten[0]!;
  const lektion = einheit.lektionen[0]!;
  const stellen = [...new Set(lektion.aufgaben.flatMap((a) => [a.wortform, ...a.ablenker]))];
  const angelegt = await zweiFreigabenAnlegen(stellen, 'tr');
  try {
    await erneuereCaches(baseURL!);
    const t = tr.koranpfad;
    await page.goto('/lern-app/tr/koran');
    const e = page.locator(`details[data-einheit="${einheit.schluessel}"]`);
    await expect(e).toBeVisible();
    await e.locator('summary').click();
    for (const stelle of lektion.wortformen)
      await expect(e.locator(`li[data-stelle="${stelle}"] [data-bedeutung="ja"]`)).toHaveText(angelegt.je.get(stelle)!);
    const link = e.locator(`a[href="/lern-app/tr/koran/ueben?l=${encodeURIComponent(lektion.schluessel)}"]`);
    await expect(link).toBeVisible();
    await link.click();

    const s = tr.spieler;
    for (const [i, aufgabe] of lektion.aufgaben.entries()) {
      // Stelle der Wortform steht unter dem Wort; richtig ist die Bedeutung ihrer Form
      await expect(
        page.locator('main figure p').filter({ hasText: formatiere(tr.aufgaben.koran_wort.stelle, { stelle: aufgabe.wortform }, 'tr') }),
      ).toBeVisible();
      await expect(page.locator('main figure [lang="ar"][dir="rtl"]')).toBeVisible();
      if (i === 0) {
        expect(await ernsteBefunde(page, 'koran_wort')).toEqual([]);
        await expect(page.locator('main audio')).toHaveCount(0);
      }
      const radio = page.getByRole('radio', { name: angelegt.je.get(aufgabe.wortform)!, exact: true });
      await page.locator('main label').filter({ has: radio }).click();
      await expect(radio).toBeChecked();
      await page.getByRole('button', { name: s.pruefen, exact: true }).click();
      await page.getByRole('button', { name: s.weiter, exact: true }).click();
    }
    await expect(page.getByText(s.fertigTitel, { exact: true })).toBeVisible();
    const n = lektion.aufgaben.length;
    await expect(page.getByText(formatiere(s.fertigText, { richtig: n, gesamt: n }, 'tr'), { exact: true })).toBeVisible();
    await expect(page.getByText(t.bedeutungFolgt)).toHaveCount(0);
  } finally {
    await wegraeumen(angelegt);
    await erneuereCaches(baseURL!);
  }
});
