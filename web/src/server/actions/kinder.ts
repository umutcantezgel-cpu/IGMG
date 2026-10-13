'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import texte from '../../../messages/bereiche/kinder.json';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '@/lib/konto/einwilligung';
import { legeKinderkontoAn } from '@/lib/konto/kinderkonto';
import { PASSWORT_MIN } from '@/lib/konto/passwort-staerke';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import { KIND_EINWILLIGUNGEN, type KindEinwilligung } from '@/lib/lernen/ansicht';
import { ladeGruppenKontext, verlangeKontoRecht } from '@/lib/rechte/gemeinde';
import { KeinRecht } from '@/lib/rechte/pruefe';
import { pruefeRate } from '@/lib/validierung/ratenbegrenzung';
import { pfadFuer } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';

/**
 * Eltern-Aktionen in „Mein Bereich › Kinder“ (ADR 0026, S-03): Einwilligungen einzeln erteilen und widerrufen, Kinderzugang
 * anlegen, Passwort des Kinderzugangs neu setzen. Reihenfolge wie MUSTER §5: Funktionsschalter, Elternkonto
 * (`verlangeKontoRecht(['eltern'])`), Eingabe, Eltern-Kind-Bezug mit Sorgerecht – erst dann wird geschrieben.
 */
const uuid = z.string().uuid();
const spracheSchema = z.enum(['de', 'tr', 'en']).catch('de');

async function elternKontext() {
  await verlangeKontenAktion();
  if (!(await funktionAn('lernplattform'))) throw new KeinRecht();
  const konto = await verlangeKontoRecht(['eltern']);
  return { konto, kontext: await ladeGruppenKontext(konto.benutzerId) };
}

/** Eltern-Kind-Bezug dieses Kontos: null ohne Bezug, sonst mit Sorgerecht und dem Konto des Kindes (falls vorhanden). */
async function bezug(elternId: string, lernendeId: string) {
  const [b] = await db
    .select({ sorgeberechtigt: schema.elternKind.sorgeberechtigt, kindBenutzerId: schema.lernende.benutzerId })
    .from(schema.elternKind)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
    .where(and(eq(schema.elternKind.elternId, elternId), eq(schema.elternKind.lernendeId, lernendeId)));
  return b ?? null;
}

/** Wortlaut, dem zugestimmt wird (Einwilligung + Einvernehmen), in der angezeigten Sprache – die Version ist sein SHA-256. */
function wortlaut(art: KindEinwilligung, sprache: Locale): string {
  const d = texte[sprache].kinder.detail;
  return `${d.einwilligung[art].text}\n${d.einvernehmen}`;
}

const einwilligungSchema = z.object({
  lernendeId: uuid,
  art: z.enum(KIND_EINWILLIGUNGEN),
  aktion: z.enum(['erteilen', 'widerrufen']),
  einvernehmen: z.literal('ja').optional(),
  bestaetigt: z.literal('ja').optional(),
});

/**
 * Einwilligung erteilen oder widerrufen (Formular ohne JavaScript, danach zurück zur Kindseite). Der Widerruf wirkt sofort:
 * Gruppenchat liest die Einwilligung bei jedem Abruf; „Push für das Kind“ entfernt die Abos des Kindes; „Kinderkonto“
 * löscht den Zugang (alle Sitzungen enden, Anwesenheit und Fortschritt bleiben am Lerndatensatz).
 */
export async function einwilligungAendern(fd: FormData): Promise<void> {
  const sprache = spracheSchema.parse(fd.get('sprache')) as Locale;
  const { konto } = await elternKontext();
  const p = einwilligungSchema.safeParse({
    lernendeId: fd.get('lernendeId'),
    art: fd.get('art'),
    aktion: fd.get('aktion'),
    einvernehmen: fd.get('einvernehmen') ?? undefined,
    bestaetigt: fd.get('bestaetigt') ?? undefined,
  });
  if (!p.success) throw new KeinRecht();
  const { lernendeId, art, aktion } = p.data;
  const zurueck = (query: Record<string, string>): never =>
    redirect(pfadFuer({ pathname: '/mein-bereich/kinder/[id]', params: { id: lernendeId }, query, hash: `einwilligung-${art}` }, sprache));

  const b = await bezug(konto.benutzerId, lernendeId);
  if (!b) throw new KeinRecht();
  if (!b.sorgeberechtigt) zurueck({ fehler: 'sorgerecht', art });

  if (aktion === 'erteilen') {
    if (!p.data.einvernehmen) zurueck({ fehler: 'einvernehmen', art });
    await db.transaction(async (tx) => {
      const [aktiv] = await tx
        .select({ id: schema.kontoEinwilligung.id })
        .from(schema.kontoEinwilligung)
        .where(
          and(
            eq(schema.kontoEinwilligung.lernendeId, lernendeId),
            eq(schema.kontoEinwilligung.art, art),
            isNull(schema.kontoEinwilligung.widerrufenAm),
          ),
        );
      if (aktiv) return;
      await tx.insert(schema.kontoEinwilligung).values({
        lernendeId,
        art,
        textVersion: textVersion(KONTO_EINWILLIGUNG_VERSION, wortlaut(art, sprache)),
        sprache,
        einvernehmenBestaetigt: true,
        erteiltVon: konto.benutzerId,
      });
      await protokolliere(
        { benutzerId: konto.benutzerId, aktion: 'konto.einwilligung_erteilt', zielTyp: 'lernende', zielId: lernendeId, details: { art } },
        tx,
      );
    });
    zurueck({ ok: 'erteilt', art });
  }

  // Widerruf: Der Zugang des Kindes wird gelöscht – nur nach ausdrücklicher Bestätigung
  if (art === 'kinderkonto' && b.kindBenutzerId && !p.data.bestaetigt) zurueck({ fehler: 'bestaetigen', art });
  await db.transaction(async (tx) => {
    const widerrufen = await tx
      .update(schema.kontoEinwilligung)
      .set({ widerrufenAm: new Date() })
      .where(
        and(
          eq(schema.kontoEinwilligung.lernendeId, lernendeId),
          eq(schema.kontoEinwilligung.art, art),
          isNull(schema.kontoEinwilligung.widerrufenAm),
        ),
      )
      .returning({ id: schema.kontoEinwilligung.id });
    if (!widerrufen.length) return;
    let zugangGeloescht = false;
    if (b.kindBenutzerId && art === 'push_kind') {
      await tx.delete(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, b.kindBenutzerId));
    }
    if (b.kindBenutzerId && art === 'kinderkonto') {
      // Sitzungen, Rollen, Profil und Push-Abos hängen am Konto (Kaskade); der Lerndatensatz bleibt (set null)
      await tx.delete(schema.user).where(eq(schema.user.id, b.kindBenutzerId));
      zugangGeloescht = true;
    }
    await protokolliere(
      {
        benutzerId: konto.benutzerId,
        aktion: 'konto.einwilligung_widerrufen',
        zielTyp: 'lernende',
        zielId: lernendeId,
        details: { art, zugangGeloescht },
      },
      tx,
    );
  });
  zurueck({ ok: 'widerrufen', art });
}

