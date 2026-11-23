// Vorführung mit Testzugang (ADR 0052): legt in der Bau-Datenbank das Verwaltungskonto des Testzugangs an, prüft die
// Beispielkonten (scripts/beispielkonten.ts läuft davor) und packt die Datenbank als Schnappschuss nach `.vorfuehrung/`.
// Nur im Bau ohne DATABASE_URL (scripts/vercel-bau.mjs setzt VORFUEHRUNG=1, BAU_PGLITE=1 und PGLITE_VERZEICHNIS).
// Aufruf: pnpm exec tsx --conditions=react-server scripts/vorfuehrung-vorbereiten.ts
import { randomBytes } from 'node:crypto';
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { holeDb, schema } from '../src/lib/db';
import { packeSchnappschuss } from '../src/lib/vorfuehrung/entpacken';
import { VORFUEHRUNG_KONTEN } from '../src/lib/vorfuehrung/konten';
import { VORFUEHRUNG_ORDNER, vorfuehrung } from '../src/lib/vorfuehrung/modus';

type Rolle = (typeof schema.rolleEnum.enumValues)[number];
/** Alle Rollen ohne Organisationsbezug: Der Testzugang soll jeden Bereich der Verwaltung zeigen. */
const ROLLEN: Rolle[] = ['administration', 'leitung', 'religioese_pruefung', 'kinderschutz', 'sprachpruefung'];

function fehler(text: string): never {
  console.error(`[vorfuehrung] ${text}`);
  process.exit(1);
}

/**
 * Schreibprotokoll (WAL) auf das Nötige kürzen: Nach dem Prüfpunkt und dem sauberen Schließen braucht PostgreSQL nur das
 * aktuelle Segment; ältere sind erledigt, und die dahinter sind vorab umbenannte alte Segmente ohne Inhalt für den Start.
 * Es bleiben das aktuelle und das nächste (falls der Abschluss-Prüfpunkt über die Grenze schrieb). Gemessen: 145 MB → 32 MB;
 * die gekürzte Datenbank öffnet, liest und schreibt wie zuvor. Gibt die Zahl der entfernten Segmente zurück.
 */
function kuerzeWal(ordner: string, aktuell: string): number {
  const segmente = readdirSync(ordner)
    .filter((n) => /^[0-9A-F]{24}$/.test(n))
    .sort();
  if (!segmente.includes(aktuell)) fehler(`Schreibprotokoll: aktuelles Segment ${aktuell} fehlt.`);
  const ueberzaehlig = [...segmente.filter((n) => n < aktuell), ...segmente.filter((n) => n > aktuell).slice(1)];
  for (const n of ueberzaehlig) rmSync(join(ordner, n));
  return ueberzaehlig.length;
}

async function lauf() {
  if (!vorfuehrung()) fehler('Nur in der Vorführung (VORFUEHRUNG=1, ohne DATABASE_URL).');
  const verzeichnis = process.env.PGLITE_VERZEICHNIS;
  if (!verzeichnis || process.env.BAU_PGLITE !== '1') fehler('PGLITE_VERZEICHNIS und BAU_PGLITE=1 fehlen.');
  const db = holeDb();

  for (const konto of VORFUEHRUNG_KONTEN) {
    if (konto.schluessel === 'verwaltung') {
      let [u] = await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, konto.email)).limit(1);
      if (!u) {
        [u] = await db
          .insert(schema.user)
          .values({
            id: randomBytes(16).toString('hex'),
            name: 'Vorführung Verwaltung',
            email: konto.email,
            emailVerified: true,
            twoFactorEnabled: true,
          })
          .returning({ id: schema.user.id });
      }
      for (const rolle of ROLLEN) {
        await db.insert(schema.rolleZuweisung).values({ benutzerId: u.id, rolle, organisation: null }).onConflictDoNothing();
      }
      continue;
    }
    const [u] = await db
      .select({ id: schema.user.id })
      .from(schema.user)
      .where('kindername' in konto ? eq(schema.user.username, konto.kindername) : eq(schema.user.email, konto.email))
      .limit(1);
    if (!u) fehler(`Beispielkonto „${konto.schluessel}“ fehlt – scripts/beispielkonten.ts muss vorher laufen.`);
  }

  // Sauber schließen (Prüfpunkt, keine offenen Schreibvorgänge), erst dann die Dateien packen
  const client = (
    db as unknown as {
      $client: { exec(sql: string): Promise<unknown>; query<T>(sql: string): Promise<{ rows: T[] }>; close(): Promise<void> };
    }
  ).$client;
  await client.exec('CHECKPOINT');
  const [{ segment }] = (await client.query<{ segment: string }>('select pg_walfile_name(pg_current_wal_lsn()) as segment')).rows;
  await client.close();
  const entfernt = kuerzeWal(join(verzeichnis, 'pg_wal'), segment);
  console.log(`[vorfuehrung] Schreibprotokoll: ${entfernt} überzählige Segmente entfernt (aktuell ${segment})`);
  const ziel = join(import.meta.dirname, '..', VORFUEHRUNG_ORDNER);
  const inhalt = packeSchnappschuss(verzeichnis, ziel);
  console.log(`[vorfuehrung] Schnappschuss: ${inhalt.dateien.length} Dateien in ${ziel}`);
}

void lauf().catch((e) => fehler(String(e)));
