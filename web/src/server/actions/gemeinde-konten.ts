'use server';

import { and, eq, isNull, notInArray, sql } from 'drizzle-orm';
import { refresh } from 'next/cache';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { z } from 'zod';
import { protokolliere } from '@/lib/audit';
import { db, schema } from '@/lib/db';
import { funktionAn } from '@/lib/funktionen';
import { berlinerDatum } from '@/lib/gebetszeiten/naechstes';
import { erstelleGemeindeEinladung } from '@/lib/konto/gemeinde-einladung';
import { beendeSitzungen, loescheGemeindeKonto } from '@/lib/konto/loeschen';
import { istMindestens16, loeschZustand, pruefeGemeindeRollen } from '@/lib/lernen/verwaltung';
import { versendeOffeneMails } from '@/lib/mail/ausgang';
import { darf, KeinRecht, verlangeRecht, type Angemeldet } from '@/lib/rechte/pruefe';
import { gemeindeEinladungSchema, gemeindeRollenSchema } from '@/lib/validierung/lernen';
import { ladeGemeindeKonto, type KontoDetail } from '@/server/queries/verwaltung/gemeinde-konten';

/**
 * Verwaltung „Gemeinde-Konten“ (H-L05, ADR 0026, S-18). Reihenfolge je Action: Recht (Sitzung, zweiter Faktor, Rolle) →
 * Funktionsschalter `konten` → Eingabe → Schutzregeln (nie das eigene Konto; Konten mit Verwaltungsrollen sperrt und
 * löscht nur „Benutzer und Rollen“) → Speichern mit Audit (ohne Personendaten).
 */
export type KontenZustand = {
  fehler?: string;
  feldFehler?: Record<string, string>;
  werte?: Record<string, string>;
  /** Einladungslink – nur in dieser Antwort, gespeichert ist nur der Hash */
  link?: string;
  ok?: boolean;
  /** true, wenn schon eine offene Einladung bestand (keine zweite verschickt) */
  vorhanden?: boolean;
};

async function verlange(): Promise<Angemeldet> {
  const a = await verlangeRecht('gemeindekonto.bearbeiten');
  if (!(await funktionAn('konten'))) throw new KeinRecht();
  return a;
}

const zumKonto = (id: string, query: string) => `/verwaltung/gemeinde-konten/${id}?${query}`;

/** Zielkonto laden; Verwaltungskonten und das eigene Konto sind hier tabu (Rückgabe des Fehlerschlüssels). */
async function zielKonto(fd: FormData, a: Angemeldet): Promise<KontoDetail> {
  const konto = await ladeGemeindeKonto(String(fd.get('id') ?? ''));
  if (!konto) throw new KeinRecht();
  if (konto.id === a.benutzerId) redirect(zumKonto(konto.id, 'fehler=selbst'));
  return konto;
}

/** Kontoarten (Gemeinde-Rollen) setzen. Ohne Rolle `lehrkraft` endet auch jede Gruppenleitung (S-02 zählt neu). */
export async function gemeindeRollenSpeichern(fd: FormData): Promise<void> {
  const a = await verlange();
  const p = gemeindeRollenSchema.safeParse({ id: fd.get('id'), rollen: fd.getAll('rollen').map(String) });
  if (!p.success) throw new KeinRecht();
  const konto = await zielKonto(fd, a);
  const r = pruefeGemeindeRollen(p.data.rollen, konto.istKind);
  if (!r.ok) redirect(zumKonto(konto.id, `fehler=${r.fehler}`));
  const neu = r.rollen;
  await db.transaction(async (tx) => {
    if (neu.length)
      await tx
        .delete(schema.gemeindeRolle)
        .where(and(eq(schema.gemeindeRolle.benutzerId, konto.id), notInArray(schema.gemeindeRolle.rolle, neu)));
    else await tx.delete(schema.gemeindeRolle).where(eq(schema.gemeindeRolle.benutzerId, konto.id));
    for (const rolle of neu)
      await tx.insert(schema.gemeindeRolle).values({ benutzerId: konto.id, rolle, erstelltVon: a.benutzerId }).onConflictDoNothing();
    let leitungBeendet = 0;
    if (!neu.includes('lehrkraft'))
      leitungBeendet = (
        await tx
          .delete(schema.gruppenLeitung)
          .where(eq(schema.gruppenLeitung.benutzerId, konto.id))
          .returning({ g: schema.gruppenLeitung.gruppeId })
      ).length;
    await protokolliere(
      {
        benutzerId: a.benutzerId,
        aktion: 'gemeindekonto.rollen_geaendert',
        zielTyp: 'benutzer',
        zielId: konto.id,
        details: { vorher: konto.rollen.join(','), nachher: neu.join(','), leitungBeendet },
      },
      tx,
    );
  });
  redirect(zumKonto(konto.id, 'meldung=rollen'));
}

