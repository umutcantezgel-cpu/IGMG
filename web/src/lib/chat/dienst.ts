import 'server-only';
import { and, asc, count, desc, eq, gt, gte, inArray, isNull, lt, lte, sql } from 'drizzle-orm';
import { db, schema, type Transaktion } from '@/lib/db';
import { uhrzeitBerlin, berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { entschluessele, verschluessele } from '@/lib/krypto';
import { darfInGruppe, type GruppenAktion, type GruppenKontext } from '@/lib/rechte/gruppen';
import { KETTEN_ANFANG, kettenHash } from './hashkette';
import {
  alterAus,
  bereinigeText,
  chatName,
  MELDUNG_KONTEXT,
  pruefeText,
  RATE_MINUTE,
  RATE_TAG,
  REGELN_VERSION,
  schreibGrund,
  type SchreibGrund,
  type TextFehler,
} from './regeln';

/**
 * Chat-Dienst (S-01…S-18, ADR 0026/0027). Alle Funktionen bekommen den Gruppenkontext des Kontos und prüfen ihn
 * selbst – die Server Actions und die Abruf-Route laden ihn vorher (`verlangeKontoRecht` + `ladeGruppenKontext`).
 * Texte liegen nur verschlüsselt in der Datenbank (S-16) und erscheinen nie in Protokollen, Mails oder Push.
 */
export type KanalArt = 'gruppe' | 'eltern';
type ModerationsAktion = (typeof schema.moderationAktionEnum.enumValues)[number];

export type KanalLage = {
  kanalId: string;
  gruppeId: string;
  art: KanalArt;
  status: 'aktiv' | 'pausiert' | 'archiviert';
  chatModus: 'aus' | 'nur_lehrkraft' | 'offen';
  chatVon: string;
  chatBis: string;
  mindestalter: number;
  erwachsene: number;
};

export async function ladeKanal(kanalId: string): Promise<KanalLage | null> {
  if (!/^[0-9a-f-]{36}$/i.test(kanalId)) return null;
  const [k] = await db
    .select({
      kanalId: schema.chatKanal.id,
      gruppeId: schema.chatKanal.gruppeId,
      art: schema.chatKanal.art,
      status: schema.chatKanal.status,
      chatModus: schema.gruppe.chatModus,
      chatVon: schema.gruppe.chatVon,
      chatBis: schema.gruppe.chatBis,
      mindestalter: schema.gruppe.chatMindestalter,
    })
    .from(schema.chatKanal)
    .innerJoin(schema.gruppe, eq(schema.gruppe.id, schema.chatKanal.gruppeId))
    .where(eq(schema.chatKanal.id, kanalId));
  if (!k) return null;
  const [{ zahl }] = await db.select({ zahl: count() }).from(schema.gruppenLeitung).where(eq(schema.gruppenLeitung.gruppeId, k.gruppeId));
  return { ...k, erwachsene: zahl };
}

/** Kanäle einer Gruppe; legt fehlende an (je Gruppe genau ein Gruppen- und ein Elternkanal, S-01). */
export async function kanaeleDerGruppe(gruppeId: string): Promise<Record<KanalArt, string>> {
  await db
    .insert(schema.chatKanal)
    .values([
      { gruppeId, art: 'gruppe' },
      { gruppeId, art: 'eltern' },
    ])
    .onConflictDoNothing();
  const zeilen = await db
    .select({ id: schema.chatKanal.id, art: schema.chatKanal.art })
    .from(schema.chatKanal)
    .where(eq(schema.chatKanal.gruppeId, gruppeId));
  return Object.fromEntries(zeilen.map((z) => [z.art, z.id])) as Record<KanalArt, string>;
}

/** S-17: Notfall-Pause aller Chats – immer frisch aus der Datenbank (nie aus dem Cache). */
export async function notfallpauseAktiv(): Promise<boolean> {
  const [z] = await db
    .select({ wert: schema.einstellung.wert })
    .from(schema.einstellung)
    .where(eq(schema.einstellung.schluessel, 'kinderschutz'));
  return Boolean((z?.wert as { notfallpause?: boolean } | undefined)?.notfallpause);
}

const leseAktion = (art: KanalArt): GruppenAktion => (art === 'gruppe' ? 'chat.gruppe.lesen' : 'chat.eltern.lesen');
const schreibAktion = (art: KanalArt): GruppenAktion => (art === 'gruppe' ? 'chat.gruppe.schreiben' : 'chat.eltern.schreiben');

/** Lage zum Schreiben für ein Konto (ohne Ratenprüfung). */
export async function schreibLage(kanal: KanalLage, kontext: GruppenKontext, jetzt = new Date()): Promise<SchreibGrund> {
  const darfLesen = darfInGruppe(kontext, leseAktion(kanal.art), kanal.gruppeId);
  const istLeitung = kontext.leitung.has(kanal.gruppeId);
  const istLernende = kanal.art === 'gruppe' && !istLeitung && kontext.eigeneLernendeId !== null;
  const [stumm, regeln, lernende, einwilligung, pause] = await Promise.all([
    db
      .select({ bis: schema.chatStumm.bis })
      .from(schema.chatStumm)
      .where(and(eq(schema.chatStumm.kanalId, kanal.kanalId), eq(schema.chatStumm.benutzerId, kontext.benutzerId))),
    db
      .select({ v: schema.chatRegelnBestaetigt.version })
      .from(schema.chatRegelnBestaetigt)
      .where(and(eq(schema.chatRegelnBestaetigt.benutzerId, kontext.benutzerId), eq(schema.chatRegelnBestaetigt.version, REGELN_VERSION))),
    istLernende && kontext.eigeneLernendeId
      ? db.select({ sechzehnAm: schema.lernende.sechzehnAm }).from(schema.lernende).where(eq(schema.lernende.id, kontext.eigeneLernendeId))
      : Promise.resolve([]),
    istLernende && kontext.eigeneLernendeId
      ? db
          .select({ id: schema.kontoEinwilligung.id })
          .from(schema.kontoEinwilligung)
          .where(
            and(
              eq(schema.kontoEinwilligung.lernendeId, kontext.eigeneLernendeId),
              eq(schema.kontoEinwilligung.art, 'gruppenchat'),
              isNull(schema.kontoEinwilligung.widerrufenAm),
            ),
          )
      : Promise.resolve([]),
    notfallpauseAktiv(),
  ]);
  const heute = berlinerDatum(jetzt);
  const sechzehnAm = lernende[0]?.sechzehnAm ?? null;
  return schreibGrund({
    darfLesen,
    darfSchreibenRecht: darfInGruppe(kontext, schreibAktion(kanal.art), kanal.gruppeId),
    istLeitung,
    kanalStatus: kanal.status,
    chatModus: kanal.chatModus,
    notfallpause: pause,
    erwachsene: kanal.erwachsene,
    uhrzeit: uhrzeitBerlin(jetzt),
    chatVon: kanal.chatVon,
    chatBis: kanal.chatBis,
    stummBis: stumm[0]?.bis ?? null,
    jetzt,
    istLernende,
    // Ohne bekanntes Datum gilt das Kind als unter 16 (vorsichtig)
    unter16: sechzehnAm === null || sechzehnAm > heute,
    einwilligungGruppenchat: einwilligung.length > 0,
    alter: sechzehnAm ? alterAus(sechzehnAm, heute) : null,
    mindestalter: kanal.mindestalter,
    regelnBestaetigt: regeln.length > 0,
  });
}

export type ChatNachricht = {
  id: number;
  eigen: boolean;
  name: string;
  /** null = entfernt (Platzhalter, S-09) */
  text: string | null;
  zeit: string;
  leitung: boolean;
  /** Nur für die Gruppenleitung (Stummschalten): Konto-ID des Absenders. */
  absender?: string;
};

export type AbrufErgebnis = {
  nachrichten: ChatNachricht[];
  schreiben: SchreibGrund;
  regelnVersion: string;
};

/** Nachrichten nach `nachId` (aufsteigend, höchstens 50; ohne `nachId` die letzten 50). Keine Lesebestätigungen (S-14). */
export async function ladeNachrichten(kanal: KanalLage, kontext: GruppenKontext, nachId?: number): Promise<AbrufErgebnis | null> {
  if (!darfInGruppe(kontext, leseAktion(kanal.art), kanal.gruppeId)) return null;
  // S-03/S-17: Ohne (oder nach widerrufener) Elterneinwilligung und während der Notfall-Pause sehen Kinder und Eltern
  // keine Nachrichten – nur den Grund. Die Gruppenleitung liest weiter (Aufarbeitung).
  const lage = await schreibLage(kanal, kontext);
  if (lage === 'einwilligungFehlt' || (lage === 'notfallpause' && !kontext.leitung.has(kanal.gruppeId)))
    return { nachrichten: [], schreiben: lage, regelnVersion: REGELN_VERSION };
  const basis = db
    .select({
      id: schema.chatNachricht.id,
      absenderId: schema.chatNachricht.absenderId,
      text: schema.chatNachricht.textVerschluesselt,
      schluesselId: schema.chatNachricht.schluesselId,
      zeit: schema.chatNachricht.erstelltAm,
      entfernt: schema.chatNachricht.entferntAm,
      anzeigename: schema.kontoProfil.anzeigename,
      name: schema.user.name,
    })
    .from(schema.chatNachricht)
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.chatNachricht.absenderId))
    .leftJoin(schema.user, eq(schema.user.id, schema.chatNachricht.absenderId));
  const zeilen =
    nachId !== undefined
      ? await basis
          .where(and(eq(schema.chatNachricht.kanalId, kanal.kanalId), gt(schema.chatNachricht.id, nachId)))
          .orderBy(asc(schema.chatNachricht.id))
          .limit(50)
      : (await basis.where(eq(schema.chatNachricht.kanalId, kanal.kanalId)).orderBy(desc(schema.chatNachricht.id)).limit(50)).reverse();
  const leitung = new Set(
    (
      await db
        .select({ id: schema.gruppenLeitung.benutzerId })
        .from(schema.gruppenLeitung)
        .where(eq(schema.gruppenLeitung.gruppeId, kanal.gruppeId))
    ).map((z) => z.id),
  );
  const fuerLeitung = kontext.leitung.has(kanal.gruppeId);
  return {
    nachrichten: zeilen.map((z) => ({
      ...(fuerLeitung && z.absenderId ? { absender: z.absenderId } : {}),
      id: z.id,
      eigen: z.absenderId === kontext.benutzerId,
      name: chatName(z.anzeigename ?? z.name ?? ''),
      text: z.entfernt ? null : entschluessele<string>(z.text, z.schluesselId),
      zeit: z.zeit.toISOString(),
      leitung: z.absenderId !== null && leitung.has(z.absenderId),
    })),
    schreiben: lage,
    regelnVersion: REGELN_VERSION,
  };
}

