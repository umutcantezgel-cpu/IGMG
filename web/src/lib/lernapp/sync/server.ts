import 'server-only';
import { and, asc, eq, gt, gte, inArray, isNotNull, isNull, max, ne, or, sql } from 'drizzle-orm';
import { db, schema, type Transaktion } from '@/lib/db';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { einwilligungsLage, type EinwilligungsLage } from '@/lib/konto/sechzehn';
import { proxyVertraut } from '@/lib/sicherheit/ip';
import { ladeEinheitJson } from '@/server/queries/lernapp/pakete';
import { heuteStand, leiteAb } from '../ereignisse/ableiten';
import { addiereTage, klemmeEreignis, lerntagVon } from '../ereignisse/serie';
import { type Ereignis, EreignisSchema, GeraetSchema, istArt } from '../ereignisse/typen';
import { ereignisSchluessel, vereinige } from '../ereignisse/zusammenfuehren';
import { istRichtung, pruefeLernappBezug } from '../kurse';
import { lektionAusPaket } from '../paket/bauen';
import { type KartenBasis, type KartenBewertung, type Kartenstand, type Note, spieleKarteNach } from '../srs';
import { type EinwilligungsStand, HOECHSTENS_FREMDE, type SyncAnfrage, type SyncAntwort } from './protokoll';

/**
 * Abgleich auf dem Server (ADR 0038 Nr. 5–7 und 10, KERN 4.0 §5/§6). Die Route `/api/lernapp/sync` prüft vorher Schalter,
 * Ursprung, Sitzung, Einwilligung und Bremse; hier geschieht das Schreiben und Lesen eines Kontos:
 *
 * 1. Ereignisse einzeln mit Zod prüfen, Uhrzeit klemmen (Empfang + 5 min, Lerntag), innerhalb der Anfrage vereinigen.
 * 2. In einer Transaktion unter einer Sperre je Konto: Lernprofil anlegen bzw. `zuletztAktivAm` setzen, Ereignisse mit
 *    `ON CONFLICT DO NOTHING` schreiben, Kartenstand der betroffenen Karten mit **derselben** reinen Funktion wie auf dem Gerät
 *    nachspielen (`srs.ts`, ab der verdichteten Basis), Lerntage (`lernapp_tag`) neu ableiten, fremde Ereignisse nach dem
 *    Zeiger lesen. Die Sperre hält alle Schreiber eines Kontos hintereinander – so überspringt der Zeiger nie ein Ereignis,
 *    das eine parallele Transaktion noch nicht festgeschrieben hat.
 * 3. Danach (außerhalb der Transaktion): erledigte Zuweisungen der Lehrkraft vermerken (`aufgabe_erledigt`).
 */

const sperre = (benutzerId: string) => sql`select pg_advisory_xact_lock(hashtext(${`igmg:lernapp-sync:${benutzerId}`}))`;

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

const TAG_ARTEN = ['lektion', 'xp', 'tagesziel', 'pause'] as const;

/** Lerntage, die neue Ereignisse berühren, aus allen Lektions-, XP-, Ziel- und Pause-Ereignissen neu ableiten. */
export async function erneuereTage(tx: Transaktion, benutzerId: string, neue: readonly Ereignis[], jetzt: Date): Promise<void> {
  const betroffen = new Set<string>();
  for (const e of neue) {
    if (e.art === 'bewertung' || e.art === 'lektion' || e.art === 'xp') betroffen.add(e.tag);
    if (e.art === 'pause') for (let t = e.daten.von; t <= e.daten.bis; t = addiereTage(t, 1)) betroffen.add(t);
  }
  const ziele = neue.filter(istArt('tagesziel')).map((e) => e.tag);
  if (!betroffen.size && !ziele.length) return;

  const zeilen = await tx
    .select(ereignisSpalten)
    .from(schema.lernappEreignis)
    .where(and(eq(schema.lernappEreignis.benutzerId, benutzerId), inArray(schema.lernappEreignis.art, [...TAG_ARTEN])));
  const liste = zeilen.flatMap((z) => {
    const p = EreignisSchema.safeParse(alsEreignis(z));
    return p.success ? [p.data] : [];
  });
  const a = leiteAb(liste, lerntagVon(jetzt, 'UTC'));
  if (ziele.length) {
    const ab = ziele.sort()[0]!;
    for (const t of a.tage.keys()) if (t >= ab) betroffen.add(t);
    for (const t of await tx
      .select({ tag: schema.lernappTag.tag })
      .from(schema.lernappTag)
      .where(and(eq(schema.lernappTag.benutzerId, benutzerId), gte(schema.lernappTag.tag, ab))))
      betroffen.add(t.tag);
  }
  const werte = [...betroffen].sort().map((tag) => {
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
}

// ——— Abgleich ———

export type AbgleichErgebnis = { antwort: SyncAntwort; neue: Ereignis[] };

/**
 * Ein Abgleich eines Kontos (nach allen Prüfungen der Route). Idempotent: Dieselbe Anfrage noch einmal schreibt nichts
 * und liefert dieselben fremden Ereignisse.
 */
export async function gleicheKontoAb(benutzerId: string, anfrage: SyncAnfrage, jetzt = new Date()): Promise<AbgleichErgebnis> {
  const geprueft = pruefeEreignisse(anfrage.ereignisse, jetzt);
  const vonCursor = anfrage.cursor === null ? 0 : Number(anfrage.cursor);

  return db.transaction(async (tx) => {
    await tx.execute(sperre(benutzerId));
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

  const erledigt = new Set(
    (
      await db
        .select({
          kurs: sql<string>`${schema.lernappEreignis.daten}->>'kurs'`,
          lektion: sql<string>`${schema.lernappEreignis.daten}->>'lektion'`,
        })
        .from(schema.lernappEreignis)
        .where(and(eq(schema.lernappEreignis.benutzerId, benutzerId), eq(schema.lernappEreignis.art, 'lektion')))
    ).flatMap((z) => {
      const l = lektionAusPaket(z.lektion);
      return l ? [`${z.kurs}|${l.schluessel}`] : [];
    }),
  );
  const werte: { aufgabeId: string; lernendeId: string; erledigtAm: Date }[] = [];
  for (const o of offen) {
    const b = pruefeLernappBezug(o.bezug);
    if (!b?.einheit) continue;
    let fertig = false;
    if (b.lektion) fertig = erledigt.has(`${b.kurs}|${b.lektion}`);
    else if (istRichtung(b.kurs)) {
      const paket = await ladeEinheitJson(b.kurs, b.einheit);
      const lektionen = paket ? (JSON.parse(paket.json) as { lektionen: { schluessel: string }[] }).lektionen : [];
      fertig =
        lektionen.length > 0 &&
        lektionen.every((l) => {
          const s = lektionAusPaket(l.schluessel);
          return s !== null && erledigt.has(`${b.kurs}|${s.schluessel}`);
        });
    }
    if (fertig) werte.push({ aufgabeId: o.aufgabeId, lernendeId: o.lernendeId, erledigtAm: jetzt });
  }
  if (!werte.length) return 0;
  const neu = await db
    .insert(schema.aufgabeErledigt)
    .values(werte)
    .onConflictDoNothing()
    .returning({ id: schema.aufgabeErledigt.aufgabeId });
  return neu.length;
}
