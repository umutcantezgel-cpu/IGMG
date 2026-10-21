import 'server-only';
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, isNull, lt, lte, max, ne, or, sql } from 'drizzle-orm';
import { db, schema, type Transaktion } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { einwilligungsLage, type EinwilligungsLage } from '@/lib/konto/sechzehn';
import { proxyVertraut } from '@/lib/sicherheit/ip';
import { ladeEinheitJson } from '@/server/queries/lernapp/pakete';
import { heuteStand, leiteAb } from '../ereignisse/ableiten';
import { summenJeKurs } from '../ereignisse/kurs';
import { addiereTage, klemmeEreignis, lerntagVon } from '../ereignisse/serie';
import { type Ereignis, EreignisSchema, GeraetSchema, istArt } from '../ereignisse/typen';
import { ereignisSchluessel, vereinige } from '../ereignisse/zusammenfuehren';
import { istRichtung, pruefeLernappBezug, zerlegeRichtung } from '../kurse';
import { lektionAusPaket, lektionImPaket } from '../paket/bauen';
import { type KartenBasis, type KartenBewertung, type Kartenstand, type Note, spieleKarteNach } from '../srs';
import { type EinwilligungsStand, GRENZEN, HOECHSTENS_FREMDE, type SyncAnfrage, type SyncAntwort } from './protokoll';

/**
 * Abgleich auf dem Server (ADR 0038 Nr. 5–7 und 10, KERN 4.0 §5/§6). Die Route `/api/lernapp/sync` prüft vorher Schalter,
 * Ursprung, Sitzung, Einwilligung und Bremse; hier geschieht das Schreiben und Lesen eines Kontos:
 *
 * 1. Ereignisse einzeln mit Zod prüfen, Uhrzeit klemmen (Empfang + 5 min, Lerntag), innerhalb der Anfrage vereinigen.
 * 2. In einer Transaktion unter einer Sperre je Konto (mit `statement_timeout`): Grenzen je Konto prüfen (`GRENZEN`, sonst
 *    `grenze` ohne zu schreiben), Lernprofil anlegen bzw. `zuletztAktivAm` setzen, Ereignisse mit
 *    `ON CONFLICT DO NOTHING` schreiben, Kartenstand der betroffenen Karten mit **derselben** reinen Funktion wie auf dem Gerät
 *    nachspielen (`srs.ts`, ab der verdichteten Basis), die berührten Lerntage (`lernapp_tag`) aus den Ereignissen genau
 *    dieser Tage neu ableiten (nie das ganze Protokoll, S-L1 M-2), fremde Ereignisse nach dem
 *    Zeiger lesen. Die Sperre hält alle Schreiber eines Kontos hintereinander – so überspringt der Zeiger nie ein Ereignis,
 *    das eine parallele Transaktion noch nicht festgeschrieben hat.
 * 3. Danach (außerhalb der Transaktion): erledigte Zuweisungen der Lehrkraft vermerken (`aufgabe_erledigt`), nur aus den
 *    Lektions-Ereignissen der offenen Zuweisungen.
 */

const sperre = (benutzerId: string) => sql`select pg_advisory_xact_lock(hashtext(${`igmg:lernapp-sync:${benutzerId}`}))`;
/** Obergrenze je Anweisung in der Abgleich-Transaktion (S-L1 M-2); die Funktion endet so vor ihrer eigenen Zeitgrenze. */
const ZEITGRENZE = sql.raw(`set local statement_timeout = '15s'`);

/** Nur vom eigenen Ursprung: `Sec-Fetch-Site: same-origin`; ohne Fetch-Metadaten muss `Origin` (falls gesendet) zum Host passen. */
export function gleicherUrsprung(h: Headers): boolean {
  const seite = h.get('sec-fetch-site');
  if (seite) return seite === 'same-origin';
  const ursprung = h.get('origin');
  if (!ursprung) return true;
  const host = (proxyVertraut() ? h.get('x-forwarded-host') : null) ?? h.get('host');
  try {
    return Boolean(host) && new URL(ursprung).host === host;
  } catch {
    return false;
  }
}

// ——— Einwilligung `lernapp` (Art. 9 DSGVO; Kinder unter 16 über die Eltern, KERN 4.0 §5) ———

