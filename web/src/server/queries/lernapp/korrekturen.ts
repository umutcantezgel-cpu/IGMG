import 'server-only';
import { and, eq, inArray, like, sql } from 'drizzle-orm';
import { db, schema } from '@/lib/db';
import type { Fehler, PruefArt, Urteil } from '@/lib/lernapp/freigabe';
import { istSprache, type Sprache } from '@/lib/lernapp/kurse';
import { inBloecken, textHashGemerkt } from './bloecke';

/**
 * Befunde der Prüfenden für die Redaktion (L3-06b, ADR 0041 Nr. 4–6, ADR 0040 Nr. 5): Korrekturvorschläge, Änderungsvorschläge,
 * Ablehnungen und Kommentare aus `lernapp_pruefung`, die **offen** sind – sie gelten dem aktuellen Inhalts-Hash des Eintrags
 * (ein neuer Stand nach dem Einarbeiten erledigt sie). Je Eintrag und prüfender Person zählt nur die jüngste Prüfung zum
 * Hash. Ohne Personendaten: Wer geprüft hat, steht weder im Ergebnis noch im Export (`pnpm lernapp:export-korrekturen`).
 *
 * Dazu die menschlichen Korrekturen in der Datenbank (`menschlichGeprueft`, z. B. ergänzte Alternativen aus Meldungen), die die
 * Inhalts-Pipeline in `web/inhalte/lernapp/**` zurückschreibt, damit ein KI-Import keinen Konflikt anlegt (ADR 0041 Nr. 6).
 */

type InhaltTyp = (typeof schema.lernappInhaltTypEnum.enumValues)[number];

export type Befund = {
  /** Kennung der Prüfung (keine Person) */
  id: string;
  inhaltTyp: InhaltTyp;
  art: PruefArt;
  urteil: Urteil;
  kategorie: Fehler | null;
  korrektur: string | null;
  kommentar: string | null;
  am: Date;
  /** Schlüssel des Eintrags (Übersetzung: `<bezug>@<sprache>`; Audio: Zieltext des Clips) */
  schluessel: string;
  kurs: string;
  einheit: string;
  inhaltHash: string;
  /** Sprache des Texts und der Korrektur (Zieltext: Kurs; Übersetzung: ihre Sprache); sonst null */
  sprache: Sprache | null;
  /** Aktueller Text des Eintrags (falls er einen hat) */
  text: string | null;
};

type Aufgeloest = { schluessel: string; inhaltHash: string; sprache: Sprache | null; text: string | null };

/** Einheit eines Schlüssels: die ersten drei Teile (`tr.a1.e01.w001` → `tr.a1.e01`). */
export const einheitVon = (schluessel: string) => schluessel.split('@')[0]!.split('.').slice(0, 3).join('.');

const sprachKurs = (schluessel: string): Sprache | null => {
  const k = schluessel.split('.')[0];
  return k && istSprache(k) ? k : null;
};

