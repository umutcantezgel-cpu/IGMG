import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * Lokaler Helfer-Server (ADR 0036), Befund S3 der Sicherheitsprüfung: Die tägliche Sicherung meldet nur „ok“, wenn jeder
 * Schritt gelingt, verwirft Fehlschläge und rotiert nur über die Zahl gültiger Sicherungen hinaus; der Medienspiegel lädt
 * private Dateien mit Token und meldet Fehlschläge. Läuft mit Platzhaltern für pg_dump, age und die Cockpit-Meldung.
 */
const KIT = resolve(import.meta.dirname, '../../../betrieb/lokal');
const basis = mkdtempSync(join(tmpdir(), 'igmg-sicherung-'));
afterAll(() => rmSync(basis, { recursive: true, force: true }));

/** Platzhalter-Programme: pg_dump (Exit-Code und Größe über Umgebung), age (Kopfzeile + Eingabe), Meldung (Protokoll). */
function werkzeuge(): { bin: string; protokoll: string; melden: string } {
  const bin = mkdtempSync(join(basis, 'bin-'));
  const protokoll = join(bin, 'meldungen.txt');
  writeFileSync(join(bin, 'pg_dump'), '#!/bin/sh\nhead -c "${STUB_GROESSE:-200000}" /dev/urandom | base64\nexit "${STUB_EXIT:-0}"\n');
  writeFileSync(
    join(bin, 'age'),
    '#!/bin/sh\nziel=""\nwhile [ $# -gt 0 ]; do [ "$1" = "-o" ] && ziel="$2"; shift; done\nprintf "age-encryption.org/v1\\n" >"$ziel"\ncat >>"$ziel"\n',
  );
  const melden = join(bin, 'melden.sh');
  writeFileSync(melden, `#!/bin/sh\necho "$1 $2 $3" >>"${protokoll}"\n`);
  for (const d of ['pg_dump', 'age', 'melden.sh']) chmodSync(join(bin, d), 0o755);
  return { bin, protokoll, melden };
}

function sichern(ziel: string, w: ReturnType<typeof werkzeuge>, env: Record<string, string> = {}) {
  return spawnSync('sh', [join(KIT, 'sicherung/sichern.sh')], {
    env: {
      ...process.env,
      PATH: `${w.bin}:${process.env.PATH}`,
      SICHERUNG_DATABASE_URL: 'postgresql://platzhalter',
      AGE_EMPFAENGER: 'age1platzhalter',
      SICHERUNG_ZIEL: ziel,
      SICHERUNG_MELDEN: w.melden,
      ...env,
    },
    encoding: 'utf8',
  });
}

const meldungen = (w: ReturnType<typeof werkzeuge>) =>
  existsSync(w.protokoll) ? readFileSync(w.protokoll, 'utf8').trim().split('\n') : [];
const sicherungen = (ziel: string) =>
  readdirSync(ziel)
    .filter((d) => d.endsWith('.sql.gz.age'))
    .sort();

/** Ältere, gültige Sicherung (Datei + Prüfsumme) mit Alter in Tagen. */
function alteSicherung(ziel: string, tage: number, groesse = 50_000): string {
  const name = `igmg-2026${String(1000 + tage).slice(1)}-0243.sql.gz.age`;
  const datei = join(ziel, name);
  writeFileSync(datei, Buffer.concat([Buffer.from('age-encryption.org/v1\n'), Buffer.alloc(groesse, 1)]));
  writeFileSync(`${datei}.sha256`, 'x');
  const zeit = new Date(Date.now() - tage * 86_400_000);
  utimesSync(datei, zeit, zeit);
  return name;
}