/**
 * Lage der Einwilligung `lernapp` eines Kontos.
 * - Erwachsene: eigene, nicht widerrufene Einwilligung.
 * - Kinderkonten und Konten mit Lerndatensatz unter 16 (bzw. ohne bekanntes Datum bei Kinderkonten): nur die Einwilligung
 *   sorgeberechtigter Eltern dieses Kindes zählt; im Übergang nach dem 16. Geburtstag (30 Tage) auch die eigene; danach nur
 *   die eigene (DSFA D-11, `konto/sechzehn.ts`). Ein Kinderkonto ohne Lerndatensatz kann niemand freigeben.
 */
export async function lernappEinwilligung(
  benutzerId: string,
  { istKind }: { istKind: boolean },
  jetzt = new Date(),
): Promise<EinwilligungsStand> {
  const [eigene] = await db
    .select({ id: schema.lernende.id, sechzehnAm: schema.lernende.sechzehnAm })
    .from(schema.lernende)
    .where(eq(schema.lernende.benutzerId, benutzerId))
    .limit(1);
  const heute = berlinerDatum(jetzt);
  let lage: EinwilligungsLage = 'eigene';
  if (istKind) lage = eigene ? einwilligungsLage(eigene.sechzehnAm, heute) : 'eltern';
  else if (eigene?.sechzehnAm) lage = einwilligungsLage(eigene.sechzehnAm, heute);

  const zeilen = await db
    .select({ erteiltVon: schema.kontoEinwilligung.erteiltVon, lernendeId: schema.kontoEinwilligung.lernendeId })
    .from(schema.kontoEinwilligung)
    .where(
      and(
        eq(schema.kontoEinwilligung.art, 'lernapp'),
        isNull(schema.kontoEinwilligung.widerrufenAm),
        eigene
          ? or(eq(schema.kontoEinwilligung.benutzerId, benutzerId), eq(schema.kontoEinwilligung.lernendeId, eigene.id))
          : eq(schema.kontoEinwilligung.benutzerId, benutzerId),
      ),
    );
  const selbst = zeilen.some((z) => z.erteiltVon === benutzerId);
  if (lage === 'eigene') return selbst ? 'erteilt' : 'fehlt';

  const eltern = eigene
    ? new Set(
        (
          await db
            .select({ id: schema.elternKind.elternId })
            .from(schema.elternKind)
            .where(and(eq(schema.elternKind.lernendeId, eigene.id), eq(schema.elternKind.sorgeberechtigt, true)))
        ).map((e) => e.id),
      )
    : new Set<string>();
  const vonEltern = zeilen.some((z) => z.lernendeId === eigene?.id && z.erteiltVon !== null && eltern.has(z.erteiltVon));
  if (vonEltern || (lage === 'uebergang' && selbst)) return 'erteilt';
  return lage === 'uebergang' ? 'fehlt' : 'eltern';
}

// ——— Prüfen und Klemmen ———

export type GeprueftesPaket = {
  ereignisse: Ereignis[];
  abgelehnt: { geraet: string; seq: number }[];
  /** Schlüssel der Ereignisse, die die Uhrzeit-Klemme verändert hat */
  geklemmt: Set<string>;
};

/** Jedes Ereignis mit Zod prüfen und klemmen; ungültige (soweit erkennbar mit Schlüssel) in `abgelehnt`. */
export function pruefeEreignisse(roh: readonly unknown[], empfang: Date): GeprueftesPaket {
  const ereignisse: Ereignis[] = [];
  const abgelehnt: { geraet: string; seq: number }[] = [];
  const geklemmt = new Set<string>();
  for (const r of roh) {
    const p = EreignisSchema.safeParse(r);
    if (!p.success) {
      const k = r && typeof r === 'object' ? (r as { geraet?: unknown; seq?: unknown }) : {};
      if (GeraetSchema.safeParse(k.geraet).success && Number.isInteger(k.seq) && (k.seq as number) >= 0)
        abgelehnt.push({ geraet: k.geraet as string, seq: k.seq as number });
      continue;
    }
    const e = klemmeEreignis(p.data, empfang);
    if (e !== p.data) geklemmt.add(ereignisSchluessel(e));
    ereignisse.push(e);
  }
  return { ereignisse: vereinige(ereignisse), abgelehnt, geklemmt };
}

// ——— Zeilen ↔ Ereignisse ———

type EreignisZeile = {
  id: number;
  geraet: string;
  seq: number;
  am: Date;
  tag: string;
  art: Ereignis['art'];
  daten: Record<string, unknown>;
};