export type ZugangZustand = { fehler?: string; ok?: 'angelegt' | 'gesetzt'; benutzername?: string; zeit?: number };

const GRENZE = { max: 10, fensterSekunden: 900 };

const zugangSchema = z.object({ lernendeId: uuid, benutzername: z.string().max(64), passwort: z.string().max(128) });

/** Kinderzugang anlegen (`legeKinderkontoAn`, prüft zusätzlich Bezug und Einwilligung „kinderkonto“ dieses Elternteils). */
export async function kinderzugangAnlegen(_vorher: ZugangZustand, fd: FormData): Promise<ZugangZustand> {
  const { konto } = await elternKontext();
  const p = zugangSchema.safeParse({ lernendeId: fd.get('lernendeId'), benutzername: fd.get('benutzername'), passwort: fd.get('passwort') });
  if (!p.success) return { fehler: 'unbekannt' };
  const b = await bezug(konto.benutzerId, p.data.lernendeId);
  if (!b || !b.sorgeberechtigt) return { fehler: 'keinElternteil' };
  if (!(await pruefeRate('kinderzugang', konto.benutzerId, GRENZE)).erlaubt) return { fehler: 'zuViele' };
  const r = await legeKinderkontoAn({
    benutzername: p.data.benutzername,
    passwort: p.data.passwort,
    elternBenutzerId: konto.benutzerId,
    lernendeId: p.data.lernendeId,
    sprache: spracheSchema.parse(fd.get('sprache')),
  });
  if (!r.ok) return { fehler: r.fehler };
  refresh();
  return { ok: 'angelegt', benutzername: r.benutzername, zeit: Date.now() };
}

const passwortSchema = z.object({ lernendeId: uuid, passwort: z.string().min(PASSWORT_MIN).max(128) });

/** Passwort des Kinderzugangs neu setzen (Eltern mit Sorgerecht); alle Sitzungen des Kindes enden sofort. */
export async function kinderPasswortSetzen(_vorher: ZugangZustand, fd: FormData): Promise<ZugangZustand> {
  const { konto } = await elternKontext();
  const p = passwortSchema.safeParse({ lernendeId: fd.get('lernendeId'), passwort: fd.get('passwort') });
  if (!p.success) return { fehler: 'passwort' };
  const b = await bezug(konto.benutzerId, p.data.lernendeId);
  if (!b || !b.sorgeberechtigt) return { fehler: 'keinElternteil' };
  if (!b.kindBenutzerId) return { fehler: 'keinZugang' };
  if (!(await pruefeRate('kinderzugang', konto.benutzerId, GRENZE)).erlaubt) return { fehler: 'zuViele' };
  const [kind] = await db
    .select({ benutzername: schema.user.username, gesperrtAm: schema.user.gesperrtAm })
    .from(schema.user)
    .where(eq(schema.user.id, b.kindBenutzerId));
  if (!kind || kind.gesperrtAm) return { fehler: 'unbekannt' };
  const hash = await (await auth.$context).password.hash(p.data.passwort);
  const kindId = b.kindBenutzerId;
  await db.transaction(async (tx) => {
    const z = await tx
      .update(schema.account)
      .set({ password: hash, updatedAt: new Date() })
      .where(and(eq(schema.account.userId, kindId), eq(schema.account.providerId, 'credential')))
      .returning({ id: schema.account.id });
    if (!z.length) throw new KeinRecht();
    await tx.delete(schema.session).where(eq(schema.session.userId, kindId));
    await protokolliere(
      { benutzerId: konto.benutzerId, aktion: 'konto.kinderpasswort_gesetzt', zielTyp: 'benutzer', zielId: kindId },
      tx,
    );
  });
  return { ok: 'gesetzt', benutzername: kind.benutzername ?? undefined, zeit: Date.now() };
}
