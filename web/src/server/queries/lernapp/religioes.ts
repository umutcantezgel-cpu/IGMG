import 'server-only';
import { and, asc, eq, gt, inArray, ne, or } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import {
  belegeUnsicher,
  type Belegpruefung,
  belegpruefungErgebnis,
  eigenesUrteil,
  type FreigabeBaustein,
  freigabeStand,
  lektionSichtbar,
  type Pruefung,
  type ReligioeseLage,
  type ReligioeserBaustein,
  type ReligioeserBausteinTyp,
  religioeseLage,
  type Status,
  type Urteil,
  wissenSichtbar,
  wissensAufgabeSichtbar,
} from '@/lib/lernapp/freigabe';
import type { KursId } from '@/lib/lernapp/kurse';
import { koranBedeutungHash, koranBedeutungStatus } from '@/lib/lernapp/paket/koran';
import { ladePruefungen } from './pruefungen';

/**
 * Zwei-Prüfer-Freigabe religiöser Bausteine (L6-02/03, ADR 0040 Nr. 5, KERN 4.0 §2.3, PLAN §6.7 Nr. 5–7): Aussagen, Quizfragen
 * und Lektionen des Wissenskurses `islam` und des Koran-Pfads `koran`, Aufgaben mit `religionsbezug` sowie Koran-
 * Wortbedeutungen im Lern-App-Pfad (`quran_wortbedeutung`, von Menschen verfasst; Hash über die gezeigten Felder). Ungecacht;
 * Aufrufer prüfen `lernapp.religioes.pruefen` bzw. `freigabe.lesen`. Ob etwas sichtbar ist, entscheidet nur `freigabe.ts`.
 *
 * Unabhängigkeit der Prüfenden: Die Ansicht zeigt den Stand (0/2, 1/2, 2/2), das eigene Urteil und ob ein Einwand vorliegt –
 * nie, wer sonst geprüft hat und was. Belege zeigen die Fundstelle (Werk › Kitab/Bab/Fasl, Ausgabe, Band, Seite, Passage,
 * OpenITI-URI), nie den Quelltext (ADR 0040 Fortschreibung S8 Nr. 2; LM-04).
 */

/**
 * Zeilen je Abfrage. Ganze Listen (Warteschlange, „Freigegeben“) laden wir seitenweise nach Schlüssel, bis alles gelesen ist –
 * eine Grenze vor dem Filter auf „offen“ würde sonst bei ≈ 1.400 Aussagen und ≈ 1.700 Quizfragen (PLAN §5.2) offene Bausteine
 * verdecken. Gekürzt wird erst in der Anzeige, nach Filter und Reihenfolge.
 */
const SEITE = 500;
const RELIGIOESE_KURSE = ['islam', 'koran'] as const;

/** Hash und Status einer Koran-Wortbedeutung: einzige Quelle im Paketbau (`@/lib/lernapp/paket/koran`, Vertrag L6-05/06). */
export { koranBedeutungHash };
const koranStatus = koranBedeutungStatus;

export type BelegFundstelle = {
  id: string;
  inhaltHash: string;
  werk: string;
  autor: string | null;
  /** Kitab › Bab › Fasl (Umschrift) */
  kapitel: string[];
  ausgabe: string | null;
  band: string | null;
  seite: string | null;
  passage: string;
  fundstelle: string | null;
  art: 'sinngemaess' | 'woertlich';
  belegpruefung: Belegpruefung['ergebnis'] | null;
};

/** Angabe eines Bausteins zum Lesen; `label` ist ein Schlüssel unter `verwaltung.lernapp.religioes.feld`. */
export type BausteinAngabe = { label: string; wert: string; lang?: string; dir?: 'rtl' | 'ltr' };