const ereignisSpalten = {
  id: schema.lernappEreignis.id,
  geraet: schema.lernappEreignis.geraet,
  seq: schema.lernappEreignis.seq,
  am: schema.lernappEreignis.am,
  tag: schema.lernappEreignis.tag,
  art: schema.lernappEreignis.art,
  daten: schema.lernappEreignis.daten,
};

/** Gespeicherte Zeile als Ereignis (`am` als ISO-Zeit in UTC). */
export const alsEreignis = (z: Omit<EreignisZeile, 'id'>): Ereignis =>
  ({ geraet: z.geraet, seq: z.seq, am: z.am.toISOString(), tag: z.tag, art: z.art, daten: z.daten }) as Ereignis;

const alsBewertung = (z: Pick<EreignisZeile, 'geraet' | 'seq' | 'am' | 'daten'>): KartenBewertung => ({
  karte: String(z.daten.karte),
  note: z.daten.note as Note,
  am: z.am.toISOString(),
  geraet: z.geraet,
  seq: z.seq,
});

const basisAus = (basis: unknown, bis: Date | null): KartenBasis | null =>
  basis && bis ? { stand: basis as Kartenstand, bis: bis.toISOString() } : null;

const kartenAusdruck = sql<string>`${schema.lernappEreignis.daten}->>'karte'`;

// ——— Kartenstand (dieselbe reine Ableitung wie auf dem Gerät) ———

/** Kartenstand der genannten Karten aus allen Bewertungen des Kontos nachspielen, ab der verdichteten Basis. */
export async function erneuereKarten(tx: Transaktion, benutzerId: string, karten: readonly string[]): Promise<void> {
  if (!karten.length) return;
  // nacheinander: eine Transaktion hat genau eine Verbindung
  const zeilen = await tx
    .select(ereignisSpalten)
    .from(schema.lernappEreignis)
    .where(
      and(
        eq(schema.lernappEreignis.benutzerId, benutzerId),
        eq(schema.lernappEreignis.art, 'bewertung'),
        inArray(kartenAusdruck, [...karten]),
      ),
    );
  const basen = await tx
    .select({ karte: schema.lernappKarte.karte, basis: schema.lernappKarte.basis, basisBis: schema.lernappKarte.basisBis })
    .from(schema.lernappKarte)
    .where(and(eq(schema.lernappKarte.benutzerId, benutzerId), inArray(schema.lernappKarte.karte, [...karten])));
  const basisJe = new Map(basen.map((b) => [b.karte, basisAus(b.basis, b.basisBis)]));
  const jeKarte = new Map<string, { bewertungen: KartenBewertung[]; bis: number }>();
  for (const z of zeilen) {
    const k = String(z.daten.karte);
    const eintrag = jeKarte.get(k) ?? { bewertungen: [], bis: 0 };
    eintrag.bewertungen.push(alsBewertung(z));
    eintrag.bis = Math.max(eintrag.bis, z.id);
    jeKarte.set(k, eintrag);
  }
  const werte = [...karten].flatMap((karte) => {
    const e = jeKarte.get(karte);
    const stand = spieleKarteNach(karte, e?.bewertungen ?? [], basisJe.get(karte));
    return stand
      ? [
          {
            benutzerId,
            karte,
            zustand: stand as unknown as Record<string, unknown>,
            faellig: new Date(stand.faellig),
            bisEreignis: e?.bis ?? null,
          },
        ]
      : [];
  });
  if (!werte.length) return;
  await tx
    .insert(schema.lernappKarte)
    .values(werte)
    .onConflictDoUpdate({
      target: [schema.lernappKarte.benutzerId, schema.lernappKarte.karte],
      set: {
        zustand: sql.raw('excluded.zustand'),
        faellig: sql.raw('excluded.faellig'),
        bisEreignis: sql.raw('excluded.bis_ereignis'),
        aktualisiertAm: sql`now()`,
      },
    });
}

// ——— Lerntage (für die Gruppenwoche, ADR 0043) ———

