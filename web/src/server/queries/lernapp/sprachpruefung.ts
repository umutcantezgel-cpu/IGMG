import 'server-only';
import { and, asc, desc, eq, inArray, like, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Status } from '@/lib/lernapp/freigabe';
import { type RichtungId, RICHTUNGEN, type Sprache, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { sha256Hex } from '@/lib/lernapp/paket/hash';
import { type Entscheidung, pruefSprache, type StichprobeArt } from '@/lib/lernapp/stichprobe';
import { inBloecken, textHashGemerkt } from './bloecke';

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

type Zieltext = {
  id: string;
  schluessel: string;
  text: string;
  inhaltHash: string;
  status: Status;
  religionsbezug: boolean;
  inhaltTyp: 'lemma' | 'satz';
};

/** Lieferbare Zieltexte einer Einheit (Schlüssel `<einheit>.…`) bzw. aller Einheiten der Kurse, nach Schlüssel sortiert. */
async function zieltexte(o: { einheit: string } | { kurse: readonly Sprache[] }): Promise<Zieltext[]> {
  const l = schema.lernappLemma;
  const st = schema.lernappSatz;
  const [lemmata, saetze] = await Promise.all([
    db
      .select({
        id: l.id,
        schluessel: l.schluessel,
        text: l.lemma,
        inhaltHash: l.inhaltHash,
        status: l.status,
        religionsbezug: l.religionsbezug,
      })
      .from(l)
      .where(and('einheit' in o ? like(l.schluessel, `${o.einheit}.%`) : inArray(l.kursId, [...o.kurse]), inArray(l.status, LIEFERBAR))),
    db
      .select({
        id: st.id,
        schluessel: st.schluessel,
        text: st.text,
        inhaltHash: st.inhaltHash,
        status: st.status,
        religionsbezug: st.religionsbezug,
      })
      .from(st)
      .where(and('einheit' in o ? like(st.schluessel, `${o.einheit}.%`) : inArray(st.kursId, [...o.kurse]), inArray(st.status, LIEFERBAR))),
  ]);
  return [
    ...lemmata.map((x) => ({ ...x, inhaltTyp: 'lemma' as const })),
    ...saetze.map((x) => ({ ...x, inhaltTyp: 'satz' as const })),
  ].sort((a, b) => (a.schluessel < b.schluessel ? -1 : 1));
}

type UebersetzungZeile = {
  id: string;
  lemmaId: string | null;
  satzId: string | null;
  sprache: Sprache;
  text: string;
  alternativen: string[];
  inhaltHash: string;
  status: Status;
  religionsbezug: boolean;
};

/** Lieferbare Übersetzungen der Zieltexte (alle Sprachen bzw. nur `sprache`), in Blöcken. */
async function uebersetzungenVon(ziel: readonly Zieltext[], sprache?: Sprache): Promise<UebersetzungZeile[]> {
  const u = schema.lernappUebersetzung;
  const spalten = {
    id: u.id,
    lemmaId: u.lemmaId,
    satzId: u.satzId,
    sprache: u.sprache,
    text: u.text,
    alternativen: u.alternativen,
    inhaltHash: u.inhaltHash,
    status: u.status,
    religionsbezug: u.religionsbezug,
  };
  const bedingung = (spalte: typeof u.lemmaId | typeof u.satzId, block: string[]) =>
    and(inArray(spalte, block), inArray(u.status, LIEFERBAR), sprache ? eq(u.sprache, sprache) : undefined);
  return [
    ...(await inBloecken(
      ziel.filter((z) => z.inhaltTyp === 'lemma').map((z) => z.id),
      (block) => db.select(spalten).from(u).where(bedingung(u.lemmaId, block)),
    )),
    ...(await inBloecken(
      ziel.filter((z) => z.inhaltTyp === 'satz').map((z) => z.id),
      (block) => db.select(spalten).from(u).where(bedingung(u.satzId, block)),
    )),
  ];
}

type Clip = typeof schema.lernappAudio.$inferSelect;
type Wahl = typeof schema.lernappAudioWahl.$inferSelect;

/** Clips und Wahlen der vertonbaren Zieltexte (je Sprache des Schlüssels), in Blöcken. */
async function clipsVon(ziel: readonly Zieltext[]): Promise<{ clips: Clip[]; wahlen: Wahl[] }> {
  const jeSprache = new Map<Sprache, Set<string>>();
  for (const z of ziel) {
    if (z.religionsbezug) continue;
    const sprache = z.schluessel.split('.')[0] as Sprache;
    jeSprache.set(sprache, (jeSprache.get(sprache) ?? new Set()).add(textHashGemerkt(z.text)));
  }
  const clips: Clip[] = [];
  const wahlen: Wahl[] = [];
  for (const [sprache, hashes] of jeSprache) {
    const [c, w] = await Promise.all([
      inBloecken([...hashes], (block) =>
        db
          .select()
          .from(schema.lernappAudio)
          .where(and(eq(schema.lernappAudio.sprache, sprache), inArray(schema.lernappAudio.textHash, block))),
      ),
      inBloecken([...hashes], (block) =>
        db
          .select()
          .from(schema.lernappAudioWahl)
          .where(and(eq(schema.lernappAudioWahl.sprache, sprache), inArray(schema.lernappAudioWahl.textHash, block))),
      ),
    ]);
    clips.push(...c);
    wahlen.push(...w);
  }
  return { clips, wahlen };
}

/** Kandidaten aus geladenen Zeilen (rein): Zieltexte, Übersetzungen in die Ausgangssprache, Clips der wirksamen Stimme. */
function baueKandidaten(
  ziel: readonly Zieltext[],
  art: StichprobeArt,
  o: { ausgang?: Sprache | null; uebersetzungen?: readonly UebersetzungZeile[]; clips?: readonly Clip[]; wahlen?: readonly Wahl[] },
): Kandidat[] {
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
    if (!o.ausgang) return [];
    const jeZiel = new Map<string, UebersetzungZeile>();
    for (const x of o.uebersetzungen ?? []) if (x.sprache === o.ausgang) jeZiel.set(x.lemmaId ?? x.satzId ?? '', x);
    return ziel.flatMap((z) => {
      const x = jeZiel.get(z.id);
      return x
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
  const hashJe = new Map<string, Zieltext>();
  for (const z of ziel) if (!z.religionsbezug) hashJe.set(`${z.schluessel.split('.')[0]}|${textHashGemerkt(z.text)}`, z);
  if (!hashJe.size) return [];
  const wahl = new Map((o.wahlen ?? []).map((w) => [`${w.sprache}|${w.textHash}`, w.wahl]));
  const rang = (s: string) => ['mensch:', 'tts:', 'test:'].findIndex((p) => s.startsWith(p)) >>> 0;
  const jeText = new Map<string, Clip>();
  for (const c of [...(o.clips ?? [])].sort((a, b) => rang(a.stimme) - rang(b.stimme) || (a.stimme < b.stimme ? -1 : 1))) {
    const k = `${c.sprache}|${c.textHash}`;
    if (!hashJe.has(k)) continue;
    if (wahl.get(k) === 'sprachausgabe' && c.stimme.startsWith('mensch:')) continue;
    if (!jeText.has(k)) jeText.set(k, c);
  }
  return [...jeText.entries()].map(([k, c]) => {
    const z = hashJe.get(k)!;
    return {
      schluessel: z.schluessel,
      inhaltTyp: 'audio' as const,
      inhaltId: c.id,
      inhaltHash: c.sha256,
      status: z.status,
      religionsbezug: false,
      text: z.text,
      clip: { buendel: c.buendel, versatz: c.versatz, laenge: c.laenge, stimme: c.stimme },
    };
  });
}

/** Kandidaten einer Einheit und Art (Übersetzungen je Richtung). */
export async function kandidaten(einheit: string, art: StichprobeArt, richtung?: RichtungId | null): Promise<Kandidat[]> {
  const ziel = await zieltexte({ einheit });
  if (!ziel.length) return [];
  if (art === 'zieltext') return baueKandidaten(ziel, art, {});
  if (art === 'uebersetzung') {
    if (!richtung) return [];
    const { ausgang } = zerlegeRichtung(richtung);
    return baueKandidaten(ziel, art, { ausgang, uebersetzungen: await uebersetzungenVon(ziel, ausgang) });
  }
  return baueKandidaten(ziel, art, await clipsVon(ziel));
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
  const proben = (
    await inBloecken(
      einheiten.map((e) => e.id),
      (block) =>
        db
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
          .where(inArray(s.einheitId, block)),
    )
  ).sort((a, b) => b.gezogenAm.getTime() - a.gezogenAm.getTime());
  // Beurteilte Einträge je Stichprobe (eigene Abfrage: ein `sql`-Unterabfrage-Verweis auf `s.id` stünde in einer Abfrage ohne
  // Join unqualifiziert da und träfe die `id` der Prüfungen)
  const p = schema.lernappPruefung;
  const zaehlung = await inBloecken(
    proben.map((x) => x.id),
    (block) =>
      db
        .select({ stichprobeId: p.stichprobeId, n: sql<number>`count(distinct ${p.inhaltId})`.mapWith(Number) })
        .from(p)
        .where(inArray(p.stichprobeId, block))
        .groupBy(p.stichprobeId),
  );
  const beurteilt = new Map(zaehlung.map((z) => [z.stichprobeId, z.n]));
  // Ziele je Einheit und nur die, deren Prüfsprache zu den eigenen gehört
  const zieleVon = (ziel: Sprache) =>
    [
      { art: 'zieltext' as const, richtung: null },
      ...RICHTUNGEN.filter((r) => zerlegeRichtung(r).ziel === ziel).map((r) => ({ art: 'uebersetzung' as const, richtung: r })),
      { art: 'audio' as const, richtung: null },
    ]
      .map((z) => ({ ...z, sprache: pruefSprache(z.art, ziel, z.richtung ? zerlegeRichtung(z.richtung).ausgang : null) }))
      .filter((z) => sprachen.includes(z.sprache));
  const kurse = [...new Set(einheiten.map((e) => e.kurs as Sprache))].filter((k) => zieleVon(k).length);
  // Gebündelt (Restmangel L3-06): Zieltexte, Übersetzungen und Clips aller Einheiten mit je einer Abfrage (in Blöcken),
  // nicht je Einheit × Art × Richtung
  const alle = kurse.length ? await zieltexte({ kurse }) : [];
  const brauchtUebersetzung = kurse.some((k) => zieleVon(k).some((z) => z.art === 'uebersetzung'));
  const brauchtAudio = kurse.some((k) => zieleVon(k).some((z) => z.art === 'audio'));
  const [uebersetzungen, audio] = await Promise.all([
    brauchtUebersetzung ? uebersetzungenVon(alle) : Promise.resolve([]),
    brauchtAudio ? clipsVon(alle) : Promise.resolve({ clips: [], wahlen: [] }),
  ]);
  const einheitSchluessel = new Set(einheiten.map((e) => e.schluessel));
  const zuEinheit = (schluessel: string) => {
    const teile = schluessel.split('.');
    for (let n = teile.length - 1; n > 0; n--) {
      const kandidat = teile.slice(0, n).join('.');
      if (einheitSchluessel.has(kandidat)) return kandidat;
    }
    return null;
  };
  const zielJeEinheit = new Map<string, Zieltext[]>();
  for (const z of alle) {
    const e = zuEinheit(z.schluessel);
    if (e) zielJeEinheit.set(e, [...(zielJeEinheit.get(e) ?? []), z]);
  }
  const liste: WarteEintrag[] = [];
  for (const e of einheiten) {
    const ziel = zielJeEinheit.get(e.schluessel) ?? [];
    if (!ziel.length) continue;
    for (const z of zieleVon(e.kurs as Sprache)) {
      const k = baueKandidaten(ziel, z.art, {
        ausgang: z.richtung ? zerlegeRichtung(z.richtung).ausgang : null,
        uebersetzungen,
        ...audio,
      });
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
        sprache: z.sprache,
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
