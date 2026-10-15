// Medienspiegel: lädt alle Blob-Dateien, die lokal fehlen oder sich geändert haben, nach /daten (täglich 01:37).
// Löschabgleich (DSFA D-06, Löschkonzept L-32): Fehlt eine Datei in Vercel Blob, bekommt sie im Spiegel eine Marke
// `<datei>.geloescht` mit dem Datum; nach 30 Tagen werden Datei, Prüfsumme und Marke entfernt. Bis dahin bleibt ein
// versehentliches Löschen wiederherstellbar. Taucht die Datei wieder auf, fällt die Marke weg. Meldung ans Cockpit.
// S3 (Sicherheitsprüfung): Der Speicher ist privat (ADR 0020) – Dateien kommen über `get(…, { access: 'private' })` mit dem
// Token, nicht über die (ohne Token abgewiesene) Download-Adresse. Jede Datei, die sich nicht laden lässt, zählt als
// Fehlschlag; mit Fehlschlägen meldet der Lauf „fehler“ ans Cockpit statt „ok“.
import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const ZIEL = process.env.SPIEGEL_ZIEL ?? '/daten';
const FRIST_TAGE = Number(process.env.SPIEGEL_LOESCHFRIST_TAGE ?? 30);
const TAG_MS = 24 * 60 * 60 * 1000;
const lokalerPfad = (pathname) => join(ZIEL, pathname.replace(/\.\.+/g, '_'));
const melden = (ok, bytes) =>
  fetch(`${process.env.APP_URL}/api/wartung/lokal-meldung`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.WARTUNG_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({ art: 'spiegel', ok, bytes }),
  }).catch(() => undefined);

/** Inhalt einer privaten Blob-Datei (mit Token) oder null. */
async function ladePrivat(get, pathname) {
  const r = await get(pathname, { access: 'private', useCache: false });
  if (!r || r.statusCode !== 200 || !r.stream) return null;
  return Buffer.from(await new Response(r.stream).arrayBuffer());
}

/**
 * Ein Abgleich. `blob` (list/get) und `meldung` sind austauschbar (Probe ohne Netz); Standard: @vercel/blob und das
 * Cockpit. Rückgabe: Zahl neuer Dateien, Bytes und Fehlschläge.
 */
async function lauf({ blob, meldung = melden } = {}) {
  const { list, get } = blob ?? (await import('@vercel/blob'));
  let cursor;
  let neu = 0;
  let bytes = 0;
  let fehlschlaege = 0;
  const inBlob = new Set();
  do {
    const seite = await list({ cursor, limit: 1000 });
    for (const b of seite.blobs) {
      const pfad = lokalerPfad(b.pathname);
      inBlob.add(pfad);
      await rm(`${pfad}.geloescht`, { force: true });
      const vorhanden = await stat(pfad).catch(() => null);
      if (vorhanden && vorhanden.size === b.size) continue;
      const inhalt = await ladePrivat(get, b.pathname).catch(() => null);
      if (!inhalt) {
        fehlschlaege++;
        continue;
      }
      await mkdir(dirname(pfad), { recursive: true });
      await writeFile(pfad, inhalt);
      await writeFile(`${pfad}.sha256`, createHash('sha256').update(inhalt).digest('hex'));
      neu++;
      bytes += inhalt.length;
    }
    cursor = seite.cursor;
  } while (cursor);
  const { markiert, entfernt } = await loeschAbgleich(inBlob);
  console.log(
    `${new Date().toISOString()} Spiegel: ${neu} neue Dateien, ${bytes} Bytes, ${fehlschlaege} Fehlschläge; ${markiert} neu als gelöscht markiert, ${entfernt} nach ${FRIST_TAGE} Tagen entfernt`,
  );
  await meldung(fehlschlaege === 0, bytes);
  return { neu, bytes, fehlschlaege };
}

/** Dateien im Spiegel, die es in Blob nicht mehr gibt: markieren, nach Ablauf der Frist entfernen. */
async function loeschAbgleich(inBlob, jetzt = Date.now()) {
  const lokal = (await readdir(ZIEL, { recursive: true }).catch(() => [])).filter(
    (d) => !d.endsWith('.sha256') && !d.endsWith('.geloescht'),
  );
  let markiert = 0;
  let entfernt = 0;
  // Schutz: Eine leere Blob-Liste bei vollem Spiegel ist eher ein Zugangsfehler als eine Massenlöschung
  if (inBlob.size === 0 && lokal.length > 0) {
    console.error('Spiegel: Blob-Liste leer, Löschabgleich ausgesetzt');
    return { markiert, entfernt };
  }
  for (const d of lokal) {
    const pfad = join(ZIEL, d);
    const info = await stat(pfad).catch(() => null);
    if (!info?.isFile() || inBlob.has(pfad)) continue;
    const marke = `${pfad}.geloescht`;
    const seit = Date.parse((await readFile(marke, 'utf8').catch(() => '')).trim());
    if (Number.isNaN(seit)) {
      await writeFile(marke, new Date(jetzt).toISOString());
      markiert++;
    } else if (jetzt - seit >= FRIST_TAGE * TAG_MS) {
      await rm(pfad, { force: true });
      await rm(`${pfad}.sha256`, { force: true });
      await rm(marke, { force: true });
      entfernt++;
    }
  }
  return { markiert, entfernt };
}

async function pruefe() {
  // Stichprobe: Prüfsummen vorhandener Dateien (Bitfäule auf dem Datenträger)
  const dateien = (await readdir(ZIEL, { recursive: true })).filter((d) => d.endsWith('.sha256')).slice(0, 50);
  for (const d of dateien) {
    const soll = (await readFile(join(ZIEL, d), 'utf8')).trim();
    const ist = createHash('sha256').update(await readFile(join(ZIEL, d.slice(0, -7)))).digest('hex');
    if (soll !== ist) console.error(`Prüfsumme falsch: ${d}`);
  }
}

// Als Modul (Probe des Löschabgleichs und des Abgleichs) ohne Endlosschleife
export { lauf, loeschAbgleich };
if (!process.env.SPIEGEL_NUR_MODUL) for (;;) {
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