/** Bausteine mit Schlüssel und Inhalts-Hash je Tabelle (Text, wo es einen gibt). */
async function loeseAuf(typ: InhaltTyp, ids: readonly string[]): Promise<Map<string, Aufgeloest>> {
  const ergebnis = new Map<string, Aufgeloest>();
  const uuid = ids.filter((id) => /^[0-9a-f-]{36}$/.test(id));
  if (!uuid.length) return ergebnis;
  if (typ === 'lemma' || typ === 'satz' || typ === 'aussage') {
    const t = { lemma: schema.lernappLemma, satz: schema.lernappSatz, aussage: schema.lernappAussage }[typ];
    const textSpalte = typ === 'lemma' ? schema.lernappLemma.lemma : typ === 'satz' ? schema.lernappSatz.text : schema.lernappAussage.text;
    const zeilen = await inBloecken(uuid, (block) =>
      db.select({ id: t.id, schluessel: t.schluessel, inhaltHash: t.inhaltHash, text: textSpalte }).from(t).where(inArray(t.id, block)),
    );
    for (const z of zeilen)
      ergebnis.set(z.id, {
        schluessel: z.schluessel,
        inhaltHash: z.inhaltHash,
        sprache: typ === 'aussage' ? 'de' : sprachKurs(z.schluessel),
        text: z.text,
      });
    return ergebnis;
  }
  if (typ === 'uebersetzung') {
    const u = schema.lernappUebersetzung;
    const zeilen = await inBloecken(uuid, (block) =>
      db
        .select({
          id: u.id,
          inhaltHash: u.inhaltHash,
          sprache: u.sprache,
          text: u.text,
          bezug: sql<string>`coalesce(${schema.lernappLemma.schluessel}, ${schema.lernappSatz.schluessel})`,
        })
        .from(u)
        .leftJoin(schema.lernappLemma, eq(schema.lernappLemma.id, u.lemmaId))
        .leftJoin(schema.lernappSatz, eq(schema.lernappSatz.id, u.satzId))
        .where(inArray(u.id, block)),
    );
    for (const z of zeilen)
      ergebnis.set(z.id, { schluessel: `${z.bezug}@${z.sprache}`, inhaltHash: z.inhaltHash, sprache: z.sprache, text: z.text });
    return ergebnis;
  }
  if (typ === 'audio') {
    // Clip → Zieltext gleicher Sprache mit diesem Text-Hash (aus den Texten der betroffenen Kurse)
    const clips = await inBloecken(uuid, (block) =>
      db
        .select({
          id: schema.lernappAudio.id,
          sprache: schema.lernappAudio.sprache,
          textHash: schema.lernappAudio.textHash,
          sha256: schema.lernappAudio.sha256,
        })
        .from(schema.lernappAudio)
        .where(inArray(schema.lernappAudio.id, block)),
    );
    const sprachen = [...new Set(clips.map((c) => c.sprache))];
    const texte = sprachen.length
      ? [
          ...(await db
            .select({ schluessel: schema.lernappLemma.schluessel, text: schema.lernappLemma.lemma, kurs: schema.lernappLemma.kursId })
            .from(schema.lernappLemma)
            .where(inArray(schema.lernappLemma.kursId, sprachen))),
          ...(await db
            .select({ schluessel: schema.lernappSatz.schluessel, text: schema.lernappSatz.text, kurs: schema.lernappSatz.kursId })
            .from(schema.lernappSatz)
            .where(inArray(schema.lernappSatz.kursId, sprachen))),
        ]
      : [];
    const jeHash = new Map<string, { schluessel: string; text: string }>();
    for (const t of texte) {
      const k = `${t.kurs}|${textHashGemerkt(t.text)}`;
      if (!jeHash.has(k)) jeHash.set(k, t);
    }
    for (const c of clips) {
      const t = jeHash.get(`${c.sprache}|${c.textHash}`);
      if (t) ergebnis.set(c.id, { schluessel: t.schluessel, inhaltHash: c.sha256, sprache: c.sprache, text: t.text });
    }
    return ergebnis;
  }
  const tabelle = {
    einheit: schema.lernappEinheit,
    lektion: schema.lernappLektion,
    aufgabe: schema.lernappAufgabe,
    tipp: schema.lernappTipp,
    text: schema.lernappText,
  } as const;
  if (!(typ in tabelle)) return ergebnis;
  const t = tabelle[typ as keyof typeof tabelle] as typeof schema.lernappAufgabe;
  const zeilen = await inBloecken(uuid, (block) =>
    db.select({ id: t.id, schluessel: t.schluessel, inhaltHash: t.inhaltHash }).from(t).where(inArray(t.id, block)),
  );
  for (const z of zeilen) ergebnis.set(z.id, { schluessel: z.schluessel, inhaltHash: z.inhaltHash, sprache: null, text: null });
  return ergebnis;
}

/**
 * Offene Befunde (jüngste Prüfung je Eintrag, Hash und Person mit Urteil ≠ ok, Korrektur oder Kommentar), nur zum aktuellen
 * Hash; optional nur ein Kurs (`de`, `tr`, `ar`, `islam`, `koran`). Sortiert nach Kurs, Einheit, Schlüssel, Zeit.
 */
