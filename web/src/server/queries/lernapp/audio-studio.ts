import 'server-only';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { KRITISCHE_FEHLER } from '@/lib/lernapp/freigabe';
import type { Sprache } from '@/lib/lernapp/kurse';
import { zerlegeMeldungsSchluessel } from '@/lib/lernapp/meldung';
import { textHash } from '@/lib/lernapp/paket/hash';
import { clipLage, type ClipLage, stimmenArt, wirksameStimme } from '@/lib/lernapp/verwaltung/audio';
import { verweiseDerAufgabe } from './meldungen';

/**
 * Audio-Studio (L3-06, ADR 0039 Nr. 7/8): vertonbare Zieltexte eines Sprachkurses (Lemmata und Sätze ohne Religionsbezug,
 * nicht gesperrt) mit Clips, Wahl der Stimme, Rohaufnahmen und Auffälligkeiten (Meldung „Audio“ bzw. Prüfurteil zur
 * Aussprache zum aktuellen Clip). Der Text-Hash entsteht in der Datenbank wie in `paket/hash.ts` (SHA-256 des NFC-Texts).
 */

export const STUDIO_SEITE = 40;
export type StudioFilter = 'fehlt' | 'auffaellig' | 'alle';

export type StudioEintrag = {
  art: 'lemma' | 'satz';
  id: string;
  schluessel: string;
  text: string;
  stufe: string;
  textHash: string;
  lage: ClipLage;
  clips: {
    id: string;
    stimme: string;
    art: ReturnType<typeof stimmenArt>;
    buendel: string;
    versatz: number;
    laenge: number;
    dauerMs: number;
  }[];
  wahl: 'sprachausgabe' | 'mensch' | null;
  wirksam: string | null;
  aufnahmen: { id: string; sprecher: string; sprecherId: string; status: string; dauerMs: number | null; bytes: number; am: Date }[];
};

/** Auffällige Einträge: offene Meldungen „Audio“ (über die Verweise ihrer Aufgaben) und nicht-ok-Urteile zum Clip. */
async function auffaellige(sprache: Sprache): Promise<{ gemeldet: Map<string, number>; befund: Set<string> }> {
  const meldungen = await db
    .select({ schluessel: schema.lernappMeldung.aufgabeSchluessel })
    .from(schema.lernappMeldung)
    .where(and(eq(schema.lernappMeldung.status, 'offen'), eq(schema.lernappMeldung.kategorie, 'fehler_audio')));
  const aufgabenSchluessel = meldungen.flatMap((m) => {
    const z = zerlegeMeldungsSchluessel(m.schluessel);
    return z && z.aufgabe.startsWith(`${sprache}.`) ? [z.aufgabe] : [];
  });
  const gemeldet = new Map<string, number>();
  if (aufgabenSchluessel.length) {
    const aufgaben = await db
      .select({ schluessel: schema.lernappAufgabe.schluessel, typ: schema.lernappAufgabe.typ, daten: schema.lernappAufgabe.daten })
      .from(schema.lernappAufgabe)
      .where(inArray(schema.lernappAufgabe.schluessel, [...new Set(aufgabenSchluessel)]));
    const je = new Map(aufgaben.map((a) => [a.schluessel, a]));
    for (const s of aufgabenSchluessel) {
      const a = je.get(s);
      for (const v of a ? verweiseDerAufgabe(a) : []) gemeldet.set(v, (gemeldet.get(v) ?? 0) + 1);
    }
  }
  const p = schema.lernappPruefung;
  const a = schema.lernappAudio;
  const befunde = await db
    .select({ textHash: a.textHash })
    .from(p)
    .innerJoin(a, and(sql`${p.inhaltId} = ${a.id}::text`, eq(p.inhaltHash, a.sha256)))
    .where(
      and(
        eq(p.inhaltTyp, 'audio'),
        eq(a.sprache, sprache),
        sql`(${p.urteil} = 'abgelehnt' or ${p.kategorie} in (${sql.join(
          KRITISCHE_FEHLER.map((k) => sql`${k}`),
          sql`, `,
        )}))`,
      ),
    );
  return { gemeldet, befund: new Set(befunde.map((b) => b.textHash)) };
}

