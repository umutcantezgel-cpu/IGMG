import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  belegeImBlob,
  type BlobZiel,
  type BlobZugriff,
  blobZiel,
  LERNAPP_TOKEN,
  manifestInsRepository,
  speicherVonBasis,
  speicherVonToken,
} from '@/lib/lernapp/audio/blob';
import { sha256Hex } from '@/lib/lernapp/paket/hash';

/**
 * Gegenprüfung L3-05, Mangel 1 (ADR 0039 Fortschreibung L3-05 Nr. 7 und 10): Hochladen nur in den Speicher „lernapp“ – eigener
 * Schlüssel, Basisadresse desselben Speichers, Beleg jedes Bündels über die öffentliche Adresse (SHA-256), Manifest erst
 * danach ins Repository (Mangel 4: kein neues leeres Manifest dort). Schlüssel und Adressen sind Platzhalter; die Bytes sind
 * keine Audiodaten.
 */
const WEB = join(import.meta.dirname, '..', '..', '..');
const LERNAPP = 'vercel_blob_rw_LernApp1_beispielgeheimnis';
const MEDIEN = 'vercel_blob_rw_Medien1_beispielgeheimnis';
const BASIS = 'https://lernapp1.public.blob.vercel-storage.com';

describe('Ziel des Hochladens (blobZiel)', () => {
  it('liest die Speicherkennung aus Schlüssel und öffentlicher Adresse', () => {
    expect(speicherVonToken(LERNAPP)).toBe('lernapp1');
    expect(speicherVonToken('beliebig')).toBeNull();
    expect(speicherVonBasis(`${BASIS}/`)).toBe('lernapp1');
    for (const falsch of [
      'http://lernapp1.public.blob.vercel-storage.com',
      'https://lernapp1.blob.vercel-storage.com',
      `${BASIS}/pfad`,
      'https://cdn.beispiel.de',
    ])
      expect(speicherVonBasis(falsch), falsch).toBeNull();
  });

  it('ohne eigenen Schlüssel: übersprungen – auch wenn BLOB_READ_WRITE_TOKEN (privater Medienspeicher) gesetzt ist', () => {
    expect(blobZiel({ BLOB_READ_WRITE_TOKEN: MEDIEN, LERNAPP_BLOB_BASIS: BASIS })).toEqual({
      ueberspringen: `${LERNAPP_TOKEN} fehlt – Menschen-Schritt LM-15`,
    });
  });

  it('Abbruch: ohne Basisadresse, mit fremder Basisadresse, mit dem Speicher des Medien- oder Rezitationsschlüssels', () => {
    const fehler = (env: Record<string, string>) => {
      const z = blobZiel({ [LERNAPP_TOKEN]: LERNAPP, ...env });
      return 'fehler' in z ? z.fehler : null;
    };
    expect(fehler({})).toMatch(/LERNAPP_BLOB_BASIS/);
    expect(fehler({ LERNAPP_BLOB_BASIS: 'https://medien1.public.blob.vercel-storage.com' })).toMatch(/verschiedenen Speichern/);
    expect(fehler({ LERNAPP_BLOB_BASIS: 'https://cdn.beispiel.de' })).toMatch(/nicht die öffentliche Adresse/);
    expect(fehler({ LERNAPP_BLOB_BASIS: BASIS, BLOB_READ_WRITE_TOKEN: LERNAPP })).toMatch(/BLOB_READ_WRITE_TOKEN/);
    expect(fehler({ LERNAPP_BLOB_BASIS: BASIS, AUDIO_BLOB_READ_WRITE_TOKEN: 'vercel_blob_rw_LERNAPP1_anderes' })).toMatch(
      /AUDIO_BLOB_READ_WRITE_TOKEN/,
    );
    const z = blobZiel({ [LERNAPP_TOKEN]: ` ${LERNAPP} `, BLOB_READ_WRITE_TOKEN: MEDIEN, LERNAPP_BLOB_BASIS: `${BASIS}/` });
    expect(z).toEqual({ ziel: { token: LERNAPP, basis: BASIS, speicher: 'lernapp1' } });
  });
});

