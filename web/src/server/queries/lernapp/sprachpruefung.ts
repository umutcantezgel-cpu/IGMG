import 'server-only';
import { and, asc, desc, eq, inArray, like, or, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Status } from '@/lib/lernapp/freigabe';
import { type RichtungId, RICHTUNGEN, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { textHash, sha256Hex } from '@/lib/lernapp/paket/hash';
import { type Entscheidung, pruefSprache, type StichprobeArt } from '@/lib/lernapp/stichprobe';

/**
 * Sprachprüfung der Verwaltung (L3-06, ADR 0041 Nr. 3–5/10): Kandidaten einer Einheit je Art, Stand der Einheit,
 * Warteschlange je Prüfsprache und die Einträge einer Stichprobe mit ihren Urteilen.
 *
 * - **Kandidaten:** Zieltext = Lemmata und Sätze der Einheit (Schlüssel `<einheit>.…`); Übersetzung = deren Übersetzungen in
 *   die Ausgangssprache der Richtung; Audio = Clips (wirksame Stimme) der vertonbaren Zieltexte. Gesperrte Einträge und
 *   Entwürfe nie (sie sind nicht ausgeliefert).
 * - **Stand:** SHA-256 über `<schlüssel>:<inhaltHash>` aller Kandidaten. Eine neue Stichprobe gibt es, wenn zum aktuellen
 *   Stand noch keine gezogen ist; nach „nachbessern“ also erst, wenn sich der Inhalt geändert hat (ADR 0041 Nr. 5).
 */

export type Kandidat = {
  /** Schlüssel des Eintrags (bei Übersetzungen der Zieleintrag, bei Audio der Zieltext) */
  schluessel: string;
  inhaltTyp: 'lemma' | 'satz' | 'uebersetzung' | 'audio';
  inhaltId: string;
  inhaltHash: string;
  status: Status;
  religionsbezug: boolean;
  /** Zieltext */
  text: string;
  /** Übersetzung (nur Art `uebersetzung`) */
  uebersetzung?: { text: string; alternativen: string[] };
  /** Clip (nur Art `audio`) */
  clip?: { buendel: string; versatz: number; laenge: number; stimme: string };
};

const LIEFERBAR: Status[] = ['automatisch_geprueft', 'veroeffentlicht'];

/** Einheit (Schlüssel) mit Kurs und Status, oder null. */
export async function ladeEinheit(schluessel: string) {
  const [e] = await db
    .select({
      id: schema.lernappEinheit.id,
      schluessel: schema.lernappEinheit.schluessel,
      status: schema.lernappEinheit.status,
      thema: schema.lernappEinheit.thema,
      kurs: schema.lernappAbschnitt.kursId,
      stufe: schema.lernappAbschnitt.stufe,
    })
    .from(schema.lernappEinheit)
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(eq(schema.lernappEinheit.schluessel, schluessel))
    .limit(1);
  return e ?? null;
}

async function zieltexte(einheit: string) {
  const [lemmata, saetze] = await Promise.all([
    db
      .select({
        id: schema.lernappLemma.id,
        schluessel: schema.lernappLemma.schluessel,
        text: schema.lernappLemma.lemma,
        inhaltHash: schema.lernappLemma.inhaltHash,
        status: schema.lernappLemma.status,
        religionsbezug: schema.lernappLemma.religionsbezug,
      })
      .from(schema.lernappLemma)
      .where(and(like(schema.lernappLemma.schluessel, `${einheit}.%`), inArray(schema.lernappLemma.status, LIEFERBAR))),
    db
      .select({
        id: schema.lernappSatz.id,
        schluessel: schema.lernappSatz.schluessel,
        text: schema.lernappSatz.text,
        inhaltHash: schema.lernappSatz.inhaltHash,
        status: schema.lernappSatz.status,
        religionsbezug: schema.lernappSatz.religionsbezug,
      })
      .from(schema.lernappSatz)
      .where(and(like(schema.lernappSatz.schluessel, `${einheit}.%`), inArray(schema.lernappSatz.status, LIEFERBAR))),
  ]);
  return [
    ...lemmata.map((l) => ({ ...l, inhaltTyp: 'lemma' as const })),
    ...saetze.map((s) => ({ ...s, inhaltTyp: 'satz' as const })),
  ].sort((a, b) => (a.schluessel < b.schluessel ? -1 : 1));
}

/** Kandidaten einer Einheit und Art (Übersetzungen je Richtung). */
export async function kandidaten(einheit: string, art: StichprobeArt, richtung?: RichtungId | null): Promise<Kandidat[]> {
  const ziel = await zieltexte(einheit);
  if (art === 'zieltext')
    return ziel.map((z) => ({
      schluessel: z.schluessel,
      inhaltTyp: z.inhaltTyp,
      inhaltId: z.id,
      inhaltHash: z.inhaltHash,
      status: z.status,
      religionsbezug: z.religionsbezug,
      text: z.text,
    }));
  if (art === 'uebersetzung') {
    if (!richtung || !ziel.length) return [];
    const { ausgang } = zerlegeRichtung(richtung);
    const lemmaIds = ziel.filter((z) => z.inhaltTyp === 'lemma').map((z) => z.id);
    const satzIds = ziel.filter((z) => z.inhaltTyp === 'satz').map((z) => z.id);
    const u = schema.lernappUebersetzung;
    const zeilen = await db
      .select({
        id: u.id,
        lemmaId: u.lemmaId,
        satzId: u.satzId,
        text: u.text,
        alternativen: u.alternativen,
        inhaltHash: u.inhaltHash,
        status: u.status,
        religionsbezug: u.religionsbezug,
      })
      .from(u)
      .where(
        and(
          eq(u.sprache, ausgang),
          inArray(u.status, LIEFERBAR),
          or(lemmaIds.length ? inArray(u.lemmaId, lemmaIds) : sql`false`, satzIds.length ? inArray(u.satzId, satzIds) : sql`false`),
        ),
      );
    const zuZiel = new Map(ziel.map((z) => [z.id, z]));
    return zeilen.flatMap((x) => {
      const z = zuZiel.get(x.lemmaId ?? x.satzId ?? '');
      return z
        ? [
            {
              schluessel: z.schluessel,
              inhaltTyp: 'uebersetzung' as const,
              inhaltId: x.id,
              inhaltHash: x.inhaltHash,
              status: x.status,
              religionsbezug: x.religionsbezug || z.religionsbezug,
              text: z.text,
              uebersetzung: { text: x.text, alternativen: x.alternativen },
            },
          ]
        : [];
    });
  }
  // Audio: vertonbare Zieltexte mit Clip der wirksamen Stimme. Ein kritisch beurteilter Clip bleibt hier Kandidat (die
  // Stichprobe und ihr Stand bleiben stabil); im Paket ist er verborgen (`ladeBauEingaben`), bis ein neuer Clip vorliegt.
  const vertonbar = ziel.filter((z) => !z.religionsbezug);
  if (!vertonbar.length) return [];
  const sprache = einheit.split('.')[0] as Sprache;
  const hashJe = new Map(vertonbar.map((z) => [textHash(z.text), z]));
  const [clips, wahlen] = await Promise.all([
    db
      .select()
      .from(schema.lernappAudio)
      .where(and(eq(schema.lernappAudio.sprache, sprache), inArray(schema.lernappAudio.textHash, [...hashJe.keys()]))),
    db
      .select()
      .from(schema.lernappAudioWahl)
      .where(and(eq(schema.lernappAudioWahl.sprache, sprache), inArray(schema.lernappAudioWahl.textHash, [...hashJe.keys()]))),
  ]);
  const wahl = new Map(wahlen.map((w) => [w.textHash, w.wahl]));
  const rang = (s: string) => ['mensch:', 'tts:', 'test:'].findIndex((p) => s.startsWith(p)) >>> 0;
  const jeText = new Map<string, (typeof clips)[number]>();
  for (const c of [...clips].sort((a, b) => rang(a.stimme) - rang(b.stimme) || (a.stimme < b.stimme ? -1 : 1))) {
    if (wahl.get(c.textHash) === 'sprachausgabe' && c.stimme.startsWith('mensch:')) continue;
    if (!jeText.has(c.textHash)) jeText.set(c.textHash, c);
  }
  return [...jeText.entries()].flatMap(([h, c]) => {
    const z = hashJe.get(h)!;
    return [
      {
        schluessel: z.schluessel,
        inhaltTyp: 'audio' as const,
        inhaltId: c.id,
        inhaltHash: c.sha256,
        status: z.status,
        religionsbezug: false,
        text: z.text,
        clip: { buendel: c.buendel, versatz: c.versatz, laenge: c.laenge, stimme: c.stimme },
      },
    ];
  });
}

/** Stand der Kandidaten (Änderung erkennen, ADR 0041 Nr. 5/7). */
export function standVon(k: readonly Pick<Kandidat, 'schluessel' | 'inhaltHash'>[]): string {
  return sha256Hex(
    [...k]
      .map((x) => `${x.schluessel}:${x.inhaltHash}`)
      .sort()
      .join('\n'),
  );
}

/** Sprachen einer prüfenden Person (`lernapp_pruefer_sprache`). */
export async function ladePruefSprachen(benutzerId: string): Promise<Sprache[]> {
  const z = await db
    .select({ sprache: schema.lernappPrueferSprache.sprache })
    .from(schema.lernappPrueferSprache)
    .where(eq(schema.lernappPrueferSprache.benutzerId, benutzerId))
    .orderBy(asc(schema.lernappPrueferSprache.sprache));
  return z.map((x) => x.sprache);
}

export type StichprobeKopf = {
  id: string;
  einheitId: string;
  einheit: string;
  kurs: string;
  sprache: Sprache;
  richtungId: RichtungId | null;
  art: StichprobeArt;
  einlauf: boolean;
  seed: string;
  groesse: number;
  auswahl: string[];
  entscheidung: Entscheidung;
  einheitHash: string | null;
  gezogenAm: Date;
  entschiedenAm: Date | null;
  ergebnis: { geprueft: number; kritisch: number; leicht: number } | null;
};

const s = schema.lernappStichprobe;
const kopfSpalten = {
  id: s.id,
  einheitId: s.einheitId,
  einheit: schema.lernappEinheit.schluessel,
  kurs: schema.lernappAbschnitt.kursId,
  sprache: s.sprache,
  richtungId: s.richtungId,
  art: s.art,
  einlauf: s.einlauf,
  seed: s.seed,
  groesse: s.groesse,
  auswahl: s.auswahl,
  entscheidung: s.entscheidung,
  einheitHash: s.einheitHash,
  gezogenAm: s.gezogenAm,
  entschiedenAm: s.entschiedenAm,
  ergebnis: s.ergebnis,
};

function alsKopf(z: Record<string, unknown>): StichprobeKopf {
  return z as unknown as StichprobeKopf;
}

/** Eine Stichprobe mit Einheit und Kurs. */
export async function ladeStichprobeKopf(id: string): Promise<StichprobeKopf | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null;
  const [z] = await db
    .select(kopfSpalten)
    .from(s)
    .innerJoin(schema.lernappEinheit, eq(schema.lernappEinheit.id, s.einheitId))
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(eq(s.id, id))
    .limit(1);
  return z ? alsKopf(z) : null;
}

