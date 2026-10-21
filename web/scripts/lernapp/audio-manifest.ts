// Bündel `.lpa` bauen und das Audio-Manifest fortschreiben (PLAN §6.8 Schritte 4–5, ADR 0039 Nr. 3, 6.3–6.4 mit
// Fortschreibung S4/S5 und L3-05; src/lib/lernapp/audio/manifest.ts, src/lib/lernapp/audio/blob.ts).
// - Aufgenommen werden nur Clips der Liste, die der Prüfbericht (`pnpm lernapp:audio-pruefen`) mit „ok“ führt – mit
//   demselben SHA-256 wie die Datei im Clipordner.
// - Gebaut werden nur die betroffenen Bündel (je Einheit und Stimme); sie landen in `<aus>/<sprache>/<datei>` (Scratchpad,
//   nie im Repository). Clips eines betroffenen älteren Bündels liest das Skript aus `<aus>` oder – falls
//   `LERNAPP_BLOB_BASIS` gesetzt ist – aus dem öffentlichen Blob, je Bündel einmal und nur für betroffene Bündel.
// - Hochladen in den Blob `lernapp` nur mit `--hochladen`, dem eigenen Schlüssel `LERNAPP_BLOB_READ_WRITE_TOKEN` und
//   `LERNAPP_BLOB_BASIS` desselben Speichers (Menschen-Schritt LM-15). Ohne Schlüssel wird es übersprungen und gemeldet; ein
//   Schlüssel ohne passende Basisadresse oder zum Speicher von `BLOB_READ_WRITE_TOKEN`/`AUDIO_BLOB_READ_WRITE_TOKEN` bricht
//   vor dem Bau ab. Hochgeladen werden alle Bündel, auf die das Manifest verweist und die das eingecheckte Manifest noch nicht
//   kennt (aus diesem Lauf oder aus `<aus>`); danach wird jedes über `LERNAPP_BLOB_BASIS` abgerufen und am SHA-256 geprüft.
// - Ins Repository (`inhalte/lernapp/audio-manifest/<sprache>.json`) schreibt das Skript das Manifest nur, wenn jedes Bündel,
//   auf das es verweist, so belegt ist oder schon im eingecheckten Manifest stand – sonst nach `--manifest` bzw.
//   `<aus>/manifest-<sprache>.json` (Probelauf). Ein neues Manifest ohne Clips legt es im Repository nicht an.
// - Alte Bündel bleiben im Blob; das Skript nennt sie (Löschen entscheiden Menschen, wenn kein Paket mehr darauf verweist).
// - `--bereinigen`: Clips zu Texten, die nicht mehr vertonbar sind (gelöscht, zurückgezogen, Religionsbezug), fallen aus
//   Manifest und Bündeln (Neubau, S-L1 N-3).
// Aufruf: pnpm lernapp:audio-manifest <sprache> --liste <liste.jsonl> --clips <ordner> --pruefung <bericht.json>
//         --aus <bündelordner> [--manifest <pfad>] [--bereinigen] [--hochladen] [--testkurs | --inhalte <wurzel>]
// Rückgabe: 0 in Ordnung, 1 Fehler (auch: ein Bündel ließ sich nicht belegen), 2 Aufruf bzw. Ziel des Hochladens.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { testkursQuellen } from '../../drizzle/seeds/lernapp-test';
import { belegeImBlob, blobZiel, type BlobZiel, manifestInsRepository, type ZuBelegen } from '../../src/lib/lernapp/audio/blob';
import { leseJsonl, vertonbareTexte } from '../../src/lib/lernapp/audio/liste';
import {
  alteBuendelFuerNeubau,
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
import { leseBuendelPfad } from '../../src/lib/lernapp/paket/buendel';
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
  // Ziel des Hochladens vor allem anderen prüfen: lieber gar nicht als in den falschen Speicher
  let ziel: BlobZiel | null = null;
  let hochgeladen = 'nicht angefordert (ohne --hochladen)';
  if (values.hochladen) {
    const z = blobZiel(process.env);
    if ('fehler' in z) {
      console.error(`Hochladen abgebrochen: ${z.fehler}`);
      return 2;
    }
    if ('ziel' in z) ziel = z.ziel;
    else hochgeladen = `übersprungen: ${z.ueberspringen}`;
  }

  const stimme = stimmeFuer(sprache);
  const liste = leseJsonl(readFileSync(values.liste, 'utf8')).filter((z) => z.sprache === sprache);
  const fremd = liste.filter((z) => z.stimme !== stimme?.id);
  if (fremd.length) throw new Error(`${fremd.length} Einträge gehören nicht zur freigegebenen Stimme der Sprache ${sprache}`);
  const pruefung = new Map((JSON.parse(readFileSync(values.pruefung, 'utf8')) as { clips: Pruefclip[] }).clips.map((c) => [c.textHash, c]));

  const repoManifest = join(INHALT_WURZEL, 'audio-manifest', `${sprache}.json`);
  const eingecheckt = existsSync(repoManifest) ? leseManifest(readFileSync(repoManifest, 'utf8')) : null;
  const quelle = values.manifest ?? repoManifest;
  const alt = existsSync(quelle) ? leseManifest(readFileSync(quelle, 'utf8')) : leeresManifest(sprache);

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

  // Bündel lokal (`<aus>/<sprache>/<datei>`) bzw. öffentlich (`<basis>/<schlüssel>`)
  const lokal = (schluessel: string) => {
    const pfad = join(values.aus!, schluessel.replace(/^lernapp\/audio\//, ''));
    return existsSync(pfad) ? new Uint8Array(readFileSync(pfad)) : null;
  };
  const abrufen = async (adresse: string): Promise<Uint8Array | null> => {
    const antwort = await fetch(adresse).catch(() => null);
    return antwort?.ok ? new Uint8Array(await antwort.arrayBuffer()) : null;
  };

  // Ältere Bündel nur, soweit der Neubau Clips aus ihnen übernimmt – je Bündel ein Versuch
  const basis = process.env.LERNAPP_BLOB_BASIS?.trim().replace(/\/+$/, '');
  const alteBytes = new Map<string, Uint8Array>();
  for (const schluessel of alteBuendelFuerNeubau({ alt, neu, entfernen })) {
    const bytes = lokal(schluessel) ?? (basis ? await abrufen(`${basis}/${schluessel}`) : null);
    if (!bytes) throw new Error(`Bündel ${schluessel} weder lokal noch im Blob (LERNAPP_BLOB_BASIS) – Neubau nicht möglich`);
    alteBytes.set(schluessel, bytes);
  }
  const { manifest, buendel, alteBuendel } = ergaenzeManifest({
    alt,
    neu,
    entfernen,
    stimmen: stimme ? [manifestStimme(stimme)] : [],
    alteClips: (schluessel, clips) => clipsAusBuendel(alteBytes.get(schluessel)!, clips),
  });
  alteBytes.clear();

  for (const b of buendel) {
    const datei = join(values.aus, b.sprache, b.datei);
    mkdirSync(dirname(datei), { recursive: true });
    writeFileSync(datei, b.bytes);
  }

  // Belegen: Bündel, auf die das Manifest verweist und die das eingecheckte Manifest noch nicht kennt
  const bekannt = eingecheckt ? new Set(eingecheckt.clips.map((c) => c.buendel)) : null;
  const verweise = [...new Set(manifest.clips.map((c) => c.buendel))];
  const offen = verweise.filter((s) => !bekannt?.has(s));
  let belegt = new Set<string>();
  const fehler: string[] = [];
  if (ziel && offen.length) {
    // Bytes aus diesem Lauf, sonst aus `<aus>` (früherer Probelauf, erst beim Belegen gelesen), sonst nur prüfen
    const gebaut = new Map(buendel.map((b) => [b.schluessel, b]));
    const zuBelegen: ZuBelegen[] = offen.map((schluessel) => {
      const b = gebaut.get(schluessel);
      if (b) return { schluessel, sha256: b.sha256, bytes: () => b.bytes };
      const sha16 = leseBuendelPfad(schluessel.replace(/^lernapp\/audio\//, ''))?.sha16;
      if (!sha16) throw new Error(`Bündel ungültig: ${schluessel}`);
      return { schluessel, sha256: sha16, bytes: () => lokal(schluessel) };
    });
    const { head, put } = await import('@vercel/blob');
    const { token } = ziel;
    const r = await belegeImBlob(ziel, zuBelegen, {
      vorhanden: async (schluessel) => Boolean(await head(schluessel, { token }).catch(() => null)),
      hochladen: async (schluessel, bytes) =>
        (
          await put(schluessel, Buffer.from(bytes), {
            access: 'public',
            token,
            addRandomSuffix: false,
            allowOverwrite: false,
            cacheControlMaxAge: 31_536_000,
            contentType: 'application/octet-stream',
          })
        ).url,
      abrufen,
    });
    belegt = r.belegt;
    fehler.push(...r.fehler);
    hochgeladen = `${r.hochgeladen} Bündel hochgeladen, ${r.belegt.size} von ${offen.length} im Blob belegt (SHA-256)`;
  } else if (ziel) hochgeladen = 'nichts zu laden';

  const insRepo = manifestInsRepository({ verweise, eingecheckt: bekannt, belegt });
  const lokalesManifest =
    values.manifest && resolve(values.manifest) !== resolve(repoManifest) ? values.manifest : join(values.aus, `manifest-${sprache}.json`);
  const manifestPfad = insRepo.ja ? repoManifest : lokalesManifest;
  mkdirSync(dirname(manifestPfad), { recursive: true });
  writeFileSync(manifestPfad, manifestText(manifest));

  console.log(
    JSON.stringify({
      sprache,
      neueClips: neu.length,
      zurueckgestellt: zurueck,
      entfernt: entfernen.size,
      buendel: buendel.map((b) => ({ datei: b.datei, clips: b.clips, bytes: b.bytes.length })),
      manifest: {
        pfad: manifestPfad,
        repository: insRepo.ja,
        ohneBeleg: insRepo.fehlen.length,
        clips: manifest.clips.length,
        stimmen: manifest.stimmen.map((s) => s.id),
      },
      alteBuendel,
      hochladen: hochgeladen,
    }),
  );
  for (const f of fehler) console.error(f);
  return fehler.length ? 1 : 0;
}

main().then(
  (code) => (process.exitCode = code),
  (e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exitCode = 1;
  },
);
