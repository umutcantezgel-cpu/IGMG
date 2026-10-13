import 'server-only';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { and, count, eq } from 'drizzle-orm';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { AudioFehler, legeAudioAb } from './ablage';
import { AUDIO_MAX_BYTES, audioFormat } from './format';
import { leseQuranAlign, pruefeManifest, type Manifest } from './manifest';
import { pruefeVerszeiten, type VersTripel } from './werkstatt';

/**
 * Import eines lizenzierten Rezitationssatzes (H-Q06, ADR 0029, MN-03b) – Kern für `scripts/rezitation-import.ts`.
 * Prüft zuerst alles (Manifest, Lizenzdatei, jede Datei mit SHA-256, Suren und Verse gegen die Datenbank) und schreibt
 * erst danach. Nur in eine Rezitation der Art „lizenziert“ (wird bei Bedarf inaktiv angelegt); setzt nie `aktiv` –
 * aktiviert wird nur in der Verwaltung mit hinterlegter Vereinbarung. Wiederholbar: gleiche Dateien und Zeiten ändern nichts.
 * quran-align-Zeiten kommen ungeprüft an; von Menschen geprüfte Wortzeiten bleiben ohne `ueberschreibeGeprueft` stehen.
 */
export class ImportFehler extends Error {
  constructor(public readonly fehler: string[]) {
    super(fehler.join('\n'));
    this.name = 'ImportFehler';
  }
}

export type ImportBericht = {
  rezitation: string;
  angelegt: boolean;
  dateien: { neu: number; ersetzt: number; unveraendert: number };
  verszeiten: number;
  wortzeiten: number;
  hinweise: string[];
};

const sha256 = (daten: Buffer) => createHash('sha256').update(daten).digest('hex');