export async function ladeBefunde(o: { kurs?: string } = {}): Promise<Befund[]> {
  const p = schema.lernappPruefung;
  const zeilen = await db
    .select({
      id: p.id,
      inhaltTyp: p.inhaltTyp,
      inhaltId: p.inhaltId,
      inhaltHash: p.inhaltHash,
      art: p.art,
      person: p.pruefendeId,
      urteil: p.urteil,
      kategorie: p.kategorie,
      korrektur: p.korrektur,
      kommentar: p.kommentar,
      am: p.am,
    })
    .from(p)
    // alle Prüfungen der Einträge und Stände mit mindestens einem Befund (auch spätere „ok“ derselben Person, die ihn aufheben)
    .where(
      sql`(${p.inhaltTyp}, ${p.inhaltId}, ${p.inhaltHash}) in (select q.inhalt_typ, q.inhalt_id, q.inhalt_hash from lernapp_pruefung q
        where q.urteil <> 'ok' or nullif(btrim(q.korrektur), '') is not null or nullif(btrim(q.kommentar), '') is not null)`,
    );
  // jüngste je Eintrag, Hash und Person (die Person dient nur dieser Zuordnung und verlässt die Funktion nicht)
  const juengste = new Map<string, (typeof zeilen)[number]>();
  for (const z of zeilen) {
    const k = `${z.inhaltTyp}|${z.inhaltId}|${z.inhaltHash}|${z.person ?? z.id}`;
    const bisher = juengste.get(k);
    if (!bisher || z.am.getTime() >= bisher.am.getTime()) juengste.set(k, z);
  }
  const offen = [...juengste.values()].filter((z) => z.urteil !== 'ok' || Boolean(z.korrektur?.trim()) || Boolean(z.kommentar?.trim()));
  const jeTyp = new Map<InhaltTyp, string[]>();
  for (const z of offen) jeTyp.set(z.inhaltTyp, [...(jeTyp.get(z.inhaltTyp) ?? []), z.inhaltId]);
  const aufgeloest = new Map<string, Aufgeloest>();
  for (const [typ, ids] of jeTyp) for (const [id, a] of await loeseAuf(typ, ids)) aufgeloest.set(`${typ}|${id}`, a);
  const befunde: Befund[] = offen.flatMap((z) => {
    const a = aufgeloest.get(`${z.inhaltTyp}|${z.inhaltId}`);
    // Eintrag entfernt oder neuer Stand (neuer Hash): erledigt
    if (!a || a.inhaltHash !== z.inhaltHash) return [];
    const kurs = a.schluessel.split('.')[0]!;
    if (o.kurs && kurs !== o.kurs) return [];
    return [
      {
        id: z.id,
        inhaltTyp: z.inhaltTyp,
        art: z.art,
        urteil: z.urteil,
        kategorie: z.kategorie,
        korrektur: z.korrektur?.trim() || null,
        kommentar: z.kommentar?.trim() || null,
        am: z.am,
        schluessel: a.schluessel,
        kurs,
        einheit: einheitVon(a.schluessel),
        inhaltHash: z.inhaltHash,
        sprache: a.sprache,
        text: a.text,
      },
    ];
  });
  const vgl = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
  return befunde.sort(
    (x, y) => vgl(x.kurs, y.kurs) || vgl(x.einheit, y.einheit) || vgl(x.schluessel, y.schluessel) || x.am.getTime() - y.am.getTime(),
  );
}

export type Korrigiert =
  | { inhaltTyp: 'aufgabe'; schluessel: string; inhaltHash: string; alternativen: string[] }
  | {
      inhaltTyp: 'uebersetzung';
      schluessel: string;
      bezug: string;
      sprache: Sprache;
      inhaltHash: string;
      text: string;
      alternativen: string[];
    };