/** Speicher-Attrappe: hält Bytes je Schlüssel; `meldet` simuliert die Adresse, die der Speicher beim Hochladen nennt. */
function attrappe(o: { da?: Record<string, Uint8Array>; meldet?: string; verfaelscht?: boolean } = {}) {
  const speicher = new Map(Object.entries(o.da ?? {}));
  const aufrufe = { hochladen: [] as string[], abrufen: [] as string[] };
  const zugriff: BlobZugriff = {
    vorhanden: async (s) => speicher.has(s),
    hochladen: async (s, bytes) => {
      aufrufe.hochladen.push(s);
      speicher.set(s, bytes);
      return `${o.meldet ?? BASIS}/${s}`;
    },
    abrufen: async (adresse) => {
      aufrufe.abrufen.push(adresse);
      const b = speicher.get(adresse.slice(BASIS.length + 1));
      return b && o.verfaelscht ? new Uint8Array([...b, 0]) : (b ?? null);
    },
  };
  return { zugriff, aufrufe };
}

describe('Belegen im Blob (belegeImBlob)', () => {
  const ziel: BlobZiel = { token: LERNAPP, basis: BASIS, speicher: 'lernapp1' };
  const bytes = (n: number) => new Uint8Array([n, n + 1, n + 2]);
  const schluessel = (n: number) => `lernapp/audio/de/de.a1.e0${n}-${sha256Hex(bytes(n)).slice(0, 16)}.lpa`;
  const eintrag = (n: number) => ({ schluessel: schluessel(n), sha256: sha256Hex(bytes(n)), bytes: () => bytes(n) });

  it('lädt fehlende hoch, überspringt vorhandene und belegt jedes über die öffentliche Adresse', async () => {
    const vorhanden = eintrag(2);
    const { zugriff, aufrufe } = attrappe({ da: { [vorhanden.schluessel]: bytes(2) } });
    const r = await belegeImBlob(ziel, [eintrag(1), vorhanden], zugriff);
    expect(r).toEqual({ belegt: new Set([eintrag(1).schluessel, vorhanden.schluessel]), hochgeladen: 1, fehler: [] });
    expect(aufrufe.hochladen).toEqual([eintrag(1).schluessel]);
    expect(aufrufe.abrufen).toEqual([`${BASIS}/${eintrag(1).schluessel}`, `${BASIS}/${vorhanden.schluessel}`]);
  });

  it('nicht belegt: anderer Speicher meldet sich, Bytes weichen ab, nicht abrufbar – die übrigen laufen weiter', async () => {
    const fremd = await belegeImBlob(ziel, [eintrag(1)], attrappe({ meldet: 'https://medien1.public.blob.vercel-storage.com' }).zugriff);
    expect(fremd.belegt.size).toBe(0);
    expect(fremd.fehler).toEqual([`${eintrag(1).schluessel}: der Speicher meldet eine andere Adresse als LERNAPP_BLOB_BASIS`]);
    const falsch = await belegeImBlob(ziel, [eintrag(1), eintrag(2)], attrappe({ verfaelscht: true }).zugriff);
    expect(falsch.fehler).toHaveLength(2);
    expect(falsch.fehler[0]).toMatch(/SHA-256/);
    const { zugriff } = attrappe();
    const ohneBytes = { schluessel: eintrag(3).schluessel, sha256: eintrag(3).sha256.slice(0, 16) };
    const r = await belegeImBlob(ziel, [ohneBytes, eintrag(4)], zugriff);
    expect(r.fehler).toEqual([`${ohneBytes.schluessel}: unter LERNAPP_BLOB_BASIS nicht abrufbar`]);
    expect([...r.belegt]).toEqual([eintrag(4).schluessel]);
  });

  it('ohne Bytes (früher hochgeladen): Beleg über die 16 Hex-Zeichen des Dateinamens', async () => {
    const e = eintrag(5);
    const { zugriff, aufrufe } = attrappe({ da: { [e.schluessel]: bytes(5) } });
    const r = await belegeImBlob(ziel, [{ schluessel: e.schluessel, sha256: e.sha256.slice(0, 16), bytes: () => null }], zugriff);
    expect([...r.belegt]).toEqual([e.schluessel]);
    expect(aufrufe.hochladen).toEqual([]);
  });

  it('lokale Bytes, die nicht zum Dateinamen passen, werden nicht hochgeladen', async () => {
    const { zugriff, aufrufe } = attrappe();
    const r = await belegeImBlob(
      ziel,
      [{ schluessel: schluessel(6), sha256: sha256Hex(bytes(6)).slice(0, 16), bytes: () => bytes(7) }],
      zugriff,
    );
    expect(r).toEqual({ belegt: new Set(), hochgeladen: 0, fehler: [`${schluessel(6)}: Inhalt passt nicht zum Dateinamen`] });
    expect(aufrufe).toEqual({ hochladen: [], abrufen: [] });
  });
});