export type SendeErgebnis = { ok: true; id: number } | { ok: false; grund: SchreibGrund | TextFehler | 'rate' };

/** S-13: 10 je Minute, 200 je Tag (über alle Kanäle der Person). */
async function rateUeberschritten(benutzerId: string): Promise<boolean> {
  const [minute, tag] = await Promise.all([
    db
      .select({ zahl: count() })
      .from(schema.chatNachricht)
      .where(and(eq(schema.chatNachricht.absenderId, benutzerId), gte(schema.chatNachricht.erstelltAm, sql`now() - interval '1 minute'`))),
    db
      .select({ zahl: count() })
      .from(schema.chatNachricht)
      .where(and(eq(schema.chatNachricht.absenderId, benutzerId), gte(schema.chatNachricht.erstelltAm, sql`now() - interval '1 day'`))),
  ]);
  return minute[0].zahl >= RATE_MINUTE || tag[0].zahl >= RATE_TAG;
}

export async function sendeNachricht(kanal: KanalLage, kontext: GruppenKontext, roh: string): Promise<SendeErgebnis> {
  const grund = await schreibLage(kanal, kontext);
  if (grund !== 'ok') return { ok: false, grund };
  const text = bereinigeText(roh);
  const fehler = pruefeText(text);
  if (fehler) return { ok: false, grund: fehler };
  if (await rateUeberschritten(kontext.benutzerId)) return { ok: false, grund: 'rate' };
  const { daten, schluesselId } = verschluessele(text);
  const [z] = await db
    .insert(schema.chatNachricht)
    .values({ kanalId: kanal.kanalId, absenderId: kontext.benutzerId, textVerschluesselt: daten, schluesselId })
    .returning({ id: schema.chatNachricht.id });
  return { ok: true, id: z.id };
}