/**
 * Lerntage, die neue Ereignisse berühren, neu ableiten (S-L1 M-2: nie das ganze Protokoll) – als Tagessumme
 * (`lernapp_tag`: Lernwoche der Eltern, Tagesziel) und je Kurs (`lernapp_tag_kurs`, S-L3 M-1). Gelesen werden nur:
 * - Lektionen und XP der berührten Tage,
 * - das zuletzt gesetzte Tagesziel vor dem ersten berührten Tag und alle Tagesziele im Bereich (`leiteAb` nimmt je Tag das
 *   letzte Ziel nach Zeit mit `tag` ≤ Tag; ein früheres, das vor dem Bereich liegt, kann nie gewinnen),
 * - die Pausen der berührten Kalenderjahre (`ruhetageAus` zählt höchstens 30 Ruhetage je Jahr).
 * Ein neues Tagesziel wirkt ab seinem Tag: Dann gehören alle schon bekannten Lerntage ab dort dazu.
 */
export async function erneuereTage(tx: Transaktion, benutzerId: string, neue: readonly Ereignis[], jetzt: Date): Promise<void> {
  const betroffen = new Set<string>();
  for (const e of neue) {
    if (e.art === 'bewertung' || e.art === 'lektion' || e.art === 'xp') betroffen.add(e.tag);
    if (e.art === 'pause') for (let t = e.daten.von; t <= e.daten.bis; t = addiereTage(t, 1)) betroffen.add(t);
  }
  const ziele = neue
    .filter(istArt('tagesziel'))
    .map((e) => e.tag)
    .sort();
  if (ziele.length)
    for (const t of await tx
      .select({ tag: schema.lernappTag.tag })
      .from(schema.lernappTag)
      .where(and(eq(schema.lernappTag.benutzerId, benutzerId), gte(schema.lernappTag.tag, ziele[0]!))))
      betroffen.add(t.tag);
  if (!betroffen.size) return;

  const E = schema.lernappEreignis;
  const tage = [...betroffen].sort();
  const erster = tage[0]!;
  const letzter = tage.at(-1)!;
  const konto = eq(E.benutzerId, benutzerId);
  const lernen = await tx
    .select(ereignisSpalten)
    .from(E)
    .where(and(konto, inArray(E.art, ['lektion', 'xp']), inArray(E.tag, tage)));
  const zielVorher = await tx
    .select(ereignisSpalten)
    .from(E)
    .where(and(konto, eq(E.art, 'tagesziel'), lt(E.tag, erster)))
    .orderBy(desc(E.am), desc(E.geraet), desc(E.seq))
    .limit(1);
  const zieleImBereich = await tx
    .select(ereignisSpalten)
    .from(E)
    .where(and(konto, eq(E.art, 'tagesziel'), gte(E.tag, erster), lte(E.tag, letzter)));
  const pausen = await tx
    .select(ereignisSpalten)
    .from(E)
    .where(
      and(
        konto,
        eq(E.art, 'pause'),
        sql`${E.daten}->>'bis' >= ${`${erster.slice(0, 4)}-01-01`}`,
        sql`${E.daten}->>'von' <= ${`${letzter.slice(0, 4)}-12-31`}`,
      ),
    );
  const liste = [...lernen, ...zielVorher, ...zieleImBereich, ...pausen].flatMap((z) => {
    const p = EreignisSchema.safeParse(alsEreignis(z));
    return p.success ? [p.data] : [];
  });
  const a = leiteAb(liste, lerntagVon(jetzt, 'UTC'));
  const werte = tage.map((tag) => {
    const s = heuteStand(a, tag);
    return {
      benutzerId,
      tag,
      xp: s.xp,
      lektionen: Math.min(s.lektionen, 32_767),
      pause: a.ruhetage.has(tag),
      zielErreicht: s.erreicht === true,
    };
  });
  await tx
    .insert(schema.lernappTag)
    .values(werte)
    .onConflictDoUpdate({
      target: [schema.lernappTag.benutzerId, schema.lernappTag.tag],
      set: {
        xp: sql.raw('excluded.xp'),
        lektionen: sql.raw('excluded.lektionen'),
        pause: sql.raw('excluded.pause'),
        zielErreicht: sql.raw('excluded.ziel_erreicht'),
      },
    });
  // Tagessummen je Kurs (S-L3 M-1): die berührten Tage ganz neu, damit Gruppe und Lehrkraft nur erlaubte Kurse lesen
  const T = schema.lernappTagKurs;
  await tx.delete(T).where(and(eq(T.benutzerId, benutzerId), inArray(T.tag, tage)));
  const jeKurs = summenJeKurs(liste, betroffen);
  if (jeKurs.length) await tx.insert(T).values(jeKurs.map((s) => ({ benutzerId, ...s })));
}

