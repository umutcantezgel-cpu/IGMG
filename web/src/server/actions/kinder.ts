'use server';

import { and, eq, isNull, ne, or } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import texte from '../../../messages/bereiche/kinder.json';
import { protokolliere } from '@/lib/audit';
import { auth } from '@/lib/auth/server';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { KONTO_EINWILLIGUNG_VERSION, textVersion } from '@/lib/konto/einwilligung';
import { legeKinderkontoAn } from '@/lib/konto/kinderkonto';
import { loescheGemeindeKonto } from '@/lib/konto/loeschen';
import { meldeAnSorgeberechtigte } from '@/lib/konto/sicherheitsmail';
import { einwilligungsLage } from '@/lib/konto/sechzehn';
import { PASSWORT_MIN } from '@/lib/konto/passwort-staerke';
import { verlangeKontenAktion } from '@/lib/konto/zugang';
import { folgenDesWiderrufs } from '@/lib/lernapp/schreiben/folgen';
import { KIND_EINWILLIGUNGEN, type KindEinwilligung } from '@/lib/lernen/ansicht';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
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

/**
 * Eltern-Kind-Bezug dieses Kontos: null ohne Bezug, sonst mit Sorgerecht, Bestätigung (`bestaetigtAm`, N4), dem Konto des
 * Kindes (falls vorhanden) und ob es ein Kinderzugang ist (`kindIstKind`, angelegt von den Eltern). Ein eigenes Konto
 * (Einladung „Schüler ab 16“) ist keiner – dessen Passwort und Bestand gehören allein der Person (D-11, S2/S3).
 */
async function bezug(elternId: string, lernendeId: string) {
  const [b] = await db
    .select({
      sorgeberechtigt: schema.elternKind.sorgeberechtigt,
      bestaetigtAm: schema.elternKind.bestaetigtAm,
      kindBenutzerId: schema.lernende.benutzerId,
      kindIstKind: schema.kontoProfil.istKind,
      sechzehnAm: schema.lernende.sechzehnAm,
    })
    .from(schema.elternKind)
    .innerJoin(schema.lernende, eq(schema.lernende.id, schema.elternKind.lernendeId))
    .leftJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.lernende.benutzerId))
    .where(and(eq(schema.elternKind.elternId, elternId), eq(schema.elternKind.lernendeId, lernendeId)));
  if (!b) return null;
  // Konto vorhanden, aber kein Kinderzugang → eigenes Konto der/des Lernenden
  const eigenesKonto = b.kindBenutzerId !== null && b.kindIstKind !== true;
  return { ...b, eigenesKonto };
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
  // D-11: Ab 16 (nach 30 Tagen Übergang) entscheidet das Kind über Chat und Push selbst – Eltern ändern dort nichts mehr.
  // Schon ab dem 16. Geburtstag (Übergang) erteilen Eltern keine neue Einwilligung; sonst höben sie einen eigenen Widerruf
  // des Kindes einfach wieder auf (S2/S3). Widerrufen dürfen sie im Übergang noch.
  const selbstbestimmt = art === 'gruppenchat' || art === 'push_kind';
  const lage = einwilligungsLage(b.sechzehnAm, berlinerDatum(new Date()));
  if (selbstbestimmt && (lage === 'eigene' || (lage === 'uebergang' && aktion === 'erteilen'))) zurueck({ fehler: 'nurKind', art });
  // Eigenes Konto (ab 16 eingeladen): Die Einwilligung „Kinderzugang“ gilt dafür nicht – kein Erteilen, kein Widerruf, der
  // das Konto löschen würde (S2/S3)
  if (art === 'kinderkonto' && b.eigenesKonto) zurueck({ fehler: 'eigenesKonto', art });

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
  const ergebnis = await db.transaction(async (tx) => {
    const widerrufen = await tx
      .update(schema.kontoEinwilligung)
      .set({ widerrufenAm: new Date() })
      .where(
        and(
          eq(schema.kontoEinwilligung.lernendeId, lernendeId),
          eq(schema.kontoEinwilligung.art, art),
          isNull(schema.kontoEinwilligung.widerrufenAm),
          // Eine eigene Einwilligung des Kindes (ab 16) nehmen die Eltern nicht zurück
          b.kindBenutzerId
            ? or(isNull(schema.kontoEinwilligung.erteiltVon), ne(schema.kontoEinwilligung.erteiltVon, b.kindBenutzerId))
            : undefined,
        ),
      )
      .returning({ id: schema.kontoEinwilligung.id });
    if (!widerrufen.length) return null;
    if (b.kindBenutzerId && art === 'push_kind') {
      const [eigene] = await tx
        .select({ id: schema.kontoEinwilligung.id })
        .from(schema.kontoEinwilligung)
        .where(
          and(
            eq(schema.kontoEinwilligung.lernendeId, lernendeId),
            eq(schema.kontoEinwilligung.art, 'push_kind'),
            isNull(schema.kontoEinwilligung.widerrufenAm),
          ),
        );
      if (!eigene) await tx.delete(schema.pushAbo).where(eq(schema.pushAbo.benutzerId, b.kindBenutzerId));
    }
    const zugangLoeschen = b.kindBenutzerId !== null && art === 'kinderkonto' && b.kindIstKind === true;
    await protokolliere(
      {
        benutzerId: konto.benutzerId,
        aktion: 'konto.einwilligung_widerrufen',
        zielTyp: 'lernende',
        zielId: lernendeId,
        details: { art, zugangGeloescht: zugangLoeschen },
      },
      tx,
    );
    return { zugang: zugangLoeschen ? b.kindBenutzerId : null };
  });
  const geloescht = ergebnis?.zugang ?? null;
  // Folgen nach dem gespeicherten Widerruf (S-L2 N-2): bei `lernapp` die nicht mehr gedeckten Schreibabgaben des Kindes
  if (ergebnis) await folgenDesWiderrufs(art, { lernendeId }, konto.benutzerId);
  // Kinderzugang löschen wie jedes Gemeinde-Konto (S2/S3): Chat-Texte als Platzhalter ohne Text, Sitzungen, Push-Abos,
  // Links – der Lerndatensatz bleibt (set null). Nie ein Konto mit Verwaltungsrolle.
  if (geloescht) {
    const r = await loescheGemeindeKonto(geloescht, { akteurId: konto.benutzerId, anlass: 'einwilligung' });
    if (!r.ok) zurueck({ fehler: 'allgemein', art });
  }
  zurueck({ ok: 'widerrufen', art });
}

