// Inhaltsdaten-Import (ADR 0025): Koran (Tanzil 1.1 Text + Metadaten, Wörter, Tajwid), Übersetzungsausgaben und
// Sahih al-Bukhari aus den gepinnten Dateien unter web/daten/. Idempotent: Jeder Teil wird nur geschrieben, wenn sich
// die SHA-256 seiner Quelldatei(en) geändert hat (Einstellung `inhaltsdaten`). Von Menschen erfasste Daten
// (Wortbedeutungen, Freigaben, Rezitationen, aktivierte Ausgaben) bleiben erhalten.
// Läuft beim Bau (PGlite-Bau-Datenbank, scripts/bau-datenbank.mjs), auf Vercel nach der Migration (vercel-bau.mjs)
// und von Hand: pnpm inhalte:import [--erzwingen]
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { eq, inArray, sql } from 'drizzle-orm';
import { holeDb, schema } from '../src/lib/db';
import { leseBukhari } from '../src/lib/hadith/import';
import { leseMetadaten } from '../src/lib/quran/metadaten';
import { bereinige, REGEL_FACHBEGRIFF, REGEL_FAMILIE, type TajwidSegment } from '../src/lib/quran/tajwid';
import { leseTanzil } from '../src/lib/quran/tanzil';
import { leseKopf, leseUebersetzung } from '../src/lib/quran/uebersetzung';
import { verlangeMenschlicheHerkunft } from '../src/lib/religioes/freigabe';
import { woerter, zerlege, zusammensetzen } from '../src/lib/quran/woerter';

const { values } = parseArgs({ options: { erzwingen: { type: 'boolean', default: false } } });
const DATEN = join(import.meta.dirname, '..', 'daten');
const db = holeDb();
type Db = typeof db;

const datei = (pfad: string) => readFileSync(join(DATEN, pfad));
const sha = (...teile: Buffer[]) => {
  const h = createHash('sha256');
  for (const t of teile) h.update(t);
  return h.digest('hex');
};

type Stand = Record<string, string>;
async function ladeStand(): Promise<Stand> {
  const [z] = await db.select().from(schema.einstellung).where(eq(schema.einstellung.schluessel, 'inhaltsdaten')).limit(1);
  return (z?.wert as Stand | undefined) ?? {};
}
async function speichereStand(stand: Stand) {
  await db
    .insert(schema.einstellung)
    .values({ schluessel: 'inhaltsdaten', wert: stand })
    .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: stand, geaendertAm: new Date() } });
}

async function inBloecken<T>(zeilen: T[], groesse: number, schreibe: (block: T[]) => Promise<unknown>) {
  for (let i = 0; i < zeilen.length; i += groesse) await schreibe(zeilen.slice(i, i + groesse));
}

/** Koran: Suren, Verse (mit Basmala und Tajwid), Einteilungen, Wörter und Wortformen. */
async function koran(tx: Db, rohText: Buffer, rohMeta: Buffer, rohTajwid: Buffer, hash: string) {
  const suren = leseTanzil(rohText.toString('utf8'));
  const { suren: meta, einteilungen } = leseMetadaten(rohMeta.toString('utf8'));
  const tajwidRoh = JSON.parse(rohTajwid.toString('utf8')) as [number, number, TajwidSegment[]][];
  const tajwidJe = new Map(tajwidRoh.map(([s, v, seg]) => [`${s}:${v}`, seg]));
  let verse = 0;
  let verworfen = 0;

  await tx
    .insert(schema.quranQuelle)
    .values({
      id: 'tanzil',
      bezeichnung: 'Tanzil Project – Quran Text (Uthmani, Version 1.1)',
      url: 'https://tanzil.net',
      version: '1.1',
      sha256: hash,
      lizenz: 'CC BY 3.0 (Tanzil): unveränderte Wiedergabe mit Quellenangabe und Link auf tanzil.net',
    })
    .onConflictDoUpdate({ target: schema.quranQuelle.id, set: { version: '1.1', sha256: hash, importiertAm: new Date() } });

  for (const s of suren) {
    const m = meta[s.nr - 1];
    if (!m || m.nr !== s.nr || m.verse !== s.verse.length) throw new Error(`Metadaten passen nicht zu Sure ${s.nr}`);
    const werte = {
      nr: s.nr,
      nameAr: s.nameAr,
      verseAnzahl: s.verse.length,
      quelleId: 'tanzil',
      nameUmschrift: m.umschrift,
      ort: m.ort,
      offenbarungsfolge: m.offenbarungsfolge,
      rukus: m.rukus,
      basmala: s.basmala ?? null,
    } as const;
    await tx.insert(schema.quranSure).values(werte).onConflictDoUpdate({ target: schema.quranSure.nr, set: werte });
    const zeilen = s.verse.map((v) => {
      // Rundreise: Zerlegung in Wörter und Zeichen ist verlustfrei
      if (zusammensetzen(zerlege(v.textAr)) !== v.textAr) throw new Error(`Rundreise verletzt in ${s.nr}:${v.nr}`);
      const b = bereinige(v.textAr, tajwidJe.get(`${s.nr}:${v.nr}`) ?? []);
      verworfen += b.verworfen;
      return { sure: s.nr, vers: v.nr, textAr: v.textAr, tajwid: b.segmente };
    });
    verse += zeilen.length;
    await inBloecken(zeilen, 300, (block) =>
      tx
        .insert(schema.quranVers)
        .values(block)
        .onConflictDoUpdate({
          target: [schema.quranVers.sure, schema.quranVers.vers],
          set: { textAr: sql`excluded.text_ar`, tajwid: sql`excluded.tajwid` },
        }),
    );
  }

  await tx.delete(schema.quranEinteilung);
  await inBloecken(einteilungen, 500, (block) => tx.insert(schema.quranEinteilung).values(block));

  // Wortformen behalten ihre IDs (Wortbedeutungen hängen daran); Wörter werden neu geschrieben.
  const alleWoerter = suren.flatMap((s) => s.verse.flatMap((v) => woerter(v.textAr).map((w) => ({ sure: s.nr, vers: v.nr, ...w }))));
  const vorkommen = new Map<string, number>();
  for (const w of alleWoerter) vorkommen.set(w.text, (vorkommen.get(w.text) ?? 0) + 1);
  await inBloecken([...vorkommen.keys()], 1000, (block) =>
    tx
      .insert(schema.quranWortform)
      .values(block.map((textAr) => ({ textAr, vorkommen: vorkommen.get(textAr) ?? 0 })))
      .onConflictDoUpdate({ target: schema.quranWortform.textAr, set: { vorkommen: sql`excluded.vorkommen` } }),
  );
  const formen = await tx.select({ id: schema.quranWortform.id, textAr: schema.quranWortform.textAr }).from(schema.quranWortform);
  const formId = new Map(formen.map((f) => [f.textAr, f.id]));
  await tx.delete(schema.quranWort);
  await inBloecken(alleWoerter, 2000, (block) =>
    tx
      .insert(schema.quranWort)
      .values(block.map((w) => ({ sure: w.sure, vers: w.vers, pos: w.pos, textAr: w.text, formId: formId.get(w.text)! }))),
  );
  console.log(
    `[inhalte] Koran: ${suren.length} Suren, ${verse} Verse, ${alleWoerter.length} Wörter, ${vorkommen.size} Formen, ${einteilungen.length} Einteilungen; Tajwid verworfen: ${verworfen}`,
  );
}