// ——— Grenzen je Konto (S-L1 M-2) ———

export type GrenzeArt = 'gesamt' | 'jeTag' | 'geraete';
export type Grenzen = { gesamt: number; jeTag: number; geraete: number; seqAbstand: number };

/**
 * Prüft die Grenzen je Konto für die geprüften Ereignisse einer Anfrage (unter der Sperre des Kontos). Ergebnis: die
 * überschrittene Grenze (dann wird nichts geschrieben) bzw. `null` und die Ereignisse, deren Folgenummer zu weit über der
 * höchsten gespeicherten ihres Geräts liegt (`abgelehnt`).
 */
export async function pruefeGrenzen(
  tx: Transaktion,
  benutzerId: string,
  ereignisse: readonly Ereignis[],
  jetzt: Date,
  grenzen: Grenzen = GRENZEN,
): Promise<{ grenze: GrenzeArt | null; zuWeit: Ereignis[] }> {
  if (!ereignisse.length) return { grenze: null, zuWeit: [] };
  const E = schema.lernappEreignis;
  const [z] = await tx
    .select({
      gesamt: sql<number>`count(*)::int`,
      jeTag: sql<number>`(count(*) filter (where ${E.empfangenAm} > ${new Date(jetzt.getTime() - 86_400_000).toISOString()}::timestamptz))::int`,
      geraete: sql<number>`count(distinct ${E.geraet})::int`,
    })
    .from(E)
    .where(eq(E.benutzerId, benutzerId));
  const geraete = [...new Set(ereignisse.map((e) => e.geraet))];
  const hoechste = new Map(
    (
      await tx
        .select({ geraet: E.geraet, seq: max(E.seq) })
        .from(E)
        .where(and(eq(E.benutzerId, benutzerId), inArray(E.geraet, geraete)))
        .groupBy(E.geraet)
    ).map((h) => [h.geraet, h.seq ?? -1]),
  );
  const n = ereignisse.length;
  const neueGeraete = geraete.filter((g) => !hoechste.has(g)).length;
  let grenze: GrenzeArt | null = null;
  if (Number(z?.gesamt ?? 0) + n > grenzen.gesamt) grenze = 'gesamt';
  else if (Number(z?.jeTag ?? 0) + n > grenzen.jeTag) grenze = 'jeTag';
  else if (Number(z?.geraete ?? 0) + neueGeraete > grenzen.geraete) grenze = 'geraete';
  const zuWeit = ereignisse.filter((e) => e.seq > (hoechste.get(e.geraet) ?? -1) + grenzen.seqAbstand);
  return { grenze, zuWeit };
}

// ——— Abgleich ———

export type AbgleichErgebnis = { antwort: SyncAntwort; neue: Ereignis[]; grenze?: undefined } | { grenze: GrenzeArt };

/**
 * Ein Abgleich eines Kontos (nach allen Prüfungen der Route). Idempotent: Dieselbe Anfrage noch einmal schreibt nichts
 * und liefert dieselben fremden Ereignisse.
 */