/** Jüngste Urteile je Eintrag einer Stichprobe (zum jeweiligen Hash). */
export async function urteileDerStichprobe(id: string) {
  const p = schema.lernappPruefung;
  const zeilen = await db
    .select({
      inhaltId: p.inhaltId,
      inhaltHash: p.inhaltHash,
      urteil: p.urteil,
      kategorie: p.kategorie,
      korrektur: p.korrektur,
      kommentar: p.kommentar,
      am: p.am,
    })
    .from(p)
    .where(eq(p.stichprobeId, id))
    .orderBy(desc(p.am));
  const je = new Map<string, (typeof zeilen)[number]>();
  for (const z of zeilen) if (!je.has(`${z.inhaltId}|${z.inhaltHash}`)) je.set(`${z.inhaltId}|${z.inhaltHash}`, z);
  return je;
}

export type StichprobenEintrag = Kandidat & {
  urteil: { urteil: 'ok' | 'korrektur' | 'abgelehnt'; kategorie: string | null; korrektur: string | null; kommentar: string | null } | null;
  /** Eintrag nicht mehr vorhanden oder gesperrt */
  fehlt?: boolean;
};

/** Einträge einer Stichprobe in Ziehungsreihenfolge mit aktuellem Inhalt und jüngstem Urteil zum aktuellen Hash. */
export async function ladeStichprobenEintraege(k: StichprobeKopf): Promise<StichprobenEintrag[]> {
  const [alle, urteile] = await Promise.all([kandidaten(k.einheit, k.art, k.richtungId), urteileDerStichprobe(k.id)]);
  const je = new Map(alle.map((x) => [x.schluessel, x]));
  return k.auswahl.map((schluessel) => {
    const x = je.get(schluessel);
    if (!x)
      return {
        schluessel,
        inhaltTyp: 'satz',
        inhaltId: '',
        inhaltHash: '',
        status: 'gesperrt',
        religionsbezug: false,
        text: '',
        urteil: null,
        fehlt: true,
      } satisfies StichprobenEintrag;
    const u = urteile.get(`${x.inhaltId}|${x.inhaltHash}`);
    return {
      ...x,
      urteil: u
        ? {
            urteil: u.urteil === 'aenderungsvorschlag' ? 'korrektur' : u.urteil,
            kategorie: u.kategorie,
            korrektur: u.korrektur,
            kommentar: u.kommentar,
          }
        : null,
    };
  });
}