export type ZugangZustand = { fehler?: string; ok?: 'angelegt' | 'gesetzt'; benutzername?: string; zeit?: number };

const GRENZE = { max: 10, fensterSekunden: 900 };

const zugangSchema = z.object({ lernendeId: uuid, benutzername: z.string().max(64), passwort: z.string().max(128) });

/** Kinderzugang anlegen (`legeKinderkontoAn`, prüft zusätzlich Bezug und Einwilligung „kinderkonto“ dieses Elternteils). */
export async function kinderzugangAnlegen(_vorher: ZugangZustand, fd: FormData): Promise<ZugangZustand> {
  const { konto } = await elternKontext();
  const p = zugangSchema.safeParse({
    lernendeId: fd.get('lernendeId'),
    benutzername: fd.get('benutzername'),
    passwort: fd.get('passwort'),
  });
  if (!p.success) return { fehler: 'unbekannt' };
  const b = await bezug(konto.benutzerId, p.data.lernendeId);
  if (!b || !b.sorgeberechtigt) return { fehler: 'keinElternteil' };
  // N4: Ein neu eingetragener, noch unbestätigter Eltern-Kind-Bezug legt keinen Kinderzugang an
  if (!b.bestaetigtAm) return { fehler: 'unbestaetigt' };
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

/**
 * Passwort des Kinderzugangs neu setzen (Eltern mit Sorgerecht); alle Sitzungen des Kindes enden sofort. Nur für
 * Kinderzugänge (von Eltern angelegt) und nur, solange die Eltern noch entscheiden (D-11) – nie für das eigene Konto
 * einer/eines Jugendlichen (S2/S3) und nie über einen unbestätigten Eltern-Kind-Bezug (N4).
 */
export async function kinderPasswortSetzen(_vorher: ZugangZustand, fd: FormData): Promise<ZugangZustand> {
  const { konto } = await elternKontext();
  const p = passwortSchema.safeParse({ lernendeId: fd.get('lernendeId'), passwort: fd.get('passwort') });
  if (!p.success) return { fehler: 'passwort' };
  const b = await bezug(konto.benutzerId, p.data.lernendeId);
  if (!b || !b.sorgeberechtigt) return { fehler: 'keinElternteil' };
  if (!b.bestaetigtAm) return { fehler: 'unbestaetigt' };
  if (!b.kindBenutzerId) return { fehler: 'keinZugang' };
  if (b.eigenesKonto || einwilligungsLage(b.sechzehnAm, berlinerDatum(new Date())) === 'eigene') return { fehler: 'eigenesKonto' };
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
    await protokolliere({ benutzerId: konto.benutzerId, aktion: 'konto.kinderpasswort_gesetzt', zielTyp: 'benutzer', zielId: kindId }, tx);
    // S2/S3: Die übrigen sorgeberechtigten Eltern erfahren davon (ohne Passwort, ohne Namen)
    await meldeAnSorgeberechtigte(tx, p.data.lernendeId, [konto.benutzerId], 'kinderpasswort');
  });
  after(() => versendeOffeneMails().catch(() => undefined));
  return { ok: 'gesetzt', benutzername: kind.benutzername ?? undefined, zeit: Date.now() };
}