type Roh = {
  typ: ReligioeserBausteinTyp;
  id: string;
  schluessel: string;
  kurs: KursId;
  status: Status;
  baustein: ReligioeserBaustein;
  titel: string;
  titelLang?: string;
  /** nur Aufgaben: Aussage, aus der die Quizfrage entsteht */
  aussageId?: string | null;
  lektionId?: string;
  /** nur Koran-Bedeutungen: Sortierschlüssel (Wortform, Sprache) für das Blättern */
  form?: { formId: number; sprache: string };
};

async function belegeZu(aussageIds: readonly string[]) {
  if (!aussageIds.length) return [];
  const b = schema.lernappBeleg;
  const q = schema.lernappQuelle;
  return db
    .select({
      id: b.id,
      aussageId: b.aussageId,
      inhaltHash: b.inhaltHash,
      passage: b.passage,
      stelle: b.stelle,
      art: b.art,
      werk: q.werk,
      autor: q.autor,
      ausgabe: q.ausgabe,
      openitiUri: q.openitiUri,
    })
    .from(b)
    .innerJoin(q, eq(q.id, b.quelleId))
    .where(inArray(b.aussageId, [...aussageIds]))
    .orderBy(asc(b.passage), asc(b.id));
}

/** Kurs je Lektion (über Einheit und Abschnitt), nur Kurse mit religiöser Freigabe. */
function lektionenMitKurs() {
  const l = schema.lernappLektion;
  return db
    .select({
      id: l.id,
      schluessel: l.schluessel,
      status: l.status,
      inhaltHash: l.inhaltHash,
      verfasstVon: l.verfasstVon,
      ziel: l.ziel,
      art: l.art,
      kinderGeeignet: l.kinderGeeignet,
      kurs: schema.lernappAbschnitt.kursId,
    })
    .from(l)
    .innerJoin(schema.lernappEinheit, eq(schema.lernappEinheit.id, l.einheitId))
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId));
}

/** Auswahl einer Abfrage: genau ein Baustein (`id`) oder die nächste Seite nach dem letzten Baustein der vorigen (`nach`). */
type Auswahl = { id?: string; nach?: Roh };

async function ladeLektionen(o: Auswahl): Promise<Roh[]> {
  const l = schema.lernappLektion;
  const zeilen = await lektionenMitKurs()
    .where(
      and(
        inArray(schema.lernappAbschnitt.kursId, [...RELIGIOESE_KURSE]),
        o.id !== undefined ? eq(l.id, o.id) : undefined,
        o.nach ? gt(l.schluessel, o.nach.schluessel) : undefined,
      ),
    )
    .orderBy(asc(l.schluessel))
    .limit(SEITE);
  return zeilen.map((z) => ({
    typ: 'lektion',
    id: z.id,
    schluessel: z.schluessel,
    kurs: z.kurs as KursId,
    status: z.status,
    titel: z.ziel.de ?? z.schluessel,
    titelLang: 'de',
    lektionId: z.id,
    baustein: { inhaltHash: z.inhaltHash, verfasser: [z.verfasstVon], belege: [], belegPflicht: false, art: 'lektion' },
  }));
}

async function ladeAussagen(o: Auswahl): Promise<Roh[]> {
  const a = schema.lernappAussage;
  const zeilen = await db
    .select({
      id: a.id,
      schluessel: a.schluessel,
      text: a.text,
      status: a.status,
      inhaltHash: a.inhaltHash,
      verfasstVon: a.verfasstVon,
      lektionId: a.lektionId,
      kurs: schema.lernappAbschnitt.kursId,
    })
    .from(a)
    .innerJoin(schema.lernappLektion, eq(schema.lernappLektion.id, a.lektionId))
    .innerJoin(schema.lernappEinheit, eq(schema.lernappEinheit.id, schema.lernappLektion.einheitId))
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(and(o.id !== undefined ? eq(a.id, o.id) : undefined, o.nach ? gt(a.schluessel, o.nach.schluessel) : undefined))
    .orderBy(asc(a.schluessel))
    .limit(SEITE);
  const belege = await belegeZu(zeilen.map((z) => z.id));
  return zeilen.map((z) => ({
    typ: 'aussage',
    id: z.id,
    schluessel: z.schluessel,
    kurs: z.kurs as KursId,
    status: z.status,
    titel: z.text,
    titelLang: 'de',
    lektionId: z.lektionId,
    baustein: {
      inhaltHash: z.inhaltHash,
      verfasser: [z.verfasstVon],
      belege: belege.filter((b) => b.aussageId === z.id).map((b) => ({ id: b.id, inhaltHash: b.inhaltHash })),
      belegPflicht: true,
      art: 'aussage',
    },
  }));
}

