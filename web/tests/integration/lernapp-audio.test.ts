import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { and, eq, like } from 'drizzle-orm';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { db as appDb, schema } from '@/lib/db';
import { ergaenzeManifest, leeresManifest } from '@/lib/lernapp/audio/manifest';
import { manifestStimme, THORSTEN } from '@/lib/lernapp/audio/stimmen';
import { leseBuendelKopf } from '@/lib/lernapp/paket/buendel';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { PaketSchema, VerzeichnisSchema } from '@/lib/lernapp/paket/typen';
import { verwaltungsUmgebung } from './hilfen/verwaltung';

/**
 * Audio-Kette L3-05 bis in den Spieler (ADR 0039 Nr. 3, 6.4; PLAN §6.8 Schritte 4–5) gegen PGlite mit dem Testkurs:
 * ein lokal gebautes Bündel (synthetische Töne als Clips der Sprachausgabe-Stimme) über das Manifest in `lernapp_audio`,
 * das Paket verweist darauf (Vorrang Sprachausgabe vor Testton), die Route liefert es aus `LERNAPP_AUDIO_LOKAL`;
 * Abgleich entfernt Clips, die nicht mehr im Manifest stehen; Religionsbezug und fremde Stimmen brechen den Import ab.
 */
const { client } = await verwaltungsUmgebung();
const { lernappTestkurs, TESTAUDIO_VERZEICHNIS } = await import('../../drizzle/seeds/lernapp-test');
const { AudioImportFehler, importiereAudioManifest } = await import('@/lib/lernapp/audio/import');
const verzeichnisRoute = await import('@/app/lern-app/pakete/[kurs]/route');
const einheitRoute = await import('@/app/lern-app/pakete/[kurs]/[einheit]/[hash]/route');
const audioRoute = await import('@/app/lern-app/audio/[...pfad]/route');

const lokal = mkdtempSync(join(tmpdir(), 'igmg-lernapp-audio-'));
afterAll(() => {
  rmSync(lokal, { recursive: true, force: true });
  return client.close();
});
afterEach(() => {
  delete process.env.LERNAPP_AUDIO_LOKAL;
});
beforeAll(async () => {
  await lernappTestkurs(appDb);
});

const kontext = <T extends Record<string, unknown>>(p: T) => ({ params: Promise.resolve(p) }) as never;
const anfrage = (pfad: string, kopf: Record<string, string> = {}) => new Request(`https://example.test${pfad}`, { headers: kopf });

async function paket(kurs: string, einheit: string) {
  const v = VerzeichnisSchema.parse(await (await verzeichnisRoute.GET(anfrage(`/lern-app/pakete/${kurs}`), kontext({ kurs }))).json());
  const e = v.einheiten.find((x) => x.schluessel === einheit)!;
  const r = await einheitRoute.GET(anfrage(`/lern-app/pakete/${kurs}/${einheit}/${e.hash}`), kontext({ kurs, einheit, hash: e.hash }));
  return { verzeichnis: e, paket: PaketSchema.parse(await r.json()) };
}

const testBytes = () => {
  const ordner = join(TESTAUDIO_VERZEICHNIS, 'de');
  return new Uint8Array(
    readFileSync(
      join(
        ordner,
        readdirSync(ordner).find((d) => d.endsWith('.lpa'))!,
      ),
    ),
  );
};
/** textHashes des Testbündels de (sortiert). */
const testHashes = () => leseBuendelKopf(testBytes(), testBytes().length).clips.map((c) => c.textHash);

/**
 * Töne des Testbündels de als „Sprachausgabe“-Clips derselben Texte, gebaut wie von `pnpm lernapp:audio-manifest` – ohne
 * die ersten `ohne` Clips (sonst wäre das Bündel bytegleich mit dem Testbündel).
 */
function lokalesBuendel(ohne: number) {
  const bytes = testBytes();
  const neu = leseBuendelKopf(bytes, bytes.length)
    .clips.slice(ohne)
    .map((c) => ({ textHash: c.textHash, stimme: THORSTEN.id, einheit: 'de.a1.e01', daten: bytes.slice(c.versatz, c.versatz + c.laenge) }));
  const r = ergaenzeManifest({ alt: leeresManifest('de'), neu, stimmen: [manifestStimme(THORSTEN)], alteClips: () => new Map() });
  for (const b of r.buendel) {
    mkdirSync(join(lokal, 'de'), { recursive: true });
    writeFileSync(join(lokal, 'de', b.datei), b.bytes);
  }
  return r;
}