export async function bestaetigeRegeln(benutzerId: string): Promise<void> {
  await db.insert(schema.chatRegelnBestaetigt).values({ benutzerId, version: REGELN_VERSION }).onConflictDoNothing();
}

/** Schreibt eine Zeile ins Moderationsprotokoll (S-10) – in der Transaktion, verkettet, serialisiert über eine Sperre. */
export async function protokolliereModeration(
  tx: Transaktion,
  e: { kanalId: string | null; nachrichtId: number | null; akteurId: string | null; aktion: ModerationsAktion; grund: string },
): Promise<void> {
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('igmg:moderationsprotokoll'))`);
  const [letzte] = await tx
    .select({ hash: schema.moderationsprotokoll.hash })
    .from(schema.moderationsprotokoll)
    .orderBy(desc(schema.moderationsprotokoll.id))
    .limit(1);
  const vorgaengerHash = letzte?.hash ?? KETTEN_ANFANG;
  const zeitpunkt = new Date();
  const hash = kettenHash(vorgaengerHash, { ...e, zeitpunkt: zeitpunkt.toISOString() });
  await tx.insert(schema.moderationsprotokoll).values({ ...e, zeitpunkt, vorgaengerHash, hash });
}

export type ModerationsFehler = 'keinRecht' | 'grundFehlt' | 'nichtGefunden';

function grundGueltig(grund: string): string | null {
  const g = bereinigeText(grund).slice(0, 300);
  return g.length >= 3 ? g : null;
}

/** S-09: Nachricht entfernen (nur Gruppenleitung, mit Grund). */
export async function entferneNachricht(kontext: GruppenKontext, nachrichtId: number, grund: string): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  const [n] = await db
    .select({ kanalId: schema.chatNachricht.kanalId, gruppeId: schema.chatKanal.gruppeId })
    .from(schema.chatNachricht)
    .innerJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatNachricht.kanalId))
    .where(eq(schema.chatNachricht.id, nachrichtId));
  if (!n) return 'nichtGefunden';
  if (!darfInGruppe(kontext, 'chat.moderieren', n.gruppeId)) return 'keinRecht';
  await entferne(n.kanalId, nachrichtId, kontext.benutzerId, g);
  return null;
}

/** Entfernen ohne Text (Chiffrat wird sofort überschrieben, D-03): bleibt als Platzhalter mit Grund im Verlauf. */
async function entferne(kanalId: string, nachrichtId: number, akteurId: string, grund: string): Promise<void> {
  const leer = verschluessele('');
  await db.transaction(async (tx) => {
    await tx
      .update(schema.chatNachricht)
      .set({
        entferntAm: new Date(),
        entferntVon: akteurId,
        entferntGrund: grund,
        textVerschluesselt: leer.daten,
        schluesselId: leer.schluesselId,
      })
      .where(eq(schema.chatNachricht.id, nachrichtId));
    await protokolliereModeration(tx, { kanalId, nachrichtId, akteurId, aktion: 'entfernt', grund });
  });
}

/**
 * Rolle kinderschutz (Verwaltung, Recht `meldung.chat.bearbeiten`; die Action prüft es): entfernen und pausieren auch
 * ohne Gruppenleitung – nötig, wenn sich eine Meldung gegen eine Lehrkraft richtet (D-02).
 */
export async function entferneAlsKinderschutz(akteurId: string, nachrichtId: number, grund: string): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  const [n] = await db
    .select({ kanalId: schema.chatNachricht.kanalId })
    .from(schema.chatNachricht)
    .where(eq(schema.chatNachricht.id, nachrichtId));
  if (!n) return 'nichtGefunden';
  await entferne(n.kanalId, nachrichtId, akteurId, g);
  return null;
}

export async function pausiereAlsKinderschutz(
  akteurId: string,
  kanalId: string,
  pause: boolean,
  grund: string,
): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  const r = await db.transaction(async (tx) => {
    const z = await tx
      .update(schema.chatKanal)
      .set({ status: pause ? 'pausiert' : 'aktiv' })
      .where(eq(schema.chatKanal.id, kanalId))
      .returning({ id: schema.chatKanal.id });
    if (z.length)
      await protokolliereModeration(tx, { kanalId, nachrichtId: null, akteurId, aktion: pause ? 'pausiert' : 'fortgesetzt', grund: g });
    return z.length;
  });
  return r ? null : 'nichtGefunden';
}

/** S-09: Mitglied aus der Gruppe entfernen (Leitung, mit Grund); die Mitgliedschaft endet heute, der Zugang sofort. */
export async function entferneMitglied(
  kontext: GruppenKontext,
  gruppeId: string,
  lernendeId: string,
  grund: string,
): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  if (!darfInGruppe(kontext, 'chat.moderieren', gruppeId)) return 'keinRecht';
  const kanaele = await kanaeleDerGruppe(gruppeId);
  const r = await db.transaction(async (tx) => {
    const z = await tx
      .update(schema.gruppenMitglied)
      .set({ bis: berlinerDatum(new Date()) })
      .where(
        and(
          eq(schema.gruppenMitglied.gruppeId, gruppeId),
          eq(schema.gruppenMitglied.lernendeId, lernendeId),
          isNull(schema.gruppenMitglied.bis),
        ),
      )
      .returning({ id: schema.gruppenMitglied.lernendeId });
    if (z.length)
      await protokolliereModeration(tx, {
        kanalId: kanaele.gruppe,
        nachrichtId: null,
        akteurId: kontext.benutzerId,
        aktion: 'mitglied_entfernt',
        grund: g,
      });
    return z.length;
  });
  return r ? null : 'nichtGefunden';
}

/** S-09: Stummschalten für eine Dauer (Minuten) oder aufheben (0). */
export async function stummschalten(
  kontext: GruppenKontext,
  kanal: KanalLage,
  benutzerId: string,
  minutenDauer: number,
  grund: string,
): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  if (!darfInGruppe(kontext, 'chat.moderieren', kanal.gruppeId)) return 'keinRecht';
  await db.transaction(async (tx) => {
    if (minutenDauer <= 0) {
      await tx
        .delete(schema.chatStumm)
        .where(and(eq(schema.chatStumm.kanalId, kanal.kanalId), eq(schema.chatStumm.benutzerId, benutzerId)));
    } else {
      const bis = new Date(Date.now() + Math.min(minutenDauer, 60 * 24 * 30) * 60_000);
      await tx
        .insert(schema.chatStumm)
        .values({ kanalId: kanal.kanalId, benutzerId, bis, von: kontext.benutzerId, grund: g })
        .onConflictDoUpdate({
          target: [schema.chatStumm.kanalId, schema.chatStumm.benutzerId],
          set: { bis, von: kontext.benutzerId, grund: g },
        });
    }
    await protokolliereModeration(tx, {
      kanalId: kanal.kanalId,
      nachrichtId: null,
      akteurId: kontext.benutzerId,
      aktion: minutenDauer <= 0 ? 'stumm_aufgehoben' : 'stumm',
      grund: g,
    });
  });
  return null;
}

/** S-09: Kanal pausieren oder fortsetzen. */
export async function setzeKanalPause(
  kontext: GruppenKontext,
  kanal: KanalLage,
  pause: boolean,
  grund: string,
): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  if (!darfInGruppe(kontext, 'chat.moderieren', kanal.gruppeId)) return 'keinRecht';
  await db.transaction(async (tx) => {
    await tx
      .update(schema.chatKanal)
      .set({ status: pause ? 'pausiert' : 'aktiv' })
      .where(eq(schema.chatKanal.id, kanal.kanalId));
    await protokolliereModeration(tx, {
      kanalId: kanal.kanalId,
      nachrichtId: null,
      akteurId: kontext.benutzerId,
      aktion: pause ? 'pausiert' : 'fortgesetzt',
      grund: g,
    });
  });
  return null;
}

/** S-07/S-08: Nachricht melden. Kontext (±10) wird verschlüsselt gesichert; Benachrichtigung ohne Inhalt. */
export async function meldeNachricht(
  kontext: GruppenKontext,
  nachrichtId: number,
  grund: (typeof schema.chatMeldungGrundEnum.enumValues)[number],
  freitext: string | null,
): Promise<{ ok: true; meldungId: string; gruppeId: string; absenderId: string | null } | { ok: false; grund: ModerationsFehler }> {
  const [n] = await db
    .select({
      kanalId: schema.chatNachricht.kanalId,
      gruppeId: schema.chatKanal.gruppeId,
      art: schema.chatKanal.art,
      absenderId: schema.chatNachricht.absenderId,
    })
    .from(schema.chatNachricht)
    .innerJoin(schema.chatKanal, eq(schema.chatKanal.id, schema.chatNachricht.kanalId))
    .where(eq(schema.chatNachricht.id, nachrichtId));
  if (!n) return { ok: false, grund: 'nichtGefunden' };
  if (!darfInGruppe(kontext, 'chat.melden', n.gruppeId) || !darfInGruppe(kontext, leseAktion(n.art), n.gruppeId))
    return { ok: false, grund: 'keinRecht' };
  const umgebung = await db
    .select({
      id: schema.chatNachricht.id,
      absenderId: schema.chatNachricht.absenderId,
      text: schema.chatNachricht.textVerschluesselt,
      schluesselId: schema.chatNachricht.schluesselId,
      zeit: schema.chatNachricht.erstelltAm,
    })
    .from(schema.chatNachricht)
    .where(
      and(
        eq(schema.chatNachricht.kanalId, n.kanalId),
        gte(schema.chatNachricht.id, nachrichtId - 1000),
        lte(schema.chatNachricht.id, nachrichtId + 1000),
      ),
    )
    .orderBy(asc(schema.chatNachricht.id));
  const pos = umgebung.findIndex((z) => z.id === nachrichtId);
  const ausschnitt = umgebung.slice(Math.max(0, pos - MELDUNG_KONTEXT), pos + MELDUNG_KONTEXT + 1).map((z) => ({
    id: z.id,
    absenderId: z.absenderId,
    text: entschluessele<string>(z.text, z.schluesselId),
    zeit: z.zeit.toISOString(),
    gemeldet: z.id === nachrichtId,
  }));
  const k = verschluessele(ausschnitt);
  const f = freitext ? verschluessele(bereinigeText(freitext).slice(0, 1000)) : null;
  const [m] = await db
    .insert(schema.chatMeldung)
    .values({
      kanalId: n.kanalId,
      nachrichtId,
      gemeldetVon: kontext.benutzerId,
      grund,
      freitextVerschluesselt: f?.daten ?? null,
      kontextVerschluesselt: k.daten,
      schluesselId: k.schluesselId,
    })
    .returning({ id: schema.chatMeldung.id });
  return { ok: true, meldungId: m.id, gruppeId: n.gruppeId, absenderId: n.absenderId };
}

/** Empfänger einer Meldung aus der Gruppenleitung (Mail ohne Inhalt, S-08) – nie die gemeldete Person selbst (D-02). */
export async function leitungsAdressen(gruppeId: string, ausser: string | null = null): Promise<string[]> {
  const zeilen = await db
    .select({ email: schema.user.email, id: schema.user.id })
    .from(schema.gruppenLeitung)
    .innerJoin(schema.user, eq(schema.user.id, schema.gruppenLeitung.benutzerId))
    .where(and(eq(schema.gruppenLeitung.gruppeId, gruppeId), isNull(schema.user.gesperrtAm)));
  return zeilen
    .filter((z) => z.id !== ausser)
    .map((z) => z.email)
    .filter((e) => !e.endsWith('.invalid'));
}

/** S-11: Kontext einer Meldung lesen (Rolle kinderschutz bzw. Gruppenleitung) – jede Einsicht steht im Protokoll. */
export async function meldungsKontext(
  meldungId: string,
  akteurId: string,
): Promise<{
  grund: string;
  freitext: string | null;
  kontext: { id: number; name: string; text: string; zeit: string; gemeldet: boolean }[];
} | null> {
  const [m] = await db.select().from(schema.chatMeldung).where(eq(schema.chatMeldung.id, meldungId));
  if (!m) return null;
  const roh = entschluessele<{ id: number; absenderId: string | null; text: string; zeit: string; gemeldet: boolean }[]>(
    m.kontextVerschluesselt,
    m.schluesselId,
  );
  const ids = [...new Set(roh.map((z) => z.absenderId).filter((x): x is string => Boolean(x)))];
  const namen = new Map(
    ids.length
      ? (
          await db
            .select({ id: schema.user.id, name: schema.user.name, anzeigename: schema.kontoProfil.anzeigename })
            .from(schema.user)
            .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.user.id))
            .where(inArray(schema.user.id, ids))
        ).map((z) => [z.id, chatName(z.anzeigename ?? z.name)])
      : [],
  );
  await db.transaction((tx) =>
    protokolliereModeration(tx, {
      kanalId: m.kanalId,
      nachrichtId: m.nachrichtId,
      akteurId,
      aktion: 'kontext_eingesehen',
      grund: `Meldung ${m.id}`,
    }),
  );
  return {
    grund: m.grund,
    freitext: m.freitextVerschluesselt ? entschluessele<string>(m.freitextVerschluesselt, m.schluesselId) : null,
    kontext: roh.map((z) => ({
      id: z.id,
      name: z.absenderId ? (namen.get(z.absenderId) ?? '') : '',
      text: z.text,
      zeit: z.zeit,
      gemeldet: z.gemeldet,
    })),
  };
}

/** Meldung bearbeiten: Status und Frist (1 Jahr nach Abschluss, S-12). */
export async function bearbeiteMeldung(
  meldungId: string,
  akteurId: string,
  status: 'in_bearbeitung' | 'erledigt',
  grund: string,
): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  const [m] = await db
    .select({ kanalId: schema.chatMeldung.kanalId, nachrichtId: schema.chatMeldung.nachrichtId })
    .from(schema.chatMeldung)
    .where(eq(schema.chatMeldung.id, meldungId));
  if (!m) return 'nichtGefunden';
  await db.transaction(async (tx) => {
    await tx
      .update(schema.chatMeldung)
      .set({
        status,
        bearbeitetVon: akteurId,
        bearbeitetAm: new Date(),
        loeschenAb: status === 'erledigt' ? sql`now() + interval '365 days'` : null,
      })
      .where(eq(schema.chatMeldung.id, meldungId));
    await protokolliereModeration(tx, {
      kanalId: m.kanalId,
      nachrichtId: m.nachrichtId,
      akteurId,
      aktion: 'meldung_bearbeitet',
      grund: `${status}: ${g}`,
    });
  });
  return null;
}

/** S-17: Notfall-Pause aller Chats an/aus (Rolle kinderschutz/Administration, Recht chat.notfallpause). */
export async function setzeNotfallpause(akteurId: string, an: boolean, grund: string): Promise<ModerationsFehler | null> {
  const g = grundGueltig(grund);
  if (!g) return 'grundFehlt';
  await db.transaction(async (tx) => {
    await tx
      .insert(schema.einstellung)
      .values({ schluessel: 'kinderschutz', wert: { notfallpause: an } })
      .onConflictDoUpdate({ target: schema.einstellung.schluessel, set: { wert: { notfallpause: an } } });
    await protokolliereModeration(tx, {
      kanalId: null,
      nachrichtId: null,
      akteurId,
      aktion: an ? 'notfallpause' : 'notfallpause_aufgehoben',
      grund: g,
    });
  });
  return null;
}

/**
 * S-12 Löschlauf: Nachrichten nach 90 Tagen bzw. 30 Tage nach Gruppenende; erledigte Meldungen nach Frist.
 * Das Protokoll bleibt (nur der Löschlauf selbst wird vermerkt).
 */
export async function chatLoeschlauf(): Promise<{ nachrichten: number; meldungen: number }> {
  return db.transaction(async (tx) => {
    const alt = await tx
      .delete(schema.chatNachricht)
      .where(
        sql`${schema.chatNachricht.erstelltAm} < now() - interval '90 days'
          or ${schema.chatNachricht.kanalId} in (
            select k.id from chat_kanal k join gruppe g on g.id = k.gruppe_id
            where g.ende is not null and g.ende < (now() - interval '30 days')::date)`,
      )
      .returning({ id: schema.chatNachricht.id });
    const meldungen = await tx
      .delete(schema.chatMeldung)
      .where(and(lt(schema.chatMeldung.loeschenAb, sql`now()`), eq(schema.chatMeldung.status, 'erledigt')))
      .returning({ id: schema.chatMeldung.id });
    if (alt.length || meldungen.length)
      await protokolliereModeration(tx, {
        kanalId: null,
        nachrichtId: null,
        akteurId: null,
        aktion: 'loeschlauf',
        grund: `Nachrichten ${alt.length}, Meldungen ${meldungen.length}`,
      });
    return { nachrichten: alt.length, meldungen: meldungen.length };
  });
}