async function ladeAufgaben(o: Auswahl): Promise<Roh[]> {
  const t = schema.lernappAufgabe;
  const zeilen = await db
    .select({
      id: t.id,
      schluessel: t.schluessel,
      typ: t.typ,
      status: t.status,
      inhaltHash: t.inhaltHash,
      verfasstVon: t.verfasstVon,
      aussageId: t.aussageId,
      lektionId: t.lektionId,
      kurs: schema.lernappAbschnitt.kursId,
    })
    .from(t)
    .innerJoin(schema.lernappLektion, eq(schema.lernappLektion.id, t.lektionId))
    .innerJoin(schema.lernappEinheit, eq(schema.lernappEinheit.id, schema.lernappLektion.einheitId))
    .innerJoin(schema.lernappAbschnitt, eq(schema.lernappAbschnitt.id, schema.lernappEinheit.abschnittId))
    .where(
      and(
        or(inArray(schema.lernappAbschnitt.kursId, [...RELIGIOESE_KURSE]), eq(t.religionsbezug, true)),
        o.id !== undefined ? eq(t.id, o.id) : undefined,
        o.nach ? gt(t.schluessel, o.nach.schluessel) : undefined,
      ),
    )
    .orderBy(asc(t.schluessel))
    .limit(SEITE);
  return zeilen.map((z) => ({
    typ: 'aufgabe',
    id: z.id,
    schluessel: z.schluessel,
    kurs: z.kurs as KursId,
    status: z.status,
    titel: z.schluessel,
    aussageId: z.aussageId,
    lektionId: z.lektionId,
    baustein: { inhaltHash: z.inhaltHash, verfasser: [z.verfasstVon], belege: [], belegPflicht: false, art: 'aufgabe' },
  }));
}

async function ladeKoranBedeutungen(o: Auswahl): Promise<Roh[]> {
  if (o.id !== undefined && !/^[0-9a-f-]{36}$/i.test(o.id)) return [];
  const wb = schema.quranWortbedeutung;
  const nach = o.nach?.form;
  const zeilen = await db
    .select({
      id: wb.id,
      formId: wb.formId,
      sprache: wb.sprache,
      bedeutung: wb.bedeutung,
      wurzel: wb.wurzel,
      anmerkung: wb.anmerkung,
      freigabe: wb.freigabe,
      verfasstVon: wb.verfasstVon,
    })
    .from(wb)
    .where(
      and(
        ne(wb.freigabe, 'entwurf'),
        o.id !== undefined ? eq(wb.id, o.id) : undefined,
        nach ? or(gt(wb.formId, nach.formId), and(eq(wb.formId, nach.formId), gt(wb.sprache, nach.sprache))) : undefined,
      ),
    )
    .orderBy(asc(wb.formId), asc(wb.sprache))
    .limit(SEITE);
  return zeilen.map((z) => ({
    typ: 'koran_bedeutung',
    id: z.id,
    schluessel: `koran.bedeutung.${z.formId}.${z.sprache}`,
    kurs: 'koran',
    status: koranStatus(z.freigabe),
    titel: z.bedeutung,
    titelLang: z.sprache,
    form: { formId: z.formId, sprache: z.sprache },
    baustein: {
      inhaltHash: koranBedeutungHash(z),
      verfasser: [z.verfasstVon],
      belege: [],
      belegPflicht: false,
      art: 'koran_bedeutung',
    },
  }));
}