export async function gleicheKontoAb(
  benutzerId: string,
  anfrage: SyncAnfrage,
  jetzt = new Date(),
  grenzen: Grenzen = GRENZEN,
): Promise<AbgleichErgebnis> {
  const geprueft = pruefeEreignisse(anfrage.ereignisse, jetzt);
  const vonCursor = anfrage.cursor === null ? 0 : Number(anfrage.cursor);

  return db.transaction(async (tx): Promise<AbgleichErgebnis> => {
    await tx.execute(sperre(benutzerId));
    await tx.execute(ZEITGRENZE);
    const { grenze, zuWeit } = await pruefeGrenzen(tx, benutzerId, geprueft.ereignisse, jetzt, grenzen);
    if (grenze) return { grenze };
    if (zuWeit.length) {
      const weg = new Set(zuWeit.map(ereignisSchluessel));
      geprueft.ereignisse = geprueft.ereignisse.filter((e) => !weg.has(ereignisSchluessel(e)));
      geprueft.abgelehnt.push(...zuWeit.map((e) => ({ geraet: e.geraet, seq: e.seq })));
    }
    const [profil] = await tx
      .insert(schema.lernappProfil)
      .values({ benutzerId, zuletztAktivAm: jetzt })
      .onConflictDoUpdate({ target: schema.lernappProfil.benutzerId, set: { zuletztAktivAm: jetzt } })
      .returning({ angelegtAm: schema.lernappProfil.angelegtAm });

    const eingefuegt = geprueft.ereignisse.length
      ? await tx
          .insert(schema.lernappEreignis)
          .values(
            geprueft.ereignisse.map((e) => ({
              benutzerId,
              geraet: e.geraet,
              seq: e.seq,
              am: new Date(e.am),
              tag: e.tag,
              art: e.art,
              daten: e.daten as Record<string, unknown>,
              empfangenAm: jetzt,
            })),
          )
          .onConflictDoNothing({
            target: [schema.lernappEreignis.benutzerId, schema.lernappEreignis.geraet, schema.lernappEreignis.seq],
          })
          .returning({ geraet: schema.lernappEreignis.geraet, seq: schema.lernappEreignis.seq })
      : [];
    const neuSchluessel = new Set(eingefuegt.map(ereignisSchluessel));
    const neue = geprueft.ereignisse.filter((e) => neuSchluessel.has(ereignisSchluessel(e)));

    if (neue.length) {
      await erneuereKarten(tx, benutzerId, [...new Set(neue.filter(istArt('bewertung')).map((e) => e.daten.karte))]);
      await erneuereTage(tx, benutzerId, neue, jetzt);
    }

    // Fremde Ereignisse nach dem Zeiger (ohne die des anfragenden Geräts), höchstens 2.000 je Seite
    const seite = await tx
      .select(ereignisSpalten)
      .from(schema.lernappEreignis)
      .where(
        and(
          eq(schema.lernappEreignis.benutzerId, benutzerId),
          gt(schema.lernappEreignis.id, vonCursor),
          ne(schema.lernappEreignis.geraet, anfrage.geraet),
        ),
      )
      .orderBy(asc(schema.lernappEreignis.id))
      .limit(HOECHSTENS_FREMDE + 1);
    const mehr = seite.length > HOECHSTENS_FREMDE;
    const fremde = seite.slice(0, HOECHSTENS_FREMDE);
    let cursor = vonCursor;
    if (mehr) cursor = fremde.at(-1)!.id;
    else {
      const [m] = await tx
        .select({ id: max(schema.lernappEreignis.id) })
        .from(schema.lernappEreignis)
        .where(eq(schema.lernappEreignis.benutzerId, benutzerId));
      cursor = Math.max(vonCursor, Number(m?.id ?? 0));
    }

    // Verdichtete Kartenstände (ADR 0038 Nr. 10): nur, wenn der Client einen anderen Stand kennt
    const [b] = await tx
      .select({ stand: max(schema.lernappKarte.basisBis) })
      .from(schema.lernappKarte)
      .where(eq(schema.lernappKarte.benutzerId, benutzerId));
    const basisStand = b?.stand ? new Date(b.stand).toISOString() : null;
    let basen: SyncAntwort['basen'];
    if (basisStand && anfrage.basis !== basisStand) {
      basen = {};
      for (const z of await tx
        .select({ karte: schema.lernappKarte.karte, basis: schema.lernappKarte.basis, basisBis: schema.lernappKarte.basisBis })
        .from(schema.lernappKarte)
        .where(and(eq(schema.lernappKarte.benutzerId, benutzerId), isNotNull(schema.lernappKarte.basis)))) {
        const basis = basisAus(z.basis, z.basisBis);
        if (basis) basen[z.karte] = basis;
      }
    }

    const antwort: SyncAntwort = {
      cursor: String(cursor),
      mehr,
      ereignisse: fremde.map(alsEreignis),
      angenommen: neue.length,
      doppelt: geprueft.ereignisse.length - neue.length,
      abgelehnt: geprueft.abgelehnt,
      geklemmt: neue.filter((e) => geprueft.geklemmt.has(ereignisSchluessel(e))),
      angelegt: (profil?.angelegtAm ?? jetzt).toISOString(),
      basisStand,
      ...(basen ? { basen } : {}),
    };
    return { antwort, neue };
  });
}

// ——— Zuweisungen der Lehrkraft (ADR 0038 Nr. 5, L3-E05) ———

