// Bündel `.lpa` bauen und das Audio-Manifest fortschreiben (PLAN §6.8 Schritte 4–5, ADR 0039 Nr. 3, 6.3–6.4 mit
// Fortschreibung S4/S5; src/lib/lernapp/audio/manifest.ts).
// - Aufgenommen werden nur Clips der Liste, die der Prüfbericht (`pnpm lernapp:audio-pruefen`) mit „ok“ führt – mit
//   demselben SHA-256 wie die Datei im Clipordner.
// - Gebaut werden nur die betroffenen Bündel (je Einheit und Stimme); sie landen in `<aus>/<sprache>/<datei>` (Scratchpad,
//   nie im Repository). Ältere Bündel einer Gruppe liest das Skript aus `<aus>` oder – falls `LERNAPP_BLOB_BASIS` gesetzt
//   ist – aus dem öffentlichen Blob.
// - Hochladen in den Blob `lernapp` nur mit `--hochladen` UND gesetztem `BLOB_READ_WRITE_TOKEN` (Menschen-Schritt LM-15);
//   sonst wird es übersprungen und gemeldet. Erst nach dem Hochladen gehört das Manifest ins Repository.
// - Alte Bündel bleiben im Blob; das Skript nennt sie (Löschen entscheiden Menschen, wenn kein Paket mehr darauf verweist).
// - `--bereinigen`: Clips zu Texten, die nicht mehr vertonbar sind (gelöscht, zurückgezogen, Religionsbezug), fallen aus
//   Manifest und Bündeln (Neubau, S-L1 N-3).
// Aufruf: pnpm lernapp:audio-manifest <sprache> --liste <liste.jsonl> --clips <ordner> --pruefung <bericht.json>
//         --aus <bündelordner> [--manifest <pfad>] [--bereinigen] [--hochladen] [--testkurs | --inhalte <wurzel>]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { testkursQuellen } from '../../drizzle/seeds/lernapp-test';
import { leseJsonl, vertonbareTexte } from '../../src/lib/lernapp/audio/liste';
import {
  clipsAusBuendel,
  ergaenzeManifest,
  leeresManifest,
  leseManifest,
  manifestText,
  type NeuerClip,
} from '../../src/lib/lernapp/audio/manifest';
import { manifestStimme, stimmeFuer } from '../../src/lib/lernapp/audio/stimmen';
import { ladeWaechter } from '../../src/lib/lernapp/inhalt/religion';
import { istSprache } from '../../src/lib/lernapp/kurse';
import { sha256Hex } from '../../src/lib/lernapp/paket/hash';
import { INHALT_WURZEL, inhaltsdateien } from './inhaltsdateien';

const WEB = join(import.meta.dirname, '..', '..');

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    liste: { type: 'string' },
    clips: { type: 'string' },
    pruefung: { type: 'string' },
    aus: { type: 'string' },
    manifest: { type: 'string' },
    bereinigen: { type: 'boolean', default: false },
    hochladen: { type: 'boolean', default: false },
    testkurs: { type: 'boolean', default: false },
    inhalte: { type: 'string' },
  },
});

type Pruefclip = { textHash: string; urteil: string; sha256: string };

