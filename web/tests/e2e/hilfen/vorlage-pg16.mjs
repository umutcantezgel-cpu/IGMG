// E2E ohne Docker mit PostgreSQL 16 (tests/e2e/LIESMICH.md): bereitet template1 mit den Migrationen bis <bis> vor.
//
// Grund: drizzle-kit migrate spielt alle offenen Migrationen in EINER Transaktion ein. 0013/0014 verwenden Werte von
// „rolle“, die 0008 mit ALTER TYPE … ADD VALUE ergänzt. PostgreSQL 17 erlaubt das, wenn der Typ in derselben
// Transaktion angelegt wurde (Release Notes 17, E.12.3.3) – Docker und Neon laufen mit 17. PostgreSQL 16 bricht auf
// einer frischen Datenbank mit „unsafe use of new value“ ab. Mit dieser Vorlage erbt jede neue Datenbank (auch die
// E2E-Datenbank aus scripts/e2e-datenbank.mjs) 0000…<bis> festgeschrieben; drizzle-kit spielt nur den Rest ein.
//
// Aufruf (im Ordner web/, einmal je Cluster, solange template1 leer ist):
//   node tests/e2e/hilfen/vorlage-pg16.mjs postgres://igmg:igmg-lokal@127.0.0.1:5432/template1 [bis=12]
import { cpSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

const [url, bisText = '12'] = process.argv.slice(2);
if (!url || !/\/template1$/.test(url)) throw new Error('Aufruf: node tests/e2e/hilfen/vorlage-pg16.mjs <URL von template1> [bis]');
const bis = Number(bisText);
const quelle = join(import.meta.dirname, '..', '..', '..', 'drizzle', 'migrations');
const ordner = mkdtempSync(join(tmpdir(), 'igmg-vorlage-'));
try {
  mkdirSync(join(ordner, 'meta'));
  const journal = JSON.parse(readFileSync(join(quelle, 'meta', '_journal.json'), 'utf8'));
  journal.entries = journal.entries.filter((e) => e.idx <= bis);
  for (const e of journal.entries) cpSync(join(quelle, `${e.tag}.sql`), join(ordner, `${e.tag}.sql`));
  writeFileSync(join(ordner, 'meta', '_journal.json'), JSON.stringify(journal, null, 2));
  const pool = new pg.Pool({ connectionString: url });
  try {
    const { rows } = await pool.query("select count(*)::int as n from information_schema.tables where table_schema = 'public'");
    if (rows[0].n > 0) {
      console.error('template1 enthält schon Tabellen – Vorlage schon angelegt, nichts geändert.');
      process.exitCode = 1;
    } else {
      await migrate(drizzle(pool), { migrationsFolder: ordner });
      const r = await pool.query('select count(*)::int as n from drizzle.__drizzle_migrations');
      console.log(`template1: ${r.rows[0].n} Migrationen festgeschrieben (bis ${journal.entries.at(-1).tag}).`);
    }
  } finally {
    await pool.end();
  }
} finally {
  rmSync(ordner, { recursive: true, force: true });
}
