import { existsSync } from 'node:fs';
import pg from 'pg';

/** Datenbank der Tests: wie die Hilfsskripte (`tsx --env-file-if-exists=.env`) – gesetzte Umgebung vor `.env`. */
function datenbankAdresse(): string {
  if (!process.env.DATABASE_URL && existsSync('.env')) process.loadEnvFile('.env');
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL fehlt – E2E braucht PostgreSQL (docs/BETRIEB.md 8).');
  return url;
}

/**
 * Testdaten (G-04): macht den offenen Antrag auf eine Schutzrolle eines Testkontos sofort wirksam – ohne zweite Person.
 * Eine Einladung mit `kinderschutz` (seit N4) bzw. `religioese_pruefung` (seit Stufe C N2) ergibt nur einen Antrag
 * (Vier-Augen-Prinzip, `lib/rechte/schutzrollen.ts`);
 * diesen Ablauf prüft `tests/integration/sicherheit-n4-vier-augen.test.ts`. Specs, die nur die Oberfläche der Rolle
 * prüfen (Z-07), brauchen die Rolle unabhängig davon, ob in diesem Lauf schon eine Leitung wirksam ist.
 */
export async function schutzrolleWirksam(email: string, rolle: 'kinderschutz' | 'leitung' | 'religioese_pruefung') {
  const client = new pg.Client({ connectionString: datenbankAdresse() });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>('select id from "user" where email = $1', [email]);
    const id = rows[0]?.id;
    if (!id) throw new Error(`Testkonto ${email} fehlt`);
    await client.query(
      `insert into rolle_zuweisung (benutzer_id, rolle, erstellt_von) values ($1, $2, 'e2e-testdaten') on conflict do nothing`,
      [id, rolle],
    );
    await client.query(`delete from rollen_antrag where benutzer_id = $1 and rolle = $2`, [id, rolle]);
  } finally {
    await client.end();
  }
}