/**
 * Erledigte Zuweisungen vermerken: Aufgaben der Gruppen, in denen das Konto über seinen Lerndatensatz Mitglied ist, mit
 * `bezug = { art: 'lernapp', kurs, einheit?, lektion? }`.
 * - mit Lektion: erledigt, sobald diese Lektion abgeschlossen ist (Ereignis `lektion` derselben Richtung);
 * - nur mit Einheit: erledigt, wenn alle Lektionen des aktuellen Einheitenpakets abgeschlossen sind;
 * - nur mit Kurs: nicht automatisch (die Lehrkraft sieht den Stand in der Gruppenwoche, L7).
 * Idempotent über den Primärschlüssel von `aufgabe_erledigt`.
 */
export async function vermerkeZuweisungen(benutzerId: string, jetzt = new Date()): Promise<number> {
  const heute = berlinerDatum(jetzt);
  const offen = await db
    .select({ aufgabeId: schema.aufgabe.id, lernendeId: schema.lernende.id, bezug: schema.aufgabe.bezug })
    .from(schema.aufgabe)
    .innerJoin(schema.gruppenMitglied, eq(schema.gruppenMitglied.gruppeId, schema.aufgabe.gruppeId))
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.gruppenMitglied.lernendeId))
    .leftJoin(
      schema.aufgabeErledigt,
      and(eq(schema.aufgabeErledigt.aufgabeId, schema.aufgabe.id), eq(schema.aufgabeErledigt.lernendeId, schema.lernende.id)),
    )
    .where(
      and(
        eq(schema.lernende.benutzerId, benutzerId),
        eq(schema.lernende.status, 'aktiv'),
        or(isNull(schema.gruppenMitglied.bis), gte(schema.gruppenMitglied.bis, heute)),
        sql`${schema.aufgabe.bezug}->>'art' = 'lernapp'`,
        isNull(schema.aufgabeErledigt.aufgabeId),
      ),
    );
  if (!offen.length) return 0;

  // Je offene Zuweisung die nötigen Lektionen (Schlüssel der Datenbank); gelesen werden nur deren Ereignisse (S-L1 M-2)
  const noetig: { aufgabeId: string; lernendeId: string; kurs: string; lektionen: string[] }[] = [];
  const paketFormen = new Set<string>();
  for (const o of offen) {
    const b = pruefeLernappBezug(o.bezug);
    if (!b?.einheit || !istRichtung(b.kurs)) continue;
    let lektionen: string[] = [];
    if (b.lektion) lektionen = [b.lektion];
    else {
      const paket = await ladeEinheitJson(b.kurs, b.einheit);
      const imPaket = paket ? (JSON.parse(paket.json) as { lektionen: { schluessel: string }[] }).lektionen : [];
      const schluessel = imPaket.map((l) => lektionAusPaket(l.schluessel)?.schluessel ?? null);
      if (!schluessel.length || schluessel.some((x) => x === null)) continue;
      lektionen = schluessel as string[];
    }
    const ziel = zerlegeRichtung(b.kurs).ziel;
    for (const l of lektionen) paketFormen.add(lektionImPaket(b.kurs, ziel, l));
    noetig.push({ aufgabeId: o.aufgabeId, lernendeId: o.lernendeId, kurs: b.kurs, lektionen });
  }
  if (!noetig.length) return 0;

  const lektionAusdruck = sql<string>`${schema.lernappEreignis.daten}->>'lektion'`;
  const erledigt = new Set(
    (
      await db
        .selectDistinct({ kurs: sql<string>`${schema.lernappEreignis.daten}->>'kurs'`, lektion: lektionAusdruck })
        .from(schema.lernappEreignis)
        .where(
          and(
            eq(schema.lernappEreignis.benutzerId, benutzerId),
            eq(schema.lernappEreignis.art, 'lektion'),
            inArray(lektionAusdruck, [...paketFormen]),
          ),
        )
    ).flatMap((z) => {
      const l = lektionAusPaket(z.lektion);
      return l ? [`${z.kurs}|${l.schluessel}`] : [];
    }),
  );
  const werte = noetig
    .filter((n) => n.lektionen.every((l) => erledigt.has(`${n.kurs}|${l}`)))
    .map((n) => ({ aufgabeId: n.aufgabeId, lernendeId: n.lernendeId, erledigtAm: jetzt }));
  if (!werte.length) return 0;
  const neu = await db
    .insert(schema.aufgabeErledigt)
    .values(werte)
    .onConflictDoNothing()
    .returning({ id: schema.aufgabeErledigt.aufgabeId });
  return neu.length;
}