/** Tajwid-Regeln (Schlüssel und Fachbegriffe aus `REGEL_FACHBEGRIFF`; Erklärungen verfasst die Lehrkraft, ADR 0030). */
async function tajwidRegeln(tx: Db) {
  await tx
    .insert(schema.tajwidRegel)
    .values(
      Object.entries(REGEL_FACHBEGRIFF).map(([schluessel, name], i) => ({
        schluessel,
        familie: REGEL_FAMILIE[schluessel],
        name: { de: name },
        sortierung: i,
      })),
    )
    .onConflictDoNothing({ target: schema.tajwidRegel.schluessel });
}

/** Übersetzungsausgaben (Tanzil-Übergang, MN-02): importiert, aber nicht aktiv und nicht freigegeben. */
const AUSGABEN = [
  { id: 'tanzil-de.bubenheim', datei: 'tanzil-uebersetzungen/de.bubenheim.txt', sprache: 'de' },
  { id: 'tanzil-tr.diyanet', datei: 'tanzil-uebersetzungen/tr.diyanet.txt', sprache: 'tr' },
  { id: 'tanzil-en.sahih', datei: 'tanzil-uebersetzungen/en.sahih.txt', sprache: 'en' },
] as const;

async function ausgabe(tx: Db, a: (typeof AUSGABEN)[number], roh: Buffer, hash: string, verseJeSure: Map<number, number>) {
  const text = roh.toString('utf8');
  const kopf = leseKopf(text);
  const verse = leseUebersetzung(text, verseJeSure);
  const werte = {
    id: a.id,
    sprache: a.sprache,
    titel: kopf.name ?? a.id,
    uebersetzer: kopf.translator ?? '',
    quelle: 'Tanzil.net',
    version: kopf['last update'] ?? '',
    lizenz: 'Tanzil: nur nicht-kommerziell; Rechte beim Übersetzer bzw. Herausgeber (Freigabe MN-02)',
    url: 'https://tanzil.net/trans/',
    sha256: hash,
    abgerufenAm: new Date('2026-10-13T04:41:00Z'),
  };
  // KI-Regel 2 (ADR 0040 Nr. 3): Versübersetzungen nur von Menschen – eine Ausgabe mit KI-Angabe im Kopf bricht ab
  verlangeMenschlicheHerkunft('quran_uebersetzung', a.id, [werte.uebersetzer, werte.titel, kopf.source, kopf.comment]);
  // Die Freigabe gilt für die unverändert importierte Ausgabe (ADR 0030): Ändert sich die Datei (SHA-256), ist die
  // Ausgabe wieder auszuschalten und neu freizugeben.
  const unveraendert = sql`${schema.quranAusgabe.sha256} = excluded.sha256`;
  await tx
    .insert(schema.quranAusgabe)
    .values(werte)
    .onConflictDoUpdate({
      target: schema.quranAusgabe.id,
      set: {
        ...werte,
        aktiv: sql`case when ${unveraendert} then ${schema.quranAusgabe.aktiv} else false end`,
        standard: sql`case when ${unveraendert} then ${schema.quranAusgabe.standard} else false end`,
        freigegebenVon: sql`case when ${unveraendert} then ${schema.quranAusgabe.freigegebenVon} else null end`,
        freigegebenAm: sql`case when ${unveraendert} then ${schema.quranAusgabe.freigegebenAm} else null end`,
      },
    });
  await tx.delete(schema.quranUebersetzung).where(eq(schema.quranUebersetzung.ausgabeId, a.id));
  await inBloecken(verse, 1000, (block) => tx.insert(schema.quranUebersetzung).values(block.map((v) => ({ ausgabeId: a.id, ...v }))));
  console.log(`[inhalte] Ausgabe ${a.id}: ${verse.length} Verse`);
}

