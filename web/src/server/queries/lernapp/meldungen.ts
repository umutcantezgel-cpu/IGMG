import 'server-only';
import { and, asc, count, desc, eq, inArray, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import { STATUS, type Status } from '@/lib/lernapp/freigabe';
import { AufgabeVorlageSchema, verweiseVon } from '@/lib/lernapp/inhalt/schema';
import { istRichtung, zerlegeRichtung } from '@/lib/lernapp/kurse';
import { alternativeZiel, type AlternativeZiel, type MeldungKategorie, zerlegeMeldungsSchluessel } from '@/lib/lernapp/meldung';
import type { StichprobeArt } from '@/lib/lernapp/stichprobe';
import type { Entsperrbar } from '@/lib/lernapp/veroeffentlichen';
import { inBloecken } from './bloecke';

/**
 * Meldungen aus der App (ADR 0041 Nr. 9) für die Verwaltung (L3-06): Liste mit Aufgabe, Ziel einer Alternative und den
 * verwiesenen Einträgen; dazu die gemeldeten Einträge einer Einheit für die Stichprobe („gemeldete Einträge immer“).
 */

/** Welche Stichprobe eine Meldungskategorie betrifft. */
const ART_DER_KATEGORIE: Record<MeldungKategorie, StichprobeArt> = {
  antwort_richtig: 'uebersetzung',
  fehler_zieltext: 'zieltext',
  fehler_uebersetzung: 'uebersetzung',
  fehler_audio: 'audio',
  anstoessig: 'zieltext',
  sonstiges: 'zieltext',
};

async function ladeAufgaben(schluessel: readonly string[]) {
  if (!schluessel.length)
    return new Map<string, { id: string; typ: string; daten: Record<string, unknown>; status: string; religionsbezug: boolean }>();
  const z = await db
    .select({
      id: schema.lernappAufgabe.id,
      schluessel: schema.lernappAufgabe.schluessel,
      typ: schema.lernappAufgabe.typ,
      daten: schema.lernappAufgabe.daten,
      status: schema.lernappAufgabe.status,
      religionsbezug: schema.lernappAufgabe.religionsbezug,
    })
    .from(schema.lernappAufgabe)
    .where(inArray(schema.lernappAufgabe.schluessel, [...new Set(schluessel)]));
  return new Map(z.map((x) => [x.schluessel, x]));
}

/** Verweise (Lemma- und Satzschlüssel) einer Aufgabe aus ihren Daten. */
export function verweiseDerAufgabe(a: { schluessel: string; typ: string; daten: Record<string, unknown> }): string[] {
  const v = AufgabeVorlageSchema.safeParse({ ...a.daten, schluessel: a.schluessel, typ: a.typ });
  return v.success ? verweiseVon(v.data) : [];
}

/**
 * Gemeldete Einträge einer Einheit für eine Stichprobenart (offene Meldungen, deren Aufgabe zur Einheit gehört). Bei
 * Übersetzungen nur Meldungen aus der Richtung der Stichprobe.
 */
export async function gemeldeteEintraege(einheit: string, art: StichprobeArt, richtung: string | null): Promise<string[]> {
  const offen = await db
    .select({ schluessel: schema.lernappMeldung.aufgabeSchluessel, kategorie: schema.lernappMeldung.kategorie })
    .from(schema.lernappMeldung)
    .where(eq(schema.lernappMeldung.status, 'offen'));
  const passend = offen.flatMap((m) => {
    const z = zerlegeMeldungsSchluessel(m.schluessel);
    if (!z || !z.aufgabe.startsWith(`${einheit}.`) || ART_DER_KATEGORIE[m.kategorie] !== art) return [];
    if (art === 'uebersetzung' && z.kurs !== richtung) return [];
    return [z.aufgabe];
  });
  const aufgaben = await ladeAufgaben(passend);
  return [...new Set([...aufgaben.entries()].flatMap(([schluessel, a]) => verweiseDerAufgabe({ schluessel, typ: a.typ, daten: a.daten })))];
}

export type MeldungZeile = {
  id: string;
  kurs: string;
  aufgabe: string;
  kategorie: MeldungKategorie;
  antwort: string | null;
  status: 'offen' | 'erledigt';
  am: Date;
  erledigtAm: Date | null;
  /** Aufgabe in der Datenbank (fehlt: inzwischen entfernt) */
  aufgabeDaten: { typ: string; status: string; religionsbezug: boolean } | null;
  ziel: AlternativeZiel;
  /** Hauptlösung und vorhandene Alternativen am Ziel */
  loesung: { haupt: string; alternativen: string[] } | null;
  /** Verwiesene Einträge (sperrbar) */
  verweise: { schluessel: string; text: string; status: string }[];
};

/** Meldungen einer Ansicht (offen bzw. erledigt), jüngste zuerst, höchstens 200. */
export async function ladeMeldungen(status: 'offen' | 'erledigt'): Promise<MeldungZeile[]> {
  const m = schema.lernappMeldung;
  const zeilen = await db
    .select()
    .from(m)
    .where(eq(m.status, status))
    .orderBy(status === 'offen' ? asc(m.am) : desc(m.erledigtAm))
    .limit(200);
  const zerlegt = zeilen.map((z) => ({ z, k: zerlegeMeldungsSchluessel(z.aufgabeSchluessel) }));
  const aufgaben = await ladeAufgaben(zerlegt.flatMap((x) => (x.k ? [x.k.aufgabe] : [])));
  const alleVerweise = new Set<string>();
  const verweiseJe = new Map<string, string[]>();
  for (const [schluessel, a] of aufgaben) {
    const v = verweiseDerAufgabe({ schluessel, typ: a.typ, daten: a.daten });
    verweiseJe.set(schluessel, v);
    for (const x of v) alleVerweise.add(x);
  }
  const liste = [...alleVerweise];
  const [lemmata, saetze] = liste.length
    ? await Promise.all([
        db
          .select({
            id: schema.lernappLemma.id,
            schluessel: schema.lernappLemma.schluessel,
            text: schema.lernappLemma.lemma,
            status: schema.lernappLemma.status,
          })
          .from(schema.lernappLemma)
          .where(inArray(schema.lernappLemma.schluessel, liste)),
        db
          .select({
            id: schema.lernappSatz.id,
            schluessel: schema.lernappSatz.schluessel,
            text: schema.lernappSatz.text,
            status: schema.lernappSatz.status,
          })
          .from(schema.lernappSatz)
          .where(inArray(schema.lernappSatz.schluessel, liste)),
      ])
    : [[], []];
  type Eintrag = { art: 'lemma' | 'satz'; id: string; schluessel: string; text: string; status: string };
  const eintrag = new Map<string, Eintrag>([
    ...lemmata.map((e): [string, Eintrag] => [e.schluessel, { ...e, art: 'lemma' }]),
    ...saetze.map((e): [string, Eintrag] => [e.schluessel, { ...e, art: 'satz' }]),
  ]);
  // Übersetzungen der Ziele „nach Ausgang“ (Hauptlösung und Alternativen)
  const uebersetzungen = new Map<string, { text: string; alternativen: string[] }>();
  const bezuege = zerlegt.flatMap(({ k }) => {
    if (!k || !istRichtung(k.kurs)) return [];
    const a = aufgaben.get(k.aufgabe);
    if (!a) return [];
    const ziel = alternativeZiel({ ...a.daten, typ: a.typ });
    return ziel.art === 'uebersetzung' ? [{ bezug: ziel.bezug, sprache: zerlegeRichtung(k.kurs).ausgang }] : [];
  });
  for (const b of bezuege) {
    const e = eintrag.get(b.bezug);
    if (!e) continue;
    const u = schema.lernappUebersetzung;
    const [x] = await db
      .select({ text: u.text, alternativen: u.alternativen })
      .from(u)
      .where(and(eq(u.sprache, b.sprache), e.art === 'satz' ? eq(u.satzId, e.id) : eq(u.lemmaId, e.id)))
      .limit(1);
    if (x) uebersetzungen.set(`${b.bezug}@${b.sprache}`, x);
  }
  return zerlegt.map(({ z, k }) => {
    const a = k ? aufgaben.get(k.aufgabe) : undefined;
    const ziel: AlternativeZiel = a ? alternativeZiel({ ...a.daten, typ: a.typ }) : { art: 'keine' };
    let loesung: MeldungZeile['loesung'] = null;
    if (a && k && ziel.art === 'aufgabe') {
      const hauptVerweis = typeof a.daten.ziel === 'string' ? a.daten.ziel : typeof a.daten.satz === 'string' ? a.daten.satz : null;
      loesung = {
        haupt: (hauptVerweis && eintrag.get(hauptVerweis)?.text) || '',
        alternativen: Array.isArray(a.daten.alternativen) ? (a.daten.alternativen as string[]) : [],
      };
    } else if (k && ziel.art === 'uebersetzung' && istRichtung(k.kurs)) {
      const u = uebersetzungen.get(`${ziel.bezug}@${zerlegeRichtung(k.kurs).ausgang}`);
      if (u) loesung = { haupt: u.text, alternativen: u.alternativen };
    }
    return {
      id: z.id,
      kurs: k?.kurs ?? '',
      aufgabe: k?.aufgabe ?? z.aufgabeSchluessel,
      kategorie: z.kategorie,
      antwort: z.antwort,
      status: z.status,
      am: z.am,
      erledigtAm: z.erledigtAm,
      aufgabeDaten: a ? { typ: a.typ, status: a.status, religionsbezug: a.religionsbezug } : null,
      ziel,
      loesung,
      verweise: (k ? (verweiseJe.get(k.aufgabe) ?? []) : []).flatMap((s) => {
        const e = eintrag.get(s);
        return e ? [{ schluessel: s, text: e.text, status: e.status }] : [];
      }),
    };
  });
}

/** Offene Meldungen zählen (Übersicht, Cockpit). */
export async function zaehleOffeneLernappMeldungen(): Promise<number> {
  const [z] = await db.select({ n: count() }).from(schema.lernappMeldung).where(eq(schema.lernappMeldung.status, 'offen'));
  return z?.n ?? 0;
}

export type GesperrterEintrag = {
  schluessel: string;
  art: Entsperrbar;
  /** Stand vor der Sperre (aus dem Audit; ältere Einträge ohne Angabe: null) */
  vorher: Status | null;
  am: Date;
};

const STATUS_WERTE: readonly string[] = STATUS;

/**
 * Einträge, die die Verwaltung über eine Meldung gesperrt hat und die noch gesperrt sind (L3-06b, „Entsperren“): aus dem Audit
 * `lernapp.meldung_bearbeitet` mit `aktion: gesperrt` (jüngste Sperre je Schlüssel), abgeglichen mit dem aktuellen Status.
 * Einträge, die der Import gesperrt hat (in der Datei entfernt), stehen nicht darin – die kommen nur mit dem Import zurück.
 */
export async function ladeGesperrte(): Promise<GesperrterEintrag[]> {
  const a = schema.auditEintrag;
  const sperren = await db
    .select({ am: a.zeitpunkt, details: a.details })
    .from(a)
    .where(and(eq(a.aktion, 'lernapp.meldung_bearbeitet'), sql`${a.details}->>'aktion' = 'gesperrt'`))
    .orderBy(desc(a.zeitpunkt), desc(a.id));
  const juengste = new Map<string, { am: Date; vorher: Status | null }>();
  for (const s of sperren) {
    const eintrag = s.details?.eintrag;
    if (typeof eintrag !== 'string' || juengste.has(eintrag)) continue;
    const vorher = s.details?.vorher;
    juengste.set(eintrag, { am: s.am, vorher: typeof vorher === 'string' && STATUS_WERTE.includes(vorher) ? (vorher as Status) : null });
  }
  const schluessel = [...juengste.keys()];
  const gesperrt = async (art: Entsperrbar) => {
    const t = ({ aufgabe: schema.lernappAufgabe, lemma: schema.lernappLemma, satz: schema.lernappSatz } as const)[
      art
    ] as typeof schema.lernappSatz;
    const z = await inBloecken(schluessel, (block) =>
      db
        .select({ schluessel: t.schluessel })
        .from(t)
        .where(and(inArray(t.schluessel, block), eq(t.status, 'gesperrt'))),
    );
    return z.map((x) => ({ art, schluessel: x.schluessel }));
  };
  const treffer = (await Promise.all((['aufgabe', 'lemma', 'satz'] as const).map(gesperrt))).flat();
  return treffer
    .map(({ art, schluessel: s }) => ({ schluessel: s, art, ...juengste.get(s)! }))
    .sort((x, y) => y.am.getTime() - x.am.getTime() || (x.schluessel < y.schluessel ? -1 : 1));
}
