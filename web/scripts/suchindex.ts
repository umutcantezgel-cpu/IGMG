// Titel-Index der Suche ohne Laufzeit-Datenbank (Beispielmodus, ADR 0019): liest die Bau-Datenbank und schreibt
// .suchindex.json in den Projektstamm – Titel öffentlicher Inhalte und die Zuordnung „Hadith-Nummer → Buch und Teil“,
// keine Texte (src/lib/suche/titelindex.ts). Läuft im Vercel-Bau ohne DATABASE_URL nach der Bau-Datenbank
// (scripts/vercel-bau.mjs); mit Datenbank sucht die Seite /suche im Volltext und braucht die Datei nicht.
// Aufruf: pnpm exec tsx --conditions=react-server scripts/suchindex.ts (PGLITE_VERZEICHNIS, BAU_PGLITE=1 gesetzt)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { eq } from 'drizzle-orm';
import { holeDb, schema } from '../src/lib/db';
import { entscheide, entscheideWirksam } from '../src/lib/funktionen-regeln';
import { baueSuchIndex } from '../src/lib/suche/titelindex-bau';
import { pruefeSuchIndex, SUCHINDEX_DATEI } from '../src/lib/suche/titelindex';
import { EINSTELLUNG } from '../src/lib/validierung/einstellungen';

async function main() {
  const db = holeDb();
  // Gesamtsammlung wie beim Vorrendern der Buchseiten: Umgebung → Einstellung der Bau-Datenbank → Standard der Betriebsart
  const [zeile] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'funktionen')).limit(1);
  const einstellung = EINSTELLUNG.funktionen.schema.safeParse(zeile?.wert ?? {});
  const werte = einstellung.success ? einstellung.data : null;
  const hadith = entscheide('hadith_gesamt', process.env, werte);
  // Wissens-Entwürfe „zur Prüfung“ wie die vorgerenderten Themenseiten (ADR 0047)
  const wissenEntwuerfe = entscheideWirksam('website_wissen_vorschau', process.env, werte);
  const index = await baueSuchIndex(db, { hadith, wissenEntwuerfe });
  if (!pruefeSuchIndex(index)) throw new Error('Suchindex ungültig');
  const ziel = join(import.meta.dirname, '..', SUCHINDEX_DATEI);
  const text = JSON.stringify(index);
  writeFileSync(ziel, text);
  const nummern = index.hadith?.buecher.reduce((n, [, liste]) => n + liste.length, 0) ?? 0;
  console.log(`[suchindex] ${index.eintraege.length} Titel, ${nummern} Hadith-Nummern, ${(text.length / 1024).toFixed(1)} KB → ${ziel}`);
}

main().then(
  () => process.exit(0),
  (fehler: unknown) => {
    console.error('[suchindex] fehlgeschlagen:', fehler);
    process.exit(1);
  },
);