describe('Sicherung (sichern.sh)', () => {
  it('pg_dump schlägt fehl: Meldung „fehler“, keine neue Datei, alte Sicherungen bleiben', () => {
    const ziel = mkdtempSync(join(basis, 'daten-'));
    const w = werkzeuge();
    const alt = [alteSicherung(ziel, 40), alteSicherung(ziel, 35), alteSicherung(ziel, 31)];
    const r = sichern(ziel, w, { STUB_EXIT: '1' });
    expect(r.status).toBe(0);
    expect(meldungen(w)).toEqual(['sicherung fehler 0']);
    expect(sicherungen(ziel)).toEqual([...alt].sort());
    expect(readdirSync(ziel).some((d) => d.endsWith('.teil'))).toBe(false);
  });

  it('leerer Abzug (unter der Mindestgröße): „fehler“, nichts gespeichert', () => {
    const ziel = mkdtempSync(join(basis, 'daten-'));
    const w = werkzeuge();
    sichern(ziel, w, { STUB_GROESSE: '0' });
    expect(meldungen(w)).toEqual(['sicherung fehler 0']);
    expect(sicherungen(ziel)).toEqual([]);
  });

  it('Erfolg: „ok“ mit Größe, Prüfsumme; Rotation behält die neuesten gültigen Sicherungen', () => {
    const ziel = mkdtempSync(join(basis, 'daten-'));
    const w = werkzeuge();
    const alt = [1, 2, 3, 4].map((t) => alteSicherung(ziel, t, 20_000));
    const r = sichern(ziel, w, { SICHERUNG_TAGE: '3' });
    expect(r.status).toBe(0);
    const [meldung] = meldungen(w);
    expect(meldung).toMatch(/^sicherung ok \d+$/);
    const liste = sicherungen(ziel);
    expect(liste).toHaveLength(3);
    const neu = liste.find((d) => !alt.includes(d));
    expect(neu).toBeDefined();
    expect(existsSync(join(ziel, `${neu}.sha256`))).toBe(true);
    expect(statSync(join(ziel, neu!)).size).toBe(Number(meldung.split(' ')[2]));
    // Die beiden ältesten (4 und 3 Tage) sind weg, samt Prüfsumme; die neueren bleiben
    expect(liste.filter((d) => d !== neu).sort()).toEqual([alt[0], alt[1]].sort());
    expect(readdirSync(ziel).filter((d) => d.endsWith('.sha256'))).toHaveLength(3);
  });

  it('auffällig klein gegenüber der vorigen: Datei bleibt, Meldung „fehler“', () => {
    const ziel = mkdtempSync(join(basis, 'daten-'));
    const w = werkzeuge();
    alteSicherung(ziel, 1, 2_000_000);
    sichern(ziel, w, { STUB_GROESSE: '20000' });
    expect(meldungen(w)[0]).toMatch(/^sicherung fehler \d+$/);
    expect(sicherungen(ziel)).toHaveLength(2);
  });
});

describe('Medienspiegel (spiegel.mjs)', () => {
  it('lädt private Dateien mit get(…, private) und meldet Fehlschläge als „fehler“', async () => {
    const ziel = mkdtempSync(join(basis, 'spiegel-'));
    process.env.SPIEGEL_NUR_MODUL = '1';
    process.env.SPIEGEL_ZIEL = ziel;
    const { lauf } = (await import(join(KIT, 'spiegel/spiegel.mjs'))) as {
      lauf: (o: unknown) => Promise<{ neu: number; bytes: number; fehlschlaege: number }>;
    };
    const inhalt = Buffer.from('Testinhalt');
    const zugriffe: { pfad: string; access: string }[] = [];
    const blob = (fehlt: boolean) => ({
      list: async () => ({
        blobs: [
          { pathname: 'medien/a.jpg', size: inhalt.length },
          { pathname: 'medien/b.jpg', size: inhalt.length },
        ],
        cursor: undefined,
      }),
      get: async (pfad: string, o: { access: string }) => {
        zugriffe.push({ pfad, access: o.access });
        if (fehlt && pfad.endsWith('b.jpg')) return null;
        return { statusCode: 200, stream: new Blob([inhalt]).stream() };
      },
    });
    const meldungenSpiegel: [boolean, number][] = [];
    const meldung = async (ok: boolean, bytes: number) => {
      meldungenSpiegel.push([ok, bytes]);
    };
    const r1 = await lauf({ blob: blob(true), meldung });
    expect(r1).toEqual({ neu: 1, bytes: inhalt.length, fehlschlaege: 1 });
    expect(meldungenSpiegel.at(-1)).toEqual([false, inhalt.length]);
    expect(zugriffe.every((z) => z.access === 'private')).toBe(true);
    expect(readFileSync(join(ziel, 'medien/a.jpg'), 'utf8')).toBe('Testinhalt');
    const r2 = await lauf({ blob: blob(false), meldung });
    expect(r2.fehlschlaege).toBe(0);
    expect(meldungenSpiegel.at(-1)).toEqual([true, inhalt.length]);
  });
});