/** Lader je Typ; Reihenfolge der ganzen Liste: Lektionen, Aussagen, Quizfragen, Koran-Bedeutungen (je nach Schlüssel). */
const LADER = {
  lektion: ladeLektionen,
  aussage: ladeAussagen,
  aufgabe: ladeAufgaben,
  koran_bedeutung: ladeKoranBedeutungen,
} as const satisfies Record<ReligioeserBausteinTyp, (o: Auswahl) => Promise<Roh[]>>;

/** Genau ein Baustein (roh) oder keiner. */
async function ladeRoh(nur: { typ: ReligioeserBausteinTyp; id: string }): Promise<Roh[]> {
  return LADER[nur.typ]({ id: nur.id });
}

/** Alle Bausteine, Seite für Seite (je höchstens {@link SEITE}, Cursor nach Schlüssel) – nichts wird abgeschnitten. */
async function jedeSeite(verarbeite: (seite: Roh[]) => Promise<void>): Promise<void> {
  for (const lade of Object.values(LADER)) {
    let nach: Roh | undefined;
    for (;;) {
      const seite = await lade({ nach });
      if (seite.length) await verarbeite(seite);
      if (seite.length < SEITE) break;
      nach = seite.at(-1);
    }
  }
}

/** Prüfungen und Belegprüfungen zu den Bausteinen (Prüfungen mit den aktuellen Rollen der Prüfenden). */
async function pruefungenZu(roh: readonly Roh[]) {
  const ids = [
    ...roh.map((r) => ({ typ: r.typ, id: r.id })),
    ...roh.flatMap((r) => r.baustein.belege.map((b) => ({ typ: 'beleg' as const, id: b.id }))),
  ];
  const alle = await ladePruefungen(ids);
  const je = (r: Roh): Pruefung[] => alle.get(`${r.typ}:${r.id}`) ?? [];
  const belegpruefungen = (r: Roh): Belegpruefung[] =>
    r.baustein.belege.flatMap((b) =>
      (alle.get(`beleg:${b.id}`) ?? [])
        .filter((p) => p.art === 'religioes' && p.pruefendeId === null)
        .map((p) => ({ belegId: b.id, inhaltHash: p.inhaltHash, ergebnis: belegpruefungErgebnis(p.urteil) })),
    );
  return { je, belegpruefungen };
}

export type ReligioeserEintrag = {
  typ: ReligioeserBausteinTyp;
  id: string;
  schluessel: string;
  kurs: KursId;
  titel: string;
  titelLang?: string;
  status: Status;
  lage: ReligioeseLage;
  /** Freigaben 0, 1 oder 2 */
  stand: number;
  eigenes: Urteil | null;
  /** Die angemeldete Person hat den aktuellen Stand verfasst */
  verfasser: boolean;
  unsicher: boolean;
  /** schon geurteilt oder Verfasser: nichts mehr zu tun */
  erledigt: boolean;
};

function eintragVon(r: Roh, pruefungen: Pruefung[], belegpruefungen: Belegpruefung[], benutzerId: string): ReligioeserEintrag {
  const lage = religioeseLage(r.baustein, pruefungen);
  const eigenes = eigenesUrteil(benutzerId, r.baustein.inhaltHash, pruefungen);
  const verfasser = r.baustein.verfasser.includes(benutzerId);
  return {
    typ: r.typ,
    id: r.id,
    schluessel: r.schluessel,
    kurs: r.kurs,
    titel: r.titel,
    titelLang: r.titelLang,
    status: r.status,
    lage,
    stand: freigabeStand(lage),
    eigenes,
    verfasser,
    unsicher: belegeUnsicher(r.baustein.belege, belegpruefungen),
    erledigt: verfasser || eigenes !== null,
  };
}