async function main(): Promise<number> {
  const sprache = positionals[0];
  if (!istSprache(sprache) || !values.liste || !values.clips || !values.pruefung || !values.aus) {
    console.error(
      'Aufruf: pnpm lernapp:audio-manifest <sprache> --liste <liste.jsonl> --clips <ordner> --pruefung <bericht.json> --aus <ordner> [--manifest <pfad>] [--bereinigen] [--hochladen]',
    );
    return 2;
  }
  const stimme = stimmeFuer(sprache);
  const liste = leseJsonl(readFileSync(values.liste, 'utf8')).filter((z) => z.sprache === sprache);
  const fremd = liste.filter((z) => z.stimme !== stimme?.id);
  if (fremd.length) throw new Error(`${fremd.length} Einträge gehören nicht zur freigegebenen Stimme der Sprache ${sprache}`);
  const pruefung = new Map((JSON.parse(readFileSync(values.pruefung, 'utf8')) as { clips: Pruefclip[] }).clips.map((c) => [c.textHash, c]));

  const manifestPfad = values.manifest ?? join(INHALT_WURZEL, 'audio-manifest', `${sprache}.json`);
  const alt = existsSync(manifestPfad) ? leseManifest(readFileSync(manifestPfad, 'utf8')) : leeresManifest(sprache);

  // Neue Clips: nur „ok“ und unverändert seit der Prüfung
  const neu: NeuerClip[] = [];
  const zurueck = { fehlt: 0, ungeprueft: 0, nichtOk: 0, veraendert: 0 };
  for (const z of liste) {
    const pfad = join(values.clips, `${z.textHash}.webm`);
    if (!existsSync(pfad)) {
      zurueck.fehlt++;
      continue;
    }
    const p = pruefung.get(z.textHash);
    if (!p) {
      zurueck.ungeprueft++;
      continue;
    }
    if (p.urteil !== 'ok') {
      zurueck.nichtOk++;
      continue;
    }
    const daten = new Uint8Array(readFileSync(pfad));
    if (sha256Hex(daten) !== p.sha256) {
      zurueck.veraendert++;
      continue;
    }
    neu.push({ textHash: z.textHash, stimme: z.stimme, einheit: z.einheit, daten });
  }

  // Bereinigen: nicht mehr vertonbare Texte entfallen
  let entfernen = new Set<string>();
  if (values.bereinigen) {
    const quellen = values.testkurs ? testkursQuellen() : inhaltsdateien(values.inhalte ?? INHALT_WURZEL, ['sprache']);
    const gueltig = new Set(vertonbareTexte(quellen, sprache, { waechter: ladeWaechter(join(WEB, 'daten')) }).texte.map((t) => t.textHash));
    entfernen = new Set(alt.clips.filter((c) => !gueltig.has(c.textHash)).map((c) => c.textHash));
  }

  const basis = process.env.LERNAPP_BLOB_BASIS?.replace(/\/+$/, '');
  const fernBytes = new Map<string, Uint8Array>();
  for (const c of alt.clips) {
    const lokal = join(values.aus, c.buendel.replace(/^lernapp\/audio\//, ''));
    if (fernBytes.has(c.buendel) || existsSync(lokal) || !basis) continue;
    const antwort = await fetch(`${basis}/${c.buendel}`);
    if (antwort.ok) fernBytes.set(c.buendel, new Uint8Array(await antwort.arrayBuffer()));
  }
  const { manifest, buendel, alteBuendel } = ergaenzeManifest({
    alt,
    neu,
    entfernen,
    stimmen: stimme ? [manifestStimme(stimme)] : [],
    alteClips: (schluessel, clips) => {
      const lokal = join(values.aus!, schluessel.replace(/^lernapp\/audio\//, ''));
      const bytes = existsSync(lokal) ? new Uint8Array(readFileSync(lokal)) : fernBytes.get(schluessel);
      if (!bytes) throw new Error(`Bündel ${schluessel} weder lokal noch im Blob (LERNAPP_BLOB_BASIS) – Neubau nicht möglich`);
      return clipsAusBuendel(bytes, clips);
    },
  });

  for (const b of buendel) {
    const ziel = join(values.aus, b.sprache, b.datei);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, b.bytes);
  }
  mkdirSync(dirname(manifestPfad), { recursive: true });
  writeFileSync(manifestPfad, manifestText(manifest));

  let hochgeladen = 'nicht angefordert (ohne --hochladen)';
  if (values.hochladen && buendel.length) {
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) hochgeladen = 'übersprungen: BLOB_READ_WRITE_TOKEN fehlt – Menschen-Schritt LM-15';
    else {
      const { head, put } = await import('@vercel/blob');
      let n = 0;
      for (const b of buendel) {
        const da = await head(b.schluessel, { token }).catch(() => null);
        if (da) continue;
        await put(b.schluessel, Buffer.from(b.bytes), {
          access: 'public',
          token,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 31_536_000,
          contentType: 'application/octet-stream',
        });
        n++;
      }
      hochgeladen = `${n} Bündel hochgeladen`;
    }
  }

  console.log(
    JSON.stringify({
      sprache,
      neueClips: neu.length,
      zurueckgestellt: zurueck,
      entfernt: entfernen.size,
      buendel: buendel.map((b) => ({ datei: b.datei, clips: b.clips, bytes: b.bytes.length })),
      manifest: { pfad: manifestPfad, clips: manifest.clips.length, stimmen: manifest.stimmen.map((s) => s.id) },
      alteBuendel,
      hochladen: hochgeladen,
    }),
  );
  return 0;
}

main().then(
  (code) => (process.exitCode = code),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  },
);