export type WarteEintrag = {
  einheit: string;
  einheitId: string;
  kurs: string;
  stufe: string;
  thema: Record<string, string>;
  art: StichprobeArt;
  richtung: RichtungId | null;
  sprache: Sprache;
  kandidaten: number;
  /** jüngste Stichprobe zu diesem Ziel (beliebiger Stand) */
  letzte: { id: string; entscheidung: Entscheidung; groesse: number; geprueft: number; aktuell: boolean } | null;
  /** neue Stichprobe möglich (keine offene, zum aktuellen Stand noch keine) */
  ziehbar: boolean;
};

/**
 * Warteschlange je Prüfsprache: Einheiten der Sprachkurse mit lieferbaren Einträgen, je Art und Richtung, deren Prüfsprache
 * zu den eigenen Sprachen gehört. Sortiert: offene Stichproben, dann ziehbare, dann erledigte; innerhalb nach Einheit.
 */
export async function ladeWarteschlange(sprachen: readonly Sprache[]): Promise<WarteEintrag[]> {
  if (!sprachen.length) return [];
  const einheiten = await db
    .select({
      id: schema.lernappEinheit.id,
      schluessel: schema.lernappEinheit.schluessel,
      thema: schema.lernappEinheit.thema,
      kurs: schema.lernappAbschnitt.kursId,
      stufe: schema.lernappAbschnitt.stufe,
      reihenfolge: schema.lernappAbschnitt.reihenfolge,
    })
    .from(schema.lernappEinheit)
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(and(inArray(schema.lernappAbschnitt.kursId, ['de', 'tr', 'ar']), inArray(schema.lernappEinheit.status, LIEFERBAR)))
    .orderBy(asc(schema.lernappAbschnitt.kursId), asc(schema.lernappAbschnitt.reihenfolge), asc(schema.lernappEinheit.reihenfolge));
  if (!einheiten.length) return [];
  const proben = await db
    .select({
      id: s.id,
      einheitId: s.einheitId,
      art: s.art,
      richtungId: s.richtungId,
      entscheidung: s.entscheidung,
      groesse: s.groesse,
      einheitHash: s.einheitHash,
      gezogenAm: s.gezogenAm,
    })
    .from(s)
    .where(
      inArray(
        s.einheitId,
        einheiten.map((e) => e.id),
      ),
    )
    .orderBy(desc(s.gezogenAm));
  // Beurteilte Einträge je Stichprobe (eigene Abfrage: ein `sql`-Unterabfrage-Verweis auf `s.id` stünde in einer Abfrage ohne
  // Join unqualifiziert da und träfe die `id` der Prüfungen)
  const p = schema.lernappPruefung;
  const zaehlung = proben.length
    ? await db
        .select({ stichprobeId: p.stichprobeId, n: sql<number>`count(distinct ${p.inhaltId})`.mapWith(Number) })
        .from(p)
        .where(
          inArray(
            p.stichprobeId,
            proben.map((x) => x.id),
          ),
        )
        .groupBy(p.stichprobeId)
    : [];
  const beurteilt = new Map(zaehlung.map((z) => [z.stichprobeId, z.n]));
  const liste: WarteEintrag[] = [];
  for (const e of einheiten) {
    const ziel = e.kurs as Sprache;
    const ziele: { art: StichprobeArt; richtung: RichtungId | null }[] = [
      { art: 'zieltext', richtung: null },
      ...RICHTUNGEN.filter((r) => zerlegeRichtung(r).ziel === ziel).map((r) => ({ art: 'uebersetzung' as const, richtung: r })),
      { art: 'audio', richtung: null },
    ];
    for (const z of ziele) {
      const sprache = pruefSprache(z.art, ziel, z.richtung ? zerlegeRichtung(z.richtung).ausgang : null);
      if (!sprachen.includes(sprache)) continue;
      const k = await kandidaten(e.schluessel, z.art, z.richtung);
      if (!k.length) continue;
      const stand = standVon(k);
      const eigene = proben.filter((p) => p.einheitId === e.id && p.art === z.art && (p.richtungId ?? null) === z.richtung);
      const letzte = eigene[0];
      const offen = eigene.some((p) => p.entscheidung === 'offen');
      const zumStand = eigene.some((p) => p.einheitHash === stand);
      liste.push({
        einheit: e.schluessel,
        einheitId: e.id,
        kurs: e.kurs,
        stufe: e.stufe,
        thema: e.thema as Record<string, string>,
        art: z.art,
        richtung: z.richtung,
        sprache,
        kandidaten: k.length,
        letzte: letzte
          ? {
              id: letzte.id,
              entscheidung: letzte.entscheidung,
              groesse: letzte.groesse,
              geprueft: beurteilt.get(letzte.id) ?? 0,
              aktuell: letzte.einheitHash === stand,
            }
          : null,
        ziehbar: !offen && !zumStand,
      });
    }
  }
  const rang = (w: WarteEintrag) => (w.letzte?.entscheidung === 'offen' ? 0 : w.ziehbar ? 1 : 2);
  return liste.sort((a, b) => rang(a) - rang(b));
}

/** Entscheidungen früherer Stichproben gleicher Sprache und Art, chronologisch (Einlauf). */
export async function bisherigeEntscheidungen(sprache: Sprache, art: StichprobeArt): Promise<Entscheidung[]> {
  const z = await db
    .select({ entscheidung: s.entscheidung })
    .from(s)
    .where(and(eq(s.sprache, sprache), eq(s.art, art), sql`${s.entscheidung} <> 'offen'`))
    .orderBy(asc(s.entschiedenAm), asc(s.gezogenAm));
  return z.map((x) => x.entscheidung);
}

/** Anzahl bisheriger Stichproben (Runde) für Einheit, Art und Richtung. */
export async function anzahlStichproben(einheitId: string, art: StichprobeArt, richtung: RichtungId | null): Promise<number> {
  const [z] = await db
    .select({ n: sql<number>`count(*)`.mapWith(Number) })
    .from(s)
    .where(and(eq(s.einheitId, einheitId), eq(s.art, art), richtung ? eq(s.richtungId, richtung) : sql`${s.richtungId} is null`));
  return z?.n ?? 0;
}
