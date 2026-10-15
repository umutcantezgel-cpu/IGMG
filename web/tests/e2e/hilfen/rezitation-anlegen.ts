// Testdaten für die Player-E2E (Z-16): eine aktive Rezitation mit SYNTHETISCHEM Testton – nie eine Rezitation.
// Der Ton entsteht hier als WAV (Sinus je Vers mit Pause dahinter) und wird mit ffmpeg nach Ogg/Opus gewandelt (die
// Ablage nimmt nur m4a, mp3, ogg und webm an, ADR 0029); dazu eine Test-Vereinbarung (PDF, Pflicht für „aktiv“),
// Verszeiten und geprüfte Wortzeiten. Alles über dieselben Wege wie die Werkstatt (legeAudioAb, Speicher-Adapter).
//
// Aufruf (nur außerhalb der Produktion, mit der Umgebung des Servers):
//   pnpm exec tsx --conditions=react-server --env-file-if-exists=.env tests/e2e/hilfen/rezitation-anlegen.ts [--sure 108] [--json]
//   … --entfernen <id>     Rezitation samt Dateien, Zeiten und Vereinbarung wieder entfernen
// Gegen einen Entwicklungsserver mit PGlite vor dem Start anlegen (ein zweiter Öffner beschädigt PGlite) und die Ausgabe
// mit E2E_TESTREZITATION=<datei> an die Spec geben (tests/e2e/hilfen/rezitation.ts).
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { and, eq, inArray } from 'drizzle-orm';
import { legeAudioAb } from '../../../src/lib/audio/ablage';
import { loescheAudio } from '../../../src/lib/audio/speicher';
import { holeDb, schema } from '../../../src/lib/db';
import { speicher } from '../../../src/lib/storage';
import { betriebsart } from '../../../src/lib/umgebung';

const { values } = parseArgs({
  options: {
    sure: { type: 'string', default: '108' },
    entfernen: { type: 'string' },
    json: { type: 'boolean', default: false },
  },
});

function fehler(text: string): never {
  console.error(text);
  process.exit(1);
}

/** Je Vers: Ton (ms) und danach Stille; Frequenz steigt je Vers (hörbar und messbar verschieden). */
const TON_MS = 1500;
const VERS_MS = 2000;
const ABTASTRATE = 48_000;

/** Mono-WAV (PCM 16 bit) mit einem Sinus je Vers und weichen Kanten (10 ms), danach Stille. */
function wavTestton(verse: number): Buffer {
  const proVers = (VERS_MS * ABTASTRATE) / 1000;
  const ton = (TON_MS * ABTASTRATE) / 1000;
  const kante = ABTASTRATE / 100;
  const daten = Buffer.alloc(verse * proVers * 2);
  for (let v = 0; v < verse; v++) {
    const frequenz = 330 + 110 * v;
    for (let i = 0; i < ton; i++) {
      const huelle = Math.min(1, i / kante, (ton - i) / kante);
      daten.writeInt16LE(Math.round(Math.sin((2 * Math.PI * frequenz * i) / ABTASTRATE) * 0.3 * huelle * 32767), (v * proVers + i) * 2);
    }
  }
  const kopf = Buffer.alloc(44);
  kopf.write('RIFF', 0);
  kopf.writeUInt32LE(36 + daten.length, 4);
  kopf.write('WAVEfmt ', 8);
  kopf.writeUInt32LE(16, 16);
  kopf.writeUInt16LE(1, 20);
  kopf.writeUInt16LE(1, 22);
  kopf.writeUInt32LE(ABTASTRATE, 24);
  kopf.writeUInt32LE(ABTASTRATE * 2, 28);
  kopf.writeUInt16LE(2, 32);
  kopf.writeUInt16LE(16, 34);
  kopf.write('data', 36);
  kopf.writeUInt32LE(daten.length, 40);
  return Buffer.concat([kopf, daten]);
}

/** WAV → Ogg/Opus (sonst Ogg/Vorbis, sonst MP3) mit ffmpeg. */
function kodiere(wav: Buffer): Buffer {
  const ordner = mkdtempSync(join(tmpdir(), 'igmg-testton-'));
  try {
    writeFileSync(join(ordner, 'ton.wav'), wav);
    for (const [codec, datei] of [
      ['libopus', 'ton.ogg'],
      ['libvorbis', 'ton.ogg'],
      ['libmp3lame', 'ton.mp3'],
    ] as const) {
      try {
        execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', join(ordner, 'ton.wav'), '-c:a', codec, join(ordner, datei)]);
        return readFileSync(join(ordner, datei));
      } catch {
        // nächster Codec
      }
    }
    return fehler('ffmpeg mit libopus, libvorbis oder libmp3lame fehlt – der Testton lässt sich nicht kodieren.');
  } finally {
    rmSync(ordner, { recursive: true, force: true });
  }
}