/** Eine Seite des Studios. `gesamt`: Anzahl der Einträge des Filters. */
export async function ladeStudio(
  sprache: Sprache,
  filter: StudioFilter,
  seite: number,
): Promise<{ eintraege: StudioEintrag[]; gesamt: number; zaehler: Record<ClipLage | 'alle', number> }> {
  const { gemeldet, befund } = await auffaellige(sprache);
  const textHashSql = (spalte: unknown) => sql`encode(sha256(convert_to(normalize(${spalte}, NFC), 'UTF8')), 'hex')`;
  const basis = sql`
    with e as (
      select 'lemma' as art, l.id, l.schluessel, l.lemma as text, l.stufe::text as stufe, ${textHashSql(sql`l.lemma`)} as text_hash
        from lernapp_lemma l where l.kurs_id = ${sprache} and not l.religionsbezug and l.status <> 'gesperrt'
      union all
      select 'satz', s.id, s.schluessel, s.text, s.stufe::text, ${textHashSql(sql`s.text`)}
        from lernapp_satz s where s.kurs_id = ${sprache} and not s.religionsbezug and s.status <> 'gesperrt'
    ), m as (
      select e.*, (select count(*) from lernapp_audio a where a.sprache = ${sprache} and a.text_hash = e.text_hash)::int as clips from e
    )`;
  const zeilen = (
    await db.execute<{
      art: 'lemma' | 'satz';
      id: string;
      schluessel: string;
      text: string;
      stufe: string;
      text_hash: string;
      clips: number;
    }>(sql`${basis} select * from m order by schluessel`)
  ).rows;
  const mitLage = zeilen.map((z) => ({
    ...z,
    lage: clipLage({ clips: z.clips, meldungen: gemeldet.get(z.schluessel) ?? 0, ausspracheBefund: befund.has(z.text_hash) }),
  }));
  const zaehler = { fehlt: 0, auffaellig: 0, vorhanden: 0, alle: mitLage.length };
  for (const z of mitLage) zaehler[z.lage]++;
  const gefiltert = filter === 'alle' ? mitLage : mitLage.filter((z) => z.lage === filter);
  const ausschnitt = gefiltert.slice(seite * STUDIO_SEITE, (seite + 1) * STUDIO_SEITE);
  const hashes = ausschnitt.map((z) => z.text_hash);
  const [clips, wahlen, aufnahmen] = hashes.length
    ? await Promise.all([
        db
          .select()
          .from(schema.lernappAudio)
          .where(and(eq(schema.lernappAudio.sprache, sprache), inArray(schema.lernappAudio.textHash, hashes))),
        db
          .select()
          .from(schema.lernappAudioWahl)
          .where(and(eq(schema.lernappAudioWahl.sprache, sprache), inArray(schema.lernappAudioWahl.textHash, hashes))),
        db
          .select({
            id: schema.lernappAufnahme.id,
            textHash: schema.lernappAufnahme.textHash,
            sprecher: schema.lernappSprecher.name,
            sprecherId: schema.lernappAufnahme.sprecherId,
            status: schema.lernappAufnahme.status,
            dauerMs: schema.lernappAufnahme.dauerMs,
            bytes: schema.lernappAufnahme.bytes,
            am: schema.lernappAufnahme.erstelltAm,
          })
          .from(schema.lernappAufnahme)
          .innerJoin(schema.lernappSprecher, eq(schema.lernappSprecher.id, schema.lernappAufnahme.sprecherId))
          .where(and(eq(schema.lernappAufnahme.sprache, sprache), inArray(schema.lernappAufnahme.textHash, hashes)))
          .orderBy(desc(schema.lernappAufnahme.erstelltAm)),
      ])
    : [[], [], []];
  return {
    gesamt: gefiltert.length,
    zaehler,
    eintraege: ausschnitt.map((z) => {
      const eigene = clips.filter((c) => c.textHash === z.text_hash).sort((a, b) => (a.stimme < b.stimme ? -1 : 1));
      const wahl = wahlen.find((w) => w.textHash === z.text_hash)?.wahl ?? null;
      return {
        art: z.art,
        id: z.id,
        schluessel: z.schluessel,
        text: z.text,
        stufe: z.stufe,
        textHash: z.text_hash,
        lage: z.lage,
        clips: eigene.map((c) => ({
          id: c.id,
          stimme: c.stimme,
          art: stimmenArt(c.stimme),
          buendel: c.buendel,
          versatz: c.versatz,
          laenge: c.laenge,
          dauerMs: c.dauerMs,
        })),
        wahl,
        wirksam: wirksameStimme(
          eigene.map((c) => c.stimme),
          wahl,
        ),
        aufnahmen: aufnahmen.filter((x) => x.textHash === z.text_hash).map(({ textHash: _h, ...rest }) => rest),
      };
    }),
  };
}