describe('Manifest → lernapp_audio → Paket → Route', () => {
  it('lokal gebautes Bündel: Import, Paket verweist darauf (Sprachausgabe vor Testton), Route liefert es aus LERNAPP_AUDIO_LOKAL', async () => {
    const { manifest, buendel } = lokalesBuendel(1);
    const b = await importiereAudioManifest(appDb, manifest, { abgleichen: false });
    expect(b).toEqual({ sprache: 'de', neu: manifest.clips.length, geaendert: 0, gleich: 0, entfernt: 0 });
    expect(await importiereAudioManifest(appDb, manifest, { abgleichen: false })).toMatchObject({ neu: 0, gleich: manifest.clips.length });

    const datei = buendel[0]!.datei;
    const { verzeichnis, paket: p } = await paket('de-aus-tr', 'de.a1.e01');
    expect(verzeichnis.audio).toContainEqual({ adresse: `/lern-app/audio/de/${datei}`, bytes: buendel[0]!.bytes.length });
    expect(p.audio).toEqual(verzeichnis.audio);
    const stimmen = Object.values(p.eintraege).filter((x) => x.sprache === 'de' && x.stimme);
    expect(stimmen.filter((x) => x.stimme === THORSTEN.id)).toHaveLength(manifest.clips.length);
    expect(stimmen.filter((x) => x.stimme === 'test:ton')).toHaveLength(1);

    // ohne lokalen Ordner: nicht unter den Testbündeln → 404
    expect((await audioRoute.GET(anfrage('/'), kontext({ pfad: ['de', datei] }))).status).toBe(404);
    process.env.LERNAPP_AUDIO_LOKAL = lokal;
    const ganz = await audioRoute.GET(anfrage('/'), kontext({ pfad: ['de', datei] }));
    expect(ganz.status).toBe(200);
    const geliefert = new Uint8Array(await ganz.arrayBuffer());
    expect(sha256Hex(geliefert)).toBe(buendel[0]!.sha256);
    const clip = manifest.clips[0]!;
    const teil = await audioRoute.GET(
      anfrage('/', { range: `bytes=${clip.versatz}-${clip.versatz + clip.laenge - 1}` }),
      kontext({ pfad: ['de', datei] }),
    );
    expect(teil.status).toBe(206);
    expect(sha256Hex(new Uint8Array(await teil.arrayBuffer()))).toBe(clip.sha256);
    // die Testbündel bleiben daneben erreichbar
    const test = readdirSync(join(TESTAUDIO_VERZEICHNIS, 'tr')).find((d) => d.endsWith('.lpa'))!;
    expect((await audioRoute.GET(anfrage('/'), kontext({ pfad: ['tr', test] }))).status).toBe(200);
  });

  it('Abgleich: Clips, die nicht mehr im Manifest stehen, entfallen; der Text fällt auf den Testton zurück', async () => {
    const weg = testHashes()[1]!;
    const { manifest } = lokalesBuendel(2);
    const b = await importiereAudioManifest(appDb, manifest, { abgleichen: true });
    // neues Bündel (andere Bytes) → alle übrigen Zeilen geändert, der fehlende Clip entfällt
    expect(b).toEqual({ sprache: 'de', neu: 0, geaendert: manifest.clips.length, gleich: 0, entfernt: 1 });
    const a = schema.lernappAudio;
    const zeilen = await appDb
      .select()
      .from(a)
      .where(and(eq(a.sprache, 'de'), like(a.stimme, 'tts:%')));
    expect(zeilen.map((z) => z.textHash).sort()).toEqual(manifest.clips.map((c) => c.textHash).sort());
    // Testtöne bleiben unberührt
    expect(
      await appDb
        .select()
        .from(a)
        .where(and(eq(a.textHash, weg), eq(a.stimme, 'test:ton'))),
    ).toHaveLength(1);
  });

  it('fail closed: Clip zu einem Text mit Religionsbezug oder Sprachausgabe ohne Freigabe der Sprache', async () => {
    const { manifest } = lokalesBuendel(1);
    await expect(
      importiereAudioManifest(appDb, manifest, { abgleichen: false, verboten: new Set([manifest.clips[0]!.textHash]) }),
    ).rejects.toBeInstanceOf(AudioImportFehler);
    const tr = { ...leeresManifest('tr'), stimmen: [{ ...manifestStimme(THORSTEN) }] };
    await expect(importiereAudioManifest(appDb, tr, { abgleichen: true })).rejects.toThrow(/nicht freigegeben/);
    // Gegenprüfung L3-05: Testtöne nie im eingecheckten (abgeglichenen) Manifest
    const test = {
      ...leeresManifest('de'),
      stimmen: [{ id: 'test:ton', art: 'test' as const, bezeichnung: 'Testton', namensnennung: 'synthetischer Ton', wasserzeichen: false }],
    };
    await expect(importiereAudioManifest(appDb, test, { abgleichen: true })).rejects.toThrow(/Testton-Stimme/);
  });
});