/**
 * Alle Bausteine mit Zwei-Prüfer-Freigabe und ihrem Stand aus Sicht der angemeldeten Person (Reihenfolge wie geladen; die
 * Warteschlange ordnet `ordneWarteschlange`). Zurückgezogene (`gesperrt`) Bausteine stehen nicht darin. Vollständig: Die
 * Aufrufer filtern (offen, freigegeben) und kürzen erst danach.
 */
export async function ladeReligioeseBausteine(benutzerId: string): Promise<ReligioeserEintrag[]> {
  const alle: ReligioeserEintrag[] = [];
  await jedeSeite(async (seite) => {
    const roh = seite.filter((r) => r.status !== 'gesperrt');
    const { je, belegpruefungen } = await pruefungenZu(roh);
    for (const r of roh) alle.push(eintragVon(r, je(r), belegpruefungen(r), benutzerId));
  });
  return alle;
}

export type BausteinDetail = ReligioeserEintrag & {
  inhaltHash: string;
  angaben: BausteinAngabe[];
  belege: BelegFundstelle[];
  /** Aufgabe: die Aussage, aus der sie entsteht, mit deren Stand */
  aussage: { id: string; schluessel: string; text: string; stand: number } | null;
  /** Lektion, zu der der Baustein gehört */
  lektion: string | null;
  /** Koran-Bedeutung: die Wortform aus den gepinnten Daten (Anzeige mit lang/dir) */
  wortform: string | null;
};

const stelleTeile = (s: { kitab?: string; bab?: string; fasl?: string }) => [s.kitab, s.bab, s.fasl].filter((x): x is string => Boolean(x));

/** Angaben einer Aufgabe zum Lesen (nur Felder mit deutschem Text bzw. Verweisen; Reihenfolge fest). */
function aufgabeAngaben(typ: string, daten: Record<string, unknown>): BausteinAngabe[] {
  const angaben: BausteinAngabe[] = [{ label: 'aufgabentyp', wert: typ }];
  const text = (k: string) => (typeof daten[k] === 'string' ? [{ label: k, wert: daten[k] as string, lang: 'de' }] : []);
  const liste = (k: string) =>
    Array.isArray(daten[k]) && (daten[k] as unknown[]).every((x) => typeof x === 'string')
      ? [{ label: k, wert: (daten[k] as string[]).map((x, i) => `${i + 1}. ${x}`).join('\n'), lang: 'de' }]
      : [];
  angaben.push(...text('fall'), ...text('frage'), ...text('behauptung'), ...text('anweisung'), ...text('text'));
  angaben.push(...liste('optionen'), ...liste('schritte'));
  if (Array.isArray(daten.paare))
    angaben.push({
      label: 'paare',
      wert: (daten.paare as { links?: unknown; rechts?: unknown }[]).map((p) => `${String(p.links)} – ${String(p.rechts)}`).join('\n'),
      lang: 'de',
    });
  angaben.push(...text('loesung'), ...liste('ablenker'));
  if (typeof daten.richtig === 'number' || typeof daten.richtig === 'boolean')
    angaben.push({ label: 'richtig', wert: typeof daten.richtig === 'number' ? String(daten.richtig + 1) : String(daten.richtig) });
  angaben.push(...text('begruendung'));
  for (const k of ['wortform', 'art'] as const) if (typeof daten[k] === 'string') angaben.push({ label: k, wert: daten[k] as string });
  return angaben;
}