export type SprecherZeile = {
  id: string;
  name: string;
  kiSyntheseErlaubt: boolean;
  klonenErlaubt: boolean;
  vereinbarung: { id: string; dateiname: string | null; schluessel: string; imPapierkorb: boolean };
  aufnahmen: number;
};

/** Sprecherinnen und Sprecher mit Vereinbarung und Zahl der Aufnahmen. */
export async function ladeSprecher(): Promise<SprecherZeile[]> {
  const sp = schema.lernappSprecher;
  const m = schema.medium;
  const zeilen = await db
    .select({
      id: sp.id,
      name: sp.name,
      kiSyntheseErlaubt: sp.kiSyntheseErlaubt,
      klonenErlaubt: sp.klonenErlaubt,
      mediumId: m.id,
      dateiname: m.dateiname,
      schluessel: m.schluessel,
      papierkorb: m.imPapierkorbSeit,
      aufnahmen: sql<number>`(select count(*) from lernapp_aufnahme a where a.sprecher_id = ${sp.id})`.mapWith(Number),
    })
    .from(sp)
    .innerJoin(m, eq(m.id, sp.vereinbarungMediumId))
    .orderBy(asc(sp.name));
  return zeilen.map((z) => ({
    id: z.id,
    name: z.name,
    kiSyntheseErlaubt: z.kiSyntheseErlaubt,
    klonenErlaubt: z.klonenErlaubt,
    vereinbarung: { id: z.mediumId, dateiname: z.dateiname, schluessel: z.schluessel, imPapierkorb: Boolean(z.papierkorb) },
    aufnahmen: z.aufnahmen,
  }));
}

/** Vertonbarer Eintrag eines Sprachkurses nach Schlüssel (Lemma oder Satz), sonst null. */
export async function ladeVertonbarenEintrag(schluessel: string) {
  const kurs = schluessel.split('.')[0];
  if (kurs !== 'de' && kurs !== 'tr' && kurs !== 'ar') return null;
  const [lemma] = await db
    .select({
      id: schema.lernappLemma.id,
      text: schema.lernappLemma.lemma,
      status: schema.lernappLemma.status,
      religionsbezug: schema.lernappLemma.religionsbezug,
    })
    .from(schema.lernappLemma)
    .where(and(eq(schema.lernappLemma.schluessel, schluessel), eq(schema.lernappLemma.kursId, kurs)))
    .limit(1);
  const [satz] = lemma
    ? [undefined]
    : await db
        .select({
          id: schema.lernappSatz.id,
          text: schema.lernappSatz.text,
          status: schema.lernappSatz.status,
          religionsbezug: schema.lernappSatz.religionsbezug,
        })
        .from(schema.lernappSatz)
        .where(and(eq(schema.lernappSatz.schluessel, schluessel), eq(schema.lernappSatz.kursId, kurs)))
        .limit(1);
  const e = lemma ?? satz;
  if (!e) return null;
  return { ...e, kurs: kurs as Sprache, schluessel, textHash: textHash(e.text) };
}