/** Menschliche Korrekturen in der Datenbank (Aufgaben und Übersetzungen mit `menschlichGeprueft`), ohne Verfasser. */
export async function ladeKorrigiert(o: { kurs?: string } = {}): Promise<Korrigiert[]> {
  const a = schema.lernappAufgabe;
  const u = schema.lernappUebersetzung;
  const [aufgaben, uebersetzungen] = await Promise.all([
    db
      .select({ schluessel: a.schluessel, inhaltHash: a.inhaltHash, daten: a.daten })
      .from(a)
      .where(and(eq(a.menschlichGeprueft, true), o.kurs ? like(a.schluessel, `${o.kurs}.%`) : undefined)),
    db
      .select({
        inhaltHash: u.inhaltHash,
        sprache: u.sprache,
        text: u.text,
        alternativen: u.alternativen,
        bezug: sql<string>`coalesce(${schema.lernappLemma.schluessel}, ${schema.lernappSatz.schluessel})`,
      })
      .from(u)
      .leftJoin(schema.lernappLemma, eq(schema.lernappLemma.id, u.lemmaId))
      .leftJoin(schema.lernappSatz, eq(schema.lernappSatz.id, u.satzId))
      .where(eq(u.menschlichGeprueft, true)),
  ]);
  return [
    ...aufgaben.map((x) => ({
      inhaltTyp: 'aufgabe' as const,
      schluessel: x.schluessel,
      inhaltHash: x.inhaltHash,
      alternativen: Array.isArray(x.daten.alternativen) ? (x.daten.alternativen as string[]) : [],
    })),
    ...uebersetzungen
      .filter((x) => !o.kurs || x.bezug.startsWith(`${o.kurs}.`))
      .map((x) => ({
        inhaltTyp: 'uebersetzung' as const,
        schluessel: `${x.bezug}@${x.sprache}`,
        bezug: x.bezug,
        sprache: x.sprache,
        inhaltHash: x.inhaltHash,
        text: x.text,
        alternativen: x.alternativen,
      })),
  ].sort((x, y) => (x.schluessel < y.schluessel ? -1 : x.schluessel > y.schluessel ? 1 : 0));
}

/** Format des Exports für die Inhalts-Pipeline (Version im Feld `format`). */
export const EXPORT_FORMAT = 'igmg-lernapp-korrekturen/1';

export type KorrekturExport = {
  format: typeof EXPORT_FORMAT;
  erstellt: string;
  kurse: {
    kurs: string;
    einheiten: {
      einheit: string;
      befunde: (Omit<Befund, 'id' | 'am' | 'kurs' | 'einheit'> & { am: string })[];
      korrigiert: Korrigiert[];
    }[];
  }[];
};

/**
 * Export offener Korrekturen je Kurs und Einheit (rein): Befunde (ohne Prüfungs-Kennung und ohne Person) und menschliche
 * Korrekturen. Leere Einheiten fallen weg.
 */
export function baueKorrekturExport(befunde: readonly Befund[], korrigiert: readonly Korrigiert[], erstellt: Date): KorrekturExport {
  const kurse = new Map<string, Map<string, KorrekturExport['kurse'][number]['einheiten'][number]>>();
  const einheit = (kurs: string, e: string) => {
    const k = kurse.get(kurs) ?? new Map();
    kurse.set(kurs, k);
    const x = k.get(e) ?? { einheit: e, befunde: [], korrigiert: [] };
    k.set(e, x);
    return x;
  };
  for (const b of befunde) {
    const { id: _id, am, kurs, einheit: e, ...rest } = b;
    einheit(kurs, e).befunde.push({ ...rest, am: am.toISOString() });
  }
  for (const k of korrigiert) einheit(k.schluessel.split('.')[0]!, einheitVon(k.schluessel)).korrigiert.push(k);
  const vgl = (x: string, y: string) => (x < y ? -1 : x > y ? 1 : 0);
  return {
    format: EXPORT_FORMAT,
    erstellt: erstellt.toISOString(),
    kurse: [...kurse.entries()]
      .sort(([x], [y]) => vgl(x, y))
      .map(([kurs, e]) => ({ kurs, einheiten: [...e.values()].sort((x, y) => vgl(x.einheit, y.einheit)) })),
  };
}