/** Sperren (S-18): Sperrvermerk und alle Sitzungen sofort beendet; offene Passwort-Links verfallen. */
export async function gemeindeKontoSperren(fd: FormData): Promise<void> {
  const a = await verlange();
  const konto = await zielKonto(fd, a);
  if (konto.verwaltung) redirect(zumKonto(konto.id, 'fehler=verwaltungskonto'));
  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: new Date() }).where(eq(schema.user.id, konto.id));
    await beendeSitzungen(tx, [konto.id]);
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'gemeindekonto.gesperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  redirect(zumKonto(konto.id, 'meldung=gesperrt'));
}

export async function gemeindeKontoEntsperren(fd: FormData): Promise<void> {
  const a = await verlange();
  const konto = await zielKonto(fd, a);
  if (konto.verwaltung) redirect(zumKonto(konto.id, 'fehler=verwaltungskonto'));
  await db.transaction(async (tx) => {
    await tx.update(schema.user).set({ gesperrtAm: null }).where(eq(schema.user.id, konto.id));
    await protokolliere({ benutzerId: a.benutzerId, aktion: 'gemeindekonto.entsperrt', zielTyp: 'benutzer', zielId: konto.id }, tx);
  });
  redirect(zumKonto(konto.id, 'meldung=entsperrt'));
}

/** „Jetzt löschen“ – nur nach Ablauf der Frist eines Löschantrags (Art. 17), vollständig (src/lib/konto/loeschen.ts). */
export async function gemeindeKontoJetztLoeschen(fd: FormData): Promise<void> {
  const a = await verlange();
  const konto = await zielKonto(fd, a);
  if (loeschZustand(konto.loeschenAb, new Date()) !== 'faellig') redirect(zumKonto(konto.id, 'fehler=fristLaeuft'));
  const r = await loescheGemeindeKonto(konto.id, { akteurId: a.benutzerId, anlass: 'verwaltung' });
  if (!r.ok) redirect(zumKonto(konto.id, `fehler=${r.fehler}`));
  redirect('/verwaltung/gemeinde-konten?meldung=geloescht');
}

/**
 * Einladung in ein Gemeinde-Konto: Lehrkraft, Schüler ab 16 (nur mit Bezug auf eine/n Lernende/n ab 16 ohne Konto)
 * oder Eltern (optional mit Bezug auf Lernende → Eltern-Kind-Bezug bei der Annahme). Mail in der gewählten Sprache.
 */