/** Ein Baustein mit allem, was die Prüfenden zum Urteil brauchen; null, wenn es ihn nicht gibt oder er zurückgezogen ist. */
export async function ladeReligioesenBaustein(typ: ReligioeserBausteinTyp, id: string, benutzerId: string): Promise<BausteinDetail | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [r] = await ladeRoh({ typ, id });
  if (!r || r.status === 'gesperrt') return null;
  const { je, belegpruefungen } = await pruefungenZu([r]);
  const bp = belegpruefungen(r);
  const eintrag = eintragVon(r, je(r), bp, benutzerId);
  const angaben: BausteinAngabe[] = [];
  let belege: BelegFundstelle[] = [];
  let aussage: BausteinDetail['aussage'] = null;
  let wortform: string | null = null;
  let lektion: string | null = null;
  if (r.lektionId) {
    const [l] = await db
      .select({ schluessel: schema.lernappLektion.schluessel })
      .from(schema.lernappLektion)
      .where(eq(schema.lernappLektion.id, r.lektionId));
    lektion = l?.schluessel ?? null;
  }

  if (typ === 'aussage') {
    const [a] = await db.select().from(schema.lernappAussage).where(eq(schema.lernappAussage.id, id));
    if (!a) return null;
    angaben.push({ label: 'aussage', wert: a.text, lang: 'de' });
    if (a.meinung) angaben.push({ label: 'meinung', wert: a.meinung });
    angaben.push(
      { label: 'strittig', wert: a.strittig ? 'ja' : 'nein' },
      { label: 'kinderGeeignet', wert: a.kinderGeeignet ? 'ja' : 'nein' },
    );
    belege = (await belegeZu([id])).map((b) => {
      const stelle = b.stelle ?? {};
      const eigene = bp.find((p) => p.belegId === b.id && p.inhaltHash === b.inhaltHash);
      return {
        id: b.id,
        inhaltHash: b.inhaltHash,
        werk: b.werk,
        autor: b.autor,
        kapitel: stelleTeile(stelle),
        ausgabe: b.ausgabe,
        band: stelle.band ?? null,
        seite: stelle.seite ?? null,
        passage: b.passage,
        fundstelle: b.openitiUri ? `${b.openitiUri}#${b.passage.split('.').pop()}` : null,
        art: b.art,
        belegpruefung: eigene?.ergebnis ?? null,
      };
    });
  } else if (typ === 'aufgabe') {
    const [t] = await db.select().from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.id, id));
    if (!t) return null;
    angaben.push(...aufgabeAngaben(t.typ, t.daten));
    if (t.aussageId) {
      const [ar] = await ladeRoh({ typ: 'aussage', id: t.aussageId });
      if (ar) {
        const p = await pruefungenZu([ar]);
        const [text] = await db
          .select({ text: schema.lernappAussage.text })
          .from(schema.lernappAussage)
          .where(eq(schema.lernappAussage.id, ar.id));
        aussage = {
          id: ar.id,
          schluessel: ar.schluessel,
          text: text?.text ?? '',
          stand: freigabeStand(religioeseLage(ar.baustein, p.je(ar))),
        };
      }
    }
  } else if (typ === 'lektion') {
    const [l] = await db.select().from(schema.lernappLektion).where(eq(schema.lernappLektion.id, id));
    if (!l) return null;
    if (l.ziel.de) angaben.push({ label: 'ziel', wert: l.ziel.de, lang: 'de' });
    angaben.push({ label: 'lektionsart', wert: l.art }, { label: 'kinderGeeignet', wert: l.kinderGeeignet ? 'ja' : 'nein' });
    const [aussagen, aufgaben] = await Promise.all([
      db.select({ id: schema.lernappAussage.id }).from(schema.lernappAussage).where(eq(schema.lernappAussage.lektionId, id)),
      db.select({ id: schema.lernappAufgabe.id }).from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.lektionId, id)),
    ]);
    angaben.push({ label: 'umfang', wert: `${aussagen.length} / ${aufgaben.length}` });
  } else {
    const [b] = await db
      .select({
        sprache: schema.quranWortbedeutung.sprache,
        bedeutung: schema.quranWortbedeutung.bedeutung,
        wurzel: schema.quranWortbedeutung.wurzel,
        anmerkung: schema.quranWortbedeutung.anmerkung,
        wort: schema.quranWortform.textAr,
      })
      .from(schema.quranWortbedeutung)
      .innerJoin(schema.quranWortform, eq(schema.quranWortform.id, schema.quranWortbedeutung.formId))
      .where(eq(schema.quranWortbedeutung.id, id));
    if (!b) return null;
    wortform = b.wort;
    angaben.push({ label: 'sprache', wert: b.sprache }, { label: 'bedeutung', wert: b.bedeutung, lang: b.sprache });
    if (b.wurzel) angaben.push({ label: 'wurzel', wert: b.wurzel, lang: 'ar', dir: 'rtl' });
    if (b.anmerkung) angaben.push({ label: 'anmerkung', wert: b.anmerkung });
  }
  return { ...eintrag, inhaltHash: r.baustein.inhaltHash, angaben, belege, aussage, lektion, wortform };
}

