// Legt eine Einladung an und gibt den Einladungslink aus (BETRIEB.md, erstes Administrationskonto).
// Aufruf: pnpm verwaltung:einladen --email person@example.test --name "Testperson Eins" --rolle administration [--organisation gt]
// Der Link erscheint NUR in dieser Ausgabe; gespeichert wird nur der Hash des Tokens.
import { parseArgs } from 'node:util';
import { createHash, randomBytes } from 'node:crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { einladung } from '../src/lib/db/schema/rechte';
import { ROLLEN, ORGANISATION_KUERZEL, type Rolle, type OrganisationKuerzel } from '../src/lib/rechte/matrix';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    name: { type: 'string' },
    rolle: { type: 'string', multiple: true },
    organisation: { type: 'string' },
    'gueltig-stunden': { type: 'string', default: '72' },
    nur_token: { type: 'boolean', default: false },
  },
});

function fehler(text: string): never {
  console.error(text);
  process.exit(1);
}

const email = values.email?.trim().toLowerCase();
const name = values.name?.trim();
if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fehler('Bitte --email angeben.');
if (!name) fehler('Bitte --name angeben.');
const rollen = (values.rolle ?? []).map((r) => {
  if (!ROLLEN.includes(r as Rolle)) fehler(`Unbekannte Rolle: ${r}. Erlaubt: ${ROLLEN.join(', ')}`);
  return r as Rolle;
});
if (rollen.length === 0) fehler('Bitte mindestens eine --rolle angeben.');
const organisation = values.organisation as OrganisationKuerzel | undefined;
if (organisation && !ORGANISATION_KUERZEL.includes(organisation)) fehler(`Unbekannte Organisation: ${organisation}`);
if (rollen.includes('organisationsredaktion') && !organisation) fehler('Organisationsredaktion braucht --organisation (at, kt, gt, kgt).');

// Nach den Prüfungen sind E-Mail und Name gesetzt (fehler() beendet den Prozess).
const emailGeprueft: string = email;
const nameGeprueft: string = name;

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) fehler('DATABASE_URL fehlt.');
  const pool = new Pool({ connectionString: url });
  const db = drizzle(pool, { casing: 'snake_case' });
  const token = randomBytes(32).toString('base64url');
  const stunden = Number(values['gueltig-stunden']);
  await db.insert(einladung).values({
    email: emailGeprueft,
    name: nameGeprueft,
    rollen: rollen.map((r) => (r === 'organisationsredaktion' ? { rolle: r, organisation } : { rolle: r })),
    tokenHash: createHash('sha256').update(token, 'utf8').digest('hex'),
    laeuftAb: new Date(Date.now() + stunden * 3_600_000),
    erstelltVon: 'kommandozeile',
  });
  await pool.end();
  const basis = process.env.APP_URL ?? 'http://localhost:3000';
  console.log(values.nur_token ? token : `Einladung angelegt (gültig ${stunden} h). Link:\n${basis}/verwaltung/einladung/${token}`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