/** Sahih al-Bukhari (arabisch). Öffentlich erst nach Rechtsfreigabe (Schalter hadith_gesamt, MN-06). */
async function hadith(tx: Db, roh: Buffer, hash: string) {
  const { buecher, hadithe, uebersprungen } = leseBukhari(roh.toString('utf8'));
  await tx
    .insert(schema.hadithSammlung)
    .values({
      id: 'bukhari',
      name: { de: 'Sahih al-Bukhari', tr: 'Sahîh-i Buhârî', en: 'Sahih al-Bukhari' },
      quelle: 'fawazahmed0/hadith-api',
      url: 'https://github.com/fawazahmed0/hadith-api',
      version: 'df57907be35291c91ad6a6691180e22ca9920784',
      lizenz: 'Unlicense (Repository); Herkunft des arabischen Texts laut References.md sunnah.com – Freigabe MN-06',
      sha256: hash,
    })
    .onConflictDoUpdate({ target: schema.hadithSammlung.id, set: { sha256: hash, importiertAm: new Date() } });
  await tx.delete(schema.hadith).where(eq(schema.hadith.sammlungId, 'bukhari'));
  await tx.delete(schema.hadithBuch).where(eq(schema.hadithBuch.sammlungId, 'bukhari'));
  await tx.insert(schema.hadithBuch).values(
    buecher.map((b) => ({
      sammlungId: 'bukhari',
      nr: b.nr,
      titel: { de: '', en: b.titelEn },
      hadithVon: b.hadithVon,
      hadithBis: b.hadithBis,
    })),
  );
  await inBloecken(hadithe, 500, (block) => tx.insert(schema.hadith).values(block.map((h) => ({ sammlungId: 'bukhari', ...h }))));
  await tx.execute(sql`update hadith set suche = to_tsvector('simple', text_normalisiert) where sammlung_id = 'bukhari'`);
  console.log(
    `[inhalte] Bukhari: ${buecher.length} Bücher, ${hadithe.length} Hadithe; ohne Text übersprungen: ${uebersprungen.join(', ') || '–'}`,
  );
}

async function main() {
  const stand = values.erzwingen ? {} : await ladeStand();
  const neu: Stand = { ...stand };
  const text = datei('tanzil/quran-uthmani.xml');
  const meta = datei('tanzil/quran-data.xml');
  const tajwid = datei('quran-tajweed/tajwid-tanzil-1.1.json');
  const koranHash = sha(text, meta, tajwid);

  await db.transaction(async (tx) => {
    const t = tx as unknown as Db;
    if (stand.koran !== koranHash) {
      await koran(t, text, meta, tajwid, sha(text));
      neu.koran = koranHash;
    } else console.log('[inhalte] Koran unverändert.');
    await tajwidRegeln(t);

    const suren = await t.select({ nr: schema.quranSure.nr, verse: schema.quranSure.verseAnzahl }).from(schema.quranSure);
    const verseJeSure = new Map(suren.map((s) => [s.nr, s.verse]));
    for (const a of AUSGABEN) {
      const roh = datei(a.datei);
      const h = sha(roh);
      if (stand[a.id] === h) continue;
      await ausgabe(t, a, roh, h, verseJeSure);
      neu[a.id] = h;
    }

    const roh = datei('hadith/ara-bukhari.json');
    const h = sha(roh);
    if (stand.bukhari !== h) {
      await hadith(t, roh, h);
      neu.bukhari = h;
    } else console.log('[inhalte] Bukhari unverändert.');
  });
  await speichereStand(neu);
  const geprueft = await db.select({ n: sql<number>`count(*)::int` }).from(schema.quranVers);
  const ausgaben = await db
    .select({ id: schema.quranAusgabe.id })
    .from(schema.quranAusgabe)
    .where(
      inArray(
        schema.quranAusgabe.id,
        AUSGABEN.map((a) => a.id),
      ),
    );
  console.log(`[inhalte] fertig: ${geprueft[0]?.n ?? 0} Verse, ${ausgaben.length} Ausgaben.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[inhalte] Fehler:', e instanceof Error ? e.message : e);
    process.exit(1);
  });