/** Freigabelage eines Bausteins für Aktionen (Hash, Verfasser, Belege, Prüfungen, Kurs); null, wenn es ihn nicht gibt. */
export async function ladeFreigabe(
  typ: ReligioeserBausteinTyp,
  id: string,
): Promise<(FreigabeBaustein & { kurs: KursId; schluessel: string; aussageId: string | null }) | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [r] = await ladeRoh({ typ, id });
  if (!r) return null;
  const { je } = await pruefungenZu([r]);
  return {
    status: r.status,
    baustein: r.baustein,
    pruefungen: je(r),
    kurs: r.kurs,
    schluessel: r.schluessel,
    aussageId: r.aussageId ?? null,
  };
}

/**
 * Sichtbar im Lern-App-Pfad (ADR 0040 Nr. 5)? Aussage, Lektion, Koran-Bedeutung: geprüft und nicht zurückgezogen. Quizfrage:
 * selbst geprüft und ihre Aussage geprüft (ohne Aussage im Wissenskurs nie). Aufgabe im Koran-Pfad: nie, solange der
 * Paketbau (L6-05) die gezeigten Bedeutungen bzw. die Wurzeltabelle nicht auflöst – erst dann gilt `koranWortSichtbar`
 * (fail-closed wie die Auslieferung, die für `koran` noch keine Einheiten liefert). Abfrage am Live-Stand für das Tor L6.
 */
export async function religioesSichtbar(typ: ReligioeserBausteinTyp, id: string): Promise<boolean> {
  const f = await ladeFreigabe(typ, id);
  if (!f) return false;
  if (typ !== 'aufgabe') return wissenSichtbar(f.status, f.baustein, f.pruefungen);
  if (f.kurs === 'koran') return false;
  if (!f.aussageId) return f.kurs !== 'islam' && wissenSichtbar(f.status, f.baustein, f.pruefungen);
  const aussage = await ladeFreigabe('aussage', f.aussageId);
  return aussage !== null && wissensAufgabeSichtbar(f, [aussage]);
}

/** Lektion nur ganz (KERN 4.0 §2.3): sie selbst, alle ihre Aussagen und alle ihre Aufgaben müssen sichtbar sein. */
export async function lektionReligioesSichtbar(lektionId: string): Promise<boolean> {
  if (!/^[0-9a-f-]{36}$/i.test(lektionId)) return false;
  const [aussagen, aufgaben] = await Promise.all([
    db.select({ id: schema.lernappAussage.id }).from(schema.lernappAussage).where(eq(schema.lernappAussage.lektionId, lektionId)),
    db.select({ id: schema.lernappAufgabe.id }).from(schema.lernappAufgabe).where(eq(schema.lernappAufgabe.lektionId, lektionId)),
  ]);
  const bausteine = await Promise.all([
    religioesSichtbar('lektion', lektionId),
    ...aussagen.map((a) => religioesSichtbar('aussage', a.id)),
    ...aufgaben.map((a) => religioesSichtbar('aufgabe', a.id)),
  ]);
  // Die Lektion allein (ohne Aussagen und Aufgaben) ist nie sichtbar
  return aussagen.length + aufgaben.length > 0 && lektionSichtbar(bausteine);
}
