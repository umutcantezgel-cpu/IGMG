// Medienspiegel: lädt alle Blob-Dateien, die lokal fehlen oder sich geändert haben, nach /daten (täglich 01:37).
// Dateien werden nie gelöscht (ein versehentliches Löschen in Vercel bleibt so wiederherstellbar). Meldung ans Cockpit.
import { createHash } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { list } from '@vercel/blob';

const ZIEL = '/daten';
const melden = (ok, bytes) =>
  fetch(`${process.env.APP_URL}/api/wartung/lokal-meldung`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.WARTUNG_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ art: 'spiegel', ok, bytes }),
  }).catch(() => undefined);

async function lauf() {
  let cursor;
  let neu = 0;
  let bytes = 0;
  do {
    const seite = await list({ cursor, limit: 1000 });
    for (const b of seite.blobs) {
      const pfad = join(ZIEL, b.pathname.replace(/\.\.+/g, '_'));
      const vorhanden = await stat(pfad).catch(() => null);
      if (vorhanden && vorhanden.size === b.size) continue;
      const antwort = await fetch(b.downloadUrl);
      if (!antwort.ok) continue;
      const inhalt = Buffer.from(await antwort.arrayBuffer());
      await mkdir(dirname(pfad), { recursive: true });
      await writeFile(pfad, inhalt);
      await writeFile(`${pfad}.sha256`, createHash('sha256').update(inhalt).digest('hex'));
      neu++;
      bytes += inhalt.length;
    }
    cursor = seite.cursor;
  } while (cursor);
  console.log(`${new Date().toISOString()} Spiegel: ${neu} neue Dateien, ${bytes} Bytes`);
  await melden(true, bytes);
}

async function pruefe() {
  // Stichprobe: Prüfsummen vorhandener Dateien (Bitfäule auf dem Datenträger)
  const { readdir } = await import('node:fs/promises');
  const dateien = (await readdir(ZIEL, { recursive: true })).filter((d) => d.endsWith('.sha256')).slice(0, 50);
  for (const d of dateien) {
    const soll = (await readFile(join(ZIEL, d), 'utf8')).trim();
    const ist = createHash('sha256').update(await readFile(join(ZIEL, d.slice(0, -7)))).digest('hex');
    if (soll !== ist) console.error(`Prüfsumme falsch: ${d}`);
  }
}

for (;;) {
  const jetzt = new Date();
  if (jetzt.getHours() === 1 && jetzt.getMinutes() === 37) {
    await lauf().catch(async (e) => {
      console.error(`Spiegel FEHLER: ${e instanceof Error ? e.message : e}`);
      await melden(false, 0);
    });
    await pruefe().catch(() => undefined);
  }
  await new Promise((r) => setTimeout(r, 60_000 - (Date.now() % 60_000)));
}