export async function importiereRezitation(optionen: {
  manifestPfad: string;
  trocken?: boolean;
  ueberschreibeGeprueft?: boolean;
}): Promise<ImportBericht> {
  const manifestPfad = resolve(optionen.manifestPfad);
  const basis = dirname(manifestPfad);
  let roh: unknown;
  try {
    roh = JSON.parse(await readFile(manifestPfad, 'utf8'));
  } catch {
    throw new ImportFehler([`Manifest nicht lesbar: ${manifestPfad}`]);
  }
  const p = pruefeManifest(roh);
  if (!p.ok) throw new ImportFehler(p.fehler);
  const m: Manifest = p.manifest;
  const fehler: string[] = [];
  const hinweise: string[] = [];

  const lies = async (datei: string, erwartet: string, art: string): Promise<Buffer | null> => {
    const pfad = resolve(basis, datei);
    if (!pfad.startsWith(`${basis}/`)) {
      fehler.push(`${art} ${datei}: Pfad außerhalb des Manifest-Ordners`);
      return null;
    }
    try {
      const daten = await readFile(pfad);
      if (sha256(daten) !== erwartet) {
        fehler.push(`${art} ${datei}: SHA-256 stimmt nicht`);
        return null;
      }
      return daten;
    } catch {
      fehler.push(`${art} ${datei}: fehlt`);
      return null;
    }
  };

  // 1. Lizenzdatei (Pflicht) und alle Audiodateien prüfen
  await lies(m.lizenzdatei.datei, m.lizenzdatei.sha256, 'Lizenzdatei');
  const dateien: { sure: number; vers: number; daten: Buffer; dauerMs?: number }[] = [];
  for (const d of m.dateien) {
    const daten = await lies(d.datei, d.sha256, 'Datei');
    if (!daten) continue;
    if (daten.length > AUDIO_MAX_BYTES) fehler.push(`Datei ${d.datei}: größer als 60 MB`);
    else if (!audioFormat(daten.subarray(0, 16))) fehler.push(`Datei ${d.datei}: kein m4a, mp3, ogg oder webm (Magic Bytes)`);
    else dateien.push({ sure: d.sure, vers: d.vers, daten, dauerMs: d.dauerMs });
  }

  // 2. Suren und Verse gegen die Datenbank (Koran muss importiert sein)
  const suren = new Map(
    (await db.select({ nr: schema.quranSure.nr, verse: schema.quranSure.verseAnzahl }).from(schema.quranSure)).map((s) => [s.nr, s.verse]),
  );
  if (!suren.size) fehler.push('Datenbank ohne Koran-Text: zuerst pnpm inhalte:import');
  for (const d of m.dateien) {
    const verse = suren.get(d.sure);
    if (suren.size && (!verse || d.vers > verse)) fehler.push(`Datei ${d.datei}: Sure ${d.sure}, Vers ${d.vers} gibt es nicht`);
  }
  const verszeitenJeSure = new Map<number, VersTripel[]>();
  for (const [sure, vers, start, ende] of m.verszeiten ?? [])
    verszeitenJeSure.set(sure, [...(verszeitenJeSure.get(sure) ?? []), [vers, start, ende]]);
  for (const [sure, verse] of verszeitenJeSure) {
    const f = pruefeVerszeiten(verse, suren.get(sure) ?? 0, m.dateien.find((d) => d.sure === sure && d.vers === 0)?.dauerMs ?? null);
    if (f) fehler.push(`verszeiten: Sure ${sure} unvollständig oder ungültig (${f})`);
  }

  // 3. Rezitation: nur Art „lizenziert“
  const r = schema.quranRezitation;
  const [vorhanden] = await db.select({ art: r.art }).from(r).where(eq(r.id, m.rezitation)).limit(1);
  if (vorhanden && vorhanden.art !== 'lizenziert')
    fehler.push(`Rezitation ${m.rezitation} ist eine eigene Aufnahme; Import nur in lizenzierte Rezitationen`);
  if (vorhanden) {
    // Eine Sure hat entweder eine Datei je Sure oder Dateien je Vers – auch über mehrere Importe hinweg
    const bestand = await db
      .select({ sure: schema.quranAudio.sure, vers: schema.quranAudio.vers })
      .from(schema.quranAudio)
      .where(eq(schema.quranAudio.rezitationId, m.rezitation));
    for (const d of m.dateien)
      if (bestand.some((b) => b.sure === d.sure && (b.vers === 0) !== (d.vers === 0)))
        fehler.push(`Datei ${d.datei}: Sure ${d.sure} hat im Bestand die andere Ablage (je Sure/je Vers)`);
  }

  // 4. quran-align vorab lesen und prüfen
  let align: { sure: number; vers: number; pos: number; startMs: number; endeMs: number }[] = [];
  if (m.quranAlign) {
    const daten = await lies(m.quranAlign.datei, m.quranAlign.sha256, 'quran-align');
    if (daten) {
      const woerter = new Map(
        (
          await db
            .select({ sure: schema.quranWort.sure, vers: schema.quranWort.vers, n: count() })
            .from(schema.quranWort)
            .groupBy(schema.quranWort.sure, schema.quranWort.vers)
        ).map((z) => [`${z.sure}:${z.vers}`, z.n]),
      );
      let json: unknown = null;
      try {
        json = JSON.parse(daten.toString('utf8'));
      } catch {
        fehler.push('quran-align: kein JSON');
      }
      const ergebnis = leseQuranAlign(json, (s, v) => woerter.get(`${s}:${v}`));
      hinweise.push(...ergebnis.fehler);
      // Zeiten gelten ab Beginn der Vers-Datei: nur Verse mit eigener Datei
      const jeVers = new Set(m.dateien.filter((d) => d.vers > 0).map((d) => `${d.sure}:${d.vers}`));
      const ohne = new Set<string>();
      align = ergebnis.zeiten.filter((z) => {
        const ok = jeVers.has(`${z.sure}:${z.vers}`);
        if (!ok) ohne.add(`${z.sure}:${z.vers}`);
        return ok;
      });
      if (ohne.size) hinweise.push(`quran-align: ${ohne.size} Verse ohne eigene Datei übersprungen`);
    }
  }
  if (fehler.length) throw new ImportFehler(fehler);

  const bericht: ImportBericht = {
    rezitation: m.rezitation,
    angelegt: !vorhanden,
    dateien: { neu: 0, ersetzt: 0, unveraendert: 0 },
    verszeiten: 0,
    wortzeiten: 0,
    hinweise,
  };
  if (optionen.trocken) return bericht;

  // 5. Schreiben: Rezitation (inaktiv), Dateien, Verszeiten, Wortzeiten
  const name = { de: m.name.de, ...(m.name.tr ? { tr: m.name.tr } : {}), ...(m.name.en ? { en: m.name.en } : {}) };
  if (vorhanden) await db.update(r).set({ name, rezitator: m.rezitator, lizenz: m.lizenz }).where(eq(r.id, m.rezitation));
  else await db.insert(r).values({ id: m.rezitation, name, rezitator: m.rezitator, art: 'lizenziert', lizenz: m.lizenz, aktiv: false });

  for (const d of dateien) {
    try {
      const e = await legeAudioAb({ rezitationId: m.rezitation, sure: d.sure, vers: d.vers, roh: d.daten, dauerMs: d.dauerMs ?? null });
      bericht.dateien[e.ergebnis]++;
    } catch (e) {
      if (e instanceof AudioFehler) throw new ImportFehler([`Sure ${d.sure}, Vers ${d.vers}: Audio abgelehnt (${e.grund})`]);
      throw e;
    }
  }

  const v = schema.quranVerszeit;
  const zeiten: { sure: number; vers: number; startMs: number; endeMs: number }[] = [
    ...m.dateien
      .filter((d) => d.vers > 0 && d.dauerMs)
      .map((d) => ({ sure: d.sure, vers: d.vers, startMs: 0, endeMs: d.dauerMs as number })),
    ...[...verszeitenJeSure].flatMap(([sure, verse]) => verse.map(([vers, startMs, endeMs]) => ({ sure, vers, startMs, endeMs }))),
  ];
  for (const z of zeiten) {
    const stelle = and(eq(v.rezitationId, m.rezitation), eq(v.sure, z.sure), eq(v.vers, z.vers));
    const [alt] = await db.select({ s: v.startMs, e: v.endeMs }).from(v).where(stelle).limit(1);
    if (alt?.s === z.startMs && alt.e === z.endeMs) continue;
    await db
      .insert(v)
      .values({ rezitationId: m.rezitation, ...z })
      .onConflictDoUpdate({ target: [v.rezitationId, v.sure, v.vers], set: { startMs: z.startMs, endeMs: z.endeMs } });
    // Neues Fenster: Wortzeiten dieses Verses neu prüfen
    await db
      .update(schema.quranWortzeit)
      .set({ geprueft: false })
      .where(
        and(
          eq(schema.quranWortzeit.rezitationId, m.rezitation),
          eq(schema.quranWortzeit.sure, z.sure),
          eq(schema.quranWortzeit.vers, z.vers),
        ),
      );
    bericht.verszeiten++;
  }

  const w = schema.quranWortzeit;
  const jeVers = new Map<string, typeof align>();
  for (const z of align) jeVers.set(`${z.sure}:${z.vers}`, [...(jeVers.get(`${z.sure}:${z.vers}`) ?? []), z]);
  for (const liste of jeVers.values()) {
    const { sure, vers } = liste[0];
    const stelle = and(eq(w.rezitationId, m.rezitation), eq(w.sure, sure), eq(w.vers, vers));
    const alt = await db.select({ pos: w.pos, s: w.startMs, e: w.endeMs, geprueft: w.geprueft }).from(w).where(stelle);
    const gleich =
      alt.length === liste.length && liste.every((z) => alt.some((a) => a.pos === z.pos && a.s === z.startMs && a.e === z.endeMs));
    if (gleich) continue;
    if (alt.some((a) => a.geprueft) && !optionen.ueberschreibeGeprueft) {
      hinweise.push(`Wortzeiten ${sure}:${vers}: geprüfte Zeiten bleiben (--ueberschreiben-geprueft ersetzt sie)`);
      continue;
    }
    await db.transaction(async (tx) => {
      await tx.delete(w).where(stelle);
      await tx.insert(w).values(liste.map((z) => ({ rezitationId: m.rezitation, ...z, quelle: 'quran_align' as const, geprueft: false })));
    });
    bericht.wortzeiten += liste.length;
  }

  await protokolliere({
    benutzerId: null,
    aktion: bericht.angelegt ? 'inhalt.angelegt' : 'inhalt.geaendert',
    zielTyp: 'quran_rezitation',
    zielId: m.rezitation,
    details: {
      import: true,
      neu: bericht.dateien.neu,
      ersetzt: bericht.dateien.ersetzt,
      verszeiten: bericht.verszeiten,
      wortzeiten: bericht.wortzeiten,
      lizenzSha256: m.lizenzdatei.sha256,
    },
  });
  return bericht;
}
