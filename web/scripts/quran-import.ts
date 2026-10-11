// Quran-Import (ADR 0009, D-Q1, G-06): übernimmt den Korantext aus der Tanzil-XML-Datei unverändert in die Datenbank.
// Die Datei lädt ein Mensch nach Zustimmung zu den Tanzil-Nutzungsbedingungen herunter (M-036) und trägt ihren
// SHA-256-Wert in _lauf/MENSCHEN.md ein; ohne passenden Wert bricht der Import ab.
// Aufruf: pnpm quran:import web/daten/quran/quran-uthmani.xml --sha256 <hex> --version "1.1" --abruf 2026-10-12
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { parseArgs } from 'node:util';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../src/lib/db/schema';
import { leseTanzil, TanzilFehler } from '../src/lib/quran/tanzil';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { sha256: { type: 'string' }, version: { type: 'string' }, abruf: { type: 'string' } },
});

function fehler(text: string): never {
  console.error(text);
  process.exit(1);
}

const datei = positionals[0];
if (!datei) fehler('Bitte die Tanzil-XML-Datei angeben.');
const erwartet = values.sha256?.trim().toLowerCase();
if (!erwartet || !/^[0-9a-f]{64}$/.test(erwartet)) fehler('Bitte --sha256 mit dem in MENSCHEN.md (M-036) eingetragenen Wert angeben.');
if (!values.version?.trim()) fehler('Bitte --version der Tanzil-Datei angeben (z. B. "1.1").');
if (!values.abruf || !/^\d{4}-\d{2}-\d{2}$/.test(values.abruf)) fehler('Bitte --abruf als Datum JJJJ-MM-TT angeben.');
if (!process.env.DATABASE_URL) fehler('DATABASE_URL fehlt.');

const roh = await readFile(datei);
const ist = createHash('sha256').update(roh).digest('hex');
if (ist !== erwartet) fehler(`SHA-256 stimmt nicht: Datei ${ist}, erwartet ${erwartet}. Nichts importiert.`);

let suren;
try {
  suren = leseTanzil(roh.toString('utf8'));
} catch (e) {
  fehler(e instanceof TanzilFehler ? `Datei nicht lesbar: ${e.message}` : String(e));
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema, casing: 'snake_case' });
const QUELLE = 'tanzil';
await db.transaction(async (tx) => {
  await tx.delete(schema.quranVers);
  await tx.delete(schema.quranSure);
  await tx
    .insert(schema.quranQuelle)
    .values({
      id: QUELLE,
      bezeichnung: 'Tanzil Project',
      url: 'https://tanzil.net',
      version: values.version!.trim(),
      sha256: ist,
      lizenz: `Tanzil-Nutzungsbedingungen: unveränderte Wiedergabe mit Quellenangabe und Link (Abruf ${values.abruf})`,
    })
    .onConflictDoUpdate({
      target: schema.quranQuelle.id,
      set: { version: values.version!.trim(), sha256: ist, importiertAm: new Date() },
    });
  for (const s of suren) {
    await tx.insert(schema.quranSure).values({ nr: s.nr, nameAr: s.nameAr, verseAnzahl: s.verse.length, quelleId: QUELLE });
    // In Blöcken, damit große Suren die Parametergrenze nicht sprengen
    for (let i = 0; i < s.verse.length; i += 500)
      await tx.insert(schema.quranVers).values(s.verse.slice(i, i + 500).map((v) => ({ sure: s.nr, vers: v.nr, textAr: v.textAr })));
  }
});
await pool.end();
console.log(`Importiert: ${suren.length} Suren, ${suren.reduce((n, s) => n + s.verse.length, 0)} Verse (SHA-256 ${ist}).`);
console.log('Danach: Cache erneuern (POST /api/wartung/cache-erneuern) oder neu starten (ADR 0017).');