export async function gemeindeEinladen(_vorher: KontenZustand, fd: FormData): Promise<KontenZustand> {
  let a: Angemeldet;
  try {
    a = await verlange();
  } catch {
    return { fehler: 'keinRecht' };
  }
  const werte = {
    name: String(fd.get('name') ?? ''),
    email: String(fd.get('email') ?? ''),
    art: String(fd.get('art') ?? ''),
    lernendeId: String(fd.get('lernendeId') ?? ''),
    sprache: String(fd.get('sprache') ?? 'de'),
    gueltigTage: String(fd.get('gueltigTage') ?? '14'),
  };
  const p = gemeindeEinladungSchema.safeParse(werte);
  const sprache = z.enum(['de', 'tr', 'en']).safeParse(werte.sprache);
  if (!p.success || !sprache.success) {
    const feldFehler: Record<string, string> = {};
    for (const i of p.success ? [] : p.error.issues) feldFehler[String(i.path[0] ?? 'formular')] ??= i.message;
    if (!sprache.success) feldFehler.sprache = 'ungueltig';
    return { fehler: 'pruefen', feldFehler, werte };
  }
  const e = p.data;
  if (e.lernendeId) {
    if (!darf(a.rollen, 'lernende.lesen')) return { fehler: 'keinRecht', werte };
    const [l] = await db
      .select({ sechzehnAm: schema.lernende.sechzehnAm, benutzerId: schema.lernende.benutzerId })
      .from(schema.lernende)
      .where(eq(schema.lernende.id, e.lernendeId));
    if (!l) return { fehler: 'pruefen', feldFehler: { lernendeId: 'ungueltig' }, werte };
    if (e.art === 'schueler') {
      if (!istMindestens16(l.sechzehnAm, berlinerDatum(new Date())))
        return { fehler: 'pruefen', feldFehler: { lernendeId: 'unter16' }, werte };
      if (l.benutzerId) return { fehler: 'pruefen', feldFehler: { lernendeId: 'hatKonto' }, werte };
    }
  }
  // Kinderkonten haben keine E-Mail; die synthetischen Adressen sind keine Einladungsziele
  const [kind] = await db
    .select({ id: schema.user.id })
    .from(schema.user)
    .innerJoin(schema.kontoProfil, eq(schema.kontoProfil.benutzerId, schema.user.id))
    .where(and(sql`lower(${schema.user.email}) = ${e.email}`, eq(schema.kontoProfil.istKind, true)))
    .limit(1);
  if (kind) return { fehler: 'pruefen', feldFehler: { email: 'email' }, werte };
  const r = await db.transaction((tx) =>
    erstelleGemeindeEinladung(tx, {
      name: e.name,
      email: e.email,
      art: e.art,
      lernendeId: e.lernendeId || null,
      gueltigTage: e.gueltigTage,
      sprache: sprache.data,
      erstelltVon: a.benutzerId,
    }),
  );
  if (!r.neu) return { ok: true, vorhanden: true };
  after(() => versendeOffeneMails());
  refresh();
  return { ok: true, link: r.link };
}

/** Offene Gemeinde-Einladung widerrufen (nur reine Gemeinde-Einladungen; Verwaltungseinladungen in „Benutzer“). */
export async function gemeindeEinladungWiderrufen(fd: FormData): Promise<void> {
  const a = await verlange();
  const id = z.uuid().safeParse(fd.get('id'));
  if (!id.success) throw new KeinRecht();
  const [e] = await db
    .update(schema.einladung)
    .set({ widerrufenAm: new Date() })
    .where(
      and(
        eq(schema.einladung.id, id.data),
        isNull(schema.einladung.angenommenAm),
        isNull(schema.einladung.widerrufenAm),
        sql`jsonb_array_length(${schema.einladung.rollen}) = 0`,
      ),
    )
    .returning({ id: schema.einladung.id, lernendeId: schema.einladung.lernendeId });
  if (e) await protokolliere({ benutzerId: a.benutzerId, aktion: 'einladung.widerrufen', zielTyp: 'einladung', zielId: e.id });
  const zurueck = z.uuid().safeParse(fd.get('lernende'));
  redirect(
    zurueck.success && darf(a.rollen, 'lernende.lesen')
      ? `/verwaltung/lernende/${zurueck.data}?meldung=widerrufen#eltern`
      : '/verwaltung/gemeinde-konten?meldung=widerrufen#einladungen',
  );
}