describe('Manifest ins Repository (manifestInsRepository)', () => {
  it('nur wenn jedes Bündel belegt ist oder schon eingecheckt war; ein neues leeres Manifest nie', () => {
    const eingecheckt = new Set(['a']);
    expect(manifestInsRepository({ verweise: ['a', 'b'], eingecheckt, belegt: new Set() })).toEqual({
      ja: false,
      fehlen: ['b'],
      leer: false,
    });
    expect(manifestInsRepository({ verweise: ['a', 'b'], eingecheckt, belegt: new Set(['b']) }).ja).toBe(true);
    expect(manifestInsRepository({ verweise: ['b'], eingecheckt: null, belegt: new Set(['b']) }).ja).toBe(true);
    // Mangel 4: nichts zu bauen und kein eingechecktes Manifest – keine leere Datei im Repository
    expect(manifestInsRepository({ verweise: [], eingecheckt: null, belegt: new Set() })).toEqual({ ja: false, fehlen: [], leer: true });
    // --bereinigen hat alle Clips entfernt: Das eingecheckte Manifest wird geleert (Abgleich löscht die Zeilen)
    expect(manifestInsRepository({ verweise: [], eingecheckt, belegt: new Set() }).ja).toBe(true);
  });
});

describe('Skript lernapp:audio-manifest (Verdrahtung)', () => {
  const ordner = mkdtempSync(join(tmpdir(), 'igmg-audio-manifest-'));
  afterAll(() => rmSync(ordner, { recursive: true, force: true }));
  const liste = join(ordner, 'liste.jsonl');
  const pruefung = join(ordner, 'pruefung.json');
  writeFileSync(liste, '');
  writeFileSync(pruefung, JSON.stringify({ clips: [] }));
  // tr: keine freigegebene Stimme, also kein eingechecktes Manifest zu erwarten
  const repoManifest = join(WEB, 'inhalte', 'lernapp', 'audio-manifest', 'tr.json');
  const lauf = (env: Record<string, string>) => {
    const basisEnv: NodeJS.ProcessEnv = { ...process.env };
    for (const k of Object.keys(basisEnv)) if (/BLOB/.test(k)) delete basisEnv[k];
    const argumente = ['-s', 'exec', 'tsx', '--conditions=react-server', 'scripts/lernapp/audio-manifest.ts', 'tr'];
    const pfade = ['--liste', liste, '--clips', ordner, '--pruefung', pruefung, '--aus', join(ordner, 'lpa'), '--hochladen'];
    try {
      const aus = execFileSync('pnpm', [...argumente, ...pfade], {
        cwd: WEB,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...basisEnv, ...env },
      });
      return { rc: 0, aus, fehler: '' };
    } catch (e) {
      const f = e as { status: number; stdout: string; stderr: string };
      return { rc: f.status, aus: f.stdout, fehler: f.stderr };
    }
  };

  it('Abbruch vor dem Bau, wenn der eigene Schlüssel ohne LERNAPP_BLOB_BASIS gesetzt ist', () => {
    const r = lauf({ [LERNAPP_TOKEN]: LERNAPP });
    expect(r.rc).toBe(2);
    expect(r.fehler).toMatch(/Hochladen abgebrochen: --hochladen braucht LERNAPP_BLOB_BASIS/);
    expect(r.aus).toBe('');
  }, 60_000);

  it('nur BLOB_READ_WRITE_TOKEN: übersprungen, nichts hochgeladen, kein leeres Manifest im Repository', () => {
    const vorher = existsSync(repoManifest);
    const r = lauf({ BLOB_READ_WRITE_TOKEN: MEDIEN, LERNAPP_BLOB_BASIS: BASIS });
    expect(r.rc).toBe(0);
    const bericht = JSON.parse(r.aus) as { hochladen: string; manifest: { pfad: string; repository: boolean } };
    expect(bericht.hochladen).toBe(`übersprungen: ${LERNAPP_TOKEN} fehlt – Menschen-Schritt LM-15`);
    if (!vorher) {
      expect(bericht.manifest).toMatchObject({ pfad: join(ordner, 'lpa', 'manifest-tr.json'), repository: false });
      expect(existsSync(repoManifest)).toBe(false);
      expect(JSON.parse(readFileSync(bericht.manifest.pfad, 'utf8'))).toMatchObject({ sprache: 'tr', clips: [] });
    }
  }, 60_000);
});