/** Kleinste gültige PDF-Datei als Test-Vereinbarung (Platzhalter, kein Vertragstext). */
function testPdf(): Buffer {
  const teile = [
    '%PDF-1.4\n',
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 200 100] >> endobj\n',
  ];
  const versatz: number[] = [];
  let text = '';
  for (const t of teile) {
    if (t.startsWith('%')) text += t;
    else {
      versatz.push(Buffer.byteLength(text));
      text += t;
    }
  }
  const xref = Buffer.byteLength(text);
  text += `xref\n0 4\n0000000000 65535 f \n${versatz.map((v) => `${String(v).padStart(10, '0')} 00000 n \n`).join('')}`;
  text += `trailer << /Size 4 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(text);
}

async function entfernen(db: ReturnType<typeof holeDb>, id: string) {
  const [r] = await db.select().from(schema.quranRezitation).where(eq(schema.quranRezitation.id, id)).limit(1);
  if (!r) return;
  const dateien = await db.select({ pfad: schema.quranAudio.pfad }).from(schema.quranAudio).where(eq(schema.quranAudio.rezitationId, id));
  await db.delete(schema.quranRezitation).where(eq(schema.quranRezitation.id, id));
  for (const d of dateien) await loescheAudio(d.pfad.replace(/^\//, '')).catch(() => undefined);
  if (r.vereinbarungMediumId) {
    const [m] = await db.select().from(schema.medium).where(eq(schema.medium.id, r.vereinbarungMediumId)).limit(1);
    await db.delete(schema.medium).where(eq(schema.medium.id, r.vereinbarungMediumId));
    if (m) await speicher().loesche(m.schluessel).catch(() => undefined);
  }
}

async function main() {
  if (betriebsart(process.env) === 'produktion') fehler('Testdaten gibt es nur außerhalb der Produktion (SITE_MODE/NODE_ENV).');
  const db = holeDb();
  if (values.entfernen) {
    if (!/^e2e-testton-[a-z0-9]{1,12}$/.test(values.entfernen)) fehler('--entfernen: nur Test-Rezitationen (e2e-testton-…).');
    await entfernen(db, values.entfernen);
    console.log(values.json ? JSON.stringify({ entfernt: values.entfernen }) : `Entfernt: ${values.entfernen}`);
    return;
  }
  const sure = Number(values.sure);
  const [s] = await db.select({ verse: schema.quranSure.verseAnzahl }).from(schema.quranSure).where(eq(schema.quranSure.nr, sure)).limit(1);
  if (!s) fehler(`Sure ${values.sure} fehlt – Inhaltsimport (pnpm inhalte:import) in dieser Datenbank?`);
  if (s.verse > 10) fehler('Für den Testton bitte eine kurze Sure (höchstens 10 Verse).');

  const id = `e2e-testton-${randomBytes(4).toString('hex')}`;
  const name = { de: '[Testton, synthetisch]', tr: '[Test sesi, sentetik]', en: '[Test tone, synthetic]' };
  const rezitator = '[Testton]';
  const lizenz = '[Nur für Tests]';
  // Vereinbarung (Pflicht für „aktiv“): Platzhalter-PDF im Speicher und als Medium
  const pdf = testPdf();
  const schluessel = `e2e/${id}-vereinbarung.pdf`;
  await speicher().schreibe(schluessel, pdf, 'application/pdf');
  const [medium] = await db
    .insert(schema.medium)
    .values({ schluessel, typ: 'application/pdf', groesse: pdf.length, alt: { de: '[Test-Vereinbarung]' }, dateiname: 'test-vereinbarung.pdf' })
    .returning({ id: schema.medium.id });
  await db.insert(schema.quranRezitation).values({ id, name, rezitator, art: 'eigen', lizenz, vereinbarungMediumId: medium.id });
  // Testton ablegen (wie die Werkstatt): eine Datei je Sure, danach Vers- und Wortzeiten
  const roh = kodiere(wavTestton(s.verse));
  const ablage = await legeAudioAb({ rezitationId: id, sure, roh, dauerMs: s.verse * VERS_MS });
  await db
    .insert(schema.quranVerszeit)
    .values(Array.from({ length: s.verse }, (_, i) => ({ rezitationId: id, sure, vers: i + 1, startMs: i * VERS_MS, endeMs: (i + 1) * VERS_MS })));
  const woerter = await db
    .select({ vers: schema.quranWort.vers, pos: schema.quranWort.pos })
    .from(schema.quranWort)
    .where(and(eq(schema.quranWort.sure, sure), inArray(schema.quranWort.vers, Array.from({ length: s.verse }, (_, i) => i + 1))));
  const jeVers = new Map<number, number[]>();
  for (const w of woerter) jeVers.set(w.vers, [...(jeVers.get(w.vers) ?? []), w.pos]);
  const wortzeiten = [...jeVers.entries()].flatMap(([vers, positionen]) => {
    const schritt = TON_MS / positionen.length;
    return positionen
      .sort((a, b) => a - b)
      .map((pos, i) => ({
        rezitationId: id,
        sure,
        vers,
        pos,
        startMs: Math.round((vers - 1) * VERS_MS + i * schritt),
        endeMs: Math.round((vers - 1) * VERS_MS + (i + 1) * schritt),
        quelle: 'mitklopfen' as const,
        geprueft: true,
      }));
  });
  if (wortzeiten.length) await db.insert(schema.quranWortzeit).values(wortzeiten);
  await db.update(schema.quranRezitation).set({ aktiv: true }).where(eq(schema.quranRezitation.id, id));

  const ergebnis = { id, sure, verse: s.verse, versMs: VERS_MS, tonMs: TON_MS, name, rezitator, lizenz, audio: ablage.pfad, mime: ablage.mime };
  console.log(values.json ? JSON.stringify(ergebnis) : `Angelegt: ${id} (Sure ${sure}, ${s.verse} Verse, ${ablage.mime}, ${ablage.bytes} Bytes)`);
}

main().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(e);
    process.exit(1);
  },
);
